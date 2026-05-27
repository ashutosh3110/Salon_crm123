import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    Plus, Search, Calendar, X, Edit2, Trash2, DollarSign, Clock, Check, 
    Filter, RefreshCw, AlertCircle, User, Wallet, FileText, CheckCircle2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

const STATUS_META = {
    paid: { label: 'Paid', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' },
    approved: { label: 'Approved', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' },
    pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' },
};

export default function AdvanceSalaryManager() {
    const { salon, activeSalonId, staff, fetchStaff } = useBusiness();

    useEffect(() => {
        const sid = activeSalonId || salon?._id;
        fetchStaff(sid);
    }, [fetchStaff, activeSalonId, salon?._id]);

    const [advances, setAdvances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStaff, setFilterStaff] = useState('All');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdvance, setEditingAdvance] = useState(null);

    // Dropdown open states
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [staffOpen, setStaffOpen] = useState(false);
    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const staffRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (monthRef.current && !monthRef.current.contains(e.target)) setMonthOpen(false);
            if (yearRef.current && !yearRef.current.contains(e.target)) setYearOpen(false);
            if (staffRef.current && !staffRef.current.contains(e.target)) setStaffOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Form fields
    const [form, setForm] = useState({
        staffId: '',
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0],
        status: 'paid'
    });

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Load ledger records
    const loadLedger = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStaff !== 'All') params.staffId = filterStaff;
            params.month = filterMonth;
            params.year = filterYear;

            const res = await api.get('/hr/salary-advances', { params });
            setAdvances(res.data?.data || []);
        } catch (e) {
            console.error('[AdvanceSalary] Fetch error:', e);
            showToast('Failed to load advances ledger');
        } finally {
            setLoading(false);
        }
    }, [filterStaff, filterMonth, filterYear]);

    useEffect(() => {
        loadLedger();
    }, [loadLedger]);

    // Handle modal close
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAdvance(null);
        setForm({
            staffId: '',
            amount: '',
            reason: '',
            date: new Date().toISOString().split('T')[0],
            status: 'paid'
        });
    };

    // Open for edit
    const openEdit = (record) => {
        if (record.isAdjusted) {
            showToast('Cannot edit an advance that has already been adjusted');
            return;
        }
        setEditingAdvance(record);
        setForm({
            staffId: record.staffId?._id || record.staffId,
            amount: record.amount,
            reason: record.reason || '',
            date: new Date(record.date).toISOString().split('T')[0],
            status: record.status || 'paid'
        });
        setIsModalOpen(true);
    };

    // Save record (create or edit)
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.staffId || !form.amount || !form.date) {
            showToast('Please fill in all required fields');
            return;
        }

        const selectedStaff = staff?.find(s => s._id === form.staffId);
        const baseSalary = selectedStaff?.hrProfile?.baseSalary || 0;

        if (baseSalary === 0) {
            showToast("Base salary is not configured for this employee. Setup base salary first.");
            return;
        }

        if (Number(form.amount) > baseSalary) {
            showToast(`Advance amount cannot exceed the employee's base salary (₹${baseSalary.toLocaleString()})`);
            return;
        }

        setIsSaving(true);
        try {
            if (editingAdvance) {
                // Update
                const res = await api.put(`/hr/salary-advances/${editingAdvance._id}`, form);
                if (res.data?.success) {
                    showToast('Salary advance updated successfully');
                    closeModal();
                    loadLedger();
                } else {
                    showToast(res.data?.message || 'Failed to update salary advance');
                }
            } else {
                // Create
                const res = await api.post('/hr/salary-advances', form);
                if (res.data?.success) {
                    showToast('Salary advance recorded successfully');
                    closeModal();
                    loadLedger();
                } else {
                    showToast(res.data?.message || 'Failed to record salary advance');
                }
            }
        } catch (error) {
            console.error('[AdvanceSalary] Save error:', error);
            showToast(error.response?.data?.message || 'An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this advance record?')) return;
        
        try {
            const res = await api.delete(`/hr/salary-advances/${id}`);
            if (res.data?.success) {
                showToast('Salary advance deleted successfully');
                loadLedger();
            } else {
                showToast(res.data?.message || 'Failed to delete record');
            }
        } catch (error) {
            console.error('[AdvanceSalary] Delete error:', error);
            showToast(error.response?.data?.message || 'Failed to delete advance record');
        }
    };

    // Filter in-memory by search term
    const filteredLedger = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return advances.filter(item => {
            const name = item.staffId?.name || '';
            const role = item.staffId?.role || '';
            const reason = item.reason || '';
            return name.toLowerCase().includes(query) || 
                   role.toLowerCase().includes(query) || 
                   reason.toLowerCase().includes(query);
        });
    }, [advances, searchTerm]);

    // Aggregate statistics
    const stats = useMemo(() => {
        let totalGiven = 0;
        let totalAdjusted = 0;
        let totalPending = 0;

        filteredLedger.forEach(item => {
            totalGiven += item.amount || 0;
            if (item.isAdjusted) {
                totalAdjusted += item.amount || 0;
            } else {
                totalPending += item.amount || 0;
            }
        });

        return { totalGiven, totalAdjusted, totalPending };
    }, [filteredLedger]);

    const activeStaffList = useMemo(() => {
        return Array.isArray(staff) ? staff.filter(s => s.status === 'active') : [];
    }, [staff]);

    const formatMonthYear = (monthNum, yearNum) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[monthNum - 1] || monthNum} ${yearNum}`;
    };

    return (
        <div className="space-y-5 text-left bg-slate-50 dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/60 dark:border-slate-800/80 transition-colors">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between group hover:border-violet-500 transition-all">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Total Advances Given</p>
                        <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">₹{stats.totalGiven.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-xl transition-all group-hover:bg-violet-500 group-hover:text-white">
                        <Wallet className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Adjusted In Payroll</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight">₹{stats.totalAdjusted.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl transition-all group-hover:bg-emerald-500 group-hover:text-white">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Outstanding Balance</p>
                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">₹{stats.totalPending.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl transition-all group-hover:bg-amber-500 group-hover:text-white">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Toolbar Panel */}
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200/65 dark:border-slate-700/80 shadow-sm flex flex-col gap-3 transition-colors">

                {/* Row 1: Period + Staff filter + Add button */}
                <div className="flex items-center gap-2 flex-wrap">

                    {/* Month custom dropdown */}
                    <div className="relative" ref={monthRef}>
                        <button
                            type="button"
                            onClick={() => { setMonthOpen(o => !o); setYearOpen(false); setStaffOpen(false); }}
                            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors select-none"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][filterMonth - 1]}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${monthOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {monthOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[100px] max-h-44 overflow-y-auto">
                                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                                    <button key={m} type="button"
                                        onClick={() => { setFilterMonth(i + 1); setMonthOpen(false); }}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors ${
                                            filterMonth === i + 1
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >{m}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year custom dropdown */}
                    <div className="relative" ref={yearRef}>
                        <button
                            type="button"
                            onClick={() => { setYearOpen(o => !o); setMonthOpen(false); setStaffOpen(false); }}
                            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors select-none"
                        >
                            <span>{filterYear}</span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${yearOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {yearOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[80px]">
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <button key={y} type="button"
                                        onClick={() => { setFilterYear(y); setYearOpen(false); }}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors ${
                                            filterYear === y
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >{y}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Staff custom dropdown */}
                    <div className="relative" ref={staffRef}>
                        <button
                            type="button"
                            onClick={() => { setStaffOpen(o => !o); setMonthOpen(false); setYearOpen(false); }}
                            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-colors max-w-[160px] sm:max-w-none"
                        >
                            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">
                                {filterStaff === 'All' ? 'All Employees' : activeStaffList.find(s => s._id === filterStaff)?.name || 'All Employees'}
                            </span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${staffOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {staffOpen && (
                            <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[160px] max-h-52 overflow-y-auto">
                                <button type="button"
                                    onClick={() => { setFilterStaff('All'); setStaffOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors ${
                                        filterStaff === 'All'
                                            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >All Employees</button>
                                {activeStaffList.map(s => (
                                    <button key={s._id} type="button"
                                        onClick={() => { setFilterStaff(s._id); setStaffOpen(false); }}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors ${
                                            filterStaff === s._id
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >{s.name}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="ml-auto px-3 sm:px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:shadow-primary/10 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Record Advance Salary
                    </button>
                </div>

                {/* Row 2: Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff, reason..."
                        className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-slate-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Ledger Records Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden relative min-h-[300px] transition-colors">
                
                {loading && (
                    <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-750 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md">
                            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest animate-pulse">Syncing Ledger...</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[680px]">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/60 border-b border-slate-150 dark:border-slate-750 text-left">
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Staff Details</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date / Cycle</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reason / Notes</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deduction Status</th>
                                <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-750/50">
                            {filteredLedger.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <FileText className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">No salary advance logs found.</p>
                                    </td>
                                </tr>
                            )}
                            {filteredLedger.map(item => (
                                <tr key={item._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200/50 dark:border-slate-650/40 flex items-center justify-center text-slate-500 dark:text-slate-400 font-extrabold text-xs shrink-0 overflow-hidden shadow-inner">
                                                {item.staffId?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.staffId?.name || 'Deleted Staff'}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.staffId?.role || 'Staff'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-250">
                                                {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <span className="text-[9px] text-slate-400 uppercase font-black">Cycle: {formatMonthYear(item.month, item.year)}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs truncate" title={item.reason}>
                                            {item.reason || '—'}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-primary dark:text-slate-100">₹{item.amount?.toLocaleString()}</p>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded-md ${STATUS_META[item.status]?.cls || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                {item.status}
                                            </span>
                                            {item.isAdjusted ? (
                                                <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                    <Check className="w-3 h-3 shrink-0" />
                                                    Adjusted in Payroll
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                                    <Clock className="w-3 h-3 shrink-0" />
                                                    Pending Adjustment
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEdit(item)} 
                                                disabled={item.isAdjusted}
                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary bg-transparent hover:bg-slate-50 dark:hover:bg-slate-750 transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
                                                title={item.isAdjusted ? "Cannot edit adjusted advance" : "Edit Advance Details"}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item._id)} 
                                                disabled={item.isAdjusted}
                                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-500 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-750 transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
                                                title={item.isAdjusted ? "Cannot delete adjusted advance" : "Delete Advance"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 sm:px-6 py-3 border-t border-slate-150 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-2 transition-colors">
                    <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-450 dark:text-slate-555 font-bold uppercase tracking-wider leading-relaxed">
                        Advances registered in approved/paid status will automatically adjust on next payroll generation.
                    </p>
                </div>
            </div>

            {/* Record / Edit Modal Dialog */}
            {createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div 
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={closeModal}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl relative flex flex-col max-h-[90vh] transition-all text-left"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-white dark:bg-slate-800">
                                    <div>
                                        <h2 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 tracking-tight uppercase flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-primary" />
                                            {editingAdvance ? 'Edit Advance Salary Entry' : 'Record Salary Advance'}
                                        </h2>
                                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase mt-1 tracking-wider">
                                            {editingAdvance ? 'Modify existing ledger details' : 'Add new payout entry to staff salary ledger'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={closeModal} 
                                        className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-450 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800">
                                    <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800 dark:text-slate-200">
                                        
                                        {/* Staff Selection Dropdown (Only editable on create) */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-450 ml-1 uppercase">Staff Member *</label>
                                            <select 
                                                value={form.staffId} 
                                                onChange={e => setForm({ ...form, staffId: e.target.value })}
                                                disabled={!!editingAdvance}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Select Staff...</option>
                                                {activeStaffList.map(s => (
                                                    <option key={s._id} value={s._id}>
                                                        {s.name} ({s.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Amount */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-450 ml-1 uppercase">Advance Amount (₹) *</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Enter amount (e.g. 5000)"
                                                    value={form.amount} 
                                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" 
                                                />
                                            </div>

                                            {/* Date */}
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-450 ml-1 uppercase">Advance Date *</label>
                                                <input 
                                                    type="date" 
                                                    value={form.date} 
                                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-755 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none" 
                                                />
                                            </div>
                                        </div>

                                        {/* Status selection */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-450 ml-1 uppercase">Advance Status</label>
                                            <select 
                                                value={form.status} 
                                                onChange={e => setForm({ ...form, status: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer"
                                            >
                                                <option value="paid">Paid (Disbursed to Employee)</option>
                                                <option value="approved">Approved (Awaiting Payout)</option>
                                                <option value="pending">Pending Review</option>
                                            </select>
                                        </div>

                                        {/* Reason */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-450 ml-1 uppercase">Reason (Optional)</label>
                                            <textarea 
                                                rows={3} 
                                                value={form.reason} 
                                                onChange={e => setForm({ ...form, reason: e.target.value })}
                                                placeholder="Enter reason for advance salary request..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-250 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none transition-all placeholder-slate-450" 
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-end gap-2 shrink-0">
                                        <button 
                                            type="button" 
                                            onClick={closeModal} 
                                            className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center gap-1.5"
                                        >
                                            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            Save Entry
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2.5 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-950/20 text-xs font-bold tracking-wide select-none"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
