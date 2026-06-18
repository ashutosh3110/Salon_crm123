import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Tag, Shield, CheckCircle2, Trash2, CheckCircle, Package, Star, ChevronLeft, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS = {
    booking_confirmed: Calendar,
    booking_new: Calendar,
    booking_cancelled: Calendar,
    offer: Tag,
    shop_order: Package,
    loyalty: Star,
    security: Shield,
    default: Bell
};

const NOTIFICATION_COLORS = {
    booking_confirmed: 'text-emerald-500 dark:text-emerald-400',
    booking_new: 'text-blue-500 dark:text-blue-400',
    booking_cancelled: 'text-rose-500 dark:text-rose-400',
    offer: 'text-amber-500 dark:text-amber-400',
    shop_order: 'text-indigo-500 dark:text-indigo-400',
    loyalty: 'text-[#C8956C]',
    security: 'text-rose-500 dark:text-rose-400',
    default: 'text-text-muted'
};

const NOTIFICATION_ROUTES = {
    booking_confirmed: '/app/bookings',
    booking_new: '/app/bookings',
    booking_cancelled: '/app/bookings',
    offer: '/app/services',
    shop_order: '/app/shop',
    loyalty: '/app/wallet',
};

const NotificationCard = ({ notification, onRead, onDelete, colors, isLight, onNavigate }) => {
    const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
    const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
    const route = NOTIFICATION_ROUTES[notification.type];

    const handleCardClick = () => {
        if (!notification.isRead) onRead(notification._id);
        if (route) onNavigate(route);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={handleCardClick}
            style={{
                background: colors.card,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                marginBottom: '8px',
                overflow: 'hidden',
                position: 'relative',
                cursor: route ? 'pointer' : 'default',
            }}
            className="group"
        >
            {!notification.isRead && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: '#C8956C' }} />
            )}

            <div className="p-3 flex gap-3">
                <Icon className={`w-6 h-6 shrink-0 ${colorClass}`} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-[10px] font-black uppercase tracking-wider truncate" style={{ color: colors.text }}>
                            {notification.title}
                        </h3>
                        <span className="text-[8px] font-bold opacity-40 shrink-0 uppercase tracking-tighter" style={{ color: colors.textMuted }}>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    <p className="text-[9px] font-medium leading-tight opacity-70" style={{ color: colors.text }}>
                        {notification.message || notification.body}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                        {!notification.isRead ? (
                            <button
                                onClick={() => onRead(notification._id)}
                                className="flex items-center gap-1 text-[8px] font-black text-[#C8956C] uppercase tracking-widest hover:opacity-80 transition-opacity"
                            >
                                <CheckCircle2 className="w-3 h-3" /> Mark read
                            </button>
                        ) : <div />}
                        <button
                            onClick={() => onDelete(notification._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3 text-rose-500/50 hover:text-rose-500" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function AppNotificationPage() {
    const { 
        notifications, unreadCount, markAsRead, markAllRead, 
        deleteNotification, loading 
    } = useNotifications();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FFFFFF' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#161616',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)',
    };

    return (
        <div className="pb-24 min-h-screen" style={{ background: colors.bg }}>
            {/* Standard App Header */}
            <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: colors.bg, position: 'relative' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: '16px', color: colors.text }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '700', color: colors.text, margin: 0 }}>Notifications</h1>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllRead}
                        style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        className={`transition-all ${unreadCount > 0 ? 'text-[#C8956C]' : 'opacity-20 pointer-events-none'}`}
                    >
                        <CheckCircle size={20} />
                    </button>
                )}
            </div>

            {/* List */}
            <div className="px-3 max-w-lg mx-auto">
                {loading ? (
                    <div className="py-24 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 border-2 border-[#C8956C] border-t-transparent rounded-full mx-auto"
                        />
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <NotificationCard
                                    key={n._id}
                                    notification={n}
                                    onRead={markAsRead}
                                    onDelete={deleteNotification}
                                    colors={colors}
                                    isLight={isLight}
                                    onNavigate={navigate}
                                />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 flex flex-col items-center text-center space-y-4"
                            >
                                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-black/5">
                                    <Bell className="w-6 h-6 opacity-10" style={{ color: colors.text }} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>Silent Boutique</h3>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: colors.textMuted }}>Your timeline is momentarily still.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
