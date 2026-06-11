import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle, XCircle, Crown, Zap, Shield, CreditCard, ArrowRight, Package, Calendar, Users, Store, Smartphone, BarChart2, MessageSquare, Heart, Target, Activity, Star, DollarSign, Sparkles,
    Megaphone, Briefcase, Layout, ClipboardList, Bell, UserCog, Check, CalendarDays, Rocket, Gift, Square, ShieldCheck, Headphones, RefreshCw, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';

const ICON_MAP = {
    pos: Zap,
    appointments: Calendar,
    inventory: Package,
    marketing: Megaphone,
    payroll: Briefcase,
    crm: Users,
    loyalty: Crown,
    finance: DollarSign,
    mobileApp: Smartphone,
    whatsapp: MessageSquare,
    reports: BarChart2,
    feedback: Star,
    cms: Layout,
    inquiries: ClipboardList,
    reminders: Bell,
    setup: UserCog
};

const PLAN_COLORS = {
    slate: 'from-slate-500 to-slate-700',
    blue: 'from-blue-500 to-indigo-600',
    primary: 'from-primary to-[#8B6F23]',
    amber: 'from-amber-500 to-orange-600'
};

const PLAN_RANK = {
    'free': 0, 'basic': 1, 'pro': 2, 'premium': 3, 'enterprise': 4
};

export default function SubscriptionPage() {
    const { user } = useAuth();
    const { salon } = useBusiness();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [upgrading, setUpgrading] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [plans, setPlans] = useState([]);
    const [billingLogs, setBillingLogs] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelComment, setCancelComment] = useState('');
    const [allFeatures, setAllFeatures] = useState([]);
    const [trialDays, setTrialDays] = useState(14);

    const { refreshUser } = useAuth();

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const fetchPlans = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const res = await api.get('/plans');
            if (res.data?.success) {
                // Group plans by name to handle monthly/yearly prices in the same card
                const rawPlans = res.data.data || [];
                const normalized = rawPlans.map(p => {
                    const mPrice = p.monthlyPrice || p.price || 0;
                    const yPrice = p.yearlyPrice || (mPrice * 12 * 0.8) || 0;
                    return {
                        ...p,
                        id: p._id,
                        monthlyPrice: mPrice,
                        yearlyPrice: yPrice,
                        monthlyId: p._id,
                        yearlyId: p._id
                    };
                });

                setPlans(normalized.sort((a, b) => (PLAN_RANK[a.name.toLowerCase()] || 0) - (PLAN_RANK[b.name.toLowerCase()] || 0)));
            }
        } catch (e) {
            console.error('Error fetching plans:', e);
            setPlans([]);
        } finally { setLoadingPlans(false); }
    }, []);

    const fetchBillingHistory = useCallback(async () => {
        try {
            // Placeholder for real billing history if available
        } catch (e) { console.error(e); }
    }, []);

    const [currentSalon, setCurrentSalon] = useState(null);

    const fetchCurrentSalon = useCallback(async () => {
        try {
            const res = await api.get('/salons/me');
            if (res.data?.success) setCurrentSalon(res.data.data);
        } catch (e) { console.error('Error fetching salon info:', e); }
    }, []);

    useEffect(() => {
        fetchPlans();
        fetchBillingHistory();
        fetchFeatures();
        fetchCurrentSalon();
        fetchSettings();
    }, [fetchPlans, fetchBillingHistory, fetchCurrentSalon]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data?.success) setTrialDays(res.data.data.defaultTrialDays || 14);
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const fetchFeatures = async () => {
        try {
            const res = await api.get('/plans/features/list');
            if (res.data?.success) setAllFeatures(res.data.data);
        } catch (e) {
            console.error('Error fetching features:', e);
        }
    };

    const effectiveSalon = currentSalon || salon;
    const activePlanId = effectiveSalon?.subscriptionPlanId || user?.subscriptionPlanId;
    const currentPlanName = effectiveSalon?.subscriptionPlan || '';
    const displayPlans = plans || [];

    const currentPlan = displayPlans.find(p => {
        // Match by Name (case-insensitive, trimmed)
        const nameMatch = currentPlanName && p.name &&
            p.name.trim().toLowerCase() === currentPlanName.trim().toLowerCase();

        // Match by ID
        const idMatch = activePlanId && (String(p.id) === String(activePlanId) || String(p._id) === String(activePlanId));

        return nameMatch || idMatch;
    }) || null;

    const handleDownloadInvoice = async () => {
        setDownloadingInvoice(true);
        await new Promise(r => setTimeout(r, 1000));
        setDownloadingInvoice(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    /**
     * RAZORPAY INTEGRATION
     */
    const handleUpgrade = async (plan) => {
        const resScript = await loadRazorpayScript();
        if (!resScript) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const planToPurchaseId = billingCycle === 'monthly' ? plan.monthlyId : plan.yearlyId;
        if (!planToPurchaseId) {
            alert('This plan variant is not available currently.');
            return;
        }

        setUpgrading(plan.id);
        try {
            // 1. Create Order
            const { data } = await api.post('/payments/create-order', {
                planId: planToPurchaseId,
                billingCycle
            });

            if (!data.success) throw new Error(data.message);

            // Handle Direct Activation (Free Plans)
            if (data.isFree) {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return;
            }

            const options = {
                key: data.data.key,
                amount: data.data.amount,
                currency: data.data.currency,
                name: "Wapixo Salon CRM",
                description: `Upgrade to ${plan.name} (${billingCycle})`,
                order_id: data.data.orderId,
                handler: async (response) => {
                    try {
                        // 2. Verify Payment
                        const verifyRes = await api.post('/payments/verify', response);
                        if (verifyRes.data.success) {
                            setShowSuccess(true);
                            if (refreshUser) await refreshUser();
                            // Refresh page to show new status
                            window.location.reload();
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: salon?.phone
                },
                theme: {
                    color: "#B4912B"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Upgrade failed:', error);
            alert(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpgrading(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!cancelReason) return;
        setCancelling(true);
        try {
            await api.post('/subscriptions/cancel', { reason: cancelReason });
            setShowCancelModal(false);
            setShowSuccess(true);
            if (refreshUser) await refreshUser();
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Cancellation failed:', error);
        } finally {
            setCancelling(false);
        }
    };

    const displayBillingHistory = billingLogs.map(b => ({
        id: b.invoiceNumber,
        date: new Date(b.createdAt).toLocaleDateString(),
        amount: `₹${b.totalAmount.toLocaleString()}`,
        status: (b.status || 'paid').toUpperCase(),
        method: b.paymentMethod || 'Manual'
    }));

    const getPlanStyle = (planName) => {
        const name = (planName || '').toLowerCase();
        if (name.includes('free')) return {
            iconBg: 'bg-[#ecfdf5]', iconColor: 'text-[#10b981]', icon: Gift,
            btnActiveBg: 'bg-white', btnActiveText: 'text-[#10b981]', btnActiveBorder: 'border-2 border-[#10b981] hover:bg-[#ecfdf5]'
        };
        if (name.includes('basic')) return {
            iconBg: 'bg-[#eff6ff]', iconColor: 'text-[#3b82f6]', icon: Rocket,
            btnActiveBg: 'bg-white', btnActiveText: 'text-[#3b82f6]', btnActiveBorder: 'border-2 border-[#3b82f6] hover:bg-[#eff6ff]'
        };
        return { // Pro
            iconBg: 'bg-[#fff7ed]', iconColor: 'text-[#f59e0b]', icon: Crown,
            btnActiveBg: 'bg-[#8b5cf6]', btnActiveText: 'text-white', btnActiveBorder: 'border-2 border-[#8b5cf6] hover:bg-[#7c3aed]'
        };
    };

    return (
        <div className="space-y-4 pb-6 font-sans min-h-screen bg-[#fafbfc] px-2 subscription-page-wrapper">
            <style>{`
                .dark .subscription-page-wrapper {
                    background-color: #121826 !important;
                }
                .dark .subscription-page-wrapper .bg-white {
                    background-color: #1e293b !important;
                }
                .dark .subscription-page-wrapper .border-slate-100,
                .dark .subscription-page-wrapper .border-slate-100\\/80,
                .dark .subscription-page-wrapper .border-slate-100\\/50 {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .subscription-page-wrapper .text-slate-900,
                .dark .subscription-page-wrapper .text-slate-700 {
                    color: #f8fafc !important;
                }
                .dark .subscription-page-wrapper .text-slate-500,
                .dark .subscription-page-wrapper .text-slate-400 {
                    color: #cbd5e1 !important;
                }
                .dark .subscription-page-wrapper .bg-\\[\\#fafbfc\\] {
                    background-color: #121826 !important;
                }
                .dark .subscription-page-wrapper .h-px.bg-slate-100 {
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .subscription-page-wrapper .md\\:border-l.border-slate-200 {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .subscription-page-wrapper .bg-\\[\\#f3e8ff\\] {
                    background-color: rgba(147, 51, 234, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-\\[\\#9333ea\\] {
                    color: #c084fc !important;
                }
                .dark .subscription-page-wrapper .bg-\\[\\#ecfdf5\\] {
                    background-color: rgba(16, 185, 129, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-\\[\\#10b981\\] {
                    color: #34d399 !important;
                }
                .dark .subscription-page-wrapper .bg-\\[\\#eff6ff\\] {
                    background-color: rgba(59, 130, 246, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-\\[\\#3b82f6\\] {
                    color: #60a5fa !important;
                }
                .dark .subscription-page-wrapper .bg-\\[\\#fff7ed\\] {
                    background-color: rgba(245, 158, 11, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-\\[\\#f59e0b\\] {
                    color: #fbbf24 !important;
                }
                .dark .subscription-page-wrapper .bg-blue-100 {
                    background-color: rgba(59, 130, 246, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-blue-600 {
                    color: #60a5fa !important;
                }
                .dark .subscription-page-wrapper .bg-teal-100 {
                    background-color: rgba(20, 184, 166, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-teal-600 {
                    color: #2dd4bf !important;
                }
                .dark .subscription-page-wrapper .bg-purple-100 {
                    background-color: rgba(168, 85, 247, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-purple-600 {
                    color: #c084fc !important;
                }
                .dark .subscription-page-wrapper .bg-amber-100 {
                    background-color: rgba(245, 158, 11, 0.15) !important;
                }
                .dark .subscription-page-wrapper .text-amber-500 {
                    color: #fbbf24 !important;
                }
            `}</style>
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-4 py-2 shadow-lg flex items-center gap-3 border border-emerald-500/50 rounded-xl">
                        <CheckCircle className="w-4 h-4" />
                        <p className="text-xs font-semibold tracking-wide">Sync Complete</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 mt-2 relative">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2.5 h-2.5 text-slate-300"><path d="M9 5l7 7-7 7" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#8b5cf6]">Subscription Management</span>
                    </div>
                    <h1 className="text-[26px] font-black text-slate-900 tracking-tighter leading-none mt-0.5">
                        Our <span className="text-[#8b5cf6]">Plans.</span>
                    </h1>
                </div>
                <div className="hidden md:block absolute right-0 bottom-[-5px] z-10">
                    <img
                        src="/vectore iamge 2.png"
                        alt="Subscription Plans"
                        className="h-[60px] w-auto object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            </div>

            {/* Current Plan Banner */}
            <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-[40px] h-[40px] rounded-lg bg-[#f3e8ff] flex items-center justify-center shrink-0">
                        <Crown className="w-5.5 h-5.5 text-[#9333ea]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Your Current Plan</span>
                            {effectiveSalon?.isActive ? (
                                <span className="bg-[#ecfdf5] text-[#10b981] text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                            ) : (
                                <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Inactive</span>
                            )}
                        </div>
                        <h2 className="text-[22px] font-black text-slate-900 tracking-tighter uppercase leading-none mt-0.5">
                            {currentPlan ? currentPlan.name : (
                                effectiveSalon?.status === 'pending' ? 'Reviewing' :
                                    (effectiveSalon?.status === 'trial' ? 'Trial' : 'No Plan')
                            )}
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap gap-8 md:border-l border-slate-200 md:pl-8 py-0.5">
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Outlet Limit</p>
                        <p className="text-[18px] leading-none font-black text-slate-900 tracking-tighter mt-1">
                            {currentPlan ? currentPlan.limits?.outletLimit : (effectiveSalon?.status === 'trial' ? effectiveSalon?.limits?.outletLimit : '0')}
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Branche(s)</span>
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                            {effectiveSalon?.status === 'trial' ? 'Trial Ends On' : 'Expires On'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[18px] leading-none font-black text-slate-900 tracking-tighter">
                                {(effectiveSalon?.subscriptionExpiry && (currentPlan || effectiveSalon?.status === 'trial'))
                                    ? (new Date(effectiveSalon.subscriptionExpiry).getFullYear() > new Date().getFullYear() + 50
                                        ? 'Life Time'
                                        : new Date(effectiveSalon.subscriptionExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
                                    : '—'}
                            </p>
                            <CalendarDays className="w-4 h-4 text-[#9333ea]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayPlans.map((plan) => {
                    const isCurrent = currentPlanName?.toLowerCase() === plan.name?.toLowerCase();
                    const style = getPlanStyle(plan.name);
                    const PlanIcon = style.icon;

                    return (
                        <div
                            key={plan.id}
                            className="bg-white rounded-[24px] border border-slate-100/80 shadow-sm p-6 flex flex-col relative text-left"
                        >
                            {isCurrent && (
                                <div className="absolute -top-3 right-6 bg-[#8b5cf6] text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-lg shadow-sm">
                                    Active Now
                                </div>
                            )}

                            {/* Upper Section: Side-by-Side positioning */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0 ${style.iconBg}`}>
                                    <PlanIcon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2} />
                                </div>
                                <div className="flex flex-col items-start justify-center">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                        {(plan.name || '').toUpperCase().replace(' PLAN', '')} PLAN
                                    </h4>
                                    <div>
                                        {plan.price === 0 || (plan.monthlyPrice === 0) ? (
                                            <>
                                                <div className="text-[28px] font-black text-slate-900 tracking-tighter uppercase leading-none">FREE</div>
                                                <div className="text-[9px] font-black text-[#10b981] uppercase tracking-widest mt-1">Validity: {trialDays} Days</div>
                                            </>
                                        ) : (
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-[28px] font-black text-slate-900 tracking-tighter leading-none">₹{(plan.monthlyPrice || 0).toLocaleString()}</span>
                                                <span className="text-[11px] font-black text-[#8b5cf6] uppercase tracking-widest">/mo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full mb-4" />

                            <ul className="space-y-3 flex-1 px-1">
                                {[
                                    { icon: UserCog, label: `${plan.limits?.staffLimit || 0} Staff Members` },
                                    { icon: Store, label: `${plan.limits?.outletLimit || 0} Salon Branch${plan.limits?.outletLimit > 1 ? 'es' : ''}` },
                                    { icon: Square, label: `${plan.limits?.whatsappLimit || 0} AI Automations` },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${style.iconBg}`}>
                                            <item.icon className={`w-3.5 h-3.5 ${style.iconColor}`} strokeWidth={2} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{item.label}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-5">
                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={isCurrent || (effectiveSalon?.isActive && currentPlan && !isCurrent) || upgrading === plan.id}
                                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCurrent
                                            ? 'bg-[#8b5cf6] text-white border border-[#8b5cf6]'
                                            : (effectiveSalon?.isActive && currentPlan && !isCurrent)
                                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                                                : upgrading === plan.id
                                                    ? 'bg-slate-100 text-slate-500 cursor-wait'
                                                    : `${style.btnActiveBg} ${style.btnActiveText} ${style.btnActiveBorder}`
                                        }`}
                                >
                                    {isCurrent
                                        ? 'Current Plan'
                                        : (effectiveSalon?.isActive && currentPlan && !isCurrent)
                                            ? 'Disabled'
                                            : upgrading === plan.id
                                                ? 'Processing...'
                                                : 'Choose Plan'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Features Banner */}
            <div className="mt-4 bg-[#fafbfc] rounded-[16px] p-3 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                {[
                    { icon: ShieldCheck, iconColor: 'text-blue-600', iconBg: 'bg-blue-100', title: 'Secure & Reliable', desc: 'Your data is safe' },
                    { icon: Headphones, iconColor: 'text-teal-600', iconBg: 'bg-teal-100', title: 'Priority Support', desc: 'Help when needed' },
                    { icon: RefreshCw, iconColor: 'text-purple-600', iconBg: 'bg-purple-100', title: 'Easy Upgrades', desc: 'Switch plans anytime' },
                    { icon: Tag, iconColor: 'text-amber-500', iconBg: 'bg-amber-100', title: 'Best Value', desc: 'Pay less, get more' },
                ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${f.iconBg}`}>
                            <f.icon className={`w-3.5 h-3.5 ${f.iconColor}`} strokeWidth={2} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-900">{f.title}</span>
                            <span className="text-[9px] text-slate-500 font-bold mt-0.5">{f.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
