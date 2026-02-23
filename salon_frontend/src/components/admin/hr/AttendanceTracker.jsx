import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    Check,
    X,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';

const MOCK_ATTENDANCE = [
    { id: 1, staff: 'Ananya Sharma', role: 'Stylist', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'present', hours: '9.2h', outlet: 'Main Branch' },
    { id: 2, staff: 'Rahul Verma', role: 'Barber', checkIn: '09:45 AM', checkOut: '07:00 PM', status: 'late', hours: '9.2h', outlet: 'City Center' },
    { id: 3, staff: 'Sneha Kapur', role: 'Reception', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hours: '9.0h', outlet: 'Main Branch' },
    { id: 4, staff: 'Vikram Malhotra', role: 'Manager', checkIn: '-', checkOut: '-', status: 'absent', hours: '0h', outlet: 'West End' },
    { id: 5, staff: 'Priya Singh', role: 'Technician', checkIn: '10:30 AM', checkOut: '04:30 PM', status: 'half-day', hours: '6.0h', outlet: 'Main Branch' },
];

export default function AttendanceTracker() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'late': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'absent': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'half-day': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Attendance Date</p>
                            <div className="flex items-center gap-2 mt-1">
                                <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-text-muted">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-lg font-bold text-text bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                />
                                <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-text-muted">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pr-4 border-l border-border pl-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Present</p>
                            <p className="text-xl font-bold text-emerald-500 mt-0.5">18</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Late</p>
                            <p className="text-xl font-bold text-amber-500 mt-0.5">3</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Absent</p>
                            <p className="text-xl font-bold text-rose-500 mt-0.5">3</p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden flex items-center justify-between">
                    <div className="relative z-10 text-white">
                        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Mark Attendance</p>
                        <h3 className="text-lg font-bold mt-1 leading-tight">Quick Bulk Actions</h3>
                    </div>
                    <button className="relative z-10 p-4 rounded-2xl bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition-all border border-white/20">
                        <Check className="w-6 h-6" />
                    </button>
                    {/* decorative circle */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by staff name..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 border border-border transition-all">
                            <Filter className="w-4 h-4" />
                            Filter Status
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Check-In</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Check-Out</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Work Hours</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_ATTENDANCE.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary font-bold text-xs ring-1 ring-black/5">
                                                {record.staff.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text">{record.staff}</p>
                                                <p className="text-[10px] text-text-muted font-bold tracking-tighter uppercase">{record.outlet}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text group-hover:text-primary transition-colors">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                                            {record.checkIn}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-text group-hover:text-primary transition-colors">
                                            <Clock className="w-3.5 h-3.5 text-text-muted" />
                                            {record.checkOut}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-text">{record.hours}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Approve"
                                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="Add Remark"
                                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg text-text-muted hover:bg-slate-100 transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-border flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-text-muted" />
                    <p className="text-[10px] text-text-muted font-bold tracking-tight">
                        Attendance records are auto-locked at 11:59 PM. Manual overrides require Admin approval.
                    </p>
                </div>
            </div>
        </div>
    );
}
