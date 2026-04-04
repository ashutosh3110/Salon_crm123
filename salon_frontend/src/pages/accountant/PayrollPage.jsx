import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Search, Filter, Download, User, ArrowRight, CheckCircle2, MoreHorizontal, DollarSign, Calendar, TrendingUp, Zap, RefreshCcw, AlertCircle, X, Info, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../../contexts/FinanceContext';

export default function PayrollPage() {
    const { 
        payroll, 
        fetchPayroll, 
        generatePayroll, 
        syncCommissions, 
        syncAttendance, 
        processPayouts, 
        updatePayrollEntry,
        payrollPeriod 
    } = useFinance();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isProcessing, setIsProcessing] = useState(false);
    const [editModal, setEditModal] = useState(null); // { entryId, data }
    const [salarySlip, setSalarySlip] = useState(null);

    const now = new Date();
    const [selectedPeriod, setSelectedPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });

    // Toast logic
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const showToast = useCallback((message, type = 'success') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => {
        fetchPayroll(selectedPeriod.year, selectedPeriod.month);
    }, [fetchPayroll, selectedPeriod]);

    const handleGenerate = async () => {
        setIsProcessing(true);
        try {
            await generatePayroll(selectedPeriod.year, selectedPeriod.month);
            showToast(`Payroll entries generated for ${selectedPeriod.month}/${selectedPeriod.year}`);
        } catch (error) {
            showToast('Failed to generate payroll. Check staff status.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSyncCommissions = async () => {
        setIsProcessing(true);
        try {
            const res = await syncCommissions(selectedPeriod.year, selectedPeriod.month);
            showToast(`Synced commissions for ${res.synced} staff members!`);
        } catch (error) {
            showToast('Failed to sync commissions.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSyncAttendance = async () => {
        setIsProcessing(true);
        try {
            const res = await syncAttendance(selectedPeriod.year, selectedPeriod.month);
            showToast(`Synced attendance for ${res.synced} staff members!`);
        } catch (error) {
            showToast('Failed to sync attendance.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProcessPayouts = async () => {
        if (payroll.length === 0) return;
        if (!confirm('Do you want to mark all entries as PAID? This will auto-create finance transactions.')) return;
        
        setIsProcessing(true);
        try {
            await processPayouts(selectedPeriod.year, selectedPeriod.month);
            showToast('All payouts processed and recorded in Finance!', 'success');
        } catch (error) {
            showToast('Processing failed. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateEntry = async (id, data) => {
        try {
            await updatePayrollEntry(id, data);
            showToast('Updated successfully');
            setEditModal(null);
        } catch (error) {
            showToast('Update failed', 'error');
        }
    };

    const totalSalarySum = payroll.reduce((acc, curr) => acc + (curr.salary || 0), 0);
    const totalNetPayout = payroll.reduce((acc, curr) => acc + (curr.netPay || 0), 0);
    const totalDeductions = payroll.reduce((acc, curr) => acc + (curr.totalDeductions || 0), 0);
    const processedCount = payroll.filter(p => p.status === 'paid').length;

    const payrollSummary = [
        { label: 'Total Base Payroll', value: `₹${totalSalarySum.toLocaleString()}`, sub: 'Static cost' },
        { label: 'Net Payouts', value: `₹${totalNetPayout.toLocaleString()}`, sub: 'After incentives & deductions' },
        { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString()}`, sub: 'Attendance & Advance' },
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
            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 shadow-2xl ${
                            toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-text text-background'
                        }`}
                    >
                        {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-200" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        <p className="text-[11px] font-black uppercase tracking-[0.1em]">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Payroll & Commissions</h1>
                    <div className="flex items-center gap-3">
                        <select 
                            value={selectedPeriod.month}
                            onChange={(e) => setSelectedPeriod(p => ({ ...p, month: parseInt(e.target.value) }))}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest border-b-2 border-primary outline-none py-1"
                        >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedPeriod.year}
                            onChange={(e) => setSelectedPeriod(p => ({ ...p, year: parseInt(e.target.value) }))}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest border-b-2 border-primary outline-none py-1"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {payroll.length > 0 && (
                        <>
                            <button 
                                onClick={handleSyncCommissions}
                                disabled={isProcessing || payrollPeriod?.locked}
                                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all disabled:opacity-50"
                            >
                                <TrendingUp className="w-4 h-4 text-emerald-500" /> Sync Commissions
                            </button>
                            <button 
                                onClick={handleSyncAttendance}
                                disabled={isProcessing || payrollPeriod?.locked}
                                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all disabled:opacity-50"
                            >
                                <Calendar className="w-4 h-4 text-amber-500" /> Sync Attendance
                            </button>
                        </>
                    )}
                    
                    {payroll.length === 0 ? (
                        <button 
                            onClick={handleGenerate}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all"
                        >
                            <Zap className="w-4 h-4" /> Generate {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedPeriod.month - 1]} Payroll
                        </button>
                    ) : (
                        <button 
                            onClick={handleProcessPayouts}
                            disabled={isProcessing || payroll.every(p => p.status === 'paid')}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            <Wallet className="w-4 h-4" /> {isProcessing ? 'Processing...' : 'Mark All As Paid'}
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {payrollSummary.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label}
                        className="p-6 bg-surface border border-border group hover:border-primary/20 transition-all"
                    >
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black text-text tracking-tight group-hover:text-primary transition-colors">{item.value}</h3>
                        <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-wide italic">{item.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Payroll Table */}
            <div className="bg-surface border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Staff Salary Register</h2>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 text-primary uppercase tracking-widest">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedPeriod.month - 1]} {selectedPeriod.year}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-background border border-border p-1 rounded-none">
                            {['All', 'paid', 'draft'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                >
                                    {status === 'draft' ? 'Pending' : status}
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
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50 text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Salary Detail</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Commission</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Bonus/Adv.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">In/Out Summary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Net Payout</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-surface-alt/50 transition-colors group text-left">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-background border border-border/10 flex items-center justify-center text-text-muted italic text-xs font-black">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{staff.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{staff.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-text-secondary">Base: ₹{staff.salary.toLocaleString()}</span>
                                            {staff.attendanceDeduction > 0 && (
                                                <span className="text-[8px] text-rose-500 font-black uppercase tracking-tight">-₹{staff.attendanceDeduction.toLocaleString()} LWP</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-emerald-500">₹{staff.commission.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-emerald-600">+{staff.incentive.toLocaleString()} Bonus</span>
                                            {staff.advance > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[9px] font-black uppercase ${staff.deductAdvance ? 'text-rose-500' : 'text-text-muted opacity-50'}`}>
                                                        -₹{staff.advance.toLocaleString()} Adv.
                                                    </span>
                                                    {staff.deductAdvance ? (
                                                        <span className="text-[7px] bg-rose-500/10 text-rose-500 px-1 font-black leading-none py-0.5">DEDUCTING</span>
                                                    ) : (
                                                        <span className="text-[7px] bg-border text-text-muted px-1 font-black leading-none py-0.5">HOLD</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-text">ATT: {staff.attendanceScore}%</span>
                                                <span className="text-[8px] font-bold text-text-muted uppercase">{staff.attendanceDays} Days Present</span>
                                            </div>
                                            <span className={`w-1.5 h-1.5 rounded-full ${staff.attendanceScore > 90 ? 'bg-emerald-500' : staff.attendanceScore > 75 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-text uppercase">₹{staff.netPay.toLocaleString()}</span>
                                            <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 mt-1 uppercase ${staff.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {staff.status === 'draft' ? 'UNPAID' : 'Transferred'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setEditModal({ id: staff.id, data: staff })}
                                                disabled={payrollPeriod?.locked || staff.status === 'paid'}
                                                className="p-1.5 hover:bg-primary/10 text-text-muted hover:text-primary transition-all disabled:opacity-30"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setSalarySlip(staff)}
                                                className="p-1.5 hover:bg-emerald-500/10 text-text-muted hover:text-emerald-500 transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (Incentive & Advance) */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setEditModal(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-surface border border-border shadow-2xl p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-text uppercase tracking-widest">Adjust Payroll</h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase">{editModal.data.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-background transition-colors">
                                    <X className="w-4 h-4 text-text-muted" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">Performance Bonus (Incentive)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input 
                                            type="number"
                                            value={editModal.data.incentive}
                                            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, incentive: parseInt(e.target.value) || 0 }})}
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-border text-xs font-black outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-background border border-border border-dashed">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-2">Advance Salary / Loan</label>
                                    <div className="relative mb-4">
                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                                        <input 
                                            type="number"
                                            value={editModal.data.advance}
                                            onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, advance: parseInt(e.target.value) || 0 }})}
                                            className="w-full pl-10 pr-4 py-3 bg-background border border-border text-xs font-black outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-text uppercase">Deduct this month?</span>
                                            <span className="text-[8px] text-text-muted font-bold uppercase">If OFF, loan amount is tracked but not cut.</span>
                                        </div>
                                        <button 
                                            onClick={() => setEditModal({ ...editModal, data: { ...editModal.data, deductAdvance: !editModal.data.deductAdvance }})}
                                            className={`relative w-9 h-5 rounded-none transition-colors ${editModal.data.deductAdvance ? 'bg-rose-500' : 'bg-border'}`}
                                        >
                                            <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white transition-all ${editModal.data.deductAdvance ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => setEditModal(null)}
                                        className="flex-1 px-4 py-3 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-background transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateEntry(editModal.id, { 
                                            incentive: editModal.data.incentive, 
                                            advance: editModal.data.advance,
                                            deductAdvance: editModal.data.deductAdvance
                                        })}
                                        className="flex-1 px-4 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Salary Slip Viewer (Printable) */}
            <AnimatePresence>
                {salarySlip && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setSalarySlip(null)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white text-slate-900 p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
                            id="salary-slip"
                        >
                            <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-6">
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Salon Name</h1>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee Payslip - {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][selectedPeriod.month-1]} {selectedPeriod.year}</p>
                                </div>
                                <X className="w-6 h-6 text-slate-400 cursor-pointer print:hidden hover:text-slate-900" onClick={() => setSalarySlip(null)} />
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-12">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Employee Details</p>
                                        <p className="text-sm font-black uppercase">{salarySlip.name}</p>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase">{salarySlip.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Bank Info</p>
                                        <p className="text-[10px] font-bold uppercase">{salarySlip.bankName || '---'}</p>
                                        <p className="text-[10px] font-black tracking-tight">{salarySlip.bankAccountNo || '---'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Payment Method</p>
                                        <p className="text-[10px] font-black uppercase">Bank Transfer</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Status</p>
                                        <p className="text-[10px] font-black uppercase text-emerald-600">{salarySlip.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-2 border-slate-900 p-8 space-y-8">
                                <div className="flex justify-between items-center text-xs font-black uppercase border-b border-slate-100 pb-4">
                                    <span>Earnings</span>
                                    <span>Amount</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-500 uppercase">Basic Salary</span>
                                        <span className="font-black">₹{salarySlip.salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-500 uppercase">Sales Commission</span>
                                        <span className="font-black">₹{salarySlip.commission.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-500 uppercase">Performance Bonus</span>
                                        <span className="font-black">₹{salarySlip.incentive.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xs font-black uppercase border-b border-slate-100 pb-4 pt-4">
                                    <span>Deductions</span>
                                    <span />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs text-rose-500">
                                        <span className="font-bold uppercase tracking-tight">Attendance Deduction</span>
                                        <span className="font-black">-₹{salarySlip.attendanceDeduction.toLocaleString()}</span>
                                    </div>
                                    {salarySlip.deductAdvance && (
                                        <div className="flex justify-between text-xs text-rose-500">
                                            <span className="font-bold uppercase tracking-tight">Advance Recovery</span>
                                            <span className="font-black">-₹{salarySlip.advance.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs text-rose-500">
                                        <span className="font-bold uppercase tracking-tight">Other Deductions</span>
                                        <span className="font-black">-₹{(salarySlip.deductions || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-slate-400">Total Net Payout</span>
                                        <span className="text-3xl font-black tracking-tighter">₹{salarySlip.netPay.toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => window.print()} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest print:hidden">Print Slip</button>
                                </div>
                            </div>

                            <p className="text-[8px] font-bold text-slate-400 uppercase text-center mt-12 tracking-[0.3em]">Computer Generated Payslip - No Signature Required</p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
