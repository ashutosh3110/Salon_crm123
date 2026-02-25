import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Search, MapPin } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppHeader() {
    const { theme, toggleTheme } = useCustomerTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide header on login/auth pages if needed, but the prompt asked for it in user app
    // Usually header is on Home, Shop, etc.

    const isLight = theme === 'light';

    return (
        <header style={{
            position: location.pathname === '/app/shop' ? 'relative' : 'sticky',
            top: 0,
            zIndex: 1000,
            background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #C8956C, #A06844)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(200, 149, 108, 0.3)'
                }}>
                    💇
                </div>
                <span style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: isLight ? '#000' : '#fff',
                    fontFamily: "'Playfair Display', serif"
                }}>
                    Wapixo
                </span>
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
                        background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
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
                        background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
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
