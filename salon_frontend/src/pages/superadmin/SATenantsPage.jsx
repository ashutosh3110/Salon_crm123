import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Building2, Search, Plus, Edit3, Ban, MoreVertical, X,
    CheckCircle, EyeIcon, ArrowUpRight, Trash2, LogIn,
    ChevronDown, Filter, RefreshCw, MapPin, Users, Home,
    Crown, Clock, AlertTriangle, XCircle, Layers, Calendar,
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import { exportToExcel } from '../../utils/exportUtils';
import { Download } from 'lucide-react';

/* ─── Date filter helper ────────────────────────────────────────── */
const DATE_PERIODS = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
];

function isInPeriod(dateStr, period, customFrom, customTo) {
    if (!dateStr || period === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (period === 'today') {
        return d.toDateString() === now.toDateString();
    }
    if (period === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return d >= start && d <= now;
    }
    if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === 'custom') {
        const from = customFrom ? new Date(customFrom) : null;
        const to = customTo ? new Date(customTo + 'T23:59:59') : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
    }
    return true;
}

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
    free: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    basic: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
    enterprise: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
};
const planIcons = { free: null, basic: null, pro: Crown, premium: Crown, enterprise: Crown };

const STATUS_CFG = {
    active: { label: 'Active', cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: CheckCircle },
    trial: { label: 'On Trial', cls: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Clock },
    expired: { label: 'Ended', cls: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800', icon: AlertTriangle },
    suspended: { label: 'Paused', cls: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800', icon: XCircle },
    inactive: { label: 'Inactive', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700', icon: null },
};

const FILTER_TABS = [
    { key: '', label: 'All', icon: Layers },
    { key: 'active', label: 'Active', icon: CheckCircle },
    { key: 'trial', label: 'On Trial', icon: Clock },
    { key: 'expired', label: 'Ended', icon: AlertTriangle },
    { key: 'suspended', label: 'Paused', icon: XCircle },
];

/* ─── Row action dropdown ─────────────────────────────────────────────────── */
function ActionMenu({ tenant, onEdit, onSuspend, onDelete, onResendCredentials }) {
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
            label: tenant.status === 'suspended' ? 'Start Salon Again' : 'Pause Salon',
            icon: Ban, onClick: () => { onSuspend(tenant); setOpen(false); },
            color: tenant.status === 'suspended' ? 'text-emerald-600' : 'text-orange-500',
            hover: tenant.status === 'suspended' ? 'hover:bg-emerald-50' : 'hover:bg-orange-50'
        },
        { label: 'Delete Account', icon: Trash2, onClick: () => { onDelete(tenant); setOpen(false); }, color: 'text-red-500', hover: 'hover:bg-red-50' },
        { divider: true },
        { 
            label: 'Resend Credentials', 
            icon: RefreshCw, 
            onClick: () => { onResendCredentials(tenant); setOpen(false); }, 
            color: 'text-indigo-600', 
            hover: 'hover:bg-indigo-50' 
        },
    ];

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 rounded-xl transition-all duration-200 ${open ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-95' : 'bg-surface border border-border text-text-muted hover:text-primary hover:border-primary/30 hover:shadow-md'}`}
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-2xl shadow-2xl z-[100] py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
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
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all ${a.color} ${a.hover} dark:hover:bg-surface-alt m-1 rounded-xl`}>
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

/* ─── Plan Change Modal (Fast Access) ─────────────────────────────────────── */
function PlanChangeModal({ tenant, onClose, onSave }) {
    if (!tenant) return null;
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-surface rounded-2xl border border-border w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-text truncate max-w-[200px]">Upgrade {tenant.name}</h3>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Assign new subscription tier</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors">
                        <XCircle className="w-5 h-5 text-text-muted" />
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    {[
                        { id: 'free', name: 'Free Starter', price: 0, color: 'slate' },
                        { id: 'basic', name: 'Basic Growth', price: 1999, color: 'blue' },
                        { id: 'pro', name: 'Pro Business', price: 4999, color: 'primary' },
                        { id: 'enterprise', name: 'Enterprise Power', price: 12999, color: 'amber' },
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => onSave(tenant._id, p.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${tenant.subscriptionPlan === p.id
                                ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/10'
                                : 'border-border hover:border-primary/40 hover:bg-surface/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${planColors[p.color]}`}>
                                    <Crown className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-bold text-text">{p.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-text">₹{p.price.toLocaleString('en-IN')}</div>
                                <div className="text-[9px] text-text-muted font-bold">MONTHLY</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── City Autocomplete Component ────────────────────────────────────────── */
const INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Prayagraj", "Howrah", "Ranchi", "Gwalior", "Jabalpur"
];

function CityAutocomplete({ value, onChange, labelCls, inputCls }) {
    const [suggestions, setSuggestions] = useState([]);
    const [show, setShow] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleInput = (val) => {
        onChange(val);
        if (val.length > 0) {
            const filtered = INDIAN_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 3);
            setSuggestions(filtered);
            setShow(true);
        } else {
            setSuggestions([]);
            setShow(false);
        }
    };

    return (
        <div ref={ref} className="relative">
            <label className={labelCls}>City</label>
            <input
                className={inputCls}
                value={value}
                onChange={e => handleInput(e.target.value)}
                placeholder="Type city name..."
                onFocus={() => value.length > 0 && setShow(true)}
            />
            {show && suggestions.length > 0 && (
                <div className="absolute z-[100] left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => { onChange(s); setShow(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-text hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between group"
                        >
                            {s}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
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
        address: tenant?.address || '',
        description: tenant?.description || '',
        subscriptionPlan: tenant?.subscriptionPlan || 'basic',
        status: tenant?.status || 'trial',
        trialDays: tenant?.trialDays ?? 14,
        outletsCount: tenant?.outletsCount || 1,
        gstNumber: tenant?.gstNumber || '',
    });

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const inputCls = 'w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm';
    const labelCls = 'block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
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
                <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-surface-alt/30">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">Business Identity</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelCls}>Salon Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input className={`${inputCls} pl-10`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Glam Studio" required />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Brief Description</label>
                                <textarea 
                                    className={`${inputCls} min-h-[80px] py-3 resize-none`} 
                                    value={form.description} 
                                    onChange={e => set('description', e.target.value)} 
                                    placeholder="Enter a brief summary of the salon's specialties..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact & Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">Contact & Location</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                <input type="tel" className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 00000 00000" />
                            </div>
                            <div>
                                <label className={labelCls}>GST Number</label>
                                <input className={inputCls} value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} placeholder="15-digit GSTIN" />
                            </div>
                            <div className="col-span-2">
                                <label className={labelCls}>Street Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted" />
                                    <textarea 
                                        className={`${inputCls} pl-10 min-h-[70px] py-2.5 resize-none`} 
                                        value={form.address} 
                                        onChange={e => set('address', e.target.value)} 
                                        placeholder="Full shop address, street, landmark..."
                                    />
                                </div>
                            </div>
                            <CityAutocomplete value={form.city} onChange={v => set('city', v)} labelCls={labelCls} inputCls={inputCls} />
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
                                <label className={labelCls}>Allowed Outlets</label>
                                <input type="number" min={1} max={100} className={inputCls} value={form.outletsCount} onChange={e => set('outletsCount', +e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings (Edit Only) */}
                    {mode === 'edit' && (
                        <div className="space-y-4 pb-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider text-indigo-500">Subscription Control</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                <div className="col-span-1">
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
                                <div className="col-span-1">
                                    <label className={labelCls}>Trial Days</label>
                                    <input type="number" min={0} max={90} className={inputCls} value={form.trialDays} onChange={e => set('trialDays', +e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.ownerName || !form.email}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-primary-foreground text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
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
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('');
    const [planFilter, setPlan] = useState('');
    const [datePeriod, setDatePeriod] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit'|'plan', tenant? }
    const [planModalData, setPlanModalData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalPages: 1, totalResults: 0, limit: 10 });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    /* fetch data */
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/tenants/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenants();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [search, statusFilter, planFilter, datePeriod, customFrom, customTo, page]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, planFilter, datePeriod, customFrom, customTo]);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            let startDate, endDate;
            const now = new Date();

            if (datePeriod === 'today') {
                startDate = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
                endDate = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
            } else if (datePeriod === 'week') {
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                startDate = new Date(start.setHours(0, 0, 0, 0)).toISOString();
                endDate = new Date().toISOString();
            } else if (datePeriod === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                endDate = new Date().toISOString();
            } else if (datePeriod === 'custom') {
                startDate = customFrom ? new Date(customFrom).toISOString() : undefined;
                endDate = customTo ? new Date(customTo + 'T23:59:59').toISOString() : undefined;
            }

            const params = {
                search: search || undefined,
                status: statusFilter || undefined,
                subscriptionPlan: planFilter || undefined,
                startDate,
                endDate,
                page,
                limit: 10
            };
            const response = await api.get('/tenants', { params });
            const data = response.data.data;
            if (data && data.results) {
                setTenants(data.results);
                setMeta({
                    totalPages: data.totalPages,
                    totalResults: data.totalResults,
                    limit: data.limit
                });
            } else {
                setTenants(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching tenants:', error);
            showToast('Failed to load salons.', 'error');
        } finally {
            setLoading(false);
        }
    };

    /* Display list is now directly the tenants array from backend */
    const filtered = tenants;

    /* Date filter toggle button + collapsible panel */
    const isDateFiltered = datePeriod !== 'all';
    const activePeriodLabel = DATE_PERIODS.find(p => p.value === datePeriod)?.label || 'All';

    const FilterToggleBtn = (
        <button
            onClick={() => setShowDateFilter(v => !v)}
            className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${showDateFilter || isDateFiltered
                    ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
                    : 'bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-primary'
                }`}
        >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{isDateFiltered ? activePeriodLabel : 'Filter'}</span>
            {isDateFiltered && !showDateFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
            )}
        </button>
    );

    const DateFilterPanel = showDateFilter && (
        <div className="bg-surface rounded-2xl border border-primary/20 shadow-lg px-4 py-3.5 flex flex-wrap items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider mr-1">Period:</span>
            {DATE_PERIODS.map(p => (
                <button
                    key={p.value}
                    onClick={() => { setDatePeriod(p.value); if (p.value !== 'custom') { setCustomFrom(''); setCustomTo(''); } }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${datePeriod === p.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                            : 'bg-surface text-text-secondary border-border hover:border-primary/40 hover:text-primary'
                        }`}
                >
                    {p.label}
                </button>
            ))}
            {datePeriod === 'custom' && (
                <div className="flex items-center gap-2 ml-1">
                    <input
                        type="date"
                        value={customFrom}
                        onChange={e => setCustomFrom(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <span className="text-xs text-text-muted font-semibold">to</span>
                    <input
                        type="date"
                        value={customTo}
                        onChange={e => setCustomTo(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            )}
            {isDateFiltered && (
                <button
                    onClick={() => { setDatePeriod('all'); setCustomFrom(''); setCustomTo(''); setShowDateFilter(false); }}
                    className="ml-auto flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                >
                    <X className="w-3 h-3" /> Clear
                </button>
            )}
        </div>
    );

    /* counts for tab badges from backend stats */
    const counts = {
        '': stats?.totalSalons || 0,
        active: stats?.countsByStatus?.find(v => v._id === 'active')?.count || 0,
        trial: stats?.countsByStatus?.find(v => v._id === 'trial')?.count || 0,
        expired: stats?.countsByStatus?.find(v => v._id === 'expired')?.count || 0,
        suspended: stats?.countsByStatus?.find(v => v._id === 'suspended')?.count || 0,
    };

    /* handlers */
    const handleSave = async (form) => {
        /* Basic Frontend Validation */
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        if (form.gstNumber) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(form.gstNumber)) {
                showToast('Invalid GST format. (e.g. 22AAAAA0000A1Z5)', 'error');
                return;
            }
        }

        setSaving(true);
        try {
            if (modal.mode === 'create') {
                await api.post('/tenants', form);
                showToast(`Salon "${form.name}" created!`);
            } else {
                await api.put(`/tenants/${modal.tenant._id}`, form);
                showToast(`"${form.name}" updated!`);
            }
            await fetchTenants();
            await fetchStats(); // Update badges after save
            setModal(null);
        } catch (error) {
            console.error('Error saving tenant:', error);
            const msg = error.response?.data?.message || 'Failed to save salon.';
            if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already exists')) {
                showToast('Email or GST Number already exists.', 'error');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleQuickPlanUpdate = async (tenantId, newPlan) => {
        try {
            await api.put(`/tenants/${tenantId}`, { subscriptionPlan: newPlan });
            showToast(`Plan upgraded to ${newPlan.toUpperCase()}!`);
            fetchTenants();
            setModal(null);
        } catch (error) {
            console.error('Error updating plan:', error);
            showToast('Failed to update plan.', 'error');
        }
    };

    const handleSuspend = async (tenant) => {
        const action = tenant.status === 'suspended' ? 'reactivate' : 'suspend';
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${tenant.name}"?`)) return;
        
        try {
            const newStatus = tenant.status === 'suspended' ? 'active' : 'suspended';
            await api.put(`/tenants/${tenant._id}`, { status: newStatus });
            showToast(`Salon ${action}d successfully.`);
            fetchTenants();
        } catch (error) {
            console.error(`Error ${action}ing tenant:`, error);
            showToast(`Failed to ${action} salon.`, 'error');
        }
    };

    const handleDelete = async (tenant) => {
        if (!confirm(`Permanently delete "${tenant.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/tenants/${tenant._id}`);
            showToast(`Salon deleted.`, 'error');
            fetchTenants();
        } catch (error) {
            console.error('Error deleting tenant:', error);
            showToast('Failed to delete salon.', 'error');
        }
    };

    const handleResendCredentials = async (tenant) => {
        if (!confirm(`This will reset the password of "${tenant.name}" owner to "123456" and send them an email. Continue?`)) return;
        
        try {
            const res = await api.post(`/tenants/${tenant._id}/resend-credentials`);
            showToast(res.data.message);
        } catch (error) {
            console.error('Error resending credentials:', error);
            showToast(error.response?.data?.message || 'Failed to resend credentials.', 'error');
        }
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
                    <p className="text-sm text-text-secondary mt-0.5">Manage all registered salons — {stats?.totalSalons || 0} total</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            exportToExcel(tenants, 'Wapixo_Onboarded_Salons', 'Tenants');
                            showToast('Salons list exported as Excel!', 'info');
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary text-sm font-semibold hover:border-primary/30 hover:text-primary transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-primary-foreground text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]">
                        <Plus className="w-4 h-4" /> Create Salon
                    </button>
                </div>
            </div>

            {/* ── Status filter tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTER_TABS.map(f => (
                    <button key={f.key}
                        onClick={() => setStatus(f.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === f.key
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                            : 'bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-primary'
                            }`}>
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-surface text-text-muted'
                            }`}>{counts[f.key]}</span>
                    </button>
                ))}
            </div>

            {/* ── Date period filter ── */}

            {/* ── Search + plan filter + filter toggle ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Find a salon..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
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
                {FilterToggleBtn}
            </div>
            {/* Date filter panel */}
            {DateFilterPanel}

            {/* ── Table ── */}
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
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
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary shrink-0 group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all">
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
                                                    onEdit={(ten, type) => setModal({ mode: type === 'plan' ? 'plan' : 'edit', tenant: ten })}
                                                    onSuspend={handleSuspend}
                                                    onDelete={handleDelete}
                                                    onResendCredentials={handleResendCredentials}
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

            {/* Pagination UI */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2 pb-1">
                    <div className="text-xs text-text-muted">
                        Showing <span className="font-bold text-text">{(page - 1) * meta.limit + 1}</span> to <span className="font-bold text-text">{Math.min(page * meta.limit, meta.totalResults)}</span> of <span className="font-bold text-text">{meta.totalResults}</span> salons
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-2 rounded-xl bg-surface border border-border text-text-secondary disabled:opacity-40 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary shadow-sm">
                            Page <span className="text-primary">{page}</span> of {meta.totalPages}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages || loading}
                            className="p-2 rounded-xl bg-surface border border-border text-text-secondary disabled:opacity-40 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
                        >
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                    </div>
                </div>
            )}

            {/* Result count (fallback) */}
            {meta.totalPages <= 1 && filtered.length > 0 && (
                <p className="text-xs text-text-muted text-right">
                    Showing {filtered.length} of {meta.totalResults || tenants.length} salons
                </p>
            )}

            {/* ── Modal ── */}
            {modal?.mode === 'plan' && (
                <PlanChangeModal
                    tenant={modal.tenant}
                    onClose={() => setModal(null)}
                    onSave={handleQuickPlanUpdate}
                />
            )}

            {modal && modal.mode !== 'plan' && (
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
