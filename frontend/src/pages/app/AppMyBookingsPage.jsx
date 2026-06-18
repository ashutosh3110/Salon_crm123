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

import { ChevronLeft } from 'lucide-react';

const tabs = ['Upcoming', 'Completed', 'Cancelled'];

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
    const { colors: themeColors, theme } = useCustomerTheme();
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
        bg: '#FFFFFF',
        card: '#FFFFFF',
        text: themeColors.text || '#1A1A1A',
        textMuted: themeColors.textMuted || '#666',
        border: themeColors.border || 'rgba(0,0,0,0.07)',
        toggle: isLight ? '#F3F4F6' : '#1A1A1A',
        accent: themeColors.accent || '#B4912B',
    };

    const { upcoming, completed, cancelled } = useMemo(() => {
        const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
        const completed = bookings.filter(b => b.status === 'completed');
        const cancelled = bookings.filter(b => b.status === 'cancelled');
        return { upcoming, completed, cancelled };
    }, [bookings]);

    const displayBookings = useMemo(() => {
        if (activeTab === 'Upcoming') return upcoming;
        if (activeTab === 'Completed') return completed;
        return cancelled;
    }, [activeTab, upcoming, completed, cancelled]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: '#FFFFFF', minHeight: '100svh' }}
                className="pb-10"
            >
                {/* Redesigned Header to match screenshot */}
                <div className="sticky top-0 z-50 px-4 py-4 flex items-center" style={{ background: '#FFFFFF', position: 'relative' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', left: '16px' }}>
                        <ChevronLeft size={24} color="#000000" />
                    </button>
                    <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: '700', color: '#000000', margin: 0 }}>My Bookings</h1>
                </div>

                {/* Redesigned Tabs to match screenshot */}
                <div style={{ display: 'flex', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 8px' }}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? '#B4912B' : '#718096',
                                    position: 'relative',
                                    transition: 'color 0.2s ease',
                                }}
                            >
                                {tab}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabUnderline"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '10%',
                                            right: '10%',
                                            height: '2px',
                                            background: '#B4912B',
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="px-4 mt-6">
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
                                    No {activeTab.toLowerCase()} bookings found
                                </p>
                                <p className="text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed opacity-40" style={{ color: colors.textMuted }}>
                                    Your history is currently a clean state
                                </p>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/app/booking')}
                                    style={{ background: colors.accent, boxShadow: `0 8px 20px ${colors.accent}40` }}
                                    className="mt-8 px-8 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl"
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
