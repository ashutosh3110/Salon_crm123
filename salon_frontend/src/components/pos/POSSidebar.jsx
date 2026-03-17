import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    CalendarDays,
    Bell,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
    { label: 'New Bill', icon: Zap, path: '/pos/billing', accent: true },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/pos' },
    { label: 'Invoices', icon: FileText, path: '/pos/invoices' },
    { label: 'Payments', icon: CreditCard, path: '/pos/payments' },
    { label: 'Refunds', icon: RefreshCcw, path: '/pos/refunds' },
    { label: 'Notifications', icon: Bell, path: '/pos/notifications' },
];

export default function POSSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { getExitPath } = useAuth();
    const [isMdUp, setIsMdUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

    useEffect(() => {
        const handleResize = () => setIsMdUp(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isMdUp && collapsed;

    const isActive = (path) => {
        if (path === '/pos') return location.pathname === '/pos';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleExit = () => {
        navigate(getExitPath());
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-background transition-colors duration-300 relative border-r border-border/40">
            {/* Desktop Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-none bg-surface border border-border items-center justify-center shadow-md hover:text-primary hover:border-primary transition-all z-50 group"
            >
                {collapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                ) : (
                    <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                )}
            </button>

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
                </div> {/* Mobile Close */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden w-10 h-10 rounded-none flex items-center justify-center hover:bg-surface transition-colors"
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
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-bold transition-all group ${active
                                ? item.accent
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'bg-primary/10 text-primary'
                                : item.accent
                                    ? 'text-primary hover:bg-primary/10'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${effectiveCollapsed ? 'justify-center' : ''}`}
                            title={effectiveCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-[18px] h-[18px] shrink-0 ${active
                                ? item.accent ? 'text-white' : 'text-primary'
                                : item.accent ? 'text-primary' : 'text-text-muted group-hover:text-text'
                                } transition-colors`} />
                            {!effectiveCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={`border-t border-border/40 p-2 ${effectiveCollapsed ? 'flex justify-center' : ''} bg-surface-alt/20`}>
                <button
                    onClick={handleExit}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-bold text-text-secondary hover:bg-primary/10 hover:text-primary transition-all w-full border border-transparent hover:border-primary/20 ${effectiveCollapsed ? 'justify-center' : ''}`}
                    title={effectiveCollapsed ? 'Exit POS' : undefined}
                >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                    {!effectiveCollapsed && <span>Exit POS</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={`hidden md:block fixed top-0 left-0 h-screen z-30 border-r border-border/40 bg-background transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-60 shadow-2xl shadow-primary/5'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-background shadow-2xl animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
}
