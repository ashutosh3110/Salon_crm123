import { useState } from 'react';
import { Calculator, Search, Filter, ArrowLeftRight, CheckCircle2, AlertCircle, RefreshCcw, Download, Plus, MoreHorizontal, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReconciliationPage() {
    const reconItems = [
        { id: 'RC-101', date: 'Feb 23, 2024', desc: 'UPI Payment Batch - Styling Hub', systemAmt: '₹12,450', bankAmt: '₹12,450', status: 'Matched', diff: '₹0' },
        { id: 'RC-102', date: 'Feb 22, 2024', desc: 'Card Settlement - Merchant 821', systemAmt: '₹45,200', bankAmt: '₹44,800', status: 'Discrepancy', diff: '-₹400' },
        { id: 'RC-103', date: 'Feb 21, 2024', desc: 'Cash Deposit - Main Outlet', systemAmt: '₹15,000', bankAmt: '₹15,000', status: 'Matched', diff: '₹0' },
        { id: 'RC-104', date: 'Feb 20, 2024', desc: 'Supplier Payout - Beauty Hub', systemAmt: '-₹12,450', bankAmt: '₹0', status: 'Pending', diff: '₹12,450' },
    ];

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Bank Reconciliation</h1>
                    <p className="text-sm text-text-muted font-medium">Match internal records with bank statements and merchant settlements</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all transition-colors duration-300">
                        <ArrowLeftRight className="w-4 h-4" /> Import Statement
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                        <RefreshCcw className="w-4 h-4" /> Run Auto-Match
                    </button>
                </div>
            </div>

            {/* Reconciliation Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <LinkIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Connected Accounts</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Automated Bank Feeds</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-background border border-border/10 rounded-2xl group/bank hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-black text-text-muted">HDFC</div>
                                <div>
                                    <p className="text-xs font-black text-text">HDFC Corporate A/c</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest leading-none">**** 9281</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Linked</span>
                        </div>
                        <button className="w-full py-3.5 bg-background border border-dashed border-border/60 text-text-muted rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-surface-alt hover:text-primary transition-all">+ Add Bank Feed</button>
                    </div>
                </div>

                <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Unmatched Logs</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Action Required</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black text-text tracking-tighter">12</h2>
                            <div>
                                <p className="text-xs font-bold text-text-secondary leading-tight">Transactions couldn't be automatically reconciled.</p>
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5 hover:underline">Start Manual Matching →</button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/10">
                            <div className="h-full bg-amber-500 w-[65%]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reconciliation History Table */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Transaction Log Analysis</h2>
                    <div className="flex gap-2">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50 text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">ID / Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">System Amt</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Bank Amt</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Difference</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {reconItems.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-text-muted uppercase tracking-tighter">{item.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest">{item.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{item.desc}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-text-secondary">{item.systemAmt}</td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-text-secondary">{item.bankAmt}</td>
                                    <td className={`px-6 py-4 text-right text-xs font-black italic ${item.diff !== '₹0' ? 'text-rose-500' : 'text-text-muted opacity-30'}`}>
                                        {item.diff}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${item.status === 'Matched' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.status === 'Discrepancy' ? 'bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)] animate-pulse' :
                                                    'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {item.status}
                                            </span>
                                            {item.status === 'Matched' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
