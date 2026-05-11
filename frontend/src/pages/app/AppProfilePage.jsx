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
    const { customer, updateCustomer, customerLogout, refreshProfile } = useCustomerAuth();
    const { balance, transactions } = useWallet();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const { addFeedback, activeOutlet, platformSettings } = useBusiness();
    const [review, setReview] = useState({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
    const [reviewImages, setReviewImages] = useState([]);
    const fileInputRef = useRef(null);
    const avatarInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        const validFiles = files.filter(file => {
            if (file.size > threshold) {
                alert(`Image ${file.name} is too large. Max ${maxSize}${unit} allowed.`);
                return false;
            }
            return true;
        });

        const newImages = validFiles.map(file => URL.createObjectURL(file));
        setReviewImages(prev => [...prev, ...newImages]);
    };
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await api.delete('/auth/profile');
            if (res.data.success) {
                customerLogout();
                navigate('/app/login');
            }
        } catch (err) {
            console.error('Delete account failed:', err);
            alert('Failed to delete account. Please contact support.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        if (file.size > threshold) {
            alert(`Image too large. Max ${maxSize}${unit} allowed.`);
            return;
        }

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
    const activeMembership = customer?.activeMembership || null;

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

    useEffect(() => {
        if (showReviewModal || showDeleteConfirm) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        };
    }, [showReviewModal, showDeleteConfirm]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#ffffff',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
        input: isLight ? '#F1F3F5' : '#141414',
    };

    const [rules, setRules] = useState({
        pointsRate: 100,
        minRedeemPoints: 100,
    });

    // Removed Lazy Loading State for Sections (replaced by direct navigation)


    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!customer?._id || fetchedRef.current) return;
        fetchedRef.current = true;

        const loadData = async () => {
            try {
                // 1. Profile API (Updates customer context which includes balance)
                await refreshProfile();

                // 2. Loyalty Rules API
                const res = await api.get('/loyalty/rules');
                const data = res?.data?.data || res?.data || {};
                setRules((prev) => ({
                    ...prev,
                    ...data,
                    pointsRate: Number(data?.pointsRate ?? prev.pointsRate ?? 100),
                    minRedeemPoints: Number(data?.minRedeemPoints ?? prev.minRedeemPoints ?? 100),
                }));
            } catch (err) {
                console.error('Failed to load profile data', err);
            }
        };

        loadData();
    }, [customer?._id, refreshProfile]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSave = async () => {
        if (form.email && !validateEmail(form.email)) {
            alert('Please enter a valid email address');
            return;
        }

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
                customer: review.name || customer?.name || 'Anonymous Customer',
                rating: review.rating,
                comment: review.comment,
                service: review.service,
                staff: review.staff,
            });

            setReviewSubmitted(true);
            setReview({ rating: 5, comment: '', service: 'General', staff: 'Salon Team', name: '' });
            setReviewImages([]);
        } finally {
            setIsSubmittingReview(false);
            // Hide success message after 3 seconds
            setTimeout(() => setReviewSubmitted(false), 3000);
        }
    };

    const quickLinks = [
        { id: 'bookings', icon: Calendar, label: 'My Bookings', path: '/app/bookings', color: isLight ? 'text-blue-600' : 'text-blue-400', subLabel: 'VIEW BOOKINGS' },
        { id: 'orders', icon: ShoppingBag, label: 'My Orders', path: '/app/orders', color: isLight ? 'text-orange-600' : 'text-orange-400', subLabel: 'VIEW ORDERS' },
        { id: 'liked', icon: Heart, label: 'Liked Items', path: '/app/likes', color: isLight ? 'text-rose-500' : 'text-rose-400', subLabel: 'VIEW LIKES' },
        { id: 'wallet', icon: Wallet, label: `My Wallet (₹${balance.toLocaleString()})`, path: '/app/wallet', color: isLight ? 'text-[#C8956C]' : 'text-[#C8956C]', subLabel: 'VIEW BALANCE' },
        { id: 'transactions', icon: History, label: 'Transaction History', path: '/app/transactions', color: isLight ? 'text-indigo-600' : 'text-indigo-400', subLabel: 'VIEW HISTORY' },
        { id: 'reviews', icon: Star, label: 'My Reviews', path: '/app/reviews', color: isLight ? 'text-amber-500' : 'text-amber-400', subLabel: 'VIEW REVIEWS' },
        { id: 'referrals', icon: Users, label: 'Refer Friends', path: '/app/referrals', color: isLight ? 'text-emerald-600' : 'text-emerald-400', subLabel: 'VIEW REFERRALS' },
    ];

    const [redeemSuccess, setRedeemSuccess] = useState(false);

    const handleRedeem = async (pts) => {
        try {
            const res = await api.post('/loyalty/redeem', { points: pts });
            if (res.data?.success) {
                setRedeemSuccess(true);
                // Update customer state locally
                if (updateCustomer) {
                    updateCustomer({
                        loyaltyPoints: res.data.loyaltyPoints,
                        walletBalance: res.data.walletBalance
                    });
                }
                // Refresh records via Profile API
                refreshProfile();
                setTimeout(() => setRedeemSuccess(false), 4000);
            }
        } catch (err) {
            console.error('Redemption failed:', err);
            // Optional: toast error
        }
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
    const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" style={{ background: colors.bg, minHeight: '100svh' }} className="px-4 pb-32">
            
            <AnimatePresence>
                {redeemSuccess && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-24 left-6 right-6 z-[999] p-5 rounded-3xl flex items-center gap-5 overflow-hidden"
                        style={{ 
                            background: 'rgba(20, 20, 20, 0.9)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(200, 149, 108, 0.3)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 20px rgba(200, 149, 108, 0.1)'
                        }}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-[#C8956C]/20 flex items-center justify-center shrink-0 border border-[#C8956C]/30">
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12 }}
                            >
                                <Zap size={24} className="text-[#C8956C]" fill="#C8956C" />
                            </motion.div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#C8956C] mb-0.5">Points Redeemed</h3>
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-white">Added to your salon wallet</p>
                        </div>
                        <motion.div 
                            className="absolute bottom-0 left-0 h-1 bg-[#C8956C]/40"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 4 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-10 pb-6">
                <motion.span 
                    initial={{ letterSpacing: '0.1em', opacity: 0 }}
                    animate={{ letterSpacing: '0.3em', opacity: 0.4 }}
                    className="text-[10px] font-black uppercase mb-1 block"
                    style={{ color: colors.textMuted }}
                >
                    Premium Membership
                </motion.span>
                <h1 className="text-4xl font-black italic tracking-tighter" style={{ color: colors.text, fontFamily: "'SF Pro Display', sans-serif" }}>
                    My <span className="text-[#C8956C]">Profile</span>
                </h1>
            </div>


            {/* Profile Card */}
            <motion.div 
                variants={fadeUp} 
                style={{ 
                    background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)', 
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
                    marginTop: '12px',
                    boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.02)' : '0 20px 40px rgba(0,0,0,0.2)'
                }} 
                className="rounded-[32px] p-6 relative overflow-hidden"
            >
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C8956C] to-[#A06844] p-[2px] shrink-0 shadow-xl shadow-[#C8956C]/20">
                            <div className="w-full h-full rounded-[22px] bg-white dark:bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                                {uploadingAvatar ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-[#C8956C]" />
                                ) : customer?.avatar ? (
                                    <img src={customer.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-black text-[#C8956C]">{getInitials(customer?.name)}</span>
                                )}
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => avatarInputRef.current.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#C8956C] rounded-full border-4 border-white dark:border-[#1A1A1A] flex items-center justify-center text-white shadow-lg"
                        >
                            <Camera size={14} />
                        </motion.button>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black italic tracking-tight" style={{ color: colors.text }}>{customer?.name || 'Customer'}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest" style={{ color: colors.textMuted }}>{customer?.phone ? `+91 ${customer.phone}` : 'No Phone'}</p>
                        </div>
                        {customer?.email && <p className="text-[11px] font-bold opacity-30 mt-0.5 truncate" style={{ color: colors.textMuted }}>{customer.email}</p>}
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
                        style={{ 
                            background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', 
                            border: `1px solid ${colors.border}` 
                        }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                    >
                        <Edit3 className="w-5 h-5" style={{ color: colors.textMuted }} />
                    </motion.button>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8956C]/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C8956C]/5 rounded-full translate-y-12 -translate-x-12 blur-2xl" />

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
            <motion.div variants={fadeUp} className="mt-10">
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
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar size={12} className="opacity-60" />
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Valid Thru: {formatDate(activeMembership.expiryDate)}</p>
                            </div>

                            {/* Member Privileges / Discounts */}
                            {(activeMembership.planId?.serviceDiscountValue > 0 || activeMembership.planId?.productDiscountValue > 0) && (
                                <div className="flex gap-2 mt-4">
                                    {activeMembership.planId?.serviceDiscountValue > 0 && (
                                        <div className={`px-3 py-2 rounded-xl border border-white/10 ${activeMembership.planId?.id === 'gold' ? 'bg-black/5' : 'bg-white/10'} flex flex-col`}>
                                            <span className="text-[8px] font-black opacity-50 uppercase tracking-tighter">Service Discount</span>
                                            <span className="text-sm font-black">
                                                {activeMembership.planId?.serviceDiscountType === 'percentage' 
                                                    ? `${activeMembership.planId.serviceDiscountValue}%` 
                                                    : `₹${activeMembership.planId.serviceDiscountValue}`}
                                                <span className="text-[9px] opacity-60 ml-0.5">OFF</span>
                                            </span>
                                        </div>
                                    )}
                                    {activeMembership.planId?.productDiscountValue > 0 && (
                                        <div className={`px-3 py-2 rounded-xl border border-white/10 ${activeMembership.planId?.id === 'gold' ? 'bg-black/5' : 'bg-white/10'} flex flex-col`}>
                                            <span className="text-[8px] font-black opacity-50 uppercase tracking-tighter">Product Discount</span>
                                            <span className="text-sm font-black">
                                                {activeMembership.planId?.productDiscountType === 'percentage' 
                                                    ? `${activeMembership.planId.productDiscountValue}%` 
                                                    : `₹${activeMembership.planId.productDiscountValue}`}
                                                <span className="text-[9px] opacity-60 ml-0.5">OFF</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
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
                            background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)',
                            border: `1.5px dashed ${isLight ? '#E5E7EB' : 'rgba(255,255,255,0.1)'}`,
                            backdropFilter: 'blur(10px)',
                            cursor: 'pointer'
                        }}
                        className="rounded-3xl p-8 flex flex-col items-center justify-center group hover:border-[#C8956C] transition-all duration-500"
                    >
                        <motion.div 
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="w-16 h-16 rounded-3xl bg-[#C8956C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C8956C] transition-colors"
                        >
                            <Crown size={32} className="text-[#C8956C] group-hover:text-white transition-colors" />
                        </motion.div>
                        <h4 className="text-lg font-black italic tracking-tight" style={{ color: colors.text }}>Unlock Benefits</h4>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Join our Exclusive Membership</p>
                        <div className="mt-6 flex items-center gap-2 text-[#C8956C]">
                            <span className="text-[10px] font-black uppercase tracking-widest">Explore Plans</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Loyalty Section */}
            <motion.div variants={fadeUp} className="mt-12 space-y-5">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Rewards Balance</h3>
                        <p className="text-[9px] font-bold text-[#C8956C] uppercase tracking-widest mt-0.5">Exclusive Perk Program</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                        <Zap size={14} className="text-[#C8956C]" />
                    </div>
                </div>

                <LoyaltyCard 
                    points={Number(customer?.loyaltyPoints || 0)} 
                    pointsRate={rules.pointsRate} 
                    onRedeem={handleRedeem}
                    minRedeem={rules.minRedeemPoints}
                />

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div 
                        style={{ 
                            background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${colors.border}`,
                            backdropFilter: 'blur(10px)'
                        }} 
                        className="rounded-2xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2 opacity-40">
                            <History size={12} />
                            <p className="text-[8px] font-black uppercase tracking-widest">Exchange Rate</p>
                        </div>
                        <p className="text-lg font-black italic">{rules.pointsRate} <span className="text-[10px] uppercase opacity-40 not-italic ml-1">Pts</span> <span className="mx-1 text-[#C8956C]">→</span> ₹1</p>
                    </div>
                    <div 
                        style={{ 
                            background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${colors.border}`,
                            backdropFilter: 'blur(10px)'
                        }} 
                        className="rounded-2xl p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-2 opacity-40">
                            <Shield size={12} />
                            <p className="text-[8px] font-black uppercase tracking-widest">Threshold</p>
                        </div>
                        <p className="text-lg font-black italic">{rules.minRedeemPoints} <span className="text-[10px] uppercase opacity-40 not-italic ml-1">Pts</span></p>
                    </div>
                </div>
            </motion.div>
            {/* Quick Links */}
            <motion.div variants={fadeUp} className="mt-12 space-y-4">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Quick Navigation</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {quickLinks.map((link, idx) => (
                        <motion.button
                            key={link.label}
                            whileTap={{ scale: 0.98 }}
                            onClick={link.onClick || (() => navigate(link.path))}
                            style={{ 
                                background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)', 
                                border: `1px solid ${colors.border}`,
                                backdropFilter: 'blur(10px)'
                            }}
                            className="w-full flex items-center gap-5 rounded-3xl p-5 hover:bg-[#C8956C]/5 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5 group-hover:bg-[#C8956C]/10 transition-colors`}>
                                <link.icon className={`w-7 h-7 ${link.color} group-hover:scale-110 transition-transform`} />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="text-sm font-black italic tracking-tight block" style={{ color: colors.text }}>{link.label}</span>
                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{link.subLabel || 'View Details'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </motion.button>
                    ))}
                </div>
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

                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#C8956C] uppercase tracking-[0.2em] ml-2">Your Name</label>
                                        <div
                                            style={{
                                                background: colors.input,
                                                borderRadius: '20px 6px 20px 6px',
                                                border: focusedField === 'revName' ? `1.5px solid #C8956C` : `1.5px solid ${colors.border}`,
                                                padding: '0 16px',
                                                height: '52px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <input
                                                onFocus={() => setFocusedField('revName')}
                                                onBlur={() => setFocusedField(null)}
                                                value={review.name || customer?.name || ''}
                                                onChange={(e) => setReview({ ...review, name: e.target.value })}
                                                placeholder="Enter your public name..."
                                                disabled={isSubmittingReview}
                                                style={{
                                                    background: 'transparent', border: 'none', outline: 'none', width: '100%',
                                                    color: colors.text, fontSize: '14px', fontWeight: 600
                                                }}
                                            />
                                        </div>
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


            {/* Support & Legal */}
            <motion.div variants={fadeUp} style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-2xl overflow-hidden shadow-sm mt-4">
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
                    className="w-full flex items-center gap-4 p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <Shield className="w-5 h-5 opacity-40" />
                    <span className="text-sm font-bold flex-1 text-left" style={{ color: colors.text }}>Privacy Policy</span>
                    <ChevronRight className="w-4 h-4 opacity-20" />
                </button>
            </motion.div>


            <motion.div variants={fadeUp} className="mt-12 space-y-3">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Management</h3>
                </div>
                
                <div style={{ background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border}`, backdropFilter: 'blur(10px)' }} className="rounded-3xl overflow-hidden shadow-sm">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center gap-5 p-5 hover:bg-red-500/5 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-red-500/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                            <Shield className="w-6 h-6 text-red-500/60 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="text-sm font-black italic tracking-tight block text-red-500/80 group-hover:text-red-500 transition-colors">Privacy & Data</span>
                            <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Delete My Account</p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-10" />
                    </button>

                    <div className="h-[1px] mx-6 bg-black/5 dark:bg-white/5" />

                    {!showLogoutConfirm ? (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-5 p-5 hover:bg-orange-500/5 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                                <LogOut className="w-6 h-6 text-orange-500/60 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <div className="flex-1 text-left">
                                <span className="text-sm font-black italic tracking-tight block text-orange-500/80 group-hover:text-orange-500 transition-colors">Session Security</span>
                                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Secure Log Out</p>
                            </div>
                            <ChevronRight className="w-4 h-4 opacity-10" />
                        </button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 flex gap-2">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                style={{ border: `1.5px solid ${colors.border}`, color: colors.textMuted }}
                                className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={customerLogout}
                                className="flex-1 py-4 rounded-2xl bg-[#C8956C] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#C8956C]/20"
                            >
                                Yes, Log Out
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => !isDeleting && setShowDeleteConfirm(false)} 
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)' }} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            style={{ 
                                background: colors.card, 
                                width: '100%', 
                                maxWidth: '360px', 
                                borderRadius: '40px', 
                                padding: '40px 32px', 
                                position: 'relative', 
                                border: `1px solid ${colors.border}`,
                                boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative">
                                <Shield size={40} className="text-red-500" />
                                <div className="absolute inset-0 border-2 border-red-500/20 rounded-[32px] animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-center mb-3 italic tracking-tight" style={{ color: colors.text }}>Delete Account?</h3>
                            <p className="text-center text-[10px] font-black uppercase tracking-[0.1em] mb-10 leading-relaxed opacity-40">
                                This action is permanent. All your ritual data, points, and wallet balance will be lost forever.
                            </p>
                            <div className="flex flex-col gap-3">
                                <motion.button 
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isDeleting}
                                    onClick={handleDeleteAccount} 
                                    className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-red-600/20"
                                >
                                    {isDeleting ? 'Erasing Data...' : 'Confirm Destruction'}
                                </motion.button>
                                <button 
                                    disabled={isDeleting}
                                    onClick={() => setShowDeleteConfirm(false)} 
                                    className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-black/5 dark:border-white/5" 
                                    style={{ color: colors.text }}
                                >
                                    Go Back
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* App Version */}
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-20 pb-4" style={{ color: colors.text }}>Wapixo v1.0.0</p>

        </motion.div>
    );
}
