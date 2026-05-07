import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Wallet, LogOut, ShoppingBag, MapPin } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import logoLightMode from '/new black wapixo logo .png';
import logoDarkMode from '/new wapixo logo .png';
import { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCart } from '../../contexts/CartContext';

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
    const { customer, customerLogout } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { balance } = useWallet();
    const { activeOutlet } = useBusiness();
    const { unreadCount } = useNotifications();
    const { cartCount, setIsCartOpen } = useCart();

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
            height: '60px',
            position: location.pathname === '/app/shop' ? 'relative' : 'sticky',
            top: 0,
            zIndex: 1000,
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '100%',
            overflow: 'visible',
        }}>
            {/* Logo - fixed width, no flex */}
            <div
                onClick={() => navigate('/app')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    height: '100%'
                }}
            >
                <div style={{
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    zIndex: 2,
                    overflow: 'visible',
                    marginLeft: '-20px',
                }}>
                    <img
                        src={isLight ? logoLightMode : logoDarkMode}
                        alt="Wapixo Logo"
                        style={{
                            width: '140px',
                            height: '100px',
                            objectFit: 'contain',
                            objectPosition: 'left center',
                            filter: isLight ? 'none' : 'drop-shadow(0 0 8px rgba(255,255,255,0.1))'
                        }}
                    />
                </div>
            </div>

            {/* Middle - Greeting/Location Selector */}
            <div style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflow: 'hidden',
                paddingLeft: '12px',
                paddingRight: '4px',
            }}>
                <AnimatePresence mode="wait">
                    {!showThought ? (
                        <motion.div
                            key="greeting-location"
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                        >
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 800,
                                color: isLight ? '#111' : '#fff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                Hi, {customer?.name?.split(' ')[0] || 'Guest'} 👋
                            </span>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/app/discovery')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: '#C8956C',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: 'fit-content'
                                }}
                            >
                                <MapPin size={10} strokeWidth={3} />
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    maxWidth: '120px',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {activeOutlet?.name || 'Select Salon'}
                                </span>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.span
                            key={currentThoughtIndex}
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                fontStyle: 'italic',
                                color: isLight ? '#C8956C' : '#E6B98D',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                                width: '100%',
                            }}
                        >
                            {SALON_THOUGHTS[currentThoughtIndex]}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {/* Theme Toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    style={{
                        width: '32px',
                        height: '38px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#000000' : '#FFFFFF',
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

                {/* Wallet Balance Shortcut */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/app/wallet')}
                    style={{
                        width: '32px',
                        height: '38px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#000000' : '#FFFFFF',
                    }}
                >
                    <Wallet size={20} strokeWidth={2.2} />
                </motion.button>

                {/* Notifications */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/app/notifications')}
                    style={{
                        width: '32px',
                        height: '38px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#000000' : '#FFFFFF',
                        position: 'relative'
                    }}
                >
                    <Bell size={20} strokeWidth={2.2} className={unreadCount > 0 ? 'animate-bounce-slow' : ''} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '6px',
                            minWidth: '14px',
                            height: '14px',
                            background: '#ff4757',
                            color: 'white',
                            fontSize: '8px',
                            fontWeight: 900,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isLight ? '1.5px solid #fff' : '1.5px solid #141414',
                            boxShadow: '0 2px 4px rgba(255, 71, 87, 0.3)'
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </motion.button>
                
                {/* Cart Icon */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCartOpen(true)}
                    style={{
                        width: '32px',
                        height: '38px',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isLight ? '#000000' : '#FFFFFF',
                        position: 'relative',
                        marginLeft: '2px'
                    }}
                >
                    <ShoppingBag size={20} strokeWidth={2.2} />
                    {cartCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '4px',
                            minWidth: '14px',
                            height: '14px',
                            background: '#C8956C',
                            color: 'white',
                            fontSize: '8px',
                            fontWeight: 900,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isLight ? '1.5px solid #fff' : '1.5px solid #141414',
                            boxShadow: '0 2px 4px rgba(200, 149, 108, 0.3)'
                        }}>
                            {cartCount > 9 ? '9+' : cartCount}
                        </span>
                    )}
                </motion.button>


            </div>
        </header>
    );
}
