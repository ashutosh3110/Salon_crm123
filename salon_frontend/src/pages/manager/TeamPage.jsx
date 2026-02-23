import { useState } from 'react';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, Star, BadgeCheck, Shield,
    UserPlus, MailCheck, Trash2, Edit2
} from 'lucide-react';

const mockTeam = [
    { id: 1, name: 'Ananya Sharma', role: 'Senior Stylist', status: 'Active', phone: '+91 98765 43210', rating: 4.9, appointments: 142, joined: 'Jan 2024' },
    { id: 2, name: 'Rahul Verma', role: 'Receptionist', status: 'Active', phone: '+91 98765 43211', rating: 4.7, appointments: 0, joined: 'Feb 2024' },
    { id: 3, name: 'Priya Das', role: 'Makeup Artist', status: 'On Break', phone: '+91 98765 43212', rating: 4.8, appointments: 98, joined: 'Mar 2024' },
    { id: 4, name: 'Vikas Singh', role: 'Junior Stylist', status: 'Active', phone: '+91 98765 43213', rating: 4.5, appointments: 64, joined: 'Apr 2024' },
    { id: 5, name: 'Sonal Mehra', role: 'Stylist', status: 'Inactive', phone: '+91 98765 43214', rating: 4.6, appointments: 112, joined: 'Dec 2023' },
];

export default function TeamPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const statusStyles = {
        'Active': 'bg-emerald-500/10 text-emerald-500',
        'On Break': 'bg-amber-500/10 text-amber-500',
        'Inactive': 'bg-rose-500/10 text-rose-500',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Team Management</h1>
                    <p className="text-sm text-text-muted font-medium">Manage your staff, roles, and performance</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <UserPlus className="w-4 h-4" /> Add Team Member
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Staff', value: '12', icon: Users, color: 'text-primary' },
                    { label: 'Active Now', value: '8', icon: BadgeCheck, color: 'text-emerald-500' },
                    { label: 'On Leave', value: '2', icon: MailCheck, color: 'text-amber-500' },
                    { label: 'Pending Invitations', value: '3', icon: Shield, color: 'text-blue-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/10 mb-3">
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <p className="text-2xl font-black text-text leading-none">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-surface rounded-2xl border border-border/40 p-3 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search team member..."
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-sm outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>
            </div>

            {/* Team List */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border/40">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Performance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {mockTeam.map((member) => (
                                <tr key={member.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{member.name}</p>
                                                <p className="text-[11px] text-text-muted font-medium">{member.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-text-secondary bg-background px-2.5 py-1 rounded-lg border border-border/10">{member.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${statusStyles[member.status]}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span className="text-sm font-bold text-text">{member.rating}</span>
                                            </div>
                                            <div className="text-[11px] font-medium text-text-muted">
                                                {member.appointments} service{member.appointments !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-white dark:hover:bg-surface-alt rounded-lg transition-colors text-text-muted hover:text-primary">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-white dark:hover:bg-surface-alt rounded-lg transition-colors text-text-muted hover:text-rose-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
