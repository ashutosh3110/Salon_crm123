import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function Topbar({ onMenuClick }) {
    const { user } = useAuth();
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
        <header className="h-16 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    <Menu className="w-5 h-5 text-text-secondary" />
                </button>

                {/* Search */}
                <div className="hidden sm:flex items-center bg-surface border border-border/40 rounded-xl px-3 py-2 w-64 focus-within:w-80 transition-all">
                    <Search className="w-4 h-4 text-text-muted mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full"
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

                {/* Avatar */}
                <div className="flex items-center gap-2 pl-3 ml-1 border-l border-border/40">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                        {initials}
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-sm font-medium text-text leading-tight">{user?.name || 'User'}</div>
                        <div className="text-xs text-text-muted capitalize">{user?.role || 'admin'}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
