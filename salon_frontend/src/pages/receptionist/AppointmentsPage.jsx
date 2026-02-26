import React, { useState } from 'react';
import {
    Calendar,
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
    Trash2
} from 'lucide-react';

const appointments = [
    { id: 'APT-1001', client: 'Ananya Iyer', service: 'HydraFacial', time: '10:30 AM', professional: 'Meera', status: 'Arrived', price: '₹2,500', phone: '+91 98765 43210' },
    { id: 'APT-1002', client: 'Vikram Malhotra', service: 'Men\'s Grooming', time: '11:00 AM', professional: 'Suresh', status: 'Upcoming', price: '₹850', phone: '+91 98765 43211' },
    { id: 'APT-1003', client: 'Sarah Khan', service: 'Hair Coloring', time: '11:15 AM', professional: 'Elena', status: 'Cancelled', price: '₹4,200', phone: '+91 98765 43212' },
    { id: 'APT-1004', client: 'Rahul Bajaj', service: 'Full Body Massage', time: '12:00 PM', professional: 'David', status: 'Completed', price: '₹3,500', phone: '+91 98765 43213' },
    { id: 'APT-1005', client: 'Sneha Kapur', service: 'Manicure & Pedicure', time: '01:30 PM', professional: 'Ritu', status: 'Upcoming', price: '₹1,200', phone: '+91 98765 43214' },
];

export default function AppointmentsPage() {
    const [appointmentData, setAppointmentData] = useState(appointments);
    const [view, setView] = useState('list'); // 'list' or 'calendar'
    const [searchQuery, setSearchQuery] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const filteredAppointments = appointmentData.filter(apt =>
        apt.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleCheckIn = (id) => {
        setAppointmentData(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: 'Arrived' } : apt
        ));
        alert(`Protocol Clearance: Appointment ${id} marked as ARRIVED.`);
    };

    const handleViewDetails = (id) => {
        const apt = appointmentData.find(a => a.id === id);
        setSelectedAppointment(apt);
        setIsDetailsOpen(true);
    };

    const handleCancelAppointment = (id) => {
        if (confirm(`Authorize cancellation of ${id}? This action is permanent.`)) {
            setAppointmentData(prev => prev.filter(a => a.id !== id));
            setIsDetailsOpen(false);
            alert('Security Clearance: Appointment protocol terminated.');
        }
    };

    const handleBookAppointment = () => {
        setIsBookingOpen(true);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const changeDate = (days) => {
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + days);
        setCurrentDate(nextDate);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Appointment Ledger</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Manage bookings & stylist schedules</p>
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
                        onClick={handleBookAppointment}
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

            {/* Appointments Content */}
            <div className="bg-surface border border-border shadow-sm overflow-hidden min-h-[400px]">
                {view === 'list' ? (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-alt/50 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">ID / Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Client Information</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Service & Stylist</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Time / Price</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredAppointments.length > 0 ? filteredAppointments.map((apt) => (
                                    <tr key={apt.id} className="hover:bg-surface-alt/30 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-text-muted tracking-widest">{apt.id}</p>
                                                <span className={`inline-flex px-2 py-0.5 text-[8px] font-black uppercase border ${apt.status === 'Arrived' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        apt.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                            apt.status === 'Completed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                                                'bg-surface-alt border-border text-text-muted'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                    {apt.client[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-text uppercase tracking-tight">{apt.client}</p>
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{apt.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{apt.service}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <User className="w-3 h-3 text-primary" />
                                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{apt.professional}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                                <p className="text-sm font-black text-text">{apt.time}</p>
                                            </div>
                                            <p className="text-[10px] font-black text-primary mt-0.5">{apt.price}</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => alert(`Opening details for ${apt.id}`)} className="p-2 bg-surface-alt border border-border hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4 text-text-muted" />
                                                </button>
                                                {apt.status === 'Upcoming' && (
                                                    <button onClick={() => handleCheckIn(apt.id)} className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                                                        Check-In
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <Search className="w-10 h-10" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No matching sequences found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 border-t border-border bg-surface-alt/30 flex items-center justify-between mt-auto">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Showing {filteredAppointments.length} matching entries</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1.5 border border-border bg-surface text-[9px] font-black uppercase tracking-widest disabled:opacity-30"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="px-3 py-1.5 border border-border bg-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-alt"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
                        <Calendar className="w-16 h-16 text-primary opacity-20" />
                        <div>
                            <h3 className="text-xl font-black text-text uppercase tracking-tight">Calendar View Interface</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 opacity-60">Stylist occupancy matrix loading...</p>
                        </div>
                    </div>
                )}
            </div>
            {/* Modals Interface */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-xl relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> SECURE APPOINTMENT BOOKING
                            </h3>
                            <button onClick={() => setIsBookingOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-5 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Client</label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input type="text" autoFocus placeholder="SEARCH EXISTING DATABASE..." className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Service Matrix</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                                            <option>Bridges & Cuts</option>
                                            <option>Skin Matrix Hydra</option>
                                            <option>Color Frequency</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assigned Professional</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                                            <option>Meera (Level 4)</option>
                                            <option>Suresh (Level 3)</option>
                                            <option>Elena (Level 5)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">SLOT AVAILABLE</span>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsBookingOpen(false)} className="px-6 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">ABORT</button>
                                    <button onClick={() => { alert('Appointment Allocated'); setIsBookingOpen(false); }} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">AUTHORIZE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Appointment Details Modal */}
            {isDetailsOpen && selectedAppointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4 text-primary" /> PROTOCOL CLEARANCE: {selectedAppointment.id}
                            </h3>
                            <button onClick={() => setIsDetailsOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6 pb-6 border-b border-border">
                                <div className="w-16 h-16 bg-surface-alt border border-border flex items-center justify-center font-black text-xl text-primary">
                                    {selectedAppointment.client[0]}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-text uppercase tracking-tight">{selectedAppointment.client}</h4>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Entity Reference ID: {selectedAppointment.id}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 py-2">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Service Allocated</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.service}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Assigned Specialist</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.professional}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Scheduled Interval</p>
                                    <p className="text-sm font-black text-text uppercase">{selectedAppointment.time}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Fiscal Value</p>
                                    <p className="text-sm font-black text-primary uppercase">{selectedAppointment.price}</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-border flex gap-4">
                                <button onClick={() => handleCancelAppointment(selectedAppointment.id)} className="flex-1 py-3 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" /> TERMINATE
                                </button>
                                <button onClick={() => alert('Modification protocol active...')} className="flex-1 py-3 bg-surface-alt border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all flex items-center justify-center gap-2">
                                    <Edit3 className="w-4 h-4" /> MODIFY
                                </button>
                                {selectedAppointment.status === 'Upcoming' && (
                                    <button onClick={() => { handleCheckIn(selectedAppointment.id); setIsDetailsOpen(false); }} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
                                        AUTHORIZE CHECK-IN
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
