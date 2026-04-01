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

    // 2. Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      
      // Rich Toast notification
      toast.success(
        <div style={{ cursor: 'pointer' }}>
          <p className="font-bold text-sm tracking-tight">{title || 'New Notification'}</p>
          <p className="text-xs opacity-75 mt-0.5 line-clamp-2">{body}</p>
          <div className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest">Click to View ➔</div>
        </div>,
        {
          duration: 8000,
          position: 'top-right',
          id: 'foreground-push-' + Date.now(),
          onClick: () => {
             const url = payload.data?.actionUrl || '/';
             console.log('[useFirebaseNotifications] Navigating to:', url);
             window.location.href = url;
          }
        }
      );

      // 3. Trigger a custom event for other components to react
      window.dispatchEvent(new CustomEvent('notification_received', { detail: payload }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  return { token };
};

export default useFirebaseNotifications;
