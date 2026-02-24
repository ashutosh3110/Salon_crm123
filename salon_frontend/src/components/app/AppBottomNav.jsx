import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/app' },
    { id: 'services', label: 'Services', icon: Scissors, path: '/app/services' },
    { id: 'book', label: 'Book', icon: CalendarPlus, path: '/app/book', isCenter: true },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/app/shop' },
    { id: 'profile', label: 'Profile', icon: User, path: '/app/profile' },
];

export default function AppBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        if (path === '/app') return location.pathname === '/app';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface/90 backdrop-blur-xl border-t border-border/60 dark:border-border/20 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
            <div className="max-w-lg mx-auto flex items-end justify-around px-2 pt-1 pb-1.5">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;

                    if (tab.isCenter) {
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                whileTap={{ scale: 0.9 }}
                                className="relative -mt-5 flex flex-col items-center"
                            >
                                <motion.div
                                    className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    animate={active ? { scale: [1, 1.08, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </motion.div>
                                <span className="text-[10px] font-bold mt-1 text-primary">{tab.label}</span>
                            </motion.button>
                        );
                    }

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            whileTap={{ scale: 0.85 }}
                            className="relative flex flex-col items-center py-1.5 px-3 min-w-[56px]"
                        >
                            <div className="relative">
                                <Icon
                                    className={`w-5.5 h-5.5 transition-colors duration-200 ${active ? 'text-primary' : 'text-text-muted'}`}
                                    strokeWidth={active ? 2.5 : 1.8}
                                />
                                {active && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 transition-colors duration-200 ${active ? 'text-primary font-bold' : 'text-text-muted font-medium'}`}>
                                {tab.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
}
