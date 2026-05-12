import { useState, useMemo, useEffect } from 'react';
import {
    Search, Calendar, Eye, X, Download,
    Clock, CreditCard, Banknote, Smartphone, Ban,
    ChevronLeft, ChevronRight, FileText, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
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
    page: { 
        padding: 15, 
        fontSize: 9, 
        fontFamily: 'Roboto', 
        backgroundColor: '#FFFFFF',
        flexDirection: 'column'
    },
    centered: {
        textAlign: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column'
    },
    salonName: { 
        fontSize: 16, 
        fontWeight: 700, 
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    salonMeta: { 
        fontSize: 7, 
        color: '#444',
        marginBottom: 1
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'dashed',
        marginVertical: 8,
        width: '100%'
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        fontSize: 7
    },
    label: { 
        fontWeight: 700,
        textTransform: 'uppercase',
        width: 60
    },
    value: { 
        flex: 1,
        textAlign: 'right'
    },
    tableHeader: { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#000', 
        paddingBottom: 3, 
        marginBottom: 5,
        fontWeight: 700,
        fontSize: 7
    },
    tableRow: { 
        flexDirection: 'column',
        marginBottom: 6
    },
    itemMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    itemSubRow: {
        fontSize: 6,
        color: '#666',
        marginTop: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    colDesc: { flex: 2 },
    colPrice: { flex: 1, textAlign: 'right' },
    summaryRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 2,
        fontSize: 8
    },
    grandTotal: { 
        fontSize: 12, 
        fontWeight: 700, 
        borderTopWidth: 1, 
        borderTopColor: '#000', 
        borderTopStyle: 'dashed',
        paddingTop: 8, 
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    footer: { 
        marginTop: 20, 
        textAlign: 'center', 
        fontSize: 7,
        color: '#666'
    },
    thanks: { 
        fontSize: 10, 
        fontWeight: 700,
        marginBottom: 4,
        color: '#000'
    }
});

const InvoicePDF = ({ invoice, salon }) => (
    <Document>
        <Page size={[226, 800]} style={pdfStyles.page}>
            <View style={pdfStyles.centered}>
                <Text style={pdfStyles.salonName}>{salon?.name || salon?.businessName || 'SALON'}</Text>
                <Text style={pdfStyles.salonMeta}>{invoice.outletId?.name || ''}</Text>
                <Text style={pdfStyles.salonMeta}>Ph: {salon?.phone || ''}</Text>
                <Text style={pdfStyles.salonMeta}>GSTIN: {salon?.gstin || 'N/A'}</Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Invoice:</Text>
                <Text style={pdfStyles.value}>#{invoice.invoiceNumber}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Date:</Text>
                <Text style={pdfStyles.value}>{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Customer:</Text>
                <Text style={pdfStyles.value}>{invoice.customerId?.name?.toUpperCase() || 'WALK-IN'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Payment:</Text>
                <Text style={pdfStyles.value}>{invoice.paymentMethod?.toUpperCase() || 'CASH'}</Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.tableHeader}>
                <Text style={pdfStyles.colDesc}>DESCRIPTION</Text>
                <Text style={pdfStyles.colPrice}>AMOUNT</Text>
            </View>

            {invoice.items?.map((item, i) => (
                <View key={i} style={pdfStyles.tableRow}>
                    <View style={pdfStyles.itemMainRow}>
                        <Text style={pdfStyles.colDesc}>{item.name.toUpperCase()}</Text>
                        <Text style={pdfStyles.colPrice}>Rs. {(item.total || 0).toFixed(0)}</Text>
                    </View>
                    <View style={pdfStyles.itemSubRow}>
                        <Text>Qty: {item.quantity} x {item.price || (item.total / item.quantity).toFixed(0)}</Text>
                        <Text>{item.type?.toUpperCase()}</Text>
                    </View>
                </View>
            ))}

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>Rs. {(invoice.subtotal || 0).toFixed(0)}</Text>
            </View>
            {invoice.discount > 0 && (
                <View style={pdfStyles.summaryRow}>
                    <Text>Total Discount</Text>
                    <Text>-Rs. {(invoice.discount || 0).toFixed(0)}</Text>
                </View>
            )}
            
            <View style={pdfStyles.summaryRow}>
                <Text>Tax Amount</Text>
                <Text>Rs. {(invoice.tax || 0).toFixed(2)}</Text>
            </View>

            <View style={pdfStyles.grandTotal}>
                <Text>GRAND TOTAL</Text>
                <Text>Rs. {(invoice.total || 0).toFixed(0)}</Text>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.thanks}>THANK YOU! VISIT AGAIN :)</Text>
                <Text>This is a computer generated receipt.</Text>
                <Text>Generated by Wapixo POS</Text>
            </View>
        </Page>
    </Document>
);

export default function POSInvoicesPage() {
    const { salon } = useBusiness();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [page, setPage] = useState(1);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const perPage = 5;

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                setLoading(true);
                const response = await api.get('/pos/invoices');
                const rows = response?.data?.data || response?.data?.results || response?.data || [];
                setInvoices(Array.isArray(rows) ? rows : []);
            } catch (error) {
                console.error('[POSInvoices] Failed to load invoices:', error);
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, []);

    const handleDownloadPDF = async () => {
        if (!selectedInvoice) return;
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={selectedInvoice} salon={salon} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedInvoice.invoiceNumber}_${selectedInvoice.customerId?.name || 'Invoice'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadDirectPDF = async (inv) => {
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={inv} salon={salon} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${inv.invoiceNumber}_${inv.customerId?.name || 'Invoice'}.pdf`;
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
                inv.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                inv.customerId?.phone?.includes(search);

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
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Invoices</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                        View and manage invoice history
                    </p>
                </div>
                <div className="flex bg-surface p-1 border border-border shadow-sm">
                    <button
                        onClick={() => { setDateFilter('today'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${dateFilter === 'today' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                    >
                        <Calendar className="w-4 h-4" /> Today
                    </button>
                    <button
                        onClick={() => { setDateFilter('all'); setPage(1); }}
                        className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${dateFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                    >
                        <FileText className="w-4 h-4" /> All
                    </button>
                </div>
            </div>

            {/* Earning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface border border-border p-6 shadow-sm group hover:border-primary transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 text-primary">
                            <Banknote className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1">Overall</span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-2xl font-black text-text mt-1 tracking-tighter">₹{invoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}</h3>
                </div>

                <div className="bg-surface border border-border p-6 shadow-sm group hover:border-emerald-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1">Today</span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Today's Earnings</p>
                    <h3 className="text-2xl font-black text-text mt-1 tracking-tighter">
                        ₹{invoices.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}
                    </h3>
                </div>

                <div className="bg-surface border border-border p-6 shadow-sm group hover:border-blue-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1">Digital</span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Online / Card</p>
                    <h3 className="text-2xl font-black text-text mt-1 tracking-tighter">
                        ₹{invoices.filter(i => ['online', 'card'].includes(i.paymentMethod)).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}
                    </h3>
                </div>

                <div className="bg-surface border border-border p-6 shadow-sm group hover:border-amber-500 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-500/10 text-amber-500">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1">Cash</span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cash Collected</p>
                    <h3 className="text-2xl font-black text-text mt-1 tracking-tighter">
                        ₹{invoices.filter(i => i.paymentMethod === 'cash' || !i.paymentMethod).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}
                    </h3>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by invoice number, customer name, or phone"
                    className="w-full pl-12 pr-6 py-4 rounded-none border border-border bg-surface text-[11px] font-black uppercase tracking-widest placeholder:opacity-30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-muted opacity-40 group-focus-within:opacity-100 uppercase tracking-widest">
                    Search
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-background">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Loading invoice ledger...</p>
                    </div>
                ) : paginated.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-background">
                        <div className="w-16 h-16 bg-surface border border-border flex items-center justify-center mb-4 opacity-50">
                            <Search className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">No matching invoices found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-background flex-1">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-5">Invoice</th>
                                    <th className="px-6 py-5 whitespace-nowrap">Date & Time</th>
                                    <th className="px-6 py-5">Customer</th>
                                    <th className="px-6 py-5">Outlet</th>
                                    <th className="px-6 py-5">Payment Method</th>
                                    <th className="px-6 py-5 text-right">Amount</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginated.map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors group">
                                        <td className="px-6 py-5 font-black text-primary uppercase tracking-tighter whitespace-nowrap">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-5 text-text-muted text-[11px] font-bold uppercase tracking-tight flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 opacity-40" /> {formatDate(inv.createdAt)}
                                        </td>
                                        <td className="px-6 py-5 font-black text-text text-[11px] uppercase tracking-tight">{inv.customerId?.name || 'Guest'}</td>
                                        <td className="px-6 py-5 text-text-muted text-[10px] font-black uppercase tracking-widest">{inv.outletId?.name || '-'}</td>
                                        <td className="px-6 py-5">
                                            <span className="flex items-center gap-2 font-black text-text text-[10px] uppercase tracking-widest">
                                                <div className="p-1 bg-surface-alt border border-border group-hover:bg-background transition-colors">
                                                    {getMethodIcon(inv.paymentMethod)}
                                                </div>
                                                {inv.paymentMethod === 'online' ? 'UPI' : (inv.paymentMethod || 'Cash').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-text tracking-tighter text-base">₹{Number(inv.total || inv.totalAmount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                                {(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedInvoice(inv)} className="p-2 border border-border bg-surface hover:bg-primary hover:border-primary hover:text-white transition-all group/btn active:scale-95 shadow-sm" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDownloadDirectPDF(inv)} 
                                                    className="p-2 border border-border bg-surface hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all group/btn active:scale-95 shadow-sm flex items-center gap-2"
                                                    title="Download PDF"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-black uppercase">PDF</span>
                                                </button>
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
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-surface-alt/30">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Total Invoices: {filtered.length}</p>
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
                    <div className="bg-surface rounded-none w-full max-w-lg p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border border-border overflow-hidden">
                        <div className="flex items-center justify-between p-5 bg-surface-alt border-b border-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-10 -mt-10 rotate-45 pointer-events-none" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">Invoice Protocol</p>
                                <h2 className="text-xl font-black text-text uppercase tracking-tighter">{selectedInvoice.invoiceNumber}</h2>
                                <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {formatDate(selectedInvoice.createdAt)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2.5 bg-surface border border-border hover:bg-background transition-all group active:scale-90 relative z-10 shadow-sm">
                                <X className="w-5 h-5 text-text-muted group-hover:text-text" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-thin bg-background">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Customer</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.customerId?.name || 'Guest'}</p>
                                </div>
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Outlet</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.outletId?.name || 'Main Outlet'}</p>
                                </div>
                                <div className="bg-surface-alt/50 border border-border p-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Staff</p>
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{selectedInvoice.staffId?.name || 'System'}</p>
                                </div>
                            </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-border flex-1" />
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Session Ledger</p>
                                        <div className="h-px bg-border flex-1" />
                                    </div>
                                    <div className="space-y-2">
                                        {selectedInvoice.items?.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-surface border border-border/50 group hover:border-primary/30 transition-all cursor-default">
                                                <div>
                                                    <p className="font-black text-text uppercase text-[11px] tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.1em] mt-0.5 italic">Qty: {item.quantity} • {item.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-black text-text text-sm tracking-tighter">Rs.{(item.total ?? (item.price * item.quantity) ?? 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            <div className="bg-surface-alt/30 border border-border p-4 space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>Rs.{(selectedInvoice.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                                    <span>Tax (GST)</span>
                                    <span>+Rs.{selectedInvoice.tax?.toLocaleString()}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                        <span>Discount</span>
                                        <span>-Rs.{selectedInvoice.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-border pt-3 mt-1 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Final Amount</p>
                                        <p className="text-xl font-black text-text tracking-tighter uppercase whitespace-nowrap">Rs.{selectedInvoice.total?.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-background border border-border p-2.5 shadow-sm group/sig">
                                        <div className={`p-1.5 border border-border group-hover/sig:border-primary/40 transition-colors ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-500 bg-emerald-500/5' : 'text-orange-500 bg-orange-500/5'}`}>
                                            {getMethodIcon(selectedInvoice.paymentMethod)}
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[8px] font-black uppercase tracking-widest ${selectedInvoice.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>{selectedInvoice.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
                                            <p className="text-[10px] font-black text-text uppercase tracking-tight">{selectedInvoice.paymentMethod === 'online' ? 'UPI' : selectedInvoice.paymentMethod?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border flex gap-3">
                            <button
                                disabled={isGeneratingPDF}
                                onClick={handleDownloadPDF}
                                className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
                            >
                                {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                            </button>
                            <button onClick={() => setSelectedInvoice(null)} className="px-6 py-3 border border-border bg-surface text-text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:text-text hover:bg-surface-alt transition-all active:scale-95">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
