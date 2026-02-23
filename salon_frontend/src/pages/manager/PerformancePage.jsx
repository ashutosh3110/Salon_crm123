import {
    BarChart3, TrendingUp, Users, DollarSign,
    ArrowUpRight, ArrowDownRight, Award,
    Calendar, ChevronRight, Target
} from 'lucide-react';

const stats = [
    { label: 'Avg Ticket Size', value: '₹1,450', change: '+12%', isUp: true, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Revisit Rate', value: '68%', change: '+5%', isUp: true, icon: TrendingUp, color: 'text-primary' },
    { label: 'Occupancy', value: '82%', change: '-2%', isUp: false, icon: Calendar, color: 'text-amber-500' },
    { label: 'Efficiency', value: '94%', change: '+8%', isUp: true, icon: Target, color: 'text-blue-500' },
];

const topPerformers = [
    { id: 1, name: 'Ananya Sharma', revenue: '₹42,800', services: 84, rating: 4.9 },
    { id: 2, name: 'Priya Das', revenue: '₹38,200', services: 72, rating: 4.8 },
    { id: 3, name: 'Vikas Singh', revenue: '₹31,500', services: 68, rating: 4.5 },
];

export default function PerformancePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">Performance Analytics</h1>
                <p className="text-sm text-text-muted font-medium">Real-time metrics and team performance insights</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/10">
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            <span className={`flex items-center gap-0.5 text-[10px] font-black ${s.isUp ? 'text-emerald-500' : 'text-rose-500'} bg-background px-2 py-0.5 rounded-lg border border-border/10`}>
                                {s.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {s.change}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-text leading-none relative z-10">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 relative z-10">{s.label}</p>
                        <div className={`absolute bottom-0 right-0 w-16 h-16 ${s.isUp ? 'bg-emerald-500/5' : 'bg-rose-500/5'} rounded-full translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-500`} />
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Revenue Growth</h2>
                        <select className="bg-background border border-border/40 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 90, 55, 75, 85].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div
                                    className="w-full bg-primary/10 rounded-t-lg group-hover:bg-primary transition-all duration-500"
                                    style={{ height: `${h}%` }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text text-background text-[10px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ₹{(h * 150).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <span key={day} className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{day}</span>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Team Rankings</h2>
                    </div>
                    <div className="space-y-4">
                        {topPerformers.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-background border border-border/5 hover:border-primary/20 transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm relative">
                                    {p.name.split(' ').map(n => n[0]).join('')}
                                    {i === 0 && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-1 shadow-sm">
                                            <Award className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-text">{p.name}</p>
                                    <p className="text-[11px] text-text-muted font-medium">{p.services} services completed</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-text">{p.revenue}</p>
                                    <div className="flex items-center justify-end gap-1">
                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-500">Peak</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 bg-background border border-border/40 rounded-xl text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
}
