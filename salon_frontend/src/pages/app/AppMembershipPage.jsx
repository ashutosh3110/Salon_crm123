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
import api from '../../services/api';

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

    const [membershipPlans, setMembershipPlans] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeMembership, setActiveMembership] = React.useState(null);

    React.useEffect(() => {
        const loadPlans = async () => {
            setLoading(true);
            try {
                const salonId = localStorage.getItem('active_salon_id');
                const res = await api.get('/loyalty/membership-plans/public', { params: { salonId } });
                const list = res?.data?.data || res?.data || [];
                const rows = Array.isArray(list) ? list : [];
                const mapped = rows
                    .filter((p) => p?.isActive !== false)
                    .map((p) => ({
                        id: p._id || p.id,
                        name: p.name,
                        price: Number(p.price || 0),
                        duration: Number(p.duration || 30),
                        benefits: Array.isArray(p.benefits) ? p.benefits : [],
                        includedServices: Array.isArray(p.includedServices) ? p.includedServices : [],
                        icon: p.icon || 'star',
                        gradient: p.gradient || 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                        popular: !!p.isPopular,
                    }));
                setMembershipPlans(mapped);
            } catch {
                setMembershipPlans([]);
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    React.useEffect(() => {
        const loadActiveMembership = async () => {
            try {
                const res = await api.get('/loyalty/membership/active');
                setActiveMembership(res.data || null);
            } catch (e) {
                console.error('Failed to load membership', e);
            }
        };
        loadActiveMembership();
    }, []);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'crown': return <Crown size={24} />;
            case 'gem': return <Gem size={24} />;
            default: return <Star size={24} />;
        }
    };

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
            paddingTop: '20px',
            paddingBottom: '100px',
            fontFamily: "'Inter', sans-serif"
        }}>



            {/* ── HEADER ── */}
            <div className="sticky top-0 z-40 px-4 pt-4 pb-4 flex items-center gap-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.text,
                        padding: 0
                    }}
                >
                    <ArrowLeft size={24} />
                </motion.button>
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>Membership Hub</h2>
                    <p style={{ fontSize: '10px', color: colors.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Experience the Royal Treatment</p>
                </div>
            </div>

            {/* ── HERO TEXT (Hidden/Removed older redundant section) ── */}
            <motion.div
                {...fadeUp}
                style={{ padding: '0 16px 24px' }}
            >
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Join our elite community and enjoy curated luxury benefits on every visit.</p>
            </motion.div>

            {/* ── PLANS LIST ── */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: '13px', fontWeight: 700 }}>Loading membership plans...</div>
                ) : membershipPlans.length === 0 ? (
                    <div style={{ textAlign: 'center', color: colors.textMuted, fontSize: '13px', fontWeight: 700 }}>No membership plans available right now.</div>
                ) : membershipPlans.map((plan, index) => (
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
                                {getIcon(plan.icon)}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>{plan.name}</h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '32px', fontWeight: 900 }}>₹{plan.price}</span>
                            <span style={{ fontSize: '14px', opacity: 0.7 }}> / month</span>
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

                        {plan.includedServices.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.8, margin: '0 0 8px', textTransform: 'uppercase' }}>
                                    Included Services
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {plan.includedServices.slice(0, 8).map((svc, idx) => (
                                        <span
                                            key={`${svc}-${idx}`}
                                            style={{
                                                fontSize: '10px',
                                                padding: '4px 8px',
                                                borderRadius: '999px',
                                                border: '1px solid rgba(255,255,255,0.25)',
                                                background: 'rgba(255,255,255,0.08)',
                                            }}
                                        >
                                            {svc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            disabled={activeMembership?.planId?._id === plan.id}
                            onClick={() => {
                                if (activeMembership?.planId?._id === plan.id) return;
                                const { icon, ...planData } = plan; // Remove JSX icon which causes DataCloneError
                                navigate('/app/membership/checkout', { state: { plan: planData } });
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: activeMembership?.planId?._id === plan.id 
                                    ? 'rgba(255,255,255,0.2)' 
                                    : (plan.id === 'gold' ? '#000' : '#FFF'),
                                color: activeMembership?.planId?._id === plan.id
                                    ? '#FFF'
                                    : (plan.id === 'gold' ? '#FFF' : (plan.id === 'platinum' ? '#000' : '#333')),
                                border: 'none',
                                borderRadius: '16px 4px 16px 4px',
                                fontSize: '14px',
                                fontWeight: 800,
                                cursor: activeMembership?.planId?._id === plan.id ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: activeMembership?.planId?.id === plan.id ? 0.8 : 1
                            }}
                        >
                            {activeMembership?.planId?._id === plan.id ? (
                                <><ShieldCheck size={18} /> Activated</>
                            ) : (
                                <>Select Plan <ChevronRight size={18} /></>
                            )}
                        </motion.button>
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default AppMembershipPage;
