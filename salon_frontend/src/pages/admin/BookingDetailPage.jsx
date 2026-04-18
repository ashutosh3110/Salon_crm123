import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Calendar as CalendarIcon,
    Clock,
    Store,
    Shield,
    FileText,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    UserPlus,
    XCircle,
    Info,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { maskPhone } from '../../utils/phoneUtils';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const statusColors = {
    upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
    'no-show': 'bg-red-50 text-red-600 border-red-100',
};

export default function BookingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { bookings, updateBookingStatus, fetchBookings } = useBusiness();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [isEditingNotes, setIsEditingNotes] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                // Find in context first
                let b = bookings.find(x => x._id === id || x.id === id);
                if (!b) {
                    await fetchBookings();
                }
            } catch (err) {
                console.error('Failed to fetch booking:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, bookings, fetchBookings]);

    useEffect(() => {
        const b = bookings.find(x => x._id === id || x.id === id);
        if (b) {
            setBooking(b);
            setNotes(b.notes || '');
        }
    }, [id, bookings]);

    const handleUpdateStatus = async (status) => {
        try {
            await updateBookingStatus(id, status);
            toast.success(`Status updated to ${status.toUpperCase()}`);
        } catch (error) {
            toast('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Loading Secure Booking Data...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-8 text-center bg-surface border border-border">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-lg font-black uppercase italic">Booking Not Found</h2>
                <button onClick={() => navigate('/admin/bookings')} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest border-b border-primary">Return to List</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-reveal pb-20">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-4 mb-2">
                <button 
                    onClick={() => navigate('/admin/bookings')}
                    className="p-2 bg-surface border border-border hover:bg-surface-alt transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="text-left">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1">Back to Overview</p>
                    <h1 className="text-xl font-black text-text uppercase italic font-mono tracking-tight leading-none">Booking #{booking._id?.slice(-8).toUpperCase()}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Header Block */}
                    <div className="bg-surface border border-border shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border ${statusColors[booking.status]}`}>
                                    {booking.status}
                                </span>
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5 opacity-40 italic">
                                    <Clock className="w-3.5 h-3.5" /> Booked {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date</p>
                                    <p className="text-lg font-black text-text uppercase italic font-mono">{new Date(booking.appointmentDate).toDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Time Slot</p>
                                    <p className="text-lg font-black text-text uppercase italic font-mono text-primary font-black">
                                        {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-wrap gap-2 md:flex-col items-stretch">
                            {booking.status === 'pending' && (
                                <button 
                                    onClick={() => handleUpdateStatus('confirmed')}
                                    className="px-6 py-2.5 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Confirm Now
                                </button>
                            )}
                            {['confirmed', 'upcoming'].includes(booking.status) && (
                                <button 
                                    onClick={() => handleUpdateStatus('completed')}
                                    className="px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    Complete Session
                                </button>
                            )}
                            {booking.status !== 'cancelled' && (
                                <button 
                                    onClick={() => handleUpdateStatus('cancelled')}
                                    className="px-6 py-2.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Service & Staff Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Service Info */}
                        <div className="bg-surface border border-border shadow-sm p-6 text-left">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest mb-6 border-b border-border pb-2 flex items-center justify-between">
                                Service Details <Shield className="w-4 h-4 text-primary" />
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-surface-alt border border-border group hover:border-primary transition-colors">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-text uppercase">{booking.service?.name || 'Standard Service'}</p>
                                    <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Duration: {booking.service?.duration || '45'} Mins</p>
                                </div>
                                <p className="text-xl font-black text-primary italic font-mono">₹{booking.price || booking.service?.price || 0}</p>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-surface border border-border shadow-sm p-6 text-left">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest mb-6 border-b border-border pb-2 flex items-center justify-between">
                                Assigned Expert <User className="w-4 h-4 text-primary" />
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-surface-alt border border-border flex items-center justify-center text-xl font-black italic group-hover:border-primary transition-colors">
                                    {booking.staff?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-text uppercase italic leading-none">{booking.staff?.name || 'Unassigned'}</p>
                                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-2 italic">Senior Stylist</p>
                                    <button className="mt-3 text-[9px] font-black text-text-muted uppercase border-b border-border hover:text-primary hover:border-primary transition-colors">Reassign Staff</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-surface border border-border shadow-sm p-6 text-left">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest mb-6 border-b border-border pb-2">Payment Transaction</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Amount</p>
                                <p className="text-2xl font-black text-text italic font-mono">₹{booking.price || 0}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Method</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    <p className="text-xs font-black text-text uppercase tracking-tighter">{booking.paymentMethod?.replace('_', ' ') || 'Pay at Salon'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</p>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                    {booking.paymentStatus || 'unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-surface border border-border shadow-sm p-6 text-left">
                         <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Internal Admin Notes</h3>
                            <button 
                                onClick={() => setIsEditingNotes(!isEditingNotes)}
                                className="text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest"
                            >
                                {isEditingNotes ? 'Cancel' : 'Edit Note'}
                            </button>
                        </div>
                        {isEditingNotes ? (
                            <div className="space-y-4">
                                <textarea 
                                    className="w-full p-4 bg-surface-alt border border-border text-[11px] font-black uppercase font-mono h-24 focus:border-text transition-all resize-none outline-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter administrative notes here..."
                                />
                                <button className="px-8 py-3 bg-text text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">Save Notes</button>
                            </div>
                        ) : (
                            <div className="p-4 bg-surface-alt border border-border border-dashed">
                                <p className="text-[11px] font-black text-text uppercase italic opacity-60 leading-relaxed">
                                    {notes || "No internal notes have been recorded for this booking yet."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Client Card & Activity */}
                <div className="space-y-6">
                    {/* Client Information */}
                    <div className="bg-text text-white p-8 relative overflow-hidden text-left">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 -mr-8 -mb-8 rounded-full border border-white/10" />
                        <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 italic">Customer Intelligence</h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black italic uppercase">
                                    {booking.client?.name?.[0] || 'C'}
                                </div>
                                <div className="text-left">
                                    <p className="text-xl font-black uppercase tracking-tight italic font-mono">{booking.client?.name || 'New Client'}</p>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Loyalty Rank: Gold</p>
                                </div>
                            </div>

                            <div className="space-y-4 py-8 border-y border-white/10">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <p className="text-xs font-medium tracking-tight uppercase font-mono">{maskPhone(booking.client?.phone, user?.role)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <p className="text-[10px] font-medium tracking-tight uppercase font-mono opacity-60">{booking.client?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Total Visits</p>
                                    <p className="text-xl font-black italic font-mono">14</p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Total Spent</p>
                                    <p className="text-xl font-black italic font-mono text-primary">₹8,490</p>
                                </div>
                            </div>

                            <button className="w-full py-4 border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group">
                                View History <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-surface border border-border shadow-sm p-6 text-left">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest mb-6 border-b border-border pb-2">Appointment Venue</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                                <div className="text-left">
                                    <p className="text-sm font-black text-text uppercase italic leading-none">{booking.outlet?.name || 'Main Salon Unit'}</p>
                                    <p className="text-[11px] text-text-muted font-bold tracking-tight mt-2 leading-relaxed italic opacity-80">
                                        {typeof booking.outlet?.address === 'object' 
                                            ? `${booking.outlet.address.street || ''}, ${booking.outlet.address.city || ''}, ${booking.outlet.address.state || ''} ${booking.outlet.address.pincode || ''}`
                                            : (booking.outlet?.address || 'Premium Plaza, Level 4, Civil Lines, Raipur')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline/Audit */}
                    <div className="bg-surface border border-border shadow-sm p-6 text-left">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest mb-6 border-b border-border pb-2">Booking Audit</h3>
                        <div className="space-y-4">
                            {[
                                { t: 'Booking Created', d: new Date(booking.createdAt).toLocaleString(), i: CheckCircle2, c: 'text-green-500' },
                                { t: 'Email Notification Sent', d: 'Automated System', i: Mail, c: 'text-primary' },
                                { t: 'Latest Update', d: new Date(booking.updatedAt).toLocaleString(), i: RotateCcw, c: 'text-blue-500' }
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <event.i className={`w-3.5 h-3.5 ${event.c}`} />
                                        {i !== 2 && <div className="w-[1px] h-full bg-border my-2" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-text uppercase leading-none mb-1">{event.t}</p>
                                        <p className="text-[8px] text-text-muted font-bold tracking-tighter uppercase font-mono">{event.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
