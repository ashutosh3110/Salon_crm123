import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
    Calculator, FileText, Download, CheckCircle2, Search, 
    ChevronDown, Calendar, X, Edit2, Eye, Printer, DollarSign, Clock, Check, Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

const STATUS_META = {
    paid: { label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    unpaid: { label: 'Unpaid', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    pending: { label: 'Pending', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    draft: { label: 'Draft', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function PayrollManager() {
    const { salon, staff, fetchStaff } = useBusiness();
    useEffect(() => { fetchStaff(); }, []);
    const [individualModal, setIndividualModal] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState([]);
    const [individualForm, setIndividualForm] = useState({
        staffId: '',
        baseSalary: 0,
        workingDays: 30,
        presentDays: 0,
        incentive: 0,
        overtime: 0,
        pf: 0,
        tax: 0,
        otherDeductions: 0,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [detailForm, setDetailForm] = useState({
        baseSalary: 0,
        workingDays: 30,
        presentDays: 0,
        leaveDays: 0,
        incentive: 0,
        overtime: 0,
        pf: 0,
        tax: 0,
        otherDeductions: 0,
        notes: '',
        status: 'draft'
    });

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const loadRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/hr/payroll', { params: { month, year } });
            setRecords(res.data?.data || []);
        } catch (e) {
            showToast('Failed to fetch payroll records');
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const generateAll = async () => {
        setLoading(true);
        try {
            await api.post('/hr/payroll/generate', { month, year });
            showToast(`Draft payroll generated for ${month}/${year}`);
            loadRecords();
        } catch (e) {
            showToast('Generation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setShowDetails(record);
        setDetailForm({
            baseSalary: record.baseSalary || 0,
            workingDays: record.workingDays || 30,
            presentDays: record.presentDays || 0,
            leaveDays: record.leaveDays || 0,
            incentive: record.incentive || 0,
            overtime: record.overtime || 0,
            pf: record.pf || 0,
            tax: record.tax || 0,
            otherDeductions: record.otherDeductions || 0,
            notes: record.notes || '',
            status: record.status || 'draft'
        });
    };

    const calculateNet = () => {
        const perDay = detailForm.baseSalary / (detailForm.workingDays || 1);
        const earned = perDay * detailForm.presentDays;
        const total = earned + Number(detailForm.incentive) + Number(detailForm.overtime) - Number(detailForm.pf) - Number(detailForm.tax) - Number(detailForm.otherDeductions);
        return Math.round(total);
    };

    const saveDetails = async () => {
        setIsSaving(true);
        try {
            await api.post('/hr/payroll/generate', {
                staffId: showDetails.staffId?._id || showDetails.staffId,
                month,
                year,
                ...detailForm,
                netSalary: calculateNet()
            });
            showToast('Payroll updated');
            setShowDetails(null);
            loadRecords();
        } catch (e) {
            showToast('Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    const createIndividual = async () => {
        if (!individualForm.staffId) return;
        setLoading(true);
        try {
            const netSalary = Math.round(
                ((individualForm.baseSalary / (individualForm.workingDays || 1)) * individualForm.presentDays) +
                Number(individualForm.incentive) + Number(individualForm.overtime) -
                Number(individualForm.pf) - Number(individualForm.tax) - Number(individualForm.otherDeductions)
            );

            await api.post('/hr/payroll/generate', { 
                ...individualForm,
                month, 
                year,
                netSalary
            });
            showToast('Individual payroll created');
            setIndividualModal(false);
            setIndividualForm({
                staffId: '', baseSalary: 0, workingDays: 30, presentDays: 0,
                incentive: 0, overtime: 0, pf: 0, tax: 0, otherDeductions: 0, notes: ''
            });
            loadRecords();
        } catch (e) {
            showToast(e.response?.data?.message || 'Failed to create individual payroll');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/hr/payroll/${id}/status`, { status });
            showToast(`Status updated to ${status}`);
            loadRecords();
        } catch (e) {
            showToast('Update failed');
        }
    };

    const generateSlip = (record) => {
        const win = window.open('', '_blank');
        const html = `
            <html>
            <head>
                <title>Salary Slip - ${record.staffId?.name}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; line-height: 1.5; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
                    .slip-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #666; }
                    .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .info-box h4 { font-size: 9px; text-transform: uppercase; color: #888; margin: 0 0 5px 0; letter-spacing: 1px; font-weight: 900; }
                    .info-box p { font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; font-size: 9px; text-transform: uppercase; color: #888; padding: 12px 0; border-bottom: 2px solid #eee; font-weight: 900; }
                    td { padding: 15px 0; font-size: 12px; border-bottom: 1px solid #eee; font-weight: 600; }
                    .amount { text-align: right; font-weight: 700; }
                    .total-row { background: #fdfdfd; }
                    .total-row td { border-bottom: none; font-weight: 900; font-size: 16px; padding: 25px 0; border-top: 2px solid #000; }
                    .footer { font-size: 10px; color: #aaa; text-align: center; margin-top: 80px; border-top: 1px solid #eee; padding-top: 20px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
                    @media print {
                        body { padding: 0; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">${salon?.name || 'SALON CRM'}</div>
                    <div class="slip-title">Salary Slip: ${month}/${year}</div>
                </div>
                <div class="info-grid">
                    <div class="info-box">
                        <h4>Staff Member</h4>
                        <p>${record.staffId?.name}</p>
                    </div>
                    <div class="info-box">
                        <h4>Outlet / Salon Branch</h4>
                        <p>${record.staffId?.outletId?.name || 'Main Branch'}</p>
                    </div>
                    <div class="info-box">
                        <h4>Designation / Role</h4>
                        <p>${record.staffId?.role}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Earnings / Deductions Description</th>
                            <th class="amount">Component Value</th>
                            <th class="amount">Calculated Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Salary (Calculated for ${record.presentDays}/${record.workingDays} days)</td>
                            <td class="amount">₹${record.baseSalary.toLocaleString()}</td>
                            <td class="amount">₹${Math.round((record.baseSalary / record.workingDays) * record.presentDays).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Performance Incentives / Bonus</td>
                            <td class="amount">-</td>
                            <td class="amount" style="color: #10b981">+₹${record.incentive.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Taxes & Deductions</td>
                            <td class="amount">-</td>
                            <td class="amount" style="color: #e11d48">-₹${record.otherDeductions.toLocaleString()}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2">NET SETTLEMENT AMOUNT</td>
                            <td class="amount">₹${record.netSalary.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="info-box">
                    <h4>Administrative Remarks</h4>
                    <p style="font-size: 11px; font-weight: 500; color: #555; text-transform: none;">${record.notes || 'No adjustment notes recorded for this pay cycle.'}</p>
                </div>
                <div class="footer">
                    Electronic Document — Confirms to Salon HR Standards 2024.
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `;
        win.document.write(html);
        win.document.close();
    };

    const stats = useMemo(() => {
        const total = records.reduce((sum, r) => sum + (r.netSalary || 0), 0);
        const paid = records.filter(r => r.status === 'paid').length;
        const pending = records.filter(r => r.status !== 'paid').length;
        return { total, paid, pending };
    }, [records]);

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return records.filter(r => r.staffId?.name?.toLowerCase().includes(q));
    }, [records, searchTerm]);

    return (
        <div className="space-y-6 font-black text-left">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-black">
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm flex items-center justify-between group hover:border-primary transition-all text-left">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Monthly Payout</p>
                        <h3 className="text-3xl font-black mt-2 text-primary tracking-tighter">₹{stats.total.toLocaleString()}</h3>
                    </div>
                    <div className="p-4 bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all text-left">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Paid Records</p>
                        <h3 className="text-3xl font-black mt-2 text-emerald-500 tracking-tighter">{stats.paid}</h3>
                    </div>
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-surface p-8 rounded-none border border-border shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all text-left">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Awaiting Settlement</p>
                        <h3 className="text-3xl font-black mt-2 text-amber-500 tracking-tighter">{stats.pending}</h3>
                    </div>
                    <div className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-surface p-5 rounded-none border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-black">
                <div className="flex items-center gap-4 text-left font-black">
                    <div className="flex items-center bg-background border border-border p-1 rounded-none shadow-inner">
                        <select value={month} onChange={e => setMonth(Number(e.target.value))}
                            className="bg-transparent border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select value={year} onChange={e => setYear(Number(e.target.value))}
                            className="bg-transparent border-none py-2 px-4 text-[10px] font-black uppercase tracking-widest focus:ring-0 outline-none border-l border-border/40">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={() => { console.log('Opening Modal'); setIndividualModal(true); }}
                        className="px-6 py-3.5 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        Add Member to Payroll
                    </button>
                </div>
                <div className="relative flex-1 max-w-sm text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search staff records..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>


                <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black table-responsive relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted animate-pulse italic">Synchronizing Salary Data…</p>
                    </div>
                )}
                <table className="w-full text-left font-black">
                    <thead>
                        <tr className="bg-surface-alt/50 border-b border-border/40 text-left font-black">
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Staff Member</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cycle Days</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Base Component</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Net Settlement</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Portal Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-left font-black">
                        {filtered.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <FileText className="w-12 h-12 text-border mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No payroll logs for this cycle.</p>
                                </td>
                            </tr>
                        )}
                        {filtered.map(record => (
                            <tr key={record._id} className="hover:bg-surface-alt/20 transition-colors group text-left font-black">
                                <td className="px-6 py-5 text-left font-black">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] uppercase italic">{record.staffId?.name?.split(' ').map(n => n[0]).join('')}</div>
                                        <div className="text-left font-black leading-tight">
                                            <p className="text-xs font-black text-text uppercase tracking-tight">{record.staffId?.name}</p>
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1.5 italic">{record.staffId?.role || 'Member'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-left font-black">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-text uppercase">
                                        <span className="text-emerald-500">{record.presentDays}P</span>
                                        <span className="text-border">/</span>
                                        <span className="text-text-muted">{record.workingDays}W</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-[11px] font-black text-text uppercase text-left font-black italic">₹{record.baseSalary.toLocaleString()}</td>
                                <td className="px-6 py-5 text-left font-black">
                                    <p className="text-sm font-black text-primary tracking-tighter">₹{record.netSalary.toLocaleString()}</p>
                                </td>
                                <td className="px-6 py-5 text-left font-black">
                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${STATUS_META[record.status]?.cls || 'bg-surface text-text-muted border-border'}`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right font-black">
                                    <div className="flex items-center justify-end gap-2 font-black">
                                        <button onClick={() => handleEdit(record)} className="p-2.5 rounded-none bg-background border border-border text-text-muted hover:text-primary hover:border-primary transition-all"><Settings className="w-4 h-4" /></button>
                                        <button onClick={() => generateSlip(record)} className="p-2.5 rounded-none bg-background border border-border text-text-muted hover:text-emerald-500 hover:border-emerald-500 transition-all"><Printer className="w-4 h-4" /></button>
                                        {record.status !== 'paid' && (
                                            <button onClick={() => updateStatus(record._id, 'paid')} className="p-2.5 rounded-none bg-primary text-white hover:bg-primary-alt transition-all shadow-lg shadow-primary/10"><Check className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Individual Payroll Modal */}
            <AnimatePresence>
                {individualModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIndividualModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="bg-surface w-full max-w-3xl rounded-none border border-border shadow-2xl relative flex flex-col max-h-[95vh]">
                            <div className="p-8 border-b border-border flex items-center justify-between bg-surface-alt/30">
                                <h2 className="text-base font-black text-text uppercase tracking-[0.2em]">New Payroll Entry</h2>
                                <button onClick={() => setIndividualModal(false)} className="w-12 h-12 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-6 h-6" /></button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                {/* Staff Selection */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Select Staff Member</label>
                                    <select value={individualForm.staffId} onChange={e => {
                                        const s = staff.find(st => st._id === e.target.value);
                                        setIndividualForm({...individualForm, staffId: e.target.value, baseSalary: s?.salary || 0});
                                    }}
                                        className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase shadow-inner">
                                        <option value="">Choose Staff...</option>
                                        {staff.filter(s => !records.some(r => (r.staffId?._id === s._id || r.staffId === s._id))).map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Attendance & Base */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-l-2 border-primary pl-3 italic font-bold">Attendance & Base</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Base Salary</label>
                                                <input type="number" value={individualForm.baseSalary} onChange={e => setIndividualForm({...individualForm, baseSalary: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Working Days</label>
                                                <input type="number" value={individualForm.workingDays} onChange={e => setIndividualForm({...individualForm, workingDays: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Present Count</label>
                                                <input type="number" step="0.5" value={individualForm.presentDays} onChange={e => setIndividualForm({...individualForm, presentDays: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Earnings & Deductions */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-l-2 border-primary pl-3 italic font-bold">Incentives & Deductions</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Incentives</label>
                                                <input type="number" value={individualForm.incentive} onChange={e => setIndividualForm({...individualForm, incentive: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-emerald-500 uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">Taxes & Deductions</label>
                                                <input type="number" value={individualForm.otherDeductions} onChange={e => setIndividualForm({...individualForm, otherDeductions: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-rose-500 uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Notes / Remarks</label>
                                    <textarea rows={2} value={individualForm.notes} onChange={e => setIndividualForm({...individualForm, notes: e.target.value})}
                                        className="w-full px-4 py-3 rounded-none bg-background border border-border text-[11px] font-black outline-none focus:border-primary resize-none italic uppercase" placeholder="Enter payroll notes..." />
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-surface-alt/30 flex items-center justify-between">
                                <div className="text-left font-black">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest italic leading-none">Net Calculation</p>
                                    <h3 className="text-2xl font-black text-primary tracking-tighter mt-1">₹{Math.round(((individualForm.baseSalary / (individualForm.workingDays || 1)) * individualForm.presentDays) + Number(individualForm.incentive) + Number(individualForm.overtime) - Number(individualForm.pf) - Number(individualForm.tax) - Number(individualForm.otherDeductions)).toLocaleString()}</h3>
                                </div>
                                <button onClick={createIndividual} disabled={!individualForm.staffId || loading}
                                    className="px-10 py-5 bg-primary text-white rounded-none font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                                    {loading ? 'Processing...' : 'Create Payroll Record'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjustment Modal */}
            <AnimatePresence>
                {showDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetails(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="bg-surface w-full max-w-2xl rounded-none border border-border shadow-2xl relative flex flex-col max-h-[90vh]">
                            
                            <div className="p-8 border-b border-border flex items-center justify-between bg-surface-alt/30">
                                <div>
                                    <h2 className="text-base font-black text-text uppercase tracking-[0.2em]">Salary Portal</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest italic">{showDetails.staffId?.name} · {month}/{year}</p>
                                </div>
                                <button onClick={() => setShowDetails(null)} className="w-12 h-12 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column 1: Attendance & Base */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-l-2 border-primary pl-3 italic font-bold">Attendance & Base</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Base Salary (INR)</label>
                                                <input type="number" value={detailForm.baseSalary} onChange={e => setDetailForm({...detailForm, baseSalary: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Cycle Days</label>
                                                <input type="number" value={detailForm.workingDays} onChange={e => setDetailForm({...detailForm, workingDays: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Present Count</label>
                                                <input type="number" step="0.5" value={detailForm.presentDays} onChange={e => setDetailForm({...detailForm, presentDays: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-primary uppercase" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Earnings & Deductions */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-l-2 border-emerald-500 pl-3 italic font-bold">Earnings & Deductions</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Incentive Pay</label>
                                                <input type="number" value={detailForm.incentive} onChange={e => setDetailForm({...detailForm, incentive: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-emerald-500 uppercase" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">Taxes & Deductions</label>
                                                <input type="number" value={detailForm.otherDeductions} onChange={e => setDetailForm({...detailForm, otherDeductions: Number(e.target.value)})}
                                                    className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black outline-none focus:border-rose-500 uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">Operational Notes</label>
                                    <textarea rows={2} value={detailForm.notes} onChange={e => setDetailForm({...detailForm, notes: e.target.value})}
                                        className="w-full px-4 py-3 rounded-none bg-background border border-border text-[11px] font-black outline-none focus:border-primary resize-none italic uppercase" placeholder="Enter reason for adjustments..." />
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-surface-alt/30 flex items-center justify-between">
                                <div className="text-left font-black">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest italic leading-none">Net Payable Balance</p>
                                    <h3 className="text-2xl font-black text-primary tracking-tighter mt-1">₹{calculateNet().toLocaleString()}</h3>
                                </div>
                                <div className="flex items-center gap-3 font-black">
                                    <button onClick={() => setShowDetails(null)} className="px-6 py-4 rounded-none text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text transition-all">Cancel</button>
                                    <button onClick={saveDetails} disabled={isSaving}
                                        className="px-8 py-4 bg-primary text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        {isSaving ? 'Processing...' : 'Lock & Save Logs'}
                                    </button>
                                </div>
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
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em] font-black italic">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Individual Payroll Modal */}

        </div>
    );
}
