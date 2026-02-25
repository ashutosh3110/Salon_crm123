import { useState } from 'react';
import {
    RefreshCcw,
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertCircle,
    Eye
} from 'lucide-react';

const MOCK_REFUNDS = [
    { id: 'REF-001', inv: 'INV-2026-003', customer: 'Rohit K.', amount: '₹850', reason: 'Customer not satisfied with service', status: 'Pending', requestedAt: '21 Feb 2026, 01:20 PM' },
    { id: 'REF-002', inv: 'INV-2025-998', customer: 'Kiran P.', amount: '₹1,500', reason: 'Duplicate payment', status: 'Approved', requestedAt: '20 Feb 2026, 11:45 AM' },
];

export default function POSRefundsPage() {
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [remark, setRemark] = useState('');

    const handleAction = (status) => {
        alert(`Refund ${selectedRefund.id} ${status} with remark: ${remark}`);
        setSelectedRefund(null);
        setRemark('');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Reversal Protocol</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-rose-500 animate-pulse" />
                        Audit Control Node • Refund Management
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-none flex items-center justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 -mr-12 -mt-12 rotate-45 pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-rose-800 uppercase tracking-[0.2em] flex items-center gap-2">
                            ERR_NODE: MODULE_NOT_INITIALIZED
                            <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] animate-pulse">RESTRICTED_ACCESS</span>
                        </p>
                        <p className="text-[10px] text-rose-700/70 font-bold uppercase tracking-wider mt-1 leading-relaxed max-w-xl">
                            The advanced refund engine is currently in stage-2 synchronization. Manual override through standard terminal is restricted to level-4 executives only.
                        </p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-rose-800 uppercase tracking-widest px-6 py-3 border border-rose-500/20 active:scale-95 transition-all bg-white/50 hover:bg-white relative z-10 shadow-sm">Initialize Sync</button>
            </div>

            {/* Refunds Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="px-8 py-6 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                        <RefreshCcw className="w-4 h-4 text-primary" /> Active Request Stream
                    </h3>
                </div>
                <div className="overflow-x-auto bg-background flex-1">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                <th className="px-8 py-5">REFUND_NODE_ID</th>
                                <th className="px-8 py-5">REF_INVOICE</th>
                                <th className="px-8 py-5">SOURCE_ENTITY</th>
                                <th className="px-8 py-5">REASON_PAYLOAD</th>
                                <th className="px-8 py-5 text-right">VAL_REVERSAL</th>
                                <th className="px-8 py-5">SIG_STATUS</th>
                                <th className="px-8 py-5 text-right">OPS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {MOCK_REFUNDS.map((ref) => (
                                <tr key={ref.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-8 py-5 font-black text-text uppercase tracking-tighter whitespace-nowrap">{ref.id}</td>
                                    <td className="px-8 py-5 text-primary text-[11px] font-black uppercase tracking-widest hover:underline cursor-pointer">{ref.inv}</td>
                                    <td className="px-8 py-5 font-black text-text text-[11px] uppercase tracking-tight">{ref.customer}</td>
                                    <td className="px-8 py-5 text-text-muted text-[10px] font-black uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity max-w-xs truncate">"{ref.reason}"</td>
                                    <td className="px-8 py-5 text-right font-black text-rose-600 tracking-tighter text-base italic leading-none shrink-0">-{ref.amount}</td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${ref.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                            {ref.status === 'Pending' ? 'PENDING_AUTH' : 'SIG_VERIFIED'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {ref.status === 'Pending' ? (
                                            <button
                                                onClick={() => setSelectedRefund(ref)}
                                                className="px-6 py-2 bg-text text-background font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-sm"
                                            >
                                                Auth_Override
                                            </button>
                                        ) : (
                                            <button className="p-2 border border-border bg-surface hover:bg-primary hover:border-primary hover:text-white transition-all group active:scale-95 shadow-sm">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval Modal */}
            {selectedRefund && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-none w-full max-w-lg p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-border overflow-hidden">
                        <div className="flex items-center gap-6 p-8 bg-surface-alt border-b border-border relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rotate-45 pointer-events-none" />
                            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center relative z-10">
                                <RefreshCcw className="w-8 h-8 text-primary animate-spin-slow" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Audit_Action_Loop</p>
                                <h2 className="text-2xl font-black text-text uppercase tracking-tight italic">Verify_Action</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">{selectedRefund.id} • {selectedRefund.customer}</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-background">
                            <div className="bg-surface border border-border p-6 space-y-4 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <span>Payout_Liability</span>
                                    <span className="text-rose-600 font-black text-lg tracking-tighter">{selectedRefund.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <span>Source_Reference</span>
                                    <span className="text-primary font-black">{selectedRefund.inv}</span>
                                </div>
                                <div className="pt-4 border-t border-border/50">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-3">Claim_Payload</p>
                                    <p className="text-xs text-text italic font-bold leading-relaxed">"{selectedRefund.reason}"</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-none bg-primary opacity-40" /> Internal_Remarks
                                </label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Enter authorization justification..."
                                    className="w-full h-32 px-5 py-4 rounded-none bg-surface border border-border text-[11px] text-text font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleAction('Rejected')}
                                    className="py-4 bg-rose-500/5 text-rose-500 border border-rose-500/20 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-500/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <XCircle className="w-5 h-5" /> REJECT
                                </button>
                                <button
                                    onClick={() => handleAction('Approved')}
                                    className="py-4 bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> AUTHORIZE
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedRefund(null)}
                                className="w-full text-text-muted text-[10px] font-black uppercase tracking-[0.4em] hover:text-text transition-all py-2 opacity-40 hover:opacity-100"
                            >
                                [ ABORT_REVIEW ]
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
