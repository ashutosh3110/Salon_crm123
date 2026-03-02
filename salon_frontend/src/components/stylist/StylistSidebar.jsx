import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Calendar, Users, DollarSign,
    Clock, Settings, LogOut, ChevronLeft, ChevronRight, X, Scissors, ChevronDown, User, Shield, Bell
} from 'lucide-react';

const menuItems = [
    { label: 'My Schedule', icon: Calendar, path: '/stylist' },
    { label: "Today's Clients", icon: Users, path: '/stylist/clients' },
    { label: 'Commissions', icon: DollarSign, path: '/stylist/commissions' },
    { label: 'Time Off', icon: Clock, path: '/stylist/timeoff' },
    {
        label: 'Settings',
        icon: Settings,
        path: '/stylist/settings',
        subItems: [
            { label: 'Profile', icon: User, path: '/stylist/settings/profile' },
            { label: 'Skills', icon: Scissors, path: '/stylist/settings/skills' },
            { label: 'Availability', icon: Bell, path: '/stylist/settings/availability' },
            { label: 'Security', icon: Shield, path: '/stylist/settings/security' },
        ]
    },
];

export default function StylistSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const { logout } = useAuth();
    const location = useLocation();
    const [expandedItem, setExpandedItem] = useState(null);

    useEffect(() => {
        // Auto-expand menu item if a sub-item is active
        menuItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => location.pathname === sub.path)) {
                setExpandedItem(item.label);
            }
        });
    }, [location.pathname]);

    const toggleExpand = (label) => {
        if (collapsed) {
            setCollapsed(false);
            setExpandedItem(label);
        } else {
            setExpandedItem(expandedItem === label ? null : label);
        }
    };

    const content = (
        <div className="flex flex-col h-full bg-background transition-colors duration-300">
            <div className={`flex items-center h-16 border-b border-border transition-all ${collapsed ? 'justify-center' : 'px-4 justify-between'}`}>
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>
                <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex w-6 h-6 rounded-full bg-surface items-center justify-center hover:bg-surface-alt">
                    {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-text-muted" /> : <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />}
                </button>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-alt">
                    <X className="w-4 h-4 text-text-muted" />
                </button>
            </div>

            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isExpanded = expandedItem === item.label && !collapsed;
                    const isActive = location.pathname === item.path || (hasSubItems && item.subItems.some(sub => location.pathname === sub.path));

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.label)}
                                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all group ${isActive
                                        ? 'text-primary bg-primary/5'
                                        : 'text-text-secondary hover:bg-surface hover:text-text'
                                        } ${collapsed ? 'justify-center' : ''}`}
                                    style={{
                                        color: isActive ? 'var(--accent-color)' : undefined,
                                        backgroundColor: isActive ? 'color-mix(in srgb, var(--accent-color), transparent 90%)' : undefined
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-[18px] h-[18px] shrink-0" />
                                        {!collapsed && <span>{item.label}</span>}
                                    </div>
                                    {!collapsed && (
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                </button>

                                {isExpanded && !collapsed && (
                                    <div className="ml-4 pl-4 border-l border-border/60 space-y-1 mt-1">
                                        {item.subItems.map((sub) => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={() => setMobileOpen(false)}
                                                className={({ isActive: isSubActive }) =>
                                                    `flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-bold transition-all ${isSubActive
                                                        ? 'text-primary bg-primary/5'
                                                        : 'text-text-muted hover:text-text hover:bg-surface'
                                                    }`
                                                }
                                                style={({ isActive: isSubActive }) => ({
                                                    color: isSubActive ? 'var(--accent-color)' : undefined,
                                                    backgroundColor: isSubActive ? 'color-mix(in srgb, var(--accent-color), transparent 90%)' : undefined
                                                })}
                                            >
                                                <sub.icon className="w-3.5 h-3.5" />
                                                <span>{sub.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink key={item.path} to={item.path} end={item.path === '/stylist'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive: isItemActive }) =>
                                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all group ${isItemActive
                                    ? 'text-white'
                                    : 'text-text-secondary hover:bg-surface hover:text-text'
                                } ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.label : undefined}
                            style={({ isActive: isItemActive }) => ({
                                backgroundColor: isItemActive ? 'var(--accent-color)' : undefined,
                                color: isItemActive ? '#fff' : undefined,
                                boxShadow: isItemActive ? '0 10px 15px -3px color-mix(in srgb, var(--accent-color), transparent 70%)' : undefined
                            })}
                        >
                            <item.icon className="w-[18px] h-[18px] shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className={`border-t border-border p-2 ${collapsed ? 'flex justify-center' : ''}`}>
                <button onClick={logout} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center' : ''}`}>
                    <LogOut className="w-[18px] h-[18px]" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <aside className={`hidden lg:block fixed top-0 left-0 h-screen z-40 border-r border-border/40 bg-background transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>{content}</aside>
            {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-60 bg-background border-r border-border/40 z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>{content}</aside>
        </>
    );
}
