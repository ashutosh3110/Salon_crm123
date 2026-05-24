import React, { useState, useEffect } from 'react';
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
    Phone
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

    const handleSendManualWhatsApp = (client, type) => {
        const salonName = salon?.businessName || salon?.name || 'Our Salon';
        let text = '';
        if (type === 'birthday') {
            text = `Happy Birthday ${client.name}! We wish you a fantastic year ahead filled with joy and beauty. Thank you for being a valued client! - ${salonName}`;
        } else {
            text = `Happy Anniversary ${client.name}! Celebrating your beautiful journey and wishing you continued happiness. - ${salonName}`;
        }
        const phone = client.phone ? client.phone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-alt/10 p-6 border border-border">
                <div className="text-left">
                    <h4 className="text-xs font-black uppercase tracking-widest text-text">Birthday & Anniversary Wishes History</h4>
                    <p className="text-[11px] font-semibold text-text-muted">View records of sent wishes, automated reminders, and celebratory loyalty awards.</p>
                </div>
                <button
                    onClick={loadWishes}
                    className="border-2 border-text bg-white hover:bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                <div className="flex border border-border p-1 bg-surface-alt/10 max-w-md w-full">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'all' ? 'bg-primary text-white' : 'text-text-muted hover:bg-white'}`}
                    >
                        All Wishes
                    </button>
                    <button
                        onClick={() => setCategoryFilter('birthday')}
                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'birthday' ? 'bg-primary text-white' : 'text-text-muted hover:bg-white'}`}
                    >
                        Birthdays
                    </button>
                    <button
                        onClick={() => setCategoryFilter('anniversary')}
                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'anniversary' ? 'bg-primary text-white' : 'text-text-muted hover:bg-white'}`}
                    >
                        Anniversaries
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Outlet Filter Select */}
                    <div className="relative min-w-[200px]">
                        <select
                            value={outletFilter}
                            onChange={(e) => setOutletFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border-2 border-text text-xs font-bold outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">All Outlets</option>
                            {(outlets || []).map((o) => (
                                <option key={o._id || o.id} value={o._id || o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-text text-xs font-bold outline-none"
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
                    <div className="bg-white border-2 border-text shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface border-b-2 border-text text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Outlet</th>
                                        <th className="px-6 py-4">Celebration Date</th>
                                        <th className="px-6 py-4">Wish Dispatched</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-border text-xs font-bold text-text-secondary">
                                    {wishItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <AlertCircle size={40} className="text-text-muted opacity-40" />
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black uppercase italic opacity-40">No wishes sent yet</p>
                                                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                                                            Wishes sent automatically via cron or manual actions will show up here.
                                                        </p>
                                                    </div>
                                                </div>
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
                                                    <span className={`inline-block border text-[9px] font-black uppercase px-2 py-0.5 tracking-wider ${item.badgeStyle}`}>
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
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest py-2 px-4 shadow-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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
                        <div className="py-4 border-t border-border bg-surface-alt/10 flex items-center justify-between">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                Showing {filteredClients.length} of {totalCount} records
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border bg-white text-[10px] font-black uppercase tracking-wider disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
                                >
                                    Prev
                                </button>
                                <div className="text-xs font-black">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 border border-border bg-white text-[10px] font-black uppercase tracking-wider disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
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
