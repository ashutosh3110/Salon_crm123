import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SettingsPage({ tab }) {
    const { user, updateProfile, changePassword } = useAuth();
    const { salon, salonLoading, updateSalon } = useBusiness();
    const [isSaving, setIsSaving] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [fiscal, setFiscal] = useState({
        businessName: '',
        gstin: '',
        state: '',
        stateCode: '',
        serviceGst: 18,
        productGst: 12,
        inclusiveTax: true
    });

    // Initialize from user and salon data
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
        if (salon) {
            setFiscal({
                businessName: salon.name || '',
                gstin: salon.gstNumber || '',
                state: salon.settings?.state || 'Uttar Pradesh',
                stateCode: salon.settings?.stateCode || '09',
                serviceGst: salon.settings?.serviceGst || 18,
                productGst: salon.settings?.productGst || 12,
                inclusiveTax: salon.settings?.inclusiveTax !== undefined ? salon.settings.inclusiveTax : true
            });
        }
    }, [user, salon]);

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

    const handleFiscalSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                name: fiscal.businessName,
                gstNumber: fiscal.gstin,
                settings: {
                    state: fiscal.state,
                    stateCode: fiscal.stateCode,
                    serviceGst: fiscal.serviceGst,
                    productGst: fiscal.productGst,
                    inclusiveTax: fiscal.inclusiveTax
                }
            };
            await updateSalon(payload);
            alert('Business fiscal settings updated successfully.');
        } catch (error) {
            alert('Failed to update settings: ' + error.message);
        } finally {
            setIsSaving(false);
        }
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
                <h1 className="text-3xl font-bold text-text tracking-tight">Settings</h1>
                <p className="text-sm font-medium text-text-muted mt-1">Update profile details, business info, and security.</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm transition-all">
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Profile</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Keep your basic account information up to date.</p>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-alt/10 border border-border">
                                <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20 shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative z-10">{user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-2xl text-text leading-tight tracking-tight">{user?.name || 'Authorized Entity'}</h3>
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">{user?.role || 'SYSTEM ADMIN'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-6 pt-2">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-text-muted pl-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={profileForm.name} 
                                            onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                            className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5" 
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-xs font-semibold text-text-muted pl-1">Email</label>
                                        <input 
                                            type="email" 
                                            value={profileForm.email} 
                                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                            className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-semibold text-text-muted pl-1">Primary Link (Phone)</label>
                                    <input 
                                        type="tel" 
                                        value={profileForm.phone} 
                                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                        className="w-full px-5 py-3.5 rounded-xl border border-border text-sm font-semibold focus:border-primary outline-none transition-all bg-surface hover:border-primary/40 focus:ring-4 focus:ring-primary/5" 
                                        placeholder="+91..." 
                                    />
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Commit Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Notifications</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Choose which alerts you want to receive.</p>
                            </div>

                            <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                                {[
                                    { title: 'Booking Confirmations', desc: 'Send a message when a new booking is created.' },
                                    { title: 'Payment Alerts', desc: 'Notify when a bill is paid or refunded.' },
                                    { title: 'Low Stock Warnings', desc: 'Alert when products reach low stock.' },
                                    { title: 'Daily Summary Report', desc: 'Email a short end-of-day summary.' },
                                    { title: 'Marketing Updates', desc: 'Product news and marketing tips from us.' }
                                ].map((item) => (
                                    <div key={item.title} className="flex items-center justify-between p-6 bg-surface hover:bg-surface-alt/20 transition-colors">
                                        <div className="space-y-1 text-left">
                                            <span className="text-sm font-bold text-text tracking-wide block">{item.title}</span>
                                            <p className="text-xs font-medium text-text-muted">{item.desc}</p>
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
                                <h2 className="text-lg font-bold text-text tracking-tight">Security</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Change your password to keep your account safe.</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        placeholder="••••••••" 
                                        required
                                        className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" 
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwordForm.newPassword}
                                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                            placeholder="••••••••" 
                                            required
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            value={passwordForm.confirmPassword}
                                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                            placeholder="••••••••" 
                                            required
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="space-y-8 max-w-2xl text-left">
                            <div>
                                <h2 className="text-lg font-bold text-text tracking-tight">Business & Tax Info</h2>
                                <p className="text-xs text-text-muted font-medium mt-1">Configure your Legal Entity and GST registration details.</p>
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
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Default Service GST (%)</label>
                                        <input
                                            type="number"
                                            value={fiscal.serviceGst || 18}
                                            onChange={e => setFiscal({ ...fiscal, serviceGst: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Default Product GST (%)</label>
                                        <input
                                            type="number"
                                            value={fiscal.productGst || 12}
                                            onChange={e => setFiscal({ ...fiscal, productGst: Number(e.target.value) })}
                                            className="w-full px-5 py-3.5 rounded-none border border-border text-sm font-bold focus:border-primary outline-none transition-all bg-surface-alt/50"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="inclusive"
                                        checked={fiscal.inclusiveTax}
                                        onChange={e => setFiscal({ ...fiscal, inclusiveTax: e.target.checked })}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label htmlFor="inclusive" className="text-xs font-semibold text-text-muted tracking-tight cursor-pointer select-none">Prices are Inclusive of Tax</label>
                                </div>

                                <div className="pt-6 flex justify-end border-t border-border">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving || salonLoading}
                                        className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Business Info'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

