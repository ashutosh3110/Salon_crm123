import React, { useState } from 'react';
import { Wallet, CreditCard, ArrowRight, AlertCircle, CheckCircle2, RefreshCcw, Lock, Info, Send, Calendar } from 'lucide-react';

export default function CashAndBank() {
    const [actualCash, setActualCash] = useState('');
    const [actualBank, setActualBank] = useState('');

    // System Data (Mocked)
    const system = {
        cash: { opening: 5000, sales: 12450, expenses: 850, net: 16600 },
        bank: { opening: 245000, sales: 85200, expenses: 15000, net: 315200 }
    };

    const cashDiff = actualCash ? parseFloat(actualCash) - system.cash.net : 0;
    const bankDiff = actualBank ? parseFloat(actualBank) - system.bank.net : 0;

    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight">Daily Cash & Bank Reconciliation</h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">Verify system balances against physical cash and bank statements.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl shadow-sm text-xs font-bold text-text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        Today: {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cash Summary Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-text uppercase tracking-widest">Cash Summary</h3>
                    </div>

                    <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 space-y-4 bg-surface/30">
                            <SummaryRow label="Opening Cash" value={system.cash.opening} />
                            <SummaryRow label="Cash Sales (+)" value={system.cash.sales} color="text-emerald-600" />
                            <SummaryRow label="Cash Expenses (-)" value={system.cash.expenses} color="text-rose-500" />
                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">System Cash Balance</span>
                                <span className="text-xl font-black text-text tracking-tight">₹{system.cash.net.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-6 bg-white space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Actual Physical Cash</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">₹</span>
                                    <input
                                        type="number"
                                        value={actualCash}
                                        onChange={(e) => setActualCash(e.target.value)}
                                        placeholder="Enter counted amount"
                                        className="w-full pl-8 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {actualCash && (
                                <div className={`p-4 rounded-2xl flex items-center justify-between animate-fadeIn ${cashDiff === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                        {cashDiff === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {cashDiff === 0 ? 'Cash Matched' : 'Discrepancy Found'}
                                    </div>
                                    <span className="font-black">₹{Math.abs(cashDiff).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bank Summary Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-text uppercase tracking-widest">Bank Summary</h3>
                    </div>

                    <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 space-y-4 bg-surface/30">
                            <SummaryRow label="Opening Bank" value={system.bank.opening} />
                            <SummaryRow label="Online Sales (+)" value={system.bank.sales} color="text-emerald-600" />
                            <SummaryRow label="Bank Expenses (-)" value={system.bank.expenses} color="text-rose-500" />
                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">System Bank Balance</span>
                                <span className="text-xl font-black text-text tracking-tight">₹{system.bank.net.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-6 bg-white space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Actual Bank Balance (Statement)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">₹</span>
                                    <input
                                        type="number"
                                        value={actualBank}
                                        onChange={(e) => setActualBank(e.target.value)}
                                        placeholder="Enter current bank total"
                                        className="w-full pl-8 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            {actualBank && (
                                <div className={`p-4 rounded-2xl flex items-center justify-between animate-fadeIn ${bankDiff === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                        {bankDiff === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {bankDiff === 0 ? 'Bank Matched' : 'Discrepancy Found'}
                                    </div>
                                    <span className="font-black">₹{Math.abs(bankDiff).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Final Reconciliation Remarks */}
                <div className="lg:col-span-2 bg-surface/20 border border-border/50 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Info className="w-4 h-4 opacity-60" />
                        <span className="text-xs font-bold uppercase tracking-widest">Administrative Remarks</span>
                    </div>

                    <textarea
                        placeholder="Add notes about any differences found..."
                        className="w-full p-4 bg-white border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                        rows={3}
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                        <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border text-sm font-bold text-text-secondary hover:bg-white transition-all">
                            <RefreshCcw className="w-4 h-4" />
                            Re-Calculate
                        </button>
                        <button
                            disabled={!actualCash || !actualBank}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all scale-active disabled:opacity-50 disabled:scale-100"
                        >
                            <Lock className="w-4 h-4" />
                            Approve & Lock Day Records
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, color = 'text-text-secondary' }) {
    return (
        <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-text-muted font-bold uppercase tracking-wider">{label}</span>
            <span className={color}>₹{value.toLocaleString()}</span>
        </div>
    );
}
