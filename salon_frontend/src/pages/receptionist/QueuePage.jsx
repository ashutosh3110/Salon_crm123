import React, { useState } from 'react';
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
    Loader2
} from 'lucide-react';

const waitingList = [
    { id: 'Q-001', name: 'Nisha Gupta', wait: '12 mins', service: 'Blow Dry', priority: true, preferredProfessional: 'Elena' },
    { id: 'Q-002', name: 'Amit Trivedi', wait: '25 mins', service: 'Men\'s Cut', priority: false, preferredProfessional: 'Any' },
    { id: 'Q-003', name: 'Karishma Rao', wait: '40 mins', service: 'Manicure', priority: false, preferredProfessional: 'Ritu' },
];

const stylists = [
    { name: 'Meera', status: 'Available', specialty: 'Facials', current: 'Free' },
    { name: 'Suresh', status: 'Busy', specialty: 'Hair Cut', current: 'Cutting' },
    { name: 'Elena', status: 'On Break', specialty: 'Coloring', current: 'Break' },
];

export default function QueuePage() {
    const [queueData, setQueueData] = useState(waitingList);
    const [searchQuery, setSearchQuery] = useState('');
    const [allocating, setAllocating] = useState(null);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [rotatingStylist, setRotatingStylist] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const filteredQueue = queueData.filter(guest =>
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAllocate = (guestId) => {
        setAllocating(guestId);
        setTimeout(() => {
            setQueueData(prev => prev.filter(g => g.id !== guestId));
            alert(`Protocol Clearance: Guest ${guestId} is now in service.`);
            setAllocating(null);
        }, 1200);
    };

    const handleFloorRotation = (name) => {
        setRotatingStylist(name);
        setTimeout(() => {
            setRotatingStylist(null);
            alert(`Signal ACK: Professional ${name} has acknowledged floor rotation sequence.`);
        }, 1500);
    };

    const handleResetQueue = () => {
        setIsResetting(true);
        setTimeout(() => {
            setQueueData(waitingList);
            setIsResetting(false);
            alert('Queue sequence successfully reset to baseline protocols.');
        }, 1200);
    };

    const handleAddGuest = (guest) => {
        setQueueData(prev => [...prev, { ...guest, id: `Q-00${prev.length + 1}`, wait: '0 mins' }]);
        setIsAddGuestOpen(false);
        alert('Guest successfully synchronized with the live queue sequence.');
    };

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
                                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Zap className="w-2.5 h-2.5" /> High Priority
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.service}</span>
                                                <div className="flex items-center gap-1 font-black">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] text-text-secondary uppercase tracking-widest">{item.wait}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAllocate(item.id)}
                                        disabled={allocating === item.id}
                                        className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {allocating === item.id ? 'Processing...' : 'Allocate'} <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            )) : (
                                <div className="px-6 py-12 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Queue is currently clear</p>
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
                                <div key={st.name} className="px-6 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center font-black text-text-muted">
                                                {st.name[0]}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-surface ${st.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{st.name}</p>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{st.specialty}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFloorRotation(st.name)}
                                        disabled={rotatingStylist === st.name}
                                        className={`px-3 py-1.5 text-[8px] font-black uppercase border tracking-widest transition-all ${st.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        {rotatingStylist === st.name ? <Loader2 className="w-3 h-3 animate-spin inline-block mr-1" /> : null} {st.status}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stylist Status (Original Right Column) */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Floor Status</h3>
                            <button className="p-1 hover:rotate-90 transition-transform duration-500"><Plus className="w-3.5 h-3.5 text-text-muted" /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            {stylists.map((stylist) => (
                                <div key={stylist.name} className="p-4 bg-surface-alt border border-border hover:border-primary/20 hover:bg-surface transition-all flex items-center justify-between group relative overflow-hidden">
                                    {/* Subtle Glow */}
                                    <div className="absolute -right-2 -top-2 w-12 h-12 bg-primary/5 rounded-none blur-xl group-hover:bg-primary/10 transition-colors" />

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
                                            <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${stylist.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                                stylist.status === 'Busy' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                                }`} />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${stylist.status === 'Available' ? 'text-emerald-500' :
                                                stylist.status === 'Busy' ? 'text-rose-500' : 'text-amber-500'
                                                }`}>
                                                {stylist.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-primary uppercase">{stylist.current}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface-alt border border-dashed border-border p-6 flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 bg-white border border-border flex items-center justify-center text-text-muted 
                            animate-bounce-slow">
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
            {isWelcomeOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-lg relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-primary" /> WALK-IN REGISTRATION
                            </h3>
                            <button onClick={() => setIsAddGuestOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-8 space-y-5 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Guest Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                                    <input type="text" id="guestName" autoFocus placeholder="ENTER GUEST NAME" className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-sm font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Service Matrix</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select id="guestService" className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                                            <option>Men's Cut</option>
                                            <option>Hair Blow</option>
                                            <option>Manicure</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Priority Key</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select id="guestPriority" className="w-full pl-10 pr-4 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-tight outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer">
                                            <option value="false">Standard</option>
                                            <option value="true">High Priority</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border flex gap-4">
                                <button onClick={() => setIsAddGuestOpen(false)} className="flex-1 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">ABORT</button>
                                <button
                                    onClick={() => handleAddGuest({
                                        name: document.getElementById('guestName').value || 'New Guest',
                                        service: document.getElementById('guestService').value,
                                        priority: document.getElementById('guestPriority').value === 'true'
                                    })}
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    SYNCHRONIZE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
