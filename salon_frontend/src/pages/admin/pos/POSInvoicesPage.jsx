import { useState, useEffect } from 'react';
import {
    Search, Filter, Eye, Printer, Download, Calendar,
    Loader2, X, ChevronLeft, ChevronRight, Receipt
} from 'lucide-react';
import mockApi from '../../../services/mock/mockApi';

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
            const res = await mockApi.get(`/invoices?${params.toString()}`);
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

    if (loading && invoices.length === 0) return <div className="p-20 text-center font-black uppercase tracking-widest text-text-muted">Loading Invoices...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="text-left font-black">
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight italic">Transaction Ledger</h1>
                    <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Verified Records & Audit Trail [OFFLINE ENABLED]</p>
                </div>
            </div>

            <div className="bg-white p-6 border border-border flex flex-col md:flex-row gap-4 text-left">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Scan for Invoice No..."
                        className="w-full pl-12 pr-4 py-3.5 border border-border bg-surface-alt text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setDateFilter('today'); setPage(1); }} className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border ${dateFilter === 'today' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-muted hover:bg-surface-alt'}`}>Today</button>
                    <button onClick={() => { setDateFilter('all'); setPage(1); }} className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border ${dateFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-border text-text-muted hover:bg-surface-alt'}`}>All Data</button>
                </div>
            </div>

            <div className="bg-white border border-border overflow-hidden text-left shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Doc-Identifier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Pulse-Stamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Entry-Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Payload Value</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-left">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-surface-alt/50 transition-all text-sm group">
                                    <td className="px-8 py-5 font-black text-primary uppercase italic">{inv.invoiceNumber}</td>
                                    <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase">{formatDate(inv.createdAt)}</td>
                                    <td className="px-8 py-5 font-black text-text uppercase tracking-tight">{inv.clientId?.name || 'Manual-Entity'}</td>
                                    <td className="px-8 py-5 text-right font-black text-text">₹{inv.total?.toLocaleString()}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 text-[9px] font-black uppercase border ${inv.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                            {inv.paymentStatus || 'PAID'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setSelectedInvoice(inv)} className="p-2 hover:bg-primary/10 transition-colors"><Eye className="w-4 h-4 text-primary" /></button>
                                            <button onClick={() => window.print()} className="p-2 hover:bg-surface-alt transition-colors"><Printer className="w-4 h-4 text-text-muted" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-white border border-border w-full max-w-xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start border-b border-border pb-6">
                            <div className="text-left font-black">
                                <h3 className="text-xl text-primary uppercase italic">{selectedInvoice.invoiceNumber}</h3>
                                <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Entry Confirmed: {formatDate(selectedInvoice.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-red-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-text-muted italic">Entity Profile</span>
                                <span className="text-text">{selectedInvoice.clientId?.name}</span>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-text-muted italic">Protocol Auth</span>
                                <span className="text-text capitalize">{selectedInvoice.paymentMethod}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-surface-alt border border-border">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Verified Payload Sum</p>
                                <p className="text-3xl font-black text-primary">₹{selectedInvoice.total?.toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={() => window.print()} className="w-full py-4 border border-text text-[10px] font-black uppercase tracking-[0.3em] hover:bg-text hover:text-white transition-all flex items-center justify-center gap-3">
                            <Printer className="w-4 h-4" /> Hardcopy Manifest
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
