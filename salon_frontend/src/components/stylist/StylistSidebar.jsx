import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as Icons from 'lucide-react';
import {
    ChevronLeft, ChevronRight, X, ChevronDown, LogOut, User, Shield, Info
} from 'lucide-react';
import stylistMenuData from '../../data/stylistMenu.json';

// Map icon names from JSON to actual Lucide components
const menuItems = stylistMenuData.map(item => ({
    ...item,
    icon: Icons[item.iconName] || Icons.HelpCircle,
    subItems: item.subItems?.map(sub => ({
        ...sub,
        icon: Icons[sub.iconName] || Icons.HelpCircle
    }))
}));

export default function StylistSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isHovered, setIsHovered }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState(null);
    const [isLgUp, setIsLgUp] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

    useEffect(() => {
        const handleResize = () => setIsLgUp(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const effectiveCollapsed = isLgUp && collapsed && !isHovered;

    useEffect(() => {
        menuItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => location.pathname === sub.path)) {
                setExpandedItem(item.label);
            }
        });
    }, [location.pathname]);

    const toggleExpand = (label) => {
        if (effectiveCollapsed) {
            setCollapsed(false);
            setExpandedItem(label);
        } else {
            setExpandedItem(expandedItem === label ? null : label);
        }
    };

    const isActive = (path) => {
        if (path === '/stylist') return location.pathname === '/stylist';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-background transition-all duration-300 relative border-r border-border/40">
            {/* Collapse Toggle (Desktop) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface border border-border/60 items-center justify-center shadow-lg hover:text-primary hover:border-primary transition-all z-50 group hover:scale-110"
            >
                {collapsed
                    ? <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                    : <ChevronLeft className="w-3.5 h-3.5 text-text-muted group-hover:text-primary" />
                }
            </button>

            {/* Logo Section */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-border/40">
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="w-45 h-45 flex items-center justify-center shrink-0">
                        <img
                            src="/new black wapixo logo .png"
                            alt="Salon"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                {/* Mobile close */}
                {mobileOpen && (
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-alt transition-colors"
                    >
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {menuItems.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItem === item.label && !effectiveCollapsed;
                    const active = isActive(item.path);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 group ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-secondary hover:bg-surface hover:text-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                                        />
                                        {!effectiveCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>}
                                    </div>
                                    {!effectiveCollapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {isExpanded && !effectiveCollapsed && (
                                    <div className="ml-7 pl-2 border-l border-primary/20 space-y-1 mt-1">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive: isSubActive }) =>
                                                    `flex items-center justify-between py-2 px-4 rounded-full text-[10px] font-bold transition-all duration-300 relative ${isSubActive
                                                        ? 'bg-white text-primary shadow-sm border border-primary/20 translate-x-1.5'
                                                        : 'text-text-muted hover:text-text-secondary hover:translate-x-1'
                                                    }`
                                                }
                                            >
                                                <span>{sub.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            end={item.path === '/stylist'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 group relative ${isItemActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] border border-primary/30'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                }`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <item.icon
                                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'text-text-muted group-hover:text-text-secondary'}`}
                                />
                                {!effectiveCollapsed && <span className="whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>}
                            </div>

                            {/* Badges */}
                            {!effectiveCollapsed && item.badge && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tighter ${isActive(item.path) ? "bg-white/20 text-white" : item.badge.color}`}>
                                    {item.badge.count}
                                </span>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {effectiveCollapsed && (
                                <div className="absolute left-[70px] px-3 py-2 rounded-lg bg-gray-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-2xl transition-all duration-200 border border-gray-700 translate-x-1 group-hover:translate-x-0">
                                    {item.label}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer / User Profile Chip */}
            <div className="mt-auto p-3 space-y-2 border-t border-border/40 bg-surface/30 backdrop-blur-md">
                {!effectiveCollapsed && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/60 shadow-sm hover:border-primary/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
                        <div className="w-9 h-9 flex items-center justify-center shrink-0 bg-primary/10 rounded-xl overflow-hidden border border-primary/20">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-[11px] font-black text-text truncate uppercase leading-none mb-1">{user?.name || 'Stylist Pro'}</h3>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Duty: Active</span>
                            </div>
                        </div>
                        <NavLink to="/stylist/settings" className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-primary transition-colors">
                            <Icons.Settings className="w-3.5 h-3.5" />
                        </NavLink>
                    </div>
                )}

                <button
                    onClick={logout}
                    className={`flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 group ${effectiveCollapsed ? 'justify-center' : 'text-text-secondary hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100'}`}
                >
                    <LogOut className={`w-5 h-5 shrink-0 ${effectiveCollapsed ? 'text-text-muted' : 'text-text-muted group-hover:text-red-600'}`} />
                    {!effectiveCollapsed && <span className="flex-1 text-left">Log out</span>}
                    {effectiveCollapsed && (
                        <div className="absolute left-[70px] px-3 py-2 rounded-lg bg-red-600 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] shadow-2xl transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                            Log out
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
                className={`hidden lg:block fixed top-0 left-0 h-screen bg-background z-40 transition-all duration-300 ${effectiveCollapsed ? 'w-[68px]' : 'w-64 shadow-2xl shadow-primary/5'
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-background z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
