import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';
import {
    LayoutDashboard, Calendar, Users, CreditCard, ClipboardList,
    UserCheck, Settings, LogOut, ChevronLeft, ChevronRight, X, Zap, LifeBuoy,
    MessageSquare, FileText, Banknote, User, Wallet
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/receptionist' },
    { label: 'Attendance', icon: Calendar, path: '/receptionist/attendance' },
    { label: 'Appointments & Orders', icon: ClipboardList, path: '/receptionist/appointments' },
    { label: 'Lead & Enquiry', icon: MessageSquare, path: '/receptionist/leads' },
    { label: 'Quick Bill', icon: Zap, path: '/receptionist/pos/billing', accent: true },
    { label: 'Invoice & Payments', icon: FileText, path: '/receptionist/invoices' },
    { label: 'Support', icon: LifeBuoy, path: '/receptionist/support' },
    { label: 'Wallet / Petty Cash', icon: Wallet, path: '/receptionist/petty-cash' },
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
        <div className="sidebar-container flex flex-col h-full bg-white dark:bg-slate-900 border-r border-[#E5E7EB] dark:border-slate-700/50 transition-all duration-300" style={{ backdropFilter: 'blur(20px)' }}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100,100,100,0.15);
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
                /* Active state: gold bg, white text & icons */
                .sidebar-container nav a.sidebar-active {
                    background-color: #C89B2B !important;
                    color: #ffffff !important;
                }
                .sidebar-container nav a.sidebar-active svg,
                .sidebar-container nav a.sidebar-active span {
                    color: #ffffff !important;
                }
                /* Inactive icons */
                html:not(.dark) .sidebar-container nav a:not(.sidebar-active) svg.sidebar-svg-icon {
                    color: #6B7280 !important;
                    stroke: #6B7280 !important;
                }
                html:not(.dark) .sidebar-container nav a:not(.sidebar-active):hover svg.sidebar-svg-icon {
                    color: #C89B2B !important;
                    stroke: #C89B2B !important;
                }
                /* Dark mode inactive icons */
                .dark .sidebar-container nav a:not(.sidebar-active) svg.sidebar-svg-icon {
                    color: #94a3b8 !important;
                    stroke: #94a3b8 !important;
                }
                .dark .sidebar-container nav a:not(.sidebar-active):hover svg.sidebar-svg-icon {
                    color: #C89B2B !important;
                    stroke: #C89B2B !important;
                }
                /* Logout hover */
                .sidebar-container .logout-btn:hover svg {
                    color: #EF4444 !important;
                    stroke: #EF4444 !important;
                }
            `}</style>

            {/* Logo Header */}
            <div className={`flex ${effectiveCollapsed ? 'flex-col gap-1.5 h-[60px] py-2 justify-center' : 'flex-row justify-between h-[56px] px-4'} items-center border-b border-[#E5E7EB] dark:border-slate-700/50 relative shrink-0`}>
                <div className="flex items-center justify-center overflow-hidden">
                    <div className={`${effectiveCollapsed ? 'h-6 w-6' : 'h-10 w-32'} flex items-center justify-center shrink-0`}>
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className={`w-full h-full object-contain ${effectiveCollapsed ? '' : 'scale-[1.3]'}`}
                        />
                    </div>
                </div>
                {/* Desktop Collapse/Expand */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const isItemActive = location.pathname === item.path || (item.path !== '/receptionist' && location.pathname.startsWith(item.path));
                    return (
                        <NavLink
                            key={item.label || item.path}
                            to={item.path}
                            end={item.path === '/receptionist'}
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
                                <span className={`whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] transition-colors ${isItemActive ? '!text-white' : 'text-[#374151] dark:text-slate-300 group-hover:text-[#C89B2B]'}`}>
                                    {item.label}
                                </span>
                            )}
                            {/* Tooltip (collapsed) */}
                            {effectiveCollapsed && (
                                <div className="absolute left-[48px] px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-lg transition-opacity duration-150 border border-slate-700">
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
                            <img src={salon?.logoUrl ? getImageUrl(salon.logoUrl) : logoSrc} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-[#1F2937] dark:text-white truncate">{user?.name || salon?.name || 'Receptionist'}</div>
                            <div className="text-[10px] text-[#6B7280] dark:text-slate-400 truncate">{user?.email || 'frontdesk@saloncrm.io'}</div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
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
                className={`hidden lg:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${effectiveCollapsed ? 'w-[60px]' : 'w-[230px]'}`}
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
                className={`lg:hidden fixed top-0 left-0 h-screen w-[230px] z-50 transition-transform duration-300 bg-white dark:bg-slate-900 shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
