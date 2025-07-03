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
import { FaTimes, FaPaperPlane, FaReply, FaEdit, FaTrash, FaEllipsisH, FaHeart, FaRegHeart, FaCommentSlash } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import Dropdown from 'react-bootstrap/Dropdown';
import Avatar from 'react-avatar';
import CommentSkeleton from './CommentSkeleton';
import { ClipLoader } from 'react-spinners';


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
        if (!hasMore || loading) return;
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
        setHasMore(newComments.length >= 10);
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
                    <div className="comments-loading">
                        <CommentSkeleton />
                        <CommentSkeleton />
                        <CommentSkeleton />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="empty-comments">
                        <div className="empty-comments-icon">
                            <FaCommentSlash />
                        </div>
                        <h4>Aucun commentaire</h4>
                        <p>Soyez le premier à participer à la conversation !</p>
                    </div>
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
                        <ClipLoader color="#4a6cf7" size={30} />
                    </div>
                )}

                {hasMore && !loading && comments.length > 0 && (
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
                <div className="form-group comment-input-row">
                    <input
                        type="text"
                        className="form-control comment-input"
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
                        className="submit-btn comment-send-btn"
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

            <style jsx>{`
                .comment-section-container {
                    background: #fff;
                    border-radius: 0 0 12px 12px;
                    padding: 16px;
                    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                }

                .comment-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #eaeaea;
                }

                .comment-section-header h5 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }

                .comments-list-container {
                    max-height: 500px;
                    min-height: 150px;
                    overflow-y: auto;
                    margin-bottom: 16px;
                    border-radius: 10px;
                    background: #f8f9fa;
                    padding: 8px;
                    scrollbar-width: thin;
                }

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

                .comments-loading {
                    padding: 12px;
                }

                .empty-comments {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                    color: #6c757d;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    min-height: 200px;
                }

                .empty-comments-icon {
                    font-size: 2.5rem;
                    color: #dee2e6;
                    margin-bottom: 16px;
                }

                .empty-comments h4 {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #495057;
                }

                .empty-comments p {
                    font-size: 0.95rem;
                    color: #6c757d;
                    margin: 0;
                }

                .loading-more {
                    display: flex;
                    justify-content: center;
                    padding: 16px 0;
                }

                .load-more-btn {
                    background: none;
                    border: 1px solid #e0e0e0;
                    color: #4a6cf7;
                    font-size: 0.9rem;
                    font-weight: 500;
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 8px;
                    transition: all 0.2s ease;
                }

                .load-more-btn:hover {
                    background: #f0f2ff;
                    border-color: #4a6cf7;
                }

                .comment-form {
                    margin-top: 16px;
                }

                .comment-input-row {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .comment-input {
                    flex: 1;
                    border: 1px solid #e0e0e0;
                    border-radius: 24px;
                    padding: 10px 16px;
                    font-size: 14px;
                    background: #f8f9fa;
                    transition: all 0.2s ease;
                }

                .comment-input:focus {
                    background: #fff;
                    border-color: #4a6cf7;
                    box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
                    outline: none;
                }

                .comment-send-btn {
                    background: #4a6cf7;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .comment-send-btn:hover:not(:disabled) {
                    background: #3a5bd9;
                    transform: scale(1.05);
                }

                .comment-send-btn:disabled {
                    background: #c0c0c0;
                    cursor: not-allowed;
                }

                .replying-to {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #6c757d;
                    margin-top: 8px;
                    padding: 4px 12px;
                    background: #f8f9fa;
                    border-radius: 12px;
                    width: fit-content;
                }

                .cancel-reply {
                    background: none;
                    border: none;
                    color: #4a6cf7;
                    font-size: 0.85rem;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 8px;
                }

                .cancel-reply:hover {
                    text-decoration: underline;
                }

                @media (max-width: 576px) {
                    .comment-section-container {
                        padding: 12px;
                    }

                    .comments-list-container {
                        min-height: 120px;
                    }

                    .empty-comments {
                        padding: 30px 12px;
                    }

                    .empty-comments-icon {
                        font-size: 2rem;
                    }

                    .comment-input {
                        font-size: 13px;
                    }
                }
            `}</style>
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
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        setIsLiked((comment.likes || []).includes(currentUserId));
    }, [comment.likes, currentUserId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

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
            <div className="comment-content-wrapper">
                <div className="comment-content">
                    <div className="comment-header">
                        <div className="comment-author">{comment.authorName}</div>
                        <div className="comment-actions" ref={dropdownRef}>
                            <button
                                ref={buttonRef}
                                className="action-menu"
                                onClick={toggleDropdown}
                            >
                                <FaEllipsisH />
                            </button>
                            
                            {showDropdown && (
                                <div className="dropdown-menu show">
                                    <button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReply();
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FaReply className="icon" /> Répondre
                                    </button>
                                    {isOwn && (
                                        <>
                                            <button
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit();
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <FaEdit className="icon" /> Modifier
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete();
                                                    setShowDropdown(false);
                                                }}
                                            >
                                                <FaTrash className="icon" /> Supprimer
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
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
                </div>

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
                .comment-item {
                    display: flex;
                    margin-bottom: 16px;
                    padding: 12px;
                    border-radius: 12px;
                    background: #fff;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s ease;
                    position: relative;
                }

                .comment-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0; /* Empêche le débordement */
                }

                .comment-content {
                    flex: 1;
                }

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 6px;
                    position: relative;
                }

                .comment-author {
                    font-weight: 600;
                    color: #343a40;
                    font-size: 0.95rem;
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .comment-actions {
                    position: relative;
                    margin-left: 8px;
                }

                .action-menu {
                    background: none;
                    border: none;
                    color: #adb5bd;
                    cursor: pointer;
                    padding: 4px;
                    font-size: 1rem;
                    transition: all 0.2s;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                }

                .action-menu:hover {
                    background: #f8f9fa;
                    color: #495057;
                }

                .dropdown-menu {
                    position: absolute;
                    right: 0;
                    top: 100%;
                    z-index: 1000;
                    min-width: 180px;
                    padding: 8px 0;
                    margin-top: 4px;
                    font-size: 0.9rem;
                    color: #212529;
                    text-align: left;
                    list-style: none;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid rgba(0, 0, 0, 0.15);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 8px 16px;
                    clear: both;
                    font-weight: 400;
                    color: #212529;
                    text-align: inherit;
                    white-space: nowrap;
                    background-color: transparent;
                    border: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .dropdown-item:hover {
                    background-color: #f8f9fa;
                    color: #16181b;
                }

                .dropdown-item .icon {
                    margin-right: 8px;
                    width: 16px;
                    text-align: center;
                }

                /* Couleurs des icônes */
                .dropdown-item:nth-child(1) .icon { color: #4a6cf7; }
                .dropdown-item:nth-child(2) .icon { color: #ffc107; }
                .dropdown-item:nth-child(3) .icon { color: #dc3545; }

                .reply-mention {
                    font-size: 0.8rem;
                    color: #6c757d;
                    margin-bottom: 4px;
                    padding: 2px 8px;
                    background: #f8f9fa;
                    border-radius: 10px;
                    display: inline-block;
                }

                .comment-text {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    color: #212529;
                    margin-bottom: 8px;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .comment-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }

                .comment-meta {
                    font-size: 0.8rem;
                    color: #868e96;
                }

                .comment-time {
                    display: flex;
                    align-items: center;
                }

                .edited {
                    font-style: italic;
                    margin-left: 4px;
                }

                .comment-interactions {
                    display: flex;
                    gap: 12px;
                }

                .like-btn, .reply-btn {
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                    padding: 4px 8px;
                    border-radius: 16px;
                }

                .like-btn:hover, .reply-btn:hover {
                    background: #f8f9fa;
                    color: #495057;
                }

                .like-btn.liked {
                    color: #e74c3c;
                }

                .like-btn.liked:hover {
                    background: #fee5e3;
                }


                .edit-form {
                    margin-bottom: 10px;
                }

                .edit-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    margin-bottom: 8px;
                    transition: all 0.2s ease;
                }

                .edit-input:focus {
                    outline: none;
                    border-color: #4a6cf7;
                    box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
                }

                .edit-actions {
                    display: flex;
                    gap: 8px;
                }

                .save-btn, .cancel-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
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
                    border: 1px solid #ced4da;
                    color: #6c757d;
                }

                .cancel-btn:hover {
                    background: #f8f9fa;
                }

                @media (max-width: 576px) {
                    .comment-item {
                        padding: 10px;
                    }

                    .comment-item.reply {
                        margin-left: 20px;
                    }

                    .comment-text {
                        font-size: 0.9rem;
                    }

                    .comment-author {
                        font-size: 0.9rem;
                    }

                    .comment-meta {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
});

export default CommentSection;