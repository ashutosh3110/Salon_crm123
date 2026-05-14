import { useState, useMemo, useEffect } from 'react';
import {
    Search, Calendar, Eye, X, Download,
    Clock, CreditCard, Banknote, Smartphone, Ban,
    ChevronLeft, ChevronRight, FileText, Loader2, Store, ChevronDown, Printer,
    Mail, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
        padding: 12, 
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
        fontSize: 14, 
        fontWeight: 700, 
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    salonMeta: { 
        fontSize: 8, 
        color: '#000',
        marginBottom: 1,
        fontWeight: 400
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'dashed',
        marginVertical: 6,
        width: '100%'
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        fontSize: 8
    },
    label: { 
        fontWeight: 400,
        textTransform: 'none',
        width: 80
    },
    value: { 
        flex: 1,
        textAlign: 'right',
        fontWeight: 700
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginVertical: 2
    },
    tableHeader: { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#000', 
        paddingBottom: 2, 
        marginBottom: 4,
        fontWeight: 700,
        fontSize: 8
    },
    tableRow: { 
        flexDirection: 'column',
        marginBottom: 5
    },
    itemMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    itemSubRow: {
        fontSize: 7,
        color: '#444',
        marginTop: 1,
        marginLeft: 12
    },
    colDesc: { flex: 2 },
    colPrice: { flex: 1, textAlign: 'right' },
    summaryRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 2,
        fontSize: 9
    },
    grandTotal: { 
        fontSize: 11, 
        fontWeight: 700, 
        borderTopWidth: 1, 
        borderTopColor: '#000', 
        borderTopStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingVertical: 4, 
        marginVertical: 4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    footer: { 
        marginTop: 10, 
        textAlign: 'center', 
        fontSize: 8,
        color: '#000',
        fontWeight: 700
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        marginBottom: 1
    }
});


const POSReceiptPDF = ({ invoice, salon }) => {
    const createdAt = new Date(invoice.createdAt);
    const dateStr = createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timeStr = createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Payment breakdown
    const cashPaid = invoice.payments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0;
    const onlinePaid = invoice.payments?.filter(p => ['online', 'card', 'upi'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0) || 0;

    return (
        <Document>
            <Page size={[226, 800]} style={pdfStyles.page}>
                <View style={pdfStyles.centered}>
                    <Text style={pdfStyles.salonName}>{salon?.name || salon?.businessName || '-'}</Text>
                    <Text style={pdfStyles.salonMeta}>{invoice.outletId?.name || '-'}</Text>
                    <Text style={pdfStyles.salonMeta}>Contact : {salon?.phone || '-'}</Text>
                </View>

                <View style={pdfStyles.divider} />

                <View style={pdfStyles.metaRow}>
                    <Text style={pdfStyles.label}>Invoice No :</Text>
                    <Text style={pdfStyles.value}>{invoice.invoiceNumber || '-'}</Text>
                </View>
                <View style={pdfStyles.metaRow}>
                    <Text style={pdfStyles.label}>Date :</Text>
                    <Text style={pdfStyles.value}>{dateStr}</Text>
                </View>
                <View style={pdfStyles.metaRow}>
                    <Text style={pdfStyles.label}>Time :</Text>
                    <Text style={pdfStyles.value}>{timeStr}</Text>
                </View>

                <View style={{ marginTop: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 8 }}>Customer : {invoice.customerId?.name || 'Walk-in'}</Text>
                </View>

                <View style={pdfStyles.divider} />
                <Text style={pdfStyles.sectionTitle}>SERVICES</Text>
                <View style={pdfStyles.divider} />

                {invoice.items?.map((item, i) => (
                    <View key={i} style={pdfStyles.tableRow}>
                        <View style={pdfStyles.itemMainRow}>
                            <Text style={pdfStyles.colDesc}>{i + 1}. {item.name || '-'}</Text>
                            <Text style={pdfStyles.colPrice}>₹{(item.total || 0).toFixed(0)}</Text>
                        </View>
                        {item.stylistIds?.length > 0 && (
                            <View style={pdfStyles.itemSubRow}>
                                <Text>Staff : {item.stylistIds.map(s => s.name || '-').join(', ')}</Text>
                            </View>
                        )}
                        {!item.stylistIds?.length && (
                            <View style={pdfStyles.itemSubRow}>
                                <Text>Staff : -</Text>
                            </View>
                        )}
                    </View>
                ))}

                <View style={pdfStyles.divider} />

                <View style={pdfStyles.summaryRow}>
                    <Text>Subtotal</Text>
                    <Text>₹{(invoice.subtotal || 0).toFixed(0)}</Text>
                </View>
                
                {invoice.tax > 0 && (
                    <View style={pdfStyles.summaryRow}>
                        <Text>GST (18%)</Text>
                        <Text>₹{(invoice.tax || 0).toFixed(0)}</Text>
                    </View>
                )}

                {invoice.loyaltyPointsRedeemed > 0 && (
                    <View style={pdfStyles.summaryRow}>
                        <Text>Membership Discount</Text>
                        <Text>-₹{(invoice.loyaltyPointsRedeemed || 0).toFixed(0)}</Text>
                    </View>
                )}

                {(invoice.discount - (invoice.loyaltyPointsRedeemed || 0)) > 0 && (
                    <View style={pdfStyles.summaryRow}>
                        <Text>Extra Discount</Text>
                        <Text>-₹{(invoice.discount - (invoice.loyaltyPointsRedeemed || 0)).toFixed(0)}</Text>
                    </View>
                )}

                <View style={pdfStyles.divider} />
                <View style={pdfStyles.grandTotal}>
                    <Text>TOTAL</Text>
                    <Text>₹{(invoice.total || 0).toFixed(0)}</Text>
                </View>
                <View style={pdfStyles.divider} />

                <View style={{ marginTop: 4 }}>
                    <Text style={pdfStyles.sectionTitle}>PAYMENT DETAILS</Text>
                    <View style={pdfStyles.divider} />
                    
                    <View style={pdfStyles.paymentRow}>
                        <Text>Cash Paid</Text>
                        <Text>₹{cashPaid.toFixed(0)}</Text>
                    </View>
                    <View style={pdfStyles.paymentRow}>
                        <Text>Online Paid</Text>
                        <Text>₹{onlinePaid.toFixed(0)}</Text>
                    </View>
                    <View style={pdfStyles.paymentRow}>
                        <Text>Due Amount</Text>
                        <Text>₹{(invoice.dueAmount || 0).toFixed(0)}</Text>
                    </View>

                    <View style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 8 }}>Payment Mode : {invoice.paymentMethod?.toUpperCase() || '-'}</Text>
                    </View>
                </View>

                <View style={pdfStyles.divider} />
                <View style={pdfStyles.footer}>
                    <Text>Thank You Visit Again 🙂</Text>
                </View>
                <View style={pdfStyles.divider} />
            </Page>
        </Document>
    );
};


const StandardInvoicePDF = ({ invoice, salon }) => {
    const createdAt = new Date(invoice.createdAt);
    const dateStr = createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    
    // Payment breakdown
    const cashPaid = invoice.payments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0;
    const onlinePaid = invoice.payments?.filter(p => ['online', 'card', 'upi'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0) || 0;

    const maskPhone = (phone) => {
        if (!phone) return '-';
        return phone.replace(/(\d{2})(\d{6})(\d{2})/, '$1XXXXXX$3');
    };

    return (
        <Document>
            <Page size="A4" style={{ padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1a1a1a' }}>
                {/* Header */}
                <View style={{ borderBottom: 2, borderColor: '#C8956C', paddingBottom: 15, marginBottom: 20 }}>
                    <Text style={{ fontSize: 28, fontWeight: 700, color: '#C8956C', textAlign: 'center', letterSpacing: 2 }}>TAX INVOICE</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                    <View style={{ width: '60%' }}>
                        <Text style={{ fontSize: 14, fontWeight: 700, color: '#C8956C', marginBottom: 5 }}>{salon?.name || salon?.businessName}</Text>
                        <Text style={{ color: '#666', marginBottom: 2 }}>{invoice.outletId?.name || '-'}</Text>
                        <Text style={{ color: '#666', marginBottom: 2 }}>{typeof salon?.address === 'object' ? `${salon.address.street || ''}, ${salon.address.city || ''}` : (salon?.address || '-')}</Text>
                        <Text style={{ color: '#666' }}>Contact Number: {salon?.phone || '-'}</Text>
                        <Text style={{ color: '#666', marginTop: 2 }}>GSTIN: {salon?.gstin || 'N/A'}</Text>
                    </View>
                    <View style={{ width: '35%', textAlign: 'right' }}>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontSize: 8, color: '#999', textTransform: 'uppercase' }}>Invoice Number</Text>
                            <Text style={{ fontWeight: 700 }}>{invoice.invoiceNumber || '-'}</Text>
                        </View>
                        <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontSize: 8, color: '#999', textTransform: 'uppercase' }}>Invoice Date</Text>
                            <Text style={{ fontWeight: 700 }}>{dateStr}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 8, color: '#999', textTransform: 'uppercase' }}>Service Date</Text>
                            <Text style={{ fontWeight: 700 }}>{dateStr}</Text>
                        </View>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={{ backgroundColor: '#f9f9f9', padding: 15, marginBottom: 30, borderLeft: 4, borderColor: '#C8956C' }}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Customer Details</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, color: '#999', marginBottom: 2 }}>Customer Name</Text>
                            <Text style={{ fontWeight: 700 }}>{invoice.customerId?.name || 'Walk-in'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, color: '#999', marginBottom: 2 }}>Mobile Number</Text>
                            <Text style={{ fontWeight: 700 }}>{maskPhone(invoice.customerId?.phone)}</Text>
                        </View>
                    </View>
                </View>

                {/* Service Table */}
                <View style={{ marginBottom: 30 }}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Service Details</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: '#C8956C', padding: 10, color: '#fff', fontWeight: 700 }}>
                        <Text style={{ flex: 2 }}>Service Name</Text>
                        <Text style={{ flex: 1.5 }}>Staff Name</Text>
                        <Text style={{ flex: 1, textAlign: 'right' }}>Amount</Text>
                    </View>
                    {invoice.items?.map((item, i) => (
                        <View key={i} style={{ flexDirection: 'row', padding: 10, borderBottom: 1, borderColor: '#eee', alignItems: 'center' }}>
                            <Text style={{ flex: 2 }}>{item.name}</Text>
                            <Text style={{ flex: 1.5, fontSize: 9 }}>{item.stylistIds?.map(s => s.name).join(', ') || '-'}</Text>
                            <Text style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>₹{(item.total || 0).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Bill Summary & Payment Details */}
                <View style={{ flexDirection: 'row', gap: 40 }}>
                    {/* Bill Summary */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Bill Summary</Text>
                        <View style={{ borderTop: 1, borderColor: '#eee', paddingTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Service Total</Text>
                                <Text>₹{(invoice.subtotal || 0).toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>GST (18%)</Text>
                                <Text>₹{(invoice.tax || 0).toFixed(2)}</Text>
                            </View>
                            {invoice.loyaltyPointsRedeemed > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#10b981' }}>Membership Plan Discount</Text>
                                    <Text style={{ color: '#10b981' }}>-₹{(invoice.loyaltyPointsRedeemed || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {(invoice.discount - (invoice.loyaltyPointsRedeemed || 0)) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#10b981' }}>Additional Discount</Text>
                                    <Text style={{ color: '#10b981' }}>-₹{(invoice.discount - (invoice.loyaltyPointsRedeemed || 0)).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: 2, borderColor: '#C8956C' }}>
                                <Text style={{ fontSize: 14, fontWeight: 700 }}>Grand Total</Text>
                                <Text style={{ fontSize: 14, fontWeight: 700, color: '#C8956C' }}>₹{(invoice.total || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payment Details */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Payment Details</Text>
                        <View style={{ borderTop: 1, borderColor: '#eee', paddingTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Payment Method</Text>
                                <Text style={{ textTransform: 'capitalize' }}>{invoice.paymentMethod || '-'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Cash Paid</Text>
                                <Text>₹{cashPaid.toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Online Paid</Text>
                                <Text>₹{onlinePaid.toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#e11d48', fontWeight: 700 }}>Due Amount</Text>
                                <Text style={{ color: '#e11d48', fontWeight: 700 }}>₹{(invoice.dueAmount || 0).toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                <Text style={{ color: '#666' }}>Payment Status</Text>
                                <Text style={{ color: invoice.paymentStatus === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {invoice.paymentStatus?.replace('_', ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View style={{ marginTop: 50, padding: 15, borderTop: 1, borderColor: '#eee' }}>
                    <Text style={{ fontSize: 9, fontWeight: 700, color: '#666', marginBottom: 5 }}>NOTES</Text>
                    <Text style={{ fontSize: 8, color: '#999', marginBottom: 2 }}>• Goods once sold will not be returned.</Text>
                    <Text style={{ fontSize: 8, color: '#999' }}>• Please keep this invoice for future reference.</Text>
                </View>

                {/* Footer */}
                <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', borderTop: 1, borderColor: '#eee', paddingTop: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: '#C8956C', letterSpacing: 2 }}>Thank You For Visiting Us</Text>
                    <Text style={{ fontSize: 8, color: '#999', marginTop: 10 }}>This is a computer-generated tax invoice and does not require a physical signature.</Text>
                </View>
            </Page>
        </Document>
    );
};

export default function POSInvoicesPage() {
    const { salon, outlets, activeOutletId, setActiveOutletId } = useBusiness();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [page, setPage] = useState(1);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(null);
    const perPage = 5;

    useEffect(() => {
        if (selectedInvoice) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [selectedInvoice]);


    useEffect(() => {
        const loadInvoices = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/pos/invoices?outletId=${activeOutletId || ''}`);
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
    }, [activeOutletId]);

    const handleDownloadPDF = async (type = 'pos') => {
        if (!selectedInvoice) return;
        setIsGeneratingPDF(type);
        try {
            const PDFComponent = type === 'pos' ? POSReceiptPDF : StandardInvoicePDF;
            const blob = await pdf(<PDFComponent invoice={selectedInvoice} salon={salon} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const suffix = type === 'pos' ? 'Receipt' : 'Invoice';
            link.download = `${selectedInvoice.invoiceNumber}_${selectedInvoice.customerId?.name || 'Customer'}_${suffix}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(null);
        }
    };

    const handleDownloadDirectPDF = async (inv, type = 'pos') => {
        setIsGeneratingPDF(`${inv._id}_${type}`);
        try {
            const PDFComponent = type === 'pos' ? POSReceiptPDF : StandardInvoicePDF;
            const blob = await pdf(<PDFComponent invoice={inv} salon={salon} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const suffix = type === 'pos' ? 'Receipt' : 'Invoice';
            link.download = `${inv.invoiceNumber}_${inv.customerId?.name || 'Customer'}_${suffix}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(null);
        }
    };

    const sendWhatsAppBill = async (inv) => {
        const phone = inv.customerId?.phone;
        if (!phone) return toast.error('Customer phone not found');
        
        setIsSendingWhatsApp(inv._id);
        try {
            // 1. Generate PDF blob (using POS receipt for WhatsApp)
            const blob = await pdf(<POSReceiptPDF invoice={inv} salon={salon} />).toBlob();
            
            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append('pdf', blob, `Invoice_${inv.invoiceNumber}.pdf`);
            
            // 3. Call API
            const response = await api.post(`/pos/invoices/${inv._id}/send-whatsapp`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                toast.success('Invoice sent on WhatsApp!');
            } else {
                toast.error(response.data.message || 'Failed to send WhatsApp');
            }
        } catch (error) {
            console.error('WhatsApp Error:', error);
            toast.error(error.response?.data?.message || 'Error sending WhatsApp invoice');
        } finally {
            setIsSendingWhatsApp(null);
        }
    };

    const sendEmailBill = (inv) => {
        const email = inv.customerId?.email;
        if (!email) return toast.error('Customer email not found');
        const subject = encodeURIComponent(`Invoice ${inv.invoiceNumber} from ${salon?.name || 'Salon'}`);
        const body = encodeURIComponent(`Hello ${inv.customerId?.name || 'Customer'},\n\nPlease find your invoice details below:\nInvoice No: ${inv.invoiceNumber}\nTotal: ₹${inv.total}\n\nThank you!`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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

            let matchType = true;
            if (typeFilter === 'service') {
                matchType = inv.items?.some(i => i.type === 'service');
            } else if (typeFilter === 'product') {
                matchType = inv.items?.some(i => i.type === 'product');
            }

            return matchSearch && matchDate && matchType;
        });
    }, [invoices, search, dateFilter, typeFilter]);

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
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Store className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <select
                            value={activeOutletId || ''}
                            onChange={(e) => setActiveOutletId(e.target.value)}
                            className="pl-9 pr-8 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer appearance-none min-w-[180px]"
                        >
                            <option value="">All Outlets</option>
                            {(outlets || []).map(o => (
                                <option key={o._id} value={o._id}>{o.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                        </div>
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

                    <div className="flex bg-surface p-1 border border-border shadow-sm">
                        <button
                            onClick={() => { setTypeFilter('all'); setPage(1); }}
                            className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${typeFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                        >
                            <FileText className="w-4 h-4" /> All Invoices
                        </button>
                        <button
                            onClick={() => { setTypeFilter('service'); setPage(1); }}
                            className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${typeFilter === 'service' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                        >
                            <Smartphone className="w-4 h-4" /> Services
                        </button>
                        <button
                            onClick={() => { setTypeFilter('product'); setPage(1); }}
                            className={`inline-flex items-center gap-3 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all ${typeFilter === 'product' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-surface-alt'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Products
                        </button>
                    </div>
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
                    <div className="bg-background flex-1 overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-3 py-4 w-[12%]">Invoice</th>
                                    <th className="px-3 py-4 w-[15%]">Date & Time</th>
                                    <th className="px-3 py-4 w-[15%]">Customer</th>
                                    <th className="px-3 py-4 w-[12%]">Outlet</th>
                                    <th className="px-3 py-4 w-[12%]">Payment</th>
                                    <th className="px-3 py-4 w-[12%] text-right">Amount</th>
                                    <th className="px-3 py-4 w-[8%] text-center">Status</th>
                                    <th className="px-3 py-4 w-[14%] text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {paginated.map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors group">
                                        <td className="px-3 py-4 font-black text-primary uppercase tracking-tighter truncate" title={inv.invoiceNumber}>{inv.invoiceNumber}</td>
                                        <td className="px-3 py-4 text-text-muted text-[10px] font-bold uppercase tracking-tight truncate">
                                            {formatDate(inv.createdAt)}
                                        </td>
                                        <td className="px-3 py-4 truncate">
                                            <div className="font-black text-text text-[10px] uppercase tracking-tight truncate" title={inv.customerId?.name || 'Guest'}>
                                                {inv.customerId?.name || 'Guest'}
                                            </div>
                                            {inv.customerId?.phone && (
                                                <div className="text-[9px] font-bold text-text-muted mt-0.5 tracking-tight">
                                                    {inv.customerId.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 text-text-muted text-[9px] font-black uppercase tracking-widest truncate">{inv.outletId?.name || '-'}</td>
                                        <td className="px-3 py-4">
                                            <span className="flex items-center gap-1.5 font-black text-text text-[9px] uppercase tracking-widest">
                                                {inv.paymentMethod === 'online' ? 'UPI' : (inv.paymentMethod || 'Cash').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-right font-black text-text tracking-tighter text-sm">₹{Number(inv.total || 0).toLocaleString()}</td>
                                        <td className="px-3 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                                {(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'Paid' : 'Pend'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 border border-border bg-surface hover:bg-primary hover:text-white transition-all shadow-sm" title="View">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleDownloadDirectPDF(inv, 'pos')} 
                                                    disabled={isGeneratingPDF === `${inv._id}_pos`}
                                                    className="p-1.5 border border-border bg-surface hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                    title="POS"
                                                >
                                                    {isGeneratingPDF === `${inv._id}_pos` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                                                </button>

                                                <button 
                                                    onClick={() => handleDownloadDirectPDF(inv, 'standard')} 
                                                    disabled={isGeneratingPDF === `${inv._id}_standard`}
                                                    className="p-1.5 border border-border bg-surface hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                    title="Bill"
                                                >
                                                    {isGeneratingPDF === `${inv._id}_standard` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                                                </button>

                                                <button 
                                                    onClick={() => sendWhatsAppBill(inv)} 
                                                    disabled={isSendingWhatsApp === inv._id}
                                                    className="p-1.5 border border-border bg-surface hover:bg-emerald-600 hover:text-white transition-all shadow-sm text-emerald-600 hover:text-white disabled:opacity-50"
                                                    title="WhatsApp"
                                                >
                                                    {isSendingWhatsApp === inv._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                                </button>

                                                <button 
                                                    onClick={() => sendEmailBill(inv)} 
                                                    className="p-1.5 border border-border bg-surface hover:bg-purple-500 hover:text-white transition-all shadow-sm text-purple-500 hover:text-white"
                                                    title="Email"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
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
                                <div className="flex justify-between text-[10px] font-black text-text uppercase tracking-widest">
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

                        <div className="p-6 bg-surface-alt border-t border-border flex flex-col sm:flex-row gap-3">
                            <button
                                disabled={!!isGeneratingPDF}
                                onClick={() => handleDownloadPDF('pos')}
                                className="flex-1 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-emerald-600/20 active:scale-95"
                            >
                                {isGeneratingPDF === 'pos' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                {isGeneratingPDF === 'pos' ? 'Generating...' : 'POS Receipt'}
                            </button>
                            <button
                                disabled={!!isGeneratingPDF}
                                onClick={() => handleDownloadPDF('standard')}
                                className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
                            >
                                {isGeneratingPDF === 'standard' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                {isGeneratingPDF === 'standard' ? 'Generating...' : 'A4 Invoice'}
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
