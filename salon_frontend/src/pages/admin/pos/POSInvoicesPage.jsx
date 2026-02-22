import {
    Search,
    Filter,
    Eye,
    Printer,
    Download,
    Calendar,
    SearchX
} from 'lucide-react';
import { useState } from 'react';

const MOCK_INVOICES = [
    { id: 'INV-2026-001', date: '21 Feb 2026, 11:30 AM', outlet: 'Downtown', customer: 'Aman Verma', amount: '₹1,250', mode: 'UPI', status: 'Paid' },
    { id: 'INV-2026-002', date: '21 Feb 2026, 12:15 PM', outlet: 'Bandra', customer: 'Sonal Jha', amount: '₹2,400', mode: 'Card', status: 'Paid' },
    { id: 'INV-2026-003', date: '21 Feb 2026, 01:05 PM', outlet: 'Pune', customer: 'Rohit K.', amount: '₹850', mode: 'Cash', status: 'Refunded' },
    { id: 'INV-2026-004', date: '21 Feb 2026, 02:20 PM', outlet: 'Downtown', customer: 'Deepika S.', amount: '₹3,200', mode: 'UPI', status: 'Paid' },
];

export default function POSInvoicesPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Invoices</h1>
                    <p className="text-sm text-text-secondary mt-1">View and manage sales receipts.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Invoice No or Customer..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                </div>
                <div className="flex gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-secondary transition-colors">
                        <Calendar className="w-4 h-4" /> Today
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-secondary hover:bg-secondary transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Invoice No</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Outlet</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_INVOICES.map((inv) => (
                                <tr key={inv.id} className="hover:bg-surface/50 transition-colors group text-sm">
                                    <td className="px-6 py-4 font-bold text-primary">{inv.id}</td>
                                    <td className="px-6 py-4 text-text-secondary">{inv.date}</td>
                                    <td className="px-6 py-4 font-medium text-text">{inv.customer}</td>
                                    <td className="px-6 py-4 text-text-secondary">{inv.outlet}</td>
                                    <td className="px-6 py-4 text-right font-bold text-text">{inv.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all" title="View Detail"><Eye className="w-4 h-4" /></button>
                                            <button className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all" title="Print"><Printer className="w-4 h-4" /></button>
                                            <button className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all" title="Download"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-[11px] text-text-muted text-center italic">✨ Invoices are read-only. For editing or creation, please use the POS terminal.</p>
        </div>
    );
}
