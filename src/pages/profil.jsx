import { useParams } from "react-router-dom";
import BioAndSpecialty from "../components/Profil/BioSpeciality";
import ProfilHeader from "../components/Profil/HeaderProfil";
import { useAuth } from "../hooks/useAuth";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import UserPosts from "../components/Profil/PostProfile";

function Profil() {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        Amis: 0,
        likes: 0,
        bookmarks: 0,
        shares: 0
    });
     useEffect(() => {
        async function fetchStats() {
            const uid = userId || currentUser?.uid;
            if (!uid) return;

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

            for (const postDoc of postsSnap.docs) {
                const data = postDoc.data();

                // Likes via likeCount
                if (typeof data.likeCount === "number") {
                    likesCount += data.likeCount;
                }

                // Likes via sous-collection reactions
                const reactionsSnap = await getDocs(collection(db, "posts", postDoc.id, "reactions"));
                likesCount += reactionsSnap.docs.filter(doc => doc.data().type === "LIKE").length;

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
            }

            setStats({
                Amis: amisCount,
                likes: likesCount,
                bookmarks: bookmarksCount,
                shares: sharesCount
            });
        }
        fetchStats();
    }, [userId, currentUser]);
    return (
        <div>
            <ProfilHeader />
            <BioAndSpecialty
                bio={userData?.bio}
                specialties={userData?.specialties}
                stats={stats}
            />

            <div className="row d-flex justify-content-center">

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