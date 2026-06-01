import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent, TrendingUp, BarChart3, X, Share2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
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
    const { user } = useAuth();
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Share modal states
    const [sharingPromo, setSharingPromo] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

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
        usageLimit: 1,
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
            usageLimit: p.totalUsageLimit ?? 1,
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
                totalUsageLimit: Number(form.usageLimit) || 1,
                usageLimitPerCustomer: Number(form.usageLimitPerCustomer) || 1,
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
                usageLimit: 1,
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
            usageLimit: p.usageLimit ?? 1,
            usageLimitPerCustomer: p.usageLimitPerCustomer ?? 1,
            isActive: p.isActive,
            activationMode: p.activationMode || 'AUTO',
            couponCode: p.couponCode || '',
            applicableOn: p.applicableOn || 'BOTH',
            outletIds: p.outletIds || []
        });
        setShowModal(true);
    };

    const fetchCustomersList = async () => {
        setCustomersLoading(true);
        try {
            const res = await api.get('/clients', { params: { page: 1, limit: 1000 } });
            const list = res.data?.data || res.data?.results || res.data || [];
            setCustomers(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error('[PromotionsPage] Customer fetch failed:', e);
            setCustomers([]);
        } finally {
            setCustomersLoading(false);
        }
    };

    const handleOpenShare = (p) => {
        setSharingPromo(p);
        setShareModalOpen(true);
        setSelectedCustomerId('');
        setCustomerSearch('');
        if (customers.length === 0) {
            fetchCustomersList();
        }
    };

    const handleSendPromo = async () => {
        if (!selectedCustomerId || !sharingPromo) return;
        setSendingWhatsApp(true);
        try {
            const res = await api.post(`/promotions/${sharingPromo._id}/share-whatsapp`, {
                customerId: selectedCustomerId
            });
            if (res.data?.success) {
                toast.success('Promotion shared successfully on WhatsApp!');
                setShareModalOpen(false);
                setSelectedCustomerId('');
                setCustomerSearch('');
            } else {
                toast.error(res.data?.message || 'Failed to send WhatsApp message');
            }
        } catch (err) {
            console.error('[PromotionsPage] Share WhatsApp error:', err);
            toast.error(err.response?.data?.message || 'Error sending WhatsApp promotion');
        } finally {
            setSendingWhatsApp(false);
        }
    };

    const filteredCustomers = useMemo(() => {
        let list = customers;

        // Filter by coupon's outlets if the coupon is restricted to specific outlets
        if (sharingPromo && sharingPromo.outletIds && sharingPromo.outletIds.length > 0) {
            list = list.filter(c => {
                const customerOutletId = c.lastOutletId?._id || c.lastOutletId;
                return customerOutletId && sharingPromo.outletIds.includes(String(customerOutletId));
            });
        }

        const q = customerSearch.trim().toLowerCase();
        if (!q) return list;
        return list.filter(c => 
            (c.name || '').toLowerCase().includes(q) || 
            (c.phone || '').includes(q)
        );
    }, [customers, customerSearch, sharingPromo]);

    return (
        <div className="space-y-4 text-left font-black">
            <style>{`
                /* Fix visibility of WhatsApp Share Icon in Light Mode */
                html:not(.dark) .share-button-icon {
                    color: #10b981 !important;
                    stroke: #10b981 !important;
                }
                html:not(.dark) .p-1.5:hover .share-button-icon {
                    color: #047857 !important;
                    stroke: #047857 !important;
                }
            `}</style>
            
            <div className="flex items-center justify-between gap-4 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-base sm:text-lg font-black text-text uppercase tracking-tight leading-none">Coupons & offers</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1.5 uppercase tracking-[0.2em] opacity-60 leading-none">{promos.length} offer{promos.length !== 1 ? 's' : ''} in your list</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: 1, usageLimitPerCustomer: 1, isActive: true, activationMode: 'AUTO', couponCode: '', applicableOn: 'BOTH', outletIds: [] });
                        setShowModal(true);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-primary/10 text-primary border border-primary px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] shadow-[0_0_12px_rgba(234,179,8,0.4)] hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all whitespace-nowrap cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" /> Add coupon
                </button>
            </div>

            {!loading && promos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 text-left font-black">
                    <div className="md:col-span-1 bg-surface p-4 rounded-2xl border border-border shadow-sm text-left font-black flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3 text-left">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em]">Discount amounts</span>
                            <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                        </div>
                        <div className="h-[120px] w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="md:col-span-1 xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left font-black">
                        {[
                            { label: 'Active Matrix', value: promos.filter(p => p.isActive).length, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Avg Magnitude', value: `${promos.length > 0 ? Math.round(promos.reduce((s, p) => s + Number(p.value), 0) / promos.length) : 0} units`, icon: Percent, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Expiring Soon', value: promos.filter(p => p.endDate && new Date(p.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                            { label: 'Total Volume', value: promos.length, icon: Tag, color: 'text-violet-500', bg: 'bg-violet-500/10' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-surface p-3 rounded-2xl border border-border flex items-center gap-3.5 group hover:shadow-md transition-all text-left">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div className="text-left leading-none font-black">
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.15em] mb-1 leading-none">{stat.label}</p>
                                    <p className="text-base font-black text-text tracking-tight leading-none">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left font-black">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-left">
                        <div className="w-8 h-8 border border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Loading offers...</p>
                    </div>
                ) : promos.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-surface rounded-2xl border border-border border-dashed text-left">
                        <Tag className="w-10 h-10 text-text-muted/20 mx-auto mb-3" />
                        <h3 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">No coupons yet</h3>
                    </div>
                ) : (
                    promos.map((p) => {
                        const showShare = p.outletIds.length === 0 || !user?.outletId || p.outletIds.includes(String(user?.outletId));
                        return (
                            <div key={p._id} className="bg-surface rounded-2xl border border-border p-4 hover:shadow-md hover:translate-y-[-1.5px] transition-all group relative overflow-hidden text-left font-black">
                                <div className="flex items-start justify-between mb-4 text-left">
                                    <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${typeColors[p.type] || 'bg-gray-50 text-gray-500'} bg-opacity-10 border border-current`}>{typeLabels[p.type]}</span>
                                    <div className="flex gap-1">
                                        {showShare && (
                                            <button onClick={() => handleOpenShare(p)} className="p-1.5 rounded-lg bg-surface border border-border text-emerald-500 hover:bg-emerald-50 transition-all hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]" title="Share on WhatsApp">
                                                <Share2 className="w-3 h-3 share-button-icon" />
                                            </button>
                                        )}
                                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-surface border border-border text-blue-500 hover:bg-blue-50 transition-all hover:shadow-[0_0_8px_rgba(59,130,246,0.3)]"><Edit className="w-3 h-3" /></button>
                                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg bg-surface border border-border text-rose-500 hover:bg-rose-50 transition-all hover:shadow-[0_0_8px_rgba(244,63,94,0.3)]"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <h3 className="text-sm font-black text-text uppercase tracking-tight text-left leading-tight mb-0.5">{p.name}</h3>
                                <div className="text-xl font-black text-primary tracking-tighter text-left leading-none mb-3">{p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`}</div>

                                <div className="space-y-1.5 pt-3 border-t border-border/40 text-left font-black">
                                    <div className="flex items-center gap-2 text-[8px] font-black text-text-muted uppercase tracking-wider text-left">
                                        <Calendar className="w-3 h-3 text-blue-500" />
                                        {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'} → {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}
                                    </div>
                                    <div className="flex items-start gap-2 text-[8px] font-black text-text-muted uppercase tracking-wider text-left">
                                        <Tag className="w-3 h-3 text-purple-500 mt-0.5" />
                                        <span>Applies to: <strong className="text-text">{p.applicableOn === 'SERVICE' ? 'Services Only' : (p.applicableOn === 'PRODUCT' ? 'Products Only' : 'Both')}</strong></span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[8px] font-black text-text-muted uppercase tracking-wider text-left">
                                        <TrendingUp className="w-3 h-3 text-emerald-500 mt-0.5" />
                                        <span className="line-clamp-2">Outlets: <strong className="text-text">{p.outletIds.length === 0 ? 'All Outlets' : p.outletIds.map(id => outlets.find(o => o._id === id)?.name || 'Outlet').join(', ')}</strong></span>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 right-0 p-3 font-black">
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${p.isActive ? 'text-emerald-500' : 'text-text-muted opacity-40'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 text-left" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden border border-border max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text">{editing ? 'Edit Coupon' : 'Create New Offer'}</h2>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Configure your discount rules</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white text-text-muted hover:text-rose-500 transition-all border border-transparent hover:border-border">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto no-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6 p-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Offer Name *</label>
                                    <input placeholder="e.g. SUMMER SALE" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-text placeholder:text-text-muted/40" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Discount Type *</label>
                                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-text">
                                            <option value="percentage">Percent Off</option>
                                            <option value="flat">Fixed ₹ Off</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Discount Value *</label>
                                        <input placeholder="0" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-text placeholder:text-text-muted/40" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Valid From</label>
                                        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold focus:border-primary outline-none transition-all uppercase text-text" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Valid Until</label>
                                        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold focus:border-primary outline-none transition-all uppercase text-text" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Usage Limit</label>
                                        <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-text" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Usage Limit Per Customer</label>
                                        <input type="number" value={form.usageLimitPerCustomer} onChange={(e) => setForm({ ...form, usageLimitPerCustomer: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-text" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">How It Applies</label>
                                        <select value={form.activationMode || 'AUTO'} onChange={(e) => setForm({ ...form, activationMode: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-text">
                                            <option value="AUTO">Automatic</option>
                                            <option value="COUPON">Coupon Code</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Code</label>
                                        <input placeholder="CODE10" type="text" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all text-text disabled:opacity-40 disabled:bg-surface" disabled={form.activationMode !== 'COUPON'} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Discount Applies To *</label>
                                        <select value={form.applicableOn} onChange={(e) => setForm({ ...form, applicableOn: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white border border-border text-xs font-bold uppercase tracking-widest focus:border-primary outline-none transition-all cursor-pointer text-text">
                                            <option value="BOTH">Both Services & Products</option>
                                            <option value="SERVICE">Services Only</option>
                                            <option value="PRODUCT">Products Only</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Applicable Outlets</label>
                                        <div className="border border-border p-3 bg-white max-h-[120px] overflow-y-auto space-y-2 rounded-xl">
                                            <label className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-text">
                                                <input type="checkbox" checked={form.outletIds.length === 0} onChange={() => setForm({ ...form, outletIds: [] })} className="accent-primary w-4 h-4 cursor-pointer" />
                                                All Outlets
                                            </label>
                                            {outlets && outlets.map(o => (
                                                <label key={o._id} className="flex items-center gap-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-text">
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
                                <div className="flex gap-4 pt-4 border-t border-border">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl border border-border text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted hover:bg-surface transition-all">Cancel</button>
                                    <button type="submit" className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all">{editing ? 'Save Changes' : 'Create Offer'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {shareModalOpen && sharingPromo && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-left" onClick={() => setShareModalOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden border border-border max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border bg-surface/50">
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text flex items-center gap-2">
                                    <Share2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                                    Share Promotion
                                </h2>
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">Send "{sharingPromo.name}" on WhatsApp</p>
                            </div>
                            <button type="button" onClick={() => setShareModalOpen(false)} className="p-2 rounded-xl hover:bg-surface text-text-muted hover:text-rose-500 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-text">
                            {/* Searchable Customer Dropdown */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-text-muted ml-1 uppercase tracking-widest block mb-1">Select Customer</label>
                                
                                {/* Search Input */}
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search customer name or phone..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border text-xs font-bold uppercase tracking-wider focus:border-primary outline-none text-text"
                                    />
                                </div>

                                {/* Customer List Dropdown Select */}
                                {customersLoading ? (
                                    <div className="text-center py-8 text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Loading Customers...</div>
                                ) : (
                                    <div className="border border-border max-h-[180px] overflow-y-auto divide-y divide-border bg-surface rounded-lg">
                                        {filteredCustomers.length === 0 ? (
                                            <div className="p-4 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No customers found</div>
                                        ) : (
                                            filteredCustomers.map(c => {
                                                const isSelected = selectedCustomerId === c._id;
                                                return (
                                                    <div 
                                                        key={c._id} 
                                                        onClick={() => setSelectedCustomerId(c._id)}
                                                        className={`p-3 text-xs font-bold uppercase cursor-pointer hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-between ${isSelected ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-text'}`}
                                                    >
                                                        <div className="text-left">
                                                            <p className="font-extrabold">{c.name}</p>
                                                            <p className="text-[9px] opacity-60 font-mono tracking-normal mt-0.5">{c.phone}</p>
                                                        </div>
                                                        {isSelected && <span className="text-[9px] font-black text-primary uppercase tracking-widest">Selected</span>}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border bg-surface/50 flex gap-3 shrink-0">
                            <button type="button" onClick={() => setShareModalOpen(false)} className="flex-1 py-3 border border-border rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:bg-surface transition-all">Cancel</button>
                            <button 
                                type="button" 
                                onClick={handleSendPromo}
                                disabled={!selectedCustomerId || sendingWhatsApp}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                            >
                                {sendingWhatsApp ? 'Sending...' : 'Send WhatsApp'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
