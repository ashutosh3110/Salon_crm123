import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Zap,
    LayoutDashboard,
    FileText,
    CreditCard,
    RefreshCcw,
    Settings,
    ChevronLeft,
    ChevronRight,
    X,
    LogOut,
} from 'lucide-react';

const menuItems = [
    { label: 'New Bill', icon: Zap, path: '/pos/billing', accent: true },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/pos' },
    { label: 'Invoices', icon: FileText, path: '/pos/invoices' },
    { label: 'Payments', icon: CreditCard, path: '/pos/payments' },
    { label: 'Refunds', icon: RefreshCcw, path: '/pos/refunds' },
    { label: 'Settings', icon: Settings, path: '/pos/settings' },
];

export default function POSSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/pos') return location.pathname === '/pos';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        window.location.href = '/admin/login';
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white relative">
            {/* Desktop Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-border items-center justify-center shadow-md hover:text-primary hover:border-primary transition-all z-50 group"
            >
                {collapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                )}
            </button>

            {/* Logo / Header */}
            <div className={`flex items-center h-16 border-b border-border transition-all duration-300 ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
                {collapsed ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-sm">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-text leading-none">POS Terminal</h2>
                            <p className="text-[10px] text-text-muted mt-0.5">Quick Billing</p>
                        </div>
                    </div>
                )}
                {/* Mobile Close */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
                >
                    <X className="w-4 h-4 text-text-muted" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                                ? item.accent
                                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                    : 'bg-primary/5 text-primary'
                                : item.accent
                                    ? 'text-primary hover:bg-primary/5'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-[18px] h-[18px] shrink-0 ${active
                                ? item.accent ? 'text-white' : 'text-primary'
                                : item.accent ? 'text-primary' : 'text-text-muted group-hover:text-text'
                                } transition-colors`} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={`border-t border-border p-2 ${collapsed ? 'flex justify-center' : ''}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Exit POS' : undefined}
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    {!collapsed && <span>Exit POS</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden md:block fixed top-0 left-0 h-screen z-30 border-r border-border bg-white transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
