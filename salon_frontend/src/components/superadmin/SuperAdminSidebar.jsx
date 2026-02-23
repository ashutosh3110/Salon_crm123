import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Shield,
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/superadmin' },
    { label: 'Tenants', icon: Building2, path: '/superadmin/tenants' },
    { label: 'Subscriptions', icon: CreditCard, path: '/superadmin/subscriptions' },
];

export default function SuperAdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { logout } = useAuth();
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
            {/* Desktop Toggle Button - Floating style */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-border items-center justify-center shadow-md hover:text-primary hover:border-primary transition-all z-50 group"
            >
                {collapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                )}
            </button>

            {/* Logo */}
            <div className={`flex items-center h-16 border-b border-border transition-all duration-300 ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
                <div className={`flex items-center gap-3 ${collapsed ? '' : 'overflow-hidden'}`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold text-text whitespace-nowrap tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                            Super<span className="text-primary font-bold">Admin</span>
                        </span>
                    )}
                </div>

                {/* Mobile close button only */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
                >
                    <X className="w-5 h-5 text-text-muted" />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/superadmin'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive: isItemActive }) =>
                            `flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative ${collapsed ? 'justify-center h-11 w-11 mx-auto' : 'px-3 py-2.5 gap-3'} ${isItemActive
                                ? 'bg-primary/5 text-primary'
                                : 'text-text-secondary hover:bg-surface hover:text-text'
                            }`
                        }
                    >
                        <item.icon
                            className={`shrink-0 transition-colors ${collapsed ? 'w-5 h-5' : 'w-5 h-5'} ${isActive(item.path) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                        />
                        {!collapsed && (
                            <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-14 px-2 py-1 rounded bg-text text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-xl">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className={`flex items-center rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all duration-200 group ${collapsed ? 'justify-center h-11 w-11 mx-auto' : 'w-full px-3 py-2.5 gap-3'}`}
                >
                    <LogOut className={`shrink-0 transition-colors ${collapsed ? 'w-5 h-5' : 'w-5 h-5'} text-text-muted group-hover:text-red-600`} />
                    {!collapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-border z-30 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-60 bg-white border-r border-border z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
