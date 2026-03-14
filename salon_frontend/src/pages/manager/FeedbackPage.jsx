import { useState, useMemo } from 'react';
import {
    Star, MessageSquare, ThumbsUp, ThumbsDown,
    Filter, Search, ArrowRight, User,
    Calendar, TrendingUp, TrendingDown, MoreVertical, 
    ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle,
    UserCircle, Hash, Clock, Send, ShieldCheck, Share2, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useBusiness } from '../../contexts/BusinessContext';

export default function FeedbackPage() {
    const { feedbacks, updateFeedback } = useBusiness();
    
    // Stats Calculation
    const stats = useMemo(() => {
        const total = feedbacks.length || 1;
        const avg = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total;
        const positive = feedbacks.filter(f => f.sentiment === 'Positive').length;
        const resRate = feedbacks.filter(f => f.response).length;
        const nps = ((positive - feedbacks.filter(f => f.sentiment === 'Negative').length) / total) * 100;

        return [
            { label: 'Avg Rating', value: avg.toFixed(1), sub: 'Overall Lifetime', icon: Star, color: 'text-amber-500', trend: '+0.1' },
            { label: 'Sentiment', value: Math.round((positive / total) * 100), sub: 'Happiness Index', icon: ThumbsUp, color: 'text-emerald-500', trend: '+2%' },
            { label: 'Response', value: Math.round((resRate / total) * 100), sub: 'Resolution Rate', icon: MessageSquare, color: 'text-primary', trend: '+5%' },
            { label: 'NPS', value: Math.round(nps), sub: 'Promoter Score', icon: ShieldCheck, color: 'text-violet-500', trend: '+8' },
        ];
    }, [feedbacks]);

    const [searchTerm, setSearchTerm] = useState('');
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseDraft, setResponseDraft] = useState('');
    
    // Filters
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Critical'
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedSentiment, setSelectedSentiment] = useState('All');

    const filteredFeedback = useMemo(() => {
        return feedbacks.filter(fb => {
            const matchesSearch = 
                (fb.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (fb.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (fb.staffName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesRating = selectedRating === 'All' || fb.rating === parseInt(selectedRating);
            const matchesSentiment = selectedSentiment === 'All' || fb.sentiment === selectedSentiment;
            
            const matchesTab = 
                activeTab === 'All' || 
                (activeTab === 'Pending' && !fb.response) ||
                (activeTab === 'Critical' && fb.rating <= 2);

            return matchesSearch && matchesRating && matchesSentiment && matchesTab;
        });
    }, [feedbacks, searchTerm, selectedRating, selectedSentiment, activeTab]);

    const handleSendResponse = (id) => {
        updateFeedback(id, { response: responseDraft, status: 'Resolved' });
        setRespondingTo(null);
        setResponseDraft('');
    };

    const getSentimentColor = (sentiment) => {
        switch(sentiment) {
            case 'Positive': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Negative': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    return (
        <div className="space-y-6 pb-12 selection:bg-primary/30">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    <div className="absolute -left-4 top-0 w-1 h-full bg-primary/40 rounded-full" />
                    <h1 className="text-3xl font-black text-text uppercase tracking-tighter leading-none mb-1">
                        Sentiment <span className="text-primary italic">Analytica</span>
                    </h1>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Real-time feedback processing active
                    </p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-surface border border-border shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Live Status</p>
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Optimized</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={s.label} 
                        className="bg-surface p-4 border border-border/60 hover:border-primary/40 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-none ${s.color.replace('text', 'bg').replace('500', '500/10')} border border-current/20`}>
                                        <s.icon className={`w-4 h-4 ${s.color}`} />
                                    </div>
                                    <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{s.label}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase">
                                    <ArrowUpRight className="w-3 h-3" /> {s.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-black text-text tracking-tighter">
                                    <AnimatedCounter 
                                        value={typeof s.value === 'string' ? parseFloat(s.value) : s.value} 
                                        suffix={s.label === 'Avg Rating' ? '' : (s.label === 'NPS' ? '' : '%')}
                                    />
                                    {s.label === 'Avg Rating' && <span className="text-lg text-text-muted font-bold ml-1">/5</span>}
                                </h3>
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter text-right leading-tight">
                                    {s.sub}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Command Center */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Side Navigation / Filters */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-surface border border-border/80 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Filter className="w-3 h-3 text-primary" /> Filter Matrix
                            </h2>
                            <button 
                                onClick={() => {
                                    setSelectedRating('All');
                                    setSelectedSentiment('All');
                                    setActiveTab('All');
                                }}
                                className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Priority View</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['All', 'Pending', 'Critical'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${
                                                activeTab === tab 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                                : 'bg-white text-text-muted border-border/60 hover:border-primary/40'
                                            } border`}
                                        >
                                            {tab} Records
                                            {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Rating Bracket</label>
                                <select 
                                    value={selectedRating}
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-border/60 text-xs font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="All">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sentiment</label>
                                <div className="flex gap-2">
                                    {['Positive', 'Neutral', 'Negative'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSentiment(s)}
                                            className={`flex-1 py-2 text-[8px] font-black uppercase tracking-tighter border transition-all ${
                                                selectedSentiment === s 
                                                ? 'bg-text text-white border-text' 
                                                : 'bg-white text-text-muted border-border/60 hover:border-text/40'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border-l-4 border-l-amber-500 border border-border/60 p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <h2 className="text-[10px] font-black text-text uppercase tracking-widest">Protocol Tip</h2>
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                            <span className="font-black text-text">Proactive Response:</span> Addressing a 1-star review within 2 hours increases recovery chance by <span className="text-emerald-500 font-black underline">85%</span>.
                        </p>
                    </div>
                </div>

                {/* Feedback Ledger */}
                <div className="lg:col-span-9 space-y-5">
                    {/* Search & Bulk Actions */}
                    <div className="bg-surface border border-border/80 p-3 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="IDENTIFY CUSTOMER, STAFF OR COMMENT KEYWORDS..."
                                className="w-full pl-12 pr-4 py-2 bg-white border border-border/60 rounded-none text-xs font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-6 py-2 bg-white border border-border/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                Export .CSV
                            </button>
                        </div>
                    </div>

                    {/* Result Counter */}
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
                            Displaying <span className="text-primary">{filteredFeedback.length}</span> verified entries
                        </p>
                        <div className="flex items-center gap-4">
                             <span className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase"><div className="w-2 h-2 rounded-full bg-primary" /> Unread</span>
                             <span className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved</span>
                        </div>
                    </div>

                    {/* Feedback Stream */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredFeedback.length > 0 ? (
                                filteredFeedback.map((fb, idx) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={fb.id} 
                                        className="bg-surface border border-border/80 p-0 hover:border-primary/40 transition-all group overflow-hidden relative"
                                    >
                                        <div className="p-4">
                                            <div className="flex flex-col md:flex-row gap-5">
                                                {/* Left Profile Area */}
                                                <div className="flex flex-col items-center gap-3 shrink-0 sm:w-16">
                                                    <div className="w-12 h-12 bg-background border border-border/60 flex items-center justify-center relative">
                                                        <User className="w-5 h-5 text-text-muted" />
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-border/60 flex items-center justify-center">
                                                            <span className="text-[9px] font-black text-text">{fb.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 w-full text-center">
                                                        <div className="flex justify-center gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-2.5 h-2.5 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-text-muted opacity-20'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{formatDate(fb.date)}</p>
                                                    </div>
                                                </div>

                                                {/* Center Content Area */}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-lg font-black text-text uppercase tracking-tighter flex items-center gap-3">
                                                                {fb.customerName}
                                                                <span className={`px-2 py-0.5 text-[8px] border font-black uppercase tracking-widest rounded-none ${getSentimentColor(fb.sentiment)}`}>
                                                                    {fb.sentiment}
                                                                </span>
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Assigned Operator</p>
                                                                <p className="text-xs font-black text-primary uppercase tracking-[0.1em]">{fb.staffName}</p>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                                                                <UserCircle className="w-4 h-4 text-primary" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-border/40" />
                                                        <p className="text-sm font-medium text-text-secondary leading-relaxed italic">
                                                            "{fb.comment}"
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 pt-2">
                                                        <div className="flex items-center gap-2 group/tag">
                                                            <Hash className="w-3 h-3 text-text-muted transition-colors group-hover/tag:text-primary" />
                                                            <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">{fb.service}</span>
                                                        </div>
                                                        <div className="w-px h-3 bg-border" />
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className={`w-3 h-3 ${fb.status === 'Urgent' ? 'text-rose-500' : 'text-text-muted'}`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${fb.status === 'Urgent' ? 'text-rose-500' : 'text-text-muted'}`}>Status: {fb.status}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Action Area */}
                                                <div className="flex flex-col gap-2 shrink-0 sm:w-36">
                                                    {!fb.response ? (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setRespondingTo(respondingTo === fb.id ? null : fb.id);
                                                            }}
                                                            className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Send className="w-3 h-3" /> Transmit Reply
                                                        </button>
                                                    ) : (
                                                        <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-1">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocol Finished</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                                        <button className="py-2 bg-white border border-border/60 text-text-muted hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center">
                                                            <Share2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button className="py-2 bg-white border border-border/60 text-text-muted hover:text-rose-500 hover:border-rose-500/40 transition-all flex items-center justify-center">
                                                            <Flag className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Response Box */}
                                            <AnimatePresence>
                                                {respondingTo === fb.id && (
                                                    <motion.div 
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-8 pt-8 border-t border-dashed border-border/60 space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                                                    <MessageSquare className="w-3.5 h-3.5" /> Outgoing Communication Channel
                                                                </h4>
                                                                <button onClick={() => setRespondingTo(null)} className="text-[10px] text-text-muted hover:text-text font-black uppercase">Close</button>
                                                            </div>
                                                            <div className="relative">
                                                                <textarea
                                                                    autoFocus
                                                                    className="w-full px-6 py-4 bg-background border border-border text-xs font-bold text-text-secondary outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none tracking-wide leading-relaxed"
                                                                    placeholder="ENTER PROFESSIONAL TRANSMISSION..."
                                                                    value={responseDraft}
                                                                    onChange={(e) => setResponseDraft(e.target.value)}
                                                                />
                                                                <div className="absolute right-4 bottom-4 text-[9px] font-black text-text-muted/40 uppercase">Encrypted Transmission</div>
                                                            </div>
                                                            <div className="flex justify-end gap-3 pb-2">
                                                                <button 
                                                                    onClick={() => setRespondingTo(null)}
                                                                    className="px-8 py-2.5 bg-white border border-border text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                                                >
                                                                    Abort
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleSendResponse(fb.id)}
                                                                    disabled={!responseDraft.trim()}
                                                                    className="px-10 py-2.5 bg-text text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-text/20 disabled:opacity-30 transition-all flex items-center gap-3"
                                                                >
                                                                    Execute Transmission <ArrowRight className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Existing Response Display */}
                                            {fb.response && !respondingTo === fb.id && (
                                                <div className="mt-8 pt-8 border-t border-border/40 relative">
                                                    <div className="absolute -top-3 left-10 px-4 bg-surface text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] border border-border/40">
                                                        Sent Protocol
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-black text-text uppercase tracking-widest">Management Statement</p>
                                                                <button 
                                                                    onClick={() => {
                                                                        setResponseDraft(fb.response);
                                                                        setRespondingTo(fb.id);
                                                                    }}
                                                                    className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest"
                                                                >
                                                                    Edit Protocol
                                                                </button>
                                                            </div>
                                                            <p className="text-sm font-medium text-text-secondary/70 italic leading-relaxed">
                                                                "{fb.response}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="bg-surface border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-6"
                                >
                                    <div className="w-20 h-20 bg-background border border-border/60 flex items-center justify-center mb-6">
                                        <Filter className="w-8 h-8 text-text-muted opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-black text-text uppercase tracking-tighter mb-2">No Records Detected</h3>
                                    <p className="text-xs font-medium text-text-muted uppercase tracking-widest max-w-xs">
                                        Adjust your signal filters or search parameters to discover other customer transmissions.
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setSelectedRating('All');
                                            setSelectedSentiment('All');
                                            setActiveTab('All');
                                            setSearchTerm('');
                                        }}
                                        className="mt-8 px-8 py-3 bg-text text-white text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Clear Frequency
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {filteredFeedback.length > 5 && (
                        <div className="flex justify-center pt-8">
                            <button className="group relative px-12 py-4 bg-white border border-border text-[10px] font-black uppercase tracking-[0.4em] overflow-hidden transition-all hover:text-white">
                                <div className="absolute inset-0 bg-text translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10 flex items-center gap-3">
                                    Analyze Older Patterns <ArrowRight className="w-4 h-4" />
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
