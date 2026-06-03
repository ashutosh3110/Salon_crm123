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
    pro: 'bg-primary/10 text-primary border-[#B4912B]/20',
    premium: 'bg-primary/10 text-primary border-[#B4912B]/20',
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

function MetricCard({ label, value, icon: Icon, gradient, shadow, change, prefix = '', loading, to, textColor = 'text-text' }) {
    let colorTheme = 'emerald';
    if (textColor.includes('blue')) colorTheme = 'blue';
    else if (textColor.includes('amber')) colorTheme = 'amber';
    else if (textColor.includes('slate')) colorTheme = 'slate';
    else if (textColor.includes('violet') || textColor.includes('purple')) colorTheme = 'violet';
    else if (textColor.includes('red') || textColor.includes('rose')) colorTheme = 'red';
    else if (textColor.includes('primary')) colorTheme = 'yellow';

    const themes = {
        emerald: {
            iconColorClass: '!text-emerald-600 dark:!text-emerald-400',
            iconBgClass: '!bg-emerald-100 dark:!bg-emerald-500/20',
            cardBgClass: '!bg-emerald-50 dark:!bg-emerald-500/5',
            cardBorderClass: '!border-emerald-100 dark:!border-emerald-500/15 hover:!border-emerald-300 dark:hover:!border-emerald-500/50'
        },
        blue: {
            iconColorClass: '!text-blue-600 dark:!text-blue-400',
            iconBgClass: '!bg-blue-100 dark:!bg-blue-500/20',
            cardBgClass: '!bg-blue-50 dark:!bg-blue-500/5',
            cardBorderClass: '!border-blue-100 dark:!border-blue-500/15 hover:!border-blue-300 dark:hover:!border-blue-500/50'
        },
        amber: {
            iconColorClass: '!text-amber-600 dark:!text-amber-400',
            iconBgClass: '!bg-amber-100 dark:!bg-amber-500/20',
            cardBgClass: '!bg-amber-50 dark:!bg-amber-500/5',
            cardBorderClass: '!border-amber-100 dark:!border-amber-500/15 hover:!border-amber-300 dark:hover:!border-amber-500/50'
        },
        slate: {
            iconColorClass: '!text-slate-600 dark:!text-slate-400',
            iconBgClass: '!bg-slate-100 dark:!bg-slate-500/20',
            cardBgClass: '!bg-slate-50 dark:!bg-slate-500/5',
            cardBorderClass: '!border-slate-200 dark:!border-slate-500/15 hover:!border-slate-300 dark:hover:!border-slate-500/50'
        },
        violet: {
            iconColorClass: '!text-violet-600 dark:!text-violet-400',
            iconBgClass: '!bg-violet-100 dark:!bg-violet-500/20',
            cardBgClass: '!bg-violet-50 dark:!bg-violet-500/5',
            cardBorderClass: '!border-violet-100 dark:!border-violet-500/15 hover:!border-violet-300 dark:hover:!border-violet-500/50'
        },
        red: {
            iconColorClass: '!text-red-600 dark:!text-red-400',
            iconBgClass: '!bg-red-100 dark:!bg-red-500/20',
            cardBgClass: '!bg-red-50 dark:!bg-red-500/5',
            cardBorderClass: '!border-red-100 dark:!border-red-500/15 hover:!border-red-300 dark:hover:!border-red-500/50'
        },
        yellow: {
            iconColorClass: '!text-[#B4912B] dark:!text-[#D4AF37]',
            iconBgClass: '!bg-[#FDF9ED] dark:!bg-[#B4912B]/20',
            cardBgClass: '!bg-[#FFFDF7] dark:!bg-[#B4912B]/5',
            cardBorderClass: '!border-[#FDF5DA] dark:!border-[#B4912B]/15 hover:!border-[#E6C975] dark:hover:!border-[#B4912B]/50'
        }
    };

    const { iconColorClass, iconBgClass, cardBgClass, cardBorderClass } = themes[colorTheme] || themes.emerald;

    const content = (
        <div className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${cardBgClass} ${cardBorderClass}`}>
            <div className="flex !items-start justify-between w-full">
                <div className="flex !items-start gap-3 !text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`} style={{ borderRadius: '12px' }}>
                        <Icon className={`w-4 h-4 ${iconColorClass}`} strokeWidth={2} />
                    </div>

                    <div className="flex flex-col !items-start !text-left">
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left">
                            {label}
                        </span>
                        {loading ? (
                            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        ) : (
                            <h3 style={{ fontSize: '24px', fontWeight: 850 }} className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left">
                                {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                            </h3>
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 500 }} className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left">
                            Stats
                        </span>
                    </div>
                </div>
                {change !== undefined && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${change >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                    </span>
                )}
            </div>
            {to && (
                <div style={{ fontSize: '11px', fontWeight: 700 }} className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-90 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start">
                    <span className={iconColorClass}>View details</span>
                    <span style={{ fontSize: '12px' }} className={`inline-block transition-transform duration-200 group-hover:translate-x-1 leading-none ${iconColorClass}`}>
                        →
                    </span>
                </div>
            )}
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
        { name: 'Pro', key: 'pro', color: '#B4912B' },
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
        { label: 'Total Registered', value: kpi.totalSalons, icon: Building2, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-[#B4912B]/20', to: '/superadmin/tenants', textColor: 'text-primary' },
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
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </h1>
                    <p className="text-sm text-text-secondary mt-0.5">Track everything — from total salons and daily income to system health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-text-secondary text-xs font-semibold hover:border-[#B4912B]/30 hover:text-primary transition-all hover:shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Date Filter Presets and Custom Picker ── */}
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mr-1">
                        <Calendar className="w-4 h-4 text-emerald-500" /> Filter Period:
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
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${datePeriod === p.key
                                    ? 'bg-[#B4912B] text-white border-[#B4912B] shadow-md shadow-[#B4912B]/20 scale-95'
                                    : 'bg-white text-text-secondary border-border hover:border-[#B4912B]/45 hover:text-[#B4912B] hover:bg-[#B4912B]/5'
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
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#B4912B] transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#B4912B] transition-all"
                            />
                        </div>
                        <button
                            onClick={handleApplyFilters}
                            className="px-3.5 py-1.5 bg-[#B4912B] text-white text-xs font-bold rounded-lg hover:bg-[#8B6F23] shadow-md shadow-[#B4912B]/20 transition-all"
                        >
                            Apply
                        </button>
                        {(startDate || endDate) && (
                            <button
                                onClick={handleResetFilters}
                                className="px-2 py-1 bg-surface border border-border text-text-secondary text-[11px] font-bold rounded-lg hover:border-[#B4912B]/30 hover:text-primary transition-all"
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
                    className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-[#B4912B]/20"
                >
                    <SectionHeader
                        title="Income Trends"
                        subtitle="Earnings performance over the last 6 months"
                    />
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={analytics?.mrrTrend || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B4912B" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#B4912B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip prefix="₹" />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span className="text-slate-700 dark:text-slate-300 font-bold">{value}</span>} />
                            <Area type="monotone" dataKey="mrr" name="This Period" stroke="#B4912B" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 4, fill: '#B4912B', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Plan Distribution — PieChart */}
                <div
                    onClick={() => navigate('/superadmin/tenants')}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-[#B4912B]/20"
                >
                    <SectionHeader
                        title="Most Popular Plans"
                        subtitle="Subscription breakdown"
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
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-[#B4912B]/20"
                >
                    <SectionHeader
                        title="Salons Joined Recently"
                        subtitle="New monthly registrations"
                    />
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics?.salonGrowth || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#B4912B" />
                                    <stop offset="100%" stopColor="#8B6F23" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip suffix=" salons" />} />
                            <Bar dataKey="salons" name="New Salons" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Churn Rate — LineChart */}
                <div
                    onClick={() => navigate('/superadmin/tenants?status=expired')}
                    className="bg-surface rounded-2xl border border-border shadow-sm p-5 group hover:shadow-md transition-all cursor-pointer hover:border-[#B4912B]/20"
                >
                    <SectionHeader
                        title="Cancellations Rate"
                        subtitle="Tracing salons who left our platform"
                    />
                    {(!analytics?.churnTrend || analytics.churnTrend.length === 0) ? (
                        <div className="w-full h-[200px] flex items-center justify-center text-sm font-semibold text-text-muted">
                            No cancellation rate
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={analytics.churnTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${v}%`} domain={[0, 7]} />
                                <Tooltip content={<CustomTooltip suffix="%" />} />
                                <Line type="monotone" dataKey="rate" name="Churn Rate" stroke="#f59e0b" strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Recent Signups Table ── */}
            <div className="!bg-white dark:!bg-slate-900 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] overflow-hidden">
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
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-[#B4912B]/20 flex items-center justify-center text-xs font-black text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
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
                                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary border border-[#B4912B]/20 bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground px-3 py-1.5 rounded-lg transition-all">
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
