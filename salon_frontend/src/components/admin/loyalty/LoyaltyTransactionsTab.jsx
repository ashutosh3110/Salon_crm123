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
import mockApi from '../../../services/mock/mockApi';

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
            setLoading(true);
            try {
                const { data } = await mockApi.get('/loyalty/transactions', {
                    params: { page, limit: 25, type: filter, from: fromDate || undefined, to: toDate || undefined }
                });
                const rows = data?.data || data || [];
                setTransactions(Array.isArray(rows) ? rows : []);
                setMeta(data?.meta || { page: 1, totalPages: 1, total: rows.length, limit: 25 });
            } catch (err) { setTransactions([]); } finally { setLoading(false); }
        };
        fetchTransactions();
    }, [filter, page, fromDate, toDate]);

    return (
        <div className="space-y-6 italic text-left">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    {['ALL', 'EARN', 'REDEEM'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
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
            </div>

            <div className="bg-surface border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-alt border-b border-border/40">
                            <tr>
                                <Th>Event Timestamp</Th>
                                <Th>Identified Client</Th>
                                <Th>Operation</Th>
                                <Th>Volume (PTS)</Th>
                                <Th>Reference</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-sm font-black italic opacity-40">Accessing Ledger Data...</td></tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id || tx._id} className="hover:bg-surface-alt/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="text-[10px] font-bold text-foreground uppercase tracking-tighter opacity-80">{new Date().toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary" />
                                                <span className="text-sm font-black text-foreground italic tracking-tight">{tx.customerId?.name || 'Anonymous Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><TypeBadge type={tx.type || 'EARN'} /></td>
                                        <td className="px-6 py-5">
                                            <span className={`text-lg font-black italic tracking-tighter ${tx.type === 'EARN' ? 'text-emerald-500' : 'text-primary'}`}>
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
                                ))
                            )}
                        </tbody>
                    </table>
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
        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border leading-none ${styles[type] || styles.EARN}`}>
            {type}
        </span>
    );
}
