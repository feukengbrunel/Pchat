import { useState, useEffect, useRef, memo } from 'react';
import {
    collection, addDoc, serverTimestamp, query, orderBy,
    doc, updateDoc, deleteDoc, getDoc,
    getDocs,
    limit,
    startAfter,
    increment,
    onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaTimes, FaPaperPlane, FaReply, FaEdit, FaTrash, FaEllipsisH, FaHeart, FaRegHeart } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import Dropdown from 'react-bootstrap/Dropdown';
import Avatar from 'react-avatar';
import CommentSkeleton from './CommentSkeleton';


const CommentSection = ({ postId, onClose, onCommentAdded, onCommentDeleted }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const commentsEndRef = useRef();
    const commentsContainerRef = useRef();
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);

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
        if (!postId) return;

        const q = query(
            collection(db, 'posts', postId, 'comments'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const commentsData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const comment = docSnap.data();
                    const userSnap = await getDoc(doc(db, 'users', comment.authorId));
                    const userData = userSnap.exists() ? userSnap.data() : null;
                    let replyToName = null;
                    if (comment.replyTo) {
                        const repliedComment = snapshot.docs.find(d => d.id === comment.replyTo);
                        replyToName = repliedComment?.data().authorName || null;
                    }

                    return {
                        id: docSnap.id,
                        ...comment,
                        authorName: userData?.username || comment.authorName,
                        authorAvatar: userData?.photoURL || comment.authorAvatar,
                        replyToName,
                    };
                })
            );

            setComments(commentsData);
            setLoading(false);
            setHasMore(commentsData.length >= 10);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !auth.currentUser) return;

        const user = auth.currentUser;

        try {
            const commentData = {
                content: newComment,
                authorId: user.uid,
                authorName: userData?.username || user.displayName || user.email,
                authorAvatar: userData?.photoURL || user.photoURL || '/default-avatar.png',
                createdAt: serverTimestamp(),
                replyTo: replyingTo,
                edited: false,
                likes: []
            };

            await addDoc(collection(db, 'posts', postId, 'comments'), commentData);

            await updateDoc(doc(db, 'posts', postId), {
                commentsCount: increment(1)
            });

            setNewComment('');
            setReplyingTo(null);
            setEditingComment(null);
            onCommentAdded?.();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEdit = async (commentId, newContent) => {
        if (!newContent.trim()) return;

        try {
            await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
                content: newContent,
                edited: true
            });
            setEditingComment(null);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Supprimer ce commentaire ?')) return;

        try {
            await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
            await updateDoc(doc(db, 'posts', postId), {
                commentsCount: increment(-1)
            });
            onCommentDeleted?.();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleLike = async (commentId, likes) => {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const isLiked = likes.includes(userId);
        const newLikes = isLiked
            ? likes.filter(id => id !== userId)
            : [...likes, userId];

        try {
            await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
                likes: newLikes
            });
        } catch (error) {
            console.error('Error updating likes:', error);
        }
    };

    const loadMoreComments = async () => {
        if (!setHasMore || loading) return;
         if (!comments.length) return; // Ne pas charger si pas de commentaires
        setLoading(true);
        const lastComment = comments[comments.length - 1];

        const q = query(
            collection(db, 'posts', postId, 'comments'),
            orderBy('createdAt', 'desc'),
            startAfter(lastComment.createdAt),
            limit(10)
        );

        const snapshot = await getDocs(q);
        const newComments = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const comment = docSnap.data();
                const userSnap = await getDoc(doc(db, 'users', comment.authorId));
                const userData = userSnap.exists() ? userSnap.data() : null;

                return {
                    id: docSnap.id,
                    ...comment,
                    authorName: userData?.username || comment.authorName,
                    authorAvatar: userData?.photoURL || comment.authorAvatar,
                };
            })
        );

        setComments([...comments, ...newComments]);
        setLoading(false);
        hasMore(newComments.length >= 10);
    };

    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [comments]);

    return (
        <div className="comment-section-container">
            <div className="comment-section-header">
                <h5>Commentaires</h5>
               
            </div>

            <div
                ref={commentsContainerRef}
                className="comments-list-container"
            >
                {loading && comments.length === 0 ? (
                    <>
                        <CommentSkeleton />
                        <CommentSkeleton />
                        <CommentSkeleton />
                    </>
                ) : comments.length === 0 ? (
                    <p className="no-comments">Soyez le premier à commenter</p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUser?.uid}
                            onReply={() => setReplyingTo(comment.id)}
                            onEdit={() => setEditingComment(comment.id)}
                            onDelete={() => handleDelete(comment.id)}
                            onLike={() => handleLike(comment.id, comment.likes || [])}
                            isEditing={editingComment === comment.id}
                            onSaveEdit={handleEdit}
                            isOwn={comment.authorId === currentUser?.uid}
                            onCancelEdit={() => setEditingComment(null)}
                        />
                    ))
                )}

                {loading && comments.length > 0 && (
                    <div className="loading-more">
                        <div className="spinner" role="status"></div>
                    </div>
                )}

                {setHasMore && !loading && (
                    <button
                        className="load-more-btn"
                        onClick={loadMoreComments}
                    >
                        Charger plus de commentaires
                    </button>
                )}

                <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="comment-form">
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={
                            replyingTo
                                ? `Réponse à ${comments.find(c => c.id === replyingTo)?.authorName}...`
                                : 'Ajouter un commentaire...'
                        }
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!newComment.trim()}
                    >
                        <FaPaperPlane />
                    </button>
                </div>
                {replyingTo && (
                    <div className="replying-to">
                        Réponse à {comments.find(c => c.id === replyingTo)?.authorName}
                        <button
                            type="button"
                            className="cancel-reply"
                            onClick={() => setReplyingTo(null)}
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

const CommentItem = memo(({
    comment,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    onLike,
    isEditing,
    onSaveEdit,
    isOwn,
    onCancelEdit
}) => {
    const [editContent, setEditContent] = useState(comment.content);
    const [isLiked, setIsLiked] = useState((comment.likes || []).includes(currentUserId));
    const likeCount = (comment.likes || []).length;

    useEffect(() => {
        setIsLiked((comment.likes || []).includes(currentUserId));
    }, [comment.likes, currentUserId]);

    const handleSave = () => {
        onSaveEdit(comment.id, editContent);
    };

    return (
        <div className={`comment-item ${comment.replyTo ? 'reply' : ''}`}>
            <div className="comment-avatar">
                <Avatar
                    src={comment.authorAvatar}
                    name={comment.authorName}
                    size="40"
                    round
                />
            </div>
            <div className="comment-content">
                <div className="comment-header">
                    <div className="comment-author">{comment.authorName}</div>
                    <div className="comment-actions">
                        <Dropdown align="end">
                            <Dropdown.Toggle
                                className="action-menu"
                                variant="link"
                                id={`dropdown-comment-${comment.id}`}
                                style={{
                                    boxShadow: "none",
                                    border: "none",
                                    background: "none",
                                    padding: 0,
                                    color: "#888",
                                    fontSize: "1.1rem",
                                    lineHeight: 1,
                                }}
                            >
                                <FaEllipsisH />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="comment-dropdown-menu">
                                <Dropdown.Item onClick={onReply} className="d-flex align-items-center">
                                    <FaReply className="me-2 text-primary" /> Répondre
                                </Dropdown.Item>
                                {isOwn && (
                                    <>
                                        <Dropdown.Item onClick={onEdit} className="d-flex align-items-center">
                                            <FaEdit className="me-2 text-warning" /> Modifier
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={onDelete} className="d-flex align-items-center">
                                            <FaTrash className="me-2 text-danger" /> Supprimer
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {comment.replyTo && (
                    <div className="reply-mention">
                        En réponse à @{comment.replyToName || 'utilisateur'}
                    </div>
                )}

                {isEditing ? (
                    <div className="edit-form">
                        <input
                            type="text"
                            className="edit-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                        />
                        <div className="edit-actions">
                            <button
                                className="save-btn"
                                onClick={handleSave}
                            >
                                Enregistrer
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    onCancelEdit();
                                    setEditContent(comment.content);
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="comment-text">{comment.content}</div>
                )}

                <div className="comment-footer">
                    <div className="comment-meta">
                        <span className="comment-time">
                            {comment.createdAt && comment.createdAt.toDate && !isNaN(comment.createdAt.toDate())
                                ? format(comment.createdAt.toDate(), 'PPp', { locale: fr })
                                : ''}
                            {comment.edited && <span className="edited"> · modifié</span>}
                        </span>
                    </div>
                    <div className="comment-interactions">
                        <button
                            className={`like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => onLike()}
                        >
                            {isLiked ? <FaHeart /> : <FaRegHeart />}
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                        <button className="reply-btn" onClick={onReply}>
                            <FaReply />
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
            .comment-dropdown-menu {
    min-width: 160px;
    border-radius: 10px !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    padding: 6px 0;
    border: none;
  }
  .comment-dropdown-menu .dropdown-item {
    font-size: 0.97rem;
    padding: 8px 18px;
    border-radius: 6px;
    transition: background 0.18s, color 0.18s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .comment-dropdown-menu .dropdown-item:active,
  .comment-dropdown-menu .dropdown-item:hover {
    background: #f0f2f5;
    color: #4a6cf7;
  }
  .action-menu {
    color: #888 !important;
    background: none !important;
    border: none !important;
    padding: 4px !important;
    border-radius: 50% !important;
    transition: background 0.18s;
  }
  .action-menu:hover, .action-menu:focus {
    background: #f0f2f5 !important;
    color: #4a6cf7 !important;
  }
                .comment-section-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.comment-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
   
}

.comment-section-header h5 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    color: #666;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    padding: 5px 8px; /* Réduit le padding horizontal */
    margin-left: 8px;  /* Optionnel : rapproche du titre */
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: #333;
}

.comments-list-container {
    max-height: 500px;
    min-height: 120px; /* Ajoute une hauteur minimale */
    background: #fff;  /* Fond blanc même vide */
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    overflow-y: auto;
    padding-right: 10px;
    margin-bottom: 20px;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.no-comments {
    text-align: center;
    color: #666;
    padding: 30px 0;
    font-size: 0.95rem;
    width: 100%;
}

/* Style de la scrollbar */
.comments-list-container::-webkit-scrollbar {
    width: 6px;
}

.comments-list-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.comments-list-container::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
}

.comments-list-container::-webkit-scrollbar-thumb:hover {
    background: #aaa;
}

.loading-spinner, .loading-more {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #4a6cf7;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}



.comment-item {
    display: flex;
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 10px;
    transition: background 0.2s;
}

.comment-item:hover {
    background: rgba(0, 0, 0, 0.02);
}

.comment-item.reply {
    margin-left: 40px;
    position: relative;
}

.comment-item.reply::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 40px;
    height: calc(100% - 40px);
    width: 2px;
    background: #e0e0e0;
}

.comment-avatar {
    margin-right: 15px;
    flex-shrink: 0;
}

.comment-content {
    flex-grow: 1;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.comment-author {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.comment-actions {
    position: relative;
}

.action-menu {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 5px;
    font-size: 0.9rem;
    transition: color 0.2s;
}

.action-menu:hover {
    color: #333;
}

.reply-mention {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 5px;
}

.comment-text {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
    margin-bottom: 10px;
    white-space: pre-wrap;
}

.comment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.comment-meta {
    font-size: 0.8rem;
    color: #999;
}

.comment-time {
    display: flex;
    align-items: center;
}

.edited {
    font-style: italic;
    margin-left: 5px;
}

.comment-interactions {
    display: flex;
    gap: 15px;
}

.like-btn, .reply-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
    padding: 0;
}

.like-btn:hover, .reply-btn:hover {
    color: #333;
}

.like-btn.liked {
    color: #f44336;
}

.edit-form {
    margin-bottom: 10px;
}

.edit-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    margin-bottom: 8px;
    transition: border 0.2s;
}

.edit-input:focus {
    outline: none;
    border-color: #4a6cf7;
}

.edit-actions {
    display: flex;
    gap: 10px;
}

.save-btn, .cancel-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.save-btn {
    background: #4a6cf7;
    color: white;
    border: none;
}

.save-btn:hover {
    background: #3a5bd9;
}

.cancel-btn {
    background: none;
    border: 1px solid #ddd;
    color: #666;
}

.cancel-btn:hover {
    background: #f5f5f5;
}

.comment-form {
    margin-top: 20px;
}

.form-group {
    display: flex;
    gap: 10px;
}

.form-control {
    flex-grow: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: #4a6cf7;
    box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
}

.submit-btn {
    background: #4a6cf7;
    color: white;
    border: none;
    border-radius: 8px;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
    background: #3a5bd9;
}

.replying-to {
    font-size: 0.85rem;
    color: #666;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.cancel-reply {
    background: none;
    border: none;
    color: #4a6cf7;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
}

.load-more-btn {
    background: none;
    border: none;
    color: #4a6cf7;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 10px 0;
    width: 100%;
    text-align: center;
    margin-top: 10px;
    transition: color 0.2s;
}

.load-more-btn:hover {
    color: #3a5bd9;
}
            `}</style>

        </div>
    );
});

export default CommentSection;