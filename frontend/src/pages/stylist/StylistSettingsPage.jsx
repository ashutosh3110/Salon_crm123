import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, Shield, Bell, Scissors, MapPin, Phone, Mail, 
    ChevronRight, Check, Plus, ShieldAlert, Activity, 
    Zap, Clock, X, ChevronDown, Users
} from 'lucide-react';
import PasswordField from '../../components/common/PasswordField';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';

const WEEK_DAYS = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_DAY = { on: true, start: '10:00', end: '20:00' };

const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:')) {
        return avatarPath;
    }
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath}`;
};

function normalizeWeekly(raw) {
    const out = {};
    const daysSource = raw?.days || raw;
    WEEK_DAYS.forEach(({ key }) => {
        const d = daysSource?.[key];

        let startVal = DEFAULT_DAY.start;
        let endVal = DEFAULT_DAY.end;
        let onVal = false;

        if (Array.isArray(d)) {
            if (d.length > 0 && d[0]) {
                startVal = d[0].start || DEFAULT_DAY.start;
                endVal = d[0].end || DEFAULT_DAY.end;
                onVal = true;
            }
        } else if (d && typeof d === 'object') {
            startVal = d.start || DEFAULT_DAY.start;
            endVal = d.end || DEFAULT_DAY.end;
            onVal = d.on !== false;
        }

        out[key] = {
            on: onVal,
            start: startVal,
            end: endVal,
        };
    });
    return out;
}

function outletIdStr(u) {
    const o = u?.outletId;
    if (!o) return '';
    return typeof o === 'object' ? String(o._id || '') : String(o);
}

export default function StylistSettingsPage() {
    const { section } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { user, updateProfile, changePassword, refreshUser } = useAuth();
    const { outlets, platformSettings } = useBusiness();

    const [loadError, setLoadError] = useState(null);
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        specialist: '',
        outletId: '',
        avatar: '',
        stylistBio: '',
        stylistExperience: '',
        stylistClientsLabel: '',
        stylistSpecializations: [],
        specText: '',
    });

    const [skills, setSkills] = useState([]);
    const [weekly, setWeekly] = useState(() => normalizeWeekly({}));
    const [isAvailable, setIsAvailable] = useState(true);
    const [newSkill, setNewSkill] = useState({ name: '', level: 'expert', icon: '✂️' });
    const [showAddSkill, setShowAddSkill] = useState(false);

    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

    const showToast = (msg, isErr) => {
        setToast({ msg, isErr: !!isErr });
        setTimeout(() => setToast(null), 3500);
    };

    const hydrateFromUser = useCallback((u) => {
        if (!u) return;
        const specs = Array.isArray(u.specializations) ? u.specializations : (Array.isArray(u.stylistSpecializations) ? u.stylistSpecializations : []);
        setProfileForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            specialist: u.role || '',
            outletId: outletIdStr(u),
            avatar: u.avatar || '',
            stylistBio: u.bio || u.stylistBio || '',
            stylistExperience: u.experience || u.stylistExperience || '',
            stylistClientsLabel: u.stylistClientsLabel || '',
            stylistSpecializations: specs,
            specText: specs.join(', '),
        });
        const rawSkills = Array.isArray(u.skills) ? u.skills : (Array.isArray(u.stylistSkills) ? u.stylistSkills : []);
        setSkills(
            rawSkills.map((s) => ({
                name: s.name || '',
                level: s.level === 'intermediate' ? 'intermediate' : 'expert',
                icon: s.icon || '✂️',
            }))
        );
        setWeekly(normalizeWeekly(u.availability || u.stylistWeeklyAvailability));
        setIsAvailable(u.isActive !== false);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadError(null);
                const res = await api.get('/auth/me');
                const u = res.data?.data ?? res.data;
                if (!cancelled) hydrateFromUser(u);
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e?.response?.data?.message || e?.message || 'Could not load settings');
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [hydrateFromUser, refreshUser]);

    useEffect(() => {
        if (!section) {
            navigate('/stylist/settings/profile', { replace: true });
        }
    }, [section, navigate]);

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            const specs = profileForm.specText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            const res = await api.patch('/auth/updatedetails', {
                name: profileForm.name.trim(),
                email: profileForm.email.toLowerCase().trim(),
                phone: profileForm.phone.trim(),
                avatar: profileForm.avatar,
                bio: profileForm.stylistBio.trim(),
                experience: profileForm.stylistExperience.trim(),
                specializations: specs,
            });
            const updated = res.data?.data ?? res.data;
            hydrateFromUser(updated);
            showToast('Profile saved');
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Save failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        if (file.size > threshold) {
            showToast(`Image too large. Max ${maxSize}${unit} allowed.`, true);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setProfileForm(prev => ({ ...prev, avatar: res.data.url }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showToast('Upload failed', true);
        }
    };

    const saveSkills = async () => {
        setIsSaving(true);
        try {
            const res = await api.patch('/auth/updatedetails', {
                skills: skills.map((s) => ({
                    name: s.name.trim(),
                    level: s.level,
                    icon: (s.icon || '✂️').slice(0, 8),
                })),
            });
            const updated = res.data?.data ?? res.data;
            hydrateFromUser(updated);
            showToast('Skills saved');
            setShowAddSkill(false);
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Save failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const addSkillRow = () => {
        if (!newSkill.name.trim()) {
            showToast('Enter a skill name', true);
            return;
        }
        setSkills((s) => [...s, { ...newSkill, name: newSkill.name.trim() }]);
        setNewSkill({ name: '', level: 'expert', icon: '✂️' });
        setShowAddSkill(false);
    };

    const saveAvailability = async () => {
        setIsSaving(true);
        try {
            const formattedDays = {};
            WEEK_DAYS.forEach(({ key }) => {
                const dayData = weekly[key];
                const start = dayData?.start || DEFAULT_DAY.start;
                const end = dayData?.end || DEFAULT_DAY.end;
                formattedDays[key] = [{ start, end }];
            });

            const res = await api.patch('/auth/updatedetails', {
                availability: {
                    mode: 'different',
                    days: formattedDays
                },
                isActive: isAvailable
            });
            const updated = res.data?.data ?? res.data;
            hydrateFromUser(updated);
            showToast('Availability saved');
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Save failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const submitPassword = async () => {
        if (pwd.next !== pwd.confirm) {
            showToast('New passwords do not match', true);
            return;
        }
        setIsSaving(true);
        try {
            await api.put('/auth/updatepassword', { currentPassword: pwd.current, newPassword: pwd.next });
            showToast('Password updated');
            setPwd({ current: '', next: '', confirm: '' });
        } catch (e) {
            showToast(e?.response?.data?.message || e?.message || 'Password update failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const employeeRef = user?._id ? String(user._id).slice(-8).toUpperCase() : '—';

    // UI Helper Components
    const InputWrapper = ({ icon: Icon, label, children }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative flex items-center">
                {Icon && <Icon className="absolute left-3.5 w-4 h-4 text-purple-500/70" />}
                {children}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (section) {
            case 'profile':
                return (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
                            <InputWrapper icon={User} label="Full Name">
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="Enter your name"
                                />
                            </InputWrapper>
                            
                            <InputWrapper icon={Mail} label="Email Address">
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="Enter your email"
                                />
                            </InputWrapper>

                            <InputWrapper icon={Phone} label="Phone Number">
                                <input
                                    type="text"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="Enter your phone"
                                />
                            </InputWrapper>

                            <InputWrapper icon={Scissors} label="Specializations">
                                <input
                                    type="text"
                                    value={profileForm.specText}
                                    onChange={(e) => setProfileForm({ ...profileForm, specText: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="e.g. Bridal, Keratin, Coloring"
                                />
                            </InputWrapper>

                            <InputWrapper icon={Clock} label="Experience">
                                <input
                                    type="text"
                                    value={profileForm.stylistExperience}
                                    onChange={(e) => setProfileForm({ ...profileForm, stylistExperience: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="e.g. 5 Years"
                                />
                            </InputWrapper>

                            <InputWrapper icon={Users} label="Clients Served">
                                <input
                                    type="text"
                                    value={profileForm.stylistClientsLabel}
                                    onChange={(e) => setProfileForm({ ...profileForm, stylistClientsLabel: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400"
                                    placeholder="e.g. 500+"
                                />
                            </InputWrapper>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                            <textarea
                                value={profileForm.stylistBio}
                                onChange={(e) => setProfileForm({ ...profileForm, stylistBio: e.target.value })}
                                placeholder="Write a short bio for your customers..."
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-400 min-h-[100px] resize-none"
                            />
                        </div>

                        <button onClick={saveProfile} disabled={isSaving} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-[14px] font-black uppercase text-[11px] tracking-widest shadow-[0_4px_14px_-4px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50">
                            {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </motion.div>
                );
            case 'skills':
                return (
                    <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-widest">My Skills</h3>
                            <button onClick={() => setShowAddSkill(!showAddSkill)} className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> Add Skill
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAddSkill && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-[20px] space-y-4 overflow-hidden">
                                    <div className="grid sm:grid-cols-3 gap-3">
                                        <input
                                            type="text" placeholder="Skill Name" value={newSkill.name}
                                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-[12px] text-[11px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                        <select
                                            value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-[12px] text-[11px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 appearance-none"
                                        >
                                            <option value="expert">Expert Level</option>
                                            <option value="intermediate">Intermediate Level</option>
                                        </select>
                                        <input
                                            type="text" placeholder="Icon (Emoji)" value={newSkill.icon}
                                            onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value.slice(0, 8) })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-[12px] text-[11px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                        />
                                    </div>
                                    <button onClick={addSkillRow} className="bg-purple-600 text-white w-full py-3 rounded-[12px] font-black uppercase text-[10px] tracking-widest hover:bg-purple-700 transition-colors">
                                        Add to List
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            {skills.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[24px]">
                                    <p className="text-[12px] font-bold text-slate-400">No skills added yet.</p>
                                </div>
                            ) : (
                                skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-[20px] shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-xl shrink-0">
                                                {skill.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-black text-slate-800 dark:text-white">{skill.name}</h4>
                                                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">{skill.level}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSkills((s) => s.filter((_, i) => i !== idx))} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2 rounded-full transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {skills.length > 0 && (
                            <button onClick={saveSkills} disabled={isSaving} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-[14px] font-black uppercase text-[11px] tracking-widest shadow-[0_4px_14px_-4px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 mt-4">
                                {isSaving ? 'Saving...' : 'Save Skills'}
                            </button>
                        )}
                    </motion.div>
                );
            case 'availability':
                return (
                    <motion.div key="availability" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[20px] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_20px_-5px_rgba(124,58,237,0.3)]">
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-1">Available for Bookings</h3>
                                <p className="text-[10px] font-medium text-white/80">Allow clients to schedule appointments</p>
                            </div>
                            <button
                                onClick={() => setIsAvailable(v => !v)}
                                className={`w-14 h-8 rounded-full transition-colors relative shrink-0 p-1 flex items-center ${isAvailable ? 'bg-white' : 'bg-white/20'}`}
                            >
                                <div className={`w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${isAvailable ? 'translate-x-6 bg-purple-600' : 'translate-x-0 bg-white'}`} />
                            </button>
                        </div>

                        <div className={`space-y-3 transition-opacity duration-300 ${isAvailable ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            {WEEK_DAYS.map(({ key, label }) => {
                                const d = weekly[key];
                                return (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-[20px] shadow-sm gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <span className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">{label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="time" value={d.start}
                                                onChange={(e) => setWeekly((w) => ({ ...w, [key]: { ...w[key], start: e.target.value } }))}
                                                className="bg-slate-50 dark:bg-slate-900 border-none text-[11px] font-bold text-slate-800 dark:text-white rounded-[12px] px-4 py-2.5 focus:ring-2 focus:ring-purple-500/50"
                                            />
                                            <span className="text-slate-400 font-bold">-</span>
                                            <input
                                                type="time" value={d.end}
                                                onChange={(e) => setWeekly((w) => ({ ...w, [key]: { ...w[key], end: e.target.value } }))}
                                                className="bg-slate-50 dark:bg-slate-900 border-none text-[11px] font-bold text-slate-800 dark:text-white rounded-[12px] px-4 py-2.5 focus:ring-2 focus:ring-purple-500/50"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={saveAvailability} disabled={isSaving} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-[14px] font-black uppercase text-[11px] tracking-widest shadow-[0_4px_14px_-4px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 mt-4">
                            {isSaving ? 'Saving...' : 'Save Availability'}
                        </button>
                    </motion.div>
                );
            case 'security':
                return (
                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-[24px] p-6 shadow-sm max-w-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Change Password</h3>
                                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Keep your account secure</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <InputWrapper label="Current Password">
                                    <PasswordField
                                        value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                                        inputClassName="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </InputWrapper>
                                <InputWrapper label="New Password">
                                    <PasswordField
                                        value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                                        inputClassName="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </InputWrapper>
                                <InputWrapper label="Confirm New Password">
                                    <PasswordField
                                        value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                        inputClassName="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-[16px] text-[12px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500/50"
                                    />
                                </InputWrapper>

                                <button onClick={submitPassword} disabled={isSaving} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-[14px] font-black uppercase text-[11px] tracking-widest shadow-[0_4px_14px_-4px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 mt-4">
                                    {isSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-[24px] p-6 max-w-lg flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                <Activity className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-black text-slate-800 dark:text-white uppercase tracking-wider">Two-Factor Authentication</h4>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">
                                    Not available yet. Please use a strong password and keep it private.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'skills', label: 'Skills' },
        { id: 'availability', label: 'Hours' },
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden shadow-sm font-sans relative">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Vibrant Theme Hero Header */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 pt-8 pb-10 px-6 sm:px-10 relative shrink-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <input type="file" id="profile-img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <label htmlFor="profile-img-upload" className="relative w-24 h-24 rounded-[24px] overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center cursor-pointer shadow-xl backdrop-blur-sm transition-transform hover:scale-105">
                            {profileForm.avatar ? (
                                <img src={getAvatarUrl(profileForm.avatar)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-white/50" />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus className="w-8 h-8 text-white" />
                            </div>
                        </label>
                    </div>

                    <div className="text-center sm:text-left">
                        <h1 className="text-[22px] sm:text-[28px] font-black text-white uppercase tracking-tight drop-shadow-md">
                            {(profileForm.name || user?.name || 'Stylist').toUpperCase()}
                        </h1>
                        <p className="text-[11px] font-black text-purple-200 uppercase tracking-[0.3em] mt-1 drop-shadow-sm">
                            {profileForm.specialist || 'Stylist'}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-sm">
                                REF. {employeeRef}
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pill Navigation */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 overflow-x-auto hide-scrollbar shrink-0">
                <div className="flex gap-2 py-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => navigate(`/stylist/settings/${tab.id}`)}
                            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                section === tab.id 
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar relative">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                            toast.isErr ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'
                        }`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
