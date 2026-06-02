import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeftRight, Plus, Package, Calendar, MoreHorizontal, ChevronRight, Search, X, ShieldCheck, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from '../../contexts/InventoryContext';

export default function StockTransferPage() {
    const { products, outlets, transfers, transferStock } = useInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromOutlet, setFromOutlet] = useState('');
    const [toOutlet, setToOutlet] = useState('');
    const [selectedSku, setSelectedSku] = useState('');
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('Low Stock Replenishment');
    const [productSearch, setProductSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { success, error }
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Automatically set default source and destination outlets from active database outlets
    useEffect(() => {
        if (outlets && outlets.length > 0) {
            const firstId = outlets[0]._id || outlets[0].id || '';
            setFromOutlet(prev => prev && outlets.some(o => (o._id === prev || o.id === prev)) ? prev : firstId);

            if (outlets.length > 1) {
                const secondId = outlets[1]._id || outlets[1].id || '';
                setToOutlet(prev => prev && outlets.some(o => (o._id === prev || o.id === prev)) ? prev : secondId);
            }
        }
    }, [outlets]);

    // Selected product from dropdown
    const selectedProduct = useMemo(() =>
        products.find(p => p.sku === selectedSku), [products, selectedSku]);

    const availableQty = useMemo(() => {
        if (!selectedProduct) return 0;
        const oMap = selectedProduct.stockByOutlet;
        if (oMap instanceof Map) return oMap.get(fromOutlet) || 0;
        return oMap?.[fromOutlet] || 0;
    }, [selectedProduct, fromOutlet]);

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
        const res = await transferStock({
            sku: selectedSku,
            qty: qtyNum,
            fromOutlet,
            toOutlet,
            reason
        });
        setSubmitting(false);
        setResult(res);

        if (res.success) {
            setTimeout(() => {
                setIsModalOpen(false);
                setResult(null);
                setSelectedSku(''); setQty(''); setProductSearch('');
                if (outlets && outlets.length > 0) {
                    setFromOutlet(outlets[0]._id || outlets[0].id || '');
                    if (outlets.length > 1) {
                        setToOutlet(outlets[1]._id || outlets[1].id || '');
                    }
                }
            }, 1200);
        }
    };

    const outletName = (id) => outlets.find(o => o.id === id || o._id === id)?.name || id;
    const outletShort = (id) => outlets.find(o => o.id === id || o._id === id)?.short || outlets.find(o => o.id === id || o._id === id)?.name || id;

    // ── Per-outlet summary stats ──
    const outletSummary = outlets.map(o => {
        const oid = o._id || o.id;
        return {
            ...o,
            id: oid,
            totalItems: products.filter(p => {
                const s = (p.stockByOutlet instanceof Map) ? p.stockByOutlet.get(oid) : p.stockByOutlet?.[oid];
                return (s || 0) > 0;
            }).length,
            totalUnits: products.reduce((s, p) => {
                const stockVal = (p.stockByOutlet instanceof Map) ? p.stockByOutlet.get(oid) : p.stockByOutlet?.[oid];
                return s + (stockVal || 0);
            }, 0),
        };
    });

    return (
        <div className="space-y-6 text-left">
            <style>{`
                /* Specific overrides to protect button gradients from global admin panel overrides */
                .admin-panel .st-premium-btn,
                .admin-panel button.st-premium-btn,
                .admin-panel a.st-premium-btn {
                    background: linear-gradient(135deg, #B4912B 0%, #927420 100%) !important;
                    color: #ffffff !important;
                    border: none !important;
                    box-shadow: 0 4px 6px -1px rgba(180, 145, 43, 0.2), 0 2px 4px -2px rgba(180, 145, 43, 0.2) !important;
                }
                .admin-panel .st-premium-btn:hover,
                .admin-panel button.st-premium-btn:hover,
                .admin-panel a.st-premium-btn:hover {
                    background: linear-gradient(135deg, #C5A23C 0%, #A3852C 100%) !important;
                    transform: translateY(-1.5px) !important;
                    box-shadow: 0 10px 15px -3px rgba(180, 145, 43, 0.3), 0 4px 6px -4px rgba(180, 145, 43, 0.3) !important;
                    filter: brightness(1.1) !important;
                }
                .admin-panel .st-premium-btn:active,
                .admin-panel button.st-premium-btn:active,
                .admin-panel a.st-premium-btn:active {
                    transform: translateY(0.5px) scale(0.97) !important;
                }

                /* Specific overrides to solve the Modal Stretch Bug */
                .admin-panel .st-modal-container {
                    height: auto !important;
                    max-height: 95vh !important;
                    align-self: center !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .admin-panel .st-modal-form {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    height: auto !important;
                }

                /* Fix light mode white-on-white text overrides caused by globalbg-slate-900 wildcard styles */
                html:not(.dark) .st-modal-title {
                    color: #1e293b !important; /* slate-800 */
                }
                .dark .st-modal-title {
                    color: #cbd5e1 !important; /* slate-300 */
                }
                html:not(.dark) .st-modal-subtitle {
                    color: #94a3b8 !important; /* slate-500 */
                }
                .dark .st-modal-subtitle {
                    color: #94a3b8!important; /* slate-450 */
                }
                html:not(.dark) .st-warning-text {
                    color: #B4912B !important; /* Premium Gold */
                }
                .dark .st-warning-text {
                    color: #B4912B !important;
                }
                html:not(.dark) .st-warning-icon {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }
                .dark .st-warning-icon {
                    color: #B4912B !important;
                    stroke: #B4912B !important;
                }
 
                /* General overrides for light mode inside the modal to cancel global white text resets */
                html:not(.dark) .st-modal-container label {
                    color: #94a3b8 !important; /* slate-500 */
                }
                html:not(.dark) .st-modal-container input {
                    color: #0f172a !important; /* slate-900 */
                }
                html:not(.dark) .st-modal-container input::placeholder {
                    color: #cbd5e1!important; /* slate-400 */
                }
                html:not(.dark) .st-modal-container select {
                    color: #0f172a !important; /* slate-900 */
                }
                html:not(.dark) .st-modal-container select option {
                    color: #0f172a !important; /* slate-900 */
                    background-color: #ffffff !important;
                }
                html:not(.dark) .st-modal-container .text-slate-400,
                html:not(.dark) .st-modal-container svg.text-slate-400,
                html:not(.dark) .st-modal-container button.text-slate-400,
                html:not(.dark) .st-modal-container button.text-slate-400 * {
                    color: #cbd5e1!important;
                }
                html:not(.dark) .st-modal-container [class*="text-[#B4912B]"] {
                    color: #B4912B !important;
                }
                html:not(.dark) .st-modal-container button.hover\:text-rose-500:hover,
                html:not(.dark) .st-modal-container button.hover\:text-rose-500:hover * {
                    color: #f43f5e !important; /* rose-500 */
                }
                html:not(.dark) .st-modal-container button.st-premium-btn {
                    color: #ffffff !important;
                }
                html:not(.dark) .st-modal-container button.st-premium-btn * {
                    color: #ffffff !important;
                }
            `}</style>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight uppercase">Stock Transfer</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">Move inventory between salon storage locations and branch outlets</p>
                </div>
                <button
                    onClick={() => { setIsModalOpen(true); setResult(null); }}
                    className="st-premium-btn flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-[#B4912B]/20 hover:scale-[1.02] active:scale-95 hover:brightness-110 transition-all shrink-0"
                    style={{ background: 'linear-gradient(135deg, #B4912B 0%, #927420 100%)' }}
                >
                    <Plus className="w-4 h-4" /> New Transfer
                </button>
            </div>

            {/* ── Outlet stock overview ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {outletSummary.map((outlet, i) => {
                    const colorClass = [
                        'bg-[#B4912B]/10 border-[#B4912B]/20 text-[#B4912B]',
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
                        'bg-blue-500/10 border-blue-500/20 text-blue-600'
                    ][i % 3];
                    const iconColor = [
                        'text-[#B4912B]',
                        'text-emerald-500',
                        'text-blue-500'
                    ][i % 3];
                    const isWarehouse = outlet.name.toLowerCase().includes('warehouse') || outlet.name.toLowerCase().includes('main');

                    return (
                        <motion.div
                            key={outlet.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-[#B4912B]/20 transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${colorClass} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all`}>
                                {isWarehouse ? <Package className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{outlet.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{outlet.totalItems} products • {outlet.totalUnits} units</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Transfer Logs ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800/80 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30 dark:bg-slate-900/30">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Transfer History</h2>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{filteredTransfers.length} recorded transfers</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Search by product or ID..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#B4912B]/10 transition-all"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-left">
                    {filteredTransfers.length === 0 ? (
                        <div className="py-12 text-center text-xs font-semibold text-slate-400">No transfers found</div>
                    ) : filteredTransfers.map(tr => (
                        <div key={tr.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors group">
                            {/* Left: Product info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center shrink-0 group-hover:border-[#B4912B]/20 transition-all">
                                    <Package className="w-5 h-5 text-slate-500 group-hover:text-[#B4912B] transition-colors" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">#{tr.id.substring(tr.id.length - 8).toUpperCase()}</p>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border ${tr.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                            {tr.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#B4912B] transition-colors">{tr.productName}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{tr.reason || 'Stock Balancing'}</p>
                                </div>
                            </div>

                            {/* Center: Route */}
                            <div className="flex items-center gap-4 flex-1 justify-center">
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">FROM</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{outletShort(tr.from)}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[#B4912B] group-hover:bg-[#B4912B] group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#B4912B] bg-[#B4912B]/10 px-1.5 py-0.5 rounded-full">{tr.qty} units</span>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TO</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{outletShort(tr.to)}</p>
                                </div>
                            </div>

                            {/* Right: Date + action */}
                            <div className="flex items-center justify-between md:justify-end gap-4 md:w-40">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{tr.date.split(',')[0]}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{tr.date.split(',')[1] || ''}</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── New Transfer Modal ── */}
            {createPortal(
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[24px] border border-slate-150 dark:border-slate-800 shadow-2xl overflow-hidden relative st-modal-container z-10">

                                {/* Header */}
                                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#B4912B]/10 flex items-center justify-center">
                                            <ArrowLeftRight className="w-5 h-5 text-[#B4912B]" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="st-modal-title text-base font-bold text-slate-800 dark:text-slate-200">Move Inventory</h2>
                                            <p className="st-modal-subtitle text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Outlet-to-Outlet Transfer</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)}
                                        className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Form Content */}
                                <form className="p-6 space-y-5 text-left st-modal-form" onSubmit={handleTransfer}>
                                    {/* Product Search */}
                                    <div className="space-y-1.5 relative">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Select Product *</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="text" placeholder="Search product to transfer..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#B4912B]/10 outline-none transition-all"
                                                value={productSearch}
                                                onChange={e => { setProductSearch(e.target.value); setSelectedSku(''); }}
                                                onFocus={() => setIsSearchFocused(true)}
                                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)} />
                                        </div>

                                        {/* Product Dropdown Selection */}
                                        {!selectedSku && (isSearchFocused || productSearch) && (
                                            <div className="rounded-xl border border-slate-250 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto mt-1 shadow-lg absolute left-0 right-0 z-50">
                                                {productOptions.slice(0, 6).map(p => (
                                                    <button key={p.sku} type="button"
                                                        onClick={() => { setSelectedSku(p.sku); setProductSearch(p.name); }}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors"
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{p.name}</p>
                                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{p.sku}</p>
                                                        </div>
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#B4912B]/10 text-[#B4912B]">Stock: {p.stock}</span>
                                                    </button>
                                                ))}
                                                {productOptions.length === 0 && (
                                                    <div className="px-4 py-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold">No products found</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Product Banner */}
                                        {selectedProduct && (
                                            <div className="p-3 bg-[#B4912B]/5 rounded-xl border border-[#B4912B]/10 flex items-center gap-3">
                                                <Package className="w-4 h-4 text-[#B4912B] shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedProduct.name}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{selectedProduct.sku} • {selectedProduct.unit || 'units'}</p>
                                                </div>
                                                <button type="button" onClick={() => { setSelectedSku(''); setProductSearch(''); }}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* From → To */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 relative">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">From *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B4912B]" />
                                                <select required value={fromOutlet} onChange={e => setFromOutlet(e.target.value)}
                                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 outline-none appearance-none cursor-pointer">
                                                    {outlets.map(o => {
                                                        const oid = o._id || o.id;
                                                        return <option key={oid} value={oid}>{o.name}</option>;
                                                    })}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 relative">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">To *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                <select required value={toOutlet} onChange={e => setToOutlet(e.target.value)}
                                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 outline-none appearance-none cursor-pointer">
                                                    {outlets.filter(o => (o._id || o.id) !== fromOutlet).map(o => {
                                                        const oid = o._id || o.id;
                                                        return <option key={oid} value={oid}>{o.name}</option>;
                                                    })}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Available stock info */}
                                    {selectedProduct && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {outlets.map(o => {
                                                const oid = o._id || o.id;
                                                const s = (selectedProduct.stockByOutlet instanceof Map)
                                                    ? (selectedProduct.stockByOutlet.get(oid) || 0)
                                                    : (selectedProduct.stockByOutlet?.[oid] || 0);
                                                return (
                                                    <div key={oid} className={`p-2.5 rounded-xl border text-center ${oid === fromOutlet ? 'border-[#B4912B]/40 bg-[#B4912B]/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/30'}`}>
                                                        <p className={`text-sm font-black ${oid === fromOutlet ? 'text-[#B4912B]' : 'text-slate-700 dark:text-slate-200'}`}>{s}</p>
                                                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{o.short || o.name}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Qty + Reason */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                                                Quantity *
                                                {selectedProduct && <span className="ml-1 text-[#B4912B] font-bold">(max {availableQty})</span>}
                                            </label>
                                            <div className="relative">
                                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input required type="number" min="1" max={availableQty} placeholder="0"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 outline-none"
                                                    value={qty} onChange={e => setQty(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Reason</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm font-semibold focus:border-[#B4912B] focus:bg-white dark:focus:bg-slate-900 outline-none appearance-none cursor-pointer"
                                                    value={reason} onChange={e => setReason(e.target.value)}>
                                                    <option>Low Stock Replenishment</option>
                                                    <option>Stock Balancing</option>
                                                    <option>Product Launch</option>
                                                    <option>Return from Outlet</option>
                                                    <option>Other</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                                                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transfer preview */}
                                    {selectedProduct && qty > 0 && fromOutlet !== toOutlet && (
                                        <div className="p-4 bg-[#B4912B]/5 rounded-2xl border border-[#B4912B]/10">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <div className="text-center">
                                                    <p className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold">FROM</p>
                                                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{outletShort(fromOutlet)}</p>
                                                    <p className="text-rose-500 font-bold mt-0.5">{availableQty} → {Math.max(0, availableQty - Number(qty))}</p>
                                                </div>
                                                <ArrowLeftRight className="w-4 h-4 text-[#B4912B] animate-pulse" />
                                                <div className="text-center">
                                                    <p className="text-[8px] text-slate-400 dark:text-slate-500 uppercase font-bold">TO</p>
                                                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{outletShort(toOutlet)}</p>
                                                    <p className="text-emerald-500 font-bold mt-0.5">
                                                        {((selectedProduct.stockByOutlet instanceof Map)
                                                            ? (selectedProduct.stockByOutlet.get(toOutlet) || 0)
                                                            : (selectedProduct.stockByOutlet?.[toOutlet] || 0))} → {((selectedProduct.stockByOutlet instanceof Map)
                                                                ? (selectedProduct.stockByOutlet.get(toOutlet) || 0)
                                                                : (selectedProduct.stockByOutlet?.[toOutlet] || 0)) + Number(qty)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Warning note */}
                                    <div className="p-3.5 bg-[#B4912B]/5 rounded-2xl border border-[#B4912B]/10 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#B4912B]/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="st-warning-icon w-4 h-4 text-[#B4912B]" />
                                        </div>
                                        <p className="st-warning-text text-[10px] font-bold text-[#B4912B] uppercase tracking-wider leading-normal">Transfer logs are permanent and will auto-update stock levels.</p>
                                    </div>

                                    {/* Result feedback */}
                                    {result && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className={`p-3 rounded-xl border flex items-center gap-2 ${result.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-700'}`}>
                                            {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                            <p className="text-xs font-bold">{result.success ? 'Transfer completed successfully!' : result.error}</p>
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <button type="submit" disabled={submitting}
                                        className="st-premium-btn w-full py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#B4912B]/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #B4912B 0%, #927420 100%)' }}>
                                        <ArrowLeftRight className="w-4 h-4" />
                                        {submitting ? 'Processing Transfer...' : 'Initiate Transfer'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
