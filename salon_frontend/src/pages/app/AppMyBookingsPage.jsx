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
        <div className="space-y-5">
            <h1 className="text-xl font-extrabold text-text">My Bookings</h1>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-surface rounded-xl p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? 'text-primary' : 'text-text-muted'
                            }`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="bookingsTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{tab} ({tab === 'Upcoming' ? upcoming.length : past.length})</span>
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-2.5">
                {displayBookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-3">
                            <CalendarX className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-sm font-bold text-text">No {activeTab.toLowerCase()} bookings</p>
                        <p className="text-xs text-text-muted mt-1">
                            {activeTab === 'Upcoming' ? 'Book your next appointment to see it here' : 'Your completed visits will appear here'}
                        </p>
                    </motion.div>
                ) : (
                    displayBookings.map((booking, i) => (
                        <BookingCard key={booking._id} booking={booking} index={i} />
                    ))
                )}
            </div>
        </div>
    );
}
