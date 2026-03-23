import { useEffect, useState } from 'react';
import { onMessage } from 'firebase/messaging';
import messaging, { registerToken } from '../services/firebase';
import { toast } from 'react-hot-toast'; // Assume react-hot-toast is used or similar

/**
 * Custom hook to initialize Firebase Cloud Messaging (FCM) on mount.
 */
export const useFirebaseNotifications = (isAuthenticated) => {
  const [token, setToken] = useState(localStorage.getItem('fcm_token'));

  useEffect(() => {
    // Only register token for authenticated users
    if (!isAuthenticated) return;

    const setupNotifications = async () => {
      try {
        // 1. Request Permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('[useFirebaseNotifications] Permission granted');
          const newToken = await registerToken();
          if (newToken) setToken(newToken);
        } else {
          console.warn('[useFirebaseNotifications] Permission not granted');
        }
      } catch (err) {
        console.error('[useFirebaseNotifications] Setup error:', err.message);
      }
    };

    setupNotifications();

    // 2. Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[useFirebaseNotifications] Foreground Message:', payload);
      
      const { title, body } = payload.notification;
      
      // Customize toast appearance based on theme if needed
      toast.success(
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs opacity-80">{body}</p>
        </div>,
        {
          duration: 6000,
          position: 'top-right',
          // Action for the toast click
          onClick: () => {
             const url = payload.data?.actionUrl || '/';
             window.location.href = url;
          }
        }
      );

      // Trigger a custom event for other components to react (e.g., refresh counts)
      window.dispatchEvent(new CustomEvent('new_notification', { detail: payload }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  return { token };
};

export default useFirebaseNotifications;
