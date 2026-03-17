import { Users, BarChart3, Star, Target, Clock, TrendingUp, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    Cell
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';

// ── Mock Data ──────────────────────────────────────────────────────────
const overviewStats = [
    { label: 'Active Staff', value: 8, icon: Users, color: 'indigo' },
    { label: 'Present Today', value: 7, icon: Clock, color: 'green' },
    { label: 'Avg Rating', value: '4.5', icon: Star, color: 'amber' },
    { label: 'Monthly Target', value: '72%', icon: Target, color: 'blue' },
];

const staffPerformance = [
    { id: 1, name: 'Anita S.', role: 'Stylist', services: 42, revenue: 35000, rating: 4.8, target: 92, efficiency: 88, feedback: 95 },
    { id: 2, name: 'Rahul M.', role: 'Stylist', services: 38, revenue: 31000, rating: 4.6, target: 85, efficiency: 82, feedback: 90 },
    { id: 3, name: 'Neha K.', role: 'Stylist', services: 35, revenue: 28500, rating: 4.7, target: 78, efficiency: 75, feedback: 88 },
    { id: 4, name: 'Priya D.', role: 'Receptionist', services: 10, revenue: 5000, rating: 4.9, target: 95, efficiency: 98, feedback: 99 },
    { id: 5, name: 'Vikram J.', role: 'Stylist', services: 28, revenue: 22000, rating: 4.3, target: 62, efficiency: 65, feedback: 70 },
];

const performanceComparison = staffPerformance.map(p => ({
    subject: p.name.split(' ')[0],
    Revenue: p.revenue / 500,
    Efficiency: p.efficiency,
    Feedback: p.feedback,
    fullMark: 100,
}));

const recentFeedback = [
    { id: 1, customer: 'Priya Sharma', stylist: 'Anita S.', rating: 5, comment: 'Amazing hair colour! Exactly what I wanted.' },
    { id: 2, customer: 'Ravi Kumar', stylist: 'Rahul M.', rating: 4, comment: 'Good beard trim, but waited 15 mins.' },
    { id: 3, customer: 'Meera Patel', stylist: 'Neha K.', rating: 5, comment: 'Best facial experience ever!' },
];

export default function ManagerDashboard() {
    return (
        <div className="space-y-6 font-black text-left animate-reveal">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 text-left font-black">
                <div className="leading-none">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Operations Hub</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Command Center :: performance_analytics_v2.1</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface border border-border shadow-sm flex items-center gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-none bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-black text-text uppercase tracking-widest">System Status: Optimal</span>
                    </div>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left font-black">
                {overviewStats.map((s) => (
                    <div key={s.label} className="bg-surface py-4 px-5 sm:py-6 sm:px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative text-left">
                        <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10 text-left font-black">
                            <div className="flex items-center justify-between mb-2 sm:mb-3 text-left">
                                <div className="flex items-center gap-2 text-left font-black">
                                    <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[9px] sm:text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none text-left">{s.label}</p>
                                </div>
                                <div className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-bold text-emerald-500 font-black">
                                    <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    +14%
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-auto text-left font-black">
                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase text-left leading-none">
                                    <AnimatedCounter
                                        value={typeof s.value === 'string' ? parseFloat(s.value.replace(/[₹%,]/g, '')) : s.value}
                                        prefix={typeof s.value === 'string' && s.value.includes('₹') ? '₹' : ''}
                                        suffix={typeof s.value === 'string' && s.value.includes('%') ? '%' : ''}
                                    />
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 text-left font-black">
                {/* Staff Efficiency Radar */}
                <div className="lg:col-span-2 bg-surface p-5 sm:p-8 rounded-none border border-border shadow-sm text-left overflow-hidden">
                    <h2 className="text-[9px] sm:text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 sm:mb-8 text-left">Staff Efficiency Radar</h2>
                    <div className="h-[280px] sm:h-[400px] w-full text-left font-black">
                        <div className="h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius={window.innerWidth < 640 ? "65%" : "80%"} data={performanceComparison}>
                                    <PolarGrid stroke="var(--border)" opacity={0.3} />
                                    <PolarAngleAxis 
                                        dataKey="subject" 
                                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} 
                                    />
                                    <Radar 
                                        name="Revenue" 
                                        dataKey="Revenue" 
                                        stroke="var(--primary)" 
                                        fill="var(--primary)" 
                                        fillOpacity={0.5} 
                                    />
                                    <Radar 
                                        name="Efficiency" 
                                        dataKey="Efficiency" 
                                        stroke="#ec4899" 
                                        fill="#ec4899" 
                                        fillOpacity={0.3} 
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '9px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Monthly Targets Bar */}
                <div className="bg-surface p-5 sm:p-8 rounded-none border border-border shadow-sm flex flex-col text-left overflow-hidden">
                    <h2 className="text-[9px] sm:text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 sm:mb-8 text-left">Revenue Targets</h2>
                    <div className="flex-1 min-h-[280px] sm:min-h-[300px] text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffPerformance} layout="vertical" margin={{ left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={70}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} 
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '9px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="target" fill="var(--primary)" barSize={10}>
                                    {staffPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.target >= 80 ? 'var(--primary)' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Staff Performance Table */}
            <div className="bg-white rounded-none border border-border overflow-hidden shadow-none text-left">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-surface-alt/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                    <h2 className="text-xs sm:text-[11px] font-black text-text uppercase tracking-widest text-left">Staff Performance Metrics</h2>
                    <span className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface border border-border/20 px-3 py-1 drop-shadow-sm w-fit">PHASE 02.2026</span>
                </div>
                <div className="w-full overflow-x-auto custom-scrollbar text-left font-black">
                    <table className="w-full text-sm text-left min-w-[650px]">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border">
                                <th className="text-left px-4 sm:px-5 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="text-left px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                                <th className="text-right px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Services</th>
                                <th className="text-right px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Yield</th>
                                <th className="text-center px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Rating</th>
                                <th className="text-right px-4 sm:px-5 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {staffPerformance.map((s) => (
                                <tr key={s.id} className="hover:bg-surface/30 transition-colors text-left font-black">
                                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-left">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-text uppercase text-[11px] sm:text-xs">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase text-left">{s.role}</td>
                                    <td className="px-3 py-3 sm:py-4 text-right font-black text-text uppercase text-[11px] sm:text-xs">{s.services}</td>
                                    <td className="px-3 py-3 sm:py-4 text-right font-black text-text uppercase text-[11px] sm:text-xs">{typeof s.revenue === 'number' ? `₹${(s.revenue / 1000).toFixed(1)}k` : s.revenue}</td>
                                    <td className="px-3 py-3 sm:py-4 text-center font-black">
                                        <div className="flex items-center justify-center gap-1 font-black">
                                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" />
                                            <span className="font-black text-text text-[11px] sm:text-xs">{s.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-right font-black">
                                        <div className="flex items-center justify-end gap-2 sm:gap-3 font-black">
                                            <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-surface-alt rounded-none overflow-hidden border border-border/20">
                                                <div className={`h-full rounded-none ${s.target >= 80 ? 'bg-emerald-500' : s.target >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.target}%` }} />
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-black text-text w-7 sm:w-8">{s.target}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-none border border-border shadow-sm text-left font-black">
                <div className="px-5 py-4 border-b border-border bg-white text-left font-black">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-widest text-left">Live Feedback Stream</h2>
                </div>
                <div className="divide-y divide-border/40 text-left overflow-hidden">
                    {recentFeedback.map((fb) => (
                        <div key={fb.id} className="p-4 sm:px-8 sm:py-5 hover:bg-surface-alt/20 transition-colors text-left font-black">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-left">
                                <p className="text-xs font-black text-text uppercase tracking-tight text-left">{fb.customer}</p>
                                <div className="flex items-center gap-0.5 text-left font-black">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-border'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] sm:text-xs text-text-muted font-bold italic text-left leading-relaxed">"{fb.comment}"</p>
                            <div className="flex items-center gap-2 mt-3 text-left font-black">
                                <Award className="w-3 h-3 text-primary" />
                                <p className="text-[9px] sm:text-[10px] text-text-muted font-black uppercase tracking-widest text-left">— Serviced by <span className="text-primary">{fb.stylist}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
