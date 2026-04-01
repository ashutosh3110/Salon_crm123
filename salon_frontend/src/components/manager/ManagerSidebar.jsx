import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, BarChart3, CalendarCheck, Star,
    Clock, Target, Settings, LogOut, ChevronLeft, ChevronRight, X, Briefcase, Globe, LifeBuoy, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/manager' },
    { label: 'Team', icon: Users, path: '/manager/team' },
    { label: 'Performance', icon: BarChart3, path: '/manager/performance' },
    { label: 'Attendance', icon: CalendarCheck, path: '/manager/attendance' },
    { label: 'Targets', icon: Target, path: '/manager/targets' },
    { label: 'Feedback', icon: Star, path: '/manager/feedback' },
    { label: 'Shift Planning', icon: Clock, path: '/manager/shifts' },
    { label: 'Service Approvals', icon: CheckCircle2, path: '/manager/approvals' },
    { label: 'Digital Catalogue', icon: Briefcase, path: '/manager/catalogue' },
    { label: 'Settings', icon: Settings, path: '/manager/settings' },
    { label: 'Support', icon: LifeBuoy, path: '/manager/support' },
];

export default function ManagerSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isHovered, setIsHovered }) {
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
        if (path === '/manager' && location.pathname === '/manager') return true;
        if (path !== '/manager' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-background transition-colors duration-300">
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border/40">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="w-45 h-45 flex items-center justify-center shrink-0">
                        <img
                            src="/2-removebg-preview.png"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
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
                            key={item.path}
                            to={item.path}
                            end={item.path === '/manager'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${isItemActive
                                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${effectiveCollapsed ? 'justify-center px-0' : ''}`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
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
                
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-surface border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-lg z-50 rounded-none "
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
            </aside>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

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
