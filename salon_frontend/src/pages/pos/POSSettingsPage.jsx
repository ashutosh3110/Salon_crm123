import React, { useEffect, useState } from 'react';
import {
    User,
    Lock,
    Camera,
    Save,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function POSSettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: string }
    const [profileLoading, setProfileLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        terminalId: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });


    useEffect(() => {
        const loadProfile = async () => {
            try {
                setProfileLoading(true);
                const response = await api.get('/users/me');
                const user = response?.data || {};
                setProfile({
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    terminalId: user?._id ? `POS-${String(user._id).slice(-6).toUpperCase()}` : 'POS-USER',
                });
            } catch (error) {
                console.error('[POSSettings] Failed to load profile:', error);
                setStatus({ type: 'error', msg: 'Unable to load profile details.' });
            } finally {
                setProfileLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        const saveProfile = async () => {
            try {
                setSavingProfile(true);
                await api.patch('/users/me', {
                    name: String(profile.fullName || '').trim(),
                    email: String(profile.email || '').trim(),
                    phone: String(profile.phone || '').trim(),
                });
                setStatus({ type: 'success', msg: 'Profile updated successfully.' });
                setTimeout(() => setStatus(null), 3000);
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to update profile.';
                setStatus({ type: 'error', msg: message });
            } finally {
                setSavingProfile(false);
            }
        };
        saveProfile();
    };


    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const changePassword = async () => {
            if (passwords.new !== passwords.confirm) {
                setStatus({ type: 'error', msg: 'New password and confirm password do not match.' });
                return;
            }
            try {
                setSavingPassword(true);
                await api.post('/users/change-password', {
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                });
                setStatus({ type: 'success', msg: 'Password updated successfully.' });
                setPasswords({ current: '', new: '', confirm: '' });
                setTimeout(() => setStatus(null), 3000);
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to update password.';
                setStatus({ type: 'error', msg: message });
            } finally {
                setSavingPassword(false);
            }
        };
        changePassword();
    };

    return (
        <div className="space-y-8 animate-reveal font-black">
            {/* Header */}
            <div className="flex flex-col text-left">
                <h1 className="text-2xl font-black text-text uppercase tracking-tight leading-none">Terminal Credentials</h1>
                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Managing operator identity & access protocols.</p>
            </div>

            {/* Notification Toast */}
            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'} flex items-center gap-3`}
                >
                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span className="text-[10px] uppercase tracking-widest">{status.msg}</span>
                </motion.div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Aside Navigation */}
                <div className="w-full lg:w-64 space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-4 px-6 py-4 border transition-all ${activeTab === 'profile' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:border-primary/40 hover:text-text'}`}
                    >
                        <User className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em]">Profile Info</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-4 px-6 py-4 border transition-all ${activeTab === 'security' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:border-primary/40 hover:text-text'}`}
                    >
                        <Lock className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em]">Password & Security</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-surface border border-border p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12 blur-2xl" />

                    {activeTab === 'profile' && (
                        <div className="space-y-10 relative z-10 text-left">
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-surface-alt border border-border flex items-center justify-center relative overflow-hidden">
                                        <User className="w-10 h-10 text-text-muted" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text uppercase tracking-tight">{profile.fullName}</h3>
                                    <p className="text-[9px] text-primary uppercase tracking-widest mt-1">Terminal ID: {profile.terminalId}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Full Identity</label>
                                    <input
                                        type="text"
                                        value={profile.fullName}
                                        onChange={e => setProfile({ ...profile, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        disabled={profileLoading || savingProfile}
                                        className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Electronic Mail</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                                        disabled={profileLoading || savingProfile}
                                        className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black focus:border-primary outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Comms Link</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setProfile({ ...profile, phone: val });
                                        }}
                                        disabled={profileLoading || savingProfile}
                                        className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button disabled={profileLoading || savingProfile} type="submit" className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-60">
                                        <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Commit Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-10 relative z-10 text-left">
                            <div className="max-w-md space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-text uppercase tracking-tight">Modify Pass-Key</h3>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em] mt-2 opacity-60">Authorize new encryption key for terminal access.</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Current Protocol Key</label>
                                        <div className="relative">
                                            <input
                                                type={showPass.current ? "text" : "password"}
                                                required
                                                disabled={savingPassword}
                                                value={passwords.current}
                                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black focus:border-primary outline-none transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                            >
                                                {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Target Protocol Key</label>
                                        <div className="relative">
                                            <input
                                                type={showPass.new ? "text" : "password"}
                                                required
                                                disabled={savingPassword}
                                                value={passwords.new}
                                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black focus:border-primary outline-none transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                            >
                                                {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest pl-1">Verify Target Key</label>
                                        <div className="relative">
                                            <input
                                                type={showPass.confirm ? "text" : "password"}
                                                required
                                                disabled={savingPassword}
                                                value={passwords.confirm}
                                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="w-full bg-surface-alt border border-border px-6 py-4 text-xs font-black focus:border-primary outline-none transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                            >
                                                {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button disabled={savingPassword} type="submit" className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary-dark transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60">
                                            <Lock className="w-4 h-4" /> {savingPassword ? 'Updating...' : 'Authorize & Encrypt'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
