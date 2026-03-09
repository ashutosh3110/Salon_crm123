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
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    useEffect(() => {
        const savedPlans = localStorage.getItem('salon_membership_plans');
        if (savedPlans) {
            setPlans(JSON.parse(savedPlans));
        } else {
            setPlans(DEFAULT_PLANS);
            localStorage.setItem('salon_membership_plans', JSON.stringify(DEFAULT_PLANS));
        }
    }, []);

    const savePlans = (newPlans) => {
        setPlans(newPlans);
        localStorage.setItem('salon_membership_plans', JSON.stringify(newPlans));
    };

    const handleDelete = (id) => {
        if (confirm('Verify protocol termination? This plan will be archived.')) {
            savePlans(plans.filter(p => p.id !== id));
        }
    };

    const handleToggleActive = (id) => {
        savePlans(plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
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

            <AnimatePresence>
                {showModal && (
                    <PlanModal
                        plan={editingPlan}
                        onClose={() => setShowModal(false)}
                        onSave={(data) => {
                            if (editingPlan) {
                                savePlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...data } : p));
                            } else {
                                savePlans([...plans, { ...data, id: Date.now().toString(), isActive: true }]);
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

function PlanModal({ plan, onClose, onSave }) {
    const [formData, setFormData] = useState(plan || {
        name: '',
        price: '',
        duration: 30,
        benefits: [''],
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
