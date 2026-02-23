import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Scissors as ScissorsIcon,
    Package,
    Store,
    UserCog,
    Tag,
    Gift,
    FileText,
    TrendingUp,
    Briefcase,
    Calendar,
    CalendarCheck,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Bell,
    Shield,
    Palette,
    ChevronDown,
    CreditCard,
    Star,
    ShieldAlert,
    Wallet,
    ClipboardList,
    Lock,
    DollarSign
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    {
        label: 'Business Setup',
        icon: Briefcase,
        path: '/admin/setup',
        subItems: [
            { label: 'Outlets', icon: Store, path: '/admin/outlets' },
            { label: 'Staff', icon: UserCog, path: '/admin/staff' },
        ]
    },
    {
        label: 'Operations',
        icon: ScissorsIcon,
        path: '/pos',
        subItems: [
            { label: 'POS Dashboard', icon: LayoutDashboard, path: '/pos' },
            { label: 'Invoices', icon: FileText, path: '/pos/invoices', badge: { count: 5, color: 'bg-emerald-400' } },
            { label: 'Payments', icon: CreditCard, path: '/pos/payments' },
            { label: 'Refunds', icon: TrendingUp, path: '/pos/refunds', badge: { count: 2, color: 'bg-rose-400' } },
            { label: 'POS Settings', icon: Settings, path: '/pos/settings' },
        ]
    },
    {
        label: 'Bookings',
        icon: Calendar,
        path: '/admin/bookings',
        roles: ['admin', 'manager', 'staff']
    },
    {
        label: 'CRM',
        icon: Users,
        path: '/admin/crm',
        roles: ['admin', 'manager'],
        subItems: [
            { label: 'Customers', icon: Users, path: '/admin/crm/customers' },
            { label: 'Segments', icon: Tag, path: '/admin/crm/segments' },
            { label: 'Feedback', icon: Star, path: '/admin/crm/feedback' },
            { label: 'Re-engagement', icon: ShieldAlert, path: '/admin/crm/reengage' },
        ]
    },
    {
        label: 'Inventory',
        icon: Package,
        path: '/admin/inventory',
        subItems: [
            { label: 'Stock Overview', icon: LayoutDashboard, path: '/admin/inventory/overview' },
            { label: 'Stock In (Purchase)', icon: Package, path: '/admin/inventory/stock-in' },
            { label: 'Stock Out / Adjust', icon: FileText, path: '/admin/inventory/adjustment' },
            { label: 'Low Stock Alerts', icon: Bell, path: '/admin/inventory/alerts', badge: { count: 3, color: 'bg-rose-400' } },
        ]
    },
    {
        label: 'Finance',
        icon: TrendingUp,
        path: '/admin/finance',
        subItems: [
            { label: 'Finance Dashboard', icon: LayoutDashboard, path: '/admin/finance/dashboard' },
            { label: 'Suppliers', icon: Users, path: '/admin/finance/suppliers' },
            { label: 'Supplier Invoices', icon: FileText, path: '/admin/finance/invoices' },
            { label: 'Expenses', icon: DollarSign, path: '/admin/finance/expenses' },
            { label: 'Cash & Bank', icon: Wallet, path: '/admin/finance/reconciliation' },
            { label: 'GST / Tax Reports', icon: ClipboardList, path: '/admin/finance/tax' },
            { label: 'End of Day', icon: Lock, path: '/admin/finance/eod' },
        ]
    },
    { label: 'HR', icon: Briefcase, path: '/admin/hr' },
    {
        label: 'Settings',
        icon: Settings,
        path: '/admin/settings',
        subItems: [
            { label: 'Profile', icon: User, path: '/admin/settings/profile' },
            { label: 'Notifications', icon: Bell, path: '/admin/settings/notifications', badge: { count: 12, color: 'bg-orange-400' } },
            { label: 'Security', icon: Shield, path: '/admin/settings/security' },
        ]
    },
];

export default function Sidebar({ collapsed, setCollapsed, isHovered, setIsHovered, mobileOpen, setMobileOpen }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState(null);

    // If hovered, we behave as if not collapsed
    const effectiveCollapsed = collapsed && !isHovered;

    useEffect(() => {
        // Auto-expand menu item if a sub-item is active
        menuItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => location.pathname === sub.path)) {
                setExpandedItem(item.label);
            }
        });
    }, [location.pathname]);

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleExpand = (label) => {
        if (effectiveCollapsed) {
            setCollapsed(false);
            setExpandedItem(label);
        } else {
            setExpandedItem(expandedItem === label ? null : label);
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border/40">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                        <ScissorsIcon className="w-4 h-4 text-white" />
                    </div>
                    {!effectiveCollapsed && (
                        <span className="text-lg font-bold text-text whitespace-nowrap tracking-tight">
                            Salon<span className="text-primary font-extrabold">CRM</span>
                        </span>
                    )}
                </div>
                {/* Desktop collapse */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-text-muted" />
                    )}
                </button>
                {/* Mobile close */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    <X className="w-4 h-4 text-text-muted" />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItem === item.label && !effectiveCollapsed;
                    const active = isActive(item.path);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${active
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-text-secondary hover:bg-white hover:shadow-sm hover:text-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                                        />
                                        {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                    </div>
                                    {!effectiveCollapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {isExpanded && !effectiveCollapsed && (
                                    <div className="ml-7 pl-2 border-l border-border/60 space-y-1 mt-1 relative">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive: isSubActive }) =>
                                                    `flex items-center justify-between py-2 px-4 rounded-full text-[11px] font-semibold transition-all duration-300 relative ${isSubActive
                                                        ? 'bg-white text-text shadow-md border border-border/50 translate-x-1.5'
                                                        : 'text-text-muted hover:text-text-secondary hover:translate-x-1'
                                                    }`
                                                }
                                            >
                                                <span>{sub.label}</span>
                                                {sub.badge && (
                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] text-white font-bold ${sub.badge.color}`}>
                                                        {sub.badge.count}
                                                    </span>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${isItemActive
                                    ? 'bg-white text-primary shadow-sm border border-border/50'
                                    : 'text-text-secondary hover:bg-white hover:text-text hover:shadow-sm'
                                }`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                            />
                            {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:bg-error/10 hover:text-error transition-all duration-300 group"
                >
                    <LogOut className="w-5 h-5 shrink-0 text-text-muted group-hover:text-error" />
                    {!effectiveCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-border z-40 transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-60 shadow-xl'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-60 bg-white border-r border-border z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

