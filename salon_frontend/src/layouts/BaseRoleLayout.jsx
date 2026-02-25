import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { theme, toggleTheme } = useTheme();
    const activeAccentColor = accentColor === 'var(--color-primary)' ? 'var(--color-primary)' : accentColor;

    return (
        <div
            className="min-h-screen bg-white flex text-text transition-colors duration-300 admin-panel"
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
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                accentColor={activeAccentColor}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 lg:px-6 gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                        >
                            <Menu className="w-5 h-5 text-text-secondary" />
                        </button>
                        <h1 className="text-sm font-extrabold text-text tracking-tight uppercase tracking-[0.1em]">{title}</h1>
                    </div>

                    <div className="flex items-center gap-2">
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
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
