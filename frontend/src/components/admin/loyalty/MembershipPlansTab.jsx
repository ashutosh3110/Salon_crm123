import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
import { AnimatePresence } from 'framer-motion';
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
                    taxType: p.taxType || 'excluding',
                    taxRate: p.taxRate !== undefined ? p.taxRate : 0,
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
            }).catch(() => toast.error('Failed to delete'));
        }
    };

    const handleToggleActive = (id) => {
        const item = plans.find(p => p.id === id);
        if (!item) return;
        api.patch(`/loyalty/membership-plans/${id}`, { isActive: !item.isActive }).then(() => {
            toast.success(`Plan ${item.isActive ? 'Paused' : 'Activated'}`);
            loadPlans();
        }).catch(() => toast.error('Failed to update status'));
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-left gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-[3px] h-6 bg-[#cca839]" />
                    <div>
                        <h2 className="text-[22px] font-black text-slate-900 uppercase tracking-tighter leading-none">MEMBERSHIP PLANS</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">MANAGE YOUR CUSTOMER LOYALTY TIERS AND BENEFITS</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#cca839] text-white font-bold text-[11px] uppercase tracking-widest hover:bg-[#b89531] transition-all rounded-full shadow-sm w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" /> CREATE NEW PLAN
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-sm font-bold text-text-muted italic opacity-40">Syncing Membership Tiers...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    const isPro = plan.name.toLowerCase().includes('pro');
    const isPremium = plan.name.toLowerCase().includes('premium');
    const Icon = plan.icon === 'gem' ? Gem : (plan.icon === 'crown' ? Crown : Star);
    
    // Determine colors based on tier
    let topBorder = 'bg-slate-200';
    let iconColor = 'text-slate-400 bg-slate-100';
    let checkColor = 'text-slate-400';
    let badgeBg = 'bg-slate-100 text-slate-700';
    
    if (isPro) {
        topBorder = 'bg-[#cca839]';
        iconColor = 'text-[#cca839] bg-[#cca839]/10';
        checkColor = 'text-[#cca839]';
        badgeBg = 'bg-[#cca839]/10 text-[#cca839]';
    } else if (isPremium) {
        topBorder = 'bg-slate-800';
        iconColor = 'text-slate-800 bg-slate-100';
        checkColor = 'text-[#cca839]';
        badgeBg = 'bg-slate-200/60 text-slate-800';
    }

    return (
        <div className={`relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md`}>
            <div className={`h-[6px] w-full ${topBorder}`} />
            <div className="p-6 text-left">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-full ${iconColor}`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#cca839] transition-all"><Edit2 size={14} /></button>
                        <button onClick={onDelete} className="p-2 border border-slate-100 rounded-full hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                    </div>
                </div>
                
                <div className="space-y-1 mb-6">
                    <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tighter">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-black text-slate-800 tracking-tighter">₹{plan.price}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">/ {plan.duration} DAYS</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                        {plan.taxType === 'including' ? `INCL. ${plan.taxRate}% GST` : `EXCL. ${plan.taxRate}% GST`}
                    </div>
                </div>
                
                <div className="space-y-3 mb-6">
                    {plan.benefits.slice(0, 4).map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-[11px] font-bold text-slate-700">
                            <Check size={14} className={`${checkColor} shrink-0 mt-0.5`} />
                            <span>{benefit}</span>
                        </div>
                    ))}
                    
                    <div className="pt-4 mt-2 space-y-2.5">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 px-4 rounded-full border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Layout size={12} className="text-slate-400" />
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-wide">ALL SERVICES</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${badgeBg}`}>
                                {plan.serviceDiscountValue}{plan.serviceDiscountType === 'percentage' ? '% OFF' : '₹ OFF'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 px-4 rounded-full border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Layout size={12} className="text-slate-400" />
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-wide">ALL PRODUCTS</p>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${badgeBg}`}>
                                {plan.productDiscountValue}{plan.productDiscountType === 'percentage' ? '% OFF' : '₹ OFF'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <button onClick={onToggle} className={`w-full py-3 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${plan.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {plan.isActive ? 'STATUS: ACTIVE' : 'STATUS: PAUSED'}
                </button>
            </div>
        </div>
    );
}

function PlanModal({ plan, serviceOptions = [], onClose, onSave }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const [formData, setFormData] = useState(() => {
        if (plan) {
            return {
                ...plan,
                taxType: plan.taxType || 'excluding',
                taxRate: plan.taxRate !== undefined ? plan.taxRate : 0
            };
        }
        return { 
            name: '', 
            price: '', 
            duration: 30, 
            benefits: [''], 
            serviceDiscountValue: 0,
            serviceDiscountType: 'percentage',
            productDiscountValue: 0,
            productDiscountType: 'percentage',
            taxType: 'excluding',
            taxRate: 0,
            icon: 'star', 
            gradient: 'linear-gradient(135deg, #1A1A1A 0%, #333 100%)', 
            isPopular: false 
        };
    });

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    // Calculate tax breakdown
    const basePrice = Number(formData.price || 0);
    const taxRate = Number(formData.taxRate || 0);
    let calculatedBase = 0;
    let calculatedTax = 0;
    let calculatedTotal = 0;

    if (formData.taxType === 'including') {
        calculatedTotal = basePrice;
        calculatedBase = basePrice / (1 + taxRate / 100);
        calculatedTax = calculatedTotal - calculatedBase;
    } else {
        calculatedBase = basePrice;
        calculatedTax = basePrice * (taxRate / 100);
        calculatedTotal = basePrice + calculatedTax;
    }

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative bg-white border border-slate-200 w-full max-w-lg shadow-2xl rounded-2xl flex flex-col max-h-[90vh] text-left overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                        <Crown className="w-5 h-5 text-primary" />
                        {plan ? 'EDIT MEMBERSHIP PLAN' : 'CREATE MEMBERSHIP PLAN'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 flex-1 overflow-y-auto no-scrollbar space-y-6 italic text-slate-800">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">PLAN NAME</label>
                            <input 
                                className="w-full h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 outline-none focus:bg-white focus:border-primary rounded-none" 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="E.G. GOLD MEMBER"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">PRICE (₹)</label>
                            <input 
                                type="number" 
                                className="w-full h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 outline-none focus:bg-white focus:border-primary rounded-none" 
                                value={formData.price} 
                                onChange={e => setFormData({ ...formData, price: e.target.value })} 
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Validity & Icon */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">VALIDITY (DAYS)</label>
                            <input 
                                type="number" 
                                className="w-full h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 outline-none focus:bg-white focus:border-primary rounded-none" 
                                value={formData.duration} 
                                onChange={e => setFormData({ ...formData, duration: e.target.value })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">PLAN ICON</label>
                            <select 
                                className="w-full h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 uppercase tracking-wider outline-none focus:bg-white focus:border-primary rounded-none" 
                                value={formData.icon} 
                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                            >
                                <option value="star">Star</option>
                                <option value="crown">Crown</option>
                                <option value="gem">Gem</option>
                            </select>
                        </div>
                    </div>

                    {/* Tax configuration section (GST) */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tax Configuration (GST)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Tax Type</span>
                                <div className="grid grid-cols-2 gap-1 bg-slate-50 border border-slate-200 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, taxType: 'excluding' })}
                                        className={`py-2 px-1 font-black text-[9px] uppercase tracking-widest transition-all text-center rounded-none ${formData.taxType === 'excluding' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Excl.
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, taxType: 'including' })}
                                        className={`py-2 px-1 font-black text-[9px] uppercase tracking-widest transition-all text-center rounded-none ${formData.taxType === 'including' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        Incl.
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">GST Rate</span>
                                <select
                                    className="w-full h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 uppercase tracking-widest outline-none focus:bg-white focus:border-primary rounded-none"
                                    value={formData.taxRate}
                                    onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                >
                                    <option value="0">0% (EXEMPT)</option>
                                    <option value="5">5% GST</option>
                                    <option value="12">12% GST</option>
                                    <option value="18">18% GST</option>
                                    <option value="28">28% GST</option>
                                </select>
                            </div>
                        </div>

                        {/* Live Billing breakdown summary */}
                        <div className="p-4 bg-slate-50 border border-slate-100 space-y-2">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pricing & GST Breakdown</div>
                            <div className="flex justify-between text-xs font-black text-slate-800">
                                <span className="text-slate-400 uppercase">Base Price:</span>
                                <span>₹{calculatedBase.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black text-primary">
                                <span className="uppercase">GST ({taxRate}%):</span>
                                <span>{formData.taxType === 'including' ? 'INCLUDED' : '+'} ₹{calculatedTax.toFixed(2)}</span>
                            </div>
                            <div className="h-[1px] bg-slate-200 my-1" />
                            <div className="flex justify-between text-sm font-black text-slate-950">
                                <span className="uppercase">Net Payable Amount:</span>
                                <span>₹{calculatedTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PLAN BENEFITS</label>
                            <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })} 
                                className="text-[8px] font-black text-primary uppercase tracking-widest hover:underline"
                            >
                                + ADD BENEFIT
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.benefits.map((b, i) => (
                                <div key={i} className="flex gap-2">
                                    <input 
                                        value={b} 
                                        onChange={e => handleBenefitChange(i, e.target.value)} 
                                        className="flex-1 h-10 bg-slate-50 border border-slate-200 px-3 text-[11px] font-black text-slate-950 italic outline-none focus:bg-white focus:border-primary rounded-none" 
                                        placeholder="E.G. 10% OFF ON HAIRCUTS" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, idx) => idx !== i) })} 
                                        className="px-3 text-rose-500 border border-slate-200 hover:bg-rose-50 hover:border-rose-500 transition-colors bg-white rounded-none"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Service & Product Discounts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        {/* Service Discount */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Benefits (All Services)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="flex-1 h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 outline-none focus:bg-white focus:border-primary rounded-none" 
                                    placeholder="Value"
                                    value={formData.serviceDiscountValue} 
                                    onChange={e => setFormData({ ...formData, serviceDiscountValue: Number(e.target.value) })} 
                                />
                                <select 
                                    className="w-24 h-11 bg-slate-50 border border-slate-200 px-2 text-[9px] font-black text-slate-950 uppercase tracking-tighter outline-none focus:bg-white focus:border-primary rounded-none"
                                    value={formData.serviceDiscountType}
                                    onChange={e => setFormData({ ...formData, serviceDiscountType: e.target.value })}
                                >
                                    <option value="percentage">% OFF</option>
                                    <option value="flat">₹ FLAT</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Discount */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Benefits (All Products)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="flex-1 h-11 bg-slate-50 border border-slate-200 px-3 text-xs font-black text-slate-950 outline-none focus:bg-white focus:border-primary rounded-none" 
                                    placeholder="Value"
                                    value={formData.productDiscountValue} 
                                    onChange={e => setFormData({ ...formData, productDiscountValue: Number(e.target.value) })} 
                                />
                                <select 
                                    className="w-24 h-11 bg-slate-50 border border-slate-200 px-2 text-[9px] font-black text-slate-950 uppercase tracking-tighter outline-none focus:bg-white focus:border-primary rounded-none"
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

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button 
                        onClick={() => onSave(formData)} 
                        className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3 rounded-full"
                    >
                        SAVE MEMBERSHIP PLAN <Save size={14} />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
