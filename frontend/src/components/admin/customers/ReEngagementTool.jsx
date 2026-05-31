import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    ArrowUpRight,
    MessageSquare,
    Phone,
    Calendar,
    Search,
    RefreshCw,
    AlertTriangle,
    User,
    Mail,
    Sparkles,
    CheckCircle
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function ReEngagementTool() {
    const [inactiveClients, setInactiveClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('under_3m'); // 'under_3m' or 'over_3m'
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInactive = async () => {
        setLoading(true);
        try {
            const res = await api.get('/clients/inactive');
            if (res.data.success) {
                setInactiveClients(res.data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch inactive customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInactive();
    }, []);

    // Filter local lists
    const filtered = useMemo(() => {
        return inactiveClients.filter(c => {
            const matchesTab = activeTab === 'under_3m'
                ? (c.inactiveDays >= 30 && c.inactiveDays < 90)
                : (c.inactiveDays >= 90);

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch = !query ||
                (c.name || '').toLowerCase().includes(query) ||
                (c.phone || '').includes(query);

            return matchesTab && matchesSearch;
        });
    }, [inactiveClients, activeTab, searchQuery]);

    // Summary counts
    const under3mCount = useMemo(() => {
        return inactiveClients.filter(c => c.inactiveDays >= 30 && c.inactiveDays < 90).length;
    }, [inactiveClients]);

    const over3mCount = useMemo(() => {
        return inactiveClients.filter(c => c.inactiveDays >= 90).length;
    }, [inactiveClients]);

    const handleWhatsApp = (customer) => {
        const message = `Hi ${customer.name}, we haven't seen you at our salon recently! We miss you and would love to welcome you back. We have some exciting new offers. Book your next visit here!`;
        window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleMarkContacted = async (customerId) => {
        try {
            const res = await api.patch(`/clients/${customerId}`, { lastVisit: new Date().toISOString() });
            if (res.data.success) {
                toast.success('Customer marked as contacted successfully!');
                fetchInactive();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update customer status');
        }
    };

    return (
        <div className="p-4 sm:p-5 space-y-5 animate-fadeIn">
            {/* Header section with description */}
            <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                    <h3 className="text-base font-black text-text uppercase tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Dormant & Inactive Client Tracker
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider font-bold">
                        Identify and reactivate customers who have had no activity for over 30 days
                    </p>
                </div>
                <button
                    onClick={fetchInactive}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface-alt border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Roster
                </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Inactive */}
                <div className="bg-surface border border-border/80 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group hover:border-[#B4912B]/40 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Inactive (1–3 Months)</p>
                    <h4 className="text-2xl font-black text-amber-500 mt-1 tracking-tighter">{under3mCount}</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 uppercase font-bold">Last active 30–90 days ago</p>
                </div>

                {/* Card 2: Dormant */}
                <div className="bg-surface border border-border/80 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group hover:border-[#B4912B]/40 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Dormant (3+ Months)</p>
                    <h4 className="text-2xl font-black text-rose-500 mt-1 tracking-tighter">{over3mCount}</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 uppercase font-bold">Last active 90+ days ago</p>
                </div>

                {/* Card 3: Combined */}
                <div className="bg-surface border border-border/80 p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group hover:border-[#B4912B]/40 transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Dormant Base</p>
                    <h4 className="text-2xl font-black text-primary mt-1 tracking-tighter">{inactiveClients.length}</h4>
                    <p className="text-[9px] text-text-muted mt-0.5 uppercase font-bold">Requires re-engagement campaigns</p>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-surface-alt border border-border p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Tabs */}
                <div className="flex gap-1.5 p-1 bg-background border border-border/60 rounded-xl">
                    <button
                        onClick={() => setActiveTab('under_3m')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'under_3m'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-text-muted hover:text-text'
                        }`}
                    >
                        Inactive ({under3mCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('over_3m')}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            activeTab === 'over_3m'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-text-muted hover:text-text'
                        }`}
                    >
                        Dormant ({over3mCount})
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="SEARCH BY NAME OR PHONE..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-background text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-surface border border-border p-12 rounded-2xl text-center">
                        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Scanning database & assembling client roster...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-surface border border-border p-12 rounded-2xl text-center">
                        <Sparkles className="w-6 h-6 text-primary mx-auto mb-3 opacity-50" />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">No customers match current selection criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filtered.map((customer) => (
                            <div
                                key={customer._id}
                                className="bg-surface border border-border p-4 rounded-2xl hover:border-primary hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                            >
                                {/* Customer Profile */}
                                <div className="flex items-center gap-3.5">
                                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm uppercase shrink-0">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h5 className="font-black text-text group-hover:text-primary transition-colors tracking-tight text-sm uppercase">
                                                {customer.name}
                                            </h5>
                                            <span className="px-2 py-0.5 bg-surface-alt rounded-md border border-border text-[8px] font-black text-text-muted tracking-widest">
                                                {customer.phone}
                                            </span>
                                            {customer.email && (
                                                <span className="px-2 py-0.5 bg-surface-alt rounded-md border border-border text-[8px] font-black text-text-muted tracking-widest lowercase flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" /> {customer.email}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] font-bold text-text-muted">
                                            <span className="flex items-center gap-1 uppercase tracking-widest font-black text-primary">
                                                <Calendar className="w-3 h-3" />
                                                Last Active: {new Date(customer.lastActivityDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <span>•</span>
                                            <span className="px-1.5 py-0.5 bg-background rounded-md border border-border/80 text-[7px] font-black uppercase tracking-widest text-text-muted">
                                                {customer.lastActivityType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Inactivity Metrics & Actions */}
                                <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-border/50">
                                    <div className="text-left md:text-right">
                                        <p className={`text-xl font-black tracking-tighter leading-none ${activeTab === 'under_3m' ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {customer.inactiveDays}
                                        </p>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">Days Inactive</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleWhatsApp(customer)}
                                            className="p-2 rounded-xl bg-surface-alt text-text-muted hover:bg-[#25D366] hover:text-white transition-all border border-border hover:border-[#25D366] active:scale-95 shadow-sm flex items-center justify-center"
                                            title="Launch WhatsApp Campaign"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleCall(customer.phone)}
                                            className="p-2 rounded-xl bg-surface-alt text-text-muted hover:bg-primary hover:text-white transition-all border border-border hover:border-primary active:scale-95 shadow-sm flex items-center justify-center"
                                            title="Call Customer"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleMarkContacted(customer._id)}
                                            className="flex items-center gap-1 bg-text text-white px-3.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:shadow-md transition-all active:scale-95"
                                            title="Mark customer contacted to reset inactivity counter"
                                        >
                                            Mark Contacted
                                            <ArrowUpRight className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
