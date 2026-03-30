import React, { useState, useEffect, useCallback } from 'react';
import {
    UserCheck,
    Search,
    QrCode,
    ArrowRight,
    CheckCircle2,
    Clock,
    ShieldCheck,
    Scissors,
    AlertCircle,
    User,
    X,
    Loader2,
    RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export default function CheckInPage() {
    const [checkinList, setCheckinList] = useState([]);
    const [checkoutList, setCheckoutList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);
        
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // 1. Fetch Incoming Clearances (Confirmed for today)
            const incomingRes = await api.get(`/bookings?status=confirmed&date=${today}`);
            setCheckinList(incomingRes.data.results || []);

            // 2. Fetch Outgoing Protocols (Completed but Unpaid)
            const outgoingRes = await api.get(`/bookings?status=completed&paymentStatus=unpaid&date=${today}`);
            setCheckoutList(outgoingRes.data.results || []);
        } catch (error) {
            console.error('[PROTOCOL] Data synchronization failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Polling for updates every 30 seconds for live feel
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleCheckIn = async (id) => {
        try {
            await api.patch(`/bookings/${id}`, { status: 'arrived' });
            // Optimistic update
            setCheckinList(prev => prev.filter(i => i._id !== id));
            alert('ACCESS PROTOCOL AUTHORIZED: Identity verified and check-in logged.');
        } catch (error) {
            alert('PROTOCOL ERROR: Check-in authorization failed.');
        }
    };

    const handleSettle = async (id) => {
        try {
            await api.patch(`/bookings/${id}`, { paymentStatus: 'paid' });
            // Optimistic update
            setCheckoutList(prev => prev.filter(i => i._id !== id));
            alert('SETTLEMENT PROTOCOL COMPLETE: Invoice cleared and transaction finalized.');
        } catch (error) {
            alert('SETTLEMENT ERROR: Payment processing failed.');
        }
    };

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            alert('SECURE TOKEN VERIFIED: Remote synchronization successful.');
        }, 1500);
    };

    const filteredCheckins = checkinList.filter(item =>
        (item.clientId?.name || 'Walk-in').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Synching with central node...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Access Protocol</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Client arrival & departure clearance</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchData()}
                        disabled={refreshing}
                        className="p-2.5 bg-surface border border-border text-text-muted hover:text-primary transition-all active:rotate-180"
                        title="Force Synchronization"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <QrCode className="w-4 h-4" /> {isScanning ? 'SCANNING...' : 'Scan QR'}
                    </button>
                </div>
            </div>

            {/* Quick Actions Search */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Arrival Check-in */}
                    <div className="bg-surface border border-border">
                        <div className="px-6 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-primary" /> Incoming Clearances
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH CLIENT..."
                                    className="pl-9 pr-4 py-1.5 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 w-48"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {filteredCheckins.length > 0 ? filteredCheckins.map((item) => (
                                <div key={item._id} className="px-6 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center">
                                            <User className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{item.clientId?.name || 'Walk-in'}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.serviceId?.name || 'Standard Service'}</span>
                                                <div className="flex items-center gap-1 font-black">
                                                    <Clock className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] text-text-secondary uppercase tracking-widest">{item.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Payment</p>
                                            <p className={`text-[9px] font-black tracking-widest uppercase ${item.paymentStatus === 'unpaid' ? 'text-amber-500' : 'text-emerald-500'}`}>{item.paymentStatus}</p>
                                        </div>
                                        <button
                                            onClick={() => handleCheckIn(item._id)}
                                            className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                                        >
                                            In-Check <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-6 py-12 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No pending arrivals in sequence</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Exit Check-out */}
                    <div className="bg-surface border border-border">
                        <div className="px-6 py-4 border-b border-border bg-rose-500/5 flex items-center justify-between">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest flex items-center gap-2 text-rose-600">
                                <Scissors className="w-4 h-4" /> Outgoing Protocols
                            </h3>
                            <span className="text-[9px] font-black text-rose-600/60 uppercase tracking-widest">Waiting for Settlement</span>
                        </div>
                        <div className="divide-y divide-border">
                            {checkoutList.length > 0 ? checkoutList.map((item) => (
                                <div key={item._id} className="px-6 py-5 flex items-center justify-between hover:bg-surface-alt/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-alt border border-border flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text uppercase tracking-tight">{item.clientId?.name || 'Walk-in'}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                                                {item.serviceId?.name} · {item.staffId?.name || 'Professional'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Total Bill</p>
                                            <p className="text-sm font-black text-primary uppercase">₹{item.price}</p>
                                        </div>
                                        <button
                                            onClick={() => handleSettle(item._id)}
                                            className="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                                        >
                                            Settle Bill
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="px-6 py-12 text-center opacity-30">
                                    <p className="text-[10px] font-black uppercase tracking-widest">No pending settlements</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info / Safety Sidebar */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border p-6 space-y-4 relative overflow-hidden group transition-all hover:border-primary/20">
                        {/* Soft Glow */}
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest leading-none">Security Protocol</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="p-5 bg-surface-alt border border-border group-hover:bg-surface transition-all">
                                <p className="text-[10px] font-black text-text uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-primary" /> Identity Verification
                                </p>
                                <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest leading-relaxed opacity-80">
                                    Always verify client identity for pre-paid services and membership benefits.
                                </p>
                            </div>
                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 group-hover:bg-emerald-500/10 transition-all">
                                <div className="flex items-center gap-2 font-black text-emerald-600 mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <p className="text-[10px] uppercase tracking-widest">Member Alert</p>
                                </div>
                                <p className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-widest leading-relaxed">
                                    VIP clients and platinum members should be processed through priority lane.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 flex flex-col items-center text-center space-y-4 group hover:bg-amber-500/10 transition-all relative overflow-hidden">
                        {/* Subtle Glow */}
                        <div className="absolute -right-2 -top-2 w-16 h-16 bg-amber-500/5 rounded-none blur-xl group-hover:bg-amber-500/10 transition-colors" />

                        <div className="w-14 h-14 bg-white border border-border flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform relative z-10">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Delay Protocol</p>
                            <p className="text-[11px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                                Monitor service durations. If service exceeds +15 mins of scheduled exit, notify receptionist node.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Scanning Overlay */}
            {isScanning && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="text-center space-y-8 relative">
                        {/* Scanning Line Animation */}
                        <div className="w-64 h-64 border-2 border-primary/20 relative overflow-hidden mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 w-full h-1/4 animate-scan-line" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <QrCode className="w-32 h-32 text-primary opacity-40" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">Bridging Scan...</h3>
                            </div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">SECURE TOKEN VERIFICATION IN PROGRESS</p>
                        </div>
                        <button
                            onClick={() => setIsScanning(false)}
                            className="px-6 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            ABORT SCAN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
