import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    UserCog,
    Mail,
    Phone,
    Shield,
    MapPin,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    Send,
    MoreVertical,
    Ban,
    Trash2
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';

const roleColors = {
    admin: 'bg-purple-50 text-purple-600',
    manager: 'bg-blue-50 text-blue-600',
    receptionist: 'bg-green-50 text-green-600',
    stylist: 'bg-pink-50 text-pink-600',
    accountant: 'bg-yellow-50 text-yellow-600',
    inventory_manager: 'bg-orange-50 text-orange-600',
};

const statusColors = {
    accepted: 'bg-green-50 text-green-600 border-green-100',
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    expired: 'bg-red-50 text-red-600 border-red-100',
};

export default function StaffPage() {
    const { staff, outlets, addStaff, updateStaff, deleteStaff } = useBusiness();
    const [filteredStaff, setFilteredStaff] = useState(staff);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [outletFilter, setOutletFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'stylist',
        outletId: '',
        password: ''
    });

    // Filtering logic
    useEffect(() => {
        let result = staff;

        if (search) {
            result = result.filter(s =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.email?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (roleFilter !== 'all') {
            result = result.filter(s => s.role === roleFilter);
        }

        if (outletFilter !== 'all') {
            result = result.filter(s => s.outletId === outletFilter);
        }

        setFilteredStaff(result);
    }, [search, roleFilter, outletFilter, staff]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            if (editing) {
                updateStaff(editing._id, {
                    ...form,
                    outletName: outlets.find(o => o._id === form.outletId)?.name || 'N/A'
                });
            } else {
                addStaff(form);
            }

            setShowModal(false);
            setEditing(null);
            setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
            setLoading(false);
        }, 500);
    };

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'accepted' ? 'expired' : 'accepted';
        updateStaff(id, { inviteStatus: newStatus });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this staff member?')) {
            deleteStaff(id);
        }
    };

    const handleResendInvite = (id) => {
        alert(`Invitation resent successfully.`);
    };

    const openEdit = (u) => {
        setEditing(u);
        setForm({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            outletId: u.outletId || '',
            password: ''
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text uppercase">Personnel Roster</h1>
                    <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Manage your dream team & assignments</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Recruit Talent
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan for name or email..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="text-xs font-bold uppercase tracking-widest bg-slate-50 border border-border rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none min-w-[140px]"
                        >
                            <option value="all">Every Role</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="stylist">Stylist</option>
                        </select>
                    </div>
                    <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <select
                            value={outletFilter}
                            onChange={(e) => setOutletFilter(e.target.value)}
                            className="text-xs font-bold uppercase tracking-widest bg-slate-50 border border-border rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none min-w-[160px]"
                        >
                            <option value="all">Every Unit</option>
                            {outlets.map(o => (
                                <option key={o._id} value={o._id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border">
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest pl-8">Human Asset</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Authority</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Base Center</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Lifecycle</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <UserCog className="w-16 h-16 text-text-muted mb-4 stroke-1" />
                                            <h3 className="text-lg font-bold text-text">Zero Team Members Found</h3>
                                            <p className="text-[10px] text-text-secondary mt-1 font-bold uppercase tracking-widest">Adjust filters or recruit new talent.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((s, index) => (
                                    <tr
                                        key={s._id}
                                        className="hover:bg-slate-50/50 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shadow-sm group-hover:scale-110 transition-all">
                                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text text-sm group-hover:text-primary transition-colors tracking-tight">{s.name}</div>
                                                    <div className="text-[10px] text-text-muted font-bold tracking-tight lowercase">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-tighter ${roleColors[s.role] || 'bg-slate-50 text-slate-500'}`}>
                                                <Shield className="w-3 h-3" /> {s.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase">
                                                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                                                {s.outletName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-bold border uppercase tracking-widest ${statusColors[s.inviteStatus]}`}>
                                                {s.inviteStatus === 'accepted' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                {s.inviteStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResendInvite(s._id)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:text-primary hover:bg-white hover:shadow-md border border-transparent hover:border-border transition-all"
                                                    title="Resend Invite"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:text-text hover:bg-white hover:shadow-md border border-transparent hover:border-border transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s._id, s.inviteStatus)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:text-rose-500 hover:bg-white hover:shadow-md border border-transparent hover:border-border transition-all"
                                                    title="Toggle Lifecycle"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s._id)}
                                                    className="p-2.5 rounded-xl text-text-muted hover:text-rose-600 hover:bg-white hover:shadow-md border border-transparent hover:border-border transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Analytics Footer */}
                <div className="bg-slate-50/50 px-8 py-5 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        Monitoring {filteredStaff.length} Core Team members
                    </span>
                    <div className="flex gap-6">
                        <button className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-30" disabled>Previous Shift</button>
                        <button className="text-[10px] font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Next Roster</button>
                    </div>
                </div>
            </div>

            {/* Shift Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                <UserCog className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-text uppercase">
                                {editing ? 'Evolve Profile' : 'Recruit Human Asset'}
                            </h2>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Personnel Induction Protocol</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Asset Identity</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Digital Link</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="Email"
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Comm Channel</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="Phone"
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Command Role</label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold uppercase tracking-tighter outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer appearance-none"
                                        >
                                            <option value="stylist">Stylist</option>
                                            <option value="receptionist">Receptionist</option>
                                            <option value="manager">Manager</option>
                                            <option value="accountant">Accountant</option>
                                            <option value="inventory_manager">Inventory Manager</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Station</label>
                                        <select
                                            value={form.outletId}
                                            onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                                            required
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold uppercase tracking-tighter outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer appearance-none"
                                        >
                                            <option value="">Choose Unit</option>
                                            {outlets.map(o => (
                                                <option key={o._id} value={o._id}>{o.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {!editing && (
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Gate Pass (Password)</label>
                                        <input
                                            type="password"
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder="Create Secure Access"
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-3xl text-xs font-bold uppercase tracking-[0.2em] text-text-muted hover:bg-slate-50 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-primary py-4 rounded-3xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span className="text-xs font-bold uppercase tracking-[0.2em]">{editing ? 'Commit' : 'Induct'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
