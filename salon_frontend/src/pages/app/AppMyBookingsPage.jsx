import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BookingCard from '../../components/app/BookingCard';
import { MOCK_BOOKINGS } from '../../data/appMockData';
import { CalendarX } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const tabs = ['Upcoming', 'Past'];

export default function AppMyBookingsPage() {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    // TODO: Replace with api.get('/bookings?clientId=...')
    const bookings = MOCK_BOOKINGS;

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
        const upcoming = bookings.filter(b =>
            ['pending', 'confirmed'].includes(b.status) && new Date(b.appointmentDate) >= now
        ).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

        const past = bookings.filter(b =>
            ['completed', 'cancelled'].includes(b.status) || new Date(b.appointmentDate) < now
        ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        return { upcoming, past };
    }, [bookings]);

    const displayBookings = activeTab === 'Upcoming' ? upcoming : past;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 px-4 pb-8"
            style={{ background: colors.bg, minHeight: '100svh' }}
        >
            <div className="pt-12 pb-2">
                <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>
                    My <span className="text-[#C8956C]">Bookings</span>
                </h1>
                <p className="text-xs uppercase tracking-widest mt-1 opacity-60" style={{ color: colors.textMuted }}>Track your sessions</p>
            </div>

            {/* Tab Switcher */}
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
                {displayBookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: colors.card, border: `1px dashed ${colors.border}` }}
                        className="text-center py-20 rounded-3xl"
                    >
                        <div style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarX className="w-8 h-8 opacity-20" style={{ color: colors.text }} />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>No {activeTab.toLowerCase()} bookings</p>
                        <p className="text-[10px] mt-2 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed opacity-40" style={{ color: colors.textMuted }}>
                            {activeTab === 'Upcoming' ? 'Book your next session to enjoy top-tier service' : 'Your history is currently a clean state'}
                        </p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/app/book')}
                            className="mt-8 px-8 py-3 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C8956C]/20"
                        >
                            Book Now
                        </motion.button>
                    </motion.div>
                ) : (
                    displayBookings.map((booking, i) => (
                        <BookingCard key={booking._id} booking={booking} index={i} />
                    ))
                )}
            </div>
        </motion.div>
    );
}
