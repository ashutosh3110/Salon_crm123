import React, { useState } from 'react';
import { Plus, History, Package, User, Hash, Calendar, DollarSign, Store, Send, ChevronRight, Download } from 'lucide-react';

const MOCK_STOCK_IN = [
    { id: '1', date: '2024-03-20', supplier: 'Glossy Cosmetics Ltd', product: 'L\'Oréal Professionnel Shampoo', quantity: 50, price: 850, addedBy: 'Admin (Aryan)', outlet: 'Andheri West' },
    { id: '2', date: '2024-03-18', supplier: 'Salon Supplies Inc', product: 'Dyson Supersonic Filter', quantity: 10, price: 1200, addedBy: 'Manager (Raj)', outlet: 'Bandra' },
    { id: '3', date: '2024-03-15', supplier: 'Organic India', product: 'Organic Shaving Cream', quantity: 100, price: 120, addedBy: 'Admin (Aryan)', outlet: 'All Outlets' },
];

export default function StockIn() {
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
                        Inward History
                    </button>
                    <button
                        onClick={() => setView('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text'}`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New Stock In (Purchase)
                    </button>
                </div>
                {view === 'list' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-surface transition-all">
                        <Download className="w-3.5 h-3.5" />
                        Download Log
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {view === 'list' ? <StockInHistory /> : <StockInForm onCancel={() => setView('list')} />}
            </div>
        </div>
    );
}

function StockInHistory() {
    return (
        <div className="p-0 animate-fadeIn">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-surface/50 border-b border-border">
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Entry Date</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Supplier & Invoice</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Product Details</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Qty Added</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Unit Price</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Received By</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {MOCK_STOCK_IN.map((entry) => (
                        <tr key={entry.id} className="hover:bg-surface/30 transition-colors group">
                            <td className="px-8 py-5">
                                <span className="font-semibold text-text-secondary text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="font-bold text-text text-sm">{entry.supplier}</span>
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">INV-2024-00{entry.id}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-medium text-text-secondary text-sm">{entry.product}</span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg border border-emerald-100">
                                    +{entry.quantity} UNIT
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-bold text-text text-sm">₹{entry.price}</span>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                        {entry.addedBy.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-text">{entry.addedBy}</span>
                                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{entry.outlet}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StockInForm({ onCancel }) {
    return (
        <div className="p-10 max-w-3xl mx-auto animate-slideUp">
            <div className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text tracking-tight">Record New Inward</h3>
                    <p className="text-sm text-text-secondary font-medium">Add new stock received from suppliers to your inventory.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Supplier</label>
                        <div className="relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                                <option>Select Supplier</option>
                                <option>Glossy Cosmetics Ltd</option>
                                <option>Salon Supplies Inc</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Invoice Number</label>
                        <div className="relative group">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="INV-2024-XXX"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Product</label>
                        <div className="relative group">
                            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                                <option>Search existing product...</option>
                                <option>L'Oréal Professionnel Shampoo</option>
                                <option>Dyson Supersonic Filter</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Quantity Received</label>
                        <div className="relative group">
                            <ArrowUpRight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Unit Purchase Price</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="number"
                                placeholder="₹ 0.00"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Recipient Outlet</label>
                        <div className="relative group">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <select className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                                <option>Select Destination</option>
                                <option>Andheri West</option>
                                <option>Bandra</option>
                                <option>All Outlets</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Received Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface transition-all"
                    >
                        Cancel
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active">
                        <Send className="w-4 h-4" />
                        Confirm Entry
                    </button>
                </div>
            </div>
        </div>
    );
}
