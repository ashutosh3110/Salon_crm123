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
    Eye,
    Briefcase,
    ArrowRight,
    Filter,
    CalendarDays,
    MoreHorizontal,
    Copy,
    CalendarClock
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
            { 
                label: "TOTAL BOOKINGS", 
                value: safeBookings.length, 
                subtext: "All time bookings",
                icon: CalendarDays, 
                iconColorClass: '!text-[#7C3AED] dark:!text-[#A78BFA]',
                iconBgClass: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15 hover:!border-[#D8B4FE] dark:hover:!border-[#A78BFA]/50',
            },
            { 
                label: 'ACCEPTED', 
                value: safeBookings.filter(b => b.status === 'confirmed').length, 
                subtext: "Confirmed bookings",
                icon: CheckCircle2, 
                iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
            },
            { 
                label: 'COMPLETION RATE', 
                value: `${safeBookings.length ? Math.round((safeBookings.filter(b => b.status === 'completed').length / safeBookings.length) * 100) : 0}%`, 
                subtext: "Bookings completed",
                icon: TrendingUp, 
                iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
            },
            { 
                label: 'CANCELLED', 
                value: safeBookings.filter(b => b.status === 'cancelled').length, 
                subtext: "Cancelled bookings",
                icon: XCircle, 
                iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
            },
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
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Manage Bookings</h1>
                    <p className="text-[10px] font-black text-slate-400 mt-1.5 uppercase tracking-[0.1em]">View and manage all salon appointments</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/bookings/new')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] hover:bg-[#997009] text-white text-[11px] font-black uppercase tracking-widest allow-curve rounded-lg transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> New Booking
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all allow-curve rounded-lg shadow-sm border ${view === 'calendar' ? 'bg-white text-slate-900 border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
                        >
                            <CalendarClock className="w-3.5 h-3.5" /> Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all allow-curve rounded-lg shadow-sm border ${view === 'list' ? 'bg-white text-slate-900 border-slate-300' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
                        >
                            <List className="w-3.5 h-3.5" /> List
                        </button>
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                {/* KPI Stats */}
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 hover:shadow-md ${stat.cardBgClass} ${stat.cardBorderClass}`}
                    >
                        {/* Upper Section: Icon on Left, Column of Labels on Right */}
                        <div className="flex !items-start gap-3 !text-left">
                            {/* Circle Icon */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${stat.iconBgClass}`}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColorClass}`} strokeWidth={2} />
                            </div>
                            
                            {/* Label + Value + Subtitle */}
                            <div className="flex flex-col !items-start !text-left">
                                <span 
                                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} 
                                    className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-1.5 !text-left"
                                >
                                   {stat.label}
                                </span>
                                <h3 
                                    style={{ fontSize: '24px', fontWeight: 850 }} 
                                    className="text-slate-800 dark:text-slate-55 leading-none tracking-tight !text-left"
                                >
                                    {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                                </h3>
                                <span 
                                    style={{ fontSize: '12px', fontWeight: 500 }} 
                                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                >
                                    {stat.subtext}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Status Pie Chart */}
                <div className="!bg-white dark:!bg-slate-900 p-4 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden flex flex-col h-full justify-between">
                    <span 
                        style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} 
                        className="uppercase text-slate-500 dark:text-slate-450 leading-none mb-3 !text-left block"
                    >
                        STATUS MIX
                    </span>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-14 h-14 shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} innerRadius={16} outerRadius={26} paddingAngle={4} dataKey="value" stroke="transparent">
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center gap-1.5 flex-1">
                            {statusData.map(d => (
                                <div key={d.name} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                                    <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap"><span className="font-black text-slate-800 dark:text-slate-200">{d.value}</span> {d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Source Chart */}
                <div className="!bg-white dark:!bg-slate-900 p-4 !rounded-[24px] !border !border-slate-100 dark:!border-slate-800 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all !overflow-hidden flex flex-col h-full justify-between">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-900/20">
                            <Briefcase className="w-4 h-4 text-yellow-550 dark:text-yellow-400" />
                        </div>
                        <span 
                            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} 
                            className="uppercase text-slate-500 dark:text-slate-450 leading-none !text-left"
                        >
                            SOURCES
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-widest">ENTRY ANALYSIS</span>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col xl:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full bg-white border border-slate-200 allow-curve rounded-xl shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, customer, service, staff, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-transparent text-xs font-semibold placeholder:text-slate-400 text-slate-900 focus:outline-none allow-curve rounded-xl"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <CustomDropdown
                        value={dateFilter}
                        onChange={setDateFilter}
                        options={[
                            { value: 'all', label: 'All Dates' },
                            { value: 'today', label: 'Today' },
                            { value: 'week', label: 'This Week' },
                            { value: 'month', label: 'This Month' }
                        ]}
                        className="w-full xl:w-36 h-[38px] bg-white border border-slate-200 allow-curve rounded-xl shadow-sm hover:shadow-md [&>button]:border-none [&>button]:shadow-none [&>button]:h-full [&>button]:py-0 [&>button]:bg-transparent [&_span]:normal-case [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-700 flex-1 xl:flex-none"
                        icon={<CalendarDays className="w-4 h-4 mr-1 text-slate-500" />}
                    />
                    <CustomDropdown
                        value={staffFilter}
                        onChange={setStaffFilter}
                        options={[
                            { value: 'all', label: 'All Staff' },
                            ...staff.map(s => ({ value: s._id, label: s.name }))
                        ]}
                        className="w-full xl:w-36 h-[38px] bg-white border border-slate-200 allow-curve rounded-xl shadow-sm hover:shadow-md [&>button]:border-none [&>button]:shadow-none [&>button]:h-full [&>button]:py-0 [&>button]:bg-transparent [&_span]:normal-case [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-700 flex-1 xl:flex-none"
                    />
                    <CustomDropdown
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        className="w-full xl:w-36 h-[38px] bg-white border border-slate-200 allow-curve rounded-xl shadow-sm hover:shadow-md [&>button]:border-none [&>button]:shadow-none [&>button]:h-full [&>button]:py-0 [&>button]:bg-transparent [&_span]:normal-case [&_span]:text-xs [&_span]:font-semibold [&_span]:text-slate-700 flex-1 xl:flex-none"
                    />
                     
                    <button className="flex items-center justify-center gap-2 px-3 h-[38px] bg-white border border-slate-200 text-slate-700 text-xs font-semibold allow-curve rounded-xl shadow-sm hover:bg-slate-50 transition-all flex-1 xl:flex-none shrink-0">
                        <Filter className="w-3.5 h-3.5 text-slate-550" /> Filters
                    </button>
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
                <div className="bg-white border border-slate-200 allow-curve rounded-2xl shadow-sm overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">ID</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Date & Time ↓</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Service</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Staff</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Outlet</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
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
                                            className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/admin/bookings/${b._id}`)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">#{b._id?.slice(-6).toUpperCase() || 'NULL'}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(b._id); }} className="text-slate-400 hover:text-slate-600 transition-colors w-fit"><Copy className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2">
                                                    <CalendarDays className="w-4 h-4 text-slate-500 mt-0.5" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase leading-none">
                                                            {b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-none">
                                                            {b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-purple-100 flex items-center justify-center text-[12px] font-black text-purple-600 flex-shrink-0 allow-curve rounded-lg">
                                                        {b.client?.name?.[0]?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 gap-1">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none truncate">{b.client?.name || 'UNKNOWN'}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 tracking-wider leading-none flex items-center gap-1">
                                                            {maskPhone(b.client?.phone, user?.role) || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider max-w-[140px] truncate">{b.service?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[9px] font-black text-emerald-700 flex-shrink-0">
                                                        {b.staff?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide truncate">{b.staff?.name || 'UNASSIGNED'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide leading-none">{b.outlet?.name || 'MAIN OUTLET'}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black allow-curve rounded-lg uppercase tracking-wider ${b.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : b.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : b.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-indigo-500' : b.status === 'pending' ? 'bg-amber-500' : b.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/bookings/${b._id}`);
                                                        }}
                                                        className="p-2 bg-white border border-slate-200 text-slate-500 allow-curve rounded-lg hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        className="p-2 bg-white border border-slate-200 text-slate-500 allow-curve rounded-lg hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                                                    >
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {filteredBookings.length > 0 && (
                        <div className="bg-white px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[11px] font-semibold text-slate-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                            </span>
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider hover:text-slate-900 transition-colors disabled:opacity-30"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" /> PREV
                                </button>
                                <div className="px-3 py-1.5 border border-slate-300 text-slate-900 font-black text-[11px] allow-curve rounded-md mx-2">
                                    {currentPage}
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider hover:text-slate-900 transition-colors disabled:opacity-30"
                                >
                                    NEXT <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stay Organized Banner */}
            <div className="mt-8 bg-white border border-slate-200 allow-curve rounded-2xl shadow-sm p-6 relative overflow-hidden flex items-center justify-between">
                <div className="flex items-start gap-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">
                        i
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-slate-900">Stay organized!</h4>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1">Use filters and search to quickly find bookings. Click on a booking to view full details or take action.</p>
                    </div>
                </div>
                <div className="hidden md:block absolute right-6 -bottom-6 opacity-40 mix-blend-multiply pointer-events-none">
                    <CalendarDays className="w-32 h-32 text-blue-100" />
                </div>
            </div>

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
