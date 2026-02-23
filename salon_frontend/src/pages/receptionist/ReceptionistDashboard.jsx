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
    'checked-in': 'bg-green-100 text-green-700',
    'confirmed': 'bg-blue-100 text-blue-700',
    'waiting': 'bg-amber-100 text-amber-700',
    'pending': 'bg-gray-100 text-gray-600',
    'walk-in': 'bg-violet-100 text-violet-700',
};

export default function ReceptionistDashboard() {
    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-3">
                <Link to="/pos/billing" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                    <Zap className="w-4 h-4" /> Quick Bill
                </Link>
                <Link to="/receptionist/queue" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border text-text rounded-xl text-sm font-bold hover:bg-surface transition-all">
                    <Users className="w-4 h-4" /> Add Walk-In
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center`}>
                            <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text">{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Appointment Timeline */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-text">Today's Appointments</h2>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="divide-y divide-border">
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
                            <button className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors shrink-0" title="Check-in">
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
