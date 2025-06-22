import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Spinner, Tab, Tabs, Image, Badge, Placeholder,
    Nav
} from 'react-bootstrap';
import {
    FaUserPlus, FaCheck, FaTimes, FaUserFriends, FaEnvelope, FaUser
} from 'react-icons/fa';
import {
    collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc,
    onSnapshot, increment
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import Avatar from 'react-avatar';

const FriendsPage = () => {
    const { currentUser } = useAuth();
    const [friendRequests, setFriendRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');

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

    useEffect(() => {
        if (!currentUser || loadingRequests) return;

        const fetchSuggestions = async () => {
            try {
                const friendsQuery = query(
                    collection(db, 'friendRequests'),
                    where('senderId', '==', currentUser.uid)
                );
                const friendsSnapshot = await getDocs(friendsQuery);
                const friendIds = friendsSnapshot.docs.map(doc => doc.data().receiverId);

                const usersQuery = query(
                    collection(db, 'users'),
                    where('uid', '!=', currentUser.uid)
                );
                const usersSnapshot = await getDocs(usersQuery);

                const users = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => !friendIds.includes(user.id));

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
            setSuggestions(suggestions.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    return (
        <Container className="">
            <h2 className="mb-4">Gestion des amis</h2>

            {/* Nouvelle version des tabs plus professionnelle */}
            <div className="mb-4">
                <Nav variant="tabs" className=" custom-tabs flex-nowrap overflow-auto pb-1" activeKey={activeTab}>
                    <Nav.Item className="flex-shrink-0">
                        <Nav.Link
                            eventKey="requests"
                            onClick={() => setActiveTab('requests')}
                            className="d-flex align-items-center"
                        >
                            <FaUserFriends className="mr-2" />
                            Demandes
                            {friendRequests.length > 0 && (
                                <Badge bg="danger" pill className="ml-2 text-white">
                                    {friendRequests.length}
                                </Badge>
                            )}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="flex-shrink-0">
                        <Nav.Link
                            eventKey="suggestions"
                            onClick={() => setActiveTab('suggestions')}
                            className="d-flex align-items-center"
                        >
                            <FaUserPlus className="mr-2" />
                            Suggestions
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <div className="border border-top-0 rounded-bottom p-3">
                    {activeTab === 'requests' ? (
                        <Row className="g-4 py-3">
                            {loadingRequests ? (
                                <Col className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Chargement des demandes...</p>
                                </Col>
                            ) : friendRequests.length > 0 ? (
                                friendRequests.map(request => (
                                    <Col key={request.id} xs={12} sm={6} md={4} lg={3} className='mb-4'>
                                        <FriendCard
                                            user={request.user}
                                            isRequest
                                            onAccept={() => handleFriendAction(request.id, 'accepted')}
                                            onReject={() => handleFriendAction(request.id, 'rejected')}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center py-5">
                                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                        <FaUserFriends size={48} className="text-muted" />
                                    </div>
                                    <h5 className="mt-3">Aucune demande d'amitié</h5>
                                    <p className="text-muted">Vous n'avez aucune demande en attente</p>
                                </Col>
                            )}
                        </Row>
                    ) : (
                        <Row className="g-4 py-3">
                            {loadingSuggestions ? (
                                <Col className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-2">Chargement des suggestions...</p>
                                </Col>
                            ) : suggestions.length > 0 ? (
                                suggestions.map(user => (
                                    <Col key={user.id} xs={12} sm={6} md={4} lg={3} className='mb-4'>
                                        <FriendCard
                                            user={user}
                                            onAddFriend={() => sendFriendRequest(user.id)}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center py-5">
                                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                        <FaUserPlus size={48} className="text-muted" />
                                    </div>
                                    <h5 className="mt-3">Aucune suggestion</h5>
                                    <p className="text-muted">Nous n'avons pas trouvé de suggestions pour vous</p>
                                </Col>
                            )}
                        </Row>
                    )}
                </div>
            </div>
            <style jsx>{`
            .custom-tabs .nav-link {
  position: relative;
  color: #444;
  font-weight: 500;
  background: none;
  border: none;
  transition: color 0.4s;
}

.custom-tabs .nav-link.active,
.custom-tabs .nav-link:focus {
  color: #007bff;
  background: none;
}

.custom-tabs .nav-link.active::after {
  content: "";
  display: block;
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  height: 3px;
  background: #007bff;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s;
}

.custom-tabs .nav-link:not(.active)::after {
  content: "";
  display: block;
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  height: 3px;
  background: transparent;
  transition: all 0.3s;
}
  `}</style>
        </Container>
    );
};

const FriendCard = ({ user, isRequest, onAccept, onReject, onAddFriend }) => {
    return (
        <Card className="h-100 shadow-sm ">
            <Card.Body className="d-flex flex-column">
                <div className="d-flex flex-column align-items-center mb-3">
                    <div className="position-relative mb-3">
                        {user?.photoURL ? (
                            <Image
                                src={user.photoURL}
                                alt={user.displayName}
                                roundedCircle
                                className="border border-3 border-primary"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light rounded-circle border border-3 border-primary"
                                style={{ width: '100px', height: '100px' }}>
                                <Avatar
                                    name={user?.username || user?.displayName || 'Utilisateur'}
                                    size="100"
                                    round
                                    className="border border-3 border-primary"
                                />
                            </div>
                        )}
                    </div>

                    <h5 className="mb-1 text-center text-truncate w-100">
                        {user?.username || user?.displayName || 'Utilisateur'}
                    </h5>

                    {user?.bio && (
                        <p className="text-muted text-center mb-3 small">
                            {user.bio.length > 60 ? `${user.bio.substring(0, 60)}...` : user.bio}
                        </p>
                    )}
                </div>

                <div className="mt-auto d-grid gap-2">
                    {isRequest ? (
                        <div className="d-flex flex-column  gap-2 w-100">
                            <Button
                                variant="success"
                                onClick={onAccept}
                                className="flex-fill d-flex align-items-center justify-content-center"
                            >
                                <FaCheck className="mr-2" /> Accepter
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={onReject}
                                className="flex-fill d-flex align-items-center justify-content-center mt-2"
                            >
                                <FaTimes className="mr-2" /> Refuser
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={onAddFriend}
                            className="d-flex align-items-center justify-content-center w-100"
                        >
                            <FaUserPlus className="mr-2" /> Ajouter
                        </Button>
                    )}


                </div>
            </Card.Body>
        </Card>
    );
};

export default FriendsPage;