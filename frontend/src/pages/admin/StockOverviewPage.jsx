import React from 'react';
import StockOverview from '../../components/admin/inventory/StockOverview';

export default function StockOverviewPage() {
    return (
        <div className="space-y-6 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            <div className="px-1">
                <div className="text-left">
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">Stock Intelligence</h1>
                    <p className="text-[10px] font-semibold text-slate-450 mt-2 uppercase tracking-[0.15em]">Logistics · Real-time Inventory Status</p>
                </div>
            </div>

            <div className="bg-surface p-6 border border-border allow-curve rounded-2xl min-h-[600px] shadow-sm">
                <StockOverview />
            </div>
        </div>
    );
}
