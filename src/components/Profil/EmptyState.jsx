const EmptyState = ({ isCurrentUser, onAddPublication }) => {
  return (
    <div className="empty-state text-center py-5">
      <div className="empty-icon mb-3">
        <i className="bi bi-file-earmark-text display-4 text-muted"></i>
      </div>
      <h5 className="mb-3">
        {isCurrentUser ? "Vous n'avez pas encore de publications" : "Aucune publication disponible"}
      </h5>
      <p className="text-muted mb-4">
        {isCurrentUser 
          ? "Partagez vos idées, projets ou réflexions avec votre réseau." 
          : "Cet utilisateur n'a pas encore partagé de publications."}
      </p>
      {!isCurrentUser && (
        <button 
          onClick={onAddPublication}
          className="btn btn-primary"
        >
          Créer votre première publication
        </button>
      )}
    </div>
  );
};

export default EmptyState;