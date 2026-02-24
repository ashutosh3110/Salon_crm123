import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
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

/* ─── Mock data ─────────────────────────────────────────────────────────── */
const MOCK_MONTHLY_REVENUE = [
    { month: 'Sep', revenue: 41200, prev: 32000 },
    { month: 'Oct', revenue: 53400, prev: 41200 },
    { month: 'Nov', revenue: 48900, prev: 53400 },
    { month: 'Dec', revenue: 67100, prev: 48900 },
    { month: 'Jan', revenue: 72800, prev: 67100 },
    { month: 'Feb', revenue: 81500, prev: 72800 },
];

const MOCK_REGISTRATIONS = [
    { month: 'Sep', salons: 12 },
    { month: 'Oct', salons: 19 },
    { month: 'Nov', salons: 15 },
    { month: 'Dec', salons: 27 },
    { month: 'Jan', salons: 22 },
    { month: 'Feb', salons: 34 },
];

const MOCK_PLAN_DIST = [
    { name: 'Free', value: 38, color: '#94a3b8' },
    { name: 'Basic', value: 27, color: '#3b82f6' },
    { name: 'Pro', value: 22, color: '#B85C5C' },
    { name: 'Enterprise', value: 13, color: '#f59e0b' },
];

const MOCK_CHURN = [
    { month: 'Sep', rate: 4.2 },
    { month: 'Oct', rate: 3.8 },
    { month: 'Nov', rate: 4.9 },
    { month: 'Dec', rate: 3.1 },
    { month: 'Jan', rate: 2.7 },
    { month: 'Feb', rate: 2.2 },
];

const MOCK_RECENT = [
    { _id: '1', name: 'Glam Studio', slug: 'glam-studio', subscriptionPlan: 'pro', status: 'active', createdAt: '2026-02-22T10:00:00Z', city: 'Mumbai', owner: 'Priya Shah' },
    { _id: '2', name: 'The Barber Room', slug: 'barber-room', subscriptionPlan: 'basic', status: 'trial', createdAt: '2026-02-21T08:30:00Z', city: 'Delhi', owner: 'Raj Mehta' },
    { _id: '3', name: 'Luxe Cuts', slug: 'luxe-cuts', subscriptionPlan: 'enterprise', status: 'active', createdAt: '2026-02-20T14:15:00Z', city: 'Bangalore', owner: 'Sara Ali' },
    { _id: '4', name: 'Urban Aesthetics', slug: 'urban-aesth', subscriptionPlan: 'free', status: 'expired', createdAt: '2026-02-18T09:00:00Z', city: 'Pune', owner: 'Vikram R.' },
    { _id: '5', name: 'Serenity Spa', slug: 'serenity-spa', subscriptionPlan: 'pro', status: 'suspended', createdAt: '2026-02-16T11:45:00Z', city: 'Chennai', owner: 'Anita K.' },
];

/* ─── Colour maps ────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/20',
    premium: 'bg-primary/10 text-primary border-primary/20',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};
const statusColors = {
    active: 'bg-emerald-50 text-emerald-600',
    trial: 'bg-blue-50 text-blue-600',
    expired: 'bg-orange-50 text-orange-600',
    suspended: 'bg-red-50 text-red-600',
    inactive: 'bg-slate-100 text-slate-500',
};

/* ─── Custom tooltip ─────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-border rounded-xl shadow-xl p-3 text-xs">
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
        <div className={`bg-white rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-md transition-all group shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentTenants, setRecentTenants] = useState(MOCK_RECENT);
    const [systemOk] = useState(true); // mock system health

    const fetchStats = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await api.get('/tenants/stats');
            setStats(res.data);
        } catch {
            /* backend not available — use mock */
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    /* ── KPI values: prefer real API, fall back to mock ── */
    const kpi = {
        totalSalons: stats?.total ?? 127,
        activeSubs: stats?.byStatus?.active ?? 89,
        trialSalons: stats?.byStatus?.trial ?? 18,
        revenueToday: stats?.revenueToday ?? 12400,
        revenueMonth: stats?.revenueMonth ?? 81500,
        expiredPlans: stats?.expiredPlans ?? 11,
        totalUsers: stats?.totalUsers ?? 534,
    };

    const metricCards = [
        { label: 'Total Salons', value: kpi.totalSalons, icon: Building2, gradient: 'from-primary to-[#8B1A2D]', shadow: 'shadow-primary/20', change: 12 },
        { label: 'Active Subscriptions', value: kpi.activeSubs, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', change: 8 },
        { label: 'Trial Salons', value: kpi.trialSalons, icon: Clock, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', change: 5 },
        { label: 'Revenue Today', value: kpi.revenueToday, icon: DollarSign, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', change: 3, prefix: '₹' },
        { label: 'Revenue This Month', value: kpi.revenueMonth, icon: TrendingUp, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', change: 11, prefix: '₹' },
        { label: 'Expired Plans', value: kpi.expiredPlans, icon: XCircle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20', change: -4 },
        { label: 'Total Users', value: kpi.totalUsers, icon: Users, gradient: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20', change: 9 },
    ];

    return (
        <div className="space-y-6 pb-8">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Platform Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Real-time overview of all salons, revenue & platform health.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* System health badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${systemOk ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                        <Wifi className="w-3.5 h-3.5" />
                        {systemOk ? 'All Systems Normal' : 'System Issue'}
                        <span className={`w-1.5 h-1.5 rounded-full ${systemOk ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    </div>
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border text-text-secondary text-xs font-semibold hover:border-primary/30 hover:text-primary transition-all"
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
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="Monthly Revenue"
                        subtitle="Last 6 months performance vs previous period"
                        action={
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                ↑ 11.9% MoM
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={MOCK_MONTHLY_REVENUE} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B85C5C" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#B85C5C" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip prefix="₹" />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="prev" name="Prev Period" stroke="#94a3b8" strokeWidth={1.5} fill="url(#prevGrad)" dot={false} strokeDasharray="4 2" />
                            <Area type="monotone" dataKey="revenue" name="This Period" stroke="#B85C5C" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#B85C5C', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Plan Distribution — PieChart */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader title="Plan Distribution" subtitle="Current active subscriptions" />
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={MOCK_PLAN_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                                dataKey="value" labelLine={false} label={renderPieLabel}>
                                {MOCK_PLAN_DIST.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v) => [`${v} salons`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {MOCK_PLAN_DIST.map(p => (
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
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="New Salon Registrations"
                        subtitle="Monthly signups over last 6 months"
                        action={
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                34 this month
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={MOCK_REGISTRATIONS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
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
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                    <SectionHeader
                        title="Churn Rate"
                        subtitle="Monthly churn % — lower is better"
                        action={
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                ↓ Improving
                            </span>
                        }
                    />
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={MOCK_CHURN} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div>
                        <h2 className="font-bold text-text">Recent Signups</h2>
                        <p className="text-xs text-text-muted mt-0.5">Latest salons registered on the platform</p>
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
                                                {t.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-text">{t.name}</div>
                                                <div className="text-[11px] text-text-muted font-mono">{t.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary">{t.owner}</span>
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
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-all">
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
