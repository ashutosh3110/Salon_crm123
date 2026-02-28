import { BarChart3, TrendingDown, TrendingUp, Calendar, FileText, Download, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';
import { exportToExcel } from '../../utils/exportUtils';

export default function UsageReportsPage() {
    const { products, stats } = useInventory();

    const handleExport = () => {
        exportToExcel(products, 'Inventory_Stock_Report', 'Stock');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Inventory Usage Reports</h1>
                    <p className="text-sm text-text-muted font-medium">Analyze stock consumption patterns and optimize your supply chain</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Value', value: `₹${(stats.totalValue / 1000).toFixed(1)}k`, icon: BarChart3, sub: 'Current inventory worth' },
                    { label: 'Low Stock', value: stats.lowStockCount, icon: Package, sub: 'Items needing attention' },
                    { label: 'Pending POs', value: stats.pendingOrders, icon: TrendingDown, sub: 'Orders in transit' },
                    { label: 'Items', value: stats.totalProducts, icon: TrendingUp, sub: 'Unique SKUs tracked' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border/40 p-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border/10 flex items-center justify-center mb-4">
                            <s.icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-black text-text">{s.value}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{s.label}</p>
                        <p className="text-[9px] text-text-muted italic mt-2">{s.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Consumption Chart Placeholder */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 p-6 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-sm font-black text-text uppercase tracking-widest">Main Product Consumption</h2>
                            <p className="text-xs text-text-muted font-bold mt-1">Usage frequency vs Stock availability</p>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-background rounded-xl border border-border/10">
                            {['Units', 'Value'].map((t, i) => (
                                <button key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end gap-6 text-left">
                        {products.slice(0, 4).map((item, idx) => {
                            const growth = idx % 2 === 0 ? '+12%' : '-5%';
                            return (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-sm font-bold text-text">{item.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black flex items-center gap-1 ${growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {growth.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {growth}
                                            </span>
                                            <span className="text-sm font-black text-text">{item.stock} {item.unit}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-background rounded-full overflow-hidden border border-border/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((item.stock / 200) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, delay: idx * 0.1, ease: 'backOut' }}
                                            className="h-full bg-primary rounded-full relative shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.2)]"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Insights Side Panel */}
                <div className="space-y-6">
                    <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest mb-6">Stock Health Index</h2>
                        <div className="flex flex-col items-center py-4">
                            <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500/10 border-t-emerald-500 flex items-center justify-center -rotate-45 relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                <div className="rotate-45 text-center">
                                    <p className="text-2xl font-black text-text">92%</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Optimized</p>
                                </div>
                            </div>
                            <p className="text-xs text-text-muted font-medium text-center mt-8 leading-relaxed px-4">
                                Your inventory levels are highly optimized. Only <span className="text-rose-500 font-bold">2.4%</span> of products are at risk of expiration.
                            </p>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-3xl border border-primary/10 p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-text uppercase tracking-widest mb-1">New Report Available</p>
                            <p className="text-[11px] font-bold text-text-secondary leading-tight">Quarterly wastage analysis vs service peaks is ready to view.</p>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 hover:underline">Download PDf →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
