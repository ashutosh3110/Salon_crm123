import { useState , useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import POSTopbar from '../components/pos/POSTopbar';

export default function POSLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('admin_sidebar_collapsed');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSetCollapsed = (value) => {
        setCollapsed(value);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(value));
    };

    return (
        <div className="min-h-screen bg-background admin-panel">
            {/* Global sharp-edge override for POS panel */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                html, body, .admin-panel, .admin-panel *, [role="dialog"] *, .fixed.inset-0 * {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                    letter-spacing: -0.01em;
                }

                .admin-panel {
                    --font-serif: 'Inter', sans-serif !important;
                    font-size: 17px !important;
                }
                
                .admin-panel h1, 
                .admin-panel h2, 
                .admin-panel h3, 
                .admin-panel h4, 
                .admin-panel h5, 
                .admin-panel h6,
                .admin-panel .font-serif,
                .admin-panel [class*="font-serif"],
                .admin-panel .font-mono,
                .admin-panel [class*="font-mono"],
                .admin-panel .italic,
                .admin-panel [class*="italic"],
                [role="dialog"] h1,
                [role="dialog"] h2,
                [role="dialog"] h3,
                [role="dialog"] h4,
                [role="dialog"] h5,
                [role="dialog"] h6 {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                }

                /* --- Global Font Size Scale Amplifiers (Slightly larger & crisp) --- */
                .admin-panel .text-\\[7px\\],
                .admin-panel .text-\\[8px\\],
                .admin-panel .text-\\[9px\\],
                [role="dialog"] .text-\\[7px\\],
                [role="dialog"] .text-\\[8px\\],
                [role="dialog"] .text-\\[9px\\],
                .fixed.inset-0 .text-\\[7px\\],
                .fixed.inset-0 .text-\\[8px\\],
                .fixed.inset-0 .text-\\[9px\\] {
                    font-size: 13.5px !important;
                    letter-spacing: 0.03em !important;
                    font-weight: 700 !important;
                }
                .admin-panel .text-\\[10px\\],
                [role="dialog"] .text-\\[10px\\],
                .fixed.inset-0 .text-\\[10px\\] {
                    font-size: 15px !important;
                    letter-spacing: 0.02em !important;
                    font-weight: 600 !important;
                }
                .admin-panel .text-\\[11px\\],
                [role="dialog"] .text-\\[11px\\],
                .fixed.inset-0 .text-\\[11px\\] {
                    font-size: 16px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 500 !important;
                }
                .admin-panel .text-xs {
                    font-size: 1rem !important; /* 16px instead of 14px */
                    line-height: 1.5rem !important;
                }
                .admin-panel .text-sm {
                    font-size: 1.1rem !important; /* ~17.6px instead of 15.6px */
                    line-height: 1.7rem !important;
                }
                .admin-panel .text-base {
                    font-size: 1.22rem !important; /* ~19.5px instead of 18px */
                    line-height: 1.9rem !important;
                }
                .admin-panel .text-lg {
                    font-size: 1.38rem !important; /* ~22px instead of 20px */
                    line-height: 2.05rem !important;
                }
                .admin-panel .text-xl {
                    font-size: 1.63rem !important; /* ~26px instead of 24px */
                    line-height: 2.25rem !important;
                }
                .admin-panel .text-2xl {
                    font-size: 2rem !important; /* ~32px instead of 30px */
                    line-height: 2.4rem !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.025em !important;
                }
                .admin-panel .text-3xl {
                    font-size: 2.45rem !important; /* ~39.2px instead of 36px */
                    line-height: 2.75rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.03em !important;
                }

                /* ==========================================
                   📐 COMPREHENSIVE SPACE COMPRESSION OVERRIDES
                   (No font size changes — only spacing)
                   ========================================== */
                /* Compress main viewport margin */
                .admin-panel main {
                    padding: 0.75rem !important;
                }
                @media (min-width: 640px) {
                    .admin-panel main {
                        padding: 1rem !important;
                    }
                }

                /* Compact, Clean & Premium Table Cells */
                .admin-panel table th {
                    padding: 0.5rem 0.75rem !important;
                }
                .admin-panel table td {
                    padding: 0.625rem 0.75rem !important;
                }

                /* Compress standard padding utilities */
                .admin-panel .p-10 { padding: 1.25rem !important; }
                .admin-panel .p-8 { padding: 1rem !important; }
                .admin-panel .p-6 { padding: 0.75rem !important; }
                .admin-panel .p-5 { padding: 0.625rem !important; }
                .admin-panel .p-4 { padding: 0.5rem !important; }

                .admin-panel .px-10 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
                .admin-panel .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
                .admin-panel .px-6 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
                .admin-panel .px-5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
                .admin-panel .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }

                .admin-panel .py-12 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
                .admin-panel .py-10 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
                .admin-panel .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .admin-panel .py-6 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
                .admin-panel .py-5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
                .admin-panel .py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                .admin-panel .py-3\.5 { padding-top: 0.45rem !important; padding-bottom: 0.45rem !important; }

                .admin-panel .pt-12 { padding-top: 1.5rem !important; }
                .admin-panel .pt-10 { padding-top: 1.25rem !important; }
                .admin-panel .pt-8 { padding-top: 1rem !important; }
                .admin-panel .pt-6 { padding-top: 0.75rem !important; }
                .admin-panel .pt-5 { padding-top: 0.625rem !important; }

                .admin-panel .pb-12 { padding-bottom: 1.5rem !important; }
                .admin-panel .pb-10 { padding-bottom: 1.25rem !important; }
                .admin-panel .pb-8 { padding-bottom: 1rem !important; }
                .admin-panel .pb-6 { padding-bottom: 0.75rem !important; }
                .admin-panel .pb-5 { padding-bottom: 0.625rem !important; }

                .admin-panel .pl-12 { padding-left: 1.5rem !important; }

                /* Compress margin utilities */
                .admin-panel .mt-10 { margin-top: 1.25rem !important; }
                .admin-panel .mt-8 { margin-top: 1rem !important; }
                .admin-panel .mt-6 { margin-top: 0.75rem !important; }
                .admin-panel .mt-5 { margin-top: 0.625rem !important; }
                .admin-panel .mt-4 { margin-top: 0.5rem !important; }

                .admin-panel .mb-10 { margin-bottom: 1.25rem !important; }
                .admin-panel .mb-8 { margin-bottom: 1rem !important; }
                .admin-panel .mb-6 { margin-bottom: 0.75rem !important; }
                .admin-panel .mb-5 { margin-bottom: 0.625rem !important; }
                .admin-panel .mb-4 { margin-bottom: 0.5rem !important; }

                .admin-panel .mx-10 { margin-left: 1.25rem !important; margin-right: 1.25rem !important; }
                .admin-panel .mx-8 { margin-left: 1rem !important; margin-right: 1rem !important; }
                .admin-panel .mx-6 { margin-left: 0.75rem !important; margin-right: 0.75rem !important; }
                .admin-panel .mx-5 { margin-left: 0.625rem !important; margin-right: 0.625rem !important; }
                .admin-panel .mx-4 { margin-left: 0.5rem !important; margin-right: 0.5rem !important; }

                .admin-panel .my-10 { margin-top: 1.25rem !important; margin-bottom: 1.25rem !important; }
                .admin-panel .my-8 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
                .admin-panel .my-6 { margin-top: 0.75rem !important; margin-bottom: 0.75rem !important; }
                .admin-panel .my-5 { margin-top: 0.625rem !important; margin-bottom: 0.625rem !important; }
                .admin-panel .my-4 { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }

                /* Compress vertical layout stack spacing */
                .admin-panel .space-y-8 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 1rem !important;
                }
                .admin-panel .space-y-6 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.75rem !important;
                }
                .admin-panel .space-y-5 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.6rem !important;
                }
                .admin-panel .space-y-4 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.5rem !important;
                }
                .admin-panel .space-y-3 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.4rem !important;
                }
                .admin-panel .space-y-2 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.3rem !important;
                }
                .admin-panel .space-y-1 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.2rem !important;
                }

                /* Compress grid & flex gaps */
                .admin-panel .gap-10 { gap: 1.25rem !important; }
                .admin-panel .gap-8 { gap: 1rem !important; }
                .admin-panel .gap-6 { gap: 0.75rem !important; }
                .admin-panel .gap-5 { gap: 0.6rem !important; }
                .admin-panel .gap-4 { gap: 0.5rem !important; }
                .admin-panel .gap-3 { gap: 0.4rem !important; }
                .admin-panel .gap-2 { gap: 0.3rem !important; }

                /* Compress sidebar nav items */
                .admin-panel aside nav a,
                .admin-panel aside nav button {
                    padding: 0.35rem 0.75rem !important;
                }
                .admin-panel aside nav a svg,
                .admin-panel aside nav button svg {
                    width: 1.1rem !important;
                    height: 1.1rem !important;
                }

                /* Hide sidebar scrollbar */
                .admin-panel aside nav::-webkit-scrollbar {
                    display: none !important;
                }
                .admin-panel aside nav {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }

                /* Compress sidebar logo area */
                .admin-panel aside .h-20 {
                    height: 3.5rem !important;
                }

                /* Compress topbar */
                .admin-panel header.h-16 {
                    height: 3rem !important;
                }
            `}</style>
            <Sidebar
                collapsed={collapsed}
                setCollapsed={handleSetCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div
                className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[270px]'}`}
            >
                <POSTopbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
