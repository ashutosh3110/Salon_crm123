import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    Scissors as ScissorsIcon,
    Package,
    Store,
    UserCog,
    Tag,
    Gift,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Bell,
    Shield,
    Palette,
    ChevronDown
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Clients', icon: Users, path: '/admin/clients' },
    { label: 'Bookings', icon: CalendarCheck, path: '/admin/bookings' },
    { label: 'Services', icon: ScissorsIcon, path: '/admin/services' },
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Outlets', icon: Store, path: '/admin/outlets' },
    { label: 'Staff', icon: UserCog, path: '/admin/staff' },
    { label: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { label: 'Loyalty', icon: Gift, path: '/admin/loyalty' },
    { label: 'Invoices', icon: FileText, path: '/admin/invoices' },
    {
        label: 'Settings',
        icon: Settings,
        path: '/admin/settings',
        subItems: [
            { label: 'Profile', icon: User, path: '/admin/settings/profile' },
            { label: 'Notifications', icon: Bell, path: '/admin/settings/notifications' },
            { label: 'Security', icon: Shield, path: '/admin/settings/security' },
        ]
    },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState(null);

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
        if (collapsed) {
            setCollapsed(false);
            setExpandedItem(label);
        } else {
            setExpandedItem(expandedItem === label ? null : label);
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                        <ScissorsIcon className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
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
                    const isExpanded = expandedItem === item.label && !collapsed;
                    const active = isActive(item.path);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                                        />
                                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                    </div>
                                    {!collapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {isExpanded && !collapsed && (
                                    <div className="pl-11 space-y-1 mt-1">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive: isSubActive }) =>
                                                    `flex items-center gap-2.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${isSubActive
                                                        ? 'text-primary font-semibold'
                                                        : 'text-text-muted hover:text-text-secondary hover:bg-surface-alt'
                                                    }`
                                                }
                                            >
                                                <sub.icon className="w-3.5 h-3.5" />
                                                <span>{sub.label}</span>
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
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isItemActive
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                                }`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                            />
                            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-error/10 hover:text-error transition-all duration-200 group"
                >
                    <LogOut className="w-5 h-5 shrink-0 text-text-muted group-hover:text-error" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-border z-30 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'
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

