import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';
import SuperAdminTopbar from '../components/superadmin/SuperAdminTopbar';

export default function SuperAdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="sa-panel min-h-screen bg-surface">

            {/* ── Global sharp-edge override for entire Super Admin panel ── */}
            <style>{`
                .sa-panel *,
                .sa-panel *::before,
                .sa-panel *::after {
                    border-radius: 0 !important;
                    font-family: 'Open Sans', sans-serif;
                }
                .sa-panel h1, 
                .sa-panel h2, 
                .sa-panel h3, 
                .sa-panel h4, 
                .sa-panel h5, 
                .sa-panel h6,
                .sa-panel .font-serif {
                    font-family: 'Libre Baskerville', 'Noto Serif', serif !important;
                }
                .sa-panel .font-sans {
                    font-family: 'Open Sans', sans-serif !important;
                }
            `}</style>

            <SuperAdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div
                className={`transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}
            >
                <SuperAdminTopbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
