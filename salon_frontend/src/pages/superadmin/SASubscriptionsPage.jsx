import { useState, useEffect } from 'react';
import mockApi from '../../services/mock/mockApi';
import {
    CreditCard,
    Check,
    Star,
    Zap,
    Crown,
    Building2,
    Edit3,
    X,
    Scissors,
    Package,
    Users,
    TrendingUp,
    Smartphone,
    MessageCircle,
    Calendar,
    Calculator,
    Megaphone,
    DollarSign,
    BarChart,
    MessageSquare,
} from 'lucide-react';

const PLAN_STYLES = {
    free: { icon: Building2, color: 'bg-slate-500', lightColor: 'bg-slate-50', borderColor: 'border-slate-200' },
    basic: { icon: Star, color: 'bg-blue-600', lightColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    premium: { icon: Zap, color: 'bg-primary', lightColor: 'bg-primary/5', borderColor: 'border-primary/20' },
    enterprise: { icon: Crown, color: 'bg-amber-600', lightColor: 'bg-amber-50', borderColor: 'border-amber-200' },
};

const FEATURE_DETAILS = {
    pos: { label: 'POS Terminal', sub: 'High-speed billing & terminals', icon: Calculator },
    appointments: { label: 'Appointments', sub: 'Real-time booking & calendar', icon: Calendar },
    inventory: { label: 'Inventory Pro', sub: 'Stock management & POs', icon: Package },
    marketing: { label: 'Marketing Hub', sub: 'SMS campaigns & promotions', icon: Megaphone },
    payroll: { label: 'Staff & HR', sub: 'Attendance & commissions', icon: DollarSign },
    crm: { label: 'CRM & Clients', sub: 'History & membership tracking', icon: Users },
    mobileApp: { label: 'Customer App', sub: 'Branded mobile booking app', icon: Smartphone },
    reports: { label: 'Analytics AI', sub: 'Business insights & performance', icon: BarChart },
    whatsapp: { label: 'WhatsApp', sub: 'Automated confirmations', icon: MessageCircle },
    loyalty: { label: 'Loyalty Flow', sub: 'Points, rewards & cashback', icon: Star },
    finance: { label: 'Finance Hub', sub: 'Tax reports & reconciliation', icon: TrendingUp },
    feedback: { label: 'Feedback Loop', sub: 'Automated reviews & ratings', icon: MessageSquare },
};

// Plans will be fetched from API

export default function SASubscriptionsPage() {
    const [plans, setPlans] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plansRes, statsRes] = await Promise.all([
                mockApi.get('/subscriptions'),
                mockApi.get('/tenants/stats')
            ]);
            setPlans(plansRes.data?.results || plansRes.data || []);
            setStats(statsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await mockApi.patch(`/subscriptions/${editingPlan._id}`, editingPlan);
            setEditingPlan(null);
            fetchData();
        } catch (err) {
            alert('Failed to update plan: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text tracking-tight">Subscriptions</h1>
                <p className="text-sm text-text-secondary mt-1.5 font-medium max-w-2xl">
                    Configure your platform's pricing strategy and monitor revenue streams across different tenant tiers.
                </p>
            </div>

            {/* Plan Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                    const style = PLAN_STYLES[plan.tag] || PLAN_STYLES.basic;
                    const count = stats?.countsByPlan?.find(v => v._id === plan.tag)?.count || 0;
                    const PlanIcon = style.icon;

                    return (
                        <div
                            key={plan._id}
                            className={`group relative bg-white rounded-3xl border-2 ${plan.popular ? 'border-primary shadow-xl shadow-primary/5 scale-[1.02] z-10' : 'border-border shadow-sm'} p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-[11px] font-bold text-white uppercase tracking-widest shadow-lg shadow-primary/20">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${style.lightColor} flex items-center justify-center border border-black/[0.03] transition-transform duration-300 group-hover:scale-110`}>
                                    <PlanIcon className={`w-7 h-7 ${plan.popular ? 'text-primary' : 'text-text'}`} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Tenants</div>
                                    <div className={`text-xl font-bold ${plan.popular ? 'text-primary' : 'text-text'}`}>{count}</div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <h3 className="text-xl font-bold text-text tracking-tight">{plan.name}</h3>
                                <p className="text-[11px] text-text-muted font-medium leading-relaxed mt-0.5">{plan.tag?.toUpperCase()}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mt-4 mb-6">
                                <span className="text-3xl font-bold text-text">₹{plan.monthlyPrice}</span>
                                <span className="text-sm font-bold text-text-muted">/mo</span>
                            </div>

                            <div className="space-y-3 mb-8 flex-1">
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="h-px bg-border flex-1"></span>
                                    <span>Limits</span>
                                    <span className="h-px bg-border flex-1"></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                                    <Store className="w-4 h-4 text-text-muted" /> {plan.limits?.outletLimit} Outlet{plan.limits?.outletLimit > 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                                    <Users className="w-4 h-4 text-text-muted" /> Up to {plan.limits?.staffLimit} Staff
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                                    <MessageSquare className="w-4 h-4 text-text-muted" /> {plan.limits?.whatsappLimit?.toLocaleString() || 0} WhatsApp Msgs
                                </div>
                                
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-6 mb-4 flex items-center gap-2">
                                    <span className="h-px bg-border flex-1"></span>
                                    <span>Top Features</span>
                                    <span className="h-px bg-border flex-1"></span>
                                </div>
                                {Object.entries(plan.features || {})
                                    .filter(([_, enabled]) => enabled)
                                    .slice(0, 5)
                                    .map(([key, _]) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-surface'} flex items-center justify-center shrink-0`}>
                                                <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-text-secondary'}`} />
                                            </div>
                                            <span className="text-sm font-medium text-text-secondary leading-tight capitalize">{key}</span>
                                        </div>
                                    ))}
                            </div>

                            <button 
                                onClick={() => setEditingPlan({...plan})}
                                className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.popular
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                                : 'bg-surface text-text hover:bg-border active:scale-95'
                                }`}>
                                <Edit3 className="w-4 h-4" /> Edit Plan Config
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Revenue Overview */}
            <div className="bg-white rounded-[2.5rem] border-2 border-border p-8 shadow-sm overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-text tracking-tight">Revenue Analytics</h2>
                        </div>
                        <p className="text-sm text-text-secondary font-medium">Estimated monthly recurring revenue based on current plan distribution.</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {plans.map((plan) => {
                                const count = stats?.countsByPlan?.find(v => v._id === plan.tag)?.count || 0;
                                const revenue = count * plan.monthlyPrice;
                                return (
                                    <div key={plan._id} className="p-5 rounded-3xl bg-surface border border-border/50 transition-colors hover:border-primary/20">
                                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{plan.name}</div>
                                        <div className="text-xl font-bold text-text">₹{revenue.toLocaleString('en-IN')}</div>
                                        <div className="text-[10px] text-text-secondary mt-1 font-bold">{count} Subscribers</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:w-72 lg:w-80 p-8 rounded-[2rem] bg-text text-white shadow-2xl flex flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-primary-light" />
                        </div>
                        <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Total Estimated MRR</div>
                        <div className="text-4xl font-bold tracking-tighter mb-2">
                            ₹{plans.reduce((sum, plan) => {
                                const count = stats?.countsByPlan?.find(v => v._id === plan.tag)?.count || 0;
                                return sum + (count * plan.monthlyPrice);
                            }, 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Stats
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Plan Modal */}
            {editingPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-text tracking-tight">Edit Plan: {editingPlan.name}</h2>
                                <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-widest">Pricing & Module Permissions</p>
                            </div>
                            <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                                <X className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="plan-form" onSubmit={handleUpdatePlan} className="space-y-10">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Monthly Price (₹)</label>
                                        <input 
                                            type="number"
                                            value={editingPlan.monthlyPrice}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-border focus:border-primary outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Trial Period (Days)</label>
                                        <input 
                                            type="number"
                                            value={editingPlan.trialDays}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, trialDays: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-border focus:border-primary outline-none font-bold text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Limits */}
                                <div>
                                    <h4 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <Shield  className="w-4 h-4 text-primary" />
                                        Platform Limits
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 rounded-[2rem] bg-surface border border-border/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-border/40">
                                                    <Store className="w-4 h-4 text-text" />
                                                </div>
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Outlet Limit</label>
                                            </div>
                                            <input 
                                                type="number"
                                                value={editingPlan.limits.outletLimit}
                                                onChange={(e) => setEditingPlan({ 
                                                    ...editingPlan, 
                                                    limits: { ...editingPlan.limits, outletLimit: Number(e.target.value) } 
                                                })}
                                                className="w-full bg-transparent text-2xl font-bold text-text outline-none"
                                            />
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-surface border border-border/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-border/40">
                                                    <Users className="w-4 h-4 text-text" />
                                                </div>
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Staff Limit</label>
                                            </div>
                                            <input 
                                                type="number"
                                                value={editingPlan.limits.staffLimit}
                                                onChange={(e) => setEditingPlan({ 
                                                    ...editingPlan, 
                                                    limits: { ...editingPlan.limits, staffLimit: Number(e.target.value) } 
                                                })}
                                                className="w-full bg-transparent text-2xl font-bold text-text outline-none"
                                            />
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-surface border border-border/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-border/40">
                                                    <MessageSquare className="w-4 h-4 text-text" />
                                                </div>
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">WhatsApp Limit</label>
                                            </div>
                                            <input 
                                                type="number"
                                                value={editingPlan.limits.whatsappLimit || 0}
                                                onChange={(e) => setEditingPlan({ 
                                                    ...editingPlan, 
                                                    limits: { ...editingPlan.limits, whatsappLimit: Number(e.target.value) } 
                                                })}
                                                className="w-full bg-transparent text-2xl font-bold text-text outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div>
                                    <h4 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-primary" />
                                        Module Access Control
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.keys(FEATURE_DETAILS).map((feature) => {
                                            const details = FEATURE_DETAILS[feature];
                                            const Icon = details.icon;
                                            const isEnabled = editingPlan.features[feature];
                                            return (
                                                <div key={feature} className="space-y-3">
                                                    <div
                                                        onClick={() => setEditingPlan({
                                                            ...editingPlan,
                                                            features: { ...editingPlan.features, [feature]: !isEnabled }
                                                        })}
                                                        className={`p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer hover:border-primary/50 ${isEnabled
                                                            ? 'bg-primary/5 border-primary shadow-sm'
                                                            : 'bg-white border-border/60 opacity-70'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isEnabled ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h5 className="text-[13px] font-bold text-text truncate">{details.label}</h5>
                                                            <p className="text-[10px] font-medium text-text-muted truncate mt-0.5">{details.sub}</p>
                                                        </div>
                                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isEnabled ? 'bg-primary' : 'bg-border'}`}>
                                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isEnabled ? 'right-1' : 'left-1'}`} />
                                                        </div>
                                                    </div>

                                                    {feature === 'whatsapp' && isEnabled && (
                                                        <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-2 animate-in slide-in-from-left-2 duration-300">
                                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">WhatsApp Msg Quota</label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="number"
                                                                    value={editingPlan.limits.whatsappLimit || 0}
                                                                    onChange={(e) => setEditingPlan({
                                                                        ...editingPlan,
                                                                        limits: { ...editingPlan.limits, whatsappLimit: Number(e.target.value) }
                                                                    })}
                                                                    className="w-32 bg-surface text-lg font-bold text-text px-4 py-2 rounded-xl border border-primary/20 focus:outline-none focus:border-primary transition-all"
                                                                    placeholder="Limit"
                                                                />
                                                                <span className="text-[10px] font-bold text-text-muted italic">messages total</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-border bg-surface/30 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setEditingPlan(null)}
                                className="flex-1 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-text-muted hover:bg-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="plan-form"
                                type="submit"
                                disabled={isSaving}
                                className="flex-2 bg-text text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-text/20 hover:bg-primary transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
