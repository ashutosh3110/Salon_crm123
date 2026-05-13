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
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">WhatsApp Credits</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Manage your salon-wide notification fuel</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-2xl border transition-all ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${salon?.whatsappSettings?.whatsappCredits > 500 ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400 animate-pulse'}`}>
                                    {salon?.whatsappSettings?.whatsappCredits > 500 ? 'Active' : 'Low Balance'}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">Salon Balance</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-6xl font-black italic tracking-tighter">{salon?.whatsappSettings?.whatsappCredits || 0}</h2>
                                    <span className="text-sm font-bold text-white/40 uppercase">Msgs</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex items-center justify-end">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Policy</p>
                                <p className="text-xs font-bold text-slate-900">₹{pricing.pricePerMessage} / Message</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Purchase</p>
                                <p className="text-xs font-bold text-slate-900">{pricing.minPurchaseQty} Credits</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase Section */}
                <div className="lg:col-span-2 space-y-8">
                    {!showHistory ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50"
                        >
                            <div className="max-w-md mx-auto space-y-10">
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Refuel Credits</h3>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select quantity to purchase</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[pricing.minPurchaseQty, pricing.minPurchaseQty * 5, pricing.minPurchaseQty * 10, pricing.minPurchaseQty * 20].map(qty => (
                                        <button
                                            key={qty}
                                            onClick={() => setCreditsToBuy(qty)}
                                            className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${creditsToBuy === qty ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${creditsToBuy === qty ? 'text-white/50' : 'text-slate-400'}`}>Pack</p>
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-black">{qty.toLocaleString()}</h4>
                                                <CheckCircle2 className={`w-5 h-5 transition-transform ${creditsToBuy === qty ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                                            <h4 className="text-3xl font-black text-slate-900 italic">₹{(creditsToBuy * pricing.pricePerMessage).toLocaleString()}</h4>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+ 18% GST (Included)</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Secured by Razorpay</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePurchase}
                                        disabled={loading}
                                        className="w-full h-20 bg-slate-900 rounded-[2rem] text-white flex items-center justify-center gap-4 group hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="text-sm font-black uppercase tracking-[0.2em] italic">Complete Purchase</span>
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safe & Secured Transactions</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 min-h-[600px] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                                        <History className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 italic uppercase">Purchase History</h3>
                                </div>
                                <button onClick={() => setShowHistory(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Close</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                                        <Info className="w-12 h-12 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No transactions found</p>
                                    </div>
                                ) : (
                                    history.map(log => (
                                        <div key={log._id} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-slate-300 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase">+{log.credits.toLocaleString()} Credits</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 italic">₹{log.amount.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{log.status}</p>
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
