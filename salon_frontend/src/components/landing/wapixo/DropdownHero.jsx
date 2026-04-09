import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function DropdownHero() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <section style={{
            height: '65vh',
            width: '100%',
            background: isDark ? '#050505' : '#F5F5F7',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
        }}>
            {/* The "Dropdown" Curtain Effect Background */}
            <motion.div
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: isDark ? '#111' : '#FFFFFF',
                    zIndex: -1,
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
                }}
            />

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                height: '100%',
                padding: '120px 2rem 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'start'
                }} className="hero-content">
                    
                    {/* Left: Bold Headline */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 1 }}
                    >
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                            fontWeight: 600,
                            letterSpacing: '-0.04em',
                            lineHeight: 1,
                            margin: 0,
                            color: 'var(--wapixo-text)',
                            textTransform: 'uppercase'
                        }}>
                            Revolutionizing <br />
                            Salon mastery
                        </h1>
                    </motion.div>

                    {/* Right: Subtext */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                        style={{ paddingTop: '10px' }}
                    >
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'var(--wapixo-text-muted)',
                            fontWeight: 400,
                            lineHeight: 1.6,
                            maxWidth: '400px',
                            margin: 0
                        }}>
                             Elevate your boutique management with our high-end 
                             customer application. Seamless bookings, elite discovery, 
                             and digital loyalty in one elegant interface.
                        </p>
                    </motion.div>
                </div>

                {/* Bottom Actions: Centered Centrally */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    style={{
                        marginTop: '4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem'
                    }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            padding: '1.2rem 3rem',
                            borderRadius: '100px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                        }}
                    >
                        DOWNLOAD APP <Download size={18} />
                    </motion.button>

                    <motion.button
                        whileHover={{ background: 'rgba(0,0,0,0.05)' }}
                        style={{
                            background: 'none',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                            color: 'var(--wapixo-text)',
                            padding: '1.2rem 3rem',
                            borderRadius: '100px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        LEARN MORE <ArrowRight size={18} />
                    </motion.button>
                </motion.div>
            </div>

            {/* Subtle numbering/info decoration like screenshot */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '2rem',
                fontSize: '0.65rem',
                color: 'var(--wapixo-text-muted)',
                opacity: 0.5,
                fontWeight: 600,
                letterSpacing: '0.1em'
            }}>
                001 / 004
            </div>

            <style>{`
                @media (max-width: 800px) {
                    .hero-content {
                        grid-template-columns: 1fr !important;
                        text-align: center !important;
                        gap: 2rem !important;
                    }
                    .hero-content div {
                        display: flex;
                        justify-content: center;
                    }
                    .hero-content h1 {
                        font-size: 2.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
