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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-black text-text uppercase tracking-tight">reversal protocols</h1>
                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Review and authorize service credit requests</p>
            </div>

            {/* Coming Soon Banner */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-none p-6 flex items-center gap-5">
                <div className="w-12 h-12 rounded-none bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">feature phase: alpha</p>
                    <p className="text-[10px] font-bold text-amber-700/70 mt-1 uppercase tracking-wider">Refund processing architecture is under active development. Current data is simulated.</p>
                </div>
            </div>

            {/* Refunds Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                <th className="px-8 py-5">REFUND ID</th>
                                <th className="px-8 py-5">INVOICE LINK</th>
                                <th className="px-8 py-5">REQUESTER</th>
                                <th className="px-8 py-5">RATIONALE</th>
                                <th className="px-8 py-5 text-right">CREDIT VAL</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">OPERATIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_REFUNDS.map((ref) => (
                                <tr key={ref.id} className="hover:bg-surface-alt transition-all text-sm group">
                                    <td className="px-8 py-5 font-black text-text uppercase tracking-widest">{ref.id}</td>
                                    <td className="px-8 py-5 text-primary font-black uppercase tracking-widest cursor-pointer hover:underline">{ref.inv}</td>
                                    <td className="px-8 py-5 font-black text-text uppercase tracking-widest">{ref.customer}</td>
                                    <td className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-tight max-w-xs truncate">"{ref.reason}"</td>
                                    <td className="px-8 py-5 text-right font-black text-red-600 tracking-tight">{ref.amount}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${ref.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {ref.status === 'Pending' ? (
                                            <button
                                                onClick={() => setSelectedRefund(ref)}
                                                className="px-6 py-2.5 bg-primary text-white rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                                            >
                                                AUTH REQUEST
                                            </button>
                                        ) : (
                                            <button className="w-9 h-9 flex items-center justify-center rounded-none text-text-muted border border-transparent hover:border-primary/20 hover:bg-surface-alt hover:text-text transition-all"><Eye className="w-4 h-4" /></button>
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
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-surface rounded-none border border-border w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-14 h-14 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <RefreshCcw className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text uppercase tracking-widest">Protocol Override</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{selectedRefund.id} | SUBJECT: {selectedRefund.customer}</p>
                            </div>
                        </div>

                        <div className="bg-surface-alt border border-border p-6 mb-8 space-y-4 shadow-inner">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                                <span className="text-text-muted">CREDIT REVERSAL VALUE</span>
                                <span className="text-red-600">{selectedRefund.amount}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                                <span className="text-text-muted">SOURCE INVOICE NODE</span>
                                <span className="text-primary hover:underline cursor-pointer">{selectedRefund.inv}</span>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em] mb-2">CLAIM RATIONALE</p>
                                <p className="text-[11px] font-bold text-text uppercase leading-relaxed">"{selectedRefund.reason}"</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <label className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-primary" /> AUTH REMARK / AUDIT LOG
                            </label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Documentation required for protocol override..."
                                className="w-full h-32 px-5 py-4 rounded-none border border-border bg-surface text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all resize-none placeholder:text-text-muted/40 shadow-inner"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction('Rejected')}
                                className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                            >
                                <XCircle className="w-4 h-4" /> DENY REQUEST
                            </button>
                            <button
                                onClick={() => handleAction('Approved')}
                                className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 className="w-4 h-4" /> AUTHORIZE
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedRefund(null)}
                            className="w-full mt-8 text-text-muted text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-all text-center"
                        >
                            CANCEL INSPECTION
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
