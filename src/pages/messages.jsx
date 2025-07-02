import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    limit
} from 'firebase/firestore';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db, database } from '../firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Avatar from 'react-avatar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Messagerie = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [showConversationList, setShowConversationList] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    const normalizeId = (id) => {
        return id.replace(/[.#$/[\]]/g, '_')
            .replace(/^\.|\.$/g, '_')
            .substring(0, 768);
    };

    // Récupérer la liste des amis
    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const unsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/friends`),
            async (snapshot) => {
                const friendsList = [];
                for (const docSnapshot of snapshot.docs) {
                    const friendData = docSnapshot.data();
                    const userDoc = await getDoc(doc(db, 'users', docSnapshot.id));
                    if (userDoc.exists()) {
                        friendsList.push({
                            id: docSnapshot.id,
                            ...userDoc.data(),
                            addedAt: friendData.addedAt?.toDate()
                        });
                    }
                }

                // Trier les amis par dernier message
                friendsList.sort((a, b) => {
                    if (a.lastMessageTime && b.lastMessageTime) {
                        return b.lastMessageTime - a.lastMessageTime;
                    }
                    if (a.lastMessageTime) return -1;
                    if (b.lastMessageTime) return 1;
                    return 0;
                });

                setFriends(friendsList);
                setLoading(false);
            },
            (error) => {
                console.error("Erreur de chargement des amis:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);
    // ...existing code...

    // Met à jour lastMessage et lastMessageTime pour chaque ami
    // Met à jour lastMessage et lastMessageTime pour chaque ami
    useEffect(() => {
        if (!user || friends.length === 0) return;

        let isMounted = true;

        const fetchLastMessages = async () => {
            const updatedFriends = await Promise.all(friends.map(async (friend) => {
                const conversationId = normalizeId([user.uid, friend.id].sort().join('_'));
                const messagesRef = ref(database, `conversations/${conversationId}/messages`);

                return new Promise((resolve) => {
                    onValue(messagesRef, (snapshot) => {
                        const messagesData = snapshot.val();
                        if (messagesData) {
                            const messagesArray = Object.values(messagesData);
                            // Trier du plus récent au plus ancien
                            messagesArray.sort((a, b) => b.timestamp - a.timestamp);
                            const lastMsg = messagesArray[0];
                            resolve({
                                ...friend,
                                lastMessage: lastMsg?.content || '',
                                lastMessageTime: lastMsg?.timestamp ? new Date(lastMsg.timestamp) : null,
                            });
                        } else {
                            resolve({
                                ...friend,
                                lastMessage: '',
                                lastMessageTime: null,
                            });
                        }
                    }, { onlyOnce: true });
                });
            }));

            if (isMounted) setFriends(updatedFriends);
        };

        fetchLastMessages();

        return () => { isMounted = false; };
    }, [user, friends.map(f => f.id).join(',')]);
    // ...existing code...
    // Récupérer les derniers messages et compteurs non lus

    // Récupérer les derniers messages et compteurs non lus
    useEffect(() => {
        if (!user || friends.length === 0) return;

        const unsubscribes = [];
        const counts = {};

        friends.forEach(friend => {
            const conversationId = normalizeId([user.uid, friend.id].sort().join('_'));
            const messagesRef = ref(database, `conversations/${conversationId}/messages`);
            const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
                const messagesData = snapshot.val();
                if (messagesData) {
                    const messagesArray = Object.values(messagesData);
                    // Calculer les messages non lus
                    const unreadMessages = messagesArray.filter(msg =>
                        msg.senderId === friend.id && !msg.read
                    );
                    counts[friend.id] = unreadMessages.length;
                    setUnreadCounts(current => ({ ...current, [friend.id]: unreadMessages.length }));
                }
            });
            unsubscribes.push(messagesUnsubscribe);
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [user, friends]);

    // Charger les messages de la conversation sélectionnée
    useEffect(() => {
        if (!user || !selectedFriend) return;

        setMessagesLoading(true);
        const conversationId = normalizeId([user.uid, selectedFriend.id].sort().join('_'));
        const messagesRef = ref(database, `conversations/${conversationId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const messagesData = snapshot.val();
            if (messagesData) {
                const messagesArray = Object.entries(messagesData).map(([id, msg]) => ({
                    id,
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));

                messagesArray.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(messagesArray);
            } else {
                setMessages([]);
            }
            setMessagesLoading(false);
        }, (error) => {
            console.error("Erreur de lecture des messages:", error);
            setMessagesLoading(false);
        });

        return () => unsubscribe();
    }, [user, selectedFriend]);

    // Marquer les messages comme lus
    useEffect(() => {
        if (!user || !selectedFriend || messages.length === 0) return;

        const conversationId = normalizeId([user.uid, selectedFriend.id].sort().join('_'));

        messages.forEach(msg => {
            if (msg.senderId !== user.uid && !msg.read) {
                const messageRef = ref(database, `conversations/${conversationId}/messages/${msg.id}`);
                update(messageRef, { read: true }).catch(error => {
                    console.error("Erreur de marquage comme lu:", error);
                });
            }
        });

        // Mettre à jour le compteur non lu pour l'ami sélectionné
        setUnreadCounts(prev => ({ ...prev, [selectedFriend.id]: 0 }));
    }, [user, selectedFriend, messages]);

    // Faire défiler vers le bas lorsque de nouveaux messages arrivent
    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSelectFriend = (friend) => {
        setSelectedFriend(friend);
        if (isMobile) setShowConversationList(false);
    };

    const handleBackToList = () => {
        setShowConversationList(true);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedFriend || !user) return;

        try {
            const conversationId = normalizeId([user.uid, selectedFriend.id].sort().join('_'));
            const messagesRef = ref(database, `conversations/${conversationId}/messages`);

            const newMessageRef = push(messagesRef);
            await set(newMessageRef, {
                senderId: user.uid,
                content: newMessage.trim(),
                timestamp: Date.now(),
                read: false
            });

            setNewMessage('');
        } catch (error) {
            console.error("Erreur d'envoi:", error);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Gestion du responsive
    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 992;
            setIsMobile(newIsMobile);

            // Si on passe de mobile à desktop, s'assurer que les deux panneaux sont visibles
            if (!newIsMobile) {
                setShowConversationList(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Skeleton pour la liste des conversations
    const renderConversationSkeleton = () => (
        Array(5).fill(0).map((_, index) => (
            <div key={index} className="chat-list-item p-3 border-bottom">
                <div className="d-flex align-items-center">
                    <Skeleton circle width={48} height={48} />
                    <div className="ms-3" style={{ width: '100%' }}>
                        <Skeleton width={120} height={16} />
                        <Skeleton width={180} height={14} className="mt-2" />
                    </div>
                </div>
            </div>
        ))
    );

    // Skeleton pour les messages
    const renderMessageSkeleton = () => (
        <div className="conversation-body p-3">
            {Array(6).fill(0).map((_, index) => (
                <div key={index} className={`d-flex ${index % 2 === 0 ? 'justify-content-start' : 'justify-content-end'} mb-3`}>
                    {index % 2 === 0 && (
                        <div className="me-2">
                            <Skeleton circle width={36} height={36} />
                        </div>
                    )}
                    <div>
                        <Skeleton width={150 + (index * 20)} height={50} style={{ borderRadius: '18px' }} />
                        <div className={`mt-1 ${index % 2 === 0 ? 'text-start' : 'text-end'}`}>
                            <Skeleton width={50} height={12} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="chat chat-app container-fluid p-0">
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="row g-0 h-100" style={{ minHeight: '80vh' }}>
                        {/* Liste des conversations */}
                        <div className={`chat-list col-lg-4 border-end ${isMobile && !showConversationList ? 'd-none' : ''}`}>
                            <div className="d-flex flex-column h-100">
                                <div className="p-3 w-auto">
                                    <div className="chat-user-tool">

                                        <i className="anticon anticon-search search-icon p-r-10 font-size-20"></i>

                                        <input
                                            type="text"
                                            className=""
                                            placeholder="Rechercher une conversation..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className=" chat-user-list overflow-auto flex-grow-1" style={{ maxHeight: 'calc(80vh - 70px)' }}>
                                    {loading ? (
                                        renderConversationSkeleton()
                                    ) : filteredFriends.length > 0 ? (
                                        filteredFriends.map(friend => (
                                            <div
                                                key={friend.id}
                                                className={`chat-list-item p-3 border-bottom cursor-pointer transition-all ${selectedFriend?.id === friend.id ? 'bg-light' : 'hover-bg-light'}`}
                                                onClick={() => handleSelectFriend(friend)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="position-relative">
                                                        {friend.photoURL ? (
                                                            <img
                                                                src={friend.photoURL}
                                                                alt={friend.displayName}
                                                                className="avatar avatar-image rounded-circle"
                                                                width="48"
                                                                height="48"
                                                            />
                                                        ) : (
                                                            <Avatar
                                                                name={friend.displayName || friend.email}
                                                                size={48}
                                                                round
                                                                className="border"
                                                            />
                                                        )}

                                                    </div>
                                                    <div className="ms-3 flex-grow-1 p-l-15">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h5 className="m-b-0 text-truncate" style={{ maxWidth: '150px' }}>
                                                                {friend.displayName || friend.email}
                                                            </h5>
                                                            <div className="d-flex flex-column align-items-end">
                                                                   {friend.lastMessageTime && (
                                                                <small className="text-muted">
                                                                    {format(friend.lastMessageTime, 'HH:mm', { locale: fr })}
                                                                </small>
                                                            )}
                                                            {unreadCounts[friend.id] > 0 && (
                                                                <span className="rounded-circle text-white bg-danger "style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                   
                                                                }}>
                                                                    {unreadCounts[friend.id]}

                                                                </span>
                                                            )}
                                                            </div>
                                                         
                                                        </div>
                                                        <p className=" msg-overflow mb-0 text-muted small text-truncate font-size-13" style={{ maxWidth: '220px' }}>
                                                            {friend.lastMessage || 'Aucun message'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-4">
                                            <i className="fas fa-user-friends fs-1 text-muted"></i>
                                            <p className="mt-3">Aucun contact trouvé</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Zone de conversation */}
                        <div className={`conversation col-lg-8 ${isMobile && showConversationList ? 'd-none' : ''}`}>
                            {selectedFriend ? (
                                <div className="d-flex flex-column h-100">
                                    {/* En-tête de conversation */}
                                    <div className="p-3 border-bottom d-flex align-items-center">
                                        {isMobile && (
                                            <button
                                                className="btn btn-sm btn-icon btn-outline-secondary me-2"
                                                onClick={handleBackToList}
                                            >
                                                <i className="fas fa-arrow-left"></i>
                                            </button>
                                        )}
                                        <div className="d-flex align-items-center">
                                            {selectedFriend.photoURL ? (
                                                <img
                                                    src={selectedFriend.photoURL}
                                                    alt={selectedFriend.displayName}
                                                    className="rounded-circle m-e-2"
                                                    width="40"
                                                    height="40"
                                                />
                                            ) : (
                                                <Avatar
                                                    name={selectedFriend.displayName || selectedFriend.email}
                                                    size={40}
                                                    round
                                                    className="border m-e-2"
                                                />
                                            )}
                                            <div className='d-flex flex-column p-l-15'>
                                                <h6 className="m-b-0">{selectedFriend.displayName || selectedFriend.email}</h6>
                                                <div className="d-flex align-items-center font-size-13 text-muted m-b-0">
                                                    <span className="badge badge-success badge-dot rounded-circle p-1 m-r-5" style={{ width: '8px', height: '8px' }}></span>
                                                    <small className="text-muted">En ligne</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corps de la conversation */}
                                    {messagesLoading ? (
                                        renderMessageSkeleton()
                                    ) : (
                                        <div className=" conversation-wrapper overflow-auto flex-grow-1 p-3" style={{ maxHeight: 'calc(80vh - 140px)' }}>
                                            {messages.length === 0 ? (
                                                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                                    <i className="anticon anticon-comments fs-1 text-muted"></i>
                                                    <h5 className="m-t-3">Aucun message échangé</h5>
                                                    <p className="text-muted">Envoyez votre premier message</p>
                                                </div>
                                            ) : (
                                                <div className="conversation-body">
                                                    {messages.map((message, index) => (
                                                        <React.Fragment key={message.id}>
                                                            {index === 0 || new Date(message.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate() && (
                                                                <div className="text-center m-y-3">
                                                                    <span className="badge badge-light text-dark p-x-3 p-y-2">
                                                                        {format(message.timestamp, 'dd MMMM yyyy', { locale: fr })}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {message.senderId === user.uid ? (
                                                                // Message envoyé
                                                                <div className="d-flex justify-content-end mb-3 msg msg-sent">
                                                                  
                                                                        <div className="bubble  text-white" style={{ borderRadius: '10px', padding: '10px 15px', maxWidth: '70vw' }}>
                                                                            <div className="bubble-wrapper">
                                                                                {message.content}
                                                                            </div>
                                                                             <div className="d-flex align-items-center justify-content-end mt-1" style={{ fontSize: '0.8em' }}>
                                                                                <small className="text-muted m-r-1" style={{ marginRight: '5px' }}>
                                                                                    {format(message.timestamp, 'HH:mm', { locale: fr })}
                                                                                </small>
                                                                                <i className={`fas fa-check  ${message.read ? 'text-success' : 'text-dark'}`}></i>
                                                                                
                                                                            </div>
                                                                        </div>
                                                                    
                                                                </div>
                                                            ) : (
                                                                // Message reçu
                                                                <div className="d-flex msg msg-recipient justify-content-start mb-3">
                                                                    {selectedFriend.photoURL ? (
                                                                        <img
                                                                            src={selectedFriend.photoURL}
                                                                            alt={selectedFriend.displayName}
                                                                            className="avatar avatar-image rounded-circle m-r-10"
                                                                            width="36"
                                                                            height="36"
                                                                        />
                                                                    ) : (
                                                                        <Avatar
                                                                            name={selectedFriend.displayName || selectedFriend.email}
                                                                            size={36}
                                                                            round
                                                                            className="border m-r-10"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <div className="bubble " style={{ borderRadius: '10px', padding: '10px 15px', maxWidth: '70vw' }}>
                                                                            <div className="bubble-wrapper">
                                                                                {message.content}
                                                                            </div>
                                                                            <div className="d-flex align-items-center mt-1" style={{ fontSize: '0.8em' }}>
                                                                                <small className="text-muted">
                                                                                    {format(message.timestamp, 'HH:mm', { locale: fr })}
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Zone de saisie */}
                                    <div className="p-3 border-top">
                                        <div className="d-flex">
                                            <input
                                                type="text"
                                                className="form-control me-2"
                                                placeholder="Écrivez un message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                            >
                                                <i className="fas fa-paper-plane"></i>
                                                <span className="d-none d-md-inline ms-2">Envoyer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                    <i className="fas fa-comments fs-1 text-muted"></i>
                                    <h4 className="mt-3">Sélectionnez une conversation</h4>
                                    <p className="text-muted">pour commencer une nouvelle discussion</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
           
        </div>
    );
};

export default Messagerie;