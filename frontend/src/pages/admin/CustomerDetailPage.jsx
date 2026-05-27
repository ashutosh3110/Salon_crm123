import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Star,
    Clock,
    Mail,
    Phone,
    MapPin,
    DollarSign,
    Wallet,
    ShieldAlert,
    History,
    Tag,
    Edit,
    Save,
    X,
    Cake,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Eye,
    XCircle,
    Package,
    Truck,
    CheckCircle2,
    User
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { maskPhone } from '../../utils/phoneUtils';
import { getImageUrl } from '../../utils/imageUtils';
import { toast } from 'react-hot-toast';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { updateCustomer, outlets, fetchOutlets } = useBusiness();

    // Customer details state
    const [customer, setCustomer] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);

    // Selected order for detailed view drawer
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Load outlets if not fetched
    useEffect(() => {
        if (outlets && outlets.length === 0 && fetchOutlets) {
            fetchOutlets();
        }
    }, [outlets, fetchOutlets]);

    // Navigation and tabs
    const [activeSubTab, setActiveSubTab] = useState('bookings'); // 'bookings' or 'orders'

    // Bookings history state
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsPage, setBookingsPage] = useState(1);
    const [bookingsMeta, setBookingsMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1 });

    // Orders history state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersMeta, setOrdersMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1 });

    // Fetch customer profile details
    const fetchCustomerProfile = useCallback(async () => {
        setLoadingCustomer(true);
        try {
            const res = await api.get(`/clients/${id}`);
            if (res.data?.success) {
                const data = res.data.data;
                setCustomer(data);
                setEditForm({
                    name: data.name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    dob: data.dob || '',
                    anniversary: data.anniversary || '',
                    address: data.address || '',
                    remarks: data.remarks || '',
                    isVIP: !!data.isVIP,
                    status: data.status || 'active',
                    preferredService: data.preferredService || 'Haircut'
                });
            } else {
                toast.error('Failed to load customer profile');
            }
        } catch (err) {
            console.error('Fetch customer error:', err);
            toast.error('Error fetching customer details');
        } finally {
            setLoadingCustomer(false);
        }
    }, [id]);

    // Fetch customer bookings (paginated)
    const fetchBookingsHistory = useCallback(async (pageNum = 1) => {
        setBookingsLoading(true);
        try {
            const res = await api.get(`/bookings/customer/${id}?page=${pageNum}&limit=5`);
            if (res.data?.success) {
                setBookings(res.data.data || []);
                setBookingsMeta({
                    totalCount: res.data.totalCount || 0,
                    totalPages: res.data.totalPages || 1,
                    currentPage: res.data.currentPage || 1
                });
            }
        } catch (err) {
            console.error('Fetch customer bookings error:', err);
        } finally {
            setBookingsLoading(false);
        }
    }, [id]);

    // Fetch customer orders (paginated)
    const fetchOrdersHistory = useCallback(async (pageNum = 1) => {
        setOrdersLoading(true);
        try {
            const res = await api.get(`/orders/customer/${id}?page=${pageNum}&limit=5`);
            if (res.data?.success) {
                setOrders(res.data.data || []);
                setOrdersMeta({
                    totalCount: res.data.totalCount || 0,
                    totalPages: res.data.totalPages || 1,
                    currentPage: res.data.currentPage || 1
                });
            }
        } catch (err) {
            console.error('Fetch customer orders error:', err);
        } finally {
            setOrdersLoading(false);
        }
    }, [id]);

    // Load initial customer details and booking history
    useEffect(() => {
        if (id) {
            fetchCustomerProfile();
        }
    }, [id, fetchCustomerProfile]);

    // React to page or tab changes
    useEffect(() => {
        if (id) {
            if (activeSubTab === 'bookings') {
                fetchBookingsHistory(bookingsPage);
            } else {
                fetchOrdersHistory(ordersPage);
            }
        }
    }, [id, activeSubTab, bookingsPage, ordersPage, fetchBookingsHistory, fetchOrdersHistory]);

    // Handle profile update
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (editForm.phone.length !== 10) {
            return toast.error('Phone number must be exactly 10 digits');
        }
        setSaving(true);
        try {
            await updateCustomer(id, editForm);
            // Re-fetch locally to get fresh timestamp / normalization
            await fetchCustomerProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Update profile error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loadingCustomer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Loading Customer Profile...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 text-left">
                <div className="p-4 border border-rose-500/20 bg-rose-500/5 text-rose-500">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-tight">Customer profile not found</h3>
                    <p className="text-xs text-text-muted">The client directory ID is invalid or belongs to another salon namespace.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/crm/customers')}
                    className="px-6 py-3 bg-text text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                >
                    Back to directory
                </button>
            </div>
        );
    }

    const regDate = customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
          })
        : 'Unknown';

    return (
        <div className="space-y-6 animate-reveal text-left max-w-6xl mx-auto">
            {/* Header Breadcrumb & Back Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/crm/customers')}
                        className="p-2.5 border border-border hover:bg-surface-alt hover:text-primary transition-all text-text-muted"
                        title="Back to Customer List"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-text uppercase tracking-tighter leading-none">Customer File</h1>
                        <p className="text-[9px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">CRM Directory • File Tracker</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-white border border-border px-5 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-all"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/95 px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95"
                        >
                            <Edit className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-surface border border-border overflow-hidden shadow-sm">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 bg-text text-white flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden border border-white">
                                {customer.avatar ? (
                                    <img
                                        src={getImageUrl(customer.avatar)}
                                        alt={customer.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                            e.target.parentElement.innerHTML = customer.name.charAt(0).toUpperCase();
                                        }}
                                    />
                                ) : (
                                    customer.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            {customer.isVIP && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-none border border-white shadow-sm">
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-3xl font-black text-text tracking-tighter uppercase leading-none">
                                    {customer.name}
                                </h2>
                                <div className="flex gap-1.5 font-black uppercase tracking-[0.2em] text-[8px]">
                                    {customer.isVIP && (
                                        <span className="px-2 py-0.5 bg-amber-500 text-white">VIP</span>
                                    )}
                                    <span className={`px-2 py-0.5 border ${
                                        customer.status === 'active' 
                                            ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                    }`}>
                                        {customer.status || 'Active'}
                                    </span>
                                    {customer.category && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/10">
                                            {customer.category}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="font-extrabold text-text-muted text-[10px] uppercase tracking-[0.25em] flex flex-wrap items-center gap-2">
                                <span>Phone: {maskPhone(customer.phone, user?.role)}</span>
                                <span className="opacity-30">•</span>
                                <span>Member Since: {regDate}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-KPI Metrics Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-t border-border bg-surface-alt/15">
                    <ProfileMetric
                        label="Lifetime spend"
                        value={`₹${(customer.totalSpend ?? 0).toLocaleString()}`}
                        icon={DollarSign}
                        color="green"
                    />
                    <ProfileMetric
                        label="Wallet balance"
                        value={`₹${(customer.walletBalance ?? 0).toLocaleString()}`}
                        icon={Wallet}
                        color="yellow"
                    />
                    <ProfileMetric
                        label="Outstanding dues"
                        value={`₹${(customer.dueAmount ?? 0).toLocaleString()}`}
                        icon={ShieldAlert}
                        color="red"
                    />
                    <ProfileMetric
                        label="Total salon visits"
                        value={`${customer.totalVisits ?? 0} Visits`}
                        icon={History}
                        color="blue"
                    />
                </div>
            </div>

            {/* Content Layout - Details and History Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Side: Client Identity Details Card */}
                <div className="bg-surface border border-border lg:col-span-1 p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text">Identity Registry</h3>
                        <Tag className="w-4 h-4 text-primary" />
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Birth Date</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={editForm.dob}
                                        onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                                        className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Anniversary</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        value={editForm.anniversary}
                                        onChange={(e) => setEditForm({ ...editForm, anniversary: e.target.value })}
                                        className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Residential Address</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className="w-full bg-surface-alt/30 border border-border p-2.5 text-xs font-bold text-text outline-none focus:border-primary resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 border border-border bg-surface-alt/10 p-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isVIP}
                                        onChange={(e) => setEditForm({ ...editForm, isVIP: e.target.checked })}
                                        className="w-4 h-4 accent-primary cursor-pointer"
                                    />
                                    <span className="text-[9px] font-black uppercase tracking-wider">VIP Member</span>
                                </label>
                                
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                    className="border border-border bg-surface-alt/30 p-2.5 text-[9px] font-black uppercase outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary text-primary-foreground py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Registry'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <DetailRow label="Phone Number" value={customer.phone} icon={Phone} />
                            <DetailRow label="Email Address" value={customer.email || 'None'} icon={Mail} />
                            <DetailRow label="Birth Date" value={customer.dob || 'None'} icon={Cake} />
                            <DetailRow label="Anniversary" value={customer.anniversary || 'None'} icon={Calendar} />
                            <DetailRow label="Preferred Service" value={customer.preferredService || 'General'} icon={Tag} />
                            <DetailRow label="Residential Address" value={customer.address || 'No Address Registered'} icon={MapPin} isFullWidth />
                            {customer.remarks && (
                                <div className="space-y-1 bg-surface-alt/25 p-3 border border-border/50 text-left">
                                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest block">Staff Remarks & Notes</span>
                                    <p className="text-xs text-text-muted italic">"{customer.remarks}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Side: Tab based Booking / Order Histories */}
                <div className="bg-surface border border-border lg:col-span-2 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                    
                    {/* Tab Navigation Menu */}
                    <div className="flex border-b border-border bg-surface-alt/30 shrink-0">
                        <button
                            onClick={() => setActiveSubTab('bookings')}
                            className={`flex-1 sm:flex-initial px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all relative ${
                                activeSubTab === 'bookings' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'
                            }`}
                        >
                            Booking History
                            {activeSubTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveSubTab('orders')}
                            className={`flex-1 sm:flex-initial px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-r border-border transition-all relative ${
                                activeSubTab === 'orders' ? 'bg-surface text-primary' : 'text-text-muted hover:text-text'
                            }`}
                        >
                            Order History
                            {activeSubTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 p-6">
                        {activeSubTab === 'bookings' ? (
                            <div className="space-y-4">
                                {bookingsLoading ? (
                                    <TableLoader columnsCount={5} rowsCount={4} />
                                ) : bookings.length === 0 ? (
                                    <EmptyState
                                        title="No bookings recorded"
                                        description="This customer hasn't scheduled any salon appointments yet."
                                        icon={Calendar}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="table-responsive border border-border bg-surface">
                                            <table className="w-full text-left min-w-[700px]">
                                                <thead className="bg-surface-alt border-b border-border">
                                                    <tr>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Booking ID</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Service</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Date & Time</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Amount</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Status</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Payment</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border text-xs">
                                                    {bookings.map(b => (
                                                        <tr key={b._id} className="hover:bg-surface-alt/10 transition-colors">
                                                            <td className="p-3.5 font-bold uppercase text-text-muted">
                                                                #{b._id.toString().slice(-6)}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-text">
                                                                {b.serviceId?.name || 'Multiple Services'}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-text-muted">
                                                                {b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                                {b.time && <span className="block text-[10px] text-text-muted tracking-tight mt-0.5">{b.time}</span>}
                                                            </td>
                                                            <td className="p-3.5 font-black text-text">
                                                                ₹{(b.totalPrice ?? b.amount ?? 0).toLocaleString()}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded ${
                                                                    b.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                                    b.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                                    b.status === 'cancelled' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                                }`}>
                                                                    {b.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded ${
                                                                    b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                }`}>
                                                                    {b.paymentStatus || 'pending'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 text-right">
                                                                <button
                                                                    onClick={() => navigate(`/admin/bookings/${b._id}`)}
                                                                    className="p-2 border rounded-xl transition-all active:scale-95 shadow-sm text-text-muted hover:bg-[#B4912B] hover:border-[#B4912B] hover:text-white"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {bookingsMeta.totalPages > 1 && (
                                            <div className="flex items-center justify-between border-t border-border pt-4">
                                                <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                    Displaying {bookings.length} of {bookingsMeta.totalCount} appointments
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setBookingsPage(p => Math.max(1, p - 1))}
                                                        disabled={bookingsPage === 1}
                                                        className="px-4 py-2 border border-border bg-surface text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                                    >
                                                        Prev
                                                    </button>
                                                    <div className="px-3 text-xs font-black">
                                                        {bookingsPage} / {bookingsMeta.totalPages}
                                                    </div>
                                                    <button
                                                        onClick={() => setBookingsPage(p => Math.min(bookingsMeta.totalPages, p + 1))}
                                                        disabled={bookingsPage >= bookingsMeta.totalPages}
                                                        className="px-4 py-2 border border-border bg-surface text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ordersLoading ? (
                                    <TableLoader columnsCount={5} rowsCount={4} />
                                ) : orders.length === 0 ? (
                                    <EmptyState
                                        title="No orders recorded"
                                        description="No invoices or e-shop order transaction logs found for this customer."
                                        icon={ShoppingBag}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="table-responsive border border-border bg-surface">
                                            <table className="w-full text-left min-w-[700px]">
                                                <thead className="bg-surface-alt border-b border-border">
                                                    <tr>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Order ID</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Date</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Items</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Amount</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Payment</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest">Status</th>
                                                        <th className="p-3.5 text-[9px] font-black uppercase text-text-muted tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border text-xs">
                                                    {orders.map(o => (
                                                        <tr key={o._id} className="hover:bg-surface-alt/10 transition-colors">
                                                            <td className="p-3.5 font-bold uppercase text-text-muted">
                                                                #{o._id.toString().slice(-6)}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-text-muted">
                                                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-text max-w-[200px] truncate">
                                                                {o.items?.map(item => `${item.productId?.name || 'Product'} (x${item.quantity})`).join(', ') || 'No Items'}
                                                            </td>
                                                            <td className="p-3.5 font-black text-text">
                                                                ₹{(o.totalAmount ?? 0).toLocaleString()}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded ${
                                                                    o.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                }`}>
                                                                    {o.paymentStatus || 'pending'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5">
                                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded ${
                                                                    o.status === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                                    o.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                                    o.status === 'cancelled' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                                }`}>
                                                                    {o.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 text-right">
                                                                <button
                                                                    onClick={() => navigate('/admin/shop-orders', { state: { search: o._id } })}
                                                                    className="p-2 border rounded-xl transition-all active:scale-95 shadow-sm text-text-muted hover:bg-[#B4912B] hover:border-[#B4912B] hover:text-white"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {ordersMeta.totalPages > 1 && (
                                            <div className="flex items-center justify-between border-t border-border pt-4">
                                                <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                                                    Displaying {orders.length} of {ordersMeta.totalCount} orders
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                                        disabled={ordersPage === 1}
                                                        className="px-4 py-2 border border-border bg-surface text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                                    >
                                                        Prev
                                                    </button>
                                                    <div className="px-3 text-xs font-black">
                                                        {ordersPage} / {ordersMeta.totalPages}
                                                    </div>
                                                    <button
                                                        onClick={() => setOrdersPage(p => Math.min(ordersMeta.totalPages, p + 1))}
                                                        disabled={ordersPage >= ordersMeta.totalPages}
                                                        className="px-4 py-2 border border-border bg-surface text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-surface-alt transition-all"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileMetric({ label, value, icon: Icon, color }) {
    const colors = {
        green: 'text-emerald-500',
        blue: 'text-blue-500',
        yellow: 'text-amber-500',
        purple: 'text-purple-500',
        red: 'text-rose-500'
    };
    return (
        <div className="p-5 space-y-1.5 text-left">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">{label}</span>
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${colors[color]}`} />
                <span className="text-lg font-black text-text uppercase tracking-tight leading-none">{value}</span>
            </div>
        </div>
    );
}

function DetailRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 border border-border bg-surface-alt/10 p-3.5 rounded-none text-left">
            <Icon className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
            <div className="space-y-1">
                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest block leading-none">{label}</span>
                <span className="text-xs font-bold text-text uppercase tracking-tight leading-none">{value || '-'}</span>
            </div>
        </div>
    );
}

function EmptyState({ title, description, icon: Icon }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 border border-border/50 bg-surface-alt/10 text-text-muted">
                <Icon className="w-8 h-8 opacity-40" />
            </div>
            <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-text">{title}</h4>
                <p className="text-[11px] text-text-muted max-w-[300px] leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function TableLoader({ columnsCount, rowsCount }) {
    return (
        <div className="space-y-3 w-full animate-pulse text-left">
            <div className="h-10 bg-surface-alt/20 border border-border flex items-center justify-between px-4">
                <div className="h-2 w-16 bg-surface-alt/40"></div>
                <div className="h-2 w-20 bg-surface-alt/40"></div>
                <div className="h-2 w-24 bg-surface-alt/40"></div>
                <div className="h-2 w-12 bg-surface-alt/40"></div>
            </div>
            <div className="space-y-2">
                {Array.from({ length: rowsCount }).map((_, idx) => (
                    <div key={idx} className="h-12 bg-surface-alt/10 border border-border/55 flex items-center justify-between px-4">
                        <div className="h-2.5 w-12 bg-surface-alt/30"></div>
                        <div className="h-2.5 w-32 bg-surface-alt/30"></div>
                        <div className="h-2.5 w-20 bg-surface-alt/30"></div>
                        <div className="h-2.5 w-10 bg-surface-alt/30"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
