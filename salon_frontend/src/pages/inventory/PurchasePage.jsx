import { useState } from 'react';
import { Truck, Plus, Search, Calendar, FileText, CheckCircle2, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

export default function PurchasePage() {
    const { purchases, addPurchase, updateStock } = useInventory();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Stock-In Form State
    const [stockIn, setStockIn] = useState({
        supplier: '',
        sku: '',
        qty: '',
        price: ''
    });

    const handleStockIn = (e) => {
        e.preventDefault();
        const success = updateStock(stockIn.sku, Number(stockIn.qty), 'in', stockIn.supplier);
        if (success) {
            alert('Stock updated successfully!');
            setStockIn({ supplier: '', sku: '', qty: '', price: '' });
        } else {
            alert('Product SKU not found!');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Purchase / Stock In</h1>
                    <p className="text-sm text-text-muted font-medium">Record incoming stock and manage supplier orders</p>
                </div>
                <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> New Purchase Order
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Active Suppliers / Quick Add */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest mb-4">Stock-In Entry</h2>
                        <form className="space-y-4 text-left" onSubmit={handleStockIn}>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Supplier</label>
                                <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors appearance-none scrollbar-hide"
                                    value={stockIn.supplier} onChange={(e) => setStockIn({ ...stockIn, supplier: e.target.value })}>
                                    <option value="">Select Supplier</option>
                                    <option>Beauty Hub Supplies</option>
                                    <option>Lotus Cosmetics</option>
                                    <option>Matrix Distribution</option>
                                </select>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Product SKU / Tag</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input required type="text" placeholder="Scan or type SKU..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        value={stockIn.sku} onChange={(e) => setStockIn({ ...stockIn, sku: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Quantity</label>
                                    <input required type="number" placeholder="0" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        value={stockIn.qty} onChange={(e) => setStockIn({ ...stockIn, qty: e.target.value })} />
                                </div>
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Unit Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                                        <input required type="number" placeholder="0.00" className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                            value={stockIn.price} onChange={(e) => setStockIn({ ...stockIn, price: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-background text-primary border-2 border-primary/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                Submit Stock-In
                            </button>
                        </form>
                    </div>

                    <div className="bg-emerald-500/5 rounded-3xl border border-emerald-500/10 p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-text-secondary leading-tight line-clamp-2">Batch automation is enabled. Stock levels will update instantly on submission.</p>
                        </div>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Recent Orders</h2>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Orders</button>
                    </div>
                    <div className="divide-y divide-border/40 whitespace-nowrap overflow-x-auto text-left">
                        {purchases.map((order) => (
                            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-background border border-border/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        <Truck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-black text-text uppercase">{order.id}</p>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${order.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-text-secondary">{order.supplier}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {order.date}</span>
                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {order.items} Items</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-text">₹{order.amount.toLocaleString()}</p>
                                    <button className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Details →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Purchase Order Modal */}
            <AnimatePresence>
                {isOrderModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOrderModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-surface w-full max-w-2xl rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">Create Purchase Order</h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Supplier Procurement</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOrderModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-6 text-left" onSubmit={(e) => {
                                    e.preventDefault();
                                    const supplier = e.target[0].value;
                                    const date = e.target[1].value;
                                    addPurchase({
                                        supplier,
                                        date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                                        amount: 0,
                                        items: 0,
                                        status: 'Pending'
                                    });
                                    setIsOrderModalOpen(false);
                                }}>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Target Supplier</label>
                                            <select required className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                                                <option>Beauty Hub Supplies</option>
                                                <option>Lotus Cosmetics</option>
                                                <option>Matrix Distribution</option>
                                                <option>Wella Direct</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Expected Delivery</label>
                                            <input required type="date" className="w-full px-5 py-3.5 rounded-2xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Order Items</h3>
                                            <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest">+ Add Row</button>
                                        </div>
                                        <div className="p-4 bg-background rounded-2xl border border-border/10 space-y-3">
                                            <div className="grid grid-cols-12 gap-3">
                                                <div className="col-span-6 bg-surface px-4 py-2 rounded-xl border border-border/40 text-[10px] font-bold text-text-secondary italic">Search product...</div>
                                                <div className="col-span-3 bg-surface px-4 py-2 rounded-xl border border-border/40 text-[10px] font-bold text-text-secondary text-center">Qty</div>
                                                <div className="col-span-3 bg-surface px-4 py-2 rounded-xl border border-border/40 text-[10px] font-bold text-text-secondary text-right">Ext. Price</div>
                                            </div>
                                            <p className="text-center py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">No items added to draft</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-primary uppercase">Draft Mode</p>
                                                <p className="text-[9px] font-bold text-text-secondary">Order will be saved as draft before finalization.</p>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
                                            Create PO Draft
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
