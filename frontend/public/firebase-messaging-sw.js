importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyD6SHK44FTvxRUiRFUiutVO6EVuw2HIzd0",
    authDomain: "saloon-crm-baff4.firebaseapp.com",
    projectId: "saloon-crm-baff4",
    storageBucket: "saloon-crm-baff4.firebasestorage.app",
    messagingSenderId: "606405940224",
    appId: "1:606405940224:web:c6146f937bd707c46c34e5"
  });

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // If the payload already has a 'notification' object, the FCM SDK displays it automatically.
  // We do not need to show it manually to avoid duplicate notifications.
  if (payload.notification) {
    return;
  }

  // Handle data-only messages manually if needed
  if (payload.data) {
    const notificationTitle = payload.data.title || 'New Notification';
    const notificationOptions = {
      body: payload.data.body || payload.data.message || '',
      icon: payload.data.image || '/logo192.png',
      data: payload.data
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
