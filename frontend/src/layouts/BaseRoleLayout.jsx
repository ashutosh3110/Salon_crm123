import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, Search, Bell, LogOut, CheckCircle2, AlertTriangle, Info, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Handle outside click to close notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { theme, toggleTheme } = useTheme();
    const activeAccentColor = accentColor === 'var(--color-primary)' ? 'var(--color-primary)' : accentColor;

    const effectiveCollapsed = collapsed && !isHovered;

    return (
        <div
            className="min-h-screen bg-background flex text-text transition-colors duration-300 admin-panel overflow-x-hidden"
            style={{ '--accent-color': activeAccentColor }}
        >
            {/* Global sharp-edge override for entire panel, with opt-out for pill toggles and consistent primary buttons */}
            <style>{`
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after {
                    border-radius: 0 !important;
                    font-family: 'Open Sans', sans-serif;
                }
                .admin-panel .pill-toggle,
                .admin-panel .pill-toggle * {
                    border-radius: 9999px !important;
                }
                .admin-panel button.bg-primary,
                .admin-panel a.bg-primary {
                    color: var(--primary-foreground) !important;
                }
                .admin-panel h1, 
                .admin-panel h2, 
                .admin-panel h3, 
                .admin-panel h4, 
                .admin-panel h5, 
                .admin-panel h6,
                .admin-panel .font-serif {
                    font-family: 'Libre Baskerville', 'Noto Serif', serif !important;
                }
                .admin-panel .font-sans {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>
            {/* Sidebar */}
            <SidebarComponent
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                accentColor={activeAccentColor}
            />

            {/* Main Content */}
            <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 sm:h-20 bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sm:px-8 gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-11 h-11 bg-surface border border-border/40 flex items-center justify-center hover:bg-surface-alt transition-all shadow-sm active:scale-95"
                        >
                            <Menu className="w-5.5 h-5.5 text-text" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40 leading-none mb-1">Sector_Control</h2>
                            <p className="text-xs font-black text-text uppercase tracking-widest leading-none">{title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 font-black">
                        {/* Theme Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="w-10 h-10 sm:w-11 sm:h-11 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-text-secondary" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-400" />
                            )}
                        </motion.button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all border border-border/40 ${showNotifications ? 'bg-primary text-white' : 'bg-surface dark:bg-surface-alt hover:bg-surface-alt text-text-secondary'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 ring-2 ${showNotifications ? 'ring-primary' : 'ring-background dark:ring-surface'}`} />
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-surface dark:bg-surface-alt border border-border/40 shadow-2xl z-50 overflow-hidden"
                                    >
                                        {/* Dropdown Header */}
                                        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-surface-alt/30">
                                            <div>
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-1">Incoming_Feed</h3>
                                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{unreadCount} Unread Alerts</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={markAllRead}
                                                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                                >
                                                    Clear_All
                                                </button>
                                                <button onClick={() => setShowNotifications(false)} className="hover:rotate-90 transition-all ml-1">
                                                    <X className="w-4 h-4 text-text-secondary" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dropdown List */}
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-1">
                                            {notifications.length === 0 ? (
                                                <div className="py-12 px-8 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center mx-auto mb-4">
                                                        <Bell className="w-5 h-5 text-text-muted opacity-30" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No Recent Notifications Found In Sector</p>
                                                </div>
                                            ) : notifications.map((n) => (
                                                <div 
                                                    key={n._id} 
                                                    onClick={() => {
                                                        if (!n.isRead) markAsRead(n._id);
                                                    }}
                                                    className={`px-5 py-4 hover:bg-surface-alt/50 transition-colors border-b border-border/10 last:border-0 group cursor-pointer ${!n.isRead ? 'bg-primary/[0.02]' : 'opacity-60'}`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`mt-1 w-8 h-8 flex items-center justify-center border ${
                                                            n.type?.includes('warning') || n.type?.includes('low') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                            n.type?.includes('confirm') || n.type?.includes('success') || n.type?.includes('payment') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                            'bg-primary/10 border-primary/20 text-primary'
                                                        }`}>
                                                            {!n.isRead && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 border-2 border-surface" />}
                                                            {n.type?.includes('warning') || n.type?.includes('low') ? <AlertTriangle className="w-4 h-4" /> :
                                                             n.type?.includes('confirm') || n.type?.includes('success') || n.type?.includes('payment') ? <CheckCircle2 className="w-4 h-4" /> :
                                                             <Info className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className={`text-[11px] font-black uppercase tracking-tight text-text transition-colors ${!n.isRead ? 'group-hover:text-primary' : 'text-text-muted'}`}>{n.title}</h4>
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-text-muted">
                                                                    <Clock className="w-2.5 h-2.5" /> 
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[10px] leading-normal font-bold ${!n.isRead ? 'text-text-secondary' : 'text-text-muted'}`}>
                                                                {n.body}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Dropdown Footer */}
                                        <button className="w-full py-3.5 bg-surface-alt/30 hover:bg-primary hover:text-white transition-all text-center text-[10px] font-black uppercase tracking-[0.2em] border-t border-border/40">
                                            View_Full_Dashboard →
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-3 sm:pl-4 ml-1 sm:ml-2 border-l border-border/40">
                            <div className="text-right hidden md:block leading-none">
                                <div className="text-[11px] font-black text-text uppercase tracking-tight">{user?.name || 'Auth_User'}</div>
                                <div className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">{user?.role || 'operator'}</div>
                            </div>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-inner">
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'AU'}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="w-10 h-10 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-rose-500/10 group transition-colors border border-border/40 ml-1"
                            title="Logout"
                        >
                            <LogOut className="w-4.5 h-4.5 text-text-secondary group-hover:text-rose-500" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full max-w-full p-3 sm:p-5 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div >
    );
}
