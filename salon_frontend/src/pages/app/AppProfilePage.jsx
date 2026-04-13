import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp, Star, MessageSquare, Wallet, Heart, Camera,
    Crown, Gem, History, ShoppingBag, Zap, X
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import { useWallet } from '../../contexts/WalletContext';
import { AnimatePresence } from 'framer-motion';
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
    const [showReviewModal, setShowReviewModal] = useState(false);

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
        dob: customer?.dob || '',
        anniversary: customer?.anniversary || ''
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
                dob: customer.dob || '',
                anniversary: customer.anniversary || ''
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
        { icon: History, label: 'Transaction History', path: '/app/transactions', color: isLight ? 'text-indigo-600' : 'text-indigo-400' },
        { icon: Star, label: 'Post a Review', onClick: () => setShowReviewModal(true), color: isLight ? 'text-amber-500' : 'text-amber-400' },
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
                                    dob: customer?.dob || '',
                                    anniversary: customer?.anniversary || ''
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
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1.5 block tracking-widest" style={{ color: colors.textMuted }}>Birthday</label>
                                <div
                                    style={{
                                        background: isLight ? '#FFF9F5' : '#141414',
                                        borderRadius: '16px 4px 16px 4px',
                                        border: focusedField === 'dob' ? `1.5px solid #C8956C` : `1.5px solid ${colors.border}`,
                                        padding: '0 12px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <input
                                        type="date"
                                        value={form.dob}
                                        onFocus={() => setFocusedField('dob')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold"
                                        style={{ color: colors.text }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase mb-1.5 block tracking-widest" style={{ color: colors.textMuted }}>Anniversary</label>
                                <div
                                    style={{
                                        background: isLight ? '#FFF9F5' : '#141414',
                                        borderRadius: '16px 4px 16px 4px',
                                        border: focusedField === 'anniversary' ? `1.5px solid #C8956C` : `1.5px solid ${colors.border}`,
                                        padding: '0 12px',
                                        height: '44px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <input
                                        type="date"
                                        value={form.anniversary}
                                        onFocus={() => setFocusedField('anniversary')}
                                        onBlur={() => setFocusedField(null)}
                                        onChange={(e) => setForm({ ...form, anniversary: e.target.value })}
                                        className="w-full bg-transparent border-none outline-none text-xs font-bold"
                                        style={{ color: colors.text }}
                                    />
                                </div>
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
            {/* Quick Links */}
            <motion.div variants={fadeUp} className="space-y-3">
                {quickLinks.map((link) => (
                    <motion.button
                        key={link.label}
                        whileTap={{ scale: 0.98 }}
                        onClick={link.onClick || (() => navigate(link.path))}
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

            <AnimatePresence>
                {showReviewModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmittingReview && setShowReviewModal(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                background: colors.card, width: '100%', maxWidth: '500px',
                                borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                                padding: '32px 24px 96px', position: 'relative',
                                maxHeight: '90vh', overflowY: 'auto'
                            }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 style={{ color: colors.text, fontSize: '20px', fontWeight: 900 }}>Post a Review</h3>
                                    <p style={{ color: colors.accent, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>{activeOutlet?.name || 'Wapixo Salon'}</p>
                                </div>
                                <button onClick={() => setShowReviewModal(false)}><X size={24} style={{ color: colors.textMuted }} /></button>
                            </div>

                            {reviewSubmitted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <TrendingUp size={40} className="text-emerald-500" />
                                    </div>
                                    <h3 style={{ color: colors.text, fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Review Received!</h3>
                                    <p style={{ color: colors.textMuted, fontSize: '14px', fontWeight: 600 }}>Your feedback will be visible once approved by the admin.</p>
                                    <button 
                                        onClick={() => setShowReviewModal(false)}
                                        className="mt-8 px-8 py-3 bg-[#C8956C] text-white rounded-xl font-black uppercase text-[11px]"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                    <div className="flex gap-3 justify-center py-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileTap={{ scale: 0.8 }}
                                                onClick={() => setReview({ ...review, rating: star })}
                                                style={{ color: review.rating >= star ? '#C8956C' : colors.textMuted }}
                                                disabled={isSubmittingReview}
                                            >
                                                <Star size={40} fill={review.rating >= star ? "#C8956C" : "none"} />
                                            </motion.button>
                                        ))}
                                    </div>

                                    <div
                                        style={{
                                            background: colors.input,
                                            borderRadius: '20px 6px 20px 6px',
                                            border: focusedField === 'comment' ? `1.5px solid #C8956C` : `1.5px solid ${colors.border}`,
                                            padding: '16px',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <textarea
                                            onFocus={() => setFocusedField('comment')}
                                            onBlur={() => setFocusedField(null)}
                                            value={review.comment}
                                            onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                            placeholder="Sharing your ritual experience helps others..."
                                            disabled={isSubmittingReview}
                                            style={{
                                                background: 'transparent', border: 'none', outline: 'none', width: '100%',
                                                color: colors.text, fontSize: '14px', minHeight: '120px', resize: 'none', fontWeight: 600
                                            }}
                                        />
                                    </div>

                                    <div className="flex gap-2 pb-2">
                                        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 shrink-0"
                                            style={{ borderColor: colors.accent, color: colors.accent }}
                                        >
                                            <Camera size={20} />
                                            <span className="text-[9px] font-black uppercase">Add Photo</span>
                                        </button>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                            {reviewImages.map((img, i) => (
                                                <div key={i} className="w-16 h-16 rounded-xl overflow-hidden relative group shrink-0">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={() => setReviewImages(reviewImages.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-[10px]"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview || !review.comment.trim()}
                                        style={{
                                            width: '100%', padding: '18px', background: '#C8956C', color: '#FFF',
                                            borderRadius: '18px 6px 18px 6px', fontSize: '13px', fontWeight: 900,
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                            boxShadow: '0 8px 24px rgba(200,149,108,0.3)',
                                            opacity: (!review.comment.trim() ? 0.5 : 1)
                                        }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Ritual Experience"}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="h-10" />


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
