import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ChairSection() {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    }, []);

    return (
        <section
            style={{
                position: 'relative',
                height: '100vh',
                overflow: 'hidden',
                background: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Background video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.75,
                }}
            >
                <source src="/chair no watermark.mp4" type="video/mp4" />
            </video>

            {/* Dark overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.45) 100%)',
            }} />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    padding: '0 clamp(1.5rem, 5vw, 5rem)',
                }}
            >
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 200,
                        fontSize: 'clamp(0.65rem, 1.2vw, 0.85rem)',
                        color: 'rgba(255,255,255,0.45)',
                        letterSpacing: '0.45em',
                        textTransform: 'uppercase',
                        margin: '0 0 1.5rem 0',
                    }}
                >
                    Experience Wapixo
                </motion.p>

                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 200,
                    fontSize: 'clamp(2.2rem, 6vw, 5.5rem)',
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                    margin: '0 0 1rem 0',
                }}>
                    The Throne of Excellence.
                </h2>

                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                    color: 'rgba(255,255,255,0.55)',
                    margin: '0 0 3rem 0',
                    letterSpacing: '0.02em',
                }}>
                    Comfort meets Control.
                </p>

                <motion.div
                    style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.04, backgroundColor: '#f0f0f0' }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 400,
                                fontSize: '0.9rem',
                                color: '#050505',
                                background: '#ffffff',
                                border: 'none',
                                borderRadius: '100px',
                                padding: '0.9rem 2.2rem',
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background 0.2s',
                            }}
                        >
                            Experience Wapixo
                            <ArrowRight size={16} />
                        </motion.button>
                    </Link>

                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 300,
                                fontSize: '0.9rem',
                                color: 'rgba(255,255,255,0.8)',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '100px',
                                padding: '0.9rem 2.2rem',
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                                transition: 'background 0.2s',
                            }}
                        >
                            Sign In
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
