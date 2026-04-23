import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
import { API_BASE_URL } from '../../services/api';

const roleColors = {
    admin: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
    manager: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    receptionist: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    stylist: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400',
    accountant: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
    inventory_manager: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
};

const DEFAULT_AVAILABILITY = {
    mode: 'same',
    breaks: [],
    days: {
        monday: [{ start: '09:00', end: '18:00' }],
        tuesday: [{ start: '09:00', end: '18:00' }],
        wednesday: [{ start: '09:00', end: '18:00' }],
        thursday: [{ start: '09:00', end: '18:00' }],
        friday: [{ start: '09:00', end: '18:00' }],
        saturday: [{ start: '09:00', end: '18:00' }],
        sunday: [{ start: '09:00', end: '18:00' }]
    }
};

const statusColors = {
    active: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900',
    inactive: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900',
    pending: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900',
};

export default function StaffPage() {
    const { user } = useAuth();
    const { staff, staffLoading, outlets, addStaff, updateStaff, deleteStaff, fetchStaff, roles, fetchRoles, platformSettings } = useBusiness();
    const { pendingExpertsCount } = useCMS();
    const navigate = useNavigate();
    const [filteredStaff, setFilteredStaff] = useState(staff);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStaff();
        fetchRoles();
    }, [fetchStaff, fetchRoles]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [outletFilter, setOutletFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        roleId: '',
        outletId: '',
        dob: '',
        pan: '',
        address: '',
        avatar: '',
        stylistBio: '',
        stylistExperience: '',
        stylistSpecializations: '',
        availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY))
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
        setCurrentPage(1);
    }, [search, roleFilter, outletFilter, staff]);

    const [avatarFile, setAvatarFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = platformSettings?.maxImageSize || 5;
        const unit = platformSettings?.maxImageSizeUnit || 'MB';
        const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
        const threshold = maxSize * multiplier;

        if (file.size > threshold) {
            alert(`Image too large. Max ${maxSize}${unit} allowed.`);
            return;
        }

        if (file) {
            setAvatarFile(file);
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
            const formData = new FormData();
            
            // Append all form fields to FormData
            Object.keys(form).forEach(key => {
                if (key === 'avatar') return;
                if (key === 'availability') {
                    formData.append(key, JSON.stringify(form[key]));
                } else if (key === 'pan') {
                    // Safety check for hrProfile to avoid string-spread corruption
                    let baseHrProfile = {};
                    if (editing?.hrProfile) {
                        baseHrProfile = typeof editing.hrProfile === 'string' 
                            ? JSON.parse(editing.hrProfile) 
                            : editing.hrProfile;
                    }
                    
                    const hrProfile = {
                        ...baseHrProfile,
                        panNumber: form.pan
                    };
                    formData.append('hrProfile', JSON.stringify(hrProfile));
                } else if (key === 'stylistSpecializations') {
                    const specs = form.stylistSpecializations ? form.stylistSpecializations.split(',').map(s => s.trim()).filter(Boolean) : [];
                    formData.append(key, JSON.stringify(specs));
                } else {
                    formData.append(key, form[key] || '');
                }
            });

            // Append file if selected
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            if (editing) {
                await updateStaff(editing._id, formData);
            } else {
                await addStaff(formData);
            }
            setShowModal(false);
            setEditing(null);
            setAvatarFile(null);
            setForm({ name: '', email: '', phone: '', role: '', roleId: '', outletId: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '', availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY)) });
        } catch (error) {
            toast.error('Operation failed: ' + error.message);
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
                toast.error('Delete failed: ' + error.message);
            }
        }
    };

    const handleResendInvite = (id) => {
        toast.success(`Invitation resent successfully.`);
    };

    const openEdit = (u) => {
        setEditing(u);
        setForm({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            roleId: u.roleId || '',
            outletId: u.outletId || '',
            dob: u.dob || '',
            pan: u.hrProfile?.panNumber || u.pan || '',
            address: u.address || '',
            avatar: u.avatar || '',
            stylistBio: u.stylistBio || u.bio || '',
            stylistExperience: u.stylistExperience || u.experience || '',
            stylistSpecializations: Array.isArray(u.stylistSpecializations || u.specializations) ? (u.stylistSpecializations || u.specializations).join(', ') : (u.stylistSpecializations || u.specializations || ''),
            availability: u.availability || JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY))
        });
        setShowModal(true);
    };

    return (
        <div className="space-y-4 animate-reveal max-w-[1600px] mx-auto pb-8 text-left">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left leading-none">
                    <h1 className="text-2xl font-black text-text tracking-tight italic uppercase">Our Team</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Manage Staff & Permissions</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: '', roleId: '', outletId: '', password: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '', availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY)) });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-text text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all italic active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New Member
                </button>
            </div>

            {/* Pending Approvals Alert - Compact */}
            {pendingExpertsCount > 0 && (
                <div 
                    onClick={() => navigate('/admin/marketing/cms')}
                    className="bg-amber-500/10 border border-amber-500/20 p-2 shadow-sm flex items-center justify-between cursor-pointer group hover:bg-amber-500/15 transition-all text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-none mb-1 italic">Update Required</p>
                            <h4 className="text-[11px] font-black text-text tracking-tight uppercase">
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
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-[9px]"
                    />
                </div>
                <div className="flex gap-2">
                    <CustomSelect
                        value={roleFilter === 'all' ? 'All Roles' : roleFilter.toUpperCase()}
                        onChange={(val) => setRoleFilter(val === 'All Roles' ? 'all' : val.toLowerCase())}
                        options={['All Roles', ...roles.map(r => r.name.toUpperCase())]}
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
                                paginatedStaff.map((s, index) => (
                                    <tr
                                        key={s._id}
                                        className="hover:bg-primary/[0.02] transition-colors group"
                                    >
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center text-text font-black text-[10px] font-mono group-hover:border-primary transition-colors overflow-hidden">
                                                    {s.avatar ? (
                                                        <img 
                                                            src={(s.avatar.startsWith('http') || s.avatar.startsWith('data:')) ? s.avatar : `${API_BASE_URL}${s.avatar}`} 
                                                            alt={s.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
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
                        Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStaff.length)} of {filteredStaff.length} Members
                    </span>
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20"
                        >
                            Previous
                        </button>
                        <button 
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="text-[8px] font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-20"
                        >
                            Next
                        </button>
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
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Profile Photo</label>
                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest opacity-60">
                                            MAX: {platformSettings?.maxImageSize || 5}{platformSettings?.maxImageSizeUnit || 'MB'}
                                        </span>
                                    </div>
                                    <div className="flex justify-center py-2">
                                        <div className="relative group/photo">
                                            <div className="w-24 h-24 bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover/photo:border-primary">
                                                {form.avatar ? (
                                                    <img 
                                                        src={(form.avatar.startsWith('http') || form.avatar.startsWith('data:')) ? form.avatar : `${API_BASE_URL}${form.avatar}`} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover" 
                                                    />
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
                                        value={form.roleId} 
                                        onChange={(e) => {
                                            const rId = e.target.value;
                                            const selectedRole = roles.find(r => r._id === rId);
                                            const roleName = selectedRole ? selectedRole.name : '';
                                            
                                            const updates = { role: roleName, roleId: rId };
                                            const isStylistRole = ['stylist', 'stylish', 'stylsih'].includes(roleName.toLowerCase());
                                            if (isStylistRole && (!form.availability || !form.availability.days)) {
                                                updates.availability = JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY));
                                            }
                                            setForm({ ...form, ...updates });
                                        }}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono uppercase"
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(r => (
                                            <option key={r._id} value={r._id}>{r.name.toUpperCase()}</option>
                                        ))}
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

                                {['stylist', 'stylish', 'stylsih'].includes(form.role?.toLowerCase()) && (
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

                                        {/* Availability & Slots Section */}
                                        <div className="col-span-2 pt-6 border-t border-border mt-4">
                                            {/* Staff Breaks Section */}
                                            <div className="bg-surface p-4 border border-border mb-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono">Staff Breaks (Lunch/Tea)</p>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            const currentBreaks = form.availability?.breaks || [];
                                                            setForm({
                                                                ...form,
                                                                availability: {
                                                                    ...form.availability,
                                                                    breaks: [...currentBreaks, { start: '13:00', end: '14:00', label: 'Lunch Break' }]
                                                                }
                                                            });
                                                        }}
                                                        className="text-[8px] font-black text-primary border border-primary/20 px-2 py-1 hover:bg-primary/5 transition-all"
                                                    >
                                                        + ADD BREAK
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {(!form.availability?.breaks || form.availability.breaks.length === 0) ? (
                                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest italic opacity-40 py-2">No breaks scheduled</p>
                                                    ) : (
                                                        form.availability.breaks.map((brk, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-white border border-border p-2 group/break">
                                                                <input 
                                                                    type="text" 
                                                                    value={brk.label} 
                                                                    onChange={(e) => {
                                                                        const newBreaks = [...form.availability.breaks];
                                                                        newBreaks[idx].label = e.target.value;
                                                                        setForm({ ...form, availability: { ...form.availability, breaks: newBreaks } });
                                                                    }}
                                                                    placeholder="Label"
                                                                    className="flex-1 bg-transparent text-[9px] font-black outline-none border-b border-border/50 focus:border-primary uppercase font-mono" 
                                                                />
                                                                <div className="flex items-center gap-1">
                                                                    <input 
                                                                        type="time" 
                                                                        value={brk.start} 
                                                                        onChange={(e) => {
                                                                            const newBreaks = [...form.availability.breaks];
                                                                            newBreaks[idx].start = e.target.value;
                                                                            setForm({ ...form, availability: { ...form.availability, breaks: newBreaks } });
                                                                        }}
                                                                        className="bg-surface px-2 py-1 border border-border text-[9px] font-black outline-none font-mono" 
                                                                    />
                                                                    <span className="text-[8px] font-black text-text-muted">-</span>
                                                                    <input 
                                                                        type="time" 
                                                                        value={brk.end} 
                                                                        onChange={(e) => {
                                                                            const newBreaks = [...form.availability.breaks];
                                                                            newBreaks[idx].end = e.target.value;
                                                                            setForm({ ...form, availability: { ...form.availability, breaks: newBreaks } });
                                                                        }}
                                                                        className="bg-surface px-2 py-1 border border-border text-[9px] font-black outline-none font-mono" 
                                                                    />
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => {
                                                                        const newBreaks = form.availability.breaks.filter((_, i) => i !== idx);
                                                                        setForm({ ...form, availability: { ...form.availability, breaks: newBreaks } });
                                                                    }}
                                                                    className="p-1 text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover/break:opacity-100"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono">Work Schedule & Availability</p>
                                                <div className="flex bg-surface-alt p-1 rounded-none border border-border">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setForm({ ...form, availability: { ...form.availability, mode: 'same' } })}
                                                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter transition-all ${form.availability?.mode === 'same' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                                                    >
                                                        Same for all
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setForm({ ...form, availability: { ...form.availability, mode: 'different' } })}
                                                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter transition-all ${form.availability?.mode === 'different' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                                                    >
                                                        Different Days
                                                    </button>
                                                </div>
                                            </div>

                                            {form.availability?.mode === 'same' ? (
                                                <div className="bg-surface p-4 border border-border space-y-4">
                                                    <SlotInputGroup 
                                                        day="All Days" 
                                                        slots={form.availability?.days?.monday || []} 
                                                        onChange={(newSlots) => {
                                                            const newDays = { ...form.availability.days };
                                                            Object.keys(newDays).forEach(d => {
                                                                newDays[d] = newSlots;
                                                            });
                                                            setForm({ ...form, availability: { ...form.availability, days: newDays } });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {Object.keys(form.availability?.days || {}).map((day) => (
                                                        <div key={day} className="bg-surface p-3 border border-border">
                                                            <SlotInputGroup 
                                                                day={day.charAt(0).toUpperCase() + day.slice(1)} 
                                                                slots={form.availability.days[day]} 
                                                                onChange={(newSlots) => {
                                                                    setForm({ 
                                                                        ...form, 
                                                                        availability: { 
                                                                            ...form.availability, 
                                                                            days: { ...form.availability.days, [day]: newSlots } 
                                                                        } 
                                                                    });
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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

function SlotInputGroup({ day, slots, onChange }) {
    const addSlot = () => {
        onChange([...slots, { start: '09:00', end: '18:00' }]);
    };

    const removeSlot = (index) => {
        onChange(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index, field, value) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        onChange(newSlots);
    };

    return (
        <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-text font-mono italic">{day}</span>
                <button 
                    type="button" 
                    onClick={addSlot}
                    className="text-[9px] font-black text-primary hover:text-primary-foreground hover:bg-primary px-2 py-1 transition-all border border-primary/20"
                >
                    + ADD SLOT
                </button>
            </div>
            
            {slots.length === 0 ? (
                <div className="py-2 text-[9px] font-bold text-rose-500 uppercase tracking-widest italic opacity-60">Off Duty / Unavailable</div>
            ) : (
                <div className="space-y-2">
                    {slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-2 group/slot">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <div className="relative">
                                    <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                                    <input 
                                        type="time" 
                                        value={slot.start}
                                        onChange={(e) => updateSlot(idx, 'start', e.target.value)}
                                        className="w-full pl-7 pr-2 py-1.5 bg-white border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                    />
                                </div>
                                <div className="relative">
                                    <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
                                    <input 
                                        type="time" 
                                        value={slot.end}
                                        onChange={(e) => updateSlot(idx, 'end', e.target.value)}
                                        className="w-full pl-7 pr-2 py-1.5 bg-white border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                    />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeSlot(idx)}
                                className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/slot:opacity-100"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
