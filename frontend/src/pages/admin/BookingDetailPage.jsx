import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Calendar, 
    Clock, 
    User, 
    CreditCard, 
    AlertCircle, 
    CheckCircle2, 
    MapPin, 
    Phone, 
    Mail, 
    Zap, 
    RotateCcw,
    XCircle,
    FileText,
    History,
    ShieldCheck,
    Store,
    Smartphone
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { toast } from 'react-hot-toast';

const statusColors = {
    upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
    confirmed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cancelled: 'bg-gray-50 text-gray-400 border-gray-100',
    'no-show': 'bg-rose-50 text-rose-600 border-rose-100',
};

const paymentStatusColors = {
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    unpaid: 'bg-rose-50 text-rose-600 border-rose-100',
    failed: 'bg-red-50 text-red-600 border-red-100',
};

export default function BookingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { bookings, fetchBookings, updateBookingStatus } = useBusiness();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            if (bookings.length === 0) {
                await fetchBookings();
            }
            setLoading(false);
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdatePaymentStatus = async (paymentStatus) => {
        try {
            await updateBookingStatus(id, { paymentStatus });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Syncing Booking Protocol...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-12 text-center bg-surface border border-border rounded-3xl shadow-sm">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Protocol 404</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-8">The requested booking record does not exist in the mainframe.</p>
                <button 
                    onClick={() => navigate('/admin/bookings')} 
                    className="px-8 py-3 bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                    Return to Overview
                </button>
            </div>
        );
    }

    const client = booking.clientId || booking.client || {};

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-reveal pb-24 px-4">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate('/admin/bookings')}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all group shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-text uppercase tracking-tight">Booking #{booking._id?.slice(-8).toUpperCase()}</h1>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status]}`}>
                                {booking.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                            <Smartphone className="w-3.5 h-3.5" /> Booked via {booking.source || 'Admin'} on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {booking.status === 'pending' && (
                        <>
                            <button 
                                onClick={() => handleUpdateStatus('confirmed')}
                                className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Accept Booking
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus('cancelled')}
                                className="px-6 py-3 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Reject
                            </button>
                        </>
                    )}
                    {booking.status === 'confirmed' && (
                        <button 
                            onClick={() => handleUpdateStatus('completed')}
                            className="px-8 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" /> Complete Session
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Primary Info Card */}
                    <div className="bg-surface border border-border rounded-[2.5rem] p-10 relative overflow-hidden shadow-sm">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-primary" /> Appointment Date
                                    </p>
                                    <p className="text-2xl font-black text-text uppercase italic tracking-tight">
                                        {new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-primary" /> Time Slot
                                    </p>
                                    <p className="text-2xl font-black text-text uppercase italic tracking-tight">
                                        {booking.time || 'Not Specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8 p-8 rounded-[2rem] bg-surface-alt/50 border border-border/50">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assigned Expert</p>
                                        <h3 className="text-xl font-black text-text uppercase tracking-tight">{booking.staffId?.name || 'Unassigned'}</h3>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{booking.staffId?.role || 'Staff'}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center font-black text-lg text-primary shadow-sm">
                                        {booking.staffId?.name?.[0] || '?'}
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl border border-dashed border-border hover:border-primary/50 hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                    <RotateCcw className="w-3.5 h-3.5" /> Reassign Staff
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Services & Payment Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Service Details */}
                        <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-border">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Service Profile</h3>
                                <ShieldCheck className="w-4 h-4 text-text-muted opacity-30" />
                            </div>
                            <div className="flex items-center justify-between p-5 rounded-3xl bg-surface-alt border border-border/50 group hover:border-primary/30 transition-all">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{booking.serviceId?.name || 'Test Service'}</p>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">Duration: {booking.duration || 30} Mins</p>
                                </div>
                                <p className="text-lg font-black text-text italic font-mono">₹{booking.totalPrice || 0}</p>
                            </div>
                        </div>

                        {/* Payment Transaction */}
                        <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-border">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Payment Transaction</h3>
                                <CreditCard className="w-4 h-4 text-text-muted opacity-30" />
                            </div>
                            
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Method</p>
                                    <span className="text-[10px] font-black text-text uppercase tracking-tight px-3 py-1 bg-surface-alt rounded-lg border border-border">
                                        {booking.paymentMethod?.toUpperCase() || 'SALON'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Status</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${paymentStatusColors[booking.paymentStatus || 'unpaid']}`}>
                                            {booking.paymentStatus || 'pending'}
                                        </span>
                                        {booking.paymentStatus !== 'paid' ? (
                                            <button 
                                                onClick={() => handleUpdatePaymentStatus('paid')}
                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleUpdatePaymentStatus('unpaid')}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Mark as Unpaid"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-border flex items-center justify-between">
                                    <p className="text-[11px] font-black text-text uppercase tracking-widest">Total Payable</p>
                                    <p className="text-2xl font-black text-primary italic font-mono tracking-tighter">₹{booking.totalPrice || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Internal Admin Notes</h3>
                                <FileText className="w-3.5 h-3.5 text-text-muted opacity-30" />
                            </div>
                            <button 
                                onClick={() => setIsEditingNotes(!isEditingNotes)}
                                className="text-[9px] font-black text-primary hover:underline italic uppercase tracking-widest"
                            >
                                {isEditingNotes ? 'Cancel Editing' : 'Edit Note'}
                            </button>
                        </div>
                        {isEditingNotes ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <textarea 
                                    className="w-full p-6 bg-surface-alt border border-border rounded-3xl text-[11px] font-bold text-text uppercase font-mono h-32 focus:border-primary/50 transition-all resize-none outline-none shadow-inner"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add secure internal notes..."
                                />
                                <div className="flex justify-end gap-3">
                                    <button 
                                        onClick={() => setIsEditingNotes(false)}
                                        className="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                await updateBookingStatus(id, { notes });
                                                setIsEditingNotes(false);
                                            } catch (e) {}
                                        }}
                                        className="px-8 py-2 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                                    >
                                        Sync Note
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-3xl bg-surface-alt/30 border border-border/50 italic text-[11px] font-medium text-text-muted leading-relaxed">
                                {notes || 'No secure internal logs recorded for this transaction.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Intelligence & Metadata */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Intelligence Card */}
                    <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="p-8 bg-black text-white relative">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 -mr-16 -mt-16 rotate-45" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Customer Intelligence</h3>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-2xl text-primary shadow-xl">
                                    {client.name?.[0] || 'G'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">{client.name || 'GUEST'}</h2>
                                    <span className="px-3 py-1 bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                        Loyalty Rank: Gold
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4 pb-6 border-b border-border">
                                <div className="flex items-center gap-4 text-text-muted">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-black font-mono">{client.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-text-muted">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-black truncate max-w-[200px]">{client.email || 'NO_MAIL_SYNCED'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-surface-alt border border-border/50 text-center">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Total Visits</p>
                                    <p className="text-xl font-black text-text italic font-mono">{client.totalVisits || 0}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-surface-alt border border-border/50 text-center">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Total Spent</p>
                                    <p className="text-xl font-black text-text italic font-mono">₹{client.totalSpend || 0}</p>
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-surface-alt border border-border hover:bg-black hover:text-white hover:border-black transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group">
                                View History <History className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Appointment Venue */}
                    <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em] opacity-40">Appointment Venue</h3>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-text uppercase tracking-tight">{booking.outletId?.name || 'Main Outlet'}</p>
                                <p className="text-[10px] font-bold text-text-muted leading-relaxed">
                                    {booking.outletId?.address?.street || 'Shop No 19/2 Bike Gally Kismat Nagar, CST Road, near Kanakia, Kurla West, Kurla, Mumbai, Maharashtra 400070, India, Konkan Division, Maharashtra 400070'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Audit */}
                    <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em] opacity-40">Booking Audit</h3>
                        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                            <div className="relative pl-8 group">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-surface shadow-sm group-hover:scale-125 transition-all" />
                                <p className="text-[10px] font-black text-text uppercase tracking-tight">Booking Created</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{new Date(booking.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="relative pl-8 group opacity-60">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-4 border-surface shadow-sm group-hover:scale-125 transition-all" />
                                <p className="text-[10px] font-black text-text uppercase tracking-tight">Email Notification Sent</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest italic">Automated System</p>
                            </div>
                            <div className="relative pl-8 group">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm group-hover:scale-125 transition-all" />
                                <p className="text-[10px] font-black text-text uppercase tracking-tight">Latest Update</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{new Date(booking.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
