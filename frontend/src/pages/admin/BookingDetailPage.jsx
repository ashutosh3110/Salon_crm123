import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    Smartphone,
    Loader2,
    Edit,
    Scissors
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../services/api';

// Image URL Resolver
const getImageUrl = (path) => {
    if (!path) return null;
    
    if (path.includes('wapixo.com/uploads') && !path.includes('api.wapixo.com/uploads')) {
        path = path.replace('wapixo.com/uploads', 'api.wapixo.com/uploads');
    }
    
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL.replace(/\/api\//, '/');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const statusColors = {
    upcoming: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    confirmed: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
    pending: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    completed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    cancelled: 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-450 border-gray-100 dark:border-slate-700',
    'no-show': 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
};

const paymentStatusColors = {
    paid: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    pending: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    unpaid: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
    failed: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50',
};

export default function BookingDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        bookings,
        fetchBookings,
        updateBookingStatus,
        invoices,
        fetchInvoices,
        platformSettings,
        fetchPlatformSettings,
        staff,
        fetchStaff,
        services,
        fetchServices
    } = useBusiness();
    const [booking, setBooking] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        serviceId: '',
        staffId: '',
        date: '',
        time: '',
        notes: ''
    });

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        if (new URLSearchParams(location.search).get('edit') === 'true') {
            navigate(`/admin/bookings/${id}`, { replace: true });
        }
    };

    useEffect(() => {
        if (booking && new URLSearchParams(location.search).get('edit') === 'true') {
            setIsEditModalOpen(true);
        }
    }, [booking, location.search]);

    useEffect(() => {
        if (booking && isEditModalOpen) {
            const formattedDate = booking.appointmentDate ? new Date(booking.appointmentDate).toISOString().split('T')[0] : '';
            const formattedTime = booking.time || (booking.appointmentDate ? new Date(booking.appointmentDate).toTimeString().substring(0, 5) : '10:00');
            setEditForm({
                serviceId: booking.serviceId?._id || booking.serviceId || '',
                staffId: booking.staffId?._id || booking.staffId || '',
                date: formattedDate,
                time: formattedTime,
                notes: booking.notes || ''
            });
        }
    }, [booking, isEditModalOpen]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (isUpdating) return;
        
        const selectedService = services.find(s => s._id === editForm.serviceId);
        if (!selectedService) {
            toast.error('Invalid service selected');
            return;
        }

        const isInclusive = selectedService.isInclusiveTax === true || String(selectedService.isInclusiveTax) === 'true';
        const gstRate = (selectedService.gst !== undefined && selectedService.gst !== null) ? selectedService.gst : (platformSettings?.serviceGst || 18);
        const original = selectedService.price || 0;
        let subtotal = 0;
        let tax = 0;
        let total = 0;
        if (isInclusive) {
            subtotal = Number((original / (1 + (gstRate / 100))).toFixed(2));
            tax = Number((original - subtotal).toFixed(2));
            total = Number(original.toFixed(2));
        } else {
            subtotal = Number(original.toFixed(2));
            tax = Number((subtotal * (gstRate / 100)).toFixed(2));
            total = Number((subtotal + tax).toFixed(2));
        }

        try {
            setIsUpdating(true);
            const appointmentDate = new Date(`${editForm.date}T${editForm.time}`).toISOString();
            
            await updateBookingStatus(id, {
                serviceId: editForm.serviceId,
                staffId: editForm.staffId,
                appointmentDate,
                time: editForm.time,
                notes: editForm.notes,
                duration: Number(selectedService.duration || 30),
                subtotal,
                tax,
                totalPrice: total
            });
            
            setIsEditModalOpen(false);
            navigate(`/admin/bookings/${id}`, { replace: true });
            toast.success('Booking updated successfully');
        } catch (error) {
            toast.error('Failed to update booking');
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const fetchedRef = React.useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;

        const fetchDetail = async () => {
            setLoading(true);
            try {
                const promises = [];
                if (staff?.length === 0 && fetchStaff) promises.push(fetchStaff());
                if (bookings?.length === 0 && fetchBookings) promises.push(fetchBookings());
                if (services?.length === 0 && fetchServices) promises.push(fetchServices());
                if ((!invoices || invoices.length === 0) && fetchInvoices) promises.push(fetchInvoices());
                if (!platformSettings && fetchPlatformSettings) promises.push(fetchPlatformSettings());

                if (promises.length > 0) {
                    await Promise.all(promises);
                }
            } finally {
                fetchedRef.current = true;
                setLoading(false);
            }
        };
        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const b = bookings.find(x => x._id === id || x.id === id);
        if (b) {
            setBooking(b);
            setNotes(b.notes || '');

            // Find associated invoice
            const inv = invoices?.find(i => String(i.bookingId?._id || i.bookingId) === String(b._id));
            if (inv) setInvoice(inv);
        }
    }, [id, bookings, invoices]);

    const handleUpdateStatus = async (status) => {
        if (isUpdating) return;
        try {
            setIsUpdating(true);
            await updateBookingStatus(id, status);
            toast.success(`Booking status updated to ${status}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async (paymentStatus) => {
        if (isUpdating) return;
        try {
            setIsUpdating(true);
            await updateBookingStatus(id, { paymentStatus });
            toast.success(`Payment status updated to ${paymentStatus}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update payment status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReassignStaff = async (staffId) => {
        if (isUpdating) return;
        try {
            setIsUpdating(true);
            await updateBookingStatus(id, { staffId });
            setIsReassignModalOpen(false);
            toast.success('Staff reassigned successfully');
        } catch (error) {
            toast.error('Reassignment failed');
        } finally {
            setIsUpdating(false);
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
            <div className="p-12 text-center bg-surface border border-border rounded-2xl shadow-sm">
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
        <div className="max-w-7xl mx-auto space-y-4 animate-reveal pb-12 px-4">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/bookings')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all group shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-black text-text uppercase tracking-tight">Booking #{booking._id?.slice(-8).toUpperCase()}</h1>
                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status]}`}>
                                {booking.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                            <Smartphone className="w-3.5 h-3.5" /> Booked via {booking.source || 'Admin'} on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(booking.source?.toUpperCase() === 'APP' || booking.source?.toUpperCase() === 'ADMIN' || !booking.source) && (
                        <button
                            disabled={isUpdating}
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-4 py-2 bg-[#B8860B] hover:bg-[#997009] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Booking
                        </button>
                    )}
                    {booking.status === 'pending' && (
                        <>
                            <button 
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('confirmed')}
                                className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                                <span className="text-white">Accept Booking</span>
                            </button>
                            <button 
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus('cancelled')}
                                className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2 disabled:opacity-50 !text-rose-600"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin !text-rose-600" /> : <XCircle className="w-4 h-4 !text-rose-600 !stroke-rose-600" />} 
                                <span className="!text-rose-600">Reject</span>
                            </button>
                        </>
                    )}
                    {booking.status === 'confirmed' && (
                        <button 
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus('completed')}
                            className="px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} 
                            Complete Session
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Primary Info Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 relative overflow-hidden shadow-sm">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 -mr-32 -mt-32 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 !text-blue-500" /> Appointment Date
                                    </p>
                                    <p className="text-lg font-black text-text uppercase italic tracking-tight">
                                        {new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 !text-amber-500" /> Time Slot
                                    </p>
                                    <p className="text-lg font-black text-text uppercase italic tracking-tight">
                                        {booking.time || 'Not Specified'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 rounded-2xl bg-surface-alt/50 border border-border/50">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Assigned Expert</p>
                                        <h3 className="text-lg font-black text-text uppercase tracking-tight">{booking.staffId?.name || 'Unassigned'}</h3>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{booking.staffId?.role || 'Staff'}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center font-black text-base text-primary shadow-sm">
                                        {booking.staffId?.name?.[0] || '?'}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsReassignModalOpen(true)}
                                    className="w-full py-2 rounded-xl border border-dashed border-border hover:border-primary/50 hover:text-primary text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 !text-indigo-500" /> Reassign Staff
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Services & Payment Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Details */}
                        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Service Profile</h3>
                                <ShieldCheck className="w-4 h-4 !text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-alt border border-border/50 group hover:border-primary/30 transition-all">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-text uppercase tracking-tight">{booking.serviceId?.name || 'Test Service'}</p>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">Duration: {booking.duration || 30} Mins</p>
                                </div>
                                <p className="text-base font-black text-text italic font-mono">₹{booking.totalPrice || 0}</p>
                            </div>
                        </div>

                        {/* Payment Transaction */}
                        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Payment Transaction</h3>
                                <CreditCard className="w-4 h-4 !text-violet-500" />
                            </div>
                            
                            <div className="space-y-4">
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
                                                disabled={isUpdating}
                                                onClick={() => handleUpdatePaymentStatus('paid')}
                                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                title="Mark as Paid"
                                            >
                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        ) : (
                                            <button 
                                                disabled={isUpdating}
                                                onClick={() => handleUpdatePaymentStatus('unpaid')}
                                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                                                title="Mark as Unpaid"
                                            >
                                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between opacity-60">
                                        <p className="text-[10px] font-black text-text uppercase tracking-widest">Gross Amount</p>
                                        <p className="text-sm font-black italic font-mono">₹{(booking.subtotal || 0).toFixed(2)}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-rose-500/80">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Membership Discount</p>
                                        {booking.membershipDiscount > 0 ? (
                                            <p className="text-sm font-black italic font-mono">-₹{(booking.membershipDiscount || 0).toFixed(2)}</p>
                                        ) : (
                                            <p className="text-sm font-black italic font-mono">-</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-[#B4912B]">
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            Coupon {booking.couponCode ? `(${booking.couponCode})` : ''}
                                        </p>
                                        {booking.promoDiscount > 0 ? (
                                            <p className="text-sm font-black italic font-mono">-₹{(booking.promoDiscount || 0).toFixed(2)}</p>
                                        ) : (
                                            <p className="text-sm font-black italic font-mono">-</p>
                                        )}
                                    </div>

                                    {/* Calculated values for display consistency */}
                                    {(() => {
                                        const isInclusive = booking.serviceId?.isInclusiveTax === true || String(booking.serviceId?.isInclusiveTax) === 'true';
                                        const gstPercent = booking.tax > 0 ? 
                                            Math.round((booking.tax / (((booking.subtotal || 0) - (booking.membershipDiscount || 0) - (booking.promoDiscount || 0) - (isInclusive ? booking.tax : 0)) || 1)) * 100) : 
                                            (platformSettings?.serviceGst || 18);
                                        
                                        const tax = booking.tax > 0 ? booking.tax : (isInclusive ? 
                                            ((booking.subtotal || 0) - (booking.membershipDiscount || 0) - (booking.promoDiscount || 0)) * (1 - 1 / (1 + gstPercent / 100)) : 
                                            ((booking.subtotal || 0) - (booking.membershipDiscount || 0) - (booking.promoDiscount || 0)) * (gstPercent / 100));
                                        
                                        const total = booking.tax > 0 ? booking.totalPrice : (isInclusive ? 
                                            ((booking.subtotal || 0) - (booking.membershipDiscount || 0) - (booking.promoDiscount || 0)) : 
                                            ((booking.subtotal || 0) - (booking.membershipDiscount || 0) - (booking.promoDiscount || 0)) + tax);

                                        const cgst = Number((tax / 2).toFixed(2));
                                        const sgst = Number((tax - cgst).toFixed(2));
                                        const taxable = total - tax;

                                        return (
                                            <>
                                                <div className="flex items-center justify-between opacity-80 border-t border-border/50 pt-2">
                                                    <p className="text-[10px] font-black text-text uppercase tracking-widest">
                                                        {isInclusive ? 'Base Price (Excl. GST)' : 'Taxable Amount (Excl. GST)'}
                                                    </p>
                                                    <p className="text-sm font-black italic font-mono">₹{taxable.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center justify-between text-primary/80">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                                        CGST ({(gstPercent / 2).toFixed(1)}% {isInclusive ? 'Incl.' : 'Excl.'})
                                                    </p>
                                                    <p className="text-sm font-black italic font-mono">{isInclusive ? '' : '+'}₹{cgst.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center justify-between text-primary/80">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                                        SGST ({(gstPercent / 2).toFixed(1)}% {isInclusive ? 'Incl.' : 'Excl.'})
                                                    </p>
                                                    <p className="text-sm font-black italic font-mono">{isInclusive ? '' : '+'}₹{sgst.toFixed(2)}</p>
                                                </div>

                                                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-dashed border-border/50 pt-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest">
                                                        Advance Paid
                                                    </p>
                                                    <p className="text-sm font-black italic font-mono">₹{(booking.advancePaid || 0).toFixed(2)}</p>
                                                </div>

                                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                                    <p className="text-[11px] font-black text-text uppercase tracking-widest">
                                                        Total Payable ({isInclusive ? 'Incl. GST' : 'Excl. GST'})
                                                    </p>
                                                    <p className="text-xl font-black text-primary italic font-mono tracking-tighter">₹{total.toFixed(2)}</p>
                                                </div>
                                                <div className="pt-2.5 border-t border-dashed border-border/50 flex items-center justify-between text-rose-600 dark:text-rose-450 font-bold">
                                                    <p className="text-[11px] font-black uppercase tracking-widest">
                                                        Remaining Balance
                                                    </p>
                                                    <p className="text-xl font-black italic font-mono tracking-tighter">₹{Math.max(0, total - (booking.advancePaid || 0)).toFixed(2)}</p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Right Column - Intelligence & Metadata */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Customer Intelligence Card */}
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-border relative">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-[#B4912B]/5 -mr-16 -mt-16 rotate-45" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-slate-500 dark:text-slate-400">Customer Intelligence</h3>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xl shadow-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                    {client.name?.[0] || 'G'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-2 text-slate-800 dark:text-slate-100">{client.name || 'GUEST'}</h2>
                                    <span className="px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-xl border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                        Loyalty Rank: Gold
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-3 pb-4 border-b border-border">
                                <div className="flex items-center gap-4 text-text-muted">
                                    <Phone className="w-4 h-4 !text-emerald-500" />
                                    <span className="text-xs font-black font-mono">{client.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-text-muted">
                                    <Mail className="w-4 h-4 !text-sky-500" />
                                    <span className="text-xs font-black truncate max-w-[200px]">{client.email || 'NO_MAIL_SYNCED'}</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Appointment Venue */}
                    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em] opacity-40">Appointment Venue</h3>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 !text-rose-500" />
                            </div>
                            {(() => {
                                const outlet = booking.outlet || booking.outletId || {};
                                const venueName = outlet.name || 'Main Outlet';
                                const venueAddress = [
                                    outlet.address?.street || (typeof outlet.address === 'string' ? outlet.address : ''),
                                    outlet.address?.city,
                                    outlet.address?.state,
                                    outlet.address?.pincode
                                ].filter(Boolean).join(', ') || 'Address Not Specified';

                                return (
                                    <div className="space-y-2">
                                        <p className="text-xs font-black text-text uppercase tracking-tight">{venueName}</p>
                                        <p className="text-[10px] font-bold text-text-muted leading-relaxed">
                                            {venueAddress}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Booking Audit */}
                    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em] opacity-40">Booking Audit</h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
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
            {/* Reassign Staff Modal */}
            {isReassignModalOpen && createPortal(
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="admin-panel w-full max-w-md">
                        <div 
                            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                            className="w-full rounded-[28px] border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        >
                            {/* Header */}
                            <div 
                                style={{ backgroundColor: 'var(--card)', borderBottomColor: 'var(--border)' }}
                                className="flex items-center justify-between p-6 pb-5 border-b"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-[#B4912B]">
                                        <RotateCcw className="w-5 h-5 text-[#B4912B]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 style={{ color: 'var(--foreground)' }} className="text-base font-black uppercase tracking-tight font-mono leading-none">Reassign Specialist</h3>
                                        <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider mt-1.5">Select a new professional for this session</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => !isUpdating && setIsReassignModalOpen(false)}
                                    style={{ borderColor: 'var(--border)' }}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all disabled:opacity-50"
                                    disabled={isUpdating}
                                >
                                    <XCircle style={{ color: 'var(--muted-foreground)' }} className="w-4 h-4 hover:text-rose-500" />
                                </button>
                            </div>

                            {/* List */}
                            <div 
                                style={{ backgroundColor: 'var(--background)' }}
                                className="p-6 max-h-[380px] overflow-y-auto no-scrollbar space-y-3"
                            >
                                {staff.filter(s => s.role.toLowerCase() === 'stylish' && s._id !== booking.staffId?._id).length > 0 ? (
                                    staff.filter(s => s.role.toLowerCase() === 'stylish' && s._id !== booking.staffId?._id).map(s => (
                                        <button
                                            key={s._id}
                                            disabled={isUpdating}
                                            onClick={() => handleReassignStaff(s._id)}
                                            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl border hover:border-[#B4912B]/40 hover:bg-[#B4912B]/5 transition-all group cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-border overflow-hidden flex items-center justify-center font-black text-[#B4912B] text-base uppercase shrink-0 relative">
                                                    {s.avatar ? (
                                                        <img src={getImageUrl(s.avatar)} className="w-full h-full object-cover absolute inset-0" onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : null}
                                                    <span className="relative z-10">{s.name?.[0]}</span>
                                                </div>
                                                <div>
                                                    <p style={{ color: 'var(--foreground)' }} className="text-sm font-black group-hover:text-[#B4912B] transition-colors uppercase italic font-mono">{s.name}</p>
                                                    <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-widest mt-1 capitalize">{s.role?.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-[#B4912B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-amber-500/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div style={{ color: 'var(--muted-foreground)' }} className="text-center py-10 uppercase text-[10px] font-black tracking-widest">No other staff members available</div>
                                )}
                            </div>

                            {/* Footer */}
                            <div 
                                style={{ backgroundColor: 'var(--card)', borderTopColor: 'var(--border)' }}
                                className="p-5 border-t flex justify-end gap-3"
                            >
                                <button 
                                    disabled={isUpdating}
                                    onClick={() => setIsReassignModalOpen(false)}
                                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                    className="px-6 py-3 rounded-xl text-[10px] font-black hover:bg-slate-200/50 dark:hover:bg-slate-800 uppercase tracking-wider transition-all disabled:opacity-50 border"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="admin-panel w-full max-w-lg">
                        <form
                            onSubmit={handleEditSubmit}
                            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                            className="w-full rounded-[28px] border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        >
                            {/* Header */}
                            <div 
                                style={{ backgroundColor: 'var(--card)', borderBottomColor: 'var(--border)' }}
                                className="flex items-center justify-between p-6 pb-5 border-b"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-[#B4912B]">
                                        <Edit className="w-5 h-5 text-[#B4912B]" />
                                    </div>
                                    <div className="text-left">
                                        <h3 style={{ color: 'var(--foreground)' }} className="text-base font-black uppercase tracking-tight font-mono leading-none">Edit Booking Details</h3>
                                        <p style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider mt-1.5">Modify appointment details below</p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => !isUpdating && handleCloseEditModal()}
                                    style={{ borderColor: 'var(--border)' }}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center border hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all disabled:opacity-50"
                                    disabled={isUpdating}
                                >
                                    <XCircle style={{ color: 'var(--muted-foreground)' }} className="w-4 h-4 hover:text-rose-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div 
                                style={{ backgroundColor: 'var(--background)' }}
                                className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
                            >
                                {/* Service Selection */}
                                <div className="space-y-1.5 text-left">
                                    <label style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Select Service</label>
                                    <div className="relative">
                                        <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select
                                            required
                                            value={editForm.serviceId}
                                            onChange={e => setEditForm({ ...editForm, serviceId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-alt transition-all text-text"
                                        >
                                            <option value="">Choose a service...</option>
                                            {(services || []).map(s => (
                                                <option key={s._id || s.id} value={s._id || s.id}>{s.name} - ₹{s.price}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Staff Selection */}
                                <div className="space-y-1.5 text-left">
                                    <label style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Assign Staff</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <select
                                            required
                                            value={editForm.staffId}
                                            onChange={e => setEditForm({ ...editForm, staffId: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-surface-alt transition-all text-text"
                                        >
                                            <option value="">Select staff member...</option>
                                            {(staff || []).map(s => (
                                                <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                        <label style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input
                                                required
                                                type="date"
                                                value={editForm.date}
                                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input
                                                required
                                                type="time"
                                                value={editForm.time}
                                                onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5 text-left">
                                    <label style={{ color: 'var(--muted-foreground)' }} className="text-[10px] font-bold uppercase tracking-wider ml-1">Notes</label>
                                    <textarea
                                        value={editForm.notes}
                                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text resize-none h-20"
                                        placeholder="Add any special request or description..."
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div 
                                style={{ backgroundColor: 'var(--card)', borderTopColor: 'var(--border)' }}
                                className="p-5 border-t flex justify-end gap-3"
                            >
                                <button 
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={handleCloseEditModal}
                                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                    className="px-6 py-3 rounded-xl text-[10px] font-black hover:bg-slate-200/50 dark:hover:bg-slate-800 uppercase tracking-wider transition-all disabled:opacity-50 border"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-3 bg-[#B8860B] hover:bg-[#997009] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
