import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    TrendingUp, Star, Target, Zap, Search, BarChart3, Award, CheckCircle2,
    ChevronDown, Download, Loader2, Pencil, Users, ShieldAlert, TrendingDown,
    Activity, ArrowUpRight, ArrowDownRight, Award as Trophy, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import api from '../../../services/api';

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
    return { startDate: toYmd(new Date(y, m, 1)), endDate: toYmd(now) };
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
            const res = await api.get('/hr/performance', { params: { startDate, endDate } });
            const payload = res.data?.data;
            setPeriodMeta(payload?.period || { startDate, endDate });
            setPerf(Array.isArray(payload?.staff) ? payload.staff : []);
        } catch (e) {
            showToast('Failed to load analytics');
        } finally {
            setListLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadPerformance();
    }, [loadPerformance]);

    const sortedStaff = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        let list = perf.filter(p => 
            p.staff.toLowerCase().includes(q) ||
            String(p.role || '').toLowerCase().includes(q)
        );
        return list.sort((a, b) => (Number(b[sortBy]) || 0) - (Number(a[sortBy]) || 0));
    }, [perf, searchTerm, sortBy]);

    const totalRevenue = useMemo(() => perf.reduce((s, p) => s + (p.revenue || 0), 0), [perf]);
    const totalGoal = useMemo(() => perf.reduce((s, p) => s + (p.goal || 0), 0), [perf]);
    const avgRating = useMemo(() => {
        const rated = perf.filter(p => p.rating > 0);
        return rated.length ? (rated.reduce((s, p) => s + p.rating, 0) / rated.length).toFixed(1) : '0.0';
    }, [perf]);

    const openGoalModal = (row) => {
        setGoalModal(row);
        setGoalInput(String(row.goal ?? ''));
    };

    const downloadPerformanceData = () => {
        if (!perf.length) return;
        try {
            const headers = ['Expert', 'Role', 'Revenue Generated', 'Bookings', 'Rating', 'Loyalty Rate', 'Cancellation Rate'];
            const rows = sortedStaff.map(p => [
                p.staff,
                p.role,
                p.revenue,
                p.services,
                p.rating,
                `${p.repeatRate || 0}%`,
                `${p.cancellationRate || 0}%`
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.map(v => typeof v === 'string' ? `"${v}"` : v).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Performance_Report_${period.replace(' ', '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('CSV Exported');
        } catch (err) {
            console.error('Export failed', err);
            showToast('Failed to export CSV');
        }
    };

    const saveGoal = async (e) => {
        e.preventDefault();
        if (!goalModal) return;
        setGoalSaving(true);
        try {
            await api.patch(`/hr/performance/staff/${goalModal.id}/goal`, { goal: Number(goalInput) });
            showToast('Goal updated');
            setGoalModal(null);
            loadPerformance();
        } catch (err) {
            showToast('Failed to save goal');
        } finally {
            setGoalSaving(false);
        }
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap text-left font-black">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => setPeriodOpen(!periodOpen)} 
                            className="flex items-center gap-3 px-5 py-3.5 bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:border-primary transition-all shadow-xl shadow-primary/5">
                            <Calendar className="w-4 h-4 text-primary" /> {period} <ChevronDown className="w-4 h-4 text-text-muted" />
                        </button>
                        <AnimatePresence>
                            {periodOpen && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 w-48 py-2">
                                    {PERIODS.map(p => (
                                        <button key={p} onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                                            className={`w-full px-6 py-3.5 text-xs font-black uppercase text-left tracking-widest hover:bg-surface-alt ${period === p ? 'text-primary' : 'text-text'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {periodMeta && (
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] italic border-l border-border pl-4">
                            {periodMeta.startDate} // {periodMeta.endDate}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-48 lg:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="FILTER STAFF..." 
                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <button 
                        onClick={downloadPerformanceData}
                        className="p-3.5 bg-surface border border-border text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* High-Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-black">
                {[
                    { label: 'Revenue Intake', value: `₹${totalRevenue.toLocaleString()}`, sub: 'Completed Bookings', icon: TrendingUp, color: 'text-primary' },
                    { label: 'Overall Efficiency', value: `${totalGoal > 0 ? Math.min(100, Math.round((totalRevenue/totalGoal)*100)) : 0}%`, sub: 'Target Achievement', icon: Activity, color: 'text-emerald-500' },
                    { label: 'Customer Trust', value: `${avgRating}/5.0`, sub: 'Avg Staff Rating', icon: Star, color: 'text-amber-500' },
                    { label: 'Top Performer', value: sortedStaff[0]?.staff?.split(' ')[0] || '—', sub: sortedStaff[0]?.role || 'N/A', icon: Trophy, color: 'text-violet-500' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface p-8 rounded-xl border border-border shadow-sm flex flex-col justify-between group hover:border-primary transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic">{stat.label}</p>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <h3 className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</h3>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-2 opacity-60 leading-none">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                {/* Ranking & List */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm flex flex-col relative overflow-hidden">
                    <div className="p-8 border-b border-border flex items-center justify-between bg-surface-alt/20">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.2em]">Efficiency Rankings</h3>
                            <p className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-widest italic opacity-70">Staff performance by active booking revenue</p>
                        </div>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                            className="bg-background border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none">
                            <option value="revenue">Sort by Revenue</option>
                            <option value="services">Sort by Bookings</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="repeatRate">Sort by Loyalty</option>
                        </select>
                    </div>

                    <div className="p-8 h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sortedStaff.slice(0, 8)}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis dataKey="staff" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0', fontSize: '10px', fontWeight: '900' }} />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto border-t border-border">
                        <table className="w-full text-left font-black">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border/40">
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Tier</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Expert</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Rev Gen</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Loyalty %</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Downtime %</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-left font-black italic">
                                {sortedStaff.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-surface-alt/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`w-6 h-6 inline-flex items-center justify-center font-black text-[10px] ${i < 3 ? 'bg-primary text-white' : 'bg-background text-text-muted border border-border'}`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-background border border-border flex items-center justify-center text-[10px] uppercase font-black">{p.staff[0]}</div>
                                                <div>
                                                    <p className="text-xs font-black text-text uppercase tracking-tight">{p.staff}</p>
                                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{p.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-text">₹{p.revenue.toLocaleString()}</p>
                                            <p className="text-[9px] text-emerald-500 font-black uppercase">{p.services} SUCCESS</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-text">{p.repeatRate || 0}%</p>
                                                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-text">{p.cancellationRate || 0}%</p>
                                                <ArrowDownRight className="w-3 h-3 text-rose-500" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openGoalModal(p)} className="p-2 text-text-muted hover:text-primary transition-all"><Pencil className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Goals & Side Panel */}
                <div className="space-y-6 text-left font-black">
                    {/* Goal Card */}
                    <div className="bg-background rounded-xl border border-border shadow-sm p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target className="w-24 h-24 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary">
                                    <Target className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Strategic Targets</span>
                            </div>
                            <h3 className="text-3xl font-black text-text tracking-tighter">₹{totalGoal.toLocaleString()}</h3>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mt-2 italic">Corporate Milestone for {period}</p>
                            
                            <div className="mt-10 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span>Pipeline Progress</span>
                                        <span className="text-primary">{totalGoal > 0 ? Math.min(100, Math.round((totalRevenue/totalGoal)*100)) : 0}%</span>
                                    </div>
                                    <div className="h-1.5 bg-border/20 rounded-xl overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${totalGoal > 0 ? Math.min(100, (totalRevenue/totalGoal)*100) : 0}%` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skill Chart */}
                    <div className="bg-surface p-8 rounded-xl border border-border shadow-sm">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-8 italic">Metric Saturation</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sortedStaff.slice(0, 5).map(p => ({ subject: p.staff.split(' ')[0], A: p.revenue/1000, B: p.rating*10, fullMark: 100 }))}>
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                    <Radar name="Revenue" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                                    <Radar name="Rating" dataKey="B" stroke="var(--emerald-500)" fill="var(--emerald-500)" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Revenue (k)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Rating (%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Setting Modal */}
            <AnimatePresence>
                {goalModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGoalModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-xl border border-border shadow-2xl relative p-10 font-black">
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.2em] mb-2">Set Target Goal</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">{goalModal.staff} // {goalModal.role}</p>
                            
                            <form onSubmit={saveGoal} className="mt-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Target Revenue Amount (₹)</label>
                                    <input type="number" min={0} className="w-full px-5 py-4 bg-background border border-border rounded-xl text-sm font-black outline-none focus:border-primary uppercase"
                                        value={goalInput} onChange={e => setGoalInput(e.target.value)} autoFocus />
                                </div>
                                <div className="flex gap-3 pt-4 font-black">
                                    <button type="submit" disabled={goalSaving} className="flex-1 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        {goalSaving ? 'LOCKING...' : 'SAVE GOAL'}
                                    </button>
                                    <button type="button" onClick={() => setGoalModal(null)} className="px-6 py-4 border border-border text-xs font-black text-text uppercase tracking-widest hover:text-text transition-all">CANCEL</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-xl shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em] font-black italic">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
