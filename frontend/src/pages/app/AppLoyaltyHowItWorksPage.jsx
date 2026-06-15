import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Coins, 
    Gift, 
    Zap, 
    Share2,
    Star,
    Trophy,
    Smartphone,
    ChevronLeft
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

const AppLoyaltyHowItWorksPage = () => {
    const navigate = useNavigate();
    const { colors: themeColors, isLight } = useCustomerTheme();
    const [rules, setRules] = useState(null);
    const [loading, setLoading] = useState(true);

    const colors = useMemo(() => ({
        bg: '#FFFFFF', // Explicit white background
        card: themeColors.card || '#FFFFFF',
        text: themeColors.text || '#1A1A1A',
        textMuted: themeColors.textMuted || '#666',
        border: themeColors.border || 'rgba(0,0,0,0.06)',
        toggle: themeColors.input || '#EDF0F2',
        accent: themeColors.accent || '#E7D06E',
    }), [themeColors]);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await api.get('/loyalty/rules');
                if (res.data?.success) {
                    setRules(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching loyalty rules:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    const steps = [
        {
            icon: Smartphone,
            title: "Every Visit Counts",
            desc: `Earn points on every service booking & product purchase. For every ₹${rules?.pointsRate || 100} you spend, you earn 1 point.`
        },
        {
            icon: Coins,
            title: "Build Your Balance",
            desc: "Watch your points grow with each visit. Your points never expire as long as you are active."
        },
        {
            icon: Gift,
            title: "Redeem Instantly",
            desc: `Convert points to wallet balance. ${rules?.pointsRate || 100} points = ₹1. Use it to pay for bookings.`
        }
    ];

    const bonusWays = [
        {
            icon: Share2,
            title: "Refer a Friend",
            value: `+${rules?.referralPoints || 200} PTS`,
            desc: "Share your code and get points on their first visit."
        },
        {
            icon: Star,
            title: "Join Membership",
            value: "2X POINTS",
            desc: "Members earn points at a faster rate."
        }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}
                />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
        }} className="pb-10 font-sans text-sm">
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: colors.bg }}>
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent active:bg-gray-200/50 transition-colors"
                >
                    <ChevronLeft className="w-5.5 h-5.5" style={{ color: colors.text }} />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h1 className="text-base font-bold" style={{ color: colors.text }}>Loyalty Rituals</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: colors.accent }}>How it works</p>
                </div>
            </div>

            <div className="px-4 space-y-5">
                {/* Hero Visualization (Compact) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                        borderRadius: '20px',
                        padding: '20px 16px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(185, 133, 20, 0.12)',
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex mb-2"
                    >
                        <div style={{
                            width: 44, height: 44, borderRadius: '12px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.3)',
                        }}>
                            <Trophy size={22} color="#FFF" strokeWidth={1.8} />
                        </div>
                    </motion.div>
                    <h2 className="text-base font-extrabold text-white mb-0.5">The Wapixo Rewards</h2>
                    <p className="text-[11px] text-white/90 max-w-[260px] mx-auto font-medium leading-normal">Elevating your grooming journey with exclusive rewards.</p>
                </motion.div>

                {/* Steps Section (Compact) */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.1em] px-1" style={{ color: colors.accent }}>The Journey</h3>
                    <div className="space-y-2.5">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    background: colors.card,
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    border: `1px solid ${colors.border}`,
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{
                                    width: 36, height: 36, borderRadius: '10px',
                                    background: isLight ? '#FFF8E6' : 'rgba(223, 172, 44, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <step.icon size={18} style={{ color: colors.accent }} strokeWidth={1.8} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold leading-tight" style={{ color: colors.text }}>{step.title}</h4>
                                    <p className="text-[11px] opacity-60 font-medium leading-normal mt-0.5" style={{ color: colors.text }}>{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bonus Ways Section (Compact) */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.1em] px-1" style={{ color: colors.accent }}>Boost Your Points</h3>
                    <div className="grid grid-cols-1 gap-2.5">
                        {bonusWays.map((way, idx) => (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: colors.card,
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    border: `1px dashed ${colors.accent}40`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div className="flex gap-3 items-center min-w-0">
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '8px',
                                        background: colors.accent,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#FFF',
                                        flexShrink: 0
                                    }}>
                                        <way.icon size={15} strokeWidth={2} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold leading-tight" style={{ color: colors.text }}>{way.title}</h4>
                                        <p className="text-[9px] font-bold opacity-45 uppercase tracking-wider truncate" style={{ color: colors.text }}>{way.desc}</p>
                                    </div>
                                </div>
                                <div style={{
                                    background: colors.toggle,
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    color: colors.accent,
                                    border: `1px solid ${colors.accent}20`,
                                    flexShrink: 0
                                }}>
                                    {way.value}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Redemption Math (Compact) */}
                <div 
                    style={{
                        background: colors.card,
                        borderRadius: '16px',
                        padding: '16px 20px',
                        textAlign: 'center',
                        border: `1px solid ${colors.border}`,
                        marginBottom: '20px'
                    }}
                >
                    <Zap size={20} style={{ color: colors.accent }} className="mx-auto mb-2" />
                    <h3 className="text-xs font-extrabold mb-2" style={{ color: colors.text }}>Simple Redemption</h3>
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="text-center">
                            <p className="text-lg font-extrabold" style={{ color: colors.text }}>{rules?.pointsRate || 100}</p>
                            <p className="text-[8px] font-bold uppercase opacity-40 tracking-widest" style={{ color: colors.text }}>Points</p>
                        </div>
                        <div className="text-lg opacity-35" style={{ color: colors.text }}>=</div>
                        <div className="text-center">
                            <p className="text-lg font-extrabold" style={{ color: colors.text }}>₹1</p>
                            <p className="text-[8px] font-bold uppercase opacity-40 tracking-widest" style={{ color: colors.text }}>Balance</p>
                        </div>
                    </div>
                    <div style={{ height: '1.5px', background: colors.border, margin: '12px 0' }} />
                    <p className="text-[10px] font-bold opacity-60 px-4" style={{ color: colors.text }}>Min. Redemption: {rules?.minRedeemPoints || 0} Points</p>
                </div>
            </div>
        </div>
    );
};

export default AppLoyaltyHowItWorksPage;
