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
        <div className="min-h-screen bg-surface admin-panel">
            {/* Global sharp-edge override for entire Admin panel */}
            <style>{`
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after {
                    border-radius: 0 !important;
                    font-family: 'Open Sans', sans-serif;
                }
                .admin-panel h1, 
                .admin-panel h2, 
                .admin-panel h3, 
                .admin-panel h4, 
                .admin-panel h5, 
                .admin-panel h6,
                .admin-panel .font-serif {
                    font-family: 'Libre Baskerville', 'Noto Serif', serif !important;
                }
                .admin-panel .font-sans {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>

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
                className={`transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
                    }`}
            >
                <Topbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 animate-reveal">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
