import { useState } from 'react';
import {
    TrendingUp, TrendingDown, Users, Building2, DollarSign,
    BarChart2, Activity, RefreshCw, Download, Calendar,
    ArrowUpRight, ArrowDownRight, Target, Zap, Heart,
    Star, UserCheck, UserX, Clock, Layers, ChevronDown,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ComposedChart, Scatter,
} from 'recharts';

/* ─── Dataset ────────────────────────────────────────────────────────── */
const MRR_TREND = [
    { month: 'Aug 25', mrr: 38200, newMRR: 4100, churnedMRR: 1200, expansion: 800 },
    { month: 'Sep 25', mrr: 43100, newMRR: 6300, churnedMRR: 1800, expansion: 1200 },
    { month: 'Oct 25', mrr: 51400, newMRR: 9800, churnedMRR: 1600, expansion: 1400 },
    { month: 'Nov 25', mrr: 58900, newMRR: 8200, churnedMRR: 2100, expansion: 1900 },
    { month: 'Dec 25', mrr: 67100, newMRR: 9600, churnedMRR: 1700, expansion: 1500 },
    { month: 'Jan 26', mrr: 72800, newMRR: 7300, churnedMRR: 2200, expansion: 2100 },
    { month: 'Feb 26', mrr: 81500, newMRR: 9800, churnedMRR: 1900, expansion: 2700 },
];

const SALON_GROWTH = [
    { month: 'Aug 25', total: 85, new: 12, churned: 3 },
    { month: 'Sep 25', total: 94, new: 14, churned: 5 },
    { month: 'Oct 25', total: 103, new: 11, churned: 2 },
    { month: 'Nov 25', total: 112, new: 13, churned: 4 },
    { month: 'Dec 25', total: 119, new: 10, churned: 3 },
    { month: 'Jan 26', total: 124, new: 8, churned: 3 },
    { month: 'Feb 26', total: 127, new: 6, churned: 3 },
];

const COHORT = [
    { cohort: 'Aug 25', m0: 100, m1: 78, m2: 65, m3: 58, m4: 52, m5: 48, m6: 45 },
    { cohort: 'Sep 25', m0: 100, m1: 82, m2: 69, m3: 61, m4: 55, m5: 50 },
    { cohort: 'Oct 25', m0: 100, m1: 80, m2: 71, m3: 63, m4: 57 },
    { cohort: 'Nov 25', m0: 100, m1: 85, m2: 73, m3: 67 },
    { cohort: 'Dec 25', m0: 100, m1: 83, m2: 76 },
    { cohort: 'Jan 26', m0: 100, m1: 86 },
    { cohort: 'Feb 26', m0: 100 },
];

const PLAN_DIST = [
    { name: 'Free', value: 38, color: '#94a3b8', mrr: 0 },
    { name: 'Basic', value: 27, color: '#3b82f6', mrr: 53973 },
    { name: 'Pro', value: 22, color: '#B85C5C', mrr: 109978 },
    { name: 'Enterprise', value: 13, color: '#f59e0b', mrr: 168987 },
];

const GEO_DATA = [
    { city: 'Mumbai', salons: 28, mrr: 24800 },
    { city: 'Delhi', salons: 22, mrr: 19400 },
    { city: 'Bangalore', salons: 19, mrr: 17200 },
    { city: 'Hyderabad', salons: 14, mrr: 11900 },
    { city: 'Chennai', salons: 12, mrr: 9800 },
    { city: 'Pune', salons: 11, mrr: 8600 },
    { city: 'Others', salons: 21, mrr: 16500 },
];

const FEATURE_USAGE = [
    { feature: 'POS', usage: 89, change: 3 },
    { feature: 'Bookings', usage: 94, change: 5 },
    { feature: 'CRM', usage: 76, change: 8 },
    { feature: 'Inventory', usage: 62, change: -2 },
    { feature: 'Marketing', usage: 41, change: 12 },
    { feature: 'Reports', usage: 55, change: 6 },
    { feature: 'HR/Payroll', usage: 48, change: 4 },
    { feature: 'Loyalty', usage: 37, change: 15 },
    { feature: 'WhatsApp', usage: 29, change: 22 },
];

const CHURN_REASONS = [
    { reason: 'Too Expensive', pct: 34 },
    { reason: 'Missing Features', pct: 28 },
    { reason: 'Going Offline', pct: 17 },
    { reason: 'Competitor', pct: 13 },
    { reason: 'Other', pct: 8 },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const fmtINR = v => `₹${v.toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-border rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
            <p className="font-semibold text-text mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }} className="font-medium flex justify-between gap-3">
                    <span>{p.name}</span>
                    <span className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? fmtINR(p.value) : p.value}{typeof p.value === 'number' && p.value <= 100 && p.name?.includes('%') ? '%' : ''}</span>
                </p>
            ))}
        </div>
    );
};

/* ─── Metric card ────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, change, icon: Icon, gradient, shadow }) {
    const up = change >= 0;
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change !== null && (
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
            <div className="text-2xl font-black text-text">{value}</div>
            <div className="text-xs text-text-muted mt-0.5">{label}</div>
            {sub && <div className="text-[11px] text-text-muted mt-1 font-medium">{sub}</div>}
        </div>
    );
}

/* ─── Section wrapper ────────────────────────────────────────────────── */
function Section({ title, subtitle, action, children }) {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                    <h3 className="font-bold text-text">{title}</h3>
                    {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

/* ─── Cohort cell ────────────────────────────────────────────────────── */
function CohortCell({ value }) {
    if (value === undefined) return <td className="px-3 py-2 text-center text-xs text-text-muted/30">—</td>;
    const intensity = value / 100;
    const bg = value === 100
        ? 'bg-primary text-white font-black'
        : value >= 75 ? 'bg-emerald-100 text-emerald-800 font-bold'
            : value >= 55 ? 'bg-teal-50    text-teal-700   font-semibold'
                : value >= 40 ? 'bg-amber-50   text-amber-700  font-medium'
                    : 'bg-red-50     text-red-600    font-medium';
    return (
        <td className="px-3 py-2 text-center">
            <span className={`inline-block text-xs px-2 py-0.5 rounded-lg ${bg}`}>{value}%</span>
        </td>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SAAnalyticsPage() {
    const [range, setRange] = useState('6m');
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2800);
    };

    const mrr = 81500;
    const arr = mrr * 12;
    const arpu = Math.round(mrr / 127);
    const ltv = Math.round(arpu / 0.022);  // LTV = ARPU / churn%
    const nps = 61;

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
                    <h1 className="text-2xl font-black text-text tracking-tight">SaaS Analytics</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Growth, retention, revenue and feature adoption metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Range picker */}
                    <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 shadow-sm">
                        {['3m', '6m', '1y', 'All'].map(r => (
                            <button key={r} onClick={() => setRange(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => showToast('Analytics report exported!')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-semibold hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            {/* ── Top KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="MRR" value={fmtINR(mrr)} sub="Monthly Recurring Revenue" change={11.9} icon={DollarSign} gradient="from-primary to-[#8B1A2D]" shadow="shadow-primary/20" />
                <MetricCard label="ARR" value={fmtINR(arr)} sub="Annualised Run Rate" change={9.8} icon={TrendingUp} gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-500/20" />
                <MetricCard label="ARPU" value={fmtINR(arpu)} sub="Avg Revenue / Salon" change={3.2} icon={Users} gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-500/20" />
                <MetricCard label="LTV" value={fmtINR(ltv)} sub="Avg Lifetime Value" change={6.1} icon={Heart} gradient="from-violet-500 to-purple-600" shadow="shadow-violet-500/20" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Salons" value="127" sub="Active tenants" change={4.1} icon={Building2} gradient="from-sky-500 to-cyan-600" shadow="shadow-sky-500/20" />
                <MetricCard label="Churn Rate" value="2.2%" sub="Monthly, ↓ improving" change={-0.3} icon={UserX} gradient="from-orange-500 to-red-500" shadow="shadow-orange-500/20" />
                <MetricCard label="NPS Score" value={nps} sub="Net Promoter Score" change={4} icon={Star} gradient="from-amber-400 to-orange-500" shadow="shadow-amber-400/20" />
                <MetricCard label="DAU/MAU Ratio" value="68%" sub="Stickiness index" change={2.8} icon={Activity} gradient="from-rose-500 to-pink-600" shadow="shadow-rose-500/20" />
            </div>

            {/* ── MRR Waterfall / Trend ── */}
            <Section title="MRR Breakdown" subtitle="New, expansion and churned MRR each month"
                action={<span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">↑ 11.9% MoM</span>}>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={MRR_TREND} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B85C5C" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#B85C5C" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="newMRR" name="New MRR" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" barSize={18} />
                        <Bar dataKey="expansion" name="Expansion MRR" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" barSize={18} />
                        <Bar dataKey="churnedMRR" name="Churned MRR" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={18} />
                        <Line type="monotone" dataKey="mrr" name="Total MRR" stroke="#B85C5C" strokeWidth={2.5} dot={{ r: 4, fill: '#B85C5C', stroke: '#fff', strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </Section>

            {/* ── Salon Growth & Plan Distribution row ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Salon growth */}
                <Section title="Salon Growth" subtitle="New signups vs churned per month">
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={SALON_GROWTH} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={18}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="new" name="New Salons" fill="#10b981" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Plan distribution */}
                <Section title="Plan Distribution" subtitle="Salons by current subscription plan">
                    <div className="flex items-center gap-6">
                        <ResponsiveContainer width="55%" height={210}>
                            <PieChart>
                                <Pie data={PLAN_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                    dataKey="value" paddingAngle={3} stroke="none">
                                    {PLAN_DIST.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [`${v} salons`, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-3">
                            {PLAN_DIST.map(p => (
                                <div key={p.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                            <span className="text-xs font-semibold text-text">{p.name}</span>
                                        </div>
                                        <span className="text-xs text-text-muted">{p.value} salons</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(p.value / 127 * 100).toFixed(0)}%`, backgroundColor: p.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            </div>

            {/* ── Cohort Retention ── */}
            <Section title="Cohort Retention Analysis" subtitle="Monthly retention % by signup cohort — colour = retention health">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-3 py-2 text-text-muted font-semibold whitespace-nowrap">Cohort</th>
                                {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
                                    <th key={m} className="px-3 py-2 text-text-muted font-semibold">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {COHORT.map(row => (
                                <tr key={row.cohort} className="hover:bg-surface/30">
                                    <td className="px-3 py-2 font-semibold text-text-secondary whitespace-nowrap">{row.cohort}</td>
                                    <CohortCell value={row.m0} />
                                    <CohortCell value={row.m1} />
                                    <CohortCell value={row.m2} />
                                    <CohortCell value={row.m3} />
                                    <CohortCell value={row.m4} />
                                    <CohortCell value={row.m5} />
                                    <CohortCell value={row.m6} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] text-text-muted mt-3">
                    💡 M0 = first month (100% baseline). M6 avg retention is <strong className="text-text">45%</strong> — slightly above industry SaaS median of ~40%.
                </p>
            </Section>

            {/* ── Feature Adoption & Churn Reasons ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Feature adoption */}
                <Section title="Feature Adoption" subtitle="% of active salons using each feature this month">
                    <div className="space-y-3">
                        {FEATURE_USAGE.sort((a, b) => b.usage - a.usage).map(f => (
                            <div key={f.feature}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-text-secondary">{f.feature}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold ${f.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {f.change >= 0 ? '↑' : '↓'}{Math.abs(f.change)}%
                                        </span>
                                        <span className="text-xs font-bold text-text">{f.usage}%</span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${f.usage >= 80 ? 'bg-emerald-500' :
                                            f.usage >= 55 ? 'bg-blue-500' :
                                                f.usage >= 35 ? 'bg-amber-500' : 'bg-slate-400'
                                        }`} style={{ width: `${f.usage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Churn reasons */}
                <Section title="Churn Reasons" subtitle="Why salons are cancelling their plan">
                    <div className="space-y-3">
                        {CHURN_REASONS.map(c => (
                            <div key={c.reason}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-text-secondary">{c.reason}</span>
                                    <span className="text-xs font-bold text-text">{c.pct}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#8B1A2D] transition-all duration-700" style={{ width: `${c.pct}%` }} />
                                </div>
                            </div>
                        ))}
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                            💡 <strong>34%</strong> cite pricing as the top reason. Consider introducing a mid-tier plan between Basic and Pro.
                        </div>
                    </div>
                </Section>
            </div>

            {/* ── Geo Distribution ── */}
            <Section title="Geographic Distribution" subtitle="Salon count and MRR contribution by city">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {['Rank', 'City', 'Salons', 'MRR', 'Avg MRR / Salon', 'Share'].map(h => (
                                    <th key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {GEO_DATA.map((g, i) => {
                                const totalMRR = GEO_DATA.reduce((a, x) => a + x.mrr, 0);
                                const pct = ((g.mrr / totalMRR) * 100).toFixed(1);
                                return (
                                    <tr key={g.city} className="hover:bg-surface/40 transition-colors">
                                        <td className="px-4 py-3.5 text-sm font-black text-text-muted">#{i + 1}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">{g.city[0]}</div>
                                                <span className="text-sm font-semibold text-text">{g.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm font-bold text-text">{g.salons}</td>
                                        <td className="px-4 py-3.5 text-sm font-bold text-text">{fmtINR(g.mrr)}</td>
                                        <td className="px-4 py-3.5 text-sm text-text-secondary">{fmtINR(Math.round(g.mrr / g.salons))}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-[80px]">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-text">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Section>

        </div>
    );
}
