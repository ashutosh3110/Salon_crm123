import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    Package, 
    Truck, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    MoreVertical,
    Download,
    MapPin,
    User,
    CreditCard,
    Calendar,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import { useBusiness } from '../../contexts/BusinessContext';

const STATUS_FLOW = {
    pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
    accepted: { label: 'Accepted', color: 'text-blue-500', bg: 'bg-blue-50', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle },
    dispatched: { label: 'Dispatched', color: 'text-indigo-500', bg: 'bg-indigo-50', icon: Truck },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-500', bg: 'bg-purple-50', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-50', icon: XCircle },
};

export default function ShopOrdersPage() {
    const { outlets, fetchOutlets } = useBusiness();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [outletFilter, setOutletFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchOrders();
        if (outlets.length === 0) fetchOutlets();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders');
            if (res.data?.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, note = '') => {
        try {
            setUpdatingStatus(true);
            const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus, note });
            if (res.data?.success) {
                toast.success(`Order marked as ${newStatus}`);
                setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o));
                if (selectedOrder?._id === orderId) {
                    setSelectedOrder(res.data.data);
                }
            }
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesSearch = !search || 
                o._id.toLowerCase().includes(search.toLowerCase()) ||
                o.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                o.customerId?.phone?.includes(search);
            
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesOutlet = outletFilter === 'all' || String(o.outletId) === String(outletFilter);
            
            return matchesSearch && matchesStatus && matchesOutlet;
        });
    }, [orders, search, statusFilter, outletFilter]);

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'pending': return ['accepted', 'rejected'];
            case 'accepted': return ['dispatched'];
            case 'dispatched': return ['out_for_delivery'];
            case 'out_for_delivery': return ['delivered'];
            default: return [];
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1 border-b border-border pb-6">
                <div className="text-left font-mono">
                    <h1 className="text-2xl font-black text-text uppercase italic tracking-tight leading-none">Shop Order Registry</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] italic">Operations :: Customer Product Orders</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchOrders} className="bg-surface border border-border px-4 py-2 text-[10px] font-black text-text-muted hover:bg-surface-alt transition-all uppercase tracking-widest font-mono">
                        Refresh Log
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search by Order ID, Customer Name or Phone..."
                        className="w-full pl-12 pr-6 py-3 border border-border bg-surface text-[11px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:border-primary transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                {/* Outlet Filter */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted pl-1">Target Outlet</span>
                    <select
                        value={outletFilter}
                        onChange={(e) => setOutletFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-border text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-primary cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                    >
                        <option value="all">All Outlets</option>
                        {outlets.map(o => (
                            <option key={o._id} value={o._id}>{o.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {['all', 'pending', 'accepted', 'dispatched', 'out_for_delivery', 'delivered', 'rejected', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${statusFilter === s ? 'bg-text text-background border-text' : 'bg-surface text-text-muted border-border hover:border-primary'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-surface border border-border shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="py-24 text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Accessing order archives...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-24 text-center bg-background/50">
                        <Package className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No active order transmissions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-5">Order Reference</th>
                                    <th className="px-6 py-5">Timestamp</th>
                                    <th className="px-6 py-5">Customer Profile</th>
                                    <th className="px-6 py-5">Delivery Method</th>
                                    <th className="px-6 py-5">Origin Outlet</th>
                                    <th className="px-6 py-5 text-right">Amount</th>
                                    <th className="px-6 py-5">Current Status</th>
                                    <th className="px-6 py-5 text-center">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredOrders.map(order => {
                                    const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.pending;
                                    const StatusIcon = statusInfo.icon;
                                    
                                    return (
                                        <tr key={order._id} className="hover:bg-surface-alt/50 transition-colors group border-b border-border/10">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-primary uppercase tracking-tighter text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-[9px] font-black text-text-muted opacity-40">{order._id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-text uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center">
                                                        <User className="w-4 h-4 text-text-muted" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-text uppercase tracking-tight">{order.customerId?.name || 'Unknown'}</span>
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{order.customerId?.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1 ${order.deliveryPreference === 'home' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                        {order.deliveryPreference === 'home' ? <Truck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-[10px] font-black text-text uppercase tracking-widest">
                                                        {order.deliveryPreference === 'home' ? 'Home Delivery' : 'In-Store Collect'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-text uppercase tracking-widest">
                                                        {outlets.find(out => String(out._id) === String(order.outletId))?.name || 'Main Branch'}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter opacity-40">
                                                        ID: {order.outletId?.slice(-6) || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-text tracking-tighter text-base italic">₹{order.totalAmount?.toLocaleString()}</td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border ${statusInfo.bg} ${statusInfo.color} border-current/20`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2.5 border border-border bg-surface hover:bg-primary hover:border-primary hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Drawer/Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-surface h-full shadow-2xl flex flex-col border-l border-border"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 bg-surface-alt border-b border-border flex items-center justify-between">
                                <div className="font-mono">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Order Protocol Details</p>
                                    <h2 className="text-xl font-black text-text uppercase italic tracking-tighter">ORD-{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-3 bg-surface border border-border hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {/* Actions Section */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Update Protocol Status</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {getNextStatus(selectedOrder.status).map(s => (
                                            <button
                                                key={s}
                                                disabled={updatingStatus}
                                                onClick={() => handleUpdateStatus(selectedOrder._id, s)}
                                                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                                                    s === 'rejected' ? 'border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white' : 
                                                    s === 'accepted' ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white' :
                                                    'border-primary text-primary hover:bg-primary hover:text-white'
                                                }`}
                                            >
                                                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                {s === 'accepted' && 'APPROVE ORDER'}
                                                {s === 'rejected' && 'REJECT ORDER'}
                                                {s === 'dispatched' && 'MARK DISPATCHED'}
                                                {s === 'out_for_delivery' && 'OUT FOR DELIVERY'}
                                                {s === 'delivered' && 'CONFIRM DELIVERY'}
                                            </button>
                                        ))}
                                        {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'rejected' || selectedOrder.status === 'delivered') && (
                                            <div className="text-[11px] font-black text-text-muted italic bg-surface-alt px-4 py-3 border border-border w-full text-center">
                                                This order has reached a terminal status: {selectedOrder.status.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Breakdown */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Asset Inventory</h3>
                                    <div className="border border-border bg-background divide-y divide-border/30">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="p-4 flex items-center gap-4 group">
                                                <div className="w-16 h-16 bg-surface border border-border overflow-hidden">
                                                    <img src={item.productId?.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-black uppercase tracking-tight text-text">{item.productId?.name}</h4>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 italic">SKU: {item.productId?._id?.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-text italic">₹{item.price * item.quantity}</p>
                                                    <p className="text-[9px] font-black text-text-muted uppercase opacity-40">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-surface-alt border border-border space-y-3">
                                        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.membershipDiscount > 0 && (
                                            <div className="flex justify-between text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                                <span>Membership Discount</span>
                                                <span>-₹{selectedOrder.membershipDiscount?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <span>Delivery / Logistics</span>
                                            <span>+₹{selectedOrder.deliveryCharge?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <span>GST / Tax</span>
                                            <span>+₹{(selectedOrder.taxAmount > 0 ? selectedOrder.taxAmount : Math.round((selectedOrder.subtotal - (selectedOrder.membershipDiscount || 0)) * 0.12)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest pt-2 border-t border-border/40">
                                            <span>Final Settlement</span>
                                            <span className="text-lg italic">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Timeline Trace</h3>
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                                        {(selectedOrder.timeline || []).slice().reverse().map((step, i) => (
                                            <div key={i} className="relative">
                                                <div className={`absolute -left-[22px] top-1 w-3 h-3 border-2 ${i === 0 ? 'bg-primary border-primary ring-4 ring-primary/10' : 'bg-background border-border'}`} />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-text'}`}>{step.status}</span>
                                                        <span className="text-[9px] font-bold text-text-muted opacity-40">{new Date(step.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-text-secondary mt-1 italic">"{step.note}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Logistics Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 border border-border bg-surface-alt space-y-4 col-span-2">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Origin Outlet</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-text uppercase">
                                                {outlets.find(o => String(o._id) === String(selectedOrder.outletId))?.name || 'Main Branch'}
                                            </p>
                                            <p className="text-[10px] font-bold text-text-muted uppercase italic">
                                                Location ID: {selectedOrder.outletId || 'PRIMARY'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 border border-border bg-surface-alt space-y-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Customer Profile</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-text uppercase">{selectedOrder.customerId?.name}</p>
                                            <p className="text-[10px] font-bold text-text-muted">{selectedOrder.customerId?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 border border-border bg-surface-alt space-y-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Target Location</h4>
                                        </div>
                                        {selectedOrder.deliveryPreference === 'home' ? (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-text uppercase tracking-tight leading-tight">{selectedOrder.address?.street}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase">{selectedOrder.address?.city}, {selectedOrder.address?.zip}</p>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-black text-emerald-500 uppercase italic">In-Salon Pickup Registry</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 bg-surface border-t border-border">
                                <button 
                                    className="w-full py-4 bg-text text-background font-black text-[10px] uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/10"
                                >
                                    <Download className="w-4 h-4" /> Download Manifest PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
