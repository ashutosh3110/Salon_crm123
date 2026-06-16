import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Lock, Save, Loader2, Shield, UserCircle, Briefcase, Key, Camera } from 'lucide-react';
import mockApi from '../../services/mock/mockApi';
import { useBusiness } from '../../contexts/BusinessContext';

export default function ReceptionistProfilePage() {
    const { user } = useAuth();
    const { outlets } = useBusiness();
    const [loading, setLoading] = useState(false);

    const [profileImage, setProfileImage] = useState(user?.profileImage || null);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await mockApi.put(`/users/${user?._id || user?.id}`, { ...profileData, profileImage });
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const userOutletId = user?.outletId || user?.outlet?._id || user?.outlet;
    const userOutletName = user?.outlet?.name || (outlets || []).find(o => String(o._id || o.id) === String(userOutletId))?.name || 'Main Branch';

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            await mockApi.patch(`/users/${user?._id || user?.id}/password`, {
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword,
            });
            alert('Password updated successfully!');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert('Error updating password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-reveal max-w-4xl mx-auto pb-8">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" style={{ color: '#B4912B' }} />
                <h1 className="text-lg font-black text-text tracking-tight uppercase">My Profile</h1>
                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-2 opacity-60">
                    / Manage personal info & security
                </span>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Left: Avatar Card ── */}
                <div className="lg:col-span-1">
                    <div className="bg-surface border border-border overflow-hidden">
                        {/* Gold banner */}
                        <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, #B4912B22, #B4912B44)' }} />

                        <div className="px-5 pb-5 -mt-10 flex flex-col items-center text-center">
                            {/* Avatar */}
                            <label className="relative cursor-pointer group/avatar">
                                <div className="w-20 h-20 rounded-full bg-surface-alt border-4 border-surface shadow-lg flex items-center justify-center overflow-hidden relative">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-text uppercase">
                                            {user?.name?.charAt(0) || 'R'}
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>

                            <h2 className="text-base font-black text-text uppercase tracking-tight mt-3">
                                {user?.name || 'Receptionist'}
                            </h2>
                            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1" style={{ color: '#B4912B' }}>
                                <Shield className="w-2.5 h-2.5" style={{ color: '#B4912B' }} />
                                {user?.role || 'Receptionist'}
                            </p>

                            {/* Info rows */}
                            <div className="w-full mt-4 space-y-2">
                                <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt border border-border text-left">
                                    <Briefcase className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                    <div className="overflow-hidden min-w-0">
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Outlet</p>
                                        <p className="text-[11px] font-bold text-text truncate uppercase">{userOutletName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-2.5 bg-surface-alt border border-border text-left">
                                    <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                    <div className="overflow-hidden min-w-0">
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Email</p>
                                        <p className="text-[11px] font-bold text-text truncate">{user?.email || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Forms ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Profile Info Form */}
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border bg-surface-alt/50 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" style={{ color: '#B4912B' }} />
                            <h3 className="text-[11px] font-black text-text uppercase tracking-widest">Profile Information</h3>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="text"
                                            required
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-[#B4912B]/50 transition-colors"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-[#B4912B]/50 transition-colors"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="email"
                                            required
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-[#B4912B]/50 transition-colors"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                                    style={{ backgroundColor: '#B4912B' }}
                                >
                                    {loading
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#ffffff' }} />
                                        : <Save className="w-3.5 h-3.5" style={{ color: '#ffffff' }} />
                                    }
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Form */}
                    <div className="bg-surface border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border bg-rose-500/5 flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-rose-500" />
                            <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-widest">Security & Password</h3>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-5 space-y-4">
                            {/* Current Password */}
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                    <input
                                        type="password"
                                        required
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={securityData.newPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="New password"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={securityData.confirmPassword}
                                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2.5 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Confirm password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                    {loading
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                        : <Shield className="w-3.5 h-3.5 text-white" />
                                    }
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
