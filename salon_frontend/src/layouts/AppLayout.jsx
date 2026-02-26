import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppBottomNav from '../components/app/AppBottomNav';
import AppHeader from '../components/app/AppHeader';
import { useGender } from '../contexts/GenderContext';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../contexts/CustomerThemeContext';

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { gender } = useGender();
    const { customer } = useCustomerAuth();
    const { theme } = useCustomerTheme();

    const isLight = theme === 'light';

    // Check authentication and gender selection
    useEffect(() => {
        if (!customer) {
            navigate('/app/login', { replace: true });
        } else if (!gender && location.pathname !== '/app/gender') {
            navigate('/app/gender', { replace: true });
        }
    }, [customer, gender, navigate, location.pathname]);

    const hideNavPaths = ['/app/product', '/app/notifications'];
    const searchParams = new URLSearchParams(location.search);
    const hasProductModal = searchParams.get('product');
    const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path)) || hasProductModal;

    // Apply global body background based on theme
    useEffect(() => {
        const bg = isLight ? '#FFFFFF' : '#141414';
        document.body.style.backgroundColor = bg;
        document.body.style.background = isLight
            ? 'linear-gradient(to bottom, #FFFFFF 0%, #FBFBFB 100%) fixed'
            : 'linear-gradient(to bottom, #1A1A1A 0%, #0F0F0F 100%) fixed';
    }, [isLight]);

    if (!customer || (!gender && location.pathname !== '/app/gender')) return null;

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

                .app-shell h1, .app-shell h2, .app-shell h3, .app-shell h4 {
                    font-family: 'Playfair Display', serif !important;
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

                    {/* Animated Blobs (Enhanced) */}
                    <motion.div
                        animate={{
                            x: [0, 60, -30, 0],
                            y: [0, -40, 60, 0],
                            rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', top: '-10%', left: '-20%',
                            width: '450px', height: '450px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(200,149,108,0.15) 0%, rgba(255,245,235,0.1) 50%, transparent 100%)'
                                : 'radial-gradient(circle, rgba(160,104,68,0.1) 0%, rgba(30,20,15,0.05) 50%, transparent 100%)',
                            filter: 'blur(80px)',
                        }}
                    />

                    <motion.div
                        animate={{
                            x: [0, -80, 40, 0],
                            y: [0, 60, -70, 0],
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', bottom: '10%', right: '-25%',
                            width: '500px', height: '500px',
                            background: isLight
                                ? 'radial-gradient(circle, rgba(181,148,114,0.12) 0%, rgba(255,250,240,0.08) 60%, transparent 100%)'
                                : 'radial-gradient(circle, rgba(42,27,20,0.15) 0%, transparent 100%)',
                            filter: 'blur(100px)',
                        }}
                    />

                    {/* Floating Luxury Geometric Elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', top: '20%', right: '-10%',
                            width: '240px', height: '240px',
                            border: `0.5px solid ${isLight ? 'rgba(200,149,108,0.15)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: '50%',
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '10%', left: '10%',
                            width: '20px', height: '20px',
                            border: `1px solid ${isLight ? 'rgba(200,149,108,0.2)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '50%'
                        }} />
                    </motion.div>

                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', bottom: '30%', left: '-10%',
                            width: '300px', height: '300px',
                            border: `0.5px solid ${isLight ? 'rgba(200,149,108,0.1)' : 'rgba(255,255,255,0.03)'}`,
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        }}
                    />
                </div>

                <AppHeader />

                <AnimatePresence mode="wait" initial={false}>
                    <motion.main
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{ paddingBottom: shouldHideNav ? '0' : '90px' }}
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>

                {!shouldHideNav && <AppBottomNav />}

                {/* Modal Root for Portals */}
                <div id="app-portal-root" />
            </div>
        </div>
    );
}
