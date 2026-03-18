import { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Phone, Edit, Trash2, TrendingUp,
    ClipboardList, Calendar, Clock, CheckCircle,
    ChevronDown, ArrowRight, AlertTriangle, Sparkles, RefreshCw
} from 'lucide-react';

/* ─── Constants ───────────────────────────────────────────────────────── */

const SOURCES = ['Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'];
const STATUSES = ['new', 'follow-up', 'converted', 'lost'];
const FOLLOW_UP_OPTIONS = [
    { label: 'None', value: 0 },
    { label: '3D', value: 3 },
    { label: '7D', value: 7 },
    { label: '10D', value: 10 },
];

const SOURCE_STYLES = {
    'Walk-in': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'Phone Call': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    'Instagram': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'Facebook': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    'WhatsApp': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Website': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Referral': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Other': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

const STATUS_STYLES = {
    'new': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'New' },
    'follow-up': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Follow' },
    'converted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Won' },
    'lost': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Lost' },
};

/* ─── Seed Data ───────────────────────────────────────────────────────── */

const SEED_INQUIRIES = [
    { id: 'inq-001', name: 'Ananya Mehta', phone: '9876543210', email: 'ananya@gmail.com', source: 'Walk-in', serviceInterest: 'Bridal Makeup Package', notes: 'Getting married in April.', status: 'new', followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'inq-002', name: 'Rohan Kapoor', phone: '9123456780', email: '', source: 'Instagram', serviceInterest: 'Hair Coloring', notes: 'Interested in ash grey.', status: 'follow-up', followUpDate: new Date(Date.now() - 1 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'inq-003', name: 'Priya Nair', phone: '9988776655', email: 'priya.nair@yahoo.com', source: 'WhatsApp', serviceInterest: 'Full Body Massage', notes: 'Referred by Kavita.', status: 'converted', followUpDate: null, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'inq-004', name: 'Vikram Singh', phone: '9001122334', email: '', source: 'Phone Call', serviceInterest: 'Beard Trim', notes: 'Budget conscious.', status: 'lost', followUpDate: null, createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function getFollowUpLabel(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)}d Overdue`, color: 'text-rose-600', bg: 'bg-rose-50' };
    if (diff === 0) return { text: 'Due Today', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: `In ${diff}d`, color: 'text-text-muted', bg: 'bg-surface' };
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function InquiryPage() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSource, setFilterSource] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingInquiry, setEditingInquiry] = useState(null);
    const [statusDropdown, setStatusDropdown] = useState(null);
    const [convertedId, setConvertedId] = useState(null);
    const [form, setForm] = useState({
        name: '', phone: '', email: '', source: 'Walk-in',
        serviceInterest: '', notes: '', followUpDays: 0
    });

    useEffect(() => {
        const stored = localStorage.getItem('inquiry_tracker');
        if (stored) {
            setInquiries(JSON.parse(stored));
        } else {
            setInquiries(SEED_INQUIRIES);
            localStorage.setItem('inquiry_tracker', JSON.stringify(SEED_INQUIRIES));
        }
        setLoading(false);
    }, []);

    const persist = (data) => {
        setInquiries(data);
        localStorage.setItem('inquiry_tracker', JSON.stringify(data));
    };

    const stats = useMemo(() => {
        const total = inquiries.length;
        const pending = inquiries.filter(i => i.status === 'new' || i.status === 'follow-up').length;
        const converted = inquiries.filter(i => i.status === 'converted').length;
        const rate = total > 0 ? Math.round((converted / total) * 100) : 0;
        return [
            { label: 'Total Inbound', value: total, icon: ClipboardList, trend: 'Network' },
            { label: 'Actionable', value: pending, icon: Clock, trend: 'Priority' },
            { label: 'Converted', value: converted, icon: CheckCircle, trend: 'Revenue' },
            { label: 'Protocol Rate', value: `${rate}%`, icon: TrendingUp, trend: 'Signal' },
        ];
    }, [inquiries]);

    const filtered = useMemo(() => {
        return inquiries.filter(i => {
            const matchSearch = !search ||
                i.name.toLowerCase().includes(search.toLowerCase()) ||
                i.phone.includes(search) ||
                i.serviceInterest?.toLowerCase().includes(search.toLowerCase());
            const matchSource = filterSource === 'All' || i.source === filterSource;
            const matchStatus = filterStatus === 'All' || i.status === filterStatus;
            return matchSearch && matchSource && matchStatus;
        });
    }, [inquiries, search, filterSource, filterStatus]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const now = new Date().toISOString();
        let followUpDate = null;
        if (form.followUpDays > 0) {
            const futureMs = form.followUpDays * 86400000;
            followUpDate = new Date(new Date().getTime() + futureMs).toISOString();
        }

        if (editingInquiry) {
            const updated = inquiries.map(i => i.id === editingInquiry.id
                ? { ...i, ...form, followUpDate, updatedAt: now }
                : i);
            persist(updated);
        } else {
            const newInquiry = {
                id: `inq-${crypto.randomUUID().slice(0, 8)}`,
                ...form,
                followUpDate,
                status: 'new',
                createdAt: now,
            };
            persist([newInquiry, ...inquiries]);
        }
        closeModal();
    };

    const handleDelete = (id) => {
        if (!confirm('Delete record?')) return;
        persist(inquiries.filter(i => i.id !== id));
    };

    const changeStatus = (id, newStatus) => {
        if (newStatus === 'converted') {
            setConvertedId(id);
            setTimeout(() => setConvertedId(null), 1500);
        }
        persist(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
        setStatusDropdown(null);
    };

    const openEdit = (inq) => {
        setEditingInquiry(inq);
        const followUpDays = inq.followUpDate
            ? Math.max(0, Math.round((new Date(inq.followUpDate) - Date.now()) / 86400000))
            : 0;
        setForm({
            name: inq.name, phone: inq.phone, email: inq.email || '',
            source: inq.source, serviceInterest: inq.serviceInterest || '',
            notes: inq.notes || '', followUpDays
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingInquiry(null);
        setForm({ name: '', phone: '', email: '', source: 'Walk-in', serviceInterest: '', notes: '', followUpDays: 0 });
    };

    if (loading) {
        return <div className="p-20 text-center uppercase font-mono text-[10px] animate-pulse">Scanning Registry...</div>;
    }

    return (
        <div className="space-y-4 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Inquiry Tracker</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">CRM :: Lead Pipe & Conversion Matrix</p>
                </div>
                <button
                    onClick={() => { closeModal(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-primary hover:text-white transition-all font-mono"
                >
                    <Plus className="w-3.5 h-3.5" /> Log Inquiry
                </button>
            </div>

            {/* Analytics - Compact Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 border border-border flex flex-col justify-between group hover:border-primary transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <stat.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
                            </div>
                            <span className="text-[7px] font-black text-primary uppercase tracking-widest font-mono italic">{stat.trend}</span>
                        </div>
                        <h3 className="text-xl font-black text-text tracking-tighter uppercase font-mono italic leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Filters - High Density */}
            <div className="bg-white p-2 border border-border shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan name, phone, or service..."
                        className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border text-[11px] font-bold focus:border-primary outline-none transition-all placeholder:text-[10px] uppercase font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-surface border border-border pl-3 pr-8 py-1.5 outline-none focus:border-primary cursor-pointer appearance-none min-w-[120px] font-mono"
                    >
                        <option value="All">All Sources</option>
                        {SOURCES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-[9px] font-black uppercase tracking-[0.2em] bg-surface border border-border pl-3 pr-8 py-1.5 outline-none focus:border-primary cursor-pointer appearance-none min-w-[120px] font-mono"
                    >
                        <option value="All">All Status</option>
                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            {/* Table - High Density */}
            <div className="bg-white border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface font-mono border-b border-border">
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Visitor Asset</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Source</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Target Interest</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Follow-up</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Epoch</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <ClipboardList className="w-12 h-12 text-text-muted mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest font-mono">Registry Empty.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inq) => {
                                    const srcStyle = SOURCE_STYLES[inq.source] || SOURCE_STYLES['Other'];
                                    const stStyle = STATUS_STYLES[inq.status] || STATUS_STYLES['new'];
                                    const followUp = getFollowUpLabel(inq.followUpDate);
                                    const isConverted = convertedId === inq.id;

                                    return (
                                        <tr key={inq.id} className={`hover:bg-primary/[0.02] transition-colors group ${isConverted ? 'bg-emerald-50' : ''}`}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center text-text font-black text-[10px] font-mono group-hover:border-primary transition-colors">
                                                        {inq.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-text text-[11px] group-hover:text-primary transition-colors italic uppercase font-mono leading-none mb-0.5">{inq.name}</div>
                                                        <div className="text-[9px] text-text-muted font-bold tracking-tight uppercase font-mono flex items-center gap-1 opacity-70">
                                                            <Phone className="w-2.5 h-2.5" />{inq.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-black border uppercase tracking-widest font-mono ${srcStyle.bg} ${srcStyle.text} ${srcStyle.border}`}>
                                                    {inq.source}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-tight font-mono italic truncate max-w-[150px] inline-block">
                                                    {inq.serviceInterest || '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 relative">
                                                <button
                                                    onClick={() => setStatusDropdown(statusDropdown === inq.id ? null : inq.id)}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black border uppercase tracking-widest font-mono transition-all ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}
                                                >
                                                    {stStyle.label} <ChevronDown className="w-2.5 h-2.5" />
                                                </button>
                                                {statusDropdown === inq.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(null)} />
                                                        <div className="absolute left-4 top-full mt-1 z-50 bg-white border-2 border-text shadow-2xl min-w-[120px]">
                                                            {STATUSES.map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => changeStatus(inq.id, s)}
                                                                    className="w-full text-left px-3 py-2 text-[8px] font-black uppercase tracking-widest hover:bg-surface border-b border-border last:border-0 font-mono"
                                                                >
                                                                    {STATUS_STYLES[s].label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {followUp ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest font-mono ${followUp.color} ${followUp.bg} border border-border/20`}>
                                                        {followUp.text}
                                                    </span>
                                                ) : <span className="text-[8px] font-black text-text-muted/20 uppercase font-mono">—</span>}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">{formatDate(inq.createdAt)}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(inq)} className="p-1.5 text-text-muted hover:text-primary transition-colors">
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(inq.id)} className="p-1.5 text-text-muted hover:text-rose-600 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer - Compact */}
                <div className="bg-surface px-4 py-2 border-t border-border flex items-center justify-between">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] font-mono italic">
                        Inquiry Audit: {filtered.length} Leads in Flux
                    </span>
                    <div className="flex gap-4">
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20" disabled>Backward</button>
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Forward</button>
                    </div>
                </div>
            </div>

            {/* Modal — High Density Refinement */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-black" onClick={closeModal}>
                    <div className="bg-white w-full max-w-md p-6 shadow-2xl relative border-2 border-text overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-text text-white flex items-center justify-center">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-black text-text uppercase italic font-mono leading-none">
                                    {editingInquiry ? 'Update Entry' : 'Log New Inquiry'}
                                </h2>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Lead Capture Protocol</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Visual Name</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '').toUpperCase() })} required className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text uppercase font-mono" placeholder="NAME" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Phone</label>
                                    <input type="tel" value={form.phone} onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setForm({ ...form, phone: val });
                                    }} required className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text font-mono" placeholder="NUM" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Source</label>
                                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono uppercase">
                                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Service Target</label>
                                    <input type="text" value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value.toUpperCase() })} className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono" placeholder="INTEREST" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Protocol Notes</label>
                                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-1.5 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono resize-none h-12" placeholder="ADDITIONAL INTEL" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Follow-up Loop</label>
                                    <div className="flex gap-2">
                                        {FOLLOW_UP_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, followUpDays: opt.value })}
                                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest border transition-all font-mono ${form.followUpDays === opt.value ? 'bg-text text-white' : 'bg-surface-alt border-border text-text-muted hover:border-text'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-4">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-colors font-mono">Abort</button>
                                <button type="submit" className="flex-1 bg-text text-white py-3 shadow-lg flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95">
                                    <span className="text-[9px] font-black uppercase tracking-widest font-mono">{editingInquiry ? 'Commit' : 'Induct'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
