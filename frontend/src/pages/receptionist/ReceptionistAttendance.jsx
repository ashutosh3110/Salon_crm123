import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

function todayLocalYmd() {
    return new Date().toLocaleDateString('en-CA');
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

export default function ReceptionistAttendance() {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, unmarked: 0 });

    const fetchHistory = useCallback(async (month, year) => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/hr/attendance/history', { params: { month, year } });
            const data = res.data?.data || res.data;
            setHistoryData(data?.data || []);
            
            // Recalculate stats based on returned data to match requested categories
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

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans animate-reveal">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">View your monthly attendance records.</p>
                    </div>
                    

                </div>

                {/* Attendance Summary Cards */}
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                    {/* Present Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <span className="text-4xl font-black mb-2" style={{ color: '#059669' }}>{historyStats.present}</span>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#059669', opacity: 0.8 }}>Present</span>
                    </div>

                    {/* Absent Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <span className="text-4xl font-black mb-2" style={{ color: '#E11D48' }}>{historyStats.absent}</span>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E11D48', opacity: 0.8 }}>Absent</span>
                    </div>

                    {/* Not Marked Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-[20px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 duration-300">
                        <span className="text-4xl font-black mb-2" style={{ color: '#7C3AED' }}>{historyStats.unmarked}</span>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7C3AED', opacity: 0.8 }}>Not Marked</span>
                    </div>
                </div>

                {/* Monthly History Section */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden">
                    
                    {/* Table Header & Controls */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                            Monthly History
                        </h2>

                        <div className="flex items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                            <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300 shrink-0 shadow-sm">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-6 font-black text-sm flex-1 text-center sm:min-w-[160px] text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                                {monthName}
                            </span>
                            <button 
                                onClick={nextMonth} 
                                disabled={isCurrentMonth}
                                className={`p-2 rounded-lg transition-colors shrink-0 ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-white dark:hover:bg-slate-800 shadow-sm text-slate-600 dark:text-slate-300'}`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-16 text-center">
                                            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                                        </td>
                                    </tr>
                                ) : historyData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-16 text-center text-sm font-medium text-slate-500">
                                            No attendance records found for this month.
                                        </td>
                                    </tr>
                                ) : (
                                    historyData.map((record, i) => {
                                        const d = new Date(record.date);
                                        const isFuture = d > new Date();
                                        if (isFuture) return null;
                                        
                                        const displayDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
                                        const styleClass = getStatusColor(record.status);

                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{displayDate}</span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${styleClass}`}>
                                                        {getStatusDisplay(record.status)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                        {record.notes || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
