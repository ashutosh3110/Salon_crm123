import React from 'react';
import {
    Plus,
    Download,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import StockOverview from '../../components/admin/inventory/StockOverview';
import StockIn from '../../components/admin/inventory/StockIn';
import StockAdjustment from '../../components/admin/inventory/StockAdjustment';
import LowStockAlerts from '../../components/admin/inventory/LowStockAlerts';
import ProductManager from '../../components/admin/inventory/ProductManager';
import AddProductForm from '../../components/admin/inventory/AddProductForm';
import { useBusiness } from '../../contexts/BusinessContext';

export default function InventoryPage({ tab = 'products' }) {
    const activeTab = tab;
    const { products, addProduct, deleteProduct, toggleProductStatus } = useBusiness();

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text uppercase">Asset Inventory</h1>
                    <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Monitor stock dynamics & logistics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-surface border border-border px-6 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-secondary hover:shadow-md transition-all">
                        <Download className="w-4 h-4" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InventoryStatCard
                    title="Total SKU"
                    value={products.length}
                    icon={TrendingUp}
                    color="blue"
                    trend="Master Catalog"
                />
                <InventoryStatCard
                    title="Critical Stock"
                    value={products.filter(p => p.stock <= p.threshold).length}
                    icon={AlertTriangle}
                    color="rose"
                    trend="Replenish Now"
                />
                <InventoryStatCard
                    title="Live Assets"
                    value={products.filter(p => p.status === 'active').length}
                    icon={ArrowUpRight}
                    color="emerald"
                    trend="POS Ready"
                />
                <InventoryStatCard
                    title="Cold Assets"
                    value={products.filter(p => p.status === 'inactive').length}
                    icon={ArrowDownRight}
                    color="orange"
                    trend="Archived"
                />
            </div>

            {/* Main Content Container */}
            <div className="min-h-[650px]">
                {activeTab === 'products' && (
                    <ProductManager
                        products={products}
                        onDelete={deleteProduct}
                        onToggleStatus={toggleProductStatus}
                    />
                )}
                {activeTab === 'add-product' && (
                    <AddProductForm
                        onSave={addProduct}
                    />
                )}
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
        <div className="bg-white p-6 rounded-[32px] border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${colorClasses[color]} group-hover:scale-110 transition-transform shadow-inner`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${color === 'rose' ? 'text-rose-500 animate-pulse' : 'text-text-muted opacity-40'}`}>
                        {trend}
                    </span>
                </div>
                <div className="space-y-1">
                    <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-50">{title}</h3>
                    <div className="text-2xl font-bold text-text">
                        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                    </div>
                </div>
            </div>
        </div>
    );
}
