import { useState, useEffect, useMemo } from 'react';
import {
    CreditCard,
    Smartphone,
    Banknote,
    Clock,
    CheckCircle2,
    Ban,
    Loader2,
    Calendar,
    Filter,
    Receipt
} from 'lucide-react';
import api from '../../../services/api';

export default function POSPaymentsPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const params = dateFilter === 'today' ? '?date=today&limit=100' : '?limit=100';
                const res = await api.get(`/invoices${params}`);
                const list = res?.data?.results || [];
                setInvoices(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error('Failed to fetch payments:', err);
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [dateFilter]);

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
            { mode: 'Cash', key: 'cash', value: summary.cash.total, count: summary.cash.count, icon: Banknote, color: 'text-green-600 bg-green-50 border-green-100' },
            { mode: 'Card', key: 'card', value: summary.card.total, count: summary.card.count, icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { mode: 'UPI / Online', key: 'online', value: summary.online.total, count: summary.online.count, icon: Smartphone, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { mode: 'Unpaid', key: 'unpaid', value: summary.unpaid.total, count: summary.unpaid.count, icon: Ban, color: 'text-orange-600 bg-orange-50 border-orange-100' },
        ];
    }, [invoices]);

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Payments</h1>
                    <p className="text-sm text-text-secondary mt-1">Track financial transactions and payment modes.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateFilter('today')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${dateFilter === 'today' ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:bg-secondary'}`}
                    >
                        <Calendar className="w-4 h-4" /> Today
                    </button>
                    <button
                        onClick={() => setDateFilter('all')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${dateFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:bg-secondary'}`}
                    >
                        <Filter className="w-4 h-4" /> All Time
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Mode Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {paymentSummary.map((item, i) => (
                            <div key={i} className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 group hover:shadow-md transition-all border-border`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{item.mode}</p>
                                    <h3 className="text-xl font-bold text-text">₹{item.value.toLocaleString()}</h3>
                                    <p className="text-[10px] text-text-secondary mt-0.5">{item.count} Transactions</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="font-bold text-text">Transaction Log</h3>
                        </div>
                        {invoices.length === 0 ? (
                            <div className="py-16 text-center text-text-muted text-sm">No transactions found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                            <th className="px-6 py-4">Invoice</th>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Client</th>
                                            <th className="px-6 py-4">Payment Mode</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {invoices.map((inv) => (
                                            <tr key={inv._id} className="hover:bg-surface/50 transition-colors text-sm">
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
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
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
                </>
            )}
        </div>
    );
}
