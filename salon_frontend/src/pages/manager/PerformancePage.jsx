import {
    BarChart3, TrendingUp, Users, DollarSign,
    ArrowUpRight, ArrowDownRight, Award,
    Calendar, ChevronRight, Target, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function PerformancePage() {
    const [timeRange, setTimeRange] = useState('7d');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPerformance = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: res } = await api.get('/dashboard/manager');
            setData(res?.data || res);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load performance data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPerformance();
    }, [fetchPerformance]);

    const rangeOptions = [
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Synchronizing :: vector_data</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <p className="text-rose-500 font-bold mb-4">{error}</p>
                <button 
                    onClick={fetchPerformance}
                    className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const overview = data?.overview || {};
    const staffPerformance = data?.staffPerformance || [];
    const revenueGrowth = data?.revenueGrowth || [];

    const stats = [
        { 
            label: 'Active Staff', 
            value: overview.activeStaff || 0, 
            change: '+0%', 
            isUp: true, 
            icon: Users, 
            color: 'text-primary' 
        },
        { 
            label: 'Present Today', 
            value: overview.presentToday || 0, 
            change: 'Live', 
            isUp: true, 
            icon: Calendar, 
            color: 'text-amber-500' 
        },
        { 
            label: 'Avg Rating', 
            value: overview.avgRating || '0.0', 
            change: 'MTD', 
            isUp: true, 
            icon: StarBadge, 
            color: 'text-emerald-500' 
        },
        { 
            label: 'Target Achievement', 
            value: `${overview.monthlyTargetPercent || 0}%`, 
            change: 'Goal', 
            isUp: true, 
            icon: Target, 
            color: 'text-blue-500' 
        },
    ];

    const chartData = revenueGrowth.map(pt => ({
        label: pt.day,
        value: pt.revenue
    }));

    const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-text tracking-tight uppercase leading-none">Performance Analytics</h1>
                    <p className="text-[8px] sm:text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.3em] opacity-60 leading-none">Intelligence :: vector_scoring_v2.0</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-surface py-2.5 px-3 sm:py-3 sm:px-4 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative text-left">
                        <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                    <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[9px] sm:text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className={`flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-bold ${s.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {s.change}
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-text tracking-tight uppercase leading-none">
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

            <div className="bg-white rounded-none border border-border/60 p-3 sm:p-4 shadow-none overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-[10px] sm:text-[11px] font-black text-text uppercase tracking-widest leading-none">Revenue Growth</h2>
                    <CustomDropdown
                        options={rangeOptions}
                        value={timeRange}
                        onChange={setTimeRange}
                        className="w-full sm:w-36 h-8 text-[10px]"
                    />
                </div>

                <div className="w-full h-[300px] mt-4">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                            No transaction records found
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                    tickFormatter={fmt}
                                    width={45}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--text)',
                                        border: 'none',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        color: 'var(--surface)'
                                    }}
                                    itemStyle={{ color: 'var(--primary)' }}
                                    formatter={(v) => [fmt(v), 'REVENUE']}
                                    labelStyle={{ display: 'none' }}
                                    cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                    activeDot={{ r: 6, stroke: 'var(--surface)', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white rounded-none border border-border/60 p-4 shadow-none lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <h2 className="text-[11px] font-black text-text uppercase tracking-widest leading-none">Team Performance Rankings</h2>
                    </div>
                    <div className="space-y-3">
                        {staffPerformance.length === 0 ? (
                            <p className="text-[10px] font-black text-text-muted uppercase text-center py-8">No personnel metrics recorded</p>
                        ) : (
                            staffPerformance.slice(0, 5).map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-none bg-white border border-border/40 hover:border-primary/20 transition-all group cursor-pointer">
                                    <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-none relative text-[11px]">
                                        {(p.name || '?').split(' ').map(n => n[0]).join('')}
                                        {i === 0 && (
                                            <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-1 shadow-sm">
                                                <Award className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{p.name}</p>
                                        <p className="text-[11px] text-text-muted font-medium">{p.services} services completed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-text">₹{Number(p.revenue || 0).toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-1">
                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                <StarBadge className="w-2.5 h-2.5 fill-current" />
                                                <span className="text-[10px] font-bold">{p.rating || '0.0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StarBadge({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
