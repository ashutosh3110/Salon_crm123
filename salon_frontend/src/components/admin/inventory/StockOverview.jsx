import React, { useState } from 'react';
import { Search, MapPin, Tag, ArrowUpRight, History, MoreHorizontal, ChevronRight, AlertTriangle, CheckCircle2, Package } from 'lucide-react';

const MOCK_STOCK = [
    { id: '1', name: 'L\'Oréal Professionnel Shampoo', category: 'Hair Care', outlet: 'Andheri West', quantity: 45, threshold: 10, status: 'OK' },
    { id: '2', name: 'Olplex No. 3 Hair Perfector', category: 'Treatment', outlet: 'Andheri West', quantity: 8, threshold: 12, status: 'Low' },
    { id: '3', name: 'Dyson Supersonic Dryer Filter', category: 'Equipment', outlet: 'Bandra', quantity: 3, threshold: 5, status: 'Low' },
    { id: '4', name: 'Mac Studio Fix Foundation', category: 'Cosmetics', outlet: 'All Outlets', quantity: 120, threshold: 20, status: 'OK' },
    { id: '5', name: 'Gillette Shaving Foam', category: 'Personal Care', outlet: 'Andheri West', quantity: 12, threshold: 15, status: 'Low' },
];

export default function StockOverview() {
    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* Filter Header */}
            <div className="p-6 border-b border-border bg-surface/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search product name or barcode..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                            <option>All Outlets</option>
                            <option>Andheri West</option>
                            <option>Bandra</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                            <option>All Categories</option>
                            <option>Hair Care</option>
                            <option>Equipment</option>
                            <option>Cosmetics</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-surface border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Product Details</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Category</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Allocated Outlet</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Available Qty</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Threshold</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface">Stock Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-surface text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white text-sm">
                        {MOCK_STOCK.map((item) => (
                            <tr key={item.id} className="hover:bg-surface/50 transition-colors group cursor-default">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Package className="w-5 h-5 opacity-60" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text tracking-tight">{item.name}</span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">SKU: PROD-{item.id}00X</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 bg-surface text-text-secondary text-[9px] font-bold rounded-md uppercase tracking-wider border border-border">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-text-secondary font-medium text-xs">{item.outlet}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-bold ${item.status === 'Low' ? 'text-rose-600' : 'text-text'}`}>
                                        {item.quantity} Units
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-semibold text-text-muted">{item.threshold} Units</span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.status === 'Low' ? (
                                        <div className="flex items-center gap-1.5 text-rose-600">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Low Stock</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Optimal</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                        <History className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="p-4 border-t border-border bg-surface/30">
                <div className="flex items-center justify-between px-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <span>Showing 5 of 240 active stock lines</span>
                    <div className="flex gap-4">
                        <button className="hover:text-primary transition-colors disabled:opacity-30">Previous</button>
                        <button className="hover:text-primary transition-colors">Next Page</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
