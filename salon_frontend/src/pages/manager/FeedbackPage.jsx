import { useState } from 'react';
import {
    Star, MessageSquare, ThumbsUp, ThumbsDown,
    Filter, Search, ArrowRight, User,
    Calendar, TrendingUp, TrendingDown, MoreVertical, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const sentimentStats = [
    { label: 'Avg Rating', value: '4.8', sub: 'Last 30 days', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Positive', value: '94%', sub: 'Customer satisfaction', icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Negative', value: '2%', sub: 'Issues to address', icon: ThumbsDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Responses', value: '88%', sub: 'Reponse rate', icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
];

const INITIAL_FEEDBACK = [
    { id: 1, customer: 'Deepak Rao', rating: 5, comment: 'Exceptional service! Ananya did a great job with my hair. The ambiance was very relaxing.', date: '2 hours ago', service: 'Elite Haircut', staff: 'Ananya Sharma', response: '' },
    { id: 2, customer: 'Meera Kapoor', rating: 4, comment: 'Loved the facial. Docking 1 star because the waiting time was slightly more than expected.', date: '5 hours ago', service: 'Hydra Facial', staff: 'Priya Das', response: '' },
    { id: 3, customer: 'Arjun Malhotra', rating: 5, comment: 'Always a pleasure visiting this salon. Team is very professional.', date: 'Yesterday', service: 'Beard Grooming', staff: 'Vikas Singh', response: '' },
    { id: 4, customer: 'Sneha Gupta', rating: 2, comment: 'The receptionist was a bit rude. Service was okay but experience can be improved.', date: 'Yesterday', service: 'Nail Art', staff: 'Pooja Hegde', response: '' },
];

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState(INITIAL_FEEDBACK);
    const [searchTerm, setSearchTerm] = useState('');
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseDraft, setResponseDraft] = useState('');

    const filteredFeedback = feedback.filter(fb =>
        fb.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.staff.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendResponse = (id) => {
        setFeedback(feedback.map(fb => fb.id === id ? { ...fb, response: responseDraft } : fb));
        setRespondingTo(null);
        setResponseDraft('');
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Customer Sentiment</h1>
                    <p className="text-sm text-text-muted font-medium">Analyze and respond to customer feedback</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {sentimentStats.map((s) => (
                    <div key={s.label} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <s.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${s.color === 'text-rose-500' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {s.color === 'text-rose-500' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {s.color === 'text-rose-500' ? '-2%' : '+5%'}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={typeof s.value === 'string' ? parseFloat(s.value.replace(/[₹%,]/g, '')) : s.value}
                                        suffix={typeof s.value === 'string' && s.value.includes('%') ? '%' : (s.label === 'Avg Rating' ? '/5' : '')}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.color === 'text-rose-500' ? "text-rose-400" : "text-emerald-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Filters */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-none border border-border/60 p-5 shadow-none space-y-5">
                        <h2 className="text-xs font-black text-text uppercase tracking-widest px-1">Filter By</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">Rating Range</label>
                                <div className="space-y-1.5">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <label key={star} className="flex items-center gap-3 px-3 py-1.5 rounded-none hover:bg-surface-alt cursor-pointer transition-colors group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-border/40 text-primary focus:ring-primary/20" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-bold text-text-secondary">{star}</span>
                                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button className="w-full py-2.5 bg-primary text-white rounded-none text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-none border border-border/60 p-5 shadow-none">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <h2 className="text-[10px] font-black text-text uppercase tracking-widest">Growth Tip</h2>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed font-medium">Replying to negative reviews within 24 hours increases revisit rate by 40%.</p>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white border border-border/60 rounded-none p-3 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search comments or customers..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredFeedback.map((fb) => (
                            <div key={fb.id} className="bg-white rounded-none border border-border/60 p-6 shadow-none hover:border-primary/20 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-surface-alt rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-none bg-background flex items-center justify-center text-text-secondary font-black border border-border/20 text-sm">
                                            {fb.customer.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-base font-black text-text">{fb.customer}</h3>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-text-muted opacity-20'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{fb.date}</span>
                                            </div>
                                            <p className="text-sm font-medium text-text-secondary leading-relaxed mb-4 italic">
                                                "{fb.comment}"
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-background border border-border/60 text-text-muted rounded-none uppercase tracking-widest">{fb.service}</span>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-primary/5 border border-primary/20 text-primary rounded-none uppercase tracking-widest">by {fb.staff}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 sm:w-32 text-center">
                                        {fb.response ? (
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-none">
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Responded</span>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setRespondingTo(fb.id);
                                                        setResponseDraft('');
                                                    }}
                                                    className="w-full py-2 bg-primary text-white rounded-none text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                                                >
                                                    Respond
                                                </button>
                                                <button className="w-full py-2 bg-white border border-border/60 text-text-muted rounded-none text-[11px] font-black uppercase tracking-widest hover:text-text-secondary transition-all">
                                                    Hide Impact
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {respondingTo === fb.id && (
                                    <div className="mt-6 pt-6 border-t border-border/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Your Response</label>
                                            <textarea
                                                autoFocus
                                                className="w-full px-4 py-3 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors min-h-[100px] resize-none"
                                                placeholder="Write your professional response here..."
                                                value={responseDraft}
                                                onChange={(e) => setResponseDraft(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setRespondingTo(null)}
                                                className="px-6 py-2 bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                            >
                                                Discard
                                            </button>
                                            <button
                                                onClick={() => handleSendResponse(fb.id)}
                                                disabled={!responseDraft.trim()}
                                                className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 disabled:opacity-50 transition-all"
                                            >
                                                Transmit Response
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {fb.response && (
                                    <div className="mt-6 pt-6 border-t border-border/40">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 text-[10px]">
                                                M
                                            </div>
                                            <div className="flex-1 bg-surface-alt/50 p-4 border border-border/20 rounded-none">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 items-center flex gap-2">
                                                    Management Response <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                </p>
                                                <p className="text-sm font-medium text-text-secondary italic">"{fb.response}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="flex items-center gap-2 px-6 py-2 bg-white border border-border/60 rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-primary transition-all group">
                            Load Earlier Reviews <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
