importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyBCuITeN78JfjIJSZ2Gnz2-93bDMZRaKYU",
    authDomain: "salon-crm-d6c9e.firebaseapp.com",
    projectId: "salon-crm-d6c9e",
    storageBucket: "salon-crm-d6c9e.firebasestorage.app",
    messagingSenderId: "813696718753",
    appId: "1:813696718753:web:1f642f3d3efb36b7375de0"
  });

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
