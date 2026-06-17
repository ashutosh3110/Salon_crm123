import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Users, DollarSign, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
    {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        path: '/stylist',
        activeColor: '#6366f1',   // indigo
        inactiveColor: '#6B7280',
    },
    {
        id: 'attendance',
        label: 'Attendance',
        icon: UserCheck,
        path: '/stylist/attendance',
        activeColor: '#10b981',   // emerald
        inactiveColor: '#6B7280',
    },
    {
        id: 'clients',
        label: 'Clients',
        icon: Users,
        path: '/stylist/clients',
        activeColor: '#3b82f6',   // blue
        inactiveColor: '#6B7280',
    },
    {
        id: 'earnings',
        label: 'Earnings',
        icon: DollarSign,
        path: '/stylist/commissions',
        activeColor: '#f59e0b',   // amber
        inactiveColor: '#6B7280',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/stylist/settings/profile',
        matchPath: '/stylist/settings',
        activeColor: '#C89B2B',   // gold primary
        inactiveColor: '#6B7280',
    },
];

export default function StylistBottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (tab) => {
        const matchOn = tab.matchPath || tab.path;
        if (tab.id === 'overview') return location.pathname === '/stylist';
        return location.pathname.startsWith(matchOn);
    };

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999]"
            style={{
                background: 'var(--nav-bg, rgba(255,255,255,0.95))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--nav-border, rgba(0,0,0,0.08))',
                paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
            }}
        >
            {/* CSS variables for light / dark */}
            <style>{`
                .admin-panel nav {
                    --nav-bg: rgba(255,255,255,0.95);
                    --nav-border: rgba(0,0,0,0.08);
                }
                html.dark .admin-panel nav {
                    --nav-bg: rgba(15,23,42,0.97);
                    --nav-border: rgba(255,255,255,0.08);
                }
            `}</style>

            <div className="flex items-center justify-around px-2 pt-2 pb-1">
                {tabs.map((tab) => {
                    const active = isActive(tab);
                    const Icon = tab.icon;
                    const iconColor = active ? tab.activeColor : tab.inactiveColor;

                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            whileTap={{ scale: 0.85 }}
                            className="flex flex-col items-center gap-0.5 px-3 py-1 relative focus:outline-none"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            {/* Active indicator dot */}
                            {active && (
                                <motion.div
                                    layoutId="stylist-bottom-nav-indicator"
                                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                                    style={{ backgroundColor: tab.activeColor }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}

                            <Icon
                                size={20}
                                strokeWidth={active ? 2.2 : 1.7}
                                color={iconColor}
                                style={{ display: 'block', flexShrink: 0 }}
                            />

                            <span
                                style={{
                                    fontSize: '9px',
                                    fontWeight: active ? 700 : 500,
                                    color: iconColor,
                                    letterSpacing: '0.03em',
                                    textTransform: 'uppercase',
                                    fontFamily: 'Inter, sans-serif',
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {tab.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </nav>
    );
}
