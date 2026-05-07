import { useState, useMemo, useEffect } from 'react';
import { 
    Search, Plus, Minus, Trash2, CreditCard, Banknote, 
    QrCode, ShoppingCart, User, Ticket, Clock, CheckCircle2,
    Calendar, Package, Zap, ArrowRight, X, ChevronRight,
    Star, Info, Store, History, Percent
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'upi', label: 'UPI', icon: QrCode, color: 'text-purple-500', bg: 'bg-purple-50' }
];

export default function POSPage() {
    const { user } = useAuth();
    const { 
        products, services, bookings, customers, staff, activeOutlet,
        checkoutPOS 
    } = useBusiness();

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastInvoice, setLastInvoice] = useState(null);

    // Filter today's "Pay at Salon" bookings that are not completed/cancelled
    const unpaidBookings = useMemo(() => {
        const today = new Date().toDateString();
        return bookings.filter(b => {
            const isToday = new Date(b.appointmentDate).toDateString() === today;
            const isUnpaid = b.paymentStatus === 'unpaid' || !b.paymentStatus;
            const isSalonPay = b.paymentMethod === 'salon' || !b.paymentMethod;
            const isActive = ['confirmed', 'arrived', 'in-progress'].includes(b.status);
            return isToday && isUnpaid && isSalonPay && isActive;
        });
    }, [bookings]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return [];
        const term = searchTerm.toLowerCase();
        
        const pMatches = products.filter(p => 
            p.name.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term)
        ).map(p => ({ ...p, type: 'product' }));

        const sMatches = services.filter(s => 
            s.name.toLowerCase().includes(term)
        ).map(s => ({ ...s, type: 'service' }));

        return [...pMatches, ...sMatches].slice(0, 10);
    }, [searchTerm, products, services]);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id && i.type === item.type);
            if (existing) {
                return prev.map(i => 
                    (i._id === item._id && i.type === item.type) ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        setSearchTerm('');
    };

    const updateQuantity = (id, type, delta) => {
        setCart(prev => prev.map(i => {
            if (i._id === id && i.type === type) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const removeFromCart = (id, type) => {
        setCart(prev => prev.filter(i => !(i._id === id && i.type === type)));
    };

    const selectBooking = (booking) => {
        setSelectedCustomer(booking.client);
        setCart([
            {
                ...booking.service,
                _id: booking.service?._id || booking.serviceId,
                type: 'service',
                price: booking.price,
                stylistId: booking.staffId?._id || booking.staffId,
                staffName: booking.staffId?.name || 'Assigned Stylist',
                bookingId: booking._id,
                quantity: 1
            }
        ]);
    };

    const subTotal = useMemo(() => 
        cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    , [cart]);

    const tax = subTotal * 0.18; // 18% GST estimate
    const total = subTotal + tax;

    const handleCheckout = async () => {
        if (!cart.length) return;
        setIsProcessing(true);
        try {
            const billingData = {
                clientId: selectedCustomer?._id,
                outletId: activeOutlet?._id,
                items: cart.map(item => ({
                    type: item.type,
                    itemId: item._id,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name,
                    stylistId: item.stylistId,
                    bookingId: item.bookingId
                })),
                paymentMethod,
                tax: Math.round(tax),
                performedBy: user?._id
            };

            const result = await checkoutPOS(billingData);
            setLastInvoice(result);
            setShowSuccess(true);
            setCart([]);
            setSelectedCustomer(null);
            
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            alert('Checkout failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-reveal font-black">
            {/* Left Section: Catalog & Search */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Search Bar */}
                <div className="bg-surface p-6 border border-border rounded-none shadow-sm relative group">
                    <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="SEARCH PRODUCTS OR SERVICES..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-surface-alt border border-border rounded-none focus:outline-none focus:border-primary text-xs font-black uppercase tracking-widest transition-all"
                    />
                    
                    {/* Search Results Dropdown */}
                    {filteredItems.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border shadow-2xl z-50 overflow-hidden animate-reveal-fast">
                            {filteredItems.map(item => (
                                <button
                                    key={`${item.type}-${item._id}`}
                                    onClick={() => addToCart(item)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-surface-alt border-b border-border last:border-0 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-none ${item.type === 'service' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {item.type === 'service' ? <Zap className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase text-text">{item.name}</p>
                                            <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter">{item.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-primary">₹{item.price}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main POS Interface Grid */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-hidden">
                    {/* Catalog Browse/Active Bookings */}
                    <div className="bg-surface border border-border rounded-none shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                                <History className="w-4 h-4 text-primary" />
                                ACTIVE SALON BOOKINGS
                            </h3>
                            <span className="text-[9px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-none border border-primary/20">
                                {unpaidBookings.length} TODAY
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {unpaidBookings.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                                    <Clock className="w-12 h-12 mb-4" />
                                    <p className="text-[10px] uppercase font-black tracking-widest">No pending salon payments found for today.</p>
                                </div>
                            ) : (
                                unpaidBookings.map(b => (
                                    <button
                                        key={b._id}
                                        onClick={() => selectBooking(b)}
                                        className="w-full group bg-surface-alt border border-border p-4 hover:border-primary hover:bg-surface transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rotate-12 translate-x-12 -translate-y-12 transition-all group-hover:bg-primary/10" />
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                                    {b.client?.name?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase text-text group-hover:text-primary transition-colors">{b.client?.name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-black text-text-muted flex items-center gap-1 uppercase">
                                                            <Clock className="w-3 h-3" /> {new Date(b.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{b.service?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-text tracking-tighter leading-none">₹{b.price}</p>
                                                <div className="mt-2 text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-none border border-emerald-100 uppercase tracking-widest">PAY AT SALON</div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="bg-surface border border-border rounded-none shadow-sm flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
                                <ShoppingCart className="w-4 h-4 text-primary" />
                                TERMINAL CART
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                                    <Trash2 className="w-3.5 h-3.5" /> CLEAR
                                </button>
                            )}
                        </div>

                        {/* Customer Context (if selected) */}
                        {selectedCustomer && (
                            <div className="mx-6 mt-6 p-4 bg-primary/5 border border-primary/20 flex items-center justify-between animate-reveal-fast">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-text">{selectedCustomer.name}</p>
                                        <p className="text-[8px] font-black text-text-muted mt-0.5">{maskPhone(selectedCustomer.phone, user?.role)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-1.5 text-text-muted hover:text-rose-500 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center grayscale">
                                    <ShoppingCart className="w-16 h-16 mb-6" />
                                    <p className="text-[11px] uppercase font-black tracking-[0.2em]">Cart is currently empty.</p>
                                    <p className="text-[9px] uppercase font-black tracking-widest mt-3 opacity-60">Scan items or select a booking.</p>
                                </div>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={`${item.type}-${item._id}-${idx}`} className="flex items-center justify-between gap-4 p-4 border border-border group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex flex-col items-center gap-2">
                                                <button onClick={() => updateQuantity(item._id, item.type, 1)} className="p-1 hover:text-primary transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-black text-text">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.type, -1)} className="p-1 hover:text-primary transition-colors">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black uppercase text-text truncate">{item.name}</p>
                                                <p className="text-[9px] font-black text-primary lowercase tracking-tighter mt-1">₹{item.price} / unit</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-3">
                                            <p className="text-sm font-black text-text tracking-tighter leading-none">₹{item.price * item.quantity}</p>
                                            <button onClick={() => removeFromCart(item._id, item.type)} className="p-1.5 text-text-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Payment Summary */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
                {/* Checkout Panel */}
                <div className="bg-surface border-2 border-primary rounded-none shadow-2xl flex flex-col">
                    <div className="p-8 border-b border-border relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rotate-45" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary relative z-10">ORDER SUMMARY</h2>
                        <div className="mt-8 space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-left">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-black text-text tracking-tighter uppercase leading-none text-right">₹{subTotal}</span>
                            </div>
                            <div className="flex justify-between items-center text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Service Tax</span>
                                    <div className="group relative">
                                        <Info className="w-3 h-3 text-text-muted cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-text text-surface text-[8px] font-black uppercase rounded-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">18% GST (SGST + CGST)</div>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-text-secondary tracking-tighter uppercase leading-none text-right">₹{Math.round(tax)}</span>
                            </div>
                            <div className="pt-6 border-t border-dashed border-border flex justify-between items-center text-left">
                                <span className="text-xs font-black text-text uppercase tracking-[0.2em]">Grand Total</span>
                                <h3 className="text-4xl font-black text-primary tracking-tighter uppercase leading-none text-right">
                                    <AnimatedCounter value={Math.round(total)} />
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Payment Selection */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Select Payment Method</p>
                            <div className="grid grid-cols-3 gap-3 font-black">
                                {PAYMENT_METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-none border-2 transition-all ${paymentMethod === m.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-border bg-surface hover:border-text-muted'}`}
                                    >
                                        <m.icon className={`w-6 h-6 ${paymentMethod === m.id ? 'text-primary' : 'text-text-muted'}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${paymentMethod === m.id ? 'text-primary' : 'text-text-muted'}`}>{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Special Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 p-4 border border-border bg-surface-alt hover:bg-surface transition-colors text-[9px] font-black uppercase tracking-widest">
                                <Ticket className="w-4 h-4 text-primary" /> APY COUPON
                            </button>
                            <button className="flex items-center justify-center gap-2 p-4 border border-border bg-surface-alt hover:bg-surface transition-colors text-[9px] font-black uppercase tracking-widest">
                                <Percent className="w-4 h-4 text-emerald-500" /> APPLY OFF
                            </button>
                        </div>

                        {/* Final Action */}
                        <button
                            disabled={cart.length === 0 || isProcessing}
                            onClick={handleCheckout}
                            className={`w-full group relative flex items-center justify-center gap-4 py-6 rounded-none shadow-2xl transition-all overflow-hidden ${
                                cart.length === 0 || isProcessing 
                                    ? 'bg-text-muted/20 cursor-not-allowed text-text-muted grayscale' 
                                    : 'bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative z-10 flex items-center gap-4">
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Processing Securely...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[12px] font-black uppercase tracking-[0.4em]">Finalize & Post</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Success Indicator */}
                {showSuccess && lastInvoice && (
                    <div className="bg-emerald-500 text-white p-6 rounded-none shadow-2xl border border-emerald-600 animate-slide-up relative">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="w-8 h-8" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">TRANSACTION COMPLETE</p>
                                <p className="text-[8px] font-black uppercase mt-1 tracking-widest opacity-80">Invoice #{lastInvoice.invoiceNumber || 'TXN-SUCCESS'}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
