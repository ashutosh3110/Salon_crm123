import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';
import SuperAdminTopbar from '../components/superadmin/SuperAdminTopbar';

export default function SuperAdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="sa-panel min-h-screen bg-surface">

            {/* ── Global premium typography & spacious design overrides for Super Admin panel ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

                /* --- Global Theme & Font Assignment --- */
                .sa-panel {
                    font-family: 'Poppins', 'Outfit', sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #1e293b !important;
                }
                
                .sa-panel *,
                .sa-panel *::before,
                .sa-panel *::after {
                    font-family: 'Poppins', 'Outfit', sans-serif !important;
                    letter-spacing: -0.01em;
                    font-style: normal !important; /* Strictly forbid cursive & italics */
                }

                /* --- Headers & Titles --- */
                .sa-panel h1, 
                .sa-panel h2, 
                .sa-panel h3, 
                .sa-panel h4, 
                .sa-panel h5, 
                .sa-panel h6,
                .sa-panel .font-serif,
                .sa-panel [class*="font-serif"],
                .sa-panel .italic,
                .sa-panel [class*="italic"] {
                    font-family: 'Poppins', 'Outfit', sans-serif !important;
                    font-weight: 800 !important;
                    font-style: normal !important;
                    letter-spacing: -0.025em !important;
                    color: #0f172a !important;
                }

                /* --- Global Font Size Scale Amplifiers (Big, eye-catching & readable) --- */
                .sa-panel .text-\[10px\],
                .sa-panel .text-\[10px\] * {
                    font-size: 13px !important;
                    letter-spacing: 0.04em !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                }
                .sa-panel .text-\[11px\],
                .sa-panel .text-\[11px\] * {
                    font-size: 14px !important;
                    letter-spacing: 0.03em !important;
                    font-weight: 600 !important;
                }
                .sa-panel .text-xs,
                .sa-panel .text-xs * {
                    font-size: 0.95rem !important; /* Big & highly attractive */
                    line-height: 1.45rem !important;
                }
                .sa-panel .text-sm,
                .sa-panel .text-sm * {
                    font-size: 1.05rem !important;
                    line-height: 1.65rem !important;
                }
                .sa-panel .text-base,
                .sa-panel .text-base * {
                    font-size: 1.225rem !important;
                    line-height: 1.85rem !important;
                }
                .sa-panel .text-lg,
                .sa-panel .text-lg * {
                    font-size: 1.4rem !important;
                    line-height: 2rem !important;
                }
                .sa-panel .text-xl,
                .sa-panel .text-xl * {
                    font-size: 1.7rem !important;
                    line-height: 2.35rem !important;
                }
                .sa-panel .text-2xl,
                .sa-panel .text-2xl * {
                    font-size: 2.15rem !important;
                    line-height: 2.65rem !important;
                    font-weight: 850 !important;
                    letter-spacing: -0.03em !important;
                }
                .sa-panel .text-3xl,
                .sa-panel .text-3xl * {
                    font-size: 2.65rem !important;
                    line-height: 3.25rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.04em !important;
                }

                /* --- Spacious, Clean & Beautifully Aligned Tables --- */
                .sa-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                .sa-panel table th {
                    font-size: 0.95rem !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                    color: #475569 !important; /* slate-600 */
                    background-color: #f8fafc !important; /* slate-50 */
                    padding: 1.25rem 1.6rem !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-align: left;
                }
                .sa-panel table td {
                    font-size: 1.05rem !important;
                    padding: 1.35rem 1.6rem !important; /* Generous spacious padding for perfect readability */
                    color: #334155 !important; /* slate-700 */
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    line-height: 1.55 !important;
                }
                .sa-panel table tr {
                    transition: all 0.2s ease-in-out !important;
                }
                .sa-panel table tr:hover td {
                    background-color: #f8fafc !important; /* Subtle hover state */
                }

                /* --- Form Controls, Inputs & Labels --- */
                .sa-panel label {
                    font-size: 0.85rem !important; /* ~13.6px */
                    font-weight: 600 !important;
                    color: #475569 !important; /* slate-600 */
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                .sa-panel input, 
                .sa-panel select, 
                .sa-panel textarea {
                    font-size: 0.975rem !important;
                    font-weight: 400 !important;
                    padding: 0.75rem 1rem !important; /* Roomy, clickable fields */
                    border-radius: 0.75rem !important; /* Soft premium rounded corners */
                    border: 1px solid #cbd5e1 !important;
                    color: #1e293b !important;
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                .sa-panel input:focus, 
                .sa-panel select:focus, 
                .sa-panel textarea:focus {
                    border-color: #b85c5c !important; /* Primary theme accent */
                    box-shadow: 0 0 0 4px rgba(184, 92, 92, 0.12) !important;
                    outline: none !important;
                }

                /* --- Buttons --- */
                .sa-panel button,
                .sa-panel .inline-flex {
                    font-weight: 600 !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* --- Premium Cards --- */
                .sa-panel .bg-surface {
                    background-color: #ffffff !important;
                    border: 1px solid #f1f5f9 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03), 0 12px 24px -4px rgba(0, 0, 0, 0.02) !important;
                }

                /* --- Sidebar & Navigation Items --- */
                .sa-panel aside a {
                    font-size: 0.95rem !important;
                    font-weight: 600 !important;
                    padding: 0.75rem 1rem !important;
                }
                .sa-panel aside a svg {
                    width: 1.25rem !important;
                    height: 1.25rem !important;
                }

                /* --- Soft Badges --- */
                .sa-panel .rounded-full.border {
                    padding: 0.25rem 0.75rem !important;
                    font-weight: 600 !important;
                    font-size: 0.8rem !important;
                }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
                   ========================================== */
                /* Restore brand primary color inside Super Admin Panel instead of shadcn silver override */
                .dark .sa-panel {
                    --primary: #b85c5c !important;
                    --primary-foreground: #ffffff !important;
                }

                /* Robust background overrides in Dark Mode */
                .dark .sa-panel .bg-white,
                .dark .sa-panel .bg-surface,
                .dark .sa-panel .bg-background,
                .dark .sa-panel .bg-slate-50,
                .dark .sa-panel .bg-slate-100,
                .dark .sa-panel .bg-gray-50,
                .dark .sa-panel .bg-gray-100,
                .dark .sa-panel [class*="bg-white"],
                .dark .sa-panel [class*="bg-surface"],
                .dark .sa-panel [class*="bg-background"],
                .dark .sa-panel [class*="bg-slate-50"],
                .dark .sa-panel [class*="bg-slate-100"],
                .dark .sa-panel [class*="bg-gray-50"],
                .dark .sa-panel [class*="bg-gray-100"],
                .dark [role="dialog"],
                .dark [role="dialog"] .bg-white,
                .dark [role="dialog"] [class*="bg-white"],
                .dark [role="dialog"] .bg-slate-50,
                .dark [role="dialog"] [class*="bg-slate-50"],
                .dark .fixed.inset-0 .bg-white,
                .dark .fixed.inset-0 [class*="bg-white"],
                .dark .fixed.inset-0 .bg-slate-50,
                .dark .fixed.inset-0 [class*="bg-slate-50"] {
                    background-color: #1e293b !important; /* slate-800 */
                }

                /* Deep slate-900 backgrounds for main page, modal overlays, inputs, etc. */
                .dark .sa-panel,
                .dark .sa-panel .bg-surface-alt,
                .dark .sa-panel [class*="bg-surface-alt"],
                .dark .sa-panel .bg-\[\#fafafa\],
                .dark .sa-panel [class*="bg-[#fafafa]"],
                .dark [class*="bg-[#fafafa]"],
                .dark .sa-panel input,
                .dark .sa-panel select,
                .dark .sa-panel textarea,
                .dark [role="dialog"] input,
                .dark [role="dialog"] select,
                .dark [role="dialog"] textarea,
                .dark .fixed.inset-0 input,
                .dark .fixed.inset-0 select,
                .dark .fixed.inset-0 textarea {
                    background-color: #121826 !important; /* slate-900 */
                }

                /* Robust border color overrides in Dark Mode */
                .dark .sa-panel .border,
                .dark .sa-panel .border-border,
                .dark .sa-panel [class*="border-border"],
                .dark .sa-panel [class*="border-r"],
                .dark .sa-panel [class*="border-b"],
                .dark .sa-panel [class*="border-t"],
                .dark .sa-panel [class*="border-l"],
                .dark .sa-panel [class*="border-2"],
                .dark .sa-panel table th,
                .dark .sa-panel table td,
                .dark [role="dialog"] .border,
                .dark [role="dialog"] [class*="border"],
                .dark .fixed.inset-0 .border,
                .dark .fixed.inset-0 [class*="border"] {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                /* Robust text color overrides in Dark Mode */
                .dark .sa-panel .text-text,
                .dark .sa-panel [class*="text-text"],
                .dark .sa-panel [class*="text-slate-900"],
                .dark .sa-panel [class*="text-slate-800"],
                .dark .sa-panel [class*="text-slate-700"],
                .dark .sa-panel [class*="text-gray-900"],
                .dark .sa-panel [class*="text-gray-800"],
                .dark .sa-panel [class*="text-gray-700"],
                .dark .sa-panel h1,
                .dark .sa-panel h2,
                .dark .sa-panel h3,
                .dark .sa-panel h4,
                .dark .sa-panel h5,
                .dark .sa-panel h6,
                .dark [role="dialog"] .text-text,
                .dark [role="dialog"] [class*="text-text"],
                .dark [role="dialog"] h1,
                .dark [role="dialog"] h2,
                .dark [role="dialog"] h3,
                .dark [role="dialog"] h4,
                .dark [role="dialog"] h5,
                .dark [role="dialog"] h6,
                .dark .fixed.inset-0 .text-text,
                .dark .fixed.inset-0 [class*="text-text"],
                .dark .fixed.inset-0 h1,
                .dark .fixed.inset-0 h2,
                .dark .fixed.inset-0 h3,
                .dark .fixed.inset-0 h4,
                .dark .fixed.inset-0 h5,
                .dark .fixed.inset-0 h6 {
                    color: #f8fafc !important; /* slate-50 */
                }

                .dark .sa-panel .text-text-secondary,
                .dark .sa-panel [class*="text-text-secondary"],
                .dark .sa-panel [class*="text-slate-600"],
                .dark .sa-panel [class*="text-slate-500"],
                .dark .sa-panel [class*="text-gray-600"],
                .dark .sa-panel [class*="text-gray-500"],
                .dark [role="dialog"] .text-text-secondary,
                .dark [role="dialog"] [class*="text-text-secondary"],
                .dark .fixed.inset-0 .text-text-secondary,
                .dark .fixed.inset-0 [class*="text-text-secondary"] {
                    color: #94a3b8 !important; /* slate-400 */
                }

                .dark .sa-panel .text-text-muted,
                .dark .sa-panel [class*="text-text-muted"],
                .dark .sa-panel [class*="text-slate-400"],
                .dark .sa-panel [class*="text-gray-400"],
                .dark [role="dialog"] .text-text-muted,
                .dark [role="dialog"] [class*="text-text-muted"],
                .dark .fixed.inset-0 .text-text-muted,
                .dark .fixed.inset-0 [class*="text-text-muted"] {
                    color: #64748b !important; /* slate-500 */
                }

                /* Ensure dark mode input placeholders and borders are clearly visible */
                .dark .sa-panel input::placeholder,
                .dark .sa-panel textarea::placeholder,
                .dark [role="dialog"] input::placeholder,
                .dark [role="dialog"] textarea::placeholder,
                .dark .fixed.inset-0 input::placeholder,
                .dark .fixed.inset-0 textarea::placeholder {
                    color: rgba(255, 255, 255, 0.35) !important;
                }

                /* --- Sidebar & Topbar dark mode overrides --- */
                .dark .sa-panel aside,
                .dark .sa-panel header,
                .dark .sa-panel aside div,
                .dark .sa-panel header div {
                    background-color: #1e293b !important; /* slate-800 background */
                    color: #f8fafc !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                /* --- Navigation elements --- */
                .dark .sa-panel aside a {
                    color: #cbd5e1 !important;
                }
                .dark .sa-panel aside a:hover {
                    background-color: #121826 !important; /* dark body bg on hover */
                    color: #ffffff !important;
                }
                .dark .sa-panel aside a.active {
                    background-color: #b85c5c !important; /* Keep primary crimson for active */
                    color: #ffffff !important;
                }

                /* --- Spacious & Beautiful Tables in Dark Mode --- */
                .dark .sa-panel table th {
                    color: #94a3b8 !important; /* slate-400 */
                    background-color: #121826 !important; /* slate-900 */
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
                }
                .dark .sa-panel table td {
                    color: #cbd5e1 !important; /* slate-300 */
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .dark .sa-panel table tr:hover td {
                    background-color: #1e293b !important;
                }

                /* --- Form Controls in Dark Mode --- */
                .dark .sa-panel label {
                    color: #94a3b8 !important; /* slate-400 */
                }
                .dark .sa-panel input:focus, 
                .dark .sa-panel select:focus, 
                .dark .sa-panel textarea:focus {
                    border-color: #b85c5c !important;
                    box-shadow: 0 0 0 4px rgba(184, 92, 92, 0.25) !important;
                }

                /* --- SVG and Recharts Ticks & Lines in Dark Mode --- */
                .dark .sa-panel .recharts-cartesian-grid-horizontal line,
                .dark .sa-panel .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .sa-panel .recharts-text {
                    fill: #94a3b8 !important;
                }
                .dark .sa-panel .recharts-legend-item-text {
                    color: #cbd5e1 !important;
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
