import {
    Star, MessageSquare, ThumbsUp, ThumbsDown,
    Filter, Search, ArrowRight, User,
    Calendar, TrendingUp, TrendingDown, MoreVertical
} from 'lucide-react';

const sentimentStats = [
    { label: 'Avg Rating', value: '4.8', sub: 'Last 30 days', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Positive', value: '94%', sub: 'Customer satisfaction', icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Negative', value: '2%', sub: 'Issues to address', icon: ThumbsDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Responses', value: '88%', sub: 'Reponse rate', icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
];

const mockFeedback = [
    { id: 1, customer: 'Deepak Rao', rating: 5, comment: 'Exceptional service! Ananya did a great job with my hair. The ambiance was very relaxing.', date: '2 hours ago', service: 'Elite Haircut', staff: 'Ananya Sharma' },
    { id: 2, customer: 'Meera Kapoor', rating: 4, comment: 'Loved the facial. Docking 1 star because the waiting time was slightly more than expected.', date: '5 hours ago', service: 'Hydra Facial', staff: 'Priya Das' },
    { id: 3, customer: 'Arjun Malhotra', rating: 5, comment: 'Always a pleasure visiting this salon. Team is very professional.', date: 'Yesterday', service: 'Beard Grooming', staff: 'Vikas Singh' },
    { id: 4, customer: 'Sneha Gupta', rating: 2, comment: 'The receptionist was a bit rude. Service was okay but experience can be improved.', date: 'Yesterday', service: 'Nail Art', staff: 'Pooja Hegde' },
];

export default function FeedbackPage() {
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
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-black text-text leading-none">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Filters */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-surface rounded-3xl border border-border/40 p-5 shadow-sm space-y-5">
                        <h2 className="text-xs font-black text-text uppercase tracking-widest px-1">Filter By</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">Rating Range</label>
                                <div className="space-y-1.5">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <label key={star} className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-surface-alt cursor-pointer transition-colors group">
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
                                <button className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-surface to-surface-alt rounded-3xl border border-border/40 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <h2 className="text-[10px] font-black text-text uppercase tracking-widest">Growth Tip</h2>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed font-medium">Replying to negative reviews within 24 hours increases revisit rate by 40%.</p>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-surface border border-border/40 rounded-3xl p-3 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search comments or customers..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {mockFeedback.map((fb) => (
                            <div key={fb.id} className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm hover:border-primary/20 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-surface-alt rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-alt flex items-center justify-center text-text-secondary font-black border border-border/5 text-sm">
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
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-background border border-border/10 text-text-muted rounded-md uppercase tracking-widest">{fb.service}</span>
                                                <span className="text-[10px] font-black px-2 py-0.5 bg-primary/5 border border-primary/10 text-primary rounded-md uppercase tracking-widest">by {fb.staff}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0 sm:w-32">
                                        <button className="w-full py-2 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
                                            Respond
                                        </button>
                                        <button className="w-full py-2 bg-background border border-border/40 text-text-muted rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-text-secondary transition-all">
                                            Hide Impact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        <button className="flex items-center gap-2 px-6 py-2 bg-surface border border-border/40 rounded-xl text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:text-primary transition-all group">
                            Load Earlier Reviews <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
