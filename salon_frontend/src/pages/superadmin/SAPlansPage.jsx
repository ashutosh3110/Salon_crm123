import { useState, useRef, useEffect } from 'react';
import {
    Plus, Edit3, Copy, Power, PowerOff, CheckCircle, XCircle,
    Crown, X, ChevronDown, Zap, Users, Home, MessageSquare,
    HardDrive, Activity, BarChart2, Smartphone, Heart, Target,
    Star, Package, Flame, DollarSign, ArrowRight, Info,
    ToggleLeft, ToggleRight, Trash2, Calendar, CreditCard,
    Megaphone, Briefcase, Layout, ClipboardList, Bell, UserCog,
    Layers, ShieldCheck, Gem, RefreshCw
} from 'lucide-react';
import CustomDropdown from '../../components/superadmin/CustomDropdown';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Color maps ─────────────────────────────────────────────────────── */
const planColors = {
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    pro: 'bg-primary/10 text-primary border-primary/25',
    premium: 'bg-primary/10 text-primary border-primary/25',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const EMPTY_PLAN = {
    id: '', name: '', tag: '', color: 'blue', isActive: true, popular: false,
    price: 0, 
    description: '',
    monthlyPrice: 0, yearlyPrice: 0,
    features: {},
    limits: { staffLimit: 10, outletLimit: 1, whatsappLimit: 0 },
    salonsCount: 0,
    billingCycle: 'monthly'
};

/* ─── Plan card ──────────────────────────────────────────────────────── */
function PlanCard({ plan, onEdit, onClone, onToggleActive, onDelete }) {
    const isFree = plan.price === 0 || plan.billingCycle === 'trial';
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface rounded-2xl border transition-all ${plan.popular ? 'border-primary shadow-lg shadow-primary/5' : 'border-border shadow-sm'}`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <h3 className="text-xl font-black text-text tracking-tight uppercase italic">{plan.name}</h3>
                             {plan.popular && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                    Best Seller
                                </span>
                             )}
                        </div>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{plan.billingCycle || 'Standard'} Plan</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${plan.popular ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-alt border-border text-text-muted'}`}>
                        {plan.popular ? <Crown className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-text">₹{plan.price || 0}</span>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">/ {plan.billingCycle === 'yearly' ? 'year' : 'mo'}</span>
                </div>

                <p className="text-xs text-text-secondary font-medium leading-relaxed mb-6 line-clamp-2 h-8">
                    {plan.description || 'Flexible plan tailored for growing salons.'}
                </p>

                <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-text-muted">Staff Quota</span>
                        <span className="text-text">{plan.limits?.staffLimit > 100 ? 'Unlimited' : plan.limits?.staffLimit} seats</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-text-muted">Outlet Limit</span>
                        <span className="text-text">{plan.limits?.outletLimit > 100 ? 'Unlimited' : plan.limits?.outletLimit} active branch</span>
                    </div>
                    
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                    <div className={`w-2 h-2 rounded-full ${plan.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {plan.isActive ? 'Active on Store' : 'Hidden / Draft'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-4 border-t border-border bg-surface-alt/30 overflow-hidden rounded-b-2xl">
                <button onClick={() => onEdit(plan)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 text-[9px] font-black text-text-muted hover:text-primary hover:bg-white transition-all uppercase tracking-widest border-r border-border">
                    <Edit3 className="w-4 h-4" /> <span>Edit</span>
                </button>
                <button onClick={() => onClone(plan)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 text-[9px] font-black text-text-muted hover:text-blue-600 hover:bg-white transition-all uppercase tracking-widest border-r border-border">
                    <Copy className="w-4 h-4" /> <span>Clone</span>
                </button>
                <button onClick={() => onToggleActive(plan)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 text-[9px] font-black transition-all uppercase tracking-widest border-r border-border ${plan.isActive ? 'text-orange-500 hover:bg-white' : 'text-emerald-500 hover:bg-white' }`}>
                    {plan.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />} <span>{plan.isActive ? 'Pause' : 'Start'}</span>
                </button>
                <button onClick={() => onDelete(plan)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 text-[9px] font-black text-red-500 hover:bg-white transition-all uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> <span>Delete</span>
                </button>
            </div>
        </motion.div>
    );
}

/* ─── Plan modal ─────────────────────────────────────────────────────── */
function PlanModal({ plan, onClose, onSave, saving }) {
    const [form, setForm] = useState({ ...EMPTY_PLAN, ...plan });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const setLimit = (k, v) => setForm(p => ({ ...p, limits: { ...p.limits, [k]: v } }));

    const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold';
    const labelCls = 'block text-[11px] font-black text-text-muted uppercase tracking-wider mb-1.5 ml-1';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-surface">
                    <div>
                        <h3 className="text-xl font-black text-text tracking-tight uppercase italic">{plan?._id ? 'Edit Plan' : 'Create New Plan'}</h3>
                        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Configure subscription tier details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-alt rounded-xl transition-colors text-text-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-8">
                    {/* Basic Info Container */}
                    <div className="space-y-5">
                       <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">General Information</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className={labelCls}>Plan Name *</label>
                                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Pro Membership" required />
                            </div>
                            <div className="col-span-2">
                                 <label className={labelCls}>Description</label>
                                 <textarea 
                                     className={`${inputCls} min-h-[80px] py-3 resize-none`} 
                                     value={form.description} 
                                     onChange={e => set('description', e.target.value)} 
                                     placeholder="What's included in this plan?"
                                 />
                            </div>
                            <div>
                                <label className={labelCls}>Billing Cycle</label>
                                <CustomDropdown
                                    variant="form"
                                    value={form.billingCycle || 'monthly'}
                                    onChange={v => set('billingCycle', v)}
                                    options={[
                                        { value: 'monthly', label: 'Monthly' },
                                        { value: 'yearly', label: 'Yearly' },
                                        { value: 'trial', label: 'Trial / Free' },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Base Price (₹) *</label>
                                <input type="number" className={inputCls} value={form.price} onChange={e => set('price', +e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 bg-surface rounded-xl border border-border">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input type="checkbox" checked={form.popular} onChange={e => set('popular', e.target.checked)} className="w-4 h-4 accent-primary" />
                                <span className="text-[11px] font-black uppercase text-text-secondary tracking-widest">Mark as Popular</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                                <span className="text-[11px] font-black uppercase text-text-secondary tracking-widest">Active Plan</span>
                            </label>
                        </div>
                    </div>

                    {/* Limits Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">Operational Limits</h4>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { key: 'staffLimit', label: 'Staff Limit', icon: Users },
                                { key: 'outletLimit', label: 'Outlet Limit', icon: Home },
                            ].map(l => (
                                <div key={l.key} className="space-y-1.5">
                                    <label className={labelCls}>{l.label}</label>
                                    <input type="number" min={0} className={inputCls}
                                        value={form.limits[l.key]}
                                        onChange={e => setLimit(l.key, +e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3 items-center">
                             <Info className="w-4 h-4 text-blue-500 shrink-0" />
                             <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wide">
                                 Values over 100 are treated as "Unlimited".
                             </p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface">
                    <button onClick={onClose}
                        className="px-4 py-2 text-[11px] font-black text-text-muted uppercase tracking-widest hover:text-text transition-all">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                        {saving ? 'Saving...' : plan?._id ? 'Update Plan' : 'Create Plan'}
                    </button>
                </div>
            </motion.div>
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

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    return (
        <div className="space-y-6 pb-12">
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed top-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white text-xs font-black uppercase tracking-wider border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-500/90 border-red-400' : 'bg-emerald-500/90 border-emerald-400'}`}
                    >
                        {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                   <h1 className="text-2xl font-black text-text tracking-tight uppercase italic">Subscription Plans</h1>
                   <p className="text-sm text-text-secondary mt-0.5 font-medium">Define and manage template membership tiers for the ecosystem.</p>
                </div>
                
                <button 
                    onClick={() => setModal({})}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#8B1A2D] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" /> 
                    <span>Create New Plan</span>
                </button>
            </div>

            {/* Plans Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">Loading Plans...</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan._id}
                            plan={plan}
                            onEdit={p => setModal(p)}
                            onClone={handleClone}
                            onToggleActive={handleToggleActive}
                            onDelete={handleDelete}
                        />
                    ))}
                    
                    {plans.length === 0 && (
                        <div className="col-span-full py-24 bg-surface-alt border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
                            <Package className="w-12 h-12 text-text-muted mb-4 opacity-20" />
                            <p className="text-sm font-black text-text-muted uppercase tracking-widest">No plans defined yet</p>
                            <button onClick={() => setModal({})} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Get Started →</button>
                        </div>
                    )}
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

