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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Treasury Log</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                        Authenticated Financial Node Status
                    </p>
                </div>
            </div>

            {/* Mode Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paymentSummary.map((item, i) => (
                    <div key={i} className="bg-surface p-6 rounded-none border border-border shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rotate-45 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 text-primary" />
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{item.mode} PROTOCOL</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${item.trendColor.replace('text-', 'bg-').replace('500', '500/10')} ${item.trendColor} border-current/20`}>
                                {item.trend}
                            </span>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h3 className="text-3xl font-black text-text tracking-tighter uppercase">₹{item.value.toLocaleString()}</h3>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">LVL_{i + 1} • {item.count} SEGMENTS</p>
                            </div>
                            <div className="mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                <Sparkline />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaction List */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="px-8 py-6 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" /> Multi-Mode Stream
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
                            Live_Inflow
                        </div>
                    </div>
                </div>
                {invoices.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-background">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Log sequence empty • No active transfers</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-background">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-8 py-5">NODE_ID</th>
                                    <th className="px-8 py-5 whitespace-nowrap">TIMESTAMP_UTC</th>
                                    <th className="px-8 py-5">SOURCE_ENTITY</th>
                                    <th className="px-8 py-5">TRANSFER_PRTCL</th>
                                    <th className="px-8 py-5 text-right">VAL_CREDIT</th>
                                    <th className="px-8 py-5">SIG_STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors group">
                                        <td className="px-8 py-5 font-black text-primary uppercase tracking-tighter whitespace-nowrap">{inv.invoiceNumber}</td>
                                        <td className="px-8 py-5 text-text-muted text-[11px] font-bold uppercase tracking-tight flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 opacity-40" /> {formatTime(inv.createdAt)}
                                        </td>
                                        <td className="px-8 py-5 font-black text-text text-[11px] uppercase tracking-tight">{inv.clientId?.name || 'ANN_GUEST'}</td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-2 font-black text-text text-[10px] uppercase tracking-widest">
                                                <div className="p-1 bg-surface-alt border border-border group-hover:bg-background transition-colors">
                                                    {getMethodIcon(inv.paymentMethod)}
                                                </div>
                                                {inv.paymentMethod === 'online' ? 'UPI_INT' : `${inv.paymentMethod?.toUpperCase()}_HND`}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-text tracking-tighter text-base">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-none ${inv.paymentStatus === 'paid' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                                                {inv.paymentStatus === 'paid' ? 'SIG_VERIFIED' : 'PENDING_AUTH'}
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
