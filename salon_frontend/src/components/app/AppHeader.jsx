import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AppHeader() {
    const { customer } = useCustomerAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border/40"
        >
            <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                            {getInitials(customer?.name)}
                        </span>
                    </div>
                    <div>
                        <p className="text-[11px] text-text-muted font-medium">{getGreeting()} 👋</p>
                        <h2 className="text-sm font-bold text-text leading-tight">
                            {customer?.name || 'Welcome'}
                        </h2>
                    </div>
                </div>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="relative w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
                </motion.button>
            </div>
        </motion.header>
    );
}
