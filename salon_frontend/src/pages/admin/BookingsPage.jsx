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
import api from '../../services/api';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import BookingCalendar from '../../components/admin/BookingCalendar';
import BookingDetailModal from '../../components/admin/BookingDetailModal';
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
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [staff, setStaff] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [outletFilter, setOutletFilter] = useState('all');
    const [staffFilter, setStaffFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/bookings');
            const listData = data?.data?.results || data?.data || data || [];
            const list = Array.isArray(listData) ? listData : [];

            if (list.length === 0) {
                const mockData = [
                    {
                        _id: 'b1',
                        client: { name: 'Aryan Khan', phone: '+91 99887 76655' },
                        service: { name: 'Full Haircut & Wash', price: 850 },
                        staff: { name: 'Rahul Sharma' },
                        appointmentDate: new Date().setHours(10, 0, 0, 0),
                        status: 'upcoming',
                        outletName: 'Downtown Salon',
                        source: 'Online'
                    },
                    {
                        _id: 'b2',
                        client: { name: 'Pooja Hegde', phone: '+91 98765 43210' },
                        service: { name: 'Facial Clean-up', price: 1200 },
                        staff: { name: 'Anita Verma' },
                        appointmentDate: new Date().setHours(11, 30, 0, 0),
                        status: 'completed',
                        outletName: 'Bandra West',
                        source: 'Walk-in'
                    },
                    {
                        _id: 'b3',
                        client: { name: 'Varun Dhawan', phone: '+91 99001 12233' },
                        service: { name: 'Beard Trim', price: 450 },
                        staff: { name: 'Rahul Sharma' },
                        appointmentDate: new Date().setHours(14, 0, 0, 0),
                        status: 'no-show',
                        outletName: 'Downtown Salon',
                        source: 'Online'
                    }
                ];
                setBookings(mockData);
            } else {
                setBookings(list);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const listData = data?.data?.results || data?.results || data?.data || data || [];
            const list = Array.isArray(listData) ? listData : [];
            setStaff(list);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchStaff();
    }, []);

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
        // Logic to update status via API
        alert(`Booking ${id} status updated to: ${status}`);
        fetchBookings();
        setSelectedBooking(null);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Booking Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Monitor and manage all salon appointments.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-border shadow-sm">
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-surface'}`}
                    >
                        <Calendar className="w-4 h-4" /> CALENDAR
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-surface'}`}
                    >
                        <List className="w-4 h-4" /> LIST VIEW
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text mt-1">
                                <AnimatedCounter value={stat.value} />
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-surface-alt ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col xl:flex-row gap-4 hover-shine">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all input-expand"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        className="px-3 py-2.5 rounded-xl border border-border text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    <select
                        className="px-3 py-2.5 rounded-xl border border-border text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={outletFilter}
                        onChange={(e) => setOutletFilter(e.target.value)}
                    >
                        <option value="all">All Outlets</option>
                        {MOCK_OUTLETS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>

                    <select
                        className="px-3 py-2.5 rounded-xl border border-border text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={staffFilter}
                        onChange={(e) => setStaffFilter(e.target.value)}
                    >
                        <option value="all">All Staff</option>
                        {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>

                    <select
                        className="px-3 py-2.5 rounded-xl border border-border text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-Show</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {view === 'calendar' ? (
                <div className="flex bg-[#f3f3f3] rounded-3xl border border-border overflow-hidden shadow-2xl h-[800px] animate-reveal">
                    {/* Windows-style Light Sidebar */}
                    <div className="w-80 bg-white/50 backdrop-blur-xl flex flex-col border-r border-gray-100">
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-gray-100 bg-white/40">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#0078d4]" />
                                Appointments
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
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                    <span className="text-[10px] font-bold text-[#0078d4] bg-[#0078d4]/10 px-2 py-0.5 rounded-md">
                                        {filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth();
                                        }).length} Events
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {filteredBookings.filter(b => {
                                        const d = new Date(b.appointmentDate);
                                        return d.getDate() === selectedDate.getDate() &&
                                            d.getMonth() === selectedDate.getMonth();
                                    }).length === 0 ? (
                                        <p className="text-[11px] text-gray-400 italic px-2">No appointments for this day.</p>
                                    ) : (
                                        filteredBookings.filter(b => {
                                            const d = new Date(b.appointmentDate);
                                            return d.getDate() === selectedDate.getDate() &&
                                                d.getMonth() === selectedDate.getMonth();
                                        }).map((b, i) => (
                                            <div key={i} className="flex gap-4 px-3 group cursor-pointer hover:bg-white py-2 rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100">
                                                <div className="flex flex-col items-center gap-1 mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-[#0078d4] shadow-[0_0_8px_rgba(0,120,212,0.3)]" />
                                                    <div className="w-[1px] h-full bg-gray-100" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-900">
                                                        {new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-medium">{b.client?.name}</span>
                                                    <span className="text-[9px] text-[#0078d4] font-bold uppercase mt-0.5">{b.service?.name}</span>
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
                <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden card-interactive">
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
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {b.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-text">{b.client?.name || 'Unknown Client'}</span>
                                                        <span className="text-[10px] text-text-muted">{b.client?.phone || 'No phone'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-text-secondary">{b.service?.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 rounded-lg bg-surface-alt text-[10px] font-bold uppercase tracking-wider">{b.source || 'Online'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColors[b.status]}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'upcoming' ? 'bg-blue-500' : b.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
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
        </div>
    );
}
