import React, { useState } from 'react';
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
    Loader2
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const stats = [
    { label: 'Today\'s Appointments', value: 24, icon: Calendar, trend: '+14%', positive: true },
    { label: 'Pending Check-ins', value: 8, icon: Clock, trend: '+2 today', positive: false },
    { label: 'Completed Today', value: 12, icon: CheckCircle2, trend: '+5.2%', positive: true },
    { label: 'New Registrations', value: 5, icon: UserPlus, trend: '+1 today', positive: true },
];

const upcomingAppointments = [
    { id: 1, client: 'Ananya Iyer', service: 'HydraFacial', time: '10:30 AM', professional: 'Meera', status: 'Arrived' },
    { id: 2, client: 'Vikram Malhotra', service: 'Men\'s Grooming', time: '11:00 AM', professional: 'Suresh', status: 'Upcoming' },
    { id: 3, client: 'Sarah Khan', service: 'Hair Coloring', time: '11:15 AM', professional: 'Elena', status: 'Upcoming' },
    { id: 4, client: 'Sarah Khan', service: 'Hair Coloring', time: '11:15 AM', professional: 'Elena', status: 'Upcoming' },
];

export default function ReceptionistDashboard() {
    const [liveFeed, setLiveFeed] = useState(upcomingAppointments);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [reporting, setReporting] = useState(false);

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

    const handleCheckIn = (id) => {
        setLiveFeed(prev => prev.map(apt =>
            apt.id === id ? { ...apt, status: 'Arrived' } : apt
        ));
        alert(`Protocol Clearance: Guest token checked-in.`);
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
                    <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

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
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
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
                {/* Live Queue / Upcoming */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Active Timeline
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Live</span>
                                </div>
                                <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {liveFeed.map((apt) => (
                                <div key={apt.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted transition-all group-hover:bg-primary group-hover:text-white">
                                            {apt.client[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{apt.client}</p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${apt.status === 'Arrived'
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                        : 'bg-surface-alt border-border text-text-muted'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{apt.service} · With {apt.professional}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-text uppercase tracking-widest">{apt.time}</p>
                                        </div>
                                        {apt.status === 'Upcoming' && (
                                            <button
                                                onClick={() => handleCheckIn(apt.id)}
                                                className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                            >
                                                Check-In
                                            </button>
                                        )}
                                        {apt.status === 'Arrived' && (
                                            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border p-6 space-y-5">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Quick Controls</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => alert('Redirecting to check-in terminal...')} className="p-4 bg-surface-alt hover:bg-primary text-text-secondary hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-2 group">
                                <UserCheck className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Check-In</span>
                            </button>
                            <button onClick={() => alert('Linking to live waitlist...')} className="p-4 bg-surface-alt hover:bg-primary text-text-secondary hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-2 group">
                                <Clock className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Waitlist</span>
                            </button>
                            <button
                                onClick={() => handleAction('Day End')}
                                disabled={reporting}
                                className="p-4 bg-surface-alt hover:bg-primary text-text-secondary hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-2 group disabled:opacity-50"
                            >
                                {reporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5 opacity-60 group-hover:opacity-100" />}
                                <span className="text-[8px] font-black uppercase tracking-widest">{reporting ? 'Syncing...' : 'Day End'}</span>
                            </button>
                            <button onClick={() => alert('Accessing secure alert vault...')} className="p-4 bg-surface-alt hover:bg-primary text-text-secondary hover:text-white transition-all border border-border hover:border-primary flex flex-col items-center gap-2 group">
                                <AlertCircle className="w-5 h-5 opacity-60 group-hover:opacity-100" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Alerts</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary p-6 relative overflow-hidden group shadow-lg shadow-primary/20">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Calendar className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Efficiency Protocol</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                                Peak hours detected between 4:00 PM and 7:00 PM today.
                            </p>
                            <button className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                                VIEW LOGISTICS <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modals Interface */}
            {isRegistrationOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-primary" /> NEW CLIENT REGISTRATION
                            </h3>
                            <button onClick={() => setIsRegistrationOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Client Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input type="text" autoFocus placeholder="ENTER FULL NAME" className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Protocol</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input type="tel" placeholder="+91 00000 00000" className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button onClick={() => setIsRegistrationOpen(false)} className="py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">TERMINATE</button>
                                <button onClick={() => { alert('Registration Successful'); setIsRegistrationOpen(false); }} className="py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">CONFIRM ENTRY</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="p-8 space-y-5">
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
        </div>
    );
}
