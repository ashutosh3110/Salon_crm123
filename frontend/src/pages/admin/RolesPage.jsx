import React from 'react';
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
    Calendar,
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
import { useBusiness } from '../../contexts/BusinessContext';

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
            { id: 'finance_expenses', label: 'Expenses', icon: DollarSign, description: 'Log operational expenses' }
        ]
    },
    {
        id: 'finance_reports',
        label: 'Reports',
        icon: ClipboardList,
        description: 'Access business and overall reports (sales, bookings, staff, CRM, expenses)',
        subPermissions: [
            { id: 'reports_sales', label: 'Sales & Billing Report', icon: DollarSign, description: 'View sales and billing analytics' },
            { id: 'reports_bookings', label: 'Bookings & Services Report', icon: Calendar, description: 'View booking metrics' },
            { id: 'reports_staff', label: 'Staff Performance Report', icon: UserCog, description: 'View staff performance data' },
            { id: 'reports_customer', label: 'Customer & CRM Report', icon: Users, description: 'View customer insights' },
            { id: 'reports_expenses', label: 'Expenses & Finance Report', icon: CreditCard, description: 'View expense analysis' }
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

const ROLE_SIDEBAR_ITEMS = {
    stylist: [
        { id: 'stylist_overview', label: 'Overview' },
        { id: 'stylist_attendance', label: 'Attendance' },
        { id: 'stylist_clients', label: 'My clients' },
        { id: 'stylist_commissions', label: 'Earnings' },
        { id: 'stylist_timeoff', label: 'Time off' },
        { id: 'stylist_settings', label: 'Settings' },
        { id: 'stylist_support', label: 'Support' }
    ],
    receptionist: [
        { id: 'receptionist_dashboard', label: 'Dashboard' },
        { id: 'receptionist_attendance', label: 'Attendance' },
        { id: 'receptionist_appointments', label: 'Appointments & Orders' },
        { id: 'receptionist_leads', label: 'Lead & Enquiry' },
        { id: 'receptionist_billing', label: 'Quick Bill' },
        { id: 'receptionist_invoices', label: 'Invoice & Payments' },
        { id: 'receptionist_petty_cash', label: 'Wallet / Petty Cash' },
        { id: 'receptionist_profile', label: 'Profile' },
        { id: 'receptionist_support', label: 'Support' }
    ],
    manager: [
        { id: 'manager_dashboard', label: 'Dashboard' },
        { id: 'manager_performance', label: 'Performance' },
        { id: 'manager_attendance', label: 'Attendance' },
        { id: 'manager_targets', label: 'Targets' },
        { id: 'manager_feedback', label: 'Feedback' },
        { id: 'manager_approvals', label: 'Service Approvals' },
        { id: 'manager_settings', label: 'Settings' },
        { id: 'manager_support', label: 'Support' }
    ],
    accountant: [
        { id: 'accountant_dashboard', label: 'Dashboard' },
        { id: 'accountant_revenue', label: 'Revenue Stream' },
        { id: 'accountant_expenses', label: 'Expense Matrix' },
        { id: 'accountant_invoices', label: 'Supplier Invoices' },
        { id: 'accountant_payroll', label: 'Payroll Protocol' },
        { id: 'accountant_petty_cash', label: 'Petty Cash' },
        { id: 'accountant_tax', label: 'Taxation / GST' },
        { id: 'accountant_reconciliation', label: 'Reconciliation' },
        { id: 'accountant_settings', label: 'System Prefs' }
    ],
    inventory: [
        { id: 'inventory_dashboard', label: 'Operational Dashboard' },
        { id: 'inventory_stock', label: 'Asset Ledger' },
        { id: 'inventory_purchase', label: 'Procurement Matrix' },
        { id: 'inventory_transfer', label: 'Deployment Logs' },
        { id: 'inventory_alerts', label: 'Depletion Alerts' },
        { id: 'inventory_reports', label: 'Analysis Vectors' },
        { id: 'inventory_settings', label: 'System Prefs' }
    ],
    custom: []
};

const ROLE_DEFAULT_PERMISSIONS = {
    manager: [
        'dashboard', 'setup_outlets', 'setup_staff', 'services_list', 'services_categories', 
        'reports_sales', 'reports_bookings', 'reports_staff', 'reports_customer', 'reports_expenses', 
        'hr_attendance', 'hr_payroll', 'crm_directory', 'crm_inquiries', 'crm_wallets', 
        'crm_feedback', 'crm_reengage', 'crm_bridal', 'crm_birthday_anniversary', 'support'
    ],
    receptionist: [
        'pos_dashboard', 'pos_billing', 'pos_invoices', 'pos_reminders', 
        'bookings_registry', 'bookings_new', 'crm_directory', 'crm_inquiries'
    ],
    accountant: [
        'finance_dashboard', 'finance_transactions', 'finance_cash_book', 'finance_expenses', 
        'reports_sales', 'reports_expenses'
    ],
    inventory: [
        'inventory_products', 'inventory_shop_orders', 'inventory_categories', 
        'inventory_stock_overview', 'inventory_transfer', 'suppliers_directory', 'suppliers_invoices'
    ],
    stylist: ['support'],
    custom: []
};

export default function RolesPage() {
    const { staff, fetchStaff } = useBusiness();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('sidebar'); // 'sidebar' | 'admin'

    const [editingRole, setEditingRole] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [form, setForm] = useState({
        name: '',
        description: '',
        roleType: 'custom',
        hiddenSidebarItems: [],
        adminMenuAccess: [],
        permissions: []
    });

    useEffect(() => {
        fetchRoles();
        fetchStaff();
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

    const handleRoleTypeChange = (selectedType) => {
        const defaults = ROLE_DEFAULT_PERMISSIONS[selectedType] || [];
        setForm(prev => ({
            ...prev,
            roleType: selectedType,
            permissions: defaults,
            adminMenuAccess: defaults,
            hiddenSidebarItems: []
        }));
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            roleType: role.roleType || 'custom',
            hiddenSidebarItems: role.hiddenSidebarItems || [],
            adminMenuAccess: role.adminMenuAccess || [],
            permissions: role.permissions || []
        });
        setActiveTab('sidebar');
        setViewMode(false);
        setShowModal(true);
    };

    const handleView = (role) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || '',
            roleType: role.roleType || 'custom',
            hiddenSidebarItems: role.hiddenSidebarItems || [],
            adminMenuAccess: role.adminMenuAccess || [],
            permissions: role.permissions || []
        });
        setActiveTab('sidebar');
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
        setForm({
            name: '',
            description: '',
            roleType: 'custom',
            hiddenSidebarItems: [],
            adminMenuAccess: [],
            permissions: []
        });
        setEditingRole(null);
        setViewMode(false);
        setActiveTab('sidebar');
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
                    className="flex items-center gap-2 bg-primary !bg-[#B4912B] hover:!bg-[#A57C1E] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md transition-all !rounded-xl active:scale-95 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" /> Create New Role
                </button>
            </div>

            {/* Analytics Grid - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#FEF3C7] dark:bg-[#D97706]/15">
                        <Users className="w-5 h-5 text-[#D97706] dark:text-[#fbbf24]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Roles</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            {roles.length || 0}
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            Configured Roles
                        </span>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#F3E8FF] dark:bg-[#9333EA]/15">
                        <Lock className="w-5 h-5 text-[#9333EA] dark:text-[#c084fc]" strokeWidth={2.5} />
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
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#DCFCE7] dark:bg-[#16A34A]/15">
                        <UserCheck className="w-5 h-5 text-[#16A34A] dark:text-[#4ade80]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Staff Assigned</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            {staff.length || 0}
                        </h3>
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                            Across All Roles
                        </span>
                    </div>
                </div>

                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px] shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[#DBEAFE] dark:bg-[#2563EB]/15">
                        <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-[#60a5fa]" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Last Updated</span>
                        <h3 className="text-xl font-black tracking-tight uppercase leading-none mt-1 text-text">
                            {(() => {
                                const latestRoleUpdate = roles.reduce((latest, role) => {
                                    if (!role.updatedAt) return latest;
                                    const roleDate = new Date(role.updatedAt);
                                    return roleDate > latest ? roleDate : latest;
                                }, new Date(0));
                                return latestRoleUpdate.getTime() > 0 
                                    ? latestRoleUpdate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '15 May 2024';
                            })()}
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
                <div className="hidden md:grid grid-cols-12 gap-3 pb-3 border-b-[1.5px] border-slate-100 dark:border-slate-800 px-6">
                    <div className="col-span-10 text-[9px] font-black uppercase tracking-widest text-text">Role Name</div>
                    <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-text text-right">Actions</div>
                </div>

                <div className="divide-y-[1.5px] divide-slate-100 dark:divide-slate-800">
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
                            let theme = { 
                                bg: 'bg-blue-100 dark:bg-[#2563EB]/15', 
                                text: 'text-blue-600 dark:text-[#60a5fa]', 
                                border: 'border-blue-600 dark:border-[#60a5fa]', 
                                bgBar: 'bg-blue-600 dark:bg-[#60a5fa]', 
                                icon: Scissors, 
                                access: 'Basic Access' 
                            };
                            
                            if (n === 'admin') {
                                theme = { 
                                    bg: 'bg-[#FEF3C7] dark:bg-[#D97706]/15', 
                                    text: 'text-[#D97706] dark:text-[#fbbf24]', 
                                    border: 'border-[#D97706] dark:border-[#fbbf24]', 
                                    bgBar: 'bg-[#D97706] dark:bg-[#fbbf24]', 
                                    icon: Crown, 
                                    access: 'Full Access' 
                                };
                            } else if (n.includes('manager')) {
                                theme = { 
                                    bg: 'bg-[#F3E8FF] dark:bg-[#9333EA]/15', 
                                    text: 'text-[#9333EA] dark:text-[#c084fc]', 
                                    border: 'border-[#9333EA] dark:border-[#c084fc]', 
                                    bgBar: 'bg-[#9333EA] dark:bg-[#c084fc]', 
                                    icon: User, 
                                    access: 'Limited Access' 
                                };
                            } else if (n.includes('reception') || n.includes('reciption')) {
                                theme = { 
                                    bg: 'bg-[#DCFCE7] dark:bg-[#16A34A]/15', 
                                    text: 'text-[#16A34A] dark:text-[#4ade80]', 
                                    border: 'border-[#16A34A] dark:border-[#4ade80]', 
                                    bgBar: 'bg-[#16A34A] dark:bg-[#4ade80]', 
                                    icon: Headset, 
                                    access: 'Restricted' 
                                };
                            } else {
                                const charCode = n.charCodeAt(0) || 0;
                                const customThemes = [
                                    { bg: 'bg-indigo-100 dark:bg-[#4F46E5]/15', text: 'text-indigo-600 dark:text-[#818cf8]', border: 'border-indigo-600 dark:border-[#818cf8]', bgBar: 'bg-indigo-600 dark:bg-[#818cf8]', icon: Shield, access: 'Custom Access' },
                                    { bg: 'bg-rose-100 dark:bg-[#E11D48]/15', text: 'text-rose-600 dark:text-[#fb7185]', border: 'border-rose-600 dark:border-[#fb7185]', bgBar: 'bg-rose-600 dark:bg-[#fb7185]', icon: UserCog, access: 'Custom Access' },
                                    { bg: 'bg-cyan-100 dark:bg-[#0891B2]/15', text: 'text-cyan-600 dark:text-[#22d3ee]', border: 'border-cyan-600 dark:border-[#22d3ee]', bgBar: 'bg-cyan-600 dark:bg-[#22d3ee]', icon: Settings, access: 'Custom Access' },
                                    { bg: 'bg-fuchsia-100 dark:bg-[#C026D3]/15', text: 'text-fuchsia-600 dark:text-[#e879f9]', border: 'border-fuchsia-600 dark:border-[#e879f9]', bgBar: 'bg-fuchsia-600 dark:bg-[#e879f9]', icon: Star, access: 'Custom Access' },
                                    { bg: 'bg-emerald-100 dark:bg-[#059669]/15', text: 'text-emerald-600 dark:text-[#34d399]', border: 'border-emerald-600 dark:border-[#34d399]', bgBar: 'bg-emerald-600 dark:bg-[#34d399]', icon: Briefcase, access: 'Custom Access' },
                                    { bg: 'bg-blue-100 dark:bg-[#2563EB]/15', text: 'text-blue-600 dark:text-[#60a5fa]', border: 'border-blue-600 dark:border-[#60a5fa]', bgBar: 'bg-blue-600 dark:bg-[#60a5fa]', icon: Scissors, access: 'Basic Access' }
                                ];
                                theme = customThemes[charCode % customThemes.length];
                            }

                            return (
                                <div key={role._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 items-start group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors px-6 rounded-xl mt-1">
                                    {/* Left column */}
                                    <div className="col-span-12 md:col-span-10 flex items-start gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${theme.bg}`}>
                                            <theme.icon className={`w-4 h-4 ${theme.text}`} strokeWidth={2.5}/>
                                        </div>
                                        <div className="flex flex-col items-start min-w-0 flex-1 text-left">
                                            <h3 className="text-xs font-black text-text uppercase tracking-wider leading-tight break-words break-all w-full">{role.name}</h3>
                                            <p className="text-[9px] font-bold text-text-muted mt-0.5 tracking-widest opacity-60 break-words w-full">
                                                {role.description || (n === 'admin' ? 'System Administrator' : 'Custom business role')}
                                            </p>
                                            <div className={`mt-2 px-2 py-0.5 border-[1.5px] rounded-full text-[8px] font-black uppercase tracking-widest ${theme.text} ${theme.border}`}>
                                                {theme.access}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle column removed */}

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
                {/* Info Footer Removed */}
            </div>

            {/* Role Modal - Modern & Colorful Design */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/60 backdrop-blur-sm transition-all overflow-hidden" onClick={() => setShowModal(false)}>

                    <form
                        onSubmit={handleSubmit}
                        className="relative bg-white dark:bg-[#0f172a] shadow-2xl w-full max-w-xl flex flex-col animate-reveal !rounded-[24px] max-h-[90vh] overflow-hidden admin-panel"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Beautiful Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] sticky top-0 z-20">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-full bg-[#FEF3C7] dark:bg-[#D97706]/15 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-[#D97706] dark:text-[#fbbf24]" strokeWidth={2.5} />
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
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-left">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 gap-6">
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
                                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2.5 text-left">
                                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Role Description</label>
                                    <input
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="What does this role do?"
                                        disabled={viewMode}
                                        className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-[1.5px] border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:border-[#B4912B] focus:ring-4 focus:ring-[#B4912B]/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-slate-900 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Role Type Dropdown */}
                            <div className="space-y-2.5 text-left">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Role Type</label>
                                <CustomDropdown
                                    value={form.roleType}
                                    onChange={(val) => !viewMode && handleRoleTypeChange(val)}
                                    options={[
                                        { label: 'STYLIST', value: 'stylist' },
                                        { label: 'RECEPTIONIST', value: 'receptionist' },
                                        { label: 'MANAGER', value: 'manager' },
                                        { label: 'ACCOUNTANT', value: 'accountant' },
                                        { label: 'INVENTORY', value: 'inventory' },
                                        { label: 'CREATE NEW ROLE (CUSTOM)', value: 'custom' }
                                    ]}
                                    disabled={viewMode}
                                    className="w-full"
                                />
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 pl-1 leading-relaxed">
                                    Determines the default workspace layout, default sidebar items, and default permissions.
                                </p>
                            </div>

                            {/* Permissions & Sidebar Configuration Tabs */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {/* Tab Headers */}
                                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('sidebar')}
                                        className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                            activeTab === 'sidebar'
                                                ? 'bg-white dark:bg-[#0f172a] text-[#B4912B] shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        1. Role Sidebar Items
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('admin')}
                                        className={`flex-1 py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                            activeTab === 'admin'
                                                ? 'bg-white dark:bg-[#0f172a] text-[#B4912B] shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        2. Admin Dashboard Pages
                                    </button>
                                </div>

                                {/* Tab 1 Content: Role Sidebar Items */}
                                {activeTab === 'sidebar' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pl-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#B4912B]">Sidebar Item Visibility</h4>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                {ROLE_SIDEBAR_ITEMS[form.roleType]?.length || 0} Default Items
                                            </span>
                                        </div>

                                        {form.roleType === 'custom' ? (
                                            <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                                <Info className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-relaxed">
                                                    Custom Role Type Selected
                                                </p>
                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed max-w-sm mx-auto">
                                                    Custom roles don't have default sidebar items. You can grant them access to Admin menu pages in the next tab.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {(ROLE_SIDEBAR_ITEMS[form.roleType] || []).map(item => {
                                                    const isVisible = !form.hiddenSidebarItems.includes(item.id);
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`p-3.5 border-[1.5px] rounded-xl flex items-center justify-between transition-all bg-slate-50/30 dark:bg-slate-800/10 ${
                                                                isVisible
                                                                    ? 'border-[#B4912B]/20 bg-[#B4912B]/[0.02]'
                                                                    : 'border-slate-200 dark:border-slate-800'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">{item.label}</span>
                                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                                    {isVisible ? 'Visible in sidebar' : 'Hidden from sidebar'}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                disabled={viewMode}
                                                                onClick={() => {
                                                                    const isCurrentlyHidden = form.hiddenSidebarItems.includes(item.id);
                                                                    setForm(prev => {
                                                                        const nextHidden = isCurrentlyHidden
                                                                            ? prev.hiddenSidebarItems.filter(id => id !== item.id)
                                                                            : [...prev.hiddenSidebarItems, item.id];
                                                                        return { ...prev, hiddenSidebarItems: nextHidden };
                                                                    });
                                                                }}
                                                                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none cursor-pointer ${
                                                                    isVisible ? 'bg-[#B4912B]' : 'bg-slate-200 dark:bg-slate-800'
                                                                } ${viewMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div
                                                                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform transform ${
                                                                        isVisible ? 'translate-x-4' : 'translate-x-0'
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 2 Content: Admin Dashboard Pages */}
                                {activeTab === 'admin' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pl-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#B4912B]">Admin Dashboard Access</h4>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                {form.adminMenuAccess.length} Permissions Active
                                            </span>
                                        </div>

                                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                            {PERMISSION_STRUCTURE.map(group => {
                                                const hasSub = group.subPermissions && group.subPermissions.length > 0;
                                                const isParentChecked = form.adminMenuAccess.includes(group.id);
                                                
                                                return (
                                                    <div key={group.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-800/5">
                                                        {/* Parent Row */}
                                                        <div className="p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/40">
                                                            <div className="flex items-center gap-3 text-left">
                                                                <div className="w-8 h-8 rounded-full bg-[#B4912B]/10 flex items-center justify-center text-[#B4912B]">
                                                                    <group.icon className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{group.label}</span>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{group.description}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                disabled={viewMode}
                                                                onClick={() => {
                                                                    const subIds = (group.subPermissions || []).map(sp => sp.id);
                                                                    const allGroupIds = [group.id, ...subIds];
                                                                    
                                                                    setForm(prev => {
                                                                        let nextAccess = [...prev.adminMenuAccess];
                                                                        if (isParentChecked) {
                                                                            nextAccess = nextAccess.filter(id => !allGroupIds.includes(id));
                                                                        } else {
                                                                            allGroupIds.forEach(id => {
                                                                                if (!nextAccess.includes(id)) nextAccess.push(id);
                                                                            });
                                                                        }
                                                                        return { 
                                                                            ...prev, 
                                                                            adminMenuAccess: nextAccess,
                                                                            permissions: nextAccess
                                                                        };
                                                                    });
                                                                }}
                                                                className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none cursor-pointer ${
                                                                    isParentChecked ? 'bg-[#B4912B]' : 'bg-slate-200 dark:bg-slate-800'
                                                                } ${viewMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div
                                                                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform transform ${
                                                                        isParentChecked ? 'translate-x-4' : 'translate-x-0'
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>

                                                        {/* Sub Permissions Grid */}
                                                        {hasSub && (
                                                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#0f172a]/20">
                                                                {group.subPermissions.map(sub => {
                                                                    const isSubChecked = form.adminMenuAccess.includes(sub.id);
                                                                    return (
                                                                        <div 
                                                                            key={sub.id} 
                                                                            onClick={() => {
                                                                                if (viewMode) return;
                                                                                setForm(prev => {
                                                                                    let nextAccess = [...prev.adminMenuAccess];
                                                                                    if (isSubChecked) {
                                                                                        nextAccess = nextAccess.filter(id => id !== sub.id);
                                                                                    } else {
                                                                                        nextAccess.push(sub.id);
                                                                                        if (!nextAccess.includes(group.id)) nextAccess.push(group.id);
                                                                                    }
                                                                                    return { 
                                                                                        ...prev, 
                                                                                        adminMenuAccess: nextAccess,
                                                                                        permissions: nextAccess
                                                                                    };
                                                                                });
                                                                            }}
                                                                            className={`p-3 border-[1.5px] rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                                                                                isSubChecked 
                                                                                    ? 'border-[#B4912B]/20 bg-[#B4912B]/[0.01]' 
                                                                                    : 'border-slate-100 hover:border-slate-200 dark:border-slate-800/40 dark:hover:border-slate-800'
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                                                                                <sub.icon className={`w-3.5 h-3.5 shrink-0 ${isSubChecked ? 'text-[#B4912B]' : 'text-slate-400'}`} />
                                                                                <div className="min-w-0">
                                                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate">{sub.label}</p>
                                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{sub.description}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                                                                                isSubChecked 
                                                                                    ? 'bg-[#B4912B] border-[#B4912B] text-white' 
                                                                                    : 'border-slate-300 dark:border-slate-700'
                                                                            }`}>
                                                                                {isSubChecked && <span className="text-[8px] font-black">✓</span>}
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
                                )}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col sm:flex-row items-center justify-end gap-6 z-20">
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
                                        className="flex-1 sm:flex-none px-10 py-3.5 bg-primary !bg-[#B4912B] hover:!bg-[#A57C1E] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#B4912B]/30 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
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
