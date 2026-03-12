import { useState } from 'react';
import {
    TrendingUp, TrendingDown, DollarSign, Wallet, FileText,
    ArrowUpRight, ArrowDownRight, PieChart as LucidePieChart, Calendar, ChevronRight,
    Search, Filter, Download, Calculator, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../../contexts/FinanceContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const cashFlowData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
    { name: 'Jul', income: 3490, expenses: 4300 },
];

const expenseSplitData = [
    { name: 'Inventory', value: 45, color: '#3b82f6' },
    { name: 'Rent & Utilities', value: 25, color: '#ef4444' },
    { name: 'Staff Payouts', value: 20, color: '#f59e0b' },
    { name: 'Marketing', value: 10, color: '#6366f1' },
];

export default function AccountantDashboard() {
    const { totalRevenue, totalExpenses, netProfit, revenue, expenses } = useFinance();

    const stats = [
        { label: 'Net Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+12.5%', isPositive: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Operational Expenses', value: `₹${totalExpenses.toLocaleString()}`, change: '+2.4%', isPositive: false, icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Account Payables', value: '₹1,12,000', change: '-5.2%', isPositive: true, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, change: '+18.1%', isPositive: true, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    ];

    const recentTransactions = [
        ...revenue.map(r => ({ id: `REV-${r.id}`, desc: r.source, type: 'Credit', amount: `₹${r.amount.toLocaleString()}`, date: r.date, status: r.status })),
        ...expenses.map(e => ({ id: `EXP-${e.id}`, desc: e.vendor, type: 'Debit', amount: `₹${e.amount.toLocaleString()}`, date: e.date, status: e.status }))
    ].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

    return (
        <div className="space-y-6 text-left font-black">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Financial Overview</h1>
                    <p className="text-sm text-text-muted font-medium">Real-time health of your business finances</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-all">
                        <Calendar className="w-3.5 h-3.5" /> This Quarter
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all text-left">
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
                        className="p-6 bg-surface rounded-none border border-border shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all"
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-none ${stat.bg} flex items-center justify-center shrink-0`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-none ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
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
                <div className="lg:col-span-2 p-8 bg-surface rounded-none border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-text tracking-tight uppercase">Cash Flow</h2>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">Revenue vs Operational Cost</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-primary" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-none bg-rose-500" />
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Expenses</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Bar dataKey="income" fill="var(--primary)" barSize={20} />
                                <Bar dataKey="expenses" fill="#ef4444" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Splits */}
                <div className="p-8 bg-surface rounded-none border border-border shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-text tracking-tight uppercase mb-8">Expense Splits</h2>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseSplitData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {expenseSplitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xl font-black text-text">₹{(totalExpenses / 100000).toFixed(1)}L</p>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Total Cost</p>
                        </div>
                    </div>
                    <div className="space-y-3 mt-8">
                        {expenseSplitData.map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-text uppercase tracking-widest">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between bg-surface/50">
                    <div>
                        <h2 className="text-sm font-black text-text uppercase tracking-[0.2em] leading-none">Journal Entry</h2>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Live Transaction Stream</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-background border border-border/40 rounded-none text-[10px] font-black text-text-secondary hover:bg-surface-alt transition-all group">
                        View Audit Trail <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
                <div className="divide-y divide-border/40">
                    {recentTransactions.map((txn) => (
                        <div key={txn.id} className="px-8 py-6 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group text-left">
                            <div className="flex items-center gap-4 text-left font-black">
                                <div className={`w-10 h-10 rounded-none bg-background border border-border/10 flex items-center justify-center shrink-0 ${txn.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {txn.type === 'Credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{txn.desc}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{txn.id}</span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-[10px] text-text-muted font-bold uppercase">{txn.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right font-black">
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
