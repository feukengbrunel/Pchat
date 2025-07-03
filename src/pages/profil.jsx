import { useParams } from "react-router-dom";
import BioAndSpecialty from "../components/Profil/BioSpeciality";
import ProfilHeader from "../components/Profil/HeaderProfil";
import { useAuth } from "../hooks/useAuth";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import UserPosts from "../components/Profil/PostProfile";
import { ClipLoader } from "react-spinners";

function Profil() {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        Amis: 0,
        likes: 0,
        bookmarks: 0,
        shares: 0
    });
    
    // Récupérer les données utilisateur
    useEffect(() => {
        async function fetchUserData() {
            const uid = userId || currentUser?.uid;
            if (!uid) {
                setLoading(false);
                return;
            }
            
            try {
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, [userId, currentUser]);
    
    // Récupérer les statistiques
    useEffect(() => {
        async function fetchStats() {
            const uid = userId || currentUser?.uid;
            if (!uid) return;

            try {
                // Nombre d'amis
                const userDoc = await getDoc(doc(db, "users", uid));
                let amisCount = 0;
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    amisCount = typeof data.friendsCount === "number" ? data.friendsCount : 0;
                }

                // Nombre de likes, favoris, partages
                const postsSnap = await getDocs(query(collection(db, "posts"), where("authorId", "==", uid)));
                let likesCount = 0;
                let bookmarksCount = 0;
                let sharesCount = 0;

                postsSnap.forEach(postDoc => {
                    const data = postDoc.data();

                    // Likes via likeCount
                    if (typeof data.likeCount === "number") {
                        likesCount += data.likeCount;
                    }

                    // Favoris
                    if (Array.isArray(data.bookmarks)) {
                        bookmarksCount += data.bookmarks.length;
                    } else if (typeof data.bookmarks === "number") {
                        bookmarksCount += data.bookmarks;
                    }

                    // Partages
                    if (typeof data.shares === "number") {
                        sharesCount += data.shares;
                    }
                });

                // Récupérer les likes de la sous-collection reactions de façon plus sécurisée
                let additionalLikes = 0;
                for (const postDoc of postsSnap.docs) {
                    try {
                        const reactionsSnap = await getDocs(collection(db, "posts", postDoc.id, "reactions"));
                        additionalLikes += reactionsSnap.docs.filter(doc => doc.data().type === "LIKE").length;
                    } catch (error) {
                        console.error("Erreur lors de la récupération des réactions:", error);
                    }
                }

                likesCount += additionalLikes;

                setStats({
                    Amis: amisCount,
                    likes: likesCount,
                    bookmarks: bookmarksCount,
                    shares: sharesCount
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
            }
        }
        fetchStats();
    }, [userId, currentUser]);
    
    if (loading) {
        return  <div className="d-flex justify-content-center align-items-center">
      <ClipLoader color="#007bff" size={50} />
    </div>
    }
    
    if (!currentUser && !userData) {
        return <div className="alert alert-warning m-4">Utilisateur non trouvé ou non connecté</div>;
    }
    
    return (
        <div className="profile-container">
            {userData && <ProfilHeader userData={userData} />}
            {userData && (
                <BioAndSpecialty
                    bio={userData.bio}
                    specialties={userData.specialties}
                    stats={stats}
                />
            )}

            <div className="row d-flex justify-content-center mt-4">
                <div className="col-md-8">
                    <UserPosts
                        userId={userId || currentUser?.uid}
                        isCurrentUser={(userId ? userId === currentUser?.uid : true)}
                    />
                </div>
            </div>
        </div>
    );
}

export default Profil;