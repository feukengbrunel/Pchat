import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';
import NotificationService from '../services/NotificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Initialiser le service de notification
    NotificationService.init();

    // Écouter les notifications de la base de données
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await db.collection('notifications').doc(notificationId).update({
        read: true
      });
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const batch = db.batch();
      
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = db.collection('notifications').doc(notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};