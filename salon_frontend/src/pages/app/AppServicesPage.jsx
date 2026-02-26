import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, SlidersHorizontal, Map } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

/* ── Mock salon data ── */
const SALONS = [
    { id: 1, name: 'Brett Gomez Salon', address: '817 Rebecca Lodge...', rating: 4.5, dist: '4.5 km', img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80' },
    { id: 2, name: 'Gimabel Hair Style', address: '817 Rebecca Lodge...', rating: 4.5, dist: '4.5 km', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80' },
    { id: 3, name: 'Beauty Women Salon', address: '817 Rebecca Lodge...', rating: 4.5, dist: '4.5 km', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=300&q=80' },
    { id: 4, name: 'Kobike Barber Shop', address: '817 Rebecca Lodge...', rating: 4.5, dist: '4.5 km', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80' },
    { id: 5, name: 'Robeto Barber Shop', address: '817 Rebecca Lodge...', rating: 4.3, dist: '5.1 km', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80' },
];

function HeartBtn() {
    const [liked, setLiked] = useState(false);
    return (
        <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
        >
            <Heart size={18} strokeWidth={2}
                color={liked ? '#e53e3e' : 'rgba(150,150,150,0.5)'}
                fill={liked ? '#e53e3e' : 'none'}
            />
        </motion.button>
    );
}

export default function AppServicesPage() {
    const navigate = useNavigate();
    const [mapView, setMapView] = useState(false);
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } } };
    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
        card: isLight ? '#FFFFFF' : '#1C1C1C',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#242424',
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh', color: colors.text, fontFamily: "'Open Sans', sans-serif" }}>

            {/* ── HEADER ── */}
            <div style={{ padding: '24px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: colors.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>Salon Near by</h1>
                {/* Map View toggle */}
                <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setMapView(m => !m)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: mapView ? '#C8956C' : colors.toggle,
                        border: 'none', borderRadius: '20px',
                        padding: '8px 14px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600,
                        color: mapView ? '#fff' : colors.textMuted,
                        transition: 'all 0.2s',
                        boxShadow: isLight && !mapView ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                    }}
                >
                    <Map size={14} /> Map View
                    {/* Toggle pill */}
                    <div style={{
                        width: '30px', height: '16px', borderRadius: '8px',
                        background: mapView ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                        position: 'relative', marginLeft: '2px',
                    }}>
                        <motion.div
                            animate={{ x: mapView ? 14 : 0 }}
                            style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: '#fff', position: 'absolute', top: 2, left: 2,
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                    </div>
                </motion.button>
            </div>

            {/* ── SALON LIST ── */}
            <motion.div
                variants={stagger} initial="hidden" animate="show"
                style={{ padding: '0 16px' }}
            >
                {SALONS.map((salon) => (
                    <motion.div
                        key={salon.id}
                        variants={fadeUp}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/book')}
                        style={{
                            background: colors.card,
                            borderRadius: '16px',
                            marginBottom: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            gap: '14px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.02)' : 'none',
                        }}
                    >
                        {/* Image */}
                        <img
                            src={salon.img} alt={salon.name}
                            style={{ width: '74px', height: '74px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{salon.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                <MapPin size={11} color={colors.textMuted} />
                                <span style={{ fontSize: '12px', color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{salon.address}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {[1, 2, 3, 4].map(s => (
                                        <Star key={s} size={11} fill="#C8956C" color="#C8956C" />
                                    ))}
                                    <Star size={11} fill="none" color="#C8956C" strokeWidth={1.5} />
                                    <span style={{ fontSize: '11px', color: '#C8956C', fontWeight: 600, marginLeft: '2px' }}>{salon.rating}</span>
                                </div>
                                <span style={{ fontSize: '11px', color: colors.textMuted }}>• {salon.dist}</span>
                            </div>
                        </div>
                        {/* Heart */}
                        <HeartBtn />
                    </motion.div>
                ))}
            </motion.div>

            {/* ── SEARCH BAR (bottom, floating) ── */}
            <div style={{
                position: 'fixed', bottom: '80px',
                left: '50%', transform: 'translateX(-50%)',
                width: 'calc(100% - 32px)', maxWidth: '398px',
                background: colors.card,
                borderRadius: '16px',
                border: `1px solid ${colors.border}`,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                backdropFilter: 'blur(20px)',
                boxShadow: isLight ? '0 8px 32px rgba(0,0,0,0.05)' : '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 50,
                transition: 'all 0.3s ease',
            }}>
                <MapPin size={16} color="#C8956C" />
                <span style={{ fontSize: '13px', color: colors.textMuted, flex: 1 }}>Chicago, Illinois, US.</span>
            </div>
        </div>
    );
}
