import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRELOAD_COUNT = 40; // preload first 40 frames of sequence 1

export default function LumiereLoader({ onComplete }) {
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let loaded = 0;
        const total = PRELOAD_COUNT;

        for (let i = 1; i <= total; i++) {
            const img = new Image();
            const num = String(i).padStart(3, '0');
            img.src = `/Sequence-1/ezgif-frame-${num}.jpg`;
            img.onload = img.onerror = () => {
                loaded++;
                setProgress(Math.round((loaded / total) * 100));
                if (loaded === total) {
                    setTimeout(() => {
                        setVisible(false);
                        onComplete && onComplete();
                    }, 600);
                }
            };
        }
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: '#050505',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2.5rem',
                    }}
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <img
                            src="/1-removebg-preview.png"
                            alt="Wapixo Logo"
                            style={{
                                height: 'clamp(12rem, 30vw, 24rem)',
                                width: 'auto',
                                filter: 'brightness(0) invert(1)'
                            }}
                        />
                    </motion.div>

                    {/* Progress bar */}
                    <div style={{ width: '200px', height: '1px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
                        <motion.div
                            style={{
                                height: '100%',
                                background: '#ffffff',
                                borderRadius: '1px',
                            }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        style={{
                            fontFamily: "'Inter', monospace",
                            fontSize: '0.6rem',
                            color: '#ffffff',
                            letterSpacing: '0.4em',
                            textTransform: 'uppercase',
                        }}
                    >
                        POWERING SMART BUSINESSES
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
