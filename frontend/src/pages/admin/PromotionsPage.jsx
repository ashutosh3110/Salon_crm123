import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent, TrendingUp, BarChart3, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useBusiness } from '../../contexts/BusinessContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const typeLabels = { flat: 'Fixed ₹ off bill', percentage: '% off bill', combo: 'Combo deal' };
const typeColors = {
    flat: 'bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-400',
    percentage: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    combo: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
};
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PromotionsPage() {
    const { outlets } = useBusiness();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Lock background scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showModal]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: '',
        type: 'percentage',
        value: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        usageLimitPerCustomer: 1,
        isActive: true,
        activationMode: 'AUTO',
        couponCode: '',
        applicableOn: 'BOTH',
        outletIds: []
    });

    const normalizePromo = (p) => {
        const t = String(p.type || '');
        const uiType = t === 'FLAT' ? 'flat' : (t === 'PERCENTAGE' ? 'percentage' : (t === 'COMBO' ? 'combo' : t));
        return {
            _id: p._id,
            name: p.name,
            type: uiType,
            value: p.value,
            startDate: p.startDate,
            endDate: p.endDate,
            usageLimit: p.totalUsageLimit ?? '',
            isActive: !!p.isActive,
            activationMode: p.activationMode || 'AUTO',
            couponCode: p.couponCode || '',
            usageLimitPerCustomer: p.usageLimitPerCustomer ?? 1,
            applicableOn: p.applicableOn || 'BOTH',
            outletIds: Array.isArray(p.outletIds) ? p.outletIds.map(o => typeof o === 'object' ? o._id : String(o)) : []
        };
    };

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await api.get('/promotions');
            const raw = res?.data?.results || res?.data?.data?.results || res?.data?.data || res?.data || [];
            const list = Array.isArray(raw) ? raw : [];
            setPromos(list.map(normalizePromo));
        } catch (e) {
            setPromos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const chartData = useMemo(() => {
        return promos.slice(0, 6).map((p, i) => ({
            name: (p.name || '').split(' ')[0],
            value: Number(p.value),
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [promos]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const commit = async () => {
            const payload = {
                name: form.name,
                description: '',
                type: form.type === 'flat' ? 'FLAT' : (form.type === 'combo' ? 'COMBO' : 'PERCENTAGE'),
                value: Number(form.value),
                startDate: form.startDate ? new Date(form.startDate) : undefined,
                endDate: form.endDate ? new Date(form.endDate) : undefined,
                isActive: !!form.isActive,
                activationMode: form.activationMode || 'AUTO',
                couponCode: form.activationMode === 'COUPON' ? String(form.couponCode).toUpperCase() : undefined,
                totalUsageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
                usageLimitPerCustomer: form.usageLimitPerCustomer ? Number(form.usageLimitPerCustomer) : 1,
                applicableOn: form.applicableOn,
                outletIds: form.outletIds
            };

            if (editing) {
                await api.patch(`/promotions/${editing._id}`, payload);
            } else {
                await api.post('/promotions', payload);
            }

            setShowModal(false);
            setEditing(null);
            setForm({
                name: '',
                type: 'percentage',
                value: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                usageLimitPerCustomer: 1,
                isActive: true,
                activationMode: 'AUTO',
                couponCode: '',
                applicableOn: 'BOTH',
                outletIds: []
            });
            fetchPromos();
        };

        commit().catch((err) => {
            const msg = err?.response?.data?.message || err?.message || 'Could not save coupon. Please try again.';
            toast.error(msg);
            fetchPromos();
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this coupon? This cannot be undone.')) return;
        api.delete(`/promotions/${id}`).then(() => fetchPromos());
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            name: p.name,
            type: p.type,
            value: p.value,
            startDate: p.startDate?.slice(0, 10) || '',
            endDate: p.endDate?.slice(0, 10) || '',
            usageLimit: p.usageLimit || '',
            usageLimitPerCustomer: p.usageLimitPerCustomer || 1,
            isActive: p.isActive,
            activationMode: p.activationMode || 'AUTO',
            couponCode: p.couponCode || '',
            applicableOn: p.applicableOn || 'BOTH',
            outletIds: p.outletIds || []
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 text-left font-black">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-2xl sm:text-3xl font-black text-text uppercase tracking-tight leading-none">Coupons & offers</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">{promos.length} offer{promos.length !== 1 ? 's' : ''} in your list</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', usageLimitPerCustomer: 1, isActive: true, activationMode: 'AUTO', couponCode: '', applicableOn: 'BOTH', outletIds: [] });
                        setShowModal(true);
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all font-black"
                >
                    <Plus className="w-4 h-4" /> Add coupon
                </button>
            </div>

            {!loading && promos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left font-black">
                    <div className="md:col-span-1 bg-surface p-8 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8 text-left">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Discount amounts</span>
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-[150px] w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="value" radius={0}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="md:col-span-1 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-black">
                        {[
                            { label: 'Active Matrix', value: promos.filter(p => p.isActive).length, icon: TrendingUp, color: 'emerald' },
                            { label: 'Avg Magnitude', value: `${promos.length > 0 ? Math.round(promos.reduce((s, p) => s + Number(p.value), 0) / promos.length) : 0} units`, icon: Percent, color: 'blue' },
                            { label: 'Expiring Soon', value: promos.filter(p => p.endDate && new Date(p.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'rose' },
                            { label: 'Total Volume', value: promos.length, icon: Tag, color: 'violet' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-surface p-6 rounded-none border border-border flex items-center gap-6 group hover:shadow-xl transition-all text-left">
                                <div className={`p-4 rounded-none bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-left leading-none font-black">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 leading-none">{stat.label}</p>
                                    <p className="text-2xl font-black text-text tracking-tighter leading-none">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left font-black">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-left">
                        <div className="w-12 h-12 border border-primary/20 border-t-primary rounded-none animate-spin mb-4" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">Loading offers...</p>
                    </div>
                ) : promos.length === 0 ? (
                    <div className="col-span-full text-center py-32 bg-surface rounded-none border border-border border-dashed text-left">
                        <Tag className="w-16 h-16 text-text-muted/20 mx-auto mb-8" />
                        <h3 className="text-sm font-black text-text uppercase tracking-[0.3em]">No coupons yet</h3>
                    </div>
                ) : (
                    promos.map((p) => (
                        <div key={p._id} className="bg-surface rounded-none border border-border p-8 hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative overflow-hidden text-left font-black">
                            <div className="flex items-start justify-between mb-8 text-left">
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-none uppercase tracking-widest ${typeColors[p.type] || 'bg-gray-50 text-gray-500'} bg-opacity-5 border border-current`}>{typeLabels[p.type]}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(p)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-primary transition-all"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p._id)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-text uppercase tracking-tight text-left leading-tight mb-2">{p.name}</h3>
                            <div className="text-5xl font-black text-primary tracking-tighter text-left leading-none mb-6">{p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`}</div>

                            <div className="space-y-3 pt-6 border-t border-border/40 text-left font-black">
                                <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                    <Calendar className="w-4 h-4 opacity-40" />
                                    {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'} → {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}
                                </div>
                                <div className="flex items-start gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                    <Tag className="w-4 h-4 opacity-40 mt-0.5" />
                                    <span>Applies to: <strong className="text-primary">{p.applicableOn === 'SERVICE' ? 'Services Only' : (p.applicableOn === 'PRODUCT' ? 'Products Only' : 'Both')}</strong></span>
                                </div>
                                <div className="flex items-start gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                    <TrendingUp className="w-4 h-4 opacity-40 mt-0.5" />
                                    <span className="line-clamp-2">Outlets: <strong className="text-primary">{p.outletIds.length === 0 ? 'All Outlets' : p.outletIds.map(id => outlets.find(o => o._id === id)?.name || 'Outlet').join(', ')}</strong></span>
                                </div>
                            </div>

                            <div className="absolute bottom-0 right-0 p-4 font-black">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${p.isActive ? 'text-emerald-500' : 'text-text-muted opacity-40'}`}>
                                    {p.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && createPortal(
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-none w-full max-w-xl shadow-2xl relative overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">{editing ? 'Edit Coupon' : 'Create New Offer'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your discount rules</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6 p-8 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Offer Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-slate-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Discount Type *</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-slate-900">
                                        <option value="percentage">Percent Off</option>
                                        <option value="flat">Fixed ₹ Off</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Discount Value *</label>
                                    <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Valid From</label>
                                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold focus:border-primary outline-none transition-all uppercase text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Valid Until</label>
                                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold focus:border-primary outline-none transition-all uppercase text-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Usage Limit</label>
                                    <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Usage Limit Per Customer</label>
                                    <input type="number" value={form.usageLimitPerCustomer} onChange={(e) => setForm({ ...form, usageLimitPerCustomer: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-slate-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">How It Applies</label>
                                    <select value={form.activationMode || 'AUTO'} onChange={(e) => setForm({ ...form, activationMode: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-slate-900">
                                        <option value="AUTO">Automatic</option>
                                        <option value="COUPON">Coupon Code</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Code</label>
                                    <input type="text" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-slate-900 disabled:opacity-40" disabled={form.activationMode !== 'COUPON'} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Discount Applies To *</label>
                                    <select value={form.applicableOn} onChange={(e) => setForm({ ...form, applicableOn: e.target.value })} className="w-full px-4 py-3 rounded-none bg-slate-50 border border-slate-200 text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-slate-900">
                                        <option value="BOTH">Both Services & Products</option>
                                        <option value="SERVICE">Services Only</option>
                                        <option value="PRODUCT">Products Only</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Applicable Outlets</label>
                                    <div className="border border-slate-200 p-3 bg-slate-50 max-h-[120px] overflow-y-auto space-y-2 rounded-none">
                                        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-700">
                                            <input type="checkbox" checked={form.outletIds.length === 0} onChange={() => setForm({ ...form, outletIds: [] })} className="accent-primary w-4 h-4 cursor-pointer" />
                                            All Outlets
                                        </label>
                                        {outlets && outlets.map(o => (
                                            <label key={o._id} className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-700">
                                                <input type="checkbox" checked={form.outletIds.includes(o._id)} onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setForm({ ...form, outletIds: [...form.outletIds, o._id] });
                                                    } else {
                                                        setForm({ ...form, outletIds: form.outletIds.filter(id => id !== o._id) });
                                                    }
                                                }} className="accent-primary w-4 h-4 cursor-pointer" />
                                                {o.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-none border border-slate-200 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-none font-bold text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-primary transition-all">{editing ? 'Save Changes' : 'Create Offer'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
