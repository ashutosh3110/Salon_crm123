import { Calendar, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Mock Data ──────────────────────────────────────────────────────────
const todayAppointments = [
    { id: 1, time: '10:00 AM', customer: 'Priya Sharma', service: 'Hair Cut + Styling', stylist: 'Anita', status: 'checked-in', phone: '9876543210' },
    { id: 2, time: '10:30 AM', customer: 'Ravi Kumar', service: 'Beard Trim', stylist: 'Rahul', status: 'confirmed', phone: '9876543211' },
    { id: 3, time: '11:00 AM', customer: 'Meera Patel', service: 'Facial + Cleanup', stylist: 'Neha', status: 'waiting', phone: '9876543212' },
    { id: 4, time: '11:30 AM', customer: 'Arjun Nair', service: 'Hair Colour', stylist: 'Anita', status: 'confirmed', phone: '9876543213' },
    { id: 5, time: '12:00 PM', customer: 'Sneha Reddy', service: 'Manicure + Pedicure', stylist: 'Neha', status: 'pending', phone: '9876543214' },
    { id: 6, time: '01:00 PM', customer: 'Walk-In', service: 'TBD', stylist: '-', status: 'walk-in', phone: '-' },
];

const stats = [
    { label: "Today's Bookings", value: 18, icon: Calendar, color: 'blue' },
    { label: 'Checked In', value: 6, icon: CheckCircle, color: 'green' },
    { label: 'Waiting', value: 3, icon: Clock, color: 'amber' },
    { label: 'Walk-ins', value: 2, icon: Users, color: 'violet' },
];

const statusStyles = {
    'checked-in': 'bg-emerald-500/10 text-emerald-500',
    'confirmed': 'bg-primary/10 text-primary',
    'waiting': 'bg-amber-500/10 text-amber-500',
    'pending': 'bg-surface-alt text-text-muted',
    'walk-in': 'bg-violet-500/10 text-violet-500',
};

export default function ReceptionistDashboard() {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-3">
                <Link to="/pos/billing" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Zap className="w-4 h-4" /> Quick Bill
                </Link>
                <Link to="/receptionist/queue" className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/60 text-text rounded-xl text-sm font-bold hover:bg-surface-alt transition-all">
                    <Users className="w-4 h-4" /> Add Walk-In
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center border border-border/10">
                            <s.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text">{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Appointment Timeline */}
            <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-surface/50">
                    <h2 className="text-sm font-extrabold text-text">Today's Appointments</h2>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-background px-2 py-1 rounded-md">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="divide-y divide-border/40">
                    {todayAppointments.map((apt) => (
                        <div key={apt.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                            <div className="w-16 text-center shrink-0">
                                <p className="text-sm font-black text-text">{apt.time.split(' ')[0]}</p>
                                <p className="text-[10px] text-text-muted font-bold">{apt.time.split(' ')[1]}</p>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text truncate">{apt.customer}</p>
                                <p className="text-xs text-text-muted truncate">{apt.service} • {apt.stylist}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusStyles[apt.status]}`}>
                                {apt.status.replace('-', ' ')}
                            </span>
                            <button className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center hover:bg-primary/10 group/btn transition-colors shrink-0" title="Check-in">
                                <CheckCircle className="w-4 h-4 text-text-muted group-hover/btn:text-primary" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
