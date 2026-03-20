import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp, Star, MessageSquare, Wallet, Heart, Camera
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import {
    MOCK_LOYALTY_WALLET, MOCK_LOYALTY_RULES, MOCK_LOYALTY_TRANSACTIONS
} from '../../data/appMockData';
import { useWallet } from '../../contexts/WalletContext';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout } = useCustomerAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const { addFeedback, activeOutlet } = useBusiness();
    const [review, setReview] = useState({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
    const [reviewImages, setReviewImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => URL.createObjectURL(file));
        setReviewImages(prev => [...prev, ...newImages]);
    };
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        gender: customer?.gender || '',
        birthday: customer?.birthday || '',
    });
    const [focusedField, setFocusedField] = useState(null);

    // Sync form when customer loads or changes
    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || '',
                email: customer.email || '',
                gender: customer.gender || '',
                birthday: customer.birthday || '',
            });
        }
    }, [customer?._id]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        input: isLight ? '#F1F3F5' : '#141414',
    };

    // Loyalty Data
    const wallet = MOCK_LOYALTY_WALLET;
    const rules = MOCK_LOYALTY_RULES;
    const transactions = MOCK_LOYALTY_TRANSACTIONS;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCustomer(form);
            setEditing(false);
        } catch {
            console.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!review.comment.trim()) return;

        setIsSubmittingReview(true);
        try {
            // Simulated delay for premium feel
            await new Promise(r => setTimeout(r, 1200));

            addFeedback({
                customer: customer?.name || 'Anonymous Customer',
                rating: review.rating,
                comment: review.comment,
                service: review.service,
                staff: review.staff,
            });

            setReviewSubmitted(true);
            setReview({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
            setReviewImages([]);
        } finally {
            setIsSubmittingReview(false);
            // Hide success message after 3 seconds
            setTimeout(() => setReviewSubmitted(false), 3000);
        }
    };

    const quickLinks = [
        { icon: Calendar, label: 'My Bookings', path: '/app/bookings', color: isLight ? 'text-blue-600' : 'text-blue-400' },
        { icon: Heart, label: 'Liked Items', path: '/app/likes', color: isLight ? 'text-rose-500' : 'text-rose-400' },
        { icon: Wallet, label: `My Wallet (₹${balance.toLocaleString()})`, path: '/app/wallet', color: isLight ? 'text-[#C8956C]' : 'text-[#C8956C]' },
        { icon: Users, label: 'Refer Friends', path: '/app/referrals', color: isLight ? 'text-emerald-600' : 'text-emerald-400' },
    ];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ background: colors.bg, minHeight: '100svh' }} className="space-y-5 px-4 pb-8">
            {/* Header */}
            <div className="pt-12 pb-2">
                <h1 className="text-2xl font-black" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>Profile</h1>
                <p className="text-xs" style={{ color: colors.textMuted }}>Manage your account and rewards</p>
            </div>

            {/* Profile Card */}
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C8956C]/20 to-[#C8956C]/10 flex items-center justify-center shrink-0 border border-[#C8956C]/20">
                        <span className="text-xl font-black text-[#C8956C]">{getInitials(customer?.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold truncate" style={{ color: colors.text }}>{customer?.name || 'Customer'}</h2>
                        <p className="text-xs" style={{ color: colors.textMuted }}>{customer?.phone ? `+91 ${customer.phone}` : ''}</p>
                        {customer?.email && <p className="text-xs" style={{ color: colors.textMuted }}>{customer.email}</p>}
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (!editing) {
                                setForm({
                                    name: customer?.name || '',
                                    email: customer?.email || '',
                                    gender: customer?.gender || '',
                                    birthday: customer?.birthday || '',
                                });
                            }
                            setEditing(!editing);
                        }}
                        style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    >
                        <Edit3 className="w-4 h-4" style={{ color: colors.textMuted }} />
                    </motion.button>
                </div>

                {/* Edit Form */}
                {editing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-3 overflow-hidden"
                    >
                        <div>
                            <label className="text-[10px] font-black uppercase mb-1.5 block tracking-widest" style={{ color: colors.textMuted }}>Name</label>
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    boxShadow: isLight
                                        ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                                        : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                    borderRadius: '20px 6px 20px 6px',
                                    border: focusedField === 'name' ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    padding: '0 16px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <input
                                    type="text"
                                    value={form.name}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\\s]/g, '') })}
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '14px', fontWeight: 600 }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase mb-1.5 block tracking-widest" style={{ color: colors.textMuted }}>Email</label>
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    boxShadow: isLight
                                        ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                                        : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                    borderRadius: '20px 6px 20px 6px',
                                    border: focusedField === 'email' ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    padding: '0 16px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <input
                                    type="email"
                                    value={form.email}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="your@email.com"
                                    style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '14px', fontWeight: 600 }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase mb-1.5 block tracking-widest" style={{ color: colors.textMuted }}>Gender</label>
                            <div className="flex gap-2">
                                {['female', 'male'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setForm({ ...form, gender: g })}
                                        style={{
                                            flex: 1,
                                            padding: '12px 0',
                                            borderRadius: '16px 4px 16px 4px',
                                            background: form.gender === g
                                                ? (isLight ? '#FDF6F0' : 'rgba(200,149,108,0.1)')
                                                : (isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'rgba(255,255,255,0.05)'),
                                            border: form.gender === g ? '1.5px solid #C8956C' : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                            color: form.gender === g ? '#C8956C' : colors.textMuted,
                                            fontSize: '11px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            boxShadow: isLight && form.gender !== g ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'none',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setEditing(false)}
                                style={{
                                    flex: 1,
                                    padding: '14px 0',
                                    borderRadius: '20px 6px 20px 6px',
                                    border: `1.5px solid ${isLight ? '#E8ECEF' : 'rgba(255,255,255,0.1)'}`,
                                    color: colors.textMuted,
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    background: 'transparent'
                                }}
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: '14px 0',
                                    borderRadius: '20px 6px 20px 6px',
                                    background: '#C8956C',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    boxShadow: '0 8px 20px rgba(200,149,108,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Loyalty Section */}
            <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Loyalty Rewards</h3>
                </div>

                <LoyaltyCard points={wallet.totalPoints} redeemRate={rules.redeemRate} />

                <div className="grid grid-cols-2 gap-2.5">
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl p-4 text-center shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Earn Rate</p>
                        <p className="text-xl font-black text-emerald-500">{rules.earnRate}x</p>
                        <p className="text-[9px] italic mt-1" style={{ color: colors.textMuted }}>point per ₹1</p>
                    </div>
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl p-4 text-center shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Redeem Value</p>
                        <p className="text-xl font-black text-[#C8956C]">₹{rules.redeemRate}</p>
                        <p className="text-[9px] italic mt-1" style={{ color: colors.textMuted }}>per point</p>
                    </div>
                </div>

                {/* How It Works */}
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl overflow-hidden shadow-sm">
                    <button
                        onClick={() => setShowHowItWorks(!showHowItWorks)}
                        className="w-full flex items-center justify-between p-4"
                    >
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider" style={{ color: colors.text }}>
                            <Info className="w-4 h-4 text-[#C8956C]" /> How It Works
                        </span>
                        {showHowItWorks ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                    </button>

                    {showHowItWorks && (
                        <div className="px-4 pb-5 space-y-3.5 border-t border-black/5 dark:border-white/5 pt-4">
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-[10px] font-black text-emerald-500 border border-emerald-500/20">1</span>
                                <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>Earn <span className="font-bold" style={{ color: colors.text }}>{rules.earnRate} point</span> for every ₹1 spent</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-[#C8956C]/10 flex items-center justify-center shrink-0 text-[10px] font-black text-[#C8956C] border border-[#C8956C]/20">2</span>
                                <p className="text-[11px] leading-relaxed" style={{ color: colors.textMuted }}>Redeem at <span className="font-bold" style={{ color: colors.text }}>₹{rules.redeemRate}/point</span>. Min <span className="font-bold" style={{ color: colors.text }}>{rules.minRedeemPoints} pts</span></p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: colors.textMuted }}>Recent Activity</p>
                    {transactions.slice(0, 3).map((tx) => (
                        <div key={tx._id} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl p-4 flex items-center gap-4 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'EARN' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#C8956C]/10 border border-[#C8956C]/20'}`}>
                                {tx.type === 'EARN' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-[#C8956C]" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] font-bold truncate" style={{ color: colors.text }}>{tx.metadata?.serviceName || tx.type}</p>
                                <p className="text-[10px]" style={{ color: colors.textMuted }}>{formatDate(tx.createdAt)}</p>
                            </div>
                            <span className={`text-sm font-black tracking-tighter ${tx.points > 0 ? 'text-emerald-500' : 'text-[#C8956C]'}`}>
                                {tx.points > 0 ? '+' : ''}{tx.points}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="space-y-3">
                {quickLinks.map((link) => (
                    <motion.button
                        key={link.path}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(link.path)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                        className="w-full flex items-center gap-4 rounded-xl p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5`}>
                            <link.icon className={`w-6 h-6 ${link.color}`} />
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-wider flex-1 text-left" style={{ color: colors.text }}>{link.label}</span>
                        <ChevronRight className="w-4 h-4 opacity-20" />
                    </motion.button>
                ))}
            </motion.div>

            {/* Review Section */}
            <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Share Your Experience</h3>
                </div>

                <div style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    position: 'relative',
                    overflow: 'hidden'
                }} className="rounded-2xl p-6 shadow-sm">
                    {/* Decorative Background Icon */}
                    <MessageSquare style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '80px',
                        height: '80px',
                        opacity: 0.03,
                        transform: 'rotate(-15deg)',
                        color: colors.accent
                    }} />

                    <div className="relative z-10">
                        <h4 style={{ color: colors.text }} className="text-sm font-black uppercase tracking-wider mb-1">Review Active Salon</h4>
                        <p style={{ color: colors.accent }} className="text-[11px] font-bold mb-4">{activeOutlet?.name || 'Wapixo Salon'} · {activeOutlet?.city || 'India'}</p>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            {/* Star Rating */}
                            <div className="flex gap-2 justify-center py-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        type="button"
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setReview({ ...review, rating: star })}
                                        style={{ color: review.rating >= star ? '#C8956C' : colors.textMuted }}
                                        disabled={isSubmittingReview}
                                    >
                                        <Star size={24} fill={review.rating >= star ? "#C8956C" : "none"} />
                                    </motion.button>
                                ))}
                            </div>

                            {/* Comment Box */}
                            <div
                                style={{
                                    background: isLight ? '#FFF9F5' : '#141414',
                                    borderRadius: '16px 4px 16px 4px',
                                    border: focusedField === 'comment' ? `1.5px solid #C8956C` : `1.5px solid ${colors.border}`,
                                    padding: '12px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <textarea
                                    onFocus={() => setFocusedField('comment')}
                                    onBlur={() => setFocusedField(null)}
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    placeholder="Tell us how we did..."
                                    disabled={isSubmittingReview}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        width: '100%',
                                        color: colors.text,
                                        fontSize: '13px',
                                        minHeight: '80px',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            {/* Photo Upload Container */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <motion.button
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        width: '56px', height: '56px', borderRadius: '12px', border: `1px dashed ${colors.accent}`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        gap: '4px', background: 'none', color: colors.accent, flexShrink: 0, cursor: 'pointer'
                                    }}
                                >
                                    <Camera size={16} />
                                    <span style={{ fontSize: '8px', fontWeight: 800 }}>Add</span>
                                </motion.button>
                                {reviewImages.map((imgUrl, index) => (
                                    <div key={index} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                                            style={{ position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: 'none', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                disabled={isSubmittingReview || !review.comment.trim()}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: reviewSubmitted ? '#22C55E' : '#C8956C',
                                    color: '#FFF',
                                    borderRadius: '16px 4px 16px 4px',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    boxShadow: reviewSubmitted ? '0 8px 20px rgba(34,197,94,0.3)' : '0 8px 20px rgba(200,149,108,0.3)',
                                    border: 'none',
                                    opacity: (!review.comment.trim() && !reviewSubmitted) ? 0.5 : 1
                                }}
                                className="flex items-center justify-center gap-2"
                            >
                                {isSubmittingReview ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : reviewSubmitted ? (
                                    <>Submitted ✨</>
                                ) : (
                                    <>Submit Review</>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Support & Legal */}
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl overflow-hidden shadow-sm">
                <button
                    onClick={() => navigate('/app/help')}
                    className="w-full flex items-center gap-4 p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <HelpCircle className="w-5 h-5 opacity-40" />
                    <span className="text-sm font-bold flex-1 text-left opacity-60" style={{ color: colors.text }}>Help & Support</span>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                </button>
                <button
                    onClick={() => navigate('/app/privacy')}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <Shield className="w-5 h-5 opacity-40" />
                    <span className="text-sm font-bold flex-1 text-left opacity-60" style={{ color: colors.text }}>Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                </button>
            </motion.div>

            {/* Logout */}
            <motion.div variants={fadeUp}>
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-500/20 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/5 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            style={{ border: `1px solid ${colors.border}`, color: colors.textMuted }}
                            className="flex-1 py-4 rounded-xl text-[11px] font-black uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={customerLogout}
                            className="flex-1 py-4 rounded-xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                            Yes, Log Out
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* App Version */}
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-20 pb-4" style={{ color: colors.text }}>Wapixo v1.0.0</p>
        </motion.div>
    );
}
