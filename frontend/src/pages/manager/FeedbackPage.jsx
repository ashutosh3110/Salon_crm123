import { useState, useMemo, useEffect } from 'react';
import {
    Star, MessageSquare, ThumbsUp, ThumbsDown,
    Filter, Search, ArrowRight, User,
    Calendar, TrendingUp, TrendingDown, MoreVertical, 
    ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle,
    UserCircle, Hash, Clock, Send, ShieldCheck, Share2, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useBusiness } from '../../contexts/BusinessContext';

export default function FeedbackPage() {
    const { feedbacks, feedbacksLoading, fetchFeedbacks, updateFeedback } = useBusiness();

    // Initial Fetch
    useEffect(() => {
        fetchFeedbacks(null, null, ''); // Fetch all for management
    }, []);

    
    // Stats Calculation
    const stats = useMemo(() => {
        const total = feedbacks.length || 1;
        const avg = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total;
        const positive = feedbacks.filter(f => f.sentiment === 'Positive').length;
        const resRate = feedbacks.filter(f => f.response).length;
        const nps = ((positive - feedbacks.filter(f => f.sentiment === 'Negative').length) / total) * 100;

        return [
            { 
                label: 'Avg Rating', value: avg.toFixed(1), sub: 'Overall Lifetime', icon: Star, trend: '+0.1',
                iconColorClass: '!text-[#EA580C] dark:!text-[#FB923C]',
                iconBgClass: '!bg-[#FFEDD5] dark:!bg-[#EA580C]/20',
                cardBgClass: '!bg-[#FFF7ED] dark:!bg-[#EA580C]/5',
                cardBorderClass: '!border-[#FFEDD5] dark:!border-[#EA580C]/15 hover:!border-[#FDBA74] dark:hover:!border-[#FB923C]/50',
            },
            { 
                label: 'Sentiment', value: Math.round((positive / total) * 100), sub: 'Happiness Index', icon: ThumbsUp, trend: '+2%',
                iconColorClass: '!text-[#059669] dark:!text-[#34D399]',
                iconBgClass: '!bg-[#D1FAE5] dark:!bg-[#059669]/20',
                cardBgClass: '!bg-[#F0FDF4] dark:!bg-[#059669]/5',
                cardBorderClass: '!border-[#DCFCE7] dark:!border-[#059669]/15 hover:!border-[#86EFAC] dark:hover:!border-[#34D399]/50',
            },
            { 
                label: 'Response', value: Math.round((resRate / total) * 100), sub: 'Resolution Rate', icon: MessageSquare, trend: '+5%',
                iconColorClass: '!text-[#2563EB] dark:!text-[#60A5FA]',
                iconBgClass: '!bg-[#DBEAFE] dark:!bg-[#2563EB]/20',
                cardBgClass: '!bg-[#EFF6FF] dark:!bg-[#2563EB]/5',
                cardBorderClass: '!border-[#DBEAFE] dark:!border-[#2563EB]/15 hover:!border-[#93C5FD] dark:hover:!border-[#60A5FA]/50',
            },
            { 
                label: 'NPS', value: Math.round(nps), sub: 'Promoter Score', icon: ShieldCheck, trend: '+8',
                iconColorClass: '!text-[#7C3AED] dark:!text-[#A78BFA]',
                iconBgClass: '!bg-[#EDE9FE] dark:!bg-[#7C3AED]/20',
                cardBgClass: '!bg-[#FAF5FF] dark:!bg-[#7C3AED]/5',
                cardBorderClass: '!border-[#F3E8FF] dark:!border-[#7C3AED]/15 hover:!border-[#E9D5FF] dark:hover:!border-[#A78BFA]/50',
            },
        ];
    }, [feedbacks]);

    const [searchTerm, setSearchTerm] = useState('');
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseDraft, setResponseDraft] = useState('');
    
    // Filters
    const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Approved', 'Rejected', 'All'
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedSentiment, setSelectedSentiment] = useState('All');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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
                fb.status === activeTab;

            return matchesSearch && matchesRating && matchesSentiment && matchesTab;
        });
    }, [feedbacks, searchTerm, selectedRating, selectedSentiment, activeTab]);

    const handleSendResponse = (id) => {
        updateFeedback(id, { response: responseDraft, status: 'Approved' });
        setRespondingTo(null);
        setResponseDraft('');
    };

    const handleApprove = (id) => {
        updateFeedback(id, { status: 'Approved' });
    };

    const handleReject = (id) => {
        updateFeedback(id, { status: 'Rejected' });
    };

    const handleShare = async (fb) => {
        const shareText = `Feedback from ${fb.customerName || 'Anonymous'}: "${fb.comment}" - Rating: ${fb.rating}/5 Stars`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Customer Feedback',
                    text: shareText,
                });
                toast.success('Feedback shared successfully!');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(shareText);
                    toast.success('Feedback copied to clipboard!');
                }
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('Feedback copied to clipboard!');
        }
    };

    const handleFlag = (id) => {
        updateFeedback(id, { isFlagged: true });
        toast.success('Feedback flagged for administrative review.');
    };

    const getSentimentColor = (sentiment) => {
        switch(sentiment) {
            case 'Positive': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Negative': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    return (
        <div className="space-y-6 pb-12 selection:bg-primary/30">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Customer Feedback</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Management :: Feedback Response Portal</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => fetchFeedbacks()}
                        disabled={feedbacksLoading}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-surface border border-border shadow-sm flex items-center gap-3 sm:gap-4 flex-1 sm:flex-none hover:bg-surface-alt transition-colors disabled:opacity-50"
                    >
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-none ${feedbacksLoading ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
                        <span className="text-[9px] sm:text-[10px] font-black text-text uppercase tracking-widest">
                            {feedbacksLoading ? 'Refreshing...' : 'Live System Status'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={s.label} 
                        className={`!rounded-[16px] !border p-3.5 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.04)] group flex flex-col justify-between min-h-[118px] transition-all hover:-translate-y-0.5 active:scale-[0.98] hover:shadow-md ${s.cardBgClass} ${s.cardBorderClass}`}
                    >
                        <div className="flex !items-start gap-3 !text-left">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.iconBgClass}`} style={{ borderRadius: '12px' }}>
                                <s.icon className={`w-4 h-4 ${s.iconColorClass}`} strokeWidth={2} />
                            </div>

                            <div className="flex flex-col !items-start !text-left">
                                <span
                                    style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.03em' }}
                                    className="uppercase text-slate-500 dark:text-slate-455 leading-none mb-1.5 !text-left"
                                >
                                    {s.label}
                                </span>
                                <h3
                                    style={{ fontSize: '24px', fontWeight: 850 }}
                                    className="text-slate-800 dark:text-slate-55 leading-none tracking-tight !text-left flex items-baseline"
                                >
                                    <AnimatedCounter 
                                        value={typeof s.value === 'string' ? parseFloat(s.value) : s.value} 
                                    />
                                    {s.label === 'Avg Rating' && <span className="text-sm sm:text-lg text-slate-500 font-bold ml-1">/5</span>}
                                    {s.label !== 'Avg Rating' && s.label !== 'NPS' && <span className="text-sm sm:text-lg text-slate-500 font-bold ml-1">%</span>}
                                </h3>
                                <span
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                    className="text-slate-500 dark:text-slate-400 mt-1.5 !text-left"
                                >
                                    {s.sub}
                                </span>
                            </div>
                        </div>

                        <div
                            style={{ fontSize: '11px', fontWeight: 700 }}
                            className="flex !items-center gap-1 mt-auto pt-2 transition-all opacity-90 group-hover:opacity-100 whitespace-nowrap !text-left !justify-start"
                        >
                            <span className={`flex items-center gap-1 ${s.iconColorClass}`}>
                                <ArrowUpRight className="w-3 h-3" /> {s.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Command Center */}
            <div className="grid md:grid-cols-12 gap-6 relative">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex items-center justify-between bg-surface border border-border/80 p-3 mb-2">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Signal Controls</p>
                    <button 
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        <Filter className="w-3 h-3" /> {showMobileFilters ? 'Hide' : 'Show'} Filters
                    </button>
                </div>

                {/* Side Navigation / Filters */}
                <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block md:col-span-4 lg:col-span-3 space-y-4`}>
                    <div className="bg-surface border border-border/80 p-4 space-y-4 shadow-xl md:shadow-none !rounded-[16px]">
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
                                    {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${
                                                activeTab === tab 
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                                : 'bg-white text-text-muted border-border/60 hover:border-primary/40'
                                            } border`}
                                        >
                                            {tab === 'Approved' ? 'Public' : tab} Records
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

                    <div className="hidden md:block bg-surface border-l-4 border-l-amber-500 border border-border/60 p-6 !rounded-[16px]">
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
                <div className="md:col-span-8 lg:col-span-9 space-y-5">
                    {/* Search & Bulk Actions */}
                    <div className="bg-surface border border-border/80 p-3 flex flex-col sm:flex-row gap-3 sm:gap-4 !rounded-[16px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="IDENTIFY RECORD KEYWORDS..."
                                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-2 bg-white border border-border/60 !rounded-[16px] text-[10px] sm:text-xs font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/40"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-white border border-border/60 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-surface-alt transition-all !rounded-[16px]">
                                Export .CSV
                            </button>
                        </div>
                    </div>

                    {/* Result Counter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2">
                        <p className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
                            Displaying <span className="text-primary">{filteredFeedback.length}</span> verified entries
                        </p>
                        <div className="flex items-center gap-4">
                             <span className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-text-muted uppercase"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" /> Unread</span>
                             <span className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-text-muted uppercase"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" /> Resolved</span>
                        </div>
                    </div>

                    {/* Feedback Stream */}
                    <div className="space-y-4">
                        {feedbacksLoading && filteredFeedback.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-surface border border-dashed border-border/60">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary animate-spin rounded-none" />
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Syncing Feedbacks...</p>
                            </div>
                        ) : (
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
                                            className="bg-surface border border-border/80 p-0 hover:border-primary/40 transition-all group overflow-hidden relative !rounded-[16px]"
                                        >
                                            <div className="p-4 md:p-6">
                                                <div className="flex flex-col md:flex-row gap-5 md:gap-8">
                                                    {/* Left Profile Area */}
                                                    <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 shrink-0 sm:w-16">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background border border-border/60 flex items-center justify-center relative shrink-0">
                                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white border border-border/60 flex items-center justify-center">
                                                                <span className="text-[8px] sm:text-[9px] font-black text-text">{fb.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 flex-1 md:w-full text-left md:text-center">
                                                            <div className="flex md:justify-center gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-text-muted opacity-20'}`} />
                                                                ))}
                                                            </div>
                                                            <p className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{formatDate(fb.date)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Center Content Area */}
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                                            <div>
                                                                <h3 className="text-base sm:text-lg font-black text-text uppercase tracking-tighter flex flex-wrap items-center gap-2 sm:gap-3">
                                                                    {fb.customerName || 'Anonymous'}
                                                                    <span className={`px-1.5 py-0.5 text-[7px] sm:text-[8px] border font-black uppercase tracking-widest rounded-none ${getSentimentColor(fb.sentiment)}`}>
                                                                        {fb.sentiment}
                                                                    </span>
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center gap-2 sm:gap-3 sm:text-right">
                                                                <div className="sm:text-right">
                                                                    <p className="text-[8px] sm:text-[9px] font-black text-text-muted uppercase tracking-widest sm:mb-1 italic">
                                                                        {fb.outletId?.name ? `Outlet: ${fb.outletId.name}` : 'Staff Member'}
                                                                    </p>
                                                                    <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.1em]">{fb.staffName || 'Unassigned'}</p>
                                                                </div>
                                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
                                                                    <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
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
                                                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">{fb.service || 'General'}</span>
                                                            </div>
                                                            <div className="w-px h-3 bg-border" />
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${fb.status === 'Approved' ? 'bg-emerald-500' : fb.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${fb.status === 'Approved' ? 'text-emerald-500' : fb.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'}`}>
                                                                    Status: {fb.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Action Area */}
                                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 sm:w-36">
                                                        {fb.status === 'Pending' && (
                                                            <div className="flex flex-col gap-2 w-full">
                                                                <button 
                                                                    onClick={() => handleApprove(fb.id || fb._id)}
                                                                    className="w-full py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                                                                >
                                                                    <ThumbsUp className="w-3 h-3" /> Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleReject(fb.id || fb._id)}
                                                                    className="w-full py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors"
                                                                >
                                                                    <ThumbsDown className="w-3 h-3" /> Reject
                                                                </button>
                                                            </div>
                                                        )}

                                                        {!fb.response ? (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRespondingTo(respondingTo === fb.id ? null : fb.id);
                                                                }}
                                                                className="flex-1 sm:w-full py-2.5 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Send className="w-3 h-3 text-white" /> {fb.status === 'Pending' ? 'Reply & Share' : 'Respond'}
                                                            </button>
                                                        ) : (
                                                            <div className="flex-1 sm:w-full py-2 bg-emerald-500/10 border border-emerald-500/20 flex flex-row sm:flex-col items-center justify-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest text-center">Responded</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex sm:grid sm:grid-cols-2 gap-2 mt-auto">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShare(fb);
                                                                }}
                                                                className="flex-1 py-2 sm:py-2 bg-white border border-border/60 text-text-muted hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center !rounded-[16px]"
                                                            >
                                                                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFlag(fb.id || fb._id);
                                                                }}
                                                                className="flex-1 py-2 sm:py-2 bg-white border border-border/60 text-text-muted hover:text-rose-500 hover:border-rose-500/40 transition-all flex items-center justify-center !rounded-[16px]"
                                                            >
                                                                <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                                                                        <MessageSquare className="w-3.5 h-3.5" /> Outgoing Message
                                                                    </h4>
                                                                    <button onClick={() => setRespondingTo(null)} className="text-[10px] text-text-muted hover:text-text font-black uppercase">Close</button>
                                                                </div>
                                                                <div className="relative">
                                                                    <textarea
                                                                        autoFocus
                                                                        className="w-full px-6 py-4 bg-background border border-border text-xs font-bold text-text-secondary outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none tracking-wide leading-relaxed"
                                                                        placeholder="WRITE YOUR RESPONSE HERE..."
                                                                        value={responseDraft}
                                                                        onChange={(e) => setResponseDraft(e.target.value)}
                                                                    />
                                                                    <div className="absolute right-4 bottom-4 text-[9px] font-black text-text-muted/40 uppercase">Safe Message Transmission</div>
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
                                                                        Send Response <ArrowRight className="w-3.5 h-3.5" />
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
                                                            Response Sent
                                                        </div>
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[10px] font-black text-text uppercase tracking-widest">Manager's Reply</p>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setResponseDraft(fb.response);
                                                                            setRespondingTo(fb.id);
                                                                        }}
                                                                        className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest"
                                                                    >
                                                                        Edit Reply
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
                                        className="bg-surface border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-6 !rounded-[16px]"
                                    >
                                        <div className="w-20 h-20 bg-background border border-border/60 flex items-center justify-center mb-6">
                                            <Filter className="w-8 h-8 text-text-muted opacity-20" />
                                        </div>
                                        <h3 className="text-2xl font-black text-text uppercase tracking-tighter mb-2">No Feedbacks Yet</h3>
                                        <p className="text-xs font-medium text-text-muted uppercase tracking-widest max-w-xs">
                                            Adjust your filters to see more customer feedback records.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                setSelectedRating('All');
                                                setSelectedSentiment('All');
                                                setActiveTab('All');
                                                setSearchTerm('');
                                            }}
                                            className="mt-8 px-8 py-3 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest !rounded-[16px] hover:brightness-110 transition-all shadow-lg shadow-[#B4912B]/20"
                                        >
                                            Clear Filters
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
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
