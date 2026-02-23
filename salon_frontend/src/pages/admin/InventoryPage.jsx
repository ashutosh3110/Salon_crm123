import React, { useState } from 'react';
import {
    Package,
    LayoutDashboard,
    FileText,
    Bell,
    Download,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    AlertTriangle,
    History
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import StockOverview from '../../components/admin/inventory/StockOverview';
import StockIn from '../../components/admin/inventory/StockIn';
import StockAdjustment from '../../components/admin/inventory/StockAdjustment';
import LowStockAlerts from '../../components/admin/inventory/LowStockAlerts';

export default function InventoryPage({ tab = 'overview' }) {
    const activeTab = tab;

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Inventory Management</h1>
                    <p className="text-sm text-text-secondary mt-1 font-medium">Track stock levels, manage purchases, and monitor adjustments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:bg-secondary transition-all">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InventoryStatCard
                    title="Total Stock Value"
                    value="₹4,25,000"
                    icon={TrendingUp}
                    color="blue"
                    trend="+5.2%"
                />
                <InventoryStatCard
                    title="Low Stock Items"
                    value={12}
                    icon={AlertTriangle}
                    color="rose"
                    trend="Requires Restock"
                />
                <InventoryStatCard
                    title="Stock In (Monthly)"
                    value="₹82,400"
                    icon={ArrowUpRight}
                    color="emerald"
                    trend="8 Consignments"
                />
                <InventoryStatCard
                    title="Stock Out (Monthly)"
                    value="₹14,200"
                    icon={ArrowDownRight}
                    color="orange"
                    trend="Internal Use"
                />
            </div>

            {/* Main Content Container */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden min-h-[650px]">
                {activeTab === 'overview' && <StockOverview />}
                {activeTab === 'stock-in' && <StockIn />}
                {activeTab === 'adjustment' && <StockAdjustment />}
                {activeTab === 'alerts' && <LowStockAlerts />}
            </div>
        </div>
    );
}

function InventoryStatCard({ title, value, icon: Icon, color, trend }) {
    const colorClasses = {
        blue: 'bg-primary/5 text-primary',
        rose: 'bg-rose-50 text-rose-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${color === 'rose' ? 'text-rose-500' : 'text-text-muted'}`}>
                    {trend}
                </span>
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-xs font-semibold uppercase tracking-wider opacity-70">{title}</h3>
                <div className="text-2xl font-bold text-text">
                    {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                </div>
            </div>
        </div>
    );
}
