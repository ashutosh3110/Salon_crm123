import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Users, DollarSign, Menu } from 'lucide-react';

export default function StylistMobileNavbar({ setMobileOpen }) {
    const location = useLocation();

    const navItems = [
        { label: 'Overview', icon: LayoutDashboard, path: '/stylist', exact: true },
        { label: 'Attendance', icon: UserCheck, path: '/stylist/attendance' },
        { label: 'Clients', icon: Users, path: '/stylist/clients' },
        { label: 'Earnings', icon: DollarSign, path: '/stylist/commissions' }
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-[90] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const currentPath = location.pathname.toLowerCase().replace(/\/$/, '');
                const targetPath = item.path.toLowerCase().replace(/\/$/, '');

                let isActive = false;
                if (item.exact) {
                    isActive = currentPath === targetPath;
                } else {
                    isActive = currentPath.startsWith(targetPath);
                }

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="group flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
                    >
                        <item.icon
                            size={26}
                            color={isActive ? '#B4912B' : '#000000'}
                            className="shrink-0 mb-0.5"
                        />
                        <span className="text-[11px] font-bold" style={{ color: isActive ? '#B4912B' : '#000000' }}>
                            {item.label}
                        </span>
                    </NavLink>
                );
            })}

            {/* More / Menu button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="group flex flex-col items-center justify-center w-full h-full gap-1 transition-colors"
                style={{ color: '#000000' }}
            >
                <Menu size={26} color="#000000" className="shrink-0 mb-0.5" />
                <span className="text-[11px] font-bold" style={{ color: '#000000' }}>Menu</span>
            </button>
        </div>
    );
}
