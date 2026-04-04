import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    TrendingUp,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Settings,
    CreditCard,
    Globe,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';

const defaultWeek = () =>
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => ({
        name,
        revenue: 0,
        appointments: 0,
    }));

export default function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);

    const loadDashboard = useCallback(async () => {
        setError(null);
        try {
            const res = await api.get('/dashboard/salon');
            const body = res.data;
            if (body?.success && body.data) {
                setPayload(body.data);
            } else if (body?.data) {
                setPayload(body.data);
            } else {
                setPayload(body);
            }
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
            setPayload(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        const id = setInterval(loadDashboard, 60000);
        return () => clearInterval(id);
    }, [loadDashboard]);

    const revenueData = useMemo(() => {
        const w = payload?.revenueWeek;
        if (Array.isArray(w) && w.length > 0) return w;
        return defaultWeek();
    }, [payload]);

    const serviceDistribution = useMemo(() => {
        const d = payload?.serviceDistribution;
        if (Array.isArray(d) && d.length > 0) return d;
        return [];
    }, [payload]);

    const activeStats = useMemo(() => {
        const s = payload?.stats || {};
        return [
            { label: 'Total Salons', value: s.outlets ?? 0, prefix: '', trend: 'Outlets', positive: true, icon: Globe },
            { label: 'Total Appointments', value: s.bookingsTotal ?? 0, prefix: '', trend: 'Bookings', positive: true, icon: Calendar },
            { label: 'Active Clients', value: s.clients ?? 0, prefix: '', trend: 'CRM', positive: true, icon: Users },
            { label: 'Staff Members', value: s.staff ?? 0, prefix: '', trend: 'Team', positive: true, icon: TrendingUp },
            {
                label: 'Wallet Liability',
                value: Math.round(s.walletLiability ?? 0),
                prefix: '₹',
                trend: 'Loyalty',
                positive: false,
                icon: CreditCard,
            },
        ];
    }, [payload]);

    const liveRecentActivity = useMemo(() => payload?.recentActivity || [], [payload]);

    return (
        <div className="space-y-6 animate-reveal">
            {error && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-sm text-rose-700 text-left flex items-center justify-between gap-4">
                    <span>{error}</span>
                    <button type="button" onClick={() => { setLoading(true); loadDashboard(); }} className="text-xs font-bold uppercase text-primary shrink-0">
                        Retry
                    </button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 text-left">
                <div className="leading-none">
                    <h1 className="text-2xl sm:text-4xl font-bold text-text tracking-tight leading-tight">Welcome Back</h1>
                    <p className="text-sm font-medium text-text-muted mt-2 tracking-wide font-sans">
                        Live salon overview · synced from server
                        {payload?.generatedAt && (
                            <span className="block text-xs mt-1 opacity-70">
                                Updated {new Date(payload.generatedAt).toLocaleString('en-IN')}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full lg:min-w-[300px] pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-border text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => { setLoading(true); loadDashboard(); }}
                        className="px-4 py-3.5 rounded-xl border border-border bg-surface text-xs font-bold uppercase text-text-muted hover:text-primary transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !payload ? (
                <div className="py-20 text-center text-text-muted text-sm font-medium">Loading dashboard…</div>
            ) : null}

            <div className="responsive-grid-5 text-left">
                {activeStats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-surface py-7 px-7 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                        <stat.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="text-[12px] font-semibold text-text-secondary tracking-wide">{stat.label}</p>
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'} bg-white dark:bg-white/5 px-2 py-0.5 rounded-full border border-border/50`}
                                >
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-bold text-text tracking-tight">
                                    <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg
                                        width="60"
                                        height="20"
                                        viewBox="0 0 60 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={stat.positive ? 'text-emerald-400' : 'text-rose-400'}
                                    >
                                        <path
                                            d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-left">
                            <h2 className="text-lg font-bold text-text tracking-tight">Revenue Trends</h2>
                            <p className="text-xs text-text-muted font-medium mt-1">Last 7 days · paid invoices & scheduled appointments</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-primary" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-primary/20" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Bookings</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.1)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="appointments"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-text tracking-tight mb-8 text-left">Top services (90 days)</h2>
                    <div className="flex-1 min-h-[220px]">
                        {serviceDistribution.length === 0 ? (
                            <p className="text-sm text-text-muted text-center py-16">No paid service lines yet</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {serviceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {serviceDistribution.length > 0 && (
                        <div className="space-y-2 mt-6">
                            {serviceDistribution.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }} />
                                        <span className="text-text-muted">{item.name}</span>
                                    </div>
                                    <span className="text-text">{item.value} qty</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden text-left">
                    <div className="px-8 py-6 border-b border-border bg-surface-alt/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text tracking-tight text-left">Recent activity</h3>
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">From invoices & bookings</span>
                    </div>
                    <div className="divide-y divide-border/50 text-left">
                        {liveRecentActivity.length === 0 ? (
                            <div className="px-8 py-12 text-center text-sm text-text-muted">No recent invoices or bookings</div>
                        ) : (
                            liveRecentActivity.map((activity, i) => (
                                <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                    <div className="flex items-center gap-4 text-left font-black">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-surface-alt border flex items-center justify-center font-bold transition-all ${
                                                activity.isLive
                                                    ? 'border-primary/50 text-primary animate-pulse shadow-lg shadow-primary/10'
                                                    : 'border-border text-text-muted group-hover:text-primary'
                                            }`}
                                        >
                                            {activity.client?.[0] || 'C'}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[15px] font-bold text-text group-hover:text-primary transition-colors">
                                                {activity.client}
                                                {activity.isLive && (
                                                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 tracking-wide">
                                                        LIVE
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs font-medium text-text-muted mt-0.5">{activity.service}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-text uppercase">{activity.amount}</p>
                                        <p className="text-[9px] text-text-muted font-bold tracking-[0.2em] uppercase mt-0.5">{activity.time}</p>
                                        <p className="text-[8px] text-text-muted uppercase">{activity.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6 text-left">
                    <h3 className="text-lg font-bold text-text tracking-tight text-left">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/pos/billing')}
                            className="p-6 rounded-2xl bg-primary text-white transition-all border border-primary flex flex-col items-center gap-3 group shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <CreditCard className="w-5 h-5 text-white" />
                            <span className="text-xs font-black uppercase tracking-widest">Create Bill</span>
                        </button>
                        <Link
                            to="/admin/bookings"
                            className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg"
                        >
                            <Calendar className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Booking</span>
                        </Link>
                        <Link
                            to="/admin/staff"
                            className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg"
                        >
                            <Users className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Staff</span>
                        </Link>
                        <Link
                            to="/admin/finance/dashboard"
                            className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg"
                        >
                            <TrendingUp className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Sales</span>
                        </Link>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary text-primary-foreground space-y-3 relative overflow-hidden group shadow-lg shadow-primary/20 text-left">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                            <TrendingUp className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-left">Business Tip</p>
                        <p className="text-sm font-bold tracking-tight leading-snug text-left">
                            Wallet liability reflects loyalty points stored for clients — track redemptions in the loyalty module.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
