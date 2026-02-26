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

    const hideNavPaths = ['/app/product', '/app/notifications', '/app/referral'];
    const searchParams = new URLSearchParams(location.search);
    const hasProductModal = searchParams.get('product');
    const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path)) || hasProductModal;

    // Apply global body background based on theme
    useEffect(() => {
        document.body.style.background = isLight ? '#F8F9FA' : '#141414';
    }, [isLight]);

    if (!customer || (!gender && location.pathname !== '/app/gender')) return null;

    return (
        <div style={{
            minHeight: '100svh',
            background: isLight ? '#F8F9FA' : '#141414',
            maxWidth: '430px',
            margin: '0 auto',
            position: 'relative',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            {/* App-wide CSS Variable System + Font System */}
            <style>{`
                :root {
                    --app-bg: ${isLight ? '#F8F9FA' : '#141414'};
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

                /* ── Hide scrollbar for elements that need it ── */
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                /* ── Smooth Inputs ── */
                input, select, textarea {
                    font-family: 'Inter', sans-serif !important;
                }
            `}</style>

            <div className="app-shell" style={{ minHeight: '100svh' }}>
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
