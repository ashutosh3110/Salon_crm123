import { useState } from 'react';
import {
    CalendarCheck, Clock, UserCheck, UserMinus,
    ArrowLeftRight, Search, Filter, CheckCircle2,
    Calendar, MoreVertical, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const INITIAL_ATTENDANCE = [
    { id: 1, name: 'Ananya Sharma', checkIn: '09:45 AM', checkOut: '--:--', status: 'Present', role: 'Senior Stylist' },
    { id: 2, name: 'Rahul Verma', checkIn: '10:05 AM', checkOut: '--:--', status: 'Late', role: 'Receptionist' },
    { id: 3, name: 'Priya Das', checkIn: '--:--', checkOut: '--:--', status: 'On Leave', role: 'Makeup Artist' },
    { id: 4, name: 'Vikas Singh', checkIn: '09:55 AM', checkOut: '--:--', status: 'Present', role: 'Junior Stylist' },
    { id: 5, name: 'Sonal Mehra', checkIn: '10:15 AM', checkOut: '06:30 PM', status: 'Present', role: 'Stylist' },
];

const INITIAL_LEAVES = [
    { id: 101, name: 'Sonal Mehra', type: 'Sick Leave', range: '24 Feb - 25 Feb', reason: 'High fever and cold', status: 'Pending' },
    { id: 102, name: 'Rahul Verma', type: 'Annual Leave', range: '01 Mar - 05 Mar', reason: 'Family function', status: 'Pending' },
];

export default function AttendancePage() {
    const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
    const [leaves, setLeaves] = useState(INITIAL_LEAVES);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAttendance = attendance.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLeaveAction = (id, newStatus) => {
        setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
        // In a real app, this would also update the attendance list if status is 'Approved'
    };

    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Attendance & Leaves</h1>
                    <p className="text-sm text-text-muted font-medium">Monitor daily presence and manage leave approvals</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border/60 rounded-none text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors shadow-none">
                        <Calendar className="w-4 h-4" /> Attendance Logs
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Present Today', value: '10/12', icon: UserCheck, color: 'text-emerald-500' },
                    { label: 'Late Arrivals', value: '2', icon: Clock, color: 'text-rose-500' },
                    { label: 'On Leave', value: '2', icon: UserMinus, color: 'text-rose-500' },
                    { label: 'Shift Coverage', value: '85%', icon: CalendarCheck, color: 'text-emerald-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Soft Glow Effect */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <s.icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${s.color === 'text-rose-500' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {s.color === 'text-rose-500' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {s.color === 'text-rose-500' ? '-1%' : '+2%'}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter
                                        value={typeof s.value === 'string' ? parseFloat(s.value.replace(/[₹%,]/g, '').split('/')[0]) : s.value}
                                        suffix={s.label === 'Shift Coverage' ? '%' : s.label === 'Present Today' ? `/${s.value.split('/')[1]}` : ''}
                                    />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.color === 'text-rose-500' ? "text-rose-400" : "text-emerald-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Attendance Table */}
                <div className="lg:col-span-2 bg-white rounded-none border border-border/60 overflow-hidden shadow-none">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-white">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Today's Presence</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search staff..."
                                className="pl-8 pr-3 py-1.5 bg-white border border-border/60 rounded-none text-xs outline-none focus:border-primary/50 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                {filteredAttendance.map((staff) => (
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
                <div className="bg-white rounded-none border border-border/60 overflow-hidden shadow-none">
                    <div className="px-6 py-5 border-b border-border/40 bg-white">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Pending Leaves</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {pendingLeaves.length === 0 ? (
                            <div className="py-12 text-center text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-alt/30 border border-dashed border-border/40">
                                No pending requests
                            </div>
                        ) : pendingLeaves.map((req) => (
                            <div key={req.id} className="bg-white border border-border/40 rounded-none p-4 shadow-none hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-text">{req.name}</p>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mt-0.5">{req.type}</p>
                                    </div>
                                    <div className="shrink-0">
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
                                    <button
                                        onClick={() => handleLeaveAction(req.id, 'Approved')}
                                        className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-none text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleLeaveAction(req.id, 'Rejected')}
                                        className="flex items-center justify-center gap-1.5 py-1.5 bg-rose-500/10 text-rose-500 rounded-none text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                                    >
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
