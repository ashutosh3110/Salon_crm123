import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Calendar,
    Clock,
    User,
    Filter,
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
    RotateCcw
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import BookingCalendar from '../../components/admin/BookingCalendar';
import BookingDetailModal from '../../components/admin/BookingDetailModal';
import BookingModal from '../../components/admin/BookingModal';
import MiniCalendar from '../../components/admin/MiniCalendar';

const statusColors = {
    upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    'no-show': 'bg-red-50 text-red-600 border-red-100',
};

const MOCK_OUTLETS = [
    { id: 'mock-1', name: 'Downtown Salon' },
    { id: 'mock-2', name: 'Bandra West' }
];

export default function BookingsPage() {
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
    const [dateFilter, setDateFilter] = useState('today');
    const [outletFilter, setOutletFilter] = useState('all');
    const [staffFilter, setStaffFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Rename for compatibility with existing logic
    const bookings = contextBookings;
    const staff = contextStaff;
    const loading = false; // Always false since we use local state

    useEffect(() => {
        if (bookings.length > 0) {
            console.log('[BookingsPage] Sample Booking:', bookings[0]);
        }
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        if (!Array.isArray(bookings)) return [];
        return bookings.filter(b => {
            const clientName = b.client?.name || '';
            const clientPhone = b.client?.phone || '';
            const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clientPhone.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            const matchesStaff = staffFilter === 'all' || b.staff?._id === staffFilter;

            return matchesSearch && matchesStatus && matchesStaff;
        });
    }, [bookings, searchTerm, statusFilter, staffFilter]);

    // Summary calculations
    const stats = useMemo(() => {
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        return [
            { label: "Today's Total", value: safeBookings.length, icon: Calendar, color: 'text-primary' },
            { label: 'Upcoming', value: safeBookings.filter(b => b.status === 'upcoming').length, icon: RotateCcw, color: 'text-blue-500' },
            { label: 'Cancelled', value: safeBookings.filter(b => b.status === 'cancelled').length, icon: XCircle, color: 'text-gray-400' },
            { label: 'No-Shows', value: safeBookings.filter(b => b.status === 'no-show').length, icon: AlertCircle, color: 'text-red-500' },
        ];
    }, [bookings]);

    const handleUpdateStatus = async (id, status) => {
        updateBookingStatus(id, status);
        setSelectedBooking(null);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Booking Protocols</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Real-time scheduling intelligence</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2 rounded-none bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        <Plus className="w-4 h-4" /> ADD BOOKING
                    </button>

                    <div className="flex items-center gap-2 bg-surface-alt p-1 rounded-none border border-border">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-none text-[10px] font-extrabold uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-surface'}`}
                        >
                            <Calendar className="w-3.5 h-3.5" /> CALENDAR
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-none text-[10px] font-extrabold uppercase tracking-widest transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:bg-surface'}`}
                        >
                            <List className="w-3.5 h-3.5" /> LIST ARRAY
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <stat.icon className={`w-4 h-4 ${stat.color} transition-colors`} />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter value={stat.value} />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/40">
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-none border border-border shadow-sm flex flex-col xl:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-none border border-border bg-surface text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        className="px-4 py-2.5 rounded-none border border-border bg-surface text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    <select
                        className="px-4 py-2.5 rounded-none border border-border bg-surface text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        value={outletFilter}
                        onChange={(e) => setOutletFilter(e.target.value)}
                    >
                        <option value="all">Every Outlet</option>
                        {MOCK_OUTLETS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>

                    <select
                        className="px-4 py-2.5 rounded-none border border-border bg-surface text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                    >
                        <option value="all">Every Staff</option>
                        {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>

                    <select
                        className="px-4 py-2.5 rounded-none border border-border bg-surface text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Every Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-Show</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {view === 'calendar' ? (
                <div className="flex bg-surface-alt rounded-none border border-border overflow-hidden shadow-2xl h-[800px] animate-reveal">
                    {/* Windows-style Light Sidebar */}
                    <div className="w-80 bg-surface flex flex-col border-r border-border">
                        {/* Sidebar Header */}
                        <div className="p-8 border-b border-border bg-surface-alt/50">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" />
                                Sequence Map
                            </h3>
                        </div>

                        {/* Mini Calendar */}
                        <div className="p-4">
                            <MiniCalendar
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />
                        </div>

                        {/* Schedule List */}
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
                                        <p className="text-[11px] text-gray-400 px-2">No appointments for this day.</p>
                                    ) : (
                                        filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth();
                                        }).map((b, i) => (
                                            <div key={i} className="flex gap-4 px-4 group cursor-pointer hover:bg-surface-alt/50 py-3 rounded-none transition-all border border-transparent hover:border-border">
                                                <div className="flex flex-col items-center gap-1.5 mt-1.5">
                                                    <div className="w-2 h-2 rounded-none bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" />
                                                    <div className="w-[1px] h-full bg-border" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-text uppercase">
                                                        {new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[11px] text-text-muted font-bold tracking-tight mt-0.5">{b.client?.name}</span>
                                                    <span className="text-[9px] text-primary font-black uppercase tracking-widest mt-1.5">{b.service?.name}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calendar Source */}
                        <div className="p-6 border-t border-gray-100 bg-white/40">
                            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#0078d4]" />
                                <span>Salon Primary Calendar</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Calendar Grid */}
                    <div className="flex-1 flex flex-col bg-white">
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
                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Booking ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Service</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center">Source</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan="7" className="px-6 py-4">
                                                <div className="h-10 bg-surface rounded-xl relative overflow-hidden">
                                                    <div className="absolute inset-0 animate-shimmer"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-40">
                                                <Calendar className="w-12 h-12 mb-2" />
                                                <p className="text-sm font-bold">No bookings found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((b, index) => (
                                        <tr
                                            key={b._id}
                                            style={{ '--delay': `${index * 50}ms` }}
                                            className="hover:bg-surface/50 transition-all cursor-pointer group animate-stagger"
                                            onClick={() => setSelectedBooking(b)}
                                        >
                                            <td className="px-6 py-4 text-[11px] font-bold text-text-muted">#{b._id?.slice(-6).toUpperCase() || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-text">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toDateString() : 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-text-secondary font-medium uppercase">
                                                        {b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                                        {b.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-text uppercase tracking-tight">{b.client?.name || 'Unknown Entity'}</span>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{b.client?.phone || 'NO COMMS'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-[11px] font-black text-text-muted uppercase tracking-widest">{b.service?.name}</td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-3 py-1.5 rounded-none bg-surface-alt border border-border text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">{b.source || 'SYS'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[9px] font-black border uppercase tracking-widest ${statusColors[b.status]}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-none ${b.status === 'upcoming' ? 'bg-blue-500' : b.status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg hover:bg-surface tracking-widest text-text-muted group-hover:text-primary transition-all">
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

            {/* Detail Modal */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdateStatus={handleUpdateStatus}
                />
            )}

            {/* Add Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
            />
        </div>
    );
}
