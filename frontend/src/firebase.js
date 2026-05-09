import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBCuITeN78JfjIJSZ2Gnz2-93bDMZRaKYU",
  authDomain: "salon-crm-d6c9e.firebaseapp.com",
  projectId: "salon-crm-d6c9e",
  storageBucket: "salon-crm-d6c9e.firebasestorage.app",
  messagingSenderId: "813696718753",
  appId: "1:813696718753:web:1f642f3d3efb36b7375de0",
  measurementId: "G-45PTVVHT5X"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: "BNLLMYHhpoGyPv8w-EWLCnNSaDXIiBYoMNky3dyzTLDjksUjnLUSCoFv9qvqf-J2--E_twkOHEia7WVNcRHZu5o"
      });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Payload received:", payload);
      resolve(payload);
    });
  });

export default app;
