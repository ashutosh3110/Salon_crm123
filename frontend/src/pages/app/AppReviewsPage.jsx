import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import api from '../../services/api';
import ReviewModal from '../../components/app/ReviewModal';
import { Plus } from 'lucide-react';

export default function AppReviewsPage() {
    const { customer } = useCustomerAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchReviews = async () => {
        if (!customer?._id) return;
        try {
            const res = await api.get(`/reviews/customer/${customer._id}`);
            if (res.data?.success) {
                setReviews(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    };

    useEffect(() => {
        fetchReviews();
    }, [customer?._id]);

    const ReviewSkeleton = () => (
        <div 
            className="rounded-3xl p-6 border animate-pulse space-y-4"
            style={{ 
                background: colors.card,
                borderColor: colors.border
            }}
        >
            <div className="flex justify-between">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-black/5 dark:bg-white/5" />)}
                </div>
                <div className="h-3 w-16 bg-black/5 dark:bg-white/5 rounded-md" />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-black/5 dark:bg-white/5 rounded-md" />
                <div className="h-4 w-2/3 bg-black/5 dark:bg-white/5 rounded-md" />
            </div>
            <div className="h-3 w-24 bg-black/5 dark:bg-white/5 rounded-md pt-2" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pb-24 min-h-svh"
            style={{ background: colors.bg }}
        >
            {/* Header */}
            <div className="sticky top-0 z-50 pt-6 pb-6 flex items-center gap-4" style={{ background: colors.bg }}>
                <AppBackButton />
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>
                        My <span className="text-[#C8956C]">Reviews</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest mt-0.5 opacity-60 font-bold text-[#C8956C]">Shared Experiences</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="ml-auto w-10 h-10 rounded-full bg-[#C8956C]/10 flex items-center justify-center text-[#C8956C] border border-[#C8956C]/20"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <ReviewSkeleton key={i} />)}
                    </div>
                ) : reviews.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: colors.card, border: `1px dashed ${colors.border}` }}
                        className="text-center py-20 rounded-[32px] px-6"
                    >
                        <div style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }} className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-8 h-8 opacity-20" style={{ color: colors.text }} />
                        </div>
                        <h4 className="text-base font-black italic mb-2">No Reviews Yet</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-40 max-w-[200px] mx-auto" style={{ color: colors.textMuted }}>
                            Your voice matters. Review your past sessions to help others.
                        </p>
                        <div className="mt-8 flex flex-col gap-3">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C8956C]/20 w-full"
                            >
                                Write a Review
                            </button>
                            <button 
                                onClick={() => navigate('/app/bookings')}
                                className="px-8 py-3 bg-white/[0.05] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl w-full"
                            >
                                View Bookings
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    reviews.map((r, i) => (
                        <motion.div 
                            key={r._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{ 
                                background: colors.card, 
                                border: `1px solid ${colors.border}`,
                                boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.02)' : 'none'
                            }} 
                            className="p-6 rounded-[32px] group"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={12} 
                                            fill={i < r.rating ? '#C8956C' : 'none'} 
                                            color={i < r.rating ? '#C8956C' : colors.textMuted} 
                                            className={i < r.rating ? 'opacity-100' : 'opacity-20'}
                                        />
                                    ))}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{r.status}</span>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-[10px] font-black uppercase text-[#C8956C] tracking-widest mb-1">{r.customerName || 'Anonymous'}</p>
                                <p className="text-sm font-black italic leading-relaxed" style={{ color: colors.text }}>"{r.comment}"</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                <p className="text-[9px] font-black uppercase text-[#C8956C] tracking-widest">
                                    {r.targetType === 'service' ? 'Service' : 'Outlet'}: {r.targetName || 'General'}
                                </p>
                                <p className="text-[8px] font-bold opacity-30 uppercase tracking-tighter">{new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <ReviewModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchReviews}
                targetType="general"
                targetName="Salon Experience"
            />
        </motion.div>
    );
}
