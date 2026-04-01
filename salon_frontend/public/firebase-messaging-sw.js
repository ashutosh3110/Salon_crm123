// Scripts for firebase and firebase messaging (using modern compat version)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 1. Force the Service Worker to update and take control immediately
self.addEventListener('install', () => {
    console.log('[SW] Installing new version and skipping waiting...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activated. Overwriting old controllers...');
    event.waitUntil(clients.claim());
});

// Initialize the Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyD6SHK44FTvxRUiRFUiutVO6EVuw2HIzd0",
  authDomain: "saloon-crm-baff4.firebaseapp.com",
  projectId: "saloon-crm-baff4",
  storageBucket: "saloon-crm-baff4.firebasestorage.app",
  messagingSenderId: "606405940224",
  appId: "1:606405940224:web:c6146f937bd707c46c34e5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ─── NATIVE PUSH FALLBACK ───
// This ensures notifications SHOW even if the Firebase wrapper is sleeping
self.addEventListener('push', (event) => {
  console.log('[SW] Native Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', payload);
      
      const { title, body } = payload.notification || {};
      const notificationTitle = title || 'New Notification';
      const notificationOptions = {
        body: body || 'New update from Salon CRM',
        icon: '/icon.png',
        badge: '/icon.png',
        data: payload.data || {}
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (e) {
      console.error('[SW] Push payload error (non-JSON or missing data):', e);
    }
  }
});

// Handle background messages via Firebase wrapper (keeping it as backup)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Firebase background message:', payload);
  // We handle it in the native push listener above for better reliability
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Action URL from the data payload
  const actionUrl = event.notification.data?.actionUrl || '/superadmin';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a match is found, focus it
      for (const client of windowClients) {
        if (client.url.includes(actionUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});
