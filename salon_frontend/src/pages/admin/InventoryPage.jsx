import React, { useMemo } from 'react';
import {
    Plus,
    Download,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    PieChart as PieIcon
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import StockOverview from '../../components/admin/inventory/StockOverview';
import StockIn from '../../components/admin/inventory/StockIn';
import StockAdjustment from '../../components/admin/inventory/StockAdjustment';
import LowStockAlerts from '../../components/admin/inventory/LowStockAlerts';
import ProductManager from '../../components/admin/inventory/ProductManager';
import AddProductForm from '../../components/admin/inventory/AddProductForm';
import { useBusiness } from '../../contexts/BusinessContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function InventoryPage({ tab = 'products' }) {
    const activeTab = tab;
    const { products, addProduct, deleteProduct, toggleProductStatus } = useBusiness();

    const categoryData = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return Object.keys(counts).map((cat, i) => ({
            name: cat,
            value: counts[cat],
            color: COLORS[i % COLORS.length]
        }));
    }, [products]);

    const stockVolumeData = useMemo(() => {
        return products.slice(0, 6).map((p, i) => ({
            name: p.name.split(' ')[0],
            stock: p.stock,
            color: COLORS[i % COLORS.length]
        }));
    }, [products]);

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div className="text-left font-black">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Logistics Registry</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">System :: asset_management_v2.0 // global_inventory</p>
                </div>
                <div className="flex gap-4 text-left">
                    <button className="flex items-center gap-3 bg-surface border border-border px-8 py-3.5 rounded-none text-[10px] font-black text-text-muted hover:bg-surface-alt hover:text-primary transition-all uppercase tracking-[0.2em] shadow-sm">
                        <Download className="w-4 h-4" /> Export Log
                    </button>
                    <button className="flex items-center gap-3 bg-primary text-white border border-primary px-8 py-3.5 rounded-none text-[10px] font-black hover:bg-primary-dark transition-all uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                        <Plus className="w-4 h-4" /> New Asset Entry
                    </button>
                </div>
            </div>

            {/* Top Analytics Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-left font-black">
                    <InventoryStatCard title="Total SKU" value={products.length} icon={TrendingUp} color="blue" trend="Master Catalog" />
                    <InventoryStatCard title="Critical Stock" value={products.filter(p => p.stock <= p.threshold).length} icon={AlertTriangle} color="rose" trend="Replenish Now" />
                    <InventoryStatCard title="Live Assets" value={products.filter(p => p.status === 'active').length} icon={ArrowUpRight} color="emerald" trend="POS Ready" />
                    <InventoryStatCard title="Cold Assets" value={products.filter(p => p.status === 'inactive').length} icon={ArrowDownRight} color="orange" trend="Archived" />
                </div>

                {/* Categorization Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Matrix Density</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left">
                        {categoryData.slice(0, 3).map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1.5 h-1.5 bg-primary rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Volumetric Load Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Volume Load</span>
                        <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stockVolumeData}>
                                <Bar dataKey="stock" radius={0}>
                                    {stockVolumeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center">Top 6 Stock Vectors</div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="min-h-[650px] text-left font-black border-t border-border/20 pt-6">
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
        <div className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left font-black">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />

            <div className="relative z-10 h-full flex flex-col justify-between text-left">
                <div className="flex justify-between items-start mb-4 text-left">
                    <div className="flex items-center gap-3 text-left">
                        <Icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{title}</h3>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${trendColors[color] || 'text-text-muted'} text-left`}>
                        {trend}
                    </span>
                </div>

                <div className="flex items-end justify-between text-left">
                    <div className="text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">
                        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
                    </div>
                    <div className="opacity-20 group-hover:opacity-100 transition-opacity stroke-[3px]">
                        <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={trendColors[color]}>
                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
