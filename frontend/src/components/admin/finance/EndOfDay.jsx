import React, { useState, useEffect, useCallback } from 'react';
import {
    Lock,
    Unlock,
    CheckCircle2,
    Wallet,
    CreditCard,
    PieChart,
    Download,
    ArrowRight,
    ShieldCheck,
    RefreshCw,
    Calendar,
    History,
    FileText,
    TrendingUp,
    TrendingDown,
    Coins,
    AlertCircle,
    UserCheck
} from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

function formatInr(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '₹0';
    return `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function todayIso() {
    return new Date().toISOString().split('T')[0];
}

export default function EndOfDay({ outletId }) {
    const { user } = useAuth();
    const [businessDate, setBusinessDate] = useState(todayIso);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [notes, setNotes] = useState('');
    const [openingCash, setOpeningCash] = useState('0');
    const [actualCash, setActualCash] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [denominations, setDenominations] = useState({
        500: '',
        200: '',
        100: '',
        50: '',
        20: '',
        10: '',
        5: '',
        2: '',
        1: ''
    });

    const handleDenominationChange = (value, denom) => {
        const updated = {
            ...denominations,
            [denom]: value === '' ? '' : Math.max(0, parseInt(value) || 0)
        };
        setDenominations(updated);

        let total = 0;
        Object.entries(updated).forEach(([d, count]) => {
            if (count !== '') {
                total += parseInt(d) * (parseInt(count) || 0);
            }
        });
        setActualCash(String(total));
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { date: businessDate };
            if (outletId && outletId !== 'all') {
                params.outletId = outletId;
            }
            const res = await api.get('/finance/eod/summary', { params });
            setData(res.data?.data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'EOD load failed');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [businessDate, outletId]);

    useEffect(() => {
        load();
    }, [load]);

    // Handle auto-population of states based on EOD dayClosed state
    useEffect(() => {
        if (data) {
            if (data.dayClosed && data.closure) {
                setOpeningCash(String(data.closure.openingCash || 0));
                setActualCash(String(data.closure.actualCash || 0));
                setNotes(data.closure.notes || '');
                setDenominations(data.closure.denominations || { 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
            } else {
                setOpeningCash(String(data.metrics?.openingCash || 0));
                setActualCash('');
                setNotes('');
                setDenominations({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
            }
        }
    }, [data]);

    const loadHistory = useCallback(async () => {
        try {
            const params = { limit: 15 };
            if (outletId && outletId !== 'all') {
                params.outletId = outletId;
            }
            const res = await api.get('/finance/eod/history', { params });
            setHistory(res.data?.data?.results || []);
        } catch {
            setHistory([]);
        }
    }, [outletId]);

    useEffect(() => {
        if (showHistory) loadHistory();
    }, [showHistory, loadHistory]);

    const m = data?.metrics;
    const dayClosed = data?.dayClosed;
    const closure = data?.closure;
    const reconciled = data?.reconciled;

    // expected cash in drawer = live metrics estimated cash (which includes opening cash + net cash movements)
    // Wait, in the backend: netCashEstimate = openingCash + cashSales + otherCashIncome - cashExpenses
    const expectedCashDrawer = m?.netCashEstimate || 0;
    const computedVariance = actualCash ? Number(actualCash) - expectedCashDrawer : 0;

    const handleCloseDay = async () => {
        if (dayClosed) return;
        if (actualCash === '') return setError('Actual Cash (counted in drawer) is required');
        
        if (!window.confirm(`Are you sure you want to close the business date ${businessDate}? Once closed, EOD values are locked.`)) return;
        
        setClosing(true);
        setError(null);
        try {
            await api.post('/finance/eod/close', {
                businessDate,
                openingCash: Number(openingCash),
                actualCash: Number(actualCash),
                notes: notes.trim(),
                denominations,
                outletId: (outletId && outletId !== 'all') ? outletId : undefined
            });
            await load();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Close failed');
        } finally {
            setClosing(false);
        }
    };

    const downloadReport = () => {
        const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), summary: data }, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eod-${businessDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Calculate percentage breakdown for premium visual bar charts
    const totalSales = m?.totalSales || 0;
    const cashPct = totalSales > 0 ? ((m?.cashSales || 0) / totalSales) * 100 : 0;
    const cardPct = totalSales > 0 ? ((m?.cardSales || 0) / totalSales) * 100 : 0;
    const onlinePct = totalSales > 0 ? ((m?.onlineSales || 0) / totalSales) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto no-scrollbar pb-10 transition-colors duration-200">
            {/* Upper Glassmorphism Header */}
            <div className="sticky top-0 z-20 backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800/80 px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${dayClosed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'} transition-colors`}>
                            {dayClosed ? <Lock className="w-5 h-5 animate-pulse" /> : <Unlock className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                                EOD Closure Dashboard
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                Record daily counter counts, compute shift variances, and log snapshots.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
                    <div className="relative flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <input
                            type="date"
                            value={businessDate}
                            onChange={(e) => setBusinessDate(e.target.value)}
                            className="bg-transparent border-none focus:outline-none font-bold select-none cursor-pointer outline-none text-slate-700 dark:text-slate-200"
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-50 text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>

                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-inner text-xs font-bold border ${
                            dayClosed
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${dayClosed ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                        {dayClosed ? 'Day Closed' : 'Day Open (Pending)'}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mx-8 mt-6 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-start gap-3 shadow-lg shadow-rose-500/5">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-extrabold uppercase tracking-wider mb-0.5">Error Occurred</h4>
                        <p className="font-medium opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching Day Ledger...</span>
                </div>
            ) : (
                <div className="p-8 space-y-6 max-w-5xl mx-auto w-full animate-fadeIn">
                    
                    {/* Day Closed Success Banner */}
                    {dayClosed && closure && (
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 p-5 shadow-lg shadow-emerald-500/2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Closed & Locked</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Closed at {new Date(closure.createdAt || closure.closedAt).toLocaleString('en-IN')} by <strong className="text-slate-700 dark:text-slate-200">{closure.performedBy?.name || closure.closedByName || 'Administrator'}</strong>
                                    </p>
                                    {closure.notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 rounded-lg mt-2 font-medium">
                                            " {closure.notes} "
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Snapshot Saved
                            </div>
                        </div>
                    )}

                    {/* KPIs Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/10 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl">
                            <div className="flex justify-between items-center opacity-75">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">Total Sales (POS)</span>
                                <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mt-2.5">{formatInr(m?.totalSales)}</h3>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mt-2">
                                {m?.invoiceCount ?? 0} Invoices
                            </span>
                        </div>

                        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 text-white shadow-xl shadow-rose-500/10 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl">
                            <div className="flex justify-between items-center opacity-75">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">Expenses (Ledger)</span>
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mt-2.5">{formatInr(m?.dailyExpenses)}</h3>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mt-2">
                                Outflows & Salaries
                            </span>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl shadow-emerald-500/10 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl">
                            <div className="flex justify-between items-center opacity-75">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">Net Profit</span>
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mt-2.5">{formatInr(m?.netForDay)}</h3>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mt-2">
                                Sales − Expenses
                            </span>
                        </div>

                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-xl shadow-amber-500/10 transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl">
                            <div className="flex justify-between items-center opacity-75">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">Expected Drawer Cash</span>
                                <Coins className="w-4 h-4" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mt-2.5">{formatInr(expectedCashDrawer)}</h3>
                            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block mt-2" title="Opening balance + cash sales + cash inflows - cash expenses">
                                Target Cash Count
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payment Breakup Card */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-sm">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-primary" />
                                    Payment Breakdown
                                </h3>
                                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Live Split</span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <EODSummaryRow label="Cash Sales" value={formatInr(m?.cashSales)} icon={Wallet} color="text-orange-500" />
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${cashPct}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <EODSummaryRow label="UPI / Bank Online" value={formatInr(m?.onlineSales)} icon={CreditCard} color="text-blue-500" />
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${onlinePct}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <EODSummaryRow label="Card Transactions" value={formatInr(m?.cardSales)} icon={CreditCard} color="text-purple-500" />
                                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${cardPct}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reconciliation Hints */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-sm">
                            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Reconciliation Checkpoints
                            </h3>
                            
                            <div className="space-y-3">
                                <div
                                    className={`flex justify-between items-center p-3.5 rounded-xl border transition-all ${
                                        reconciled
                                            ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/10'
                                            : 'bg-slate-50 dark:bg-slate-750 border-slate-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className={`w-4 h-4 ${reconciled ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-650 dark:text-slate-350">
                                            POS Invoices Reconciled
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-555 uppercase">Verified</span>
                                </div>

                                <div
                                    className={`flex justify-between items-center p-3.5 rounded-xl border transition-all ${
                                        dayClosed
                                            ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/10'
                                            : 'bg-slate-50 dark:bg-slate-750 border-slate-100 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className={`w-4 h-4 ${dayClosed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-650 dark:text-slate-350">
                                            EOD Snapshot & Lock Status
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-555 uppercase">
                                        {dayClosed ? 'Locked' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                                Closing the day takes a frozen snapshot of today's POS bills and ledger entries. Any transactions added or edited after closing will not affect this EOD statement.
                            </p>
                        </div>
                    </div>

                    {/* Interactive EOD Reconciliation Terminal */}
                    <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150 dark:border-slate-700">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                                    Reconciliation Terminal
                                </h3>
                                <p className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                                    Compare actual physical cash drawer count with system estimations.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                                <Lock className="w-3.5 h-3.5" />
                                {dayClosed ? 'Secure Lock Engaged' : 'Awaiting Input'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-450 ml-1">Opening Cash (Morning)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={openingCash}
                                                onChange={(e) => setOpeningCash(e.target.value)}
                                                placeholder="0"
                                                disabled={dayClosed}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-750 text-slate-800 dark:text-slate-100 disabled:opacity-75 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-450 ml-1">Actual Cash (Counted)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                value={actualCash}
                                                onChange={(e) => {
                                                    setActualCash(e.target.value);
                                                    setDenominations({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
                                                }}
                                                placeholder="0"
                                                disabled={dayClosed}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-750 text-slate-800 dark:text-slate-100 disabled:opacity-75 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-black text-primary"
                                            />
                                        </div>
                                        {!dayClosed && (
                                            <button
                                                type="button"
                                                onClick={() => setShowCalculator(!showCalculator)}
                                                className="text-[9px] font-bold text-primary hover:text-primary-dark tracking-wider uppercase flex items-center gap-1.5 mt-1.5 focus:outline-none transition-all"
                                            >
                                                <Coins className="w-3.5 h-3.5" />
                                                {showCalculator ? 'Hide Note Calculator' : 'Show Note Calculator'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {showCalculator && !dayClosed && (
                                    <div className="p-5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl mt-4 space-y-4 animate-fadeIn">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                                            <span className="text-[10px] font-black uppercase text-slate-650 dark:text-slate-400 tracking-wider">Denomination Calculator</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDenominations({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
                                                    setActualCash('0');
                                                }}
                                                className="text-[9px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wider transition-colors"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
                                            {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => (
                                                <div key={denom} className="flex flex-col gap-1.5 relative">
                                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        ₹{denom} {denom >= 10 ? 'Note' : 'Coin'}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={denominations[denom]}
                                                        min="0"
                                                        onChange={(e) => handleDenominationChange(e.target.value, denom)}
                                                        placeholder="0"
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-250 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-750 text-slate-800 dark:text-slate-100 outline-none focus:border-primary transition-all text-center"
                                                    />
                                                    {denominations[denom] > 0 && (
                                                        <span className="absolute -bottom-4.5 left-0 right-0 text-[8px] font-bold text-slate-400 dark:text-slate-500 text-center whitespace-nowrap">
                                                            = ₹{(denom * denominations[denom]).toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-2 flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                            <span>Total Calculated:</span>
                                            <span className="text-primary font-black text-xs">{formatInr(actualCash)}</span>
                                        </div>
                                    </div>
                                )}

                                {dayClosed && Object.values(denominations).some(val => val !== '' && parseInt(val) > 0) && (
                                    <div className="p-4 bg-slate-550/5 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl mt-4 space-y-3">
                                        <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-450 tracking-wider border-b border-slate-200 dark:border-slate-700 pb-1.5">
                                            Locked Cash Denominations
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {[500, 200, 100, 50, 20, 10, 5, 2, 1].map((denom) => {
                                                const count = denominations[denom];
                                                if (!count || parseInt(count) <= 0) return null;
                                                return (
                                                    <div key={denom} className="flex justify-between items-center bg-white dark:bg-slate-750 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                                        <span className="font-semibold text-slate-550 dark:text-slate-400">
                                                            ₹{denom} {denom >= 10 ? 'Note' : 'Coin'}
                                                        </span>
                                                        <span className="font-bold text-slate-800 dark:text-slate-100">
                                                            {count} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({(denom * count).toLocaleString('en-IN')})</span>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Variance and discrepancy feedback */}
                                {(dayClosed || actualCash !== '') && (
                                    <div className={`p-4 rounded-xl border transition-all ${
                                        dayClosed
                                            ? (closure?.discrepancy || 0) === 0
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-450'
                                                : 'bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-455'
                                            : computedVariance === 0
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-450'
                                                : 'bg-rose-500/5 border-rose-500/10 text-rose-800 dark:text-rose-455'
                                    }`}>
                                        <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider">
                                            <span className="opacity-75">Cash drawer variance</span>
                                            <span className="flex items-center gap-1">
                                                {dayClosed ? (
                                                    (closure?.discrepancy || 0) === 0 ? (
                                                        <span className="text-emerald-600 font-extrabold">Balanced (₹0)</span>
                                                    ) : (closure?.discrepancy || 0) > 0 ? (
                                                        <span className="text-emerald-600 font-extrabold">Surplus (+{formatInr(closure?.discrepancy)})</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-extrabold">Shortage ({formatInr(closure?.discrepancy)})</span>
                                                    )
                                                ) : (
                                                    computedVariance === 0 ? (
                                                        <span className="text-emerald-600 font-extrabold">Balanced (₹0)</span>
                                                    ) : computedVariance > 0 ? (
                                                        <span className="text-emerald-600 font-extrabold">Surplus (+{formatInr(computedVariance)})</span>
                                                    ) : (
                                                        <span className="text-rose-600 font-extrabold">Shortage ({formatInr(computedVariance)})</span>
                                                    )
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-450 ml-1">EOD Audit Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Note down shift anomalies, variance reasons, and cash drawer notes..."
                                        disabled={dayClosed}
                                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-slate-50/50 dark:bg-slate-750 text-slate-800 dark:text-slate-100 disabled:opacity-75 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-semibold"
                                        rows={2.5}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full">
                                    <button
                                        type="button"
                                        onClick={downloadReport}
                                        disabled={!data}
                                        className="flex-1 px-5 py-3 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4 text-slate-400" />
                                        Download JSON
                                    </button>
                                    
                                    {!dayClosed ? (
                                        <button
                                            type="button"
                                            disabled={closing}
                                            onClick={handleCloseDay}
                                            className="flex-[1.5] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-rose-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        >
                                            {closing ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Lock className="w-4 h-4" />
                                            )}
                                            {closing ? 'Locking...' : 'Lock day & Save EOD'}
                                        </button>
                                    ) : (
                                        <div className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-extrabold select-none">
                                            <CheckCircle2 className="w-4 h-4" />
                                            EOD Audit Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                            <span>Auditor: {user?.name || user?.email || 'System Admin'}</span>
                            <span>System Date: {new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Historical Logs Section */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-all"
                        >
                            <span className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                <History className="w-4 h-4 text-slate-500" />
                                Past Closures Timeline
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                {showHistory ? 'Collapse' : 'Expand'}
                            </span>
                        </button>
                        
                        {showHistory && (
                            <div className="border-t border-slate-150 dark:border-slate-700 p-5 pt-3">
                                {history.length === 0 ? (
                                    <div className="py-8 text-center text-xs font-bold text-slate-400 dark:text-slate-650 uppercase tracking-widest">No previous closures recorded</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                    <th className="py-2.5">Date</th>
                                                    <th className="py-2.5">Closed By</th>
                                                    <th className="py-2.5 text-right">Cash Drawer Actual</th>
                                                    <th className="py-2.5 text-right">Variance (Difference)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-750/50 text-xs text-slate-700 dark:text-slate-350">
                                                {history.map((h) => {
                                                    const disc = h.discrepancy || 0;
                                                    return (
                                                        <tr key={h._id || h.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-750/30">
                                                            <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                                                                {new Date(h.date || h.businessDate).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="py-3 font-semibold opacity-90">{h.performedBy?.name || h.closedByName || 'Admin'}</td>
                                                            <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">{formatInr(h.actualCash)}</td>
                                                            <td className="py-3 text-right">
                                                                {disc === 0 ? (
                                                                    <span className="text-emerald-500 dark:text-emerald-450 font-extrabold">₹0</span>
                                                                ) : disc > 0 ? (
                                                                    <span className="text-emerald-600 dark:text-emerald-450 font-extrabold">+{formatInr(disc)}</span>
                                                                ) : (
                                                                    <span className="text-rose-600 dark:text-rose-455 font-extrabold">{formatInr(disc)}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function EODSummaryRow({ label, value, icon: Icon, color }) {
    return (
        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-[10px] font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{value}</span>
        </div>
    );
}
