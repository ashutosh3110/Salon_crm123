import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    ArrowRight,
    Eye,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { maskPhone } from '../../utils/phoneUtils';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCMS } from '../../contexts/CMSContext';
import CustomSelect from '../../components/admin/common/CustomSelect';
import { useNavigate } from 'react-router-dom';
import PasswordField from '../../components/common/PasswordField';
import api, { API_BASE_URL } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

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
    const [viewingStaff, setViewingStaff] = useState(null);
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
        salary: '',
        bankName: '',
        accountNo: '',
        ifsc: '',
        avatar: '',
        stylistBio: '',
        stylistExperience: '',
        stylistSpecializations: '',
        availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY))
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!form.name?.trim()) newErrors.name = 'Name is required';
        if (!form.email?.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';

        if (!form.phone) newErrors.phone = 'Phone is required';
        else if (form.phone.length !== 10) newErrors.phone = 'Phone must be 10 digits';

        if (!form.roleId) newErrors.roleId = 'Role is required';
        if (!form.outletId) newErrors.outletId = 'Salon assignment is required';

        // Image requirement for new members
        if (!editing && !avatarFile) {
            newErrors.avatar = 'Profile photo is required';
        }

        if (form.pan) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(form.pan)) newErrors.pan = 'Invalid PAN format (ABCDE1234F)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
            result = result.filter(s => (s.outletId?._id || s.outletId) === outletFilter);
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
        if (!validateForm()) return;
        setLoading(true);
        try {
            const formData = new FormData();

            // Append all form fields to FormData
            Object.keys(form).forEach(key => {
                if (key === 'avatar') return;
                if (['pan', 'salary', 'bankName', 'accountNo', 'ifsc'].includes(key)) return;
                if (key === 'availability') {
                    formData.append(key, JSON.stringify(form[key]));
                } else if (key === 'stylistSpecializations') {
                    const specs = form.stylistSpecializations ? form.stylistSpecializations.split(',').map(s => s.trim()).filter(Boolean) : [];
                    formData.append(key, JSON.stringify(specs));
                } else {
                    formData.append(key, form[key] || '');
                }
            });

            // Handle hrProfile
            let baseHrProfile = {};
            if (editing?.hrProfile) {
                baseHrProfile = typeof editing.hrProfile === 'string'
                    ? JSON.parse(editing.hrProfile)
                    : editing.hrProfile;
            }
            const hrProfile = {
                ...baseHrProfile,
                baseSalary: Number(form.salary) || 0,
                panNumber: form.pan || '',
                bankDetails: {
                    bankName: form.bankName || '',
                    accountNumber: form.accountNo || '',
                    ifscCode: form.ifsc || ''
                }
            };
            formData.append('hrProfile', JSON.stringify(hrProfile));

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
            setForm({ name: '', email: '', phone: '', role: '', roleId: '', outletId: '', salary: '', bankName: '', accountNo: '', ifsc: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '', availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY)) });
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

    const handleResendInvite = async (id) => {
        try {
            await api.post(`/users/${id}/resend-invite`);
            toast.success('Invitation resent successfully.');
        } catch (err) {
            toast.error('Failed to resend invite.');
        }
    };

    const openEdit = (u) => {
        let hr = u.hrProfile || {};
        if (typeof hr === 'string') {
            try {
                hr = JSON.parse(hr);
            } catch (e) {
                hr = {};
            }
        }
        setEditing(u);
        setForm({
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            role: u.role,
            roleId: u.roleId || '',
            outletId: u.outletId?._id || u.outletId || '',
            dob: u.dob || '',
            pan: hr.panNumber || u.pan || '',
            address: u.address || '',
            salary: hr.baseSalary != null ? String(hr.baseSalary) : '',
            bankName: hr.bankDetails?.bankName || '',
            accountNo: hr.bankDetails?.accountNumber || '',
            ifsc: hr.bankDetails?.ifscCode || '',
            avatar: u.avatar || '',
            stylistBio: u.stylistBio || u.bio || '',
            stylistExperience: u.stylistExperience || u.experience || '',
            stylistSpecializations: Array.isArray(u.stylistSpecializations || u.specializations) ? (u.stylistSpecializations || u.specializations).join(', ') : (u.stylistSpecializations || u.specializations || ''),
            availability: u.availability || JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY))
        });
        setShowModal(true);
    };

    const getAvatarColor = (name) => {
        const colors = [
            'bg-amber-50 text-amber-600',
            'bg-purple-50 text-purple-600',
            'bg-orange-50 text-orange-600',
            'bg-emerald-50 text-emerald-600',
            'bg-blue-50 text-blue-600'
        ];
        const initial = name ? name.charCodeAt(0) : 0;
        return colors[initial % colors.length];
    };

    return (
        <div className="space-y-4 animate-reveal max-w-[1600px] mx-auto pb-8 text-left p-4 md:p-6 bg-[#f8fafc] min-h-screen">
            <div className="bg-white !rounded-[24px] shadow-sm border border-slate-200 p-6 md:p-8 !overflow-hidden">
                {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-2 mt-2 mb-8">
                <div className="text-left leading-none">
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase">OUR TEAM</h1>
                    <p className="text-[12px] font-bold text-slate-500 mt-2.5 uppercase tracking-widest">MANAGE STAFF & PERMISSIONS</p>
                    <div className="w-12 h-[3px] bg-[#C69A20] mt-3"></div>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setForm({ name: '', email: '', phone: '', role: '', roleId: '', outletId: '', password: '', salary: '', bankName: '', accountNo: '', ifsc: '', avatar: '', stylistBio: '', stylistExperience: '', stylistSpecializations: '', availability: JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY)) });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#cca839] text-white px-6 py-3.5 text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-[#b59533] transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> ADD NEW MEMBER
                </button>
            </div>

            {/* Pending Approvals Alert - Compact */}
            {pendingExpertsCount > 0 && (
                <div
                    onClick={() => navigate('/admin/marketing/cms')}
                    className="bg-amber-500/10 border border-amber-500/20 p-2 shadow-sm flex items-center justify-between cursor-pointer group hover:bg-amber-500/15 transition-all text-left mb-6 rounded-lg mx-2"
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

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 mt-6">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="SEARCH BY NAME OR EMAIL..."
                        className="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-full text-[11px] font-black uppercase tracking-widest focus:border-slate-300 outline-none transition-all placeholder:text-slate-300 text-text shadow-sm"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <select
                            value={roleFilter === 'all' ? 'All Roles' : roleFilter.toUpperCase()}
                            onChange={(e) => setRoleFilter(e.target.value === 'All Roles' ? 'all' : e.target.value.toLowerCase())}
                            className="pl-5 pr-10 py-3.5 bg-white border border-slate-200 rounded-full text-[11px] font-black tracking-widest outline-none focus:border-slate-300 transition-all appearance-none min-w-[160px] text-slate-700 shadow-sm"
                        >
                            <option value="All Roles">All Roles</option>
                            {roles.map(r => <option key={r._id} value={r.name.toUpperCase()}>{r.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={outletFilter === 'all' ? 'All Salons' : outlets.find(o => o._id === outletFilter)?.name}
                            onChange={(e) => setOutletFilter(e.target.value === 'All Salons' ? 'all' : outlets.find(o => o.name === e.target.value)?._id)}
                            className="pl-5 pr-10 py-3.5 bg-white border border-slate-200 rounded-full text-[11px] font-black tracking-widest outline-none focus:border-slate-300 transition-all appearance-none min-w-[160px] text-slate-700 shadow-sm"
                        >
                            <option value="All Salons">All Salons</option>
                            {outlets.map(o => <option key={o._id} value={o.name}>{o.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white !rounded-[24px] !border-[1.5px] border-slate-200 !overflow-hidden min-h-[400px] shadow-sm">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">STAFF MEMBER</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CONTACT NUMBER</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROLE</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PRIMARY SALON</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">STATUS</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
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
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[14px] uppercase border border-slate-100 ${getAvatarColor(s.name)}`}>
                                                    {s.avatar ? (
                                                        <img
                                                            src={getImageUrl(s.avatar)}
                                                            alt={s.name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        s.name?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-700 text-[12px] uppercase">{s.name}</div>
                                                    <div className="text-[11px] text-slate-500 font-bold lowercase mt-0.5">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[12px] font-black text-slate-700 tracking-tight">
                                                {maskPhone(s.phone, user?.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                                                <span className="w-1.5 h-1.5 rounded-full border border-slate-400 bg-transparent"></span> {s.role?.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[11px] font-black text-slate-700 uppercase truncate max-w-[150px]">
                                                {s.outletId?.name || outlets.find(o => o._id === (s.outletId?._id || s.outletId))?.name || 'MAIN UNIT'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {s.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setViewingStaff(s)}
                                                    className="p-2 border border-slate-200 rounded-[12px] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all bg-white shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEdit(s)}
                                                    className="p-2 border border-slate-200 rounded-[12px] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all bg-white shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(s._id, s.status || 'active')}
                                                    className="p-2 border border-slate-200 rounded-[12px] text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all bg-white shadow-sm"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s._id)}
                                                    className="p-2 border border-slate-200 rounded-[12px] text-slate-500 hover:text-rose-500 hover:border-slate-300 transition-all bg-white shadow-sm"
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

                {/* Footer */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        SHOWING {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStaff.length)} OF {filteredStaff.length} MEMBERS
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2.5 border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-300 transition-all disabled:opacity-30 bg-white"
                        >
                            PREVIOUS
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-5 py-2.5 border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-slate-300 transition-all disabled:opacity-30 bg-white"
                        >
                            NEXT
                        </button>
                    </div>
                </div>
                </div>
            </div>

            {/* Shift Modal - High Density Refinement */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all" onClick={() => setShowModal(false)}>
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-800 w-full max-w-md shadow-2xl relative border border-border flex flex-col my-auto rounded-none z-10 max-h-[85vh] overflow-y-auto admin-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center gap-4 p-6 pb-4 border-b border-border shrink-0">
                            <UserCog className="w-6 h-6 text-text shrink-0" />
                            <div className="text-left">
                                <h2 className="text-lg font-black text-text uppercase italic font-mono leading-none">
                                    {editing ? 'Update Profile' : 'Add New Member'}
                                </h2>
                                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">New Staff Registration</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="ml-auto p-1 hover:bg-surface transition-colors">
                                <XCircle className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
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
                                                        src={getImageUrl(form.avatar)}
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
                                                onChange={(e) => {
                                                    handleImageChange(e);
                                                    if (errors.avatar) setErrors(prev => ({ ...prev, avatar: null }));
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-text text-background p-1.5 shadow-lg group-hover/photo:scale-110 transition-transform">
                                                <Edit className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                    {errors.avatar && <p className="text-[8px] font-bold text-rose-500 text-center mt-1 uppercase">{errors.avatar}</p>}
                                </div>

                                <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Member Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={form.name}
                                        onChange={(e) => {
                                            setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') });
                                            if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.name ? 'border-rose-500' : 'border-border'} text-[11px] font-black outline-none focus:border-text uppercase font-mono`}
                                        placeholder="ENTER NAME"
                                    />
                                    {errors.name && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm({ ...form, email: e.target.value });
                                            if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.email ? 'border-rose-500' : 'border-border'} text-[11px] font-black outline-none focus:border-text font-mono`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.email && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setForm({ ...form, phone: val });
                                            if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.phone ? 'border-rose-500' : 'border-border'} text-[11px] font-black outline-none focus:border-text font-mono`}
                                        placeholder="10-DIGIT NUM"
                                    />
                                    {errors.phone && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.phone}</p>}
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
                                            const isStylistRole = ['stylist'].includes(roleName.toLowerCase());
                                            if (isStylistRole && (!form.availability || !form.availability.days)) {
                                                updates.availability = JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY));
                                            }
                                            setForm({ ...form, ...updates });
                                            if (errors.roleId) setErrors(prev => ({ ...prev, roleId: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.roleId ? 'border-rose-500' : 'border-border'} text-[10px] font-black outline-none focus:border-text font-mono uppercase`}
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(r => (
                                            <option key={r._id} value={r._id}>{r.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    {errors.roleId && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.roleId}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Assign to Salon</label>
                                    <select
                                        value={form.outletId}
                                        onChange={(e) => {
                                            setForm({ ...form, outletId: e.target.value });
                                            if (errors.outletId) setErrors(prev => ({ ...prev, outletId: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.outletId ? 'border-rose-500' : 'border-border'} text-[10px] font-black outline-none focus:border-text font-mono uppercase`}
                                    >
                                        <option value="">Select Salon</option>
                                        {outlets.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                                    </select>
                                    {errors.outletId && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.outletId}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">DOB</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
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
                                        onChange={(e) => {
                                            setForm({ ...form, pan: e.target.value.toUpperCase() });
                                            if (errors.pan) setErrors(prev => ({ ...prev, pan: null }));
                                        }}
                                        className={`w-full px-3 py-2 bg-surface-alt border ${errors.pan ? 'border-rose-500' : 'border-border'} text-[10px] font-black outline-none focus:border-text font-mono`}
                                        placeholder="ABCDE1234F"
                                    />
                                    {errors.pan && <p className="text-[8px] font-bold text-rose-500 mt-1 uppercase">{errors.pan}</p>}
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

                                <div className="col-span-2 pt-2 border-t border-border mt-2">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] font-mono">Payout & Bank Details</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Base Salary (₹)</label>
                                    <input
                                        type="number"
                                        value={form.salary || ''}
                                        onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="ENTER BASE SALARY"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Bank Institution</label>
                                    <input
                                        type="text"
                                        value={form.bankName || ''}
                                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="BANK NAME"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">Account Number</label>
                                    <input
                                        type="text"
                                        value={form.accountNo || ''}
                                        onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="ACCOUNT NUMBER"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest font-mono">IFSC Code</label>
                                    <input
                                        type="text"
                                        value={form.ifsc || ''}
                                        onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 bg-surface-alt border border-border text-[10px] font-black outline-none focus:border-text font-mono"
                                        placeholder="IFSC CODE"
                                    />
                                </div>

                                {['stylist'].includes(form.role?.toLowerCase()) && (
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
                                                    <div
                                                        role="button"
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
                                                        className="text-[8px] font-black text-primary border border-primary/20 px-2 py-1 hover:bg-primary/5 transition-all cursor-pointer"
                                                    >
                                                        + ADD BREAK
                                                    </div>
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
                                                                <div
                                                                    role="button"
                                                                    onClick={() => {
                                                                        const newBreaks = form.availability.breaks.filter((_, i) => i !== idx);
                                                                        setForm({ ...form, availability: { ...form.availability, breaks: newBreaks } });
                                                                    }}
                                                                    className="p-1 text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover/break:opacity-100 cursor-pointer"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono">Work Schedule & Availability</p>
                                                <div className="flex bg-surface-alt p-1 rounded-none border border-border">
                                                    <div
                                                        role="button"
                                                        onClick={() => setForm({ ...form, availability: { ...form.availability, mode: 'same' } })}
                                                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter transition-all cursor-pointer ${form.availability?.mode === 'same' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                                                    >
                                                        Same for all
                                                    </div>
                                                    <div
                                                        role="button"
                                                        onClick={() => setForm({ ...form, availability: { ...form.availability, mode: 'different' } })}
                                                        className={`px-3 py-1 text-[8px] font-black uppercase tracking-tighter transition-all cursor-pointer ${form.availability?.mode === 'different' ? 'bg-text text-white' : 'text-text-muted hover:text-text'}`}
                                                    >
                                                        Different Days
                                                    </div>
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

                        <div className="flex gap-3 p-6 border-t border-slate-200 bg-surface-alt/10 shrink-0">
                            <div
                                role="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-colors font-mono cursor-pointer text-center bg-white border border-slate-200 flex items-center justify-center"
                            >
                                Cancel
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-text text-white py-3 shadow-lg flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 disabled:opacity-30"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                                ) : (
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">{editing ? 'Save Changes' : 'Add Member'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {viewingStaff && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all" onClick={() => setViewingStaff(null)}>
                    <div 
                        className="bg-white dark:bg-slate-800 w-full max-w-2xl shadow-2xl relative border border-border flex flex-col my-auto rounded-none z-10 max-h-[90vh] overflow-y-auto admin-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center gap-4 p-6 border-b border-border shrink-0 bg-surface">
                            <div className="w-12 h-12 bg-surface-alt border border-border flex items-center justify-center text-text font-black text-xs font-mono overflow-hidden">
                                {viewingStaff.avatar ? (
                                    <img
                                        src={getImageUrl(viewingStaff.avatar)}
                                        alt={viewingStaff.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    viewingStaff.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                )}
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-black text-text uppercase italic font-mono leading-none">
                                    {viewingStaff.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter border ${roleColors[viewingStaff.role] || 'bg-slate-50 text-slate-500'}`}>
                                        <Shield className="w-2.5 h-2.5" /> {viewingStaff.role?.replace('_', ' ')}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter border ${statusColors[viewingStaff.status || 'active'] || statusColors.active}`}>
                                        {viewingStaff.status === 'active' || !viewingStaff.status ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                                        {viewingStaff.status || 'active'}
                                    </span>
                                </div>
                            </div>
                            <button type="button" onClick={() => setViewingStaff(null)} className="ml-auto p-1.5 hover:bg-surface-alt transition-colors">
                                <XCircle className="w-6 h-6 text-text-muted" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-left font-mono">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Contact & Personal Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono mb-2 border-b border-border pb-1">Contact & Info</h3>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Email Address</p>
                                                    <p className="text-xs font-black text-text font-mono break-all">{viewingStaff.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Contact Number</p>
                                                    <p className="text-xs font-black text-text font-mono">{viewingStaff.phone || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Date of Birth</p>
                                                    <p className="text-xs font-black text-text font-mono">{viewingStaff.dob || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Assigned Salon</p>
                                                    <p className="text-xs font-black text-text uppercase italic font-mono">
                                                        {viewingStaff.outletId?.name || outlets.find(o => o._id === (viewingStaff.outletId?._id || viewingStaff.outletId))?.name || 'Main Unit'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {viewingStaff.address && (
                                        <div>
                                            <h4 className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono mb-1">Residential Address</h4>
                                            <div className="bg-surface p-3 border border-border">
                                                <p className="text-xs font-bold text-text-secondary uppercase font-mono">{viewingStaff.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Payout & Professional Profile */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono mb-2 border-b border-border pb-1">Payout & Bank</h3>
                                        <div className="space-y-3 bg-surface p-4 border border-border">
                                            <div className="flex justify-between items-center border-b border-border/60 pb-2">
                                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Base Salary</span>
                                                <span className="text-sm font-black text-text font-mono">₹{viewingStaff.hrProfile?.baseSalary || viewingStaff.salary || '—'}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-border/60 pb-2">
                                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">PAN Number</span>
                                                <span className="text-xs font-black text-text font-mono uppercase">{viewingStaff.hrProfile?.panNumber || viewingStaff.pan || '—'}</span>
                                            </div>
                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono block">Bank Account Details</span>
                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                                    <div>
                                                        <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest font-mono">Institution</p>
                                                        <p className="font-black text-text font-mono uppercase">{viewingStaff.hrProfile?.bankDetails?.bankName || viewingStaff.bankName || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest font-mono">IFSC Code</p>
                                                        <p className="font-black text-text font-mono uppercase">{viewingStaff.hrProfile?.bankDetails?.ifscCode || viewingStaff.ifsc || '—'}</p>
                                                    </div>
                                                    <div className="col-span-2 mt-1">
                                                        <p className="text-[7px] font-bold text-text-muted uppercase tracking-widest font-mono">Account Number</p>
                                                        <p className="font-black text-text font-mono">{viewingStaff.hrProfile?.bankDetails?.accountNumber || viewingStaff.accountNo || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Public Stylist Profile Section if applicable */}
                            {['stylist'].includes(viewingStaff.role?.toLowerCase()) && (
                                <div className="border-t border-border pt-4">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono mb-3">Stylist Public Profile</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface p-4 border border-border">
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Experience</p>
                                                <p className="text-xs font-black text-text font-mono">{viewingStaff.stylistExperience || viewingStaff.experience || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono mb-1">Specializations</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(viewingStaff.stylistSpecializations || viewingStaff.specializations) ? (
                                                        (viewingStaff.stylistSpecializations || viewingStaff.specializations).map((spec, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white border border-border text-[8px] font-black text-primary uppercase tracking-wider font-mono">
                                                                {spec}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        (viewingStaff.stylistSpecializations || viewingStaff.specializations) ? (
                                                            (viewingStaff.stylistSpecializations || viewingStaff.specializations).split(',').map((spec, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-white border border-border text-[8px] font-black text-primary uppercase tracking-wider font-mono">
                                                                    {spec.trim()}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs font-bold text-text-muted italic">—</span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider font-mono">Professional Bio</p>
                                            <p className="text-xs font-bold text-text-secondary font-mono italic leading-relaxed">
                                                "{viewingStaff.stylistBio || viewingStaff.bio || 'No professional bio added yet.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Work Schedule / Weekly Availability Section */}
                            {viewingStaff.availability?.days && (
                                <div className="border-t border-border pt-4">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] font-mono mb-3">Work Schedule</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                        {Object.keys(viewingStaff.availability.days).map((day) => {
                                            const daySlots = viewingStaff.availability.days[day] || [];
                                            return (
                                                <div key={day} className="bg-surface p-2 border border-border flex flex-col items-center text-center">
                                                    <span className="text-[8px] font-black text-text uppercase tracking-wider font-mono border-b border-border/80 pb-1 w-full mb-1">{day.slice(0, 3)}</span>
                                                    {daySlots.length === 0 ? (
                                                        <span className="text-[8px] font-bold text-rose-500 uppercase font-mono italic py-1">OFF</span>
                                                    ) : (
                                                        daySlots.map((slot, idx) => (
                                                            <span key={idx} className="text-[8px] font-black text-text-muted font-mono leading-none py-0.5">
                                                                {slot.start} - {slot.end}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex p-6 border-t border-slate-200 bg-surface shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewingStaff(null)}
                                className="w-full bg-text text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-95"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
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
