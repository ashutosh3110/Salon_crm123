import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppBottomNav from '../components/app/AppBottomNav';
import AppHeader from '../components/app/AppHeader';
import { useGender } from '../contexts/GenderContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../contexts/CustomerThemeContext';
import { useBusiness } from '../contexts/BusinessContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/app/CartDrawer';
import { detectPlatform } from '../services/firebase';
import { Loader2 } from 'lucide-react';

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { gender } = useGender();
    const { customer, loading: authLoading } = useCustomerAuth();
    const { theme } = useCustomerTheme();
    const { activeOutletId, isInitializing, isPageLoading } = useBusiness();
    const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

    const isLight = theme === 'light';

    useEffect(() => {
        detectPlatform(); // Ensure platform is detected on mount for debug info
    }, []);

    useEffect(() => {
        if (authLoading || isInitializing) return;
        
        if (!customer) {
            if (location.pathname !== '/app/login') {
                const search = location.search;
                navigate(`/app/login${search}`, { replace: true });
            }
            return;
        }

        // 2. Must have gender/preferences set (for new users)
        if (!gender) {
            if (location.pathname !== '/app/gender' && location.pathname !== '/app/login') {
                navigate('/app/gender', { replace: true });
            }
            return;
        }

        // 3. Must have an active salon/outlet selected
        if (!activeOutletId || activeOutletId === 'null' || activeOutletId === 'undefined') {
            const publicPaths = [
                '/app/login', '/app/gender', '/app/nearby-outlets', '/app/profile', 
                '/app/wallet', '/app/notifications', '/app/services', '/app/bookings',
                '/app/orders', '/app/transactions', '/app/shop', '/app/product', '/app/service'
            ];
            const isRestrictedPath = !publicPaths.some(p => location.pathname.startsWith(p)) && location.pathname !== '/app';
            
            // Critical: Never redirect if we are still initializing data from localStorage/API
            if (isRestrictedPath && !isInitializing) {
                navigate('/app/nearby-outlets', { replace: true });
            }
            return;
        }

    }, [authLoading, isInitializing, customer, gender, activeOutletId, navigate, location.pathname]);
    
    const hideNavPaths = ['/app/product', '/app/notifications', '/app/bookings/', '/app/orders/', '/app/checkout', '/app/membership/checkout', '/app/favorites'];
    const hideHeaderPaths = [
        '/app/product', 
        '/app/bookings', 
        '/app/orders', 
        '/app/services', 
        '/app/favorites',
        '/app/wallet',
        '/app/transactions',
        '/app/referral',
        '/app/loyalty',
        '/app/help',
        '/app/reviews',
        '/app/checkout',
        '/app/membership/checkout',
        '/app/shop'
    ];
    const searchParams = new URLSearchParams(location.search);
    const hasProductModal = searchParams.get('product');
    const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path)) || hasProductModal;
    const shouldHideHeader = hideHeaderPaths.some(path => location.pathname.startsWith(path)) || hasProductModal;

    // Apply global body background based on theme
    useEffect(() => {
        const bg = isLight ? '#FFFFFF' : '#141414';
        document.body.style.backgroundColor = bg;
        document.body.style.background = isLight
            ? 'linear-gradient(to bottom, #FFFFFF 0%, #FBFBFB 100%) fixed'
            : 'linear-gradient(to bottom, #1A1A1A 0%, #0F0F0F 100%) fixed';
    }, [isLight]);


    if (!customer || (!gender && location.pathname !== '/app/gender')) return null;

    if (isInitializing) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden" 
                 style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)' }}>
                {/* Animated Background Blobs - Optimized */}
                <motion.div
                    animate={{ opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full"
                    style={{ 
                        background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)', 
                        filter: 'blur(60px)',
                        willChange: 'opacity'
                    }}
                />
                <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#C8956C] to-[#A06844] flex items-center justify-center shadow-2xl shadow-[#C8956C]/20">
                        <span className="text-3xl font-black text-white italic transform -rotate-12">W</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <h2 className="text-white text-lg font-bold tracking-tight">WAPIXO</h2>
                        <div className="flex items-center space-x-1.5">
                            {[0, 0.2, 0.4].map((d, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: d }}
                                    className="w-1.5 h-1.5 rounded-full bg-[#C8956C]"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100svh',
            background: isLight
                ? 'linear-gradient(to bottom, #FFFFFF 0%, #FBFBFB 100%)'
                : 'linear-gradient(to bottom, #1A1A1A 0%, #0F0F0F 100%)',
            maxWidth: '430px',
            margin: '0 auto',
            position: 'relative',
            overflowX: 'hidden',
            width: '100%',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            {/* App-wide CSS Variable System + Font System */}
            <style>{`
                :root {
                    --app-bg: ${isLight ? '#FFFFFF' : '#141414'};
                    --app-text: ${isLight ? '#1A1A1A' : '#FFFFFF'};
                    --app-text-muted: ${isLight ? '#666666' : 'rgba(255,255,255,0.4)'};
                    --app-border: ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'};
                    --app-accent: #C8956C;
                }

                .app-shell {
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                    color: var(--app-text);
                }
                
                .app-shell h1, .app-shell h2, .app-shell h3, .app-shell h4, .app-shell h5, .app-shell h6 {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                /* ── Custom Scrollbar ── */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};
                    border-radius: 10px;
                }

                /* ── Luxury Background Patterns ── */
                .bg-pattern-dots {
                    background-image: radial-gradient(var(--app-accent) 0.5px, transparent 0.5px);
                    background-size: 24px 24px;
                    opacity: ${isLight ? 0.07 : 0.05};
                }

                .bg-grain {
                    filter: contrast(150%) brightness(100%);
                    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: ${isLight ? 0.05 : 0.07};
                    mix-blend-mode: overlay;
                }

                /* ── Smooth Inputs ── */
                input, select, textarea {
                    font-family: 'Inter', sans-serif !important;
                }
            `}</style>

            <div className="app-shell" style={{ minHeight: '100svh', position: 'relative', zIndex: 1 }}>
                {/* ── Creative Luxury Background ── */}
                <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
                    {/* Noise Texture */}
                    <div className="bg-grain" style={{ position: 'absolute', inset: 0 }} />

                    {/* Pattern Overlay */}
                    <div className="bg-pattern-dots" style={{ position: 'absolute', inset: 0 }} />

                    {/* Animated Blobs (Optimized - Minimal Movement) */}
                    <div
                        style={{
                            position: 'absolute', top: '-10%', left: '-20%',
                            width: '450px', height: '450px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(200,149,108,0.12) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(160,104,68,0.08) 0%, transparent 70%)',
                            filter: 'blur(60px)',
                            opacity: 0.6
                        }}
                    />

                    <div
                        style={{
                            position: 'absolute', bottom: '10%', right: '-25%',
                            width: '500px', height: '500px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(181,148,114,0.1) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(42,27,20,0.12) 0%, transparent 70%)',
                            filter: 'blur(80px)',
                            opacity: 0.5
                        }}
                    />

                    {/* Static Luxury Geometric Elements (Removed infinite rotation) */}
                    <div
                        style={{
                            position: 'absolute', top: '20%', right: '-10%',
                            width: '240px', height: '240px',
                            border: `0.5px solid ${isLight ? 'rgba(200,149,108,0.1)' : 'rgba(255,255,255,0.03)'}`,
                            borderRadius: '50%',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '10%', left: '10%',
                            width: '20px', height: '20px',
                            border: `1px solid ${isLight ? 'rgba(200,149,108,0.15)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '50%'
                        }} />
                    </div>

                    <div
                        style={{
                            position: 'absolute', bottom: '30%', left: '-10%',
                            width: '300px', height: '300px',
                            border: `0.5px solid ${isLight ? 'rgba(200,149,108,0.08)' : 'rgba(255,255,255,0.02)'}`,
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                </div>

                {!shouldHideHeader && <AppHeader />}
                <AnimatePresence mode="wait" initial={false}>
                    {(() => {
                        const isFromModal = location.state?.fromModal;
                        const customVariants = isFromModal ? {
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 }
                        } : pageVariants;

                        return (
                            <motion.main
                                key={location.pathname}
                                variants={customVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{
                                    duration: 0.3,
                                    ease: "easeOut"
                                }}
                                style={{
                                    paddingBottom: shouldHideNav ? '0' : '90px',
                                    minHeight: '100svh',
                                    width: '100%'
                                }}
                            >
                                <Outlet />
                            </motion.main>
                        );
                    })()}
                </AnimatePresence>

                {/* Global Page Loading Overlay */}
                <AnimatePresence>
                    {isPageLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-10 h-10 text-[#C8956C]" />
                            </motion.div>
                            <p className="mt-4 text-[#C8956C] text-[10px] font-bold tracking-[0.2em] uppercase">
                                Refreshing Experience
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!shouldHideNav && <AppBottomNav />}

                <CartDrawer 
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cart={cart.items}
                    total={cartTotal}
                    onUpdateQuantity={(id, delta) => {
                        const item = cart.items.find(i => (i.productId._id || i.productId.id) === id);
                        if (item) updateQuantity(id, item.quantity + delta);
                    }}
                    onRemove={removeFromCart}
                    colors={{
                        bg: isLight ? '#FCF9F6' : '#0F0F0F',
                        card: isLight ? '#FFFFFF' : '#1A1A1A',
                        text: isLight ? '#1A1A1A' : '#ffffff',
                        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
                    }}
                    isLight={isLight}
                />

                {/* Modal Root for Portals */}
                <div id="app-portal-root" />

                {/* DEBUG FCM OVERLAY */}
                {/* <div 
                    className="fixed bottom-24 right-4 z-[9999] bg-black/80 backdrop-blur-md border border-white/20 p-3 rounded-2xl pointer-events-none"
                    style={{ maxWidth: '250px' }}
                >
                    <p className="text-[9px] font-black text-[#C8956C] uppercase tracking-widest mb-1">Device Debug</p>
                    <p className="text-[10px] text-white font-mono leading-tight">
                        Platform: <span className="text-[#3b82f6]">{localStorage.getItem('fcm_platform') || 'Not detected'}</span>
                    </p>
                    <p className="text-[10px] text-white font-mono leading-tight mt-1">
                        Mode: <span className={customer ? 'text-emerald-400' : 'text-amber-400'}>{customer ? 'Authenticated' : 'Guest'}</span>
                    </p>
                    <p className="text-[10px] text-white/60 font-mono leading-tight mt-1 truncate">
                        Token: {localStorage.getItem('fcm_token') ? localStorage.getItem('fcm_token').substring(0, 15) + '...' : 'None'}
                    </p>
                    <div className="mt-2 border-t border-white/10 pt-2 space-y-1">
                        <p className="text-[8px] text-white/80 font-mono">
                            Notif API: {typeof window !== 'undefined' && 'Notification' in window ? 'Yes' : 'No'}
                        </p>
                        <p className="text-[8px] text-white/80 font-mono">
                            Permission: {typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'N/A'}
                        </p>
                        <p className="text-[8px] text-white/80 font-mono">
                            SW Support: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
