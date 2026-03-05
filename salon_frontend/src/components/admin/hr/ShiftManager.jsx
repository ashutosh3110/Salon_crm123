import { useState, useMemo } from 'react';
import { Clock, Users, Plus, Edit2, Trash2, Store, Calendar, ArrowRight, Briefcase, Shield, X, CheckCircle2, MoreVertical, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const OUTLETS = ['Main Branch', 'City Center', 'West End', 'Bandra Branch'];
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];
const TW_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-primary'];

const STAFF_LIST = [
    { id: 1, name: 'Ananya Sharma', outlet: 'Main Branch' },
    { id: 2, name: 'Rahul Verma', outlet: 'City Center' },
    { id: 3, name: 'Sneha Kapur', outlet: 'Main Branch' },
    { id: 4, name: 'Vikram Malhotra', outlet: 'West End' },
    { id: 5, name: 'Priya Singh', outlet: 'Main Branch' },
];

const INITIAL_SHIFTS = [
    { id: 1, name: 'Morning Shift', start: '09:00', end: '17:00', staffCount: 12, outlet: 'Main Branch', color: 'bg-emerald-500', hex: '#10b981', assignedStaff: [1, 3] },
    { id: 2, name: 'Evening Shift', start: '13:00', end: '21:00', staffCount: 8, outlet: 'Main Branch', color: 'bg-blue-500', hex: '#3b82f6', assignedStaff: [2] },
    { id: 3, name: 'Full Day', start: '10:00', end: '20:00', staffCount: 4, outlet: 'City Center', color: 'bg-violet-500', hex: '#8b5cf6', assignedStaff: [4, 5] },
];

const EMPTY_FORM = { name: '', start: '09:00', end: '17:00', outlet: OUTLETS[0], color: TW_COLORS[0], hex: COLORS[0] };

const to12 = (t) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function ShiftManager() {
    const [shifts, setShifts] = useState(INITIAL_SHIFTS);
    const [shiftModal, setShiftModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [rosterModal, setRosterModal] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const chartData = useMemo(() => shifts.map(s => ({
        name: s.name.split(' ')[0],
        count: s.assignedStaff.length,
        color: s.hex
    })), [shifts]);

    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setShiftModal(true); };
    const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, start: s.start, end: s.end, outlet: s.outlet, color: s.color, hex: s.hex }); setShiftModal(true); };

    const saveShift = (e) => {
        e.preventDefault();
        if (editTarget) {
            setShifts(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
            showToast(`${form.name} updated`);
        } else {
            setShifts(prev => [...prev, { id: Date.now(), ...form, staffCount: 0, assignedStaff: [] }]);
            showToast(`${form.name} created`);
        }
        setShiftModal(false);
    };

    const deleteShift = (id) => {
        const t = shifts.find(s => s.id === id);
        setShifts(prev => prev.filter(s => s.id !== id));
        setDeleteConfirm(null);
        showToast(`${t?.name} deleted`);
    };

    const toggleRosterStaff = (shiftId, staffId) => {
        setShifts(prev => prev.map(s => {
            if (s.id !== shiftId) return s;
            const assigned = s.assignedStaff.includes(staffId)
                ? s.assignedStaff.filter(i => i !== staffId)
                : [...s.assignedStaff, staffId];
            return { ...s, assignedStaff: assigned, staffCount: assigned.length };
        }));
    };

    return (
        <div className="space-y-6 font-black text-left">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-black">
                <div className="flex items-center gap-4 px-6 py-4 bg-surface rounded-none border border-border shadow-sm text-left font-black">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="text-left font-black">
                        <h2 className="text-sm font-black text-text uppercase tracking-[0.2em] leading-none">Temporal Resource Grid</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5 leading-none">{shifts.length} OPERATIONAL VECTORS ACTIVE</p>
                    </div>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-3 px-8 py-4 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all">
                    <Plus className="w-4 h-4" /> New Pattern Entry
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                {/* Shift List */}
                <div className="lg:col-span-2 space-y-4 text-left font-black">
                    <div className="flex items-center justify-between px-2 mb-2 text-left font-black">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Operational Sequences</h3>
                        <div className="flex items-center gap-2 text-left">
                            <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live Stream</span>
                        </div>
                    </div>
                    {shifts.map(shift => (
                        <motion.div key={shift.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-surface p-6 rounded-none border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left font-black">
                            <div className={`absolute top-0 left-0 w-2 h-full ${shift.color}`} />
                            <div className="pl-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left font-black">
                                <div className="flex items-center gap-6 text-left">
                                    <div className={`p-4 rounded-none ${shift.color}/5 border border-border/10`}>
                                        <Clock className={`w-6 h-6 ${shift.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <h4 className="text-base font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors text-left">{shift.name}</h4>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                            <div className="flex items-center gap-1.5 text-left"><Clock className="w-3.5 h-3.5" /> {to12(shift.start)} — {to12(shift.end)}</div>
                                            <div className="w-1 h-1 bg-border rounded-none" />
                                            <div className="flex items-center gap-1.5 text-left"><Store className="w-3.5 h-3.5" /> {shift.outlet}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 border-t sm:border-t-0 pt-6 sm:pt-0 text-left font-black">
                                    <button onClick={() => setRosterModal(shift)} className="text-left group/roster hover:opacity-80 transition-opacity">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 leading-none">Personnel</p>
                                        <div className="flex items-center gap-2 text-left font-black">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="text-2xl font-black text-primary tracking-tighter leading-none">{shift.assignedStaff.length}</span>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2 text-left">
                                        <button onClick={() => openEdit(shift)} className="p-3 rounded-none border border-border hover:bg-surface-alt transition-all text-text-muted hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => setDeleteConfirm(shift.id)} className="p-3 rounded-none border border-border hover:bg-rose-500/10 transition-all text-text-muted hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <button onClick={openAdd}
                        className="w-full py-6 border border-dashed border-border rounded-none text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 group">
                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Sync Custom Pattern
                    </button>
                </div>

                {/* Sidebar avec Graphe */}
                <div className="space-y-6 text-left font-black">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Resource Analytics</h3>

                    <div className="bg-surface p-8 rounded-none border border-border shadow-sm text-left font-black">
                        <div className="flex items-center justify-between mb-8 text-left">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Personnel Load</span>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <div className="h-[200px] w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} width={60} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                    <Bar dataKey="count" radius={0} barSize={16}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4 text-left font-black">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Full Capacity</p>
                                <p className="text-xl font-black text-text mt-2 leading-none">{shifts.reduce((s, sh) => s + sh.assignedStaff.length, 0)} Units</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Outlets Sync</p>
                                <p className="text-xl font-black text-text mt-2 leading-none">{[...new Set(shifts.map(s => s.outlet))].length} Nodes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-text p-8 rounded-none shadow-xl shadow-text/10 relative overflow-hidden group border border-text text-left font-black">
                        <div className="relative z-10 text-left">
                            <div className="flex items-center gap-3 mb-6 text-left">
                                <div className="p-3 rounded-none bg-white text-text border border-white/20"><Briefcase className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Roster Logic</span>
                            </div>
                            <h3 className="text-lg font-black text-background mb-3 uppercase tracking-tight text-left">Spatial Rotation</h3>
                            <p className="text-[10px] text-background/60 leading-relaxed mb-8 uppercase font-bold tracking-widest text-left">Initialize multi-point staff rotation and load balancing across all operational nodes.</p>
                            <button onClick={() => shifts[0] && setRosterModal(shifts[0])} className="w-full flex items-center justify-between px-6 py-4 rounded-none bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                                Launch Matrix Tool <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rotate-12" />
                    </div>
                </div>
            </div>

            {/* Modalities style industrial */}
            <AnimatePresence>
                {shiftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShiftModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-none border border-border shadow-2xl relative p-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">{editTarget ? 'Modify Vector' : 'Define Sequence'}</h2>
                                <button onClick={() => setShiftModal(false)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-6 h-6" /></button>
                            </div>
                            <form onSubmit={saveShift} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Signal Identity *</label>
                                    <input required type="text" placeholder="e.g. ALPHA_MORNING"
                                        className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none"
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Start_In</label>
                                        <input required type="time" className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase"
                                            value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">End_Out</label>
                                        <input required type="time" className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase"
                                            value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Target Node</label>
                                    <select required className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                        value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))}>
                                        {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Chromatic Code</label>
                                    <div className="flex gap-3">
                                        {TW_COLORS.map((c, i) => (
                                            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c, hex: COLORS[i] }))}
                                                className={`w-10 h-10 rounded-none ${c} border-4 transition-all ${form.color === c ? 'border-text scale-110 shadow-xl' : 'border-transparent'}`} />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                                    {editTarget ? 'Override Sequence' : 'Commit To Registry'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Roster Modal industrial */}
            <AnimatePresence>
                {rosterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRosterModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-none border border-border shadow-2xl relative p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Personnel Map</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest leading-none">{rosterModal.name} · {to12(rosterModal.start)} — {to12(rosterModal.end)}</p>
                                </div>
                                <button onClick={() => setRosterModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {STAFF_LIST.map(s => {
                                    const currentShift = shifts.find(sh => sh.id === rosterModal.id);
                                    const isAssigned = currentShift?.assignedStaff.includes(s.id);
                                    return (
                                        <button key={s.id} type="button"
                                            onClick={() => { toggleRosterStaff(rosterModal.id, s.id); setRosterModal(sh => ({ ...sh, assignedStaff: isAssigned ? sh.assignedStaff.filter(i => i !== s.id) : [...sh.assignedStaff, s.id] })); }}
                                            className={`w-full flex items-center justify-between p-4 rounded-none border transition-all text-left ${isAssigned ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-background border-border/40 hover:border-primary/20'}`}>
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/10">
                                                    {s.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="text-left leading-tight">
                                                    <p className="text-xs font-black text-text uppercase tracking-tight text-left">{s.name}</p>
                                                    <p className="text-[9px] text-text-muted uppercase tracking-widest text-left">{s.outlet}</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all ${isAssigned ? 'bg-primary border-primary' : 'border-border/40'}`}>
                                                {isAssigned && <CheckCircle2 className="w-4 h-4 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => { showToast(`Roster locked for ${rosterModal.name}`); setRosterModal(null); }}
                                className="w-full mt-8 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                                Commit Personnel Roster
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirm industrial */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-none border border-border shadow-2xl relative p-10 text-center">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-none flex items-center justify-center mx-auto mb-8 border border-rose-500/10 text-rose-500"><Trash2 className="w-8 h-8" /></div>
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.1em]">Terminate Sequence?</h3>
                            <p className="text-[10px] text-text-muted mt-3 mb-8 uppercase font-bold tracking-widest leading-relaxed">Staff assignments will be voided across the spatial grid.</p>
                            <div className="flex flex-col gap-3 font-black">
                                <button onClick={() => deleteShift(deleteConfirm)} className="w-full py-4 bg-rose-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all">Terminate</button>
                                <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-background border border-border rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">Abort</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl shadow-black/40">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
