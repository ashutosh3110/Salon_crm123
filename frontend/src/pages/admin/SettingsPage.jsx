import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { Camera, Upload, User as UserIcon, FileText, Plus, X, GripVertical, ChevronUp, ChevronDown, Share2, Copy, ExternalLink, Link as LinkIcon, Download, MapPin, ClipboardList, UserCheck, CalendarDays, MessageSquare, QrCode, ArrowRight, Info, Pencil, Trash2, Save, Eye, Lightbulb, ShieldCheck, CheckCircle2, Lock, Headset, Building2, Gift, Check, Mail, Phone } from 'lucide-react';
import PasswordField from '../../components/common/PasswordField';
import { getImageUrl } from '../../utils/imageUtils';
import { useRef } from 'react';
import api from '../../services/api';

const VALID_SECTIONS = ['profile', 'notifications', 'security', 'business', 'terms', 'booking-link'];

const DEFAULT_NOTIFICATIONS = {
    bookingConfirmations: true,
    paymentAlerts: true,
    lowStockWarnings: true,
    dailySummary: false,
    marketingUpdates: false,
};

const NOTIFICATION_ITEMS = [
    { key: 'bookingConfirmations', title: 'Booking Confirmations', desc: 'Send a message when a new booking is created.' },
    { key: 'paymentAlerts', title: 'Payment Alerts', desc: 'Notify when a bill is paid or refunded.' },
    { key: 'lowStockWarnings', title: 'Low Stock Warnings', desc: 'Alert when products reach low stock.' },
    { key: 'dailySummary', title: 'Daily Summary Report', desc: 'Email a short end-of-day summary.' },
    { key: 'marketingUpdates', title: 'Marketing Updates', desc: 'Product news and marketing tips from us.' },
];

export default function SettingsPage({ section: propSection }) {
    const { section: urlSection } = useParams();
    const section = propSection || urlSection;
    const navigate = useNavigate();
    const { user, updateProfile, changePassword, refreshUser } = useAuth();
    const { salon, salonLoading, updateSalon, fetchSalon } = useBusiness();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const activeTab = VALID_SECTIONS.includes(section) ? section : 'profile';

    useEffect(() => {
        if (section && !VALID_SECTIONS.includes(section)) {
            navigate('/admin/settings/profile', { replace: true });
        }
    }, [section, navigate]);

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        refreshUser?.().catch(console.error);
    }, [refreshUser]);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [fiscal, setFiscal] = useState({
        businessName: '',
        gstin: '',
        state: '',
        stateCode: '',
        serviceGst: 18,
        productGst: 12,
        inclusiveTax: true,
        birthdayPoints: 50,
        anniversaryPoints: 100,
    });

    /* Referral settings removed - managed globally by Super Admin */


    const [notifications, setNotifications] = useState({ ...DEFAULT_NOTIFICATIONS });
    const [termsList, setTermsList] = useState([]);
    const [newTerm, setNewTerm] = useState('');

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (salon) {
            setFiscal({
                businessName: salon.name || '',
                gstin: salon.gstNumber || '',
                state: salon.settings?.state || 'Uttar Pradesh',
                stateCode: salon.settings?.stateCode || '09',
                serviceGst: salon.settings?.serviceGst ?? 18,
                productGst: salon.settings?.productGst ?? 12,
                inclusiveTax: salon.settings?.inclusiveTax !== undefined ? salon.settings.inclusiveTax : true,
                birthdayPoints: salon.loyaltySetting?.birthdayPoints ?? 50,
                anniversaryPoints: salon.loyaltySetting?.anniversaryPoints ?? 100,
            });

            /* Loyalty settings removed - managed globally by Super Admin */

            const n = salon.settings?.notifications;
            if (n && typeof n === 'object') {
                setNotifications({
                    bookingConfirmations: n.bookingConfirmations !== false,
                    paymentAlerts: n.paymentAlerts !== false,
                    lowStockWarnings: n.lowStockWarnings !== false,
                    dailySummary: !!n.dailySummary,
                    marketingUpdates: !!n.marketingUpdates,
                });
            } else {
                setNotifications({ ...DEFAULT_NOTIFICATIONS });
            }

            // Load terms & conditions
            setTermsList(Array.isArray(salon.termsAndConditions) ? [...salon.termsAndConditions] : []);
        }
    }, [salon]);


    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                name: profileForm.name.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
                avatar: user?.avatar // Preserve existing avatar unless changed via separate upload
            });
            toast.success('Profile updated successfully.');
        } catch (error) {
            toast.error(error?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const newAvatar = res.data.url;
                await updateProfile({
                    ...profileForm,
                    avatar: newAvatar
                });
                toast.success('Profile picture updated!');
                await refreshUser?.();
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New password and confirmation do not match.');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters.');
            return;
        }
        setIsSaving(true);
        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password updated successfully.');
        } catch (error) {
            toast.error(error?.message || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFiscalSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                name: fiscal.businessName.trim(),
                gstNumber: fiscal.gstin.trim() || undefined,
                settings: {
                    ...salon?.settings, // Preserve existing settings
                    inclusiveTax: !!fiscal.inclusiveTax,
                },
                loyaltySetting: {
                    ...salon?.loyaltySetting,
                    birthdayPoints: Number(fiscal.birthdayPoints) || 0,
                    anniversaryPoints: Number(fiscal.anniversaryPoints) || 0,
                }
            };
            await updateSalon(payload);
            await fetchSalon?.();
            toast.success('Business & tax settings updated successfully.');
        } catch (error) {
            toast.error(error?.message || 'Failed to update business settings');
        } finally {
            setIsSaving(false);
        }
    };


    const handleNotificationsSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSalon({
                settings: {
                    notifications: { ...notifications },
                },
            });
            await fetchSalon?.();
            toast.success('Notification preferences saved.');
        } catch (error) {
            toast.error(error?.message || 'Failed to save notifications');
        } finally {
            setIsSaving(false);
        }
    };

    /* handleReferralSubmit removed - managed globally by Super Admin */

    const handleAddTerm = () => {
        const trimmed = newTerm.trim();
        if (!trimmed) return toast.error('Please type a term before adding.');
        if (termsList.includes(trimmed)) return toast.error('This term already exists.');
        setTermsList([...termsList, trimmed]);
        setNewTerm('');
    };

    const handleRemoveTerm = (idx) => {
        setTermsList(termsList.filter((_, i) => i !== idx));
    };

    const handleMoveTerm = (idx, dir) => {
        const newList = [...termsList];
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= newList.length) return;
        [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
        setTermsList(newList);
    };

    const handleTermsSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSalon({ termsAndConditions: termsList });
            await fetchSalon?.();
            toast.success('Terms & Conditions saved successfully.');
        } catch (error) {
            toast.error(error?.message || 'Failed to save terms & conditions');
        } finally {
            setIsSaving(false);
        }
    };


    const tabClass = (id) =>
        `px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center ${activeTab === id
            ? '!bg-[#B4912B] !border-[#B4912B] text-white shadow-[0_4px_6px_-1px_rgba(180,145,43,0.2)]'
            : 'bg-surface text-text-muted border-border hover:border-[#B4912B]/40 dark:hover:border-[#B4912B]/40'
        }`;

    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-xl font-bold text-text tracking-tight">Settings</h1>
                <p className="text-xs font-medium text-text-muted mt-0.5">
                    Profile, business & tax, notifications, and security — synced with your salon account.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'profile', label: 'Profile' },
                    { id: 'business', label: 'Business Info' },
                    { id: 'security', label: 'Security' },
                    { id: 'terms', label: 'Terms & Conditions' },
                    { id: 'booking-link', label: 'Booking Link' },
                ].map((t) => (
                    <Link 
                        key={t.id} 
                        to={`/admin/settings/${t.id}`} 
                        className={tabClass(t.id)}
                    >
                        {t.id === 'booking-link' && <LinkIcon className="w-3.5 h-3.5 mr-1.5" />}
                        {t.label}
                    </Link>
                ))}
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm transition-all">
                <div className="p-4">
                    {activeTab === 'profile' && (
                        <div className="text-left flex flex-col">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4 pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FFF9F0] flex items-center justify-center shrink-0">
                                        <Camera className="w-6 h-6 text-[#D99A29]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Profile</h2>
                                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                                            Your login identity (saved on the server).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF3] border border-[#D1FADF] rounded-xl text-[#027A48]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">Profile is up to date</span>
                                </div>
                            </div>

                            {/* Profile Picture & Badges */}
                            <div className="py-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-8 mb-8">
                                <div className="relative">
                                    <div
                                        onClick={handleAvatarClick}
                                        className={`w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden cursor-pointer relative group ${isUploading ? 'opacity-50' : ''}`}
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={getImageUrl(user.avatar)}
                                                alt={user.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <Camera className="w-6 h-6 mb-1" />
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                                <div className="w-6 h-6 border-2 border-[#D99A29]/20 border-t-[#D99A29] rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Overlay Camera Button */}
                                    <button
                                        onClick={handleAvatarClick}
                                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-gray-600" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>

                                <div className="flex flex-col justify-center h-20">
                                    <h3 className="font-bold text-xl text-gray-900 leading-tight tracking-tight mb-2">{user?.name || '—'}</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-3 py-1 bg-[#FFF9F0] rounded-xl text-[10px] font-bold text-[#D99A29] uppercase tracking-widest flex items-center justify-center">
                                            {user?.role || 'ADMIN'}
                                        </div>
                                        <div className="px-3 py-1 bg-white border border-gray-200 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                            <Mail className="w-3 h-3 text-gray-400" />
                                            {user?.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="flex flex-col">
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                Full Name
                                            </label>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                                    <UserIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                className="w-full !pl-11 pr-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                Email
                                            </label>
                                            <Info className="w-3 h-3 text-gray-400" />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                                                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                    <Mail className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                                                </div>
                                            </div>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                className="w-full !pl-11 pr-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                            Phone
                                        </label>
                                        <Info className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                                            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-green-700 dark:text-green-400" />
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="w-full !pl-11 pr-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                {/* Footer Tip and Submit */}
                                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="bg-[#FFF9F0] dark:bg-orange-900/10 border border-orange-50 dark:border-orange-500/20 rounded-xl p-5 flex items-start gap-4 shadow-sm w-full sm:w-auto flex-1">
                                        <div className="mt-0.5 shrink-0">
                                            <Lightbulb className="w-5 h-5 text-[#D99A29]" />
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-gray-900 dark:text-orange-100/90">Keep your profile information updated</h4>
                                            <p className="text-[12px] text-gray-600 dark:text-orange-100/70 mt-0.5 font-medium">
                                                This information is used for account recovery, notifications, and important communication.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-[#D99A29] hover:bg-[#c88d25] text-white rounded-lg font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'SAVING…' : 'SAVE PROFILE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-4 text-left">
                            <div>
                                <h2 className="text-sm font-bold text-text tracking-tight">Notifications</h2>
                                <p className="text-[10px] text-text-muted font-medium mt-0.5">
                                    Preferences are stored for your salon (tenant). Toggle and save.
                                </p>
                            </div>

                            <form onSubmit={handleNotificationsSave} className="space-y-4">
                                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                                    {NOTIFICATION_ITEMS.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-alt/20 transition-colors"
                                        >
                                            <div className="space-y-1 text-left pr-4">
                                                <span className="text-sm font-bold text-text tracking-wide block">{item.title}</span>
                                                <p className="text-xs font-medium text-text-muted">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer group shrink-0">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={!!notifications[item.key]}
                                                    onChange={(e) =>
                                                        setNotifications((prev) => ({ ...prev, [item.key]: e.target.checked }))
                                                    }
                                                />
                                                <div className="w-10 h-5 bg-border rounded-xl peer-checked:bg-primary transition-all duration-300 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-xl after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm peer-checked:after:bg-white group-hover:after:scale-110" />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving || salonLoading}
                                        className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving…' : 'Save notification preferences'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="text-left flex flex-col">
                            {/* Main Card Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4 pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#F6F4FF] flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-[#7F56D9]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Security</h2>
                                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                                            Keep your account secure by using a strong password.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF3] border border-[#D1FADF] rounded-xl text-[#027A48]">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-xs font-bold">Your account is secure</span>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="flex flex-col">
                                <div className="py-6 space-y-8">
                                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                                        {/* Row 1, Col 1: Best Practices */}
                                        <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl h-full">
                                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                            <p className="text-[13px] leading-relaxed text-gray-600 dark:text-slate-300">
                                                <span className="font-bold text-gray-900 dark:text-slate-100">Password best practices</span> Use at least 8 characters with a mix of letters, numbers, and symbols.
                                            </p>
                                        </div>

                                        {/* Row 1-2, Col 2: Password Strength */}
                                        <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm shadow-green-900/5 md:row-span-2 flex flex-col justify-center">
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3">
                                                    <ShieldCheck className="w-5 h-5 text-[#12B76A]" />
                                                    <span className="text-[13px] font-bold text-gray-700">
                                                        Password strength <span className="text-[#12B76A]">Strong</span>
                                                    </span>
                                                </div>
                                                <div className="flex gap-1.5 h-1.5">
                                                    <div className="flex-1 bg-[#12B76A] rounded-xl"></div>
                                                    <div className="flex-1 bg-[#12B76A] rounded-xl"></div>
                                                    <div className="flex-1 bg-[#12B76A] rounded-xl"></div>
                                                    <div className="flex-1 bg-[#12B76A] opacity-30 rounded-xl"></div>
                                                </div>
                                                <div className="space-y-2 mt-2">
                                                    {[
                                                        'At least 8 characters',
                                                        'Contains uppercase & lowercase letters',
                                                        'Contains a number',
                                                        'Contains a special character'
                                                    ].map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-[#12B76A] fill-[#12B76A]/20" />
                                                            <span className="text-xs font-medium text-gray-600">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2, Col 1: Current Password */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                CURRENT PASSWORD
                                            </label>
                                            <PasswordField
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="••••••••"
                                                required
                                                inputClassName="w-full px-4 py-3 rounded-xl allow-curve border border-gray-200 text-sm font-medium text-gray-900 focus:border-primary outline-none transition-all bg-white shadow-sm"
                                                buttonClassName="text-gray-400 hover:text-gray-600 pr-3"
                                            />
                                            <p className="text-[11px] text-gray-500 font-medium pt-1">Enter your current password</p>
                                        </div>

                                        {/* Row 3, Col 1: New Password */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                NEW PASSWORD
                                            </label>
                                            <PasswordField
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                                inputClassName="w-full px-4 py-3 rounded-xl allow-curve border border-gray-200 text-sm font-medium text-gray-900 focus:border-primary outline-none transition-all bg-white shadow-sm"
                                                buttonClassName="text-gray-400 hover:text-gray-600 pr-3"
                                            />
                                            <p className="text-[11px] text-gray-500 font-medium pt-1">Enter your new password</p>
                                        </div>

                                        {/* Row 3, Col 2: Confirm New Password */}
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                CONFIRM NEW PASSWORD
                                            </label>
                                            <PasswordField
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                                required
                                                inputClassName="w-full px-4 py-3 rounded-xl allow-curve border border-gray-200 text-sm font-medium text-gray-900 focus:border-primary outline-none transition-all bg-white shadow-sm"
                                                buttonClassName="text-gray-400 hover:text-gray-600 pr-3"
                                            />
                                            <p className="text-[11px] text-gray-500 font-medium pt-1">Re-enter your new password</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tip Banner and Submit Button */}
                                <div className="bg-[#FFF9F0] dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="w-5 h-5 text-orange-400 shrink-0" />
                                        <p className="text-[13px] text-gray-700 dark:text-orange-100/90">
                                            <span className="font-bold">Tip:</span> Avoid using easily guessable information like your name, phone number, or birthdate.
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-[#D99A29] dark:bg-[#D99A29] hover:bg-[#c88d25] dark:hover:bg-[#c88d25] text-white dark:text-white rounded-lg font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        {isSaving ? 'UPDATING…' : 'UPDATE PASSWORD'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="text-left flex flex-col">
                            {/* Main Card Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4 pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FFF9F0] flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-[#D99A29]" />
                                    </div>
                                    <div>
                                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Business & Tax Information</h2>
                                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">
                                            Legal name, GST, and defaults — stored on your salon record ( PATCH /tenants/me ).
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ECFDF3] border border-[#D1FADF] rounded-xl text-[#027A48]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">Synced with your account</span>
                                </div>
                            </div>

                            <form onSubmit={handleFiscalSubmit} className="flex flex-col">
                                <div className="py-5 flex flex-col md:flex-row gap-6">
                                    {/* Left Column */}
                                    <div className="flex-1 space-y-6">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                        LEGAL BUSINESS NAME
                                                    </label>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={fiscal.businessName}
                                                    onChange={(e) => setFiscal({ ...fiscal, businessName: e.target.value })}
                                                    placeholder="WAPIXO"
                                                    className="w-full px-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm uppercase"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                        GSTIN NUMBER
                                                    </label>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    maxLength={15}
                                                    value={fiscal.gstin}
                                                    onChange={(e) => setFiscal({ ...fiscal, gstin: e.target.value.toUpperCase() })}
                                                    placeholder="8979"
                                                    className="w-full px-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                        BIRTHDAY GIFT (LOYALTY POINTS)
                                                    </label>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                                                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                            <Gift className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={fiscal.birthdayPoints}
                                                        onChange={(e) => setFiscal({ ...fiscal, birthdayPoints: e.target.value })}
                                                        className="w-full !pl-11 pr-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                                    />
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-medium pt-1">Points sent to customer on birthday</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest block">
                                                        ANNIVERSARY GIFT (LOYALTY POINTS)
                                                    </label>
                                                    <Info className="w-3 h-3 text-gray-400" />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                                                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                            <Gift className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={fiscal.anniversaryPoints}
                                                        onChange={(e) => setFiscal({ ...fiscal, anniversaryPoints: e.target.value })}
                                                        className="w-full !pl-11 pr-4 py-2.5 rounded-xl allow-curve border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-900 dark:text-slate-100 focus:border-primary outline-none transition-all bg-white dark:bg-slate-800 shadow-sm"
                                                    />
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-medium pt-1">Points sent to customer on anniversary</p>
                                            </div>
                                        </div>

                                        {/* Tip Banner */}
                                        <div className="bg-[#FFF9F0] dark:bg-orange-900/10 rounded-xl p-4 flex items-start gap-3 shadow-sm border border-orange-50 dark:border-orange-500/20">
                                            <div className="mt-0.5 shrink-0">
                                                <Info className="w-5 h-5 text-[#D99A29]" />
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-orange-100/90">About loyalty points</h4>
                                                <p className="text-[12px] text-gray-600 dark:text-orange-200/70 mt-0.5 font-medium">
                                                    These points will be automatically added to the customer's wallet on their special day.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Information */}
                                    <div className="w-full md:w-[320px] shrink-0">
                                        <div className="bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700 rounded-xl p-5 shadow-sm h-full">
                                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 mb-5 tracking-tight">Information</h3>

                                            <div className="space-y-5">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-transparent border-[1.5px] border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                                                        <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[12px] font-bold text-gray-900 dark:text-slate-200">Legal name</h4>
                                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">Used on invoices and receipts.</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-transparent border-[1.5px] border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                                                        <Gift className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[12px] font-bold text-gray-900 dark:text-slate-200">GSTIN</h4>
                                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">Used for tax calculation and compliance.</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-transparent border-[1.5px] border-blue-200 dark:border-blue-500/30 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[12px] font-bold text-gray-900 dark:text-slate-200">Loyalty points</h4>
                                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">Awarded automatically on special days.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer (Checkbox and Save button) */}
                                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                            <input
                                                type="checkbox"
                                                id="inclusive"
                                                checked={fiscal.inclusiveTax}
                                                onChange={(e) => setFiscal({ ...fiscal, inclusiveTax: e.target.checked })}
                                                className="peer appearance-none w-5 h-5 rounded border border-[#D99A29] bg-white checked:bg-[#D99A29] checked:border-[#D99A29] cursor-pointer transition-all"
                                            />
                                            <Check className="w-3.5 h-3.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <div>
                                            <label htmlFor="inclusive" className="text-[13px] font-bold text-gray-900 dark:text-slate-100 cursor-pointer select-none">
                                                Prices are inclusive of tax
                                            </label>
                                            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                                                All prices and loyalty points are calculated including applicable taxes.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving || salonLoading}
                                        className="px-6 py-3 !bg-[#D99A29] hover:!bg-[#c88d25] !text-white !border-0 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? 'SAVING…' : 'SAVE BUSINESS INFO'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="space-y-6 text-left">
                            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
                                {/* Header */}
                                <div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">Terms & Conditions</h2>
                                            <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                                                These terms will be printed at the bottom of your invoices / bills.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Add New Term */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest block">
                                        Add a new term or condition
                                    </label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newTerm}
                                            onChange={(e) => setNewTerm(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTerm(); } }}
                                            placeholder="e.g. No refund after 24 hours of service."
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl allow-curve text-[13px] font-medium text-gray-800 bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTerm}
                                            className="px-6 py-3 bg-primary text-white rounded-md font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                </div>

                                {/* Terms Ordered List */}
                                {termsList.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                                        <FileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm font-bold text-gray-400">No terms added yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Add terms above — they'll appear as a numbered list on your bills.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleTermsSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            {termsList.map((term, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 last:border-0 group"
                                                >
                                                    {/* Grip / Number */}
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                                        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-[11px] font-black flex items-center justify-center">
                                                            {idx + 1}
                                                        </span>
                                                    </div>

                                                    {/* Term Text (editable) */}
                                                    <input
                                                        type="text"
                                                        value={term}
                                                        onChange={(e) => {
                                                            const updated = [...termsList];
                                                            updated[idx] = e.target.value;
                                                            setTermsList(updated);
                                                        }}
                                                        className="flex-1 text-[13px] font-semibold text-gray-800 bg-transparent outline-none py-1 focus:border-b focus:border-amber-500/30 transition-all"
                                                    />

                                                    {/* Reorder & Delete */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 transition-all shadow-sm"
                                                            title="Edit term"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTerm(idx)}
                                                            className="p-2 border border-rose-100 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all shadow-sm"
                                                            title="Remove term"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <Info className="w-4 h-4" />
                                                <p className="text-[12px] font-semibold">
                                                    {termsList.length} terms — will appear as an ordered list on invoices.
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="px-6 py-3 w-full sm:w-auto bg-amber-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-widest hover:bg-amber-700 transition-all text-center flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSaving ? 'Saving…' : 'Save Terms & Conditions'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Preview Card */}
                            {termsList.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden mt-6">
                                    <div className="bg-[#fdfaf5] dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
                                        <h3 className="text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">
                                            Invoice Preview
                                        </h3>
                                        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                            <Eye className="w-3.5 h-3.5" /> Preview on Invoice
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <h4 className="text-[11px] font-black text-gray-800 dark:text-slate-200 uppercase tracking-widest mb-3">
                                                    Terms & Conditions (Preview)
                                                </h4>
                                                <ol className="list-decimal list-inside space-y-2">
                                                    {termsList.map((t, i) => (
                                                        <li key={i} className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">{t}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Banner */}
                            <div className="bg-[#f5f8ff] dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm mt-6">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 mb-1">
                                        Display professional terms and conditions on every invoice.
                                    </h3>
                                    <p className="text-[12px] font-medium text-gray-500 dark:text-slate-400">
                                        Build trust and avoid misunderstandings with clear policies.
                                    </p>
                                </div>
                                <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-[11px] hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm mt-2 sm:mt-0">
                                    Learn more <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'booking-link' && (
                        <div className="space-y-5 text-left">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                        <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-[14px] font-bold text-gray-900 tracking-tight">Online Appointment Booking Page</h2>
                                        <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                                            Share your dedicated online self-service booking link. Copy and share it so customers can book directly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Link Copy Field */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest block">
                                    Your Dedicated Booking Link
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/app/booking?tenantId=${salon?._id || ''}`}
                                        className="flex-1 px-4 py-2.5 text-[13px] font-medium text-text bg-surface border border-border rounded-xl allow-curve outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all select-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const link = `${window.location.origin}/app/booking?tenantId=${salon?._id || ''}`;
                                            navigator.clipboard.writeText(link);
                                            toast.success('Booking link copied to clipboard!');
                                        }}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 rounded-xl shadow-sm"
                                    >
                                        <Copy className="w-4 h-4" /> Copy Link
                                    </button>
                                </div>
                            </div>

                            {/* QR Code and Share Information */}
                            <div className="grid md:grid-cols-2 gap-5 mt-3">
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-sm">
                                    <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">
                                        Scan or Download QR Code
                                    </h3>
                                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                                `${window.location.origin}/app/booking?tenantId=${salon?._id || ''}`
                                            )}`}
                                            alt="Salon Booking QR Code"
                                            className="w-28 h-28 object-contain"
                                        />
                                    </div>
                                    <div className="space-y-3 flex flex-col items-center w-full">
                                        <a
                                            href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                                                `${window.location.origin}/app/booking?tenantId=${salon?._id || ''}`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center justify-center gap-1.5 hover:text-amber-500 transition-colors"
                                        >
                                            Open Large QR Code <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <a
                                            href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                                                `${window.location.origin}/app/booking?tenantId=${salon?._id || ''}`
                                            )}`}
                                            download="Booking_QR_Code.png"
                                            className="text-[10px] font-bold text-purple-700 uppercase tracking-widest flex items-center justify-center gap-2 px-5 py-3 border border-purple-200 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors w-full sm:w-auto"
                                        >
                                            <Download className="w-4 h-4" /> Download QR Code
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-5">
                                        How to share with customers?
                                    </h3>
                                    <ul className="space-y-5">
                                        <li className="flex items-start gap-3.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <strong className="text-[12px] text-gray-900 font-bold block mb-0.5">WhatsApp / Instagram Bio</strong>
                                                <span className="text-[11px] text-gray-500 font-medium leading-relaxed block">Paste the link directly into your WhatsApp Business greetings or Instagram page bio.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <strong className="text-[12px] text-gray-900 font-bold block mb-0.5">Printed QR Code</strong>
                                                <span className="text-[11px] text-gray-500 font-medium leading-relaxed block">Print the QR Code and display it at your front desk, waiting area, or salon windows.</span>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3.5">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <strong className="text-[12px] text-gray-900 font-bold block mb-0.5">SMS & WhatsApp Alerts</strong>
                                                <span className="text-[11px] text-gray-500 font-medium leading-relaxed block">Include the link in your promotional SMS campaigns or reminder alerts to encourage self-bookings.</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Customer Flow Walkthrough Explanation */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-5">
                                <div className="mb-5">
                                    <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest">
                                        Customer Booking Flow Steps
                                    </h3>
                                    <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                                        Here's the premium experience your customers will see on their mobile devices:
                                    </p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto pb-2">
                                    {[
                                        { step: '01', title: 'Details', desc: 'Name & Phone with quick OTP verification', icon: <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                                        { step: '02', title: 'Outlet', desc: 'Choose Nearby or All branches', icon: <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                                        { step: '03', title: 'Services', desc: 'Select required service catalog', icon: <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                                        { step: '04', title: 'Stylist', desc: 'Pick preferred staff expert', icon: <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                                        { step: '05', title: 'Booking', desc: 'Select Date & Time slot, and confirm', icon: <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
                                    ].map((s, i, arr) => (
                                        <div key={s.step} className="flex items-center flex-1 min-w-[130px]">
                                            <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col items-center text-center relative shadow-sm flex-1 min-h-[150px] justify-center w-full">
                                                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-700 dark:text-purple-400">
                                                    {s.step}
                                                </div>
                                                <div className="mb-3 mt-4 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                                                    {s.icon}
                                                </div>
                                                <h4 className="text-[11px] font-bold text-gray-900 mb-1">{s.title}</h4>
                                                <p className="text-[9px] text-gray-500 leading-snug font-medium max-w-[90px]">{s.desc}</p>
                                            </div>
                                            {i < arr.length - 1 && (
                                                <div className="hidden md:flex px-2 text-gray-300 items-center justify-center">
                                                    <div className="w-6 border-t-[1.5px] border-dashed border-gray-400"></div>
                                                    <svg className="w-3.5 h-3.5 text-gray-400 -ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Bottom Banner for Booking Link */}
            {activeTab === 'booking-link' && (
                <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 flex items-center justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden relative">
                    <div className="flex items-center gap-4 py-5 z-10 w-full md:w-2/3">
                        <div className="w-[52px] h-[52px] rounded-2xl bg-[#f0fdf4] dark:bg-green-500/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-[#16a34a] dark:text-green-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h3 className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight mb-1">We're here to help!</h3>
                            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                                Your satisfaction is our priority. Reach out anytime.
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex shrink-0 absolute right-12 bottom-0 top-0 items-center justify-center">
                        <img
                            src="/vectoreimage.png"
                            alt="Support Team"
                            className="h-[80px] w-auto object-contain transform translate-y-2"
                        />
                    </div>
                </div>
            )}

            {/* Bottom Banner for Security */}
            {activeTab === 'security' && (
                <div className="bg-[#F0FDF4] dark:bg-green-900/10 border border-[#bbf7d0] dark:border-green-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#16a34a] dark:bg-green-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 tracking-tight">Your security matters</h3>
                            <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                                We use industry-standard encryption to protect your data and keep your account safe.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:pl-6 sm:border-l border-green-200/60 dark:border-green-500/20 shrink-0">
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 tracking-tight">Need help?</h3>
                            <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium mt-0.5">
                                Reach out to our support team for any security related assistance.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-[#22c55e] dark:border-green-500 text-[#16a34a] dark:text-white rounded-lg font-bold text-xs hover:bg-[#F0FDF4] dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap">
                            <Headset className="w-4 h-4" />
                            <span>Contact Support</span>
                        </button>
                    </div>
                </div>
            )}
            {/* Bottom Banner for Business */}
            {activeTab === 'business' && (
                <div className="bg-[#F0FDF4] dark:bg-green-900/10 border border-[#bbf7d0] dark:border-green-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm w-full mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#16a34a] dark:bg-green-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 tracking-tight">Secure & Compliant</h3>
                            <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                                Your business data is encrypted and protected. We never share your information.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:pl-6 sm:border-l border-green-200/60 dark:border-green-500/20 shrink-0">
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 tracking-tight">Need help?</h3>
                            <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium mt-0.5">
                                Contact support for any queries related to business & tax information.
                            </p>
                        </div>
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-[#22c55e] dark:border-green-500 text-[#16a34a] dark:text-white rounded-lg font-bold text-xs hover:bg-[#F0FDF4] dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap">
                            <Headset className="w-4 h-4" />
                            <span>Contact Support</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Banner for Profile */}
            {activeTab === 'profile' && (
                <div className="bg-[#F0FDF4] dark:bg-green-900/10 border border-[#bbf7d0] dark:border-green-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm w-full mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#16a34a] dark:bg-green-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-slate-100 tracking-tight">Your data is safe with us</h3>
                            <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                                We use industry-standard encryption to protect your personal information.
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0">
                        <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-[#22c55e] dark:border-green-500 text-[#16a34a] dark:text-green-400 rounded-lg font-bold text-xs hover:bg-[#F0FDF4] dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                            Learn about security <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
