import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, BarChart3, CalendarCheck, Star,
    Clock, Target, Settings, LogOut, ChevronLeft, ChevronRight, X, Briefcase, Globe
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
    { label: 'Digital Catalogue', icon: Globe, path: '/manager/catalogue' },
    { label: 'Settings', icon: Settings, path: '/manager/settings' },
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
        <div className="flex flex-col h-full bg-surface border-r border-border/40 transition-colors duration-300">
            {/* Logo Section */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border/40 bg-surface-alt/30">
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
                    className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 bg-surface border border-border/40 flex items-center justify-center hover:bg-surface-alt transition-colors"
                >
                    <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-text-muted" />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 sm:py-6 px-3 sm:px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.path === '/manager'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-none text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-l-2 ${isItemActive
                                    ? 'bg-primary/5 text-primary border-primary shadow-[inset_4px_0_12px_rgba(var(--color-primary-rgb),0.05)]'
                                    : 'text-text-muted border-transparent hover:bg-surface-alt hover:text-text hover:border-border'
                                } ${effectiveCollapsed ? 'justify-center px-0' : ''}`
                            }
                        >
                            <item.icon
                                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'text-text-muted'}`}
                            />
                            {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer / System Status */}
            <div className="p-3 sm:p-4 border-t border-border/40 bg-surface-alt/20">
                {!effectiveCollapsed && (
                    <div className="mb-3 sm:mb-4 px-1 sm:px-2">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 text-[7px] sm:text-[8px]">
                            <span className="font-black text-text-muted uppercase tracking-[0.2em]">System Integrity</span>
                            <span className="font-black text-emerald-500 uppercase tracking-widest">Stable</span>
                        </div>
                        <div className="w-full h-1 bg-background border border-border/10 overflow-hidden">
                            <div className="w-[94%] h-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>
                )}
                <button
                    onClick={logout}
                    className="flex items-center gap-3 sm:gap-4 w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface border border-border/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-text-muted hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20 transition-all group"
                >
                    <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform group-hover:-translate-x-1" />
                    {!effectiveCollapsed && <span>Terminate Session</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <aside
                onMouseEnter={() => setIsHovered?.(true)}
                onMouseLeave={() => setIsHovered?.(false)}
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-surface border-r border-border/40 z-40 transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-64 shadow-2xl shadow-primary/5'
                    }`}
            >
                {sidebarContent}
                
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-surface border border-border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-lg z-50 rounded-none"
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
            </aside>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-surface z-[70] transition-transform duration-500 ease-out border-r border-border/40 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
