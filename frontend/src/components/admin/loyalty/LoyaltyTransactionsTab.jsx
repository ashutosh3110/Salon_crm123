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
    Search,
    MapPin,
    ChevronDown,
    X
} from 'lucide-react';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';
import CustomDropdown from '../../common/CustomDropdown';

export default function LoyaltyTransactionsTab() {
    const { outlets, activeOutletId, setActiveOutletId } = useBusiness();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/loyalty/transactions', {
                    params: {
                        page,
                        limit: 25,
                        type: filter,
                        from: fromDate || undefined,
                        to: toDate || undefined,
                        outletId: activeOutletId || undefined
                    }
                });
                const rows = data?.data || data || [];
                setTransactions(Array.isArray(rows) ? rows : []);
            } catch { setTransactions([]); } finally { setLoading(false); }
        };
        fetchTransactions();
    }, [filter, page, fromDate, toDate, activeOutletId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                
                {/* Filter Pills */}
                <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2 w-fit flex items-center gap-2 shadow-sm shrink-0 no-scrollbar max-w-full" style={{ overflowX: 'auto' }}>
                    {['ALL', 'EARN', 'REDEEM'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all whitespace-nowrap ${filter === f
                                ? 'bg-[#B4912B] text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Outlet Filter */}
                    <div className="flex-1 lg:flex-none lg:w-48 shrink-0">
                        <CustomDropdown
                            icon={Filter}
                            value={activeOutletId || 'all'}
                            onChange={(val) => setActiveOutletId(val === 'all' ? null : val)}
                            options={[
                                { value: 'all', label: 'All Outlets' },
                                ...(outlets?.map(o => ({
                                    value: o._id || o.id,
                                    label: o.name
                                })) || [])
                            ]}
                            placeholder="All Outlets"
                            className="!w-full h-11 font-bold"
                        />
                    </div>

                    {/* Date Pickers */}
                    <div className="flex items-center gap-2 relative">
                        <input 
                            type="date" 
                            value={fromDate} 
                            onChange={(e) => { setPage(1); setFromDate(e.target.value); }} 
                            className="h-11 px-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#B4912B] dark:focus:border-[#B4912B] shadow-sm transition-all uppercase" 
                        />
                        <input 
                            type="date" 
                            value={toDate} 
                            onChange={(e) => { setPage(1); setToDate(e.target.value); }} 
                            className="h-11 px-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-[#B4912B] dark:focus:border-[#B4912B] shadow-sm transition-all uppercase" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
                            <tr>
                                <Th>EVENT TIMESTAMP</Th>
                                <Th>IDENTIFIED CLIENT</Th>
                                <Th>OPERATION</Th>
                                <Th>VOLUME (PTS)</Th>
                                <Th>REFERENCE</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center bg-white dark:bg-slate-800/30">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <img src="/vector image 3.png" alt="No transactions found" className="w-56 h-56 object-contain mix-blend-multiply dark:opacity-50 opacity-90" />
                                            <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id || tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">{new Date(tx.createdAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                                                    {(tx.customerId?.name || 'A')[0]}
                                                </div>
                                                <span className="text-sm font-black text-slate-900 dark:text-slate-200">{tx.customerId?.name || 'Anonymous Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><TypeBadge type={tx.type || 'EARN'} /></td>
                                        <td className="px-6 py-5">
                                            <span className={`text-sm font-black tracking-wide ${tx.type === 'EARN' ? 'text-emerald-500' : 'text-[#B4912B]'}`}>
                                                {tx.type === 'EARN' ? '+' : '-'}{Math.abs(tx.points)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <FileText size={12} className="text-slate-400 dark:text-slate-500" />
                                                {tx.invoiceId || 'SYSTEM_GEN'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer Pagination */}
                <div className="border-t border-slate-100 dark:border-slate-700/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Showing {transactions.length} records
                    </span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#B4912B] bg-[#B4912B]/10 text-[#B4912B] font-bold text-xs">
                                {page}
                            </button>
                            <button onClick={() => setPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Th({ children }) {
    return <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{children}</th>;
}

function TypeBadge({ type }) {
    const styles = {
        EARN: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        REDEEM: 'bg-[#B4912B]/10 text-[#B4912B]',
        REVERSE: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
    };
    const dotStyles = {
        EARN: 'bg-emerald-500',
        REDEEM: 'bg-[#B4912B]',
        REVERSE: 'bg-rose-500'
    };
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${styles[type] || styles.EARN}`}>
            <span className={`w-1 h-1 rounded-full ${dotStyles[type] || dotStyles.EARN}`}></span>
            {type}
        </div>
    );
}
