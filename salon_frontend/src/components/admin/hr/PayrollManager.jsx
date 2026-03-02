import { useState, useMemo } from 'react';
import { Calculator, FileText, Download, CheckCircle2, Clock, ArrowRight, Search, Filter, ChevronDown, Lock, Unlock, AlertCircle, Calendar, Users, X, Edit2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'];

const INITIAL_PAYROLL = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', base: 25000, days: 28, commission: 4500, deductions: 500, net: 29000, status: 'paid' },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', base: 18000, days: 26, commission: 3200, deductions: 200, net: 21000, status: 'approved' },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', base: 15000, days: 30, commission: 0, deductions: 100, net: 14900, status: 'draft' },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', base: 45000, days: 29, commission: 12000, deductions: 1000, net: 56000, status: 'approved' },
    { id: 5, staff: 'Priya Singh', role: 'Nail Tech', base: 16000, days: 24, commission: 1500, deductions: 0, net: 17500, status: 'draft' },
];

const STATUS_META = {
    paid: { label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    approved: { label: 'Approved', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    draft: { label: 'Draft', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function PayrollManager() {
    const [payroll, setPayroll] = useState(INITIAL_PAYROLL);
    const [monthIdx, setMonthIdx] = useState(1); // February 2025
    const [isLocked, setIsLocked] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [editModal, setEditModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [monthPickerOpen, setMonthPickerOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [payAllConfirm, setPayAllConfirm] = useState(false);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const filtered = useMemo(() => payroll.filter(p => {
        const matchSearch = p.staff.toLowerCase().includes(searchTerm.toLowerCase()) || p.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchSearch && matchStatus;
    }), [payroll, searchTerm, filterStatus]);

    const totalPayout = payroll.reduce((s, p) => s + p.net, 0);

    // ── Edit ─────────────────────────────────────────────────
    const openEdit = (rec) => {
        setEditModal(rec);
        setEditForm({ base: rec.base, commission: rec.commission, deductions: rec.deductions });
    };

    const saveEdit = (e) => {
        e.preventDefault();
        const net = Number(editForm.base) + Number(editForm.commission) - Number(editForm.deductions);
        setPayroll(prev => prev.map(p => p.id === editModal.id ? { ...p, ...editForm, base: Number(editForm.base), commission: Number(editForm.commission), deductions: Number(editForm.deductions), net } : p));
        setEditModal(null);
        showToast(`Payroll updated for ${editModal.staff}`);
    };

    // ── Mark as Paid (single) ────────────────────────────────
    const markPaid = (id) => {
        setPayroll(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
        showToast(`Marked as paid`);
    };

    // ── Pay All ──────────────────────────────────────────────
    const payAll = () => {
        if (isLocked) return showToast('Payroll is locked. Unlock to process.');
        setPayroll(prev => prev.map(p => ({ ...p, status: 'paid' })));
        setPayAllConfirm(false);
        showToast(`All ${payroll.length} payslips marked as Paid ✅`);
    };

    // ── Download Payslip ─────────────────────────────────────
    const downloadPayslip = (rec) => {
        const content = [
            '====================================',
            `     SALON CRM — PAYSLIP`,
            '====================================',
            `Employee : ${rec.staff}`,
            `Role     : ${rec.role}`,
            `Month    : ${MONTHS[monthIdx]}`,
            `Days     : ${rec.days}`,
            '------------------------------------',
            `Base Salary   : ₹${rec.base.toLocaleString()}`,
            `Commission    : ₹${rec.commission.toLocaleString()}`,
            `Deductions    : -₹${rec.deductions.toLocaleString()}`,
            '------------------------------------',
            `NET PAYABLE   : ₹${rec.net.toLocaleString()}`,
            `Status        : ${rec.status.toUpperCase()}`,
            '====================================',
        ].join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `payslip_${rec.staff.replace(' ', '_')}_${MONTHS[monthIdx]}.txt`;
        a.click();
    };

    // ── Bulk payslips ─────────────────────────────────────────
    const downloadAllPayslips = () => {
        const content = payroll.map(rec => [
            `${rec.staff} | ${rec.role} | ₹${rec.net.toLocaleString()} | ${rec.status.toUpperCase()}`
        ].join('')).join('\n');
        const blob = new Blob([`PAYROLL REPORT — ${MONTHS[monthIdx]}\n\n${content}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `payroll_${MONTHS[monthIdx]}.txt`; a.click();
        showToast('Bulk payslips downloaded');
    };

    return (
        <div className="space-y-5">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-surface p-5 rounded-3xl border border-border/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"><Calculator className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Active Payroll Month</p>
                            <div className="relative">
                                <button onClick={() => setMonthPickerOpen(v => !v)} className="flex items-center gap-2 mt-1 group/btn">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <h2 className="text-lg font-black text-text group-hover/btn:text-primary transition-colors">{MONTHS[monthIdx]}</h2>
                                    <ChevronDown className="w-4 h-4 text-text-muted" />
                                </button>
                                <AnimatePresence>
                                    {monthPickerOpen && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                            className="absolute top-full left-0 mt-1 bg-surface border border-border/40 rounded-2xl shadow-2xl z-30 w-52 max-h-48 overflow-y-auto py-1">
                                            {MONTHS.map((m, i) => (
                                                <button key={m} onClick={() => { setMonthIdx(i); setMonthPickerOpen(false); }}
                                                    className={`w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-surface-alt transition-colors ${monthIdx === i ? 'text-primary bg-primary/5' : 'text-text'}`}>
                                                    {m}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 relative z-10 border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-8">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Total Payout</p>
                            <p className="text-2xl font-black text-text mt-0.5">₹{totalPayout.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Employees</p>
                            <p className="text-2xl font-black text-text mt-0.5">{payroll.length}</p>
                        </div>
                    </div>
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
                </div>

                <div className="bg-background rounded-3xl shadow-sm border border-border/40 p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Payroll Security</span>
                            {isLocked ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <h3 className="text-base font-black text-text leading-tight">Finalize & Lock</h3>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">Locked payroll requires Super-Admin to edit.</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 relative z-10">
                        <button onClick={() => setIsLocked(v => !v)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all ${isLocked ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20' : 'bg-primary text-white hover:scale-[1.02] shadow-md shadow-primary/20'}`}>
                            {isLocked ? 'Unlock Payroll' : 'Approve & Lock'} <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPayAllConfirm(true)} disabled={isLocked}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs bg-emerald-500 text-white hover:scale-[1.02] shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            <CheckCircle2 className="w-4 h-4" /> Pay All
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-border/40 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search employee..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border/40 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        {['All', 'draft', 'approved', 'paid'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border/40 hover:border-primary/40'}`}>
                                {s === 'All' ? 'All' : STATUS_META[s]?.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={downloadAllPayslips} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border/40 text-text-secondary text-sm font-bold hover:border-primary/40 transition-all">
                        <FileText className="w-4 h-4" /> Bulk Payslips
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/60 border-b border-border/40">
                                {['Employee', 'Base', 'Commission', 'Deductions', 'Net Payable', 'Status', 'Actions'].map(h => (
                                    <th key={h} className={`px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filtered.map(pay => (
                                <tr key={pay.id} className="hover:bg-surface-alt/30 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-500/20">
                                                {pay.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{pay.staff}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{pay.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-bold text-text">₹{pay.base.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-xs font-bold text-emerald-600">+₹{pay.commission.toLocaleString()}</td>
                                    <td className="px-5 py-4 text-xs font-bold text-rose-500">-₹{pay.deductions.toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-black text-primary">₹{pay.net.toLocaleString()}</p>
                                        <p className="text-[9px] text-text-muted">{pay.days} days</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_META[pay.status]?.cls || ''}`}>
                                            {STATUS_META[pay.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setViewModal(pay)} title="View" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(pay)} disabled={isLocked} title="Edit" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30"><Edit2 className="w-4 h-4" /></button>
                                            {pay.status !== 'paid' && (
                                                <button onClick={() => markPaid(pay.id)} disabled={isLocked} title="Mark Paid" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all disabled:opacity-30"><CheckCircle2 className="w-4 h-4" /></button>
                                            )}
                                            <button onClick={() => downloadPayslip(pay)} title="Download" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3.5 border-t border-border/40 bg-background/40 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-[10px] text-text-muted font-bold">Payroll for <span className="text-text">{MONTHS[monthIdx]}</span> is in <span className={`font-black uppercase ${isLocked ? 'text-rose-500' : 'text-amber-600'}`}>{isLocked ? 'Locked' : 'Draft'}</span> mode.</p>
                </div>
            </div>

            {/* ── Edit Payroll Modal ── */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-text uppercase">Edit Payroll</h2>
                                    <p className="text-[10px] font-bold text-primary mt-0.5">{editModal.staff}</p>
                                </div>
                                <button onClick={() => setEditModal(null)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveEdit} className="space-y-4">
                                {[
                                    { key: 'base', label: 'Base Salary (₹)', color: 'text-text' },
                                    { key: 'commission', label: 'Commission (+₹)', color: 'text-emerald-600' },
                                    { key: 'deductions', label: 'Deductions (-₹)', color: 'text-rose-500' },
                                ].map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">{field.label}</label>
                                        <input type="number" min="0"
                                            className={`w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-black focus:border-primary outline-none ${field.color}`}
                                            value={editForm[field.key] || 0} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className="py-3 px-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between">
                                    <span className="text-xs font-black text-text-muted uppercase">Net Payable</span>
                                    <span className="text-sm font-black text-primary">₹{(Number(editForm.base || 0) + Number(editForm.commission || 0) - Number(editForm.deductions || 0)).toLocaleString()}</span>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">Save Payroll</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── View Payslip Modal ── */}
            <AnimatePresence>
                {viewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <button onClick={() => setViewModal(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            <div className="text-center mb-5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-500/20 mx-auto mb-3">
                                    {viewModal.staff.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h2 className="text-base font-black text-text">{viewModal.staff}</h2>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">{viewModal.role} · {MONTHS[monthIdx]}</p>
                                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_META[viewModal.status]?.cls}`}>{STATUS_META[viewModal.status]?.label}</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Base Salary', value: `₹${viewModal.base.toLocaleString()}`, cls: 'text-text' },
                                    { label: 'Commission', value: `+₹${viewModal.commission.toLocaleString()}`, cls: 'text-emerald-600' },
                                    { label: 'Deductions', value: `-₹${viewModal.deductions.toLocaleString()}`, cls: 'text-rose-500' },
                                    { label: 'Working Days', value: `${viewModal.days} days`, cls: 'text-text' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/40">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{row.label}</span>
                                        <span className={`text-sm font-black ${row.cls}`}>{row.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center py-3 bg-primary/5 rounded-xl px-3 border border-primary/10 mt-2">
                                    <span className="text-xs font-black text-text uppercase">Net Payable</span>
                                    <span className="text-xl font-black text-primary">₹{viewModal.net.toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => { downloadPayslip(viewModal); setViewModal(null); }}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-background border border-border/40 rounded-xl text-xs font-black text-text hover:border-primary/40 transition-all">
                                <Download className="w-4 h-4" /> Download Payslip
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Pay All Confirm */}
            <AnimatePresence>
                {payAllConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPayAllConfirm(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-[24px] border border-border/40 shadow-2xl relative p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                            <h3 className="text-base font-black text-text uppercase">Pay All Staff?</h3>
                            <p className="text-xs text-text-muted mt-1 mb-1">Total: <span className="text-primary font-black">₹{totalPayout.toLocaleString()}</span></p>
                            <p className="text-xs text-text-muted mb-5">All {payroll.length} payslips will be marked as Paid.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPayAllConfirm(false)} className="flex-1 py-2.5 bg-background border border-border/40 rounded-xl text-xs font-black text-text-muted hover:bg-surface-alt transition-all">Cancel</button>
                                <button onClick={payAll} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all">Confirm Pay</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
