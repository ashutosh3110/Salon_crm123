import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Calendar,
    Clock,
    User,
    List,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    TrendingUp,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    PieChart as PieIcon,
    BarChart3
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import BookingCalendar from '../../components/admin/BookingCalendar';
import BookingDetailModal from '../../components/admin/BookingDetailModal';
import BookingModal from '../../components/admin/BookingModal';
import MiniCalendar from '../../components/admin/MiniCalendar';

const statusColors = {
    upcoming: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    confirmed: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    pending: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
    completed: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900',
    cancelled: 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700',
    'no-show': 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900',
};

const CHART_COLORS = {
    upcoming: '#3b82f6',
    completed: '#10b981',
    cancelled: '#94a3b8',
    'no-show': '#ef4444',
    pending: '#f59e0b'
};

const MOCK_OUTLETS = [
    { id: 'mock-1', name: 'Downtown Salon' },
    { id: 'mock-2', name: 'Bandra West' }
];

import { useBookingRegistry } from '../../contexts/BookingRegistryContext';

export default function BookingsPage() {
    const { bookings: registryBookings, updateBookingStatus: updateRegistryStatus } = useBookingRegistry();
    const {
        bookings: contextBookings,
        staff: contextStaff,
        updateBookingStatus
    } = useBusiness();

    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [outletFilter, setOutletFilter] = useState('all');
    const [staffFilter, setStaffFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Merge logic
    const bookings = useMemo(() => {
        const live = (registryBookings || []).map(b => ({
            ...b,
            _id: b.id,
            appointmentDate: b.appointmentDate || b.date || b.timestamp,
            client: { name: b.clientName || 'App User', phone: 'Mobile App' },
            service: b.services?.[0] || { name: 'App Booking' },
            staff: { _id: b.staffId, name: b.staffName || 'Unassigned' },
            source: b.source || 'APP'
        }));
        return [...live, ...contextBookings];
    }, [registryBookings, contextBookings]);

    const staff = contextStaff;
    const loading = false;

    const filteredBookings = useMemo(() => {
        if (!Array.isArray(bookings)) return [];
        let result = bookings.filter(b => {
            const clientName = b.client?.name || '';
            const clientPhone = b.client?.phone || '';
            const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clientPhone.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesStaff = staffFilter === 'all' || b.staff?._id === staffFilter;

            return matchesSearch && matchesStatus && matchesStaff;
        });

        // Date Filter implementation
        if (dateFilter !== 'all') {
            const now = new Date();
            const todayStr = now.toDateString();

            if (dateFilter === 'today') {
                result = result.filter(b => {
                    const bDate = b.appointmentDate || b.date;
                    return bDate && new Date(bDate).toDateString() === todayStr;
                });
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                result = result.filter(b => {
                    const bDate = b.appointmentDate || b.date;
                    return bDate && new Date(bDate) >= weekAgo;
                });
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                result = result.filter(b => {
                    const bDate = b.appointmentDate || b.date;
                    return bDate && new Date(bDate) >= monthAgo;
                });
            }
        }

        return result;
    }, [bookings, searchTerm, statusFilter, staffFilter, dateFilter]);

    // Analytics Calculations
    const statusData = useMemo(() => {
        const counts = {};
        bookings.forEach(b => {
            counts[b.status] = (counts[b.status] || 0) + 1;
        });
        return Object.keys(counts).map(status => ({
            name: status.toUpperCase(),
            value: counts[status],
            color: CHART_COLORS[status] || '#cbd5e1'
        }));
    }, [bookings]);

    const sourceData = useMemo(() => {
        const counts = {};
        bookings.forEach(b => {
            const src = b.source || 'SYSTEM';
            counts[src] = (counts[src] || 0) + 1;
        });
        return Object.keys(counts).map(src => ({
            name: src,
            count: counts[src]
        }));
    }, [bookings]);

    const stats = useMemo(() => {
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        return [
            { label: "Total Load", value: safeBookings.length, icon: Calendar, color: 'text-primary' },
            { label: 'Upcoming', value: safeBookings.filter(b => b.status === 'upcoming').length, icon: RotateCcw, color: 'text-blue-500' },
            { label: 'Success Rate', value: `${safeBookings.length ? Math.round((safeBookings.filter(b => b.status === 'completed').length / safeBookings.length) * 100) : 0}%`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Risk Factor', value: safeBookings.filter(b => b.status === 'no-show').length, icon: AlertCircle, color: 'text-rose-500' },
        ];
    }, [bookings]);

    const handleUpdateStatus = async (id, status) => {
        updateBookingStatus(id, status);
        setSelectedBooking(null);
    };

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Booking Protocols</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">System :: scheduling_intelligence_active // global_sync</p>
                </div>

                <div className="flex items-center gap-4 text-left font-black">
                    <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-3.5 rounded-none bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-black"
                    >
                        <Plus className="w-4 h-4" /> ADD BOOKING
                    </button>

                    <div className="flex items-center gap-2 bg-surface p-1 rounded-none border border-border">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'calendar' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <Calendar className="w-3.5 h-3.5" /> CALENDAR
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'list' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <List className="w-3.5 h-3.5" /> LIST ARRAY
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Analytics Cluster */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />
                            <div className="relative z-10 flex flex-col justify-between h-full text-left">
                                <div className="flex items-center justify-between mb-4 text-left">
                                    <div className="flex items-center gap-3 text-left">
                                        <stat.icon className={`w-5 h-5 ${stat.color} transition-colors`} />
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{stat.label}</p>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between text-left">
                                    <h3 className="text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">
                                        {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                                    </h3>
                                    <div className="opacity-20 group-hover:opacity-100 transition-opacity stroke-[3px]">
                                        <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Composition Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Status Matrix</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left">
                        {statusData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Source Intelligence Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Source Vectors</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceData}>
                                <Bar dataKey="count" fill="var(--primary)" radius={0}>
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#8B1A2D'} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Entry Point Analysis</div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-surface p-4 rounded-none border border-border shadow-sm flex flex-col xl:flex-row gap-4 items-center font-black">
                <div className="relative flex-1 w-full text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors" />
                    <input
                        type="text"
                        placeholder="Search system registry (name/comm)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-none border border-border bg-surface text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto font-black">
                    {[
                        { value: dateFilter, onChange: setDateFilter, options: [{ v: 'all', l: 'Every Date' }, { v: 'today', l: 'Today' }, { v: 'week', l: 'Week' }, { v: 'month', l: 'Month' }] },
                        { value: staffFilter, onChange: setStaffFilter, options: [{ v: 'all', l: 'Every Staff' }, ...staff.map(s => ({ v: s._id, l: s.name }))] },
                        { value: statusFilter, onChange: setStatusFilter, options: [{ v: 'all', l: 'Every Status' }, { v: 'upcoming', l: 'Upcoming' }, { v: 'completed', l: 'Completed' }, { v: 'cancelled', l: 'Cancelled' }, { v: 'no-show', l: 'No-Show' }] }
                    ].map((sel, idx) => (
                        <select
                            key={idx}
                            className="px-6 py-3.5 rounded-none border border-border bg-surface text-[9px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary cursor-pointer transition-all"
                            value={sel.value}
                            onChange={(e) => sel.onChange(e.target.value)}
                        >
                            {sel.options.map(opt => <option key={opt.v} value={opt.v}>{opt.l.toUpperCase()}</option>)}
                        </select>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {view === 'calendar' ? (
                <div className="flex bg-surface-alt rounded-none border border-border overflow-hidden shadow-2xl h-[800px] animate-reveal">
                    {/* Calendar Sidebar */}
                    <div className="w-80 bg-surface flex flex-col border-r border-border">
                        <div className="p-8 border-b border-border bg-surface-alt/50">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                Sequence Map
                            </h3>
                        </div>

                        <div className="p-4">
                            <MiniCalendar
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8 scroll-smooth no-scrollbar">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-none uppercase tracking-widest border border-primary/20">
                                        {filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth();
                                        }).length} Pulse
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {filteredBookings.filter(b => {
                                        const d = new Date(b.appointmentDate);
                                        return d.getDate() === selectedDate.getDate() &&
                                            d.getMonth() === selectedDate.getMonth();
                                    }).length === 0 ? (
                                        <p className="text-[11px] text-gray-400 px-2 font-black uppercase mt-10 text-center italic opacity-40 italic">Null Data Stream.</p>
                                    ) : (
                                        filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth();
                                        }).map((b, i) => (
                                            <div key={i} className="flex gap-4 px-4 group cursor-pointer hover:bg-surface-alt/50 py-4 rounded-none transition-all border border-transparent hover:border-border">
                                                <div className="flex flex-col items-center gap-2 mt-2">
                                                    <div className="w-2.5 h-2.5 rounded-none bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]" />
                                                    <div className="w-[1px] h-full bg-border" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[11px] font-black text-text uppercase tracking-tighter leading-none">
                                                        {new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-sm font-black text-text-secondary tracking-tight mt-1 leading-none uppercase">{b.client?.name}</span>
                                                    <span className="text-[9px] text-primary font-black uppercase tracking-[0.15em] mt-2 leading-none">{b.service?.name}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border bg-surface-alt/30">
                            <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <div className="w-3 h-3 rounded-none bg-primary" />
                                <span>Core Synchronization Hub</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-background">
                        <BookingCalendar
                            bookings={filteredBookings}
                            staff={staff}
                            currentDate={selectedDate}
                            onDateChange={setSelectedDate}
                            onBookingClick={setSelectedBooking}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                    <div className="overflow-x-auto text-left">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Internal ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Signal Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Service Logic</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Entry</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Protocol Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-left font-black">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-20">
                                                <RotateCcw className="w-16 h-16 mb-6 animate-spin-slow" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Bookings Detected in Current Matrix.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b, index) => (
                                        <tr
                                            key={b._id}
                                            className="hover:bg-surface-alt/50 transition-all cursor-pointer group text-left"
                                            onClick={() => setSelectedBooking(b)}
                                        >
                                            <td className="px-8 py-6 text-[11px] font-black text-text-muted/60 uppercase tracking-widest text-left">#{b._id?.slice(-6).toUpperCase() || 'NULL'}</td>
                                            <td className="px-8 py-6 text-left">
                                                <div className="flex flex-col text-left">
                                                    <span className="text-xs font-black text-text uppercase leading-none">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toDateString() : 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 leading-none">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-left">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-11 h-11 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-inner">
                                                        {b.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="text-sm font-black text-text uppercase tracking-tight leading-none mb-1">{b.client?.name || 'UNKNOWN'}</span>
                                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em] leading-none">{b.client?.phone || 'NO_COMMS'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-black text-text uppercase tracking-wider text-left">{b.service?.name}</td>
                                            <td className="px-8 py-6 text-center text-left">
                                                <span className="px-3 py-1.5 rounded-none bg-background border border-border text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">{b.source || 'SYS'}</span>
                                            </td>
                                            <td className="px-8 py-6 text-left">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-none text-[9px] font-black border uppercase tracking-widest ${statusColors[b.status] || 'bg-surface text-text'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-none ${b.status === 'upcoming' ? 'bg-blue-500' : b.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-3 rounded-none bg-background border border-border text-text-muted hover:text-primary hover:border-primary transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </div>
    );
}
