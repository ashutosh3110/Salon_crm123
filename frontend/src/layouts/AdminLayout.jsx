import React from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('admin_sidebar_collapsed');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSetCollapsed = (value) => {
        setCollapsed(value);
        localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(value));
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
                    font-weight: 700 !important; /* Reduced from 800/900 for cleaner aesthetics */
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

                /* Fine-grained table font-size & weight overrides to bypass global amplifiers */
                .admin-panel table .text-\\[10px\\],
                .admin-panel table [class*="text-\\[10px\\]"] {
                    font-size: 11.5px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.03em !important;
                }
                .admin-panel table .text-\\[11px\\],
                .admin-panel table [class*="text-\\[11px\\]"] {
                    font-size: 12.5px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.01em !important;
                }
                .admin-panel table .text-\\[9px\\],
                .admin-panel table [class*="text-\\[9px\\]"] {
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.04em !important;
                }
                .admin-panel table .text-xs,
                .admin-panel table [class*="text-xs"] {
                    font-size: 12.5px !important;
                }
                .admin-panel table .text-sm,
                .admin-panel table [class*="text-sm"] {
                    font-size: 13.5px !important;
                }
                .admin-panel table .text-base,
                .admin-panel table [class*="text-base"] {
                    font-size: 14.5px !important;
                }

                /* Light Mode Table Colors */
                html:not(.dark) .admin-panel table th {
                    color: #000000 !important; /* solid black */
                    background-color: #f8fafc !important; /* slate-50 */
                    border-bottom: 2px solid #e2e8f0 !important;
                }
                html:not(.dark) .admin-panel table td {
                    color: #000000 !important; /* solid black */
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                html:not(.dark) .admin-panel table tr:hover td {
                    background-color: #f8fafc !important; /* Subtle hover state */
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
                    /* Custom beautiful thin scrollbar */
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
                    color: #000000 !important; /* solid black */
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                html:not(.dark) .admin-panel input:not(.bg-transparent), 
                html:not(.dark) .admin-panel select:not(.bg-transparent), 
                html:not(.dark) .admin-panel textarea:not(.bg-transparent) {
                    border-radius: 0.75rem !important; /* Soft premium rounded corners */
                    border: 1px solid #cbd5e1 !important;
                    color: #000000 !important; /* solid black */
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                html:not(.dark) .admin-panel select {
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
                    border-color: #B4912B !important; /* Gold theme accent */
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
                
                /* Target Primary Buttons inside Admin Panel — only explicit primary bg or submit with px padding (real CTA buttons) */
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
                .admin-panel button.bg-primary:not(aside *):active,
                .admin-panel a.bg-primary:not(aside *):active,
                .admin-panel button[class*="bg-primary"]:not(aside *):active,
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *):active,
                .admin-panel button[type="submit"][class*="px-"]:not(aside *):active,
                .admin-panel button[type="submit"][class*="py-5"]:not(aside *):active,
                .admin-panel button[type="submit"][class*="flex-1"]:not(aside *):active {
                    transform: translateY(0.5px) scale(0.97) !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
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
                html:not(.dark) .admin-panel .bg-surface-alt\/50,
                html:not(.dark) .admin-panel [class*="border-t"]:not(aside) {
                    background-color: #f8fafc !important;
                    border-top: 1px solid #e2e8f0 !important;
                    padding: 1.25rem 1.5rem !important;
                    border-bottom-left-radius: 1.25rem !important;
                    border-bottom-right-radius: 1.25rem !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"],
                .dark .admin-panel .bg-surface-alt\/50 {
                    background-color: #121826 !important;
                    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                

                
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *),
                .dark .admin-panel .bg-surface-alt\/50 button:not(aside *),
                .dark .admin-panel [class*="border-t"] button:not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):hover,
                .dark .admin-panel .bg-surface-alt\/50 button:not(aside *):hover,
                .dark .admin-panel [class*="border-t"] button:not(aside *):hover {
                    border-color: #B4912B !important;
                    color: #B4912B !important;
                    background-color: rgba(180, 145, 43, 0.15) !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):disabled,
                .dark .admin-panel .bg-surface-alt\/50 button:not(aside *):disabled,
                .dark .admin-panel [class*="border-t"] button:not(aside *):disabled {
                    opacity: 0.25 !important;
                    background-color: #121826 !important;
                    color: #e6e8ebff !important;
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
                    /* Ensure tables are scrollable on smaller screens instead of stretching */
                    .admin-panel table {
                        min-width: 850px !important;
                    }
                }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
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
                    color: #cbd5e1!important; /* slate-400 */
                }

                .dark .admin-panel .text-text-muted,
                .dark .admin-panel [class*="text-text-muted"],
                .dark .admin-panel [class*="text-slate-400"],
                .dark .admin-panel [class*="text-gray-400"],
                .dark [role="dialog"] .text-text-muted,
                .dark [role="dialog"] [class*="text-text-muted"],
                .dark .fixed.inset-0 .text-text-muted,
                .dark .fixed.inset-0 [class*="text-text-muted"] {
                    color: #94a3b8 !important; /* slate-500 */
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


                /* --- Form Controls in Dark Mode --- */
                .dark .admin-panel label {
                    color: #cbd5e1!important; /* slate-400 */
                }
                .dark .admin-panel input:focus, 
                .dark .admin-panel select:focus, 
                .dark .admin-panel textarea:focus {
                    border-color: #B4912B !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.25) !important;
                }

                /* --- SVG and Recharts Ticks & Lines in Dark Mode --- */
                .dark .admin-panel .recharts-cartesian-grid-horizontal line,
                .dark .admin-panel .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .admin-panel .recharts-text {
                    fill: #94a3b8!important;
                }
                                .dark .admin-panel .recharts-legend-item-text {
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
                .dark .admin-panel button:has(svg.lucide-ban):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash-2):not(aside *),
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
                .dark .admin-panel button[class*="border-"]:not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-ban):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-trash-2):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *):hover,
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
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
                .admin-panel table th,
                html:not(.dark) .admin-panel table th {
                    padding: 0.5rem 0.75rem !important;
                }
                .admin-panel table td,
                html:not(.dark) .admin-panel table td {
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

                /* Light Mode Sidebar Icons & Sub-items Icons Visibility Override */
                html:not(.dark) .admin-panel aside nav a svg,
                html:not(.dark) .admin-panel aside nav button svg,
                html:not(.dark) .admin-panel aside nav a svg *,
                html:not(.dark) .admin-panel aside nav button svg * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                    fill: none !important;
                    opacity: 1 !important;
                }

                /* Override currentColor rule from index.css for paths specifically */
                html:not(.dark) .admin-panel aside nav [class*="text-"] svg *,
                html:not(.dark) .admin-panel aside nav svg[class*="text-"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }

                /* Hover State for inactive icons */
                html:not(.dark) .admin-panel aside nav a:hover svg,
                html:not(.dark) .admin-panel aside nav button:hover svg,
                html:not(.dark) .admin-panel aside nav a:hover svg *,
                html:not(.dark) .admin-panel aside nav button:hover svg * {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }

                /* Active state icons & text on gold background must stay solid white */
                html:not(.dark) .admin-panel aside nav a[class*="bg-[#B4912B]"] svg,
                html:not(.dark) .admin-panel aside nav button[class*="bg-[#B4912B]"] svg,
                html:not(.dark) .admin-panel aside nav a.active svg,
                html:not(.dark) .admin-panel aside nav button.active svg,
                html:not(.dark) .admin-panel aside nav a[class*="bg-[#B4912B]"] svg *,
                html:not(.dark) .admin-panel aside nav button[class*="bg-[#B4912B]"] svg *,
                html:not(.dark) .admin-panel aside nav a.active svg *,
                html:not(.dark) .admin-panel aside nav button.active svg * {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                }
                html:not(.dark) .admin-panel aside nav a[class*="bg-[#B4912B]"] span,
                html:not(.dark) .admin-panel aside nav button[class*="bg-[#B4912B]"] span,
                html:not(.dark) .admin-panel aside nav a.active span,
                html:not(.dark) .admin-panel aside nav button.active span {
                    color: #ffffff !important;
                }

                /* Dark Mode Sidebar Nested Divs Transparency Fix */
                .dark .admin-panel aside nav div {
                    background-color: transparent !important;
                    background: transparent !important;
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

                /* Compress card wrapper spacing (full specificity to override existing !important rules) */
                html:not(.dark) .admin-panel .overflow-x-auto,
                html:not(.dark) .admin-panel .table-responsive,
                html:not(.dark) .admin-panel [class*="overflow-x-auto"] {
                    margin-bottom: 0.75rem !important;
                }
                .dark .admin-panel .overflow-x-auto,
                .dark .admin-panel .table-responsive,
                .dark .admin-panel [class*="overflow-x-auto"] {
                    margin-bottom: 0.75rem !important;
                }

                /* Compress pagination footer */
                .admin-panel [class*="bg-surface-alt/50"],
                .admin-panel .bg-surface-alt\/50,
                .admin-panel [class*="border-t"]:not(aside) {
                    padding: 0.75rem 1rem !important;
                }

                /* ==========================================
                   🔥 EMERGENCY VISIBILITY FIXES
                   Protect buttons with text-white / text-primary-foreground on dark backgrounds
                   (Fix for light mode color: #000000 override)
                   ========================================== */
                /* text-primary-foreground ALWAYS stays white in light mode (it's for btn text on dark bg) */
                html:not(.dark) .admin-panel .text-primary-foreground {
                    color: #ffffff !important;
                }
                html:not(.dark) .admin-panel .text-primary-foreground svg,
                html:not(.dark) .admin-panel .text-primary-foreground path {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                }

                /* Any button with text-white on a dark background must stay white */
                html:not(.dark) .admin-panel button.text-white,
                html:not(.dark) .admin-panel a.text-white,
                html:not(.dark) .admin-panel .inline-flex.text-white,
                html:not(.dark) .admin-panel [class*="text-white"].inline-flex,
                html:not(.dark) .admin-panel button:has(.lucide-plus).text-white,
                html:not(.dark) .admin-panel button.bg-black.text-white,
                html:not(.dark) .admin-panel button[class*="bg-black"].text-white,
                html:not(.dark) .admin-panel button.bg-text.text-white,
                html:not(.dark) .admin-panel button[class*="bg-text"].text-white,
                html:not(.dark) .admin-panel a.bg-black.text-white,
                html:not(.dark) .admin-panel a[class*="bg-black"].text-white,
                /* Also protect child icons inside these buttons */
                html:not(.dark) .admin-panel button.text-white svg,
                html:not(.dark) .admin-panel a.text-white svg,
                html:not(.dark) .admin-panel button.text-white path,
                html:not(.dark) .admin-panel a.text-white path {
                    color: #ffffff !important;
                }

                /* Fix any button with bg-primary/bg-black that has white text but the text gets overridden */
                html:not(.dark) .admin-panel .bg-primary.text-white,
                html:not(.dark) .admin-panel [class*="bg-primary"].text-white,
                html:not(.dark) .admin-panel .bg-neutral-800.text-white,
                html:not(.dark) .admin-panel [class*="bg-neutral-"].text-white {
                    color: #ffffff !important;
                }

                /* Ensure text-white elements inside surface cards stay white */
                html:not(.dark) .admin-panel .text-white {
                    color: #ffffff !important;
                }

                /* === PROTECT ALL DARK-BG BUTTONS WITH WHITE TEXT === */
                /* These are commonly used in HR pages (attendance, payroll, performance) and other admin pages */
                /* Note: Only dark shades (500+) are targeted — light shades like bg-slate-100 are NOT included */
                html:not(.dark) .admin-panel button.bg-emerald-500,
                html:not(.dark) .admin-panel button.bg-rose-500,
                html:not(.dark) .admin-panel button.bg-amber-500,
                html:not(.dark) .admin-panel button.bg-violet-500,
                html:not(.dark) .admin-panel button.bg-slate-900,
                html:not(.dark) .admin-panel button.bg-slate-800,
                html:not(.dark) .admin-panel button.bg-slate-700,
                html:not(.dark) .admin-panel button.bg-text,
                /* Dark-shade wildcards (500-900 are dark, 50-400 are light — excluded) */
                html:not(.dark) .admin-panel button[class*="bg-emerald-6"],
                html:not(.dark) .admin-panel button[class*="bg-emerald-7"],
                html:not(.dark) .admin-panel button[class*="bg-emerald-8"],
                html:not(.dark) .admin-panel button[class*="bg-emerald-9"],
                html:not(.dark) .admin-panel button[class*="bg-rose-6"],
                html:not(.dark) .admin-panel button[class*="bg-rose-7"],
                html:not(.dark) .admin-panel button[class*="bg-rose-8"],
                html:not(.dark) .admin-panel button[class*="bg-rose-9"],
                html:not(.dark) .admin-panel button[class*="bg-amber-6"],
                html:not(.dark) .admin-panel button[class*="bg-amber-7"],
                html:not(.dark) .admin-panel button[class*="bg-amber-8"],
                html:not(.dark) .admin-panel button[class*="bg-amber-9"],
                html:not(.dark) .admin-panel button[class*="bg-violet-6"],
                html:not(.dark) .admin-panel button[class*="bg-violet-7"],
                html:not(.dark) .admin-panel button[class*="bg-violet-8"],
                html:not(.dark) .admin-panel button[class*="bg-violet-9"],
                html:not(.dark) .admin-panel button[class*="bg-slate-7"],
                html:not(.dark) .admin-panel button[class*="bg-slate-8"],
                html:not(.dark) .admin-panel button[class*="bg-slate-9"],
                html:not(.dark) .admin-panel button[class*="bg-neutral-7"],
                html:not(.dark) .admin-panel button[class*="bg-neutral-8"],
                html:not(.dark) .admin-panel button[class*="bg-neutral-9"],
                html:not(.dark) .admin-panel button[class*="bg-text"],
                /* Anchor tags used as buttons */
                html:not(.dark) .admin-panel a.bg-slate-900,
                html:not(.dark) .admin-panel a[class*="bg-slate-7"],
                html:not(.dark) .admin-panel a[class*="bg-slate-8"],
                html:not(.dark) .admin-panel a[class*="bg-slate-9"],
                html:not(.dark) .admin-panel a.bg-emerald-500,
                html:not(.dark) .admin-panel a.bg-rose-500,
                html:not(.dark) .admin-panel a.bg-amber-500,
                html:not(.dark) .admin-panel a.bg-violet-500,
                html:not(.dark) .admin-panel a.bg-text,
                html:not(.dark) .admin-panel a[class*="bg-emerald-6"],
                html:not(.dark) .admin-panel a[class*="bg-emerald-7"],
                html:not(.dark) .admin-panel a[class*="bg-emerald-8"],
                html:not(.dark) .admin-panel a[class*="bg-emerald-9"],
                html:not(.dark) .admin-panel a[class*="bg-rose-6"],
                html:not(.dark) .admin-panel a[class*="bg-rose-7"],
                html:not(.dark) .admin-panel a[class*="bg-rose-8"],
                html:not(.dark) .admin-panel a[class*="bg-rose-9"],
                html:not(.dark) .admin-panel a[class*="bg-amber-6"],
                html:not(.dark) .admin-panel a[class*="bg-amber-7"],
                html:not(.dark) .admin-panel a[class*="bg-amber-8"],
                html:not(.dark) .admin-panel a[class*="bg-amber-9"],
                html:not(.dark) .admin-panel a[class*="bg-violet-6"],
                html:not(.dark) .admin-panel a[class*="bg-violet-7"],
                html:not(.dark) .admin-panel a[class*="bg-violet-8"],
                html:not(.dark) .admin-panel a[class*="bg-violet-9"],
                html:not(.dark) .admin-panel a[class*="bg-text"],
                /* SVG icons inside these dark-bg buttons */
                html:not(.dark) .admin-panel button.bg-emerald-500 svg,
                html:not(.dark) .admin-panel button.bg-rose-500 svg,
                html:not(.dark) .admin-panel button.bg-amber-500 svg,
                html:not(.dark) .admin-panel button.bg-violet-500 svg,
                html:not(.dark) .admin-panel button.bg-slate-900 svg,
                html:not(.dark) .admin-panel button.bg-slate-800 svg,
                html:not(.dark) .admin-panel button.bg-slate-700 svg,
                html:not(.dark) .admin-panel button.bg-text svg {
                    color: #ffffff !important;
                }

                /* Dark mode: emerald/rose status text should stay colored */
                html:not(.dark) .admin-panel .text-emerald-500,
                html:not(.dark) .admin-panel [class*="text-emerald-400"],
                html:not(.dark) .admin-panel [class*="text-emerald-600"],
                html:not(.dark) .admin-panel .text-rose-500,
                html:not(.dark) .admin-panel [class*="text-rose-400"],
                html:not(.dark) .admin-panel [class*="text-rose-600"],
                html:not(.dark) .admin-panel .text-amber-500,
                html:not(.dark) .admin-panel [class*="text-amber-"],
                html:not(.dark) .admin-panel .text-primary {
                    color: inherit !important;
                }

                /* === FLOATING ACTION BUTTON SVG ICON VISIBILITY FIX ===
                   Force explicit stroke on SVGs inside bg-white buttons.
                   This bypasses all currentColor cascade issues — directly sets stroke. */
                html:not(.dark) .admin-panel button.bg-white:not(aside *) svg {
                    color: #1e293b !important;
                    stroke: #1e293b !important;
                    fill: none !important;
                    opacity: 1 !important;
                }
                /* Trash/delete button with rose color */
                html:not(.dark) .admin-panel button.bg-white.text-rose-500:not(aside *) svg {
                    color: #f43f5e !important;
                    stroke: #f43f5e !important;
                    fill: none !important;
                    opacity: 1 !important;
                }
                /* === PROTECT CHILD ELEMENTS INSIDE DARK-BG BUTTONS ===
                   Span and div inside buttons with dark backgrounds get #000000 from index.css span/div overrides */
                html:not(.dark) .admin-panel button.bg-primary div,
                html:not(.dark) .admin-panel button[class*="bg-primary"] span,
                html:not(.dark) .admin-panel button[class*="bg-primary"] div,
                html:not(.dark) .admin-panel button.bg-black span,
                html:not(.dark) .admin-panel button.bg-black div,
                html:not(.dark) .admin-panel button.bg-slate-900 span,
                html:not(.dark) .admin-panel button.bg-slate-900 div,
                html:not(.dark) .admin-panel button[class*="bg-slate-8"] span,
                html:not(.dark) .admin-panel button[class*="bg-slate-8"] div,
                html:not(.dark) .admin-panel button[class*="bg-slate-9"] span,
                html:not(.dark) .admin-panel button[class*="bg-slate-9"] div,
                html:not(.dark) .admin-panel button.bg-emerald-500 span,
                html:not(.dark) .admin-panel button.bg-emerald-500 div,
                html:not(.dark) .admin-panel button[class*="bg-emerald-5"] span,
                html:not(.dark) .admin-panel button[class*="bg-emerald-5"] div,
                html:not(.dark) .admin-panel button[class*="bg-emerald-6"] span,
                html:not(.dark) .admin-panel button[class*="bg-emerald-6"] div,
                html:not(.dark) .admin-panel button[class*="bg-emerald-7"] span,
                html:not(.dark) .admin-panel button[class*="bg-emerald-7"] div,
                html:not(.dark) .admin-panel button.bg-rose-500 span,
                html:not(.dark) .admin-panel button.bg-rose-500 div,
                html:not(.dark) .admin-panel button[class*="bg-rose-5"] span,
                html:not(.dark) .admin-panel button[class*="bg-rose-5"] div,
                html:not(.dark) .admin-panel button[class*="bg-rose-6"] span,
                html:not(.dark) .admin-panel button[class*="bg-rose-6"] div,
                html:not(.dark) .admin-panel button.bg-amber-500 span,
                html:not(.dark) .admin-panel button.bg-amber-500 div,
                html:not(.dark) .admin-panel button[class*="bg-amber-5"] span,
                html:not(.dark) .admin-panel button[class*="bg-amber-5"] div,
                html:not(.dark) .admin-panel button[class*="bg-amber-6"] span,
                html:not(.dark) .admin-panel button[class*="bg-amber-6"] div,
                html:not(.dark) .admin-panel button.bg-violet-500 span,
                html:not(.dark) .admin-panel button.bg-violet-500 div,
                html:not(.dark) .admin-panel button[class*="bg-violet-5"] span,
                html:not(.dark) .admin-panel button[class*="bg-violet-5"] div,
                html:not(.dark) .admin-panel button[class*="bg-violet-6"] span,
                html:not(.dark) .admin-panel button[class*="bg-violet-6"] div,
                html:not(.dark) .admin-panel button[class*="bg-emerald-8"] span,
                html:not(.dark) .admin-panel button[class*="bg-emerald-8"] div,
                html:not(.dark) .admin-panel button[class*="bg-emerald-9"] span,
                html:not(.dark) .admin-panel button[class*="bg-emerald-9"] div,
                html:not(.dark) .admin-panel button[class*="bg-rose-7"] span,
                html:not(.dark) .admin-panel button[class*="bg-rose-7"] div,
                html:not(.dark) .admin-panel button[class*="bg-rose-8"] span,
                html:not(.dark) .admin-panel button[class*="bg-rose-8"] div,
                html:not(.dark) .admin-panel button[class*="bg-rose-9"] span,
                html:not(.dark) .admin-panel button[class*="bg-rose-9"] div,
                html:not(.dark) .admin-panel button[class*="bg-amber-7"] span,
                html:not(.dark) .admin-panel button[class*="bg-amber-7"] div,
                html:not(.dark) .admin-panel button[class*="bg-amber-8"] span,
                html:not(.dark) .admin-panel button[class*="bg-amber-8"] div,
                html:not(.dark) .admin-panel button[class*="bg-amber-9"] span,
                html:not(.dark) .admin-panel button[class*="bg-amber-9"] div,
                html:not(.dark) .admin-panel button[class*="bg-violet-7"] span,
                html:not(.dark) .admin-panel button[class*="bg-violet-7"] div,
                html:not(.dark) .admin-panel button[class*="bg-violet-8"] span,
                html:not(.dark) .admin-panel button[class*="bg-violet-8"] div,
                html:not(.dark) .admin-panel button[class*="bg-violet-9"] span,
                html:not(.dark) .admin-panel button[class*="bg-violet-9"] div,
                html:not(.dark) .admin-panel button.bg-text span,
                html:not(.dark) .admin-panel button.bg-text div,
                html:not(.dark) .admin-panel button[class*="bg-text"] span,
                html:not(.dark) .admin-panel button[class*="bg-text"] div,
                /* Icon SVGs inside dark-bg buttons (broader coverage) */
                html:not(.dark) .admin-panel button.bg-primary svg,
                html:not(.dark) .admin-panel button[class*="bg-primary"] svg,
                html:not(.dark) .admin-panel button.bg-black svg,
                html:not(.dark) .admin-panel button.bg-slate-900 svg,
                html:not(.dark) .admin-panel button[class*="bg-slate-8"] svg,
                html:not(.dark) .admin-panel button[class*="bg-slate-9"] svg,
                html:not(.dark) .admin-panel button.bg-emerald-500 svg,
                html:not(.dark) .admin-panel button[class*="bg-emerald-5"] svg,
                html:not(.dark) .admin-panel button[class*="bg-emerald-6"] svg,
                html:not(.dark) .admin-panel button[class*="bg-emerald-7"] svg,
                html:not(.dark) .admin-panel button[class*="bg-emerald-8"] svg,
                html:not(.dark) .admin-panel button[class*="bg-emerald-9"] svg,
                html:not(.dark) .admin-panel button.bg-rose-500 svg,
                html:not(.dark) .admin-panel button[class*="bg-rose-5"] svg,
                html:not(.dark) .admin-panel button[class*="bg-rose-6"] svg,
                html:not(.dark) .admin-panel button[class*="bg-rose-7"] svg,
                html:not(.dark) .admin-panel button[class*="bg-rose-8"] svg,
                html:not(.dark) .admin-panel button[class*="bg-rose-9"] svg,
                html:not(.dark) .admin-panel button.bg-amber-500 svg,
                html:not(.dark) .admin-panel button[class*="bg-amber-5"] svg,
                html:not(.dark) .admin-panel button[class*="bg-amber-6"] svg,
                html:not(.dark) .admin-panel button[class*="bg-amber-7"] svg,
                html:not(.dark) .admin-panel button[class*="bg-amber-8"] svg,
                html:not(.dark) .admin-panel button[class*="bg-amber-9"] svg,
                html:not(.dark) .admin-panel button.bg-violet-500 svg,
                html:not(.dark) .admin-panel button[class*="bg-violet-5"] svg,
                html:not(.dark) .admin-panel button[class*="bg-violet-6"] svg,
                html:not(.dark) .admin-panel button[class*="bg-violet-7"] svg,
                html:not(.dark) .admin-panel button[class*="bg-violet-8"] svg,
                html:not(.dark) .admin-panel button[class*="bg-violet-9"] svg,
                html:not(.dark) .admin-panel button.bg-text svg,
                html:not(.dark) .admin-panel button[class*="bg-text"] svg,
                /* Anchor tags as buttons - child protection */
                html:not(.dark) .admin-panel a.bg-primary span,
                html:not(.dark) .admin-panel a.bg-primary div,
                html:not(.dark) .admin-panel a.bg-primary svg,
                html:not(.dark) .admin-panel a.bg-slate-900 span,
                html:not(.dark) .admin-panel a.bg-slate-900 div,
                html:not(.dark) .admin-panel a.bg-slate-900 svg,
                html:not(.dark) .admin-panel a.bg-emerald-500 span,
                html:not(.dark) .admin-panel a.bg-emerald-500 div,
                html:not(.dark) .admin-panel a.bg-emerald-500 svg,
                html:not(.dark) .admin-panel a.bg-rose-500 span,
                html:not(.dark) .admin-panel a.bg-rose-500 div,
                html:not(.dark) .admin-panel a.bg-rose-500 svg,
                html:not(.dark) .admin-panel a.bg-amber-500 span,
                html:not(.dark) .admin-panel a.bg-amber-500 div,
                html:not(.dark) .admin-panel a.bg-amber-500 svg,
                html:not(.dark) .admin-panel a.bg-violet-500 span,
                html:not(.dark) .admin-panel a.bg-violet-500 div,
                html:not(.dark) .admin-panel a.bg-violet-500 svg,
                html:not(.dark) .admin-panel a.bg-text span,
                html:not(.dark) .admin-panel a.bg-text div,
                html:not(.dark) .admin-panel a.bg-text svg {
                    color: #ffffff !important;
                }

                /* Fix dark mode: recharts text fill for axis ticks */
                .dark .admin-panel .recharts-text tspan {
                    fill: currentColor !important;
                }

                /* =============================================
                   ✅ DASHBOARD STAT CARDS — FORCED ROUND EDGES
                   ============================================= */
                .admin-panel .dash-stat-card,
                html:not(.dark) .admin-panel .dash-stat-card,
                .dark .admin-panel .dash-stat-card {
                    border-radius: 1.25rem !important;
                    border: 1.5px solid #e2e8f0 !important;
                    overflow: hidden;
                }
                html:not(.dark) .admin-panel .dash-stat-card {
                    background-color: #ffffff !important;
                }

                 /* --- BULLETPROOF LIGHT MODE SVG COLOR & STROKE VISIBILITY SYSTEM --- */
                /* By default, force all SVG icons and their paths to be dark slate/black in light mode for 100% visibility, EXCEPT those with inline style colors/strokes or text/stroke classes, and charts */
                html:not(.dark) .admin-panel svg:not(.recharts-surface):not([class*="recharts"]):not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]):not(.revenue-chart-container *),
                html:not(.dark) .admin-panel svg:not(.recharts-surface):not([class*="recharts"]):not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]):not(.revenue-chart-container *) * {
                    color: #1e293b !important;
                    stroke: #1e293b !important;
                }

                /* --- REVENUE CHART: Force golden line in BOTH light and dark mode --- */
                /* This MUST come after the dark override above to win via CSS cascade */
                html:not(.dark) .revenue-chart-container .recharts-surface,
                html:not(.dark) .revenue-chart-container .recharts-surface * {
                    color: unset !important;
                    stroke: unset !important;
                }
                html:not(.dark) .revenue-chart-container .recharts-area-curve,
                html:not(.dark) .revenue-chart-container path.recharts-area-curve,
                html:not(.dark) .revenue-chart-container .recharts-curve,
                html:not(.dark) .revenue-chart-container path.recharts-curve {
                    stroke: #B4912B !important;
                    stroke-width: 2.5px !important;
                    fill: none !important;
                }
                html:not(.dark) .revenue-chart-container .recharts-area-area,
                html:not(.dark) .revenue-chart-container path.recharts-area-area {
                    stroke: none !important;
                    fill: url(#colorRevenue) !important;
                }
                html:not(.dark) .revenue-chart-container .recharts-dot circle,
                html:not(.dark) .revenue-chart-container .recharts-area-dot circle {
                    fill: #B4912B !important;
                    stroke: #ffffff !important;
                }
                html:not(.dark) .revenue-chart-container .recharts-cartesian-axis-line {
                    stroke: #B4912B !important;
                    stroke-width: 1px !important;
                    opacity: 0.35 !important;
                }
                html:not(.dark) .revenue-chart-container .recharts-cartesian-grid-horizontal line,
                html:not(.dark) .revenue-chart-container .recharts-cartesian-grid line {
                    stroke: #B4912B !important;
                    stroke-opacity: 0.12 !important;
                }
                .revenue-chart-container .recharts-text,
                .revenue-chart-container .recharts-cartesian-axis-tick-value,
                .revenue-chart-container text,
                .revenue-chart-container tspan,
                .finance-chart-container .recharts-text,
                .finance-chart-container .recharts-cartesian-axis-tick-value,
                .finance-chart-container text,
                .finance-chart-container tspan,
                .sales-chart-container .recharts-text,
                .sales-chart-container .recharts-cartesian-axis-tick-value,
                .sales-chart-container text,
                .sales-chart-container tspan {
                    fill: #94a3b8 !important;
                    stroke: none !important;
                    font-weight: 400 !important;
                    font-size: 10px !important;
                }

                /* Respect inline style colors or strokes, but ensure children paths inherit them properly */
                html:not(.dark) .admin-panel svg[style*="color"] *,
                html:not(.dark) .admin-panel svg[style*="stroke"] * {
                    stroke: currentColor !important;
                }

                /* Respect text/stroke color classes (including custom hex codes like text-[#7C3AED]) on SVGs or their parent containers */
                html:not(.dark) .admin-panel [class*="text-"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-"] * {
                    stroke: currentColor !important;
                }
                html:not(.dark) .admin-panel [class*="stroke-"] svg *,
                html:not(.dark) .admin-panel svg[class*="stroke-"] * {
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

                /* EXCEPT if the SVG or its parent has a purple/violet text class, force it to purple */
                html:not(.dark) .admin-panel [class*="text-purple"] svg,
                html:not(.dark) .admin-panel [class*="text-purple"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-purple"],
                html:not(.dark) .admin-panel svg[class*="text-purple"] *,
                html:not(.dark) .admin-panel [class*="text-violet"] svg,
                html:not(.dark) .admin-panel [class*="text-violet"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-violet"],
                html:not(.dark) .admin-panel svg[class*="text-violet"] * {
                    color: #7c3aed !important;
                    stroke: #7c3aed !important;
                }

                /* EXCEPT if the SVG or its parent has an orange text class, force it to orange */
                html:not(.dark) .admin-panel [class*="text-orange"] svg,
                html:not(.dark) .admin-panel [class*="text-orange"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-orange"],
                html:not(.dark) .admin-panel svg[class*="text-orange"] * {
                    color: #ea580c !important;
                    stroke: #ea580c !important;
                }

                /* EXCEPT if the SVG or its parent has a slate/gray text class, force it to slate/gray */
                html:not(.dark) .admin-panel [class*="text-slate"] svg,
                html:not(.dark) .admin-panel [class*="text-slate"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-slate"],
                html:not(.dark) .admin-panel svg[class*="text-slate"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }
                html:not(.dark) .admin-panel [class*="text-gray"] svg,
                html:not(.dark) .admin-panel [class*="text-gray"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-gray"],
                html:not(.dark) .admin-panel svg[class*="text-gray"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }

                /* EXCEPT if the SVG is inside a soft colored background container, force matching color */
                html:not(.dark) .admin-panel [class*="bg-emerald-"] svg,
                html:not(.dark) .admin-panel [class*="bg-emerald-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-green-"] svg,
                html:not(.dark) .admin-panel [class*="bg-green-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#DCFCE7]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#DCFCE7]"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#ECFDF5]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#ECFDF5]"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#E8FDF0]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#E8FDF0]"] svg *,
                html:not(.dark) .admin-panel [class*="bg-emerald-50"] svg,
                html:not(.dark) .admin-panel [class*="bg-emerald-50"] svg * {
                    color: #047857 !important;
                    stroke: #047857 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-rose-"] svg,
                html:not(.dark) .admin-panel [class*="bg-rose-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-red-"] svg,
                html:not(.dark) .admin-panel [class*="bg-red-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-rose-100"] svg,
                html:not(.dark) .admin-panel [class*="bg-rose-100"] svg * {
                    color: #b91c1c !important;
                    stroke: #b91c1c !important;
                }
                html:not(.dark) .admin-panel [class*="bg-blue-"] svg,
                html:not(.dark) .admin-panel [class*="bg-blue-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#DBEAFE]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#DBEAFE]"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#EFF6FF]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#EFF6FF]"] svg * {
                    color: #1d4ed8 !important;
                    stroke: #1d4ed8 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-amber-"] svg,
                html:not(.dark) .admin-panel [class*="bg-amber-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-yellow-"] svg,
                html:not(.dark) .admin-panel [class*="bg-yellow-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#FEF3C7]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#FEF3C7]"] svg * {
                    color: #b45309 !important;
                    stroke: #b45309 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-violet-"] svg,
                html:not(.dark) .admin-panel [class*="bg-violet-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-purple-"] svg,
                html:not(.dark) .admin-panel [class*="bg-purple-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#F3E8FF]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#F3E8FF]"] svg * {
                    color: #6d28d9 !important;
                    stroke: #6d28d9 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-orange-"] svg,
                html:not(.dark) .admin-panel [class*="bg-orange-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#ffedd5]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#ffedd5]"] svg * {
                    color: #ea580c !important;
                    stroke: #ea580c !important;
                }
                html:not(.dark) .admin-panel [class*="bg-cyan-"] svg,
                html:not(.dark) .admin-panel [class*="bg-cyan-"] svg * {
                    color: #0891b2 !important;
                    stroke: #0891b2 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-fuchsia-"] svg,
                html:not(.dark) .admin-panel [class*="bg-fuchsia-"] svg * {
                    color: #c026d3 !important;
                    stroke: #c026d3 !important;
                }
                html:not(.dark) .admin-panel [class*="bg-indigo-"] svg,
                html:not(.dark) .admin-panel [class*="bg-indigo-"] svg * {
                    color: #4f46e5 !important;
                    stroke: #4f46e5 !important;
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

            <Sidebar
                collapsed={collapsed}
                setCollapsed={handleSetCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
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
