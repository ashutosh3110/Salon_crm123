import {
    CalendarCheck, Clock, UserCheck, UserMinus,
    ArrowLeftRight, Search, Filter, CheckCircle2,
    Calendar, MoreVertical, XCircle, AlertCircle
} from 'lucide-react';

const attendanceData = [
    { id: 1, name: 'Ananya Sharma', checkIn: '09:45 AM', checkOut: '--:--', status: 'Present', role: 'Senior Stylist' },
    { id: 2, name: 'Rahul Verma', checkIn: '10:05 AM', checkOut: '--:--', status: 'Late', role: 'Receptionist' },
    { id: 3, name: 'Priya Das', checkIn: '--:--', checkOut: '--:--', status: 'On Leave', role: 'Makeup Artist' },
    { id: 4, name: 'Vikas Singh', checkIn: '09:55 AM', checkOut: '--:--', status: 'Present', role: 'Junior Stylist' },
    { id: 5, name: 'Sonal Mehra', checkIn: '10:15 AM', checkOut: '06:30 PM', status: 'Present', role: 'Stylist' },
];

const leaveRequests = [
    { id: 101, name: 'Sonal Mehra', type: 'Sick Leave', range: '24 Feb - 25 Feb', reason: 'High fever and cold', status: 'Pending' },
    { id: 102, name: 'Rahul Verma', type: 'Annual Leave', range: '01 Mar - 05 Mar', reason: 'Family function', status: 'Pending' },
];

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Attendance & Leaves</h1>
                    <p className="text-sm text-text-muted font-medium">Monitor daily presence and manage leave approvals</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" /> Attendance Logs
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Present Today', value: '10/12', icon: UserCheck, color: 'text-emerald-500' },
                    { label: 'Late Arrivals', value: '2', icon: Clock, color: 'text-amber-500' },
                    { label: 'On Leave', value: '2', icon: UserMinus, color: 'text-rose-500' },
                    { label: 'Shift Coverage', value: '85%', icon: CalendarCheck, color: 'text-primary' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/10">
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-text">{s.value}</p>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Attendance Table */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Today's Presence</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input type="text" placeholder="Search staff..." className="pl-8 pr-3 py-1.5 bg-background border border-border/40 rounded-lg text-xs outline-none focus:border-primary/50 transition-colors" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Staff Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Check In</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Check Out</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {attendanceData.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-surface-alt/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-text">{staff.name}</p>
                                                <p className="text-[10px] text-text-muted font-medium">{staff.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-text-secondary">{staff.checkIn}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-text-secondary">{staff.checkOut}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${staff.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    staff.status === 'Late' ? 'bg-amber-500/10 text-amber-500' :
                                                        staff.status === 'On Leave' ? 'bg-rose-500/10 text-rose-500' : 'bg-surface-alt text-text-muted'
                                                }`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leave Requests */}
                <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border/40 bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Pending Leaves</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {leaveRequests.map((req) => (
                            <div key={req.id} className="bg-background border border-border/10 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-text">{req.name}</p>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mt-0.5">{req.type}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center border border-border/10">
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                        <span className="text-[11px] font-medium text-text-secondary">{req.range}</span>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed italic">"{req.reason}"</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button className="flex items-center justify-center gap-1.5 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 bg-surface-alt border-t border-border/40 text-[10px] font-black text-text-muted hover:text-primary transition-colors uppercase tracking-widest">
                        View All Requests
                    </button>
                </div>
            </div>
        </div>
    );
}
