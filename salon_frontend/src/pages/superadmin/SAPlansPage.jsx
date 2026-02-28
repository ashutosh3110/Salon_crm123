import { useState, useRef, useEffect } from 'react';
import {
    Plus, Edit3, Copy, Power, PowerOff, CheckCircle, XCircle,
    Crown, X, ChevronDown, Zap, Users, Home, MessageSquare,
    HardDrive, Activity, BarChart2, Smartphone, Heart, Target,
    Star, Package, Flame, DollarSign, ArrowRight, Info,
    ToggleLeft, ToggleRight, Trash2, Calendar, CreditCard
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';

/* ─── Feature definitions ─────────────────────────────────────────────── */
const ALL_FEATURES = [
    { key: 'pos', label: 'POS Terminal', icon: CreditCard, desc: 'High-speed billing & terminals' },
    { key: 'appointments', label: 'Appointments', icon: Calendar, desc: 'Real-time booking & calendar' },
    { key: 'inventory', label: 'Inventory Pro', icon: Package, desc: 'Stock management & POs' },
    { key: 'crm', label: 'CRM & Clients', icon: Heart, desc: 'History & membership tracking' },
    { key: 'marketing', label: 'Marketing Hub', icon: Target, desc: 'SMS campaigns & promotions' },
    { key: 'payroll', label: 'Staff & HR', icon: Users, desc: 'Attendance & commissions' },
    { key: 'mobileApp', label: 'Customer App', icon: Smartphone, desc: 'Branded mobile booking app' },
    { key: 'finance', label: 'Finance Hub', icon: DollarSign, desc: 'Tax reports & reconciliation' },
    { key: 'reports', label: 'Analytics AI', icon: BarChart2, desc: 'Business insights & performance' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: 'Automated confirmations' },
    { key: 'loyalty', label: 'Loyalty Flow', icon: Star, desc: 'Points, rewards & cashback' },
    { key: 'feedback', label: 'Feedback Loop', icon: Activity, desc: 'Automated reviews & ratings' },
];

/* ─── Mock plan data ─────────────────────────────────────────────────── */
const INITIAL_PLANS = [
    {
        id: 'p1', name: 'Free', tag: 'Starter', color: 'slate', active: true, popular: false,
        monthlyPrice: 0, yearlyPrice: 0, trialDays: 14,
        features: { pos: true, appointments: true, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: false, whatsapp: false, loyalty: false, finance: false, feedback: false },
        limits: { staffLimit: 3, outletLimit: 1, smsCredits: 0, storageGB: 1, apiCalls: 1000 },
        salonsCount: 38,
    },
    {
        id: 'p2', name: 'Basic', tag: 'Growth', color: 'blue', active: true, popular: false,
        monthlyPrice: 1999, yearlyPrice: 19990, trialDays: 14,
        features: { pos: true, appointments: true, inventory: true, marketing: false, payroll: false, crm: true, mobileApp: false, reports: true, whatsapp: false, loyalty: false, finance: true, feedback: false },
        limits: { staffLimit: 10, outletLimit: 2, smsCredits: 200, storageGB: 5, apiCalls: 10000 },
        salonsCount: 27,
    },
    {
        id: 'p3', name: 'Pro', tag: 'Popular', color: 'primary', active: true, popular: true,
        monthlyPrice: 4999, yearlyPrice: 49990, trialDays: 7,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: false, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 25, outletLimit: 5, smsCredits: 1000, storageGB: 20, apiCalls: 100000 },
        salonsCount: 22,
    },
    {
        id: 'p4', name: 'Enterprise', tag: 'Unlimited', color: 'amber', active: true, popular: false,
        monthlyPrice: 12999, yearlyPrice: 129990, trialDays: 0,
        features: { pos: true, appointments: true, inventory: true, marketing: true, payroll: true, crm: true, mobileApp: true, reports: true, whatsapp: true, loyalty: true, finance: true, feedback: true },
        limits: { staffLimit: 999, outletLimit: 999, smsCredits: 10000, storageGB: 100, apiCalls: 999999 },
        salonsCount: 13,
    },
];

/* ─── Color maps ─────────────────────────────────────────────────────── */
const COLOR = {
    slate: { badge: 'bg-slate-100 text-slate-600 border-slate-200', header: 'from-slate-500 to-slate-700', ring: 'ring-slate-200' },
    blue: { badge: 'bg-blue-50   text-blue-600   border-blue-200', header: 'from-blue-500 to-indigo-600', ring: 'ring-blue-200' },
    primary: { badge: 'bg-primary/10 text-primary border-primary/25', header: 'from-primary to-[#8B1A2D]', ring: 'ring-primary/30' },
    amber: { badge: 'bg-amber-50  text-amber-600  border-amber-200', header: 'from-amber-500 to-orange-600', ring: 'ring-amber-200' },
};

/* ─── Empty plan template ────────────────────────────────────────────── */
const EMPTY_PLAN = {
    id: '', name: '', tag: '', color: 'blue', active: true, popular: false,
    monthlyPrice: 0, yearlyPrice: 0, trialDays: 14,
    features: { pos: false, appointments: false, inventory: false, marketing: false, payroll: false, crm: false, mobileApp: false, reports: false, whatsapp: false, loyalty: false, finance: false, feedback: false },
    limits: { staffLimit: 10, outletLimit: 1, smsCredits: 100, storageGB: 5, apiCalls: 10000 },
    salonsCount: 0,
};

/* ─── Plan card ──────────────────────────────────────────────────────── */
function PlanCard({ plan, onEdit, onClone, onToggleActive, onDelete }) {
    const c = COLOR[plan.color] || COLOR.blue;
    const featOn = Object.values(plan.features).filter(Boolean).length;
    const featOff = Object.values(plan.features).filter(v => !v).length;

    return (
        <div className={`bg-white rounded-2xl border-2 ${plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border'} overflow-hidden flex flex-col transition-all hover:shadow-md group`}>
            {/* Popular ribbon */}
            {plan.popular && (
                <div className="bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-[10px] font-black text-center py-1.5 tracking-widest uppercase">
                    ⚡ Most Popular
                </div>
            )}

            {/* Header */}
            <div className={`bg-gradient-to-br ${c.header} p-5 text-white relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -right-2 top-8 w-12 h-12 rounded-full bg-white/5" />
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-black">{plan.name}</span>
                            {!plan.active && (
                                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Disabled</span>
                            )}
                        </div>
                        <div className="text-white/70 text-xs font-medium">{plan.tag}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black">
                            {plan.monthlyPrice === 0 ? 'Free' : `₹${plan.monthlyPrice.toLocaleString('en-IN')}`}
                        </div>
                        {plan.monthlyPrice > 0 && <div className="text-white/70 text-[11px]">/month</div>}
                    </div>
                </div>
                {plan.monthlyPrice > 0 && (
                    <div className="text-[11px] text-white/60 mt-1 relative z-10">
                        ₹{plan.yearlyPrice.toLocaleString('en-IN')}/yr · Save {Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100)}%
                    </div>
                )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
                {[
                    { label: 'Salons', value: plan.salonsCount },
                    { label: 'Trial', value: plan.trialDays ? `${plan.trialDays}d` : 'None' },
                    { label: 'Staff ≤', value: plan.limits.staffLimit > 100 ? '∞' : plan.limits.staffLimit },
                ].map(s => (
                    <div key={s.label} className="py-2.5">
                        <div className="text-sm font-black text-text">{s.value}</div>
                        <div className="text-[10px] text-text-muted font-medium">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Features */}
            <div className="p-4 flex-1 space-y-1">
                {ALL_FEATURES.map(f => (
                    <div key={f.key} className={`flex items-center gap-2 text-xs py-0.5 ${plan.features[f.key] ? 'text-text-secondary' : 'text-text-muted line-through opacity-50'}`}>
                        {plan.features[f.key]
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        }
                        {f.label}
                    </div>
                ))}
            </div>

            {/* Limits strip */}
            <div className="px-4 pb-3 grid grid-cols-1 gap-1.5">
                {[
                    { label: 'Outlets', value: plan.limits.outletLimit > 100 ? 'Unlimited' : plan.limits.outletLimit },
                ].map(l => (
                    <div key={l.label} className="bg-surface rounded-lg px-2 py-1.5">
                        <div className="text-[10px] text-text-muted font-medium">{l.label}</div>
                        <div className="text-xs font-bold text-text">{l.value}</div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex border-t border-border divide-x divide-border">
                <button onClick={() => onEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold text-text-secondary hover:text-primary hover:bg-primary/5 transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => onClone(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold text-text-secondary hover:text-blue-500 hover:bg-blue-50 transition-all">
                    <Copy className="w-3.5 h-3.5" /> Clone
                </button>
                <button onClick={() => onToggleActive(plan)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold transition-all ${plan.active ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                    {plan.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    {plan.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => onDelete(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
            </div>
        </div>
    );
}

/* ─── Plan modal ─────────────────────────────────────────────────────── */
function PlanModal({ plan, onClose, onSave, saving }) {
    const [form, setForm] = useState({ ...EMPTY_PLAN, ...plan });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const setFeature = (k, v) => setForm(p => ({ ...p, features: { ...p.features, [k]: v } }));
    const setLimit = (k, v) => setForm(p => ({ ...p, limits: { ...p.limits, [k]: v } }));

    const inputCls = 'w-full px-3 py-2 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
    const labelCls = 'block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div>
                        <h3 className="text-base font-bold text-text">{plan?.id ? 'Edit Plan' : 'Create New Plan'}</h3>
                        <p className="text-xs text-text-muted mt-0.5">Configure features, limits and pricing</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">

                    {/* Basic info */}
                    <section>
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" /> Plan Details
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelCls}>Plan Name *</label>
                                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pro" required />
                            </div>
                            <div>
                                <label className={labelCls}>Tag / Subtitle</label>
                                <input className={inputCls} value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Most Popular" />
                            </div>
                            <div>
                                <label className={labelCls}>Monthly Price (₹)</label>
                                <input type="number" min={0} className={inputCls} value={form.monthlyPrice} onChange={e => set('monthlyPrice', +e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Yearly Price (₹)</label>
                                <input type="number" min={0} className={inputCls} value={form.yearlyPrice} onChange={e => set('yearlyPrice', +e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Trial Days</label>
                                <input type="number" min={0} max={90} className={inputCls} value={form.trialDays} onChange={e => set('trialDays', +e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Card Color</label>
                                <CustomDropdown
                                    variant="form"
                                    value={form.color}
                                    onChange={v => set('color', v)}
                                    options={[
                                        { value: 'slate', label: 'Slate (Free)' },
                                        { value: 'blue', label: 'Blue (Basic)' },
                                        { value: 'primary', label: 'Red (Pro)' },
                                        { value: 'amber', label: 'Amber (Enterprise)' },
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div onClick={() => set('popular', !form.popular)}
                                    className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center px-0.5 ${form.popular ? 'bg-primary' : 'bg-slate-200'}`}
                                    style={{ height: '22px', width: '40px' }}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.popular ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm text-text-secondary font-medium">Mark as Popular</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div onClick={() => set('active', !form.active)}
                                    className={`relative flex items-center px-0.5 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    style={{ height: '22px', width: '40px' }}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-sm text-text-secondary font-medium">Active (visible to salons)</span>
                            </label>
                        </div>
                    </section>

                    <div className="border-t border-border" />

                    {/* Feature toggles */}
                    <section>
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" /> Feature Access
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ALL_FEATURES.map(f => (
                                <label key={f.key}
                                    className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all ${form.features[f.key]
                                        ? 'bg-emerald-50/70 border-emerald-200'
                                        : 'bg-surface/50 border-border hover:border-slate-300'
                                        }`}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${form.features[f.key] ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                                            <f.icon className={`w-3.5 h-3.5 ${form.features[f.key] ? 'text-emerald-600' : 'text-slate-400'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`text-xs font-bold ${form.features[f.key] ? 'text-emerald-700' : 'text-text-secondary'}`}>{f.label}</div>
                                            <div className="text-[10px] text-text-muted truncate">{f.desc}</div>
                                        </div>
                                    </div>
                                    <div onClick={() => setFeature(f.key, !form.features[f.key])}
                                        className={`relative flex items-center px-0.5 rounded-full transition-colors shrink-0 ${form.features[f.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        style={{ height: '22px', width: '40px' }}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.features[f.key] ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className="border-t border-border" />

                    {/* Limits */}
                    <section>
                        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> Usage Limits
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'staffLimit', label: 'Staff Limit', hint: '999 = unlimited' },
                                { key: 'outletLimit', label: 'Outlet Limit', hint: '999 = unlimited' },
                            ].map(l => (
                                <div key={l.key}>
                                    <label className={labelCls}>{l.label} <span className="normal-case font-normal opacity-60">({l.hint})</span></label>
                                    <input type="number" min={0} className={inputCls}
                                        value={form.limits[l.key]}
                                        onChange={e => setLimit(l.key, +e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-surface transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                        {saving ? 'Saving…' : plan?.id ? 'Save Changes' : 'Create Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SAPlansPage() {
    const [plans, setPlans] = useState(INITIAL_PLANS);
    const [modal, setModal] = useState(null);   // null | plan object (for edit) | 'new'
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [view, setView] = useState('cards'); // 'cards' | 'list'

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (form) => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 600));
        if (form.id) {
            setPlans(p => p.map(pl => pl.id === form.id ? { ...pl, ...form } : pl));
            showToast(`Plan "${form.name}" updated!`);
        } else {
            const newPlan = { ...form, id: 'p' + Date.now(), salonsCount: 0 };
            setPlans(p => [...p, newPlan]);
            showToast(`Plan "${form.name}" created!`);
        }
        setSaving(false);
        setModal(null);
    };

    const handleClone = async (plan) => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 400));
        const cloned = { ...plan, id: 'p' + Date.now(), name: plan.name + ' (Copy)', popular: false, salonsCount: 0 };
        setPlans(p => [...p, cloned]);
        showToast(`Plan "${plan.name}" cloned!`);
        setSaving(false);
    };

    const handleToggleActive = (plan) => {
        setPlans(p => p.map(pl => pl.id === plan.id ? { ...pl, active: !pl.active } : pl));
        showToast(`Plan "${plan.name}" ${plan.active ? 'disabled' : 'enabled'}.`, plan.active ? 'error' : 'success');
    };

    const handleDelete = (plan) => {
        if (window.confirm(`Are you sure you want to delete the "${plan.name}" plan? This action cannot be undone.`)) {
            setPlans(p => p.filter(pl => pl.id !== plan.id));
            showToast(`Plan "${plan.name}" deleted.`, 'error');
        }
    };

    const activePlans = plans.filter(p => p.active).length;
    const totalSalons = plans.reduce((a, p) => a + p.salonsCount, 0);
    const totalRevenue = plans.reduce((a, p) => a + p.salonsCount * p.monthlyPrice, 0);

    return (
        <div className="space-y-6 pb-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-right-4 duration-300 ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}>
                    <CheckCircle className="w-4 h-4 shrink-0" /> {toast.msg}
                </div>
            )}

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight">Plans & Features</h1>
                    <p className="text-sm text-text-secondary mt-0.5">
                        Manage subscription plans, features access, and usage limits
                    </p>
                </div>
                <button onClick={() => setModal({})}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25 active:scale-[0.98]">
                    <Plus className="w-4 h-4" /> Create Plan
                </button>
            </div>

            {/* ── KPI strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Plans', value: plans.length, icon: Package, color: 'text-primary   bg-primary/10' },
                    { label: 'Active Plans', value: activePlans, icon: Power, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Salons on Plans', value: totalSalons, icon: Users, color: 'text-blue-600  bg-blue-50' },
                    { label: 'Est. MRR', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                ].map(k => (
                    <div key={k.label} className="bg-white rounded-2xl border-border border shadow-sm p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${k.color} flex items-center justify-center shrink-0`}>
                            <k.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-black text-text">{k.value}</div>
                            <div className="text-xs text-text-muted">{k.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Plan cards ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {plans.map(plan => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={p => setModal(p)}
                        onClone={handleClone}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                    />
                ))}
            </div>


            {/* ── Modal ── */}
            {modal !== null && (
                <PlanModal
                    plan={modal?.id ? modal : null}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </div>
    );
}
