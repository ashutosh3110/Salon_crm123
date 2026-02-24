import React from 'react';
import { FileText, Calendar, DollarSign, Clock, CheckCircle2, AlertCircle, Search, Filter, Download, ArrowRight } from 'lucide-react';

const MOCK_INVOICES = [
    { id: '1', supplier: 'Glossy Cosmetics Ltd', invoiceNo: 'GC-2024-88', date: '2024-03-20', amount: 15200, due: '2024-04-05', status: 'Pending' },
    { id: '2', supplier: 'Salon Supplies Inc', invoiceNo: 'SS-9021', date: '2024-03-18', amount: 4800, due: '2024-03-25', status: 'Overdue' },
    { id: '3', supplier: 'Organic India', invoiceNo: 'OI-INV-102', date: '2024-03-12', amount: 9200, due: '2024-03-12', status: 'Paid' },
    { id: '4', supplier: 'Glossy Cosmetics Ltd', invoiceNo: 'GC-2024-82', date: '2024-03-10', amount: 25000, due: '2024-03-24', status: 'Partial' },
];

export default function SupplierInvoices() {
    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* Context Header */}
            <div className="p-6 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by Invoice No or Supplier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all">
                            <Calendar className="w-4 h-4" />
                            Date Range
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all">
                            <Filter className="w-4 h-4" />
                            Status
                        </button>
                    </div>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all scale-active">
                    <Download className="w-4 h-4" />
                    Export Invoices
                </button>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-0">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Supplier & Invoice</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Billing Date</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Invoice Amount</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Due Date</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Settlement</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {MOCK_INVOICES.map((inv) => (
                            <tr key={inv.id} className="hover:bg-surface/30 transition-colors group cursor-default">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-surface text-text-muted'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-text text-sm group-hover:text-primary transition-colors">{inv.supplier}</span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5"># {inv.invoiceNo}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs font-semibold text-text-secondary">{new Date(inv.date).toLocaleDateString()}</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-sm font-bold text-text tracking-tight">₹{inv.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Clock className={`w-3.5 h-3.5 ${inv.status === 'Overdue' ? 'text-rose-500' : 'text-text-muted'}`} />
                                        <span className={`text-xs font-semibold ${inv.status === 'Overdue' ? 'text-rose-600' : 'text-text-secondary'}`}>
                                            {new Date(inv.due).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-orange-50 text-orange-500 border-orange-100'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="px-4 py-2 bg-white border border-border rounded-xl text-[10px] font-bold text-text-muted uppercase tracking-wider hover:bg-primary hover:text-white hover:border-primary transition-all group/btn">
                                        Record Payment
                                        <ArrowRight className="w-3 h-3 inline-block ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Linkage Alert */}
            <div className="p-4 bg-primary/5 border-t border-primary/10 flex items-center justify-center gap-3">
                <AlertCircle className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    Invoices are auto-generated when recording a 'Stock In' from Inventory.
                    <button className="ml-2 underline hover:text-primary-dark transition-colors">Go to Inventory →</button>
                </p>
            </div>
        </div>
    );
}
