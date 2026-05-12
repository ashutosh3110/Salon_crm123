import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import api from './api';

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

// Initialize messaging as null, will be set if supported
let messaging = null;

// Function to safely get messaging instance
const getMessagingInstance = async () => {
  if (messaging) return messaging;
  if (await isSupported()) {
    messaging = getMessaging(app);
    return messaging;
  }
  return null;
};

/**
 * Register FCM token with backend
 */
export const registerToken = async () => {
  try {
    const msg = await getMessagingInstance();
    if (!msg) {
      console.warn('[Firebase] Messaging is not supported in this environment (e.g. Mobile WebView)');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[Firebase] Service Workers not supported');
      return null;
    }

    // 1. Explicitly register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;

    // 2. Get the FCM token
    const token = await getToken(msg, { 
      vapidKey,
      serviceWorkerRegistration: registration 
    });
    
    if (token) {
      // Advanced device detection
      let platform = 'web';
      const ua = navigator.userAgent.toLowerCase();
      
      const isTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      const isMobileSize = window.innerWidth <= 768;

      if (/android/.test(ua)) {
        platform = 'app';
      } else if (/ipad|iphone|ipod/.test(ua) || (isTouch && /macintosh/.test(ua))) {
        platform = 'ios'; // iPadOS 13+ reports as Macintosh
      } else if (isTouch && isMobileSize) {
        platform = 'mobile'; // Generic mobile fallback
      }

      console.log(`[Firebase] Detected platform: ${platform} (UA: ${ua})`);

      // Register token with backend
      await api.post('/notifications/register-token', { fcmToken: token, platform });
      localStorage.setItem('fcm_token', token);
      localStorage.setItem('fcm_platform', platform);
      return token;
    } else {
      console.warn('[Firebase] No registration token available.');
      return null;
    }
  } catch (err) {
    console.error('[Firebase] Token registration error:', err.message);
    return null;
  }
};

/**
 * Handle incoming foreground messages
 */
export const onMessageListener = async () => {
  const msg = await getMessagingInstance();
  if (!msg) return null;

  return new Promise((resolve) => {
    onMessage(msg, (payload) => {
      resolve(payload);
    });
  });
};

export default messaging;
