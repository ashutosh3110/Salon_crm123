import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, Star, Heart, Share2, ShieldCheck, MessageSquare, ChevronDown, User, Sparkles } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import api from '../../services/api';
import ReviewModal from '../../components/app/ReviewModal';

const Accordion = ({ title, subtext, children, isInitialOpen = false, colors }) => {
    const [isOpen, setIsOpen] = useState(isInitialOpen);
    return (
        <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left group"
            >
                <div className="flex-1 pr-4">
                    <h4
                        className="text-[13px] font-black uppercase tracking-widest"
                        style={{ color: colors.text }}
                    >
                        {title}
                    </h4>
                    {subtext && !isOpen && (
                        <p className="text-[10px] opacity-40 mt-0.5 font-bold italic">{subtext}</p>
                    )}
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: 'spring', damping: 20 }}>
                    <ChevronDown size={14} style={{ color: colors.text, opacity: 0.5 }} />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 text-[12px] leading-relaxed opacity-70" style={{ color: colors.text }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function AppServiceDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { colors, isLight } = useCustomerTheme();
    const { services, categories: businessCategories, fetchServices } = useBusiness();
    
    const [reviews, setReviews] = useState([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const service = useMemo(() => {
        return (services || []).find(s => String(s._id || s.id) === String(id));
    }, [services, id]);

    useEffect(() => {
        if (!service && id) {
             const tid = localStorage.getItem('active_salon_id');
             if (tid) fetchServices(tid);
        }
    }, [service, id, fetchServices]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/feedbacks?targetId=${id}&targetType=service`);
                if (res.data?.success) {
                    setReviews(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch service reviews:', err);
            }
        };
        fetchReviews();
    }, [id]);



    if (!service) {
        return (
            <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-4 border-[#C8956C] border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Locating Ritual...</h2>
            </div>
        );
    }

    const categoryName = businessCategories?.find(c => String(c._id) === String(service.category) || c.name === service.category)?.name || 'General';

    return (
        <div style={{ background: colors.bg, color: colors.text }} className="min-h-screen relative flex flex-col overflow-hidden">
            {/* Header Actions */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 w-11 h-11 rounded-2xl bg-black/40 text-white backdrop-blur-xl z-[70] flex items-center justify-center active:scale-90 shadow-2xl border border-white/10"
            >
                <ChevronLeft size={22} />
            </button>



            <div className="flex-1 overflow-y-auto custom-scrollbar h-[100dvh]" style={{ overflowX: 'hidden' }}>
                {/* Hero Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                    <motion.img 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src={service.image || "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000"} 
                        alt={service.name} 
                        className="w-full h-full object-cover opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    <div className="absolute bottom-10 left-8 right-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3 mb-4"
                        >
                            <span className="px-3 py-1 bg-[#C8956C] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md">
                                {categoryName}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-black">{service.rating || '4.9'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-md border border-white/10 text-white">
                                <Clock className="w-3 h-3 text-[#C8956C]" />
                                <span className="text-[10px] font-black">{service.duration} MINS</span>
                            </div>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl font-black text-white leading-tight tracking-tighter italic"
                        >
                            {service.name}
                        </motion.h2>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 pb-32 space-y-9" style={{ background: colors.bg }}>
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Investment</p>
                            <p className="text-4xl font-black text-[#C8956C] tracking-tighter italic">₹{service.price}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 p-2 px-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5">
                                <User size={14} className="text-[#C8956C]" />
                                <span className="text-[11px] font-bold opacity-70">Any Expert</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Accordion title="The Ritual Experience" isInitialOpen colors={colors}>
                            <p className="mb-4 leading-relaxed font-medium">
                                {service.description || "Indulge in a premium salon experience tailored to your unique style. Our experts use high-quality products and advanced techniques to ensure exceptional results."}
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1">
                                    <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Type</span>
                                    <span className="text-[11px] font-black uppercase italic">Signature</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/3 dark:bg-white/3 border border-black/5 flex flex-col gap-1">
                                    <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">Complexity</span>
                                    <span className="text-[11px] font-black uppercase italic">Advanced</span>
                                </div>
                            </div>
                        </Accordion>

                        <Accordion title="Client Voices" subtext={`${reviews.length} reviews`} colors={colors}>
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((rev) => (
                                        <div key={rev._id} className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={11} fill={s <= rev.rating ? '#C8956C' : 'none'} color={s <= rev.rating ? '#C8956C' : 'rgba(255,255,255,0.1)'} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] opacity-30 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[12px] italic mb-3 font-medium opacity-80 leading-relaxed">"{rev.comment}"</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-[#C8956C]/20 flex items-center justify-center text-[8px] font-black text-[#C8956C]">
                                                    {rev.customerName?.charAt(0)}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">— {rev.customerName}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 opacity-40 italic font-medium">No reviews yet for this ritual. Be the first to share your experience.</p>
                                )}
                                <button 
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="w-full h-14 rounded-2xl border-2 border-dashed border-[#C8956C]/30 text-[#C8956C] text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <MessageSquare size={16} /> Write a Review
                                </button>
                            </div>
                        </Accordion>

                        <Accordion title="Policy & Ritual Care" colors={colors}>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck size={16} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase mb-1">Authenticity Guaranteed</h5>
                                        <p className="text-[10px] opacity-60">We use only verified professional-grade products for all services.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <Clock size={16} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-black uppercase mb-1">Cancellation Policy</h5>
                                        <p className="text-[10px] opacity-60">Cancellations must be made at least 4 hours before the appointment.</p>
                                    </div>
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    <div className="pt-6">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="button"
                            onClick={() => navigate(`/app/booking?serviceId=${service._id}`)}
                            style={{
                                background: 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)',
                                boxShadow: '0 20px 40px rgba(200,149,108,0.3)'
                            }}
                            className="w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-white shadow-2xl transition-all"
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Reserve Your Spot</span>
                            <Sparkles size={16} className="text-white/40" />
                        </motion.button>
                    </div>
                </div>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)}
                targetType="service"
                targetId={id}
                targetName={service.name}
                onSuccess={() => {
                    const fetchReviews = async () => {
                        const res = await api.get(`/feedbacks?targetId=${id}&targetType=service`);
                        if (res.data?.success) setReviews(res.data.data);
                    };
                    fetchReviews();
                }}
            />
        </div>
    );
}
