import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppBottomNav from '../components/app/AppBottomNav';
import { useGender } from '../contexts/GenderContext';

const pageVariants = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export default function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { gender } = useGender();

    // First-time visit: redirect to gender selection
    useEffect(() => {
        if (!gender) {
            navigate('/app/gender', { replace: true });
        }
    }, [gender, navigate]);

    if (!gender) return null; // don't flash content while redirecting

    return (
        <div style={{
            minHeight: '100svh',
            background: '#141414',
            maxWidth: '430px',
            margin: '0 auto',
            position: 'relative',
            fontFamily: "'Open Sans', 'Noto Serif', sans-serif",
        }}>
            {/* App-wide CSS + Font System */}
            <style>{`
                /* ── Google Font imports applied to app shell ── */
                .app-shell {
                    font-family: 'Open Sans', 'Noto Serif', sans-serif;
                    box-sizing: border-box;
                }
                .app-shell *, .app-shell *::before, .app-shell *::after {
                    box-sizing: border-box;
                    font-family: inherit;
                }

                /* ── Headings → Playfair Display (elegant & premium) ── */
                .app-shell h1,
                .app-shell h2 {
                    font-family: 'Playfair Display', 'Libre Baskerville', serif;
                    font-weight: 700;
                }

                /* ── Sub-headings → Libre Baskerville ── */
                .app-shell h3,
                .app-shell h4 {
                    font-family: 'Libre Baskerville', 'Playfair Display', serif;
                    font-weight: 700;
                }

                /* ── Small text, labels, buttons → Open Sans ── */
                .app-shell h5,
                .app-shell h6,
                .app-shell p,
                .app-shell span,
                .app-shell button,
                .app-shell input,
                .app-shell select,
                .app-shell label,
                .app-shell a {
                    font-family: 'Open Sans', 'Noto Serif', sans-serif;
                }

                /* ── Utility classes for manual font control ── */
                .app-shell .font-playfair  { font-family: 'Playfair Display', serif !important; }
                .app-shell .font-baskerville { font-family: 'Libre Baskerville', serif !important; }
                .app-shell .font-noto      { font-family: 'Noto Serif', serif !important; }
                .app-shell .font-open-sans { font-family: 'Open Sans', sans-serif !important; }

                /* ── Scrollbar hiding ── */
                .app-shell::-webkit-scrollbar { display: none; }
                .app-shell { -ms-overflow-style: none; scrollbar-width: none; }
                .app-scroll::-webkit-scrollbar { display: none; }
                .app-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="app-shell" style={{ minHeight: '100svh', background: '#141414' }}>
                <AnimatePresence mode="wait">
                    <motion.main
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ paddingBottom: '80px', minHeight: '100svh' }}
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>

                <AppBottomNav />
            </div>
        </div>
    );
}
