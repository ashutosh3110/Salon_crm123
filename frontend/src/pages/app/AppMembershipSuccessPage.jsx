import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Crown,
    Calendar,
    ArrowRight,
    Sparkles,
    Gem,
    Star,
    ShieldCheck,
    PartyPopper,
    ChevronRight
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const AppMembershipSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const plan = location.state?.plan || {
        id: 'gold',
        name: 'Gold Elite',
    };

    const colors = {
        bg: isLight ? '#FDFCFB' : '#080808',
        card: isLight ? '#FFFFFF' : '#121212',
        text: isLight ? '#121212' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.5)',
        accent: '#C8956C',
        border: isLight ? '#F0EBE6' : 'rgba(255,255,255,0.08)',
    };

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    const dateStr = validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            padding: '80px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Celebration Background */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '600px',
                background: `radial-gradient(circle at 50% 20%, ${isLight ? 'rgba(200,149,108,0.2)' : 'rgba(200,149,108,0.1)'} 0%, transparent 60%)`,
                pointerEvents: 'none', zIndex: 0
            }} />

            <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }}
                style={{
                    width: 100, height: 100, borderRadius: '35px',
                    background: 'linear-gradient(135deg, #C8956C 0%, #A67C59 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFF', marginBottom: '32px', position: 'relative', zIndex: 1,
                    boxShadow: '0 20px 40px rgba(200,149,108,0.4)',
                    border: '4px solid rgba(255,255,255,0.2)'
                }}
            >
                <ShieldCheck size={48} strokeWidth={2.5} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: 12, height: 2, background: colors.accent, borderRadius: 2 }} />
                    <span style={{ fontSize: '12px', fontWeight: 900, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Access Granted</span>
                    <div style={{ width: 12, height: 2, background: colors.accent, borderRadius: 2 }} />
                </div>

                <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
                    Welcome to <br/> <span style={{ color: colors.accent }}>{plan.name}</span>
                </h1>
                
                <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '280px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                    Your VIP privileges are now activated. You're part of an elite community now.
                </p>
            </motion.div>

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                style={{
                    width: '100%', maxWidth: '320px',
                    background: colors.card, border: `1px solid ${colors.border}`,
                    borderRadius: '28px', padding: '24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    textAlign: 'left', marginBottom: '48px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    position: 'relative', zIndex: 1
                }}
            >
                <div style={{ 
                    width: 48, height: 48, borderRadius: '16px', 
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent 
                }}>
                    <Calendar size={20} />
                </div>
                <div>
                    <p style={{ fontSize: '10px', color: colors.textMuted, margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 900 }}>Expiration Date</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{dateStr}</p>
                </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px', position: 'relative', zIndex: 1 }}
            >
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/app')}
                    style={{
                        padding: '20px',
                        background: colors.accent, color: '#FFF',
                        border: 'none', borderRadius: '24px 8px 24px 8px',
                        fontSize: '16px', fontWeight: 900, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        boxShadow: '0 12px 24px rgba(200,149,108,0.3)'
                    }}
                >
                    Step into Hub <ArrowRight size={20} />
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/app/bookings')}
                    style={{
                        padding: '18px',
                        background: 'transparent', color: colors.textMuted,
                        border: `1px solid ${colors.border}`, borderRadius: '20px',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    View active privileges
                </motion.button>
            </motion.div>
        </div>
    );
};

export default AppMembershipSuccessPage;
