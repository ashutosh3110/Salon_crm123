import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Scissors, MapPin, Phone, Mail, ChevronRight, Check, Plus, ShieldAlert, Activity, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCMS } from '../../contexts/CMSContext';

const skills = [
    { name: 'HAIR_COLORING', level: 'EXPERT_UNIT', icon: '🎨' },
    { name: 'BRIDAL_STYLING', level: 'EXPERT_UNIT', icon: '👰' },
    { name: 'KERATIN_TREATMENT', level: 'INT_NODE', icon: '✨' },
    { name: 'GENTS_FADE', level: 'EXPERT_UNIT', icon: '💇‍♂️' },
    { name: 'BEARD_GROOMING', level: 'INT_NODE', icon: '🧔' },
];

export default function StylistSettingsPage() {
    const { section } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { experts, updateExpertProfile } = useCMS();

    // Find current expert profile
    const profile = experts.find(e => e.userId === user?.id) || {
        bio: '',
        experience: '5 Years',
        clients: '500+',
        specializations: ['Master Styling'],
        status: 'None'
    };

    const [formState, setFormState] = useState({
        bio: profile.bio || '',
        experience: profile.experience || '',
        clients: profile.clients || '',
        specializations: profile.specializations || [],
        name: user?.name || '',
        img: profile.img || `https://ui-avatars.com/api/?name=${user?.name || 'Stylist'}&background=C8956C&color=fff`
    });

    const [isSaving, setIsSaving] = useState(false);

    // Sync form state if profile changes
    useEffect(() => {
        if (profile.userId) {
            setFormState(prev => ({
                ...prev,
                bio: profile.bio,
                experience: profile.experience,
                clients: profile.clients,
                specializations: profile.specializations,
                status: profile.status,
                img: profile.img || prev.img
            }));
        }
    }, [profile.userId]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, img: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Redirect to default section if none provided
    useEffect(() => {
        if (!section) {
            navigate('/stylist/settings/profile', { replace: true });
        }
    }, [section, navigate]);

    const tabLabels = {
        'profile': 'My Profile',
        'skills': 'My Skills',
        'availability': 'Availability',
        'security': 'Security'
    };

    const renderContent = () => {
        switch (section) {
            case 'profile':
                return (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-8 border-b border-border/10 pb-10">
                            <div className="relative group">
                                <input
                                    type="file"
                                    id="profile-img-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <label 
                                    htmlFor="profile-img-upload"
                                    className="w-28 h-28 bg-background border border-border flex items-center justify-center text-4xl font-black text-primary group-hover:border-primary/50 transition-all shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.05)] cursor-pointer overflow-hidden"
                                >
                                    {formState.img ? (
                                        <img src={formState.img} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.substring(0, 2).toUpperCase() || 'AN'
                                    )}
                                </label>
                                <label 
                                    htmlFor="profile-img-upload"
                                    className="absolute -bottom-2 -right-2 w-10 h-10 border border-border bg-surface text-primary flex items-center justify-center shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                                >
                                    <Plus className="w-5 h-5" />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text tracking-tighter">ANITA STYLIST</h2>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 italic">Senior Hair Stylist</p>
                                <p className="text-[9px] text-text-muted mt-2 font-black uppercase tracking-widest opacity-60">Employee ID: #ST-4029</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Full Name</label>
                                <input 
                                    type="text" 
                                    value={formState.name} 
                                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Profile Status</label>
                                <div className={`w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                    profile.status === 'Approved' ? 'text-emerald-500' : profile.status === 'Pending' ? 'text-amber-500' : 'text-text-muted'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        profile.status === 'Approved' ? 'bg-emerald-500' : profile.status === 'Pending' ? 'bg-amber-500' : 'bg-text-muted'
                                    }`} />
                                    {profile.status || 'Not Submitted'}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Years of Experience</label>
                                <input 
                                    type="text" 
                                    value={formState.experience} 
                                    onChange={(e) => setFormState({...formState, experience: e.target.value})}
                                    placeholder="e.g. 8 Years"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Total Clients Served</label>
                                <input 
                                    type="text" 
                                    value={formState.clients} 
                                    onChange={(e) => setFormState({...formState, clients: e.target.value})}
                                    placeholder="e.g. 1.2k+"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Profile Bio (Visible to Customers)</label>
                                <textarea 
                                    value={formState.bio} 
                                    onChange={(e) => setFormState({...formState, bio: e.target.value})}
                                    placeholder="Tell customers about your expertise and style..."
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all h-24 resize-none" 
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 font-bold italic">Specializations (Comma separated)</label>
                                <input 
                                    type="text" 
                                    value={formState.specializations.join(', ')} 
                                    onChange={(e) => setFormState({...formState, specializations: e.target.value.split(',').map(s => s.trim())})}
                                    placeholder="BRIDAL STYLE, EDITORIAL, GLAMOUR WAVES"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setIsSaving(true);
                                    updateExpertProfile(user.id, { ...formState, status: 'Pending' });
                                    setTimeout(() => {
                                        setIsSaving(false);
                                        alert('Profile submitted for Admin approval!');
                                    }, 1000);
                                }}
                                disabled={isSaving}
                                className="bg-primary text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                            {profile.status === 'Approved' && (
                                <div className="flex items-center gap-2 px-6 py-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                    <Check className="w-4 h-4" /> Live on App
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 'skills':
                return (
                    <motion.div
                        key="skills"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <Scissors className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Skills & Expertise</h3>
                            </div>
                            <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 px-4 py-2 border border-transparent hover:border-primary/20 transition-all">+ Add New Skill</button>
                        </div>
                        <div className="grid gap-4">
                            {skills.map((skill) => (
                                <div key={skill.name} className="flex items-center justify-between p-6 bg-background border border-border hover:border-primary/40 transition-all group relative overflow-hidden">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-surface flex items-center justify-center text-2xl border border-border/10">
                                            {skill.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text tracking-tight uppercase">{skill.name.replace('_', ' ')}</p>
                                            <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1">{skill.level === 'EXPERT_UNIT' ? 'EXPERT LEVEL' : 'INTERMEDIATE LEVEL'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-1 w-24 bg-border/20 rounded-full overflow-hidden hidden md:block">
                                            <div className={`h-full bg-primary ${skill.level.includes('EXPERT') ? 'w-full' : 'w-2/3'}`} />
                                        </div>
                                        <div className="w-8 h-8 bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'availability':
                return (
                    <motion.div
                        key="availability"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between border-b border-border/10 pb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Working Hours</h3>
                            </div>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">Currently Active</span>
                        </div>

                        <div className="grid gap-4">
                            {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                                <div key={day} className="flex items-center justify-between p-6 bg-background border border-border hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-text uppercase tracking-widest">{day}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[8px] text-text-muted uppercase font-bold mb-1">Daily Shift</p>
                                            <p className="text-[10px] font-black text-text">10:00 AM - 08:00 PM</p>
                                        </div>
                                        <button className="w-12 h-6 bg-primary/20 border border-primary/30 p-1 flex items-center justify-end">
                                            <div className="w-4 h-4 bg-primary" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-surface-alt border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-primary" />
                                <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Temporary Absence</h4>
                            </div>
                            <p className="text-[10px] text-text-muted uppercase leading-relaxed font-bold tracking-tight">
                                Toggle temporary downtime for immediate break. All bookings will be marked for redistribution.
                            </p>
                            <button className="px-6 py-3 border border-rose-500/30 text-rose-500 font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Activate Break Mode</button>
                        </div>
                    </motion.div>
                );
            case 'security':
                return (
                    <motion.div
                        key="security"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-10"
                    >
                        <div className="flex items-center gap-3 border-b border-border/10 pb-6">
                            <Shield className="w-4 h-4 text-primary" />
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Change Password</h3>
                        </div>

                        <div className="space-y-6 max-w-xl">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 italic">Current Password</label>
                                <input type="password" placeholder="••••••••••••" className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 italic">New Password</label>
                                <input type="password" placeholder="MIN. 8 CHARACTERS" className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 italic">Confirm New Password</label>
                                <input type="password" placeholder="RE-ENTER PASSWORD" className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all" />
                            </div>

                            <button className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Update Password</button>
                        </div>

                        <div className="p-8 border border-border relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldAlert className="w-16 h-16 text-primary" />
                            </div>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="p-3 bg-primary/10 border border-primary/20">
                                    <Activity className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em] mb-2">Two-Factor_Authentication (2FA)</h4>
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight mb-4">Hardened security layer for session initiation. Biometric or Token bypass required.</p>
                                    <button className="text-[9px] font-black text-primary border-b border-primary/20 pb-1 hover:border-primary transition-all uppercase tracking-widest">Setup_MFA_Protocol</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header */}
            <div className="border-b border-border/20 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Account Settings</span>
                </div>
                <h1 className="text-3xl font-black text-text tracking-tighter uppercase">{tabLabels[section] || 'Unit'} Settings</h1>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 italic italic">Manage your account and preferences</p>
            </div>

            <div className="bg-surface border border-border p-8 md:p-10 relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-16 translate-x-16 rotate-45" />

                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}

