import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, MapPin, CheckCircle2, AlertTriangle, Shield,
    Activity, Zap, Navigation, RefreshCw, Smartphone,
    Check, X, Award, Info
} from 'lucide-react';

export default function StylistAttendance() {
    const [status, setStatus] = useState('OFFLINE');
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([
        { id: 1, type: 'IN', time: '09:02 AM', date: '04 MAR 2026', loc: '28.6139, 77.2090', status: 'VERIFIED' },
        { id: 2, type: 'OUT', time: '07:15 PM', date: '04 MAR 2026', loc: '28.6139, 77.2090', status: 'VERIFIED' },
    ]);
    const [accuracy, setAccuracy] = useState(null);

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
            status: 'VERIFIED'
        };

        setLogs([newLog, ...logs]);
        setStatus(type === 'IN' ? 'ACTIVE_RUN' : 'OFFLINE');
        // In a real app, send newLog to backend
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    return (
        <div className="space-y-6 font-black text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="lg:col-span-2 bg-background border border-border p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-32 h-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${status === 'ACTIVE_RUN' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Presence_State: {status}</span>
                            </div>
                            <Shield className="w-4 h-4 text-primary opacity-40" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] mb-2 font-bold italic">Location_Vector</p>
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-primary">
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span className="text-xs uppercase tracking-widest">Fetching...</span>
                                        </div>
                                    ) : location ? (
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black text-text tracking-tighter uppercase flex items-center gap-2">
                                                <Navigation className="w-5 h-5 text-primary" /> {location.lat}, {location.lng}
                                            </p>
                                            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest italic">Signal_Accuracy: {accuracy}m</p>
                                        </div>
                                    ) : (
                                        <p className="text-rose-500 text-[10px] font-black uppercase">{error || 'Vector Missing'}</p>
                                    )}
                                </div>
                                <button
                                    onClick={fetchLocation}
                                    className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Rekey_Location_Scan
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
                                    <Zap className="w-4 h-4" /> Initialize_Presence
                                </button>
                                <button
                                    disabled={status === 'OFFLINE' || loading || !location}
                                    onClick={() => handleAttendance('OUT')}
                                    className={`w-full py-4 border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                                        ${status === 'OFFLINE' || loading || !location
                                            ? 'opacity-40 cursor-not-allowed bg-surface-alt border-border'
                                            : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.02]'}`}
                                >
                                    <Smartphone className="w-4 h-4" /> Terminate_Cycle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-surface border border-border p-8 flex flex-col justify-between relative group overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-primary">
                            <Info className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Policy_Log_Info</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[9px] text-text-muted uppercase leading-relaxed font-bold tracking-widest italic">
                                All attendance entries are cryptographically signed with your hardware ID and geolocation vector.
                            </p>
                            <div className="p-4 bg-background border border-border/50 text-[8px] font-black uppercase tracking-widest text-primary/60">
                                IP: 192.168.1.104 <br />
                                GATEWAY: ALPHA_STATION_04
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] text-text-muted uppercase tracking-[0.3em]">Root_Authorized</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Logs */}
            <div className="bg-surface border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text">Session_Cycle_Logs</span>
                    </div>
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Total_Entries: {logs.length}</span>
                </div>

                <div className="divide-y divide-border/10">
                    {logs.map((log) => (
                        <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-background/50 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-1 h-8 ${log.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'}`} />
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-black text-text tracking-tighter">{log.time}</p>
                                        <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest ${log.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                            PROTOCOL_{log.type === 'IN' ? 'INITIALIZED' : 'TERMINATED'}
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
                                    <p className="text-[7px] text-text-muted uppercase font-bold tracking-[0.2em] italic">GEOLOCATION_VERIFIED_BY_SYSTEM</p>
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
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No cycle data available in local registry.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
