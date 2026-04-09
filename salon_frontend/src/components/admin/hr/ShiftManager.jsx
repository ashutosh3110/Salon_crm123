import { useState, useMemo, useEffect, useCallback } from 'react';
import { Clock, Users, Plus, Edit2, Trash2, Store, Calendar, ArrowRight, Briefcase, X, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useBusiness } from '../../../contexts/BusinessContext';
import mockApi from '../../../services/mock/mockApi';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];
const TW_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-primary'];

const to12 = (t) => {
    if (!t) return '-';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

function mapShiftFromApi(doc) {
    const outlet = doc.outletId;
    const outletName = outlet && typeof outlet === 'object' ? outlet.name : '—';
    const outletIdStr = outlet && typeof outlet === 'object' && outlet._id != null
        ? String(outlet._id)
        : outlet != null
          ? String(outlet)
          : '';
    const assigned = (doc.assignedUserIds || []).map((u) => String(u._id || u));
    return {
        id: String(doc._id),
        name: doc.name,
        start: doc.startTime,
        end: doc.endTime,
        outlet: outletName,
        outletId: outletIdStr,
        color: doc.colorClass || 'bg-emerald-500',
        hex: doc.colorHex || '#10b981',
        assignedStaff: assigned,
        staffCount: assigned.length,
    };
}

export default function ShiftManager() {
    const { staff, outlets, fetchStaff, fetchOutlets } = useBusiness();
    const [shifts, setShifts] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const [shiftModal, setShiftModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({
        name: '',
        start: '09:00',
        end: '17:00',
        outletId: '',
        color: TW_COLORS[0],
        hex: COLORS[0],
    });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [rosterModal, setRosterModal] = useState(null);
    const [rosterDraft, setRosterDraft] = useState([]);
    const [savingRoster, setSavingRoster] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchShifts = useCallback(async () => {
        setListLoading(true);
        try {
            const res = await mockApi.get('/shifts');
            const raw = res.data?.data ?? res.data ?? [];
            const arr = Array.isArray(raw) ? raw : [];
            setShifts(arr.map(mapShiftFromApi));
        } catch (e) {
            showToast(e?.response?.data?.message || e?.networkHint || 'Failed to load shifts');
            setShifts([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    useEffect(() => {
        fetchStaff?.();
        fetchOutlets?.();
    }, [fetchStaff, fetchOutlets]);

    useEffect(() => {
        if (rosterModal) {
            setRosterDraft([...(rosterModal.assignedStaff || [])]);
        } else {
            setRosterDraft([]);
        }
    }, [rosterModal]);

    const chartData = useMemo(
        () =>
            shifts.map((s) => ({
                name: (s.name || 'Shift').split(' ')[0],
                count: s.assignedStaff.length,
                color: s.hex,
            })),
        [shifts]
    );

    const openAdd = () => {
        setEditTarget(null);
        const firstOid = outlets[0]?._id || outlets[0]?.id;
        setForm({
            name: '',
            start: '09:00',
            end: '17:00',
            outletId: firstOid ? String(firstOid) : '',
            color: TW_COLORS[0],
            hex: COLORS[0],
        });
        setShiftModal(true);
    };

    const openEdit = (s) => {
        setEditTarget(s);
        setForm({
            name: s.name,
            start: s.start,
            end: s.end,
            outletId: s.outletId || '',
            color: s.color,
            hex: s.hex,
        });
        setShiftModal(true);
    };

    const saveShift = async (e) => {
        e.preventDefault();
        if (!form.outletId) {
            showToast('Please select a salon');
            return;
        }
        try {
            const payload = {
                name: form.name.trim(),
                startTime: form.start,
                endTime: form.end,
                outletId: form.outletId,
                colorHex: form.hex,
                colorClass: form.color,
            };
            if (editTarget) {
                await mockApi.patch(`/shifts/${editTarget.id}`, payload);
                showToast(`“${form.name}” updated`);
            } else {
                await mockApi.post('/shifts', payload);
                showToast(`“${form.name}” added`);
            }
            setShiftModal(false);
            await fetchShifts();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Save failed');
        }
    };

    const deleteShift = async (id) => {
        try {
            await mockApi.delete(`/shifts/${id}`);
            setDeleteConfirm(null);
            showToast('Shift removed');
            await fetchShifts();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Delete failed');
        }
    };

    const saveRoster = async () => {
        if (!rosterModal) return;
        setSavingRoster(true);
        try {
            await mockApi.patch(`/shifts/${rosterModal.id}/roster`, { userIds: rosterDraft });
            showToast(`Team saved for “${rosterModal.name}”`);
            setRosterModal(null);
            await fetchShifts();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Could not save team');
        } finally {
            setSavingRoster(false);
        }
    };

    const toggleRosterMember = (staffId) => {
        const sid = String(staffId);
        setRosterDraft((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
    };

    return (
        <div className="space-y-6 font-black text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-black">
                <div className="flex items-center gap-4 px-6 py-4 bg-surface rounded-none border border-border shadow-sm text-left font-black">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="text-left font-black">
                        <h2 className="text-sm font-black text-text uppercase tracking-[0.2em] leading-none">Shift schedule</h2>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1.5 leading-none">
                            {listLoading
                                ? 'Loading…'
                                : shifts.length === 0
                                  ? 'No shifts yet — add your first one'
                                  : `${shifts.length} shift${shifts.length === 1 ? '' : 's'} saved`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={openAdd}
                    disabled={!outlets?.length}
                    className="flex items-center gap-3 px-8 py-4 rounded-none bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" /> Add shift
                </button>
            </div>

            {!outlets?.length && (
                <p className="text-[11px] text-amber-600 font-bold tracking-wide px-2">
                    Add at least one salon (outlet) first — then you can create shifts.
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black relative">
                {listLoading && (
                    <div className="absolute inset-0 z-10 bg-surface/60 backdrop-blur-[1px] flex items-start justify-center pt-24 rounded-none">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Loading shifts…</p>
                    </div>
                )}
                <div className="lg:col-span-2 space-y-4 text-left font-black">
                    <div className="flex items-center justify-between px-2 mb-2 text-left font-black">
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Your shifts</h3>
                        <div className="flex items-center gap-2 text-left">
                            <div className="w-2 h-2 rounded-none bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Ready</span>
                        </div>
                    </div>
                    {!listLoading && shifts.length === 0 && (
                        <div className="bg-surface border border-dashed border-border p-10 text-center rounded-none">
                            <p className="text-sm font-black text-text uppercase tracking-tight">No shifts yet</p>
                            <p className="text-[11px] text-text-muted mt-2 font-bold tracking-wide">
                                Use “Add shift” to create your first one, then assign your team.
                            </p>
                        </div>
                    )}
                    {shifts.map((shift) => (
                        <motion.div
                            key={shift.id}
                            layout
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface p-6 rounded-none border border-border shadow-sm hover:shadow-xl transition-all group relative overflow-hidden text-left font-black"
                        >
                            <div className={`absolute top-0 left-0 w-2 h-full ${shift.color}`} />
                            <div className="pl-4 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left font-black">
                                <div className="flex items-center gap-6 text-left">
                                    <div className={`p-4 rounded-none ${shift.color}/5 border border-border/10 shrink-0`}>
                                        <Clock className={`w-6 h-6 ${shift.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <h4 className="text-base font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors text-left">
                                            {shift.name}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                            <div className="flex items-center gap-1.5 text-left">
                                                <Clock className="w-3.5 h-3.5" /> {to12(shift.start)} — {to12(shift.end)}
                                            </div>
                                            <div className="hidden sm:block w-1 h-1 bg-border rounded-none" />
                                            <div className="flex items-center gap-1.5 text-left">
                                                <Store className="w-3.5 h-3.5" /> {shift.outlet}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-t md:border-t-0 pt-6 md:pt-0 text-left font-black justify-between md:justify-end">
                                    <button type="button" onClick={() => setRosterModal(shift)} className="text-left group/roster hover:opacity-80 transition-opacity">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 leading-none">Team on shift</p>
                                        <div className="flex items-center gap-2 text-left font-black">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="text-2xl font-black text-primary tracking-tighter leading-none">{shift.assignedStaff.length}</span>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2 text-left">
                                        <button type="button" onClick={() => openEdit(shift)} className="p-3 rounded-none border border-border hover:bg-surface-alt transition-all text-text-muted hover:text-primary">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => setDeleteConfirm(shift.id)} className="p-3 rounded-none border border-border hover:bg-rose-500/10 transition-all text-text-muted hover:text-rose-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <button
                        type="button"
                        onClick={openAdd}
                        disabled={!outlets?.length}
                        className="w-full py-6 border border-dashed border-border rounded-none text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Add another shift
                    </button>
                </div>

                <div className="space-y-6 text-left font-black">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Summary</h3>

                    <div className="bg-surface p-8 rounded-none border border-border shadow-sm text-left font-black">
                        <div className="flex items-center justify-between mb-8 text-left">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Staff per shift</span>
                            <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <div className="h-[200px] w-full text-left">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }}
                                        width={60}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
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
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Total assigned</p>
                                <p className="text-xl font-black text-text mt-2 leading-none">
                                    {shifts.reduce((s, sh) => s + sh.assignedStaff.length, 0)}{' '}
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">people</span>
                                </p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Salons in use</p>
                                <p className="text-xl font-black text-text mt-2 leading-none">
                                    {[...new Set(shifts.map((s) => s.outlet))].length}{' '}
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">locations</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-text p-8 rounded-none shadow-xl shadow-text/10 relative overflow-hidden group border border-text text-left font-black">
                        <div className="relative z-10 text-left">
                            <div className="flex items-center gap-3 mb-6 text-left">
                                <div className="p-3 rounded-none bg-white text-text border border-white/20">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Quick tip</span>
                            </div>
                            <h3 className="text-lg font-black text-background mb-3 uppercase tracking-tight text-left">Assign your team</h3>
                            <p className="text-[10px] text-background/70 leading-relaxed mb-8 font-bold tracking-wide text-left normal-case">
                                Tap a shift, then choose who works that slot. You can change it anytime.
                            </p>
                            <button
                                type="button"
                                disabled={!shifts.length}
                                onClick={() => shifts[0] && setRosterModal(shifts[0])}
                                className="w-full flex items-center justify-between px-6 py-4 rounded-none bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {shifts.length ? 'Pick team for first shift' : 'Add a shift first'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rotate-12" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {shiftModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShiftModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-none border border-border shadow-2xl relative p-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">{editTarget ? 'Edit shift' : 'New shift'}</h2>
                                <button type="button" onClick={() => setShiftModal(false)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={saveShift} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Shift name *</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Morning, Evening, Weekend"
                                        className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black tracking-wide focus:border-primary outline-none"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Start time</label>
                                        <input
                                            required
                                            type="time"
                                            className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase"
                                            value={form.start}
                                            onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">End time</label>
                                        <input
                                            required
                                            type="time"
                                            className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black focus:border-primary outline-none uppercase"
                                            value={form.end}
                                            onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Salon / branch</label>
                                    <select
                                        required
                                        className="w-full px-5 py-4 rounded-none bg-background border border-border text-xs font-black uppercase tracking-widest focus:border-primary outline-none appearance-none"
                                        value={form.outletId}
                                        onChange={(e) => setForm((f) => ({ ...f, outletId: e.target.value }))}
                                    >
                                        <option value="">Select salon</option>
                                        {outlets.map((o) => (
                                            <option key={String(o._id || o.id)} value={String(o._id || o.id)}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Color tag</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {TW_COLORS.map((c, i) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setForm((f) => ({ ...f, color: c, hex: COLORS[i] }))}
                                                className={`w-10 h-10 rounded-none ${c} border-4 transition-all ${form.color === c ? 'border-text scale-110 shadow-xl' : 'border-transparent'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                                    {editTarget ? 'Save changes' : 'Create shift'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rosterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRosterModal(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-none border border-border shadow-2xl relative p-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-[0.2em]">Who works this shift?</h2>
                                    <p className="text-[10px] font-black text-primary mt-2 uppercase tracking-widest leading-none">
                                        {rosterModal.name} · {to12(rosterModal.start)} — {to12(rosterModal.end)}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setRosterModal(null)} className="w-10 h-10 rounded-none bg-background border border-border flex items-center justify-center text-text-muted hover:text-text transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                {staff.map((s) => {
                                    const sid = String(s._id || s.id);
                                    const isAssigned = rosterDraft.includes(sid);
                                    return (
                                        <button
                                            key={sid}
                                            type="button"
                                            onClick={() => toggleRosterMember(sid)}
                                            className={`w-full flex items-center justify-between p-4 rounded-none border transition-all text-left ${
                                                isAssigned ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-background border-border/40 hover:border-primary/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/10">
                                                    {(s.name || '').split(' ').map((n) => n[0]).join('')}
                                                </div>
                                                <div className="text-left leading-tight">
                                                    <p className="text-xs font-black text-text uppercase tracking-tight text-left">{s.name}</p>
                                                    <p className="text-[9px] text-text-muted uppercase tracking-widest text-left">{s.outletId?.name || s.outlet || '—'}</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-none border-2 flex items-center justify-center transition-all ${isAssigned ? 'bg-primary border-primary' : 'border-border/40'}`}>
                                                {isAssigned && <CheckCircle2 className="w-4 h-4 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                disabled={savingRoster}
                                onClick={saveRoster}
                                className="w-full mt-8 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                                {savingRoster ? 'Saving…' : 'Done'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-surface w-full max-w-xs rounded-none border border-border shadow-2xl relative p-10 text-center"
                        >
                            <div className="w-16 h-16 bg-rose-500/10 rounded-none flex items-center justify-center mx-auto mb-8 border border-rose-500/10 text-rose-500">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.1em]">Delete this shift?</h3>
                            <p className="text-[10px] text-text-muted mt-3 mb-8 font-bold tracking-wide leading-relaxed normal-case">
                                People assigned to this shift will be unlinked. You can add the shift again later if you need.
                            </p>
                            <div className="flex flex-col gap-3 font-black">
                                <button type="button" onClick={() => deleteShift(deleteConfirm)} className="w-full py-4 bg-rose-500 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all">
                                    Yes, delete
                                </button>
                                <button type="button" onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-background border border-border rounded-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] hover:bg-surface-alt transition-all">
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-8 py-4 bg-text border border-border rounded-none shadow-2xl shadow-black/40"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-[10px] font-black text-background uppercase tracking-[0.2em]">{toast}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
