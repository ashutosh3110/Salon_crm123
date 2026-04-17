import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Crown,
    Check,
    Star,
    Zap,
    ShieldCheck,
    Gem,
    ChevronRight,
    Sparkles,
    Trophy,
    Gift,
    Shield
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

const AppMembershipPage = () => {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const colors = {
        bg: isLight ? '#FDFCFB' : '#080808',
        card: isLight ? '#FFFFFF' : '#121212',
        text: isLight ? '#121212' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.5)',
        accent: '#C8956C',
        accentDark: '#A67C59',
        border: isLight ? '#F0EBE6' : 'rgba(255,255,255,0.08)',
        glass: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(18, 18, 18, 0.7)',
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
                        serviceDiscount: p.serviceDiscountValue || 0,
                        serviceDiscountType: p.serviceDiscountType || 'percentage',
                        productDiscount: p.productDiscountValue || 0,
                        productDiscountType: p.productDiscountType || 'percentage'
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
                setActiveMembership(res.data?.data || null);
            } catch (e) {
                console.error('Failed to load membership', e);
            }
        };
        loadActiveMembership();
    }, []);

    const getIcon = (iconName, color = '#FFF') => {
        switch (iconName) {
            case 'crown': return <Crown size={28} color={color} />;
            case 'gem': return <Gem size={28} color={color} />;
            case 'shield': return <Shield size={28} color={color} />;
            case 'zap': return <Zap size={28} color={color} />;
            default: return <Star size={28} color={color} />;
        }
    };

    const fadeUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    };

    const headerVariant = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.1 }
    };

    const generalBenefits = [
        { icon: <Sparkles size={18} />, title: 'Priority Booking', desc: 'Jump the queue' },
        { icon: <Gift size={18} />, title: 'Exclusive Rewards', desc: 'Member-only gifts' },
        { icon: <Trophy size={18} />, title: 'Tier Status', desc: 'Ascend to luxury' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: colors.bg,
            color: colors.text,
            paddingBottom: '120px',
            fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
            {/* Background Decorative Elements */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '400px',
                background: `radial-gradient(circle at 50% 0%, ${isLight ? 'rgba(200,149,108,0.15)' : 'rgba(200,149,108,0.08)'} 0%, transparent 70%)`,
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* ── HEADER ── */}
            <motion.div 
                variants={headerVariant}
                initial="initial"
                animate="animate"
                style={{ 
                    position: 'sticky', top: 0, zIndex: 100,
                    padding: '60px 20px 20px',
                    background: colors.glass,
                    backdropFilter: 'blur(15px)',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    borderBottom: `1px solid ${colors.border}`
                }}
            >
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    style={{
                        background: colors.card,
                        border: `1px solid ${colors.border}`,
                        width: 44, height: 44, borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: colors.text, boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Membership Hub</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent }} />
                        <p style={{ fontSize: '11px', color: colors.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Elevate Your Experience</p>
                    </div>
                </div>
            </motion.div>

            {/* ── HERO ── */}
            <motion.div {...fadeUp} style={{ padding: '32px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px', lineHeight: 1.1 }}>
                    Tiered Luxury <br/> <span style={{ color: colors.accent }}>Tailored for You.</span>
                </h1>
                <p style={{ fontSize: '15px', color: colors.textMuted, maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                    Discover the ultimate salon experience with curated benefits and prioritized care.
                </p>
                
            </motion.div>

            {/* ── MEMBERSHIP PLANS ── */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', zIndex: 1 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ width: 40, height: 40, border: `3px solid ${colors.accent}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}
                        />
                        <p style={{ fontSize: '14px', fontWeight: 700, color: colors.textMuted }}>Curating our elite tiers...</p>
                    </div>
                ) : (
                    membershipPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: plan.gradient,
                                borderRadius: '40px 10px 40px 10px',
                                padding: '32px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: plan.popular ? `0 30px 60px ${isLight ? 'rgba(200,149,108,0.25)' : 'rgba(0,0,0,0.4)'}` : '0 20px 40px rgba(0,0,0,0.1)',
                                border: plan.popular ? `2px solid ${colors.accent}` : '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            {/* Decorative Elements inside Card */}
                            <div style={{
                                position: 'absolute', top: '-10%', right: '-10%',
                                width: '150px', height: '150px',
                                background: 'rgba(255,255,255,0.1)',
                                filter: 'blur(50px)', borderRadius: '50%'
                            }} />

                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: '32px', right: '32px',
                                    background: '#FFD700', padding: '6px 12px',
                                    borderRadius: '12px', fontSize: '11px', fontWeight: 900,
                                    color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                    Most Coveted
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '18px',
                                    background: 'rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    {getIcon(plan.icon)}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#FFF' }}>{plan.name}</h3>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 600 }}>{plan.duration} Days of Luxury</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <span style={{ fontSize: '42px', fontWeight: 900, color: '#FFF' }}>₹{plan.price}</span>
                                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}> / month</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                                {plan.benefits.map((benefit, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                    >
                                        <div style={{
                                            width: 22, height: 22, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#FFF'
                                        }}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <p style={{ fontSize: '15px', margin: 0, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{benefit}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Privileged Discounts Section */}
                            {(plan.serviceDiscount > 0 || plan.productDiscount > 0) && (
                                <div style={{ 
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: '24px',
                                    padding: '20px',
                                    marginBottom: '32px',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Privileged Discounts
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {plan.serviceDiscount > 0 && (
                                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', fontWeight: 800 }}>SERVICES</p>
                                                <p style={{ fontSize: '18px', fontWeight: 900, color: colors.accent, margin: 0 }}>
                                                    {plan.serviceDiscountType === 'percentage' ? `${plan.serviceDiscount}%` : `₹${plan.serviceDiscount}`}
                                                    <span style={{ fontSize: '10px', color: '#FFF', opacity: 0.6, marginLeft: '4px', fontWeight: 600 }}>OFF</span>
                                                </p>
                                            </div>
                                        )}
                                        {plan.productDiscount > 0 && (
                                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px', fontWeight: 800 }}>PRODUCTS</p>
                                                <p style={{ fontSize: '18px', fontWeight: 900, color: colors.accent, margin: 0 }}>
                                                    {plan.productDiscountType === 'percentage' ? `${plan.productDiscount}%` : `₹${plan.productDiscount}`}
                                                    <span style={{ fontSize: '10px', color: '#FFF', opacity: 0.6, marginLeft: '4px', fontWeight: 600 }}>OFF</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {plan.includedServices.length > 0 && (
                                <div style={{ marginBottom: '32px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Complimentary Services
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {plan.includedServices.map((svc, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    fontSize: '11px', padding: '6px 14px',
                                                    borderRadius: '14px',
                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: '#FFF', fontWeight: 600
                                                }}
                                            >
                                                {svc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <motion.button
                                whileTap={!activeMembership ? { scale: 0.96 } : {}}
                                disabled={!!activeMembership}
                                onClick={() => {
                                    if (activeMembership) return;
                                    const { icon, ...planData } = plan;
                                    navigate('/app/membership/checkout', { state: { plan: planData } });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    background: activeMembership?.planId?._id === plan.id 
                                        ? 'rgba(255,255,255,0.15)' 
                                        : activeMembership 
                                            ? 'rgba(255,255,255,0.05)'
                                            : '#FFF',
                                    color: activeMembership ? 'rgba(255,255,255,0.5)' : '#121212',
                                    border: 'none',
                                    borderRadius: '24px 8px 24px 8px',
                                    fontSize: '16px',
                                    fontWeight: 900,
                                    cursor: activeMembership ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    boxShadow: activeMembership ? 'none' : '0 10px 30px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {activeMembership?.planId?._id === plan.id ? (
                                    <><ShieldCheck size={20} /> Active Privileges</>
                                ) : activeMembership ? (
                                    <>Subscription Active</>
                                ) : (
                                    <>Select This Tier <ChevronRight size={20} /></>
                                )}
                            </motion.button>
                        </motion.div>
                    ))
                )}
            </div>

            {/* ── FOOTER NOTE ── */}
            <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>All plans are subject to Terms & Conditions.</p>
                <p style={{ fontSize: '12px', fontWeight: 600, margin: '4px 0 0' }}>Experience salon care like never before.</p>
            </div>
        </div>
    );
};

export default AppMembershipPage;

