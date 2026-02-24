import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Scissors, MapPin, Phone, Mail, ChevronRight, Check, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const skills = [
    { name: 'Hair Coloring', level: 'Expert', icon: '🎨' },
    { name: 'Bridal Styling', level: 'Expert', icon: '👰' },
    { name: 'Keratin Treatment', level: 'Intermediate', icon: '✨' },
    { name: 'Gents Fade', level: 'Expert', icon: '💇‍♂️' },
    { name: 'Beard Grooming', level: 'Intermediate', icon: '🧔' },
];

export default function StylistSettingsPage() {
    const { section } = useParams();
    const navigate = useNavigate();
    const activeTab = section ? section.charAt(0).toUpperCase() + section.slice(1) : 'Profile';

    // Redirect to default section if none provided
    useEffect(() => {
        if (!section) {
            navigate('/stylist/settings/profile', { replace: true });
        }
    }, [section, navigate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Account & Preferences</h2>
                <h1 className="text-2xl font-black text-text tracking-tight uppercase">{activeTab} Settings</h1>
            </div>

            <div className="bg-surface rounded-3xl border border-border/40 p-6 md:p-8 shadow-sm overflow-hidden text-left">
                {activeTab === 'Profile' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-4 border-white shadow-xl overflow-hidden">
                                    AN
                                </div>
                                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-4 border-surface shadow-lg hover:scale-110 transition-transform">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text">Anita Stylist</h2>
                                <p className="text-sm text-primary font-bold">Senior Creative Stylist</p>
                                <p className="text-xs text-text-muted mt-1">Staff ID: #ST-4029</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Full Name</label>
                                <input type="text" defaultValue="Anita Stylist" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Email</label>
                                <input type="email" defaultValue="stylist@salon.com" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Phone</label>
                                <input type="tel" defaultValue="+91 98765 43212" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Experience</label>
                                <input type="text" defaultValue="8 Years" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors" />
                            </div>
                        </div>

                        <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            Save Changes
                        </button>
                    </motion.div>
                )}

                {activeTab === 'Skills' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Mastered Skills</h3>
                            <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">+ Add New</button>
                        </div>
                        <div className="grid gap-3">
                            {skills.map((skill) => (
                                <div key={skill.name} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border/10 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{skill.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-text">{skill.name}</p>
                                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{skill.level}</p>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'Availability' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <Bell className="w-5 h-5 text-primary" />
                            <p className="text-xs font-bold text-text-secondary">Availability & notification preferences settings are under maintenance.</p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'Security' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                            <Shield className="w-5 h-5 text-amber-500" />
                            <p className="text-xs font-bold text-text-secondary">Security settings (Password changes, 2FA) are coming soon.</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
