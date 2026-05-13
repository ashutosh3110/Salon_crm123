import React, { useEffect, useState } from 'react';
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
      // Safety check for environments without Notification API (like some mobile WebViews)
      if (typeof Notification === 'undefined') {
        console.warn('[useFirebaseNotifications] Notification API not supported in this environment');
        return;
      }

      const currentPermission = Notification.permission;
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const newToken = await registerToken();
          if (newToken) {
            setToken(newToken);
          }
        }
      } catch (err) {
        console.error('[useFirebaseNotifications] Setup error:', err.message);
      }
    };

    setupNotifications();

    // 2. Listen for foreground messages - only if messaging is supported
    let unsubscribe = null;
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        const { title, body, image } = payload.notification || {};
        
        // Rich Toast notification
        toast.success(
          <div style={{ cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}>
            {image && <img src={image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectCover: 'cover' }} />}
            <div style={{ flex: 1 }}>
              <p className="font-bold text-sm tracking-tight">{title || 'New Notification'}</p>
              <p className="text-xs opacity-75 mt-0.5 line-clamp-2">{body}</p>
              <div className="mt-1 text-[9px] font-bold text-[#C8956C] uppercase tracking-widest">View Details ➔</div>
            </div>
          </div>,
          {
            duration: 8000,
            position: 'top-right',
            id: 'foreground-push-' + Date.now(),
            onClick: () => {
               const url = payload.data?.url || payload.data?.click_action || '/app/notifications';
               window.location.href = url;
            }
          }
        );

        // 3. Trigger a custom event for other components to react
        window.dispatchEvent(new CustomEvent('notification_received', { detail: payload }));
      });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isAuthenticated]);

  return { token };
};

export default useFirebaseNotifications;
