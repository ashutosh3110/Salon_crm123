import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import {
    LayoutDashboard, Calendar, Users, CreditCard, ClipboardList,
    UserCheck, Settings, LogOut, ChevronLeft, ChevronRight, X, Zap, LifeBuoy,
    MessageSquare, FileText, Banknote, User
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/receptionist' },
    { label: 'Appointments / orders', icon: Calendar, path: '/receptionist/appointments' },
    { label: 'Lead & Enquiry', icon: MessageSquare, path: '/receptionist/leads' },
    { label: 'Quick Bill', icon: Zap, path: '/pos/billing', accent: true },
    { label: 'Invoice & Payments', icon: FileText, path: '/receptionist/invoices' },
    { label: 'Settings', icon: Settings, path: '/receptionist/settings' },
    { label: 'Support', icon: LifeBuoy, path: '/receptionist/support' },
    { label: 'Pretty Cash', icon: Banknote, path: '/receptionist/petty-cash' },
    { label: 'Profile', icon: User, path: '/receptionist/profile' },
];

export default function ReceptionistSidebar({ collapsed, setCollapsed, isHovered, mobileOpen, setMobileOpen }) {
    const { logout, user } = useAuth();
    const { salon } = useBusiness();
    const { theme } = useTheme();
    const logoSrc = theme === 'dark' ? "/new wapixo logo .png" : "/new black wapixo logo .png";
    const location = useLocation();

    const [isLgUp, setIsLgUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const handleResize = () => setIsLgUp(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isLgUp && collapsed && !isHovered;

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

                /* Light Mode Sidebar Icons Visibility Fixes */
                html:not(.dark) .sidebar-container nav a svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav button svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav a svg.sidebar-svg-icon *,
                html:not(.dark) .sidebar-container nav button svg.sidebar-svg-icon * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                    fill: none !important;
                    opacity: 1 !important;
                }

                /* Hover State for inactive icons */
                html:not(.dark) .sidebar-container nav a:hover svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav button:hover svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav a:hover svg.sidebar-svg-icon *,
                html:not(.dark) .sidebar-container nav button:hover svg.sidebar-svg-icon * {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }

                /* Active state icons & text on gold background */
                html:not(.dark) .sidebar-container nav a[class*="bg-[#B4912B]"] svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav button[class*="bg-[#B4912B]"] svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav a.active svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav button.active svg.sidebar-svg-icon,
                html:not(.dark) .sidebar-container nav a[class*="bg-[#B4912B]"] svg.sidebar-svg-icon *,
                html:not(.dark) .sidebar-container nav button[class*="bg-[#B4912B]"] svg.sidebar-svg-icon *,
                html:not(.dark) .sidebar-container nav a.active svg.sidebar-svg-icon *,
                html:not(.dark) .sidebar-container nav button.active svg.sidebar-svg-icon * {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                }

                /* Active state link text color override */
                html:not(.dark) .sidebar-container nav a[class*="bg-[#B4912B]"],
                html:not(.dark) .sidebar-container nav a[class*="bg-[#B4912B]"] *,
                html:not(.dark) .sidebar-container nav a.bg-\\[\\#B4912B\\],
                html:not(.dark) .sidebar-container nav a.bg-\\[\\#B4912B\\] *,
                html:not(.dark) .sidebar-container nav a.active-submenu-item,
                html:not(.dark) .sidebar-container nav a.active-submenu-item *,
                html:not(.dark) .sidebar-container nav a.active,
                html:not(.dark) .sidebar-container nav a.active * {
                    color: #ffffff !important;
                }

                /* Dark Mode Sidebar Icons styling */
                .dark .sidebar-container nav a svg.sidebar-svg-icon,
                .dark .sidebar-container nav button svg.sidebar-svg-icon,
                .dark .sidebar-container nav a svg.sidebar-svg-icon *,
                .dark .sidebar-container nav button svg.sidebar-svg-icon * {
                    color: #94a3b8 !important;
                    stroke: #94a3b8 !important;
                }
                .dark .sidebar-container nav a:hover svg.sidebar-svg-icon,
                .dark .sidebar-container nav button:hover svg.sidebar-svg-icon,
                .dark .sidebar-container nav a:hover svg.sidebar-svg-icon *,
                .dark .sidebar-container nav button:hover svg.sidebar-svg-icon * {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }
            `}</style>

            {/* Logo */}
            <div className={`flex ${effectiveCollapsed ? 'flex-col gap-2 h-24 py-3 justify-center' : 'flex-row justify-between h-20 px-6'} items-center border-b border-[#e2e8f0] dark:border-slate-700/50 relative`}>
                <div className="flex items-center justify-center overflow-hidden">
                    <div className={`${effectiveCollapsed ? 'h-7 w-7' : 'h-16 w-40'} flex items-center justify-center shrink-0`}>
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className={`w-full h-full object-contain ${effectiveCollapsed ? '' : 'scale-150'}`}
                        />
                    </div>
                </div>
                {/* Desktop Collapse/Expand Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-[#0f172a] cursor-pointer"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-1 py-2 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const isItemActive = location.pathname === item.path || (item.path !== '/receptionist' && location.pathname.startsWith(item.path));
                    return (
                        <div key={item.label || item.path} className="space-y-0.5">
                            <NavLink
                                to={item.path}
                                end={item.path === '/receptionist'}
                                onClick={() => setMobileOpen(false)}
                                title={effectiveCollapsed ? item.label : undefined}
                                className={() => {
                                    return `flex items-center rounded-lg text-[14px] font-semibold transition-all duration-200 ease-out group relative
                                        ${effectiveCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-2 py-2 gap-2'}
                                        ${isItemActive
                                            ? 'bg-[#B4912B] text-white active'
                                            : 'bg-[#F3F4F6] dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-[#ECEEF1] dark:hover:bg-slate-700/50'
                                        }`;
                                }}
                            >
                                <item.icon
                                    className={`w-4 h-4 shrink-0 sidebar-svg-icon ${isItemActive ? 'text-white' : ''}`}
                                />
                                {!effectiveCollapsed && (
                                    <div className="flex items-center flex-1">
                                        <span className={`whitespace-nowrap font-bold !block !opacity-100 transition-colors ${isItemActive ? '!text-white' : '!text-slate-700 dark:!text-slate-300 group-hover:!text-[#B4912B]'}`}>{item.label}</span>
                                    </div>
                                )}
                                {/* Tooltip (collapsed) */}
                                {effectiveCollapsed && (
                                    <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity duration-150 border border-slate-700">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        </div>
                    );
                })}
            </nav>

            {/* User Profile Chip */}
            {!effectiveCollapsed && (
                <div className="px-2 pb-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-[#f8fafc] dark:bg-slate-800/50 border border-[#e2e8f0] dark:border-slate-700/50 shadow-sm">
                        <div className="w-8 h-8 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={salon?.logoUrl ? getImageUrl(salon.logoUrl) : logoSrc} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#0f172a] dark:text-white truncate">{user?.name || salon?.name || 'Receptionist'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'frontdesk@saloncrm.io'}</div>
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
                        <div className="absolute left-[52px] px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-xl transition-opacity border border-slate-700">
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
                className={`hidden lg:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${effectiveCollapsed ? 'w-[72px]' : 'w-[250px]'}`}
            >
                {sidebarContent}
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
                className={`lg:hidden fixed top-0 left-0 h-screen w-[250px] z-50 transition-transform duration-300 bg-white dark:bg-slate-900 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
