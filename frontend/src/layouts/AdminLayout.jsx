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
            {/* ── Global premium typography & spacious design overrides for Admin panel ── */}
            <style>{`
                /* --- Global Theme, Colors & Font Assignment --- */
                .admin-panel {
                    --primary: #b85c5c !important;
                    --primary-foreground: #ffffff !important;
                    --font-serif: 'Inter', sans-serif !important;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-size: 17px !important;
                    background-color: #faf9f9 !important;
                    color: #1e293b !important;
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

                /* --- Headers & Titles (Completely Sans-Serif, Inter, Clean, Uniform & Flat) --- */
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
                    font-weight: 800 !important;
                    font-style: normal !important; /* Force standard, clean, non-cursive upright text */
                    letter-spacing: -0.02em !important;
                    color: #0f172a !important;
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

                /* --- Spacious & Beautiful Tables --- */
                .admin-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                .admin-panel table th {
                    font-family: 'Poppins', 'Inter', sans-serif !important;
                    font-size: 0.825rem !important; /* ~13.2px */
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.08em !important;
                    color: #475569 !important; /* slate-600 */
                    background-color: #f8fafc !important; /* slate-50 */
                    padding: 1.2rem 1.5rem !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-align: left;
                }
                .admin-panel table td {
                    font-size: 0.95rem !important; /* ~15.2px */
                    padding: 1.35rem 1.5rem !important; /* Elegant spacious cell padding */
                    color: #334155 !important; /* slate-700 */
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    line-height: 1.5 !important;
                }
                .admin-panel table tr {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .admin-panel table tr:hover td {
                    background-color: #f8fafc !important; /* Subtle hover state */
                }
                
                .dark .admin-panel table th {
                    background-color: #121826 !important;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.08) !important;
                    color: #94a3b8 !important;
                }
                .dark .admin-panel table td {
                    color: #cbd5e1 !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
                }
                .dark .admin-panel table tr:hover td {
                    background-color: #121826 !important;
                }

                /* --- Premium Elevated Table Container Wrappers --- */
                .admin-panel .overflow-x-auto,
                .admin-panel .table-responsive,
                .admin-panel [class*="overflow-x-auto"] {
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
                .admin-panel label {
                    font-size: 0.85rem !important; /* ~13.6px */
                    font-weight: 600 !important;
                    color: #475569 !important; /* slate-600 */
                    margin-bottom: 0.5rem !important;
                    display: inline-block !important;
                }
                .admin-panel input, 
                .admin-panel select, 
                .admin-panel textarea {
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
                .admin-panel select {
                    padding-top: 0.45rem !important;
                    padding-bottom: 0.45rem !important;
                }
                .admin-panel input.pl-12,
                .admin-panel select.pl-12 {
                    padding-left: 3rem !important;
                }
                .admin-panel input.pl-14,
                .admin-panel select.pl-14 {
                    padding-left: 3.5rem !important;
                }
                .admin-panel input.pl-16,
                .admin-panel select.pl-16 {
                    padding-left: 4rem !important;
                }
                .admin-panel input.pl-10,
                .admin-panel select.pl-10 {
                    padding-left: 2.5rem !important;
                }
                .admin-panel input:focus, 
                .admin-panel select:focus, 
                .admin-panel textarea:focus {
                    border-color: #b85c5c !important; /* Crimson theme accent */
                    box-shadow: 0 0 0 4px rgba(184, 92, 92, 0.12) !important;
                    outline: none !important;
                }
                .dark .admin-panel input, 
                .dark .admin-panel select, 
                .dark .admin-panel textarea {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #ffffff !important;
                }

                /* --- Premium Cards --- */
                .admin-panel .bg-surface,
                .admin-panel .bg-white {
                    background-color: #ffffff !important;
                    border: 1px solid #f1f5f9 !important;
                    border-radius: 1.25rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03) !important;
                }
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-white {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.06) !important;
                }

                /* --- Dynamic & Premium Buttons --- */
                .admin-panel button,
                .admin-panel .inline-flex,
                .admin-panel a[class*="bg-primary"],
                .admin-panel button[class*="bg-primary"] {
                    font-family: 'Poppins', 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    border-radius: 0.75rem !important;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                /* Target Primary Buttons inside Admin Panel */
                .admin-panel button.bg-primary,
                .admin-panel a.bg-primary,
                .admin-panel .bg-primary,
                .admin-panel button[type="submit"],
                .admin-panel button[class*="bg-primary"],
                .admin-panel .inline-flex[class*="bg-primary"],
                .admin-panel button:has(svg.lucide-plus) {
                    background: #000000 !important;
                    color: #ffffff !important;
                    border: 1px solid #000000 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
                }
                .admin-panel button.bg-primary:hover,
                .admin-panel a.bg-primary:hover,
                .admin-panel .bg-primary:hover,
                .admin-panel button[type="submit"]:hover,
                .admin-panel button[class*="bg-primary"]:hover,
                .admin-panel .inline-flex[class*="bg-primary"]:hover,
                .admin-panel button:has(svg.lucide-plus):hover {
                    background: #262626 !important;
                    border-color: #262626 !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.15) !important;
                    transform: translateY(-1.5px) !important;
                }
                .admin-panel button.bg-primary:active,
                .admin-panel a.bg-primary:active,
                .admin-panel .bg-primary:active,
                .admin-panel button[type="submit"]:active,
                .admin-panel button[class*="bg-primary"]:active,
                .admin-panel button.bg-primary:not(aside *):active,
                .admin-panel a.bg-primary:not(aside *):active,
                .admin-panel .bg-primary:not(aside *):active,
                .admin-panel button[type="submit"]:not(aside *):active,
                .admin-panel button[class*="bg-primary"]:not(aside *):active,
                .admin-panel .inline-flex[class*="bg-primary"]:not(aside *):active {
                    transform: translateY(0.5px) scale(0.97) !important;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
                }

                /* Target Secondary, Outline & Text Buttons */
                .admin-panel button.bg-secondary:not(aside *),
                .admin-panel button.border:not(aside *),
                .admin-panel a.border:not(aside *),
                .admin-panel button[class*="border-"]:not(aside *),
                .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .admin-panel button:has(svg.lucide-eye):not(aside *),
                .admin-panel button:has(svg.lucide-edit):not(aside *) {
                    background-color: #ffffff !important;
                    border: 1px solid #cbd5e1 !important;
                    color: #334155 !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
                }
                .admin-panel button.bg-secondary:not(aside *):hover,
                .admin-panel button.border:not(aside *):hover,
                .admin-panel a.border:not(aside *):hover,
                .admin-panel button[class*="border-"]:not(aside *):hover,
                .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .admin-panel button:has(svg.lucide-edit):not(aside *):hover {
                    background-color: #f8fafc !important;
                    border-color: #94a3b8 !important;
                    color: #0f172a !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
                }
                
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button[class*="border-"]:not(aside *),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .admin-panel button[class*="border-"]:not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *):hover,
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }



                /* --- Custom Styled Premium Pagination Footer --- */
                .admin-panel [class*="bg-surface-alt/50"],
                .admin-panel .bg-surface-alt\/50,
                .admin-panel [class*="border-t"]:not(aside) {
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
                
                /* Pagination Buttons inside Footer */
                .admin-panel [class*="bg-surface-alt/50"] button:not(aside *),
                .admin-panel .bg-surface-alt\/50 button:not(aside *),
                .admin-panel [class*="border-t"] button:not(aside *) {
                    background-color: #ffffff !important;
                    border: 1px solid #cbd5e1 !important;
                    padding: 0.5rem 1.25rem !important;
                    border-radius: 0.75rem !important;
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    color: #475569 !important;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
                    transition: all 0.2s ease-in-out !important;
                }
                .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):hover,
                .admin-panel .bg-surface-alt\/50 button:not(aside *):hover,
                .admin-panel [class*="border-t"] button:not(aside *):hover {
                    border-color: #b85c5c !important;
                    color: #b85c5c !important;
                    background-color: rgba(184, 92, 92, 0.05) !important;
                    transform: translateY(-1px) !important;
                }
                .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):disabled,
                .admin-panel .bg-surface-alt\/50 button:not(aside *):disabled,
                .admin-panel [class*="border-t"] button:not(aside *):disabled {
                    opacity: 0.3 !important;
                    transform: none !important;
                    border-color: #cbd5e1 !important;
                    color: #94a3b8 !important;
                    background-color: #f1f5f9 !important;
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
                    border-color: #b85c5c !important;
                    color: #b85c5c !important;
                    background-color: rgba(184, 92, 92, 0.15) !important;
                }
                .dark .admin-panel [class*="bg-surface-alt/50"] button:not(aside *):disabled,
                .dark .admin-panel .bg-surface-alt\/50 button:not(aside *):disabled,
                .dark .admin-panel [class*="border-t"] button:not(aside *):disabled {
                    opacity: 0.25 !important;
                    background-color: #121826 !important;
                    color: #64748b !important;
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
                    --primary: #b85c5c !important;
                    --primary-foreground: #ffffff !important;
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
                .dark .admin-panel input,
                .dark .admin-panel select,
                .dark .admin-panel textarea,
                .dark [role="dialog"] input,
                .dark [role="dialog"] select,
                .dark [role="dialog"] textarea,
                .dark .fixed.inset-0 input,
                .dark .fixed.inset-0 select,
                .dark .fixed.inset-0 textarea {
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
                    border-color: #b85c5c !important;
                    box-shadow: 0 0 0 4px rgba(184, 92, 92, 0.25) !important;
                }

                /* --- SVG and Recharts Ticks & Lines in Dark Mode --- */
                .dark .admin-panel .recharts-cartesian-grid-horizontal line,
                .dark .admin-panel .recharts-cartesian-grid-vertical line {
                    stroke: rgba(255, 255, 255, 0.08) !important;
                }
                .dark .admin-panel .recharts-text {
                    fill: #94a3b8 !important;
                }
                .dark .admin-panel .recharts-legend-item-text {
                    color: #cbd5e1 !important;
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
