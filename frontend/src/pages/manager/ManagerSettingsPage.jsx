import { useState } from 'react';
import {
    Settings, Bell, Shield, User,
    Smartphone, Moon, Globe, HelpCircle,
    ChevronRight, LogOut, Lock, Palette,
    ArrowLeft, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordField from '../../components/common/PasswordField';
import { useAuth } from '../../contexts/AuthContext';

const settingsSections = [
    {
        title: 'Account Settings',
        items: [
            { id: 'profile', label: 'Edit Profile', sub: 'Name, email, and photo', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { id: 'security', label: 'Security', sub: 'Password and 2FA', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { id: 'notifications', label: 'Notifications', sub: 'How you want to be alerted', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]
    },
    {
        title: 'Support',
        items: [
            { id: 'help', label: 'Help Center', sub: 'FAQs and support guides', icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { id: 'privacy', label: 'Privacy Policy', sub: 'Data collection and usage', icon: Lock, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ]
    }
];

export default function ManagerSettingsPage() {
    const { user, updateProfile, changePassword, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // Profile form state (pre-filled from real user)
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Password form state
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [pwError, setPwError] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            if (activeTab === 'profile') {
                await updateProfile({ name: profileForm.name, phone: profileForm.phone });
            } else if (activeTab === 'security') {
                if (!pwForm.current || !pwForm.newPw) { setSaveError('Fill all password fields'); setSaving(false); return; }
                if (pwForm.newPw !== pwForm.confirm) { setSaveError('Passwords do not match'); setSaving(false); return; }
                await changePassword(pwForm.current, pwForm.newPw);
                setPwForm({ current: '', newPw: '', confirm: '' });
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            setSaveError(e?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const renderDetailView = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">
                                {(user?.name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-text uppercase">Avatar Selection</h3>
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 hover:underline">Upload New Photo</button>
                            </div>
                        </div>
                        {saveError && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{saveError}</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Full Name</label>
                                <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email Address</label>
                                <input type="email" value={profileForm.email} disabled className="w-full bg-surface-alt border border-border/40 p-3 sm:p-4 text-sm font-bold text-text-muted cursor-not-allowed outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Phone Number</label>
                                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Designation</label>
                                <input type="text" value={user?.role || 'Manager'} disabled className="w-full bg-surface-alt border border-border/40 p-3 sm:p-4 text-sm font-bold text-text-muted cursor-not-allowed outline-none capitalize" />
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3 text-amber-600">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wide">Last password change was 45 days ago. We recommend refreshing it every 90 days for peak security.</p>
                        </div>
                        {saveError && <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{saveError}</p>}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Current Password</label>
                                <PasswordField placeholder="••••••••" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">New Password</label>
                                <PasswordField placeholder="Min. 12 characters" value={pwForm.newPw} onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))} inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Confirm New Password</label>
                                <PasswordField placeholder="Repeat password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border/40">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-text uppercase">Two-Factor Auth</h4>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Add an extra layer of protection</p>
                                </div>
                                <div className="w-12 h-6 bg-border/40 rounded-full relative cursor-pointer hover:bg-emerald-500/20 transition-colors group">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {[
                            { title: 'Daily Revenue Brief', sub: 'Get a summary of sales every morning', on: true },
                            { title: 'Low Stock Alerts', sub: 'Real-time alerts when supplies run low', on: true },
                            { title: 'New Feedback Alerts', sub: 'Immediate ping when a customer rates', on: false },
                            { title: 'Team Attendance', sub: 'Notify when staff checks in late', on: true },
                            { title: 'Security Logs', sub: 'Alerts for logins from new devices', on: true }
                        ].map((pref) => (
                            <div key={pref.title} className="flex items-center justify-between p-4 bg-surface border border-border/40">
                                <div>
                                    <h4 className="text-xs font-black text-text uppercase leading-none">{pref.title}</h4>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1.5">{pref.sub}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${pref.on ? 'bg-emerald-500/10' : 'bg-border/40'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${pref.on ? 'right-1 bg-emerald-500' : 'left-1 bg-text-muted'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-surface-alt border border-border/40 flex items-center justify-center text-text-muted">
                            <HelpCircle className="w-8 h-8 opacity-40" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Section Under Construction</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">This preference module is being optimized</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
            <AnimatePresence mode="wait">
                {!activeTab ? (
                    <motion.div
                        key="main-list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6 sm:space-y-8"
                    >
                        {/* Header */}
                        <div className="text-left">
                            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight uppercase leading-none">Control Center</h1>
                            <p className="text-[10px] sm:text-sm text-text-muted font-medium mt-1.5 uppercase tracking-wide">Manage your personal and application preferences</p>
                        </div>

                        {/* Profile Brief */}
                        <div className="bg-surface border border-border/80 p-5 sm:p-6 text-text flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative overflow-hidden !rounded-[16px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-background border border-border/60 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-sm !rounded-[16px] text-primary">
                                {(user?.name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 text-center sm:text-left relative">
                                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-none uppercase">{user?.name || 'Manager'}</h2>
                                <p className="text-text-muted text-[10px] sm:text-sm mt-1.5 font-bold uppercase tracking-widest capitalize">{user?.role || 'Manager'}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-4">
                                    <div className="bg-surface-alt px-2.5 py-1 border border-border/60 text-text-muted text-[8px] sm:text-[10px] font-black uppercase tracking-widest !rounded-[8px]">{user?.email || 'manager@gmail.com'}</div>
                                    <div className="bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-widest !rounded-[8px]">Active</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className="w-full sm:w-auto relative px-5 py-2.5 bg-primary text-white text-[9px] sm:text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all !rounded-[16px]"
                            >
                                Edit Profile
                            </button>
                        </div>

                        {/* Settings Sections */}
                        <div className="space-y-6">
                            {settingsSections.map((section) => (
                                <div key={section.title} className="space-y-3">
                                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">{section.title}</h2>
                                    <div className="bg-white border border-border/60 overflow-hidden divide-y divide-border/40">
                                        {section.items.map((item) => (
                                            <button 
                                                key={item.id} 
                                                onClick={() => setActiveTab(item.id)}
                                                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-alt transition-colors text-left group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 flex items-center justify-center !rounded-[12px] shrink-0 group-hover:scale-110 transition-transform ${item.bg}`}>
                                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text mb-0.5">{item.label}</p>
                                                        <p className="text-[11px] text-text-muted font-medium">{item.sub}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Global Actions */}
                        <div className="pt-4 space-y-4">
                            <button onClick={logout} className="w-full bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500 p-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
                                <LogOut className="w-4 h-4" /> Sign Out from Everywhere
                            </button>
                            <p className="text-center text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40">Salon CRM v2.4.0-stable</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail-view"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6 sm:space-y-8"
                    >
                        {/* Detail Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setActiveTab(null)}
                                    className="w-10 h-10 flex items-center justify-center border border-border/60 hover:bg-surface-alt transition-colors group"
                                >
                                    <ArrowLeft className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                </button>
                                <div className="text-left">
                                    <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight uppercase leading-none">
                                        {settingsSections.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Detail View'}
                                    </h1>
                                    <p className="text-[10px] sm:text-sm text-text-muted font-medium mt-1.5 uppercase tracking-wide">Customize your interaction experience</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                                    saveSuccess ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:scale-105'
                                }`}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                        Updated
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 text-white" />
                                        Commit Changes
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="bg-white border border-border/60 p-5 sm:p-8">
                            {renderDetailView()}
                        </div>

                        {/* Helper Tip */}
                        <div className="flex items-start gap-4 p-4 bg-surface-alt/50 border border-border/20">
                            <HelpCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
                            <p className="text-[10px] text-text-muted font-medium leading-relaxed uppercase tracking-wider">
                                Changes made here will sync across all authenticated devices for this salon instance.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

