import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Search, Phone, Edit, Trash2, TrendingUp,
    ClipboardList, Calendar, Clock, CheckCircle,
    ChevronDown, Eye, X, Filter, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import CustomDropdown from '../../components/common/CustomDropdown';
import toast from 'react-hot-toast';

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
    'converted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Converted' },
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
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingInquiry, setEditingInquiry] = useState(null);
    const [viewingInquiry, setViewingInquiry] = useState(null);
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
            { label: 'Total Enquiries', value: total, icon: ClipboardList, color: '#D97706', iconBg: '#FEF3C7', subtext: 'Logged Leads' },
            { label: 'Needs Follow-up', value: pending, icon: Clock, color: '#9333EA', iconBg: '#F3E8FF', subtext: 'Action Required' },
            { label: 'Converted', value: converted, icon: CheckCircle, color: '#16A34A', iconBg: '#DCFCE7', subtext: 'Converted Bookings' },
            { label: 'Conversion Rate', value: `${rate}%`, icon: TrendingUp, color: '#2563EB', iconBg: '#DBEAFE', subtext: 'Success Ratio' },
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
            const inqOutletId = i.outletId?._id || i.outletId;
            const matchOutlet = filterOutlet === 'All' || inqOutletId === filterOutlet;
            return matchSearch && matchSource && matchStatus && matchOutlet;
        });
    }, [inquiries, search, filterSource, filterStatus, filterOutlet]);

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
                toast.success('Enquiry updated successfully');
            } else {
                await api.post('/inquiries', payload);
                toast.success('Enquiry created successfully');
            }
            await fetchInquiries();
            closeModal();
        } catch (error) {
            console.error('[Inquiry] Save failed:', error);
            toast.error(error.response?.data?.message || 'Failed to save enquiry');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            await api.delete(`/inquiries/${id}`);
            toast.success('Enquiry deleted successfully');
            await fetchInquiries();
        } catch (error) {
            console.error('[Inquiry] Delete failed:', error);
            toast.error('Failed to delete enquiry');
        }
    };

    const changeStatus = async (id, newStatus) => {
        if (newStatus === 'converted') {
            setConvertedId(id);
            setTimeout(() => setConvertedId(null), 1500);
        }
        try {
            await api.patch(`/inquiries/${id}`, { status: newStatus });
            toast.success(`Status updated to ${STATUS_STYLES[newStatus]?.label || newStatus}`);
            await fetchInquiries();
        } catch (error) {
            console.error('[Inquiry] Status update failed:', error);
            toast.error('Failed to update status');
        }
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
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8 font-sans">
            <style>{`
                .action-btn-custom svg, .action-btn-custom svg * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }
                .action-btn-custom:hover svg, .action-btn-custom:hover svg * {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }
                .dark .action-btn-custom svg, .dark .action-btn-custom svg * {
                    color: #94a3b8 !important;
                    stroke: #94a3b8 !important;
                }
                .dark .action-btn-custom:hover svg, .dark .action-btn-custom:hover svg * {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                }
            `}</style>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-1">
                <div className="leading-none flex items-center gap-3">
                    <ClipboardList className="w-7 h-7 text-[#B4912B]" />
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-text uppercase tracking-tight leading-none">Customer Enquiries</h1>
                            <span className="px-2.5 py-1 bg-[#B4912B]/10 text-[#B4912B] text-[10px] font-black rounded-full leading-none">
                                {inquiries.length} Total
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-wider opacity-60 leading-none">Track client leads, manage callbacks, and convert them to salon bookings</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchInquiries}
                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Reload Enquiries"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { closeModal(); setShowModal(true); }}
                        className="flex items-center gap-2 bg-[#B4912B] hover:bg-black dark:hover:bg-white dark:hover:text-black text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md transition-all rounded-xl active:scale-95 cursor-pointer border-none"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Enquiry
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-4.5 border border-slate-100 dark:border-slate-800/80 flex items-center gap-4 group hover:border-black dark:hover:border-white transition-all min-h-[100px] relative overflow-hidden rounded-[16px] shadow-sm">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 animate-pulse-subtle" style={{ backgroundColor: stat.iconBg }}>
                            <stat.icon className="w-5 h-5" style={{ color: stat.color }} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                            <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text italic font-mono">
                                {stat.value}
                            </h3>
                            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                                {stat.subtext}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 rounded-xl items-center shadow-sm">
                <div className="flex items-center gap-3 flex-1 h-10 px-4 w-full">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search enquiries by name, phone or interest..."
                        className="w-full h-full text-[11px] font-bold uppercase tracking-wider outline-none text-neutral-800 dark:text-neutral-200 bg-transparent border-none shadow-none placeholder-slate-400"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
                    <div className="min-w-[160px] h-9">
                        <CustomDropdown
                            value={filterOutlet}
                            onChange={setFilterOutlet}
                            options={[
                                { label: 'ALL OUTLETS', value: 'All' },
                                ...outlets.map(o => ({ label: o.name.toUpperCase(), value: o._id || o.id }))
                            ]}
                            className="w-full h-full [&>.custom-dropdown-trigger]:h-full [&>.custom-dropdown-trigger]:!py-0 [&>.custom-dropdown-trigger]:shadow-none [&>.custom-dropdown-trigger]:bg-transparent [&>.custom-dropdown-trigger]:!text-[10px]"
                        />
                    </div>
                    
                    <div className="min-w-[140px] h-9">
                        <CustomDropdown
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { label: 'ALL STATUSES', value: 'All' },
                                ...STATUSES.map(s => ({ label: (STATUS_STYLES[s]?.label || s).toUpperCase(), value: s }))
                            ]}
                            className="w-full h-full [&>.custom-dropdown-trigger]:h-full [&>.custom-dropdown-trigger]:!py-0 [&>.custom-dropdown-trigger]:shadow-none [&>.custom-dropdown-trigger]:bg-transparent [&>.custom-dropdown-trigger]:!text-[10px]"
                        />
                    </div>

                    <div className="min-w-[140px] h-9">
                        <CustomDropdown
                            value={filterSource}
                            onChange={setFilterSource}
                            options={[
                                { label: 'ALL SOURCES', value: 'All' },
                                ...SOURCES.map(s => ({ label: s.toUpperCase(), value: s }))
                            ]}
                            className="w-full h-full [&>.custom-dropdown-trigger]:h-full [&>.custom-dropdown-trigger]:!py-0 [&>.custom-dropdown-trigger]:shadow-none [&>.custom-dropdown-trigger]:bg-transparent [&>.custom-dropdown-trigger]:!text-[10px]"
                        />
                    </div>
                </div>
            </div>

            {/* Table Registry */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm rounded-[20px] overflow-hidden pt-5 px-6 pb-3">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px] relative">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 font-sans">
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Customer Details</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Outlet</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Source</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Interest / Service</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Lead Status</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center uppercase font-black text-[10px] font-mono opacity-30">
                                        No enquiries found matching criteria
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inq) => {
                                    const stStyle = STATUS_STYLES[inq.status] || STATUS_STYLES['new'];
                                    return (
                                        <tr key={inq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="font-black text-text text-[11px] uppercase italic">{inq.name}</div>
                                                <div className="text-[9.5px] text-text-muted font-bold tracking-wide mt-0.5">{inq.phone}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                    {inq.outletId?.name || 'All Outlets'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-[8.5px] font-black uppercase border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    {inq.source}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 uppercase text-[10px] font-bold text-text-secondary">
                                                {inq.serviceInterest || '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="relative inline-block min-w-[125px]">
                                                    <select
                                                        value={inq.status}
                                                        onChange={(e) => changeStatus(inq.id, e.target.value)}
                                                        className={`text-[9.5px] font-black border uppercase tracking-wider font-sans px-3 py-1.5 cursor-pointer outline-none w-full rounded-xl appearance-none transition-all pr-8 shadow-sm ${stStyle.bg} ${stStyle.text} ${stStyle.border} hover:shadow-md`}
                                                    >
                                                        {STATUSES.map((status) => (
                                                            <option key={status} value={status} className="bg-white dark:bg-slate-900 text-text dark:text-white uppercase font-sans text-[10px]">
                                                                {STATUS_STYLES[status]?.label || status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${stStyle.text}`} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => setViewingInquiry(inq)}
                                                        className="w-7 h-7 rounded-[8px] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer action-btn-custom"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(inq)}
                                                        className="w-7 h-7 rounded-[8px] border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer action-btn-custom"
                                                        title="Edit details"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(inq.id)}
                                                        className="w-7 h-7 rounded-[8px] border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors shadow-sm cursor-pointer"
                                                        title="Delete Enquiry"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden" onClick={closeModal}>
                    <div className="relative bg-white dark:bg-[#0f172a] shadow-2xl w-full max-w-lg flex flex-col animate-reveal rounded-[24px] max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-20">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] dark:bg-[#D97706]/20 flex items-center justify-center shrink-0">
                                    <ClipboardList className="w-5 h-5 text-[#D97706]" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                                        {editingInquiry ? 'Edit Enquiry' : 'Add Enquiry'}
                                    </h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-none mt-1">
                                        {editingInquiry ? 'Update lead credentials' : 'Add new customer lead information'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-450 hover:text-rose-500 transition-colors cursor-pointer border-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 custom-scrollbar text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder="ENTER NAME"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Phone *</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder="ENTER PHONE"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Source</label>
                                    <select
                                        value={form.source}
                                        onChange={(e) => setForm({ ...form, source: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white uppercase"
                                    >
                                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Lead Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white uppercase"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_STYLES[s]?.label || s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Lead Follow-up Reminder</label>
                                <select
                                    value={form.followUpDays}
                                    onChange={(e) => setForm({ ...form, followUpDays: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white uppercase"
                                >
                                    {FOLLOW_UP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Outlet *</label>
                                    <select
                                        value={form.outletId}
                                        onChange={(e) => setForm({ ...form, outletId: e.target.value, interestedService: '', serviceInterest: '' })}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white uppercase"
                                    >
                                        <option value="">Select Outlet</option>
                                        {outlets.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Service Interest *</label>
                                    <select
                                        value={form.interestedService}
                                        onChange={handleServiceChange}
                                        required
                                        disabled={!form.outletId}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white disabled:opacity-50 uppercase"
                                    >
                                        <option value="">{!form.outletId ? 'Select Outlet First' : 'Select Service'}</option>
                                        {filteredServices.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name} (₹{s.price})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest block font-sans">Enquiry Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value.toUpperCase() })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all rounded-xl text-slate-900 dark:text-white uppercase resize-none"
                                    placeholder="ENTER DETAILS/NOTES..."
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#B4912B] hover:bg-black text-white py-3 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all rounded-xl cursor-pointer border-none"
                                >
                                    Save Enquiry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {viewingInquiry && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden" onClick={() => setViewingInquiry(null)}>
                    <div className="relative bg-white dark:bg-[#0f172a] shadow-2xl w-full max-w-md flex flex-col animate-reveal rounded-[24px] max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-20">
                            <div className="flex items-center gap-3 text-left">
                                <div className="w-10 h-10 rounded-full bg-[#DBEAFE] dark:bg-[#2563EB]/25 flex items-center justify-center shrink-0">
                                    <Eye className="w-5 h-5 text-[#2563EB]" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                                        Enquiry Details
                                    </h2>
                                    <p className="text-[8.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-none mt-1">
                                        ID: {viewingInquiry.id || viewingInquiry._id}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewingInquiry(null)}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-450 hover:text-rose-500 transition-colors cursor-pointer border-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-left text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Client Identity</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white italic">{viewingInquiry.name}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Contact Number</span>
                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{viewingInquiry.phone}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Source Channel</span>
                                    <span className="text-[9.5px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-250 inline-block mt-1 rounded-lg font-black">{viewingInquiry.source}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Lead Status</span>
                                    <span className={`text-[9.5px] border inline-block px-2.5 py-1 mt-1 rounded-lg font-black ${STATUS_STYLES[viewingInquiry.status]?.bg || 'bg-sky-50'} ${STATUS_STYLES[viewingInquiry.status]?.text || 'text-sky-700'} ${STATUS_STYLES[viewingInquiry.status]?.border || 'border-sky-200'}`}>
                                        {STATUS_STYLES[viewingInquiry.status]?.label || viewingInquiry.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Assigned Outlet</span>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{viewingInquiry.outletId?.name || 'All Outlets'}</span>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Service Interest</span>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{viewingInquiry.serviceInterest || '—'}</span>
                                </div>
                            </div>

                            {viewingInquiry.followUpDate && (
                                <div className="space-y-0.5">
                                    <span className="text-[8.5px] text-text-muted block tracking-wider">Follow-up Target</span>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-[#B4912B]" />
                                        {formatDate(viewingInquiry.followUpDate)}
                                        <span className={`px-2.5 py-1 text-[8.5px] border font-black rounded-lg ${getFollowUpLabel(viewingInquiry.followUpDate)?.bg} ${getFollowUpLabel(viewingInquiry.followUpDate)?.color}`}>
                                            {getFollowUpLabel(viewingInquiry.followUpDate)?.text}
                                        </span>
                                    </span>
                                </div>
                            )}

                            <div className="space-y-1.5 pt-1">
                                <span className="text-[8.5px] text-text-muted block tracking-wider">Enquiry Notes / Description</span>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[10.5px] normal-case text-slate-800 dark:text-slate-200 font-medium leading-relaxed min-h-[80px] whitespace-pre-wrap">
                                    {viewingInquiry.notes || 'No description notes provided for this lead.'}
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="button"
                                    onClick={() => setViewingInquiry(null)}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all rounded-xl cursor-pointer text-slate-700 dark:text-slate-200"
                                >
                                    Dismiss Overview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
