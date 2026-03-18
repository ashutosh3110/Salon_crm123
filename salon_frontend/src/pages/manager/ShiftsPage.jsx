import { useState } from 'react';
import {
    Clock, Calendar, Users, Plus,
    ArrowLeft, ArrowRight, Target,
    MoreVertical, UserPlus, Filter,
    CheckCircle2, AlertCircle, Info, ChevronDown
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';

const INITIAL_HIRES = [
    { id: 1, name: 'Ananya Sharma', shift: '09:00 AM - 05:00 PM', status: 'In Progress' },
    { id: 2, name: 'Rahul Verma', shift: '10:00 AM - 06:00 PM', status: 'Starting Soon' },
    { id: 3, name: 'Vikas Singh', shift: '12:00 PM - 08:00 PM', status: 'Active' },
];

export default function ShiftsPage() {
    const [hires, setHires] = useState(INITIAL_HIRES);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [targetWeek, setTargetWeek] = useState('01 Mar');
    const [swaps, setSwaps] = useState([
        { id: 1, staff: 'Priya Das', with: 'Vikas Singh', day: 'Tuesday', reason: 'Personal work', status: 'Pending' }
    ]);

    const weekOptions = [
        { label: '01 Mar - 07 Mar', value: '01 Mar' },
        { label: '08 Mar - 14 Mar', value: '08 Mar' },
        { label: '15 Mar - 21 Mar', value: '15 Mar' },
    ];

    const handleApproveSwap = (id) => {
        setSwaps(swaps.map(s => s.id === id ? { ...s, status: 'Approved' } : s));
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black animate-reveal">
                <div className="leading-none text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Shift Planning</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Roster :: temporal_resource_grid_v3.0</p>
                </div>
                <button
                    onClick={() => setIsRosterModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-6 sm:px-10 py-3 sm:py-4 rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 transition-all font-black"
                >
                    <Plus className="w-4 h-4" /> Create New Roster
                </button>
            </div>

            {/* Timeline Placeholder */}
            <div className="bg-white rounded-none border border-border/60 p-4 sm:p-6 shadow-none overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-surface-alt border border-border p-1">
                            <button className="p-1.5 hover:bg-surface border border-transparent hover:border-border transition-all"><ArrowLeft className="w-4 h-4 text-text-muted" /></button>
                            <span className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-black text-text uppercase tracking-widest">23 Feb - 01 Mar</span>
                            <button className="p-1.5 hover:bg-surface border border-transparent hover:border-border transition-all"><ArrowRight className="w-4 h-4 text-text-muted" /></button>
                        </div>
                        <button className="text-[9px] sm:text-[10px] font-black text-primary px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 uppercase tracking-[0.2em]">Today</button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-surface border border-border text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-all shadow-sm">
                            <Filter className="w-3.5 h-3.5" /> All Roles
                        </button>
                    </div>
                </div>

                <div className="relative overflow-x-auto">
                    <div className="min-w-[800px] flex border-b border-border/40 bg-white rounded-t-none">
                        <div className="w-40 px-4 py-4 shrink-0 text-[10px] font-black text-text-muted uppercase tracking-widest">Staff</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} className="flex-1 px-4 py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-widest border-l border-border/40">{d} 23 Mar</div>
                        ))}
                    </div>
                    <div className="min-w-[800px] divide-y divide-border/40">
                        {['Ananya S.', 'Rahul V.', 'Priya D.', 'Vikas S.'].map((staff, idx) => (
                            <div key={staff} className="flex group hover:bg-surface-alt/30 transition-colors">
                                <div className="w-40 px-4 py-5 shrink-0 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center text-[10px] font-bold text-text-secondary border border-border/20">
                                        {staff.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-text transition-colors group-hover:text-primary">{staff}</span>
                                </div>
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className="flex-1 min-h-[60px] p-2 border-l border-border/40">
                                        {idx % 3 === i % 2 ? (
                                            <div className="h-full bg-primary/10 border-l-2 border-primary p-2 rounded-r-none group/shift cursor-pointer hover:bg-primary/20 transition-all">
                                                <p className="text-[9px] font-black text-primary uppercase leading-tight">09 AM - 05 PM</p>
                                                <p className="text-[8px] font-medium text-primary mt-0.5 opacity-60">General Shift</p>
                                            </div>
                                        ) : i === 6 ? (
                                            <div className="h-full bg-rose-500/5 flex items-center justify-center rounded-none border border-dashed border-rose-500/10">
                                                <span className="text-[9px] font-black text-rose-500/40 uppercase">Day Off</span>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Shifts */}
                <div className="lg:col-span-2 bg-white rounded-none border border-border/60 p-4 sm:p-6 shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-emerald-500" />
                            <h2 className="text-[11px] sm:text-sm font-black text-text uppercase tracking-widest">Active Shifts Now</h2>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-none border border-emerald-500/20 uppercase tracking-widest animate-pulse">Live</span>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        {hires.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-white border border-border/60 rounded-none group hover:border-primary/20 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-none bg-white flex items-center justify-center border border-border/20 text-[10px] sm:text-xs font-bold text-text-muted">
                                        {item.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs sm:text-sm font-bold text-text group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-[0.1em] mt-0.5">{item.shift}</p>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-surface-alt rounded-lg transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">
                                    <MoreVertical className="w-4 h-4 text-text-muted" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coverage Alerts */}
                <div className="bg-white rounded-none border border-border/60 p-4 sm:p-6 shadow-none">
                    <div className="flex items-center gap-2 mb-6 text-left">
                        <AlertCircle className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-amber-500" />
                        <h2 className="text-[11px] sm:text-sm font-black text-text uppercase tracking-widest">Coverage Alerts</h2>
                    </div>
                    <div className="space-y-3 sm:space-y-4 text-left">
                        <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-none">
                            <div className="shrink-0">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-text uppercase tracking-tight">Low Reception Coverage</p>
                                <p className="text-[10px] sm:text-[11px] text-text-secondary mt-1 leading-relaxed">Only 1 receptionist scheduled for the weekend rush (28 - 01 Mar).</p>
                                <button className="mt-3 text-[9px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
                                    Review Schedule <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {swaps.filter(s => s.status === 'Pending').map((swap) => (
                            <div key={swap.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-primary/5 border-l-2 border-primary rounded-r-none">
                                <div className="shrink-0">
                                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm font-bold text-text uppercase tracking-tight">Shift Transfer Request</p>
                                    <p className="text-[10px] sm:text-[11px] text-text-secondary mt-1 leading-relaxed">
                                        {swap.staff} ↔️ {swap.with} ({swap.day})
                                    </p>
                                    <button
                                        onClick={() => handleApproveSwap(swap.id)}
                                        className="mt-3 text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all"
                                    >
                                        Approve Swap <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Roster Grid */}
            <div className="bg-white rounded-none border border-border/60 p-4 sm:p-6 shadow-none">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[11px] sm:text-sm font-black text-text uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-primary" /> Weekly Roster
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-none bg-emerald-500" />
                            <span className="text-[8px] font-black uppercase text-text-muted">In_Service</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-none bg-primary" />
                            <span className="text-[8px] font-black uppercase text-text-muted">On_Call</span>
                        </div>
                    </div>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px] grid grid-cols-8 border border-border/40">
                        {/* Header Row */}
                        <div className="col-span-1 px-4 py-3 shrink-0 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border/40">Staff</div>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} className="px-4 py-3 text-center text-[10px] font-black text-text-muted uppercase tracking-widest border-l border-b border-border/40">{d}</div>
                        ))}

                        {/* Staff Rows */}
                        {['Ananya S.', 'Rahul V.', 'Priya D.', 'Vikas S.'].map((staff, staffIdx) => (
                            <div key={staff} className="contents group hover:bg-surface-alt/30 transition-colors">
                                <div className="col-span-1 px-4 py-4 shrink-0 flex items-center gap-2 border-b border-border/40">
                                    <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center text-[10px] font-bold text-text-secondary border border-border/20">
                                        {staff.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-text transition-colors group-hover:text-primary">{staff}</span>
                                </div>
                                {[...Array(7)].map((_, dayIdx) => (
                                    <div key={`${staff}-${dayIdx}`} className="col-span-1 min-h-[60px] p-2 border-l border-b border-border/40">
                                        {staffIdx % 3 === dayIdx % 2 ? (
                                            <div className="h-full bg-primary/10 border-l-2 border-primary p-2 rounded-r-none group/shift cursor-pointer hover:bg-primary/20 transition-all">
                                                <p className="text-[9px] font-black text-primary uppercase leading-tight">09 AM - 05 PM</p>
                                                <p className="text-[8px] font-medium text-primary mt-0.5 opacity-60">General Shift</p>
                                            </div>
                                        ) : dayIdx === 6 ? (
                                            <div className="h-full bg-rose-500/5 flex items-center justify-center rounded-none border border-dashed border-rose-500/10">
                                                <span className="text-[9px] font-black text-rose-500/40 uppercase">Day Off</span>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Roster Modal */}
            {isRosterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Generate Weekly Roster</h2>
                            <button onClick={() => setIsRosterModalOpen(false)} className="text-text-muted hover:text-primary transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-surface-alt border border-border/40 rounded-none">
                                <p className="text-xs font-medium text-text-secondary leading-relaxed">
                                    Our AI will automatically generate the most efficient shift assignments based on staff availability and peak hours forecast.
                                </p>
                            </div>
                            <CustomDropdown
                                label="Target Week"
                                options={weekOptions}
                                value={targetWeek}
                                onChange={setTargetWeek}
                            />
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsRosterModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Roster generated and staff notified via SMS.');
                                        setIsRosterModalOpen(false);
                                    }}
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Launch AI Planner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
