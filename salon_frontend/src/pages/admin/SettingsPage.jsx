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
                <h1 className="text-2xl font-black text-text uppercase tracking-tight">System Configuration</h1>
                <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Manage operational parameters and security protocols.</p>
            </div>

            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm transition-all">
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Profile Matrix</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Synchronize personal identity and access keys.</p>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-none bg-surface-alt border border-border">
                                <div className="w-20 h-20 rounded-none bg-primary/5 flex items-center justify-center text-2xl font-black text-primary border border-primary/20 shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">{user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black text-xl text-text leading-none uppercase tracking-tight">{user?.name || 'Authorized Entity'}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest inline-flex items-center px-3 py-1 rounded-none bg-primary/10 border border-primary/20">{user?.role || 'SYSTEM ADMIN'}</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Operational Name</label>
                                        <input type="text" defaultValue={user?.name || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Comms Protocol (Email)</label>
                                        <input type="email" defaultValue={user?.email || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Primary Link (Phone)</label>
                                    <input type="tel" defaultValue={user?.phone || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" placeholder="+91..." />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end border-t border-border">
                                <button className="px-8 py-3.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all active:scale-[0.98]">Commit Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Feedback Pulsar</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Configure high-priority notification frequencies.</p>
                            </div>

                            <div className="divide-y divide-border border border-border rounded-none overflow-hidden">
                                {[
                                    { title: 'Booking Confirmations', desc: 'Real-time sync on new appointment sequences.' },
                                    { title: 'Payment Alerts', desc: 'Transactional pulse monitoring.' },
                                    { title: 'Low Stock Warnings', desc: 'Material depletion protocols.' },
                                    { title: 'Daily Summary Report', desc: 'Consolidated end-of-day data logs.' },
                                    { title: 'Marketing Updates', desc: 'Communication from mission control.' }
                                ].map((item) => (
                                    <div key={item.title} className="flex items-center justify-between p-6 bg-surface hover:bg-surface-alt/50 transition-colors">
                                        <div className="space-y-1">
                                            <span className="text-[11px] font-black text-text uppercase tracking-widest block">{item.title}</span>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer group">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-12 h-6 bg-border rounded-none peer-checked:bg-primary transition-all duration-300 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 after:shadow-sm peer-checked:after:bg-white group-hover:after:scale-110"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-xl">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Firewall Control</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Cycle account authorization tokens regularly.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Legacy Token (Current)</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">New Sequence</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Verify Sequence</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end border-t border-border">
                                <button className="px-8 py-3.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all active:scale-[0.98]">Deploy Password</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

