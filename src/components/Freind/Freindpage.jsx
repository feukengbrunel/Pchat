import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Tab, Tabs, Image, Badge } from 'react-bootstrap';
import { FaUserPlus, FaCheck, FaTimes, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, onSnapshot, increment, FieldPath } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';

const FriendsPage = () => {
    const { currentUser } = useAuth();
    const [friendRequests, setFriendRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');

    // Récupérer les demandes d'amis
    useEffect(() => {
        if (!currentUser) return;

        const unsubscribeRequests = onSnapshot(
            query(
                collection(db, 'friendRequests'),
                where('receiverId', '==', currentUser.uid),
                where('status', '==', 'pending')
            ),
            async (snapshot) => {
                const requests = await Promise.all(
                    snapshot.docs.map(async docSnap => {
                        const senderId = docSnap.data().senderId;
                        const userSnap = await getDoc(doc(db, 'users', senderId));
                        return {
                            id: docSnap.id,
                            ...docSnap.data(),
                            user: userSnap.exists() ? userSnap.data() : null
                        };
                    })
                );
                setFriendRequests(requests.filter(req => req.user));
                setLoadingRequests(false);
            }
        );

        return () => unsubscribeRequests();
    }, [currentUser]);

    // Récupérer les suggestions
    useEffect(() => {
        if (!currentUser || loadingRequests) return;

        const fetchSuggestions = async () => {
            try {
                // 1. Récupérer la liste des amis et demandes pour exclusion
                const friendsQuery = query(
                    collection(db, 'friendRequests'),
                    where('senderId', '==', currentUser.uid)
                );
                const friendsSnapshot = await getDocs(friendsQuery);
                const friendIds = friendsSnapshot.docs.map(doc => doc.data().receiverId);

                // 2. Récupérer tous les utilisateurs sauf moi et mes amis
                const usersQuery = query(
                    collection(db, 'users'),
                    where('uid', '!=', currentUser.uid)
                );
                const usersSnapshot = await getDocs(usersQuery);
                
                const users = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => !friendIds.includes(user.id));
                 console.error("Error fetching suggestions:", users);
                setSuggestions(users);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, [currentUser, loadingRequests]);

    const handleFriendAction = async (requestId, action) => {
        try {
            const requestRef = doc(db, 'friendRequests', requestId);
            await updateDoc(requestRef, { status: action });

            if (action === 'accepted') {
                const request = friendRequests.find(req => req.id === requestId);
                // Mettre à jour les compteurs d'amis
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    friendsCount: increment(1)
                });
                await updateDoc(doc(db, 'users', request.senderId), {
                    friendsCount: increment(1)
                });
            }
        } catch (error) {
            console.error("Error handling friend request:", error);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await setDoc(doc(db, 'friendRequests', `${currentUser.uid}_${userId}`), {
                senderId: currentUser.uid,
                receiverId: userId,
                status: 'pending',
                createdAt: new Date()
            });
            // Mettre à jour les suggestions après envoi
            setSuggestions(suggestions.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Gestion des amis</h2>
            
            <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="mb-4"
                variant="pills"
            >
                <Tab 
                    eventKey="requests" 
                    title={
                        <div className="d-flex align-items-center">
                            <FaUserFriends className="me-2" />
                            Demandes 
                            {friendRequests.length > 0 && (
                                <Badge bg="danger" className="ms-2">{friendRequests.length}</Badge>
                            )}
                        </div>
                    }
                >
                    {loadingRequests ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des demandes...</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4 py-3">
                            {friendRequests.length > 0 ? (
                                friendRequests.map(request => (
                                    <Col key={request.id}>
                                        <FriendCard
                                            user={request.user}
                                            isRequest
                                            onAccept={() => handleFriendAction(request.id, 'accepted')}
                                            onReject={() => handleFriendAction(request.id, 'rejected')}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <Image src="/no-requests.svg" alt="No requests" fluid style={{ maxWidth: '300px' }} />
                                    <h5 className="mt-3">Aucune demande d'amitié</h5>
                                    <p className="text-muted">Vous n'avez aucune demande en attente</p>
                                </div>
                            )}
                        </Row>
                    )}
                </Tab>
                
                <Tab 
                    eventKey="suggestions" 
                    title={
                        <div className="d-flex align-items-center">
                            <FaUserPlus className="me-2" />
                            Suggestions
                        </div>
                    }
                >
                    {loadingSuggestions ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Chargement des suggestions...</p>
                        </div>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4 py-3">
                            {suggestions.length > 0 ? (
                                suggestions.map(user => (
                                    <Col key={user.id}>
                                        <FriendCard
                                            user={user}
                                            onAddFriend={() => sendFriendRequest(user.id)}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <div className="text-center py-5">
                                    <Image src="/no-suggestions.svg" alt="No suggestions" fluid style={{ maxWidth: '300px' }} />
                                    <h5 className="mt-3">Aucune suggestion</h5>
                                    <p className="text-muted">Nous n'avons pas trouvé de suggestions pour vous</p>
                                </div>
                            )}
                        </Row>
                    )}
                </Tab>
            </Tabs>
        </Container>
    );
};

const FriendCard = ({ user, isRequest, onAccept, onReject, onAddFriend }) => {
    return (
        <Card className="h-100 shadow-sm border-0">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div className="position-relative mb-3">
                    <Image
                        src={user.photoURL || '/default-avatar.png'}
                        alt={user.displayName}
                        roundedCircle
                        className="img-thumbnail border-primary"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                </div>
                
                <h5 className="mb-1">{user?.username||user?.displayName}</h5>
                {user.bio && (
                    <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                        {user.bio.length > 80 ? `${user.bio.substring(0, 80)}...` : user.bio}
                    </p>
                )}
                
                <div className="mt-auto w-100">
                    {isRequest ? (
                        <div className="d-grid gap-2">
                            <Button variant="success" onClick={onAccept}>
                                <FaCheck className="me-2" /> Accepter
                            </Button>
                            <Button variant="outline-danger" onClick={onReject}>
                                <FaTimes className="me-2" /> Refuser
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            variant="primary" 
                            className="w-100 mb-2"
                            onClick={onAddFriend}
                        >
                            <FaUserPlus className="me-2" /> Ajouter
                        </Button>
                    )}
                    
                    <Button 
                        variant="outline-secondary" 
                        className="w-100"
                        href={`/profile/${user.id}`}
                    >
                        <FaEnvelope className="me-2" /> Voir profil
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default FriendsPage;