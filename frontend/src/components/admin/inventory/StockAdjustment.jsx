import React, { useState, useEffect, useCallback } from 'react';
import { useInventory } from '../../../contexts/InventoryContext';
import { useBusiness } from '../../../contexts/BusinessContext';
import {
    MinusCircle,
    History,
    Package,
    AlertOctagon,
    Clipboard,
    Store,
    Send,
    PlusCircle,
    Loader2,
    RefreshCw,
} from 'lucide-react';

const REASON_OPTIONS = ['Damage', 'Expiry', 'Internal use', 'Theft / loss', 'Audit correction', 'Other'];

export default function StockAdjustment() {
    const { products, outlets: invOutlets, fetchProducts, updateStock, fetchStockHistory, stockHistory } = useInventory();
    const { outlets: tenantOutlets } = useBusiness();
    const [view, setView] = useState('list');
    const [logLoading, setLogLoading] = useState(true);
    const [logError, setLogError] = useState(null);

    const outlets = tenantOutlets?.length ? tenantOutlets : invOutlets || [];

    const fetchLog = useCallback(async () => {
        setLogLoading(true);
        setLogError(null);
        try {
            await fetchStockHistory({ type: ['OUT', 'ADJUSTMENT'] });
        } catch (e) {
            setLogError('Could not load adjustment log.');
        } finally {
            setLogLoading(false);
        }
    }, [fetchStockHistory]);

    useEffect(() => {
        fetchLog();
    }, [fetchLog]);

    useEffect(() => {
        if (view === 'list') fetchLog();
    }, [view, fetchLog]);

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
                        Adjustment log
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-surface text-rose-600 shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <MinusCircle className="w-3.5 h-3.5" />
                        Stock out / adjust
                    </button>
                </div>
                {view === 'list' && (
                    <button
                        type="button"
                        onClick={fetchLog}
                        disabled={logLoading}
                        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-surface-alt transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${logLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-surface text-left">
                {view === 'list' ? (
                    <AdjustmentHistory rows={stockHistory} loading={logLoading} error={logError} onRetry={fetchLog} />
                ) : (
                    <AdjustmentForm
                        onCancel={() => setView('list')}
                        onSuccess={async () => {
                            setView('list');
                            await fetchProducts?.();
                            await fetchLog();
                        }}
                        products={products}
                        outlets={outlets}
                        updateStock={updateStock}
                    />
                )}
            </div>
        </div>
    );
}

function AdjustmentHistory({ rows, loading, error, onRetry }) {
    if (loading && rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-text-muted">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-semibold">Loading adjustment log…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-rose-700">{error}</p>
                <button type="button" onClick={onRetry} className="text-xs font-bold text-primary underline">
                    Try again
                </button>
            </div>
        );
    }

    const mapped = rows.map((entry) => ({
        id: entry._id,
        date: entry.createdAt,
        product: entry.productId?.name || '—',
        sku: entry.productId?.sku || '',
        quantity: entry.quantity,
        direction: entry.type === 'IN' ? 'ADD' : 'DEDUCT',
        reason: entry.reason || '—',
        outlet: entry.outletId?.name || '—',
        by: entry.performedBy?.name || entry.performedBy?.email || '—',
    }));

    return (
        <div className="p-0 animate-fadeIn">
            <p className="px-8 py-3 text-[10px] font-black text-text-muted border-b border-border/40 uppercase tracking-widest italic leading-none">
                Adjustment Registry History :: Manual Intervention Audit Log
            </p>
            {mapped.length === 0 ? (
                <div className="p-12 text-center text-sm text-text-muted">
                    No adjustments yet. Use <span className="font-semibold text-text">Stock out / adjust</span> to
                    record damage, expiry, or corrections.
                </div>
            ) : (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Product
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Type
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Qty
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Reason
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Outlet
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                By
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mapped.map((entry) => {
                            const isOut = entry.direction === 'DEDUCT';
                            const legacy = entry.direction === '—';
                            return (
                                <tr key={entry.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="font-semibold text-text-secondary text-xs">
                                            {entry.date ? new Date(entry.date).toLocaleString() : '—'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="font-bold text-text text-sm">{entry.product}</span>
                                        {entry.sku ? (
                                            <span className="block text-[10px] text-text-muted font-bold mt-0.5">
                                                SKU: {entry.sku}
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span
                                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                                legacy
                                                    ? 'bg-slate-50 text-slate-600 border-slate-200'
                                                    : isOut
                                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}
                                        >
                                            {legacy ? 'Adjustment' : isOut ? 'Stock out' : 'Add stock'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span
                                            className={`px-3 py-1 text-[10px] font-bold rounded-lg border ${
                                                legacy
                                                    ? 'bg-surface text-text-secondary border-border'
                                                    : isOut
                                                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}
                                        >
                                            {legacy ? '' : isOut ? '−' : '+'}
                                            {entry.quantity}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2.5 py-1 bg-surface border border-border rounded-md text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                                            {entry.reason}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-semibold text-text-secondary">{entry.outlet}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-semibold text-text">{entry.by}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function AdjustmentForm({ onCancel, onSuccess, products, outlets, updateStock }) {
    const [productId, setProductId] = useState('');
    const [outletId, setOutletId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [direction, setDirection] = useState('DEDUCT');
    const [saving, setSaving] = useState(false);

    const effectiveReason =
        reason === 'Other' ? customReason.trim() || 'Other' : reason;

    const handleSubmit = async () => {
        const qty = Number(quantity);
        if (!productId || !outletId || !qty || qty < 1) {
            alert('Select product, outlet, and quantity (min 1).');
            return;
        }
        if (!effectiveReason) {
            alert('Select or enter a reason.');
            return;
        }
        if (!outlets?.length) {
            alert('No outlets found. Create an outlet first.');
            return;
        }

        setSaving(true);
        try {
            await updateStock({
                productId,
                outletId,
                quantity: qty,
                type: direction === 'ADD' ? 'IN' : 'ADJUSTMENT',
                reason: effectiveReason,
            });
            alert(direction === 'DEDUCT' ? 'Stock reduced successfully.' : 'Stock added successfully.');
            await onSuccess?.();
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(', ') : null) ||
                e.message ||
                'Adjustment failed.';
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto animate-slideUp">
            <div className="space-y-8 bg-surface/20 p-8 rounded-3xl border border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <AlertOctagon className="w-5 h-5" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Manual Stock Neutralization</h3>
                    </div>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">
                        Correction Protocol :: Deduct or Augment Inventory Density
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-surface-alt rounded-xl border border-border">
                    <button
                        type="button"
                        onClick={() => setDirection('DEDUCT')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${direction === 'DEDUCT' ? 'bg-surface text-rose-600 shadow-sm' : 'text-text-muted'}`}
                    >
                        <MinusCircle className="w-4 h-4" />
                        Stock out (reduce)
                    </button>
                    <button
                        type="button"
                        onClick={() => setDirection('ADD')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${direction === 'ADD' ? 'bg-surface text-emerald-600 shadow-sm' : 'text-text-muted'}`}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add stock
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Product *
                        </label>
                        <div className="relative group">
                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <select
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider cursor-pointer"
                            >
                                <option value="">Select product…</option>
                                {(products || []).map((p) => (
                                    <option key={p._id || p.id} value={p._id || p.id}>
                                        {p.name} ({p.sku})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Quantity *
                            </label>
                            <div className="relative group">
                                <Clipboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="e.g. 5"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Reason *
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider cursor-pointer"
                            >
                                <option value="">Select reason</option>
                                {REASON_OPTIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {reason === 'Other' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                                Describe
                            </label>
                            <input
                                type="text"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Short note"
                                className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
                            Outlet *
                        </label>
                        <div className="relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <select
                                value={outletId}
                                onChange={(e) => setOutletId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider cursor-pointer"
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
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface-alt transition-all"
                    >
                        Back to log
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleSubmit}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold transition-all scale-active disabled:opacity-60 ${
                            direction === 'DEDUCT'
                                ? 'bg-rose-600 hover:shadow-lg hover:shadow-rose-600/30'
                                : 'bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/30'
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        {saving ? 'Saving…' : direction === 'DEDUCT' ? 'Apply stock out' : 'Apply add stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}
