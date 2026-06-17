import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Search, LifeBuoy, MessageSquare,
    CheckCircle, Clock, AlertCircle, ChevronDown,
    Filter, HelpCircle, ArrowUpCircle,
    X, Send, RefreshCw, User as UserIcon, Shield, Headphones, Ticket, Bell, Eye,
    Wrench, Monitor, CreditCard, Printer, Zap, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import AnimatedCounter from '../../components/common/AnimatedCounter';

/* ─── Constants ───────────────────────────────────────────────────────── */

const CUSTOMER_CATEGORIES = ['Billing', 'Technical Issue', 'Feature Request', 'General Inquiry', 'Account Access', 'Service Complaint', 'Appointment Issue'];
const PLATFORM_CATEGORIES = ['Bug Report', 'Payment Issue', 'Printer Issue', 'Feature Request', 'Network/System Issue', 'Access / Permission', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_STYLES = {
    'open':       { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   label: 'Open' },
    'pending':    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   label: 'Open' },
    'in-progress':{ bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-400',     label: 'In Progress' },
    'resolved':   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400', label: 'Resolved' },
    'closed':     { bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-400',   label: 'Closed' },
    'escalated':  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-400',    label: 'Escalated' },
};

const PRIORITY_STYLES = {
    'low':    { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',   label: 'Low' },
    'medium': { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    dot: 'bg-blue-400',    label: 'Medium' },
    'high':   { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200',  dot: 'bg-orange-400',  label: 'High' },
    'urgent': { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    label: 'Urgent' },
};

const CATEGORY_STYLES = {
    'Billing':           'text-purple-600 bg-purple-50 border-purple-100',
    'Technical Issue':   'text-rose-600 bg-rose-50 border-rose-100',
    'Feature Request':   'text-blue-600 bg-blue-50 border-blue-100',
    'General Inquiry':   'text-slate-600 bg-slate-50 border-slate-100',
    'Account Access':    'text-amber-600 bg-amber-50 border-amber-100',
    'Service Complaint': 'text-red-600 bg-red-50 border-red-100',
    'Appointment Issue': 'text-teal-600 bg-teal-50 border-teal-100',
    'Bug Report':        'text-rose-600 bg-rose-50 border-rose-100',
    'Payment Issue':     'text-purple-600 bg-purple-50 border-purple-100',
    'Printer Issue':     'text-orange-600 bg-orange-50 border-orange-100',
    'Network/System Issue': 'text-sky-600 bg-sky-50 border-sky-100',
    'Access / Permission':  'text-amber-600 bg-amber-50 border-amber-100',
    'Other':             'text-slate-600 bg-slate-50 border-slate-100',
};

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function SupportPage() {
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase();

    const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'platform'
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);
    const [form, setForm] = useState({ subject: '', category: 'General Inquiry', priority: 'medium', description: '' });
    const [toast, setToast] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const filterRef = useRef(null);
    const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const statusBtnRefs = useRef({});
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const categoryDropdownRef = useRef(null);
    const priorityDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
            if (!event.target.closest('.status-dropdown-container')) setOpenStatusDropdownId(null);
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setIsCategoryOpen(false);
            if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) setIsPriorityOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchTickets();
        setSearch('');
        setFilterStatus('All');
    }, [activeTab]);

    useEffect(() => {
        if (selectedTicket) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.responses]);

    /* When tab changes, update default category in form */
    useEffect(() => {
        setForm(f => ({
            ...f,
            category: activeTab === 'platform' ? 'Bug Report' : 'General Inquiry'
        }));
    }, [activeTab]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'customer' ? '/support/admin/tickets' : '/tickets';
            let params = {};
            if (['receptionist', 'stylist', 'manager'].includes(userRole)) {
                const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
                if (userOutletId) params.outletId = userOutletId;
            }
            const response = await api.get(endpoint, { params });
            if (response.data.success) setTickets(response.data.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    /* ─── Computed stats per tab ─────────────────────────────────── */
    const customerStats = useMemo(() => {
        const total = tickets.length;
        const active = tickets.filter(t => t.status === 'open' || t.status === 'pending' || t.status === 'in-progress').length;
        const resolved = tickets.filter(t => t.status === 'resolved').length;
        return [
            { label: 'Total Tickets',    value: total,    subtitle: 'All customer tickets',     icon: Ticket,      iconColorClass: '!text-[#F59E0B]', iconBgClass: '!bg-[#FEF3C7]', cardBgClass: '!bg-[#FFFBEB]', cardBorderClass: '!border-[#FEF3C7] hover:!border-[#FCD34D]' },
            { label: 'Active Issues',    value: active,   subtitle: 'Open + In Progress',        icon: Bell,        iconColorClass: '!text-[#A855F7]', iconBgClass: '!bg-[#F3E8FF]', cardBgClass: '!bg-[#FAF5FF]', cardBorderClass: '!border-[#F3E8FF] hover:!border-[#D8B4FE]' },
            { label: 'Resolved',         value: resolved, subtitle: 'Successfully resolved',     icon: CheckCircle, iconColorClass: '!text-[#10B981]', iconBgClass: '!bg-[#D1FAE5]', cardBgClass: '!bg-[#F0FDF4]', cardBorderClass: '!border-[#D1FAE5] hover:!border-[#6EE7B7]' },
            { label: 'Avg. Response Time', value: '< 4hrs', subtitle: 'Average first response', icon: Clock,       iconColorClass: '!text-[#3B82F6]', iconBgClass: '!bg-[#DBEAFE]', cardBgClass: '!bg-[#EFF6FF]', cardBorderClass: '!border-[#DBEAFE] hover:!border-[#93C5FD]' },
        ];
    }, [tickets]);

    const platformStats = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'open' || t.status === 'pending' || t.status === 'in-progress').length;
        const closed = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
        return [
            { label: 'Total Requests',    value: total,  subtitle: 'All platform requests',    icon: Monitor,     iconColorClass: '!text-[#F59E0B]', iconBgClass: '!bg-[#FEF3C7]', cardBgClass: '!bg-[#FFFBEB]', cardBorderClass: '!border-[#FEF3C7] hover:!border-[#FCD34D]' },
            { label: 'Open Requests',     value: open,   subtitle: 'Pending admin action',     icon: AlertCircle, iconColorClass: '!text-[#EF4444]', iconBgClass: '!bg-[#FEE2E2]', cardBgClass: '!bg-[#FFF5F5]', cardBorderClass: '!border-[#FEE2E2] hover:!border-[#FCA5A5]' },
            { label: 'Closed Requests',   value: closed, subtitle: 'Resolved by admin team',   icon: CheckCircle, iconColorClass: '!text-[#10B981]', iconBgClass: '!bg-[#D1FAE5]', cardBgClass: '!bg-[#F0FDF4]', cardBorderClass: '!border-[#D1FAE5] hover:!border-[#6EE7B7]' },
            { label: 'Avg. Resolution Time', value: '< 24hrs', subtitle: 'Average fix time',  icon: Clock,       iconColorClass: '!text-[#3B82F6]', iconBgClass: '!bg-[#DBEAFE]', cardBgClass: '!bg-[#EFF6FF]', cardBorderClass: '!border-[#DBEAFE] hover:!border-[#93C5FD]' },
        ];
    }, [tickets]);

    const stats = activeTab === 'customer' ? customerStats : platformStats;

    const filtered = useMemo(() => {
        return tickets.filter(t => {
            const subject = t.subject?.toLowerCase() || '';
            const id = t._id?.toLowerCase() || '';
            const matchSearch = !search || subject.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
            const matchStatus = filterStatus === 'All' || t.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [tickets, search, filterStatus]);

    /* ─── Handlers ───────────────────────────────────────────────── */

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (['receptionist', 'stylist', 'manager'].includes(userRole)) {
                const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
                if (userOutletId) payload.outletId = userOutletId;
            }
            const response = await api.post('/tickets', payload);
            if (response.data.success) {
                setTickets([response.data.data, ...tickets]);
                setShowModal(false);
                setForm({ subject: '', category: activeTab === 'platform' ? 'Bug Report' : 'General Inquiry', priority: 'medium', description: '' });
                showToast('Platform help request submitted successfully!');
            }
        } catch (error) {
            console.error('Failed to create ticket:', error);
            showToast('Failed to submit request. Please try again.', 'error');
        }
    };

    const handleSelectTicket = async (id) => {
        try {
            setLoadingDetail(true);
            setSelectedTicket({ _id: id });
            const response = await api.get(`/tickets/${id}`);
            if (response.data.success) setSelectedTicket(response.data.data);
        } catch (error) {
            console.error('Failed to fetch ticket details:', error);
            setSelectedTicket(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || sending) return;
        try {
            setSending(true);
            const response = await api.post(`/tickets/${selectedTicket._id}/responses`, { message: reply });
            if (response.data.success) {
                setSelectedTicket(response.data.data);
                setReply('');
                fetchTickets();
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.patch(`/support/tickets/${id}/status`, { status });
            if (response.data.success) {
                setTickets(tickets.map(t => t._id === id ? response.data.data : t));
                if (selectedTicket?._id === id) setSelectedTicket(response.data.data);
                showToast(`Status updated to ${status.replace('-', ' ').toUpperCase()}`);
            }
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const categories = activeTab === 'platform' ? PLATFORM_CATEGORIES : CUSTOMER_CATEGORIES;

    /* ─── Render ─────────────────────────────────────────────────── */

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8 font-sans">

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text tracking-tight leading-none">Support & Help</h1>
                    <p className="text-[11px] font-medium text-text-muted mt-1 uppercase tracking-wider">
                        {activeTab === 'customer'
                            ? 'Customer tickets raised via website, app, chat or WhatsApp'
                            : 'Internal platform issues raised by staff to admin team'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Tab Toggle */}
                    <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => setActiveTab('customer')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'customer' ? 'bg-[#B58E29] text-white' : 'bg-transparent text-text hover:bg-gray-50'}`}
                        >
                            <Headphones className="w-3.5 h-3.5" />
                            Customer Issues
                        </button>
                        <button
                            onClick={() => setActiveTab('platform')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'platform' ? 'bg-[#B58E29] text-white' : 'bg-transparent text-text hover:bg-gray-50'}`}
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            Platform Help
                        </button>
                    </div>
                    {/* Create button — only for platform tab */}
                    {activeTab === 'platform' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-text text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-lg hover:bg-primary hover:text-white transition-all rounded-xl"
                        >
                            <Plus className="w-4 h-4 text-white" />
                            New Request
                        </button>
                    )}
                </div>
            </div>

            {/* ── Flow Banner ──────────────────────────────────────── */}
            <div className={`rounded-2xl border px-5 py-3 flex items-center gap-6 text-[10px] font-bold uppercase tracking-wider overflow-x-auto ${activeTab === 'customer' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                {activeTab === 'customer' ? (
                    <>
                        <span className="flex items-center gap-1.5 shrink-0"><UserIcon className="w-3 h-3" /> Customer</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><MessageSquare className="w-3 h-3" /> Raises Ticket</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Headphones className="w-3 h-3" /> Receptionist / Support</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><CheckCircle className="w-3 h-3" /> Resolve / Close</span>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-1.5 shrink-0"><UserIcon className="w-3 h-3" /> Staff / Receptionist</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Plus className="w-3 h-3" /> Creates Platform Request</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><Shield className="w-3 h-3" /> Admin / Technical Team</span>
                        <span className="opacity-40">→</span>
                        <span className="flex items-center gap-1.5 shrink-0"><CheckCircle className="w-3 h-3" /> Resolve / Close</span>
                    </>
                )}
            </div>

            {/* ── Stats Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={`${activeTab}-${stat.label}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${stat.cardBgClass} ${stat.cardBorderClass}`}
                    >
                        <div className="flex !items-start gap-3 !text-left">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${stat.iconBgClass}`} style={{ borderRadius: '12px' }}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColorClass}`} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col !items-start !text-left">
                                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }} className="uppercase text-slate-500 leading-none mb-1.5 !text-left">{stat.label}</span>
                                <h3 style={{ fontSize: '24px', fontWeight: 850 }} className="text-slate-800 leading-none tracking-tight !text-left flex items-baseline">
                                    {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                                </h3>
                                <span style={{ fontSize: '12px', fontWeight: 500 }} className="text-slate-500 mt-1.5 !text-left">{stat.subtitle}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Table Section ────────────────────────────────────── */}
            <div className="space-y-4">
                {/* Search + Filter Row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className={`relative flex-1 bg-white border transition-all duration-300 rounded-xl ${isSearchFocused ? 'border-[#B58E29] shadow-[0_0_15px_rgba(181,142,41,0.25)] ring-1 ring-[#B58E29]/50' : 'border-border shadow-sm'}`}>
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : 'text-text-muted'}`} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder={activeTab === 'customer' ? 'Search by customer name, subject or ticket ID...' : 'Search by subject, staff name or ticket ID...'}
                            className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[13px] font-medium outline-none rounded-xl"
                        />
                    </div>
                    <div
                        ref={filterRef}
                        className={`relative flex items-center px-5 bg-white border transition-all duration-300 rounded-xl cursor-pointer hover:bg-gray-50 ${isFilterOpen ? 'border-[#B58E29] ring-1 ring-[#B58E29]/50 shadow-[0_0_15px_rgba(181,142,41,0.15)]' : 'border-border shadow-sm'}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <Filter className={`w-4 h-4 mr-2 transition-colors ${isFilterOpen ? 'text-primary' : 'text-text-muted'}`} />
                        <div className="text-[12px] font-bold uppercase tracking-wider py-3.5 pr-8 min-w-[120px] select-none text-text">
                            {filterStatus === 'All' ? 'ALL STATUS' : filterStatus.replace('-', ' ')}
                        </div>
                        <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.13 }}
                                    className="absolute top-full right-0 w-full mt-2 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1"
                                >
                                    {[
                                        { value: 'All',         label: 'ALL' },
                                        { value: 'pending',     label: 'OPEN' },
                                        { value: 'in-progress', label: 'IN PROGRESS' },
                                        { value: 'resolved',    label: 'RESOLVED' },
                                        { value: 'closed',      label: 'CLOSED' },
                                        { value: 'escalated',   label: 'ESCALATED' },
                                    ].map(opt => (
                                        <div
                                            key={opt.value}
                                            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${filterStatus === opt.value ? 'bg-primary/10 text-[#B4912B]' : 'text-text-muted hover:bg-slate-50'}`}
                                            onClick={() => setFilterStatus(opt.value)}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-border shadow-sm overflow-hidden min-h-[400px] rounded-2xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-40 space-y-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">Loading tickets...</p>
                        </div>
                    ) : activeTab === 'customer' ? (
                        <CustomerTable
                            tickets={filtered}
                            userRole={userRole}
                            openStatusDropdownId={openStatusDropdownId}
                            setOpenStatusDropdownId={setOpenStatusDropdownId}
                            statusBtnRefs={statusBtnRefs}
                            dropdownPos={dropdownPos}
                            setDropdownPos={setDropdownPos}
                            handleSelectTicket={handleSelectTicket}
                            handleUpdateStatus={handleUpdateStatus}
                        />
                    ) : (
                        <PlatformTable
                            tickets={filtered}
                            userRole={userRole}
                            openStatusDropdownId={openStatusDropdownId}
                            setOpenStatusDropdownId={setOpenStatusDropdownId}
                            statusBtnRefs={statusBtnRefs}
                            dropdownPos={dropdownPos}
                            setDropdownPos={setDropdownPos}
                            handleSelectTicket={handleSelectTicket}
                            handleUpdateStatus={handleUpdateStatus}
                        />
                    )}
                </div>
            </div>

            {/* ── Bottom Banner ────────────────────────────────────── */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-[#B4912B]/10 flex items-center justify-center shrink-0">
                        <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-text">
                            {activeTab === 'customer' ? "We're here to help!" : 'Report a Platform Issue'}
                        </h3>
                        <p className="text-[13px] text-text-muted mt-1">
                            {activeTab === 'customer'
                                ? 'Your satisfaction is our priority. Reach out anytime.'
                                : 'Found a bug or facing a technical problem? Create a platform help request.'}
                        </p>
                    </div>
                </div>
                <div className="relative z-10 hidden sm:flex items-center justify-center mr-8">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                        <span className="text-6xl">{activeTab === 'customer' ? '🎧' : '🛠️'}</span>
                        <span className="absolute -top-2 -right-4 text-3xl">{activeTab === 'customer' ? '💬' : '🔧'}</span>
                        <span className="absolute bottom-0 -right-2 text-2xl">{activeTab === 'customer' ? '😊' : '⚡'}</span>
                    </div>
                </div>
            </div>

            {/* ── Ticket Detail Drawer ─────────────────────────────── */}
            {selectedTicket && createPortal(
                <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity pointer-events-auto cursor-pointer" onClick={() => setSelectedTicket(null)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-border pointer-events-auto flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                                <div>
                                    <h2 className="text-[14px] font-bold text-text leading-tight">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-[10px] font-bold text-primary uppercase">#{selectedTicket._id?.slice(-6)}</div>
                                        <div className={`px-1.5 py-0.5 text-[8px] font-black border uppercase rounded-full ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).bg} ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).text} ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).border}`}>
                                            {(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).label}
                                        </div>
                                        {selectedTicket.priority && (
                                            <div className={`px-1.5 py-0.5 text-[8px] font-black border uppercase rounded-full ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).bg} ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).text} ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).border}`}>
                                                {(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {['admin', 'manager', 'superadmin'].includes(userRole) && (
                                    <div className="flex items-center gap-2 pr-4 border-r border-border mr-2">
                                        {selectedTicket.status !== 'resolved' && (
                                            <button onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all">
                                                Mark Resolved
                                            </button>
                                        )}
                                        {selectedTicket.status !== 'closed' && (
                                            <button onClick={() => handleUpdateStatus(selectedTicket._id, 'closed')} className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
                                                Close
                                            </button>
                                        )}
                                    </div>
                                )}
                                <button onClick={fetchTickets} className="p-2 hover:bg-surface rounded-xl">
                                    <RefreshCw className="w-4 h-4 text-text-muted" />
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface/10">
                            {loadingDetail ? (
                                <div className="flex flex-col items-center justify-center h-40 opacity-50 space-y-3">
                                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Loading ticket details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Original Message */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <UserIcon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-2 max-w-[85%]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-text">
                                                    {selectedTicket.customerId?.name || selectedTicket.userId?.name || 'Unknown'}
                                                </span>
                                                <span className="text-[9px] font-medium text-text-muted">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                                                {selectedTicket.description}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase ${CATEGORY_STYLES[selectedTicket.category] || CATEGORY_STYLES['General Inquiry']}`}>
                                                    {selectedTicket.category}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conversation */}
                                    <div className="space-y-6 pt-4 border-t border-border">
                                        {selectedTicket.responses?.map((msg, i) => {
                                            const isMe = msg.userId?._id === user?._id;
                                            const role = msg.userId?.role || 'user';
                                            return (
                                                <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    {!isMe && (
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-border">
                                                            <UserIcon className="w-4 h-4 text-slate-500" />
                                                        </div>
                                                    )}
                                                    <div className={`space-y-1.5 max-w-[80%] ${isMe ? 'items-end flex flex-col' : ''}`}>
                                                        <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                            <span className="text-[10px] font-bold text-text uppercase">
                                                                {isMe ? 'You' : msg.userId?.name}
                                                                {!isMe && role !== 'customer' && (
                                                                    <span className="ml-1.5 px-1 bg-primary/10 text-primary rounded text-[8px] tracking-tight">{role}</span>
                                                                )}
                                                            </span>
                                                            <span className="text-[9px] text-text-muted">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed ${isMe ? 'bg-text text-white rounded-tr-none' : 'bg-white border border-border text-text-secondary rounded-tl-none'}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {selectedTicket.responses?.length === 0 && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                                <Clock className="w-3.5 h-3.5" /> Awaiting reply
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Reply Input */}
                        {(selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved') ? (
                            <div className="p-6 border-t border-border bg-white">
                                <form onSubmit={handleSendReply} className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="w-full pl-4 pr-12 py-3 bg-surface border border-border focus:border-primary text-[13px] font-medium outline-none transition-all rounded-xl min-h-[50px] max-h-[150px] resize-none"
                                            rows="1"
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); } }}
                                        />
                                    </div>
                                    <button type="submit" disabled={!reply.trim() || sending} className="w-12 h-12 bg-text text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-8 border-t border-border bg-surface/50 text-center space-y-2">
                                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                                <h3 className="text-[12px] font-bold text-text uppercase">This ticket is {selectedTicket.status}</h3>
                                <p className="text-[11px] text-text-muted">Conversation is locked for resolved or closed issues.</p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* ── Create Platform Ticket Modal ─────────────────────── */}
            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-card text-card-foreground w-full max-w-md p-8 shadow-2xl relative border border-border overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-5 mb-8 pb-5 border-b border-border">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#B58E29]/10">
                                <Wrench className="w-7 h-7 text-[#B58E29]" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-card-foreground leading-none">New Platform Help Request</h2>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
                                    Report a bug, payment issue, printer problem, etc.
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 hover:bg-surface rounded-xl transition-colors">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Subject */}
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Subject</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-medium outline-none focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30 rounded-xl transition-all placeholder:text-muted-foreground/60"
                                    placeholder="Brief summary of the issue"
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2 text-left" ref={categoryDropdownRef}>
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Category</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryOpen(v => !v)}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-bold outline-none rounded-xl flex items-center justify-between cursor-pointer transition-all focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30"
                                    >
                                        <span>{form.category}</span>
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isCategoryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-[10001]"
                                            >
                                                {PLATFORM_CATEGORIES.map(c => (
                                                    <div
                                                        key={c}
                                                        onClick={() => { setForm({ ...form, category: c }); setIsCategoryOpen(false); }}
                                                        className={`px-4 py-3 text-[13px] font-medium cursor-pointer transition-colors flex items-center justify-between ${form.category === c ? 'bg-[#B58E29]/10 text-[#B58E29] font-bold' : 'text-card-foreground hover:bg-accent'}`}
                                                    >
                                                        {c}
                                                        {form.category === c && <span className="text-[#B58E29] text-xs">✓</span>}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2 text-left" ref={priorityDropdownRef}>
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Priority</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsPriorityOpen(v => !v)}
                                        className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-bold outline-none rounded-xl flex items-center justify-between cursor-pointer transition-all focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${(PRIORITY_STYLES[form.priority] || PRIORITY_STYLES.medium).bg.replace('bg-', 'bg-').replace('50', '400')}`} style={{ background: form.priority === 'urgent' ? '#f43f5e' : form.priority === 'high' ? '#f97316' : form.priority === 'medium' ? '#3b82f6' : '#94a3b8' }}></span>
                                            {(PRIORITY_STYLES[form.priority] || PRIORITY_STYLES.medium).label}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isPriorityOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isPriorityOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-[10001]"
                                            >
                                                {PRIORITIES.map(p => (
                                                    <div
                                                        key={p}
                                                        onClick={() => { setForm({ ...form, priority: p }); setIsPriorityOpen(false); }}
                                                        className={`px-4 py-3 text-[13px] font-medium cursor-pointer transition-colors flex items-center justify-between ${form.priority === p ? 'bg-[#B58E29]/10 text-[#B58E29] font-bold' : 'text-card-foreground hover:bg-accent'}`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full" style={{ background: p === 'urgent' ? '#f43f5e' : p === 'high' ? '#f97316' : p === 'medium' ? '#3b82f6' : '#94a3b8' }}></span>
                                                            {PRIORITY_STYLES[p].label}
                                                        </span>
                                                        {form.priority === p && <span className="text-[#B58E29] text-xs">✓</span>}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Detailed Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-medium outline-none focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30 rounded-xl resize-none h-28 transition-all placeholder:text-muted-foreground/60"
                                    placeholder="Explain the problem, steps to reproduce, or what help you need..."
                                />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-border mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent rounded-xl transition-colors border border-border">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 shadow-lg flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 bg-[#1e293b] hover:bg-[#2d3f57]">
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-white">Submit Request</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Toast ────────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-800 border-rose-700' : 'bg-[#1e293b] border-white/10'}`}
                    >
                        {toast.type === 'error'
                            ? <AlertTriangle className="w-5 h-5 text-rose-300" />
                            : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        <p className="text-[12px] font-bold uppercase tracking-widest text-white m-0">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   CUSTOMER ISSUES TABLE
   Columns: Customer Name | Subject | Category | Priority | Status | Date | Actions
────────────────────────────────────────────────────────────────────── */
function CustomerTable({ tickets, userRole, openStatusDropdownId, setOpenStatusDropdownId, statusBtnRefs, dropdownPos, setDropdownPos, handleSelectTicket, handleUpdateStatus }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
                <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '7%' }} />
                </colgroup>
                <thead>
                    <tr className="bg-surface border-b border-border">
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Customer Name</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Subject</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Priority</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center justify-center opacity-30 space-y-3">
                                    <Headphones className="w-12 h-12 text-text-muted" />
                                    <p className="text-[13px] font-bold text-text-muted">No customer support requests found.</p>
                                    <p className="text-[11px] text-text-muted">Customer tickets from website, app, chat or WhatsApp will appear here.</p>
                                </div>
                            </td>
                        </tr>
                    ) : tickets.map(t => {
                        const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                        const prStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium;
                        return (
                            <tr key={t._id} className="hover:bg-primary/[0.02] transition-colors group">
                                {/* Customer Name */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <UserIcon className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-bold text-text truncate max-w-[110px]">{t.customerId?.name || 'Unknown Customer'}</div>
                                            {t.customerId?.phone && <div className="text-[10px] text-text-muted mt-0.5">{t.customerId.phone}</div>}
                                        </div>
                                    </div>
                                </td>
                                {/* Subject */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="text-[12px] font-semibold text-text truncate max-w-[190px]">{t.subject}</div>
                                    <div className="text-[10px] font-bold text-primary/70 uppercase mt-0.5">#{t._id?.slice(-6)}</div>
                                </td>
                                {/* Category */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide rounded-full ${CATEGORY_STYLES[t.category] || CATEGORY_STYLES['General Inquiry']}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                                        {t.category}
                                    </div>
                                </td>
                                {/* Priority */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide rounded-full ${prStyle.bg} ${prStyle.text} ${prStyle.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${prStyle.dot}`}></span>
                                        {prStyle.label}
                                    </span>
                                </td>
                                {/* Status */}
                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                    {['admin', 'manager', 'superadmin'].includes(userRole) ? (
                                        <StatusDropdown t={t} stStyle={stStyle} openStatusDropdownId={openStatusDropdownId} setOpenStatusDropdownId={setOpenStatusDropdownId} statusBtnRefs={statusBtnRefs} dropdownPos={dropdownPos} setDropdownPos={setDropdownPos} handleUpdateStatus={handleUpdateStatus} />
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`}></span>
                                            {stStyle.label}
                                        </span>
                                    )}
                                </td>
                                {/* Date */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="text-[11px] font-medium text-text">{new Date(t.createdAt).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-text-muted mt-0.5">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleSelectTicket(t._id)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="View Details">
                                        <Eye className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   PLATFORM HELP TABLE
   Columns: Ticket ID | Subject | Category | Priority | Status | Created By | Date | Actions
────────────────────────────────────────────────────────────────────── */
function PlatformTable({ tickets, userRole, openStatusDropdownId, setOpenStatusDropdownId, statusBtnRefs, dropdownPos, setDropdownPos, handleSelectTicket, handleUpdateStatus }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
                <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '5%' }} />
                </colgroup>
                <thead>
                    <tr className="bg-surface border-b border-border">
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Ticket ID</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Subject</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Priority</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Created By</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="px-6 py-24 text-center">
                                <div className="flex flex-col items-center justify-center opacity-30 space-y-3">
                                    <Wrench className="w-12 h-12 text-text-muted" />
                                    <p className="text-[13px] font-bold text-text-muted">No platform help requests created yet.</p>
                                    <p className="text-[11px] text-text-muted">Use the "New Request" button to report a bug, payment issue, or platform problem.</p>
                                </div>
                            </td>
                        </tr>
                    ) : tickets.map(t => {
                        const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                        const prStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium;
                        return (
                            <tr key={t._id} className="hover:bg-primary/[0.02] transition-colors group">
                                {/* Ticket ID */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="text-[11px] font-bold text-primary uppercase">#{t._id?.slice(-6)}</div>
                                </td>
                                {/* Subject */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="text-[12px] font-semibold text-text truncate max-w-[180px]">{t.subject}</div>
                                </td>
                                {/* Category */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide rounded-full ${CATEGORY_STYLES[t.category] || CATEGORY_STYLES['Other']}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></div>
                                        {t.category}
                                    </div>
                                </td>
                                {/* Priority */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide rounded-full ${prStyle.bg} ${prStyle.text} ${prStyle.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${prStyle.dot}`}></span>
                                        {prStyle.label}
                                    </span>
                                </td>
                                {/* Status */}
                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                    {['admin', 'manager', 'superadmin'].includes(userRole) ? (
                                        <StatusDropdown t={t} stStyle={stStyle} openStatusDropdownId={openStatusDropdownId} setOpenStatusDropdownId={setOpenStatusDropdownId} statusBtnRefs={statusBtnRefs} dropdownPos={dropdownPos} setDropdownPos={setDropdownPos} handleUpdateStatus={handleUpdateStatus} />
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`}></span>
                                            {stStyle.label}
                                        </span>
                                    )}
                                </td>
                                {/* Created By */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <UserIcon className="w-3 h-3 text-slate-500" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-semibold text-text truncate max-w-[100px]">{t.userId?.name || 'Staff'}</div>
                                            {t.userId?.role && <div className="text-[9px] text-text-muted uppercase font-bold">{t.userId.role}</div>}
                                        </div>
                                    </div>
                                </td>
                                {/* Date */}
                                <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                    <div className="text-[11px] font-medium text-text">{new Date(t.createdAt).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-text-muted mt-0.5">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                {/* Actions */}
                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleSelectTicket(t._id)} className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="View Details">
                                        <Eye className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   STATUS DROPDOWN — shared component
────────────────────────────────────────────────────────────────────── */
function StatusDropdown({ t, stStyle, openStatusDropdownId, setOpenStatusDropdownId, statusBtnRefs, dropdownPos, setDropdownPos, handleUpdateStatus }) {
    return (
        <div className="status-dropdown-container inline-block">
            <button
                ref={el => statusBtnRefs.current[t._id] = el}
                onClick={() => {
                    if (openStatusDropdownId === t._id) {
                        setOpenStatusDropdownId(null);
                    } else {
                        const rect = statusBtnRefs.current[t._id]?.getBoundingClientRect();
                        if (rect) {
                            setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 160) });
                        }
                        setOpenStatusDropdownId(t._id);
                    }
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full outline-none cursor-pointer ${stStyle.bg} ${stStyle.text} ${stStyle.border} transition-all hover:brightness-95`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${stStyle.dot}`}></span>
                {stStyle.label}
                <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            {openStatusDropdownId === t._id && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="status-dropdown"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="fixed min-w-[160px] bg-white dark:bg-[#1e2433] border border-border rounded-xl overflow-hidden py-1.5 status-dropdown-container"
                        style={{ zIndex: 99999, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                    >
                        {[
                            { value: 'pending',     label: 'OPEN',        color: 'text-amber-600',   dot: 'bg-amber-400' },
                            { value: 'in-progress', label: 'IN PROGRESS', color: 'text-blue-600',    dot: 'bg-blue-400' },
                            { value: 'resolved',    label: 'RESOLVED',    color: 'text-emerald-600', dot: 'bg-emerald-400' },
                            { value: 'closed',      label: 'CLOSED',      color: 'text-slate-600',   dot: 'bg-slate-400' },
                            { value: 'escalated',   label: 'ESCALATED',   color: 'text-red-600',     dot: 'bg-red-400' },
                        ].map(opt => (
                            <div
                                key={opt.value}
                                className={`px-4 py-2.5 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${t.status === opt.value ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'} ${opt.color}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(t._id, opt.value);
                                    setOpenStatusDropdownId(null);
                                }}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.dot}`}></span>
                                {opt.label}
                                {t.status === opt.value && <span className="ml-auto">✓</span>}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
