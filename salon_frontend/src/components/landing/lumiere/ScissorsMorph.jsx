import { useEffect, useRef } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';

const TOTAL_FRAMES = 120;
const FOLDER = '/sequence-2';

function getFrameUrl(index) {
    const num = String(index + 1).padStart(3, '0');
    return `${FOLDER}/ezgif-frame-${num}.jpg`;
}

export default function ScissorsMorph() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imagesRef = useRef([]);
    const currentFrameRef = useRef(0);
    const rafRef = useRef(null);
    const progressMV = useMotionValue(0);

    const text1Opacity = useTransform(progressMV, [0.2, 0.4, 0.7, 0.85], [0, 1, 1, 0]);
    const text1Y = useTransform(progressMV, [0.2, 0.45], [40, 0]);
    const text2Opacity = useTransform(progressMV, [0.6, 0.8], [0, 1]);
    const text2Y = useTransform(progressMV, [0.6, 0.85], [30, 0]);

    useEffect(() => {
        const imgs = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
            const img = new Image();
            img.src = getFrameUrl(i);
            return img;
        });
        imagesRef.current = imgs;
    }, []);

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
            style={{ height: '400vh', position: 'relative' }}
        >
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

                {/* Vignette */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.65) 100%)',
                    pointerEvents: 'none',
                }} />

                {/* Text overlay 1 */}
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        transform: 'translateY(-50%)',
                        textAlign: 'center',
                        opacity: text1Opacity,
                        y: text1Y,
                        pointerEvents: 'none',
                    }}
                >
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.45em',
                        textTransform: 'uppercase',
                        margin: '0 0 1rem 0',
                    }}>
                        Crafted for Artists
                    </p>
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(1.8rem, 5vw, 4rem)',
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        margin: 0,
                        padding: '0 1.5rem',
                        textShadow: '0 4px 60px rgba(0,0,0,0.6)',
                    }}>
                        Precision Tools for<br />the Modern Artist.
                    </h2>
                </motion.div>

                {/* Text overlay 2 */}
                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '12%',
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        opacity: text2Opacity,
                        y: text2Y,
                        pointerEvents: 'none',
                    }}
                >
                    <h2 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                        color: '#ffffff',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        margin: 0,
                        padding: '0 1.5rem',
                        textShadow: '0 4px 60px rgba(0,0,0,0.7)',
                    }}>
                        Designed for the Elite.
                    </h2>
                </motion.div>
            </div>
        </div>
    );
}
