import React, { useState } from 'react';
import {
    Clock,
    Users,
    Plus,
    Edit2,
    Trash2,
    Store,
    ChevronRight,
    Calendar,
    ArrowRight,
    Briefcase,
    Shield
} from 'lucide-react';

const MOCK_SHIFTS = [
    { id: 1, name: 'Morning Shift', start: '09:00 AM', end: '05:00 PM', staffCount: 12, outlet: 'Main Branch', color: 'bg-emerald-500' },
    { id: 2, name: 'Evening Shift', start: '01:00 PM', end: '09:00 PM', staffCount: 8, outlet: 'Main Branch', color: 'bg-blue-500' },
    { id: 3, name: 'Full Day', start: '10:00 AM', end: '08:00 PM', staffCount: 4, outlet: 'City Center', color: 'bg-violet-500' },
];

export default function ShiftManager() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-border shadow-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-text">Shift Calendar View</span>
                    <div className="w-[1px] h-4 bg-border mx-2" />
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Manage Defaults</button>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active">
                    <Plus className="w-4 h-4" />
                    Create New Shift
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shift List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">Active Shifts</h3>
                    {MOCK_SHIFTS.map((shift) => (
                        <div key={shift.id} className="bg-white p-5 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${shift.color}`} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${shift.color.replace('bg-', 'bg-')}/10 ${shift.color.replace('bg-', 'text-')}`}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-text group-hover:text-primary transition-colors">{shift.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {shift.start} — {shift.end}
                                            </p>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <p className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                                <Store className="w-3 h-3" />
                                                {shift.outlet}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Assigned Staff</p>
                                        <div className="flex items-center gap-1 justify-end mt-0.5">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-sm font-bold text-text">{shift.staffCount}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-xl border border-border hover:bg-slate-50 transition-all text-text-muted hover:text-primary">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-xl border border-border hover:bg-slate-50 transition-all text-text-muted hover:text-rose-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-4 border-2 border-dashed border-border rounded-3xl text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-bold flex items-center justify-center gap-2 group">
                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                        Add Custom Shift Pattern
                    </button>
                </div>

                {/* Assignment Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest px-1">Quick Assign</h3>
                    <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                                    <Briefcase className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Assignment Tool</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Manage Weekly Roster</h3>
                            <p className="text-xs text-white/60 leading-relaxed mb-6">Assign your staff to multiple shifts, manage rotations, and set weekly off-days.</p>

                            <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-emerald-400 transition-all group-hover:translate-y-[-2px]">
                                Open Roster Tool
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {/* decorative background element */}
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-24 h-24 rotate-12" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-border">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Shift Insights</h4>
                        <div className="space-y-4">
                            {[
                                { label: 'Peak Coverage', time: '12:00 PM - 03:00 PM', value: '20 Members' },
                                { label: 'Night Coverage', time: '07:00 PM - 09:00 PM', value: '8 Members' },
                            ].map((insight, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 border border-border/50">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{insight.label}</span>
                                    <span className="text-xs font-bold text-text">{insight.time}</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-2/3" />
                                        </div>
                                        <span className="text-[10px] font-bold text-primary">{insight.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
