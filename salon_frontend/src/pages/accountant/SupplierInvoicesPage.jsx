import { useState } from 'react';
import { FileText, Search, Filter, Download, Plus, Clock, CheckCircle2, AlertCircle, Eye, MoreHorizontal, ArrowDownCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupplierInvoicesPage() {
    const invoices = [
        { id: 'INV-SUP-892', supplier: 'Beauty Hub Ltd', date: 'Feb 23, 2024', dueDate: 'Mar 10, 2024', amount: '₹12,450', status: 'Approved', type: 'Credit' },
        { id: 'INV-SUP-891', supplier: 'Lotus Cosmetics', date: 'Feb 22, 2024', dueDate: 'Feb 28, 2024', amount: '₹8,900', status: 'Pending', type: 'COD' },
        { id: 'INV-SUP-890', supplier: 'Matrix Distribution', date: 'Feb 20, 2024', dueDate: 'Mar 05, 2024', amount: '₹22,000', status: 'Paid', type: 'Credit' },
        { id: 'INV-SUP-889', supplier: 'Salon Solutions', date: 'Feb 18, 2024', dueDate: 'Feb 18, 2024', amount: '₹3,500', status: 'Paid', type: 'Advance' },
        { id: 'INV-SUP-888', supplier: 'Beauty Hub Ltd', date: 'Feb 15, 2024', dueDate: 'Mar 01, 2024', amount: '₹15,200', status: 'Overdue', type: 'Credit' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Supplier Invoices</h1>
                    <p className="text-sm text-text-muted font-medium">Verify and approve invoices from inventory suppliers</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all">
                        <ArrowDownCircle className="w-4 h-4" /> Import Bulk
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all text-left">
                        <Plus className="w-4 h-4" /> Add Voucher
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <Clock className="w-8 h-8 text-primary mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Awaiting Approval</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹45,600</h3>
                    <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-tight">8 Pending Invoices</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Overdue</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹15,200</h3>
                    <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-tight">2 Invoices Critical</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Paid this Month</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹2,84,000</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-tight">+14% vs Last Month</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Inbound Invoices</h2>
                    <div className="flex gap-2">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" placeholder="Search invoices..." className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Invoice ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Billing Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-primary uppercase">{inv.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest">{inv.type}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{inv.supplier}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{inv.date}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{inv.dueDate}</td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                            inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                                inv.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-500' :
                                                    'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">{inv.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 hover:bg-background rounded-lg text-text-muted transition-colors" title="View Detail">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-background rounded-lg text-text-muted transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
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
