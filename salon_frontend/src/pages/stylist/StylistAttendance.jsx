import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Clock, MapPin, CheckCircle2, AlertTriangle, Shield,
    Activity, Zap, Navigation, RefreshCw, Smartphone, Building2,
} from 'lucide-react';

import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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

function formatDisplayDate() {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

export default function StylistAttendance() {
    const { user } = useAuth();
    const [accuracy, setAccuracy] = useState(0);
    const [status, setStatus] = useState('OFFLINE');
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [todayRecord, setTodayRecord] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [actionMsg, setActionMsg] = useState(null);
    const [worksite, setWorksite] = useState(null);
    const [worksiteLoading, setWorksiteLoading] = useState(true);
    const [locationName, setLocationName] = useState('');
    const [isResolvingName, setIsResolvingName] = useState(false);
    const [historicNames, setHistoricNames] = useState({}); // Cache for log locations

    const refreshWorksite = useCallback(async () => {
        setWorksiteLoading(true);
        try {
            const res = await api.get('/attendance/worksite');
            const data = res.data?.data ?? res.data;
            setWorksite(data || null);
        } catch {
            setWorksite(null);
        } finally {
            setWorksiteLoading(false);
        }
    }, []);

    const refreshToday = useCallback(async () => {
        const date = todayLocalYmd();
        setFetching(true);
        try {
            const res = await api.get('/attendance/me', { params: { date } });
            const data = res.data?.data ?? res.data;
            setTodayRecord(data || null);
            if (data?.checkInAt && !data?.checkOutAt) setStatus('ACTIVE_RUN');
            else setStatus('OFFLINE');
        } catch {
            setTodayRecord(null);
            setStatus('OFFLINE');
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        refreshToday();
        refreshWorksite();
    }, [refreshToday, refreshWorksite]);

    const radiusMeters = worksite?.outlet?.geofenceRadiusMeters ?? 200;

    const distanceMeters = useMemo(() => {
        if (!location || !worksite?.outlet) return null;
        const olat = worksite.outlet.latitude;
        const olng = worksite.outlet.longitude;
        if (olat == null || olng == null) return null;
        return haversineMeters(location.latitude, location.longitude, olat, olng);
    }, [location, worksite]);

    const withinGeofence =
        worksite?.geofenceEnforced &&
        worksite?.configured &&
        location &&
        distanceMeters != null &&
        !Number.isNaN(distanceMeters) &&
        distanceMeters <= radiusMeters;

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

    const canPunch =
        !worksiteLoading &&
        !fetching &&
        !loading &&
        location &&
        (!worksite?.geofenceEnforced || withinGeofence);

    const logs = useMemo(() => {
        const list = [];
        const dateStr = formatDisplayDate();
        if (todayRecord?.checkInAt) {
            list.push({
                id: 'in',
                type: 'IN',
                time: formatTime(todayRecord.checkInAt),
                date: dateStr,
                loc: todayRecord.location || (location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '—'),
                status: 'VERIFIED',
            });
        }
        if (todayRecord?.checkOutAt) {
            list.push({
                id: 'out',
                type: 'OUT',
                time: formatTime(todayRecord.checkOutAt),
                date: dateStr,
                loc: todayRecord.location || (location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '—'),
                status: 'VERIFIED',
            });
        }
        return list;
    }, [todayRecord, location]);

    const filteredLogs = logs.filter((log) => {
        if (statusFilter === 'ALL') return true;
        return log.type === statusFilter;
    });

    const fetchLocationName = async (lat, lon) => {
        if (!lat || !lon) return;
        setIsResolvingName(true);
        try {
            // Priority 1: Check if already within geofence of an outlet
            if (withinGeofence && worksite?.outlet?.name) {
                setLocationName(worksite.outlet.name);
                setIsResolvingName(false);
                return;
            }

            // Priority 2: Reverse Geocode via Google Maps (More accurate)
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30";
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`);
            const data = await res.json();
            
            if (data.status === 'OK' && data.results.length > 0) {
                // Focus on more granular address: e.g. locality + area
                const result = data.results[0];
                const area = result.address_components.find(c => c.types.includes('sublocality'))?.long_name;
                const city = result.address_components.find(c => c.types.includes('locality'))?.long_name;
                const formatted = area && city ? `${area}, ${city}` : result.formatted_address;
                
                // Cleanup: take first 3 segments if too long
                const parts = formatted.split(',');
                const simplified = parts.slice(0, 3).join(',').trim();
                setLocationName(simplified);
            } else {
                setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            }
        } catch (err) {
            console.error('Failed to resolve location name:', err);
            setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        } finally {
            setIsResolvingName(false);
        }
    };

    const fetchLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser protocol.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setAccuracy(position.coords.accuracy.toFixed(1));
                setLoading(false);
                fetchLocationName(latitude, longitude);
            },
            (err) => {
                setError(`Failed to fetch location: ${err.message}`);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    const handleAttendance = async (type) => {
        if (!location) {
            setError('Turn on location to punch.');
            return;
        }
        if (worksite?.geofenceEnforced && !withinGeofence) {
            setError(geofenceBlockedReason || 'You must be at your assigned outlet to punch.');
            return;
        }

        setActionMsg(null);
        setError(null);
        try {
            // Use the resolved locationName if available, otherwise fallback to coordinates
            const locStr = locationName || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            
            await api.post('/attendance/punch', {
                type: type === 'IN' ? 'in' : 'out',
                date: todayLocalYmd(),
                location: locStr,
                latitude: location.latitude,
                longitude: location.longitude,
            });
            await refreshToday();
            setActionMsg(type === 'IN' ? 'Checked in successfully' : 'Checked out successfully');
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Punch failed');
        }
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    return (
        <div className="space-y-6 font-black text-left">
            {/* Assigned outlet + geofence protocol */}
            <div className="bg-surface border border-border p-5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-text-muted">
                    <Building2 className="w-4 h-4 text-primary" />
                    Attendance protocol · outlet geofence
                </div>
                {worksiteLoading ? (
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Loading worksite…</p>
                ) : worksite?.geofenceEnforced ? (
                    <div className="space-y-2">
                        {worksite.outlet ? (
                            <>
                                <p className="text-sm font-black text-text">
                                    {worksite.outlet.name}
                                    {worksite.outlet.city ? ` · ${worksite.outlet.city}` : ''}
                                </p>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide leading-relaxed">
                                    {worksite.outlet.address}
                                </p>
                                {worksite.configured ? (
                                    <p className="text-[10px] text-emerald-600 uppercase tracking-widest">
                                        Allowed radius: {radiusMeters}m from outlet coordinates
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-amber-600 uppercase tracking-widest leading-relaxed">
                                        {worksite.message}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-[10px] text-amber-600 uppercase tracking-widest leading-relaxed">
                                {worksite.message}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-[10px] text-text-muted uppercase">Geofence not enforced for this account type.</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-background border border-border p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status === 'ACTIVE_RUN' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Current Status: {status === 'ACTIVE_RUN' ? 'ON DUTY' : 'OFF DUTY'}</span>
                            </div>
                            <Shield className="w-4 h-4 text-primary opacity-40" />
                        </div>

                        <p className="text-[9px] text-text-muted uppercase mb-2">
                            {user?.name ? `${user.name} · ` : ''}{todayLocalYmd()}
                        </p>
                        {actionMsg && (
                            <p className="text-[10px] text-emerald-600 uppercase mb-4">{actionMsg}</p>
                        )}
                        {error && (
                            <p className="text-[10px] text-rose-600 uppercase mb-4 leading-relaxed">{error}</p>
                        )}
                        {geofenceBlockedReason && (
                            <p className="text-[10px] text-amber-700 uppercase mb-4 leading-relaxed border border-amber-500/30 bg-amber-500/5 p-3">
                                {geofenceBlockedReason}
                            </p>
                        )}

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Your GPS position</p>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-primary">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="text-xs uppercase tracking-widest">Scanning…</span>
                                        </div>
                                    ) : location ? (
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-text tracking-tighter uppercase flex items-center gap-2">
                                                <Navigation className="w-5 h-5 text-primary" />
                                                {isResolvingName ? 'Resolving Address...' : (locationName || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)}
                                            </p>
                                            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mb-1">
                                                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                            </p>
                                            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest italic">Accuracy ±{accuracy}m</p>
                                            {worksite?.geofenceEnforced && worksite.configured && distanceMeters != null && !Number.isNaN(distanceMeters) && (
                                                <p className={`text-[10px] uppercase tracking-widest mt-2 ${withinGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    Distance from outlet: ~{Math.round(distanceMeters)}m / limit {radiusMeters}m
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-rose-500 text-[10px] font-black uppercase">{error || 'Location required'}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchLocation}
                                    className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Refresh location
                                </button>
                            </div>

                            <div className="flex flex-col justify-end gap-3">
                                <p className="text-[9px] text-text-muted uppercase tracking-widest mb-1">
                                    Punch is only enabled when you are inside the outlet radius (verified on server).
                                </p>
                                <button
                                    type="button"
                                    disabled={status === 'ACTIVE_RUN' || !canPunch}
                                    onClick={() => handleAttendance('IN')}
                                    className={`w-full py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                        ${status === 'ACTIVE_RUN' || !canPunch
                                            ? 'opacity-40 cursor-not-allowed bg-surface-alt border-border'
                                            : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'}`}
                                >
                                    <Zap className="w-4 h-4" /> Punch in
                                </button>
                                <button
                                    type="button"
                                    disabled={status === 'OFFLINE' || !canPunch}
                                    onClick={() => handleAttendance('OUT')}
                                    className={`w-full py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                        ${status === 'OFFLINE' || !canPunch
                                            ? 'opacity-40 cursor-not-allowed bg-surface-alt border-border'
                                            : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02]'}`}
                                >
                                    <Smartphone className="w-4 h-4" /> Punch out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Today&apos;s punches</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 p-1 bg-background border border-border">
                            {['ALL', 'IN', 'OUT'].map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-tighter transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                >
                                    {f === 'ALL' ? 'ALL' : f === 'IN' ? 'PUNCH INS' : 'PUNCH OUTS'}
                                </button>
                            ))}
                        </div>
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest border-l border-border/20 pl-4">Total: {filteredLogs.length}</span>
                    </div>
                </div>

                <div className="divide-y divide-border/10">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-background/50 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-1 h-8 ${log.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`} />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-black text-text tracking-tighter">{log.time}</p>
                                        <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest ${log.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                            {log.type === 'IN' ? 'PUNCHED IN' : 'PUNCHED OUT'}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest italic">{log.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-left md:text-right">
                                    <div className="flex items-center gap-2 mb-1 justify-start md:justify-end">
                                        <MapPin className="w-3 h-3 text-primary" />
                                        <span className="text-[9px] font-black text-text uppercase tracking-widest">{log.loc}</span>
                                    </div>
                                    <p className="text-[7px] text-text-muted uppercase font-bold tracking-[0.2em] italic">Synced with server</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-none">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{log.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {logs.length === 0 && !fetching && (
                    <div className="p-20 text-center space-y-4">
                        <AlertTriangle className="w-10 h-10 text-text-muted mx-auto opacity-20" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No punches today yet.</p>
                    </div>
                )}
                {fetching && (
                    <div className="p-12 text-center text-[10px] text-text-muted uppercase">Loading…</div>
                )}
            </div>
        </div>
    );
}
