import { useState, useMemo } from 'react';
import { Truck, Plus, Search, Calendar, FileText, CheckCircle2, X, Package, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

const SUPPLIERS = ['Beauty Hub Supplies', 'Lotus Cosmetics', 'Matrix Distribution', 'Wella Direct'];

export default function PurchasePage() {
    const { purchases, addPurchase, updateStock, products } = useInventory();

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [detailOrder, setDetailOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [toast, setToast] = useState(null);

    // ── Stock-In form ────────────────────────────────────────
    const [stockIn, setStockIn] = useState({ supplier: '', sku: '', qty: '', price: '' });
    const [skuSuggestions, setSkuSuggestions] = useState([]);

    const handleStockIn = (e) => {
        e.preventDefault();
        const success = updateStock(stockIn.sku, Number(stockIn.qty), 'in', stockIn.supplier);
        if (success) {
            showToast(`Stock updated: +${stockIn.qty} units for SKU ${stockIn.sku}`);
            setStockIn({ supplier: '', sku: '', qty: '', price: '' });
        } else {
            showToast('Product SKU not found!', 'error');
        }
    };

    const handleSkuChange = (val) => {
        setStockIn(prev => ({ ...prev, sku: val }));
        if (val.length >= 2) {
            const matches = products.filter(p =>
                p.sku.toLowerCase().includes(val.toLowerCase()) ||
                p.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5);
            setSkuSuggestions(matches);
        } else {
            setSkuSuggestions([]);
        }
    };

    // ── New Purchase Order modal state ───────────────────────
    const [poForm, setPoForm] = useState({ supplier: SUPPLIERS[0], date: '' });
    const [poItems, setPoItems] = useState([{ productSearch: '', sku: '', name: '', qty: 1, price: 0, suggestions: [] }]);

    const addPoRow = () =>
        setPoItems(prev => [...prev, { productSearch: '', sku: '', name: '', qty: 1, price: 0, suggestions: [] }]);

    const removePoRow = (idx) =>
        setPoItems(prev => prev.filter((_, i) => i !== idx));

    const updatePoItem = (idx, field, val) => {
        setPoItems(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            if (field === 'productSearch' && val.length >= 2) {
                next[idx].suggestions = products.filter(p =>
                    p.name.toLowerCase().includes(val.toLowerCase()) ||
                    p.sku.toLowerCase().includes(val.toLowerCase())
                ).slice(0, 4);
            } else if (field === 'productSearch') {
                next[idx].suggestions = [];
            }
            return next;
        });
    };

    const selectPoProduct = (idx, product) => {
        setPoItems(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], productSearch: product.name, sku: product.sku, name: product.name, price: product.costPrice, suggestions: [] };
            return next;
        });
    };

    const poTotal = poItems.reduce((s, i) => s + (i.qty * i.price), 0);

    const handleCreatePO = (e) => {
        e.preventDefault();
        const validItems = poItems.filter(i => i.sku && i.qty > 0);
        if (validItems.length === 0) return showToast('Add at least one product item', 'error');
        addPurchase({
            supplier: poForm.supplier,
            date: poForm.date
                ? new Date(poForm.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: poTotal,
            items: validItems.length,
            status: 'Pending',
            lineItems: validItems,
        });
        setIsOrderModalOpen(false);
        setPoItems([{ productSearch: '', sku: '', name: '', qty: 1, price: 0, suggestions: [] }]);
        showToast(`Purchase Order created — ₹${poTotal.toLocaleString()}`);
    };

    // ── Filter ───────────────────────────────────────────────
    const filteredPurchases = useMemo(() =>
        filterStatus === 'All' ? purchases : purchases.filter(p => p.status === filterStatus),
        [purchases, filterStatus]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Purchase / Stock In</h1>
                    <p className="text-sm text-text-muted font-medium">Record incoming stock and manage supplier orders</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> New Purchase Order
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Stock-In Entry */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-3xl border border-border/40 p-6 shadow-sm">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest mb-4">Quick Stock-In</h2>
                        <form className="space-y-4 text-left" onSubmit={handleStockIn}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Supplier</label>
                                <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors appearance-none"
                                    value={stockIn.supplier} onChange={e => setStockIn({ ...stockIn, supplier: e.target.value })}>
                                    <option value="">Select Supplier</option>
                                    {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Product SKU / Name</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input required type="text" placeholder="Scan or type SKU..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        value={stockIn.sku} onChange={e => handleSkuChange(e.target.value)} />
                                </div>
                                {/* SKU autocomplete */}
                                {skuSuggestions.length > 0 && (
                                    <div className="absolute z-20 w-full bg-surface border border-border/40 rounded-xl shadow-xl overflow-hidden mt-1">
                                        {skuSuggestions.map(p => (
                                            <button key={p.sku} type="button"
                                                onClick={() => { setStockIn(prev => ({ ...prev, sku: p.sku, price: String(p.costPrice) })); setSkuSuggestions([]); }}
                                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-alt transition-colors text-left">
                                                <div>
                                                    <p className="text-xs font-bold text-text">{p.name}</p>
                                                    <p className="text-[9px] text-text-muted">{p.sku}</p>
                                                </div>
                                                <span className="text-[10px] font-black text-primary">₹{p.costPrice}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Quantity</label>
                                    <input required type="number" min="1" placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        value={stockIn.qty} onChange={e => setStockIn({ ...stockIn, qty: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Unit Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">₹</span>
                                        <input type="number" placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-colors"
                                            value={stockIn.price} onChange={e => setStockIn({ ...stockIn, price: e.target.value })} />
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
                        <p className="text-xs font-bold text-text-secondary leading-tight">Batch automation enabled. Stock levels update instantly on submission.</p>
                    </div>
                </div>

                {/* Right: Purchase History */}
                <div className="lg:col-span-2 bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50 flex-wrap gap-3">
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Purchase Orders</h2>
                        {/* Filter tabs */}
                        <div className="flex gap-1.5">
                            {['All', 'Received', 'Pending'].map(f => (
                                <button key={f} onClick={() => setFilterStatus(f)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === f ? 'bg-primary text-white' : 'bg-background text-text-muted border border-border/40 hover:border-primary/40'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-border/40 overflow-y-auto flex-1">
                        {filteredPurchases.length === 0 ? (
                            <div className="py-12 text-center text-sm font-bold text-text-muted">No orders found</div>
                        ) : filteredPurchases.map(order => (
                            <div key={order.id} className="p-5 flex items-center justify-between hover:bg-surface-alt/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-background border border-border/10 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        <Truck className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-black text-text uppercase">{order.id}</p>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${order.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-text-secondary">{order.supplier}</p>
                                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{order.date}</span>
                                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{order.items} Items</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <p className="text-sm font-black text-text">₹{order.amount.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setDetailOrder(order)}
                                        className="p-2 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── New Purchase Order Modal ── */}
            <AnimatePresence>
                {isOrderModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsOrderModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-2xl rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
                            <div className="p-7 border-b border-border/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-text uppercase tracking-tight">Create Purchase Order</h2>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Supplier Procurement</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOrderModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePO} className="flex flex-col flex-1 overflow-hidden">
                                <div className="p-7 overflow-y-auto flex-1 space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Supplier *</label>
                                            <select required className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none"
                                                value={poForm.supplier} onChange={e => setPoForm(p => ({ ...p, supplier: e.target.value }))}>
                                                {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Expected Delivery</label>
                                            <input type="date" className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={poForm.date} onChange={e => setPoForm(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Order Items</h3>
                                            <button type="button" onClick={addPoRow}
                                                className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                                <Plus className="w-3 h-3" /> Add Row
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {poItems.map((item, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <div className="col-span-5 relative">
                                                            <input type="text" placeholder="Search product..." className="w-full px-3 py-2.5 rounded-xl bg-background border border-border/40 text-xs font-bold focus:border-primary outline-none"
                                                                value={item.productSearch}
                                                                onChange={e => updatePoItem(idx, 'productSearch', e.target.value)} />
                                                            {item.suggestions.length > 0 && (
                                                                <div className="absolute z-20 w-full bg-surface border border-border/40 rounded-xl shadow-xl overflow-hidden mt-1">
                                                                    {item.suggestions.map(p => (
                                                                        <button key={p.sku} type="button"
                                                                            onClick={() => selectPoProduct(idx, p)}
                                                                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-alt text-left">
                                                                            <div>
                                                                                <p className="text-xs font-bold text-text">{p.name}</p>
                                                                                <p className="text-[9px] text-text-muted">{p.sku}</p>
                                                                            </div>
                                                                            <span className="text-[10px] font-black text-primary">₹{p.costPrice}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input type="number" min="1" placeholder="Qty" className="col-span-2 px-3 py-2.5 rounded-xl bg-background border border-border/40 text-xs font-black focus:border-primary outline-none text-center"
                                                            value={item.qty} onChange={e => updatePoItem(idx, 'qty', Number(e.target.value))} />
                                                        <input type="number" placeholder="Price" className="col-span-3 px-3 py-2.5 rounded-xl bg-background border border-border/40 text-xs font-black focus:border-primary outline-none"
                                                            value={item.price} onChange={e => updatePoItem(idx, 'price', Number(e.target.value))} />
                                                        <div className="col-span-1 flex items-center justify-center">
                                                            <p className="text-xs font-black text-primary">₹{(item.qty * item.price).toLocaleString()}</p>
                                                        </div>
                                                        <button type="button" onClick={() => removePoRow(idx)}
                                                            className="col-span-1 flex items-center justify-center text-text-muted hover:text-rose-500 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-7 border-t border-border/40 flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-text-muted uppercase">Total</p>
                                        <p className="text-xl font-black text-primary">₹{poTotal.toLocaleString()}</p>
                                    </div>
                                    <button type="submit" className="flex-1 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:translate-y-[-2px] active:translate-y-0 transition-all">
                                        Create Purchase Order
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Order Detail Modal ── */}
            <AnimatePresence>
                {detailOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDetailOrder(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-md rounded-[28px] border border-border/40 shadow-2xl relative p-7">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">{detailOrder.id}</h2>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${detailOrder.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{detailOrder.status}</span>
                                </div>
                                <button onClick={() => setDetailOrder(null)} className="w-9 h-9 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-text">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3 mb-5">
                                {[
                                    { label: 'Supplier', value: detailOrder.supplier },
                                    { label: 'Date', value: detailOrder.date },
                                    { label: 'Items', value: `${detailOrder.items} products` },
                                    { label: 'Total Amount', value: `₹${detailOrder.amount.toLocaleString()}` },
                                ].map(row => (
                                    <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-border/40">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{row.label}</span>
                                        <span className="text-sm font-black text-text">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                            {detailOrder.lineItems?.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Line Items</p>
                                    {detailOrder.lineItems.map((li, i) => (
                                        <div key={i} className="flex justify-between items-center p-2.5 bg-background rounded-xl border border-border/10">
                                            <div>
                                                <p className="text-xs font-bold text-text">{li.name || li.sku}</p>
                                                <p className="text-[9px] text-text-muted">{li.qty} × ₹{li.price}</p>
                                            </div>
                                            <span className="text-sm font-black text-primary">₹{(li.qty * li.price).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-surface border rounded-2xl shadow-2xl ${toast.type === 'error' ? 'border-rose-500/40' : 'border-border/40'}`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${toast.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <p className="text-sm font-bold text-text">{toast.msg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
