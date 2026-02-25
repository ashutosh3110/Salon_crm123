import { useState } from 'react';
import {
    Bell, CheckCircle2, AlertTriangle, Info, Clock,
    Trash2, Search, Filter, MoreVertical, ShieldAlert,
    ShoppingBag, Calendar, RefreshCcw
} from 'lucide-react';

const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'alert',
        title: 'Low Stock Warning',
        message: 'L\'Oréal Professional Shampoo (500ml) is below threshold. Current stock: 2 units.',
        time: '10 mins ago',
        category: 'Inventory',
        read: false,
        icon: AlertTriangle,
        color: 'text-amber-500'
    },
    {
        id: '2',
        type: 'booking',
        title: 'New Online Booking',
        message: 'Client Ananya R. booked "Hair Spa + Trim" for today at 04:30 PM.',
        time: '1 hour ago',
        category: 'Appointments',
        read: false,
        icon: Calendar,
        color: 'text-primary'
    },
    {
        id: '3',
        type: 'payment',
        title: 'Refund Processed',
        message: 'Refund REF-002 (₹1,500) has been authorized by manager.',
        time: '3 hours ago',
        category: 'Finance',
        read: true,
        icon: RefreshCcw,
        color: 'text-emerald-500'
    },
    {
        id: '4',
        type: 'system',
        title: 'Terminal Sync Successful',
        message: 'Endpoint sync completed with Cloud. 142 journals updated.',
        time: '5 hours ago',
        category: 'System',
        read: true,
        icon: CheckCircle2,
        color: 'text-blue-500'
    },
    {
        id: '5',
        type: 'alert',
        title: 'Security Notice',
        message: 'Successful login from new terminal IP 192.168.1.45.',
        time: 'Yesterday',
        category: 'Security',
        read: true,
        icon: ShieldAlert,
        color: 'text-rose-500'
    }
];

export default function POSNotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState('all');

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        if (window.confirm('Clear all notifications?')) setNotifications([]);
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase">Signal Command Center</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                        Live Endpoint_Telemetry Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        className="px-6 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary hover:border-primary/40 transition-all shadow-sm active:scale-95"
                    >
                        Batch_Read_Verify
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-6 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20 transition-all shadow-sm active:scale-95"
                    >
                        Purge_Cache
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-surface border border-border p-6 shadow-sm">
                <div className="flex bg-surface-alt border border-border p-1.5 shadow-inner">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'all' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-text'}`}
                    >
                        All_Signals
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-muted hover:text-text'}`}
                    >
                        Active_Only {notifications.filter(n => !n.read).length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-white/20 text-[8px] animate-pulse">[{notifications.filter(n => !n.read).length}]</span>}
                    </button>
                </div>

                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:scale-110 transition-transform" />
                    <input
                        type="text"
                        placeholder="SEARCH_SIGNAL_LOGS..."
                        className="w-full pl-12 pr-6 py-3 bg-surface-alt border border-border text-[11px] font-black uppercase tracking-[0.2em] text-text outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center bg-surface-alt border border-border border-dashed shadow-inner">
                        <div className="w-20 h-20 bg-background border border-border flex items-center justify-center mb-6 text-text-muted opacity-20">
                            <Bell className="w-10 h-10" />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">ERR_NULL: NO_ACTIVE_SIGNALS_DETECTED</p>
                    </div>
                ) : (
                    filtered.map((notif) => (
                        <div
                            key={notif.id}
                            className={`group relative flex items-start gap-6 p-6 bg-surface border transition-all hover:border-primary/40 ${notif.read ? 'border-border/60 opacity-60' : 'border-primary/30 shadow-lg shadow-primary/5'}`}
                        >
                            {/* Read Indicator */}
                            {!notif.read && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
                            )}

                            {/* Icon Container */}
                            <div className={`w-14 h-14 shrink-0 flex items-center justify-center bg-surface-alt border border-border ${notif.color} group-hover:scale-105 transition-transform shadow-sm`}>
                                <notif.icon className="w-7 h-7" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-2 py-0.5 border border-current/20 ${notif.color}`}>
                                        {notif.category}_PRTCL
                                    </span>
                                    <span className="text-[10px] font-black text-text-muted flex items-center gap-2 uppercase tracking-tighter opacity-40">
                                        <Clock className="w-3.5 h-3.5" /> {notif.time.replace('ago', 'UTC')}
                                    </span>
                                </div>
                                <h3 className={`text-base font-black uppercase tracking-tight italic ${notif.read ? 'text-text-secondary' : 'text-text'}`}>
                                    {notif.title}
                                </h3>
                                <p className="text-[11px] text-text-muted font-bold mt-2 max-w-4xl leading-relaxed uppercase tracking-tight opacity-70">
                                    {notif.message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex border-l border-border pl-6 items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-3 bg-surface-alt border border-border text-text-muted hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-90"
                                    title="Purge Entry"
                                >
                                    <Trash2 className="w-4.5 h-4.5" />
                                </button>
                                <button className="p-3 bg-surface-alt border border-border text-text-muted hover:text-text hover:border-primary/40 transition-all active:scale-90">
                                    <MoreVertical className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* System Status Footer */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border pt-12">
                <div className="flex items-center gap-4 group">
                    <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse group-hover:scale-125 transition-transform"></div>
                    <div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">ENDPOINT_STREAMS</p>
                        <p className="text-[10px] font-black text-text uppercase tracking-widest mt-1">Status: Operational</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-1.5 h-1.5 bg-blue-500 group-hover:scale-125 transition-transform"></div>
                    <div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">CRYPTOGRAPHIC_MNE</p>
                        <p className="text-[10px] font-black text-text uppercase tracking-widest mt-1">ENCRYPTION: AES-256</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-1.5 h-1.5 bg-emerald-500 group-hover:scale-125 transition-transform"></div>
                    <div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">MASTER_LEDGER_SYNC</p>
                        <p className="text-[10px] font-black text-text uppercase tracking-widest mt-1">LAST_PULSE: 2m_AGO</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
