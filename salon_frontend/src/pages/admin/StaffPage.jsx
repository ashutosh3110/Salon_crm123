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
import PasswordField from '../../components/common/PasswordField';

const roleColors = {
    admin: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    manager: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    receptionist: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    stylist: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
    accountant: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    inventory_manager: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
};

const statusColors = {
    active: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900',
    inactive: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900',
    pending: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
};

export default function StaffPage() {
    const { user } = useAuth();
    const { staff, staffLoading, outlets, addStaff, updateStaff, deleteStaff } = useBusiness();
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
        password: '',
        avatar: '',
        stylistBio: '',
        stylistExperience: '',
        stylistSpecializations: ''
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                stylistSpecializations: form.stylistSpecializations ? form.stylistSpecializations.split(',').map(s => s.trim()).filter(Boolean) : []
            };
            if (editing) {
                await updateStaff(editing._id, payload);
            } else {
                await addStaff(payload);
            }
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '' });
        } catch (error) {
            alert('Operation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await updateStaff(id, { status: newStatus });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this staff member?')) {
            try {
                await deleteStaff(id);
            } catch (error) {
                alert('Delete failed: ' + error.message);
            }
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
            password: '',
            avatar: u.avatar || '',
            stylistBio: u.stylistBio || '',
            stylistExperience: u.stylistExperience || '',
            stylistSpecializations: Array.isArray(u.stylistSpecializations) ? u.stylistSpecializations.join(', ') : (u.stylistSpecializations || '')
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-4 animate-reveal max-w-[1600px] mx-auto pb-8">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-text tracking-tight leading-none">Our Team</h1>
                    <p className="text-[11px] font-medium text-text-muted mt-1 uppercase tracking-wider">Manage Staff & Permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: 'stylist', outletId: '', password: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-text text-background px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                    <Plus className="w-4 h-4" /> Add New Member
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
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-none mb-1">Update Required</p>
                            <h4 className="text-sm font-semibold text-text tracking-tight">
                                {pendingExpertsCount} Stylist Profile{pendingExpertsCount > 1 ? 's' : ''} Under Review
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
                        placeholder="Search by name or email..."
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
                        value={outletFilter === 'all' ? 'All Salons' : outlets.find(o => o._id === outletFilter)?.name}
                        onChange={(val) => setOutletFilter(val === 'All Salons' ? 'all' : outlets.find(o => o.name === val)?._id)}
                        options={['All Salons', ...outlets.map(o => o.name)]}
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
                            <tr className="bg-surface border-b border-border">
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Staff Member</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Contact Number</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Role</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Primary Salon</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Status</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <UserCog className="w-12 h-12 text-text-muted mb-3" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No matching members found.</p>
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
                                                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center text-text font-black text-[10px] font-mono group-hover:border-primary transition-colors overflow-hidden">
                                                    {s.avatar ? (
                                                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        s.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-text text-[11px] group-hover:text-primary transition-colors italic uppercase font-mono">{s.name}</div>
                                                    <div className="text-[9px] text-text-muted font-bold tracking-tight lowercase font-sans">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-xs font-medium text-text-secondary tracking-tight">
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
                                                {outlets.find(o => o._id === s.outletId)?.name || 'Main Unit'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold border rounded-full uppercase tracking-wide ${statusColors[s.status] || statusColors.active}`}>
                                                {s.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {s.status || 'active'}
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
                                                    onClick={() => handleToggleStatus(s._id, s.status || 'active')}
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
                        Team Overview: {filteredStaff.length} Members
                    </span>
                    <div className="flex gap-4">
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20" disabled>Previous</button>
                        <button className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Shift Modal - High Density Refinement */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-2 border-text flex flex-col my-auto max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center gap-4 p-6 pb-4 border-b border-border shrink-0">
                            <div className="w-10 h-10 bg-text text-white flex items-center justify-center">
                                <UserCog className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-black text-text uppercase italic font-mono leading-none">
                                    {editing ? 'Update Profile' : 'Add New Member'}
                                </h2>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">New Staff Registration</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="ml-auto p-1 hover:bg-surface transition-colors">
                                <XCircle className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-160px)] custom-scrollbar">
                                <div className="grid grid-cols-2 gap-3 pb-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Profile Photo</label>
                                    <div className="flex justify-center py-2">
                                        <div className="relative group/photo">
                                            <div className="w-24 h-24 bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover/photo:border-primary">
                                                {form.avatar ? (
                                                    <img src={form.avatar} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Plus className="w-6 h-6 text-text-muted" />
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-text text-background p-1.5 shadow-lg group-hover/photo:scale-110 transition-transform">
                                                <Edit className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 col-span-2">
                                     <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Member Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text uppercase font-mono"
                                        placeholder="ENTER NAME"
                                    />
                                </div>
                                <div className="space-y-1">
                                     <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text font-mono"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setForm({ ...form, phone: val });
                                        }}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[11px] font-black outline-none focus:border-text font-mono"
                                        placeholder="10-DIGIT NUM"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Profession/Role</label>
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
                                     <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Assign to Salon</label>
                                    <select 
                                        value={form.outletId} 
                                        onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono uppercase"
                                    >
                                        <option value="">Select Salon</option>
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
                                     <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">PAN Number</label>
                                    <input
                                        type="text"
                                        value={form.pan || ''}
                                        onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="ABCDE1234F"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                     <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Residential Address</label>
                                    <textarea
                                        value={form.address || ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono resize-none h-12"
                                        placeholder="FULL ADDRESS"
                                    />
                                </div>
                                {!editing && (
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Create Password</label>
                                        <PasswordField
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            inputClassName="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                            placeholder="PASSWORD"
                                        />
                                    </div>
                                )}

                                {form.role === 'stylist' && (
                                    <>
                                        <div className="col-span-2 pt-2 border-t border-border mt-2">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] font-mono">Stylist Public Profile</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Experience</label>
                                            <input
                                                type="text"
                                                value={form.stylistExperience}
                                                onChange={(e) => setForm({ ...form, stylistExperience: e.target.value })}
                                                className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                                placeholder="e.g. 5+ Years"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Specializations</label>
                                            <input
                                                type="text"
                                                value={form.stylistSpecializations}
                                                onChange={(e) => setForm({ ...form, stylistSpecializations: e.target.value })}
                                                className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                                placeholder="Cut, Color..."
                                            />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Professional Bio</label>
                                            <textarea
                                                value={form.stylistBio}
                                                onChange={(e) => setForm({ ...form, stylistBio: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono resize-none h-16"
                                                placeholder="A short summary about the expert..."
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                            <div className="flex gap-3 p-6 border-t border-border bg-surface-alt/10 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-colors font-mono"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-text text-white py-3 shadow-lg flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 disabled:opacity-30"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{editing ? 'Save Changes' : 'Add Member'}</span>
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
