import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import BookingCard from '../../components/app/BookingCard';
import { MOCK_BOOKINGS } from '../../data/appMockData';
import { CalendarX } from 'lucide-react';

const tabs = ['Upcoming', 'Past'];

export default function AppMyBookingsPage() {
    const [activeTab, setActiveTab] = useState('Upcoming');

    // TODO: Replace with api.get('/bookings?clientId=...')
    const bookings = MOCK_BOOKINGS;

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
            style={{ background: '#141414', minHeight: '100svh' }}
        >
            <div className="pt-12 pb-2">
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">My <span className="text-[#C8956C]">Bookings</span></h1>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Track your sessions</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-[#1A1A1A] rounded-2xl p-1 border border-white/5">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'text-white' : 'text-white/30'
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
                        className="text-center py-20 bg-[#1A1A1A] rounded-[2rem] border border-dashed border-white/10"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <CalendarX className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-[11px] font-black text-white uppercase tracking-[0.2em]">No {activeTab.toLowerCase()} bookings</p>
                        <p className="text-[10px] text-white/30 mt-2 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                            {activeTab === 'Upcoming' ? 'Book your next session to dominate the field' : 'Your history is currently a clean state'}
                        </p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/app/book')}
                            className="mt-8 px-8 py-3 bg-[#C8956C] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-none hover:bg-white hover:text-black transition-all"
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
