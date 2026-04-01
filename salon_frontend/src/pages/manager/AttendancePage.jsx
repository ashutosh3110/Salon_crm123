import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    CalendarCheck, Clock, UserCheck, UserMinus,
    ArrowLeftRight, Search, Filter, CheckCircle2,
    Calendar, MoreVertical, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
    ChevronLeft, ChevronRight, MessageSquare, Download, MapPin, Check, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';

const STATUS_META = {
    present: { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', color: '#10b981' },
    late: { label: 'Late', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', color: '#f59e0b' },
    absent: { label: 'Absent', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20', color: '#ef4444' },
    'half-day': { label: 'Half Day', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20', color: '#3b82f6' },
    leave: { label: 'On Leave', cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', color: '#8b5cf6' },
};

function formatDisplayTime(iso) {
    if (!iso) return '--:--';
    try {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return '--:--';
    }
}

function toTimeInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AttendancePage() {
    const { staff, fetchStaff } = useBusiness();
    const [rawAttendance, setRawAttendance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leavesLoading, setLeavesLoading] = useState(false);
    
    // UI States
    const [remarkModal, setRemarkModal] = useState(null);
    const [remark, setRemark] = useState('');
    const [editModal, setEditModal] = useState(null);
    const [newStatus, setNewStatus] = useState('present');
    const [editCheckIn, setEditCheckIn] = useState('');
    const [editCheckOut, setEditCheckOut] = useState('');
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);

    const showToast = useCallback((msg) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast(msg);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/attendance', { params: { date: selectedDate } });
            const payload = res.data?.data ?? res.data;
            const records = payload?.records ?? [];
            setRawAttendance(records);
        } catch (e) {
            showToast('Failed to load attendance logs');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, showToast]);

    const loadLeaves = useCallback(async () => {
        setLeavesLoading(true);
        try {
            const res = await api.get('/attendance/leaves', { params: { status: 'PENDING' } });
            setLeaveRequests(res.data?.data || []);
        } catch (e) {
            console.error('Failed to load leaves', e);
        } finally {
            setLeavesLoading(false);
        }
    }, []);

    // Merge staff with raw attendance data on render
    const records = useMemo(() => {
        const staffList = Array.isArray(staff) ? staff : [];
        if (!staffList.length && !loading) return [];
        
        const byUser = {};
        rawAttendance.forEach((row) => {
            const uid = row.userId?._id || row.userId;
            if (uid) byUser[String(uid)] = row;
        });

        return staffList.map((u) => {
            const entry = byUser[String(u._id || u.id)];
            return {
                id: String(u._id || u.id),
                name: u.name || 'Unknown',
                role: u.role || 'Staff',
                outlet: u.outletId?.name || 'Main',
                checkIn: formatDisplayTime(entry?.checkInAt),
                checkOut: formatDisplayTime(entry?.checkOutAt),
                checkInAt: entry?.checkInAt,
                checkOutAt: entry?.checkOutAt,
                status: entry?.status || 'absent',
                hours: entry?.hoursWorked ?? 0,
                location: entry?.location || 'Salon',
                remark: entry?.remark || '',
            };
        });
    }, [staff, rawAttendance, loading]);

    useEffect(() => {
        fetchAttendance();
        loadLeaves();
    }, [fetchAttendance, loadLeaves]);

    useEffect(() => {
        fetchStaff?.();
    }, []); // Run only once on mount

    const changeDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const filteredRecords = useMemo(() => records.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    }), [records, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const total = records.length;
        const present = records.filter(r => ['present', 'late', 'half-day'].includes(r.status)).length;
        const late = records.filter(r => r.status === 'late').length;
        const onLeave = records.filter(r => r.status === 'leave').length;
        const coverage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return { total, present, late, onLeave, coverage };
    }, [records]);

    const chartData = useMemo(() => [
        { name: 'Present', value: records.filter(r => r.status === 'present').length, color: '#10b981' },
        { name: 'Late', value: stats.late, color: '#f59e0b' },
        { name: 'Absent', value: records.filter(r => r.status === 'absent').length, color: '#ef4444' },
        { name: 'Leave', value: stats.onLeave, color: '#8b5cf6' },
    ].filter(d => d.value > 0), [records, stats]);

    const applyUpdate = async (e) => {
        e.preventDefault();
        if (!editModal) return;
        try {
            await api.post('/attendance', {
                userId: editModal.id,
                date: selectedDate,
                status: newStatus,
                checkIn: editCheckIn || undefined,
                checkOut: editCheckOut || undefined,
            });
            showToast(`Updated: ${editModal.name}`);
            setEditModal(null);
            loadDay();
        } catch (err) {
            showToast('Update failed');
        }
    };

    const handleBulkAction = async (status) => {
        try {
            await api.post('/attendance/bulk', {
                date: selectedDate,
                status,
                defaultCheckIn: status === 'present' ? '09:00' : undefined
            });
            showToast(`All staff marked as ${status}`);
            loadDay();
        } catch (err) {
            showToast('Bulk action failed');
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await api.patch(`/attendance/leaves/${id}`, { status });
            showToast(`Leave ${status.toLowerCase()}ed`);
            loadLeaves();
            loadDay(); // Refresh registry as status might change
        } catch (err) {
            showToast('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Attendance Log</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">System :: presence_monitor_v2.0 // operation_hub</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-surface border border-border flex items-center gap-3 px-4 py-2">
                        <button onClick={() => changeDate(-1)} className="hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} 
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer" />
                        <button onClick={() => changeDate(1)} className="hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Analytics & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-surface p-6 sm:p-8 border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full md:w-auto relative z-10">
                        {[
                            { label: 'Present Today', value: stats.present, total: stats.total, icon: UserCheck, color: 'text-emerald-500' },
                            { label: 'Late Arrivals', value: stats.late, icon: Clock, color: 'text-amber-500' },
                            { label: 'On Leave', value: stats.onLeave, icon: UserMinus, color: 'text-violet-500' },
                            { label: 'Shift Coverage', value: stats.coverage, suffix: '%', icon: CalendarCheck, color: 'text-primary' },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className={`text-2xl font-black ${s.color}`}>
                                        <AnimatedCounter value={s.value} suffix={s.suffix || ''} />
                                    </h3>
                                    {s.total && <span className="text-[10px] text-text-muted font-black">/{s.total}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-[120px] w-[120px] shrink-0 hidden md:block">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" stroke="transparent">
                                    {chartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-text p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden border border-text">
                    <div className="relative z-10">
                        <p className="text-[9px] font-black text-background/60 uppercase tracking-[0.3em]">Quick Actions</p>
                        <h3 className="text-lg font-black text-background mt-1 uppercase tracking-tight">Bulk Management</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-6 relative z-10">
                        <button onClick={() => handleBulkAction('present')} className="py-3 bg-background text-text text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Mark All Present</button>
                        <button onClick={() => handleBulkAction('absent')} className="py-3 bg-background/10 border border-background/20 text-background text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all">Mark All Absent</button>
                    </div>
                </div>
            </div>

            {/* Pending Leaves */}
            <AnimatePresence>
                {leaveRequests.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-surface border border-border p-6 sm:p-8 relative">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-violet-500 animate-pulse" /> Pending Requests
                                </h2>
                                <span className="text-[9px] font-black text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    {leaveRequests.length} Waiting
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {leaveRequests.map((lv) => (
                                    <div key={lv.id} className="bg-white border border-border p-5 group hover:border-violet-500 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-[11px] font-black text-text uppercase leading-none">{lv.userName}</h4>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-tight mt-1 opacity-60">{lv.userRole}</p>
                                            </div>
                                            <div className="bg-surface px-2 py-1 text-[8px] font-black text-violet-500 border border-violet-500/20 uppercase tracking-widest">
                                                {lv.type.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 mb-5">
                                            <div className="flex items-center gap-3 text-[9px] font-black text-text-secondary uppercase">
                                                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                                                {lv.dates}
                                            </div>
                                            {lv.reason && (
                                                <div className="flex gap-3 text-[9px] font-black text-text-muted uppercase leading-relaxed italic opacity-80">
                                                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                                    "{lv.reason}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <button onClick={() => handleLeaveAction(lv.id, 'APPROVED')} 
                                                className="py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Approve</button>
                                            <button onClick={() => handleLeaveAction(lv.id, 'REJECTED')} 
                                                className="py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Registry Table */}
            <div className="bg-white border border-border shadow-sm overflow-hidden text-left relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Syncing registry...</p>
                        </div>
                    </div>
                )}

                <div className="px-6 py-5 border-b border-border bg-surface-alt/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-[10px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500" /> Presence Logs
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input type="text" placeholder="Search registry..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary w-full sm:w-64" />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className="bg-white border border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary">
                            <option value="All">All Status</option>
                            {Object.entries(STATUS_META).map(([key, val]) => (
                                <option key={key} value={key}>{val.label.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-white">
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest font-black">Employee</th>
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-center font-black">Check In</th>
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-center font-black">Check Out</th>
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-center font-black">Hours</th>
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right font-black">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right font-black font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">No matching records found.</td>
                                </tr>
                            ) : filteredRecords.map((r) => (
                                <tr key={r.id} className="hover:bg-surface-alt/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                                {r.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-text uppercase leading-none">{r.name}</p>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-tight mt-1 opacity-60">{r.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-text-secondary uppercase">
                                            <Clock className="w-3 h-3 text-text-muted" /> {r.checkIn}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-text-secondary uppercase">
                                            <Clock className="w-3 h-3 text-text-muted" /> {r.checkOut}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-black text-primary uppercase">{r.hours}h</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 text-[8px] font-black border uppercase tracking-widest ${STATUS_META[r.status]?.cls}`}>
                                            {STATUS_META[r.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => {
                                            setEditModal(r);
                                            setNewStatus(r.status);
                                            setEditCheckIn(toTimeInput(r.checkInAt));
                                            setEditCheckOut(toTimeInput(r.checkOutAt));
                                        }} className="p-2 text-text-muted hover:text-primary transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm border border-border shadow-2xl relative p-8">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest mb-1">Modify Registry</h2>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-8">{editModal.name}</p>
                            
                            <form onSubmit={applyUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(STATUS_META).map(([key, val]) => (
                                        <button key={key} type="button" onClick={() => setNewStatus(key)} 
                                            className={`py-2 px-3 text-[9px] font-black uppercase tracking-widest border transition-all ${newStatus === key ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary'}`}>
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">In-Time</label>
                                        <input type="time" value={editCheckIn} onChange={e => setEditCheckIn(e.target.value)} className="w-full px-3 py-2 border border-border text-xs font-black outline-none focus:border-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Out-Time</label>
                                        <input type="time" value={editCheckOut} onChange={e => setEditCheckOut(e.target.value)} className="w-full px-3 py-2 border border-border text-xs font-black outline-none focus:border-primary" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Submit Logs</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-6 right-6 z-50 bg-text text-background px-6 py-3 border border-border shadow-2xl flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
