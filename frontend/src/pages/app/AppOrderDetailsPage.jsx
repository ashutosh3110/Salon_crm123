import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Calendar, CreditCard, Truck, MapPin, CheckCircle, Clock, Hash, ShoppingBag, Zap, XCircle, Tag } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

export default function AppOrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, colors } = useCustomerTheme();
    const isLight = theme === 'light';
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                if (res.data?.success) {
                    setOrder(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch order details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);

    // Derived values for robust breakdown display
    const itemsTotal = order?.subtotal || order?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryFee = order?.deliveryCharge || (order?.deliveryPreference === 'home' ? (order?.outletId?.config?.deliveryCharge || 0) : 0);
    const totalAmount = order?.totalAmount || 0;
    const taxAmount = order?.taxAmount || 0;
    const promoDiscount = order?.promoDiscount || 0;
    const membershipDiscount = order?.membershipDiscount || 0;

    const discountableAmount = itemsTotal - membershipDiscount - promoDiscount;
    const calculatedGstPercent = discountableAmount > 0 && taxAmount > 0
        ? Math.round((taxAmount / discountableAmount) * 100)
        : 12; // default fallback

    const statusConfig = {
        pending: { color: '#F59E0B', label: 'Order Pending', icon: Clock, bg: 'rgba(245,158,11,0.1)' },
        accepted: { color: '#3B82F6', label: 'Accepted', icon: CheckCircle, bg: 'rgba(59,130,246,0.1)' },
        rejected: { color: '#EF4444', label: 'Rejected', icon: XCircle, bg: 'rgba(239,68,68,0.1)' },
        dispatched: { color: '#6366F1', label: 'Dispatched', icon: Truck, bg: 'rgba(99,102,241,0.1)' },
        out_for_delivery: { color: '#8B5CF6', label: 'Out for Delivery', icon: Truck, bg: 'rgba(139,92,246,0.1)' },
        delivered: { color: '#10B981', label: 'Delivered', icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' },
        cancelled: { color: '#e6e8bff', label: 'Cancelled', icon: Hash, bg: 'rgba(100,116,139,0.1)' },
    };

    const status = statusConfig[order?.status] || statusConfig.pending;

    if (loading) return (
        <div className="min-h-svh flex flex-col items-center justify-center opacity-40" style={{ background: colors.bg }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Clock size={32} />
            </motion.div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest">Loading details...</p>
        </div>
    );

    if (!order) return (
        <div className="min-h-svh flex flex-col items-center justify-center p-8 text-center" style={{ background: colors.bg }}>
            <h1 className="text-xl font-black uppercase mb-4">Order Not Found</h1>
            <button onClick={() => navigate('/app/orders')} className="px-8 py-3 bg-[#C8956C] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Back to Orders</button>
        </div>
    );

    return (
        <div className="min-h-svh pb-12" style={{ background: colors.bg }}>
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-[100] h-16 px-6 flex items-center justify-between" style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}` }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ color: colors.text }}
                    className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 active:scale-90 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-[10px] font-black uppercase tracking-[0.3em]">Order <span className="text-[#C8956C]">Details</span></h1>
                <div className="w-10" />
            </header>

            <main className="pt-20 px-6 space-y-6">
                {/* Status Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-8 rounded-[40px] flex items-center gap-6 relative overflow-hidden"
                    style={{ background: isLight ? '#1A1A1A' : colors.card, border: `1px solid ${colors.border}` }}
                >
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center relative z-10" style={{ background: status.bg }}>
                        <status.icon size={30} style={{ color: status.color }} />
                    </div>
                    <div className="relative z-10 flex-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: isLight ? '#FFF' : colors.text }}>Current Status</p>
                        <h2 className="text-lg font-black uppercase italic tracking-tighter" style={{ color: status.color }}>{status.label}</h2>
                    </div>
                </motion.div>

                {/* Branch & Salon Section */}
                <div className="p-6 rounded-[32px] space-y-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-black/5 overflow-hidden border border-black/5">
                            <img src={getImageUrl(order.salonId?.logo)} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C8956C]">{order.salonId?.name || 'Brand'}</h4>
                            <p className="text-sm font-black uppercase tracking-tight" style={{ color: colors.text }}>{order.outletId?.name || 'Main Branch'}</p>
                        </div>
                    </div>
                    <div className="pt-3 border-t flex items-center justify-between" style={{ borderTopColor: colors.border }}>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Payment Status</p>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={10} className={order.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'} />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }}>
                                {order.paymentStatus === 'paid' ? 'Paid Online' : 'Payment Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tracking Timeline */}
                <div className="p-8 rounded-[40px] space-y-6" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-3">
                        <Truck size={18} className="text-[#C8956C]" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>Order Tracking</h3>
                    </div>

                    <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-black/5 dark:before:bg-white/5">
                        {(order.timeline || [{ status: 'pending', note: 'Order placed', timestamp: order.createdAt }]).slice().reverse().map((step, i) => {
                            const config = statusConfig[step.status] || statusConfig.pending;
                            const StepIcon = config.icon;
                            return (
                                <div key={i} className="relative">
                                    <div
                                        className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 shadow-sm"
                                        style={{
                                            background: i === 0 ? config.color : colors.card,
                                            borderColor: i === 0 ? config.color : colors.border
                                        }}
                                    >
                                        <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-white' : 'bg-black/20 dark:bg-white/20'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: i === 0 ? config.color : colors.text }}>
                                                {config.label}
                                            </span>
                                            <span className="text-[8px] font-bold opacity-30 uppercase">
                                                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-tight mt-0.5">
                                            {step.note}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Purchased Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item, i) => (
                            <div key={i} className="p-4 rounded-3xl flex items-center gap-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                                <div className="w-14 h-14 rounded-2xl bg-black/5 overflow-hidden border border-black/5">
                                    <img src={getImageUrl(item.productId?.appImage || (item.productId?.images && item.productId?.images[0]) || item.productId?.image)} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight" style={{ color: colors.text }}>{item.productId?.name}</h4>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {item.productId?.sku && <p className="text-[8px] font-black opacity-30 uppercase tracking-widest italic">SKU: {item.productId.sku}</p>}
                                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black italic tracking-tighter" style={{ color: colors.text }}>₹{item.price * item.quantity}</p>
                                    <p className="text-[8px] opacity-40 uppercase font-black">₹{item.price} each</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary & Payment Info */}
                <div className="p-8 rounded-[40px] space-y-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Order Summary</h3>

                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60 font-bold uppercase text-[10px] tracking-widest">Items Total</span>
                        <span className="font-black italic tracking-tighter" style={{ color: colors.text }}>₹{itemsTotal.toLocaleString()}</span>
                    </div>

                    {membershipDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-black uppercase text-[10px] tracking-widest text-[#C8956C]">Membership Discount</span>
                            <span className="font-black italic tracking-tighter text-[#C8956C]">- ₹{Number(membershipDiscount).toFixed(2)}</span>
                        </div>
                    )}

                    {order?.couponCode && promoDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-black uppercase text-[10px] tracking-widest text-[#C8956C] flex items-center gap-1.5">
                                <Tag size={12} className="rotate-90 text-[#C8956C]" />
                                Coupon Applied ({order.couponCode})
                            </span>
                            <span className="font-black italic tracking-tighter text-[#C8956C]">- ₹{Number(promoDiscount).toFixed(2)}</span>
                        </div>
                    )}

                    {order?.deliveryPreference === 'home' && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60 font-bold uppercase text-[10px] tracking-widest">Delivery Fee</span>
                            <span className="font-black italic tracking-tighter" style={{ color: deliveryFee > 0 ? colors.text : '#10B981' }}>
                                {deliveryFee > 0 ? `₹${deliveryFee.toLocaleString()}` : 'FREE'}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60 font-bold uppercase text-[10px] tracking-widest">Tax Rule</span>
                        <span className="font-black uppercase text-[9px] tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Excluding GST (Tax Extra)</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60 font-bold uppercase text-[10px] tracking-widest">GST Rate</span>
                        <span className="font-black italic tracking-tighter" style={{ color: colors.text }}>{calculatedGstPercent}%</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-black/5 dark:border-white/5">
                        <span className="opacity-50 font-bold uppercase text-[9.5px] tracking-widest">CGST ({calculatedGstPercent / 2}%)</span>
                        <span className="font-black italic tracking-tighter opacity-80" style={{ color: colors.text }}>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pl-4 border-l-2 border-black/5 dark:border-white/5">
                        <span className="opacity-50 font-bold uppercase text-[9.5px] tracking-widest">SGST ({calculatedGstPercent / 2}%)</span>
                        <span className="font-black italic tracking-tighter opacity-80" style={{ color: colors.text }}>₹{(taxAmount / 2).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="opacity-60 font-bold uppercase text-[10px] tracking-widest">Total Tax / GST</span>
                        <span className="font-black italic tracking-tighter" style={{ color: colors.text }}>₹{taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 mt-2 border-t border-dashed space-y-4" style={{ borderTopColor: colors.border }}>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="opacity-100 font-black uppercase text-[12px] tracking-widest" style={{ color: colors.text }}>Total Amount</span>
                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                                    Paid via {order.paymentMethod === 'cod' ? 'In-Salon' : order.paymentMethod?.toUpperCase()}
                                </p>
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter pr-2" style={{ color: '#C8956C' }}>₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping / Collection Info */}
                <div className="p-8 rounded-[40px] space-y-6" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-[#C8956C]" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>
                            {order.deliveryPreference === 'home' ? 'Delivery Address' : 'Salon Collection'}
                        </h3>
                    </div>

                    {order.deliveryPreference === 'home' && order.address ? (
                        <div className="space-y-2 opacity-60">
                            <p className="text-[11px] font-bold uppercase tracking-widest">{order.address.street}</p>
                            <p className="text-[11px] font-bold uppercase tracking-widest">{order.address.city}, {order.address.zip}</p>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#C8956C08] border border-[#C8956C22]">
                            <Info size={16} className="text-[#C8956C] mt-0.5" />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                                This order is marked for in-salon collection. Please visit the salon and show your Order ID to collect your items.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-2 py-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Order ID: {order._id}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Ordered on {new Date(order.createdAt).toLocaleString()}</p>
                </div>

                {/* Cancel Action */}
                {!['out_for_delivery', 'delivered', 'cancelled', 'rejected'].includes(order.status) && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to cancel this order? If you paid via wallet, the amount will be refunded instantly.')) {
                                try {
                                    setLoading(true);
                                    const res = await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled by user' });
                                    if (res.data?.success) {
                                        setOrder(res.data.data);
                                    }
                                } catch (err) {
                                    alert(err.response?.data?.message || 'Cancellation failed');
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 border border-rose-500/20 bg-rose-500/5 rounded-2xl mt-4"
                    >
                        Cancel Order
                    </motion.button>
                )}
            </main>
        </div>
    );
}

function Info({ size, className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;
}
