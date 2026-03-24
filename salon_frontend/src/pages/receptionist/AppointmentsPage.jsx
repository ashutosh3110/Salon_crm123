import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    MoreVertical,
    CheckCircle2,
    XCircle,
    MapPin,
    X,
    Phone,
    Scissors,
    Shield,
    Edit3,
    Trash2,
    CreditCard,
    Smartphone,
    UserPlus,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import api from '../../services/api';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { bookings: registryBookings, addBooking, updateStatus: registryUpdate } = useBookingRegistry();

    // Live States
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Manual Booking Form State
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        phone: '',
        serviceId: '',
        staffId: '',
        time: '10:00 AM',
        date: new Date().toISOString().split('T')[0]
    });

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dateStr = currentDate.toISOString().split('T')[0];
                const [bookingsRes, servicesRes, staffRes] = await Promise.all([
                    api.get(`/bookings?date=${dateStr}&limit=100`),
                    api.get('/services?limit=100'),
                    api.get('/users?role=stylist')
                ]);

                if (bookingsRes.data.results) {
                    const allBookings = bookingsRes.data.results;
                    setAppointments(allBookings.map(b => ({
                        id: b.id || b._id,
                        client: b.clientId?.name || 'Walk-in',
                        service: b.serviceId?.name || 'Unknown',
                        time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                        professional: b.staffId?.name || 'Unassigned',
                        staffId: b.staffId?._id || b.staffId?.id || null,
                        status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                        price: `₹${b.price || 0}`,
                        phone: b.clientId?.phone || b.phone || '',
                        source: b.source || 'APP',
                        isRegistry: false
                    })));

                    // Determine busy staff (arrived or in-progress)
                    const busyStaffIds = allBookings
                        .filter(b => ['arrived', 'in-progress'].includes(b.status.toLowerCase()))
                        .map(b => b.staffId?._id || b.staffId?.id)
                        .filter(Boolean);

                    if (staffRes.data.success) {
                        setStaff(staffRes.data.data.results.map(s => ({
                            ...s,
                            isAvailable: !busyStaffIds.includes(s._id || s.id)
                        })));
                    }
                }

                if (servicesRes.data.success) setServices(servicesRes.data.data.results);

            } catch (err) {
                console.error('Ledger Sync Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentDate]);

    const filteredAppointments = appointments.filter(apt =>
        apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.phone?.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''))
    );

    const handleBill = (apt) => {
        navigate('/pos', {
            state: {
                preSelectClient: {
                    name: apt.client,
                    phone: apt.phone
                },
                preSelectService: apt.service,
                preSelectStaffId: apt.staffId || null,
                appointmentId: apt.id
            }
        });
    };

    const handleCheckIn = async (id) => {
        try {
            await api.patch(`/bookings/${id}`, { status: 'arrived' });
            // Update local state
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Arrived' } : a));
            alert(`Protocol Clearance: Appointment ${id} marked as ARRIVED.`);
        } catch (err) {
            alert('Status Sync Error: Could not update booking.');
        }
    };

    const handleViewDetails = (id) => {
        const apt = appointments.find(a => a.id === id);
        setSelectedAppointment(apt);
        setIsDetailsOpen(true);
    };

    const handleCancelAppointment = async (id) => {
        if (confirm(`Authorize cancellation of ${id}? This action is permanent.`)) {
            try {
                await api.patch(`/bookings/${id}`, { status: 'cancelled' });
                setAppointments(prev => prev.filter(a => a.id !== id));
                setIsDetailsOpen(false);
                alert('Security Clearance: Appointment protocol terminated.');
            } catch (err) {
                alert('Cancellation Failed: Server rejected the command.');
            }
        }
    };

    const handleManualBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (!newBooking.serviceId || !newBooking.staffId || !newBooking.clientName || !newBooking.phone) {
            alert('Missing Required Protocols: Please complete all fields.');
            return;
        }

        try {
            const bookingData = {
                clientName: newBooking.clientName,
                phone: newBooking.phone,
                serviceId: newBooking.serviceId,
                staffId: newBooking.staffId,
                outletId: user?.outletId,
                appointmentDate: new Date(`${newBooking.date} ${newBooking.time}`).toISOString(),
                time: newBooking.time,
                status: 'upcoming',
                source: 'RECEPTION'
            };

            await api.post('/bookings', bookingData);
            
            // Refresh
            const dateStr = currentDate.toISOString().split('T')[0];
            const bookingsRes = await api.get(`/bookings?date=${dateStr}&limit=100`);
            if (bookingsRes.data.results) {
                setAppointments(bookingsRes.data.results.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    price: `₹${b.price || 0}`,
                    phone: b.clientId?.phone || b.phone || '',
                    source: b.source || 'APP'
                })));
            }

            setIsBookingOpen(false);
            setNewBooking({
                clientName: '',
                phone: '',
                serviceId: '',
                staffId: '',
                time: '10:00 AM',
                date: new Date().toISOString().split('T')[0]
            });
            alert('Internal Protocol: Manual booking successfully registered.');
        } catch (err) {
            alert('Registry Write Error: Failed to save booking.');
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const changeDate = (days) => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + days);
        setCurrentDate(nextDate);
    };

    // --- Calendar Implementation ---
    const timeSlots = [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
        '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
        '07:00 PM', '07:30 PM', '08:00 PM'
    ];

    const CalendarView = () => {
        return (
            <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col h-[700px]">
                {/* Calendar Header (Staff Names) */}
                <div className="flex border-b border-border bg-surface-alt/50 sticky top-0 z-10">
                    <div className="w-24 border-r border-border shrink-0 p-4 text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center justify-center">
                        TIME
                    </div>
                    <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                        {staff.map(member => (
                            <div key={member._id} className="min-w-[150px] flex-1 border-r border-border last:border-r-0 p-4 text-center">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest">{member.name}</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-0.5">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {timeSlots.map(time => (
                        <div key={time} className="flex border-b border-border/50 min-h-[80px] group transition-all">
                            {/* Time Label */}
                            <div className="w-24 border-r border-border shrink-0 p-3 bg-surface-alt/20 flex flex-col items-center justify-start">
                                <span className="text-[11px] font-black text-text uppercase tracking-tight">{time}</span>
                            </div>

                            {/* Staff Columns */}
                            <div className="flex flex-1 overflow-x-auto scrollbar-hide">
                                {staff.map(member => {
                                    // Find appointments for this time slot and this professional
                                    const slotApts = appointments.filter(apt =>
                                        apt.time === time &&
                                        (apt.professional === member.name || (apt.professional === 'Unassigned' && member.name === 'Anita Verma'))
                                    );

                                    return (
                                        <div key={staff._id} className="min-w-[150px] flex-1 border-r border-border/30 last:border-r-0 p-2 relative group/cell hover:bg-surface-alt/10 transition-colors">
                                            {slotApts.map(apt => (
                                                <div
                                                    key={apt.id}
                                                    onClick={() => handleViewDetails(apt.id)}
                                                    className={`absolute inset-1 p-2 border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:z-20 shadow-sm ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                                            apt.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/30 opacity-60' :
                                                                'bg-primary/10 border-primary/30'
                                                        }`}
                                                >
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[9px] font-black text-text uppercase tracking-tight truncate flex-1">{apt.client}</span>
                                                                {apt.source === 'APP' && <Smartphone className="w-2 h-2 text-primary" />}
                                                            </div>
                                                            <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest truncate">{apt.service}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className={`text-[6px] font-black px-1 py-0.5 border ${apt.status === 'Arrived' ? 'border-emerald-500/50 text-emerald-600' : 'border-primary/50 text-primary'
                                                                } uppercase`}>
                                                                {apt.status}
                                                            </span>
                                                            <span className="text-[7px] font-black text-text-muted">{apt.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Appointments</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">View and manage all salon bookings</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-surface border border-border p-1">
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                        >
                            Calendar
                        </button>
                    </div>
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Book Appointment
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface border border-border p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="FIND APPOINTMENT..."
                            className="pl-10 pr-4 py-2 bg-surface-alt border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/30 w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 bg-surface-alt border border-border hover:border-primary/30 transition-all">
                        <Filter className="w-4 h-4 text-text-muted" />
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-border bg-surface-alt px-3 py-1.5">
                        <button onClick={() => changeDate(-1)} className="p-1 hover:text-primary"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-[10px] font-black uppercase tracking-widest min-w-[120px] text-center">{formatDate(currentDate)}</span>
                        <button onClick={() => changeDate(1)} className="p-1 hover:text-primary"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Views */}
            {view === 'list' ? (
                <div className="bg-surface border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Booking ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Client</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Service</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Stylist</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-surface-alt/30 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{apt.id}</p>
                                                {apt.source === 'APP' ? (
                                                    <Smartphone className="w-3 h-3 text-primary animate-pulse" title="Mobile App Booking" />
                                                ) : (
                                                    <User className="w-3 h-3 text-text-muted opacity-50" title="Manual Entry" />
                                                )}
                                            </div>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{apt.source || 'INTERNAL'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted">
                                                    {apt.client[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text uppercase tracking-tight">{apt.client}</p>
                                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">{maskPhone(apt.phone)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-[11px] font-bold text-text uppercase tracking-widest">{apt.service}</p>
                                            <p className="text-[9px] font-black text-primary/70 uppercase mt-0.5">{apt.price}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 text-sm font-black text-text uppercase tracking-tight">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    {apt.time}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">{apt.professional}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                                    apt.status === 'Completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                                                        apt.status === 'Upcoming' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                                            'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${apt.status === 'Arrived' ? 'bg-emerald-500' :
                                                        apt.status === 'Completed' ? 'bg-blue-500' :
                                                            apt.status === 'Upcoming' ? 'bg-amber-500' : 'bg-rose-500'
                                                        }`} />
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {apt.status === 'Arrived' && (
                                                    <button
                                                        onClick={() => handleBill(apt)}
                                                        className="px-3 py-1.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-90 transition-all border border-primary shadow-sm shadow-primary/20"
                                                    >
                                                        <CreditCard className="w-3 h-3" /> Bill
                                                    </button>
                                                )}
                                                {apt.status === 'Upcoming' && (
                                                    <button
                                                        onClick={() => handleCheckIn(apt.id, apt.isRegistry)}
                                                        className="p-2 border border-border hover:bg-emerald-500/5 hover:border-emerald-500/20 group transition-all"
                                                        title="Mark Arrived"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-text-muted group-hover:text-emerald-500" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleViewDetails(apt.id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="View Protocol">
                                                    <MoreVertical className="w-4 h-4 text-text-muted group-hover:text-text" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="opacity-20 flex flex-col items-center">
                                                <CalendarIcon className="w-12 h-12 mb-2" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No active protocols in ledger</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <CalendarView />
            )}

            {/* Manual Booking Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> NEW APPOINTMENT
                            </h3>
                            <button onClick={() => setIsBookingOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleManualBookingSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Client Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newBooking.clientName}
                                        onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value.replace(/[^a-zA-Z\\s]/g, '') })}
                                        className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20"
                                        placeholder="CLIENT FULL NAME"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Service</label>
                                <select
                                    required
                                    value={newBooking.serviceId}
                                    onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                                >
                                    <option value="">-- SELECT SERVICE --</option>
                                    {services.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} - ₹{s.price}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Stylist</label>
                                <select
                                    required
                                    value={newBooking.staffId}
                                    onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                                >
                                    <option value="">-- AUTO ASSIGN / SELECT --</option>
                                    {staff.filter(s => s.isAvailable !== false).map(s => (
                                        <option key={s._id} value={s._id}>{s.name} - {s.role}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        value={newBooking.date}
                                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-alt border border-border text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Time Slot</label>
                                    <select
                                        value={newBooking.time}
                                        onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                                    >
                                        <option>10:00 AM</option>
                                        <option>10:30 AM</option>
                                        <option>11:00 AM</option>
                                        <option>11:30 AM</option>
                                        <option>12:00 PM</option>
                                        <option>01:00 PM</option>
                                        <option>02:00 PM</option>
                                        <option>03:00 PM</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                Book Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {isDetailsOpen && selectedAppointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest">APPOINTMENT DETAIL: {selectedAppointment.id}</h3>
                            <button onClick={() => setIsDetailsOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-border">
                                <div className="w-16 h-16 bg-surface-alt border border-border flex items-center justify-center font-black text-xl text-text-muted">
                                    {selectedAppointment.client[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">{selectedAppointment.client}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedAppointment.id} · {selectedAppointment.source || 'MANUAL'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> Schedule</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.time}</p>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase">Today</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Scissors className="w-3 h-3" /> Service</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.service}</p>
                                    <p className="text-[10px] font-black text-primary uppercase">{selectedAppointment.price}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><User className="w-3 h-3" /> Professional</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.professional}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2"><Phone className="w-3 h-3" /> Contact</p>
                                    <p className="text-sm font-black text-text uppercase">{maskPhone(selectedAppointment.phone)}</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex gap-3">
                                {selectedAppointment.status === 'Upcoming' && (
                                    <button
                                        onClick={() => handleCheckIn(selectedAppointment.id, selectedAppointment.isRegistry)}
                                        className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                                    >
                                        MARK ARRIVED
                                    </button>
                                )}
                                <button
                                    onClick={() => handleCancelAppointment(selectedAppointment.id, selectedAppointment.isRegistry)}
                                    className="flex-1 py-3 border border-border text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    CANCEL APPOINTMENT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
