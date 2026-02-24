import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Building2, Search, Plus, Edit3, Ban, MoreVertical, X,
    CheckCircle, EyeIcon, ArrowUpRight, Trash2, LogIn,
    ChevronDown, Filter, RefreshCw, MapPin, Users, Home,
    Crown, Clock, AlertTriangle, XCircle, Layers,
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';

/* ─── Mock data ─────────────────────────────────────────────────────────── */
const MOCK_TENANTS = [
    { _id: 't1', name: 'Glam Studio', slug: 'glam-studio', ownerName: 'Priya Shah', email: 'priya@glam.com', phone: '9876543210', city: 'Mumbai', subscriptionPlan: 'pro', status: 'active', outletsCount: 3, staffCount: 12, trialDays: 0, createdAt: '2026-01-15T10:00:00Z' },
    { _id: 't2', name: 'The Barber Room', slug: 'barber-room', ownerName: 'Raj Mehta', email: 'raj@barber.com', phone: '9123456780', city: 'Delhi', subscriptionPlan: 'basic', status: 'trial', outletsCount: 1, staffCount: 4, trialDays: 8, createdAt: '2026-02-10T08:30:00Z' },
    { _id: 't3', name: 'Luxe Cuts', slug: 'luxe-cuts', ownerName: 'Sara Ali', email: 'sara@luxe.com', phone: '9988776655', city: 'Bangalore', subscriptionPlan: 'enterprise', status: 'active', outletsCount: 7, staffCount: 31, trialDays: 0, createdAt: '2025-11-20T14:15:00Z' },
    { _id: 't4', name: 'Urban Aesthetics', slug: 'urban-aesth', ownerName: 'Vikram Rao', email: 'vikram@urban.com', phone: '8877665544', city: 'Pune', subscriptionPlan: 'free', status: 'expired', outletsCount: 1, staffCount: 2, trialDays: 0, createdAt: '2025-09-05T09:00:00Z' },
    { _id: 't5', name: 'Serenity Spa', slug: 'serenity-spa', ownerName: 'Anita Kumar', email: 'anita@serenity.com', phone: '7766554433', city: 'Chennai', subscriptionPlan: 'pro', status: 'suspended', outletsCount: 2, staffCount: 8, trialDays: 0, createdAt: '2025-10-12T11:45:00Z' },
    { _id: 't6', name: 'Blossom Parlour', slug: 'blossom-parlour', ownerName: 'Kavya Nair', email: 'kavya@blossom.com', phone: '6655443322', city: 'Kochi', subscriptionPlan: 'basic', status: 'active', outletsCount: 2, staffCount: 6, trialDays: 0, createdAt: '2026-01-28T13:00:00Z' },
    { _id: 't7', name: 'Scissors & Style', slug: 'scissors-style', ownerName: 'Arun Patel', email: 'arun@scissors.com', phone: '5544332211', city: 'Ahmedabad', subscriptionPlan: 'pro', status: 'trial', outletsCount: 1, staffCount: 5, trialDays: 3, createdAt: '2026-02-18T16:00:00Z' },
    { _id: 't8', name: 'Elite Groom', slug: 'elite-groom', ownerName: 'Meena Singh', email: 'meena@elite.com', phone: '4433221100', city: 'Jaipur', subscriptionPlan: 'basic', status: 'active', outletsCount: 2, staffCount: 7, trialDays: 0, createdAt: '2025-12-01T09:30:00Z' },
];

const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50  text-blue-600  border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};
const planIcons = { free: null, basic: null, pro: Crown, premium: Crown, enterprise: Crown };

const STATUS_CFG = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle },
    trial: { label: 'Trial', cls: 'bg-blue-50   text-blue-600   border-blue-200', icon: Clock },
    expired: { label: 'Expired', cls: 'bg-orange-50 text-orange-600 border-orange-200', icon: AlertTriangle },
    suspended: { label: 'Suspended', cls: 'bg-red-50    text-red-600    border-red-200', icon: XCircle },
    inactive: { label: 'Inactive', cls: 'bg-slate-100 text-slate-500  border-slate-200', icon: null },
};

const FILTER_TABS = [
    { key: '', label: 'All', icon: Layers },
    { key: 'active', label: 'Active', icon: CheckCircle },
    { key: 'trial', label: 'Trial', icon: Clock },
    { key: 'expired', label: 'Expired', icon: AlertTriangle },
    { key: 'suspended', label: 'Suspended', icon: XCircle },
];

/* ─── Row action dropdown ─────────────────────────────────────────────────── */
function ActionMenu({ tenant, onEdit, onSuspend, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const actions = [
        { label: 'View Profile', icon: EyeIcon, href: `/superadmin/tenants/${tenant._id}`, color: 'text-text-secondary', hover: 'hover:text-primary hover:bg-primary/5' },
        { label: 'Edit Details', icon: Edit3, onClick: () => { onEdit(tenant); setOpen(false); }, color: 'text-text-secondary', hover: 'hover:text-primary hover:bg-primary/5' },
        { label: 'Upgrade Plan', icon: ArrowUpRight, onClick: () => { onEdit(tenant, 'plan'); setOpen(false); }, color: 'text-amber-600', hover: 'hover:bg-amber-50' },
        { divider: true },
        {
            label: tenant.status === 'suspended' ? 'Reactivate Salon' : 'Suspend Salon',
            icon: Ban, onClick: () => { onSuspend(tenant); setOpen(false); },
            color: tenant.status === 'suspended' ? 'text-emerald-600' : 'text-orange-500',
            hover: tenant.status === 'suspended' ? 'hover:bg-emerald-50' : 'hover:bg-orange-50'
        },
        { label: 'Delete Permanently', icon: Trash2, onClick: () => { onDelete(tenant); setOpen(false); }, color: 'text-red-500', hover: 'hover:bg-red-50' },
    ];

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 rounded-xl transition-all duration-200 ${open ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-95' : 'bg-white border border-border text-text-muted hover:text-primary hover:border-primary/30 hover:shadow-md'}`}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Salon Actions</p>
                    </div>
                    {actions.map((a, i) => (
                        a.divider ? (
                            <div key={`d-${i}`} className="h-px bg-border/50 my-1 mx-2" />
                        ) : a.href ? (
                            <Link key={a.label} to={a.href}
                                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all ${a.color} ${a.hover} m-1 rounded-xl`}
                                onClick={() => setOpen(false)}>
                                <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center shrink-0">
                                    <a.icon className="w-3.5 h-3.5" />
                                </div>
                                {a.label}
                            </Link>
                        ) : (
                            <button key={a.label} onClick={a.onClick}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all ${a.color} ${a.hover} m-1 rounded-xl`}>
                                <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center shrink-0">
                                    <a.icon className="w-3.5 h-3.5" />
                                </div>
                                {a.label}
                            </button>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Create / Edit Salon Modal ──────────────────────────────────────────── */
function SalonModal({ mode, tenant, onClose, onSave, saving }) {
    const [form, setForm] = useState({
        name: tenant?.name || '',
        ownerName: tenant?.ownerName || '',
        email: tenant?.email || '',
        phone: tenant?.phone || '',
        city: tenant?.city || '',
        subscriptionPlan: tenant?.subscriptionPlan || 'basic',
        status: tenant?.status || 'trial',
        trialDays: tenant?.trialDays ?? 14,
        outletsCount: tenant?.outletsCount || 1,
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm';
    const labelCls = 'block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h3 className="text-base font-bold text-text">
                            {mode === 'create' ? 'Create New Salon' : 'Edit Salon'}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            {mode === 'create' ? 'Fill in details to onboard a new salon' : 'Update salon information'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelCls}>Salon Name *</label>
                            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Glam Studio" required />
                        </div>
                        <div>
                            <label className={labelCls}>Owner Name *</label>
                            <input className={inputCls} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Full name" required />
                        </div>
                        <div>
                            <label className={labelCls}>Email *</label>
                            <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="owner@salon.com" required />
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <input type="tel" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit number" />
                        </div>
                        <div>
                            <label className={labelCls}>City</label>
                            <input className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai, Delhi…" />
                        </div>
                        <div>
                            <label className={labelCls}>Plan</label>
                            <CustomDropdown
                                variant="form"
                                value={form.subscriptionPlan}
                                onChange={v => set('subscriptionPlan', v)}
                                options={[
                                    { value: 'free', label: 'Free' },
                                    { value: 'basic', label: 'Basic' },
                                    { value: 'pro', label: 'Pro' },
                                    { value: 'enterprise', label: 'Enterprise' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Status</label>
                            <CustomDropdown
                                variant="form"
                                value={form.status}
                                onChange={v => set('status', v)}
                                options={[
                                    { value: 'trial', label: 'Trial', icon: Clock },
                                    { value: 'active', label: 'Active', icon: CheckCircle },
                                    { value: 'expired', label: 'Expired', icon: AlertTriangle },
                                    { value: 'suspended', label: 'Suspended', icon: XCircle },
                                ]}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Trial Days</label>
                            <input type="number" min={0} max={90} className={inputCls} value={form.trialDays} onChange={e => set('trialDays', +e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Outlet Count</label>
                            <input type="number" min={1} max={100} className={inputCls} value={form.outletsCount} onChange={e => set('outletsCount', +e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.ownerName || !form.email}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                        {saving ? 'Saving…' : mode === 'create' ? 'Create Salon' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function SATenantsPage() {
    const navigate = useNavigate();
    const [tenants, setTenants] = useState(MOCK_TENANTS);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('');
    const [planFilter, setPlan] = useState('');
    const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', tenant? }
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* live filter */
    const filtered = tenants.filter(t => {
        const q = search.toLowerCase();
        const matchQ = !q || t.name.toLowerCase().includes(q) || t.ownerName.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
        const matchS = !statusFilter || t.status === statusFilter;
        const matchP = !planFilter || t.subscriptionPlan === planFilter;
        return matchQ && matchS && matchP;
    });

    /* counts for tab badges */
    const counts = FILTER_TABS.reduce((acc, f) => {
        acc[f.key] = f.key ? tenants.filter(t => t.status === f.key).length : tenants.length;
        return acc;
    }, {});

    /* handlers */
    const handleSave = async (form) => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 600)); // mock
        if (modal.mode === 'create') {
            const newT = { ...form, _id: 't' + Date.now(), slug: form.name.toLowerCase().replace(/\s+/g, '-'), staffCount: 0, createdAt: new Date().toISOString() };
            setTenants(p => [newT, ...p]);
            showToast(`Salon "${form.name}" created!`);
        } else {
            setTenants(p => p.map(t => t._id === modal.tenant._id ? { ...t, ...form } : t));
            showToast(`"${form.name}" updated!`);
        }
        setSaving(false);
        setModal(null);
    };

    const handleSuspend = async (tenant) => {
        const action = tenant.status === 'suspended' ? 'reactivate' : 'suspend';
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${tenant.name}"?`)) return;
        setTenants(p => p.map(t => t._id === tenant._id
            ? { ...t, status: tenant.status === 'suspended' ? 'active' : 'suspended' } : t));
        showToast(`Salon ${action}d successfully.`);
    };

    const handleDelete = async (tenant) => {
        if (!confirm(`Permanently delete "${tenant.name}"? This cannot be undone.`)) return;
        setTenants(p => p.filter(t => t._id !== tenant._id));
        showToast(`Salon deleted.`, 'error');
    };

    const handleImpersonate = (tenant) => {
        showToast(`Impersonating "${tenant.name}" — feature logs audit trail.`, 'info');
    };

    return (
        <div className="space-y-5 pb-8">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {toast.msg}
                </div>
            )}

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Salon Management</h1>
                    <p className="text-sm text-text-secondary mt-0.5">Manage all onboarded salons — {tenants.length} total</p>
                </div>
                <button
                    onClick={() => setModal({ mode: 'create' })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> Create Salon
                </button>
            </div>

            {/* ── Status filter tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTER_TABS.map(f => (
                    <button key={f.key}
                        onClick={() => setStatus(f.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === f.key
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                            : 'bg-white text-text-secondary border-border hover:border-primary/30 hover:text-primary'
                            }`}>
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
                            }`}>{counts[f.key]}</span>
                    </button>
                ))}
            </div>

            {/* ── Search + plan filter ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, owner, city, email…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                </div>
                <CustomDropdown
                    value={planFilter}
                    onChange={setPlan}
                    placeholder="All Plans"
                    options={[
                        { value: '', label: 'All Plans' },
                        { value: 'free', label: 'Free' },
                        { value: 'basic', label: 'Basic' },
                        { value: 'pro', label: 'Pro' },
                        { value: 'enterprise', label: 'Enterprise' },
                    ]}
                />
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
                        <p className="text-text-secondary font-semibold">No salons found</p>
                        <p className="text-xs text-text-muted mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface/60 border-b border-border">
                                    {['Salon', 'Owner', 'City', 'Outlets', 'Plan', 'Status', 'Staff', 'Joined', ''].map(h => (
                                        <th key={h} className={`text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 ${h === '' ? 'text-right' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(t => {
                                    const sc = STATUS_CFG[t.status] || STATUS_CFG.inactive;
                                    return (
                                        <tr key={t._id} className="hover:bg-surface/40 transition-colors group">
                                            {/* Salon */}
                                            <td className="px-4 py-3.5">
                                                <Link to={`/superadmin/tenants/${t._id}`} className="flex items-center gap-3 group/link">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary shrink-0 group-hover/link:bg-primary group-hover/link:text-white transition-all">
                                                        {t.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-text group-hover/link:text-primary transition-colors">{t.name}</div>
                                                        <div className="text-[11px] text-text-muted font-mono">{t.slug}</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            {/* Owner */}
                                            <td className="px-4 py-3.5">
                                                <div className="text-sm text-text-secondary">{t.ownerName}</div>
                                                <div className="text-[11px] text-text-muted">{t.email}</div>
                                            </td>
                                            {/* City */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                    {t.city}
                                                </div>
                                            </td>
                                            {/* Outlets */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                    <Home className="w-3.5 h-3.5 text-text-muted" />
                                                    {t.outletsCount}
                                                </div>
                                            </td>
                                            {/* Plan */}
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase ${planColors[t.subscriptionPlan] || planColors.free}`}>
                                                    {t.subscriptionPlan}
                                                </span>
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${sc.cls}`}>
                                                    <sc.icon className="w-3 h-3" />
                                                    {sc.label}
                                                    {t.status === 'trial' && t.trialDays > 0 && (
                                                        <span className="ml-0.5 opacity-70">({t.trialDays}d)</span>
                                                    )}
                                                </span>
                                            </td>
                                            {/* Staff */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                    <Users className="w-3.5 h-3.5 text-text-muted" />
                                                    {t.staffCount}
                                                </div>
                                            </td>
                                            {/* Joined */}
                                            <td className="px-4 py-3.5">
                                                <span className="text-sm text-text-muted whitespace-nowrap">
                                                    {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3.5 text-right">
                                                <ActionMenu
                                                    tenant={t}
                                                    onEdit={(ten) => setModal({ mode: 'edit', tenant: ten })}
                                                    onSuspend={handleSuspend}
                                                    onDelete={handleDelete}
                                                    onImpersonate={handleImpersonate}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Result count */}
            {filtered.length > 0 && (
                <p className="text-xs text-text-muted text-right">
                    Showing {filtered.length} of {tenants.length} salons
                </p>
            )}

            {/* ── Modal ── */}
            {modal && (
                <SalonModal
                    mode={modal.mode}
                    tenant={modal.tenant}
                    saving={saving}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
