import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/app' },
    { id: 'services', label: 'Services', icon: Scissors, path: '/app/services' },
    { id: 'book', label: 'Book', icon: CalendarPlus, path: '/app/book' },
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
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: isLight ? '#FFFFFF' : '#1A1A1A',
            borderTop: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.07)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 100,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '8px 8px 10px',
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
