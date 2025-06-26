import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import Avatar from 'react-avatar';
import { Spinner } from 'react-bootstrap';
import { ClipLoader } from 'react-spinners';

const FriendRequestsSidebar = () => {
    const { currentUser } = useAuth();
    const [lastRequest, setLastRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = onSnapshot(
            query(
                collection(db, 'friendRequests'),
                where('receiverId', '==', currentUser.uid),
                where('status', '==', 'pending')
            ),
            async (snapshot) => {
                if (!snapshot.empty) {
                    // Trier par date et prendre la plus récente
                    const sortedRequests = snapshot.docs.sort((a, b) => 
                        b.data().createdAt?.toMillis() - a.data().createdAt?.toMillis()
                    );
                    
                    const mostRecent = sortedRequests[0];
                    const senderId = mostRecent.data().senderId;
                    
                    // Récupérer les infos de l'utilisateur
                    const userDoc = await getDoc(doc(db, 'users', senderId));
                    if (userDoc.exists()) {
                        setLastRequest({
                            id: mostRecent.id,
                            avatar: userDoc.data().photoURL,
                            name: userDoc.data().displayName || userDoc.data().username,
                            mutualFriends: 1, // À remplacer par votre logique d'amis communs
                            userId: senderId
                        });
                    }
                } else {
                    setLastRequest(null);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleAccept = async () => {
        try {
            await updateDoc(doc(db, 'friendRequests', lastRequest.id), {
                status: 'accepted',
                respondedAt: new Date()
            });
            // Mettre à jour les compteurs d'amis
            await updateDoc(doc(db, 'users', currentUser.uid), {
                friendsCount: increment(1)
            });
            await updateDoc(doc(db, 'users', lastRequest.userId), {
                friendsCount: increment(1)
            });
            setLastRequest(null);
        } catch (error) {
            console.error("Erreur lors de l'acceptation:", error);
        }
    };

    const handleDecline = async () => {
        try {
            await updateDoc(doc(db, 'friendRequests', lastRequest.id), {
                status: 'declined',
                respondedAt: new Date()
            });
            setLastRequest(null);
        } catch (error) {
            console.error("Erreur lors du refus:", error);
        }
    };

    if (loading) {
        return (
            <div className="friend-requests-container mt-3 px-3">
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-3 px-2 text-center">
                       
                             <ClipLoader color="#007bff" size={50} />
                          
                    </div>
                </div>
            </div>
        );
    }

    if (!lastRequest) {
        return (
            <div className="friend-requests-container mt-3 px-3">
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-3 px-2 text-center">
                        <small className="text-muted">Aucune invitation en attente</small>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="friend-requests-container mt-3 px-3">
            <div className="card border-0 shadow-sm">
                <div className="card-body py-3 px-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="card-title m-0 font-weight-bold" style={{ fontSize: "1rem" }}>
                            Invitations
                        </h6>
                        <Link to="/users/freinds" className="text-primary small">
                            Voir tout
                        </Link>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <div className="avatar  avatar-image mr-2" >
                            {lastRequest.avatar ? (
                                <img
                                    src={lastRequest.avatar}
                                    alt="Friend"
                                    
                                />
                            ) : (
                                <Avatar
                                    name={lastRequest.name}
                                    size="36"
                                    round
                                    className="border"
                                />
                            )}
                        </div>
                        <div className="flex-grow-1">
                            <div className="font-weight-semibold" style={{ fontSize: "0.95rem" }}>
                                {lastRequest.name}
                            </div>
                            <small className="text-muted">
                                {lastRequest.mutualFriends} ami{lastRequest.mutualFriends > 1 ? 's' : ''} en commun
                            </small>
                        </div>
                    </div>
                    <div className="d-flex">
                        <button
                            className="btn btn-primary btn-xs flex-fill mr-1"
                            style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                            onClick={handleAccept}
                        >
                            Confirmer
                        </button>
                        <button
                            className="btn btn-light btn-xs flex-fill"
                            style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem" }}
                            onClick={handleDecline}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendRequestsSidebar;