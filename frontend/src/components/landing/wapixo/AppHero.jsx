import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Smartphone, Download, Star, ShieldCheck, Zap, ArrowRight, PlayControl as Play } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AppHero() {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const isDark = theme === 'dark';

    // Auto-expand after a short delay for "surprise" effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExpanded(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Enterprise-grade encryption for all bookings.' },
        { icon: Zap, title: 'Lightning Fast', desc: 'Book your favorite stylist in under 10 seconds.' },
        { icon: Star, title: 'Elite Perks', desc: 'Unlock gold-tier rewards and early access.' }
    ];

    return (
        <section style={{
            minHeight: 'auto',
            width: '100%',
            background: isDark ? 'var(--wapixo-bg)' : '#fdf9f4',
            paddingTop: '40px', 
            paddingBottom: '40px',
            position: 'relative',
            zIndex: 10
        }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '100%',
                background: `radial-gradient(circle at center, ${isDark ? 'rgba(180, 145, 43, 0.05)' : 'rgba(180, 145, 43, 0.03)'} 0%, transparent 70%)`,
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: -1
            }} />

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        background: isDark ? 'rgba(15, 15, 15, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                        borderRadius: '40px',
                        overflow: 'hidden',
                        boxShadow: isDark 
                            ? '0 60px 120px -30px rgba(0,0,0,0.6)' 
                            : '0 60px 120px -30px rgba(180, 145, 43, 0.1)',
                    }}
                >
                    {/* The "Dropdown" Trigger Bar */}
                    <div 
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            padding: '1.75rem 2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            background: isExpanded ? (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(180,145,43,0.02)') : 'transparent',
                            transition: 'all 0.4s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <motion.div 
                                animate={{ 
                                    scale: isExpanded ? 1.1 : 1,
                                    boxShadow: isExpanded ? '0 0 20px rgba(180, 145, 43, 0.4)' : 'none'
                                }}
                                style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    background: 'var(--wapixo-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    transition: 'all 0.4s ease'
                                }}
                            >
                                <Smartphone size={26} />
                            </motion.div>
                            <div>
                                <h2 style={{ 
                                    margin: 0, 
                                    fontSize: '1.4rem', 
                                    fontWeight: 500, 
                                    color: 'var(--wapixo-text)',
                                    letterSpacing: '-0.03em'
                                }}>
                                    Launch the Customer Experience
                                </h2>
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: '0.9rem', 
                                    color: 'var(--wapixo-text-muted)',
                                    opacity: 0.8
                                }}>
                                    Elite salon bookings, discovery, and rewards.
                                </p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {!isExpanded && (
                                <span style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600, 
                                    color: 'var(--wapixo-primary)', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.1em' 
                                }} className="hidden-mobile">
                                    Click to Explore
                                </span>
                            )}
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ChevronDown size={22} style={{ opacity: 0.7 }} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Expandable "Mega" Panel */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '1rem 3rem 4rem 3rem' }}>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '1.1fr 1fr', 
                                        gap: '5rem', 
                                        alignItems: 'center'
                                    }} className="app-hero-grid">
                                        
                                        {/* Main Content Area */}
                                        <div style={{ textAlign: 'left' }}>
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h1 style={{
                                                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                                                    fontWeight: 300,
                                                    letterSpacing: '-0.04em',
                                                    lineHeight: 1.05,
                                                    margin: '0 0 2rem 0',
                                                    color: 'var(--wapixo-text)'
                                                }}>
                                                    Elegance <br />
                                                    <em style={{ color: 'var(--wapixo-primary)', fontWeight: 300, fontFamily: "'Libre Baskerville', serif" }}>
                                                        Redefined.
                                                    </em>
                                                </h1>
                                                
                                                <p style={{
                                                    fontSize: '1.15rem',
                                                    color: 'var(--wapixo-text-muted)',
                                                    fontWeight: 300,
                                                    lineHeight: 1.8,
                                                    marginBottom: '3rem',
                                                    maxWidth: '520px'
                                                }}>
                                                    Elevate your self-care routine with the ultimate salon companion. 
                                                    From artisanal cuts to luxury treatments, the world of beauty is now 
                                                    just a tap away.
                                                </p>

                                                <div style={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: '1fr', 
                                                    gap: '1.5rem', 
                                                    marginBottom: '3.5rem' 
                                                }}>
                                                    {features.map((f, i) => (
                                                        <motion.div 
                                                            key={i} 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.4 + (i * 0.1) }}
                                                            style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}
                                                        >
                                                            <div style={{ 
                                                                width: '44px',
                                                                height: '44px',
                                                                borderRadius: '12px', 
                                                                background: `${isDark ? 'rgba(180,145,43,0.1)' : 'rgba(180,145,43,0.08)'}`,
                                                                color: 'var(--wapixo-primary)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: `1px solid ${isDark ? 'rgba(180,145,43,0.15)' : 'rgba(180,145,43,0.1)'}`
                                                            }}>
                                                                <f.icon size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{f.title}</h4>
                                                                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--wapixo-text-muted)', fontWeight: 400 }}>{f.desc}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(180, 145, 43, 0.4)' }}
                                                        whileTap={{ scale: 0.96 }}
                                                        style={{
                                                            background: 'var(--wapixo-primary)',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '1.1rem 2.8rem',
                                                            borderRadius: '100px',
                                                            fontSize: '1rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 10px 30px rgba(180, 145, 43, 0.2)'
                                                        }}
                                                    >
                                                        <Download size={22} />
                                                        Download App
                                                    </motion.button>
                                                    
                                                    <button style={{
                                                        background: 'none',
                                                        border: '1px solid var(--wapixo-border)',
                                                        color: 'var(--wapixo-text)',
                                                        padding: '1rem 2rem',
                                                        borderRadius: '100px',
                                                        fontSize: '0.95rem',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.borderColor = 'var(--wapixo-primary)'}
                                                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--wapixo-border)'}
                                                    >
                                                        Watch Demo
                                                        <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Visual Mockup Area */}
                                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', perspective: '1200px' }}>
                                            <motion.div 
                                                initial={{ opacity: 0, rotateY: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                                style={{
                                                    width: '280px',
                                                    aspectRatio: '9/19.2',
                                                    background: isDark ? '#080808' : '#fff',
                                                    borderRadius: '48px',
                                                    border: `10px solid ${isDark ? '#222' : '#1a1a1a'}`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    boxShadow: isDark 
                                                        ? '0 60px 100px -20px rgba(0,0,0,0.8)' 
                                                        : '0 60px 100px -20px rgba(0,0,0,0.2)',
                                                }}
                                            >
                                                <img 
                                                    src="/image1.png" 
                                                    alt="App Interface" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                
                                                {/* UI Overlays */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '0',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '80px',
                                                    height: '24px',
                                                    background: '#1a1a1a',
                                                    borderRadius: '0 0 16px 16px',
                                                    zIndex: 10
                                                }} />
                                            </motion.div>
                                            
                                            {/* Floating Info Badge */}
                                            <motion.div 
                                                animate={{ y: [-15, 15, -15] }}
                                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '15%',
                                                    right: '-20px',
                                                    background: isDark ? 'rgba(255,255,255,0.95)' : 'white',
                                                    padding: '1rem 1.5rem',
                                                    borderRadius: '24px',
                                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    color: '#000',
                                                    zIndex: 100,
                                                    border: '1px solid rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--wapixo-primary)' }}>New User Gift</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Get 20% OFF</span>
                                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>On your first booking</span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <style>{`
                @media (max-width: 1000px) {
                    .app-hero-grid {
                        grid-template-columns: 1fr !important;
                        text-align: center !important;
                        gap: 4rem !important;
                    }
                    .app-hero-grid > div {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center !important;
                    }
                    .hidden-mobile { display: none !important; }
                }
            `}</style>
        </section>
    );
}
