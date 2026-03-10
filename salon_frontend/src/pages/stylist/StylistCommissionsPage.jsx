import { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, Award, Zap, CreditCard, Activity, Target, Shield, X, CheckCircle2, ChevronDown, Award as AwardIcon, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import stylistData from '../../data/stylistMockData.json';

const earningsHistory = stylistData.commissions.earningsHistory;
const fiscalPeriods = ['CURRENT_CYCLE', 'PREVIOUS_CYCLE', 'FISCAL_YTD', 'CUSTOM_RANGE'];
const incentiveSlabs = stylistData.commissions.incentiveSlabs;
const stats = stylistData.commissions.stats;

export default function StylistCommissionsPage() {
    const [period, setPeriod] = useState(fiscalPeriods[0]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [showSlabModal, setShowSlabModal] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="space-y-4 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Earnings Stream</span>
                    </div>
                    <h1 className="text-2xl font-black text-text tracking-tighter uppercase">My Commissions</h1>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5 italic">Current Earnings Overview</p>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                        className="flex items-center gap-2 px-5 py-3 bg-surface border border-border text-[8px] font-black text-text-muted hover:text-text hover:border-primary/50 transition-all uppercase tracking-[0.2em]"
                    >
                        <Calendar className="w-3.5 h-3.5" /> {period.replace('_', ' ')} <ChevronDown className="w-3 h-3 ml-2" />
                    </button>

                    <AnimatePresence>
                        {showPeriodDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border shadow-2xl z-50 py-2"
                            >
                                {fiscalPeriods.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => {
                                            setPeriod(p);
                                            setShowPeriodDropdown(false);
                                            showToast(`Data updated for: ${p.replace('_', ' ')}`);
                                        }}
                                        className={`w-full px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest hover:bg-surface-alt transition-colors ${period === p ? 'text-primary' : 'text-text-muted'}`}
                                    >
                                        {p.replace('_', ' ')}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => {
                    const iconMap = {
                        'Total_Earned': { icon: DollarSign, color: 'text-emerald-500' },
                        'Yield_Units': { icon: Zap, color: 'text-primary' },
                        'Rep_Index': { icon: Award, color: 'text-amber-500' },
                        'Base_Allocation': { icon: CreditCard, color: 'text-blue-500' }
                    };
                    const { icon: Icon, color } = iconMap[s.label];
                    return (
                        <div key={s.label} className="bg-surface border border-border p-4 relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                            <div className="w-9 h-9 bg-background border border-border flex items-center justify-center mb-3 text-primary shadow-inner">
                                <Icon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                            <p className="text-xl font-black text-text tracking-tighter uppercase">{s.value}</p>
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5 italic">{s.label === 'Total_Earned' ? 'Total Commissions' : s.label === 'Yield_Units' ? 'Total Services' : s.label === 'Rep_Index' ? 'Reputation Score' : 'Fixed Base Salary'}</p>
                            <p className="text-[7px] text-text-muted/60 uppercase mt-0.5 italic tracking-widest">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Iteration Log */}
                <div className="lg:col-span-2 bg-surface border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/20 bg-background/50 flex items-center justify-between">
                        <h2 className="text-[9px] font-black text-text uppercase tracking-[0.2em]">Recent Earnings Log</h2>
                        <span className="text-[7px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 border border-primary/20">Verified Data</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/20 bg-background/30 font-black">
                                    <th className="px-8 py-4 text-[9px] text-text-muted uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-4 text-[9px] text-text-muted uppercase tracking-[0.2em]">Services Done</th>
                                    <th className="px-8 py-4 text-[9px] text-text-muted uppercase tracking-[0.2em]">Bill Amount</th>
                                    <th className="px-8 py-4 text-[9px] text-text-muted uppercase tracking-[0.2em] text-right">My Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {earningsHistory.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-surface-alt/50 transition-all group font-black">
                                        <td className="px-8 py-5 text-[10px] text-text-muted group-hover:text-text transition-colors uppercase">{row.date}</td>
                                        <td className="px-8 py-5 text-[10px] text-text uppercase">{row.services} OPS</td>
                                        <td className="px-8 py-5 text-[10px] text-text uppercase">₹{row.revenue.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right font-black">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[11px] text-emerald-500 font-black tracking-tight">₹{row.commission.toLocaleString()}</span>
                                                <span className={`text-[7px] uppercase tracking-widest mt-1 font-bold ${row.status === 'SETTLED' ? 'text-primary/70' : 'text-amber-500 animate-pulse'}`}>
                                                    [{row.status}]
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Vector */}
                <div className="bg-surface border border-border p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="w-24 h-24 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h2 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Monthly Target Performance</h2>
                        </div>

                        <div className="space-y-10">
                            <div className="text-center relative">
                                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                    <div className="w-32 h-32 border-4 border-primary rounded-full shadow-2xl" />
                                </div>
                                <p className="text-6xl font-black text-text tracking-tighter">85%</p>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-2 italic">Target Progress</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-text-muted">
                                    <span>Quota Done</span>
                                    <span className="text-primary">850/1000 TOTAL</span>
                                </div>
                                <div className="h-4 bg-background border border-border p-0.5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 border border-primary/20 text-center relative overflow-hidden">
                                <p className="text-[9px] text-text-muted uppercase tracking-[0.1em] font-bold leading-relaxed italic relative z-10">
                                    Generate <span className="text-primary font-black">₹15,000</span> additional revenue to bypass <span className="text-white bg-primary px-1.5 py-0.5 mx-1 shadow-lg shadow-primary/20">SUPERSTAR_PROTOCOL</span> threshold.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSlabModal(true)}
                        className="mt-10 w-full py-5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all group"
                    >
                        View Incentive Slab <ArrowUpRight className="inline w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Slab Modal */}
            <AnimatePresence>
                {showSlabModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSlabModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-none border border-border shadow-2xl relative p-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 -translate-y-4 translate-x-4">
                                <AwardIcon className="w-32 h-32 text-primary" />
                            </div>
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Yield Hierarchy</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">Protocol: Incentive_Matrix_V4</p>
                                </div>
                                <button onClick={() => setShowSlabModal(false)} className="w-10 h-10 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {incentiveSlabs.map((slab, idx) => (
                                    <div key={idx} className={`p-6 border flex items-center justify-between transition-all ${slab.status === 'ACTIVE' ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' : 'bg-background/50 border-border/40 opacity-50'}`}>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${slab.status === 'ACTIVE' ? 'text-primary' : 'text-text-muted'}`}>{slab.tier}</p>
                                            <p className="text-sm font-black text-text mt-1 uppercase tracking-tight">{slab.range}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-text tracking-tighter">{slab.yield}</p>
                                            <p className="text-[8px] font-black text-primary uppercase italic">{slab.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-5 bg-surface-alt border border-border flex items-center gap-4 relative z-10">
                                <Shield className="w-5 h-5 text-primary shrink-0" />
                                <p className="text-[9px] font-black text-text-muted uppercase leading-relaxed tracking-widest italic">
                                    Commissions are finalized on a <span className="text-text">bi-weekly sequence</span>. Tier upgrades bypass occurs immediately upon threshold clearance.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
