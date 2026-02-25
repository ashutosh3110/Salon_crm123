import { useState } from 'react';
import {
    Users, Plus, Search, Filter, MoreVertical,
    Mail, Phone, Star, BadgeCheck, Shield,
    UserPlus, MailCheck, Trash2, Edit2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';

const INITIAL_TEAM = [
    { id: 1, name: 'Ananya Sharma', role: 'Senior Stylist', status: 'Active', phone: '+91 98765 43210', rating: 4.9, appointments: 142, joined: 'Jan 2024' },
    { id: 2, name: 'Rahul Verma', role: 'Receptionist', status: 'Active', phone: '+91 98765 43211', rating: 4.7, appointments: 0, joined: 'Feb 2024' },
    { id: 3, name: 'Priya Das', role: 'Makeup Artist', status: 'On Break', phone: '+91 98765 43212', rating: 4.8, appointments: 98, joined: 'Mar 2024' },
    { id: 4, name: 'Vikas Singh', role: 'Junior Stylist', status: 'Active', phone: '+91 98765 43213', rating: 4.5, appointments: 64, joined: 'Apr 2024' },
    { id: 5, name: 'Sonal Mehra', role: 'Stylist', status: 'Inactive', phone: '+91 98765 43214', rating: 4.6, appointments: 112, joined: 'Dec 2023' },
];

export default function TeamPage() {
    const [team, setTeam] = useState(INITIAL_TEAM);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', role: 'Stylist', phone: '', status: 'Active' });
    const [editingMember, setEditingMember] = useState(null); // holds the member being edited

    const roleOptions = [
        { label: 'Stylist', value: 'Stylist' },
        { label: 'Senior Stylist', value: 'Senior Stylist' },
        { label: 'Junior Stylist', value: 'Junior Stylist' },
        { label: 'Receptionist', value: 'Receptionist' },
        { label: 'Makeup Artist', value: 'Makeup Artist' },
    ];

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'On Break', value: 'On Break' },
        { label: 'Inactive', value: 'Inactive' },
    ];

    const filteredTeam = team.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            setTeam(team.filter(m => m.id !== id));
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        const id = team.length > 0 ? Math.max(...team.map(m => m.id)) + 1 : 1;
        setTeam([...team, { ...newMember, id, rating: 0, appointments: 0, joined: 'Feb 2025' }]);
        setIsAddModalOpen(false);
        setNewMember({ name: '', role: 'Stylist', phone: '', status: 'Active' });
    };

    const handleEditSave = (e) => {
        e.preventDefault();
        setTeam(team.map(m => m.id === editingMember.id ? { ...m, ...editingMember } : m));
        setEditingMember(null);
    };

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
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <UserPlus className="w-4 h-4" /> Add Team Member
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Staff', value: '12', icon: Users, color: 'text-emerald-500' },
                    { label: 'Active Now', value: '8', icon: BadgeCheck, color: 'text-emerald-500' },
                    { label: 'On Leave', value: '2', icon: MailCheck, color: 'text-rose-500' },
                    { label: 'Pending Invitations', value: '3', icon: Shield, color: 'text-emerald-500' },
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
                                    {s.color === 'text-rose-500' ? '-2%' : '+4%'}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className="text-3xl font-black text-text tracking-tight uppercase">
                                    <AnimatedCounter value={parseFloat(s.value)} />
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

            {/* Filters & Search */}
            <div className="bg-white rounded-none border border-border/60 p-3 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search team member..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border/60 rounded-none text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>
            </div>

            {/* Team List */}
            <div className="bg-white rounded-none border border-border/60 overflow-hidden shadow-none">
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
                            {filteredTeam.map((member) => (
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
                                            <button
                                                onClick={() => setEditingMember({ ...member })}
                                                className="p-2 hover:bg-primary/10 rounded-none transition-colors text-text-muted hover:text-primary border border-transparent hover:border-primary/20"
                                                title="Edit member"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="p-2 hover:bg-white dark:hover:bg-surface-alt rounded-lg transition-colors text-text-muted hover:text-rose-500"
                                            >
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
            {/* Add Member Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Enroll New Staff</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-primary transition-colors">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    placeholder="e.g. Rahul Sharma"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDropdown
                                    label="Assigned Role"
                                    options={roleOptions}
                                    value={newMember.role}
                                    onChange={(val) => setNewMember({ ...newMember, role: val })}
                                />
                                <CustomDropdown
                                    label="Current Status"
                                    options={statusOptions}
                                    value={newMember.status}
                                    onChange={(val) => setNewMember({ ...newMember, status: val })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    placeholder="+91 00000 00000"
                                    value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Confirm Enrollment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border/40 flex items-center justify-between bg-surface-alt/30">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                                    {editingMember.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Edit Member</h2>
                                    <p className="text-[10px] text-text-muted font-medium mt-0.5">ID #{editingMember.id} · Joined {editingMember.joined}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="p-2 hover:bg-surface-alt rounded-none transition-colors text-text-muted hover:text-primary"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm font-medium outline-none focus:border-primary/50 transition-colors"
                                    value={editingMember.name}
                                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                                />
                            </div>

                            {/* Role + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDropdown
                                    label="Assigned Role"
                                    options={roleOptions}
                                    value={editingMember.role}
                                    onChange={(val) => setEditingMember({ ...editingMember, role: val })}
                                />
                                <CustomDropdown
                                    label="Current Status"
                                    options={statusOptions}
                                    value={editingMember.status}
                                    onChange={(val) => setEditingMember({ ...editingMember, status: val })}
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm font-medium outline-none focus:border-primary/50 transition-colors"
                                    value={editingMember.phone}
                                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                                />
                            </div>

                            {/* Status preview badge */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-surface-alt/50 border border-border/30">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Preview:</span>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${statusStyles[editingMember.status] ?? 'bg-surface-alt text-text-muted'}`}>
                                    {editingMember.status}
                                </span>
                                <span className="text-[11px] font-bold text-text-secondary ml-auto">{editingMember.role}</span>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingMember(null)}
                                    className="flex-1 py-3 bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
