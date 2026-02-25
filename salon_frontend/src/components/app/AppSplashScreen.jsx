import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function AppSplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        onComplete && onComplete();
                    }, 500);
                    return 100;
                }
                return prev + 2.5;
            });
        }, 25);

        return () => clearInterval(timer);
    }, [onComplete]);

    const colors = {
        bg: isLight ? '#FFFFFF' : '#141414',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        bar: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C'
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                background: colors.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}
        >
            {/* Logo Animation */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1]
                }}
                className="flex flex-col items-center gap-4 mb-16"
            >
                <div className="relative">
                    <motion.div
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 blur-2xl opacity-20"
                        style={{ background: colors.accent }}
                    />
                    <img
                        src="/wapixo-logo.svg"
                        alt="Wapixo Logo"
                        className="relative"
                        style={{
                            height: '60px',
                            width: 'auto',
                        }}
                    />
                </div>
                <h2 className="text-xl font-black italic tracking-tighter" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>
                    Signature <span className="text-[#C8956C]">Rituals</span>
                </h2>
            </motion.div>

            {/* Loading Container */}
            <div className="w-56 space-y-4">
                {/* Progress Bar */}
                <div className="w-full h-[3px] rounded-full overflow-hidden relative" style={{ background: colors.bar }}>
                    <motion.div
                        style={{
                            height: '100%',
                            background: colors.accent,
                            boxShadow: `0 0 20px ${colors.accent}44`
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                    />
                </div>

                {/* Loading Text */}
                <div className="flex justify-between items-center px-1">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[9px] font-black uppercase tracking-[0.3em]"
                        style={{ color: colors.text }}
                    >
                        Awakening
                    </motion.span>
                    <span className="text-[9px] font-black tracking-widest opacity-40" style={{ color: colors.text }}>
                        {Math.floor(progress)}%
                    </span>
                </div>
            </div>

            {/* Bottom Tagline */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ delay: 1, duration: 1.5 }}
                className="absolute bottom-12 text-center"
            >
                <p className="text-[8px] font-black uppercase tracking-[0.4em]" style={{ color: colors.text }}>
                    The Art of Personal Grooming
                </p>
            </motion.div>
        </motion.div>
    );
}
