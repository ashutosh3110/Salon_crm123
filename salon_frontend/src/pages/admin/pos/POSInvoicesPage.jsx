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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Financial Records</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Verified transaction ledger and receipt tracking</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-6 rounded-none border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by Invoice No or Customer..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-none border border-border bg-surface-alt text-[10px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setDateFilter('today'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${dateFilter === 'today' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:bg-surface-alt'}`}
                    >
                        <Calendar className="w-4 h-4" /> Today
                    </button>
                    <button
                        onClick={() => { setDateFilter('all'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${dateFilter === 'all' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border text-text-muted hover:bg-surface-alt'}`}
                    >
                        <Filter className="w-4 h-4" /> All Records
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6 bg-surface-alt/10">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Downloading Ledger Data...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="py-24 text-center bg-surface-alt/10">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Zero entries matching current filter parameters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-alt border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Invoice ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Entity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Node</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Protocol</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Value</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-surface-alt transition-all group text-sm">
                                        <td className="px-8 py-5 font-black text-primary uppercase tracking-widest">{inv.invoiceNumber}</td>
                                        <td className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-tight">{formatDate(inv.createdAt)}</td>
                                        <td className="px-8 py-5 font-black text-text uppercase tracking-widest">{inv.clientId?.name || 'Walk-in Entity'}</td>
                                        <td className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest">{inv.outletId?.name || 'SYSTEM'}</td>
                                        <td className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">{inv.paymentMethod}</td>
                                        <td className="px-8 py-5 text-right font-black text-text tracking-tight">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : inv.paymentStatus === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedInvoice(inv)} className="w-9 h-9 flex items-center justify-center rounded-none text-text-muted border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all" title="Inspect Payload"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => window.print()} className="w-9 h-9 flex items-center justify-center rounded-none text-text-muted border border-transparent hover:border-primary/20 hover:bg-surface-alt hover:text-text transition-all" title="Generate Hardcopy"><Printer className="w-4 h-4" /></button>
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
                    <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-surface-alt/30">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cycle {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="w-10 h-10 flex items-center justify-center rounded-none border border-border bg-surface text-text-muted hover:bg-primary hover:text-white disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="w-10 h-10 flex items-center justify-center rounded-none border border-border bg-surface text-text-muted hover:bg-primary hover:text-white disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-text-muted tracking-[0.2em] text-center uppercase opacity-40">System note: Financial logs are immutable. Corrections must be handled via standard credit protocols.</p>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-surface rounded-none border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-10 py-6 border-b border-border bg-surface-alt/50">
                            <h3 className="text-sm font-black text-text uppercase tracking-[0.2em]">Log Entry Inspection</h3>
                            <button onClick={() => setSelectedInvoice(null)} className="w-10 h-10 rounded-none border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
                            {/* Header */}
                            <div className="flex justify-between items-start border-b border-dashed border-border pb-8">
                                <div>
                                    <p className="text-xl font-black text-primary tracking-widest uppercase">{selectedInvoice.invoiceNumber}</p>
                                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">{formatDate(selectedInvoice.createdAt)}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] border ${selectedInvoice.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                    {selectedInvoice.paymentStatus || 'VERIFIED'}
                                </span>
                            </div>

                            {/* Client & Outlet */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-surface-alt border border-border p-5 rounded-none">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Origin Entity</p>
                                    <p className="text-sm font-black text-text uppercase tracking-widest">{selectedInvoice.clientId?.name || 'Walk-in'}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{selectedInvoice.clientId?.phone || 'ANONYMOUS'}</p>
                                </div>
                                <div className="bg-surface-alt border border-border p-5 rounded-none">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">Service Node</p>
                                    <p className="text-sm font-black text-text uppercase tracking-widest">{selectedInvoice.outletId?.name || 'CENTRAL'}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1 capitalize">{selectedInvoice.paymentMethod} Protocol</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Transaction Payloads</p>
                                <div className="divide-y divide-border border border-border">
                                    {selectedInvoice.items?.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm p-5 hover:bg-surface-alt/50 transition-all bg-surface">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-none border ${item.type === 'service' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>{item.type === 'service' ? 'SRV' : 'PRD'}</span>
                                                <span className="font-black text-text uppercase tracking-widest leading-none">{item.name}</span>
                                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-2">Qty {item.quantity}</span>
                                            </div>
                                            <span className="font-black text-text tracking-tight">₹{item.total?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-surface-alt border border-border p-8 space-y-4 shadow-inner">
                                <div className="flex justify-between text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">
                                    <span>Raw Pulse Subtotal</span>
                                    <span>₹{selectedInvoice.subTotal?.toLocaleString()}</span>
                                </div>
                                {selectedInvoice.tax > 0 && (
                                    <div className="flex justify-between text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">
                                        <span>System Surcharge</span>
                                        <span className="text-text">+₹{selectedInvoice.tax?.toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">
                                        <span>Incentive Applied</span>
                                        <span>-₹{selectedInvoice.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-black pt-4 border-t border-border uppercase tracking-tight">
                                    <span className="text-[10px] mt-2 text-text-muted opacity-60">Total Payload Sum</span>
                                    <span className="text-primary">₹{selectedInvoice.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-border bg-surface-alt/30 flex justify-end">
                            <button onClick={() => window.print()} className="px-8 py-4 bg-surface rounded-none border border-border text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center gap-3">
                                <Printer className="w-4 h-4" /> Print Hardcopy Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
