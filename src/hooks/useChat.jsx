import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    serverTimestamp, 
    orderBy,
    doc,
    getDocs,
    updateDoc
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export const useChat = () => {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const { currentUser } = useAuth();
  

    // Charger les conversations (amis)
    useEffect(() => {
        if (!currentUser?.uid) return;

        setLoading(true);
        const friendsRef = collection(db, "users", currentUser.uid, "friends");

        const unsubscribe = onSnapshot(friendsRef, 
            async (snapshot) => {
                try {
                    const friendIds = snapshot.docs.map(doc => doc.id);
                    
                    if (friendIds.length === 0) {
                        setConversations([]);
                        setLoading(false);
                        return;
                    }

                    // Récupérer les données des amis
                    const usersQuery = query(
                        collection(db, "users"),
                        where("uid", "in", friendIds)
                    );

                    const usersSnapshot = await getDocs(usersQuery);
                    const convs = usersSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setConversations(convs);
                    setError(null);
                } catch (err) {
                    setError("Erreur lors du chargement des conversations");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setError("Erreur de connexion");
                console.error(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser?.uid]);

    // Charger les messages d'une conversation
    useEffect(() => {
        if (!selectedConversation || !currentUser?.uid) return;
        setLoading(true);
         const conversationId = [currentUser.uid, selectedConversation.id].sort().join('_');
const conversationRef = doc(db, "conversations", conversationId);
        
      // Récupère toutes les conversations où l'utilisateur est participant
const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUser.uid)
);

onSnapshot(q, (snapshot) => {
    const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    setConversations(convs);
    setLoading(false);
});

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                try {
                    const msgs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        isCurrentUser: doc.data().userId === currentUser.uid
                    }));
                    setMessages(msgs);
                    setError(null);
                } catch (err) {
                    setError("Erreur lors du chargement des messages");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setError("Erreur de connexion au chat");
                console.error(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [selectedConversation, currentUser?.uid]);
    
    const sendMessage = useCallback(async (text) => {
          const conversationId = [currentUser.uid, selectedConversation.id].sort().join('_');
const conversationRef = doc(db, "conversations", conversationId);
        if (!selectedConversation || !text.trim() || !currentUser) return;

        try {
            const conversationId = [currentUser.uid, selectedConversation.id].sort().join('_');
            const messagesRef = collection(db, "conversations", conversationId, "messages");
            
            await addDoc(messagesRef, {
                text: text.trim(),
                userId: currentUser.uid,
                userName: currentUser.displayName || "Anonyme",
                userAvatar: currentUser.photoURL || null,
                timestamp: serverTimestamp()
            });

            // Mettre à jour le lastMessage dans les deux profils utilisateurs
            const userRef = doc(db, "users", currentUser.uid);
            const friendRef = doc(db, "users", selectedConversation.id);
            
            const lastMessageData = {
                text: text.trim(),
                timestamp: serverTimestamp(),
                with: selectedConversation.id,
                conversationId
            };

           await updateDoc(conversationRef, {
    lastMessage: {
        text: text.trim(),
        timestamp: serverTimestamp(),
        from: currentUser.uid,
        to: selectedConversation.id
    }
});
            
            await updateDoc(friendRef, {
                lastMessage: {
                    ...lastMessageData,
                    with: currentUser.uid
                }
            });

        } catch (err) {
            console.error("Erreur lors de l'envoi du message:", err);
            throw err;
        }
    }, [selectedConversation, currentUser]);

    return {
        conversations,
        messages,
        sendMessage,
        selectConversation: setSelectedConversation,
        selectedConversation,
        loading,
        error
    };
};