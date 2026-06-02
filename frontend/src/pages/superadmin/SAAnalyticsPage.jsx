import { useState, useEffect } from 'react';
import {
    TrendingUp, Users, Building2, DollarSign,
    Download, Calendar, BarChart2, MapPin, PieChart as PieIcon
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { exportToExcel } from '../../utils/exportUtils';
import api from '../../services/api';

/* ─── Helpers ────────────────────────────────────────────────────────── */
const fmtINR = v => `₹${(v || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
            {label && <p className="font-semibold mb-1.5" style={{ color: 'var(--text-color, inherit)' }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} className="font-medium flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200" style={{ color: 'inherit' }}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill || p.payload?.fill }}></span>
                        <span className="capitalize !text-slate-700 dark:!text-slate-200" style={{ color: 'inherit' }}>{p.name || p.payload?.name || 'None'}</span>
                    </span>
                    <span className="font-bold !text-slate-900 dark:!text-white" style={{ color: 'inherit' }}>{typeof p.value === 'number' && p.value > 1000 ? fmtINR(p.value) : p.value}</span>
                </p>
            ))}
        </div>
    );
};

/* ─── Metric card ────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, icon: Icon, gradient, shadow }) {
    let colorTheme = 'emerald';
    if (gradient.includes('blue')) colorTheme = 'blue';
    else if (gradient.includes('amber') || gradient.includes('orange')) colorTheme = 'amber';
    else if (gradient.includes('slate')) colorTheme = 'slate';
    else if (gradient.includes('violet') || gradient.includes('purple')) colorTheme = 'violet';
    else if (gradient.includes('red') || gradient.includes('rose')) colorTheme = 'red';
    else if (gradient.includes('primary')) colorTheme = 'yellow';
    
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

    return (
        <div className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 hover:shadow-md ${cardBgClass} ${cardBorderClass}`}>
            <div className="flex !items-start gap-3 !text-left">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBgClass}`}>
                    <Icon className={`w-4 h-4 ${iconColorClass}`} strokeWidth={2} />
                </div>
                
                <div className="flex flex-col !items-start !text-left">
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left">
                        {label}
                    </span>
                    <h3 style={{ fontSize: '24px', fontWeight: 850 }} className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left">
                        {value}
                    </h3>
                    <span style={{ fontSize: '12px', fontWeight: 500 }} className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left">
                        {sub || 'Stats'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function Section({ title, subtitle, icon: Icon, children }) {
    return (
        <div className="!bg-white dark:!bg-slate-900 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface/30">
                {Icon && <Icon className="w-5 h-5 text-primary" />}
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
                    {subtitle && <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

export default function SAAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [toast, setToast] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePreset, setActivePreset] = useState('all'); // all, today, week, month, 30days, 6months, custom
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get('/dashboard/superadmin/analytics', { params });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [startDate, endDate]);

    const applyPreset = (preset) => {
        setActivePreset(preset);
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
            setShowDatePicker(false);
        } else {
            setShowDatePicker(true);
        }
    };

    const formatXAxis = (tickItem) => {
        if (!tickItem) return '';
        if (tickItem.length === 10) { // YYYY-MM-DD
            try {
                const date = new Date(tickItem);
                return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            } catch (e) {
                return tickItem;
            }
        }
        if (tickItem.length === 7) { // YYYY-MM
            try {
                const [year, month] = tickItem.split('-');
                const date = new Date(year, parseInt(month) - 1, 1);
                return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            } catch (e) {
                return tickItem;
            }
        }
        return tickItem;
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#B4912B]/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-text-secondary animate-pulse">Analyzing business data...</p>
            </div>
        );
    }

    const { kpis, growth, planDistribution, geoDistribution } = data;

    const COLORS = ['#B4912B', '#DFCE9D', '#94a3b8', '#e6e8bff', '#475569'];

    return (
        <div className="space-y-6 pb-8">
            {toast && (
                <div className="fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold bg-emerald-500 animate-in slide-in-from-right-4 duration-300">
                    ✓ {toast}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Business Analytics</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Real-time performance metrics and growth tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => {
                        exportToExcel(growth.mrrTrend, 'Wapixo_Analytics_Revenue', 'Revenue');
                        showToast('Report exported successfully!');
                    }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl !bg-gradient-to-r !from-[#B4912B] !to-[#D4AF37] !text-white !border-none text-sm !font-black uppercase tracking-wider hover:!from-[#8B6F23] hover:!to-[#B4912B] transition-all shadow-lg shadow-[#B4912B]/30 active:scale-95">
                        <Download className="w-4 h-4 !text-white" /> Export Data
                    </button>
                </div>
            </div>

            {/* ── Date Filter Presets and Custom Picker ── */}
            <div className="bg-white rounded-2xl border border-border p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mr-1">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Filter Period:
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
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${activePreset === p.key
                                    ? 'bg-[#B4912B] text-white border-[#B4912B] shadow-md shadow-[#B4912B]/20 scale-95'
                                    : 'bg-white text-text-secondary border-border hover:border-[#B4912B]/45 hover:text-[#B4912B] hover:bg-[#B4912B]/5'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Custom Pickers */}
                {(activePreset === 'custom' || showDatePicker) && (
                    <div className="flex items-center gap-3 bg-surface-alt/10 p-2 rounded-xl border border-border animate-in fade-in slide-in-from-right-3 duration-250 self-start lg:self-auto">
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
                    </div>
                )}
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Salons" value={kpis.totalSalons} sub={`${kpis.activeSalons} Active accounts`} icon={Building2} gradient="from-emerald-500 to-teal-600" shadow="shadow-[#B4912B]/20" />
                <MetricCard label="Monthly Revenue" value={fmtINR(kpis.mrr)} sub="Recurring income this month" icon={DollarSign} gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-500/20" />
                <MetricCard label="Yearly Forecast" value={fmtINR(kpis.arr)} sub="Projected annual revenue" icon={TrendingUp} gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-500/20" />
                <MetricCard label="Lifetime Revenue" value={fmtINR(kpis.totalRevenue)} sub="Total income since launch" icon={BarChart2} gradient="from-amber-500 to-orange-600" shadow="shadow-amber-500/20" />
            </div>

            {/* ── Growth Charts ── */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Section title="Revenue Growth" subtitle="MRR Trend" icon={TrendingUp}>
                    <div className="w-full min-w-0 overflow-hidden">
                        <ResponsiveContainer width="100%" height={260} minWidth={0}>
                            <AreaChart data={growth.mrrTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B4912B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#B4912B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: 'transparent' }} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#B4912B" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Section>

                <Section title="Salon Acquisition" subtitle="New Signups" icon={Users}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={growth.salonTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tickFormatter={formatXAxis} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" name="New Salons" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Plan & Geo ── */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Section title="Plan Distribution" subtitle="Active Subscriptions" icon={PieIcon}>
                        <div className="flex flex-col items-center">
                            <div className="w-full min-w-0 overflow-hidden">
                                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                                    <PieChart>
                                        <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name" stroke="none">
                                            {planDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full mt-4 space-y-2">
                                {planDistribution.map((p, index) => (
                                    <div key={p.name || index} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="font-medium capitalize !text-slate-700 dark:!text-slate-300">{p.name || 'None'}</span>
                                        </div>
                                        <span className="font-bold !text-slate-900 dark:!text-white">{p.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>
                </div>

                <div className="lg:col-span-2">
                    <Section title="Top Locations" subtitle="Salons by City" icon={MapPin}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="!text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">City</th>
                                        <th className="!text-center py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total Salons</th>
                                        <th className="!text-center py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Market Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {geoDistribution.map((g) => {
                                        const pct = ((g.salons / kpis.totalSalons) * 100).toFixed(1);
                                        return (
                                            <tr key={g.city} className="hover:bg-surface/40 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(180, 145, 43, 0.1)' }}>
                                                            <MapPin size={18} color="#B4912B" strokeWidth={2.5} />
                                                        </div>
                                                        <span className="text-sm font-bold !text-slate-800 dark:!text-slate-100">{g.city}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-sm font-bold !text-slate-800 dark:!text-slate-100">{g.salons}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hidden sm:block">
                                                            <div className="h-full bg-primary rounded-xl" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold !text-slate-800 dark:!text-slate-300">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {geoDistribution.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-sm text-text-muted">No location data available yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}
