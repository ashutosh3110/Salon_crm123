import {
    LayoutDashboard,
    UserCheck,
    Users,
    DollarSign,
    Clock,
    Settings,
    LifeBuoy,
    Calendar,
    CalendarCheck,
    ClipboardList,
    MessageSquare,
    Zap,
    FileText,
    Wallet,
    User,
    BarChart3,
    Target,
    Star,
    CheckCircle2,
    TrendingUp,
    Calculator,
    Package,
    ShoppingCart,
    ArrowLeftRight,
    AlertTriangle,
    BarChart2,
    Crown,
    Briefcase,
    Store,
    Shield,
    Scissors,
    Tag,
    CreditCard,
    Box,
    ShoppingBag,
    Bell,
    ShieldAlert,
    Megaphone,
    Percent,
    Layout,
    ArrowDownUp
} from 'lucide-react';

export const ROLE_SIDEBAR_DEFAULTS = {
    stylist: [
        { id: 'stylist_overview', label: 'Overview', icon: LayoutDashboard, path: '/stylist' },
        { id: 'stylist_appointments', label: 'Appointments', icon: Calendar, path: '/stylist/appointments' },
        { id: 'stylist_attendance', label: 'Attendance', icon: UserCheck, path: '/stylist/attendance', badge: { count: 'LIVE', color: 'bg-emerald-500 text-white animate-pulse' } },
        { id: 'stylist_clients', label: 'My clients', icon: Users, path: '/stylist/clients' },
        { id: 'stylist_commissions', label: 'Earnings', icon: DollarSign, path: '/stylist/commissions' },
        { id: 'stylist_timeoff', label: 'Time off', icon: Clock, path: '/stylist/timeoff' },
        {
            id: 'stylist_settings',
            label: 'Settings',
            icon: Settings,
            path: '/stylist/settings',
            subItems: [
                { id: 'stylist_settings_profile', label: 'My profile', path: '/stylist/settings/profile' },
                { id: 'stylist_settings_availability', label: 'Availability', path: '/stylist/settings/availability' },
                { id: 'stylist_settings_security', label: 'Security', path: '/stylist/settings/security' }
            ]
        },
        { id: 'stylist_support', label: 'Support', icon: LifeBuoy, path: '/stylist/support' }
    ],
    receptionist: [
        { id: 'receptionist_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/receptionist' },
        { id: 'receptionist_attendance', label: 'Attendance', icon: Calendar, path: '/receptionist/attendance' },
        { id: 'receptionist_appointments', label: 'Appointments & Orders', icon: ClipboardList, path: '/receptionist/appointments' },
        { id: 'receptionist_leads', label: 'Lead & Enquiry', icon: MessageSquare, path: '/receptionist/leads' },
        { id: 'receptionist_billing', label: 'Quick Bill', icon: Zap, path: '/receptionist/pos/billing', accent: true },
        { id: 'receptionist_invoices', label: 'Invoice & Payments', icon: FileText, path: '/receptionist/invoices' },
        { id: 'receptionist_support', label: 'Support', icon: LifeBuoy, path: '/receptionist/support' },
        { id: 'receptionist_petty_cash', label: 'Wallet / Petty Cash', icon: Wallet, path: '/receptionist/petty-cash' },
        { id: 'receptionist_profile', label: 'Profile', icon: User, path: '/receptionist/profile' }
    ],
    manager: [
        { id: 'manager_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/manager' },
        { id: 'manager_performance', label: 'Performance', icon: BarChart3, path: '/manager/performance' },
        { id: 'manager_attendance', label: 'Attendance', icon: CalendarCheck, path: '/manager/attendance' },
        { id: 'manager_targets', label: 'Targets', icon: Target, path: '/manager/targets' },
        { id: 'manager_feedback', label: 'Feedback', icon: Star, path: '/manager/feedback' },
        { id: 'manager_approvals', label: 'Service Approvals', icon: CheckCircle2, path: '/manager/approvals' },
        { id: 'manager_settings', label: 'Settings', icon: Settings, path: '/manager/settings' },
        { id: 'manager_support', label: 'Support', icon: LifeBuoy, path: '/manager/support' }
    ],
    accountant: [
        { id: 'accountant_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/accountant' },
        { id: 'accountant_revenue', label: 'Revenue Stream', icon: TrendingUp, path: '/accountant/revenue' },
        { id: 'accountant_expenses', label: 'Expense Matrix', icon: DollarSign, path: '/accountant/expenses' },
        { id: 'accountant_invoices', label: 'Supplier Invoices', icon: FileText, path: '/accountant/invoices' },
        { id: 'accountant_payroll', label: 'Payroll Protocol', icon: Users, path: '/accountant/payroll' },
        { id: 'accountant_petty_cash', label: 'Petty Cash', icon: Wallet, path: '/accountant/petty-cash' },
        { id: 'accountant_tax', label: 'Taxation / GST', icon: Calculator, path: '/accountant/tax' },
        { id: 'accountant_reconciliation', label: 'Reconciliation', icon: ClipboardList, path: '/accountant/reconciliation' },
        { id: 'accountant_settings', label: 'System Prefs', icon: Settings, path: '/accountant/settings' }
    ],
    inventory: [
        { id: 'inventory_dashboard', label: 'Operational Dashboard', icon: LayoutDashboard, path: '/inventory' },
        { id: 'inventory_stock', label: 'Asset Ledger', icon: Package, path: '/inventory/stock' },
        { id: 'inventory_purchase', label: 'Procurement Matrix', icon: ShoppingCart, path: '/inventory/purchase' },
        { id: 'inventory_transfer', label: 'Deployment Logs', icon: ArrowLeftRight, path: '/inventory/transfer' },
        { id: 'inventory_alerts', label: 'Depletion Alerts', icon: AlertTriangle, path: '/inventory/alerts' },
        { id: 'inventory_reports', label: 'Analysis Vectors', icon: BarChart2, path: '/inventory/reports' },
        { id: 'inventory_settings', label: 'System Prefs', icon: Settings, path: '/inventory/settings' }
    ],
    custom: []
};

export const ADMIN_MENU_ITEMS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin',
        permission: 'dashboard'
    },
    {
        id: 'setup',
        label: 'Business Setup',
        icon: Briefcase,
        path: '/admin/setup',
        permission: 'setup',
        subItems: [
            { id: 'setup_outlets', label: 'Outlets', icon: Store, path: '/admin/outlets', permission: 'setup_outlets' },
            { id: 'manage_roles', label: 'Roles & Permissions', icon: Shield, path: '/admin/setup/roles', permission: 'manage_roles' },
            { id: 'setup_staff', label: 'Staff', icon: Users, path: '/admin/staff', permission: 'setup_staff' },
            { id: 'services_list', label: 'Service List', icon: Scissors, path: '/admin/services/list', permission: 'services_list' },
            { id: 'services_categories', label: 'Service Categories', icon: Tag, path: '/admin/services/categories', permission: 'services_categories' }
        ]
    },
    {
        id: 'pos',
        label: 'Operations (POS)',
        icon: CreditCard,
        path: '/pos',
        permission: 'pos',
        subItems: [
            { id: 'pos_dashboard', label: 'POS Dashboard', icon: LayoutDashboard, path: '/pos', permission: 'pos_dashboard' },
            { id: 'pos_billing', label: 'New Bill', icon: Zap, path: '/pos/billing', permission: 'pos_billing' },
            { id: 'pos_invoices', label: 'Invoices & Payments', icon: FileText, path: '/pos/invoices', permission: 'pos_invoices' },
            { id: 'pos_reminders', label: 'Payment Reminders', icon: MessageSquare, path: '/admin/operations/payment-reminders', permission: 'pos_reminders' }
        ]
    },
    {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        path: '/admin/bookings',
        permission: 'bookings',
        subItems: [
            { id: 'bookings_registry', label: 'Booking List', icon: ClipboardList, path: '/admin/bookings', permission: 'bookings_registry' },
            { id: 'bookings_new', label: 'New Booking', icon: Zap, path: '/admin/bookings/new', permission: 'bookings_new' }
        ]
    },
    {
        id: 'inventory',
        label: 'Products & Stock',
        icon: Package,
        path: '/admin/inventory',
        permission: 'inventory',
        subItems: [
            { id: 'inventory_products', label: 'Products Management', icon: Box, path: '/admin/inventory/products', permission: 'inventory_products' },
            { id: 'inventory_shop_orders', label: 'Shop Orders', icon: ShoppingBag, path: '/admin/shop-orders', permission: 'inventory_shop_orders' },
            { id: 'inventory_categories', label: 'Product Categories', icon: Tag, path: '/admin/inventory/product-categories', permission: 'inventory_categories' },
            { id: 'inventory_stock_overview', label: 'Stock Alerts', icon: LayoutDashboard, path: '/admin/inventory/stock-overview', permission: 'inventory_stock_overview' },
            { id: 'inventory_transfer', label: 'Stock Transfer', icon: ArrowLeftRight, path: '/admin/inventory/transfer', permission: 'inventory_transfer' }
        ]
    },
    {
        id: 'suppliers',
        label: 'Suppliers',
        icon: Users,
        path: '/admin/suppliers',
        permission: 'suppliers',
        subItems: [
            { id: 'suppliers_directory', label: 'Supplier Directory', icon: Users, path: '/admin/suppliers/directory', permission: 'suppliers_directory' },
            { id: 'suppliers_invoices', label: 'Supplier Invoices', icon: FileText, path: '/admin/suppliers/invoices', permission: 'suppliers_invoices' }
        ]
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: TrendingUp,
        path: '/admin/finance',
        permission: 'finance',
        subItems: [
            { id: 'finance_dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/finance/dashboard', permission: 'finance_dashboard' },
            { id: 'finance_transactions', label: 'Transactions', icon: ArrowDownUp, path: '/admin/finance/transactions', permission: 'finance_transactions' },
            { id: 'finance_cash_book', label: 'Day Closing & Opening', icon: Wallet, path: '/admin/finance/cash-book', permission: 'finance_cash_book' },
            { id: 'finance_expenses', label: 'Expenses', icon: DollarSign, path: '/admin/finance/expenses', permission: 'finance_expenses' }
        ]
    },
    {
        id: 'finance_reports',
        label: 'Reports',
        icon: ClipboardList,
        path: '/admin/overall-reports',
        permission: 'finance_reports',
        subItems: [
            { id: 'reports_sales', label: 'Sales & Billing', icon: DollarSign, path: '/admin/overall-reports?tab=sales', permission: 'reports_sales' },
            { id: 'reports_bookings', label: 'Bookings & Services', icon: Calendar, path: '/admin/overall-reports?tab=bookings', permission: 'reports_bookings' },
            { id: 'reports_staff', label: 'Staff Performance', icon: UserCheck, path: '/admin/overall-reports?tab=staff', permission: 'reports_staff' },
            { id: 'reports_customer', label: 'Customer & CRM', icon: Users, path: '/admin/overall-reports?tab=customer', permission: 'reports_customer' },
            { id: 'reports_expenses', label: 'Expenses & Finance', icon: CreditCard, path: '/admin/overall-reports?tab=expenses', permission: 'reports_expenses' }
        ]
    },
    {
        id: 'hr',
        label: 'HR & Payroll',
        icon: Briefcase,
        path: '/admin/hr',
        permission: 'hr',
        subItems: [
            { id: 'hr_attendance', label: 'Staff Attendance', icon: UserCheck, path: '/admin/hr/attendance', permission: 'hr_attendance' },
            { id: 'hr_payroll', label: 'Payroll Management', icon: DollarSign, path: '/admin/hr/payroll', permission: 'hr_payroll' },
            { id: 'hr_advance_salary', label: 'Advance Salary', icon: DollarSign, path: '/admin/hr/advance-salary', permission: 'hr_advance_salary' }
        ]
    },
    {
        id: 'crm',
        label: 'Customers (CRM)',
        icon: Users,
        path: '/admin/crm',
        permission: 'crm',
        subItems: [
            { id: 'crm_directory', label: 'Directory', icon: Users, path: '/admin/crm/customers', permission: 'crm_directory' },
            { id: 'crm_consultations', label: 'Consultations', icon: ClipboardList, path: '/admin/crm/consultations', permission: 'crm_directory' },
            { id: 'crm_inquiries', label: 'Leads & Enquiries', icon: ClipboardList, path: '/admin/inquiries', permission: 'crm_inquiries' },
            { id: 'crm_wallets', label: 'Wallets', icon: Wallet, path: '/admin/crm/wallets', permission: 'crm_wallets' },
            { id: 'crm_feedback', label: 'Feedback', icon: Star, path: '/admin/crm/feedback', permission: 'crm_feedback' },
            { id: 'crm_reengage', label: 'Re-engagement', icon: ShieldAlert, path: '/admin/crm/reengage', permission: 'crm_reengage' },
            { id: 'crm_bridal', label: 'Bridal Reminders', icon: Bell, path: '/admin/crm/bridal', permission: 'crm_bridal' },
            { id: 'crm_birthday_anniversary', label: 'Birthday/Anniversary Wishes', icon: Bell, path: '/admin/crm/birthday-anniversary-reminders', permission: 'crm_birthday_anniversary' }
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing',
        icon: Megaphone,
        path: '/admin/marketing',
        permission: 'marketing',
        subItems: [
            { id: 'marketing_hub', label: 'Marketing Hub', icon: Layout, path: '/admin/marketing', permission: 'marketing_hub' },
            { id: 'marketing_promotions', label: 'Coupons & Promos', icon: Percent, path: '/admin/promotions', permission: 'marketing_promotions' },
            { id: 'marketing_whatsapp_credits', label: 'WhatsApp Credits', icon: MessageSquare, path: '/admin/whatsapp-credits', permission: 'marketing_whatsapp_credits' }
        ]
    },
    {
        id: 'loyalty',
        label: 'Loyalty & Membership',
        icon: Crown,
        path: '/admin/loyalty',
        permission: 'loyalty',
        subItems: [
            { id: 'loyalty_plans', label: 'Membership Plans', icon: CreditCard, path: '/admin/loyalty/plans', permission: 'loyalty_plans' },
            { id: 'loyalty_members', label: 'Members', icon: Users, path: '/admin/loyalty/members', permission: 'loyalty_members' },
            { id: 'loyalty_reminders', label: 'Membership Expiry Reminder', icon: Bell, path: '/admin/loyalty/reminders', permission: 'loyalty_reminders' }
        ]
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/admin/settings',
        permission: 'settings',
        subItems: [
            { id: 'settings_profile', label: 'Profile', icon: User, path: '/admin/settings/profile', permission: 'settings_profile' },
            { id: 'settings_business', label: 'Business Info', icon: Briefcase, path: '/admin/settings/business', permission: 'settings_business' },
            { id: 'settings_security', label: 'Security', icon: Shield, path: '/admin/settings/security', permission: 'settings_security' },
            { id: 'settings_terms', label: 'Terms & Conditions', icon: FileText, path: '/admin/settings/terms', permission: 'settings_terms' },
            { id: 'settings_booking_link', label: 'Booking Link', icon: Zap, path: '/admin/settings/booking-link', permission: 'settings_booking_link' }
        ]
    },
    {
        id: 'support',
        label: 'Support',
        icon: LifeBuoy,
        path: '/admin/support',
        permission: 'support'
    }
];

export const buildDynamicSidebar = (roleType, user) => {
    const defaults = ROLE_SIDEBAR_DEFAULTS[roleType] || [];
    const hidden = user?.hiddenSidebarItems || [];
    const adminAccess = user?.adminMenuAccess || [];

    // 1. Filter out hidden default items
    let items = defaults.filter(item => !hidden.includes(item.id));

    // 2. Build admin menu items
    if (adminAccess.length > 0) {
        const adminItems = [];
        for (const parent of ADMIN_MENU_ITEMS) {
            if (parent.subItems) {
                const allowedSubItems = parent.subItems.filter(sub => 
                    adminAccess.includes(sub.permission)
                );
                
                if (allowedSubItems.length > 0) {
                    adminItems.push({
                        ...parent,
                        subItems: allowedSubItems
                    });
                }
            } else if (adminAccess.includes(parent.permission)) {
                adminItems.push(parent);
            }
        }
        
        // Append admin items to the filtered defaults
        items = [...items, ...adminItems];
    }

    return items;
};
