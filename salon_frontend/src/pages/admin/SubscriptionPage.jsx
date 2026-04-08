import { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Crown, 
    Zap, 
    Shield, 
    CreditCard, 
    ArrowRight,
    Package,
    Calendar,
    Users,
    Store,
    Smartphone,
    BarChart2,
    MessageSquare,
    Heart,
    Target,
    Activity,
    Star,
    DollarSign
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
    'free': 0,
    'basic': 1,
    'pro': 2,
    'enterprise': 3
};

export default function SubscriptionPage() {
    const { user, updateSubscription } = useAuth();
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

    const fetchPlans = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const res = await api.get('/subscriptions?active=true');
            if (res.data?.success) {
                setPlans(res.data.data.results || []);
            }
        } catch (e) {
            console.error('Failed to fetch plans:', e);
        } finally {
            setLoadingPlans(false);
        }
    }, []);

    const fetchBillingHistory = useCallback(async () => {
        try {
            const res = await api.get('/billing/my-transactions?limit=20');
            if (res.data?.success) {
                setBillingLogs(res.data.data.results || []);
            }
        } catch (e) {
            console.error('Failed to fetch billing history:', e);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
        fetchBillingHistory();
    }, [fetchPlans, fetchBillingHistory]);

    const ensureRazorpayLoaded = async () => {
        if (window.Razorpay) return true;
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
    
    const activePlanId = salon?.subscriptionPlanId || user?.subscriptionPlanId;
    const currentPlanName = (salon?.status === 'active') ? (salon?.subscriptionPlan || user?.subscriptionPlan || '') : '';
    const displayPlans = (plans && plans.length > 0) ? plans : subscriptionData.INITIAL_PLANS;
    
    const currentPlan = displayPlans.find(p => {
        const pid = p._id || p.id;
        if (activePlanId && pid === activePlanId) return true;
        if (currentPlanName && p.name?.toLowerCase() === currentPlanName.toLowerCase()) return true;
        return false;
    }) || null;

    const handleDownloadInvoice = async () => {
        setDownloadingInvoice(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDownloadingInvoice(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const handleUpgrade = async (plan) => {
        setUpgrading(plan._id || plan.id);
        try {
            const isLoaded = await ensureRazorpayLoaded();
            if (!isLoaded) throw new Error('Razorpay SDK failed to load');

            // 1. Create Order
            const orderRes = await api.post('/billing/razorpay/create-order', {
                planId: plan._id || plan.id,
                billingCycle: billingCycle
            });

            if (!orderRes.data.success) throw new Error(orderRes.data.message || 'Order creation failed');
            
            if (orderRes.data.data?.isFree) {
                setShowSuccess(true);
                await refreshUser();
                await fetchBillingHistory();
                setTimeout(() => setShowSuccess(false), 5000);
                setUpgrading(null);
                return;
            }

            const { orderId, amount, currency, keyId } = orderRes.data.data;

            // 2. Open Razorpay Modal
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'Wapixo Salon CMS',
                description: `Upgrade to ${plan.name} (${billingCycle})`,
                order_id: orderId,
                handler: async (response) => {
                    try {
                        // 3. Verify Payment & Finalize Upgrade
                        const verifyRes = await api.post('/billing/razorpay/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan._id || plan.id,
                            billingCycle: billingCycle
                        });

                        if (verifyRes.data.success) {
                            setShowSuccess(true);
                            await refreshUser();
                            await fetchBillingHistory();
                            setTimeout(() => setShowSuccess(false), 5000);
                        }
                    } catch (err) {
                        const errorMsg = err.response?.data?.message || err.message || 'Payment verification failed';
                        alert(`Error: ${errorMsg}. If amount was deducted, please contact support.`);
                    } finally {
                        setUpgrading(null);
                    }
                },
                modal: { ondismiss: () => setUpgrading(null) },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: '#8B1A2D' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Upgrade flow failed:', error);
            alert(error.message || 'Upgrade failed to initiate');
            setUpgrading(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!cancelReason) {
            alert('Please select a reason for cancellation.');
            return;
        }

        setCancelling(true);
        try {
            const res = await api.post('/subscriptions/cancel', {
                reason: cancelReason,
                comment: cancelComment
            });

            if (res.data.success) {
                setShowCancelModal(false);
                setShowSuccess(true);
                await refreshUser(); // Update user status in context
                setTimeout(() => setShowSuccess(false), 5000);
            }
        } catch (error) {
            console.error('Cancellation failed:', error);
            alert(error.response?.data?.message || 'Failed to process cancellation. Please try again or contact support.');
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
            {/* Success Overlay - Compact */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-4 py-2 shadow-lg flex items-center gap-3 border border-emerald-500/50"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <p className="text-xs font-semibold tracking-wide">Sync Complete</p>
                        <button onClick={() => setShowSuccess(false)} className="ml-2 opacity-70">
                            <XCircle className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header 섹션 - Compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text tracking-tight">Subscription</h1>
                        <p className="text-sm text-text-muted font-medium mt-0.5">Plan & Lifecycle Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-surface p-1 border border-border">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-lg ${billingCycle === 'monthly' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all relative rounded-lg ${billingCycle === 'yearly' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        Yearly
                        <span className="absolute -top-2 -right-1 bg-emerald-500 text-[8px] text-white px-1.5 py-0.5 font-bold rounded-sm">20% OFF</span>
                    </button>
                </div>
            </div>

            {/* Current Plan Overview - Compact */}
            <div className="bg-white border border-border p-6 rounded-2xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Active Protocol</span>
                        <h2 className="text-3xl font-bold text-text tracking-tight">
                            {currentPlan ? currentPlan.name : 'No Active Plan'} <span className="text-sm opacity-50 font-medium">/ Current Tier</span>
                        </h2>
                    </div>

                    <div className="flex gap-8 border-l border-border pl-8">
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Outlet Limit</p>
                            <p className="text-xl font-bold text-text tracking-tight">{currentPlan ? currentPlan.limits?.outletLimit : '0'} <span className="text-[10px] font-semibold text-text-secondary">UNITS</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Staff Access</p>
                            <p className="text-xl font-bold text-text tracking-tight">{currentPlan ? (currentPlan.limits?.staffLimit === 999 ? '∞' : currentPlan.limits?.staffLimit) : '0'} <span className="text-[10px] font-semibold text-text-secondary">PROFILES</span></p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Next Billing</p>
                            <p className="text-xl font-bold text-text tracking-tight">
                                {currentPlan ? `₹${(billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice).toLocaleString()}` : 'N/A'}
                            </p>
                            
                            {!user?.tenantId?.isCancelled && (
                                <button 
                                    onClick={() => setShowCancelModal(true)}
                                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-widest border-b border-rose-200 hover:border-rose-500 transition-all mt-2"
                                >
                                    Cancel Subscription
                                </button>
                            )}
                            {user?.tenantId?.isCancelled && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-widest mt-2">
                                    Cancelled (Active until Expiry)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Survey Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl relative border border-border"
                        >
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="absolute top-6 right-6 text-text-muted hover:text-text transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-text tracking-tight">We're sorry to see you go</h3>
                                    <p className="text-sm text-text-muted">Please let us know why you're cancelling your subscription. Your feedback helps us improve.</p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { id: 'too_expensive', label: '💸 Too Expensive', desc: 'Pricing doesn\'t match my current needs' },
                                        { id: 'missing_features', label: '🧩 Missing Features', desc: 'I need tools that aren\'t available yet' },
                                        { id: 'going_offline', label: '🔌 Going Offline', desc: 'I\'m moving back to manual management' },
                                        { id: 'competitor', label: '⚔️ Competitor', desc: 'I found a better alternative' },
                                        { id: 'other', label: '📝 Other', desc: 'Something else' }
                                    ].map((opt) => (
                                        <label 
                                            key={opt.id}
                                            className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${cancelReason === opt.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-text-muted'}`}
                                        >
                                            <input 
                                                type="radio" 
                                                name="cancelReason" 
                                                value={opt.id}
                                                checked={cancelReason === opt.id}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                className="mt-1 accent-primary"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-text">{opt.label}</p>
                                                <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text uppercase tracking-wider">Additional Comments (Optional)</label>
                                    <textarea 
                                        value={cancelComment}
                                        onChange={(e) => setCancelComment(e.target.value)}
                                        placeholder="Tell us more about your experience..."
                                        className="w-full p-4 bg-surface border border-border rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[100px]"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 py-4 text-sm font-bold text-text-muted hover:text-text transition-all bg-surface hover:bg-border rounded-2xl"
                                    >
                                        Keep Subscription
                                    </button>
                                    <button 
                                        onClick={handleCancelSubscription}
                                        disabled={cancelling}
                                        className="flex-3 py-4 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all rounded-2xl shadow-lg shadow-rose-500/20 disabled:opacity-50"
                                    >
                                        {cancelling ? 'Processing...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-center text-text-muted font-medium italic">
                                    Your plan will remain active until the end of your current billing cycle.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Plans List - More Compact */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold text-text uppercase tracking-widest">Upgrade flux</h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {displayPlans.map((plan) => {
                        const isCurrent = currentPlan && (plan._id === currentPlan._id || plan.id === currentPlan.id);
                        const currentRank = PLAN_RANK[currentPlanName.toLowerCase()] || 0;
                        const targetRank = PLAN_RANK[plan.name?.toLowerCase()] || 0;
                        const isDowngrade = targetRank < currentRank;
                        
                        const c = PLAN_COLORS[plan.color] || PLAN_COLORS.blue;
                        
                        return (
                            <div key={plan.id} className={`bg-white border flex flex-col transition-all duration-300 rounded-2xl overflow-hidden ${isCurrent ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.01]' : isDowngrade ? 'border-border opacity-70 grayscale-[0.5]' : 'border-border hover:border-text hover:shadow-xl hover:-translate-y-1'}`}>
                                <div className={`h-1 bg-gradient-to-r ${c}`} />
                                <div className="p-3 flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>{plan.tag || 'SUBSCRIPTION'}</p>
                                            <h4 className="text-2xl font-bold text-text tracking-tight">{plan.name}</h4>
                                        </div>
                                        {isCurrent && <CheckCircle className="w-6 h-6 text-primary" />}
                                    </div>

                                    <div className="py-4 border-y border-border/40">
                                        <div className="text-4xl font-bold text-text tracking-tighter">
                                            ₹{(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                                            <span className="text-sm font-semibold text-text-muted ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <ul className="space-y-1.5">
                                            {subscriptionData.ALL_FEATURES.slice(0, 12).map(feat => {
                                                const hasAccess = plan.features[feat.key];
                                                return (
                                                    <li key={feat.key} className={`flex items-center gap-2 ${hasAccess ? 'text-text-secondary' : 'text-text-muted/30 line-through'}`}>
                                                        {hasAccess 
                                                            ? <CheckCircle className="w-2.5 h-2.5 text-primary shrink-0" />
                                                            : <XCircle className="w-2.5 h-2.5 shrink-0 opacity-40" />
                                                        }
                                                        <span className="text-[11px] font-bold font-sans tracking-tight truncate">{feat.label}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                                <div className="p-3 pt-0">
                                    {isCurrent ? (
                                        <div className="w-full py-2 bg-surface text-text-muted text-[8px] font-black uppercase tracking-widest text-center border border-border italic font-mono">
                                            Active
                                        </div>
                                    ) : isDowngrade ? (
                                        <div className="w-full py-2 bg-surface text-text-muted text-[8px] font-black uppercase tracking-widest text-center border border-border opacity-50">
                                            Restricted
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={upgrading !== null}
                                            className="w-full py-3 bg-text text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50 font-mono"
                                        >
                                            {upgrading === (plan._id || plan.id) ? 'Processing...' : (plan.monthlyPrice === 0 ? 'Activate' : 'Upgrade Now')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Comparison Table - High Density */}
            <div className="bg-white border border-border p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider">Deep Specifications</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-surface">
                                <th className="p-4 border border-border text-left text-xs font-bold uppercase tracking-wider">Protocol Attributes</th>
                                {displayPlans.map(plan => (
                                    <th key={plan._id || plan.id} className={`p-4 border border-border text-center ${currentPlan && (plan._id === currentPlan._id || plan.id === currentPlan.id) ? 'text-primary' : 'text-text'}`}>
                                        <span className="text-xs font-bold uppercase tracking-wider">{plan.name}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium">
                            <tr>
                                <td className="p-4 border border-border text-text-secondary font-bold uppercase tracking-tight text-xs">Outlets allowed</td>
                                {displayPlans.map(p => (
                                    <td key={p._id || p.id} className="p-4 border border-border text-center text-text font-black text-sm">
                                        {p.limits.outletLimit === 999 ? '∞' : p.limits.outletLimit}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4 border border-border text-text-secondary font-bold uppercase tracking-tight text-xs">Staff Profiles</td>
                                {displayPlans.map(p => (
                                    <td key={p._id || p.id} className="p-4 border border-border text-center text-text font-black text-sm">
                                        {p.limits.staffLimit === 999 ? '∞' : p.limits.staffLimit}
                                    </td>
                                ))}
                            </tr>
                            {subscriptionData.ALL_FEATURES.map(feat => (
                                <tr key={feat.key}>
                                    <td className="p-3 border border-border text-text-secondary uppercase font-bold text-[10px] tracking-tight">{feat.label}</td>
                                    {displayPlans.map(p => (
                                        <td key={p._id || p.id} className="p-2 border border-border text-center">
                                            {p.features?.[feat.key] 
                                                ? <CheckCircle className="w-3 h-3 text-emerald-500 mx-auto" />
                                                : <XCircle className="w-3 h-3 text-rose-300 mx-auto opacity-20" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Log - High Density */}
            <div className="bg-white border border-border p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-text uppercase tracking-wider">Billing Audit Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-surface">
                                <th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">ID</th>
                                <th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                <th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                                <th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold font-sans">
                            {displayBillingHistory.length > 0 ? (
                                displayBillingHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-surface/50">
                                        <td className="p-3 border border-border text-text font-medium truncate">{item.id}</td>
                                        <td className="p-3 border border-border text-text-muted font-medium">{item.date}</td>
                                        <td className="p-3 border border-border text-text font-semibold">{item.amount}</td>
                                        <td className="p-3 border border-border">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                item.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                                                item.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3 border border-border">
                                            <button 
                                                onClick={handleDownloadInvoice}
                                                className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1 transition-colors"
                                            >
                                                Inbound
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center border border-border">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Activity className="w-8 h-8" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Activity Recorded</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
