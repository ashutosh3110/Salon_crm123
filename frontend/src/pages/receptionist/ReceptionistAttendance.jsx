import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
    Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertTriangle, 
    Zap, Navigation, Activity, ChevronLeft, ChevronRight, MapPin, Search 
} from 'lucide-react';
import { haversineMeters } from '../../utils/geo';

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
    PRESENT: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    ABSENT: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    LATE: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    HALF_DAY: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    WEEKOFF: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
};

export default function ReceptionistAttendance() {
    const { user } = useAuth();
    
    // Attendance Logic States
    const [status, setStatus] = useState('UNMARKED');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);
    
    // History states
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });

    const fetchLocation = useCallback(() => {
        setLoadingLocation(true);
        setError(null);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoadingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setTimeout(() => {
                    setLocationName("Salon Premises");
                    setLoadingLocation(false);
                }, 600);
            },
            (err) => {
                setError(`Failed to fetch location: ${err.message}`);
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    }, []);

    const fetchHistory = useCallback(async (month, year) => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/hr/attendance/history', { params: { month, year } });
            const data = res.data?.data || res.data;
            setHistoryData(data?.data || []);
            setHistoryStats(data?.stats || { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });
            
            // Check if today is marked
            const todayStr = todayLocalYmd();
            const todayRec = (data?.data || []).find(d => d.date === todayStr);
            if (todayRec) {
                setStatus(todayRec.status);
            } else {
                setStatus('UNMARKED');
            }

        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocation();
        fetchHistory(currentMonth, currentYear);
    }, [currentMonth, currentYear, fetchLocation, fetchHistory]);

    const handlePunch = async (statusVal) => {
        if (statusVal === 'PRESENT' && !location) {
            setError('Location required to mark Present.');
            return;
        }
        setError(null);
        setActionMsg(null);
        try {
            await api.post('/hr/attendance/punch', {
                status: statusVal.toLowerCase(),
                date: todayLocalYmd(),
                location: statusVal === 'PRESENT' ? (locationName || 'Reception Desk') : undefined,
            });
            setActionMsg(statusVal === 'PRESENT' ? 'Successfully marked Present!' : 'Successfully marked Absent.');
            fetchHistory(currentMonth, currentYear);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update attendance status.');
        }
    };

    const nextMonth = () => {
        let m = currentMonth + 1;
        let y = currentYear;
        if (m > 11) { m = 0; y++; }
        if (new Date(y, m, 1) > new Date()) return; // Prevent future months
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
        <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto text-left font-sans">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                html:not(.dark) .attendance-stat-label-present {
                    color: #047857 !important;
                }
                html:not(.dark) .attendance-stat-label-absent {
                    color: #b91c1c !important;
                }
                html:not(.dark) .attendance-stat-label-late {
                    color: #d97706 !important;
                }
                html:not(.dark) .attendance-stat-label-halfday {
                    color: #2563eb !important;
                }
                html:not(.dark) .attendance-stat-label-weekoff {
                    color: #475569 !important;
                }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                <div className="text-left">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Attendance & Timesheet</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Manage your daily presence and track historical records</p>
                </div>
            </div>             {/* Daily Attendance Card */}
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 opacity-[0.05] dark:opacity-8 transition-opacity pointer-events-none">
                     <Activity className="w-48 h-48 text-emerald-500" />
                 </div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row gap-5 justify-between items-center">
                     <div className="space-y-4 flex-1 w-full text-left">
                          <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                                  status === 'PRESENT'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30' 
                                      : status === 'ABSENT'
                                      ? 'bg-rose-50 dark:bg-rose-950/30'
                                      : 'bg-slate-50 dark:bg-slate-800/40'
                              }`}>
                                  {status === 'PRESENT' ? (
                                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-450" style={{ color: '#059669' }} />
                                  ) : status === 'ABSENT' ? (
                                      <XCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-450" style={{ color: '#dc2626' }} />
                                  ) : (
                                      <Clock className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
                                  )}
                              </div>
                              <div className="text-left">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                                  <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                                      {status === 'PRESENT' ? 'Present' : status === 'ABSENT' ? 'Absent' : '—'}
                                  </p>
                              </div>
                          </div>

                         <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5 text-left">
                             <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location Status</span>
                                 {loadingLocation ? (
                                     <span className="text-[10px] font-bold text-blue-500 animate-pulse">Detecting...</span>
                                 ) : location ? (
                                     <span className="text-[10px] font-bold text-emerald-600">Verified</span>
                                 ) : (
                                     <span className="text-[10px] font-bold text-rose-500">Not Available</span>
                                 )}
                             </div>
                             {location && (
                                 <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                     <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" style={{ color: '#3b82f6' }} />
                                     <span className="font-semibold">{locationName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</span>
                                 </div>
                             )}
                         </div>

                         {error && <p className="text-xs text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl font-medium">{error}</p>}
                         {actionMsg && <p className="text-xs text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-500/10 p-2.5 rounded-xl font-medium">{actionMsg}</p>}
                     </div>

                     <div className="flex flex-row md:flex-col justify-center gap-3 w-full md:w-auto min-w-[200px]">
                         <button
                             onClick={() => handlePunch('PRESENT')}
                             disabled={status === 'PRESENT' || !location || loadingLocation}
                             className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold tracking-wide uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                                 ${status === 'PRESENT' || !location
                                     ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-none cursor-not-allowed'
                                     : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-95'}`}
                         >
                             <CheckCircle2 className="w-4 h-4 icon-white-outline-force" /> Present
                         </button>
                         <button
                             onClick={() => handlePunch('ABSENT')}
                             disabled={status === 'ABSENT' || loadingLocation}
                             className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold tracking-wide uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer
                                 ${status === 'ABSENT'
                                     ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-none cursor-not-allowed'
                                     : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:scale-95'}`}
                         >
                             <XCircle className="w-4 h-4 icon-white-outline-force" /> Absent
                         </button>
                     </div>
                 </div>
             </div>

             {/* History Section */}
             <div className="space-y-3">
                 <div className="flex flex-row items-center justify-between gap-4 text-left">
                     <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <CalendarIcon className="w-4.5 h-4.5 text-violet-500" style={{ color: '#8b5cf6' }} />
                         Monthly History
                     </h2>

                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-0.5 shadow-sm border border-slate-200 dark:border-slate-850">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400 cursor-pointer">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 font-bold text-xs min-w-[120px] text-center text-slate-700 dark:text-slate-200">{monthName}</span>
                        <button 
                            onClick={nextMonth} 
                            disabled={isCurrentMonth}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Present', val: historyStats.present, color: 'text-emerald-650 dark:text-emerald-455', bg: 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20', labelClass: 'attendance-stat-label-present' },
                        { label: 'Absent', val: historyStats.absent, color: 'text-rose-650 dark:text-rose-455', bg: 'bg-rose-50/50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20', labelClass: 'attendance-stat-label-absent' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-2.5 rounded-xl border ${stat.bg} flex flex-col items-center justify-center text-center`}>
                            <span className="text-xl font-black text-slate-800 dark:text-white mb-0.5">{stat.val}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${stat.color} ${stat.labelClass}`}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</th>
                                    <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-xs text-slate-500">Loading history...</td>
                                    </tr>
                                ) : (() => {
                                    const filteredRecords = historyData.filter(record => record.status === 'PRESENT' || record.status === 'ABSENT');
                                    if (filteredRecords.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-xs text-slate-500">No attendance records found for this month.</td>
                                            </tr>
                                        );
                                    }
                                    return filteredRecords.map((record, i) => {
                                        const d = new Date(record.date);
                                        const isFuture = d > new Date();
                                        if (isFuture) return null;
                                        
                                        const displayDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
                                        const styleClass = statusColors[record.status] || 'bg-slate-50 text-slate-600';

                                        return (
                                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2.5 px-4 whitespace-nowrap">
                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{displayDate}</span>
                                                </td>
                                                <td className="py-2.5 px-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg border ${styleClass}`}>
                                                        {record.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {record.checkInAt ? (
                                                            `${formatTime(record.checkInAt)}${record.checkOutAt ? ` - ${formatTime(record.checkOutAt)}` : ''}`
                                                        ) : '—'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 whitespace-nowrap">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                                                        {record.notes || '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
