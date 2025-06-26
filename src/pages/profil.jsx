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
    if (!userId && !currentUser) return;
    const uid = userId || currentUser.uid;

    // Nombre d'amis
    const userDoc = await getDoc(doc(db, "users", uid));
    let amisCount = 0;
    if (userDoc.exists()) {
      const data = userDoc.data();
      amisCount = typeof data.friendsCount === "number" ? data.friendsCount : 0;
      console.log("Nombre d'amis:", amisCount);
    }

    // Nombre de likes et de favoris
    const postsSnap = await getDocs(query(collection(db, "posts"), where("authorId", "==", uid)));
    let likesCount = 0;
    let bookmarksCount = 0;

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
      }
    }

    setStats({
      Amis: amisCount,
      likes: likesCount,
      bookmarks: bookmarksCount,
    });
  }
  fetchStats();
}, [userId, currentUser]);
    useEffect(() => {
        async function fetchStats() {
            if (!userId) return;
            const q = query(collection(db, "posts"), where("authorId", "==", userId));
            const snap = await getDocs(q);

            let totalAmis = 0;
            let totalLikes = 0;
            let totalbookmarks = 0;
            let totalShares = 0;

            snap.forEach(doc => {
                const data = doc.data();


                if (data.AmisCount) {

                    totalAmis += Object.values(data.AmisCount).reduce((a, b) => a + b, 0);
                    totalLikes += data.AmisCount.LIKE || 0;
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
                Amis: totalAmis,
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