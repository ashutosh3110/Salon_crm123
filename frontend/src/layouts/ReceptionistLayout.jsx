import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistSidebar from '../components/receptionist/ReceptionistSidebar';
import Topbar from '../components/admin/Topbar';

export default function ReceptionistLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('receptionist_sidebar_collapsed');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSetCollapsed = (value) => {
        setCollapsed(value);
        localStorage.setItem('receptionist_sidebar_collapsed', JSON.stringify(value));
    };

    const effectiveCollapsed = collapsed;

    return (
        <div className="min-h-screen bg-surface admin-panel">
            <style>{`
                /* --- Global Theme, Colors & Font Assignment --- */
                html {
                    overscroll-behavior-y: none !important;
                }
                
                html:not(.dark) .admin-panel {
                    --primary: #B4912B !important;
                    --primary-foreground: #ffffff !important;
                    --font-serif: 'Inter', sans-serif !important;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #000000 !important;
                }
                
                .admin-panel *,
                .admin-panel *::before,
                .admin-panel *::after,
                [role="dialog"] *,
                [role="menu"] *,
                [role="tooltip"] *,
                .fixed.inset-0 * {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
                    letter-spacing: -0.01em;
                }

                /* --- Headers & Titles (Completely Clean & Standard) --- */
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
                    font-weight: 700 !important;
                    letter-spacing: -0.02em !important;
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
                    font-size: 0.72rem !important;
                    line-height: 1.1rem !important;
                }
                .admin-panel .text-sm {
                    font-size: 0.8rem !important;
                    line-height: 1.25rem !important;
                }
                .admin-panel .text-base {
                    font-size: 0.9rem !important;
                    line-height: 1.4rem !important;
                }
                .admin-panel .text-lg {
                    font-size: 1.05rem !important;
                    line-height: 1.5rem !important;
                }
                .admin-panel .text-xl {
                    font-size: 1.2rem !important;
                    line-height: 1.65rem !important;
                }
                .admin-panel .text-2xl {
                    font-size: 1.45rem !important;
                    line-height: 1.9rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.015em !important;
                }
                .admin-panel .text-3xl {
                    font-size: 1.8rem !important;
                    line-height: 2.2rem !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.02em !important;
                }

                /* --- Spacious & Beautiful Tables --- */
                .admin-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                .admin-panel table th {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                    text-align: left;
                    vertical-align: middle !important;
                    padding: 10px 16px !important;
                    font-size: 11px !important;
                    height: 42px !important;
                    max-height: 42px !important;
                    box-sizing: border-box !important;
                }
                .admin-panel table td {
                    vertical-align: middle !important;
                    line-height: 1.4 !important;
                    padding: 10px 16px !important;
                    font-size: 12px !important;
                    height: 62px !important;
                    max-height: 62px !important;
                    box-sizing: border-box !important;
                }
                .admin-panel table tr {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    height: 62px !important;
                    box-sizing: border-box !important;
                }

                /* Light Mode Table Colors */
                html:not(.dark) .admin-panel table th {
                    color: #000000 !important;
                    background-color: #f8fafc !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                }
                html:not(.dark) .admin-panel table td {
                    color: #000000 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                html:not(.dark) .admin-panel table tr:hover td {
                    background-color: #f8fafc !important;
                }
                
                /* Dark Mode Table Colors */
                .dark .admin-panel table th {
                    background-color: #121826 !important;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel table td {
                    color: #cbd5e1 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .dark .admin-panel table tr:hover td {
                    background-color: #1e293b !important;
                }

                /* --- Premium Elevated Table Container Wrappers --- */
                html:not(.dark) .admin-panel .overflow-x-auto,
                html:not(.dark) .admin-panel .table-responsive,
                html:not(.dark) .admin-panel [class*="overflow-x-auto"] {
                    border-radius: 1.25rem !important;
                    border: 1px solid #e2e8f0 !important;
                    background-color: #ffffff !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 10px 15px -3px rgba(0, 0, 0, 0.02) !important;
                    padding: 0px !important;
                    margin-bottom: 1.5rem !important;
                    overflow-x: auto !important;
                    width: 100% !important;
                    scrollbar-width: thin !important;
                    scrollbar-color: #cbd5e1 transparent !important;
                }
                .admin-panel .overflow-x-auto::-webkit-scrollbar,
                .admin-panel .table-responsive::-webkit-scrollbar,
                .admin-panel [class*="overflow-x-auto"]::-webkit-scrollbar {
                    height: 6px !important;
                }
                .admin-panel .overflow-x-auto::-webkit-scrollbar-thumb,
                .admin-panel .table-responsive::-webkit-scrollbar-thumb,
                .admin-panel [class*="overflow-x-auto"]::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1 !important;
                    border-radius: 9999px !important;
                }
                
                .dark .admin-panel .overflow-x-auto,
                .dark .admin-panel .table-responsive,
                .dark .admin-panel [class*="overflow-x-auto"] {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    background-color: #1e293b !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
                    scrollbar-color: rgba(255, 255, 255, 0.15) transparent !important;
                }
                .dark .admin-panel .overflow-x-auto::-webkit-scrollbar-thumb,
                .dark .admin-panel .table-responsive::-webkit-scrollbar-thumb,
                .dark .admin-panel [class*="overflow-x-auto"]::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                }

                /* --- Form Controls, Inputs & Labels --- */
                html:not(.dark) .admin-panel label {
                    font-weight: 600 !important;
                    color: #000000 !important;
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                html:not(.dark) .admin-panel input:not(.bg-transparent), 
                html:not(.dark) .admin-panel select:not(.bg-transparent), 
                html:not(.dark) .admin-panel textarea:not(.bg-transparent) {
                    border-radius: 0.75rem !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #000000 !important;
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                html:not(.dark) .admin-panel input.pl-12,
                html:not(.dark) .admin-panel select.pl-12 {
                    padding-left: 3rem !important;
                }
                html:not(.dark) .admin-panel input.pl-14,
                html:not(.dark) .admin-panel select.pl-14 {
                    padding-left: 3.5rem !important;
                }
                html:not(.dark) .admin-panel input.pl-16,
                html:not(.dark) .admin-panel select.pl-16 {
                    padding-left: 4rem !important;
                }
                html:not(.dark) .admin-panel input.pl-10,
                html:not(.dark) .admin-panel select.pl-10 {
                    padding-left: 2.5rem !important;
                }
                html:not(.dark) .admin-panel input:focus, 
                html:not(.dark) .admin-panel select:focus, 
                html:not(.dark) .admin-panel textarea:focus {
                    border-color: #B4912B !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.12) !important;
                    outline: none !important;
                }
                .dark .admin-panel input:not(.bg-transparent), 
                .dark .admin-panel select:not(.bg-transparent), 
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #ffffff !important;
                }

                /* --- Premium Cards --- */
                html:not(.dark) .admin-panel .bg-surface,
                html:not(.dark) .admin-panel .bg-white {
                    background-color: #ffffff !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03) !important;
                }
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-white {
                    background-color: #1e293b !important;
                }

                /* --- Dynamic & Premium Buttons --- */
                .admin-panel button,
                .admin-panel .inline-flex,
                .admin-panel a[class*="bg-primary"],
                .admin-panel button[class*="bg-primary"] {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                .admin-panel button.bg-primary:not(aside *),
                .admin-panel a.bg-primary:not(aside *),
                .admin-panel button[class*="bg-primary"]:not(aside *),
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *),
                .admin-panel button[type="submit"][class*="px-"]:not(aside *),
                .admin-panel button[type="submit"][class*="py-5"]:not(aside *),
                .admin-panel button[type="submit"][class*="flex-1"]:not(aside *) {
                    background: #000000 !important;
                    color: #ffffff !important;
                    border: 1px solid #000000 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
                }
                .admin-panel button.bg-primary:not(aside *):hover,
                .admin-panel a.bg-primary:not(aside *):hover,
                .admin-panel button[class*="bg-primary"]:not(aside *):hover,
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="px-"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="py-5"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="flex-1"]:not(aside *):hover {
                    background: #262626 !important;
                    border-color: #262626 !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.15) !important;
                    transform: translateY(-1.5px) !important;
                }
                
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button[class*="border-"]:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .dark .admin-panel button[class*="bg-white"]:not(aside *),
                .dark .admin-panel button.bg-white:not(aside *),
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit-2):not(aside *),
                .dark .admin-panel button:has(svg.lucide-ban):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash-2):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *),
                .dark .admin-panel button:has(svg.lucide-settings):not(aside *),
                .dark .admin-panel button:has(svg.lucide-printer):not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):not(.bg-primary):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .admin-panel button[class*="border-"]:not(aside *):not(.bg-primary):hover,
                .dark .admin-panel button[class*="bg-white"]:not(aside *):hover,
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover,
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit-2):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-ban):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-trash-2):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-settings):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-printer):not(aside *):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }

                /* --- Custom Styled Premium Pagination Footer --- */
                html:not(.dark) .admin-panel [class*="bg-surface-alt/50"],
                html:not(.dark) .admin-panel .bg-surface-alt\\/50,
                html:not(.dark) .admin-panel [class*="border-t"]:not(aside) {
                    background-color: #f8fafc !important;
                    border-top: 1px solid #e2e8f0 !important;
                    padding: 1.25rem 1.5rem !important;
                    border-bottom-left-radius: 1.25rem !important;
                    border-bottom-right-radius: 1.25rem !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"],
                .dark .admin-panel .bg-surface-alt\\/50 {
                    background-color: #121826 !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *),
                .dark .admin-panel .bg-surface-alt\\/50 button:not(aside *),
                .dark .admin-panel [class*="border-t"] button:not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):hover,
                .dark .admin-panel .bg-surface-alt\\/50 button:not(aside *):hover,
                .dark .admin-panel [class*="border-t"] button:not(aside *):hover {
                    border-color: #B4912B !important;
                    color: #B4912B !important;
                    background-color: rgba(180, 145, 43, 0.15) !important;
                }

                /* --- Soft Badges --- */
                .admin-panel .rounded-full.border {
                    padding: 0.25rem 0.75rem !important;
                    font-weight: 600 !important;
                    font-size: 0.8rem !important;
                }

                /* --- Advanced Responsiveness & Adaptive Padding Constraints --- */
                @media (max-width: 640px) {
                    .admin-panel main {
                        padding: 1rem !important;
                    }
                    .admin-panel .grid {
                        gap: 1rem !important;
                    }
                }
                @media (max-width: 1024px) {
                    .admin-panel table {
                        min-width: 850px !important;
                    }
                }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
                   ========================================== */
                .dark .admin-panel {
                    --primary: #B4912B !important;
                    --primary-foreground: #ffffff !important;
                    background-color: #121826 !important;
                    color: #cbd5e1 !important;
                }

                /* Deep slate-900 backgrounds for main page, modal overlays, inputs, etc. */
                .dark .admin-panel,
                .dark .admin-panel .bg-surface-alt,
                .dark .admin-panel [class*="bg-surface-alt"],
                .dark .admin-panel input:not(.bg-transparent),
                .dark .admin-panel select:not(.bg-transparent),
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #121826 !important;
                }

                .dark .admin-panel .border,
                .dark .admin-panel [class*="border-"] {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                }

                .dark .admin-panel .text-text,
                .dark .admin-panel [class*="text-text"],
                .dark .admin-panel h1,
                .dark .admin-panel h2,
                .dark .admin-panel h3 {
                    color: #f8fafc !important;
                }

                .dark .admin-panel .text-text-secondary {
                    color: #cbd5e1!important; 
                }

                .dark .admin-panel .text-text-muted {
                    color: #94a3b8 !important;
                }

                /* --- Form Controls in Dark Mode --- */
                .dark .admin-panel label {
                    color: #cbd5e1!important;
                }
                .dark .admin-panel input:focus, 
                .dark .admin-panel select:focus, 
                .dark .admin-panel textarea:focus {
                    border-color: #B4912B !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.25) !important;
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
                .dark .admin-panel button.bg-primary,
                .dark .admin-panel a.bg-primary,
                .dark .admin-panel .bg-primary,
                .dark .admin-panel button[type="submit"],
                .dark .admin-panel button:has(svg.lucide-plus) {
                    background: #B4912B !important;
                    color: #ffffff !important;
                    border: 1px solid #B4912B !important;
                }
                .dark .admin-panel button.bg-primary:hover,
                .dark .admin-panel a.bg-primary:hover,
                .dark .admin-panel .bg-primary:hover,
                .dark .admin-panel button[type="submit"]:hover,
                .dark .admin-panel button:has(svg.lucide-plus):hover {
                    background: #C5A23C !important;
                    border-color: #C5A23C !important;
                }

                /* --- Secondary/Outline Buttons in Dark Mode --- */
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }

                /* ==========================================
                   📐 COMPREHENSIVE SPACE COMPRESSION OVERRIDES
                   ========================================== */
                .admin-panel main {
                    padding: 0.75rem !important;
                }
                @media (min-width: 640px) {
                    .admin-panel main {
                        padding: 1rem !important;
                    }
                }

                .admin-panel table th,
                html:not(.dark) .admin-panel table th {
                    padding: 0.5rem 0.75rem !important;
                }
                .admin-panel table td,
                html:not(.dark) .admin-panel table td {
                    padding: 0.625rem 0.75rem !important;
                }

                .admin-panel .p-10 { padding: 1.25rem !important; }
                .admin-panel .p-8 { padding: 1rem !important; }
                .admin-panel .p-6 { padding: 0.75rem !important; }
                .admin-panel .p-5 { padding: 0.625rem !important; }
                .admin-panel .p-4 { padding: 0.5rem !important; }

                .admin-panel .px-10 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
                .admin-panel .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
                .admin-panel .px-6 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }

                .admin-panel .py-12 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
                .admin-panel .py-10 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
                .admin-panel .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .admin-panel .py-6 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }

                /* SVG Color Enforcements */
                html:not(.dark) .admin-panel svg[style*="color"] *,
                html:not(.dark) .admin-panel svg[style*="stroke"] * {
                    stroke: currentColor !important;
                }
                html:not(.dark) .admin-panel [class*="text-"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-"] * {
                    stroke: currentColor !important;
                }

                /* EXCEPT if the SVG or its parent has a green/emerald text class, force it to green */
                html:not(.dark) .admin-panel [class*="text-emerald"] svg,
                html:not(.dark) .admin-panel [class*="text-emerald"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-emerald"],
                html:not(.dark) .admin-panel svg[class*="text-emerald"] *,
                html:not(.dark) .admin-panel [class*="text-green"] svg,
                html:not(.dark) .admin-panel [class*="text-green"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-green"],
                html:not(.dark) .admin-panel svg[class*="text-green"] * {
                    color: #059669 !important;
                    stroke: #059669 !important;
                }

                /* EXCEPT if the SVG or its parent has a red/rose text class, force it to red */
                html:not(.dark) .admin-panel [class*="text-rose"] svg,
                html:not(.dark) .admin-panel [class*="text-rose"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-rose"],
                html:not(.dark) .admin-panel svg[class*="text-rose"] *,
                html:not(.dark) .admin-panel [class*="text-red"] svg,
                html:not(.dark) .admin-panel [class*="text-red"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-red"],
                html:not(.dark) .admin-panel svg[class*="text-red"] * {
                    color: #dc2626 !important;
                    stroke: #dc2626 !important;
                }

                /* EXCEPT if the SVG or its parent has a gold/amber/yellow text class, force it to gold */
                html:not(.dark) .admin-panel [class*="text-amber"] svg,
                html:not(.dark) .admin-panel [class*="text-amber"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-amber"],
                html:not(.dark) .admin-panel svg[class*="text-amber"] *,
                html:not(.dark) .admin-panel [class*="text-yellow"] svg,
                html:not(.dark) .admin-panel [class*="text-yellow"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-yellow"],
                html:not(.dark) .admin-panel svg[class*="text-yellow"] *,
                html:not(.dark) .admin-panel [class*="text-primary"] svg,
                html:not(.dark) .admin-panel [class*="text-primary"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-primary"],
                html:not(.dark) .admin-panel svg[class*="text-primary"] * {
                    color: #b45309 !important;
                    stroke: #b45309 !important;
                }

                /* EXCEPT if the SVG or its parent has a blue/indigo text class, force it to blue */
                html:not(.dark) .admin-panel [class*="text-blue"] svg,
                html:not(.dark) .admin-panel [class*="text-blue"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-blue"],
                html:not(.dark) .admin-panel svg[class*="text-blue"] *,
                html:not(.dark) .admin-panel [class*="text-indigo"] svg,
                html:not(.dark) .admin-panel [class*="text-indigo"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-indigo"],
                html:not(.dark) .admin-panel svg[class*="text-indigo"] * {
                    color: #2563eb !important;
                    stroke: #2563eb !important;
                }

                /* Force all stat card / dashboard / page icon containers to be rounded squares (not circular, not sharp) */
                html .admin-panel .rounded-full:has(svg),
                html .admin-panel div[class*="w-"][class*="h-"]:has(svg) {
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

            <ReceptionistSidebar
                collapsed={collapsed}
                setCollapsed={handleSetCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[270px]'
                    }`}
            >
                <Topbar onMenuClick={() => setMobileOpen(true)} />

                <main className="p-4 animate-reveal">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
