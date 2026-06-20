import React from 'react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Calendar as CalendarIcon,
    Search,
    CheckCircle2,
    Check,
    X,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Users,
    Download,
    MapPin,
    Sparkles,
    Filter,
    FileText,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../../contexts/BusinessContext';
import api from '../../../services/api';

const STATUS_META = {
    pending: { label: 'Not Marked', cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20', activeCls: 'bg-slate-500 text-white border-slate-500' },
    present: { label: 'Present', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', activeCls: 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20' },
    absent: { label: 'Absent', cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20', activeCls: 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20' },
    leave: { label: 'On Leave', cls: 'bg-violet-500/10 text-violet-600 border-violet-500/20', activeCls: 'bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-500/20' },
};

export default function AttendanceTracker() {
    const { staff, fetchStaff, outlets = [], fetchOutlets, activeSalonId, salon } = useBusiness();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOutlet, setFilterOutlet] = useState('All');
    const [activeStatusFilter, setActiveStatusFilter] = useState('All');
    const [toast, setToast] = useState(null);
    const [markingId, setMarkingId] = useState(null); // Track inline status update animation state

    const [remarkModal, setRemarkModal] = useState(null);
    const [remark, setRemark] = useState('');
    const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
    const outletDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (outletDropdownRef.current && !outletDropdownRef.current.contains(e.target)) {
                setOutletDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        const sid = activeSalonId || salon?._id;
        fetchStaff(sid);
        fetchOutlets({ salonId: sid });
    }, [fetchStaff, fetchOutlets, activeSalonId, salon?._id]);

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

    // Filter outlets by active salon
    const activeSalonIdStr = String(activeSalonId || salon?._id || '');
    const filteredOutlets = useMemo(() => {
        if (!activeSalonIdStr) return outlets;
        return (outlets || []).filter(o => {
            const oSalonId = String(o?.salonId?._id || o?.salonId || '');
            return oSalonId === activeSalonIdStr;
        });
    }, [outlets, activeSalonIdStr]);

    // Extract unique outlets from context and loaded records
    const uniqueOutlets = useMemo(() => {
        const set = new Set();
        (filteredOutlets || []).forEach(o => {
            if (o?.name) set.add(o.name);
        });
        records.forEach(r => {
            if (r.outlet && r.outlet !== '—') set.add(r.outlet);
        });
        return ['All', ...Array.from(set)];
    }, [filteredOutlets, records]);

    // Filtered records
    const filtered = useMemo(() => records.filter(r => {
        const q = searchTerm.trim().toLowerCase();
        const matchSearch = r.staff.toLowerCase().includes(q) ||
            r.role.toLowerCase().includes(q) ||
            (r.mobile && r.mobile.includes(q));
        const matchStatus = activeStatusFilter === 'All' || r.status === activeStatusFilter;
        const matchOutlet = filterOutlet === 'All' || r.outlet === filterOutlet;
        return matchSearch && matchStatus && matchOutlet;
    }), [records, searchTerm, activeStatusFilter, filterOutlet]);

    // Inline Status Update Trigger
    const handleMarkStatus = async (record, status) => {
        setMarkingId(record.id);
        try {
            await api.post('/hr/attendance', {
                staffId: record.id,
                date: selectedDate,
                status: status,
            });
            showToast(`${record.staff} marked ${STATUS_META[status]?.label}`);
            await loadDay();
            if (viewMode === 'summary') loadSummary();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Update failed');
        } finally {
            setMarkingId(null);
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
        const header = 'Staff,Role,Outlet,Mobile,Status\n';
        const rows = records.map(r => `"${r.staff}","${r.role}","${r.outlet}","${r.mobile}","${r.status}"`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `attendance_${selectedDate}.csv`; a.click();
    };

    return (
        <>
            <style>{`
                .dark .admin-panel.admin-panel.admin-panel * svg.text-indigo-500 { color: #6366f1 !important; stroke: #6366f1 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-emerald-500 { color: #10b981 !important; stroke: #10b981 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-emerald-400 { color: #34d399 !important; stroke: #34d399 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-blue-500 { color: #3b82f6 !important; stroke: #3b82f6 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-purple-500 { color: #a855f7 !important; stroke: #a855f7 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-rose-500 { color: #f43f5e !important; stroke: #f43f5e !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-violet-500 { color: #8b5cf6 !important; stroke: #8b5cf6 !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-primary { color: #B4912B !important; stroke: #B4912B !important; }
                .dark .admin-panel.admin-panel.admin-panel * svg.text-amber-500 { color: #f59e0b !important; stroke: #f59e0b !important; }
                html:not(.dark) .admin-panel td .avatar-color-0 { background-color: #DBEAFE !important; color: #1D4ED8 !important; border-color: #BFDBFE !important; }
                html:not(.dark) .admin-panel td .avatar-color-1 { background-color: #D1FAE5 !important; color: #047857 !important; border-color: #A7F3D0 !important; }
                html:not(.dark) .admin-panel td .avatar-color-2 { background-color: #EDE9FE !important; color: #6D28D9 !important; border-color: #DDD6FE !important; }
                html:not(.dark) .admin-panel td .avatar-color-3 { background-color: #FEF3C7 !important; color: #B45309 !important; border-color: #FDE68A !important; }
                html:not(.dark) .admin-panel td .avatar-color-4 { background-color: #FFE4E6 !important; color: #BE123C !important; border-color: #FECDD3 !important; }
                html:not(.dark) .admin-panel td .avatar-color-5 { background-color: #CFFAFE !important; color: #0E7490 !important; border-color: #A5F3FC !important; }
                html:not(.dark) .admin-panel td .avatar-color-6 { background-color: #FAE8FF !important; color: #A21CAF !important; border-color: #F5D0FE !important; }
            `}</style>
            <div className="space-y-5 text-left bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 transition-colors">

            {/* Top Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/80 shadow-sm flex flex-col gap-3 transition-colors">

                {/* Row 1: Date nav + View switcher + Export */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Date Navigation */}
                    <div className="flex items-center bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors select-none">
                        <button type="button" onClick={() => changeDate(-1)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 mx-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <input
                                type="date"
                                value={selectedDate}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none font-bold text-slate-700 dark:text-slate-200 text-xs w-28"
                            />
                        </div>
                        <button type="button" onClick={() => changeDate(1)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Right side: View switcher + Export */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* View Switcher */}
                        <div className="flex items-center bg-slate-50 dark:bg-slate-750 p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner text-xs transition-colors">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'daily' ? 'bg-white dark:bg-slate-800 !text-slate-900 dark:!text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setViewMode('summary')}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${viewMode === 'summary' ? 'bg-white dark:bg-slate-800 !text-slate-900 dark:!text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Monthly
                            </button>
                        </div>

                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>

                {/* Row 2: Search + Outlet filter */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder-slate-400"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Outlet Custom Dropdown */}
                    <div className="relative shrink-0" ref={outletDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setOutletDropdownOpen(o => !o)}
                            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors max-w-[140px] sm:max-w-none"
                        >
                            <Filter className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-none">
                                {filterOutlet === 'All' ? 'All Outlets' : filterOutlet}
                            </span>
                            <ChevronRight className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${outletDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {outletDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                                {uniqueOutlets.map(o => (
                                    <button
                                        key={o}
                                        type="button"
                                        onClick={() => { setFilterOutlet(o); setOutletDropdownOpen(false); }}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors ${filterOutlet === o
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {o === 'All' ? 'All Outlets' : o}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Status Pill Bar (Only in Daily view) */}
            {viewMode === 'daily' && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <style>{`
                        .admin-panel button.quick-filter-btn { border-radius: 6px !important; }
                    `}</style>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 select-none">Quick Filters:</span>
                    {['All', 'pending', 'present', 'absent', 'leave'].map(s => (
                        <button
                            key={s}
                            onClick={() => setActiveStatusFilter(s)}
                            className={`quick-filter-btn px-3 py-1 text-xs font-bold border transition-all ${activeStatusFilter === s
                                ? '!bg-[#B4912B] !text-white !border-[#B4912B] shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-[#B4912B] hover:text-white hover:border-[#B4912B] dark:hover:!bg-[#B4912B] dark:hover:!text-white dark:hover:!border-[#B4912B]'
                                }`}
                        >
                            {s === 'All' ? 'Show All' : STATUS_META[s]?.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Table Content Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-250/60 dark:border-slate-700/80 shadow-sm overflow-hidden relative transition-colors">

                {/* Loader Overlay */}
                {(loading || summaryLoading) && (
                    <div className="absolute inset-0 z-10 bg-white/70 dark:bg-slate-800/70 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-750 rounded-xl border border-slate-100 dark:border-slate-700 shadow-md">
                            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest animate-pulse">Syncing...</span>
                        </div>
                    </div>
                )}

                {viewMode === 'daily' ? (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full border-collapse min-w-[640px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/60 border-b border-slate-150 dark:border-slate-700">
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Staff Member</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center" style={{ textAlign: 'center' }}>Role / Contact</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center" style={{ textAlign: 'center' }}>Mark Daily Attendance</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center" style={{ textAlign: 'center' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-750/50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <img 
                                                    src="/vector image attendance .png" 
                                                    alt="No records" 
                                                    className="w-48 md:w-56 object-contain drop-shadow-sm mb-4 opacity-90 dark:opacity-80" 
                                                />
                                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider">No matching staff records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(record => {
                                        const isMarking = markingId === record.id;
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/30 transition-colors">

                                                {/* Staff details with profile pic */}
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 overflow-hidden shadow-inner ${record.image ? 'bg-slate-100 dark:bg-slate-700 border-slate-200/50' : (() => {
                                                            let hash = 0;
                                                            for (let i = 0; i < record.staff.length; i++) hash = record.staff.charCodeAt(i) + ((hash << 5) - hash);
                                                            const colorIndex = Math.abs(hash) % 7;
                                                            
                                                            // Provide dark mode classes via Tailwind, light mode forced via the scoped style above
                                                            const darkClasses = [
                                                                'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
                                                                'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
                                                                'dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50',
                                                                'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
                                                                'dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50',
                                                                'dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50',
                                                                'dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800/50'
                                                            ];
                                                            return `avatar-color-${colorIndex} ${darkClasses[colorIndex]}`;
                                                        })()}`}>
                                                            {record.image ? (
                                                                <img src={record.image} alt={record.staff} className="w-full h-full object-cover" />
                                                            ) : (
                                                                record.staff.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                                                            )}
                                                        </div>
                                                        <div className="text-left leading-tight">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{record.staff}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <MapPin className="w-3 h-3 text-rose-500" />
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{record.outlet}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role & Mobile */}
                                                <td className="px-6 py-4 !text-center" style={{ textAlign: 'center' }}>
                                                    <p className="text-[10px] font-bold text-slate-650 dark:text-slate-350 uppercase tracking-wider leading-none text-center inline-block">{record.role}</p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-wider mt-1 italic leading-none text-center inline-block w-full">{record.mobile}</p>
                                                </td>

                                                {/* Inline Status Selection Button Group */}
                                                <td className="px-6 py-4 !text-center" style={{ textAlign: 'center' }}>
                                                    <div className="flex items-center justify-center gap-2 w-full mx-auto">
                                                        {/* Present Button */}
                                                        <button
                                                            onClick={() => handleMarkStatus(record, 'present')}
                                                            disabled={isMarking}
                                                            className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center transition-all ${record.status === 'present'
                                                                ? STATUS_META.present.activeCls
                                                                : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-700 dark:hover:text-slate-200'
                                                                }`}
                                                        >
                                                            <Check className={`w-3.5 h-3.5 mr-1 ${record.status === 'present' ? '' : 'text-emerald-500'}`} />
                                                            Present
                                                        </button>

                                                        {/* Absent Button */}
                                                        <button
                                                            onClick={() => handleMarkStatus(record, 'absent')}
                                                            disabled={isMarking}
                                                            className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center transition-all ${record.status === 'absent'
                                                                ? STATUS_META.absent.activeCls
                                                                : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-700 dark:hover:text-slate-200'
                                                                }`}
                                                        >
                                                            <X className={`w-3.5 h-3.5 mr-1 ${record.status === 'absent' ? '' : 'text-rose-500'}`} />
                                                            Absent
                                                        </button>

                                                        {/* Leave Button */}
                                                        <button
                                                            onClick={() => handleMarkStatus(record, 'leave')}
                                                            disabled={isMarking}
                                                            className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-center transition-all ${record.status === 'leave'
                                                                ? STATUS_META.leave.activeCls
                                                                : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-700 dark:hover:text-slate-200'
                                                                }`}
                                                        >
                                                            <CalendarIcon className={`w-3.5 h-3.5 mr-1 ${record.status === 'leave' ? '' : 'text-violet-500'}`} />
                                                            Leave
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Note / Remark Button */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => { setRemarkModal(record); setRemark(record.remark); }}
                                                            className={`p-2 rounded-xl border transition-all inline-flex items-center justify-center ${record.remark
                                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                                                : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-650'
                                                                }`}
                                                            title={record.remark || 'Add daily remark'}
                                                        >
                                                            <MessageSquare className="w-4 h-4 text-blue-500" />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/60 border-b border-slate-150 dark:border-slate-700">
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">Staff Member</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center">Present</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center">Absent</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center">Leaves</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center">Half Days</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest !text-center">Total Logs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-750/50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <img 
                                                    src="/vector image attendance .png" 
                                                    alt="No records" 
                                                    className="w-48 md:w-56 object-contain drop-shadow-sm mb-4 opacity-90 dark:opacity-80" 
                                                />
                                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider">No staff records available</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(record => {
                                        const s = summaryData[record.id] || { present: 0, absent: 0, leave: 0, halfDay: 0, total: 0 };
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/30 transition-colors">
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 overflow-hidden shadow-inner ${(() => {
                                                            let hash = 0;
                                                            for (let i = 0; i < record.staff.length; i++) hash = record.staff.charCodeAt(i) + ((hash << 5) - hash);
                                                            const colorIndex = Math.abs(hash) % 7;
                                                            
                                                            const darkClasses = [
                                                                'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
                                                                'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
                                                                'dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/50',
                                                                'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
                                                                'dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50',
                                                                'dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50',
                                                                'dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800/50'
                                                            ];
                                                            return `avatar-color-${colorIndex} ${darkClasses[colorIndex]}`;
                                                        })()}`}>
                                                            {record.staff.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                        </div>
                                                        <div className="text-left leading-tight">
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{record.staff}</p>
                                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{record.role}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 !text-center text-sm font-semibold text-slate-700 dark:text-slate-300">{s.present} days</td>
                                                <td className="px-6 py-4 !text-center text-sm font-semibold text-slate-700 dark:text-slate-300">{s.absent} days</td>
                                                <td className="px-6 py-4 !text-center text-sm font-semibold text-slate-700 dark:text-slate-300">{s.leave} days</td>
                                                <td className="px-6 py-4 !text-center text-sm font-semibold text-slate-700 dark:text-slate-300">{s.halfDay} days</td>
                                                <td className="px-6 py-4 !text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.total} LOGS</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Clean Info Footer Row */}
                <div className="px-4 sm:px-6 py-3 border-t border-slate-150 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-2 transition-colors">
                    <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                        Changes are saved instantly in real-time. Logs are calculated for the selected date's monthly cycle.
                    </p>
                </div>
            </div>

            {/* Remark Modal: Styled neatly inside a React Portal with premium background blur */}
            {createPortal(
                <AnimatePresence>
                    {remarkModal && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRemarkModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl relative p-6 transition-all text-left z-10">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                                    <div>
                                        <h2 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 tracking-tight">Daily Note / Remark</h2>
                                        <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">{remarkModal.staff} · {STATUS_META[remarkModal.status]?.label}</p>
                                    </div>
                                    <button onClick={() => setRemarkModal(null)} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all"><X className="w-4 h-4" /></button>
                                </div>
                                <form onSubmit={saveRemark} className="space-y-4">
                                    <textarea
                                        required
                                        rows={3.5}
                                        placeholder="Type details (e.g., late reasons, leave details, shift notes)..."
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none transition-all placeholder-slate-400"
                                        value={remark}
                                        onChange={e => setRemark(e.target.value)}
                                    />
                                    <div className="flex gap-2 w-full">
                                        <button type="button" onClick={() => setRemarkModal(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:!text-slate-300 border border-transparent rounded-xl font-bold text-xs transition-all">Cancel</button>
                                        <button type="submit" className="flex-[1.5] py-2.5 bg-primary hover:bg-primary-dark text-white dark:!bg-[#B4912B] dark:hover:!bg-[#8B6F23] dark:!text-white rounded-xl font-bold text-xs transition-all shadow-md">Save Note</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Compact Toast */}
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
        </>
    );
}
