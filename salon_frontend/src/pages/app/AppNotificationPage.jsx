import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Tag, Shield, CheckCircle2, Trash2, CheckCircle, Package, Star, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your appointment for "Executive Haircut" on March 1st at 2:00 PM is confirmed.',
        time: '2 mins ago',
        isRead: false,
        icon: Calendar,
        color: 'text-emerald-500 bg-emerald-50',
    },
    {
        id: 2,
        type: 'offer',
        title: 'Exclusive Offer!',
        message: 'Get 25% OFF on all Spa treatments this weekend. Use code SPA25.',
        time: '1 hour ago',
        isRead: false,
        icon: Tag,
        color: 'text-amber-500 bg-amber-50',
    },
    {
        id: 3,
        type: 'shop',
        title: 'Order Delivered',
        message: 'Your order #ORD-7742 for "L\'Oréal Professional Shampoo" has been delivered.',
        time: '5 hours ago',
        isRead: true,
        icon: Package,
        color: 'text-blue-500 bg-blue-50',
    },
    {
        id: 4,
        type: 'loyalty',
        title: 'Points Earned',
        message: 'You just earned 50 loyalty points from your last visit! Check your wallet.',
        time: 'Yesterday',
        isRead: true,
        icon: Star,
        color: 'text-primary bg-primary/5',
    },
    {
        id: 5,
        type: 'security',
        title: 'New Login',
        message: 'New login detected from a Chrome browser on Windows 11.',
        time: '2 days ago',
        isRead: true,
        icon: Shield,
        color: 'text-rose-500 bg-rose-50',
    }
];

const NotificationCard = ({ notification, onRead, onDelete }) => {
    const Icon = notification.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative group border-b border-border/40 transition-colors ${!notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-white'}`}
        >
            <div className="p-6 flex gap-5">
                <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-none shadow-sm ${notification.color}`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-black uppercase tracking-widest ${!notification.isRead ? 'text-text' : 'text-text-secondary'}`}>
                            {notification.title}
                        </h3>
                        <span className="text-[10px] font-bold text-text-muted uppercase tabular-nums">
                            {notification.time}
                        </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${!notification.isRead ? 'text-text-secondary' : 'text-text-muted'}`}>
                        {notification.message}
                    </p>

                    {!notification.isRead && (
                        <button
                            onClick={() => onRead(notification.id)}
                            className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-dark transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as read
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onDelete(notification.id)}
                        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-rose-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function AppNotificationPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const navigate = useNavigate();

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="pb-32 min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/40 p-6 flex items-center justify-between">
                <div />

                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            className={`w-10 h-10 flex items-center justify-center transition-colors ${unreadCount > 0 ? 'text-primary hover:bg-primary/5' : 'text-text-muted pointer-events-none opacity-30'}`}
                            title="Mark all as read"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={clearAll}
                            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Clear all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="max-w-lg mx-auto">
                <AnimatePresence mode="popLayout">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <NotificationCard
                                key={n.id}
                                notification={n}
                                onRead={markAsRead}
                                onDelete={deleteNotification}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 flex flex-col items-center text-center px-10 space-y-4"
                        >
                            <div className="w-20 h-20 bg-surface-alt flex items-center justify-center text-text-muted">
                                <Bell className="w-10 h-10 opacity-20" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black tracking-tighter uppercase">All Caught Up!</h3>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">No new notifications at the moment.</p>
                            </div>
                            <button
                                onClick={() => navigate('/app/shop')}
                                className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/20"
                            >
                                Continue Shopping
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
