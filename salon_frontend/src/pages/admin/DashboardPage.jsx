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
    MoreVertical
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const stats = [
    { label: 'Total Revenue', value: 128450, prefix: '₹', trend: '+14.5%', positive: true, icon: DollarSign },
    { label: 'Total Appointments', value: 842, prefix: '', trend: '+8.2%', positive: true, icon: Calendar },
    { label: 'Active Clients', value: 3240, prefix: '', trend: '+22.4%', positive: true, icon: Users },
    { label: 'Avg. Rating', value: 4.8, prefix: '', suffix: '/5', trend: 'Stable', positive: true, icon: TrendingUp },
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Welcome Back, Admin</h1>
                    <p className="text-sm text-text-secondary mt-1">Here's what's happening in your salons today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all input-expand"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:shadow-xl transition-all card-interactive hover-shine">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-text mt-2 tracking-tight">
                            <AnimatedCounter
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                            />
                        </h3>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden card-interactive">
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-text">Live Salon Activity</h3>
                        <button className="text-primary text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-border">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center font-bold text-text-secondary group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {activity.client[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text">{activity.client}</p>
                                        <p className="text-xs text-text-secondary">{activity.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-text">{activity.amount}</p>
                                    <p className="text-[10px] text-text-muted font-medium">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6 card-interactive">
                    <h3 className="font-bold text-text">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 rounded-xl bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 flex flex-col items-center gap-2 group">
                            <Calendar className="w-6 h-6 text-text-muted group-hover:text-primary" />
                            <span className="text-xs font-bold">Booking</span>
                        </button>
                        <button className="p-4 rounded-xl bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 flex flex-col items-center gap-2 group">
                            <Users className="w-6 h-6 text-text-muted group-hover:text-primary" />
                            <span className="text-xs font-bold">Staff</span>
                        </button>
                        <button className="p-4 rounded-xl bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 flex flex-col items-center gap-2 group">
                            <TrendingUp className="w-6 h-6 text-text-muted group-hover:text-primary" />
                            <span className="text-xs font-bold">Sales</span>
                        </button>
                        <button className="p-4 rounded-xl bg-surface hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20 flex flex-col items-center gap-2 group">
                            <Settings className="w-6 h-6 text-text-muted group-hover:text-primary" />
                            <span className="text-xs font-bold">Settings</span>
                        </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary text-white space-y-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <p className="text-xs font-medium opacity-80">Pro Tip</p>
                        <p className="text-sm font-bold leading-snug">Track your most popular stylists to optimize scheduling.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
