import { useState, useMemo } from 'react';
import { TrendingUp, Users, Star, Target, Zap, ArrowUpRight, ArrowDownRight, Search, BarChart3, PieChart as LucidePieChart, Award, X, CheckCircle2, ChevronDown, Download } from 'lucide-react';
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
    PolarRadiusAxis,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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
    const [selected, setSelected] = useState(null);
    const [period, setPeriod] = useState(PERIODS[0]);
    const [periodOpen, setPeriodOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [goalModal, setGoalModal] = useState(null);
    const [goalInput, setGoalInput] = useState('');
    const [sortBy, setSortBy] = useState('revenue');
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const sorted = useMemo(() => {
        let list = perf.filter(p => p.staff.toLowerCase().includes(searchTerm.toLowerCase()) || p.role.toLowerCase().includes(searchTerm.toLowerCase()));
        list = [...list].sort((a, b) => b[sortBy] - a[sortBy]);
        return list;
    }, [perf, searchTerm, sortBy]);

    const chartData = useMemo(() => perf.slice(0, 5).map(p => ({
        subject: p.staff.split(' ')[0],
        revenue: Math.round(p.revenue / 1000),
        services: p.services,
        rating: p.rating * 10,
        fullMark: 100
    })), [perf]);

    const topPerformer = [...perf].sort((a, b) => b.revenue - a.revenue)[0];
    const avgRating = (perf.reduce((s, p) => s + p.rating, 0) / perf.length).toFixed(2);
    const totalRevenue = perf.reduce((s, p) => s + p.revenue, 0);
    const totalGoal = perf.reduce((s, p) => s + p.goal, 0);

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
        <div className="space-y-5 font-black text-left">
            {/* Header controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap text-left font-black">
                <div className="relative">
                    <button onClick={() => setPeriodOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-black text-text hover:border-primary/40 transition-all shadow-sm">
                        <BarChart3 className="w-4 h-4 text-primary" /> {period} <ChevronDown className="w-4 h-4 text-text-muted" />
                    </button>
                    <AnimatePresence>
                        {periodOpen && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                className="absolute top-full left-0 mt-1 bg-surface border border-border/40 rounded-2xl shadow-xl z-30 w-48 py-1 overflow-hidden font-black">
                                {PERIODS.map(p => (
                                    <button key={p} onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                                        className={`w-full px-4 py-2.5 text-xs font-black text-left hover:bg-surface-alt transition-colors ${period === p ? 'text-primary bg-primary/5' : 'text-text'}`}>
                                        {p}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-black text-text-secondary hover:border-primary/40 transition-all shadow-sm">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left font-black">
                {[
                    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}k`, change: '+12%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Top Performer', value: topPerformer?.staff.split(' ')[0], change: 'Elite', icon: Award, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Avg Revenue', value: `₹${(Math.round(totalRevenue / perf.length) / 1000).toFixed(1)}k`, change: '+8%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Avg Rating', value: `${avgRating}/5`, change: '+0.1', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-surface p-4 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all group text-left font-black">
                        <div className="flex justify-between items-start mb-3 text-left">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-widest">{stat.change}</span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-wider text-left">{stat.label}</p>
                        <p className={`text-xl font-black mt-0.5 ${stat.color} text-left`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left font-black">
                {/* Ranking Table */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden flex flex-col text-left font-black">
                    <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center gap-3 justify-between text-left font-black">
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest text-left">Performance Rankings</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-tighter text-left">Staff efficiency matrix</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input type="text" placeholder="Search..." className="pl-9 pr-3 py-2 rounded-xl bg-background border border-border/40 text-xs font-black focus:border-primary outline-none w-40"
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <select className="py-2 px-3 rounded-xl bg-background border border-border/40 text-xs font-black outline-none appearance-none cursor-pointer"
                                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="revenue">By Revenue</option>
                                <option value="rating">By Rating</option>
                                <option value="services">By Services</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={perf.slice(0, 8)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis dataKey="staff" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="revenue" fill="var(--primary)" barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-background/60 border-b border-border/40">
                                    {['#', 'Employee', 'Revenue', 'Goal', 'Rating', 'Tier'].map(h => (
                                        <th key={h} className="px-4 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-left font-black">
                                {sorted.map((p, i) => {
                                    const achv = Math.min(100, Math.round((p.revenue / p.goal) * 100));
                                    return (
                                        <tr key={p.id} className="hover:bg-surface-alt/30 transition-colors group cursor-default">
                                            <td className="px-4 py-4 text-center">
                                                <span className={`w-6 h-6 inline-flex items-center justify-center rounded-none text-[10px] font-black ${i === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-background text-text-muted border border-border/40'}`}>{i + 1}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-none bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20 shrink-0">
                                                        {p.staff.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-text group-hover:text-primary transition-colors">{p.staff}</p>
                                                        <p className="text-[9px] text-text-muted uppercase font-black">{p.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-xs font-black text-text">₹{p.revenue.toLocaleString()}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-[10px] font-black text-text-muted">₹{p.goal.toLocaleString()}</p>
                                                <p className={`text-[9px] font-black uppercase ${achv >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{achv}% ACHIEVED</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs font-black text-text">{p.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest ${CONTRIBUTION_META[p.contribution]?.cls || ''}`}>{p.contribution}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Analytics Sidebar */}
                <div className="space-y-4 text-left font-black">
                    <div className="bg-surface p-6 rounded-3xl border border-border/40 shadow-sm flex flex-col">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Staff Skill Matrix</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                    <Radar name="Staff" dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px'
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-background rounded-3xl border border-border/40 shadow-sm p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><Target className="w-4 h-4 text-amber-500" /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Corporate Goals</span>
                        </div>
                        <h3 className="text-xl font-black text-text">Target: ₹{(totalGoal / 1000).toFixed(0)}k</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Completion: {Math.round((totalRevenue / totalGoal) * 100)}%</p>
                        <div className="mt-6 h-2 bg-border/30 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.round((totalRevenue / totalGoal) * 100))}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full bg-amber-500 rounded-full" />
                        </div>
                        <div className="mt-8 space-y-4">
                            {perf.slice(0, 3).map(p => {
                                const achv = Math.min(100, Math.round((p.revenue / p.goal) * 100));
                                return (
                                    <div key={p.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-text">{p.staff.split(' ')[0]}</span>
                                            <span className={achv >= 100 ? 'text-emerald-500' : 'text-amber-500'}>{achv}%</span>
                                        </div>
                                        <div className="h-1.5 bg-border/20 rounded-none overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${achv}%` }} transition={{ duration: 0.8 }}
                                                className={`h-full ${achv >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-xs uppercase tracking-widest text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
