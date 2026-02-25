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
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Asset Inventory</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Monitor stock dynamics & logistics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-surface border border-border px-6 py-2.5 rounded-none text-[10px] font-extrabold text-text-muted hover:bg-surface-alt hover:shadow-md transition-all uppercase tracking-widest">
                        <Download className="w-3.5 h-3.5" />
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
    const trendColors = {
        rose: 'text-rose-500',
        emerald: 'text-emerald-500',
        blue: 'text-primary',
        orange: 'text-orange-500'
    };

    return (
        <div className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            {/* Soft Glow Effect */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-none blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-text-muted transition-colors group-hover:text-primary" />
                        <h3 className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${trendColors[color] || 'text-text-muted'}`}>
                        {trend}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <div className="text-3xl font-black text-text tracking-tight uppercase">
                        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                    </div>
                    <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        <svg width="50" height="15" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={trendColors[color]}>
                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
