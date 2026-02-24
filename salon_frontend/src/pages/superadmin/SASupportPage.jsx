import { useState, useRef } from 'react';
import {
    LogIn, ScrollText, Bug, LogOut, Search, RefreshCw,
    CheckCircle, XCircle, AlertCircle, Clock, Filter,
    Building2, ChevronDown, Eye, Download, Trash2, X,
    Shield, Wifi, WifiOff, Users,
    AlertTriangle, Info, Radio, Circle, Crown,
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';

/* ─── Mock data ─────────────────────────────────────────────────────── */
const MOCK_SALONS = [
    { id: 't1', name: 'Glam Studio', plan: 'pro', status: 'active' },
    { id: 't2', name: 'The Barber Room', plan: 'basic', status: 'trial' },
    { id: 't3', name: 'Luxe Cuts', plan: 'enterprise', status: 'active' },
    { id: 't4', name: 'Urban Aesthetics', plan: 'free', status: 'expired' },
    { id: 't5', name: 'Serenity Spa', plan: 'pro', status: 'suspended' },
    { id: 't6', name: 'Blossom Parlour', plan: 'basic', status: 'active' },
];


const MOCK_ERRORS = [
    { id: 'e001', level: 'error', message: 'Uncaught TypeError: Cannot read properties of undefined', tenant: 'Glam Studio', time: '2026-02-23 15:33:41', file: 'staff.controller.js:84', count: 3 },
    { id: 'e002', level: 'error', message: 'MongoServerError: E11000 duplicate key error', tenant: 'Luxe Cuts', time: '2026-02-23 14:12:30', file: 'client.service.js:201', count: 1 },
    { id: 'e003', level: 'warning', message: 'Rate limit threshold at 80% for tenant', tenant: 'Urban Aesthetics', time: '2026-02-23 13:55:10', file: 'rate-limiter.js:18', count: 12 },
    { id: 'e004', level: 'error', message: 'Payment webhook signature mismatch', tenant: 'Serenity Spa', time: '2026-02-23 12:44:05', file: 'payment.service.js:55', count: 2 },
    { id: 'e005', level: 'info', message: 'Background job took >5s: reports-generator', tenant: 'System', time: '2026-02-23 11:30:00', file: 'job-runner.js:102', count: 1 },
    { id: 'e006', level: 'warning', message: 'Low storage warning: tenant at 85% of quota', tenant: 'Blossom Parlour', time: '2026-02-22 18:20:15', file: 'storage.service.js:34', count: 5 },
];


const ERROR_CFG = {
    error: { cls: 'bg-red-50    text-red-600    border-red-200', icon: XCircle, dot: 'bg-red-500' },
    warning: { cls: 'bg-amber-50  text-amber-600  border-amber-200', icon: AlertTriangle, dot: 'bg-amber-500' },
    info: { cls: 'bg-blue-50   text-blue-600   border-blue-200', icon: Info, dot: 'bg-blue-500' },
};

/* ─── Impersonate panel ─────────────────────────────────────────────── */
function ImpersonatePanel({ onToast }) {
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const salon = MOCK_SALONS.find(s => s.id === selected);

    const handleImpersonate = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1400));
        setLoading(false);
        setDone(true);
        onToast(`Now impersonating "${salon.name}" — audit log recorded.`, 'info');
        setTimeout(() => setDone(false), 3000);
    };

    const statusCls = { active: 'text-emerald-600', trial: 'text-blue-600', expired: 'text-orange-600', suspended: 'text-red-600' };

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <LogIn className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                    <h3 className="font-bold text-text text-sm">Impersonate Salon Login</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">Login as a tenant to debug issues — all actions are audit-logged</p>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Select Salon</label>
                        <CustomDropdown
                            variant="form"
                            value={selected}
                            onChange={v => setSelected(v)}
                            placeholder="All Status"
                            options={[
                                { value: '', label: '— Choose a salon —' },
                                ...MOCK_SALONS.map(s => ({
                                    value: s.id,
                                    label: `${s.name} (${s.plan})`,
                                    icon: s.plan === 'pro' || s.plan === 'enterprise' ? Crown : Building2
                                }))
                            ]}
                        />
                    </div>

                    {salon && (
                        <div className="bg-surface rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-black text-primary">
                                    {salon.name[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-text">{salon.name}</div>
                                    <div className={`text-xs font-semibold capitalize ${statusCls[salon.status]}`}>{salon.status} · {salon.plan}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {salon?.status === 'suspended' && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Salon is suspended — impersonating may have limited access.
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-amber-700">
                    <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span><strong>Security Notice:</strong> Impersonation sessions are fully logged with your Super Admin ID, timestamp, and IP address. All actions taken will be attributed to the salon owner.</span>
                </div>

                <button onClick={handleImpersonate} disabled={!selected || loading || salon?.status === 'suspended'}
                    className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                    {loading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Authenticating…</>
                    ) : done ? (
                        <><CheckCircle className="w-4 h-4" /> Session Active</>
                    ) : (
                        <><LogIn className="w-4 h-4" /> Login as {salon ? salon.name : 'Salon'}</>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SASupportPage() {
    const [tab, setTab] = useState('impersonate');
    const [errLevel, setErrLevel] = useState('');
    const [toast, setToast] = useState(null);
    const [clearing, setClearing] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };


    const filteredErrors = MOCK_ERRORS.filter(e =>
        !errLevel || e.level === errLevel
    );

    const handleForceLogout = async () => {
        if (!confirm('Force logout ALL active users from all salons? This will clear every session.')) return;
        setClearing(true);
        await new Promise(r => setTimeout(r, 1500));
        setClearing(false);
        showToast('All sessions cleared — users will need to re-login.', 'error');
    };

    const TABS = [
        { id: 'impersonate', icon: LogIn, label: 'Impersonate' },
        { id: 'errors', icon: Bug, label: 'Error Tracker' },
    ];

    return (
        <div className="space-y-5 pb-8">

            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Support Tools</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Impersonate salons and track platform errors</p>
                </div>
                <button onClick={handleForceLogout} disabled={clearing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-md shadow-red-500/20 active:scale-[0.98] disabled:opacity-60">
                    {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {clearing ? 'Clearing…' : 'Force Logout All'}
                </button>
            </div>

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Error Rate', value: '0.8%', icon: Bug, color: 'text-red-600    bg-red-50' },
                    { label: 'Avg Response', value: '187ms', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Active Sessions', value: '312', icon: Users, color: 'text-violet-600  bg-violet-50' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-border shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-text">{s.value}</div>
                            <div className="text-xs text-text-muted">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-text-secondary border border-border hover:border-primary/30 hover:text-primary'
                            }`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ════ TAB: IMPERSONATE ════ */}
            {tab === 'impersonate' && (
                <div className="space-y-5">
                    <ImpersonatePanel onToast={showToast} />

                    {/* Recent impersonation log */}
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                            <Shield className="w-4 h-4 text-text-muted" />
                            <h3 className="font-bold text-text text-sm">Recent Impersonation Sessions</h3>
                        </div>
                        <div className="divide-y divide-border">
                            {[
                                { salon: 'Luxe Cuts', admin: 'Super Admin', time: '2026-02-22 14:30', duration: '12 min', reason: 'Payment issue debug' },
                                { salon: 'Glam Studio', admin: 'Super Admin', time: '2026-02-21 11:15', duration: '5 min', reason: 'Staff permission check' },
                                { salon: 'Serenity Spa', admin: 'Super Admin', time: '2026-02-20 09:00', duration: '3 min', reason: 'Suspension review' },
                            ].map((s, i) => (
                                <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-surface/40 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                        {s.salon[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-text">{s.salon}</div>
                                        <div className="text-xs text-text-muted">by {s.admin} · {s.duration} · {s.reason}</div>
                                    </div>
                                    <span className="text-[11px] text-text-muted font-mono shrink-0">{s.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            {/* ════ TAB: ERROR TRACKER ════ */}
            {tab === 'errors' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <CustomDropdown
                            value={errLevel}
                            onChange={setErrLevel}
                            placeholder="All Levels"
                            options={[
                                { value: '', label: 'All Levels' },
                                { value: 'error', label: 'Error', icon: XCircle },
                                { value: 'warning', label: 'Warning', icon: AlertTriangle },
                                { value: 'info', label: 'Info', icon: Info },
                            ]}
                        />
                        <span className="text-xs text-text-muted ml-auto">{filteredErrors.length} events tracked</span>
                        <button onClick={() => showToast('Error log exported!', 'info')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm font-semibold hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>

                    <div className="space-y-3">
                        {filteredErrors.map(e => {
                            const cfg = ERROR_CFG[e.level];
                            return (
                                <div key={e.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.cls} group hover:shadow-md transition-all`}>
                                    <div className="mt-0.5 shrink-0">
                                        <cfg.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-text leading-tight">{e.message}</p>
                                            {e.count > 1 && (
                                                <span className="text-[10px] font-black bg-white/80 border border-current px-2 py-0.5 rounded-full shrink-0">
                                                    ×{e.count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="text-[11px] font-mono opacity-70">{e.file}</span>
                                            <span className="text-[11px] font-semibold">Tenant: {e.tenant}</span>
                                            <span className="text-[11px] opacity-70 ml-auto">{e.time}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => showToast(`Error ${e.id} resolved.`)}
                                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/50 transition-all">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {filteredErrors.length === 0 && (
                        <div className="text-center py-16">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <p className="text-text-secondary font-semibold">No errors at this level</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
