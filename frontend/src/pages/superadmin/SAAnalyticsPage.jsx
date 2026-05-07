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
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-border rounded-xl shadow-xl p-3 text-xs min-w-[140px]">
            <p className="font-semibold text-text mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill }} className="font-medium flex justify-between gap-3">
                    <span>{p.name}</span>
                    <span className="font-bold">{typeof p.value === 'number' && p.value > 1000 ? fmtINR(p.value) : p.value}</span>
                </p>
            ))}
        </div>
    );
};

/* ─── Metric card ────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, icon: Icon, gradient, shadow }) {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="text-2xl font-black text-text">{value}</div>
            <div className="text-xs text-text-muted mt-0.5 font-bold uppercase tracking-wider">{label}</div>
            {sub && <div className="text-[11px] text-text-muted mt-1 font-medium">{sub}</div>}
        </div>
    );
}

/* ─── Section wrapper ────────────────────────────────────────────────── */
function Section({ title, subtitle, icon: Icon, children }) {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-surface/30">
                {Icon && <Icon className="w-5 h-5 text-primary" />}
                <div>
                    <h3 className="font-bold text-text">{title}</h3>
                    {subtitle && <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mt-0.5">{subtitle}</p>}
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

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await api.get('/dashboard/superadmin/analytics');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-text-secondary animate-pulse">Analyzing business data...</p>
            </div>
        );
    }

    const { kpis, growth, planDistribution, geoDistribution } = data;

    const COLORS = ['#B85C5C', '#E2A8A8', '#94a3b8', '#64748b', '#475569'];

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
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-semibold hover:border-primary transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Salons" value={kpis.totalSalons} sub={`${kpis.activeSalons} Active accounts`} icon={Building2} gradient="from-primary to-[#8B1A2D]" shadow="shadow-primary/20" />
                <MetricCard label="Monthly Revenue" value={fmtINR(kpis.mrr)} sub="Recurring income this month" icon={DollarSign} gradient="from-emerald-500 to-teal-600" shadow="shadow-emerald-500/20" />
                <MetricCard label="Yearly Forecast" value={fmtINR(kpis.arr)} sub="Projected annual revenue" icon={TrendingUp} gradient="from-blue-500 to-indigo-600" shadow="shadow-blue-500/20" />
                <MetricCard label="Lifetime Revenue" value={fmtINR(kpis.totalRevenue)} sub="Total income since launch" icon={BarChart2} gradient="from-amber-500 to-orange-600" shadow="shadow-amber-500/20" />
            </div>

            {/* ── Growth Charts ── */}
            <div className="grid lg:grid-cols-2 gap-6">
                <Section title="Revenue Growth" subtitle="MRR Trend (Last 6 Months)" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={growth.mrrTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#B85C5C" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#B85C5C" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#B85C5C" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Salon Acquisition" subtitle="New Monthly Signups" icon={Users}>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={growth.salonTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
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
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {planDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip tooltip={CustomTooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-full mt-4 space-y-2">
                                {planDistribution.map((p, index) => (
                                    <div key={p.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            <span className="font-medium text-text-secondary capitalize">{p.name || 'None'}</span>
                                        </div>
                                        <span className="font-bold text-text">{p.value}</span>
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
                                        <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">City</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Total Salons</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">Market Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {geoDistribution.map((g) => {
                                        const pct = ((g.salons / kpis.totalSalons) * 100).toFixed(1);
                                        return (
                                            <tr key={g.city} className="hover:bg-surface/40 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary uppercase">
                                                            {g.city[0]}
                                                        </div>
                                                        <span className="text-sm font-bold text-text">{g.city}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right text-sm font-bold text-text">{g.salons}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-text-secondary">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {geoDistribution.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-sm text-text-muted italic">No location data available yet.</td>
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
