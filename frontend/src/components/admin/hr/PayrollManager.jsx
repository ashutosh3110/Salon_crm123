import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Calculator, FileText, Download, CheckCircle2, Search,
    ChevronDown, Calendar, X, Edit2, Eye, Printer, DollarSign, Clock, Check, Settings,
    Filter, RefreshCw, AlertCircle, MessageCircle, Wallet, Users, Store, Plus
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
    const { salon, activeSalonId, staff, fetchStaff, outlets = [], fetchOutlets } = useBusiness();

    useEffect(() => {
        const sid = activeSalonId || salon?._id;
        fetchStaff(sid);
        fetchOutlets({ salonId: sid });
    }, [fetchStaff, fetchOutlets, activeSalonId, salon?._id]);

    const [individualModal, setIndividualModal] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState([]);
    const [filterOutlet, setFilterOutlet] = useState('All');

    const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const monthRef = useRef(null);

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const yearRef = useRef(null);

    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
    const staffDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOutletDropdownOpen(false);
            }
            if (monthRef.current && !monthRef.current.contains(event.target)) {
                setIsMonthDropdownOpen(false);
            }
            if (yearRef.current && !yearRef.current.contains(event.target)) {
                setIsYearDropdownOpen(false);
            }
            if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target)) {
                setIsStaffDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [individualForm, setIndividualForm] = useState({
        staffId: '',
        baseSalary: 0,
        workingDays: 30,
        presentDays: 0,
        leaveDays: 0,
        incentive: 0,
        overtime: 0,
        pf: 0,
        tax: 0,
        otherDeductions: 0,
        advanceSalary: 0,
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(null);

    useEffect(() => {
        const hasOpenModal = !!individualModal || !!showDetails;
        document.body.style.overflow = hasOpenModal ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [individualModal, showDetails]);
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

    const fetchAttendanceStats = useCallback(async (staffId, selectedMonth, selectedYear) => {
        if (!staffId) return;
        try {
            const res = await api.get('/hr/attendance/summary', {
                params: { month: selectedMonth, year: selectedYear, staffId }
            });
            const summary = res.data?.data || {};
            const stats = summary[staffId] || { present: 0, absent: 0, halfDay: 0, leave: 0, late: 0 };
            const computedPresent = (stats.present || 0) + (stats.late || 0) + ((stats.halfDay || 0) * 0.5);
            const computedLeave = stats.leave || 0;
            const computedCommission = stats.commission || 0;

            // Fetch advances
            const advancesRes = await api.get('/hr/salary-advances', {
                params: { staffId, month: selectedMonth, year: selectedYear }
            });
            const advances = advancesRes.data?.data || [];
            const advanceSalarySum = advances.filter(a => !a.isAdjusted && ['approved', 'paid'].includes(a.status)).reduce((sum, a) => sum + a.amount, 0);

            setIndividualForm(prev => ({
                ...prev,
                presentDays: computedPresent,
                leaveDays: computedLeave,
                incentive: computedCommission,
                advanceSalary: advanceSalarySum
            }));
        } catch (error) {
            console.error('Failed to fetch attendance summary', error);
            showToast('Failed to fetch attendance summary');
        }
    }, []);

    useEffect(() => {
        setIndividualForm(prev => ({
            ...prev,
            workingDays: 30,
            ...(prev.staffId ? {} : { presentDays: 0, leaveDays: 0 })
        }));

        if (individualForm.staffId) {
            fetchAttendanceStats(individualForm.staffId, month, year);
        }
    }, [month, year, individualForm.staffId, fetchAttendanceStats]);

    const sendWhatsAppPayroll = async (record) => {
        const phone = record.staffId?.phone;
        if (!phone) {
            showToast('Staff phone number not found');
            return;
        }

        setSendingWhatsApp(record._id);
        try {
            const res = await api.post(`/hr/payroll/${record._id}/whatsapp`);
            if (res.data?.success) {
                showToast('Payslip sent on WhatsApp successfully!');
            } else {
                showToast(res.data?.message || 'Failed to send WhatsApp payslip');
            }
        } catch (e) {
            console.error('[PayrollManager] WhatsApp error:', e);
            showToast(e.response?.data?.message || 'Error sending WhatsApp payslip');
        } finally {
            setSendingWhatsApp(null);
        }
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
            advanceSalary: record.advanceSalary || 0,
            notes: record.notes || '',
            status: record.status || 'draft'
        });
    };

    const calculateNet = () => {
        const perDay = detailForm.baseSalary / (detailForm.workingDays || 1);
        const earned = perDay * detailForm.presentDays;
        const total = earned + Number(detailForm.incentive) + Number(detailForm.overtime) - Number(detailForm.pf) - Number(detailForm.tax) - Number(detailForm.otherDeductions) - Number(detailForm.advanceSalary || 0);
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
                Number(individualForm.pf) - Number(individualForm.tax) - Number(individualForm.otherDeductions) -
                Number(individualForm.advanceSalary || 0)
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
                staffId: '', baseSalary: 0, workingDays: 30, presentDays: 0, leaveDays: 0,
                incentive: 0, overtime: 0, pf: 0, tax: 0, otherDeductions: 0, advanceSalary: 0, notes: ''
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
                            <td>Deductions</td>
                            <td class="amount">-</td>
                            <td class="amount" style="color: #e11d48">-₹${record.otherDeductions.toLocaleString()}</td>
                        </tr>
                        ${record.advanceSalary > 0 ? `
                        <tr>
                            <td>Advance Salary Deduction</td>
                            <td class="amount">-</td>
                            <td class="amount" style="color: #e11d48">-₹${record.advanceSalary.toLocaleString()}</td>
                        </tr>
                        ` : ''}
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

    // Filter outlets by active salon
    const activeSalonIdStr = String(activeSalonId || salon?._id || '');
    const filteredOutlets = useMemo(() => {
        if (!activeSalonIdStr) return outlets;
        return (outlets || []).filter(o => {
            const oSalonId = String(o?.salonId?._id || o?.salonId || '');
            return oSalonId === activeSalonIdStr;
        });
    }, [outlets, activeSalonIdStr]);

    // Extract unique outlets from context and loaded payroll records
    const uniqueOutlets = useMemo(() => {
        const set = new Set();
        (filteredOutlets || []).forEach(o => {
            if (o?.name) set.add(o.name);
        });
        records.forEach(r => {
            const outletName = r.staffId?.outletId?.name;
            if (outletName) set.add(outletName);
        });
        return ['All', ...Array.from(set)];
    }, [filteredOutlets, records]);

    // Apply filters in-memory
    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return records.filter(r => {
            const matchesSearch = r.staffId?.name?.toLowerCase().includes(q) || r.staffId?.role?.toLowerCase().includes(q);
            const staffOutletName = r.staffId?.outletId?.name || '—';
            const matchesOutlet = filterOutlet === 'All' || staffOutletName === filterOutlet;
            return matchesSearch && matchesOutlet;
        });
    }, [records, searchTerm, filterOutlet]);

    // Stats calculated dynamic based on filtered records
    const stats = useMemo(() => {
        const total = filtered.reduce((sum, r) => sum + (r.netSalary || 0), 0);
        const paid = filtered.filter(r => r.status === 'paid').length;
        const pending = filtered.filter(r => r.status !== 'paid').length;
        return { total, paid, pending };
    }, [filtered]);

    // Filter staff list in "Add Member" dropdown by selected outlet
    const addableStaff = useMemo(() => {
        const list = Array.isArray(staff) ? staff : [];
        return list.filter(s => {
            // Check if already in active payroll records
            const alreadyIn = records.some(r => (r.staffId?._id === s._id || r.staffId === s._id));
            if (alreadyIn) return false;

            // Check if matches active outlet selection
            if (filterOutlet !== 'All') {
                return s.outletId?.name === filterOutlet;
            }
            return true;
        });
    }, [staff, records, filterOutlet]);

    // Export CSV of filtered list
    const exportCSV = () => {
        const header = 'Staff,Role,Outlet,Cycle Days,Base Salary,Net Settlement,Status\n';
        const rows = filtered.map(r => `"${r.staffId?.name}","${r.staffId?.role}","${r.staffId?.outletId?.name || '—'}","${r.presentDays}/${r.workingDays}",${r.baseSalary},${r.netSalary},"${r.status}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `payroll_${month}_${year}.csv`; a.click();
    };

    return (
        <div className="space-y-6 text-left bg-transparent transition-colors pb-8">

            {/* Dynamic Outlet-wise Payout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payout Budget</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">₹{stats.total.toLocaleString()}</h3>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1">Total budget for selected period</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settled Staff</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{stats.paid} Members</h3>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1">Employees with completed payroll</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Settlement</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{stats.pending} Members</h3>
                        <p className="text-[11px] font-semibold text-slate-400 mt-1">Pending payroll settlement</p>
                    </div>
                </div>
            </div>

            {/* Toolbar Panel */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">

                <div className="flex items-center flex-col sm:flex-row gap-3">
                    {/* Period selection */}
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        {/* Month Custom Dropdown */}
                        <div className="relative w-full sm:w-auto" ref={monthRef}>
                            <button
                                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                                className="flex items-center justify-between w-full sm:min-w-[100px] gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    <span className="font-bold text-slate-700">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isMonthDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 mt-2 w-full sm:w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden"
                                    >
                                        <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        setMonth(i + 1);
                                                        setIsMonthDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${month === i + 1
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Year Custom Dropdown */}
                        <div className="relative w-full sm:w-auto" ref={yearRef}>
                            <button
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                className="flex items-center justify-between w-full sm:min-w-[90px] gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Store className="w-4 h-4 text-slate-500" />
                                    <span className="font-bold text-slate-700">
                                        {year}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isYearDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 mt-2 w-full sm:w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden"
                                    >
                                        <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                            {[2024, 2025, 2026, 2027].map(y => (
                                                <button
                                                    key={y}
                                                    onClick={() => {
                                                        setYear(y);
                                                        setIsYearDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${year === y
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Outlet selection - Custom Dropdown */}
                    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
                            className="flex items-center justify-between w-full sm:min-w-[140px] gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="font-bold text-slate-700">
                                    {filterOutlet === 'All' ? 'All Outlets' : filterOutlet}
                                </span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOutletDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isOutletDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 mt-2 w-full sm:w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden"
                                >
                                    <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {uniqueOutlets.map(o => (
                                            <button
                                                key={o}
                                                onClick={() => {
                                                    setFilterOutlet(o);
                                                    setIsOutletDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${filterOutlet === o
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {o === 'All' ? 'All Outlets' : o}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => setIndividualModal(true)}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-[#B4912B] hover:bg-[#9a7b24] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create Pay Slip
                    </button>
                </div>

                <div className="flex items-center flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employee name..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-slate-300 focus:border-slate-300 outline-none transition-all placeholder-slate-400"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={exportCSV}
                        className="flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        Export
                    </button>
                </div>
            </div>

            {/* Payroll Sheet Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[350px] transition-colors">

                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <RefreshCw className="w-4 h-4 text-[#B4912B] animate-spin" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Syncing Payroll...</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto w-full max-w-[100vw]">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Employee Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap text-center">Attendance Cycle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap text-center">Base Salary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap text-center">Net Settlement</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <img src="/vector iamge 4.png" alt="No Payroll" className="w-48 h-48 object-contain mb-4" />
                                            <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">No payroll logs found for this cycle.</h3>
                                            <p className="text-xs font-semibold text-slate-500 mb-6">
                                                Payroll records will appear here once payslips are created.
                                            </p>
                                            <button
                                                onClick={() => setIndividualModal(true)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-[#B4912B] text-white text-xs font-bold rounded-lg hover:bg-[#9a7b24] transition-colors shadow-sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Create Pay Slip
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filtered.map(record => (
                                <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-xs shrink-0 overflow-hidden shadow-sm">
                                                {record.staffId?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-xs font-bold text-slate-800">{record.staffId?.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{record.staffId?.role || 'Member'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-[9px] text-[#B4912B] font-extrabold uppercase bg-[#B4912B]/10 px-1.5 py-0.5 border border-[#B4912B]/20 rounded">{record.staffId?.outletId?.name || 'No Outlet'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <span className="text-emerald-600 font-extrabold">{record.presentDays} Present</span>
                                            <span className="text-slate-300">/</span>
                                            <span className="text-slate-500 font-medium">{record.workingDays} working</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-xs font-bold text-slate-700 text-center">
                                        ₹{record.baseSalary?.toLocaleString()}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <p className="text-xs font-black text-slate-800">₹{record.netSalary?.toLocaleString()}</p>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border rounded-lg ${STATUS_META[record.status]?.cls || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {record.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(record)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#B4912B] hover:border-[#B4912B] bg-transparent hover:bg-slate-50 transition-all" title="Adjust Salary Parameters"><Settings className="w-4 h-4" /></button>
                                            <button onClick={() => generateSlip(record)} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 bg-transparent hover:bg-slate-50 transition-all" title="Print Salary Slip"><Printer className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => sendWhatsAppPayroll(record)}
                                                disabled={sendingWhatsApp === record._id}
                                                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 bg-transparent hover:bg-slate-50 transition-all disabled:opacity-50"
                                                title="Send Payslip on WhatsApp"
                                            >
                                                {sendingWhatsApp === record._id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                                                ) : (
                                                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </button>
                                            {record.status !== 'paid' && (
                                                <button onClick={() => updateStatus(record._id, 'paid')} className="p-2 rounded-lg bg-[#B4912B] hover:bg-[#9a7b24] text-white border border-transparent shadow-sm active:scale-95 transition-all" title="Mark as Paid"><Check className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-2xl flex items-center gap-4 transition-colors mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-lg font-black italic">i</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-tight">
                    Payroll summary automatically reflects the active month and outlet filter selection.<br />
                    Data is updated in real-time.
                </p>
            </div>

            {createPortal(
                <AnimatePresence>
                    {individualModal && (
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
                            onClick={() => setIndividualModal(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl relative flex flex-col max-h-[90vh] transition-all"
                                onClick={e => e.stopPropagation()}
                            >

                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Create Individual Pay Record</h2>
                                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1 tracking-wider">Scoped to {filterOutlet === 'All' ? 'All Outlets' : filterOutlet}</p>
                                    </div>
                                    <button onClick={() => setIndividualModal(false)} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-450 transition-all"><X className="w-4 h-4" /></button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                    {/* Staff Selection Custom Dropdown */}
                                    <div className="space-y-1" ref={staffDropdownRef}>
                                        <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Select Staff Member</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:border-primary outline-none uppercase flex items-center justify-between"
                                            >
                                                <span>
                                                    {individualForm.staffId
                                                        ? (() => {
                                                            const s = staff.find(st => st._id === individualForm.staffId);
                                                            return s ? `${s.name} (${s.role}) — ${s.outletId?.name || 'No Outlet'}` : 'Choose Staff...';
                                                        })()
                                                        : 'Choose Staff...'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isStaffDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isStaffDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-[100] overflow-hidden"
                                                    >
                                                        <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                                            {addableStaff.map(s => (
                                                                <button
                                                                    key={s._id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setIndividualForm(prev => ({
                                                                            ...prev,
                                                                            staffId: s._id,
                                                                            baseSalary: s.hrProfile?.baseSalary || 0
                                                                        }));
                                                                        setIsStaffDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors uppercase ${individualForm.staffId === s._id
                                                                            ? 'bg-[#B4912B]/10 text-[#B4912B]'
                                                                            : 'text-slate-700 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    {s.name} ({s.role}) — {s.outletId?.name || 'No Outlet'}
                                                                </button>
                                                            ))}
                                                            {addableStaff.length === 0 && (
                                                                <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase text-center">
                                                                    No staff available for selection
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Base Salary (₹)</label>
                                            <input type="number" value={individualForm.baseSalary} onChange={e => setIndividualForm({ ...individualForm, baseSalary: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Working Days</label>
                                            <input type="number" value={individualForm.workingDays} disabled
                                                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Present Days</label>
                                            <input type="number" step="0.5" value={individualForm.presentDays} onChange={e => setIndividualForm({ ...individualForm, presentDays: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-violet-650 dark:text-violet-400 ml-1 uppercase">Leave Days</label>
                                            <input type="number" value={individualForm.leaveDays} onChange={e => setIndividualForm({ ...individualForm, leaveDays: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 ml-1 uppercase">Incentive (₹)</label>
                                            <input type="number" value={individualForm.incentive} onChange={e => setIndividualForm({ ...individualForm, incentive: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-650 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Overtime Pay (₹)</label>
                                            <input type="number" value={individualForm.overtime} onChange={e => setIndividualForm({ ...individualForm, overtime: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-violet-650 dark:text-violet-400 ml-1 uppercase">Advance Salary (₹)</label>
                                            <input type="number" value={individualForm.advanceSalary || 0} disabled
                                                className="w-full px-4 py-3 rounded-xl bg-slate-150 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-550 dark:text-slate-450 ml-1 uppercase">Notes / Explanations</label>
                                        <textarea rows={2} value={individualForm.notes} onChange={e => setIndividualForm({ ...individualForm, notes: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-250 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none transition-all placeholder-slate-400" placeholder="Type payroll calculations notes..." />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-450 dark:text-slate-555 uppercase">Estimated Settlement</p>
                                        <h3 className="text-xl font-black text-primary dark:text-slate-100 tracking-tight mt-0.5">₹{Math.round(((individualForm.baseSalary / (individualForm.workingDays || 1)) * individualForm.presentDays) + Number(individualForm.incentive) + Number(individualForm.overtime) - Number(individualForm.pf) - Number(individualForm.tax) - Number(individualForm.otherDeductions) - Number(individualForm.advanceSalary || 0)).toLocaleString()}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setIndividualModal(false)} className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all">Cancel</button>
                                        <button onClick={createIndividual} disabled={!individualForm.staffId || loading}
                                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5">
                                            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Save Record
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {createPortal(
                <AnimatePresence>
                    {showDetails && (
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
                            onClick={() => setShowDetails(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-slate-200 w-full max-w-xl rounded-xl relative flex flex-col max-h-[90vh] transition-all text-left"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                                    <div>
                                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-primary" />
                                            Adjust Pay Slip Parameters
                                        </h2>
                                        <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">{showDetails.staffId?.name} · {month}/{year}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(null)}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Base Salary (₹)</label>
                                            <input
                                                type="number"
                                                value={detailForm.baseSalary}
                                                onChange={e => setDetailForm({ ...detailForm, baseSalary: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Working Days</label>
                                            <input
                                                type="number"
                                                value={detailForm.workingDays}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Present Count</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={detailForm.presentDays}
                                                onChange={e => setDetailForm({ ...detailForm, presentDays: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Incentive (₹)</label>
                                            <input
                                                type="number"
                                                value={detailForm.incentive}
                                                onChange={e => setDetailForm({ ...detailForm, incentive: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-600 focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">Deductions (₹)</label>
                                            <input
                                                type="number"
                                                value={detailForm.otherDeductions}
                                                onChange={e => setDetailForm({ ...detailForm, otherDeductions: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-rose-600 focus:border-rose-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Overtime (₹)</label>
                                            <input
                                                type="number"
                                                value={detailForm.overtime}
                                                onChange={e => setDetailForm({ ...detailForm, overtime: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-violet-600 uppercase tracking-widest block mb-1">Advance Deducted (₹)</label>
                                            <input
                                                type="number"
                                                value={detailForm.advanceSalary || 0}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Adjustments Notes</label>
                                        <textarea
                                            rows={2}
                                            value={detailForm.notes}
                                            onChange={e => setDetailForm({ ...detailForm, notes: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:border-primary outline-none resize-none transition-all placeholder-slate-400"
                                            placeholder="Type reason for parameters adjustments..."
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-450 uppercase">Adjusted Net Payable</p>
                                        <h3 className="text-xl font-black text-slate-950 tracking-tight mt-0.5">₹{calculateNet().toLocaleString()}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowDetails(null)}
                                            className="px-6 py-2.5 border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveDetails}
                                            disabled={isSaving}
                                            className="px-6 py-2.5 bg-slate-900 text-white hover:bg-primary rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5"
                                        >
                                            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-950/20 text-xs font-bold tracking-wide select-none"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
