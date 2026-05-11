import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/app' },
    { id: 'services', label: 'Services', icon: Scissors, path: '/app/services' },
    { id: 'book', label: 'Booking', icon: CalendarPlus, path: '/app/bookings' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/app/shop' },
    { id: 'profile', label: 'Profile', icon: User, path: '/app/profile' },
];

export default function AppBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const isActive = (path) => {
        if (path === '/app') return location.pathname === '/app';
        return location.pathname.startsWith(path);
    };

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            margin: '0 auto',
            width: '100%',
            maxWidth: '430px',
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
            zIndex: 9999,
            boxShadow: isLight ? '0 -10px 25px rgba(0,0,0,0.04)' : '0 -10px 30px rgba(0,0,0,0.3)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '10px 8px',
            }}>
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            whileTap={{ scale: 0.82 }}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '4px',
                                background: 'none', border: 'none',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                position: 'relative',
                            }}
                        >
                            <Icon
                                size={21}
                                strokeWidth={active ? 2.2 : 1.6}
                                color={active ? '#C8956C' : (isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.32)')}
                            />
                            <span style={{
                                fontSize: '10px',
                                fontWeight: active ? 600 : 400,
                                color: active ? '#C8956C' : (isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.32)'),
                                letterSpacing: '0.02em',
                            }}>
                                {tab.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
}
