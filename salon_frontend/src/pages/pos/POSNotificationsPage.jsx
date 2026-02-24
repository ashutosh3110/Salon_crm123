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
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Control Center</h1>
                    <p className="text-sm text-text-secondary mt-1 font-medium italic">Manage terminal alerts and system signals.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all"
                    >
                        Mark all Read
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all"
                    >
                        Clear History
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border p-4">
                <div className="flex bg-background border border-border p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text'}`}
                    >
                        All Signals
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'unread' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text'}`}
                    >
                        Unread {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
                    </button>
                </div>

                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border text-xs font-bold uppercase tracking-tighter text-text outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-surface border border-border border-dashed">
                        <Bell className="w-12 h-12 text-text-muted opacity-20 mb-4" />
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest">No terminal signals detected</p>
                    </div>
                ) : (
                    filtered.map((notif) => (
                        <div
                            key={notif.id}
                            className={`group relative flex items-start gap-4 p-5 bg-surface border transition-all ${notif.read ? 'border-border/60 opacity-80' : 'border-primary/30 shadow-md shadow-primary/5'}`}
                        >
                            {/* Read Indicator */}
                            {!notif.read && (
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary"></div>
                            )}

                            {/* Icon Container */}
                            <div className={`w-12 h-12 shrink-0 flex items-center justify-center bg-background border border-border ${notif.color}`}>
                                <notif.icon className="w-6 h-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${notif.color}`}>
                                        {notif.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1 uppercase tracking-tighter">
                                        <Clock className="w-3 h-3" /> {notif.time}
                                    </span>
                                </div>
                                <h3 className={`text-sm font-black uppercase tracking-tight ${notif.read ? 'text-text-secondary' : 'text-text'}`}>
                                    {notif.title}
                                </h3>
                                <p className="text-xs text-text-muted font-bold mt-1 max-w-3xl leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                                    title="Delete Signal"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-text-muted hover:text-text hover:bg-background transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* System Status Footer */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Network Status: Online</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500"></div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Encryption: AES-256 Enabled</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Last Sync: 2 mins ago</span>
                </div>
            </div>
        </div>
    );
}
