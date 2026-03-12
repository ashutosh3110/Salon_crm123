import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, MapPin, CheckCircle2, AlertTriangle, Shield,
    Activity, Zap, Navigation, RefreshCw, Smartphone,
    Check, X, Award, Info
} from 'lucide-react';

import stylistData from '../../data/stylistMockData.json';
import { useAttendance } from '../../contexts/AttendanceContext';

export default function StylistAttendance() {
    const { logs, addLog } = useAttendance();
    const [accuracy, setAccuracy] = useState(0);
    const [status, setStatus] = useState('OFFLINE');
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredLogs = logs.filter(log => {
        if (statusFilter === 'ALL') return true;
        return log.type === statusFilter;
    });

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
                setLocation({
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                });
                setAccuracy(position.coords.accuracy.toFixed(1));
                setLoading(false);
            },
            (err) => {
                setError(`Failed to fetch location vector: ${err.message}`);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const handleAttendance = (type) => {
        if (!location) {
            setError('Location vector required for system initialization.');
            return;
        }

        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

        const newLog = {
            id: Date.now(),
            type,
            time,
            date,
            loc: `${location.lat}, ${location.lng}`,
            status: 'VERIFIED',
            stylistName: 'Rahul Sharma' // Mock current user for now
        };

        addLog(newLog);
        setStatus(type === 'IN' ? 'ACTIVE_RUN' : 'OFFLINE');
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    return (
        <div className="space-y-6 font-black text-left">
            <div className="grid grid-cols-1 gap-6">
                {/* Status Card */}
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

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Detected Location</p>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-primary">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="text-xs uppercase tracking-widest">Scanning...</span>
                                        </div>
                                    ) : location ? (
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-text tracking-tighter uppercase flex items-center gap-2">
                                                <Navigation className="w-5 h-5 text-primary" /> {location.lat}, {location.lng}
                                            </p>
                                            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest italic">Signal Accuracy: {accuracy}m</p>
                                        </div>
                                    ) : (
                                        <p className="text-rose-500 text-[10px] font-black uppercase">{error || 'Vector Missing'}</p>
                                    )}
                                </div>
                                <button
                                    onClick={fetchLocation}
                                    className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Refresh Location
                                </button>
                            </div>

                            <div className="flex flex-col justify-end gap-3">
                                <button
                                    disabled={status === 'ACTIVE_RUN' || loading || !location}
                                    onClick={() => handleAttendance('IN')}
                                    className={`w-full py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                        ${status === 'ACTIVE_RUN' || loading || !location
                                            ? 'opacity-40 cursor-not-allowed bg-surface-alt border-border'
                                            : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'}`}
                                >
                                    <Zap className="w-4 h-4" /> Punch In
                                </button>
                                <button
                                    disabled={status === 'OFFLINE' || loading || !location}
                                    onClick={() => handleAttendance('OUT')}
                                    className={`w-full py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                        ${status === 'OFFLINE' || loading || !location
                                            ? 'opacity-40 cursor-not-allowed bg-surface-alt border-border'
                                            : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02]'}`}
                                >
                                    <Smartphone className="w-4 h-4" /> Punch Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Attendance Logs */}
            <div className="bg-surface border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Attendance History</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 p-1 bg-background border border-border">
                            {['ALL', 'IN', 'OUT'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-tighter transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                                >
                                    {f === 'ALL' ? 'ALL' : f === 'IN' ? 'PUNCH INS' : 'PUNCH OUTS'}
                                </button>
                            ))}
                        </div>
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest border-l border-border/20 pl-4">Total Logs: {filteredLogs.length}</span>
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
                                    <p className="text-[7px] text-text-muted uppercase font-bold tracking-[0.2em] italic">Location Verified</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-none">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{log.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {logs.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <AlertTriangle className="w-10 h-10 text-text-muted mx-auto opacity-20" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No attendance logs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
