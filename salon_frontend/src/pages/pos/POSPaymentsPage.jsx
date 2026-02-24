import { useMemo } from 'react';
import {
    CreditCard, Smartphone, Banknote, Ban,
    Clock, CheckCircle2
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/posData';

export default function POSPaymentsPage() {
    const invoices = MOCK_INVOICES;

    const paymentSummary = useMemo(() => {
        const summary = { cash: { total: 0, count: 0 }, card: { total: 0, count: 0 }, online: { total: 0, count: 0 }, unpaid: { total: 0, count: 0 } };
        invoices.forEach(inv => {
            const method = inv.paymentMethod || 'cash';
            if (summary[method]) {
                summary[method].total += inv.total || 0;
                summary[method].count += 1;
            }
        });
        return [
            { mode: 'CASH', key: 'cash', value: summary.cash.total, count: summary.cash.count, icon: Banknote, trend: '↑ 12.5%', trendColor: 'text-emerald-500' },
            { mode: 'CARD', key: 'card', value: summary.card.total, count: summary.card.count, icon: CreditCard, trend: '↑ 3.8%', trendColor: 'text-emerald-500' },
            { mode: 'UPI / ONLINE', key: 'online', value: summary.online.total, count: summary.online.count, icon: Smartphone, trend: '↑ 5.2%', trendColor: 'text-emerald-500' },
            { mode: 'UNPAID', key: 'unpaid', value: summary.unpaid.total, count: summary.unpaid.count, icon: Ban, trend: '↓ 1.4%', trendColor: 'text-rose-500' },
        ];
    }, [invoices]);

    const Sparkline = () => (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const formatTime = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'online': return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
            case 'card': return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
            case 'unpaid': return <Ban className="w-3.5 h-3.5 text-orange-500" />;
            default: return <Banknote className="w-3.5 h-3.5 text-green-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight uppercase">Payments</h1>
                <p className="text-sm text-text-secondary mt-1">Track financial transactions and payment modes.</p>
            </div>

            {/* Mode Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {paymentSummary.map((item, i) => (
                    <div key={i} className="bg-surface py-4 px-5 rounded-none border border-border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 text-text-muted" />
                                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{item.mode}</p>
                            </div>
                            <span className={`text-[11px] font-bold ${item.trendColor}`}>{item.trend}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-text tracking-tight">₹{item.value.toLocaleString()}</h3>
                                <p className="text-[10px] text-text-muted mt-0.5">{item.count} Transactions</p>
                            </div>
                            <div className="text-emerald-500/50">
                                <Sparkline />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction List */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-surface">
                    <h3 className="font-bold text-text uppercase tracking-widest text-xs">Transaction Log</h3>
                </div>
                {invoices.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm bg-background">No transactions found.</div>
                ) : (
                    <div className="overflow-x-auto bg-background">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-surface-alt text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Payment Mode</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors text-sm">
                                        <td className="px-6 py-4 font-bold text-primary">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-text-secondary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTime(inv.createdAt)}</td>
                                        <td className="px-6 py-4 font-medium text-text">{inv.clientId?.name || 'Walk-in'}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 font-medium text-text capitalize">
                                                {getMethodIcon(inv.paymentMethod)}
                                                {inv.paymentMethod === 'online' ? 'UPI' : inv.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-text">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[11px] font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-500/20' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 border border-orange-100 dark:border-orange-500/20'}`}>
                                                <CheckCircle2 className="w-3 h-3" />
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
