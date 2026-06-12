import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { Calendar, Scissors, Crown, Star, Download, Smartphone } from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUtils';
import api from '../../../services/api';

/* ─── Reusable Phone Frame ─────────────────────────────────────── */
function PhoneFrame({ style, className = '', imgSrc }) {
    return (
        <div
            className={`relative overflow-hidden phone-frame-device ${className}`}
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
            <div 
                className="phone-island"
                style={{
                    position: 'absolute', inset: 0, top: 0, left: 0, right: 0, zIndex: 10,
                    height: '28px', background: '#1a1a1a',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '5px',
                    borderRadius: '2.2rem 2.2rem 0 0',
                }}
            >
                <div 
                    className="phone-island-inner"
                    style={{
                        width: '68px', height: '14px', background: '#000', borderRadius: '9999px',
                    }} 
                />
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
export default function AppShowcase({ data }) {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const [appLinks, setAppLinks] = useState({});
    const [phoneOffset, setPhoneOffset] = useState(150);

    // Fetch app links from CMS
    useEffect(() => {
        api.get('/cms').then(res => {
            if (res.data?.data?.app_links) {
                setAppLinks(res.data.data.app_links);
            }
        }).catch(() => { });
    }, []);

    // Responsive phone offset detection
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 480) {
                setPhoneOffset(60);
            } else if (window.innerWidth < 768) {
                setPhoneOffset(90);
            } else {
                setPhoneOffset(150);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sectionBg = theme === 'dark'
        ? 'radial-gradient(circle at 20% 50%, #0d0d0d, #050505)'
        : 'radial-gradient(circle at 20% 50%, #fdf9f4, #ffffff)';

    // Fallbacks
    const overline = data?.overline || 'Customer Mobile App';
    const headlinePart1 = data?.headline_part1 || 'Book. Discover.';
    const headlinePart2 = data?.headline_part2 || 'Enjoy.';
    const desc = data?.desc || 'Give your clients the luxury experience they deserve — premium bookings, curated services, and exclusive membership plans, all in one elegant app.';

    const imageUrl1 = data?.image_url_1 ? getImageUrl(data.image_url_1) : '/image1.png';
    const imageUrl2 = data?.image_url_2 ? getImageUrl(data.image_url_2) : '/image1.png';
    const imageUrl3 = data?.image_url_3 ? getImageUrl(data.image_url_3) : '/image1.png';
    const images = [imageUrl1, imageUrl2, imageUrl3];

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
                x: phoneOffset,
                scale: 0.75,
                zIndex: 5,
                opacity: 0.8,
                filter: 'blur(1px)',
            };
        } else { // Left Back
            return {
                x: -phoneOffset,
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
            className="py-12 sm:py-24 lg:py-32"
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-20 lg:gap-x-8 items-center">

                    {/* ── LEFT: Phones (Soft, State-Driven Carousel) ── */}
                    <div className="relative flex justify-center items-center phone-showcase-container"
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
                                            imgSrc={images[i]}
                                            className={isActive ? 'active-phone-frame' : ''}
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
                            {overline}
                        </p>

                        <h2 style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 200,
                            fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                            color: 'var(--wapixo-text)',
                            lineHeight: 1.05,
                            letterSpacing: '-0.035em',
                            marginBottom: '1.25rem',
                        }}>
                            {headlinePart1} <br />
                            <span style={{ fontWeight: 500 }}>{headlinePart2}</span>
                        </h2>

                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '1rem',
                            fontWeight: 300,
                            color: 'var(--wapixo-text-muted)',
                            lineHeight: 1.7,
                            maxWidth: '420px',
                            marginBottom: '2.5rem',
                        }}>
                            {desc}
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

                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.5rem', maxWidth: '500px' }} className="app-download-grid">
                            {[
                                { name: 'Admin App', icon: <Smartphone size={16} />, url: appLinks.admin_app },
                                { name: 'Staff App', icon: <Smartphone size={16} />, url: appLinks.staff_app },
                                { name: 'Customer App', icon: <Smartphone size={16} />, url: appLinks.customer_app },
                                { name: 'Admin iOS', icon: <svg width={16} height={16} viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>, url: appLinks.admin_ios },
                                { name: 'Staff iOS', icon: <svg width={16} height={16} viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>, url: appLinks.staff_ios },
                                { name: 'Customer iOS', icon: <svg width={16} height={16} viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path></svg>, url: appLinks.customer_ios },
                            ].map((btn, idx) => (
                                <motion.button
                                    key={idx}
                                    className="app-download-btn"
                                    whileHover={{ scale: 1.03, boxShadow: '0 8px 20px rgba(180,145,43,0.2)' }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => btn.url && window.open(btn.url, '_blank', 'noopener,noreferrer')}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fdf9f4',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        border: '1px solid rgba(180,145,43,0.3)',
                                        borderRadius: '8px', padding: '0.8rem 1rem',
                                        fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.75rem',
                                        cursor: btn.url ? 'pointer' : 'default', letterSpacing: '0.03em', transition: 'all 0.3s ease',
                                        opacity: btn.url ? 1 : 0.6,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (btn.url) {
                                            e.currentTarget.style.background = '#B4912B';
                                            e.currentTarget.style.color = '#fff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fdf9f4';
                                        e.currentTarget.style.color = theme === 'dark' ? '#fff' : '#000';
                                    }}
                                >
                                    {btn.icon}
                                    {btn.name}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>

            <style>{`
                .app-download-grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                }
                .app-download-btn {
                    padding: 0.8rem 0.5rem !important;
                    font-size: 0.75rem !important;
                }
                .phone-frame-device {
                    width: 220px !important;
                }
                .active-phone-frame {
                    width: 240px !important;
                }
                @media (max-width: 768px) {
                    .phone-showcase-container {
                        height: 420px !important;
                    }
                    .phone-frame-device {
                        width: 140px !important;
                        border-width: 5px !important;
                        border-radius: 1.8rem !important;
                    }
                    .active-phone-frame {
                        width: 160px !important;
                        border-width: 6px !important;
                        border-radius: 2rem !important;
                    }
                    .phone-island {
                        height: 18px !important;
                        padding-bottom: 3px !important;
                    }
                    .phone-island-inner {
                        width: 44px !important;
                        height: 9px !important;
                    }
                    .app-download-btn {
                        padding: 0.6rem 0.25rem !important;
                        font-size: 0.65rem !important;
                        gap: 0.25rem !important;
                    }
                }
                @media (max-width: 480px) {
                    .phone-showcase-container {
                        height: 320px !important;
                    }
                    .phone-frame-device {
                        width: 105px !important;
                        border-width: 4px !important;
                        border-radius: 1.4rem !important;
                    }
                    .active-phone-frame {
                        width: 120px !important;
                        border-width: 4.5px !important;
                        border-radius: 1.6rem !important;
                    }
                    .phone-island {
                        height: 14px !important;
                        padding-bottom: 2px !important;
                    }
                    .phone-island-inner {
                        width: 32px !important;
                        height: 6px !important;
                    }
                    .app-download-btn {
                        padding: 0.5rem 0.15rem !important;
                        font-size: 0.55rem !important;
                        gap: 0.15rem !important;
                    }
                }
            `}</style>
        </section>
    );
}
