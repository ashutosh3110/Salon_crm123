import { useState, useEffect, useMemo } from 'react';
import {
    Bug, LogOut, Search, RefreshCw,
    CheckCircle, XCircle, Clock,
    Eye, Download, X,
    Shield, Users,
    AlertTriangle, Info, MessageSquare, ArrowRight, ArrowUpCircle,
    Plus, Trash2, Save, FileEdit, HelpCircle
} from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils';
import api from '../../services/api';

/* ─── Constants ────────────────────────────────────────────────────── */

const STATUS_STYLES = {
    'open': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Open' },
    'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress' },
    'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
    'closed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed' },
    'escalated': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Escalated' },
};

/* ─── Mock data ─────────────────────────────────────────────────────── */

export default function SASupportPage() {
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);
    
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'faqs'

    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(false);
    const [savingFaqs, setSavingFaqs] = useState(false);

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
            const res = await api.get('/salons'); // Adjust endpoint if needed
            if (res.data.success) {
                setSalons(res.data.data || []);
            }
        } catch (err) {
            console.error('[Support] Salon fetch failed:', err);
        }
    };

    const fetchFAQs = async () => {
        try {
            setLoadingFaqs(true);
            const response = await api.get('/settings');
            const data = response.data?.data;
            if (data && data.supportFaqs) {
                setFaqs(data.supportFaqs);
            } else {
                // Initial empty state if nothing exists in DB yet
                setFaqs([]);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const handleSaveFAQs = async () => {
        try {
            setSavingFaqs(true);
            const response = await api.patch('/settings', { supportFaqs: faqs });
            if (response.data?.success) {
                showToast('FAQs updated successfully!');
            }
        } catch (error) {
            console.error('Failed to save FAQs:', error);
            showToast('Failed to save FAQs', 'error');
        } finally {
            setSavingFaqs(false);
        }
    };

    const addFaq = () => {
        setFaqs([...faqs, { q: 'New Question?', a: 'Answer goes here...' }]);
    };

    const removeFaq = (index) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    const updateFaq = (index, field, value) => {
        const newFaqs = [...faqs];
        newFaqs[index][field] = value;
        setFaqs(newFaqs);
    };

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const response = await api.get('/tickets');
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
            const response = await api.patch(`/tickets/${id}`, { status });
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


    const handleForceLogout = async () => {
        if (!confirm('Force logout ALL active users from all salons? This will clear every session.')) return;
        setClearing(true);
        await new Promise(r => setTimeout(r, 1500));
        setClearing(false);
        showToast('All sessions cleared — users will need to re-login.', 'error');
    };

    return (
        <div className="space-y-5 pb-8 sa-panel">
            {toast && (
                <div className={`fixed top-20 right-8 z-[200] flex items-center gap-2.5 px-6 py-3 rounded-xl shadow-2xl text-white text-xs font-bold uppercase tracking-widest animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Support <span className="text-primary text-3xl">Portal</span></h1>
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Manage platform support and salon requests</p>
                </div>
                <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border/60">
                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                    >
                        Salon Tickets
                    </button>
                    <button 
                        onClick={() => setActiveTab('faqs')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'faqs' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                    >
                        Manage FAQs
                    </button>
                    <button onClick={handleForceLogout} disabled={clearing}
                        className="ml-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60">
                        {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {activeTab === 'tickets' ? (
                /* Salon Support Tickets Section */
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight leading-none">Salon Support Tickets</h2>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Manage requests from salon owners and staff</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Create Ticket
                            </button>
                            <button onClick={fetchTickets} className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted hover:text-primary">
                                <RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loadingTickets ? (
                            <div className="py-20 text-center animate-pulse">
                                <MessageSquare className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">Fetching support tickets...</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="py-20 text-center bg-white border border-border border-dashed rounded-2xl">
                                <CheckCircle className="w-16 h-16 text-emerald-400/20 mx-auto mb-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">No Active Tickets</h3>
                                <p className="text-[11px] text-text-muted mt-2 uppercase tracking-widest">Everything is running smoothly. No active tickets found.</p>
                            </div>
                        ) : (
                            tickets.map(t => {
                                const stStyle = STATUS_STYLES[t.status] || STATUS_STYLES.open;
                                return (
                                    <div key={t._id} className="group relative bg-white border border-border rounded-2xl p-5 hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tight">#{t._id.slice(-6)}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                                        {stStyle.label}
                                                    </span>
                                                    {t.status === 'escalated' && (
                                                        <span className="animate-pulse flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest">
                                                            <ArrowUpCircle className="w-3 h-3" /> High Priority Support
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">{t.subject}</h3>
                                                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{t.description}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                                                            <Shield className="w-3 h-3 text-primary" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-text italic">{t.tenantId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-70">
                                                        <Users className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-medium text-text-muted">{t.userId?.name} ({t.userId?.role})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-60">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-mono">{new Date(t.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex md:flex-col items-center gap-2">
                                                <div className="flex gap-2 w-full">
                                                    <select 
                                                        value={t.status}
                                                        onChange={(e) => updateStatus(t._id, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                                                    >
                                                        {Object.entries(STATUS_STYLES).map(([val, cfg]) => (
                                                            <option key={val} value={val}>{cfg.label}</option>
                                                        ))}
                                                    </select>
                                                    <button 
                                                        onClick={() => handleDeleteTicket(t._id)}
                                                        className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                
                                                {t.status !== 'resolved' && t.status !== 'closed' && (
                                                    <button 
                                                        onClick={() => updateStatus(t._id, 'closed')}
                                                        className="md:w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> Close ticket
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                /* Manage FAQs Section */
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                                <HelpCircle size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold tracking-tight leading-none">Platform FAQs</h2>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Manage common questions shown to all salon units</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={addFaq}
                                className="flex items-center gap-2 px-4 py-2 bg-text text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Add Question
                            </button>
                            <button 
                                onClick={handleSaveFAQs}
                                disabled={savingFaqs}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {savingFaqs ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loadingFaqs ? (
                            <div className="py-20 text-center animate-pulse">
                                <RefreshCw className="w-12 h-12 text-primary/20 mx-auto mb-4 animate-spin" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">Updating FAQ list...</p>
                            </div>
                        ) : faqs.length === 0 ? (
                            <div className="py-20 text-center bg-white border border-border border-dashed rounded-2xl">
                                <Info className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">No FAQs found. Click "Add Question" to start.</p>
                            </div>
                        ) : (
                            faqs.map((faq, i) => (
                                <div key={i} className="bg-white border border-border rounded-2xl p-6 hover:shadow-xl transition-all group">
                                    <div className="flex items-start gap-5">
                                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                            <span className="text-[10px] font-black">Q{i+1}</span>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Question</label>
                                                <input 
                                                    type="text" 
                                                    value={faq.q}
                                                    onChange={(e) => updateFaq(i, 'q', e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-text focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Answer</label>
                                                <textarea 
                                                    value={faq.a}
                                                    onChange={(e) => updateFaq(i, 'a', e.target.value)}
                                                    rows="2"
                                                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-secondary focus:border-primary outline-none transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFaq(i)}
                                            className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
                            <h2 className="text-xl font-black italic uppercase tracking-tight">Create <span className="text-primary italic">Support Ticket</span></h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-surface rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Ticket Subject</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                    placeholder="e.g., App sync issue"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Target Salon (Optional)</label>
                                <select 
                                    value={newTicket.tenantId}
                                    onChange={(e) => setNewTicket({...newTicket, tenantId: e.target.value})}
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all"
                                >
                                    <option value="">Platform Level (Global)</option>
                                    {salons.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.status})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Priority</label>
                                    <select 
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Initial Status</label>
                                    <select 
                                        value={newTicket.status}
                                        onChange={(e) => setNewTicket({...newTicket, status: e.target.value})}
                                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:border-primary outline-none transition-all"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="escalated">Escalated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Description</label>
                                <textarea 
                                    required
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    rows="4"
                                    placeholder="Describe the issue in detail..."
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:border-primary outline-none transition-all resize-none placeholder:text-text-muted/50"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-border rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-surface transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
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
