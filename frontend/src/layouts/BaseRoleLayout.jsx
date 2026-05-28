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
            <style>{`
                /* --- Global Theme & Font Assignment --- */
                html {
                    overscroll-behavior-y: none !important;
                }
                
                html:not(.dark) .admin-panel {
                    font-family: 'Inter', sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #000000 !important;
                }
                
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after,
                [role="dialog"] *,
                [role="menu"] *,
                [role="tooltip"] *,
                .fixed.inset-0 * {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                    letter-spacing: -0.01em;
                }

                /* --- Headers & Titles (Completely Clean & Standard) --- */
                html:not(.dark) .admin-panel h1, 
                html:not(.dark) .admin-panel h2, 
                html:not(.dark) .admin-panel h3, 
                html:not(.dark) .admin-panel h4, 
                html:not(.dark) .admin-panel h5, 
                html:not(.dark) .admin-panel h6,
                html:not(.dark) .admin-panel .font-serif,
                html:not(.dark) .admin-panel [class*="font-serif"],
                html:not(.dark) .admin-panel .italic,
                html:not(.dark) .admin-panel [class*="italic"],
                html:not(.dark) [role="dialog"] h1,
                html:not(.dark) [role="dialog"] h2,
                html:not(.dark) [role="dialog"] h3,
                html:not(.dark) [role="dialog"] h4,
                html:not(.dark) [role="dialog"] h5,
                html:not(.dark) [role="dialog"] h6 {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-weight: 800 !important;
                    font-style: normal !important;
                    color: #000000 !important;
                }

                /* --- Spacious & Beautiful Tables --- */
                html:not(.dark) .admin-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                html:not(.dark) .admin-panel table th {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 0.825rem !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                    color: #000000 !important;
                    background-color: #f8fafc !important;
                    padding: 1.2rem 1.5rem !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-align: left;
                }
                html:not(.dark) .admin-panel table td {
                    font-size: 0.95rem !important;
                    padding: 1.35rem 1.5rem !important;
                    color: #000000 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    line-height: 1.5 !important;
                }
                html:not(.dark) .admin-panel table tr {
                    transition: all 0.2s ease-in-out !important;
                }
                html:not(.dark) .admin-panel table tr:hover td {
                    background-color: #f8fafc !important;
                }

                /* --- Form Controls, Inputs & Labels --- */
                html:not(.dark) .admin-panel label {
                    font-size: 0.85rem !important;
                    font-weight: 600 !important;
                    color: #000000 !important;
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                html:not(.dark) .admin-panel input:not(.bg-transparent), 
                html:not(.dark) .admin-panel select:not(.bg-transparent), 
                html:not(.dark) .admin-panel textarea:not(.bg-transparent) {
                    font-size: 0.975rem !important;
                    font-weight: 400 !important;
                    padding: 0.75rem 1rem !important;
                    border-radius: 0.75rem !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #000000 !important;
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                html:not(.dark) .admin-panel input:focus, 
                html:not(.dark) .admin-panel select:focus, 
                html:not(.dark) .admin-panel textarea:focus {
                    border-color: var(--accent-color, #B4912B) !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.12) !important;
                    outline: none !important;
                }

                /* --- Premium Cards --- */
                html:not(.dark) .admin-panel .bg-surface,
                html:not(.dark) .admin-panel .bg-white {
                    background-color: #ffffff !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 1.25rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03) !important;
                }

                /* --- Dynamic & Premium Buttons --- */
                .admin-panel button,
                .admin-panel .inline-flex,
                .admin-panel a[class*="bg-primary"],
                .admin-panel button[class*="bg-primary"] {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    border-radius: 0.75rem !important;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Primary Buttons Dynamic Hover & Accent Styling */
                .admin-panel button.bg-primary,
                .admin-panel a.bg-primary,
                .admin-panel .bg-primary,
                .admin-panel button[type="submit"],
                .admin-panel button[class*="bg-primary"],
                .admin-panel .inline-flex[class*="bg-primary"],
                .admin-panel button:has(svg.lucide-plus) {
                    background: var(--accent-color, #000000) !important;
                    color: #ffffff !important;
                    border: 1px solid var(--accent-color, #000000) !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
                }
                .admin-panel button.bg-primary:hover,
                .admin-panel a.bg-primary:hover,
                .admin-panel .bg-primary:hover,
                .admin-panel button[type="submit"]:hover,
                .admin-panel button[class*="bg-primary"]:hover,
                .admin-panel .inline-flex[class*="bg-primary"]:hover,
                .admin-panel button:has(svg.lucide-plus):hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1.5px) !important;
                }

                /* Target Light Mode Secondary, Outline & Text Buttons */
                html:not(.dark) .admin-panel button.bg-secondary:not(aside *),
                html:not(.dark) .admin-panel button.border:not(aside *),
                html:not(.dark) .admin-panel a.border:not(aside *),
                html:not(.dark) .admin-panel button[class*="border-"]:not(aside *),
                html:not(.dark) .admin-panel button[class*="bg-white"]:not(aside *),
                html:not(.dark) .admin-panel button.bg-white:not(aside *),
                html:not(.dark) .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                html:not(.dark) .admin-panel button:has(svg.lucide-eye):not(aside *),
                html:not(.dark) .admin-panel button:has(svg.lucide-edit):not(aside *) {
                    background-color: #ffffff !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #000000 !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
                }
                html:not(.dark) .admin-panel button.bg-secondary:not(aside *):hover,
                html:not(.dark) .admin-panel button.border:not(aside *):hover,
                html:not(.dark) .admin-panel a.border:not(aside *):hover,
                html:not(.dark) .admin-panel button[class*="border-"]:not(aside *):hover,
                html:not(.dark) .admin-panel button[class*="bg-white"]:not(aside *):hover,
                html:not(.dark) .admin-panel button.bg-white:not(aside *):hover,
                html:not(.dark) .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover,
                html:not(.dark) .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                html:not(.dark) .admin-panel button:has(svg.lucide-edit):not(aside *):hover {
                    background-color: #f8fafc !important;
                    border-color: #e6e8bff!important;
                    color: #0f172a !important;
                    transform: translateY(-1px) !important;
                }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
                   ========================================== */
                .dark .admin-panel {
                    background-color: #121826 !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel .bg-white,
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-background,
                .dark .admin-panel .bg-slate-50,
                .dark .admin-panel [class*="bg-white"],
                .dark .admin-panel [class*="bg-surface"],
                .dark .admin-panel [class*="bg-background"],
                .dark .admin-panel [class*="bg-slate-50"] {
                    background-color: #1e293b !important;
                }
                .dark .admin-panel input:not(.bg-transparent), 
                .dark .admin-panel select:not(.bg-transparent), 
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #ffffff !important;
                }
                .dark .admin-panel label {
                    color: #e6e8bff!important;
                }
                .dark .admin-panel table th {
                    background-color: #121826 !important;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
                    color: #e6e8bff!important;
                }
                .dark .admin-panel table td {
                    color: #cbd5e1 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                }
                .dark .admin-panel table tr:hover td {
                    background-color: #121826 !important;
                }

                /* Secondary/Outline Buttons in Dark Mode */
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button[class*="border-"]:not(aside *),
                .dark .admin-panel button[class*="bg-white"]:not(aside *),
                .dark .admin-panel button.bg-white:not(aside *),
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *),
                .dark .admin-panel button:has(svg.lucide-plus):not(.bg-primary):not([class*="bg-primary"]):not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .admin-panel button[class*="border-"]:not(aside *):hover,
                .dark .admin-panel button[class*="bg-white"]:not(aside *):hover,
                .dark .admin-panel button.bg-white:not(aside *):hover,
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
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
                                                        <div className={`mt-1 w-8 h-8 flex items-center justify-center border ${n.type?.includes('warning') || n.type?.includes('low') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
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
