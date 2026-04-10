import { useState, useEffect, useCallback } from 'react';
import { 
    CheckCircle, XCircle, Crown, Zap, Shield, CreditCard, ArrowRight, Package, Calendar, Users, Store, Smartphone, BarChart2, MessageSquare, Heart, Target, Activity, Star, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/mock/mockApi';
import mockApi from '../../services/mock/mockApi';
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
    'free': 0, 'basic': 1, 'pro': 2, 'enterprise': 3
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

    const fetchPlans = useCallback(async () => {
        setLoadingPlans(true);
        try {
            const res = await mockApi.get('/subscriptions?active=true');
            if (res.data?.success) {
                setPlans(res.data.data.results || []);
            }
        } catch (e) { console.error(e); } finally { setLoadingPlans(false); }
    }, []);

    const fetchBillingHistory = useCallback(async () => {
        try {
            const res = await mockApi.get('/billing/my-transactions?limit=20');
            if (res.data?.success) {
                setBillingLogs(res.data.data.results || []);
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchPlans();
        fetchBillingHistory();
    }, [fetchPlans, fetchBillingHistory]);

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
        await new Promise(r => setTimeout(r, 1000));
        setDownloadingInvoice(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    /**
     * STANDALONE UPGRADE: Razorpay removed.
     */
    const handleUpgrade = async (plan) => {
        setUpgrading(plan._id || plan.id);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setShowSuccess(true);
            if (refreshUser) await refreshUser();
            if (fetchBillingHistory) await fetchBillingHistory();
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Upgrade failed:', error);
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center"><Crown className="w-4 h-4 text-primary" /></div>
                    <div>
                        <h1 className="text-3xl font-bold text-text tracking-tight">Subscription</h1>
                        <p className="text-sm text-text-muted font-medium mt-0.5">Plan & Lifecycle Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-surface p-1 border border-border">
                    <button onClick={() => setBillingCycle('monthly')} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-lg ${billingCycle === 'monthly' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>Monthly</button>
                    <button onClick={() => setBillingCycle('yearly')} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all relative rounded-lg ${billingCycle === 'yearly' ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>Yearly<span className="absolute -top-2 -right-1 bg-emerald-500 text-[8px] text-white px-1.5 py-0.5 font-bold rounded-sm">20% OFF</span></button>
                </div>
            </div>

            <div className="bg-white border border-border p-6 rounded-2xl relative overflow-hidden group shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Active Protocol</span>
                        <h2 className="text-3xl font-bold text-text tracking-tight">{currentPlan ? currentPlan.name : 'No Active Plan'}</h2>
                    </div>
                    <div className="flex gap-8 border-l border-border pl-8">
                        <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Outlet Limit</p><p className="text-xl font-bold text-text tracking-tight">{currentPlan ? currentPlan.limits?.outletLimit : '0'} UNITS</p></div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Next Billing</p>
                            <p className="text-xl font-bold text-text tracking-tight">{currentPlan ? `₹${(billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice).toLocaleString()}` : 'N/A'}</p>
                            {!user?.tenantId?.isCancelled && (
                                <button onClick={() => setShowCancelModal(true)} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-widest border-b border-rose-200">Cancel Subscription</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl relative border border-border">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-text tracking-tight">We're sorry to see you go</h3>
                                <div className="space-y-3">
                                    {['too_expensive', 'missing_features', 'going_offline', 'other'].map(id => (
                                        <label key={id} className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${cancelReason === id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}>
                                            <input type="radio" checked={cancelReason === id} onChange={() => setCancelReason(id)} className="mt-1 accent-primary" />
                                            <span className="text-sm font-bold capitalize">{id.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setShowCancelModal(false)} className="flex-1 py-4 text-sm font-bold bg-surface rounded-2xl">Keep</button>
                                    <button onClick={handleCancelSubscription} disabled={cancelling} className="flex-3 py-4 text-sm font-bold text-white bg-rose-500 rounded-2xl">Confirm</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                {displayPlans.map((plan) => (
                    <div key={plan.id} className="bg-white border rounded-2xl p-4 flex flex-col gap-4">
                        <h4 className="text-xl font-bold">{plan.name}</h4>
                        <div className="text-4xl font-bold">₹{(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}</div>
                        <ul className="space-y-1.5 pt-2">
                            {subscriptionData.ALL_FEATURES.slice(0, 6).map(feat => (
                                <li key={feat.key} className="flex items-center gap-2 text-[11px] font-bold text-text-secondary"><CheckCircle className="w-2.5 h-2.5 text-primary" />{feat.label}</li>
                            ))}
                        </ul>
                        <button onClick={() => handleUpgrade(plan)} className="w-full py-3 bg-text text-white text-[10px] font-black uppercase rounded-lg">Upgrade Now</button>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-border p-3 shadow-sm">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4">Deep Specifications</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr className="bg-surface"><th className="p-4 border border-border text-left text-xs font-bold uppercase tracking-wider">Protocol Attributes</th>{displayPlans.map(p => (<th key={p.id} className="p-4 border border-border text-center text-xs font-bold uppercase tracking-wider">{p.name}</th>))}</tr></thead>
                        <tbody className="text-[11px] font-medium">
                            {subscriptionData.ALL_FEATURES.map(feat => (
                                <tr key={feat.key}><td className="p-3 border border-border text-text-secondary uppercase font-bold text-[10px] tracking-tight">{feat.label}</td>{displayPlans.map(p => (<td key={p.id} className="p-2 border border-border text-center">{p.features?.[feat.key] ? <CheckCircle className="w-3 h-3 text-emerald-500 mx-auto" /> : <XCircle className="w-3 h-3 text-rose-300 mx-auto opacity-20" />}</td>))}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-border p-4 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-4">Billing Audit Log</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead><tr className="bg-surface"><th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">ID</th><th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Date</th><th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Amount</th><th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Status</th><th className="p-3 border border-border text-left text-xs font-bold uppercase tracking-wider">Action</th></tr></thead>
                        <tbody className="text-[11px] font-bold font-sans">
                            {displayBillingHistory.map(item => (
                                <tr key={item.id} className="hover:bg-surface/50"><td className="p-3 border border-border">{item.id}</td><td className="p-3 border border-border">{item.date}</td><td className="p-3 border border-border">{item.amount}</td><td className="p-3 border border-border"><span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">{item.status}</span></td><td className="p-3 border border-border"><button onClick={handleDownloadInvoice} className="text-primary font-bold">Inbound</button></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
