import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Plus, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const leaveRequests = [
    { id: 1, type: 'Casual Leave', dates: '24 Feb - 26 Feb', reason: 'Family Visit', status: 'Pending', appliedOn: '20 Feb' },
    { id: 2, type: 'Medical Leave', dates: '10 Feb', reason: 'Emergency Dental Work', status: 'Approved', appliedOn: '09 Feb' },
    { id: 3, type: 'Paid Leave', dates: '15 Jan - 20 Jan', reason: 'Vacation', status: 'Rejected', appliedOn: '10 Jan' },
];

export default function StylistTimeOffPage() {
    const [showForm, setShowForm] = useState(false);

    const statusStyles = {
        'Approved': 'bg-emerald-500/10 text-emerald-500',
        'Pending': 'bg-amber-500/10 text-amber-500',
        'Rejected': 'bg-rose-500/10 text-rose-500',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Time Off & Leaves</h1>
                    <p className="text-sm text-text-muted font-medium">Request and manage your leave applications</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Request Leave
                </button>
            </div>

            {/* Leave Balance Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Casual Leaves', value: '4/12', color: 'text-blue-500' },
                    { label: 'Medical Leaves', value: '2/8', color: 'text-rose-500' },
                    { label: 'Paid Leaves', value: '10/15', color: 'text-emerald-500' },
                    { label: 'Sick Leaves', value: '1/5', color: 'text-amber-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value.split('/')[0]} <span className="text-sm text-text-muted font-bold">/ {s.value.split('/')[1]}</span></p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 text-left">
                {/* Requests Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-border/40 bg-surface/50">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">My Requests</h2>
                        </div>
                        <div className="divide-y divide-border/40">
                            {leaveRequests.map((req) => (
                                <div key={req.id} className="p-5 flex items-center justify-between hover:bg-surface-alt/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/10 ${req.status === 'Approved' ? 'bg-emerald-500/10' :
                                                req.status === 'Pending' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                                            }`}>
                                            {req.status === 'Approved' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                                                req.status === 'Pending' ? <Clock className="w-5 h-5 text-amber-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text">{req.type}</p>
                                            <p className="text-[11px] text-text-muted font-medium">{req.dates} • Applied {req.appliedOn}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${statusStyles[req.status]}`}>
                                            {req.status}
                                        </span>
                                        <button className="p-2 hover:bg-background rounded-lg transition-colors text-text-muted">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Important Info */}
                <div className="space-y-4">
                    <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-primary" />
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest">Policy Note</h2>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">Applications must be submitted at least <span className="font-bold">48 hours</span> in advance.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">Medical leaves require a <span className="font-bold">Doctor's Certificate</span> for more than 2 days.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">Planned vacations should be discussed with the <span className="font-bold">Outlet Manager</span> first.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
