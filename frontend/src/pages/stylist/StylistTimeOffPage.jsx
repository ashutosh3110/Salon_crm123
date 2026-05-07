import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Plus, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockApi from '../../services/mock/mockApi';

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
            const res = await mockApi.get('/stylist/time-off');
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
            await mockApi.post('/stylist/time-off', {
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
        APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    const quotaCards =
        quotas.length > 0
            ? quotas
            : [
                  { label: 'Casual Leaves', used: '—', total: '—', colorClass: 'text-primary' },
                  { label: 'Medical Leaves', used: '—', total: '—', colorClass: 'text-rose-500' },
                  { label: 'Earned Leaves', used: '—', total: '—', colorClass: 'text-emerald-500' },
                  { label: 'Short Leaves', used: '—', total: '—', colorClass: 'text-amber-500' },
              ];

    return (
        <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Time off</span>
                    </div>
                    <h1 className="text-3xl text-text tracking-tighter uppercase font-bold">Time off & leaves</h1>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 not-italic">
                        Request and track your leave — synced from the server
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    disabled={loading}
                    className="flex items-center gap-3 px-6 py-4 bg-primary text-white text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 font-bold disabled:opacity-50"
                >
                    <Plus className="w-5 h-5" /> Apply for leave
                </button>
            </div>

            {error && (
                <div className="p-4 border border-rose-500/30 bg-rose-500/5 text-[10px] font-black uppercase text-rose-600 tracking-wide">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quotaCards.map((s) => (
                    <div key={s.key || s.label} className="bg-surface border border-border p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <p className={`text-2xl font-black tracking-tighter ${s.colorClass || 'text-primary'}`}>
                            {s.used}
                            <span className="text-xs font-black text-text-muted mx-1">/</span>
                            <span className="text-xs font-black text-text-muted">{s.total}</span>
                        </p>
                        {s.year != null && (
                            <p className="text-[7px] font-bold text-text-muted uppercase mt-1 tracking-tighter">Year {s.year}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="bg-surface border border-border overflow-hidden text-left">
                    <div className="px-5 py-4 border-b border-border/20 bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[9px] font-black text-text uppercase tracking-[0.2em]">Application history</h2>
                            <span className="text-[7px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 border border-primary/20">
                                Server records
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 p-1 bg-surface border border-border text-left">
                                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => setStatusFilter(f)}
                                        className={`px-2.5 py-1 text-[7px] font-black uppercase tracking-tighter transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                    >
                                        {f === 'ALL' ? 'ALL' : f}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[7px] font-black text-text-muted uppercase tracking-widest border-l border-border/20 pl-2 text-left">
                                Showing: {filteredRequests.length}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-border/10 text-left">
                        {loading && requests.length === 0 ? (
                            <div className="px-5 py-16 text-center text-[10px] font-black uppercase text-text-muted tracking-widest">
                                Loading…
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="px-5 py-16 text-center text-[10px] font-black uppercase text-text-muted tracking-widest">
                                No requests yet. Use &quot;Apply for leave&quot; to submit one.
                            </div>
                        ) : (
                            filteredRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="px-5 py-4 flex flex-col md:flex-row items-center justify-between bg-surface hover:bg-surface-alt/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4 w-full md:w-auto text-left">
                                        <div className={`w-10 h-10 flex items-center justify-center border ${statusStyles[req.status]}`}>
                                            {req.status === 'APPROVED' ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : req.status === 'PENDING' ? (
                                                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="space-y-0.5 text-left">
                                            <p className="text-xs font-black text-text uppercase tracking-tight text-left">
                                                {formatTypeLabel(req.type)}
                                            </p>
                                            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase not-italic leading-none text-left">
                                                [{req.dates}] <span className="mx-1.5 opacity-30">|</span> Applied: {req.appliedOn}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-end text-left">
                                        <span className={`text-[8px] font-black px-3 py-1 border uppercase tracking-widest ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !submitting && setShowForm(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <Clock className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Apply for leave</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Sends request to your salon</p>
                                </div>
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setShowForm(false)}
                                    className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Leave type</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                    >
                                        {leaveTypes.map((t) => (
                                            <option key={t} value={t}>
                                                {formatTypeLabel(t)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">From date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">To date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Reason</label>
                                    <textarea
                                        required
                                        placeholder="Why you need this leave…"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none h-24 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting…' : 'Submit application'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl"
                    >
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
