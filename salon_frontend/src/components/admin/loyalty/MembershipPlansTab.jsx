import { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Crown,
    Star,
    Gem,
    Check,
    ShieldCheck,
    MoreVertical,
    Save,
    X,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';

const DEFAULT_PLANS = [
    {
        id: 'silver',
        name: 'Silver Lounge',
        price: 999,
        duration: 30,
        benefits: ['5% Off on all services', '1 Free Hair Wash monthly', 'Priority Booking'],
        color: '#A0A0A0',
        gradient: 'linear-gradient(135deg, #B0B0B0 0%, #707070 100%)',
        isActive: true,
        icon: 'star'
    },
    {
        id: 'gold',
        name: 'Gold Elite',
        price: 1999,
        duration: 30,
        benefits: ['15% Off on all services', '2 Free Stylings monthly', 'Birthday Special Gift'],
        color: '#D4AF37',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
        isActive: true,
        isPopular: true,
        icon: 'crown'
    },
    {
        id: 'platinum',
        name: 'Royal Platinum',
        price: 4499,
        duration: 30,
        benefits: ['30% Off on all services', 'Unlimited Hair Wash', 'Home Service Available'],
        color: '#1A1A1A',
        gradient: 'linear-gradient(135deg, #2C2C2C 0%, #000000 100%)',
        isActive: true,
        icon: 'gem'
    }
];

export default function MembershipPlansTab() {
    const [plans, setPlans] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPlans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loyalty/membership-plans');
            const list = res?.data?.data || res?.data || [];
            if (Array.isArray(list) && list.length > 0) {
                setPlans(list.map((p) => ({
                    id: p._id || p.id,
                    name: p.name,
                    price: Number(p.price || 0),
                    duration: Number(p.duration || 30),
                    benefits: Array.isArray(p.benefits) ? p.benefits : [],
                    includedServices: Array.isArray(p.includedServices) ? p.includedServices : [],
                    color: p.color || '#A0A0A0',
                    gradient: p.gradient || 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                    isActive: p.isActive !== false,
                    isPopular: !!p.isPopular,
                    icon: p.icon || 'star',
                })));
            } else {
                // Backend source of truth: show empty state when no plans exist.
                setPlans([]);
            }
        } catch (e) {
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
        const loadServices = async () => {
            try {
                const res = await api.get('/services');
                const rows = res?.data?.results || res?.data?.data || res?.data || [];
                const list = Array.isArray(rows) ? rows : [];
                setServiceOptions(
                    list
                        .filter((s) => (s?.status || '').toLowerCase() !== 'inactive')
                        .map((s) => String(s?.name || '').trim())
                        .filter(Boolean)
                );
            } catch {
                setServiceOptions([]);
            }
        };
        loadServices();
    }, []);

    const handleDelete = (id) => {
        if (confirm('Verify protocol termination? This plan will be archived.')) {
            api.delete(`/loyalty/membership-plans/${id}`).then(() => {
                loadPlans();
            }).catch((err) => {
                alert(err?.response?.data?.message || 'Failed to delete plan');
            });
        }
    };

    const handleToggleActive = (id) => {
        const item = plans.find(p => p.id === id);
        if (!item) return;
        const nextActive = !item.isActive;
        api.patch(`/loyalty/membership-plans/${id}`, { isActive: nextActive })
            .then(() => {
                loadPlans();
            })
            .catch((err) => {
                alert(err?.response?.data?.message || 'Failed to update status');
            });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-primary" />
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">Subscription Matrix</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Tier-based benefit orchestration</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Initialize Plan
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-sm font-bold text-text-muted">Loading membership plans...</div>
            ) : (
                plans.length > 0 ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <MembershipCard
                                key={plan.id}
                                plan={plan}
                                onEdit={() => { setEditingPlan(plan); setShowModal(true); }}
                                onDelete={() => handleDelete(plan.id)}
                                onToggle={() => handleToggleActive(plan.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-sm font-bold text-text-muted">
                        No membership plans configured yet. Click `Initialize Plan` to add one.
                    </div>
                )
            )}

            <AnimatePresence>
                {showModal && (
                    <PlanModal
                        plan={editingPlan}
                        serviceOptions={serviceOptions}
                        onClose={() => setShowModal(false)}
                        onSave={async (data) => {
                            if (editingPlan) {
                                try {
                                    await api.patch(`/loyalty/membership-plans/${editingPlan.id}`, data);
                                    await loadPlans();
                                } catch (err) {
                                    alert(err?.response?.data?.message || 'Failed to update membership plan');
                                    return;
                                }
                            } else {
                                try {
                                    await api.post('/loyalty/membership-plans', { ...data, isActive: true });
                                    await loadPlans();
                                } catch (err) {
                                    alert(err?.response?.data?.message || 'Failed to create membership plan');
                                    return;
                                }
                            }
                            setShowModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function MembershipCard({ plan, onEdit, onDelete, onToggle }) {
    const Icon = plan.icon === 'gem' ? Gem : (plan.icon === 'crown' ? Crown : Star);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative group bg-surface border overflow-hidden transition-all duration-500 ${plan.isActive ? 'border-border/40' : 'border-rose-500/20 grayscale opacity-60'
                }`}
        >
            {/* Design Elements */}
            <div style={{ background: plan.gradient }} className="h-2 w-full" />

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-surface-alt border border-border/60 text-primary shadow-inner rounded-xl group-hover:scale-110 transition-transform duration-500">
                        <Icon size={24} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all"><Edit2 size={16} /></button>
                        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                </div>

                <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-foreground italic">₹{plan.price}</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">/ {plan.duration} Days</span>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    {plan.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-text-muted italic group-hover:text-foreground transition-colors">
                            <Check size={14} className="text-primary shrink-0" />
                            {benefit}
                        </div>
                    ))}
                    {Array.isArray(plan.includedServices) && plan.includedServices.length > 0 && (
                        <div className="pt-2 border-t border-border/30">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Included Services</p>
                            <div className="flex flex-wrap gap-2">
                                {plan.includedServices.slice(0, 6).map((s, i) => (
                                    <span key={`${s}-${i}`} className="px-2 py-1 text-[10px] font-bold border border-border/50 bg-surface-alt text-foreground">
                                        {s}
                                    </span>
                                ))}
                                {plan.includedServices.length > 6 && (
                                    <span className="px-2 py-1 text-[10px] font-bold border border-border/50 bg-surface-alt text-text-muted">
                                        +{plan.includedServices.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggle}
                    className={`w-full py-3 border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${plan.isActive
                        ? 'bg-transparent text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/5'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                >
                    {plan.isActive ? 'Protocol Active' : 'Protocol Suspended'}
                </button>
            </div>

            {plan.isPopular && (
                <div className="absolute top-2 right-12 px-3 py-1 bg-white text-black text-[9px] font-black uppercase tracking-widest rotate-1 shadow-lg">
                    Featured Tier
                </div>
            )}
        </motion.div>
    );
}

function PlanModal({ plan, serviceOptions = [], onClose, onSave }) {
    const [formData, setFormData] = useState(plan || {
        name: '',
        price: '',
        duration: 30,
        benefits: [''],
        includedServices: [],
        icon: 'star',
        gradient: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
        isPopular: false
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-surface border border-border/40 w-full max-w-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-border/40 flex justify-between items-center bg-surface-alt">
                    <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
                        {plan ? 'Reconfigure Tier' : 'Initialize New Tier'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary transition-all"><X size={24} /></button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Plan Designation</label>
                            <input
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\\s]/g, '') })}
                                className="w-full h-12 bg-surface-alt border border-border/60 px-4 text-sm font-bold text-foreground focus:border-primary focus:bg-surface outline-none transition-all shadow-sm"
                                placeholder="E.g. Royal Platinum"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pricing (INR)</label>
                            <input
                                type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full h-12 bg-surface-alt border border-border/60 px-4 text-sm font-bold text-foreground focus:border-primary focus:bg-surface outline-none transition-all shadow-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cycle Duration (Days)</label>
                            <input
                                type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full h-12 bg-surface-alt border border-border/60 px-4 text-sm font-bold text-foreground focus:border-primary focus:bg-surface outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Iconography</label>
                            <select
                                value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full h-12 bg-surface-alt border border-border/60 px-4 text-sm font-bold text-foreground focus:border-primary focus:bg-surface outline-none transition-all appearance-none shadow-sm"
                            >
                                <option value="star">Standard Star</option>
                                <option value="crown">Elite Crown</option>
                                <option value="gem">Royal Gem</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Provisioned Benefits</label>
                            <button
                                onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })}
                                className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                            >
                                + Add Metric
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.benefits.map((b, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={b} onChange={e => {
                                            const newB = [...formData.benefits];
                                            newB[i] = e.target.value;
                                            setFormData({ ...formData, benefits: newB });
                                        }}
                                        className="flex-1 h-11 bg-surface-alt border border-border/60 px-4 text-xs font-bold text-foreground italic focus:border-primary focus:bg-surface outline-none transition-all shadow-sm"
                                        placeholder="Benefit description..."
                                    />
                                    <button
                                        onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, idx) => idx !== i) })}
                                        className="px-3 hover:bg-rose-500/10 text-rose-500/40 hover:text-rose-500 transition-all border border-border/40"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Included Services</label>
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{formData.includedServices?.length || 0} selected</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 max-h-52 overflow-y-auto border border-border/40 p-3 bg-surface-alt">
                            {(serviceOptions || []).length === 0 ? (
                                <p className="text-xs font-bold text-text-muted">No services found. Add services in Services section first.</p>
                            ) : serviceOptions.map((serviceName) => {
                                const checked = (formData.includedServices || []).includes(serviceName);
                                return (
                                    <label key={serviceName} className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                                const prev = Array.isArray(formData.includedServices) ? formData.includedServices : [];
                                                const next = e.target.checked
                                                    ? [...prev, serviceName]
                                                    : prev.filter((s) => s !== serviceName);
                                                setFormData({ ...formData, includedServices: next });
                                            }}
                                        />
                                        <span>{serviceName}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-border/40 flex gap-4 bg-surface-alt">
                    <button onClick={onClose} className="flex-1 py-4 border border-border/60 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-primary/5 hover:text-primary transition-all">Archive</button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        Commit Configuration <Save size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
