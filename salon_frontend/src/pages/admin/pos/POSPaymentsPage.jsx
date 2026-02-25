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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Treasury Surveillance</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Revenue channel tracking and verification logs</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDateFilter('today')}
                        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${dateFilter === 'today' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:bg-surface-alt'}`}
                    >
                        <Calendar className="w-4 h-4" /> Current Cycle
                    </button>
                    <button
                        onClick={() => setDateFilter('all')}
                        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${dateFilter === 'all' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:bg-surface-alt'}`}
                    >
                        <Filter className="w-4 h-4" /> Historical Data
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6 bg-surface-alt/10">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Querying Database Modules...</p>
                </div>
            ) : (
                <>
                    {/* Mode Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {paymentSummary.map((item, i) => (
                            <div key={i} className="bg-surface rounded-none border border-border p-6 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-none rotate-45 pointer-events-none transition-transform group-hover:scale-110" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`w-12 h-12 rounded-none border border-border flex items-center justify-center shrink-0 bg-surface-alt transition-colors group-hover:bg-primary group-hover:text-white`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{item.mode}</p>
                                        <h3 className="text-xl font-black text-text tracking-tight">₹{item.value.toLocaleString()}</h3>
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">{item.count} PAYLOADS</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Transaction List */}
                    <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50">
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Revenue Auth Ledger</h3>
                        </div>
                        {invoices.length === 0 ? (
                            <div className="py-24 text-center bg-surface-alt/10">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Zero entries detected in query results</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-alt/50 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                            <th className="px-8 py-5">TXN ID</th>
                                            <th className="px-8 py-5">Temporal Index</th>
                                            <th className="px-8 py-5">Origin Entity</th>
                                            <th className="px-8 py-5">Protocol</th>
                                            <th className="px-8 py-5 text-right">Value</th>
                                            <th className="px-8 py-5">Validation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {invoices.map((inv) => (
                                            <tr key={inv._id} className="hover:bg-surface-alt transition-all group text-sm">
                                                <td className="px-8 py-5 font-black text-primary uppercase tracking-widest">{inv.invoiceNumber}</td>
                                                <td className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-tight flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {formatTime(inv.createdAt)}</td>
                                                <td className="px-8 py-5 font-black text-text uppercase tracking-widest">{inv.clientId?.name || 'Walk-in Entity'}</td>
                                                <td className="px-8 py-5">
                                                    <span className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">
                                                        {getMethodIcon(inv.paymentMethod)}
                                                        {inv.paymentMethod === 'online' ? 'UPI VECTOR' : `${inv.paymentMethod.toUpperCase()} CHANNEL`}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-text tracking-tight">₹{inv.total?.toLocaleString()}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
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
