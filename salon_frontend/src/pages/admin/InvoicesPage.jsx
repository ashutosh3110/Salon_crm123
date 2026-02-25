import { useState, useEffect } from 'react';
import { Search, FileText, IndianRupee, Download } from 'lucide-react';
import api from '../../services/api';

const statusColors = {
    paid: 'bg-green-50 text-green-600',
    pending: 'bg-yellow-50 text-yellow-600',
    partially_paid: 'bg-orange-50 text-orange-600',
    refunded: 'bg-red-50 text-red-600',
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchInvoices = async () => {
        try { setLoading(true); const { data } = await api.get('/invoices'); setInvoices(data.data || data || []); }
        catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchInvoices(); }, []);

    const filtered = invoices.filter((inv) => inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.client?.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-text uppercase tracking-tight">Financial Ledger</h1>
                <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em]">{invoices.length} committed transactions</p>
            </div>

            <div className="flex items-center bg-surface-alt rounded-none border border-border px-4 py-3 max-w-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="w-4 h-4 text-text-muted mr-3" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Scan by invoice ID or entity..."
                    className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-text placeholder:text-text-muted/40 outline-none w-full"
                />
            </div>

            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <FileText className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Documents Found</h3>
                        <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">Archival scan complete</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface-alt">
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Document ID</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Registry Entity</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden md:table-cell">Timestamp</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Value pulse</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80">Status</th>
                                <th className="text-left px-8 py-5 text-[11px] font-black text-text uppercase tracking-widest bg-surface-alt/80 hidden md:table-cell">Link Protocol</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map((inv) => (
                                    <tr key={inv._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-all group">
                                        <td className="px-8 py-5 font-mono text-[10px] font-black text-primary uppercase tracking-widest">{inv.invoiceNumber || inv._id?.slice(-8)}</td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-text uppercase tracking-tight">{inv.client?.name || 'Walk-in entity'}</span>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-8 py-5">
                                            <span className="flex items-center gap-1 font-black text-text text-sm">
                                                <IndianRupee className="w-3.5 h-3.5 opacity-40" />
                                                {(inv.total || inv.grandTotal || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[9px] font-black border uppercase tracking-widest ${statusColors[inv.paymentStatus] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                {inv.paymentStatus || 'PAID'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">{inv.paymentMethod || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
