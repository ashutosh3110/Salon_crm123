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
                /* --- Global Theme & Font Assignment --- */
                .sa-panel {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    background-color: #faf9f9 !important;
                    color: #1e293b !important;
                }
                
                .sa-panel *,
                .sa-panel *::before,
                .sa-panel *::after {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    letter-spacing: -0.01em;
                }

                /* --- Headers & Titles --- */
                .sa-panel h1, 
                .sa-panel h2, 
                .sa-panel h3, 
                .sa-panel h4, 
                .sa-panel h5, 
                .sa-panel h6,
                .sa-panel .font-serif {
                    font-family: 'Poppins', 'Inter', sans-serif !important;
                    font-weight: 700 !important;
                    letter-spacing: -0.02em !important;
                    color: #0f172a !important;
                }

                /* --- Global Font Size Scale Amplifiers --- */
                .sa-panel .text-\[10px\] {
                    font-size: 12.5px !important;
                    letter-spacing: 0.02em !important;
                    font-weight: 600 !important;
                }
                .sa-panel .text-\[11px\] {
                    font-size: 13.5px !important;
                    letter-spacing: 0.01em !important;
                    font-weight: 500 !important;
                }
                .sa-panel .text-xs {
                    font-size: 0.875rem !important; /* ~14px instead of 12px */
                    line-height: 1.35rem !important;
                }
                .sa-panel .text-sm {
                    font-size: 0.975rem !important; /* ~15.6px instead of 14px */
                    line-height: 1.55rem !important;
                }
                .sa-panel .text-base {
                    font-size: 1.125rem !important; /* 18px instead of 16px */
                    line-height: 1.75rem !important;
                }
                .sa-panel .text-lg {
                    font-size: 1.25rem !important; /* 20px instead of 18px */
                    line-height: 1.875rem !important;
                }
                .sa-panel .text-xl {
                    font-size: 1.5rem !important; /* 24px instead of 20px */
                    line-height: 2rem !important;
                }
                .sa-panel .text-2xl {
                    font-size: 1.875rem !important; /* 30px instead of 24px */
                    line-height: 2.25rem !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.025em !important;
                }
                .sa-panel .text-3xl {
                    font-size: 2.25rem !important;
                    line-height: 2.5rem !important;
                    font-weight: 900 !important;
                    letter-spacing: -0.03em !important;
                }

                /* --- Spacious & Beautiful Tables --- */
                .sa-panel table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    width: 100% !important;
                }
                .sa-panel table th {
                    font-size: 0.825rem !important; /* ~13.2px */
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.06em !important;
                    color: #475569 !important; /* slate-600 */
                    background-color: #f8fafc !important; /* slate-50 */
                    padding: 1.1rem 1.5rem !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    text-align: left;
                }
                .sa-panel table td {
                    font-size: 0.95rem !important; /* ~15.2px */
                    padding: 1.25rem 1.5rem !important; /* Elegant spacious cell padding */
                    color: #334155 !important; /* slate-700 */
                    border-bottom: 1px solid #f1f5f9 !important;
                    vertical-align: middle !important;
                    line-height: 1.5 !important;
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
