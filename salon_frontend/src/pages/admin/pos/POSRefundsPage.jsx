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
                <h1 className="text-2xl font-bold text-text tracking-tight">Refunds</h1>
                <p className="text-sm text-text-secondary mt-1">Review and approve service refund requests.</p>
            </div>

            {/* Refunds Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                <th className="px-6 py-4">Refund ID</th>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_REFUNDS.map((ref) => (
                                <tr key={ref.id} className="hover:bg-surface/50 transition-colors text-sm">
                                    <td className="px-6 py-4 font-bold text-text">{ref.id}</td>
                                    <td className="px-6 py-4 text-primary font-medium underline cursor-pointer">{ref.inv}</td>
                                    <td className="px-6 py-4 font-medium text-text">{ref.customer}</td>
                                    <td className="px-6 py-4 text-text-secondary italic max-w-xs truncate">"{ref.reason}"</td>
                                    <td className="px-6 py-4 text-right font-bold text-error">{ref.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ref.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-green-50 text-green-600 border border-green-100'
                                            }`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {ref.status === 'Pending' ? (
                                            <button
                                                onClick={() => setSelectedRefund(ref)}
                                                className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm"
                                            >
                                                Take Action
                                            </button>
                                        ) : (
                                            <button className="p-2 text-text-muted hover:text-text hover:bg-surface rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
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
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text">Refund Review</h2>
                                <p className="text-sm text-text-secondary">{selectedRefund.id} for {selectedRefund.customer}</p>
                            </div>
                        </div>

                        <div className="bg-surface rounded-2xl p-4 mb-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Amount to Refund</span>
                                <span className="font-bold text-error">{selectedRefund.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Original Invoice</span>
                                <span className="font-medium text-primary underline">{selectedRefund.inv}</span>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Reason</p>
                                <p className="text-sm text-text-secondary italic">"{selectedRefund.reason}"</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <label className="text-sm font-bold text-text flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-primary" /> Admin Remark
                            </label>
                            <textarea
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Add internal remark or reason..."
                                className="w-full h-24 px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction('Rejected')}
                                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Reject
                            </button>
                            <button
                                onClick={() => handleAction('Approved')}
                                className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                        </div>
                        <button
                            onClick={() => setSelectedRefund(null)}
                            className="w-full mt-4 text-text-muted text-xs font-medium hover:text-text transition-colors"
                        >
                            Back to list
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
