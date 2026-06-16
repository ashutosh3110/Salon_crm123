import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Moon, Sun, Search, Bell, LogOut, CheckCircle2, AlertTriangle, Info, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BaseRoleLayout — Reusable shell for all role-specific panels.
 * Accepts a SidebarComponent, brandColor, and title as props.
 */
export default function BaseRoleLayout({ SidebarComponent, title, accentColor = 'var(--color-primary)' }) {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Handle outside click to close notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { theme, toggleTheme } = useTheme();
    const activeAccentColor = accentColor === 'var(--color-primary)' ? 'var(--color-primary)' : accentColor;

    const effectiveCollapsed = collapsed && !isHovered;

    return (
        <div
            className="min-h-screen bg-background flex text-text transition-colors duration-300 admin-panel overflow-x-hidden"
            style={{ '--accent-color': activeAccentColor }}
        >
            <style>{`
                /* --- Global Theme & Font Assignment --- */
                html {
                    overscroll-behavior-y: none !important;
                }
                
                html:not(.dark) .admin-panel {
                    font-family: 'Inter', sans-serif !important;
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
                html:not(.dark) .admin-panel h1, 
                html:not(.dark) .admin-panel h2, 
                html:not(.dark) .admin-panel h3, 
                html:not(.dark) .admin-panel h4, 
                html:not(.dark) .admin-panel h5, 
                html:not(.dark) .admin-panel h6,
                html:not(.dark) .admin-panel .font-serif,
                html:not(.dark) .admin-panel [class*="font-serif"],
                html:not(.dark) .admin-panel .italic,
                html:not(.dark) .admin-panel [class*="italic"],
                html:not(.dark) [role="dialog"] h1,
                html:not(.dark) [role="dialog"] h2,
                html:not(.dark) [role="dialog"] h3,
                html:not(.dark) [role="dialog"] h4,
                html:not(.dark) [role="dialog"] h5,
                html:not(.dark) [role="dialog"] h6 {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    font-style: normal !important;
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
                html:not(.dark) .admin-panel input:focus, 
                html:not(.dark) .admin-panel select:focus, 
                html:not(.dark) .admin-panel textarea:focus {
                    border-color: var(--accent-color, #B4912B) !important;
                    box-shadow: 0 0 0 4px rgba(180, 145, 43, 0.12) !important;
                    outline: none !important;
                }

                /* --- Premium Cards --- */
                html:not(.dark) .admin-panel .bg-surface,
                html:not(.dark) .admin-panel .bg-white {
                    background-color: #ffffff !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03) !important;
                }

                /* --- Dynamic & Premium Buttons --- */
                .admin-panel button,
                .admin-panel .inline-flex,
                .admin-panel a[class*="bg-primary"],
                .admin-panel button[class*="bg-primary"] {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    border-radius: 0.75rem !important;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* Primary Buttons Dynamic Hover & Accent Styling */
                .admin-panel button.bg-primary,
                .admin-panel a.bg-primary,
                .admin-panel .bg-primary,
                .admin-panel button[type="submit"]:not([class*="bg-black"]):not([class*="bg-neutral"]):not([class*="bg-slate"]):not([class*="bg-white"]):not([class*="bg-rose"]):not([class*="bg-emerald"]):not([class*="bg-blue"]),
                .admin-panel button[class*="bg-primary"],
                .admin-panel .inline-flex[class*="bg-primary"],
                .admin-panel button:has(svg.lucide-plus):not([class*="bg-black"]):not([class*="bg-neutral"]):not([class*="bg-white"]):not([class*="bg-rose"]):not([class*="bg-emerald"]):not([class*="bg-blue"]):not([class*="bg-slate"]) {
                    background: var(--accent-color, #000000) !important;
                    color: #ffffff !important;
                    border: 1px solid var(--accent-color, #000000) !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
                }
                .admin-panel button.bg-primary:hover,
                .admin-panel a.bg-primary:hover,
                .admin-panel .bg-primary:hover,
                .admin-panel button[type="submit"]:not([class*="bg-black"]):not([class*="bg-neutral"]):not([class*="bg-slate"]):not([class*="bg-white"]):not([class*="bg-rose"]):not([class*="bg-emerald"]):not([class*="bg-blue"]):hover,
                .admin-panel button[class*="bg-primary"]:hover,
                .admin-panel .inline-flex[class*="bg-primary"]:hover,
                .admin-panel button:has(svg.lucide-plus):not([class*="bg-black"]):not([class*="bg-neutral"]):not([class*="bg-white"]):not([class*="bg-rose"]):not([class*="bg-emerald"]):not([class*="bg-blue"]):not([class*="bg-slate"]):hover {
                    opacity: 0.9 !important;
                    transform: translateY(-1.5px) !important;
                }

                /* Black & Neutral Buttons — Always visible in light mode */
                /* Use exact class selectors (.bg-black) not substring [class*="bg-black"]
                   to avoid matching hover:bg-black and breaking hover-only dark buttons */
                html:not(.dark) .admin-panel button.bg-black,
                html:not(.dark) .admin-panel a.bg-black {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    border-color: #000000 !important;
                }
                html:not(.dark) .admin-panel button.bg-black *,
                html:not(.dark) .admin-panel a.bg-black * {
                    color: #ffffff !important;
                }
                html:not(.dark) .admin-panel button.bg-neutral-800,
                html:not(.dark) .admin-panel button.bg-neutral-900,
                html:not(.dark) .admin-panel a.bg-neutral-800,
                html:not(.dark) .admin-panel a.bg-neutral-900 {
                    background-color: #1a1a1a !important;
                    color: #ffffff !important;
                    border-color: #1a1a1a !important;
                }
                html:not(.dark) .admin-panel button.bg-neutral-800 *,
                html:not(.dark) .admin-panel button.bg-neutral-900 *,
                html:not(.dark) .admin-panel a.bg-neutral-800 *,
                html:not(.dark) .admin-panel a.bg-neutral-900 * {
                    color: #ffffff !important;
                }

                /* ==========================================
                   🎨 PREMIUM DARK MODE OVERRIDES
                   ========================================== */
                .dark .admin-panel {
                    background-color: #121826 !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel .bg-white,
                .dark .admin-panel .bg-surface,
                .dark .admin-panel .bg-background,
                .dark .admin-panel .bg-slate-50,
                .dark .admin-panel [class*="bg-white"],
                .dark .admin-panel [class*="bg-surface"],
                .dark .admin-panel [class*="bg-background"],
                .dark .admin-panel [class*="bg-slate-50"] {
                    background-color: #1e293b !important;
                }
                .dark .admin-panel input:not(.bg-transparent), 
                .dark .admin-panel select:not(.bg-transparent), 
                .dark .admin-panel textarea:not(.bg-transparent) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #ffffff !important;
                }
                .dark .admin-panel label {
                    color: #cbd5e1 !important;
                }


                /* Secondary/Outline Buttons in Dark Mode */
                .dark .admin-panel button.bg-secondary:not(aside *),
                .dark .admin-panel button.border:not(aside *),
                .dark .admin-panel a.border:not(aside *),
                .dark .admin-panel button[class*="border-"]:not(aside *),
                .dark .admin-panel button[class*="bg-white"]:not(aside *),
                .dark .admin-panel button.bg-white:not(aside *),
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]),
                .dark .admin-panel button:has(svg.lucide-eye):not(aside *),
                .dark .admin-panel button:has(svg.lucide-edit):not(aside *),
                .dark .admin-panel button:has(svg.lucide-trash):not(aside *),
                .dark .admin-panel button:has(svg.lucide-plus):not(.bg-primary):not([class*="bg-primary"]):not(aside *) {
                    background-color: #1e293b !important;
                    border-color: rgba(255, 255, 255, 0.12) !important;
                    color: #cbd5e1 !important;
                }
                .dark .admin-panel button.bg-secondary:not(aside *):hover,
                .dark .admin-panel button.border:not(aside *):hover,
                .dark .admin-panel a.border:not(aside *):hover,
                .dark .admin-panel button[class*="border-"]:not(aside *):hover,
                .dark .admin-panel button[class*="bg-white"]:not(aside *):hover,
                .dark .admin-panel button.bg-white:not(aside *):hover,
                .dark .admin-panel [class*="border-border"] button:not(aside *):not(.bg-primary):not([class*="bg-primary"]):hover {
                    background-color: #121826 !important;
                    border-color: rgba(255, 255, 255, 0.25) !important;
                    color: #ffffff !important;
                }

                 /* --- BULLETPROOF LIGHT MODE SVG COLOR & STROKE VISIBILITY SYSTEM --- */
                /* By default, force all SVG icons and their paths to be dark slate/black in light mode for 100% visibility, EXCEPT those with inline style colors/strokes or text/stroke classes */
                html:not(.dark) .admin-panel svg:not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]),
                html:not(.dark) .admin-panel svg:not([style*="color"]):not([style*="stroke"]):not([class*="text-"]):not([class*="stroke-"]) * {
                    color: #1e293b !important;
                    stroke: #1e293b !important;
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

                /* EXCEPT if the SVG is inside a soft colored background container, force matching color */
                html:not(.dark) .admin-panel [class*="bg-emerald-"] svg,
                html:not(.dark) .admin-panel [class*="bg-emerald-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-green-"] svg,
                html:not(.dark) .admin-panel [class*="bg-green-"] svg *,
                html:not(.dark) .admin-panel [class*="bg-[#DCFCE7]"] svg,
                html:not(.dark) .admin-panel [class*="bg-[#DCFCE7]"] svg * {
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
                html:not(.dark) .admin-panel [class*="bg-[#DBEAFE]"] svg * {
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

            `}</style>
            {/* Sidebar */}
            <SidebarComponent
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isHovered={isHovered}
                setIsHovered={setIsHovered}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                accentColor={activeAccentColor}
            />

            {/* Main Content */}
            <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${effectiveCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 sm:h-20 bg-surface/80 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4 sm:px-8 gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden w-11 h-11 bg-surface border border-border/40 flex items-center justify-center hover:bg-surface-alt transition-all shadow-sm active:scale-95"
                        >
                            <Menu className="w-5.5 h-5.5 text-text" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-40 leading-none mb-1">Sector_Control</h2>
                            <p className="text-xs font-black text-text uppercase tracking-widest leading-none">{title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 font-black">
                        {/* Theme Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="w-10 h-10 sm:w-11 sm:h-11 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-surface-alt transition-colors border border-border/40"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-400" />
                            )}
                        </motion.button>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all border border-border/40 ${showNotifications ? 'bg-primary text-white' : 'bg-surface dark:bg-surface-alt hover:bg-surface-alt text-text-secondary'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 ring-2 ${showNotifications ? 'ring-primary' : 'ring-background dark:ring-surface'}`} />
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-surface dark:bg-surface-alt border border-border/40 shadow-2xl z-50 overflow-hidden"
                                    >
                                        {/* Dropdown Header */}
                                        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-surface-alt/30">
                                            <div>
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text mb-1">Incoming_Feed</h3>
                                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{unreadCount} Unread Alerts</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={markAllRead}
                                                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                                >
                                                    Clear_All
                                                </button>
                                                <button onClick={() => setShowNotifications(false)} className="hover:rotate-90 transition-all ml-1">
                                                    <X className="w-4 h-4 text-text-secondary" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dropdown List */}
                                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-1">
                                            {notifications.length === 0 ? (
                                                <div className="py-12 px-8 text-center">
                                                    <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center mx-auto mb-4">
                                                        <Bell className="w-5 h-5 text-text-muted opacity-30" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No Recent Notifications Found In Sector</p>
                                                </div>
                                            ) : notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => {
                                                        if (!n.isRead) markAsRead(n._id);
                                                    }}
                                                    className={`px-5 py-4 hover:bg-surface-alt/50 transition-colors border-b border-border/10 last:border-0 group cursor-pointer ${!n.isRead ? 'bg-primary/[0.02]' : 'opacity-60'}`}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={`mt-1 w-8 h-8 flex items-center justify-center border ${n.type?.includes('warning') || n.type?.includes('low') ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                                                n.type?.includes('confirm') || n.type?.includes('success') || n.type?.includes('payment') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                                    'bg-primary/10 border-primary/20 text-primary'
                                                            }`}>
                                                            {!n.isRead && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 border-2 border-surface" />}
                                                            {n.type?.includes('warning') || n.type?.includes('low') ? <AlertTriangle className="w-4 h-4" /> :
                                                                n.type?.includes('confirm') || n.type?.includes('success') || n.type?.includes('payment') ? <CheckCircle2 className="w-4 h-4" /> :
                                                                    <Info className="w-4 h-4" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className={`text-[11px] font-black uppercase tracking-tight text-text transition-colors ${!n.isRead ? 'group-hover:text-primary' : 'text-text-muted'}`}>{n.title}</h4>
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-text-muted">
                                                                    <Clock className="w-2.5 h-2.5" />
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className={`text-[10px] leading-normal font-bold ${!n.isRead ? 'text-text-secondary' : 'text-text-muted'}`}>
                                                                {n.body}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Dropdown Footer */}
                                        <button className="w-full py-3.5 bg-surface-alt/30 hover:bg-primary hover:text-white transition-all text-center text-[10px] font-black uppercase tracking-[0.2em] border-t border-border/40">
                                            View_Full_Dashboard →
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-3 sm:pl-4 ml-1 sm:ml-2 border-l border-border/40">
                            <div className="text-right hidden md:block leading-none">
                                <div className="text-[11px] font-black text-text uppercase tracking-tight">{user?.name || 'Auth_User'}</div>
                                <div className="text-[9px] text-text-muted uppercase tracking-[0.2em] mt-1">{user?.role || 'operator'}</div>
                            </div>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-inner">
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'AU'}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="w-10 h-10 bg-surface dark:bg-surface-alt flex items-center justify-center hover:bg-rose-500/10 group transition-colors border border-border/40 ml-1"
                            title="Logout"
                        >
                            <LogOut className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300 group-hover:text-rose-500" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full max-w-full p-3 sm:p-5 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div >
    );
}
