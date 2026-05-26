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
                    font-size: 14px !important;
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
                    font-weight: 700 !important; /* Reduced from 800/900 for cleaner aesthetics */
                }

                /* --- Global Elegant & Compact Font Size Scale --- */
                .admin-panel .text-\\[7px\\],
                .admin-panel .text-\\[8px\\],
                .admin-panel .text-\\[9px\\],
                [role="dialog"] .text-\\[7px\\],
                [role="dialog"] .text-\\[8px\\],
                [role="dialog"] .text-\\[9px\\],
                .fixed.inset-0 .text-\\[7px\\],
                .fixed.inset-0 .text-\\[8px\\],
                .fixed.inset-0 .text-\\[9px\\] {
                    font-size: 8.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 600 !important;
                }
                .admin-panel .text-\\[10px\\],
                [role="dialog"] .text-\\[10px\\],
                .fixed.inset-0 .text-\\[10px\\] {
                    font-size: 9.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 600 !important;
                }
                .admin-panel .text-\\[11px\\],
                [role="dialog"] .text-\\[11px\\],
                .fixed.inset-0 .text-\\[11px\\] {
                    font-size: 10.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 500 !important;
                }
                .admin-panel .text-xs {
                    font-size: 0.72rem !important; /* ~11.5px */
                    line-height: 1.1rem !important;
                }
                .admin-panel .text-sm {
                    font-size: 0.8rem !important; /* ~12.8px */
                    line-height: 1.25rem !important;
                }
                .admin-panel .text-base {
                    font-size: 0.9rem !important; /* ~14.5px */
                    line-height: 1.4rem !important;
                }
                .admin-panel .text-lg {
                    font-size: 1.05rem !important; /* ~16.8px */
                    line-height: 1.5rem !important;
                }
                .admin-panel .text-xl {
                    font-size: 1.2rem !important; /* ~19px */
                    line-height: 1.65rem !important;
                }
                .admin-panel .text-2xl {
                    font-size: 1.45rem !important; /* ~23px */
                    line-height: 1.9rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.015em !important;
                }
                .admin-panel .text-3xl {
                    font-size: 1.8rem !important; /* ~29px */
                    line-height: 2.2rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.02em !important;
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

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES (ALIGNED WITH MAIN ADMIN LAYOUT)
                   ========================================== */
                /* Restore brand primary color inside Admin Panel instead of shadcn silver override */
                .dark .admin-panel {
                    --primary: #B4912B !important;
                    --primary-foreground: #ffffff !important;
                    background-color: #121826 !important;
                    color: #cbd5e1 !important;
                }

                /* Robust background overrides in Dark Mode */
                .dark .admin-panel .bg-white,
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-background,
                .dark .admin-panel .bg-slate-50,
                .dark .admin-panel .bg-slate-100,
                .dark .admin-panel .bg-gray-50,
                .dark .admin-panel .bg-gray-100,
                .dark .admin-panel [class*="bg-white"],
                .dark .admin-panel [class*="bg-surface"],
                .dark .admin-panel [class*="bg-background"],
                .dark .admin-panel [class*="bg-slate-50"],
                .dark .admin-panel [class*="bg-slate-100"],
                .dark .admin-panel [class*="bg-gray-50"],
                .dark .admin-panel [class*="bg-gray-100"],
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
                .dark .admin-panel,
                .dark .admin-panel .bg-surface-alt,
                .dark .admin-panel [class*="bg-surface-alt"],
                .dark .admin-panel .bg-\[\#fafafa\],
                .dark .admin-panel [class*="bg-[#fafafa]"],
                .dark [class*="bg-[#fafafa]"],
                .dark .admin-panel input:not(.bg-transparent),
                .dark .admin-panel select:not(.bg-transparent),
                .dark .admin-panel textarea:not(.bg-transparent),
                .dark [role="dialog"] input:not(.bg-transparent),
                .dark [role="dialog"] select:not(.bg-transparent),
                .dark [role="dialog"] textarea:not(.bg-transparent),
                .dark .fixed.inset-0 input:not(.bg-transparent),
                .dark .fixed.inset-0 select:not(.bg-transparent),
                .dark .fixed.inset-0 textarea:not(.bg-transparent) {
                    background-color: #121826 !important; /* slate-900 */
                }

                /* Robust border color overrides in Dark Mode */
                .dark .admin-panel .border,
                .dark .admin-panel .border-border,
                .dark .admin-panel [class*="border-border"],
                .dark .admin-panel [class*="border-r"],
                .dark .admin-panel [class*="border-b"],
                .dark .admin-panel [class*="border-t"],
                .dark .admin-panel [class*="border-l"],
                .dark .admin-panel [class*="border-2"],
                .dark .admin-panel table th,
                .dark .admin-panel table td,
                .dark [role="dialog"] .border,
                .dark [role="dialog"] [class*="border"],
                .dark .fixed.inset-0 .border,
                .dark .fixed.inset-0 [class*="border"] {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                /* Robust text color overrides in Dark Mode */
                .dark .admin-panel .text-text,
                .dark .admin-panel [class*="text-text"],
                .dark .admin-panel [class*="text-slate-900"],
                .dark .admin-panel [class*="text-slate-800"],
                .dark .admin-panel [class*="text-slate-700"],
                .dark .admin-panel [class*="text-gray-900"],
                .dark .admin-panel [class*="text-gray-800"],
                .dark .admin-panel [class*="text-gray-700"],
                .dark .admin-panel h1,
                .dark .admin-panel h2,
                .dark .admin-panel h3,
                .dark .admin-panel h4,
                .dark .admin-panel h5,
                .dark .admin-panel h6,
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

                .dark .admin-panel .text-text-secondary,
                .dark .admin-panel [class*="text-text-secondary"],
                .dark .admin-panel [class*="text-slate-600"],
                .dark .admin-panel [class*="text-slate-500"],
                .dark .admin-panel [class*="text-gray-600"],
                .dark .admin-panel [class*="text-gray-500"],
                .dark [role="dialog"] .text-text-secondary,
                .dark [role="dialog"] [class*="text-text-secondary"],
                .dark .fixed.inset-0 .text-text-secondary,
                .dark .fixed.inset-0 [class*="text-text-secondary"] {
                    color: #94a3b8 !important; /* slate-400 */
                }

                .dark .admin-panel .text-text-muted,
                .dark .admin-panel [class*="text-text-muted"],
                .dark .admin-panel [class*="text-slate-400"],
                .dark .admin-panel [class*="text-gray-400"],
                .dark [role="dialog"] .text-text-muted,
                .dark [role="dialog"] [class*="text-text-muted"],
                .dark .fixed.inset-0 .text-text-muted,
                .dark .fixed.inset-0 [class*="text-text-muted"] {
                    color: #64748b !important; /* slate-500 */
                }

                /* Ensure dark mode input placeholders and borders are clearly visible */
                .dark .admin-panel input::placeholder,
                .dark .admin-panel textarea::placeholder,
                .dark [role="dialog"] input::placeholder,
                .dark [role="dialog"] textarea::placeholder,
                .dark .fixed.inset-0 input::placeholder,
                .dark .fixed.inset-0 textarea::placeholder {
                    color: rgba(255, 255, 255, 0.35) !important;
                }

                /* --- Sidebar & Topbar dark mode overrides --- */
                .dark .admin-panel aside,
                .dark .admin-panel header,
                .dark .admin-panel aside div,
                .dark .admin-panel header div {
                    background-color: #1e293b !important; /* slate-800 background */
                    color: #f8fafc !important;
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                /* --- Spacious & Beautiful Tables in Dark Mode --- */
                .dark .admin-panel table th {
                    color: #94a3b8 !important; /* slate-400 */
                    background-color: #121826 !important; /* slate-900 */
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
                }
                .dark .admin-panel table td {
                    color: #cbd5e1 !important; /* slate-300 */
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .dark .admin-panel table tr:hover td {
                    background-color: #1e293b !important;
                }

                /* --- Form Controls in Dark Mode --- */
                .dark .admin-panel label {
                    color: #94a3b8 !important; /* slate-400 */
                }
                .dark .admin-panel input:focus, 
                .dark .admin-panel select:focus, 
                .dark .admin-panel textarea:focus {
                    border-color: #B4912B !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.25) !important;
                }

                /* --- Primary Buttons in Dark Mode --- */
                .dark .admin-panel button.bg-primary,
                .dark .admin-panel a.bg-primary,
                .dark .admin-panel .bg-primary,
                .dark .admin-panel button[type="submit"],
                .dark .admin-panel button[class*="bg-primary"],
                .dark .admin-panel .inline-flex[class*="bg-primary"],
                .dark .admin-panel button:has(svg.lucide-plus) {
                    background: #B4912B !important;
                    color: #ffffff !important;
                    border: 1px solid #B4912B !important;
                }
                .dark .admin-panel button.bg-primary:hover,
                .dark .admin-panel a.bg-primary:hover,
                .dark .admin-panel .bg-primary:hover,
                .dark .admin-panel button[type="submit"]:hover,
                .dark .admin-panel button[class*="bg-primary"]:hover,
                .dark .admin-panel .inline-flex[class*="bg-primary"]:hover,
                .dark .admin-panel button:has(svg.lucide-plus):hover {
                    background: #C5A23C !important;
                    border-color: #C5A23C !important;
                }

                /* --- Secondary/Outline Buttons in Dark Mode --- */
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button[class*="border-"]:not(aside *),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *),
                .dark .admin-panel button:has(svg.lucide-plus):not(.bg-primary):not([class*="bg-primary"]):not(aside *),
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .dark .admin-panel button[class*="border-"]:not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *):hover,
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }

                /* POS Billing Cart Total Box High Contrast Overrides */
                html:not(.dark) .admin-panel .pos-billing-cart-total-box div,
                html:not(.dark) .admin-panel .pos-billing-cart-total-box span,
                html:not(.dark) .admin-panel .pos-billing-cart-total-box p,
                html:not(.dark) .admin-panel .pos-billing-cart-total-box select,
                html:not(.dark) .admin-panel .pos-billing-cart-total-box option,
                html:not(.dark) .admin-panel .pos-billing-cart-total-box *,
                html:not(.dark) .pos-billing-cart-total-box div,
                html:not(.dark) .pos-billing-cart-total-box span,
                html:not(.dark) .pos-billing-cart-total-box p,
                html:not(.dark) .pos-billing-cart-total-box *,
                .pos-billing-cart-total-box,
                .pos-billing-cart-total-box div,
                .pos-billing-cart-total-box span,
                .pos-billing-cart-total-box p,
                .pos-billing-cart-total-box * {
                    color: #ffffff !important; /* Force white text for subtotal, total, numbers */
                }

                /* Accent colors inside total box */
                html:not(.dark) .admin-panel .pos-billing-cart-total-box .text-emerald-400,
                html:not(.dark) .pos-billing-cart-total-box .text-emerald-400,
                .pos-billing-cart-total-box .text-emerald-400 {
                    color: #34d399 !important; /* Force emerald green for TOTAL label, discount, etc. */
                }

                html:not(.dark) .admin-panel .pos-billing-cart-total-box .text-rose-400,
                html:not(.dark) .pos-billing-cart-total-box .text-rose-400,
                .pos-billing-cart-total-box .text-rose-400 {
                    color: #fb7185 !important; /* Force rose red for dues, overpaid */
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
