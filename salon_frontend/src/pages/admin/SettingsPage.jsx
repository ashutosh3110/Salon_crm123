import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SettingsPage({ tab }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab from prop or URL
    const activeTab = tab || location.pathname.split('/').pop() || 'profile';

    // If we're at /admin/settings, redirect to /admin/settings/profile
    useEffect(() => {
        if (location.pathname === '/admin/settings' || location.pathname === '/admin/settings/') {
            navigate('/admin/settings/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text">Settings</h1>
                <p className="text-sm text-text-secondary mt-1 tracking-tight">Manage your salon and account settings.</p>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h2 className="text-lg font-semibold text-text">Profile Settings</h2>
                                <p className="text-sm text-text-muted mt-1">Update your personal information and contact details.</p>
                            </div>

                            <div className="flex items-center gap-5 p-4 rounded-xl bg-surface-alt border border-border/50">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary ring-4 ring-white shadow-sm">
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-text leading-none">{user?.name || 'User'}</h3>
                                    <p className="text-sm text-text-muted capitalize inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-border">{user?.role || 'admin'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Full Name</label>
                                        <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                                    <input type="tel" defaultValue={user?.phone || ''} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" placeholder="+91 98765-43210" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-border">
                                <button className="btn-primary px-8 py-2.5 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h2 className="text-lg font-semibold text-text">Notification Preferences</h2>
                                <p className="text-sm text-text-muted mt-1">Choose how you want to be notified about your salon activity.</p>
                            </div>

                            <div className="divide-y divide-border border rounded-xl overflow-hidden">
                                {[
                                    { title: 'Booking Confirmations', desc: 'Receive alerts when a new booking is made.' },
                                    { title: 'Payment Alerts', desc: 'Get notified when payments are processed.' },
                                    { title: 'Low Stock Warnings', desc: 'Alerts when inventory levels drop below threshold.' },
                                    { title: 'Daily Summary Report', desc: 'Wait for a daily email summary of your sales.' },
                                    { title: 'Marketing Updates', desc: 'Occasional news and feature updates.' }
                                ].map((item) => (
                                    <div key={item.title} className="flex items-center justify-between p-4 bg-white hover:bg-surface-alt/30 transition-colors">
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-semibold text-text block">{item.title}</span>
                                            <p className="text-xs text-text-muted">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-10 h-5.5 bg-secondary rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-4.5"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 max-w-xl">
                            <div>
                                <h2 className="text-lg font-semibold text-text">Security Settings</h2>
                                <p className="text-sm text-text-muted mt-1">Keep your account secure by updating your password regularly.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Confirm Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface-alt/30" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-border">
                                <button className="btn-primary px-8 py-2.5 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]">Update Password</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

