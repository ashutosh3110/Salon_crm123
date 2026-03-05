import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Search, Filter, CheckCircle2, XCircle, Clock, Check, X, MessageSquare, ChevronLeft, ChevronRight, AlertCircle, Users, Download, Laptop, Smartphone, Fingerprint, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

const INITIAL_ATTENDANCE = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'present', hours: '9.2', outlet: 'Main Branch', inSource: 'Web', loc: '28.6139, 77.2090' },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', checkIn: '09:45 AM', checkOut: '07:00 PM', status: 'late', hours: '9.2', outlet: 'City Center', inSource: 'Mobile', loc: '28.5355, 77.3910' },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hours: '9.0', outlet: 'Main Branch', inSource: 'Biometric', loc: '28.6139, 77.2090' },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', checkIn: '-', checkOut: '-', status: 'absent', hours: '0', outlet: 'West End', inSource: '-', loc: '-' },
    { id: 5, staff: 'Priya Singh', role: 'Technician', checkIn: '10:30 AM', checkOut: '04:30 PM', status: 'half-day', hours: '6.0', outlet: 'Main Branch', inSource: 'Web', loc: '28.6139, 77.2090' },
    { id: 6, staff: 'Amit Sharma', role: 'Barber', checkIn: '09:05 AM', checkOut: '06:00 PM', status: 'present', hours: '8.9', outlet: 'Main Branch', inSource: 'Biometric', loc: '28.6139, 77.2090' },
    { id: 7, staff: 'Kavita Patel', role: 'Nail Tech', checkIn: '-', checkOut: '-', status: 'leave', hours: '0', outlet: 'Bandra Branch', inSource: '-', loc: '-' },
];

const STATUS_META = {
    present: { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', color: '#10b981' },
    late: { label: 'Late', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', color: '#f59e0b' },
    absent: { label: 'Absent', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20', color: '#ef4444' },
    'half-day': { label: 'Half Day', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20', color: '#3b82f6' },
    leave: { label: 'On Leave', cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', color: '#8b5cf6' },
};

export default function AttendanceTracker() {
    const [records, setRecords] = useState(INITIAL_ATTENDANCE);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [remarkModal, setRemarkModal] = useState(null);
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
    const stats = useMemo(() => {
        const counts = {
            present: records.filter(r => r.status === 'present').length,
            late: records.filter(r => r.status === 'late').length,
            absent: records.filter(r => r.status === 'absent').length,
            'half-day': records.filter(r => r.status === 'half-day').length,
            leave: records.filter(r => r.status === 'leave').length,
        };
        return counts;
    }, [records]);

    const chartData = useMemo(() => [
        { name: 'Present', value: stats.present, color: STATUS_META.present.color },
        { name: 'Late', value: stats.late, color: STATUS_META.late.color },
        { name: 'Absent', value: stats.absent, color: STATUS_META.absent.color },
        { name: 'Half Day', value: stats['half-day'], color: STATUS_META['half-day'].color },
        { name: 'On Leave', value: stats.leave, color: STATUS_META.leave.color },
    ].filter(d => d.value > 0), [stats]);

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
        <div className="space-y-6 font-black text-left">
            {/* Header card with Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-left font-black">
                <div className="lg:col-span-2 bg-surface p-8 rounded-none border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 text-left">
                    <div className="flex items-center gap-6 text-left font-black">
                        <div className="p-4 rounded-none bg-primary/10 text-primary border border-primary/20 shrink-0">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Date</p>
                            <div className="flex items-center gap-3 mt-1 text-left font-black">
                                <button onClick={() => changeDate(-1)} className="p-1.5 rounded-none hover:bg-surface-alt transition-colors text-text-muted hover:text-text border border-border/20"><ChevronLeft className="w-4 h-4" /></button>
                                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                    className="text-lg font-black text-text bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none uppercase" />
                                <button onClick={() => changeDate(1)} className="p-1.5 rounded-none hover:bg-surface-alt transition-colors text-text-muted hover:text-text border border-border/20"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 h-[140px] w-full max-w-[200px] text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={35}
                                    outerRadius={55}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
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
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left font-black">
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
                </div>

                <div className="bg-text p-8 rounded-none shadow-xl shadow-text/10 relative overflow-hidden flex flex-col justify-between text-left font-black">
                    <div className="relative z-10 text-background text-left">
                        <p className="text-[10px] font-black text-background/60 uppercase tracking-[0.3em]">System Protocol</p>
                        <h3 className="text-lg font-black mt-2 uppercase tracking-tight">Bulk Command</h3>
                    </div>
                    <button onClick={() => setBulkModal(true)} className="relative z-10 mt-6 flex items-center justify-center gap-3 px-6 py-4 rounded-none bg-white text-text text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95">
                        <Check className="w-4 h-4" /> Initialize Mark All
                    </button>
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-none bg-white/5 rotate-45" />
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-5 rounded-none border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-black">
                <div className="relative flex-1 max-w-sm text-left">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" placeholder="QUERY STAFF REGISTRY..."
                        className="w-full pl-12 pr-4 py-3 rounded-none bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-left">
                    {['All', 'present', 'late', 'absent', 'half-day', 'leave'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-none text-[9px] font-black uppercase tracking-[0.1em] border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface text-text-muted border-border hover:border-primary'}`}>
                            {s === 'All' ? 'Full View' : STATUS_META[s]?.label}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-border mx-2" />
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-none border border-border text-[9px] font-black uppercase tracking-[0.1em] text-text-muted hover:bg-surface-alt transition-all">
                        <Download className="w-3.5 h-3.5" /> Output Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                <div className="overflow-x-auto text-left font-black">
                    <table className="w-full text-left font-black">
                        <thead>
                            <tr className="bg-surface-alt/50 border-b border-border text-left font-black">
                                {['Employee_node', 'Check_In', 'Check_Out', 'Intensity', 'Geolocation', 'Status_Bit', 'Control'].map(h => (
                                    <th key={h} className={`px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ${h === 'Control' ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {filtered.map(record => (
                                <tr key={record.id} className="hover:bg-surface-alt/20 transition-colors group text-left font-black">
                                    <td className="px-6 py-5 text-left font-black">
                                        <div className="flex items-center gap-4 text-left font-black">
                                            <div className="w-9 h-9 rounded-none bg-background border border-border flex items-center justify-center text-text-muted font-black text-[11px] shrink-0">
                                                {record.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="text-left font-black">
                                                <p className="text-xs font-black text-text uppercase tracking-tight text-left leading-none">{record.staff}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest text-left mt-1.5 leading-none">{record.outlet}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <div className="flex items-center gap-3 text-[11px] font-black text-text uppercase text-left">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />{record.checkIn}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <div className="flex items-center gap-3 text-[11px] font-black text-text uppercase text-left">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />{record.checkOut}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-[11px] font-black text-primary uppercase text-left font-black">{record.hours}HRS</td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <div className="flex items-center gap-2.5 text-[10px] font-black text-text-muted uppercase text-left group-hover:text-primary transition-colors">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {record.loc || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left font-black">
                                        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${STATUS_META[record.status]?.cls || ''}`}>
                                            {STATUS_META[record.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-black">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity font-black">
                                            <button onClick={() => { setChangeStatusModal(record); setNewStatus(record.status); }}
                                                className="p-2 rounded-none text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setRemarkModal(record); setRemark(''); }}
                                                className="p-2 rounded-none text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-border bg-surface-alt/30 flex items-center gap-3 font-black">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none">Security loop: Logs auto-seal at 23:59:59 daily. manual override requires root access.</p>
                </div>
            </div>

            {/* Modals remain similarly styled but with sharp industrial themes */}
            <AnimatePresence>
                {changeStatusModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChangeStatusModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Override Status</h2>
                                    <p className="text-[10px] font-black text-primary mt-1 uppercase tracking-widest">{changeStatusModal.staff}</p>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">In_Bound</label>
                                        <input type="time" className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Out_Bound</label>
                                        <input type="time" className="w-full px-4 py-3 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Execute Change</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Remark Modal, Bulk Modal and Toast styled similarly ... */}
            <AnimatePresence>
                {remarkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemarkModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-none border border-border shadow-2xl relative p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Attach Remark</h2>
                                <button onClick={() => setRemarkModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text"><X className="w-5 h-5" /></button>
                            </div>
                            <p className="text-[10px] font-black text-primary mb-4 uppercase tracking-widest">{remarkModal.staff} · {STATUS_META[remarkModal.status]?.label}</p>
                            <form onSubmit={saveRemark} className="space-y-6">
                                <textarea required rows={4} placeholder="ENTER LOG DETAIL..."
                                    className="w-full px-5 py-4 rounded-none bg-background border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none resize-none"
                                    value={remark} onChange={e => setRemark(e.target.value)} />
                                <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">Submit Entry</button>
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
                            className="bg-surface w-full max-w-xs rounded-none border border-border shadow-2xl relative p-8 text-center">
                            <button onClick={() => setBulkModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            <div className="w-14 h-14 bg-primary/10 rounded-none flex items-center justify-center mx-auto mb-6 border border-primary/20"><Users className="w-6 h-6 text-primary" /></div>
                            <h3 className="text-xs font-black text-text uppercase tracking-[0.2em]">Global Override</h3>
                            <p className="text-[10px] text-text-muted mt-2 mb-8 uppercase font-bold tracking-widest">Applying status to all sequence nodes for {selectedDate}</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={bulkMarkPresent} className="w-full py-4 bg-emerald-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 hover:scale-[1.02] transition-all">Force Present</button>
                                <button onClick={bulkMarkAbsent} className="w-full py-4 bg-rose-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:scale-[1.02] transition-all">Force Absent</button>
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
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
