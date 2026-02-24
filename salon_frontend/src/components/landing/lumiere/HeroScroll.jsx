import { useEffect, useRef, useState } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';

const TOTAL_FRAMES = 120;
const FOLDER = '/Sequence-1';

function getFrameUrl(index) {
    const num = String(index + 1).padStart(3, '0');
    return `${FOLDER}/ezgif-frame-${num}.jpg`;
}

export default function HeroScroll() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imagesRef = useRef([]);
    const currentFrameRef = useRef(0);
    const rafRef = useRef(null);
    const progressMV = useMotionValue(0);

    const textOpacity = useTransform(progressMV, [0.5, 0.7], [0, 1]);
    const textY = useTransform(progressMV, [0.5, 0.8], [40, 0]);

    // Preload all frames
    useEffect(() => {
        const imgs = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
            const img = new Image();
            img.src = getFrameUrl(i);
            return img;
        });
        imagesRef.current = imgs;
    }, []);

    // Draw frame on canvas (cover fit)
    const drawFrame = (index) => {
        const canvas = canvasRef.current;
        const img = imagesRef.current[index];
        if (!canvas || !img || !img.naturalWidth) return;

        const ctx = canvas.getContext('2d');
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
    };

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const containerHeight = container.offsetHeight - window.innerHeight;
            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / containerHeight));

            progressMV.set(progress);

            const frameIndex = Math.min(
                TOTAL_FRAMES - 1,
                Math.floor(progress * (TOTAL_FRAMES - 1))
            );

            if (frameIndex !== currentFrameRef.current) {
                currentFrameRef.current = frameIndex;
                cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(() => drawFrame(frameIndex));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    // Resize handler
    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(currentFrameRef.current);
        };
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ height: '500vh', position: 'relative' }}
        >
            {/* Sticky canvas viewport */}
            <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        background: '#050505',
                    }}
                />

                {/* Dark vignette overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, transparent 30%, transparent 70%, rgba(5,5,5,0.5) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Scroll-triggered headline */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '15%',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        opacity: textOpacity,
                        y: textY,
                        pointerEvents: 'none',
                    }}
                >
                    <h1 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(1.8rem, 5vw, 4.5rem)',
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        margin: 0,
                        padding: '0 1.5rem',
                        textShadow: '0 2px 40px rgba(0,0,0,0.5)',
                    }}>
                        The New Standard of<br />Salon Mastery.
                    </h1>
                </motion.div>

                {/* Initial headline (before scroll) */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        transform: 'translateY(-50%)',
                        textAlign: 'center',
                        opacity: useTransform(progressMV, [0, 0.15], [1, 0]),
                        pointerEvents: 'none',
                    }}
                >


                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0',
                        }}
                    >
                        <img
                            src="/1-removebg-preview.png"
                            alt="Wapixo"
                            style={{
                                height: '250px',
                                width: 'auto',
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            margin: '1.5rem 0 0 0', // Moved down slightly as requested
                        }}>
                            POWERING SMART BUSINESSES
                        </p>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 200,
                            fontSize: 'clamp(2rem, 6vw, 5.5rem)',
                            color: '#ffffff',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                            margin: '-6rem 0 0 0', // Adjusted margin to account for new tagline
                            padding: '0 1.5rem',
                        }}
                    >
                        Where Excellence<br />Meets Precision.
                    </motion.h2>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        style={{
                            position: 'absolute',
                            bottom: '-10vh',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <span style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.6rem',
                            letterSpacing: '0.3em',
                            color: 'rgba(255,255,255,0.35)',
                            textTransform: 'uppercase',
                        }}>Scroll</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            style={{
                                width: '1px',
                                height: '40px',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div >
    );
}
