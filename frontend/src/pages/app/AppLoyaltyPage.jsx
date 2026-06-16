import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Coins,
    Crown,
    Calendar,
    ChevronRight,
    Camera,
    Sparkles,
    ChevronLeft
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

const AppLoyaltyPage = () => {
    const navigate = useNavigate();
    const { colors: themeColors, isLight } = useCustomerTheme();
    const { customer } = useCustomerAuth();
    const { refreshWallet } = useWallet();
    const points = customer?.loyaltyPoints || 0;

    const colors = useMemo(() => ({
        bg: '#FFFFFF',
        card: '#FFFFFF',
        text: themeColors.text || '#1A1A1A',
        textMuted: themeColors.textMuted || '#666',
        border: themeColors.border || 'rgba(0,0,0,0.08)',
        toggle: themeColors.input || '#F3F4F6',
        accent: themeColors.accent || '#B4912B',
    }), [themeColors]);

    const [rule, setRule] = React.useState({
        pointsRate: 10,
        minRedeemPoints: 100,
    });

    const [activeMembership, setActiveMembership] = React.useState(null);

    React.useEffect(() => {
        const loadLoyaltyData = async () => {
            try {
                const [rulesRes, membershipRes] = await Promise.all([
                    api.get('/loyalty/rules'),
                    api.get('/loyalty/membership/active')
                ]);

                if (rulesRes.data?.success) {
                    setRule(rulesRes.data.data);
                }
                if (membershipRes.data?.success) {
                    setActiveMembership(membershipRes.data.data);
                }
            } catch (e) {
                console.error('Failed to load loyalty data', e);
            }
        };
        loadLoyaltyData();
        refreshWallet(); // Refresh wallet to sync latest points/balance
    }, [refreshWallet]);

    const ptsPerRupee = rule.pointsRate || 100;
    const redeemableValue = Math.floor(points / (ptsPerRupee || 1));

    const fadeUp = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#FFFFFF',
            color: colors.text,
        }} className="pb-8 font-sans text-sm">
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-transparent active:bg-gray-200/50 transition-colors"
                >
                    <ChevronLeft className="w-5.5 h-5.5" style={{ color: colors.text }} />
                </button>
                <h1 className="text-base font-bold text-center flex-1 pr-2" style={{ color: colors.text }}>Loyalty Rewards</h1>
                <button
                    onClick={() => navigate('/app/loyalty-how-it-works')}
                    className="text-[11px] font-bold transition-opacity hover:opacity-80 px-2 py-1 uppercase tracking-wide"
                    style={{ color: colors.accent }}
                >
                    Info
                </button>
            </div>

            <div className="px-4 space-y-4">
                {/* Profile Section (Compact) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: colors.card,
                        padding: '12px 16px', borderRadius: '16px',
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '12px',
                            background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '16px', fontWeight: 900, color: '#FFF',
                            border: `1px solid ${colors.border}`
                        }}>
                            {customer?.name?.charAt(0) || 'U'}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: -2, right: -2,
                            width: 18, height: 18, borderRadius: '6px',
                            background: colors.accent, border: `1.5px solid ${colors.bg}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#FFF'
                        }}>
                            <Camera size={9} />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 className="text-sm font-extrabold" style={{ color: colors.text, margin: 0 }}>{customer?.name || 'Valued Guest'}</h2>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: '0px' }}>{customer?.phone || 'Connect with us'}</p>
                    </div>
                </motion.div>

                {/* Active Membership Card (Compact) */}
                {activeMembership && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        style={{
                            background: activeMembership.planId?.gradient || 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                            borderRadius: '20px 8px 20px 8px',
                            padding: '18px 20px',
                            color: '#FFF',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backdropFilter: 'blur(5px)'
                                    }}>
                                        <Crown size={15} color="#FFF" />
                                    </div>
                                    <span className="text-xs font-black tracking-wider uppercase text-white/90">
                                        {activeMembership.planId?.name}
                                    </span>
                                </div>
                                <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded bg-white/20">ACTIVE</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
                                <div style={{ opacity: 0.9 }}>
                                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>Member ID</span>
                                    <p className="font-bold m-0 tracking-wide">WAP-{customer?._id?.slice(-6).toUpperCase() || 'XXXXXX'}</p>
                                </div>
                                <div style={{ opacity: 0.9, textAlign: 'right' }}>
                                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>Expires</span>
                                    <p className="font-bold m-0">
                                        {new Date(activeMembership.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Ritual Points Card (Compact) */}
                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    style={{
                        background: 'linear-gradient(135deg, #DFAC2C 0%, #B98514 100%)',
                        borderRadius: '24px',
                        padding: '20px 24px',
                        color: '#FFF',
                        boxShadow: '0 12px 24px rgba(185, 133, 20, 0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <div style={{ position: 'relative', zIndex: 1 }} className="space-y-4">
                        <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance</div>

                        <div className="flex justify-between items-end">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <h2 style={{ fontSize: '38px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>{points.toLocaleString()}</h2>
                                    <span style={{ fontSize: '12px', fontWeight: 800, opacity: 0.8 }}>PTS</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 800 }}>Redeemable Value</p>
                                <p style={{ fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1 }}>₹{redeemableValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Point Value Info Section (Compact) */}
                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.08 }}
                >
                    <div style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '20px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                    }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: '10px',
                            background: isLight ? '#FFF8E6' : 'rgba(223, 172, 44, 0.1)',
                            color: colors.accent,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            shrink: 0
                        }}>
                            <Coins size={18} style={{ color: colors.accent }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '9px', color: colors.textMuted, margin: '0 0 1px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Point Value</p>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: colors.text }}>
                                {ptsPerRupee} PTS = ₹1
                            </div>
                        </div>
                        <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0, maxWidth: '140px', textAlign: 'right', fontWeight: 500, lineHeight: 1.2 }}>
                            Earn & redeem on all services & products
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AppLoyaltyPage;
