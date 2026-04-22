import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Layout,
    Calendar,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';

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
            const list = res.data?.data || [];
            if (Array.isArray(list)) {
                setPlans(list.map((p) => ({
                    id: p._id || p.id,
                    name: p.name,
                    price: Number(p.price || 0),
                    duration: Number(p.duration || 30),
                    benefits: Array.isArray(p.benefits) ? p.benefits : [],
                    serviceDiscountValue: p.serviceDiscountValue || 0,
                    serviceDiscountType: p.serviceDiscountType || 'percentage',
                    productDiscountValue: p.productDiscountValue || 0,
                    productDiscountType: p.productDiscountType || 'percentage',
                    color: p.color || '#A0A0A0',
                    gradient: p.gradient || 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)',
                    isActive: p.isActive !== false,
                    isPopular: !!p.isPopular,
                    icon: p.icon || 'star',
                })));
            } else { setPlans([]); }
        } catch (err) { 
            console.error('Failed to load plans', err);
            setPlans([]); 
        } finally { setLoading(false); }
    };

    useEffect(() => {
        loadPlans();
        const loadServices = async () => {
            try {
                const res = await api.get('/services');
                const rows = res.data?.data || [];
                setServiceOptions(rows.map(s => s.name).filter(Boolean));
            } catch { setServiceOptions([]); }
        };
        loadServices();
    }, []);

    const handleDelete = (id) => {
        if (confirm('Verify protocol termination? This plan will be archived.')) {
            api.delete(`/loyalty/membership-plans/${id}`).then(() => {
                toast.success('Plan deleted');
                loadPlans();
            }).catch(e => toast.error('Failed to delete'));
        }
    };

    const handleToggleActive = (id) => {
        const item = plans.find(p => p.id === id);
        if (!item) return;
        api.patch(`/loyalty/membership-plans/${id}`, { isActive: !item.isActive }).then(() => {
            toast.success(`Plan ${item.isActive ? 'Paused' : 'Activated'}`);
            loadPlans();
        }).catch(e => toast.error('Failed to update status'));
    };

    return (
        <div className="space-y-8 italic">
            <div className="flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-primary" />
                    <div>
                        <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter leading-none">Membership Plans</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Manage your customer loyalty tiers and benefits</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> Create New Plan
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-sm font-bold text-text-muted italic opacity-40">Syncing Membership Tiers...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            )}

            <AnimatePresence>
                {showModal && (
                    <PlanModal
                        plan={editingPlan}
                        serviceOptions={serviceOptions}
                        onClose={() => setShowModal(false)}
                        onSave={async (data) => {
                            try {
                                if (editingPlan) {
                                    await api.patch(`/loyalty/membership-plans/${editingPlan.id}`, data);
                                    toast.success('Plan updated');
                                } else {
                                    await api.post('/loyalty/membership-plans', { ...data, isActive: true });
                                    toast.success('Plan created');
                                }
                                await loadPlans();
                                setShowModal(false);
                            } catch (err) {
                                console.error('Save failed', err);
                                toast.error(err.response?.data?.message || 'Failed to save plan');
                            }
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
        <motion.div layout className={`relative group bg-surface border overflow-hidden transition-all duration-500 ${plan.isActive ? 'border-border/40' : 'border-rose-500/20 grayscale opacity-60 hover:shadow-[10px_10px_0px_#C8956C]'}`}>
            <div style={{ background: plan.gradient }} className="h-2 w-full" />
            <div className="p-8 text-left">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-surface-alt border border-border/60 text-primary shadow-inner rounded-xl group-hover:scale-110 transition-transform duration-500"><Icon size={24} /></div>
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
                    {plan.benefits.slice(0, 4).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-text-muted italic group-hover:text-foreground transition-colors line-clamp-1">
                            <Check size={14} className="text-primary shrink-0" />
                            {benefit}
                        </div>
                    ))}
                    <div className="pt-4 mt-2 border-t border-border/30 space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">All Services</p>
                            <span className="px-2 py-1 text-[9px] font-black bg-primary/10 text-primary uppercase tracking-tighter italic">
                                {plan.serviceDiscountValue}{plan.serviceDiscountType === 'percentage' ? '%' : '₹'} OFF
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">All Products</p>
                            <span className="px-2 py-1 text-[9px] font-black bg-primary/10 text-primary uppercase tracking-tighter italic">
                                {plan.productDiscountValue}{plan.productDiscountType === 'percentage' ? '%' : '₹'} OFF
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onToggle} className={`w-full py-3 border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${plan.isActive ? 'bg-transparent text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/5' : 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'}`}>
                    {plan.isActive ? 'Status: Active' : 'Status: Paused'}
                </button>
            </div>
        </motion.div>
    );
}

function PlanModal({ plan, serviceOptions = [], onClose, onSave }) {
    const [formData, setFormData] = useState(plan || { 
        name: '', 
        price: '', 
        duration: 30, 
        benefits: [''], 
        serviceDiscountValue: 0,
        serviceDiscountType: 'percentage',
        productDiscountValue: 0,
        productDiscountType: 'percentage',
        icon: 'star', 
        gradient: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)', 
        isPopular: false 
    });

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-surface border border-border/40 w-full max-w-lg overflow-hidden text-left">
                <div className="px-6 py-5 border-b border-border/40 flex justify-between items-center bg-surface-alt">
                    <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">
                        {plan ? 'EDIT PLAN' : 'CREATE NEW PLAN'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-primary/10 text-text-muted hover:text-primary transition-all"><X size={20} /></button>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto no-scrollbar space-y-6 italic">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="text-[9px] font-black text-text-muted uppercase tracking-widest">PLAN NAME</label><input className="w-full h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                        <div className="space-y-1.5"><label className="text-[9px] font-black text-text-muted uppercase tracking-widest">PRICE (₹)</label><input type="number" className="w-full h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="text-[9px] font-black text-text-muted uppercase tracking-widest">VALIDITY (DAYS)</label><input type="number" className="w-full h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} /></div>
                        <div className="space-y-1.5"><label className="text-[9px] font-black text-text-muted uppercase tracking-widest">PLAN ICON</label><select className="w-full h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })}><option value="star">Star</option><option value="crown">Crown</option><option value="gem">Gem</option></select></div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><label className="text-[9px] font-black text-text-muted uppercase tracking-widest">PLAN BENEFITS</label><button onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })} className="text-[8px] font-black text-primary uppercase tracking-widest">+ ADD BENEFIT</button></div>
                        <div className="space-y-2">
                            {formData.benefits.map((b, i) => (
                                <div key={i} className="flex gap-2">
                                    <input value={b} onChange={e => handleBenefitChange(i, e.target.value)} className="flex-1 h-9 bg-surface-alt border border-border/60 px-3 text-[11px] font-black italic" placeholder="E.g. 10% Off on Haircuts" />
                                    <button onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, idx) => idx !== i) })} className="px-2.5 text-rose-500 border border-border/40"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border/20">
                        {/* Service Discount */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Service Benefits (All Services)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="flex-1 h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" 
                                    placeholder="Value"
                                    value={formData.serviceDiscountValue} 
                                    onChange={e => setFormData({ ...formData, serviceDiscountValue: e.target.value })} 
                                />
                                <select 
                                    className="w-24 h-10 bg-surface-alt border border-border/60 px-2 text-[9px] font-black uppercase tracking-tighter"
                                    value={formData.serviceDiscountType}
                                    onChange={e => setFormData({ ...formData, serviceDiscountType: e.target.value })}
                                >
                                    <option value="percentage">% OFF</option>
                                    <option value="flat">₹ FLAT</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Discount */}
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Product Benefits</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="flex-1 h-10 bg-surface-alt border border-border/60 px-3 text-xs font-black" 
                                    placeholder="Value"
                                    value={formData.productDiscountValue} 
                                    onChange={e => setFormData({ ...formData, productDiscountValue: e.target.value })} 
                                />
                                <select 
                                    className="w-24 h-10 bg-surface-alt border border-border/60 px-2 text-[9px] font-black uppercase tracking-tighter"
                                    value={formData.productDiscountType}
                                    onChange={e => setFormData({ ...formData, productDiscountType: e.target.value })}
                                >
                                    <option value="percentage">% OFF</option>
                                    <option value="flat">₹ FLAT</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border/40 bg-surface-alt">
                    <button onClick={() => onSave(formData)} className="w-full py-4 bg-text text-white font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                        SAVE PLAN <Save size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
