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
    Ban
} from 'lucide-react';
import api from '../../services/api';

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

const MOCK_OUTLETS = [
    { id: 'mock-1', name: 'Grace & Glamour - Downtown' },
    { id: 'mock-2', name: 'The Royal Salon - Bandra' },
    { id: 'mock-3', name: 'Elegance Spa & Pune' },
];

const MOCK_STAFF = [
    {
        _id: 's-1',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '+91 98765 00001',
        role: 'manager',
        outletId: 'mock-1',
        outletName: 'Grace & Glamour - Downtown',
        inviteStatus: 'accepted',
        joinedDate: '2026-01-15'
    },
    {
        _id: 's-2',
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '+91 98765 00002',
        role: 'stylist',
        outletId: 'mock-1',
        outletName: 'Grace & Glamour - Downtown',
        inviteStatus: 'accepted',
        joinedDate: '2026-02-01'
    },
    {
        _id: 's-3',
        name: 'Anita Verma',
        email: 'anita@example.com',
        phone: '+91 98765 00003',
        role: 'receptionist',
        outletId: 'mock-2',
        outletName: 'The Royal Salon - Bandra',
        inviteStatus: 'pending',
        joinedDate: '-'
    },
    {
        _id: 's-4',
        name: 'Vikram Malhotra',
        email: 'vikram@example.com',
        phone: '+91 98765 00004',
        role: 'stylist',
        outletId: 'mock-3',
        outletName: 'Elegance Spa & Pune',
        inviteStatus: 'expired',
        joinedDate: '-'
    }
];

export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            const list = data?.data?.results || data?.results || data?.data || data || [];

            let finalData = Array.isArray(list) ? list : [];

            // Fallback to mock data for demo
            if (finalData.length === 0) {
                finalData = MOCK_STAFF;
            } else {
                finalData = finalData.map(s => ({
                    ...s,
                    inviteStatus: s.inviteStatus || 'accepted',
                    outletName: MOCK_OUTLETS.find(o => o.id === s.outletId)?.name || 'Main Office'
                }));
            }

            setStaff(finalData);
            setFilteredStaff(finalData);
        }
        catch (err) {
            console.error('Failed to fetch staff, using mock:', err);
            setStaff(MOCK_STAFF);
            setFilteredStaff(MOCK_STAFF);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/users/${editing._id}`, form);
            } else {
                await api.post('/users', form);
            }
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
            fetchStaff();
        } catch (err) { alert(err.response?.data?.message || 'Error saving staff'); }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'accepted' ? 'expired' : 'accepted'; // Simplified for demo
        alert(`Staff status toggled to: ${newStatus === 'accepted' ? 'Active' : 'Disabled'}`);
        // In real app: await api.patch(`/users/${id}`, { inviteStatus: newStatus });
        fetchStaff();
    };

    const handleResendInvite = (id) => {
        alert(`Invitation resent to staff member.`);
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
                    <h1 className="text-2xl font-bold text-text tracking-tight">Staff Management</h1>
                    <p className="text-sm text-text-secondary mt-1">Manage your team, roles, and outlet assignments.</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
                        setShowModal(true);
                    }}
                    className="btn-salon inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Staff Member
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 hover-shine">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search staff..."
                        className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all input-expand"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-text-secondary" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="stylist">Stylist</option>
                        </select>
                    </div>
                    <select
                        value={outletFilter}
                        onChange={(e) => setOutletFilter(e.target.value)}
                        className="text-sm border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Outlets</option>
                        {MOCK_OUTLETS.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden card-interactive">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Staff Member</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Outlet</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Invite Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="h-12 bg-surface rounded-lg relative overflow-hidden">
                                                <div className="absolute inset-0 animate-shimmer"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-text-muted">
                                        <UserCog className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No staff members found matching your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((s, index) => (
                                    <tr
                                        key={s._id}
                                        style={{ '--delay': `${index * 80}ms` }}
                                        className="hover:bg-surface/50 active:bg-surface transition-all group cursor-default animate-stagger"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/10">
                                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text leading-tight">{s.name}</p>
                                                    <p className="text-[11px] text-text-muted mt-0.5">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[s.role] || 'bg-gray-50 text-gray-500'}`}>
                                                <Shield className="w-3 h-3" /> {s.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                                                {s.outletName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusColors[s.inviteStatus]}`}>
                                                {s.inviteStatus === 'accepted' && <CheckCircle2 className="w-3 h-3" />}
                                                {s.inviteStatus === 'pending' && <Clock className="w-3 h-3" />}
                                                {s.inviteStatus === 'expired' && <XCircle className="w-3 h-3" />}
                                                {s.inviteStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {s.inviteStatus !== 'accepted' && (
                                                    <button
                                                        onClick={() => handleResendInvite(s._id)}
                                                        className="p-2 rounded-lg text-primary hover:bg-primary/5 transition-all tooltip"
                                                        title="Resend Invite"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s._id, s.inviteStatus)}
                                                    className={`p-2 rounded-lg transition-all ${s.inviteStatus === 'accepted'
                                                        ? 'text-text-muted hover:text-error hover:bg-error/5'
                                                        : 'text-text-muted hover:text-success hover:bg-success/5'
                                                        }`}
                                                    title={s.inviteStatus === 'accepted' ? 'Disable' : 'Enable'}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <UserCog className="w-5 h-5" />
                            </div>
                            {editing ? 'Edit Staff Member' : 'Invite New Staff'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-sm font-semibold text-text-secondary">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Assign Role *</label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition outline-none"
                                    >
                                        <option value="stylist">Stylist</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="manager">Manager</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="inventory_manager">Inventory Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-text-secondary">Primary Outlet *</label>
                                    <select
                                        value={form.outletId}
                                        onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition outline-none"
                                    >
                                        <option value="">Select Outlet</option>
                                        {MOCK_OUTLETS.map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {!editing && (
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-semibold text-text-secondary">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder="Create a password"
                                            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                        />
                                        <p className="text-[10px] text-text-muted">Staff will be asked to change this password on first login.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface-alt transition">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-3 rounded-xl shadow-lg shadow-primary/20 font-bold">{editing ? 'Update Details' : 'Send Invitation'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
