import { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Filter, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RevenuePage() {
    const stats = [
        { label: 'Total Revenue', value: '₹14,25,000', change: '+12.5%', isPositive: true },
        { label: 'Avg. Transaction', value: '₹1,450', change: '+3.2%', isPositive: true },
        { label: 'Tax Collected', value: '₹2,56,500', change: '+10.8%', isPositive: true },
        { label: 'Refunds', value: '₹12,400', change: '-5.4%', isPositive: false },
    ];

    const revenueData = [
        { id: 1, date: 'Feb 23, 2024', source: 'Services - Hair Styling', amount: '₹4,500', tax: '₹810', method: 'UPI', status: 'Completed' },
        { id: 2, date: 'Feb 23, 2024', source: 'Product - L\'Oréal Shampoo', amount: '₹1,200', tax: '₹216', method: 'Cash', status: 'Completed' },
        { id: 3, date: 'Feb 22, 2024', source: 'Services - Facial Treatment', amount: '₹3,500', tax: '₹630', method: 'Card', status: 'Completed' },
        { id: 4, date: 'Feb 22, 2024', source: 'Membership - Gold', amount: '₹15,000', tax: '₹2,700', method: 'UPI', status: 'Completed' },
        { id: 5, date: 'Feb 21, 2024', source: 'Services - Hair Colouring', amount: '₹8,500', tax: '₹1,530', method: 'Card', status: 'Processing' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Revenue Analytics</h1>
                    <p className="text-sm text-text-muted font-medium">Detailed breakdown of income and sales tax</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-all">
                        <Calendar className="w-3.5 h-3.5" /> This Month
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        className="p-6 bg-surface rounded-none border border-border shadow-sm group hover:border-primary/20 transition-all"
                    >
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-xl font-black text-text tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-none ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-md">All Revenue</button>
                <button className="px-4 py-2 bg-surface border border-border/40 text-text-secondary rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">Service Sales</button>
                <button className="px-4 py-2 bg-surface border border-border/40 text-text-secondary rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">Product Sales</button>
                <button className="px-4 py-2 bg-surface border border-border/40 text-text-secondary rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all">Memberships</button>
                <div className="flex-1" />
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-colors">
                    <Filter className="w-3.5 h-3.5" /> More Filters
                </button>
            </div>

            {/* Revenue Table */}
            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Source / Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Tax (GST)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Method</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {revenueData.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{item.source}</p>
                                        <p className="text-[10px] text-text-muted font-medium">INV-2024-00{item.id}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">{item.tax}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-background border border-border/10 text-text-secondary">{item.method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter ${item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">{item.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
