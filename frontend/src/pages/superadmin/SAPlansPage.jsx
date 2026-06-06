import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Plus, Edit3, Copy, Power, PowerOff, CheckCircle, XCircle,
    Crown, X, ChevronDown, Zap, Users, Home, MessageSquare,
    Package, DollarSign, ArrowRight, Info, Search, MoreVertical,
    Layers, ShieldCheck, Gem, RefreshCw, BarChart2, Star
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Color & Styling maps ─────────────────────────────────────────── */
const TIER_CFG = {
    free: { border: 'border-slate-200', text: 'text-slate-600', gradient: 'from-slate-400 via-slate-500 to-slate-600', bg: 'bg-slate-50' },
    basic: { border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-500 via-sky-500 to-sky-600', bg: 'bg-blue-50' },
    pro: { border: 'border-purple-200', text: 'text-purple-600', gradient: 'from-purple-500 via-pink-500 to-rose-600', bg: 'bg-purple-50' },
    premium: { border: 'border-amber-200', text: 'text-[#B4912B]', gradient: 'from-[#B4912B] via-[#C69F32] to-[#8B6F23]', bg: 'bg-amber-50' },
    enterprise: { border: 'border-emerald-200', text: 'text-emerald-600', gradient: 'from-emerald-500 via-teal-500 to-emerald-600', bg: 'bg-emerald-50' },
};

const AVAILABLE_FEATURES = [
    { key: 'bookingSystem', label: 'Online Booking', description: 'Customer booking scheduling' },
    { key: 'crm', label: 'CRM & Marketing', description: 'Customer profiling & marketing campaigns' },
    { key: 'inventory', label: 'Inventory Management', description: 'Track product stock levels & suppliers' },
    { key: 'whatsapp', label: 'WhatsApp Automation', description: 'Automated WhatsApp alerts and reminders' },
    { key: 'pos', label: 'POS Billing', description: 'Invoices, GST returns, payments' },
    { key: 'reporting', label: 'Advanced Analytics', description: 'Revenue and staff reports' }
];

const EMPTY_PLAN = {
    id: '', name: '', tag: '', color: 'blue', isActive: true, popular: false,
    price: 0, 
    description: '',
    monthlyPrice: 0, yearlyPrice: 0,
    features: {
        bookingSystem: true,
        crm: true,
        inventory: false,
        whatsapp: false,
        pos: true,
        reporting: false
    },
    limits: { staffLimit: 10, outletLimit: 1, whatsappLimit: 0 },
    salonsCount: 0,
    billingCycle: 'monthly'
};

/* ─── Dropdown Action Menu for Card ─────────────────────────────────────── */
function PlanActionMenu({ plan, onEdit, onClone, onToggleActive, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <div ref={ref} className="relative inline-block text-left">
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 rounded-xl transition-all duration-200 ${open ? 'bg-slate-100' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
            >
                <MoreVertical className="w-4.5 h-4.5" />
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in zoom-in-95 duration-100 origin-top-right">
                    <button onClick={() => { onClone(plan); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-left">
                        <Copy className="w-4 h-4 text-blue-500" />
                        Clone Plan
                    </button>
                    <button onClick={() => { onToggleActive(plan); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-left">
                        {plan.isActive ? <PowerOff className="w-4 h-4 text-orange-500" /> : <Power className="w-4 h-4 text-emerald-500" />}
                        {plan.isActive ? 'Draft / Hide' : 'Make Active'}
                    </button>
                    <div className="h-px bg-slate-100 my-1.5" />
                    <button onClick={() => { onDelete(plan); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        Delete Plan
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Plan Card component ────────────────────────────────────────────────── */
function PlanCard({ plan, onEdit, onClone, onToggleActive, onDelete, trialDays }) {
    // Determine configuration key (pro, basic, premium, enterprise, free)
    const lowerName = plan.name?.toLowerCase() || '';
    let tierKey = 'basic';
    if (plan.price === 0 || plan.billingCycle === 'trial' || plan.billingCycle === 'forever') tierKey = 'free';
    else if (lowerName.includes('pro')) tierKey = 'pro';
    else if (lowerName.includes('premium') || lowerName.includes('gold')) tierKey = 'premium';
    else if (lowerName.includes('enterprise')) tierKey = 'enterprise';

    const tc = TIER_CFG[tierKey] || TIER_CFG.basic;

    const enabledFeatures = Object.entries(plan.features || {})
        .filter(([_, v]) => v)
        .map(([k]) => AVAILABLE_FEATURES.find(af => af.key === k)?.label || k);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative flex flex-col bg-white/80 backdrop-blur-xl rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${plan.popular ? 'border-[#B4912B] shadow-[0_10px_40px_rgba(180,145,43,0.08)]' : 'border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.06)]'}`}
        >
            {/* Color Strip Header */}
            <div className={`h-2 rounded-t-3xl bg-gradient-to-r ${tc.gradient}`} />

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase truncate" title={plan.name}>
                                    {plan.name}
                                </h3>
                                {plan.popular && (
                                    <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                        Best Seller
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {plan.price === 0 ? 'Trial / Free' : (plan.billingCycle || 'Standard')} Tier
                            </p>
                        </div>

                        <div className="shrink-0">
                            <PlanActionMenu 
                                plan={plan} 
                                onEdit={onEdit} 
                                onClone={onClone} 
                                onToggleActive={onToggleActive} 
                                onDelete={onDelete} 
                            />
                        </div>
                    </div>

                    {/* Price Tag */}
                    <div className="mb-4">
                        {plan.price === 0 ? (
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-emerald-600 tracking-tighter uppercase leading-none">Free</span>
                                <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Validity: {trialDays} Days</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-800">₹{plan.price || 0}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ {plan.billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                </div>
                                {plan.billingCycle === 'yearly' && (
                                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">Save 20% Annually</span>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 h-8">
                        {plan.description || 'Flexible subscription package tailored for salons.'}
                    </p>

                    {/* Features list */}
                    <div className="space-y-3 pt-5 border-t border-slate-100 mb-6">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Staff Quota</span>
                            <span className="text-slate-700">{plan.limits?.staffLimit > 100 ? 'Unlimited' : plan.limits?.staffLimit} Seats</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Outlet Limit</span>
                            <span className="text-slate-700">{plan.limits?.outletLimit > 100 ? 'Unlimited' : plan.limits?.outletLimit} Branches</span>
                        </div>
                    </div>

                    {/* Feature chips list */}
                    {enabledFeatures.length > 0 && (
                        <div className="mb-6">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Features Included:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {enabledFeatures.slice(0, 4).map((f, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold">
                                        {f}
                                    </span>
                                ))}
                                {enabledFeatures.length > 4 && (
                                    <span className="px-2 py-1 rounded-lg bg-amber-50 text-[#B4912B] text-[10px] font-bold">
                                        +{enabledFeatures.length - 4} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom stats and action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Performance</p>
                        <p className="text-xs font-black text-slate-700 mt-0.5">
                            {plan.salonsCount || 0} Salons Subscribed
                        </p>
                        <p className="text-[10px] text-[#B4912B] font-bold">
                            ₹{((plan.price || 0) * (plan.salonsCount || 0)).toLocaleString('en-IN')} MRR
                        </p>
                    </div>

                    <button 
                        onClick={() => onEdit(plan)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-sm"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Premium Plan Modal ─────────────────────────────────────────────────── */
function PlanModal({ plan, onClose, onSave, saving }) {
    const [form, setForm] = useState({ ...EMPTY_PLAN, ...plan });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const setLimit = (k, v) => setForm(p => ({ ...p, limits: { ...p.limits, [k]: v } }));

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.paddingRight = '5px';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-[#B4912B] transition-all font-bold';
    const labelCls = 'block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-white rounded-[32px] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-[#B4912B] to-[#8B6F23] flex items-center justify-between text-white shrink-0">
                    <div>
                        <h3 className="text-xl font-black tracking-tight uppercase">{plan?._id ? 'Edit Plan' : 'Create New Plan'}</h3>
                        <p className="text-xs text-white/80 font-medium tracking-wide">Configure subscription details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {/* General info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-[#B4912B] rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">General Information</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelCls}>Plan Name *</label>
                                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pro Suite Membership" required />
                            </div>
                            <div className="col-span-2">
                                 <label className={labelCls}>Description</label>
                                 <textarea 
                                     className={`${inputCls} min-h-[80px] py-3 resize-none`} 
                                     value={form.description} 
                                     onChange={e => set('description', e.target.value)} 
                                     placeholder="Enter a description showing the benefits of this plan..."
                                 />
                            </div>
                            {form.billingCycle !== 'forever' && (
                                <>
                                    <div>
                                        <label className={labelCls}>Billing Cycle</label>
                                        <CustomDropdown
                                            variant="form"
                                            value={form.billingCycle || 'monthly'}
                                            onChange={v => set('billingCycle', v)}
                                            options={[
                                                { value: 'monthly', label: 'Monthly Billing' },
                                                { value: 'yearly', label: 'Yearly Billing' },
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Base Price (₹) *</label>
                                        <input type="number" className={inputCls}
                                            value={form.price === 0 ? '' : form.price}
                                            onFocus={e => { if (+e.target.value === 0) set('price', ''); }}
                                            onBlur={e => { if (e.target.value === '') set('price', 0); }}
                                            onChange={e => set('price', e.target.value === '' ? '' : +e.target.value)}
                                            placeholder="0" min={0} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="cursor-pointer select-none">
                                <span className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={form.billingCycle === 'forever'} 
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setForm(p => ({ ...p, billingCycle: 'forever', price: 0 }));
                                            } else {
                                                setForm(p => ({ ...p, billingCycle: 'monthly' }));
                                            }
                                        }} 
                                        className="w-4 h-4 rounded text-[#B4912B] focus:ring-[#B4912B]" 
                                    />
                                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">Free Plan</span>
                                </span>
                            </label>
                            <label className="cursor-pointer select-none">
                                <span className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} className="w-4 h-4 rounded text-[#B4912B] focus:ring-[#B4912B]" />
                                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">Mark as Popular</span>
                                </span>
                            </label>
                            <label className="cursor-pointer select-none">
                                <span className="flex items-center gap-3">
                                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-widest">Active Plan</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Operational Limits */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Operational Limits</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'staffLimit', label: 'Max Staff Seats Allowed', icon: Users },
                                { key: 'outletLimit', label: 'Max Outlets / Branches Allowed', icon: Home },
                            ].map(l => (
                                <div key={l.key} className="space-y-1.5">
                                    <label className={labelCls}>{l.label}</label>
                                    <input type="number" min={0} className={inputCls}
                                        value={form.limits[l.key]}
                                        onChange={e => setLimit(l.key, +e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-blue-550/5 rounded-2xl border border-blue-100 flex gap-3 items-center">
                             <Info className="w-5 h-5 text-blue-500 shrink-0" />
                             <p className="text-xs text-blue-800 font-bold uppercase tracking-wider leading-snug">
                                 Values configured over 100 will render as "Unlimited".
                             </p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
                    <button onClick={onClose}
                        className="px-4 py-2.5 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-md">
                        {saving ? 'Saving...' : plan?._id ? 'Update Plan' : 'Create Plan'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Comparison Table Component ─────────────────────────────────────────── */
function ComparisonTable({ plans, onEdit, trialDays }) {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Plan Name</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Price</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Billing</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Staff Limit</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Outlet Limit</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Salons</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-left">Status</th>
                            <th className="text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {plans.map(p => {
                            return (
                                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800 text-sm">{p.name}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                        {p.price === 0 ? 'Free' : `₹${p.price}`}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 uppercase font-bold">{p.price === 0 ? `${trialDays} Days` : p.billingCycle}</td>
                                    <td className="px-6 py-4 text-sm text-slate-650">{p.limits?.staffLimit > 100 ? 'Unlimited' : p.limits?.staffLimit}</td>
                                    <td className="px-6 py-4 text-sm text-slate-650">{p.limits?.outletLimit > 100 ? 'Unlimited' : p.limits?.outletLimit}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.salonsCount || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>
                                            {p.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => onEdit(p)}
                                            className="px-3 py-1 bg-slate-900 text-white hover:bg-black rounded-lg text-xs font-bold transition-all"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function SAPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [trialDays, setTrialDays] = useState(14);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'popular'

    // View toggle state (Cards View or Table View)
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data?.success) setTrialDays(res.data.data.defaultTrialDays || 14);
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/plans');
            const data = response.data.data;
            const list = Array.isArray(data) ? data : data.results || [];
            setPlans(list);
        } catch (error) {
            console.error('Error fetching plans:', error);
            showToast('Failed to load plans.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (form) => {
        setSaving(true);
        try {
            if (form._id) {
                await api.put(`/plans/${form._id}`, form);
                showToast(`Plan updated successfully!`);
            } else {
                await api.post('/plans', form);
                showToast(`New plan created!`);
            }
            await fetchData();
            setModal(null);
        } catch (error) {
            console.error('Error saving plan:', error);
            showToast('Error saving plan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleClone = async (plan) => {
        setSaving(true);
        try {
            const cloned = { ...plan, name: plan.name + ' - COPY', popular: false };
            delete cloned._id; delete cloned.id; delete cloned.createdAt; delete cloned.updatedAt;

            await api.post('/plans', cloned);
            showToast(`Plan cloned successfully!`);
            await fetchData();
        } catch (error) {
            console.error('Error cloning plan:', error);
            showToast('Failed to clone plan.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (plan) => {
        try {
            await api.put(`/plans/${plan._id}`, { isActive: !plan.isActive });
            showToast(`Plan status updated.`);
            await fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
            showToast('Action failed.', 'error');
        }
    };

    const handleDelete = async (plan) => {
        if (window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
            try {
                await api.delete(`/plans/${plan._id}`);
                showToast(`Plan deleted.`, 'error');
                await fetchData();
            } catch (error) {
                console.error('Error deleting plan:', error);
                showToast('Action failed.', 'error');
            }
        }
    };

    // Calculate dynamic stats
    const stats = useMemo(() => {
        const total = plans.length;
        const active = plans.filter(p => p.isActive).length;
        const totalSalons = plans.reduce((acc, p) => acc + (p.salonsCount || 0), 0);
        const revenue = plans.reduce((acc, p) => acc + (p.price || 0) * (p.salonsCount || 0), 0);
        return { total, active, totalSalons, revenue };
    }, [plans]);

    // Apply local filters and search query
    const filteredPlans = useMemo(() => {
        return plans.filter(p => {
            if (statusFilter === 'active' && !p.isActive) return false;
            if (statusFilter === 'inactive' && p.isActive) return false;
            if (statusFilter === 'popular' && !p.popular) return false;

            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                return p.name?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query);
            }
            return true;
        });
    }, [plans, statusFilter, searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6 space-y-6 pb-12">
            
            {/* Toast popup */}
            {toast && (
                <div className="fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/90 border border-white shadow-2xl text-sm font-semibold animate-in slide-in-from-right-4 duration-300">
                    {toast.type === 'error'
                        ? <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                        : <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />}
                    <span className={toast.type === 'error' ? 'text-red-600' : 'text-emerald-600'}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* Header Upgrade */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight mt-1">Subscription Plans</h1>
                   <p className="text-sm text-slate-500 mt-2 font-medium">Define and manage membership packages and capabilities for salons.</p>
                </div>
                
                <button 
                    onClick={() => setModal({})}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] via-[#C69F32] to-[#8B6F23] text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#B4912B]/20 shrink-0"
                >
                    <Plus className="w-4 h-4 text-white" /> 
                    <span>Create Plan</span>
                </button>
            </div>

            {/* Top Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Plans</p>
                    <h3 className="text-3xl font-black mt-2 text-slate-800">{stats.total}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Plans</p>
                    <h3 className="text-3xl font-black mt-2 text-emerald-600">{stats.active}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Subscribed Salons</p>
                    <h3 className="text-3xl font-black mt-2 text-blue-600">{stats.totalSalons}</h3>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Monthly Revenue</p>
                    <h3 className="text-3xl font-black mt-2 text-[#B4912B]">₹{stats.revenue >= 100000 ? `${(stats.revenue / 100000).toFixed(1)}L` : stats.revenue.toLocaleString('en-IN')}</h3>
                </div>
            </div>

            {/* Search, Filters, and View Toggles */}
            <div className="flex flex-col lg:flex-row gap-3 bg-white/50 backdrop-blur rounded-3xl p-3 border border-slate-200/50 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full lg:flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search plans by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-[#B4912B] transition-all"
                    />
                </div>

                {/* Filters & View switcher */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    
                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'active', label: 'Active' },
                            { key: 'inactive', label: 'Inactive' },
                            { key: 'popular', label: 'Popular' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === f.key ? 'bg-white text-[#B4912B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* View selector tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/40">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550'}`}
                        >
                            Cards View
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550'}`}
                        >
                            Table View
                        </button>
                    </div>

                </div>

            </div>

            {/* Content view toggle */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <RefreshCw className="w-8 h-8 text-[#B4912B] animate-spin" />
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Loading Packages...</div>
                </div>
            ) : filteredPlans.length === 0 ? (
                /* Empty state design */
                <div className="py-24 bg-white/80 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center p-8 shadow-sm">
                    <Package className="w-20 h-20 text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Create your first subscription plan</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Subscription plans help salons choose the right capabilities. Get started by creating your package.</p>
                    <button 
                        onClick={() => setModal({})} 
                        className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B4912B] to-[#8B6F23] text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-[#B4912B]/20"
                    >
                        Create First Plan
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                /* Comparison table view */
                <ComparisonTable 
                    plans={filteredPlans} 
                    onEdit={setModal} 
                    trialDays={trialDays} 
                />
            ) : (
                /* Cards Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlans.map(plan => (
                        <PlanCard 
                            key={plan._id} 
                            plan={plan} 
                            trialDays={trialDays}
                            onEdit={setModal} 
                            onClone={handleClone} 
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal Architecture */}
            <AnimatePresence>
                {modal !== null && (
                    <PlanModal
                        plan={modal?._id ? modal : null}
                        onClose={() => setModal(null)}
                        onSave={handleSave}
                        saving={saving}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
