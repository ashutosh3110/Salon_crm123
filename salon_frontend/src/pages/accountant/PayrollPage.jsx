import { useState } from 'react';
import { Wallet, Search, Filter, Download, User, ArrowRight, CheckCircle2, MoreHorizontal, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../../contexts/FinanceContext';

export default function PayrollPage() {
    const { payroll } = useFinance();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const totalSalarySum = payroll.reduce((acc, curr) => acc + (typeof curr.salary === 'number' ? curr.salary : 0), 0);
    const totalCommissionSum = payroll.reduce((acc, curr) => acc + (typeof curr.commission === 'number' ? curr.commission : 0), 0);
    const processedCount = payroll.filter(p => p.status === 'Paid').length;

    const payrollSummary = [
        { label: 'Total Payroll', value: `₹${totalSalarySum.toLocaleString()}`, sub: 'Current Month' },
        { label: 'Total Commissions', value: `₹${totalCommissionSum.toLocaleString()}`, sub: 'Performance Based' },
        { label: 'Payouts Processed', value: `${processedCount}/${payroll.length}`, sub: 'Staff Members' },
    ];

    const filteredStaff = payroll.filter(staff => {
        const name = staff.name || '';
        const role = staff.role || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || staff.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex bg-background border border-border p-1 rounded-none">
                            {['All', 'Paid', 'Processing', 'Pending'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-none text-[10px] font-extrabold uppercase tracking-widest outline-none focus:border-primary transition-colors"
                            />
                        </div>
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
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-none bg-background border border-border/10 flex items-center justify-center text-text-muted italic text-xs font-black shrink-0">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{staff.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{staff.role}</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase ${staff.attendanceScore > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                        {staff.attendanceScore}% ATT
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-text-secondary">₹{staff.salary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">₹{staff.commission.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-rose-500">
                                        <div className="flex flex-col">
                                            <span>₹{staff.totalDeductions.toLocaleString()}</span>
                                            {staff.totalDeductions > staff.deductions && (
                                                <span className="text-[8px] opacity-60 uppercase font-black">Incl. Attendance</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter ${staff.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                            staff.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">₹{(staff.salary + staff.commission - staff.totalDeductions).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-background rounded-none text-text-muted hover:text-text transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No staff records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
