import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { MapPin } from 'lucide-react';

const VALID_SECTIONS = ['profile', 'notifications', 'security', 'business'];

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

export default function SettingsPage() {
    const { section } = useParams();
    const navigate = useNavigate();
    const { user, updateProfile, changePassword } = useAuth();
    const { salon, salonLoading, updateSalon, fetchSalon } = useBusiness();
    const [isSaving, setIsSaving] = useState(false);

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
    });

    const [locationForm, setLocationForm] = useState({ latitude: '', longitude: '' });
    const [notifications, setNotifications] = useState({ ...DEFAULT_NOTIFICATIONS });

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
            });
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
            if (salon.latitude != null && salon.longitude != null) {
                setLocationForm({
                    latitude: String(salon.latitude),
                    longitude: String(salon.longitude),
                });
            }
        }
    }, [salon]);

    const states = useMemo(
        () => [
            { name: 'Maharashtra', code: '27' },
            { name: 'Delhi', code: '07' },
            { name: 'Karnataka', code: '29' },
            { name: 'Tamil Nadu', code: '33' },
            { name: 'Uttar Pradesh', code: '09' },
            { name: 'West Bengal', code: '19' },
            { name: 'Gujarat', code: '24' },
            { name: 'Telangana', code: '36' },
            { name: 'Rajasthan', code: '08' },
        ],
        []
    );

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile({
                name: profileForm.name.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
            });
            alert('Profile updated successfully.');
        } catch (error) {
            alert(error?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New password and confirmation do not match.');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            alert('New password must be at least 8 characters.');
            return;
        }
        setIsSaving(true);
        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            alert('Password updated successfully.');
        } catch (error) {
            alert(error?.message || 'Failed to update password');
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
                    state: fiscal.state,
                    stateCode: fiscal.stateCode,
                    serviceGst: Number(fiscal.serviceGst) || 0,
                    productGst: Number(fiscal.productGst) || 0,
                    inclusiveTax: !!fiscal.inclusiveTax,
                },
            };
            await updateSalon(payload);
            await fetchSalon?.();
            alert('Business & tax settings updated successfully.');
        } catch (error) {
            alert(error?.message || 'Failed to update business settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        const lat = parseFloat(locationForm.latitude);
        const lng = parseFloat(locationForm.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
            return;
        }
        setIsSaving(true);
        try {
            await updateSalon({ latitude: lat, longitude: lng });
            await fetchSalon?.();
            alert('Salon location updated. Customers nearby can find your salon.');
        } catch (error) {
            alert(error?.message || 'Failed to update location');
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
            alert('Notification preferences saved.');
        } catch (error) {
            alert(error?.message || 'Failed to save notifications');
        } finally {
            setIsSaving(false);
        }
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocationForm({
                    latitude: pos.coords.latitude.toFixed(6),
                    longitude: pos.coords.longitude.toFixed(6),
                });
            },
            () => alert('Could not get your location. Please enter manually.'),
            { enableHighAccuracy: true }
        );
    };

    const tabClass = (id) =>
        `px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
            activeTab === id
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                : 'bg-surface text-text-muted border-border hover:border-primary/40'
        }`;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text tracking-tight">Settings</h1>
                <p className="text-sm font-medium text-text-muted mt-1">
                    Profile, business & tax, notifications, and security — synced with your salon account.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'profile', label: 'Profile' },
                    { id: 'business', label: 'Business Info' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'security', label: 'Security' },
                ].map((t) => (
                    <Link key={t.id} to={`/admin/settings/${t.id}`} className={tabClass(t.id)}>
                        {t.label}
                    </Link>
                ))}
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm transition-all">
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Profile</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Your login identity (saved on the server).</p>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-alt/10 border border-border">
                                <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20 shadow-sm relative overflow-hidden group">
                                    <span className="relative z-10">
                                        {user?.name
                                            ?.split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2) || 'U'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-2xl text-text leading-tight tracking-tight">{user?.name || '—'}</h3>
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                        {user?.role || 'ADMIN'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-6 pt-2">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-text-muted pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-text-muted pl-1">Email</label>
                                        <input
                                            type="email"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-semibold text-text-muted pl-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5"
                                        placeholder="+91..."
                                    />
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving…' : 'Save profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Notifications</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">
                                    Preferences are stored for your salon (tenant). Toggle and save.
                                </p>
                            </div>

                            <form onSubmit={handleNotificationsSave} className="space-y-6">
                                <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                                    {NOTIFICATION_ITEMS.map((item) => (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between p-6 bg-surface hover:bg-surface-alt/20 transition-colors"
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
                                                <div className="w-12 h-6 bg-border rounded-none peer-checked:bg-primary transition-all duration-300 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 after:shadow-sm peer-checked:after:bg-white group-hover:after:scale-110" />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving || salonLoading}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving…' : 'Save notification preferences'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Security</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Change your account password.</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating…' : 'Update password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="space-y-10 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Business & Tax Info</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">
                                    Legal name, GST, defaults — stored on your salon record (`PATCH /tenants/me`).
                                </p>
                            </div>

                            <form onSubmit={handleFiscalSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                        Legal Business Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fiscal.businessName}
                                        onChange={(e) => setFiscal({ ...fiscal, businessName: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50 uppercase"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            GSTIN Number
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={15}
                                            value={fiscal.gstin}
                                            onChange={(e) => setFiscal({ ...fiscal, gstin: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            Registration State
                                        </label>
                                        <select
                                            value={fiscal.state}
                                            onChange={(e) => {
                                                const s = states.find((st) => st.name === e.target.value);
                                                if (s) setFiscal({ ...fiscal, state: s.name, stateCode: s.code });
                                            }}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        >
                                            {states.map((s) => (
                                                <option key={s.code} value={s.name}>
                                                    {s.name} ({s.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            Default Service GST (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={fiscal.serviceGst}
                                            onChange={(e) => setFiscal({ ...fiscal, serviceGst: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                            Default Product GST (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={fiscal.productGst}
                                            onChange={(e) => setFiscal({ ...fiscal, productGst: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="inclusive"
                                        checked={fiscal.inclusiveTax}
                                        onChange={(e) => setFiscal({ ...fiscal, inclusiveTax: e.target.checked })}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label htmlFor="inclusive" className="text-xs font-semibold text-text-muted tracking-tight cursor-pointer select-none">
                                        Prices are inclusive of tax
                                    </label>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button
                                        type="submit"
                                        disabled={isSaving || salonLoading}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving…' : 'Save business info'}
                                    </button>
                                </div>
                            </form>

                            <div className="pt-4 border-t border-border">
                                <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" /> Salon location (nearby search)
                                </h3>
                                <p className="text-xs text-text-muted mb-4">
                                    Latitude & longitude are saved on your salon. Used for customer app nearby discovery.
                                </p>
                                <form onSubmit={handleLocationSubmit} className="flex flex-wrap items-end gap-4">
                                    <div className="space-y-1 flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Latitude</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 28.6139"
                                            value={locationForm.latitude}
                                            onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Longitude</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 77.2090"
                                            value={locationForm.longitude}
                                            onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none bg-surface-alt/50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={useMyLocation}
                                        className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-surface-alt/50 transition-colors"
                                    >
                                        Use my location
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                                    >
                                        Save location
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
