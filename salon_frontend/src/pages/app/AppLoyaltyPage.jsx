import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Gift,
    ChevronRight,
    Crown,
    History,
    Star,
    CheckCircle2,
    Zap
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const AppLoyaltyPage = () => {
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
        input: isLight ? '#F8F8F8' : '#2A2A2A',
    };

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    const LOYALTY_STATS = {
        currentPoints: 2450,
        nextTier: 3000,
        currentTier: 'Gold Member',
        potentialSavings: '₹450',
        history: [
            { id: 1, action: 'Haircut & Styling', date: '24 Feb, 2026', points: '+150', type: 'earn' },
            { id: 2, action: 'Facial Treatment', date: '12 Feb, 2026', points: '+300', type: 'earn' },
            { id: 3, action: 'Points Redeemed', date: '01 Feb, 2026', points: '-500', type: 'redeem' },
            { id: 4, action: 'Referral Bonus', date: '15 Jan, 2026', points: '+200', type: 'earn' },
        ],
        rewards: [
            { id: 1, title: 'Free Haircut', points: 1000, icon: <Star size={16} /> },
            { id: 2, title: '20% Off Services', points: 500, icon: <Zap size={16} /> },
            { id: 3, title: 'Luxury Spa Kit', points: 2500, icon: <Gift size={16} /> },
        ]
    };

    const progressPercentage = (LOYALTY_STATS.currentPoints / LOYALTY_STATS.nextTier) * 100;

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            paddingTop: '20px',
            paddingBottom: '100px',
            fontFamily: "'Inter', sans-serif"
        }}>

            {/* ── MAIN POINTS CARD (PREMIUM) ── */}
            <motion.div
                {...fadeUp}
                style={{ padding: '0 16px' }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                    borderRadius: '28px',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {/* Abstract Shapes */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', top: '-10%', right: '-10%',
                            width: '150px', height: '150px',
                            border: '1px solid rgba(200,149,108,0.2)',
                            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%',
                            zIndex: 0
                        }}
                    />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Crown size={14} color="#C8956C" />
                                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#C8956C', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{LOYALTY_STATS.currentTier}</p>
                                </div>
                                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#FFF', margin: 0 }}>{LOYALTY_STATS.currentPoints.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, opacity: 0.6 }}>pts</span></h2>
                            </div>
                            <div style={{ background: 'rgba(200,149,108,0.15)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(200,149,108,0.2)' }}>
                                <p style={{ fontSize: '10px', color: '#C8956C', margin: 0, fontWeight: 700 }}>Redeemable</p>
                                <p style={{ fontSize: '14px', color: '#FFF', margin: 0, fontWeight: 900 }}>{LOYALTY_STATS.potentialSavings}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Progress to Platinum</p>
                                <p style={{ fontSize: '11px', color: '#FFF', margin: 0, fontWeight: 700 }}>{progressPercentage.toFixed(0)}%</p>
                            </div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg, #C8956C, #F5E4D7)', borderRadius: '10px' }}
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Earn {LOYALTY_STATS.nextTier - LOYALTY_STATS.currentPoints} more points for next tier</p>
                    </div>
                </div>
            </motion.div>

            {/* ── REDEEMABLE REWARDS ── */}
            <motion.div
                {...fadeUp}
                transition={{ delay: 0.1 }}
                style={{ padding: '32px 16px 0' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Redeem Rewards</h3>
                </div>

                <div className="app-scroll no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {LOYALTY_STATS.rewards.map(reward => (
                        <motion.div
                            key={reward.id}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                flexShrink: 0, width: '140px', background: colors.card,
                                borderRadius: '20px 6px 20px 6px', padding: '16px',
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 8px 20px rgba(0,0,0,0.03)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: colors.accent, flexShrink: 0
                                }}>
                                    {reward.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px', color: colors.text }}>{reward.title}</h4>
                                    <p style={{ fontSize: '11px', color: colors.accent, fontWeight: 800, margin: 0 }}>{reward.points} pts</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── POINTS HISTORY ── */}
            <motion.div
                {...fadeUp}
                transition={{ delay: 0.2 }}
                style={{ padding: '32px 16px 0' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <History size={18} color={colors.accent} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Points History</h3>
                </div>

                <div style={{ background: colors.card, borderRadius: '24px', padding: '8px', border: `1px solid ${colors.border}` }}>
                    {LOYALTY_STATS.history.map((item, idx) => (
                        <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                            borderBottom: idx === LOYALTY_STATS.history.length - 1 ? 'none' : `1px solid ${colors.border}`
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '12px',
                                background: item.type === 'earn' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: item.type === 'earn' ? '#22c55e' : '#ef4444'
                            }}>
                                {item.type === 'earn' ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: 700, color: colors.text, margin: '0 0 2px' }}>{item.action}</p>
                                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{item.date}</p>
                            </div>
                            <p style={{
                                fontSize: '14px', fontWeight: 800,
                                color: item.type === 'earn' ? '#22c55e' : '#ef4444'
                            }}>
                                {item.points}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── HOW TO EARN ── */}
            <motion.div
                {...fadeUp}
                transition={{ delay: 0.3 }}
                style={{ padding: '32px 16px 0' }}
            >
                <div style={{ background: colors.accent, borderRadius: '24px 6px 24px 6px', padding: '24px', color: '#FFF' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 4px' }}>Want more points?</h3>
                    <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 16px' }}>Refer a friend and get 200 points instantly when they book their first service.</p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app/referrals')}
                        style={{
                            background: '#FFF', color: colors.accent, border: 'none',
                            padding: '10px 20px', borderRadius: '12px 4px 12px 4px',
                            fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        Refer Now <ChevronRight size={16} />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default AppLoyaltyPage;
