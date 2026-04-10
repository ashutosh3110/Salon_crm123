import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Clock,
    UserPlus,
    ArrowRight,
    MoreHorizontal,
    MoreVertical,
    Coffee,
    Smile,
    Zap,
    X,
    User,
    Scissors,
    Shield,
    RefreshCw,
    Loader2,
    Phone,
    CheckCircle2,
    ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mockApi from '../../services/mock/mockApi';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';

export default function QueuePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Live States
    const [queueData, setQueueData] = useState([]);
    const [stylists, setStylists] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [allocating, setAllocating] = useState(null);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Form State for Adding Guest
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        phone: '',
        serviceId: '',
        staffId: ''
    });

    // Load Data
    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const [queueRes, bookingsRes, staffRes, servicesRes] = await Promise.all([
                mockApi.get(`/bookings?status=arrived&date=${today}&outletId=${user?.outletId}`),
                mockApi.get(`/bookings?date=${today}&limit=100&outletId=${user?.outletId}`),
                mockApi.get(`/users?role=stylist&outletId=${user?.outletId}`),
                mockApi.get('/services?limit=100')
            ]);

            // Robustly handle queue data
            const queueList = queueRes.data?.results || [];
            setQueueData(queueList.map(b => ({
                id: b.id || b._id,
                name: b.clientId?.name || 'GUEST',
                service: b.serviceId?.name || 'SERVICE',
                wait: b.appointmentDate ? (Math.round((new Date() - new Date(b.appointmentDate)) / 60000)) + ' MINS' : '0 MINS',
                priority: b.source === 'WALKIN'
            })));

            const allBookingsList = bookingsRes.data?.results || [];
            // Robustly handle staff/stylist data
            const staffList = staffRes.data?.data?.results || staffRes.data?.results || [];
            const busyStaffIds = allBookingsList
                .filter(b => ['arrived', 'in-progress'].includes(b.status?.toLowerCase()))
                .map(b => {
                    const sId = b.staffId?._id || b.staffId?.id || b.staffId;
                    return sId ? String(sId) : null;
                })
                .filter(Boolean);

            setStylists(staffList.map(s => {
                const sId = String(s._id || s.id);
                const isBusy = busyStaffIds.includes(sId);
                return {
                    id: sId,
                    name: s.name,
                    specialty: s.role,
                    status: isBusy ? 'Busy' : 'Available',
                    isAvailable: !isBusy,
                    current: isBusy ? 'In Service' : 'Ready'
                };
            }));

            // Robustly handle services list
            const serviceList = servicesRes.data?.data?.results || servicesRes.data?.results || [];
            setServices(serviceList);
        } catch (err) {
            console.error('Queue Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const filteredQueue = queueData.filter(guest =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAllocate = async (guestId) => {
        setAllocating(guestId);
        try {
            await mockApi.patch(`/bookings/${guestId}`, { status: 'in-progress' });
            alert(`Allocation Successful: Guest is now in service.`);
            fetchData();
        } catch (err) {
            alert('Allocation Failed: Could not update guest status.');
        } finally {
            setAllocating(null);
        }
    };

    const handleResetQueue = async () => {
        setIsResetting(true);
        await fetchData();
        setIsResetting(false);
        alert('Queue Refreshed: Synchronized with live database.');
    };

    const handleAddGuest = async (guest) => {
        try {
            const now = new Date();
            await mockApi.post('/bookings', {
                ...guest,
                outletId: user?.outletId,
                appointmentDate: now.toISOString(),
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'arrived',
                source: 'WALKIN'
            });
            setIsAddGuestOpen(false);
            alert('Guest Added: Successfully joined the waiting list.');
            fetchData();
        } catch (err) {
            alert('Error: Could not add guest to queue.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Walk-in Queue</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Real-time guest traffic management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleResetQueue}
                        disabled={isResetting}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reset Queue
                    </button>
                    <button
                        onClick={() => setIsWelcomeOpen(true)}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2"
                    >
                        Guest Welcome
                    </button>
                    <button
                        onClick={() => setIsAddGuestOpen(true)}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add to Queue
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Waiting List */}
                    <div className="bg-surface border border-border">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" /> Active Waiting List
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="FIND GUEST..."
                                    className="pl-9 pr-4 py-1.5 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 w-48"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {filteredQueue.length > 0 ? filteredQueue.map((item) => (
                                <div key={item.id} className="px-6 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{item.name}</p>
                                                {item.priority && (
                                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] font-black uppercase tracking-widest border border-primary/20">Priority</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.service}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-1.5 justify-end">
                                                <Clock className="w-3 h-3 text-primary" /> {item.wait}
                                            </p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-0.5">EST. WAITING</p>
                                        </div>
                                        <button
                                            onClick={() => handleAllocate(item.id)}
                                            disabled={allocating === item.id}
                                            className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center gap-2 disabled:bg-border"
                                        >
                                            {allocating === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Start
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-6 py-16 text-center">
                                    <div className="opacity-10 mb-2 flex justify-center">
                                        <Users className="w-12 h-12" />
                                    </div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Queue is currently empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floor Status */}
                    <div className="bg-surface border border-border">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Floor Status</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-border">
                            {stylists.map((st) => (
                                <div key={st.id} className="px-6 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted text-[12px]">
                                                {st.name[0]}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-surface ${st.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{st.name}</p>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{st.specialty}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 text-[8px] font-black uppercase border tracking-widest transition-all ${st.status === 'Available'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500 opacity-50'
                                        }`}>
                                        {st.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stylist Status Column */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Stylist Status</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {stylists.map((stylist) => (
                                <div key={stylist.id} className="p-4 bg-surface-alt border border-border hover:border-primary/20 hover:bg-surface transition-all flex items-center justify-between group relative overflow-hidden">
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-10 h-10 rounded-none border border-border bg-surface flex items-center justify-center font-black text-[12px] text-text-muted group-hover:text-primary transition-all">
                                            {stylist.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-text uppercase tracking-widest">{stylist.name}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none mt-1">{stylist.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <div className={`flex items-center justify-end gap-2 mb-1`}>
                                            <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${stylist.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${stylist.status === 'Available' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {stylist.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-alt border border-dashed border-border p-6 flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-white border border-border flex items-center justify-center text-text-muted animate-bounce-slow">
                            <Coffee className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-text uppercase tracking-[0.2em]">Guest Protocols</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
                                Ensure beverage service is offered for wait times over 15 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals Interface */}
            <AnimatePresence>
                {isWelcomeOpen && (
                    <div key="welcome-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-surface border border-border w-full max-w-lg relative">
                            <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                                <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                    <Smile className="w-4 h-4 text-primary" /> WELCOME PROTOCOL
                                </h3>
                                <button onClick={() => setIsWelcomeOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Coffee className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-text uppercase tracking-tight">Hospitality Sequence</h4>
                                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
                                        Guest detected at front terminal. Offer beverage selection and initiate waiting lounge protocol.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setIsWelcomeOpen(false)} className="py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">DEFER</button>
                                    <button onClick={() => { alert('Guest Logged'); setIsWelcomeOpen(false); }} className="py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">COMPLETE SEQUENCE</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isAddGuestOpen && (
                    <div key="add-guest-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                        <div className="bg-surface border border-border w-full max-w-md max-h-[90vh] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="px-8 py-6 border-b border-border bg-surface-alt/30 flex items-center justify-between shrink-0">
                                <div className="space-y-1">
                                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                        <UserPlus className="w-3.5 h-3.5" /> GUEST ENTRY
                                    </h3>
                                    <p className="text-[14px] font-bold text-text uppercase tracking-tight">WALK-IN REGISTRATION</p>
                                </div>
                                <button onClick={() => setIsAddGuestOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-all">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>
                            <div className="p-8 space-y-7 overflow-y-auto custom-scrollbar flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Client Identity</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="text"
                                            value={newBooking.clientName}
                                            onChange={(e) => setNewBooking({...newBooking, clientName: e.target.value})}
                                            autoFocus
                                            placeholder="FULL NAME"
                                            className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Contact Protocol</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="tel"
                                            value={newBooking.phone}
                                            onChange={(e) => setNewBooking({...newBooking, phone: e.target.value})}
                                            placeholder="MOBILE NUMBER"
                                            className="w-full pl-12 pr-4 py-4 bg-surface-alt/50 border border-border text-sm font-bold uppercase tracking-tight outline-none focus:border-primary focus:bg-surface-alt transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
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
                                                {services.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.name} - ₹{s.price || '??'}</option>)}
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
                                                {stylists.filter(s => s.isAvailable).map(s => (
                                                    <option key={s.id || s._id} value={s.id || s._id}>{s.name} - {s.specialty}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex flex-col gap-3">
                                    <button
                                        onClick={() => handleAddGuest(newBooking)}
                                        className="w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" /> ADD TO QUEUE
                                    </button>
                                    <button onClick={() => setIsAddGuestOpen(false)} className="w-full py-4 border border-border text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                        CANCEL OPERATION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
