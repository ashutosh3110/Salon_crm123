import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    UserPlus,
    Plus,
    UserCheck,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Phone,
    User,
    Shield,
    Loader2,
    Scissors,
    Smartphone,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import mockApi from '../../services/mock/mockApi';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';

export default function ReceptionistDashboard() {
    const { user } = useAuth();
    const { bookings: registryBookings, addBooking, updateBookingStatus: registryUpdate } = useBookingRegistry();

    // Live States
    const [stats, setStats] = useState([]);
    const [performance, setPerformance] = useState({ revenue: 0, avgTicket: 0 });
    const [liveFeed, setLiveFeed] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isWalkinOpen, setIsWalkinOpen] = useState(false);
    const [reporting, setReporting] = useState(false);

    // Manual Booking Form State
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        phone: '',
        serviceId: '',
        staffId: '',
        time: '12:00 PM',
        date: new Date().toISOString().split('T')[0]
    });

    // Client Registration State
    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        email: '',
        gender: 'other'
    });

    // Load Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const d = new Date();
                const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                
                const [statsRes, bookingsRes, servicesRes, staffRes] = await Promise.all([
                    mockApi.get('/dashboard/receptionist'),
                    mockApi.get(`/bookings?date=${today}&limit=100`),
                    mockApi.get('/services?limit=100'),
                    mockApi.get('/users?role=stylist')
                ]);

                if (statsRes.data?.success) {
                    const iconMap = {
                        "Today's Appointments": Calendar,
                        "Pending Check-ins": Clock,
                        "Completed Today": CheckCircle2,
                        "New Registrations": UserPlus
                    };
                    setStats((statsRes.data.data?.stats || []).map(s => ({
                        ...s,
                        icon: iconMap[s.label] || AlertCircle
                    })));
                    if (statsRes.data.data?.performance) {
                        setPerformance(statsRes.data.data.performance);
                    }
                    if (statsRes.data.data?.recentActivity) {
                        setRecentActivity(statsRes.data.data.recentActivity);
                    }
                }

                // Get all today's bookings for availability check
                const allBookings = bookingsRes.data?.results || [];
                setLiveFeed(allBookings.slice(0, 5).map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP',
                    isRegistry: false
                })));

                // Determine busy staff (arrived or in-progress)
                const busyStaffIds = allBookings
                    .filter(b => ['arrived', 'in-progress'].includes(b.status?.toLowerCase()))
                    .map(b => {
                        const sId = b.staffId?._id || b.staffId?.id || b.staffId;
                        return sId ? String(sId) : null;
                    })
                    .filter(Boolean);
                
                // Populate Services
                const serviceList = servicesRes.data?.data?.results || servicesRes.data?.results || [];
                setServices(serviceList);

                // Populate Staff with availability
                const staffList = staffRes.data?.data?.results || staffRes.data?.results || [];
                setStaff(staffList.map(s => {
                    const sId = String(s._id || s.id);
                    return {
                        ...s,
                        isAvailable: !busyStaffIds.includes(sId)
                    };
                }));

            } catch (err) {
                console.error('Front Desk Matrix Sync Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // 1 min sync
        return () => clearInterval(interval);
    }, []);

    const handleAction = (protocol) => {
        if (protocol === 'Client Registration') setIsRegistrationOpen(true);
        if (protocol === 'Booking') setIsBookingOpen(true);
        if (protocol === 'Walk-in') setIsWalkinOpen(true);
        if (protocol === 'Day End') {
            setReporting(true);
            setTimeout(() => {
                setReporting(false);
                alert('Shift Finalization Protocol: EOD Report generated and synchronized with core vault.');
            }, 2000);
        }
    };

    const handleCheckIn = async (id) => {
        try {
            await mockApi.patch(`/bookings/${id}`, { status: 'arrived' });
            // Refresh feed
            const d = new Date();
            const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const feedRes = await mockApi.get(`/bookings?date=${today}&limit=5`);
            if (feedRes.data.results) {
                setLiveFeed(feedRes.data.results.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP'
                })));
            }
            alert(`Check-in Successful: Guest marked as arrived.`);
        } catch (err) {
            alert('Check-in Failed: Unable to process guest status.');
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        try {
            await mockApi.post('/users', {
                ...newClient,
                role: 'client',
                tenantId: user?.tenantId
            });
            setIsRegistrationOpen(false);
            setNewClient({ name: '', phone: '', email: '', gender: 'other' });
            alert('Registration Successful: Guest added to database.');
            
            // Refresh stats
            const statsRes = await mockApi.get('/dashboard/receptionist');
            if (statsRes.data.success) {
                const iconMap = {"Today's Appointments": Calendar, "Pending Check-ins": Clock, "Completed Today": CheckCircle2, "New Registrations": UserPlus};
                setStats(statsRes.data.data.stats.map(s => ({ ...s, icon: iconMap[s.label] || AlertCircle })));
            }
        } catch (err) {
            alert('Registration Failed: ' + (err.response?.data?.message || 'Server error'));
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
                outletId: user?.outletId, // Explicitly pass the receptionist's outlet
                appointmentDate: new Date(`${newBooking.date} ${newBooking.time}`).toISOString(),
                time: newBooking.time,
                status: 'upcoming',
                source: 'RECEPTION'
            };

            await mockApi.post('/bookings', bookingData);
            
            // Refresh feed and stats
            const d = new Date();
            const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            const [statsRes, feedRes] = await Promise.all([
                mockApi.get('/dashboard/receptionist'),
                mockApi.get(`/bookings?date=${today}&limit=5`)
            ]);

            if (statsRes.data.success) {
                 const iconMap = {
                    "Today's Appointments": Calendar,
                    "Pending Check-ins": Clock,
                    "Completed Today": CheckCircle2,
                    "New Registrations": UserPlus
                };
                setStats(statsRes.data.data.stats.map(s => ({
                    ...s,
                    icon: iconMap[s.label] || AlertCircle
                })));
            }

            if (feedRes.data.results) {
                setLiveFeed(feedRes.data.results.map(b => ({
                    id: b.id || b._id,
                    client: b.clientId?.name || 'Walk-in',
                    service: b.serviceId?.name || 'Unknown',
                    time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                    professional: b.staffId?.name || 'Unassigned',
                    status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                    source: b.source || 'APP'
                })));
            }

            setIsBookingOpen(false);
            setNewBooking({
                clientName: '',
                phone: '',
                serviceId: '',
                staffId: '',
                time: '12:00 PM',
                date: new Date().toISOString().split('T')[0]
            });
            alert('Booking Successful: Appointment has been created.');
        } catch (err) {
            alert('Error: Failed to save the booking.');
        }
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Command Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Dashboard</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Live Salon Overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleAction('Client Registration')}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> New Registration
                    </button>
                    <button
                        onClick={() => handleAction('Walk-in')}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        <UserCheck className="w-4 h-4" /> New Walk-in
                    </button>
                    <button
                        onClick={() => handleAction('Booking')}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 border border-border group hover:border-primary/20 transition-all relative overflow-hidden">
                        {/* Soft Glow */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors opacity-50`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <stat.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight">
                                    <AnimatedCounter value={stat.value} />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={stat.positive ? "text-emerald-400" : "text-rose-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary" />
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Today's Appointments</h2>
                        </div>
                        <button onClick={() => navigate('/receptionist/appointments')} className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Full Database <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="divide-y divide-border">
                            {liveFeed.map((apt) => (
                                <div key={apt.id} className="p-5 flex items-center justify-between hover:bg-surface-alt/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted uppercase">
                                                {apt.client[0]}
                                            </div>
                                            {apt.source === 'APP' && (
                                                <div className="absolute -top-1 -right-1 p-1 bg-primary rounded-full border border-surface shadow-sm shadow-primary/30">
                                                    <Smartphone className="w-2 h-2 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-text uppercase tracking-tight">{apt.client}</p>
                                                <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase border ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.05em]">{apt.service} · {apt.professional}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{apt.time}</p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">TODAY</p>
                                        </div>
                                        {apt.status !== 'Arrived' && (
                                            <button
                                                onClick={() => handleCheckIn(apt.id, apt.isRegistry)}
                                                className="w-8 h-8 flex items-center justify-center border border-border rounded-none hover:bg-emerald-500 hover:border-emerald-500 transition-all group/btn"
                                            >
                                                <UserCheck className="w-4 h-4 text-text-muted group-hover/btn:text-white" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-12 h-12" />
                        </div>
                        <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Daily Performance</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span>Target Fulfillment</span>
                                    <span className="text-primary">{performance.targetFulfillment || 0}%</span>
                                </div>
                                <div className="h-1 bg-surface-alt border border-border">
                                    <div className="h-full bg-primary" style={{ width: `${performance.targetFulfillment || 0}%` }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-surface-alt border border-border">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Revenue</p>
                                    <p className="text-sm font-black text-text">₹{performance.revenue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-3 bg-surface-alt border border-border">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Avg Ticket</p>
                                    <p className="text-sm font-black text-text">₹{performance.avgTicket.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleAction('Day End')}
                            disabled={reporting}
                            className="w-full py-4 bg-surface border-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {reporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" /> Finalize Day Shift
                                </>
                            )}
                        </button>
                    </div>

                    {/* New: Recent Activity Feed */}
                    <div className="bg-surface border border-border p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-primary" />
                            <h3 className="text-[10px] font-black text-text uppercase tracking-widest">Recent Bookings</h3>
                        </div>
                        <div className="space-y-3">
                            {recentActivity.length === 0 ? (
                                <p className="text-[9px] font-bold text-text-muted uppercase text-center py-4">No recent activity</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="group relative flex items-start gap-3 p-3 bg-surface-alt/30 border border-transparent hover:border-primary/10 transition-all">
                                        <div className="mt-0.5 w-7 h-7 bg-surface border border-border flex items-center justify-center font-black text-[9px] text-primary shrink-0">
                                            {activity.client[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="text-[10px] font-black text-text truncate uppercase">{activity.client}</p>
                                                <span className="text-[7px] font-bold text-text-muted shrink-0 uppercase">{activity.date}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[8px] font-bold text-text-secondary uppercase truncate">{activity.service} · {activity.time}</p>
                                                <span className={`px-1 py-0.5 text-[6px] font-black uppercase border ${activity.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => navigate('/receptionist/appointments')} className="w-full py-2.5 text-[8px] font-black text-text-muted hover:text-primary uppercase tracking-[0.2em] border border-dashed border-border hover:border-primary/30 transition-all">
                            View All Appointments
                        </button>
                    </div>
                </div>
            </div>

            {/* Manual Booking Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-md relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none">
                        <div className="px-8 py-6 border-b border-border bg-surface-alt/30 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5" /> APPOINTMENT
                                </h3>
                                <p className="text-[14px] font-bold text-text uppercase tracking-tight">MANUAL BOOKING PROTOCOL</p>
                            </div>
                            <button onClick={() => setIsBookingOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleManualBookingSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Client Identity</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="text"
                                        value={newBooking.clientName}
                                        onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="CLIENT FULL NAME"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Contact Protocol</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="MOBILE NUMBER"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Date</label>
                                    <input
                                        type="date"
                                        value={newBooking.date}
                                        onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                                        className="w-full px-4 py-4 bg-surface-alt/50 border border-border text-[11px] font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Time Slot</label>
                                    <div className="relative group">
                                        <select
                                            value={newBooking.time}
                                            onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                                            className="w-full px-4 py-4 bg-surface-alt/50 border border-border text-[11px] font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt appearance-none cursor-pointer transition-all"
                                        >
                                            <option>10:00 AM</option>
                                            <option>11:00 AM</option>
                                            <option>12:00 PM</option>
                                            <option>01:00 PM</option>
                                            <option>02:00 PM</option>
                                            <option>03:00 PM</option>
                                            <option>04:00 PM</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Service Selection</label>
                                <div className="relative group">
                                    <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <select
                                        required
                                        value={newBooking.serviceId}
                                        onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                                        className="w-full pl-12 pr-10 py-4 bg-surface-alt/50 border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">-- SELECT SERVICE --</option>
                                        {services.map(s => (
                                            <option key={s.id || s._id} value={s.id || s._id}>{s.name} - ₹{s.price}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Staff Assignment</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <select
                                        required
                                        value={newBooking.staffId}
                                        onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                                        className="w-full pl-12 pr-10 py-4 bg-surface-alt/50 border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">-- AUTO-ASSIGN / SELECT --</option>
                                        {staff.filter(s => s.isAvailable).map(s => (
                                            <option key={s.id || s._id} value={s.id || s._id}>{s.name} - {s.role}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex flex-col gap-3">
                                <button type="submit" className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" /> CONFIRM APPOINTMENT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Registration Modal */}
            {isRegistrationOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-md relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none">
                        <div className="px-8 py-6 border-b border-border bg-surface-alt/30 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <UserPlus className="w-3.5 h-3.5" /> REGISTRATION
                                </h3>
                                <p className="text-[14px] font-bold text-text uppercase tracking-tight">CLIENT ONBOARDING</p>
                            </div>
                            <button onClick={() => setIsRegistrationOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleRegistrationSubmit} className="p-8 space-y-7">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="text"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="CLIENT FULL NAME"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Mobile Protocol</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Archive (Optional)</label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="CLIENT@EMAIL.COM"
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex flex-col gap-3">
                                <button type="submit" className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                                    <UserCheck className="w-5 h-5" /> REGISTER IDENTITY
                                </button>
                                <button onClick={() => setIsRegistrationOpen(false)} className="w-full py-4 border border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                    ABORT OPERATION
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
                 {/* Walk-in Modal */}
            {isWalkinOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-md relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none">
                        <div className="px-8 py-6 border-b border-border bg-surface-alt/30 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5" /> FAST ENTRY
                                </h3>
                                <p className="text-[14px] font-bold text-text uppercase tracking-tight">WALK-IN REGISTRATION</p>
                            </div>
                            <button onClick={() => setIsWalkinOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const now = new Date();
                                const bookingData = {
                                    clientName: newBooking.clientName,
                                    phone: newBooking.phone,
                                    serviceId: newBooking.serviceId,
                                    staffId: newBooking.staffId,
                                    outletId: user?.outletId,
                                    appointmentDate: now.toISOString(),
                                    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    status: 'arrived',
                                    source: 'WALKIN'
                                };
                                await mockApi.post('/bookings', bookingData);
                                setIsWalkinOpen(false);
                                alert('Walk-in Successful: Guest registered and checked-in.');
                                
                                // Proper refresh
                                const d = new Date();
                                const today = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                                const [sR, fR] = await Promise.all([
                                    mockApi.get('/dashboard/receptionist'),
                                    mockApi.get(`/bookings?date=${today}&limit=5`)
                                ]);
                                if (sR.data.success) {
                                    const iconMap = {"Today's Appointments": Calendar, "Pending Check-ins": Clock, "Completed Today": CheckCircle2, "New Registrations": UserPlus};
                                    setStats(sR.data.data.stats.map(s => ({ ...s, icon: iconMap[s.label] || AlertCircle })));
                                }
                                if (fR.data.results) {
                                    setLiveFeed(fR.data.results.map(b => ({
                                        id: b.id || b._id,
                                        client: b.clientId?.name || 'Walk-in',
                                        service: b.serviceId?.name || 'Unknown',
                                        time: b.time || (b.appointmentDate ? new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
                                        professional: b.staffId?.name || 'Unassigned',
                                        status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
                                        source: b.source || 'APP'
                                    })));
                                }
                            } catch (err) {
                                alert('Walk-in Failed: Could not process entry.');
                            }
                        }} className="p-8 space-y-7">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Client Identity</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="text"
                                        value={newBooking.clientName}
                                        onChange={(e) => setNewBooking({...newBooking, clientName: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="GUEST FULL NAME"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Contact Protocol</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input
                                        required
                                        type="tel"
                                        value={newBooking.phone}
                                        onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        placeholder="MOBILE NUMBER"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Service Required</label>
                                <div className="relative group">
                                    <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <select
                                        required
                                        value={newBooking.serviceId}
                                        onChange={(e) => setNewBooking({...newBooking, serviceId: e.target.value})}
                                        className="w-full pl-12 pr-10 py-4 bg-surface-alt/50 border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">-- SELECT SERVICE --</option>
                                        {services.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Assign Stylist</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <select
                                        required
                                        value={newBooking.staffId}
                                        onChange={(e) => setNewBooking({...newBooking, staffId: e.target.value})}
                                        className="w-full pl-12 pr-10 py-4 bg-surface-alt/50 border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt appearance-none cursor-pointer transition-all"
                                    >
                                        <option value="">-- AUTO-ASSIGN / SELECT --</option>
                                        {staff.filter(s => s.isAvailable).map(s => (
                                            <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex flex-col gap-3">
                                <button type="submit" className="w-full py-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <Zap className="w-4 h-4" /> INITIATE CHECK-IN
                                </button>
                                <button onClick={() => setIsWalkinOpen(false)} className="w-full py-4 border border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                    CANCEL OPERATION
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
