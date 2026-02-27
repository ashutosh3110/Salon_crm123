import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useGender } from '../../contexts/GenderContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, SlidersHorizontal, Heart, Star, ArrowRight, ShieldCheck, Ticket, Crown, Gift, Zap,
    Moon, Bell, Sun, Search, Clock
} from 'lucide-react';
import { MOCK_OUTLET, PRODUCT_CATEGORIES, MOCK_SERVICES } from '../../data/appMockData';
import homeData from '../../data/appHomeData.json';
import logoLightMode from '/2-removebg-preview.png';
import logoDarkMode from '/1-removebg-preview.png';
import boyIcon from '/gender/boy.png';
import girlIcon from '/gender/girl.png';

const { MEMBERSHIP_PLANS, RUNNING_OFFERS, GENDER_DATA } = homeData;

function HeartBtn({ size = 20 }) {
    const [liked, setLiked] = useState(false);
    return (
        <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
        >
            <Heart size={size} strokeWidth={2}
                color={liked ? '#e53e3e' : 'rgba(255,255,255,0.55)'}
                fill={liked ? '#e53e3e' : 'none'}
            />
        </motion.button>
    );
}

function StarRow({ rating }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill="#C8956C" color="#C8956C" />
            <span style={{ fontSize: '11px', color: '#C8956C', fontWeight: 600 }}>{rating}</span>
        </span>
    );
}

const Particle = ({ i }) => {
    const size = Math.random() * 3 + 1;
    return (
        <motion.div
            initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
            }}
            animate={{
                y: [null, Math.random() * -100 - 50],
                opacity: [0, 0.6, 0]
            }}
            transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
            }}
            style={{
                position: 'fixed',
                width: size,
                height: size,
                background: '#C8956C',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 1001,
            }}
        />
    );
};

export default function AppHomePage() {
    const { customer } = useCustomerAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { gender, setGender } = useGender();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [showWelcome, setShowWelcome] = useState(location.state?.justLoggedIn || false);
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedExpert, setSelectedExpert] = useState(null);

    const EXPERT_DETAILS = {
        "Jake Rivera": { experience: "12 Years", bio: "Award-winning master barber specializing in heritage cuts and modern beard tailoring. Transforming style since 2012.", tags: ["Classic Fade", "Royal Shave", "Taper Design"] },
        "Carlos Mendez": { experience: "8 Years", bio: "Leading hair stylist with a focus on contemporary trends and precision scissor work. Artist of the craft.", tags: ["Modern Quiff", "Texture Cut", "Precision Styling"] },
        "Dan Fisher": { experience: "15 Years", bio: "The master of beard sculpting. Dan treats every beard like a piece of art. Renowned for detail.", tags: ["Beard Sculpt", "Stubble Groom", "Hot Towel"] },
        "Mark Chen": { experience: "10 Years", bio: "Expert colorist with a deep understanding of men's color dynamics and gray blending techniques.", tags: ["Gray Blend", "Sunlight Tints", "Creative Color"] },
        "Sofiya Liss": { experience: "9 Years", bio: "High-fashion stylist with a passion for bridal and editorial hair design. Making every client a muse.", tags: ["Bridal Style", "Editorial", "Glamour Waves"] },
        "Adrin Ross": { experience: "11 Years", bio: "Master colorist known for stunning transformations and protecting hair integrity. Color perfectionist.", tags: ["Balayage", "Vibrant Hues", "Color Correction"] },
        "Nina Patel": { experience: "7 Years", bio: "Elite nail artist specializing in luxury extensions and intricate hand-painted designs.", tags: ["Nail Extensions", "Hand Painted", "Luxury Spa"] },
        "Priya Kapoor": { experience: "14 Years", bio: "Advanced skin therapist dedicated to holistic rejuvenation and clinical skin health.", tags: ["Dermal Therapy", "Glow Facial", "Skin Ritual"] }
    };

    const placeholders = [
        "Search categories...",
        "Search for salons...",
        "Search specialists...",
        "Search for offers...",
        "Search hair styles..."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (showWelcome) {
            const timer = setTimeout(() => setShowWelcome(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [showWelcome]);

    // Fallback if gender is null
    const g = (gender === 'men' || gender === 'women') ? gender : 'women';
    const d = GENDER_DATA[g];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentPromoIndex(prev => (prev + 1) % d.promos.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [d.promos.length, g]);

    // Reset index when gender changes
    useEffect(() => {
        setCurrentPromoIndex(0);
    }, [g]);

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
    const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } } };

    /* ── Theme based colors ── */
    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        input: isLight ? '#EDF0F2' : '#242424',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        accent: '#C8956C'
    };

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{`
                .search-input::placeholder {
                    color: ${isLight ? '#555' : 'rgba(255,255,255,0.6)'};
                    opacity: 0.8;
                }
            `}</style>
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        key="premium-welcome-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            background: '#0a0a0a',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Dynamic Background */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    x: [0, 50, 0],
                                    y: [0, -30, 0]
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: '600px', height: '600px',
                                    background: 'radial-gradient(circle, rgba(200,149,108,0.12) 0%, transparent 70%)',
                                    filter: 'blur(80px)', top: '-10%', left: '-10%'
                                }}
                            />
                            <motion.div
                                animate={{
                                    scale: [1.3, 1, 1.3],
                                    x: [0, -40, 0],
                                    y: [0, 40, 0]
                                }}
                                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', width: '700px', height: '700px',
                                    background: 'radial-gradient(circle, rgba(160,104,68,0.08) 0%, transparent 70%)',
                                    filter: 'blur(100px)', bottom: '-15%', right: '-15%'
                                }}
                            />
                        </div>

                        {/* Particles */}
                        {[...Array(15)].map((_, i) => <Particle key={i} i={i} />)}

                        {/* Main Content Card */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                textAlign: 'center',
                                zIndex: 20,
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            {/* Sophisticated Icon Container */}
                            <motion.div
                                initial={{ rotate: -15, scale: 0.5, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 15 }}
                                style={{ position: 'relative', marginBottom: '40px' }}
                            >
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={logoDarkMode}
                                        alt="Logo"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />

                                    {/* Ambient Glow */}
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            inset: -10,
                                            background: 'radial-gradient(circle, rgba(200,149,108,0.3) 0%, transparent 70%)',
                                            zIndex: -1
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <motion.span
                                    initial={{ letterSpacing: '0.2em', opacity: 0 }}
                                    animate={{ letterSpacing: '0.5em', opacity: 0.8 }}
                                    transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                                    style={{
                                        display: 'block',
                                        color: '#C8956C',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        marginBottom: '12px',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                >
                                    Experience The Ritual
                                </motion.span>

                                <h1 style={{
                                    fontSize: '52px',
                                    fontWeight: 900,
                                    margin: 0,
                                    color: '#FFFFFF',
                                    fontFamily: "'Playfair Display', serif",
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                    fontStyle: 'italic',
                                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))'
                                }}>
                                    {customer?.name?.split(' ')[0] || 'Jagrati'}
                                </h1>

                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 120, opacity: 1 }}
                                    transition={{ delay: 1.2, duration: 1.2, ease: 'easeInOut' }}
                                    style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent, #C8956C, #A06844, transparent)',
                                        margin: '24px auto',
                                        boxShadow: '0 0 10px rgba(200,149,108,0.3)'
                                    }}
                                />

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5, duration: 1 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}
                                >
                                    <ShieldCheck size={14} />
                                    <span>Verified Premium Member</span>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Subtle Loader */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: '60px',
                                width: '200px',
                                height: '2px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '1px',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '100%' }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: '100px',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, #C8956C, transparent)'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                style={{
                    background: colors.bg,
                    minHeight: '100svh',
                    color: colors.text,
                    filter: showWelcome ? 'blur(10px) brightness(0.5)' : 'none',
                    scale: showWelcome ? 0.98 : 1,
                    transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* ── SEARCH BAR ── */}
                <motion.div variants={fadeUp} style={{ padding: '10px 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                        style={{
                            flex: 1,
                            background: isLight
                                ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                            boxShadow: isLight
                                ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                                : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                            borderRadius: '20px 6px 20px 6px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            height: '42px',
                            gap: '10px',
                            border: isFocused ? `1.5px solid ${colors.accent}` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <Search size={18} color={isFocused ? colors.accent : (isLight ? '#444' : 'rgba(255,255,255,0.7)')} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder={placeholders[placeholderIndex]}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: isLight ? '#000' : '#FFF',
                                fontSize: '14px',
                                width: '100%',
                                height: '100%',
                                fontWeight: 500
                            }}
                        />
                    </div>
                </motion.div>

                {/* ── GENDER TABS ── */}
                <motion.div variants={fadeUp} style={{ padding: '0 16px 12px', display: 'flex', gap: '0', borderBottom: `1px solid ${colors.border}` }}>
                    {['men', 'women'].map((tab) => (
                        <motion.button
                            key={tab}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setGender(tab)}
                            style={{
                                flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: g === tab ? 700 : 400,
                                color: g === tab ? (isLight ? '#000' : '#fff') : colors.textMuted,
                                transition: 'all 0.2s', textTransform: 'capitalize',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                position: 'relative'
                            }}
                        >
                            <img
                                src={tab === 'men' ? boyIcon : girlIcon}
                                alt={tab}
                                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                            />
                            {tab === 'men' ? 'Men' : 'Women'}
                            {g === tab && (
                                <motion.div
                                    layoutId="genderUnderline"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    style={{
                                        position: 'absolute', bottom: '-1px', left: '15%', right: '15%', height: '3px', background: '#C8956C', borderRadius: '4px',
                                        zIndex: 1
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* ── PROMO BANNER (CAROUSEL) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0', position: 'relative' }}>
                    <div style={{ position: 'relative', height: '170px', borderRadius: '24px', overflow: 'hidden' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${g}-${currentPromoIndex}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                onClick={() => navigate('/app/book')}
                                style={{
                                    position: 'absolute', inset: 0, cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #2A1F15 0%, #3D2A18 50%, #1a1008 100%)',
                                    display: 'flex', alignItems: 'flex-end',
                                }}
                            >
                                <img
                                    src={d.promos[currentPromoIndex].img}
                                    alt="Promo"
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45, borderRadius: '24px' }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(20,10,0,0.9) 45%, rgba(0,0,0,0.1) 100%)', borderRadius: '24px' }} />
                                <div style={{ position: 'relative', padding: '20px', zIndex: 2, width: '100%' }}>
                                    <p style={{ fontSize: '11px', color: colors.accent, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
                                        {d.promos[currentPromoIndex].subtitle}
                                    </p>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>
                                        {d.promos[currentPromoIndex].title.split('\n').map((l, i) => (<span key={i}>{l}{i === 0 && <br />}</span>))}
                                    </h3>
                                    <button style={{
                                        background: colors.accent, border: 'none', borderRadius: '24px 6px 24px 6px',
                                        padding: '10px 24px', color: '#fff', fontSize: '12px', fontWeight: 700,
                                        cursor: 'pointer', boxShadow: '0 8px 20px rgba(200,149,108,0.4)'
                                    }}>
                                        {d.promos[currentPromoIndex].btnText}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                    </div>
                </motion.div>

                {/* ── CATEGORIES (ORIGINAL) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Categories</span>
                        <button style={{ fontSize: '12px', color: '#C8956C', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/app/categories')}>See All</button>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '15px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {d.categories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/app/book')}
                                style={{
                                    flexShrink: 0, width: '90px',
                                    padding: '12px 4px', textAlign: 'center', cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    overflow: 'hidden', margin: '0 auto 0',
                                    border: isLight ? '2.5px solid rgba(200,149,108,0.2)' : '2.5px solid rgba(200,149,172,0.1)',
                                    boxShadow: isLight ? '0 6px 15px rgba(0,0,0,0.08)' : '0 6px 15px rgba(0,0,0,0.4)',
                                }}>
                                    <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{
                                    padding: '5px 14px',
                                    borderRadius: '16px 4px 16px 4px',
                                    background: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    zIndex: 2,
                                    boxShadow: '0 6px 15px rgba(200,149,108,0.4)',
                                    width: 'max-content'
                                }}>
                                    <p style={{ fontSize: '9px', fontWeight: 800, color: '#FFFFFF', margin: 0, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{cat.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>




                {/* ── RUNNING OFFERS (NEW) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Ticket size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Exclusive Offers</span>
                        </div>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '14px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {RUNNING_OFFERS.map(offer => (
                            <motion.div
                                key={offer.id}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    flexShrink: 0, width: '220px', background: colors.card, borderRadius: '18px', padding: '16px',
                                    border: `1px dashed ${colors.accent}`, display: 'flex', flexDirection: 'column', gap: '6px',
                                    position: 'relative'
                                }}
                            >
                                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{offer.subtitle}</p>
                                <h4 style={{ fontSize: '16px', color: colors.text, margin: 0, fontWeight: 800 }}>{offer.discount}</h4>
                                <div style={{ background: colors.input, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, color: colors.accent, alignSelf: 'flex-start', marginTop: '4px' }}>
                                    {offer.code}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── LOYALTY POINTS SUMMARY CARD (NEW) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/loyalty')}
                        style={{
                            cursor: 'pointer',
                            background: isLight ? 'linear-gradient(135deg, #1e1e1e, #333)' : 'linear-gradient(135deg, #242424, #1a1a1a)',
                            borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: `1px solid ${colors.border}`
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: colors.accent, borderRadius: '50%', filter: 'blur(40px)', opacity: 0.3 }}
                        />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, margin: '0 0 4px' }}>Gold Loyalty Member</p>
                                    <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>2,450 <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>Points</span></h2>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Next reward at 3000 pts</span>
                                    <span style={{ color: colors.accent, fontSize: '12px', fontWeight: 700 }}>82%</span>
                                </div>
                                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '82%' }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        style={{ height: '100%', background: colors.accent, borderRadius: '3px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>



                {/* ── POPULAR SERVICES (NEW) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Popular Services</span>
                        </div>
                        <button
                            style={{ fontSize: '12px', color: colors.accent, fontWeight: 700, background: 'none', border: 'none' }}
                            onClick={() => navigate('/app/services')}
                        >
                            View All
                        </button>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '14px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {MOCK_SERVICES.slice(0, 6).map(service => (
                            <motion.div
                                key={service._id}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate(`/app/book?serviceId=${service._id}`)}
                                style={{
                                    flexShrink: 0, width: '160px', background: colors.card, borderRadius: '24px', overflow: 'hidden',
                                    border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                                    <img src={service.image} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '2px 6px', borderRadius: '6px', fontSize: '9px', fontWeight: 800, color: '#fff' }}>
                                        ₹{service.price}
                                    </div>
                                </div>
                                <div style={{ padding: '10px' }}>
                                    <p style={{ fontSize: '10px', color: colors.accent, fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em' }}>{service.category}</p>
                                    <h4 style={{ fontSize: '12px', color: colors.text, margin: 0, fontWeight: 800, lineClamp: 1, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>{service.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <Clock size={10} color={colors.textMuted} />
                                        <span style={{ fontSize: '10px', color: colors.textMuted }}>{service.duration} mins</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── MEMBERSHIP PLANS (NEW) ── */}
                <motion.div variants={fadeUp} style={{ padding: '24px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Crown size={20} color={colors.accent} />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>Membership Hub</span>
                        </div>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '14px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {MEMBERSHIP_PLANS.map(plan => {
                            const isPlatinum = plan.name.toLowerCase().includes('platinum');
                            const isGold = plan.name.toLowerCase().includes('gold');
                            const isSilver = plan.name.toLowerCase().includes('silver');

                            const planGradient = isPlatinum
                                ? 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)'
                                : isGold
                                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                                    : 'linear-gradient(135deg, #E0E0E0 0%, #B0B0B0 100%)';

                            const textColor = (isGold || isSilver) ? '#000' : '#FFF';
                            const mutedColor = (isGold || isSilver) ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';

                            return (
                                <motion.div
                                    key={plan.id}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate('/app/membership')}
                                    style={{
                                        cursor: 'pointer',
                                        flexShrink: 0, width: '185px',
                                        background: planGradient,
                                        borderRadius: '18px', padding: '15px 16px',
                                        boxShadow: isLight ? '0 10px 20px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Subtle Overlay Glow */}
                                    <div style={{
                                        position: 'absolute', top: '-10%', right: '-10%',
                                        width: '80px', height: '80px',
                                        background: 'rgba(255,255,255,0.2)',
                                        filter: 'blur(25px)', borderRadius: '50%'
                                    }} />

                                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: textColor, margin: '0 0 3px', fontFamily: "'Playfair Display', serif" }}>{plan.name}</h3>
                                    <div style={{ color: isPlatinum ? colors.accent : (isGold ? '#6B4F00' : '#444'), fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>{plan.price}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {plan.benefits.map((b, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '3.5px', height: '3.5px', borderRadius: '50%', background: textColor }} />
                                                <p style={{ fontSize: '10px', color: mutedColor, margin: 0, fontWeight: 500 }}>{b}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── POPULAR EXPERTS (ORIGINAL) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Popular Experts</span>
                    </div>
                    <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginLeft: '-16px', paddingLeft: '16px', marginRight: '-16px', paddingRight: '16px' }}>
                        {d.experts.map((expert) => (
                            <motion.div
                                key={expert.id}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setSelectedExpert(expert)}
                                style={{ background: colors.card, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: '120px', textAlign: 'center', paddingBottom: '12px', border: `1px solid ${colors.border}` }}
                            >
                                <div style={{ position: 'relative', padding: '10px 10px 0' }}>
                                    <img
                                        src={expert.img} alt={expert.name}
                                        style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto' }}
                                    />
                                    <div style={{
                                        position: 'absolute', top: 14, right: 14,
                                        background: '#C8956C', borderRadius: '8px',
                                        padding: '2px 5px', display: 'flex', alignItems: 'center', gap: '2px',
                                    }}>
                                        <Star size={8} fill="#fff" color="#fff" />
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{expert.rating}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '12px', fontWeight: 700, color: colors.text, margin: '8px 6px 2px' }}>{expert.name}</p>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: 0 }}>{expert.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>


                {/* ── LOYALTY + REFERRAL (ORIGINAL BOTTOM STYLE) ── */}
                <motion.div variants={fadeUp} style={{ padding: '20px 16px 32px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/profile')}
                            style={{
                                flex: 1, background: colors.card, borderRadius: '16px', padding: '16px', cursor: 'pointer',
                                border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>⭐</div>
                            <div>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loyalty</p>
                                <p style={{ fontSize: '16px', fontWeight: 800, color: '#C8956C', margin: 0 }}>250 pts</p>
                            </div>
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/app/referrals')}
                            style={{
                                flex: 1, background: colors.card, borderRadius: '16px', padding: '16px', cursor: 'pointer',
                                border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                        >
                            <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(200,149,108,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>🎁</div>
                            <div>
                                <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refer</p>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: colors.text, margin: 0 }}>Earn ₹200</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ── EXPERT DETAIL MODAL ── */}
            <AnimatePresence>
                {selectedExpert && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedExpert(null)}
                            style={{ position: 'absolute', inset: 0, background: isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                width: '100%',
                                maxWidth: '430px',
                                background: colors.card,
                                borderRadius: '32px 32px 0 0',
                                position: 'relative',
                                zIndex: 10001,
                                paddingTop: '12px',
                                paddingBottom: '30px',
                                px: '20px',
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            {/* Drawer Handle */}
                            <div style={{ width: '40px', height: '4px', background: isLight ? '#DDD' : '#333', borderRadius: '2px', margin: '0 auto 20px' }} />

                            <div style={{ padding: '0 24px' }}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                                    <img
                                        src={selectedExpert.img}
                                        alt={selectedExpert.name}
                                        style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1, pt: '10px' }}>
                                        <h3 style={{ fontSize: '22px', fontWeight: 900, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{selectedExpert.name}</h3>
                                        <p style={{ fontSize: '14px', color: colors.accent, fontWeight: 800, textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>{selectedExpert.role}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} fill={colors.accent} color={colors.accent} />
                                            <span style={{ fontSize: '14px', fontWeight: 700 }}>{selectedExpert.rating}</span>
                                            <span style={{ fontSize: '12px', color: colors.textMuted, ml: '4px' }}>(120+ Reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: isLight ? '#F9F9F9' : '#242424', p: '12px', borderRadius: '16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 700 }}>Experience</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text, margin: 0 }}>{EXPERT_DETAILS[selectedExpert.name]?.experience || "5+ Years"}</p>
                                    </div>
                                    <div style={{ background: isLight ? '#F9F9F9' : '#242424', p: '12px', borderRadius: '16px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 700 }}>Clients</p>
                                        <p style={{ fontSize: '16px', fontWeight: 900, color: colors.text, margin: 0 }}>1.2k+</p>
                                    </div>
                                </div>

                                <div style={{ mb: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', mb: '8px', letterSpacing: '0.05em' }}>Profile Bio</h4>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: colors.text, opacity: 0.8, margin: 0 }}>
                                        {EXPERT_DETAILS[selectedExpert.name]?.bio || "A dedicated professional committed to delivering the highest quality salon experience for every client."}
                                    </p>
                                </div>

                                <div style={{ mt: '20px', mb: '32px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: colors.textMuted, textTransform: 'uppercase', mb: '12px', letterSpacing: '0.05em', marginTop: '20px' }}>Specializations</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {(EXPERT_DETAILS[selectedExpert.name]?.tags || ["Master Styling", "Classic Cut", "Detailing"]).map((tag, i) => (
                                            <span key={i} style={{ padding: '6px 12px', background: colors.accent + '15', color: colors.accent, borderRadius: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelectedExpert(null);
                                        navigate(`/app/book?expertId=${selectedExpert.id}`);
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        background: colors.accent,
                                        color: '#FFF',
                                        borderRadius: '16px',
                                        border: 'none',
                                        fontSize: '14px',
                                        fontWeight: 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        boxShadow: `0 10px 20px ${colors.accent}40`,
                                        mt: '10px'
                                    }}
                                >
                                    Book Appointment
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
