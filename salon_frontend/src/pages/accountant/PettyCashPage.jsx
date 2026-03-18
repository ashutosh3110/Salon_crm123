import { useState, useRef } from 'react';
import {
    Wallet,
    Plus,
    Minus,
    TrendingUp,
    TrendingDown,
    History,
    Receipt,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    X,
    FileText,
    Banknote,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePettyCash } from '../../contexts/PettyCashContext';
import { useAuth } from '../../contexts/AuthContext';

export default function PettyCashPage() {
    const {
        transactions,
        currentBalance,
        categories,
        addTransaction,
        denominations,
        addClosingLog,
        closingLogs,
        openDay,
        isOpenedToday,
        isClosedToday
    } = usePettyCash();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('Transactions');
    const [showTopUp, setShowTopUp] = useState(false);
    const [showExpense, setShowExpense] = useState(false);
    const [showClosing, setShowClosing] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Stats
    const totalAdded = transactions
        .filter(t => t.type === 'FUND_ADDED')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Petty Cash Terminal</h1>
                    <p className="text-sm text-text-muted font-medium italic">Operational Small-Item Finance & Reconciliation</p>
                </div>
                <div className="flex items-center gap-3">
                    {!isClosedToday && isOpenedToday && (
                        <>
                            <button
                                onClick={() => setShowTopUp(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                            >
                                <Plus className="w-3.5 h-3.5" /> Top-Up Fund
                            </button>
                            <button
                                onClick={() => setShowExpense(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5"
                            >
                                <Minus className="w-3.5 h-3.5" /> Record Bill
                            </button>
                            <button
                                onClick={() => setShowClosing(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-background border border-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all whitespace-nowrap shadow-xl shadow-primary/20"
                            >
                                <Lock className="w-4 h-4" /> Closing
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Lifecycle Views */}
            <AnimatePresence mode="wait">
                {!isOpenedToday ? (
                    <motion.div
                        key="start-day"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="bg-surface border border-border/40 rounded-[3rem] p-12 text-center shadow-2xl shadow-primary/5 flex flex-col items-center justify-center min-h-[500px]"
                    >
                        <div className="w-24 h-24 bg-primary/5 border border-primary/20 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                            <Banknote className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter max-w-md mx-auto">Petty Cash Terminal Standby</h2>
                        <p className="text-sm text-text-muted font-bold mt-3 mb-10 max-w-sm mx-auto uppercase italic tracking-widest leading-relaxed">System requires a verified day opening to begin financial logging.</p>
                        
                        <div className="bg-background/50 border border-border/20 p-6 rounded-3xl mb-10 text-left w-full max-w-xs">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-text-muted uppercase">Opening Estimator</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded">Live History</span>
                            </div>
                            <h4 className="text-2xl font-black text-text tracking-tighter">₹{currentBalance.toLocaleString()}</h4>
                            <p className="text-[9px] text-text-muted font-bold uppercase mt-1 italic italic">Current Balance in system vault</p>
                        </div>

                        <button 
                            onClick={() => openDay(user?.name)}
                            className="px-12 py-5 bg-primary text-background rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Calendar className="w-5 h-5" /> Initialize Daily Session
                        </button>
                    </motion.div>
                ) : isClosedToday ? (
                    <motion.div
                        key="day-closed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[500px] text-white relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center mb-8">
                            <Lock className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Daily Reconciliation Finalized</h2>
                        <p className="text-sm text-white/40 font-bold mt-3 mb-10 max-w-sm mx-auto uppercase tracking-widest italic">Terminal session is currently locked. Financial audits are frozen until tomorrow.</p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Closed At</p>
                                <h4 className="text-xl font-black uppercase">{closingLogs[0]?.timestamp.split('T')[1].substring(0, 5)}</h4>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Final Balance</p>
                                <h4 className="text-xl font-black uppercase text-emerald-400">₹{closingLogs[0]?.closingBalance.toLocaleString()}</h4>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Session Integrity Verified</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="active-dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                         {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-[2rem] border border-border/40 relative overflow-hidden group min-h-[160px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Wallet className="w-24 h-24 text-text" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 text-left">Cash Hand Balance</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-text tracking-tighter">₹{currentBalance.toLocaleString()}</h3>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[9px] font-black">
                                <TrendingUp className="w-2.5 h-2.5" /> Live
                            </div>
                        </div>
                    </div>

                    {closingLogs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/10">
                            <details className="group/notes">
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                        <Banknote className="w-3 h-3" /> Last Note Audit
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-text-muted group-open/notes:rotate-90 transition-transform" />
                                </summary>
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    {Object.entries(closingLogs[0].denominations)
                                        .filter(([_, count]) => count && count > 0)
                                        .map(([d, count]) => (
                                            <div key={d} className="bg-background/50 border border-border/5 p-1.5 rounded-lg text-center">
                                                <p className="text-[8px] font-black text-text-muted">₹{d}</p>
                                                <p className="text-[10px] font-black text-primary leading-none">x{count}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </details>
                        </div>
                    )}
                </div>

                <div className="bg-surface p-6 rounded-[2rem] border border-border/40 relative overflow-hidden">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Daily Inflow</p>
                    <h3 className="text-3xl font-black text-emerald-500">
                        ₹{transactions.filter(t => t.date === new Date().toISOString().split('T')[0] && t.type === 'FUND_ADDED').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-text-muted font-bold mt-2 uppercase italic tracking-widest text-left">Total funds injected today</p>
                </div>

                <div className="bg-surface p-6 rounded-[2rem] border border-border/40 relative overflow-hidden">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Daily Outflow</p>
                    <h3 className="text-3xl font-black text-rose-500">
                        ₹{transactions.filter(t => t.date === new Date().toISOString().split('T')[0] && t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-text-muted font-bold mt-2 uppercase italic tracking-widest text-left">Total expenses logged today</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col min-h-[500px] bg-surface rounded-[2.5rem] border border-border/40 overflow-hidden text-left">
                <div className="px-8 py-6 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        {['Transactions', 'Closing Logs', 'Category Audit'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[11px] font-black uppercase tracking-widest py-1 transition-all relative ${activeTab === tab ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'Transactions' && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search ledger..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-background/50 border border-border/40 rounded-xl text-xs font-bold focus:border-primary/50 outline-none w-48"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 bg-background/50 border border-border/40 rounded-xl text-[10px] font-black uppercase outline-none focus:border-primary/50 appearance-none min-w-[120px]"
                            >
                                <option>All</option>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-8 flex-1 overflow-x-auto">
                    {activeTab === 'Transactions' && (
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <th className="pb-4 font-black">Transaction ID</th>
                                    <th className="pb-4 font-black">Entity / Category</th>
                                    <th className="pb-4 font-black text-right">Debit / Credit</th>
                                    <th className="pb-4 font-black text-center">Reference</th>
                                    <th className="pb-4 font-black text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {filteredTransactions.map((txn) => (
                                    <tr key={txn.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="py-5">
                                            <p className="text-xs font-black text-text">{txn.id}</p>
                                            <p className="text-[9px] text-text-muted font-bold mt-1 uppercase italic">{txn.timestamp.split('T')[0]}</p>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === 'FUND_ADDED' ? 'bg-emerald-500/10 text-emerald-500' : txn.type === 'DAY_OPEN' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {txn.type === 'FUND_ADDED' ? <TrendingUp className="w-4 h-4" /> : txn.type === 'DAY_OPEN' ? <Calendar className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-text">{txn.description}</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-wider">{txn.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            {txn.type !== 'DAY_OPEN' && (
                                                <p className={`text-sm font-black ${txn.type === 'FUND_ADDED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {txn.type === 'FUND_ADDED' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-5 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="text-[9px] font-black px-2 py-1 bg-surface font-mono rounded border border-border/20 text-text-muted uppercase">
                                                    {txn.staff}
                                                </span>
                                                {txn.attachment && (
                                                    <div className="flex items-center gap-1 text-emerald-500 font-black text-[8px] uppercase tracking-tighter">
                                                        <FileText className="w-2.5 h-2.5" /> Bill Attached
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 text-right">
                                            <span className={`text-[10px] font-black ${txn.type === 'DAY_OPEN' ? 'text-primary bg-primary/10' : 'text-emerald-500 bg-emerald-500/10'} px-2 py-0.5 rounded-md uppercase tracking-tighter`}>
                                                {txn.type === 'DAY_OPEN' ? 'Initialized' : 'Verified'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'Closing Logs' && (
                        <div className="py-10 text-left px-8">
                            <div className="w-16 h-16 bg-surface border border-border/20 rounded-2xl flex items-center justify-center mb-4">
                                <History className="w-8 h-8 text-text-muted/30" />
                            </div>
                            <h3 className="text-sm font-black text-text uppercase italic">Historical Reconciliation</h3>
                            <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-widest">Audit logs with denomination breakdown</p>

                            <div className="mt-8 space-y-4 max-w-2xl">
                                {closingLogs.length === 0 ? (
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-10">No logs recorded yet</p>
                                ) : (
                                    closingLogs.map(log => {
                                        const isExpanded = expandedLogId === log.id;
                                        return (
                                            <div key={log.id} className="bg-background border border-border/10 rounded-[2rem] overflow-hidden transition-all duration-300">
                                                <button
                                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                                    className="w-full flex items-center justify-between p-5 hover:bg-surface/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.discrepancy === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {log.discrepancy === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-xs font-black text-text">{log.date} <span className="text-[9px] text-text-muted ml-2">{log.timestamp.split('T')[1].substring(0, 5)}</span></p>
                                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-wider mt-1">
                                                                Balance: ₹{log.closingBalance.toLocaleString()}
                                                                {log.discrepancy !== 0 && (
                                                                    <span className="text-rose-500 ml-2">// Diff: ₹{log.discrepancy.toLocaleString()}</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`p-2 rounded-lg bg-surface border border-border/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                                        <ArrowRight className="w-4 h-4 text-text-muted" />
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-6 pb-6 border-t border-border/5 pt-4 bg-surface/20"
                                                        >
                                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 text-left">Denomination Audit</p>
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                                {Object.entries(log.denominations).filter(([_, count]) => count && count > 0).map(([d, count]) => (
                                                                    <div key={d} className="flex items-center justify-between p-2.5 bg-background/40 border border-border/5 rounded-xl">
                                                                        <span className="text-[10px] font-black text-text">₹{d}</span>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[9px] text-text-muted font-bold">x</span>
                                                                            <span className="text-[10px] font-black text-primary">{count}</span>
                                                                        </div>
                                                                        <span className="text-[10px] font-black text-text-muted ml-1">₹{(Number(d) * Number(count)).toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                                {Object.values(log.denominations).every(c => !c || c === 0) && (
                                                                    <p className="col-span-full text-[9px] font-bold text-text-muted italic py-2">No individual note mapping recorded.</p>
                                                                )}
                                                            </div>
                                                            <div className="mt-4 pt-4 border-t border-border/5 flex justify-between items-center">
                                                                <p className="text-[9px] font-black text-text-muted uppercase italic">Verified By: {log.verifiedBy}</p>
                                                                <div className="px-3 py-1 bg-surface border border-border/40 rounded-lg text-[9px] font-black uppercase">Official Record</div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Category Audit' && (
                        <div className="py-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map(cat => {
                                    const catTransactions = transactions.filter(t => t.category === cat && t.type === 'EXPENSE');
                                    const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
                                    const percentage = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={cat}
                                            className="p-6 bg-background/40 border border-border/10 rounded-[2rem] hover:border-primary/30 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-surface border border-border/20 rounded-xl">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cat}</p>
                                                    <p className="text-lg font-black text-text mt-0.5">₹{catTotal.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-tighter">
                                                    <span className="text-text-muted">Budget Utilization</span>
                                                    <span className="text-primary">{percentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-text-muted font-bold italic text-right mt-1">
                                                    {catTransactions.length} Recorded Transactions
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {totalSpent === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Neural spending data not found</p>
                                    <p className="text-xs text-text-muted font-medium mt-1 italic">Record your first bill to begin categorical analysis.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showTopUp && (
                    <TopUpModal
                        onClose={() => setShowTopUp(false)}
                        onSave={(data) => {
                            addTransaction({ ...data, type: 'FUND_ADDED' });
                            setShowTopUp(false);
                        }}
                    />
                )}
                {showExpense && (
                    <ExpenseModal
                        categories={categories}
                        onClose={() => setShowExpense(false)}
                        onSave={(data) => {
                            addTransaction({ ...data, type: 'EXPENSE' });
                            setShowExpense(false);
                        }}
                    />
                )}
                {showClosing && (
                    <ClosingModal
                        denominations={denominations}
                        currentBalance={currentBalance}
                        onClose={() => setShowClosing(false)}
                        user={user}
                        onSave={(log) => {
                            addClosingLog(log);
                            setShowClosing(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Modals ──────────────────────────────────────────────────

function TopUpModal({ onClose, onSave }) {
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('Owner');

    if (!onSave) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface w-full max-w-sm rounded-[2rem] border border-border/40 p-8 text-left">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-text uppercase">Fund Top-Up</h2>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Amount (₹)</label>
                        <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-5 py-4 bg-background border border-border/40 rounded-2xl text-lg font-black outline-none focus:border-primary/50" placeholder="0.00" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Source / Given By</label>
                        <input type="text" value={source} onChange={e => setSource(e.target.value)} className="w-full px-5 py-3 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                    </div>
                    <button
                        onClick={() => onSave({ amount: Number(amount), description: `Fund injection from ${source}`, category: 'Top-Up', staff: source })}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                    >
                        Inject Funds
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ExpenseModal({ categories, onClose, onSave }) {
    const [form, setForm] = useState({ amount: '', category: categories[0], description: '', staff: 'Reception' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setUploading(true);
            setTimeout(() => {
                setFile(selectedFile);
                setUploading(false);
            }, 1200);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface w-full max-w-md rounded-[2.5rem] border border-border/40 p-8 text-left">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Post Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Amount (₹)</label>
                            <input required autoFocus type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full px-6 py-5 bg-background border border-border/40 rounded-[1.5rem] text-2xl font-black outline-none focus:border-rose-500/50 text-rose-500" placeholder="0.00" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none focus:border-primary/50">
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Logged By</label>
                            <input type="text" value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} className="w-full px-4 py-3 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Description / Purpose</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-5 py-3 bg-background border border-border/40 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 resize-none" placeholder="Details of the expense..."></textarea>
                    </div>

                    {/* Upload Section */}
                    <div className="p-4 bg-background border border-border/10 rounded-2xl flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf"
                        />
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all overflow-hidden border border-border/10 ${file ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'} ${uploading ? 'animate-pulse' : ''}`}>
                            {uploading ? (
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                file ? (
                                    file.type.startsWith('image/') ?
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" /> :
                                        <CheckCircle2 className="w-5 h-5 transition-transform scale-110" />
                                ) : <Receipt className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            <p className="text-[10px] font-black text-text uppercase truncate">
                                {uploading ? 'Processing File...' : (file ? file.name : 'Attach Bill Image')}
                            </p>
                            <p className="text-[9px] text-text-muted font-bold mt-0.5 uppercase tracking-widest">
                                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'JPEG or PDF · Max 10MB'}
                            </p>
                        </div>
                        {file ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-surface border border-border/40 rounded-lg text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all disabled:opacity-50"
                            >
                                {uploading ? 'Wait...' : 'Upload'}
                            </button>
                        )}
                    </div>

                    <button
                        disabled={!form.amount || !form.description || uploading}
                        onClick={() => onSave({ ...form, amount: Number(form.amount), attachment: file?.name || null })}
                        className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.01] active:scale-95 transition-all mt-4 disabled:opacity-50"
                    >
                        Save Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ClosingModal({ denominations, currentBalance, onClose, onSave, user }) {
    const [counts, setCounts] = useState(denominations.reduce((acc, d) => ({ ...acc, [d]: '' }), {}));

    const physicalTotal = Object.entries(counts).reduce((sum, [d, count]) => {
        return sum + (Number(d) * (Number(count) || 0));
    }, 0);

    const discrepancy = physicalTotal - currentBalance;
    const isMatched = discrepancy === 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface w-full max-w-xl rounded-[2rem] border border-border/40 shadow-2xl relative overflow-hidden text-left flex flex-col md:flex-row max-h-[90vh]">

                {/* Left: Denomination Counter (Scrollable) */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-5 border-b border-border/10 flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-primary" />
                        <h2 className="text-sm font-black text-text uppercase tracking-tight">Reconciliation</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar h-[350px]">
                        {denominations.map(d => (
                            <div key={d} className="flex items-center gap-3 p-2 bg-background/50 border border-border/5 rounded-xl hover:border-primary/20 transition-all">
                                <div className="w-12">
                                    <span className="text-[11px] font-black text-text italic">₹{d}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={counts[d]}
                                        onChange={e => setCounts({ ...counts, [d]: e.target.value })}
                                        className="w-full max-w-[60px] px-2 py-1.5 bg-background border border-border/20 rounded-lg text-xs font-black text-center outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="w-20 text-right">
                                    <span className="text-[11px] font-black text-text-muted">₹{(d * (Number(counts[d]) || 0)).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Summary Panel */}
                <div className="md:w-60 bg-background/50 p-6 border-l border-border/10 flex flex-col justify-between gap-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">System Ledger</p>
                                <h4 className="text-xl font-black text-text">₹{currentBalance.toLocaleString()}</h4>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">In-Hand</p>
                                <h4 className={`text-xl font-black ${isMatched ? 'text-emerald-500' : 'text-rose-500'}`}>₹{physicalTotal.toLocaleString()}</h4>
                            </div>
                        </div>

                        <div className={`p-3 rounded-xl border ${isMatched ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {isMatched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                                <span className={`text-[9px] font-black uppercase tracking-wider ${isMatched ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isMatched ? 'Matched' : 'Discrepancy'}
                                </span>
                            </div>
                            {!isMatched && (
                                <p className="text-[10px] font-bold text-text-secondary leading-tight">
                                    ₹{Math.abs(discrepancy).toLocaleString()} Error detected.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => onSave({
                                openingBalance: currentBalance,
                                closingBalance: physicalTotal,
                                denominations: counts,
                                discrepancy,
                                verifiedBy: user?.name || 'Manager'
                            })}
                            disabled={physicalTotal === 0}
                            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2 ${isMatched ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-text text-background'}`}
                        >
                            {isMatched ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            Verify & Close
                        </button>
                        <button onClick={onClose} className="w-full py-2 text-text-muted text-[9px] font-black uppercase tracking-widest hover:text-text">Cancel</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
