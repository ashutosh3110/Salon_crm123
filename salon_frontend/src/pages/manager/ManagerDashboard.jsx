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
        <div className="space-y-6 font-black text-left">
            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left font-black">
                {overviewStats.map((s) => (
                    <div key={s.label} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative text-left">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10 text-left font-black">
                            <div className="flex items-center justify-between mb-3 text-left">
                                <div className="flex items-center gap-2.5 text-left font-black">
                                    <s.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none text-left">{s.label}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 font-black">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +14.5%
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-auto text-left font-black">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase text-left">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                {/* Staff Efficiency Radar */}
                <div className="lg:col-span-2 bg-surface p-8 rounded-none border border-border shadow-sm text-left">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-8 text-left">Staff Efficiency Radar</h2>
                    <div className="h-[350px] w-full text-left font-black">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceComparison}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <Radar name="Revenue" dataKey="Revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                <Radar name="Efficiency" dataKey="Efficiency" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Targets Bar */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm flex flex-col text-left">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-8 text-left">Revenue Targets</h2>
                    <div className="flex-1 min-h-[300px] text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffPerformance} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="target" fill="var(--primary)" barSize={15}>
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
                <div className="px-5 py-4 border-b border-border bg-white flex items-center justify-between text-left">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-widest text-left">Staff Performance Metrics</h2>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white border border-border/20 px-2 py-1">PHASE 02.2026</span>
                </div>
                <div className="overflow-x-auto text-left font-black">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border">
                                <th className="text-left px-5 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="text-left px-3 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                                <th className="text-right px-3 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Services</th>
                                <th className="text-right px-3 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Yield</th>
                                <th className="text-center px-3 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Rating</th>
                                <th className="text-right px-5 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {staffPerformance.map((s) => (
                                <tr key={s.id} className="hover:bg-surface/30 transition-colors text-left font-black">
                                    <td className="px-5 py-4 text-left">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 shrink-0">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-black text-text uppercase text-xs">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-[10px] font-black text-text-muted uppercase text-left">{s.role}</td>
                                    <td className="px-3 py-4 text-right font-black text-text uppercase">{s.services}</td>
                                    <td className="px-3 py-4 text-right font-black text-text uppercase">{typeof s.revenue === 'number' ? `₹${(s.revenue / 1000).toFixed(1)}k` : s.revenue}</td>
                                    <td className="px-3 py-4 text-center font-black">
                                        <div className="flex items-center justify-center gap-1 font-black">
                                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                            <span className="font-black text-text text-xs">{s.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right font-black">
                                        <div className="flex items-center justify-end gap-3 font-black">
                                            <div className="w-16 h-1.5 bg-surface-alt rounded-none overflow-hidden border border-border/20">
                                                <div className={`h-full rounded-none ${s.target >= 80 ? 'bg-emerald-500' : s.target >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.target}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-text w-8">{s.target}%</span>
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
                <div className="divide-y divide-border/40 text-left">
                    {recentFeedback.map((fb) => (
                        <div key={fb.id} className="px-8 py-5 hover:bg-surface-alt/20 transition-colors text-left font-black">
                            <div className="flex items-center justify-between mb-2 text-left">
                                <p className="text-xs font-black text-text uppercase tracking-tight text-left">{fb.customer}</p>
                                <div className="flex items-center gap-0.5 text-left font-black">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-border'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-text-muted font-bold italic text-left">"{fb.comment}"</p>
                            <div className="flex items-center gap-2 mt-2 text-left font-black">
                                <Award className="w-3 h-3 text-primary" />
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest text-left">— Serviced by <span className="text-primary">{fb.stylist}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
