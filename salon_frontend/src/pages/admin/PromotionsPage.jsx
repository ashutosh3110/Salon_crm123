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
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Campaign Matrix</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em]">{promos.length} active protocols</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Protocol
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20"><div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" /></div>
                ) : promos.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-surface border border-border">
                        <Tag className="w-12 h-12 text-text-muted mx-auto mb-6 opacity-20" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Active Protocols</h3>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-2">Ready to broadcast new campaigns</p>
                    </div>
                ) : (
                    promos.map((p) => (
                        <div key={p._id} className="bg-surface rounded-none border border-border p-6 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between mb-6">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-none uppercase tracking-widest ${typeColors[p.type] || 'bg-gray-50 text-gray-500'} bg-opacity-10 border border-current`}>{typeLabels[p.type]}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(p)} className="p-2 rounded-none bg-surface-alt border border-border text-text-muted hover:text-primary transition-all"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p._id)} className="p-2 rounded-none bg-surface-alt border border-border text-text-muted hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-text uppercase tracking-tight">{p.name}</h3>
                            <div className="text-3xl font-black text-primary mt-1 tracking-tighter">{p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`}</div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'} // {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}
                            </div>
                            {p.usageLimit && <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1.5 opacity-60">Limit: {p.usageLimit} pulses</p>}
                            <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-none mt-4 uppercase tracking-widest border ${p.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-alt text-text-muted border-border'}`}>{p.isActive ? 'Operational' : 'Archived'}</span>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-6 border border-primary/20">
                                <Percent className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight">{editing ? 'Edit Protocol' : 'Add Protocol'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Configure marketing mechanics</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Protocol Name *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Logic Type *</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="percentage">Percentage</option>
                                        <option value="flat">Flat Amount</option>
                                        <option value="combo">Combo</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Value Magnitude *</label>
                                    <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Activation Date</label>
                                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Termination Date</label>
                                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Pulse Limit</label>
                                <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-5 py-3.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:border-primary outline-none transition-all" placeholder="Unlimited if null" />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4.5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all">{editing ? 'Commit' : 'Deploy Protocol'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
