import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    TrendingUp,
    Star,
    Target,
    Zap,
    Search,
    BarChart3,
    Award,
    CheckCircle2,
    ChevronDown,
    Download,
    Loader2,
    Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
} from 'recharts';

import api from '../../../services/api';

const CONTRIBUTION_META = {
    Elite: { cls: 'bg-violet-600 text-white' },
    High: { cls: 'bg-emerald-500 text-white' },
    Medium: { cls: 'bg-amber-500 text-white' },
    Low: { cls: 'bg-rose-500 text-white' },
};

const PERIODS = ['This Month', 'Last Month', 'This Quarter', 'This Year'];

function toYmd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getRangeForPeriod(period) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    if (period === 'This Month') {
        const start = new Date(y, m, 1);
        const end = new Date(y, m, d);
        return { startDate: toYmd(start), endDate: toYmd(end) };
    }
    if (period === 'Last Month') {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0);
        return { startDate: toYmd(start), endDate: toYmd(end) };
    }
    if (period === 'This Quarter') {
        const q = Math.floor(m / 3);
        const startMonth = q * 3;
        const start = new Date(y, startMonth, 1);
        const end = new Date(y, m, d);
        return { startDate: toYmd(start), endDate: toYmd(end) };
    }
    if (period === 'This Year') {
        const start = new Date(y, 0, 1);
        const end = new Date(y, m, d);
        return { startDate: toYmd(start), endDate: toYmd(end) };
    }
    const start = new Date(y, m, 1);
    const end = new Date(y, m, d);
    return { startDate: toYmd(start), endDate: toYmd(end) };
}

export default function PerformanceAnalytics() {
    const [perf, setPerf] = useState([]);
    const [periodMeta, setPeriodMeta] = useState(null);
    const [listLoading, setListLoading] = useState(true);
    const [period, setPeriod] = useState(PERIODS[0]);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [goalModal, setGoalModal] = useState(null);
    const [goalInput, setGoalInput] = useState('');
    const [goalSaving, setGoalSaving] = useState(false);
    const [sortBy, setSortBy] = useState('revenue');
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const loadPerformance = useCallback(async () => {
        const { startDate, endDate } = getRangeForPeriod(period);
        setListLoading(true);
        try {
            const res = await api.get('/hr-performance', { params: { startDate, endDate } });
            const payload = res.data?.data;
            setPeriodMeta(payload?.period || { startDate, endDate });
            setPerf(Array.isArray(payload?.staff) ? payload.staff : []);
        } catch (e) {
            showToast(e?.response?.data?.message || e?.networkHint || 'Failed to load performance');
            setPerf([]);
            setPeriodMeta(null);
        } finally {
            setListLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadPerformance();
    }, [loadPerformance]);

    const sorted = useMemo(() => {
        let list = perf.filter(
            (p) =>
                p.staff.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(p.role || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        list = [...list].sort((a, b) => {
            if (sortBy === 'rating') {
                return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            }
            if (sortBy === 'services') {
                return (Number(b.services) || 0) - (Number(a.services) || 0);
            }
            return (Number(b.revenue) || 0) - (Number(a.revenue) || 0);
        });
        return list;
    }, [perf, searchTerm, sortBy]);

    const chartSource = sorted.length ? sorted : perf;

    const chartData = useMemo(
        () =>
            chartSource.slice(0, 5).map((p) => ({
                subject: (p.staff || 'S').split(' ')[0],
                revenue: Math.round((Number(p.revenue) || 0) / 1000),
                services: Number(p.services) || 0,
                rating: (Number(p.rating) || 0) * 10,
                fullMark: 100,
            })),
        [chartSource]
    );

    const topPerformer = [...perf].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0))[0];
    const rated = perf.filter((p) => p.rating != null && !Number.isNaN(Number(p.rating)));
    const avgRating =
        rated.length > 0
            ? (rated.reduce((s, p) => s + Number(p.rating), 0) / rated.length).toFixed(2)
            : '—';
    const totalRevenue = perf.reduce((s, p) => s + (Number(p.revenue) || 0), 0);
    const totalGoal = perf.reduce((s, p) => s + (Number(p.goal) || 0), 0);
    const avgRevPerStaff = perf.length ? totalRevenue / perf.length : 0;

    const openGoalModal = (row) => {
        setGoalModal(row);
        setGoalInput(String(row.goal ?? ''));
    };

    const saveGoal = async (e) => {
        e.preventDefault();
        if (!goalModal) return;
        const val = Number(goalInput);
        if (Number.isNaN(val) || val < 0) {
            showToast('Enter a valid goal amount');
            return;
        }
        setGoalSaving(true);
        try {
            await api.patch(`/hr-performance/staff/${goalModal.id}/goal`, { goal: val });
            setPerf((prev) => prev.map((p) => (p.id === goalModal.id ? { ...p, goal: val } : p)));
            showToast(`Goal updated for ${goalModal.staff}`);
            setGoalModal(null);
        } catch (err) {
            showToast(err?.response?.data?.message || 'Could not save goal');
        } finally {
            setGoalSaving(false);
        }
    };

    const exportReport = () => {
        const header = 'Staff,Role,Revenue,Services,Rating,Goal,Achievement%\n';
        const rows = perf
            .map((p) => {
                const g = Number(p.goal) || 1;
                const ach = Math.min(100, Math.round(((Number(p.revenue) || 0) / g) * 100));
                const r = p.rating != null ? p.rating : '';
                return `${p.staff},${p.role},₹${Number(p.revenue) || 0},${Number(p.services) || 0},${r},₹${Number(p.goal) || 0},${ach}%`;
            })
            .join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_${period.replace(/\s+/g, '_')}.csv`;
        a.click();
        showToast('Report exported');
    };

    const barChartRows = (sorted.length ? sorted : perf).slice(0, 8).map((p) => ({
        ...p,
        staff: (p.staff || '').length > 14 ? `${(p.staff || '').slice(0, 12)}…` : p.staff,
    }));

    return (
        <div className="space-y-5 font-black text-left">
            <div className="flex items-center justify-between gap-3 flex-wrap text-left font-black">
                <div className="relative w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setPeriodOpen((v) => !v)}
                        className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-black text-text hover:border-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-primary" /> {period}
                        </div>
                        <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
                    </button>
                    <AnimatePresence>
                        {periodOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full left-0 mt-1 bg-surface border border-border/40 rounded-2xl shadow-xl z-30 w-full sm:w-48 py-1 overflow-hidden font-black"
                            >
                                {PERIODS.map((p) => (
                                    <button
                                        type="button"
                                        key={p}
                                        onClick={() => {
                                            setPeriod(p);
                                            setPeriodOpen(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-xs font-black text-left hover:bg-surface-alt transition-colors ${
                                            period === p ? 'text-primary bg-primary/5' : 'text-text'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {periodMeta && (
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest w-full sm:w-auto">
                        {periodMeta.startDate} → {periodMeta.endDate}
                    </p>
                )}
                <button
                    type="button"
                    onClick={exportReport}
                    disabled={!perf.length}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-black text-text-secondary hover:border-primary/40 transition-all shadow-sm disabled:opacity-40"
                >
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left font-black">
                {[
                    {
                        label: 'Total Revenue',
                        value: listLoading ? '…' : `₹${(totalRevenue / 1000).toFixed(0)}k`,
                        change: 'Bookings',
                        icon: TrendingUp,
                        color: 'text-emerald-500',
                        bg: 'bg-emerald-500/10',
                    },
                    {
                        label: 'Top Performer',
                        value: listLoading ? '…' : topPerformer?.staff?.split(' ')?.[0] || '—',
                        change: topPerformer?.contribution || '—',
                        icon: Award,
                        color: 'text-violet-500',
                        bg: 'bg-violet-500/10',
                    },
                    {
                        label: 'Avg Revenue',
                        value: listLoading ? '…' : `₹${(Math.round(avgRevPerStaff) / 1000).toFixed(1)}k`,
                        change: '/ staff',
                        icon: Zap,
                        color: 'text-amber-500',
                        bg: 'bg-amber-500/10',
                    },
                    {
                        label: 'Avg Rating',
                        value: listLoading ? '…' : avgRating === '—' ? '—' : `${avgRating}/5`,
                        change: 'Feedback',
                        icon: Star,
                        color: 'text-blue-500',
                        bg: 'bg-blue-500/10',
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-surface p-4 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all group text-left font-black"
                    >
                        <div className="flex justify-between items-start mb-3 text-left">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-wider text-left">{stat.label}</p>
                        <p className={`text-xl font-black mt-0.5 ${stat.color} text-left`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left font-black">
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden flex flex-col text-left font-black relative">
                    {listLoading && (
                        <div className="absolute inset-0 z-10 bg-surface/70 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    )}
                    <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center gap-3 justify-between text-left font-black">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest text-left">Performance Rankings</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-tighter text-left">
                                Revenue from completed bookings (by staff)
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-9 pr-3 py-2 rounded-xl bg-background border border-border/40 text-xs font-black focus:border-primary outline-none w-full sm:w-40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-background border border-border/40 text-xs font-black outline-none appearance-none cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="revenue">By Revenue</option>
                                <option value="rating">By Rating</option>
                                <option value="services">By Services</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6 h-[300px]">
                        {!listLoading && !perf.length ? (
                            <p className="text-xs text-text-muted font-bold uppercase tracking-widest text-center py-20">
                                No staff or no completed bookings in this range
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartRows}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                    <XAxis
                                        dataKey="staff"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                        }}
                                    />
                                    <Bar dataKey="revenue" fill="var(--primary)" barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-background/60 border-b border-border/40">
                                    {['#', 'Employee', 'Revenue', 'Goal', 'Rating', 'Tier', ''].map((h) => (
                                        <th key={h || 'edit'} className="px-4 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-left font-black">
                                {!listLoading && !sorted.length && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-xs text-text-muted">
                                            No rows match your search.
                                        </td>
                                    </tr>
                                )}
                                {sorted.map((p, i) => {
                                    const g = Number(p.goal) || 1;
                                    const achv = Math.min(100, Math.round(((Number(p.revenue) || 0) / g) * 100));
                                    return (
                                        <tr key={p.id} className="hover:bg-surface-alt/30 transition-colors group cursor-default">
                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`w-6 h-6 inline-flex items-center justify-center rounded-none text-[10px] font-black ${
                                                        i === 0
                                                            ? 'bg-amber-500/10 text-amber-500'
                                                            : 'bg-background text-text-muted border border-border/40'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-none bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20 shrink-0">
                                                        {(p.staff || 'S')
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-text group-hover:text-primary transition-colors">{p.staff}</p>
                                                        <p className="text-[9px] text-text-muted uppercase font-black">{p.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-xs font-black text-text">₹{(Number(p.revenue) || 0).toLocaleString()}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-[10px] font-black text-text-muted">₹{(Number(p.goal) || 0).toLocaleString()}</p>
                                                <p
                                                    className={`text-[9px] font-black uppercase ${achv >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}
                                                >
                                                    {achv}% ACHIEVED
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black text-text">{p.rating != null ? p.rating : '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest ${
                                                        CONTRIBUTION_META[p.contribution]?.cls || ''
                                                    }`}
                                                >
                                                    {p.contribution}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => openGoalModal(p)}
                                                    className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                                    title="Set revenue goal"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-4 text-left font-black">
                    <div className="bg-surface p-6 rounded-3xl border border-border/40 shadow-sm flex flex-col">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Staff Skill Matrix</h3>
                        <div className="h-64 w-full">
                            {!listLoading && chartData.length === 0 ? (
                                <p className="text-[10px] text-text-muted text-center pt-20 uppercase">No chart data</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="var(--border)" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                        />
                                        <Radar name="Staff" dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0px',
                                                fontSize: '10px',
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-background rounded-3xl border border-border/40 shadow-sm p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Target className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Corporate Goals</span>
                        </div>
                        <h3 className="text-xl font-black text-text">
                            Target: ₹{totalGoal > 0 ? (totalGoal / 1000).toFixed(0) : 0}k
                        </h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
                            Completion: {totalGoal > 0 ? Math.min(100, Math.round((totalRevenue / totalGoal) * 100)) : 0}%
                        </p>
                        <div className="mt-6 h-2 bg-border/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${totalGoal > 0 ? Math.min(100, Math.round((totalRevenue / totalGoal) * 100)) : 0}%`,
                                }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-amber-500 rounded-full"
                            />
                        </div>
                        <div className="mt-8 space-y-4">
                            {(sorted.length ? sorted : perf).slice(0, 3).map((p) => {
                                const g = Number(p.goal) || 1;
                                const achv = Math.min(100, Math.round(((Number(p.revenue) || 0) / g) * 100));
                                return (
                                    <div key={p.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-text">{(p.staff || '').split(' ')[0]}</span>
                                            <span className={achv >= 100 ? 'text-emerald-500' : 'text-amber-500'}>{achv}%</span>
                                        </div>
                                        <div className="h-1.5 bg-border/20 rounded-none overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${achv}%` }}
                                                transition={{ duration: 0.8 }}
                                                className={`h-full ${achv >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {goalModal && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !goalSaving && setGoalModal(null)}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-2xl border border-border/40 shadow-2xl relative p-8"
                        >
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Revenue goal</h3>
                            <p className="text-[10px] text-primary mt-2 font-black uppercase">{goalModal.staff}</p>
                            <form onSubmit={saveGoal} className="mt-6 space-y-4">
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest">Target (₹)</label>
                                <input
                                    type="number"
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-black focus:border-primary outline-none"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={goalSaving}
                                        className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {goalSaving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={goalSaving}
                                        onClick={() => setGoalModal(null)}
                                        className="py-3 px-4 border border-border rounded-xl text-[10px] font-black uppercase text-text-muted"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl font-black"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-xs uppercase tracking-widest text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
