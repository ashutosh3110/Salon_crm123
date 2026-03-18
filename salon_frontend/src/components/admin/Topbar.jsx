import { Menu, Bell, Search, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U';

    return (
        <header className="h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    <Menu className="w-5 h-5 text-text-secondary" />
                </button>

                {/* Search */}
                <div className="hidden lg:flex items-center bg-surface border border-border/40 px-4 py-2 w-64 focus-within:w-80 transition-all rounded-none font-black shadow-sm">
                    <Search className="w-4 h-4 text-text-muted mr-3" />
                    <input
                        type="text"
                        placeholder="Scan System..."
                        className="bg-transparent text-[10px] font-black text-text placeholder-text-muted outline-none w-full uppercase tracking-widest"
                    />
                </div>
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

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-surface" />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 ml-1 border-l border-border/40">
                    <div className="w-9 h-9 bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-inner">
                        {initials}
                    </div>
                    <div className="hidden md:block text-left leading-none font-black">
                        <div className="text-[11px] font-black text-text uppercase tracking-tight">{user?.name || 'User'}</div>
                        <div className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">{user?.role || 'admin'}</div>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-10 h-10 rounded-xl bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-colors border border-border/40 group"
                    title="Logout"
                >
                    <LogOut className="w-4.5 h-4.5 text-text-secondary group-hover:text-rose-500" />
                </button>
            </div>
        </header>
    );
}
