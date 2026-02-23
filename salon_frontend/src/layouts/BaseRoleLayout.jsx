import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <SidebarComponent
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                accentColor={accentColor}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-border/40 flex items-center px-4 lg:px-6 gap-3">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden w-9 h-9 rounded-xl bg-surface flex items-center justify-center hover:bg-surface-alt transition-colors"
                    >
                        <Menu className="w-5 h-5 text-text-secondary" />
                    </button>
                    <h1 className="text-sm font-extrabold text-text tracking-tight">{title}</h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
