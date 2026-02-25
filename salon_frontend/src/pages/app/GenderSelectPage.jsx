import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGender } from '../../contexts/GenderContext';
import { ArrowRight } from 'lucide-react';

const MEN_IMG = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80';
const WOMEN_IMG = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80';

export default function GenderSelectPage() {
    const navigate = useNavigate();
    const { setGender } = useGender();

    const pick = (g) => {
        setGender(g);
        navigate('/app', { replace: true });
    };

    return (
        <div style={{
            minHeight: '100svh',
            background: '#0E0E0E',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Open Sans', 'Noto Serif', sans-serif",
            overflow: 'hidden',
            position: 'relative',
        }}>

            {/* ── AMBIENT GLOW ── */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,149,108,0.08) 0%, transparent 70%)',
            }} />

            {/* ── HEADER ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ padding: '56px 24px 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}
            >
                {/* Logo mark */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        width: '52px', height: '52px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #C8956C, #8c5c35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 8px 24px rgba(200,149,108,0.3)',
                        fontSize: '22px',
                    }}
                >
                    💇
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}
                >
                    Your Style, Your Way
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}
                >
                    Choose your preference to personalize the experience
                </motion.p>
            </motion.div>

            {/* ── GENDER CARDS ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: '14px', padding: '0 20px 40px', position: 'relative', zIndex: 1,
            }}>

                {/* ─── MEN CARD ─── */}
                <motion.button
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick('men')}
                    style={{
                        flex: 1,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        background: 'none',
                        minHeight: '0',
                    }}
                >
                    {/* Background image */}
                    <img src={MEN_IMG} alt="Men"
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', display: 'block',
                        }}
                    />
                    {/* Dark gradient overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(10,6,2,0.92) 0%, rgba(10,6,2,0.3) 50%, rgba(10,6,2,0.1) 100%)',
                    }} />
                    {/* Amber glow at bottom */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                        background: 'linear-gradient(to top, rgba(200,149,108,0.12) 0%, transparent 100%)',
                    }} />

                    {/* Content */}
                    <div style={{
                        position: 'relative', zIndex: 2,
                        display: 'flex', flexDirection: 'column',
                        height: '100%', justifyContent: 'flex-end',
                        padding: '24px',
                        textAlign: 'left',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                                    I'm looking for
                                </p>
                                <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Men</h2>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
                                    Haircuts · Beard · Grooming
                                </p>
                            </div>
                            <div style={{
                                width: '48px', height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <ArrowRight size={20} color="#fff" />
                            </div>
                        </div>

                        {/* Pills */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                            {['Haircut', 'Beard Trim', 'Hair Spa', 'Massage'].map(tag => (
                                <span key={tag} style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '20px', padding: '5px 12px',
                                    fontSize: '11px', color: 'rgba(255,255,255,0.7)',
                                    fontWeight: 500,
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.button>

                {/* ─── WOMEN CARD ─── */}
                <motion.button
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => pick('women')}
                    style={{
                        flex: 1,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        background: 'none',
                        minHeight: '0',
                    }}
                >
                    <img src={WOMEN_IMG} alt="Women"
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', display: 'block',
                        }}
                    />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(10,6,2,0.92) 0%, rgba(10,6,2,0.3) 50%, rgba(10,6,2,0.1) 100%)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                        background: 'linear-gradient(to top, rgba(200,149,108,0.12) 0%, transparent 100%)',
                    }} />

                    <div style={{
                        position: 'relative', zIndex: 2,
                        display: 'flex', flexDirection: 'column',
                        height: '100%', justifyContent: 'flex-end',
                        padding: '24px',
                        textAlign: 'left',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                                    I'm looking for
                                </p>
                                <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Women</h2>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>
                                    Hair · Skin · Nails · Spa
                                </p>
                            </div>
                            <div style={{
                                width: '48px', height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(200,149,108,0.2)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(200,149,108,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <ArrowRight size={20} color="#C8956C" />
                            </div>
                        </div>

                        {/* Pills */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                            {['Bridal', 'Facial', 'Nail Art', 'Hair Color', 'Spa'].map(tag => (
                                <span key={tag} style={{
                                    background: 'rgba(200,149,108,0.12)',
                                    backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(200,149,108,0.2)',
                                    borderRadius: '20px', padding: '5px 12px',
                                    fontSize: '11px', color: '#C8956C',
                                    fontWeight: 500,
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.button>
            </div>

            {/* ── FOOTER NOTE ── */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.2)',
                    padding: '0 24px 28px',
                    position: 'relative', zIndex: 1,
                }}
            >
                You can change this anytime from your profile
            </motion.p>
        </div>
    );
}
