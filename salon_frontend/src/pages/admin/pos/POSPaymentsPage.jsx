import {
    CreditCard,
    Smartphone,
    Banknote,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';

const paymentSummary = [
    { mode: 'Cash', value: '₹12,400', count: 15, icon: Banknote, color: 'text-orange-600 bg-orange-50' },
    { mode: 'UPI', value: '₹22,150', count: 12, icon: Smartphone, color: 'text-blue-600 bg-blue-50' },
    { mode: 'Card', value: '₹10,730', count: 5, icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
];

const transactions = [
    { id: 'TXN-9821', time: '11:30 AM', invoice: 'INV-2026-001', amount: '₹1,250', mode: 'UPI', status: 'Success' },
    { id: 'TXN-9822', time: '12:15 PM', invoice: 'INV-2026-002', amount: '₹2,400', mode: 'Card', status: 'Success' },
    { id: 'TXN-9823', time: '12:45 PM', invoice: 'INV-2026-024', amount: '₹1,200', mode: 'UPI', status: 'Failed' },
    { id: 'TXN-9824', time: '01:05 PM', invoice: 'INV-2026-003', amount: '₹850', mode: 'Cash', status: 'Success' },
];

export default function POSPaymentsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight">Payments</h1>
                <p className="text-sm text-text-secondary mt-1">Track financial transactions and payment modes.</p>
            </div>

            {/* Mode Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {paymentSummary.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{item.mode}</p>
                            <h3 className="text-xl font-bold text-text">{item.value}</h3>
                            <p className="text-[10px] text-text-secondary mt-0.5">{item.count} Transactions</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-bold text-text">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Payment Mode</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-surface/50 transition-colors text-sm">
                                    <td className="px-6 py-4 font-medium text-text">{txn.id}</td>
                                    <td className="px-6 py-4 text-text-secondary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {txn.time}</td>
                                    <td className="px-6 py-4 text-primary font-medium cursor-pointer hover:underline">{txn.invoice}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 font-medium text-text">
                                            {txn.mode === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-blue-500" />}
                                            {txn.mode === 'Card' && <CreditCard className="w-3.5 h-3.5 text-purple-500" />}
                                            {txn.mode === 'Cash' && <Banknote className="w-3.5 h-3.5 text-green-500" />}
                                            {txn.mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-text">{txn.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${txn.status === 'Success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {txn.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
