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
import mockApi from '../../../services/mock/mockApi';

export default function POSPaymentsPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const params = dateFilter === 'today' ? '?date=today&limit=100' : '?limit=100';
                const res = await mockApi.get(`/invoices${params}`);
                const list = res?.data?.results || res?.data?.data?.results || [];
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
            { mode: 'Cash Channel', key: 'cash', value: summary.cash.total, count: summary.cash.count, icon: Banknote },
            { mode: 'Card Protocol', key: 'card', value: summary.card.total, count: summary.card.count, icon: CreditCard },
            { mode: 'Digital UPI Vector', key: 'online', value: summary.online.total, count: summary.online.count, icon: Smartphone },
            { mode: 'Unpaid Loop', key: 'unpaid', value: summary.unpaid.total, count: summary.unpaid.count, icon: Ban },
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

    if (loading && invoices.length === 0) return <div className="p-20 text-center font-black uppercase tracking-widest text-text-muted">Loading Treasury Data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="text-left font-black">
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight italic">Treasury Surveillance</h1>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Revenue Channel Audit & Verification [OFFLINE ENABLED]</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setDateFilter('today')} className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-widest border ${dateFilter === 'today' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-muted hover:bg-surface-alt'}`}>Current Cycle</button>
                    <button onClick={() => setDateFilter('all')} className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-widest border ${dateFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-muted hover:bg-surface-alt'}`}>Historical Log</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {paymentSummary.map((item, i) => (
                    <div key={i} className="bg-white border border-border p-6 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="flex items-center gap-5 relative z-10 text-left">
                            <div className="w-12 h-12 border border-border flex items-center justify-center shrink-0 bg-surface-alt text-text group-hover:bg-primary group-hover:text-white transition-all">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 italic">{item.mode}</p>
                                <h3 className="text-xl font-black text-text tracking-tighter">₹{item.value.toLocaleString()}</h3>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1 opacity-60">{item.count} PAYLOADS</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-border overflow-hidden text-left shadow-sm">
                <div className="px-8 py-5 border-b border-border bg-surface-alt/50 text-left font-black uppercase tracking-widest text-[11px]">Revenue Auth Ledger</div>
                <div className="overflow-x-auto text-left">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/50 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                                <th className="px-8 py-5">TXN-ID</th>
                                <th className="px-8 py-5">Temporal-Index</th>
                                <th className="px-8 py-5">Origin-Entity</th>
                                <th className="px-8 py-5">Auth-Protocol</th>
                                <th className="px-8 py-5 text-right">Payload Value</th>
                                <th className="px-8 py-5">Validation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-left">
                            {invoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-surface-alt transition-all text-sm group text-left">
                                    <td className="px-8 py-5 font-black text-primary uppercase italic">{inv.invoiceNumber}</td>
                                    <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-tight"><Clock className="w-3 h-3 inline mr-1" /> {formatTime(inv.createdAt)}</td>
                                    <td className="px-8 py-5 font-black text-text uppercase tracking-widest">{inv.clientId?.name || 'Walk-in'}</td>
                                    <td className="px-8 py-5">
                                        <span className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none italic">
                                            {getMethodIcon(inv.paymentMethod)}
                                            {inv.paymentMethod?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-text tracking-tighter">₹{inv.total?.toLocaleString()}</td>
                                    <td className="px-8 py-5 italic font-black text-[10px] text-emerald-600 uppercase">Verified</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
