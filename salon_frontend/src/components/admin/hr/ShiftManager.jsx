import { useState } from 'react';
import { Clock, Users, Plus, Edit2, Trash2, Store, Calendar, ArrowRight, Briefcase, Shield, X, CheckCircle2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OUTLETS = ['Main Branch', 'City Center', 'West End', 'Bandra Branch'];
const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-primary'];

const STAFF_LIST = [
    { id: 1, name: 'Ananya Sharma', outlet: 'Main Branch' },
    { id: 2, name: 'Rahul Verma', outlet: 'City Center' },
    { id: 3, name: 'Sneha Kapur', outlet: 'Main Branch' },
    { id: 4, name: 'Vikram Malhotra', outlet: 'West End' },
    { id: 5, name: 'Priya Singh', outlet: 'Main Branch' },
];

const INITIAL_SHIFTS = [
    { id: 1, name: 'Morning Shift', start: '09:00', end: '17:00', staffCount: 12, outlet: 'Main Branch', color: 'bg-emerald-500', assignedStaff: [1, 3] },
    { id: 2, name: 'Evening Shift', start: '13:00', end: '21:00', staffCount: 8, outlet: 'Main Branch', color: 'bg-blue-500', assignedStaff: [2] },
    { id: 3, name: 'Full Day', start: '10:00', end: '20:00', staffCount: 4, outlet: 'City Center', color: 'bg-violet-500', assignedStaff: [4, 5] },
];

const EMPTY_FORM = { name: '', start: '09:00', end: '17:00', outlet: OUTLETS[0], color: COLORS[0] };

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
    const [rosterModal, setRosterModal] = useState(null); // shift for roster
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setShiftModal(true); };
    const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, start: s.start, end: s.end, outlet: s.outlet, color: s.color }); setShiftModal(true); };

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
        <div className="space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-surface rounded-2xl border border-border/40 shadow-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-text">Shift Schedule Manager</span>
                    <div className="w-px h-4 bg-border/60 mx-1" />
                    <span className="text-[10px] font-black text-text-muted uppercase">{shifts.length} Active Shifts</span>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> Create New Shift
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Shift List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Active Shifts</h3>
                    {shifts.map(shift => (
                        <motion.div key={shift.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-surface p-5 rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${shift.color}`} />
                            <div className="pl-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-2xl ${shift.color}/10`}>
                                        <Clock className={`w-5 h-5 ${shift.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-text group-hover:text-primary transition-colors">{shift.name}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs font-bold text-text-secondary">
                                            <Clock className="w-3 h-3 text-text-muted" />
                                            {to12(shift.start)} — {to12(shift.end)}
                                            <span className="text-text-muted">·</span>
                                            <Store className="w-3 h-3 text-text-muted" />
                                            {shift.outlet}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <button onClick={() => setRosterModal(shift)} className="text-center group/roster hover:opacity-80 transition-opacity">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Assigned</p>
                                        <div className="flex items-center gap-1 justify-center mt-0.5">
                                            <Users className="w-3 h-3 text-primary" />
                                            <span className="text-sm font-black text-primary">{shift.assignedStaff.length}</span>
                                        </div>
                                        <p className="text-[8px] font-bold text-primary underline hidden group-hover/roster:block">Manage</p>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(shift)} className="p-2 rounded-xl border border-border/40 hover:bg-surface-alt transition-all text-text-muted hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => setDeleteConfirm(shift.id)} className="p-2 rounded-xl border border-border/40 hover:bg-rose-500/10 transition-all text-text-muted hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <button onClick={openAdd}
                        className="w-full py-4 border-2 border-dashed border-border/40 rounded-3xl text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-2 group">
                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Add Custom Shift Pattern
                    </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Quick Assign</h3>
                    <div className="bg-background rounded-3xl shadow-xl p-6 relative overflow-hidden group border border-border/40">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20"><Briefcase className="w-4 h-4 text-primary" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Assignment Tool</span>
                            </div>
                            <h3 className="text-base font-black text-text mb-2">Weekly Roster</h3>
                            <p className="text-xs text-text-muted leading-relaxed mb-4">Click "Manage" on any shift to assign staff and manage rotations.</p>
                            <button onClick={() => shifts[0] && setRosterModal(shifts[0])} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-primary text-white font-black text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-primary/20">
                                Open Roster Tool <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-surface p-5 rounded-3xl border border-border/40">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Shift Insights</h4>
                        <div className="space-y-3">
                            {[
                                { label: 'Peak Coverage', time: '12:00 PM - 03:00 PM', pct: 80, value: `${shifts.reduce((s, sh) => s + sh.assignedStaff.length, 0)} Members` },
                                { label: 'Total Shifts', time: `${shifts.length} active schedules`, pct: 60, value: `${shifts.length} shifts` },
                            ].map((insight, i) => (
                                <div key={i} className="p-3 rounded-2xl bg-background border border-border/10 space-y-1.5">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{insight.label}</span>
                                    <span className="block text-xs font-bold text-text">{insight.time}</span>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div className="h-1.5 flex-1 bg-border/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${insight.pct}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-primary">{insight.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Create/Edit Shift Modal ── */}
            <AnimatePresence>
                {shiftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShiftModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-text uppercase">{editTarget ? 'Edit Shift' : 'Create Shift'}</h2>
                                <button onClick={() => setShiftModal(false)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={saveShift} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Shift Name *</label>
                                    <input required type="text" placeholder="e.g. Morning Shift"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Start Time *</label>
                                        <input required type="time" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                            value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">End Time *</label>
                                        <input required type="time" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                            value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Outlet *</label>
                                    <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                        value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))}>
                                        {OUTLETS.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Color</label>
                                    <div className="flex gap-2">
                                        {COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                                                className={`w-8 h-8 rounded-full ${c} border-4 transition-all ${form.color === c ? 'border-text scale-110 shadow-lg' : 'border-transparent'}`} />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
                                    {editTarget ? 'Save Changes' : 'Create Shift'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Roster Modal ── */}
            <AnimatePresence>
                {rosterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRosterModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-sm rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-black text-text uppercase">Assign Staff</h2>
                                    <p className="text-[10px] font-bold text-primary mt-0.5">{rosterModal.name} · {to12(rosterModal.start)} — {to12(rosterModal.end)}</p>
                                </div>
                                <button onClick={() => setRosterModal(null)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                {STAFF_LIST.map(s => {
                                    const currentShift = shifts.find(sh => sh.id === rosterModal.id);
                                    const isAssigned = currentShift?.assignedStaff.includes(s.id);
                                    return (
                                        <button key={s.id} type="button"
                                            onClick={() => { toggleRosterStaff(rosterModal.id, s.id); setRosterModal(sh => ({ ...sh, assignedStaff: isAssigned ? sh.assignedStaff.filter(i => i !== s.id) : [...sh.assignedStaff, s.id] })); }}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${isAssigned ? 'bg-primary/5 border-primary/30' : 'bg-background border-border/10 hover:border-primary/20'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                    {s.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-text">{s.name}</p>
                                                    <p className="text-[9px] text-text-muted">{s.outlet}</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isAssigned ? 'bg-primary border-primary' : 'border-border/40'}`}>
                                                {isAssigned && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => { showToast(`Roster saved for ${rosterModal.name}`); setRosterModal(null); }}
                                className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                                Save Roster
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-[24px] border border-border/40 shadow-2xl relative p-6 text-center">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 className="w-5 h-5 text-rose-500" /></div>
                            <h3 className="text-base font-black text-text uppercase">Delete Shift?</h3>
                            <p className="text-xs text-text-muted mt-1 mb-5">Staff will be unassigned automatically.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-background border border-border/40 rounded-xl text-xs font-black text-text-muted hover:bg-surface-alt transition-all">Cancel</button>
                                <button onClick={() => deleteShift(deleteConfirm)} className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
