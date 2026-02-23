import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const effectiveCollapsed = collapsed && !isHovered;

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[68px]' : 'lg:ml-60'
                    }`}
            >
                <Topbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6 animate-reveal">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
