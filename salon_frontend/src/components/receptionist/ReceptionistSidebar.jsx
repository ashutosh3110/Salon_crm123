import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Calendar, Users, CreditCard, ClipboardList,
    UserCheck, Settings, LogOut, ChevronLeft, ChevronRight, X, Zap, Globe
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/receptionist' },
    { label: 'Appointments', icon: Calendar, path: '/receptionist/appointments' },
    { label: 'Walk-in Queue', icon: Users, path: '/receptionist/queue' },
    { label: 'Quick Bill (POS)', icon: Zap, path: '/pos/billing', accent: true },
    { label: 'Check-in/Out', icon: UserCheck, path: '/receptionist/checkin' },
    { label: 'Digital Presence', icon: Globe, path: '/admin/digital-presence' },
    { label: 'Invoices', icon: ClipboardList, path: '/receptionist/invoices' },
    { label: 'Payments', icon: CreditCard, path: '/receptionist/payments' },
    { label: 'Petty Cash', icon: ClipboardList, path: '/receptionist/petty-cash' },
    { label: 'Settings', icon: Settings, path: '/receptionist/settings' },
];

export default function ReceptionistSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isHovered, setIsHovered }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [isLgUp, setIsLgUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const handleResize = () => {
            setIsLgUp(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isLgUp && collapsed && !isHovered;

    const isActive = (path) => {
        if (path === '/receptionist' && location.pathname === '/receptionist') return true;
        if (path !== '/receptionist' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-background transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-border/40">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <img
                            src="/2-removebg-preview.png"
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

            {/* Nav Links */}
            <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.path === '/receptionist'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group ${isItemActive
                                    ? item.accent ? 'bg-primary text-white shadow-lg' : 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${effectiveCollapsed ? 'justify-center' : ''}`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'} ${active && item.accent ? 'text-white' : ''}`}
                            />
                            {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
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
            <aside
                onMouseEnter={() => setIsHovered?.(true)}
                onMouseLeave={() => setIsHovered?.(false)}
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-background border-r border-border/40 z-40 transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-64 shadow-2xl shadow-primary/5'
                    }`}
            >
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-background border-r border-border/40 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
