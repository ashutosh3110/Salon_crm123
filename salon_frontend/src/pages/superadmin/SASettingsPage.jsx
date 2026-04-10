import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, Lock, Eye, EyeOff, Save,
    CheckCircle, Shield, Edit3, KeyRound, Globe,
    BadgeCheck, AlertCircle, Loader2, DollarSign,
    Info, MapPin, Share2
} from 'lucide-react';
import api from '../../services/api';

/* ─── Section card ─────────────────────────────────────────────────── */
function SectionCard({ title, subtitle, icon: Icon, iconColor = 'bg-primary/10 text-primary', children }) {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
                    <Icon style={{ width: 18, height: 18 }} />
                </div>
                <div>
                    <h3 className="font-bold text-text text-sm">{title}</h3>
                    {subtitle && <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

/* ─── Input field ───────────────────────────────────────────────────── */
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, readOnly, suffix }) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                )}
                <input
                    type={type}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-10' : 'pr-3.5'} py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm ${readOnly ? 'bg-surface cursor-not-allowed text-text-muted' : ''}`}
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SASettingsPage() {
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingPlatform, setSavingPlatform] = useState(false);

    /* Platform Settings */
    const [platform, setPlatform] = useState({
        siteName: '',
        siteTagline: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
        currency: 'INR',
        currencySymbol: '₹'
    });
    const setPlat = (k, v) => setPlatform(p => ({ ...p, [k]: v }));
    const setSocial = (k, v) => setPlatform(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

    /* Profile form */
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
    });
    const setP = (k, v) => setProfile(p => ({ ...p, [k]: v }));

    /* Password form */
    const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
    const setPw = (k, v) => setPwd(p => ({ ...p, [k]: v }));
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showCon, setShowCon] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchSettings()]);
        setLoading(false);
    };

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            if (data.success) setPlatform(data.data);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setProfile({
                name: data.data.name,
                email: data.data.email,
                phone: data.data.phone || '',
                role: data.data.role,
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            showToast('Failed to load profile settings.', 'error');
        }
    };

    /* Validation helpers */
    const pwdStrength = (p) => {
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score; // 0-4
    };
    const strength = pwdStrength(pwd.newPwd);
    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['bg-red-500', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-600'][strength];

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

    const handleSaveProfile = async () => {
        if (!profile.name || !profile.email) return showToast('Name and Email are required.', 'error');
        setSavingProfile(true);
        try {
            await api.patch('/auth/updatedetails', {
                name: profile.name,
                email: profile.email,
                phone: profile.phone
            });
            showToast('Profile updated successfully!');
        } catch (err) {
            console.error('Update failed:', err);
            showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePlatform = async () => {
        setSavingPlatform(true);
        try {
            await api.patch('/settings', platform);
            showToast('Platform settings saved!');
        } catch (err) {
            console.error('Update failed:', err);
            showToast(err.response?.data?.message || 'Failed to update settings.', 'error');
        } finally {
            setSavingPlatform(false);
        }
    };

    const handleChangePassword = async () => {
        if (!pwd.current) return showToast('Enter your current password.', 'error');
        if (pwd.newPwd.length < 8) return showToast('New password must be at least 8 characters.', 'error');
        if (pwd.newPwd !== pwd.confirm) return showToast('New passwords do not match.', 'error');
        
        setSavingPassword(true);
        try {
            await api.put('/auth/updatepassword', {
                currentPassword: pwd.current,
                newPassword: pwd.newPwd
            });
            setPwd({ current: '', newPwd: '', confirm: '' });
            showToast('Password changed successfully!');
        } catch (err) {
            console.error('Password change failed:', err);
            showToast(err.response?.data?.message || 'Password change failed.', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    /* Avatar initials */
    const initials = profile.name ? profile.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'SA';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Authenticating Identity...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.type === 'error'
                        ? <AlertCircle className="w-4 h-4 shrink-0" />
                        : <CheckCircle className="w-4 h-4 shrink-0" />}
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight">Account Settings</h1>
                <p className="text-sm text-text-secondary mt-0.5">Manage your Super Admin profile and security</p>
            </div>

            {/* ── Avatar + Quick Info Banner ── */}
            <div className="bg-gradient-to-r from-primary via-[#A03040] to-[#8B1A2D] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xl shadow-primary/20">
                {/* Avatar circle */}
                <div className="shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {initials}
                    </div>
                </div>
                {/* Info */}
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-black text-white">{profile.name}</h2>
                    <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                        <BadgeCheck className="w-4 h-4 text-white/80" />
                        <span className="text-sm text-white/80 font-medium">{profile.role}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{profile.email}</p>
                </div>
                <div className="sm:ml-auto bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center">
                    <div className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Last Login</div>
                    <div className="text-sm font-bold text-white mt-0.5">Today, 4:12 PM</div>
                </div>
            </div>

            {/* ── Two column layout ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* ── Profile Edit ── */}
                <SectionCard
                    title="Edit Profile"
                    subtitle="Update your personal information"
                    icon={Edit3}
                    iconColor="bg-primary/10 text-primary"
                >
                    <div className="space-y-4">
                        <Field
                            label="Full Name *"
                            icon={User}
                            value={profile.name}
                            onChange={e => setP('name', e.target.value)}
                            placeholder="Your full name"
                        />
                        <Field
                            label="Email Address *"
                            icon={Mail}
                            type="email"
                            value={profile.email}
                            onChange={e => setP('email', e.target.value)}
                            placeholder="admin@wapixo.com"
                        />
                    
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            {savingProfile
                                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                                : <><Save className="w-4 h-4" /> Save Profile</>
                            }
                        </button>
                    </div>
                </SectionCard>

                {/* ── Change Password ── */}
                <SectionCard
                    title="Change Password"
                    subtitle="Keep your account secure with a strong password"
                    icon={KeyRound}
                    iconColor="bg-amber-50 text-amber-600"
                >
                    <div className="space-y-4">
                        {/* Current password */}
                        <Field
                            label="Current Password *"
                            icon={Lock}
                            type={showCur ? 'text' : 'password'}
                            value={pwd.current}
                            onChange={e => setPw('current', e.target.value)}
                            placeholder="Enter current password"
                            suffix={
                                <button type="button" onClick={() => setShowCur(v => !v)} className="text-text-muted hover:text-text transition-colors">
                                    {showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            }
                        />

                        {/* New password */}
                        <div>
                            <Field
                                label="New Password *"
                                icon={Lock}
                                type={showNew ? 'text' : 'password'}
                                value={pwd.newPwd}
                                onChange={e => setPw('newPwd', e.target.value)}
                                placeholder="Min. 8 characters"
                                suffix={
                                    <button type="button" onClick={() => setShowNew(v => !v)} className="text-text-muted hover:text-text transition-colors">
                                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            {/* Strength meter */}
                            {pwd.newPwd && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[0, 1, 2, 3].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : 'bg-slate-100'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold text-text-muted">
                                        Strength: <span className={`${strength >= 3 ? 'text-emerald-600' : strength >= 2 ? 'text-amber-500' : 'text-red-500'}`}>{strengthLabel}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <Field
                                label="Confirm New Password *"
                                icon={Lock}
                                type={showCon ? 'text' : 'password'}
                                value={pwd.confirm}
                                onChange={e => setPw('confirm', e.target.value)}
                                placeholder="Re-enter new password"
                                suffix={
                                    <button type="button" onClick={() => setShowCon(v => !v)} className="text-text-muted hover:text-text transition-colors">
                                        {showCon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                }
                            />
                            {pwd.confirm && pwd.newPwd !== pwd.confirm && (
                                <p className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                                </p>
                            )}
                            {pwd.confirm && pwd.newPwd === pwd.confirm && pwd.confirm.length > 0 && (
                                <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        {/* Password tips */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 space-y-1">
                            <p className="font-bold text-amber-800 mb-1">Password must contain:</p>
                            {[
                                { rule: 'At least 8 characters', met: pwd.newPwd.length >= 8 },
                                { rule: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(pwd.newPwd) },
                                { rule: 'One number (0–9)', met: /[0-9]/.test(pwd.newPwd) },
                                { rule: 'One special character (!@#…)', met: /[^A-Za-z0-9]/.test(pwd.newPwd) },
                            ].map(r => (
                                <div key={r.rule} className="flex items-center gap-1.5">
                                    <CheckCircle className={`w-3 h-3 shrink-0 ${r.met ? 'text-emerald-500' : 'text-amber-300'}`} />
                                    <span className={r.met ? 'text-emerald-700 font-semibold' : ''}>{r.rule}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleChangePassword}
                            disabled={savingPassword || !pwd.current || !pwd.newPwd || !pwd.confirm}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-black/20 active:scale-[0.98]"
                        >
                            {savingPassword
                                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Changing…</>
                                : <><KeyRound className="w-4 h-4" /> Change Password</>
                            }
                        </button>
                    </div>
                </SectionCard>

                {/* ── Platform Configuration ── */}
                <div className="lg:col-span-2">
                    <SectionCard
                        title="Platform Configuration"
                        subtitle="Global settings for the entire application"
                        icon={Globe}
                        iconColor="bg-blue-50 text-blue-600"
                    >
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Site Name" value={platform.siteName} onChange={e => setPlat('siteName', e.target.value)} placeholder="Salon CRM" />
                                <Field label="Support Email" icon={Mail} value={platform.contactEmail} onChange={e => setPlat('contactEmail', e.target.value)} />
                            </div>
                            <Field label="Office Address" icon={MapPin} value={platform.address} onChange={e => setPlat('address', e.target.value)} />
                            
                            <div className="pt-4 border-t border-border">
                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Share2 className="w-3 h-3" /> Social Presence
                                </h4>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <Field label="Instagram" value={platform.socialLinks.instagram} onChange={e => setSocial('instagram', e.target.value)} placeholder="https://..." />
                                    <Field label="Facebook" value={platform.socialLinks.facebook} onChange={e => setSocial('facebook', e.target.value)} placeholder="https://..." />
                                </div>
                            </div>

                            <button
                                onClick={handleSavePlatform}
                                disabled={savingPlatform}
                                className="w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                            >
                                {savingPlatform ? 'Saving...' : 'Update Platform Settings'}
                            </button>
                        </div>
                    </SectionCard>
                </div>
            </div>

        </div>
    );
}
