import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp, Star, MessageSquare, Wallet, Heart, Camera,
    Crown, Gem, History, ShoppingBag, Zap
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout } = useCustomerAuth();
    const { balance, transactions, initializeWallet } = useWallet();
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
    const avatarInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => URL.createObjectURL(file));
        setReviewImages(prev => [...prev, ...newImages]);
    };
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                const avatarUrl = res.data.url;
                await updateCustomer({ avatar: avatarUrl });
            }
        } catch (err) {
            console.error('Avatar upload failed:', err);
        } finally {
            setUploadingAvatar(false);
        }
    };
    const [form, setForm] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        gender: customer?.gender || '',
        birthday: customer?.birthday || '',
    });
    const [focusedField, setFocusedField] = useState(null);
    const [activeMembership, setActiveMembership] = useState(null);
    const [loadingMembership, setLoadingMembership] = useState(false);

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

    const [rules, setRules] = useState({
        earnRate: 1,
        redeemRate: 1,
        minRedeemPoints: 100,
    });

    useEffect(() => {
        if (customer?._id) {
            initializeWallet().catch(() => {});
        }
    }, [customer?._id, initializeWallet]);

    useEffect(() => {
        let cancelled = false;
        const loadActiveMembership = async () => {
            setLoadingMembership(true);
            try {
                const res = await api.get('/loyalty/membership/active');
                if (!cancelled) setActiveMembership(res.data?.data || null);
            } catch (e) {
                console.error('Failed to load membership', e);
            } finally {
                if (!cancelled) setLoadingMembership(false);
            }
        };
        if (customer?._id) loadActiveMembership();
        return () => { cancelled = true; };
    }, [customer?._id]);

    useEffect(() => {
        let cancelled = false;
        const loadRules = async () => {
            try {
                const res = await api.get('/loyalty/rules');
                const data = res?.data?.data || res?.data || {};
                if (!cancelled) {
                    setRules((prev) => ({
                        ...prev,
                        ...data,
                        earnRate: Number(data?.earnRate ?? prev.earnRate ?? 1),
                        redeemRate: Number(data?.redeemRate ?? prev.redeemRate ?? 1),
                        minRedeemPoints: Number(data?.minRedeemPoints ?? prev.minRedeemPoints ?? 100),
                    }));
                }
            } catch {
                // keep defaults
            }
        };
        if (customer?._id) loadRules();
        return () => {
            cancelled = true;
        };
    }, [customer?._id]);

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
        { icon: ShoppingBag, label: 'My Orders', path: '/app/orders', color: isLight ? 'text-orange-600' : 'text-orange-400' },
        { icon: Heart, label: 'Liked Items', path: '/app/likes', color: isLight ? 'text-rose-500' : 'text-rose-400' },
        { icon: Wallet, label: `My Wallet (₹${balance.toLocaleString()})`, path: '/app/wallet', color: isLight ? 'text-[#C8956C]' : 'text-[#C8956C]' },
        { icon: History, label: 'Transaction History', path: '/app/wallet', color: isLight ? 'text-indigo-600' : 'text-indigo-400' },
        { icon: Users, label: 'Refer Friends', path: '/app/referrals', color: isLight ? 'text-emerald-600' : 'text-emerald-400' },
    ];

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ background: colors.bg, minHeight: '100svh' }} className="px-4 pb-32">
            <div className="pt-6 pb-4">
                <h1 className="text-3xl font-black" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>Profile</h1>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-50" style={{ color: colors.textMuted }}>Account & Privileges</p>
            </div>


            {/* Profile Card */}
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}`, marginTop: '4px' }} className="rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C8956C]/20 to-[#C8956C]/10 flex items-center justify-center shrink-0 border border-[#C8956C]/20 overflow-hidden">
                            {uploadingAvatar ? (
                                <Loader2 className="w-6 h-6 animate-spin text-[#C8956C]" />
                            ) : customer?.avatar ? (
                                <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-black text-[#C8956C]">{getInitials(customer?.name)}</span>
                            )}
                        </div>
                        <button
                            onClick={() => avatarInputRef.current.click()}
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C8956C] rounded-full border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center text-white"
                        >
                            <Camera size={12} />
                        </button>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
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

            {/* Membership Section - Moved here after details */}
            <motion.div variants={fadeUp} className="mt-4">
                {activeMembership ? (
                    <div
                        onClick={() => navigate('/app/membership')}
                        style={{
                            background: activeMembership.planId?.gradient || 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                            borderRadius: '24px',
                            padding: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            color: activeMembership.planId?.id === 'gold' ? '#000' : '#FFF',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                    >
                        {/* Digital Card Chip/Logo */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-8 bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                <Crown size={20} className={activeMembership.planId?.id === 'gold' ? 'text-black' : 'text-white'} />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Membership Status</p>
                                <p className="text-xs font-black uppercase tracking-widest leading-none">ACTIVE</p>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black italic tracking-tighter mb-1 uppercase">{activeMembership.planId?.name || 'Tier Plan'}</h3>
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="opacity-60" />
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Valid Thru: {formatDate(activeMembership.expiryDate)}</p>
                            </div>
                        </div>

                        {/* Card Number Lookalike/Member ID */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Member ID</p>
                                <p className="text-[10px] font-mono font-bold tracking-widest">WAP-{(customer?._id || '000').slice(-6).toUpperCase()}</p>
                            </div>
                            <button className={`p-2 rounded-lg ${activeMembership.planId?.id === 'gold' ? 'bg-black/5' : 'bg-white/10'}`}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Geometric Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none" />
                        <Gem size={100} className="absolute -right-4 -bottom-4 opacity-5 rotate-12 pointer-events-none" />
                    </div>
                ) : (
                    <div
                        onClick={() => navigate('/app/membership')}
                        style={{ 
                            background: colors.card,
                            border: `1.5px dashed ${colors.border}`,
                            cursor: 'pointer'
                        }}
                        className="rounded-2xl p-6 flex items-center justify-between group hover:border-[#C8956C] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#C8956C]/10 flex items-center justify-center group-hover:bg-[#C8956C] transition-colors">
                                <Crown size={24} className="text-[#C8956C] group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Unlock Benefits</h4>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Join our Membership Hub</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:text-[#C8956C] transition-all" />
                    </div>
                )}
            </motion.div>

            {/* Loyalty Section - Moved slightly up */}
            <motion.div variants={fadeUp} className="mt-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Rewards Balance</h3>
                </div>

                <LoyaltyCard points={Number(customer?.loyaltyPoints || 0)} redeemRate={rules.redeemRate} />

                <div className="grid grid-cols-2 gap-2.5 mt-4">
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl p-4 text-center shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Point Value</p>
                        <p className="text-xl font-black text-[#C8956C]">₹{rules.redeemRate}</p>
                        <p className="text-[9px] italic mt-1 font-bold" style={{ color: colors.textMuted }}>per point</p>
                    </div>
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-xl p-4 text-center shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Min. Redeem</p>
                        <p className="text-xl font-black text-emerald-500">{rules.minRedeemPoints}</p>
                        <p className="text-[9px] italic mt-1 font-bold" style={{ color: colors.textMuted }}>PTS required</p>
                    </div>
                </div>
            </motion.div>

            <div className="h-6" />

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="space-y-3">
                {quickLinks.map((link) => (
                    <motion.button
                        key={link.label}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(link.path)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                        className="w-full flex items-center gap-4 rounded-xl p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5`}>
                            <link.icon className={`w-6 h-6 ${link.color}`} />
                        </div>
                        <span className="text-sm font-bold tracking-tight flex-1 text-left" style={{ color: colors.text }}>{link.label}</span>
                                        <ChevronRight className="w-4 h-4 opacity-20" />
                    </motion.button>
                ))}
            </motion.div>

            <div className="h-10" />

            {/* Review Section */}
            <motion.div variants={fadeUp} className="space-y-4 pt-16 pb-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Share Your Experience</h3>
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
                            <div className="flex gap-3 justify-center py-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button
                                        key={star}
                                        type="button"
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setReview({ ...review, rating: star })}
                                        style={{ color: review.rating >= star ? '#C8956C' : colors.textMuted }}
                                        disabled={isSubmittingReview}
                                    >
                                        <Star size={32} fill={review.rating >= star ? "#C8956C" : "none"} />
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
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl overflow-hidden shadow-sm mt-8">
                <button
                    onClick={() => navigate('/app/help')}
                    className="w-full flex items-center gap-4 p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <HelpCircle className="w-5 h-5 opacity-40" />
                    <span className="text-sm font-bold flex-1 text-left" style={{ color: colors.text }}>Help & Support</span>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                </button>
                <button
                    onClick={() => navigate('/app/privacy')}
                    className="w-full flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <Shield className="w-5 h-5 opacity-40" />
                    <span className="text-sm font-bold flex-1 text-left" style={{ color: colors.text }}>Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                </button>
            </motion.div>

            {/* Logout */}
            <motion.div variants={fadeUp} className="mt-8 mb-6">
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
