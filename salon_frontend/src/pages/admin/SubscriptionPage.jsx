import { useState } from 'react';
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

export default function SubscriptionPage() {
    const { user, updateSubscription } = useAuth();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [upgrading, setUpgrading] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const currentPlanId = user?.subscriptionPlan || 'p1';
    const currentPlan = subscriptionData.INITIAL_PLANS.find(p => p.id === currentPlanId) || subscriptionData.INITIAL_PLANS[0];

    const handleDownloadInvoice = async () => {
        setDownloadingInvoice(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDownloadingInvoice(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const handleUpgrade = async (plan) => {
        setUpgrading(plan.id);
        await new Promise(resolve => setTimeout(resolve, 2000));
        updateSubscription(plan.id);
        setUpgrading(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };

    const billingHistory = [
        { id: 'INV-2026-001', date: '2026-03-12', amount: '₹49,990', status: 'Paid', method: '•••• 4242' },
        { id: 'INV-2025-012', date: '2025-03-12', amount: '₹49,990', status: 'Paid', method: '•••• 4242' },
        { id: 'INV-2024-001', date: '2024-03-12', amount: '₹19,990', status: 'Paid', method: 'Bank Transfer' },
    ];

    return (
        <div className="space-y-4 pb-6 relative font-sans max-w-7xl mx-auto">
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
                        <h1 className="text-2xl font-bold text-text tracking-tight">Subscription</h1>
                        <p className="text-xs text-text-muted font-medium mt-0.5">Plan & Lifecycle Management</p>
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
                            {currentPlan.name} <span className="text-sm opacity-50 font-medium">/ Current Tier</span>
                        </h2>
                    </div>

                    <div className="flex gap-8 border-l border-border pl-8">
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Outlet Limit</p>
                            <p className="text-xl font-bold text-text tracking-tight">{currentPlan.limits.outletLimit} <span className="text-[10px] font-semibold text-text-secondary">UNITS</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Staff Access</p>
                            <p className="text-xl font-bold text-text tracking-tight">{currentPlan.limits.staffLimit === 999 ? '∞' : currentPlan.limits.staffLimit} <span className="text-[10px] font-semibold text-text-secondary">PROFILES</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Next Billing</p>
                            <p className="text-lg font-bold text-text tracking-tight">₹{(billingCycle === 'monthly' ? currentPlan.monthlyPrice : currentPlan.yearlyPrice).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans List - More Compact */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-primary" />
                    <h3 className="text-xs font-bold text-text uppercase tracking-widest">Upgrade flux</h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {subscriptionData.INITIAL_PLANS.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const c = PLAN_COLORS[plan.color] || PLAN_COLORS.blue;
                        
                        return (
                            <div key={plan.id} className={`bg-white border flex flex-col transition-all duration-300 rounded-2xl overflow-hidden ${isCurrent ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.01]' : 'border-border hover:border-text hover:shadow-xl hover:-translate-y-1'}`}>
                                <div className={`h-1 bg-gradient-to-r ${c}`} />
                                <div className="p-3 flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCurrent ? 'text-primary' : 'text-text-muted'}`}>{plan.tag}</p>
                                            <h4 className="text-lg font-bold text-text tracking-tight">{plan.name}</h4>
                                        </div>
                                        {isCurrent && <CheckCircle className="w-5 h-5 text-primary" />}
                                    </div>

                                    <div className="py-3 border-y border-border/40">
                                        <div className="text-2xl font-bold text-text">
                                            ₹{(billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice).toLocaleString()}
                                            <span className="text-xs font-semibold text-text-muted ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <ul className="space-y-1.5">
                                            {subscriptionData.ALL_FEATURES.slice(0, 6).map(feat => {
                                                const hasAccess = plan.features[feat.key];
                                                return (
                                                    <li key={feat.key} className={`flex items-center gap-2 ${hasAccess ? 'text-text-secondary' : 'text-text-muted/30 line-through'}`}>
                                                        {hasAccess 
                                                            ? <CheckCircle className="w-2.5 h-2.5 text-primary shrink-0" />
                                                            : <XCircle className="w-2.5 h-2.5 shrink-0 opacity-40" />
                                                        }
                                                        <span className="text-[9px] font-bold font-sans tracking-tight truncate">{feat.label}</span>
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
                                    ) : (
                                        <button 
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={upgrading !== null}
                                            className="w-full py-2 bg-text text-white text-[8px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50 font-mono"
                                        >
                                            {upgrading === plan.id ? 'Syncing...' : 'Upgrade'}
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
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">Protocol Attributes</th>
                                {subscriptionData.INITIAL_PLANS.map(plan => (
                                    <th key={plan.id} className={`p-3 border border-border text-center ${plan.id === currentPlanId ? 'text-primary' : 'text-text'}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{plan.name}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium">
                            <tr>
                                <td className="p-3 border border-border text-text-secondary font-semibold uppercase tracking-tight">Outlets allowed</td>
                                {subscriptionData.INITIAL_PLANS.map(p => (
                                    <td key={p.id} className="p-3 border border-border text-center text-text font-bold">
                                        {p.limits.outletLimit === 999 ? '∞' : p.limits.outletLimit}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-3 border border-border text-text-secondary font-semibold uppercase tracking-tight">Staff Profiles</td>
                                {subscriptionData.INITIAL_PLANS.map(p => (
                                    <td key={p.id} className="p-3 border border-border text-center text-text font-bold">
                                        {p.limits.staffLimit === 999 ? '∞' : p.limits.staffLimit}
                                    </td>
                                ))}
                            </tr>
                            {subscriptionData.ALL_FEATURES.map(feat => (
                                <tr key={feat.key}>
                                    <td className="p-2 border border-border text-text-secondary uppercase font-sans tracking-tight">{feat.label}</td>
                                    {subscriptionData.INITIAL_PLANS.map(p => (
                                        <td key={p.id} className="p-2 border border-border text-center">
                                            {p.features[feat.key] 
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
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">ID</th>
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">Date</th>
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">Amount</th>
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                                <th className="p-3 border border-border text-left text-[10px] font-bold uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[9px] font-bold font-sans">
                            {billingHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-surface/50">
                                    <td className="p-3 border border-border text-text font-medium truncate">{item.id}</td>
                                    <td className="p-3 border border-border text-text-muted font-medium">{item.date}</td>
                                    <td className="p-3 border border-border text-text font-semibold">{item.amount}</td>
                                    <td className="p-3 border border-border">
                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full">PAID</span>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
