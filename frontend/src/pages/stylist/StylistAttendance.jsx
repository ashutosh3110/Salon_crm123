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
                {/* Daily Punch Card (Hero) */}
                <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-[20px] p-5 relative overflow-hidden shadow-lg shadow-[#6D28D9]/20 text-white mb-6">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wide mb-1">Current Status</p>
                                <h2 className="text-[24px] font-black tracking-tight leading-none">
                                    {status === 'ACTIVE_RUN' ? 'Punched In' : status === 'COMPLETED' ? 'Shift Completed' : 'Not Punched In'}
                                </h2>
                            </div>
                            <div className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                                <Clock className={`w-5 h-5 text-white ${status === 'ACTIVE_RUN' ? 'animate-pulse' : ''}`} strokeWidth={2} />
                            </div>
                        </div>

                        {/* Punch Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handlePunch('IN')}
                                disabled={status !== 'OFFLINE' || !canPunch || loadingLocation}
                                className={`flex-1 py-3 rounded-xl font-bold tracking-wide text-[13px] transition-all flex items-center justify-center gap-2
                                    ${status !== 'OFFLINE' || !canPunch || loadingLocation
                                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                        : 'bg-white text-[#6D28D9] hover:bg-white/90 shadow-lg active:scale-95'}`}
                            >
                                <Zap className="w-4 h-4" /> Punch In
                            </button>
                            <button
                                onClick={() => handlePunch('OUT')}
                                disabled={status !== 'ACTIVE_RUN' || !canPunch || loadingLocation}
                                className={`flex-1 py-3 rounded-xl font-bold tracking-wide text-[13px] transition-all flex items-center justify-center gap-2
                                    ${status !== 'ACTIVE_RUN' || !canPunch || loadingLocation
                                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                        : 'bg-white text-[#6D28D9] hover:bg-white/90 shadow-lg active:scale-95'}`}
                            >
                                <CheckCircle2 className="w-4 h-4" /> Punch Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Location / Geofence Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 p-4 mb-6">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="text-[14px] font-bold text-slate-900 dark:text-white">Location Status</h3>
                        {loadingLocation ? (
                            <span className="text-[11px] font-bold text-[#7C3AED] animate-pulse">Detecting...</span>
                        ) : location ? (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${worksite?.geofenceEnforced ? (withinGeofence ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700') : 'bg-[#7C3AED]/10 text-[#7C3AED]'}`}>
                                {worksite?.geofenceEnforced ? (withinGeofence ? 'Verified' : 'Outside Geofence') : 'Available'}
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Not Available</span>
                        )}
                    </div>
                    
                    {location && (
                        <div className="px-1 space-y-2 mb-3">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
                                <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-tight">
                                    {isResolvingName ? 'Resolving Address...' : (locationName || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 pl-6 text-[10px] font-bold text-slate-400 uppercase">
                                <span>Acc: ±{accuracy}m</span>
                                {worksite?.geofenceEnforced && worksite.configured && distanceMeters != null && !Number.isNaN(distanceMeters) && (
                                    <span>Dist: ~{Math.round(distanceMeters)}m / {radiusMeters}m</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="text-[12px] font-medium text-rose-600 bg-rose-50 p-2.5 rounded-lg mb-3">{error}</p>}
                    {geofenceBlockedReason && <p className="text-[12px] font-medium text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-500/20 mb-3">{geofenceBlockedReason}</p>}
                    {actionMsg && <p className="text-[12px] font-medium text-emerald-700 bg-emerald-50 p-2.5 rounded-lg mb-3">{actionMsg}</p>}

                    <button
                        type="button"
                        onClick={fetchLocation}
                        className="flex items-center justify-center w-full py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 gap-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingLocation ? 'animate-spin' : ''}`} /> Refresh Location
                    </button>
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
                    <div className="bg-[#DCFCE7] dark:bg-emerald-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-black text-[#059669] dark:text-emerald-400 leading-none mb-1">{historyStats.present}</span>
                        <span className="text-[11px] font-bold text-[#059669] dark:text-emerald-500 uppercase tracking-wide">Present</span>
                    </div>
                    <div className="bg-[#FFE4E6] dark:bg-rose-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[24px] font-black text-[#E11D48] dark:text-rose-400 leading-none mb-1">{historyStats.absent}</span>
                        <span className="text-[11px] font-bold text-[#E11D48] dark:text-rose-500 uppercase tracking-wide">Absent</span>
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
