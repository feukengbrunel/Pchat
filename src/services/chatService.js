import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  orderBy, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

export const getFriends = async (userId) => {
  const friendsRef = collection(db, `users/${userId}/friends`);
  const q = query(friendsRef);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMessages = (userId, friendId, callback) => {
  // Conversation ID is a combination of both user IDs sorted alphabetically
  const conversationId = [userId, friendId].sort().join('_');
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    callback(messages);
  });
};

export const sendMessage = async (userId, friendId, message) => {
  const conversationId = [userId, friendId].sort().join('_');
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  
  await addDoc(messagesRef, {
    senderId: userId,
    content: message,
    timestamp: serverTimestamp()
  });
};