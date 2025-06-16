const CommentSkeleton = () => (
  <div className="comment-item skeleton">
    <div className="comment-avatar">
      <div className="skeleton-avatar" />
    </div>
    <div className="comment-content w-100">
      <div className="skeleton-author mb-2" />
      <div className="skeleton-text mb-2" />
      <div className="skeleton-text short" />
    </div>
    <style jsx>{`
      .skeleton {
        opacity: 0.7;
        pointer-events: none;
        background: #f6f7f8;
        animation: skeleton-loading 1.2s infinite linear alternate;
      }
      .skeleton-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e0e0e0;
      }
      .skeleton-author {
        width: 120px;
        height: 14px;
        border-radius: 6px;
        background: #e0e0e0;
      }
      .skeleton-text {
        width: 100%;
        height: 12px;
        border-radius: 6px;
        background: #e0e0e0;
      }
      .skeleton-text.short {
        width: 60%;
      }
      @keyframes skeleton-loading {
        0% { background-color: #e0e0e0; }
        100% { background-color: #f5f5f5; }
      }
    `}</style>
  </div>
);

export default CommentSkeleton;