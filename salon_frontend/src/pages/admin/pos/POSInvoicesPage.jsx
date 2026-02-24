import { useState, useEffect } from 'react';
import {
    Search, Filter, Eye, Printer, Download, Calendar,
    Loader2, X, ChevronLeft, ChevronRight, Receipt
} from 'lucide-react';
import api from '../../../services/api';

export default function POSInvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('today');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', 20);
            if (dateFilter === 'today') params.set('date', 'today');
            const res = await api.get(`/invoices?${params.toString()}`);
            const data = res?.data || {};
            setInvoices(data.results || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, [page, dateFilter]);

    const filteredInvoices = invoices.filter(inv => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            inv.invoiceNumber?.toLowerCase().includes(q) ||
            inv.clientId?.name?.toLowerCase().includes(q)
        );
    });

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Invoices</h1>
                    <p className="text-sm text-text-secondary mt-1">View and manage sales receipts.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3">
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
                <div className="flex gap-2">
                    <button
                        onClick={() => { setDateFilter('today'); setPage(1); }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${dateFilter === 'today' ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:bg-secondary'}`}
                    >
                        <Calendar className="w-4 h-4" /> Today
                    </button>
                    <button
                        onClick={() => { setDateFilter('all'); setPage(1); }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${dateFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:bg-secondary'}`}
                    >
                        <Filter className="w-4 h-4" /> All
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm">No invoices found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface border-b border-border">
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Invoice No</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Outlet</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-surface/50 transition-colors group text-sm">
                                        <td className="px-6 py-4 font-bold text-primary">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-text-secondary">{formatDate(inv.createdAt)}</td>
                                        <td className="px-6 py-4 font-medium text-text">{inv.clientId?.name || 'Walk-in'}</td>
                                        <td className="px-6 py-4 text-text-secondary">{inv.outletId?.name || '-'}</td>
                                        <td className="px-6 py-4 text-text-secondary capitalize">{inv.paymentMethod}</td>
                                        <td className="px-6 py-4 text-right font-bold text-text">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : inv.paymentStatus === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setSelectedInvoice(inv)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all" title="View Detail"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => window.print()} className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-all" title="Print"><Printer className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                        <p className="text-xs text-text-muted">Page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-surface disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[11px] text-text-muted text-center">✨ Invoices are read-only. For editing or creation, please use the POS terminal.</p>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-text text-lg">Invoice Detail</h3>
                            <button onClick={() => setSelectedInvoice(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-lg font-bold text-primary">{selectedInvoice.invoiceNumber}</p>
                                    <p className="text-xs text-text-muted mt-1">{formatDate(selectedInvoice.createdAt)}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedInvoice.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {selectedInvoice.paymentStatus}
                                </span>
                            </div>

                            {/* Client & Outlet */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-surface rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Client</p>
                                    <p className="text-sm font-semibold text-text">{selectedInvoice.clientId?.name || 'Walk-in'}</p>
                                    <p className="text-[11px] text-text-muted">{selectedInvoice.clientId?.phone || ''}</p>
                                </div>
                                <div className="bg-surface rounded-xl p-3">
                                    <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Outlet</p>
                                    <p className="text-sm font-semibold text-text">{selectedInvoice.outletId?.name || '-'}</p>
                                    <p className="text-[11px] text-text-muted capitalize">{selectedInvoice.paymentMethod} payment</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-xs font-bold text-text-secondary uppercase mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedInvoice.items?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                                            <div>
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mr-1 ${item.type === 'service' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{item.type === 'service' ? 'SRV' : 'PRD'}</span>
                                                <span className="font-medium text-text">{item.name}</span>
                                                <span className="text-text-muted ml-1">× {item.quantity}</span>
                                            </div>
                                            <span className="font-bold text-text">₹{item.total?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-surface rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Subtotal</span>
                                    <span className="text-text">₹{selectedInvoice.subTotal?.toLocaleString()}</span>
                                </div>
                                {selectedInvoice.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Tax</span>
                                        <span className="text-text">+₹{selectedInvoice.tax?.toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600">Discount</span>
                                        <span className="text-green-600">-₹{selectedInvoice.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-border">
                                    <span>Total Paid</span>
                                    <span className="text-primary">₹{selectedInvoice.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
