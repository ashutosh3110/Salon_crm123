import { Calendar, DollarSign, Users, Clock, Star, TrendingUp, Scissors } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────
const mySchedule = [
    { id: 1, time: '10:00 AM', customer: 'Priya Sharma', service: 'Hair Cut + Blow Dry', duration: '45 min', status: 'completed' },
    { id: 2, time: '11:00 AM', customer: 'Meera Patel', service: 'Hair Colour (Global)', duration: '90 min', status: 'in-progress' },
    { id: 3, time: '12:30 PM', customer: 'Sneha Reddy', service: 'Hair Spa', duration: '60 min', status: 'upcoming' },
    { id: 4, time: '02:00 PM', customer: 'Ritu Singh', service: 'Keratin Treatment', duration: '120 min', status: 'upcoming' },
    { id: 5, time: '04:00 PM', customer: 'Kavya Iyer', service: 'Hair Cut + Styling', duration: '45 min', status: 'upcoming' },
];

const commissionData = {
    earned: 4250,
    target: 10000,
    services: 12,
    avgRating: 4.7,
};

const statusStyles = {
    'completed': 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700 animate-pulse',
    'upcoming': 'bg-gray-100 text-gray-600',
};

export default function StylistDashboard() {
    const progressPercent = Math.round((commissionData.earned / commissionData.target) * 100);

    return (
        <div className="space-y-6">
            {/* Greeting & Commission Progress */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Scissors className="w-4 h-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Today's Progress</p>
                    </div>
                    <h2 className="text-2xl font-black mb-4">{commissionData.services} Services Done</h2>
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-[10px] text-white/60 font-bold mb-0.5">COMMISSION</p>
                            <p className="text-xl font-black">₹{commissionData.earned.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/60 font-bold mb-0.5">TARGET</p>
                            <p className="text-xl font-black">₹{commissionData.target.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/60 font-bold mb-0.5">RATING</p>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                                <span className="text-xl font-black">{commissionData.avgRating}</span>
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-white/60 font-bold mb-1">
                            <span>Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Mini Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Today', value: mySchedule.length, icon: Calendar, color: 'violet' },
                    { label: 'Completed', value: mySchedule.filter(s => s.status === 'completed').length, icon: Star, color: 'green' },
                    { label: 'In Progress', value: mySchedule.filter(s => s.status === 'in-progress').length, icon: Clock, color: 'blue' },
                    { label: 'Upcoming', value: mySchedule.filter(s => s.status === 'upcoming').length, icon: Users, color: 'gray' },
                ].map((s) => (
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

            {/* My Schedule */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-extrabold text-text">My Schedule Today</h2>
                </div>
                <div className="divide-y divide-border">
                    {mySchedule.map((apt) => (
                        <div key={apt.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                            <div className="w-16 text-center shrink-0">
                                <p className="text-sm font-black text-text">{apt.time.split(' ')[0]}</p>
                                <p className="text-[10px] text-text-muted font-bold">{apt.time.split(' ')[1]}</p>
                            </div>
                            <div className="w-px h-8 bg-border" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text truncate">{apt.customer}</p>
                                <p className="text-xs text-text-muted truncate">{apt.service} • {apt.duration}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusStyles[apt.status]}`}>
                                {apt.status.replace('-', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
