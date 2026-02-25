import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Scissors, CalendarPlus, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/app' },
    { id: 'services', label: 'Explore', icon: Scissors, path: '/app/services' },
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
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: '#1A1A1A',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 100,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-around',
                padding: '8px 8px 10px',
            }}>
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;

                    /* ── CENTER BOOK BUTTON ── */
                    if (tab.isCenter) {
                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                whileTap={{ scale: 0.88 }}
                                style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '4px',
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', padding: '0 8px',
                                    marginTop: '-18px',
                                }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.06 }}
                                    animate={active ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.35 }}
                                    style={{
                                        width: '52px', height: '52px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #C8956C, #a06844)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 6px 20px rgba(200,149,108,0.4)',
                                    }}
                                >
                                    <Icon size={22} color="#fff" strokeWidth={2.2} />
                                </motion.div>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: '#C8956C',
                                    letterSpacing: '0.02em',
                                }}>
                                    {tab.label}
                                </span>
                            </motion.button>
                        );
                    }

                    /* ── REGULAR TABS ── */
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
                            {/* Active dot indicator */}
                            {active && (
                                <motion.div
                                    layoutId="app-nav-dot"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        width: '4px', height: '4px',
                                        borderRadius: '50%',
                                        background: '#C8956C',
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                            <Icon
                                size={21}
                                strokeWidth={active ? 2.2 : 1.6}
                                color={active ? '#C8956C' : 'rgba(255,255,255,0.32)'}
                            />
                            <span style={{
                                fontSize: '10px',
                                fontWeight: active ? 600 : 400,
                                color: active ? '#C8956C' : 'rgba(255,255,255,0.32)',
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
