import { useState, useEffect } from 'react';
import { 
    MessageSquare, 
    CreditCard, 
    History, 
    Zap, 
    AlertCircle, 
    CheckCircle2,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WhatsAppCreditsPage() {
    const { salon, fetchSalon, platformSettings } = useBusiness();
    const [creditsToBuy, setCreditsToBuy] = useState(platformSettings?.whatsappPricing?.minPurchaseQty || 1000);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const pricing = platformSettings?.whatsappPricing || { pricePerMessage: 0.50, minPurchaseQty: 1000 };

    useEffect(() => {
        if (platformSettings?.whatsappPricing?.minPurchaseQty) {
            setCreditsToBuy(platformSettings.whatsappPricing.minPurchaseQty);
        }
    }, [platformSettings]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/whatsapp-credits/credits/logs');
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const handlePurchase = async () => {
        if (creditsToBuy < pricing.minPurchaseQty) return toast.error(`Minimum ${pricing.minPurchaseQty} credits required`);

        setLoading(true);
        try {
            const res = await api.post('/whatsapp-credits/buy-credits/order', {
                credits: creditsToBuy
            });

            if (res.data.success) {
                const { order } = res.data;
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'WAPIXO WhatsApp Credits',
                    description: `Purchase of ${creditsToBuy} WhatsApp credits`,
                    order_id: order.id,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post('/whatsapp-credits/buy-credits/verify', {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                credits: creditsToBuy
                            });

                            if (verifyRes.data.success) {
                                toast.success('Credits purchased successfully!');
                                fetchSalon();
                                fetchHistory();
                            }
                        } catch (vErr) {
                            toast.error('Payment verification failed');
                        }
                    },
                    prefill: {
                        name: salon?.ownerName || '',
                        email: salon?.email || '',
                    },
                    theme: { color: '#C8956C' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 text-left font-black pb-4">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-4">
                <div className="text-left font-black leading-none">
                    <h1 className="text-base sm:text-lg font-black text-text uppercase tracking-tight leading-none">WhatsApp Credits</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1.5 uppercase tracking-[0.2em] opacity-60 leading-none">Manage your salon-wide notification fuel</p>
                </div>

                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all cursor-pointer whitespace-nowrap ${showHistory ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_12px_rgba(var(--color-primary),0.3)]' : 'bg-surface text-text border-border hover:bg-surface-alt'}`}
                >
                    <History className="w-3.5 h-3.5" /> {showHistory ? 'Back to Purchase' : 'View History'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Balance Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-surface rounded-2xl p-4 text-text border border-border relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${salon?.whatsappSettings?.whatsappCredits > 500 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse'}`}>
                                    {salon?.whatsappSettings?.whatsappCredits > 500 ? 'Active' : 'Low Balance'}
                                </div>
                            </div>
                            
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Salon Balance</p>
                                <div className="flex items-baseline gap-1.5">
                                    <h2 className="text-3xl font-black tracking-tighter text-text leading-none">{salon?.whatsappSettings?.whatsappCredits || 0}</h2>
                                    <span className="text-[10px] font-bold text-text-muted uppercase">Msgs</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border flex items-center justify-end">
                                <div className="w-7 h-7 rounded-full bg-surface-alt flex items-center justify-center border border-border">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-surface rounded-2xl p-3.5 border border-border space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Zap className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Pricing Policy</p>
                                <p className="text-[11px] font-black text-text leading-none">₹{pricing.pricePerMessage} / Message</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Minimum Purchase</p>
                                <p className="text-[11px] font-black text-text leading-none">{pricing.minPurchaseQty} Credits</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Section */}
                <div className="lg:col-span-2 space-y-4">
                    {!showHistory ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface rounded-2xl p-5 sm:p-6 border border-border shadow-sm flex flex-col justify-center h-full"
                        >
                            <div className="max-w-md mx-auto space-y-4 w-full">
                                <div className="text-center space-y-1.5 mb-1">
                                    <h3 className="text-lg font-black text-text uppercase tracking-tight leading-none flex items-center justify-center gap-1.5">
                                        <Zap className="w-4 h-4 text-primary" /> Refuel Credits
                                    </h3>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.15em]">Select a pack to power up your notifications</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[pricing.minPurchaseQty, pricing.minPurchaseQty * 5, pricing.minPurchaseQty * 10, pricing.minPurchaseQty * 20].map((qty, index) => {
                                        const isSelected = creditsToBuy === qty;
                                        const isPopular = index === 1;
                                        return (
                                            <button
                                                key={qty}
                                                onClick={() => setCreditsToBuy(qty)}
                                                className={`relative p-3.5 rounded-2xl border-2 transition-all text-left cursor-pointer ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:border-primary/40'}`}
                                            >
                                                {isPopular && (
                                                    <div className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                                                        Popular
                                                    </div>
                                                )}
                                                <p className={`text-[8px] font-bold uppercase tracking-[0.2em] mb-1.5 ${isSelected ? 'text-primary' : 'text-text-muted'}`}>Pack</p>
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`text-base font-black leading-none ${isSelected ? 'text-primary' : 'text-text'}`}>{qty.toLocaleString()}</h4>
                                                    <CheckCircle2 className={`w-4 h-4 transition-all ${isSelected ? 'text-primary scale-100 opacity-100' : 'text-border scale-75 opacity-0'}`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="pt-1">
                                    <div className="flex items-center justify-between p-3.5 bg-surface-alt rounded-2xl border border-border shadow-sm mb-3">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.15em] leading-none">Total Amount</p>
                                            <h4 className="text-xl font-black text-text leading-none">₹{(creditsToBuy * pricing.pricePerMessage).toLocaleString()}</h4>
                                        </div>
                                        <div className="flex flex-col items-end text-right">
                                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">+ 18% GST Inc.</p>
                                            <div className="flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-text-muted" />
                                                <p className="text-[7px] font-bold text-text-muted uppercase">Secured by Razorpay</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePurchase}
                                        disabled={loading}
                                        className="w-full py-2.5 bg-primary rounded-2xl text-primary-foreground flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md disabled:opacity-50 font-black uppercase tracking-[0.2em] text-[10px] cursor-pointer"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Complete Purchase
                                                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-alt">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
                                        <History className="w-4 h-4 text-text-muted" />
                                    </div>
                                    <h3 className="text-lg font-black text-text uppercase tracking-tight leading-none">Purchase History</h3>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4 py-20">
                                        <Info className="w-10 h-10 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em]">No transactions found</p>
                                    </div>
                                ) : (
                                    history.map(log => (
                                        <div key={log._id} className="p-4 bg-surface border border-border rounded-2xl hover:shadow-md transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <CreditCard className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-text uppercase leading-none mb-1">+{log.credits.toLocaleString()} Credits</h4>
                                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-text leading-none mb-1">₹{log.amount.toLocaleString()}</p>
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] leading-none">{log.status}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
