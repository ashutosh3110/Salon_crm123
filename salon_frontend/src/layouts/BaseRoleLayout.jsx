import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, Search, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();
    const activeAccentColor = accentColor === 'var(--color-primary)' ? 'var(--color-primary)' : accentColor;

    const effectiveCollapsed = collapsed && !isHovered;

    return (
        <div
            className="min-h-screen bg-background flex text-text transition-colors duration-300 admin-panel"
            style={{ '--accent-color': activeAccentColor }}
        >
            {/* Global sharp-edge override for entire panel */}
            <style>{`
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after {
                    border-radius: 0 !important;
                    font-family: 'Open Sans', sans-serif;
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
            <div className={`flex-1 flex flex-col transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 lg:px-6 gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                        >
                            <Menu className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 font-black">
                        {/* Theme Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="w-10 h-10 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-text-secondary" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-400" />
                            )}
                        </motion.button>

                        {/* Notifications */}
                        <button className="relative w-10 h-10 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40">
                            <Bell className="w-5 h-5 text-text-secondary" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary ring-2 ring-background dark:ring-surface" />
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-border/40">
                            <div className="text-right hidden sm:block">
                                <div className="text-[10px] font-black text-text leading-tight uppercase tracking-tighter">{user?.name || 'Authorized_User'}</div>
                                <div className="text-[8px] text-text-muted uppercase tracking-[0.2em] mt-0.5">{user?.role || 'operator'}</div>
                            </div>
                            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'AU'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div >
    );
}
