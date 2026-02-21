import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Store, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';

export default function OutletsPage() {
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', address: '', phone: '', status: 'active' });

    const fetchOutlets = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/outlets');
            // Backend returns { results: [], ... } for paginated queries
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setOutlets(Array.isArray(list) ? list : []);
        }
        catch (err) {
            console.error('Failed to fetch outlets:', err);
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOutlets(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/outlets/${editing._id}`, form); }
            else { await api.post('/outlets', form); }
            setShowModal(false); setEditing(null); setForm({ name: '', address: '', phone: '', status: 'active' });
            fetchOutlets();
        } catch (err) { alert(err.response?.data?.message || 'Error saving outlet'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this outlet?')) return;
        try { await api.delete(`/outlets/${id}`); fetchOutlets(); } catch { alert('Error deleting'); }
    };

    const openEdit = (o) => { setEditing(o); setForm({ name: o.name, address: o.address || '', phone: o.phone || '', status: o.status || 'active' }); setShowModal(true); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-text">Outlets</h1><p className="text-sm text-text-secondary mt-1">{outlets.length} outlets</p></div>
                <button onClick={() => { setEditing(null); setForm({ name: '', address: '', phone: '', status: 'active' }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Outlet</button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : outlets.length === 0 ? (
                    <div className="col-span-full text-center py-20"><Store className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No outlets yet</p></div>
                ) : (
                    outlets.map((o) => (
                        <div key={o._id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Store className="w-5 h-5 text-primary" /></div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{o.status}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(o)} className="p-1 rounded hover:bg-secondary"><Edit className="w-3.5 h-3.5 text-text-secondary" /></button>
                                        <button onClick={() => handleDelete(o._id)} className="p-1 rounded hover:bg-error/10"><Trash2 className="w-3.5 h-3.5 text-text-secondary" /></button>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-semibold text-text">{o.name}</h3>
                            {o.address && <p className="flex items-center gap-1 text-xs text-text-muted mt-2"><MapPin className="w-3 h-3" />{o.address}</p>}
                            {o.phone && <p className="text-xs text-text-muted mt-1">📞 {o.phone}</p>}
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editing ? 'Edit Outlet' : 'Add New Outlet'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="active">Active</option><option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Add Outlet'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
