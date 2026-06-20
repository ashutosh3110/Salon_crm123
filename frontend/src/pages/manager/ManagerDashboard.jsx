import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Star, Target, Clock, Award, ArrowUpRight, RefreshCw } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Cell,
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';

export default function ManagerDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.get('/dashboard/manager');
            const body = res.data?.data ?? res.data;
            setData(body || null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const topCards = useMemo(() => {
        const o = data?.overview;
        if (!o) return [];
        return [
            { 
                label: 'Active Staff', 
                value: o.activeStaff, 
                icon: Users, 
                kind: 'int',
                changeText: 'Live',
                iconColorClass: '!text-[#7C3AED] dark:!text-[#A78BFA]',
                iconBgClass: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15 hover:!border-[#D8B4FE] dark:hover:!border-[#A78BFA]/50'
            },
            { 
                label: 'Present Today', 
                value: o.presentToday, 
                icon: Clock, 
                kind: 'int',
                changeText: 'Live',
                iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50'
            },
            { 
                label: 'Avg Rating', 
                value: o.avgRating, 
                icon: Star, 
                kind: 'rating',
                changeText: 'Live',
                iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50'
            },
            { 
                label: 'Monthly Target', 
                value: o.monthlyTargetPercent, 
                icon: Target, 
                kind: 'percent',
                changeText: 'Live',
                iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50'
            },
        ];
    }, [data]);

    const staffPerformance = data?.staffPerformance || [];
    const performanceComparison = data?.performanceComparison || [];
    const recentFeedback = data?.recentFeedback || [];
    const period = data?.period;

    return (
        <div className="space-y-6 font-black text-left animate-reveal">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 text-left font-black">
                <div className="leading-none">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Operations Hub</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">
                        Live data ·{' '}
                        {period
                            ? `${period.startDate} → ${period.endDate}`
                            : 'Month to date'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => load()}
                        className="px-3 py-2 border border-border bg-surface text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-primary hover:text-primary transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface border border-border shadow-sm flex items-center gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-none bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] sm:text-[10px] font-black text-text uppercase tracking-widest">
                            {loading ? 'Loading…' : error ? 'Check connection' : 'Connected'}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 text-[10px] font-black uppercase text-rose-600 tracking-wide">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(loading && !data ? Array.from({ length: 4 }) : topCards).map((s, idx) => {
                    const fallback = !s;
                    return (
                        <div
                            key={s?.label || idx}
                            className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${s?.cardBgClass || 'bg-surface'} ${s?.cardBorderClass || 'border-border'}`}
                        >
                            <div className="flex !items-start gap-3 !text-left">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s?.iconBgClass || 'bg-surface-alt'}`} style={{ borderRadius: '12px' }}>
                                    {s?.icon ? (
                                        <s.icon className={`w-4 h-4 ${s?.iconColorClass || 'text-text-muted'}`} strokeWidth={2} />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full bg-border animate-pulse" />
                                    )}
                                </div>
                                <div className="flex flex-col !items-start !text-left">
                                    <span
                                        style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}
                                        className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left"
                                    >
                                        {s?.label || '—'}
                                    </span>
                                    <h3
                                        style={{ fontSize: '24px', fontWeight: 850 }}
                                        className="text-slate-800 dark:text-slate-50 leading-none tracking-tight !text-left"
                                    >
                                        {fallback ? (
                                            <span className="text-text-muted">—</span>
                                        ) : s?.kind === 'rating' ? (
                                            s.value != null ? (
                                                <span>{Number(s.value).toFixed(1)}</span>
                                            ) : (
                                                <span className="text-text-muted">—</span>
                                            )
                                        ) : s?.kind === 'percent' ? (
                                            <AnimatedCounter value={Number(s.value) || 0} suffix="%" />
                                        ) : (
                                            <AnimatedCounter value={Number(s.value) || 0} />
                                        )}
                                    </h3>
                                </div>
                            </div>
                            
                            <div
                                style={{ fontSize: '11px', fontWeight: 700 }}
                                className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-90 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start"
                            >
                                <ArrowUpRight className={`w-3.5 h-3.5 ${s?.iconColorClass || 'text-text-muted'}`} />
                                <span className={s?.iconColorClass || 'text-text-muted'}>{s?.changeText || 'Live'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 text-left font-black">
                <div className="lg:col-span-2 bg-surface p-5 sm:p-8 !rounded-[16px] border border-border shadow-sm text-left overflow-hidden">
                    <h2 className="text-[9px] sm:text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 sm:mb-8 text-left">Staff efficiency radar</h2>
                    <div className="h-[280px] sm:h-[400px] w-full text-left font-black">
                        {performanceComparison.length > 0 && performanceComparison[0].subject !== '—' ? (
                            <div className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performanceComparison}>
                                        <PolarGrid stroke="var(--border)" opacity={0.3} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                        <Radar name="Revenue" dataKey="Revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                        <Radar name="Efficiency" dataKey="Efficiency" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0px',
                                                fontSize: '9px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-text-muted tracking-widest">
                                {loading ? 'Loading…' : 'No staff performance data yet'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-surface p-5 sm:p-8 !rounded-[16px] border border-border shadow-sm flex flex-col text-left overflow-hidden">
                    <h2 className="text-[9px] sm:text-[11px] font-black text-text uppercase tracking-[0.2em] mb-6 sm:mb-8 text-left">Revenue targets</h2>
                    <div className="flex-1 min-h-[280px] sm:min-h-[300px] text-left">
                        {staffPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={staffPerformance} layout="vertical" margin={{ left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={70}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '9px',
                                            fontWeight: '900',
                                        }}
                                    />
                                    <Bar dataKey="target" fill="var(--primary)" barSize={10}>
                                        {staffPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.target >= 80 ? 'var(--primary)' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-text-muted">
                                {loading ? 'Loading…' : 'No data'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white !rounded-[16px] border border-border overflow-hidden shadow-sm text-left">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border bg-surface-alt/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                    <h2 className="text-xs sm:text-[11px] font-black text-text uppercase tracking-widest text-left">Staff performance metrics</h2>
                    <span className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface border border-border/20 px-3 py-1 drop-shadow-sm w-fit">
                        {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'}
                    </span>
                </div>
                <div className="w-full overflow-x-auto custom-scrollbar text-left font-black">
                    <table className="w-full text-sm text-left min-w-[650px] table-fixed">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border">
                                <th className="w-[25%] !text-left px-4 sm:px-5 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="w-[15%] !text-center px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                                <th className="w-[15%] !text-center px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Services</th>
                                <th className="w-[15%] !text-center px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Yield</th>
                                <th className="w-[15%] !text-center px-3 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Rating</th>
                                <th className="w-[15%] !text-center px-4 sm:px-5 py-3 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 !text-left font-black">
                            {staffPerformance.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 !text-center text-[10px] font-black uppercase text-text-muted">
                                        No completed services in this period
                                    </td>
                                </tr>
                            ) : (
                                staffPerformance.map((s) => (
                                    <tr key={s.id} className="hover:bg-surface/30 transition-colors !text-left font-black">
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 !text-left">
                                            <div className="flex items-center gap-3 !text-left">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/10 shrink-0">
                                                    {(s.name || '?').charAt(0)}
                                                </div>
                                                <span className="font-black text-text uppercase text-[11px] sm:text-xs">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase !text-center">{s.role}</td>
                                        <td className="px-3 py-3 sm:py-4 !text-center font-black text-text uppercase text-[11px] sm:text-xs">{s.services}</td>
                                        <td className="px-3 py-3 sm:py-4 !text-center font-black text-text uppercase text-[11px] sm:text-xs">
                                            ₹{(Number(s.revenue) / 1000).toFixed(1)}k
                                        </td>
                                        <td className="px-3 py-3 sm:py-4 !text-center font-black">
                                            <div className="flex items-center !justify-center gap-1 font-black">
                                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" />
                                                <span className="font-black text-text text-[11px] sm:text-xs">
                                                    {s.rating != null ? s.rating : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-5 py-3 sm:py-4 !text-center font-black">
                                            <div className="flex items-center !justify-center gap-2 sm:gap-3 font-black">
                                                <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-surface-alt rounded-none overflow-hidden border border-border/20">
                                                    <div
                                                        className={`h-full rounded-none ${s.target >= 80 ? 'bg-emerald-500' : s.target >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${Math.min(100, s.target)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] sm:text-[10px] font-black text-text w-7 sm:w-8 !text-left">{s.target}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white !rounded-[16px] border border-border shadow-sm text-left font-black">
                <div className="px-5 py-4 border-b border-border bg-white text-left font-black">
                    <h2 className="text-[11px] font-black text-text uppercase tracking-widest text-left">Recent feedback</h2>
                </div>
                <div className="divide-y divide-border/40 text-left overflow-hidden">
                    {recentFeedback.length === 0 && !loading ? (
                        <div className="p-8 text-center text-[10px] font-black uppercase text-text-muted tracking-widest">No feedback yet</div>
                    ) : (
                        recentFeedback.map((fb) => (
                            <div key={fb.id} className="p-4 sm:px-8 sm:py-5 hover:bg-surface-alt/20 transition-colors text-left font-black">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-left">
                                    <p className="text-xs font-black text-text uppercase tracking-tight text-left">{fb.customer}</p>
                                    <div className="flex items-center gap-0.5 text-left font-black">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-border'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[11px] sm:text-xs text-text-muted font-bold not-italic text-left leading-relaxed">&quot;{fb.comment}&quot;</p>
                                <div className="flex items-center gap-2 mt-3 text-left font-black">
                                    <Award className="w-3 h-3 text-primary" />
                                    <p className="text-[9px] sm:text-[10px] text-text-muted font-black uppercase tracking-widest text-left">
                                        — Serviced by <span className="text-primary">{fb.stylist}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
