import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Plus, ChevronRight, Info, Shield, Activity, ShieldAlert, X, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import stylistData from '../../data/stylistMockData.json';

const leaveRequests = stylistData.timeOff.requests;
const leaveTypes = stylistData.timeOff.types;

export default function StylistTimeOffPage() {
    const [requests, setRequests] = useState(stylistData.timeOff.requests);
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        type: leaveTypes[0],
        startDate: '',
        endDate: '',
        reason: ''
    });

    const filteredRequests = requests.filter(req => {
        if (statusFilter === 'ALL') return true;
        return req.status === statusFilter;
    });

    // Remove the showToast function as it's being decommissioned
    /* const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }; */

    // Load and Sync with LocalStorage for cross-panel visibility
    useEffect(() => {
        const stored = localStorage.getItem('WAPIXO_LEAVE_REGISTRY');
        if (stored) {
            setRequests(JSON.parse(stored));
        } else {
            localStorage.setItem('WAPIXO_LEAVE_REGISTRY', JSON.stringify(stylistData.timeOff.requests));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formatMonth = (dateStr) => {
            const d = new Date(dateStr);
            const day = d.getDate();
            const month = d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
            return `${day < 10 ? '0' + day : day} ${month}`;
        };

        const newRequest = {
            id: Date.now(), // Unique ID based on timestamp
            staffName: 'Ananya Sharma', // Mocking currently logged in stylist
            type: formData.type,
            dates: `${formatMonth(formData.startDate)} - ${formatMonth(formData.endDate)}`,
            reason: formData.reason,
            status: 'PENDING',
            appliedOn: formatMonth(new Date())
        };

        const updatedRequests = [newRequest, ...requests];
        setRequests(updatedRequests);
        localStorage.setItem('WAPIXO_LEAVE_REGISTRY', JSON.stringify(updatedRequests));

        setShowForm(false);
        setFormData({ type: leaveTypes[0], startDate: '', endDate: '', reason: '' });
        // showToast("Downtime request transmitted for verification."); // Decommissioned
    };

    const statusStyles = {
        'APPROVED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'PENDING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'REJECTED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header / Command Center */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Leave Management</span>
                    </div>
                    <h1 className="text-3xl text-text tracking-tighter uppercase font-bold">Time Off & Leaves</h1>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 italic">Request and track your leaves</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-primary text-white text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 font-bold"
                >
                    <Plus className="w-5 h-5" /> Apply for Leave
                </button>
            </div>

            {/* Quota Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Casual Leaves', value: '4/12', color: 'text-primary' },
                    { label: 'Medical Leaves', value: '2/8', color: 'text-rose-500' },
                    { label: 'Earned Leaves', value: '10/15', color: 'text-emerald-500' },
                    { label: 'Short Leaves', value: '1/5', color: 'text-amber-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface border border-border p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color} tracking-tighter`}>
                            {s.value.split('/')[0]}
                            <span className="text-xs font-black text-text-muted mx-1">/</span>
                            <span className="text-xs font-black text-text-muted">{s.value.split('/')[1]}</span>
                        </p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {/* Requests Table */}
                <div className="bg-surface border border-border overflow-hidden text-left">
                    <div className="px-5 py-4 border-b border-border/20 bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[9px] font-black text-text uppercase tracking-[0.2em]">Application History</h2>
                            <span className="text-[7px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 border border-primary/20">Verified Records</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 p-1 bg-surface border border-border text-left">
                                {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f)}
                                        className={`px-2.5 py-1 text-[7px] font-black uppercase tracking-tighter transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                    >
                                        {f === 'ALL' ? 'ALL' : f}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[7px] font-black text-text-muted uppercase tracking-widest border-l border-border/20 pl-2 text-left">Requests: {filteredRequests.length}</span>
                        </div>
                    </div>
                    <div className="divide-y divide-border/10 text-left">
                        {filteredRequests.map((req) => (
                            <div key={req.id} className="px-5 py-4 flex flex-col md:flex-row items-center justify-between bg-surface hover:bg-surface-alt/50 transition-all group">
                                <div className="flex items-center gap-4 w-full md:w-auto text-left">
                                    <div className={`w-10 h-10 flex items-center justify-center border ${statusStyles[req.status]}`}>
                                        {req.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> :
                                            req.status === 'PENDING' ? <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> : <XCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="space-y-0.5 text-left">
                                        <p className="text-xs font-black text-text uppercase tracking-tight text-left">{req.type}</p>
                                        <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase italic leading-none text-left">
                                            [{req.dates}] <span className="mx-1.5 opacity-30">|</span> Applied on: {req.appliedOn}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-end text-left">
                                    <span className={`text-[8px] font-black px-3 py-1 border uppercase tracking-widest ${statusStyles[req.status]}`}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <Clock className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Apply for Leave</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Submit your leave request below</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 relative z-10"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Leave Type</label>
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                    >
                                        {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">From Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">To Date</label>
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
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Reason for Leave</label>
                                    <textarea
                                        required
                                        placeholder="Enter your reason for taking leave..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none h-24 resize-none"
                                    />
                                </div>

                                <button type="submit" className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Submit Application</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast System Decommissioned */}
        </div>
    );
}
