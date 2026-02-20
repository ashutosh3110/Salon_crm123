import { useState, useEffect } from 'react';
import ModulePage from '../../../components/common/ModulePage';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';
import { useApi } from '../../../hooks/useApi';
import {
    HiOutlineCalendar,
    HiOutlinePlus,
    HiOutlineClock,
    HiOutlineUser,
} from 'react-icons/hi';

const BookingListPage = () => {
    const [bookings, setBookings] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const { get, post, loading } = useApi();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await get('/bookings', null, { silent: true });
            setBookings(data?.bookings || data?.data || []);
        } catch { }
    };

    const statusColor = {
        pending: 'amber',
        confirmed: 'blue',
        in_progress: 'purple',
        completed: 'emerald',
        cancelled: 'red',
        no_show: 'gray',
    };

    return (
        <ModulePage title="Bookings" description="Manage appointments and scheduling" icon={HiOutlineCalendar}>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
                        <button
                            key={tab}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-white/5 border border-border-light dark:border-border-dark text-text-secondary dark:text-gray-400 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer first:bg-primary/10 first:text-primary first:border-primary/30"
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>New Booking</Button>
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    icon={HiOutlineCalendar}
                    title="No bookings yet"
                    description="Create your first booking to get started"
                    action={<Button icon={HiOutlinePlus} onClick={() => setShowAddModal(true)}>Create Booking</Button>}
                />
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => (
                        <Card key={booking._id} hover padding="md">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <HiOutlineClock className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary dark:text-white">{booking.clientName || 'Client'}</p>
                                        <p className="text-xs text-text-secondary dark:text-gray-400">{booking.serviceName || 'Service'} • {booking.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm text-text-primary dark:text-white font-medium">{booking.time}</p>
                                        <p className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-1">
                                            <HiOutlineUser className="w-3 h-3" /> {booking.stylistName || 'Assigned'}
                                        </p>
                                    </div>
                                    <Badge color={statusColor[booking.status] || 'gray'}>{booking.status || 'pending'}</Badge>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Booking" size="lg">
                <p className="text-text-secondary dark:text-gray-400 text-sm">Booking form will be implemented with full service, stylist, and time slot selection.</p>
            </Modal>
        </ModulePage>
    );
};

export default BookingListPage;
