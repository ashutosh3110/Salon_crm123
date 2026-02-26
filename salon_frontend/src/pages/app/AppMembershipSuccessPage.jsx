import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    CheckCircle2,
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
            justifyContent: 'center',
            padding: '24px',
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
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(200,149,108,0.2) 0%, transparent 70%)',
                    zIndex: 0
                }}
            />

            {/* ── SUCCESS ICON ── */}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{
                    width: 100, height: 100, borderRadius: '35px',
                    background: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFF', marginBottom: '32px',
                    boxShadow: '0 20px 40px rgba(200,149,108,0.4)',
                    position: 'relative', zIndex: 1
                }}
            >
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {getPlanIcon(plan.id, 40)}
                </motion.div>
                <div style={{ position: 'absolute', top: -10, right: -10, background: '#FFF', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <CheckCircle2 size={24} color="#22c55e" fill="#22c55e" stroke="#FFF" />
                </div>
            </motion.div>

            {/* ── SUCCESS MESSAGE ── */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.accent, marginBottom: '12px' }}>
                        <Sparkles size={16} />
                        <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Welcome to the Club</span>
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1 }}>You are now a <br />{plan.name} Member</h2>
                    <p style={{ fontSize: '15px', color: colors.textMuted, margin: '0 auto 40px', maxWidth: '280px', lineHeight: 1.6 }}>Your VIP status is now active. Enjoy exclusive benefits and priority service on every visit.</p>
                </motion.div>

                {/* ── MEMBERSHIP INFO MINI-CARD ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: colors.card, border: `1px solid ${colors.border}`,
                        borderRadius: '24px', padding: '20px', display: 'flex', gap: '16px',
                        marginBottom: '48px', alignItems: 'center', textAlign: 'left',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,149,108,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
                        <Calendar size={22} />
                    </div>
                    <div>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 700 }}>VALID UNTIL</p>
                        <p style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>{dateStr}</p>
                    </div>
                </motion.div>

                {/* ── ACTION BUTTONS ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px', margin: '0 auto' }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app')}
                        style={{
                            width: '100%', padding: '16px',
                            background: colors.accent, color: '#FFF',
                            border: 'none', borderRadius: '20px 6px 20px 6px',
                            fontSize: '15px', fontWeight: 900, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: '0 10px 25px rgba(200,149,108,0.3)'
                        }}
                    >
                        Go to Home <ArrowRight size={18} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app/bookings')}
                        style={{
                            width: '100%', padding: '16px',
                            background: 'transparent', color: colors.text,
                            border: `1px solid ${colors.border}`, borderRadius: '20px',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer'
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
