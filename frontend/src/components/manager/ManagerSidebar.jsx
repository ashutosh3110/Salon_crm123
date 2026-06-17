import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import {
    LayoutDashboard, Users, BarChart3, CalendarCheck, Star,
    Clock, Target, Settings, LogOut, ChevronLeft, ChevronRight, X, Briefcase, Globe, LifeBuoy, CheckCircle2, User
} from 'lucide-react';
import { buildDynamicSidebar } from '../../config/sidebarConfig';

export default function ManagerSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isHovered, setIsHovered }) {
    const { logout, user } = useAuth();
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? "/new wapixo logo .png" : "/new black wapixo logo .png";
    const location = useLocation();

    const menuItems = useMemo(() => {
        return buildDynamicSidebar('manager', user);
    }, [user]);
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
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-[#E5E7EB] dark:border-slate-800 transition-colors duration-300">
            {/* Logo area */}
            <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-[#E5E7EB] dark:border-slate-800 relative">
                <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                    <div className="w-36 h-full flex items-center justify-center shrink-0">
                        <img
                            src={logoSrc}
                            alt="Wapixo Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                
                {/* Mobile Menu Close */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isItemActive = isActive(item.path);
                    return (
                        <NavLink
                            key={item.label || item.path}
                            to={item.path}
                            end={item.path === '/manager'}
                            onClick={() => setMobileOpen(false)}
                            title={effectiveCollapsed ? item.label : undefined}
                            className={`flex items-center rounded-lg transition-all duration-200 ease-out group relative
                                ${effectiveCollapsed ? 'justify-center h-9 w-9 mx-auto' : 'px-3 py-[7px] gap-2.5'}
                                ${isItemActive
                                    ? 'sidebar-active bg-[#C89B2B] text-white shadow-sm shadow-[#C89B2B]/20'
                                    : 'text-[#4B5563] dark:text-slate-300 hover:bg-[#C89B2B]/[0.06] dark:hover:bg-slate-700/50 hover:text-[#C89B2B]'
                                }`}
                        >
                            <item.icon
                                className={`w-[18px] h-[18px] shrink-0 sidebar-svg-icon transition-colors ${isItemActive ? 'text-white' : ''}`}
                            />
                            {!effectiveCollapsed && (
                                <div className="flex flex-1 items-center justify-between">
                                    <span className={`whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] transition-colors ${isItemActive ? '!text-white' : 'text-[#374151] dark:text-slate-300 group-hover:text-[#C89B2B]'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            )}
                            
                            {/* Tooltip (collapsed) */}
                            {effectiveCollapsed && (
                                <div className="absolute left-[48px] px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-lg transition-opacity duration-150 border border-slate-700 flex items-center gap-2">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile Card */}
            {!effectiveCollapsed && (
                <div className="px-2 pb-1.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F8F9FB] dark:bg-slate-800/50 border border-[#E5E7EB] dark:border-slate-700/50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-[#C89B2B]/10 border border-[#C89B2B]/20">
                            {user?.avatar ? (
                                <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-[#C89B2B]" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-[#1F2937] dark:text-white truncate">{user?.name || 'Manager Pro'}</div>
                            <div className="text-[10px] text-[#6B7280] dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                On Duty
                            </div>
                        </div>
                        <NavLink to="/manager/settings" className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-[#C89B2B] transition-colors shrink-0 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                            <Settings className="w-3.5 h-3.5" />
                        </NavLink>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className={`border-t border-[#E5E7EB] dark:border-slate-700/50 ${effectiveCollapsed ? 'p-1.5' : 'px-3 py-2'}`}>
                <button
                    onClick={logout}
                    className={`logout-btn flex items-center rounded-lg text-[13px] font-semibold text-[#6B7280] dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all duration-200 group cursor-pointer border-0
                        ${effectiveCollapsed ? 'justify-center h-9 w-9 mx-auto relative' : 'w-full px-3 py-2 gap-2.5'}`}
                    title={effectiveCollapsed ? 'Logout' : undefined}
                >
                    <LogOut className="shrink-0 w-[18px] h-[18px] text-[#6B7280] dark:text-slate-400 group-hover:text-red-500 transition-colors sidebar-svg-icon" />
                    {!effectiveCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300 font-semibold">Logout</span>}
                    {effectiveCollapsed && (
                        <div className="absolute left-[48px] px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-lg transition-opacity border border-slate-700">
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
                onMouseEnter={() => setIsHovered?.(true)}
                onMouseLeave={() => setIsHovered?.(false)}
                className={`hidden lg:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${effectiveCollapsed ? 'w-[60px]' : 'w-[230px]'}`}
            >
                {sidebarContent}
                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-[#C89B2B] hover:text-white hover:border-[#C89B2B] transition-all shadow-lg z-50 rounded-none"
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
                className={`lg:hidden fixed top-0 left-0 h-screen w-[230px] z-50 transition-transform duration-300 bg-white dark:bg-slate-900 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
