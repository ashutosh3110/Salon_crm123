import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Search, LifeBuoy, MessageSquare,
    CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight,
    Filter, Download, HelpCircle, ArrowRight, ArrowUpCircle,
    X, Send, RefreshCw, User as UserIcon, MoreHorizontal, Copy, Shield, Headphones, Ticket, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import AnimatedCounter from '../../components/common/AnimatedCounter';

/* ─── Constants ───────────────────────────────────────────────────────── */

const CATEGORIES = ['Billing', 'Technical Issue', 'Feature Request', 'General Inquiry', 'Account Access'];
const STATUSES = ['pending', 'in-progress', 'resolved', 'closed'];

const STATUS_STYLES = {
    'pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
    'in-progress': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'In Progress' },
    'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
    'closed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed' },
    'escalated': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Escalated' },
};

const CATEGORY_STYLES = {
    'Billing': 'text-purple-600 bg-purple-50 border-purple-100',
    'Technical Issue': 'text-rose-600 bg-rose-50 border-rose-100',
    'Feature Request': 'text-blue-600 bg-blue-50 border-blue-100',
    'General Inquiry': 'text-slate-600 bg-slate-50 border-slate-100',
    'Account Access': 'text-amber-600 bg-amber-50 border-amber-100',
};

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function SupportPage() {
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase();
    const isOwner = userRole === 'admin';
    const canEscalate = userRole === 'manager';

    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'platform'
    const [faqs, setFaqs] = useState([]);
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
    const [form, setForm] = useState({ subject: '', category: 'General Inquiry', description: '' });
    const [toast, setToast] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const filterRef = useRef(null);
    const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const statusBtnRefs = useRef({});
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
            if (!event.target.closest('.status-dropdown-container')) {
                setOpenStatusDropdownId(null);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchTickets();
        fetchFAQs();
    }, [activeTab]);

    const fetchFAQs = async () => {
        try {
            const response = await api.get('/settings');
            const data = response.data?.data;
            if (data && data.supportFaqs) {
                setFaqs(data.supportFaqs);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedTicket) {
            scrollToBottom();
        }
    }, [selectedTicket?.responses]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'customer' ? '/support/admin/tickets' : '/tickets';

            let params = {};
            if (['receptionist', 'stylist', 'manager'].includes(userRole)) {
                const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
                if (userOutletId) {
                    params.outletId = userOutletId;
                }
            }

            const response = await api.get(endpoint, { params });
            if (response.data.success) {
                setTickets(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
        const resolved = tickets.filter(t => t.status === 'resolved').length;
        return [
            { 
                label: 'Total Tickets', value: total, subtitle: 'All time tickets raised', icon: Ticket, 
                iconColorClass: '!text-[#F59E0B] dark:!text-[#FBBF24]',
                iconBgClass: '!bg-[#FEF3C7] dark:!bg-[#F59E0B]/20',
                cardBgClass: '!bg-[#FFFBEB] dark:!bg-[#F59E0B]/5',
                cardBorderClass: '!border-[#FEF3C7] dark:!border-[#F59E0B]/15 hover:!border-[#FCD34D] dark:hover:!border-[#FBBF24]/50',
            },
            { 
                label: 'Active Issues', value: open, subtitle: 'Currently open', icon: Bell, 
                iconColorClass: '!text-[#A855F7] dark:!text-[#C084FC]',
                iconBgClass: '!bg-[#F3E8FF] dark:!bg-[#A855F7]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#A855F7]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#A855F7]/15 hover:!border-[#D8B4FE] dark:hover:!border-[#C084FC]/50',
            },
            { 
                label: 'Resolved', value: resolved, subtitle: 'Successfully resolved', icon: CheckCircle, 
                iconColorClass: '!text-[#10B981] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#10B981]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#10B981]/5',
                cardBorderClass: '!border-[#D1FAE5] dark:!border-[#10B981]/15 hover:!border-[#6EE7B7] dark:hover:!border-[#34D399]/50',
            },
            { 
                label: 'Avg. Help Time', value: '< 4hrs', subtitle: 'Average response time', icon: Clock, 
                iconColorClass: '!text-[#3B82F6] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#3B82F6]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#3B82F6]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#3B82F6]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
            },
        ];
    }, [tickets]);

    const filtered = useMemo(() => {
        return tickets.filter(t => {
            const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || (t._id && t._id.toLowerCase().includes(search.toLowerCase()));
            const matchStatus = filterStatus === 'All' || t.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [tickets, search, filterStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (['receptionist', 'stylist', 'manager'].includes(userRole)) {
                const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
                if (userOutletId) {
                    payload.outletId = userOutletId;
                }
            }
            const response = await api.post('/tickets', payload);
            if (response.data.success) {
                setTickets([response.data.data, ...tickets]);
                setShowModal(false);
                setForm({ subject: '', category: 'General Inquiry', description: '' });
            }
        } catch (error) {
            console.error('Failed to create ticket:', error);
            const msg = error.response?.data?.message || error.message;
            alert(`Failed to create ticket: ${msg}`);
        }
    };

    const handleSelectTicket = async (id) => {
        try {
            setLoadingDetail(true);
            setSelectedTicket({ _id: id }); // Show drawer immediately with loading state
            const response = await api.get(`/tickets/${id}`);
            if (response.data.success) {
                setSelectedTicket(response.data.data);
            }
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
                // Refresh list in background
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
                if (selectedTicket?._id === id) {
                    setSelectedTicket(response.data.data);
                }
                showToast(`Ticket status updated to ${status.toUpperCase()}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Failed to update status');
        }
    };

    const handleEscalate = async (id) => {
        try {
            const response = await api.patch(`/support/tickets/${id}/escalate`);
            if (response.data.success) {
                setTickets(tickets.map(t => t._id === id ? response.data.data : t));
                showToast('Ticket escalated to Super Admin');
            }
        } catch (err) {
            showToast('Escalation failed');
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text tracking-tight leading-none">Support & Help</h1>
                    <p className="text-[11px] font-medium text-text-muted mt-1 uppercase tracking-wider">
                        Manage your customer issues and platform requests
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-border rounded-lg overflow-hidden mr-2 shadow-sm">
                        <button
                            onClick={() => setActiveTab('customer')}
                            className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'customer' ? 'bg-[#B58E29] text-white' : 'bg-transparent text-text hover:bg-gray-50'}`}
                        >
                            Customer Issues
                        </button>
                        <button
                            onClick={() => setActiveTab('platform')}
                            className={`px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === 'platform' ? 'bg-[#B58E29] text-white' : 'bg-transparent text-text hover:bg-gray-50'}`}
                        >
                            Platform Help
                        </button>
                    </div>
                    {activeTab === 'platform' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-text text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-lg hover:bg-primary hover:text-white transition-all rounded-xl"
                        >
                            <Plus className="w-4 h-4" style={{ color: '#ffffff' }} /> New Support Request
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${stat.cardBgClass} ${stat.cardBorderClass}`}
                    >
                        <div className="flex !items-start gap-3 !text-left">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${stat.iconBgClass}`} style={{ borderRadius: '12px' }}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColorClass}`} strokeWidth={2} />
                            </div>

                            <div className="flex flex-col !items-start !text-left">
                                <span
                                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}
                                    className="uppercase text-slate-500 dark:text-slate-455 leading-none mb-1.5 !text-left"
                                >
                                    {stat.label}
                                </span>
                                <h3
                                    style={{ fontSize: '24px', fontWeight: 850 }}
                                    className="text-slate-800 dark:text-slate-55 leading-none tracking-tight !text-left flex items-baseline"
                                >
                                    {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                                </h3>
                                <span
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                >
                                    {stat.subtitle}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets Table */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className={`relative flex-1 bg-white border transition-all duration-300 rounded-xl ${isSearchFocused ? 'border-[#B58E29] shadow-[0_0_15px_rgba(181,142,41,0.25)] ring-1 ring-[#B58E29]/50' : 'border-border shadow-sm'}`}>
                            <Search
                                className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary' : ''}`}
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="Search by subject or request number..."
                                className="w-full pl-11 pr-4 py-3.5 bg-transparent text-[13px] font-medium outline-none rounded-xl"
                            />
                        </div>
                        <div
                            ref={filterRef}
                            className={`relative flex items-center px-5 bg-white border transition-all duration-300 rounded-xl cursor-pointer hover:bg-gray-50 ${isFilterOpen ? 'border-[#B58E29] ring-1 ring-[#B58E29]/50 shadow-[0_0_15px_rgba(181,142,41,0.15)]' : 'border-border shadow-sm'}`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter
                                className={`w-4 h-4 mr-2 transition-colors ${isFilterOpen ? 'text-primary' : ''}`}
                            />
                            <div className="text-[12px] font-bold uppercase tracking-wider py-3.5 pr-8 min-w-[120px] select-none text-text">
                                {filterStatus === 'All' ? 'ALL STATUS' : filterStatus}
                            </div>
                            <ChevronDown
                                className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            />

                            {/* Custom Dropdown Menu */}
                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 w-full mt-2 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1"
                                    >
                                        {[
                                            { value: 'All', label: 'ALL' },
                                            { value: 'pending', label: 'PENDING' },
                                            { value: 'in-progress', label: 'IN PROGRESS' },
                                            { value: 'resolved', label: 'RESOLVED' },
                                            { value: 'closed', label: 'CLOSED' },
                                            { value: 'escalated', label: 'ESCALATED' }
                                        ].map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${filterStatus === opt.value ? 'bg-primary/10 dark:bg-primary/20 text-[#B4912B]' : 'text-text-muted hover:bg-slate-50 dark:hover:bg-white/5'}`}
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

                    <div className="bg-white border border-border shadow-sm overflow-hidden min-h-[400px] rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                                <colgroup>
                                    <col style={{ width: '40%' }} />
                                    <col style={{ width: '25%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '15%' }} />
                                </colgroup>
                                <thead>
                                    <tr className="bg-surface border-b border-border">
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">ID & Subject</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-30">
                                                    <MessageSquare className="w-12 h-12 text-text-muted mb-4" />
                                                    <p className="text-[12px] font-bold uppercase tracking-wider">No support requests found at this time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((t) => {
                                            const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                                            return (
                                                <tr
                                                    key={t._id}
                                                    className="hover:bg-primary/[0.02] transition-colors group"
                                                >
                                                    <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="text-[12px] font-bold text-text tracking-tight uppercase">#{t._id?.slice(-6) || '1AD301'}</div>
                                                            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(t._id); showToast('Copied to clipboard'); }} className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                            {['admin', 'manager'].includes(user?.role) && t.userId && (
                                                                <div className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter ml-2">
                                                                    {t.userId.name} ({t.userId.role})
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted mt-0.5">ID</div>
                                                        <div className="text-[11px] font-medium text-text mt-0.5">{new Date(t.createdAt).toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full ${CATEGORY_STYLES[t.category] || CATEGORY_STYLES['General Inquiry']}`}>
                                                            <div className="w-2 h-2 rounded-full bg-current opacity-70"></div>
                                                            {t.category}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                        {['admin', 'manager', 'superadmin'].includes(userRole) ? (
                                                            <div className="status-dropdown-container inline-block">
                                                                <button
                                                                    ref={el => statusBtnRefs.current[t._id] = el}
                                                                    onClick={() => {
                                                                        if (openStatusDropdownId === t._id) {
                                                                            setOpenStatusDropdownId(null);
                                                                        } else {
                                                                            const rect = statusBtnRefs.current[t._id]?.getBoundingClientRect();
                                                                            if (rect) {
                                                                                setDropdownPos({
                                                                                    top: rect.bottom + window.scrollY + 6,
                                                                                    left: rect.left + window.scrollX,
                                                                                    width: Math.max(rect.width, 160),
                                                                                });
                                                                            }
                                                                            setOpenStatusDropdownId(t._id);
                                                                        }
                                                                    }}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full outline-none cursor-pointer bg-surface ${stStyle.text} ${stStyle.border} transition-all hover:brightness-95 dark:hover:brightness-110`}
                                                                >
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
                                                                                { value: 'pending', label: 'PENDING', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
                                                                                { value: 'in-progress', label: 'IN PROGRESS', color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-400' },
                                                                                { value: 'resolved', label: 'RESOLVED', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
                                                                                { value: 'closed', label: 'CLOSED', color: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
                                                                                { value: 'escalated', label: 'ESCALATED', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-400' }
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
                                                        ) : (
                                                            <span className={`inline-flex items-center px-3 py-1.5 text-[10px] font-bold border uppercase tracking-wider rounded-full bg-surface ${stStyle.text} ${stStyle.border}`}>
                                                                {stStyle.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center gap-4">
                                                            <button
                                                                onClick={() => handleSelectTicket(t._id)}
                                                                className="p-1 rounded-full transition-transform hover:scale-110"
                                                                style={{ background: 'transparent', border: 'none', boxShadow: 'none', color: '#3b82f6' }}
                                                                title="View Details"
                                                            >
                                                                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(t._id);
                                                                    showToast('Copied to clipboard');
                                                                }}
                                                                className="p-1 rounded-full transition-transform hover:scale-110"
                                                                style={{ background: 'transparent', border: 'none', boxShadow: 'none', color: '#f59e0b' }}
                                                                title="Copy ID"
                                                            >
                                                                <Copy className="w-4 h-4" strokeWidth={2.5} />
                                                            </button>
                                                            {['admin', 'manager', 'superadmin'].includes(userRole) && t.status !== 'resolved' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(t._id, 'resolved')}
                                                                    className="p-1 rounded-full transition-transform hover:scale-110"
                                                                    style={{ background: 'transparent', border: 'none', boxShadow: 'none', color: '#10b981' }}
                                                                    title="Mark Resolved"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                                                                </button>
                                                            )}
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
                </div>

                {/* Right Panel: FAQ & Contact */}
                <div className="space-y-6">
                    <div className="bg-white border border-border p-6 space-y-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                    <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h2 className="text-[14px] font-bold text-text">Common Questions</h2>
                            </div>
                            <a href="#" className="text-[12px] font-bold text-amber-600 hover:text-amber-700 transition-colors">View all</a>
                        </div>
                        <div className="space-y-4">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="group cursor-help border border-border p-4 rounded-xl flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <ChevronDown className="w-4 h-4 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-bold text-text transition-colors">
                                                New Question?
                                            </p>
                                            <p className="text-[12px] text-text-muted mt-1 leading-relaxed">Answer goes here... {i === 0 ? '#gffrtffffff#jkjkrt;kjv' : 'n.b'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Headphones className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-text">Need Direct Help?</h3>
                                <p className="text-[12px] text-text-muted mt-1 leading-relaxed">Our support team is available 24/7 to resolve any issues you're facing.</p>
                            </div>
                        </div>
                        <div className="pt-2 flex flex-col gap-3">
                            <div className="flex items-center justify-between text-[12px] font-bold text-text p-3 border border-border rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="text-blue-500 dark:text-blue-400"><MessageSquare className="w-4 h-4" /></div>
                                    support@wapixo.com
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText('support@wapixo.com'); showToast('Email copied!'); }} className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 transition-colors">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] font-bold text-text p-3 border border-border rounded-xl shadow-sm">
                                <div className="text-purple-500 dark:text-purple-400"><Clock className="w-4 h-4" /></div>
                                Avg. Response: 4h
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Banner */}
            <div className="bg-surface border border-border rounded-2xl p-6 mt-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-[#B4912B]/10 flex items-center justify-center shrink-0">
                        <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[16px] font-bold text-text">We're here to help!</h3>
                        <p className="text-[13px] text-text-muted mt-1">Your satisfaction is our priority. Reach out anytime.</p>
                    </div>
                </div>
                {/* Placeholder for 3D graphic */}
                <div className="relative z-10 hidden sm:flex items-center justify-center mr-8">
                    <div className="w-24 h-24 relative flex items-center justify-center">
                        {/* Simulate the graphic with emojis or placeholder */}
                        <span className="text-6xl">🎧</span>
                        <span className="absolute -top-2 -right-4 text-3xl">💬</span>
                        <span className="absolute bottom-0 -right-2 text-2xl">😊</span>
                    </div>
                </div>
            </div>

            {/* Chat Detail Drawer */}
            {selectedTicket && createPortal(
                <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity pointer-events-auto cursor-pointer"
                        onClick={() => setSelectedTicket(null)}
                    />
                    <div className={`absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-border transition-transform pointer-events-auto flex flex-col translate-x-0 ${selectedTicket ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
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
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {['admin', 'manager', 'superadmin'].includes(userRole) && (
                                    <div className="flex items-center gap-2 pr-4 border-r border-border mr-2">
                                        {selectedTicket.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'resolved')}
                                                className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                        {selectedTicket.status !== 'closed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'closed')}
                                                className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all"
                                            >
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

                        {/* Content & Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-surface/10 scroll-smooth">
                            {loadingDetail ? (
                                <div className="flex flex-col items-center justify-center h-40 opacity-50 space-y-3">
                                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Updating status and messages...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Ticket Description */}
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <UserIcon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-2 max-w-[85%]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-text">{selectedTicket.userId?.name}</span>
                                                <span className="text-[9px] font-medium text-text-muted">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                                                {selectedTicket.description}
                                            </div>
                                            <div className="text-[9px] font-bold text-primary uppercase tracking-widest">{selectedTicket.category.toUpperCase()} REQUEST</div>
                                        </div>
                                    </div>

                                    {/* Conversation Responses */}
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
                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed ${isMe
                                                            ? 'bg-text text-white rounded-tr-none'
                                                            : 'bg-white border border-border text-text-secondary rounded-tl-none'
                                                            }`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {selectedTicket.responses?.length === 0 && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-bold uppercase tracking-wider mx-auto">
                                                <Clock className="w-3.5 h-3.5" /> Awaiting reply
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Input Area */}
                        {(selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved') ? (
                            <div className="p-6 border-t border-border bg-white">
                                <form onSubmit={handleSendReply} className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Type your message..."
                                            className="w-full pl-4 pr-12 py-3 bg-surface border border-border focus:border-primary text-[13px] font-medium outline-none transition-all rounded-xl min-h-[50px] max-h-[150px] resize-none"
                                            rows="1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply(e);
                                                }
                                            }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                            <div className="text-[8px] font-bold bg-text text-white px-1 py-0.5 rounded uppercase">Enter</div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!reply.trim() || sending}
                                        className="w-12 h-12 bg-text text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                                <p className="text-[9px] font-medium text-text-muted mt-3 italic text-center">
                                    By sending, you agree to our Support Guidelines & Response Policies.
                                </p>
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

            {/* Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-card text-card-foreground w-full max-w-md p-8 shadow-2xl relative border border-border overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-5 mb-8 pb-5 border-b border-border">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#B58E29]/10 dark:bg-[#B58E29]/20">
                                <LifeBuoy className="w-7 h-7 text-[#B58E29]" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-card-foreground leading-none">New Support Request</h2>
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
                                    {['admin', 'superadmin', 'manager'].includes(user?.role?.toLowerCase())
                                        ? 'Send a message to our support team'
                                        : 'Send a message to your manager'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                                className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl overflow-hidden shadow-xl"
                                                style={{ zIndex: 10000 }}
                                            >
                                                {CATEGORIES.map(c => (
                                                    <div
                                                        key={c}
                                                        onClick={() => { setForm({ ...form, category: c }); setIsCategoryOpen(false); }}
                                                        className={`px-4 py-3 text-[13px] font-medium cursor-pointer transition-colors flex items-center justify-between
                                                            ${form.category === c
                                                                ? 'bg-[#B58E29]/10 text-[#B58E29] font-bold'
                                                                : 'text-card-foreground hover:bg-accent'}`}
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
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Detailed Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-medium outline-none focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30 rounded-xl resize-none h-28 transition-all placeholder:text-muted-foreground/60"
                                    placeholder="Explain your problem or request in detail..."
                                />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-border mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent rounded-xl transition-colors border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 shadow-lg flex items-center justify-center gap-2 rounded-xl transition-all active:scale-95 bg-[#1e293b] hover:bg-[#2d3f57] dark:bg-[#B58E29] dark:hover:bg-[#a07d24]"
                                >
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-white">Submit Request</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl shadow-2xl border border-white/10 dark:border-black/10"
                    >
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white dark:text-slate-900">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
