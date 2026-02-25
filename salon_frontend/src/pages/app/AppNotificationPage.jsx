import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Tag, Shield, CheckCircle2, Trash2, CheckCircle, Package, Star, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your appointment for "Executive Haircut" on March 1st at 2:00 PM is confirmed.',
        time: '2 mins ago',
        isRead: false,
        icon: Calendar,
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
        id: 2,
        type: 'offer',
        title: 'Exclusive Offer!',
        message: 'Get 25% OFF on all Spa treatments this weekend. Use code SPA25.',
        time: '1 hour ago',
        isRead: false,
        icon: Tag,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    },
    {
        id: 3,
        type: 'shop',
        title: 'Order Delivered',
        message: 'Your order #ORD-7742 for "L\'Oréal Professional Shampoo" has been delivered.',
        time: '5 hours ago',
        isRead: true,
        icon: Package,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    },
    {
        id: 4,
        type: 'loyalty',
        title: 'Points Earned',
        message: 'You just earned 50 loyalty points from your last visit! Check your wallet.',
        time: 'Yesterday',
        isRead: true,
        icon: Star,
        color: 'text-[#C8956C] bg-[#C8956C]/10 dark:bg-[#C8956C]/10 dark:text-[#C8956C]',
    },
    {
        id: 5,
        type: 'security',
        title: 'New Login',
        message: 'New login detected from a Chrome browser on Windows 11.',
        time: '2 days ago',
        isRead: true,
        icon: Shield,
        color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
    }
];

const NotificationCard = ({ notification, onRead, onDelete, colors, isLight }) => {
    const Icon = notification.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                background: !notification.isRead ? (isLight ? 'rgba(200, 149, 108, 0.05)' : 'rgba(200, 149, 108, 0.08)') : colors.card,
                borderBottom: `1px solid ${colors.border}`,
                borderLeft: !notification.isRead ? '4px solid #C8956C' : '4px solid transparent'
            }}
            className="relative group transition-all duration-300"
        >
            <div className="p-6 flex gap-5">
                <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl shadow-sm ${notification.color}`}>
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-black uppercase tracking-widest leading-none" style={{ color: !notification.isRead ? colors.text : colors.textMuted }}>
                            {notification.title}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest tabular-nums opacity-40" style={{ color: colors.textMuted }}>
                            {notification.time}
                        </span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed" style={{ color: !notification.isRead ? (isLight ? '#444' : 'rgba(255,255,255,0.7)') : colors.textMuted }}>
                        {notification.message}
                    </p>

                    {!notification.isRead && (
                        <button
                            onClick={() => onRead(notification.id)}
                            className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-[#C8956C] uppercase tracking-widest hover:opacity-80 transition-opacity"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark as read
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onDelete(notification.id)}
                        className="w-8 h-8 flex items-center justify-center transition-colors opacity-20 group-hover:opacity-100"
                        style={{ color: colors.textMuted }}
                    >
                        <Trash2 className="w-4 h-4 hover:text-rose-500" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function AppNotificationPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#242424',
    };

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
        <div className="pb-32 min-h-screen" style={{ background: colors.bg }}>
            {/* Header */}
            <div style={{ background: `${colors.bg}cc`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${colors.border}` }} className="sticky top-0 z-50 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} style={{ color: colors.text }} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center active:scale-90 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>
                        Inbox <span className="text-[#C8956C]">{unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                    </h1>
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${unreadCount > 0 ? 'text-[#C8956C]' : 'opacity-20 pointer-events-none'}`}
                            title="Mark all as read"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                            onClick={clearAll}
                            style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
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
                                colors={colors}
                                isLight={isLight}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-32 flex flex-col items-center text-center px-10 space-y-6"
                        >
                            <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-sm">
                                <Bell className="w-10 h-10 opacity-20" style={{ color: colors.text }} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>Silent Mode</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mx-auto max-w-[200px]" style={{ color: colors.textMuted }}>No updates at the moment. You're all caught up with your rituals.</p>
                            </div>
                            <button
                                onClick={() => navigate('/app/shop')}
                                className="px-10 py-4 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#C8956C]/20 rounded-xl active:scale-95 transition-all"
                            >
                                Explorer Boutique
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
