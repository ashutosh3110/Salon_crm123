import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    Lock,
    Bell,
    DollarSign,
    ClipboardList,
    Crown,
    Settings,
    Store
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AVAILABLE_PERMISSIONS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Main business overview' },
    { id: 'pos', label: 'Billing (POS)', icon: CreditCard, description: 'Sales and payments' },
    { id: 'bookings', label: 'Bookings', icon: Scissors, description: 'Calendar and appointments' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, description: 'Hub and CMS' },
    { id: 'enquiries', label: 'Enquiries', icon: ClipboardList, description: 'Customer leads' },
    { id: 'reminders', label: 'Reminders', icon: Bell, description: 'Follow-ups and links' },
    { id: 'crm', label: 'CRM / Customers', icon: Users, description: 'Customer directory' },
    { id: 'loyalty', label: 'Loyalty', icon: Crown, description: 'Points and memberships' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Stock management' },
    { id: 'finance', label: 'Finance', icon: DollarSign, description: 'Expenses and cash' },
    { id: 'hr', label: 'HR / Payroll', icon: Briefcase, description: 'Staff and attendance' },
    { id: 'setup', label: 'Business Setup', icon: Store, description: 'Outlets and services' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Profile and security' },
];

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [showModal]);
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

    // Disable body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showModal]);

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
                                            <span key={perm} className="px-2 py-1 bg-surface border border-border rounded text-[8px] font-bold uppercase tracking-wider text-text-muted text-left">
                                                {p ? p.label : perm}
                                            </span>
                                        );
                                    })}
                                    {(!role.permissions || role.permissions.length === 0) && (
                                        <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest italic">No Permissions Granted</span>
                                    )}
                                </div>

                                <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-2 text-right">
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

            {/* Role Modal - Simple High-Density Design */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all overflow-hidden" onClick={() => setShowModal(false)}>
                    
                    <div 
                        className="relative bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full max-w-2xl flex flex-col animate-reveal rounded-none border-2 border-text max-h-[90vh] overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        {/* Simple Header */}
                        <div className="flex items-center justify-between px-8 py-5 border-b-2 border-border bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 bg-text text-white flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-lg font-black uppercase tracking-tight italic text-text leading-none mb-1 font-mono">
                                        {editingRole ? 'Edit Role' : 'Add New Role'}
                                    </h2>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60 italic leading-none font-mono">Role Details & Permissions</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 text-text-muted hover:text-rose-500 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar text-left font-mono">
                                
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest font-mono">Role Name</label>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            placeholder="Enter role name"
                                            className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black tracking-widest focus:border-text outline-none transition-all placeholder:text-text-muted/40 rounded-none italic shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest font-mono">Role Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({...form, description: e.target.value})}
                                            placeholder="What is this role for?"
                                            rows={2}
                                            className="w-full px-4 py-3 bg-surface-alt border border-border text-sm font-black tracking-widest focus:border-text outline-none transition-all placeholder:text-text-muted/40 rounded-none italic shadow-inner resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-4 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[11px] font-black text-text uppercase tracking-widest italic font-mono">Assign Permissions</h3>
                                        <span className="text-[9px] font-black text-primary uppercase italic"> {form.permissions.length} Selected</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {AVAILABLE_PERMISSIONS.map((perm) => (
                                            <button
                                                key={perm.id}
                                                type="button"
                                                onClick={() => togglePermission(perm.id)}
                                                className={`flex items-center gap-3 p-3 transition-all text-left border ${form.permissions.includes(perm.id) 
                                                    ? 'bg-white border-2 border-primary shadow-md' 
                                                    : 'bg-surface-alt border-border hover:bg-white hover:border-text-muted'
                                                }`}
                                            >
                                                <div className={`p-2 transition-all ${form.permissions.includes(perm.id) ? 'bg-primary text-white' : 'bg-white text-text-muted border border-border'}`}>
                                                    <perm.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${form.permissions.includes(perm.id) ? 'text-primary' : 'text-text'}`}>{perm.label}</p>
                                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider leading-none opacity-40 italic">{perm.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-8 py-6 border-t-2 border-text bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-surface-alt border border-border">
                                        <div 
                                            className="h-full bg-primary transition-all duration-500" 
                                            style={{ width: `${(form.permissions.length / AVAILABLE_PERMISSIONS.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-black text-text-muted uppercase italic tracking-widest">Progress</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 sm:flex-none px-8 py-3 bg-surface-alt text-text-muted text-[10px] font-black uppercase tracking-widest border border-border hover:bg-slate-100 transition-all italic font-mono"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none px-12 py-3 bg-text text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all active:scale-[0.98] italic font-mono"
                                    >
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
