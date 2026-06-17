import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
    Clock, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertTriangle, 
    Zap, Navigation, Activity, ChevronLeft, ChevronRight, MapPin, Search,
    Shield, RefreshCw, Smartphone, Building2
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
    PRESENT: 'bg-emerald-100 !text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:!text-emerald-300 dark:border-emerald-800',
    ABSENT: 'bg-rose-100 !text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:!text-rose-300 dark:border-rose-800',
    LATE: 'bg-amber-100 !text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:!text-amber-300 dark:border-amber-800',
    HALF_DAY: 'bg-blue-100 !text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:!text-blue-300 dark:border-blue-800',
    WEEKOFF: 'bg-indigo-100 !text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:!text-indigo-300 dark:border-indigo-800',
    UNMARKED: 'bg-violet-100 !text-violet-800 border-violet-300 dark:bg-violet-950/40 dark:!text-violet-300 dark:border-violet-800',
};

export default function StylistAttendance() {
    const { user } = useAuth();
    
    // Punch Logic States
    const [status, setStatus] = useState('OFFLINE');
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [location, setLocation] = useState(null);
    const [accuracy, setAccuracy] = useState(0);
    const [locationName, setLocationName] = useState('');
    const [isResolvingName, setIsResolvingName] = useState(false);
    const [error, setError] = useState(null);
    const [actionMsg, setActionMsg] = useState(null);
    
    // Worksite geofence states
    const [worksite, setWorksite] = useState(null);
    const [worksiteLoading, setWorksiteLoading] = useState(true);

    // History states
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });

    const fetchLocationName = async (lat, lon, isWithin) => {
        if (!lat || !lon) return;
        setIsResolvingName(true);
        setTimeout(() => {
            if (isWithin && worksite?.outlet?.name) {
                setLocationName(worksite.outlet.name);
            } else {
                setLocationName("Mock Office Complex, Sector 12, Delhi");
            }
            setIsResolvingName(false);
        }, 800);
    };

    // Geofence calculations
    const radiusMeters = worksite?.outlet?.geofenceRadiusMeters ?? 200;

    const distanceMeters = useMemo(() => {
        if (!location || !worksite?.outlet) return null;
        const olat = worksite.outlet.latitude;
        const olng = worksite.outlet.longitude;
        if (olat == null || olng == null) return null;
        return haversineMeters(location.latitude, location.longitude, olat, olng);
    }, [location, worksite]);

    const withinGeofence = useMemo(() => {
        return (
            worksite?.geofenceEnforced &&
            worksite?.configured &&
            location &&
            distanceMeters != null &&
            !Number.isNaN(distanceMeters) &&
            distanceMeters <= radiusMeters
        );
    }, [worksite, location, distanceMeters, radiusMeters]);

    const geofenceBlockedReason = useMemo(() => {
        if (!worksite?.geofenceEnforced) return null;
        if (worksiteLoading) return null;
        if (!worksite.outlet) return worksite.message || 'No outlet assigned.';
        if (!worksite.configured) return worksite.message || 'Outlet location not set.';
        if (!location) return null;
        if (distanceMeters == null || Number.isNaN(distanceMeters)) return null;
        if (distanceMeters > radiusMeters) {
            return `You are ~${Math.round(distanceMeters)}m from "${worksite.outlet.name}". Must be within ${radiusMeters}m to punch.`;
        }
        return null;
    }, [worksite, worksiteLoading, location, distanceMeters, radiusMeters]);

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
                setAccuracy(position.coords.accuracy.toFixed(1));
                
                // Determine if within geofence radius
                let isWithin = false;
                if (worksite?.outlet) {
                    const olat = worksite.outlet.latitude;
                    const olng = worksite.outlet.longitude;
                    if (olat != null && olng != null) {
                        const dist = haversineMeters(latitude, longitude, olat, olng);
                        isWithin = dist <= radiusMeters;
                    }
                }

                fetchLocationName(latitude, longitude, isWithin);
                setLoadingLocation(false);
            },
            (err) => {
                setError(`Failed to fetch location: ${err.message}`);
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    }, [worksite, radiusMeters]);

    const refreshWorksite = useCallback(async () => {
        setWorksiteLoading(true);
        try {
            const res = await api.get('/hr/attendance/worksite');
            const data = res.data?.data ?? res.data;
            setWorksite(data || null);
        } catch {
            setWorksite(null);
        } finally {
            setWorksiteLoading(false);
        }
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
        refreshWorksite();
    }, [refreshWorksite]);

    useEffect(() => {
        if (!worksiteLoading) {
            fetchLocation();
        }
    }, [worksiteLoading, fetchLocation]);

    useEffect(() => {
        fetchHistory(currentMonth, currentYear);
    }, [currentMonth, currentYear, fetchHistory]);

    const handlePunch = async (type) => {
        if (!location) {
            setError('Location required to punch in.');
            return;
        }
        if (worksite?.geofenceEnforced && !withinGeofence) {
            setError(geofenceBlockedReason || 'You must be at your assigned outlet to punch.');
            return;
        }
        setError(null);
        setActionMsg(null);
        try {
            const locStr = locationName || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            await api.post('/hr/attendance/punch', {
                type: type === 'IN' ? 'in' : 'out',
                date: todayLocalYmd(),
                location: locStr,
                latitude: location.latitude,
                longitude: location.longitude,
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

    const canPunch = !worksiteLoading && location && (!worksite?.geofenceEnforced || withinGeofence);

    return (
        <div className="p-3 md:p-4 lg:p-5 space-y-4 max-w-6xl mx-auto font-sans">
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

            {/* Geofence Info Card */}
            {!worksiteLoading && worksite && (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            <Building2 className="w-4 h-4" stroke="#C89B2B" color="#C89B2B" />
                            Assigned Outlet
                        </div>
                        {worksite.outlet ? (
                            <>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {worksite.outlet.name} {worksite.outlet.city ? `· ${worksite.outlet.city}` : ''}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {worksite.outlet.address}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {worksite.message || "No outlet assigned."}
                            </p>
                        )}
                    </div>
                    {worksite.geofenceEnforced && (
                        <div className="bg-[#C89B2B]/10 text-[#a47a18] dark:text-[#e4be5b] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#C89B2B]/30 uppercase tracking-widest">
                            Geofence Enabled ({radiusMeters}m radius)
                        </div>
                    )}
                </div>
            )}

            {/* Daily Punch Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 md:p-5 shadow-sm relative overflow-hidden group">
                
                <div className="relative z-10 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#C89B2B]/10 dark:bg-[#C89B2B]/20">
                                <Clock className={`w-5 h-5 ${status === 'ACTIVE_RUN' ? 'animate-pulse' : ''}`} stroke="#C89B2B" color="#C89B2B" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Status</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {status === 'ACTIVE_RUN' ? 'Punched In (Active)' : status === 'COMPLETED' ? 'Shift Completed' : 'Not Punched In'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location Status</span>
                                {loadingLocation ? (
                                    <span className="text-xs text-[#C89B2B] animate-pulse">Detecting...</span>
                                ) : location ? (
                                    <span className={`text-xs font-bold ${worksite?.geofenceEnforced ? (withinGeofence ? 'text-[#C89B2B]' : 'text-rose-500') : 'text-[#C89B2B]'}`}>
                                        {worksite?.geofenceEnforced ? (withinGeofence ? 'Verified' : 'Outside Geofence') : 'Available'}
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-rose-500">Not Available</span>
                                )}
                            </div>
                            
                            {location && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                                        <MapPin className="w-4 h-4" stroke="#C89B2B" color="#C89B2B" />
                                        <span>{isResolvingName ? 'Resolving Address...' : (locationName || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest pl-6">
                                        <span>Accuracy: ±{accuracy}m</span>
                                        {worksite?.geofenceEnforced && worksite.configured && distanceMeters != null && !Number.isNaN(distanceMeters) && (
                                            <span>Distance: ~{Math.round(distanceMeters)}m / limit {radiusMeters}m</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={fetchLocation}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#C89B2B] hover:text-[#b48a25] uppercase tracking-widest pl-6 pt-1 transition-colors"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loadingLocation ? 'animate-spin' : ''}`} stroke="#C89B2B" color="#C89B2B" /> Refresh location
                            </button>
                        </div>

                        {error && <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg">{error}</p>}
                        {geofenceBlockedReason && <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">{geofenceBlockedReason}</p>}
                        {actionMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg">{actionMsg}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-col justify-center gap-3 sm:gap-4 w-full sm:w-auto sm:min-w-[240px]">
                        <button
                            onClick={() => handlePunch('IN')}
                            disabled={status !== 'OFFLINE' || !canPunch || loadingLocation}
                            className={`py-2.5 rounded-lg font-bold tracking-wide uppercase text-xs transition-all flex items-center justify-center gap-1 sm:gap-2
                                ${status !== 'OFFLINE'
                                    ? 'bg-[#C89B2B]/10 text-[#C89B2B]/40 border border-[#C89B2B]/20 cursor-not-allowed shadow-none'
                                    : 'bg-[#C89B2B] hover:bg-[#b48a25] text-white shadow-[#C89B2B]/20 shadow-lg active:scale-95'}`}
                        >
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: status !== 'OFFLINE' ? 'rgba(200, 155, 43, 0.4)' : '#ffffff', stroke: status !== 'OFFLINE' ? 'rgba(200, 155, 43, 0.4)' : '#ffffff' }} /> <span className="whitespace-nowrap">Punch In</span>
                        </button>
                        <button
                            onClick={() => handlePunch('OUT')}
                            disabled={status !== 'ACTIVE_RUN' || !canPunch || loadingLocation}
                            className={`py-2.5 rounded-lg font-bold tracking-wide uppercase text-xs transition-all flex items-center justify-center gap-1 sm:gap-2
                                ${status !== 'ACTIVE_RUN'
                                    ? 'bg-[#C89B2B]/10 text-[#C89B2B]/40 border border-[#C89B2B]/20 cursor-not-allowed shadow-none'
                                    : 'bg-[#C89B2B] hover:bg-[#b48a25] text-white shadow-[#C89B2B]/20 shadow-lg active:scale-95'}`}
                        >
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: status !== 'ACTIVE_RUN' ? 'rgba(200, 155, 43, 0.4)' : '#ffffff', stroke: status !== 'ACTIVE_RUN' ? 'rgba(200, 155, 43, 0.4)' : '#ffffff' }} /> <span className="whitespace-nowrap">Punch Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" stroke="#C89B2B" color="#C89B2B" />
                        Monthly History
                    </h2>

                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700/70 rounded-lg transition-colors text-slate-600 dark:text-slate-200">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 font-bold text-sm min-w-[140px] text-center text-slate-800 dark:text-slate-100">{monthName}</span>
                        <button 
                            onClick={nextMonth} 
                            disabled={isCurrentMonth}
                            className={`p-2 rounded-lg transition-colors ${isCurrentMonth ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-600 dark:text-slate-200'}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Present', val: historyStats.present, hex: '#059669', darkHex: '#34d399', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
                        { label: 'Absent', val: historyStats.absent, hex: '#e11d48', darkHex: '#fb7185', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' },
                    ].map((stat, i) => (
                        <div key={i} className={`p-2 rounded-lg border ${stat.bg} flex flex-col items-center justify-center text-center`}>
                            <span className="text-xl font-black mb-0.5 text-slate-800 dark:text-slate-100">{stat.val}</span>
                            <span 
                                className="text-[10px] font-black uppercase tracking-wider" 
                                style={{ color: stat.hex }}
                            >
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* History List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punch In</th>
                                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Punch Out</th>
                                    <th className="py-2.5 px-4 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
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
                                        const styleClass = statusColors[record.status] || 'bg-slate-50 !text-slate-600';

                                        return (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-2 px-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{displayDate}</span>
                                                </td>
                                                <td className="py-2 px-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${styleClass}`}>
                                                        {record.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {formatTime(record.checkInAt)}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 whitespace-nowrap">
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {formatTime(record.checkOutAt)}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 whitespace-nowrap">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">
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
