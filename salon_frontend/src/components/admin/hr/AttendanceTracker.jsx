import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Search, Filter, CheckCircle2, XCircle, Clock, Check, X, MessageSquare, ChevronLeft, ChevronRight, AlertCircle, Users, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_ATTENDANCE = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'present', hours: '9.2', outlet: 'Main Branch' },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', checkIn: '09:45 AM', checkOut: '07:00 PM', status: 'late', hours: '9.2', outlet: 'City Center' },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hours: '9.0', outlet: 'Main Branch' },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', checkIn: '-', checkOut: '-', status: 'absent', hours: '0', outlet: 'West End' },
    { id: 5, staff: 'Priya Singh', role: 'Technician', checkIn: '10:30 AM', checkOut: '04:30 PM', status: 'half-day', hours: '6.0', outlet: 'Main Branch' },
    { id: 6, staff: 'Amit Sharma', role: 'Barber', checkIn: '09:05 AM', checkOut: '06:00 PM', status: 'present', hours: '8.9', outlet: 'Main Branch' },
    { id: 7, staff: 'Kavita Patel', role: 'Nail Tech', checkIn: '-', checkOut: '-', status: 'leave', hours: '0', outlet: 'Bandra Branch' },
];

const STATUS_META = {
    present: { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    late: { label: 'Late', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    absent: { label: 'Absent', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
    'half-day': { label: 'Half Day', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    leave: { label: 'On Leave', cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
};

export default function AttendanceTracker() {
    const [records, setRecords] = useState(INITIAL_ATTENDANCE);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [remarkModal, setRemarkModal] = useState(null);  // staff record for remark
    const [remark, setRemark] = useState('');
    const [changeStatusModal, setChangeStatusModal] = useState(null);
    const [bulkModal, setBulkModal] = useState(false);
    const [newStatus, setNewStatus] = useState('present');
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    // Date navigation
    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    // Filtered
    const filtered = useMemo(() => records.filter(r => {
        const matchSearch = r.staff.toLowerCase().includes(searchTerm.toLowerCase()) || r.outlet.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchSearch && matchStatus;
    }), [records, searchTerm, filterStatus]);

    // Stats
    const stats = useMemo(() => ({
        present: records.filter(r => r.status === 'present').length,
        late: records.filter(r => r.status === 'late').length,
        absent: records.filter(r => r.status === 'absent').length,
        leave: records.filter(r => r.status === 'leave').length,
    }), [records]);

    // Change status for single record
    const applyStatusChange = (e) => {
        e.preventDefault();
        setRecords(prev => prev.map(r => r.id === changeStatusModal.id ? { ...r, status: newStatus } : r));
        showToast(`${changeStatusModal.staff} → ${STATUS_META[newStatus]?.label}`);
        setChangeStatusModal(null);
    };

    // Bulk mark all as present
    const bulkMarkPresent = () => {
        setRecords(prev => prev.map(r => ({ ...r, status: 'present', checkIn: '09:00 AM', checkOut: r.checkOut === '-' ? '-' : r.checkOut })));
        setBulkModal(false);
        showToast(`All ${records.length} staff marked present`);
    };
    const bulkMarkAbsent = () => {
        setRecords(prev => prev.map(r => ({ ...r, status: 'absent', checkIn: '-', checkOut: '-' })));
        setBulkModal(false);
        showToast(`All ${records.length} staff marked absent`);
    };

    // Save remark
    const saveRemark = (e) => {
        e.preventDefault();
        showToast(`Remark saved for ${remarkModal.staff}`);
        setRemarkModal(null); setRemark('');
    };

    // Export CSV
    const exportCSV = () => {
        const header = 'Staff,Role,Outlet,Check-In,Check-Out,Hours,Status\n';
        const rows = records.map(r => `${r.staff},${r.role},${r.outlet},${r.checkIn},${r.checkOut},${r.hours}h,${r.status}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `attendance_${selectedDate}.csv`; a.click();
    };

    return (
        <div className="space-y-5">
            {/* Header card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-surface p-5 rounded-3xl border border-border/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Attendance Date</p>
                            <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => changeDate(-1)} className="p-1 rounded-lg hover:bg-surface-alt transition-colors text-text-muted hover:text-text"><ChevronLeft className="w-4 h-4" /></button>
                                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                    className="text-base font-black text-text bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none" />
                                <button onClick={() => changeDate(1)} className="p-1 rounded-lg hover:bg-surface-alt transition-colors text-text-muted hover:text-text"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5 border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-6">
                        {[
                            { label: 'Present', value: stats.present, color: 'text-emerald-600' },
                            { label: 'Late', value: stats.late, color: 'text-amber-600' },
                            { label: 'Absent', value: stats.absent, color: 'text-rose-600' },
                            { label: 'Leave', value: stats.leave, color: 'text-violet-600' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter">{s.label}</p>
                                <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary p-5 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10 text-white">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Quick Actions</p>
                        <h3 className="text-base font-black mt-1">Bulk Attendance</h3>
                    </div>
                    <button onClick={() => setBulkModal(true)} className="relative z-10 mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-wider hover:bg-white/30 transition-all border border-white/20">
                        <Check className="w-4 h-4" /> Mark All
                    </button>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-4 rounded-2xl border border-border/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="Search staff..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border/40 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status filter chips */}
                    {['All', 'present', 'late', 'absent', 'half-day', 'leave'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border/40 hover:border-primary/40'}`}>
                            {s === 'All' ? 'All' : STATUS_META[s]?.label}
                        </button>
                    ))}
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 text-[10px] font-black uppercase tracking-wider text-text-muted hover:border-primary/40 transition-all">
                        <Download className="w-3 h-3" /> Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-3xl border border-border/40 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/60 border-b border-border/40">
                                {['Employee', 'Check-In', 'Check-Out', 'Hours', 'Status', 'Actions'].map(h => (
                                    <th key={h} className={`px-5 py-3.5 text-[10px] font-black text-text-muted uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filtered.map(record => (
                                <tr key={record.id} className="hover:bg-surface-alt/30 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-surface border border-border/20 flex items-center justify-center text-text-secondary font-black text-xs">
                                                {record.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{record.staff}</p>
                                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{record.outlet}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />{record.checkIn}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />{record.checkOut}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-black text-primary">{record.hours}h</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_META[record.status]?.cls || ''}`}>
                                            {STATUS_META[record.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setChangeStatusModal(record); setNewStatus(record.status); }}
                                                title="Change Status" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setRemarkModal(record); setRemark(''); }}
                                                title="Add Remark" className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3.5 border-t border-border/40 bg-background/40 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-text-muted" />
                    <p className="text-[10px] text-text-muted font-bold">Attendance records auto-lock at 11:59 PM. Manual overrides require Admin approval.</p>
                </div>
            </div>

            {/* ── Change Status Modal ── */}
            <AnimatePresence>
                {changeStatusModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChangeStatusModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[24px] border border-border/40 shadow-2xl relative p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-text uppercase">Change Status</h2>
                                    <p className="text-[10px] font-bold text-primary mt-0.5">{changeStatusModal.staff}</p>
                                </div>
                                <button onClick={() => setChangeStatusModal(null)} className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={applyStatusChange} className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(STATUS_META).map(([key, val]) => (
                                        <button key={key} type="button" onClick={() => setNewStatus(key)}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${newStatus === key ? 'bg-primary text-white border-primary' : `${val.cls} border-current`}`}>
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Check-In</label>
                                        <input type="time" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Check-Out</label>
                                        <input type="time" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">Apply Change</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Remark Modal ── */}
            <AnimatePresence>
                {remarkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemarkModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[24px] border border-border/40 shadow-2xl relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-black text-text uppercase">Add Remark</h2>
                                <button onClick={() => setRemarkModal(null)} className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <p className="text-xs font-bold text-primary mb-3">{remarkModal.staff} · {STATUS_META[remarkModal.status]?.label}</p>
                            <form onSubmit={saveRemark} className="space-y-4">
                                <textarea required rows={4} placeholder="Enter attendance remark or reason..."
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none resize-none"
                                    value={remark} onChange={e => setRemark(e.target.value)} />
                                <button type="submit" className="w-full py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-amber-500/20 hover:scale-[1.01] transition-all">Save Remark</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Bulk Modal ── */}
            <AnimatePresence>
                {bulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBulkModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-xs rounded-[24px] border border-border/40 shadow-2xl relative p-6 text-center">
                            <button onClick={() => setBulkModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users className="w-5 h-5 text-primary" /></div>
                            <h3 className="text-base font-black text-text uppercase">Bulk Mark</h3>
                            <p className="text-xs text-text-muted mt-1 mb-5">Apply status to all {records.length} staff for {selectedDate}</p>
                            <div className="flex gap-2">
                                <button onClick={bulkMarkPresent} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-emerald-500/20 hover:scale-[1.02] transition-all">All Present</button>
                                <button onClick={bulkMarkAbsent} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all">All Absent</button>
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
