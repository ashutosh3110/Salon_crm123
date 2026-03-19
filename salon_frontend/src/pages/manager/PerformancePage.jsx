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
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-text tracking-tight uppercase leading-none">Performance Analytics</h1>
                    <p className="text-[8px] sm:text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.3em] opacity-60 leading-none">Intelligence :: vector_scoring_v2.0</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-surface py-2.5 px-3 sm:py-3 sm:px-4 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative text-left">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                    <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[9px] sm:text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className={`flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-bold ${s.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {s.isUp ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
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

            {/* Revenue Chart */}
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

                <div className="w-full">
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
                        const W = 600, H = 240, PAD_L = 50, PAD_R = 10, PAD_T = 20, PAD_B = 40;
                        const chartW = W - PAD_L - PAD_R;
                        const chartH = H - PAD_T - PAD_B;
                        const minV = Math.min(...pts) * 0.9;
                        const maxV = Math.max(...pts) * 1.1;
                        const range = maxV - minV || 1;
                        const toX = (i) => PAD_L + (i / (pts.length - 1)) * chartW;
                        const toY = (v) => PAD_T + chartH - ((v - minV) / range) * chartH;

                        const linePath = pts.map((v, i) => {
                            if (i === 0) return `M ${toX(i)} ${toY(v)}`;
                            const px = toX(i - 1), py = toY(pts[i - 1]);
                            const cx = toX(i), cy = toY(v);
                            const cpx = (px + cx) / 2;
                            return `C ${cpx} ${py}, ${cpx} ${cy}, ${cx} ${cy}`;
                        }).join(' ');

                        const areaPath = linePath + ` L ${toX(pts.length - 1)} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;
                        const gridValues = [minV, minV + range * 0.33, minV + range * 0.66, maxV];
                        const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

                        return (
                            <div className="relative w-full overflow-hidden">
                                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {gridValues.map((v, i) => {
                                        const y = toY(v);
                                        return (
                                            <g key={i}>
                                                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
                                                <text x={PAD_L - 8} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontWeight="800" fontFamily="inherit">
                                                    {fmt(v)}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    <path d={areaPath} fill="url(#revGrad)" />
                                    <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                    {pts.map((v, i) => (
                                        <g key={i} className="group" style={{ cursor: 'pointer' }}>
                                            <circle cx={toX(i)} cy={toY(v)} r="8" fill="transparent" />
                                            <circle cx={toX(i)} cy={toY(v)} r="3.5" fill="var(--surface)" stroke="var(--color-primary)" strokeWidth="2" />
                                            <g opacity="0" className="chart-tooltip" style={{ pointerEvents: 'none' }}>
                                                <rect x={toX(i) - 30} y={toY(v) - 32} width="60" height="20" fill="var(--text)" />
                                                <text x={toX(i)} y={toY(v) - 18} textAnchor="middle" fontSize="9" fill="var(--surface)" fontWeight="900" textTransform="uppercase">
                                                    {fmt(v)}
                                                </text>
                                            </g>
                                        </g>
                                    ))}

                                    {labels.map((lbl, i) => {
                                        const step = Math.max(1, Math.floor(labels.length / 8));
                                        if (i % step !== 0 && i !== labels.length - 1) return null;
                                        if (!lbl) return null;
                                        return (
                                            <text key={i} x={toX(i)} y={H - 10} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="800" fontFamily="inherit" textTransform="uppercase">
                                                {lbl}
                                            </text>
                                        );
                                    })}
                                </svg>
                                <style>{`
                                    svg g.group:hover .chart-tooltip { opacity: 1; }
                                    svg g.group:hover circle[r="3.5"] { r: 5; fill: var(--color-primary); }
                                `}</style>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Top Performers */}
                <div className="bg-white rounded-none border border-border/60 p-4 shadow-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <h2 className="text-[11px] font-black text-text uppercase tracking-widest leading-none">Team Rankings</h2>
                    </div>
                    <div className="space-y-4">
                        {topPerformers.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-none bg-white border border-border/40 hover:border-primary/20 transition-all cursor-pointer">
                                <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-none relative text-[11px]">
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
                    <button className="w-full mt-4 py-2 bg-white border border-border/60 rounded-none text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
}
