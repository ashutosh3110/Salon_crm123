import React, { useState, useEffect, useMemo } from 'react';
import { useInventory } from '../../../contexts/InventoryContext';
import {
    Search,
    MapPin,
    Tag,
    History,
    AlertTriangle,
    CheckCircle2,
    Package,
    RefreshCw,
} from 'lucide-react';

/**
 * Stock grid from InventoryContext.
 */
export default function StockOverview() {
    const { products, summary, fetchInventorySummary, outlets: businessOutlets } = useInventory();
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
                        stockStatus: product.stockStatus || (quantity <= (product.minStock || 5) ? 'Low Stock' : 'In Stock')
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
                        stockStatus: 'Out of Stock'
                    });
                 });
            }
        });
        return result;
    }, [products, businessOutlets]);

    const filteredStock = useMemo(() => {
        return lines.filter((item) => {
            const q = search.toLowerCase();
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 pb-6 border-b border-border/40">
                <div className="text-left font-black leading-none">
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Global Density Matrix</h2>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">
                        Real-time Asset Distribution :: SKU x Outlet Vector
                        <span className="ml-2 border-l border-border/60 pl-2">
                            {stats.skuCount} REGISTERED SKUs · {stats.outletCount} DEPLOYED NODES
                        </span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        fetchInventorySummary();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-alt border border-border/40 text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 transition-all italic shadow-sm"
                >
                    <RefreshCw className="w-3 h-3" />
                    Synchronize Registry
                </button>
            </div>

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
                            {businessOutlets.map((o) => (
                                <option key={String(o._id || o.id)} value={o.name}>
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
                            {categories.map((c) => (
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
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface text-right">
                                —
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {lines.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-text-muted">
                                    No products or no outlets yet. Add outlets and products, then use Stock In to record
                                    quantities.
                                </td>
                            </tr>
                        )}
                        {lines.length > 0 && filteredStock.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-text-muted">
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
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            title="History (coming soon)"
                                            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all"
                                        >
                                            <History className="w-4 h-4" />
                                        </button>
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
