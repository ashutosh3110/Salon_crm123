import { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Phone, Mail, Edit, Trash2, Users, TrendingUp,
    ClipboardList, Calendar, Clock, CheckCircle, XCircle,
    MessageSquare, Instagram, Facebook, Globe, User, Star,
    ChevronDown, ArrowRight, AlertTriangle, Sparkles, RefreshCw
} from 'lucide-react';

/* ─── Constants ───────────────────────────────────────────────────────── */

const SOURCES = ['Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'];
const STATUSES = ['new', 'follow-up', 'converted', 'lost'];
const FOLLOW_UP_OPTIONS = [
    { label: 'None', value: 0 },
    { label: '3 Days', value: 3 },
    { label: '7 Days', value: 7 },
    { label: '10 Days', value: 10 },
];

const SOURCE_STYLES = {
    'Walk-in': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' },
    'Phone Call': { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-900/50' },
    'Instagram': { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/50' },
    'Facebook': { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-900/50' },
    'WhatsApp': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50' },
    'Website': { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/50' },
    'Referral': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50' },
    'Other': { bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800' },
};

const STATUS_STYLES = {
    'new': { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-900/50', label: 'New' },
    'follow-up': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50', label: 'Follow-up' },
    'converted': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50', label: 'Converted' },
    'lost': { bg: 'bg-slate-100 dark:bg-slate-900/40', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800', label: 'Lost' },
};

const SOURCE_ICONS = {
    'Walk-in': User,
    'Phone Call': Phone,
    'Instagram': Instagram,
    'Facebook': Facebook,
    'WhatsApp': MessageSquare,
    'Website': Globe,
    'Referral': Star,
    'Other': ClipboardList,
};

/* ─── Seed Data ───────────────────────────────────────────────────────── */

const SEED_INQUIRIES = [
    { id: 'inq-001', name: 'Ananya Mehta', phone: '9876543210', email: 'ananya@gmail.com', source: 'Walk-in', serviceInterest: 'Bridal Makeup Package', notes: 'Getting married in April. Wants trial session first.', status: 'new', followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'inq-002', name: 'Rohan Kapoor', phone: '9123456780', email: '', source: 'Instagram', serviceInterest: 'Hair Coloring', notes: 'Saw our reel. Interested in ash grey.', status: 'follow-up', followUpDate: new Date(Date.now() - 1 * 86400000).toISOString(), createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'inq-003', name: 'Priya Nair', phone: '9988776655', email: 'priya.nair@yahoo.com', source: 'WhatsApp', serviceInterest: 'Full Body Massage', notes: 'Referred by Kavita. Wants weekend appointment.', status: 'converted', followUpDate: null, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
    { id: 'inq-004', name: 'Vikram Singh', phone: '9001122334', email: '', source: 'Phone Call', serviceInterest: 'Beard Trim & Facial', notes: 'First-time caller. Budget conscious.', status: 'lost', followUpDate: null, createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
    { id: 'inq-005', name: 'Sneha Patel', phone: '9876001234', email: 'sneha.p@outlook.com', source: 'Referral', serviceInterest: 'Keratin Treatment', notes: 'Referred by existing client Priya.', status: 'new', followUpDate: new Date(Date.now() + 7 * 86400000).toISOString(), createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'inq-006', name: 'Arjun Reddy', phone: '9345678901', email: '', source: 'Facebook', serviceInterest: 'Classic Haircut', notes: 'Messaged on FB page. Follow up on pricing.', status: 'follow-up', followUpDate: new Date(Date.now()).toISOString(), createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function getFollowUpLabel(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' };
    if (diff === 0) return { text: 'Due today', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' };
    return { text: `In ${diff}d`, color: 'text-text-muted', bg: 'bg-surface dark:bg-surface-alt' };
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

    // Load from localStorage or seed
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

    // Persist on change
    const persist = (data) => {
        setInquiries(data);
        localStorage.setItem('inquiry_tracker', JSON.stringify(data));
    };

    // Analytics
    const stats = useMemo(() => {
        const total = inquiries.length;
        const pending = inquiries.filter(i => i.status === 'new' || i.status === 'follow-up').length;
        const converted = inquiries.filter(i => i.status === 'converted').length;
        const rate = total > 0 ? Math.round((converted / total) * 100) : 0;
        return [
            { label: 'Total Inquiries', value: total, icon: ClipboardList, color: 'blue', trend: 'All Records' },
            { label: 'Pending Follow-ups', value: pending, icon: Clock, color: 'amber', trend: 'Action Needed' },
            { label: 'Converted', value: converted, icon: CheckCircle, color: 'emerald', trend: 'Won Clients' },
            { label: 'Conversion Rate', value: `${rate}%`, icon: TrendingUp, color: 'violet', trend: 'Performance' },
        ];
    }, [inquiries]);

    // Filtered list
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

    // CRUD
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
        if (!confirm('Delete this inquiry?')) return;
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Inquiry Tracker</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">System :: visitor_inquiry_pipeline_v1.0</p>
                </div>
                <button
                    onClick={() => { closeModal(); setShowModal(true); }}
                    className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-black"
                >
                    <Plus className="w-4 h-4" /> Log Inquiry
                </button>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />
                        <div className="relative z-10 flex flex-col justify-between h-full text-left">
                            <div className="flex items-center justify-between mb-4 text-left">
                                <div className="flex items-center gap-3 text-left">
                                    <stat.icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{stat.label}</p>
                                </div>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.trend}</span>
                            </div>
                            <h3 className="text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center bg-surface rounded-none border border-border px-6 py-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 text-left font-black">
                    <Search className="w-4 h-4 text-text-muted mr-4" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, phone, or service interest..."
                        className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text placeholder:text-text-muted/40 outline-none w-full"
                    />
                </div>
                <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="bg-surface border border-border px-6 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text outline-none cursor-pointer appearance-none min-w-[140px]"
                >
                    <option value="All">All Sources</option>
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-surface border border-border px-6 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text outline-none cursor-pointer appearance-none min-w-[140px]"
                >
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s].label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Visitor</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Source</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left hidden md:table-cell">Interest</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left hidden lg:table-cell">Follow-up</th>
                                <th className="px-6 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left hidden lg:table-cell">Created</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-32 text-center">
                                        <ClipboardList className="w-16 h-16 text-text-muted/20 mx-auto mb-6" />
                                        <h3 className="text-sm font-black text-text uppercase tracking-[0.3em]">No Inquiries Found</h3>
                                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.2em] opacity-60">Pipeline scan returned zero entries.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inq) => {
                                    const srcStyle = SOURCE_STYLES[inq.source] || SOURCE_STYLES['Other'];
                                    const stStyle = STATUS_STYLES[inq.status] || STATUS_STYLES['new'];
                                    const followUp = getFollowUpLabel(inq.followUpDate);
                                    const SrcIcon = SOURCE_ICONS[inq.source] || ClipboardList;
                                    const isConverted = convertedId === inq.id;

                                    return (
                                        <tr key={inq.id} className={`hover:bg-surface-alt/50 transition-all cursor-pointer group text-left ${isConverted ? 'bg-emerald-50/50' : ''}`}>
                                            {/* Visitor */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className="w-11 h-11 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-inner shrink-0">
                                                        {inq.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col text-left min-w-0">
                                                        <span className="text-sm font-black text-text uppercase tracking-tight leading-none mb-1 truncate">{inq.name}</span>
                                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em] leading-none flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 opacity-40" />{inq.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Source */}
                                            <td className="px-6 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${srcStyle.bg} ${srcStyle.text} ${srcStyle.border}`}>
                                                    <SrcIcon className="w-3 h-3" />
                                                    {inq.source}
                                                </span>
                                            </td>

                                            {/* Interest */}
                                            <td className="px-6 py-6 hidden md:table-cell">
                                                <span className="text-[11px] font-black text-text-secondary uppercase tracking-tight leading-none">{inq.serviceInterest || '—'}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-6 relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === inq.id ? null : inq.id); }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border transition-all hover:shadow-md ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}
                                                >
                                                    {stStyle.label}
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                                {statusDropdown === inq.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(null)} />
                                                        <div className="absolute left-6 top-full mt-1 z-50 bg-white dark:bg-surface-alt border border-border shadow-2xl rounded-none overflow-hidden min-w-[140px]">
                                                            {STATUSES.map(s => (
                                                                <button
                                                                    key={s}
                                                                    onClick={(e) => { e.stopPropagation(); changeStatus(inq.id, s); }}
                                                                    className={`w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-surface transition-all flex items-center gap-2 ${inq.status === s ? 'bg-primary/5 text-primary' : 'text-text-secondary'}`}
                                                                >
                                                                    {STATUS_STYLES[s].label}
                                                                    {s === 'converted' && <Sparkles className="w-3 h-3" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                                {isConverted && (
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                                        <span className="text-2xl animate-bounce">🎉</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Follow-up */}
                                            <td className="px-6 py-6 hidden lg:table-cell">
                                                {followUp ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest ${followUp.color} ${followUp.bg}`}>
                                                        {followUp.text.includes('overdue') ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                                        {followUp.text}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-text-muted/30 uppercase">No Follow-up</span>
                                                )}
                                            </td>

                                            {/* Created */}
                                            <td className="px-6 py-6 hidden lg:table-cell">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{formatDate(inq.createdAt)}</span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 font-black">
                                                    <button onClick={() => openEdit(inq)} className="p-3 rounded-none bg-background border border-border text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(inq.id)} className="p-3 rounded-none bg-background border border-border text-text-muted hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
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
            </div>

            {/* Modal — Add / Edit Inquiry */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left font-black" onClick={closeModal}>
                    <div className="bg-surface rounded-none w-full max-w-xl p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border text-left font-black max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-6 border border-primary/20 shadow-xl shadow-primary/5">
                                <ClipboardList className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">{editingInquiry ? 'Update Inquiry' : 'Log New Inquiry'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Capture visitor & inquiry data</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6 text-left font-black">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Full Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="e.g. PRIYA SHARMA" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Phone *</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="+91..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="email@domain.com" />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Source</label>
                                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                        {SOURCES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Service Interested In</label>
                                <input type="text" value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })} className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="e.g. KERATIN TREATMENT" />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-6 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none transition-all resize-none placeholder:text-text-muted/10" placeholder="Additional details..." />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Follow-up Reminder</label>
                                <div className="flex items-center gap-3">
                                    {FOLLOW_UP_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, followUpDays: opt.value })}
                                            className={`px-5 py-3 rounded-none text-[10px] font-black uppercase tracking-widest border transition-all ${form.followUpDays === opt.value
                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                : 'bg-background dark:bg-surface-alt border-border text-text-muted hover:border-primary/30'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-6 pt-8 font-black">
                                <button type="button" onClick={closeModal} className="flex-1 py-5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:bg-surface-alt transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all">{editingInquiry ? 'Update' : 'Log Inquiry'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
