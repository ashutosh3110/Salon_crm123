import { AlertTriangle, Package, ShoppingCart, TrendingDown, RefreshCw, ChevronRight, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const criticalItems = [
    { id: 1, name: "L'Oréal Hair Colour — Black", sku: 'LOR-HC-001', stock: 2, minStock: 10, unit: 'pcs', lastOrdered: '12 days ago' },
    { id: 2, name: 'Schwarzkopf Shampoo 500ml', sku: 'SCH-SH-002', stock: 3, minStock: 8, unit: 'bottles', lastOrdered: '22 days ago' },
    { id: 3, name: 'OPI Gel Nail Polish — Red', sku: 'OPI-NP-005', stock: 1, minStock: 5, unit: 'pcs', lastOrdered: '5 days ago' },
    { id: 6, name: 'Disposable Capes (50 pcs)', sku: 'DSP-CP-010', stock: 3, minStock: 5, unit: 'packs', lastOrdered: '1 month ago' },
];

export default function LowStockAlertsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Low Stock Alerts</h1>
                    <p className="text-sm text-text-muted font-medium">Items requiring immediate re-ordering to avoid service disruption</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all">
                        <ShoppingCart className="w-4 h-4" /> Bulk Purchase Order
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-rose-500/5 group hover:bg-rose-500 rounded-3xl border border-rose-500/10 p-6 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                            <AlertTriangle className="w-6 h-6 text-rose-500 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase group-hover:text-white/80 tracking-widest bg-rose-500/10 group-hover:bg-white/20 px-2 py-1 rounded-lg transition-colors">Immediate Action</span>
                    </div>
                    <p className="text-4xl font-black text-rose-500 group-hover:text-white transition-colors">4</p>
                    <p className="text-xs font-bold text-text-secondary group-hover:text-white/80 uppercase tracking-widest mt-1">Critical Shortage Items</p>
                </div>

                <div className="bg-amber-500/5 group hover:bg-amber-500 rounded-3xl border border-amber-500/10 p-6 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                            <RefreshCw className="w-6 h-6 text-amber-500 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase group-hover:text-white/80 tracking-widest bg-amber-500/10 group-hover:bg-white/20 px-2 py-1 rounded-lg transition-colors">On Order</span>
                    </div>
                    <p className="text-4xl font-black text-amber-500 group-hover:text-white transition-colors">2</p>
                    <p className="text-xs font-bold text-text-secondary group-hover:text-white/80 uppercase tracking-widest mt-1">Pending Replenishments</p>
                </div>

                <div className="bg-primary/5 group hover:bg-primary rounded-3xl border border-primary/10 p-6 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                            <Package className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase group-hover:text-white/80 tracking-widest bg-primary/10 group-hover:bg-white/20 px-2 py-1 rounded-lg transition-colors">Weekly Target</span>
                    </div>
                    <p className="text-4xl font-black text-primary group-hover:text-white transition-colors">₹4.2k</p>
                    <p className="text-xs font-bold text-text-secondary group-hover:text-white/80 uppercase tracking-widest mt-1">Est. Fulfillment Cost</p>
                </div>
            </div>

            {/* Critical List */}
            <div className="grid gap-4">
                {criticalItems.map((item, idx) => {
                    const progress = Math.round((item.stock / item.minStock) * 100);
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface rounded-3xl border border-border/40 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-rose-500/30 transition-all text-left"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-background border border-border/10 flex items-center justify-center shrink-0 relative">
                                    <Package className="w-6 h-6 text-text-secondary group-hover:text-primary transition-colors" />
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center">
                                        <Zap className="w-3 h-3 fill-white" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-text uppercase tracking-tight line-clamp-1">{item.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">SKU: {item.sku}</span>
                                        <span className="text-text-muted text-[10px]">•</span>
                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Stock: {item.stock} {item.unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase">Inventory Health</span>
                                    <span className={`text-[10px] font-black uppercase ${progress <= 25 ? 'text-rose-500' : 'text-amber-500'}`}>{progress}% Remaining</span>
                                </div>
                                <div className="w-full h-2 bg-background border border-border/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${progress <= 25 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-amber-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 md:w-64">
                                <div className="text-right flex-1 md:flex-none">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5 whitespace-nowrap">Last Purchased</p>
                                    <p className="text-xs font-bold text-text whitespace-nowrap">{item.lastOrdered}</p>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                    Re-order
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
