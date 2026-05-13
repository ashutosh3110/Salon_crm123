import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Coins, 
    Gift, 
    Zap, 
    ArrowLeft, 
    ChevronRight, 
    Sparkles, 
    Trophy, 
    Star,
    Share2,
    CheckCircle2,
    Smartphone
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';
import AppBackButton from '../../components/app/AppBackButton';

const AppLoyaltyHowItWorksPage = () => {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const [rules, setRules] = useState(null);
    const [loading, setLoading] = useState(true);

    const colors = {
        bg: isLight ? '#FDFCFB' : '#080808',
        card: isLight ? '#FFFFFF' : '#121212',
        text: isLight ? '#121212' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.5)',
        accent: '#C8956C',
        border: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
    };

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
            desc: `Earn points on every service booking and product purchase. For every ₹${rules?.pointsRate || 100} you spend, you earn 1 point.`
        },
        {
            icon: Coins,
            title: "Build Your Balance",
            desc: "Watch your points grow with each visit. Your points never expire as long as you're active with us."
        },
        {
            icon: Gift,
            title: "Redeem Instantly",
            desc: `Convert your points into wallet balance. ${rules?.pointsRate || 100} points = ₹1. Use it to pay for your next luxury treatment.`
        }
    ];

    const bonusWays = [
        {
            icon: Share2,
            title: "Refer a Friend",
            value: `+${rules?.referralPoints || 200} PTS`,
            desc: "Share your code and get points when they complete their first visit."
        },
        {
            icon: Star,
            title: "Join Membership",
            value: "2X POINTS",
            desc: "Members earn points at a faster rate on every transaction."
        }
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100svh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-[#C8956C] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100svh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Outfit', sans-serif"
        }} className="pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 pt-6 pb-4 flex items-center gap-4" style={{ background: `${colors.bg}cc`, backdropFilter: 'blur(20px)' }}>
                <AppBackButton />
                <div>
                    <h1 className="text-xl font-black tracking-tight leading-none">Loyalty Rituals</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8956C] mt-1">How it works</p>
                </div>
            </div>

            <div className="px-6 space-y-10">
                {/* Hero Visualization */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #000 100%)',
                        borderRadius: '32px',
                        padding: '40px 24px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        marginTop: '12px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }} className="bg-pattern-dots" />
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex mb-6"
                    >
                        <div style={{
                            width: 80, height: 80, borderRadius: '24px',
                            background: 'rgba(200,149,108,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(200,149,108,0.3)',
                            boxShadow: '0 0 40px rgba(200,149,108,0.2)'
                        }}>
                            <Trophy size={40} color="#C8956C" strokeWidth={1.5} />
                        </div>
                    </motion.div>
                    <h2 className="text-2xl font-black text-white italic mb-2">The Wapixo Rewards</h2>
                    <p className="text-xs text-white/50 max-w-[240px] mx-auto font-medium">Elevating your grooming journey with exclusive benefits and rewards.</p>
                </motion.div>

                {/* Steps Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C8956C]">The Journey</h3>
                    <div className="space-y-4">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: colors.card,
                                    borderRadius: '24px',
                                    padding: '24px',
                                    border: `1px solid ${colors.border}`,
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: '14px',
                                    background: isLight ? '#FDF6F0' : 'rgba(200,149,108,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <step.icon size={22} color={colors.accent} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black mb-1 italic">{step.title}</h4>
                                    <p className="text-[12px] leading-relaxed opacity-60 font-medium">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bonus Ways Section */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C8956C]">Boost Your Points</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {bonusWays.map((way, idx) => (
                            <motion.div
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: isLight ? '#FDF9F4' : 'rgba(20,20,20,0.6)',
                                    borderRadius: '24px',
                                    padding: '24px',
                                    border: `1px dashed ${colors.accent}40`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div className="flex gap-4 items-center">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '12px',
                                        background: colors.accent,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#FFF'
                                    }}>
                                        <way.icon size={20} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black italic">{way.title}</h4>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{way.desc}</p>
                                    </div>
                                </div>
                                <div style={{
                                    background: isLight ? '#FFF' : '#000',
                                    padding: '6px 12px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    color: colors.accent,
                                    border: `1px solid ${colors.accent}20`
                                }}>
                                    {way.value}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Redemption Math */}
                <div 
                    style={{
                        background: colors.card,
                        borderRadius: '28px',
                        padding: '32px 24px',
                        textAlign: 'center',
                        border: `1px solid ${colors.border}`,
                        marginBottom: '40px'
                    }}
                >
                    <Zap size={32} color={colors.accent} className="mx-auto mb-4" />
                    <h3 className="text-base font-black italic mb-4">Simple Redemption</h3>
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-center">
                            <p className="text-2xl font-black">{rules?.pointsRate || 100}</p>
                            <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Points</p>
                        </div>
                        <div className="text-xl opacity-30">=</div>
                        <div className="text-center">
                            <p className="text-2xl font-black">₹1</p>
                            <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Balance</p>
                        </div>
                    </div>
                    <div style={{ height: '1px', background: colors.border, margin: '20px 0' }} />
                    <p className="text-[11px] font-bold opacity-60 px-4">Minimum redemption: {rules?.minRedeemPoints || 0} Points</p>
                </div>
            </div>
        </div>
    );
};

export default AppLoyaltyHowItWorksPage;
