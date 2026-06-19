import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, DollarSign, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StylistMobileNavbar({ setMobileOpen }) {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/stylist', exact: true },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/stylist/appointments' },
        { id: 'earnings', label: 'Earnings', icon: DollarSign, path: '/stylist/commissions' },
        { id: 'attendance', label: 'Attendance', icon: Clock, path: '/stylist/attendance' }
    ];

    const isLight = !document.documentElement.classList.contains('dark');
    const accentColor = '#1F2937'; // Dark text for active state, matching screenshot

    return (
        <nav className="fixed bottom-0 left-0 w-full lg:hidden z-[9999] bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
            <div className="flex items-center justify-around px-2 py-2 max-w-[800px] mx-auto w-full">
                {navItems.map((item) => {
                    const currentPath = location.pathname.toLowerCase().replace(/\/$/, '');
                    const targetPath = item.path.toLowerCase().replace(/\/$/, '');
                    const isActive = item.exact ? currentPath === targetPath : currentPath.startsWith(targetPath);
                    const Icon = item.icon;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            whileTap={{ scale: 0.85 }}
                            className="flex flex-col items-center gap-1 p-2 bg-transparent border-none cursor-pointer relative min-w-[64px]"
                        >
                            <div className="relative flex items-center justify-center">
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                    className={isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}
                                />
                            </div>
                            <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                                {item.label}
                            </span>
                        </motion.button>
                    );
                })}

                {/* More / Menu button */}
                <motion.button
                    onClick={() => setMobileOpen(true)}
                    whileTap={{ scale: 0.85 }}
                    className="flex flex-col items-center gap-1 p-2 bg-transparent border-none cursor-pointer relative min-w-[64px]"
                >
                    <div className="relative flex items-center justify-center">
                        <LayoutGrid size={22} strokeWidth={1.8} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="text-[10px] tracking-wide font-medium text-slate-500 dark:text-slate-400">
                        More
                    </span>
                </motion.button>
            </div>
        </nav>
    );
}
