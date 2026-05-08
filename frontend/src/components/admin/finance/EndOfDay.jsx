import React, { useState, useEffect, useCallback } from 'react';
import {
    Lock,
    CheckCircle2,
    Wallet,
    CreditCard,
    PieChart,
    Info,
    Download,
    ArrowRight,
    ShieldCheck,
    RefreshCw,
    Calendar,
    History,
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

export default function EndOfDay() {
    const { user } = useAuth();
    const [businessDate, setBusinessDate] = useState(todayIso);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [notes, setNotes] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/finance/eod/summary', { params: { date: businessDate } });
            setData(res.data?.data || null);
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'EOD load failed');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [businessDate]);

    useEffect(() => {
        load();
    }, [load]);

    const loadHistory = useCallback(async () => {
        try {
            const res = await api.get('/finance/eod/history', { params: { limit: 15 } });
            setHistory(res.data?.data?.results || []);
        } catch {
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        if (showHistory) loadHistory();
    }, [showHistory, loadHistory]);

    const m = data?.metrics;
    const dayClosed = data?.dayClosed;
    const closure = data?.closure;
    const reconciled = data?.reconciled;

    const handleCloseDay = async () => {
        if (dayClosed) return;
        if (!window.confirm('Kya aap sure hain? Close hone ke baad is din ke liye dubara EOD nahi lagega.')) return;
        setClosing(true);
        setError(null);
        try {
            await api.post('/finance/eod/close', {
                businessDate,
                notes: notes.trim(),
            });
            setNotes('');
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

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10">
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                            <Lock className="w-6 h-6 text-rose-600" />
                            End of Day (EOD) Closure
                        </h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">
                            POS sales + ledger expenses se daily snapshot; close par record lock hota hai.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary shadow-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            <input
                                type="date"
                                value={businessDate}
                                onChange={(e) => setBusinessDate(e.target.value)}
                                className="bg-transparent border-none focus:outline-none"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-white disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm text-xs font-bold ${
                                dayClosed
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                    : 'bg-rose-50 border border-rose-100 text-rose-600'
                            }`}
                        >
                            <Info className="w-3.5 h-3.5" />
                            {dayClosed ? 'Day closed (EOD saved)' : 'Day open — EOD pending'}
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="mx-8 mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="p-16 text-center text-text-muted font-bold">Loading…</div>
            ) : (
                <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
                    {closure ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                            <span className="font-bold">Closed </span>
                            {closure.closedAt
                                ? new Date(closure.closedAt).toLocaleString('en-IN')
                                : '—'}{' '}
                            by <strong>{closure.closedByName || '—'}</strong>
                            {closure.notes ? (
                                <>
                                    <br />
                                    <span className="text-xs opacity-90">Note: {closure.notes}</span>
                                </>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Total daily sales
                                </span>
                                <div className="text-4xl font-bold tracking-tighter">{formatInr(m?.totalSales)}</div>
                                <span className="text-[10px] text-slate-500">{m?.invoiceCount ?? 0} invoices</span>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Daily expenses (ledger)
                                </span>
                                <div className="text-4xl font-bold tracking-tighter text-rose-400">
                                    {formatInr(m?.dailyExpenses)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Net for day
                                </span>
                                <div className="text-4xl font-bold tracking-tighter text-emerald-400">
                                    {formatInr(m?.netForDay)}
                                </div>
                                <span className="text-[10px] text-slate-500">Sales − expenses</span>
                            </div>
                        </div>
                        <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Net cash (estimate)
                            </span>
                            <div className="text-2xl font-bold text-amber-300 mt-1">{formatInr(m?.netCashEstimate)}</div>
                            <p className="text-[9px] text-slate-500 mt-1 max-w-lg">{data?.meta?.netCashHint}</p>
                        </div>
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <PieChart className="w-48 h-48" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                            <h3 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-primary" />
                                Payment method breakup
                            </h3>
                            <div className="space-y-4">
                                <EODSummaryRow label="Cash sales" value={formatInr(m?.cashSales)} icon={Wallet} color="text-orange-500" />
                                <EODSummaryRow label="UPI / online" value={formatInr(m?.onlineSales)} icon={CreditCard} color="text-blue-500" />
                                <EODSummaryRow label="Card" value={formatInr(m?.cardSales)} icon={CreditCard} color="text-purple-500" />
                            </div>
                        </div>

                        <div className="bg-white border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                            <h3 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Reconciliation hints
                            </h3>
                            <div className="space-y-4">
                                <div
                                    className={`flex justify-between items-center p-4 rounded-2xl border ${
                                        reconciled?.cashBankSaved
                                            ? 'bg-emerald-50 border-emerald-100'
                                            : 'bg-surface border-border'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                        Cash & Bank saved
                                    </span>
                                    {reconciled?.cashBankSaved ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-text-muted">Optional</span>
                                    )}
                                </div>
                                <div
                                    className={`flex justify-between items-center p-4 rounded-2xl border ${
                                        reconciled?.cashBankLocked
                                            ? 'bg-emerald-50 border-emerald-100'
                                            : 'bg-surface border-border'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                                        Cash & Bank locked
                                    </span>
                                    {reconciled?.cashBankLocked ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                        <span className="text-[9px] font-bold text-text-muted">—</span>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                POS invoices / expenses par automated lock abhi enforce nahi hota; EOD record compliance
                                snapshot ke liye hai.
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-3xl p-6">
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest"
                        >
                            <History className="w-4 h-4" />
                            Recent EOD history
                        </button>
                        {showHistory && (
                            <ul className="mt-4 space-y-2 text-sm">
                                {history.length === 0 ? (
                                    <li className="text-text-muted">No closures yet.</li>
                                ) : (
                                    history.map((h) => (
                                        <li
                                            key={h.id}
                                            className="flex justify-between border-b border-border/50 py-2 text-xs"
                                        >
                                            <span className="font-bold">{h.businessDate}</span>
                                            <span className="text-text-muted">
                                                {h.closedByName} · {formatInr(h.snapshot?.totalSales)}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="bg-rose-50 border-2 border-rose-100 rounded-[32px] p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-rose-100/50">
                        <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200">
                            <Lock className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-rose-900 tracking-tight">Perform daily closure</h3>
                            <p className="text-sm text-rose-700 font-medium max-w-md mx-auto">
                                Close karne par is date ka snapshot save ho jata hai — dubara same din close nahi ho sakta.
                            </p>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes (shift, variance, reference…)"
                            disabled={dayClosed}
                            className="w-full max-w-md p-4 rounded-2xl border border-rose-200 text-sm bg-white disabled:opacity-50"
                            rows={2}
                        />
                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-lg">
                            <button
                                type="button"
                                onClick={downloadReport}
                                disabled={!data}
                                className="px-8 py-4 bg-white border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-100 transition-all shadow-sm disabled:opacity-50"
                            >
                                <Download className="w-4 h-4 inline-block mr-2" />
                                EOD report (JSON)
                            </button>
                            <button
                                type="button"
                                disabled={dayClosed || closing}
                                onClick={handleCloseDay}
                                className="px-10 py-4 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-rose-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {closing ? 'Closing…' : 'Close day & save EOD'}
                                <ArrowRight className="w-4 h-4 inline-block ml-2" />
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">
                            {user?.name || user?.email || 'Admin'} · {new Date().toLocaleDateString('en-IN')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function EODSummaryRow({ label, value, icon: Icon, color }) {
    return (
        <div className="flex justify-between items-center p-4 bg-surface rounded-2xl border border-border group hover:border-primary transition-all">
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-sm font-bold text-text">{value}</span>
        </div>
    );
}
