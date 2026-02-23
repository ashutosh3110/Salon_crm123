import { Package, AlertTriangle, Truck, ArrowLeftRight, TrendingDown, BarChart3 } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────
const stockStats = [
    { label: 'Total Products', value: 248, icon: Package, color: 'amber' },
    { label: 'Low Stock', value: 12, icon: AlertTriangle, color: 'red' },
    { label: 'Pending Orders', value: 3, icon: Truck, color: 'blue' },
    { label: 'Transfers', value: 2, icon: ArrowLeftRight, color: 'violet' },
];

const lowStockItems = [
    { id: 1, name: 'L\'Oréal Hair Colour — Black', sku: 'LOR-HC-001', stock: 2, minStock: 10, unit: 'pcs' },
    { id: 2, name: 'Schwarzkopf Shampoo 500ml', sku: 'SCH-SH-002', stock: 3, minStock: 8, unit: 'bottles' },
    { id: 3, name: 'OPI Gel Nail Polish — Red', sku: 'OPI-NP-005', stock: 1, minStock: 5, unit: 'pcs' },
    { id: 4, name: 'Wella Conditioner 1L', sku: 'WEL-CD-003', stock: 4, minStock: 10, unit: 'bottles' },
    { id: 5, name: 'Disposable Capes (50 pcs)', sku: 'DSP-CP-010', stock: 1, minStock: 5, unit: 'packs' },
];

const recentMovements = [
    { id: 1, type: 'in', product: 'Matrix Hair Serum', qty: 20, source: 'Beauty Hub Supplies', time: 'Today' },
    { id: 2, type: 'out', product: 'L\'Oréal Hair Colour', qty: 3, source: 'Service Usage', time: 'Today' },
    { id: 3, type: 'transfer', product: 'Schwarzkopf Shampoo', qty: 5, source: 'Outlet 1 → Outlet 2', time: 'Yesterday' },
    { id: 4, type: 'in', product: 'OPI Gel Nail Polish', qty: 12, source: 'Lotus Cosmetics', time: 'Yesterday' },
    { id: 5, type: 'out', product: 'Wella Conditioner', qty: 2, source: 'Retail Sale', time: 'Yesterday' },
];

const movementStyles = {
    in: { bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'STOCK IN' },
    out: { bg: 'bg-red-100', text: 'text-red-600', label: 'USED/SOLD' },
    transfer: { bg: 'bg-violet-100', text: 'text-violet-600', label: 'TRANSFER' },
};

export default function InventoryDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stockStats.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 flex items-center justify-center`}>
                            <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-text">{s.value}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Low Stock Alert */}
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h2 className="text-sm font-extrabold text-text">Low Stock Alerts</h2>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] text-white font-bold bg-red-400 ml-auto">{lowStockItems.length}</span>
                    </div>
                    <div className="divide-y divide-border">
                        {lowStockItems.map((item) => {
                            const percent = Math.round((item.stock / item.minStock) * 100);
                            return (
                                <div key={item.id} className="px-5 py-3.5">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-text truncate">{item.name}</p>
                                            <p className="text-[10px] text-text-muted">SKU: {item.sku}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-sm font-black text-red-500">{item.stock} <span className="text-text-muted font-normal text-[10px]">/ {item.minStock} {item.unit}</span></p>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${percent <= 25 ? 'bg-red-400' : 'bg-amber-400'}`} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Stock Movements */}
                <div className="bg-white rounded-2xl border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                        <h2 className="text-sm font-extrabold text-text">Recent Stock Movements</h2>
                    </div>
                    <div className="divide-y divide-border">
                        {recentMovements.map((mv) => {
                            const style = movementStyles[mv.type];
                            return (
                                <div key={mv.id} className="px-5 py-3.5 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                                        {mv.type === 'in' ? <Truck className={`w-4 h-4 ${style.text}`} /> :
                                            mv.type === 'out' ? <TrendingDown className={`w-4 h-4 ${style.text}`} /> :
                                                <ArrowLeftRight className={`w-4 h-4 ${style.text}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-text truncate">{mv.product}</p>
                                        <p className="text-[10px] text-text-muted truncate">{mv.source} • {mv.time}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-black ${style.text}`}>{mv.type === 'out' ? '-' : '+'}{mv.qty}</p>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>{style.label}</span>
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
