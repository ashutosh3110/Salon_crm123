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
    
    // Punch Logic States
    const [status, setStatus] = useState('OFFLINE');
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
            if (todayRec && todayRec.checkInAt && !todayRec.checkOutAt) {
                setStatus('ACTIVE_RUN');
            } else if (todayRec && todayRec.checkOutAt) {
                setStatus('COMPLETED');
            } else {
                setStatus('OFFLINE');
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

    const handlePunch = async (type) => {
        if (!location) {
            setError('Location required to punch in.');
            return;
        }
        setError(null);
        setActionMsg(null);
        try {
            await api.post('/hr/attendance/punch', {
                type: type === 'IN' ? 'in' : 'out',
                date: todayLocalYmd(),
                location: locationName || 'Reception Desk',
            });
            setActionMsg(type === 'IN' ? 'Successfully punched in for the day!' : 'Successfully punched out.');
            fetchHistory(currentMonth, currentYear);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to record punch.');
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
        <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance & Timesheet</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your daily presence and track historical records</p>
                </div>
            </div>

            {/* Daily Punch Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Activity className="w-64 h-64 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700`}>
                                {status === 'ACTIVE_RUN' ? <Clock className="w-5 h-5 text-blue-500 animate-pulse" /> : <Clock className="w-5 h-5 text-slate-500" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Status</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {status === 'ACTIVE_RUN' ? 'Punched In (Active)' : status === 'COMPLETED' ? 'Shift Completed' : 'Not Punched In'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location Status</span>
                                {loadingLocation ? (
                                    <span className="text-xs text-blue-500 animate-pulse">Detecting...</span>
                                ) : location ? (
                                    <span className="text-xs font-bold text-emerald-600">Verified</span>
                                ) : (
                                    <span className="text-xs font-bold text-rose-500">Not Available</span>
                                )}
                            </div>
                            {location && (
                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span>{locationName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</span>
                                </div>
                            )}
                        </div>

                        {error && <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg">{error}</p>}
                        {actionMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg">{actionMsg}</p>}
                    </div>

                    <div className="flex flex-col justify-center gap-4 min-w-[240px]">
                        <button
                            onClick={() => handlePunch('IN')}
                            disabled={status !== 'OFFLINE' || !location || loadingLocation}
                            className={`py-4 rounded-xl font-bold tracking-wide uppercase text-sm transition-all shadow-lg flex items-center justify-center gap-2
                                ${status !== 'OFFLINE' || !location
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-none cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'}`}
                        >
                            <Zap className="w-5 h-5" /> Punch In
                        </button>
                        <button
                            onClick={() => handlePunch('OUT')}
                            disabled={status !== 'ACTIVE_RUN' || !location || loadingLocation}
                            className={`py-4 rounded-xl font-bold tracking-wide uppercase text-sm transition-all shadow-lg flex items-center justify-center gap-2
                                ${status !== 'ACTIVE_RUN' || !location
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 shadow-none cursor-not-allowed'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 active:scale-95'}`}
                        >
                            <CheckCircle2 className="w-5 h-5" /> Punch Out
                        </button>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        Monthly History
                    </h2>

                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-300">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 font-bold text-sm min-w-[140px] text-center text-slate-800 dark:text-slate-100">{monthName}</span>
                        <button 
                            onClick={nextMonth} 
                            disabled={isCurrentMonth}
                            className={`p-2 rounded-lg transition-colors ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Present', val: historyStats.present, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
                        { label: 'Absent', val: historyStats.absent, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${stat.bg} flex flex-col items-center justify-center text-center`}>
                            <span className="text-2xl font-black mb-1">{stat.val}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.color}`}>{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punch In</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punch Out</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-sm text-slate-500">Loading history...</td>
                                    </tr>
                                ) : historyData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-sm text-slate-500">No attendance records found for this month.</td>
                                    </tr>
                                ) : (
                                    historyData.map((record, i) => {
                                        const d = new Date(record.date);
                                        const isFuture = d > new Date();
                                        if (isFuture) return null;
                                        
                                        const displayDate = d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
                                        const styleClass = statusColors[record.status] || 'bg-slate-50 text-slate-600';

                                        return (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{displayDate}</span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${styleClass}`}>
                                                        {record.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        {formatTime(record.checkInAt)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        {formatTime(record.checkOutAt)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 italic">
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
