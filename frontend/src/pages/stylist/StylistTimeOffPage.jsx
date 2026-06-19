import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Plus, Activity, X, ChevronDown, ListTodo, SunMedium, Thermometer, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

function formatTypeLabel(type) {
    if (!type) return '';
    return String(type)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StylistTimeOffPage() {
    const [requests, setRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState(['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER']);
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toast, setToast] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        type: 'CASUAL_LEAVE',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const load = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await api.get('/hr/leaves/me');
            const data = res.data?.data ?? res.data;
            setRequests(Array.isArray(data?.requests) ? data.requests : []);
            if (Array.isArray(data?.leaveTypes) && data.leaveTypes.length) {
                setLeaveTypes(data.leaveTypes);
            }
            setQuotas(Array.isArray(data?.quotas) ? data.quotas : []);
            setFormData((f) => ({
                ...f,
                type: data?.leaveTypes?.[0] || f.type,
            }));
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Could not load time off');
            setRequests([]);
            setQuotas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3200);
    };

    const filteredRequests = requests.filter((req) => {
        if (statusFilter === 'ALL') return true;
        return req.status === statusFilter;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            showToast('Please choose start and end dates');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/hr/leaves/me', {
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: (formData.reason || '').trim(),
            });
            showToast('Leave request submitted');
            setShowForm(false);
            setFormData({
                type: leaveTypes[0] || 'CASUAL_LEAVE',
                startDate: '',
                endDate: '',
                reason: '',
            });
            await load();
        } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Could not submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const statusStyles = {
        APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20',
        PENDING: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20',
        REJECTED: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20',
    };

    const quotaCards = quotas.length > 0 ? quotas : [
        { label: 'Casual Leaves', used: '—', total: '—', colorClass: 'text-purple-500', icon: SunMedium },
        { label: 'Medical Leaves', used: '—', total: '—', colorClass: 'text-rose-500', icon: Thermometer },
        { label: 'Earned Leaves', used: '—', total: '—', colorClass: 'text-emerald-500', icon: Briefcase },
        { label: 'Short Leaves', used: '—', total: '—', colorClass: 'text-amber-500', icon: Clock },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm font-sans relative">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Vibrant Theme Hero Header */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 pt-8 pb-10 px-6 sm:px-10 relative shrink-0 rounded-b-[32px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-200" />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-purple-200 font-bold">Time Off</span>
                        </div>
                        <h1 className="text-[28px] sm:text-[32px] font-black text-white uppercase tracking-tight drop-shadow-md leading-tight">
                            Leave Management
                        </h1>
                        <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mt-1 drop-shadow-sm">
                            Request and track your leave — synced from the server
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        disabled={loading}
                        className="flex items-center justify-center sm:justify-start gap-2 bg-white hover:bg-slate-50 text-purple-700 px-6 py-4 rounded-[16px] font-black uppercase text-[11px] tracking-widest shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> Apply for leave
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 sm:px-6 py-6 pb-24 space-y-8">
                
                {error && (
                    <div className="p-4 rounded-[16px] border border-rose-500/30 bg-rose-50 text-[10px] font-black uppercase text-rose-600 tracking-wide">
                        {error}
                    </div>
                )}

                {/* Quota Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {quotaCards.map((s, idx) => {
                        const isRose = s.colorClass?.includes('rose') || s.label.toLowerCase().includes('medical');
                        const isEmerald = s.colorClass?.includes('emerald') || s.label.toLowerCase().includes('earned');
                        const isAmber = s.colorClass?.includes('amber') || s.label.toLowerCase().includes('short');
                        
                        let cardBg = 'bg-white dark:bg-slate-800';
                        let iconBg = 'bg-purple-100 dark:bg-purple-500/10';
                        let iconColor = 'text-purple-600 dark:text-purple-400';
                        let Icon = s.icon || SunMedium;

                        if (isRose) {
                            iconBg = 'bg-rose-100 dark:bg-rose-500/10';
                            iconColor = 'text-rose-600 dark:text-rose-400';
                            Icon = Thermometer;
                        } else if (isEmerald) {
                            iconBg = 'bg-emerald-100 dark:bg-emerald-500/10';
                            iconColor = 'text-emerald-600 dark:text-emerald-400';
                            Icon = Briefcase;
                        } else if (isAmber) {
                            iconBg = 'bg-amber-100 dark:bg-amber-500/10';
                            iconColor = 'text-amber-600 dark:text-amber-400';
                            Icon = Clock;
                        }

                        return (
                            <div key={idx} className={`rounded-[24px] p-5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[120px] transition-all hover:-translate-y-1 hover:shadow-md ${cardBg}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                                        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight mb-1">
                                            {s.label}
                                        </span>
                                        <h3 className={`text-[20px] font-black tracking-tight ${iconColor}`}>
                                            {s.used}
                                            <span className="text-[12px] font-bold opacity-40 mx-1">/</span>
                                            <span className="text-[14px] font-bold opacity-60">{s.total}</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Application History */}
                <div className="bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <ListTodo className="w-4 h-4 text-purple-600" />
                            <h2 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Application History</h2>
                            <span className="hidden sm:inline-block text-[8px] font-black text-purple-600 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Server Records
                            </span>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                            <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-full shrink-0">
                                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f)}
                                        className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-full ${
                                            statusFilter === f 
                                            ? 'bg-purple-600 text-white shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {loading && requests.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading history…</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[20px]">
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    No requests yet.
                                </p>
                            </div>
                        ) : (
                            filteredRequests.map((req, idx) => (
                                <div key={req.id || idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-[20px] transition-all hover:border-purple-200 dark:hover:border-purple-500/30">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 ${
                                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                            req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                            'bg-rose-100 text-rose-600'
                                        }`}>
                                            {req.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> : 
                                             req.status === 'PENDING' ? <Clock className="w-5 h-5 animate-pulse" /> : 
                                             <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                                {formatTypeLabel(req.type)}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">
                                                {req.dates}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end mt-4 sm:mt-0 w-full sm:w-auto ml-16 sm:ml-0 gap-1">
                                        <span className={`text-[9px] font-black px-3 py-1 border uppercase tracking-widest rounded-full w-max ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                            Applied: {req.appliedOn}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Apply Leave Modal */}
            {createPortal(
                <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => !submitting && setShowForm(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] shadow-2xl relative p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <h2 className="text-[20px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Apply for leave</h2>
                                    <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-widest">Sends request to your salon</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)} disabled={submitting}
                                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Leave type</label>
                                    <div className="relative">
                                        <select
                                            required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                        >
                                            {leaveTypes.map((t) => (
                                                <option key={t} value={t}>{formatTypeLabel(t)}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">From date</label>
                                        <input
                                            required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To date</label>
                                        <input
                                            required type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason</label>
                                    <textarea
                                        required placeholder="Why you need this leave…" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full p-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 h-28 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={submitting}
                                    className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[16px] font-black uppercase text-[12px] tracking-widest shadow-[0_4px_14px_-4px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting…' : 'Submit Application'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>,
                document.body
            )}

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-slate-800 text-white rounded-full shadow-xl"
                    >
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
