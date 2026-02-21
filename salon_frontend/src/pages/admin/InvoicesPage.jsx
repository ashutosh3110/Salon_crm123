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
                <h1 className="text-2xl font-bold text-text">Invoices</h1>
                <p className="text-sm text-text-secondary mt-1">{invoices.length} total invoices</p>
            </div>

            <div className="flex items-center bg-white rounded-lg border border-border px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-text-muted mr-2" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by invoice # or client..." className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full" />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20"><FileText className="w-12 h-12 text-text-muted mx-auto mb-3" /><p className="text-sm text-text-secondary">No invoices found</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-border bg-surface">
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Invoice #</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Client</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden md:table-cell">Date</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Amount</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary">Status</th>
                                <th className="text-left px-5 py-3 font-semibold text-text-secondary hidden md:table-cell">Payment</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map((inv) => (
                                    <tr key={inv._id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs font-medium text-primary">{inv.invoiceNumber || inv._id?.slice(-8)}</td>
                                        <td className="px-5 py-3 font-medium text-text">{inv.client?.name || 'Walk-in'}</td>
                                        <td className="px-5 py-3 text-text-secondary hidden md:table-cell">{new Date(inv.createdAt).toLocaleDateString('en-IN')}</td>
                                        <td className="px-5 py-3"><span className="flex items-center gap-0.5 font-semibold"><IndianRupee className="w-3 h-3" />{inv.total || inv.grandTotal || 0}</span></td>
                                        <td className="px-5 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-md capitalize ${statusColors[inv.paymentStatus] || 'bg-gray-50 text-gray-500'}`}>{inv.paymentStatus || 'paid'}</span></td>
                                        <td className="px-5 py-3 text-text-secondary hidden md:table-cell capitalize">{inv.paymentMethod || '—'}</td>
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
