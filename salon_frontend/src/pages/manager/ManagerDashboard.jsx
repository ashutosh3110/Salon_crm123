import { Users, BarChart3, Star, Target, Clock, TrendingUp, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

// ── Mock Data ──────────────────────────────────────────────────────────
const overviewStats = [
    { label: 'Active Staff', value: 8, icon: Users, color: 'indigo' },
    { label: 'Present Today', value: 7, icon: Clock, color: 'green' },
    { label: 'Avg Rating', value: '4.5', icon: Star, color: 'amber' },
    { label: 'Monthly Target', value: '72%', icon: Target, color: 'blue' },
];

const staffPerformance = [
    { id: 1, name: 'Anita S.', role: 'Stylist', services: 42, revenue: 35000, rating: 4.8, target: 92 },
    { id: 2, name: 'Rahul M.', role: 'Stylist', services: 38, revenue: 31000, rating: 4.6, target: 85 },
    { id: 3, name: 'Neha K.', role: 'Stylist', services: 35, revenue: 28500, rating: 4.7, target: 78 },
    { id: 4, name: 'Priya D.', role: 'Receptionist', services: '-', revenue: '-', rating: 4.9, target: 95 },
    { id: 5, name: 'Vikram J.', role: 'Stylist', services: 28, revenue: 22000, rating: 4.3, target: 62 },
];

const recentFeedback = [
    { id: 1, customer: 'Priya Sharma', stylist: 'Anita S.', rating: 5, comment: 'Amazing hair colour! Exactly what I wanted.' },
    { id: 2, customer: 'Ravi Kumar', stylist: 'Rahul M.', rating: 4, comment: 'Good beard trim, but waited 15 mins.' },
    { id: 3, customer: 'Meera Patel', stylist: 'Neha K.', rating: 5, comment: 'Best facial experience ever!' },
];

export default function ManagerDashboard() {
    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {overviewStats.map((s) => (
                    <div key={s.label} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <s.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +14.5%
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={typeof s.value === 'string' ? parseFloat(s.value.replace(/[₹%,]/g, '')) : s.value}
                                        prefix={typeof s.value === 'string' && s.value.includes('₹') ? '₹' : ''}
                                        suffix={typeof s.value === 'string' && s.value.includes('%') ? '%' : ''}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400">
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Staff Performance Table */}
            <div className="bg-white rounded-none border border-border/60 overflow-hidden shadow-none">
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-white">
                    <h2 className="text-sm font-extrabold text-text uppercase tracking-widest">Staff Performance (This Month)</h2>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-white border border-border/20 px-2 py-1">Feb 2026</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface/50">
                                <th className="text-left px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Staff</th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Role</th>
                                <th className="text-right px-3 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Services</th>
                                <th className="text-right px-3 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Revenue</th>
                                <th className="text-center px-3 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Rating</th>
                                <th className="text-right px-5 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {staffPerformance.map((s) => (
                                <tr key={s.id} className="hover:bg-surface/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-text">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-text-muted">{s.role}</td>
                                    <td className="px-3 py-3 text-right font-bold text-text">{s.services}</td>
                                    <td className="px-3 py-3 text-right font-bold text-text">{typeof s.revenue === 'number' ? `₹${(s.revenue / 1000).toFixed(0)}K` : s.revenue}</td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-0.5">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-text">{s.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${s.target >= 80 ? 'bg-emerald-400' : s.target >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${s.target}%` }} />
                                            </div>
                                            <span className="text-xs font-black text-text">{s.target}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-none border border-border/60 overflow-hidden shadow-none">
                <div className="px-5 py-4 border-b border-border/40 bg-white">
                    <h2 className="text-sm font-extrabold text-text uppercase tracking-widest">Latest Customer Feedback</h2>
                </div>
                <div className="divide-y divide-border/40">
                    {recentFeedback.map((fb) => (
                        <div key={fb.id} className="px-5 py-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm font-bold text-text">{fb.customer}</p>
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: fb.rating }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-text-muted italic">"{fb.comment}"</p>
                            <p className="text-[10px] text-text-muted mt-1">— Serviced by <span className="font-bold text-text-secondary">{fb.stylist}</span></p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
