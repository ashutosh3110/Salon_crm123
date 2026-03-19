import React, { useMemo } from 'react';
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
import { useBusiness } from '../../contexts/BusinessContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { useWallet } from '../../contexts/WalletContext';

export default function DashboardPage() {
    const { 
        outlets, 
        customers, 
        services, 
        staff,
        bookings: businessBookings
    } = useBusiness();
    const { bookings: registryBookings } = useBookingRegistry();
    const { allWallets } = useWallet();

    const totalLiability = useMemo(() => {
        return Object.values(allWallets).reduce((acc, w) => acc + (w.balance || 0), 0);
    }, [allWallets]);

    const activeStats = useMemo(() => {
        return [
            { label: 'Total Salons', value: outlets.length, prefix: '', trend: 'Live', positive: true, icon: Globe },
            { label: 'Total Appointments', value: registryBookings.length, prefix: '', trend: 'Bookings', positive: true, icon: Calendar },
            { label: 'Active Clients', value: customers.length, prefix: '', trend: 'Database', positive: true, icon: Users },
            { label: 'Staff Members', value: staff.length, prefix: '', trend: 'Team', positive: true, icon: TrendingUp },
            { label: 'Wallet Liability', value: totalLiability, prefix: '₹', trend: 'Active', positive: false, icon: CreditCard }
        ];
    }, [outlets, registryBookings, customers, staff, totalLiability]);

    const liveRecentActivity = useMemo(() => {
        // Take last 5 from registry
        const live = (registryBookings || []).slice(0, 5).map(b => ({
            client: b.clientName,
            service: b.services?.[0]?.name || 'Salon Service',
            time: b.time || 'Scheduled',
            amount: `₹${(b.totalPrice || 0).toLocaleString()}`,
            status: b.status === 'upcoming' ? 'Upcoming' : 'Completed',
            isLive: true
        }));
        
        // If no live activity, return empty array (no fallback to mock)
        return live;
    }, [registryBookings]);

    // Use empty/initial values for charts if no live data is available yet
    const revenueData = useMemo(() => [
        { name: 'Mon', revenue: 0, appointments: 0 },
        { name: 'Tue', revenue: 0, appointments: 0 },
        { name: 'Wed', revenue: 0, appointments: 0 },
        { name: 'Thu', revenue: 0, appointments: 0 },
        { name: 'Fri', revenue: 0, appointments: 0 },
        { name: 'Sat', revenue: 0, appointments: 0 },
        { name: 'Sun', revenue: 0, appointments: 0 },
    ], []);

    const serviceDistribution = useMemo(() => {
        if (services.length === 0) return [];
        return services.slice(0, 4).map((s, i) => ({
            name: s.name,
            value: 1, // Placeholder for distribution if no booking data yet
            color: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981'][i]
        }));
    }, [services]);

    return (
        <div className="space-y-6 animate-reveal">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 text-left">
                <div className="leading-none">
                    <h1 className="text-2xl sm:text-4xl font-bold text-text tracking-tight leading-tight">Welcome Back</h1>
                    <p className="text-sm font-medium text-text-muted mt-2 tracking-wide font-sans">Daily salon overview and performance</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full lg:min-w-[300px] pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-border text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="responsive-grid-5 text-left">
                {activeStats.map((stat, i) => (
                    <div key={i} className="bg-surface py-7 px-7 rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                        <stat.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="text-[12px] font-semibold text-text-secondary tracking-wide">{stat.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'} bg-white dark:bg-white/5 px-2 py-0.5 rounded-full border border-border/50`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-bold text-text tracking-tight">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-left">
                            <h2 className="text-lg font-bold text-text tracking-tight">Revenue Trends</h2>
                            <p className="text-xs text-text-muted font-medium mt-1">Last 7 days income and bookings</p>
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
                <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-text tracking-tight mb-8 text-left">Most Booked Services</h2>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden text-left">
                    <div className="px-8 py-6 border-b border-border bg-surface-alt/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text tracking-tight text-left">Recent Activity</h3>
                        <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Full Stream</button>
                    </div>
                    <div className="divide-y divide-border/50 text-left">
                        {(liveRecentActivity || []).map((activity, i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                <div className="flex items-center gap-4 text-left font-black">
                                    <div className={`w-12 h-12 rounded-xl bg-surface-alt border flex items-center justify-center font-bold transition-all ${activity.isLive ? 'border-primary/50 text-primary animate-pulse shadow-lg shadow-primary/10' : 'border-border text-text-muted group-hover:text-primary'}`}>
                                        {activity.client?.[0] || 'C'}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[15px] font-bold text-text group-hover:text-primary transition-colors">
                                            {activity.client}
                                            {activity.isLive && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 tracking-wide">LIVE</span>}
                                        </p>
                                        <p className="text-xs font-medium text-text-muted mt-0.5">{activity.service}</p>
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

                <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6 text-left">
                    <h3 className="text-lg font-bold text-text tracking-tight text-left">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg">
                            <Calendar className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Booking</span>
                        </button>
                        <button className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg">
                            <Users className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Staff</span>
                        </button>
                        <button className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg">
                            <TrendingUp className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Sales</span>
                        </button>
                        <button className="p-6 rounded-2xl bg-surface-alt hover:bg-primary text-text hover:text-primary-foreground transition-all border border-border hover:border-primary flex flex-col items-center gap-3 group shadow-sm hover:shadow-lg">
                            <Settings className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                            <span className="text-xs font-bold tracking-tight">Settings</span>
                        </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary text-primary-foreground space-y-3 relative overflow-hidden group shadow-lg shadow-primary/20 text-left">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                            <TrendingUp className="w-20 h-20" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-left">Business Tip</p>
                        <p className="text-sm font-bold tracking-tight leading-snug text-left">Track stylist performance to optimize schedules and boost revenue.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
