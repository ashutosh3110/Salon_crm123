import React, { useState, useMemo } from 'react';
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
    Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { dashboardStats as rawStats, appointments as staticAppointments } from '../../data/receptionistData';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import { MOCK_SERVICES, MOCK_STAFF } from '../../data/appMockData';

export default function ReceptionistDashboard() {
    const { user } = useAuth();
    const { bookings: registryBookings, addBooking, updateBookingStatus } = useBookingRegistry();

    // Map icons back to stats since JSON can't store components
    const stats = rawStats.map(stat => {
        const iconMap = {
            "Today's Appointments": Calendar,
            "Pending Check-ins": Clock,
            "Completed Today": CheckCircle2,
            "New Registrations": UserPlus
        };
        return { ...stat, icon: iconMap[stat.label] };
    });

    // Combine static and registry bookings for the live feed
    const liveFeed = useMemo(() => {
        const mappedRegistry = registryBookings.map(b => ({
            id: b.id,
            client: b.clientName,
            service: Array.isArray(b.services) ? b.services[0].name : b.service,
            time: b.time,
            professional: b.staffName || 'Unassigned',
            status: b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : 'Upcoming',
            source: b.source || 'APP',
            isRegistry: true
        }));
        return [...mappedRegistry, ...staticAppointments].slice(0, 5); // Show latest 5
    }, [registryBookings]);

    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
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

    const handleAction = (protocol) => {
        if (protocol === 'Client Registration') setIsRegistrationOpen(true);
        if (protocol === 'Booking') setIsBookingOpen(true);
        if (protocol === 'Day End') {
            setReporting(true);
            setTimeout(() => {
                setReporting(false);
                alert('Shift Finalization Protocol: EOD Report generated and synchronized with core vault.');
            }, 2000);
        }
    };

    const handleCheckIn = (id, isRegistry) => {
        if (isRegistry) {
            updateBookingStatus(id, 'arrived');
        }
        alert(`Protocol Clearance: Guest token checked-in.`);
    };

    const handleManualBookingSubmit = (e) => {
        e.preventDefault();
        const service = MOCK_SERVICES.find(s => s._id === newBooking.serviceId);
        const staff = MOCK_STAFF.find(s => s._id === newBooking.staffId);

        if (!service || !staff || !newBooking.clientName || !newBooking.phone) {
            alert('Missing Required Protocols: Please complete all fields.');
            return;
        }

        const bookingObj = {
            id: `RECP-${Date.now()}`,
            clientId: `walkin-${Date.now()}`,
            clientName: newBooking.clientName,
            phone: newBooking.phone,
            services: [{ name: service.name, price: service.price, duration: service.duration }],
            totalPrice: service.price,
            totalDuration: service.duration,
            date: new Date(newBooking.date).toISOString(),
            appointmentDate: new Date(newBooking.date).toISOString(),
            time: newBooking.time,
            staffId: staff._id,
            staffName: staff.name,
            status: 'upcoming',
            timestamp: new Date().toISOString(),
            source: 'RECEPTION'
        };

        addBooking(bookingObj);
        setIsBookingOpen(false);
        setNewBooking({
            clientName: '',
            phone: '',
            serviceId: '',
            staffId: '',
            time: '12:00 PM',
            date: new Date().toISOString().split('T')[0]
        });
        alert('Internal Protocol: Manual booking successfully registered in vault.');
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Command Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Front Desk Command</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Live Salon Operations Matrix</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleAction('Client Registration')}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" /> New Registration
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
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Temporal Feed (Apt Ledger)</h2>
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
                                    <span className="text-primary">84%</span>
                                </div>
                                <div className="h-1 bg-surface-alt border border-border">
                                    <div className="h-full bg-primary" style={{ width: '84%' }} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="p-3 bg-surface-alt border border-border">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Revenue</p>
                                    <p className="text-sm font-black text-text">₹12,450</p>
                                </div>
                                <div className="p-3 bg-surface-alt border border-border">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Avg Ticket</p>
                                    <p className="text-sm font-black text-text">₹1,150</p>
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
                </div>
            </div>

            {/* Manual Booking Modal */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" /> NEW APPOINTMENT PROTOCOL
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
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Protocol (Service)</label>
                                <select
                                    required
                                    value={newBooking.serviceId}
                                    onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                                >
                                    <option value="">-- SELECT SERVICE --</option>
                                    {MOCK_SERVICES.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} - ₹{s.price}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assign Specialist</label>
                                <select
                                    required
                                    value={newBooking.staffId}
                                    onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                                >
                                    <option value="">-- AUTO ASSIGN / SELECT --</option>
                                    {MOCK_STAFF.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} - {s.specialization}</option>
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
                                        <option>11:00 AM</option>
                                        <option>12:00 PM</option>
                                        <option>01:00 PM</option>
                                        <option>02:00 PM</option>
                                        <option>03:00 PM</option>
                                        <option>04:00 PM</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                INITIALIZE BOOKING
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
