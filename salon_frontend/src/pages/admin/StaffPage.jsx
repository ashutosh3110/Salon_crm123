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
    Trash2,
    ShieldAlert,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCMS } from '../../contexts/CMSContext';
import CustomSelect from '../../components/admin/common/CustomSelect';
import { useNavigate } from 'react-router-dom';

const roleColors = {
    admin: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    manager: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    receptionist: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    stylist: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
    accountant: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    inventory_manager: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
};

const statusColors = {
    accepted: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900',
    pending: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
    expired: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900',
};

export default function StaffPage() {
    const { user } = useAuth();
    const { staff, outlets, addStaff, updateStaff, deleteStaff } = useBusiness();
    const { pendingExpertsCount } = useCMS();
    const navigate = useNavigate();
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
        dob: '',
        pan: '',
        address: '',
        password: ''
    });

    useEffect(() => {
        let result = staff;
        if (search) {
            result = result.filter(s =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.email?.toLowerCase().includes(search.toLowerCase()) ||
                s.phone?.replace(/\D/g, '').includes(search.replace(/\D/g, ''))
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
            dob: u.dob || '',
            pan: u.pan || '',
            address: u.address || '',
            password: ''
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-4 animate-reveal max-w-[1600px] mx-auto pb-8">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight font-mono leading-none">Personnel Roster</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">Team & Authority Matrix</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-primary hover:text-white transition-all font-mono"
                >
                    <Plus className="w-3 h-3" /> Recruit Asset
                </button>
            </div>

            {/* Pending Approvals Alert - Compact */}
            {pendingExpertsCount > 0 && (
                <div 
                    onClick={() => navigate('/admin/marketing/cms')}
                    className="bg-amber-500/10 border border-amber-500/20 p-2 shadow-sm flex items-center justify-between cursor-pointer group hover:bg-amber-500/15 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 flex items-center justify-center text-white">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-none mb-0.5 font-mono">Attention Alert</p>
                            <h4 className="text-[11px] font-black text-text uppercase tracking-tight italic">
                                {pendingExpertsCount} Stylist Profile{pendingExpertsCount > 1 ? 's' : ''} Pending Audit
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest group-hover:gap-3 transition-all font-mono">
                        Review <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            )}

            {/* Filters - Compact */}
            <div className="bg-white p-2 border border-border shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan for name or email..."
                        className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border text-[11px] font-bold focus:border-primary outline-none transition-all placeholder:text-[10px]"
                    />
                </div>
                <div className="flex gap-2">
                    <CustomSelect
                        value={roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                        onChange={(val) => setRoleFilter(val === 'All Roles' ? 'all' : val.toLowerCase())}
                        options={['All Roles', 'Admin', 'Manager', 'Receptionist', 'Stylist']}
                        variant="compact"
                        className="min-w-[120px]"
                    />
                    <CustomSelect
                        value={outletFilter === 'all' ? 'All Units' : outlets.find(o => o._id === outletFilter)?.name}
                        onChange={(val) => setOutletFilter(val === 'All Units' ? 'all' : outlets.find(o => o.name === val)?._id)}
                        options={['All Units', ...outlets.map(o => o.name)]}
                        variant="compact"
                        className="min-w-[150px]"
                    />
                </div>
            </div>

            {/* Table - High Density */}
            <div className="bg-white border border-border shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface font-mono border-b border-border">
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Asset Identity</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-center">Comm Link</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Authority</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Base Center</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-center">Lifecycle</th>
                                <th className="px-4 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <UserCog className="w-12 h-12 text-text-muted mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No matching assets found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((s, index) => (
                                    <tr
                                        key={s._id}
                                        className="hover:bg-primary/[0.02] transition-colors group"
                                    >
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center text-text font-black text-[10px] font-mono group-hover:border-primary transition-colors">
                                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-text text-[11px] group-hover:text-primary transition-colors italic uppercase font-mono">{s.name}</div>
                                                    <div className="text-[9px] text-text-muted font-bold tracking-tight lowercase font-sans">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className="text-[9px] font-black text-text-secondary font-mono tracking-tighter uppercase whitespace-nowrap">
                                                {maskPhone(s.phone, user?.role)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-tighter border border-transparent ${roleColors[s.role] || 'bg-slate-50 text-slate-500'}`}>
                                                <Shield className="w-2.5 h-2.5" /> {s.role?.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-1 text-[9px] font-black text-text-muted uppercase italic font-mono truncate max-w-[120px]">
                                                <MapPin className="w-2.5 h-2.5" />
                                                {s.outletName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black border uppercase tracking-widest font-mono ${statusColors[s.inviteStatus]}`}>
                                                {s.inviteStatus === 'accepted' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                {s.inviteStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleResendInvite(s._id)}
                                                    className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                                    title="Resend"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-1.5 text-text-muted hover:text-text transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s._id, s.inviteStatus)}
                                                    className="p-1.5 text-text-muted hover:text-rose-500 transition-colors"
                                                    title="Toggle"
                                                >
                                                    <Ban className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s._id)}
                                                    className="p-1.5 text-text-muted hover:text-rose-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer - Compact */}
                <div className="bg-surface px-4 py-2 border-t border-border flex items-center justify-between">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] font-mono italic">
                        Node Audit: {filteredStaff.length} Assets Online
                    </span>
                    <div className="flex gap-4">
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20" disabled>Backward</button>
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Forward</button>
                    </div>
                </div>
            </div>

            {/* Shift Modal - High Density Refinement */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-md p-6 shadow-2xl relative border-2 border-text overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-text text-white flex items-center justify-center">
                                <UserCog className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-black text-text uppercase italic font-mono leading-none">
                                    {editing ? 'Update Profile' : 'New Asset Entry'}
                                </h2>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Personnel Induction Flux</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="ml-auto p-1 hover:bg-surface transition-colors">
                                <XCircle className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Full Identity</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text uppercase font-mono"
                                        placeholder="SYSTEM NAME"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Digital Link</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text font-mono"
                                        placeholder="email@node.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Comm Channel</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setForm({ ...form, phone: val });
                                        }}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text font-mono"
                                        placeholder="10D NUM"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Auth Role</label>
                                    <select 
                                        value={form.role} 
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono uppercase"
                                    >
                                        <option value="stylist">Stylist</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="manager">Manager</option>
                                        <option value="accountant">Accountant</option>
                                        <option value="inventory_manager">Inventory Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Unit Station</label>
                                    <select 
                                        value={form.outletId} 
                                        onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono uppercase"
                                    >
                                        <option value="">Choose Unit</option>
                                        {outlets.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">DOB</label>
                                    <input
                                        type="date"
                                        value={form.dob || ''}
                                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">PAN ID</label>
                                    <input
                                        type="text"
                                        value={form.pan || ''}
                                        onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Address Node</label>
                                    <textarea
                                        value={form.address || ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono resize-none h-12"
                                        placeholder="PHYSICAL LOCATION"
                                    />
                                </div>
                                {!editing && (
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Gate Pass (Password)</label>
                                        <input
                                            type="password"
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                            placeholder="SECURE ACCESS"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-colors font-mono"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-text text-white py-3 shadow-lg flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 disabled:opacity-30"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <span className="text-[9px] font-black uppercase tracking-widest font-mono">{editing ? 'Commit Change' : 'Induct Asset'}</span>
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
