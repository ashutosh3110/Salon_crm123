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

    // Filtering logic
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
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-left font-black leading-none">
                    <h1 className="text-2xl font-bold text-text uppercase">Personnel Roster</h1>
                    <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Manage your dream team & assignments</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all font-black"
                >
                    <Plus className="w-3.5 h-3.5" /> Recruit Talent
                </button>
            </div>

            {/* Pending Approvals Alert */}
            {pendingExpertsCount > 0 && (
                <div 
                    onClick={() => navigate('/admin/marketing/cms')}
                    className="bg-amber-500/10 border border-amber-500/20 p-4 flex items-center justify-between cursor-pointer group hover:bg-amber-500/15 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-amber-500 flex items-center justify-center text-white">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">Attention Required</p>
                            <h4 className="text-sm font-black text-text uppercase tracking-tight italic">
                                {pendingExpertsCount} Stylist Profile{pendingExpertsCount > 1 ? 's' : ''} Pending Approval
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest group-hover:gap-3 transition-all">
                        Review Protocol <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-surface p-4 rounded-none border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan for name or email..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <CustomSelect
                        value={roleFilter === 'all' ? 'Every Role' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                        onChange={(val) => setRoleFilter(val === 'Every Role' ? 'all' : val.toLowerCase())}
                        options={['Every Role', 'Admin', 'Manager', 'Receptionist', 'Stylist']}
                        className="min-w-[140px]"
                    />
                    <CustomSelect
                        value={outletFilter === 'all' ? 'Every Unit' : outlets.find(o => o._id === outletFilter)?.name}
                        onChange={(val) => setOutletFilter(val === 'Every Unit' ? 'all' : outlets.find(o => o.name === val)?._id)}
                        options={['Every Unit', ...outlets.map(o => o.name)]}
                        className="min-w-[180px]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="table-responsive no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest pl-8">Human Asset</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Contact Protocol</th>
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
                                        className="hover:bg-surface-alt/50 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-5 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm group-hover:scale-110 transition-all">
                                                    {s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text text-sm group-hover:text-primary transition-colors tracking-tight">{s.name}</div>
                                                    <div className="text-[10px] text-text-muted font-bold tracking-tight lowercase">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-text uppercase tracking-widest flex items-center gap-1"><Phone className="w-2.5 h-2.5 opacity-40" /> {maskPhone(s.phone, user?.role)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-tighter ${roleColors[s.role] || 'bg-slate-50 text-slate-500'}`}>
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
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-[9px] font-bold border uppercase tracking-widest ${statusColors[s.inviteStatus]}`}>
                                                {s.inviteStatus === 'accepted' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                {s.inviteStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResendInvite(s._id)}
                                                    className="p-2.5 rounded-none text-text-muted hover:text-primary hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                                    title="Resend Invite"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-2.5 rounded-none text-text-muted hover:text-text hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s._id, s.inviteStatus)}
                                                    className="p-2.5 rounded-none text-text-muted hover:text-rose-500 hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                                    title="Toggle Lifecycle"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s._id)}
                                                    className="p-2.5 rounded-none text-text-muted hover:text-rose-600 hover:bg-surface-alt border border-transparent hover:border-border transition-all"
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
                <div className="bg-surface-alt px-8 py-5 border-t border-border flex items-center justify-between">
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
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-4 border border-primary/20">
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
                                        onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        placeholder="Full Name"
                                        className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
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
                                            className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Comm Channel</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setForm({ ...form, phone: val });
                                            }}
                                            placeholder="Phone"
                                            className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <CustomSelect
                                        label="Command Role"
                                        value={form.role.charAt(0).toUpperCase() + form.role.slice(1).replace('_', ' ')}
                                        onChange={(val) => setForm({ ...form, role: val.toLowerCase().replace(' ', '_') })}
                                        options={['Stylist', 'Receptionist', 'Manager', 'Accountant', 'Inventory Manager', 'Admin']}
                                    />
                                    <CustomSelect
                                        label="Station"
                                        value={outlets.find(o => o._id === form.outletId)?.name}
                                        onChange={(val) => setForm({ ...form, outletId: outlets.find(o => o.name === val)?._id })}
                                        options={outlets.map(o => o.name)}
                                        placeholder="Choose Unit"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Birth_Epoch (DOB)</label>
                                        <input
                                            type="date"
                                            value={form.dob || ''}
                                            onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                            className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Tax_Identifier (PAN)</label>
                                        <input
                                            type="text"
                                            value={form.pan || ''}
                                            onChange={(e) => setForm({ ...form, pan: e.target.value })}
                                            placeholder="PAN Number"
                                            className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 px-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Physical_Node (Address)</label>
                                    <textarea
                                        value={form.address || ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Full Residential Address"
                                        className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30 h-20 resize-none"
                                    />
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
                                            className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:opacity-30"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-none text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-muted hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary text-primary-foreground py-4 rounded-none shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-none animate-spin" />
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{editing ? 'Commit' : 'Induct'}</span>
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
