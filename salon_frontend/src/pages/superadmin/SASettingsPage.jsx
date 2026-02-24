import { useState } from 'react';
import {
    Wrench, Users, CreditCard, MessageSquare, Mail, Bell,
    Send, CheckCircle, AlertTriangle, XCircle, Radio,
    ToggleLeft, ToggleRight, Globe, Shield, Zap,
    Database, RefreshCw, Lock, Unlock, PenLine, X,
    ChevronRight, Clock, BarChart2, Smartphone,
    Building2, UserCheck, Crown,
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';

/* ─── Toggle switch ─────────────────────────────────────────────────── */
function Toggle({ value, onChange, size = 'md' }) {
    const sizes = { sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', on: 'translate-x-[16px]' }, md: { track: 'w-12 h-6', thumb: 'w-4.5 h-4.5', on: 'translate-x-6' } };
    const s = sizes[size];
    return (
        <button onClick={() => onChange(!value)}
            className={`relative inline-flex items-center px-0.5 rounded-full transition-all duration-300 focus:outline-none ${value ? 'bg-emerald-500' : 'bg-slate-200'}`}
            style={{ width: size === 'md' ? '48px' : '36px', height: size === 'md' ? '26px' : '20px' }}>
            <div className={`bg-white rounded-full shadow-md transition-transform duration-300 ${value ? (size === 'md' ? 'translate-x-[22px]' : 'translate-x-[16px]') : 'translate-x-0'}`}
                style={{ width: size === 'md' ? '18px' : '14px', height: size === 'md' ? '18px' : '14px' }} />
        </button>
    );
}

/* ─── Section card ──────────────────────────────────────────────────── */
function SectionCard({ title, subtitle, icon: Icon, iconColor = 'bg-primary/10 text-primary', children }) {
    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className={`w-9 h-9 rounded-xl ${iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                    <h3 className="font-bold text-text text-sm">{title}</h3>
                    {subtitle && <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

/* ─── Global toggle row ─────────────────────────────────────────────── */
function ToggleRow({ label, desc, value, onChange, warn }) {
    return (
        <div className={`flex items-center justify-between py-3.5 px-4 rounded-xl border transition-all ${warn && value ? 'bg-red-50/50 border-red-200' : 'bg-surface/50 border-border hover:border-slate-300'
            }`}>
            <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text">{label}</span>
                    {warn && value && (
                        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">ACTIVE</span>
                    )}
                </div>
                <span className="text-xs text-text-muted">{desc}</span>
            </div>
            <Toggle value={value} onChange={onChange} />
        </div>
    );
}

/* ─── Composer modal ────────────────────────────────────────────────── */
function ComposerModal({ type, onClose, onSend }) {
    const [form, setForm] = useState({ subject: '', message: '', audience: 'all', channel: 'email' });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
    const labelCls = 'block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5';

    const TYPES = {
        broadcast: { title: 'Broadcast Message', icon: Radio, iconColor: 'text-primary' },
        maintenance: { title: 'Maintenance Alert', icon: Wrench, iconColor: 'text-amber-500' },
        announcement: { title: 'Push Announcement', icon: Bell, iconColor: 'text-blue-500' },
        expiry: { title: 'Plan Expiry Reminder', icon: Clock, iconColor: 'text-orange-500' },
    };
    const t = TYPES[type] || TYPES.broadcast;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-border rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <t.icon className={`w-5 h-5 ${t.iconColor}`} />
                        <div>
                            <h3 className="text-base font-bold text-text">{t.title}</h3>
                            <p className="text-xs text-text-muted mt-0.5">Compose and send to selected audience</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Audience</label>
                            <CustomDropdown
                                variant="form"
                                value={form.audience}
                                onChange={v => set('audience', v)}
                                options={[
                                    { value: 'all', label: 'All Salons', icon: Building2 },
                                    { value: 'active', label: 'Active Salons', icon: UserCheck },
                                    { value: 'trial', label: 'Trial Salons', icon: Clock },
                                    { value: 'expired', label: 'Expired Salons', icon: XCircle },
                                    { value: 'pro', label: 'Pro Plan', icon: Crown },
                                    { value: 'enterprise', label: 'Enterprise Plan', icon: Zap },
                                ]}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Channel</label>
                            <CustomDropdown
                                variant="form"
                                value={form.channel}
                                onChange={v => set('channel', v)}
                                options={[
                                    { value: 'email', label: 'Email', icon: Mail },
                                    { value: 'push', label: 'Push', icon: Bell },
                                    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                    { value: 'sms', label: 'SMS', icon: Smartphone },
                                ]}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Subject *</label>
                        <input className={inputCls} value={form.subject} onChange={e => set('subject', e.target.value)}
                            placeholder={type === 'maintenance' ? 'Scheduled Maintenance — Action Required' : type === 'expiry' ? 'Your plan expires in 3 days' : 'Enter subject line…'} />
                    </div>
                    <div>
                        <label className={labelCls}>Message *</label>
                        <textarea className={inputCls} rows={5} value={form.message} onChange={e => set('message', e.target.value)}
                            placeholder={
                                type === 'maintenance'
                                    ? 'We will be performing scheduled maintenance on Feb 24, 2026 from 2:00 AM to 4:00 AM IST. Services may be unavailable during this period.'
                                    : type === 'expiry'
                                        ? 'Your {{plan}} subscription expires on {{date}}. Renew now to avoid interruption to your salon.'
                                        : 'Write your message here…'
                            } />
                    </div>
                    <div className="bg-surface rounded-xl p-3 text-xs text-text-secondary">
                        <span className="font-bold text-text-muted">Preview:</span> This will reach approximately <span className="font-bold text-text">
                            {form.audience === 'all' ? '127' : form.audience === 'active' ? '89' : form.audience === 'trial' ? '18' : form.audience === 'expired' ? '11' : form.audience === 'pro' ? '22' : '13'}
                        </span> salons via <span className="font-bold text-text capitalize">{form.channel}</span>.
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                    <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-all">Cancel</button>
                    <button onClick={() => onSend(form)} disabled={!form.subject || !form.message}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Now
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SASettingsPage() {
    const [toast, setToast] = useState(null);
    const [composer, setComposer] = useState(null); // null | 'broadcast' | 'maintenance' | 'announcement' | 'expiry'

    /* Global toggles state */
    const [toggles, setToggles] = useState({
        maintenanceMode: false,
        newRegistrations: true,
        paymentGateway: true,
        whatsappIntegration: false,
        emailService: true,
        smsService: true,
        mobileApp: true,
        debugMode: false,
        apiRateLimit: true,
        autoBackup: true,
    });
    const setToggle = (k) => (v) => {
        setToggles(p => ({ ...p, [k]: v }));
        showToast(`${k.replace(/([A-Z])/g, ' $1')} ${v ? 'enabled' : 'disabled'}.`, v ? 'success' : 'error');
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSend = async (form) => {
        setComposer(null);
        showToast(`Message sent to ${form.audience === 'all' ? 127 : form.audience === 'active' ? 89 : 18} salons via ${form.channel}!`);
    };

    return (
        <div className="space-y-6 pb-8">

            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-black text-text tracking-tight">Global Controls</h1>
                <p className="text-sm text-text-secondary mt-0.5">Platform-wide settings, feature flags, and communication tools</p>
            </div>

            {/* ── Maintenance mode banner ── */}
            {toggles.maintenanceMode && (
                <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border-2 border-amber-300 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                    <Wrench className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                    <div>
                        <div className="text-sm font-bold text-amber-700">Maintenance Mode is ACTIVE</div>
                        <div className="text-xs text-amber-600">All salons are currently seeing a maintenance page. Disable this immediately if unintended.</div>
                    </div>
                    <button onClick={() => setToggle('maintenanceMode')(false)} className="ml-auto shrink-0 text-xs font-bold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all">
                        Disable Now
                    </button>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">

                {/* ── Platform controls ── */}
                <SectionCard title="Platform Controls" subtitle="Core system feature flags" icon={Globe} iconColor="bg-primary/10 text-primary">
                    <div className="space-y-3">
                        <ToggleRow
                            label="Maintenance Mode"
                            desc="Show maintenance page to all salon tenants"
                            value={toggles.maintenanceMode}
                            onChange={setToggle('maintenanceMode')}
                            warn
                        />
                        <ToggleRow
                            label="New Registrations"
                            desc="Allow new salons to register on the platform"
                            value={toggles.newRegistrations}
                            onChange={setToggle('newRegistrations')}
                        />
                        <ToggleRow
                            label="Debug Mode"
                            desc="Enable verbose error logging across all tenants"
                            value={toggles.debugMode}
                            onChange={setToggle('debugMode')}
                            warn
                        />
                        <ToggleRow
                            label="API Rate Limiting"
                            desc="Apply request rate limits to all tenant APIs"
                            value={toggles.apiRateLimit}
                            onChange={setToggle('apiRateLimit')}
                        />
                        <ToggleRow
                            label="Automated Backups"
                            desc="Run daily encrypted database backups"
                            value={toggles.autoBackup}
                            onChange={setToggle('autoBackup')}
                        />
                    </div>
                </SectionCard>

                {/* ── Integration controls ── */}
                <SectionCard title="Integration Controls" subtitle="Third-party service flags" icon={Zap} iconColor="bg-blue-50 text-blue-600">
                    <div className="space-y-3">
                        <ToggleRow
                            label="Payment Gateway"
                            desc="Razorpay / Stripe payment processing"
                            value={toggles.paymentGateway}
                            onChange={setToggle('paymentGateway')}
                            warn={!toggles.paymentGateway}
                        />
                        <ToggleRow
                            label="Email Service"
                            desc="Transactional email delivery via SMTP"
                            value={toggles.emailService}
                            onChange={setToggle('emailService')}
                        />
                        <ToggleRow
                            label="SMS Service"
                            desc="OTP and notification SMS via gateway"
                            value={toggles.smsService}
                            onChange={setToggle('smsService')}
                        />
                        <ToggleRow
                            label="WhatsApp Integration"
                            desc="WhatsApp Business API notifications"
                            value={toggles.whatsappIntegration}
                            onChange={setToggle('whatsappIntegration')}
                        />
                        <ToggleRow
                            label="Mobile App"
                            desc="Customer-facing booking mobile application"
                            value={toggles.mobileApp}
                            onChange={setToggle('mobileApp')}
                        />
                    </div>
                </SectionCard>
            </div>

            {/* ── Communication Center ── */}
            <SectionCard title="Communication Center" subtitle="Send messages to salons — emails, alerts, announcements" icon={MessageSquare} iconColor="bg-violet-50 text-violet-600">
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        {
                            type: 'broadcast', icon: Radio, color: 'bg-primary/10 text-primary border-primary/20',
                            label: 'Broadcast Email', desc: 'Send a custom email to all or filtered salon groups',
                            btnLabel: 'Compose & Send',
                        },
                        {
                            type: 'maintenance', icon: Wrench, color: 'bg-amber-50 text-amber-600 border-amber-200',
                            label: 'Maintenance Alert', desc: 'Notify salons about upcoming downtime with custom schedule',
                            btnLabel: 'Send Alert',
                        },
                        {
                            type: 'announcement', icon: Bell, color: 'bg-blue-50 text-blue-600 border-blue-200',
                            label: 'Push Announcement', desc: 'Publish a platform update or new feature announcement',
                            btnLabel: 'Announce',
                        },
                        {
                            type: 'expiry', icon: Clock, color: 'bg-orange-50 text-orange-600 border-orange-200',
                            label: 'Plan Expiry Reminder', desc: `Send renewal reminders to salons with expiring plans`,
                            btnLabel: 'Send Reminder',
                        },
                    ].map(c => (
                        <div key={c.type} className={`flex flex-col gap-3 p-4 rounded-xl border-2 ${c.color} bg-opacity-50`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center shrink-0`}>
                                    <c.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-text">{c.label}</div>
                                    <div className="text-xs text-text-muted">{c.desc}</div>
                                </div>
                            </div>
                            <button onClick={() => setComposer(c.type)}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-current text-xs font-bold hover:shadow-md transition-all active:scale-95">
                                <Send className="w-3.5 h-3.5" /> {c.btnLabel}
                            </button>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── Danger zone ── */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-700 text-sm">Danger Zone</h3>
                        <p className="text-[11px] text-red-500 mt-0.5">Irreversible actions — proceed with extreme caution</p>
                    </div>
                </div>
                <div className="p-5 space-y-3">
                    {[
                        { label: 'Force Logout All Sessions', desc: 'Invalidate all active user sessions across all salons', icon: Lock, action: () => showToast('All sessions invalidated — users will need to re-login.', 'error') },
                        { label: 'Clear All Caches', desc: 'Purge Redis cache, CDN edge caches and API response caches', icon: Database, action: () => showToast('Cache clear initiated — may take 30 seconds.', 'info') },
                        { label: 'Rebuild Search Index', desc: 'Re-index all tenant data for search service (takes ~5 min)', icon: RefreshCw, action: () => showToast('Search re-index started in background.', 'info') },
                    ].map(d => (
                        <div key={d.label} className="flex items-center justify-between gap-4 bg-white rounded-xl border border-red-100 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <d.icon className="w-4 h-4 text-red-400 shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-text">{d.label}</div>
                                    <div className="text-xs text-text-muted truncate">{d.desc}</div>
                                </div>
                            </div>
                            <button onClick={d.action}
                                className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 shadow-md shadow-red-500/20">
                                Execute
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Composer modal ── */}
            {composer && <ComposerModal type={composer} onClose={() => setComposer(null)} onSend={handleSend} />}
        </div>
    );
}
