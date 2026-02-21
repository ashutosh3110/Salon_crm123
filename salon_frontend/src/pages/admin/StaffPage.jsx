import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserCog, Mail, Phone, Shield } from 'lucide-react';
import api from '../../services/api';

const roleColors = {
    admin: 'bg-purple-50 text-purple-600',
    manager: 'bg-blue-50 text-blue-600',
    receptionist: 'bg-green-50 text-green-600',
    stylist: 'bg-pink-50 text-pink-600',
    accountant: 'bg-yellow-50 text-yellow-600',
    inventory_manager: 'bg-orange-50 text-orange-600',
};

export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'stylist', password: '' });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            // Backend returns { results: [], ... } for paginated queries
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setStaff(Array.isArray(list) ? list : []);
        }
        catch (err) {
            console.error('Failed to fetch staff:', err);
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
                await api.put(`/users/${editing._id}`, payload);
            } else {
                await api.post('/users', form);
            }
            setShowModal(false); setEditing(null);
            setForm({ name: '', email: '', phone: '', role: 'stylist', password: '' });
            fetchStaff();
        } catch (err) { alert(err.response?.data?.message || 'Error saving staff'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this staff member?')) return;
        try { await api.delete(`/users/${id}`); fetchStaff(); } catch { alert('Error deleting'); }
    };

    const openEdit = (u) => {
        setEditing(u);
        setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, password: '' });
        setShowModal(true);
    };

    const filtered = staff.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-2xl font-bold text-text">Staff</h1><p className="text-sm text-text-secondary mt-1">{staff.length} team members</p></div>
                <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', role: 'stylist', password: '' }); setShowModal(true); }} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Staff</button>
            </div>

            <div className="flex items-center bg-white rounded-lg border border-border px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-20"><UserCog className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No staff found</p></div>
                ) : (
                    filtered.map((u) => (
                        <div key={u._id} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                    {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-secondary"><Edit className="w-4 h-4 text-text-secondary" /></button>
                                    <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-error/10"><Trash2 className="w-4 h-4 text-text-secondary" /></button>
                                </div>
                            </div>
                            <h3 className="font-semibold text-text">{u.name}</h3>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 capitalize ${roleColors[u.role] || 'bg-gray-50 text-gray-500'}`}>
                                <Shield className="w-3 h-3" />{u.role?.replace('_', ' ')}
                            </span>
                            <div className="mt-3 space-y-1">
                                <p className="flex items-center gap-1 text-xs text-text-muted"><Mail className="w-3 h-3" />{u.email}</p>
                                {u.phone && <p className="flex items-center gap-1 text-xs text-text-muted"><Phone className="w-3 h-3" />{u.phone}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editing ? 'Edit Staff' : 'Add Staff Member'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Full Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Role *</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="admin">Admin</option><option value="manager">Manager</option><option value="receptionist">Receptionist</option>
                                    <option value="stylist">Stylist</option><option value="accountant">Accountant</option><option value="inventory_manager">Inventory Manager</option>
                                </select>
                            </div>
                            {!editing && <div><label className="block text-sm font-medium text-text-secondary mb-1">Password *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" /></div>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editing ? 'Update' : 'Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
