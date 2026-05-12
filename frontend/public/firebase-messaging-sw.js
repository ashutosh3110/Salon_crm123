importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyD6SHK44FTvxRUiRFUiutVO6EVuw2HIzd0",
    authDomain: "saloon-crm-baff4.firebaseapp.com",
    projectId: "saloon-crm-baff4",
    storageBucket: "saloon-crm-baff4.firebasestorage.app",
    messagingSenderId: "606405940224",
    appId: "1:606405940224:web:c6146f937bd707c46c34e5"
  });
}

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
