import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield, Zap, Heart, Globe, Users, Trophy, Target, Sparkles } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { useTheme } from '../../contexts/ThemeContext';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import WapixoFooter from '../../components/landing/wapixo/WapixoFooter';
import SmoothScroll from '../../components/landing/wapixo/SmoothScroll';

const ICON_MAP = {
    'Lightning Fast': Zap,
    'Enterprise Security': Shield,
    'Built for Salons': Heart,
    'Cloud Native': Globe
};

export default function AboutPage() {
    const { theme } = useTheme();
    const { about } = useContent();
    const [activeCards, setActiveCards] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleCard = (title) => {
        if (!isMobile) return;
        setActiveCards(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    // CMS data fallback values
    const badgeText = about?.badge || 'About Wapixo';
    const headingText = about?.heading || 'Built by Salon Experts, For Salon Owners';
    const paragraph1 = about?.para1 || 'We understand the unique challenges of running a salon business. From managing walk-ins to tracking product inventory, from retaining clients to growing revenue — SalonCRM handles it all so you can focus on what you do best: making people look amazing.';
    const paragraph2 = about?.para2 || 'Trusted by 500+ salons across India, our platform processes over 50,000 appointments every month with 99.9% uptime.';
    const valuesList = about?.values || [
        {
            title: 'Lightning Fast',
            desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.',
            image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'Enterprise Security',
            desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'Built for Salons',
            desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.',
            image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'
        },
        {
            title: 'Cloud Native',
            desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
        }
    ];

    return (
        <SmoothScroll>
            <div className="new-theme" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)' }}>
                <Helmet>
                    <title>About Wapixo — Our Mission & Core Values | Salon CRM</title>
                    <meta name="description" content="Discover the story behind Wapixo. Learn how we build modern salon management technology to empower salon owners, managers, and stylists across India." />
                    <link rel="canonical" href="https://wapixo.com/about" />
                </Helmet>
                <WapixoNavbar />

                {/* Cinematic Header/Hero */}
                <div style={{ paddingTop: '120px', paddingBottom: '60px', position: 'relative', overflow: 'hidden' }}>
                    {/* Background glow */}
                    <div style={{ position: 'absolute', inset: 0, opacity: theme === 'dark' ? 0.15 : 0.04, pointerEvents: 'none' }}>
                        <div style={{ position: 'absolute', top: '-20%', left: '10%', width: '600px', height: '600px', background: 'var(--wapixo-primary)', borderRadius: '50%', filter: 'blur(150px)' }} />
                        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '600px', height: '600px', background: 'var(--wapixo-text)', borderRadius: '50%', filter: 'blur(180px)' }} />
                    </div>

                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                color: 'var(--wapixo-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.45em',
                                display: 'block',
                                marginBottom: '1.5rem'
                            }}
                        >
                            {badgeText}
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.8 }}
                            style={{
                                fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                                fontWeight: 200,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.1,
                                margin: '0 auto 2rem',
                                maxWidth: '900px',
                                color: 'var(--wapixo-text)'
                            }}
                        >
                            {headingText}
                        </motion.h1>
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            style={{
                                width: '80px',
                                height: '1px',
                                background: 'var(--wapixo-primary)',
                                margin: '0 auto 2.5rem',
                                transformOrigin: 'center'
                            }}
                        />
                    </div>
                </div>

                {/* Our Story / Intro Section */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 100px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        {/* Text Block */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <p style={{
                                fontSize: '1.15rem',
                                lineHeight: 1.7,
                                color: 'var(--wapixo-text-muted)',
                                marginBottom: '2rem',
                                fontWeight: 300
                            }}>
                                {paragraph1}
                            </p>
                            <p style={{
                                fontSize: '1rem',
                                lineHeight: 1.7,
                                color: 'var(--wapixo-text-muted)',
                                opacity: 0.8,
                                fontWeight: 300,
                                marginBottom: '3rem'
                            }}>
                                {paragraph2}
                            </p>

                            {/* Bullet points with icons */}
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180, 145, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCentent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                                        <Trophy size={16} color="var(--wapixo-primary)" />
                                    </div>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 400 }}>Award-winning salon management tools</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180, 145, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCentent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                                        <Users size={16} color="var(--wapixo-primary)" />
                                    </div>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 400 }}>Dedicated 24/7 technical support</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180, 145, 43, 0.1)', display: 'flex', alignItems: 'center', justifyCentent: 'center', flexShrink: 0, justifyContent: 'center' }}>
                                        <Target size={16} color="var(--wapixo-primary)" />
                                    </div>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 400 }}>Continuous feature rollout & customization</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Interactive Image Frame */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            style={{ position: 'relative' }}
                        >
                            <div style={{
                                position: 'relative',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid var(--wapixo-border)',
                                aspectRatio: '4/3',
                                background: 'var(--wapixo-bg-alt)'
                            }}>
                                <img
                                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"
                                    alt="Salon operation"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: theme === 'dark' ? 'grayscale(0.3) brightness(0.9)' : 'none'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                                    pointerEvents: 'none'
                                }} />
                            </div>

                            {/* Floating details overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-20px',
                                right: '-10px',
                                background: 'var(--wapixo-bg-alt)',
                                border: '1px solid var(--wapixo-border)',
                                padding: '1rem 1.5rem',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                            }}>
                                <Sparkles size={16} color="var(--wapixo-primary)" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Built with Care</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Core Values Section */}
                <div style={{ background: 'var(--wapixo-bg-alt)', borderTop: '1px solid var(--wapixo-border)', borderBottom: '1px solid var(--wapixo-border)', padding: '100px 0' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <span style={{ color: 'var(--wapixo-primary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em' }}>Foundations</span>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 300, marginTop: '0.5rem', letterSpacing: '-0.02em' }}>Our Core Pillars</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                            {valuesList.map((value, idx) => {
                                const Icon = ICON_MAP[value.title] || Zap;
                                const isActive = activeCards[value.title];
                                return (
                                    <motion.div
                                        key={value.title}
                                        initial={{ opacity: 0, y: 25 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                                        onClick={() => toggleCard(value.title)}
                                        style={{
                                            position: 'relative',
                                            minHeight: '280px',
                                            background: 'var(--wapixo-bg)',
                                            border: '1px solid var(--wapixo-border)',
                                            padding: '2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            overflow: 'hidden',
                                            cursor: isMobile ? 'pointer' : 'default',
                                        }}
                                        className="group"
                                    >
                                        {/* Background Image Reveal */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 0,
                                            opacity: isActive ? 1 : 0,
                                            transition: 'opacity 0.5s ease',
                                        }}
                                        className="value-bg-image-container"
                                        >
                                            <img
                                                src={value.image}
                                                alt={value.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    filter: 'grayscale(0.5) contrast(1.1) brightness(0.4)',
                                                }}
                                            />
                                        </div>

                                        {/* Content Layer */}
                                        <div style={{ position: 'relative', zIndex: 10, transition: 'transform 0.4s ease' }} className="value-content-layer">
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                background: isActive ? 'var(--wapixo-primary)' : 'rgba(180, 145, 43, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1.5rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            className="value-icon-box"
                                            >
                                                <Icon size={20} color={isActive ? 'white' : 'var(--wapixo-primary)'} className="value-icon" />
                                            </div>

                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                marginBottom: '0.75rem',
                                                color: isActive ? 'white' : 'var(--wapixo-text)',
                                                transition: 'color 0.3s ease'
                                            }}
                                            className="value-title-text"
                                            >
                                                {value.title}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.85rem',
                                                lineHeight: 1.6,
                                                color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--wapixo-text-muted)',
                                                margin: 0,
                                                transition: 'color 0.3s ease'
                                            }}
                                            className="value-desc-text"
                                            >
                                                {value.desc}
                                            </p>
                                        </div>

                                        {/* Animated Accent Border */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            height: '3px',
                                            background: 'var(--wapixo-primary)',
                                            width: isActive ? '100%' : '0%',
                                            transition: 'width 0.5s ease'
                                        }}
                                        className="value-bottom-bar"
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Vision / Quote Section */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 2rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span style={{ color: 'var(--wapixo-primary)', fontSize: '2.5rem', fontFamily: 'serif', display: 'block', marginBottom: '1rem', height: '20px' }}>“</span>
                        <p style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 200, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--wapixo-text-muted)', marginBottom: '2rem' }}>
                            We aren't just building tools. We are designing the digital engine that enables beauty creators and salon owners to amplify their craft and deliver unmatched experiences.
                        </p>
                        <div style={{ width: '40px', height: '1px', background: 'var(--wapixo-primary)', margin: '0 auto 1.5rem', opacity: 0.6 }} />
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--wapixo-text)', margin: 0 }}>The Wapixo Team</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--wapixo-text-muted)', margin: '0.25rem 0 0' }}>Mumbai, India</p>
                    </motion.div>
                </div>

                <WapixoFooter />
            </div>

            {/* Custom hover effects for non-mobile using pure CSS */}
            <style>{`
                @media (min-width: 1024px) {
                    .group:hover .value-bg-image-container {
                        opacity: 1 !important;
                    }
                    .group:hover .value-icon-box {
                        background: var(--wapixo-primary) !important;
                    }
                    .group:hover .value-icon {
                        color: white !important;
                    }
                    .group:hover .value-title-text {
                        color: white !important;
                    }
                    .group:hover .value-desc-text {
                        color: rgba(255,255,255,0.8) !important;
                    }
                    .group:hover .value-bottom-bar {
                        width: 100% !important;
                    }
                }
            `}</style>
        </SmoothScroll>
    );
}
