import { useState, useMemo } from 'react';
import {
    Calendar, Users, Clock, Star, TrendingUp, Scissors,
    CheckCircle2, Play, AlertCircle, ArrowRight, Activity,
    Zap, Target, Award, MapPin, Search, Filter, RefreshCw,
    X, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

// ── Mock Data & Constants ────────────────────────────────────────────────
const PERFORMANCE_DATA = [
    { day: 'MON', value: 4500, count: 5 },
    { day: 'TUE', value: 5200, count: 6 },
    { day: 'WED', value: 3800, count: 4 },
    { day: 'THU', value: 6100, count: 7 },
    { day: 'FRI', value: 7500, count: 9 },
    { day: 'SAT', value: 8900, count: 11 },
    { day: 'SUN', value: 4200, count: 5 },
];

const INITIAL_SCHEDULE = [
    { id: 1, time: '10:00 AM', customer: 'PRIYA SHARMA', service: 'HAIR CUT + BLOW DRY', duration: '45 MIN', status: 'completed', sector: 'STATION_04' },
    { id: 2, time: '11:00 AM', customer: 'MEERA PATEL', service: 'HAIR COLOUR (GLOBAL)', duration: '90 MIN', status: 'in-progress', sector: 'STATION_02' },
    { id: 3, time: '12:30 PM', customer: 'SNEHA REDDY', service: 'HAIR SPA', duration: '60 MIN', status: 'upcoming', sector: 'STATION_04' },
    { id: 4, time: '02:00 PM', customer: 'RITU SINGH', service: 'KERATIN TREATMENT', duration: '120 MIN', status: 'upcoming', sector: 'STATION_01' },
    { id: 5, time: '04:00 PM', customer: 'KAVYA IYER', service: 'HAIR CUT + STYLING', duration: '45 MIN', status: 'upcoming', sector: 'STATION_03' },
];

const STATUS_MAP = {
    'completed': { label: 'FULFILLED', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'in-progress': { label: 'ACTIVE_RUN', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    'upcoming': { label: 'QUEUED', color: 'text-text-muted', bg: 'bg-surface-alt', border: 'border-border/40' },
    'cancelled': { label: 'TERMINATED', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

export default function StylistDashboard() {
    const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
    const [isShiftActive, setIsShiftActive] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const stats = useMemo(() => ({
        revenue: 4250,
        target: 10000,
        efficiency: 94,
        rating: 4.8
    }), []);

    const [selectedApt, setSelectedApt] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const updateStatus = (id, newStatus) => {
        setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        showToast(`Protocol Status Update: ${STATUS_MAP[newStatus].label}`);
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header / Operation Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-background border border-border p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isShiftActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Operation_Pulse</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsShiftActive(!isShiftActive);
                                    showToast(isShiftActive ? 'Manual Shift Termination Initiated' : 'Operation Initialization Successful');
                                }}
                                className={`px-6 py-2 border text-[9px] font-black uppercase tracking-[0.2em] transition-all
                                    ${isShiftActive
                                        ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                                        : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                            >
                                {isShiftActive ? 'Terminate_Shift' : 'Initialize_Shift'}
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-end gap-10">
                            <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Session_Yield</p>
                                <h2 className="text-5xl font-black text-text tracking-tighter">₹{stats.revenue.toLocaleString()}</h2>
                            </div>
                            <div className="flex-1 w-full space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <span>Target_Acquisition</span>
                                    <span className="text-primary">{Math.round((stats.revenue / stats.target) * 100)}%</span>
                                </div>
                                <div className="h-4 bg-surface border border-border p-0.5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.revenue / stats.target) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-border p-8 flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Unit_Diagnostics</span>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold">Latency_Avg</p>
                                    <p className="text-xl font-black text-text">0.4 ms</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold">Sync_Rate</p>
                                    <p className="text-xl font-black text-emerald-500">99.9%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold">Node_Efficiency</p>
                                    <p className="text-xl font-black text-text">{stats.efficiency}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold">Reputation_Index</p>
                                    <div className="flex items-center gap-1 font-black text-xl text-primary">
                                        <Star className="w-4 h-4 fill-primary" /> {stats.rating}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border/10 flex items-center justify-between">
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.3em]">Device_Authorized</span>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Matrix & Fulfillment Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Fulfillment Matrix (Schedule) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface border border-border px-6 py-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Fulfillment_Matrix</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="SCAN_OBJECTS..."
                                    className="bg-background border border-border pl-10 pr-4 py-2 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all w-full md:w-64"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="p-2 border border-border hover:bg-surface-alt transition-all group">
                                <Filter className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="divide-y divide-border/10">
                            {schedule
                                .filter(s => s.customer.toLowerCase().includes(searchTerm.toLowerCase()) || s.service.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((apt) => (
                                    <div key={apt.id} className="p-6 group hover:bg-surface-alt/50 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            <div className="w-20 shrink-0">
                                                <p className="text-lg font-black text-text leading-none tracking-tighter">{apt.time.split(' ')[0]}</p>
                                                <p className="text-[9px] text-text-muted uppercase mt-1 tracking-[0.3em] font-bold italic">{apt.time.split(' ')[1]}</p>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{apt.customer}</h4>
                                                    <div className="bg-primary/5 px-2 py-0.5 border border-primary/10 text-[8px] text-primary font-black">
                                                        {apt.sector}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-bold">
                                                    {apt.service} <span className="mx-2 opacity-30">|</span> {apt.duration}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-2 border text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${STATUS_MAP[apt.status].bg} ${STATUS_MAP[apt.status].color} ${STATUS_MAP[apt.status].border}`}>
                                                    {STATUS_MAP[apt.status].label}
                                                </div>

                                                <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all animate-in slide-in-from-right-1">
                                                    {apt.status === 'upcoming' && (
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'in-progress')}
                                                            className="p-2.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 active:scale-95"
                                                            title="Launch_Protocol"
                                                        >
                                                            <Play className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    {apt.status === 'in-progress' && (
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'completed')}
                                                            className="p-2.5 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/5 active:scale-95"
                                                            title="Finalize_Protocol"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setSelectedApt(apt)}
                                                        className="p-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-alt transition-all active:scale-95"
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Performance Vectors (Graphs) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border p-6 h-full flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target className="w-24 h-24 text-primary" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Yield_Projection</span>
                            </div>
                            <RefreshCw
                                onClick={() => showToast("Calibrating Yield Vectors...")}
                                className="w-3.5 h-3.5 text-text-muted cursor-pointer hover:rotate-180 transition-transform duration-500 hover:text-primary"
                            />
                        </div>

                        <div className="flex-1 min-h-[250px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PERFORMANCE_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 8, fontWeight: 900 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(var(--primary-rgb), 0.1)' }}
                                        contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0', fontSize: '10px', color: 'var(--text)', fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="value" fill="var(--primary)" barSize={14}>
                                        {PERFORMANCE_DATA.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 5 ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.15)'}
                                                className="transition-all hover:opacity-80"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-5 bg-background border border-border group/tile hover:border-primary/30 transition-all">
                                <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold italic group-hover/tile:text-primary transition-colors">Peak_Flow</p>
                                <p className="text-xl font-black text-text tracking-tight">₹8,900</p>
                            </div>
                            <div className="p-5 bg-background border border-border group/tile hover:border-primary/30 transition-all">
                                <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold italic group-hover/tile:text-primary transition-colors">Unit_Throughput</p>
                                <p className="text-xl font-black text-text tracking-tight">47 OPS</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Vector (Recent Shifts) */}
                    <div className="bg-surface border border-border p-6 mt-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-12 translate-x-12 rotate-45" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Attendance_Vector</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {[
                                { status: 'INITIALIZED', time: '09:02 AM', date: '04 MAR 2026', type: 'in' },
                                { status: 'TERMINATED', time: '07:15 PM', date: '04 MAR 2026', type: 'out' },
                                { status: 'INITIALIZED', time: '10:00 AM', date: '03 MAR 2026', type: 'in' },
                            ].map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-background border border-border/10 text-[9px] font-black uppercase tracking-widest hover:border-border/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-4 ${log.type === 'in' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`} />
                                        <span className={log.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}>{log.status}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-text">{log.time}</span>
                                        <span className="mx-2 text-text-muted font-normal opacity-40">::</span>
                                        <span className="text-text-muted opacity-60 text-[8px] font-bold italic">{log.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Detail Modal */}
            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedApt(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <Award className="w-32 h-32 text-primary" />
                            </div>

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Iteration Detail</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Protocol: Fulfillment_Scan_{selectedApt.id}</p>
                                </div>
                                <button onClick={() => setSelectedApt(null)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Client_Identity</p>
                                        <p className="text-lg font-black text-text">{selectedApt.customer}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Fulfillment_Time</p>
                                        <p className="text-lg font-black text-text">{selectedApt.time}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Service_Vector</p>
                                        <p className="text-lg font-black text-text">{selectedApt.service}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Unit_Sector</p>
                                        <p className="text-lg font-black text-text text-primary">{selectedApt.sector}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-background border border-border flex items-center gap-6">
                                    <div className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest ${STATUS_MAP[selectedApt.status].bg} ${STATUS_MAP[selectedApt.status].color} ${STATUS_MAP[selectedApt.status].border}`}>
                                        {STATUS_MAP[selectedApt.status].label}
                                    </div>
                                    <div className="text-[10px] text-text-muted uppercase font-black tracking-tighter italic">
                                        Iteration_Duration: <span className="text-text">{selectedApt.duration}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-primary" /> Policy_Compliance
                                    </h4>
                                    <ul className="space-y-2">
                                        {['Standard_Sterilization_Check', 'Digital_Receipt_Bypass', 'Asset_Usage_Logged'].map(p => (
                                            <li key={p} className="flex items-center gap-3 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                <div className="w-1 h-1 bg-primary" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-3 relative z-10">
                                <button className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Modify_Vector</button>
                                <button onClick={() => setSelectedApt(null)} className="px-8 py-4 border border-border text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

