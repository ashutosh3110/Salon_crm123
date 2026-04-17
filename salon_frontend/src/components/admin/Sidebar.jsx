import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import {
    LayoutDashboard,
    Layout,
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
    List,
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
    DollarSign,
    Box,
    Megaphone,
    Percent,
    Smartphone,
    Crown,
    ArrowDownUp,
    Globe,
    Send,
    MoreVertical,
    Ban,
    Trash2,
    ArrowRight,
    LifeBuoy,
    CheckCircle2,
    Zap
} from 'lucide-react';

import { useCMS } from '../../contexts/CMSContext';
import { useInventory } from '../../contexts/InventoryContext';

export default function Sidebar({ collapsed, setCollapsed, isHovered, setIsHovered, mobileOpen, setMobileOpen }) {
    const { logout, user } = useAuth();
    const { salon } = useBusiness();
    const { pendingExpertsCount } = useCMS();
    const { stats } = useInventory();
    const lowStockCount = stats?.lowStockCount || 0;
    const location = useLocation();
    
    const isRestricted = useMemo(() => {
        // Superadmins are never restricted
        if (user?.role === 'superadmin') return false;

        const rawPlan = salon?.subscriptionPlan || user?.subscriptionPlan || 'none';
        const planName = String(rawPlan || 'none').trim().toLowerCase();
        
        // A salon is restricted if it has no plan or is explicitly inactive/suspended
        const hasNoPlan = ['none', 'undefined', 'null', '', 'pending'].includes(planName);
        const salonActive = salon 
            ? (salon.isActive !== false && salon.status !== 'suspended') 
            : (user?.salonIsActive !== false);
        
        const restricted = hasNoPlan || !salonActive;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('[Sidebar] Gating Debug:', { planName, salonActive, restricted, role: user?.role });
        }
        
        return restricted;
    }, [salon, user]);

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { label: 'Subscription & Plans', icon: Crown, path: '/admin/subscription' },
        {
            label: 'Business Setup',
            icon: Briefcase,
            path: '/admin/setup',
            subItems: [
                { label: 'Outlets', icon: Store, path: '/admin/outlets' },
                { label: 'Roles & Permissions', icon: Shield, path: '/admin/setup/roles' },
                { label: 'Staff', icon: UserCog, path: '/admin/staff' },
                { label: 'Service List', icon: ScissorsIcon, path: '/admin/services/list' },
                { label: 'Service Categories', icon: Tag, path: '/admin/services/categories' },
            ]
        },
        {
            label: 'Operations',
            icon: ScissorsIcon,
            path: '/pos',
            feature: 'pos',
            subItems: [
                { label: 'New Bill (POS)', icon: Zap, path: '/pos/billing', roles: ['admin', 'manager', 'receptionist'] },
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
            subItems: [
                { label: 'Booking Registry', icon: List, path: '/admin/bookings' },
                { label: 'Direct Booking', icon: Zap, path: '/admin/bookings/new' },
            ]
        },
        {
            label: 'Marketing',
            icon: Megaphone,
            path: '/admin/marketing',
            subItems: [
                { label: 'Marketing Hub', icon: Layout, path: '/admin/marketing' },
                { label: 'App CMS', icon: Smartphone, path: '/admin/marketing/cms', badge: pendingExpertsCount > 0 ? { count: pendingExpertsCount, color: 'bg-rose-500 animate-pulse' } : null },
                { label: 'Coupon Codes', icon: Percent, path: '/admin/promotions' },
            ]
        },
        {
            label: 'Enquiries',
            icon: ClipboardList,
            path: '/admin/inquiries',
            roles: ['admin', 'manager', 'receptionist']
        },
        {
            label: 'Reminders & Links',
            icon: Bell,
            path: '/admin/reminders',
            roles: ['admin', 'manager']
        },
        {
            label: 'Customers',
            icon: Users,
            path: '/admin/crm',
            roles: ['admin', 'manager'],
            feature: 'crm',
            subItems: [
                { label: 'Directory', icon: Users, path: '/admin/crm/customers' },
                { label: 'Wallets', icon: Wallet, path: '/admin/crm/wallets' },
                { label: 'Segments', icon: Tag, path: '/admin/crm/segments' },
                { label: 'Feedback', icon: Star, path: '/admin/crm/feedback' },
                { label: 'Re-engagement', icon: ShieldAlert, path: '/admin/crm/reengage' },
            ]
        },
        {
            label: 'Loyalty & Membership',
            icon: Crown,
            path: '/admin/loyalty',
            roles: ['admin'],
            feature: 'loyalty',
            subItems: [
                { label: 'Loyalty Rules', icon: Gift, path: '/admin/loyalty/rules' },
                { label: 'Membership Plans', icon: CreditCard, path: '/admin/loyalty/plans' },
                { label: 'Members', icon: Users, path: '/admin/loyalty/members' },
                { label: 'Transactions', icon: ArrowDownUp, path: '/admin/loyalty/transactions' },
                { label: 'Referral', icon: Star, path: '/admin/loyalty/referral' },
            ]
        },
        {
            label: 'Inventory',
            icon: Package,
            path: '/admin/inventory',
            feature: 'inventory',
            subItems: [
                { label: 'Products Master', icon: Box, path: '/admin/inventory/products', roles: ['admin'] },
                { label: 'Product Categories', icon: Tag, path: '/admin/inventory/product-categories', roles: ['admin'] },
                { label: 'App shop', icon: Smartphone, path: '/admin/inventory/shop-categories', roles: ['admin'] },
                { label: 'Stock overview', icon: LayoutDashboard, path: '/admin/inventory/stock-overview' },
                { label: 'Stock In (Purchase)', icon: Package, path: '/admin/inventory/stock-in' },
                { label: 'Stock Out / Adjust', icon: FileText, path: '/admin/inventory/adjustment' },
                { label: lowStockCount > 0 ? 'Low Stock Alerts' : 'Inventory Alerts', icon: Bell, path: '/admin/inventory/alerts', badge: lowStockCount > 0 ? { count: lowStockCount, color: 'bg-rose-400' } : null },
            ]
        },
        {
            label: 'Finance',
            icon: TrendingUp,
            path: '/admin/finance',
            feature: 'finance',
            subItems: [
                { label: 'Finance Dashboard', icon: LayoutDashboard, path: '/admin/finance/dashboard' },
                { label: 'Suppliers', icon: Users, path: '/admin/finance/suppliers' },
                { label: 'Supplier Invoices', icon: FileText, path: '/admin/finance/invoices' },
                { label: 'Expenses', icon: DollarSign, path: '/admin/finance/expenses' },
                { label: 'Petty Cash', icon: Wallet, path: '/admin/finance/petty-cash' },
                { label: 'Cash & Bank', icon: Wallet, path: '/admin/finance/reconciliation' },
                { label: 'GST / Tax Reports', icon: ClipboardList, path: '/admin/finance/tax' },
                { label: 'End of Day', icon: Lock, path: '/admin/finance/eod' },
            ]
        },
        {
            label: 'HR / Payroll',
            icon: Briefcase,
            path: '/admin/hr',
            feature: 'payroll',
            subItems: [
                { label: 'Staff Master', icon: Users, path: '/admin/hr/staff' },
                { label: 'Attendance', icon: CalendarCheck, path: '/admin/hr/attendance' },
                { label: 'Shifts', icon: Lock, path: '/admin/hr/shifts' },
                { label: 'Payroll', icon: DollarSign, path: '/admin/hr/payroll' },
                { label: 'Performance', icon: TrendingUp, path: '/admin/hr/performance' },
                { label: 'Service Approvals', icon: CheckCircle2, path: '/admin/hr/approvals', badge: { count: 'New', color: 'bg-primary' } },
            ]
        },
        {
            label: 'Settings',
            icon: Settings,
            path: '/admin/settings',
            subItems: [
                { label: 'Profile', icon: User, path: '/admin/settings/profile' },
                { label: 'Business Info', icon: Briefcase, path: '/admin/settings/business' },
                { label: 'Notifications', icon: Bell, path: '/admin/settings/notifications' },
                { label: 'Security', icon: Shield, path: '/admin/settings/security' },
            ]
        },
        {
            label: 'Support',
            icon: LifeBuoy,
            path: '/admin/support',
            roles: ['admin', 'manager']
        },
    ];
    const [expandedItem, setExpandedItem] = useState(null);
    const [isLgUp, setIsLgUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const handleResize = () => setIsLgUp(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isLgUp && collapsed && !isHovered;

    useEffect(() => {
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
        <div className="flex flex-col h-full bg-background transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border/40">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="w-45 h-45 flex items-center justify-center shrink-0">
                        <img
                            src="/new black wapixo logo .png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                {/* Desktop collapse */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-8 h-8 rounded-xl bg-surface border border-border/40 items-center justify-center hover:bg-surface-alt transition-colors"
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

            {/* Warning Banner for Restricted Salons */}
            {isRestricted && user?.role !== 'superadmin' && !effectiveCollapsed && (
                <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 animate-pulse">
                    <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Action Required</p>
                            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">Choose a subscription plan to unlock all features.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const isSubscriptionPath = item.path === '/admin/subscription';
                    const isSupportPath = item.path === '/admin/support';
                    const isLocked = isRestricted && user?.role !== 'superadmin' && !isSubscriptionPath && !isSupportPath;
                    // Feature check - disabled to show all menus as requested
                    // if (item.feature && salon && salon.features && salon.features[item.feature] === false) return null;
                    
                    // Role check - disabled to show all menus as requested
                    // if (item.roles && !item.roles.includes(user?.role)) return null;

                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItem === item.label && !effectiveCollapsed;
                    const active = isActive(item.path);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => !isLocked && toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-text'} ${isLocked ? 'opacity-40 grayscale !pointer-events-none !cursor-not-allowed !select-none' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                                        />
                                        {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                    </div>
                                    {!effectiveCollapsed && (
                                        <div className="flex items-center gap-1.5">
                                            {isLocked && <Lock className="w-3 h-3 text-text-muted/60" />}
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </button>

                                {isExpanded && !effectiveCollapsed && (
                                    <div className="ml-7 pl-2 border-l border-border/60 space-y-1 mt-1 relative">
                                        {item.subItems
                                            .map((sub) => (
                                                <NavLink
                                                    key={sub.path}
                                                    to={isLocked ? '#' : sub.path}
                                                    onClick={(e) => { if (isLocked) e.preventDefault(); else setMobileOpen(false); }}
                                                    className={({ isActive: isSubActive }) =>
                                                        `flex items-center justify-between py-2 px-4 rounded-full text-[11px] font-semibold transition-all duration-300 relative ${isSubActive
                                                            ? 'bg-white dark:bg-surface text-text shadow-md border border-border/50 translate-x-1.5'
                                                            : 'text-text-muted hover:text-text-secondary hover:translate-x-1'
                                                        } ${isLocked ? 'opacity-40 grayscale !pointer-events-none !cursor-not-allowed !select-none' : ''}`
                                                    }
                                                >
                                                    <span>{sub.label}</span>
                                                    {!isLocked && sub.badge && (
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] text-white font-semibold ${sub.badge.color}`}>
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
                            to={isLocked ? '#' : item.path}
                            end={item.path === '/admin'}
                            onClick={(e) => { if (isLocked) e.preventDefault(); else setMobileOpen(false); }}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${isItemActive && !isLocked
                                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${isLocked ? 'opacity-40 grayscale !pointer-events-none !cursor-not-allowed !select-none' : ''}`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                            />
                            {!effectiveCollapsed && (
                                <div className="flex items-center justify-between flex-1">
                                    <span className="whitespace-nowrap">{item.label}</span>
                                    {isLocked && <Lock className="w-3 h-3 text-text-muted/60" />}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-error/10 hover:text-error transition-all duration-300 group"
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
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-background border-r border-border/40 z-40 transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-64 shadow-2xl shadow-primary/5'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-background border-r border-border/40 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
