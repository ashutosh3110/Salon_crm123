import React, { useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    Scissors,
    Clock,
    IndianRupee,
    MoreVertical,
    Eye,
    Edit2,
    EyeOff,
    Tag,
    Building2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ServiceList({ services = [], onDelete, onToggleStatus }) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', ...new Set(services.map(s => s.category))];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search services by name..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="px-3 py-2 rounded-xl text-sm font-bold text-text-secondary bg-slate-50 border border-border focus:outline-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat} Category</option>)}
                    </select>

                    <button
                        onClick={() => navigate('/admin/services/new')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active"
                    >
                        <Plus className="w-4 h-4" />
                        Add Service
                    </button>
                </div>
            </div>

            {/* Service Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Service Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Duration</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center text-rose-400">GST %</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Outlets</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Scissors className="w-8 h-8" />
                                            <p className="text-sm font-bold">No services found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                                    <Scissors className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{service.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tighter">
                                                <Tag className="w-2.5 h-2.5" />
                                                {service.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary">
                                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                                {service.duration} min
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-text">₹{service.price}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-bold text-rose-500/60">
                                            {service.gst}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-tighter">
                                                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                                                {service.outlets}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => onToggleStatus?.(service.id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all active:scale-90 ${service.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                                                        }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    {service.status}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all" title="View Detail">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/services/edit/${service.id}`)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete?.(service.id)}
                                                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-rose-500 transition-all"
                                                    title="Delete Service"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-text transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
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
