import React, { useEffect, useState } from 'react';
import {
    Star,
    MessageCircle,
    User,
    Scissors,
    Calendar,
    Eye,
    CheckCircle2,
    XCircle,
    Search,
    X,
    Phone,
    Filter
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

export default function FeedbackList() {
    const { feedbacks, archiveFeedback, fetchFeedbacks, updateFeedback } = useBusiness();
    const [ratingFilter, setRatingFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (typeof fetchFeedbacks === 'function') {
            fetchFeedbacks(null, null, 'all').catch(() => { });
        }
    }, [fetchFeedbacks]);

    useEffect(() => {
        if (selectedFeedback) {
            setAdminResponse(selectedFeedback.response || '');
        }
    }, [selectedFeedback]);

    const handleStatusUpdate = async (id, status) => {
        setIsSaving(true);
        try {
            await updateFeedback(id, { status, response: adminResponse });
            setSelectedFeedback(null);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredFeedbacks = feedbacks
        .filter(f => f.status !== 'Archived')
        .filter(fb => {
            if (statusFilter === 'all') return true;
            return fb.status?.toLowerCase() === statusFilter.toLowerCase();
        })
        .filter(fb => {
            if (ratingFilter === 'all') return true;
            if (ratingFilter === 'positive') return fb.rating >= 4;
            if (ratingFilter === 'neutral') return fb.rating === 3;
            if (ratingFilter === 'negative') return fb.rating <= 2;
            return true;
        })
        .filter(fb => {
            const searchLower = searchTerm.toLowerCase();
            return (fb.customerName?.toLowerCase() || '').includes(searchLower) ||
                (fb.comment?.toLowerCase() || '').includes(searchLower) ||
                (fb.outletId?.name?.toLowerCase() || '').includes(searchLower) ||
                (fb.customerId?.phone || '').includes(searchLower);
        });

    return (
        <div className="p-4 md:p-6 space-y-6 slide-right animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    {['all', 'pending', 'approved', 'rejected'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setStatusFilter(type)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === type
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface text-text-muted hover:bg-border'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search name, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="flex bg-surface p-1 rounded-xl border border-border">
                        {['all', 'positive', 'negative'].map(r => (
                            <button
                                key={r}
                                onClick={() => setRatingFilter(r)}
                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${ratingFilter === r ? 'bg-white text-primary shadow-sm' : 'text-text-muted'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Customer Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Rating</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Outlet / Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Feedback</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredFeedbacks.length > 0 ? (
                                filteredFeedbacks.map((fb) => (
                                    <tr key={fb._id || fb.id} className="hover:bg-surface/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-sm border border-primary/10">
                                                    {(fb.customerId?.name || fb.customerName || 'U').charAt(0)}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-bold text-text leading-none">{fb.customerId?.name || fb.customerName}</div>
                                                    <div className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                                                        <Phone size={10} /> {fb.customerId?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-50/50 rounded-xl w-fit mx-auto border border-yellow-100">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-black text-yellow-700">{fb.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <div className="text-[10px] font-black text-text uppercase tracking-tight">{fb.outletId?.name || 'Main Outlet'}</div>
                                                <div className="text-[9px] text-text-muted font-bold flex items-center gap-1">
                                                    <Calendar size={10} /> {new Date(fb.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs text-text-secondary font-medium max-w-[240px] line-clamp-1 italic bg-surface/50 p-2 rounded-lg border border-border/50">
                                                "{fb.comment}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => setSelectedFeedback(fb)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ml-auto ${fb.status === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-surface text-text-muted hover:bg-border'}`}
                                            >
                                                {fb.status === 'Pending' ? 'Moderate' : 'View'}
                                                <Eye size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <MessageCircle size={40} className="mx-auto text-text-muted opacity-20 mb-4" />
                                            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">No reviews match your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Review Moderation</h3>
                            <button onClick={() => setSelectedFeedback(null)} className="p-2 hover:bg-border rounded-xl transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 text-center">
                            <div className="inline-flex w-20 h-20 rounded-3xl bg-primary text-white items-center justify-center text-3xl font-black shadow-2xl shadow-primary/30 mx-auto">
                                {(selectedFeedback.customerId?.name || selectedFeedback.customerName).charAt(0)}
                            </div>
                            
                            <div>
                                <h4 className="text-2xl font-bold text-text">{selectedFeedback.customerId?.name || selectedFeedback.customerName}</h4>
                                <p className="text-xs text-text-muted font-bold flex items-center justify-center gap-2 mt-1">
                                    <Phone size={12} /> {selectedFeedback.customerId?.phone || 'PRIVATE NUMBER'}
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-1 text-yellow-500 py-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={20} fill={s <= selectedFeedback.rating ? 'currentColor' : 'none'} className={s <= selectedFeedback.rating ? '' : 'text-slate-200'} />
                                ))}
                            </div>

                            <div className="p-6 bg-surface rounded-2xl italic font-medium text-text-secondary leading-relaxed relative">
                                <div className="absolute -top-3 left-6 bg-white px-2 text-[8px] font-black text-primary uppercase tracking-widest border border-border">Message</div>
                                "{selectedFeedback.comment}"
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    onClick={() => handleStatusUpdate(selectedFeedback._id || selectedFeedback.id, 'Rejected')}
                                    disabled={isSaving}
                                    className="flex-1 py-4 rounded-2xl border border-border bg-white text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedFeedback._id || selectedFeedback.id, 'Approved')}
                                    disabled={isSaving}
                                    className="flex-1 py-4 rounded-2xl bg-text text-white text-xs font-black uppercase tracking-widest hover:bg-primary shadow-xl shadow-text/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <CheckCircle2 size={16} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
