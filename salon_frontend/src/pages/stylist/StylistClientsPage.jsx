import { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar, Star, ChevronRight, History, Heart, UserPlus, Filter, Shield, X, CheckCircle2 } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';

import stylistData from '../../data/stylistMockData.json';

const STATIC_CLIENTS = stylistData.clients;

export default function StylistClientsPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedClient, setSelectedClient] = useState(null);
    const [toast, setToast] = useState(null);
    const [myClients, setMyClients] = useState(STATIC_CLIENTS);

    // --- Load Bookings from Registry (Polling every 2s for same-tab updates) ---
    useEffect(() => {
        const syncMatrix = () => {
            try {
                const registry = JSON.parse(localStorage.getItem('WAPIXO_BOOKING_REGISTRY') || '[]');
                // Show ALL bookings regardless of stylist when in demo mode
                // For production: filter by currentStylistName
                const bookingClients = registry
                    .map((b, idx) => ({
                        id: b.id || `ext-${idx}`,
                        name: b.clientName || "New Unit",
                        visits: 1,
                        lastService: new Date(b.date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase(),
                        status: 'ACTIVE_BOOKING',
                        rating: 5.0,
                        preferences: (b.services || []).map(s => s.name).join(' + '),
                        email: b.staffName ? `Booked: ${b.staffName}` : 'external.node@matrix.net',
                        isBooking: true,
                        bookedTime: b.time,
                        bookedDate: new Date(b.date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                        phone: b.phone || ''
                    }));

                setMyClients([...STATIC_CLIENTS, ...bookingClients]);
            } catch (err) {
                console.error("Personnel Sync Error:", err);
            }
        };

        // Run immediately
        syncMatrix();
        // Poll every 2 seconds to catch same-tab updates
        const interval = setInterval(syncMatrix, 2000);
        window.addEventListener('storage', syncMatrix);
        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', syncMatrix);
        };
    }, [user]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const clientStatuses = ['ALL', ...new Set(myClients.map(c => c.status))];

    const filteredClients = myClients
        .filter(c => {
            const nameMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const emailMatch = c.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const phoneMatch = c.phone?.includes(searchTerm);
            const matchesSearch = nameMatch || emailMatch || phoneMatch;
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'visits') return b.visits - a.visits;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

    return (
        <div className="space-y-4 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Verified Access</span>
                    </div>
                    <h1 className="text-2xl font-black text-text tracking-tighter uppercase">Client Directory</h1>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 italic">Internal Use Only</p>
                </div>
                <button
                    onClick={() => setShowEnrollModal(true)}
                    className="flex items-center gap-2 px-5 py-3.5 bg-primary text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="w-full pl-11 pr-4 py-3.5 bg-surface border border-border text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 bg-surface border border-border p-1">
                    {clientStatuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setSortBy('name');
                            showToast('Directory Refreshed');
                        }}
                        className="px-3 py-2 border-l border-border text-text-muted hover:text-primary transition-all"
                        title="Reset Filters"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-1.5">
                    {['name', 'visits', 'rating'].map(criteria => (
                        <button
                            key={criteria}
                            onClick={() => setSortBy(criteria)}
                            className={`px-4 py-3.5 border border-border flex items-center gap-2.5 text-[8px] font-black uppercase tracking-widest transition-all ${sortBy === criteria ? 'bg-background text-primary border-primary shadow-lg' : 'bg-surface text-text-muted hover:text-text'}`}
                        >
                            Sort_{criteria}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Matrix Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredClients.map((client) => (
                    <div key={client.id} className="bg-surface border border-border p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-12 translate-x-12 rotate-45" />

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-background border border-border flex items-center justify-center text-primary text-lg font-black uppercase shadow-inner">
                                    {client.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-base font-black text-text group-hover:text-primary transition-colors tracking-tight uppercase">{client.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-[7px] font-black px-1.5 py-0.5 border uppercase tracking-widest ${client.status.includes('VIP') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            client.status.includes('STANDARD') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            }`}>
                                            {client.status}
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-text">
                                            <Star className="w-2.5 h-2.5 fill-primary text-primary" /> {client.rating}
                                        </div>
                                    </div>
                                    {client.phone && (
                                        <p className="text-[10px] font-bold text-text-muted/60 mt-0.5">{maskPhone(client.phone, user?.role)}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedClient(client)}
                                className="p-1.5 border border-border hover:bg-surface-alt transition-all group-hover:border-primary/40"
                            >
                                <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                            <div className="bg-background border border-border p-3 shadow-sm">
                                <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5 italic">Total Visits</p>
                                <p className="text-xs font-black text-text">{client.visits} VISITS</p>
                            </div>
                            <div className="bg-background border border-border p-3 shadow-sm">
                                <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.2em] mb-0.5 italic">Last Visit</p>
                                <p className="text-xs font-black text-text">{client.lastService}</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10">
                                <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1">Client Preferences</p>
                                    <p className="text-[10px] text-text font-black uppercase tracking-tight">{client.preferences}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedClient(client)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-alt border border-border text-[9px] font-black text-text-muted uppercase tracking-widest hover:bg-surface hover:text-primary transition-all active:scale-95"
                                >
                                    <History className="w-3.5 h-3.5" /> View Service History
                                </button>
                                <button
                                    onClick={() => showToast(`COMM_LINK initiated for ${client.name}`)}
                                    className="px-4 py-3 bg-surface-alt border border-border text-[9px] font-black text-text-muted uppercase tracking-widest hover:bg-surface hover:text-rose-500 transition-all active:scale-95"
                                >
                                    <Mail className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enroll Modal */}
            <AnimatePresence>
                {showEnrollModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEnrollModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <UserPlus className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Register Client</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Enter client details below</p>
                                </div>
                                <button onClick={() => setShowEnrollModal(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setShowEnrollModal(false);
                                    showToast("Human Asset successfully enrolled in Personnel Matrix.");
                                }}
                                className="space-y-6 relative z-10"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Client Name</label>
                                    <input required type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
                                        <input required type="email" placeholder="client@email.com" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                                        <input required type="tel" placeholder="+91 XXX XXX XXXX" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Notes & Preferences</label>
                                    <textarea placeholder="Any special requirements or service notes..." className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none h-24 resize-none" />
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Save Client Info</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Service Log Modal */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClient(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-2xl rounded-none border border-border shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-10 border-b border-border bg-background/50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-surface border border-border flex items-center justify-center text-primary text-2xl font-black uppercase shadow-2xl">
                                        {selectedClient.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-text uppercase tracking-tight">{selectedClient.name}</h2>
                                        <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-widest italic">{selectedClient.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="w-12 h-12 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Visits</p>
                                        <p className="text-2xl font-black text-text tracking-tighter">{selectedClient.visits}</p>
                                        <p className="text-[8px] font-black text-primary uppercase mt-1">Total Visits</p>
                                    </div>
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Rating</p>
                                        <p className="text-2xl font-black text-primary tracking-tighter">{selectedClient.rating}</p>
                                        <p className="text-[8px] font-black text-primary uppercase mt-1">Trust Level</p>
                                    </div>
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Recent Visit</p>
                                        <p className="text-lg font-black text-text tracking-tight uppercase">{selectedClient.lastService}</p>
                                        <p className="text-[8px] font-black text-primary uppercase mt-1">Visit Date</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Calendar className="w-4 h-4" /> Past Services
                                    </h4>
                                    <div className="border border-border divide-y divide-border/30">
                                        {[
                                            { date: '15 FEB_24', service: 'Precision_Cut + Ombre_Matrix', cost: '₹4,500', tech: 'Self' },
                                            { date: '02 DEC_23', service: 'Keratin_Bonding', cost: '₹8,400', tech: 'Self' },
                                            { date: '18 SEP_23', service: 'Deep_Hydration_Protocol', cost: '₹2,200', tech: 'Self' },
                                        ].map((log, idx) => (
                                            <div key={idx} className="p-6 bg-background/30 flex items-center justify-between hover:bg-background/60 transition-colors group">
                                                <div>
                                                    <p className="text-xs font-black text-text uppercase tracking-tight">{log.service}</p>
                                                    <p className="text-[9px] text-text-muted uppercase tracking-widest mt-1 italic">{log.date} · Tech: {log.tech}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-primary tracking-tighter">{log.cost}</p>
                                                    <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">SETTLED</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Heart className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Customer Preferences</span>
                                    </div>
                                    <p className="text-[11px] text-text-muted uppercase leading-relaxed font-bold tracking-tight italic">
                                        {selectedClient.preferences}
                                    </p>
                                </div>
                            </div>
                            <div className="p-10 border-t border-border bg-background/50 shrink-0">
                                <button className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Book Appointment</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

