import React, { useState, useEffect, useMemo } from 'react';
import { useInventory } from '../../../contexts/InventoryContext';
import {
    Search,
    MapPin,
    Tag,

    AlertTriangle,
    CheckCircle2,
    Package,
    RefreshCw,
    XCircle,
    ShieldAlert,
    Boxes,
} from 'lucide-react';

const getExpiryAlertInfo = (expiryDate) => {
    if (!expiryDate) return { status: 'none', message: 'No Expiry Set', color: 'text-text-muted border-border bg-surface-alt/50' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDate);
    expDate.setHours(0, 0, 0, 0);
    
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return {
            status: 'expired',
            message: `Expired (${Math.abs(diffDays)}d ago)`,
            color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
            days: diffDays
        };
    } else if (diffDays === 0) {
        return {
            status: 'expired_today',
            message: 'Expires Today',
            color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
            days: 0
        };
    } else if (diffDays <= 30) {
        return {
            status: 'near_expiry',
            message: `Expires in ${diffDays}d`,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            days: diffDays
        };
    } else {
        return {
            status: 'good',
            message: `Expires in ${diffDays}d`,
            color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
            days: diffDays
        };
    }
};

/**
 * Stock grid from InventoryContext.
 */
export default function StockOverview() {
    const { products, summary, stats, fetchInventorySummary, outlets: businessOutlets } = useInventory();
    const [search, setSearch] = useState('');
    const [outletFilter, setOutletFilter] = useState('All Outlets');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');

    const lines = useMemo(() => {
        const result = [];
        products.forEach(product => {
            if (product.stockByOutlet && typeof product.stockByOutlet === 'object') {
                Object.entries(product.stockByOutlet).forEach(([outletId, quantity]) => {
                    const outlet = businessOutlets.find(o => String(o._id || o.id) === String(outletId));
                    result.push({
                        productId: product.id || product._id,
                        name: product.name,
                        sku: product.sku,
                        category: product.categoryId?.name || product.category,
                        outletId,
                        outletName: outlet?.name || 'Main / Unknown',
                        quantity,
                        threshold: product.minStock || 5,
                        stockStatus: product.stockStatus || (quantity <= (product.minStock || 5) ? 'Low Stock' : 'In Stock'),
                        expiryDate: product.expiryDate
                    });
                });
            } else if (product.outletIds?.length > 0) {
                 // Fallback if stockByOutlet is not populated but outlets are assigned
                 product.outletIds.forEach(outletId => {
                    const outlet = businessOutlets.find(o => String(o._id || o.id) === String(outletId));
                    result.push({
                        productId: product.id || product._id,
                        name: product.name,
                        sku: product.sku,
                        category: product.categoryId?.name || product.category,
                        outletId,
                        outletName: outlet?.name || 'Main / Unknown',
                        quantity: 0,
                        threshold: product.minStock || 5,
                        stockStatus: 'Out of Stock',
                        expiryDate: product.expiryDate
                    });
                 });
            }
        });
        return result;
    }, [products, businessOutlets]);

    const availableCategories = useMemo(() => {
        let pool = lines;
        if (outletFilter !== 'All Outlets') {
            pool = pool.filter(l => String(l.outletId) === outletFilter || l.outletName === outletFilter);
        }
        return [...new Set(pool.map(p => p.category).filter(Boolean))].sort();
    }, [lines, outletFilter]);

    const availableOutlets = useMemo(() => {
        let pool = lines;
        if (categoryFilter !== 'All Categories') {
            pool = pool.filter(l => l.category === categoryFilter);
        }
        const map = new Map();
        pool.forEach(l => {
            if (!map.has(String(l.outletId))) map.set(String(l.outletId), l.outletName);
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name));
    }, [lines, categoryFilter]);

    const filteredStock = useMemo(() => {
        const q = search.trim().toLowerCase();
        return lines.filter((item) => {
            const matchesSearch =
                !q ||
                item.name?.toLowerCase().includes(q) ||
                item.sku?.toLowerCase().includes(q);
            const matchesOutlet =
                outletFilter === 'All Outlets' ||
                item.outletName === outletFilter ||
                String(item.outletId) === outletFilter;
            const matchesCategory =
                categoryFilter === 'All Categories' || item.category === categoryFilter;
            return matchesSearch && matchesOutlet && matchesCategory;
        });
    }, [lines, search, outletFilter, categoryFilter]);

    // Dynamic stats based on filter
    const activeSKUs = useMemo(() => new Set(filteredStock.map(s => s.productId)).size, [filteredStock]);
    const activeNodes = useMemo(() => new Set(filteredStock.map(s => s.outletId)).size, [filteredStock]);

    // ── Summary card stats ──
    const cardStats = useMemo(() => {
        const totalProducts = filteredStock.length;
        const inStock = filteredStock.filter(item => item.quantity > item.threshold).length;
        const outOfStock = filteredStock.filter(item => item.quantity === 0).length;
        const critical = filteredStock.filter(item => item.quantity > 0 && item.quantity <= item.threshold).length;
        const expiredCount = filteredStock.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date()).length;
        return { totalProducts, inStock, outOfStock, critical, expiredCount };
    }, [filteredStock]);

    const expiredProductsList = useMemo(() => {
        return filteredStock.filter(item => item.expiryDate && new Date(item.expiryDate) < new Date());
    }, [filteredStock]);

    if (!products.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
                <Package className="w-10 h-10 opacity-20" />
                <p className="text-sm font-semibold italic">Registry Empty :: No SKU Vectors Found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 pb-4 border-b border-border/40">
                <div className="text-left leading-none">
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Global Density Matrix</h2>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-[0.1em]">
                        Real-time Asset Distribution · SKU x Outlet Vector
                        <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-primary font-semibold">
                            {activeSKUs} MATCHING SKUs · {activeNodes} ACTIVE NODES
                        </span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        fetchInventorySummary();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt border border-border/40 text-[9px] font-semibold text-primary uppercase tracking-[0.1em] hover:bg-primary/5 transition-all shadow-sm allow-curve rounded-lg"
                >
                    <RefreshCw className="w-3 h-3" />
                    Synchronize Registry
                </button>
            </div>

            {/* ── Stock Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 border-b border-border/40">
                {/* Total Products */}
                <div className="relative overflow-hidden allow-curve rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/10 via-surface to-surface p-3.5 group hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Boxes className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Total Products</p>
                    <p className="text-2xl font-black text-blue-500 mt-0.5 tracking-tight">{cardStats.totalProducts}</p>
                </div>

                {/* In Stock */}
                <div className="relative overflow-hidden allow-curve rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/10 via-surface to-surface p-3.5 group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">In Stock</p>
                    <p className="text-2xl font-black text-emerald-500 mt-0.5 tracking-tight">{cardStats.inStock}</p>
                </div>

                {/* Out of Stock */}
                <div className="relative overflow-hidden allow-curve rounded-xl border border-border/50 bg-gradient-to-br from-rose-500/10 via-surface to-surface p-3.5 group hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Out of Stock</p>
                    <p className="text-2xl font-black text-rose-500 mt-0.5 tracking-tight">{cardStats.outOfStock}</p>
                </div>

                {/* Critical */}
                <div className="relative overflow-hidden allow-curve rounded-xl border border-border/50 bg-gradient-to-br from-amber-500/10 via-surface to-surface p-3.5 group hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Critical</p>
                    <p className="text-2xl font-black text-amber-500 mt-0.5 tracking-tight">{cardStats.critical}</p>
                </div>

                {/* Expired Products */}
                <div className="relative overflow-hidden allow-curve rounded-xl border border-border/50 bg-gradient-to-br from-rose-600/10 via-surface to-surface p-3.5 group hover:shadow-lg hover:shadow-rose-600/5 transition-all duration-300">
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-rose-600/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Expired Products</p>
                    <p className="text-2xl font-black text-rose-600 mt-0.5 tracking-tight">{cardStats.expiredCount}</p>
                </div>
            </div>

            {/* Expired Products Cards Section */}
            {expiredProductsList.length > 0 && (
                <div className="p-5 border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 allow-curve rounded-3xl animate-reveal mb-6 shadow-sm mx-2">
                    <div className="text-left mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
                                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Quarantine Registry</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expired items needing immediate replacement or disposal</p>
                                </div>
                            </div>
                        </div>
                        <span className="px-4 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            {expiredProductsList.length} Expired Batches
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {expiredProductsList.map((item) => {
                            const daysAgo = Math.ceil((new Date() - new Date(item.expiryDate)) / (1000 * 60 * 60 * 24));
                            return (
                                <div 
                                    key={`expired-card-${item.productId}-${item.outletId}`} 
                                    className="relative overflow-hidden allow-curve rounded-2xl border border-slate-100 dark:border-slate-800 bg-surface p-4 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/30 transition-all duration-300 group text-left shadow-sm flex flex-col justify-between"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
                                    <div className="flex justify-between items-start gap-2 relative z-10 mb-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-rose-600 transition-colors leading-snug">{item.name}</span>
                                            <span className="text-[9px] font-medium text-slate-450 uppercase tracking-widest mt-0.5">SKU: {item.sku}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs relative z-10 pt-2.5 border-t border-slate-50 dark:border-slate-800/40">
                                        <div>
                                            <span className="block text-[8px] font-medium text-slate-450 uppercase tracking-wider">Outlet</span>
                                            <span className="font-normal text-slate-650 dark:text-slate-350 truncate block mt-0.5">{item.outletName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-medium text-slate-450 uppercase tracking-wider">Quantity</span>
                                            <span className="font-semibold text-rose-600 dark:text-rose-450 block mt-0.5">{item.quantity} units</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block text-[8px] font-medium text-slate-450 uppercase tracking-wider">Expired On</span>
                                            <span className="font-normal text-slate-650 dark:text-slate-350 block mt-0.5">{new Date(item.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2.5 border-t border-slate-50 dark:border-slate-800/40 flex justify-between items-center relative z-10">
                                        <span className="text-[8px] font-medium text-slate-450 uppercase tracking-wider">Quarantine Status</span>
                                        <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 text-[9px] font-semibold rounded-full uppercase tracking-widest border border-rose-200/50 dark:border-rose-900/30 text-center inline-flex items-center justify-center leading-tight">
                                            Expired {daysAgo}d ago
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter Header */}
            <div className="p-6 border-b border-border bg-surface/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search name or SKU…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={outletFilter}
                            onChange={(e) => setOutletFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        >
                            <option value="All Outlets">All outlets</option>
                            {availableOutlets.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                        >
                            <option value="All Categories">All categories</option>
                            {availableCategories.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 table-responsive no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-surface border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Product
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Category
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Outlet
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Qty
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Threshold
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Status
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Expiry Date
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">
                                Expiry Alert
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {lines.length === 0 && !loading && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-sm text-text-muted">
                                    No products or no outlets yet. Add outlets and products, then use Stock In to record
                                    quantities.
                                </td>
                            </tr>
                        )}
                        {lines.length > 0 && filteredStock.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-sm text-text-muted">
                                    No rows match your filters.
                                </td>
                            </tr>
                        )}
                        {filteredStock.map((item) => {
                            const stockLevel = item.stockStatus;
                            const isLow = stockLevel === 'Low Stock' || stockLevel === 'Critical';
                            const rowKey = `${item.productId}-${item.outletId ?? 'none'}`;
                            return (
                                <tr key={rowKey} className="hover:bg-surface/50 transition-colors group cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Package className="w-5 h-5 opacity-60" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-text tracking-tight">{item.name}</span>
                                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                                    SKU: {item.sku}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-surface text-text-secondary text-[9px] font-bold rounded-md uppercase tracking-wider border border-border">
                                            {item.category || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-text-secondary font-medium text-xs">{item.outletName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-sm font-bold ${isLow ? 'text-rose-600' : 'text-text'}`}
                                        >
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold text-text-muted">{item.threshold}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isLow ? (
                                            <div className="flex items-center gap-1.5 text-rose-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {stockLevel}
                                                </span>
                                            </div>
                                        ) : stockLevel === 'No outlet' ? (
                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                                                Add an outlet
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {stockLevel === 'In Stock' ? 'OK' : stockLevel}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold text-text-secondary">
                                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.expiryDate ? (
                                            (() => {
                                                const alertInfo = getExpiryAlertInfo(item.expiryDate);
                                                return (
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider border ${alertInfo.color}`}>
                                                        {alertInfo.message}
                                                    </span>
                                                );
                                            })()
                                        ) : (
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">—</span>
                                        )}
                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

            </div>



            {/* Footer */}

            <div className="p-4 border-t border-border bg-surface/30">

                <div className="flex items-center justify-between px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">

                    <span>

                        Showing {filteredStock.length} of {lines.length} rows

                    </span>

                </div>

            </div>

        </div>

    );

}
