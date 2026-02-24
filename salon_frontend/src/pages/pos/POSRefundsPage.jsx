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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight uppercase">Refunds</h1>
                <p className="text-sm text-text-secondary mt-1">Review and approve service refund requests.</p>
            </div>

            {/* Coming Soon Banner */}
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-none p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                    <p className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-tight">System Under Maintenance</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 font-bold">Automatic refund processing is being integrated with payment gateways. Data below is for training.</p>
                </div>
            </div>

            {/* Refunds Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto bg-background">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-alt text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border">
                                <th className="px-6 py-4">Refund ID</th>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {MOCK_REFUNDS.map((ref) => (
                                <tr key={ref.id} className="hover:bg-surface-alt/50 transition-colors text-sm">
                                    <td className="px-6 py-4 font-black text-text uppercase tracking-tighter">{ref.id}</td>
                                    <td className="px-6 py-4 text-primary font-bold hover:underline cursor-pointer">{ref.inv}</td>
                                    <td className="px-6 py-4 font-bold text-text">{ref.customer}</td>
                                    <td className="px-6 py-4 text-text-secondary italic max-w-xs truncate font-medium">"{ref.reason}"</td>
                                    <td className="px-6 py-4 text-right font-black text-rose-500">{ref.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-wider border ${ref.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'}`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ref.status === 'Pending' ? (
                                            <button
                                                onClick={() => setSelectedRefund(ref)}
                                                className="px-4 py-1.5 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-md shadow-primary/10"
                                            >
                                                Resolve
                                            </button>
                                        ) : (
                                            <button className="p-2 text-text-muted hover:text-text hover:bg-background transition-all"><Eye className="w-4 h-4" /></button>
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
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-none w-full max-w-md p-0 shadow-2xl animate-in zoom-in-95 duration-200 border border-border overflow-hidden">
                        <div className="flex items-center gap-4 p-6 bg-surface-alt border-b border-border">
                            <div className="w-12 h-12 flex items-center justify-center bg-primary text-white">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text uppercase tracking-tight">Refund Audit</h2>
                                <p className="text-[11px] font-bold text-text-secondary">{selectedRefund.id} • {selectedRefund.customer}</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-background border border-border p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-text-muted uppercase text-[10px] tracking-widest">Payout Amount</span>
                                    <span className="text-rose-500 font-black">{selectedRefund.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-text-muted uppercase text-[10px] tracking-widest">Original Reference</span>
                                    <span className="text-primary">{selectedRefund.inv}</span>
                                </div>
                                <div className="pt-2 border-t border-border/50">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1.5">Customer Claim</p>
                                    <p className="text-xs text-text italic font-medium">"{selectedRefund.reason}"</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Internal Remarks
                                </label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="State reason for approval or rejection..."
                                    className="w-full h-24 px-4 py-3 rounded-none bg-background border border-border text-sm text-text font-medium focus:outline-none focus:border-primary transition resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleAction('Rejected')}
                                    className="py-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-[11px] uppercase tracking-widest hover:bg-rose-500/20 transition flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                                <button
                                    onClick={() => handleAction('Approved')}
                                    className="py-3 bg-emerald-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Authorize
                                </button>
                            </div>

                            <button
                                onClick={() => setSelectedRefund(null)}
                                className="w-full text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-text transition-colors pb-2"
                            >
                                Cancel Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
