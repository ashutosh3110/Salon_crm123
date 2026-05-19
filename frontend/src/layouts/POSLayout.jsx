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
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                html, body, .admin-panel, .admin-panel *, [role="dialog"] *, .fixed.inset-0 * {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                    letter-spacing: -0.01em;
                }

                .admin-panel {
                    --font-serif: 'Inter', sans-serif !important;
                    font-size: 18px !important;
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
                    font-size: 14.5px !important;
                    letter-spacing: 0.03em !important;
                }
                .admin-panel .text-\\[10px\\],
                [role="dialog"] .text-\\[10px\\],
                .fixed.inset-0 .text-\\[10px\\] {
                    font-size: 16px !important;
                    letter-spacing: 0.02em !important;
                }
                .admin-panel .text-\\[11px\\],
                [role="dialog"] .text-\\[11px\\],
                .fixed.inset-0 .text-\\[11px\\] {
                    font-size: 17px !important;
                    letter-spacing: 0.01em !important;
                }
                .admin-panel .text-xs {
                    font-size: 1.05rem !important; /* ~16.8px instead of 14px */
                    line-height: 1.5rem !important;
                }
                .admin-panel .text-sm {
                    font-size: 1.15rem !important; /* ~18.4px instead of 15.6px */
                    line-height: 1.75rem !important;
                }
                .admin-panel .text-base {
                    font-size: 1.28rem !important; /* ~20.5px instead of 18px */
                    line-height: 1.95rem !important;
                }
                .admin-panel .text-lg {
                    font-size: 1.45rem !important; /* ~23.2px instead of 20px */
                    line-height: 2.1rem !important;
                }
                .admin-panel .text-xl {
                    font-size: 1.7rem !important; /* ~27.2px instead of 24px */
                    line-height: 2.3rem !important;
                }
                .admin-panel .text-2xl {
                    font-size: 2.1rem !important; /* ~33.6px instead of 30px */
                    line-height: 2.5rem !important;
                }
                .admin-panel .text-3xl {
                    font-size: 2.6rem !important; /* ~41.6px instead of 36px */
                    line-height: 2.85rem !important;
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
