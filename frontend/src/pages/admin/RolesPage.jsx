import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Shield,
    Plus,
    Search,
    Edit,
    Eye,
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
    Store,
    UserCog,
    Tag,
    Zap,
    FileText,
    MessageSquare,
    List,
    Box,
    ShoppingBag,
    ArrowLeftRight,
    Wallet,
    CalendarCheck,
    Star,
    ShieldAlert,
    Percent,
    User,
    LifeBuoy,
    ShieldCheck,
    UserCheck,
    Download,
    Headset
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomDropdown from '../../components/common/CustomDropdown';

const PERMISSION_STRUCTURE = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Main business overview page',
    },
    {
        id: 'setup',
        label: 'Business Setup',
        icon: Briefcase,
        description: 'Manage outlets, staff, and roles',
        subPermissions: [
            { id: 'setup_outlets', label: 'Outlets Management', icon: Store, description: 'Add/edit outlets' },
            { id: 'manage_roles', label: 'Roles & Permissions', icon: Shield, description: 'Setup custom staff roles' },
            { id: 'setup_staff', label: 'Staff Management', icon: UserCog, description: 'Manage staff details & logins' },
            { id: 'services_list', label: 'Service List', icon: Scissors, description: 'Manage services & pricing' },
            { id: 'services_categories', label: 'Service Categories', icon: Tag, description: 'Categorize services' }
        ]
    },
    {
        id: 'pos',
        label: 'Operations (POS)',
        icon: CreditCard,
        description: 'POS Billing and Invoices',
        subPermissions: [
            { id: 'pos_dashboard', label: 'POS Dashboard', icon: LayoutDashboard, description: 'POS overview' },
            { id: 'pos_billing', label: 'New Bill', icon: Zap, description: 'Create bills and invoices' },
            { id: 'pos_invoices', label: 'Invoices & Payments', icon: FileText, description: 'View history' },
            { id: 'pos_reminders', label: 'Payment Reminders', icon: MessageSquare, description: 'Send dues alerts' }
        ]
    },
    {
        id: 'bookings',
        label: 'Bookings',
        icon: Scissors,
        description: 'Manage appointments',
        subPermissions: [
            { id: 'bookings_registry', label: 'Booking Registry', icon: List, description: 'View appointment list' },
            { id: 'bookings_new', label: 'Direct Booking', icon: Zap, description: 'Create new bookings' }
        ]
    },
    {
        id: 'inventory',
        label: 'Products & Stock',
        icon: Package,
        description: 'Product catalog & inventory controls',
        subPermissions: [
            { id: 'inventory_products', label: 'Products Management', icon: Box, description: 'Manage products and edit stock' },
            { id: 'inventory_shop_orders', label: 'Shop Orders', icon: ShoppingBag, description: 'Track online orders' },
            { id: 'inventory_categories', label: 'Product Categories', icon: Tag, description: 'Categorize shop products' },
            { id: 'inventory_stock_overview', label: 'Stock Alerts & Overview', icon: LayoutDashboard, description: 'Out of stock alerts' },
            { id: 'inventory_transfer', label: 'Stock Transfer', icon: ArrowLeftRight, description: 'Transfer stock between outlets' }
        ]
    },
    {
        id: 'suppliers',
        label: 'Suppliers',
        icon: Users,
        description: 'Supplier directory & bills',
        subPermissions: [
            { id: 'suppliers_directory', label: 'Supplier Directory', icon: Users, description: 'Manage supplier contacts' },
            { id: 'suppliers_invoices', label: 'Supplier Invoices', icon: FileText, description: 'Supplier billing & invoices' }
        ]
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: DollarSign,
        description: 'Cash book and financial reports',
        subPermissions: [
            { id: 'finance_dashboard', label: 'Finance Dashboard', icon: LayoutDashboard, description: 'Expense & income overview' },
            { id: 'finance_transactions', label: 'Transactions', icon: ArrowLeftRight, description: 'Detailed cash transactions' },
            { id: 'finance_cash_book', label: 'Cash & Bank Book', icon: Wallet, description: 'Ledgers' },
            { id: 'finance_expenses', label: 'Expenses', icon: DollarSign, description: 'Log operational expenses' },
            { id: 'finance_reports', label: 'Sales & Expense Reports', icon: FileText, description: 'Financial exports' }
        ]
    },
    {
        id: 'hr',
        label: 'HR & Payroll',
        icon: Briefcase,
        description: 'Attendance & staff payroll',
        subPermissions: [
            { id: 'hr_attendance', label: 'Staff Attendance', icon: CalendarCheck, description: 'Mark/view attendance' },
            { id: 'hr_payroll', label: 'Payroll Management', icon: DollarSign, description: 'Staff salaries & payouts' },
            { id: 'hr_advance_salary', label: 'Advance Salary', icon: DollarSign, description: 'Manage staff advance salary records' }
        ]
    },
    {
        id: 'crm',
        label: 'Customers (CRM)',
        icon: Users,
        description: 'Manage customers and notifications',
        subPermissions: [
            { id: 'crm_directory', label: 'Customer Directory', icon: Users, description: 'Contact list and details' },
            { id: 'crm_inquiries', label: 'Leads & Enquiries', icon: ClipboardList, description: 'Leads registry' },
            { id: 'crm_wallets', label: 'Customer Wallets', icon: Wallet, description: 'Prepaid balances' },
            { id: 'crm_feedback', label: 'Customer Feedback', icon: Star, description: 'Ratings and reviews' },
            { id: 'crm_reengage', label: 'Re-engagement alerts', icon: ShieldAlert, description: 'Dormant client outreach' },
            { id: 'crm_bridal', label: 'Bridal Reminders', icon: Bell, description: 'Bridal booking reminders' },
            { id: 'crm_birthday_anniversary', label: 'Birthday/Anniversary Wishes', icon: Bell, description: 'Automated greeting logs' }
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing',
        icon: Megaphone,
        description: 'Campaigns and CMS',
        subPermissions: [
            { id: 'marketing_hub', label: 'Marketing Hub', icon: LayoutDashboard, description: 'Campaign overview' },
            { id: 'marketing_promotions', label: 'Coupons & Promos', icon: Percent, description: 'Create and edit offers' },
            { id: 'marketing_whatsapp_credits', label: 'WhatsApp Credits', icon: MessageSquare, description: 'Buy/verify WhatsApp credits' }
        ]
    },
    {
        id: 'loyalty',
        label: 'Loyalty & Membership',
        icon: Crown,
        description: 'Rewards and plans',
        subPermissions: [
            { id: 'loyalty_plans', label: 'Membership Plans', icon: CreditCard, description: 'Define VIP/tier plans' },
            { id: 'loyalty_members', label: 'Loyalty Members', icon: Users, description: 'View enrolled members' },
            { id: 'loyalty_reminders', label: 'Membership Expiry Reminder', icon: Bell, description: 'Expiry followups' }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        description: 'Profile and company setup',
        subPermissions: [
            { id: 'settings_profile', label: 'Profile Settings', icon: User, description: 'Personal info' },
            { id: 'settings_business', label: 'Business Info', icon: Store, description: 'Company configurations' },
            { id: 'settings_security', label: 'Security & Password', icon: Shield, description: 'Change password' },
            { id: 'settings_terms', label: 'Terms & Conditions', icon: FileText, description: 'Invoice terms & conditions' },
            { id: 'settings_booking_link', label: 'Booking Link', icon: Zap, description: 'Self-booking URL & QR Code' }
        ]
    },
    {
        id: 'support',
        label: 'Support Tickets',
        icon: LifeBuoy,
        description: 'Support & documentation help desk'
    }
];

const AVAILABLE_PERMISSIONS = [];
PERMISSION_STRUCTURE.forEach(p => {
    AVAILABLE_PERMISSIONS.push({ id: p.id, label: p.label, icon: p.icon, description: p.description });
    if (p.subPermissions) {
        p.subPermissions.forEach(sp => {
            AVAILABLE_PERMISSIONS.push({ id: sp.id, label: sp.label, icon: sp.icon, description: sp.description });
        });
    }
});

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [editingRole, setEditingRole] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

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
        setViewMode(false);
        setShowModal(true);
    };

    const handleView = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setViewMode(true);
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
        if (form.name.trim().length > 20) {
            toast.error('Role Name cannot exceed 20 characters');
            return;
        }
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
        setViewMode(false);
    };

    // Disable body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            // Lock body and html
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
            
            // Scan and lock any active scroll containers in the DOM (excluding modal/portal elements)
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflow === 'auto' || style.overflow === 'scroll') {
                    if (!el.closest('form') && !el.closest('.fixed')) {
                        el.style.setProperty('overflow-y', 'hidden', 'important');
                        el.style.setProperty('overflow', 'hidden', 'important');
                        el.setAttribute('data-scroll-locked', 'true');
                    }
                }
            });
        } else {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
            
            const lockedElements = document.querySelectorAll('[data-scroll-locked="true"]');
            lockedElements.forEach(el => {
                el.style.removeProperty('overflow-y');
                el.style.removeProperty('overflow');
                el.removeAttribute('data-scroll-locked');
            });
        }
        
        return () => {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
            const lockedElements = document.querySelectorAll('[data-scroll-locked="true"]');
            lockedElements.forEach(el => {
                el.style.removeProperty('overflow-y');
                el.style.removeProperty('overflow');
                el.removeAttribute('data-scroll-locked');
            });
        };
    }, [showModal]);

    const handleToggleParent = (group) => {
        const groupSubIds = (group.subPermissions || []).map(sp => sp.id);
        const allIds = [group.id, ...groupSubIds];
        const isParentChecked = form.permissions.includes(group.id);

        setForm(prev => {
            let nextPermissions = [...prev.permissions];
            if (isParentChecked) {
                nextPermissions = nextPermissions.filter(p => !allIds.includes(p));
            } else {
                allIds.forEach(id => {
                    if (!nextPermissions.includes(id)) {
                        nextPermissions.push(id);
                    }
                });
            }
            return { ...prev, permissions: nextPermissions };
        });
    };

    const handleToggleSub = (subId, group) => {
        setForm(prev => {
            let nextPermissions = [...prev.permissions];
            const isChecked = nextPermissions.includes(subId);

            if (isChecked) {
                nextPermissions = nextPermissions.filter(p => p !== subId);
            } else {
                nextPermissions.push(subId);
                if (!nextPermissions.includes(group.id)) {
                    nextPermissions.push(group.id);
                }
            }
            return { ...prev, permissions: nextPermissions };
        });
    };

    const filteredRoles = roles.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || String(r._id) === String(roleFilter);
        return matchesSearch && matchesRole;
    });

    const handleExport = () => {
        if (!roles || roles.length === 0) {
            toast.error('No roles data available to export');
            return;
        }

        // CSV Headers
        const headers = ['Role Name', 'Description', 'Permissions Count', 'Permissions List', 'Role Type'];
        
        // CSV Rows
        const rows = roles.map(role => {
            const permissionsList = (role.permissions || [])
                .map(pId => {
                    const found = AVAILABLE_PERMISSIONS.find(ap => ap.id === pId);
                    return found ? found.label : pId;
                })
                .join('; ');

            return [
                role.name,
                role.description || '',
                role.permissions?.length || 0,
                permissionsList,
                role.isDefault ? 'System Default' : 'Custom'
            ];
        });

        // Combine into CSV Content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create Blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Wapixo_Roles_Permissions_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Roles report exported successfully!');
    };

    return (
        <div className="space-y-6 animate-reveal text-left font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="leading-none flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-[#B4912B]" />
                    <div>
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight leading-none text-left">Roles & Permissions</h1>
                        <p className="text-[10px] font-bold text-text-muted mt-1.5 uppercase tracking-wider opacity-60 leading-none text-left">Define what each staff member can access and manage</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#B4912B] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#9ca3af] transition-all !rounded-xl active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" /> Create New Role
                </button>
            </div>

            {/* Analytics Grid - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 !bg-[#FEF3C7]">
                        <Users className="w-5 h-5" color="#D97706" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Roles</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            {roles.length || 5}
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            Configured Roles
                        </span>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 !bg-[#F3E8FF]">
                        <Lock className="w-5 h-5" color="#9333EA" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Permissions</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            {AVAILABLE_PERMISSIONS.length}
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            System Permissions
                        </span>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 !bg-[#DCFCE7]">
                        <UserCheck className="w-5 h-5" color="#16A34A" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Staff Assigned</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            23
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            Across All Roles
                        </span>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 !bg-[#DBEAFE]">
                        <ShieldCheck className="w-5 h-5" color="#2563EB" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Last Updated</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            15 May 2024
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            By Admin
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters - Compact */}
            <div className="!bg-white dark:!bg-slate-900 p-1.5 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex flex-col md:flex-row gap-2 !rounded-xl items-center shadow-sm">
                <div className="flex items-center gap-3 flex-1 h-10 px-4">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search roles by name..."
                        className="w-full h-full text-[11px] font-bold uppercase tracking-wider outline-none text-neutral-800 dark:text-neutral-200 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-transparent !border-none !shadow-none placeholder-slate-400"
                    />
                </div>
                <div className="min-w-[150px] h-9 border-l border-border px-2">
                    <CustomDropdown
                        value={roleFilter}
                        onChange={(val) => setRoleFilter(val)}
                        options={[
                            { label: 'ALL ROLES', value: 'all' },
                            ...roles.map(role => ({
                                label: role.name.toUpperCase(),
                                value: role._id
                            }))
                        ]}
                        className="w-full h-full [&>.custom-dropdown-trigger]:h-full [&>.custom-dropdown-trigger]:!py-0 [&>.custom-dropdown-trigger]:!border-none [&>.custom-dropdown-trigger]:shadow-none [&>.custom-dropdown-trigger]:bg-transparent [&>.custom-dropdown-trigger]:dark:bg-transparent [&>.custom-dropdown-trigger]:!text-[10px]"
                    />
                </div>
                <div role="button" onClick={handleExport} className="h-9 px-5 flex items-center justify-center border-[1.5px] border-slate-200 dark:border-slate-700 !rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mr-1 text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] font-black uppercase tracking-wider">Export</span>
                </div>
            </div>

            {/* Roles Table/Grid */}
            <div className="bg-white border-[1.5px] border-border shadow-sm !rounded-[20px] overflow-hidden pt-5 px-6 pb-3">
                <div className="hidden md:grid grid-cols-12 gap-3 pb-3 border-b-[1.5px] border-slate-100 px-6">
                    <div className="col-span-3 text-[9px] font-black uppercase tracking-widest text-text">Role Name</div>
                    <div className="col-span-7 text-[9px] font-black uppercase tracking-widest text-text">Permissions Assigned</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-text text-right">Actions</div>
                </div>

                <div className="divide-y-[1.5px] divide-slate-100">
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
                        filteredRoles.map((role) => {
                            const n = role.name.toLowerCase();
                            let theme = { bg: 'bg-blue-100', text: 'text-blue-600', hex: '#2563EB', icon: Scissors, access: 'Basic Access' };
                            
                            if (n === 'admin') theme = { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', hex: '#D97706', icon: Crown, access: 'Full Access' };
                            else if (n.includes('manager')) theme = { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', hex: '#9333EA', icon: User, access: 'Limited Access' };
                            else if (n.includes('reception') || n.includes('reciption')) theme = { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', hex: '#16A34A', icon: Headset, access: 'Restricted' };
                            else {
                                const charCode = n.charCodeAt(0) || 0;
                                const customThemes = [
                                    { bg: 'bg-indigo-100', text: 'text-indigo-600', hex: '#4F46E5', icon: Shield, access: 'Custom Access' },
                                    { bg: 'bg-rose-100', text: 'text-rose-600', hex: '#E11D48', icon: UserCog, access: 'Custom Access' },
                                    { bg: 'bg-cyan-100', text: 'text-cyan-600', hex: '#0891B2', icon: Settings, access: 'Custom Access' },
                                    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600', hex: '#C026D3', icon: Star, access: 'Custom Access' },
                                    { bg: 'bg-emerald-100', text: 'text-emerald-600', hex: '#059669', icon: Briefcase, access: 'Custom Access' },
                                    { bg: 'bg-blue-100', text: 'text-blue-600', hex: '#2563EB', icon: Scissors, access: 'Basic Access' }
                                ];
                                theme = customThemes[charCode % customThemes.length];
                            }

                            return (
                                <div key={role._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 items-start group hover:bg-slate-50/80 transition-colors px-6 rounded-xl mt-1">
                                    {/* Left column */}
                                    <div className="col-span-12 md:col-span-3 flex items-start gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${theme.bg}`}>
                                            <theme.icon className={`w-4 h-4 ${theme.text}`} strokeWidth={2.5}/>
                                        </div>
                                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                                            <h3 className="text-xs font-black text-text uppercase tracking-wider leading-tight break-words break-all w-full">{role.name}</h3>
                                            <p className="text-[9px] font-bold text-text-muted mt-0.5 tracking-widest opacity-60 break-words w-full">
                                                {role.description || (n === 'admin' ? 'System Administrator' : 'Custom business role')}
                                            </p>
                                            <div className={`mt-2 px-2 py-0.5 border-[1.5px] rounded-full text-[8px] font-black uppercase tracking-widest ${theme.text}`} style={{ borderColor: theme.hex }}>
                                                {theme.access}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle column */}
                                    <div className="col-span-12 md:col-span-7 flex flex-col gap-3 mt-0.5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {/* Max 5 visible tags */}
                                            {(role.permissions || []).slice(0, 5).map(perm => {
                                                const p = AVAILABLE_PERMISSIONS.find(ap => ap.id === perm);
                                                return (
                                                    <span key={perm} className="px-2 py-1 rounded-[4px] text-[8.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60">
                                                        {p ? p.label : perm}
                                                    </span>
                                                );
                                            })}
                                            {(role.permissions?.length > 5) && (
                                                <span className="px-2 py-1 rounded-[4px] text-[8.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 shadow-sm border border-slate-200/60">
                                                    + {role.permissions.length - 5} more
                                                </span>
                                            )}
                                            {(!role.permissions || role.permissions.length === 0) && (
                                                <span className="text-[8.5px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-[4px] border border-rose-100">No Permissions Granted</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 mt-1">
                                            <div className="flex items-center justify-between text-[9px] font-black text-text uppercase tracking-widest">
                                                <span>{role.permissions?.length || 0} / {AVAILABLE_PERMISSIONS.length} perms</span>
                                                <span>{Math.round(((role.permissions?.length || 0) / AVAILABLE_PERMISSIONS.length) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-xl transition-all duration-500" 
                                                     style={{ width: `${Math.round(((role.permissions?.length || 0) / AVAILABLE_PERMISSIONS.length) * 100)}%`, backgroundColor: theme.hex }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column */}
                                    <div className="col-span-12 md:col-span-2 flex flex-col items-end gap-2.5 justify-start mt-0.5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleView(role)}
                                                className="w-7 h-7 rounded-[4px] border-[1.5px] border-slate-200 flex items-center justify-center text-text hover:bg-slate-50 transition-colors shadow-sm"
                                                title="View Role details"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(role)}
                                                className="w-7 h-7 rounded-[4px] border-[1.5px] border-slate-200 flex items-center justify-center text-text hover:bg-slate-50 transition-colors shadow-sm"
                                                title="Edit Role details"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => !role.isDefault && handleDelete(role._id)}
                                                disabled={role.isDefault}
                                                className={`w-7 h-7 rounded-[4px] border-[1.5px] flex items-center justify-center transition-colors shadow-sm
                                                    ${role.isDefault ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed' : 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100'}`}
                                                title={role.isDefault ? 'System default role (cannot delete)' : 'Delete Role'}
                                            >
                                                <Trash2 className="w-3 h-3" color={role.isDefault ? '#cbd5e1' : '#f43f5e'} />
                                            </button>
                                        </div>
                                        <div className="text-right mt-0.5">
                                            <p className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase">Updated 2 days ago</p>
                                            <p className="text-[8.5px] font-black text-slate-600 tracking-widest mt-0.5 uppercase">by Admin</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Info Footer */}
                <div className="mt-3 pt-3 border-t-[1.5px] border-slate-100">
                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg max-w-fit">
                        <Info className="w-3 h-3 text-blue-500" />
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest">Permissions are applied in real-time.</span>
                    </div>
                </div>
            </div>

            {/* Role Modal - Modern & Colorful Design */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden" onClick={() => setShowModal(false)}>

                    <form
                        onSubmit={handleSubmit}
                        className="relative bg-white dark:bg-[#0f172a] shadow-2xl w-full max-w-3xl flex flex-col animate-reveal !rounded-[24px] max-h-[90vh] overflow-hidden admin-panel"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Beautiful Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-20">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-[#D97706]" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-1.5">
                                        {viewMode ? 'View Role Details' : editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-none">
                                        {viewMode ? 'Review role details & permission structure' : 'Configure role details & permissions'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-left">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5 text-left">
                                    <div className="flex justify-between items-center pl-1">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role Name</label>
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{form.name.length}/20</span>
                                    </div>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="E.g., Senior Stylist"
                                        maxLength={20}
                                        disabled={viewMode}
                                        className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-200 dark:border-slate-700 text-sm font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2.5 text-left">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Role Description</label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="What does this role do?"
                                        disabled={viewMode}
                                        className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-200 dark:border-slate-700 text-sm font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Permissions Matrix */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Assign Permissions</h3>
                                        <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Select the modules this role can access</p>
                                    </div>
                                    <div className="px-3 py-1.5 bg-[#FEF3C7] dark:bg-[#D97706]/20 rounded-xl">
                                        <span className="text-[10px] font-black text-[#D97706] dark:text-[#FBBF24] uppercase tracking-wider">{form.permissions.length} Selected</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {PERMISSION_STRUCTURE.map((group, idx) => {
                                        const isGroupChecked = form.permissions.includes(group.id);
                                        const groupSubIds = (group.subPermissions || []).map(sp => sp.id);
                                        const checkedSubCount = (group.subPermissions || []).filter(sp => form.permissions.includes(sp.id)).length;
                                        
                                        // Generate an alternating background for groups
                                        const bgColors = [
                                            'bg-blue-50/50 dark:bg-blue-950/20 border-slate-100 dark:border-slate-800/60', 
                                            'bg-emerald-50/50 dark:bg-emerald-950/20 border-slate-100 dark:border-slate-800/60', 
                                            'bg-purple-50/50 dark:bg-purple-950/20 border-slate-100 dark:border-slate-800/60', 
                                            'bg-amber-50/50 dark:bg-amber-950/20 border-slate-100 dark:border-slate-800/60', 
                                            'bg-rose-50/50 dark:bg-rose-950/20 border-slate-100 dark:border-slate-800/60'
                                        ];
                                        const iconColors = ['text-blue-500 dark:text-blue-400', 'text-emerald-500 dark:text-emerald-400', 'text-purple-500 dark:text-purple-400', 'text-amber-500 dark:text-amber-400', 'text-rose-500 dark:text-rose-400'];
                                        const themeIdx = idx % bgColors.length;

                                        return (
                                            <div key={group.id} className={`border-[1.5px] ${bgColors[themeIdx]} p-5 rounded-[20px] transition-colors hover:border-slate-200 dark:hover:border-slate-700`}>
                                                {/* Parent Header */}
                                                <div
                                                    role="button"
                                                    onClick={() => !viewMode && handleToggleParent(group)}
                                                    className={`flex items-center justify-between select-none ${viewMode ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm`}>
                                                            <group.icon className={`w-5 h-5 ${iconColors[themeIdx]}`} strokeWidth={2.5} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-xs font-black uppercase tracking-wider mb-1 ${(isGroupChecked || checkedSubCount > 0) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                {group.label}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none opacity-80">{group.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
                                                        {group.subPermissions && (
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                                                                {checkedSubCount}/{groupSubIds.length}
                                                            </span>
                                                        )}
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isGroupChecked ? 'bg-[#B4912B] border-[#B4912B]' : 'border-slate-400 dark:border-slate-400'}`}>
                                                            {isGroupChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sub Permissions */}
                                                {group.subPermissions && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                                        {group.subPermissions.map((sub) => {
                                                            const isSubChecked = form.permissions.includes(sub.id);
                                                            return (
                                                                <div
                                                                    key={sub.id}
                                                                    role="button"
                                                                    onClick={() => !viewMode && handleToggleSub(sub.id, group)}
                                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${viewMode ? 'cursor-default' : 'cursor-pointer'} ${isSubChecked
                                                                        ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 ring-1 ring-[#B4912B]'
                                                                        : 'bg-white/40 dark:bg-slate-800/20 border border-transparent hover:bg-white/80 dark:hover:bg-slate-800/60'
                                                                        }`}
                                                                >
                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSubChecked ? 'bg-[#B4912B] border-[#B4912B]' : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-400'}`}>
                                                                        {isSubChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pr-2 text-left">
                                                                        <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${isSubChecked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{sub.label}</p>
                                                                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight truncate">{sub.description}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col sm:flex-row items-center justify-between gap-6 z-20">
                            <div className="flex items-center gap-3 w-full sm:w-1/3">
                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-[#B4912B] transition-all duration-500 rounded-xl"
                                        style={{ width: `${(form.permissions.length / AVAILABLE_PERMISSIONS.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">{Math.round((form.permissions.length / AVAILABLE_PERMISSIONS.length) * 100)}% Selected</span>
                            </div>
                             <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                                >
                                    {viewMode ? 'Close' : 'Cancel'}
                                </button>
                                {!viewMode && (
                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none px-10 py-3.5 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#B4912B]/30 hover:bg-black hover:shadow-black/20 rounded-xl transition-all active:scale-[0.98]"
                                    >
                                        {editingRole ? 'Save Changes' : 'Create Role'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>,
                document.body
            )}
        </div>
    );
}
