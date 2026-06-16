import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Star, Gem, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

export default function AppMembershipPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'my-membership'
    const [rawPlans, setRawPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMembership, setActiveMembership] = useState(null);

    // Fetch public membership plans
    useEffect(() => {
        const loadPlans = async () => {
            setLoading(true);
            try {
                const salonId = localStorage.getItem('active_salon_id');
                const res = await api.get('/loyalty/membership-plans/public', { params: { salonId } });
                const list = res?.data?.data || res?.data || [];
                setRawPlans(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error("Failed to load membership plans", err);
                setRawPlans([]);
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    // Fetch active user membership
    useEffect(() => {
        const loadActiveMembership = async () => {
            try {
                const res = await api.get('/loyalty/membership/active');
                setActiveMembership(res.data?.data || null);
            } catch (e) {
                console.error('Failed to load active membership', e);
            }
        };
        loadActiveMembership();
    }, []);

    // Filter and map plans based on client requirement
    const membershipPlans = useMemo(() => {
        // Find matching plans in rawPlans
        const dbElite = rawPlans.find(p => {
            const nameUpper = p.name.toUpperCase();
            return nameUpper.includes('ELITE') || nameUpper.includes('GOLD') || p.price >= 2000;
        });
        const dbPlus = rawPlans.find(p => {
            const nameUpper = p.name.toUpperCase();
            return nameUpper.includes('PLUS') || nameUpper.includes('PLATINUM') || (p.price >= 1000 && p.price < 2000);
        });
        const dbBasic = rawPlans.find(p => {
            const nameUpper = p.name.toUpperCase();
            return !nameUpper.includes('ELITE') && !nameUpper.includes('GOLD') && !nameUpper.includes('PLUS') && !nameUpper.includes('PLATINUM') && p.price < 1000;
        });

        return [
            {
                id: dbElite?._id || dbElite?.id || 'elite-mock',
                name: 'WAPIXO ELITE',
                price: 2499,
                duration: 365,
                benefits: [
                    '20% OFF on all services',
                    '2 Free services (worth ₹1200)',
                    'Priority booking',
                    'Exclusive member offers',
                    'Birthday special discount'
                ],
                isPopular: true,
                saveAmount: 0,
                rawPlan: dbElite
            },
            {
                id: dbPlus?._id || dbPlus?.id || 'plus-mock',
                name: 'WAPIXO PLUS',
                price: 1499,
                duration: 365,
                benefits: [
                    '15% OFF on all services',
                    '1 Free service (worth ₹600)',
                    'Priority booking',
                    'Exclusive member offers'
                ],
                isPopular: false,
                saveAmount: 1000,
                rawPlan: dbPlus
            },
            {
                id: dbBasic?._id || dbBasic?.id || 'basic-mock',
                name: 'WAPIXO BASIC',
                price: 799,
                duration: 365,
                benefits: [
                    '10% OFF on all services',
                    'Birthday special discount'
                ],
                isPopular: false,
                saveAmount: 300,
                rawPlan: dbBasic
            }
        ];
    }, [rawPlans]);

    const handleSelectPlan = (plan) => {
        if (activeMembership && activeMembership?.planId?._id === plan.id) return;
        
        // Prepare checkout data matching the standard payload structure
        const planData = plan.rawPlan ? {
            id: plan.rawPlan._id || plan.rawPlan.id,
            name: plan.name,
            price: plan.price,
            duration: Number(plan.rawPlan.duration || 365),
            benefits: plan.benefits,
            gradient: plan.isPopular 
                ? 'linear-gradient(135deg, #B4912B 0%, #D8B043 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            serviceDiscountValue: plan.rawPlan.serviceDiscountValue,
            serviceDiscountType: plan.rawPlan.serviceDiscountType,
            productDiscountValue: plan.rawPlan.productDiscountValue,
            productDiscountType: plan.rawPlan.productDiscountType
        } : {
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            benefits: plan.benefits,
            gradient: plan.isPopular 
                ? 'linear-gradient(135deg, #B4912B 0%, #D8B043 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        };

        navigate('/app/membership/checkout', { state: { plan: planData } });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fcfcfd', color: '#1e293b', paddingBottom: '90px', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#1e293b' }}
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-[17px] font-bold text-slate-800" style={{ margin: 0 }}>
                    Membership
                </h1>
                <div className="w-8"></div>
            </div>

            {/* Toggle Switch: Plans / My Membership */}
            <div className="flex justify-center my-6 px-4">
                <div 
                    style={{ 
                        background: '#FAF9F6', 
                        borderRadius: '9999px', 
                        padding: '4px', 
                        border: '1px solid #EAE5D9', 
                        display: 'flex', 
                        width: '100%', 
                        maxWidth: '340px', 
                        position: 'relative' 
                    }}
                >
                    <button
                        onClick={() => setActiveTab('plans')}
                        style={{
                            background: activeTab === 'plans' ? '#B4912B' : 'transparent',
                            color: activeTab === 'plans' ? '#FFFFFF' : '#666666',
                            borderRadius: '9999px',
                            flex: 1,
                            padding: '10px 0',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('my-membership')}
                        style={{
                            background: activeTab === 'my-membership' ? '#B4912B' : 'transparent',
                            color: activeTab === 'my-membership' ? '#FFFFFF' : '#666666',
                            borderRadius: '9999px',
                            flex: 1,
                            padding: '10px 0',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        My Membership
                    </button>
                </div>
            </div>

            {/* Render Views */}
            <div className="px-4 flex flex-col gap-6 max-w-[480px] mx-auto">
                {activeTab === 'plans' ? (
                    loading ? (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-2 border-[#B4912B] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-semibold text-slate-400">Loading membership tiers...</p>
                        </div>
                    ) : (
                        membershipPlans.map((plan) => {
                            const isElite = plan.isPopular;
                            const isActive = activeMembership?.planId?._id === plan.id;
                            
                            return (
                                <div key={plan.id} style={{ position: 'relative' }}>
                                    {/* Plan Card */}
                                    <div
                                        style={{
                                            background: '#FFFFFF',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            border: isElite ? '1.5px solid #B4912B' : '1px solid #F1ECE4',
                                            boxShadow: isElite ? '0 8px 24px rgba(180, 145, 43, 0.08)' : '0 4px 12px rgba(0, 0, 0, 0.015)'
                                        }}
                                        className="relative flex flex-col gap-4"
                                    >
                                        {/* Most Popular Label on top of card */}
                                        {isElite && (
                                            <div 
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: '-12px', 
                                                    left: '16px', 
                                                    background: '#B4912B', 
                                                    color: '#FFFFFF', 
                                                    fontSize: '10px', 
                                                    fontWeight: 800, 
                                                    padding: '4px 10px', 
                                                    borderRadius: '6px',
                                                    zIndex: 10,
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                Most Popular
                                            </div>
                                        )}
                                        {/* Name, Star Badge, Price & Save amount badge */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em' }}>
                                                    {plan.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#000000' }}>
                                                        ₹{plan.price.toLocaleString()}
                                                    </span>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#888888' }}>
                                                        / Year
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Top Right Badges */}
                                            {isElite ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#B4912B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Star size={14} color="#000000" fill="#000000" />
                                                    </div>
                                                    <span style={{ fontSize: '10px', color: '#B4912B', background: '#FAF6EC', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        Most Popular
                                                    </span>
                                                </div>
                                            ) : (
                                                plan.saveAmount > 0 && (
                                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#B4912B', background: '#FAF6EC', padding: '4px 10px', borderRadius: '6px' }}>
                                                        Save ₹{plan.saveAmount}
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Benefits List */}
                                        <div className="flex flex-col gap-2.5 mt-2">
                                            {plan.benefits.map((benefit, idx) => (
                                                <div key={idx} className="flex items-start gap-2.5">
                                                    <Check
                                                        size={14}
                                                        className="text-black shrink-0 mt-0.5"
                                                        strokeWidth={3}
                                                    />
                                                    <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>
                                                        {benefit}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleSelectPlan(plan)}
                                                disabled={isActive}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    textAlign: 'center',
                                                    cursor: isActive ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    background: isActive 
                                                        ? '#CCCCCC'
                                                        : (isElite ? '#B4912B' : 'transparent'),
                                                    color: isActive
                                                        ? '#666666'
                                                        : (isElite ? '#FFFFFF' : '#B4912B'),
                                                    border: isActive
                                                        ? '1px solid #CCCCCC'
                                                        : `1px solid #B4912B`
                                                }}
                                                className={!isActive && isElite ? 'hover:brightness-95 active:scale-[0.99]' : 'hover:bg-[#FAF6EC] active:scale-[0.99]'}
                                            >
                                                {isActive ? 'Active Plan' : 'Join Now'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    /* My Membership tab content */
                    <div className="flex flex-col gap-6">
                        {activeMembership ? (
                            <div
                                style={{
                                    background: '#FFFFFF',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    border: '1px solid #F1ECE4',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)'
                                }}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                    <div>
                                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#B4912B', letterSpacing: '0.05em' }}>Your Active Membership</span>
                                        <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 900, color: '#000' }}>
                                            {activeMembership.planId?.name || 'VIP Member'}
                                        </h2>
                                    </div>
                                    <div style={{ background: '#E6F4EA', color: '#137333', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px' }}>
                                        Active
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Started On</span>
                                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatDate(activeMembership.startDate)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Expires On</span>
                                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatDate(activeMembership.expiresAt)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ background: '#FAF9F6', borderRadius: '12px', padding: '16px', border: '1px solid #F1ECE4' }}>
                                    <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#B4912B', letterSpacing: '0.05em' }}>Included Benefits</h4>
                                    <div className="flex flex-col gap-2">
                                        {(activeMembership.planId?.benefits || [
                                            'Exclusive member-only discounts',
                                            'Priority booking on busy days',
                                            'Special birthday perks'
                                        ]).map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Check size={14} className="text-emerald-600 shrink-0" strokeWidth={3} />
                                                <span className="text-[12px] text-slate-700 font-semibold">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 flex flex-col items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FAF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Crown size={28} color="#B4912B" />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-bold text-slate-800 mb-1">No Active Membership</h3>
                                    <p className="text-[12px] text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                                        Unlock exclusive rewards, free services and special membership discounts at Wapixo.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('plans')}
                                    style={{
                                        background: '#B4912B',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 24px',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                    className="hover:brightness-95 active:scale-95 transition-all duration-200"
                                >
                                    Explore Plans
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Terms Link */}
            <div className="text-center mt-12 px-4 opacity-50">
                <p className="text-[11px] font-semibold text-slate-500 m-0">
                    All plans are subject to <Link to="/app/terms" style={{ color: '#B4912B', textDecoration: 'none', fontWeight: 700 }}>Terms & Conditions</Link>.
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    Experience salon care like never before.
                </p>
            </div>
        </div>
    );
}
