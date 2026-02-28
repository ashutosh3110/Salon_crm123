import React, { useState } from 'react';
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
    const { feedbacks, archiveFeedback } = useBusiness();
    const [ratingFilter, setRatingFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const filteredFeedbacks = feedbacks
        .filter(f => f.status === 'active')
        .filter(fb => {
            if (ratingFilter === 'all') return true;
            if (ratingFilter === 'positive') return fb.rating >= 4;
            if (ratingFilter === 'neutral') return fb.rating === 3;
            if (ratingFilter === 'negative') return fb.rating <= 2;
            return true;
        })
        .filter(fb => {
            const searchLower = searchTerm.toLowerCase();
            return fb.customer.toLowerCase().includes(searchLower) ||
                fb.staff.toLowerCase().includes(searchLower) ||
                fb.service.toLowerCase().includes(searchLower) ||
                fb.comment.toLowerCase().includes(searchLower);
        });

    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex items-center gap-6">
                    <div className="p-3 bg-yellow-50 rounded-xl">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-text">4.7</h4>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Average Rating</p>
                    </div>
                </div>
                <div className="bg-white border border-border p-5 rounded-2xl shadow-sm flex items-center gap-6">
                    <div className="p-3 bg-green-50 rounded-xl">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-text">92%</h4>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Positive Feedback</p>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
            </div>

            {/* Feedback Feed */}
            <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((fb) => (
                        <div
                            key={fb.id}
                            className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            {fb.rating <= 2 && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                            )}

                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                {/* Left: Customer & Rating */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-text-muted font-bold text-lg border border-border">
                                        {fb.customer.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-base font-bold text-text">{fb.customer}</h4>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-[11px] font-bold text-yellow-600">{fb.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-text-secondary font-medium">"{fb.comment}"</p>
                                    </div>
                                </div>

                                {/* Right: Visit Details */}
                                <div className="flex flex-col md:items-end gap-2 min-w-[200px]">
                                    <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-lg border border-border">
                                        <Scissors className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{fb.service} by {fb.staff}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[10px] font-semibold">{new Date(fb.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Action Footer */}
                            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Internal ID: #FB-{fb.id}</span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => archiveFeedback(fb.id)}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-border text-text-muted hover:bg-surface transition-all uppercase tracking-widest"
                                    >
                                        Archive
                                    </button>
                                    <button
                                        onClick={() => setSelectedFeedback(fb)}
                                        className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-white hover:shadow-lg transition-all uppercase tracking-widest flex items-center gap-2"
                                    >
                                        View Details
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
                                {selectedFeedback.customer.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-1">{selectedFeedback.customer}</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60">Verified Experience Protocol</p>
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

                            <div className="grid grid-cols-2 gap-8 py-6 border-y border-border">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Service Context</label>
                                    <div className="font-extrabold text-text text-sm flex items-center gap-3 uppercase tracking-tight">
                                        <div className="p-2 bg-text text-white"><Scissors className="w-3.5 h-3.5" /></div>
                                        {selectedFeedback.service}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Assigned Personnel</label>
                                    <div className="font-extrabold text-text text-sm flex items-center gap-3 uppercase tracking-tight">
                                        <div className="p-2 bg-text text-white"><User className="w-3.5 h-3.5" /></div>
                                        {selectedFeedback.staff}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        archiveFeedback(selectedFeedback.id);
                                        setSelectedFeedback(null);
                                    }}
                                    className="flex-1 py-5 border border-border bg-white text-text-muted font-black text-[11px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-[0.98]"
                                >
                                    ARCHIVE RECORD
                                </button>
                                <button
                                    onClick={() => alert('Initiating Communication Protocol...')}
                                    className="flex-1 py-5 bg-text text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-text/20 hover:bg-primary transition-all active:scale-[0.98]"
                                >
                                    RESPOND TO CLIENT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
