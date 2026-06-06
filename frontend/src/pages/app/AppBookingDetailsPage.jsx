import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    Calendar, 
    Clock, 
    User, 
    MapPin, 
    Phone, 
    MessageSquare, 
    CheckCircle2, 
    AlertCircle, 
    XCircle, 
    HelpCircle,
    Copy,
    Share2,
    Download,
    CreditCard
} from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBookingRegistry } from '../../contexts/BookingRegistryContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useBusiness } from '../../contexts/BusinessContext';
import ReviewModal from '../../components/app/ReviewModal';
import { Star } from 'lucide-react';

export default function AppBookingDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bookings } = useBookingRegistry();
    const { theme } = useCustomerTheme();
    const { salon: activeSalon } = useBusiness();
    const isLight = theme === 'light';

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        accent: '#C8956C'
    };

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await api.get(`/booking-details/${id}`);
                if (res.data?.success) {
                    const b = res.data.data;
                    setBooking({
                        ...b,
                        service: b.serviceId || b.service,
                        staff: b.staffId || b.staff,
                        outlet: b.outletId || b.outlet,
                        time: b.time
                    });
                } else {
                    setBooking(null);
                }
            } catch (err) {
                console.error('Failed to fetch booking details', err);
                setBooking(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const canCancel = useMemo(() => {
        if (!booking || (booking.status !== 'pending' && booking.status !== 'confirmed')) return false;
        
        const appointmentDate = new Date(booking.appointmentDate);
        const today = new Date();
        
        // Reset times to compare only dates
        appointmentDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Allowed if today is BEFORE appointmentDate
        return today < appointmentDate;
    }, [booking]);

    const handleCancel = async () => {
        if (!canCancel) {
            toast.error("Cancellations are not allowed on the day of the booking.");
            return;
        }
        
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
        
        setIsCancelling(true);
        try {
            // Using a generic status update if possible, or we'll need to check if backend supports it
            // For now, let's assume we can use a dedicated status endpoint or general update
            const res = await api.patch(`/bookings/${id}/status`, { status: 'cancelled' });
            if (res.data?.success) {
                toast.success('Booking cancelled successfully');
                setBooking(prev => ({ ...prev, status: 'cancelled' }));
            }
        } catch (err) {
            console.error('Cancellation error:', err);
            toast.error(err.response?.data?.message || 'Failed to cancel booking. Please contact the salon.');
        } finally {
            setIsCancelling(false);
        }
    };

    const statusConfig = {
        pending: { icon: AlertCircle, color: '#f59e0b', label: 'Awaiting Confirmation' },
        confirmed: { icon: CheckCircle2, color: '#3b82f6', label: 'Booking Confirmed' },
        completed: { icon: CheckCircle2, color: '#10b981', label: 'Session Completed' },
        cancelled: { icon: XCircle, color: '#6b7280', label: 'Booking Cancelled' },
        'no-show': { icon: HelpCircle, color: '#ef4444', label: 'No Show' }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#C8956C]/20 border-t-[#C8956C] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Retrieving details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: colors.bg }}>
                <AlertCircle size={48} className="text-red-500 mb-6 opacity-20" />
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Booking details not found</h2>
                <p className="text-xs opacity-40 font-bold uppercase tracking-widest leading-relaxed mb-8">The coordinate you are looking for does not exist or has been removed.</p>
                <button 
                    onClick={() => navigate('/app/bookings')}
                    className="px-8 py-4 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#C8956C]/20"
                >
                    Back to Bookings
                </button>
            </div>
        );
    }

    const currentStatus = statusConfig[booking.status] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    // Derived values for robust breakdown display
    const itemsTotal = booking?.subtotal ?? booking?.service?.price ?? 0;
    const totalAmount = booking?.totalPrice ?? booking?.price ?? 0;
    const taxAmount = booking?.tax ?? 0;
    // Calculate discount if it's explicitly stored OR infer it from the difference
    const membershipDiscount = booking?.membershipDiscount ?? Math.max(0, itemsTotal + taxAmount - totalAmount);
    const isInclusive = booking?.service?.isInclusiveTax === true || String(booking?.service?.isInclusiveTax) === 'true' || booking?.serviceId?.isInclusiveTax === true || String(booking?.serviceId?.isInclusiveTax) === 'true';
    const gstPercent = taxAmount > 0 ? Math.round((taxAmount / ((totalAmount - taxAmount) || 1)) * 100) : 18;
    const taxVal = taxAmount > 0 ? taxAmount : (isInclusive ? 
        (itemsTotal - membershipDiscount) * (1 - 1 / (1 + gstPercent / 100)) : 
        (itemsTotal - membershipDiscount) * (gstPercent / 100));
    
    const cgstVal = Number((taxVal / 2).toFixed(2));
    const sgstVal = Number((taxVal - cgstVal).toFixed(2));
    const taxableVal = totalAmount - cgstVal - sgstVal;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen pb-20"
            style={{ background: colors.bg }}
        >
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-[100] h-16 px-6 flex items-center justify-between" style={{ background: `${colors.bg}`, borderBottom: `1px solid ${colors.border}` }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ color: colors.text }}
                    className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 active:scale-90 transition-all shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-[10px] font-black uppercase tracking-[0.3em]">Session <span className="text-[#C8956C]">Details</span></h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="pt-20 px-6 space-y-6">
                {/* Status Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ background: `linear-gradient(135deg, ${currentStatus.color}22 0%, transparent 100%)`, border: `1px solid ${currentStatus.color}44` }}
                    className="rounded-[2rem] p-6 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: currentStatus.color }}>
                        <StatusIcon size={24} color="white" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Current Status</p>
                        <h2 className="text-sm font-black uppercase tracking-tight" style={{ color: currentStatus.color }}>{currentStatus.label}</h2>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                    {/* Price Breakdown Summary */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>{booking.service?.name}</h3>
                                <p className="text-xs font-bold text-[#C8956C] uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock size={12} /> {booking.service?.duration || 30} Minutes
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-dashed border-black/5 dark:border-white/5 space-y-2">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                                 <span>{isInclusive ? 'Subtotal (Incl. GST)' : 'Subtotal'}</span>
                                 <span>₹{itemsTotal.toLocaleString()}</span>
                             </div>
                             {membershipDiscount > 0 && (
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#C8956C]">
                                     <span>Membership Discount</span>
                                     <span>- ₹{membershipDiscount.toLocaleString()}</span>
                                 </div>
                             )}
                             {(taxAmount > 0 || !booking.tax) && (
                                 <div className="space-y-1.5 py-1 border-t border-black/5 dark:border-white/5">
                                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                                         <span>GST ({isInclusive ? 'Included' : 'Excluding'})</span>
                                         <span>{isInclusive ? '' : '+ '}₹{taxVal.toFixed(2)}</span>
                                     </div>
                                     <div className="flex justify-between text-[9px] pl-2 font-bold uppercase tracking-wider opacity-30 italic">
                                         <span>CGST ({isInclusive ? 'Included' : `${(gstPercent / 2).toFixed(1)}%`})</span>
                                         <span>{isInclusive ? '' : '+ '}₹{cgstVal.toFixed(2)}</span>
                                     </div>
                                     <div className="flex justify-between text-[9px] pl-2 font-bold uppercase tracking-wider opacity-30 italic">
                                         <span>SGST ({isInclusive ? 'Included' : `${(gstPercent / 2).toFixed(1)}%`})</span>
                                         <span>{isInclusive ? '' : '+ '}₹{sgstVal.toFixed(2)}</span>
                                     </div>
                                 </div>
                             )}
                             <div className="flex justify-between items-center pt-2">
                                 <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: colors.text }}>Total Paid</span>
                                 <span className="text-2xl font-black text-[#C8956C] tracking-tighter pr-2">₹{totalAmount.toLocaleString()}</span>
                             </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent" />

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-y-8">
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                <Calendar size={10} className="text-[#C8956C]" /> Date
                            </p>
                            <p className="text-sm font-bold uppercase tracking-tight">
                                {new Date(booking.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                <Clock size={10} className="text-[#C8956C]" /> Time
                            </p>
                            <p className="text-sm font-bold uppercase tracking-tight">
                                {booking.time || new Date(booking.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                <User size={10} className="text-[#C8956C]" /> Expert
                            </p>
                            <p className="text-sm font-bold uppercase tracking-tight">{booking.staff?.name}</p>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                <MapPin size={10} className="text-[#C8956C]" /> Branch & Salon
                            </p>
                            <div>
                                <p className="text-base font-black uppercase tracking-tight leading-tight" style={{ color: colors.text }}>
                                    {booking.outlet?.name || 'Main Outlet'}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#C8956C] mt-1">
                                    {booking.tenantId?.name || activeSalon?.name || 'Elite Salon'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <div className="p-4 rounded-2xl border border-dashed border-black/10 dark:border-white/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                        <CreditCard size={10} className="text-[#C8956C]" /> Payment Protocol
                                    </p>
                                    <p className="text-sm font-black uppercase tracking-tight" style={{ color: colors.text }}>
                                        {booking.paymentMethod === 'wallet' ? 'Paid via Wallet' : 
                                         booking.paymentMethod === 'salon' || booking.paymentMethod === 'offline' ? 'Pay at Salon' : 
                                         booking.paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Status</p>
                                    <p className="text-[10px] font-bold uppercase text-green-500">
                                        {booking.paymentStatus === 'paid' ? 'Completed' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent" />

                    {/* Booking ID & Actions */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Booking ID</p>
                            <p className="text-xs font-mono font-bold opacity-70">#{booking._id?.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(booking._id);
                                    toast.success('ID Copied!');
                                }}
                                className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 active:scale-90 transition-all"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* Cancel Policy */}
                <div className="p-6 rounded-3xl border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center gap-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] leading-relaxed text-center opacity-40">
                        Cancellations are permitted up to 24 hours before the session.
                    </p>
                    {(!canCancel && (booking.status === 'pending' || booking.status === 'confirmed')) && (
                        <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest text-center">
                            Note: Today is the day of your booking. Online cancellation is now closed.
                        </p>
                    )}
                </div>
            </main>

            {/* Bottom Bar */}
            <footer className="fixed bottom-0 inset-x-0 p-6 z-50 flex gap-3">
                {booking.status === 'completed' && (
                    <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex-1 py-5 rounded-[2rem] bg-white border border-[#C8956C] text-[#C8956C] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        Review <Star size={14} fill="#C8956C" />
                    </button>
                )}

                {booking.status === 'confirmed' || booking.status === 'pending' ? (
                    <button 
                        onClick={handleCancel}
                        disabled={!canCancel || isCancelling}
                        style={{ opacity: canCancel ? 1 : 0.4 }}
                        className="w-full py-5 rounded-[2rem] bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        {isCancelling ? 'Processing...' : 'Cancel Booking'} <XCircle size={14} />
                    </button>
                ) : (
                    <button 
                        onClick={() => navigate('/app/booking')}
                        className={`py-5 rounded-[2rem] bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${booking.status === 'completed' ? 'flex-1' : 'w-full'}`}
                    >
                        Book Again <Clock size={14} />
                    </button>
                )}
            </footer>

            <ReviewModal 
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                booking={booking}
                onSuccess={() => {
                    setIsReviewModalOpen(false);
                    toast.success('Thank you for your feedback!');
                }}
            />
        </motion.div>
    );
}
