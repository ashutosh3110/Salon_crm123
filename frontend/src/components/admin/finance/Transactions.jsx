import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowDownUp, 
    Plus, 
    Search, 
    Filter, 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    ChevronDown,
    RefreshCw, 
    X, 
    DollarSign, 
    Wallet, 
    CreditCard, 
    Info 
} from 'lucide-react';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

function todayIso() {
    return new Date().toISOString().split('T')[0];
}

function CustomDropdown({ value, onChange, options, placeholder, icon: Icon }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div className="relative w-full sm:w-auto" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full sm:min-w-[140px] gap-2 bg-surface border border-border/40 rounded-xl px-3 py-1.5 shadow-sm text-xs transition-colors hover:bg-surface-alt active:scale-[0.98]"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-text-muted" />}
                    <span className="font-bold text-foreground">
                        {options.find(o => o.value === value)?.label || placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-full sm:w-48 bg-surface border border-border/40 rounded-xl shadow-lg z-[100] overflow-hidden"
                    >
                        <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                            <button
                                onClick={() => { onChange(''); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${!value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-alt hover:text-primary'}`}
                            >
                                {placeholder}
                            </button>
                            {options.map(o => (
                                <button
                                    key={o.value}
                                    onClick={() => { onChange(o.value); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${value === o.value ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-alt hover:text-primary'}`}
                                >
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Transactions({ outletId }) {
    const { outlets = [], fetchOutlets } = useBusiness();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterAccount, setFilterAccount] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');

    // Modal state
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // Form inputs
    const [txnMode, setTxnMode] = useState('income'); // 'income' | 'expense' | 'transfer' | 'equity'
    const [category, setCategory] = useState('Other Income');
    const [amount, setAmount] = useState('');
    const [accountType, setAccountType] = useState('cash');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(todayIso);
    const [formOutletId, setFormOutletId] = useState(() => (outletId && outletId !== 'all' ? outletId : ''));

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!outlets?.length && fetchOutlets) fetchOutlets();
    }, [outlets?.length, fetchOutlets]);

    useEffect(() => {
        if (outletId && outletId !== 'all') {
            setFormOutletId(outletId);
        }
    }, [outletId]);

    // Load categories based on mode
    useEffect(() => {
        if (txnMode === 'income') {
            setCategory('Other Income');
            setAccountType('cash');
            setPaymentMethod('cash');
        } else if (txnMode === 'expense') {
            setCategory('Other Expense');
            setAccountType('cash');
            setPaymentMethod('cash');
        } else if (txnMode === 'transfer') {
            setCategory('Bank Deposit'); // Bank Deposit (Cash -> Bank) or Bank Withdrawal (Bank -> Cash)
            setAccountType('cash');
            setPaymentMethod('cash');
        } else if (txnMode === 'equity') {
            setCategory('Owner Investment');
            setAccountType('cash');
            setPaymentMethod('cash');
        }
    }, [txnMode]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: 15,
                type: filterType || undefined,
                accountType: filterAccount || undefined,
                category: filterCategory || undefined,
                startDate: filterStart || undefined,
                endDate: filterEnd || undefined,
                outletId: outletId || undefined
            };
            const res = await api.get('/finance/transactions', { params });
            if (res.data?.success) {
                setTransactions(res.data.data.results || []);
                setTotalPages(res.data.data.pages || 1);
                setTotalResults(res.data.data.total || 0);
            }
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Failed to load transactions');
        } finally {
            setLoading(false);
        }
    }, [page, filterType, filterAccount, filterCategory, filterStart, filterEnd, outletId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [outletId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setFormError('Sahi amount darj karein.');
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            let finalType = txnMode;
            let finalCategory = category;
            
            if (txnMode === 'transfer') {
                // For transfers, categories are 'Bank Deposit' or 'Bank Withdrawal'
                finalType = 'transfer';
                finalCategory = category; 
            } else if (txnMode === 'equity') {
                // Equity changes are mapped to income/expense under categories
                finalType = category === 'Owner Investment' ? 'income' : 'expense';
                finalCategory = category;
            }

            await api.post('/finance/transactions', {
                type: finalType,
                category: finalCategory,
                amount: parseFloat(amount),
                accountType,
                paymentMethod,
                description: description.trim(),
                date,
                outletId: formOutletId || undefined
            });

            setIsOpen(false);
            // Reset form
            setAmount('');
            setDescription('');
            setDate(todayIso);
            setTxnMode('income');
            // Refresh
            setPage(1);
            load();
        } catch (err) {
            setFormError(err?.response?.data?.message || err.message || 'Transaction save nahi ho saki');
        } finally {
            setSaving(false);
        }
    };

    const handleClearFilters = () => {
        setFilterType('');
        setFilterAccount('');
        setFilterCategory('');
        setFilterStart('');
        setFilterEnd('');
        setPage(1);
    };

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Finance Ledger & Transactions</h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">
                            Manage cash flow, bank transactions, transfers, and owner investments.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Record Transaction
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="px-8 py-5 border-b border-border bg-surface-alt flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-wider mb-2 sm:mb-0">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters:</span>
                </div>

                <CustomDropdown
                    value={filterType}
                    onChange={(v) => { setFilterType(v); setPage(1); }}
                    options={[
                        { value: 'income', label: 'Income' },
                        { value: 'expense', label: 'Expense' }
                    ]}
                    placeholder="All Types"
                />

                <CustomDropdown
                    value={filterAccount}
                    onChange={(v) => { setFilterAccount(v); setPage(1); }}
                    options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'bank', label: 'Bank' }
                    ]}
                    placeholder="All Accounts"
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        value={filterStart}
                        placeholder="Start Date"
                        onChange={(e) => { setFilterStart(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-surface border border-border/40 text-foreground rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/10 w-full sm:w-auto"
                    />
                    <span className="text-text-muted text-xs font-bold text-center sm:text-left">to</span>
                    <input
                        type="date"
                        value={filterEnd}
                        placeholder="End Date"
                        onChange={(e) => { setFilterEnd(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-surface border border-border/40 text-foreground rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/10 w-full sm:w-auto"
                    />
                </div>

                {(filterType || filterAccount || filterCategory || filterStart || filterEnd) && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider ml-auto"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Table Container */}
            <div className="px-8 mt-6">
                {error && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-24 flex flex-col justify-center items-center gap-3 text-text-muted text-sm font-bold">
                        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        <span>Loading transactions...</span>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-20 border border-dashed border-border rounded-3xl flex flex-col justify-center items-center text-center p-8 bg-surface-alt">
                        <ArrowDownUp className="w-12 h-12 text-text-muted mb-4 opacity-55" />
                        <h4 className="text-base font-bold text-text">No Transactions Found</h4>
                        <p className="text-xs text-text-secondary max-w-sm mt-1">
                            Is range ya filters me koi entry nahi mili. Nayi transactions add karein ya filters badlein.
                        </p>
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface/30 border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Outlet</th>
                                        <th className="px-6 py-4">Account</th>
                                        <th className="px-6 py-4">Payment Method</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 text-xs font-semibold text-text-secondary">
                                    {transactions.map((t) => {
                                        const isIncome = t.type === 'income';
                                        return (
                                            <tr key={t._id} className="hover:bg-surface/10 transition-colors">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                    {new Date(t.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold">
                                                    {t.type === 'transfer' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase bg-blue-50 text-blue-700 border border-blue-200/50">
                                                            Transfer
                                                        </span>
                                                    ) : t.category === 'Owner Investment' || t.category === 'Owner Withdrawal' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase bg-violet-50 text-violet-700 border border-violet-200/50">
                                                            Invest
                                                        </span>
                                                    ) : t.type === 'income' ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                                            Income
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase bg-rose-50 text-rose-700 border border-rose-200/50">
                                                            Expense
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-text whitespace-nowrap">
                                                    {t.category}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-text-secondary">
                                                        {outlets.find(o => String(o._id || o.id) === String(t.outletId))?.name || 'All Outlets / Not Specified'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 capitalize whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5 font-bold">
                                                        {t.accountType === 'cash' ? (
                                                            <Wallet className="w-3.5 h-3.5 text-orange-500" />
                                                        ) : (
                                                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                                        )}
                                                        {t.accountType === 'cash' ? 'Cash' : 'Bank'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 uppercase font-bold whitespace-nowrap">
                                                    {t.paymentMethod?.replace('_', ' ')}
                                                </td>
                                                 <td className="px-6 py-4 text-right whitespace-nowrap">
                                                     <span className={`font-bold text-sm ${
                                                         isIncome ? 'text-emerald-600' : 'text-rose-600'
                                                     }`}>
                                                         {isIncome ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                                                     </span>
                                                 </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="px-6 py-4 bg-surface/10 border-t border-border flex justify-between items-center">
                            <span className="text-xs font-bold text-text-muted">
                                Showing {transactions.length} of {totalResults} entries
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-1.5 rounded-lg border border-border bg-white text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface/30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="flex items-center text-xs font-bold px-3 text-text-secondary">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1.5 rounded-lg border border-border bg-white text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface/30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Record New Transaction Modal */}
            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
                            onClick={() => setIsOpen(false)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-surface border border-border/40 w-full max-w-lg shadow-2xl rounded-3xl relative flex flex-col max-h-[90vh] transition-all text-left"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-border/40 flex justify-between items-center bg-surface rounded-t-3xl">
                                    <div>
                                        <h3 className="text-base font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                            <ArrowDownUp className="w-5 h-5 text-primary" />
                                            Record New Transaction
                                        </h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase mt-1 tracking-wider">Lejhar entries manual add karein.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-text-muted hover:text-rose-500 rounded-full hover:bg-surface-alt transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                                    {formError && (
                                        <div className="p-3 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
                                            {formError}
                                        </div>
                                    )}

                                    {/* Mode Selector tabs */}
                                    <div className="grid grid-cols-4 gap-2 p-1 bg-surface-alt border border-border/40 rounded-xl">
                                        {[
                                            { key: 'income', label: 'Income' },
                                            { key: 'expense', label: 'Expense' },
                                            { key: 'transfer', label: 'Transfer' },
                                            { key: 'equity', label: 'Invest' }
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setTxnMode(item.key)}
                                                className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                                                    txnMode === item.key
                                                        ? 'bg-surface text-foreground shadow-sm border border-border/40'
                                                        : 'text-text-muted hover:text-foreground'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Dynamic Category select */}
                                    {txnMode === 'income' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="Other Income" className="bg-surface">Other Income</option>
                                                <option value="Service Revenue" className="bg-surface">Service Revenue (Non-POS)</option>
                                                <option value="Product Sale" className="bg-surface">Product Sale (Non-POS)</option>
                                            </select>
                                        </div>
                                    )}

                                    {txnMode === 'expense' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="Other Expense" className="bg-surface">Other Expense</option>
                                                <option value="Rent" className="bg-surface">Rent</option>
                                                <option value="Utilities" className="bg-surface">Utilities</option>
                                                <option value="Salaries & Wages" className="bg-surface">Salaries & Wages</option>
                                                <option value="Marketing" className="bg-surface">Marketing Expense</option>
                                            </select>
                                        </div>
                                    )}

                                    {txnMode === 'transfer' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Transfer Mode</label>
                                            <select
                                                value={category}
                                                onChange={(e) => {
                                                    setCategory(e.target.value);
                                                    if (e.target.value === 'Bank Deposit') {
                                                        setAccountType('cash');
                                                        setPaymentMethod('cash');
                                                    } else {
                                                        setAccountType('bank');
                                                        setPaymentMethod('bank_transfer');
                                                    }
                                                }}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="Bank Deposit" className="bg-surface">Deposit Cash to Bank (Cash → Bank)</option>
                                                <option value="Bank Withdrawal" className="bg-surface">Withdraw Cash from Bank (Bank → Cash)</option>
                                            </select>
                                        </div>
                                    )}

                                    {txnMode === 'equity' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Owner Action</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="Owner Investment" className="bg-surface">Owner Investment (Equity Inflow)</option>
                                                <option value="Owner Withdrawal" className="bg-surface">Owner Withdrawal (Drawings Outflow)</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Amount */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-text-muted">₹</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    required
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="1,000"
                                                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={date}
                                                required
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Mode */}
                                    {txnMode !== 'transfer' && (
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Payment Mode</label>
                                            <select
                                                value={accountType === 'cash' ? 'cash' : 'online'}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'cash') {
                                                        setAccountType('cash');
                                                        setPaymentMethod('cash');
                                                    } else {
                                                        setAccountType('bank');
                                                        setPaymentMethod('online');
                                                    }
                                                }}
                                                className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="cash" className="bg-surface">Cash</option>
                                                <option value="online" className="bg-surface">Online (UPI / QR / Card / Bank Transfer)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Help Info Box for Bank transfers */}
                                    {txnMode === 'transfer' && (
                                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-2xl flex items-start gap-2.5 text-xs font-bold leading-normal">
                                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p>
                                                Iss double-entry transfer se automatically do records banenge: Cash account se outflow aur Bank account me inflow (ya vice-versa).
                                            </p>
                                        </div>
                                    )}

                                    {/* Outlet select dropdown */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Outlet</label>
                                        <select
                                            value={formOutletId}
                                            onChange={(e) => setFormOutletId(e.target.value)}
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                                        >
                                            <option value="" className="bg-surface">All Outlets / Not Specified</option>
                                            {outlets.map((o) => (
                                                <option key={o._id || o.id} value={o._id || o.id} className="bg-surface">
                                                    {o.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Remarks</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="e.g. Rent payment, Electricity bill, Staff salary..."
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-xs font-medium text-foreground focus:border-primary outline-none resize-none placeholder-text-muted"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-border/40 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 py-3 border border-border/40 text-text-muted text-xs font-bold rounded-xl hover:bg-surface-alt transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 py-3 bg-text text-surface hover:bg-primary text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-55"
                                        >
                                            {saving ? 'Saving...' : 'Save Entry'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
