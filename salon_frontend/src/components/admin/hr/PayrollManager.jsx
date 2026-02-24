import React, { useState } from 'react';
import {
    Calculator,
    FileText,
    Download,
    CheckCircle2,
    Clock,
    ArrowRight,
    Search,
    Filter,
    ChevronDown,
    DollarSign,
    Lock,
    Unlock,
    AlertCircle,
    Calendar,
    Users
} from 'lucide-react';

const MOCK_PAYROLL = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', base: 25000, days: 28, commission: 4500, deductions: 500, net: 29000, status: 'paid' },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', base: 18000, days: 26, commission: 3200, deductions: 200, net: 21000, status: 'approved' },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', base: 15000, days: 30, commission: 0, deductions: 100, net: 14900, status: 'draft' },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', base: 45000, days: 29, commission: 12000, deductions: 1000, net: 56000, status: 'approved' },
];

export default function PayrollManager() {
    const [selectedMonth, setSelectedMonth] = useState('February 2024');
    const [isLocked, setIsLocked] = useState(false);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'draft': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Payroll Month</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <h2 className="text-xl font-bold text-text">{selectedMonth}</h2>
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 pr-4 relative z-10 border-l border-border pl-8">
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Total Payout</p>
                            <p className="text-2xl font-bold text-text mt-0.5">₹1,21,900</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Employees</p>
                            <p className="text-2xl font-bold text-text mt-0.5">24</p>
                        </div>
                    </div>
                    {/* decorative background element */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-50/50 blur-3xl group-hover:bg-blue-100/50 transition-colors" />
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden flex flex-col justify-between group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Payroll Security</span>
                            {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <h3 className="text-lg font-bold leading-tight">Finalize & Lock</h3>
                        <p className="text-[10px] text-white/50 leading-relaxed mt-1">Once locked, payroll cannot be edited without super-admin override.</p>
                    </div>
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={`relative z-10 w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${isLocked
                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                            : 'bg-white text-slate-900 hover:bg-emerald-400'
                            }`}
                    >
                        {isLocked ? 'Unlock Payroll' : 'Approve & Lock'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    {/* decorative background element */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
                </div>
            </div>

            {/* toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search employee salary..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 border border-border transition-all">
                        <Filter className="w-4 h-4" />
                        Status
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg">
                        <FileText className="w-4 h-4" />
                        Bulk Payslips
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Base Salary</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Commission</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Deductions</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Net Payable</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_PAYROLL.map((pay) => (
                                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-1 ring-blue-100">
                                                {pay.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{pay.staff}</p>
                                                <p className="text-[10px] text-text-muted font-bold tracking-tighter uppercase">{pay.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text">₹{pay.base.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">+₹{pay.commission.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-rose-500">-₹{pay.deductions.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-primary">₹{pay.net.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyles(pay.status)}`}>
                                                {pay.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            title="Download Payslip"
                                            className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-white hover:shadow-sm border border-transparent hover:border-border transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-border flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="text-[10px] text-text-muted font-bold tracking-tight">
                        Payroll for <span className="text-text font-bold">{selectedMonth}</span> is currently in <span className="text-amber-600 font-bold uppercase">{isLocked ? 'Locked' : 'Draft'}</span> mode.
                    </p>
                </div>
            </div>
        </div>
    );
}
