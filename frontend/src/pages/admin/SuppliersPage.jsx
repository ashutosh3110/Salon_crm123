import React, { useState, useEffect } from 'react';
import { Users, FileText, DownloadCloud, ChevronRight, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';

export default function SuppliersPage({ tab = 'directory' }) {
    const activeTab = tab;

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left border-b border-border pb-5">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Suppliers & Purchases
                    </h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-relaxed text-left max-w-2xl">
                        Supplier Profile Onboarding · <span className="font-mono">/suppliers/{activeTab}</span>
                        <span className="block mt-1.5 normal-case tracking-normal text-[11px] font-bold opacity-90">
                            Onboard product suppliers, track purchase prices, monitor pending invoice payments, and check discount credits.
                        </span>
                    </p>
                </div>
            </div>

            {/* Premium Modular tabbed layout wrapper */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[680px] text-left font-black">
                {activeTab === 'directory' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
            </div>
        </div>
    );
}
