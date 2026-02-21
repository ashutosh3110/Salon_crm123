import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Building2,
    Search,
    Plus,
    Edit3,
    Ban,
    MoreHorizontal,
    X,
    Check,
} from 'lucide-react';

const planColors = {
    free: 'bg-slate-50 text-slate-600 border-slate-200',
    basic: 'bg-blue-50 text-blue-600 border-blue-200',
    premium: 'bg-primary/5 text-primary border-primary/20',
    enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
};

const statusColors = {
    active: 'bg-emerald-50 text-emerald-600',
    inactive: 'bg-slate-50 text-slate-600',
    suspended: 'bg-red-50 text-red-600',
};

export default function SATenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', phone: '', subscriptionPlan: 'free' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, [search, statusFilter, planFilter]);

    const fetchTenants = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (planFilter) params.subscriptionPlan = planFilter;

            const res = await api.get('/tenants', { params });
            const data = res.data;
            setTenants(Array.isArray(data) ? data : data.results || data.data || []);
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTenant = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/tenants', formData);
            setShowAddModal(false);
            setFormData({ name: '', slug: '', phone: '', subscriptionPlan: 'free' });
            fetchTenants();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create tenant');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateTenant = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/tenants/${editingTenant._id}`, {
                name: formData.name,
                phone: formData.phone,
                subscriptionPlan: formData.subscriptionPlan,
                status: formData.status,
            });
            setEditingTenant(null);
            fetchTenants();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update tenant');
        } finally {
            setSaving(false);
        }
    };

    const handleSuspend = async (tenant) => {
        if (!confirm(`Suspend "${tenant.name}"? This will disable their access.`)) return;
        try {
            await api.delete(`/tenants/${tenant._id}`);
            fetchTenants();
        } catch (err) {
            alert('Failed to suspend tenant');
        }
    };

    const openEdit = (tenant) => {
        setFormData({
            name: tenant.name,
            slug: tenant.slug,
            phone: tenant.phone || '',
            subscriptionPlan: tenant.subscriptionPlan,
            status: tenant.status,
        });
        setEditingTenant(tenant);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Tenant Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage all registered salons on the platform.</p>
                </div>
                <button
                    onClick={() => { setFormData({ name: '', slug: '', phone: '', subscriptionPlan: 'free' }); setShowAddModal(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" /> Add Tenant
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tenants..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-border text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
                <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-border text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm"
                >
                    <option value="">All Plans</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary font-medium">No tenants found</p>
                        <p className="text-xs text-text-muted mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface/50">
                                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Salon</th>
                                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Slug</th>
                                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Plan</th>
                                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Status</th>
                                    <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Created</th>
                                    <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tenants.map((tenant) => (
                                    <tr key={tenant._id} className="hover:bg-surface/30 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shrink-0">
                                                    {tenant.name?.[0]?.toUpperCase() || 'T'}
                                                </div>
                                                <span className="text-sm font-medium text-text">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-text-secondary font-mono">{tenant.slug}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border uppercase ${planColors[tenant.subscriptionPlan] || planColors.free}`}>
                                                {tenant.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[tenant.status] || statusColors.active}`}>
                                                {tenant.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-text-muted">
                                                {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(tenant)}
                                                    className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-text transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                {tenant.status !== 'suspended' && (
                                                    <button
                                                        onClick={() => handleSuspend(tenant)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-600 transition-colors"
                                                        title="Suspend"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-text">Add New Tenant</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-surface transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTenant} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Salon Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Slug *</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} required placeholder="my-salon" className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Plan</label>
                                <select value={formData.subscriptionPlan} onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm">
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                                    {saving ? 'Creating...' : 'Create Tenant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTenant && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-text">Edit Tenant</h3>
                            <button onClick={() => setEditingTenant(null)} className="p-1 rounded-lg hover:bg-surface transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateTenant} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Salon Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Plan</label>
                                    <select value={formData.subscriptionPlan} onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm">
                                        <option value="free">Free</option>
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingTenant(null)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text hover:bg-surface transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
