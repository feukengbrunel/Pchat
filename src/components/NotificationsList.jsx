import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaBell, FaEnvelope, FaUserPlus, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';


export default function  NotificationsList ({ maxItems, showHeader = true, onClose })  {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  
  // Limiter le nombre de notifications si maxItems est défini
  const displayedNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <FaEnvelope className="notification-icon text-primary" />;
      case 'FRIEND_REQUEST':
        return <FaUserPlus className="notification-icon text-success" />;
      case 'LIKE':
        return <FaHeart className="notification-icon text-danger" />;
      case 'COMMENT':
        return <FaComment className="notification-icon text-info" />;
      case 'SHARE':
        return <FaShare className="notification-icon text-warning" />;
      default:
        return <FaBell className="notification-icon text-secondary" />;
    }
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="notifications-list">
      {showHeader && (
        <div className="notifications-header">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="m-0">
             Notifications
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">{unreadCount}</span>
              )}
            </h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-link text-muted p-0" 
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="notifications-body">
        {loading ? (
          <div className="text-center py-4">
            <ClipLoader size={30} />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">
              <FaBell />
            </div>
            <p>Aucune notification</p>
          </div>
        ) : (
          displayedNotifications.map(notification => (
            <Link
              key={notification.id}
              to={notification.link || '#'}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon-wrapper">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-text" dangerouslySetInnerHTML={{ __html: notification.content }} />
                <div className="notification-time">
                  {notification.createdAt && format(notification.createdAt, 'PPp', { locale: fr })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      {maxItems && notifications.length > maxItems && (
        <div className="notifications-footer">
          <Link to="/users/notifications" className="view-all" onClick={onClose}>
            Voir toutes les notifications
          </Link>
        </div>
      )}
      
      <style jsx>{`
        .notifications-list {
          width: 100%;
          background: var(--cardBg);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--cardShadow);
        }
        
        .notifications-header {
          padding: var(--space-md);
          border-bottom: 1px solid var(--borderColor);
        }
        
        .notifications-body {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .empty-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          color: var(--textMuted);
        }
        
        .empty-icon {
          font-size: 2rem;
          margin-bottom: var(--space-md);
          opacity: 0.5;
        }
        
        .notification-item {
          display: flex;
          padding: var(--space-md);
          border-bottom: 1px solid var(--borderColor);
          transition: background-color var(--transition-fast);
          text-decoration: none;
          color: var(--bodyText);
        }
        
        .notification-item:hover {
          background-color: var(--inputBg);
        }
        
        .notification-item.unread {
          background-color: rgba(74, 108, 247, 0.05);
        }
        
        .notification-icon-wrapper {
          margin-right: var(--space-md);
          display: flex;
          align-items: flex-start;
        }
        
        .notification-icon {
          font-size: 1.25rem;
        }
        
        .notification-content {
          flex: 1;
        }
        
        .notification-text {
          margin-bottom: 4px;
          font-size: var(--fontSizes-sm);
        }
        
        .notification-time {
          font-size: var(--fontSizes-xs);
          color: var(--textMuted);
        }
        
        .notifications-footer {
          padding: var(--space-md);
          text-align: center;
          border-top: 1px solid var(--borderColor);
        }
        
        .view-all {
          color: var(--primary);
          font-size: var(--fontSizes-sm);
          text-decoration: none;
        }
        
        .view-all:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

