// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// Use the values from your frontend .env
firebase.initializeApp({
  apiKey: "AIzaSyBCuITeN78JfjIJSZ2Gnz2-93bDMZRaKYU",
  authDomain: "salon-crm-d6c9e.firebaseapp.com",
  projectId: "salon-crm-d6c9e",
  storageBucket: "salon-crm-d6c9e.firebasestorage.app",
  messagingSenderId: "813696718753",
  appId: "1:813696718753:web:1f642f3d3efb36b7375de0"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.data?.icon || '/icon.png',
    badge: '/icon.png',
    tag: payload.data?.type || 'general',
    data: {
      url: payload.data?.actionUrl || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
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
