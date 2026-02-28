import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp, Star, MessageSquare
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import {
    MOCK_LOYALTY_WALLET, MOCK_LOYALTY_RULES, MOCK_LOYALTY_TRANSACTIONS
} from '../../data/appMockData';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout } = useCustomerAuth();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const { addFeedback } = useBusiness();
    const [review, setReview] = useState({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        gender: customer?.gender || '',
        birthday: customer?.birthday || '',
    });
    const [focusedField, setFocusedField] = useState(null);

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
            await new Promise(r => setTimeout(r, 800));
            updateCustomer(form);
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
        } finally {
            setIsSubmittingReview(false);
            // Hide success message after 3 seconds
            setTimeout(() => setReviewSubmitted(false), 3000);
        }
    };

    const quickLinks = [
        { icon: Calendar, label: 'My Bookings', path: '/app/bookings', color: isLight ? 'text-blue-600' : 'text-blue-400' },
        { icon: Users, label: 'Refer Friends', path: '/app/referrals', color: isLight ? 'text-emerald-600' : 'text-emerald-400' },
    ];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ background: colors.bg, minHeight: '100svh' }} className="space-y-5 px-4 pb-8">
            {/* Header */}
            <div className="pt-12 pb-2">
                <h1 className="text-2xl font-black" style={{ color: colors.text, fontFamily: "'Playfair Display', serif" }}>Profile</h1>
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
                        onClick={() => setEditing(!editing)}
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
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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

            {/* Testimonial / Review Section */}
            <motion.div variants={fadeUp} className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Share Your Experience</h3>
                </div>

                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl p-6 shadow-sm">
                    {reviewSubmitted ? (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                    <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
                                </motion.div>
                            </div>
                            <h4 className="text-base font-black uppercase tracking-tight" style={{ color: colors.text }}>Thank You!</h4>
                            <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Your feedback helps us shine brighter.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-5">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReview({ ...review, rating: star })}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>
                                    {review.rating === 5 && 'Absolutely Loved It! ✨'}
                                    {review.rating === 4 && 'Pretty Great! 👍'}
                                    {review.rating === 3 && 'it was okay. 🙂'}
                                    {review.rating === 2 && 'Could be better. 😕'}
                                    {review.rating === 1 && 'Disappointing. 😞'}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <div
                                    style={{
                                        background: isLight ? '#F9F9F9' : '#141414',
                                        borderRadius: '16px 4px 16px 4px',
                                        padding: '16px',
                                        border: `1.5px solid ${isLight ? '#E8ECEF' : 'rgba(255,255,255,0.05)'}`,
                                    }}
                                >
                                    <textarea
                                        placeholder="Tell us about your technical execution, service quality, or staff behavior..."
                                        value={review.comment}
                                        onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold resize-none h-24 placeholder:opacity-30"
                                        style={{ color: colors.text }}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                disabled={isSubmittingReview || !review.comment.trim()}
                                className="w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                                style={{
                                    background: isLight ? '#1A1A1A' : '#C8956C',
                                    color: '#FFFFFF',
                                    boxShadow: isLight ? '0 8px 20px rgba(0,0,0,0.1)' : '0 8px 20px rgba(200,149,108,0.2)'
                                }}
                            >
                                {isSubmittingReview ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <MessageSquare className="w-4 h-4" /> Submit Testimonial
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}
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
