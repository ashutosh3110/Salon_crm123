import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                        <button className="relative w-10 h-10 sm:w-11 sm:h-11 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40">
                            <Bell className="w-5 h-5 text-text-secondary" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary ring-2 ring-background dark:ring-surface" />
                        </button>

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
