import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import PostCard from "../PostCard";
import { Spinner, Alert, Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

const UserPosts = ({ userId, isCurrentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const postsQuery = query(
      collection(db, "posts"),
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10) // Limite initiale
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() // Convertir le timestamp
        }));
        
        setPosts(postsData);
        setLoading(false);
        
        // Mettre à jour la pagination
        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 10);
        } else {
          setHasMore(false);
        }
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setError("Erreur lors du chargement des publications");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const loadMorePosts = async () => {
    if (!lastVisible) return;

    try {
      setLoading(true);
      
      const nextQuery = query(
        collection(db, "posts"),
        where("authorId", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(10)
      );

      const snapshot = await getDocs(nextQuery);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setPosts(prev => [...prev, ...newPosts]);
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
      setError("Erreur lors du chargement des publications supplémentaires");
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="user-posts">
      {/* Bouton pour créer une nouvelle publication (visible seulement par le propriétaire du profil) */}
      {/* {isCurrentUser && (
        <div className="mb-4 text-end">
          <Button variant="primary" href="/users/">
            <FaPlus className="me-2" />
            Nouvelle publication
          </Button>
        </div>
      )} */}

      {/* Liste des publications */}
      {posts.length === 0 ? (
        <div className="empty-posts text-center py-5">
          <h5 className="text-muted">
            {isCurrentUser 
              ? "Vous n'avez pas encore de publications" 
              : "Cet utilisateur n'a pas encore publié"}
          </h5>
          {isCurrentUser && (
            <Button variant="outline-primary" href="/users" className="mt-3">
              Créer votre première publication
            </Button>
          )}
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard key={post.id} post={post} 
            onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
            />
          ))}

          {/* Bouton pour charger plus de publications */}
          {hasMore && (
            <div className="text-center mt-4">
              <Button 
                variant="outline-primary" 
                onClick={loadMorePosts}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Chargement...
                  </>
                ) : (
                  "Afficher plus de publications"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .user-posts {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 15px;
        }
        
        .empty-posts {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 40px 20px;
        }
        
        @media (max-width: 768px) {
          .user-posts {
            padding: 0 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserPosts;