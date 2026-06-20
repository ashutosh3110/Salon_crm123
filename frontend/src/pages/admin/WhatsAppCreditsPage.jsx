import React from 'react';
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
    Info,
    Plus,
    Activity,
    Percent,
    Calendar,
    Package
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

    const pricing = platformSettings?.whatsappPricing || { pricePerMessage: 1, minPurchaseQty: 1000 };

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
        <div className="space-y-4 pb-10 font-sans text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-transparent py-2">
                <div>
                    <h1 className="text-[22px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">WHATSAPP CREDITS</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Manage your salon-wide notification fuel</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 uppercase tracking-widest shadow-sm"
                    >
                        <History className="w-3.5 h-3.5" /> {showHistory ? 'Dashboard' : 'History'}
                    </button>
                </div>
            </div>

            {showHistory ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm"
                >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <History className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Purchase History</h3>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-3 min-h-[400px]">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-20">
                                <Info className="w-10 h-10 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-[0.15em]">No transactions found</p>
                            </div>
                        ) : (
                            history.map(log => (
                                <div key={log._id} className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1.5">+{log.credits.toLocaleString()} Credits</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1.5">₹{log.amount.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.15em] leading-none">{log.status}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    {/* Main Content (Left) */}
                    <div className="xl:col-span-8 space-y-4">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Salon Balance */}
                            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden min-h-[190px]">
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
                                        <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        Salon Balance
                                    </div>
                                    <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg tracking-widest leading-none">Active</span>
                                </div>
                                <div className="relative z-10 mb-10">
                                    <div className="text-[32px] font-black text-slate-900 mb-1.5 leading-none tracking-tight">{salon?.whatsappSettings?.whatsappCredits?.toLocaleString() || '1,097'}</div>
                                </div>
                                
                                {/* Area Chart SVG mock */}
                                <div className="absolute bottom-8 left-0 right-0 h-[84px] w-full z-0 text-[#10B981]">
                                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="emeraldGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,40 L0,30 C15,28 20,10 25,12 C30,14 35,26 40,26 C45,26 50,15 55,15 C60,15 65,23 70,23 C80,23 90,8 100,2 L100,40 Z" fill="url(#emeraldGradient)" />
                                        <path d="M0,30 C15,28 20,10 25,12 C30,14 35,26 40,26 C45,26 50,15 55,15 C60,15 65,23 70,23 C80,23 90,8 100,2" fill="none" stroke="currentColor" strokeWidth="1" />
                                        {/* dots */}
                                        <circle cx="25" cy="12" r="1" fill="white" stroke="currentColor" strokeWidth="0.8" />
                                        <circle cx="40" cy="26" r="1" fill="white" stroke="currentColor" strokeWidth="0.8" />
                                        <circle cx="55" cy="15" r="1" fill="white" stroke="currentColor" strokeWidth="0.8" />
                                        <circle cx="70" cy="23" r="1" fill="white" stroke="currentColor" strokeWidth="0.8" />
                                        <circle cx="100" cy="2" r="1" fill="white" stroke="currentColor" strokeWidth="0.8" />
                                    </svg>
                                </div>
                                <div className="absolute bottom-5 left-6 text-[9px] font-black text-[#10B981] uppercase tracking-widest z-10">
                                    ↑ +12% vs last 30 days
                                </div>
                            </div>

                            {/* 4 Cards Grid */}
                            <div className="lg:col-span-8 grid grid-cols-2 gap-4">
                                {[
                                    { title: 'Active Matrix', value: '3', desc: 'Active offers', icon: Activity, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                                    { title: 'Avg Magnitude', value: '13 units', desc: 'Average discount magnitude', icon: Percent, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                                    { title: 'Expiring Soon', value: '3', desc: 'Offers expiring soon', icon: Calendar, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                                    { title: 'Total Volume', value: '3', desc: 'Total coupon usage', icon: Package, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' }
                                ].map((card, i) => (
                                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex gap-3 shadow-sm items-center">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                                            <card.icon className={`w-4 h-4 ${card.color}`} />
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{card.title}</div>
                                            <div className="text-xl font-black text-slate-900 leading-none mb-1.5">{card.value}</div>
                                            <div className="text-[9px] font-medium text-slate-400">{card.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle Row: Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Bar Chart */}
                            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Usage Overview</h3>
                                    <select className="text-[10px] border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold text-slate-600 bg-slate-50">
                                        <option>Last 30 Days</option>
                                    </select>
                                </div>
                                <div className="flex gap-10 mb-6">
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-500 mb-1">Messages Sent</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[22px] font-black text-slate-900 leading-none">3,245</div>
                                            <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-widest"><TrendingUp className="w-2.5 h-2.5"/> 18.6%</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-bold text-slate-500 mb-1">Total Coupons Used</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[22px] font-black text-slate-900 dark:text-white leading-none">156</div>
                                            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 tracking-widest"><TrendingUp className="w-2.5 h-2.5"/> 9.3%</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Bar Chart SVG Mock */}
                                <div className="h-36 w-full flex items-end justify-between gap-1 sm:gap-2 pb-5 border-b border-slate-100 relative pt-4">
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between text-[8px] font-bold text-slate-400 pb-5">
                                        <span>400</span><span>300</span><span>200</span><span>100</span><span>0</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-end justify-around pl-8 pb-5">
                                        {[60, 20, 80, 40, 90, 30, 70, 50, 100, 40, 80, 60, 30, 90, 70].map((h1, i) => {
                                            const h2 = Math.max(10, h1 * 0.4);
                                            return (
                                                <div key={i} className="flex gap-0.5 sm:gap-1 items-end h-full">
                                                    <div className="w-1.5 sm:w-2.5 bg-emerald-400 rounded-t-sm" style={{height: `${h1}%`}}></div>
                                                    <div className="w-1.5 sm:w-2.5 bg-blue-500 rounded-t-sm" style={{height: `${h2}%`}}></div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-400 mt-3 pl-8 font-black uppercase tracking-widest">
                                    <span>26 Apr</span><span>1 May</span><span>6 May</span><span>11 May</span><span>16 May</span><span>21 May</span><span>26 May</span>
                                </div>
                                <div className="flex justify-start gap-6 mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest pl-8">
                                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Messages Sent</span>
                                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Coupons Used</span>
                                </div>
                            </div>

                            {/* Donut Chart */}
                            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col">
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Top Outlets By Usage</h3>
                                <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 px-4">
                                    {/* Donut Mock SVG */}
                                    <div className="relative w-36 h-36 shrink-0">
                                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#B4912B" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="100" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="180" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#E6C975" strokeWidth="14" strokeDasharray="251.2" strokeDashoffset="220" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total</span>
                                            <span className="text-xl font-black text-slate-900 leading-none mb-0.5">3,245</span>
                                            <span className="text-[8px] text-slate-500 font-bold tracking-widest">Messages</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 w-full sm:w-auto">
                                        {[
                                            { name: 'Rehan Hair - Indore', val: '1,450 (44.6%)', color: 'bg-[#B4912B]' },
                                            { name: 'Rehan Hair - Delhi', val: '820 (25.2%)', color: 'bg-[#D4AF37]' },
                                            { name: 'Rehan Hair - Bhopal', val: '610 (18.8%)', color: 'bg-[#E6C975]' },
                                            { name: 'Others', val: '365 (11.4%)', color: 'bg-[#cbd5e1]' }
                                        ].map((l, i) => (
                                            <div key={i}>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 mb-0.5">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${l.color}`}></div> {l.name}
                                                </div>
                                                <div className="text-[9px] text-slate-400 ml-4.5 font-medium">{l.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center mt-6">
                                    <button className="text-[10px] font-black text-slate-800 hover:text-blue-600 uppercase tracking-widest transition-colors">View All Outlets</button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row: Activity & Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            {/* Recent Activity */}
                            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-5">Recent Activity</h3>
                                <div className="space-y-4 mb-5">
                                    {[
                                        { title: 'Coupon SAVE20 used at Rehan Hair - Indore', time: '24 May 2026, 05:28 pm', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', badge: '20 credits', badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' },
                                        { title: 'Coupon SAVE10 used at Rehan Hair - Indore', time: '24 May 2026, 04:12 pm', icon: CheckCircle2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400', badge: '10 credits', badgeColor: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' },
                                        { title: 'New coupon ANNIVERSARY10 created', time: '23 May 2026, 11:09 am', icon: Package, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400', badge: 'Active', badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' }
                                    ].map((act, i) => (
                                        <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div className="flex gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                                                    <act.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-900 leading-tight mb-1">{act.title}</div>
                                                    <div className="text-[9px] font-medium text-slate-500">{act.time}</div>
                                                </div>
                                            </div>
                                            <div className={`text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider ${act.badgeColor}`}>{act.badge}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="text-[10px] font-black text-blue-600 flex items-center gap-1.5 hover:underline uppercase tracking-widest">
                                    View all activity <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Quick Insights */}
                            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-5">Quick Insights</h3>
                                <div className="space-y-5 mb-6">
                                    {[
                                        { icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', title: 'Peak usage day', val: 'Saturday', rval: '28%', rdesc: 'of total usage' },
                                        { icon: Package, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400', title: 'Most used coupon', val: 'SAVE20', rval: '42', rdesc: 'times used' },
                                        { icon: Percent, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400', title: 'Avg. discount given', val: '13 units', rval: 'Across all', rdesc: 'coupons' }
                                    ].map((ins, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ins.color}`}>
                                                    <ins.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-bold text-slate-500 mb-0.5">{ins.title}</div>
                                                    <div className="text-[13px] font-black text-slate-900 leading-none">{ins.val}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-slate-900 mb-0.5">{ins.rval}</div>
                                                <div className="text-[8px] font-medium text-slate-500">{ins.rdesc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="text-[10px] font-black text-blue-600 flex items-center gap-1.5 hover:underline uppercase tracking-widest">
                                    View detailed analytics <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar (Refuel) */}
                    <div className="xl:col-span-4 space-y-4">
                        {/* Refuel Card */}
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 relative">
                            <div className="mb-5">
                                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Refuel Credits</h2>
                                <p className="text-[10px] text-slate-500 font-medium">Select quantity to purchase</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {[1000, 5000, 10000, 20000].map((qty) => {
                                    const isSelected = creditsToBuy === qty;
                                    return (
                                        <button
                                            key={qty}
                                            onClick={() => setCreditsToBuy(qty)}
                                            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? '!bg-[#B4912B] !border-[#B4912B] text-white shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${isSelected ? 'text-white-muted-force' : 'text-slate-500'}`}>Pack</div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className={`text-[17px] font-black leading-none mb-1.5 ${isSelected ? 'text-white-force' : 'text-slate-900'}`}>{qty.toLocaleString()}</div>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-white-force" />}
                                            </div>

                                        </button>
                                    )
                                })}
                            </div>

                            <div className="flex items-center justify-between py-4 border-y border-slate-100 mb-6">
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Total Amount</div>
                                    <div className="text-[22px] font-black text-slate-900 leading-none">₹{(creditsToBuy * pricing.pricePerMessage).toLocaleString()}</div>
                                </div>
                                <div className="text-right mt-1">
                                    <div className="text-[9px] font-black text-slate-900 mb-1.5">+ 18% GST (INCLUDED)</div>
                                    <div className="flex items-center gap-1 justify-end text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Secured by Razorpay
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handlePurchase}
                                disabled={loading}
                                className="w-full cursor-pointer !bg-[#B4912B] hover:!bg-[#9a7b24] text-white rounded-xl py-4 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-[0.15em] shadow-md transition-colors disabled:opacity-70"
                            >
                                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>COMPLETE PURCHASE <ArrowRight className="w-3.5 h-3.5 text-white" /></>}
                            </button>
                            <div className="text-center mt-5 text-[8px] font-bold text-slate-500 uppercase tracking-widest flex justify-center items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> SAFE & SECURED TRANSACTIONS
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
                            <div className="flex gap-3 items-start">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pricing Policy</div>
                                    <div className="text-xs font-black text-slate-900 leading-none">₹{pricing.pricePerMessage} / Message</div>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Minimum Purchase</div>
                                    <div className="text-xs font-black text-slate-900 leading-none">{pricing.minPurchaseQty} Credits</div>
                                </div>
                            </div>
                        </div>

                        {/* Support Banner */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between border border-emerald-100/50 dark:border-emerald-900/30">
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 dark:text-emerald-400 mb-1 leading-none tracking-tight">Need help?</h3>
                                <p className="text-[10px] text-slate-600 dark:text-emerald-300/80 font-medium leading-relaxed">Contact support for bulk plans and custom solutions.</p>
                            </div>
                            <button className="px-4 cursor-pointer py-2.5 bg-white dark:bg-emerald-900/30 !text-emerald-600 dark:!text-emerald-400 rounded-lg text-[10px] font-black shadow-sm border border-emerald-200 dark:border-emerald-800/30 whitespace-nowrap hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors uppercase tracking-widest">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
