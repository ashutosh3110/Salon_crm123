import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

export default function ReviewModal({ isOpen, onClose, booking, onSuccess, targetType = 'service', targetId = null, targetName = null }) {
    const { salon, activeSalonId } = useBusiness();
    const { customer } = useCustomerAuth();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [revName, setRevName] = useState(customer?.name || '');
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            if (customer?.name) setRevName(customer.name);
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        };
    }, [isOpen, customer]);

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
                // Reset state for next time
                setRating(0);
                setComment('');
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const colors = {
        bg: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        input: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
    };

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
                    className="relative w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl"
                    style={{ 
                        background: colors.bg,
                        borderColor: colors.border
                    }}
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
                            <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: colors.text }}>Thank You!</h3>
                            <p className="text-sm font-medium" style={{ color: colors.textMuted }}>Your feedback helps us create better services for you.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 flex items-center justify-between border-b" style={{ borderColor: colors.border }}>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight" style={{ color: colors.text }}>Post a Review</h3>
                                    <p className="text-[10px] text-[#C8956C] font-bold uppercase tracking-widest mt-1">
                                        {salon?.name || 'Signature Salon'}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 transition-all" style={{ color: colors.textMuted }}>
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
                                                color={star <= (hoveredRating || rating) ? '#C8956C' : (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)')}
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
                                            style={{ 
                                                background: colors.input,
                                                borderColor: colors.border,
                                                color: colors.text
                                            }}
                                            className="w-full h-14 border rounded-2xl px-5 text-sm placeholder:opacity-30 focus:outline-none focus:border-[#C8956C]/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Comment Area */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2" style={{ color: colors.textMuted }}>Your Experience</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Sharing your experience helps others..."
                                        style={{ 
                                            background: colors.input,
                                            borderColor: colors.border,
                                            color: colors.text
                                        }}
                                        className="w-full border rounded-3xl p-5 text-sm placeholder:opacity-20 focus:outline-none focus:border-[#C8956C]/30 transition-all min-h-[120px] resize-none font-medium leading-relaxed"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={rating === 0 || !revName.trim() || isSubmitting}
                                    className="w-full h-16 bg-[#C8956C] disabled:opacity-20 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-[#C8956C]/20 mt-2"
                                >
                                    {isSubmitting ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                    ) : (
                                        'SUBMIT FEEDBACK'
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
