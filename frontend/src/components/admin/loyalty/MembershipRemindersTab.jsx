import { useState, useEffect } from 'react';
import {
    Bell,
    Clock,
    Search,
    Filter,
    Send,
    AlertCircle,
    CheckCircle,
    Calendar,
    Smartphone,
    User,
    Sparkles,
    Loader2,
    Download,
    History,
    MapPin,
    ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useBusiness } from '../../../contexts/BusinessContext';
import CustomDropdown from '../../common/CustomDropdown';

export default function MembershipRemindersTab() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sendingId, setSendingId] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState('all');
    const [isBulkSending, setIsBulkSending] = useState(false);
    const { outlets } = useBusiness();

    // Load membership reminders from backend
    const loadReminders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loyalty/reminders', {
                params: {
                    search: search || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined
                }
            });
            setReminders(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load membership reminders:', err);
            toast.error('Failed to load membership reminders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReminders();
    }, [search, statusFilter]);

    const handleSendReminder = async (item) => {
        setSendingId(item.id);
        const toastId = toast.loading(`Sending expiry reminder to ${item.customerName} via WhatsApp...`);
        try {
            const res = await api.post(`/loyalty/reminders/${item.id}/send`);
            if (res.data?.success) {
                toast.success(res.data?.message || 'Reminder sent on WhatsApp!', { id: toastId });
                // Update local state dynamically to show the incremented counts immediately
                setReminders(prev => prev.map(r => {
                    if (r.id === item.id) {
                        return {
                            ...r,
                            reminderCount: res.data.data?.reminderCount ?? (r.reminderCount + 1),
                            lastReminderSentAt: res.data.data?.lastReminderSentAt ?? new Date()
                        };
                    }
                    return r;
                }));
            } else {
                toast.error(res.data?.message || 'Failed to dispatch reminder.', { id: toastId });
            }
        } catch (err) {
            console.error('WhatsApp Reminder dispatch error:', err);
            toast.error(err.response?.data?.message || 'Error sending WhatsApp reminder', { id: toastId });
        } finally {
            setSendingId(null);
        }
    };

    const handleExport = () => {
        if (reminders.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ['Client Name', 'Phone', 'Membership Plan', 'Price', 'Start Date', 'Expiry Date', 'Status', 'Reminders Sent'];
        const csvContent = [
            headers.join(','),
            ...reminders.map(r => [
                `"${r.customerName}"`,
                `"${r.customerPhone}"`,
                `"${r.membershipPlan}"`,
                r.amount,
                new Date(r.startDate).toLocaleDateString('en-IN'),
                new Date(r.expiryDate).toLocaleDateString('en-IN'),
                r.status,
                r.reminderCount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `membership_reminders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkSend = async () => {
        const eligibleReminders = reminders.filter(r => r.status === 'expiring_soon' || r.status === 'expired');
        if (eligibleReminders.length === 0) {
            toast.error("No pending reminders to send.");
            return;
        }

        if (!window.confirm(`Are you sure you want to send reminders to ${eligibleReminders.length} clients?`)) return;

        setIsBulkSending(true);
        const toastId = toast.loading(`Sending ${eligibleReminders.length} reminders...`);
        let successCount = 0;
        let failCount = 0;

        for (const item of eligibleReminders) {
            try {
                const res = await api.post(`/loyalty/reminders/${item.id}/send`);
                if (res.data?.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                failCount++;
            }
        }

        toast.success(`Bulk send complete: ${successCount} successful, ${failCount} failed.`, { id: toastId });
        setIsBulkSending(false);
        loadReminders(); // Refresh the data to update counts
    };

    // Calculate quick stats locally for current view/data
    const totalActive = reminders.filter(r => r.status === 'active').length;
    const expiringSoon = reminders.filter(r => r.status === 'expiring_soon').length;
    const totalExpired = reminders.filter(r => r.status === 'expired').length;
    const totalRemindedSum = reminders.reduce((acc, curr) => acc + (curr.reminderCount || 0), 0);

    return (
        <div className="space-y-4 italic text-left">
            {/* Header section with stark styling */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary" />
                    <div>
                        <h2 className="text-sm font-black text-foreground uppercase italic tracking-tight leading-none">Membership Expiry Reminders</h2>
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">Audit, monitor, and manually dispatch membership renewals via automated WhatsApp API integration.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">

                    <button onClick={handleBulkSend} disabled={isBulkSending} className="h-9 px-5 rounded-xl bg-[#B4912B] hover:bg-[#9A7B25] text-white flex items-center gap-2 font-bold text-xs transition-colors shadow-sm disabled:opacity-50">
                        {isBulkSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        {isBulkSending ? 'Sending...' : 'Send Bulk Reminder'}
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Memberships', value: totalActive, desc: 'Active Members', actionText: 'View active \u2192', theme: { bg: 'bg-emerald-500/5', iconBg: 'bg-emerald-500/10', text: 'text-emerald-600' }, icon: CheckCircle },
                    { label: 'Expiring Soon', value: expiringSoon, desc: 'Ending in 7 days', actionText: 'View expiring \u2192', theme: { bg: 'bg-amber-500/5', iconBg: 'bg-amber-500/10', text: 'text-amber-600' }, icon: Clock },
                    { label: 'Expired Status', value: totalExpired, desc: 'Awaiting renewal', actionText: 'View expired \u2192', theme: { bg: 'bg-rose-500/5', iconBg: 'bg-rose-500/10', text: 'text-rose-600' }, icon: AlertCircle },
                    { label: 'Reminders Sent', value: totalRemindedSum, desc: 'WhatsApp logs', actionText: 'View logs \u2192', theme: { bg: 'bg-indigo-500/5', iconBg: 'bg-indigo-500/10', text: 'text-indigo-600' }, icon: Send },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`rounded-2xl p-3.5 sm:p-4 border border-border/20 flex flex-col justify-between transition-all duration-300 hover:shadow-md ${stat.theme.bg}`}>
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stat.theme.iconBg}`}>
                                    <Icon className={`w-4 h-4 ${stat.theme.text}`} />
                                </div>
                                <div>
                                    <div className="text-[8px] uppercase font-bold text-foreground/80 tracking-widest">{stat.label}</div>
                                    <div className="text-xl font-black text-foreground mt-0.5 leading-none">{stat.value}</div>
                                    <div className="text-[11px] font-medium text-foreground/70 mt-1">{stat.desc}</div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => {
                                        if (stat.label === 'Active Memberships') setStatusFilter('active');
                                        if (stat.label === 'Expiring Soon') setStatusFilter('expiring_soon');
                                        if (stat.label === 'Expired Status') setStatusFilter('expired');
                                        if (stat.label === 'Reminders Sent') setStatusFilter('reminded');
                                    }}
                                    className={`text-[10px] font-bold hover:underline ${stat.theme.text}`}
                                >
                                    {stat.actionText}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 no-scrollbar pb-1 lg:pb-0" style={{ overflowX: 'auto' }}>
                    {[
                        { id: 'all', label: 'All Records' },
                        { id: 'active', label: 'Active Only' },
                        { id: 'expiring_soon', label: 'Expiring Soon' },
                        { id: 'expired', label: 'Expired Status' },
                        { id: 'reminded', label: 'Reminder Logs' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2.5 border rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all whitespace-nowrap ${statusFilter === tab.id
                                ? 'bg-[#B4912B] text-white border-[#B4912B] shadow-md shadow-[#B4912B]/10'
                                : 'text-text-muted border-border/40 hover:bg-surface-alt'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right controls: Search, Location, Export */}
                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto flex-1 lg:justify-end mt-2 lg:mt-0">
                    {/* Search query input */}
                    <div className="relative flex-1 lg:flex-none lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-white dark:bg-slate-800 border rounded-xl border-border/40 text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:border-primary transition-all"
                        />
                    </div>

                    {/* Location Dropdown */}
                    <div className="flex-1 lg:flex-none lg:w-48 shrink-0">
                        <CustomDropdown
                            icon={MapPin}
                            value={selectedOutlet}
                            onChange={(val) => setSelectedOutlet(val)}
                            options={[
                                { value: 'all', label: 'All Locations' },
                                ...(outlets?.map(outlet => ({
                                    value: outlet._id || outlet.id,
                                    label: outlet.name
                                })) || [])
                            ]}
                            placeholder="All Locations"
                            className="!w-full"
                        />
                    </div>

                    {/* Export */}
                    <button onClick={handleExport} className="h-9 w-9 flex items-center justify-center rounded-xl border border-border/40 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-foreground shadow-sm shrink-0">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Reminders Table */}
            <div className="bg-surface border border-border/40 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-alt border-b border-border/40">
                            <tr>
                                <Th>Identified Client</Th>
                                <Th>Membership Plan</Th>
                                <Th>Validity Dates</Th>
                                <Th>Remaining Days</Th>
                                <Th>Reminder Dispatch Info</Th>
                                <Th>Action Protocol</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <span className="text-xs font-black text-text-muted uppercase tracking-widest">Querying database reminders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : reminders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                                            <div className="w-16 h-16 bg-surface-alt border border-border/40 flex items-center justify-center text-text-muted shadow-inner rounded-2xl">
                                                <Bell className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-base font-black uppercase tracking-tight text-foreground">No Expiry Records</h3>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No memberships match the current filtering parameters in this salon.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reminders.map((item) => {
                                    const isSending = sendingId === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-surface-alt/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 rounded-xl shrink-0">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-foreground italic tracking-tight">{item.customerName}</div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest mt-0.5">
                                                            <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                                                            {item.customerPhone}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div>
                                                    <div className="text-xs font-black text-foreground uppercase tracking-tight">{item.membershipPlan}</div>
                                                    <div className="text-[9px] font-black text-text-muted mt-0.5 uppercase tracking-widest">
                                                        Price Value: <span className="text-foreground italic">₹{item.amount}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                        <Calendar className="w-3 h-3 text-purple-500 shrink-0" />
                                                        Start: <span className="text-foreground">{new Date(item.startDate).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                        <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                                                        Expiry: <span className="text-foreground font-bold">{new Date(item.expiryDate).toLocaleDateString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <StatusBadge status={item.status} days={item.daysLeft} />
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                        Total Sent:
                                                        <span className={`px-2 py-0.5 text-[9px] font-black leading-none border rounded-lg ml-1 ${item.reminderCount > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-alt text-text-muted border-border/40'}`}>
                                                            {item.reminderCount} Reminders
                                                        </span>
                                                    </div>
                                                    {item.lastReminderSentAt && (
                                                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                                                            Last Dispatch: <span className="text-foreground">{new Date(item.lastReminderSentAt).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleSendReminder(item)}
                                                    disabled={isSending}
                                                    className={`h-9 px-4 border rounded-xl font-black text-[9px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${isSending
                                                        ? 'bg-surface-alt border-border/40 text-text-muted cursor-not-allowed'
                                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20'
                                                        }`}
                                                >
                                                    {isSending ? (
                                                        <>
                                                            <Loader2 size={12} className="animate-spin text-text-muted" />
                                                            <span>SENDING...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={12} />
                                                            <span>SEND REMINDER</span>
                                                        </>
                                                    )}
                                                </button>
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
    );
}

function Th({ children }) {
    return <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] italic">{children}</th>;
}

function StatusBadge({ status, days }) {
    const styles = {
        active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        expiring_soon: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        expired: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
    };

    let text = `${days} Days Left`;
    if (status === 'expired') {
        text = `Expired ${Math.abs(days)} Days Ago`;
    } else if (status === 'active') {
        text = `${days} Days Active`;
    } else if (status === 'expiring_soon') {
        text = `EXPIRING SOON (${days}d)`;
    }

    return (
        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border leading-none rounded-xl inline-block ${styles[status] || styles.active}`}>
            {text}
        </span>
    );
}
