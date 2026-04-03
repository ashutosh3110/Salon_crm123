import React, { useEffect, useState } from 'react';
import {
    Star,
    MessageCircle,
    User,
    Scissors,
    Calendar,
    TrendingDown,
    Filter,
    ArrowUpRight,
    Search,
    X
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

export default function FeedbackList() {
    const { feedbacks, archiveFeedback, fetchFeedbacks, updateFeedback } = useBusiness();
    const [ratingFilter, setRatingFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Ensure backend data is loaded immediately when admin opens the feedback tab.
    useEffect(() => {
        if (typeof fetchFeedbacks === 'function') {
            fetchFeedbacks().catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync response state when modal opens
    useEffect(() => {
        if (selectedFeedback) {
            setAdminResponse(selectedFeedback.response || '');
        }
    }, [selectedFeedback]);

    const handleUpdate = async (id, data) => {
        setIsSaving(true);
        try {
            await updateFeedback(id, data);
            setSelectedFeedback(null);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update feedback');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredFeedbacks = feedbacks
        .filter(f => f.status !== 'Archived')
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
                (fb.staffName?.toLowerCase() || '').includes(searchLower) ||
                (fb.service?.toLowerCase() || '').includes(searchLower) ||
                (fb.comment?.toLowerCase() || '').includes(searchLower);
        });

    const activeFeedbacks = feedbacks.filter(f => f.status !== 'Archived');
    const avgRating = activeFeedbacks.length
        ? (activeFeedbacks.reduce((sum, f) => sum + Number(f.rating || 0), 0) / activeFeedbacks.length).toFixed(1)
        : '0.0';
    const positivePct = activeFeedbacks.length
        ? Math.round((activeFeedbacks.filter(f => Number(f.rating || 0) >= 4).length / activeFeedbacks.length) * 100)
        : 0;

    return (
        <div className="p-4 space-y-4 slide-right animate-fadeIn">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-text">{avgRating}</h4>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Average Rating</p>
                    </div>
                </div>
                <div className="bg-white border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-text">{positivePct}%</h4>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Positive Feedback</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center bg-surface p-1 rounded-xl border border-border w-full md:w-auto">
                    {['all', 'positive', 'neutral', 'negative'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setRatingFilter(type)}
                            className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${ratingFilter === type
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search customer, staff or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
            </div>

            {/* Feedback Feed */}
            <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((fb) => (
                        <div
                            key={fb.id}
                            className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            {fb.rating <= 2 && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                            )}

                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                {/* Left: Customer & Rating */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-text-muted font-bold text-lg border border-border">
                                        {(fb.customerName || 'U').charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-base font-bold text-text">{fb.customerName}</h4>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-[11px] font-bold text-yellow-600">{fb.rating}</span>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${fb.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                {fb.status === 'Resolved' ? 'Published' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary font-medium">"{fb.comment}"</p>
                                    </div>
                                </div>

                                {/* Right: Visit Details */}
                                <div className="flex flex-col md:items-end gap-2 min-w-[200px]">
                                    <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-lg border border-border">
                                        <Scissors className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{fb.service} by {fb.staffName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px] font-semibold">{new Date(fb.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {Array.isArray(fb.images) && fb.images.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                                    {fb.images.slice(0, 5).map((imgUrl, idx) => (
                                        <img
                                            key={`${fb.id}-img-${idx}`}
                                            src={imgUrl}
                                            alt="Feedback"
                                            className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Quick Action Footer */}
                            <div className="mt-4 pt-3 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Feedback #{fb.id}</span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => archiveFeedback(fb.id)}
                                        className="px-3 py-1.5 rounded-lg text-[9px] font-bold border border-border text-text-muted hover:bg-surface transition-all uppercase tracking-widest"
                                    >
                                        Archive
                                    </button>
                                    <button
                                        onClick={() => setSelectedFeedback(fb)}
                                        className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-white hover:shadow-lg transition-all uppercase tracking-widest flex items-center gap-2"
                                    >
                                        Moderate
                                        <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-surface border border-dashed border-border rounded-2xl">
                        <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No matching feedback found</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-20 overflow-y-auto no-scrollbar">
                    <div className="bg-white rounded-none w-full max-w-xl p-10 shadow-2xl relative animate-in slide-in-from-top-4 duration-300 flex flex-col my-8">
                        <button
                            onClick={() => setSelectedFeedback(null)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-border">
                            <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center text-primary font-black text-3xl shadow-inner uppercase">
                                {selectedFeedback.customerName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-1">{selectedFeedback.customerName}</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Customer feedback</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-1.5 bg-surface p-4 border border-border inline-flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= selectedFeedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`}
                                    />
                                ))}
                                <span className="ml-3 text-sm font-black text-text uppercase tracking-widest">{selectedFeedback.rating} / 5.0</span>
                            </div>

                            <div className="p-8 bg-surface border-l-4 border-primary text-text font-bold text-lg leading-relaxed italic">
                                "{selectedFeedback.comment}"
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Add Response (Visible to Client)</label>
                                <textarea
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="w-full p-4 border border-border bg-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8 py-6 border-y border-border">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Service</label>
                                    <div className="font-extrabold text-text text-sm flex items-center gap-3 uppercase tracking-tight">
                                        <div className="p-2 bg-text text-white"><Scissors className="w-3.5 h-3.5" /></div>
                                        {selectedFeedback.service}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Assigned Personnel</label>
                                    <div className="font-extrabold text-text text-sm flex items-center gap-3 uppercase tracking-tight">
                                        <div className="p-2 bg-text text-white"><User className="w-3.5 h-3.5" /></div>
                                        {selectedFeedback.staffName}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => handleUpdate(selectedFeedback.id, { status: 'Archived' })}
                                    disabled={isSaving}
                                    className="flex-1 py-5 border border-border bg-white text-text-muted font-black text-[11px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-[0.98]"
                                >
                                    Archive
                                </button>
                                <button
                                    onClick={() => handleUpdate(selectedFeedback.id, { response: adminResponse, status: 'Resolved' })}
                                    disabled={isSaving}
                                    className="flex-[2] py-5 bg-text text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-text/20 hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {isSaving ? 'Processing...' : (selectedFeedback.status === 'Resolved' ? 'UPDATE RESPONSE' : 'APPROVE & PUBLISH')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
