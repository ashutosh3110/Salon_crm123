import { useState, useMemo, useEffect } from 'react';
import {
    Star, MessageSquare, ThumbsUp, ThumbsDown,
    Filter, Search, ArrowRight, User,
    Calendar, TrendingUp, TrendingDown,
    ArrowUpRight, CheckCircle2, AlertCircle,
    UserCircle, Hash, Send, Share2, Flag, RefreshCw, FileText, Loader2,
    Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { useBusiness } from '../../contexts/BusinessContext';

export default function FeedbackPage() {
    const { feedbacks, feedbacksLoading, fetchFeedbacks, updateFeedback } = useBusiness();

    // Initial Fetch for management (load all including Pending, Approved, Rejected)
    useEffect(() => {
        fetchFeedbacks(null, null, 'all');
    }, [fetchFeedbacks]);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = feedbacks.length;
        const pending = feedbacks.filter(f => f.status === 'Pending').length;
        const approved = feedbacks.filter(f => f.status === 'Approved').length;
        const rejected = feedbacks.filter(f => f.status === 'Rejected').length;
        const ratingsWithStars = feedbacks.filter(f => f.rating);
        const avg = ratingsWithStars.length > 0 
            ? ratingsWithStars.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingsWithStars.length 
            : 0;

        return {
            total,
            pending,
            approved,
            rejected,
            avg: avg.toFixed(1)
        };
    }, [feedbacks]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRating, setSelectedRating] = useState('All');
    const [selectedSentiment, setSelectedSentiment] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('Pending'); // Default to Pending as per main task
    const [selectedDate, setSelectedDate] = useState('All'); // 'All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'
    
    const [detailModalFeedback, setDetailModalFeedback] = useState(null);
    const [respondingTo, setRespondingTo] = useState(null);
    const [responseDraft, setResponseDraft] = useState('');

    const filteredFeedback = useMemo(() => {
        return feedbacks.filter(fb => {
            const matchesSearch = 
                (fb.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (fb.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (fb.staffName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            
            const matchesRating = selectedRating === 'All' || fb.rating === parseInt(selectedRating);
            const matchesSentiment = selectedSentiment === 'All' || fb.sentiment === selectedSentiment;
            const matchesStatus = selectedStatus === 'All' || fb.status === selectedStatus;
            
            let matchesDate = true;
            if (selectedDate !== 'All' && fb.createdAt) {
                const fbDate = new Date(fb.createdAt);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate === 'Today') {
                    const compareDate = new Date(fbDate);
                    compareDate.setHours(0, 0, 0, 0);
                    matchesDate = compareDate.getTime() === today.getTime();
                } else if (selectedDate === 'Yesterday') {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const compareDate = new Date(fbDate);
                    compareDate.setHours(0, 0, 0, 0);
                    matchesDate = compareDate.getTime() === yesterday.getTime();
                } else if (selectedDate === 'Last 7 Days') {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    matchesDate = fbDate >= sevenDaysAgo;
                } else if (selectedDate === 'Last 30 Days') {
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    matchesDate = fbDate >= thirtyDaysAgo;
                }
            }

            return matchesSearch && matchesRating && matchesSentiment && matchesStatus && matchesDate;
        });
    }, [feedbacks, searchTerm, selectedRating, selectedSentiment, selectedStatus, selectedDate]);

    // Public/Approved reviews section data (recent 5 approved reviews)
    const recentPublicReviews = useMemo(() => {
        return feedbacks
            .filter(fb => fb.status === 'Approved')
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5);
    }, [feedbacks]);

    const handleSendResponse = async (id) => {
        try {
            await updateFeedback(id, { response: responseDraft, status: 'Approved' });
            setRespondingTo(null);
            setResponseDraft('');
            setDetailModalFeedback(null);
            toast.success('Response sent & feedback approved!');
            fetchFeedbacks(null, null, 'all');
        } catch (err) {
            console.error(err);
            toast.error('Failed to send response');
        }
    };

    const handleApprove = async (id) => {
        try {
            await updateFeedback(id, { status: 'Approved' });
            toast.success('Feedback approved & is now public!');
            fetchFeedbacks(null, null, 'all');
        } catch (err) {
            console.error(err);
            toast.error('Failed to approve feedback');
        }
    };

    const handleReject = async (id) => {
        try {
            await updateFeedback(id, { status: 'Rejected' });
            toast.success('Feedback rejected.');
            fetchFeedbacks(null, null, 'all');
        } catch (err) {
            console.error(err);
            toast.error('Failed to reject feedback');
        }
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
                    toast.success('Copied to clipboard!');
                }
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('Copied to clipboard!');
        }
    };

    const handleFlag = async (id) => {
        try {
            await updateFeedback(id, { isFlagged: true });
            toast.success('Feedback flagged for admin review.');
            fetchFeedbacks(null, null, 'all');
        } catch (err) {
            console.error(err);
            toast.error('Failed to flag feedback');
        }
    };

    const getSentimentBadge = (sentiment) => {
        switch(sentiment) {
            case 'Positive': 
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200"
                        style={{ color: '#047857' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Positive
                    </span>
                );
            case 'Negative': 
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200"
                        style={{ color: '#be123c' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Negative
                    </span>
                );
            default: 
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-250"
                        style={{ color: '#b45309' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Neutral
                    </span>
                );
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved':
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100/70 border border-emerald-250"
                        style={{ color: '#065f46' }}
                    >
                        Approved
                    </span>
                );
            case 'Rejected':
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100/70 border border-rose-250"
                        style={{ color: '#991b1b' }}
                    >
                        Rejected
                    </span>
                );
            default:
                return (
                    <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100/70 border border-amber-250"
                        style={{ color: '#92400e' }}
                    >
                        Pending
                    </span>
                );
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const handleExportCSV = () => {
        if (!filteredFeedback.length) {
            toast.error('No feedback to export.');
            return;
        }
        try {
            const headers = ['Customer', 'Rating', 'Comment', 'Sentiment', 'Staff Assigned', 'Status', 'Date'];
            const rows = filteredFeedback.map(fb => [
                fb.customerName || 'Anonymous',
                fb.rating,
                `"${(fb.comment || '').replace(/"/g, '""')}"`,
                fb.sentiment || 'Neutral',
                fb.staffName || 'Unassigned',
                fb.status,
                formatDate(fb.createdAt || fb.date)
            ]);
            const csvContent = "data:text/csv;charset=utf-8," 
                + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `customer_feedback_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Report exported successfully');
        } catch (err) {
            console.error(err);
            toast.error('Export failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 text-left">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Review Moderation</h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        CRM-style dashboard to review, approve, reject and respond to customer reviews.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => fetchFeedbacks(null, null, 'all')}
                        disabled={feedbacksLoading}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${feedbacksLoading ? 'animate-spin' : ''}`} />
                        Refresh Feed
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
                    >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Export .CSV
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                {/* Total Feedback */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Feedback</span>
                            <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                            <AnimatedCounter value={stats.total} />
                        </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-2">All submissions</p>
                </div>

                {/* Pending Approval */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending Approval</span>
                            <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
                            <AnimatedCounter value={stats.pending} />
                        </h3>
                    </div>
                    <p className="text-[10px] text-amber-500 font-semibold uppercase mt-2">Awaiting action</p>
                </div>

                {/* Approved Reviews */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Approved Reviews</span>
                            <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                            <AnimatedCounter value={stats.approved} />
                        </h3>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-semibold uppercase mt-2">Publicly visible</p>
                </div>

                {/* Rejected Reviews */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-rose-500/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rejected Reviews</span>
                            <div className="w-7 h-7 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-600">
                                <ThumbsDown className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
                            <AnimatedCounter value={stats.rejected} />
                        </h3>
                    </div>
                    <p className="text-[10px] text-rose-500 font-semibold uppercase mt-2">Moderated out</p>
                </div>

                {/* Average Rating */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#EA580C]/30 transition-all duration-300 relative overflow-hidden col-span-2 lg:col-span-1 flex flex-col justify-between min-h-[110px]">
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Average Rating</span>
                            <div className="w-7 h-7 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-500">
                                <Star className="w-4 h-4 fill-amber-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-[#EA580C] mt-2 flex items-baseline">
                            <AnimatedCounter value={parseFloat(stats.avg)} />
                            <span className="text-xs text-slate-400 font-bold ml-0.5">/5</span>
                        </h3>
                    </div>
                    <div className="flex gap-0.5 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(stats.avg) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Client..."
                        className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#C89B2B] focus:bg-white transition-all placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Rating Filter */}
                <div>
                    <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#C89B2B] focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="All">All Ratings</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5★)</option>
                        <option value="4">⭐⭐⭐⭐ (4★)</option>
                        <option value="3">⭐⭐⭐ (3★)</option>
                        <option value="2">⭐⭐ (2★)</option>
                        <option value="1">⭐ (1★)</option>
                    </select>
                </div>

                {/* Sentiment Filter */}
                <div>
                    <select
                        value={selectedSentiment}
                        onChange={(e) => setSelectedSentiment(e.target.value)}
                        className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#C89B2B] focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="All">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#C89B2B] focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div>
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#C89B2B] focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="All">All Time</option>
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Main Reviews Table / Card Area */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {feedbacksLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#C89B2B]" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing reviews...</p>
                    </div>
                ) : filteredFeedback.length > 0 ? (
                    <>
                        {/* Desktop Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Feedback</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentiment</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredFeedback.map((fb) => (
                                        <tr key={fb._id || fb.id} className="hover:bg-slate-50/30 transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-slate-800 text-sm">{fb.customerName || 'Anonymous'}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{fb.outletId?.name || 'All Outlets'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-slate-600 line-clamp-2 italic font-medium">"{fb.comment}"</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getSentimentBadge(fb.sentiment)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                {formatDate(fb.createdAt || fb.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(fb.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {fb.status !== 'Approved' && (
                                                        <button 
                                                            onClick={() => handleApprove(fb._id || fb.id)}
                                                            className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-200 transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:scale-[1.02]"
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                    )}
                                                    {fb.status !== 'Rejected' && (
                                                        <button 
                                                            onClick={() => handleReject(fb._id || fb.id)}
                                                            className="h-8 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-rose-200 transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:scale-[1.02]"
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setDetailModalFeedback(fb);
                                                            setResponseDraft(fb.response || '');
                                                        }}
                                                        className="h-8 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:scale-[1.02]"
                                                    >
                                                        👁 Details
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Grid Layout */}
                        <div className="block md:hidden p-4 space-y-4">
                            {filteredFeedback.map((fb) => (
                                <div key={fb._id || fb.id} className="border border-slate-200/80 rounded-2xl p-5 bg-white space-y-4 hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        {getStatusBadge(fb.status)}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-800 text-base">{fb.customerName || 'Anonymous'}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatDate(fb.createdAt || fb.date)}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed italic font-medium">"{fb.comment}"</p>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            Sentiment: {getSentimentBadge(fb.sentiment)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        {fb.status !== 'Approved' && (
                                            <button 
                                                onClick={() => handleApprove(fb._id || fb.id)}
                                                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 transition-all cursor-pointer"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {fb.status !== 'Rejected' && (
                                            <button 
                                                onClick={() => handleReject(fb._id || fb.id)}
                                                className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 transition-all cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setDetailModalFeedback(fb);
                                                setResponseDraft(fb.response || '');
                                            }}
                                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 transition-all cursor-pointer"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                        <div className="text-4xl mb-3">📝</div>
                        <h3 className="text-base font-black text-slate-700 uppercase tracking-widest">No customer reviews available</h3>
                        <p className="text-xs text-slate-500 mt-2 max-w-xs font-medium">
                            New customer feedback will appear here for approval.
                        </p>
                        <button 
                            onClick={() => fetchFeedbacks(null, null, 'all')}
                            className="mt-6 flex items-center justify-center gap-2 bg-[#C89B2B] hover:bg-[#b08722] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 shadow-md"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh Feedback
                        </button>
                    </div>
                )}
            </div>

            {/* Approved Feedback / Recent Public Reviews Section */}
            <div className="border-t border-slate-150 pt-8 space-y-5">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Recent Public Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {recentPublicReviews.length > 0 ? (
                        recentPublicReviews.map((fb) => (
                            <div key={fb._id || fb.id} className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 hover:bg-white hover:shadow-md transition-all duration-300 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{formatDate(fb.createdAt || fb.date)}</span>
                                </div>
                                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{fb.customerName || 'Anonymous'}</h4>
                                <p className="text-xs text-slate-600 line-clamp-3 italic font-medium leading-relaxed">"{fb.comment}"</p>
                                {fb.response && (
                                    <div className="bg-emerald-50/55 border border-emerald-100 rounded-xl p-3 mt-2">
                                        <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Reply Sent</p>
                                        <p className="text-[11px] text-slate-600 font-medium italic">"{fb.response}"</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50 rounded-2xl">
                            No public reviews yet. Approved reviews will show up here.
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Modal / Response Drawer */}
            <AnimatePresence>
                {detailModalFeedback && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDetailModalFeedback(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Review Details</h3>
                                    <p className="text-xs font-extrabold text-[#C89B2B] uppercase tracking-wider">Moderation Dashboard</p>
                                </div>
                                <button 
                                    onClick={() => setDetailModalFeedback(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer border-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Review Specs */}
                            <div className="grid grid-cols-2 gap-6 bg-slate-50/70 border border-slate-150 p-5 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                    <p className="text-sm font-extrabold text-slate-800">{detailModalFeedback.customerName || 'Anonymous'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outlet</p>
                                    <p className="text-sm font-extrabold text-slate-800">{detailModalFeedback.outletId?.name || 'All Outlets'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating & Sentiment</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < detailModalFeedback.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        {getSentimentBadge(detailModalFeedback.sentiment)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Staff & Service</p>
                                    <p className="text-sm font-extrabold text-slate-800">
                                        {detailModalFeedback.staffName || detailModalFeedback.targetName || 'Unassigned'} • <span className="text-slate-500 font-semibold">{detailModalFeedback.service || 'General Service'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Full Comment */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Review Text</p>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-700 italic font-semibold text-sm leading-relaxed relative">
                                    "{detailModalFeedback.comment}"
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5 text-[#C89B2B]" /> Manager Reply
                                    </label>
                                    {detailModalFeedback.response && !respondingTo && (
                                        <button 
                                            onClick={() => setRespondingTo(detailModalFeedback._id || detailModalFeedback.id)}
                                            className="text-[10px] font-bold text-[#C89B2B] hover:text-[#b08722] uppercase tracking-wider cursor-pointer"
                                        >
                                            Edit Reply
                                        </button>
                                    )}
                                </div>
                                
                                {detailModalFeedback.response && !respondingTo ? (
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-700 italic">
                                        "{detailModalFeedback.response}"
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:border-[#C89B2B] focus:bg-white transition-all min-h-[100px] resize-none"
                                            placeholder="Write reply to customer (sending response automatically approves this review)..."
                                            value={responseDraft}
                                            onChange={(e) => setResponseDraft(e.target.value)}
                                        />
                                        <div className="flex justify-end gap-2">
                                            {respondingTo && (
                                                <button 
                                                    onClick={() => setRespondingTo(null)}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer border-0"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleSendResponse(detailModalFeedback._id || detailModalFeedback.id)}
                                                disabled={!responseDraft.trim()}
                                                className="px-6 py-2.5 bg-[#C89B2B] hover:bg-[#b08722] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md disabled:opacity-40 transition-all cursor-pointer border-0"
                                            >
                                                Send Response
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleShare(detailModalFeedback)}
                                        title="Share Feedback"
                                        className="h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    {!detailModalFeedback.isFlagged && (
                                        <button 
                                            onClick={() => handleFlag(detailModalFeedback._id || detailModalFeedback.id)}
                                            title="Flag for Admin Review"
                                            className="h-10 w-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer hover:text-rose-600 hover:border-rose-200 transition-all hover:scale-105"
                                        >
                                            <Flag className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {detailModalFeedback.status !== 'Approved' && (
                                        <button 
                                            onClick={() => {
                                                handleApprove(detailModalFeedback._id || detailModalFeedback.id);
                                                setDetailModalFeedback(null);
                                            }}
                                            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105 shadow-sm"
                                        >
                                            ✅ Approve
                                        </button>
                                    )}
                                    {detailModalFeedback.status !== 'Rejected' && (
                                        <button 
                                            onClick={() => {
                                                handleReject(detailModalFeedback._id || detailModalFeedback.id);
                                                setDetailModalFeedback(null);
                                            }}
                                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105 shadow-sm"
                                        >
                                            ❌ Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
