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
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Client Database</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em]">{clients.length} registered profiles</p>
                </div>
                <button
                    onClick={() => { setEditingClient(null); setForm({ name: '', email: '', phone: '', gender: 'female', notes: '' }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Profile
                </button>
            </div>

            <div className="flex items-center bg-surface-alt rounded-none border border-border px-4 py-3 max-w-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-4 h-4 text-text-muted mr-3" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Scan for name, phone, or email..."
                    className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-text placeholder:text-text-muted/40 outline-none w-full"
                />
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Matches Found</h3>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">System scan complete</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-surface-alt">
                                    <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Entity</th>
                                    <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Contact</th>
                                    <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden sm:table-cell">Comms</th>
                                    <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden md:table-cell">Karma pts</th>
                                    <th className="text-right px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((client) => (
                                    <tr key={client._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary shadow-sm group-hover:scale-105 transition-transform">
                                                    {client.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-black text-text uppercase tracking-tight">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-widest"><Phone className="w-3.5 h-3.5" />{client.phone}</span>
                                        </td>
                                        <td className="px-8 py-5 hidden sm:table-cell">
                                            {client.email ? <span className="inline-flex items-center gap-2 text-[11px] font-bold text-text-muted uppercase tracking-widest"><Mail className="w-3.5 h-3.5" />{client.email.toLowerCase()}</span> : <span className="text-[10px] font-black text-text-muted/30">N/A</span>}
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <span className="inline-flex items-center gap-2 text-primary font-black text-sm tabular-nums">
                                                <Star className="w-4 h-4 fill-primary/10" />{client.loyaltyPoints || 0}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(client)} className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-primary transition-all shadow-sm">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(client._id)} className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-rose-600 transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
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

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-6 border border-primary/20">
                                <UsersIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight">{editingClient ? 'Edit Profile' : 'New Profile'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Provisioning client data</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Full Identity *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="e.g. Alexandra V" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Comms Link *</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="+91..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Gender Tag</label>
                                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="female">FEMALE</option>
                                        <option value="male">MALE</option>
                                        <option value="other">OTHER</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Electronic Mail</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all placeholder:text-text-muted/20" placeholder="reach@domain.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Dossier Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all resize-none placeholder:text-text-muted/20" placeholder="Relevant history..." />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4.5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all">{editingClient ? 'Commit' : 'Deploy Profile'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// For the empty state icon
function UsersIcon(props) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
