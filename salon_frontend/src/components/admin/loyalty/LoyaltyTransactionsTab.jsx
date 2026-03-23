import { useState, useEffect } from 'react';
import {
    ArrowDownUp,
    TrendingUp,
    TrendingDown,
    History,
    Filter,
    Download,
    User,
    FileText,
    Search
} from 'lucide-react';
import api from '../../../services/api';


export default function LoyaltyTransactionsTab() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 25 });
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await api.get('/loyalty/transactions', {
                    params: {
                        page,
                        limit: 25,
                        type: filter,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                    },
                });
                setTransactions(data?.data || []);
                setMeta(data?.meta || { page: 1, totalPages: 1, total: 0, limit: 25 });
            } catch (err) {
                console.error('Fetch error:', err);
                setTransactions([]);
                setMeta({ page: 1, totalPages: 1, total: 0, limit: 25 });
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [filter, page, fromDate, toDate]);

    const downloadCsv = () => {
        const header = ['Date', 'Customer', 'Type', 'Points', 'Reference'];
        const rows = transactions.map((tx) => [
            new Date(tx.createdAt).toLocaleString('en-IN'),
            tx.customerId?.name || 'Anonymous Customer',
            tx.type || '',
            String(Math.abs(Number(tx.points || 0))),
            tx.invoiceId || 'SYSTEM_GEN',
        ]);
        const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loyalty-transactions-page-${page}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex items-center gap-2">
                    {['ALL', 'EARN', 'REDEEM', 'REVERSE'].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(1);
                            }}
                            className={`px-6 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} className="h-10 px-2 border border-border/40 bg-surface text-xs" />
                    <input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} className="h-10 px-2 border border-border/40 bg-surface text-xs" />
                </div>
                <button onClick={downloadCsv} className="flex items-center gap-2 px-6 py-3 border border-border/40 text-[9px] font-black text-foreground hover:text-primary uppercase tracking-widest hover:bg-surface-alt transition-all">
                    <Download size={14} /> EXPORT LEDGER
                </button>
            </div>

            <div className="bg-surface border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border/40">
                                <Th>Event Timestamp</Th>
                                <Th>Identified Client</Th>
                                <Th>Operation</Th>
                                <Th>Volume (PTS)</Th>
                                <Th>Reference</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Accessing Ledger Data...</p>
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx._id} className="hover:bg-surface-alt/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="text-[10px] font-bold text-foreground uppercase tracking-tighter opacity-80">{new Date(tx.createdAt).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary" />
                                            <span className="text-sm font-black text-foreground italic tracking-tight">{tx.customerId?.name || 'Anonymous Customer'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <TypeBadge type={tx.type} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-lg font-black italic tracking-tighter ${tx.type === 'EARN' ? 'text-emerald-500' : (tx.type === 'REDEEM' ? 'text-primary' : 'text-rose-500')
                                            }`}>
                                            {tx.type === 'EARN' ? '+' : '-'}{Math.abs(tx.points)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-alt px-3 py-1.5 border border-border/40 w-fit">
                                            <FileText size={10} className="text-primary" />
                                            {tx.invoiceId || 'SYSTEM_GEN'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="p-4 border border-border/30 flex items-center justify-between">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Page {meta.page} of {meta.totalPages} / {meta.total} entries</p>
                <div className="flex gap-2">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-2 border border-border/40 text-xs disabled:opacity-40">Prev</button>
                    <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages} className="px-3 py-2 border border-border/40 text-xs disabled:opacity-40">Next</button>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">{children}</th>;
}

function TypeBadge({ type }) {
    const styles = {
        EARN: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        REDEEM: 'bg-primary/10 text-primary border-primary/30',
        REVERSE: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
    };
    return (
        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border leading-none ${styles[type]}`}>
            {type}
        </span>
    );
}
