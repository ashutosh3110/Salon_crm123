import { useState, useMemo } from 'react';
import { TrendingUp, Users, Star, Target, Zap, ArrowUpRight, ArrowDownRight, Search, BarChart3, PieChart, Award, X, CheckCircle2, ChevronDown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_PERFORMANCE = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', revenue: 75000, services: 142, rating: 4.9, commission: 7500, cost: 25000, contribution: 'Elite', goal: 80000 },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', revenue: 62000, services: 118, rating: 4.7, commission: 6200, cost: 18000, contribution: 'High', goal: 70000 },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', revenue: 12000, services: 45, rating: 4.8, commission: 0, cost: 15000, contribution: 'Medium', goal: 20000 },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', revenue: 95000, services: 30, rating: 5.0, commission: 9500, cost: 45000, contribution: 'Elite', goal: 100000 },
    { id: 5, staff: 'Priya Singh', role: 'Nail Tech', revenue: 34000, services: 88, rating: 4.6, commission: 3400, cost: 16000, contribution: 'High', goal: 40000 },
];

const CONTRIBUTION_META = {
    Elite: { cls: 'bg-violet-600 text-white' },
    High: { cls: 'bg-emerald-500 text-white' },
    Medium: { cls: 'bg-amber-500 text-white' },
    Low: { cls: 'bg-rose-500 text-white' },
};

const PERIODS = ['This Month', 'Last Month', 'This Quarter', 'This Year'];

export default function PerformanceAnalytics() {
    const [perf, setPerf] = useState(INITIAL_PERFORMANCE);
    const [selected, setSelected] = useState(null); // drill-down
    const [period, setPeriod] = useState(PERIODS[0]);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [goalModal, setGoalModal] = useState(null);
    const [goalInput, setGoalInput] = useState('');
    const [sortBy, setSortBy] = useState('revenue'); // revenue | rating | services
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const sorted = useMemo(() => {
        let list = perf.filter(p => p.staff.toLowerCase().includes(searchTerm.toLowerCase()) || p.role.toLowerCase().includes(searchTerm.toLowerCase()));
        list = [...list].sort((a, b) => b[sortBy] - a[sortBy]);
        return list;
    }, [perf, searchTerm, sortBy]);

    const topPerformer = [...perf].sort((a, b) => b.revenue - a.revenue)[0];
    const avgRating = (perf.reduce((s, p) => s + p.rating, 0) / perf.length).toFixed(2);
    const totalRevenue = perf.reduce((s, p) => s + p.revenue, 0);
    const avgRevenue = Math.round(totalRevenue / perf.length);

    const saveGoal = (e) => {
        e.preventDefault();
        setPerf(prev => prev.map(p => p.id === goalModal.id ? { ...p, goal: Number(goalInput) } : p));
        showToast(`Goal updated for ${goalModal.staff}`);
        setGoalModal(null);
    };

    const exportReport = () => {
        const header = 'Staff,Role,Revenue,Services,Rating,Goal,Achievement%\n';
        const rows = perf.map(p => `${p.staff},${p.role},₹${p.revenue},${p.services},${p.rating},₹${p.goal},${Math.round((p.revenue / p.goal) * 100)}%`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `performance_${period.replace(' ', '_')}.csv`; a.click();
        showToast('Report exported');
    };

    return (
        <div className="space-y-5">
            {/* Header controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative">
                    <button onClick={() => setPeriodOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text hover:border-primary/40 transition-all shadow-sm">
                        <BarChart3 className="w-4 h-4 text-primary" /> {period} <ChevronDown className="w-4 h-4 text-text-muted" />
                    </button>
                    <AnimatePresence>
                        {periodOpen && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full left-0 mt-1 bg-surface border border-border/40 rounded-2xl shadow-xl z-30 w-48 py-1 overflow-hidden">
                                {PERIODS.map(p => (
                                    <button key={p} onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                                        className={`w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-surface-alt transition-colors ${period === p ? 'text-primary bg-primary/5' : 'text-text'}`}>
                                        {p}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:border-primary/40 transition-all shadow-sm">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}k`, change: '+12%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Top Performer', value: topPerformer?.staff.split(' ')[0], change: 'Elite', icon: Award, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Avg Revenue', value: `₹${(avgRevenue / 1000).toFixed(1)}k`, change: '+8%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Avg Rating', value: `${avgRating}/5`, change: '+0.1', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-surface p-4 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">{stat.change}</span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Ranking Table */}
                <div className="xl:col-span-2 bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Performance Rankings</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-tighter">Click any row for details</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input type="text" placeholder="Search..." className="pl-9 pr-3 py-2 rounded-xl bg-background border border-border/40 text-xs font-bold focus:border-primary outline-none w-40"
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            {/* Sort */}
                            <select className="py-2 px-3 rounded-xl bg-background border border-border/40 text-xs font-bold outline-none appearance-none"
                                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="revenue">By Revenue</option>
                                <option value="rating">By Rating</option>
                                <option value="services">By Services</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-background/60 border-b border-border/40">
                                    {['#', 'Employee', 'Revenue', 'Goal', 'Rating', 'Tier', 'Set Goal'].map(h => (
                                        <th key={h} className="px-4 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {sorted.map((p, i) => {
                                    const achv = Math.min(100, Math.round((p.revenue / p.goal) * 100));
                                    return (
                                        <tr key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)}
                                            className={`transition-colors cursor-pointer group ${selected?.id === p.id ? 'bg-primary/5' : 'hover:bg-surface-alt/30'}`}>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-black ${i === 0 ? 'bg-amber-500/20 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-background text-text-muted border border-border/40'}`}>{i + 1}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                                                        {p.staff.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-text group-hover:text-primary transition-colors">{p.staff}</p>
                                                        <p className="text-[9px] text-text-muted">{p.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-xs font-black text-text">₹{p.revenue.toLocaleString()}</p>
                                                <div className="w-20 h-1 bg-border/30 rounded-full overflow-hidden mt-1">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (p.revenue / 100000) * 100)}%` }} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-[10px] font-black text-text-muted">₹{p.goal.toLocaleString()}</p>
                                                <p className={`text-[9px] font-black ${achv >= 100 ? 'text-emerald-500' : achv >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>{achv}%</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black text-text">{p.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${CONTRIBUTION_META[p.contribution]?.cls || ''}`}>{p.contribution}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button onClick={e => { e.stopPropagation(); setGoalModal(p); setGoalInput(String(p.goal)); }}
                                                    className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100">
                                                    <Target className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Drill-down row */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="border-t border-primary/20 bg-primary/5 overflow-hidden">
                                <div className="p-5 grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Services Done', value: selected.services },
                                        { label: 'Commission', value: `₹${selected.commission.toLocaleString()}` },
                                        { label: 'Staff Cost', value: `₹${selected.cost.toLocaleString()}` },
                                        { label: 'ROI', value: `${Math.round(((selected.revenue - selected.cost) / selected.cost) * 100)}%` },
                                    ].map(item => (
                                        <div key={item.label} className="text-center">
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-black text-primary mt-0.5">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Goal Progress */}
                    <div className="bg-background rounded-3xl border border-border/40 shadow-sm p-5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><Target className="w-4 h-4 text-amber-500" /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Quarterly Goals</span>
                        </div>
                        <h3 className="text-2xl font-black text-text">Target: ₹{(perf.reduce((s, p) => s + p.goal, 0) / 1000).toFixed(0)}k</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Current: {Math.round((totalRevenue / perf.reduce((s, p) => s + p.goal, 0)) * 100)}% achieved</p>
                        <div className="mt-4 h-2 bg-border/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.round((totalRevenue / perf.reduce((s, p) => s + p.goal, 0)) * 100))}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                        </div>

                        <div className="mt-5 space-y-2">
                            {perf.slice(0, 3).map(p => {
                                const achv = Math.min(100, Math.round((p.revenue / p.goal) * 100));
                                return (
                                    <div key={p.id} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-text">{p.staff.split(' ')[0]}</span>
                                            <span className={`text-[9px] font-black ${achv >= 100 ? 'text-emerald-500' : achv >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>{achv}%</span>
                                        </div>
                                        <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${achv}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${achv >= 100 ? 'bg-emerald-500' : achv >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Service Breakdown */}
                    <div className="bg-surface p-5 rounded-3xl border border-border/40 shadow-sm">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Service Breakdown</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Hair Services', count: perf.reduce((s, p) => s + p.services, 0), color: 'bg-primary', pct: 70 },
                                { label: 'Skin Care', count: 128, color: 'bg-indigo-500', pct: 30 },
                                { label: 'Makeup', count: 86, color: 'bg-rose-500', pct: 20 },
                            ].map(item => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{item.label}</p>
                                        <p className="text-xs font-black text-text">{item.count}</p>
                                    </div>
                                    <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8 }}
                                            className={`h-full ${item.color} rounded-full`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Set Goal Modal ── */}
            <AnimatePresence>
                {goalModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGoalModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-text uppercase">Set Revenue Goal</h2>
                                    <p className="text-[10px] font-bold text-primary mt-0.5">{goalModal.staff}</p>
                                </div>
                                <button onClick={() => setGoalModal(null)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveGoal} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Revenue Target (₹)</label>
                                    <input required type="number" min="1000"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-black focus:border-primary outline-none text-primary"
                                        value={goalInput} onChange={e => setGoalInput(e.target.value)} />
                                </div>
                                <div className="py-2.5 px-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between text-xs">
                                    <span className="font-black text-text-muted">Current Revenue</span>
                                    <span className="font-black text-primary">₹{goalModal.revenue.toLocaleString()}</span>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                                    Save Goal
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
