import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent, TrendingUp, BarChart3 } from 'lucide-react';
// import api from '../../services/api'; // Removed backend dependency
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

const typeLabels = { flat: 'Flat ₹ Off', percentage: '% Off', combo: 'Combo Deal' };
const typeColors = {
    flat: 'bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-400',
    percentage: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    combo: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
};
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MOCK_PROMOS = [
    { _id: 'p1', name: 'ALPHA FLASH 20', type: 'percentage', value: 20, startDate: '2024-03-01', endDate: '2024-03-31', usageLimit: 100, isActive: true },
    { _id: 'p2', name: 'FLAT 500 SAVER', type: 'flat', value: 500, startDate: '2024-03-05', endDate: '2024-03-15', usageLimit: 50, isActive: true },
    { _id: 'p3', name: 'WELCOME COMBO', type: 'combo', value: 1000, startDate: '2024-01-01', endDate: '2024-12-31', usageLimit: null, isActive: true }
];

export default function PromotionsPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true });

    // Mock fetch logic
    const fetchPromos = () => {
        setLoading(true);
        setTimeout(() => {
            const saved = localStorage.getItem('mock_promos');
            setPromos(saved ? JSON.parse(saved) : MOCK_PROMOS);
            setLoading(false);
        }, 800);
    };

    useEffect(() => { fetchPromos(); }, []);

    // Persist mock data to localStorage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('mock_promos', JSON.stringify(promos));
        }
    }, [promos, loading]);

    const chartData = useMemo(() => {
        return promos.slice(0, 6).map((p, i) => ({
            name: p.name.split(' ')[0],
            value: Number(p.value),
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [promos]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            setPromos(prev => prev.map(p => p._id === editing._id ? { ...p, ...form } : p));
        } else {
            const newPromo = { ...form, _id: `p-${Date.now()}` };
            setPromos(prev => [newPromo, ...prev]);
        }
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this promotion?')) return;
        setPromos(prev => prev.filter(p => p._id !== id));
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({ name: p.name, type: p.type, value: p.value, startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '', usageLimit: p.usageLimit || '', isActive: p.isActive });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 text-left font-black">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none">Campaign Matrix</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">{promos.length} ACTIVE PROTOCOLS DEPLOYED</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', usageLimit: '', isActive: true }); setShowModal(true); }}
                    className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Protocol
                </button>
            </div>

            {/* Top Analytics Section */}
            {!loading && promos.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                    <div className="lg:col-span-1 bg-surface p-8 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8 text-left">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Deployment Intensity</span>
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="h-[150px] w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Bar dataKey="value" radius={0}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-6 text-[8px] font-black text-text-muted uppercase tracking-[0.2em] text-center italic opacity-40">Vector Value Distribution</p>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-left font-black">
                        {[
                            { label: 'Active Matrix', value: promos.filter(p => p.isActive).length, icon: TrendingUp, color: 'emerald' },
                            { label: 'Avg Magnitude', value: `${Math.round(promos.reduce((s, p) => s + Number(p.value), 0) / promos.length)} units`, icon: Percent, color: 'blue' },
                            { label: 'Expiring Soon', value: promos.filter(p => p.endDate && new Date(p.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'rose' },
                            { label: 'Total Volume', value: promos.length, icon: Tag, color: 'violet' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-surface p-6 rounded-none border border-border flex items-center gap-6 group hover:shadow-xl transition-all text-left">
                                <div className={`p-4 rounded-none bg-${stat.color}-500/10 dark:bg-${stat.color}-900/40 text-${stat.color}-500 dark:text-${stat.color}-400 border border-${stat.color}-500/20 dark:border-${stat.color}-500/10 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-left leading-none font-black">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 leading-none">{stat.label}</p>
                                    <p className="text-2xl font-black text-text tracking-tighter leading-none">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left font-black">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-left">
                        <div className="w-12 h-12 border border-primary/20 border-t-primary rounded-none animate-spin mb-4" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] animate-pulse">Syncing Matrix...</p>
                    </div>
                ) : promos.length === 0 ? (
                    <div className="col-span-full text-center py-32 bg-surface rounded-none border border-border border-dashed text-left">
                        <Tag className="w-16 h-16 text-text-muted/20 mx-auto mb-8" />
                        <h3 className="text-sm font-black text-text uppercase tracking-[0.3em]">No Operational Protocols</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-3 opacity-60">Ready to broadcast new marketing mechanics.</p>
                    </div>
                ) : (
                    promos.map((p) => (
                        <div key={p._id} className="bg-surface rounded-none border border-border p-8 hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative overflow-hidden text-left font-black">
                            <div className="flex items-start justify-between mb-8 text-left">
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-none uppercase tracking-widest ${typeColors[p.type] || 'bg-gray-50 text-gray-500'} bg-opacity-5 border border-current`}>{typeLabels[p.type]}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(p)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-primary transition-all"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(p._id)} className="p-3 rounded-none bg-surface border border-border text-text-muted hover:text-rose-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-text uppercase tracking-tight text-left leading-tight mb-2">{p.name}</h3>
                            <div className="text-5xl font-black text-primary tracking-tighter text-left leading-none mb-6">{p.type === 'percentage' ? `${p.value}%` : `₹${p.value}`}</div>

                            <div className="space-y-3 pt-6 border-t border-border/40 text-left font-black">
                                <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                    <Calendar className="w-4 h-4 opacity-40" />
                                    {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : 'NULL'} // {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : 'NULL'}
                                </div>
                                {p.usageLimit && (
                                    <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                        <TrendingUp className="w-4 h-4 opacity-40" />
                                        Pulses: {p.usageLimit} LIMIT
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-0 right-0 p-4 font-black">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${p.isActive ? 'text-emerald-500' : 'text-text-muted opacity-40'}`}>
                                    {p.isActive ? '::: STANDBY :::' : '::: ARCHIVED :::'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-left font-black" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-xl p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border text-left font-black" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="w-20 h-20 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5">
                                <Percent className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">{editing ? 'Overwrite Protocol' : 'Sync New Matrix'}</h2>
                            <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.3em] opacity-60 leading-none">Module :: marketing_automation_v1.0</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 text-left font-black">
                            <div className="space-y-3 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Protocol Identifier *</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\\s]/g, '') })} required className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all" placeholder="e.g. ALPHA_FLASH_20" />
                            </div>
                            <div className="grid grid-cols-2 gap-8 text-left">
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Logic Variant *</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                        <option value="percentage">Percentage</option>
                                        <option value="flat">Flat Amount</option>
                                        <option value="combo">Combo</option>
                                    </select>
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Intensity Vector *</label>
                                    <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all" placeholder="00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 text-left font-black">
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Lock-In Pulse</label>
                                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black focus:border-primary outline-none transition-all uppercase" />
                                </div>
                                <div className="space-y-3 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">End Pulse</label>
                                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black focus:border-primary outline-none transition-all uppercase" />
                                </div>
                            </div>
                            <div className="space-y-3 text-left font-black">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] pl-1">Max Signal Pulses</label>
                                <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full px-6 py-4 rounded-none bg-surface-alt border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all" placeholder="Unlimited if null" />
                            </div>
                            <div className="flex gap-6 pt-10 font-black">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-none border border-border text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 py-5 bg-primary text-primary-foreground rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary-dark transition-all">{editing ? 'Commit Override' : 'Deploy Protocol'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
