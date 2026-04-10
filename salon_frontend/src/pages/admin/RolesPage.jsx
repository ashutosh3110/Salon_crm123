import { useState, useEffect } from 'react';
import { 
    Shield, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    Info,
    LayoutDashboard,
    Scissors,
    Package,
    Users,
    CreditCard,
    Megaphone,
    Briefcase,
    ChevronRight,
    Lock
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard', label: 'Dashboard Access', icon: LayoutDashboard, description: 'Access to main dashboard and stats' },
    { id: 'pos', label: 'Point of Sale (POS)', icon: CreditCard, description: 'Create bills and process payments' },
    { id: 'appointments', label: 'Appointments', icon: Scissors, description: 'Manage bookings and calendar' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage products and stock' },
    { id: 'crm', label: 'Customer Management', icon: Users, description: 'View and manage customer data' },
    { id: 'marketing', label: 'Marketing Hub', icon: Megaphone, description: 'Manage coupons and campaigns' },
    { id: 'payroll', label: 'HR & Payroll', icon: Briefcase, description: 'Manage staff and attendance' },
    { id: 'finance', label: 'Finance Reports', icon: CreditCard, description: 'View revenue and expense reports' },
];

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [search, setSearch] = useState('');
    
    const [form, setForm] = useState({
        name: '',
        description: '',
        permissions: []
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const r = await api.get('/roles');
            setRoles(r.data?.data || []);
        } catch (err) {
            toast.error('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await api.delete(`/roles/${id}`);
            toast.success('Role deleted successfully');
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete role');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole._id}`, form);
                toast.success('Role updated successfully');
            } else {
                await api.post('/roles', form);
                toast.success('Role created successfully');
            }
            setShowModal(false);
            fetchRoles();
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save role');
        }
    };

    const resetForm = () => {
        setForm({ name: '', description: '', permissions: [] });
        setEditingRole(null);
    };

    const togglePermission = (permId) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId]
        }));
    };

    const filteredRoles = roles.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight italic">Roles & Permissions</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 italic">Define what each staff member can access</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-text text-background px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all italic font-mono active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Create New Role
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SEARCH ROLES BY NAME..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-border text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/20"
                />
            </div>

            {/* Roles Table/Grid */}
            <div className="bg-white border border-border overflow-hidden shadow-sm">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-slate-50">
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-text-muted">Role Name</div>
                    <div className="col-span-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Permissions Assigned</div>
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</div>
                </div>

                <div className="divide-y divide-border">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <Shield className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Accessing Roles Database...</p>
                        </div>
                    ) : filteredRoles.length === 0 ? (
                        <div className="py-20 text-center bg-surface-alt/10">
                            <Lock className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">No custom roles defined yet</p>
                        </div>
                    ) : (
                        filteredRoles.map((role) => (
                            <div key={role._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition-colors items-center group">
                                <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${role.isDefault ? 'bg-amber-50 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-text uppercase italic tracking-tight">{role.name}</h3>
                                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-tighter opacity-60 truncate max-w-[150px]">{role.description || 'Custom business role'}</p>
                                    </div>
                                </div>
                                
                                <div className="col-span-12 md:col-span-6 flex flex-wrap gap-1.5">
                                    {(role.permissions || []).map(perm => {
                                        const p = AVAILABLE_PERMISSIONS.find(ap => ap.id === perm);
                                        return (
                                            <span key={perm} className="px-2 py-1 bg-surface border border-border rounded text-[8px] font-bold uppercase tracking-wider text-text-muted">
                                                {p ? p.label : perm}
                                            </span>
                                        );
                                    })}
                                    {(!role.permissions || role.permissions.length === 0) && (
                                        <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest italic">No Permissions Granted</span>
                                    )}
                                </div>

                                <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleEdit(role)}
                                        className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-white border border-transparent hover:border-border"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {!role.isDefault && (
                                        <button 
                                            onClick={() => handleDelete(role._id)}
                                            className="p-2 text-text-muted hover:text-rose-500 transition-colors hover:bg-white border border-transparent hover:border-border"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    {role.isDefault && (
                                        <div className="p-2 group/info relative cursor-help">
                                            <Info className="w-4 h-4 text-amber-400 opacity-40" />
                                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-text text-white text-[8px] rounded opacity-0 invisible group-hover/info:visible group-hover/info:opacity-100 transition-all z-20 font-bold uppercase tracking-widest leading-relaxed">
                                                System default roles cannot be deleted to ensure basic access.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[999] overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center p-4 text-center sm:p-0 pt-10 md:pt-24">
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-slate-900/60 transition-opacity backdrop-blur-sm" 
                            onClick={() => setShowModal(false)} 
                        />

                        {/* Modal Panel */}
                        <div className="relative transform overflow-hidden bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-border flex flex-col animate-reveal sm:mb-20">
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] italic text-text">{editingRole ? 'Synching Permission Set' : 'Initialize Access Level'}</h2>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted opacity-60">Staff Security & Authorization Protocol</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Role Identifier</label>
                                            <input
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({...form, name: e.target.value.toUpperCase()})}
                                                placeholder="E.G. STYLIST_PRO"
                                                className="w-full px-4 py-3 bg-slate-50 border border-border text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-primary outline-none transition-all placeholder:opacity-30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Internal Memo</label>
                                            <input
                                                value={form.description}
                                                onChange={(e) => setForm({...form, description: e.target.value})}
                                                placeholder="Brief description..."
                                                className="w-full px-4 py-3 bg-slate-50 border border-border text-[11px] font-black uppercase tracking-widest focus:bg-white focus:border-primary outline-none transition-all placeholder:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] inline-flex items-center gap-2 italic">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                Resource Matrix
                                            </h3>
                                            <span className="text-[9px] font-black text-white bg-text px-3 py-1 rounded-sm uppercase tracking-widest shadow-sm">
                                                {form.permissions.length} Protocols Active
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {AVAILABLE_PERMISSIONS.map((perm) => (
                                                <button
                                                    key={perm.id}
                                                    type="button"
                                                    onClick={() => togglePermission(perm.id)}
                                                    className={`flex items-start gap-4 p-4 border transition-all text-left group relative ${form.permissions.includes(perm.id) 
                                                        ? 'bg-primary/5 border-primary/40 shadow-inner' 
                                                        : 'bg-white border-border hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className={`p-2.5 rounded-lg transition-all ${form.permissions.includes(perm.id) ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : 'bg-slate-100 text-text-muted'}`}>
                                                        <perm.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-6">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 ${form.permissions.includes(perm.id) ? 'text-primary' : 'text-text'}`}>{perm.label}</p>
                                                        <p className="text-[8px] font-bold text-text-muted/60 uppercase tracking-tighter line-clamp-1 group-hover:opacity-100">{perm.description}</p>
                                                    </div>
                                                    {form.permissions.includes(perm.id) && (
                                                        <div className="absolute top-4 right-4 text-primary animate-in zoom-in-50 duration-200">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-8 py-6 border-t border-border bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">System deployment ready</p>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 sm:flex-none px-8 py-3.5 border border-border text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all font-mono"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 sm:flex-none px-10 py-3.5 bg-text text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-95 italic font-mono"
                                        >
                                            {editingRole ? 'Sync Protocols' : 'Authorize Deployment'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
