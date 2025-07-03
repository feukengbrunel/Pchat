if (typeof importScripts === 'function') {
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
}

if (typeof firebase !== 'undefined') {
  firebase.initializeApp({
    apiKey: "AIzaSyA1X0HXDNcuCoBvAfkvJ8k01W4KOMdOL1w",
    authDomain: "chat-59eb8.firebaseapp.com",
    projectId: "chat-59eb8",
    storageBucket: "chat-59eb8.appspot.com", 
    messagingSenderId: "476007444986",
    appId: "1:476007444986:web:7993b78dc4a49af7f5b443",
    measurementId: "G-281X7SVTD1"
  });
} else {
  console.error('Firebase SDK not loaded.');
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  if (!payload.notification) return;

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/badge-icon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Sécurise l'accès à data et à l'URL
  let urlToOpen = '/';
  if (event.notification && event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});