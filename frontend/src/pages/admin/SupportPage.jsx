import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Plus, Search, LifeBuoy, MessageSquare, 
    CheckCircle, Clock, AlertCircle, ChevronDown,
    Filter, Download, HelpCircle, ArrowRight, ArrowUpCircle,
    X, Send, RefreshCw, User as UserIcon, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/* ─── Constants ───────────────────────────────────────────────────────── */

const CATEGORIES = ['Billing', 'Technical Issue', 'Feature Request', 'General Inquiry', 'Account Access'];
const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

const STATUS_STYLES = {
    'open': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Open' },
    'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress' },
    'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
    'closed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed' },
    'escalated': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Pending Admin' },
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

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchTickets();
        fetchFAQs();
    }, []);

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
            const response = await api.get('/tickets');
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
            { label: 'Total Tickets', value: total, icon: MessageSquare },
            { label: 'Active Issues', value: open, icon: Clock },
            { label: 'Resolved', value: resolved, icon: CheckCircle },
            { label: 'Avg. Help Time', value: '< 4hrs', icon: LifeBuoy },
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
            const response = await api.post('/tickets', form);
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
            const response = await api.patch(`/tickets/${id}`, { status });
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
        handleUpdateStatus(id, 'escalated');
    };

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text tracking-tight leading-none">Support & Help</h1>
                    <p className="text-[11px] font-medium text-text-muted mt-1 uppercase tracking-wider">
                        {user?.role?.toUpperCase()} SUPPORT DASHBOARD
                    </p>
                </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-text text-background px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider shadow-lg hover:bg-primary hover:text-white transition-all"
                    >
                        <Plus className="w-4 h-4" /> New Support Request
                    </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 border border-border flex flex-col justify-between group hover:border-primary transition-all rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <stat.icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-text leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tickets Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-3 border border-border flex flex-col md:flex-row gap-3 rounded-xl shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by subject or request number..."
                                className="w-full pl-10 pr-4 py-2 bg-surface border border-border text-[13px] font-medium focus:border-primary outline-none transition-all rounded-lg"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-[11px] font-bold uppercase tracking-wider bg-surface border border-border pl-4 pr-10 py-2 outline-none focus:border-primary cursor-pointer appearance-none min-w-[140px] rounded-lg"
                        >
                            <option value="All">All Status</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            <option value="escalated">ESCALATED</option>
                        </select>
                    </div>

                    <div className="bg-white border border-border shadow-sm overflow-hidden min-h-[400px] rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-surface border-b border-border">
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">ID & Subject</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
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
                                            const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.open;
                                            return (
                                                <tr 
                                                    key={t._id} 
                                                    className="hover:bg-primary/[0.02] transition-colors group"
                                                >
                                                    <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="text-[10px] font-bold text-primary tracking-tight opacity-70 uppercase">#{t._id?.slice(-6)}</div>
                                                            {['admin', 'manager'].includes(user?.role) && t.userId && (
                                                                <div className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                    {t.userId.name} ({t.userId.role})
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-text text-[14px] leading-tight group-hover:text-primary transition-colors">{t.subject}</div>
                                                        <div className="text-[9px] font-medium text-text-muted mt-0.5">{new Date(t.createdAt).toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-5 py-4 cursor-pointer" onClick={() => handleSelectTicket(t._id)}>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider rounded-full ${CATEGORY_STYLES[t.category]}`}>
                                                            {t.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                        {['admin', 'manager', 'superadmin'].includes(userRole) ? (
                                                            <select
                                                                value={t.status}
                                                                onChange={(e) => handleUpdateStatus(t._id, e.target.value)}
                                                                className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider rounded-full outline-none cursor-pointer appearance-none text-center ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}
                                                            >
                                                                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                                                <option value="escalated">ESCALATED</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold border uppercase tracking-wider rounded-full ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                                                {stStyle.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {canEscalate && t.status !== 'escalated' && t.status !== 'resolved' && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleEscalate(t._id); }}
                                                                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-100 transition-all shadow-sm"
                                                                >
                                                                    <ArrowUpCircle className="w-3.5 h-3.5" /> High Priority (Send to Admin)
                                                                </button>
                                                            )}
                                                            <span className="text-[11px] font-medium text-text-muted">{t.lastUpdate || 'Just now'}</span>
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
                    <div className="bg-white border border-border p-6 space-y-5 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <h2 className="text-[12px] font-bold uppercase tracking-wider">Common Questions</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="group cursor-help">
                                    <p className="text-[13px] font-bold text-text flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <ArrowRight className="w-3 h-3 text-primary/50" /> {faq.q}
                                    </p>
                                    <p className="text-[12px] font-medium text-text-muted mt-2 pl-5 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-[15px] font-bold text-primary italic tracking-tight">Need Direct Help?</h3>
                            <p className="text-[12px] font-medium text-text-secondary leading-relaxed">Our support team is available 24/7 to resolve any issues you're facing.</p>
                            <div className="pt-2 flex flex-col gap-3">
                                <a href="mailto:support@wapixo.com" className="flex items-center gap-3 text-[12px] font-bold text-text hover:text-primary transition-colors bg-white/50 p-3 border border-border rounded-lg shadow-sm">
                                    <LifeBuoy className="w-4 h-4 text-primary" /> support@wapixo.com
                                </a>
                                <div className="flex items-center gap-3 text-[12px] font-bold text-text bg-white/50 p-3 border border-border rounded-lg shadow-sm">
                                    <Clock className="w-4 h-4 text-primary" /> Avg. Response: 4h
                                </div>
                            </div>
                        </div>
                        <LifeBuoy className="absolute -bottom-6 -right-6 w-24 h-24 text-primary/10 rotate-12 transition-transform group-hover:rotate-45 duration-1000" />
                    </div>
                </div>
            </div>

            {/* Chat Detail Drawer */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[60] overflow-hidden pointer-events-none">
                    <div 
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity pointer-events-auto cursor-pointer"
                        onClick={() => setSelectedTicket(null)}
                    />
                    <div className={`absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-border transition-transform pointer-events-auto flex flex-col translate-x-0 ${selectedTicket ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-surface rounded-full transition-colors">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                                <div>
                                    <h2 className="text-[14px] font-bold text-text leading-tight">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-[10px] font-bold text-primary uppercase">#{selectedTicket._id?.slice(-6)}</div>
                                        <div className={`px-1.5 py-0.5 text-[8px] font-black border uppercase rounded-full ${STATUS_STYLES[selectedTicket.status]?.bg} ${STATUS_STYLES[selectedTicket.status]?.text} ${STATUS_STYLES[selectedTicket.status]?.border}`}>
                                            {selectedTicket.status}
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
                                <button onClick={fetchTickets} className="p-2 hover:bg-surface rounded-full">
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
                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed ${
                                                            isMe 
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
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-wider mx-auto">
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
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-md p-8 shadow-2xl relative border border-border overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-5 mb-8 pb-5 border-b border-border">
                            <div className="w-12 h-12 bg-text text-white flex items-center justify-center rounded-xl">
                                <LifeBuoy className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-bold text-text leading-none transition-colors">New Support Request</h2>
                                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mt-2">
                                    {['admin', 'superadmin', 'manager'].includes(user?.role?.toLowerCase()) 
                                        ? 'Send a message to our support team' 
                                        : 'Send a message to your manager'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Subject</label>
                                <input 
                                    type="text" 
                                    value={form.subject} 
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                                    required 
                                    className="w-full px-4 py-3 bg-surface border border-border text-[13px] font-medium outline-none focus:border-primary rounded-xl transition-all" 
                                    placeholder="Brief summary of the issue" 
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Category</label>
                                <select 
                                    value={form.category} 
                                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                                    className="w-full px-4 py-3 bg-surface border border-border text-[13px] font-bold outline-none focus:border-primary rounded-xl appearance-none cursor-pointer"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">Detailed Description</label>
                                <textarea 
                                    value={form.description} 
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                    required 
                                    className="w-full px-4 py-3 bg-surface border border-border text-[13px] font-medium outline-none focus:border-primary rounded-xl resize-none h-28 transition-all" 
                                    placeholder="Explain your problem or request in detail..." 
                                />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-border mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-[12px] font-bold uppercase tracking-wider text-text-muted hover:bg-surface rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-text text-white py-3 shadow-lg flex items-center justify-center gap-2 hover:bg-primary rounded-xl transition-all active:scale-95">
                                    <span className="text-[12px] font-bold uppercase tracking-wider">Submit Request</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 bg-text text-background rounded-full shadow-2xl border border-white/10"
                    >
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <p className="text-[11px] font-bold uppercase tracking-widest">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
