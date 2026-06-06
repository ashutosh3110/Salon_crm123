import { useState, useEffect, useMemo } from 'react';
import {
    Bug, LogOut, Search, RefreshCw,
    CheckCircle, XCircle, Clock,
    Eye, Download, X, ChevronDown, ChevronUp,
    Shield, Users, Filter, Edit3, Trash2,
    AlertTriangle, Info, MessageSquare, ArrowRight, ArrowUpCircle,
    Plus, Save, FileEdit, HelpCircle
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils';
import api from '../../services/api';

/* ─── Constants ────────────────────────────────────────────────────── */

const STATUS_STYLES = {
    'pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending', accent: 'bg-amber-500' },
    'open': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Open', accent: 'bg-amber-500' },
    'in-progress': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'In Progress', accent: 'bg-sky-500' },
    'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved', accent: 'bg-emerald-500' },
    'closed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed', accent: 'bg-slate-500' },
    'escalated': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Escalated', accent: 'bg-rose-500' },
};

const PRIORITY_STYLES = {
    'low': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
    'medium': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    'high': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
    'urgent': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' }
};

export default function SASupportPage() {
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);
    
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'faqs'

    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(false);
    const [savingFaqs, setSavingFaqs] = useState(false);

    // Filter and Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // FAQ Accordion & Edit States
    const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
    const [editingFaqIndex, setEditingFaqIndex] = useState(null);

    // Create Ticket State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'low',
        status: 'open',
        tenantId: ''
    });

    // Tenants/Salons for ticket switching
    const [salons, setSalons] = useState([]);

    useEffect(() => {
        if (activeTab === 'tickets') {
            fetchTickets();
            fetchSalons();
        }
        if (activeTab === 'faqs') fetchFAQs();
    }, [activeTab]);

    const fetchSalons = async () => {
        try {
            const res = await api.get('/salons');
            if (res.data.success) {
                const data = res.data.data;
                setSalons(Array.isArray(data?.results) ? data.results : []);
            }
        } catch (err) {
            console.error('[Support] Salon fetch failed:', err);
            setSalons([]);
        }
    };

    const fetchFAQs = async () => {
        try {
            setLoadingFaqs(true);
            const response = await api.get('/support/faqs');
            if (response.data.success) {
                setFaqs(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const handleSaveFaq = async (faq, index) => {
        try {
            setSavingFaqs(true);
            let res;
            if (faq._id) {
                res = await api.patch(`/support/faqs/${faq._id}`, faq);
            } else {
                res = await api.post('/support/faqs', faq);
            }
            if (res.data.success) {
                showToast('FAQ saved successfully!');
                setEditingFaqIndex(null);
                fetchFAQs();
            }
        } catch (error) {
            console.error('Failed to save FAQ:', error);
            showToast('Failed to save FAQ', 'error');
        } finally {
            setSavingFaqs(false);
        }
    };

    const addFaq = () => {
        setFaqs([{ question: 'New Question?', answer: 'Answer goes here...', category: 'General', isNew: true }, ...faqs]);
        setExpandedFaqIndex(0);
        setEditingFaqIndex(0);
    };

    const removeFaq = async (faq, index) => {
        if (!faq._id) {
            setFaqs(faqs.filter((_, i) => i !== index));
            setEditingFaqIndex(null);
            return;
        }
        if (!confirm('Delete this FAQ permanently?')) return;
        try {
            setSavingFaqs(true);
            const res = await api.delete(`/support/faqs/${faq._id}`);
            if (res.data.success) {
                showToast('FAQ deleted');
                fetchFAQs();
                setEditingFaqIndex(null);
            }
        } catch (err) {
            showToast('Delete failed', 'error');
        } finally {
            setSavingFaqs(false);
        }
    };

    const updateFaqLocal = (index, field, value) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const response = await api.get('/support/superadmin/tickets');
            if (response.data.success) {
                setTickets(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const response = await api.patch(`/support/tickets/${id}/status`, { status });
            if (response.data.success) {
                setTickets(tickets.map(t => t._id === id ? { ...t, status: response.data.data.status } : t));
                showToast(`Ticket status: ${status.toUpperCase()}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast('Status update failed', 'error');
        }
    };

    const handleDeleteTicket = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this ticket?')) return;
        try {
            const response = await api.delete(`/tickets/${id}`);
            if (response.data.success) {
                setTickets(tickets.filter(t => t._id !== id));
                showToast('Ticket permanently removed');
            }
        } catch (err) {
            showToast('Failed to delete ticket', 'error');
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            return showToast('Subject and description are required', 'error');
        }

        try {
            setCreating(true);
            const res = await api.post('/tickets', newTicket);
            if (res.data.success) {
                showToast('Ticket created successfully');
                setIsCreateModalOpen(false);
                setNewTicket({ subject: '', description: '', priority: 'low', status: 'open', tenantId: '' });
                fetchTickets();
            }
        } catch (err) {
            showToast('Failed to create ticket', 'error');
        } finally {
            setCreating(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Calculate Statistics
    const stats = useMemo(() => {
        const total = tickets.length;
        const pending = tickets.filter(t => t.status === 'pending' || t.status === 'open').length;
        const inProgress = tickets.filter(t => t.status === 'in-progress').length;
        const resolvedClosed = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
        const resolvedPercentage = total > 0 ? Math.round((resolvedClosed / total) * 100) : 0;
        return { total, pending, inProgress, resolvedPercentage };
    }, [tickets]);

    // Filter tickets based on filters and search query
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            // Status Filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'pending') {
                    if (t.status !== 'pending' && t.status !== 'open') return false;
                } else if (statusFilter === 'resolved') {
                    if (t.status !== 'resolved' && t.status !== 'closed') return false;
                } else {
                    if (t.status !== statusFilter) return false;
                }
            }
            // Search Query
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                return (
                    t.subject?.toLowerCase().includes(query) ||
                    t.description?.toLowerCase().includes(query) ||
                    t._id?.toLowerCase().includes(query) ||
                    t.tenantId?.name?.toLowerCase().includes(query) ||
                    t.userId?.name?.toLowerCase().includes(query)
                );
            }
            return true;
        });
    }, [tickets, statusFilter, searchQuery]);

    return (
        <div className="space-y-6 pb-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6">
            
            {/* Toast popup */}
            {toast && (
                <div className="fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/90 border border-white shadow-2xl text-sm font-semibold animate-in slide-in-from-right-4 duration-300">
                    {toast.type === 'error'
                        ? <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                        : <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />}
                    <span className={toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* Header Redesign */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight mt-1">
                        Support Center
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Manage tickets, escalations and FAQs
                    </p>
                </div>
                
                {/* Modern Navigation Tabs */}
                <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur rounded-2xl p-1 border border-slate-200/50">
                    <button 
                        onClick={() => { setActiveTab('tickets'); setExpandedFaqIndex(null); setEditingFaqIndex(null); }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'tickets' ? 'bg-white text-[#B4912B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Salon Tickets
                    </button>
                    <button 
                        onClick={() => { setActiveTab('faqs'); setExpandedFaqIndex(null); setEditingFaqIndex(null); }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === 'faqs' ? 'bg-white text-[#B4912B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Manage FAQs
                    </button>
                </div>
            </div>

            {/* Top Stats Dashboard */}
            {activeTab === 'tickets' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Tickets</p>
                        <h3 className="text-3xl font-black mt-2 text-slate-800">{stats.total}</h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending</p>
                        <h3 className="text-3xl font-black mt-2 text-amber-600">{stats.pending}</h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">In Progress</p>
                        <h3 className="text-3xl font-black mt-2 text-sky-600">{stats.inProgress}</h3>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Resolved %</p>
                        <h3 className="text-3xl font-black mt-2 text-emerald-600">{stats.resolvedPercentage}%</h3>
                    </div>
                </div>
            )}

            {activeTab === 'tickets' ? (
                /* Ticket Section */
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-lg font-black tracking-tight text-slate-800">Support Requests</h2>
                            <p className="text-xs text-slate-500 mt-1">Search, filter, and take actions on tickets</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-sm font-bold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#B4912B]/20"
                            >
                                <Plus className="w-4 h-4 text-white" /> Create Ticket
                            </button>
                            <button onClick={fetchTickets} className="p-2 hover:bg-white rounded-xl border border-slate-200 shadow-sm transition-all text-slate-500 hover:text-[#B4912B]">
                                <RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters Redesign */}
                    <div className="flex flex-col sm:flex-row gap-3 bg-white/50 backdrop-blur rounded-3xl p-3 border border-slate-200/50">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by subject, salon, message or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#B4912B] focus:ring-2 focus:ring-[#B4912B]/10 transition-all placeholder:text-slate-400"
                            />
                        </div>
                        {/* Status Filter buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                            {['all', 'pending', 'in-progress', 'resolved', 'escalated'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === filter ? 'bg-white text-[#B4912B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {filter === 'in-progress' ? 'In Progress' : filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="grid grid-cols-1 gap-4">
                        {loadingTickets ? (
                            <div className="py-20 text-center animate-pulse">
                                <MessageSquare className="w-12 h-12 text-[#B4912B]/20 mx-auto mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching support tickets...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-8 shadow-sm">
                                <MessageSquare className="w-20 h-20 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">Inbox Zero 🎉</h3>
                                <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">No support requests found matching your query at the moment.</p>
                            </div>
                        ) : (
                            filteredTickets.map(t => {
                                const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                                const prStyle = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.low;
                                return (
                                    <div key={t._id} className="group relative bg-white/80 backdrop-blur-xl border border-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        
                                        {/* Left Accent Status Border */}
                                        <div className={`absolute left-0 top-0 h-full w-1.5 ${stStyle.accent}`} />
                                        
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pl-2">
                                            {/* Details (Left side) */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-mono font-bold">
                                                        #{t._id.slice(-6)}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                                        {stStyle.label}
                                                    </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${prStyle.bg} ${prStyle.text} ${prStyle.border}`}>
                                                        {t.priority}
                                                    </span>
                                                    {t.status === 'escalated' && (
                                                        <span className="animate-pulse flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider">
                                                            <ArrowUpCircle className="w-3.5 h-3.5" /> Escalated Priority
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#B4912B] transition-colors">{t.subject}</h3>
                                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{t.description}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                                                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{t.tenantId?.name || 'Platform (Global)'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Users className="w-4 h-4" />
                                                        <span className="text-xs font-semibold">{t.userId?.name || 'Unknown User'} ({t.userId?.role || 'Guest'})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-xs font-mono">{new Date(t.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions (Right side) */}
                                            <div className="flex lg:flex-col items-stretch lg:items-end justify-between gap-3 lg:w-48 shrink-0 bg-slate-50 lg:bg-transparent p-3 lg:p-0 rounded-2xl">
                                                <div className="space-y-1.5 w-full">
                                                    <label className="hidden lg:block text-[10px] text-slate-400 uppercase tracking-widest font-black text-right pr-1">Change Status</label>
                                                    <select 
                                                        value={t.status}
                                                        onChange={(e) => updateStatus(t._id, e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#B4912B] transition-all shadow-sm cursor-pointer"
                                                    >
                                                        {Object.entries(STATUS_STYLES).map(([val, cfg]) => (
                                                            <option key={val} value={val}>{cfg.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2 justify-end w-full">
                                                    {t.status !== 'resolved' && t.status !== 'closed' && (
                                                        <button 
                                                            onClick={() => updateStatus(t._id, 'closed')}
                                                            className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Close
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteTicket(t._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all rounded-xl"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                /* Accordion-Style FAQ Section */
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black tracking-tight text-slate-800">Platform FAQs</h2>
                            <p className="text-xs text-slate-500 mt-1">Manage common questions shown to all salon units</p>
                        </div>
                        <button 
                            onClick={addFaq}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white rounded-xl text-xs font-bold hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#B4912B]/20"
                        >
                            <Plus className="w-4 h-4 text-white" /> Add Question
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loadingFaqs ? (
                            <div className="py-20 text-center animate-pulse">
                                <RefreshCw className="w-12 h-12 text-[#B4912B]/20 mx-auto mb-4 animate-spin" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Updating FAQ list...</p>
                            </div>
                        ) : faqs.length === 0 ? (
                            <div className="py-20 text-center bg-white border border-slate-200 border-dashed rounded-3xl shadow-sm">
                                <HelpCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm text-slate-500">No FAQs found. Click "Add Question" to create one.</p>
                            </div>
                        ) : (
                            faqs.map((faq, i) => {
                                const isExpanded = expandedFaqIndex === i;
                                const isEditing = editingFaqIndex === i;
                                return (
                                    <div key={i} className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 hover:border-[#B4912B]/30 transition-all shadow-sm">
                                        
                                        {/* Question row (Header) */}
                                        <div 
                                            onClick={() => {
                                                if (!isEditing) setExpandedFaqIndex(isExpanded ? null : i);
                                            }}
                                            className="flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                                    {faq.category || 'General'}
                                                </span>
                                                <span className="font-bold text-base text-slate-800 truncate pr-4">
                                                    {faq.question}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                                {!isEditing && (
                                                    <button 
                                                        onClick={() => { setExpandedFaqIndex(i); setEditingFaqIndex(i); }} 
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => removeFaq(faq, i)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                
                                                {!isEditing && (
                                                    <div className="text-slate-400" onClick={() => setExpandedFaqIndex(isExpanded ? null : i)}>
                                                        {isExpanded ? <ChevronUp className="w-5 h-5 cursor-pointer" /> : <ChevronDown className="w-5 h-5 cursor-pointer" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Answer Area */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                {isEditing ? (
                                                    /* Edit Form fields */
                                                    <div className="space-y-4">
                                                        <div className="grid sm:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Title</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={faq.question}
                                                                    onChange={(e) => updateFaqLocal(i, 'question', e.target.value)}
                                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={faq.category}
                                                                    onChange={(e) => updateFaqLocal(i, 'category', e.target.value)}
                                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FAQ Answer</label>
                                                            <textarea 
                                                                value={faq.answer}
                                                                onChange={(e) => updateFaqLocal(i, 'answer', e.target.value)}
                                                                rows="3"
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#B4912B] focus:bg-white outline-none transition-all resize-none"
                                                            />
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => setEditingFaqIndex(null)}
                                                                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={() => handleSaveFaq(faq, i)}
                                                                disabled={savingFaqs}
                                                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                                                            >
                                                                <Save className="w-3.5 h-3.5" /> Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* View-only Answer */
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap pl-1">
                                                        {faq.answer}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Premium Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gradient-to-r from-[#B4912B] to-[#8B6F23] flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Create Support Ticket</h2>
                                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">Submit a platform level issue or query</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ticket Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                    placeholder="e.g., App sync issue"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#B4912B] focus:bg-white outline-none transition-all placeholder:text-slate-400/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Salon (Optional)</label>
                                <select 
                                    value={newTicket.tenantId}
                                    onChange={(e) => setNewTicket({...newTicket, tenantId: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                >
                                    <option value="">Platform Level (Global)</option>
                                    {salons.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
                                    <select 
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Status</label>
                                    <select 
                                        value={newTicket.status}
                                        onChange={(e) => setNewTicket({...newTicket, status: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-[#B4912B] focus:bg-white outline-none transition-all"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="escalated">Escalated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                <textarea 
                                    required
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    rows="4"
                                    placeholder="Describe the issue in detail..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:border-[#B4912B] focus:bg-white outline-none transition-all resize-none placeholder:text-slate-400/50"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] px-6 py-3 bg-gradient-to-r from-[#B4912B] to-[#8B6F23] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#B4912B]/20 transition-all disabled:opacity-50"
                                >
                                    {creating ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
