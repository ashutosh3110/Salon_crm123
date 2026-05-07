import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, CreditCard, ArrowRight, AlertCircle, CheckCircle2, RefreshCcw, Lock, Info, Calendar } from 'lucide-react';
import mockApi from '../../../services/mock/mockApi';

function todayIso() {
    return new Date().toISOString().split('T')[0];
}

export default function CashAndBank() {
    const [businessDate, setBusinessDate] = useState(todayIso);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(null);

    const [actualCash, setActualCash] = useState('');
    const [actualBank, setActualBank] = useState('');
    const [notes, setNotes] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await mockApi.get('/finance/cash-bank', { params: { date: businessDate } });
            const d = res.data?.data;
            setPayload(d);
            if (d?.saved) {
                setActualCash(
                    d.saved.actualCash != null ? String(d.saved.actualCash) : ''
                );
                setActualBank(
                    d.saved.actualBank != null ? String(d.saved.actualBank) : ''
                );
                setNotes(d.saved.notes || '');
            } else {
                setActualCash('');
                setActualBank('');
                setNotes('');
            }
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e?.networkHint ||
                    e.message ||
                    'Failed to load cash & bank'
            );
            setPayload(null);
        } finally {
            setLoading(false);
        }
    }, [businessDate]);

    useEffect(() => {
        load();
    }, [load]);

    const system = payload
        ? {
              cash: {
                  opening: payload.cash.opening,
                  sales: payload.cash.sales,
                  expenses: payload.cash.expenses,
                  net: payload.cash.net,
              },
              bank: {
                  opening: payload.bank.opening,
                  sales: payload.bank.sales,
                  expenses: payload.bank.expenses,
                  net: payload.bank.net,
              },
          }
        : {
              cash: { opening: 0, sales: 0, expenses: 0, net: 0 },
              bank: { opening: 0, sales: 0, expenses: 0, net: 0 },
          };

    const cashDiff =
        actualCash !== '' && !Number.isNaN(parseFloat(actualCash))
            ? parseFloat(actualCash) - system.cash.net
            : null;
    const bankDiff =
        actualBank !== '' && !Number.isNaN(parseFloat(actualBank))
            ? parseFloat(actualBank) - system.bank.net
            : null;

    const handleSave = async (locked) => {
        if (actualCash === '' || actualBank === '') {
            setError('Actual cash aur bank dono amounts bharein.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await mockApi.post('/finance/cash-bank/reconcile', {
                businessDate,
                actualCash: parseFloat(actualCash),
                actualBank: parseFloat(actualBank),
                notes: notes.trim(),
                locked,
            });
            await load();
        } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const meta = payload?.meta || {};

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10">
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Daily Cash & Bank Reconciliation</h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">
                            POS invoices + finance expense ledger se system balance; kal ki saved actual amounts se
                            opening.
                        </p>
                        <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-widest">
                            {meta.invoiceCashLabel || 'Cash sales'} · {meta.invoiceBankLabel || 'Card & online'} ·{' '}
                            {meta.expenseCashLabel || 'Cash expenses'} · {meta.expenseBankLabel || 'Bank expenses'}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl shadow-sm text-xs font-bold text-text-secondary">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="whitespace-nowrap">Date</span>
                            <input
                                type="date"
                                value={businessDate}
                                onChange={(e) => setBusinessDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold focus:outline-none"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-white transition-all disabled:opacity-50"
                        >
                            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="mx-8 mt-6 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm font-bold text-rose-800">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="p-16 flex justify-center items-center text-text-muted text-sm font-bold">
                    Loading…
                </div>
            ) : (
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-widest">Cash Summary</h3>
                        </div>

                        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-6 space-y-4 bg-surface/30">
                                <SummaryRow label="Opening cash" value={system.cash.opening} />
                                <SummaryRow
                                    label={meta.invoiceCashLabel || 'Cash sales (+)'}
                                    value={system.cash.sales}
                                    color="text-emerald-600"
                                />
                                <SummaryRow
                                    label={meta.expenseCashLabel || 'Cash expenses (-)'}
                                    value={system.cash.expenses}
                                    color="text-rose-500"
                                />
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                        System cash balance
                                    </span>
                                    <span className="text-xl font-bold text-text tracking-tight">
                                        ₹{system.cash.net.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 bg-white space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        Actual physical cash
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={actualCash}
                                            onChange={(e) => setActualCash(e.target.value)}
                                            placeholder="Counted amount"
                                            className="w-full pl-8 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {cashDiff != null && (
                                    <div
                                        className={`p-4 rounded-2xl flex items-center justify-between animate-fadeIn ${
                                            Math.abs(cashDiff) < 0.01
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                            {Math.abs(cashDiff) < 0.01 ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4" />
                                            )}
                                            {Math.abs(cashDiff) < 0.01 ? 'Cash matched' : 'Discrepancy'}
                                        </div>
                                        <span className="font-bold">₹{Math.abs(cashDiff).toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-widest">Bank Summary</h3>
                        </div>

                        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-6 space-y-4 bg-surface/30">
                                <SummaryRow label="Opening bank" value={system.bank.opening} />
                                <SummaryRow
                                    label={meta.invoiceBankLabel || 'Card & online sales (+)'}
                                    value={system.bank.sales}
                                    color="text-emerald-600"
                                />
                                <SummaryRow
                                    label={meta.expenseBankLabel || 'Card & online expenses (-)'}
                                    value={system.bank.expenses}
                                    color="text-rose-500"
                                />
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                        System bank balance
                                    </span>
                                    <span className="text-xl font-bold text-text tracking-tight">
                                        ₹{system.bank.net.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 bg-white space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                        Actual bank balance (statement)
                                    </label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={actualBank}
                                            onChange={(e) => setActualBank(e.target.value)}
                                            placeholder="Current bank total"
                                            className="w-full pl-8 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {bankDiff != null && (
                                    <div
                                        className={`p-4 rounded-2xl flex items-center justify-between animate-fadeIn ${
                                            Math.abs(bankDiff) < 0.01
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                            {Math.abs(bankDiff) < 0.01 ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4" />
                                            )}
                                            {Math.abs(bankDiff) < 0.01 ? 'Bank matched' : 'Discrepancy'}
                                        </div>
                                        <span className="font-bold">₹{Math.abs(bankDiff).toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-surface/20 border border-border/50 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-2 text-text-secondary">
                            <Info className="w-4 h-4 opacity-60" />
                            <span className="text-xs font-bold uppercase tracking-widest">Administrative remarks</span>
                        </div>

                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Difference ki wajah, reference, notes…"
                            className="w-full p-4 bg-white border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            rows={3}
                        />

                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={load}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border text-sm font-bold text-text-secondary hover:bg-white transition-all"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Re-calculate
                            </button>
                            <button
                                type="button"
                                disabled={saving || actualCash === '' || actualBank === ''}
                                onClick={() => handleSave(false)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all disabled:opacity-50"
                            >
                                Save draft
                            </button>
                            <button
                                type="button"
                                disabled={saving || actualCash === '' || actualBank === ''}
                                onClick={() => handleSave(true)}
                                className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all disabled:opacity-50"
                            >
                                <Lock className="w-4 h-4" />
                                Approve & lock day
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryRow({ label, value, color = 'text-text-secondary' }) {
    const n = Number(value);
    return (
        <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-text-muted font-bold uppercase tracking-wider">{label}</span>
            <span className={color}>₹{(Number.isFinite(n) ? n : 0).toLocaleString('en-IN')}</span>
        </div>
    );
}
