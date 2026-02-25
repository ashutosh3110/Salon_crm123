import {
    BarChart3, TrendingUp, Users, DollarSign,
    ArrowUpRight, ArrowDownRight, Award,
    Calendar, ChevronRight, Target
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import { useState } from 'react';

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
    const [timeRange, setTimeRange] = useState('7d');

    const rangeOptions = [
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'This Month', value: 'month' },
        { label: 'This Quarter', value: 'quarter' },
    ];

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
                    <div key={s.label} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <s.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${s.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {s.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {s.change}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={typeof s.value === 'string' ? parseFloat(s.value.replace(/[₹%,]/g, '')) : s.value}
                                        prefix={typeof s.value === 'string' && s.value.includes('₹') ? '₹' : ''}
                                        suffix={typeof s.value === 'string' && s.value.includes('%') ? '%' : ''}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.isUp ? "text-emerald-400" : "text-rose-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-none border border-border/60 p-6 shadow-none">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Revenue Growth</h2>
                    <CustomDropdown
                        options={rangeOptions}
                        value={timeRange}
                        onChange={setTimeRange}
                        className="w-44"
                    />
                </div>

                {(() => {
                    const datasets = {
                        '7d': { points: [32000, 48000, 41000, 67000, 53000, 71000, 62000], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                        '30d': { points: [28000, 35000, 42000, 38000, 55000, 61000, 58000, 70000, 65000, 74000, 80000, 76000, 83000, 78000, 90000, 85000, 88000, 92000, 87000, 95000, 91000, 98000, 94000, 100000, 97000, 103000, 99000, 108000, 104000, 112000], labels: (() => { const d = []; for (let i = 1; i <= 30; i++) d.push(i % 5 === 0 ? `Day ${i}` : ''); return d; })() },
                        'month': { points: [40000, 55000, 48000, 72000, 65000, 80000, 75000, 90000, 85000, 95000, 88000, 102000], labels: ['Jan 1', 'Jan 5', 'Jan 9', 'Jan 13', 'Jan 17', 'Jan 21', 'Jan 25', 'Feb 1', 'Feb 5', 'Feb 9', 'Feb 13', 'Feb 17'] },
                        'quarter': { points: [120000, 145000, 138000, 162000, 175000, 190000, 185000, 210000, 225000, 215000, 240000, 255000], labels: ['Oct', 'Oct', 'Nov', 'Nov', 'Nov', 'Dec', 'Dec', 'Dec', 'Jan', 'Jan', 'Feb', 'Feb'] },
                    };
                    const data = datasets[timeRange] || datasets['7d'];
                    const pts = data.points;
                    const labels = data.labels;
                    const W = 600, H = 200, PAD_L = 56, PAD_R = 16, PAD_T = 16, PAD_B = 32;
                    const chartW = W - PAD_L - PAD_R;
                    const chartH = H - PAD_T - PAD_B;
                    const minV = Math.min(...pts);
                    const maxV = Math.max(...pts);
                    const range = maxV - minV || 1;
                    const toX = (i) => PAD_L + (i / (pts.length - 1)) * chartW;
                    const toY = (v) => PAD_T + chartH - ((v - minV) / range) * chartH;

                    // Smooth bezier path
                    const linePath = pts.map((v, i) => {
                        if (i === 0) return `M ${toX(i)} ${toY(v)}`;
                        const px = toX(i - 1), py = toY(pts[i - 1]);
                        const cx = toX(i), cy = toY(v);
                        const cpx = (px + cx) / 2;
                        return `C ${cpx} ${py}, ${cpx} ${cy}, ${cx} ${cy}`;
                    }).join(' ');

                    const areaPath = linePath + ` L ${toX(pts.length - 1)} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;

                    const gridValues = [minV, minV + range * 0.25, minV + range * 0.5, minV + range * 0.75, maxV];

                    const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;

                    return (
                        <div className="relative w-full">
                            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '220px' }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-primary, #B85C5C)" stopOpacity="0.18" />
                                        <stop offset="100%" stopColor="var(--color-primary, #B85C5C)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Grid lines + Y labels */}
                                {gridValues.map((v, i) => {
                                    const y = toY(v);
                                    return (
                                        <g key={i}>
                                            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />
                                            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="700" fontFamily="inherit">
                                                {fmt(v)}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Area fill */}
                                <path d={areaPath} fill="url(#revGrad)" />

                                {/* Line */}
                                <path d={linePath} fill="none" stroke="var(--color-primary, #B85C5C)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Data points + tooltips */}
                                {pts.map((v, i) => (
                                    <g key={i} className="group" style={{ cursor: 'pointer' }}>
                                        <circle cx={toX(i)} cy={toY(v)} r="8" fill="transparent" />
                                        <circle cx={toX(i)} cy={toY(v)} r="4" fill="white" stroke="var(--color-primary, #B85C5C)" strokeWidth="2" />
                                        {/* Tooltip */}
                                        <g opacity="0" className="chart-tooltip" style={{ pointerEvents: 'none' }}>
                                            <rect x={toX(i) - 28} y={toY(v) - 28} width="56" height="20" rx="0" fill="#1a1a2e" />
                                            <text x={toX(i)} y={toY(v) - 14} textAnchor="middle" fontSize="9" fill="white" fontWeight="800">
                                                {fmt(v)}
                                            </text>
                                        </g>
                                    </g>
                                ))}

                                {/* X-axis labels — show only every nth label */}
                                {labels.map((lbl, i) => {
                                    const step = Math.max(1, Math.floor(labels.length / 7));
                                    if (i % step !== 0 && i !== labels.length - 1) return null;
                                    if (!lbl) return null;
                                    return (
                                        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="700" fontFamily="inherit">
                                            {lbl}
                                        </text>
                                    );
                                })}
                            </svg>

                            {/* CSS-based hover tooltips */}
                            <style>{`
                                    svg g.group:hover .chart-tooltip { opacity: 1; }
                                    svg g.group:hover circle[r="4"] { r: 5.5; }
                                `}</style>
                        </div>
                    );
                })()}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
                {/* Top Performers */}
                <div className="bg-white rounded-none border border-border/60 p-6 shadow-none">
                    <div className="flex items-center gap-2 mb-6">
                        <Award className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Team Rankings</h2>
                    </div>
                    <div className="space-y-4">
                        {topPerformers.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-none bg-white border border-border/40 hover:border-primary/20 transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-none relative">
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
                    <button className="w-full mt-6 py-2.5 bg-white border border-border/60 rounded-none text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
}
