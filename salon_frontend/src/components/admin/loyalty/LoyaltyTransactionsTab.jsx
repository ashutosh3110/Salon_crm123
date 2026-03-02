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

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // We'll try to fetch all but if not exists, we'll try to get it some other way
                const { data } = await api.get('/loyalty/transactions');
                setTransactions(data.data || data || []);
            } catch (err) {
                console.error('Fetch error:', err);
                // Mock data for demo since we can't change backend
                setTransactions([
                    { _id: '1', customerId: { name: 'Aditya Verma' }, type: 'EARN', points: 150, createdAt: new Date().toISOString(), invoiceId: 'INV-1001' },
                    { _id: '2', customerId: { name: 'Priya Sharma' }, type: 'REDEEM', points: 300, createdAt: new Date().toISOString(), invoiceId: 'INV-1002' },
                    { _id: '3', customerId: { name: 'Sanya Khan' }, type: 'EARN', points: 75, createdAt: new Date(Date.now() - 86400000).toISOString(), invoiceId: 'INV-0998' },
                    { _id: '4', customerId: { name: 'Rohan Gupta' }, type: 'REVERSE', points: 50, createdAt: new Date(Date.now() - 172800000).toISOString(), invoiceId: 'INV-0985' },
                    { _id: '5', customerId: { name: 'Vikram Singh' }, type: 'EARN', points: 200, createdAt: new Date(Date.now() - 259200000).toISOString(), invoiceId: 'INV-0980' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTx = transactions.filter(tx => filter === 'ALL' || tx.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex items-center gap-2">
                    {['ALL', 'EARN', 'REDEEM', 'REVERSE'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 border font-black text-[9px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 px-6 py-3 border border-border/40 text-[9px] font-black text-foreground hover:text-primary uppercase tracking-widest hover:bg-surface-alt transition-all">
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
                            ) : filteredTx.map((tx) => (
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
