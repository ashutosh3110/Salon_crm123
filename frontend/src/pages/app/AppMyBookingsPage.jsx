import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BookingCard from '../../components/app/BookingCard';
import ReviewModal from '../../components/app/ReviewModal';
import { CalendarX, Loader2 } from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import api from '../../services/api';

const tabs = ['Upcoming', 'Past'];

const BookingSkeleton = () => {
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    
    return (
        <div 
            className="rounded-2xl p-5 border animate-pulse"
            style={{ 
                background: isLight ? '#FFFFFF' : '#1A1A1A',
                borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-md" style={{ background: bg }} />
                    <div className="h-3 w-1/2 rounded-md" style={{ background: bg }} />
                </div>
                <div className="h-7 w-20 rounded-lg" style={{ background: bg }} />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t" style={{ borderTopColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }}>
                <div className="h-3 w-20 rounded-md" style={{ background: bg }} />
                <div className="h-3 w-20 rounded-md" style={{ background: bg }} />
                <div className="ml-auto h-5 w-16 rounded-md" style={{ background: bg }} />
            </div>
        </div>
    );
};

export default function AppMyBookingsPage() {
    const { customer } = useCustomerAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
    
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    // FETCH GUARD
    const lastFetchedCustomerId = useRef(null);

    const fetchBookings = useCallback(async (force = false) => {
        if (!customer?._id) return;
        if (!force && lastFetchedCustomerId.current === customer._id) return;
        
        lastFetchedCustomerId.current = customer._id;
        setLoading(true);
        
        try {
            const res = await api.get(`/bookings/customer/${customer._id}`);
            if (res.data?.success) {
                const data = res.data.data || [];
                // Format for components
                const formatted = data.map(b => ({
                    ...b,
                    id: b._id,
                    service: b.serviceId || b.service,
                    staff: b.staffId || b.staff,
                    outlet: b.outletId || b.outlet,
                    appointmentDate: b.appointmentDate || b.date
                }));
                setBookings(formatted);
            }
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            lastFetchedCustomerId.current = null; // Allow retry on error
        } finally {
            setLoading(false);
        }
    }, [customer?._id]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        toggle: isLight ? '#EDF0F2' : '#1A1A1A',
    };

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const upcoming = bookings.filter(b => {
            const bDate = new Date(b.appointmentDate);
            bDate.setHours(0,0,0,0);
            // Keep cancelled bookings in upcoming if the date hasn't passed yet
            return (['pending', 'confirmed', 'cancelled'].includes(b.status) && bDate >= now);
        }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

        const past = bookings.filter(b => {
            const bDate = new Date(b.appointmentDate);
            bDate.setHours(0,0,0,0);
            // Past is completed, no-show, or anything that has already happened
            return (['completed', 'no-show'].includes(b.status) || bDate < now);
        }).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        return { upcoming, past };
    }, [bookings]);

    const displayBookings = activeTab === 'Upcoming' ? upcoming : past;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: colors.bg, minHeight: '100svh' }}
                className="pb-10"
            >
                {/* Header */}
                <div className="sticky top-0 z-50 px-4 pt-6 pb-4 flex items-center justify-between" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                    <div className="flex items-center gap-3">
                        <AppBackButton />
                        <h1 className="text-xl font-black italic tracking-tight" style={{ color: colors.text }}>My Rituals</h1>
                    </div>
                </div>

                <div className="px-4 space-y-6">
                <div style={{ background: colors.toggle, border: `1px solid ${colors.border}` }} className="flex gap-1 rounded-2xl p-1 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'text-white' : (isLight ? 'text-gray-400' : 'text-white/30')
                                }`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="bookingsTab"
                                    className="absolute inset-0 bg-[#C8956C] rounded-xl shadow-lg shadow-[#C8956C]/20"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{tab} <span className="opacity-50 ml-1">({tab === 'Upcoming' ? upcoming.length : past.length})</span></span>
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <BookingSkeleton key={i} />)}
                        </div>
                    ) : displayBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ background: colors.card, border: `1px dashed ${colors.border}` }}
                            className="text-center py-20 rounded-3xl"
                        >
                            <div style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarX className="w-8 h-8 opacity-20" style={{ color: colors.text }} />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>
                                {activeTab === 'Upcoming' ? 'No recent bookings' : 'No past bookings available'}
                            </p>
                            <p className="text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed opacity-40" style={{ color: colors.textMuted }}>
                                {activeTab === 'Upcoming' ? 'Book your next session to enjoy top-tier service' : 'Your history is currently a clean state'}
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/app/booking')}
                                className="mt-8 px-8 py-3 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C8956C]/20"
                            >
                                Book Now
                            </motion.button>
                        </motion.div>
                    ) : (
                        displayBookings.map((booking, i) => (
                            <BookingCard
                                key={booking._id}
                                booking={{
                                    ...booking,
                                    onRate: () => setSelectedReviewBooking(booking)
                                }}
                                index={i}
                                onTap={(b) => navigate(`/app/bookings/${b._id}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </motion.div>

            <ReviewModal
                isOpen={!!selectedReviewBooking}
                onClose={() => setSelectedReviewBooking(null)}
                booking={selectedReviewBooking}
                onSuccess={() => {
                    fetchBookings(true);
                }}
            />
        </>
    );
}
