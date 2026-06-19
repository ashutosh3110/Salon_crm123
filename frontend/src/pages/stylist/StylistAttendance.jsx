import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

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
    PRESENT: 'bg-emerald-100 !text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:!text-emerald-300 dark:border-emerald-800',
    ABSENT: 'bg-rose-100 !text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:!text-rose-300 dark:border-rose-800',
    UNMARKED: 'bg-purple-100 !text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:!text-purple-300 dark:border-purple-800',
    WEEKOFF: 'bg-blue-100 !text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:!text-blue-300 dark:border-blue-800',
    LATE: 'bg-amber-100 !text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:!text-amber-300 dark:border-amber-800',
    HALF_DAY: 'bg-indigo-100 !text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:!text-indigo-300 dark:border-indigo-800',
};

const getStatusDisplay = (status) => {
    const s = status?.toUpperCase() || 'UNMARKED';
    if (s === 'PRESENT') return 'Present';
    if (s === 'ABSENT') return 'Absent';
    if (s === 'WEEKOFF') return 'Week Off';
    if (s === 'UNMARKED') return 'Not Marked';
    return s.replace('_', ' ');
};

const getStatusColor = (status) => {
    const s = status?.toUpperCase() || 'UNMARKED';
    return statusColors[s] || statusColors['UNMARKED'];
};

export default function StylistAttendance() {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, unmarked: 0 });
    const [isMarking, setIsMarking] = useState(false);

    const fetchHistory = useCallback(async (month, year) => {
        setHistoryLoading(true);
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
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    const handleMarkAttendance = async (status) => {
        setIsMarking(true);
        try {
            await api.post('/hr/attendance/punch', {
                status: status,
                date: todayLocalYmd(),
                location: 'Marked manually',
                latitude: 0,
                longitude: 0,
            });
            await fetchHistory(currentMonth, currentYear);
            alert(`Successfully marked ${status} for today!`);
        } catch (e) {
            console.error('Failed to mark attendance', e);
            alert(e?.response?.data?.message || 'Failed to record attendance.');
        } finally {
            setIsMarking(false);
        }
    };

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

    // Find today's status
    const todayStr = todayLocalYmd();
    const todayRecord = historyData.find(d => d.date === todayStr);
    const currentStatus = todayRecord ? todayRecord.status : 'UNMARKED';

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm font-sans">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Header */}
            <div className="flex items-center justify-center px-5 pt-6 pb-6 relative">
                <h1 className="text-[17px] font-bold text-slate-900 dark:text-white text-center">
                    Attendance
                </h1>
            </div>

            <div className="px-5 pb-8 overflow-y-auto no-scrollbar flex-1">
                {/* Daily Status Card (Hero) */}
                <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-[20px] p-5 relative overflow-hidden shadow-lg shadow-[#6D28D9]/20 text-white mb-6">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wide mb-1">Today's Status</p>
                                <h2 className="text-[24px] font-black tracking-tight leading-none">
                                    {getStatusDisplay(currentStatus)}
                                </h2>
                            </div>
                        </div>

                        {/* Mark Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleMarkAttendance('PRESENT')}
                                disabled={isMarking || currentStatus !== 'UNMARKED'}
                                className={`py-3 rounded-xl font-bold tracking-wide text-[13px] transition-all flex items-center justify-center gap-2
                                    ${isMarking || currentStatus !== 'UNMARKED'
                                        ? 'bg-white/10 !text-white/50 cursor-not-allowed'
                                        : 'bg-emerald-100 !text-emerald-700 hover:bg-emerald-200 shadow-lg active:scale-95'}`}
                            >
                                <CheckCircle2 className="w-4 h-4" /> Present
                            </button>
                            <button
                                onClick={() => handleMarkAttendance('ABSENT')}
                                disabled={isMarking || currentStatus !== 'UNMARKED'}
                                className={`py-3 rounded-xl font-bold tracking-wide text-[13px] transition-all flex items-center justify-center gap-2
                                    ${isMarking || currentStatus !== 'UNMARKED'
                                        ? 'bg-white/10 !text-white/50 cursor-not-allowed'
                                        : 'bg-rose-100 !text-rose-700 hover:bg-rose-200 shadow-lg active:scale-95'}`}
                            >
                                <XCircle className="w-4 h-4" /> Absent
                            </button>
                        </div>
                    </div>
                </div>

                {/* Monthly History Section */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white px-1">Monthly History</h3>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-600 transition-colors">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-[11px] font-bold text-slate-800 dark:text-slate-200 min-w-[90px] text-center">{monthName}</span>
                        <button onClick={nextMonth} disabled={isCurrentMonth} className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-600'}`}>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-black !text-emerald-600 dark:!text-emerald-400 leading-none mb-1">{historyStats.present}</span>
                        <span className="text-[11px] font-bold !text-emerald-600 dark:!text-emerald-500 uppercase tracking-wide">Present</span>
                    </div>
                    <div className="bg-rose-100 dark:bg-rose-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-black !text-rose-600 dark:!text-rose-400 leading-none mb-1">{historyStats.absent}</span>
                        <span className="text-[11px] font-bold !text-rose-600 dark:!text-rose-500 uppercase tracking-wide">Absent</span>
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 p-4 overflow-hidden">
                    {historyLoading ? (
                        <div className="py-8 text-center text-slate-500 text-[13px] font-medium">Loading history...</div>
                    ) : historyData.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-[13px] font-medium">No attendance records found for this month.</div>
                    ) : (
                        <div className="space-y-3">
                            {historyData.map((record, i) => {
                                const d = new Date(record.date);
                                if (d > new Date()) return null;
                                const displayDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
                                
                                return (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0 gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{displayDate}</span>
                                            <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                                                {formatTime(record.checkInAt)} - {formatTime(record.checkOutAt)}
                                            </span>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider ${statusColors[record.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {record.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Padding for Navbar */}
            <div className="h-20 lg:h-0 flex-shrink-0" />
        </div>
    );
}
