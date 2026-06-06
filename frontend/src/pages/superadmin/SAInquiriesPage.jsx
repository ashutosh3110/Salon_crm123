import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Search, Filter, Calendar,
    User, Mail, Phone, Building2,
    CheckCircle2, Clock, Trash2, ArrowUpRight, Loader2,
    XCircle, ShieldCheck
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import api from '../../services/api';

const STATUS_CFG = {
    new: { label: 'New Lead', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    contacted: { label: 'Contacted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: 'Archived', cls: 'bg-slate-550/10 text-slate-500 border-slate-200' },
};

export default function SAInquiriesPage() {
    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inquiries');
            let data = response.data.data || [];
            
            // Client-side filtering
            if (filterStatus !== 'all') {
                data = data.filter(i => i.status === filterStatus);
            }
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                data = data.filter(i => 
                    i.name.toLowerCase().includes(query) || 
                    (i.salonName && i.salonName.toLowerCase().includes(query)) ||
                    i.email.toLowerCase().includes(query)
                );
            }
            
            setInquiries(data);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            showToast('Failed to load inquiries.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [filterStatus]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchInquiries();
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/inquiries/${id}`, { status: newStatus });
            setInquiries(inquiries.map(item =>
                item._id === id ? { ...item, status: newStatus } : item
            ));
            showToast(`Lead marked as ${newStatus.toUpperCase()}`);
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Failed to update status.', 'error');
        }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await api.delete(`/inquiries/${id}`);
            setInquiries(inquiries.filter(item => item._id !== id));
            showToast('Inquiry permanently removed.', 'error');
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            showToast('Failed to delete inquiry.', 'error');
        }
    };

    // Calculate Inquiries statistics
    const stats = useMemo(() => {
        const total = inquiries.length;
        const pending = inquiries.filter(i => i.status === 'new').length;
        const contacted = inquiries.filter(i => i.status === 'contacted').length;
        const archived = inquiries.filter(i => i.status === 'archived').length;
        return { total, pending, contacted, archived };
    }, [inquiries]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6 space-y-6 pb-12">
            
            {/* Toast popup */}
            {toast && (
                <div className="fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/90 border border-white shadow-2xl text-sm font-semibold animate-in slide-in-from-right-4 duration-300">
                    {toast.type === 'error'
                        ? <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                        : <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />}
                    <span className={toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* Header Upgrade */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight mt-1">Partnership Inquiries</h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium font-sans">Manage incoming salon leads, franchise requests, and partnerships.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/80 backdrop-blur border border-slate-200/50 rounded-2xl px-4 py-2.5 gap-2 shadow-sm">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {stats.pending} Pending Leads
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Leads</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-800">{stats.total}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">New Leads</p>
                    <h3 className="text-3xl font-black mt-2 text-amber-600">{stats.pending}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contacted</p>
                    <h3 className="text-3xl font-black mt-2 text-emerald-600">{stats.contacted}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Archived</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-400">{stats.archived}</h3>
                </div>
            </div>

            {/* Search and Filters wrapper */}
            <div className="relative z-20 flex flex-col md:flex-row gap-3 bg-white/50 backdrop-blur rounded-3xl p-3 border border-slate-200/50 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, salon or email address..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value === '') {
                                setTimeout(() => fetchInquiries(), 50);
                            }
                        }}
                        onKeyDown={handleSearch}
                        className="w-full pl-11 pr-16 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#B4912B] transition-all placeholder:text-slate-400"
                    />
                    <button 
                        onClick={fetchInquiries}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#B4912B] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#8B6F23] transition-all"
                    >
                        Search
                    </button>
                </div>

                {/* Dropdown Filter */}
                <div className="w-full md:w-48 shrink-0">
                    <CustomDropdown
                        value={filterStatus}
                        onChange={setFilterStatus}
                        placeholder="Filter by Status"
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'new', label: 'New' },
                            { value: 'contacted', label: 'Contacted' },
                            { value: 'archived', label: 'Archived' },
                        ]}
                    />
                </div>
            </div>

            {/* Leads Table Container */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sender / Salon</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr key="loading-row">
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-8 h-8 text-[#B4912B] animate-spin mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching latest inquiries...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : inquiries.length > 0 ? (
                                    inquiries.map((item) => {
                                        const sc = STATUS_CFG[item.status] || STATUS_CFG.new;
                                        return (
                                            <motion.tr
                                                layout
                                                key={item._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="group border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-[#B4912B]/10 flex items-center justify-center border border-[#B4912B]/20 rounded-xl text-sm font-black text-[#B4912B] shrink-0">
                                                            {item.name ? item.name[0].toUpperCase() : 'L'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{item.name}</div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                                {item.salonName || 'Platform Lead'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {item.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {item.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-xs text-slate-650 font-medium line-clamp-2 max-w-[250px] leading-relaxed">
                                                        {item.message}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${sc.cls}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {item.status === 'new' && (
                                                            <button
                                                                onClick={() => updateStatus(item._id, 'contacted')}
                                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                                title="Mark as Contacted"
                                                            >
                                                                <CheckCircle2 className="w-4.5 h-4.5" />
                                                            </button>
                                                        )}
                                                        {item.status !== 'archived' && (
                                                            <button
                                                                onClick={() => updateStatus(item._id, 'archived')}
                                                                className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                                                                title="Archive Lead"
                                                            >
                                                                <XCircle className="w-4.5 h-4.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteInquiry(item._id)}
                                                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                            title="Delete Inquiry"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr key="empty-row">
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                                                    <MessageSquare className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">Zero Leads Found</h3>
                                                <p className="text-xs text-slate-500 max-w-[280px] mt-1 font-semibold uppercase tracking-wider">
                                                    Adjust filters or search parameters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
