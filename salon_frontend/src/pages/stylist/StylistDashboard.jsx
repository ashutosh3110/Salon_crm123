import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Calendar, Users, Clock, Star, TrendingUp,
    CheckCircle2, Play, ArrowRight, Activity,
    Target, Award, Search, RefreshCw,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import api from '../../services/api';

const STATUS_MAP = {
    completed: { label: 'COMPLETED', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'in-progress': { label: 'IN PROGRESS', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    upcoming: { label: 'UPCOMING', color: 'text-text-muted', bg: 'bg-surface-alt', border: 'border-border/40' },
    cancelled: { label: 'CANCELLED', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    pending: { label: 'PENDING', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    default: { label: 'UNKNOWN', color: 'text-text-muted', bg: 'bg-surface-alt', border: 'border-border/40' },
};

function mapBookingToUi(bookingStatus) {
    if (bookingStatus === 'completed') return 'completed';
    if (bookingStatus === 'cancelled') return 'cancelled';
    if (bookingStatus === 'confirmed') return 'in-progress';
    return 'upcoming';
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

export default function StylistDashboard() {
    const { user } = useAuth();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scheduleDate, setScheduleDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sectorFilter, setSectorFilter] = useState('ALL');
    const [selectedApt, setSelectedApt] = useState(null);
    const [toast, setToast] = useState(null);

    const loadOverview = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.get('/stylist/overview', { params: { date: scheduleDate } });
            const data = res.data?.data ?? res.data;
            setOverview(data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Failed to load overview');
            setOverview(null);
        } finally {
            setLoading(false);
        }
    }, [scheduleDate]);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    const scheduleRows = useMemo(() => {
        const rows = overview?.schedule || [];
        return rows.map((r) => ({
            ...r,
            uiStatus: mapBookingToUi(r.bookingStatus),
        }));
    }, [overview]);

    const sectors = useMemo(() => {
        const u = [...new Set(scheduleRows.map((s) => s.sector).filter(Boolean))];
        return ['ALL', ...u];
    }, [scheduleRows]);

    const statuses = ['ALL', 'completed', 'in-progress', 'upcoming', 'pending', 'cancelled'];

    const filteredSchedule = scheduleRows.filter((s) => {
        const matchesSearch =
            s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.service.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.uiStatus === statusFilter;
        const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
        return matchesSearch && matchesStatus && matchesSector;
    });

    const showToast = (msg, isErr) => {
        setToast({ msg, isErr: !!isErr });
        setTimeout(() => setToast(null), 3200);
    };

    const updateBooking = async (id, nextStatus) => {
        try {
            await api.patch(`/bookings/${id}`, { status: nextStatus });
            showToast('Booking updated');
            await loadOverview();
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Update failed', true);
        }
    };

    const stats = overview?.stats || { revenue: 0, target: 1, progressPercent: 0, servicesDone: 0, highestDaily: 0, rating: null };
    const performanceData = overview?.performanceData || [];
    const attendanceLog = overview?.attendanceLog || [];
    const shiftActive = !!overview?.shiftActive;

    const maxBarIdx = useMemo(() => {
        if (!performanceData.length) return -1;
        let best = 0;
        let max = -1;
        performanceData.forEach((d, i) => {
            if (d.value > max) {
                max = d.value;
                best = i;
            }
        });
        return best;
    }, [performanceData]);

    const displayDateLabel = useMemo(() => {
        try {
            const [y, m, d] = scheduleDate.split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        } catch {
            return scheduleDate;
        }
    }, [scheduleDate]);

    return (
        <div className="space-y-4 text-left font-black">
            {error && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 text-[10px] font-black uppercase text-rose-600 tracking-wide">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-3 bg-background border border-border p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${shiftActive ? 'bg-emerald-500 animate-pulse' : 'bg-text-muted'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Today&apos;s shift</span>
                            </div>
                            <Link
                                to="/stylist/attendance"
                                className="px-6 py-2 border text-[9px] font-black uppercase tracking-[0.2em] transition-all bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 text-center"
                            >
                                {shiftActive ? 'Punch out / attendance' : 'Punch in / attendance'}
                            </Link>
                        </div>

                        <div className="flex flex-col md:flex-row items-end gap-6">
                            <div>
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold not-italic">Revenue (this month)</p>
                                <h2 className="text-4xl font-black text-text tracking-tighter">
                                    ₹{Math.round(stats.revenue || 0).toLocaleString()}
                                </h2>
                                {stats.rating != null && (
                                    <p className="text-[9px] text-text-muted uppercase mt-1 flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-500" /> Avg rating {stats.rating}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1 w-full space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <span>Goal progress</span>
                                    <span className="text-primary">{stats.progressPercent ?? 0}%</span>
                                </div>
                                <div className="h-4 bg-surface border border-border p-0.5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, stats.progressPercent || 0)}%` }}
                                        transition={{ duration: 1.2, ease: 'easeOut' }}
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 space-y-3">
                    <div className="bg-surface border border-border p-4 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <div>
                                    <h3 className="text-sm font-black text-text uppercase tracking-widest">Appointments</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest not-italic">Day: {displayDateLabel}</p>
                                        <input
                                            type="date"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="text-[9px] font-black uppercase bg-background border border-border px-2 py-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group/search">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted group-focus-within/search:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2.5 bg-background border border-border text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all w-full md:w-48 placeholder:text-text-muted/30"
                                    />
                                </div>

                                <div className="hidden lg:flex items-center gap-1.5 p-1 bg-background border border-border shadow-inner flex-wrap max-w-[220px]">
                                    {sectors.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSectorFilter(s)}
                                            className={`px-2 py-1.5 text-[7px] font-black uppercase tracking-tighter transition-all ${sectorFilter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-alt/50'}`}
                                        >
                                            {s === 'ALL' ? 'ALL' : s.replace('STATION_', 'S ')}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 p-1 bg-background border border-border shadow-inner flex-wrap">
                                    {statuses.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatusFilter(s)}
                                            className={`px-2 py-1.5 text-[7px] font-black uppercase tracking-tighter transition-all ${statusFilter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text hover:bg-surface-alt/50'}`}
                                        >
                                            {s === 'ALL' ? 'ALL' : (STATUS_MAP[s] || STATUS_MAP.default).label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('ALL');
                                        setSectorFilter('ALL');
                                        loadOverview();
                                        showToast('Refreshed');
                                    }}
                                    className="p-2.5 border border-border text-text-muted hover:text-text hover:border-primary transition-all active:scale-95"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-background border border-border overflow-hidden p-1 shadow-inner">
                            <div className="divide-y divide-border/10">
                                {loading && !scheduleRows.length ? (
                                    <div className="p-16 text-center text-[10px] font-black uppercase text-text-muted tracking-widest">Loading…</div>
                                ) : filteredSchedule.length > 0 ? (
                                    filteredSchedule.map((apt) => {
                                        const sm = STATUS_MAP[apt.uiStatus] || STATUS_MAP.default;
                                        const timeParts = apt.time.split(' ');
                                        const timeMain = timeParts[0] || apt.time;
                                        const timeMer = timeParts.slice(1).join(' ') || '';
                                        return (
                                            <div key={apt.id} className="p-6 group hover:bg-surface-alt/30 transition-all relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                    <div className="w-20 shrink-0">
                                                        <p className="text-xl font-black text-text leading-none tracking-tighter">{timeMain}</p>
                                                        <p className="text-[9px] text-text-muted uppercase mt-1 tracking-[0.3em] font-bold not-italic">{timeMer}</p>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h4 className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">
                                                                {apt.customer}
                                                            </h4>
                                                            <div className="bg-primary/5 px-2 py-0.5 border border-primary/10 text-[8px] text-primary font-black">
                                                                {apt.sector}
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-text-muted uppercase tracking-[0.1em] font-bold">
                                                            {apt.service} <span className="mx-2 opacity-30">|</span> {apt.duration}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <div
                                                            className={`px-4 py-2 border text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${sm.bg} ${sm.color} ${sm.border}`}
                                                        >
                                                            {sm.label}
                                                        </div>

                                                        <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                                                            {apt.bookingStatus === 'pending' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateBooking(apt.id, 'confirmed');
                                                                    }}
                                                                    className="p-2.5 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
                                                                    title="Confirm / start"
                                                                >
                                                                    <Play className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {apt.bookingStatus === 'confirmed' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateBooking(apt.id, 'completed');
                                                                    }}
                                                                    className="p-2.5 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                                    title="Complete"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedApt(apt)}
                                                                className="p-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-alt transition-all active:scale-95"
                                                            >
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="w-12 h-12 bg-surface-alt border border-border mx-auto flex items-center justify-center">
                                            <Search className="w-5 h-5 text-text-muted opacity-20" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text uppercase tracking-widest">No appointments</p>
                                            <p className="text-[8px] text-text-muted uppercase tracking-widest mt-1">Try another date or clear filters</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border p-6 h-full flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target className="w-24 h-24 text-primary" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Last 7 days</span>
                                </div>
                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest pl-7 not-italic">
                                    Revenue from completed bookings · Live from server
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => loadOverview()}
                                className="p-2 border border-border text-text-muted hover:text-primary"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-[250px] w-full relative z-10">
                            {performanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-muted)', fontSize: 8, fontWeight: 900 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'var(--primary)', fillOpacity: 0.05 }}
                                            formatter={(value, _name, item) => {
                                                const c = item?.payload?.count;
                                                const v = typeof value === 'number' ? value : Number(value);
                                                const rupees = `₹${Math.round(v).toLocaleString('en-IN')}`;
                                                return c != null ? [ `${rupees} · ${c} service${c !== 1 ? 's' : ''}`, 'Revenue' ] : [ rupees, 'Revenue' ];
                                            }}
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                border: '2px solid var(--primary)',
                                                borderRadius: '0',
                                                fontSize: '11px',
                                                color: 'var(--text)',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                padding: '12px',
                                                boxShadow: '10px 10px 0px rgba(0,0,0,0.1)',
                                            }}
                                            itemStyle={{ color: 'var(--text)', padding: '4px 0 0 0', fontSize: '12px' }}
                                            labelStyle={{
                                                color: 'var(--primary)',
                                                fontWeight: 'bold',
                                                borderBottom: '1px solid var(--border)',
                                                paddingBottom: '4px',
                                                marginBottom: '4px',
                                            }}
                                        />
                                        <Bar dataKey="value" barSize={16}>
                                            {performanceData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill="var(--primary)"
                                                    fillOpacity={index === maxBarIdx ? 1 : 0.2}
                                                    className="transition-all cursor-crosshair hover:fill-opacity-100"
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] font-black uppercase text-text-muted">No data yet</div>
                            )}
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
                            <div className="p-5 bg-background border border-border group/tile hover:border-primary/30 transition-all">
                                <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold not-italic group-hover/tile:text-primary transition-colors">
                                    Highest day (month)
                                </p>
                                <p className="text-xl font-black text-text tracking-tight">₹{Math.round(stats.highestDaily || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-5 bg-background border border-border group/tile hover:border-primary/30 transition-all">
                                <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1 font-bold not-italic group-hover/tile:text-primary transition-colors">
                                    Services done (month)
                                </p>
                                <p className="text-xl font-black text-text tracking-tight">{stats.servicesDone ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border p-6 mt-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-12 translate-x-12 rotate-45" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Recent attendance</span>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {attendanceLog.length === 0 ? (
                                <p className="text-[9px] font-black uppercase text-text-muted tracking-widest py-4">No punches logged yet</p>
                            ) : (
                                attendanceLog.map((log, idx) => (
                                    <div
                                        key={`${idx}-${log.time}`}
                                        className="flex items-center justify-between p-4 bg-background border border-border/10 text-[9px] font-black uppercase tracking-widest hover:border-border/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div
                                                className={`w-1 h-4 shrink-0 ${log.type === 'in' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`}
                                            />
                                            <span className={log.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}>{log.statusLabel}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-text">{log.time}</span>
                                            <span className="mx-2 text-text-muted font-normal opacity-40">::</span>
                                            <span className="text-text-muted opacity-60 text-[8px] font-bold not-italic">{log.date}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedApt && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedApt(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <Award className="w-32 h-32 text-primary" />
                            </div>

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Appointment</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">ID: {selectedApt.id}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedApt(null)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Client</p>
                                        <p className="text-lg font-black text-text">{selectedApt.customer}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Time</p>
                                        <p className="text-lg font-black text-text">{selectedApt.time}</p>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Services</p>
                                        <p className="text-lg font-black text-text">{selectedApt.service}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Station</p>
                                        <p className="text-lg font-black text-primary">{selectedApt.sector.replace('STATION_', 'CHAIR ')}</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-background border border-border flex items-center gap-6 flex-wrap">
                                    <div
                                        className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest ${(STATUS_MAP[selectedApt.uiStatus] || STATUS_MAP.default).bg} ${(STATUS_MAP[selectedApt.uiStatus] || STATUS_MAP.default).color} ${(STATUS_MAP[selectedApt.uiStatus] || STATUS_MAP.default).border}`}
                                    >
                                        {(STATUS_MAP[selectedApt.uiStatus] || STATUS_MAP.default).label}
                                    </div>
                                    <div className="text-[10px] text-text-muted uppercase font-black tracking-tighter not-italic">
                                        Duration: <span className="text-text">{selectedApt.duration}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-3 relative z-10">
                                <button type="button" onClick={() => setSelectedApt(null)} className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 border rounded-none shadow-2xl ${toast.isErr ? 'bg-rose-600 text-white border-rose-500' : 'bg-text border-border text-background'}`}
                    >
                        <CheckCircle2 className={`w-5 h-5 shrink-0 ${toast.isErr ? 'text-white' : 'text-emerald-500'}`} />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
