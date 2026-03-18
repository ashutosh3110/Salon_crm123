import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SettingsPage({ tab }) {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab from prop or URL
    const activeTab = tab || location.pathname.split('/').pop() || 'profile';

    const [fiscal, setFiscal] = useState(() => {
        const saved = localStorage.getItem('pos_fiscal_settings');
        return saved ? JSON.parse(saved) : {
            businessName: 'XYZ SALON & SPA',
            gstin: '09AAFCC0301F1ZN',
            state: 'Uttar Pradesh',
            stateCode: '09',
            defaultGst: 18,
            inclusiveTax: true
        };
    });

    const states = [
        { name: 'Maharashtra', code: '27' },
        { name: 'Delhi', code: '07' },
        { name: 'Karnataka', code: '29' },
        { name: 'Tamil Nadu', code: '33' },
        { name: 'Uttar Pradesh', code: '09' },
        { name: 'West Bengal', code: '19' },
        { name: 'Gujarat', code: '24' },
        { name: 'Telangana', code: '36' },
        { name: 'Rajasthan', code: '08' }
    ];

    const handleFiscalSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('pos_fiscal_settings', JSON.stringify(fiscal));
        alert('Business fiscal settings updated successfully.');
    };

    // If we're at /admin/settings, redirect to /admin/settings/profile
    useEffect(() => {
        if (location.pathname === '/admin/settings' || location.pathname === '/admin/settings/') {
            navigate('/admin/settings/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-text uppercase tracking-tight">Settings</h1>
                <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Update profile details, business info, and security.</p>
            </div>

            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm transition-all">
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Profile</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Keep your basic account information up to date.</p>
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
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Full Name</label>
                                        <input type="text" defaultValue={user?.name || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Email</label>
                                        <input type="email" defaultValue={user?.email || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Primary Link (Phone)</label>
                                    <input type="tel" defaultValue={user?.phone || ''} className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" placeholder="+91..." />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end border-t border-border">
                                <button className="px-8 py-3.5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Commit Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 max-w-2xl">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Notifications</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Choose which alerts you want to receive.</p>
                            </div>

                            <div className="divide-y divide-border border border-border rounded-none overflow-hidden">
                                {[
                                    { title: 'Booking Confirmations', desc: 'Send a message when a new booking is created.' },
                                    { title: 'Payment Alerts', desc: 'Notify when a bill is paid or refunded.' },
                                    { title: 'Low Stock Warnings', desc: 'Alert when products reach low stock.' },
                                    { title: 'Daily Summary Report', desc: 'Email a short end-of-day summary.' },
                                    { title: 'Marketing Updates', desc: 'Product news and marketing tips from us.' }
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
                        <div className="space-y-8 max-w-xl text-left">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest">Security</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Change your password to keep your account safe.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Current Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">New Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Confirm Password</label>
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end border-t border-border">
                                <button className="px-8 py-3.5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Update Password</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="space-y-8 max-w-2xl text-left font-sans">
                            <div>
                                <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Business & Tax Info</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] leading-none">Configure your Legal Entity and GST registration details.</p>
                            </div>

                            <form onSubmit={handleFiscalSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Legal Business Name</label>
                                    <input
                                        type="text"
                                        value={fiscal.businessName}
                                        onChange={e => setFiscal({ ...fiscal, businessName: e.target.value })}
                                        className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50 uppercase"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">GSTIN Number</label>
                                        <input
                                            type="text"
                                            maxLength={15}
                                            value={fiscal.gstin}
                                            onChange={e => setFiscal({ ...fiscal, gstin: e.target.value.toUpperCase() })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Registration State</label>
                                        <select
                                            value={fiscal.state}
                                            onChange={e => {
                                                const s = states.find(st => st.name === e.target.value);
                                                setFiscal({ ...fiscal, state: s.name, stateCode: s.code });
                                            }}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        >
                                            {states.map(s => <option key={s.code} value={s.name}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Default GST Rate (%)</label>
                                        <input
                                            type="number"
                                            value={fiscal.defaultGst}
                                            onChange={e => setFiscal({ ...fiscal, defaultGst: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-6">
                                        <input
                                            type="checkbox"
                                            id="inclusive"
                                            checked={fiscal.inclusiveTax}
                                            onChange={e => setFiscal({ ...fiscal, inclusiveTax: e.target.checked })}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <label htmlFor="inclusive" className="text-[10px] font-black text-text-muted uppercase tracking-widest cursor-pointer select-none">Prices are Inclusive of Tax</label>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button type="submit" className="px-8 py-3.5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">Save Business Info</button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

