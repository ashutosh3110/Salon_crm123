import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../../contexts/InventoryContext';
import api from '../../../services/api';
import {
    ArrowRight,
    Package,
    Store,
    Bell,
    CheckCircle2,
    ChevronRight,
    Loader2,
    RefreshCw,
} from 'lucide-react';

/**
 * Low / critical stock per product × outlet from GET /inventory/low-stock
 * (uses same rules as stock overview: qty vs inventory.lowStockThreshold, default 5).
 */
export default function LowStockAlerts() {
    const navigate = useNavigate();
    const { stats, fetchInventorySummary } = useInventory();
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/inventory/low-stock');
            setPayload(res.data.data);
            fetchInventorySummary();
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Could not load low stock data.');
            setPayload(null);
        } finally {
            setLoading(false);
        }
    }, [fetchInventorySummary]);

    useEffect(() => {
        load();
    }, [load]);

    const alerts = Array.isArray(payload?.alerts) ? payload.alerts : [];
    const stableSample = Array.isArray(payload?.stableSample) ? payload.stableSample : [];
    const summary = { 
        total: stats.lowStockCount || alerts.length, 
        critical: alerts.filter(a => a.stockStatus === 'Critical').length, 
        low: alerts.filter(a => a.stockStatus === 'Low Stock').length 
    };

    if (loading && !payload) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted bg-surface/10">
                <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                <p className="text-sm font-semibold">Loading low stock alerts…</p>
            </div>
        );
    }

    if (error && !payload) {
        return (
            <div className="p-12 text-center space-y-4 bg-surface/10">
                <p className="text-sm font-semibold text-rose-700">{error}</p>
                <button
                    type="button"
                    onClick={load}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-text text-white text-xs font-bold"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden bg-surface/10">
            <div className="p-8 bg-rose-50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-950/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200 dark:shadow-rose-950/40">
                        <Bell className="w-6 h-6 text-primary-foreground animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-rose-900 dark:text-rose-100 uppercase tracking-tighter italic leading-none">
                            Critical Density Breach
                        </h3>
                        <p className="text-[10px] font-black text-rose-700 dark:text-rose-300 mt-1 uppercase tracking-[0.2em] italic">
                            Inventory Alerts Protocol :: <span className="font-bold">{summary.total}</span> ASSETS REQUIRE REPLENISHMENT
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/inventory/stock-in')}
                        className="px-4 py-2 bg-rose-600 rounded-xl text-xs font-bold text-primary-foreground hover:shadow-lg hover:shadow-rose-600/30 transition-all"
                    >
                        Open Stock In
                    </button>
                </div>
            </div>

            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto no-scrollbar">
                {alerts.length === 0 ? (
                    <div className="lg:col-span-2 flex flex-col items-center justify-center py-16 text-center text-text-muted">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-80" />
                        <p className="text-sm font-semibold text-text">No low stock rows right now.</p>
                        <p className="text-xs mt-1 max-w-md">
                            Thresholds come from each outlet&apos;s inventory row (default 5). Use Stock Overview to see
                            all lines.
                        </p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <AlertCard
                            key={`${alert.productId}-${alert.outletId ?? 'x'}`}
                            alert={alert}
                            onStockIn={() => navigate('/admin/inventory/stock-in')}
                        />
                    ))
                )}

                <div className="lg:col-span-2 mt-4 border-t border-border pt-8">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 ml-2">
                        Sample in-stock lines (same tenant)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stableSample.length === 0 ? (
                            <p className="text-xs text-text-muted col-span-full">No in-stock sample to show.</p>
                        ) : (
                            stableSample.map((item) => (
                                <div
                                    key={`${item.productId}-${item.outletId}`}
                                    className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between opacity-80"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-text block truncate">{item.name}</span>
                                            <span className="text-[9px] text-text-muted truncate block">{item.outletName}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase shrink-0">
                                        {item.quantity} / {item.threshold}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertCard({ alert, onStockIn }) {
    const isCritical = alert.stockStatus === 'Critical';

    return (
        <div
            className={`p-6 bg-surface border-2 rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 group ${isCritical ? 'border-rose-100 dark:border-rose-900/50' : 'border-orange-100 dark:border-orange-900/50'}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className={`p-2.5 rounded-xl shrink-0 ${isCritical ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'}`}
                    >
                        <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-text group-hover:text-primary transition-colors truncate">
                            {alert.name}
                        </h4>
                        {alert.sku ? (
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
                                SKU: {alert.sku}
                            </p>
                        ) : null}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                            <Store className="w-3 h-3 shrink-0" />
                            <span className="truncate">{alert.outletName || '—'}</span>
                        </div>
                    </div>
                </div>
                <div
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shrink-0 ${isCritical ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50' : 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30'}`}
                >
                    {alert.stockStatus}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface border border-border rounded-2xl">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                        Current qty
                    </span>
                    <span className={`text-xl font-bold ${isCritical ? 'text-rose-600' : 'text-orange-600'}`}>
                        {alert.quantity}
                    </span>
                </div>
                <div className="p-3 bg-surface border border-border rounded-2xl">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">
                        Threshold
                    </span>
                    <span className="text-xl font-bold text-text">{alert.threshold}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onStockIn}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${isCritical ? 'bg-rose-600 text-primary-foreground border-rose-600 hover:shadow-lg hover:shadow-rose-600/20' : 'bg-orange-500 text-primary-foreground border-orange-500 hover:shadow-lg hover:shadow-orange-500/20'}`}
                >
                    Stock In Now
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    className="p-3 rounded-2xl border border-border text-text-muted hover:bg-surface transition-all"
                    title="Details in Stock overview"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
