import { Users, BarChart3, Star, Target, Clock, TrendingUp, Award, ArrowUpRight } from 'lucide-react';

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
                    <div key={s.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center`}>
                            <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text">{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Staff Performance Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-text">Staff Performance (This Month)</h2>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Feb 2026</span>
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
                        <tbody className="divide-y divide-border">
                            {staffPerformance.map((s) => (
                                <tr key={s.id} className="hover:bg-surface/30 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">{s.name.charAt(0)}</div>
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
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-extrabold text-text">Latest Customer Feedback</h2>
                </div>
                <div className="divide-y divide-border">
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
