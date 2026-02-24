import React from 'react';
import { Lock, CheckCircle2, DollarSign, Wallet, CreditCard, PieChart, Info, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export default function EndOfDay() {
    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar pb-10">
            {/* Header */}
            <div className="p-8 border-b border-border bg-surface/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                            <Lock className="w-6 h-6 text-rose-600" />
                            End of Day (EOD) Closure
                        </h2>
                        <p className="text-sm text-text-secondary mt-1 font-medium">Final daily settlement and ledger locking.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl shadow-sm text-xs font-bold text-rose-600">
                        <Info className="w-3.5 h-3.5" />
                        Status: Day Open
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
                {/* Big Final Numbers */}
                <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Daily Sales</span>
                            <div className="text-4xl font-bold tracking-tighter">₹97,650</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Daily Expenses</span>
                            <div className="text-4xl font-bold tracking-tighter text-rose-400">₹12,850</div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Net Cash in Hand</span>
                            <div className="text-4xl font-bold tracking-tighter text-emerald-400">₹16,600</div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <PieChart className="w-48 h-48" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Payment Breakup */}
                    <div className="bg-white border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-primary" />
                            Payment Method Breakup
                        </h3>
                        <div className="space-y-4">
                            <EODSummaryRow label="Cash Sales" value="₹12,450" icon={Wallet} color="text-orange-500" />
                            <EODSummaryRow label="UPI / QR Payments" value="₹45,200" icon={CreditCard} color="text-blue-500" />
                            <EODSummaryRow label="Card Swipes" value="₹40,000" icon={CreditCard} color="text-purple-500" />
                        </div>
                    </div>

                    {/* Closing Balances */}
                    <div className="bg-white border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                        <h3 className="text-xs font-bold text-text uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Reconciled Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Cash Reconciled</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Bank Reconciled</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Action Block */}
                <div className="bg-rose-50 border-2 border-rose-100 rounded-[32px] p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-rose-100/50">
                    <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse">
                        <Lock className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-rose-900 tracking-tight">Perform Daily Closure</h3>
                        <p className="text-sm text-rose-700 font-medium max-w-md mx-auto">
                            By closing the day, you lock all financial entries. No further edits will be allowed to POS invoices, expenses, or cash records for today.
                        </p>
                    </div>
                    <div className="flex gap-4 w-full justify-center">
                        <button className="px-8 py-4 bg-white border border-rose-200 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-100 transition-all shadow-sm">
                            <Download className="w-4 h-4 inline-block mr-2" />
                            EOD Report
                        </button>
                        <button className="px-10 py-4 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:shadow-2xl hover:shadow-rose-600/40 transition-all scale-active shadow-lg shadow-rose-200">
                            Close Day & Lock System
                            <ArrowRight className="w-4 h-4 inline-block ml-2" />
                        </button>
                    </div>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mt-2">
                        Authorized by {`{Admin_Aryan}`} • Terminal {`{POS_01}`}
                    </p>
                </div>
            </div>
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
