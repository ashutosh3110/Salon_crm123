import { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, XCircle, Crown, Zap, Shield, CreditCard, ArrowRight, Package, Calendar, Users, Store, Smartphone, BarChart2, MessageSquare, Heart, Target, Activity, Star, DollarSign, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import subscriptionData from '../../data/subscriptionPlans.json';

const ICON_MAP = {
    CreditCard, Calendar, Package, Heart, Target, Users, Smartphone, DollarSign, BarChart2, MessageSquare, Star, Activity
};

const PLAN_COLORS = {
    slate: 'from-slate-500 to-slate-700',
    blue: 'from-blue-500 to-indigo-600',
    primary: 'from-primary to-[#8B1A2D]',
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
                const grouped = {};
                
                rawPlans.forEach(p => {
                    const name = p.name;
                    if (!grouped[name]) {
                        grouped[name] = {
                            ...p,
                            id: p._id,
                            monthlyPrice: p.billingCycle === 'monthly' ? p.price : 0,
                            yearlyPrice: p.billingCycle === 'yearly' ? p.price : 0,
                            monthlyId: p.billingCycle === 'monthly' ? p._id : null,
                            yearlyId: p.billingCycle === 'yearly' ? p._id : null
                        };
                    } else {
                        if (p.billingCycle === 'monthly') {
                            grouped[name].monthlyPrice = p.price;
                            grouped[name].monthlyId = p._id;
                        }
                        if (p.billingCycle === 'yearly') {
                            grouped[name].yearlyPrice = p.price;
                            grouped[name].yearlyId = p._id;
                        }
                    }
                });
                
                setPlans(Object.values(grouped).sort((a,b) => (PLAN_RANK[a.name.toLowerCase()] || 0) - (PLAN_RANK[b.name.toLowerCase()] || 0)));
            }
        } catch (e) { 
            console.error('Error fetching plans:', e);
            setPlans(subscriptionData.INITIAL_PLANS);
        } finally { setLoadingPlans(false); }
    }, []);

    const fetchBillingHistory = useCallback(async () => {
        try {
            // Placeholder for real billing history if available
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchPlans();
        fetchBillingHistory();
    }, [fetchPlans, fetchBillingHistory]);

    const activePlanId = salon?.subscriptionPlanId || user?.subscriptionPlanId;
    const currentPlanName = salon?.subscriptionPlan || '';
    const displayPlans = (plans && plans.length > 0) ? plans : subscriptionData.INITIAL_PLANS;
    
    const currentPlan = displayPlans.find(p => {
        if (currentPlanName && p.name?.toLowerCase() === currentPlanName.toLowerCase()) return true;
        return false;
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
            await mockApi.post('/subscriptions/cancel', { reason: cancelReason });
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

    return (
        <div className="space-y-4 pb-6 relative font-sans">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-4 py-2 shadow-lg flex items-center gap-3 border border-emerald-500/50">
                        <CheckCircle className="w-4 h-4" />
                        <p className="text-xs font-semibold tracking-wide">Sync Complete</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-6 bg-[#B4912B] rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B4912B]">Subscription Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-text tracking-tighter uppercase italic leading-none">
                        Our <span className="text-text-muted opacity-50">Plans.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-1 bg-surface p-1.5 border border-border rounded-2xl shadow-inner">
                    <button 
                        onClick={() => setBillingCycle('monthly')} 
                        className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 rounded-xl ${billingCycle === 'monthly' ? 'bg-[#B4912B] text-white shadow-lg shadow-[#B4912B]/20' : 'text-text-muted hover:text-text hover:bg-white/50'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')} 
                        className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative rounded-xl ${billingCycle === 'yearly' ? 'bg-[#B4912B] text-white shadow-lg shadow-[#B4912B]/20' : 'text-text-muted hover:text-text hover:bg-white/50'}`}
                    >
                        Yearly
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-[8px] text-white px-2 py-0.5 font-black rounded-full shadow-sm animate-bounce">
                            -20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Current Plan Banner */}
            <div className="relative group mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-[#B4912B]/20 via-transparent to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative bg-white border border-border p-10 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#B4912B]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#B4912B]/10 flex items-center justify-center border border-[#B4912B]/20">
                                    <Crown className="w-6 h-6 text-[#B4912B]" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black text-[#B4912B] uppercase tracking-[0.2em] block">Your Current Plan</span>
                                    <h2 className="text-4xl font-black text-text tracking-tighter uppercase italic">{currentPlan ? currentPlan.name : 'No Active Plan'}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-12 md:border-l border-border md:pl-12">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Outlet Limit</p>
                                <p className="text-2xl font-black text-text tracking-tighter">{currentPlan ? currentPlan.limits?.outletLimit : '0'} <span className="text-sm font-bold text-text-muted opacity-40">BRANCHE(S)</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Renewal Amount</p>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-text tracking-tighter">
                                        ₹{currentPlan ? (billingCycle === 'monthly' ? currentPlan.monthlyPrice : (currentPlan.yearlyPrice || 0)).toLocaleString() : '0'}
                                    </p>
                                    {!user?.tenantId?.isCancelled && (
                                        <button onClick={() => setShowCancelModal(true)} className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest border-b border-rose-100 transition-colors">Cancel Subscription</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayPlans.map((plan) => {
                    const isCurrent = currentPlanName?.toLowerCase() === plan.name?.toLowerCase();
                    const rankName = plan.name?.toLowerCase();

                    return (
                        <div 
                            key={plan.id} 
                            className={`group relative bg-white border rounded-[2rem] p-8 flex flex-col gap-8 transition-all duration-500 hover:-translate-y-2 ${isCurrent ? 'ring-2 ring-[#B4912B] shadow-2xl shadow-[#B4912B]/10' : 'hover:shadow-xl border-border'}`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B4912B] text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                                    Active Now
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-2xl font-black uppercase italic tracking-tighter text-text">{plan.name}</h4>
                                    {plan.popular && <Sparkles className="w-5 h-5 text-[#B4912B] animate-pulse" />}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black tracking-tighter">₹{(billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice || 0)).toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>
                            </div>

                            <div className="h-px bg-border group-hover:bg-[#B4912B]/20 transition-colors" />

                            <ul className="space-y-4 flex-1">
                                {[
                                    { icon: Users, label: `${plan.limits?.staffLimit || 0} Staff Members` },
                                    { icon: Store, label: `${plan.limits?.outletLimit || 0} Salon Branches` },
                                    { icon: MessageSquare, label: `${plan.limits?.whatsappLimit || 0} AI Automations` },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-border">
                                            <item.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-[#B4912B] transition-colors" strokeWidth={2} />
                                        </div>
                                        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{item.label}</span>
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handleUpgrade(plan)} 
                                disabled={isCurrent || upgrading === plan.id}
                                className={`w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-lg ${
                                    isCurrent 
                                    ? 'bg-surface text-text-muted cursor-default' 
                                    : upgrading === plan.id 
                                        ? 'bg-[#B4912B]/50 text-white cursor-wait'
                                        : 'bg-text text-white hover:bg-[#B4912B] hover:shadow-[#B4912B]/20 active:scale-95'
                                }`}
                            >
                                {isCurrent ? 'Current Plan' : upgrading === plan.id ? 'Processing...' : 'Upgrade Now'}
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
