import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight, Search, Settings, CreditCard, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import mockApi from '../../services/mock/mockApi';

const defaultWeek = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, revenue: 0, appointments: 0 }));

export default function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);

    const loadDashboard = useCallback(async () => {
        setError(null);
        try {
            const res = await mockApi.get('/dashboard/salon');
            if (res.data?.success) {
                setPayload(res.data.data);
            } else {
                setPayload(res.data);
            }
        } catch (e) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const revenueData = useMemo(() => {
        return payload?.revenueWeek || defaultWeek();
    }, [payload]);

    const serviceDistribution = useMemo(() => {
        return payload?.serviceDistribution || [];
    }, [payload]);

    const activeStats = useMemo(() => {
        const s = payload?.stats || {};
        return [
            { label: 'Total Outlets', value: s.outlets ?? 0, trend: 'Outlets', positive: true, icon: Globe },
            { label: 'Appointments', value: s.bookingsTotal ?? 0, trend: 'Bookings', positive: true, icon: Calendar },
            { label: 'Active Clients', value: s.clients ?? 0, trend: 'CRM', positive: true, icon: Users },
            { label: 'Staff Members', value: s.staff ?? 0, trend: 'Team', positive: true, icon: TrendingUp },
            { label: 'Wallet Liability', value: Math.round(s.walletLiability ?? 0), prefix: '₹', trend: 'Loyalty', positive: false, icon: CreditCard },
        ];
    }, [payload]);

    const liveRecentActivity = useMemo(() => payload?.recentActivity || [], [payload]);

    return (
        <div className="space-y-6 animate-reveal font-sans">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-4xl font-bold text-text tracking-tight">Welcome Back</h1>
                    <p className="text-sm font-medium text-text-muted mt-2 tracking-wide uppercase">Offline Mode · Syncing Mock Protocol</p>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search entries..." className="w-full lg:min-w-[300px] pl-12 pr-4 py-3.5 rounded-xl bg-surface border border-border text-sm font-medium outline-none" />
                    </div>
                </div>
            </div>

            <div className="responsive-grid-5">
                {activeStats.map((stat, i) => (
                    <div key={i} className="bg-surface py-7 px-7 rounded-2xl border border-border shadow-sm group relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                        <stat.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-bold text-text"><AnimatedCounter value={stat.value} prefix={stat.prefix} /></h3>
                                <div className={`text-[10px] font-black ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <h2 className="text-lg font-bold text-text tracking-tight mb-8">Revenue Trends (Weekly)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Area type="monotone" dataKey="revenue" stroke="#8B1A2D" strokeWidth={3} fill="#8B1A2D" fillOpacity={0.1} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <h2 className="text-lg font-bold text-text tracking-tight mb-8">Service Split</h2>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={serviceDistribution} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={8}>
                                    {serviceDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-border bg-surface-alt/10 text-left"><h3 className="text-lg font-bold text-text tracking-tight">Recent Activity Stream</h3></div>
                    <div className="divide-y divide-border/50 text-left">
                        {liveRecentActivity.map((activity, i) => (
                            <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors">
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold ${activity.isLive ? 'border-primary text-primary' : 'border-border text-text-muted'}`}>{activity.client[0]}</div>
                                    <div className="text-left">
                                        <p className="text-[15px] font-bold text-text">{activity.client}</p>
                                        <p className="text-xs text-text-muted font-medium">{activity.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-text uppercase">{activity.amount}</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6 text-left">
                    <h3 className="text-lg font-bold text-text text-left">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/pos/billing')} className="p-6 rounded-2xl bg-primary text-white flex flex-col items-center gap-3 shadow-lg shadow-primary/20"><CreditCard className="w-5 h-5" /><span className="text-[10px] font-black uppercase tracking-widest">Create Bill</span></button>
                        <Link to="/admin/bookings" className="p-6 rounded-2xl bg-surface border border-border flex flex-col items-center gap-3"><Calendar className="w-5 h-5" /><span className="text-xs font-bold">Booking</span></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
