import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    Scissors, Package, Check, Loader2, Scan,
    Sparkles, User, UserPlus, ArrowRight, Percent, Info,
    Tag, Star, Wallet, Printer, Banknote, Smartphone, FileText, Download,
    ShoppingBag, CreditCard, Ticket, Gift, History, Calendar, Globe, Building2, ChevronDown,
    AlertTriangle, CheckCircle2, UserMinus, LayoutGrid
} from 'lucide-react';
import api from '../../services/api';
import {
    MOCK_COMPANY_INFO
} from '../../data/posData';
import { useInventory } from '../../contexts/InventoryContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useFinance } from '../../contexts/FinanceContext';
import { maskPhone } from '../../utils/phoneUtils';
import {
    Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf, Font
} from '@react-pdf/renderer';
import { useWallet } from '../../contexts/WalletContext';
import { POSReceiptPDF } from './POSInvoicesPage';
import { getImageUrl } from '../../utils/imageUtils';
import { calculateTotals } from '../../utils/billingCalc';

// Thermal receipts often use standard characters to ensure maximum compatibility across all printers
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

const InvoicePDF = ({ invoice, role, salon, taxRate = 18 }) => (
    <Document>
        <Page size={[226, 800]} style={pdfStyles.page}>
            <View style={pdfStyles.centered}>
                <Text style={pdfStyles.salonName}>{salon?.name || 'SALON'}</Text>
                <Text style={pdfStyles.salonMeta}>{invoice.outlet || ''}</Text>
                <Text style={pdfStyles.salonMeta}>Ph: {salon?.phone || ''}</Text>
                <Text style={pdfStyles.salonMeta}>GSTIN: {salon?.gstNumber || 'N/A'}</Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Invoice:</Text>
                <Text style={pdfStyles.value}>#{invoice?.number || 'N/A'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Date:</Text>
                <Text style={pdfStyles.value}>{invoice?.date || 'N/A'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Customer:</Text>
                <Text style={pdfStyles.value}>{invoice?.client?.name?.toUpperCase() || 'WALK-IN CLIENT'}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Payment:</Text>
                <Text style={pdfStyles.value}>{invoice?.payments?.[0]?.method?.toUpperCase() || 'CASH'}</Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.tableHeader}>
                <Text style={pdfStyles.colDesc}>DESCRIPTION</Text>
                <Text style={pdfStyles.colPrice}>AMOUNT</Text>
            </View>

            {invoice?.items?.map((item, i) => (
                <View key={i} style={pdfStyles.tableRow}>
                    <View style={pdfStyles.itemMainRow}>
                        <Text style={pdfStyles.colDesc}>{item?.name?.toUpperCase() || 'SERVICE'} {item?.isInclusiveTax ? '(INCL. GST)' : ''}</Text>
                        <Text style={pdfStyles.colPrice}>Rs. {(item?.price * item?.quantity || 0).toFixed(0)}</Text>
                    </View>
                    <View style={pdfStyles.itemSubRow}>
                        <Text>Qty: {item?.quantity || 1} x {item?.price || 0}</Text>
                        <Text>Stylist: {item?.staffName || 'N/A'}</Text>
                    </View>
                </View>
            ))}

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>Rs. {invoice?.totals?.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            {(invoice.discounts?.manual?.value > 0 || invoice.discounts?.points > 0 || invoice.discounts?.wallet > 0) && (
                <View style={pdfStyles.summaryRow}>
                    <Text>Total Discount</Text>
                    <Text>-Rs. {(Number(invoice.discounts?.manual?.value || 0) + Number(invoice.discounts?.points || 0) + Number(invoice.discounts?.wallet || 0)).toFixed(2)}</Text>
                </View>
            )}

            <View style={pdfStyles.summaryRow}>
                <Text>Base Amount</Text>
                <Text>Rs. {invoice?.totals?.baseAmount?.toFixed(2) || invoice?.totals?.taxable?.toFixed(2) || '0.00'}</Text>
            </View>

            {invoice?.totals?.isSameState ? (
                <>
                    <View style={pdfStyles.summaryRow}>
                        <Text>CGST ({taxRate / 2}%)</Text>
                        <Text>Rs. {invoice?.totals?.cgst?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={pdfStyles.summaryRow}>
                        <Text>SGST ({taxRate / 2}%)</Text>
                        <Text>Rs. {invoice?.totals?.sgst?.toFixed(2) || '0.00'}</Text>
                    </View>
                </>
            ) : (
                <View style={pdfStyles.summaryRow}>
                    <Text>IGST ({taxRate}%)</Text>
                    <Text>Rs. {invoice?.totals?.igst?.toFixed(2) || '0.00'}</Text>
                </View>
            )}

            <View style={pdfStyles.grandTotal}>
                <Text>TOTAL {invoice?.includingGst ? '(INCL. GST)' : ''}</Text>
                <Text>Rs. {invoice?.totals?.total?.toFixed(0) || '0'}</Text>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.thanks}>THANK YOU! VISIT AGAIN :)</Text>
                <Text>This is a computer generated receipt.</Text>
                <Text>Generated by Wapixo POS</Text>
            </View>
        </Page>
    </Document>
);

const autoSendWhatsAppInvoice = async (dbInvoice, salon) => {
    const phone = dbInvoice?.customerId?.phone;
    if (!phone) {
        console.log('[Auto-WhatsApp] No client phone number found.');
        return;
    }

    console.log(`[Frontend-POSBillingPage] autoSendWhatsAppInvoice initiated for Invoice: ${dbInvoice.invoiceNumber}, Phone: ${phone}`);
    const toastId = toast.loading('Sending invoice on WhatsApp...');
    try {
        // 1. Generate PDF blob (using POS receipt for WhatsApp)
        const blob = await pdf(<POSReceiptPDF invoice={dbInvoice} salon={salon} />).toBlob();
        console.log(`[Frontend-POSBillingPage] Generated POS receipt PDF blob size: ${blob.size} bytes`);

        // 2. Prepare Form Data
        const formData = new FormData();
        formData.append('pdf', blob, `Invoice_${dbInvoice.invoiceNumber || 'receipt'}.pdf`);

        // 3. Call API to send WhatsApp
        const requestUrl = `/pos/invoices/${dbInvoice._id}/send-whatsapp`;
        console.log(`[Frontend-POSBillingPage] Sending POST request to ${requestUrl}`);
        const response = await api.post(requestUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log(`[Frontend-POSBillingPage] API Response:`, response.data);

        if (response.data.success) {
            toast.success('Invoice sent on WhatsApp automatically!', { id: toastId });
        } else {
            toast.error(response.data.message || 'Failed to send WhatsApp invoice', { id: toastId });
        }
    } catch (error) {
        console.error('[Frontend-POSBillingPage] Error sending WhatsApp invoice:', error);
        toast.error(error.response?.data?.message || 'Error sending WhatsApp invoice', { id: toastId });
    }
};

export default function POSBillingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addSaleRecord, products } = useInventory();
    const {
        salon,
        services,
        customers: businessCustomers,
        addCustomer: addBusinessCustomer,
        outlets,
        activeOutlet,
        activeOutletId,
        setActiveOutletId,
        staff: businessStaff,
        bookings: businessBookings,
        invoices,
        orders: businessOrders,
        platformSettings,
        fetchPlatformSettings,
        fetchInvoices,
        fetchOrders,
        fetchBookings,
        fetchServices,
        fetchCustomers,
        fetchProducts,
        fetchStaff
    } = useBusiness();
    const { addRevenue } = useFinance();
    const { allWallets, adminAdjustBalance, initializeWallet } = useWallet();
    const location = useLocation();
    // ─── State ──────────────────────────────────────────────
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [payments, setPayments] = useState([{ method: 'cash', amount: 0 }]);
    const [isManualPayment, setIsManualPayment] = useState(false);
    const [activeMembership, setActiveMembership] = useState(null);
    // Fiscal Settings (from localStorage)
    const fiscal = useMemo(() => {
        const saved = localStorage.getItem('pos_fiscal_settings');
        const base = saved ? JSON.parse(saved) : {
            businessName: 'XYZ SALON & SPA',
            gstin: '09AAFCC0301F1ZN',
            state: 'Uttar Pradesh',
            stateCode: '09',
            serviceGst: 5,
            productGst: 10,
            inclusiveTax: false
        };

        // Override with platform settings if available
        if (platformSettings) {
            return {
                ...base,
                serviceGst: Number(platformSettings.serviceGst || base.serviceGst),
                productGst: Number(platformSettings.productGst || base.productGst),
                inclusiveTax: platformSettings.inclusiveTax !== undefined ? platformSettings.inclusiveTax : base.inclusiveTax
            };
        }
        return base;
    }, [platformSettings]);

    const taxPercent = useMemo(() => {
        // Return service rate by default for backward compatibility where a single rate is expected
        return Number(platformSettings?.serviceGst ?? fiscal?.serviceGst ?? 5);
    }, [platformSettings, fiscal]);
    const [customerGstin, setCustomerGstin] = useState('');
    const [customerState, setCustomerState] = useState('Uttar Pradesh'); // Default to Salon State
    const [pendingAppOrder, setPendingAppOrder] = useState(null);
    const [showOutletPickerMain, setShowOutletPickerMain] = useState(false);

    useEffect(() => {
        if (!platformSettings) {
            fetchPlatformSettings();
        }
        // Fetch staff and customers to ensure POS is ready
        fetchStaff?.();
        if (!businessCustomers || businessCustomers.length === 0) {
            fetchCustomers?.();
        }
    }, [platformSettings, fetchPlatformSettings, fetchStaff, businessCustomers, fetchCustomers]);


    useEffect(() => {
        if (selectedClient?._id) {
            const fetchActiveMembership = async () => {
                try {
                    const res = await api.get(`/loyalty/membership/active?customerId=${selectedClient._id}`);
                    if (res.data.success && res.data.data) {
                        setActiveMembership(res.data.data);
                    } else {
                        setActiveMembership(null);
                    }
                } catch (err) {
                    console.error("Membership fetch error:", err);
                    setActiveMembership(null);
                }
            };
            fetchActiveMembership();
        } else {
            setActiveMembership(null);
        }
    }, [selectedClient]);

    useEffect(() => {
        if (fiscal.state) setCustomerState(fiscal.state);
        // Refresh data to accurately filter billed items
        fetchInvoices?.();
        fetchOrders?.();
        fetchBookings?.();
        fetchCustomers?.(1, 1000); // Fetch a larger batch for POS search
        if (salon?._id) {
            fetchServices?.(salon._id, null); // Fetch all services for the salon
            fetchProducts?.(salon._id, null); // Fetch all products for the salon
        }
    }, [fiscal, activeOutletId, salon?._id]); // Removed function dependencies to prevent potential re-run loops

    // UI State
    const [activeTab, setActiveTab] = useState('services');
    const [isSubmittingClient, setIsSubmittingClient] = useState(false);
    const [serviceMode, setServiceMode] = useState('bookings'); // 'catalog' | 'bookings' | 'orders'    
    const [searchItem, setSearchItem] = useState('');
    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkingOut, setCheckingOut] = useState(false);
    const [successInvoice, setSuccessInvoice] = useState(null);
    const [showNewClient, setShowNewClient] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [showClientInfo, setShowClientInfo] = useState(true);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [mobileView, setMobileView] = useState('items'); // 'items' | 'cart'
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const [isBarcodeMode, setIsBarcodeMode] = useState(false);
    const [lastScannedItem, setLastScannedItem] = useState(null);
    const [showQuickInvoice, setShowQuickInvoice] = useState(false);

    // Prevent background scroll when any modal is open
    const isAnyModalOpen = showDiscountModal || showCameraScanner || !!successInvoice || showNewClient || showQuickInvoice;

    useEffect(() => {
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100vh'; // Extra safety for mobile
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = '';
        };
    }, [isAnyModalOpen]);
    const [scanError, setScanError] = useState(null);

    // Discount/Redemption
    const [manualDiscount, setManualDiscount] = useState({ type: 'fixed', value: 0 });
    const [offerTab, setOfferTab] = useState('manual');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [redeemWallet, setRedeemWallet] = useState(0);
    const [appointmentId, setAppointmentId] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [selectedBookingIds, setSelectedBookingIds] = useState([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);

    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) return;
        setApplyingCoupon(true);
        try {
            const res = await api.post('/promotions/validate-coupon', {
                couponCode: couponCodeInput.trim().toUpperCase(),
                outletId: activeOutletId || undefined,
                customerId: selectedClient?._id || undefined,
                items: cart.map(item => ({
                    type: item.type, // 'service' or 'product'
                    price: item.price,
                    quantity: item.quantity
                }))
            });

            if (res.data.success && res.data.data) {
                const { promotion, discount } = res.data.data;
                setAppliedPromotion(promotion);
                toast.success(`Coupon "${promotion.name}" applied successfully! Discount: ₹${discount}`);
                setCouponCodeInput('');
            } else {
                toast.error('Failed to validate coupon');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Invalid or expired coupon code';
            toast.error(msg);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', dob: '', anniversary: '' });

    // Billing & Payment System Updates
    const [includePreviousDue, setIncludePreviousDue] = useState(false);
    const [paymentDate, setPaymentDate] = useState('');
    const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
    const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);

    // ── Handle Incoming Navigation State (from Appointments) ──
    useEffect(() => {
        if (location.state?.preSelectClient) {
            const { name, phone } = location.state.preSelectClient;
            // Attempt to find existing client or create partial
            const existingClient = businessCustomers.find(c => c.phone === phone);
            if (existingClient) {
                setSelectedClient(existingClient);
                setShowClientInfo(true);
            } else {
                setSelectedClient({ name, phone, email: '', loyaltyPoints: 0, walletBalance: 0, dueAmount: 0 });
                setShowClientInfo(true);
            }

            // If a service was pre-selected, add it to cart
            if (location.state.preSelectService) {
                const serviceName = location.state.preSelectService;
                // Handle different possible ways services are listed
                const serviceObj = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
                if (serviceObj) {
                    const preSelectStaffId = location.state.preSelectStaffId;
                    setCart([{
                        ...serviceObj,
                        itemId: serviceObj.id || serviceObj._id,
                        quantity: 1,
                        type: 'service',
                        staffIds: preSelectStaffId ? [preSelectStaffId] : []
                    }]);
                }
            }
            // If an appointmentId was passed, store it for status updates
            if (location.state.appointmentId) {
                setAppointmentId(location.state.appointmentId);
            }
        }
    }, [location.state]);

    // Refs
    const searchInputRef = useRef(null);
    const clientInputRef = useRef(null);
    const html5QrScannerRef = useRef(null);

    // ─── Audio Feedback ───────────────────────────────────────────
    const playSuccessBeep = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.warn('Audio feedback failed', e);
        }
    };
    const openCameraScanner = () => {
        setShowCameraScanner(true);
    };

    const closeCameraScanner = async () => {
        if (html5QrScannerRef.current) {
            try {
                await html5QrScannerRef.current.stop();
                html5QrScannerRef.current.clear();
            } catch (_) { /* scanner may already be stopped */ }
            html5QrScannerRef.current = null;
        }
        setShowCameraScanner(false);
    };

    // Start html5-qrcode after DOM element is mounted
    useEffect(() => {
        if (!showCameraScanner) return;

        let mounted = true;
        import('html5-qrcode').then(({ Html5Qrcode }) => {
            if (!mounted) return;
            const scanner = new Html5Qrcode('qr-scanner-region');
            html5QrScannerRef.current = scanner;

            scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => {
                    // Barcode successfully scanned!
                    closeCameraScanner();
                    const product = products.find(p => p.barcode === decodedText || p.sku === decodedText);
                    if (product) {
                        addToCart(product, 'product');
                    } else {
                        setSearchItem(decodedText); // Show in search if not found
                    }
                },
                (_errorMsg) => { /* frame decode errors are normal, ignore */ }
            ).catch((err) => {
                console.error('Scanner start failed:', err);
                alert('Camera access denied. Please allow camera permission and try again.');
                setShowCameraScanner(false);
            });
        });

        return () => {
            mounted = false;
            if (html5QrScannerRef.current) {
                html5QrScannerRef.current.stop().catch(() => { }).finally(() => {
                    html5QrScannerRef.current?.clear();
                    html5QrScannerRef.current = null;
                });
            }
        };
    }, [showCameraScanner]);

    // ─── Calculations ──────────────────────────────────────
    const totals = useMemo(() => {
        return calculateTotals({
            items: cart,
            manualDiscount,
            appliedPromotion,
            appliedVoucher,
            activeMembership,
            serviceGstRate: Number(platformSettings?.serviceGst ?? fiscal.serviceGst ?? 5),
            productGstRate: Number(platformSettings?.productGst ?? fiscal.productGst ?? 10),
            inclusiveTaxFallback: !!fiscal.inclusiveTax,
            customerState,
            salonState: fiscal.state,
            includePreviousDue,
            previousDue: selectedClient?.dueAmount || 0,
            redeemWallet,
            payments
        });
    }, [cart, manualDiscount, appliedPromotion, appliedVoucher, activeMembership, redeemWallet, taxPercent, selectedClient, includePreviousDue, fiscal, platformSettings, customerState, payments]);

    // Get real-time wallet balance
    const clientWalletBalance = useMemo(() => {
        if (!selectedClient?._id) return 0;
        return (allWallets || {})[selectedClient._id]?.balance || 0;
    }, [selectedClient, allWallets]);

    // Sync payment amount to total unless manually edited by user
    useEffect(() => {
        if (!isManualPayment && payments.length === 1) {
            setPayments([{ ...payments[0], amount: totals.total }]);
        }
    }, [totals.total, isManualPayment, payments.length]);

    // Main Terminal Overpayment Warning Toast
    useEffect(() => {
        const mainPaidAmount = payments.reduce((s, p) => s + p.amount, 0);
        const mainTotalLiability = totals.total - totals.redeemWallet + (includePreviousDue ? Number(selectedClient?.dueAmount || 0) : 0);
        const overpaidDiff = Math.round((mainPaidAmount - mainTotalLiability) * 100) / 100;
        if (overpaidDiff > 0) {
            toast(`Info: Total payment exceeds total liability by ₹${overpaidDiff.toFixed(2)}`, {
                id: 'main-overpaid-toast',
                icon: 'ℹ️',
                duration: 2000
            });
        }
    }, [payments, totals.total, totals.redeemWallet, selectedClient?.dueAmount, includePreviousDue]);


    useEffect(() => {
        setIncludePreviousDue(false);
    }, [selectedClient]);

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
    const handleBarcodeSearch = (value) => {
        if (!value) return;

        const cleanValue = value.trim();
        const product = products.find(p => p.barcode === cleanValue || p.sku === cleanValue);

        if (product) {
            addToCart(product, 'product');
            setLastScannedItem(product);
            playSuccessBeep();
            setSearchItem('');
            setScanError(null);

            // Clear result after 3 seconds
            setTimeout(() => setLastScannedItem(null), 3000);
            return true;
        }
        return false;
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            const found = handleBarcodeSearch(searchItem);
            if (!found && isBarcodeMode) {
                setScanError(`Barcode "${searchItem}" not found`);
                setTimeout(() => setScanError(null), 3000);
                setSearchItem('');
            }
        }
    };

    // Auto-search for barcodes of specific length if not in manual mode
    useEffect(() => {
        if (!searchItem || searchItem.length < 8) return; // Most barcodes are 8, 12, or 13 digits

        // Physical scanners are very fast, so if it finishes quickly we can auto-process
        const timer = setTimeout(() => {
            if (isBarcodeMode) {
                handleBarcodeSearch(searchItem);
            }
        }, 50); // Minimal delay to allow buffer completion

        return () => clearTimeout(timer);
    }, [searchItem, isBarcodeMode]);

    // ─── Filters & Search ────────────────────────────────────
    const allOutletItems = useMemo(() => {
        const items = activeTab === 'services' ? services : products;
        const itemsList = Array.isArray(items) ? items : [];
        if (!activeOutletId) return itemsList;

        return itemsList.filter(item => {
            const itemOutletIds = item.outletIds || [];
            const itemOutletId = item.outletId?._id || item.outletId;

            // If no outlet restriction, show everywhere
            if (itemOutletIds.length === 0 && !itemOutletId) return true;

            // Check plural outletIds
            const matchPlural = itemOutletIds.some(id => String(id?._id || id) === String(activeOutletId));
            // Check singular outletId
            const matchSingular = itemOutletId && String(itemOutletId) === String(activeOutletId);

            return matchPlural || matchSingular;
        });
    }, [activeTab, services, products, activeOutletId]);

    const categories = useMemo(() => {
        if (activeTab === 'services' && serviceMode === 'bookings') {
            return ['All', 'Completed', 'Payment Success'];
        }
        return ['All', ...new Set(allOutletItems.map(i => i.category).filter(Boolean))];
    }, [activeTab, allOutletItems, serviceMode]);

    const filteredItems = useMemo(() => {
        if (activeTab === 'services' && serviceMode === 'bookings') {
            const list = Array.isArray(businessBookings) ? businessBookings : [];
            return list.filter(b => {
                const isPaid = b.paymentStatus?.toLowerCase() === 'paid';
                if (!isPaid) return false;

                // Show all completed bookings (addToCart will switch outlet automatically)
                // const matchOutlet = !activeOutletId || String(b.outletId?._id || b.outletId) === String(activeOutletId);
                // if (!matchOutlet) return false;

                const alreadyBilled = (invoices || []).some(inv => String(inv.bookingId?._id || inv.bookingId) === String(b._id));
                if (alreadyBilled) return false;
                const clientName = b.clientId?.name || b.clientName || 'Walk-in';
                const serviceName = b.serviceId?.name || b.serviceName || 'Service';
                const st = searchItem.toLowerCase().replace(/\s+/g, '');
                return !st ||
                    clientName.toLowerCase().replace(/\s+/g, '').includes(st) ||
                    serviceName.toLowerCase().replace(/\s+/g, '').includes(st);
            }).map(b => ({
                ...b,
                _id: b._id,
                name: `${b.serviceId?.name || b.serviceName || 'Service'} (${b.clientId?.name || b.clientName || 'Walk-in'})`,
                price: b.price || b.totalPrice || 0,
                type: 'service',
                // Look up latest settings from master service list
                ...(() => {
                    const sDef = services.find(s => String(s._id) === String(b.serviceId?._id || b.serviceId));
                    return {
                        isInclusiveTax: sDef ? sDef.isInclusiveTax : b.serviceId?.isInclusiveTax,
                        gst: sDef ? sDef.gst : b.serviceId?.gst
                    };
                })(),
                isAppointment: true,
                customerPhone: b.clientId?.phone || b.clientPhone || '',
                originalBooking: b
            }));
        }

        if (activeTab === 'services' && serviceMode === 'orders') {
            const list = Array.isArray(businessOrders) ? businessOrders : [];
            return list.filter(o => {
                const isPaid = o.paymentStatus?.toLowerCase() === 'paid';
                if (!isPaid) return false;

                // Show all completed orders (addToCart will switch outlet automatically)
                // const matchOutlet = !activeOutletId || String(o.outletId?._id || o.outletId) === String(activeOutletId);
                // if (!matchOutlet) return false;

                const alreadyBilled = (invoices || []).some(inv => String(inv.orderId?._id || inv.orderId) === String(o._id));
                if (alreadyBilled) return false;
                const clientName = o.customerId?.name || 'Walk-in';
                const orderLabel = `Order #${o._id.toString().slice(-6).toUpperCase()}`;
                const st = searchItem.toLowerCase().replace(/\s+/g, '');
                return !st ||
                    clientName.toLowerCase().replace(/\s+/g, '').includes(st) ||
                    orderLabel.toLowerCase().replace(/\s+/g, '').includes(st);
            }).map(o => ({
                ...o,
                _id: o._id,
                name: `Order #${o._id.toString().slice(-6).toUpperCase()} (${o.customerId?.name || 'Walk-in'})`,
                price: o.totalAmount || 0,
                type: 'product',
                customerPhone: o.customerId?.phone || '',
                isOrder: true,
                originalOrder: o
            }));
        }

        return allOutletItems.filter(item => {
            const st = searchItem.toLowerCase().replace(/\s+/g, '');
            const matchSearch = !st ||
                item.name?.toLowerCase().replace(/\s+/g, '').includes(st) ||
                (item.sku && item.sku.toLowerCase().replace(/\s+/g, '').includes(st));
            const matchCat = selectedCategory === 'All' || item.category === selectedCategory;

            return matchSearch && matchCat;
        });
    }, [activeTab, searchItem, selectedCategory, serviceMode, businessBookings, businessOrders, invoices, allOutletItems, activeOutletId, services]);

    const filteredClients = useMemo(() => {
        const clientsList = Array.isArray(businessCustomers) ? businessCustomers : [];
        const bookingsList = Array.isArray(businessBookings) ? businessBookings : [];

        // Match clients who have a confirmed or completed booking
        const servicedClientIds = new Set();
        bookingsList.forEach(b => {
            const status = (b.status || '').toLowerCase();
            if (status === 'completed' || status === 'confirmed') {
                const cid = b.clientId?._id || b.clientId || b.client?._id || b.client;
                if (cid) servicedClientIds.add(String(cid._id || cid));
            }
        });

        const servicedClients = clientsList.filter(c =>
            servicedClientIds.has(String(c._id || c.id))
        );

        const st = searchClient?.trim().toLowerCase().replace(/\s+/g, '');
        if (!st) return servicedClients.slice(0, 5);

        return servicedClients.filter(c => {
            const nameMatch = c.name?.toLowerCase().replace(/\s+/g, '').includes(st);
            const phoneMatch = c.phone?.replace(/\D/g, '').includes(st.replace(/\D/g, ''));
            return nameMatch || phoneMatch;
        });
    }, [searchClient, businessCustomers, businessBookings]);

    // ─── Staff Filtering & Availability ───
    const availableStaff = useMemo(() => {
        const staffList = Array.isArray(businessStaff) ? businessStaff : [];
        return staffList.filter(s => {
            if (s.status === 'inactive') return false;
            // Filter by outlet
            if (activeOutletId) {
                const sOid = String(s.outletId?._id || s.outletId);
                return sOid === String(activeOutletId);
            }
            return true;
        });
    }, [businessStaff, activeOutletId]);

    // ─── Cart Logic ────────────────────────────────────────
    const addToCart = (item, forcedType) => {
        if (item.isAppointment) {
            const isAlreadySelected = selectedBookingIds.includes(item._id);
            if (isAlreadySelected) {
                // DESELECT: Remove booking ID and its cart items
                setSelectedBookingIds(prev => prev.filter(id => id !== item._id));
                setCart(prev => prev.filter(c => c.appointmentId !== item._id));
                if (appointmentId === item._id) setAppointmentId(null);
            } else {
                // SELECT: Add booking ID and its cart item
                if (item.clientId?._id || item.clientId) {
                    const clientIdStr = String(item.clientId?._id || item.clientId);
                    const client = businessCustomers.find(c => String(c._id || c.id) === clientIdStr);
                    if (client) {
                        setSelectedClient(client);
                    } else {
                        setSelectedClient({
                            _id: clientIdStr,
                            name: item.clientName || item.clientId?.name || 'Walk-in',
                            phone: item.clientPhone || item.clientId?.phone || '',
                            loyaltyPoints: 0,
                            walletBalance: 0,
                            dueAmount: 0
                        });
                    }
                    setShowClientInfo(true);
                }
                const staffId = item.staffId?._id || item.staffId;
                const newCartItem = {
                    ...item,
                    itemId: item.serviceId?._id || item.serviceId || item._id,
                    type: 'service',
                    quantity: 1,
                    staffIds: staffId ? [staffId] : [],
                    appointmentId: item._id
                };
                setCart(prev => [...prev, newCartItem]);
                const bookingOutletId = item.outletId?._id || item.outletId;
                if (bookingOutletId) setActiveOutletId(String(bookingOutletId), { quiet: true, background: true });
                setSelectedBookingIds(prev => [...prev, item._id]);
                setAppointmentId(item._id);
                setOrderId(null);
            }
            return;
        }

        if (item.isOrder) {
            const isAlreadySelected = selectedOrderIds.includes(item._id);
            if (isAlreadySelected) {
                // DESELECT: Remove order ID and its cart items
                setSelectedOrderIds(prev => prev.filter(id => id !== item._id));
                setCart(prev => prev.filter(c => c.orderId !== item._id));
                if (orderId === item._id) setOrderId(null);
            } else {
                // SELECT: Add order ID and its cart items
                if (item.customerId?._id || item.customerId) {
                    const customerIdStr = String(item.customerId?._id || item.customerId);
                    const client = businessCustomers.find(c => String(c._id || c.id) === customerIdStr);
                    if (client) {
                        setSelectedClient(client);
                    } else {
                        setSelectedClient({
                            _id: customerIdStr,
                            name: item.customerId?.name || 'Walk-in',
                            phone: item.customerId?.phone || '',
                            loyaltyPoints: 0,
                            walletBalance: 0,
                            dueAmount: 0
                        });
                    }
                    setShowClientInfo(true);
                }
                const newCartItems = (item.items || []).map(oi => {
                    const product = products.find(p => String(p._id) === String(oi.productId?._id || oi.productId));
                    return {
                        ...(product || {}),
                        name: oi.productId?.name || product?.name || 'Product',
                        price: oi.price || product?.price || 0,
                        itemId: oi.productId?._id || product?._id,
                        type: 'product',
                        quantity: oi.quantity || 1,
                        staffIds: [''],
                        orderId: item._id
                    };
                }).filter(i => i.itemId);

                const orderOutletId = item.outletId?._id || item.outletId;
                if (orderOutletId) setActiveOutletId(String(orderOutletId), { quiet: true, background: true });
                setCart(prev => [...prev, ...newCartItems]);
                setSelectedOrderIds(prev => [...prev, item._id]);
                setOrderId(item._id);
                setAppointmentId(null);
            }
            return;
        }

        const type = forcedType || (activeTab === 'services' ? 'service' : 'product');
        const itemId = item.id || item._id;
        const existingId = cart.findIndex(c => c.itemId === itemId && c.type === type);

        if (existingId > -1) {
            const newCart = [...cart];
            newCart[existingId].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                ...item,
                itemId: item.id || item._id,
                type,
                quantity: 1,
                staffIds: [''],
                commission: item.commission || 0
            }]);
        }
    };

    const updateQty = (idx, delta) => {
        const newCart = [...cart];
        newCart[idx].quantity = Math.max(1, newCart[idx].quantity + delta);
        setCart(newCart);
    };

    const updateItemMembershipDiscount = (idx, type, value) => {
        const newCart = [...cart];
        newCart[idx] = {
            ...newCart[idx],
            membershipDiscountType: type,
            membershipDiscountValue: Number(value) || 0
        };
        setCart(newCart);
    };

    const removeItem = (idx) => {
        setCart(cart.filter((_, i) => i !== idx));
    };

    const updateStaff = (cartIdx, staffArrIdx, staffId) => {
        const newCart = [...cart];
        const ids = [...(newCart[cartIdx].staffIds || [])];
        ids[staffArrIdx] = staffId;
        newCart[cartIdx].staffIds = ids;
        setCart(newCart);
    };

    const addStaff = (cartIdx) => {
        const newCart = [...cart];
        newCart[cartIdx].staffIds = [...(newCart[cartIdx].staffIds || []), ''];
        setCart(newCart);
    };

    const removeStaff = (cartIdx, staffArrIdx) => {
        const newCart = [...cart];
        const ids = [...(newCart[cartIdx].staffIds || [])];
        ids.splice(staffArrIdx, 1);
        newCart[cartIdx].staffIds = ids;
        setCart(newCart);
    };

    const togglePackageRedemption = (idx) => {
        const newCart = [...cart];
        newCart[idx].isPackageRedemption = !newCart[idx].isPackageRedemption;
        setCart(newCart);
    };

    // ─── Redemption Logic ──────────────────────────────────
    const handleRedeemWallet = () => {
        if (!selectedClient) return;
        if (redeemWallet > 0) {
            setRedeemWallet(0);
        } else {
            const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
            const maxRedeemable = Math.max(0, totals.total - totalPaid);
            setRedeemWallet(Math.min(clientWalletBalance, maxRedeemable));
        }
    };

    const addPaymentMethod = () => {
        setPayments([...payments, { method: 'online', amount: 0 }]);
    };

    const updatePayment = (idx, field, value) => {
        const newPayments = [...payments];
        newPayments[idx][field] = value;
        setPayments(newPayments);
        if (field === 'amount') {
            setIsManualPayment(true);
        }
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
        if (!paymentDate) {
            alert('Please select a payment date');
            return;
        }
        const paidAmount = payments.reduce((s, p) => s + p.amount, 0);

        // Allow partial payment
        const balanceDue = totals.total - paidAmount;

        setCheckingOut(true);
        setTimeout(async () => {
            try {
                // Robust Outlet ID determination
                const finalOutletId = activeOutlet?._id || activeOutletId || (outlets.length > 0 ? outlets[0]._id : user?.outletId);

                if (!finalOutletId) {
                    alert('CRITICAL: Outlet ID not detected. Please select an outlet.');
                    setCheckingOut(false);
                    return;
                }

                const getSelectedPaymentDate = (dateStr) => {
                    if (!dateStr) return new Date();
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const dateObj = new Date();
                    dateObj.setFullYear(year, month - 1, day);
                    return dateObj;
                };

                const actualPaymentDate = getSelectedPaymentDate(paymentDate);

                // Prepare Backend Request Body - Only include valid keys
                const checkoutPayload = {
                    clientId: selectedClient._id,
                    outletId: String(finalOutletId),
                    createdAt: actualPaymentDate.toISOString(),
                    items: cart.map(item => {
                        const itemTaxRate = ((item.type === 'service' ? totals.serviceGstRate : totals.productGstRate) / 100);
                        const isItemInclusive = String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal.inclusiveTax);
                        // If inclusive, we use full price as base price so that no extra tax is calculated/shown
                        const basePrice = item.price;

                        const baseItem = {
                            type: item.type,
                            itemId: item.id || item._id,
                            name: item.name,
                            price: basePrice,
                            quantity: item.quantity,
                            gstPercent: item.type === 'service' ? totals.serviceGstRate : totals.productGstRate,
                            isInclusiveTax: isItemInclusive,
                            membershipDiscountType: item.membershipDiscountType,
                            membershipDiscountValue: item.membershipDiscountValue
                        };
                        const sIds = (item.staffIds || []).filter(Boolean).map(id => typeof id === 'object' ? id?._id : String(id));
                        if (sIds.length > 0) {
                            baseItem.stylistIds = sIds;
                        }
                        return baseItem;
                    }),
                    tax: totals.totalExclusiveTax,
                    gstPercent: totals.serviceGstRate, // Use service rate as default
                    includingGst: totals.includingGst,
                    baseAmount: totals.baseAmount,
                    gstAmount: totals.gstAmount,
                    cgst: totals.cgst,
                    sgst: totals.sgst,
                    serviceGstPercent: totals.serviceGstRate,
                    productGstPercent: totals.productGstRate,
                    subtotal: totals.subtotal,
                    payments: payments.map(p => ({ method: p.method, amount: p.amount })),
                    useWalletAmount: totals.redeemWallet,
                    discount: totals.discount,
                    membershipDiscount: totals.membershipDiscount,
                    previousDueCollected: includePreviousDue ? Number(selectedClient?.dueAmount || 0) : 0,
                    bookingId: appointmentId,
                    orderId: orderId
                };

                if (appliedPromotion?._id) {
                    checkoutPayload.promotionId = String(appliedPromotion._id);
                }

                // REAL BACKEND CALL
                const response = await api.post('/pos/checkout', checkoutPayload);
                const dbInvoice = response.data.data || response.data;

                const invoiceData = {
                    number: dbInvoice.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
                    date: actualPaymentDate.toLocaleString('en-IN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                    }),
                    outlet: activeOutlet?.name || salon?.name || 'Salon',
                    cashier: user?.name || 'Admin',
                    client: selectedClient,
                    items: cart.map(item => ({
                        ...item,
                        staffName: (item.staffIds || []).filter(Boolean).map(id => businessStaff.find(s => s._id === id)?.name).filter(Boolean).join(', ') || 'Unassigned'
                    })),
                    totals: { ...totals, paidAmount, balanceDue },
                    payments: payments,
                    loyaltyEarned: Math.floor(totals.currentBillTotal / 100),
                    discounts: {
                        manual: manualDiscount,
                        promotion: appliedPromotion,
                        voucher: appliedVoucher,
                        wallet: redeemWallet
                    },
                    paymentDate: paymentDate
                };

                setSuccessInvoice(invoiceData);

                // Auto send WhatsApp invoice
                if (dbInvoice?._id) {
                    try {
                        await autoSendWhatsAppInvoice(dbInvoice, salon);
                    } catch (err) {
                        console.error('Auto WhatsApp failed:', err);
                    }
                }
                setTimeout(() => {
                    navigate('/pos/invoices');
                }, 1000);


                // ── Sync Appointment Status ──
                // ── Sync Booking Statuses ──
                if (selectedBookingIds.length > 0) {
                    for (const bId of selectedBookingIds) {
                        try {
                            await api.patch(`/bookings/${bId}/status`, {
                                status: 'completed',
                                paymentStatus: 'paid',
                                paymentMethod: payments[0]?.method || 'salon'
                            });
                        } catch (syncErr) {
                            console.error('[POS] Booking Sync Error:', syncErr);
                        }
                    }
                } else if (appointmentId) {
                    try {
                        await api.patch(`/bookings/${appointmentId}/status`, {
                            status: 'completed',
                            paymentStatus: 'paid',
                            paymentMethod: payments[0]?.method || 'salon'
                        });
                    } catch (syncErr) {
                        console.error('[POS] Booking Sync Error:', syncErr);
                    }
                }

                // ── Sync Order Statuses ──
                if (selectedOrderIds.length > 0) {
                    for (const oId of selectedOrderIds) {
                        try {
                            await api.patch(`/orders/${oId}/status`, {
                                status: 'completed'
                            });
                        } catch (syncErr) {
                            console.error('[POS] Order Sync Error:', syncErr);
                        }
                    }
                } else if (orderId) {
                    try {
                        await api.patch(`/orders/${orderId}/status`, {
                            status: 'completed'
                        });
                    } catch (syncErr) {
                        console.error('[POS] Order Sync Error:', syncErr);
                    }
                }
            } catch (err) {
                console.error('[POS] Checkout failed:', err);
                alert('Checkout failed: ' + (err.response?.data?.message || err.message));
            } finally {
                setCheckingOut(false);
            }
        }, 500);
    };

    const sendWhatsAppBill = (invoice) => {
        setIsWhatsAppSending(true);
        const text = `*Hello ${invoice.client.name}!* \n\nThank you for visiting *XYZ SALON & SPA*. \n\n*Bill Summary:* \nInvoice: #${invoice.number}\nDate: ${invoice.date}\nTotal: ₹${invoice.totals.total.toFixed(0)}\nPaid: ₹${invoice.totals.paidAmount.toFixed(0)}\n${invoice.totals.balanceDue > 0 ? `*Balance Due: ₹${invoice.totals.balanceDue.toFixed(0)}*` : 'Payment Received'}\n\nHope to see you again soon!`;
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/91${invoice.client.phone}?text=${encodedText}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        setIsWhatsAppSending(false);
    };

    const handleQuickCreate = async (e) => {
        e.preventDefault();
        if (!newClientForm.name || !newClientForm.phone) return toast.error('Name and phone are required');
        if (newClientForm.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits');
        if (isSubmittingClient) return;

        setIsSubmittingClient(true);
        try {
            const res = await addBusinessCustomer(newClientForm);
            setSelectedClient(res);
            setShowClientInfo(true);
            setShowNewClient(false);
            setNewClientForm({ name: '', phone: '', dob: '', anniversary: '' });
            setSearchClient('');
            setShowClientDropdown(false);
        } catch (err) {
            // Error handled by BusinessContext
        } finally {
            setIsSubmittingClient(false);
        }
    };

    const handleDownloadPDF = async (invToUse = null) => {
        const inv = invToUse || successInvoice;
        if (!inv) return;

        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={inv} role={user?.role} salon={salon} taxRate={taxPercent} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${inv?.number || 'INV'}_${(inv?.client?.name || 'Invoice').replace(/\s+/g, '_')}.pdf`;
            link.download = fileName;
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
        setOrderId(null);
        setAppointmentId(null);
        setSelectedBookingIds([]);
        setSelectedOrderIds([]);
        setIncludePreviousDue(false);
        setPaymentDate('');
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
                <div id="thermal-receipt" className="bg-white text-black p-6 w-[320px] shadow-2xl border border-slate-200 font-mono text-[11px] leading-tight print:shadow-none print:border-0 print:m-0">
                    <div className="text-center space-y-1 mb-3">
                        <h2 className="text-lg font-black uppercase tracking-tighter">{salon?.name || fiscal.businessName}</h2>
                        <p className="text-[10px]">{activeOutlet?.name || 'Main Outlet'}</p>
                        <p className="text-[10px]">Contact : {salon?.phone || 'N/A'}</p>
                    </div>

                    <div className="border-y border-dashed border-black py-2 mb-2 space-y-0.5">
                        <div className="flex justify-between"><span>Invoice No :</span><span className="font-bold">{successInvoice?.number || '-'}</span></div>
                        <div className="flex justify-between"><span>Date :</span><span>{successInvoice?.date?.split(',')[0] || '-'}</span></div>
                        <div className="flex justify-between"><span>Time :</span><span>{successInvoice?.date?.split(',')[1] || '-'}</span></div>
                    </div>

                    <div className="mb-2">
                        <p>Customer : <span className="font-bold uppercase">{successInvoice?.client?.name || 'Walk-in'}</span></p>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 text-center font-bold mb-1 uppercase tracking-widest">
                        SERVICES
                    </div>
                    <div className="border-t border-dashed border-black pt-2 mb-2 space-y-2">
                        {successInvoice.items.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between font-bold">
                                    <span className="uppercase">{i + 1}. {item.name}</span>
                                    <span>₹{(item.total ?? (item.price * item.quantity)).toFixed(0)}</span>
                                </div>
                                <p className="text-[9px] ml-4">Staff : {item.staffName || '-'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-black pt-2 space-y-1">
                        <div className="flex justify-between"><span>Subtotal</span><span>₹{successInvoice?.totals?.subtotal?.toFixed(2) || '0.00'}</span></div>

                        <div className="flex justify-between"><span>Base Amount</span><span>₹{successInvoice?.totals?.baseAmount?.toFixed(2) || '0.00'}</span></div>
                        {successInvoice?.totals?.cgst > 0 && (
                            <div className="flex justify-between">
                                <span>
                                    CGST {successInvoice?.items?.every(i => i.type === 'service') ? `(${(successInvoice?.totals?.serviceGstRate || 5) / 2}%)` :
                                        successInvoice?.items?.every(i => i.type === 'product') ? `(${(successInvoice?.totals?.productGstRate || 10) / 2}%)` :
                                            successInvoice?.totals?.serviceGstRate === successInvoice?.totals?.productGstRate ? `(${(successInvoice?.totals?.serviceGstRate || 5) / 2}%)` : ''}
                                </span>
                                <span>₹{successInvoice.totals.cgst.toFixed(2)}</span>
                            </div>
                        )}
                        {successInvoice?.totals?.sgst > 0 && (
                            <div className="flex justify-between">
                                <span>
                                    SGST {successInvoice?.items?.every(i => i.type === 'service') ? `(${(successInvoice?.totals?.serviceGstRate || 5) / 2}%)` :
                                        successInvoice?.items?.every(i => i.type === 'product') ? `(${(successInvoice?.totals?.productGstRate || 10) / 2}%)` :
                                            successInvoice?.totals?.serviceGstRate === successInvoice?.totals?.productGstRate ? `(${(successInvoice?.totals?.serviceGstRate || 5) / 2}%)` : ''}
                                </span>
                                <span>₹{successInvoice.totals.sgst.toFixed(2)}</span>
                            </div>
                        )}
                        {(!successInvoice?.totals?.cgst && successInvoice?.totals?.tax > 0) && (
                            <div className="flex justify-between"><span>GST {successInvoice?.totals?.serviceGstRate === successInvoice?.totals?.productGstRate ? `(${successInvoice?.totals?.serviceGstRate || 5}%)` : ''}</span><span>₹{successInvoice.totals.tax.toFixed(2)}</span></div>
                        )}

                        {(successInvoice?.discounts?.points > 0 || successInvoice?.totals?.membershipDiscount > 0) && (
                            <div className="flex justify-between"><span>Membership Discount</span><span>-₹{(successInvoice?.totals?.membershipDiscount || successInvoice.discounts.points).toFixed(2)}</span></div>
                        )}
                        {(successInvoice?.discounts?.manual?.value > 0 || successInvoice?.discounts?.promotion || successInvoice?.discounts?.wallet > 0) && (
                            <div className="flex justify-between"><span>Extra Discount</span><span>-₹{(successInvoice.totals.discount).toFixed(2)}</span></div>
                        )}

                        <div className="flex justify-between text-base font-black border-y border-black py-1 my-1">
                            <span>TOTAL</span>
                            <span>₹{successInvoice?.totals?.total?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="text-center font-bold mb-1 uppercase tracking-widest">PAYMENT DETAILS</div>
                        <div className="border-t border-dashed border-black pt-2 space-y-0.5">
                            <div className="flex justify-between">
                                <span>Cash Paid</span>
                                <span>₹{(successInvoice.payments?.filter(p => p.method === 'cash').reduce((s, p) => s + p.amount, 0) || 0).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Online Paid</span>
                                <span>₹{(successInvoice.payments?.filter(p => ['online', 'card', 'upi'].includes(p.method)).reduce((s, p) => s + p.amount, 0) || 0).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-red-600 font-bold">
                                <span>Due Amount</span>
                                <span>₹{(successInvoice?.totals?.balanceDue || 0).toFixed(0)}</span>
                            </div>
                            <div className="mt-2">
                                <p>Payment Mode : <span className="uppercase">{successInvoice.payments?.length > 1 ? 'Split Payment' : (successInvoice.payments?.[0]?.method || 'Cash')}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-dashed border-black pt-3 mt-4 text-center">
                        <p className="font-bold uppercase tracking-widest text-[12px]">Thank You Visit Again 🙂</p>
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
                            className={`bg-surface border border-border p-4 font-black uppercase tracking-widest text-[10px] text-text flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-sm ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white hover:border-primary'}`}
                        >
                            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isGeneratingPDF ? 'Generating Document...' : 'Download Invoice PDF'}
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => sendWhatsAppBill(successInvoice)}
                                className="bg-[#25D366] text-white p-3 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:opacity-90 transition-all rounded-none"
                            >
                                <Smartphone className="w-3.5 h-3.5" /> {isWhatsAppSending ? 'Sending...' : 'WhatsApp'}
                            </button>
                            <button
                                onClick={() => navigate('/pos/invoices')}
                                className="bg-background border border-border p-3 font-black uppercase tracking-widest text-[9px] text-text-secondary flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-surface-alt"
                            >
                                <History className="w-3.5 h-3.5 text-emerald-500" /> View All Invoices
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
        <div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden">

            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden border-b border-border bg-surface shrink-0">
                <button
                    onClick={() => setMobileView('items')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${mobileView === 'items' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'
                        }`}
                >
                    <Scissors className="w-3.5 h-3.5" /> Services & Products
                </button>
                <button
                    onClick={() => setMobileView('cart')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative ${mobileView === 'cart' ? 'text-primary border-b-2 border-primary' : 'text-text-muted'
                        }`}
                >
                    <ShoppingCart className="w-3.5 h-3.5" /> Cart
                    {cart.length > 0 && (
                        <span className="absolute top-2 right-6 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Main Header with Return Option */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-alt border-b border-border mb-2">
                <h1 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> POS Terminal
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowQuickInvoice(true)}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 rounded-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Quick Invoice
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden gap-0 lg:gap-6 lg:p-0">

                {/* ─── LEFT PANEL: Item Discovery ─── */}
                <div className={`flex-1 flex flex-col h-full min-w-0 bg-surface border-0 lg:border border-border p-4 shadow-sm overflow-hidden ${mobileView === 'items' ? 'flex' : 'hidden'
                    } lg:flex`}>
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={isBarcodeMode ? "Scan Barcode Now..." : "Search Items or Barcode..."}
                                className={`w-full pl-10 pr-12 py-3 border bg-background text-text outline-none text-sm font-bold shadow-sm transition-all placeholder:text-text-muted/50 rounded-lg ${isBarcodeMode ? 'border-primary ring-2 ring-primary/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/10'
                                    }`}
                                value={searchItem}
                                autoFocus
                                onChange={(e) => setSearchItem(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />

                        </div>

                        {/* Scan Status Overlays */}
                        <AnimatePresence>
                            {lastScannedItem && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 shadow-2xl flex items-center gap-3 border border-emerald-400 rounded-xl"
                                >
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Added to Cart</p>
                                        <p className="text-sm font-bold truncate max-w-[200px]">{lastScannedItem.name}</p>
                                    </div>
                                </motion.div>
                            )}

                            {scanError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-rose-500 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-center animate-pulse rounded-lg"
                                >
                                    {scanError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex bg-surface-alt p-1 border border-border rounded-lg">
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('bookings');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md ${activeTab === 'services' && serviceMode === 'bookings' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Completed Bookings</button>
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('orders');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md ${activeTab === 'services' && serviceMode === 'orders' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Completed Orders</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-2 scrollbar-thin">
                        {filteredItems.map(item => {
                            const isSelected = item.isAppointment
                                ? selectedBookingIds.includes(item._id)
                                : item.isOrder
                                    ? selectedOrderIds.includes(item._id)
                                    : cart.some(c => String(c.itemId) === String(item._id || item.id));
                            return (
                                <button
                                    key={item.id || item._id}
                                    onClick={() => addToCart(item)}
                                    className={`relative bg-background border rounded-xl p-3 text-left hover:border-primary transition-all group flex flex-col justify-between h-[80px] shadow-sm hover:shadow-md active:scale-95 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'
                                        }`}
                                >
                                    {isSelected ? (
                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-tr-xl rounded-bl-xl shadow-sm z-10">
                                            In Cart
                                        </div>
                                    ) : (
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <span className="text-[10px] font-bold text-primary transition-colors">ADD</span>
                                        </div>
                                    )}
                                    <div className="w-full h-full flex flex-col justify-between">
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <h4 className="text-xs font-bold text-text line-clamp-1 uppercase tracking-tight leading-tight flex-1 pr-6">{item.name}</h4>
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md uppercase shrink-0 transition-opacity duration-200 ${isSelected ? 'opacity-0' : 'group-hover:opacity-0'} ${item.isInclusiveTax ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {item.isInclusiveTax ? 'Incl' : 'Excl'}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline justify-between gap-1 mt-1">
                                            <p className="text-sm font-bold text-primary">₹{item.price}</p>
                                            {item.barcode && (
                                                <p className="text-[8px] font-mono text-text-muted/60 truncate max-w-[80px]">{item.barcode}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full lg:w-[400px] h-full p-2 bg-background">
                    <div className="h-full rounded-2xl border border-border bg-surface flex flex-col overflow-hidden">

                        {/* HEADER */}
                        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Billing Cart
                            </h2>

                            <span className="text-[10px] font-bold text-text-muted">
                                {cart.length} Items
                            </span>
                        </div>

                        {/* CONTENT - Scrollable area */}
                        <div className="flex-1 p-2 space-y-3 overflow-y-auto scrollbar-thin">

                            {/* CLIENT + OUTLET */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* CLIENT */}
                                <div className="border border-border rounded-xl p-2 bg-background relative overflow-hidden">
                                    <p className="text-[10px] font-semibold uppercase text-text-muted mb-1">Client</p>
                                    {selectedClient ? (
                                        <>
                                            <p className="text-xs font-bold truncate">{selectedClient.name}</p>
                                            <p className="text-[10px] text-text-muted font-semibold truncate">{maskPhone(selectedClient.phone, user?.role)}</p>
                                            {Number(selectedClient.dueAmount || 0) > 0 && (
                                                <div className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5 animate-pulse">
                                                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" /> Dues: ₹{Number(selectedClient.dueAmount).toFixed(0)}
                                                </div>
                                            )}
                                            {activeMembership && (
                                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-tighter rounded-bl-lg">
                                                    VIP Member
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-[10px] italic text-text-muted">No client selected</p>
                                    )}
                                </div>

                                {/* OUTLET */}
                                <div className="border border-border rounded-xl p-2 bg-background relative">
                                    <p className="text-[10px] font-semibold uppercase text-text-muted mb-1">Outlet</p>
                                    <button
                                        onClick={() => !(appointmentId || orderId) && setShowOutletPickerMain(!showOutletPickerMain)}
                                        className={`w-full flex items-center justify-between text-xs font-bold ${(appointmentId || orderId) ? 'opacity-80 cursor-not-allowed' : ''}`}
                                    >
                                        <span className="truncate">
                                            {(() => {
                                                const booking = appointmentId ? businessBookings?.find(b => b._id === appointmentId) : null;
                                                const order = orderId ? businessOrders?.find(o => o._id === orderId) : null;
                                                const bOutletId = (booking || order) ? (booking?.outletId?._id || booking?.outletId || order?.outletId?._id || order?.outletId) : activeOutletId;
                                                const sel = outlets.find(o => String(o._id) === String(bOutletId));
                                                return sel ? sel.name : 'Select Outlet';
                                            })()}
                                        </span>
                                        {!(appointmentId || orderId) && <ChevronDown className="w-3 h-3 text-text-muted" />}
                                    </button>

                                    <AnimatePresence>
                                        {showOutletPickerMain && !appointmentId && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-border shadow-2xl rounded-xl overflow-hidden z-[80]"
                                            >
                                                {outlets.map(o => (
                                                    <button
                                                        key={o._id}
                                                        onClick={() => { setActiveOutletId(o._id); setShowOutletPickerMain(false); }}
                                                        className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase border-b border-border/50 last:border-0 hover:bg-slate-50 transition-colors ${String(o._id) === String(activeOutletId) ? 'text-primary bg-primary/5' : 'text-slate-800'}`}
                                                    >
                                                        {o.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* CART ITEMS */}
                            <div className="space-y-2">
                                {cart.length === 0 ? (
                                    <div className="py-8 text-center opacity-40 border border-dashed border-border rounded-xl">
                                        <ShoppingCart className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-xs font-bold uppercase tracking-wider">Empty Cart</p>
                                    </div>
                                ) : (
                                    cart.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 border border-border rounded-lg px-2 py-2 bg-surface-alt">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold truncate">{item.name}</p>
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-bold text-primary leading-none mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                    {(item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal.inclusiveTax)) && (
                                                        <span className="text-[9px] font-semibold uppercase text-emerald-600 mt-1">INCLUDING GST</span>
                                                    )}
                                                    {(item.type === 'service' || item.type === 'product') && (
                                                        <div className="mt-1.5 flex items-center gap-1 bg-primary/5 border border-primary/10 rounded-lg p-1 transition-all w-fit">
                                                            <Sparkles className="w-2.5 h-2.5 text-primary animate-pulse" />
                                                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                                                {activeMembership ? 'Mem. Disc:' : 'Discount:'}
                                                            </span>

                                                            {/* Toggle between % and ₹ */}
                                                            <div className="flex items-center bg-white border border-primary/10 rounded-md overflow-hidden h-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateItemMembershipDiscount(idx, 'percentage', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : (activeMembership?.planId?.serviceDiscountType === 'fixed' ? activeMembership.planId.serviceDiscountValue : (activeMembership?.planId?.serviceDiscountValue || 0)))}
                                                                    className={`px-1 text-[9px] font-bold h-full flex items-center ${(item.membershipDiscountType !== undefined ? item.membershipDiscountType : (activeMembership?.planId?.serviceDiscountType || 'percentage')) === 'percentage'
                                                                        ? 'bg-primary text-white'
                                                                        : 'text-slate-400 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    %
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateItemMembershipDiscount(idx, 'fixed', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : (activeMembership?.planId?.serviceDiscountType === 'fixed' ? activeMembership.planId.serviceDiscountValue : (activeMembership?.planId?.serviceDiscountValue || 0)))}
                                                                    className={`px-1 text-[9px] font-bold h-full flex items-center ${(item.membershipDiscountType !== undefined ? item.membershipDiscountType : (activeMembership?.planId?.serviceDiscountType || 'percentage')) === 'fixed'
                                                                        ? 'bg-primary text-white'
                                                                        : 'text-slate-400 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    ₹
                                                                </button>
                                                            </div>

                                                            {/* Numeric Input */}
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={
                                                                    (item.membershipDiscountType !== undefined ? item.membershipDiscountType : (activeMembership?.planId?.serviceDiscountType || 'percentage')) === 'percentage'
                                                                        ? '100'
                                                                        : String(item.price)
                                                                }
                                                                value={
                                                                    item.membershipDiscountValue !== undefined
                                                                        ? item.membershipDiscountValue
                                                                        : (activeMembership?.planId?.serviceDiscountValue || 0)
                                                                }
                                                                onChange={(e) => {
                                                                    const val = Math.max(0, Number(e.target.value) || 0);
                                                                    const currentType = item.membershipDiscountType !== undefined
                                                                        ? item.membershipDiscountType
                                                                        : (activeMembership?.planId?.serviceDiscountType || 'percentage');
                                                                    updateItemMembershipDiscount(idx, currentType, val);
                                                                }}
                                                                className="w-10 bg-white border border-primary/10 rounded-md text-[10px] font-bold text-center h-4 focus:outline-none focus:border-primary/50 text-slate-800"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center border border-border rounded-lg overflow-hidden h-7">
                                                <button onClick={() => updateQty(idx, -1)} className="w-6 h-full flex items-center justify-center hover:bg-border/30"><Minus className="w-3 h-3" /></button>
                                                <span className="px-2 text-[10px] font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQty(idx, 1)} className="w-6 h-full flex items-center justify-center hover:bg-border/30"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <button onClick={() => removeItem(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* PAYMENT SECTION */}
                            <div className="border border-border rounded-xl bg-background p-2 space-y-2 relative overflow-hidden">
                                <div className="flex items-center justify-between px-1 border-b border-border/50 pb-2 mb-2">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Payment Date <span className="text-rose-500 font-bold">*</span></span>
                                    <input
                                        type="date"
                                        required
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className={`bg-surface border text-[11px] font-black uppercase rounded-lg px-2.5 py-1 outline-none text-slate-800 dark:text-slate-200 dark:[color-scheme:dark] focus:border-primary/50 cursor-pointer ${!paymentDate ? 'border-rose-300 bg-rose-50/20 dark:border-rose-900/60 dark:bg-rose-950/20' : 'border-border'}`}
                                    />
                                </div>
                                <div className="flex items-center justify-between px-1 mb-1">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payment Method</span>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:opacity-80 transition-all bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                                        <input
                                            type="checkbox"
                                            checked={isManualPayment}
                                            onChange={(e) => {
                                                setIsManualPayment(e.target.checked);
                                                if (e.target.checked) {
                                                    setTimeout(() => {
                                                        const el = document.querySelector('input[type="number"][data-payment-idx="0"]');
                                                        el?.focus();
                                                        el?.select();
                                                    }, 100);
                                                }
                                            }}
                                            className="w-3 h-3 rounded border-primary/20 text-primary focus:ring-primary/20 cursor-pointer"
                                        />
                                        <span className="uppercase tracking-tight text-text-muted">Partial Pay</span>
                                    </label>
                                </div>
                                {selectedClient && Number(selectedClient.dueAmount || 0) > 0 && (
                                    <div className="flex items-center pb-2 mb-2 border-b border-border/50">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-rose-600 select-none">
                                            <input
                                                type="checkbox"
                                                checked={includePreviousDue}
                                                onChange={(e) => {
                                                    setIncludePreviousDue(e.target.checked);
                                                    if (!isManualPayment && payments.length === 1) {
                                                        const extra = e.target.checked ? Number(selectedClient.dueAmount || 0) : 0;
                                                        setPayments([{ ...payments[0], amount: totals.currentBillTotal + extra }]);
                                                    }
                                                }}
                                                className="w-3 h-3 rounded border-rose-200 text-rose-600 focus:ring-rose-500/20 cursor-pointer"
                                            />
                                            <span className="uppercase tracking-tight">Pay Previous Dues (₹{Number(selectedClient.dueAmount).toFixed(0)})</span>
                                        </label>
                                    </div>
                                )}

                                {payments.map((p, i) => (
                                    <div key={i} className="flex flex-col gap-1.5 border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                        <div className="flex gap-2">
                                            <select
                                                value={p.method}
                                                onChange={(e) => updatePayment(i, "method", e.target.value)}
                                                className="flex-1 h-8 rounded-lg border border-border px-2 text-[10px] font-bold outline-none focus:border-primary transition-all uppercase"
                                            >
                                                <option value="cash">CASH</option>
                                                <option value="online">ONLINE</option>
                                            </select>

                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    data-payment-idx={i}
                                                    value={p.amount}
                                                    onChange={(e) => updatePayment(i, "amount", Number(e.target.value))}
                                                    className="w-28 h-8 rounded-lg border border-border px-2 text-right text-xs font-bold outline-none focus:border-primary transition-all pr-8"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">₹</span>
                                            </div>

                                            {payments.length > 1 && (
                                                <button onClick={() => removePayment(i)} className="h-8 w-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 shrink-0">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {payments.length === 1 && totals.total > p.amount && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-rose-600 uppercase tracking-tight">
                                                    ₹{(totals.total - p.amount).toFixed(2)} will be marked as Due
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {payments.reduce((s, p) => s + p.amount, 0) < totals.total && (
                                    <button
                                        onClick={addPaymentMethod}
                                        className="w-full h-8 border border-dashed border-primary/40 bg-primary/5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1"
                                    >
                                        <Plus className="w-3 h-3" /> Split Payment
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* FOOTER - Fixed at bottom */}
                        <div className="p-3 border-t border-border bg-surface space-y-3 shrink-0">
                            {/* TOTAL */}
                            <div className="pos-billing-cart-total-box border border-border rounded-xl bg-slate-900 !text-white p-3 shadow-lg shadow-slate-950/10">
                                <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90">
                                    <span className="!text-white">Subtotal</span>
                                    <span className="!text-white">₹{totals.subtotal.toFixed(2)}</span>
                                </div>

                                {totals.cgst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90">
                                        <span className="!text-white">
                                            CGST {cart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                                cart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                    totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                        </span>
                                        <div className="flex gap-1 text-right !text-white">
                                            {totals.cgst > totals.cgstExcl && <span className="text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.cgstExcl > 0 && <span className="!text-white">+</span>}
                                            <span className="!text-white">₹{totals.cgst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                {totals.sgst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90">
                                        <span className="!text-white">
                                            SGST {cart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                                cart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                    totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                        </span>
                                        <div className="flex gap-1 text-right !text-white">
                                            {totals.sgst > totals.sgstExcl && <span className="text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.sgstExcl > 0 && <span className="!text-white">+</span>}
                                            <span className="!text-white">₹{totals.sgst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                {totals.igst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90">
                                        <span className="!text-white">IGST {totals.serviceGstRate === totals.productGstRate ? `(${totals.serviceGstRate}%)` : ''}</span>
                                        <div className="flex gap-1 text-right !text-white">
                                            {totals.igst > totals.totalExclusiveTax && <span className="text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.totalExclusiveTax > 0 && <span className="!text-white">+</span>}
                                            <span className="!text-white">₹{totals.igst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 !text-emerald-400">
                                        <span className="!text-emerald-400">Discount</span>
                                        <span className="!text-emerald-400">-₹{totals.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {totals.membershipDiscount > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 !text-emerald-400">
                                        <span className="!text-emerald-400">Membership Disc</span>
                                        <span className="!text-emerald-400">-₹{totals.membershipDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {includePreviousDue && Number(selectedClient?.dueAmount || 0) > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 !text-rose-400 animate-pulse">
                                        <span className="!text-rose-400">Previous Dues Added</span>
                                        <span className="!text-rose-400">+₹{Number(selectedClient.dueAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 mt-2 pt-2 flex items-center justify-between">
                                    <span className="text-sm font-bold uppercase tracking-wider !text-emerald-400">TOTAL</span>
                                    <span className="text-2xl font-bold tracking-tight !text-white">₹{totals.total.toFixed(2)}</span>
                                </div>

                                {totals.redeemWallet > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mt-2 !text-emerald-400">
                                        <span className="!text-emerald-400">Wallet Used</span>
                                        <span className="!text-emerald-400">-₹{totals.redeemWallet.toFixed(2)}</span>
                                    </div>
                                )}

                                {totals.total - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0) > 0.5 && (
                                    <div className="flex justify-between text-xs font-semibold !text-rose-400 mt-2 bg-rose-500/5 p-2 rounded-lg border border-rose-500/20 animate-pulse">
                                        <span className="uppercase tracking-widest !text-rose-400">Balance Due</span>
                                        <span className="!text-rose-400">₹{(totals.total - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}</span>
                                    </div>
                                )}

                                {payments.reduce((s, p) => s + p.amount, 0) - (totals.total - totals.redeemWallet) > 0.005 && (
                                    <div className="flex justify-between text-xs font-semibold text-rose-400 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 animate-pulse">
                                        <span className="uppercase tracking-widest text-rose-400">Overpaid</span>
                                        <span className="text-rose-400">₹{(payments.reduce((s, p) => s + p.amount, 0) - (totals.total - totals.redeemWallet)).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowDiscountModal(true)}
                                    className="h-10 rounded-xl border border-border bg-background text-xs font-bold uppercase hover:bg-surface-alt transition-colors"
                                >
                                    Offers
                                </button>

                                <button
                                    onClick={handleCheckout}
                                    className="h-10 rounded-xl bg-primary text-white text-xs font-bold uppercase hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    Complete Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ─── Modals rendered outside panel flex but inside outer wrapper ─── */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-md p-0 animate-in zoom-in-95 duration-200 border border-border shadow-2xl overflow-hidden rounded-2xl">
                        <div className="flex bg-surface-alt p-4 items-center justify-between border-b border-border">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Applied Offers & Adjustments</h3>
                            <button onClick={() => setShowDiscountModal(false)} className="text-text-muted hover:text-rose-500"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto scrollbar-thin max-h-[60vh]">
                            <div className="space-y-6">
                                <div className="bg-surface-alt p-4 border border-border rounded-xl">
                                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 block">Flat or Percentage Adjustment</label>
                                    <div className="flex border border-border bg-background rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                        <select
                                            className="bg-surface-alt border-r border-border text-[10px] font-bold p-3 text-text outline-none"
                                            value={manualDiscount.type}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, type: e.target.value })}
                                        >
                                            <option value="fixed">FLAT ₹</option>
                                            <option value="percentage">% OFF</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="flex-1 p-3 text-sm font-black bg-background text-text outline-none"
                                            value={manualDiscount.value || ''}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, value: Number(e.target.value) })}
                                            onFocus={(e) => { if (manualDiscount.value === 0) setManualDiscount({ ...manualDiscount, value: '' }) }}
                                            onBlur={(e) => { if (manualDiscount.value === '') setManualDiscount({ ...manualDiscount, value: 0 }) }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-surface-alt p-4 border border-border rounded-xl">
                                    <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3 block">Coupon Code</label>
                                    {appliedPromotion ? (
                                        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                            <div className="text-left">
                                                <p className="text-xs font-black text-primary uppercase tracking-tight">{appliedPromotion.name}</p>
                                                <p className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">Code: {appliedPromotion.couponCode || 'Auto'}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setAppliedPromotion(null)}
                                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-md transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex border border-border bg-background rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                            <input
                                                type="text"
                                                placeholder="ENTER COUPON CODE"
                                                className="flex-1 p-3 text-xs font-black bg-background text-text outline-none uppercase tracking-widest placeholder:opacity-50"
                                                value={couponCodeInput}
                                                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={applyingCoupon || !couponCodeInput}
                                                className="bg-primary hover:brightness-110 text-white font-black text-[10px] uppercase tracking-wider px-5 transition-all disabled:opacity-40"
                                            >
                                                {applyingCoupon ? 'Checking...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {selectedClient && (
                                    <div className="space-y-4">
                                        {/* Wallet Balance */}
                                        <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Wallet Balance</span>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">₹{clientWalletBalance.toFixed(0)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Amount to redeem"
                                                    className="flex-1 p-2.5 text-sm font-black bg-white border border-emerald-200 outline-none focus:border-emerald-500 rounded-lg transition-all"
                                                    value={redeemWallet || ''}
                                                    onChange={(e) => {
                                                        const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
                                                        const maxAllowed = Math.max(0, totals.total - totalPaid);
                                                        const val = Math.min(Number(e.target.value), Math.min(clientWalletBalance, maxAllowed));
                                                        setRedeemWallet(val);
                                                    }}
                                                />
                                                <button
                                                    onClick={handleRedeemWallet}
                                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${redeemWallet > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                                                >
                                                    {redeemWallet > 0 ? 'Reset' : 'Use Max'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase">Total Reductions</p>
                                <p className="text-xl font-black text-primary">₹{(Number(totals.discount) + Number(totals.membershipDiscount) + Number(totals.redeemWallet || 0)).toFixed(0)}</p>
                            </div>
                            <button onClick={() => setShowDiscountModal(false)} className="px-10 py-3 bg-text text-background font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-black/10 active:scale-95 transition-all">
                                Confirm & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ─── Camera Scanner Modal (html5-qrcode) ─── */}
            {showCameraScanner && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[70] flex flex-col items-center justify-center">
                    {/* Header */}
                    <div className="w-full max-w-sm px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-white">Scanner Active</p>
                        </div>
                        <button
                            onClick={closeCameraScanner}
                            className="p-2 bg-white/10 hover:bg-white/20 transition-all rounded-full active:scale-90"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* html5-qrcode mounts camera view here */}
                    <div className="w-full max-w-sm px-4 relative">
                        <div className="absolute inset-4 pointer-events-none z-10 flex items-center justify-center">
                            <div className="relative w-52 h-52">
                                <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary" />
                                <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary" />
                                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary" />
                                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary" />
                                <div
                                    className="absolute left-1 right-1 h-[2px] bg-primary/90"
                                    style={{ animation: 'scanline 2s ease-in-out infinite' }}
                                />
                            </div>
                        </div>
                        <div
                            id="qr-scanner-region"
                            className="w-full overflow-hidden [&_video]:w-full [&_video]:rounded-none [&_img]:hidden [&_select]:hidden [&_button]:hidden [&_span]:hidden"
                            style={{ minHeight: '280px' }}
                        />
                    </div>

                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4 text-center px-4">
                        Point camera at barcode • Auto-detect enabled
                    </p>
                    <p className="text-white/25 text-[9px] font-bold mt-1 text-center">
                        Supports EAN-13, EAN-8, QR, Code 128, UPC
                    </p>
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
                                    className="w-full p-3 bg-background border border-border text-sm font-black text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg uppercase tracking-tighter transition-all"
                                    value={newClientForm.name}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number *</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full p-3 bg-background border border-border text-sm font-black text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg transition-all"
                                    value={newClientForm.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNewClientForm({ ...newClientForm, phone: val });
                                    }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Birth Date</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-background border border-border text-xs font-black text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg transition-all dark:[color-scheme:dark]"
                                        value={newClientForm.dob}
                                        onChange={(e) => setNewClientForm({ ...newClientForm, dob: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Anniversary</label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-background border border-border text-xs font-black text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg transition-all dark:[color-scheme:dark]"
                                        value={newClientForm.anniversary}
                                        onChange={(e) => setNewClientForm({ ...newClientForm, anniversary: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border">
                            <button
                                type="submit"
                                disabled={isSubmittingClient}
                                className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {isSubmittingClient ? 'Creating...' : 'Register & Select Client'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Quick Invoice Modal */}
            {showQuickInvoice && (
                <QuickInvoiceModal
                    onClose={() => setShowQuickInvoice(false)}
                    onSuccess={(inv) => {
                        setShowQuickInvoice(false);
                        navigate('/pos/invoices');
                    }}
                    outlets={outlets}
                    services={services}
                    products={products}
                    staff={businessStaff}
                    customers={businessCustomers}
                    addCustomer={addBusinessCustomer}
                    activeOutletId={activeOutletId}
                    fiscal={fiscal}
                    platformSettings={platformSettings}
                    allWallets={allWallets}
                />
            )}
        </div>
    );
}

// ─── Quick Invoice Modal Component ───
function QuickInvoiceModal({ onClose, onSuccess, outlets, services, products, staff, customers, addCustomer, activeOutletId, fiscal, platformSettings, allWallets }) {
    const { salon } = useBusiness();
    const { user } = useAuth();
    const [qOutletId, setQOutletId] = useState(activeOutletId || (outlets?.[0]?._id || ''));
    const [qClient, setQClient] = useState(null);
    const [qSearchClient, setQSearchClient] = useState('');
    const [qCart, setQCart] = useState([]);
    const [qPayments, setQPayments] = useState({ cash: 0, online: 0 });
    const [isPaymentEdited, setIsPaymentEdited] = useState(false);
    const [qManualDiscount, setQManualDiscount] = useState({ type: 'fixed', value: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmittingClient, setIsSubmittingClient] = useState(false);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', dob: '', anniversary: '', appliedReferralCode: '' });
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [openStaffIdx, setOpenStaffIdx] = useState(null);
    const [staffSearch, setStaffSearch] = useState('');
    const [showDueWarning, setShowDueWarning] = useState(false);
    const [clientPrevDue, setClientPrevDue] = useState(0);
    const [pendingClientSelect, setPendingClientSelect] = useState(null);
    const [showQOutletPicker, setShowQOutletPicker] = useState(false);
    const [qSelectedCategory, setQSelectedCategory] = useState(null);
    const [qActiveTab, setQActiveTab] = useState('services');
    const [qCollectedPrevDue, setQCollectedPrevDue] = useState(0);
    const [qRedeemWallet, setQRedeemWallet] = useState(0);
    const [qActiveMembership, setQActiveMembership] = useState(null);
    const [qPaymentDate, setQPaymentDate] = useState('');


    useEffect(() => {
        const fetchMembership = async () => {
            if (!qClient?._id) {
                setQActiveMembership(null);
                return;
            }
            try {
                const res = await api.get(`/loyalty/membership/active?customerId=${qClient._id}`);
                if (res.data.success) {
                    setQActiveMembership(res.data.data);
                }
            } catch (err) {
                setQActiveMembership(null);
            }
        };
        fetchMembership();
    }, [qClient]);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (openStaffIdx !== null) {
                const dropdownElement = document.getElementById(`staff-dropdown-container-${openStaffIdx}`);
                if (dropdownElement && !dropdownElement.contains(e.target)) {
                    setOpenStaffIdx(null);
                }
            }
            if (showClientDropdown) {
                const clientElement = document.getElementById('client-dropdown-container');
                if (clientElement && !clientElement.contains(e.target)) {
                    setShowClientDropdown(false);
                }
            }
            if (showQOutletPicker) {
                const outletElement = document.getElementById('outlet-dropdown-container');
                if (outletElement && !outletElement.contains(e.target)) {
                    setShowQOutletPicker(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openStaffIdx, showClientDropdown, showQOutletPicker]);

    const qClientWalletBalance = useMemo(() => {
        if (!qClient?._id) return 0;
        return (allWallets || {})[qClient._id]?.balance || 0;
    }, [qClient, allWallets]);

    const qFilteredServices = useMemo(() => {
        if (!qOutletId) return (services || []);
        return (services || []).filter(s => {
            const sOutletIds = s.outletIds || [];
            const sOutletId = s.outletId?._id || s.outletId;
            if (sOutletIds.length === 0 && !sOutletId) return true;
            const matchPlural = sOutletIds.some(id => String(id?._id || id) === String(qOutletId));
            const matchSingular = sOutletId && String(sOutletId) === String(qOutletId);
            return matchPlural || matchSingular;
        });
    }, [services, qOutletId]);

    const qFilteredProducts = useMemo(() => {
        if (!qOutletId) return (products || []);
        return (products || []).filter(p => {
            const pOutletIds = p.outletIds || [];
            const pOutletId = p.outletId?._id || p.outletId;
            if (pOutletIds.length === 0 && !pOutletId) return true;
            const matchPlural = pOutletIds.some(id => String(id?._id || id) === String(qOutletId));
            const matchSingular = pOutletId && String(pOutletId) === String(qOutletId);
            return matchPlural || matchSingular;
        });
    }, [products, qOutletId]);

    const qCategories = useMemo(() => {
        const cats = [];
        cats.push({ name: 'All', image: null });

        const items = qActiveTab === 'services' ? qFilteredServices : qFilteredProducts;
        const uniqueNames = [...new Set(items.map(i => i.category).filter(Boolean))];

        uniqueNames.forEach(name => {
            const firstWithImg = items.find(i => i.category === name && (i.image || i.images?.[0]));
            cats.push({
                name,
                image: firstWithImg ? (firstWithImg.image || firstWithImg.images[0]) : null
            });
        });
        return cats;
    }, [qFilteredServices, qFilteredProducts, qActiveTab]);

    useEffect(() => {
        setQSelectedCategory(null);
    }, [qOutletId]);

    const qFilteredStaff = useMemo(() => {
        if (!staff || staff.length === 0) return [];
        if (!qOutletId) return staff;

        const filtered = staff.filter(s => {
            // Check singular outletId
            const sOutletId = s.outletId?._id || s.outletId;
            // Check multiple outletIds (if exists in schema)
            const sOutletIds = Array.isArray(s.outletIds) ? s.outletIds.map(id => id?._id || id) : [];

            // If staff is not assigned to ANY outlet, show them everywhere
            if (!sOutletId && sOutletIds.length === 0) return true;

            const matchSingular = sOutletId && String(sOutletId) === String(qOutletId);
            const matchPlural = sOutletIds.some(id => String(id) === String(qOutletId));

            return matchSingular || matchPlural;
        });

        // FALLBACK: If no staff assigned specifically to this outlet, show ALL staff to avoid blocking the POS
        return filtered.length > 0 ? filtered : staff;
    }, [staff, qOutletId]);

    const qFilteredClients = useMemo(() => {
        const st = qSearchClient.toLowerCase().trim();
        if (!st) return (customers || []).slice(0, 10);
        return (customers || []).filter(c =>
            (c.name || '').toLowerCase().includes(st) ||
            (c.phone || '').includes(st)
        ).slice(0, 10);
    }, [customers, qSearchClient]);

    const totals = useMemo(() => {
        const res = calculateTotals({
            items: qCart,
            manualDiscount: qManualDiscount,
            appliedPromotion: null,
            appliedVoucher: null,
            activeMembership: qActiveMembership,
            serviceGstRate: Number(platformSettings?.serviceGst ?? fiscal?.serviceGst ?? 5),
            productGstRate: Number(platformSettings?.productGst ?? fiscal?.productGst ?? 10),
            inclusiveTaxFallback: !!fiscal?.inclusiveTax,
            customerState: null,
            salonState: null,
            includePreviousDue: false,
            previousDue: 0,
            redeemWallet: qRedeemWallet,
            payments: []
        });

        return {
            ...res,
            totalWithPrevDue: res.currentBillTotal + qCollectedPrevDue,
            redeemWallet: Math.min(qRedeemWallet || 0, res.currentBillTotal + qCollectedPrevDue)
        };
    }, [qCart, qManualDiscount, fiscal, platformSettings, qRedeemWallet, qActiveMembership, qCollectedPrevDue]);

    // Auto-fill cash payment for Quick Invoice unless user has manually edited it
    useEffect(() => {
        if (!isPaymentEdited) {
            const targetCash = Math.max(0, totals.totalWithPrevDue - (qPayments.online || 0) - (qRedeemWallet || 0));
            if (qPayments.cash !== targetCash) {
                setQPayments(prev => ({ ...prev, cash: targetCash }));
            }
        }
    }, [totals.totalWithPrevDue, qPayments.online, qRedeemWallet, isPaymentEdited]);

    const paidAmount = Number(qPayments.cash || 0) + Number(qPayments.online || 0) + Number(qRedeemWallet || 0);
    const dueAmount = Math.max(0, totals.totalWithPrevDue - paidAmount);
    const totalLiability = totals.total + (Number(qClient?.dueAmount) || 0);
    const overpaidDiff = Math.round((paidAmount - totalLiability) * 100) / 100;
    const isOverpaid = overpaidDiff > 0;

    useEffect(() => {
        if (isOverpaid) {
            toast(`Info: Total payment exceeds total liability by ₹${overpaidDiff.toFixed(2)}`, {
                id: 'overpaid-toast',
                icon: 'ℹ️',
                duration: 2000
            });
        }
    }, [isOverpaid, overpaidDiff]);

    const addToQCart = (item, type = 'service') => {
        setQCart([...qCart, {
            ...item,
            itemId: item._id,
            type: type,
            quantity: 1,
            staffIds: type === 'service' ? (qFilteredStaff.length === 1 ? [typeof qFilteredStaff[0]._id === 'object' ? qFilteredStaff[0]._id?._id : String(qFilteredStaff[0]._id)] : []) : []
        }]);
    };

    const updateQQty = (idx, delta) => {
        const newCart = [...qCart];
        newCart[idx].quantity = Math.max(1, (newCart[idx].quantity || 1) + delta);
        setQCart(newCart);
    };

    const updateQItemMembershipDiscount = (idx, type, value) => {
        const newQCart = [...qCart];
        const item = newQCart[idx];
        const prevType = item.membershipDiscountType !== undefined
            ? item.membershipDiscountType
            : (item.type === 'service'
                ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                : (qActiveMembership?.planId?.productDiscountType || 'percentage')
            );

        let finalValue = Number(value) || 0;

        if (prevType !== type) {
            const price = Number(item.price) || 0;
            if (type === 'percentage') {
                finalValue = price > 0 ? Math.round(((value * 100) / price) * 100) / 100 : 0;
                finalValue = Math.min(100, finalValue);
            } else {
                finalValue = Math.round(((price * value) / 100) * 100) / 100;
                finalValue = Math.min(price, finalValue);
            }
        }

        newQCart[idx] = {
            ...newQCart[idx],
            membershipDiscountType: type,
            membershipDiscountValue: finalValue
        };
        setQCart(newQCart);
    };

    const toggleStaffInItem = (itemIdx, sId) => {
        const newCart = [...qCart];
        const currentIds = newCart[itemIdx].staffIds || [];
        if (currentIds.includes(String(sId))) {
            newCart[itemIdx].staffIds = currentIds.filter(id => id !== String(sId));
        } else {
            newCart[itemIdx].staffIds = [...currentIds, String(sId)];
        }
        setQCart(newCart);
    };


    const handleSelectClient = (c) => {
        const prevDue = Number(c.dueAmount || 0);
        setQSearchClient('');
        setShowClientDropdown(false);
        if (prevDue > 0) {
            setPendingClientSelect(c);
            setClientPrevDue(prevDue);
            setShowDueWarning(true);
        } else {
            setQClient(c);
        }
    };

    const handleQuickCreateClient = async (e) => {
        e.preventDefault();
        if (newClientForm.phone.length !== 10) return toast.error('Phone number must be exactly 10 digits');
        if (isSubmittingClient) return;
        setIsSubmittingClient(true);
        try {
            const res = await addCustomer(newClientForm);
            setQClient(res);
            setShowNewClient(false);
            setQSearchClient('');
            setShowClientDropdown(false);
            setNewClientForm({ name: '', phone: '', dob: '', anniversary: '', appliedReferralCode: '' });
        } catch (err) {
            // Error handled by BusinessContext
        } finally {
            setIsSubmittingClient(false);
        }
    };

    const handleConfirm = async () => {
        if (!qClient) return toast.error('Please select a client');
        if (qCart.length === 0) return toast.error('Cart is empty');
        if (qCart.some(item => item.type === 'service' && (!item.staffIds || item.staffIds.length === 0 || item.staffIds.some(sid => !sid)))) return toast.error('Please assign stylists for all services');
        if (!qPaymentDate) return toast.error('Please select a payment date');

        const totalLiability = totals.total + (Number(qClient?.dueAmount) || 0);
        if (paidAmount > totalLiability + 1) {
            toast(`Note: You are paying ₹${paidAmount}, which exceeds the total liability of ₹${totalLiability.toFixed(0)}. Excess will be adjusted.`, { icon: 'ℹ️' });
        }

        setIsProcessing(true);
        try {
            const getSelectedPaymentDate = (dateStr) => {
                if (!dateStr) return new Date();
                const [year, month, day] = dateStr.split('-').map(Number);
                const dateObj = new Date();
                dateObj.setFullYear(year, month - 1, day);
                return dateObj;
            };

            const actualPaymentDate = getSelectedPaymentDate(qPaymentDate);

            const paymentArray = [];
            if (qPayments.cash > 0) paymentArray.push({ method: 'cash', amount: qPayments.cash });
            if (qPayments.online > 0) paymentArray.push({ method: 'online', amount: qPayments.online });

            const payload = {
                clientId: qClient._id,
                outletId: qOutletId,
                createdAt: actualPaymentDate.toISOString(),
                items: qCart.map(i => {
                    const { staffIds, ...rest } = i;
                    return {
                        ...rest,
                        gstPercent: i.type === 'service' ? totals.serviceGstRate : totals.productGstRate,
                        stylistIds: (staffIds || []).filter(Boolean).map(sid => typeof sid === 'object' ? sid?._id : String(sid))
                    };
                }),
                tax: totals.totalExclusiveTax,
                gstPercent: totals.serviceGstRate,
                includingGst: totals.includingGst,
                baseAmount: totals.baseAmount,
                gstAmount: totals.gstAmount,
                cgst: totals.cgst,
                sgst: totals.sgst,
                serviceGstPercent: totals.serviceGstRate,
                productGstPercent: totals.productGstRate,
                subtotal: totals.subtotal,
                payments: paymentArray,
                discount: totals.discount,
                membershipDiscount: totals.membershipDiscount || 0,
                previousDueCollected: qCollectedPrevDue,
                discountType: qManualDiscount.type,
                useWalletAmount: totals.redeemWallet,
                promotionId: appliedPromotion?._id || undefined,
                couponCode: appliedPromotion?.couponCode || undefined
            };

            const res = await api.post('/pos/checkout', payload);
            toast.success('Invoice Generated!');

            const dbInvoice = res.data.data;
            const invoiceData = {
                ...dbInvoice,
                number: dbInvoice.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
                date: actualPaymentDate.toLocaleString('en-IN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                }),
                outlet: outlets.find(o => String(o._id) === String(qOutletId))?.name || 'Salon',
                client: qClient,
                items: qCart.map(item => ({
                    ...item,
                    staffName: (item.staffIds || []).filter(Boolean).map(id => staff.find(s => String(s._id) === String(id))?.name).filter(Boolean).join(', ') || 'Unassigned'
                })),
                totals: {
                    ...totals,
                    paidAmount: (Number(qPayments.cash || 0) + Number(qPayments.online || 0) + Number(qRedeemWallet || 0)),
                    balanceDue: Math.max(0, totals.totalWithPrevDue - (Number(qPayments.cash || 0) + Number(qPayments.online || 0) + Number(qRedeemWallet || 0)))
                },
                payments: [
                    ...(qPayments.cash > 0 ? [{ method: 'cash', amount: qPayments.cash }] : []),
                    ...(qPayments.online > 0 ? [{ method: 'online', amount: qPayments.online }] : [])
                ]
            };

            // Auto send WhatsApp invoice
            if (dbInvoice?._id) {
                try {
                    await autoSendWhatsAppInvoice(dbInvoice, salon);
                } catch (err) {
                    console.error('Auto WhatsApp failed:', err);
                }
            }

            onSuccess(invoiceData);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-md z-[100] flex items-center justify-center p-0 sm:p-2 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-checkout-modal w-full max-w-[96%] h-full sm:h-[95vh] shadow-2xl flex flex-col sm:rounded-2xl border overflow-hidden"
            >
                <style>{`
                    /* --- Custom scoped styles to override global admin overrides cleanly --- */
                    .bg-checkout-modal {
                        background-color: #ffffff !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .dark .bg-checkout-modal {
                        background-color: #0b0f19 !important;
                        border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    }
                    .bg-checkout-modal-sub {
                        background-color: #ffffff !important;
                    }
                    .dark .bg-checkout-modal-sub {
                        background-color: #0d1220 !important;
                    }
                    .bg-checkout-header {
                        background-color: #f8fafc !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                    }
                    .dark .bg-checkout-header {
                        background-color: #111726 !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                    }
                    .bg-checkout-topbar {
                        background-color: #f8fafc !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                    }
                    .dark .bg-checkout-topbar {
                        background-color: #121826 !important;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                    }
                    .bg-checkout-right-panel {
                        background-color: #f8fafc !important;
                    }
                    .dark .bg-checkout-right-panel {
                        background-color: #0b0f19 !important;
                    }
                    .bg-checkout-bar {
                        background-color: #ffffff !important;
                    }
                    .dark .bg-checkout-bar {
                        background-color: #090d16 !important;
                    }
                    .bg-checkout-box {
                        background-color: #f8fafc !important;
                        border: 1px solid #e2e8f0 !important;
                    }
                    .dark .bg-checkout-box {
                        background-color: #161e2e !important;
                        border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    }
                    .bg-checkout-box:hover {
                        border-color: #cbd5e1 !important;
                    }
                    .dark .bg-checkout-box:hover {
                        border-color: rgba(255, 255, 255, 0.2) !important;
                    }
                    .bg-checkout-box-inner {
                        background-color: #ffffff !important;
                    }
                    .dark .bg-checkout-box-inner {
                        background-color: #1a2333 !important;
                    }
                    .bg-checkout-box-error {
                        background-color: rgba(244, 63, 94, 0.03) !important;
                        border: 1px solid #fca5a5 !important;
                    }
                    .dark .bg-checkout-box-error {
                        background-color: rgba(244, 63, 94, 0.08) !important;
                        border: 1px solid rgba(244, 63, 94, 0.5) !important;
                    }
                    .bg-discount-btn {
                        background-color: rgba(244, 63, 94, 0.08) !important;
                        color: #e11d48 !important;
                    }
                    .dark .bg-discount-btn {
                        background-color: rgba(244, 63, 94, 0.2) !important;
                        color: #fda4af !important;
                    }
                    .bg-discount-btn:hover {
                        background-color: rgba(244, 63, 94, 0.15) !important;
                    }
                    .dark .bg-discount-btn:hover {
                        background-color: rgba(244, 63, 94, 0.3) !important;
                    }
                `}</style>

                {/* Header */}
                <div className="p-4 bg-checkout-header flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-2 rounded-xl text-white">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Instant POS Billing</h2>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Quick Invoice Without Appointments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setQCart([]);
                                setQClient(null);
                                setQPayments({ cash: 0, online: 0 });
                                setQManualDiscount({ type: 'fixed', value: 0 });
                                setIsPaymentEdited(false);
                            }}
                            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
                        >
                            Reset Form
                        </button>
                        <button onClick={onClose} className="pos-billing-close-btn p-2 hover:bg-slate-200 rounded-full transition-colors group">
                            <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-checkout-modal-sub">
                    {/* Left Panel: Configuration & Services */}
                    <div className="flex-1 min-h-0 flex flex-col bg-checkout-modal-sub overflow-hidden border-r border-slate-100/50">
                        {/* Top Bar: Compact Outlet & Client */}
                        <div className="p-4 bg-checkout-topbar grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                            <div className="space-y-1 relative">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Outlet
                                </label>
                                <div className="relative" id="outlet-dropdown-container">
                                    <button
                                        onClick={() => setShowQOutletPicker(prev => !prev)}
                                        className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-2.5 hover:border-primary/50 transition-all"
                                    >
                                        {(() => {
                                            const sel = outlets.find(o => String(o._id) === String(qOutletId));
                                            const img = sel?.image || sel?.images?.[0];
                                            return sel ? (
                                                <>
                                                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 shadow-sm">
                                                        {img
                                                            ? <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={sel.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            : null
                                                        }
                                                        <div className={`w-full h-full items-center justify-center bg-primary/10 ${img ? 'hidden' : 'flex'}`}><Building2 className="w-3 h-3 text-primary" /></div>
                                                    </div>
                                                    <span className="text-xs font-bold uppercase text-slate-900 truncate">{sel.name}</span>
                                                </>
                                            ) : <span className="text-xs italic text-slate-400">Select outlet...</span>;
                                        })()}
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-auto transition-transform ${showQOutletPicker ? 'rotate-180 text-primary' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {showQOutletPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[60]"
                                            >
                                                {outlets.map(o => (
                                                    <button
                                                        key={o._id}
                                                        onClick={() => { setQOutletId(o._id); setQCart([]); setShowQOutletPicker(false); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${String(o._id) === String(qOutletId) ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 shadow-sm transition-transform group-hover:scale-105">
                                                            {(() => {
                                                                const img = o.image || o.images?.[0];
                                                                return img ? (
                                                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={o.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                                ) : null;
                                                            })()}
                                                            <div className={`w-full h-full items-center justify-center bg-primary/10 ${o.image || o.images?.[0] ? 'hidden' : 'flex'}`}><Building2 className="w-5 h-5 text-primary" /></div>
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <p className="text-xs font-bold uppercase text-slate-800 truncate">{o.name}</p>
                                                            {(() => { const a = typeof o.address === 'string' ? o.address : typeof o.address === 'object' && o.address ? [o.address.street, o.address.city].filter(Boolean).join(', ') : [o.location?.street, o.location?.city].filter(s => typeof s === 'string' && s).join(', '); return a ? <p className="text-[10px] font-semibold text-slate-400 truncate">{a}</p> : null; })()}
                                                        </div>
                                                        {String(o._id) === String(qOutletId) && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="space-y-1 relative">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-slate-500" /> Client
                                </label>
                                {qClient ? (
                                    <div className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg border ${Number(qClient.dueAmount || 0) > 0 ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'}`}>
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className={`w-8 h-8 flex-shrink-0 text-white flex items-center justify-center font-bold rounded-lg text-sm ${Number(qClient.dueAmount || 0) > 0 ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                                                {qClient?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{qClient.name}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                    {Number(qClient.dueAmount || 0) > 0 && (
                                                        <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-0.5">
                                                            <AlertTriangle className="w-3 h-3 text-amber-600" /> ₹{Number(qClient.dueAmount).toFixed(0)} pending
                                                        </p>
                                                    )}
                                                    {qActiveMembership && (
                                                        <span className="text-[9px] font-semibold bg-primary text-white px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                            <Sparkles className="w-2.5 h-2.5" /> {qActiveMembership.planId?.name}
                                                        </span>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {Number(qClient.dueAmount || 0) > 0 && (
                                                <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2 py-0.5 shadow-sm">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Collect:</span>
                                                    <div className="relative">
                                                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">₹</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={Math.ceil(Number(qClient.dueAmount))}
                                                            className="w-16 pl-3 bg-transparent text-xs font-bold text-slate-800 outline-none font-mono text-center h-5"
                                                            placeholder="0"
                                                            value={qCollectedPrevDue || ''}
                                                            onChange={(e) => {
                                                                const val = Math.min(Math.ceil(Number(qClient.dueAmount)), Math.max(0, Number(e.target.value) || 0));
                                                                setQCollectedPrevDue(val);
                                                                setQPayments(prev => ({ ...prev, cash: totals.total + val }));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {qClientWalletBalance > 0 && (
                                                <button
                                                    onClick={() => setQRedeemWallet(qRedeemWallet > 0 ? 0 : Math.min(qClientWalletBalance, totals.totalWithPrevDue))}
                                                    className={`px-2 py-1 rounded-lg border flex flex-col items-center transition-all ${qRedeemWallet > 0 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                                                >
                                                    <span className="text-[9px] font-bold uppercase leading-none">Wallet</span>
                                                    <span className="text-xs font-bold leading-none mt-0.5">₹{qClientWalletBalance.toFixed(0)}</span>
                                                </button>
                                            )}
                                            <button onClick={() => { setQClient(null); setQCollectedPrevDue(0); }} className="text-slate-400 hover:text-rose-500 p-1 flex-shrink-0"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative" id="client-dropdown-container">
                                        <div className="flex items-center gap-2">
                                            <div className="relative group flex-1">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search client..."
                                                    className="w-full bg-white border border-slate-200 pl-8 pr-2 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-primary rounded-lg"
                                                    value={qSearchClient}
                                                    onFocus={() => setShowClientDropdown(true)}
                                                    onChange={(e) => { setQSearchClient(e.target.value); setShowClientDropdown(true); }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => { setShowNewClient(true); setShowClientDropdown(false); }}
                                                className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                                                title="Quick Add New Client"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {showClientDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-2xl z-[80] mt-1.5 rounded-2xl overflow-hidden"
                                                >
                                                    {qFilteredClients.length > 0 ? (
                                                        <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
                                                            {qFilteredClients.map(c => (
                                                                <button
                                                                    key={c._id}
                                                                    onClick={() => handleSelectClient(c)}
                                                                    className="w-full p-2.5 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-2.5 group transition-colors"
                                                                >
                                                                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-xl text-xs ${Number(c.dueAmount || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>{c.name.charAt(0).toUpperCase()}</div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-[10px] font-semibold text-slate-400">{c.phone}</p>
                                                                            {Number(c.dueAmount || 0) > 0 && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Due ₹{Number(c.dueAmount).toFixed(0)}</span>}
                                                                        </div>
                                                                    </div>
                                                                    {allWallets?.[c._id]?.balance > 0 && (
                                                                        <div className="flex flex-col items-end px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0">
                                                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider leading-none">Wallet</span>
                                                                            <span className="text-xs font-bold text-emerald-600 leading-none mt-0.5">₹{allWallets[c._id].balance.toFixed(0)}</span>
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center space-y-2">
                                                            <p className="text-xs font-semibold text-slate-400 italic">{qSearchClient ? `No client found for "${qSearchClient}"` : 'Start typing to search...'}</p>
                                                            <button
                                                                onClick={() => { setShowNewClient(true); setShowClientDropdown(false); }}
                                                                className="w-full py-2 bg-primary text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5"
                                                            >
                                                                <UserPlus className="w-3.5 h-3.5" /> Quick Add New Client
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="px-4 pt-4 shrink-0">
                            <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl">
                                <button
                                    onClick={() => { setQActiveTab('services'); setQSelectedCategory(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 group ${
                                        qActiveTab === 'services'
                                            ? 'bg-primary text-white font-black shadow-md shadow-primary/20 scale-[1.01]'
                                            : 'bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold shadow-sm border border-slate-200/10 hover:bg-slate-200/90 dark:hover:bg-slate-700 hover:text-slate-900 hover:shadow-md hover:scale-[1.01]'
                                    }`}
                                >
                                    <Scissors className={`w-3.5 h-3.5 transition-all duration-300 ${qActiveTab === 'services' ? 'text-white scale-110' : 'text-primary group-hover:scale-110'}`} /> Services
                                </button>
                                <button
                                    onClick={() => { setQActiveTab('products'); setQSelectedCategory(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all duration-300 group ${
                                        qActiveTab === 'products'
                                            ? 'bg-primary text-white font-black shadow-md shadow-primary/20 scale-[1.01]'
                                            : 'bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold shadow-sm border border-slate-200/10 hover:bg-slate-200/90 dark:hover:bg-slate-700 hover:text-slate-900 hover:shadow-md hover:scale-[1.01]'
                                    }`}
                                >
                                    <Package className={`w-3.5 h-3.5 transition-all duration-300 ${qActiveTab === 'products' ? 'text-white scale-110' : 'text-primary group-hover:scale-110'}`} /> Products
                                </button>
                            </div>
                        </div>

                        {/* Service/Product Selection Section */}
                        <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-3">
                            <div className="flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    {qSelectedCategory && (
                                        <button
                                            onClick={() => setQSelectedCategory(null)}
                                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-colors"
                                            title="Back to Categories"
                                        >
                                            <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                                        </button>
                                    )}
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        {qActiveTab === 'services' ? <Scissors className="w-3 h-3 text-slate-500" /> : <Package className="w-3 h-3 text-slate-500" />} {qSelectedCategory || (qActiveTab === 'services' ? 'Service Categories' : 'Product Categories')}
                                    </h3>
                                </div>
                                <div className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                                    {qSelectedCategory
                                        ? `${(qActiveTab === 'services' ? qFilteredServices : qFilteredProducts).filter(i => qSelectedCategory === 'All' || i.category === qSelectedCategory).length} ${qActiveTab === 'services' ? 'Services' : 'Products'}`
                                        : `${qCategories.length} Categories`
                                    }
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                                {!qSelectedCategory ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {qCategories.map(cat => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setQSelectedCategory(cat.name)}
                                                className="bg-checkout-box hover:border-primary hover:shadow-md transition-all rounded-xl overflow-hidden flex flex-col group h-[70px]"
                                            >
                                                <div className="h-10 w-full bg-checkout-box-inner relative overflow-hidden flex-shrink-0">
                                                    {cat.image ? (
                                                        <img
                                                            src={getImageUrl(cat.image)}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            alt={cat.name}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                            {cat.name === 'All' ? (
                                                                <LayoutGrid className="w-5 h-5 text-primary/40" />
                                                            ) : (
                                                                <Tag className="w-4 h-4 text-primary/30" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                                </div>
                                                <div className="flex-1 flex items-center justify-center p-1">
                                                    <span className="text-[10px] font-bold !text-slate-800 dark:!text-slate-200 uppercase tracking-tight text-center leading-tight group-hover:!text-primary transition-colors">{cat.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {(qActiveTab === 'services' ? qFilteredServices : qFilteredProducts)
                                            .filter(i => qSelectedCategory === 'All' || i.category === qSelectedCategory)
                                            .map(item => (
                                                <button
                                                    key={item._id}
                                                    onClick={() => addToQCart(item, qActiveTab === 'services' ? 'service' : 'product')}
                                                    className="bg-checkout-box hover:border-primary hover:shadow-md transition-all rounded-xl shadow-sm relative overflow-hidden flex flex-col group h-32"
                                                >
                                                    <div className="h-16 w-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0 relative">
                                                        {(() => {
                                                            const img = item.image || item.images?.[0];
                                                            return img ? (
                                                                <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={item.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            ) : null;
                                                        })()}
                                                        <div className={`w-full h-full items-center justify-center ${item.image || item.images?.[0] ? 'hidden' : 'flex'}`}>
                                                            {qActiveTab === 'services' ? (
                                                                <Scissors className="w-6 h-6 text-primary/30 group-hover:text-primary/60 transition-colors" />
                                                            ) : (
                                                                <Package className="w-6 h-6 text-primary/30 group-hover:text-primary/60 transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                            <Plus className="w-3 h-3 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 px-2.5 py-2 flex flex-col justify-between text-left">
                                                        <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-tight">{item.name}</p>
                                                        <p className="text-xs font-bold text-emerald-600">₹{item.price}</p>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Invoice Summary */}
                    <div className="w-full lg:w-[480px] bg-checkout-right-panel flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden h-[300px] lg:h-full min-h-0">
                        <div className="p-4 border-b border-slate-200 bg-checkout-header flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cart Items ({qCart.length})</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setQCart([]);
                                    setQPayments({ cash: 0, online: 0 });
                                    setIsPaymentEdited(false);
                                }}
                                className="text-xs font-bold text-rose-500 uppercase tracking-wider hover:underline"
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                            {qCart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-slate-400 text-center space-y-3">
                                    <div className="w-16 h-16 bg-checkout-box rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider">Select services to begin</p>
                                </div>
                            ) : qCart.map((item, idx) => (
                                <div key={idx} className="bg-checkout-box p-4 rounded-xl shadow-sm space-y-3 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-10">
                                            <p className="text-base md:text-lg font-black text-slate-900 uppercase leading-tight line-clamp-1">{item.name}</p>
                                            <div className="flex flex-nowrap items-end gap-2.5 mt-2.5 w-full overflow-x-auto scrollbar-none">
                                                <div className="flex flex-col gap-1 items-start shrink-0">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">Price</span>
                                                    <p className="text-xs md:text-sm font-black text-emerald-600 font-mono h-8 flex items-center px-1">₹{item.price}</p>
                                                </div>

                                                <div className="flex flex-col gap-1 items-start shrink-0">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">Tax</span>
                                                    <span className={`text-[10px] font-black px-2 rounded border uppercase tracking-wider h-8 flex items-center justify-center ${(item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal?.inclusiveTax))
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                        : 'bg-slate-50 border-slate-200 text-slate-400'
                                                        }`}>
                                                        {(item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal?.inclusiveTax)) ? 'Incl' : 'Excl'}
                                                    </span>
                                                </div>

                                                {(item.type === 'service' || item.type === 'product') && (
                                                    <div className="flex flex-col gap-1 items-start shrink-0">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">Qty</span>
                                                        <div className="flex items-center bg-checkout-box-inner border border-slate-200 rounded-lg h-8 overflow-hidden shadow-sm shrink-0">
                                                            <button type="button" onClick={() => updateQQty(idx, -1)} className="px-2 hover:bg-slate-200 text-slate-500 transition-colors h-full flex items-center"><Minus className="w-3 h-3" /></button>
                                                            <span style={{ fontWeight: 900 }} className="px-2 text-xs font-black text-slate-800 border-x border-slate-200 flex items-center h-full bg-checkout-box-inner justify-center">{item.quantity}</span>
                                                            <button type="button" onClick={() => updateQQty(idx, 1)} className="px-2 hover:bg-slate-200 text-slate-500 transition-colors h-full flex items-center"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {(item.type === 'service' || item.type === 'product') && (
                                                    <div className="flex flex-col gap-1 items-start shrink-0">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-0.5">Discount</span>
                                                        <div className="flex items-center gap-1 bg-checkout-box-inner border border-slate-200 rounded-lg h-8 px-1.5 transition-all shadow-sm shrink-0">
                                                            <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />

                                                            {/* Toggle between % and ₹ */}
                                                            <div className="flex items-center bg-checkout-box-inner border border-slate-200 rounded overflow-hidden h-6 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const fallbackType = item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage');
                                                                        const fallbackValue = item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType === 'fixed' ? qActiveMembership.planId.serviceDiscountValue : (qActiveMembership?.planId?.serviceDiscountValue || 0))
                                                                            : (qActiveMembership?.planId?.productDiscountType === 'fixed' ? qActiveMembership.planId.productDiscountValue : (qActiveMembership?.planId?.productDiscountValue || 0));
                                                                        updateQItemMembershipDiscount(idx, 'percentage', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : fallbackValue);
                                                                    }}
                                                                    className={`px-1.5 text-[10px] font-black h-full flex items-center ${(item.membershipDiscountType !== undefined
                                                                        ? item.membershipDiscountType
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage')
                                                                        )
                                                                    ) === 'percentage'
                                                                        ? 'bg-slate-800 dark:bg-slate-950 text-white'
                                                                        : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                                        }`}
                                                                >
                                                                    %
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const fallbackType = item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage');
                                                                        const fallbackValue = item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType === 'fixed' ? qActiveMembership.planId.serviceDiscountValue : (qActiveMembership?.planId?.serviceDiscountValue || 0))
                                                                            : (qActiveMembership?.planId?.productDiscountType === 'fixed' ? qActiveMembership.planId.productDiscountValue : (qActiveMembership?.planId?.productDiscountValue || 0));
                                                                        updateQItemMembershipDiscount(idx, 'fixed', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : fallbackValue);
                                                                    }}
                                                                    className={`px-1.5 text-[10px] font-black h-full flex items-center ${(item.membershipDiscountType !== undefined
                                                                        ? item.membershipDiscountType
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage')
                                                                        )
                                                                    ) === 'fixed'
                                                                        ? 'bg-slate-800 dark:bg-slate-950 text-white'
                                                                        : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                                                        }`}
                                                                >
                                                                    ₹
                                                                </button>
                                                            </div>

                                                            {/* Numeric Input */}
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={
                                                                    (item.membershipDiscountType !== undefined
                                                                        ? item.membershipDiscountType
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage')
                                                                        )
                                                                    ) === 'percentage'
                                                                        ? '100'
                                                                        : String(item.price)
                                                                }
                                                                value={
                                                                    item.membershipDiscountValue !== undefined
                                                                        ? item.membershipDiscountValue
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountValue || 0)
                                                                            : (qActiveMembership?.planId?.productDiscountValue || 0)
                                                                        )
                                                                }
                                                                onChange={(e) => {
                                                                    const val = Math.max(0, Number(e.target.value) || 0);
                                                                    const currentType = item.membershipDiscountType !== undefined
                                                                        ? item.membershipDiscountType
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                            : (qActiveMembership?.planId?.productDiscountType || 'percentage')
                                                                        );
                                                                    updateQItemMembershipDiscount(idx, currentType, val);
                                                                }}
                                                                style={{ fontWeight: 900 }}
                                                                className="w-16 bg-checkout-box-inner border border-slate-200 rounded text-xs font-black text-center h-6 focus:outline-none focus:border-slate-500 text-slate-800 shrink-0"
                                                            />
                                                            {(() => {
                                                                const currentType = item.membershipDiscountType !== undefined
                                                                    ? item.membershipDiscountType
                                                                    : (item.type === 'service'
                                                                        ? (qActiveMembership?.planId?.serviceDiscountType || 'percentage')
                                                                        : (qActiveMembership?.planId?.productDiscountType || 'percentage')
                                                                    );
                                                                const currentValue = Number(
                                                                    item.membershipDiscountValue !== undefined
                                                                        ? item.membershipDiscountValue
                                                                        : (item.type === 'service'
                                                                            ? (qActiveMembership?.planId?.serviceDiscountValue || 0)
                                                                            : (qActiveMembership?.planId?.productDiscountValue || 0)
                                                                        )
                                                                );
                                                                const appliedRupeeDiscount = currentType === 'percentage' ? (Number(item.price) * currentValue) / 100 : currentValue;
                                                                if (appliedRupeeDiscount > 0) {
                                                                    return (
                                                                        <span className="text-[10px] font-black text-emerald-600 font-mono bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded flex items-center shrink-0 animate-in zoom-in-95 h-6">
                                                                            -₹{appliedRupeeDiscount.toFixed(0)}
                                                                        </span>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => setQCart(qCart.filter((_, i) => i !== idx))} className="absolute top-5 right-5 p-1.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full transition-all shadow-sm border border-rose-100 hover:border-rose-500 flex items-center justify-center group shrink-0" title="Delete item">
                                            <Trash2 className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                                        </button>
                                    </div>

                                    {(item.type === 'service' || item.type === 'product') && (
                                        <div className={`p-2.5 rounded-xl border ${(!item.staffIds || item.staffIds.length === 0) ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2 ${(!item.staffIds || item.staffIds.length === 0) ? 'text-amber-600' : 'text-slate-400'}`}>
                                                <Sparkles className="w-2.5 h-2.5" /> {item.type === 'service' ? 'Assign Stylists' : 'Assign Sales Staff'}
                                            </label>

                                            <div className="relative" id={`staff-dropdown-container-${idx}`}>
                                                <div
                                                    className="min-h-[40px] bg-slate-50/50 border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-1.5 cursor-pointer hover:border-primary/50 transition-all"
                                                    onClick={() => setOpenStaffIdx(openStaffIdx === idx ? null : idx)}
                                                >
                                                    {(item.staffIds || []).length > 0 ? (
                                                        item.staffIds.map(sId => {
                                                            const s = staff.find(st => String(st._id) === String(sId));
                                                            return (
                                                                <div key={sId} className="bg-primary text-white text-xs font-semibold pl-2 pr-1.5 py-1 rounded flex items-center gap-1.5 shadow-sm shadow-primary/20 animate-in zoom-in-95">
                                                                    <span className="uppercase">{s?.name || (item.type === 'service' ? 'Stylist' : 'Staff')}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleStaffInItem(idx, sId); }}
                                                                        className="w-4 h-4 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
                                                                    >
                                                                        <X className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-500 italic flex items-center px-2 py-1">{item.type === 'service' ? 'Select stylists...' : 'Select sales staff...'}</span>
                                                    )}
                                                    <div className="ml-auto px-1 flex items-center text-slate-300">
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${openStaffIdx === idx ? 'rotate-180 text-primary' : ''}`} />
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {openStaffIdx === idx && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                                            className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
                                                        >
                                                            <div className="p-2 border-b border-slate-50 bg-slate-50/30">
                                                                <div className="relative">
                                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        placeholder={item.type === 'service' ? 'Search stylist...' : 'Search sales staff...'}
                                                                        className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 outline-none rounded-lg focus:border-primary transition-all shadow-sm"
                                                                        value={staffSearch}
                                                                        onChange={(e) => setStaffSearch(e.target.value)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-[180px] overflow-y-auto scrollbar-thin">
                                                                {qFilteredStaff.filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase())).length > 0 ? (
                                                                    qFilteredStaff.filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase())).map(s => {
                                                                        const isSelected = (item.staffIds || []).includes(String(s._id));
                                                                        return (
                                                                            <button
                                                                                key={s._id}
                                                                                onClick={(e) => { e.stopPropagation(); toggleStaffInItem(idx, s._id); setOpenStaffIdx(null); }}
                                                                                className={`w-full p-2.5 text-left flex items-center gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                                                                            >
                                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                                    {isSelected ? <Check className="w-4 h-4" /> : s.name.charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className={`text-xs font-bold uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{s.name}</p>
                                                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider italic">{s.role || 'Staff'}</p>
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className="p-6 text-center text-slate-400 italic text-xs font-bold uppercase tracking-wider">No staff found</div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>{/* End Right Panel */}
                </div>{/* End flex body */}

                {/* Bottom Billing Row */}
                <div className="flex-shrink-0 bg-checkout-bar shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-20 w-full overflow-hidden" style={{ borderTop: '1px solid rgba(128, 128, 128, 0.15)' }}>
                    <div className="w-full px-3 py-3 flex items-center justify-between gap-3 overflow-x-auto whitespace-nowrap scrollbar-thin">
                        {/* Totals Breakdown */}
                        <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 px-1 shrink-0">
                            <div className="flex flex-col shrink-0">
                                <span className="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subtotal</span>
                                <span className="text-xs lg:text-sm xl:text-base font-bold text-slate-800 dark:text-slate-200 font-mono">₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            {totals.cgst > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        CGST {qCart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                            qCart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                    </span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                                        {totals.cgst > totals.cgstExcl && <span className="text-emerald-600 text-xs font-bold align-top mr-1">(INCL)</span>}
                                        ₹{totals.cgst.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {totals.sgst > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        SGST {qCart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                            qCart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                    </span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                                        {totals.sgst > totals.sgstExcl && <span className="text-emerald-600 text-xs font-bold align-top mr-1">(INCL)</span>}
                                        ₹{totals.sgst.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {totals.igst > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">IGST {totals.serviceGstRate === totals.productGstRate ? `(${totals.serviceGstRate}%)` : ''}</span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-slate-800 dark:text-slate-200 font-mono">
                                        {totals.igst > totals.totalExclusiveTax && <span className="text-emerald-600 text-xs font-bold align-top mr-1">(INCL)</span>}
                                        ₹{totals.igst.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col shrink-0">
                                <span className="text-[10px] lg:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Discount</span>
                                <div className="flex items-center rounded-lg overflow-hidden bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/60">
                                    <button
                                        type="button"
                                        onClick={() => setQManualDiscount(prev => ({ ...prev, type: prev.type === 'fixed' ? 'percentage' : 'fixed' }))}
                                        className="px-2 py-1 bg-discount-btn text-xs font-bold transition-colors"
                                        style={{ borderRight: '1px solid rgba(244, 63, 94, 0.2)' }}
                                    >
                                        {qManualDiscount.type === 'fixed' ? '₹' : '%'}
                                    </button>
                                    <input
                                        type="number"
                                        className="w-12 lg:w-14 bg-transparent text-xs lg:text-sm font-bold text-rose-600 dark:text-rose-400 outline-none font-mono text-center py-0.5"
                                        value={qManualDiscount.value || ''}
                                        onChange={(e) => setQManualDiscount({ ...qManualDiscount, value: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {totals.membershipDiscount > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-emerald-500" /> Save
                                    </span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-emerald-600 font-mono">-₹{totals.membershipDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {qClient && Number(qClient.dueAmount || 0) > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Prev. Due</span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-amber-600 font-mono">₹{Number(qClient.dueAmount).toFixed(2)}</span>
                                </div>
                            )}
                            {qCollectedPrevDue > 0 && (
                                <div className="flex flex-col shrink-0">
                                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Due Paid</span>
                                    <span className="text-xs lg:text-sm xl:text-base font-bold text-emerald-600 font-mono">+₹{qCollectedPrevDue.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Modern vertical separator */}
                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 self-center shrink-0" />

                        {/* Payment Date Input */}
                        <div className={`bg-checkout-box rounded-lg p-1.5 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm group shrink-0 w-[150px] ${!qPaymentDate ? 'bg-checkout-box-error' : ''}`}>
                            <label className={`text-[9px] font-bold uppercase tracking-wider block mb-0.5 ${!qPaymentDate ? 'text-rose-500 font-extrabold' : 'text-slate-400 dark:text-slate-500'}`}>
                                Payment Date <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <input
                                type="date"
                                required
                                className="bg-transparent text-xs font-bold outline-none uppercase text-slate-800 dark:text-slate-200 w-full cursor-pointer dark:[color-scheme:dark]"
                                value={qPaymentDate}
                                onChange={(e) => setQPaymentDate(e.target.value)}
                            />
                        </div>

                        {/* Modern vertical separator */}
                        <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 self-center shrink-0" />

                        {/* Payment Inputs Row */}
                        <div className={`grid gap-1.5 lg:gap-2 shrink-0 ${qClient && qClientWalletBalance > 0 ? 'w-[330px] lg:w-[390px] xl:w-[420px] grid-cols-3' : 'w-[220px] lg:w-[260px] xl:w-[280px] grid-cols-2'}`}>
                            <div className="bg-checkout-box p-1.5 rounded-lg focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm group">
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5 group-focus-within:text-emerald-500">Cash Payment</label>
                                <div className="flex items-center gap-1.5">
                                    <Banknote className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <input
                                        type="number"
                                        className="w-full bg-transparent text-xs lg:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none font-mono"
                                        value={qPayments.cash || ''}
                                        onChange={(e) => {
                                            setIsPaymentEdited(true);
                                            setQPayments({ ...qPayments, cash: Number(e.target.value) });
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="bg-checkout-box p-1.5 rounded-lg focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm group">
                                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5 group-focus-within:text-blue-500">Online/UPI</label>
                                <div className="flex items-center gap-1.5">
                                    <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />
                                    <input
                                        type="number"
                                        className="w-full bg-transparent text-xs lg:text-sm font-bold text-slate-800 dark:text-slate-200 outline-none font-mono"
                                        value={qPayments.online || ''}
                                        onChange={(e) => {
                                            setIsPaymentEdited(true);
                                            setQPayments({ ...qPayments, online: Number(e.target.value) });
                                        }}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {qClient && qClientWalletBalance > 0 && (
                                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/60 p-1.5 rounded-lg focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:shadow-sm transition-all shadow-sm group hover:border-emerald-200 dark:hover:border-emerald-800 animate-pulse">
                                    <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider block mb-0.5">Wallet (₹{qClientWalletBalance.toFixed(0)})</label>
                                    <div className="flex items-center justify-between gap-1.5">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <input
                                                type="number"
                                                className="w-full bg-transparent text-xs lg:text-sm font-bold text-emerald-600 dark:text-emerald-450 outline-none font-mono"
                                                value={qRedeemWallet || ''}
                                                onChange={(e) => setQRedeemWallet(Math.min(qClientWalletBalance, Math.min(totals.totalWithPrevDue, Number(e.target.value))))}
                                                placeholder="0"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const maxRedeemable = Math.min(qClientWalletBalance, totals.totalWithPrevDue);
                                                setQRedeemWallet(maxRedeemable);
                                            }}
                                            className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 px-1.5 py-1 rounded-md uppercase tracking-wider transition-colors shrink-0 shadow-sm"
                                        >
                                            USE WALLET
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Grand Total & Finalize Unified Checkout Card */}
                        <div className="flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-xl p-2 lg:p-2.5 shadow-xl border border-slate-800 shrink-0 w-[190px] lg:w-[220px] xl:w-[245px]">
                            {/* Top row: Net Bill & Total to Pay */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                                <div className="flex flex-col items-start pr-3">
                                    <span className="text-xs font-medium uppercase tracking-wider text-white/40 leading-none">Net Bill</span>
                                    <span className="text-sm md:text-base font-bold font-mono text-white leading-none mt-1">₹{totals.total.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-medium uppercase tracking-wider text-white/50 leading-none">Total to Pay</span>
                                    <span className="text-base lg:text-lg xl:text-xl font-bold font-mono leading-none mt-1">₹{totals.totalWithPrevDue.toFixed(2)}</span>
                                </div>
                            </div>



                            {/* Badges/Info Row (Compact) */}
                            {Math.round(dueAmount * 100) / 100 > 0 && (
                                <div className="flex items-center justify-center bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-xl gap-1 mb-2">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                                    <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">This bill due: ₹{dueAmount.toFixed(2)}</span>
                                </div>
                            )}



                            {/* Overpaid feedback */}
                            {isOverpaid && (
                                <div className="flex items-center justify-center bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-xl gap-1 mb-2 animate-pulse">
                                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                                    <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Overpaid: ₹{overpaidDiff.toFixed(2)}</span>
                                </div>
                            )}

                            {totals.redeemWallet > 0 && (
                                <div className="text-center mb-2">
                                    {/* <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider leading-none bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">Wallet Used: -₹{totals.redeemWallet.toFixed(2)}</span> */}
                                </div>
                            )}

                            {/* Finalize Button */}
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing || qCart.length === 0 || isOverpaid}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all rounded-lg disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Finalize Bill</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Outstanding Due Warning Popup */}
            <AnimatePresence>
                {showDueWarning && pendingClientSelect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
                        >
                            {/* Warning Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-tight">Outstanding Due Alert</h4>
                                    <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider mt-0.5">Previous balance detected</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                    <div className="w-12 h-12 bg-amber-500 text-white font-bold rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                        {pendingClientSelect.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-tight">{pendingClientSelect.name}</p>
                                        <p className="text-xs font-semibold text-slate-500 font-mono mt-0.5">{pendingClientSelect.phone}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Owes</p>
                                        <p className="text-xl font-bold text-amber-600 font-mono italic mt-0.5">₹{clientPrevDue.toFixed(0)}</p>
                                    </div>
                                </div>

                                <p className="text-xs font-bold text-slate-500 text-center leading-relaxed">
                                    This client has a pending outstanding balance from a previous visit. You may collect it now along with this bill or proceed and add to their running dues.
                                </p>

                                {/* Quick Collect Option */}
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Quick collect previous due now
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        <input
                                            type="number"
                                            placeholder={`Up to ₹${clientPrevDue.toFixed(0)}`}
                                            className="flex-1 bg-white border border-emerald-200 px-3 py-2 text-xs md:text-sm font-bold text-slate-900 outline-none rounded-lg focus:border-emerald-500 transition-all font-mono"
                                            value={qCollectedPrevDue || ''}
                                            onChange={(e) => setQCollectedPrevDue(Math.min(Math.ceil(clientPrevDue), Number(e.target.value)))}
                                            max={Math.ceil(clientPrevDue)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => { setShowDueWarning(false); setPendingClientSelect(null); }}
                                    className="flex-1 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider border border-slate-200 rounded-xl hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setQClient(pendingClientSelect);
                                        setShowDueWarning(false);
                                        setPendingClientSelect(null);
                                    }}
                                    className="flex-1 py-3 text-xs font-bold text-white uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    Collect & Proceed
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Create Client Modal */}
            <AnimatePresence>
                {showNewClient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                    >
                        <motion.form
                            initial={{ scale: 0.9, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            onSubmit={handleQuickCreateClient}
                            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
                        >
                            <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-primary" /> New Quick Client
                                </h4>
                                <button type="button" onClick={() => setShowNewClient(false)} className="text-slate-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Customer Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-900 outline-none rounded-xl"
                                        value={newClientForm.name}
                                        onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Contact Number</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="10-digit mobile"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-900 outline-none rounded-xl"
                                        value={newClientForm.phone}
                                        onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Referral Code (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. WAP-XXXXXX"
                                        className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-bold text-slate-900 outline-none rounded-xl"
                                        value={newClientForm.appliedReferralCode || ''}
                                        onChange={(e) => setNewClientForm({ ...newClientForm, appliedReferralCode: e.target.value.toUpperCase().trim() })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Birth Date</label>
                                        <input
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold text-slate-900 outline-none rounded-xl dark:[color-scheme:dark]"
                                            value={newClientForm.dob}
                                            onChange={(e) => setNewClientForm({ ...newClientForm, dob: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Anniversary</label>
                                        <input
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-slate-50 border border-slate-200 p-3 text-[11px] font-bold text-slate-900 outline-none rounded-xl dark:[color-scheme:dark]"
                                            value={newClientForm.anniversary}
                                            onChange={(e) => setNewClientForm({ ...newClientForm, anniversary: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={isSubmittingClient}
                                    className="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSubmittingClient ? 'Creating...' : 'Create & Select'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
