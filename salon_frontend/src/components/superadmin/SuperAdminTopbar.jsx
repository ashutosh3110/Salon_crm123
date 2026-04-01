import { Menu, Bell, Moon, Sun, LogOut, Check, X, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function SuperAdminTopbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { 
        notifications, unreadCount, markAsRead, markAllRead, 
        fetchNotifications, fetchUnreadCount 
    } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Listen for real-time notification events from FCM
    useEffect(() => {
        const handleNewNotif = () => {
            console.log('[Topbar] Refreshing notifications due to new push');
            fetchNotifications();
            fetchUnreadCount();
        };
        window.addEventListener('notification_received', handleNewNotif);
        return () => window.removeEventListener('notification_received', handleNewNotif);
    }, [fetchNotifications, fetchUnreadCount]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown when navigation happens
    useEffect(() => {
        setShowNotifications(false);
    }, [location.pathname]);

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) {
            await markAsRead(notif._id);
        }
        if (notif.actionUrl) {
            navigate(notif.actionUrl);
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-border/40">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                    >
                        <Menu className="w-5 h-5 text-text-secondary" />
                    </button>
                    <span className="text-sm font-medium text-text-secondary hidden sm:block italic">Wapixo Super Admin</span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-xl bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5 text-text-secondary" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-400" />
                        )}
                    </motion.button>

                    {/* Notifications Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative border border-border/40 ${
                                showNotifications ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface dark:bg-surface-alt text-text-secondary hover:bg-surface-alt'
                            }`}
                        >
                            <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? 'animate-bounce-slow' : ''}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white dark:ring-surface shadow-lg">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden focus:outline-none"
                                >
                                    <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between">
                                        <h3 className="text-sm font-black text-text uppercase tracking-widest italic">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={markAllRead}
                                                className="text-[10px] font-bold text-primary hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-[70vh] overflow-y-auto sa-panel-scroll">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
                                                    <Bell className="w-6 h-6 text-text-muted opacity-20" />
                                                </div>
                                                <p className="text-xs font-semibold text-text-muted">No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border/40">
                                                {notifications.map((notif) => (
                                                    <div 
                                                        key={notif._id}
                                                        onClick={() => handleNotifClick(notif)}
                                                        className={`p-4 hover:bg-surface-alt transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                                notif.type === 'inquiry_new' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                                <Clock className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={`text-sm font-bold truncate ${!notif.isRead ? 'text-text' : 'text-text-secondary'}`}>
                                                                        {notif.title}
                                                                    </p>
                                                                    {!notif.isRead && (
                                                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                                                                    {notif.body}
                                                                </p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                                    </span>
                                                                    {notif.actionUrl && (
                                                                        <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 border-t border-border bg-surface/50 text-center">
                                        <button 
                                            onClick={() => navigate('/superadmin/inquiries')}
                                            className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
                                        >
                                            View All Central Log
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 pl-3 border-l border-border/40 ml-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/20">
                            SA
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-medium text-text leading-none">{user?.name || 'Super Admin'}</div>
                            <div className="text-[11px] text-text-muted mt-0.5">superadmin</div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="w-10 h-10 rounded-xl bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-rose-500/10 transition-colors border border-border/40 group"
                        title="Logout"
                    >
                        <LogOut className="w-4.5 h-4.5 text-text-secondary group-hover:text-rose-500" />
                    </button>
                </div>
            </div>
        </header>
    );
}
