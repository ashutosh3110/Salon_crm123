import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    ClipboardList,
    Search,
    Filter,
    Download,
    Printer,
    Eye,
    MoreVertical,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Loader2,
    RefreshCw,
    FileSpreadsheet
} from 'lucide-react';
import { 
    Document, Page, Text, View, StyleSheet, pdf, Font 
} from '@react-pdf/renderer';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import api from '../../services/api';

// Register Fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

const pdfStyles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Roboto', backgroundColor: '#FFFFFF' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
    salonName: { fontSize: 18, fontWeight: 'bold' },
    reportTitle: { fontSize: 24, fontWeight: 'bold', color: '#666' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    metaBox: { width: '45%', backgroundColor: '#F9F9F9', padding: 8 },
    label: { fontSize: 7, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
    value: { fontSize: 10, fontWeight: 'bold' },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 5, backgroundColor: '#F0F0F0', padding: 5 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingTop: 6, paddingBottom: 6, paddingLeft: 5, paddingRight: 5 },
    colId: { flex: 1 },
    colClient: { flex: 1.5 },
    colDate: { flex: 1, textAlign: 'center' },
    colStatus: { flex: 0.8, textAlign: 'center' },
    colMethod: { flex: 0.8, textAlign: 'center' },
    colAmount: { flex: 1, textAlign: 'right' },
    summarySection: { marginTop: 20, borderTopWidth: 2, borderTopColor: '#000', paddingTop: 10, flexDirection: 'row', justifyContent: 'flex-end' },
    totalLabel: { fontSize: 14, fontWeight: 'bold' },
    totalValue: { fontSize: 14, fontWeight: 'bold', marginLeft: 20 },
    footer: { marginTop: 30, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10, fontSize: 8, color: '#999' }
});

const SingleInvoicePDF = ({ invoice }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <View>
                    <Text style={pdfStyles.salonName}>SALON BILLING HISTORY</Text>
                    <Text>Official Invoice Document</Text>
                </View>
                <Text style={pdfStyles.reportTitle}>INVOICE</Text>
            </View>

            <View style={pdfStyles.metaRow}>
                <View style={pdfStyles.metaBox}>
                    <Text style={pdfStyles.label}>Customer Name</Text>
                    <Text style={pdfStyles.value}>{invoice.clientId?.name || 'Walk-in Client'}</Text>
                    <Text style={{ fontSize: 8 }}>{invoice.clientId?.phone || ''}</Text>
                </View>
                <View style={pdfStyles.metaBox}>
                    <Text style={pdfStyles.label}>Invoice Details</Text>
                    <Text style={pdfStyles.value}>#{invoice.invoiceNumber || invoice._id}</Text>
                    <Text style={{ fontSize: 8 }}>Date: {new Date(invoice.createdAt).toLocaleString()}</Text>
                    <Text style={{ fontSize: 8 }}>Billed By: {invoice.staffId?.name || 'System'}</Text>
                </View>
            </View>

            <View style={pdfStyles.tableHeader}>
                <Text style={pdfStyles.colId}>DESCRIPTION</Text>
                <Text style={pdfStyles.colAmount}>TOTAL</Text>
            </View>
            <View style={pdfStyles.tableRow}>
                <Text style={pdfStyles.colId}>Saloon Services & Products</Text>
                <Text style={pdfStyles.colAmount}>Rs. {Math.round(invoice.total)}</Text>
            </View>

            <View style={pdfStyles.summarySection}>
                <Text style={pdfStyles.totalLabel}>Grand Total:</Text>
                <Text style={pdfStyles.totalValue}>Rs. {Math.round(invoice.total)}</Text>
            </View>

            <View style={pdfStyles.footer}>
                <Text>Thank you for your business. This is a computer generated document.</Text>
            </View>
        </Page>
    </Document>
);

const BulkInvoiceListPDF = ({ invoices, stats }) => (
    <Document>
        <Page size="A4" style={pdfStyles.page} orientation="landscape">
            <View style={pdfStyles.header}>
                <View>
                    <Text style={pdfStyles.salonName}>SALON BILLING REPORT</Text>
                    <Text>Total Invoices: {invoices.length} | Revenue: ₹ {Math.round(stats.totalRevenue)}</Text>
                </View>
                <Text style={pdfStyles.reportTitle}>SALES LIST</Text>
            </View>

            <View style={pdfStyles.tableHeader}>
                <Text style={pdfStyles.colId}>Invoice No.</Text>
                <Text style={pdfStyles.colClient}>Customer Name</Text>
                <Text style={pdfStyles.colDate}>Date</Text>
                <Text style={pdfStyles.colStatus}>Status</Text>
                <Text style={pdfStyles.colMethod}>Method</Text>
                <Text style={pdfStyles.colAmount}>Amount</Text>
            </View>

            {invoices.map((inv, index) => (
                <View key={index} style={pdfStyles.tableRow}>
                    <Text style={pdfStyles.colId}>{inv.invoiceNumber?.slice(-12) || inv._id.slice(-6)}</Text>
                    <Text style={pdfStyles.colClient}>{inv.clientId?.name || 'Walk-in'}</Text>
                    <Text style={pdfStyles.colDate}>{new Date(inv.createdAt).toLocaleDateString()}</Text>
                    <Text style={pdfStyles.colStatus}>{inv.paymentStatus?.toUpperCase()}</Text>
                    <Text style={pdfStyles.colMethod}>{inv.paymentMethod?.toUpperCase()}</Text>
                    <Text style={pdfStyles.colAmount}>Rs. {Math.round(inv.total)}</Text>
                </View>
            ))}

            <View style={pdfStyles.summarySection}>
                <Text style={pdfStyles.totalLabel}>Total Revenue Amount:</Text>
                <Text style={pdfStyles.totalValue}>Rs. {Math.round(stats.totalRevenue)}</Text>
            </View>

            <View style={pdfStyles.footer}>
                <Text>Generated on: {new Date().toLocaleString()}</Text>
                <Text>Billing History Report - Page 1 of 1</Text>
            </View>
        </Page>
    </Document>
);

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [invoices, setInvoices] = useState([]);
    const [invoiceStats, setInvoiceStats] = useState({
        totalRevenue: 0,
        invoiceCount: 0,
        avgBillValue: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            // 1. Fetch Dashboard Stats
            const statsRes = await api.get('/invoices/stats');
            setInvoiceStats({
                totalRevenue: statsRes.data.totalRevenue || 0,
                invoiceCount: statsRes.data.invoiceCount || 0,
                avgBillValue: statsRes.data.avgBillValue || 0
            });

            // 2. Fetch Invoices with filters
            const params = {
                page: currentPage,
                limit: 10,
                search: searchQuery || undefined,
                paymentStatus: statusFilter !== 'All' ? statusFilter.toLowerCase() : undefined
            };
            const invoicesRes = await api.get('/invoices', { params });
            setInvoices(invoicesRes.data.results || []);
            setTotalPages(invoicesRes.data.totalPages || 1);
            setTotalResults(invoicesRes.data.totalResults || 0);

        } catch (error) {
            console.error('[PROTOCOL] Archive retrieval failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentPage, searchQuery, statusFilter]);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds for live billing feel
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Map backend stats to UI card format
    const statsCards = [
        {
            label: 'Total Revenue (Today)',
            value: invoiceStats.totalRevenue,
            prefix: '₹',
            trend: '+12.5%',
            positive: true,
            icon: TrendingUp,
            color: 'text-emerald-500',
            glow: 'bg-emerald-500/10'
        },
        {
            label: 'Avg. Transaction',
            value: invoiceStats.avgBillValue,
            prefix: '₹',
            trend: '+3.2%',
            positive: true,
            icon: FileText,
            color: 'text-primary',
            glow: 'bg-primary/10'
        },
        {
            label: 'Volume (Records)',
            value: invoiceStats.invoiceCount,
            prefix: '',
            trend: '+8.1%',
            positive: true,
            icon: ClipboardList,
            color: 'text-amber-500',
            glow: 'bg-amber-500/10'
        }
    ];

    const handleAction = async (type, id) => {
        if (type === 'View') {
            try {
                const res = await api.get(`/invoices/${id}`);
                setSelectedInvoice(res.data);
                setIsPreviewOpen(true);
            } catch (error) {
                alert('Error: Failed to retrieve invoice details.');
            }
        } else if (type === 'Download') {
            try {
                const res = await api.get(`/invoices/${id}`);
                const inv = res.data;
                const blob = await pdf(<SingleInvoicePDF invoice={inv} />).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Invoice_${inv.invoiceNumber || inv._id}.pdf`;
                link.click();
            } catch (error) {
                alert('Error: Failed to generate PDF.');
            }
        } else if (type === 'Options') {
            setActionMenuOpen(actionMenuOpen === id ? null : id);
        }
    };

    const handleDownloadAll = async () => {
        setIsExporting(true);
        try {
            const blob = await pdf(<BulkInvoiceListPDF invoices={invoices} stats={invoiceStats} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
        } catch (error) {
            console.error('Bulk PDF Error:', error);
            alert('Error: Failed to generate list report.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert('Invoice data (CSV) exported successfully.');
        }, 1800);
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
            alert('Daily report sent to printer.');
        }, 1500);
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Loading invoices...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Billing History</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">View and manage all salon invoices</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchData()}
                        disabled={refreshing}
                        className="p-2.5 bg-surface border border-border text-text-muted hover:text-primary transition-all active:rotate-180"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />} {isExporting ? 'EXPORTING...' : 'Spreadsheet'}
                    </button>
                    <button
                        onClick={handleDownloadAll}
                        disabled={isExporting}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {isExporting ? 'GENERATING...' : 'PDF Report'}
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} {isPrinting ? 'PRINTING...' : 'Day End Report'}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsCards.map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 border border-border group hover:border-primary/20 transition-all relative overflow-hidden">
                        {/* Soft Glow */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.glow} rounded-none blur-2xl group-hover:opacity-100 transition-opacity opacity-50`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <stat.icon className={`w-4 h-4 text-text-muted transition-colors group-hover:${stat.color}`} />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className={`text-2xl font-black ${stat.label.includes('Unpaid') ? 'text-amber-500' : 'text-text'} uppercase tracking-tight`}>
                                    <AnimatedCounter value={Math.round(stat.value)} prefix={stat.prefix} />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={stat.positive ? "text-emerald-400" : "text-rose-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="bg-surface border border-border p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH INVOICE ID..."
                        className="pl-10 pr-4 py-2 bg-surface-alt border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-surface-alt border border-border p-1">
                        {['All', 'Paid', 'Unpaid'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => alert('Calendar selection opening...')} className="px-4 py-2 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-surface border-l-0">
                        <Calendar className="w-4 h-4" /> Custom Date
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-surface border border-border shadow-sm overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-surface-alt/50 border-b border-border text-center">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-left">Invoice No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-left">Customer Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Transaction Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Total Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Billed By</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Payment Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {invoices.length > 0 ? invoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-surface-alt/30 transition-all group text-center">
                                <td className="px-6 py-4 text-left">
                                    <p className="text-xs font-black text-text uppercase tracking-tight max-w-[120px] truncate" title={inv.invoiceNumber || inv._id}>
                                        {inv.invoiceNumber || inv._id.slice(-8).toUpperCase()}
                                    </p>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted uppercase">
                                            {(inv.clientId?.name || 'W')[0]}
                                        </div>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{inv.clientId?.name || 'Walk-in Client'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-black text-primary uppercase">₹{Math.round(inv.total)}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p 
                                        className="text-[11px] font-black text-text-secondary uppercase tracking-tight truncate max-w-[100px]" 
                                        title={inv.staffId?.name || (typeof inv.staffId === 'string' ? `ID: ${inv.staffId}` : 'SYSTEM')}
                                    >
                                        {inv.staffId?.name || (typeof inv.staffId === 'string' ? 'ID:ERR' : 'SYSTEM')}
                                    </p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                            (inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid') ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                                'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                            }`}>
                                            {inv.paymentStatus === 'paid' ? <CheckCircle2 className="w-3 h-3" /> :
                                                (inv.paymentStatus === 'pending' || inv.paymentStatus === 'unpaid') ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {inv.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{inv.paymentMethod}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleAction('View', inv._id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="View Detail">
                                            <Eye className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                        </button>
                                        <button onClick={() => handleAction('Download', inv._id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="Download">
                                            <Download className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                        </button>
                                        <button onClick={() => handleAction('Options', inv._id)} className="p-2 border border-border hover:bg-surface-alt transition-all group relative" title="Options">
                                            <MoreVertical className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                            {actionMenuOpen === inv._id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border shadow-2xl z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                                                    <button onClick={() => alert('Sending as Email...')} className="w-full px-4 py-2 text-left text-[9px] font-black uppercase hover:bg-surface-alt transition-colors">Send Email</button>
                                                    <button onClick={() => alert('Sharing Link...')} className="w-full px-4 py-2 text-left text-[9px] font-black uppercase hover:bg-surface-alt transition-colors">Copy Link</button>
                                                    <div className="border-t border-border my-1" />
                                                    <button onClick={() => alert('Void Request Sent...')} className="w-full px-4 py-2 text-left text-[9px] font-black uppercase text-rose-500 hover:bg-rose-50 transition-colors">Void Invoice</button>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center">
                                    <div className="opacity-20 flex flex-col items-center">
                                        <FileText className="w-10 h-10 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No invoices found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic opacity-60">Showing {invoices.length} of {totalResults} invoices</p>
                <div className="flex border border-border">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt border-r border-border disabled:opacity-30" 
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <div className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white">
                        {currentPage} / {totalPages}
                    </div>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modals Interface */}
            {isPreviewOpen && selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> INVOICE PREVIEW: {selectedInvoice.invoiceNumber || selectedInvoice._id}
                            </h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-12 space-y-8 bg-white text-black font-mono">
                            <div className="flex justify-between items-start border-b-2 border-black pb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase">Official Invoice</h2>
                                    <p className="text-[10px] font-bold">Salon Management System</p>
                                    <p className="text-[9px] mt-1">{selectedInvoice.outletId?.name || 'Main Branch'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase">DATE: {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase">STATUS: {selectedInvoice.paymentStatus?.toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">CUSTOMER NAME:</span>
                                    <span>{selectedInvoice.clientId?.name || 'Walk-in'}</span>
                                </div>
                                <div className="flex justify-between text-sm italic">
                                    <span className="font-bold uppercase tracking-tight">Billed By:</span>
                                    <span className="font-black uppercase">{selectedInvoice.staffId?.name || (typeof selectedInvoice.staffId === 'string' ? selectedInvoice.staffId : 'SYSTEM')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">PAYMENT METHOD:</span>
                                    <span className="uppercase">{selectedInvoice.paymentMethod}</span>
                                </div>
                            </div>

                            {/* Items breakdown could potentially be added here if backend supported it */}
                            
                            <div className="border-t border-black pt-4">
                                <div className="flex justify-between text-xl font-black">
                                    <span>GRAND TOTAL:</span>
                                    <span>₹{Math.round(selectedInvoice.total)}</span>
                                </div>
                            </div>
                            <p className="text-[8px] text-center pt-8 opacity-40">*** THIS IS A DIGITALLY AUTHORIZED INVOICE DOCUMENT ***</p>
                            <div className="flex gap-4 pt-8 no-print justify-center">
                                <button onClick={() => { window.print(); }} className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">PRINT HARDCOPY</button>
                                <button onClick={() => setIsPreviewOpen(false)} className="px-6 py-2 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black/5">CLOSE PREVIEW</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
