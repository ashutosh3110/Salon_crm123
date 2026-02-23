import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CreditCard,
    Check,
    Star,
    Zap,
    Crown,
    Building2,
} from 'lucide-react';

const plans = [
    {
        id: 'free',
        name: 'Free',
        icon: Building2,
        price: '₹0',
        period: '/mo',
        description: 'For individuals and tiny shops',
        color: 'bg-slate-500',
        lightColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        accentColor: 'bg-slate-400',
        features: ['1 Outlet', 'Up to 50 clients', 'Basic booking', 'Email support'],
    },
    {
        id: 'basic',
        name: 'Basic',
        icon: Star,
        price: '₹999',
        period: '/mo',
        description: 'Perfect for small growing salons',
        color: 'bg-blue-600',
        lightColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        accentColor: 'bg-blue-500',
        features: ['3 Outlets', 'Up to 500 clients', 'Full booking + POS', 'Promotions', 'Priority support'],
    },
    {
        id: 'premium',
        name: 'Premium',
        icon: Zap,
        price: '₹2,499',
        period: '/mo',
        description: 'The preferred choice for professionals',
        color: 'bg-primary',
        lightColor: 'bg-primary/5',
        borderColor: 'border-primary/20',
        accentColor: 'bg-primary',
        popular: true,
        features: ['10 Outlets', 'Unlimited clients', 'Full suite', 'Loyalty program', 'Analytics', 'API access'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Crown,
        price: '₹4,999',
        period: '/mo',
        description: 'Advanced features for large chains',
        color: 'bg-amber-600',
        lightColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        accentColor: 'bg-amber-500',
        features: ['Unlimited outlets', 'Unlimited everything', 'White-label', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
    },
];

export default function SASubscriptionsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/tenants/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
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
                    const count = stats?.byPlan?.[plan.id] || 0;
                    return (
                        <div
                            key={plan.id}
                            className={`group relative bg-white rounded-3xl border-2 ${plan.popular ? 'border-primary shadow-xl shadow-primary/5 scale-[1.02] z-10' : 'border-border shadow-sm'} p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-[11px] font-bold text-white uppercase tracking-widest shadow-lg shadow-primary/20">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl ${plan.lightColor} flex items-center justify-center border border-black/[0.03] transition-transform duration-300 group-hover:scale-110`}>
                                    <plan.icon className={`w-7 h-7 ${plan.popular ? 'text-primary' : 'text-text'}`} />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Tenants</div>
                                    <div className={`text-xl font-bold ${plan.popular ? 'text-primary' : 'text-text'}`}>{count}</div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <h3 className="text-xl font-bold text-text tracking-tight">{plan.name}</h3>
                                <p className="text-[11px] text-text-muted font-medium leading-relaxed mt-0.5">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mt-4 mb-6">
                                <span className="text-3xl font-bold text-text">{plan.price}</span>
                                <span className="text-sm font-bold text-text-muted">{plan.period}</span>
                            </div>

                            <div className="space-y-3.5 mb-8">
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="h-px bg-border flex-1"></span>
                                    <span>Plan Features</span>
                                    <span className="h-px bg-border flex-1"></span>
                                </div>
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full ${plan.popular ? 'bg-primary/10' : 'bg-surface'} flex items-center justify-center shrink-0`}>
                                            <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-text-secondary'}`} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${plan.popular
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95'
                                : 'bg-surface text-text hover:bg-border active:scale-95'
                                }`}>
                                Edit Plan Config
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
                                const count = stats?.byPlan?.[plan.id] || 0;
                                const priceNum = parseInt(plan.price.replace(/[₹,]/g, '')) || 0;
                                const revenue = count * priceNum;
                                return (
                                    <div key={plan.id} className="p-5 rounded-3xl bg-surface border border-border/50 transition-colors hover:border-primary/20">
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
                                const count = stats?.byPlan?.[plan.id] || 0;
                                const priceNum = parseInt(plan.price.replace(/[₹,]/g, '')) || 0;
                                return sum + count * priceNum;
                            }, 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Stats
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
