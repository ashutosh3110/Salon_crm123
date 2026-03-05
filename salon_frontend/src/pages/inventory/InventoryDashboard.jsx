import { useState } from 'react';
import { Package, AlertTriangle, Truck, ArrowLeftRight, TrendingDown, BarChart3, MapPin, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    ComposedChart,
    Line,
    Area
} from 'recharts';

export default function InventoryDashboard() {
    const { stats, lowStockItems, expiryAlerts, movements, outlets, getOutletStats, products } = useInventory();
    const [selectedOutlet, setSelectedOutlet] = useState('all');

    const stockStats = [
        { label: 'Total SKUs', value: stats.totalProducts, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Low Stock', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    ];

    const outletDistribution = outlets.map(o => {
        const os = getOutletStats(o.id);
        return { name: o.short, value: os.totalValue, color: o.color.includes('blue') ? '#3b82f6' : o.color.includes('emerald') ? '#10b981' : '#f59e0b' };
    });

    const stockLevelData = products.slice(0, 8).map(p => ({
        name: p.name.split(' ')[0],
        current: p.stock,
        minimum: p.minStock
    }));

    const movementStyles = {
        in: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'STOCK IN' },
        out: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'USED/SOLD' },
        transfer: { bg: 'bg-violet-500/10', text: 'text-violet-500', label: 'TRANSFER' },
    };

    const filteredMovements = selectedOutlet === 'all'
        ? movements
        : movements.filter(m => m.outlet === selectedOutlet || m.type === 'transfer');

    return (
        <div className="space-y-6 font-black text-left">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stockStats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-surface rounded-2xl border border-border/40 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                        <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center border border-border/10 shrink-0`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div className="text-left font-black">
                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-surface p-6 rounded-3xl border border-border/40 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Inventory Level Analysis</h2>
                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-1">Current Stock vs Minimum Threshold</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-none bg-primary" />
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-none bg-rose-500" />
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter">Minimum</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={stockLevelData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                                <Bar dataKey="current" fill="var(--primary)" barSize={15} />
                                <Line type="monotone" dataKey="minimum" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-3xl border border-border/40 shadow-sm flex flex-col">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest mb-6">Value Distribution</h2>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={outletDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {outletDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 mt-6">
                        {outletDistribution.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-none" style={{ backgroundColor: item.color }} />
                                    <span className="text-text-muted">{item.name} Outlet</span>
                                </div>
                                <span className="text-text">₹{(item.value / 1000).toFixed(1)}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Outlet-wise Stock Summary */}
            <div className="text-left font-black">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-black text-text uppercase tracking-widest text-left">Stock by Outlet</h2>
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
                                className="bg-surface rounded-3xl border border-border/40 p-5 shadow-sm hover:shadow-md transition-all group cursor-default text-left font-black"
                            >
                                <div className="flex items-center justify-between mb-4 text-left font-black">
                                    <div className="flex items-center gap-2.5 text-left font-black">
                                        <div className={`w-8 h-8 rounded-xl ${outlet.color} flex items-center justify-center shrink-0`}>
                                            {outlet.isWarehouse
                                                ? <Package className="w-4 h-4 text-white" />
                                                : <MapPin className="w-4 h-4 text-white" />
                                            }
                                        </div>
                                        <div className="text-left font-black">
                                            <p className="text-sm font-black text-text">{outlet.name}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest text-left">
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

                                <div className="grid grid-cols-3 gap-2 text-center font-black">
                                    {[
                                        { label: 'Products', value: os.totalProducts, color: 'text-text' },
                                        { label: 'Units', value: os.totalStock, color: 'text-primary' },
                                        { label: 'Value', value: `₹${(os.totalValue / 1000).toFixed(1)}k`, color: 'text-emerald-600' },
                                    ].map(m => (
                                        <div key={m.label} className="bg-background rounded-xl p-2 border border-border/10 text-left">
                                            <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5 text-left">{m.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 space-y-2 max-h-32 overflow-y-auto scrollbar-thin text-left font-black">
                                    {products
                                        .filter(p => (p.stockByOutlet?.[outlet.id] || 0) > 0)
                                        .slice(0, 4)
                                        .map(p => {
                                            const outletStock = p.stockByOutlet?.[outlet.id] || 0;
                                            const pct = Math.min((outletStock / (p.minStock || 1)) * 100, 100);
                                            const isLow = outletStock <= Math.ceil(p.minStock / 3);
                                            return (
                                                <div key={p.id} className="flex items-center gap-2 text-left font-black">
                                                    <p className="text-[10px] font-bold text-text-secondary flex-1 truncate text-left">{p.name.split(' ').slice(0, 3).join(' ')}</p>
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

            {/* Bottom Grid */}
            <div className="grid lg:grid-cols-3 gap-4 text-left font-black">
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm text-left">
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2 bg-surface/50 text-left">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h2 className="text-sm font-extrabold text-text">Low Stock Alerts</h2>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] text-white font-black bg-rose-500 ml-auto shadow-lg shadow-rose-500/20">
                            {lowStockItems.length}
                        </span>
                    </div>
                    <div className="divide-y divide-border/40 max-h-72 overflow-y-auto text-left">
                        {lowStockItems.length === 0 ? (
                            <div className="px-5 py-6 text-center text-[11px] font-bold text-text-muted">All stock levels are healthy ✓</div>
                        ) : lowStockItems.map((item) => {
                            const percent = Math.round((item.stock / item.minStock) * 100);
                            return (
                                <div key={item.id} className="px-5 py-3.5 text-left font-black">
                                    <div className="flex items-center justify-between mb-1.5 text-left">
                                        <div className="min-w-0 flex-1 text-left font-black">
                                            <p className="text-sm font-bold text-text truncate text-left">{item.name}</p>
                                            <p className="text-[10px] text-text-muted text-left">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3 font-black">
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
                                    <div className="flex gap-2 mt-2 flex-wrap text-left font-black">
                                        {outlets.map(ol => {
                                            const s = item.stockByOutlet?.[ol.id] || 0;
                                            return (
                                                <span key={ol.id} className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-background text-text-muted border border-border/20 text-left">
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

                {/* Expiry Alerts */}
                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm text-left">
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2 bg-surface/50 text-left">
                        <Package className="w-4 h-4 text-orange-500" />
                        <h2 className="text-sm font-extrabold text-text">Expiry Alerts</h2>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] text-white font-black bg-orange-500 ml-auto shadow-lg shadow-orange-500/20">
                            {expiryAlerts.length}
                        </span>
                    </div>
                    <div className="divide-y divide-border/40 max-h-72 overflow-y-auto text-left">
                        {expiryAlerts.length === 0 ? (
                            <div className="px-5 py-6 text-center text-[11px] font-bold text-text-muted">No items near expiry ✓</div>
                        ) : expiryAlerts.map((item) => {
                            const remainingDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                            const isExpired = remainingDays <= 0;
                            return (
                                <div key={item.id} className="px-5 py-3.5 text-left font-black">
                                    <div className="flex items-center justify-between mb-1.5 text-left">
                                        <div className="min-w-0 flex-1 text-left font-black">
                                            <p className="text-sm font-bold text-text truncate text-left">{item.name}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-tighter ${isExpired ? 'text-rose-500' : 'text-orange-500'}`}>
                                                {isExpired ? 'EXPIRED' : `Expires in ${remainingDays} days`}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3 font-black">
                                            <p className="text-[10px] text-text-muted">EXP: {item.expiryDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2 flex-wrap text-left font-black">
                                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-background text-text-muted border border-border/20 text-left">
                                            Stock: {item.stock} {item.unit}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border/40 overflow-hidden shadow-sm text-left font-black">
                    <div className="px-5 py-4 border-b border-border/40 bg-surface/50 flex items-center justify-between text-left">
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
                    <div className="divide-y divide-border/40 max-h-72 overflow-y-auto text-left">
                        {filteredMovements.map((mv) => {
                            const style = movementStyles[mv.type] || movementStyles.out;
                            const outletInfo = outlets.find(o => o.id === mv.outlet);
                            return (
                                <div key={mv.id} className="px-5 py-3.5 flex items-center gap-3 text-left font-black">
                                    <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                                        {mv.type === 'in' ? <Truck className={`w-4 h-4 ${style.text}`} /> :
                                            mv.type === 'out' ? <TrendingDown className={`w-4 h-4 ${style.text}`} /> :
                                                <ArrowLeftRight className={`w-4 h-4 ${style.text}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-bold text-text truncate text-left">{mv.product}</p>
                                        <p className="text-[10px] text-text-muted truncate text-left uppercase">
                                            {mv.source}
                                            {outletInfo && <span className="ml-1 font-bold text-primary/70">• {outletInfo.short}</span>}
                                            {' • '}{mv.time}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0 font-black">
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
