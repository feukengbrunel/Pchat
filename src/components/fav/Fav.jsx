import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { FaBookmark, FaRegBookmark, FaEllipsisH } from 'react-icons/fa';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import PostCard from '../PostCard';
import { ClipLoader } from 'react-spinners';

const FavoritesPage = () => {
  const { currentUser } = useAuth();
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


useEffect(() => {
  const fetchFavoritePosts = async () => {
    try {
      if (!currentUser) return;

      // 1. Récupérer la sous-collection bookmarks de l'utilisateur
      const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
      const bookmarksSnap = await getDocs(bookmarksRef);

      const bookmarks = [];
      bookmarksSnap.forEach(doc => {
        bookmarks.push({ postId: doc.id, ...doc.data() });
      });

      // 2. Trier par date
      const sortedBookmarks = [...bookmarks].sort((a, b) =>
        b.createdAt?.toDate() - a.createdAt?.toDate()
      );

      // 3. Récupérer les posts correspondants
      const postsPromises = sortedBookmarks.map(async (bookmark) => {
        const postRef = doc(db, 'posts', bookmark.postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          return {
            id: postSnap.id,
            ...postSnap.data(),
            bookmarkDate: bookmark.createdAt
          };
        }
        return null;
      });

      const posts = (await Promise.all(postsPromises)).filter(post => post !== null);
      setFavoritePosts(posts);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchFavoritePosts();
}, [currentUser]);

  const handleRemoveFavorite = async (postId) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      // Filtrer pour supprimer le bookmark
      const updatedBookmarks = userData.bookmarks.filter(
        bookmark => bookmark.postId !== postId
      );
      
      // Mettre à jour Firestore
      await updateDoc(userRef, { bookmarks: updatedBookmarks });
      
      // Mettre à jour le state local
      setFavoritePosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading) {
    return (
     <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <ClipLoader color="#007bff" size={50} />
    </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
  

<Container className="py-4">
  {favoritePosts.length === 0 && (
    <div className="text-center py-5">
      <FaRegBookmark className="display-4 text-muted mb-3" />
      <h4>Aucun favori pour le moment</h4>
      <p className="text-muted">
        Sauvegardez des publications pour les retrouver facilement ici
      </p>
      <Button variant="primary" href="/users/home">
        Explorer les publications
      </Button>
    </div>
  )}

  <Row xs={1} md={2} lg={3} className="g-4">
    {favoritePosts.map(post => (
      <Col key={post.id}>
        <PostCard post={post} />
      </Col>
    ))}
  </Row>
</Container>
  );
};

export default FavoritesPage;