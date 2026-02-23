import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoFull from '/2-removebg-preview.png';
import {
    LayoutDashboard, Building2, Receipt, Settings,
    LogOut, ChevronLeft, ChevronRight, X,
    BarChart3, HeadphonesIcon, PackageOpen, FileText,
} from 'lucide-react';

const menuItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/superadmin',
        badge: null,
    },
    {
        label: 'Salons',
        icon: Building2,
        path: '/superadmin/tenants',
        badge: 127,
        badgeColor: 'bg-primary/10 text-primary',
    },
    {
        label: 'Plans',
        icon: PackageOpen,
        path: '/superadmin/plans',
        badge: null,
    },
    {
        label: 'Billing',
        icon: Receipt,
        path: '/superadmin/billing',
        badge: 2,
        badgeColor: 'bg-red-100 text-red-600',
        badgeTitle: '2 failed payments',
    },
    {
        label: 'Analytics',
        icon: BarChart3,
        path: '/superadmin/analytics',
        badge: null,
    },
    {
        label: 'Settings',
        icon: Settings,
        path: '/superadmin/settings',
        badge: null,
    },
    {
        label: 'Support',
        icon: HeadphonesIcon,
        path: '/superadmin/support',
        badge: 6,
        badgeColor: 'bg-amber-100 text-amber-700',
        badgeTitle: '6 open errors',
    },
    {
        label: 'Content',
        icon: FileText,
        path: '/superadmin/content',
        badge: null,
    },
];

export default function SuperAdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/superadmin') return location.pathname === '/superadmin';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/superadmin/login';
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white relative">

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-border items-center justify-center shadow-md hover:text-primary hover:border-primary transition-all z-50 group"
            >
                {collapsed
                    ? <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                    : <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                }
            </button>

            {/* ── Logo ── */}
            <div className={`flex items-center border-b border-border transition-all duration-300 ${collapsed ? 'justify-center h-16 px-2' : 'px-5 h-20 justify-between'}`}>
                {collapsed ? (
                    /* Collapsed: just the logo, no box */
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <img
                            src={logoFull}
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                ) : (
                    /* Expanded: full brand logo — big and centered */
                    <div className="flex items-center justify-center w-full">
                        <img
                            src={logoFull}
                            alt="Wapix Logo"
                            className="h-14 w-auto object-contain animate-in fade-in duration-300"
                        />
                    </div>
                )}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors shrink-0"
                >
                    <X className="w-5 h-5 text-text-muted" />
                </button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 py-5 px-2.5 space-y-1 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/superadmin'}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.label : undefined}
                            className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3'}
                                ${active
                                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                }`}
                        >
                            {/* Active left bar */}
                            {active && !collapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-r-full" />
                            )}

                            <item.icon className={`shrink-0 w-5 h-5 transition-colors ${active ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`} />

                            {!collapsed && (
                                <span className="flex-1 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.label}
                                </span>
                            )}

                            {/* Badge (expanded only) */}
                            {!collapsed && item.badge && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-in fade-in duration-300 ${active ? 'bg-white/20 text-white' : item.badgeColor
                                    }`} title={item.badgeTitle}>
                                    {item.badge}
                                </span>
                            )}

                            {/* Badge dot (collapsed) */}
                            {collapsed && item.badge && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                            )}

                            {/* Tooltip (collapsed) */}
                            {collapsed && (
                                <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity duration-150 border border-gray-700">
                                    {item.label}
                                    {item.badge && <span className="ml-1.5 opacity-70">({item.badge})</span>}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* ── User profile chip ── */}
            {!collapsed && (
                <div className="px-3 pb-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface border border-border">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={logoFull} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-text truncate">{user?.name || 'Super Admin'}</div>
                            <div className="text-[10px] text-text-muted truncate">{user?.email || 'admin@saloncrm.io'}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
                    </div>
                </div>
            )}

            {/* ── Logout ── */}
            <div className={`border-t border-border ${collapsed ? 'p-2' : 'px-3 py-3'}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all duration-200 group
                        ${collapsed ? 'justify-center h-11 w-11 mx-auto relative' : 'w-full px-3 py-2.5 gap-3'}`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut className="shrink-0 w-5 h-5 text-text-muted group-hover:text-red-600 transition-colors" />
                    {!collapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Logout</span>}
                    {collapsed && (
                        <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity border border-gray-700">
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
            <aside className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-border z-30 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-60 bg-white border-r border-border z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>
        </>
    );
}
