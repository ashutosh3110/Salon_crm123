import { useState, useMemo } from 'react';
import {
    Search, Calendar, Eye, X,
    Clock, CreditCard, Banknote, Smartphone, Ban,
    ChevronLeft, ChevronRight, FileText, Loader2
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/posData';
import {
    Document, Page, Text, View, StyleSheet, pdf, Font
} from '@react-pdf/renderer';

// Register a custom font that supports the Rupee symbol (built-in fonts like Helvetica do not)
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Roboto', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 10 },
    salonName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    salonMeta: { fontSize: 9, color: '#666' },
    invoiceTitle: { fontSize: 32, color: '#EEE', position: 'absolute', right: 0, top: 0, fontWeight: 'bold' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },
    metaBox: { width: '45%', backgroundColor: '#F8F8F8', padding: 10 },
    label: { fontSize: 8, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
    value: { fontSize: 12, fontWeight: 'bold' },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 5 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingTop: 8, paddingBottom: 8 },
    colDesc: { flex: 3 },
    colPrice: { flex: 1, textAlign: 'center' },
    colQty: { flex: 0.5, textAlign: 'center' },
    colTotal: { flex: 1, textAlign: 'right' },
    summarySection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    summaryBox: { width: 180 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    grandTotal: { fontSize: 18, fontWeight: 'bold', borderTopWidth: 2, borderTopColor: '#000', paddingTop: 10, marginTop: 10 },
    footer: { marginTop: 40, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
    thanks: { fontSize: 16, marginBottom: 5 }
});

const InvoicePDF = ({ invoice }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <Text style={pdfStyles.salonName}>XYZ SALON & SPA</Text>
                <Text style={pdfStyles.salonMeta}>Lucknow Main Branch</Text>
                <Text style={pdfStyles.salonMeta}>Gomti Nagar, Lucknow, UP | +91 98765 43210</Text>
                <Text style={pdfStyles.salonMeta}>GSTIN: 09AAFCC0301F1ZN</Text>
                <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
            </View>

            <View style={pdfStyles.metaRow}>
                <View style={pdfStyles.metaBox}>
                    <Text style={pdfStyles.label}>Billed To</Text>
                    <Text style={pdfStyles.value}>{invoice.clientId?.name || 'Walk-in Client'}</Text>
                    <Text style={pdfStyles.salonMeta}>{invoice.clientId?.phone}</Text>
                    <Text style={pdfStyles.salonMeta}>{invoice.clientId?.email || ''}</Text>
                </View>
                <View style={pdfStyles.metaBox}>
                    <Text style={pdfStyles.label}>Invoice Details</Text>
                    <Text style={pdfStyles.value}>#{invoice.invoiceNumber}</Text>
                    <Text style={pdfStyles.salonMeta}>Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN')}</Text>
                    <Text style={pdfStyles.salonMeta}>Payment: {invoice.paymentMethod.toUpperCase()}</Text>
                </View>
            </View>

            <View style={pdfStyles.tableHeader}>
                <Text style={[pdfStyles.colDesc, { fontSize: 8, fontWeight: 'bold' }]}>DESCRIPTION</Text>
                <Text style={[pdfStyles.colPrice, { fontSize: 8, fontWeight: 'bold' }]}>PRICE</Text>
                <Text style={[pdfStyles.colQty, { fontSize: 8, fontWeight: 'bold' }]}>QTY</Text>
                <Text style={[pdfStyles.colTotal, { fontSize: 8, fontWeight: 'bold' }]}>TOTAL</Text>
            </View>

            {invoice.items?.map((item, i) => (
                <View key={i} style={pdfStyles.tableRow}>
                    <View style={pdfStyles.colDesc}>
                        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                        <Text style={{ fontSize: 8, color: '#666' }}>Category: {item.type}</Text>
                    </View>
                    <Text style={pdfStyles.colPrice}>₹ {item.price || (item.total / item.quantity).toFixed(0)}</Text>
                    <Text style={pdfStyles.colQty}>{item.quantity}</Text>
                    <Text style={pdfStyles.colTotal}>₹ {item.total?.toFixed(0)}</Text>
                </View>
            ))}

            <View style={pdfStyles.summarySection}>
                <View style={pdfStyles.summaryBox}>
                    <View style={pdfStyles.summaryRow}>
                        <Text>Subtotal</Text>
                        <Text>₹ {invoice.subTotal?.toFixed(0)}</Text>
                    </View>
                    {invoice.discount > 0 && (
                        <View style={pdfStyles.summaryRow}>
                            <Text style={{ color: '#E53E3E' }}>Discount Applied</Text>
                            <Text style={{ color: '#E53E3E' }}>-₹ {invoice.discount?.toFixed(0)}</Text>
                        </View>
                    )}
                    <View style={pdfStyles.summaryRow}>
                        <Text>Tax Amount</Text>
                        <Text>₹ {invoice.tax?.toFixed(2)}</Text>
                    </View>
                    <View style={[pdfStyles.summaryRow, pdfStyles.grandTotal]}>
                        <Text>GRAND TOTAL</Text>
                        <Text>₹ {invoice.total?.toFixed(0)}</Text>
                    </View>
                </View>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.thanks}>Thank you for visiting XYZ Salon!</Text>
                <Text style={{ fontSize: 8, color: '#999' }}>Computer generated invoice. No signature required.</Text>
            </View>
        </Page>
    </Document>
);

export default function POSInvoicesPage() {
    const invoices = MOCK_INVOICES;

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [page, setPage] = useState(1);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const perPage = 10;

    const handleDownloadPDF = async () => {
        if (!selectedInvoice) return;
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={selectedInvoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedInvoice.invoiceNumber}_${selectedInvoice.clientId?.name || 'Invoice'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-text tracking-tight uppercase">Invoices</h1>
                    <p className="text-sm text-text-secondary mt-1">View and search all billing invoices.</p>
                </div>
                <div className="flex bg-surface p-1 border border-border">
                    <button
                        onClick={() => { setDateFilter('today'); setPage(1); }}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-none text-[11px] font-black uppercase tracking-wider transition-all ${dateFilter === 'today' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}
                    >
                        <Calendar className="w-3.5 h-3.5" /> Today
                    </button>
                    <button
                        onClick={() => { setDateFilter('all'); setPage(1); }}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-none text-[11px] font-black uppercase tracking-wider transition-all ${dateFilter === 'all' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'}`}
                    >
                        <FileText className="w-3.5 h-3.5" /> All
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-none border border-border bg-surface text-sm font-medium focus:outline-none focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                {paginated.length === 0 ? (
                    <div className="py-16 text-center text-text-muted text-sm bg-background">No invoices found.</div>
                ) : (
                    <div className="overflow-x-auto bg-background">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface-alt text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">
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
                            <tbody className="divide-y divide-border/50">
                                {paginated.map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors text-sm">
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
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-none text-[10px] font-black uppercase tracking-wider border ${inv.paymentStatus === 'paid' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 border-orange-100 dark:border-orange-500/20'}`}>
                                                {inv.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedInvoice(inv)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
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
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{filtered.length} invoices found</p>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-none border border-border bg-background text-text-secondary hover:text-primary hover:border-primary disabled:opacity-30 transition-all">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-4 py-1.5 rounded-none border border-border bg-background flex items-center">
                                <span className="text-xs font-black text-text-secondary">{page} <span className="text-text-muted mx-1">/</span> {totalPages}</span>
                            </div>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-none border border-border bg-background text-text-secondary hover:text-primary hover:border-primary disabled:opacity-30 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-none w-full max-w-lg p-0 shadow-2xl animate-in zoom-in-95 duration-200 border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-6 bg-surface-alt border-b border-border">
                            <div>
                                <h2 className="text-xl font-black text-text uppercase tracking-tight">{selectedInvoice.invoiceNumber}</h2>
                                <p className="text-[11px] font-bold text-text-secondary mt-0.5">{formatDate(selectedInvoice.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-background transition-colors">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="bg-background p-4 space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Client</span><span className="text-sm font-bold text-text">{selectedInvoice.clientId?.name || 'Walk-in'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Outlet</span><span className="text-sm font-bold text-text">{selectedInvoice.outletId?.name || '-'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Assigned At</span><span className="text-sm font-bold text-text">{selectedInvoice.staffId?.name || '-'}</span></div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border pb-1">Line Items</p>
                                {selectedInvoice.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-1 text-sm">
                                        <div>
                                            <p className="font-bold text-text uppercase text-xs tracking-tight">{item.name}</p>
                                            <p className="text-[10px] text-text-muted font-medium capitalize">{item.type} × {item.quantity}</p>
                                        </div>
                                        <span className="font-black text-text">₹{item.total?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-border pt-4 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-text-secondary"><span>Subtotal</span><span>₹{selectedInvoice.subTotal?.toLocaleString()}</span></div>
                                <div className="flex justify-between text-xs font-bold text-text-secondary"><span>Tax Amt</span><span>+₹{selectedInvoice.tax?.toLocaleString()}</span></div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-emerald-500"><span>Discount Applied</span><span>-₹{selectedInvoice.discount?.toLocaleString()}</span></div>
                                )}
                                <div className="flex justify-between text-xl font-black text-text border-t border-border pt-3 mt-2">
                                    <span className="uppercase tracking-tighter">Total</span>
                                    <span className="text-primary tracking-tight">₹{selectedInvoice.total?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-surface-alt border border-border p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 bg-background border border-border ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                        {getMethodIcon(selectedInvoice.paymentMethod)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase">Paid Via</p>
                                        <p className="text-xs font-bold text-text uppercase">{selectedInvoice.paymentMethod === 'online' ? 'UPI / Online' : selectedInvoice.paymentMethod}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 ${selectedInvoice.paymentStatus === 'paid' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    {selectedInvoice.paymentStatus}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border">
                            <button
                                disabled={isGeneratingPDF}
                                onClick={handleDownloadPDF}
                                className="w-full py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                {isGeneratingPDF ? 'Generating Document...' : 'Download PDF Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
