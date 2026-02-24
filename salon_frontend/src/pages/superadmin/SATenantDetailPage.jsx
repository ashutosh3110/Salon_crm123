import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, MapPin, Phone, Mail, Users, Home,
    Crown, Clock, CheckCircle, XCircle, AlertTriangle,
    Edit3, Ban, LogIn, Trash2, RefreshCw, Key,
    CalendarDays, CreditCard, BarChart2, Layers, FileText,
    ScrollText, TrendingUp, Zap, ChevronRight,
} from 'lucide-react';

/* ─── Full mock dataset (same IDs as list) ─────────────────────────────── */
const MOCK_DB = {
    t1: {
        _id: 't1', name: 'Glam Studio', slug: 'glam-studio',
        ownerName: 'Priya Shah', email: 'priya@glam.com', phone: '9876543210',
        city: 'Mumbai', address: '14 Linking Road, Bandra West, Mumbai 400050',
        subscriptionPlan: 'pro', status: 'active',
        outletsCount: 3, staffCount: 12, trialDays: 0,
        createdAt: '2026-01-15T10:00:00Z',
        mrr: 4999, totalRevenue: 14997,
        features: { pos: true, inventory: true, marketing: true, payroll: false, crm: true, mobileApp: true, reports: true, whatsapp: false, loyalty: true },
        limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 10 },
        outlets: [
            { id: 'o1', name: 'Bandra Main', address: '14 Linking Rd, Bandra', staff: 5, status: 'active' },
            { id: 'o2', name: 'Juhu Branch', address: '22 Juhu Tara Rd', staff: 4, status: 'active' },
            { id: 'o3', name: 'Andheri', address: '8 Marol MIDC', staff: 3, status: 'active' },
        ],
        staff: [
            { id: 's1', name: 'Riya Mehta', role: 'Stylist', outlet: 'Bandra Main', status: 'active' },
            { id: 's2', name: 'Ananya Roy', role: 'Receptionist', outlet: 'Bandra Main', status: 'active' },
            { id: 's3', name: 'Kiran Das', role: 'Manager', outlet: 'Juhu Branch', status: 'active' },
            { id: 's4', name: 'Pooja Singh', role: 'Stylist', outlet: 'Andheri', status: 'inactive' },
        ],
        billing: [
            { id: 'b1', date: '2026-02-01', amount: 4999, plan: 'Pro', status: 'paid', invoice: 'INV-0023' },
            { id: 'b2', date: '2026-01-01', amount: 4999, plan: 'Pro', status: 'paid', invoice: 'INV-0011' },
            { id: 'b3', date: '2025-12-01', amount: 2999, plan: 'Basic', status: 'paid', invoice: 'INV-0004' },
        ],
        logs: [
            { id: 'l1', time: '2026-02-22 14:32', action: 'Plan upgraded: Basic → Pro', actor: 'Super Admin' },
            { id: 'l2', time: '2026-02-15 09:10', action: 'New outlet added: Andheri', actor: 'Priya Shah' },
            { id: 'l3', time: '2026-01-15 10:00', action: 'Salon registered', actor: 'System' },
        ],
    },
    t2: {
        _id: 't2', name: 'The Barber Room', slug: 'barber-room',
        ownerName: 'Raj Mehta', email: 'raj@barber.com', phone: '9123456780',
        city: 'Delhi', address: '7 Connaught Place, New Delhi 110001',
        subscriptionPlan: 'basic', status: 'trial',
        outletsCount: 1, staffCount: 4, trialDays: 8,
        createdAt: '2026-02-10T08:30:00Z',
        mrr: 0, totalRevenue: 0,
        features: { pos: true, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: true, whatsapp: false, loyalty: false },
        limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 2 },
        outlets: [{ id: 'o1', name: 'Main Branch', address: '7 Connaught Place', staff: 4, status: 'active' }],
        staff: [
            { id: 's1', name: 'Raj Mehta', role: 'Manager', outlet: 'Main Branch', status: 'active' },
            { id: 's2', name: 'Vikram Bose', role: 'Barber', outlet: 'Main Branch', status: 'active' },
        ],
        billing: [],
        logs: [
            { id: 'l1', time: '2026-02-10 08:30', action: 'Salon registered — 14-day trial started', actor: 'System' },
        ],
    },
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const STATUS_CFG = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
    trial: { label: 'Trial', cls: 'bg-blue-50 text-blue-600 border-blue-200', icon: Clock },
    expired: { label: 'Expired', cls: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle },
    suspended: { label: 'Suspended', cls: 'bg-red-50 text-red-600 border-red-200', icon: XCircle },
};

const FEATURE_LIST = [
    { key: 'pos', label: 'POS' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'payroll', label: 'Payroll' },
    { key: 'crm', label: 'CRM' },
    { key: 'mobileApp', label: 'Mobile App' },
    { key: 'reports', label: 'Reports' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'loyalty', label: 'Loyalty' },
];

const BILLING_STATUS = {
    paid: 'bg-emerald-50 text-emerald-600',
    failed: 'bg-red-50 text-red-600',
    refunded: 'bg-orange-50 text-orange-600',
};

/* ─── Tab button ─────────────────────────────────────────────────────── */
function Tab({ id, active, icon: Icon, label, onClick }) {
    return (
        <button onClick={() => onClick(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface'
                }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ─── Action button ──────────────────────────────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = 'default' }) {
    const varCls = {
        default: 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary',
        danger: 'bg-white text-red-500 border-red-100 hover:bg-red-50',
        primary: 'bg-primary text-white border-primary hover:brightness-110 shadow-lg shadow-primary/20',
        blue: 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50',
    };
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${varCls[variant]}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SATenantDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState('info');
    const [toast, setToast] = useState(null);

    const t = MOCK_DB[id] || {
        ...MOCK_DB.t1,
        _id: id,
        name: 'Unknown Salon',
        ownerName: 'Unknown',
        email: 'unknown@salon.com',
    };

    const sc = STATUS_CFG[t.status] || STATUS_CFG.active;

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const TABS = [
        { id: 'info', icon: Building2, label: 'Info' },
        { id: 'sub', icon: CreditCard, label: 'Subscription' },
        { id: 'usage', icon: BarChart2, label: 'Usage' },
        { id: 'outlets', icon: Home, label: 'Outlets' },
        { id: 'billing', icon: FileText, label: 'Billing' },
    ];

    return (
        <div className="space-y-5 pb-8">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4" /> {toast.msg}
                </div>
            )}

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
                <Link to="/superadmin/tenants" className="hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Salons
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-text font-semibold">{t.name}</span>
            </div>

            {/* ── Hero card ── */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {/* Accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-[#8B1A2D] to-amber-500" />

                <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#8B1A2D] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/30 shrink-0">
                        {t.name[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-xl font-black text-text">{t.name}</h1>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                                <sc.icon className="w-3 h-3" /> {sc.label}
                                {t.status === 'trial' && ` · ${t.trialDays}d left`}
                            </span>
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${planColors[t.subscriptionPlan] || planColors.free}`}>
                                {t.subscriptionPlan}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary font-mono mb-2">/{t.slug}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{t.email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{t.phone}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t.city}</span>
                            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />
                                Joined {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex gap-4 shrink-0">
                        {[
                            { label: 'Outlets', value: t.outletsCount, icon: Home },
                            { label: 'Staff', value: t.staffCount, icon: Users },
                            { label: 'MRR', value: `₹${(t.mrr || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-lg font-black text-text">{s.value}</div>
                                <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Action toolbar ── */}
                <div className="px-6 pb-5 flex flex-wrap gap-2">
                    <ActionBtn icon={Key} label="Reset Password" onClick={() => showToast('Reset email sent to ' + t.email)} />
                    <ActionBtn icon={Clock} label="Extend Trial" onClick={() => showToast('Trial extended by 7 days')} />
                    <ActionBtn icon={Edit3} label="Change Plan" onClick={() => showToast('Plan change modal — coming next phase', 'info')} variant="primary" />
                    <ActionBtn
                        icon={Ban}
                        label={t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        onClick={() => showToast(t.status === 'suspended' ? 'Salon reactivated' : 'Salon suspended')}
                        variant="danger"
                    />
                    <ActionBtn icon={RefreshCw} label="Force Logout" onClick={() => showToast('All sessions cleared')} variant="danger" />
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {TABS.map(t2 => (
                    <Tab key={t2.id} id={t2.id} active={tab === t2.id} icon={t2.icon} label={t2.label} onClick={setTab} />
                ))}
            </div>

            {/* ══ TAB CONTENT ══ */}

            {/* INFO */}
            {tab === 'info' && (
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Salon Information</h3>
                        {[
                            { label: 'Salon Name', value: t.name },
                            { label: 'Owner', value: t.ownerName },
                            { label: 'Email', value: t.email },
                            { label: 'Phone', value: t.phone },
                            { label: 'City', value: t.city },
                            { label: 'Full Address', value: t.address },
                            { label: 'Slug', value: `/${t.slug}`, mono: true },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between gap-4">
                                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider shrink-0">{r.label}</span>
                                <span className={`text-sm text-text text-right ${r.mono ? 'font-mono text-primary' : ''}`}>{r.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Platform Metrics</h3>
                        {[
                            { label: 'Status', value: t.status.charAt(0).toUpperCase() + t.status.slice(1) },
                            { label: 'Plan', value: t.subscriptionPlan.toUpperCase() },
                            { label: 'Outlets', value: t.outletsCount },
                            { label: 'Staff Count', value: t.staffCount },
                            { label: 'Monthly Revenue', value: `₹${(t.mrr || 0).toLocaleString('en-IN')}` },
                            { label: 'Total Revenue', value: `₹${(t.totalRevenue || 0).toLocaleString('en-IN')}` },
                            { label: 'Joined', value: new Date(t.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) },
                        ].map(r => (
                            <div key={r.label} className="flex justify-between">
                                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{r.label}</span>
                                <span className="text-sm font-semibold text-text">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUBSCRIPTION */}
            {tab === 'sub' && (
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Current Plan</h3>
                        <div className={`inline-flex gap-2 items-center px-3 py-1.5 rounded-xl border text-sm font-bold uppercase ${planColors[t.subscriptionPlan] || planColors.free}`}>
                            <Crown className="w-4 h-4" /> {t.subscriptionPlan}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Limits</p>
                            {[
                                { label: 'Staff Limit', value: t.limits?.staffLimit ?? '—' },
                                { label: 'Outlet Limit', value: t.limits?.outletLimit ?? '—' },
                                { label: 'SMS Credits', value: t.limits?.smsCredits ?? '—' },
                                { label: 'Storage', value: t.limits?.storageGB ? `${t.limits.storageGB} GB` : '—' },
                            ].map(r => (
                                <div key={r.label} className="flex justify-between py-1.5 border-b border-border/50">
                                    <span className="text-sm text-text-secondary">{r.label}</span>
                                    <span className="text-sm font-bold text-text">{r.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                        <h3 className="font-bold text-text text-sm border-b border-border pb-2">Feature Access</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {FEATURE_LIST.map(f => (
                                <div key={f.key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${t.features?.[f.key]
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                    {t.features?.[f.key]
                                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                    }
                                    {f.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* USAGE */}
            {tab === 'usage' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Active Outlets', value: t.outlets?.filter(o => o.status === 'active').length ?? 0, max: t.limits?.outletLimit, icon: Home, color: 'from-blue-500 to-indigo-600' },
                        { label: 'Staff Members', value: t.staffCount, max: t.limits?.staffLimit, icon: Users, color: 'from-primary to-[#8B1A2D]' },
                        { label: 'Bookings (Month)', value: 284, max: null, icon: CalendarDays, color: 'from-emerald-500 to-teal-600' },
                    ].map(u => (
                        <div key={u.label} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <u.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-2xl font-black text-text">{u.value}</div>
                            <div className="text-xs text-text-muted mt-0.5">{u.label}{u.max ? ` / ${u.max} limit` : ''}</div>
                            {u.max && typeof u.value === 'number' && (
                                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${u.color} transition-all duration-700`}
                                        style={{ width: `${Math.min(100, (u.value / u.max) * 100)}%` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* OUTLETS */}
            {tab === 'outlets' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-text">Outlets ({t.outlets?.length ?? 0})</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {(t.outlets || []).map(o => (
                            <div key={o.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shrink-0">
                                        {o.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-text">{o.name}</div>
                                        <div className="text-xs text-text-muted">{o.address}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-xs text-text-secondary flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" /> {o.staff} staff
                                    </div>
                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${o.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* BILLING */}
            {tab === 'billing' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h3 className="font-bold text-text">Billing History</h3>
                    </div>
                    {!t.billing?.length ? (
                        <div className="text-center py-16">
                            <CreditCard className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
                            <p className="text-sm text-text-secondary">No billing history yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border">
                                        {['Invoice', 'Date', 'Plan', 'Amount', 'Status'].map(h => (
                                            <th key={h} className="text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {t.billing.map(b => (
                                        <tr key={b.id} className="hover:bg-surface/40 transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-mono text-primary">{b.invoice}</td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">{b.date}</td>
                                            <td className="px-5 py-3.5 text-sm text-text-secondary">{b.plan}</td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-text">₹{b.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${BILLING_STATUS[b.status]}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
