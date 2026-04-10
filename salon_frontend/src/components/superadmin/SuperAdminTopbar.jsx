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
