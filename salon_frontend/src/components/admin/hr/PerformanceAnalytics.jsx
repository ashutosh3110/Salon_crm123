import React from 'react';
import {
    TrendingUp,
    Users,
    Star,
    Target,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    BarChart3,
    PieChart,
    Activity,
    DollarSign,
    Award
} from 'lucide-react';

const MOCK_PERFORMANCE = [
    { id: 1, staff: 'Ananya Sharma', revenue: 75000, services: 142, rating: 4.9, commission: 7500, cost: 25000, contribution: 'High' },
    { id: 2, staff: 'Rahul Verma', revenue: 62000, services: 118, rating: 4.7, commission: 6200, cost: 18000, contribution: 'High' },
    { id: 3, staff: 'Sneha Kapur', revenue: 12000, services: 45, rating: 4.8, commission: 0, cost: 15000, contribution: 'Medium' },
    { id: 4, staff: 'Vikram Malhotra', revenue: 95000, services: 30, rating: 5.0, commission: 9500, cost: 45000, contribution: 'Elite' },
];

export default function PerformanceAnalytics() {
    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Productivity', value: '87%', change: '+4.2%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Top Performer', value: 'Ananya S.', change: 'Elite', icon: Award, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Revenue/Staff', value: '₹42,500', change: '+12%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Customer Rating', value: '4.85/5', change: '+0.1', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-border shadow-sm group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-bold text-text mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Ranking Table */}
                <div className="xl:col-span-2 bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-widest">Efficiency Rankings</h3>
                            <p className="text-xs text-text-muted mt-1 uppercase tracking-tighter font-bold">Based on revenue vs salary cost</p>
                        </div>
                        <button className="p-2 rounded-xl bg-slate-50 text-text-muted hover:text-primary transition-all">
                            <BarChart3 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Revenue Gen.</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Rating</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Contribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {MOCK_PERFORMANCE.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-text-muted'
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                                                    {p.staff.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <p className="text-sm font-bold text-text">{p.staff}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-text">₹{p.revenue.toLocaleString()}</p>
                                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${(p.revenue / 100000) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                <span className="text-xs font-bold text-text">{p.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.contribution === 'Elite' ? 'bg-violet-900 text-white' :
                                                p.contribution === 'High' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                {p.contribution}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Analytics Card */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                    <Target className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Quarterly Goals</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Target: ₹2.5M</h3>
                            <p className="text-xs text-white/50 leading-relaxed mb-8 font-bold uppercase tracking-tight">Current Progress: 68%</p>

                            <div className="space-y-3 mt-auto">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <span>Milestone A</span>
                                    <span className="text-white/80">Completed</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 w-2/3 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse" />
                                </div>
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <PieChart className="w-32 h-32 rotate-45 text-white" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                        <h4 className="text-xs font-bold text-text uppercase tracking-widest mb-6 border-b border-border/50 pb-2">Service Breakdown</h4>
                        <div className="space-y-5">
                            {[
                                { label: 'Hair Services', count: 452, color: 'bg-primary' },
                                { label: 'Skin Care', count: 128, color: 'bg-indigo-500' },
                                { label: 'Makeup', count: 86, color: 'bg-rose-500' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">{item.label}</p>
                                        <p className="text-xs font-bold text-text">{item.count}</p>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-border/40 p-0.5">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / 500) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
