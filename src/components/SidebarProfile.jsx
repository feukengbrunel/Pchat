const SidebarProfile = ({ user }) => (
  <div className="card shadow-sm mb-4">
    <div className="card-body d-flex align-items-center">
      <div
        className="avatar avatar-image me-3"
        style={{ width: '60px', height: '60px' }}
      >
        <img src="/assets/images/avatars/thumb-3.jpg" alt="Profile" className="rounded-circle" />
      </div>
      <div>
        <h5 className="mb-0">{user?.displayName || "Brûnél"}</h5>
        <small className="text-muted">Membre</small>
      </div>
    </div>
  </div>
);

export default SidebarProfile;
