import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

export default function AppMembershipPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
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

    // Filter and map plans based on monthly/yearly billing cycle toggle
    const membershipPlans = useMemo(() => {
        // If DB has no plans, or to ensure we have exactly Gold & Platinum matching the screenshot,
        // we map DB plans or generate fallback plans if none match the cycle.
        const filtered = rawPlans.filter(p => {
            const isYearlyPlan = p.duration >= 300;
            return billingCycle === 'yearly' ? isYearlyPlan : !isYearlyPlan;
        });

        // Fallback helper to mock/simulate plans if rawPlans is empty or lacks specific cycle tiers
        if (filtered.length === 0) {
            const basePlans = [
                {
                    id: 'gold-mock',
                    name: 'Gold',
                    price: billingCycle === 'yearly' ? 1999 : 199,
                    duration: billingCycle === 'yearly' ? 365 : 30,
                    benefits: [
                        '10% OFF on all services',
                        'Free Hair Spa (2 Times)',
                        'Priority Booking',
                        'Special Member Offers'
                    ],
                    icon: 'crown',
                    gradient: 'linear-gradient(135deg, #FFF8F2 0%, #FFFBF9 100%)',
                    saveAmount: billingCycle === 'yearly' ? 600 : 50
                },
                {
                    id: 'platinum-mock',
                    name: 'Platinum',
                    price: billingCycle === 'yearly' ? 3999 : 399,
                    duration: billingCycle === 'yearly' ? 365 : 30,
                    benefits: [
                        '15% OFF on all services',
                        'Free Hair Spa (4 Times)',
                        'Free Clean Up (2 Times)',
                        'Priority Booking',
                        'Special Member Offers'
                    ],
                    icon: 'gem',
                    gradient: 'linear-gradient(135deg, #F5F5FA 0%, #FAF9FC 100%)',
                    saveAmount: billingCycle === 'yearly' ? 1200 : 100
                }
            ];
            return basePlans;
        }

        return filtered.map(p => {
            const isGold = p.name.toLowerCase().includes('gold');
            return {
                id: p._id || p.id,
                name: p.name,
                price: Number(p.price || 0),
                duration: Number(p.duration || 30),
                benefits: Array.isArray(p.benefits) && p.benefits.length > 0
                    ? p.benefits
                    : (isGold
                        ? ['10% OFF on all services', 'Free Hair Spa (2 Times)', 'Priority Booking', 'Special Member Offers']
                        : ['15% OFF on all services', 'Free Hair Spa (4 Times)', 'Free Clean Up (2 Times)', 'Priority Booking', 'Special Member Offers']),
                icon: p.icon || (isGold ? 'crown' : 'gem'),
                gradient: isGold
                    ? 'linear-gradient(135deg, #FFF8F2 0%, #FFFBF9 100%)'
                    : 'linear-gradient(135deg, #F5F5FA 0%, #FAF9FC 100%)',
                saveAmount: isGold
                    ? (billingCycle === 'yearly' ? 600 : 50)
                    : (billingCycle === 'yearly' ? 1200 : 100)
            };
        });
    }, [rawPlans, billingCycle]);

    const handleSelectPlan = (plan) => {
        if (activeMembership && activeMembership?.planId?._id === plan.id) return;
        const { icon, ...planData } = plan;
        navigate('/app/membership/checkout', { state: { plan: planData } });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#fcfcfd', color: '#1e293b', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="sticky top-0 z-50 px-4 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#1e293b' }}
                >
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-[17px] font-bold text-slate-800" style={{ margin: 0 }}>
                    Membership Plans
                </h1>
                <div className="w-8"></div>
            </div>

            {/* Monthly / Yearly Selector Switch */}
            <div className="flex justify-center my-6 px-4">
                <div className="relative flex bg-[#f1f5f9] p-1 rounded-full w-full max-w-[340px] shadow-sm">
                    {/* Save More Badge Overlay */}
                    <div className="absolute -top-3 right-4 z-10 bg-[#FFB703] text-black text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                        Save More
                    </div>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${billingCycle === 'monthly'
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`flex-1 py-2 text-[13px] font-bold rounded-full transition-all duration-300 text-white shadow-sm`}
                        style={{
                            background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #B4912B 0%, #D8B043 100%)' : 'transparent',
                            color: billingCycle === 'yearly' ? '#ffffff' : '#94a3b8'
                        }}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Plans List Cards */}
            <div className="px-4 flex flex-col gap-5 max-w-[480px] mx-auto">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-[#B4912B] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs font-semibold text-slate-400">Loading plans...</p>
                    </div>
                ) : (
                    membershipPlans.map((plan) => {
                        const isGold = plan.name.toLowerCase().includes('gold');
                        const isActive = activeMembership?.planId?._id === plan.id;
                        return (
                            <div
                                key={plan.id}
                                style={{
                                    background: plan.gradient,
                                    borderRadius: '24px',
                                    padding: '24px',
                                    border: '1px solid rgba(0,0,0,0.02)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.015)'
                                }}
                                className="relative flex flex-col justify-between"
                            >
                                {/* Top portion: Tier title, price & You save badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3
                                            style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}
                                            className={isGold ? 'text-[#C8956C]' : 'text-slate-800'}
                                        >
                                            {plan.name}
                                        </h3>
                                        <p className="text-[22px] font-black text-slate-900 mt-1 mb-0">
                                            ₹{plan.price.toLocaleString()}
                                            <span className="text-[12px] font-semibold text-slate-400 ml-1">
                                                /{billingCycle === 'yearly' ? 'Year' : 'Month'}
                                            </span>
                                        </p>
                                    </div>
                                    <div
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${isGold ? 'bg-[#FFF2E6] text-[#C8956C]' : 'bg-[#F0EEFC] text-[#6366F1]'
                                            }`}
                                    >
                                        You save ₹{plan.saveAmount}
                                    </div>
                                </div>

                                {/* Bottom portion: Benefits list and Buy button */}
                                <div className="flex justify-between items-end gap-3 mt-2">
                                    <div className="flex flex-col gap-2">
                                        {plan.benefits.map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Check
                                                    size={14}
                                                    className={isGold ? 'text-[#C8956C]' : 'text-[#6366F1]'}
                                                    strokeWidth={3}
                                                />
                                                <span className="text-[12px] text-slate-600 font-semibold">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action button */}
                                    <div className="shrink-0">
                                        <button
                                            onClick={() => handleSelectPlan(plan)}
                                            disabled={isActive}
                                            className="px-5 py-2.5 text-white font-black text-[12px] rounded-full shadow-md shadow-[#B4912B]/20 hover:opacity-90 active:scale-95 transition-all duration-200"
                                            style={{
                                                background: 'linear-gradient(135deg, #B4912B 0%, #D8B043 100%)',
                                                cursor: isActive ? 'not-allowed' : 'pointer',
                                                opacity: isActive ? 0.65 : 1
                                            }}
                                        >
                                            {isActive ? 'Active' : 'Buy Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Terms Link */}
            <div className="text-center mt-10 px-4 opacity-50">
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
