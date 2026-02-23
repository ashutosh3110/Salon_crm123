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
    Search
} from 'lucide-react';

const MOCK_FEEDBACK = [
    { id: '1', customer: 'Aryan Khan', rating: 5, comment: 'Amazing haircut as always! Zoya is very detailed and understands exactly what I want.', service: 'Haircut', staff: 'Zoya Khan', date: '2024-03-22' },
    { id: '2', customer: 'Ishita Sharma', rating: 2, comment: 'Waiting time was too long even with an appointment. Service was okay but not exceptional.', service: 'Manicure', staff: 'Sneha Rao', date: '2024-03-21' },
    { id: '3', customer: 'Rahul Verma', rating: 4, comment: 'Good experience, clean place. Will come back.', service: 'Shave', staff: 'Haris Ali', date: '2024-03-20' },
    { id: '4', customer: 'Simran Jit', rating: 5, comment: 'The new color looks stunning. Best salon in town!', service: 'Hair Coloring', staff: 'Mehak Rizvi', date: '2024-03-19' },
    { id: '5', customer: 'Suresh Patil', rating: 3, comment: 'Average service. The staff seemed a bit rushed.', service: 'Pedicure', staff: 'Zoya Khan', date: '2024-03-18' },
];

export default function FeedbackList() {
    const [ratingFilter, setRatingFilter] = useState('all');

    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="bg-primary p-5 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-6">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-white">3</h4>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Pending Issues</p>
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
                        placeholder="Search staff or service..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
            </div>

            {/* Feedback Feed */}
            <div className="space-y-4">
                {MOCK_FEEDBACK.map((fb) => (
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
                                    <p className="text-sm text-text-secondary font-medium italic">"{fb.comment}"</p>
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
                                <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-border text-text-muted hover:bg-surface transition-all uppercase tracking-widest">Archive</button>
                                <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-white hover:shadow-lg transition-all uppercase tracking-widest flex items-center gap-2">
                                    View Details
                                    <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
