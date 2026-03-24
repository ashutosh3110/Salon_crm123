import { useState, useEffect, useMemo } from 'react';
import {
    Bug, LogOut, Search, RefreshCw,
    CheckCircle, XCircle, Clock,
    Eye, Download, X,
    Shield, Users,
    AlertTriangle, Info, MessageSquare, ArrowRight, ArrowUpCircle
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import { exportToExcel } from '../../utils/exportUtils';
import api from '../../services/api';

/* ─── Constants ────────────────────────────────────────────────────── */
const ERROR_CFG = {
    error: { cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle, dot: 'bg-red-500' },
    warning: { cls: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle, dot: 'bg-amber-500' },
    info: { cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: Info, dot: 'bg-blue-500' },
};

const STATUS_STYLES = {
    'open': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'Open' },
    'in-progress': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'In Progress' },
    'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
    'closed': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed' },
    'escalated': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Escalated' },
};

/* ─── Mock data ─────────────────────────────────────────────────────── */
const MOCK_ERRORS = [
    { id: 'e001', level: 'error', message: 'Uncaught TypeError: Cannot read properties of undefined', tenant: 'Glam Studio', time: '2026-02-23 15:33:41', file: 'staff.controller.js:84', count: 3 },
    { id: 'e002', level: 'error', message: 'MongoServerError: E11000 duplicate key error', tenant: 'Luxe Cuts', time: '2026-02-23 14:12:30', file: 'client.service.js:201', count: 1 },
];

export default function SASupportPage() {
    const [errLevel, setErrLevel] = useState('');
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);
    
    // Support Tickets State
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'errors'

    useEffect(() => {
        if (activeTab === 'tickets') fetchTickets();
    }, [activeTab]);

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const response = await api.get('/support/tickets');
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
            const response = await api.patch(`/support/tickets/${id}`, { status });
            if (response.data.success) {
                setTickets(tickets.map(t => t._id === id ? response.data.data : t));
                showToast(`Ticket status updated to ${status}`);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const filteredErrors = MOCK_ERRORS.filter(e =>
        !errLevel || e.level === errLevel
    );

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
                    <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.2em] mt-1">Platform-wide diagnostic tools and customer tickets</p>
                </div>
                <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border/60">
                    <button 
                        onClick={() => setActiveTab('tickets')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                    >
                        Salon Tickets
                    </button>
                    <button 
                        onClick={() => setActiveTab('errors')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'errors' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
                    >
                        System Errors
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
                        <button onClick={fetchTickets} className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted hover:text-primary">
                            <RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loadingTickets ? (
                            <div className="py-20 text-center animate-pulse">
                                <MessageSquare className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">Loading protocol tickets…</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="py-20 text-center bg-white border border-border border-dashed rounded-2xl">
                                <CheckCircle className="w-16 h-16 text-emerald-400/20 mx-auto mb-4" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">No Active Tickets</h3>
                                <p className="text-[11px] text-text-muted mt-2 uppercase tracking-widest">All salon units are operating within nominal parameters</p>
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
                                                            <ArrowUpCircle className="w-3 h-3" /> Critical Escalation
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
                                                {t.status !== 'resolved' && (
                                                    <button 
                                                        onClick={() => updateStatus(t._id, 'resolved')}
                                                        className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> Close ticket
                                                    </button>
                                                )}
                                                {t.status === 'open' && (
                                                    <button 
                                                        onClick={() => updateStatus(t._id, 'in-progress')}
                                                        className="flex-1 md:w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10"
                                                    >
                                                        <Clock className="w-3.5 h-3.5" /> In Progress
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
                /* System Error Tracker Section */
                <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center text-primary">
                            <Bug size={18} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">System Error Tracker</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <CustomDropdown
                            value={errLevel}
                            onChange={setErrLevel}
                            placeholder="All Levels"
                            options={[
                                { value: '', label: 'All Severity Levels' },
                                { value: 'error', label: 'Critical Errors', icon: XCircle },
                                { value: 'warning', label: 'System Warnings', icon: AlertTriangle },
                                { value: 'info', label: 'Informational', icon: Info },
                            ]}
                        />
                        <button onClick={() => {
                            exportToExcel(MOCK_ERRORS, 'Wapixo_System_Error_Log', 'Diagnostics');
                            showToast('Error log exported as Excel!', 'info');
                        }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {filteredErrors.map(e => {
                        const cfg = ERROR_CFG[e.level];
                        return (
                            <div key={e.id} className={`flex items-start gap-4 p-5 bg-white rounded-xl border ${cfg.cls} group hover:shadow-xl transition-all duration-300`}>
                                <div className="mt-0.5 shrink-0">
                                    <cfg.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-bold text-text leading-snug">{e.message}</p>
                                        {e.count > 1 && (
                                            <span className="text-[10px] font-black bg-white/80 border border-current px-2.5 py-0.5 rounded-full shrink-0">
                                                RECURRENCE ×{e.count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                        <div className="flex items-center gap-1.5 opacity-70">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol:</span>
                                            <span className="text-[11px] font-mono font-bold tracking-tighter">{e.file}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 grayscale opacity-80">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Tenant:</span>
                                            <span className="text-[11px] font-bold italic">{e.tenant}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-60 ml-auto">
                                            <Clock size={12} />
                                            <span className="text-[11px] font-mono">{e.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => showToast(`Error ${e.id} resolved.`)}
                                    className="shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-black/5 transition-all self-center"
                                    title="Mark as Resolved"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {filteredErrors.length === 0 && (
                    <div className="text-center py-20 bg-white border border-border border-dashed rounded-2xl">
                        <CheckCircle className="w-16 h-16 text-emerald-400/20 mx-auto mb-4" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-muted italic">Clear Horizon</h3>
                        <p className="text-[11px] text-text-muted mt-2 uppercase tracking-widest">No active system violations at this level</p>
                    </div>
                )}
            </div>
            )}
        </div>
    );
}
