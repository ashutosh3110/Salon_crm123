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
    ChevronsLeft,
    ChevronsRight,
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
    ArrowLeftRight,
    Globe,
    Send,
    MoreVertical,
    Ban,
    Trash2,
    ArrowRight,
    LifeBuoy,
    CheckCircle2,
    Zap,
    ShoppingBag,
    MessageSquare
} from 'lucide-react';

import { useCMS } from '../../contexts/CMSContext';
import { useInventory } from '../../contexts/InventoryContext';
import { getImageUrl } from '../../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function Sidebar({ collapsed, setCollapsed, isHovered, setIsHovered, mobileOpen, setMobileOpen }) {
    const { logout, user } = useAuth();
    const { salon, platformSettings } = useBusiness();
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? "/new wapixo logo .png" : "/new black wapixo logo .png";
    const { pendingExpertsCount } = useCMS();
    const { stats } = useInventory();
    const lowStockCount = stats?.lowStockCount || 0;
    const location = useLocation();

    const isRestricted = useMemo(() => {
        if (user?.role === 'superadmin') return false;

        const rawPlan = salon?.subscriptionPlan || user?.subscriptionPlan || 'none';
        const planName = String(rawPlan || 'none').trim().toLowerCase();

        const hasNoPlan = ['none', 'undefined', 'null', '', 'pending'].includes(planName);
        const salonActive = salon
            ? (salon.isActive !== false && salon.status !== 'suspended')
            : (user?.salonIsActive !== false);

        return hasNoPlan || !salonActive;
    }, [salon, user]);

    const menuItems = useMemo(() => {
        const items = [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', permission: 'dashboard', category: 'General' },
            { label: 'Subscription & Plans', icon: Crown, path: '/admin/subscription', permission: 'admin_only', category: 'General' },

            {
                label: 'Business Setup',
                icon: Briefcase,
                path: '/admin/setup',
                permission: 'setup',
                category: 'Management',
                subItems: [
                    { label: 'Outlets', icon: Store, path: '/admin/outlets', permission: 'setup_outlets' },
                    { label: 'Roles & Permissions', icon: Shield, path: '/admin/setup/roles', permission: 'manage_roles' },
                    { label: 'Staff', icon: UserCog, path: '/admin/staff', permission: 'setup_staff' },
                    { label: 'Service List', icon: ScissorsIcon, path: '/admin/services/list', permission: 'services_list' },
                    { label: 'Service Categories', icon: Tag, path: '/admin/services/categories', permission: 'services_categories' },
                ]
            },
            {
                label: 'Operations',
                icon: ScissorsIcon,
                path: '/pos',
                permission: 'pos',
                feature: 'pos',
                category: 'Operations',
                subItems: [
                    { label: 'POS Dashboard', icon: LayoutDashboard, path: '/pos', permission: 'pos_dashboard' },
                    { label: 'New Bill', icon: Zap, path: '/pos/billing', permission: 'pos_billing' },
                    { label: 'Invoices & Payments', icon: FileText, path: '/pos/invoices', permission: 'pos_invoices' },
                    { label: 'Payment Reminders', icon: MessageSquare, path: '/admin/operations/payment-reminders', permission: 'pos_reminders' },
                ]
            },
            {
                label: 'Bookings',
                icon: Calendar,
                path: '/admin/bookings',
                permission: 'bookings',
                category: 'Operations',
                subItems: [
                    { label: 'Booking Registry', icon: List, path: '/admin/bookings', permission: 'bookings_registry' },
                    { label: 'Direct Booking', icon: Zap, path: '/admin/bookings/new', permission: 'bookings_new' },
                ]
            },
            {
                label: 'Products & Stock',
                icon: Package,
                path: '/admin/inventory',
                permission: 'inventory',
                feature: 'inventory',
                category: 'Operations',
                subItems: [
                    { label: 'Products Management', icon: Box, path: '/admin/inventory/products', permission: 'inventory_products' },
                    { label: 'Shop Orders', icon: ShoppingBag, path: '/admin/shop-orders', permission: 'inventory_shop_orders' },
                    { label: 'Product Categories', icon: Tag, path: '/admin/inventory/product-categories', permission: 'inventory_categories' },
                    { label: 'Stock Alerts', icon: LayoutDashboard, path: '/admin/inventory/stock-overview', permission: 'inventory_stock_overview' },
                    { label: 'Stock Transfer', icon: ArrowLeftRight, path: '/admin/inventory/transfer', permission: 'inventory_transfer' },
                ]
            },
            {
                label: 'Suppliers',
                icon: Users,
                path: '/admin/suppliers',
                permission: 'suppliers',
                feature: 'finance',
                category: 'Operations',
                subItems: [
                    { label: 'Supplier Directory', icon: Users, path: '/admin/suppliers/directory', permission: 'suppliers_directory' },
                    { label: 'Supplier Invoices', icon: FileText, path: '/admin/suppliers/invoices', permission: 'suppliers_invoices' },
                ]
            },
            {
                label: 'Finance',
                icon: TrendingUp,
                path: '/admin/finance',
                permission: 'finance',
                feature: 'finance',
                category: 'Operations',
                subItems: [
                    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/finance/dashboard', permission: 'finance_dashboard' },
                    { label: 'Transactions', icon: ArrowDownUp, path: '/admin/finance/transactions', permission: 'finance_transactions' },
                    { label: 'Cash & Bank Book', icon: Wallet, path: '/admin/finance/cash-book', permission: 'finance_cash_book' },
                    { label: 'Expenses', icon: DollarSign, path: '/admin/finance/expenses', permission: 'finance_expenses' },
                    { label: 'Sales Reports', icon: FileText, path: '/admin/finance/reports', permission: 'finance_reports' },
                ]
            },
            {
                label: 'HR & Payroll',
                icon: Briefcase,
                path: '/admin/hr',
                permission: 'hr',
                feature: 'payroll',
                category: 'Management',
                subItems: [
                    { label: 'Staff Attendance', icon: CalendarCheck, path: '/admin/hr/attendance', permission: 'hr_attendance' },
                    { label: 'Payroll Management', icon: DollarSign, path: '/admin/hr/payroll', permission: 'hr_payroll' },
                    { label: 'Advance Salary', icon: DollarSign, path: '/admin/hr/advance-salary', permission: 'hr_advance_salary' },
                ]
            },
            {
                label: 'Customers',
                icon: Users,
                path: '/admin/crm',
                permission: 'crm',
                feature: 'crm',
                category: 'CRM & Marketing',
                subItems: [
                    { label: 'Directory', icon: Users, path: '/admin/crm/customers', permission: 'crm_directory' },
                    { label: 'Consultations', icon: ClipboardList, path: '/admin/crm/consultations', permission: 'crm_directory' },
                    { label: 'Leads & Enquiries', icon: ClipboardList, path: '/admin/inquiries', permission: 'crm_inquiries' },
                    { label: 'Wallets', icon: Wallet, path: '/admin/crm/wallets', permission: 'crm_wallets' },
                    { label: 'Feedback', icon: Star, path: '/admin/crm/feedback', permission: 'crm_feedback' },
                    { label: 'Re-engagement', icon: ShieldAlert, path: '/admin/crm/reengage', permission: 'crm_reengage' },
                    { label: 'Bridal Reminders', icon: Bell, permission: 'crm_bridal', path: '/admin/crm/bridal' },
                    { label: 'Birthday/Anniversary Wishes', icon: Bell, permission: 'crm_birthday_anniversary', path: '/admin/crm/birthday-anniversary-reminders' },
                ]
            },
            {
                label: 'Marketing',
                icon: Megaphone,
                path: '/admin/marketing',
                permission: 'marketing',
                category: 'CRM & Marketing',
                subItems: [
                    { label: 'Marketing Hub', icon: Layout, path: '/admin/marketing', permission: 'marketing_hub' },
                    { label: 'Coupons & Promos', icon: Percent, path: '/admin/promotions', permission: 'marketing_promotions' },
                    { label: 'WhatsApp Credits', icon: MessageSquare, path: '/admin/whatsapp-credits', permission: 'marketing_whatsapp_credits' },
                ]
            },
            {
                label: 'Loyalty & Membership',
                icon: Crown,
                path: '/admin/loyalty',
                permission: 'loyalty',
                feature: 'loyalty',
                category: 'CRM & Marketing',
                subItems: [
                    { label: 'Membership Plans', icon: CreditCard, path: '/admin/loyalty/plans', permission: 'loyalty_plans' },
                    { label: 'Members', icon: Users, path: '/admin/loyalty/members', permission: 'loyalty_members' },
                    { label: 'Membership Expiry Reminder', icon: Bell, path: '/admin/loyalty/reminders', permission: 'loyalty_reminders' },
                ]
            },
            {
                label: 'Settings',
                icon: Settings,
                path: '/admin/settings',
                permission: 'settings',
                category: 'Management',
                subItems: [
                    { label: 'Profile', icon: User, path: '/admin/settings/profile', permission: 'settings_profile' },
                    { label: 'Business Info', icon: Briefcase, path: '/admin/settings/business', permission: 'settings_business' },
                    { label: 'Security', icon: Shield, path: '/admin/settings/security', permission: 'settings_security' },
                    { label: 'Terms & Conditions', icon: FileText, path: '/admin/settings/terms', permission: 'settings_terms' },
                    { label: 'Booking Link', icon: Zap, path: '/admin/settings/booking-link', permission: 'settings_booking_link' },
                ]
            },
            {
                label: 'Support',
                icon: LifeBuoy,
                path: '/admin/support',
                permission: 'support',
                category: 'System'
            },
        ];

        return items
            .map(item => {
                if (item.subItems) {
                    const filteredSubItems = item.subItems.filter(sub => {
                        if (user?.role === 'superadmin') return true;
                        if (user?.role === 'admin') return true;

                        const userPermissions = user?.permissions || [];
                        if (userPermissions.includes('*')) return true;

                        if (sub.permission) {
                            if (sub.permission === 'admin_only') return false;
                            return userPermissions.includes(sub.permission);
                        }
                        return true;
                    });
                    return { ...item, subItems: filteredSubItems };
                }
                return item;
            })
            .filter(item => {
                if (user?.role === 'superadmin') return true;
                if (user?.role === 'admin') return true;

                const userPermissions = user?.permissions || [];
                if (userPermissions.includes('*')) return true;

                if (item.subItems) {
                    const hasSubPermission = item.subItems.length > 0;
                    if (item.permission) {
                        if (item.permission === 'admin_only') return false;
                        return userPermissions.includes(item.permission) || hasSubPermission;
                    }
                    return hasSubPermission;
                }

                if (item.permission) {
                    if (item.permission === 'admin_only') return false;
                    return userPermissions.includes(item.permission);
                }

                return true;
            });
    }, [user, pendingExpertsCount, lowStockCount, salon]);

    const [expandedItems, setExpandedItems] = useState([]);
    const [isLgUp, setIsLgUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const handleResize = () => setIsLgUp(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isLgUp && collapsed && !isHovered;

    useEffect(() => {
        const currentlyActiveItems = menuItems
            .filter(item => item.subItems && item.subItems.some(sub => location.pathname === sub.path))
            .map(item => item.label);

        if (currentlyActiveItems.length > 0) {
            setExpandedItems(prev => {
                const newItems = [...prev];
                currentlyActiveItems.forEach(label => {
                    if (!newItems.includes(label)) newItems.push(label);
                });
                return newItems;
            });
        }
    }, [location.pathname, menuItems]);

    const toggleExpand = (label) => {
        if (effectiveCollapsed) {
            setCollapsed(false);
            setExpandedItems(prev => prev.includes(label) ? prev : [...prev, label]);
        } else {
            setExpandedItems(prev =>
                prev.includes(label)
                    ? prev.filter(item => item !== label)
                    : [...prev, label]
            );
        }
    };

    const sidebarContent = (
        <div className="sidebar-container flex flex-col h-full bg-white dark:bg-slate-900 border-r border-[#e2e8f0] dark:border-slate-700/50 transition-all duration-300" style={{ backdropFilter: 'blur(20px)', boxShadow: '0 0 0 1px rgba(0,0,0,0.04)' }}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100,100,100,0.2);
                    border-radius: 999px;
                }
                .sidebar-container,
                .sidebar-container *,
                .sidebar-container button,
                .sidebar-container span,
                .sidebar-container a {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                }
            `}</style>



            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-[#e2e8f0] dark:border-slate-700/50">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className={`${effectiveCollapsed ? 'h-8 w-8' : 'h-16 w-56'} flex items-center justify-center shrink-0`}>
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className={`w-full h-full object-contain ${effectiveCollapsed ? '' : 'scale-150'}`}
                        />
                    </div>
                </div>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                    <X className="w-5 h-5 text-text-muted" />
                </button>
            </div>

            {/* Warning Banner for Restricted Salons */}
            {isRestricted && user?.role !== 'superadmin' && !effectiveCollapsed && (
                <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 animate-pulse">
                    <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">Action Required</p>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">Choose a subscription plan to unlock all features.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const isSubscriptionPath = item.path === '/admin/subscription';
                    const isSupportPath = item.path === '/admin/support';
                    const isLocked = isRestricted && user?.role !== 'superadmin' && !isSubscriptionPath && !isSupportPath;

                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItems.includes(item.label) && !effectiveCollapsed;
                    const active =
                        location.pathname === item.path ||
                        (item.subItems &&
                            item.subItems.some(sub =>
                                location.pathname.startsWith(sub.path)
                            ));

                    return (
                        <div key={item.label || item.path} className="space-y-1">

                            {hasSubItems ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => !isLocked && toggleExpand(item.label)}
                                        title={effectiveCollapsed ? item.label : undefined}
                                        className={`flex items-center justify-between w-full rounded-lg text-[15px] font-bold transition-all duration-200 ease-out group relative cursor-pointer
                                            ${effectiveCollapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-4 py-3 gap-3'}
                                            ${active
                                                ? 'bg-[#B4912B] text-white shadow-sm border border-[#B4912B]'
                                                : 'border border-transparent text-slate-500 hover:bg-[#B4912B]/10 hover:text-[#B4912B]'
                                            } ${isLocked ? 'opacity-40 !pointer-events-none !cursor-not-allowed !select-none' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon
                                                className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-[#B4912B]'}`}
                                            />
                                            {!effectiveCollapsed && <span className={`whitespace-nowrap font-bold !block !opacity-100 transition-colors ${active ? '!text-white' : '!text-slate-700 dark:!text-slate-300 group-hover:!text-[#B4912B]'}`}>{item.label}</span>}
                                        </div>
                                        {!effectiveCollapsed && (
                                            <div className="flex items-center gap-1.5">
                                                {isLocked && <Lock className="w-3 h-3 text-text-muted/60" />}
                                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        )}
                                        {/* Tooltip (collapsed) */}
                                        {effectiveCollapsed && (
                                            <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-surface-alt text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity duration-150 border border-slate-700 dark:border-border">
                                                {item.label}
                                            </div>
                                        )}
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && !effectiveCollapsed && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="overflow-hidden ml-7 pl-4 relative space-y-1 mt-1 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-[#e2e8f0]"
                                            >
                                                {item.subItems.map((sub) => {
                                                    const isSubActive = (location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')) &&
                                                        !item.subItems.some(sibling =>
                                                            sibling.path !== sub.path &&
                                                            sibling.path.length > sub.path.length &&
                                                            (location.pathname === sibling.path || location.pathname.startsWith(sibling.path + '/'))
                                                        );
                                                    return (
                                                        <NavLink
                                                            key={sub.path}
                                                            to={isLocked ? '#' : sub.path}
                                                            onClick={(e) => { if (isLocked) e.preventDefault(); else setMobileOpen(false); }}
                                                            className={`flex items-center justify-between py-2.5 px-4 rounded-md text-[13px] font-bold transition-all duration-200 relative
                                                                ${isSubActive
                                                                    ? 'bg-[#B4912B] text-white shadow-sm'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:text-[#B4912B] hover:bg-[#B4912B]/10'
                                                                } ${isLocked ? 'opacity-40 !pointer-events-none !cursor-not-allowed !select-none' : ''}`}
                                                        >
                                                            <span className="font-bold">{sub.label}</span>
                                                            {!isLocked && sub.badge && (
                                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] text-white font-semibold ${sub.badge.color}`}>
                                                                    {sub.badge.count}
                                                                </span>
                                                            )}
                                                        </NavLink>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <NavLink
                                    to={isLocked ? '#' : item.path}
                                    end={item.path === '/admin'}
                                    onClick={(e) => { if (isLocked) e.preventDefault(); else setMobileOpen(false); }}
                                    title={effectiveCollapsed ? item.label : undefined}
                                    className={({ isActive: isItemActive }) => {
                                        const currentActive = isItemActive && !isLocked;
                                        return `flex items-center rounded-lg text-[15px] font-bold transition-all duration-200 ease-out group relative
                                            ${effectiveCollapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-4 py-3 gap-3'}
                                            ${currentActive
                                                ? 'bg-[#B4912B] text-white shadow-sm border border-[#B4912B]'
                                                : 'border border-transparent text-slate-500 dark:text-slate-400 hover:bg-[#B4912B]/10 hover:text-[#B4912B] dark:hover:text-[#C5A23C]'
                                            } ${isLocked ? 'opacity-40 !pointer-events-none !cursor-not-allowed !select-none' : ''}`;
                                    }}
                                >
                                    {({ isActive: isItemActive }) => {
                                        const currentActive = isItemActive && !isLocked;
                                        return (
                                            <>
                                                <item.icon
                                                    className={`w-5 h-5 shrink-0 ${currentActive ? 'text-white' : 'text-slate-500 group-hover:text-[#B4912B]'}`}
                                                />
                                                {!effectiveCollapsed && (
                                                    <div className="flex items-center justify-between flex-1">
                                                        <span className={`whitespace-nowrap font-bold !block !opacity-100 ${isItemActive ? '!text-white' : '!text-slate-700 dark:!text-slate-300 group-hover:!text-[#B4912B] transition-colors'}`}>{item.label}</span>
                                                        {isLocked && <Lock className="w-3 h-3 text-text-muted/60" />}
                                                    </div>
                                                )}
                                                {/* Tooltip (collapsed) */}
                                                {effectiveCollapsed && (
                                                    <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-surface-alt text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity duration-150 border border-slate-700 dark:border-border">
                                                        {item.label}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    }}
                                </NavLink>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile Chip */}
            {!effectiveCollapsed && (
                <div className="px-4 pb-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] shadow-sm">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={salon?.logoUrl ? getImageUrl(salon.logoUrl) : logoSrc} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#0f172a] truncate">{user?.name || salon?.name || 'Admin'}</div>
                            <div className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@saloncrm.io'}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className={`border-t border-[#e2e8f0] dark:border-slate-700/50 ${effectiveCollapsed ? 'p-2' : 'px-4 py-3'}`}>
                <button
                    onClick={logout}
                    className={`flex items-center rounded-lg text-[15px] font-bold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 group cursor-pointer border-0
                        ${effectiveCollapsed ? 'justify-center h-11 w-11 mx-auto relative' : 'w-full px-4 py-3 gap-3'}`}
                    title={effectiveCollapsed ? 'Logout' : undefined}
                >
                    <LogOut className="shrink-0 w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-red-600 transition-colors" />
                    {!effectiveCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300 font-bold">Logout</span>}
                    {effectiveCollapsed && (
                        <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-surface-alt text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity border border-slate-700 dark:border-border">
                            Logout
                        </div>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${effectiveCollapsed ? 'w-[72px]' : 'w-[270px]'}`}
            >
                {sidebarContent}

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-[28px] w-6 h-6 rounded-full bg-white border border-[#e2e8f0] items-center justify-center shadow-md hover:shadow-lg hover:scale-110 hover:text-[#0f172a] transition-all duration-200 z-50 cursor-pointer text-slate-500"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
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
                className={`lg:hidden fixed top-0 left-0 h-screen w-[270px] z-50 transition-transform duration-300 bg-white dark:bg-slate-900 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

