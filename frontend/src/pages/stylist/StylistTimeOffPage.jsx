import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Plus, X, ChevronDown, ListTodo, SunMedium, Thermometer, Briefcase, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';

function formatTypeLabel(type) {
    if (!type) return '';
    return String(type)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StylistTimeOffPage() {
    const { setMobileOpen } = useOutletContext() || {};
    const [requests, setRequests] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState(['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER']);
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toastMsg, setToastMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3200);
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
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-500/10 dark:border-emerald-500/20 font-bold',
        PENDING: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-500/10 dark:border-amber-500/20 font-bold',
        REJECTED: 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-500/10 dark:border-rose-500/20 font-bold',
    };

    const quotaCards = quotas.length > 0 ? quotas : [
        { label: 'Casual Leaves', used: '—', total: '—', colorClass: 'text-purple-500', icon: SunMedium },
        { label: 'Medical Leaves', used: '—', total: '—', colorClass: 'text-rose-500', icon: Thermometer },
        { label: 'Earned Leaves', used: '—', total: '—', colorClass: 'text-emerald-500', icon: Briefcase },
        { label: 'Short Leaves', used: '—', total: '—', colorClass: 'text-amber-500', icon: Clock },
    ];

    if (error === 'Staff not found' || error?.includes('Staff not found')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-white dark:bg-slate-900 rounded-[24px]">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Staff Profile Pending</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Your account is not linked to a staff profile in this salon yet. Please ask your administrator or manager to add you to the staff roster.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-[#7C3AED] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer border-0"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FAFAFC] dark:bg-slate-900 lg:rounded-[24px] lg:shadow-sm overflow-hidden min-h-screen lg:min-h-0 pb-20 lg:pb-0 font-sans relative">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                html:not(.dark) .timeoff-select-trigger,
                html:not(.dark) .timeoff-select-trigger * {
                    color: #0f172a !important;
                }
            `}</style>
            
            {/* Mobile Header */}
            <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[50]">
                <button 
                    onClick={() => setMobileOpen && setMobileOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
                <span className="text-[17px] font-bold text-slate-900 dark:text-white">
                    Time Off
                </span>
                <div className="w-10 h-10" />
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between px-6 pt-6 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-[20px] font-bold text-slate-900 dark:text-white">Time Off</h1>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 lg:px-6 py-4 space-y-6">
                
                {error && (
                    <div className="p-4 rounded-[16px] border border-rose-500/30 bg-rose-50 text-[11px] font-bold uppercase text-rose-600 tracking-wide">
                        {error}
                    </div>
                )}

                {/* Hero Banner Banner Card */}
                <div className="!bg-[#5D2EE6] rounded-[20px] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-[#5D2EE6]/15">
                    <div className="flex flex-col">
                        <span className="text-[12.5px] font-medium !text-white/80 uppercase tracking-wider mb-1">Leave Request</span>
                        <h2 className="text-[24px] font-semibold !text-white tracking-tight">Need Time Off?</h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#5D2EE6] px-6 py-3.5 rounded-[16px] font-bold uppercase text-[12px] tracking-wider shadow-sm transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] border-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" strokeWidth={3} /> Apply for leave
                    </button>
                </div>

                {/* Quota Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {quotaCards.map((s, idx) => {
                        const isRose = s.colorClass?.includes('rose') || s.label.toLowerCase().includes('medical');
                        const isEmerald = s.colorClass?.includes('emerald') || s.label.toLowerCase().includes('earned');
                        const isAmber = s.colorClass?.includes('amber') || s.label.toLowerCase().includes('short');
                        
                        let iconBg = 'bg-purple-50 dark:bg-purple-950/20';
                        let iconColor = 'text-[#7C3AED] dark:text-purple-400';
                        let Icon = s.icon || SunMedium;

                        if (isRose) {
                            iconBg = 'bg-rose-50 dark:bg-rose-950/20';
                            iconColor = 'text-rose-600 dark:text-rose-400';
                            Icon = Thermometer;
                        } else if (isEmerald) {
                            iconBg = 'bg-emerald-50 dark:bg-emerald-950/20';
                            iconColor = 'text-emerald-600 dark:text-emerald-400';
                            Icon = Briefcase;
                        } else if (isAmber) {
                            iconBg = 'bg-amber-50 dark:bg-amber-950/20';
                            iconColor = 'text-amber-600 dark:text-amber-400';
                            Icon = Clock;
                        }

                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750 flex flex-col justify-between min-h-[110px]">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                                        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight mb-1">
                                            {s.label}
                                        </span>
                                        <h3 className={`text-[20px] font-bold tracking-tight ${iconColor}`}>
                                            {s.used}
                                            <span className="text-[12px] font-bold opacity-30 mx-1">/</span>
                                            <span className="text-[13px] font-bold opacity-50">{s.total}</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Application History */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750 overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="w-4.5 h-4.5 text-[#5D2EE6]" />
                            <h2 className="text-[14px] font-bold text-slate-850 dark:text-white uppercase tracking-wider">Application History</h2>
                        </div>

                        {/* Filters (Bypass overflow-x-auto global styling override) */}
                        <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
                            <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-700 p-0.5 rounded-full shrink-0">
                                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f)}
                                        className={`px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all rounded-full border-0 cursor-pointer ${
                                            statusFilter === f 
                                            ? '!bg-[#5D2EE6] !text-white shadow-sm' 
                                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white bg-transparent'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {loading && requests.length === 0 ? (
                            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                                <div className="animate-spin w-7 h-7 border-3 border-[#5D2EE6] border-t-transparent rounded-full mb-2"></div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Loading history…</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-[20px]">
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                                    No requests found.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-750">
                                {filteredRequests.map((req, idx) => (
                                    <div key={req.id || idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-11 h-11 flex items-center justify-center rounded-full shrink-0 ${
                                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                'bg-rose-50 text-rose-600'
                                            }`}>
                                                {req.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> : 
                                                 req.status === 'PENDING' ? <Clock className="w-5 h-5 animate-pulse" /> : 
                                                 <XCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                                                    {formatTypeLabel(req.type)}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                    {req.dates}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:items-end w-full sm:w-auto ml-14 sm:ml-0 gap-1.5">
                                            <span className={`text-[10px] font-bold px-3 py-0.5 border uppercase tracking-wider rounded-full w-max ${statusStyles[req.status]}`}>
                                                {req.status}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                Applied: {req.appliedOn}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            onClick={() => { if (!submitting) { setShowForm(false); setDropdownOpen(false); } }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[28px] shadow-2xl relative p-6 sm:p-8 max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h2 className="text-[18px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Apply for leave</h2>
                                    <p className="text-[10px] font-bold text-[#5D2EE6] mt-0.5 uppercase tracking-wider">Sends request to your salon</p>
                                </div>
                                <button
                                    onClick={() => { setShowForm(false); setDropdownOpen(false); }} disabled={submitting}
                                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 flex items-center justify-center text-slate-500 border-0 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider ml-1">Leave type</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="timeoff-select-trigger w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-[16px] text-[12.5px] font-bold text-slate-900 dark:text-white flex items-center justify-between focus:ring-2 focus:ring-purple-500/50 outline-none text-left cursor-pointer"
                                        >
                                            <span>{formatTypeLabel(formData.type)}</span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {dropdownOpen && (
                                            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-[16px] shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto no-scrollbar">
                                                {leaveTypes.map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, type: t });
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="w-full px-5 py-3 text-left text-[12.5px] font-bold text-slate-900 dark:text-white hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-[#5D2EE6] transition border-0 cursor-pointer"
                                                    >
                                                        {formatTypeLabel(t)}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider ml-1">From date</label>
                                        <input
                                            required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/65 dark:border-slate-700 rounded-[16px] text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider ml-1">To date</label>
                                        <input
                                            required type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/65 dark:border-slate-700 rounded-[16px] text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider ml-1">Reason</label>
                                    <textarea
                                        required placeholder="Why you need this leave…" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/65 dark:border-slate-700 rounded-[16px] text-[12.5px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 h-28 resize-none"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full mt-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-[16px] font-bold uppercase text-[12px] tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer border-0"
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
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-slate-800 text-white rounded-full shadow-xl"
                    >
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                        <p className="text-[10.5px] font-bold uppercase tracking-wider">{toastMsg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
