import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Lock, Save, Loader2, Shield, UserCircle, Briefcase, Key, Camera } from 'lucide-react';
import mockApi from '../../services/mock/mockApi';
import { useBusiness } from '../../contexts/BusinessContext';

export default function ReceptionistProfilePage() {
    const { user, login } = useAuth();
    const { outlets } = useBusiness();
    const [loading, setLoading] = useState(false);
    
    // Profile Image State
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    
    // Profile Update State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Security Update State
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
            // Mock API call to update profile
            await mockApi.put(`/users/${user?._id || user?.id}`, { ...profileData, profileImage });
            
            // Re-authenticate or update local user state if needed (mocked)
            alert('Profile updated successfully!');
            // Here you'd ideally call an auth context method to update the user in state.
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
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
            // Mock API call to update password
            await mockApi.patch(`/users/${user?._id || user?.id}/password`, {
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            });
            alert('Security password updated successfully!');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Failed to update password:', error);
            alert('Error updating password. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-reveal max-w-5xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase flex items-center gap-3">
                        <UserCircle className="w-8 h-8 text-primary" />
                        My Profile
                    </h1>
                    <p className="text-[11px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Manage your personal information and security settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border overflow-hidden relative group">
                        <div className="h-32 bg-primary/10 absolute top-0 inset-x-0 group-hover:bg-primary/20 transition-colors"></div>
                        <div className="p-8 relative z-10 flex flex-col items-center text-center mt-12">
                            <label className="relative cursor-pointer group/avatar">
                                <div className="w-24 h-24 rounded-full bg-surface-alt border-4 border-surface shadow-xl flex items-center justify-center mb-4 overflow-hidden relative">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-text uppercase">{user?.name?.charAt(0) || 'R'}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                            <h2 className="text-xl font-black text-text uppercase tracking-tight">{user?.name || 'Receptionist'}</h2>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 mb-6 flex items-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                {user?.role || 'Receptionist'}
                            </p>
                            
                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-surface-alt border border-border text-left">
                                    <Briefcase className="w-4 h-4 text-text-muted shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Assigned Outlet</p>
                                        <p className="text-xs font-bold text-text truncate uppercase">{userOutletName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-surface-alt border border-border text-left">
                                    <Mail className="w-4 h-4 text-text-muted shrink-0" />
                                    <div className="overflow-hidden">
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Email Address</p>
                                        <p className="text-xs font-bold text-text truncate">{user?.email || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Profile Information Form */}
                    <div className="bg-surface border border-border relative overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" /> Profile Information
                            </h3>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="text"
                                            required
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-primary/50 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-primary/50 transition-colors"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="email"
                                            required
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-primary/50 transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-text text-surface text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Update Form */}
                    <div className="bg-surface border border-border relative overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-rose-500/5">
                            <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <Key className="w-4 h-4" /> Security & Password
                            </h3>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="password"
                                        required
                                        value={securityData.currentPassword}
                                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={securityData.newPassword}
                                            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="New Password"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={securityData.confirmPassword}
                                            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-surface-alt border border-border text-sm font-bold text-text outline-none focus:border-rose-500/50 transition-colors"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
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
