import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, User, Mail, Calendar, Star, ChevronRight, History, Heart, UserPlus, Shield, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import api from '../../services/api';

function mapStatusBadge(c) {
    if (c.tags?.includes('VIP')) return 'VIP_CLIENT';
    if (c.status === 'Inactive') return 'INACTIVE_UNIT';
    return 'STANDARD_UNIT';
}

function formatLastVisitYmd(ymd) {
    if (!ymd) return '—';
    try {
        const d = new Date(`${ymd}T12:00:00`);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase();
    } catch {
        return ymd;
    }
}

function mapApiClientToRow(c) {
    const visits = c.totalVisits ?? 0;
    const rating =
        visits >= 10 ? 5 : visits >= 5 ? 4.8 : visits >= 2 ? 4.5 : visits >= 1 ? 4.2 : null;
    return {
        id: c._id,
        name: c.name || 'Client',
        email: c.email || '',
        phone: c.phone || '',
        visits,
        lastService: formatLastVisitYmd(c.lastVisit),
        status: mapStatusBadge(c),
        rating,
        preferences:
            [c.lastServiceSummary, c.notes, c.upcomingBooking ? `Next: ${c.upcomingBooking}` : '']
                .filter(Boolean)
                .join(' · ') || '—',
        upcomingBooking: c.upcomingBooking || null,
        spend: c.spend,
        raw: c,
    };
}

export default function StylistClientsPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedClient, setSelectedClient] = useState(null);
    const [toast, setToast] = useState(null);
    const [myClients, setMyClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [serviceHistory, setServiceHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [enrollForm, setEnrollForm] = useState({ name: '', email: '', phone: '', notes: '' });
    const [enrollSubmitting, setEnrollSubmitting] = useState(false);

    const loadRoster = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await api.get('/clients/stylist-roster', {
                params: { limit: 100, page: 1, name: searchTerm.trim() || undefined },
            });
            const payload = res.data;
            const list = payload?.results ?? [];
            setMyClients(list.map(mapApiClientToRow));
        } catch (e) {
            setLoadError(e?.response?.data?.message || e?.message || 'Failed to load roster');
            setMyClients([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const t = setTimeout(() => loadRoster(), searchTerm === '' ? 0 : 350);
        return () => clearTimeout(t);
    }, [loadRoster, searchTerm]);

    useEffect(() => {
        const id = setInterval(loadRoster, 30000);
        return () => clearInterval(id);
    }, [loadRoster]);

    const loadHistory = useCallback(async (clientId) => {
        if (!clientId) return;
        setHistoryLoading(true);
        setServiceHistory([]);
        try {
            const res = await api.get(`/clients/${clientId}/stylist-history`);
            const rows = res.data?.data ?? res.data ?? [];
            setServiceHistory(Array.isArray(rows) ? rows : []);
        } catch {
            setServiceHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClient?.id) loadHistory(selectedClient.id);
    }, [selectedClient?.id, loadHistory]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const clientStatuses = useMemo(() => ['ALL', ...new Set(myClients.map((c) => c.status))], [myClients]);

    const filteredClients = useMemo(() => {
        return myClients
            .filter((c) => {
                const q = searchTerm.toLowerCase();
                const nameMatch = c.name?.toLowerCase().includes(q);
                const emailMatch = c.email?.toLowerCase().includes(q);
                const phoneMatch = c.phone?.includes(searchTerm);
                const matchesSearch = nameMatch || emailMatch || phoneMatch;
                const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'visits') return b.visits - a.visits;
                if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
                return 0;
            });
    }, [myClients, searchTerm, statusFilter, sortBy]);

    const handleEnroll = async (e) => {
        e.preventDefault();
        const { name, email, phone, notes } = enrollForm;
        if (!name?.trim() || !phone?.trim()) {
            showToast('Name and phone are required');
            return;
        }
        setEnrollSubmitting(true);
        try {
            await api.post('/clients', {
                name: name.trim(),
                phone: phone.trim(),
                email: (email || '').trim() || undefined,
                notes: (notes || '').trim() || undefined,
            });
            setShowEnrollModal(false);
            setEnrollForm({ name: '', email: '', phone: '', notes: '' });
            showToast('Client saved. They appear here after a booking or invoice with you.');
            await loadRoster();
        } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Could not create client');
        } finally {
            setEnrollSubmitting(false);
        }
    };

    /** Match Credit Stream: Open Sans + font-black + 10px + uppercase (+ muted where noted) */
    const cs = 'font-black text-[10px] uppercase text-text-muted';
    const csText = `${cs} transition-colors`;
    const csHeading = 'font-black text-[10px] uppercase text-text tracking-[0.2em]';
    const csStrong = 'font-black text-[10px] uppercase text-text';

    return (
        <div className="personnel-matrix-section space-y-4 text-left font-sans font-black">
            <style>{`
                .personnel-matrix-section h1,
                .personnel-matrix-section h2,
                .personnel-matrix-section h3,
                .personnel-matrix-section h4 {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span className={`${csText} tracking-[0.3em] text-primary`}>Live roster</span>
                    </div>
                    <h1 className="text-2xl font-black text-text tracking-tighter uppercase !font-sans">Client Directory</h1>
                    <p className={`${csText} tracking-widest mt-0.5 not-italic`}>
                        Clients you have booked or billed · synced from server
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowEnrollModal(true)}
                    className="flex items-center gap-2 px-5 py-3.5 bg-primary text-white font-black !font-sans text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" /> Add Client
                </button>
            </div>

            {loadError && (
                <div className={`p-4 border border-rose-500/30 bg-rose-500/5 ${csStrong} text-rose-600 tracking-wide`}>
                    {loadError}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className={`w-full pl-11 pr-4 py-3.5 bg-surface border border-border ${csStrong} !font-sans tracking-widest focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-text-muted/50`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 bg-surface border border-border p-1 flex-wrap">
                    {clientStatuses.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 ${csText} tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white shadow-lg !text-white' : 'hover:text-text'}`}
                        >
                            {status.replace(/_/g, ' ')}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setSortBy('name');
                            loadRoster();
                            showToast('Directory refreshed');
                        }}
                        className={`px-3 py-2 border-l border-border ${csText} hover:text-primary`}
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {['name', 'visits', 'rating'].map((criteria) => (
                        <button
                            key={criteria}
                            type="button"
                            onClick={() => setSortBy(criteria)}
                            className={`px-4 py-3.5 border border-border flex items-center gap-2.5 ${csText} tracking-widest transition-all ${sortBy === criteria ? 'bg-background text-primary border-primary shadow-lg !text-primary' : 'bg-surface hover:text-text'}`}
                        >
                            Sort_{criteria}
                        </button>
                    ))}
                </div>
            </div>

            {loading && myClients.length === 0 ? (
                <div className={`py-24 text-center ${csText} tracking-widest`}>Loading personnel matrix…</div>
            ) : filteredClients.length === 0 ? (
                <div className="py-24 text-center space-y-3 border border-dashed border-border">
                    <User className="w-10 h-10 text-text-muted mx-auto opacity-30" />
                    <p className={`${csText} tracking-[0.2em]`}>
                        No clients yet. Complete a booking or POS bill with you as stylist, or add a client above.
                    </p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-surface border border-border p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-12 translate-x-12 rotate-45" />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-background border border-border flex items-center justify-center text-primary text-lg font-black uppercase shadow-inner !font-sans">
                                        {client.name
                                            .split(' ')
                                            .filter(Boolean)
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2) || '?'}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-black text-text group-hover:text-primary transition-colors tracking-tight uppercase !font-sans">{client.name}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div
                                                className={`font-black text-[7px] uppercase tracking-widest px-1.5 py-0.5 border !font-sans ${
                                                    client.status.includes('VIP')
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : client.status.includes('STANDARD')
                                                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                          : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}
                                            >
                                                {client.status.replace(/_/g, ' ')}
                                            </div>
                                            {client.rating != null ? (
                                                <div className={`flex items-center gap-1 ${csStrong} !text-[9px]`}>
                                                    <Star className="w-2.5 h-2.5 fill-primary text-primary" /> {client.rating}
                                                </div>
                                            ) : (
                                                <span className={`${csText} !text-[8px]`}>New link</span>
                                            )}
                                        </div>
                                        {client.phone && (
                                            <p className={`${csText} text-text-muted/60 mt-0.5 !text-[10px]`}>{maskPhone(client.phone, user?.role)}</p>
                                        )}
                                        {client.email && (
                                            <p className={`${csText} text-text-muted/50 truncate max-w-[200px] !text-[10px]`}>{client.email}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedClient(client)}
                                    className="p-1.5 border border-border hover:bg-surface-alt transition-all group-hover:border-primary/40"
                                >
                                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                                <div className="bg-background border border-border p-3 shadow-sm">
                                    <p className={`${csText} !text-[7px] tracking-[0.2em] mb-0.5 not-italic`}>Your visits</p>
                                    <p className="text-xs font-black text-text !font-sans uppercase">{client.visits} VISITS</p>
                                </div>
                                <div className="bg-background border border-border p-3 shadow-sm">
                                    <p className={`${csText} !text-[7px] tracking-[0.2em] mb-0.5 not-italic`}>Last visit</p>
                                    <p className="text-xs font-black text-text !font-sans uppercase">{client.lastService}</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10">
                                    <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className={`${csText} text-primary mb-1 tracking-[0.2em] !text-primary !text-[8px]`}>Notes & services</p>
                                        <p className={`${csStrong} tracking-tight leading-snug !text-[10px]`}>{client.preferences}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClient(client)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 bg-surface-alt border border-border ${csText} tracking-widest hover:bg-surface hover:text-primary active:scale-95`}
                                    >
                                        <History className="w-3.5 h-3.5" /> View service history
                                    </button>
                                    {client.email ? (
                                        <a
                                            href={`mailto:${client.email}`}
                                            className={`px-4 py-3 bg-surface-alt border border-border ${csText} tracking-widest hover:bg-surface hover:text-rose-500 active:scale-95 inline-flex items-center justify-center`}
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                        </a>
                                    ) : (
                                        <span className={`px-4 py-3 bg-surface-alt/50 border border-border opacity-50 ${csText}`}>
                                            <Mail className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showEnrollModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEnrollModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <UserPlus className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight !font-sans">Register client</h2>
                                    <p className={`${csText} text-primary mt-1 tracking-widest !text-primary`}>Creates salon-wide client record</p>
                                </div>
                                <button type="button" onClick={() => setShowEnrollModal(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleEnroll} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className={`${csHeading} ml-1`}>Client name</label>
                                    <input
                                        required
                                        type="text"
                                        value={enrollForm.name}
                                        onChange={(e) => setEnrollForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Full name"
                                        className={`w-full px-5 py-4 bg-background border border-border ${csStrong} !font-sans !text-[11px] tracking-widest focus:border-primary outline-none placeholder:text-text-muted/50`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className={`${csHeading} ml-1`}>Email</label>
                                        <input
                                            type="email"
                                            value={enrollForm.email}
                                            onChange={(e) => setEnrollForm((f) => ({ ...f, email: e.target.value }))}
                                            placeholder="client@email.com"
                                            className={`w-full px-5 py-4 bg-background border border-border ${csStrong} !font-sans !text-[11px] tracking-widest focus:border-primary outline-none placeholder:text-text-muted/50`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Mobile</label>
                                        <input
                                            required
                                            type="tel"
                                            value={enrollForm.phone}
                                            onChange={(e) => setEnrollForm((f) => ({ ...f, phone: e.target.value }))}
                                            placeholder="+91 ..."
                                            className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`${csHeading} ml-1`}>Notes</label>
                                    <textarea
                                        value={enrollForm.notes}
                                        onChange={(e) => setEnrollForm((f) => ({ ...f, notes: e.target.value }))}
                                        placeholder="Preferences…"
                                        className={`w-full px-5 py-4 bg-background border border-border ${csStrong} !font-sans !text-[11px] tracking-widest focus:border-primary outline-none h-24 resize-none placeholder:text-text-muted/50`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={enrollSubmitting}
                                    className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                                >
                                    {enrollSubmitting ? 'Saving…' : 'Save client'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClient(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-2xl rounded-none border border-border shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-10 border-b border-border bg-background/50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-surface border border-border flex items-center justify-center text-primary text-2xl font-black uppercase shadow-2xl !font-sans">
                                        {selectedClient.name
                                            .split(' ')
                                            .filter(Boolean)
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2) || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-text uppercase tracking-tight">{selectedClient.name}</h2>
                                        <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-widest italic">
                                            {selectedClient.email || selectedClient.phone || '—'}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setSelectedClient(null)} className="w-12 h-12 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className={`${csText} !text-[9px] tracking-[0.2em] mb-2 not-italic`}>Visits</p>
                                        <p className="text-2xl font-black text-text tracking-tighter !font-sans uppercase">{selectedClient.visits}</p>
                                        <p className={`${csText} text-primary mt-1 !text-[8px] !text-primary`}>With you</p>
                                    </div>
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className={`${csText} !text-[9px] tracking-[0.2em] mb-2 not-italic`}>Rating</p>
                                        <p className="text-2xl font-black text-primary tracking-tighter !font-sans">{selectedClient.rating != null ? selectedClient.rating : '—'}</p>
                                        <p className={`${csText} text-primary mt-1 !text-[8px] !text-primary`}>Engagement</p>
                                    </div>
                                    <div className="bg-background border border-border p-6 text-center">
                                        <p className={`${csText} !text-[9px] tracking-[0.2em] mb-2 not-italic`}>Last visit</p>
                                        <p className="text-lg font-black text-text tracking-tight uppercase !font-sans">{selectedClient.lastService}</p>
                                        <p className={`${csText} text-primary mt-1 !text-[8px] !text-primary`}>Your services</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Calendar className="w-4 h-4" /> Past services (your work)
                                    </h4>
                                    {historyLoading ? (
                                        <p className="text-[10px] text-text-muted uppercase">Loading history…</p>
                                    ) : serviceHistory.length === 0 ? (
                                        <p className="text-[10px] text-text-muted uppercase">No paid invoices yet with you for this client.</p>
                                    ) : (
                                        <div className="border border-border divide-y divide-border/30">
                                            {serviceHistory.map((log) => (
                                                <div key={log.id} className="p-6 bg-background/30 flex items-center justify-between hover:bg-background/60 transition-colors group">
                                                    <div>
                                                        <p className="text-xs font-black text-text uppercase tracking-tight !font-sans">{log.service}</p>
                                                        <p className={`${csText} tracking-widest mt-1 not-italic !text-[9px]`}>{log.date}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-primary tracking-tighter !font-sans uppercase">{log.cost}</p>
                                                        <p className={`${csStrong} text-emerald-500 !text-[8px] tracking-widest`}>Paid</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-primary/5 border border-primary/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Heart className="w-4 h-4 text-primary" />
                                        <span className={`${csText} text-primary tracking-[0.2em] !text-primary`}>Notes & preferences</span>
                                    </div>
                                    <p className={`${csStrong} text-text-muted leading-relaxed tracking-tight not-italic !text-[11px]`}>{selectedClient.preferences}</p>
                                </div>
                            </div>
                            <div className="p-10 border-t border-border bg-background/50 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setSelectedClient(null)}
                                    className={`w-full py-5 bg-primary text-white ${csStrong} !text-white !font-sans tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all`}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className={`${csStrong} text-background tracking-[0.2em] !text-background`}>{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
