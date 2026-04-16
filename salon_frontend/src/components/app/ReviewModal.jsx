import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

export default function ReviewModal({ isOpen, onClose, booking, onSuccess, targetType = 'service', targetId = null, targetName = null }) {
    const { salon, activeSalonId } = useBusiness();
    const { customer } = useCustomerAuth();
    const [revName, setRevName] = useState(customer?.name || '');
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const sid = salon?._id || activeSalonId || localStorage.getItem('active_salon_id');
            if (!sid) {
                throw new Error('Salon context missing');
            }

            const oid = localStorage.getItem('active_outlet_id');

            await api.post('/feedbacks', {
                salonId: sid,
                outletId: oid,
                customerName: revName || customer?.name || 'Customer',
                customer: revName || customer?.name || 'Customer',
                rating,
                comment,
                targetType,
                targetId: targetId || (booking?.service?._id || booking?.service?.id),
                targetName: targetName || booking?.service?.name || 'Service',
                status: 'Pending'
            });
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {isSuccess ? (
                        <div className="p-10 text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                                className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Thank You!</h3>
                            <p className="text-sm text-white/60 font-medium">Your feedback helps us create better rituals for you.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Post a Review</h3>
                                    <p className="text-[10px] text-[#C8956C] font-bold uppercase tracking-widest mt-1">
                                        {salon?.name || 'Signature Salon'}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Star Selection */}
                                <div className="flex items-center justify-center gap-2 py-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                strokeWidth={2}
                                                fill={star <= (hoveredRating || rating) ? '#C8956C' : 'none'}
                                                color={star <= (hoveredRating || rating) ? '#C8956C' : 'rgba(255,255,255,0.2)'}
                                                className="transition-colors duration-200"
                                            />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Name Input - High Visibility */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.2em] ml-2">Your Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={revName}
                                            onChange={(e) => setRevName(e.target.value)}
                                            placeholder="Enter your public name..."
                                            className="w-full h-14 bg-white/[0.06] border border-white/10 rounded-2xl px-5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/[0.1] focus:border-[#C8956C]/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Comment Area */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Ritual Experience</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Sharing your ritual experience helps others..."
                                        className="w-full bg-white/[0.04] border border-white/5 rounded-3xl p-5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.08] focus:border-[#C8956C]/30 transition-all min-h-[120px] resize-none font-medium leading-relaxed"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={rating === 0 || !revName.trim() || isSubmitting}
                                    className="w-full h-16 bg-[#C8956C] disabled:bg-white/5 disabled:text-white/20 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-[#C8956C]/20 mt-2"
                                >
                                    {isSubmitting ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        'PUBLISH RITUAL EXPERIENCE'
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
