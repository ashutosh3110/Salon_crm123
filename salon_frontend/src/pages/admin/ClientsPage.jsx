import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Phone, Mail, Star, Edit, Trash2, Users, TrendingUp, PieChart as PieIcon, BarChart3, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import api from '../../services/api';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const GENDER_COLORS = {
    female: '#f472b6',
    male: '#3b82f6',
    other: '#8b5cf6'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ClientsPage() {
    const { user } = useAuth();
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

    // Analytics Calculations
    const genderData = useMemo(() => {
        const counts = { female: 0, male: 0, other: 0 };
        clients.forEach(c => {
            const g = (c.gender || 'female').toLowerCase();
            if (counts[g] !== undefined) counts[g]++;
            else counts.other++;
        });
        return Object.keys(counts).map(g => ({
            name: g.toUpperCase(),
            value: counts[g],
            color: GENDER_COLORS[g] || '#cbd5e1'
        }));
    }, [clients]);

    const loyaltyData = useMemo(() => {
        const sorted = [...clients].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0)).slice(0, 6);
        return sorted.map((c, i) => ({
            name: c.name?.split(' ')[0] || 'UNK',
            points: c.loyaltyPoints || 0,
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [clients]);

    const stats = useMemo(() => ([
        { label: 'Total Base', value: clients.length, icon: Users, color: 'blue', trend: 'Verified' },
        { label: 'Elite Tier', value: clients.filter(c => (c.loyaltyPoints || 0) > 500).length, icon: Star, color: 'emerald', trend: '> 500 PTS' },
        { label: 'New Entities', value: clients.slice(0, 5).length, icon: TrendingUp, color: 'orange', trend: 'This Period' },
        { label: 'Comms Active', value: clients.filter(c => c.email).length, icon: Mail, color: 'violet', trend: 'Email Synced' }
    ]), [clients]);

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
        c.phone?.replace(/\D/g, '').includes(search.replace(/\D/g, '')) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Client Registry</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">System :: identification_matrix_v2.0 // master_database</p>
                </div>
                <button
                    onClick={() => { setEditingClient(null); setForm({ name: '', email: '', phone: '', gender: 'female', notes: '' }); setShowModal(true); }}
                    className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Profile
                </button>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />
                            <div className="relative z-10 flex flex-col justify-between h-full text-left">
                                <div className="flex items-center justify-between mb-4 text-left">
                                    <div className="flex items-center gap-3 text-left">
                                        <stat.icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{stat.label}</p>
                                    </div>
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.trend}</span>
                                </div>
                                <div className="flex items-end justify-between text-left">
                                    <h3 className="text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">
                                        <AnimatedCounter value={stat.value} />
                                    </h3>
                                    <div className="opacity-20 group-hover:opacity-100 transition-opacity stroke-[2px]">
                                        <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Identity Distribution Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Gender Ratio</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={genderData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left">
                        {genderData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Karma Pulse Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Karma Pulse</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={loyaltyData}>
                                <Bar dataKey="points" radius={0}>
                                    {loyaltyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Top Tier Entities</div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="flex items-center bg-surface rounded-none border border-border px-6 py-4 max-w-xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 text-left font-black">
                <Search className="w-4 h-4 text-text-muted mr-4" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Scan system for name, comms, or identity link..."
                    className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-text placeholder:text-text-muted/40 outline-none w-full"
                />
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden text-left font-black">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">System Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">Comms Link</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left hidden sm:table-cell">Electronic Mail</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left hidden md:table-cell">Karma pts</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left font-black">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="w-10 h-10 border border-primary/20 border-t-primary rounded-none animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Syncing Registry...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <ShieldAlert className="w-16 h-16 text-text-muted/20 mx-auto mb-6" />
                                        <h3 className="text-sm font-black text-text uppercase tracking-[0.3em]">No Entities Found</h3>
                                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.2em] opacity-60">System scan complete with null results.</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((client) => (
                                    <tr key={client._id} className="hover:bg-surface-alt/50 transition-all cursor-pointer group text-left">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-11 h-11 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-inner">
                                                    {client.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-sm font-black text-text uppercase tracking-tight leading-none mb-1">{client.name}</span>
                                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em] leading-none">Internal_Entity_ID: {client._id?.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            <span className="inline-flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest leading-none"><Phone className="w-3.5 h-3.5 opacity-40" />{maskPhone(client.phone, user?.role)}</span>
                                        </td>
                                        <td className="px-8 py-6 hidden sm:table-cell text-left">
                                            {client.email ? <span className="inline-flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-widest leading-none"><Mail className="w-3.5 h-3.5 opacity-40" />{client.email.toLowerCase()}</span> : <span className="text-[9px] font-black text-text-muted/20">ACCESS_RESTRICTED</span>}
                                        </td>
                                        <td className="px-8 py-6 hidden md:table-cell text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-border rounded-none overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (client.loyaltyPoints || 0) / 10)}%` }} />
                                                </div>
                                                <span className="text-sm font-black text-primary tracking-tighter leading-none">{client.loyaltyPoints || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 font-black">
                                                <button onClick={() => openEdit(client)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(client._id)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left font-black" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-xl p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border text-left font-black" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5">
                                <Users className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">{editingClient ? 'Overwrite Profile' : 'Deploy Identity'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Provisioning client data stream</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8 text-left font-black">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Full Identity *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="e.g. ALEXANDRA_V" />
                            </div>
                            <div className="grid grid-cols-2 gap-8 text-left">
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Comms Link *</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="+91..." />
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Gender Tag</label>
                                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="female">FEMALE</option>
                                        <option value="male">MALE</option>
                                        <option value="other">OTHER</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Electronic Mail</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black focus:border-primary outline-none transition-all placeholder:text-text-muted/10" placeholder="reach@node.com" />
                            </div>
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Dossier Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black focus:border-primary outline-none transition-all resize-none placeholder:text-text-muted/10" placeholder="Relevant history log..." />
                            </div>
                            <div className="flex gap-6 pt-10 font-black">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all">{editingClient ? 'Commit' : 'Deploy Identity'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
