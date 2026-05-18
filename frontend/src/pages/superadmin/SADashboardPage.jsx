import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import mockApi from '../../services/mock/mockApi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import useFirebaseNotifications from '../../hooks/useFirebaseNotifications';
import { registerToken } from '../../services/firebase';
import {
    Building2, Users, TrendingUp, AlertTriangle, ArrowUpRight,
    CreditCard, Activity, DollarSign, Clock, CheckCircle2,
    XCircle, Wifi, ArrowRight, RefreshCw, Zap, Crown, MessageSquare,
    Calendar,
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
function MetricCard({ label, value, icon: Icon, gradient, shadow, change, prefix = '', loading, to, textColor = 'text-text' }) {
    const content = (
        <div className={`bg-surface rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all group shadow-sm relative overflow-hidden${to ? ' cursor-pointer' : ''}`}>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
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
                <div className={`text-2xl font-black tracking-tight ${textColor}`}>{prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
            )}
            <div className="text-xs text-text-muted font-medium mt-1">{label}</div>
        </div>
    );
    if (to) return <Link to={to} className="block no-underline">{content}</Link>;
    return content;
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
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentTenants, setRecentTenants] = useState([]);
    const [systemOk] = useState(true); // mock system health
    const [sendingTest, setSendingTest] = useState(false);

    // Filters state
    const [datePeriod, setDatePeriod] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);

    const fetchStats = async (isRefresh = false, currentFilters = null) => {
        if (isRefresh) setRefreshing(true);
        try {
            const params = {
                startDate: currentFilters ? currentFilters.startDate : startDate,
                endDate: currentFilters ? currentFilters.endDate : endDate
            };
            const res = await api.get('/dashboard/superadmin', { params });
            if (res.data.success) {
                const d = res.data.data;
                setStats(d);
                setRecentTenants(d.recentSalons || []);
                setAnalytics(d); // Contains revenue and counts
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyPreset = (preset) => {
        setDatePeriod(preset);
        const now = new Date();
        let start = '';
        let end = now.toISOString().split('T')[0];

        if (preset === 'today') {
            start = now.toISOString().split('T')[0];
        } else if (preset === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            start = startOfWeek.toISOString().split('T')[0];
        } else if (preset === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            start = startOfMonth.toISOString().split('T')[0];
        } else if (preset === '30days') {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            start = thirtyDaysAgo.toISOString().split('T')[0];
        } else if (preset === '6months') {
            const sixMonthsAgo = new Date(now);
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            start = sixMonthsAgo.toISOString().split('T')[0];
        } else if (preset === 'all') {
            start = '';
            end = '';
        }

        if (preset !== 'custom') {
            setStartDate(start);
            setEndDate(end);
            setShowDateFilter(false);
            fetchStats(true, { startDate: start, endDate: end });
        } else {
            setShowDateFilter(true);
        }
    };

    const handleApplyFilters = () => {
        fetchStats(true);
    };

    const handleResetFilters = () => {
        setDatePeriod('all');
        setStartDate('');
        setEndDate('');
        setShowDateFilter(false);
        fetchStats(true, { startDate: '', endDate: '' });
    };

    const [pendingEnquiries, setPendingEnquiries] = useState(0);
    const fetchEnquiries = async () => {
        try {
            const res = await api.get('/inquiries');
            const list = res.data.data || [];
            setPendingEnquiries(list.filter(i => i.status === 'new').length);
        } catch (error) {
            console.error('Error fetching enquiries:', error);
        }
    };

    const { isAuthenticated } = useAuth();
    useFirebaseNotifications(isAuthenticated);

    useEffect(() => {
        fetchStats();
        fetchEnquiries();
    }, []);

    /* ── KPI values: Live ── */
    const kpi = {
        totalSalons: stats?.counts?.total || 0,
        activeSubs: stats?.counts?.active || 0,
        trialSalons: stats?.counts?.trial || 0,
        pendingSalons: stats?.counts?.pending || 0,
        revenueToday: stats?.revenue?.today || 0,
        revenueMonth: stats?.revenue?.total || 0,
        expiredPlans: stats?.counts?.expired || 0,
        suspendedSalons: stats?.counts?.suspended || 0,
        totalUsers: (stats?.counts?.total || 0) * 5,
    };

    const planDataMapping = [
        { name: 'Free', key: 'none', color: '#94a3b8' },
        { name: 'Basic', key: 'basic', color: '#3b82f6' },
        { name: 'Pro', key: 'pro', color: '#B85C5C' },
        { name: 'Enterprise', key: 'enterprise', color: '#f59e0b' },
    ];

    const currentPlanDist = planDataMapping.map(p => ({
        name: p.name,
        value: stats?.planDistribution?.find(v => v._id?.toLowerCase() === p.key)?.count || 0,
        color: p.color
    }));

    const salonsWithPlan = currentPlanDist.filter(p => p.name !== 'Free').reduce((acc, curr) => acc + curr.value, 0);
    const salonsWithoutPlan = currentPlanDist.find(p => p.name === 'Free')?.value || 0;

    const metricCards = [
        { label: 'Total Registered', value: kpi.totalSalons, icon: Building2, gradient: 'from-primary to-[#8B1A2D]', shadow: 'shadow-primary/20', to: '/superadmin/tenants', textColor: 'text-primary' },
        { label: 'Active Salons', value: kpi.activeSubs, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', to: '/superadmin/tenants?status=active', textColor: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Pending Approval', value: kpi.pendingSalons, icon: Clock, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', to: '/superadmin/tenants?status=pending', textColor: 'text-blue-600 dark:text-blue-400' },
        { label: 'Salons With Plan', value: salonsWithPlan, icon: Crown, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', to: '/superadmin/tenants?plan=subscribed', textColor: 'text-amber-600 dark:text-amber-400' },
        { label: 'Salons Without Plan', value: salonsWithoutPlan, icon: XCircle, gradient: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20', to: '/superadmin/tenants?plan=none', textColor: 'text-slate-600 dark:text-slate-400' },
        { label: "Total Revenue", value: kpi.revenueMonth, icon: TrendingUp, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', prefix: '₹', to: '/superadmin/billing', textColor: 'text-violet-600 dark:text-violet-400' },
        { label: "Today's Earnings", value: kpi.revenueToday, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', prefix: '₹', to: '/superadmin/billing', textColor: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Pending Enquiry', value: pendingEnquiries, icon: MessageSquare, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20', to: '/superadmin/inquiries', textColor: 'text-red-500 dark:text-red-400' },
    ];

    return (
        <div className="space-y-6 pb-8">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
                        Platform Overview
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </h1>
                    <p className="text-sm text-text-secondary mt-0.5">Track everything — from total salons and daily income to system health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-semibold hover:border-primary/30 hover:text-primary transition-all hover:shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Date Filter Presets and Custom Picker ── */}
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mr-1">
                        <Calendar className="w-4 h-4 text-primary" /> Filter Period:
                    </span>
                    {[
                        { key: 'all', label: 'All Time' },
                        { key: 'today', label: 'Today' },
                        { key: 'week', label: 'This Week' },
                        { key: 'month', label: 'This Month' },
                        { key: '30days', label: 'Last 30 Days' },
                        { key: '6months', label: 'Last 6 Months' },
                        { key: 'custom', label: 'Custom Range' },
                    ].map(p => (
                        <button
                            key={p.key}
                            onClick={() => applyPreset(p.key)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                datePeriod === p.key
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-95'
                                    : 'bg-white text-text-secondary border-border hover:border-primary/45 hover:text-primary hover:bg-primary/5'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom Pickers */}
                {(datePeriod === 'custom' || showDateFilter) && (
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-border animate-in fade-in slide-in-from-right-3 duration-250 self-start lg:self-auto">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <span className="text-xs text-text-muted font-bold">to</span>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <button
                            onClick={handleApplyFilters}
                            className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 shadow-md shadow-primary/20 transition-all"
                        >
                            Apply
                        </button>
                        {(startDate || endDate) && (
                            <button
                                onClick={handleResetFilters}
                                className="px-2 py-1 bg-surface border border-border text-text-secondary text-[11px] font-bold rounded-lg hover:border-primary/30 hover:text-primary transition-all"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map(c => (
                    <MetricCard key={c.label} {...c} loading={loading} />
                ))}
            </div>

            {/* ── Charts Row 1: Revenue + Registrations ── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Monthly Revenue — AreaChart (spans 2 cols) */}
                <div
                    onClick={() => navigate('/superadmin/billing')}
                    className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                >
                    <SectionHeader
                        title="Income Trends"
                        subtitle="Earnings performance over the last 6 months"
                        action={
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                                    ↑ 11.9% MoM
                                </span>
                                <Link to="/superadmin/billing" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
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
                <div
                    onClick={() => navigate('/superadmin/tenants')}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                >
                    <SectionHeader
                        title="Most Popular Plans"
                        subtitle="Subscription breakdown"
                        action={
                            <Link to="/superadmin/tenants" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        }
                    />
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
                <div
                    onClick={() => navigate('/superadmin/tenants')}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                >
                    <SectionHeader
                        title="Salons Joined Recently"
                        subtitle="New monthly registrations"
                        action={
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-full">
                                    34 this month
                                </span>
                                <Link to="/superadmin/tenants" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
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
                <div
                    onClick={() => navigate('/superadmin/tenants?status=expired')}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-primary/20"
                >
                    <SectionHeader
                        title="Cancellations Rate"
                        subtitle="Tracing salons who left our platform"
                        action={
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
                                    ↓ Improving
                                </span>
                                <Link to="/superadmin/tenants?status=expired" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
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
                                <tr
                                    key={t._id}
                                    onClick={() => navigate(`/superadmin/tenants/${t._id}`)}
                                    className="hover:bg-surface/40 transition-colors group cursor-pointer"
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                {t.name[0]?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-text">{t.name}</div>
                                                <div className="text-[10px] text-primary font-black uppercase tracking-tighter mt-0.5">
                                                    {t.outlets?.length > 0 ? t.outlets.map(o => o.name).join(' · ') : 'No Outlets'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary">{t.ownerName}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm text-text-secondary uppercase font-bold">{t.address?.city || 'N/A'}</span>
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
                                            {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-primary/20 bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground px-3 py-1.5 rounded-lg transition-all">
                                            View <ArrowRight className="w-3 h-3" />
                                        </div>
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
