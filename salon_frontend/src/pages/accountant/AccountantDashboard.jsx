import { useState } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Wallet, FileText,
    ArrowUpRight, ArrowDownRight, PieChart, Calendar, ChevronRight,
    Search, Filter, Download, Calculator, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AccountantDashboard() {
    const stats = [
        { label: 'Net Revenue', value: '₹14,25,000', change: '+12.5%', isPositive: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Operational Expenses', value: '₹4,85,000', change: '+2.4%', isPositive: false, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Account Payables', value: '₹1,12,000', change: '-5.2%', isPositive: true, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Net Profit', value: '₹8,28,000', change: '+18.1%', isPositive: true, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    ];

    const recentTransactions = [
        { id: 'TXN001', desc: 'Service Revenue - Outlet 1', type: 'Credit', amount: '₹4,500', date: 'Today, 2:30 PM', status: 'Completed' },
        { id: 'TXN002', desc: 'Supplier Payout - Beauty Hub', type: 'Debit', amount: '₹12,400', date: 'Today, 1:15 PM', status: 'Approved' },
        { id: 'TXN003', desc: 'Rent Settlement - Feb 24', type: 'Debit', amount: '₹85,000', date: 'Yesterday', status: 'Processing' },
        { id: 'TXN004', desc: 'Membership Gold - Amit Singh', type: 'Credit', amount: '₹15,000', date: 'Yesterday', status: 'Completed' },
    ];

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Financial Overview</h1>
                    <p className="text-sm text-text-muted font-medium">Real-time health of your business finances</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-alt transition-all">
                        <Calendar className="w-3.5 h-3.5" /> This Quarter
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all text-left">
                        <Download className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all"
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-text tracking-tight">{stat.value}</h3>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Cash Flow Chart */}
                <div className="lg:col-span-2 p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-text tracking-tight uppercase">Cash Flow</h2>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">Revenue vs Operational Cost</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Expenses</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-3 px-2">
                        {[40, 60, 45, 90, 65, 80, 55, 75, 85, 45, 70, 95].map((val, i) => (
                            <div key={i} className="flex-1 space-y-1 group relative">
                                <div className="w-full bg-rose-200/40 rounded-t-md transition-all group-hover:bg-rose-500/10" style={{ height: `${val * 0.4}%` }} />
                                <div className="w-full bg-primary/10 rounded-t-md transition-all group-hover:bg-primary" style={{ height: `${val * 0.6}%` }} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/40 flex justify-between px-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(mon => (
                            <span key={mon} className="text-[10px] font-black text-text-muted uppercase">{mon}</span>
                        ))}
                    </div>
                </div>

                {/* Expense Splits */}
                <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm">
                    <h2 className="text-xl font-black text-text tracking-tight uppercase mb-8">Expense Splits</h2>
                    <div className="flex flex-col items-center justify-center h-full max-h-[300px] mb-8 relative">
                        <div className="w-48 h-48 rounded-full border-[12px] border-primary relative flex items-center justify-center border-l-amber-500 border-t-rose-500 border-b-indigo-500 rotate-45">
                            <div className="text-center -rotate-45">
                                <p className="text-2xl font-black text-text">₹4.8L</p>
                                <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Total Costs</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 px-2">
                        {[
                            { label: 'Inventory', val: '45%', color: 'bg-primary' },
                            { label: 'Rent & Utilities', val: '25%', color: 'bg-rose-500' },
                            { label: 'Staff Payouts', val: '20%', color: 'bg-amber-500' },
                            { label: 'Marketing', val: '10%', color: 'bg-indigo-500' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-xs font-bold text-text-secondary">{item.label}</span>
                                </div>
                                <span className="text-xs font-black text-text">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="bg-surface rounded-[40px] border border-border/40 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-surface/50">
                    <div>
                        <h2 className="text-sm font-black text-text uppercase tracking-[0.2em] leading-none">Journal Entry</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Live Transaction Stream</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-background border border-border/40 rounded-xl text-[10px] font-black text-text-secondary hover:bg-surface-alt transition-all group">
                        View Audit Trail <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
                <div className="divide-y divide-border/40">
                    {recentTransactions.map((txn) => (
                        <div key={txn.id} className="px-8 py-6 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`w-10 h-10 rounded-xl bg-background border border-border/10 flex items-center justify-center shrink-0 ${txn.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {txn.type === 'Credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{txn.desc}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{txn.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-[10px] text-text-muted font-bold">{txn.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${txn.type === 'Credit' ? 'text-emerald-500' : 'text-text'}`}>
                                    {txn.type === 'Credit' ? '+' : '-'}{txn.amount}
                                </p>
                                <div className="flex items-center justify-end gap-1.5 mt-1">
                                    <div className={`w-1 h-1 rounded-full ${txn.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${txn.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{txn.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
