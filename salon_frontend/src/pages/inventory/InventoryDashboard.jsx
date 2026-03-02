import { useState } from 'react';
import { Package, AlertTriangle, Truck, ArrowLeftRight, TrendingDown, BarChart3, MapPin, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

export default function InventoryDashboard() {
    const { stats, lowStockItems, movements, outlets, getOutletStats, products } = useInventory();
    const [selectedOutlet, setSelectedOutlet] = useState('all');

    const stockStats = [
        { label: 'Total SKUs', value: stats.totalProducts, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Low Stock', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    ];

    const movementStyles = {
        in: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'STOCK IN' },
        out: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'USED/SOLD' },
        transfer: { bg: 'bg-violet-500/10', text: 'text-violet-500', label: 'TRANSFER' },
    };

    // Movements filtered by outlet
    const filteredMovements = selectedOutlet === 'all'
        ? movements
        : movements.filter(m => m.outlet === selectedOutlet || m.type === 'transfer');

    return (
        <div className="space-y-6">
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stockStats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-surface rounded-2xl border border-border/40 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center border border-border/10 shrink-0`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Outlet-wise Stock Summary ── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Stock by Outlet</h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                    {outlets.map((outlet, i) => {
                        const os = getOutletStats(outlet.id);
                        const lowCount = products.filter(p => {
                            const s = p.stockByOutlet?.[outlet.id] || 0;
                            return s > 0 && s <= Math.ceil(p.minStock / outlets.length);
                        }).length;
                        return (
                            <motion.div
                                key={outlet.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="bg-surface rounded-3xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all group cursor-default"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-xl ${outlet.color} flex items-center justify-center`}>
                                            {outlet.isWarehouse
                                                ? <Package className="w-4 h-4 text-white" />
                                                : <MapPin className="w-4 h-4 text-white" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-text">{outlet.name}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                                                {outlet.isWarehouse ? 'Central Warehouse' : 'Retail Outlet'}
                                            </p>
                                        </div>
                                    </div>
                                    {lowCount > 0 && (
                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-500 uppercase">
                                            {lowCount} low
                                        </span>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { label: 'Products', value: os.totalProducts, color: 'text-text' },
                                        { label: 'Units', value: os.totalStock, color: 'text-primary' },
                                        { label: 'Value', value: `₹${(os.totalValue / 1000).toFixed(1)}k`, color: 'text-emerald-600' },
                                    ].map(m => (
                                        <div key={m.label} className="bg-background rounded-xl p-2 border border-border/10">
                                            <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{m.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Per-product breakdown toggle */}
                                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                                    {products
                                        .filter(p => (p.stockByOutlet?.[outlet.id] || 0) > 0)
                                        .slice(0, 4)
                                        .map(p => {
                                            const outletStock = p.stockByOutlet?.[outlet.id] || 0;
                                            const pct = Math.min((outletStock / (p.minStock || 1)) * 100, 100);
                                            const isLow = outletStock <= Math.ceil(p.minStock / 3);
                                            return (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <p className="text-[10px] font-bold text-text-secondary flex-1 truncate">{p.name.split(' ').slice(0, 3).join(' ')}</p>
                                                    <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden border border-border/10">
                                                        <div
                                                            className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-black w-8 text-right ${isLow ? 'text-rose-500' : 'text-text'}`}>{outletStock}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom: Alerts + Movements ── */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Low Stock Alerts */}
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2 bg-surface/50">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h2 className="text-sm font-extrabold text-text">Low Stock Alerts</h2>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] text-white font-black bg-rose-500 ml-auto shadow-lg shadow-rose-500/20">
                            {lowStockItems.length}
                        </span>
                    </div>
                    <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                        {lowStockItems.length === 0 ? (
                            <div className="px-5 py-6 text-center text-[11px] font-bold text-text-muted">All stock levels are healthy ✓</div>
                        ) : lowStockItems.map((item) => {
                            const percent = Math.round((item.stock / item.minStock) * 100);
                            return (
                                <div key={item.id} className="px-5 py-3.5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-text truncate">{item.name}</p>
                                            <p className="text-[10px] text-text-muted">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-sm font-black text-rose-500">
                                                {item.stock} <span className="text-text-muted font-normal text-[10px]">/ {item.minStock} {item.unit}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border/5">
                                        <div
                                            className={`h-full rounded-full ${percent <= 25 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    {/* Per-outlet breakdown for low stock items */}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {outlets.map(ol => {
                                            const s = item.stockByOutlet?.[ol.id] || 0;
                                            return (
                                                <span key={ol.id} className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-background text-text-muted border border-border/20">
                                                    {ol.short}: {s}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Stock Movements */}
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-border/40 bg-surface/50 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-text">Recent Movements</h2>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSelectedOutlet('all')}
                                className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase transition-all ${selectedOutlet === 'all' ? 'bg-primary text-white' : 'bg-background text-text-muted hover:text-text border border-border/40'}`}
                            >All</button>
                            {outlets.map(o => (
                                <button
                                    key={o.id}
                                    onClick={() => setSelectedOutlet(o.id)}
                                    className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase transition-all ${selectedOutlet === o.id ? 'bg-primary text-white' : 'bg-background text-text-muted hover:text-text border border-border/40'}`}
                                >
                                    {o.short}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                        {filteredMovements.map((mv) => {
                            const style = movementStyles[mv.type] || movementStyles.out;
                            const outletInfo = outlets.find(o => o.id === mv.outlet);
                            return (
                                <div key={mv.id} className="px-5 py-3.5 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                                        {mv.type === 'in' ? <Truck className={`w-4 h-4 ${style.text}`} /> :
                                            mv.type === 'out' ? <TrendingDown className={`w-4 h-4 ${style.text}`} /> :
                                                <ArrowLeftRight className={`w-4 h-4 ${style.text}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-text truncate">{mv.product}</p>
                                        <p className="text-[10px] text-text-muted truncate">
                                            {mv.source}
                                            {outletInfo && <span className="ml-1 font-bold text-primary/70">• {outletInfo.short}</span>}
                                            {' • '}{mv.time}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-black ${style.text}`}>
                                            {mv.type === 'out' ? '-' : '+'}{mv.qty}
                                        </p>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>
                                            {style.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
