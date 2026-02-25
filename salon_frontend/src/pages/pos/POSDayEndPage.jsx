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
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-none flex items-center justify-center shadow-lg shadow-emerald-500/5">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Terminal_Offline</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                        EOD_REPORT_COMMITTED_SUCCESSFULLY. DATA PACKETS RELAYED TO CENTRAL REGISTRY. MASTER LEDGER SYNC: 100%.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-10 py-4 bg-text text-background font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 hover:opacity-90 active:scale-95 transition-all shadow-xl">
                        <Printer className="w-5 h-5" /> Export Z-Report_Thermal
                    </button>
                    <button className="px-10 py-4 bg-surface border border-border font-black text-[11px] uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt active:scale-95 transition-all shadow-sm">
                        <Download className="w-5 h-5" /> Archive_Blob (CSV)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase">EOD_TERMINATE_PROTOCOL</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        Session Loop Termination: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-amber-500/20 animate-pulse">
                        AUDIT_LOCK_PENDING
                    </span>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">SEQ_ID: EOD-2026-052</span>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Packet Count (Bills)', val: stats.count, icon: Calculator, sub: 'UNITS_PROCESSED' },
                    { label: 'Gross Inflow', val: `₹${stats.total.toLocaleString()}`, icon: TrendingUp, sub: 'VAL_AGGREGATE', color: 'text-emerald-500' },
                    { label: 'Executive Credit', val: `₹${(stats.total * 0.12).toLocaleString()}`, icon: ArrowRight, sub: 'EST_COMMISSION', color: 'text-primary' },
                ].map((m, i) => (
                    <div key={i} className="bg-surface p-6 border border-border shadow-sm group hover:border-primary/40 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 -mr-8 -mt-8 rotate-45 pointer-events-none" />
                        <p className="text-[10px] font-black text-text-muted uppercase mb-6 tracking-[0.2em]">{m.label}</p>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h3 className={`text-4xl font-black text-text tracking-tighter ${m.color || ''}`}>{m.val}</h3>
                                <p className="text-[8px] font-black text-text-muted opacity-40 uppercase tracking-widest mt-1">{m.sub}</p>
                            </div>
                            <m.icon className="w-10 h-10 text-primary opacity-5 group-hover:opacity-10 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* System Totals */}
                <div className="bg-surface border border-border shadow-sm p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/[0.02] -mr-24 -mb-24 rounded-full blur-3xl pointer-events-none" />
                    <h4 className="text-[11px] font-black text-text uppercase tracking-[0.3em] border-b border-border pb-5 flex items-center justify-between">
                        Digital_Registry_Summary
                        <span className="text-[8px] text-text-muted opacity-40">NODE_FIN_STREAM</span>
                    </h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Liquid_Asset_HND', protocol: 'System_Expected', val: stats.cash, icon: Banknote, color: 'bg-emerald-500', text: 'text-emerald-500' },
                            { label: 'Bank_Terminal_SETL', protocol: 'Acquirer_Registry', val: stats.card, icon: CreditCard, color: 'bg-blue-500', text: 'text-blue-500' },
                            { label: 'Cloud_Wallet_INT', protocol: 'Gateway_Verify', val: stats.online, icon: Smartphone, color: 'bg-purple-500', text: 'text-purple-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-surface-alt/50 border border-border group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 ${item.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}><item.icon className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[11px] font-black text-text uppercase tracking-tight">{item.label}</p>
                                        <p className={`text-[9px] ${item.text} font-black uppercase tracking-widest mt-1`}>{item.protocol}</p>
                                    </div>
                                </div>
                                <p className="text-xl font-black text-text tracking-tighter">₹{item.val.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Physical Action */}
                <div className="bg-text p-8 space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 -mr-24 -mt-24 rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <h4 className="text-[11px] font-black text-background uppercase tracking-[0.4em] border-b border-background/10 pb-5 mb-8">Physical_Asset_Count</h4>
                        <div className="space-y-8">
                            <p className="text-[11px] text-background/50 leading-relaxed font-bold uppercase tracking-tight max-w-sm">
                                AUDIT_PROTOCOL: INPUT TOTAL PHYSICAL LIQUIDITY IN CURRENCY DRAWER. VERIFY AGAINST SYNC_JOURNAL.
                            </p>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-background/30 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-none" />
                                    Net_Currency_HND (INR)
                                </label>
                                <div className="relative group/input">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-background/40 font-black text-2xl">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-background/5 border border-background/10 text-4xl font-black text-background pl-16 pr-8 py-6 focus:bg-background/10 outline-none transition-all placeholder:text-background/5 focus:border-primary/30"
                                        placeholder="0.00"
                                        value={actualCash}
                                        onChange={(e) => setActualCash(e.target.value)}
                                    />
                                </div>
                            </div>

                            {actualCash && Number(actualCash) !== stats.cash && (
                                <div className="p-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest border-b border-rose-500/20 pb-1 mb-2 flex items-center gap-2">
                                            DISCREPANCY_DETECTED
                                            <span className="text-[8px] px-1 bg-rose-500 text-white">LOW_CONFIDENCE</span>
                                        </p>
                                        <p className="text-sm font-black tracking-tight flex items-baseline gap-2">
                                            Variance: ₹{Math.abs(Number(actualCash) - stats.cash).toLocaleString()}
                                            <span className="text-[10px] font-bold opacity-60 uppercase">({Number(actualCash) > stats.cash ? 'Surplus' : 'Shortage'})</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCloseDay}
                                className="w-full py-5 bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 group/btn"
                            >
                                <span className="flex items-center justify-center gap-4">
                                    COMIT_LEDGER_&_LOCK <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-5 p-6 bg-surface-alt/50 border border-border shadow-sm transform hover:scale-[1.01] transition-all">
                <div className="w-10 h-10 border border-border flex items-center justify-center text-text-muted shrink-0">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-relaxed">
                    <span className="text-primary tracking-[0.3em]">SYSTEM_WARN:</span> TRANSACTION_SEQUENCE_LOCKDOWN_IMMINENT. ONCE COMMITTED, RE-INITIALIZATION REQUIRES MASTER_ADMIN_OVERRIDE.
                </p>
            </div>
        </div>
    );
}
