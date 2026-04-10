import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import mockApi from './mock/mockApi';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Register FCM token with backend
 */
export const registerToken = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('[Firebase] Service Workers not supported');
      return null;
    }

    // 1. Explicitly register the service worker
    console.log('[Firebase] Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[Firebase] SW Registered:', registration.scope);

    // 2. Get the FCM token
    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: registration 
    });
    
    if (token) {
      console.log('[Firebase] FCM Token:', token);
      // Register token with backend
      await mockApi.post('/notifications/register-token', { fcmToken: token });
      localStorage.setItem('fcm_token', token);
      return token;
    } else {
      console.warn('[Firebase] No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('[Firebase] Token registration error:', err.message);
    if (err.message.includes('missing-registration')) {
      console.error('[Firebase] Possible Service Worker mismatch or missing file.');
    }
    return null;
  }
};

/**
 * Handle incoming foreground messages
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('[Firebase] Foreground message:', payload);
      resolve(payload);
    });
  });

export default messaging;
