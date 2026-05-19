import { useState , useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import POSTopbar from '../components/pos/POSTopbar';

export default function POSLayout() {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 1280);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
        <div className="min-h-screen bg-background admin-panel">
            {/* Global sharp-edge override for POS panel */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after {
                    font-family: 'Outfit', 'Inter', 'Open Sans', sans-serif;
                }
                .admin-panel h1, 
                .admin-panel h2, 
                .admin-panel h3, 
                .admin-panel h4, 
                .admin-panel h5, 
                .admin-panel h6,
                .admin-panel .font-serif,
                .admin-panel [class*="font-serif"],
                .admin-panel .italic,
                .admin-panel [class*="italic"] {
                    font-family: 'Outfit', 'Inter', 'Open Sans', sans-serif !important;
                    font-style: normal !important; /* Force standard, clean, non-cursive upright text */
                }
                .admin-panel .font-sans {
                    font-family: 'Outfit', 'Inter', 'Open Sans', sans-serif !important;
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

            <div
                className={`transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[270px]'}`}
            >
                <POSTopbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
