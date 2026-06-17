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
                html {
                    overscroll-behavior-y: none !important;
                }
                
                html:not(.dark) .sa-panel {
                    font-family: 'Inter', sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #000000 !important;
                    --primary: #B4912B !important;
                    --primary-foreground: #ffffff !important;
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
                /* --- Headers & Titles (Completely Clean & Standard) --- */
                .sa-panel h1, 
                .sa-panel h2, 
                .sa-panel h3, 
                .sa-panel h4, 
                .sa-panel h5, 
                .sa-panel h6,
                .sa-panel .font-serif,
                .sa-panel [class*="font-serif"],
                .sa-panel .font-mono,
                .sa-panel [class*="font-mono"],
                .sa-panel .italic,
                .sa-panel [class*="italic"],
                [role="dialog"] h1,
                [role="dialog"] h2,
                [role="dialog"] h3,
                [role="dialog"] h4,
                [role="dialog"] h5,
                [role="dialog"] h6 {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                    font-weight: 700 !important; /* Reduced from 800/900 for cleaner aesthetics */
                    letter-spacing: -0.02em !important;
                }

                /* --- Global Elegant & Compact Font Size Scale --- */
                .sa-panel .text-\[7px\],
                .sa-panel .text-\[8px\],
                .sa-panel .text-\[9px\],
                [role="dialog"] .text-\[7px\],
                [role="dialog"] .text-\[8px\],
                [role="dialog"] .text-\[9px\],
                .fixed.inset-0 .text-\[7px\],
                .fixed.inset-0 .text-\[8px\],
                .fixed.inset-0 .text-\[9px\] {
                    font-size: 8.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 600 !important;
                }
                .sa-panel .text-\[10px\],
                [role="dialog"] .text-\[10px\],
                .fixed.inset-0 .text-\[10px\] {
                    font-size: 9.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 600 !important;
                }
                .sa-panel .text-\[11px\],
                [role="dialog"] .text-\[11px\],
                .fixed.inset-0 .text-\[11px\] {
                    font-size: 10.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 500 !important;
                }
                .sa-panel .text-xs {
                    font-size: 0.72rem !important; /* ~11.5px */
                    line-height: 1.1rem !important;
                }
                .sa-panel .text-sm {
                    font-size: 0.8rem !important; /* ~12.8px */
                    line-height: 1.25rem !important;
                }
                .sa-panel .text-base {
                    font-size: 0.9rem !important; /* ~14.5px */
                    line-height: 1.4rem !important;
                }
                .sa-panel .text-lg {
                    font-size: 1.05rem !important; /* ~16.8px */
                    line-height: 1.5rem !important;
                }
                .sa-panel .text-xl {
                    font-size: 1.2rem !important; /* ~19px */
                    line-height: 1.65rem !important;
                }
                .sa-panel .text-2xl {
                    font-size: 1.45rem !important; /* ~23px */
                    line-height: 1.9rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.015em !important;
                }
                .sa-panel .text-3xl {
                    font-size: 1.8rem !important; /* ~29px */
                    line-height: 2.2rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.02em !important;
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
                    color: #cbd5e1!important; /* slate-400 */
                }

                .dark .sa-panel .text-text-muted,
                .dark .sa-panel [class*="text-text-muted"],
                .dark .sa-panel [class*="text-slate-400"],
                .dark .sa-panel [class*="text-gray-400"],
                .dark [role="dialog"] .text-text-muted,
                .dark [role="dialog"] [class*="text-text-muted"],
                .dark .fixed.inset-0 .text-text-muted,
                .dark .fixed.inset-0 [class*="text-text-muted"] {
                    color: #94a3b8 !important; /* slate-500 */
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
                    color: #cbd5e1!important; /* slate-400 */
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
                    color: #cbd5e1!important; /* slate-400 */
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
                    fill: #94a3b8!important;
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
                .dark .sa-panel button[class~="bg-primary"],
                .dark .sa-panel .inline-flex[class~="bg-primary"],
                .dark .sa-panel button:has(svg.lucide-plus) {
                    background: #B4912B !important;
                    color: #ffffff !important;
                    border: 1px solid #B4912B !important;
                }
                .dark .sa-panel button.bg-primary:hover,
                .dark .sa-panel a.bg-primary:hover,
                .dark .sa-panel .bg-primary:hover,
                .dark .sa-panel button[type="submit"]:hover,
                .dark .sa-panel button[class~="bg-primary"]:hover,
                .dark .sa-panel .inline-flex[class~="bg-primary"]:hover,
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
                .dark .sa-panel button:has(svg.lucide-plus):not(.bg-primary):not([class~="bg-primary"]):not(aside *),
                .dark .sa-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class~="bg-primary"]) {
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
                   📐 SQUARE CORNERS — Removed
                   ========================================== */
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
                    color: #cbd5e1!important;
                }
                /* Table header white/slate bg */
                .dark .sa-panel table thead tr[class*="bg-slate-50"],
                .dark .sa-panel table thead tr[class*="bg-white"] {
                    background-color: #121826 !important;
                }
                 .dark .sa-panel [class*="bg-white"][class*="rounded"] {
                    background-color: #1e293b !important;
                }

                /* --- BULLETPROOF LIGHT MODE SVG COLOR & STROKE VISIBILITY SYSTEM --- */
                /* By default, force all SVG icons and their paths to be dark slate/black in light mode for 100% visibility, EXCEPT those with inline style colors/strokes or text/stroke classes */
                html:not(.dark) .sa-panel svg:not(.recharts-surface):not([class*="recharts"]):not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]):not(.sa-chart-container *),
                html:not(.dark) .sa-panel svg:not(.recharts-surface):not([class*="recharts"]):not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]):not(.sa-chart-container *) * {
                    color: #1e293b !important;
                    stroke: #1e293b !important;
                }

                /* --- SUPERADMIN CHARTS: Specific overrides for lines, dots, ticks, and grids --- */
                /* Mrr/Income chart line and dots */
                html:not(.dark) .mrr-chart .recharts-curve,
                html:not(.dark) .mrr-chart path.recharts-curve {
                    stroke: #B4912B !important;
                    stroke-width: 2.5px !important;
                    fill: none !important;
                }
                html:not(.dark) .mrr-chart .recharts-area-area,
                html:not(.dark) .mrr-chart path.recharts-area-area {
                    stroke: none !important;
                    fill: url(#revGrad) !important;
                }
                html:not(.dark) .mrr-chart .recharts-dot circle,
                html:not(.dark) .mrr-chart .recharts-area-dot circle {
                    fill: #B4912B !important;
                    stroke: #ffffff !important;
                }
                /* Churn chart line */
                html:not(.dark) .churn-chart .recharts-curve,
                html:not(.dark) .churn-chart path.recharts-curve {
                    stroke: #f59e0b !important;
                    stroke-width: 2.5px !important;
                    fill: none !important;
                }
                /* General ticks, text, and grids inside sa-chart-container */
                .sa-chart-container .recharts-text,
                .sa-chart-container .recharts-cartesian-axis-tick-value,
                .sa-chart-container text,
                .sa-chart-container tspan {
                    fill: #94a3b8 !important;
                    stroke: none !important;
                    font-weight: 400 !important;
                    font-size: 10px !important;
                }
                html:not(.dark) .sa-chart-container .recharts-cartesian-grid-horizontal line,
                html:not(.dark) .sa-chart-container .recharts-cartesian-grid line {
                    stroke: #B4912B !important;
                    stroke-opacity: 0.1 !important;
                }
                html:not(.dark) .sa-chart-container .recharts-cartesian-axis-line {
                    stroke: #B4912B !important;
                    stroke-width: 1px !important;
                    opacity: 0.25 !important;
                }

                /* Respect inline style colors or strokes, but ensure children paths inherit them properly */
                html:not(.dark) .sa-panel svg[style*="color"] *,
                html:not(.dark) .sa-panel svg[style*="stroke"] * {
                    stroke: currentColor !important;
                }

                /* Respect text/stroke color classes (including custom hex codes like text-[#7C3AED]) on SVGs or their parent containers */
                html:not(.dark) .sa-panel [class*="text-"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-"] * {
                    stroke: currentColor !important;
                }
                html:not(.dark) .sa-panel [class*="stroke-"] svg *,
                html:not(.dark) .sa-panel svg[class*="stroke-"] * {
                    stroke: currentColor !important;
                }

                /* EXCEPT if the SVG or its parent has a green/emerald text class, force it to green */
                html:not(.dark) .sa-panel [class*="text-emerald"] svg,
                html:not(.dark) .sa-panel [class*="text-emerald"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-emerald"],
                html:not(.dark) .sa-panel svg[class*="text-emerald"] *,
                html:not(.dark) .sa-panel [class*="text-green"] svg,
                html:not(.dark) .sa-panel [class*="text-green"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-green"],
                html:not(.dark) .sa-panel svg[class*="text-green"] * {
                    color: #059669 !important;
                    stroke: #059669 !important;
                }

                /* EXCEPT if the SVG or its parent has a red/rose text class, force it to red */
                html:not(.dark) .sa-panel [class*="text-rose"] svg,
                html:not(.dark) .sa-panel [class*="text-rose"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-rose"],
                html:not(.dark) .sa-panel svg[class*="text-rose"] *,
                html:not(.dark) .sa-panel [class*="text-red"] svg,
                html:not(.dark) .sa-panel [class*="text-red"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-red"],
                html:not(.dark) .sa-panel svg[class*="text-red"] * {
                    color: #dc2626 !important;
                    stroke: #dc2626 !important;
                }

                /* EXCEPT if the SVG or its parent has a gold/amber/yellow text class, force it to gold */
                html:not(.dark) .sa-panel [class*="text-amber"] svg,
                html:not(.dark) .sa-panel [class*="text-amber"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-amber"],
                html:not(.dark) .sa-panel svg[class*="text-amber"] *,
                html:not(.dark) .sa-panel [class*="text-yellow"] svg,
                html:not(.dark) .sa-panel [class*="text-yellow"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-yellow"],
                html:not(.dark) .sa-panel svg[class*="text-yellow"] *,
                html:not(.dark) .sa-panel [class*="text-primary"] svg,
                html:not(.dark) .sa-panel [class*="text-primary"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-primary"],
                html:not(.dark) .sa-panel svg[class*="text-primary"] * {
                    color: #b45309 !important;
                    stroke: #b45309 !important;
                }

                /* EXCEPT if the SVG or its parent has a blue/indigo text class, force it to blue */
                html:not(.dark) .sa-panel [class*="text-blue"] svg,
                html:not(.dark) .sa-panel [class*="text-blue"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-blue"],
                html:not(.dark) .sa-panel svg[class*="text-blue"] *,
                html:not(.dark) .sa-panel [class*="text-indigo"] svg,
                html:not(.dark) .sa-panel [class*="text-indigo"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-indigo"],
                html:not(.dark) .sa-panel svg[class*="text-indigo"] * {
                    color: #2563eb !important;
                    stroke: #2563eb !important;
                }

                /* EXCEPT if the SVG or its parent has a purple/violet text class, force it to purple */
                html:not(.dark) .sa-panel [class*="text-purple"] svg,
                html:not(.dark) .sa-panel [class*="text-purple"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-purple"],
                html:not(.dark) .sa-panel svg[class*="text-purple"] *,
                html:not(.dark) .sa-panel [class*="text-violet"] svg,
                html:not(.dark) .sa-panel [class*="text-violet"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-violet"],
                html:not(.dark) .sa-panel svg[class*="text-violet"] * {
                    color: #7c3aed !important;
                    stroke: #7c3aed !important;
                }

                /* EXCEPT if the SVG or its parent has an orange text class, force it to orange */
                html:not(.dark) .sa-panel [class*="text-orange"] svg,
                html:not(.dark) .sa-panel [class*="text-orange"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-orange"],
                html:not(.dark) .sa-panel svg[class*="text-orange"] * {
                    color: #ea580c !important;
                    stroke: #ea580c !important;
                }

                /* EXCEPT if the SVG or its parent has a slate/gray text class, force it to slate/gray */
                html:not(.dark) .sa-panel [class*="text-slate"] svg,
                html:not(.dark) .sa-panel [class*="text-slate"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-slate"],
                html:not(.dark) .sa-panel svg[class*="text-slate"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }
                html:not(.dark) .sa-panel [class*="text-gray"] svg,
                html:not(.dark) .sa-panel [class*="text-gray"] svg *,
                html:not(.dark) .sa-panel svg[class*="text-gray"],
                html:not(.dark) .sa-panel svg[class*="text-gray"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }

                /* EXCEPT if the SVG is inside a soft colored background container, force matching color */
                html:not(.dark) .sa-panel [class*="bg-emerald-"] svg,
                html:not(.dark) .sa-panel [class*="bg-emerald-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-green-"] svg,
                html:not(.dark) .sa-panel [class*="bg-green-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-[#DCFCE7]"] svg,
                html:not(.dark) .sa-panel [class*="bg-[#DCFCE7]"] svg * {
                    color: #047857 !important;
                    stroke: #047857 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-rose-"] svg,
                html:not(.dark) .sa-panel [class*="bg-rose-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-red-"] svg,
                html:not(.dark) .sa-panel [class*="bg-red-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-rose-100"] svg,
                html:not(.dark) .sa-panel [class*="bg-rose-100"] svg * {
                    color: #b91c1c !important;
                    stroke: #b91c1c !important;
                }
                html:not(.dark) .sa-panel [class*="bg-blue-"] svg,
                html:not(.dark) .sa-panel [class*="bg-blue-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-[#DBEAFE]"] svg,
                html:not(.dark) .sa-panel [class*="bg-[#DBEAFE]"] svg * {
                    color: #1d4ed8 !important;
                    stroke: #1d4ed8 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-amber-"] svg,
                html:not(.dark) .sa-panel [class*="bg-amber-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-yellow-"] svg,
                html:not(.dark) .sa-panel [class*="bg-yellow-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-[#FEF3C7]"] svg,
                html:not(.dark) .sa-panel [class*="bg-[#FEF3C7]"] svg * {
                    color: #b45309 !important;
                    stroke: #b45309 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-violet-"] svg,
                html:not(.dark) .sa-panel [class*="bg-violet-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-purple-"] svg,
                html:not(.dark) .sa-panel [class*="bg-purple-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-[#F3E8FF]"] svg,
                html:not(.dark) .sa-panel [class*="bg-[#F3E8FF]"] svg * {
                    color: #6d28d9 !important;
                    stroke: #6d28d9 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-orange-"] svg,
                html:not(.dark) .sa-panel [class*="bg-orange-"] svg *,
                html:not(.dark) .sa-panel [class*="bg-[#ffedd5]"] svg,
                html:not(.dark) .sa-panel [class*="bg-[#ffedd5]"] svg * {
                    color: #ea580c !important;
                    stroke: #ea580c !important;
                }
                html:not(.dark) .sa-panel [class*="bg-cyan-"] svg,
                html:not(.dark) .sa-panel [class*="bg-cyan-"] svg * {
                    color: #0891b2 !important;
                    stroke: #0891b2 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-fuchsia-"] svg,
                html:not(.dark) .sa-panel [class*="bg-fuchsia-"] svg * {
                    color: #c026d3 !important;
                    stroke: #c026d3 !important;
                }
                html:not(.dark) .sa-panel [class*="bg-indigo-"] svg,
                html:not(.dark) .sa-panel [class*="bg-indigo-"] svg * {
                    color: #4f46e5 !important;
                    stroke: #4f46e5 !important;
                }

                /* Force all stat card / dashboard / page icon containers to be rounded squares (not circular, not sharp) */
                html .sa-panel .rounded-full:has(svg),
                html .sa-panel div[class*="w-"][class*="h-"]:has(svg) {
                    border-radius: 12px !important;
                }

                /* Remove focus outline and borders from recharts elements */
                .recharts-wrapper,
                .recharts-surface,
                .recharts-wrapper:focus,
                .recharts-surface:focus,
                .recharts-wrapper:active,
                .recharts-surface:active,
                .recharts-wrapper *:focus,
                .recharts-wrapper *:focus-visible,
                .recharts-wrapper *:focus-within,
                svg:focus,
                svg:focus-visible,
                svg *:focus,
                svg *:focus-visible {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
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
