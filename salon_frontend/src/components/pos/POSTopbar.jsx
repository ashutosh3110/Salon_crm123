import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Store, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function POSTopbar({ onMenuClick }) {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 bg-background/95 border-b border-border/60 backdrop-blur-md">
            <div className="flex items-center justify-between h-16 px-4 sm:px-8">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden w-10 h-10 border border-border bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                    >
                        <Menu className="w-5 h-5 text-text-secondary" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Monitor className="w-4 h-4 text-primary" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest block leading-none">Terminal #01</span>
                            <span className="text-xs font-bold text-text-secondary">Main Reception</span>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="w-10 h-10 bg-surface border border-border flex items-center justify-center hover:bg-surface-alt hover:border-text-muted transition-all"
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? (
                            <Moon className="w-4 h-4 text-text-secondary" />
                        ) : (
                            <Sun className="w-4 h-4 text-amber-500" />
                        )}
                    </motion.button>

                    {/* Notifications */}
                    <button
                        onClick={() => navigate('/pos/notifications')}
                        className="w-10 h-10 bg-surface border border-border flex items-center justify-center hover:bg-surface-alt hover:border-text-muted transition-all relative"
                    >
                        <Bell className="w-4 h-4 text-text-secondary" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border-2 border-background" />
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-4 pl-4 ml-2 border-l border-border/60 h-10">
                        <div className="hidden lg:block text-right">
                            <p className="text-xs font-black text-text uppercase tracking-tighter leading-none">Ravi Sharma</p>
                            <p className="text-[10px] font-bold text-text-muted mt-0.5">Senior Cashier</p>
                        </div>
                        <div className="w-10 h-10 bg-text text-background flex items-center justify-center font-black text-xs relative group cursor-pointer hover:bg-primary hover:text-white transition-colors">
                            RS
                            <div className="absolute top-0 left-0 w-full h-full border border-background opacity-0 group-hover:opacity-10 scale-90 group-hover:scale-100 transition-all"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
