import { useState, useMemo } from 'react';
import {
    Calculator, Banknote, CreditCard, Smartphone,
    TrendingUp, ArrowRight, CheckCircle2, AlertCircle,
    Printer, Download, Clock
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/posData';

export default function POSDayEndPage() {
    const [step, setStep] = useState('summary'); // summary, verification, closed
    const [actualCash, setActualCash] = useState('');

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayBills = MOCK_INVOICES.filter(i => i.createdAt.startsWith(today));

        const totals = todayBills.reduce((acc, current) => {
            const method = current.paymentMethod || 'cash';
            acc[method] = (acc[method] || 0) + current.total;
            acc.total += current.total;
            acc.count += 1;
            return acc;
        }, { cash: 0, card: 0, online: 0, total: 0, count: 0 });

        return totals;
    }, []);

    const handleCloseDay = () => setStep('closed');

    if (step === 'closed') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-none flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-text uppercase tracking-tight">Terminal Closed</h2>
                    <p className="text-text-secondary font-medium">Day-end report has been generated and emailed to manager.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 bg-text text-background font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90">
                        <Printer className="w-4 h-4" /> Print Z-Report
                    </button>
                    <button className="px-6 py-2.5 bg-surface border border-border font-bold text-xs uppercase tracking-widest text-text-secondary hover:bg-surface-alt">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Day End Closing</h1>
                    <p className="text-sm text-text-secondary flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-primary" /> Closing for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">Audit Required</span>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-5 border border-border shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-4 tracking-widest">Bills Processed Today</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-text">{stats.count}</h3>
                        <Calculator className="w-8 h-8 text-primary/10" />
                    </div>
                </div>
                <div className="bg-surface p-5 border border-border shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-4 tracking-widest">Calculated Revenue</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-text">₹{stats.total.toLocaleString()}</h3>
                        <TrendingUp className="w-8 h-8 text-emerald-500/10" />
                    </div>
                </div>
                <div className="bg-surface p-5 border border-border shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-4 tracking-widest">Est. staff Comm.</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-text">₹{(stats.total * 0.12).toLocaleString()}</h3>
                        <ArrowRight className="w-8 h-8 text-blue-500/10" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Totals */}
                <div className="bg-surface border border-border shadow-sm p-6 space-y-6">
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border pb-3">Digital Reconciliation</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center"><Banknote className="w-5 h-5" /></div>
                                <div><p className="text-xs font-black text-text uppercase">Cash In Drawer</p><p className="text-[10px] text-emerald-500 font-bold">System Expected</p></div>
                            </div>
                            <p className="text-lg font-black text-text">₹{stats.cash.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                                <div><p className="text-xs font-black text-text uppercase">Card Swipes</p><p className="text-[10px] text-blue-500 font-bold">Bank Settlements</p></div>
                            </div>
                            <p className="text-lg font-black text-text">₹{stats.card.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 text-white flex items-center justify-center"><Smartphone className="w-5 h-5" /></div>
                                <div><p className="text-xs font-black text-text uppercase">UPI / Wallets</p><p className="text-[10px] text-purple-500 font-bold">Cloud Payments</p></div>
                            </div>
                            <p className="text-lg font-black text-text">₹{stats.online.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Physical Action */}
                <div className="bg-text p-6 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -mr-16 -mt-16 rotate-45"></div>
                    <h4 className="text-[10px] font-black text-background uppercase tracking-widest border-b border-background/10 pb-3 relative z-10">Physical Cash Count</h4>
                    <div className="space-y-5 relative z-10">
                        <p className="text-xs text-background/60 leading-relaxed font-medium">Please enter the total physical cash available in your cash drawer. Managers will verify this against system journals.</p>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-background/40 uppercase tracking-widest">Net Physical Cash (INR)</label>
                            <input
                                type="number"
                                className="w-full bg-background/5 border border-background/10 text-2xl font-black text-background p-4 focus:bg-background/10 outline-none transition-all"
                                placeholder="0.00"
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                            />
                        </div>
                        {actualCash && Number(actualCash) !== stats.cash && (
                            <div className="p-3 bg-rose-500 text-white flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] font-black uppercase">Discrepancy Detected</p>
                                    <p className="text-[10px] font-bold opacity-90">Variance: ₹{Math.abs(Number(actualCash) - stats.cash)} {Number(actualCash) > stats.cash ? '(Surplus)' : '(Shortage)'}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={handleCloseDay}
                            className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                        >Finalize & Lock Terminal</button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-surface-alt border border-border">
                <AlertCircle className="w-4 h-4 text-text-muted" />
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Warning: Once finalized, no new bills can be generated until the next business day starts.</p>
            </div>
        </div>
    );
}
