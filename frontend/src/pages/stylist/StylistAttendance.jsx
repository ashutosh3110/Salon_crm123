import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Menu, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

function todayLocalYmd() {
    return new Date().toLocaleDateString('en-CA');
}

function formatTime(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
        return '—';
    }
}

const statusColors = {
    PRESENT: 'bg-emerald-50 !text-emerald-700 border-emerald-150 dark:bg-emerald-950/40 dark:!text-emerald-300 dark:border-emerald-800',
    ABSENT: 'bg-rose-50 !text-rose-700 border-rose-150 dark:bg-rose-950/40 dark:!text-rose-300 dark:border-rose-800',
    UNMARKED: 'bg-purple-50 !text-purple-700 border-purple-150 dark:bg-purple-950/40 dark:!text-purple-300 dark:border-purple-800',
    WEEKOFF: 'bg-blue-50 !text-blue-700 border-blue-150 dark:bg-blue-950/40 dark:!text-blue-300 dark:border-blue-800',
    LATE: 'bg-amber-50 !text-amber-700 border-amber-150 dark:bg-amber-950/40 dark:!text-amber-300 dark:border-amber-800',
    HALF_DAY: 'bg-indigo-50 !text-indigo-700 border-indigo-150 dark:bg-indigo-950/40 dark:!text-indigo-300 dark:border-indigo-800',
};

const getStatusDisplay = (status) => {
    const s = status?.toUpperCase() || 'UNMARKED';
    if (s === 'PRESENT') return 'Present';
    if (s === 'ABSENT') return 'Absent';
    if (s === 'WEEKOFF') return 'Week Off';
    if (s === 'UNMARKED') return 'Not Marked';
    return s.replace('_', ' ');
};

export default function StylistAttendance() {
    const { setMobileOpen } = useOutletContext() || {};
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, unmarked: 0 });

    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async (month, year) => {
        setHistoryLoading(true);
        setError(null);
        try {
            const res = await api.get('/hr/attendance/history', { params: { month, year } });
            const data = res.data?.data || res.data;
            setHistoryData(data?.data || []);
            
            const records = data?.data || [];
            let present = 0, absent = 0, unmarked = 0;
            
            records.forEach(r => {
                const s = r.status?.toUpperCase();
                if (s === 'PRESENT' || s === 'LATE' || s === 'HALF_DAY') present++;
                else if (s === 'ABSENT') absent++;
                else if (s === 'UNMARKED') unmarked++;
            });
            
            setHistoryStats({ present, absent, unmarked });
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load history');
        } finally {
            setHistoryLoading(false);
        }
    }, []);



    useEffect(() => {
        fetchHistory(currentMonth, currentYear);
    }, [currentMonth, currentYear, fetchHistory]);

    const nextMonth = () => {
        let m = currentMonth + 1;
        let y = currentYear;
        if (m > 11) { m = 0; y++; }
        if (new Date(y, m, 1) > new Date()) return;
        setCurrentMonth(m);
        setCurrentYear(y);
    };

    const prevMonth = () => {
        let m = currentMonth - 1;
        let y = currentYear;
        if (m < 0) { m = 11; y--; }
        setCurrentMonth(m);
        setCurrentYear(y);
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

    const todayStr = todayLocalYmd();
    const todayRecord = historyData.find(d => d.date === todayStr);
    const currentStatus = todayRecord ? todayRecord.status : 'UNMARKED';

    if (error === 'Staff not found' || error?.includes('Staff not found')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-white dark:bg-slate-900 rounded-[24px]">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
                    <CalendarIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Staff Profile Pending</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    Your account is not linked to a staff profile in this salon yet. Please ask your administrator or manager to add you to the staff roster.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-[#7C3AED] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all cursor-pointer border-0"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#FAFAFC] dark:bg-slate-900 lg:rounded-[24px] lg:shadow-sm overflow-hidden min-h-screen lg:min-h-0 pb-20 lg:pb-0 font-sans">
            
            {/* Mobile Header */}
            <div className="flex lg:hidden items-center justify-between px-4 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-[50]">
                <button 
                    onClick={() => setMobileOpen && setMobileOpen(true)}
                    className="p-2 -ml-2 rounded-xl text-slate-800 dark:text-white bg-transparent border-0 cursor-pointer"
                >
                    <Menu className="w-6 h-6 stroke-[2]" />
                </button>
                <span className="text-[17px] font-bold text-slate-900 dark:text-white">
                    Attendance
                </span>
                <div className="w-10 h-10" />
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-center px-6 pt-6 pb-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-[20px] font-bold text-slate-900 dark:text-white text-center">
                    Attendance
                </h1>
            </div>

            <div className="px-4 lg:px-6 py-4 overflow-y-auto no-scrollbar flex-1">
                {/* Daily Status Card (Hero) */}
                <div className="!bg-[#5D2EE6] rounded-[20px] p-5 text-white mb-6">
                    <div>
                        <p className="text-[12.5px] font-medium !text-white/80 uppercase tracking-wide mb-1.5">Today's Status</p>
                        <h2 className="text-[28px] font-semibold tracking-tight leading-none !text-white">
                            {getStatusDisplay(currentStatus)}
                        </h2>
                    </div>
                </div>

                {/* Monthly History Section Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white px-1">Monthly History</h3>
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-150 dark:border-slate-700 shadow-sm">
                        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-355 transition-colors border-0 cursor-pointer bg-transparent">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-[11px] font-bold text-slate-800 dark:text-slate-200 min-w-[90px] text-center">{monthName}</span>
                        <button onClick={nextMonth} disabled={isCurrentMonth} className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors border-0 cursor-pointer bg-transparent ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-355'}`}>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3.5 mb-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-emerald-100/30">
                        <span className="text-[24px] font-semibold !text-emerald-700 dark:!text-emerald-450 leading-none mb-1.5">{historyStats.present}</span>
                        <span className="text-[11px] font-bold !text-emerald-600 dark:!text-emerald-500 uppercase tracking-wider">Present</span>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-rose-100/30">
                        <span className="text-[24px] font-semibold !text-rose-700 dark:!text-rose-400 leading-none mb-1.5">{historyStats.absent}</span>
                        <span className="text-[11px] font-bold !text-rose-600 dark:!text-rose-500 uppercase tracking-wider">Absent</span>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-750 p-5 overflow-hidden">
                    {historyLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin text-[#5D2EE6]" />
                            <span className="text-[13px] font-semibold">Loading history...</span>
                        </div>
                    ) : historyData.length === 0 ? (
                        <div className="py-12 text-center text-slate-550 dark:text-slate-400 text-[13px] font-bold">
                            No attendance records found for this month.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-750">
                            {historyData.map((record, i) => {
                                const d = new Date(record.date);
                                if (d > new Date()) return null;
                                const displayDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
                                
                                return (
                                    <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">{displayDate}</span>
                                            <span className="text-[11px] font-bold text-slate-400 mt-1">
                                                {formatTime(record.checkInAt)} - {formatTime(record.checkOutAt)}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-[6px] uppercase tracking-wider ${statusColors[record.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {record.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
