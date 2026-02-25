import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AppBottomNav from '../components/app/AppBottomNav';
import AppHeader from '../components/app/AppHeader';

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export default function AppLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background max-w-lg mx-auto relative transition-colors duration-300 admin-panel">
            {/* Global sharp-edge & font override for Customer App panel */}
            <style>{`
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after {
                    border-radius: 0 !important;
                    font-family: 'Open Sans', sans-serif;
                }
                .admin-panel h1, 
                .admin-panel h2, 
                .admin-panel h3, 
                .admin-panel h4, 
                .admin-panel h5, 
                .admin-panel h6,
                .admin-panel .font-serif {
                    font-family: 'Libre Baskerville', 'Noto Serif', serif !important;
                }
                .admin-panel .font-sans {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>
            <AppHeader />

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="px-4 pt-4 pb-24"
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>

            <AppBottomNav />
        </div>
    );
}
