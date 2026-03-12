import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Crown,
    Calendar,
    ArrowRight,
    Sparkles,
    Gem,
    Star
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const AppMembershipSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    // Get plan details from state or default (fallback)
    const plan = location.state?.plan || {
        id: 'gold',
        name: 'Gold Elite',
    };

    const getPlanIcon = (id, size = 32) => {
        switch (id) {
            case 'platinum': return <Gem size={size} />;
            case 'silver': return <Star size={size} />;
            default: return <Crown size={size} />;
        }
    };

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        accent: '#C8956C',
        border: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.05)',
    };

    // Calculate valid until date (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    const dateStr = validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* ── BACKGROUND CELEBRATION EFFECTS ── */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    top: '10%',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(200,149,108,0.2) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            {/* ── SUCCESS MESSAGE ── */}
            <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.accent, marginBottom: '8px' }}>
                        <Sparkles size={14} />
                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Welcome to the Club</span>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.2 }}>You are now a <br />{plan.name} Member</h2>
                    <p style={{ fontSize: '14px', color: colors.textMuted, margin: '0 auto 24px', maxWidth: '260px', lineHeight: 1.5 }}>Your VIP status is now active. Enjoy exclusive benefits and priority service.</p>
                </motion.div>

                {/* ── MEMBERSHIP INFO MINI-CARD ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: colors.card, border: `1px solid ${colors.border}`,
                        borderRadius: '20px', padding: '14px 18px', display: 'flex', gap: '12px',
                        marginBottom: '32px', alignItems: 'center', textAlign: 'left',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                    }}
                >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(200,149,108,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 1px', textTransform: 'uppercase', fontWeight: 700 }}>VALID UNTIL</p>
                        <p style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>{dateStr}</p>
                    </div>
                </motion.div>

                {/* ── ACTION BUTTONS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '260px', margin: '0 auto' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app')}
                        style={{
                            width: '100%', padding: '14px',
                            background: colors.accent, color: '#FFF',
                            border: 'none', borderRadius: '16px 5px 16px 5px',
                            fontSize: '14px', fontWeight: 900, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 8px 20px rgba(200,149,108,0.25)'
                        }}
                    >
                        Go to Home <ArrowRight size={16} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app/bookings')}
                        style={{
                            width: '100%', padding: '14px',
                            background: 'transparent', color: colors.text,
                            border: `1px solid ${colors.border}`, borderRadius: '16px',
                            fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        Manage Membership
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AppMembershipSuccessPage;
