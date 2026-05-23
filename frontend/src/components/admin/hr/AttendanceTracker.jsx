import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Calendar as CalendarIcon, Search, CheckCircle2, Clock, Check, X, MessageSquare, ChevronLeft, ChevronRight, AlertCircle, Users, Download, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

const STATUS_META = {
    pending: { label: 'Not Marked', cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20', color: '#64748b' },
    present: { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', color: '#10b981' },
    absent: { label: 'Absent', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20', color: '#ef4444' },
    leave: { label: 'On Leave', cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', color: '#8b5cf6' },
};

function outletLabel(u) {
    if (!u) return '—';
    return u.outletId?.name || '—';
}

function formatDisplayTime(iso) {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return '-';
    }
}

function toTimeInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function buildRow(user, entry) {
    const id = String(user._id || user.id);
    const outlet = outletLabel(user);
    const name = user.name || '';
    const role = user.role || '';
    if (!entry) {
        return {
            id,
            staff: name,
            role,
            outlet,
            checkIn: '-',
            checkOut: '-',
            hours: '0',
            status: 'absent',
            loc: '—',
            remark: '',
            mobile: user.mobile || '',
            checkInAt: null,
            checkOutAt: null,
        };
    }
    const uid = entry.userId?._id || entry.userId;
    return {
        id: String(uid || id),
        staff: entry.userId?.name || name,
        role: entry.userId?.role || role,
        outlet: entry.userId?.outletId?.name || outlet,
        mobile: entry.userId?.mobile || user.mobile || '',
        checkInAt: entry.checkInAt,
        checkOutAt: entry.checkOutAt,
        checkIn: formatDisplayTime(entry.checkInAt),
        checkOut: formatDisplayTime(entry.checkOutAt),
        hours: String(entry.hoursWorked ?? 0),
        status: entry.status || 'absent',
        loc: entry.location || 'Salon',
        remark: entry.remark || '',
        attendanceId: entry._id,
    };
}

export default function AttendanceTracker() {
    const { staff, fetchStaff } = useBusiness();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = useState('All');
    const [toast, setToast] = useState(null);
    
    const [changeStatusModal, setChangeStatusModal] = useState(null);
    const [newStatus, setNewStatus] = useState('present');
    const [editCheckIn, setEditCheckIn] = useState('');
    const [editCheckOut, setEditCheckOut] = useState('');
    const [bulkModal, setBulkModal] = useState(false);
    const [remarkModal, setRemarkModal] = useState(null);
    const [remark, setRemark] = useState('');

    const showToast = useCallback((msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'summary'
    const [summaryData, setSummaryData] = useState({});
    const [summaryLoading, setSummaryLoading] = useState(false);

    const loadSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const d = new Date(selectedDate);
            const res = await api.get('/hr/attendance/summary', {
                params: { month: d.getMonth() + 1, year: d.getFullYear() }
            });
            setSummaryData(res.data?.data || {});
        } catch (e) {
            showToast('Failed to load summary');
        } finally {
            setSummaryLoading(false);
        }
    }, [selectedDate, showToast]);

    useEffect(() => {
        if (viewMode === 'summary') loadSummary();
    }, [viewMode, loadSummary]);

    const loadDay = useCallback(async () => {
        const list = Array.isArray(staff) ? staff : [];
        if (!list.length) {
            setRecords([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/hr/attendance', { params: { date: selectedDate } });
            const payload = res.data?.data ?? [];
            const apiRecords = Array.isArray(payload) ? payload : (payload.records || []);
            const byUser = {};
            apiRecords.forEach((row) => {
                const uid = row.staffId?._id || row.staffId;
                if (uid) byUser[String(uid)] = row;
            });
            const merged = list.map((u) => {
                const uid = String(u._id || u.id);
                const record = byUser[uid];
                return {
                    id: uid,
                    staff: u.name || '',
                    image: u.image || u.hrProfile?.image,
                    role: u.role || 'Staff',
                    mobile: u.phone || u.mobile || '—',
                    outlet: u.outletId?.name || '—',
                    checkIn: record?.checkIn || '-',
                    checkOut: record?.checkOut || '-',
                    hours: '-',
                    status: record?.status || 'pending',
                    loc: record?.notes || 'Salon',
                    remark: record?.notes || '',
                    attendanceId: record?._id,
                    checkInAt: record?.checkInAt,
                    checkOutAt: record?.checkOutAt
                };
            });
            setRecords(merged);
        } catch (e) {
            const msg = e?.response?.data?.message || e?.networkHint || e?.message || 'Failed to load attendance';
            showToast(msg);
            setRecords(list.map(u => ({
                id: String(u._id || u.id),
                staff: u.name || '',
                role: u.role || 'Staff',
                mobile: u.phone || '—',
                outlet: u.outletId?.name || '—',
                status: 'pending',
                checkIn: '-',
                checkOut: '-'
            })));
        } finally {
            setLoading(false);
        }
    }, [selectedDate, staff, showToast]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    useEffect(() => {
        loadDay();
    }, [loadDay]);

        // Date navigation
    const changeDate = (days) => {
        const d = new Date(selectedDate);
        if (days > 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const target = new Date(d);
            target.setDate(target.getDate() + days);
            if (target >= tomorrow) {
                showToast('Cannot mark attendance for future dates');
                return;
            }
        }
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    // Filtered
    const filtered = useMemo(() => records.filter(r => {
        const q = searchTerm.trim().toLowerCase();
        const matchSearch = r.staff.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            (r.mobile && r.mobile.includes(q));
        const matchStatus = activeStatusFilter === 'All' || r.status === activeStatusFilter;
        return matchSearch && matchStatus;
    }), [records, searchTerm, activeStatusFilter]);

    // Stats
    const stats = useMemo(() => {
        const counts = {
            present: records.filter(r => r.status === 'present').length,
            absent: records.filter(r => r.status === 'absent').length,
            leave: records.filter(r => r.status === 'leave').length,
        };
        return counts;
    }, [records]);

    const chartData = useMemo(() => [
        { name: 'Present', value: stats.present, color: STATUS_META.present.color },
        { name: 'Absent', value: stats.absent, color: STATUS_META.absent.color },
        { name: 'On Leave', value: stats.leave, color: STATUS_META.leave.color },
    ].filter(d => d.value > 0), [stats]);

    const applyStatusChange = async (e) => {
        e.preventDefault();
        if (!changeStatusModal) return;
        try {
            await api.post('/hr/attendance', {
                staffId: changeStatusModal.id,
                date: selectedDate,
                status: newStatus,
            });
            showToast(`${changeStatusModal.staff} → ${STATUS_META[newStatus]?.label}`);
            setChangeStatusModal(null);
            await loadDay();
            if (viewMode === 'summary') loadSummary();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Update failed');
        }
    };

    const bulkMarkStatus = async (status) => {
        try {
            const bulkData = records.map(r => ({
                staffId: r.id,
                status,
                checkIn: status === 'present' ? '09:00' : undefined
            }));
            await api.post('/hr/attendance', {
                date: selectedDate,
                bulk: bulkData
            });
            setBulkModal(false);
            showToast(`All staff marked ${status} for ${selectedDate}`);
            await loadDay();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Bulk update failed');
        }
    };

    const saveRemark = async (e) => {
        e.preventDefault();
        if (!remarkModal) return;
        try {
            await api.post('/hr/attendance', {
                staffId: remarkModal.id,
                date: selectedDate,
                status: remarkModal.status,
                notes: remark,
            });
            showToast(`Remark saved for ${remarkModal.staff}`);
            setRemarkModal(null);
            setRemark('');
            await loadDay();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Save remark failed');
        }
    };

    // Export CSV
    const exportCSV = () => {
        const header = 'Staff,Role,Mobile,Status\n';
        const rows = records.map(r => `${r.staff},${r.role},${r.mobile},${r.status}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `attendance_${selectedDate}.csv`; a.click();
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header card with Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left font-black">
                <div className="lg:col-span-2 bg-surface p-8 rounded-none border border-border shadow-sm flex flex-col xl:flex-row items-center justify-between gap-8 text-left relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-left font-black w-full xl:w-auto z-10">
                        <div className="p-4 rounded-none bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left w-full sm:w-auto">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Date</p>
                            <div className="flex items-center gap-3 mt-1 text-left font-black">
                                <button onClick={() => changeDate(-1)} className="p-1.5 rounded-none hover:bg-surface-alt transition-colors text-text-muted hover:text-text border border-border/20"><ChevronLeft className="w-4 h-4" /></button>
                                <input type="date" value={selectedDate} max={new Date().toISOString().split('T')[0]} onChange={e => setSelectedDate(e.target.value)}
                                    className="text-lg font-black text-text bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none uppercase" />
                                <button onClick={() => changeDate(1)} className="p-1.5 rounded-none hover:bg-surface-alt transition-colors text-text-muted hover:text-text border border-border/20"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 h-[140px] w-full max-w-[200px] text-left hidden sm:block z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left font-black w-full xl:w-auto z-10">
                        {[
                            { label: 'Present', value: stats.present, color: 'text-emerald-500' },
                            { label: 'Late', value: stats.late, color: 'text-amber-500' },
                            { label: 'Absent', value: stats.absent, color: 'text-rose-500' },
                            { label: 'Leave', value: stats.leave, color: 'text-violet-500' },
                        ].map(s => (
                            <div key={s.label} className="text-left font-black">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{s.label}</p>
                                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45 pointer-events-none" />
                </div>

                <div className="bg-text p-8 rounded-none shadow-xl shadow-text/10 relative overflow-hidden flex flex-col justify-between text-left font-black">
                    <div className="relative z-10 text-background text-left">
                        <p className="text-[10px] font-black text-background/60 uppercase tracking-[0.3em]">Quick Actions</p>
                        <h3 className="text-lg font-black mt-2 uppercase tracking-tight">Bulk Status Update</h3>
                    </div>
                    <button onClick={() => setBulkModal(true)} className="relative z-10 mt-6 flex items-center justify-center gap-3 px-6 py-4 rounded-none bg-white text-text text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95">
                        <Users className="w-4 h-4" /> Open Mark Portal
                    </button>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-none bg-white/5 rotate-45" />
                </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-surface p-1 border border-border w-fit rounded-none shadow-sm">
                <button onClick={() => setViewMode('daily')}                        className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'daily' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}>Daily Registry</button>
                <button onClick={() => setViewMode('summary')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text'}`}>Monthly Summary</button>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-5 rounded-none border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-black">
                <div className="relative flex-1 max-w-sm text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search staff, role or mobile..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-left">
                    {viewMode === 'daily' && ['All', 'pending', 'present', 'absent', 'leave'].map(s => (
                        <button key={s} onClick={() => setActiveStatusFilter(s)}
                            className={`px-4 py-2 rounded-none text-xs font-black uppercase tracking-[0.1em] border transition-all ${activeStatusFilter === s ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border hover:border-primary'}`}>
                            {s === 'All' ? 'Full View' : STATUS_META[s]?.label}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-border mx-2" />
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-none border border-border text-xs font-black uppercase tracking-[0.1em] text-text-muted hover:bg-surface-alt transition-all">
                        <Download className="w-3.5 h-3.5" /> Export Report
                    </button>
                </div>
            </div>

            {/* Table / Summary Content */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black table-responsive relative">
                {(loading || summaryLoading) && (
                    <div className="absolute inset-0 z-10 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic">Processing staff data…</p>
                    </div>
                )}

                {viewMode === 'daily' ? (
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border/40 text-left font-black">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Staff Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Role / Mobile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {filtered.map(record => (
                                <tr key={record.id} className="hover:bg-surface-alt/20 transition-colors group text-left font-black">
                                    <td className="px-6 py-5 text-left font-black">
                                        <div className="flex items-center gap-4 text-left font-black">
                                            <div className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] shrink-0 overflow-hidden">
                                                {record.image ? (
                                                    <img src={record.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    record.staff.split(' ').map(n => n[0]).join('')
                                                )}
                                            </div>
                                            <div className="text-left font-black">
                                                <p className="text-xs font-black text-text uppercase tracking-tight text-left leading-none">{record.staff}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest text-left mt-1.5 leading-none">{record.outlet}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <p className="text-[10px] font-black text-text uppercase tracking-widest">{record.role}</p>
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 italic">{record.mobile}</p>
                                    </td>

                                    <td className="px-6 py-5 text-left font-black">
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${STATUS_META[record.status]?.cls || ''}`}>
                                            {STATUS_META[record.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">
                                        <div className="flex items-center justify-end gap-2 font-black">
                                            <button onClick={() => {
                                                setChangeStatusModal(record);
                                                setNewStatus(record.status);
                                                setEditCheckIn(toTimeInput(record.checkInAt));
                                                setEditCheckOut(toTimeInput(record.checkOutAt));
                                            }}
                                                className="p-2 rounded-none text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setRemarkModal(record); setRemark(record.remark); }}
                                                className="p-2 rounded-none text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border/40 text-left font-black">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Staff Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Present</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Absent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Leaves</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Half Days</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Total Logs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {records.map(record => {
                                const s = summaryData[record.id] || { present: 0, absent: 0, leave: 0, halfDay: 0, total: 0 };
                                return (
                                    <tr key={record.id} className="hover:bg-surface-alt/20 transition-colors group text-left font-black">
                                        <td className="px-6 py-5 text-left font-black">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] shrink-0 uppercase italic">{record.staff.split(' ').map(n => n[0]).join('')}</div>
                                                <div className="text-left font-black">
                                                    <p className="text-xs font-black text-text uppercase tracking-tight">{record.staff}</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 leading-none italic">{record.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-black text-emerald-500">{s.present}</td>
                                        <td className="px-6 py-5 text-center text-sm font-black text-rose-500">{s.absent}</td>
                                        <td className="px-6 py-5 text-center text-sm font-black text-violet-500">{s.leave}</td>
                                        <td className="px-6 py-5 text-center text-sm font-black text-blue-500">{s.halfDay}</td>
                                        <td className="px-6 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest italic">{s.total} LOGS</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                <div className="px-6 py-4 border-t border-border bg-surface-alt/30 flex items-center gap-3 font-black">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none italic">Note: Records are calculated based on the selected operational date's month cycle.</p>
                </div>
            </div>

            {/* Modals ... */}
            <AnimatePresence>
                {changeStatusModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChangeStatusModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Update Status</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest italic">{changeStatusModal.staff}</p>
                                </div>
                                <button onClick={() => setChangeStatusModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={applyStatusChange} className="space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(STATUS_META).map(([key, val]) => (
                                        <button key={key} type="button" onClick={() => setNewStatus(key)}
                                            className={`py-3 px-3 rounded-none text-[10px] font-black uppercase tracking-widest border transition-all ${newStatus === key ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface text-text-muted border-border hover:border-primary'}`}>
                                            {val.label}
                                        </button>
                                    ))}
                                </div>

                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Update Status</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {bulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBulkModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-8 text-center">
                            <button onClick={() => setBulkModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            <div className="w-14 h-14 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-6 border border-primary/20"><Users className="w-6 h-6 text-primary" /></div>
                            <h3 className="text-xs font-black text-text uppercase tracking-[0.2em]">Mark All Members</h3>
                            <p className="text-[10px] text-text-muted mt-2 mb-8 uppercase font-bold tracking-widest italic leading-relaxed">Choose status to apply to all staff for {selectedDate}</p>
                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => bulkMarkStatus('present')} className="py-4 bg-emerald-500 text-white rounded-none text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:scale-[1.02] transition-all">Mark All Present</button>
                                <button onClick={() => bulkMarkStatus('absent')} className="py-4 bg-rose-500 text-white rounded-none text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:scale-[1.02] transition-all">Mark All Absent</button>
                                <button onClick={() => bulkMarkStatus('leave')} className="py-4 bg-violet-500 text-white rounded-none text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-500/10 hover:scale-[1.02] transition-all">Mark All Leave</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {remarkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemarkModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Daily Note</h2>
                                <button onClick={() => setRemarkModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-[10px] font-black text-primary mb-4 uppercase tracking-widest italic">{remarkModal.staff} · {STATUS_META[remarkModal.status]?.label}</p>
                            <form onSubmit={saveRemark} className="space-y-6">
                                <textarea required rows={4} placeholder="ENTER LOG DETAIL OR REASON..."
                                    className="w-full px-5 py-4 rounded-none bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none resize-none italic"
                                    value={remark} onChange={e => setRemark(e.target.value)} />
                                <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-none font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">Save Daily Log</button>
                            </form>
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
