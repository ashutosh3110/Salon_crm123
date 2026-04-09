import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronRight, Smartphone } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AnimatedHero() {
    const { theme } = useTheme();
    const [stage, setStage] = useState(1);
    const isDark = theme === 'dark';

    useEffect(() => {
        const interval = setInterval(() => {
            setStage(prev => (prev === 1 ? 2 : 1));
        }, 5000); // Toggle stage every 5 seconds for a continuous loop
        return () => clearInterval(interval);
    }, []);

    const cards = [
        { title: 'Boutique Management', desc: 'Elite control.', img: '/image1.png' },
        { title: 'Smart Discovery', desc: 'Find top stylists.', img: '/image1.png' },
        { title: 'Loyalty Programs', desc: 'Digital rewards.', img: '/image1.png' }
    ];

    // Premium Color Palette
    const bg1 = isDark ? '#0D0D0D' : '#FDF9F4';
    const bg2 = isDark ? '#050505' : '#F5F5F7';

    // Faster Transition Config
    const curtainTrans = { duration: 0.7, ease: [0.33, 1, 0.68, 1] };

    return (
        <section style={{
            height: '62vh',
            width: '100%',
            background: stage === 1 ? bg1 : bg2,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.7s cubic-bezier(0.33, 1, 0.68, 1)'
        }}>
            {/* Premium Animated Background Elements */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '10%',
                        width: '400px',
                        height: '400px',
                        background: isDark ? 'rgba(180, 145, 43, 0.08)' : 'rgba(180, 145, 43, 0.05)',
                        filter: 'blur(80px)',
                        borderRadius: '50%'
                    }}
                />
                <motion.div
                    animate={{ 
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    style={{
                        position: 'absolute',
                        bottom: '-10%',
                        right: '5%',
                        width: '500px',
                        height: '500px',
                        background: isDark ? 'rgba(180, 145, 43, 0.05)' : 'rgba(180, 145, 43, 0.03)',
                        filter: 'blur(100px)',
                        borderRadius: '50%'
                    }}
                />
            </div>
            <AnimatePresence mode="wait">
                {stage === 1 ? (
                    /* STAGE 1: Top-to-Bottom Dropdown */
                    <motion.div
                        key="stage1"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={curtainTrans}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: bg1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '0 2rem',
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                        }}
                    >
                        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1.2fr 1fr',
                                gap: '2rem',
                                alignItems: 'center'
                            }}>
                                <motion.div
                                    initial={{ opacity: 0, y: -15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: 'var(--wapixo-primary)' }}>
                                        <Smartphone size={16} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>New Era of Beauty</span>
                                    </div>
                                    <h1 style={{
                                        fontSize: 'clamp(2rem, 5vw, 3.8rem)',
                                        fontWeight: 600,
                                        letterSpacing: '-0.04em',
                                        lineHeight: 1,
                                        margin: '0 0 1rem 0',
                                        color: 'var(--wapixo-text)',
                                        textTransform: 'uppercase'
                                    }}>
                                        Revolutionizing <br />
                                        Salon <span style={{ color: 'var(--wapixo-primary)' }}>mastery</span>
                                    </h1>
                                    <p style={{
                                        fontSize: '1.05rem',
                                        color: 'var(--wapixo-text-muted)',
                                        maxWidth: '440px',
                                        marginBottom: '2rem',
                                        lineHeight: 1.6,
                                        fontWeight: 300
                                    }}>
                                        Unlock the ultimate boutique management experience. 
                                        A seamless bridge between elite salons and their customers.
                                    </p>
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                background: '#000',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '0.9rem 2.2rem',
                                                borderRadius: '100px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                letterSpacing: '0.05em',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            DOWNLOAD APP <Download size={14} />
                                        </motion.button>
                                        <motion.button
                                            onClick={() => setStage(2)}
                                            whileHover={{ x: 5 }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--wapixo-text)',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            Explore Features <ChevronRight size={14} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* STAGE 2: Bottom-to-Top Reveal */
                    <motion.div
                        key="stage2"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={curtainTrans}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: isDark 
                                ? 'radial-gradient(circle at center, #111 0%, #050505 100%)' 
                                : 'radial-gradient(circle at center, #ffffff 0%, #f0f0f2 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 2rem'
                        }}
                    >
                        {/* Stage 2 Specific Background Decorations */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: isDark 
                                ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
                                : 'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }} />

                        <div style={{ maxWidth: '1200px', width: '100%', zIndex: 1 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                style={{ textAlign: 'center', marginBottom: '2rem' }}
                            >
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                                    fontWeight: 300,
                                    textTransform: 'uppercase',
                                    color: 'var(--wapixo-text)',
                                    letterSpacing: '-0.02em'
                                }}>
                                    <span style={{ fontWeight: 600 }}>Elite</span> Product Interface
                                </h2>
                            </motion.div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1.5rem',
                                width: '100%'
                            }} className="animated-showcase">
                                {cards.map((card, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                                        style={{
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                                            borderRadius: '0px', 
                                            padding: '0', 
                                            overflow: 'hidden',
                                            boxShadow: isDark ? '0 15px 30px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.02)',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '16/9',
                                            overflow: 'hidden',
                                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                                        }}>
                                            <img src={card.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ textAlign: 'left', padding: '0.85rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{card.title}</h4>
                                            <p style={{ margin: '3px 0 0 0', fontSize: '0.7rem', opacity: 0.6, lineHeight: 1.3 }}>{card.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                onClick={() => setStage(1)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                style={{
                                    marginTop: '2rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--wapixo-primary)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}
                            >
                                ← Return to Overview
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stage Progress Indicators */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                display: 'flex',
                gap: '8px'
            }}>
                {[1, 2].map(s => (
                    <div 
                        key={s}
                        onClick={() => setStage(s)}
                        style={{
                            width: '30px',
                            height: '3px',
                            background: stage === s ? 'var(--wapixo-primary)' : 'rgba(128,128,128,0.3)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
