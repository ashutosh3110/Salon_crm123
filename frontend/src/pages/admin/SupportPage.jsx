import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Search as SearchIcon, LifeBuoy, MessageSquare,
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

const CATEGORY_BADGE_STYLES = {
    'Billing':           { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
    'Technical Issue':   { bg: '#fff5f5', text: '#e53e3e', border: '#fed7d7' },
    'Feature Request':   { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    'General Inquiry':   { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    'Account Access':    { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    'Service Complaint': { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' },
    'Appointment Issue': { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' },
    'Bug Report':        { bg: '#fff5f5', text: '#e53e3e', border: '#fed7d7' },
    'Payment Issue':     { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
    'Printer Issue':     { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' },
    'Network/System Issue': { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' },
    'Access / Permission':  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    'Other':             { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
};

const PRIORITY_BADGE_STYLES = {
    'low': { backgroundColor: '#f1f5f9', textColor: '#475569', borderColor: '#cbd5e1', label: 'Low' },
    'medium': { backgroundColor: '#eff6ff', textColor: '#2563eb', borderColor: '#bfdbfe', label: 'Medium' },
    'high': { backgroundColor: '#fff7ed', textColor: '#ea580c', borderColor: '#ffedd5', label: 'High' },
    'urgent': { backgroundColor: '#fff1f2', textColor: '#e11d48', borderColor: '#fecdd3', label: 'Urgent' }
};

const STATUS_BADGE_STYLES = {
    'open':        { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Open' },
    'pending':     { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Open' },
    'in-progress': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd', label: 'In Progress' },
    'resolved':    { bg: '#f0fdf4', text: '#047857', border: '#bbf7d0', label: 'Resolved' },
    'closed':      { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: 'Closed' },
    'escalated':   { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', label: 'Escalated' },
};

const CATEGORY_BADGE_STYLES_DARK = {
    'Billing':           { bg: 'rgba(124, 58, 237, 0.15)', text: '#a78bfa', border: 'rgba(124, 58, 237, 0.3)' },
    'Technical Issue':   { bg: 'rgba(229, 62, 62, 0.15)', text: '#fca5a5', border: 'rgba(229, 62, 62, 0.3)' },
    'Feature Request':   { bg: 'rgba(37, 99, 235, 0.15)', text: '#93c5fd', border: 'rgba(37, 99, 235, 0.3)' },
    'General Inquiry':   { bg: 'rgba(71, 85, 105, 0.15)', text: '#cbd5e1', border: 'rgba(71, 85, 105, 0.3)' },
    'Account Access':    { bg: 'rgba(217, 119, 6, 0.15)', text: '#fcd34d', border: 'rgba(217, 119, 6, 0.3)' },
    'Service Complaint': { bg: 'rgba(220, 38, 38, 0.15)', text: '#fca5a5', border: 'rgba(220, 38, 38, 0.3)' },
    'Appointment Issue': { bg: 'rgba(13, 148, 136, 0.15)', text: '#5eead4', border: 'rgba(13, 148, 136, 0.3)' },
    'Bug Report':        { bg: 'rgba(229, 62, 62, 0.15)', text: '#fca5a5', border: 'rgba(229, 62, 62, 0.3)' },
    'Payment Issue':     { bg: 'rgba(124, 58, 237, 0.15)', text: '#a78bfa', border: 'rgba(124, 58, 237, 0.3)' },
    'Printer Issue':     { bg: 'rgba(234, 88, 12, 0.15)', text: '#fdba74', border: 'rgba(234, 88, 12, 0.3)' },
    'Network/System Issue': { bg: 'rgba(2, 132, 199, 0.15)', text: '#7dd3fc', border: 'rgba(2, 132, 199, 0.3)' },
    'Access / Permission':  { bg: 'rgba(217, 119, 6, 0.15)', text: '#fcd34d', border: 'rgba(217, 119, 6, 0.3)' },
    'Other':             { bg: 'rgba(71, 85, 105, 0.15)', text: '#cbd5e1', border: 'rgba(71, 85, 105, 0.3)' },
};

const PRIORITY_BADGE_STYLES_DARK = {
    'low': { backgroundColor: 'rgba(71, 85, 105, 0.15)', textColor: '#cbd5e1', borderColor: 'rgba(71, 85, 105, 0.3)', label: 'Low' },
    'medium': { backgroundColor: 'rgba(37, 99, 235, 0.15)', textColor: '#93c5fd', borderColor: 'rgba(37, 99, 235, 0.3)', label: 'Medium' },
    'high': { backgroundColor: 'rgba(234, 88, 12, 0.15)', textColor: '#fdba74', borderColor: 'rgba(234, 88, 12, 0.3)', label: 'High' },
    'urgent': { backgroundColor: 'rgba(225, 29, 72, 0.15)', textColor: '#fda4af', borderColor: 'rgba(225, 29, 72, 0.3)', label: 'Urgent' }
};

const STATUS_BADGE_STYLES_DARK = {
    'open':        { bg: 'rgba(217, 119, 6, 0.15)', text: '#fcd34d', border: 'rgba(217, 119, 6, 0.3)', label: 'Open' },
    'pending':     { bg: 'rgba(217, 119, 6, 0.15)', text: '#fcd34d', border: 'rgba(217, 119, 6, 0.3)', label: 'Open' },
    'in-progress': { bg: 'rgba(3, 105, 161, 0.15)', text: '#7dd3fc', border: 'rgba(3, 105, 161, 0.3)', label: 'In Progress' },
    'resolved':    { bg: 'rgba(4, 120, 87, 0.15)', text: '#6ee7b7', border: 'rgba(4, 120, 87, 0.3)', label: 'Resolved' },
    'closed':      { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.3)', label: 'Closed' },
    'escalated':   { bg: 'rgba(190, 18, 60, 0.15)', text: '#fda4af', border: 'rgba(190, 18, 60, 0.3)', label: 'Escalated' },
};

const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isDark;
};

/* ─── Main Page ───────────────────────────────────────────────────────── */

export default function SupportPage() {
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase();
    const isDark = useDarkMode();

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
        <div className="space-y-8 animate-reveal text-left max-w-[1600px] mx-auto pb-20 font-sans px-4">

            {/* ── Header Hero Section ──────────────────────────────── */}
            <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] dark:from-[#1e293b] dark:to-[#334155] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 text-slate-800 dark:text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B58E29]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="text-left relative z-10">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800 dark:text-white">
                        <Headphones className="w-8 h-8 text-[#B58E29]" /> Support & Help
                    </h1>
                    <p className="text-slate-500 dark:text-slate-300 mt-2 text-sm max-w-xl font-medium">
                        {activeTab === 'customer'
                            ? 'Manage customer support requests raised via your website, app, chat, or WhatsApp.'
                            : 'Monitor internal platform tickets, system reports, and printer errors raised by outlet staff.'}
                    </p>
                </div>
                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    {/* Tab Toggle */}
                    <div className="flex items-center bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-1">
                        <button
                            onClick={() => setActiveTab('customer')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-xl ${activeTab === 'customer' ? 'bg-[#B58E29] text-white shadow-md' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <Headphones className="w-3.5 h-3.5" />
                            Customer Issues
                        </button>
                        <button
                            onClick={() => setActiveTab('platform')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all rounded-xl ${activeTab === 'platform' ? 'bg-[#B58E29] text-white shadow-md' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            Platform Help
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating New Request Button — only for platform tab */}
            {activeTab === 'platform' && (
                <button
                    onClick={() => setShowModal(true)}
                    className="fixed bottom-8 right-8 rounded-full w-14 h-14 bg-[#B58E29] hover:bg-[#a07c22] shadow-[0_8px_30px_rgb(181,142,41,0.4)] hover:scale-110 flex items-center justify-center text-white transition-all z-50 group hover:-translate-y-1"
                    title="Create Platform Ticket"
                >
                    <Plus className="w-6 h-6 text-white transition-transform group-hover:rotate-90" strokeWidth={3} />
                </button>
            )}


            {/* ── Stats Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={`${activeTab}-${stat.label}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between min-h-[128px] overflow-hidden border border-slate-100"
                    >
                        {/* Colored Top Strip */}
                        <div className={`h-1 rounded-t-3xl ${
                            i === 0 ? 'bg-amber-500' :
                            i === 1 ? 'bg-purple-500' :
                            i === 2 ? 'bg-emerald-500' :
                            'bg-blue-500'
                        }`} />

                        <div className="flex-1 p-5 flex items-start gap-4 text-left">
                            <div className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-2xl ${stat.iconBgClass}`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColorClass}`} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">{stat.label}</span>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1">
                                    {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} /> : stat.value}
                                </h3>
                                <span className="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider">{stat.subtitle}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Filter & Card Section ───────────────────────────── */}
            <div className="space-y-6">
                {/* Search + Filter Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder={activeTab === 'customer' ? 'Search customer name, subject or ticket ID...' : 'Search subject, staff name or ticket ID...'}
                            className="w-full h-14 pl-14 pr-4 bg-white dark:bg-slate-800 shadow-md border border-slate-200/60 dark:border-slate-700/60 focus:ring-2 focus:ring-[#B58E29] rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-400 dark:text-slate-200"
                        />
                        <SearchIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 z-10 pointer-events-none transition-colors ${isSearchFocused ? 'text-[#B58E29]' : 'text-slate-400'}`} />
                    </div>
                    <div ref={filterRef} className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="h-14 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-2xl shadow-md flex items-center gap-3 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                            <Filter className="w-4 h-4 text-[#B58E29]" />
                            <span className="text-slate-800 dark:text-slate-100 font-bold">{filterStatus === 'All' ? 'ALL STATUS' : filterStatus.replace('-', ' ').toUpperCase()}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.13 }}
                                    className="absolute top-full right-0 w-56 mt-2 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden py-1.5"
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
                                            className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${filterStatus === opt.value ? 'bg-[#B58E29]/10 text-[#B58E29]' : 'text-slate-600 hover:bg-slate-50'}`}
                                            onClick={() => {
                                                setFilterStatus(opt.value);
                                                setIsFilterOpen(false);
                                            }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Card Container Grid */}
                <div className="bg-slate-50/50 shadow-inner overflow-hidden min-h-[250px] rounded-3xl border border-slate-100/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40 space-y-3">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">Loading tickets...</p>
                        </div>
                    ) : activeTab === 'customer' ? (
                        <CustomerCards
                            tickets={filtered}
                            userRole={userRole}
                            openStatusDropdownId={openStatusDropdownId}
                            setOpenStatusDropdownId={setOpenStatusDropdownId}
                            statusBtnRefs={statusBtnRefs}
                            dropdownPos={dropdownPos}
                            setDropdownPos={setDropdownPos}
                            handleSelectTicket={handleSelectTicket}
                            handleUpdateStatus={handleUpdateStatus}
                            isDark={isDark}
                        />
                    ) : (
                        <PlatformCards
                            tickets={filtered}
                            userRole={userRole}
                            openStatusDropdownId={openStatusDropdownId}
                            setOpenStatusDropdownId={setOpenStatusDropdownId}
                            statusBtnRefs={statusBtnRefs}
                            dropdownPos={dropdownPos}
                            setDropdownPos={setDropdownPos}
                            handleSelectTicket={handleSelectTicket}
                            handleUpdateStatus={handleUpdateStatus}
                            isDark={isDark}
                        />
                    )}
                </div>
            </div>

            {/* ── Bottom Banner ────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] dark:from-[#1e293b] dark:to-[#334155] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 text-slate-800 dark:text-white shadow-md flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#B58E29]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-5 relative z-10 text-left">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                        <Shield className="w-8 h-8 text-[#B58E29]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                            {activeTab === 'customer' ? "Need support assistance?" : 'Report a Platform Issue'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-2 max-w-xl leading-relaxed font-medium">
                            {activeTab === 'customer'
                                ? 'We maintain a premium standard of customer support. Raise, monitor and resolve issues promptly.'
                                : 'Found a bug or facing a technical problem? Create a ticket for the administrator team.'}
                        </p>
                    </div>
                </div>
                <div className="relative z-10 hidden md:block mr-4 shrink-0">
                    <Shield className="w-20 h-20 text-[#B58E29] opacity-80" />
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
                                <div className="text-left">
                                    <h2 className="text-[14px] font-bold text-text leading-tight">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="text-[10px] font-bold text-primary uppercase">#{selectedTicket._id?.slice(-6)}</div>
                                        <div className={`px-2 py-0.5 text-[8px] font-black border uppercase rounded-full ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).bg} ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).text} ${(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).border}`}>
                                            {(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.pending).label}
                                        </div>
                                        {selectedTicket.priority && (
                                            <div className={`px-2 py-0.5 text-[8px] font-black border uppercase rounded-full ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).bg} ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).text} ${(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.medium).border}`}>
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
                                    <div className="flex gap-4 text-left">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
                                            <UserIcon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="space-y-2 max-w-[85%]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-text">
                                                    {selectedTicket.customerId?.name || selectedTicket.userId?.name || 'Unknown'}
                                                </span>
                                                <span className="text-[9px] font-medium text-text-muted">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-md text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                                                {selectedTicket.description}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full uppercase ${CATEGORY_STYLES[selectedTicket.category] || CATEGORY_STYLES['General Inquiry']}`}>
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
                                                <div key={i} className={`flex gap-3 text-left ${isMe ? 'flex-row-reverse' : ''}`}>
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
                                                        <div className={`px-4 py-3 rounded-2xl shadow-md text-[13px] font-medium leading-relaxed ${isMe ? 'bg-text text-white rounded-tr-none' : 'bg-white border border-slate-150 text-text-secondary rounded-tl-none'}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {selectedTicket.responses?.length === 0 && (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                                <Clock className="w-3.5 h-3.5" /> Awaiting response
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
                    <div className="bg-card text-card-foreground w-full max-w-md p-8 shadow-2xl relative border border-border overflow-hidden rounded-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
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
                                        className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-bold outline-none rounded-xl flex items-center justify-between cursor-pointer"
                                    >
                                        <span>{form.category}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isCategoryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.13 }}
                                                className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#243044] border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1.5 max-h-48 overflow-y-auto"
                                            >
                                                {categories.map(cat => (
                                                    <div
                                                        key={cat}
                                                        className={`px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${form.category === cat ? 'bg-[#B58E29]/15 text-[#B58E29]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        onClick={() => {
                                                            setForm({ ...form, category: cat });
                                                            setIsCategoryOpen(false);
                                                        }}
                                                    >
                                                        {cat}
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
                                        className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-bold outline-none rounded-xl flex items-center justify-between cursor-pointer"
                                    >
                                        <span className="uppercase">{form.priority}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isPriorityOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.13 }}
                                                className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#243044] border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1.5"
                                            >
                                                {PRIORITIES.map(pri => (
                                                    <div
                                                        key={pri}
                                                        className={`px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${form.priority === pri ? 'bg-[#B58E29]/15 text-[#B58E29]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        onClick={() => {
                                                            setForm({ ...form, priority: pri });
                                                            setIsPriorityOpen(false);
                                                        }}
                                                    >
                                                        {pri}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3 bg-white dark:bg-[#243044] border border-border text-card-foreground text-[13px] font-medium outline-none focus:border-[#B58E29] focus:ring-1 focus:ring-[#B58E29]/30 rounded-xl transition-all placeholder:text-muted-foreground/60 resize-none"
                                    placeholder="Explain the problem in detail so the technical team can investigate..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3.5 border border-border text-card-foreground text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                                >
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
   CUSTOMER ISSUES CARDS (Premium Grid Layout)
────────────────────────────────────────────────────────────────────── */
function CustomerCards({ tickets, userRole, openStatusDropdownId, setOpenStatusDropdownId, statusBtnRefs, dropdownPos, setDropdownPos, handleSelectTicket, handleUpdateStatus, isDark }) {
    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 opacity-30 space-y-3">
                <Headphones className="w-12 h-12 text-text-muted" />
                <p className="text-[13px] font-bold text-text-muted">No customer support requests found.</p>
                <p className="text-[11px] text-text-muted">Customer tickets from website, app, chat or WhatsApp will appear here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {tickets.map(t => {
                const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                const prStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium;
                const borderColors = {
                    low: 'border-t-slate-400',
                    medium: 'border-t-blue-500',
                    high: 'border-t-orange-500',
                    urgent: 'border-t-rose-600'
                };
                const borderColorClass = borderColors[t.priority] || 'border-t-blue-500';

                return (
                    <div 
                        key={t._id} 
                        className={`h-full bg-white dark:bg-[#1e2433] rounded-3xl border-x border-b border-slate-150 dark:border-slate-800 border-t-4 ${borderColorClass} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group text-left`}
                    >
                        {/* Upper Header */}
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <UserIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-black text-text truncate max-w-[120px]">
                                            {t.customerId?.name || 'Unknown Customer'}
                                        </div>
                                        {t.customerId?.phone && (
                                            <div className="text-[10px] text-text-muted mt-0.5">{t.customerId.phone}</div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    #{t._id?.slice(-6)}
                                </span>
                            </div>

                            {/* Subject */}
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                    {t.subject}
                                </h4>
                                <p className="text-[11px] text-text-muted line-clamp-2 mt-1 font-medium">
                                    {t.description}
                                </p>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {(() => {
                                    const catStyle = isDark 
                                        ? (CATEGORY_BADGE_STYLES_DARK[t.category] || CATEGORY_BADGE_STYLES_DARK['General Inquiry'])
                                        : (CATEGORY_BADGE_STYLES[t.category] || CATEGORY_BADGE_STYLES['General Inquiry']);
                                    return (
                                        <span 
                                            style={{ backgroundColor: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                        >
                                            {t.category}
                                        </span>
                                    );
                                })()}
                                {(() => {
                                    const priStyle = isDark
                                        ? (PRIORITY_BADGE_STYLES_DARK[t.priority] || PRIORITY_BADGE_STYLES_DARK.medium)
                                        : (PRIORITY_BADGE_STYLES[t.priority] || PRIORITY_BADGE_STYLES.medium);
                                    return (
                                        <span 
                                            style={{ backgroundColor: priStyle.backgroundColor, color: priStyle.textColor, borderColor: priStyle.borderColor }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                        >
                                            {priStyle.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div onClick={(e) => e.stopPropagation()}>
                                {['admin', 'manager', 'receptionist', 'superadmin'].includes(userRole) ? (
                                    <StatusDropdown 
                                        t={t} 
                                        stStyle={stStyle} 
                                        openStatusDropdownId={openStatusDropdownId} 
                                        setOpenStatusDropdownId={setOpenStatusDropdownId} 
                                        statusBtnRefs={statusBtnRefs} 
                                        dropdownPos={dropdownPos} 
                                        setDropdownPos={setDropdownPos} 
                                        handleUpdateStatus={handleUpdateStatus} 
                                    />
                                ) : (
                                    (() => {
                                        const sStyle = isDark
                                            ? (STATUS_BADGE_STYLES_DARK[t.status] || STATUS_BADGE_STYLES_DARK.pending)
                                            : (STATUS_BADGE_STYLES[t.status] || STATUS_BADGE_STYLES.pending);
                                        return (
                                            <span 
                                                style={{ backgroundColor: sStyle.bg, color: sStyle.text, borderColor: sStyle.border }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                            >
                                                <span 
                                                    style={{ backgroundColor: sStyle.text }} 
                                                    className="w-1.5 h-1.5 rounded-full"
                                                ></span>
                                                {stStyle.label}
                                            </span>
                                        );
                                    })()
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-text-muted font-bold">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={() => handleSelectTicket(t._id)} 
                                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-all text-blue-500 hover:scale-105 active:scale-95" 
                                    title="View Details"
                                >
                                    <Eye className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────
   PLATFORM HELP CARDS (Premium Grid Layout)
────────────────────────────────────────────────────────────────────── */
function PlatformCards({ tickets, userRole, openStatusDropdownId, setOpenStatusDropdownId, statusBtnRefs, dropdownPos, setDropdownPos, handleSelectTicket, handleUpdateStatus, isDark }) {
    if (tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 opacity-30 space-y-3">
                <Wrench className="w-12 h-12 text-text-muted" />
                <p className="text-[13px] font-bold text-text-muted">No platform help requests created yet.</p>
                <p className="text-[11px] text-text-muted">Use the "New Request" button to report a bug, payment issue, or platform problem.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {tickets.map(t => {
                const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                const prStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium;
                const borderColors = {
                    low: 'border-t-slate-400',
                    medium: 'border-t-blue-500',
                    high: 'border-t-orange-500',
                    urgent: 'border-t-rose-600'
                };
                const borderColorClass = borderColors[t.priority] || 'border-t-blue-500';

                return (
                    <div 
                        key={t._id} 
                        className={`h-full bg-white dark:bg-[#1e2433] rounded-3xl border-x border-b border-slate-150 dark:border-slate-800 border-t-4 ${borderColorClass} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group text-left`}
                    >
                        {/* Upper Header */}
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <UserIcon className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-black text-text truncate max-w-[120px]">
                                            {t.userId?.name || 'Staff'}
                                        </div>
                                        {t.userId?.role && (
                                            <div className="text-[9px] text-text-muted font-extrabold uppercase mt-0.5">
                                                {t.userId.role}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                                    #{t._id?.slice(-6)}
                                </span>
                            </div>

                            {/* Subject */}
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                    {t.subject}
                                </h4>
                                <p className="text-[11px] text-text-muted line-clamp-2 mt-1 font-medium">
                                    {t.description}
                                </p>
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {(() => {
                                    const catStyle = isDark 
                                        ? (CATEGORY_BADGE_STYLES_DARK[t.category] || CATEGORY_BADGE_STYLES_DARK['Other'])
                                        : (CATEGORY_BADGE_STYLES[t.category] || CATEGORY_BADGE_STYLES['Other']);
                                    return (
                                        <span 
                                            style={{ backgroundColor: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                        >
                                            {t.category}
                                        </span>
                                    );
                                })()}
                                {(() => {
                                    const priStyle = isDark
                                        ? (PRIORITY_BADGE_STYLES_DARK[t.priority] || PRIORITY_BADGE_STYLES_DARK.medium)
                                        : (PRIORITY_BADGE_STYLES[t.priority] || PRIORITY_BADGE_STYLES.medium);
                                    return (
                                        <span 
                                            style={{ backgroundColor: priStyle.backgroundColor, color: priStyle.textColor, borderColor: priStyle.borderColor }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                        >
                                            {priStyle.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div onClick={(e) => e.stopPropagation()}>
                                {['admin', 'manager', 'receptionist', 'superadmin'].includes(userRole) ? (
                                    <StatusDropdown 
                                        t={t} 
                                        stStyle={stStyle} 
                                        openStatusDropdownId={openStatusDropdownId} 
                                        setOpenStatusDropdownId={setOpenStatusDropdownId} 
                                        statusBtnRefs={statusBtnRefs} 
                                        dropdownPos={dropdownPos} 
                                        setDropdownPos={setDropdownPos} 
                                        handleUpdateStatus={handleUpdateStatus} 
                                    />
                                ) : (
                                    (() => {
                                        const sStyle = isDark
                                            ? (STATUS_BADGE_STYLES_DARK[t.status] || STATUS_BADGE_STYLES_DARK.pending)
                                            : (STATUS_BADGE_STYLES[t.status] || STATUS_BADGE_STYLES.pending);
                                        return (
                                            <span 
                                                style={{ backgroundColor: sStyle.bg, color: sStyle.text, borderColor: sStyle.border }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black border uppercase tracking-wider rounded-full"
                                            >
                                                <span 
                                                    style={{ backgroundColor: sStyle.text }} 
                                                    className="w-1.5 h-1.5 rounded-full"
                                                ></span>
                                                {stStyle.label}
                                            </span>
                                        );
                                    })()
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-text-muted font-bold">
                                    {new Date(t.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={() => handleSelectTicket(t._id)} 
                                    className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-all text-blue-500 hover:scale-105 active:scale-95" 
                                    title="View Details"
                                >
                                    <Eye className="w-4 h-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
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
