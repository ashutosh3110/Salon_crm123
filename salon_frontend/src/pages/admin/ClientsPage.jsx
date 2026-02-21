import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, Star, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', gender: 'female', notes: '' });

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/clients');
            // Backend returns { results: [], ... } for paginated queries
            const list = data?.data?.results || data?.results || data?.data || data || [];
            setClients(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient._id}`, form);
            } else {
                await api.post('/clients', form);
            }
            setShowModal(false);
            setEditingClient(null);
            setForm({ name: '', email: '', phone: '', gender: 'female', notes: '' });
            fetchClients();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving client');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
        } catch (err) {
            alert('Error deleting client');
        }
    };

    const openEdit = (client) => {
        setEditingClient(client);
        setForm({ name: client.name, email: client.email || '', phone: client.phone, gender: client.gender || 'female', notes: client.notes || '' });
        setShowModal(true);
    };

    const filtered = clients.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Clients</h1>
                    <p className="text-sm text-text-secondary mt-1">{clients.length} total clients</p>
                </div>
                <button
                    onClick={() => { setEditingClient(null); setForm({ name: '', email: '', phone: '', gender: 'female', notes: '' }); setShowModal(true); }}
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-white rounded-lg border border-border px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or email..."
                    className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">{search ? 'No clients match your search' : 'No clients yet'}</p>
                        <p className="text-xs text-text-muted mt-1">Click "Add Client" to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface">
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Name</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Phone</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden sm:table-cell">Email</th>
                                    <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden md:table-cell">Loyalty Pts</th>
                                    <th className="text-right px-5 py-3 font-semibold text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((client) => (
                                    <tr key={client._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {client.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="font-medium text-text">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-text-secondary">
                                            <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>
                                        </td>
                                        <td className="px-5 py-3 text-text-secondary hidden sm:table-cell">
                                            {client.email ? <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span> : '—'}
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                                                <Star className="w-3 h-3" />{client.loyaltyPoints || 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(client)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4 text-text-secondary" />
                                                </button>
                                                <button onClick={() => handleDelete(client._id)} className="p-2 rounded-lg hover:bg-error/10 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4 text-text-secondary hover:text-error" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-text mb-5">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="Client name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone *</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" placeholder="client@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Gender</label>
                                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" placeholder="Any notes about this client..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:bg-surface transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-2.5">{editingClient ? 'Update' : 'Add Client'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// For the empty state icon
function Users(props) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
