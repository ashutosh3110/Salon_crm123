import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Plus, ChevronRight, Info, Shield, Activity, ShieldAlert, X, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const leaveRequests = [
    { id: 1, type: 'CASUAL_LEAVE', dates: '24 FEB - 26 FEB', reason: 'FAMILY_VISIT', status: 'PENDING', appliedOn: '20 FEB' },
    { id: 2, type: 'MEDICAL_LEAVE', dates: '10 FEB', reason: 'EMERGENCY_DENTAL', status: 'APPROVED', appliedOn: '09 FEB' },
    { id: 3, type: 'PAID_LEAVE', dates: '15 JAN - 20 JAN', reason: 'VACATION', status: 'REJECTED', appliedOn: '10 JAN' },
];

const leaveTypes = ['CASUAL_LEAVE', 'MEDICAL_LEAVE', 'PAID_LEAVE', 'SICK_BUFFER'];

export default function StylistTimeOffPage() {
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const statusStyles = {
        'APPROVED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'PENDING': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'REJECTED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Downtime_Control</span>
                    </div>
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase">Protocol Pause</h1>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 italic">Absence_Management_Terminal</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:bg-primary-dark transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Initialize_Request
                </button>
            </div>

            {/* Quota Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Casual_Quota', value: '4/12', color: 'text-primary' },
                    { label: 'Medical_Units', value: '2/8', color: 'text-rose-500' },
                    { label: 'Paid_Stream', value: '10/15', color: 'text-emerald-500' },
                    { label: 'Sick_Buffer', value: '1/5', color: 'text-amber-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface border border-border p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{s.label}</p>
                        <p className={`text-4xl font-black ${s.color} tracking-tighter`}>
                            {s.value.split('/')[0]}
                            <span className="text-sm font-black text-text-muted mx-2">/</span>
                            <span className="text-sm font-black text-text-muted">{s.value.split('/')[1]}</span>
                        </p>
                        <div className="mt-4 h-1 bg-background">
                            <div className="h-full bg-border/20 w-full" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Requests Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-8 py-6 border-b border-border/20 bg-background/50 flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Iteration_Request_Log</h2>
                            <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 border border-primary/20">Authorized_Base</span>
                        </div>
                        <div className="divide-y divide-border/10">
                            {leaveRequests.map((req) => (
                                <div key={req.id} className="p-8 flex flex-col md:flex-row items-center justify-between bg-surface hover:bg-surface-alt/50 transition-all group">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className={`w-12 h-12 flex items-center justify-center border ${statusStyles[req.status]}`}>
                                            {req.status === 'APPROVED' ? <CheckCircle2 className="w-5 h-5" /> :
                                                req.status === 'PENDING' ? <Clock className="w-5 h-5 text-amber-500 animate-pulse" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{req.type}</p>
                                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase italic">
                                                [{req.dates}] <span className="mx-2 opacity-30">|</span> APPLIED_{req.appliedOn}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                        <span className={`text-[9px] font-black px-4 py-1.5 border uppercase tracking-widest ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                        <button
                                            onClick={() => showToast(`Synchronizing Request_ID: ${req.id}`)}
                                            className="p-2 border border-border text-text-muted hover:text-text hover:bg-surface transition-all active:scale-95"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Important Info */}
                <div className="space-y-6">
                    <div className="bg-primary/5 border border-primary/20 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldAlert className="w-16 h-16 text-primary" />
                        </div>

                        <div className="relative z-10 font-black">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-4 h-4 text-primary" />
                                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Policy_Directives</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="p-4 bg-background border border-border">
                                    <p className="text-[8px] text-primary uppercase tracking-[0.2em] mb-2 font-bold italic">Latency_Requirement</p>
                                    <p className="text-[10px] text-text-muted uppercase leading-relaxed tracking-tight">
                                        Submissions must be finalized <span className="text-primary">48 hours</span> prior to session initiation.
                                    </p>
                                </div>
                                <div className="p-4 bg-background border border-border">
                                    <p className="text-[8px] text-primary uppercase tracking-[0.2em] mb-2 font-bold italic">Medical_Verification</p>
                                    <p className="text-[10px] text-text-muted uppercase leading-relaxed tracking-tight">
                                        Doctor's certificate mandatory for dental/medical cycles exceeding <span className="text-primary">48 units</span>.
                                    </p>
                                </div>
                                <div className="p-4 bg-background border border-border">
                                    <p className="text-[8px] text-primary uppercase tracking-[0.2em] mb-2 font-bold italic">Managerial_Sync</p>
                                    <p className="text-[10px] text-text-muted uppercase leading-relaxed tracking-tight">
                                        Planned vacation streams require prior <span className="text-primary">Managerial Bypass</span> approval.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Pause Initialization</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Protocol: Downtime_Request_V2</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setShowForm(false);
                                    showToast("Downtime request transmitted for verification.");
                                }}
                                className="space-y-6 relative z-10"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Pause_Vector</label>
                                    <select required className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none appearance-none">
                                        {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Initiation_Date</label>
                                        <input required type="date" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Termination_Date</label>
                                        <input required type="date" className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Rationalization</label>
                                    <textarea required placeholder="Specify logical reason for protocol pause..." className="w-full px-5 py-4 bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none h-24 resize-none" />
                                </div>

                                <button type="submit" className="w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Submit Protocol Pause</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
