import { useState } from 'react';
import { AlertTriangle, Package, ShoppingCart, RefreshCw, Zap, X, CheckCircle2, Plus, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';
import { useNavigate } from 'react-router-dom';

export default function LowStockAlertsPage() {
    const { lowStockItems, expiryAlerts, stats, addPurchase, updateStock } = useInventory();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('low-stock'); // 'low-stock' | 'expiry'
    const [bulkModal, setBulkModal] = useState(false);
    const [reorderModal, setReorderModal] = useState(null); // product being re-ordered
    const [reorderQty, setReorderQty] = useState('');
    const [reorderSupplier, setReorderSupplier] = useState('Beauty Hub Supplies');
    const [toast, setToast] = useState(null);

    const criticalCount = lowStockItems.filter(p => p.stock <= p.minStock * 0.5).length;

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Bulk re-order: create a purchase order for all low-stock items
    const handleBulkOrder = (e) => {
        e.preventDefault();
        const supplier = e.target[0].value;
        const totalAmt = lowStockItems.reduce((s, p) => s + ((p.reorderQty || p.minStock * 2) * p.costPrice), 0);
        addPurchase({
            supplier,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: totalAmt,
            items: lowStockItems.length,
            status: 'Pending',
        });
        setBulkModal(false);
        showToast(`Bulk PO created for ${lowStockItems.length} items — ₹${totalAmt.toLocaleString()}`);
    };

    // Single re-order: create PO + optionally stock-in immediately
    const handleReorder = (e) => {
        e.preventDefault();
        const qty = Number(reorderQty);
        if (!qty || qty <= 0) return;
        addPurchase({
            supplier: reorderSupplier,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: qty * (reorderModal.costPrice || 0),
            items: 1,
            status: 'Pending',
        });
        setReorderModal(null);
        setReorderQty('');
        showToast(`Re-order created for ${reorderModal.name} — ${qty} units`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Intelligence & Alerts</h1>
                    <p className="text-sm text-text-muted font-medium">Critical signals regarding inventory lifecycle and stock levels</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/inventory/purchase')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-border/40 rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-alt transition-colors">
                        <Truck className="w-4 h-4" /> Purchases
                    </button>
                    <button onClick={() => setBulkModal(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all">
                        <ShoppingCart className="w-4 h-4" /> Bulk Purchase Order
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div onClick={() => setActiveTab('low-stock')} className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 ${activeTab === 'low-stock' ? 'bg-rose-500 border-rose-500 shadow-xl shadow-rose-500/20' : 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'low-stock' ? 'bg-white/20' : 'bg-rose-500/10'}`}>
                            <AlertTriangle className={`w-6 h-6 ${activeTab === 'low-stock' ? 'text-white' : 'text-rose-500'}`} />
                        </div>
                    </div>
                    <p className={`text-4xl font-black ${activeTab === 'low-stock' ? 'text-white' : 'text-rose-500'}`}>{lowStockItems.length}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activeTab === 'low-stock' ? 'text-white/80' : 'text-text-secondary'}`}>Low Stock Alerts</p>
                </div>

                <div onClick={() => setActiveTab('expiry')} className={`cursor-pointer rounded-3xl border p-6 transition-all duration-300 ${activeTab === 'expiry' ? 'bg-amber-500 border-amber-500 shadow-xl shadow-amber-500/20' : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'expiry' ? 'bg-white/20' : 'bg-amber-500/10'}`}>
                            <Zap className={`w-6 h-6 ${activeTab === 'expiry' ? 'text-white' : 'text-amber-500'}`} />
                        </div>
                    </div>
                    <p className={`text-4xl font-black ${activeTab === 'expiry' ? 'text-white' : 'text-amber-500'}`}>{expiryAlerts.length}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${activeTab === 'expiry' ? 'text-white/80' : 'text-text-secondary'}`}>Expiry Signals</p>
                </div>

                <div className="bg-surface rounded-3xl border border-border/40 p-6 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Pending Orders</span>
                    <p className="text-4xl font-black text-text mt-4">{stats.pendingOrders}</p>
                </div>

                <div className="bg-surface rounded-3xl border border-border/40 p-6 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Value at Risk</span>
                    <p className="text-4xl font-black text-primary mt-4">₹{(lowStockItems.reduce((s, p) => s + ((p.reorderQty || p.minStock * 2) * p.costPrice), 0) / 1000).toFixed(1)}k</p>
                </div>
            </div>

            {activeTab === 'low-stock' ? (
                /* Critical Low Stock List */
                <div className="grid gap-4">
                    {lowStockItems.length === 0 ? (
                        <div className="bg-surface rounded-3xl border border-border/40 p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="font-black text-text uppercase">All Stock Levels Healthy</p>
                            <p className="text-sm text-text-muted mt-1">No items below minimum threshold</p>
                        </div>
                    ) : lowStockItems.map((item, idx) => {
                        const progress = Math.round((item.stock / item.minStock) * 100);
                        const suggestedQty = item.reorderQty || item.minStock * 2;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-surface rounded-3xl border border-border/40 p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-rose-500/30 transition-all"
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
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">SKU: {item.sku}</span>
                                            <span className="text-text-muted text-[10px]">•</span>
                                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Stock: {item.stock} {item.unit}</span>
                                            <span className="text-text-muted text-[10px]">•</span>
                                            <span className="text-[10px] font-bold text-text-muted uppercase">Min: {item.minStock}</span>
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
                                    <p className="text-[9px] text-text-muted font-bold px-1">Suggested reorder: <span className="text-primary">{suggestedQty} {item.unit}</span> · Est. ₹{(suggestedQty * item.costPrice).toLocaleString()}</p>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 md:w-56">
                                    <div className="text-right flex-1 md:flex-none">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-0.5 whitespace-nowrap">Supplier</p>
                                        <p className="text-xs font-bold text-text whitespace-nowrap">{item.supplier || 'Not set'}</p>
                                    </div>
                                    <button
                                        onClick={() => { setReorderModal(item); setReorderQty(String(suggestedQty)); setReorderSupplier(item.supplier || 'Beauty Hub Supplies'); }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0">
                                        Re-order
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* Expiry Alerts List */
                <div className="grid gap-4">
                    {expiryAlerts.length === 0 ? (
                        <div className="bg-surface rounded-3xl border border-border/40 p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <p className="font-black text-text uppercase">No Expiring Products</p>
                            <p className="text-sm text-text-muted mt-1">All batches are within their safe lifecycle</p>
                        </div>
                    ) : expiryAlerts.map((item, idx) => {
                        const remainingDays = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isExpired = remainingDays <= 0;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-surface rounded-3xl border border-border/40 p-6 shadow-sm flex items-center gap-6 group hover:border-amber-500/30 transition-all ${isExpired ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-border/10 ${isExpired ? 'bg-rose-500 text-white' : 'bg-amber-500/10 text-amber-600'}`}>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">SKU: {item.sku}</span>
                                            <span className="text-text-muted text-[10px]">•</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isExpired ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                                {isExpired ? 'EXPIRED' : `${remainingDays} DAYS LEFT`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Expiry Date</p>
                                    <p className={`text-base font-black ${isExpired ? 'text-rose-600' : 'text-text'}`}>{item.expiryDate}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Bulk Purchase Order Modal ── */}
            <AnimatePresence>
                {bulkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setBulkModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-[28px] border border-border/40 shadow-2xl overflow-hidden relative p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Bulk Purchase Order</h2>
                                    <p className="text-[10px] font-bold text-text-muted mt-0.5">{lowStockItems.length} items · Est. ₹{(lowStockItems.reduce((s, p) => s + ((p.reorderQty || p.minStock * 2) * p.costPrice), 0) / 1000).toFixed(1)}k</p>
                                </div>
                                <button onClick={() => setBulkModal(false)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Item list */}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-5">
                                {lowStockItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/10">
                                        <div>
                                            <p className="text-xs font-bold text-text">{item.name}</p>
                                            <p className="text-[9px] text-text-muted font-bold">Current: {item.stock} → Order: {item.reorderQty || item.minStock * 2}</p>
                                        </div>
                                        <span className="text-xs font-black text-primary">₹{((item.reorderQty || item.minStock * 2) * item.costPrice).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleBulkOrder} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Supplier</label>
                                    <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none">
                                        <option>Beauty Hub Supplies</option>
                                        <option>Lotus Cosmetics</option>
                                        <option>Matrix Distribution</option>
                                        <option>Wella Direct</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all">
                                    Create Bulk Purchase Order
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Single Re-order Modal ── */}
            <AnimatePresence>
                {reorderModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReorderModal(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Re-order Item</h2>
                                    <p className="text-[10px] font-bold text-primary mt-0.5">{reorderModal.name}</p>
                                </div>
                                <button onClick={() => setReorderModal(null)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-5 text-center p-3 bg-background rounded-2xl border border-border/10">
                                <div><p className="text-lg font-black text-rose-500">{reorderModal.stock}</p><p className="text-[9px] font-bold text-text-muted uppercase">Current</p></div>
                                <div><p className="text-lg font-black text-amber-500">{reorderModal.minStock}</p><p className="text-[9px] font-bold text-text-muted uppercase">Minimum</p></div>
                                <div><p className="text-lg font-black text-primary">₹{reorderModal.costPrice}</p><p className="text-[9px] font-bold text-text-muted uppercase">Unit Cost</p></div>
                            </div>

                            <form onSubmit={handleReorder} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Order Qty</label>
                                        <input type="number" required min="1"
                                            className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-black focus:border-primary outline-none"
                                            value={reorderQty} onChange={e => setReorderQty(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Est. Cost</label>
                                        <div className="px-4 py-3 rounded-xl bg-background border border-border/10 text-sm font-black text-primary">
                                            ₹{(Number(reorderQty || 0) * reorderModal.costPrice).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Supplier</label>
                                    <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                        value={reorderSupplier} onChange={e => setReorderSupplier(e.target.value)}>
                                        <option>Beauty Hub Supplies</option>
                                        <option>Lotus Cosmetics</option>
                                        <option>Matrix Distribution</option>
                                        <option>Wella Direct</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all">
                                    Create Purchase Order
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border border-border/40 rounded-2xl shadow-2xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-bold text-text">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
