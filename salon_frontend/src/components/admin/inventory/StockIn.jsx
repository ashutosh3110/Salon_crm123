import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInventory } from '../../../contexts/InventoryContext';
import { useBusiness } from '../../../contexts/BusinessContext';
import mockApi from '../../../services/mock/mockApi';
import {
    Plus,
    History,
    Package,
    Hash,
    Calendar,
    DollarSign,
    Store,
    Send,
    Download,
    ArrowUpRight,
    Loader2,
    RefreshCw,
} from 'lucide-react';

export default function StockIn() {
    const { suppliers, products, outlets: invOutlets, fetchProducts } = useInventory();
    const { outlets: tenantOutlets, suppliers: businessSuppliers } = useBusiness();
    const [view, setView] = useState('list');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);

    const fetchHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const res = await mockApi.get('/inventory/stock-in/history', { params: { page: 1, limit: 100 } });
            const rows = res?.data?.results ?? res?.data ?? [];
            setHistory(Array.isArray(rows) ? rows : []);
        } catch (e) {
            setHistoryError(e?.response?.data?.message || e?.message || 'Could not load history.');
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        if (view === 'list') fetchHistory();
    }, [view, fetchHistory]);

    useEffect(() => {
        if (view === 'form') fetchProducts?.();
    }, [view, fetchProducts]);

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            <div className="px-8 py-6 border-b border-border bg-surface/30 flex justify-between items-center flex-wrap gap-3">
                <div className="flex gap-4 p-1 bg-surface-alt rounded-xl border border-border">
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <History className="w-3.5 h-3.5" />
                        Inward History
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Stock In (Purchase)
                    </button>
                </div>
                {view === 'list' && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-surface-alt transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-surface-alt transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download Log
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-surface text-left">
                {view === 'list' ? (
                    <StockInHistory
                        rows={history}
                        loading={historyLoading}
                        error={historyError}
                        onRetry={fetchHistory}
                    />
                ) : (
                    <StockInForm
                        onCancel={() => setView('list')}
                        onSuccess={async () => {
                            setView('list');
                            await fetchProducts?.();
                            await fetchHistory();
                        }}
                        suppliers={businessSuppliers?.length ? businessSuppliers : suppliers}
                        products={products}
                        outlets={tenantOutlets?.length ? tenantOutlets : invOutlets || []}
                    />
                )}
            </div>
        </div>
    );
}

function StockInHistory({ rows, loading, error, onRetry }) {
    if (loading && rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-text-muted">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-semibold">Loading inward history…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-rose-700">{error}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="text-xs font-bold text-primary underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    const mapped = rows.map((entry) => ({
        id: entry._id,
        date: entry.createdAt,
        supplier: entry.supplierName || '—',
        invoice: entry.invoiceRef || '—',
        product: entry.productId?.name || '—',
        sku: entry.productId?.sku || '',
        quantity: entry.quantity,
        price: entry.purchasePrice,
        addedBy: entry.performedBy?.name || entry.performedBy?.email || '—',
        outlet: entry.outletId?.name || '—',
    }));

    return (
        <div className="p-0 animate-fadeIn">
            {mapped.length === 0 ? (
                <div className="p-12 text-center text-sm text-text-muted">
                    No stock-in entries yet. Use <span className="font-semibold text-text">New Stock In</span> to record a
                    purchase.
                </div>
            ) : (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Supplier / Invoice
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Product
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Qty
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Unit price
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Recorded by / Outlet
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mapped.map((entry) => (
                            <tr key={entry.id} className="hover:bg-surface/30 transition-colors group">
                                <td className="px-8 py-5">
                                    <span className="font-semibold text-text-secondary text-xs">
                                        {entry.date ? new Date(entry.date).toLocaleString() : '—'}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-text text-sm">{entry.supplier}</span>
                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                                            {entry.invoice !== '—' ? entry.invoice : 'No invoice ref'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="font-medium text-text-secondary text-sm">{entry.product}</span>
                                    {entry.sku ? (
                                        <span className="block text-[10px] text-text-muted font-bold mt-0.5">
                                            SKU: {entry.sku}
                                        </span>
                                    ) : null}
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-900">
                                        +{entry.quantity}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="font-bold text-text text-sm">
                                        {entry.price != null && entry.price !== '' ? `₹${entry.price}` : '—'}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                            {entry.addedBy.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-text">{entry.addedBy}</span>
                                            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                                {entry.outlet}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function StockInForm({ onCancel, onSuccess, suppliers, products, outlets }) {
    const [productId, setProductId] = useState('');
    const [outletId, setOutletId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [invoice, setInvoice] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [saving, setSaving] = useState(false);

    const selectedProduct = useMemo(
        () => (products || []).find((p) => String(p._id || p.id) === String(productId)),
        [products, productId]
    );

    const handleProductChange = (id) => {
        setProductId(id);
        if (!id) {
            setPurchasePrice('');
            setSupplierId('');
            return;
        }
        const p = (products || []).find((x) => String(x._id || x.id) === String(id));
        if (!p) return;
        const mrp = p.sellingPrice ?? p.price;
        if (mrp != null && mrp !== '' && !Number.isNaN(Number(mrp))) {
            setPurchasePrice(String(Number(mrp)));
        } else {
            setPurchasePrice('');
        }
        const supName = typeof p.supplier === 'string' ? p.supplier.trim() : '';
        if (supName && (suppliers || []).length) {
            const match = suppliers.find(
                (s) => String(s.name || '').toLowerCase() === supName.toLowerCase()
            );
            setSupplierId(match ? String(match._id || match.id) : '');
        } else {
            setSupplierId('');
        }
        if ((outlets || []).length === 1) {
            const o = outlets[0];
            setOutletId(String(o._id || o.id));
        }
    };

    useEffect(() => {
        if ((outlets || []).length === 1 && !outletId) {
            const o = outlets[0];
            setOutletId(String(o._id || o.id));
        }
    }, [outlets, outletId]);

    const handleSubmit = async () => {
        const qty = Number(quantity);
        if (!productId || !outletId || !qty || qty < 1) {
            alert('Select product, outlet, and quantity (min 1).');
            return;
        }
        if (!outlets?.length) {
            alert('No outlets found. Create an outlet first.');
            return;
        }
        const supplier = suppliers.find((s) => String(s._id || s.id) === String(supplierId));
        setSaving(true);
        try {
            await mockApi.post('/inventory/stock-in', {
                productId,
                outletId,
                quantity: qty,
                purchasePrice: purchasePrice === '' ? undefined : Number(purchasePrice),
                supplierId: supplierId || undefined,
                invoiceRef: invoice?.trim() || undefined,
                supplierName: supplier?.name || undefined,
                expiryDate: expiryDate || undefined,
            });
            alert('Stock added successfully with expiry alert set.');
            await onSuccess?.();
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(', ') : null) ||
                e.message ||
                'Stock-in failed.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-10 max-w-3xl mx-auto animate-slideUp">
            <div className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Asset Inbound Protocol</h3>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">
                        Registry Synchronization :: Update Stock Density per Node Allocation
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Supplier (optional)
                        </label>
                        <div className="relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select
                                value={supplierId}
                                onChange={(e) => setSupplierId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider"
                            >
                                <option value="">Select Supplier</option>
                                {(suppliers || []).map((s) => (
                                    <option key={s.id || s._id} value={s._id || s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Invoice reference
                        </label>
                        <div className="relative group">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="INV-2024-XXX"
                                value={invoice}
                                onChange={(e) => setInvoice(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Product *
                        </label>
                        <div className="relative group">
                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select
                                value={productId}
                                onChange={(e) => handleProductChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider"
                            >
                                <option value="">Select product...</option>
                                {(products || []).map((p) => (
                                    <option key={p._id || p.id} value={p._id || p.id}>
                                        {p.name} ({p.sku})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedProduct && (
                            <div className="mt-2 p-3 rounded-xl bg-surface-alt/80 border border-border text-[11px] text-text-secondary space-y-1">
                                <p>
                                    <span className="font-bold text-text">SKU:</span> {selectedProduct.sku || '—'}
                                    {selectedProduct.category ? (
                                        <>
                                            {' '}
                                            · <span className="font-bold text-text">Category:</span> {selectedProduct.category}
                                        </>
                                    ) : null}
                                </p>
                                <p>
                                    <span className="font-bold text-text">MRP / list price:</span> ₹
                                    {Number(selectedProduct.sellingPrice ?? selectedProduct.price ?? 0).toLocaleString()}
                                </p>
                                {selectedProduct.supplier ? (
                                    <p>
                                        <span className="font-bold text-text">Default supplier (from master):</span>{' '}
                                        {selectedProduct.supplier}
                                    </p>
                                ) : null}
                                {typeof selectedProduct.stock === 'number' ? (
                                    <p>
                                        <span className="font-bold text-text">Current total stock (all outlets):</span>{' '}
                                        {selectedProduct.stock}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Quantity *
                        </label>
                        <div className="relative group">
                            <ArrowUpRight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="number"
                                min={1}
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Unit purchase price
                        </label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0"
                                value={purchasePrice}
                                onChange={(e) => setPurchasePrice(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Outlet *
                        </label>
                        <div className="relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select
                                value={outletId}
                                onChange={(e) => setOutletId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider"
                            >
                                <option value="">Select outlet</option>
                                {(outlets || []).map((o) => (
                                    <option key={o._id || o.id} value={o._id || o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Expiry Date *
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="date"
                                required
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] text-primary/80 font-semibold">
                            Push notification will be sent to Admin/Manager on this date.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active disabled:opacity-60"
                    >
                        <Send className="w-4 h-4" />
                        {saving ? 'Saving…' : 'Confirm Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
}
