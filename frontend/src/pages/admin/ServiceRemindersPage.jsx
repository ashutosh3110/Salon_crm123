import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    CalendarClock,
    Search,
    Clock,
    CheckCircle2,
    User,
    Scissors,
    Phone
} from 'lucide-react';

export default function ServiceRemindersPage() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const { outlets, fetchOutlets } = useBusiness();
    const [selectedOutlet, setSelectedOutlet] = useState('all');

    useEffect(() => {
        if (!outlets || outlets.length === 0) {
            fetchOutlets();
        }
    }, []);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/service-reminders?outletId=${selectedOutlet}`);
            if (res.data.success) {
                setReminders(res.data.data);
            }
        } catch (err) {
            toast.error('Failed to load reminders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, [selectedOutlet]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await api.patch(`/service-reminders/${id}`, { status });
            if (res.data.success) {
                toast.success(`Reminder marked as ${status}`);
                setReminders(prev => prev.map(r => r._id === id ? res.data.data : r));
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const filteredReminders = reminders.filter(r => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            return r.customerId?.name?.toLowerCase().includes(searchLower) ||
                   r.customerId?.phone?.includes(search) ||
                   r.serviceId?.name?.toLowerCase().includes(searchLower);
        }
        return true;
    });

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
            cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
        return (
            <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <CalendarClock className="w-8 h-8 text-[#B4912B]" />
                        Service Reminders
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Automated WhatsApp reminders for repeated services.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-alt rounded-2xl border border-[#e2e8f0] dark:border-border p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or service..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#B4912B]/20 outline-none transition-all dark:text-white"
                    />
                </div>
                
                <div className="w-full sm:w-48">
                    <select
                        value={selectedOutlet}
                        onChange={(e) => setSelectedOutlet(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#B4912B]/20 outline-none transition-all dark:text-white appearance-none"
                    >
                        <option value="all">All Outlets</option>
                        {outlets?.map(outlet => (
                            <option key={outlet._id} value={outlet._id}>
                                {outlet.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    {['all', 'pending', 'sent', 'failed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all shrink-0 border ${
                                filter === f 
                                ? 'bg-[#B4912B] text-white border-[#B4912B] shadow-md shadow-[#B4912B]/20' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#B4912B]/30'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-surface-alt rounded-2xl border border-[#e2e8f0] dark:border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[#e2e8f0] dark:border-border">
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Service</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                            <div className="w-4 h-4 border-2 border-[#B4912B] border-t-transparent rounded-full animate-spin" />
                                            Loading reminders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReminders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        No reminders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredReminders.map(r => (
                                    <tr key={r._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    {r.customerId?.profileImage ? (
                                                        <img src={r.customerId.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{r.customerId?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" />
                                                        {r.customerId?.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-[#B4912B]/10 flex items-center justify-center shrink-0">
                                                    <Scissors className="w-4 h-4 text-[#B4912B]" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{r.serviceId?.name || 'Unknown'}</div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        Last visit: {r.bookingId?.appointmentDate ? new Date(r.bookingId.appointmentDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {new Date(r.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col items-start gap-1">
                                                {getStatusBadge(r.status)}
                                                {r.failureReason && (
                                                    <span className="text-[10px] text-red-500 max-w-[150px] truncate" title={r.failureReason}>
                                                        {r.failureReason}
                                                    </span>
                                                )}
                                                {r.sentAt && (
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(r.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            {r.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(r._id, 'sent')}
                                                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    title="Mark as Sent"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
