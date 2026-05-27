import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
    BarChart3,
    Eye
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
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import CustomDropdown from '../../components/common/CustomDropdown';

const statusColors = {
    upcoming: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    confirmed: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
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

export default function BookingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        bookings: contextBookings,
        staff: contextStaff,
        updateBookingStatus,
        bookingsLoading,
        fetchBookings
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

    // Pagination state & effects
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, dateFilter, outletFilter, staffFilter, statusFilter]);
    
    // Prevent background scroll when any modal is open
    useEffect(() => {
        if (selectedBooking || isBookingModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        }
        return () => { 
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        };
    }, [selectedBooking, isBookingModalOpen]);

    const bookings = useMemo(() => {
        return Array.isArray(contextBookings) ? contextBookings : [];
    }, [contextBookings]);

    const staff = contextStaff;
    const loading = bookingsLoading;

    useEffect(() => {
        fetchBookings?.();
    }, []);

    const filteredBookings = useMemo(() => {
        if (!Array.isArray(bookings)) return [];
        let result = bookings.filter(b => {
            const clientName = b.client?.name || '';
            const clientPhone = b.client?.phone || '';
            const st = searchTerm.trim().toLowerCase().replace(/\s+/g, '');
            const matchesSearch = !st || 
                (b._id || '').toLowerCase().includes(st) ||
                (b.client?.name || '').toLowerCase().replace(/\s+/g, '').includes(st) ||
                (b.client?.phone || '').replace(/\D/g, '').includes(st.replace(/\D/g, '')) ||
                (b.service?.name || '').toLowerCase().replace(/\s+/g, '').includes(st) ||
                (b.staff?.name || '').toLowerCase().replace(/\s+/g, '').includes(st) ||
                (b.outlet?.name || '').toLowerCase().replace(/\s+/g, '').includes(st);

            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesStaff = staffFilter === 'all' || b.staff?._id === staffFilter;
            const matchesOutlet = outletFilter === 'all' ||
                String(b.outletId) === String(outletFilter) ||
                String(b.outlet?._id) === String(outletFilter);

            return matchesSearch && matchesStatus && matchesStaff && matchesOutlet;
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

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = useMemo(() => {
        return filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredBookings, currentPage, itemsPerPage]);

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
            { label: "Total Bookings", value: safeBookings.length, icon: Calendar, color: 'text-primary' },
            { label: 'Accepted', value: safeBookings.filter(b => b.status === 'confirmed').length, icon: RotateCcw, color: 'text-blue-500' },
            { label: 'Completion Rate', value: `${safeBookings.length ? Math.round((safeBookings.filter(b => b.status === 'completed').length / safeBookings.length) * 100) : 0}%`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Cancelled', value: safeBookings.filter(b => b.status === 'cancelled').length, icon: AlertCircle, color: 'text-rose-500' },
        ];
    }, [bookings]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const normalized = status === 'upcoming' ? 'confirmed' : status;
            await updateBookingStatus(id, normalized);
            setSelectedBooking(null);
        } catch (error) {
            console.error('[BookingsPage] Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-4 animate-reveal text-left">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight leading-none">Manage Bookings</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1.5 uppercase tracking-[0.3em] opacity-50">View and manage all salon appointments</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/bookings/new')}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Booking
                    </button>

                    <div className="flex items-center bg-surface border border-border">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-wider transition-all ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <Calendar className="w-3 h-3" /> Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-wider transition-all ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-text-muted hover:bg-surface-alt'}`}
                        >
                            <List className="w-3 h-3" /> List
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {/* KPI Stats */}
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface p-4 border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-black text-text tracking-tighter">
                            {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10 group-hover:bg-primary/40 transition-all" />
                    </div>
                ))}

                {/* Status Pie Chart */}
                <div className="bg-surface p-4 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Status Mix</span>
                        <PieIcon className="w-3 h-3 text-primary" />
                    </div>
                    <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} innerRadius={18} outerRadius={32} paddingAngle={4} dataKey="value" stroke="transparent">
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {statusData.map(d => (
                            <div key={d.name} className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Source Chart */}
                <div className="bg-surface p-4 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-wider">Sources</span>
                        <BarChart3 className="w-3 h-3 text-primary" />
                    </div>
                    <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceData}>
                                <Bar dataKey="count" fill="var(--primary)" radius={0}>
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#8B6F23'} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-[7px] font-black uppercase text-text-muted tracking-wider text-center opacity-40 mt-1">Entry Analysis</div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-surface p-3 border border-border shadow-sm flex flex-col xl:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by ID, Customer, Service, or Staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-border bg-surface text-[10px] font-black uppercase tracking-wider focus:outline-none focus:border-primary transition-all text-text"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                    <CustomDropdown
                        value={dateFilter}
                        onChange={setDateFilter}
                        options={[
                            { value: 'all', label: 'ALL DATES' },
                            { value: 'today', label: 'TODAY' },
                            { value: 'week', label: 'WEEK' },
                            { value: 'month', label: 'MONTH' }
                        ]}
                        className="w-full xl:w-40"
                    />
                    <CustomDropdown
                        value={staffFilter}
                        onChange={setStaffFilter}
                        options={[
                            { value: 'all', label: 'ALL STAFF' },
                            ...staff.map(s => ({ value: s._id, label: s.name.toUpperCase() }))
                        ]}
                        className="w-full xl:w-40"
                    />
                    <CustomDropdown
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'all', label: 'ALL STATUS' },
                            { value: 'pending', label: 'PENDING' },
                            { value: 'confirmed', label: 'CONFIRMED' },
                            { value: 'completed', label: 'COMPLETED' },
                            { value: 'cancelled', label: 'CANCELLED' }
                        ]}
                        className="w-full xl:w-40"
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="bg-surface border border-border shadow-sm p-16 text-center text-text-muted font-bold uppercase tracking-widest">
                    Loading bookings...
                </div>
            ) : view === 'calendar' ? (
                <div className="flex flex-col lg:flex-row bg-surface-alt border border-border overflow-hidden shadow-lg lg:h-[700px] animate-reveal">
                    {/* Calendar Sidebar */}
                    <div className="w-full lg:w-72 shrink-0 bg-surface flex flex-col border-b lg:border-b-0 lg:border-r border-border">
                        <div className="p-5 border-b border-border bg-surface-alt/50">
                            <h3 className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                Select Date
                            </h3>
                        </div>

                        <div className="p-3">
                            <MiniCalendar
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scroll-smooth no-scrollbar">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[9px] font-black text-text-muted uppercase tracking-wider">
                                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                    <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 uppercase tracking-wider border border-primary/20">
                                        {filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth() &&
                                                d.getFullYear() === selectedDate.getFullYear();
                                        }).length} Bookings
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {filteredBookings.filter(b => {
                                        const d = new Date(b.appointmentDate);
                                        return d.getDate() === selectedDate.getDate() &&
                                            d.getMonth() === selectedDate.getMonth();
                                    }).length === 0 ? (
                                        <p className="text-[10px] text-gray-400 font-black uppercase mt-8 text-center italic opacity-40">No bookings on this day.</p>
                                    ) : (
                                        filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth() &&
                                                d.getFullYear() === selectedDate.getFullYear();
                                        }).map((b, i) => (
                                            <div key={i} className="flex gap-3 px-3 group cursor-pointer hover:bg-surface-alt/50 py-3 transition-all border border-transparent hover:border-border">
                                                <div className="flex flex-col items-center gap-1.5 mt-1">
                                                    <div className="w-2 h-2 bg-primary shadow-[0_0_6px_rgba(var(--primary-rgb),0.4)]" />
                                                    <div className="w-[1px] h-full bg-border" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-text uppercase tracking-tight leading-none">
                                                        {new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-xs font-black text-text-secondary tracking-tight mt-1 leading-none uppercase">{b.client?.name}</span>
                                                    <span className="text-[8px] text-primary font-black uppercase tracking-wider mt-1.5 leading-none">{b.service?.name}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border bg-surface-alt/30">
                            <div className="flex items-center gap-2 text-[9px] font-black text-text-muted uppercase tracking-wider">
                                <div className="w-2 h-2 bg-primary" />
                                <span>Calendar Sync Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-background min-h-[500px] lg:min-h-0">
                        <BookingCalendar
                            bookings={filteredBookings}
                            staff={staff}
                            currentDate={selectedDate}
                            onDateChange={setSelectedDate}
                            onBookingClick={(b) => navigate(`/admin/bookings/${b._id}`)}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-border shadow-sm overflow-hidden">
                    <div className="table-responsive">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border">
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Date & Time</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Service</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Staff</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Outlet</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-20">
                                                <RotateCcw className="w-12 h-12 mb-4 animate-spin-slow" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No bookings found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedBookings.map((b, index) => (
                                        <tr
                                            key={b._id}
                                            className="hover:bg-surface-alt/50 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/admin/bookings/${b._id}`)}
                                        >
                                            <td className="px-4 py-3.5 text-[10px] font-black text-text-muted/60 uppercase tracking-wider">#{b._id?.slice(-6).toUpperCase() || 'NULL'}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-text uppercase leading-none">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                                                    </span>
                                                    <span className="text-[9px] text-primary font-black uppercase tracking-wider mt-1 leading-none">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-primary/5 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary flex-shrink-0">
                                                        {b.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-black text-text uppercase tracking-tight leading-none truncate">{b.client?.name || 'UNKNOWN'}</span>
                                                        <span className="text-[9px] font-bold text-text-muted tracking-wider mt-0.5 leading-none">{maskPhone(b.client?.phone, user?.role) || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-[10px] font-black text-text uppercase tracking-wider max-w-[120px] truncate">{b.service?.name}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center text-[7px] font-black border border-border flex-shrink-0">
                                                        {b.staff?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-text uppercase tracking-wide truncate">{b.staff?.name || 'Unassigned'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-[9px] font-black text-text uppercase leading-none">{b.outlet?.name || 'Main'}</span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black border uppercase tracking-wider ${statusColors[b.status] || 'bg-surface text-text'}`}>
                                                    <div className={`w-1.5 h-1.5 ${b.status === 'confirmed' ? 'bg-indigo-500' : b.status === 'completed' ? 'bg-emerald-500' : b.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/bookings/${b._id}`);
                                                    }}
                                                    className="p-2 bg-background border border-border text-text-muted hover:text-primary hover:border-primary transition-all"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {filteredBookings.length > 0 && (
                        <div className="bg-surface-alt/50 px-4 py-3 border-t border-border flex items-center justify-between">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">
                                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
                            </span>
                            <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                    disabled={currentPage === 1}
                                    className="text-[9px] font-black text-text-muted uppercase tracking-wider hover:text-primary transition-colors disabled:opacity-20"
                                >
                                    Prev
                                </button>
                                <span className="text-[9px] font-black text-text uppercase tracking-wider">{currentPage}/{totalPages || 1}</span>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="text-[9px] font-black text-text-muted uppercase tracking-wider hover:text-primary transition-colors disabled:opacity-20"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
