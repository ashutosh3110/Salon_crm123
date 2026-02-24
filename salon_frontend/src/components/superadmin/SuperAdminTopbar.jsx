import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function SuperAdminTopbar({ onMenuClick }) {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

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
                    <span className="text-sm font-medium text-text-secondary hidden sm:block">Platform Administration</span>
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

                    <button className="w-10 h-10 rounded-xl bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors relative border border-border/40">
                        <Bell className="w-4.5 h-4.5 text-text-secondary" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-surface" />
                    </button>

                    <div className="flex items-center gap-2 pl-3 border-l border-border/40 ml-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/20">
                            SA
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-medium text-text leading-none">{user?.name || 'Super Admin'}</div>
                            <div className="text-[11px] text-text-muted mt-0.5">superadmin</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
