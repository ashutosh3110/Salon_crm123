import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, Package, Store, Bell, CheckCircle2, ChevronRight } from 'lucide-react';

const MOCK_ALERTS = [
    { id: '1', product: 'Olplex No. 3 Hair Perfector', outlet: 'Andheri West', current: 8, threshold: 12, status: 'Critical', color: 'rose' },
    { id: '2', product: 'Dyson Supersonic Dryer Filter', outlet: 'Bandra', current: 3, threshold: 5, status: 'Warning', color: 'orange' },
    { id: '3', product: 'Gillette Shaving Foam', outlet: 'Andheri West', current: 12, threshold: 15, status: 'Warning', color: 'orange' },
];

export default function LowStockAlerts() {
    return (
        <div className="flex flex-col h-full slide-right overflow-hidden bg-surface/10">
            {/* Header / Banner */}
            <div className="p-8 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-200">
                        <Bell className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-rose-900 tracking-tight">Active Critical Alerts</h3>
                        <p className="text-sm text-rose-700 font-medium">3 items are below their safety threshold and require replenishment.</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-3">
                    <button className="px-4 py-2 bg-white border border-rose-200 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all shadow-sm">
                        Mute for 24h
                    </button>
                    <button className="px-4 py-2 bg-rose-600 rounded-xl text-xs font-bold text-white hover:shadow-lg hover:shadow-rose-600/30 transition-all">
                        Create Bulk Order
                    </button>
                </div>
            </div>

            {/* Alerts List */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto no-scrollbar">
                {MOCK_ALERTS.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}

                {/* All Good State Preview */}
                <div className="lg:col-span-2 mt-8 border-t border-border pt-8">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 ml-2">Monitored Items (Stable)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white border border-border rounded-2xl flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-text">Hair Wax (Premium)</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">42 Unit</span>
                        </div>
                        <div className="p-4 bg-white border border-border rounded-2xl flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-text">Face Serum ABC</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">18 Unit</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertCard({ alert }) {
    const isCritical = alert.status === 'Critical';
    const baseColor = isCritical ? 'rose' : 'orange';

    return (
        <div className={`p-6 bg-white border-2 rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 group ${isCritical ? 'border-rose-100' : 'border-orange-100'}`}>
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-text group-hover:text-primary transition-colors">{alert.product}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                            <Store className="w-3 h-3" />
                            {alert.outlet}
                        </div>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isCritical ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {alert.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface border border-border rounded-2xl">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">Current Stock</span>
                    <span className={`text-xl font-bold ${isCritical ? 'text-rose-600' : 'text-orange-600'}`}>{alert.current}</span>
                    <span className="text-[10px] font-bold text-text-muted ml-1">UNITS</span>
                </div>
                <div className="p-3 bg-surface border border-border rounded-2xl">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest block mb-1">Threshold</span>
                    <span className="text-xl font-bold text-text">{alert.threshold}</span>
                    <span className="text-[10px] font-bold text-text-muted ml-1">UNITS</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${isCritical ? 'bg-rose-600 text-white border-rose-600 hover:shadow-lg hover:shadow-rose-600/20' : 'bg-orange-500 text-white border-orange-500 hover:shadow-lg hover:shadow-orange-500/20'}`}>
                    Stock In Now
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button className="p-3 rounded-2xl border border-border text-text-muted hover:bg-surface transition-all">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
