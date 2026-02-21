import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Building2,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    CreditCard,
    Activity,
} from 'lucide-react';

const planColors = {
    free: 'bg-slate-50 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    premium: 'bg-primary/5 text-primary border-primary/20',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const statusColors = {
    active: 'bg-emerald-50 text-emerald-600',
    inactive: 'bg-slate-50 text-slate-600',
    suspended: 'bg-red-50 text-red-600',
};

export default function SADashboardPage() {
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

    const statCards = stats ? [
        {
            label: 'Total Tenants',
            value: stats.total || 0,
            icon: Building2,
            color: 'from-primary to-primary-dark',
            shadow: 'shadow-primary/10',
        },
        {
            label: 'Active Tenants',
            value: stats.byStatus?.active || 0,
            icon: Activity,
            color: 'from-emerald-500 to-teal-600',
            shadow: 'shadow-emerald-500/10',
        },
        {
            label: 'Suspended',
            value: stats.byStatus?.suspended || 0,
            icon: AlertTriangle,
            color: 'from-red-500 to-rose-600',
            shadow: 'shadow-red-500/10',
        },
        {
            label: 'Premium Plans',
            value: (stats.byPlan?.premium || 0) + (stats.byPlan?.enterprise || 0),
            icon: CreditCard,
            color: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/10',
        },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text">Platform Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1">Overview of all salon tenants and platform health.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-border p-5 hover:border-primary/20 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadow}`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-text-muted" />
                        </div>
                        <div className="text-2xl font-bold text-text">{stat.value}</div>
                        <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Tenants */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-text">Recent Signups</h2>
                        <a href="/superadmin/tenants" className="text-xs text-primary font-medium hover:text-primary-dark transition-colors">
                            View All
                        </a>
                    </div>
                    <div className="p-5">
                        {stats?.recentTenants?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentTenants.map((tenant) => (
                                    <div key={tenant._id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                                                {tenant.name?.[0]?.toUpperCase() || 'T'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-text">{tenant.name}</div>
                                                <div className="text-xs text-text-muted">{tenant.slug}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${planColors[tenant.subscriptionPlan] || planColors.free}`}>
                                                {tenant.subscriptionPlan}
                                            </span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[tenant.status] || statusColors.active}`}>
                                                {tenant.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <Building2 className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-secondary">No tenants yet</p>
                                <p className="text-xs text-text-muted mt-1">Salons will appear here after registration</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="bg-white rounded-xl border border-border shadow-sm">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-text">Plan Distribution</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {['free', 'basic', 'premium', 'enterprise'].map((plan) => {
                            const count = stats?.byPlan?.[plan] || 0;
                            const total = stats?.total || 1;
                            const pct = Math.round((count / total) * 100);
                            return (
                                <div key={plan} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-text-secondary capitalize font-medium">{plan}</span>
                                        <span className="text-xs text-text-muted">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-surface overflow-hidden border border-border">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${plan === 'free' ? 'bg-slate-400' :
                                                plan === 'basic' ? 'bg-blue-500' :
                                                    plan === 'premium' ? 'bg-primary' :
                                                        'bg-amber-500'
                                                }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
