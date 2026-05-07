import React, { useState, useMemo } from 'react';
import {
    Plus,
    Download,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    PieChart as PieIcon,
    Smartphone,
    ClipboardList,
    LayoutGrid as LayoutGridIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
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
import ShopCategoriesManager from '../../components/admin/inventory/ShopCategoriesManager';
import ProductCategoryManager from '../../components/admin/inventory/ProductCategoryManager';
import { useInventory } from '../../contexts/InventoryContext';
import { useNavigate } from 'react-router-dom'; // Added useNavigate for AddProductForm

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function InventoryPage({ tab = 'products' }) {
    const activeTab = tab;
    const navigate = useNavigate();
    const { products, addProduct, deleteProduct, updateProduct, duplicateProduct, stats, lowStockItems } = useInventory();
    const [editingProduct, setEditingProduct] = useState(null);

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
        <div className="space-y-4 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Logistics Registry</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">System :: Asset & SKU Management</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 text-[9px] font-black text-text-muted hover:bg-surface-alt hover:text-primary transition-all uppercase tracking-widest font-mono shadow-sm">
                        <Download className="w-3.5 h-3.5" /> Export Log
                    </button>
                    <button
                        onClick={() => navigate('/admin/inventory/products/new')}
                        className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest font-mono shadow-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> New Asset
                    </button>
                </div>
            </div>

            {/* Premium Tab Navigation - Compact */}
            <div className="flex items-center gap-0.5 border-b border-border/40 overflow-x-auto no-scrollbar">
                {[
                    { id: 'overview', label: 'Scan', icon: TrendingUp },
                    { id: 'products', label: 'Master', icon: Package },
                    { id: 'product-categories', label: 'Vectors', icon: LayoutGridIcon },
                    { id: 'shop-categories', label: 'App shop', icon: Smartphone },
                    { id: 'stock-in', label: 'Inbound', icon: Download },
                    { id: 'adjustment', label: 'Adjust', icon: ArrowDownRight },
                    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => navigate(`/admin/inventory/${t.id}`)}
                        className={`flex items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap font-mono ${
                            activeTab === t.id 
                            ? 'text-primary' 
                            : 'text-text-muted hover:text-text hover:bg-surface-alt'
                        }`}
                    >
                        <t.icon className={`w-3 h-3 ${activeTab === t.id ? 'text-primary' : 'text-text-muted'}`} />
                        {t.label}
                        {activeTab === t.id && (
                            <motion.div 
                                layoutId="activeInventoryTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Analytics Grid - Compact */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                        <InventoryStatCard title="Total SKU" value={stats.totalProducts} icon={TrendingUp} color="blue" trend="Catalog" />
                        <InventoryStatCard title="Critical" value={stats.lowStockCount} icon={AlertTriangle} color="rose" trend="Replenish" />
                        <InventoryStatCard title="Live" value={products.filter(p => p.status === 'active').length} icon={ArrowUpRight} color="emerald" trend="Active" />
                        <InventoryStatCard title="Cold" value={products.filter(p => p.status === 'inactive').length} icon={ArrowDownRight} color="orange" trend="Archived" />
                    </div>

                    <div className="bg-white p-4 border border-border flex flex-col justify-between group h-[120px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">Density Matrix</span>
                            <PieIcon className="w-3 h-3 text-primary" />
                        </div>
                        <div className="h-[60px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={15} outerRadius={28} paddingAngle={4} dataKey="value" stroke="transparent">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {categoryData.slice(0, 3).map(d => (
                                <div key={d.name} className="flex items-center gap-1">
                                    <div className="w-1 h-1" style={{ backgroundColor: d.color }} />
                                    <span className="text-[6px] font-black uppercase text-text-muted font-mono">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-4 border border-border flex flex-col justify-between group h-[120px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">Volume Load</span>
                            <Package className="w-3 h-3 text-primary" />
                        </div>
                        <div className="h-[60px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockVolumeData}>
                                    <Bar dataKey="stock" radius={0}>
                                        {stockVolumeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[6px] font-black uppercase text-text-muted text-center font-mono mt-1 italic">Top 6 Vectors</div>
                    </div>
                </div>
            )}

            {/* Main Content Container */}
            <div className="min-h-[650px] text-left font-black border-t border-border/20 pt-6">
                {activeTab === 'products' && !editingProduct && (
                    <ProductManager
                        products={products}
                        onDelete={deleteProduct}
                        onToggleStatus={(id) => {
                            const p = products.find(prod => prod.id === id);
                            if (p) updateProduct(id, { status: p.status === 'active' ? 'inactive' : 'active' });
                        }}
                        onEdit={(product) => {
                            setEditingProduct(product);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onDuplicate={duplicateProduct}
                    />
                )}
                {(activeTab === 'add-product' || editingProduct) && (
                    <AddProductForm
                        key={editingProduct?.id || 'new'}
                        onSave={(data) => {
                            if (editingProduct) {
                                updateProduct(editingProduct.id, data);
                                setEditingProduct(null);
                            } else {
                                addProduct(data);
                            }
                        }}
                        initialData={editingProduct}
                        onCancel={() => setEditingProduct(null)}
                    />
                )}
                {activeTab === 'stock-overview' && <StockOverview />}
                {activeTab === 'stock-in' && <StockIn />}
                {activeTab === 'adjustment' && <StockAdjustment />}
                {activeTab === 'alerts' && <LowStockAlerts />}
                {activeTab === 'shop-categories' && <ShopCategoriesManager />}
                {activeTab === 'product-categories' && <ProductCategoryManager />}
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
