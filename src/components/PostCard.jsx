import { useState, useRef, useEffect } from "react";
import { Carousel, Image, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaTimes,
  FaEllipsisH,
  FaChevronLeft,
  FaChevronRight,
  FaBookmark,
  FaRegBookmark,
  FaTrash,
  FaEllipsisV
} from "react-icons/fa";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import CommentSection from "./CommentSection";
import ReactionSelector from './ReactionSelector';
import { REACTIONS, DEFAULT_REACTION } from './reactions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { arrayUnion, arrayRemove } from "firebase/firestore";
import Avatar from "react-avatar";

const PostCard = ({ post, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionsCount, setReactionsCount] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const contentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const postRef = useRef();
  const [showDropdown, setShowDropdown] = useState(false);
  const observer = useRef();
  const [authorAvatar, setAuthorAvatar] = useState(post.authorAvatar);
  useEffect(() => {
    if (!post.authorId) return;
    getDoc(doc(db, "users", post.authorId)).then(snap => {
      if (snap.exists()) {
        setAuthorAvatar(snap.data().photoURL);
      }
    });
  }, [post.authorId]);

  // Observer pour le lazy loading
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (postRef.current) observer.current.observe(postRef.current);

    return () => observer.current?.disconnect();
  }, []);

  // Charger les réactions et les bookmarks
  useEffect(() => {
    if (!isVisible) return;

    const reactionsRef = collection(db, 'posts', post.id, 'reactions');
    const q = query(reactionsRef);

    const unsubscribeReactions = onSnapshot(q, (snapshot) => {
      const counts = {};
      let userReact = null;

      snapshot.docs.forEach(doc => {
        const { type, userId } = doc.data();
        counts[type] = (counts[type] || 0) + 1;
        if (userId === auth.currentUser?.uid) {
          userReact = type;
        }
      });

      setReactionsCount(counts);
      setUserReaction(userReact);
      setIsLiked(userReact === "LIKE"); //
    });

    // Vérifier si l'utilisateur a bookmarké ce post
    if (auth.currentUser?.uid) {
      const bookmarkRef = doc(db, 'users', auth.currentUser.uid, 'bookmarks', post.id);
      getDoc(bookmarkRef).then(docSnap => {
        setIsBookmarked(docSnap.exists());
      });
    }

    return () => {
      unsubscribeReactions();
    };
  }, [post.id, isVisible]);
  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer ce post ?")) {
      await deleteDoc(doc(db, "posts", post.id));
      if (onDelete) onDelete(post.id);
    }
  };
  const handleBookmark = async () => {
    if (!auth.currentUser) return;

    const bookmarkRef = doc(db, 'users', auth.currentUser.uid, 'bookmarks', post.id);
    const postRef = doc(db, 'posts', post.id);
    try {
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        await updateDoc(postRef, {
          bookmarks: arrayRemove(auth.currentUser.uid)
        });
      } else {
        await setDoc(bookmarkRef, {
          postId: post.id,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          bookmarks: arrayUnion(auth.currentUser.uid)
        });
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error handling bookmark:", error);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!auth.currentUser) return;

    const reactionRef = doc(db, 'posts', post.id, 'reactions', auth.currentUser.uid);
    const postRef = doc(db, 'posts', post.id);

    try {
      if (userReaction === reactionType) {
        await deleteDoc(reactionRef);
        await updateDoc(postRef, {
          [`reactionsCount.${reactionType}`]: increment(-1)
        });
      } else {
        await setDoc(reactionRef, {
          type: reactionType,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });

        const updates = {
          [`reactionsCount.${reactionType}`]: increment(1)
        };

        if (userReaction) {
          updates[`reactionsCount.${userReaction}`] = increment(-1);
        }

        await updateDoc(postRef, updates);
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };
  // Fonction pour gérer le like
  const handleLike = async () => {
    if (!auth.currentUser) return;

    const reactionRef = doc(db, 'posts', post.id, 'reactions', auth.currentUser.uid);
    const postRef = doc(db, 'posts', post.id);

    try {
      if (isLiked) {
        // Retirer le like
        await deleteDoc(reactionRef);
        await updateDoc(postRef, {
          "reactionsCount.LIKE": increment(-1)
        });
        setIsLiked(false);
        setUserReaction(null);
      } else {
        // Ajouter le like
        await setDoc(reactionRef, {
          type: "LIKE",
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, {
          "reactionsCount.LIKE": increment(1)
        });
        setIsLiked(true);
        setUserReaction("LIKE");
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };
  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const el = contentRef.current;
        const fullHeight = el.scrollHeight;
        const clampHeight = el.clientHeight;
        const hasOverflow = fullHeight > clampHeight + 2;
        const hasContent = el.textContent.trim().length > 0;
        setIsOverflowing(hasOverflow && hasContent);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [post.content, expanded]);

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setShowFullscreen(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);

    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  const renderImageGrid = () => {
    if (!Array.isArray(post.images) || post.images.length === 0) return null;

    if (post.images.length === 1) {
      return (
        <div className="single-image-container">
          <Image
            src={post.images[0]}
            alt="Post content"
            fluid
            rounded
            className="post-image"
            onClick={() => handleImageClick(0)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          />
          {isHovering && (
            <div className="image-hover-overlay">
              <span className="zoom-hint">Cliquer pour zoomer</span>
            </div>
          )}
        </div>
      );
    }

    // Rendu pour 2 images ou plus
    return (
      <div className={`image-grid grid-${Math.min(post.images.length, 4)}`}>
        {post.images.slice(0, 4).map((img, index) => (
          <div
            key={index}
            className="grid-item"
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={img}
              alt={`Post content ${index + 1}`}
              fluid
              className="post-image"
              style={{
                filter: index === 3 && post.images.length > 4 ? 'brightness(0.7)' : 'none'
              }}
            />
            {index === 3 && post.images.length > 4 && (
              <div className="remaining-count">+{post.images.length - 4}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={postRef} className="post-card">
      {/* En-tête du post */}
      <div className="post-header">
        <div className="author-info">
        
          {authorAvatar? (
                <img
                  src={authorAvatar || "/assets/images/avatars/thumb-3.jpg"}
                  alt="Profile"
                  className="author-avatar"
                />
              ) :
                (
                  <Avatar
                    name={post.authorName}
                    size="36"
                    round
                    className="border"
                  />
                )}
          <div>
            <h4 className="author-name">{post.authorName}</h4>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {/* Dropdown placé ici, à droite */}
        <div className="dropdown dropdown-animated scale-left post-actions-dropdown">
          <button
            type="button"
            className="btn btn-default dropdown-toggle"
            onClick={() => setShowDropdown((v) => !v)}
          >

          </button>
          <div className={`dropdown-menu${showDropdown ? " show" : ""}`}>
            <button
              className="dropdown-item"
              type="button"
              onClick={handleBookmark}
            >
              {isBookmarked ? <FaBookmark className="text-primary" /> : <FaRegBookmark className="text-primary" />}
              {isBookmarked ? " Retirer des favoris" : " Ajouter aux favoris"}
            </button>
            {auth.currentUser?.uid === post.authorId && (
              <button
                className="dropdown-item text-danger"
                type="button"
                onClick={handleDelete}
              >
                <FaTrash style={{ marginRight: 8 }} />
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>



      {/* Contenu du post */}
      <div className="post-content-container">
        <div
          ref={contentRef}
          className={`post-content ${expanded ? 'expanded' : 'collapsed'}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        {isOverflowing && (
          <button
            className="expand-toggle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Voir moins' : 'Voir plus'}
          </button>
        )}
      </div>

      {/* Galerie d'images */}
      {renderImageGrid()}

      {/* Statistiques et réactions */}
      <div className="post-stats">
        <div className="reactions-summary">
          {Object.keys(reactionsCount).length > 0 && (
            <>
              <div className="reaction-icons">
                {Object.entries(REACTIONS)
                  .filter(([type]) => reactionsCount[type])
                  .slice(0, 3)
                  .map(([type, { emoji }]) => (
                    <span key={type} className="reaction-icon">
                      {emoji}
                    </span>
                  ))}
                {Object.keys(reactionsCount).length > 3 && (
                  <span className="more-reactions">+{Object.keys(reactionsCount).length - 3}</span>
                )}
              </div>
              <span className="reaction-count">
                {Object.values(reactionsCount).reduce((a, b) => a + b, 0)}
              </span>
            </>
          )}
        </div>
        {commentsCount > 0 && (
          <button
            className="comments-count-btn"
            onClick={() => setShowComments(!showComments)}
          >
            {commentsCount} commentaire{commentsCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Actions principales */}
      <div className="post-actions-bar">
        
        <ReactionSelector
          className="action-btn border-none"
          currentReaction={userReaction}
          onSelect={handleReaction}
          tooltipPlacement="top"
        />

        <button
          className={`action-btn${isLiked ? " active" : ""}`}
          onClick={handleLike}
        >
          {isLiked ? <FaHeart color="#e74c3c" /> : <FaRegHeart />}
          <span>J'aime</span>
        </button>
        <button
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <FaComment />
          <span>Commenter</span>
        </button>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Partager ce post</Tooltip>}
        >
          <button className="action-btn">
            <FaShare />
            <span>Partager</span>
          </button>
        </OverlayTrigger>
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="comments-section">
          <CommentSection
            postId={post.id}
            onClose={() => setShowComments(false)}
            onCommentAdded={() => setCommentsCount(c => c + 1)}
            onCommentDeleted={() => setCommentsCount(c => c - 1)}
          />
        </div>
      )}

      {/* Modal plein écran pour les images */}
      <Modal
        show={showFullscreen}
        onHide={() => setShowFullscreen(false)}
        centered
        fullscreen="md-down"
        size="xl"
        className="image-modal"
      >
        <Modal.Body className="modal-image-container">
          <Image
            src={Array.isArray(post.images) ? post.images[selectedImage] : ""}
            alt={`Post ${selectedImage}`}
            fluid
            className="fullscreen-image"
          />
          {Array.isArray(post.images) && post.images.length > 1 && (
            <>
              <button
                className="nav-btn prev-btn"
                onClick={() =>
                  setSelectedImage(
                    (selectedImage - 1 + post.images.length) % post.images.length
                  )
                }
                aria-label="Image précédente"
              >
                <FaChevronLeft />
              </button>
              <button
                className="nav-btn next-btn"
                onClick={() =>
                  setSelectedImage((selectedImage + 1) % post.images.length)
                }
                aria-label="Image suivante"
              >
                <FaChevronRight />
              </button>
              <div className="image-counter">
                {selectedImage + 1} / {post.images.length}
              </div>
            </>
          )}
          <button
            className="close-btn"
            onClick={() => setShowFullscreen(false)}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </Modal.Body>
      </Modal>

      <style jsx>{`
       .post-actions-dropdown {
          position: relative;
        }
        .dropdown-menu {
          min-width: 180px;
          right: 0;
          left: auto;
        }
        .dropdown-menu.show {
          display: block;
        }
    .post-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f5f5f5;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #050505;
}

.post-date {
  font-size: 13px;
  color: #65676b;
  display: block;
  margin-top: 2px;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  background: none;
  border: none;
  color:rgb(247, 0, 0);
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.icon-button:hover {
  background: #f0f2f5;
  color:rgb(247, 0, 0);
}

.bookmark-btn {
  color:rgb(29, 0, 247);
}

.post-content-container {
  padding: 0 16px;
  margin-bottom: 12px;
}

.post-content {
  font-size: 15px;
  line-height: 1.5;
  color: #050505;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-content.collapsed {
  max-height: 72px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.expand-toggle {
  background: none;
  border: none;
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.expand-toggle:hover {
  color: #050505;
}

.single-image-container {
  position: relative;
  margin-bottom: 12px;
  cursor: pointer;
}

.post-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 8px;
  background: #f5f5f5;
}

.image-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.single-image-container:hover .image-hover-overlay {
  opacity: 1;
}

.zoom-hint {
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
}

.image-grid {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-3 .grid-item:first-child {
  grid-row: span 2;
}

.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-item {
  position: relative;
  cursor: pointer;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
}

.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.grid-item:hover img {
  transform: scale(1.03);
}

.remaining-count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #f0f2f5;
  border-bottom: 1px solid #f0f2f5;
}

.reactions-summary {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reaction-icons {
  display: flex;
}

.reaction-icon {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-left: -4px;
  border: 1px solid white;
}

.reaction-icon:first-child {
  margin-left: 0;
}

.more-reactions {
  font-size: 13px;
  color: #65676b;
}

.reaction-count, .comments-count-btn {
  font-size: 13px;
  color: #65676b;
  cursor: pointer;
}

.comments-count-btn {
  background: none;
  border: none;
  padding: 0;
}

.comments-count-btn:hover {
  text-decoration: underline;
  color: #050505;
}

.post-actions-bar {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  color: #65676b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.action-btn:hover {
  background: #f0f2f5;
  color: #050505;
}

.action-btn.active {
  color: var(--primary-color);
}

.action-btn svg {
  font-size: 18px;
}



/* Modal plein écran */
.image-modal .modal-content {
  background: transparent;
  border: none;
}

.modal-image-container {
  position: relative;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.fullscreen-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(30, 30, 30, 0.6);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}

.nav-btn:hover {
  background: rgba(30, 30, 30, 0.8);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(30, 30, 30, 0.6);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(30, 30, 30, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .post-header {
    padding: 12px;
  }
  
  .author-avatar {
    width: 40px;
    height: 40px;
  }
  
  .post-content {
    font-size: 14px;
  }
  
  .action-btn span {
    display: none;
  }
  
  .action-btn {
    padding: 8px;
  }
  
  .modal-image-container {
    height: 60vh;
  }
  
  .nav-btn, .close-btn {
    width: 36px;
    height: 36px;
  }
}
      `}</style>
    </div>
  );
};

export default PostCard;