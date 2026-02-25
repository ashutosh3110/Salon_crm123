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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Ledger Registry</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                        Authenticated Transaction Sequence
                    </p>
                </div>
                <div className="flex bg-surface p-1 border border-border shadow-sm">
                    <button
                        onClick={() => { setDateFilter('today'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${dateFilter === 'today' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                    >
                        <Calendar className="w-4 h-4" /> Loop_Today
                    </button>
                    <button
                        onClick={() => { setDateFilter('all'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${dateFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                    >
                        <FileText className="w-4 h-4" /> Recursive_All
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="QUERY: INVOICE_ID, ENTITY_NAME, OR CONTACT_STR"
                    className="w-full pl-12 pr-6 py-4 rounded-none border border-border bg-surface text-[11px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-muted opacity-40 group-focus-within:opacity-100 uppercase tracking-widest">
                    Scan_Active
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {paginated.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-background">
                        <div className="w-16 h-16 bg-surface border border-border flex items-center justify-center mb-4 opacity-50">
                            <Search className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No matching segments found in current registry</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-background flex-1">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-5">NODE_ID</th>
                                    <th className="px-6 py-5 whitespace-nowrap">TIMESTAMP_UTC</th>
                                    <th className="px-6 py-5">SOURCE_ENTITY</th>
                                    <th className="px-6 py-5">LOC_ORIGIN</th>
                                    <th className="px-6 py-5">TRANSFER_PRTCL</th>
                                    <th className="px-6 py-5 text-right">VAL_CREDIT</th>
                                    <th className="px-6 py-5">SIG_STATUS</th>
                                    <th className="px-6 py-5 text-center">OPS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginated.map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors group">
                                        <td className="px-6 py-5 font-black text-primary uppercase tracking-tighter whitespace-nowrap">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-5 text-text-muted text-[11px] font-bold uppercase tracking-tight flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 opacity-40" /> {formatDate(inv.createdAt)}
                                        </td>
                                        <td className="px-6 py-5 font-black text-text text-[11px] uppercase tracking-tight">{inv.clientId?.name || 'ANN_GUEST'}</td>
                                        <td className="px-6 py-5 text-text-muted text-[10px] font-black uppercase tracking-widest">{inv.outletId?.name || '---'}</td>
                                        <td className="px-6 py-5">
                                            <span className="flex items-center gap-2 font-black text-text text-[10px] uppercase tracking-widest">
                                                <div className="p-1 bg-surface-alt border border-border group-hover:bg-background transition-colors">
                                                    {getMethodIcon(inv.paymentMethod)}
                                                </div>
                                                {inv.paymentMethod === 'online' ? 'UPI_INT' : `${inv.paymentMethod?.toUpperCase()}_HND`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-text tracking-tighter text-base">₹{inv.total?.toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                                {inv.paymentStatus === 'paid' ? 'SIG_VERIFIED' : 'PENDING_AUTH'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button onClick={() => setSelectedInvoice(inv)} className="p-2 border border-border bg-surface hover:bg-primary hover:border-primary hover:text-white transition-all group/btn active:scale-95 shadow-sm">
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
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-surface-alt/30">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Registry Range: {filtered.length} Segments Identified</p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-none border border-border bg-surface text-text-muted hover:text-primary hover:border-primary disabled:opacity-20 transition-all active:scale-95 shadow-sm uppercase font-black text-[9px] tracking-widest">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="px-6 py-2 rounded-none border border-border bg-surface flex items-center shadow-sm">
                                <span className="text-[10px] font-black text-text uppercase tracking-widest">Page {page} <span className="text-text-muted mx-2 opacity-30">/</span> {totalPages}</span>
                            </div>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-none border border-border bg-surface text-text-muted hover:text-primary hover:border-primary disabled:opacity-20 transition-all active:scale-95 shadow-sm uppercase font-black text-[9px] tracking-widest">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface rounded-none w-full max-w-2xl p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-8 bg-surface-alt border-b border-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-12 -mt-12 rotate-45 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Segment_Metadata</p>
                                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">{selectedInvoice.invoiceNumber}</h2>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> Commited At: {formatDate(selectedInvoice.createdAt)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-3 bg-surface border border-border hover:bg-background transition-all group active:scale-90 relative z-10 shadow-sm">
                                <X className="w-6 h-6 text-text-muted group-hover:text-text" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin bg-background">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Source_Entity</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.clientId?.name || 'ANN_GUEST'}</p>
                                </div>
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Origin_Node</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.outletId?.name || 'LOCAL_SRV'}</p>
                                </div>
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Ops_Executive</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.staffId?.name || 'SYS_AUTO'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-px bg-border flex-1" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Payload_Segments</p>
                                    <div className="h-px bg-border flex-1" />
                                </div>
                                <div className="space-y-3">
                                    {selectedInvoice.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 bg-surface border border-border/50 group hover:border-primary/30 transition-all cursor-default">
                                            <div>
                                                <p className="font-black text-text uppercase text-xs tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.1em] mt-1 italic">Type: {item.type} • Units: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-text text-lg tracking-tighter">₹{item.total?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-surface-alt/30 border border-border p-6 space-y-4">
                                <div className="flex justify-between text-xs font-black text-text-muted uppercase tracking-widest">
                                    <span>Sub_Total_Aggregate</span>
                                    <span>₹{selectedInvoice.subTotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-text-muted uppercase tracking-widest">
                                    <span>Tax_Surcharge (GST)</span>
                                    <span>+₹{selectedInvoice.tax?.toLocaleString()}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-xs font-black text-emerald-600 uppercase tracking-widest">
                                        <span>Incentive_Credit</span>
                                        <span>-₹{selectedInvoice.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-border pt-4 mt-2 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Total_Liability</p>
                                        <p className="text-3xl font-black text-text tracking-tighter uppercase whitespace-nowrap">Net_Credit: <span className="text-primary tracking-tighter">₹{selectedInvoice.total?.toLocaleString()}</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-background border border-border p-4 shadow-sm group/sig">
                                        <div className={`p-2 border border-border group-hover/sig:border-primary/40 transition-colors ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-500 bg-emerald-500/5' : 'text-orange-500 bg-orange-500/5'}`}>
                                            {getMethodIcon(selectedInvoice.paymentMethod)}
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>{selectedInvoice.paymentStatus === 'paid' ? 'SIG_OK' : 'SIG_REQ'}</p>
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{selectedInvoice.paymentMethod === 'online' ? 'UPI_INT' : selectedInvoice.paymentMethod?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-surface-alt border-t border-border flex gap-4">
                            <button
                                disabled={isGeneratingPDF}
                                onClick={handleDownloadPDF}
                                className="flex-1 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-xl shadow-primary/20 active:scale-95"
                            >
                                {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                {isGeneratingPDF ? 'Compiling_Assets...' : 'Export_Registry_Blob (PDF)'}
                            </button>
                            <button onClick={() => setSelectedInvoice(null)} className="px-8 py-4 border border-border bg-surface text-text-muted font-black text-[11px] uppercase tracking-[0.2em] hover:text-text hover:bg-surface-alt transition-all active:scale-95">
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
