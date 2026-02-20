import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermission } from '../../hooks/usePermission';
import { ROUTES } from '../../config/routes';
import {
    HiOutlineViewGrid,
    HiOutlineUsers,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineScissors,
    HiOutlineShoppingBag,
    HiOutlineClipboardList,
    HiOutlineTruck,
    HiOutlineCurrencyDollar,
    HiOutlineUserGroup,
    HiOutlineSpeakerphone,
    HiOutlineStar,
    HiOutlineGift,
    HiOutlineTicket,
    HiOutlineChatAlt2,
    HiOutlineChartBar,
    HiOutlineCog,
    HiOutlineOfficeBuilding,
    HiOutlineBell,
    HiOutlineCollection,
    HiOutlineChevronDown,
    HiOutlineChevronLeft,
} from 'react-icons/hi';

const menuGroups = [
    {
        label: 'Main',
        items: [
            { key: 'dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, path: ROUTES.DASHBOARD, module: 'dashboard' },
        ],
    },
    {
        label: 'Operations',
        items: [
            {
                key: 'clients', label: 'Clients / CRM', icon: HiOutlineUsers, module: 'clients',
                children: [
                    { label: 'All Clients', path: ROUTES.CLIENTS },
                    { label: 'Segments', path: ROUTES.CLIENT_SEGMENTS },
                ],
            },
            {
                key: 'bookings', label: 'Bookings', icon: HiOutlineCalendar, module: 'bookings',
                children: [
                    { label: 'All Bookings', path: ROUTES.BOOKINGS },
                    { label: 'Calendar View', path: ROUTES.BOOKING_CALENDAR },
                    { label: 'Walk-in Queue', path: ROUTES.WALK_IN_QUEUE },
                ],
            },
            {
                key: 'pos', label: 'POS & Billing', icon: HiOutlineCreditCard, module: 'pos',
                children: [
                    { label: 'Point of Sale', path: ROUTES.POS },
                    { label: 'Bill History', path: ROUTES.BILL_HISTORY },
                ],
            },
            { key: 'services', label: 'Services', icon: HiOutlineScissors, path: ROUTES.SERVICES, module: 'services' },
        ],
    },
    {
        label: 'Inventory & Supply',
        items: [
            { key: 'products', label: 'Products', icon: HiOutlineShoppingBag, path: ROUTES.PRODUCTS, module: 'products' },
            {
                key: 'inventory', label: 'Inventory', icon: HiOutlineClipboardList, module: 'inventory',
                children: [
                    { label: 'Stock Overview', path: ROUTES.INVENTORY },
                    { label: 'Stock Movements', path: ROUTES.STOCK_MOVEMENTS },
                    { label: 'Audit', path: ROUTES.INVENTORY_AUDIT },
                ],
            },
            {
                key: 'suppliers', label: 'Suppliers', icon: HiOutlineTruck, module: 'suppliers',
                children: [
                    { label: 'All Suppliers', path: ROUTES.SUPPLIERS },
                    { label: 'Purchase Orders', path: ROUTES.PURCHASE_ORDERS },
                ],
            },
        ],
    },
    {
        label: 'Finance & HR',
        items: [
            {
                key: 'finance', label: 'Finance', icon: HiOutlineCurrencyDollar, module: 'finance',
                children: [
                    { label: 'Overview', path: ROUTES.FINANCE },
                    { label: 'Expenses', path: ROUTES.EXPENSES },
                    { label: 'Cash Register', path: ROUTES.CASH_REGISTER },
                    { label: 'Reconciliation', path: ROUTES.RECONCILIATION },
                ],
            },
            {
                key: 'hr', label: 'HR & Payroll', icon: HiOutlineUserGroup, module: 'hr',
                children: [
                    { label: 'Employees', path: ROUTES.EMPLOYEES },
                    { label: 'Attendance', path: ROUTES.ATTENDANCE },
                    { label: 'Shifts', path: ROUTES.SHIFTS },
                    { label: 'Payroll', path: ROUTES.PAYROLL },
                ],
            },
        ],
    },
    {
        label: 'Engagement',
        items: [
            { key: 'loyalty', label: 'Loyalty & Referrals', icon: HiOutlineStar, path: ROUTES.LOYALTY, module: 'loyalty' },
            { key: 'promotions', label: 'Promotions', icon: HiOutlineGift, path: ROUTES.PROMOTIONS, module: 'promotions' },
            { key: 'membership', label: 'Memberships', icon: HiOutlineTicket, path: ROUTES.MEMBERSHIPS, module: 'membership' },
            {
                key: 'marketing', label: 'Marketing', icon: HiOutlineSpeakerphone, module: 'marketing',
                children: [
                    { label: 'Campaigns', path: ROUTES.CAMPAIGNS },
                    { label: 'Templates', path: ROUTES.TEMPLATES },
                ],
            },
            { key: 'feedback', label: 'Feedback', icon: HiOutlineChatAlt2, path: ROUTES.FEEDBACK, module: 'feedback' },
        ],
    },
    {
        label: 'Reports',
        items: [
            {
                key: 'analytics', label: 'Analytics', icon: HiOutlineChartBar, module: 'analytics',
                children: [
                    { label: 'Revenue Report', path: ROUTES.REVENUE_REPORT },
                    { label: 'Outlet Analytics', path: ROUTES.OUTLET_ANALYTICS },
                    { label: 'Employee Analytics', path: ROUTES.EMPLOYEE_ANALYTICS },
                    { label: 'Client Analytics', path: ROUTES.CLIENT_ANALYTICS },
                    { label: 'Item Sales', path: ROUTES.ITEM_SALES },
                ],
            },
        ],
    },
    {
        label: 'Admin',
        items: [
            { key: 'subscription', label: 'Subscriptions', icon: HiOutlineCollection, path: ROUTES.SUBSCRIPTIONS, module: 'subscription' },
            { key: 'outlets', label: 'Outlets', icon: HiOutlineOfficeBuilding, path: ROUTES.OUTLETS, module: 'outlets' },
            { key: 'users', label: 'Users & Staff', icon: HiOutlineUsers, path: ROUTES.USERS, module: 'users' },
            {
                key: 'settings', label: 'Settings', icon: HiOutlineCog, module: 'settings',
                children: [
                    { label: 'General', path: ROUTES.SETTINGS_GENERAL },
                    { label: 'Branding', path: ROUTES.SETTINGS_BRANDING },
                    { label: 'Tax Config', path: ROUTES.SETTINGS_TAX },
                    { label: 'Payments', path: ROUTES.SETTINGS_PAYMENT },
                    { label: 'Integrations', path: ROUTES.SETTINGS_INTEGRATIONS },
                ],
            },
        ],
    },
];

const SidebarItem = ({ item, collapsed }) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    const isActive = hasChildren
        ? item.children.some((child) => location.pathname === child.path)
        : location.pathname === item.path;

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 cursor-pointer group
            ${isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
                        }
          `}
                >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <HiOutlineChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            />
                        </>
                    )}
                </button>
                <AnimatePresence>
                    {open && !collapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-border-light dark:border-border-dark pl-3">
                                {item.children.map((child) => (
                                    <NavLink
                                        key={child.path}
                                        to={child.path}
                                        className={({ isActive: active }) => `
                      block px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                      ${active
                                                ? 'text-primary bg-primary/5'
                                                : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                            }
                    `}
                                    >
                                        {child.label}
                                    </NavLink>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <NavLink
            to={item.path}
            className={({ isActive: active }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-200 group
        ${active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white'
                }
      `}
        >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );
};

const Sidebar = ({ collapsed, onToggle }) => {
    const { hasAccess } = usePermission();

    return (
        <aside
            className={`
        fixed left-0 top-0 bottom-0 z-40
        bg-white dark:bg-dark-card
        border-r border-border-light dark:border-border-dark
        transition-all duration-300 ease-in-out
        flex flex-col
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
        >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark flex-shrink-0">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary dark:text-white">SalonCRM</span>
                    </motion.div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
                {menuGroups.map((group) => {
                    const visibleItems = group.items.filter((item) => hasAccess(item.module));
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.label}>
                            {!collapsed && (
                                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visibleItems.map((item) => (
                                    <SidebarItem key={item.key} item={item} collapsed={collapsed} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t border-border-light dark:border-border-dark p-3 flex-shrink-0">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                    <HiOutlineChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
