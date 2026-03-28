import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Scissors, MapPin, Phone, Mail, ChevronRight, Check, Plus, ShieldAlert, Activity, Zap, Clock, X } from 'lucide-react';
import PasswordField from '../../components/common/PasswordField';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';

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

function normalizeWeekly(raw) {
    const out = {};
    WEEK_DAYS.forEach(({ key }) => {
        const d = raw?.[key];
        out[key] = {
            on: d?.on !== false,
            start: typeof d?.start === 'string' && d.start ? d.start : DEFAULT_DAY.start,
            end: typeof d?.end === 'string' && d.end ? d.end : DEFAULT_DAY.end,
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
    const { user, updateProfile, changePassword, refreshUser } = useAuth();
    const { outlets } = useBusiness();

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
    const [newSkill, setNewSkill] = useState({ name: '', level: 'expert', icon: '✂️' });
    const [showAddSkill, setShowAddSkill] = useState(false);

    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

    const showToast = (msg, isErr) => {
        setToast({ msg, isErr: !!isErr });
        setTimeout(() => setToast(null), 3500);
    };

    const hydrateFromUser = useCallback((u) => {
        if (!u) return;
        const specs = Array.isArray(u.stylistSpecializations) ? u.stylistSpecializations : [];
        setProfileForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            specialist: u.specialist || '',
            outletId: outletIdStr(u),
            avatar: u.avatar || '',
            stylistBio: u.stylistBio || '',
            stylistExperience: u.stylistExperience || '',
            stylistClientsLabel: u.stylistClientsLabel || '',
            stylistSpecializations: specs,
            specText: specs.join(', '),
        });
        setSkills(
            Array.isArray(u.stylistSkills) && u.stylistSkills.length
                ? u.stylistSkills.map((s) => ({
                      name: s.name || '',
                      level: s.level === 'intermediate' ? 'intermediate' : 'expert',
                      icon: s.icon || '✂️',
                  }))
                : []
        );
        setWeekly(normalizeWeekly(u.stylistWeeklyAvailability));
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoadError(null);
                const u = await refreshUser();
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

    const tabLabels = {
        profile: 'My profile',
        skills: 'My skills',
        availability: 'Availability',
        security: 'Security',
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            const specs = profileForm.specText
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            await updateProfile({
                name: profileForm.name.trim(),
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
                specialist: profileForm.specialist.trim(),
                outletId: profileForm.outletId || null,
                avatar: profileForm.avatar,
                stylistBio: profileForm.stylistBio.trim(),
                stylistExperience: profileForm.stylistExperience.trim(),
                stylistClientsLabel: profileForm.stylistClientsLabel.trim(),
                stylistSpecializations: specs,
            });
            showToast('Profile saved');
        } catch (e) {
            showToast(e.message || 'Save failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 350 * 1024) {
            showToast('Image too large (max ~350KB)', true);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const r = reader.result;
            if (typeof r === 'string' && r.length > 400000) {
                showToast('Image too large for profile storage', true);
                return;
            }
            setProfileForm((prev) => ({ ...prev, avatar: r }));
        };
        reader.readAsDataURL(file);
    };

    const saveSkills = async () => {
        setIsSaving(true);
        try {
            const updated = await updateProfile({
                stylistSkills: skills.map((s) => ({
                    name: s.name.trim(),
                    level: s.level,
                    icon: (s.icon || '✂️').slice(0, 8),
                })),
            });
            hydrateFromUser(updated);
            showToast('Skills saved');
            setShowAddSkill(false);
        } catch (e) {
            showToast(e.message || 'Save failed', true);
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
            const updated = await updateProfile({ stylistWeeklyAvailability: weekly });
            hydrateFromUser(updated);
            showToast('Availability saved');
        } catch (e) {
            showToast(e.message || 'Save failed', true);
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
            await changePassword(pwd.current, pwd.next);
            showToast('Password updated');
            setPwd({ current: '', next: '', confirm: '' });
        } catch (e) {
            showToast(e.message || 'Password update failed', true);
        } finally {
            setIsSaving(false);
        }
    };

    const employeeRef = user?._id ? String(user._id).slice(-8).toUpperCase() : '—';

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
                                    {profileForm.avatar ? (
                                        <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-text-muted" />
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
                                <h2 className="text-2xl font-black text-text tracking-tighter uppercase">
                                    {(profileForm.name || user?.name || 'Stylist').toUpperCase()}
                                </h2>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1 not-italic">
                                    {profileForm.specialist || 'Your title'}
                                </p>
                                <p className="text-[9px] text-text-muted mt-2 font-black uppercase tracking-widest opacity-60">
                                    Staff ref: #{employeeRef}
                                </p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Full name</label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Account status</label>
                                <div
                                    className={`w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                        user?.status === 'active' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${user?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    />
                                    {user?.status === 'active' ? 'Active' : user?.status === 'inactive' ? 'Inactive' : '—'}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email
                                </label>
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Phone
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Title (shown to clients)</label>
                                <input
                                    type="text"
                                    value={profileForm.specialist}
                                    onChange={(e) => setProfileForm({ ...profileForm, specialist: e.target.value })}
                                    placeholder="e.g. Senior hair stylist"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Assigned outlet</label>
                                <div className="relative group">
                                    <select
                                        value={profileForm.outletId}
                                        onChange={(e) => setProfileForm({ ...profileForm, outletId: e.target.value })}
                                        className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select outlet</option>
                                        {(outlets || []).map((o) => (
                                            <option key={o._id} value={o._id}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Experience</label>
                                <input
                                    type="text"
                                    value={profileForm.stylistExperience}
                                    onChange={(e) => setProfileForm({ ...profileForm, stylistExperience: e.target.value })}
                                    placeholder="e.g. 8 years"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Clients served (label)</label>
                                <input
                                    type="text"
                                    value={profileForm.stylistClientsLabel}
                                    onChange={(e) => setProfileForm({ ...profileForm, stylistClientsLabel: e.target.value })}
                                    placeholder="e.g. 500+"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Bio</label>
                                <textarea
                                    value={profileForm.stylistBio}
                                    onChange={(e) => setProfileForm({ ...profileForm, stylistBio: e.target.value })}
                                    placeholder="Short bio for customers…"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all h-24 resize-none"
                                />
                            </div>
                            <div className="sm:col-span-2 space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">
                                    Specializations (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.specText}
                                    onChange={(e) => setProfileForm({ ...profileForm, specText: e.target.value })}
                                    placeholder="Bridal, Colour, Keratin…"
                                    className="w-full px-5 py-4 bg-background border border-border text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            <button
                                type="button"
                                onClick={saveProfile}
                                disabled={isSaving}
                                className="bg-primary text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Saving…' : 'Save profile'}
                            </button>
                            {user?.status === 'active' && (
                                <div className="flex items-center gap-2 px-6 py-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                    <Check className="w-4 h-4" /> Account active
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
                                <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Skills & expertise</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddSkill(true)}
                                className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 px-4 py-2 border border-transparent hover:border-primary/20 transition-all"
                            >
                                + Add skill
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAddSkill && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-6 bg-background border border-border space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-text">New skill</span>
                                        <button type="button" onClick={() => setShowAddSkill(false)} className="text-text-muted hover:text-text">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Skill name"
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-widest"
                                    />
                                    <select
                                        value={newSkill.level}
                                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <option value="expert">Expert</option>
                                        <option value="intermediate">Intermediate</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Icon (emoji)"
                                        value={newSkill.icon}
                                        onChange={(e) => setNewSkill({ ...newSkill, icon: e.target.value.slice(0, 8) })}
                                        className="w-full px-4 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-widest"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkillRow}
                                        className="w-full py-3 bg-primary text-white font-black text-[9px] uppercase tracking-widest"
                                    >
                                        Add to list
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid gap-4">
                            {skills.length === 0 ? (
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest py-8 text-center border border-dashed border-border">
                                    No skills yet. Add skills your salon offers.
                                </p>
                            ) : (
                                skills.map((skill, idx) => (
                                    <div
                                        key={`${skill.name}-${idx}`}
                                        className="flex items-center justify-between p-6 bg-background border border-border hover:border-primary/40 transition-all gap-4 flex-wrap"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-surface flex items-center justify-center text-2xl border border-border/10">
                                                {skill.icon || '✂️'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text tracking-tight uppercase">{skill.name}</p>
                                                <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1">
                                                    {skill.level === 'expert' ? 'Expert level' : 'Intermediate level'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSkills((s) => s.filter((_, i) => i !== idx))}
                                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest px-3 py-2 border border-rose-500/30 hover:bg-rose-500/10"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={saveSkills}
                            disabled={isSaving}
                            className="bg-primary text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Saving…' : 'Save skills'}
                        </button>
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
                                <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Working hours</h3>
                            </div>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 border border-emerald-500/20">
                                Saved on server when you click save
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {WEEK_DAYS.map(({ key, label }) => {
                                const d = weekly[key];
                                return (
                                    <div
                                        key={key}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-background border border-border gap-4"
                                    >
                                        <div className="flex items-center gap-6">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setWeekly((w) => ({
                                                        ...w,
                                                        [key]: { ...w[key], on: !w[key].on },
                                                    }))
                                                }
                                                className={`w-3 h-3 rounded-full ${d.on ? 'bg-emerald-500' : 'bg-border'}`}
                                                aria-label="Toggle day"
                                            />
                                            <span className="text-[10px] font-black text-text uppercase tracking-widest min-w-[100px]">
                                                {label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <div>
                                                <p className="text-[8px] text-text-muted uppercase font-bold mb-1">Start</p>
                                                <input
                                                    type="time"
                                                    disabled={!d.on}
                                                    value={d.start}
                                                    onChange={(e) =>
                                                        setWeekly((w) => ({
                                                            ...w,
                                                            [key]: { ...w[key], start: e.target.value },
                                                        }))
                                                    }
                                                    className="px-3 py-2 bg-surface border border-border text-[10px] font-black disabled:opacity-40"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-text-muted uppercase font-bold mb-1">End</p>
                                                <input
                                                    type="time"
                                                    disabled={!d.on}
                                                    value={d.end}
                                                    onChange={(e) =>
                                                        setWeekly((w) => ({
                                                            ...w,
                                                            [key]: { ...w[key], end: e.target.value },
                                                        }))
                                                    }
                                                    className="px-3 py-2 bg-surface border border-border text-[10px] font-black disabled:opacity-40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={saveAvailability}
                            disabled={isSaving}
                            className="bg-primary text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl disabled:opacity-50"
                        >
                            {isSaving ? 'Saving…' : 'Save availability'}
                        </button>

                        <div className="p-8 bg-surface-alt border border-border space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-primary" />
                                <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Time off</h4>
                            </div>
                            <p className="text-[10px] text-text-muted uppercase leading-relaxed font-bold tracking-tight not-italic">
                                For leave requests, use <strong className="text-text">Time off</strong> in the sidebar.
                            </p>
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
                            <h3 className="text-[10px] font-black text-text uppercase tracking-[0.3em]">Change password</h3>
                        </div>

                        <div className="space-y-6 max-w-xl">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Current password</label>
                                <PasswordField
                                    autoComplete="current-password"
                                    value={pwd.current}
                                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                                    inputClassName="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all"
                                    buttonClassName="text-text-muted hover:text-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">New password (min 8)</label>
                                <PasswordField
                                    autoComplete="new-password"
                                    value={pwd.next}
                                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                                    inputClassName="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all"
                                    buttonClassName="text-text-muted hover:text-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Confirm new password</label>
                                <PasswordField
                                    autoComplete="new-password"
                                    value={pwd.confirm}
                                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                    inputClassName="w-full px-5 py-4 bg-background border border-border text-[10px] font-black focus:outline-none focus:border-primary transition-all"
                                    buttonClassName="text-text-muted hover:text-primary"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={submitPassword}
                                disabled={isSaving}
                                className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Updating…' : 'Update password'}
                            </button>
                        </div>

                        <div className="p-8 border border-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <ShieldAlert className="w-16 h-16 text-primary" />
                            </div>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="p-3 bg-primary/10 border border-primary/20">
                                    <Activity className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em] mb-2">Two-factor authentication</h4>
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight mb-0 not-italic">
                                        Not available yet. Use a strong password and keep it private.
                                    </p>
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
            <div className="border-b border-border/20 pb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Account settings</span>
                </div>
                <h1 className="text-3xl font-black text-text tracking-tighter uppercase">{tabLabels[section] || 'Settings'}</h1>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 not-italic">
                    Synced with your salon account
                </p>
            </div>

            {loadError && (
                <div className="p-4 border border-amber-500/30 bg-amber-500/5 text-[10px] uppercase text-amber-700 tracking-wide">
                    {loadError} — showing last known data.
                </div>
            )}

            <div className="bg-surface border border-border p-8 md:p-10 relative overflow-hidden min-h-[500px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-16 translate-x-16 rotate-45" />
                <nav className="flex flex-wrap gap-2 mb-10 border-b border-border/20 pb-4">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'skills', label: 'Skills', icon: Scissors },
                        { id: 'availability', label: 'Hours', icon: Bell },
                        { id: 'security', label: 'Security', icon: Shield },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => navigate(`/stylist/settings/${id}`)}
                            className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                                section === id ? 'bg-primary text-white' : 'text-text-muted hover:text-text hover:bg-background'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                            <ChevronRight className={`w-3 h-3 opacity-50 ${section === id ? '' : 'hidden sm:inline'}`} />
                        </button>
                    ))}
                </nav>
                <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 border shadow-2xl text-[10px] font-black uppercase tracking-widest ${
                            toast.isErr ? 'bg-rose-600 text-white border-rose-500' : 'bg-text text-background border-border'
                        }`}
                    >
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
