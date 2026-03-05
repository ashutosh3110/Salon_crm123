import React from 'react';
import {
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Bell,
    Settings,
    MoreVertical,
    Activity,
    CreditCard,
    Globe,
    Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const stats = [
    { label: 'Total Revenue', value: 128450, prefix: '₹', trend: '+14.5%', positive: true, icon: DollarSign },
    { label: 'Total Appointments', value: 842, prefix: '', trend: '+8.2%', positive: true, icon: Calendar },
    { label: 'Active Clients', value: 3240, prefix: '', trend: '+22.4%', positive: true, icon: Users },
    { label: 'Avg. Rating', value: 4.8, prefix: '', suffix: '/5', trend: 'Stable', positive: true, icon: TrendingUp },
];

const revenueData = [
    { name: 'Mon', revenue: 4000, appointments: 24 },
    { name: 'Tue', revenue: 3000, appointments: 18 },
    { name: 'Wed', revenue: 5000, appointments: 29 },
    { name: 'Thu', revenue: 2780, appointments: 15 },
    { name: 'Fri', revenue: 6890, appointments: 42 },
    { name: 'Sat', revenue: 8390, appointments: 54 },
    { name: 'Sun', revenue: 7490, appointments: 48 },
];

const serviceDistribution = [
    { name: 'Haircut', value: 400, color: '#3b82f6' },
    { name: 'Skin Care', value: 300, color: '#ec4899' },
    { name: 'Massage', value: 300, color: '#f59e0b' },
    { name: 'Nails', value: 200, color: '#10b981' },
];

const recentActivity = [
    { client: 'Rahul Sharma', service: 'Haircut & Styling', time: '5 mins ago', amount: '₹850', status: 'Completed' },
    { client: 'Priya Singh', service: 'Facial Spa', time: '15 mins ago', amount: '₹2,200', status: 'In Progress' },
    { client: 'Anita Verma', service: 'Manicure', time: '45 mins ago', amount: '₹1,200', status: 'Pending' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6 animate-reveal">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left font-black">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Welcome Back, Admin</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Real-time salon intelligence overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Scan system..."
                            className="pl-10 pr-4 py-2.5 rounded-none bg-surface-alt border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 transition-all min-w-[240px]"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-black">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 text-left font-black">
                                <div className="flex items-center gap-2.5">
                                    <stat.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={stat.value}
                                        prefix={stat.prefix}
                                        suffix={stat.suffix}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={stat.positive ? "text-emerald-400" : "text-rose-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-surface p-8 rounded-none border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[11px] font-black text-text uppercase tracking-[0.2em]">Revenue Performance Matrix</h2>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest mt-1 uppercase">7-Day Transactional Flux</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-primary" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-primary/20" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Bookings</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.1)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }}
                                    dy={10}
                                />
                                <YAxis hide />
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
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="appointments"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Distribution Pie */}
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm flex flex-col">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-[0.2em] mb-8">Service Utilization</h2>
                    <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
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
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-6">
                        {serviceDistribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }} />
                                    <span className="text-text-muted">{item.name}</span>
                                </div>
                                <span className="text-text">{item.value}+ Unit</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                <div className="lg:col-span-2 bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left">
                    <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest text-left">Live Salon Activity</h3>
                        <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Full Stream</button>
                    </div>
                    <div className="divide-y divide-border/50 text-left">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                <div className="flex items-center gap-4 text-left font-black">
                                    <div className="w-10 h-10 rounded-none bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted group-hover:text-primary transition-all">
                                        {activity.client[0]}
                                    </div>
                                    <div className="text-left font-black">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{activity.client}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{activity.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-text uppercase">{activity.amount}</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-[0.2em] uppercase mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface rounded-none border border-border shadow-sm p-5 space-y-5 text-left font-black">
                    <h3 className="text-[11px] font-black text-text uppercase tracking-widest text-left">Quick Operations</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        <button className="p-5 rounded-none bg-surface-alt hover:bg-primary text-text hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm">
                            <Calendar className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Booking</span>
                        </button>
                        <button className="p-5 rounded-none bg-surface-alt hover:bg-primary text-text hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm">
                            <Users className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Staff</span>
                        </button>
                        <button className="p-5 rounded-none bg-surface-alt hover:bg-primary text-text hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm">
                            <TrendingUp className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sales</span>
                        </button>
                        <button className="p-5 rounded-none bg-surface-alt hover:bg-primary text-text hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm">
                            <Settings className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Settings</span>
                        </button>
                        <Link to="/admin/digital-presence" className="p-5 rounded-none bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all border border-primary/20 hover:border-primary flex flex-col items-center gap-3 group shadow-sm col-span-2">
                            <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] block">Digital Presence</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Manage Online Catalogue</span>
                            </div>
                        </Link>
                    </div>

                    <div className="p-6 rounded-none bg-primary text-white space-y-3 relative overflow-hidden group shadow-lg shadow-primary/20 text-left font-black">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                            <TrendingUp className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 text-left">Pro Intelligence</p>
                        <p className="text-sm font-black tracking-tight leading-tight uppercase text-left">Track stylist performance to optimize schedules.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
