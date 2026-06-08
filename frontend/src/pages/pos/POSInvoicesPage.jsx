import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Calendar, Eye, X, Download,
    Clock, CreditCard, Banknote, Smartphone, Ban,
    ChevronLeft, ChevronRight, FileText, Loader2, Store, ChevronDown, Printer,
    Mail, MessageSquare, MessageCircle, Send, Filter, RefreshCw, MapPin, Box, PlusCircle,
    Edit, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import {
    Document, Page, Text, View, StyleSheet, pdf, Font
} from '@react-pdf/renderer';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';

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


export const POSReceiptPDF = ({ invoice, salon }) => {
    const createdAt = new Date(invoice.createdAt);

    const dateStr = createdAt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const timeStr = createdAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Payment breakdown
    const walletPaid = invoice.walletRedeemed || 0;
    const cashPaid = invoice.payments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0;
    const onlinePaid = invoice.payments?.filter(p => ['online', 'card', 'upi'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0) || 0;

    // Payment Method String
    const methods = [];
    if (walletPaid > 0) methods.push('Wallet');
    if (cashPaid > 0) methods.push('Cash');
    if (onlinePaid > 0) methods.push('UPI');
    const paymentMethodStr = methods.join(' + ') || (invoice.paymentMethod?.toUpperCase() || 'CASH');

    const formatAddress = (addr) => {
        if (!addr) return '-';
        if (typeof addr === 'string') return addr;
        const parts = [addr.city, addr.state].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <Document>
            <Page size={[226, 800]} style={pdfStyles.page}>
                {/* Header Separator */}
                <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>
                <Text style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, marginVertical: 2, letterSpacing: 1 }}>POS INVOICE</Text>
                <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>

                {/* Business Info */}
                <View style={{ marginTop: 8, gap: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Salon Name</Text>
                        <Text>: {salon?.name || salon?.businessName || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Outlet Name</Text>
                        <Text>: {invoice.outletId?.name || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Address</Text>
                        <Text>: {formatAddress(salon?.address)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Mobile No.</Text>
                        <Text>: {salon?.phone || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>GSTIN</Text>
                        <Text>: {salon?.gstNumber || 'N/A'}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'dashed', paddingTop: 4, gap: 1 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Invoice No</Text>
                        <Text>: {invoice.invoiceNumber || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Invoice Date</Text>
                        <Text>: {dateStr}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Bill Time</Text>
                        <Text>: {timeStr}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: 70 }}>Payment Status</Text>
                        <Text>: {(invoice.paymentStatus || 'Paid').toUpperCase()}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'dashed', paddingTop: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 2 }}>Customer Details</Text>
                    <View style={{ borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'dashed', paddingTop: 2, gap: 1 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 75 }}>Customer Name</Text>
                            <Text>: {invoice.customerId?.name || 'Walk-in'}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 75 }}>Mobile Number</Text>
                            <Text>: {invoice.customerId?.phone || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Services Table */}
                <View style={{ marginTop: 10 }}>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>
                    <View style={{ flexDirection: 'row', fontSize: 7, fontWeight: 700, marginVertical: 2 }}>
                        <Text style={{ width: 15 }}>Sr</Text>
                        <Text style={{ flex: 1.5 }}>Particulars</Text>
                        <Text style={{ width: 45 }}>Staff</Text>
                        <Text style={{ width: 20, textAlign: 'center' }}>Qty</Text>
                        <Text style={{ width: 35, textAlign: 'right' }}>Rate</Text>
                        <Text style={{ width: 40, textAlign: 'right' }}>Amount</Text>
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>

                    {invoice.items?.map((item, i) => {
                        const qty = item.quantity || 1;
                        const price = item.price || 0;
                        const gross = price * qty;
                        
                        let itemDiscountStr = '';
                        if (item.membershipDiscountValue > 0) {
                            if (item.membershipDiscountType === 'percentage') {
                                itemDiscountStr = `Disc: ${item.membershipDiscountValue}% (-Rs.${((gross * item.membershipDiscountValue) / 100).toFixed(2)})`;
                            } else {
                                itemDiscountStr = `Disc: -Rs.${item.membershipDiscountValue.toFixed(2)}`;
                            }
                        }

                        const itemTotal = item.total != null ? item.total : gross;
                        const isInclusive = item.isInclusiveTax !== undefined ? item.isInclusiveTax : invoice.includingGst;
                        const gstRate = item.gstPercent !== undefined ? item.gstPercent : (item.type === 'service' ? (invoice.serviceGstPercent || 5) : (invoice.productGstPercent || 10));
                        const gstAmount = isInclusive 
                            ? (itemTotal - (itemTotal * 100) / (100 + gstRate))
                            : (itemTotal * gstRate) / 100;
                        
                        const cgst = (gstAmount / 2).toFixed(2);
                        const sgst = (gstAmount / 2).toFixed(2);

                        return (
                            <View key={i} style={{ fontSize: 7, marginTop: 4 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Text style={{ width: 15 }}>{i + 1}</Text>
                                    <Text style={{ flex: 1.5 }}>{item.name || '-'}</Text>
                                    <Text style={{ width: 45, fontSize: 6 }}>{item.stylistIds?.map(s => s.name || '-').join(', ') || '-'}</Text>
                                    <Text style={{ width: 20, textAlign: 'center' }}>{qty}</Text>
                                    <Text style={{ width: 35, textAlign: 'right' }}>{price.toFixed(2)}</Text>
                                    <Text style={{ width: 40, textAlign: 'right' }}>{itemTotal.toFixed(2)}</Text>
                                </View>
                                <View style={{ paddingLeft: 15, fontSize: 6, color: '#555', gap: 1, marginTop: 1 }}>
                                    {itemDiscountStr ? <Text style={{ color: '#10b981', fontWeight: 700 }}>- {itemDiscountStr}</Text> : null}
                                    <Text>- GST ({gstRate}%): CGST: {cgst} | SGST: {sgst} | Total: {gstAmount.toFixed(2)}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Financials */}
                <View style={{ marginTop: 10 }}>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>----------------------------------------</Text>
                    <View style={{ gap: 1, marginTop: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                            <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>Taxable Value</Text>
                            <Text style={{ width: 45, textAlign: 'right' }}>: {(invoice.baseAmount || invoice.subtotal || 0).toFixed(2)}</Text>
                        </View>
                        {invoice.cgst > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                                <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>CGST ({(invoice.gstPercent) / 2}%)</Text>
                                <Text style={{ width: 45, textAlign: 'right' }}>: {(invoice.cgst || 0).toFixed(2)}</Text>
                            </View>
                        )}
                        {invoice.sgst > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                                <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>SGST ({(invoice.gstPercent) / 2}%)</Text>
                                <Text style={{ width: 45, textAlign: 'right' }}>: {(invoice.sgst || 0).toFixed(2)}</Text>
                            </View>
                        )}
                        {invoice.igst > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                                <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>IGST ({invoice.gstPercent}%)</Text>
                                <Text style={{ width: 45, textAlign: 'right' }}>: {(invoice.igst || 0).toFixed(2)}</Text>
                            </View>
                        )}
                        {(!invoice.cgst && !invoice.sgst && !invoice.igst && (invoice.tax || 0) > 0) && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                                <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>GST ({invoice.gstPercent}%)</Text>
                                <Text style={{ width: 45, textAlign: 'right' }}>: {(invoice.tax || 0).toFixed(2)}</Text>
                            </View>
                        )}
                        {(invoice.discount || 0) > 0 && (() => {
                            const pct = invoice.subtotal > 0 ? Math.round(((invoice.discount || 0) / invoice.subtotal) * 100) : 0;
                            return (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 8 }}>
                                    <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>
                                        {pct > 0 ? `Discount (${pct}%)` : 'Discount'}
                                    </Text>
                                    <Text style={{ width: 45, textAlign: 'right' }}>: -{(invoice.discount || 0).toFixed(2)}</Text>
                                </View>
                            );
                        })()}
                        {(invoice.membershipDiscount || 0) > 0 && (() => {
                            const pct = invoice.subtotal > 0 ? Math.round(((invoice.membershipDiscount || 0) / invoice.subtotal) * 100) : 0;
                            return (
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', fontSize: 8 }}>
                                    <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>
                                        {pct > 0 ? `Membership Disc (${pct}%)` : 'Membership Disc'}
                                    </Text>
                                    <Text style={{ width: 45, textAlign: 'right' }}>: -{(invoice.membershipDiscount || 0).toFixed(2)}</Text>
                                </View>
                            );
                        })()}
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>----------------------------------------</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', fontWeight: 700, fontSize: 10, marginVertical: 2 }}>
                        <Text style={{ width: 80, textAlign: 'right', paddingRight: 4 }}>Grand Total</Text>
                        <Text style={{ width: 45, textAlign: 'right' }}>: {((invoice.total || 0) + (invoice.previousDueCollected || 0)).toFixed(2)}</Text>
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>
                </View>

                {/* Payment Details */}
                <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 2 }}>Payment Details</Text>
                    <View style={{ gap: 1, marginTop: 2, fontSize: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 100 }}>Wallet Used</Text>
                            <Text>: {walletPaid.toFixed(2)}</Text>
                        </View>
                        {(invoice.previousDueCollected || 0) > 0 && (
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ width: 100 }}>Prev. Due Paid</Text>
                                <Text>: {(invoice.previousDueCollected || 0).toFixed(2)}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 100 }}>Cash Paid</Text>
                            <Text>: {cashPaid.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 100 }}>Online Paid</Text>
                            <Text>: {onlinePaid.toFixed(2)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ width: 100 }}>Due Amount</Text>
                            <Text>: {(invoice.dueAmount || 0).toFixed(2)}</Text>
                        </View>
                        <View style={{ marginTop: 4, flexDirection: 'row' }}>
                            <Text style={{ width: 100 }}>Payment Method</Text>
                            <Text>: {paymentMethodStr}</Text>
                        </View>
                    </View>
                </View>

                {/* Terms & Conditions */}
                <View style={{ marginTop: 10 }}>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>
                    <Text style={{ fontSize: 8, fontWeight: 700, marginVertical: 2 }}>Terms & Conditions</Text>
                    <View style={{ gap: 2, marginTop: 2 }}>
                        {salon?.termsAndConditions?.length > 0 ? (
                            salon.termsAndConditions.map((term, idx) => (
                                <Text key={idx} style={{ fontSize: 7, color: '#444' }}>
                                    {idx + 1}. {term}
                                </Text>
                            ))
                        ) : (
                            <>
                                <Text style={{ fontSize: 7, color: '#444' }}>1. Services once billed cannot be cancelled.</Text>
                                <Text style={{ fontSize: 7, color: '#444' }}>2. Please keep invoice for future reference.</Text>
                                <Text style={{ fontSize: 7, color: '#444' }}>3. Thank you for visiting our salon.</Text>
                            </>
                        )}
                    </View>
                </View>



                {/* Final Footer */}
                <View style={{ marginTop: 15 }}>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>----------------------------------------</Text>
                    <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, marginVertical: 4 }}>THANK YOU â€¢ VISIT AGAIN</Text>
                    <Text style={{ textAlign: 'center', fontSize: 8 }}>========================================</Text>
                </View>
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
                        <Text style={{ color: '#666', marginTop: 2 }}>GSTIN: {salon?.gstNumber || 'N/A'}</Text>
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
                    {invoice.items?.map((item, i) => {
                        const qty = item.quantity || 1;
                        const price = item.price || 0;
                        const gross = price * qty;
                        
                        let itemDiscountStr = '';
                        if (item.membershipDiscountValue > 0) {
                            if (item.membershipDiscountType === 'percentage') {
                                itemDiscountStr = `Disc: ${item.membershipDiscountValue}% (-Rs.${((gross * item.membershipDiscountValue) / 100).toFixed(2)})`;
                            } else {
                                itemDiscountStr = `Disc: -Rs.${item.membershipDiscountValue.toFixed(2)}`;
                            }
                        }

                        const itemTotal = item.total != null ? item.total : gross;
                        const isInclusive = item.isInclusiveTax !== undefined ? item.isInclusiveTax : invoice.includingGst;
                        const gstRate = item.gstPercent !== undefined ? item.gstPercent : (item.type === 'service' ? (invoice.serviceGstPercent || 5) : (invoice.productGstPercent || 10));
                        const gstAmount = isInclusive 
                            ? (itemTotal - (itemTotal * 100) / (100 + gstRate))
                            : (itemTotal * gstRate) / 100;
                        
                        const cgst = (gstAmount / 2).toFixed(2);
                        const sgst = (gstAmount / 2).toFixed(2);

                        return (
                            <View key={i} style={{ padding: 10, borderBottom: 1, borderColor: '#eee' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ flex: 2 }}>{item.name} (Qty: {qty} @ Rs.{price.toFixed(2)})</Text>
                                    <Text style={{ flex: 1.5, fontSize: 9 }}>{item.stylistIds?.map(s => typeof s === 'object' ? s.name : s).join(', ') || '-'}</Text>
                                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: 700 }}>Rs.{itemTotal.toFixed(2)}</Text>
                                </View>
                                <View style={{ marginTop: 4, fontSize: 8, color: '#666', gap: 2 }}>
                                    {itemDiscountStr ? <Text style={{ color: '#10b981', fontWeight: 700 }}>- {itemDiscountStr}</Text> : null}
                                    <Text>- GST ({gstRate}%): CGST Rs.{cgst} | SGST Rs.{sgst} | Total GST Rs.{gstAmount.toFixed(2)} ({isInclusive ? 'Incl. Tax' : 'Excl. Tax'})</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Bill Summary & Payment Details */}
                <View style={{ flexDirection: 'row', gap: 40 }}>
                    {/* Bill Summary */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Bill Summary</Text>
                        <View style={{ borderTop: 1, borderColor: '#eee', paddingTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Taxable Value</Text>
                                <Text>Rs.{(invoice.baseAmount || invoice.subtotal || 0).toFixed(2)}</Text>
                            </View>
                            {invoice.cgst > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#666' }}>CGST ({(invoice.gstPercent) / 2}%)</Text>
                                    <Text>+Rs.{(invoice.cgst || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {invoice.sgst > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#666' }}>SGST ({(invoice.gstPercent) / 2}%)</Text>
                                    <Text>+Rs.{(invoice.sgst || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {(!invoice.cgst && (invoice.tax || 0) > 0) && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#666' }}>GST ({invoice.gstPercent}%)</Text>
                                    <Text>+Rs.{(invoice.tax || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {(invoice.membershipDiscount || 0) > 0 && (() => {
                                const pct = invoice.subtotal > 0 ? Math.round(((invoice.membershipDiscount || 0) / invoice.subtotal) * 100) : 0;
                                return (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <Text style={{ color: '#10b981' }}>
                                            {pct > 0 ? `Membership Discount (${pct}%)` : 'Membership Discount'}
                                        </Text>
                                        <Text style={{ color: '#10b981' }}>-Rs.{(invoice.membershipDiscount || 0).toFixed(2)}</Text>
                                    </View>
                                );
                            })()}
                            {(invoice.discount || 0) > 0 && (() => {
                                const pct = invoice.subtotal > 0 ? Math.round(((invoice.discount || 0) / invoice.subtotal) * 100) : 0;
                                return (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <Text style={{ color: '#10b981' }}>
                                            {pct > 0 ? `Additional Discount (${pct}%)` : 'Additional Discount'}
                                        </Text>
                                        <Text style={{ color: '#10b981' }}>-Rs.{(invoice.discount || 0).toFixed(2)}</Text>
                                    </View>
                                );
                            })()}
                            {(invoice.walletRedeemed || 0) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#10b981' }}>Wallet Redeemed</Text>
                                    <Text style={{ color: '#10b981' }}>-Rs.{(invoice.walletRedeemed || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {(invoice.previousDueCollected || 0) > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#3b82f6' }}>Prev. Due Collected</Text>
                                    <Text style={{ color: '#3b82f6' }}>+Rs.{(invoice.previousDueCollected || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: 2, borderColor: '#C8956C' }}>
                                <Text style={{ fontSize: 14, fontWeight: 700 }}>Grand Total</Text>
                                <Text style={{ fontSize: 14, fontWeight: 700, color: '#C8956C' }}>Rs.{((invoice.total || 0) + (invoice.previousDueCollected || 0)).toFixed(2)}</Text>
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
                                <Text>Rs.{cashPaid.toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#666' }}>Online Paid</Text>
                                <Text>Rs.{onlinePaid.toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ color: '#e11d48', fontWeight: 700 }}>Due Amount</Text>
                                <Text style={{ color: '#e11d48', fontWeight: 700 }}>Rs.{(invoice.dueAmount || 0).toFixed(2)}</Text>
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

                {/* Terms & Conditions */}
                {salon?.termsAndConditions?.length > 0 && (
                    <View style={{ marginTop: 50, padding: 15, borderTop: 1, borderColor: '#eee' }}>
                        <Text style={{ fontSize: 9, fontWeight: 700, color: '#C8956C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Terms & Conditions</Text>
                        <View style={{ gap: 4 }}>
                            {salon.termsAndConditions.map((term, idx) => (
                                <Text key={idx} style={{ fontSize: 8, color: '#666' }}>
                                    â€¢ {term}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}

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
    const navigate = useNavigate();
    const { salon, outlets, activeOutletId, setActiveOutletId } = useBusiness();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [chartTimeframe, setChartTimeframe] = useState('this_month');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [page, setPage] = useState(1);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(null);
    const [isSendingEmail, setIsSendingEmail] = useState(null);
    const perPage = 10;

    useEffect(() => {
        if (selectedInvoice) {
            console.log('[InvoiceDetail] selectedInvoice.gstPercent:', selectedInvoice.gstPercent);
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

    useEffect(() => {
        loadInvoices();
    }, [activeOutletId]);

    const handleEditInvoice = (inv) => {
        navigate('/pos/billing', { state: { editInvoice: inv } });
    };

    const handleDeleteInvoice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const res = await api.delete(`/pos/invoices/${id}`);
            if (res.data?.success || res.status === 200) {
                toast.success('Invoice deleted successfully');
                loadInvoices();
            } else {
                toast.error(res.data?.message || 'Failed to delete invoice');
            }
        } catch (error) {
            console.error('[POSInvoices] Failed to delete invoice:', error);
            toast.error(error.response?.data?.message || 'Error deleting invoice');
        }
    };

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

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return toast.error('WhatsApp number must be a valid 10-digit mobile number.');
        }

        console.log(`[Frontend-POSInvoicesPage] sendWhatsAppBill initiated for Invoice: ${inv.invoiceNumber}, Phone: ${phone}`);
        setIsSendingWhatsApp(inv._id);
        try {
            // 1. Generate PDF blob (using POS receipt for WhatsApp)
            const blob = await pdf(<POSReceiptPDF invoice={inv} salon={salon} />).toBlob();
            console.log(`[Frontend-POSInvoicesPage] Generated POS receipt PDF blob size: ${blob.size} bytes`);

            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append('pdf', blob, `Invoice_${inv.invoiceNumber}.pdf`);

            // 3. Call API
            const requestUrl = `/pos/invoices/${inv._id}/send-whatsapp`;
            console.log(`[Frontend-POSInvoicesPage] Sending POST request to ${requestUrl}`);
            const response = await api.post(requestUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log(`[Frontend-POSInvoicesPage] API Response:`, response.data);

            if (response.data.success) {
                toast.success('Invoice sent on WhatsApp!');
            } else {
                toast.error(response.data.message || 'Failed to send WhatsApp');
            }
        } catch (error) {
            console.error('[Frontend-POSInvoicesPage] WhatsApp Error:', error);
            toast.error(error.response?.data?.message || 'Error sending WhatsApp invoice');
        } finally {
            setIsSendingWhatsApp(null);
        }
    };

    const sendEmailBill = async (inv) => {
        const email = inv.customerId?.email;
        if (!email) return toast('Customer email not found', { icon: 'â„¹ï¸' });

        setIsSendingEmail(inv._id);
        try {
            // Generate standard PDF
            const blob = await pdf(<StandardInvoicePDF invoice={inv} salon={salon} />).toBlob();
            const formData = new FormData();
            formData.append('pdf', blob, `Invoice_${inv.invoiceNumber}.pdf`);

            const res = await api.post(`/pos/invoices/${inv._id}/send-email`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success('Invoice sent via Email!');
            }
        } catch (error) {
            console.error('Email Send Error:', error);
            toast.error(error.response?.data?.message || 'Failed to send Email');
        } finally {
            setIsSendingEmail(null);
        }
    };

    const filtered = useMemo(() => {
        return invoices.filter(inv => {
            const clientName = inv.customerId?.name || inv.clientId?.name || '';
            const clientPhone = inv.customerId?.phone || inv.clientId?.phone || '';
            const matchSearch = !search ||
                inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                clientName.toLowerCase().includes(search.toLowerCase()) ||
                clientPhone.includes(search);

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

    const filteredInvoicesForChart = useMemo(() => {
        if (invoices.length === 0) return [];
        
        // Find the most recent invoice date
        let maxDateStr = invoices[0].createdAt;
        invoices.forEach(inv => {
            if (inv.createdAt && inv.createdAt > maxDateStr) {
                maxDateStr = inv.createdAt;
            }
        });
        
        const referenceDate = new Date(maxDateStr);
        
        return invoices.filter(inv => {
            if (!inv.createdAt) return false;
            const date = new Date(inv.createdAt);
            const diffTime = Math.abs(referenceDate - date);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            if (chartTimeframe === 'today') {
                return date.toDateString() === referenceDate.toDateString() || diffDays <= 1;
            } else if (chartTimeframe === 'this_week') {
                return diffDays <= 7;
            } else if (chartTimeframe === 'this_month') {
                return diffDays <= 30;
            }
            return true; // all_time
        });
    }, [invoices, chartTimeframe]);

    const paymentData = useMemo(() => {
        const grouped = {};
        filteredInvoicesForChart.forEach(inv => {
            const d = new Date(inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            if(!grouped[d]) grouped[d] = { name: d, Cash: 0, UPI: 0, Unpaid: 0 };
            const cash = inv.payments?.filter(p=>p.method==='cash').reduce((s,p)=>s+p.amount,0) || 0;
            const upi = inv.payments?.filter(p=>['online','card','upi'].includes(p.method)).reduce((s,p)=>s+p.amount,0) || 0;
            const fallbackTotal = inv.total || 0;
            grouped[d].Cash += cash > 0 ? cash : (inv.paymentMethod === 'cash' ? fallbackTotal : 0);
            grouped[d].UPI += upi > 0 ? upi : (['online','card','upi'].includes(inv.paymentMethod) ? fallbackTotal : 0);
            if((inv.paymentStatus || '').toLowerCase() !== 'paid') grouped[d].Unpaid += (inv.dueAmount || fallbackTotal);
        });
        const arr = Object.values(grouped).slice(-5);
        if(arr.length === 0) return [{ name: 'Today', Cash: 0, UPI: 0, Unpaid: 0 }];
        return arr;
    }, [filteredInvoicesForChart]);

    const donutData = useMemo(() => {
        let cash = 0, upi = 0, unpaid = 0;
        filteredInvoicesForChart.forEach(inv => {
            const cashAmt = inv.payments?.filter(p=>p.method==='cash').reduce((s,p)=>s+p.amount,0) || 0;
            const upiAmt = inv.payments?.filter(p=>['online','card','upi'].includes(p.method)).reduce((s,p)=>s+p.amount,0) || 0;
            const fallbackTotal = inv.total || 0;
            cash += cashAmt > 0 ? cashAmt : (inv.paymentMethod === 'cash' ? fallbackTotal : 0);
            upi += upiAmt > 0 ? upiAmt : (['online','card','upi'].includes(inv.paymentMethod) ? fallbackTotal : 0);
            if((inv.paymentStatus || '').toLowerCase() !== 'paid') unpaid += (inv.dueAmount || fallbackTotal);
        });
        return [
            { name: 'Cash', value: cash },
            { name: 'UPI', value: upi },
            { name: 'Unpaid', value: unpaid }
        ];
    }, [filteredInvoicesForChart]);
    const DONUT_COLORS = ['#10b981', '#8b5cf6', '#f97316'];

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
        <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#0b0f19] pb-12 text-slate-800 dark:text-slate-200">
            {/* Top Header */}
            <div className="bg-white dark:bg-[#121826]/80 border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 py-5 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none">INVOICES</h1>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">History Ledger &amp; Financial Analytics</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                            <select
                                value={activeOutletId || ''}
                                onChange={(e) => setActiveOutletId(e.target.value)}
                                className="pl-8 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#B4912B] transition-all cursor-pointer appearance-none shadow-sm text-slate-700 dark:text-slate-200"
                            >
                                <option value="">All Outlets</option>
                                {(outlets || []).map(o => (
                                    <option key={o._id} value={o._id}>{o.name}</option>
                                ))}
                            </select>
                            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        <button className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => navigate('/pos/billing')}
                            className="px-5 py-2.5 bg-[#B4912B] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm hover:bg-[#9c7d24] transition-all flex items-center gap-2"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Create Bill
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'today', label: 'Today', icon: Calendar, filterType: 'date' },
                        { id: 'all_time', label: 'All Time', icon: FileText, filterType: 'date' },
                        { id: 'all_inv', label: 'All Invoices', icon: FileText, filterType: 'type' },
                        { id: 'service', label: 'Services', icon: FileText, filterType: 'type' },
                        { id: 'product', label: 'Products', icon: Box, filterType: 'type' }
                    ].map(f => {
                        const isActive = (f.filterType === 'date' && dateFilter === (f.id === 'all_time' ? 'all' : f.id)) ||
                                         (f.filterType === 'type' && typeFilter === (f.id === 'all_inv' ? 'all' : f.id));
                        return (
                            <button
                                key={f.id}
                                onClick={() => {
                                    if (f.id === 'all_inv') { setTypeFilter('all'); setDateFilter('all'); }
                                    else if (f.id === 'all_time') { setDateFilter('all'); setTypeFilter('all'); }
                                    else { if (f.filterType === 'date') setDateFilter(f.id); if (f.filterType === 'type') setTypeFilter(f.id); }
                                    setPage(1);
                                }}
                                className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-all rounded-lg whitespace-nowrap border ${isActive ? 'bg-[#B4912B] text-white border-[#B4912B] shadow-sm' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                                <f.icon className="w-3.5 h-3.5 shrink-0" /> {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 md:px-10 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: "Total Revenue", badge: "OVERALL", badgeColor: "bg-slate-100 dark:bg-slate-800 !text-slate-600 dark:!text-slate-300", value: `₹${invoices.reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}`, subtitle: "vs Yesterday ₹0 (0%)", icon: Banknote, iconColor: "!text-primary", areaColor: '#10b981', areaId: 'sg0' },
                        { title: "Today's Earnings", badge: "TODAY", badgeColor: "bg-emerald-100 dark:bg-emerald-950/40 !text-emerald-700 dark:!text-emerald-300", value: `₹${invoices.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}`, subtitle: "vs Yesterday ₹0 (0%)", icon: Calendar, iconColor: "!text-emerald-600 dark:!text-emerald-400", areaColor: '#10b981', areaId: 'sg1' },
                        { title: "UPI / Card", badge: "DIGITAL", badgeColor: "bg-blue-100 dark:bg-blue-950/40 !text-blue-700 dark:!text-blue-300", value: `₹${invoices.filter(i => ['online', 'card', 'upi'].includes(i.paymentMethod)).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}`, subtitle: "vs Yesterday ₹0 (0%)", icon: Smartphone, iconColor: "!text-blue-600 dark:!text-blue-400", areaColor: '#3b82f6', areaId: 'sg2' },
                        { title: "Cash Collected", badge: "PHYSICAL", badgeColor: "bg-orange-100 dark:bg-orange-950/40 !text-orange-700 dark:!text-orange-300", value: `₹${invoices.filter(i => i.paymentMethod === 'cash' || !i.paymentMethod).reduce((s, i) => s + (i.total || 0), 0).toLocaleString()}`, subtitle: "vs Yesterday ₹0 (0%)", icon: Banknote, iconColor: "!text-amber-600 dark:!text-amber-400", areaColor: '#f97316', areaId: 'sg3' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden relative">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.title}</span>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${stat.badgeColor}`}>{stat.badge}</span>
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{stat.subtitle}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <div className="h-14 -mx-5 -mb-5 mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[{v:1},{v:4},{v:2},{v:5},{v:3},{v:6},{v:4},{v:7}]} margin={{top:0,right:0,left:0,bottom:0}}>
                                        <defs>
                                            <linearGradient id={stat.areaId} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={stat.areaColor} stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor={stat.areaColor} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="v" stroke="none" fillOpacity={1} fill={`url(#${stat.areaId})`} strokeWidth={0} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search + Filters Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 [&_*]:!stroke-slate-500 dark:[&_*]:!stroke-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by invoice number, customer name, or phone..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#B4912B] transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 [&_*]:!stroke-slate-500 dark:[&_*]:!stroke-slate-400" />
                        01 May 2026 - 28 May 2026
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 [&_*]:!stroke-slate-500 dark:[&_*]:!stroke-slate-400" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                        <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 [&_*]:!stroke-slate-500 dark:[&_*]:!stroke-slate-400" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                        <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 [&_*]:!stroke-slate-500 dark:[&_*]:!stroke-slate-400" />
                        Export
                    </button>
                </div>

                {/* Analytics + Quick Actions Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Payment Summary Chart */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Payment Summary</h3>
                                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Today's payment collection by method</p>
                            </div>
                            <div className="relative">
                                <select
                                    value={chartTimeframe}
                                    onChange={(e) => setChartTimeframe(e.target.value)}
                                    className="pl-2 pr-6 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-bold uppercase tracking-wider outline-none focus:border-[#B4912B] transition-all cursor-pointer appearance-none shadow-sm text-slate-700 dark:text-slate-200"
                                >
                                    <option value="this_month">This Month</option>
                                    <option value="this_week">This Week</option>
                                    <option value="today">Today</option>
                                    <option value="all_time">All Time</option>
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Cash</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-purple-500"></div><span className="text-[9px] font-bold text-slate-500 uppercase">UPI</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-orange-400"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Unpaid</span></div>
                        </div>
                        <div className="h-36 w-full [&_text]:!stroke-none [&_text_*]:!stroke-none [&_text]:!fill-slate-800 dark:[&_text]:!fill-slate-200 [&_text]:!font-black [&_text_*]:!font-black text-[10px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={1} barCategoryGap="30%">
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => '₹'+val} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
                                    <Bar dataKey="Cash" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={8} stroke="none" strokeWidth={0} />
                                    <Bar dataKey="UPI" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={8} stroke="none" strokeWidth={0} />
                                    <Bar dataKey="Unpaid" fill="#fb923c" radius={[3, 3, 0, 0]} maxBarSize={8} stroke="none" strokeWidth={0} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-100 mt-1">
                            <div><span className="text-[9px] font-black text-slate-500 uppercase">Cash</span> <span className="text-[9px] font-black text-emerald-500 ml-1">₹{donutData[0].value}</span></div>
                            <div><span className="text-[9px] font-black text-slate-500 uppercase">UPI</span> <span className="text-[9px] font-black text-purple-500 ml-1">₹{donutData[1].value}</span></div>
                            <div><span className="text-[9px] font-black text-slate-500 uppercase">Unpaid</span> <span className="text-[9px] font-black text-orange-500 ml-1">₹{donutData[2].value}</span></div>
                        </div>
                    </div>

                    {/* Collections Split Donut */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Collections Split</h3>
                        <div className="relative h-36">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={donutData} innerRadius={46} outerRadius={62} paddingAngle={3} dataKey="value" stroke="none" strokeWidth={0} startAngle={90} endAngle={-270}>
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} stroke="none" strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-black text-slate-800">₹{(donutData[0].value + donutData[1].value).toLocaleString()}</span>
                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Total Collection</span>
                            </div>
                        </div>
                        <div className="space-y-2 mt-3 border-t border-slate-100 pt-3">
                            {donutData.map((entry, i) => {
                                const total = donutData[0].value + donutData[1].value + donutData[2].value;
                                const pct = total === 0 ? 0 : Math.round((entry.value / total) * 100);
                                return (
                                    <div key={i} className="flex items-center justify-between text-[9px] font-bold">
                                        <div className="flex items-center gap-2 text-slate-600 uppercase">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i] }}></div>
                                            {entry.name}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400">{pct}%</span>
                                            <span className="text-slate-700 font-black">₹{entry.value}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-between text-[9px] font-black text-slate-700 uppercase pt-2 border-t border-slate-100">
                                <span>Total</span>
                                <span>₹{donutData[0].value + donutData[1].value + donutData[2].value}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'New Bill', icon: FileText, path: '/pos/billing' },
                                { label: 'Appointments', icon: Calendar, path: '/pos/appointments' },
                                { label: 'Invoices', icon: FileText, path: '/pos/invoices' },
                                { label: 'Packages', icon: Box, path: '/pos/packages' },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(action.path)}
                                    className="w-full min-h-[120px] flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-[#B4912B]/20 bg-[#B4912B]/5 hover:bg-[#B4912B]/10 hover:border-[#B4912B]/40 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white border border-[#B4912B]/20 flex items-center justify-center group-hover:border-[#B4912B]/40 transition-all shadow-sm">
                                        <action.icon className="w-5 h-5 !text-[#B4912B] [&_*]:!stroke-[#B4912B]" />
                                    </div>
                                    <span className="text-[9px] font-black !text-[#B4912B] uppercase tracking-widest">{action.label}</span>
                                </button>
                            ))}


                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Invoice List</span>
                        </div>
                        <button className="text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-[#B4912B] uppercase tracking-widest transition-colors">
                            View All &rarr;
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-8 h-8 text-[#B4912B] animate-spin mb-3" />
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Loading invoice ledger...</p>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-7 h-7 text-slate-300 dark:text-slate-700" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">No matching invoices found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="text-[9px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4">Invoice No.</th>
                                        <th className="px-6 py-4">
                                            <span className="flex items-center gap-1">Date &amp; Time <ChevronDown className="w-3 h-3" /></span>
                                        </th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Payment Method</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginated.map(inv => (
                                        <tr key={inv._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-tight">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">{formatDate(inv.createdAt)}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">{inv.customerId?.name || 'Guest'}</div>
                                                {inv.customerId?.phone && (
                                                    <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{inv.customerId.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-350">
                                                    {getMethodIcon(inv.paymentMethod)}
                                                    {inv.paymentMethod === 'online' ? 'UPI' : (inv.paymentMethod || 'Cash').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-slate-200 text-sm">₹{Number(inv.total || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'}`}>
                                                    {(inv.paymentStatus || '').toLowerCase() === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedInvoice(inv)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[#B4912B] hover:border-[#B4912B] hover:text-white text-slate-500 dark:text-slate-400 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditInvoice(inv)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-amber-500 hover:border-amber-500 hover:text-white text-amber-600 dark:text-amber-500 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700"
                                                        title="Edit Invoice"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteInvoice(inv._id)}
                                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-red-500 hover:border-red-500 hover:text-white text-red-600 dark:text-red-500 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700"
                                                        title="Delete Invoice"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Total: {filtered.length} invoices</p>
                            <div className="flex gap-2">
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-[#B4912B] hover:border-[#B4912B] disabled:opacity-30 transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center">
                                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Page {page} / {totalPages}</span>
                                </div>
                                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-[#B4912B] hover:border-[#B4912B] disabled:opacity-30 transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-6 py-5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <p className="text-[9px] font-black text-[#B4912B] uppercase tracking-[0.3em] mb-1">Invoice Protocol</p>
                                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{selectedInvoice.invoiceNumber}</h2>
                                <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> {formatDate(selectedInvoice.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEditInvoice(selectedInvoice)}
                                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase px-3.5 shadow-md shadow-amber-500/10 cursor-pointer"
                                    title="Edit Invoice"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button onClick={() => setSelectedInvoice(null)} className="modal-close-btn p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Customer</p>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-250">{selectedInvoice.customerId?.name || 'Guest'}</p>
                                    {selectedInvoice.customerId?.phone && (
                                        <p className="text-[9px] font-bold text-[#B4912B] mt-0.5">{selectedInvoice.customerId.phone}</p>
                                    )}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Outlet</p>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-250">{selectedInvoice.outletId?.name || 'Main Outlet'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Staff</p>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-250">
                                        {[...new Set(selectedInvoice.items?.flatMap(item =>
                                            item.stylistIds?.map(s => typeof s === 'object' ? s.name : s) || []
                                        ).filter(Boolean))].join(', ') || selectedInvoice.staffId?.name || 'System'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Session Ledger</p>
                                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                                </div>
                                <div className="space-y-2">
                                    {selectedInvoice.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#B4912B]/30 transition-all">
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase">{item.name}</p>
                                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                                    Qty: {item.quantity} • {item.type}
                                                    {item.stylistIds?.length > 0 && (
                                                        <span className="text-[#B4912B] ml-1">• Staff: {item.stylistIds.map(s => typeof s === 'object' ? s.name : s).join(', ')}</span>
                                                    )}
                                                    {(() => {
                                                        const qty = item.quantity || 1;
                                                        const price = item.price || 0;
                                                        const itemTotal = item.total != null ? item.total : (price * qty);
                                                        const isInclusive = item.isInclusiveTax !== undefined ? item.isInclusiveTax : selectedInvoice.includingGst;
                                                        const gstRate = item.gstPercent !== undefined ? item.gstPercent : (item.type === 'service' ? (selectedInvoice.serviceGstPercent || 5) : (selectedInvoice.productGstPercent || 10));
                                                        const gstAmount = isInclusive 
                                                            ? (itemTotal - (itemTotal * 100) / (100 + gstRate))
                                                            : (itemTotal * gstRate) / 100;
                                                        return (
                                                            <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                                                                • GST: {gstRate}% (₹{gstAmount.toFixed(2)}) {isInclusive ? 'Incl.' : 'Excl.'}
                                                            </span>
                                                        );
                                                    })()}
                                                </p>
                                            </div>
                                            <span className="font-black text-slate-800 dark:text-slate-200 text-sm">₹{(item.total != null ? item.total : (item.price * item.quantity) || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
                                <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                    <span>Taxable Value</span>
                                    <span>₹{(selectedInvoice.baseAmount || selectedInvoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {selectedInvoice.cgst > 0 && (
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>CGST {selectedInvoice.items?.every(i => i.type === 'service') ? `(${(selectedInvoice.serviceGstPercent || selectedInvoice.gstPercent || 5) / 2}%)` : ''}</span>
                                        <span>{selectedInvoice.includingGst ? '(Included)' : `+₹${selectedInvoice.cgst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                    </div>
                                )}
                                {selectedInvoice.sgst > 0 && (
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>SGST {selectedInvoice.items?.every(i => i.type === 'service') ? `(${(selectedInvoice.serviceGstPercent || selectedInvoice.gstPercent || 5) / 2}%)` : ''}</span>
                                        <span>{selectedInvoice.includingGst ? '(Included)' : `+₹${selectedInvoice.sgst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                    </div>
                                )}
                                {selectedInvoice.igst > 0 && (
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>IGST ({selectedInvoice.gstPercent}%)</span>
                                        <span>{selectedInvoice.includingGst ? '(Included)' : `+₹${selectedInvoice.igst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                    </div>
                                )}
                                {(!selectedInvoice.cgst && !selectedInvoice.sgst && !selectedInvoice.igst && (selectedInvoice.tax || 0) > 0) && (
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>GST ({selectedInvoice.gstPercent}%)</span>
                                        <span>{selectedInvoice.includingGst ? '(Included)' : `+₹${selectedInvoice.tax?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                                    </div>
                                )}
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                                        <span>Discount</span>
                                        <span>-₹{selectedInvoice.discount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {(selectedInvoice.membershipDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                                        <span>Membership Disc</span>
                                        <span>-₹{(selectedInvoice.membershipDiscount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {(selectedInvoice.walletRedeemed || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                                        <span>Wallet Used</span>
                                        <span>-₹{(selectedInvoice.walletRedeemed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {(selectedInvoice.previousDueCollected || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                        <span>Prev. Due Collected</span>
                                        <span>+₹{(selectedInvoice.previousDueCollected || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] font-bold text-[#B4912B] uppercase tracking-widest">Grand Total</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">₹{((selectedInvoice.total || 0) + (selectedInvoice.previousDueCollected || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${selectedInvoice.paymentStatus === 'paid' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'}`}>
                                            {selectedInvoice.paymentStatus?.toUpperCase()}
                                        </span>
                                        <div className="space-y-1 mt-2">
                                            {selectedInvoice.payments?.map((p, idx) => (
                                                <div key={idx} className="flex items-center justify-end gap-1.5">
                                                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-555 uppercase">{p.method === 'online' ? 'UPI' : p.method?.toUpperCase()}</span>
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">₹{p.amount?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {(selectedInvoice.walletRedeemed || 0) > 0 && (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-500 uppercase">Wallet</span>
                                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{selectedInvoice.walletRedeemed?.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {selectedInvoice.paymentStatus !== 'paid' && (
                                                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-dashed border-orange-300 dark:border-orange-850 mt-1">
                                                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-450 uppercase">Balance Due</span>
                                                    <span className="text-xs font-black text-orange-600 dark:text-orange-450">₹{(selectedInvoice.dueAmount || 0).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                disabled={!!isGeneratingPDF}
                                onClick={() => handleDownloadPDF('pos')}
                                className="py-2.5 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl"
                            >
                                {isGeneratingPDF === 'pos' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white stroke-white" /> : <Printer className="w-3.5 h-3.5 text-white stroke-white" />}
                                Receipt
                            </button>
                            <button
                                disabled={!!isGeneratingPDF}
                                onClick={() => handleDownloadPDF('standard')}
                                className="py-2.5 bg-slate-700 text-white font-black text-[9px] uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl shadow-sm"
                            >
                                {isGeneratingPDF === 'standard' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white stroke-white" /> : <FileText className="w-3.5 h-3.5 text-white stroke-white" />}
                                A4 Bill
                            </button>
                            <button
                                disabled={isSendingWhatsApp === selectedInvoice._id}
                                onClick={() => sendWhatsAppBill(selectedInvoice)}
                                className="py-2.5 bg-[#25D366] text-white font-black text-[9px] uppercase tracking-wider hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl shadow-sm"
                            >
                                {isSendingWhatsApp === selectedInvoice._id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white stroke-white" /> : <MessageCircle className="w-3.5 h-3.5 text-white stroke-white" />}
                                WhatsApp
                            </button>
                            <button
                                disabled={isSendingEmail === selectedInvoice._id}
                                onClick={() => sendEmailBill(selectedInvoice)}
                                className="py-2.5 bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl shadow-sm"
                            >
                                {isSendingEmail === selectedInvoice._id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white stroke-white" /> : <Mail className="w-3.5 h-3.5 text-white stroke-white" />}
                                Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
