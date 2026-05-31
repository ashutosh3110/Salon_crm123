import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Cake,
    Calendar,
    MessageSquare,
    RefreshCw,
    Search,
    AlertCircle,
    CheckCircle,
    User,
    Phone,
    ChevronDown,
    Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';

export default function BirthdayAnniversaryRemindersView() {
    const { salon, outlets } = useBusiness();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'birthday', 'anniversary'
    const [outletFilter, setOutletFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);
    const outletDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (outletDropdownRef.current && !outletDropdownRef.current.contains(event.target)) {
                setIsOutletDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadWishes = async () => {
        setLoading(true);
        try {
            // We fetch the customers who have wishesSentOnly=true
            const res = await api.get(`/clients?wishesSentOnly=true&page=${currentPage}&limit=10`);
            if (res.data && res.data.success) {
                setClients(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalCount(res.data.totalCount || 0);
            }
        } catch (err) {
            console.error('Failed to load wishes history:', err);
            toast.error('Failed to load wishes history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWishes();
    }, [currentPage]);

    const handleSendManualWhatsApp = async (client, type) => {
        const toastId = toast.loading('Sending WhatsApp wish...');
        try {
            const res = await api.post(`/clients/${client._id}/send-celebration-wish`, { type });
            if (res.data && res.data.success) {
                toast.success('Wish sent successfully via WhatsApp API!', { id: toastId });
                loadWishes();
            } else {
                toast.error(res.data?.message || 'Failed to send wish', { id: toastId });
            }
        } catch (err) {
            console.error('Failed to send celebration wish:', err);
            toast.error(err.response?.data?.message || 'Error sending wish', { id: toastId });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Filter wishes in the UI by category, outlet and search query
    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone?.includes(searchQuery);

        if (!matchesSearch) return false;

        if (categoryFilter === 'birthday') {
            if (!c.birthdayWishSent) return false;
        } else if (categoryFilter === 'anniversary') {
            if (!c.anniversaryWishSent) return false;
        }

        if (outletFilter !== 'all') {
            const clientOutletId = c.lastOutletId?._id || c.lastOutletId;
            if (String(clientOutletId) !== outletFilter) return false;
        }

        return true;
    });

    const wishItems = [];
    filteredClients.forEach(client => {
        const showBirthday = client.birthdayWishSent && (categoryFilter === 'all' || categoryFilter === 'birthday');
        const showAnniversary = client.anniversaryWishSent && (categoryFilter === 'all' || categoryFilter === 'anniversary');

        if (showBirthday) {
            wishItems.push({
                key: `${client._id}-birthday`,
                client,
                type: 'birthday',
                label: '🎂 Birthday Wish',
                badgeStyle: 'bg-primary/10 text-primary border-primary/20',
                celebrationDate: client.dob || 'Not specified',
                dispatchedAt: client.lastBirthdayWishSentAt,
            });
        }
        if (showAnniversary) {
            wishItems.push({
                key: `${client._id}-anniversary`,
                client,
                type: 'anniversary',
                label: '🎉 Anniversary Wish',
                badgeStyle: 'bg-purple-50 text-purple-650 border-purple-100',
                celebrationDate: client.anniversary || 'Not specified',
                dispatchedAt: client.lastAnniversaryWishSentAt,
            });
        }
    });

    return (
        <div className="p-8 space-y-6 animate-reveal">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-alt/10 p-6 border border-border rounded-3xl">
                <div className="text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text">Birthday & Anniversary Wishes History</h4>
                    <p className="text-[11px] font-semibold text-text-muted">View records of sent wishes, automated reminders, and celebratory loyalty awards.</p>
                </div>
                <button
                    onClick={loadWishes}
                    className="border border-border bg-surface shadow-sm hover:shadow-md hover:bg-surface-alt px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex border border-border p-1.5 bg-surface-alt/10 max-w-md w-full rounded-2xl">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted hover:bg-surface'}`}
                    >
                        All Wishes
                    </button>
                    <button
                        onClick={() => setCategoryFilter('birthday')}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'birthday' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted hover:bg-surface'}`}
                    >
                        Birthdays
                    </button>
                    <button
                        onClick={() => setCategoryFilter('anniversary')}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'anniversary' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted hover:bg-surface'}`}
                    >
                        Anniversaries
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Outlet Filter Select */}
                    <div className="relative min-w-[200px]" ref={outletDropdownRef}>
                        <div
                            onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
                            className="w-full px-4 py-3 bg-surface border border-border text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer rounded-2xl shadow-sm flex items-center justify-between group hover:border-primary transition-all"
                        >
                            <span className="text-text truncate pr-4">
                                {outletFilter === 'all'
                                    ? 'All Outlets'
                                    : (outlets?.find(o => (o._id || o.id) === outletFilter)?.name || 'All Outlets')}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-text-muted group-hover:text-primary transition-transform duration-200 ${isOutletDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isOutletDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-border rounded-2xl shadow-lg z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div
                                    onClick={() => {
                                        setOutletFilter('all');
                                        setIsOutletDropdownOpen(false);
                                    }}
                                    className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-between hover:bg-surface-alt transition-colors ${outletFilter === 'all' ? 'text-primary bg-primary/5' : 'text-text-muted'}`}
                                >
                                    All Outlets
                                    {outletFilter === 'all' && <Check className="w-4 h-4" />}
                                </div>
                                {(outlets || []).map((o) => (
                                    <div
                                        key={o._id || o.id}
                                        onClick={() => {
                                            setOutletFilter(o._id || o.id);
                                            setIsOutletDropdownOpen(false);
                                        }}
                                        className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-between hover:bg-surface-alt transition-colors ${(outletFilter === (o._id || o.id)) ? 'text-primary bg-primary/5' : 'text-text-muted'}`}
                                    >
                                        <span className="truncate pr-4">{o.name}</span>
                                        {(outletFilter === (o._id || o.id)) && <Check className="w-4 h-4 shrink-0" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-surface border border-border text-xs font-bold outline-none rounded-2xl shadow-sm focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted space-y-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Wishes History...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-surface border border-border shadow-sm overflow-hidden rounded-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-alt/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Outlet</th>
                                        <th className="px-6 py-4">Celebration Date</th>
                                        <th className="px-6 py-4">Wish Dispatched</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-xs font-bold text-text-secondary">
                                    {wishItems.length === 0 ? (
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-black uppercase text-text text-sm whitespace-nowrap">—</td>
                                            <td className="px-6 py-4 font-bold text-text-muted font-mono whitespace-nowrap">—</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-block border text-[9px] font-black uppercase px-2 py-0.5 tracking-wider bg-slate-100 text-slate-400 border-slate-200">
                                                    —
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-text uppercase whitespace-nowrap">—</td>
                                            <td className="px-6 py-4 font-bold text-text-muted uppercase whitespace-nowrap">—</td>
                                            <td className="px-6 py-4 font-bold text-text-muted whitespace-nowrap">—</td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button disabled className="opacity-30 bg-slate-300 text-white font-black text-[9px] uppercase tracking-widest py-2 px-4 rounded-xl shadow-sm inline-flex items-center gap-1.5 cursor-not-allowed">
                                                    Resend Wish
                                                </button>
                                            </td>
                                        </tr>
                                    ) : (
                                        wishItems.map((item) => (
                                            <tr key={item.key} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-black uppercase text-text text-sm whitespace-nowrap">
                                                    {item.client.name}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-text-muted font-mono whitespace-nowrap">
                                                    {item.client.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-block border text-[9px] font-black uppercase px-2.5 py-1 rounded-xl tracking-wider ${item.badgeStyle}`}>
                                                        {item.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-text uppercase whitespace-nowrap">
                                                    {item.client.lastOutletId?.name || '—'}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-text-muted uppercase whitespace-nowrap">
                                                    {item.celebrationDate}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        {formatDate(item.dispatchedAt)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleSendManualWhatsApp(item.client, item.type)}
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest py-2 px-4 rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        Resend Wish
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="py-4 bg-surface-alt/10 flex items-center justify-between">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-4">
                                Showing {filteredClients.length} of {totalCount} records
                            </div>
                            <div className="flex items-center gap-3 pr-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border rounded-xl bg-surface text-[10px] font-black uppercase tracking-wider disabled:opacity-30 hover:bg-surface-alt transition-all cursor-pointer shadow-sm"
                                >
                                    Prev
                                </button>
                                <div className="text-xs font-black">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 border border-border rounded-xl bg-surface text-[10px] font-black uppercase tracking-wider disabled:opacity-30 hover:bg-surface-alt transition-all cursor-pointer shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
