import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Search, Filter, Calendar,
    MoreVertical, User, Mail, Phone, Building2,
    CheckCircle2, Clock, Trash2, ArrowUpRight, Loader2
} from 'lucide-react';
import mockApi from '../../services/mock/mockApi';
import api from '../../services/api';

export default function SAInquiriesPage() {
    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inquiries');
            let data = response.data.data || [];
            
            // Client-side filtering as the simple backend doesn't handle all params yet
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [filterStatus]);

    // Handle search with a small delay or on enter
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchInquiries();
        }
    };

    const filteredInquiries = inquiries;

    const updateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/inquiries/${id}`, { status: newStatus });
            setInquiries(inquiries.map(item =>
                item._id === id ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteInquiry = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
        try {
            await api.delete(`/inquiries/${id}`);
            setInquiries(inquiries.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Inquiries</h1>
                    <p className="text-text-muted text-sm font-medium">Manage incoming salon leads and partnership requests.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-border px-3 py-1.5 gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {inquiries.filter(i => i.status === 'new').length} Pending
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white border border-border p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search by name, salon or email..."
                        value={searchQuery}
                        onKeyDown={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm font-medium border-none focus:ring-1 focus:ring-primary/20"
                    />
                    <button 
                        onClick={fetchInquiries}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1"
                    >
                        GO
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-surface border border-border px-4 py-2 gap-3 min-w-[160px]">
                        <Filter className="w-4 h-4 text-text-muted" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-sm font-bold border-none p-0 focus:ring-0 cursor-pointer w-full uppercase"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface border-b border-border">
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Sender / Salon</th>
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Contact Info</th>
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Message Preview</th>
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Date</th>
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Status</th>
                            <th className="px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-[0.15em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                            <p className="text-sm text-text-muted font-medium italic">Fetching latest inquiries...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInquiries.length > 0 ? (
                                filteredInquiries.map((item) => (
                                    <motion.tr
                                        layout
                                        key={item._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group border-b border-border hover:bg-surface/50 transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/5 flex items-center justify-center border border-primary/10">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-text truncate max-w-[180px]">{item.name}</div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium mt-0.5">
                                                        <Building2 className="w-3 h-3 text-text-muted/60" />
                                                        {item.salonName || 'Platform Lead'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                                                    <Mail className="w-3 h-3" /> {item.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                                                    <Phone className="w-3 h-3" /> {item.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs text-text-secondary font-medium line-clamp-2 max-w-[250px] leading-relaxed">
                                                {item.message}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`px-2 py-1 rounded-none text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5
                                                ${item.status === 'new' ? 'bg-amber-100 text-amber-700' :
                                                    item.status === 'contacted' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
                                                {item.status === 'new' && (
                                                    <button
                                                        onClick={() => updateStatus(item._id, 'contacted')}
                                                        className="p-2 hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                        title="Mark as Contacted"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteInquiry(item._id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                                                    title="Delete Inquiry"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-surface flex items-center justify-center mb-4">
                                                <MessageSquare className="w-8 h-8 text-text-muted/30" strokeWidth={1} />
                                            </div>
                                            <h3 className="text-lg font-black text-text">Zero Leads found</h3>
                                            <p className="text-sm text-text-muted max-w-[280px] mt-1 font-medium italic">
                                                Try adjusting your filters or search terms.
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
    );
}
