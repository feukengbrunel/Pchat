import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

class NotificationService {
  constructor() {
    this.messaging = null;
    this.initialized = false;
    this.tokenRefreshCallback = null;
    this.notificationReceivedCallback = null;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Vérifier si le navigateur prend en charge les notifications
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne prend pas en charge les notifications desktop");
        return;
      }

      // Demander la permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Permission de notification non accordée");
        return;
      }

      // Initialiser Firebase Messaging
      const messaging = getMessaging();
      this.messaging = messaging;

      // Obtenir le token FCM
      const currentToken = await getToken(messaging, {
        vapidKey: "BFBBISpawRsw8w1j48hnq4hE7g2-J0rk-d7vAhZ-Fl-P7ObTPmcunm6RXoKWPVVLTSDby58Bjz-KcpjiisH_WEg" // Remplacez par votre clé VAPID publique
      });

      if (currentToken) {
        console.log("Token FCM obtenu:", currentToken);
        await this.saveTokenToDatabase(currentToken);
      } else {
        console.log("Impossible d'obtenir le token. Demandez la permission d'envoyer des notifications.");
      }

      // Écouter les messages en premier plan
      onMessage(messaging, (payload) => {
        console.log("Message reçu en premier plan:", payload);
        this.showNotification(payload);
        if (this.notificationReceivedCallback) {
          this.notificationReceivedCallback(payload);
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error("Erreur lors de l'initialisation des notifications:", error);
    }
  }

  async saveTokenToDatabase(token) {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);

    try {
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Mettre à jour le document utilisateur existant
        const userData = userDoc.data();
        const tokens = userData.fcmTokens || [];
        
        // Vérifier si le token existe déjà
        if (!tokens.includes(token)) {
          tokens.push(token);
          await updateDoc(userRef, { fcmTokens: tokens });
        }
      } else {
        // Créer un nouveau document utilisateur
        await setDoc(userRef, {
          fcmTokens: [token]
        }, { merge: true });
      }
      
      console.log("Token FCM enregistré dans la base de données");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du token FCM:", error);
    }
  }

  showNotification(payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo192.png',
      badge: '/badge-icon.png',
      data: payload.data
    };

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
    } else {
      // Fallback pour les navigateurs qui ne prennent pas en charge les service workers
      new Notification(notificationTitle, notificationOptions);
    }
  }

  onTokenRefresh(callback) {
    this.tokenRefreshCallback = callback;
  }

  onNotificationReceived(callback) {
    this.notificationReceivedCallback = callback;
  }
}

export default new NotificationService();