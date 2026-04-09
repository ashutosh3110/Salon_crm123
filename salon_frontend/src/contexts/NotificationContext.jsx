import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import mockApi from '../services/mock/mockApi';
import { useAuth } from './AuthContext';
import { useCustomerAuth } from './CustomerAuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const { customer } = useCustomerAuth();
    
    const activeUserId = user?._id || user?.id || customer?._id || customer?.id;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!activeUserId) return;
        try {
            setLoading(true);
            const res = await mockApi.get('/notifications');
            setNotifications(res.data.results || []);
        } catch (error) {
            console.error('Fetch Notifications Error:', error);
        } finally {
            setLoading(false);
        }
    }, [activeUserId]);

    const fetchUnreadCount = useCallback(async () => {
        if (!activeUserId) return;
        try {
            const res = await mockApi.get('/notifications/unread-count');
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Fetch Unread Count Error:', error);
        }
    }, [activeUserId]);

    const markAsRead = useCallback(async (id) => {
        try {
            await mockApi.patch('/notifications/read', { notificationIds: [id] });
            setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark Read Error:', error);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await mockApi.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark All Read Error:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        try {
            await mockApi.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
            await fetchUnreadCount();
        } catch (error) {
            console.error('Delete Notification Error:', error);
        }
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (activeUserId) {
            fetchNotifications();
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [activeUserId, fetchNotifications, fetchUnreadCount]);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead,
        deleteNotification
    }), [
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead,
        deleteNotification
    ]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}
