import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Crown,
    Check,
    Star,
    Zap,
    ShieldCheck,
    Gem,
    ChevronRight
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const AppMembershipPage = () => {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        accent: '#C8956C',
        border: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.05)',
    };

    const MEMBERSHIP_TIERS = [
        {
            id: 'silver',
            name: 'Silver Lounge',
            price: '₹999',
            period: '/month',
            color: '#A0A0A0',
            gradient: 'linear-gradient(135deg, #B0B0B0 0%, #707070 100%)',
            benefits: ['5% Off on all services', '1 Free Hair Wash monthly', 'Priority Booking', 'Valid for 30 days'],
            icon: <Star size={24} />,
            popular: false
        },
        {
            id: 'gold',
            name: 'Gold Elite',
            price: '₹1,999',
            period: '/month',
            color: '#D4AF37',
            gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
            benefits: ['15% Off on all services', '2 Free Stylings monthly', '1 Free Facial monthly', 'No-Wait Entry', 'Birthday Special Gift'],
            icon: <Crown size={24} />,
            popular: true
        },
        {
            id: 'platinum',
            name: 'Royal Platinum',
            price: '₹4,499',
            period: '/month',
            color: '#1A1A1A',
            gradient: 'linear-gradient(135deg, #2C2C2C 0%, #000000 100%)',
            benefits: ['30% Off on all services', 'Unlimited Hair Wash', 'Home Service Available', 'Personal Style Consultant', 'Valet Parking Included'],
            icon: <Gem size={24} />,
            popular: false
        }
    ];

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            paddingTop: '40px',
            paddingBottom: '100px',
            fontFamily: "'Inter', sans-serif"
        }}>

            {/* ── HERO TEXT ── */}
            <motion.div
                {...fadeUp}
                style={{ padding: '0 16px 32px', textAlign: 'center' }}
            >
                <div style={{
                    display: 'inline-flex', padding: '6px 12px', borderRadius: '20px',
                    background: 'rgba(200,149,108,0.1)', border: '1px solid rgba(200,149,108,0.2)',
                    marginBottom: '16px'
                }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Membership Hub</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>Experience the <br /><span style={{ color: colors.accent }}>Royal Treatment</span></h2>
                <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0, padding: '0 20px' }}>Join our elite community and enjoy curated luxury benefits on every visit.</p>
            </motion.div>

            {/* ── PLANS LIST ── */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {MEMBERSHIP_TIERS.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            background: plan.gradient,
                            borderRadius: '32px',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            color: plan.id === 'platinum' ? '#FFF' : (plan.id === 'gold' ? '#000' : '#FFF'),
                            boxShadow: plan.popular ? '0 20px 40px rgba(212, 175, 55, 0.2)' : '0 15px 30px rgba(0,0,0,0.15)',
                            border: plan.popular ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {/* Glow Effect */}
                        <div style={{
                            position: 'absolute', top: '-20%', right: '-10%',
                            width: '120px', height: '120px',
                            background: 'rgba(255,255,255,0.2)',
                            filter: 'blur(40px)', borderRadius: '50%'
                        }} />

                        {plan.popular && (
                            <div style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'rgba(0,0,0,0.8)', padding: '4px 10px',
                                borderRadius: '10px', fontSize: '10px', fontWeight: 800,
                                color: '#FFD700', textTransform: 'uppercase'
                            }}>
                                Most Popular
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: 44, height: 44,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {plan.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>{plan.name}</h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '32px', fontWeight: 900 }}>{plan.price}</span>
                            <span style={{ fontSize: '14px', opacity: 0.7 }}>{plan.period}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                            {plan.benefits.map((benefit, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Check size={10} strokeWidth={3} />
                                    </div>
                                    <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>{benefit}</p>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const { icon, ...planData } = plan; // Remove JSX icon which causes DataCloneError
                                navigate('/app/membership/checkout', { state: { plan: planData } });
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: plan.id === 'gold' ? '#000' : '#FFF',
                                color: plan.id === 'gold' ? '#FFF' : (plan.id === 'platinum' ? '#000' : '#333'),
                                border: 'none',
                                borderRadius: '16px 4px 16px 4px',
                                fontSize: '14px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            Select Plan <ChevronRight size={18} />
                        </motion.button>
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default AppMembershipPage;
