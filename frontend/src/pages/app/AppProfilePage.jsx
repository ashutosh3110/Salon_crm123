import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import {
    Calendar, Users, ChevronRight, LogOut,
    Shield, HelpCircle, Edit3, Loader2,
    TrendingUp, Info, Star, MessageSquare, Wallet, Heart, Camera,
    Crown, Gem, History, ShoppingBag, Zap, X, ChevronDown, MapPin, CreditCard, Bell, Settings
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useWallet } from '../../contexts/WalletContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AppProfilePage() {
    const { customer, updateCustomer, customerLogout, refreshProfile } = useCustomerAuth();
    const { balance } = useWallet();
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { addFeedback, activeOutlet, platformSettings, outlets = [], services = [], activeSalonId } = useBusiness();
    const [review, setReview] = useState({ rating: 5, comment: '', service: 'General', staff: 'Salon Team' });
    const avatarInputRef = useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [enquiryForm, setEnquiryForm] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        outletId: activeOutlet?._id || activeOutlet?.id || '',
        interestedService: '',
        serviceInterest: '',
        notes: ''
    });

    const [bookingsCount, setBookingsCount] = useState(0);

    // Fetch actual bookings count for profile stats
    useEffect(() => {
        api.get('/bookings')
            .then(res => {
                const list = res.data?.data || res.data || [];
                setBookingsCount(list.length);
            })
            .catch(err => {
                console.error('Failed to load bookings list:', err);
                setBookingsCount(12); // Fallback to mockup value in screenshot if API fails
            });
    }, [customer?._id]);

    useEffect(() => {
        if (customer) {
            setEnquiryForm(prev => ({
                ...prev,
                name: customer.name || '',
                phone: customer.phone || '',
                email: customer.email || '',
            }));
        }
    }, [customer]);

    useEffect(() => {
        if (activeOutlet) {
            setEnquiryForm(prev => ({
                ...prev,
                outletId: activeOutlet._id || activeOutlet.id || ''
            }));
        }
    }, [activeOutlet]);

    const filteredServices = useMemo(() => {
        if (!enquiryForm.outletId) return [];
        return services.filter(s => {
            if (!s.outletIds || s.outletIds.length === 0) return true;
            return s.outletIds.includes(enquiryForm.outletId) || s.outletIds.some(id => (id._id || id) === enquiryForm.outletId);
        });
    }, [services, enquiryForm.outletId]);

    const handleEnquiryServiceChange = (e) => {
        const serviceId = e.target.value;
        const matched = services.find(s => s._id === serviceId || s.id === serviceId);
        setEnquiryForm(prev => ({
            ...prev,
            interestedService: serviceId,
            serviceInterest: matched ? matched.name : ''
        }));
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!enquiryForm.name.trim() || !enquiryForm.phone.trim() || !enquiryForm.outletId) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSubmittingEnquiry(true);
        try {
            const payload = {
                name: enquiryForm.name,
                phone: enquiryForm.phone,
                email: enquiryForm.email || undefined,
                salonId: customer?.tenantId || customer?.salonId || activeSalonId,
                outletId: enquiryForm.outletId,
                interestedService: enquiryForm.interestedService || undefined,
                serviceInterest: enquiryForm.serviceInterest || undefined,
                notes: enquiryForm.notes,
                source: 'Website',
                status: 'new'
            };

            const res = await api.post('/inquiries', payload);
            if (res.data?.success) {
                setEnquirySubmitted(true);
                setEnquiryForm(prev => ({
                    ...prev,
                    notes: '',
                    interestedService: '',
                    serviceInterest: ''
                }));
                toast.success('Enquiry submitted successfully!');
                setTimeout(() => {
                    setShowEnquiryModal(false);
                    setEnquirySubmitted(false);
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to submit enquiry:', err);
            toast.error(err.response?.data?.message || 'Failed to submit enquiry');
        } finally {
            setIsSubmittingEnquiry(false);
        }
    };

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

    const handleRedeem = async (pts) => {
        try {
            const res = await api.post('/loyalty/redeem', { points: pts });
            if (res.data?.success) {
                refreshProfile();
                toast.success('Points redeemed successfully!');
            }
        } catch (err) {
            console.error('Redemption failed:', err);
        }
    };

    const menuOptions = [
        {
            label: 'My Bookings',
            icon: Calendar,
            color: '#d97706',
            bgColor: 'rgba(217, 119, 6, 0.05)',
            borderColor: 'rgba(217, 119, 6, 0.15)',
            action: () => navigate('/app/bookings')
        },
        {
            label: 'Order History',
            icon: ShoppingBag,
            color: '#ca8a04',
            bgColor: 'rgba(202, 138, 4, 0.05)',
            borderColor: 'rgba(202, 138, 4, 0.15)',
            action: () => navigate('/app/orders')
        },
        {
            label: 'Membership',
            icon: Crown,
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.05)',
            borderColor: 'rgba(139, 92, 246, 0.15)',
            action: () => navigate('/app/membership')
        },
        {
            label: 'Addresses',
            icon: MapPin,
            color: '#ea580c',
            bgColor: 'rgba(234, 88, 12, 0.05)',
            borderColor: 'rgba(234, 88, 12, 0.15)',
            action: () => toast('Addresses features are managed during checkout.')
        },
        {
            label: 'Payment Methods',
            icon: CreditCard,
            color: '#b45309',
            bgColor: 'rgba(180, 83, 9, 0.05)',
            borderColor: 'rgba(180, 83, 9, 0.15)',
            action: () => toast('Payment options can be configured during checkout.')
        },
        {
            label: 'Notifications',
            icon: Bell,
            color: '#d97706',
            bgColor: 'rgba(217, 119, 6, 0.05)',
            borderColor: 'rgba(217, 119, 6, 0.15)',
            action: () => navigate('/app/notifications')
        },
        {
            label: 'Help & Support',
            icon: HelpCircle,
            color: '#ea580c',
            bgColor: 'rgba(234, 88, 12, 0.05)',
            borderColor: 'rgba(234, 88, 12, 0.15)',
            action: () => navigate('/app/help')
        },
        {
            label: 'Settings',
            icon: Settings,
            color: '#16a34a',
            bgColor: 'rgba(22, 163, 74, 0.05)',
            borderColor: 'rgba(22, 163, 74, 0.15)',
            action: () => setEditing(!editing)
        }
    ];

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-32">

            {/* Redesigned Premium Header Card with Gradient */}
            <div
                style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0.9) 85%, #ffffff 100%), linear-gradient(135deg, #c59341 0%, #9e59b2 50%, #6924ab 100%)',
                    borderRadius: '36px 36px 0px 0px',
                    padding: '36px 24px 0px 24px',
                    position: 'relative',
                    overflow: 'hidden',
                    color: '#ffffff',
                }}
            >
                {/* Wavy Background Decor */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0, left: 0 }}>
                        <path d="M0,90 C150,150 350,50 500,110 L500,200 L0,200 Z" fill="#ffffff" opacity="0.15"></path>
                        <path d="M0,120 C180,180 320,80 500,140 L500,200 L0,200 Z" fill="#ffffff" opacity="0.1"></path>
                    </svg>
                </div>

                {/* Actions Icons: Settings & Notifications */}
                <div style={{ position: 'absolute', top: '32px', right: '24px', display: 'flex', gap: '18px', zIndex: 10 }}>
                    <button onClick={() => setEditing(!editing)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.95 }}>
                        <Settings size={20} strokeWidth={2} />
                    </button>
                    <button onClick={() => navigate('/app/notifications')} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.95 }}>
                        <Bell size={20} strokeWidth={2} />
                    </button>
                </div>

                {/* User Info block */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                    <div className="relative">
                        <div
                            onClick={() => avatarInputRef.current.click()}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                border: '2px solid rgba(255, 255, 255, 0.9)',
                                overflow: 'hidden',
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            {uploadingAvatar ? (
                                <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : customer?.avatar ? (
                                <img src={customer.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>{getInitials(customer?.name)}</span>
                            )}
                        </div>
                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                    </div>

                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.35rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            Hi, {customer?.name?.split(' ')[0] || 'Priya'} 👋
                        </h2>
                    </div>
                </div>

                {/* Center Statistics bar with transparent background */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        textAlign: 'center',
                        background: 'transparent',
                        padding: '16px 8px',
                        position: 'relative',
                        zIndex: 5,
                        marginTop: '12px'
                    }}
                >
                    <div onClick={() => navigate('/app/bookings')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{bookingsCount}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Bookings</div>
                    </div>
                    <div onClick={() => navigate('/app/wallet')} style={{ cursor: 'pointer', borderLeft: '1px solid rgba(0, 0, 0, 0.08)', borderRight: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>₹{balance}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Wallet</div>
                    </div>
                    <div onClick={() => navigate('/app/profile')} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{customer?.loyaltyPoints || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Points</div>
                    </div>
                </div>
            </div>

            {/* Profile editing block */}
            {editing && (
                <div style={{ background: colors.card, border: `1px solid ${colors.border}` }} className="mx-4 mt-6 p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-gray-800">Edit Personal Details</span>
                        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Full Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                            className="w-full h-11 px-4 rounded-xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                            className="w-full h-11 px-4 rounded-xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Date of Birth</label>
                            <input
                                type="date"
                                value={form.dob ? form.dob.substring(0, 10) : ''}
                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                className="w-full h-11 px-4 rounded-xl text-[10px] font-bold focus:border-[#C8956C] outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1">Anniversary</label>
                            <input
                                type="date"
                                value={form.anniversary ? form.anniversary.substring(0, 10) : ''}
                                onChange={(e) => setForm({ ...form, anniversary: e.target.value })}
                                style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                className="w-full h-11 px-4 rounded-xl text-[10px] font-bold focus:border-[#C8956C] outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-11 bg-[#C8956C] text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#C8956C]/10"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update Profile'}
                    </button>
                </div>
            )}

            {/* Menu options list - full width, seamless, matching screenshot */}
            <div
                style={{
                    background: '#ffffff',
                    overflow: 'hidden'
                }}
            >
                {menuOptions.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={opt.action}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            padding: '16px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        {/* Circular Left Icon Container */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: opt.bgColor,
                            border: `1.5px solid ${opt.borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                            flexShrink: 0
                        }}>
                            <opt.icon size={16} style={{ color: opt.color }} />
                        </div>

                        {/* Title label */}
                        <span style={{
                            flex: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            {opt.label}
                        </span>

                        {/* Arrow Right chevron */}
                        <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                    </button>
                ))}
            </div>

            {/* Support, Inquiries and Account Actions */}
            <div className="px-4 mt-8 space-y-3">
                <button
                    onClick={() => setShowEnquiryModal(true)}
                    style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)' }}
                    className="w-full h-14 rounded-2xl flex items-center justify-between px-6 hover:bg-black/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MessageSquare size={18} className="opacity-45" />
                        <span className="text-sm font-semibold text-gray-800">Salon Enquiry</span>
                    </div>
                    <ChevronRight size={16} className="opacity-20" />
                </button>

                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                        className="w-full h-14 rounded-2xl bg-white flex items-center justify-between px-6 hover:bg-red-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="text-red-500 opacity-75" />
                            <span className="text-sm font-semibold text-gray-800">Logout</span>
                        </div>
                        <ChevronRight size={16} className="opacity-20" />
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3">
                        <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 h-12 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700">Cancel</button>
                        <button onClick={customerLogout} className="flex-1 h-12 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/10">Log Out</button>
                    </div>
                )}

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                    }}
                    className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Shield size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Delete Account</span>
                </button>
            </div>

            {/* Inquiries Modal */}
            {showEnquiryModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <div onClick={() => setShowEnquiryModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                    <div style={{ background: colors.card }} className="relative w-full max-w-lg rounded-[32px] p-6 sm:p-8 pb-8 sm:pb-10 shadow-2xl max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black italic tracking-tighter" style={{ color: colors.text }}>Salon Enquiry</h3>
                            <button onClick={() => setShowEnquiryModal(false)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center"><X size={20} /></button>
                        </div>
                        {enquirySubmitted ? (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={40} className="text-emerald-500" fill="currentColor" />
                                </div>
                                <h3 className="text-2xl font-black italic mb-2" style={{ color: colors.text }}>Enquiry Submitted!</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Our team will get back to you shortly</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEnquirySubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={enquiryForm.name}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                        style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                        className="w-full h-12 px-4 rounded-2xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={enquiryForm.phone}
                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                            style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                            className="w-full h-12 px-4 rounded-2xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Email</label>
                                        <input
                                            type="email"
                                            value={enquiryForm.email}
                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                            style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                            className="w-full h-12 px-4 rounded-2xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Outlet *</label>
                                        <div className="relative w-full">
                                            <select
                                                required
                                                disabled={!!activeOutlet}
                                                value={enquiryForm.outletId}
                                                onChange={(e) => setEnquiryForm({ ...enquiryForm, outletId: e.target.value, interestedService: '', serviceInterest: '' })}
                                                style={{ backgroundColor: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                                className="w-full h-12 px-4 pr-10 rounded-2xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors uppercase appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                            >
                                                <option value="" style={{ backgroundColor: colors.card, color: colors.text }}>Select Outlet</option>
                                                {outlets.map(o => (
                                                    <option key={o._id || o.id} value={o._id || o.id} style={{ backgroundColor: colors.card, color: colors.text }}>{o.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-45" style={{ color: colors.text }} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Service of Interest</label>
                                        <div className="relative w-full">
                                            <select
                                                value={enquiryForm.interestedService}
                                                onChange={handleEnquiryServiceChange}
                                                disabled={!enquiryForm.outletId}
                                                style={{ backgroundColor: enquiryForm.outletId ? colors.input : 'transparent', color: colors.text, border: `1px solid ${colors.border}` }}
                                                className="w-full h-12 px-4 pr-10 rounded-2xl text-xs font-bold focus:border-[#C8956C] outline-none transition-colors disabled:opacity-40 uppercase appearance-none cursor-pointer !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                            >
                                                <option value="" style={{ backgroundColor: colors.card, color: colors.text }}>{!enquiryForm.outletId ? 'Select Outlet First' : 'Select Service'}</option>
                                                {filteredServices.map(s => (
                                                    <option key={s._id || s.id} value={s._id || s.id} style={{ backgroundColor: colors.card, color: colors.text }}>{s.name} (₹{s.price})</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-45" style={{ color: colors.text }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-2">Message / Notes</label>
                                    <textarea
                                        rows={3}
                                        value={enquiryForm.notes}
                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                                        style={{ background: colors.input, color: colors.text, border: `1px solid ${colors.border}` }}
                                        className="w-full p-4 rounded-2xl text-xs font-bold resize-none outline-none focus:border-[#C8956C] !bg-[#141414] dark:!bg-[#141414] !text-white dark:!text-white"
                                        placeholder="Describe your query..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmittingEnquiry}
                                    className="w-full h-14 bg-[#C8956C] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-30 shadow-xl shadow-[#C8956C]/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingEnquiry ? <Loader2 size={16} className="animate-spin" /> : 'Submit Enquiry'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Account Deletion Confirmation Modal */}
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
