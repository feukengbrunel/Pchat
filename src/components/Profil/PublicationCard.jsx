import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const PublicationCard = ({ publication, isCurrentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(publication.likes);
  const [showOptions, setShowOptions] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    
  };

  return (
    <article className="card mb-4 publication-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">{publication.title}</h5>
            <small className="text-muted">
              {formatDistanceToNow(new Date(publication.createdAt), { addSuffix: true, locale: fr })}
            </small>
          </div>
          
          {isCurrentUser && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-link text-muted"
                onClick={() => setShowOptions(!showOptions)}
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              
              {showOptions && (
                <div className="dropdown-menu show">
                  <button className="dropdown-item">Modifier</button>
                  <button className="dropdown-item text-danger">Supprimer</button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <p className="card-text my-3">{publication.content}</p>
        
        {publication.image && (
          <div className="publication-image mb-3">
            <img 
              src={publication.image} 
              alt={publication.title} 
              className="img-fluid rounded"
            />
          </div>
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="tags-container">
            {publication.tags.map(tag => (
              <span key={tag} className="badge bg-light text-dark me-2">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="interactions">
            <button 
              onClick={handleLike}
              className={`btn btn-sm ${isLiked ? 'text-danger' : 'text-muted'}`}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span className="ms-1">{likeCount}</span>
            </button>
            
            <button className="btn btn-sm text-muted ms-3">
              <i className="bi bi-chat"></i>
              <span className="ms-1">{publication.comments}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PublicationCard;