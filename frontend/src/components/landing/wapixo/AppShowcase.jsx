import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Calendar, Scissors, Crown, Star, Download } from 'lucide-react';

/* ─── Reusable Phone Frame ─────────────────────────────────────── */
function PhoneFrame({ style, className = '', imgSrc }) {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                width: '220px',
                aspectRatio: '9 / 19.5',
                borderRadius: '2.8rem',
                border: '8px solid #1a1a1a',
                boxShadow: '0 35px 80px -10px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
                background: '#fff',
                ...style,
            }}
        >
            {/* Dynamic Island */}
            <div style={{
                position: 'absolute', inset: 0, top: 0, left: 0, right: 0, zIndex: 10,
                height: '28px', background: '#1a1a1a',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '5px',
                borderRadius: '2.2rem 2.2rem 0 0',
            }}>
                <div style={{
                    width: '68px', height: '14px', background: '#000', borderRadius: '9999px',
                }} />
            </div>

            {/* Screen image */}
            <img
                src={imgSrc || '/image1.png'}
                alt="Customer App"
                style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top',
                }}
            />

            {/* Gloss shine */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
            }} />
        </div>
    );
}

/* ─── Features list items ────────────────────────────────────── */
const features = [
    { icon: Calendar, label: 'Easy Booking', desc: 'One-tap appointment scheduling, anytime.' },
    { icon: Scissors, label: 'Service Catalogue', desc: 'Browse haircuts, facials, styling & more.' },
    { icon: Crown, label: 'Membership Plans', desc: 'Platinum & Gold tiers with exclusive perks.' },
    { icon: Star, label: 'Ratings & Reviews', desc: 'Real reviews from thousands of clients.' },
];

/* ─── Main Component ─────────────────────────────────────────── */
export default function AppShowcase() {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);

    const sectionBg = theme === 'dark'
        ? 'radial-gradient(circle at 20% 50%, #0d0d0d, #050505)'
        : 'radial-gradient(circle at 20% 50%, #fdf9f4, #ffffff)';

    // Cycle images every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Configuration for the 3 visual slots
    const getPosProps = (index) => {
        // Calculate relative position (0=Front, 1=RightBack, 2=LeftBack)
        const relPos = (index - activeIndex + 3) % 3;

        if (relPos === 0) { // Front Middle
            return {
                x: 0,
                scale: 1.15,
                zIndex: 10,
                opacity: 1,
                filter: 'blur(0px)',
            };
        } else if (relPos === 1) { // Right Back
            return {
                x: 150,
                scale: 0.75,
                zIndex: 5,
                opacity: 0.8,
                filter: 'blur(1px)',
            };
        } else { // Left Back
            return {
                x: -150,
                scale: 0.75,
                zIndex: 1,
                opacity: 0.8,
                filter: 'blur(1px)',
            };
        }
    };

    return (
        <section
            style={{ background: sectionBg, overflow: 'hidden', position: 'relative' }}
            className="py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-20 lg:gap-x-8 items-center">

                    {/* ── LEFT: Phones (Soft, State-Driven Carousel) ── */}
                    <div className="relative flex justify-center items-center"
                        style={{ height: '600px', perspective: '1500px' }}>

                        {[0, 1, 2].map((i) => {
                            const props = getPosProps(i);
                            const isActive = i === activeIndex;

                            return (
                                <motion.div
                                    key={i}
                                    style={{ position: 'absolute' }}
                                    animate={props}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 60, // Significantly lowered for "soft" feel
                                        damping: 20,
                                        mass: 1.2
                                    }}
                                >
                                    {/* Sub-motion for subtle idle float (The softness factor) */}
                                    <motion.div
                                        animate={isActive ? { y: [0, -10, 0] } : { y: 0 }}
                                        transition={{
                                            duration: 5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <PhoneFrame
                                            imgSrc="/image1.png"
                                            style={isActive ? {
                                                width: '240px',
                                                border: '9px solid #111',
                                                boxShadow: '0 50px 100px -15px rgba(0,0,0,0.4)',
                                            } : {}}
                                        />
                                    </motion.div>
                                </motion.div>
                            );
                        })}

                        {/* Ground shadow glow */}
                        <div style={{
                            position: 'absolute', bottom: '40px',
                            width: '320px', height: '30px',
                            background: 'radial-gradient(circle, rgba(180,145,43,0.3), transparent 70%)',
                            borderRadius: '100%', filter: 'blur(30px)',
                            zIndex: 0,
                        }} />
                    </div>

                    {/* ── RIGHT: Content ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        viewport={{ once: true }}
                    >
                        {/* Label */}
                        <p style={{
                            color: '#B4912B',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                            marginBottom: '1rem',
                        }}>
                            Customer Mobile App
                        </p>

                        <h2 style={{
                            fontFamily: "'Libre Baskerville', serif",
                            fontWeight: 400,
                            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                            color: 'var(--wapixo-text)',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em',
                            marginBottom: '1.25rem',
                        }}>
                            Book. Discover. <br />
                            <em>Enjoy.</em>
                        </h2>

                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '1.05rem',
                            fontWeight: 300,
                            color: 'var(--wapixo-text-muted)',
                            lineHeight: 1.75,
                            maxWidth: '440px',
                            marginBottom: '2.5rem',
                        }}>
                            Give your clients the luxury experience they deserve — premium bookings,
                            curated services, and exclusive membership plans, all in one elegant app.
                        </p>

                        <ul style={{
                            listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0',
                            display: 'flex', flexDirection: 'column', gap: '1.1rem'
                        }}>
                            {features.map(({ icon: Icon, label, desc }) => (
                                <li key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <span style={{
                                        width: '38px', height: '38px', flexShrink: 0,
                                        borderRadius: '100px',
                                        background: 'rgba(180,145,43,0.1)',
                                        border: '1px solid rgba(180,145,43,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={17} color="#B4912B" />
                                    </span>
                                    <div>
                                        <p style={{
                                            margin: 0, fontFamily: "'Inter', sans-serif",
                                            fontWeight: 600, fontSize: '0.9rem',
                                            color: 'var(--wapixo-text)'
                                        }}>
                                            {label}
                                        </p>
                                        <p style={{
                                            margin: '2px 0 0', fontFamily: "'Inter', sans-serif",
                                            fontWeight: 300, fontSize: '0.82rem',
                                            color: 'var(--wapixo-text-muted)'
                                        }}>
                                            {desc}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: '0 12px 30px rgba(180,145,43,0.3)' }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#B4912B', color: '#fff', border: 'none',
                                    borderRadius: '100px', padding: '0.85rem 2rem',
                                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.9rem',
                                    cursor: 'pointer', letterSpacing: '0.03em', transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 20px rgba(180,145,43,0.2)',
                                }}
                            >
                                <Download size={16} />
                                Download App
                            </motion.button>
                            <a href="#" style={{
                                fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 500,
                                color: 'var(--wapixo-text)', textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                            }} className="group">
                                View Demo
                                <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
                            </a>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
