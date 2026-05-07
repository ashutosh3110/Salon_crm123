import { useState, useMemo } from 'react';
import { ArrowLeftRight, Plus, Package, Calendar, MoreHorizontal, ChevronRight, Search, X, ShieldCheck, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

export default function StockTransferPage() {
    const { products, outlets, transfers, transferStock } = useInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromOutlet, setFromOutlet] = useState('main');
    const [toOutlet, setToOutlet] = useState('outlet-1');
    const [selectedSku, setSelectedSku] = useState('');
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('Low Stock Replenishment');
    const [productSearch, setProductSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { success, error }

    // Selected product from dropdown
    const selectedProduct = useMemo(() =>
        products.find(p => p.sku === selectedSku), [products, selectedSku]);

    const availableQty = selectedProduct?.stockByOutlet?.[fromOutlet] ?? 0;

    // Products matching search in modal
    const productOptions = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    // Filtered transfers
    const filteredTransfers = transfers.filter(t =>
        t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (fromOutlet === toOutlet) {
            setResult({ success: false, error: 'Source and destination cannot be the same.' });
            return;
        }
        if (!selectedSku) {
            setResult({ success: false, error: 'Please select a product.' });
            return;
        }
        const qtyNum = Number(qty);
        if (!qtyNum || qtyNum <= 0) {
            setResult({ success: false, error: 'Please enter a valid quantity.' });
            return;
        }

        setSubmitting(true);
        const res = transferStock({ sku: selectedSku, qty: qtyNum, fromOutlet, toOutlet, reason });
        setSubmitting(false);
        setResult(res);

        if (res.success) {
            setTimeout(() => {
                setIsModalOpen(false);
                setResult(null);
                setSelectedSku(''); setQty(''); setProductSearch('');
                setFromOutlet('main'); setToOutlet('outlet-1');
            }, 1200);
        }
    };

    const outletName = (id) => outlets.find(o => o.id === id)?.name || id;
    const outletShort = (id) => outlets.find(o => o.id === id)?.short || id;

    // ── Per-outlet summary stats ──
    const outletSummary = outlets.map(o => ({
        ...o,
        totalItems: products.filter(p => (p.stockByOutlet?.[o.id] || 0) > 0).length,
        totalUnits: products.reduce((s, p) => s + (p.stockByOutlet?.[o.id] || 0), 0),
    }));

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Stock Transfer</h1>
                    <p className="text-sm text-text-muted font-medium">Move inventory between storage locations and outlets</p>
                </div>
                <button
                    onClick={() => { setIsModalOpen(true); setResult(null); }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> New Transfer
                </button>
            </div>

            {/* ── Outlet stock overview ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {outletSummary.map((outlet, i) => (
                    <motion.div
                        key={outlet.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl border border-border/40 p-4 shadow-sm flex items-center gap-4"
                    >
                        <div className={`w-11 h-11 ${outlet.color} rounded-xl flex items-center justify-center shrink-0`}>
                            {outlet.isWarehouse ? <Package className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-text truncate">{outlet.name}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{outlet.totalItems} products • {outlet.totalUnits} units</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Transfer Logs ── */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <div>
                        <h2 className="text-sm font-black text-text uppercase tracking-widest">Transfer History</h2>
                        <p className="text-[10px] text-text-muted font-bold mt-0.5">{filteredTransfers.length} recorded transfers</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type="text" placeholder="Search by product or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none focus:border-primary/50"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="divide-y divide-border/40 text-left">
                    {filteredTransfers.length === 0 ? (
                        <div className="py-10 text-center text-[11px] font-bold text-text-muted">No transfers found</div>
                    ) : filteredTransfers.map(tr => (
                        <div key={tr.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-alt/30 transition-colors group">
                            {/* Left: Product info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-11 h-11 rounded-2xl bg-background border border-border/10 flex items-center justify-center shrink-0 group-hover:border-primary/20 transition-all">
                                    <Package className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <p className="text-xs font-black text-text uppercase">{tr.id}</p>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${tr.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500 animate-pulse'}`}>
                                            {tr.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">{tr.productName}</p>
                                    <p className="text-[10px] text-text-muted">{tr.reason || 'Stock Balancing'}</p>
                                </div>
                            </div>

                            {/* Center: Route */}
                            <div className="flex items-center gap-3 flex-1 justify-center">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">FROM</p>
                                    <p className="text-xs font-black text-text">{outletShort(tr.from)}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 h-8 rounded-full bg-background border border-border/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black text-primary">{tr.qty} units</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">TO</p>
                                    <p className="text-xs font-black text-text">{outletShort(tr.to)}</p>
                                </div>
                            </div>

                            {/* Right: Date + action */}
                            <div className="flex items-center justify-between md:justify-end gap-4 md:w-40">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-text">{tr.date.split(',')[0]}</p>
                                    <p className="text-[10px] text-text-muted">{tr.date.split(',')[1] || ''}</p>
                                </div>
                                <button className="p-2 hover:bg-background rounded-lg text-text-muted hover:text-text transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── New Transfer Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface w-full max-w-lg rounded-[32px] border border-border/40 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                            <ArrowLeftRight className="w-6 h-6 text-violet-500" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-text uppercase tracking-tight">Move Inventory</h2>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">Outlet-to-Outlet Transfer</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)}
                                        className="w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-text-muted hover:text-rose-500 transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form className="space-y-5 text-left" onSubmit={handleTransfer}>
                                    {/* Product Search */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Select Product *</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input type="text" placeholder="Search product to transfer..."
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none transition-all"
                                                value={productSearch}
                                                onChange={e => { setProductSearch(e.target.value); setSelectedSku(''); }} />
                                        </div>
                                        {/* Product Dropdown */}
                                        {productSearch && !selectedSku && (
                                            <div className="rounded-xl border border-border/40 overflow-hidden bg-background divide-y divide-border/20 max-h-40 overflow-y-auto">
                                                {productOptions.slice(0, 6).map(p => (
                                                    <button key={p.sku} type="button"
                                                        onClick={() => { setSelectedSku(p.sku); setProductSearch(p.name); }}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-surface flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-text">{p.name}</p>
                                                            <p className="text-[9px] text-text-muted">{p.sku}</p>
                                                        </div>
                                                        <span className="text-[9px] font-black text-primary">Stock: {p.stock}</span>
                                                    </button>
                                                ))}
                                                {productOptions.length === 0 && (
                                                    <div className="px-4 py-3 text-[10px] text-text-muted font-bold">No products found</div>
                                                )}
                                            </div>
                                        )}
                                        {/* Selected product info */}
                                        {selectedProduct && (
                                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                                                <Package className="w-4 h-4 text-primary shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-text">{selectedProduct.name}</p>
                                                    <p className="text-[10px] text-text-muted">{selectedProduct.sku} • {selectedProduct.unit}</p>
                                                </div>
                                                <button type="button" onClick={() => { setSelectedSku(''); setProductSearch(''); }}>
                                                    <X className="w-3.5 h-3.5 text-text-muted hover:text-rose-500" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* From → To */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">From *</label>
                                            <select required value={fromOutlet} onChange={e => setFromOutlet(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer">
                                                {outlets.map(o => (
                                                    <option key={o.id} value={o.id}>{o.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">To *</label>
                                            <select required value={toOutlet} onChange={e => setToOutlet(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer">
                                                {outlets.filter(o => o.id !== fromOutlet).map(o => (
                                                    <option key={o.id} value={o.id}>{o.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Available stock info */}
                                    {selectedProduct && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {outlets.map(o => {
                                                const s = selectedProduct.stockByOutlet?.[o.id] || 0;
                                                return (
                                                    <div key={o.id} className={`p-2.5 rounded-xl border text-center ${o.id === fromOutlet ? 'border-primary/40 bg-primary/5' : 'border-border/20 bg-background'}`}>
                                                        <p className={`text-base font-black ${o.id === fromOutlet ? 'text-primary' : 'text-text'}`}>{s}</p>
                                                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{o.short}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Qty + Reason */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">
                                                Quantity *
                                                {selectedProduct && <span className="ml-1 text-primary">(max {availableQty})</span>}
                                            </label>
                                            <input required type="number" min="1" max={availableQty} placeholder="0"
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none"
                                                value={qty} onChange={e => setQty(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Reason</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-background border border-border/40 text-sm font-bold focus:border-primary outline-none appearance-none cursor-pointer"
                                                value={reason} onChange={e => setReason(e.target.value)}>
                                                <option>Low Stock Replenishment</option>
                                                <option>Stock Balancing</option>
                                                <option>Product Launch</option>
                                                <option>Return from Outlet</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Transfer preview */}
                                    {selectedProduct && qty > 0 && fromOutlet !== toOutlet && (
                                        <div className="p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10">
                                            <div className="flex items-center justify-between text-sm font-bold">
                                                <div className="text-center">
                                                    <p className="text-[9px] text-text-muted uppercase font-black">FROM</p>
                                                    <p className="text-text">{outletShort(fromOutlet)}</p>
                                                    <p className="text-rose-500 font-black">{availableQty} → {Math.max(0, availableQty - Number(qty))}</p>
                                                </div>
                                                <ArrowLeftRight className="w-5 h-5 text-violet-500" />
                                                <div className="text-center">
                                                    <p className="text-[9px] text-text-muted uppercase font-black">TO</p>
                                                    <p className="text-text">{outletShort(toOutlet)}</p>
                                                    <p className="text-emerald-500 font-black">
                                                        {selectedProduct.stockByOutlet?.[toOutlet] || 0} → {(selectedProduct.stockByOutlet?.[toOutlet] || 0) + Number(qty)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Warning note */}
                                    <div className="p-3 bg-violet-500/5 rounded-xl border border-violet-500/10 flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-violet-500 shrink-0" />
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Transfer logs are permanent and will auto-update stock levels.</p>
                                    </div>

                                    {/* Result feedback */}
                                    {result && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`p-3 rounded-xl border flex items-center gap-2 ${result.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-700'}`}>
                                            {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                            <p className="text-xs font-bold">{result.success ? 'Transfer completed successfully!' : result.error}</p>
                                        </motion.div>
                                    )}

                                    <button type="submit" disabled={submitting}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60">
                                        {submitting ? 'Processing...' : 'Initiate Transfer'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
