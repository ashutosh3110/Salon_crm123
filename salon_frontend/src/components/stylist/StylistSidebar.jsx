import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as Icons from 'lucide-react';
import {
    ChevronLeft, ChevronRight, X, ChevronDown, LogOut
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

    const effectiveCollapsed = collapsed && !isHovered;

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
        if (path === '/stylist' && location.pathname === '/stylist') return true;
        if (path !== '/stylist' && location.pathname.startsWith(path)) return true;
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
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItem === item.label && !effectiveCollapsed;
                    const active = isActive(item.path);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group ${active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-text'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
                                        />
                                        {!effectiveCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                    </div>
                                    {!effectiveCollapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {isExpanded && !effectiveCollapsed && (
                                    <div className="ml-7 pl-2 border-l border-border/60 space-y-1 mt-1 relative">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive: isSubActive }) =>
                                                    `flex items-center justify-between py-2 px-4 rounded-full text-[11px] font-semibold transition-all duration-300 relative ${isSubActive
                                                        ? 'bg-white text-text shadow-md border border-border/50 translate-x-1.5'
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
                                `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 group ${isItemActive
                                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                }`
                            }
                        >
                            <item.icon
                                className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`}
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
