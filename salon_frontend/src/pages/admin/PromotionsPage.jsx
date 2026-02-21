import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import api from '../../services/api';

const typeLabels = { flat: 'Flat ₹ Off', percentage: '% Off', combo: 'Combo Deal' };
const typeColors = { flat: 'bg-green-50 text-green-600', percentage: 'bg-blue-50 text-blue-600', combo: 'bg-purple-50 text-purple-600' };

export default function PromotionsPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true });

    const fetchPromos = async () => {
        try { setLoading(true); const { data } = await api.get('/promotions'); setPromos(data.data || data || []); }
        catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPromos(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/promotions/${editing._id}`, form); }
            else { await api.post('/promotions', form); }
            setShowModal(false); setEditing(null);
            setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true });
            fetchPromos();
        } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this promotion?')) return;
        try { await api.delete(`/promotions/${id}`); fetchPromos(); } catch { alert('Error'); }
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({ name: p.name, type: p.type, value: p.value, startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '', usageLimit: p.usageLimit || '', isActive: p.isActive });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-text">Promotions</h1><p className="text-sm text-text-secondary mt-1">{promos.length} promotions</p></div>
                <button onClick={() => { setEditing(null); setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Promotion</button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : promos.length === 0 ? (
                    <div className="col-span-full text-center py-20"><Tag className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No promotions yet</p></div>
                ) : (
                    promos.map((p) => (
                        <div key={p._id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[p.type] || 'bg-gray-50 text-gray-500'}`}>{typeLabels[p.type]}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit className="w-4 h-4 text-text-secondary" /></button>
                                    <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-error/10"><Trash2 className="w-4 h-4 text-text-secondary" /></button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-text">{p.name}</h3>
                            <div className="text-2xl font-bold text-primary mt-1">{p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`}</div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                                <Calendar className="w-3 h-3" />
                                {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'} — {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}
                            </div>
                            {p.usageLimit && <p className="text-xs text-text-muted mt-1">Usage limit: {p.usageLimit}</p>}
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editing ? 'Edit Promotion' : 'Add Promotion'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Type *</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                        <option value="percentage">Percentage</option><option value="flat">Flat Amount</option><option value="combo">Combo</option>
                                    </select>
                                </div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Value *</label><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Usage Limit</label><input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="Leave empty for unlimited" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Add Promotion'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
