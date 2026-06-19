import { useState, useRef, useEffect } from 'react';
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
    Lock,
    Store,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePettyCash } from '../../contexts/PettyCashContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import CustomDropdown from '../../components/common/CustomDropdown';

export default function PettyCashPage() {
    const {
        transactions,
        currentBalance,
        categories,
        denominations,
        closingLogs,
        openDay,
        isOpenedToday,
        isClosedToday,
        businessDate,
        loading,
        error,
        refresh,
        addFund,
        addExpense,
        closeDay,
    } = usePettyCash();
    const { user } = useAuth();
    const { outlets, activeOutletId } = useBusiness();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const isReceptionist = user?.role === 'receptionist';
    const [selectedOutlet, setSelectedOutlet] = useState(isReceptionist ? (user?.outletId || user?.outlet?._id || user?.outlet || '') : (activeOutletId || ''));

    useEffect(() => {
        refresh({ date: selectedDate, outletId: selectedOutlet });
    }, [selectedDate, selectedOutlet, refresh]);

    const [activeTab, setActiveTab] = useState('Transactions');
    const [showTopUp, setShowTopUp] = useState(false);
    const [showExpense, setShowExpense] = useState(false);
    const [showClosing, setShowClosing] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Stats calculations
    const todayTransactions = transactions.filter(t => t.date === new Date().toISOString().split('T')[0]);
    
    const totalAdded = todayTransactions
        .filter(t => t.type === 'FUND_ADDED')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalSpent = transactions
        .filter(t => t.date === businessDate && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const overallTotalSpent = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading && !transactions.length && !closingLogs.length) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-slate-500">
                <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Loading petty cash…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {error ? (
                <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{error}</p>
                    <button type="button" onClick={() => refresh()} className="text-[11px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-800 underline">
                        Retry
                    </button>
                </div>
            ) : null}

            {/* 1. Header Section */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <Banknote className="w-7 h-7 text-emerald-500" />
                        Petty Cash 
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Operational Finance & Reconciliation</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-background p-1.5 rounded-2xl border border-border/30 shadow-sm">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none focus:border-primary/50"
                        />
                        {!isReceptionist && (
                            <CustomDropdown
                                value={selectedOutlet}
                                onChange={(val) => setSelectedOutlet(val)}
                                options={[
                                    { label: 'All Outlets', value: '' },
                                    ...outlets.map(o => ({ label: o.name, value: o._id }))
                                ]}
                                placeholder="All Outlets"
                                className="min-w-[160px]"
                                triggerClassName="!py-2 !bg-background !border-border/30 hover:!bg-muted"
                                icon={Store}
                            />
                        )}
                    </div>

                    {!isClosedToday && isOpenedToday && (
                        <div className="flex items-center gap-2 bg-background p-1.5 rounded-2xl border border-border/30 shadow-sm">
                            <button
                                onClick={() => setShowTopUp(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all"
                            >
                                <Plus className="w-4 h-4" /> Top-Up
                            </button>
                            <button
                                onClick={() => setShowExpense(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
                            >
                                <Minus className="w-4 h-4" /> Expense
                            </button>
                            <button
                                onClick={() => setShowClosing(true)}
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                            >
                                <Lock className="w-4 h-4" /> Close Day
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Lifecycle Views */}
            <AnimatePresence mode="wait">
                {!isOpenedToday ? (
                    <motion.div
                        key="start-day"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="bg-card border border-border/30 rounded-3xl p-12 text-center shadow-lg flex flex-col items-center justify-center min-h-[400px]"
                    >
                        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-6">
                            <Banknote className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Terminal Standby</h2>
                        <p className="text-muted-foreground mt-2 mb-8">System requires a verified day opening to begin financial logging.</p>

                        <div className="bg-muted/50 border border-border/30 p-6 rounded-2xl mb-8 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-muted-foreground">Opening Estimator</span>
                            </div>
                            <h4 className="text-3xl font-black text-foreground">₹{currentBalance.toLocaleString()}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider">Current Balance in system vault</p>
                        </div>

                      
                    </motion.div>
                ) : isClosedToday ? (
                     <motion.div
                        key="day-closed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center min-h-[400px] text-white relative overflow-hidden"
                    >
                        <div className="w-20 h-20 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Daily Reconciliation Finalized</h2>
                        <p className="text-slate-400 mt-2 mb-8">Terminal session is locked. Financial audits are frozen until tomorrow.</p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                                <p className="text-xs text-slate-400 mb-1">Closed At</p>
                                <h4 className="text-xl font-bold">{closingLogs[0]?.timestamp?.slice(11, 16) || '—'}</h4>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                                <p className="text-xs text-slate-400 mb-1">Final Balance</p>
                                <h4 className="text-xl font-bold text-emerald-400">₹{closingLogs[0]?.closingBalance.toLocaleString()}</h4>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">Session Integrity Verified</span>
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
                        {/* 2. Stats Grid - 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                        <Wallet className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Cash</p>
                                        <h3 className="text-2xl font-black text-foreground">₹{currentBalance.toLocaleString()}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Added Today</p>
                                        <h3 className="text-2xl font-black text-foreground">₹{totalAdded.toLocaleString()}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                                        <TrendingDown className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent Today</p>
                                        <h3 className="text-2xl font-black text-foreground">₹{totalSpent.toLocaleString()}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card p-5 rounded-3xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                        <Receipt className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Transactions Count</p>
                                        <h3 className="text-2xl font-black text-foreground">{filteredTransactions.length}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Section: Tabs + Search/Filter */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* 3. Tab Section - Pill Buttons */}
                            <div className="bg-background border border-border/30 rounded-2xl p-1.5 flex gap-1 shadow-sm w-fit">
                                {['Transactions', 'Closing Logs', 'Category Analysis'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                            activeTab === tab 
                                            ? 'bg-primary text-white shadow-md' 
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* 5. Search + Filter Glass Card */}
                            {activeTab === 'Transactions' && (
                                <div className="bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl p-2 flex gap-2 shadow-sm w-full md:w-auto">
                                    <div className="relative flex-1 md:w-56">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search ledger..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-background border border-border/30 rounded-xl text-xs font-medium focus:border-primary/50 outline-none"
                                        />
                                    </div>
                                    <CustomDropdown
                                        value={filterCategory}
                                        onChange={(val) => setFilterCategory(val)}
                                        options={[
                                            { label: 'All Categories', value: 'All' },
                                            ...categories.map(c => ({ label: c, value: c }))
                                        ]}
                                        placeholder="All Categories"
                                        className="min-w-[150px]"
                                        triggerClassName="!py-2 !bg-background !border-border/30 !rounded-xl"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className="bg-card border border-border/30 rounded-3xl p-6 shadow-sm min-h-[400px]">
                            {/* 4. Transactions Table -> Card List */}
                            {activeTab === 'Transactions' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTransactions.length === 0 ? (
                                        <div className="col-span-full py-16 text-center text-muted-foreground">
                                            No transactions found matching your criteria.
                                        </div>
                                    ) : (
                                        filteredTransactions.map(txn => (
                                            <div key={txn.id} className="bg-background border border-border/30 p-5 rounded-2xl hover:shadow-md transition-shadow group relative overflow-hidden">
                                                {/* Left border accent */}
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                                    txn.type === 'FUND_ADDED' ? 'bg-emerald-500' :
                                                    txn.type === 'DAY_OPEN' ? 'bg-primary' : 'bg-rose-500'
                                                }`} />
                                                
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md ${
                                                        txn.type === 'FUND_ADDED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                        txn.type === 'DAY_OPEN' ? 'bg-primary/10 text-primary' :
                                                        'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                        {txn.type === 'FUND_ADDED' ? 'FUND ADDED' : txn.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                                        {txn.timestamp?.slice(11, 16) || '—'}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-foreground line-clamp-1">{txn.description}</h4>
                                                
                                                <div className="flex items-end justify-between mt-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">{txn.staff}</p>
                                                        {txn.attachment && (
                                                            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                                                                <FileText className="w-3 h-3" /> Bill Attached
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-lg font-black ${
                                                            txn.type === 'FUND_ADDED' ? 'text-emerald-500' : 
                                                            txn.type === 'EXPENSE' ? 'text-rose-500' : 'text-foreground'
                                                        }`}>
                                                            {txn.type === 'FUND_ADDED' ? '+' : txn.type === 'EXPENSE' ? '-' : ''}
                                                            ₹{txn.amount.toLocaleString()}
                                                        </p>
                                                        <span className="text-[9px] text-muted-foreground font-semibold uppercase">Verified</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* 6. Closing Logs Timeline */}
                            {activeTab === 'Closing Logs' && (
                                <div className="max-w-3xl mx-auto py-4">
                                    {closingLogs.length === 0 ? (
                                        <div className="text-center py-16 text-muted-foreground font-medium">No closing logs available.</div>
                                    ) : (
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                                            {closingLogs.map((log, i) => (
                                                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-5 rounded-3xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-black text-primary uppercase tracking-widest">{log.date}</span>
                                                            <span className="text-[10px] text-muted-foreground font-bold">{log.timestamp?.slice(11,16)}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-lg font-bold text-foreground">₹{log.closingBalance.toLocaleString()} Closed</h4>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Verified by {log.verifiedBy}</p>
                                                                {log.discrepancy !== 0 && (
                                                                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">Diff: ₹{log.discrepancy.toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 7. Category Analysis Progress Bars */}
                            {activeTab === 'Category Analysis' && (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {categories.map(cat => {
                                            const catTransactions = transactions.filter(t => t.category === cat && t.type === 'EXPENSE');
                                            const catTotal = catTransactions.reduce((sum, t) => sum + t.amount, 0);
                                            const percentage = overallTotalSpent > 0 ? (catTotal / overallTotalSpent) * 100 : 0;

                                            return (
                                                <div key={cat} className="bg-background border border-border/30 p-5 rounded-3xl hover:shadow-xl transition-all duration-300 group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-sm font-bold text-foreground">{cat}</h4>
                                                        <span className="text-lg font-black text-foreground">₹{catTotal.toLocaleString()}</span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex text-xs font-mono text-muted-foreground/50 tracking-tighter">
                                                                {'█'.repeat(Math.round(percentage / 10))}
                                                                {'░'.repeat(10 - Math.round(percentage / 10))}
                                                            </div>
                                                            <span className="text-xs font-bold text-primary">{percentage.toFixed(0)}%</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-semibold mt-3 text-right">
                                                        {catTransactions.length} Transactions
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {overallTotalSpent === 0 && (
                                        <div className="text-center py-20 text-muted-foreground font-medium">
                                            Record expenses to see category analysis.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {showTopUp && (
                    <TopUpModal
                        onClose={() => setShowTopUp(false)}
                        onSave={async (data) => {
                            await addFund({ amount: data.amount, description: data.description, source: data.staff });
                            setShowTopUp(false);
                        }}
                    />
                )}
                {showExpense && (
                    <ExpenseModal
                        categories={categories}
                        onClose={() => setShowExpense(false)}
                        onSave={async (data) => {
                            await addExpense({ amount: data.amount, category: data.category, description: data.description, staff: data.staff, attachment: data.attachment });
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
                        onSave={async (log) => {
                            await closeDay(log);
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-3xl border border-border/30 p-8 text-left shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Fund Top-Up</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount (₹)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₹</span>
                            <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-10 pr-5 py-4 bg-background border border-border/30 rounded-2xl text-xl font-bold outline-none focus:border-primary/50" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Source / Given By</label>
                        <div className="relative">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="text" value={source} onChange={e => setSource(e.target.value)} className="w-full pl-10 pr-5 py-3 bg-background border border-border/30 rounded-2xl text-sm font-semibold outline-none focus:border-primary/50" />
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-border/30">
                    <button
                        disabled={!amount}
                        onClick={() => onSave({ amount: Number(amount), description: `Fund injection from ${source}`, category: 'Top-Up', staff: source })}
                        className="w-full py-4 text-white rounded-2xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-[#B4912B] to-yellow-500 shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Inject Funds
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ExpenseModal({ categories, onClose, onSave }) {
    const catOptions = categories?.length ? categories : ['Miscellaneous'];
    const [form, setForm] = useState({ amount: '', category: catOptions[0], description: '', staff: 'Reception' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setUploading(true);
            setTimeout(() => { setFile(selectedFile); setUploading(false); }, 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-3xl border border-border/30 p-8 text-left shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-foreground">Post Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-5 overflow-y-auto custom-scrollbar flex-1 pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Amount (₹)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-rose-500">₹</span>
                                <input required autoFocus type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full pl-12 pr-6 py-5 bg-background border border-border/30 rounded-2xl text-2xl font-black outline-none focus:border-rose-500/50 text-rose-500" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3.5 bg-background border border-border/30 rounded-2xl text-sm font-semibold outline-none focus:border-primary/50 appearance-none">
                                {catOptions.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Logged By</label>
                            <input type="text" value={form.staff} onChange={e => setForm({ ...form, staff: e.target.value })} className="w-full px-4 py-3.5 bg-background border border-border/30 rounded-2xl text-sm font-semibold outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description / Purpose</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-background border border-border/30 rounded-2xl text-sm font-semibold outline-none focus:border-primary/50 resize-none" placeholder="Details..."></textarea>
                    </div>

                    <div className="p-4 bg-background border border-border/30 rounded-2xl flex items-center gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl border border-border/20 ${file ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'} ${uploading ? 'animate-pulse' : ''}`}>
                            {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (file ? (file.type?.startsWith('image/') ? <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-xl" alt="Preview" /> : <CheckCircle2 className="w-6 h-6" />) : <Receipt className="w-6 h-6" />)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-foreground truncate">{uploading ? 'Processing...' : (file ? file.name : 'Attach Bill')}</p>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'JPEG/PDF Max 10MB'}</p>
                        </div>
                        {file ? (
                            <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold">Remove</button>
                        ) : (
                            <button disabled={uploading} onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs font-bold transition-colors">Upload</button>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/30 shrink-0 sticky bottom-0 bg-card">
                    <button
                        disabled={!form.amount || !form.description || uploading}
                        onClick={() => onSave({ ...form, amount: Number(form.amount), attachment: file?.name || null })}
                        className="w-full py-4 text-white rounded-2xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-rose-500 to-rose-600 shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        <Receipt className="w-5 h-5" /> Save Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function ClosingModal({ denominations, currentBalance, onClose, onSave, user }) {
    const [counts, setCounts] = useState(denominations.reduce((acc, d) => ({ ...acc, [d]: '' }), {}));

    const physicalTotal = Object.entries(counts).reduce((sum, [d, count]) => sum + (Number(d) * (Number(count) || 0)), 0);
    const discrepancy = physicalTotal - currentBalance;
    const isMatched = discrepancy === 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-2xl rounded-3xl border border-border/30 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                    <div className="p-6 border-b border-border/20 flex items-center gap-3 bg-card shrink-0">
                        <Banknote className="w-6 h-6 text-primary" />
                        <h2 className="text-lg font-bold text-foreground">Reconciliation</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                        {denominations.map(d => (
                            <div key={d} className="flex items-center gap-4 p-3 bg-card border border-border/30 rounded-2xl hover:border-primary/30 transition-all">
                                <div className="w-16">
                                    <span className="text-sm font-bold text-foreground">₹{d}</span>
                                </div>
                                <div className="flex-1">
                                    <input type="number" placeholder="0" value={counts[d]} onChange={e => setCounts({ ...counts, [d]: e.target.value })} className="w-full max-w-[80px] px-3 py-2 bg-background border border-border/30 rounded-xl text-sm font-bold text-center outline-none focus:border-primary/50" />
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-sm font-bold text-muted-foreground">₹{(d * (Number(counts[d]) || 0)).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:w-72 bg-card p-6 md:p-8 border-t md:border-t-0 md:border-l border-border/20 flex flex-col justify-between shrink-0">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-background/50 p-4 rounded-2xl border border-border/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">System Ledger</p>
                                <h4 className="text-2xl font-black text-foreground">₹{currentBalance.toLocaleString()}</h4>
                            </div>
                            <div className="bg-background/50 p-4 rounded-2xl border border-border/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">In-Hand Physical</p>
                                <h4 className={`text-2xl font-black ${isMatched ? 'text-emerald-500' : 'text-rose-500'}`}>₹{physicalTotal.toLocaleString()}</h4>
                            </div>
                        </div>

                        <div className={`p-4 rounded-2xl border ${isMatched ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                {isMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
                                <span className={`text-xs font-bold uppercase tracking-wider ${isMatched ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {isMatched ? 'Matched' : 'Discrepancy'}
                                </span>
                            </div>
                            {!isMatched && (
                                <p className="text-xs font-semibold text-muted-foreground mt-2">
                                    ₹{Math.abs(discrepancy).toLocaleString()} Error detected.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 mt-8">
                        <button
                            onClick={() => onSave({ openingBalance: currentBalance, closingBalance: physicalTotal, denominations: counts, discrepancy, verifiedBy: user?.name || 'Manager' })}
                            disabled={physicalTotal === 0}
                            className={`w-full py-4 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${isMatched ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/20' : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/20'}`}
                        >
                            {isMatched ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            Verify & Close
                        </button>
                        <button onClick={onClose} className="w-full py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider hover:text-foreground transition-colors">Cancel</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
