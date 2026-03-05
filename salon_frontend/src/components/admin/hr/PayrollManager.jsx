import { useState, useMemo } from 'react';
import { Calculator, FileText, Download, CheckCircle2, Clock, ArrowRight, Search, Filter, ChevronDown, Lock, Unlock, AlertCircle, Calendar, Users, X, Edit2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

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
    const [monthIdx, setMonthIdx] = useState(1);
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

    const chartData = useMemo(() => payroll.map(p => ({
        name: p.staff.split(' ')[0],
        net: p.net,
        commission: p.commission,
        base: p.base
    })), [payroll]);

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

    const markPaid = (id) => {
        setPayroll(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
        showToast(`Marked as paid`);
    };

    const payAll = () => {
        if (isLocked) return showToast('Payroll is locked. Unlock to process.');
        setPayroll(prev => prev.map(p => ({ ...p, status: 'paid' })));
        setPayAllConfirm(false);
        showToast(`All ${payroll.length} payslips marked as Paid ✅`);
    };

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
        <div className="space-y-6 font-black text-left">
            {/* KPI Row and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                <div className="lg:col-span-2 bg-surface p-8 rounded-none border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden group text-left">
                    <div className="flex-1 text-left font-black">
                        <div className="flex items-center gap-5 mb-8 text-left">
                            <div className="p-4 rounded-none bg-primary text-white shadow-xl shadow-primary/20 shrink-0"><Calculator className="w-6 h-6" /></div>
                            <div className="text-left font-black">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Fiscal Period</p>
                                <div className="relative text-left">
                                    <button onClick={() => setMonthPickerOpen(v => !v)} className="flex items-center gap-3 mt-1 group/btn">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <h2 className="text-xl font-black text-text uppercase group-hover/btn:text-primary transition-colors tracking-tight">{MONTHS[monthIdx]}</h2>
                                        <ChevronDown className="w-5 h-5 text-text-muted" />
                                    </button>
                                    <AnimatePresence>
                                        {monthPickerOpen && (
                                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                className="absolute top-full left-0 mt-3 bg-surface border border-border rounded-none shadow-2xl z-50 w-64 max-h-64 overflow-y-auto py-2">
                                                {MONTHS.map((m, i) => (
                                                    <button key={m} onClick={() => { setMonthIdx(i); setMonthPickerOpen(false); }}
                                                        className={`w-full px-6 py-4 text-[10px] font-black uppercase text-left tracking-widest hover:bg-surface-alt transition-colors ${monthIdx === i ? 'text-primary bg-primary/5' : 'text-text'}`}>
                                                        {m}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 border-t border-border/40 pt-8 text-left font-black">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Capital Outflow</p>
                                <p className="text-3xl font-black text-text mt-1 tracking-tighter">₹{totalPayout.toLocaleString()}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Active Nodes</p>
                                <p className="text-3xl font-black text-text mt-1 tracking-tighter">{payroll.length} units</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full sm:w-[240px] h-[180px] shrink-0 text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
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
                                <Bar dataKey="net" fill="var(--primary)" barSize={20}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#8b5cf6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-background rounded-none shadow-sm border border-border p-8 relative overflow-hidden flex flex-col justify-between text-left font-black">
                    <div className="relative z-10 text-left">
                        <div className="flex items-center justify-between mb-4 text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol Isolation</span>
                            {isLocked ? <Lock className="w-5 h-5 text-rose-500" /> : <Unlock className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <h3 className="text-lg font-black text-text uppercase tracking-tight">Finalize Command</h3>
                        <p className="text-[10px] text-text-muted mt-2 leading-relaxed font-bold uppercase tracking-widest">Locked state restricts all entry modifications.</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-8 relative z-10 text-left font-black">
                        <button onClick={() => setIsLocked(v => !v)}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-none font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isLocked ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/10' : 'bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/10'}`}>
                            {isLocked ? 'Initiate Unlock' : 'Apply Multi-Lock'} <ArrowRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPayAllConfirm(true)} disabled={isLocked}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-none font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <CheckCircle2 className="w-4 h-4" /> Execute Payout
                        </button>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-none border border-border shadow-sm text-left font-black">
                <div className="relative flex-1 max-w-sm text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="FILTER PAYROLL STREAM..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-3 text-left">
                    <div className="flex gap-2 text-left">
                        {['All', 'draft', 'approved', 'paid'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 rounded-none text-[9px] font-black uppercase tracking-widest border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface text-text-muted border-border hover:border-primary'}`}>
                                {s === 'All' ? 'Full' : STATUS_META[s]?.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-[1px] h-6 bg-border mx-2" />
                    <button onClick={downloadAllPayslips} className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-background border border-border text-text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all">
                        <FileText className="w-4 h-4 text-primary" /> Master export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                <div className="overflow-x-auto text-left font-black">
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left">
                                {['Entity', 'Base_val', 'Bonus', 'Dedit', 'Net_Settlement', 'Status_bit', 'Control'].map(h => (
                                    <th key={h} className={`px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ${h === 'Control' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {filtered.map(pay => (
                                <tr key={pay.id} className="hover:bg-surface-alt/20 transition-colors group text-left">
                                    <td className="px-6 py-5 text-left">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-9 h-9 rounded-none bg-primary/10 text-primary flex items-center justify-center font-black text-[11px] border border-primary/10 shrink-0">
                                                {pay.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-xs font-black text-text uppercase tracking-tight text-left">{pay.staff}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest text-left">{pay.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] font-black text-text uppercase text-left">₹{pay.base.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-[11px] font-black text-emerald-500 uppercase text-left">+₹{pay.commission.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-[11px] font-black text-rose-500 uppercase text-left">-₹{pay.deductions.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-left">
                                        <p className="text-sm font-black text-primary tracking-tighter">₹{pay.net.toLocaleString()}</p>
                                        <p className="text-[9px] text-text-muted uppercase font-bold">{pay.days} WORKING DAYS</p>
                                    </td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${STATUS_META[pay.status]?.cls || ''}`}>
                                            {STATUS_META[pay.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewModal(pay)} className="p-2 rounded-none text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(pay)} disabled={isLocked} className="p-2 rounded-none text-text-muted hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30"><Edit2 className="w-4 h-4" /></button>
                                            {pay.status !== 'paid' && (
                                                <button onClick={() => markPaid(pay.id)} disabled={isLocked} className="p-2 rounded-none text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-30"><CheckCircle2 className="w-4 h-4" /></button>
                                            )}
                                            <button onClick={() => downloadPayslip(pay)} className="p-2 rounded-none text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-border bg-surface-alt/30 flex items-center gap-3 font-black">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none">Status report: <span className="text-text">{MONTHS[monthIdx]}</span> sequence is and flagged as <span className={`font-black ${isLocked ? 'text-rose-500' : 'text-amber-600'}`}>{isLocked ? 'PROHIBITED' : 'DRAFT_MODE'}</span>.</p>
                </div>
            </div>

            {/* Modals remain similarly styled ... */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-none border border-border shadow-2xl relative p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Override Salary</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest font-bold">{editModal.staff}</p>
                                </div>
                                <button onClick={() => setEditModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={saveEdit} className="space-y-6">
                                {[
                                    { key: 'base', label: 'Primary Base (₹)', color: 'text-text' },
                                    { key: 'commission', label: 'Incentive Vector (+₹)', color: 'text-emerald-500' },
                                    { key: 'deductions', label: 'Loss Recovery (-₹)', color: 'text-rose-500' },
                                ].map(field => (
                                    <div key={field.key} className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{field.label}</label>
                                        <input type="number" min="0"
                                            className={`w-full px-5 py-4 rounded-none bg-background border border-border text-sm font-black focus:border-primary outline-none ${field.color} uppercase`}
                                            value={editForm[field.key] || 0} onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className="py-5 px-6 bg-primary/5 rounded-none border border-primary/20 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Settlement Val</span>
                                    <span className="text-xl font-black text-primary tracking-tighter">₹{(Number(editForm.base || 0) + Number(editForm.commission || 0) - Number(editForm.deductions || 0)).toLocaleString()}</span>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Write To Register</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal, Pay All Modal, Toast ... */}
            <AnimatePresence>
                {viewModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-10">
                            <button onClick={() => setViewModal(null)} className="absolute top-6 right-6 w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-5 h-5" /></button>
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/10 mx-auto mb-6 shadow-2xl shadow-primary/5">
                                    {viewModal.staff.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h2 className="text-lg font-black text-text uppercase tracking-tight">{viewModal.staff}</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 italic">{viewModal.role} · {MONTHS[monthIdx]}</p>
                                <span className={`inline-block mt-4 px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border ${STATUS_META[viewModal.status]?.cls}`}>{STATUS_META[viewModal.status]?.label}</span>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Primary Base', value: `₹${viewModal.base.toLocaleString()}`, cls: 'text-text' },
                                    { label: 'Commission', value: `+₹${viewModal.commission.toLocaleString()}`, cls: 'text-emerald-500' },
                                    { label: 'Deductions', value: `-₹${viewModal.deductions.toLocaleString()}`, cls: 'text-rose-500' },
                                    { label: 'Active Cycle', value: `${viewModal.days} DAYS`, cls: 'text-text' },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center py-3 border-b border-border/40">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{row.label}</span>
                                        <span className={`text-sm font-black uppercase ${row.cls}`}>{row.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center py-5 bg-primary/5 rounded-none px-5 border border-primary/20 mt-6 shadow-lg shadow-primary/5">
                                    <span className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Net settlement</span>
                                    <span className="text-2xl font-black text-primary tracking-tighter">₹{viewModal.net.toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => { downloadPayslip(viewModal); setViewModal(null); }}
                                className="w-full mt-8 flex items-center justify-center gap-3 py-4 bg-background border border-border rounded-none text-[10px] font-black text-text uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                <Download className="w-4 h-4 text-primary" /> Generate PDF Output
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {payAllConfirm && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPayAllConfirm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-10 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-none flex items-center justify-center mx-auto mb-8 border border-emerald-500/10"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.2em]">Global Payout Command?</h3>
                            <p className="text-[10px] text-text-muted mt-3 mb-2 uppercase font-bold tracking-widest">Aggregate Val: <span className="text-primary font-black">₹{totalPayout.toLocaleString()}</span></p>
                            <p className="text-[10px] text-rose-500 mb-8 uppercase font-black tracking-widest leading-relaxed italic">Warning: This will set all {payroll.length} nodes to PAID state permanently.</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={payAll} className="w-full py-4 bg-emerald-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:bg-emerald-600 transition-all">Confirm Execution</button>
                                <button onClick={() => setPayAllConfirm(false)} className="w-full py-4 bg-background border border-border rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">Abort Protocol</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em] font-black">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
