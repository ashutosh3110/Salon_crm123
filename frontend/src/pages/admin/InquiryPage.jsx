import { useState, useEffect, useMemo } from 'react';
import {
    Plus, Search, Phone, Edit, Trash2, TrendingUp,
    ClipboardList, Calendar, Clock, CheckCircle,
    ChevronDown, Eye
} from 'lucide-react';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';

/* ─── Constants ───────────────────────────────────────────────────────── */

const SOURCES = ['Walk-in', 'Phone Call', 'Instagram', 'Facebook', 'WhatsApp', 'Website', 'Referral', 'Other'];
const STATUSES = ['new', 'follow-up', 'converted', 'lost'];
const FOLLOW_UP_OPTIONS = [
    { label: 'No reminder', value: 0 },
    { label: '3 days', value: 3 },
    { label: '7 days', value: 7 },
    { label: '10 days', value: 10 },
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
    'follow-up': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Follow-up' },
    'converted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Booked' },
    'lost': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Not Interested' },
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function getFollowUpLabel(dateStr) {
    if (!dateStr) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, color: 'text-rose-600', bg: 'bg-rose-50' };
    if (diff === 0) return { text: 'Due today', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: `In ${diff} day${diff !== 1 ? 's' : ''}`, color: 'text-text-muted', bg: 'bg-surface' };
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function InquiryPage() {
    const { outlets: contextOutlets, services: contextServices } = useBusiness();
    const outlets = contextOutlets || [];
    const services = contextServices || [];

    const [inquiries, setInquiries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSource, setFilterSource] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingInquiry, setEditingInquiry] = useState(null);
    const [viewingInquiry, setViewingInquiry] = useState(null);
    const [statusDropdown, setStatusDropdown] = useState(null);
    const [convertedId, setConvertedId] = useState(null);
    const [form, setForm] = useState({
        customerId: '',
        name: '', phone: '', email: '', source: 'Walk-in',
        serviceInterest: '', notes: '', followUpDays: 0,
        outletId: '', interestedService: '',
        status: 'new'
    });

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/clients', { params: { page: 1, limit: 200 } });
            const list = res.data?.results || res.data || [];
            setCustomers(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error('[Inquiry] Customer fetch failed:', e);
            setCustomers([]);
        }
    };

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inquiries', { params: { page: 1, limit: 200 } });
            const list = res.data?.results || [];
            setInquiries(list.map((i) => ({ ...i, id: i._id || i.id })));
        } catch (e) {
            console.error('[Inquiry] Fetch failed:', e);
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
        fetchCustomers();
    }, []);

    const stats = useMemo(() => {
        const total = inquiries.length;
        const pending = inquiries.filter(i => i.status === 'new' || i.status === 'follow-up').length;
        const converted = inquiries.filter(i => i.status === 'converted').length;
        const rate = total > 0 ? Math.round((converted / total) * 100) : 0;
        return [
            { label: 'Total Enquiries', value: total, icon: ClipboardList, trend: '' },
            { label: 'Needs Follow-up', value: pending, icon: Clock, trend: '' },
            { label: 'Booked', value: converted, icon: CheckCircle, trend: '' },
            { label: 'Conversion Rate', value: `${rate}%`, icon: TrendingUp, trend: '' },
        ];
    }, [inquiries]);

    const filtered = useMemo(() => {
        return inquiries.filter(i => {
            const matchSearch = !search ||
                (i.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (i.phone || '').includes(search) ||
                (i.serviceInterest?.toLowerCase() || '').includes(search.toLowerCase());
            const matchSource = filterSource === 'All' || i.source === filterSource;
            const matchStatus = filterStatus === 'All' || i.status === filterStatus;
            return matchSearch && matchSource && matchStatus;
        });
    }, [inquiries, search, filterSource, filterStatus]);

    const filteredServices = useMemo(() => {
        if (!form.outletId) return [];
        return services.filter(s => {
            if (!s.outletIds || s.outletIds.length === 0) return true;
            return s.outletIds.includes(form.outletId) || s.outletIds.some(id => (id._id || id) === form.outletId);
        });
    }, [services, form.outletId]);

    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const matched = services.find(s => s._id === serviceId || s.id === serviceId);
        setForm(prev => ({
            ...prev,
            interestedService: serviceId,
            serviceInterest: matched ? matched.name : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let followUpDate = null;
        if (form.followUpDays > 0) {
            const futureMs = form.followUpDays * 86400000;
            followUpDate = new Date(new Date().getTime() + futureMs).toISOString();
        }

        const payload = {
            name: form.name,
            phone: form.phone,
            email: form.email,
            source: form.source,
            serviceInterest: form.serviceInterest,
            notes: form.notes,
            followUpDate,
            reminderChannel: followUpDate ? 'whatsapp' : 'none',
            outletId: form.outletId || undefined,
            interestedService: form.interestedService || undefined,
            status: form.status
        };

        try {
            if (editingInquiry) {
                await api.patch(`/inquiries/${editingInquiry.id || editingInquiry._id}`, payload);
            } else {
                await api.post('/inquiries', payload);
            }
            await fetchInquiries();
            closeModal();
        } catch (error) {
            console.error('[Inquiry] Save failed:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this enquiry?')) return;
        try {
            await api.delete(`/inquiries/${id}`);
            await fetchInquiries();
        } catch (error) {
            console.error('[Inquiry] Delete failed:', error);
        }
    };

    const changeStatus = async (id, newStatus) => {
        if (newStatus === 'converted') {
            setConvertedId(id);
            setTimeout(() => setConvertedId(null), 1500);
        }
        try {
            await api.patch(`/inquiries/${id}`, { status: newStatus });
            await fetchInquiries();
        } catch (error) {
            console.error('[Inquiry] Status update failed:', error);
        }
        setStatusDropdown(null);
    };

    const openEdit = (inq) => {
        setEditingInquiry(inq);
        const followUpDays = inq.followUpDate
            ? Math.max(0, Math.round((new Date(inq.followUpDate) - Date.now()) / 86400000))
            : 0;
        const matched = customers.find((c) => c.phone === inq.phone);
        setForm({
            customerId: matched?._id || '',
            name: inq.name, phone: inq.phone, email: inq.email || '',
            source: inq.source,
            serviceInterest: inq.serviceInterest || '',
            notes: inq.notes || '',
            followUpDays,
            outletId: inq.outletId?._id || inq.outletId || '',
            interestedService: inq.interestedService?._id || inq.interestedService || '',
            status: inq.status || 'new'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingInquiry(null);
        setForm({
            customerId: '',
            name: '',
            phone: '',
            email: '',
            source: 'Walk-in',
            serviceInterest: '',
            notes: '',
            followUpDays: 0,
            outletId: '',
            interestedService: '',
            status: 'new'
        });
    };

    if (loading) {
        return <div className="p-20 text-center uppercase font-mono text-[10px] animate-pulse">Loading enquiries...</div>;
    }

    return (
        <div className="space-y-4 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Customer Enquiries</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">Track enquiries and convert them into bookings</p>
                </div>
                <button
                    onClick={() => { closeModal(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-primary hover:text-white transition-all font-mono"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Enquiry
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-4 border border-border flex flex-col justify-between group hover:border-primary transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <stat.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-text tracking-tighter uppercase font-mono italic leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white p-2 border border-border shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH..."
                        className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border text-[11px] font-bold focus:border-primary outline-none transition-all uppercase font-mono"
                    />
                </div>
            </div>

            <div className="bg-white border border-border shadow-sm overflow-visible min-h-[400px]">                <div className="overflow-x-auto overflow-y-visible no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px] relative">
                    <thead>
                        <tr className="bg-surface font-mono border-b border-border">
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Customer</th>
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Outlet</th>
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Source</th>
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Interest</th>
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-20 text-center uppercase font-black text-[10px] font-mono opacity-20">No enquiries</td></tr>
                        ) : (
                            filtered.map((inq) => {
                                const stStyle = STATUS_STYLES[inq.status] || STATUS_STYLES['new'];
                                return (
                                    <tr key={inq.id} className="hover:bg-primary/[0.02]">
                                        <td className="px-4 py-2">
                                            <div className="font-black text-text text-[11px] uppercase font-mono italic">{inq.name}</div>
                                            <div className="text-[9px] text-text-muted font-mono">{inq.phone}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-[9px] font-bold uppercase font-mono bg-slate-100 text-slate-800 px-2 py-0.5 border border-slate-200">{inq.outletId?.name || 'All Outlets'}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-[8px] font-black uppercase font-mono border border-border px-2 py-0.5">{inq.source}</span>
                                        </td>
                                        <td className="px-4 py-2 uppercase font-mono text-[9px]">{inq.serviceInterest || '—'}</td>
                                    <td className="px-4 py-2 relative overflow-visible">
    <button
        type="button"
        onClick={(e) => {
            e.stopPropagation();
            setStatusDropdown(
                statusDropdown === inq.id ? null : inq.id
            );
        }}
        className={`inline-flex items-center gap-1 text-[8px] font-black border uppercase tracking-widest font-mono px-2 py-1 ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}
    >
        {stStyle.label}
        <ChevronDown className="w-2 h-2" />
    </button>

    {statusDropdown === inq.id && (
        <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border border-border shadow-xl min-w-[150px] rounded">
            {STATUSES.map((status) => (
                <button
                    type="button"
                    key={status}
                    onClick={() => changeStatus(inq.id, status)}
                    className="block w-full text-left px-3 py-2 text-[9px] uppercase font-mono hover:bg-slate-50"
                >
                    {STATUS_STYLES[status]?.label || status}
                </button>
            ))}
        </div>
    )}
</td>
                                        <td className="px-4 py-2 text-right">
                                            <button onClick={() => setViewingInquiry(inq)} className="p-1 text-slate-500 hover:text-primary transition-colors" title="View Details"><Eye className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => openEdit(inq)} className="p-1" title="Edit"><Edit className="w-3 h-3" /></button>
                                            <button onClick={() => handleDelete(inq.id)} className="p-1 text-rose-500" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto pt-10 md:pt-16" onClick={closeModal}>
                    <div className="bg-white w-full max-w-md p-6 border-2 border-text shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} required className="w-full px-3 py-2 border border-border text-[11px] font-black uppercase font-mono" placeholder="ENTER NAME" />
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Phone *</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2 border border-border text-[11px] font-black font-mono" placeholder="ENTER PHONE" />
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Source</label>
                                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-border text-[10px] font-black font-mono uppercase bg-white outline-none focus:border-primary">
                                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Lead Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-border text-[10px] font-black font-mono uppercase bg-white outline-none focus:border-primary">
                                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s]?.label || s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Lead Follow-up Reminder</label>
                                <select value={form.followUpDays} onChange={(e) => setForm({ ...form, followUpDays: Number(e.target.value) })} className="w-full px-3 py-2 border border-border text-[10px] font-black font-mono uppercase bg-white outline-none focus:border-primary">
                                    {FOLLOW_UP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Outlet *</label>
                                <select
                                    value={form.outletId}
                                    onChange={(e) => setForm({ ...form, outletId: e.target.value, interestedService: '', serviceInterest: '' })}
                                    required
                                    className="w-full px-3 py-2 border border-border text-[10px] font-black font-mono uppercase bg-white outline-none focus:border-primary"
                                >
                                    <option value="">Select Outlet</option>
                                    {outlets.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Service Interest *</label>
                                <select
                                    value={form.interestedService}
                                    onChange={handleServiceChange}
                                    required
                                    disabled={!form.outletId}
                                    className="w-full px-3 py-2 border border-border text-[10px] font-black font-mono uppercase bg-white outline-none focus:border-primary disabled:opacity-50"
                                >
                                    <option value="">{!form.outletId ? 'Select Outlet First' : 'Select Service'}</option>
                                    {filteredServices.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} (₹{s.price})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block font-mono">Enquiry Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value.toUpperCase() })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-border text-[11px] font-black uppercase font-mono resize-none focus:border-primary outline-none"
                                    placeholder="ENTER DETAILS/NOTES"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 py-3 text-[9px] font-black uppercase font-mono border border-border hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 bg-text text-white py-3 font-black uppercase font-mono text-[9px] hover:bg-primary transition-all">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingInquiry && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto pt-10 md:pt-16" onClick={() => setViewingInquiry(null)}>
                    <div className="bg-white w-full max-w-md p-6 border-2 border-text shadow-2xl space-y-6 text-left font-mono" onClick={(e) => e.stopPropagation()}>
                        <div className="border-b border-border pb-4">
                            <h2 className="text-sm font-black text-text uppercase italic tracking-tight leading-none flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-primary" /> Enquiry Overview
                            </h2>
                            <p className="text-[8px] text-text-muted mt-1 uppercase tracking-wider">Reference_ID: {viewingInquiry.id || viewingInquiry._id}</p>
                        </div>

                        <div className="space-y-4 text-xs font-black uppercase">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[8px] text-text-muted block">Client Identity</span>
                                    <span className="text-[10px] text-text italic">{viewingInquiry.name}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8px] text-text-muted block">Contact Number</span>
                                    <span className="text-[10px] text-text">{viewingInquiry.phone}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[8px] text-text-muted block">Source Channel</span>
                                    <span className="text-[9px] bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-800 inline-block mt-0.5">{viewingInquiry.source}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8px] text-text-muted block">Lead Status</span>
                                    <span className={`text-[9px] border inline-block px-2 py-0.5 mt-0.5 ${STATUS_STYLES[viewingInquiry.status]?.bg || 'bg-sky-50'} ${STATUS_STYLES[viewingInquiry.status]?.text || 'text-sky-700'} ${STATUS_STYLES[viewingInquiry.status]?.border || 'border-sky-200'}`}>
                                        {STATUS_STYLES[viewingInquiry.status]?.label || viewingInquiry.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[8px] text-text-muted block">Assigned Outlet</span>
                                <span className="text-[10px] text-text">{viewingInquiry.outletId?.name || 'All Outlets'}</span>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[8px] text-text-muted block">Service Interest</span>
                                <span className="text-[10px] text-text">{viewingInquiry.serviceInterest || '—'}</span>
                            </div>

                            {viewingInquiry.followUpDate && (
                                <div className="space-y-0.5">
                                    <span className="text-[8px] text-text-muted block">Follow-up Target</span>
                                    <span className="text-[10px] text-text flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        {formatDate(viewingInquiry.followUpDate)}
                                        <span className={`px-2 py-0.5 text-[8px] border font-black ${getFollowUpLabel(viewingInquiry.followUpDate)?.bg} ${getFollowUpLabel(viewingInquiry.followUpDate)?.color}`}>
                                            {getFollowUpLabel(viewingInquiry.followUpDate)?.text}
                                        </span>
                                    </span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <span className="text-[8px] text-text-muted block">Enquiry Notes / Description</span>
                                <div className="p-3 bg-slate-50 border border-border rounded text-[10px] normal-case text-text font-mono leading-relaxed min-h-[60px] whitespace-pre-wrap">
                                    {viewingInquiry.notes || 'No description notes provided for this lead.'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="button" onClick={() => setViewingInquiry(null)} className="w-full py-2.5 text-[9px] font-black uppercase font-mono border border-border hover:bg-slate-50 transition-all">Dismiss Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
