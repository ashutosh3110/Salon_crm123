import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import POSSidebar from '../components/pos/POSSidebar';
import POSTopbar from '../components/pos/POSTopbar';

export default function POSLayout() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1280);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1280) {
                setCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-surface">
            <POSSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div
                className={`transition-all duration-300 ${collapsed ? 'md:ml-[68px]' : 'md:ml-60'}`}
            >
                <POSTopbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
