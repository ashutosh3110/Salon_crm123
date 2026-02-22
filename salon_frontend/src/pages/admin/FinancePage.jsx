import React, { useState } from 'react';
import {
    TrendingUp,
    Users,
    FileText,
    DollarSign,
    Wallet,
    ClipboardList,
    Lock,
    Download,
    DownloadCloud,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import FinanceDashboard from '../../components/admin/finance/FinanceDashboard';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';
import ExpenseTracker from '../../components/admin/finance/ExpenseTracker';
import CashAndBank from '../../components/admin/finance/CashAndBank';
import TaxReports from '../../components/admin/finance/TaxReports';
import EndOfDay from '../../components/admin/finance/EndOfDay';

export default function FinancePage({ tab = 'dashboard' }) {
    const activeTab = tab;

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Finance Management</h1>
                    <p className="text-sm text-text-secondary mt-1 font-medium">Monitor revenue, track expenses, and manage supplier settlements.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:bg-secondary transition-all">
                        <DownloadCloud className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active">
                        <Calendar className="w-4 h-4" />
                        Select Period
                    </button>
                </div>
            </div>

            {/* Global KPI bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FinanceKPICard title="Revenue" value="₹12.45L" icon={TrendingUp} color="blue" trend="+12.5%" />
                <FinanceKPICard title="Total Expenses" value="₹2.82L" icon={ArrowDownRight} color="rose" trend="8 Items Pending" />
                <FinanceKPICard title="Supplier Due" value="₹84,200" icon={Users} color="orange" trend="3 Overdue" />
                <FinanceKPICard title="Net Profit" value="₹9.63L" icon={TrendingUp} color="emerald" trend="77% Margin" />
            </div>

            {/* Main Panel */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden min-h-[650px]">
                {activeTab === 'dashboard' && <FinanceDashboard />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
                {activeTab === 'expenses' && <ExpenseTracker />}
                {activeTab === 'reconciliation' && <CashAndBank />}
                {activeTab === 'tax' && <TaxReports />}
                {activeTab === 'eod' && <EndOfDay />}
            </div>
        </div>
    );
}

function FinanceKPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'bg-primary/5 text-primary',
        rose: 'bg-rose-50 text-rose-600',
        orange: 'bg-orange-50 text-orange-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${color === 'rose' || color === 'orange' ? 'text-rose-500' : 'text-text-muted'}`}>
                    {trend}
                </span>
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-widest opacity-60">{title}</h3>
                <div className="text-2xl font-bold text-text">{value}</div>
            </div>
        </div>
    );
}
