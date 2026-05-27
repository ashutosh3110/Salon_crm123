import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Users, Calendar, Search, Globe, ArrowUpRight, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';

const defaultWeek = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, revenue: 0, appointments: 0 }));

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

    const loadDashboard = useCallback(async () => {
        setError(null);
        try {
            const res = await api.get('/dashboard/salon');
            if (res.data?.success) {
                setPayload(res.data.data);
                const s = res.data.data?.stats || {};
                if (s.whatsappCredits !== undefined && Number(s.whatsappCredits) <= 200) {
                    const alertShown = sessionStorage.getItem('low_whatsapp_credit_alert_shown');
                    if (!alertShown) {
                        setShowLowCreditAlert(true);
                        sessionStorage.setItem('low_whatsapp_credit_alert_shown', 'true');
                    }
                }
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
        const interval = setInterval(loadDashboard, 60000);
        return () => clearInterval(interval);
    }, [loadDashboard]);

    const revenueData = useMemo(() => {
        return payload?.revenueWeek || defaultWeek();
    }, [payload]);

    const serviceDistribution = useMemo(() => {
        return payload?.serviceDistribution || [];
    }, [payload]);

    const activeStats = useMemo(() => {
        const s = payload?.stats || {};
        const credits = s.whatsappCredits ?? 0;
        return [
            { label: 'Total Outlets', value: s.outlets ?? 0, trend: 'Outlets', positive: true, icon: Globe, path: '/admin/outlets' },
            { label: 'Total Bookings', value: s.bookingsTotal ?? 0, trend: 'Bookings', positive: true, icon: Calendar, path: '/admin/bookings' },
            { label: 'Active Clients', value: s.clients ?? 0, trend: 'CRM', positive: true, icon: Users, path: '/admin/crm/customers' },
            { label: 'Staff Members', value: s.staff ?? 0, trend: 'Team', positive: true, icon: TrendingUp, path: '/admin/staff' },
            { label: 'WhatsApp Credits', value: credits, trend: credits <= 200 ? 'Low Credits' : 'WhatsApp', positive: credits > 200, icon: MessageSquare, path: '/admin/whatsapp-credits' },
        ];
    }, [payload]);

    const liveRecentActivity = useMemo(() => payload?.recentActivity || [], [payload]);

    const filteredRecentActivity = useMemo(() => {
        if (!searchQuery.trim()) return liveRecentActivity;
        const q = searchQuery.toLowerCase();
        return liveRecentActivity.filter(activity =>
            activity.client?.toLowerCase().includes(q) ||
            activity.service?.toLowerCase().includes(q) ||
            activity.amount?.toString().includes(q)
        );
    }, [liveRecentActivity, searchQuery]);

    if (loading) return <div className="p-8 text-center text-text-muted">Loading Dashboard...</div>;

    return (
        <div className="space-y-6 animate-reveal font-sans">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-text tracking-tight">Welcome Back</h1>
                    <p className="text-[10px] font-bold text-text-muted mt-1.5 tracking-wide uppercase">Real-time Analytics Dashboard</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {activeStats.map((stat, i) => (
                    <Link
                        to={stat.path}
                        key={i}
                        className="bg-surface py-4 px-5 rounded-2xl border border-border shadow-sm group relative overflow-hidden transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 active:scale-[0.98]"
                    >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                                        <stat.icon className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">{stat.label}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-text"><AnimatedCounter value={stat.value} prefix={stat.prefix} /></h3>
                                <div className={`text-[9px] font-black ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-bold text-text tracking-tight">Revenue Trends (Weekly)</h2>
                        <Link to="/admin/finance/dashboard" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="h-[280px] w-full min-w-0 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Area type="monotone" dataKey="revenue" stroke="#8B6F23" strokeWidth={3} fill="#8B6F23" fillOpacity={0.1} />
                                <Tooltip />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-bold text-text tracking-tight">Service Split</h2>
                        <Link to="/admin/hr/performance" className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="h-[200px] w-full min-w-0 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie data={serviceDistribution} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={8}>
                                    {serviceDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 text-left">
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div className="px-4 sm:px-6 py-4.5 border-b border-border bg-surface-alt/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <h3 className="text-base font-bold text-text tracking-tight">Recent Activity Stream</h3>
                        <Link to="/pos/invoices" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest hover:underline whitespace-nowrap">
                            View All Invoices <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-border/50 text-left">
                        {filteredRecentActivity.map((activity, i) => (
                            <div key={i} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-surface-alt/30 transition-colors">
                                <div className="flex items-center gap-3 sm:gap-4 text-left">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl border flex items-center justify-center font-bold ${activity.isLive ? 'border-primary text-primary' : 'border-border text-text-muted'}`}>{activity.client ? activity.client[0] : 'G'}</div>
                                    <div className="text-left min-w-0">
                                        <p className="text-[13px] sm:text-[14px] font-bold text-text truncate">{activity.client}</p>
                                        <p className="text-[11px] sm:text-xs text-text-muted font-medium truncate">{activity.service}</p>
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto text-left sm:text-right pl-11 sm:pl-0">
                                    <p className="text-[11px] sm:text-xs font-black text-text uppercase">{activity.amount}</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        {filteredRecentActivity.length === 0 && (
                            <div className="p-6 text-center text-text-muted">No matching activities found</div>
                        )}
                    </div>
                </div>
            </div>

            {showLowCreditAlert && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl relative overflow-hidden border border-rose-200 dark:border-rose-900 p-6 sm:p-8 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900 rounded-xl">
                                <MessageSquare className="w-8 h-8 animate-bounce text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">Low WhatsApp Credits</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Critical system warning</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-relaxed uppercase">
                                Your salon has only <span className="text-rose-600 dark:text-rose-400 font-black">{payload?.stats?.whatsappCredits}</span> WhatsApp credits remaining. 
                            </p>
                            <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider leading-relaxed">
                                Once credits run out, automated service reminders, wallet notifications, and promotion sharing will stop working. Please recharge your credits immediately.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-8 mt-4 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setShowLowCreditAlert(false)} 
                                className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                            >
                                Dismiss
                            </button>
                            <Link 
                                to="/admin/whatsapp-credits" 
                                onClick={() => setShowLowCreditAlert(false)}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg rounded-xl text-center flex items-center justify-center transition-all"
                            >
                                Recharge Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
