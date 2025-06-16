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
        reactions: 0,
        likes: 0,
        bookmarks: 0,
        shares: 0
    });
    useEffect(() => {
        async function fetchUser() {
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
        }
        fetchUser();
    }, [currentUser]);
    useEffect(() => {
        async function fetchStats() {
            if (!userId) return;
            const q = query(collection(db, "posts"), where("authorId", "==", userId));
            const snap = await getDocs(q);

            let totalReactions = 0;
            let totalLikes = 0;
            let totalbookmarks = 0;
            let totalShares = 0;

            snap.forEach(doc => {
                const data = doc.data();


                if (data.reactionsCount) {

                    totalReactions += Object.values(data.reactionsCount).reduce((a, b) => a + b, 0);
                    totalLikes += data.reactionsCount.LIKE || 0;
                }
                // bookmarks (tableau d'uid ou nombre)
                if (Array.isArray(data.bookmarks)) {
                    totalbookmarks += data.bookmarks.length;
                } else if (typeof data.bookmarks === "number") {
                    totalbookmarks += data.bookmarks;
                }

                if (typeof data.shares === "number") {
                    totalShares += data.shares;
                }
            });

            setStats({
                reactions: totalReactions,
                likes: totalLikes,
                bookmarks: totalbookmarks,
                shares: totalShares
            });
        }
        fetchStats();
    }, [userId]);
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