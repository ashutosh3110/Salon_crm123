import { useState, useEffect, useCallback } from 'react';
import {
    Users, Plus, Search, Filter,
    Mail, Phone, Star, BadgeCheck,
    UserPlus, MailCheck, Shield, Trash2, Edit2,
    ChevronDown, TrendingUp,
} from 'lucide-react';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomDropdown from '../../components/common/CustomDropdown';
import api from '../../services/api';

const ROLE_OPTIONS_ADD = [
    { label: 'Senior Stylist', value: 'stylist:Senior Stylist' },
    { label: 'Junior Stylist', value: 'stylist:Junior Stylist' },
    { label: 'Makeup Artist', value: 'stylist:Makeup Artist' },
    { label: 'Stylist', value: 'stylist:Stylist' },
    { label: 'Receptionist', value: 'receptionist:' },
    { label: 'Accountant', value: 'accountant:' },
    { label: 'Inventory manager', value: 'inventory_manager:' },
];

const ROLE_OPTIONS_EDIT = [
    ...ROLE_OPTIONS_ADD,
    { label: 'Manager', value: 'manager:' },
    { label: 'Admin', value: 'admin:' },
];

function parseRoleSelect(composite) {
    if (!composite || typeof composite !== 'string') return { role: 'stylist', specialist: 'Stylist' };
    const i = composite.indexOf(':');
    if (i === -1) return { role: composite, specialist: '' };
    const role = composite.slice(0, i);
    const rest = composite.slice(i + 1).trim();
    return {
        role,
        specialist: role === 'stylist' ? (rest || 'Stylist') : '',
    };
}

function toRoleSelectValue(m) {
    if (!m?.role) return 'stylist:Stylist';
    if (m.role === 'stylist') {
        return `stylist:${(m.specialist || 'Stylist').trim()}`;
    }
    return `${m.role}:`;
}

function isProtectedMember(m) {
    return m && ['admin', 'superadmin'].includes(m.role);
}

const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
];

const defaultStats = {
    totalStaff: 0,
    activeNow: 0,
    onLeave: 0,
    pendingInvitations: 0,
};

function formatYAxisTick(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return '₹0';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}K`;
    return `₹${Math.round(n)}`;
}

export default function TeamPage() {
    const { user } = useAuth();
    const selfId = user?._id || user?.id;
    const roleOptionsEdit =
        user?.role === 'manager' ? ROLE_OPTIONS_EDIT.filter((o) => o.value !== 'admin:') : ROLE_OPTIONS_EDIT;
    const [team, setTeam] = useState([]);
    const [stats, setStats] = useState(defaultStats);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        roleSelect: 'stylist:Stylist',
        phone: '',
        status: 'Active',
    });
    const [editingMember, setEditingMember] = useState(null);
    const [saving, setSaving] = useState(false);
    const [revenueGrowth, setRevenueGrowth] = useState([]);

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        setLoadError('');
        try {
            const { data: res } = await api.get('/dashboard/team');
            const payload = res?.data ?? res;
            setStats(payload?.stats || defaultStats);
            setRevenueGrowth(Array.isArray(payload?.revenueGrowth) ? payload.revenueGrowth : []);
            const list = payload?.members || [];
            setTeam(
                list.map((m) => ({
                    ...m,
                    roleLabel: m.displayRole || m.role,
                }))
            );
        } catch (e) {
            const msg = e.response?.data?.message || e.message || 'Failed to load team';
            setLoadError(msg);
            setTeam([]);
            setStats(defaultStats);
            setRevenueGrowth([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const filteredTeam = team.filter((member) => {
        const q = searchTerm.toLowerCase();
        return (
            (member.name || '').toLowerCase().includes(q) ||
            (member.roleLabel || '').toLowerCase().includes(q) ||
            (member.email || '').toLowerCase().includes(q) ||
            String(member.phone || '').includes(searchTerm)
        );
    });

    const handleDelete = async (id) => {
        const m = team.find((x) => x.id === id);
        if (m && isProtectedMember(m)) return;
        if (selfId && String(id) === String(selfId)) {
            window.alert('You cannot remove your own account.');
            return;
        }
        if (!window.confirm('Are you sure you want to remove this team member?')) return;
        try {
            await api.delete(`/users/${id}`);
            await fetchTeam();
        } catch (e) {
            window.alert(e.response?.data?.message || e.message || 'Delete failed');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        const { role, specialist } = parseRoleSelect(newMember.roleSelect);
        setSaving(true);
        try {
            await api.post('/users', {
                name: newMember.name.trim(),
                email: newMember.email.trim(),
                phone: newMember.phone.trim(),
                role,
                specialist,
                status: newMember.status === 'Active' ? 'active' : 'inactive',
            });
            setIsAddModalOpen(false);
            setNewMember({
                name: '',
                email: '',
                roleSelect: 'stylist:Stylist',
                phone: '',
                status: 'Active',
            });
            await fetchTeam();
        } catch (err) {
            window.alert(err.response?.data?.message || err.message || 'Could not add member');
        } finally {
            setSaving(false);
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editingMember || isProtectedMember(editingMember)) {
            setEditingMember(null);
            return;
        }
        const { role, specialist } = parseRoleSelect(editingMember.roleSelect);
        setSaving(true);
        try {
            await api.patch(`/users/${editingMember.id}`, {
                name: editingMember.name.trim(),
                email: editingMember.email?.trim(),
                phone: editingMember.phone.trim(),
                role,
                specialist,
                status: editingMember.status === 'Active' ? 'active' : 'inactive',
            });
            setEditingMember(null);
            await fetchTeam();
        } catch (err) {
            window.alert(err.response?.data?.message || err.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const statusStyles = {
        Active: 'bg-emerald-500/10 text-emerald-500',
        Inactive: 'bg-rose-500/10 text-rose-500',
    };

    const statCards = [
        { label: 'Total Staff', value: stats.totalStaff ?? 0, icon: Users, color: 'text-emerald-500' },
        { label: 'Active Now', value: stats.activeNow ?? 0, icon: BadgeCheck, color: 'text-emerald-500' },
        { label: 'On Leave', value: stats.onLeave ?? 0, icon: MailCheck, color: 'text-rose-500' },
        { label: 'Pending Invitations', value: stats.pendingInvitations ?? 0, icon: Shield, color: 'text-emerald-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 text-left font-black">
                <div className="leading-none text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">Team Registry</h1>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none">Unit :: personnel_load_v4.0 // operational_staff</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-6 sm:px-10 py-3 sm:py-4 rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black"
                >
                    <UserPlus className="w-4 h-4" /> Enroll Personnel
                </button>
            </div>

            {loadError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm px-4 py-3 rounded-none">
                    {loadError}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-surface py-4 px-5 sm:py-6 sm:px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-colors group-hover:text-primary" />
                                <p className="text-[9px] sm:text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{s.label}</p>
                            </div>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight uppercase leading-none">
                                {loading ? (
                                    <span className="text-text-muted">…</span>
                                ) : (
                                    <AnimatedCounter value={Number(s.value)} />
                                )}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-5 sm:px-8 pt-6 sm:pt-8 pb-2 border-b border-border/40">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h2 className="text-[11px] sm:text-xs font-black text-text uppercase tracking-[0.25em] leading-none">
                                Revenue growth
                            </h2>
                            <p className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2 not-italic">
                                Paid invoices · salon total · last 7 rolling days
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 self-start px-4 py-2.5 bg-background border border-border text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-text hover:border-primary/40 transition-colors"
                        aria-haspopup="listbox"
                        aria-label="Date range"
                    >
                        Last 7 days
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                </div>
                <div className="px-2 sm:px-4 pb-6 sm:pb-8 pt-4">
                    {loading ? (
                        <div className="h-[260px] sm:h-[300px] flex items-center justify-center text-[10px] font-black uppercase text-text-muted tracking-widest">
                            Loading chart…
                        </div>
                    ) : revenueGrowth.length === 0 ? (
                        <div className="h-[260px] sm:h-[300px] flex items-center justify-center text-[10px] font-black uppercase text-text-muted tracking-widest">
                            No revenue data for this period
                        </div>
                    ) : (
                        <div className="h-[260px] sm:h-[300px] w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={revenueGrowth} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
                                    <defs>
                                        <linearGradient id="teamRevenueFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.45} />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 800 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={formatYAxisTick}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                        width={56}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 0,
                                            fontSize: 11,
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                        }}
                                        labelStyle={{ color: 'var(--text-muted)', marginBottom: 4 }}
                                        formatter={(value) => [
                                            `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                                            'Revenue',
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="none"
                                        fill="url(#teamRevenueFill)"
                                        isAnimationActive
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="var(--primary)"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: 'var(--background)', stroke: 'var(--primary)', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-surface rounded-none border border-border p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Scan for personnel signature..."
                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 bg-surface-alt border border-border rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-surface border border-border rounded-none text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-all"
                >
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Parameters
                </button>
            </div>

            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border/40">
                                <th className="px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Member</th>
                                <th className="px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Role</th>
                                <th className="px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest">Performance</th>
                                <th className="px-5 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted text-sm">
                                        Loading team…
                                    </td>
                                </tr>
                            )}
                            {!loading && team.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted text-sm">
                                        No staff members yet. Enroll someone to get started.
                                    </td>
                                </tr>
                            )}
                            {!loading && team.length > 0 && filteredTeam.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted text-sm">
                                        No team members match your search.
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                team.length > 0 &&
                                filteredTeam.map((member) => (
                                    <tr key={member.id} className="hover:bg-surface-alt/50 transition-colors group">
                                        <td className="px-5 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-none bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                                                    {(member.name || '?').split(' ').map((n) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-bold text-text group-hover:text-primary transition-colors">{member.name}</p>
                                                    <p className="text-[10px] sm:text-[11px] text-text-muted font-medium">{maskPhone(member.phone, user?.role)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3 sm:py-4">
                                            <span className="text-[10px] sm:text-xs font-bold text-text-secondary bg-background px-2 py-0.5 rounded-none border border-border/10 uppercase tracking-tight">
                                                {member.roleLabel}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3 sm:py-4">
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-tight ${statusStyles[member.status] || 'bg-surface-alt text-text-muted'}`}
                                            >
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3 sm:py-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-xs sm:text-sm font-bold text-text">
                                                        {member.rating != null ? Number(member.rating).toFixed(1) : '—'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] sm:text-[11px] font-medium text-text-muted uppercase tracking-tight">
                                                    {member.appointments} service{member.appointments !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (isProtectedMember(member)) return;
                                                        setEditingMember({
                                                            ...member,
                                                            roleSelect: toRoleSelectValue(member),
                                                        });
                                                    }}
                                                    disabled={isProtectedMember(member)}
                                                    className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-none transition-colors text-text-muted hover:text-primary border border-transparent hover:border-primary/20 disabled:opacity-40 disabled:pointer-events-none"
                                                    title={isProtectedMember(member) ? 'Cannot edit this role' : 'Edit member'}
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(member.id)}
                                                    disabled={
                                                        isProtectedMember(member) ||
                                                        Boolean(selfId && String(member.id) === String(selfId))
                                                    }
                                                    className="p-1.5 sm:p-2 hover:bg-rose-500/10 rounded-none transition-colors text-text-muted hover:text-rose-500 border border-transparent hover:border-rose-500/20 disabled:opacity-40 disabled:pointer-events-none"
                                                    title="Delete member"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between">
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Enroll New Staff</h2>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-primary transition-colors">
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
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Work Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    placeholder="name@salon.com"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDropdown
                                    label="Assigned Role"
                                    options={ROLE_OPTIONS_ADD}
                                    value={newMember.roleSelect}
                                    onChange={(val) => setNewMember({ ...newMember, roleSelect: val })}
                                />
                                <CustomDropdown
                                    label="Current Status"
                                    options={statusOptions}
                                    value={newMember.status}
                                    onChange={(val) => setNewMember({ ...newMember, status: val })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> Contact Number
                                </label>
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
                                    disabled={saving}
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                                >
                                    {saving ? 'Saving…' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white border border-border/60 rounded-none w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-border/40 flex items-center justify-between bg-surface-alt/30">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                                    {(editingMember.name || '?').split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Edit Member</h2>
                                    <p className="text-[10px] text-text-muted font-medium mt-0.5">
                                        ID #{editingMember.id} · Joined {editingMember.joined || '—'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingMember(null)}
                                className="p-2 hover:bg-surface-alt rounded-none transition-colors text-text-muted hover:text-primary"
                            >
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
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
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Work Email
                                </label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm outline-none focus:border-primary/50 transition-colors"
                                    value={editingMember.email || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDropdown
                                    label="Assigned Role"
                                    options={roleOptionsEdit}
                                    value={editingMember.roleSelect}
                                    onChange={(val) => setEditingMember({ ...editingMember, roleSelect: val })}
                                />
                                <CustomDropdown
                                    label="Current Status"
                                    options={statusOptions}
                                    value={editingMember.status}
                                    onChange={(val) => setEditingMember({ ...editingMember, status: val })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border/40 rounded-none text-sm font-medium outline-none focus:border-primary/50 transition-colors"
                                    value={editingMember.phone || ''}
                                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3 bg-surface-alt/50 border border-border/30">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Preview:</span>
                                <span
                                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight ${statusStyles[editingMember.status] ?? 'bg-surface-alt text-text-muted'}`}
                                >
                                    {editingMember.status}
                                </span>
                                <span className="text-[11px] font-bold text-text-secondary ml-auto truncate max-w-[50%]">
                                    {(() => {
                                        const pr = parseRoleSelect(editingMember.roleSelect);
                                        return pr.role === 'stylist' ? pr.specialist : pr.role;
                                    })()}
                                </span>
                            </div>
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
                                    disabled={saving}
                                    className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                                >
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
