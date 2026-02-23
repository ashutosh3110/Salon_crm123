import { useState, useMemo } from 'react';
import {
    Search, Calendar, Eye, X,
    Clock, CreditCard, Banknote, Smartphone, Ban,
    ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/posData';

export default function POSInvoicesPage() {
    const invoices = MOCK_INVOICES;

    /*
     * TODO: Replace with real API call:
     * const [invoices, setInvoices] = useState([]);
     * const [loading, setLoading] = useState(true);
     * useEffect(() => {
     *   api.get('/invoices?limit=20').then(res => setInvoices(res.data.results));
     * }, []);
     */

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 10;

    const filtered = useMemo(() => {
        return invoices.filter(inv => {
            const matchSearch = !search ||
                inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                inv.clientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                inv.clientId?.phone?.includes(search);

            let matchDate = true;
            if (dateFilter === 'today') {
                const today = new Date().toISOString().split('T')[0];
                matchDate = inv.createdAt?.startsWith(today);
            }
            return matchSearch && matchDate;
        });
    }, [invoices, search, dateFilter]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'online': return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
            case 'card': return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
            case 'unpaid': return <Ban className="w-3.5 h-3.5 text-orange-500" />;
            default: return <Banknote className="w-3.5 h-3.5 text-green-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Invoices</h1>
                    <p className="text-sm text-text-secondary mt-1">View and search all billing invoices.</p>
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
                        <FileText className="w-4 h-4" /> All
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by invoice, client, or phone..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                {paginated.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm">No invoices found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Outlet</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginated.map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface/50 transition-colors text-sm">
                                        <td className="px-6 py-4 font-bold text-primary">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-text-secondary flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(inv.createdAt)}</td>
                                        <td className="px-6 py-4 font-medium text-text">{inv.clientId?.name || 'Walk-in'}</td>
                                        <td className="px-6 py-4 text-text-secondary">{inv.outletId?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 font-medium text-text capitalize">
                                                {getMethodIcon(inv.paymentMethod)}
                                                {inv.paymentMethod === 'online' ? 'UPI' : inv.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-text">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedInvoice(inv)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-text-muted">{filtered.length} invoices</p>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1.5 text-xs font-medium text-text-secondary">{page}/{totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-30 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-text">{selectedInvoice.invoiceNumber}</h2>
                                <p className="text-sm text-text-secondary mt-0.5">{formatDate(selectedInvoice.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-surface rounded-lg transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface rounded-2xl p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-text-secondary">Client</span><span className="font-medium">{selectedInvoice.clientId?.name || 'Walk-in'}</span></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Outlet</span><span className="font-medium">{selectedInvoice.outletId?.name || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Stylist</span><span className="font-medium">{selectedInvoice.staffId?.name || '-'}</span></div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Items</p>
                                {selectedInvoice.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 text-sm">
                                        <div>
                                            <p className="font-medium text-text">{item.name}</p>
                                            <p className="text-xs text-text-muted capitalize">{item.type} × {item.quantity}</p>
                                        </div>
                                        <span className="font-bold">₹{item.total?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-3 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>₹{selectedInvoice.subTotal?.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-text-secondary">Tax</span><span>+₹{selectedInvoice.tax?.toLocaleString()}</span></div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between"><span className="text-green-600">Discount</span><span className="text-green-600">-₹{selectedInvoice.discount?.toLocaleString()}</span></div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t border-dashed border-border pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">₹{selectedInvoice.total?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-surface rounded-xl p-3">
                                <span className="text-sm text-text-secondary">Payment</span>
                                <div className="flex items-center gap-2">
                                    {getMethodIcon(selectedInvoice.paymentMethod)}
                                    <span className="text-sm font-medium capitalize">{selectedInvoice.paymentMethod === 'online' ? 'UPI' : selectedInvoice.paymentMethod}</span>
                                    <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedInvoice.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {selectedInvoice.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
