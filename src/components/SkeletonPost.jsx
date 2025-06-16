const SkeletonPost = () => (
  <div className="card shadow-sm mb-4 border-0 rounded-lg overflow-hidden">
    <div className="card-body p-4">
      <div className="d-flex align-items-center mb-3">
        <div className="skeleton-avatar me-3"></div>
        <div className="flex-grow-1">
          <div className="skeleton-line mb-2" style={{ width: "40%" }}></div>
          <div className="skeleton-line" style={{ width: "30%" }}></div>
        </div>
      </div>
      <div className="skeleton-line mb-2" style={{ width: "100%", height: "18px" }}></div>
      <div className="skeleton-line mb-2" style={{ width: "90%", height: "18px" }}></div>
      <div className="skeleton-line mb-2" style={{ width: "80%", height: "18px" }}></div>
      <div className="skeleton-line" style={{ width: "60%", height: "18px" }}></div>
    </div>
    <style jsx>{`
      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #e0e0e0;
        animation: pulse 1.5s infinite;
      }
      .skeleton-line {
        height: 12px;
        border-radius: 6px;
        background: #e0e0e0;
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `}</style>
  </div>
);

export default SkeletonPost;