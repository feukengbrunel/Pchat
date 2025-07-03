import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../layouts/NavBar";
import { Sidebar } from "../layouts/SideBar";
import CreatePost from "../components/CreatePost";
import { db, auth } from "../firebase";
import SkeletonPost from "../components/SkeletonPost";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment
} from "firebase/firestore";
import PostCard from "../components/PostCard";
import RememberPasswordCard from "../components/RememberPasswordCard";

const HomePage = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); //loading du skeleton
  const [showSkeleton, setShowSkeleton] = useState(true);
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  // Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, [currentUser]);
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    }, () => setLoading(false)); // En cas d'erreur, on arrête le loading

    return () => unsubscribe();
  }, []);

  // Affiche les skeletons 10 à 15s après l'arrivée des données
  useEffect(() => {
    let timer;
    if (!loading) {
      setShowSkeleton(true);
      timer = setTimeout(() => setShowSkeleton(false), 3000); // 12 secondes (entre 10 et 15)
    }
    return () => clearTimeout(timer);
  }, [loading]);
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async (postData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Utilisateur non connecté");

    await addDoc(collection(db, "posts"), {
      content: postData.content,
      images: postData.images || [],
      authorId: user.uid,
      authorName: userData?.username || user.displayName || user.email,
      authorAvatar: userData?.photoURL || user.photoURL || "/default-avatar.png",
      likesCount: 0, // Compteur de likes
      commentsCount: 0, // Compteur de commentaires
      createdAt: serverTimestamp(),
    });
  };

  return (
   <>
              {showCard && (
                <div className="mb-4">
                  <RememberPasswordCard onClose={() => setShowCard(false)} />
                </div>
              )}
              <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8">
                  <div className="mb-4">
                   <CreatePost key="create-post" onPost={handlePost} />
                  </div>
                  {loading || showSkeleton
                    ? Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonPost key={i} />
                    ))
                    : posts.map((post) => (
                      <div className="mb-4" key={post.id}>
                        <PostCard post={post} 
                          onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
                        />
                      </div>
                    ))}
                </div>
              </div>
          </>
  );
};

export default HomePage;