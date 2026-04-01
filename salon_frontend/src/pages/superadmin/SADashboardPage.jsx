import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import useFirebaseNotifications from '../../hooks/useFirebaseNotifications';
import {
    Building2, Users, TrendingUp, AlertTriangle, ArrowUpRight,
    CreditCard, Activity, DollarSign, Clock, CheckCircle2,
    XCircle, Wifi, ArrowRight, RefreshCw, Zap,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

import superAdminData from '../../data/superAdminMockData.json';

/* ─── Data from JSON ─────────────────────────────────────────────────── */
const MOCK_MONTHLY_REVENUE = superAdminData.monthlyRevenue;
const MOCK_REGISTRATIONS = superAdminData.registrations;
const MOCK_PLAN_DIST = superAdminData.planDistribution;
const MOCK_CHURN = superAdminData.churn;

/* ─── Colour maps ────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    basic: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    pro: 'bg-primary/10 text-primary border-primary/20',
    premium: 'bg-primary/10 text-primary border-primary/20',
    enterprise: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};
const statusColors = {
    active: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    trial: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    expired: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
    suspended: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
    inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    trial_expired: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
};

/* ─── Custom tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface border border-border rounded-xl shadow-xl p-3 text-xs">
            <p className="font-semibold text-text mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
                </p>
            ))}
        </div>
    );
};

/* ─── Pie label ──────────────────────────────────────────────────────────── */
const RADIAN = Math.PI / 180;
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    return (
        <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
            textAnchor="middle" dominantBaseline="central"
            className="fill-white text-[11px] font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ─── Metric card ────────────────────────────────────────────────────────── */
function MetricCard({ label, value, icon: Icon, gradient, shadow, change, prefix = '', loading }) {
    return (
        <div className={`bg-surface rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-md transition-all group shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                    </span>
                )}
            </div>
            {loading ? (
                <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse mb-1" />
            ) : (
                <div className="text-2xl font-black text-text tracking-tight">{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
            )}
            <div className="text-xs text-text-muted font-medium mt-1">{label}</div>
        </div>
    );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-base font-bold text-text">{title}</h2>
                {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function SADashboardPage() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentTenants, setRecentTenants] = useState([]);
    const [systemOk] = useState(true); // mock system health
    const [sendingTest, setSendingTest] = useState(false);

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [tenantRes, analyticsRes] = await Promise.all([
                api.get('/tenants/stats'),
                api.get('/analytics/stats')
            ]);
            
            const tenantData = tenantRes.data.data;
            const analyticsData = analyticsRes.data;
            
            setStats(tenantData);
            setAnalytics(analyticsData);
            setRecentTenants(tenantData.recentTenants || []);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const { isAuthenticated } = useAuth();
    useFirebaseNotifications(isAuthenticated);

    useEffect(() => { fetchStats(); }, []);

    /* ── KPI values: Live ── */
    const kpi = {
        totalSalons: stats?.totalSalons || 0,
        activeSubs: stats?.activeSalons || 0,
        trialSalons: stats?.countsByStatus?.find(v => v._id === 'trial')?.count || 0,
        revenueToday: analytics?.kpis?.mrr ? Math.round(analytics.kpis.mrr / 30) : 0,
        revenueMonth: analytics?.kpis?.mrr || 0,
        expiredPlans: stats?.countsByStatus?.find(v => v._id === 'expired')?.count || 0,
        totalUsers: analytics?.kpis?.totalSalons ? analytics.kpis.totalSalons * 4 : 0, // Estimating 4 users per salon
    };

    const planDataMapping = [
        { name: 'Free', key: 'free', color: '#94a3b8' },
        { name: 'Basic', key: 'basic', color: '#3b82f6' },
        { name: 'Pro', key: 'pro', color: '#B85C5C' },
        { name: 'Enterprise', key: 'enterprise', color: '#f59e0b' },
    ];

    const currentPlanDist = planDataMapping.map(p => ({
        name: p.name,
        value: stats?.countsByPlan?.find(v => v._id === p.key)?.count || 0,
        color: p.color
    }));

    const metricCards = [
        { label: 'Total Salons', value: kpi.totalSalons, icon: Building2, gradient: 'from-primary to-[#8B1A2D]', shadow: 'shadow-primary/20', change: 12 },
        { label: 'Active Monthly Members', value: kpi.activeSubs, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', change: 8 },
        { label: 'Salons on Free Trial', value: kpi.trialSalons, icon: Clock, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', change: 5 },
        { label: 'Revenue Today', value: kpi.revenueToday, icon: DollarSign, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', change: 3, prefix: '₹' },
        { label: 'Monthly Earnings', value: kpi.revenueMonth, icon: TrendingUp, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', change: 11, prefix: '₹' },
        { label: 'Plans Ended', value: kpi.expiredPlans, icon: XCircle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20', change: -4 },
        { label: 'Total Users', value: kpi.totalUsers, icon: Users, gradient: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20', change: 9 },
    ];

    return (
        <div className="space-y-6 pb-8">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Main Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Real-time overview of all salons, earnings & platform health.</p>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={async () => {
                            if (sendingTest) return;
                            console.info('[Dashboard] Triggering Test Push...');
                            setSendingTest(true);
                            try {
                                const res = await api.get('/notifications/test');
                                console.log('[Dashboard] Test Response:', res.data);
                                toast.success(`🚀 Test sent! Check your notification.`);
                            } catch (e) {
                                console.error('[Dashboard] Test Failed:', e);
                                toast.error('❌ Test failed: ' + (e.response?.data?.message || e.message));
                            } finally {
                                setSendingTest(false);
                            }
                        }}
                        disabled={sendingTest}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                        <Zap className={`w-3.5 h-3.5 ${sendingTest ? 'animate-pulse' : ''}`} /> 
                        {sendingTest ? 'Sending...' : 'Test Push'}
                    </button>
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-semibold hover:border-primary/30 hover:text-primary transition-all"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {metricCards.map(c => (
                    <MetricCard key={c.label} {...c} loading={loading} />
                ))}
            </div>

            {/* ── Charts Row 1: Revenue + Registrations ── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Monthly Revenue — AreaChart (spans 2 cols) */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="Monthly Earnings"
                        subtitle="Last 6 months performance vs previous period"
                        action={
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                                ↑ 11.9% MoM
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={analytics?.mrrTrend || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B85C5C" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#B85C5C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip prefix="₹" />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="mrr" name="This Period" stroke="#B85C5C" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#B85C5C', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Plan Distribution — PieChart */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader title="Popular Plans" subtitle="Current active subscriptions" />
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={currentPlanDist} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                                dataKey="value" labelLine={false} label={renderPieLabel}>
                                {currentPlanDist.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => [`${v} salons`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {currentPlanDist.map(p => (
                            <div key={p.name} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                <span className="text-[11px] text-text-secondary font-medium">{p.name}</span>
                                <span className="text-[11px] text-text-muted ml-auto">{p.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Charts Row 2: Registrations + Churn ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* New Registrations — BarChart */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="New Salons Joined"
                        subtitle="Monthly signups over last 6 months"
                        action={
                            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-full">
                                34 this month
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics?.salonGrowth || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#B85C5C" />
                                    <stop offset="100%" stopColor="#8B1A2D" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip suffix=" salons" />} />
                            <Bar dataKey="salons" name="New Salons" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Churn Rate — LineChart */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="Cancellations"
                        subtitle="Monthly rate — lower is better"
                        action={
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                                ↓ Improving
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics?.churnTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                tickFormatter={v => `${v}%`} domain={[0, 7]} />
                            <Tooltip content={<CustomTooltip suffix="%" />} />
                            <Line type="monotone" dataKey="rate" name="Churn Rate" stroke="#f59e0b" strokeWidth={2.5}
                                dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Recent Signups Table ── */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="font-bold text-text">Newly Registered Salons</h2>
                        <p className="text-xs text-text-muted mt-0.5">Latest salons joined on the platform</p>
                    </div>
                    <Link to="/superadmin/tenants"
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2">
                        View All <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface/60 border-b border-border">
                                {['Salon', 'Owner', 'City', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} className={`text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentTenants.map(t => (
                                <tr key={t._id} className="hover:bg-surface/40 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                                {t.name[0]?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-text">{t.name}</div>
                                                <div className="text-[11px] text-text-muted font-mono">{t.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary">{t.ownerName}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary">{t.city}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${planColors[t.subscriptionPlan] || planColors.free}`}>
                                            {t.subscriptionPlan}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[t.status] || statusColors.inactive}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-muted">
                                            {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <Link to={`/superadmin/tenants/${t._id}`}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg transition-all">
                                            View <ArrowRight className="w-3 h-3" />
                                        </Link>
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
