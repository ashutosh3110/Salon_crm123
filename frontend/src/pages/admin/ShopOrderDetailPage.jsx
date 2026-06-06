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
    Truck,
    Package,
    Loader2,
    Download,
    XCircle,
    Info,
    Store,
    ChevronDown,
    ChevronUp,
    Gift,
    Shield
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const STATUS_FLOW = {
    pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50', icon: Clock },
    accepted: { label: 'Accepted', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50', icon: XCircle },
    dispatched: { label: 'Dispatched', color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900/50', icon: Truck },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/50', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-950/30 dark:border-slate-900/50', icon: XCircle },
};

export default function ShopOrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { outlets, fetchOutlets, platformSettings, fetchPlatformSettings } = useBusiness();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showGstBreakdown, setShowGstBreakdown] = useState(false);

    useEffect(() => {
        fetchOrderDetail();
        if (outlets.length === 0) fetchOutlets();
        if (!platformSettings) fetchPlatformSettings();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orders/${id}`);
            if (res.data?.success) {
                setOrder(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch order details', err);
            try {
                const res = await api.get('/orders');
                if (res.data?.success) {
                    const found = res.data.data.find(o => o._id === id);
                    if (found) {
                        setOrder(found);
                    } else {
                        toast.error('Order not found');
                    }
                }
            } catch (fallbackErr) {
                toast.error('Failed to load order details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus, note = '') => {
        try {
            setUpdatingStatus(true);
            const res = await api.patch(`/orders/${id}/status`, { status: newStatus, note });
            if (res.data?.success) {
                toast.success(`Order marked as ${newStatus}`);
                setOrder(res.data.data);
            }
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const downloadManifest = () => {
        if (!order) return;
        try {
            const doc = new jsPDF();
            const outletName = outlets.find(o => String(o._id) === String(order.outletId))?.name || 'Main Branch';

            // Title
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('ORDER MANIFEST', 105, 20, { align: 'center' });

            // Horizontal Line
            doc.setLineWidth(0.5);
            doc.line(20, 25, 190, 25);

            // Order Info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Order ID: #${order._id.slice(-6).toUpperCase()}`, 20, 35);
            doc.text(`Reference: ${order._id}`, 20, 40);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 20, 45);
            doc.text(`Status: ${order.status.toUpperCase()}`, 20, 50);

            // Customer & Logistics
            doc.setFont('helvetica', 'bold');
            doc.text('LOGISTICS PROTOCOL:', 120, 35);
            doc.setFont('helvetica', 'normal');
            doc.text(`Customer: ${order.customerId?.name || 'Unknown'}`, 120, 40);
            doc.text(`Phone: ${order.customerId?.phone || 'N/A'}`, 120, 45);
            doc.text(`Outlet: ${outletName}`, 120, 50);

            if (order.deliveryPreference === 'home') {
                doc.text(`Address: ${order.address?.street || ''}`, 120, 55);
                doc.text(`${order.address?.city || ''}, ${order.address?.zip || ''}`, 120, 60);
            } else {
                doc.text('Delivery: IN-STORE PICKUP', 120, 55);
            }

            // Table
            const tableData = order.items.map(item => [
                item.productId?.name?.toUpperCase() || 'ITEM',
                item.productId?._id?.slice(-8).toUpperCase() || 'N/A',
                item.quantity,
                `Rs. ${item.price}`,
                `Rs. ${item.price * item.quantity}`
            ]);

            doc.autoTable({
                startY: 70,
                head: [['ITEM DESCRIPTION', 'SKU ID', 'QTY', 'UNIT PRICE', 'TOTAL']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
                styles: { fontSize: 8, font: 'helvetica' }
            });

            const finalY = doc.lastAutoTable.finalY + 10;

            // Summary
            doc.setFont('helvetica', 'bold');
            doc.text('FINANCIAL SUMMARY:', 120, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(`Subtotal: Rs. ${order.subtotal?.toLocaleString()}`, 120, finalY + 5);
            if (order.membershipDiscount > 0) {
                doc.text(`Discount: -Rs. ${order.membershipDiscount?.toLocaleString()}`, 120, finalY + 10);
            }
            doc.text(`Logistics: +Rs. ${order.deliveryCharge?.toLocaleString()}`, 120, finalY + 15);
            
            const taxAmount = order.taxAmount > 0 ? order.taxAmount : Math.round((order.subtotal - (order.membershipDiscount || 0)) * 0.12);
            const cgstVal = Number((taxAmount / 2).toFixed(2));
            const sgstVal = Number((taxAmount - cgstVal).toFixed(2));
            const pGst = Number(platformSettings?.productGst || 12);
            doc.text(`CGST (${pGst/2}%): +Rs. ${cgstVal.toFixed(2)}`, 120, finalY + 20);
            doc.text(`SGST (${pGst/2}%): +Rs. ${sgstVal.toFixed(2)}`, 120, finalY + 25);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`GRAND TOTAL: Rs. ${order.totalAmount?.toLocaleString()}`, 120, finalY + 35);

            // Footer
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text('This is a computer generated logistics manifest.', 105, 285, { align: 'center' });
            doc.text('Generated by Salon Management System', 105, 290, { align: 'center' });

            doc.save(`MANIFEST_${order._id.slice(-6).toUpperCase()}.pdf`);
        } catch (err) {
            console.error('Failed to generate manifest', err);
            toast.error('Manifest generation failed');
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'pending': return ['accepted', 'rejected'];
            case 'accepted': return ['dispatched'];
            case 'dispatched': return ['out_for_delivery'];
            case 'out_for_delivery': return ['delivered'];
            default: return [];
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Syncing Order Protocol...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl shadow-sm">
                <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Order 404</h2>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-8">The requested order record does not exist in the mainframe.</p>
                <button
                    onClick={() => navigate('/admin/shop-orders')}
                    className="px-8 py-3 bg-primary text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                    Return to Overview
                </button>
            </div>
        );
    }

    const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.pending;
    const StatusIcon = statusInfo.icon;

    // GST splits
    const taxAmount = order.taxAmount > 0 ? order.taxAmount : Math.round((order.subtotal - (order.membershipDiscount || 0)) * 0.12);
    const cgst = Number((taxAmount / 2).toFixed(2));
    const sgst = Number((taxAmount - cgst).toFixed(2));
    const pGst = Number(platformSettings?.productGst || 12);

    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-reveal pb-12 px-4 text-left">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/admin/shop-orders')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border hover:border-primary/40 hover:text-primary transition-all group shadow-sm text-text"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-black text-text uppercase tracking-tight">Order #{order._id?.slice(-6).toUpperCase()}</h1>
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border rounded-xl shadow-sm ${order.status === 'pending' ? 'animate-pulse' : ''} ${statusInfo.color}`}>
                                {order.status === 'pending' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-0.5" />}
                                {order.status === 'delivered' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5" />}
                                {order.status === 'accepted' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-0.5" />}
                                {order.status === 'cancelled' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 mr-0.5" />}
                                <StatusIcon className="w-3.5 h-3.5 inline" />
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={downloadManifest}
                        className="px-5 py-3 bg-[#B4912B] hover:bg-[#9c7d24] bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#B4912B]/20 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4 animate-bounce" /> Download Manifest
                    </button>
                </div>
            </div>

            {/* Order Header Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-text mt-1 italic">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Order Size</span>
                    <span className="text-2xl font-black text-text mt-1 italic">{totalQty} {totalQty > 1 ? 'Items' : 'Item'}</span>
                </div>
                <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Protocol Status</span>
                    <span className="text-2xl font-black mt-1 uppercase italic tracking-tighter text-primary">
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Status Management Card */}
                    {getNextStatus(order.status).length > 0 ? (
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Update Order Status</h3>
                            <div className="flex flex-wrap gap-2">
                                {getNextStatus(order.status).map(s => (
                                    <button
                                        key={s}
                                        disabled={updatingStatus}
                                        onClick={() => handleUpdateStatus(s)}
                                        className="px-5 py-3 bg-surface border border-border hover:border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 text-text"
                                    >
                                        {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>
                                            {s === 'accepted' && 'APPROVE ORDER'}
                                            {s === 'rejected' && 'REJECT ORDER'}
                                            {s === 'dispatched' && 'MARK DISPATCHED'}
                                            {s === 'out_for_delivery' && 'OUT FOR DELIVERY'}
                                            {s === 'delivered' && 'CONFIRM DELIVERY'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-alt/50 border border-border rounded-2xl p-6 text-center shadow-sm">
                            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] italic">
                                Terminal Status Reached: {order.status.toUpperCase()}
                            </p>
                        </div>
                    )}

                    {/* Inventory Items Card (Redesigned) */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Ordered Items</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-alt/20 hover:bg-surface-alt/40 border border-border/40 hover:border-primary/20 hover:shadow-lg rounded-2xl transition-all duration-300 gap-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-surface border border-border rounded-xl overflow-hidden shrink-0">
                                            <img src={item.productId?.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-tight text-text">{item.productId?.name}</h4>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">
                                                SKU ID: {item.productId?._id?.slice(-8).toUpperCase() || 'N/A'}
                                            </p>
                                            <p className="text-[10px] font-black text-text-muted uppercase opacity-75 mt-0.5">
                                                Qty: {item.quantity} × ₹{item.price}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
                                        <p className="text-lg font-black text-text italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline History Trace (Redesigned) */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3">Timeline Trace</h3>
                        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-primary before:to-border">
                            {(order.timeline || []).slice().reverse().map((step, i) => {
                                const stepStatus = STATUS_FLOW[step.status] || STATUS_FLOW.pending;
                                return (
                                    <div key={i} className="relative text-left">
                                        <div className={`absolute -left-[22px] top-1.5 w-3.5 h-3.5 border-2 rounded-full transition-all duration-300 ${i === 0 ? 'bg-primary border-primary ring-4 ring-primary/20 scale-110' : 'bg-background border-border'}`} />
                                        <div className="flex flex-col bg-surface-alt/25 border border-border/40 hover:border-primary/20 p-4 rounded-xl transition-all">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-primary' : 'text-text'}`}>
                                                    {stepStatus.label}
                                                </span>
                                                <span className="text-[9px] font-bold text-text-muted opacity-40">{new Date(step.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-text-secondary mt-1 italic">"{step.note}"</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Logistics & Customer Area */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Financial Summary Card (Redesigned) */}
                    <div className="bg-gradient-to-br from-surface to-surface-alt border border-border rounded-3xl p-6 shadow-md space-y-4">
                        <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary pl-3 pb-1">Settlement Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-text">₹{order.subtotal?.toLocaleString()}</span>
                            </div>
                            
                            {/* Membership & Coupon Discounts as Green Badges */}
                            {order.membershipDiscount > 0 && (
                                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                        ✓ Membership Discount
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 italic">
                                        -₹{order.membershipDiscount?.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {order.promoDiscount > 0 && (
                                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                        ✓ Coupon Discount
                                    </span>
                                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 italic">
                                        -₹{order.promoDiscount?.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest pt-1">
                                <span>Logistics / Delivery</span>
                                <span className="text-text">{order.deliveryCharge > 0 ? `+₹${order.deliveryCharge}` : 'FREE'}</span>
                            </div>

                            {/* Accordion GST Breakdown */}
                            <div className="border-t border-b border-border/60 py-2">
                                <button
                                    onClick={() => setShowGstBreakdown(!showGstBreakdown)}
                                    className="w-full flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest focus:outline-none"
                                >
                                    <span>
                                        GST / Tax ({pGst}%) 
                                        <span className="ml-1 text-[8px] font-bold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-text-muted border border-border/50">
                                            {Math.abs((order.subtotal - (order.membershipDiscount || 0) - (order.promoDiscount || 0) + (order.deliveryCharge || 0)) - order.totalAmount) < 2 ? 'INCLUSIVE' : 'EXCLUSIVE'}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1 text-text">
                                        {Math.abs((order.subtotal - (order.membershipDiscount || 0) - (order.promoDiscount || 0) + (order.deliveryCharge || 0)) - order.totalAmount) < 2 ? '' : '+'}₹{taxAmount.toLocaleString()}
                                        {showGstBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </span>
                                </button>
                                {showGstBreakdown && (
                                    <div className="mt-2 pl-3 space-y-1.5 border-l border-primary/30 animate-reveal">
                                        <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                            <span>CGST ({pGst / 2}%)</span>
                                            <span>{Math.abs((order.subtotal - (order.membershipDiscount || 0) - (order.promoDiscount || 0) + (order.deliveryCharge || 0)) - order.totalAmount) < 2 ? '' : '+'}₹{cgst.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                            <span>SGST ({pGst / 2}%)</span>
                                            <span>{Math.abs((order.subtotal - (order.membershipDiscount || 0) - (order.promoDiscount || 0) + (order.deliveryCharge || 0)) - order.totalAmount) < 2 ? '' : '+'}₹{sgst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total Highlights */}
                            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-all duration-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                        Grand Total
                                    </span>
                                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 italic">
                                        ₹{order.totalAmount?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Origin Outlet Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <Store className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Origin Outlet</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-text uppercase">
                                {outlets.find(o => String(o._id) === String(order.outletId))?.name || 'Main Branch'}
                            </p>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                ID: {order.outletId || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Customer Profile Card (Redesigned) */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <User className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Customer Details</h4>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-lg text-primary shrink-0 shadow-inner">
                                {order.customerId?.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div className="space-y-2 min-w-0">
                                <div>
                                    <p className="text-sm font-black text-text uppercase flex items-center gap-1.5 truncate">
                                        {order.customerId?.name || 'Unknown User'}
                                    </p>
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black bg-primary/10 text-primary border border-primary/20 rounded-md uppercase tracking-wider">
                                        <Shield size={10} /> Premium Member
                                    </span>
                                </div>
                                {order.customerId?.phone && (
                                    <a href={`tel:${order.customerId.phone}`} className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors">
                                        <Phone className="w-3.5 h-3.5" /> {order.customerId.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery & Logistics Card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-text">Target Location</h4>
                        </div>
                        {order.deliveryPreference === 'home' ? (
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20 rounded-lg">
                                    <Truck className="w-3 h-3" /> Home Delivery
                                </span>
                                <div className="p-3 bg-surface-alt/50 border border-border rounded-xl">
                                    <p className="text-[11px] font-bold text-text uppercase leading-relaxed">{order.address?.street}</p>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">
                                        {order.address?.city}, {order.address?.zip}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20 rounded-lg">
                                    <Store className="w-3 h-3" /> In-Salon Pickup
                                </span>
                                <p className="text-[10px] font-bold text-text-muted uppercase italic">
                                    Customer will collect items directly from the salon.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
