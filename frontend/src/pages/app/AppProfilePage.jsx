import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, Info, Star, MessageSquare, Wallet, Heart, Camera,
    Crown, Gem, History, ShoppingBag, Zap, X
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import LoyaltyCard from '../../components/app/LoyaltyCard';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout, refreshProfile } = useCustomerAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { addFeedback, activeOutlet, platformSettings } = useBusiness();
    const [review, setReview] = useState({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
    const avatarInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        accent: '#C8956C'
    };

    const [rules, setRules] = useState({
        pointsRate: 100,
        redeemValue: 1,
        minRedeemPoints: 100,
    });

    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!customer?._id || fetchedRef.current) return;
        fetchedRef.current = true;

        const loadData = async () => {
            try {
                await refreshProfile();
                const res = await api.get('/loyalty/rules');
                const data = res?.data?.data || res?.data || {};
                setRules((prev) => ({
                    ...prev,
                    ...data,
                    pointsRate: Number(data?.pointsRate ?? prev.pointsRate ?? 100),
                    redeemValue: Number(data?.redeemValue ?? prev.redeemValue ?? 1),
                    minRedeemPoints: Number(data?.minRedeemPoints ?? prev.minRedeemPoints ?? 100),
                }));
            } catch (err) {
                console.error('Failed to load profile data', err);
            }
        };

        loadData();
    }, [customer?._id, refreshProfile]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not Set';
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
            await addFeedback({
                customer: review.name || customer?.name || 'Anonymous Customer',
                rating: review.rating,
                comment: review.comment,
                service: review.service,
                staff: review.staff,
            });

            setReviewSubmitted(true);
            setReview({ rating: 5, comment: '', service: 'General', staff: 'Salon Team', name: '' });
            setTimeout(() => {
                setShowReviewModal(false);
                setReviewSubmitted(false);
            }, 2000);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const [redeemSuccess, setRedeemSuccess] = useState(false);

    const handleRedeem = async (pts) => {
        try {
            const res = await api.post('/loyalty/redeem', { points: pts });
            if (res.data?.success) {
                setRedeemSuccess(true);
                refreshProfile();
                setTimeout(() => setRedeemSuccess(false), 4000);
            }
        } catch (err) {
            console.error('Redemption failed:', err);
        }
    };

    const navItems = [
        { id: 'bookings', icon: Calendar, label: 'Bookings', path: '/app/bookings', color: '#3B82F6' },
        { id: 'orders', icon: ShoppingBag, label: 'Orders', path: '/app/orders', color: '#F97316' },
        { id: 'wallet', icon: Wallet, label: 'Wallet', path: '/app/wallet', color: '#C8956C' },
        { id: 'liked', icon: Heart, label: 'Favorites', path: '/app/likes', color: '#F43F5E' },
    ];

    const secondaryLinks = [
        { icon: History, label: 'Transaction History', path: '/app/transactions' },
        { icon: Star, label: 'My Reviews', path: '/app/reviews' },
        { icon: Users, label: 'Refer & Earn', path: '/app/referrals' },
        { icon: Shield, label: 'Privacy Policy', path: '/app/privacy' },
        { icon: Info, label: 'Terms of Service', path: '/app/terms' },
    ];

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="px-4 pb-32">
            
            {/* Header Success Notification */}
            {redeemSuccess && (
                <div 
                    className="fixed top-6 left-6 right-6 z-[100] p-4 rounded-2xl flex items-center gap-4"
                    style={{ 
                        background: 'rgba(20, 20, 20, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(200, 149, 108, 0.3)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}
                >
                    <div className="w-10 h-10 rounded-xl bg-[#C8956C]/20 flex items-center justify-center shrink-0 border border-[#C8956C]/30">
                        <Zap size={20} className="text-[#C8956C]" fill="#C8956C" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#C8956C]">Redeemed!</h3>
                        <p className="text-[9px] font-bold text-white/60 uppercase">Added to wallet</p>
                    </div>
                </div>
            )}

            <div className="pt-12 pb-6">
                <span className="text-[10px] font-black uppercase mb-1 block opacity-40 tracking-[0.2em]" style={{ color: colors.textMuted }}>
                    Account Details
                </span>
                <h1 className="text-4xl font-black italic tracking-tighter" style={{ color: colors.text }}>
                    My <span className="text-[#C8956C]">Profile</span>
                </h1>
            </div>

            {/* Premium Profile Card */}
            <div 
                style={{ 
                    background: isLight ? '#FFFFFF' : 'rgba(30,30,30,0.6)', 
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${colors.border}`,
                    boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.03)' : '0 20px 40px rgba(0,0,0,0.2)'
                }} 
                className="rounded-[32px] p-6 relative overflow-hidden mb-6"
            >
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C8956C] to-[#A06844] p-[2px] shrink-0">
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
                        <button
                            onClick={() => avatarInputRef.current.click()}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#C8956C] rounded-full border-4 border-white dark:border-[#1A1A1A] flex items-center justify-center text-white shadow-lg"
                        >
                            <Camera size={12} />
                        </button>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black italic tracking-tight truncate" style={{ color: colors.text }}>{customer?.name || 'Guest User'}</h2>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1" style={{ color: colors.textMuted }}>{customer?.phone ? `+91 ${customer.phone}` : 'Setup Phone'}</p>
                        <div className="flex gap-2 mt-2">
                            <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Verified</div>
                            {activeMembership && <div className="px-2 py-0.5 rounded-full bg-[#C8956C]/10 border border-[#C8956C]/20 text-[8px] font-black text-[#C8956C] uppercase tracking-tighter">Pro Member</div>}
                        </div>
                    </div>
                    <button
                        onClick={() => setEditing(!editing)}
                        style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}` }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                    >
                        <Edit3 size={18} style={{ color: colors.textMuted }} />
                    </button>
                </div>

                {editing && (
                    <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                            <input 
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                className="w-full h-12 px-4 rounded-2xl text-sm font-bold focus:border-[#C8956C] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Email Address</label>
                            <input 
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                className="w-full h-12 px-4 rounded-2xl text-sm font-bold focus:border-[#C8956C] outline-none transition-colors"
                            />
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-12 bg-[#C8956C] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#C8956C]/20"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update Profile'}
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <div 
                    onClick={() => navigate('/app/wallet')}
                    style={{ background: colors.card, border: `1px solid ${colors.border}` }} 
                    className="p-4 rounded-[24px] flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Wallet</span>
                    <span className="text-sm font-black italic tracking-tighter">₹{balance}</span>
                </div>
                <div 
                    onClick={() => navigate('/app/profile')}
                    style={{ background: colors.card, border: `1px solid ${colors.border}` }} 
                    className="p-4 rounded-[24px] flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Points</span>
                    <span className="text-sm font-black italic tracking-tighter" style={{ color: colors.accent }}>{customer?.loyaltyPoints || 0}</span>
                </div>
                <div 
                    onClick={() => navigate('/app/bookings')}
                    style={{ background: colors.card, border: `1px solid ${colors.border}` }} 
                    className="p-4 rounded-[24px] flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Visits</span>
                    <span className="text-sm font-black italic tracking-tighter">History</span>
                </div>
            </div>

            {/* Main Navigation Grid */}
            <div className="grid grid-cols-2 gap-3 mb-10">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                        className="p-5 rounded-[28px] flex flex-col items-start gap-3 hover:bg-[#C8956C]/5 transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon size={20} style={{ color: item.color }} />
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-black italic tracking-tight" style={{ color: colors.text }}>{item.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Membership Card (If active) */}
            {activeMembership ? (
                <div
                    onClick={() => navigate('/app/membership')}
                    style={{
                        background: activeMembership.planId?.gradient || 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                        borderRadius: '28px', padding: '24px', position: 'relative', overflow: 'hidden',
                        color: activeMembership.planId?.id === 'gold' ? '#000' : '#FFF',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                    }}
                    className="mb-10 cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="w-12 h-10 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Crown size={22} className={activeMembership.planId?.id === 'gold' ? 'text-black' : 'text-white'} />
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50">Private</p>
                            <p className="text-xs font-black tracking-[0.1em]">{activeMembership.planId?.name?.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Benefits Active</p>
                            <p className="text-xs font-bold italic">Enjoy specialized member pricing on all services</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-mono font-bold tracking-[0.2em] opacity-40">EXP: {formatDate(activeMembership.expiryDate)}</p>
                            <ChevronRight size={20} className="opacity-40" />
                        </div>
                    </div>
                    <Gem size={120} className="absolute -right-8 -bottom-8 opacity-5 rotate-12 pointer-events-none" />
                </div>
            ) : (
                <div
                    onClick={() => navigate('/app/membership')}
                    style={{ background: colors.card, border: `1.5px dashed ${colors.border}` }}
                    className="p-8 rounded-[32px] flex flex-col items-center text-center mb-10 group cursor-pointer hover:border-[#C8956C] transition-colors"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#C8956C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C8956C] transition-colors">
                        <Crown size={28} className="text-[#C8956C] group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-lg font-black italic tracking-tight" style={{ color: colors.text }}>Join Membership</h4>
                    <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1">Unlock exclusive member benefits</p>
                </div>
            )}

            {/* Loyalty Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Loyalty Rewards</h3>
                    <button onClick={() => setShowHowItWorks(!showHowItWorks)} className="text-[10px] font-black text-[#C8956C] uppercase tracking-widest">How it works</button>
                </div>
                <LoyaltyCard 
                    points={Number(customer?.loyaltyPoints || 0)} 
                    pointsRate={rules.pointsRate} 
                    redeemValue={rules.redeemValue}
                    onRedeem={handleRedeem}
                    minRedeem={rules.minRedeemPoints}
                />
            </div>

            {/* Secondary Navigation */}
            <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[32px] overflow-hidden mb-10">
                {secondaryLinks.map((link, i) => (
                    <button
                        key={i}
                        onClick={() => navigate(link.path)}
                        className={`w-full flex items-center gap-4 p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${i !== secondaryLinks.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center opacity-40">
                            <link.icon size={18} />
                        </div>
                        <span className="flex-1 text-left text-sm font-black italic tracking-tight" style={{ color: colors.text }}>{link.label}</span>
                        <ChevronRight size={16} className="opacity-20" />
                    </button>
                ))}
            </div>

            {/* Support & Account Management */}
            <div className="space-y-3 mb-10">
                <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Salon Support</h3>
                </div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="rounded-[32px] overflow-hidden">
                    <button onClick={() => navigate('/app/help')} className="w-full flex items-center gap-4 p-5 border-b border-black/5 dark:border-white/5 hover:bg-black/5 transition-colors">
                        <HelpCircle size={18} className="opacity-40" />
                        <span className="flex-1 text-left text-sm font-black italic tracking-tight" style={{ color: colors.text }}>Help & Support</span>
                        <ChevronRight size={16} className="opacity-20" />
                    </button>
                    <button onClick={() => setShowReviewModal(true)} className="w-full flex items-center gap-4 p-5 border-b border-black/5 dark:border-white/5 hover:bg-black/5 transition-colors">
                        <MessageSquare size={18} className="opacity-40" />
                        <span className="flex-1 text-left text-sm font-black italic tracking-tight" style={{ color: colors.text }}>Share Feedback</span>
                        <Star size={16} className="text-[#C8956C]" fill="#C8956C" />
                    </button>
                </div>
            </div>

            {/* Management Section */}
            <div className="space-y-4">
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{ border: `1px solid ${colors.border}` }}
                        className="w-full h-16 rounded-[24px] bg-black/5 dark:bg-white/5 flex items-center justify-between px-6 group hover:bg-orange-500/5 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <LogOut size={20} className="text-orange-500 opacity-60" />
                            <span className="text-sm font-black italic tracking-tight" style={{ color: colors.text }}>Logout</span>
                        </div>
                        <ChevronRight size={16} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <div className="p-4 rounded-[28px] bg-orange-500/5 border border-orange-500/20 flex gap-3">
                        <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-black/10 dark:border-white/10" style={{ color: colors.text }}>Cancel</button>
                        <button onClick={customerLogout} className="flex-1 h-12 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">Log Out</button>
                    </div>
                )}

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ 
                        background: isLight ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}
                    className="w-full h-14 rounded-[20px] flex items-center justify-center gap-3 group transition-all active:scale-[0.98]"
                >
                    <Shield size={14} className="text-red-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-red-500">Delete Account</span>
                </button>
            </div>

            {/* Modals - Simplified to be static / conditional for APK performance */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[2000] flex items-end justify-center">
                    <div onClick={() => setShowReviewModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                    <div style={{ background: colors.card }} className="relative w-full max-w-lg rounded-t-[40px] p-8 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text }}>Share Experience</h3>
                            <button onClick={() => setShowReviewModal(false)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"><X size={20} /></button>
                        </div>
                        {reviewSubmitted ? (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                    <Star size={40} className="text-emerald-500" fill="currentColor" />
                                </div>
                                <h3 className="text-2xl font-black italic mb-2" style={{ color: colors.text }}>Feedback Shared!</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Your feedback helps us improve</p>
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div className="flex justify-center gap-3 py-4">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setReview({...review, rating: s})} className="transition-transform active:scale-90">
                                            <Star size={40} fill={s <= review.rating ? colors.accent : 'none'} color={s <= review.rating ? colors.accent : colors.textMuted} strokeWidth={1.5} />
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Your Feedback</label>
                                    <textarea 
                                        value={review.comment}
                                        onChange={(e) => setReview({...review, comment: e.target.value})}
                                        style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                        className="w-full h-32 p-4 rounded-[24px] text-sm font-bold resize-none outline-none focus:border-[#C8956C]"
                                        placeholder="Describe your experience..."
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingReview || !review.comment.trim()}
                                    className="w-full h-16 bg-[#C8956C] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-30 shadow-xl shadow-[#C8956C]/20"
                                >
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
                    <div onClick={() => !isDeleting && setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                    <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="relative w-full max-w-sm rounded-[40px] p-8 pb-10 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <Shield size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter mb-2" style={{ color: colors.text }}>Delete Account?</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-10 leading-relaxed">This will permanently delete your account and all data including points and wallet balance.</p>
                        <div className="space-y-3">
                            <button onClick={handleDeleteAccount} disabled={isDeleting} className="w-full h-14 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20">
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest opacity-40">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-10 mt-12">Wapixo v1.0.4</p>
        </div>
    );
}
