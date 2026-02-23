import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Store,
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../../contexts/BusinessContext';

const DAYS = [
    { label: 'Mon', full: 'Monday' },
    { label: 'Tue', full: 'Tuesday' },
    { label: 'Wed', full: 'Wednesday' },
    { label: 'Thu', full: 'Thursday' },
    { label: 'Fri', full: 'Friday' },
    { label: 'Sat', full: 'Saturday' },
    { label: 'Sun', full: 'Sunday' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute === 0 ? '00' : '30';
    return `${displayHour}:${displayMinute} ${ampm}`;
});

export default function OutletForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { outlets, addOutlet, updateOutlet } = useBusiness();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        status: 'active',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        openingTime: '09:00 AM',
        closingTime: '09:00 PM',
    });

    useEffect(() => {
        if (isEdit) {
            const found = outlets.find(o => o._id === id);
            if (found) {
                setForm({
                    ...form,
                    ...found
                });
            }
        }
    }, [id, isEdit, outlets]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setForm(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Simulate network delay
        setTimeout(() => {
            if (isEdit) {
                updateOutlet(id, form);
            } else {
                addOutlet(form);
            }
            setSaving(false);
            navigate('/admin/outlets');
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/outlets')}
                        className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text-secondary transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text uppercase">{isEdit ? 'Evolve Unit' : 'Induct New Unit'}</h1>
                        <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Architect your salon network layout.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white p-7 rounded-[32px] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Store className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-text uppercase tracking-widest">Core Identity</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Unit Nomenclature <span className="text-rose-500">*</span></label>
                                <input
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Grace & Glamour - Mumbai"
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Comm Link <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            name="phone"
                                            required
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 XXXXX XXXXX"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">POS Digital Path</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="outlet@salon.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Network Pulse</label>
                                <div className="flex p-1 bg-slate-50 rounded-2xl border border-border w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 'active' })}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${form.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-text-muted hover:text-text'}`}
                                    >
                                        Live
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, status: 'inactive' })}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${form.status === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-text-muted hover:text-text'}`}
                                    >
                                        Standby
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white p-7 rounded-[32px] border border-border shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <h2 className="text-xs font-bold text-text uppercase tracking-widest">Geo Anchor</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Physical Coordinate <span className="text-rose-500">*</span></label>
                                <textarea
                                    name="address"
                                    required
                                    rows="1"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Shop No, Building, Area Details..."
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[45px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Urban Center</label>
                                    <input
                                        name="city"
                                        required
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Mumbai"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Zone Code</label>
                                    <input
                                        name="pincode"
                                        required
                                        value={form.pincode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <p className="text-[9px] text-blue-800 font-bold leading-relaxed">
                                    * These credentials will be etched onto all POS invoice outputs.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Hours */}
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl md:col-span-2 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                        <Clock className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Shift Control</h3>
                                </div>
                                <h4 className="text-xl font-bold">Slot Rules</h4>
                                <p className="text-[10px] text-white/40 leading-relaxed font-bold tracking-tighter uppercase">Define temporal constraints for this unit.</p>

                                <div className="space-y-4 pt-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Open Window</label>
                                        <select
                                            name="openingTime"
                                            value={form.openingTime}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none appearance-none"
                                        >
                                            {TIME_SLOTS.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-white/40 uppercase">Close Window</label>
                                        <select
                                            name="closingTime"
                                            value={form.closingTime}
                                            onChange={handleChange}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold outline-none appearance-none"
                                        >
                                            {TIME_SLOTS.map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-2/3 space-y-4">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-4">Weekly Cycle</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day.full}
                                            type="button"
                                            onClick={() => handleDayToggle(day.full)}
                                            className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${form.workingDays.includes(day.full)
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 border border-white/20'
                                                : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">Protocol Locked</p>
                                        <p className="text-[9px] text-white/40 font-bold">POS engine will hard-sync with this temporal data.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* decoration */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all pointer-events-none" />
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-[10px] font-bold uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 p-6 bg-slate-50 rounded-3xl border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase hidden sm:block">
                        Finalize all metadata before executing commit.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/outlets')}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-2xl text-xs font-bold text-text-secondary hover:bg-white transition-all border border-transparent hover:border-border"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-none flex items-center gap-2 px-10 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEdit ? 'Commit Changes' : 'Execute Induction'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
