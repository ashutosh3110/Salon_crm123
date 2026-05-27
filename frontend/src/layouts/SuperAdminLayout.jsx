import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';
import SuperAdminTopbar from '../components/superadmin/SuperAdminTopbar';

export default function SuperAdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="sa-panel min-h-screen bg-surface">

            {/* -- Global premium typography & spacious design overrides for Super Admin panel -- */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                /* --- Global Theme & Font Assignment --- */
                html:not(.dark) .sa-panel {
                    font-family: 'Inter', sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #000000 !important;
                }
                
                .sa-panel *,
                .sa-panel *::before,
                .sa-panel *::after {
                    font-family: 'Inter', sans-serif !important;
                    letter-spacing: -0.01em;
                    font-style: normal !important; /* Strictly forbid cursive & italics */
                }

                /* --- Headers & Titles --- */
                html:not(.dark) .sa-panel h1, 
                html:not(.dark) .sa-panel h2, 
                html:not(.dark) .sa-panel h3, 
                html:not(.dark) .sa-panel h4, 
                html:not(.dark) .sa-panel h5, 
                html:not(.dark) .sa-panel h6,
                html:not(.dark) .sa-panel .font-serif,
                html:not(.dark) .sa-panel [class*="font-serif"],
                html:not(.dark) .sa-panel .italic,
                html:not(.dark) .sa-panel [class*="italic"] {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 800 !important;
                    font-style: normal !important;
                    letter-spacing: -0.025em !important;
                    color: #000000 !important;
                }

                /* --- Global Font Size Scale Amplifiers (Big, eye-catching & readable) --- */
                .sa-panel .text-\[10px\],
                .sa-panel .text-\[10px\] * {
                    font-size: 11px !important;
                    letter-spacing: 0.04em !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                }
                .sa-panel .text-\[11px\],
                .sa-panel .text-\[11px\] * {
                    font-size: 12px !important;
                    letter-spacing: 0.03em !important;
                    font-weight: 600 !important;
                }
                .sa-panel .text-xs,
                .sa-panel .text-xs * {
                    font-size: 0.85rem !important; /* Adjusted */
                    line-height: 1.25rem !important;
                }
                .sa-panel .text-sm,
                .sa-panel .text-sm * {
                    font-size: 0.95rem !important;
                    line-height: 1.45rem !important;
                }
                .sa-panel .text-base,
                .sa-panel .text-base * {
                    font-size: 1.05rem !important;
                    line-height: 1.55rem !important;
                }
                .sa-panel .text-lg,
                .sa-panel .text-lg * {
                    font-size: 1.15rem !important;
                    line-height: 1.65rem !important;
                }
                .sa-panel .text-xl,
                .sa-panel .text-xl * {
                    font-size: 1.35rem !important;
                    line-height: 1.85rem !important;
                }
                .sa-panel .text-2xl,
                .sa-panel .text-2xl * {
                    font-size: 1.6rem !important;
                    line-height: 2.1rem !important;
                    font-weight: 850 !important;
                    letter-spacing: -0.03em !important;
                }
                .sa-panel .text-3xl,
                .sa-panel .text-3xl * {
                    font-size: 1.95rem !important;
                    line-height: 2.5rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.04em !important;
                }

                /* --- Spacious, Clean & Beautifully Aligned Tables --- */
                html:not(.dark) .sa-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                html:not(.dark) .sa-panel table th {
                    font-size: 0.85rem !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                    color: #000000 !important; /* solid black */
                    background-color: #f8fafc !important; /* slate-50 */
                    padding: 1.25rem 1.6rem !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-align: left;
                }
                html:not(.dark) .sa-panel table td {
                    font-size: 0.95rem !important;
                    padding: 1.35rem 1.6rem !important; /* Generous spacious padding for perfect readability */
                    color: #000000 !important; /* solid black */
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    line-height: 1.55 !important;
                }
                html:not(.dark) .sa-panel table tr {
                    transition: all 0.2s ease-in-out !important;
                }
                html:not(.dark) .sa-panel table tr:hover td {
                    background-color: #f8fafc !important; /* Subtle hover state */
                }

                /* --- Form Controls, Inputs & Labels --- */
                html:not(.dark) .sa-panel label {
                    font-size: 0.8rem !important; /* Adjusted */
                    font-weight: 600 !important;
                    color: #000000 !important; /* solid black */
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                html:not(.dark) .sa-panel input:not(.bg-transparent), 
                html:not(.dark) .sa-panel select:not(.bg-transparent), 
                html:not(.dark) .sa-panel textarea:not(.bg-transparent) {
                    font-size: 0.9rem !important;
                    font-weight: 400 !important;
                    padding: 0.75rem 1rem !important; /* Roomy, clickable fields */
                    border-radius: 0.75rem !important; /* Soft premium rounded corners */
                    border: 1px solid #cbd5e1 !important;
                    color: #000000 !important; /* solid black */
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                html:not(.dark) .sa-panel input:focus, 
                html:not(.dark) .sa-panel select:focus, 
                html:not(.dark) .sa-panel textarea:focus {
                    border-color: #B4912B !important; /* Primary theme accent */
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.12) !important;
                    outline: none !important;
                }

                /* --- Buttons --- */
                .sa-panel button,
                .sa-panel .inline-flex {
                    font-weight: 600 !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* --- Premium Cards --- */
                html:not(.dark) .sa-panel .bg-surface {
                    background-color: #ffffff !important;
                    border: 1px solid #f1f5f9 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03), 0 12px 24px -4px rgba(0, 0, 0, 0.02) !important;
                }


                /* --- Sidebar & Navigation Items --- */
                .sa-panel aside a {
                    font-size: 0.9rem !important;
                    font-weight: 600 !important;
                    padding: 0.75rem 1rem !important;
                }
                .sa-panel aside a svg {
                    width: 1.25rem !important;
                    height: 1.25rem !important;
                }

                /* Light mode: inactive nav links — strong visible dark text */
                html:not(.dark) .sa-panel aside nav a {
                    color: #1e293b !important;
                }
                html:not(.dark) .sa-panel aside nav a svg {
                    color: #475569 !important;
                }
                /* Light mode: active nav link — gold/primary bg, white text */
                html:not(.dark) .sa-panel aside nav a[class*="bg-primary"] {
                    color: #ffffff !important;
                    background-color: #B4912B !important;
                }
                html:not(.dark) .sa-panel aside nav a[class*="bg-primary"] svg {
                    color: #ffffff !important;
                }
                /* Hover state in light mode */
                html:not(.dark) .sa-panel aside nav a:not([class*="bg-primary"]):hover {
                    color: #B4912B !important;
                    background-color: rgba(180, 145, 43, 0.08) !important;
                }
                html:not(.dark) .sa-panel aside nav a:not([class*="bg-primary"]):hover svg {
                    color: #B4912B !important;
                }
                /* Sidebar background: pure white in light mode */
                html:not(.dark) .sa-panel aside {
                    background-color: #ffffff !important;
                    border-right: 1px solid #e2e8f0 !important;
                }


                /* --- Soft Badges --- */
                .sa-panel .rounded-full.border {
                    padding: 0.25rem 0.75rem !important;
                    font-weight: 600 !important;
                    font-size: 0.75rem !important;
                }       }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
                   ========================================== */
                /* Restore brand primary color inside Super Admin Panel instead of shadcn silver override */
                .dark .sa-panel {
                    --primary: #B4912B !important;
                    --primary-foreground: #ffffff !important;
                    background-color: #121826 !important;
                    color: #cbd5e1 !important;
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
                .dark .sa-panel input:not(.bg-transparent),
                .dark .sa-panel select:not(.bg-transparent),
                .dark .sa-panel textarea:not(.bg-transparent),
                .dark [role="dialog"] input:not(.bg-transparent),
                .dark [role="dialog"] select:not(.bg-transparent),
                .dark [role="dialog"] textarea:not(.bg-transparent),
                .dark .fixed.inset-0 input:not(.bg-transparent),
                .dark .fixed.inset-0 select:not(.bg-transparent),
                .dark .fixed.inset-0 textarea:not(.bg-transparent) {
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
                    color: #e6e8bff!important; /* slate-400 */
                }

                .dark .sa-panel .text-text-muted,
                .dark .sa-panel [class*="text-text-muted"],
                .dark .sa-panel [class*="text-slate-400"],
                .dark .sa-panel [class*="text-gray-400"],
                .dark [role="dialog"] .text-text-muted,
                .dark [role="dialog"] [class*="text-text-muted"],
                .dark .fixed.inset-0 .text-text-muted,
                .dark .fixed.inset-0 [class*="text-text-muted"] {
                    color: #e6e8bff !important; /* slate-500 */
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
                    background-color: #B4912B !important; /* Keep primary gold for active */
                    color: #ffffff !important;
                }

                /* --- Spacious & Beautiful Tables in Dark Mode --- */
                .dark .sa-panel table th {
                    color: #e6e8bff!important; /* slate-400 */
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
                    color: #e6e8bff!important; /* slate-400 */
                }
                .dark .sa-panel input:focus, 
                .dark .sa-panel select:focus, 
                .dark .sa-panel textarea:focus {
                    border-color: #B4912B !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.25) !important;
                }

                /* --- SVG and Recharts Ticks & Lines in Dark Mode --- */
                .dark .sa-panel .recharts-cartesian-grid-horizontal line,
                .dark .sa-panel .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .sa-panel .recharts-text {
                    fill: #e6e8bff!important;
                }
                 .sa-panel .recharts-legend-item-text {
                    color: #cbd5e1 !important;
                }

                /* --- CustomDropdown Theme overrides --- */
                .dark .custom-dropdown-trigger {
                    background-color: #1e293b !important;
                    color: #f8fafc !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                }
                .dark .custom-dropdown-panel {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                }
                .dark .custom-dropdown-option {
                    color: #cbd5e1 !important;
                }
                .dark .custom-dropdown-option:hover {
                    background-color: #121826 !important;
                    color: #ffffff !important;
                }

                /* --- Primary Buttons in Dark Mode --- */
                .dark .sa-panel button.bg-primary,
                .dark .sa-panel a.bg-primary,
                .dark .sa-panel .bg-primary,
                .dark .sa-panel button[type="submit"],
                .dark .sa-panel button[class*="bg-primary"],
                .dark .sa-panel .inline-flex[class*="bg-primary"],
                .dark .sa-panel button:has(svg.lucide-plus) {
                    background: #B4912B !important;
                    color: #ffffff !important;
                    border: 1px solid #B4912B !important;
                }
                .dark .sa-panel button.bg-primary:hover,
                .dark .sa-panel a.bg-primary:hover,
                .dark .sa-panel .bg-primary:hover,
                .dark .sa-panel button[type="submit"]:hover,
                .dark .sa-panel button[class*="bg-primary"]:hover,
                .dark .sa-panel .inline-flex[class*="bg-primary"]:hover,
                .dark .sa-panel button:has(svg.lucide-plus):hover {
                    background: #C5A23C !important;
                    border-color: #C5A23C !important;
                }

                /* --- Secondary/Outline Buttons in Dark Mode --- */
                .dark .sa-panel button.bg-secondary:not(aside *),
                .dark .sa-panel button.border:not(aside *),
                .dark .sa-panel a.border:not(aside *),
                .dark .sa-panel button[class*="border-"]:not(aside *),
                .dark .sa-panel button:has(svg.lucide-eye):not(aside *),
                .dark .sa-panel button:has(svg.lucide-edit):not(aside *),
                .dark .sa-panel button:has(svg.lucide-trash):not(aside *),
                .dark .sa-panel button:has(svg.lucide-plus):not(.bg-primary):not([class*="bg-primary"]):not(aside *),
                .dark .sa-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .sa-panel button.bg-secondary:not(aside *):hover,
                .dark .sa-panel button.border:not(aside *):hover,
                .dark .sa-panel a.border:not(aside *):hover,
                .dark .sa-panel button[class*="border-"]:not(aside *):hover,
                .dark .sa-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .sa-panel button:has(svg.lucide-edit):not(aside *):hover,
                .dark .sa-panel button:has(svg.lucide-trash):not(aside *):hover,
                .dark .sa-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }

                /* --- Table Action Buttons Contrast Overrides in Dark Mode --- */
                .dark .sa-panel table td button.text-text-muted,
                .dark .sa-panel table td a.text-text-muted,
                .dark .sa-panel table td button.text-text-muted svg,
                .dark .sa-panel table td a.text-text-muted svg {
                    color: #cbd5e1 !important;
                }
                .dark .sa-panel table td button.text-text-muted:hover,
                .dark .sa-panel table td a.text-text-muted:hover,
                .dark .sa-panel table td button.text-text-muted:hover svg,
                .dark .sa-panel table td a.text-text-muted:hover svg {
                    color: #ffffff !important;
                }

                /* ==========================================
                   📐 COMPREHENSIVE SPACE COMPRESSION OVERRIDES
                   ========================================== */
                /* Compress main viewport margin */
                .sa-panel main {
                    padding: 0.75rem !important;
                }
                @media (min-width: 640px) {
                    .sa-panel main {
                        padding: 1rem !important;
                    }
                }

                /* Compact, Clean & Premium Table Cells (Light & Dark Mode) */
                .sa-panel table th {
                    padding: 0.5rem 0.75rem !important;
                }
                .sa-panel table td {
                    padding: 0.625rem 0.75rem !important;
                }

                /* Compress standard padding utilities specifically */
                .sa-panel .p-10 { padding: 1.25rem !important; }
                .sa-panel .p-8 { padding: 1rem !important; }
                .sa-panel .p-6 { padding: 0.75rem !important; }
                .sa-panel .p-5 { padding: 0.625rem !important; }
                
                .sa-panel .px-10 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
                .sa-panel .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
                .sa-panel .px-6 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
                .sa-panel .px-5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
                
                .sa-panel .py-12 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
                .sa-panel .py-10 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
                .sa-panel .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .sa-panel .py-6 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
                .sa-panel .py-5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
                .sa-panel .py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                .sa-panel .py-3.5 { padding-top: 0.45rem !important; padding-bottom: 0.45rem !important; }
                
                .sa-panel .pt-12 { padding-top: 1.5rem !important; }
                .sa-panel .pt-10 { padding-top: 1.25rem !important; }
                .sa-panel .pt-8 { padding-top: 1rem !important; }
                .sa-panel .pt-6 { padding-top: 0.75rem !important; }
                
                .sa-panel .pb-12 { padding-bottom: 1.5rem !important; }
                .sa-panel .pb-10 { padding-bottom: 1.25rem !important; }
                .sa-panel .pb-8 { padding-bottom: 1rem !important; }
                .sa-panel .pb-6 { padding-bottom: 0.75rem !important; }

                /* Compress vertical layout stack spacing (space-y-*) */
                .sa-panel .space-y-12 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 1.5rem !important;
                }
                .sa-panel .space-y-10 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 1.25rem !important;
                }
                .sa-panel .space-y-8 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 1rem !important;
                }
                .sa-panel .space-y-6 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.75rem !important;
                }
                .sa-panel .space-y-5 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.6rem !important;
                }
                .sa-panel .space-y-4 > :not([hidden]) ~ :not([hidden]) {
                    margin-top: 0.5rem !important;
                }

                /* Compress grid & flex gaps (gap-*) */
                .sa-panel .gap-10 { gap: 1.25rem !important; }
                .sa-panel .gap-8 { gap: 1rem !important; }
                .sa-panel .gap-6 { gap: 0.75rem !important; }
                .sa-panel .gap-5 { gap: 0.6rem !important; }
                .sa-panel .gap-4 { gap: 0.5rem !important; }


                /* Hide sidebar navigation scrollbar */
                .sa-panel aside nav::-webkit-scrollbar {
                    display: none !important;
                }
                .sa-panel aside nav {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }

                /* ==========================================
                   📐 SQUARE CORNERS — Cards, Buttons, Inputs
                   Remove all rounded corners inside sa-panel
                   (keep rounded-full for avatars/dots only)
                   ========================================== */
                .sa-panel *:not([class*="rounded-full"]):not(input[type="checkbox"]):not(input[type="radio"]) {
                    border-radius: 0 !important;
                }
                /* Keep the toggle switch pill shape */
                .sa-panel .rounded-full,
                .sa-panel [class*="rounded-full"],
                .sa-panel input[type="range"]::-webkit-slider-thumb {
                    border-radius: 9999px !important;
                }

                /* ==========================================
                   🌙 TENANTS PAGE — Dark Mode Action Button Fixes
                   ========================================== */
                /* Approve (emerald) buttons — keep their color visible in dark */
                .dark .sa-panel table td button.bg-emerald-50,
                .dark .sa-panel table td button[class*="bg-emerald-50"] {
                    background-color: rgba(16, 185, 129, 0.15) !important;
                    border-color: rgba(16, 185, 129, 0.4) !important;
                    color: #34d399 !important;
                }
                .dark .sa-panel table td button.bg-emerald-50:hover,
                .dark .sa-panel table td button[class*="bg-emerald-50"]:hover,
                .dark .sa-panel table td button.hover\:bg-emerald-500:hover {
                    background-color: #10b981 !important;
                    color: #ffffff !important;
                    border-color: #10b981 !important;
                }
                /* Reject (red) buttons — keep their color visible in dark */
                .dark .sa-panel table td button.bg-red-50,
                .dark .sa-panel table td button[class*="bg-red-50"] {
                    background-color: rgba(239, 68, 68, 0.15) !important;
                    border-color: rgba(239, 68, 68, 0.4) !important;
                    color: #f87171 !important;
                }
                .dark .sa-panel table td button.bg-red-50:hover,
                .dark .sa-panel table td button[class*="bg-red-50"]:hover,
                .dark .sa-panel table td button.hover\:bg-red-500:hover {
                    background-color: #ef4444 !important;
                    color: #ffffff !important;
                    border-color: #ef4444 !important;
                }
                /* View / Edit / Delete icon buttons in table actions */
                .dark .sa-panel table td a[class*="rounded"],
                .dark .sa-panel table td a[class*="border-border"],
                .dark .sa-panel table td button[class*="border-border"],
                .dark .sa-panel table td button[title="Edit Salon"],
                .dark .sa-panel table td button[title="Delete Salon"],
                .dark .sa-panel table td button[title="View Profile"],
                .dark .sa-panel table td a[title="View Profile"] {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .sa-panel table td a[class*="rounded"]:hover,
                .dark .sa-panel table td a[class*="border-border"]:hover,
                .dark .sa-panel table td button[class*="border-border"]:hover,
                .dark .sa-panel table td button[title="Edit Salon"]:hover,
                .dark .sa-panel table td button[title="Delete Salon"]:hover,
                .dark .sa-panel table td button[title="View Profile"]:hover,
                .dark .sa-panel table td a[title="View Profile"]:hover {
                    background-color: #0f172a !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    color: #ffffff !important;
                }
                /* Status badges (emerald-50, red-50, blue-50, amber-50 etc.) in dark mode table */
                .dark .sa-panel table td span[class*="bg-emerald-50"] {
                    background-color: rgba(16, 185, 129, 0.12) !important;
                    border-color: rgba(16, 185, 129, 0.3) !important;
                    color: #6ee7b7 !important;
                }
                .dark .sa-panel table td span[class*="bg-red-50"],
                .dark .sa-panel table td span[class*="bg-rose-50"] {
                    background-color: rgba(239, 68, 68, 0.12) !important;
                    border-color: rgba(239, 68, 68, 0.3) !important;
                    color: #fca5a5 !important;
                }
                .dark .sa-panel table td span[class*="bg-blue-50"] {
                    background-color: rgba(59, 130, 246, 0.12) !important;
                    border-color: rgba(59, 130, 246, 0.3) !important;
                    color: #93c5fd !important;
                }
                .dark .sa-panel table td span[class*="bg-amber-50"] {
                    background-color: rgba(245, 158, 11, 0.12) !important;
                    border-color: rgba(245, 158, 11, 0.3) !important;
                    color: #fcd34d !important;
                }
                .dark .sa-panel table td span[class*="bg-orange-50"] {
                    background-color: rgba(249, 115, 22, 0.12) !important;
                    border-color: rgba(249, 115, 22, 0.3) !important;
                    color: #fdba74 !important;
                }
                .dark .sa-panel table td span[class*="bg-slate-50"] {
                    background-color: rgba(148, 163, 184, 0.12) !important;
                    border-color: rgba(148, 163, 184, 0.2) !important;
                    color: #e6e8bff!important;
                }
                /* Table header white/slate bg */
                .dark .sa-panel table thead tr[class*="bg-slate-50"],
                .dark .sa-panel table thead tr[class*="bg-white"] {
                    background-color: #121826 !important;
                }
                /* Table wrapper bg (bg-white rounded-3xl on tenants) */
                .dark .sa-panel [class*="bg-white"][class*="rounded"] {
                    background-color: #1e293b !important;
                }
            `}</style>


            <SuperAdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div
                className={`transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}
            >
                <SuperAdminTopbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-3 sm:p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
