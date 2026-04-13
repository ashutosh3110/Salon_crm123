import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Package, Calendar, CreditCard, Truck, MapPin, CheckCircle, Clock, Hash, ShoppingBag, Zap } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import api from '../../services/api';

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

    const statusConfig = {
        pending: { color: '#F59E0B', label: 'Order Pending', icon: Clock, bg: 'rgba(245,158,11,0.1)' },
        processing: { color: '#3B82F6', label: 'Processing', icon: ShoppingBag, bg: 'rgba(59,130,246,0.1)' },
        shipped: { color: '#6366F1', label: 'Out for Delivery', icon: Truck, bg: 'rgba(99,102,241,0.1)' },
        delivered: { color: '#10B981', label: 'Delivered', icon: CheckCircle, bg: 'rgba(16,185,129,0.1)' },
        cancelled: { color: '#EF4444', label: 'Cancelled', icon: Hash, bg: 'rgba(239,68,68,0.1)' },
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
                        <div className="w-10 h-10 rounded-xl bg-black/5 overflow-hidden">
                            <img src={order.salonId?.logo} className="w-full h-full object-cover" alt="" />
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

                {/* Items Section */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Purchased Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item, i) => (
                            <div key={i} className="p-4 rounded-3xl flex items-center gap-4" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                                <div className="w-14 h-14 rounded-2xl bg-black/5 overflow-hidden">
                                    <img src={item.productId?.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight" style={{ color: colors.text }}>{item.productId?.name}</h4>
                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[32px] space-y-3" style={{ background: colors.card, border: `1px solid ${colors.border}` }}>
                        <CreditCard size={18} className="text-[#C8956C]" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Payment Method</p>
                            <p className="text-[10px] font-black uppercase tracking-tight mt-0.5" style={{ color: colors.text }}>
                                {order.paymentMethod === 'cod' ? 'Pay at Salon' : order.paymentMethod?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="p-6 rounded-[32px] space-y-3" style={{ background: colors.card, border: `1.5px solid ${colors.border}`, borderColor: '#C8956C33' }}>
                        <Zap size={18} className="text-[#C8956C]" fill="#C8956C" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#C8956C' }}>Total Bill</p>
                            <p className="text-xl font-black italic tracking-tighter mt-0.5" style={{ color: '#C8956C' }}>₹{order.totalAmount}</p>
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
            </main>
        </div>
    );
}

function Info({ size, className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
}
