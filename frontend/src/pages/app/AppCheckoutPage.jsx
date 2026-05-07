import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CreditCard, Wallet, MapPin, Truck, CheckCircle, ArrowRight, Zap, Info, BellRing } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';

export default function AppCheckoutPage() {
    const navigate = useNavigate();
    const { colors, isLight } = useCustomerTheme();
    const { cart, cartTotal, clearCart } = useCart();
    const { customer } = useCustomerAuth();
    const { balance, refreshWallet } = useWallet();
    const { loyaltySettings, activeOutlet } = useBusiness();
    
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [homeDelivery, setHomeDelivery] = useState(true);

    const [activeMembership, setActiveMembership] = useState(null);
    const [membershipDiscount, setMembershipDiscount] = useState(0);
    const [fetchingMembership, setFetchingMembership] = useState(false);

    useEffect(() => {
        const fetchMembership = async () => {
            setFetchingMembership(true);
            try {
                const res = await api.get('/loyalty/membership/active');
                if (res.data.success) {
                    setActiveMembership(res.data.data || res.data.membership || null);
                }
            } catch (err) {
                console.error('Error fetching membership:', err);
            } finally {
                setFetchingMembership(false);
            }
        };
        fetchMembership();
    }, []);

    useEffect(() => {
        // Use planId as it is the field name for the populated plan object
        const plan = activeMembership?.planId || activeMembership?.plan;
        if (plan) {
            let discount = 0;
            if (plan.productDiscountValue > 0) {
                if (plan.productDiscountType === 'percentage') {
                    discount = (cartTotal * plan.productDiscountValue) / 100;
                } else {
                    discount = plan.productDiscountValue;
                }
            }
            // Cap discount at cart total
            setMembershipDiscount(Math.min(discount, cartTotal));
        } else {
            setMembershipDiscount(0);
        }
    }, [activeMembership, cartTotal]);

    const isDeliveryAvailable = activeOutlet?.config?.enableDelivery || false;
    const deliveryFee = (homeDelivery && isDeliveryAvailable) 
        ? (activeOutlet?.config?.deliveryCharge || 0)
        : 0;
    
    const finalTotal = Math.max(0, cartTotal - membershipDiscount + deliveryFee);

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: ''
    });

    useEffect(() => {
        if (cart.items.length === 0 && step < 3) {
            navigate('/app/shop');
        }
    }, [cart.items.length, step, navigate]);

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Check balance if using wallet
            if (paymentMethod === 'wallet' && balance < cartTotal) {
                alert('Insufficient wallet balance. Please add money or choose another method.');
                setLoading(false);
                return;
            }

            const payload = {
                items: cart.items.map(item => ({
                    productId: item.productId._id || item.productId.id,
                    quantity: item.quantity,
                    price: item.productId.sellingPrice || item.productId.price
                })),
                subtotal: cartTotal,
                membershipDiscount: membershipDiscount,
                totalAmount: finalTotal,
                deliveryCharge: deliveryFee,
                paymentMethod,
                address: homeDelivery ? address : { type: 'salon_pickup' },
                deliveryPreference: homeDelivery ? 'home' : 'salon',
                salonId: localStorage.getItem('active_salon_id'),
                outletId: localStorage.getItem('active_outlet_id')
            };

            const res = await api.post('/orders', payload);
            if (res.data.success) {
                if (paymentMethod === 'wallet') {
                    await refreshWallet(); // Refresh balance after deduction
                }
                setStep(3);
                clearCart();
            }
        } catch (error) {
            console.error('Order placement failed:', error);
            alert(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    if (step === 3) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8 border border-green-500/20"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>
                <h1 className="text-3xl font-black italic tracking-tighter mb-4" style={{ color: colors.text }}>Order Confirmed!</h1>
                <p className="opacity-60 mb-12 text-[13px] uppercase font-bold tracking-widest leading-relaxed">Thank you for your purchase.<br />Your essentials are on their way.</p>
                <button
                    onClick={() => navigate('/app/shop')}
                    className="w-full h-16 bg-[#C8956C] text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl shadow-xl shadow-[#C8956C]/20"
                >
                    CONTINUE SHOPPING
                </button>
            </div>
        );
    }

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-12 pb-6" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}`, color: colors.text }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tight" style={{ color: colors.text }}>Checkout</h1>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Step {step} of 2</p>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-8">
                {/* Order Summary Shortcut */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl"
                    style={{ background: colors.card, border: `1.5px solid ${colors.border}` }}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Items Total</span>
                        <span className="text-sm font-black italic tracking-tighter" style={{ color: colors.text }}>₹{cartTotal}</span>
                    </div>
                    {membershipDiscount > 0 && (
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8956C]">
                                Membership ({activeMembership?.planId?.name || activeMembership?.plan?.name})
                                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-[#C8956C]/10 border border-[#C8956C]/20">
                                    {(activeMembership?.planId || activeMembership?.plan)?.productDiscountValue}
                                    {(activeMembership?.planId || activeMembership?.plan)?.productDiscountType === 'percentage' ? '%' : '₹'} OFF
                                </span>
                            </span>
                            <span className="text-sm font-black italic tracking-tighter text-[#C8956C]">- ₹{membershipDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Delivery Fee</span>
                        <span className="text-sm font-black italic tracking-tighter" style={{ color: deliveryFee > 0 ? colors.text : '#10B981' }}>
                            {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-dashed" style={{ borderTopColor: colors.border }}>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-100" style={{ color: colors.text }}>Grand Total</span>
                        <span className="text-3xl font-black italic tracking-tighter" style={{ color: '#C8956C' }}>₹{finalTotal}</span>
                    </div>
                    {loyaltySettings?.active && (
                        <div className="flex items-center justify-between py-2 px-3 mb-4 rounded-xl bg-[#C8956C]/5 border border-[#C8956C]/10">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-[#C8956C]" fill="#C8956C" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Loyalty Earned</span>
                            </div>
                            <span className="text-[12px] font-black text-[#C8956C]">{Math.floor((cartTotal - membershipDiscount) / (loyaltySettings.pointsRate || 100))} Points</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        {cart.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-[11px] font-bold opacity-60 uppercase tracking-widest">
                                <span>{item.productId.name} x {item.quantity}</span>
                                <span>₹{(item.productId.sellingPrice || item.productId.price) * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {step === 1 ? (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#C8956C]/10 flex items-center justify-center">
                                <MapPin size={16} className="text-[#C8956C]" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Shipping Address</h2>
                        </div>
                        {/* Home Delivery Toggle */}
                        {isDeliveryAvailable ? (
                            <div 
                                className="p-6 rounded-3xl flex items-center justify-between transition-all"
                                style={{ background: colors.card, border: `1.5px solid ${colors.border}` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#C8956C]/10 flex items-center justify-center">
                                        <Truck size={24} className="text-[#C8956C]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Home Delivery</p>
                                        <p className="text-[10px] font-bold opacity-40 uppercase">Ship to your doorstep</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setHomeDelivery(!homeDelivery)}
                                    className={`w-14 h-8 rounded-full relative transition-all ${homeDelivery ? 'bg-[#C8956C]' : 'bg-black/10'}`}
                                >
                                    <motion.div 
                                        animate={{ x: homeDelivery ? 26 : 4 }}
                                        className="absolute top-1 left-0 w-6 h-6 rounded-full bg-white shadow-md cursor-pointer"
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 rounded-3xl flex items-start gap-4" style={{ background: colors.card, border: `1.5px solid ${colors.border}`, opacity: 0.6 }}>
                                <Truck size={24} className="text-[#C8956C] mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: colors.text }}>Home Delivery Unavailable</p>
                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">This outlet only supports in-salon collection.</p>
                                </div>
                            </div>
                        )}

                        {homeDelivery ? (
                            <div className="p-6 rounded-3xl space-y-4" style={{ background: colors.card, border: `1.5px solid ${colors.border}` }}>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Street Address</label>
                                    <input 
                                        type="text" 
                                        value={address.street} 
                                        onChange={(e) => setAddress({...address, street: e.target.value})}
                                        className="w-full bg-transparent border-b border-white/10 py-2 font-bold text-sm focus:border-[#C8956C] outline-none transition-colors"
                                        style={{ color: colors.text }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">City</label>
                                        <input 
                                            type="text" 
                                            value={address.city} 
                                            onChange={(e) => setAddress({...address, city: e.target.value})}
                                            className="w-full bg-transparent border-b border-white/10 py-2 font-bold text-sm focus:border-[#C8956C] outline-none transition-colors"
                                            style={{ color: colors.text }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Zip Code</label>
                                        <input 
                                            type="text" 
                                            value={address.zip} 
                                            onChange={(e) => setAddress({...address, zip: e.target.value})}
                                            className="w-full bg-transparent border-b border-white/10 py-2 font-bold text-sm focus:border-[#C8956C] outline-none transition-colors"
                                            style={{ color: colors.text }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 rounded-3xl flex items-start gap-4" style={{ background: '#C8956C08', border: `1.5px dashed #C8956C33` }}>
                                <Info size={18} className="text-[#C8956C] mt-1 shrink-0" />
                                <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60" style={{ color: colors.text }}>
                                    Note: Since Home Delivery is opted out, you will need to collect your items directly from the salon.
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => setStep(2)}
                            className="w-full h-16 bg-[#C8956C] text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-[#C8956C]/20"
                        >
                            CONTINUE TO PAYMENT <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#C8956C]/10 flex items-center justify-center">
                                <CreditCard size={16} className="text-[#C8956C]" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Payment Method</h2>
                        </div>
                        
                        <div className="space-y-3">
                            {[
                                { id: 'cod', name: 'Pay at Salon', icon: Truck, subtitle: 'In-store payment' },
                                { id: 'wallet', name: 'Digital Wallet', icon: Wallet, subtitle: `Balance: ₹${balance?.toFixed(2) || '0.00'}` }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className="w-full p-6 rounded-3xl flex items-center gap-4 transition-all"
                                    style={{ 
                                        background: paymentMethod === method.id ? '#C8956C' : colors.card,
                                        border: `1.5px solid ${paymentMethod === method.id ? '#C8956C' : colors.border}`,
                                        color: paymentMethod === method.id ? '#FFF' : colors.text
                                    }}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-white/20' : 'bg-[#C8956C]/10'}`}>
                                        <method.icon size={24} className={paymentMethod === method.id ? 'text-white' : 'text-[#C8956C]'} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black uppercase tracking-widest">{method.name}</p>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${paymentMethod === method.id ? 'text-white' : ''}`}>{method.subtitle}</p>
                                    </div>
                                    {paymentMethod === method.id && <CheckCircle size={20} className="ml-auto text-white" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full h-16 bg-[#C8956C] text-white font-black uppercase tracking-[0.4em] text-[11px] rounded-2xl flex items-center justify-center gap-4 shadow-xl shadow-[#C8956C]/20 disabled:opacity-50"
                        >
                            {loading ? 'PROCESSING...' : `PAY ₹${finalTotal} & PLACE ORDER`}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
