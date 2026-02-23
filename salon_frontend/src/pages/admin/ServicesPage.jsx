import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Scissors, Clock, IndianRupee } from 'lucide-react';
import api from '../../services/api';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: '' });

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/services');
            // Backend returns { results: [], ... } for paginated queries
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setServices(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Failed to fetch services:', err);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await api.put(`/services/${editing._id}`, form); }
            else { await api.post('/services', form); }
            setShowModal(false); setEditing(null);
            setForm({ name: '', description: '', price: '', duration: '', category: '' });
            fetchServices();
        } catch (err) { alert(err.response?.data?.message || 'Error saving service'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this service?')) return;
        try { await api.delete(`/services/${id}`); fetchServices(); } catch { alert('Error deleting'); }
    };

    const openEdit = (s) => {
        setEditing(s);
        setForm({ name: s.name, description: s.description || '', price: s.price, duration: s.duration, category: s.category || '' });
        setShowModal(true);
    };

    const filtered = services.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Services</h1>
                    <p className="text-sm text-text-secondary mt-1">{services.length} services</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', duration: '', category: '' }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Service
                </button>
            </div>

            <div className="flex items-center bg-white rounded-lg border border-border px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full" />
            </div>

            {/* Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <Scissors className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">No services found</p>
                    </div>
                ) : (
                    filtered.map((s) => (
                        <div key={s._id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit className="w-4 h-4 text-text-secondary" /></button>
                                    <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-error/10"><Trash2 className="w-4 h-4 text-text-secondary" /></button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-text">{s.name}</h3>
                            {s.category && <span className="inline-block text-xs bg-secondary text-text-secondary px-2 py-0.5 rounded mt-1">{s.category}</span>}
                            {s.description && <p className="text-xs text-text-muted mt-2 line-clamp-2">{s.description}</p>}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                                <span className="flex items-center gap-1 text-sm font-semibold text-text"><IndianRupee className="w-3.5 h-3.5" />{s.price}</span>
                                <span className="flex items-center gap-1 text-xs text-text-muted"><Clock className="w-3 h-3" />{s.duration} min</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editing ? 'Edit Service' : 'Add New Service'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="e.g. Hair, Skin, Nails" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Price (₹) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Duration (min) *</label><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" /></div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Add Service'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
