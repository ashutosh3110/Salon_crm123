import { useState } from 'react';
import {
    Settings, Bell, Shield, User,
    Smartphone, Moon, Globe, HelpCircle,
    ChevronRight, LogOut, Lock, Palette,
    ArrowLeft, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordField from '../../components/common/PasswordField';

const settingsSections = [
    {
        title: 'Account Settings',
        items: [
            { id: 'profile', label: 'Edit Profile', sub: 'Name, email, and photo', icon: User },
            { id: 'security', label: 'Security', sub: 'Password and 2FA', icon: Shield },
            { id: 'notifications', label: 'Notifications', sub: 'How you want to be alerted', icon: Bell },
        ]
    },
    {
        title: 'Support',
        items: [
            { id: 'help', label: 'Help Center', sub: 'FAQs and support guides', icon: HelpCircle },
            { id: 'privacy', label: 'Privacy Policy', sub: 'Data collection and usage', icon: Lock },
        ]
    }
];

export default function ManagerSettingsPage() {
    const [activeTab, setActiveTab] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1200);
    };

    const renderDetailView = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">AS</div>
                            <div>
                                <h3 className="text-sm font-black text-text uppercase">Avatar Selection</h3>
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 hover:underline">Upload New Photo</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Full Name</label>
                                <input type="text" defaultValue="Ananya Sharma" className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email Address</label>
                                <input type="email" defaultValue="ananya.s@wapixo.com" className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Phone Number</label>
                                <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Designation</label>
                                <input type="text" defaultValue="Operations Manager" disabled className="w-full bg-surface-alt border border-border/40 p-3 sm:p-4 text-sm font-bold text-text-muted cursor-not-allowed outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Public Bio</label>
                            <textarea rows={3} defaultValue="Managing luxury salon operations at Wapixo Store #42. Dedicated to premium service standards." className="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none" />
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
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Current Password</label>
                                <PasswordField 
                                    placeholder="••••••••" 
                                    inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">New Password</label>
                                <PasswordField 
                                    placeholder="Min. 12 characters" 
                                    inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Confirm New Password</label>
                                <PasswordField 
                                    placeholder="Repeat password" 
                                    inputClassName="w-full bg-surface border border-border/60 p-3 sm:p-4 text-sm font-bold text-text focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
                                />
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
                        <div className="bg-primary p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl sm:text-3xl font-black border border-white/20 shadow-lg">
                                AS
                            </div>
                            <div className="flex-1 text-center sm:text-left relative">
                                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-none uppercase">Ananya Sharma</h2>
                                <p className="text-white/70 text-[10px] sm:text-sm mt-1.5 font-bold uppercase tracking-widest">Operations Manager</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-4">
                                    <div className="bg-black/20 backdrop-blur-sm px-2.5 py-1 border border-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Store #42</div>
                                    <div className="bg-black/20 backdrop-blur-sm px-2.5 py-1 border border-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Premium Member</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setActiveTab('profile')}
                                className="w-full sm:w-auto relative px-5 py-2.5 bg-white text-primary text-[9px] sm:text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
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
                                                    <div className="shrink-0 group-hover:scale-110 transition-transform">
                                                        <item.icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
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
                            <button className="w-full bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-500 p-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99]">
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
                                        <CheckCircle2 className="w-4 h-4" />
                                        Updated
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
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

