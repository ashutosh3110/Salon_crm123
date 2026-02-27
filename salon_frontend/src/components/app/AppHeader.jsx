import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import logoLightMode from '/2-removebg-preview.png';
import logoDarkMode from '/1-removebg-preview.png';
import { useState, useEffect } from 'react';

const SALON_THOUGHTS = [
    "Your hair is your crown ✨",
    "Elegance is an attitude",
    "Time to sparkle & shine",
    "Be your own kind of beautiful",
    "Relax, Renew, Refresh 🌿",
    "Life is short, make it fabulous"
];

export default function AppHeader() {
    const { theme, toggleTheme } = useCustomerTheme();
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
    const [showThought, setShowThought] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowThought(prev => !prev);
            if (showThought) {
                setCurrentThoughtIndex(prev => (prev + 1) % SALON_THOUGHTS.length);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [showThought]);

    const isLight = theme === 'light';

    return (
        <header style={{
            position: location.pathname === '/app/shop' ? 'relative' : 'sticky',
            top: 0,
            zIndex: 1000,
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '100%',
        }}>
            {/* Logo/Brand */}
            <div
                onClick={() => navigate('/app')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <img
                        src={isLight ? logoLightMode : logoDarkMode}
                        alt="Wapixo Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', height: '24px', justifyContent: 'center', overflow: 'hidden' }}>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={showThought ? currentThoughtIndex : 'greeting'}
                            initial={{ y: 20, opacity: 0, rotateX: -90 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            exit={{ y: -20, opacity: 0, rotateX: 90 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                fontSize: showThought ? '14px' : '15px',
                                fontWeight: showThought ? 600 : 800,
                                fontStyle: showThought ? 'italic' : 'normal',
                                fontFamily: showThought ? "'Playfair Display', serif" : "'Inter', sans-serif",
                                color: showThought ? (isLight ? '#C8956C' : '#E6B98D') : (isLight ? '#000' : '#fff'),
                                letterSpacing: showThought ? '0.02em' : '-0.01em',
                                whiteSpace: 'nowrap',
                                transformOrigin: 'center'
                            }}
                        >
                            {!showThought ? (
                                `Hi, ${customer?.name?.split(' ')[0] || 'Guest'}`
                            ) : (
                                SALON_THOUGHTS[currentThoughtIndex]
                            )}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Theme Toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#C8956C' : '#E6B98D',
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={theme}
                            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isLight ? <Moon size={20} strokeWidth={2.2} /> : <Sun size={20} strokeWidth={2.2} />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>

                {/* Notifications */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/app/notifications')}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#444' : 'rgba(255,255,255,0.5)',
                        position: 'relative'
                    }}
                >
                    <Bell size={20} strokeWidth={2} />
                    <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '6px',
                        height: '6px',
                        background: '#ff4757',
                        borderRadius: '50%',
                        border: isLight ? '1.5px solid #fff' : '1.5px solid #141414'
                    }} />
                </motion.button>
            </div>
        </header>
    );
}
