import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Search, Filter, Calendar,
    MoreVertical, User, Mail, Phone, Building2,
    CheckCircle2, Clock, Trash2, ArrowUpRight
} from 'lucide-react';

export default function SAInquiriesPage() {
    const [inquiries, setInquiries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('wapixo_inquiries') || '[]');
        setInquiries(stored);
    }, []);

    const filteredInquiries = inquiries.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.salonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const updateStatus = (id, newStatus) => {
        const updated = inquiries.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        );
        setInquiries(updated);
        localStorage.setItem('wapixo_inquiries', JSON.stringify(updated));
    };

    const deleteInquiry = (id) => {
        const updated = inquiries.filter(item => item.id !== id);
        setInquiries(updated);
        localStorage.setItem('wapixo_inquiries', JSON.stringify(updated));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text italic">Inquiries</h1>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface text-sm font-medium border-none focus:ring-1 focus:ring-primary/20"
                    />
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
                            {filteredInquiries.length > 0 ? (
                                filteredInquiries.map((item) => (
                                    <motion.tr
                                        layout
                                        key={item.id}
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
                                                        {item.salonName}
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
                                                {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`px-2 py-1 rounded-none text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5
                                                ${item.status === 'new' ? 'bg-amber-100 text-amber-700' :
                                                    item.status === 'contacted' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-gray-100 text-gray-700'}`}>
                                                {item.status === 'new' && <Clock className="w-3 h-3" />}
                                                {item.status === 'contacted' && <CheckCircle2 className="w-3 h-3" />}
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.status === 'new' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'contacted')}
                                                        className="p-2 hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                        title="Mark as Contacted"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteInquiry(item.id)}
                                                    className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                                                    title="Delete Inquiry"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-primary/5 text-primary transition-colors" title="View Details">
                                                    <ArrowUpRight className="w-4 h-4" />
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
                                            <h3 className="text-lg font-black text-text italic">Zero Leads found</h3>
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
