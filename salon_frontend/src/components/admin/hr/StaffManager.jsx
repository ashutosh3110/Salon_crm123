import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    CheckCircle2,
    XCircle,
    Edit2,
    Eye,
    Trash2,
    UserPlus,
    Building2,
    Clock,
    UserCircle2
} from 'lucide-react';

const MOCK_STAFF = [
    { id: 1, name: 'Ananya Sharma', role: 'Senior Stylist', outlet: 'Main Branch', status: 'active', email: 'ananya@salon.com', phone: '+91 98765 43210', joined: '2023-05-15' },
    { id: 2, name: 'Rahul Verma', role: 'Hair Specialist', outlet: 'City Center', status: 'active', email: 'rahul@salon.com', phone: '+91 98765 43211', joined: '2023-06-20' },
    { id: 3, name: 'Priya Singh', role: 'Makeup Artist', outlet: 'Main Branch', status: 'inactive', email: 'priya@salon.com', phone: '+91 98765 43212', joined: '2023-01-10' },
    { id: 4, name: 'Vikram Malhotra', role: 'Manager', outlet: 'West End', status: 'active', email: 'vikram@salon.com', phone: '+91 98765 43213', joined: '2022-11-05' },
    { id: 5, name: 'Sneha Kapur', role: 'Receptionist', outlet: 'City Center', status: 'active', email: 'sneha@salon.com', phone: '+91 98765 43214', joined: '2023-08-12' },
];

export default function StaffManager() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Staff', value: '24', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { label: 'Active Now', value: '18', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'On Leave', value: '3', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'New Joiners', value: '2', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                                <p className="text-xl font-bold text-text leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search staff by name, role or email..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-text-secondary hover:bg-slate-50 border border-transparent hover:border-border transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all scale-active"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Staff
                    </button>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Role & Outlet</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_STAFF.map((staff) => (
                                <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold shadow-sm">
                                                {staff.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">{staff.name}</p>
                                                <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5 uppercase font-bold tracking-tighter">
                                                    Joined {new Date(staff.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[10px] font-bold uppercase">
                                                <Shield className="w-2.5 h-2.5" />
                                                {staff.role}
                                            </div>
                                            <p className="text-xs text-text flex items-center gap-1 font-medium">
                                                <Building2 className="w-3 h-3 text-text-muted" />
                                                {staff.outlet}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-text flex items-center gap-1.5 font-medium">
                                                <Mail className="w-3 h-3 text-text-muted" />
                                                {staff.email}
                                            </p>
                                            <p className="text-xs text-text flex items-center gap-1.5 font-medium">
                                                <Phone className="w-3 h-3 text-text-muted" />
                                                {staff.phone}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${staff.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${staff.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                                {staff.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-primary transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-rose-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-border text-text-muted hover:text-text transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-text-muted font-bold">Showing <span className="text-text font-bold">5</span> of <span className="text-text font-bold">24</span> staff members</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-lg border border-border text-xs font-bold text-text-muted disabled:opacity-30" disabled>Previous</button>
                        <button className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold shadow-sm">1</button>
                        <button className="px-3 py-1 rounded-lg border border-border text-xs font-bold text-text hover:bg-white transition-colors">2</button>
                        <button className="px-3 py-1 rounded-lg border border-border text-xs font-bold text-text hover:bg-white transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Empty State placeholder (if no staff found) */}
            {MOCK_STAFF.length === 0 && (
                <div className="bg-white rounded-3xl border-2 border-dashed border-border p-12 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-border">
                        <Users className="w-10 h-10 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-bold text-text tracking-tight">Add your first staff member</h3>
                    <p className="text-sm text-text-muted mt-1 max-w-xs mx-auto">Get started by creating your salon's employee master database.</p>
                    <button className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all mx-auto">
                        <Plus className="w-4 h-4" />
                        Add New Staff
                    </button>
                </div>
            )}
        </div>
    );
}
