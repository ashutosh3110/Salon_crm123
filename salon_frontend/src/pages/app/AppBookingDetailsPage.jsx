import { useState, useEffect } from 'react';
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

export default function AppBookingDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bookings } = useBookingRegistry();
    const { theme } = useCustomerTheme();
    const { salon: activeSalon } = useBusiness();
    const isLight = theme === 'light';

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

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
            try {
                // First check registry
                const found = bookings.find(b => b._id === id || b.id === id);
                if (found) {
                    setBooking(found);
                    setLoading(false);
                    return;
                }

                // If not in registry (e.g. direct link), fetch from API
                const res = await api.get(`/bookings/${id}`);
                if (res.data?.success) {
                    const b = res.data.data;
                    setBooking({
                        ...b,
                        service: b.serviceId || b.service,
                        staff: b.staffId || b.staff,
                        outlet: b.outletId || b.outlet
                    });
                }
            } catch (err) {
                console.error('Failed to fetch booking details', err);
                toast.error('Could not load booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, bookings]);

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
                <h2 className="text-xl font-black uppercase tracking-tight mb-2">Booking Not Found</h2>
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
    const itemsTotal = booking?.subtotal || booking?.service?.price || 0;
    const totalAmount = booking?.totalPrice || booking?.price || 0;
    // Calculate discount if it's explicitly stored OR infer it from the difference
    const membershipDiscount = booking?.membershipDiscount || Math.max(0, itemsTotal - totalAmount);

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
                                 <span>Subtotal</span>
                                 <span>₹{itemsTotal.toLocaleString()}</span>
                             </div>
                             {membershipDiscount > 0 && (
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#C8956C]">
                                     <span>Membership Discount</span>
                                     <span>- ₹{membershipDiscount.toLocaleString()}</span>
                                 </div>
                             )}
                             <div className="flex justify-between items-center pt-2">
                                 <span className="text-[12px] font-black uppercase tracking-widest" style={{ color: colors.text }}>Total Paid</span>
                                 <span className="text-2xl font-black text-[#C8956C] tracking-tighter">₹{totalAmount.toLocaleString()}</span>
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
                                {new Date(booking.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                <div className="p-6 rounded-3xl border border-dashed border-black/10 dark:border-white/10 opacity-40">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] leading-relaxed text-center">
                        Free cancellation available up to 4 hours before the session. Post that, cancellation charges may apply as per salon policy.
                    </p>
                </div>
            </main>

            {/* Bottom Bar */}
            <footer className="fixed bottom-0 inset-x-0 p-6 z-50">
                {booking.status === 'confirmed' || booking.status === 'pending' ? (
                    <button 
                        className="w-full py-5 rounded-[2rem] bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        Reschedule <Calendar size={14} />
                    </button>
                ) : (
                    <button 
                        onClick={() => navigate('/app/booking')}
                        className="w-full py-5 rounded-[2rem] bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        Book Again <Clock size={14} />
                    </button>
                )
            }
            </footer>
        </motion.div>
    );
}
