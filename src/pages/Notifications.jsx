import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationsList from '../components/NotificationsList';


const Notifications = () => {
  const { markAllAsRead, unreadCount } = useNotifications();
  
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications</h2>
        {unreadCount > 0 && (
          <button 
            className="btn btn-outline-primary btn-sm" 
            onClick={markAllAsRead}
          >
            Marquer tout comme lu
          </button>
        )}
      </div>
      
      <div className="row">
        <div className="col-md-8 mx-auto">
          <NotificationsList showHeader={false} />
        </div>
      </div>
    </div>
  );
};

export default Notifications;