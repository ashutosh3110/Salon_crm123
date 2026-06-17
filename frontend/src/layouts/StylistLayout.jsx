import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StylistSidebar from '../components/stylist/StylistSidebar';
import Topbar from '../components/admin/Topbar';

export default function StylistLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('stylist_sidebar_collapsed');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSetCollapsed = (value) => {
        setCollapsed(value);
        localStorage.setItem('stylist_sidebar_collapsed', JSON.stringify(value));
    };

    const effectiveCollapsed = collapsed;
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0F172A] admin-panel">
            <style>{`
                /* --- Global Theme, Colors & Font Assignment --- */
                html {
                    overscroll-behavior-y: none !important;
                }
                
                html:not(.dark) .admin-panel {
                    --primary: #C89B2B !important;
                    --primary-foreground: #ffffff !important;
                    --font-serif: 'Inter', sans-serif !important;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    background-color: #F8F9FB !important;
                    color: #1F2937 !important;
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

                /* --- Headers & Titles --- */
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

                /* --- Global Font Size Scale --- */
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

                /* --- Tables --- */
                .admin-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                .admin-panel table th {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    text-align: left;
                    vertical-align: middle !important;
                    padding: 10px 14px !important;
                    font-size: 11px !important;
                    height: 40px !important;
                    max-height: 40px !important;
                    box-sizing: border-box !important;
                }
                .admin-panel table td {
                    vertical-align: middle !important;
                    line-height: 1.4 !important;
                    padding: 8px 14px !important;
                    font-size: 12.5px !important;
                    height: 56px !important;
                    max-height: 56px !important;
                    box-sizing: border-box !important;
                }
                .admin-panel table tr {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    height: 56px !important;
                    box-sizing: border-box !important;
                }

                /* Light Mode Table Colors */
                html:not(.dark) .admin-panel table th {
                    color: #6B7280 !important;
                    background-color: #F8F9FB !important;
                    border-bottom: 1px solid #E5E7EB !important;
                }
                html:not(.dark) .admin-panel table td {
                    color: #1F2937 !important;
                    border-bottom: 1px solid #F3F4F6 !important;
                }
                html:not(.dark) .admin-panel table tr:hover td {
                    background-color: #FAFBFC !important;
                }
                
                /* Dark Mode Table Colors */
                .dark .admin-panel table th {
                    background-color: #121826 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                    color: #94a3b8 !important;
                }
                .dark .admin-panel table td {
                    color: #e2e8f0 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
                }
                .dark .admin-panel table tr:hover td {
                    background-color: rgba(255, 255, 255, 0.03) !important;
                }

                /* --- Table Container Wrappers --- */
                html:not(.dark) .admin-panel .overflow-x-auto,
                html:not(.dark) .admin-panel .table-responsive,
                html:not(.dark) .admin-panel [class*="overflow-x-auto"] {
                    border-radius: 12px !important;
                    border: 1px solid #E5E7EB !important;
                    background-color: #ffffff !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
                    padding: 0px !important;
                    overflow-x: auto !important;
                    width: 100% !important;
                    scrollbar-width: thin !important;
                    scrollbar-color: #E5E7EB transparent !important;
                }
                .admin-panel .overflow-x-auto::-webkit-scrollbar,
                .admin-panel .table-responsive::-webkit-scrollbar,
                .admin-panel [class*="overflow-x-auto"]::-webkit-scrollbar {
                    height: 5px !important;
                }
                .admin-panel .overflow-x-auto::-webkit-scrollbar-thumb,
                .admin-panel .table-responsive::-webkit-scrollbar-thumb,
                .admin-panel [class*="overflow-x-auto"]::-webkit-scrollbar-thumb {
                    background-color: #E5E7EB !important;
                    border-radius: 9999px !important;
                }
                
                .dark .admin-panel .overflow-x-auto,
                .dark .admin-panel .table-responsive,
                .dark .admin-panel [class*="overflow-x-auto"] {
                    border-color: rgba(255, 255, 255, 0.08) !important;
                    background-color: #1e293b !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
                    scrollbar-color: rgba(255, 255, 255, 0.1) transparent !important;
                }
                .dark .admin-panel .overflow-x-auto::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }

                /* --- Form Controls --- */
                html:not(.dark) .admin-panel label {
                    font-weight: 600 !important;
                    color: #374151 !important;
                    margin-bottom: 0.35rem !important;
                    display: inline-block !important;
                }
                html:not(.dark) .admin-panel input:not(.bg-transparent), 
                html:not(.dark) .admin-panel select:not(.bg-transparent), 
                html:not(.dark) .admin-panel textarea:not(.bg-transparent) {
                    border-radius: 10px !important;
                    border: 1px solid #E5E7EB !important;
                    color: #1F2937 !important;
                    background-color: #ffffff !important;
                    transition: all 0.2s ease-in-out !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04) !important;
                }
                html:not(.dark) .admin-panel input.pl-12,
                html:not(.dark) .admin-panel select.pl-12 {
                    padding-left: 3rem !important;
                }
                html:not(.dark) .admin-panel input.pl-14,
                html:not(.dark) .admin-panel select.pl-14 {
                    padding-left: 3.5rem !important;
                }
                html:not(.dark) .admin-panel input.pl-10,
                html:not(.dark) .admin-panel select.pl-10 {
                    padding-left: 2.5rem !important;
                }
                html:not(.dark) .admin-panel input:focus, 
                html:not(.dark) .admin-panel select:focus, 
                html:not(.dark) .admin-panel textarea:focus {
                    border-color: #C89B2B !important;
                    box-shadow: 0 0 0 3px rgba(200, 155, 43, 0.1) !important;
                    outline: none !important;
                }
                .dark .admin-panel input:not(.bg-transparent), 
                .dark .admin-panel select:not(.bg-transparent), 
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #ffffff !important;
                }

                /* --- Premium Cards with 12px radius --- */
                html:not(.dark) .admin-panel .bg-surface,
                html:not(.dark) .admin-panel .bg-white {
                    background-color: #ffffff !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02) !important;
                }
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-white {
                    background-color: #1e293b !important;
                }

                /* --- Buttons --- */
                .admin-panel button,
                .admin-panel .inline-flex,
                .admin-panel a[class*="bg-primary"],
                .admin-panel button[class*="bg-primary"] {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                /* Primary action buttons */
                .admin-panel button.bg-primary:not(aside *),
                .admin-panel a.bg-primary:not(aside *),
                .admin-panel button[class*="bg-primary"]:not(aside *),
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *),
                .admin-panel button[type="submit"][class*="px-"]:not(aside *),
                .admin-panel button[type="submit"][class*="py-5"]:not(aside *),
                .admin-panel button[type="submit"][class*="flex-1"]:not(aside *) {
                    background: #1F2937 !important;
                    color: #ffffff !important;
                    border: 1px solid #1F2937 !important;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
                }
                .admin-panel button.bg-primary:not(aside *):hover,
                .admin-panel a.bg-primary:not(aside *):hover,
                .admin-panel button[class*="bg-primary"]:not(aside *):hover,
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="px-"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="py-5"]:not(aside *):hover,
                .admin-panel button[type="submit"][class*="flex-1"]:not(aside *):hover {
                    background: #374151 !important;
                    border-color: #374151 !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                    transform: translateY(-1px) !important;
                }

                /* Dark mode secondary buttons */
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

                /* --- Pagination Footer --- */
                html:not(.dark) .admin-panel [class*="bg-surface-alt/50"],
                html:not(.dark) .admin-panel .bg-surface-alt\\/50,
                html:not(.dark) .admin-panel [class*="border-t"]:not(aside) {
                    background-color: #F8F9FB !important;
                    border-top: 1px solid #E5E7EB !important;
                    padding: 1rem 1.25rem !important;
                    border-bottom-left-radius: 12px !important;
                    border-bottom-right-radius: 12px !important;
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
                    border-color: #C89B2B !important;
                    color: #C89B2B !important;
                    background-color: rgba(200, 155, 43, 0.15) !important;
                }

                /* --- Badges --- */
                .admin-panel .rounded-full.border {
                    padding: 0.2rem 0.6rem !important;
                    font-weight: 600 !important;
                    font-size: 0.75rem !important;
                }

                /* --- Responsiveness --- */
                @media (max-width: 640px) {
                    .admin-panel main {
                        padding: 0.75rem !important;
                    }
                    .admin-panel .grid {
                        gap: 0.75rem !important;
                    }
                }
                @media (max-width: 1024px) {
                    .admin-panel table {
                        min-width: 750px !important;
                    }
                }

                /* ==========================================
                   🎨 DARK MODE OVERRIDES
                   ========================================== */
                .dark .admin-panel {
                    --primary: #C89B2B !important;
                    --primary-foreground: #ffffff !important;
                    background-color: #0F172A !important;
                    color: #e2e8f0 !important;
                }

                .dark .admin-panel,
                .dark .admin-panel .bg-surface-alt,
                .dark .admin-panel [class*="bg-surface-alt"],
                .dark .admin-panel input:not(.bg-transparent),
                .dark .admin-panel select:not(.bg-transparent),
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #0F172A !important;
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

                /* Dark mode form controls */
                .dark .admin-panel label {
                    color: #cbd5e1!important;
                }
                .dark .admin-panel input:focus, 
                .dark .admin-panel select:focus, 
                .dark .admin-panel textarea:focus {
                    border-color: #C89B2B !important;
                    box-shadow: 0 0 0 3px rgba(200, 155, 43, 0.2) !important;
                }

                /* Dark mode dropdowns */
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

                /* Dark mode primary buttons */
                .dark .admin-panel button.bg-primary,
                .dark .admin-panel a.bg-primary,
                .dark .admin-panel .bg-primary,
                .dark .admin-panel button[type="submit"],
                .dark .admin-panel button:has(svg.lucide-plus) {
                    background: #C89B2B !important;
                    color: #ffffff !important;
                    border: 1px solid #C89B2B !important;
                }
                .dark .admin-panel button.bg-primary:hover,
                .dark .admin-panel a.bg-primary:hover,
                .dark .admin-panel .bg-primary:hover,
                .dark .admin-panel button[type="submit"]:hover,
                .dark .admin-panel button:has(svg.lucide-plus):hover {
                    background: #D4A930 !important;
                    border-color: #D4A930 !important;
                }

                /* Dark mode secondary buttons */
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
                   📐 SPACING COMPRESSION
                   ========================================== */
                .admin-panel main {
                    padding: 1rem !important;
                }
                @media (min-width: 640px) {
                    .admin-panel main {
                        padding: 1.25rem !important;
                    }
                }
                @media (min-width: 1024px) {
                    .admin-panel main {
                        padding: 1.5rem !important;
                    }
                }

                .admin-panel table th,
                html:not(.dark) .admin-panel table th {
                    padding: 0.5rem 0.875rem !important;
                }
                .admin-panel table td,
                html:not(.dark) .admin-panel table td {
                    padding: 0.5rem 0.875rem !important;
                }

                .admin-panel .p-10 { padding: 1.25rem !important; }
                .admin-panel .p-8 { padding: 1rem !important; }
                .admin-panel .p-6 { padding: 0.875rem !important; }
                .admin-panel .p-5 { padding: 0.75rem !important; }
                .admin-panel .p-4 { padding: 0.625rem !important; }

                .admin-panel .px-10 { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
                .admin-panel .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
                .admin-panel .px-6 { padding-left: 0.875rem !important; padding-right: 0.875rem !important; }

                .admin-panel .py-12 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
                .admin-panel .py-10 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
                .admin-panel .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
                .admin-panel .py-6 { padding-top: 0.875rem !important; padding-bottom: 0.875rem !important; }

                /* SVG Color Enforcements */
                html:not(.dark) .admin-panel svg[style*="color"] *,
                html:not(.dark) .admin-panel svg[style*="stroke"] * {
                    stroke: currentColor !important;
                }
                html:not(.dark) .admin-panel [class*="text-"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-"] * {
                    stroke: currentColor !important;
                }

                /* Green/emerald SVGs */
                html:not(.dark) .admin-panel [class*="text-emerald"] svg,
                html:not(.dark) .admin-panel [class*="text-emerald"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-emerald"],
                html:not(.dark) .admin-panel svg[class*="text-emerald"] *,
                html:not(.dark) .admin-panel [class*="text-green"] svg,
                html:not(.dark) .admin-panel [class*="text-green"] svg * {
                    color: #059669 !important;
                    stroke: #059669 !important;
                }

                /* Red/rose SVGs */
                html:not(.dark) .admin-panel [class*="text-rose"] svg,
                html:not(.dark) .admin-panel [class*="text-rose"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-rose"],
                html:not(.dark) .admin-panel svg[class*="text-rose"] *,
                html:not(.dark) .admin-panel [class*="text-red"] svg,
                html:not(.dark) .admin-panel [class*="text-red"] svg * {
                    color: #dc2626 !important;
                    stroke: #dc2626 !important;
                }

                /* Gold/amber SVGs */
                html:not(.dark) .admin-panel [class*="text-amber"] svg,
                html:not(.dark) .admin-panel [class*="text-amber"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-amber"],
                html:not(.dark) .admin-panel svg[class*="text-amber"] *,
                html:not(.dark) .admin-panel [class*="text-primary"] svg,
                html:not(.dark) .admin-panel [class*="text-primary"] svg * {
                    color: #C89B2B !important;
                    stroke: #C89B2B !important;
                }

                /* Blue SVGs */
                html:not(.dark) .admin-panel [class*="text-blue"] svg,
                html:not(.dark) .admin-panel [class*="text-blue"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-blue"],
                html:not(.dark) .admin-panel svg[class*="text-blue"] * {
                    color: #2563eb !important;
                    stroke: #2563eb !important;
                }

                /* Orange SVGs */
                html:not(.dark) .admin-panel [class*="text-orange"] svg,
                html:not(.dark) .admin-panel [class*="text-orange"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-orange"],
                html:not(.dark) .admin-panel svg[class*="text-orange"] * {
                    color: #ea580c !important;
                    stroke: #ea580c !important;
                }

                /* Violet/purple SVGs */
                html:not(.dark) .admin-panel [class*="text-violet"] svg,
                html:not(.dark) .admin-panel [class*="text-violet"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-violet"],
                html:not(.dark) .admin-panel svg[class*="text-violet"] *,
                html:not(.dark) .admin-panel [class*="text-purple"] svg,
                html:not(.dark) .admin-panel [class*="text-purple"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-purple"],
                html:not(.dark) .admin-panel svg[class*="text-purple"] * {
                    color: #7c3aed !important;
                    stroke: #7c3aed !important;
                }

                /* Slate/gray SVGs */
                html:not(.dark) .admin-panel [class*="text-slate"] svg,
                html:not(.dark) .admin-panel [class*="text-slate"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-slate"],
                html:not(.dark) .admin-panel svg[class*="text-slate"] *,
                html:not(.dark) .admin-panel [class*="text-gray"] svg,
                html:not(.dark) .admin-panel [class*="text-gray"] svg *,
                html:not(.dark) .admin-panel svg[class*="text-gray"],
                html:not(.dark) .admin-panel svg[class*="text-gray"] * {
                    color: #475569 !important;
                    stroke: #475569 !important;
                }

                /* Rounded icon containers */
                html .admin-panel .rounded-full:has(svg),
                html .admin-panel div[class*="w-"][class*="h-"]:has(svg) {
                    border-radius: 10px !important;
                }

                /* Recharts focus fix */
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

            <StylistSidebar
                collapsed={collapsed}
                setCollapsed={handleSetCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[230px]'
                    }`}
            >
                <Topbar onMenuClick={() => setMobileOpen(true)} />

                <main className="animate-reveal p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
