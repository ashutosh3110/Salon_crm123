import { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    Scissors, Package, Check, Loader2, Scan,
    Sparkles, User, UserPlus, ArrowRight, Percent, Info,
    Tag, Star, Wallet, Printer, Banknote, Smartphone, FileText
} from 'lucide-react';
import {
    MOCK_SERVICES, MOCK_PRODUCTS, MOCK_CLIENTS,
    MOCK_STAFF, MOCK_PROMOTIONS, MOCK_VOUCHERS
} from '../../data/posData';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CreditCard, Ticket, Gift, History, Calendar } from 'lucide-react';
import {
    Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf, Font
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
    salonName: { fontSize: 24, fontWeight: 'bold' },
    salonMeta: { fontSize: 9, color: '#666' },
    invoiceTitle: { fontSize: 32, color: '#F0F0F0', position: 'absolute', right: 0, top: 0, fontWeight: 'bold' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },
    metaBox: { width: '45%', backgroundColor: '#F9F9F9', padding: 10 },
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
                    <Text style={pdfStyles.value}>{invoice.client?.name || 'Walk-in Client'}</Text>
                    <Text style={pdfStyles.salonMeta}>{invoice.client?.phone}</Text>
                    <Text style={pdfStyles.salonMeta}>{invoice.client?.email || ''}</Text>
                </View>
                <View style={pdfStyles.metaBox}>
                    <Text style={pdfStyles.label}>Invoice Details</Text>
                    <Text style={pdfStyles.value}>#{invoice.number}</Text>
                    <Text style={pdfStyles.salonMeta}>Date: {invoice.date}</Text>
                    <Text style={pdfStyles.salonMeta}>Payment: {invoice.paymentMethod.toUpperCase()}</Text>
                </View>
            </View>

            <View style={pdfStyles.tableHeader}>
                <Text style={[pdfStyles.colDesc, { fontSize: 8, fontWeight: 'bold' }]}>DESCRIPTION</Text>
                <Text style={[pdfStyles.colPrice, { fontSize: 8, fontWeight: 'bold' }]}>PRICE</Text>
                <Text style={[pdfStyles.colQty, { fontSize: 8, fontWeight: 'bold' }]}>QTY</Text>
                <Text style={[pdfStyles.colTotal, { fontSize: 8, fontWeight: 'bold' }]}>TOTAL</Text>
            </View>

            {invoice.items.map((item, i) => (
                <View key={i} style={pdfStyles.tableRow}>
                    <View style={pdfStyles.colDesc}>
                        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                        <Text style={{ fontSize: 8, color: '#666' }}>Stylist: {item.staffName}</Text>
                    </View>
                    <Text style={pdfStyles.colPrice}>₹ {item.price}</Text>
                    <Text style={pdfStyles.colQty}>{item.quantity}</Text>
                    <Text style={pdfStyles.colTotal}>₹ {(item.price * item.quantity).toFixed(0)}</Text>
                </View>
            ))}

            <View style={pdfStyles.summarySection}>
                <View style={pdfStyles.summaryBox}>
                    <View style={pdfStyles.summaryRow}>
                        <Text>Subtotal</Text>
                        <Text>₹ {invoice.totals.subtotal.toFixed(0)}</Text>
                    </View>
                    {invoice.totals.discount > 0 && (
                        <View style={pdfStyles.summaryRow}>
                            <Text style={{ color: '#E53E3E' }}>Discount</Text>
                            <Text style={{ color: '#E53E3E' }}>-₹ {invoice.totals.discount.toFixed(0)}</Text>
                        </View>
                    )}
                    <View style={pdfStyles.summaryRow}>
                        <Text>CGST (9%)</Text>
                        <Text>₹ {(invoice.totals.tax / 2).toFixed(2)}</Text>
                    </View>
                    <View style={pdfStyles.summaryRow}>
                        <Text>SGST (9%)</Text>
                        <Text>₹ {(invoice.totals.tax / 2).toFixed(2)}</Text>
                    </View>
                    <View style={[pdfStyles.summaryRow, pdfStyles.grandTotal]}>
                        <Text>GRAND TOTAL</Text>
                        <Text>₹ {invoice.totals.total.toFixed(0)}</Text>
                    </View>
                </View>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.thanks}>Thank you for visiting!</Text>
                <Text style={{ fontSize: 8, color: '#999' }}>This is a computer generated invoice and requires no signature.</Text>
            </View>
        </Page>
    </Document>
);

export default function POSBillingPage() {
    // ─── State ──────────────────────────────────────────────
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [payments, setPayments] = useState([{ method: 'cash', amount: 0 }]);
    const [taxPercent, setTaxPercent] = useState(18);
    const [pendingAppOrder, setPendingAppOrder] = useState(null);

    // UI State
    const [activeTab, setActiveTab] = useState('services');
    const [searchItem, setSearchItem] = useState('');
    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkingOut, setCheckingOut] = useState(false);
    const [successInvoice, setSuccessInvoice] = useState(null);
    const [showNewClient, setShowNewClient] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showClientInfo, setShowClientInfo] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [mobileView, setMobileView] = useState('items'); // 'items' | 'cart'

    // Discount/Redemption
    const [manualDiscount, setManualDiscount] = useState({ type: 'fixed', value: 0 });
    const [offerTab, setOfferTab] = useState('manual');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [redeemWallet, setRedeemWallet] = useState(0);

    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '' });

    // Refs
    const searchInputRef = useRef(null);
    const clientInputRef = useRef(null);

    // ─── Calculations ──────────────────────────────────────
    const totals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => {
            if (item.isPackageRedemption) return sum;
            return sum + (item.price * item.quantity);
        }, 0);

        let discount = 0;
        // Manual
        if (manualDiscount.type === 'percentage') discount += (subtotal * manualDiscount.value) / 100;
        else discount += manualDiscount.value;

        // Promotion
        if (appliedPromotion) {
            if (appliedPromotion.discountType === 'percentage') discount += (subtotal * appliedPromotion.discountValue) / 100;
            else discount += appliedPromotion.discountValue;
        }

        // Voucher
        if (appliedVoucher) {
            if (appliedVoucher.type === 'percentage') discount += (subtotal * appliedVoucher.value) / 100;
            else discount += appliedVoucher.value;
        }

        const taxable = Math.max(0, subtotal - discount - (redeemPoints || 0) - (redeemWallet || 0));
        const tax = (taxable * taxPercent) / 100;
        const total = taxable + tax;

        return { subtotal, discount, tax, total, taxable };
    }, [cart, manualDiscount, appliedPromotion, appliedVoucher, redeemPoints, redeemWallet, taxPercent]);

    // Update auto-payment if single payment
    useMemo(() => {
        if (payments.length === 1 && payments[0].amount !== totals.total) {
            setPayments([{ ...payments[0], amount: totals.total }]);
        }
    }, [totals.total, payments.length]);


    // ─── App Integration ────────────────────────────────────
    useMemo(() => {
        if (selectedClient) {
            const saved = localStorage.getItem('pending_pos_cart');
            if (saved) {
                setPendingAppOrder(JSON.parse(saved));
            }
        } else {
            setPendingAppOrder(null);
        }
    }, [selectedClient]);

    const importAppOrder = () => {
        if (!pendingAppOrder) return;
        const newItems = pendingAppOrder.items.map(item => ({
            ...item,
            itemId: item._id,
            type: 'product',
            staffId: null
        }));
        setCart(prev => [...prev, ...newItems]);
        setPendingAppOrder(null);
        localStorage.removeItem('pending_pos_cart');
    };

    // ─── Barcode Scan Handler ────────────────────────────────
    useEffect(() => {
        if (!searchItem || searchItem.length < 5) return; // Barcodes are usually long

        const product = MOCK_PRODUCTS.find(p => p.barcode === searchItem);
        if (product) {
            addToCart(product, 'product');
            setSearchItem('');
            return;
        }

        // Optional: Check SKU too if it's an exact match
        const productBySku = MOCK_PRODUCTS.find(p => p.sku === searchItem);
        if (productBySku) {
            addToCart(productBySku, 'product');
            setSearchItem('');
        }
    }, [searchItem]);

    // ─── Filters & Search ────────────────────────────────────
    const categories = useMemo(() => {
        const items = activeTab === 'services' ? MOCK_SERVICES : MOCK_PRODUCTS;
        return ['All', ...new Set(items.map(i => i.category))];
    }, [activeTab]);

    const filteredItems = useMemo(() => {
        const items = activeTab === 'services' ? MOCK_SERVICES : MOCK_PRODUCTS;
        return items.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
                (item.sku && item.sku.toLowerCase().includes(searchItem.toLowerCase()));
            const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
            return matchSearch && matchCat;
        });
    }, [activeTab, searchItem, selectedCategory]);

    const filteredClients = useMemo(() => {
        if (!searchClient) return MOCK_CLIENTS.slice(0, 5);
        return MOCK_CLIENTS.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()) || c.phone.includes(searchClient));
    }, [searchClient]);

    // ─── Cart Logic ────────────────────────────────────────
    const addToCart = (item, forcedType) => {
        const type = forcedType || (activeTab === 'services' ? 'service' : 'product');
        const existingId = cart.findIndex(c => c.itemId === item._id && c.type === type);

        if (existingId > -1) {
            const newCart = [...cart];
            newCart[existingId].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                ...item,
                itemId: item._id,
                type,
                quantity: 1,
                staffId: null,
                commission: item.commission || 0
            }]);
        }
    };

    const updateQty = (idx, delta) => {
        const newCart = [...cart];
        newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
        setCart(newCart);
    };

    const removeItem = (idx) => {
        setCart(cart.filter((_, i) => i !== idx));
    };

    const updateStaff = (idx, staffId) => {
        const newCart = [...cart];
        newCart[idx].staffId = staffId;
        setCart(newCart);
    };

    const togglePackageRedemption = (idx) => {
        const newCart = [...cart];
        newCart[idx].isPackageRedemption = !newCart[idx].isPackageRedemption;
        setCart(newCart);
    };

    // ─── Redemption Logic ──────────────────────────────────
    const handleRedeemPoints = () => {
        if (!selectedClient) return;
        if (redeemPoints > 0) {
            setRedeemPoints(0);
        } else {
            // Assume 1 point = 1 Rupee for simplicity, but capped at taxable subtotal
            const maxRedeemable = Math.max(0, totals.subtotal - totals.discount);
            setRedeemPoints(Math.min(selectedClient.loyaltyPoints, maxRedeemable));
        }
    };

    const handleRedeemWallet = () => {
        if (!selectedClient) return;
        if (redeemWallet > 0) {
            setRedeemWallet(0);
        } else {
            const maxRedeemable = Math.max(0, totals.subtotal - totals.discount - redeemPoints);
            setRedeemWallet(Math.min(selectedClient.walletBalance, maxRedeemable));
        }
    };

    const addPaymentMethod = () => {
        setPayments([...payments, { method: 'online', amount: 0 }]);
    };

    const updatePayment = (idx, field, value) => {
        const newPayments = [...payments];
        newPayments[idx][field] = value;
        setPayments(newPayments);
    };

    const removePayment = (idx) => {
        if (payments.length > 1) {
            setPayments(payments.filter((_, i) => i !== idx));
        }
    };


    const packageEligibleItems = useMemo(() => {
        if (!selectedClient) return [];
        return selectedClient.packages?.map(p => p.name) || [];
    }, [selectedClient]);

    // ─── Actions ───────────────────────────────────────────
    const handleCheckout = () => {
        if (!selectedClient) return alert('Select a client first');
        if (cart.length === 0) return alert('Cart is empty');
        const paidAmount = payments.reduce((s, p) => s + p.amount, 0);
        if (paidAmount !== totals.total) return alert('Total payment must match bill amount');

        setCheckingOut(true);
        setTimeout(() => {
            setSuccessInvoice({
                number: `INV-${Date.now().toString().slice(-4)}`,
                date: new Date().toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                }),
                outlet: 'Lucknow Branch',
                cashier: 'Priya',
                client: selectedClient,
                items: cart.map(item => ({
                    ...item,
                    staffName: MOCK_STAFF.find(s => s._id === item.staffId)?.name || 'Unknown'
                })),
                totals: { ...totals },
                payments: payments,
                loyaltyEarned: Math.floor(totals.total / 100),
                discounts: {
                    manual: manualDiscount,
                    promotion: appliedPromotion,
                    voucher: appliedVoucher,
                    points: redeemPoints,
                    wallet: redeemWallet
                }
            });
            setCheckingOut(false);
        }, 1200);
    };

    const handleQuickCreate = (e) => {
        e.preventDefault();
        if (!newClientForm.name || !newClientForm.phone) return alert('Name and phone are required');

        const newClient = {
            _id: `nc-${Date.now()}`,
            name: newClientForm.name,
            phone: newClientForm.phone,
            email: newClientForm.email || '',
            gender: 'other',
            loyaltyPoints: 0,
            walletBalance: 0,
            packages: [],
            history: []
        };

        setSelectedClient(newClient);
        setShowNewClient(false);
        setNewClientForm({ name: '', phone: '', email: '' });
        setSearchClient('');
        setShowClientDropdown(false);
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={successInvoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${successInvoice.number}_${successInvoice.client?.name || 'Invoice'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const resetBill = () => {
        setCart([]);
        setSelectedClient(null);
        setSuccessInvoice(null);
        setManualDiscount({ type: 'fixed', value: 0 });
        setRedeemPoints(0);
        setRedeemWallet(0);
    };

    // ─── Keyboard Shortcuts ───────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            // F9: Focus Item Search
            if (e.key === 'F9') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // F10: Open Offers
            if (e.key === 'F10') {
                e.preventDefault();
                setShowDiscountModal(true);
            }
            // Ctrl + Enter: Quick Checkout
            if (e.ctrlKey && e.key === 'Enter') {
                if (successInvoice) resetBill();
                else handleCheckout();
            }
            // ESC: Close Modals
            if (e.key === 'Escape') {
                setShowDiscountModal(false);
                setShowNewClient(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [successInvoice, cart, selectedClient, payments, totals]);

    // ─── Render ─────────────────────────────────────
    if (successInvoice) {
        return (
            <div className="flex flex-col lg:flex-row items-start justify-center min-h-[85vh] gap-8 p-6 animate-in fade-in duration-500 overflow-y-auto">
                {/* ─── Thermal Receipt (80mm) ─── */}
                <div id="thermal-receipt" className="bg-white text-black p-6 w-[320px] shadow-2xl border border-slate-200 font-mono text-[12px] leading-tight print:shadow-none print:border-0 print:m-0">
                    <div className="text-center space-y-1 mb-4">
                        <h2 className="text-lg font-black uppercase tracking-tighter">XYZ SALON & SPA</h2>
                        <p className="text-[10px]">Lucknow Gomti Nagar, UP 226010</p>
                        <p className="text-[10px]">Ph: +91 98765 43210</p>
                        <p className="text-[10px] font-bold">GSTIN: 09AAFCC0301F1ZN</p>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mb-2 space-y-0.5">
                        <div className="flex justify-between"><span>Inv No:</span><span className="font-bold">{successInvoice.number}</span></div>
                        <div className="flex justify-between"><span>Date:</span><span>{successInvoice.date}</span></div>
                        <div className="flex justify-between"><span>Outlet:</span><span>{successInvoice.outlet}</span></div>
                        <div className="flex justify-between"><span>Cashier:</span><span>{successInvoice.cashier}</span></div>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mb-2">
                        <div className="flex justify-between"><span>Customer:</span><span className="font-bold uppercase">{successInvoice.client.name}</span></div>
                        <div className="flex justify-between"><span>Mobile:</span><span>{successInvoice.client.phone.replace(/(\d{2})(\d{6})(\d{2})/, '$1XXXXXX$3')}</span></div>
                    </div>

                    <div className="border-t border-black pt-2 mb-1 font-bold">
                        <div className="grid grid-cols-[1fr_50px_60px_60px]">
                            <span>Items</span>
                            <span className="text-center">HSN</span>
                            <span className="text-center">Rate</span>
                            <span className="text-right">Amt</span>
                        </div>
                    </div>
                    <div className="border-t border-dashed border-black pt-2 mb-2 space-y-1">
                        {successInvoice.items.map((item, i) => (
                            <div key={i}>
                                <div className="grid grid-cols-[1fr_50px_60px_60px]">
                                    <span className="uppercase text-[10px] truncate pr-1">{item.name} {item.isPackageRedemption && '(Pkg)'}</span>
                                    <span className="text-[10px] text-center opacity-70">{item.hsnCode || '-'}</span>
                                    <span className="text-[10px] text-center">{item.isPackageRedemption ? 0 : item.price}</span>
                                    <span className="text-[10px] text-right">{(item.isPackageRedemption ? 0 : (item.price * item.quantity)).toFixed(0)}</span>
                                </div>
                                <p className="text-[8px] italic opacity-60">Qty: {item.quantity} | Stylist: {item.staffName}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black pt-2 space-y-1">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{successInvoice.totals.subtotal.toFixed(0)}</span></div>

                        {successInvoice.discounts.manual.value > 0 && <div className="flex justify-between text-[10px] italic"><span>Manual Discount:</span><span>-{successInvoice.totals.discount.toFixed(0)}</span></div>}
                        {successInvoice.discounts.promotion && <div className="flex justify-between text-[10px] italic"><span>Promo ({successInvoice.discounts.promotion.name}):</span><span>Applied</span></div>}
                        {successInvoice.discounts.voucher && <div className="flex justify-between text-[10px] italic"><span>Voucher ({successInvoice.discounts.voucher.code}):</span><span>Applied</span></div>}

                        {successInvoice.discounts.points > 0 && <div className="flex justify-between text-[10px] italic font-bold text-blue-800"><span>Loyalty Points Used:</span><span>-₹{successInvoice.discounts.points}</span></div>}
                        {successInvoice.discounts.wallet > 0 && <div className="flex justify-between text-[10px] italic font-bold text-emerald-800"><span>Wallet Balance Used:</span><span>-₹{successInvoice.discounts.wallet}</span></div>}

                        <div className="flex justify-between font-bold"><span>Taxable:</span><span>{successInvoice.totals.taxable.toFixed(0)}</span></div>
                        <div className="flex justify-between"><span>GST @{taxPercent}%:</span><span>{successInvoice.totals.tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-base font-black border-t border-black pt-1 mt-1">
                            <span>TOTAL:</span>
                            <span>₹{successInvoice.totals.total.toFixed(0)}</span>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mt-2 space-y-0.5">
                        <p className="font-bold uppercase text-[10px] mb-1">Payment Details</p>
                        {successInvoice.payments.map((p, idx) => (
                            <div key={idx} className="flex justify-between uppercase text-[10px]">
                                <span>{p.method}:</span>
                                <span>₹{p.amount.toFixed(0)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mt-2 text-center">
                        <p className="font-bold">LOYALTY EARNED: {successInvoice.loyaltyEarned} PTS</p>
                        <p className="mt-4 font-bold uppercase tracking-widest">Thank You! Visit Again 🙂</p>
                    </div>
                </div>

                {/* ─── Control Actions ─── */}
                <div className="w-full max-w-sm space-y-4 pt-4 lg:pt-10">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-emerald-600 uppercase">Transaction Success</h3>
                        <p className="text-sm text-text-secondary font-medium italic">Log #{successInvoice.number} generated.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button
                            onClick={() => window.print()}
                            className="bg-text text-background p-4 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            <Printer className="w-4 h-4" /> Print Thermal (80mm)
                        </button>
                        <button
                            disabled={isGeneratingPDF}
                            onClick={handleDownloadPDF}
                            className={`bg-surface border border-border p-4 font-black uppercase tracking-widest text-[10px] text-text-secondary flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-alt'}`}
                        >
                            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-primary" />}
                            {isGeneratingPDF ? 'Generating Document...' : 'Download A4 PDF Invoice'}
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button className="bg-[#25D366] text-white p-3 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-none">
                                <Smartphone className="w-3.5 h-3.5" /> WhatsApp
                            </button>
                            <button className="bg-primary/10 text-primary border border-primary/20 p-3 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-primary/20 transition-all rounded-none">
                                <FileText className="w-3.5 h-3.5" /> Email
                            </button>
                        </div>
                        <button
                            onClick={resetBill}
                            className="bg-primary text-white p-4 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all"
                        >
                            <Plus className="w-4 h-4" /> New Billing
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] mt-2">

            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden border-b border-border bg-surface shrink-0">
                <button
                    onClick={() => setMobileView('items')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileView === 'items' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'
                        }`}
                >
                    <Scissors className="w-3.5 h-3.5" /> Services & Products
                </button>
                <button
                    onClick={() => setMobileView('cart')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${mobileView === 'cart' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'
                        }`}
                >
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    {cart.length > 0 && (
                        <span className="absolute top-2 right-6 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden gap-0 lg:gap-6 lg:p-0">

                {/* ─── LEFT PANEL: Item Discovery ─── */}
                <div className={`flex-1 flex flex-col min-w-0 bg-surface border-0 lg:border border-border p-4 shadow-sm overflow-hidden ${mobileView === 'items' ? 'flex' : 'hidden'
                    } lg:flex`}>
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Scan Barcode or Search Items..."
                                className="w-full pl-10 pr-12 py-3 border border-border bg-background text-text outline-none focus:border-primary text-sm font-bold shadow-sm transition-all placeholder:text-text-muted/50"
                                value={searchItem}
                                autoFocus
                                onChange={(e) => setSearchItem(e.target.value)}
                            />
                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/10 text-primary transition-all active:scale-90"
                                title="Open Camera Scanner"
                            >
                                <Scan className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex bg-surface-alt p-1 border border-border">
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'services' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Services</button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'products' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Products</button>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 whitespace-nowrap text-[11px] font-extrabold uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-text text-background border-text shadow-md' : 'bg-background text-text-secondary border-border hover:border-text-muted'}`}
                            >{cat}</button>
                        ))}
                    </div>

                    {/* Quick Access Services */}
                    <div className="mb-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Fast Sell
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {MOCK_SERVICES.slice(0, 6).map(s => (
                                <button
                                    key={`quick-${s._id}`}
                                    onClick={() => addToCart(s)}
                                    className="flex-shrink-0 px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {s.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-2 scrollbar-thin">
                        {filteredItems.map(item => (
                            <button
                                key={item._id}
                                onClick={() => addToCart(item)}
                                className="bg-background border border-border p-4 text-left hover:border-primary transition-all group flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md active:scale-95"
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`p-1.5 ${item.type === 'service' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                                        {activeTab === 'services' ? <Scissors className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className="text-[10px] font-black text-text-muted group-hover:text-primary transition-colors">ADD</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-extrabold text-text line-clamp-2 uppercase tracking-tight leading-tight">{item.name}</h4>
                                    <p className="text-sm font-black text-primary mt-1">₹{item.price}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── RIGHT PANEL: Cart & Checkout ─── */}
                <div className={`w-full lg:w-[420px] flex-col bg-surface border-0 lg:border border-border shadow-xl overflow-hidden ${mobileView === 'cart' ? 'flex' : 'hidden'
                    } lg:flex`}>

                    <div className="p-4 border-b border-border space-y-3 bg-surface-alt/50">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                <User className="w-3 h-3" /> Selected Client
                            </label>
                            {selectedClient && (
                                <button onClick={() => setShowClientInfo(!showClientInfo)} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                    {showClientInfo ? 'Hide Details' : 'View History'} <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {!selectedClient ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by Phone or Name..."
                                    className="w-full px-4 py-2 text-sm bg-background text-text border border-border outline-none focus:border-primary"
                                    value={searchClient}
                                    onChange={(e) => { setSearchClient(e.target.value); setShowClientDropdown(true); }}
                                    onFocus={() => setShowClientDropdown(true)}
                                />
                                {showClientDropdown && searchClient && (
                                    <div className="absolute top-full left-0 w-full bg-surface border border-border shadow-2xl z-20 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                                            {filteredClients.length > 0 ? filteredClients.map(c => (
                                                <button
                                                    key={c._id}
                                                    onClick={() => { setSelectedClient(c); setShowClientDropdown(false); setSearchClient(''); }}
                                                    className="w-full p-4 text-left hover:bg-surface-alt flex items-center justify-between border-b border-border/50 group transition-all"
                                                >
                                                    <div>
                                                        <p className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{c.name}</p>
                                                        <p className="text-[11px] font-bold text-text-muted mt-0.5">{c.phone}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-widest text-text-secondary bg-surface-alt px-3 py-1.5 border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">SELECT</span>
                                                </button>
                                            )) : (
                                                <div className="p-4 text-center text-[10px] font-bold text-text-muted uppercase italic tracking-widest">No matching clients</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const isPhone = /^\d+$/.test(searchClient);
                                                setNewClientForm({
                                                    name: isPhone ? '' : searchClient,
                                                    phone: isPhone ? searchClient : '',
                                                    email: ''
                                                });
                                                setShowNewClient(true);
                                            }}
                                            className="w-full p-4 text-primary font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 border-t border-dashed border-border transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" /> QUICK CREATE NEW
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-background border border-border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary/10 text-primary flex items-center justify-center font-black">
                                        {selectedClient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text">{selectedClient.name}</p>
                                        <p className="text-[11px] text-text-muted font-bold">{selectedClient.phone}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2 text-text-muted hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {selectedClient && showClientInfo && (
                            <div className="bg-slate-900 border border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white/5 p-2 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Loyalty</p>
                                        <p className="text-sm font-black text-amber-400">{selectedClient.loyaltyPoints} pts</p>
                                    </div>
                                    <div className="bg-white/5 p-2 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Wallet</p>
                                        <p className="text-sm font-black text-emerald-400">₹{selectedClient.walletBalance}</p>
                                    </div>
                                    <div className="bg-white/5 p-2 text-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Visits</p>
                                        <p className="text-sm font-black text-blue-400">{selectedClient.history.length}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pending App Order Alert */}
                    {pendingAppOrder && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-4 p-4 bg-primary/5 border border-primary/20 flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pending App Selection Found</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{pendingAppOrder.items.length} Products • ₹{pendingAppOrder.total}</span>
                                <button
                                    onClick={importAppOrder}
                                    className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                >Add to Bill</button>
                            </div>
                        </motion.div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-text-muted">
                                <ShoppingCart className="w-12 h-12 mb-2" />
                                <p className="text-sm font-black uppercase tracking-widest text-center">Terminal Cart Empty</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="space-y-2 border-b border-border pb-3 last:border-0 group">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-text uppercase truncate tracking-tight">{item.name}</p>
                                                {item.isPackageRedemption && (
                                                    <span className="px-1.5 py-0.5 bg-amber-500 text-[8px] font-black text-white uppercase tracking-widest">Package</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] font-bold text-primary mt-0.5">
                                                {item.isPackageRedemption ? '₹0 (Redeemed)' : `₹${item.price * item.quantity}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center bg-surface-alt">
                                            <button onClick={() => updateQty(idx, -1)} className="p-1 px-2 hover:bg-border text-text-muted"><Minus className="w-3 h-3" /></button>
                                            <span className="px-2 text-xs font-black text-text">{item.quantity}</span>
                                            <button onClick={() => updateQty(idx, 1)} className="p-1 px-2 hover:bg-border text-text-muted"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => removeItem(idx)} className="p-1 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="text-[9px] font-black text-text-muted uppercase">Staff:</span>
                                            <select
                                                className="flex-1 bg-surface-alt border-none text-[10px] font-bold p-1 text-text focus:ring-0"
                                                value={item.staffId || ''}
                                                onChange={(e) => updateStaff(idx, e.target.value)}
                                            >
                                                <option value="">Select Stylist</option>
                                                {MOCK_STAFF.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        {packageEligibleItems.includes(item.name) && (
                                            <button
                                                onClick={() => togglePackageRedemption(idx)}
                                                className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest border transition-all ${item.isPackageRedemption ? 'bg-amber-500 text-white border-amber-500' : 'bg-surface-alt text-text-secondary border-border hover:border-amber-500 hover:text-amber-500'}`}
                                            >
                                                <Gift className="w-3 h-3" /> USE PKG
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-surface-alt border-t border-border space-y-4">
                        <div className="space-y-1.5 border-b border-border pb-3">
                            <div className="flex justify-between text-xs font-bold text-text-secondary">
                                <span>SUBTOTAL</span>
                                <span>₹{totals.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-text-secondary">
                                <span>GST ({taxPercent}%)</span>
                                <span>₹{totals.tax.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-text uppercase tracking-widest">Total Amount</h4>
                            <span className="text-2xl font-black text-primary tracking-tight">₹{totals.total.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Payment Split</label>
                                    <button onClick={addPaymentMethod} className="text-[9px] font-black text-primary uppercase hover:underline">Add Method +</button>
                                </div>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                    {payments.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-background border border-border p-1">
                                            <select
                                                value={p.method}
                                                onChange={(e) => updatePayment(i, 'method', e.target.value)}
                                                className="flex-1 bg-transparent border-none text-[10px] font-black p-1 text-text outline-none"
                                            >
                                                <option value="cash">CASH</option>
                                                <option value="online">ONLINE</option>
                                                <option value="card">CARD</option>
                                                <option value="wallet">WALLET</option>
                                            </select>
                                            <input
                                                type="number"
                                                value={p.amount}
                                                onChange={(e) => updatePayment(i, 'amount', Number(e.target.value))}
                                                className="w-24 text-right bg-transparent border-none text-xs font-black p-1 text-text outline-none focus:ring-0"
                                            />
                                            {payments.length > 1 && (
                                                <button onClick={() => removePayment(i)} className="p-1 text-rose-500 hover:bg-rose-50"><X className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {payments.reduce((s, p) => s + p.amount, 0) !== totals.total && (
                                    <p className="text-[9px] font-bold text-rose-500 italic">Remaining: ₹{totals.total - payments.reduce((s, p) => s + p.amount, 0)}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setShowDiscountModal(true)} className="py-2.5 bg-background border border-border font-black text-[10px] text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-alt active:scale-95 transition-all">
                                    <Percent className="w-3.5 h-3.5" /> OFFERS {(appliedPromotion || appliedVoucher || manualDiscount.value > 0) && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || checkingOut || payments.reduce((s, p) => s + p.amount, 0) !== totals.total}
                                    className="py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {checkingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    COMPLETE BILL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── Modals rendered outside panel flex but inside outer wrapper ─── */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-md p-0 animate-in zoom-in-95 duration-200 border border-border shadow-2xl overflow-hidden">
                        <div className="flex bg-surface-alt p-1 border-b border-border">
                            {['manual', 'promotions', 'vouchers'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setOfferTab(t)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${offerTab === t ? 'bg-background text-primary shadow-sm' : 'text-text-secondary hover:text-text'}`}
                                >{t}</button>
                            ))}
                            <button onClick={() => setShowDiscountModal(false)} className="px-4 text-text-muted hover:text-rose-500"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 h-[350px] overflow-y-auto scrollbar-thin">
                            {offerTab === 'manual' && (
                                <div className="space-y-6">
                                    <div className="bg-surface-alt p-4 border border-border">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block">Flat or Percentage Adjustment</label>
                                        <div className="flex border border-border bg-background">
                                            <select
                                                className="bg-surface-alt border-r border-border text-[10px] font-black p-3 text-text outline-none"
                                                value={manualDiscount.type}
                                                onChange={(e) => setManualDiscount({ ...manualDiscount, type: e.target.value })}
                                            >
                                                <option value="fixed">FLAT ₹</option>
                                                <option value="percentage">% OFF</option>
                                            </select>
                                            <input
                                                type="number"
                                                className="flex-1 p-3 text-sm font-bold bg-background text-text border-none focus:ring-0"
                                                value={manualDiscount.value}
                                                onChange={(e) => setManualDiscount({ ...manualDiscount, value: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className={`p-4 border transition-all ${redeemPoints > 0 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-blue-500/5 border-blue-500/10'}`}>
                                            <p className={`text-[9px] font-bold uppercase mb-1 ${redeemPoints > 0 ? 'text-white/80' : 'text-blue-500'}`}>Loyalty Points</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black">{selectedClient?.loyaltyPoints || 0} pts</span>
                                                <button
                                                    onClick={handleRedeemPoints}
                                                    className={`text-[9px] font-black uppercase underline ${redeemPoints > 0 ? 'text-white' : 'text-blue-600'}`}
                                                >
                                                    {redeemPoints > 0 ? 'Remove' : 'Redeem'}
                                                </button>
                                            </div>
                                            {redeemPoints > 0 && <p className="text-[10px] font-bold mt-1 text-white/90">-₹{redeemPoints}</p>}
                                        </div>
                                        <div className={`p-4 border transition-all ${redeemWallet > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                                            <p className={`text-[9px] font-bold uppercase mb-1 ${redeemWallet > 0 ? 'text-white/80' : 'text-emerald-500'}`}>Wallet Balance</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black">₹{selectedClient?.walletBalance || 0}</span>
                                                <button
                                                    onClick={handleRedeemWallet}
                                                    className={`text-[9px] font-black uppercase underline ${redeemWallet > 0 ? 'text-white' : 'text-emerald-600'}`}
                                                >
                                                    {redeemWallet > 0 ? 'Remove' : 'Apply'}
                                                </button>
                                            </div>
                                            {redeemWallet > 0 && <p className="text-[10px] font-bold mt-1 text-white/90">-₹{redeemWallet}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {offerTab === 'promotions' && (
                                <div className="space-y-3">
                                    {MOCK_PROMOTIONS.map(promo => (
                                        <button
                                            key={promo._id}
                                            onClick={() => setAppliedPromotion(appliedPromotion?._id === promo._id ? null : promo)}
                                            className={`w-full p-4 border text-left transition-all relative overflow-hidden group ${appliedPromotion?._id === promo._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-xs font-black text-text uppercase tracking-tight">{promo.name}</h4>
                                                {appliedPromotion?._id === promo._id && <Check className="w-4 h-4 text-primary" />}
                                            </div>
                                            <p className="text-[10px] font-bold text-text-muted">Min Bill: ₹{promo.minBill} • Value: {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {offerTab === 'vouchers' && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Voucher Code..."
                                            className="flex-1 p-3 bg-background border border-border text-xs font-black uppercase outline-none focus:border-primary"
                                            value={voucherCodeInput}
                                            onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            onClick={() => {
                                                const v = MOCK_VOUCHERS.find(x => x.code === voucherCodeInput);
                                                if (v) setAppliedVoucher(v);
                                                else alert('Invalid Voucher Code');
                                            }}
                                            className="px-6 bg-text text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                                        >Apply</button>
                                    </div>
                                    {appliedVoucher && (
                                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Voucher</p>
                                                <p className="text-xs font-bold text-text">{appliedVoucher.code} (-{appliedVoucher.type === 'percentage' ? `${appliedVoucher.value}%` : `₹${appliedVoucher.value}`})</p>
                                            </div>
                                            <button onClick={() => setAppliedVoucher(null)}><X className="w-4 h-4 text-rose-500" /></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase">Total Reductions</p>
                                <p className="text-xl font-black text-primary">₹{(totals.discount + (redeemPoints || 0) + (redeemWallet || 0)).toFixed(0)}</p>
                            </div>
                            <button onClick={() => setShowDiscountModal(false)} className="px-10 py-3 bg-text text-background font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-black/10 active:scale-95 transition-all">
                                Confirm & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* New Client Modal */}
            {showNewClient && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <form onSubmit={handleQuickCreate} className="bg-surface w-full max-w-sm p-0 shadow-2xl animate-in zoom-in-95 duration-200 border border-border overflow-hidden">
                        <div className="p-6 bg-surface-alt border-b border-border flex items-center justify-between">
                            <h3 className="font-black text-text uppercase tracking-widest text-xs flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-primary" /> Create Quick Client
                            </h3>
                            <button type="button" onClick={() => setShowNewClient(false)}><X className="w-5 h-5 text-text-muted" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name *</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    className="w-full p-3 bg-background border border-border text-sm font-bold text-text outline-none focus:border-primary uppercase tracking-tighter"
                                    value={newClientForm.name}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number *</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full p-3 bg-background border border-border text-sm font-bold text-text outline-none focus:border-primary"
                                    value={newClientForm.phone}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="w-full p-3 bg-background border border-border text-sm font-bold text-text outline-none focus:border-primary"
                                    value={newClientForm.email}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border">
                            <button type="submit" className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                                Register & Select Client
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
