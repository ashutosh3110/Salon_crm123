import { useState } from 'react';
import { Wallet, Search, Filter, Download, User, ArrowRight, CheckCircle2, MoreHorizontal, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PayrollPage() {
    const payrollSummary = [
        { label: 'Total Payroll', value: '₹5,35,000', sub: 'Current Month' },
        { label: 'Total Commissions', value: '₹1,12,400', sub: 'Performance Based' },
        { label: 'Payouts Processed', value: '14/15', sub: 'Staff Members' },
    ];

    const staffPayments = [
        { id: 1, name: 'Rahul Sharma', role: 'Senior Stylist', salary: '₹45,000', commission: '₹12,500', deductions: '₹2,000', net: '₹55,500', status: 'Paid' },
        { id: 2, name: 'Priya Patel', role: 'Dermatologist', salary: '₹65,000', commission: '₹24,000', deductions: '₹3,500', net: '₹85,500', status: 'Paid' },
        { id: 3, name: 'Amit Singh', role: 'Barber', salary: '₹30,000', commission: '₹8,900', deductions: '₹1,500', net: '₹37,400', status: 'Processing' },
        { id: 4, name: 'Sneha Kapur', role: 'Receptionist', salary: '₹25,000', commission: '₹0', deductions: '₹1,200', net: '₹23,800', status: 'Paid' },
        { id: 5, name: 'Vikram Das', role: 'Junior Stylist', salary: '₹22,000', commission: '₹4,500', deductions: '₹1,000', net: '₹25,500', status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Payroll & Commissions</h1>
                    <p className="text-sm text-text-muted font-medium">Manage staff salaries, incentives, and monthly payouts</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all">
                        <Wallet className="w-4 h-4" /> Process Payouts
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {payrollSummary.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label}
                        className="p-6 bg-surface rounded-none border border-border shadow-sm group hover:border-primary/20 transition-all"
                    >
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-text tracking-tight group-hover:text-primary transition-colors">{item.value}</h3>
                        <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-wide italic">{item.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Payroll Table */}
            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Staff Salary Register</h2>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-none bg-primary/10 text-primary uppercase tracking-widest">Feb 2024</span>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search employee..." className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-none text-[10px] font-extrabold uppercase tracking-widest outline-none focus:border-primary transition-colors" />
                    </div>
                </div>

                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Basic Salary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Commission</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Deductions</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Net Payout</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {staffPayments.map((staff) => (
                                <tr key={staff.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-none bg-background border border-border/10 flex items-center justify-center text-text-muted italic text-xs font-black shrink-0">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{staff.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{staff.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-text-secondary">{staff.salary}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">{staff.commission}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-rose-500">{staff.deductions}</td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter ${staff.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                            staff.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">{staff.net}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-background rounded-none text-text-muted hover:text-text transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
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
