import React, { useState } from 'react';
import { MinusCircle, History, Package, AlertOctagon, Clipboard, Store, Calendar, Send, User, ChevronRight } from 'lucide-react';

const MOCK_ADJUSTMENTS = [
    { id: '1', date: '2024-03-21', product: 'Mac Studio Fix Foundation', quantity: -2, reason: 'Damage', adjustedBy: 'Admin (Aryan)', outlet: 'Andheri West' },
    { id: '2', date: '2024-03-19', product: 'Dyson Supersonic Filter', quantity: -1, reason: 'Internal Use', adjustedBy: 'Manager (Raj)', outlet: 'Bandra' },
    { id: '3', date: '2024-03-10', product: 'L\'Oréal Shampoo', quantity: -5, reason: 'Expiry', adjustedBy: 'Admin (Aryan)', outlet: 'Andheri West' },
];

export default function StockAdjustment() {
    const [view, setView] = useState('list'); // 'list' or 'form'

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* Context Header */}
            <div className="px-8 py-6 border-b border-border bg-surface/30 flex justify-between items-center">
                <div className="flex gap-4 p-1 bg-surface-alt rounded-xl border border-border">
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <History className="w-3.5 h-3.5" />
                        Adjustment Log
                    </button>
                    <button
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-white text-rose-600 shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <MinusCircle className="w-3.5 h-3.5" />
                        Manual Adjustment
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {view === 'list' ? <AdjustmentHistory /> : <AdjustmentForm onCancel={() => setView('list')} />}
            </div>
        </div>
    );
}

function AdjustmentHistory() {
    return (
        <div className="p-0 animate-fadeIn">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-surface/50 border-b border-border">
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Product Affected</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qty Reduced</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Reason / Code</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Outlet</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Done By</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {MOCK_ADJUSTMENTS.map((entry) => (
                        <tr key={entry.id} className="hover:bg-rose-50/30 transition-colors group">
                            <td className="px-8 py-5">
                                <span className="font-semibold text-text-secondary text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-bold text-text text-sm">{entry.product}</span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100 italic">
                                    {entry.quantity} UNITS
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
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-text-muted text-[10px] font-bold">
                                        {entry.adjustedBy.charAt(0)}
                                    </div>
                                    <span className="text-xs font-semibold text-text">{entry.adjustedBy}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AdjustmentForm({ onCancel }) {
    return (
        <div className="p-10 max-w-2xl mx-auto animate-slideUp">
            <div className="space-y-8 bg-surface/20 p-8 rounded-3xl border border-border/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 mb-2">
                        <AlertOctagon className="w-5 h-5" />
                        <h3 className="text-lg font-bold tracking-tight">Manual Stock Adjustment</h3>
                    </div>
                    <p className="text-sm text-text-secondary font-medium italic">Warning: Direct adjustments are audited. Use for damage, expiry, or internal use only.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Select Product</label>
                        <div className="relative group">
                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider">
                                <option>Select item to adjust...</option>
                                <option>Mac Studio Fix Foundation</option>
                                <option>Dyson Supersonic Filter</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Qty to Reduce</label>
                            <div className="relative group">
                                <Clipboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="number"
                                    placeholder="e.g. 5"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Reason Code</label>
                            <select className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider">
                                <option>Select Reason</option>
                                <option>Damage</option>
                                <option>Expiry</option>
                                <option>Internal Use</option>
                                <option>Theft / Loss</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Outlet</label>
                            <div className="relative group">
                                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-rose-500 transition-colors" />
                                <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all uppercase tracking-wider">
                                    <option>Select Outlet</option>
                                    <option>Andheri West</option>
                                    <option>Bandra</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Date of Event</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-white transition-all"
                    >
                        Back to Log
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-rose-600/30 transition-all scale-active">
                        <Send className="w-4 h-4" />
                        Apply Adjustment
                    </button>
                </div>
            </div>
        </div>
    );
}
