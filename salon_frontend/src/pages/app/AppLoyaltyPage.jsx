import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShieldCheck,
    Star,
    Sparkles,
    Coins,
    Crown,
    Calendar,
    ChevronRight,
    Camera
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

const AppLoyaltyPage = () => {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const { customer } = useCustomerAuth();
    const { balance, initializeWallet } = useWallet();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FDFCFB' : '#080808',
        card: isLight ? '#FFFFFF' : '#121212',
        text: isLight ? '#121212' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.5)',
        accent: '#C8956C',
        border: isLight ? '#F0EBE6' : 'rgba(255,255,255,0.08)',
    };

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
    }, []);

    const points = Math.max(0, Number(balance || 0));
    // Calculate how many points equal 1 rupee
    const ptsPerRupee = rule.pointsRate || 10;
    const redeemableValue = Math.floor(points / (ptsPerRupee || 1));

    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            padding: '60px 24px',
            fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{ 
                        background: colors.card, border: `1px solid ${colors.border}`, 
                        color: colors.text, width: 44, height: 44, borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Loyalty Hub</h1>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '20px', borderRadius: '24px',
                    marginBottom: '24px', border: `1px solid ${colors.border}`
                }}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{ 
                        width: 60, height: 60, borderRadius: '20px', 
                        background: 'linear-gradient(135deg, #333 0%, #111 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: 900, color: colors.accent,
                        border: `1px solid ${colors.border}`
                    }}>
                        {customer?.name?.charAt(0) || 'U'}
                    </div>
                    <div style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 24, height: 24, borderRadius: '8px',
                        background: colors.accent, border: `2px solid ${colors.bg}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFF'
                    }}>
                        <Camera size={12} />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>{customer?.name || 'Valued Guest'}</h2>
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: '2px 0 0' }}>{customer?.phone || 'Connect with us'}</p>
                </div>
            </motion.div>

            {/* Active Membership Card (Conditional) */}
            {activeMembership && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: activeMembership.planId?.gradient || 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                        borderRadius: '40px 10px 40px 10px',
                        padding: '32px',
                        color: '#FFF',
                        marginBottom: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '-10%', right: '-10%',
                        width: '200px', height: '200px',
                        background: 'rgba(255,255,255,0.05)',
                        filter: 'blur(40px)', borderRadius: '50%'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                            <div style={{ 
                                width: 44, height: 44, borderRadius: '14px', 
                                background: 'rgba(255,255,255,0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Crown size={22} color="#FFF" />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Membership Status</p>
                                <p style={{ fontSize: '14px', fontWeight: 900, color: '#FFF', margin: 0 }}>ACTIVE</p>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                            {activeMembership.planId?.name}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', opacity: 0.7 }}>
                            <Calendar size={14} />
                            <p style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>
                                VALID THRU: {new Date(activeMembership.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px', fontWeight: 800, textTransform: 'uppercase' }}>Member ID</p>
                                <p style={{ fontSize: '14px', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>WAP-{customer?._id?.slice(-6).toUpperCase() || 'XXXXXX'}</p>
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <p style={{ fontSize: '11px', fontWeight: 900, color: colors.textMuted, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rewards Balance</p>

            {/* Ritual Points Card */}
            <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                style={{
                    background: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                    borderRadius: '32px',
                    padding: '32px',
                    color: '#FFF',
                    marginBottom: '24px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                {/* Decoration */}
                <div style={{
                    position: 'absolute', top: '-10%', right: '-5%',
                    width: '180px', height: '180px',
                    background: 'radial-gradient(circle, rgba(200,149,108,0.25) 0%, transparent 70%)',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(200,149,108,0.2)', padding: '6px', borderRadius: '10px' }}>
                            <ShieldCheck size={16} color={colors.accent} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Ritual Points</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '56px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{points.toLocaleString()}</h2>
                        <span style={{ fontSize: '18px', fontWeight: 600, opacity: 0.5, letterSpacing: '0.05em' }}>PTS</span>
                    </div>

                    <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '16px 20px',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>Redeemable Value</p>
                            <p style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>₹{redeemableValue.toLocaleString()}</p>
                        </div>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(200,149,108,0.3)' }}>
                            <Sparkles size={20} color="#FFF" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Point Value Info Section */}
            <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}
            >
                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '28px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ 
                        width: 48, height: 48, borderRadius: '16px', 
                        background: isLight ? '#FDF6F0' : 'rgba(200,149,108,0.1)', 
                        color: colors.accent, margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Coins size={24} />
                    </div>
                    
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: '0 0 8px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }}>Point Value</p>
                    
                    <div style={{ fontSize: '28px', fontWeight: 900, color: colors.text, marginBottom: '6px' }}>
                        {ptsPerRupee} PTS = ₹1
                    </div>
                    
                    <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, fontWeight: 500 }}>Earn and redeem on every service and product</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AppLoyaltyPage;
