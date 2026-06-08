import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    Scissors, Package, Check, Loader2, Scan,
    Sparkles, User, UserPlus, ArrowRight, Percent, Info,
    Tag, Star, Wallet, Printer, Banknote, Smartphone, FileText, Download,
    ShoppingBag, CreditCard, Ticket, Gift, History, Calendar, Globe, Building2, ChevronDown,
    AlertTriangle, CheckCircle2, UserMinus, LayoutGrid, ArrowDown, Clock, Brush, Droplet,
    Edit
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

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
        console.log('[Auto-WhatsApp] Invalid phone number (less than 10 digits). Skipping...');
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

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

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
        setFocusedItemIndex(-1);
    }, [searchItem, activeTab, serviceMode, selectedCategory]);

    useEffect(() => {
        if (focusedItemIndex >= 0) {
            const activeEl = document.getElementById(`pos-item-${focusedItemIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [focusedItemIndex]);

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
            }, { skipToast: true });

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
    const [previousDuePaidAmount, setPreviousDuePaidAmount] = useState(0);
    const [paymentDate, setPaymentDate] = useState(getTodayDateString());
    const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
    const [isWhatsAppSending, setIsWhatsAppSending] = useState(false);
    const [invoiceIdToEdit, setInvoiceIdToEdit] = useState(null);
    const [editInvoiceData, setEditInvoiceData] = useState(null);
    const loadedInvoiceIdRef = useRef(null);

    // ── Handle Incoming Navigation State (from Appointments or Edit Invoice) ──
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
        }
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            if (location.state.activeTab === 'services' && location.state.serviceMode) {
                setServiceMode(location.state.serviceMode);
            }
        }
        if (location.state?.client) {
            setSelectedClient(location.state.client);
            setShowClientInfo(true);
            // Pre-select booking ID if routing directly from booking page
            if (location.state.bookingId) {
                const bId = location.state.bookingId;
                const booking = businessBookings.find(b => b._id === bId);
                if (booking) {
                    const staffId = booking.staffId?._id || booking.staffId;
                    const newCartItem = {
                        ...booking,
                        itemId: booking.serviceId?._id || booking.serviceId || booking._id,
                        type: 'service',
                        quantity: 1,
                        staffIds: staffId ? [staffId] : [],
                        appointmentId: booking._id
                    };
                    setCart([newCartItem]);
                    setSelectedBookingIds([bId]);
                    setAppointmentId(bId);
                }
            }
            // If an appointmentId was passed, store it for status updates
            if (location.state.appointmentId) {
                setAppointmentId(location.state.appointmentId);
            }
        }

        if (location.state?.editInvoice) {
            const invoice = location.state.editInvoice;
            if (loadedInvoiceIdRef.current === invoice._id) {
                return;
            }
            loadedInvoiceIdRef.current = invoice._id;

            // Quick Invoices do not have bookingId or orderId
            const isQuickInvoice = !invoice.bookingId && !invoice.orderId;
            if (isQuickInvoice) {
                setEditInvoiceData(invoice);
                setShowQuickInvoice(true);
                setInvoiceIdToEdit(invoice._id);
                toast.success(`Loaded Quick Invoice ${invoice.invoiceNumber || ''} for editing.`);
            } else {
                if (invoice.customerId || invoice.client) {
                    setSelectedClient(invoice.customerId || invoice.client);
                    setShowClientInfo(true);
                }
                if (invoice.items && Array.isArray(invoice.items)) {
                    setCart(invoice.items.map(item => ({
                        ...item,
                        itemId: item.itemId?._id || item.itemId || item.id,
                        quantity: item.quantity,
                        price: item.price,
                        name: item.name,
                        type: item.type,
                        stylistIds: (item.stylistIds || []).map(s => s._id || s)
                    })));
                }
                if (invoice.payments && invoice.payments.length > 0) {
                    setPayments(invoice.payments);
                }
                if (invoice.bookingId) {
                    const bId = invoice.bookingId._id || invoice.bookingId;
                    setAppointmentId(bId);
                    setSelectedBookingIds([bId]);
                }
                if (invoice.orderId) {
                    const oId = invoice.orderId._id || invoice.orderId;
                    setOrderId(oId);
                    setSelectedOrderIds([oId]);
                }
                setInvoiceIdToEdit(invoice._id);
                toast.success(`Loaded Invoice ${invoice.invoiceNumber} for editing.`);
            }
        }
    }, [location.state, businessCustomers, businessBookings]);

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
            activeMembership: (appointmentId || orderId) ? null : activeMembership,
            serviceGstRate: Number(platformSettings?.serviceGst ?? fiscal.serviceGst ?? 5),
            productGstRate: Number(platformSettings?.productGst ?? fiscal.productGst ?? 10),
            inclusiveTaxFallback: !!fiscal.inclusiveTax,
            customerState,
            salonState: fiscal.state,
            includePreviousDue,
            previousDue: Number(previousDuePaidAmount || 0),
            redeemWallet,
            payments
        });
    }, [cart, manualDiscount, appliedPromotion, appliedVoucher, activeMembership, redeemWallet, taxPercent, selectedClient, includePreviousDue, previousDuePaidAmount, fiscal, platformSettings, customerState, payments, appointmentId, orderId]);

    // Get real-time wallet balance
    const clientWalletBalance = useMemo(() => {
        if (!selectedClient?._id) return 0;
        return (allWallets || {})[selectedClient._id]?.balance || 0;
    }, [selectedClient, allWallets]);

    const selectedBooking = useMemo(() => {
        return appointmentId ? businessBookings?.find(b => b._id === appointmentId) : null;
    }, [appointmentId, businessBookings]);

    const bookingAdvancePaid = useMemo(() => {
        return selectedBooking ? Number(selectedBooking.advancePaid || 0) : 0;
    }, [selectedBooking]);

    const isOverpaid = useMemo(() => {
        const mainPaidAmount = payments.reduce((s, p) => s + p.amount, 0);
        return mainPaidAmount - (totals.total - totals.redeemWallet) > 0.005;
    }, [payments, totals.total, totals.redeemWallet]);

    // Sync payment amount to total unless manually edited by user
    useEffect(() => {
        if (!isManualPayment && payments.length === 1) {
            const remainingPay = Math.max(0, totals.total - bookingAdvancePaid);
            setPayments([{ ...payments[0], amount: remainingPay }]);
        }
    }, [totals.total, isManualPayment, payments.length, bookingAdvancePaid]);

    // Main Terminal Overpayment Warning Toast
    useEffect(() => {
        const mainPaidAmount = payments.reduce((s, p) => s + p.amount, 0);
        const mainTotalLiability = totals.total - totals.redeemWallet;
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
                // SELECT: Replace cart with this single booking
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
                // ── Single selection: replace the cart entirely ──
                setCart([newCartItem]);
                setSelectedBookingIds([item._id]);
                const bookingOutletId = item.outletId?._id || item.outletId;
                if (bookingOutletId) setActiveOutletId(String(bookingOutletId), { quiet: true, background: true });
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
                // SELECT: Replace cart with this single order
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
                // ── Single selection: replace the cart entirely ──
                setCart(newCartItems);
                setSelectedOrderIds([item._id]);
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

        const walletPaymentsSum = payments.filter(p => p.method === 'wallet').reduce((s, p) => s + p.amount, 0);
        const totalWalletUse = (redeemWallet || 0) + walletPaymentsSum;
        if (totalWalletUse > clientWalletBalance) {
            alert(`Insufficient wallet balance. Customer wallet balance is ₹${clientWalletBalance.toFixed(2)}`);
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
                    payments: (() => {
                        const finalP = payments.filter(p => p.method !== 'wallet').map(p => ({ method: p.method, amount: p.amount }));
                        if (bookingAdvancePaid > 0) {
                            finalP.push({ method: 'advance', amount: bookingAdvancePaid });
                        }
                        return finalP;
                    })(),
                    useWalletAmount: totals.redeemWallet + walletPaymentsSum,
                    discount: totals.discount,
                    membershipDiscount: totals.membershipDiscount,
                    previousDueCollected: includePreviousDue ? Number(previousDuePaidAmount || 0) : 0,
                    bookingId: appointmentId,
                    orderId: orderId
                };

                if (appliedPromotion?._id) {
                    checkoutPayload.promotionId = String(appliedPromotion._id);
                }

                // REAL BACKEND CALL
                let response;
                if (invoiceIdToEdit) {
                    response = await api.put(`/pos/invoices/${invoiceIdToEdit}`, checkoutPayload);
                } else {
                    response = await api.post('/pos/checkout', checkoutPayload);
                }
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
        // setRedeemPoints(0);
        setRedeemWallet(0);
        setOrderId(null);
        setAppointmentId(null);
        setSelectedBookingIds([]);
        setSelectedOrderIds([]);
        setIncludePreviousDue(false);
        setPreviousDuePaidAmount(0);
        setPaymentDate(getTodayDateString());
        setInvoiceIdToEdit(null);
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
                return;
            }
            // ESC: Close Modals / Reset Focus
            if (e.key === 'Escape') {
                setShowDiscountModal(false);
                setShowNewClient(false);
                setFocusedItemIndex(-1);
                searchInputRef.current?.blur();
            }
            // Arrow Down: Navigate item list
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedItemIndex(prev => {
                    const nextIdx = prev + 1;
                    return nextIdx < filteredItems.length ? nextIdx : prev;
                });
            }
            // Arrow Up: Navigate item list
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedItemIndex(prev => {
                    const nextIdx = prev - 1;
                    return nextIdx >= 0 ? nextIdx : prev;
                });
            }
            // Enter Key: Add active item to cart
            if (e.key === 'Enter' && !e.ctrlKey && focusedItemIndex >= 0) {
                e.preventDefault();
                const item = filteredItems[focusedItemIndex];
                if (item) {
                    addToCart(item);
                }
            }
            // Left / Right Arrow: Switch between Services and Products tabs
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const activeEl = document.activeElement;
                const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
                const isSearchFocusedEmpty = activeEl === searchInputRef.current && !searchItem;

                if (!isInputActive || isSearchFocusedEmpty) {
                    e.preventDefault();
                    if (e.key === 'ArrowLeft') {
                        setActiveTab('services');
                    } else {
                        setActiveTab('products');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [successInvoice, cart, selectedClient, payments, totals, filteredItems, focusedItemIndex, searchItem]);

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
                        className="px-4 py-1.5 !bg-[#B4912B] hover:!bg-[#9e7f25] !text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#B4912B]/20 rounded-lg"
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
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${activeTab === 'services' && serviceMode === 'bookings'
                                    ? '!bg-[#cca839] !text-white shadow-sm font-black'
                                    : '!bg-transparent !text-[#cca839] hover:!text-[#cca839]/80 dark:!text-[#cca839] dark:hover:!text-[#cca839]/80'
                                    }`}
                            >Completed Bookings</button>
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('orders');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${activeTab === 'services' && serviceMode === 'orders'
                                    ? '!bg-[#cca839] !text-white shadow-sm font-black'
                                    : '!bg-transparent !text-[#cca839] hover:!text-[#cca839]/80 dark:!text-[#cca839] dark:hover:!text-[#cca839]/80'
                                    }`}
                            >Completed Orders</button>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto gap-3 p-1 pr-2 custom-scrollbar content-start ${serviceMode === 'bookings' || serviceMode === 'orders'
                            ? 'grid grid-cols-1 md:grid-cols-2'
                            : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                        }`}>
                        {filteredItems.map((item, idx) => {
                            const isSelected = item.isAppointment
                                ? selectedBookingIds.includes(item._id)
                                : item.isOrder
                                    ? selectedOrderIds.includes(item._id)
                                    : cart.some(c => String(c.itemId) === String(item._id || item.id));
                            const isFocused = idx === focusedItemIndex;

                            // ── BOOKING CARD ──────────────────────────────────
                            if (item.isAppointment) {
                                const b = item.originalBooking || item;
                                const clientName = b.clientId?.name || b.clientName || 'Walk-in';
                                const serviceName = b.serviceId?.name || b.serviceName || 'Service';
                                const stylistName = b.staffId?.name || b.stylistId?.name || b.staffName || null;
                                const dateStr = b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
                                const timeStr = b.startTime || b.time || null;
                                const initials = clientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                    <button
                                        id={`pos-item-${idx}`}
                                        key={item._id}
                                        onClick={() => addToCart(item)}
                                        className={`relative bg-white text-left transition-all duration-200 group rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] border ${isSelected
                                                ? 'border-[#cca839] ring-2 ring-[#cca839]/25'
                                                : 'border-slate-100 hover:border-[#cca839]/50'
                                            }`}
                                    >

                                        <div className="p-3.5">
                                            {/* Header row: avatar + name + badge */}
                                            <div className="flex items-center gap-2.5 mb-2.5">
                                                {/* Client Avatar */}
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm ${isSelected ? 'bg-[#cca839] text-white' : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                                                    }`}>
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-black text-slate-800 truncate leading-tight">{clientName}</p>
                                                    {b.clientId?.phone && <p className="text-[9px] font-semibold text-slate-400 tracking-wider">{b.clientId.phone.replace(/(\d{5})(\d{5})/, '•••••$2')}</p>}
                                                </div>
                                                {isSelected ? (
                                                    <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                                                        <Check className="w-2.5 h-2.5" /> Billed
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                                        Bill
                                                    </div>
                                                )}
                                            </div>

                                            {/* Service Name */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Scissors className="w-3 h-3 text-violet-500 shrink-0" />
                                                <p className="text-[11px] font-bold text-slate-700 truncate">{serviceName}</p>
                                            </div>

                                            {/* Meta row: stylist + date/time */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {stylistName && (
                                                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                        <User className="w-2.5 h-2.5" /> {stylistName}
                                                    </span>
                                                )}
                                                {dateStr && (
                                                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                        <Calendar className="w-2.5 h-2.5" /> {dateStr}
                                                    </span>
                                                )}
                                                {timeStr && (
                                                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                        <Clock className="w-2.5 h-2.5" /> {timeStr}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price row */}
                                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60">
                                                <div>
                                                    <p className="text-base font-black text-slate-900">₹{item.price}</p>
                                                    {Number(b.advancePaid || 0) > 0 && (
                                                        <div className="text-[10px] font-bold text-slate-500 mt-1 space-y-0.5">
                                                            <div className="text-amber-600 dark:text-amber-400">Advance: ₹{b.advancePaid}</div>
                                                            <div className="text-[#cca839] font-extrabold">Remaining: ₹{Math.max(0, item.price - b.advancePaid)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${item.isInclusiveTax
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                                                    }`}>{item.isInclusiveTax ? 'Incl. GST' : 'Excl. GST'}</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            }

                            // ── ORDER CARD ────────────────────────────────────
                            if (item.isOrder) {
                                const o = item.originalOrder || item;
                                const customerName = o.customerId?.name || 'Walk-in';
                                const itemCount = Array.isArray(o.items) ? o.items.length : 0;
                                const orderId = `#${o._id?.toString().slice(-6).toUpperCase()}`;
                                const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : null;
                                const initials = customerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                    <button
                                        id={`pos-item-${idx}`}
                                        key={item._id}
                                        onClick={() => addToCart(item)}
                                        className={`relative bg-white text-left transition-all duration-200 group rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] border ${isSelected
                                                ? 'border-[#cca839] ring-2 ring-[#cca839]/25'
                                                : 'border-slate-100 hover:border-[#cca839]/50'
                                            }`}
                                    >

                                        <div className="p-3.5">
                                            {/* Header: Order ID + status badge */}
                                            <div className="flex items-center justify-between mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm ${isSelected ? 'bg-[#cca839] text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                        }`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-800 leading-tight">{customerName}</p>
                                                        <p className="text-[9px] font-bold text-emerald-600 tracking-wider">{orderId}</p>
                                                    </div>
                                                </div>
                                                {isSelected ? (
                                                    <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                        <Check className="w-2.5 h-2.5" /> Billed
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        Bill
                                                    </div>
                                                )}
                                            </div>

                                            {/* Items preview */}
                                            {itemCount > 0 && (
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Package className="w-3 h-3 text-teal-500 shrink-0" />
                                                    <p className="text-[10px] font-semibold text-slate-600 truncate">
                                                        {Array.isArray(o.items) && o.items.slice(0, 2).map(i => i.productId?.name || i.name || 'Item').join(', ')}
                                                        {itemCount > 2 && ` +${itemCount - 2} more`}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Meta: date + items count */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {orderDate && (
                                                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                        <Calendar className="w-2.5 h-2.5" /> {orderDate}
                                                    </span>
                                                )}
                                                {itemCount > 0 && (
                                                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                                        <ShoppingBag className="w-2.5 h-2.5" /> {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price row */}
                                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60">
                                                <p className="text-base font-black text-slate-900">₹{item.price}</p>
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Paid Order
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            }

                            // ── CATALOG CARD (Services / Products) ────────────
                            const img = item.image || item.images?.[0];
                            return (
                                <button
                                    id={`pos-item-${idx}`}
                                    key={item.id || item._id}
                                    onClick={() => addToCart(item)}
                                    className={`relative bg-white dark:bg-slate-900/50 border rounded-2xl text-left transition-all duration-200 group flex flex-col overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${isSelected
                                            ? 'border-[#cca839] ring-1 ring-[#cca839]/40'
                                            : 'border-slate-100 dark:border-slate-800/80 hover:border-[#cca839]/40'
                                        }`}
                                >
                                    {/* Image thumbnail */}
                                    <div className="relative w-full h-[80px] bg-slate-50 dark:bg-slate-800/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {img ? (
                                            <img
                                                src={getImageUrl(img)}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full items-center justify-center bg-slate-100 dark:bg-slate-800 ${img ? 'hidden' : 'flex'}`}>
                                            {activeTab === 'services'
                                                ? <Scissors className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                                                : <Package className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                                            }
                                        </div>
                                        {/* In Cart / ADD badge overlay */}
                                        {isSelected ? (
                                            <div className="absolute inset-0 bg-[#cca839]/15 flex items-center justify-center">
                                                <div className="bg-[#cca839] text-white text-[8px] font-black px-2 py-1 uppercase tracking-wider rounded-lg shadow flex items-center gap-1">
                                                    <Check className="w-2.5 h-2.5" /> In Cart
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-end p-1.5">
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-white bg-[#cca839] px-2 py-0.5 rounded-md uppercase tracking-wider shadow">ADD</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info section */}
                                    <div className="flex flex-col flex-1 p-2.5 gap-1">
                                        <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 line-clamp-2 uppercase tracking-tight leading-tight">
                                            {item.name}
                                        </h4>
                                        <div className="flex items-center justify-between gap-1 mt-auto pt-1 border-t border-dashed border-slate-100 dark:border-slate-800/60">
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">₹{item.price}</p>
                                            <span className={`text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-wider ${item.isInclusiveTax
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                    : 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400'
                                                }`}>{item.isInclusiveTax ? 'Incl' : 'Excl'}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    RIGHT PANEL — BILLING SUMMARY
                    ══════════════════════════════════════════════ */}
                <div className="w-full lg:w-[420px] h-full flex flex-col bg-[#f8fafc] border-l border-slate-200 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">

                    {serviceMode === 'bookings' || serviceMode === 'orders' ? (
                        /* ══ ENTERPRISE BILLING SUMMARY — pre-paid bookings/orders ══ */
                        <>
                            {/* Glass header */}
                            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#cca839]/20 flex items-center justify-center">
                                        <FileText className="w-4 h-4" style={{ color: '#cca839' }} />
                                    </div>
                                    <div>
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 leading-none">Billing Summary</h2>
                                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                                            {serviceMode === 'bookings' ? 'Service Booking' : 'Product Order'}
                                        </p>
                                    </div>
                                </div>
                                {cart.length > 0 && (
                                    <span className="bg-[#cca839] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {cart.length} item{cart.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-40">

                                {/* ── 1. CUSTOMER INFORMATION ── */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        <User className="w-3.5 h-3.5" style={{ color: '#cca839' }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Customer Information</span>
                                    </div>
                                    <div className="p-4 flex items-start gap-3">
                                        {selectedClient ? (
                                            <>
                                                {/* Avatar */}
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 shadow-sm ${
                                                    activeMembership
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                        : 'bg-gradient-to-br from-[#cca839] to-amber-500 text-white'
                                                }`}>
                                                    {selectedClient.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'CL'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">{selectedClient.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{maskPhone(selectedClient.phone, user?.role)}</p>
                                                    {selectedClient.email && <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">{selectedClient.email}</p>}
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {selectedClient._id && (
                                                            <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">
                                                                ID: {String(selectedClient._id).slice(-6).toUpperCase()}
                                                            </span>
                                                        )}
                                                        {selectedClient.createdAt && (
                                                            <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">
                                                                Since {new Date(selectedClient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        )}
                                                        {Number(selectedClient.dueAmount || 0) > 0 && (
                                                            <span className="text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-md uppercase animate-pulse flex items-center gap-0.5">
                                                                <AlertTriangle className="w-2.5 h-2.5" /> Due ₹{Number(selectedClient.dueAmount).toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {activeMembership && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-1 rounded-lg w-fit">
                                                            <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                                            {activeMembership.planId?.name || 'Member'} — Active
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-3 opacity-40">
                                                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="text-[11px] italic text-slate-400">No client selected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ── 2. OUTLET & BOOKING INFO ── */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        <Building2 className="w-3.5 h-3.5" style={{ color: '#cca839' }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Outlet Information</span>
                                    </div>
                                    <div className="p-4 space-y-2.5">
                                        {(() => {
                                            const booking = appointmentId ? businessBookings?.find(b => b._id === appointmentId) : null;
                                            const order = orderId ? businessOrders?.find(o => o._id === orderId) : null;
                                            const bOutletId = (booking || order) ? (booking?.outletId?._id || booking?.outletId || order?.outletId?._id || order?.outletId) : activeOutletId;
                                            const sel = outlets.find(o => String(o._id) === String(bOutletId));
                                            const source = booking || order;
                                            const bookingIdStr = appointmentId ? `BK-${String(appointmentId).slice(-8).toUpperCase()}` :
                                                orderId ? `ORD-${String(orderId).slice(-8).toUpperCase()}` : null;
                                            const bookedBy = source?.createdBy?.name || source?.staffId?.name || 'Admin';
                                            const bookedAt = source?.createdAt || source?.date;
                                            return (
                                                <>
                                                    <div className="flex items-center justify-between relative">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">{sel ? sel.name : 'Select Outlet'}</span>
                                                        </div>
                                                        {!(appointmentId || orderId) && (
                                                            <button
                                                                onClick={() => setShowOutletPickerMain(!showOutletPickerMain)}
                                                                className="text-[9px] font-bold text-[#cca839] hover:underline flex items-center gap-0.5"
                                                            >
                                                                Change <ChevronDown className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <AnimatePresence>
                                                            {showOutletPickerMain && !appointmentId && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 6 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 6 }}
                                                                    className="absolute top-full right-0 mt-1 bg-white border border-border shadow-2xl rounded-xl overflow-hidden z-[80] min-w-[160px]"
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
                                                    {bookingIdStr && (
                                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
                                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono">{bookingIdStr}</p>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Type</p>
                                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{serviceMode === 'bookings' ? 'Service Booking' : 'Product Order'}</p>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Booked By</p>
                                                                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{bookedBy}</p>
                                                            </div>
                                                            {bookedAt && (
                                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                                                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{new Date(bookedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* ── 3. ORDER SUMMARY ── */}
                                {cart.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                            <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#cca839' }} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Order Summary</span>
                                            <span className="ml-auto text-[8px] font-bold bg-[#cca839]/10 text-[#cca839] px-1.5 py-0.5 rounded-full">{cart.length} items</span>
                                        </div>
                                        <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                            {cart.map((item, idx) => {
                                                const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                            {item.type === 'service'
                                                                ? <Scissors className="w-3.5 h-3.5 text-[#cca839]" />
                                                                : <Package className="w-3.5 h-3.5 text-slate-500" />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Qty {item.quantity} × ₹{Number(item.price).toFixed(0)}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-[12px] font-black text-slate-900 dark:text-white">₹{lineTotal.toFixed(2)}</p>
                                                            <span className={`text-[7px] font-bold px-1 py-0.5 rounded uppercase ${
                                                                (item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal?.inclusiveTax))
                                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30'
                                                                    : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30'
                                                            }`}>
                                                                {(item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal?.inclusiveTax)) ? 'Incl. GST' : 'Excl. GST'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ── 4. PRICE BREAKDOWN ── */}
                                {cart.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                            <Tag className="w-3.5 h-3.5 text-[#cca839]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Price Breakdown</span>
                                        </div>
                                        <div className="px-4 py-3 space-y-2">
                                            {/* Subtotal */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Subtotal</span>
                                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">₹{totals.subtotal?.toFixed(2) ?? cart.reduce((s,i) => s + (Number(i.price)||0)*(Number(i.quantity)||1), 0).toFixed(2)}</span>
                                            </div>

                                            {/* Membership discount */}
                                            {totals.membershipDiscount > 0 && (
                                                <div className="flex items-center justify-between text-[#16a34a]">
                                                    <span className="text-[11px] font-semibold flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        Membership Disc ({activeMembership?.planId?.name || 'Member'})
                                                    </span>
                                                    <span className="text-[11px] font-black">− ₹{totals.membershipDiscount.toFixed(2)}</span>
                                                </div>
                                            )}

                                            {/* Manual/admin discount */}
                                            {totals.discount > 0 && (
                                                <div className="flex items-center justify-between text-[#16a34a]">
                                                    <span className="text-[11px] font-semibold flex items-center gap-1">
                                                        <Tag className="w-3 h-3" />
                                                        {manualDiscount?.value > 0 ? `Admin Discount (${manualDiscount.type === 'percentage' ? `${manualDiscount.value}%` : `₹${manualDiscount.value}`})` :
                                                            appliedPromotion ? `Promo: ${appliedPromotion.name || 'Promo'}` :
                                                                appliedVoucher ? `Voucher` : 'Discount'}
                                                    </span>
                                                    <span className="text-[11px] font-black">− ₹{totals.discount.toFixed(2)}</span>
                                                </div>
                                            )}

                                            {/* Wallet */}
                                            {totals.redeemWallet > 0 && (
                                                <div className="flex items-center justify-between text-[#16a34a]">
                                                    <span className="text-[11px] font-semibold flex items-center gap-1">
                                                        <Wallet className="w-3 h-3" /> Wallet Used
                                                    </span>
                                                    <span className="text-[11px] font-black">− ₹{totals.redeemWallet.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {bookingAdvancePaid > 0 && (
                                                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                                                    <span className="text-[11px] font-semibold flex items-center gap-1">
                                                        <Wallet className="w-3 h-3" /> Advance Paid
                                                    </span>
                                                    <span className="text-[11px] font-black">− ₹{bookingAdvancePaid.toFixed(2)}</span>
                                                </div>
                                            )}

                                            {/* Total discount line */}
                                            {(totals.discount + totals.membershipDiscount + totals.redeemWallet) > 0 && (
                                                <div className="flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 text-[#16a34a]">
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Total Discount</span>
                                                    <span className="text-[11px] font-black">− ₹{(totals.discount + totals.membershipDiscount + totals.redeemWallet).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── 5. GST SECTION ── */}
                                {cart.length > 0 && (totals.cgst > 0 || totals.sgst > 0 || totals.igst > 0) && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                        {(() => {
                                            const hasIncl = cart.some(i => i.isInclusiveTax === true || String(i.isInclusiveTax) === 'true' || (i.isInclusiveTax === undefined && fiscal?.inclusiveTax));
                                            const hasExcl = cart.some(i => !(i.isInclusiveTax === true || String(i.isInclusiveTax) === 'true' || (i.isInclusiveTax === undefined && fiscal?.inclusiveTax)));
                                            return (
                                                <>
                                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                                        <Percent className="w-3.5 h-3.5" style={{ color: '#cca839' }} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">GST Details</span>
                                                        <div className="flex gap-1 ml-auto">
                                                            {hasIncl && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 !text-emerald-700 border border-emerald-200">GST Included</span>}
                                                            {hasExcl && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 !text-orange-700 border border-orange-200">GST Exclusive</span>}
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-3 space-y-2">
                                                        {totals.cgst > 0 && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                                    CGST ({(totals.serviceGstRate / 2).toFixed(1)}%)
                                                                    {totals.cgst > totals.cgstExcl && <span className="ml-1 text-[8px] text-emerald-600">(Incl.)</span>}
                                                                </span>
                                                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">₹{totals.cgst.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {totals.sgst > 0 && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                                                    SGST ({(totals.serviceGstRate / 2).toFixed(1)}%)
                                                                    {totals.sgst > totals.sgstExcl && <span className="ml-1 text-[8px] text-emerald-600">(Incl.)</span>}
                                                                </span>
                                                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">₹{totals.sgst.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {totals.igst > 0 && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">IGST ({totals.serviceGstRate}%)</span>
                                                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">₹{totals.igst.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* ── 6. APPLIED BENEFITS ── */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        <Gift className="w-3.5 h-3.5" style={{ color: '#cca839' }} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Applied Benefits</span>
                                    </div>
                                    <div className="px-4 py-3">
                                        {(() => {
                                            const benefits = [];
                                            if (activeMembership) benefits.push({ label: `${activeMembership.planId?.name || 'Membership'} Discount`, icon: <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />, color: 'emerald' });
                                            if (manualDiscount?.value > 0) benefits.push({ label: `Admin Discount (${manualDiscount.type === 'percentage' ? `${manualDiscount.value}%` : `₹${manualDiscount.value}`})`, icon: <Tag className="w-3 h-3 text-blue-500" />, color: 'blue' });
                                            if (appliedPromotion) benefits.push({ label: `Promo: ${appliedPromotion.name || appliedPromotion.code || 'Code'}`, icon: <Ticket className="w-3 h-3 text-purple-500" />, color: 'purple' });
                                            if (appliedVoucher) benefits.push({ label: `Voucher: ${appliedVoucher.code || 'Applied'}`, icon: <Gift className="w-3 h-3 text-rose-500" />, color: 'rose' });
                                            if (redeemWallet > 0) benefits.push({ label: `Wallet: ₹${redeemWallet.toFixed(2)} used`, icon: <Wallet className="w-3 h-3 text-amber-500" />, color: 'amber' });
                                            if (benefits.length === 0) return <p className="text-[10px] text-slate-400 italic text-center py-2">No discounts applied</p>;
                                            return (
                                                <div className="space-y-1.5">
                                                    {benefits.map((b, i) => (
                                                        <div key={i} className={`flex items-center gap-2 text-[10px] font-semibold text-${b.color}-700 bg-${b.color}-50 dark:bg-${b.color}-900/20 px-2.5 py-1.5 rounded-xl border border-${b.color}-100 dark:border-${b.color}-900/30`}>
                                                            <Check className="w-3 h-3 shrink-0" />
                                                            {b.icon}
                                                            <span>{b.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* ── 7. PAYMENT DETAILS ── */}
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                                        <Wallet className="w-3.5 h-3.5 text-[#cca839]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Payment Details</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-wider">Payment Date <span className="text-rose-500 font-bold">*</span></span>
                                            <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase rounded-lg px-2.5 py-1 outline-none text-slate-800 dark:text-slate-200 dark:[color-scheme:dark] focus:border-[#cca839]/50 cursor-pointer" />
                                        </div>
                                        <div className="flex items-center justify-between pb-1">
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payment Method</span>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#cca839] cursor-pointer hover:opacity-80 transition-all bg-[#cca839]/5 px-2 py-1 rounded-lg border border-[#cca839]/10">
                                                <input type="checkbox" checked={isManualPayment} onChange={(e) => { setIsManualPayment(e.target.checked); if (e.target.checked) { setTimeout(() => { const el = document.querySelector('input[type="number"][data-payment-idx="0"]'); el?.focus(); el?.select(); }, 100); } }} className="w-3 h-3 rounded border-[#cca839]/20 text-[#cca839] focus:ring-[#cca839]/20 cursor-pointer" />
                                                <span className="uppercase tracking-tight text-slate-500 dark:text-slate-400">Partial Pay</span>
                                            </label>
                                        </div>
                                        {selectedClient && Number(selectedClient.dueAmount || 0) > 0 && (
                                            <div className="flex flex-col gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-rose-600 select-none">
                                                    <input type="checkbox" checked={includePreviousDue} onChange={(e) => {
                                                        setIncludePreviousDue(e.target.checked);
                                                        const dueVal = e.target.checked ? Number(selectedClient.dueAmount || 0) : 0;
                                                        setPreviousDuePaidAmount(dueVal);
                                                        if (!isManualPayment && payments.length === 1) {
                                                            setPayments([{ ...payments[0], amount: totals.currentBillTotal + dueVal }]);
                                                        }
                                                    }} className="w-3 h-3 rounded border-rose-200 text-rose-600 focus:ring-rose-500/20 cursor-pointer" />
                                                    <span className="uppercase tracking-tight">Pay Previous Dues (₹{Number(selectedClient.dueAmount).toFixed(0)})</span>
                                                </label>
                                                {includePreviousDue && (
                                                    <div className="flex items-center gap-2 pl-4">
                                                        <span className="text-[9px] font-bold text-slate-500">COLLECT AMOUNT:</span>
                                                        <div className="relative w-28">
                                                            <input type="number" min="0" max={Math.ceil(Number(selectedClient.dueAmount))} value={previousDuePaidAmount} onChange={(e) => {
                                                                const val = Math.min(Math.ceil(Number(selectedClient.dueAmount)), Math.max(0, Number(e.target.value) || 0));
                                                                setPreviousDuePaidAmount(val);
                                                                if (!isManualPayment && payments.length === 1) {
                                                                    setPayments([{ ...payments[0], amount: totals.currentBillTotal + val }]);
                                                                }
                                                            }} className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 px-2 text-right text-xs font-bold outline-none focus:border-[#cca839] transition-all pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">₹</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {payments.map((p, i) => (
                                            <div key={i} className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2 last:pb-0">
                                                <div className="flex gap-2">
                                                    <select value={p.method} onChange={(e) => updatePayment(i, "method", e.target.value)} className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[10px] font-bold outline-none focus:border-[#cca839] transition-all uppercase text-slate-800 dark:text-white">
                                                        <option value="cash" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">CASH</option>
                                                        <option value="online" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">ONLINE</option>
                                                        <option value="wallet" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">WALLET</option>
                                                    </select>
                                                    <div className="relative">
                                                        <input type="number" data-payment-idx={i} value={p.amount} onChange={(e) => updatePayment(i, "amount", Number(e.target.value))} className="w-28 h-8 rounded-lg border border-slate-200 dark:border-slate-700 px-2 text-right text-xs font-bold outline-none focus:border-[#cca839] transition-all pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">₹</span>
                                                    </div>
                                                    {payments.length > 1 && (
                                                        <button onClick={() => removePayment(i)} className="h-8 w-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 shrink-0"><X className="w-3.5 h-3.5" /></button>
                                                    )}
                                                </div>
                                                {payments.length === 1 && (totals.total - bookingAdvancePaid) > p.amount && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-tight">₹{(totals.total - bookingAdvancePaid - p.amount).toFixed(2)} will be marked as Due</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {payments.reduce((s, p) => s + p.amount, 0) < (totals.total - bookingAdvancePaid) && (
                                            <button onClick={addPaymentMethod} className="w-full h-8 border border-dashed border-[#cca839]/40 bg-[#cca839]/5 rounded-lg text-xs font-semibold text-[#cca839] hover:bg-[#cca839]/10 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1">
                                                <Plus className="w-3 h-3" /> Split Payment
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* ── STICKY FOOTER — Grand Total + Actions ── */}
                            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 space-y-3">
                                {/* Grand Total Box */}
                                <div className="bg-[#f8fafc] dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-2">
                                        <span>Subtotal</span>
                                        <span>₹{(totals.subtotal ?? cart.reduce((s,i) => s + (Number(i.price)||0)*(Number(i.quantity)||1), 0)).toFixed(2)}</span>
                                    </div>
                                    {(totals.discount + totals.membershipDiscount) > 0 && (
                                        <div className="flex items-center justify-between text-[10px] font-semibold text-[#16a34a] mb-2">
                                            <span>Discounts</span>
                                            <span>− ₹{(totals.discount + totals.membershipDiscount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {totals.redeemWallet > 0 && (
                                        <div className="flex items-center justify-between text-[10px] font-semibold text-[#16a34a] mb-2">
                                            <span>Wallet</span>
                                            <span>− ₹{totals.redeemWallet.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {includePreviousDue && Number(selectedClient?.dueAmount || 0) > 0 && (
                                        <div className="flex justify-between text-[10px] font-semibold text-rose-600 dark:text-rose-400 mb-2 animate-pulse">
                                            <span>Previous Dues Added</span>
                                            <span>+₹{Number(selectedClient.dueAmount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-3 flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-[#16a34a]">Grand Total</span>
                                        <span className="text-[28px] font-black leading-none text-slate-900 dark:text-white tracking-tight">₹{totals.total.toFixed(2)}</span>
                                    </div>
                                    {bookingAdvancePaid > 0 && (
                                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-2">
                                            <span>Advance Paid</span>
                                            <span>− ₹{bookingAdvancePaid.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1.5">
                                        <span>Paid Now</span>
                                        <span>− ₹{payments.reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
                                    </div>
                                    {(() => {
                                        const remainingBalance = Math.max(0, totals.total - bookingAdvancePaid - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0));
                                        return (
                                            <div className="flex justify-between text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2.5 bg-emerald-50 dark:bg-emerald-500/5 p-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                                <span className="uppercase tracking-widest">Remaining Payment</span>
                                                <span>₹{remainingBalance.toFixed(2)}</span>
                                            </div>
                                        );
                                    })()}
                                    {totals.total - bookingAdvancePaid - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0) > 0.5 && (
                                        <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-500/5 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20 animate-pulse">
                                            <span className="uppercase tracking-widest">Balance Due</span>
                                            <span>₹{(totals.total - bookingAdvancePaid - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {payments.reduce((s, p) => s + p.amount, 0) - (totals.total - bookingAdvancePaid - totals.redeemWallet) > 0.005 && (
                                        <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20 animate-pulse">
                                            <span className="uppercase tracking-widest">Overpaid</span>
                                            <span>₹{(payments.reduce((s, p) => s + p.amount, 0) - (totals.total - bookingAdvancePaid - totals.redeemWallet)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    {/* Wallet toggle */}
                                    {selectedClient && clientWalletBalance > 0 && (
                                        <button
                                            onClick={handleRedeemWallet}
                                            title={`Wallet: ₹${clientWalletBalance.toFixed(2)}`}
                                            className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all border ${
                                                redeemWallet > 0
                                                    ? 'bg-[#cca839] border-[#cca839] text-white shadow-md'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#cca839]/60 hover:text-[#cca839]'
                                            }`}
                                        >
                                            <Wallet className="w-4 h-4" />
                                        </button>
                                    )}
                                    {/* Discount */}
                                    <button
                                        onClick={() => setShowDiscountModal(true)}
                                        title="Discount / Offers"
                                        className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all border ${
                                            (manualDiscount?.value > 0 || appliedPromotion)
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600'
                                        }`}
                                    >
                                        <Tag className="w-4 h-4" />
                                    </button>
                                    {/* Generate Bill */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={checkingOut || cart.length === 0 || isOverpaid}
                                        className="flex-1 h-11 rounded-xl bg-[#cca839] text-white text-xs font-black uppercase tracking-wider hover:bg-[#b8932c] active:scale-95 transition-all shadow-lg shadow-[#cca839]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                        {checkingOut ? 'Generating...' : 'Generate Bill'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ══ CLASSIC CATALOG BILLING CART ══ */
                        <div className="h-full rounded-2xl border border-border bg-surface flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-[#cca839]/10 flex items-center justify-center">
                                        <ShoppingCart className="w-3.5 h-3.5 text-[#cca839]" />
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Billing Cart</h2>
                                </div>
                                {cart.length > 0 && (
                                    <span className="bg-[#cca839] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                        {cart.length} item{cart.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-3 pb-36 space-y-3 overflow-y-auto custom-scrollbar">

                                {/* Client + Outlet */}
                                <div className="rounded-xl border border-border bg-white dark:bg-slate-900 overflow-hidden">
                                    <div className="flex items-center gap-2.5 p-2.5 relative">
                                        {selectedClient ? (
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm ${
                                                activeMembership ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-br from-[#cca839] to-amber-500 text-white'
                                            }`}>
                                                {selectedClient.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            {selectedClient ? (
                                                <>
                                                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate leading-tight">{selectedClient.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-semibold truncate">{maskPhone(selectedClient.phone, user?.role)}</p>
                                                    {Number(selectedClient.dueAmount || 0) > 0 && (
                                                        <div className="text-[8px] font-bold text-rose-600 flex items-center gap-0.5 mt-0.5 animate-pulse">
                                                            <AlertTriangle className="w-2.5 h-2.5 text-rose-500 shrink-0" /> Due: ₹{Number(selectedClient.dueAmount).toFixed(0)}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-[10px] italic text-slate-400">No client selected</p>
                                            )}
                                        </div>
                                        {activeMembership && (
                                            <div className="bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">VIP</div>
                                        )}
                                    </div>
                                    <div className="border-t border-border/60 px-2.5 py-1.5 flex items-center justify-between relative">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                            <button
                                                onClick={() => setShowOutletPickerMain(!showOutletPickerMain)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#cca839] transition-colors"
                                            >
                                                <span className="truncate max-w-[150px]">
                                                    {(() => {
                                                        const sel = outlets.find(o => String(o._id) === String(activeOutletId));
                                                        return sel ? sel.name : 'Select Outlet';
                                                    })()}
                                                </span>
                                                <ChevronDown className="w-3 h-3 shrink-0" />
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {showOutletPickerMain && (
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

                                {/* Cart items */}
                                <div className="space-y-2">
                                    {cart.length === 0 ? (
                                        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <ShoppingCart className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cart is empty</p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">Add items from the left panel</p>
                                        </div>
                                    ) : (
                                        cart.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 shadow-sm">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{item.name}</p>
                                                    <div className="flex flex-col">
                                                        <p className="text-xs font-bold text-primary leading-none mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                        {(item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && fiscal?.inclusiveTax)) ? (
                                                            <span className="text-[9px] font-semibold uppercase text-emerald-600 mt-1">INCLUDING GST</span>
                                                        ) : (
                                                            <span className="text-[9px] font-semibold uppercase text-blue-600 mt-1">EXCLUDING GST</span>
                                                        )}
                                                        {(item.type === 'service' || item.type === 'product') && (
                                                            <div className="mt-1.5 flex items-center gap-1 bg-primary/5 border border-primary/10 rounded-lg p-1 transition-all w-fit">
                                                                <Sparkles className="w-2.5 h-2.5 text-primary animate-pulse" />
                                                                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{activeMembership ? 'Mem. Disc:' : 'Discount:'}</span>
                                                                <div className="flex items-center bg-white border border-primary/10 rounded-md overflow-hidden h-4">
                                                                    <button type="button" onClick={() => updateItemMembershipDiscount(idx, 'percentage', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : (activeMembership?.planId?.serviceDiscountValue || 0))}
                                                                        className={`px-1 text-[9px] font-bold h-full flex items-center ${(item.membershipDiscountType ?? (activeMembership?.planId?.serviceDiscountType || 'percentage')) === 'percentage' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}>%</button>
                                                                    <button type="button" onClick={() => updateItemMembershipDiscount(idx, 'fixed', item.membershipDiscountValue !== undefined ? item.membershipDiscountValue : (activeMembership?.planId?.serviceDiscountValue || 0))}
                                                                        className={`px-1 text-[9px] font-bold h-full flex items-center ${(item.membershipDiscountType ?? (activeMembership?.planId?.serviceDiscountType || 'percentage')) === 'fixed' ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-50'}`}>₹</button>
                                                                </div>
                                                                <input type="number" min="0" max={(item.membershipDiscountType ?? 'percentage') === 'percentage' ? '100' : String(item.price)}
                                                                    value={item.membershipDiscountValue ?? (activeMembership?.planId?.serviceDiscountValue || 0)}
                                                                    onChange={(e) => { const val = Math.max(0, Number(e.target.value) || 0); updateItemMembershipDiscount(idx, item.membershipDiscountType ?? (activeMembership?.planId?.serviceDiscountType || 'percentage'), val); }}
                                                                    className="w-10 bg-white border border-primary/10 rounded-md text-[10px] font-bold text-center h-4 focus:outline-none focus:border-primary/50 text-slate-800" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                                        <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Minus className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" /></button>
                                                        <span className="px-2 text-[10px] font-black text-slate-800 dark:text-slate-200">{item.quantity}</span>
                                                        <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><Plus className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Payment section */}
                                <div className="border border-border rounded-xl bg-background p-2 space-y-2 relative overflow-hidden">
                                    <div className="flex items-center justify-between px-1 border-b border-border/50 pb-2 mb-2">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Payment Date <span className="text-rose-500 font-bold">*</span></span>
                                        <input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                                            className={`bg-surface border text-[11px] font-black uppercase rounded-lg px-2.5 py-1 outline-none text-slate-800 dark:text-slate-200 dark:[color-scheme:dark] focus:border-primary/50 cursor-pointer ${!paymentDate ? 'border-rose-300 bg-rose-50/20' : 'border-border'}`} />
                                    </div>
                                    <div className="flex items-center justify-between px-1 mb-1">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Payment Method</span>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:opacity-80 transition-all bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                                            <input type="checkbox" checked={isManualPayment} onChange={(e) => { setIsManualPayment(e.target.checked); if (e.target.checked) { setTimeout(() => { const el = document.querySelector('input[type="number"][data-payment-idx="0"]'); el?.focus(); el?.select(); }, 100); } }} className="w-3 h-3 rounded border-primary/20 text-primary focus:ring-primary/20 cursor-pointer" />
                                            <span className="uppercase tracking-tight text-text-muted">Partial Pay</span>
                                        </label>
                                    </div>
                                    {selectedClient && Number(selectedClient.dueAmount || 0) > 0 && (
                                        <div className="flex flex-col gap-2 pb-2 mb-2 border-b border-border/50">
                                            <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-rose-600 select-none">
                                                <input type="checkbox" checked={includePreviousDue} onChange={(e) => {
                                                    setIncludePreviousDue(e.target.checked);
                                                    const dueVal = e.target.checked ? Number(selectedClient.dueAmount || 0) : 0;
                                                    setPreviousDuePaidAmount(dueVal);
                                                    if (!isManualPayment && payments.length === 1) {
                                                        setPayments([{ ...payments[0], amount: totals.currentBillTotal + dueVal }]);
                                                    }
                                                }} className="w-3 h-3 rounded border-rose-200 text-rose-600 focus:ring-rose-500/20 cursor-pointer" />
                                                <span className="uppercase tracking-tight">Pay Previous Dues (₹{Number(selectedClient.dueAmount).toFixed(0)})</span>
                                            </label>
                                            {includePreviousDue && (
                                                <div className="flex items-center gap-2 pl-4">
                                                    <span className="text-[9px] font-bold text-text-muted">COLLECT AMOUNT:</span>
                                                    <div className="relative w-28">
                                                        <input type="number" min="0" max={Math.ceil(Number(selectedClient.dueAmount))} value={previousDuePaidAmount} onChange={(e) => {
                                                            const val = Math.min(Math.ceil(Number(selectedClient.dueAmount)), Math.max(0, Number(e.target.value) || 0));
                                                            setPreviousDuePaidAmount(val);
                                                            if (!isManualPayment && payments.length === 1) {
                                                                    setPayments([{ ...payments[0], amount: totals.currentBillTotal + val }]);
                                                            }
                                                        }} className="w-full h-8 rounded-lg border border-border px-2 text-right text-xs font-bold outline-none focus:border-primary transition-all pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">₹</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {payments.map((p, i) => (
                                        <div key={i} className="flex flex-col gap-1.5 border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                            <div className="flex gap-2">
                                                <select value={p.method} onChange={(e) => updatePayment(i, "method", e.target.value)} className="flex-1 h-8 rounded-lg !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-800 px-2 text-[10px] font-bold outline-none focus:border-primary transition-all uppercase !text-slate-800 dark:!text-white">
                                                    <option value="cash" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">CASH</option>
                                                    <option value="online" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">ONLINE</option>
                                                    <option value="wallet" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">WALLET</option>
                                                </select>
                                                <div className="relative">
                                                    <input type="number" data-payment-idx={i} value={p.amount} onChange={(e) => updatePayment(i, "amount", Number(e.target.value))} className="w-28 h-8 rounded-lg border border-border px-2 text-right text-xs font-bold outline-none focus:border-primary transition-all pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400">₹</span>
                                                </div>
                                                {payments.length > 1 && (
                                                    <button onClick={() => removePayment(i)} className="h-8 w-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 shrink-0"><X className="w-3.5 h-3.5" /></button>
                                                )}
                                            </div>
                                            {payments.length === 1 && totals.total > p.amount && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-tight">₹{(totals.total - p.amount).toFixed(2)} will be marked as Due</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {payments.reduce((s, p) => s + p.amount, 0) < totals.total && (
                                        <button onClick={addPaymentMethod} className="w-full h-8 border border-dashed border-primary/40 bg-primary/5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider mt-1">
                                            <Plus className="w-3 h-3" /> Split Payment
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-border bg-surface space-y-3 shrink-0">
                                <div className="pos-billing-cart-total-box border border-border rounded-xl bg-surface-alt p-3 shadow-lg">
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                        <span>Subtotal</span>
                                        <span>₹{totals.total.toFixed(2)}</span>
                                    </div>
                                    {totals.cgst > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                            <span>CGST {cart.every(i => i.type === 'service') ? `(${totals.serviceGstRate / 2}%)` : cart.every(i => i.type === 'product') ? `(${totals.productGstRate / 2}%)` : totals.serviceGstRate === totals.productGstRate ? `(${totals.serviceGstRate / 2}%)` : ''}</span>
                                            <div className="flex gap-1 text-right">{totals.cgst > totals.cgstExcl && <span className="text-emerald-600 dark:text-emerald-400/80 font-normal">(Included)</span>}{totals.cgstExcl > 0 && <span>+</span>}<span>₹{totals.cgst.toFixed(2)}</span></div>
                                        </div>
                                    )}
                                    {totals.sgst > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                            <span>SGST {cart.every(i => i.type === 'service') ? `(${totals.serviceGstRate / 2}%)` : cart.every(i => i.type === 'product') ? `(${totals.productGstRate / 2}%)` : totals.serviceGstRate === totals.productGstRate ? `(${totals.serviceGstRate / 2}%)` : ''}</span>
                                            <div className="flex gap-1 text-right">{totals.sgst > totals.sgstExcl && <span className="text-emerald-600 dark:text-emerald-400/80 font-normal">(Included)</span>}{totals.sgstExcl > 0 && <span>+</span>}<span>₹{totals.sgst.toFixed(2)}</span></div>
                                        </div>
                                    )}
                                    {totals.discount > 0 && <div className="flex justify-between text-[11px] font-bold mb-1 text-emerald-600 dark:text-emerald-400"><span>Discount</span><span>-₹{totals.discount.toFixed(2)}</span></div>}
                                    {totals.membershipDiscount > 0 && <div className="flex justify-between text-[11px] font-bold mb-1 text-emerald-600 dark:text-emerald-400"><span>Membership Disc</span><span>-₹{totals.membershipDiscount.toFixed(2)}</span></div>}
                                    {includePreviousDue && Number(selectedClient?.dueAmount || 0) > 0 && (
                                        <div className="flex justify-between text-[11px] font-bold mb-1 text-rose-600 dark:text-rose-400 animate-pulse"><span>Previous Dues Added</span><span>+₹{Number(selectedClient.dueAmount).toFixed(2)}</span></div>
                                    )}
                                    <div className="border-t border-border/50 mt-2 pt-2 flex items-center justify-between">
                                        <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">TOTAL</span>
                                        <span className="text-2xl font-bold tracking-tight text-text">₹{totals.total.toFixed(2)}</span>
                                    </div>
                                    {totals.redeemWallet > 0 && <div className="flex justify-between text-[11px] font-bold mt-2 text-emerald-600 dark:text-emerald-400"><span>Wallet Used</span><span>-₹{totals.redeemWallet.toFixed(2)}</span></div>}
                                    {totals.total - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0) > 0.5 && (
                                        <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-500/5 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20 animate-pulse">
                                            <span className="uppercase tracking-widest">Balance Due</span>
                                            <span>₹{(totals.total - totals.redeemWallet - payments.reduce((s, p) => s + p.amount, 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {payments.reduce((s, p) => s + p.amount, 0) - (totals.total - totals.redeemWallet) > 0.005 && (
                                        <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg border border-rose-200 dark:border-rose-500/20 animate-pulse">
                                            <span className="uppercase tracking-widest">Overpaid</span>
                                            <span>₹{(payments.reduce((s, p) => s + p.amount, 0) - (totals.total - totals.redeemWallet)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowDiscountModal(true)} className="h-10 rounded-xl !border !border-slate-300 dark:!border-slate-800 !bg-slate-100 dark:!bg-slate-900 text-xs font-bold uppercase hover:!bg-slate-200 dark:hover:!bg-slate-800 transition-colors !text-slate-800 dark:!text-slate-200 px-4">Offers</button>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={checkingOut || cart.length === 0 || isOverpaid}
                                        className="flex-1 h-10 rounded-xl bg-primary text-white text-xs font-bold uppercase hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Complete Bill
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* ─── Modals rendered outside panel flex but inside outer wrapper ─── */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-0 animate-in zoom-in-95 duration-250 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden rounded-3xl">
                        
                        {/* Header */}
                        <div className="flex bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 px-6 py-4 items-center justify-between border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-[#cca839]/10 text-[#cca839] rounded-lg">
                                    <Percent className="w-4 h-4" />
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Offers & Adjustments</h3>
                            </div>
                            <button 
                                onClick={() => setShowDiscountModal(false)} 
                                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-full transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                            <div className="space-y-6">
                                
                                {/* Discount Selector Section */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 border border-slate-100 dark:border-slate-800/60 rounded-2xl transition-all hover:border-[#cca839]/20">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Tag className="w-3.5 h-3.5 text-[#cca839]" />
                                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Flat or Percentage Discount</label>
                                    </div>
                                    
                                    <div className="flex border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#cca839]/20 focus-within:border-[#cca839] transition-all">
                                        <select
                                            className="bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-[10px] font-black p-3.5 text-[#cca839] dark:text-[#cca839] outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            value={manualDiscount.type}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, type: e.target.value })}
                                        >
                                            <option value="fixed" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">FLAT ₹</option>
                                            <option value="percentage" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">% OFF</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Enter discount amount"
                                            className="flex-1 p-3.5 text-sm font-black bg-transparent text-slate-800 dark:text-white outline-none placeholder:text-slate-400/60 placeholder:font-normal"
                                            value={manualDiscount.value || ''}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, value: Number(e.target.value) })}
                                            onFocus={(e) => { if (manualDiscount.value === 0) setManualDiscount({ ...manualDiscount, value: '' }) }}
                                            onBlur={(e) => { if (manualDiscount.value === '') setManualDiscount({ ...manualDiscount, value: 0 }) }}
                                        />
                                    </div>
                                </div>

                                {/* Wallet Balance Section */}
                                {selectedClient && (
                                    <div className="bg-emerald-50/30 dark:bg-emerald-950/10 p-5 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl transition-all hover:border-emerald-300/30">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Redeem Wallet Balance</span>
                                            </div>
                                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">₹{clientWalletBalance.toFixed(0)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Enter amount to redeem"
                                                className="flex-1 p-3 text-xs font-black bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl transition-all placeholder:font-normal"
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
                                                className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                                    redeemWallet > 0 
                                                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10' 
                                                        : 'bg-[#cca839] hover:bg-[#b59533] text-white shadow-md shadow-[#cca839]/10'
                                                }`}
                                            >
                                                {redeemWallet > 0 ? 'Reset' : 'Use Max'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Reductions</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">₹{(Number(totals.discount) + Number(totals.membershipDiscount) + Number(totals.redeemWallet || 0)).toFixed(0)}</p>
                            </div>
                            <button 
                                onClick={() => setShowDiscountModal(false)} 
                                disabled={manualDiscount.type === 'percentage' ? manualDiscount.value > 100 : manualDiscount.value > (totals.subtotal || 0)}
                                className="px-8 py-3.5 bg-[#cca839] hover:bg-[#b59533] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#cca839]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
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
                    invoiceToEdit={editInvoiceData}
                    onClose={() => {
                        setShowQuickInvoice(false);
                        setEditInvoiceData(null);
                        setInvoiceIdToEdit(null);
                    }}
                    onSuccess={(inv) => {
                        setShowQuickInvoice(false);
                        setEditInvoiceData(null);
                        setInvoiceIdToEdit(null);
                        setSuccessInvoice(inv);
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
function QuickInvoiceModal({ onClose, onSuccess, outlets, services, products, staff, customers, addCustomer, activeOutletId, fiscal, platformSettings, allWallets, invoiceToEdit }) {
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
    const [qFocusedStaffIndex, setQFocusedStaffIndex] = useState(-1);
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
    const [qPaymentDate, setQPaymentDate] = useState(getTodayDateString());
    const [qSearchItem, setQSearchItem] = useState('');

    useEffect(() => {
        if (invoiceToEdit) {
            if (invoiceToEdit.outletId) {
                setQOutletId(invoiceToEdit.outletId._id || invoiceToEdit.outletId);
            }
            if (invoiceToEdit.customerId || invoiceToEdit.client) {
                setQClient(invoiceToEdit.customerId || invoiceToEdit.client);
            }
            if (invoiceToEdit.items && Array.isArray(invoiceToEdit.items)) {
                setQCart(invoiceToEdit.items.map(item => ({
                    ...item,
                    itemId: item.itemId?._id || item.itemId || item.id || item._id,
                    quantity: item.quantity || 1,
                    price: item.price || 0,
                    name: item.name,
                    type: item.type || 'service',
                    staffIds: (item.stylistIds || []).map(s => s._id || s)
                })));
            }
            if (invoiceToEdit.payments && Array.isArray(invoiceToEdit.payments)) {
                const cashAmt = invoiceToEdit.payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
                const onlineAmt = invoiceToEdit.payments.filter(p => ['online', 'card', 'upi'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0);
                setQPayments({ cash: cashAmt, online: onlineAmt });
                setIsPaymentEdited(true);
            }
            if (invoiceToEdit.discount || invoiceToEdit.discountType) {
                setQManualDiscount({
                    type: invoiceToEdit.discountType || 'fixed',
                    value: invoiceToEdit.discount || 0
                });
            }
            if (invoiceToEdit.createdAt) {
                const d = new Date(invoiceToEdit.createdAt);
                const yr = d.getFullYear();
                const mo = String(d.getMonth() + 1).padStart(2, '0');
                const dy = String(d.getDate()).padStart(2, '0');
                setQPaymentDate(`${yr}-${mo}-${dy}`);
            }
            if (invoiceToEdit.previousDueCollected) {
                setQCollectedPrevDue(invoiceToEdit.previousDueCollected);
            }
            if (invoiceToEdit.walletRedeemed) {
                setQRedeemWallet(invoiceToEdit.walletRedeemed);
            }
        }
    }, [invoiceToEdit]);

    useEffect(() => {
        setQSearchItem('');
    }, [qActiveTab]);

    const [qFocusedClientIndex, setQFocusedClientIndex] = useState(-1);
    const [qFocusedItemIndex, setQFocusedItemIndex] = useState(-1);

    useEffect(() => {
        setQFocusedClientIndex(-1);
    }, [qSearchClient, showClientDropdown]);

    useEffect(() => {
        setQFocusedItemIndex(-1);
    }, [qSelectedCategory, qActiveTab]);

    useEffect(() => {
        setQFocusedStaffIndex(-1);
    }, [openStaffIdx]);

    useEffect(() => {
        if (qFocusedStaffIndex >= 0) {
            const activeEl = document.getElementById(`q-staff-item-${qFocusedStaffIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [qFocusedStaffIndex]);

    useEffect(() => {
        if (qFocusedClientIndex >= 0) {
            const activeEl = document.getElementById(`q-client-item-${qFocusedClientIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [qFocusedClientIndex]);

    useEffect(() => {
        if (qFocusedItemIndex >= 0) {
            const activeEl = document.getElementById(`q-item-item-${qFocusedItemIndex}`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [qFocusedItemIndex]);


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
        let list = services || [];
        if (qOutletId) {
            list = list.filter(s => {
                const sOutletIds = s.outletIds || [];
                const sOutletId = s.outletId?._id || s.outletId;
                if (sOutletIds.length === 0 && !sOutletId) return true;
                const matchPlural = sOutletIds.some(id => String(id?._id || id) === String(qOutletId));
                const matchSingular = sOutletId && String(sOutletId) === String(qOutletId);
                return matchPlural || matchSingular;
            });
        }
        if (qSearchItem) {
            const st = qSearchItem.toLowerCase().trim();
            list = list.filter(s => (s.name || '').toLowerCase().includes(st) || (s.category || '').toLowerCase().includes(st));
        }
        return list;
    }, [services, qOutletId, qSearchItem]);

    const qFilteredProducts = useMemo(() => {
        let list = products || [];
        if (qOutletId) {
            list = list.filter(p => {
                const pOutletIds = p.outletIds || [];
                const pOutletId = p.outletId?._id || p.outletId;
                if (pOutletIds.length === 0 && !pOutletId) return true;
                const matchPlural = pOutletIds.some(id => String(id?._id || id) === String(qOutletId));
                const matchSingular = pOutletId && String(pOutletId) === String(qOutletId);
                return matchPlural || matchSingular;
            });
        }
        if (qSearchItem) {
            const st = qSearchItem.toLowerCase().trim();
            list = list.filter(p => (p.name || '').toLowerCase().includes(st) || (p.sku || '').toLowerCase().includes(st) || (p.category || '').toLowerCase().includes(st));
        }
        return list;
    }, [products, qOutletId, qSearchItem]);

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
            staffIds: []
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
        setQCollectedPrevDue(0);
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
                promotionId: undefined,
                couponCode: undefined
            };

            let res;
            if (invoiceToEdit) {
                res = await api.put(`/pos/invoices/${invoiceToEdit._id}`, payload);
                toast.success('Invoice Updated!');
            } else {
                res = await api.post('/pos/checkout', payload);
                toast.success('Invoice Generated!');
            }

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
            console.log(err)
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Close modal on Escape
            if (e.key === 'Escape') {
                if (openStaffIdx !== null) {
                    setOpenStaffIdx(null);
                } else if (showClientDropdown) {
                    setShowClientDropdown(false);
                } else if (showNewClient) {
                    setShowNewClient(false);
                } else if (qSelectedCategory) {
                    setQSelectedCategory(null);
                } else {
                    onClose();
                }
                return;
            }

            // Staff Dropdown Navigation
            if (openStaffIdx !== null && qFilteredStaff.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setQFocusedStaffIndex(prev => {
                        const next = prev + 1;
                        return next < qFilteredStaff.length ? next : prev;
                    });
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setQFocusedStaffIndex(prev => {
                        const next = prev - 1;
                        return next >= 0 ? next : prev;
                    });
                }
                if (e.key === 'Enter') {
                    if (qFocusedStaffIndex >= 0) {
                        e.preventDefault();
                        toggleStaffInItem(openStaffIdx, qFilteredStaff[qFocusedStaffIndex]._id);
                        setOpenStaffIdx(null);
                    }
                }
                return;
            }

            // Client Dropdown Navigation (if dropdown is active)
            if (showClientDropdown && qFilteredClients.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setQFocusedClientIndex(prev => {
                        const next = prev + 1;
                        return next < qFilteredClients.length ? next : prev;
                    });
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setQFocusedClientIndex(prev => {
                        const next = prev - 1;
                        return next >= 0 ? next : prev;
                    });
                }
                if (e.key === 'Enter') {
                    if (qFocusedClientIndex >= 0) {
                        e.preventDefault();
                        handleSelectClient(qFilteredClients[qFocusedClientIndex]);
                    }
                }
                return;
            }

            // Category Items Navigation (if category is open)
            if (qSelectedCategory) {
                const currentItems = (qActiveTab === 'services' ? qFilteredServices : qFilteredProducts)
                    .filter(i => qSelectedCategory === 'All' || i.category === qSelectedCategory);

                if (currentItems.length > 0) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setQFocusedItemIndex(prev => {
                            const next = prev + 1;
                            return next < currentItems.length ? next : prev;
                        });
                    }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setQFocusedItemIndex(prev => {
                            const next = prev - 1;
                            return next >= 0 ? next : prev;
                        });
                    }
                    if (e.key === 'Enter') {
                        if (qFocusedItemIndex >= 0) {
                            e.preventDefault();
                            addToQCart(currentItems[qFocusedItemIndex], qActiveTab === 'services' ? 'service' : 'product');
                        }
                    }
                }
            }

            // Tab switching via Left / Right arrows
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const activeEl = document.activeElement;
                const isTyping = activeEl && activeEl.tagName === 'INPUT' && activeEl.value.length > 0;
                if (!isTyping) {
                    e.preventDefault();
                    if (e.key === 'ArrowLeft') {
                        setQActiveTab('services');
                        setQSelectedCategory(null);
                    } else {
                        setQActiveTab('products');
                        setQSelectedCategory(null);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showClientDropdown, qFilteredClients, qFocusedClientIndex, qSelectedCategory, qActiveTab, qFilteredServices, qFilteredProducts, qFocusedItemIndex, showNewClient, openStaffIdx, qFilteredStaff, qFocusedStaffIndex]);

    return (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-2 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full max-w-[99vw] h-full sm:h-[97vh] shadow-2xl flex flex-col sm:rounded-2xl overflow-hidden bg-white dark:bg-[#0A0F1E]"
                style={{ fontFamily: 'inherit' }}
            >
                <style>{`
                    .qi-scroll::-webkit-scrollbar { width: 4px; }
                    .qi-scroll::-webkit-scrollbar-track { background: transparent; }
                    .qi-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
                    html.dark .qi-scroll::-webkit-scrollbar-thumb { background: #334155; }
                    .qi-noscroll::-webkit-scrollbar { display: none; }
                    .qi-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
                    
                    /* ---- LIGHT MODE ---- */
                    .qi-left { background-color: #ffffff !important; color: #1e293b !important; }
                    .qi-left * { color: inherit; }
                    .qi-left h3, .qi-left h4, .qi-left p, .qi-left span:not(.qi-gold):not(.qi-emerald):not(.qi-rose):not(.qi-blue):not(.qi-violet) { color: inherit !important; }
                    .qi-left input { color: #1e293b !important; background: transparent !important; }
                    .qi-left input::placeholder { color: #94a3b8 !important; }
                    .qi-left label { color: #64748b !important; }
                    .qi-catcard { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
                    .qi-catcard:hover { border-color: #C69A20 !important; }
                    .qi-svccard { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
                    .qi-svccard:hover { border-color: #C69A20 !important; box-shadow: 0 4px 15px rgba(180,145,43,0.12); }
                    .qi-breadcrumb { background-color: #ffffff !important; border-bottom-color: #f1f5f9 !important; }
                    .qi-kpi { background-color: #ffffff !important; border-top-color: #f1f5f9 !important; }
                    .qi-strip { background-color: #ffffff !important; border-top-color: #e2e8f0 !important; }
                    .qi-tab-row { background-color: #f8fafc !important; border-bottom-color: #e2e8f0 !important; }
                    .qi-tab-services-active { background: linear-gradient(90deg,#C29323,#DAA520) !important; color: #fff !important; }
                    .qi-tab-inactive { background-color: #f1f5f9 !important; color: #64748b !important; }
                    .qi-topbar { background-color: #ffffff !important; border-bottom-color: #f1f5f9 !important; }
                    .qi-outlet-btn { background-color: #ffffff !important; border-color: #e2e8f0 !important; color: #1e293b !important; }
                    .qi-outlet-btn:hover { border-color: #C69A20 !important; }
                    .qi-client-input { background-color: #ffffff !important; border-color: #e2e8f0 !important; color: #1e293b !important; }
                    .qi-client-input:focus { border-color: #C69A20 !important; outline: none !important; }
                    .qi-right { background-color: #f8fafc !important; border-left: 1px solid #e2e8f0 !important; }
                    .qi-cart-item { background-color: #ffffff !important; color: #1e293b !important; }
                    .qi-cart-item * { color: inherit; }
                    .qi-bottom-card { background-color: #ffffff !important; border: 1px solid #e2e8f0 !important; border-radius: 0.75rem !important; }
                    .qi-cgst-sgst { color: #16a34a !important; }
                    .qi-discount-val { color: #dc2626 !important; }
                    .qi-total-pay-val { color: #b45309 !important; }
                    .qi-discount-bg { background-color: #fff1f2 !important; border-color: #fecdd3 !important; }
                    .qi-discount-text { color: #e11d48 !important; }
                    .qi-input-bg { background-color: #ffffff !important; border-color: #e2e8f0 !important; }

                    .qi-cash-pill { background-color: #f0fdf4 !important; border: 1.5px solid #10b981 !important; color: #047857 !important; }
                    .qi-cash-pill input { color: #047857 !important; }
                    .qi-cash-pill svg { color: #047857 !important; }
                    
                    .qi-upi-pill { background-color: #f5f3ff !important; border: 1.5px solid #8b5cf6 !important; color: #6d28d9 !important; }
                    .qi-upi-pill input { color: #6d28d9 !important; }
                    .qi-upi-pill svg { color: #6d28d9 !important; }
                    
                    .qi-wallet-pill { background-color: #f0fdf4 !important; border: 1.5px solid #10b981 !important; color: #065f46 !important; }
                    .qi-wallet-pill input { color: #065f46 !important; }
                    .qi-wallet-pill svg { color: #065f46 !important; }

                    /* ---- DARK MODE OVERRIDES ---- */
                    html.dark .qi-left { background-color: #0A0F1E !important; color: #f1f5f9 !important; }
                    html.dark .qi-left input { color: #f1f5f9 !important; }
                    html.dark .qi-left input::placeholder { color: #64748b !important; }
                    html.dark .qi-left label { color: #94a3b8 !important; }
                    html.dark .qi-catcard { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
                    html.dark .qi-svccard { background-color: #1e293b !important; border-color: rgba(255,255,255,0.05) !important; }
                    html.dark .qi-breadcrumb { background-color: #0A0F1E !important; border-bottom-color: rgba(255,255,255,0.05) !important; }
                    html.dark .qi-kpi { background-color: #0A0F1E !important; border-top-color: rgba(255,255,255,0.05) !important; }
                    html.dark .qi-strip { background-color: #0A0F1E !important; border-top-color: rgba(255,255,255,0.1) !important; }
                    html.dark .qi-tab-row { background-color: #0A0F1E !important; border-bottom-color: rgba(255,255,255,0.1) !important; }
                    html.dark .qi-tab-inactive { background-color: #1e293b !important; color: #94a3b8 !important; }
                    html.dark .qi-topbar { background-color: #0A0F1E !important; border-bottom-color: rgba(255,255,255,0.05) !important; }
                    html.dark .qi-outlet-btn { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; color: #f1f5f9 !important; }
                    html.dark .qi-client-input { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; color: #f1f5f9 !important; }
                    html.dark .qi-right { background-color: #0A0F1E !important; border-left: 1px solid rgba(255,255,255,0.05) !important; }
                    html.dark .qi-cart-item { background-color: #1e293b !important; color: #f1f5f9 !important; }
                    html.dark .qi-bottom-card { background-color: #111827 !important; border-color: rgba(255,255,255,0.05) !important; }
                    html.dark .qi-cgst-sgst { color: #34d399 !important; }
                    html.dark .qi-discount-val { color: #fda4af !important; }
                    html.dark .qi-total-pay-val { color: #eab308 !important; }
                    html.dark .qi-discount-bg { background-color: rgba(225,29,72,0.1) !important; border-color: rgba(225,29,72,0.3) !important; }
                    html.dark .qi-discount-text { color: #f1f5f9 !important; }
                    html.dark .qi-input-bg { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
                    
                    html.dark .qi-cash-pill { background-color: rgba(16,185,129,0.15) !important; border-color: rgba(16,185,129,0.4) !important; color: #a7f3d0 !important; }
                    html.dark .qi-cash-pill input { color: #a7f3d0 !important; }
                    html.dark .qi-cash-pill svg { color: #a7f3d0 !important; }
                    
                    html.dark .qi-upi-pill { background-color: rgba(139,92,246,0.15) !important; border-color: rgba(139,92,246,0.4) !important; color: #c084fc !important; }
                    html.dark .qi-upi-pill input { color: #c084fc !important; }
                    html.dark .qi-upi-pill svg { color: #c084fc !important; }
                    
                    html.dark .qi-wallet-pill { background-color: rgba(16,185,129,0.15) !important; border-color: rgba(16,185,129,0.4) !important; color: #a7f3d0 !important; }
                    html.dark .qi-wallet-pill input { color: #a7f3d0 !important; }
                    html.dark .qi-wallet-pill svg { color: #a7f3d0 !important; }
                `}</style>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">

                    {/* ══════════════ LEFT COLUMN (always light) ══════════════ */}
                    <div className="qi-left flex-1 min-h-0 flex flex-col overflow-hidden border-r border-slate-200">

                        {/* TOP BAR: Outlet + Client */}
                        <div className="qi-topbar grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">

                            {/* Outlet Selector */}
                            <div className="space-y-1 relative">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                                    <Building2 className="w-3.5 h-3.5" /> Outlet
                                </label>
                                <div id="outlet-dropdown-container" className="relative">
                                    <button
                                        onClick={() => setShowQOutletPicker(p => !p)}
                                        className="qi-outlet-btn w-full flex items-center gap-3 border rounded-xl px-3 py-2.5 transition-all shadow-sm text-left"
                                    >
                                        {(() => {
                                            const sel = outlets.find(o => String(o._id) === String(qOutletId));
                                            const img = sel?.image || sel?.images?.[0];
                                            return sel ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                                                        {img ? <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={sel.name} /> : <Building2 className="w-4 h-4" style={{ color: '#C69A20' }} />}
                                                    </div>
                                                    <span className="text-sm font-bold truncate flex-1" style={{ color: '#1e293b' }}>{sel.name}</span>
                                                </>
                                            ) : <span className="text-sm italic flex-1" style={{ color: '#94a3b8' }}>Select outlet…</span>;
                                        })()}
                                        <ChevronDown className={`w-4 h-4 ml-auto flex-shrink-0 transition-transform ${showQOutletPicker ? 'rotate-180' : ''}`} style={{ color: '#94a3b8' }} />
                                    </button>
                                    <AnimatePresence>
                                        {showQOutletPicker && (
                                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                className="absolute top-full left-0 right-0 mt-1.5 shadow-2xl rounded-2xl overflow-hidden z-[60]"
                                                style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                                                {outlets.map(o => (
                                                    <button key={o._id}
                                                        onClick={() => { setQOutletId(o._id); setQCart([]); setShowQOutletPicker(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${String(o._id) === String(qOutletId) ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <span className="text-sm font-bold" style={{ color: '#1e293b' }}>{o.name}</span>
                                                        {String(o._id) === String(qOutletId) && <Check className="w-4 h-4 ml-auto" style={{ color: '#C69A20' }} />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Client */}
                            <div className="space-y-1 relative">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>
                                    <User className="w-3.5 h-3.5" /> Client
                                </label>
                                {qClient ? (
                                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${Number(qClient.dueAmount || 0) > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0 ${Number(qClient.dueAmount || 0) > 0 ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                                                {qClient.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate" style={{ color: '#1e293b' }}>{qClient.name}</p>
                                                <p className="text-xs font-mono" style={{ color: '#64748b' }}>{qClient.phone}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setQClient(null); setQCollectedPrevDue(0); }} className="p-1 flex-shrink-0 ml-2 hover:text-red-500" style={{ color: '#94a3b8' }}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative" id="client-dropdown-container">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Search client name or mobile..."
                                                    className="qi-client-input w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium outline-none shadow-sm"
                                                    value={qSearchClient}
                                                    onFocus={() => setShowClientDropdown(true)}
                                                    onChange={e => { setQSearchClient(e.target.value); setShowClientDropdown(true); }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => { setShowNewClient(true); setShowClientDropdown(false); }}
                                                className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500"
                                                style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#e2e8f0' }}
                                                title="Quick Add New Client"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {showClientDropdown && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                    className="absolute top-full left-0 right-0 mt-1.5 shadow-2xl z-[80] rounded-2xl overflow-hidden"
                                                    style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                                                    {qFilteredClients.length > 0 ? (
                                                        <div className="max-h-[220px] overflow-y-auto qi-scroll">
                                                            {qFilteredClients.map((c, idx) => (
                                                                <button
                                                                    id={`q-client-item-${idx}`}
                                                                    key={c._id}
                                                                    onClick={() => handleSelectClient(c)}
                                                                    className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-0 flex items-center gap-3 transition-colors ${idx === qFocusedClientIndex ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                                                                >
                                                                    <div
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${Number(c.dueAmount || 0) > 0 ? 'bg-amber-100' : 'bg-amber-50'}`}
                                                                        style={{
                                                                            color: Number(c.dueAmount || 0) > 0 ? '#b45309' : '#d97706',
                                                                            WebkitTextFillColor: Number(c.dueAmount || 0) > 0 ? '#b45309' : '#d97706'
                                                                        }}
                                                                    >
                                                                        {c.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-bold truncate" style={{ color: '#1e293b' }}>{c.name}</p>
                                                                        <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>{c.phone}</p>
                                                                    </div>
                                                                    {Number(c.dueAmount || 0) > 0 && (
                                                                        <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg flex-shrink-0" style={{ color: '#d97706' }}>
                                                                            Due {Number(c.dueAmount).toFixed(0)}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center space-y-2">
                                                            <p className="text-sm italic" style={{ color: '#94a3b8' }}>No client found</p>
                                                            <button onClick={() => { setShowNewClient(true); setShowClientDropdown(false); }}
                                                                className="w-full py-2 text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 text-white"
                                                                style={{ background: '#C69A20' }}>
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

                        {/* TABS: SERVICES | PRODUCTS */}
                        <div className="qi-tab-row flex w-full shrink-0 border-b border-slate-200">
                            <button
                                onClick={() => { setQActiveTab('services'); setQSelectedCategory(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${qActiveTab === 'services' ? 'qi-tab-services-active' : 'qi-tab-inactive hover:bg-slate-100'}`}
                            >
                                <Scissors className="w-4 h-4" /> Services
                            </button>
                            <button
                                onClick={() => { setQActiveTab('products'); setQSelectedCategory(null); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-widest transition-all border-l border-slate-200 ${qActiveTab === 'products' ? 'qi-tab-services-active' : 'qi-tab-inactive hover:bg-slate-100'}`}
                            >
                                <Package className="w-4 h-4" /> Products
                            </button>
                        </div>

                        {/* Search bar for services/products */}
                        <div className="px-5 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black dark:text-white" />
                                <input
                                    type="text"
                                    placeholder={qActiveTab === 'services' ? "Search services..." : "Search products..."}
                                    className="w-full border border-black dark:border-white/40 rounded-xl py-2 text-xs font-semibold outline-none bg-white text-slate-800 focus:border-black dark:focus:border-white transition-all dark:bg-slate-800 dark:text-slate-100"
                                    style={{ paddingLeft: '2.6rem', paddingRight: '2.25rem' }}
                                    value={qSearchItem}
                                    onChange={e => {
                                        setQSearchItem(e.target.value);
                                        if (e.target.value.trim() && !qSelectedCategory) {
                                            setQSelectedCategory('All');
                                        }
                                    }}
                                />
                                {qSearchItem && (
                                    <button
                                        type="button"
                                        onClick={() => setQSearchItem('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BREADCRUMB / COUNT BAR */}
                        <div className="qi-breadcrumb flex items-center justify-between px-5 py-2.5 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2">
                                {qSelectedCategory && (
                                    <button onClick={() => setQSelectedCategory(null)} className="transition-colors" style={{ color: '#64748b' }}>
                                        <ChevronDown className="w-4 h-4 rotate-90" strokeWidth={3} />
                                    </button>
                                )}
                                <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#1e293b' }}>
                                    {qSelectedCategory || (qActiveTab === 'services' ? 'Service Categories' : 'Product Categories')}
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md uppercase tracking-wider" style={{ color: '#475569' }}>
                                {qSelectedCategory
                                    ? `${(qActiveTab === 'services' ? qFilteredServices : qFilteredProducts).filter(i => qSelectedCategory === 'All' || i.category === qSelectedCategory).length} Items`
                                    : `${qCategories.length} Categories`}
                            </span>
                        </div>

                        {/* SERVICE / CATEGORY GRID */}
                        <div className="flex-1 overflow-y-auto qi-scroll px-5 py-3 flex flex-col gap-4">
                            {!qSelectedCategory ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {qCategories.map(cat => {
                                        const n = cat.name.toLowerCase();
                                        const isProduct = qActiveTab === 'products';

                                        let bg = 'bg-slate-50 dark:bg-slate-800/50';
                                        let iconColor = 'text-slate-500';
                                        let Icon = isProduct ? Package : Tag;
                                        let sub = isProduct ? 'Other products' : 'Other services';
                                        let border = 'border border-transparent';

                                        if (n === 'all') {
                                            bg = 'bg-[#fffbeb] dark:bg-amber-900/20';
                                            iconColor = 'text-[#f59e0b]';
                                            Icon = LayoutGrid;
                                            sub = isProduct ? 'View all products' : 'View all services';
                                            border = 'border-b-[3px] border-b-[#f59e0b] border-t border-t-[#fde68a] border-l border-l-[#fde68a] border-r border-r-[#fde68a]';
                                        }
                                        else if (n.includes('color')) { bg = 'bg-[#fff1f2] dark:bg-rose-900/20'; iconColor = 'text-[#f43f5e]'; Icon = Brush; sub = 'Color & highlights'; border = 'border border-[#ffe4e6] dark:border-rose-900/50'; }
                                        else if (n.includes('care') || n.includes('wash') || n.includes('spa') || n.includes('shampoo')) { bg = 'bg-[#eff6ff] dark:bg-blue-900/20'; iconColor = 'text-[#3b82f6]'; Icon = Droplet; sub = isProduct ? 'Hair care' : 'Care & treatments'; border = 'border border-[#dbeafe] dark:border-blue-900/50'; }
                                        else if (n.includes('cut') || n.includes('hair')) { bg = 'bg-[#ecfdf5] dark:bg-emerald-900/20'; iconColor = 'text-[#10b981]'; Icon = Scissors; sub = 'Hair styling'; border = 'border border-[#d1fae5] dark:border-emerald-900/50'; }
                                        else if (n.includes('facial') || n.includes('face') || n.includes('makeup') || n.includes('skin') || n.includes('cream')) { bg = 'bg-[#f5f3ff] dark:bg-purple-900/20'; iconColor = 'text-[#8b5cf6]'; Icon = Sparkles; sub = isProduct ? 'Skin care' : 'Beauty & makeup'; border = 'border border-[#ede9fe] dark:border-purple-900/50'; }
                                        else if (isProduct) {
                                            const palettes = [
                                                { b: 'bg-indigo-50 dark:bg-indigo-900/20', c: 'text-indigo-500', br: 'border border-indigo-100 dark:border-indigo-900/50' },
                                                { b: 'bg-violet-50 dark:bg-violet-900/20', c: 'text-violet-500', br: 'border border-violet-100 dark:border-violet-900/50' },
                                                { b: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', c: 'text-fuchsia-500', br: 'border border-fuchsia-100 dark:border-fuchsia-900/50' },
                                                { b: 'bg-rose-50 dark:bg-rose-900/20', c: 'text-rose-500', br: 'border border-rose-100 dark:border-rose-900/50' },
                                                { b: 'bg-orange-50 dark:bg-orange-900/20', c: 'text-orange-500', br: 'border border-orange-100 dark:border-orange-900/50' },
                                                { b: 'bg-emerald-50 dark:bg-emerald-900/20', c: 'text-emerald-500', br: 'border border-emerald-100 dark:border-emerald-900/50' },
                                                { b: 'bg-cyan-50 dark:bg-cyan-900/20', c: 'text-cyan-500', br: 'border border-cyan-100 dark:border-cyan-900/50' },
                                                { b: 'bg-blue-50 dark:bg-blue-900/20', c: 'text-blue-500', br: 'border border-blue-100 dark:border-blue-900/50' }
                                            ];
                                            let hash = 0;
                                            for (let i = 0; i < cat.name.length; i++) hash += cat.name.charCodeAt(i);
                                            const p = palettes[hash % palettes.length];
                                            bg = p.b; iconColor = p.c; Icon = Package; sub = 'Retail product'; border = p.br;
                                        }

                                        const isSelected = qSelectedCategory === cat.name;

                                        return (
                                            <button
                                                key={cat.name}
                                                onClick={() => setQSelectedCategory(cat.name)}
                                                className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left ${bg} ${border} ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0A0F1E]' : ''} hover:scale-[1.02]`}
                                            >
                                                <div className="w-10 h-10 rounded-[12px] bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                                                    {cat.image ? (
                                                        <img src={getImageUrl(cat.image)} className="w-full h-full object-cover" alt={cat.name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} style={{ display: cat.image ? 'none' : 'block' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider truncate">{cat.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">{sub}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>
                                    {/* Items Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {(qActiveTab === 'services' ? qFilteredServices : qFilteredProducts)
                                            .filter(i => qSelectedCategory === 'All' || i.category === qSelectedCategory)
                                            .map((item, idx) => {
                                                const isFocused = idx === qFocusedItemIndex;
                                                const img = item.image || item.images?.[0];
                                                return (
                                                    <button
                                                        id={`q-item-item-${idx}`}
                                                        key={item._id}
                                                        onClick={() => addToQCart(item, qActiveTab === 'services' ? 'service' : 'product')}
                                                        className={`qi-svccard border rounded-2xl p-4 flex items-center gap-4 text-left group transition-all relative ${isFocused ? 'ring-2 ring-amber-400' : ''}`}
                                                        style={{ borderColor: isFocused ? '#C69A20' : '' }}
                                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#C69A20'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(180,145,43,0.08)'; }}
                                                        onMouseOut={e => { e.currentTarget.style.borderColor = isFocused ? '#C69A20' : '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >
                                                        <div className="w-12 h-12 rounded-[14px] overflow-hidden flex items-center justify-center flex-shrink-0 border border-amber-100 bg-amber-50/40 transition-all group-hover:scale-105">
                                                            {img && (
                                                                <img src={getImageUrl(img)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            )}
                                                            {qActiveTab === 'services' ? (
                                                                <Scissors className="w-5 h-5" style={{ color: '#C69A20', display: img ? 'none' : 'block' }} strokeWidth={1.5} />
                                                            ) : (
                                                                <Package className="w-5 h-5" style={{ color: '#C69A20', display: img ? 'none' : 'block' }} strokeWidth={1.5} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <p className="text-[12px] font-black tracking-tight leading-tight text-slate-800 line-clamp-1 group-hover:text-slate-900">{item.name}</p>
                                                            {item.duration && (
                                                                <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide">
                                                                    <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                                                                    <span>{item.duration} min</span>
                                                                </div>
                                                            )}
                                                            <p className="text-[12.5px] font-extrabold text-slate-800 mt-1.5">&#8377;{item.price?.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        <button
                                            onClick={() => toast('Feature to add custom services coming soon!', { icon: '✨' })}
                                            className="border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 transition-all"
                                            style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}
                                            onMouseOver={e => { e.currentTarget.style.borderColor = '#C69A20'; e.currentTarget.style.color = '#C69A20'; }}
                                            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">Add Custom Service</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* KPI ROW */}
                        <div className="qi-kpi grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-slate-100 shrink-0 divide-x divide-slate-100 px-0">
                            <div className="flex flex-col gap-0.5 px-4 py-3">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Today&#39;s Sales</span>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-base font-black" style={{ color: '#1e293b' }}>&#8377;12,650</span>
                                        <span className="text-[9px] font-bold ml-1.5" style={{ color: '#10b981' }}>+24.5%</span>
                                    </div>
                                    <svg className="w-14 h-7 shrink-0" viewBox="0 0 100 30" fill="none" stroke="#10b981" strokeWidth="2.5">
                                        <path d="M0 25 L20 22 L40 28 L60 15 L80 18 L100 5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-[9px]" style={{ color: '#94a3b8' }}>vs yesterday</span>
                            </div>
                            <div className="flex flex-col gap-0.5 px-4 py-3">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Invoices</span>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-base font-black" style={{ color: '#1e293b' }}>18</span>
                                        <span className="text-[9px] font-bold ml-1.5" style={{ color: '#8b5cf6' }}>+12</span>
                                    </div>
                                    <svg className="w-14 h-7 shrink-0" viewBox="0 0 100 30" fill="none" stroke="#8b5cf6" strokeWidth="2.5">
                                        <path d="M0 28 L20 25 L40 18 L60 22 L80 10 L100 5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-[9px]" style={{ color: '#94a3b8' }}>vs yesterday</span>
                            </div>
                            <div className="flex flex-col gap-0.5 px-4 py-3">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Average Bill Value</span>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-base font-black" style={{ color: '#1e293b' }}>&#8377;702</span>
                                        <span className="text-[9px] font-bold ml-1.5" style={{ color: '#3b82f6' }}>+8.5%</span>
                                    </div>
                                    <svg className="w-14 h-7 shrink-0" viewBox="0 0 100 30" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                                        <path d="M0 20 L20 28 L40 22 L60 15 L80 18 L100 8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-[9px]" style={{ color: '#94a3b8' }}>vs yesterday</span>
                            </div>
                            <div className="flex flex-col gap-0.5 px-4 py-3">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Top Service</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(198,154,32,0.1)' }}>
                                        <Star className="w-4 h-4" style={{ color: '#C69A20' }} fill="#C69A20" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase leading-none" style={{ color: '#C69A20' }}>Facial O3+ Whitening</p>
                                        <p className="text-[9px] mt-0.5" style={{ color: '#94a3b8' }}>4 Bills</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BILLING STRIP */}
                        <div className="qi-strip flex-shrink-0 border-t" style={{ borderTopColor: '#e2e8f0' }}>
                            <div className="w-full px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto qi-noscroll whitespace-nowrap divide-x divide-slate-200">
                                <div className="flex flex-col flex-1 pr-4 items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Subtotal</span>
                                    <span className="text-[16px] font-black font-mono mt-0.5 text-center" style={{ color: '#1e293b' }}>&#8377;{totals.total.toFixed(2)}</span>
                                </div>



                                {totals.cgst > 0 && (
                                    <div className="flex flex-col flex-1 px-4 items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
                                            Total CGST

                                        </span>
                                        <span className="text-[16px] font-black font-mono mt-0.5 text-center" style={{ color: '#1e293b' }}>&#8377;{totals.cgst.toFixed(2)}</span>
                                    </div>
                                )}

                                {totals.sgst > 0 && (
                                    <div className="flex flex-col flex-1 px-4 items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
                                            Total SGST
                                        </span>
                                        <span className="text-[16px] font-black font-mono mt-0.5 text-center" style={{ color: '#1e293b' }}>&#8377;{totals.sgst.toFixed(2)}</span>
                                    </div>
                                )}
                            
                                {/* Payment Date */}
                                <div className="flex flex-col flex-1 px-4 min-w-[145px] items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: !qPaymentDate ? '#e11d48' : '#64748b' }}>Payment Date</span>
                                    <div className="flex items-center gap-1.5 mt-1.5 justify-center">
                                        <input
                                            type="date"
                                            required
                                            className="qi-date-text text-[13px] font-black outline-none uppercase cursor-pointer text-center"
                                            style={{ background: 'transparent', width: 'auto' }}
                                            value={qPaymentDate}
                                            onChange={e => setQPaymentDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Cash */}
                                <div className="flex flex-col flex-1 px-4 min-w-[140px] items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#10b981' }}>Cash Payment</span>
                                    <div className="qi-cash-pill flex items-center gap-1.5 mt-1 rounded-xl px-2.5 h-[32px] justify-center w-full max-w-[140px]">
                                        <Banknote className="w-4 h-4 flex-shrink-0" />
                                        <input
                                            type="number"
                                            className="flex-1 min-w-0 text-[13px] font-black outline-none font-mono text-center bg-transparent"
                                            value={qPayments.cash || ''}
                                            onChange={e => { setIsPaymentEdited(true); setQPayments({ ...qPayments, cash: Number(e.target.value) }); }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Online/UPI */}
                                <div className="flex flex-col flex-1 px-4 min-w-[140px] items-center">
                                    <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#8b5cf6' }}>Online/UPI</span>
                                    <div className="qi-upi-pill flex items-center gap-1.5 mt-1 rounded-xl px-2.5 h-[32px] justify-center w-full max-w-[140px]">
                                        <Smartphone className="w-4 h-4 flex-shrink-0" />
                                        <input
                                            type="number"
                                            className="flex-1 min-w-0 text-[13px] font-black outline-none font-mono text-center bg-transparent"
                                            value={qPayments.online || ''}
                                            onChange={e => { setIsPaymentEdited(true); setQPayments({ ...qPayments, online: Number(e.target.value) }); }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {qClient && qClientWalletBalance > 0 && (
                                    <div className="flex flex-col flex-1 px-4 min-w-[140px] items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#10b981' }}>Wallet (&#8377;{qClientWalletBalance.toFixed(0)})</span>
                                        <div className="qi-wallet-pill flex items-center gap-1.5 mt-1 rounded-xl px-2.5 h-[32px] justify-center w-full max-w-[140px]">
                                            <Wallet className="w-4 h-4 flex-shrink-0" />
                                            <input
                                                type="number"
                                                style={{ background: 'transparent', color: '#065f46' }}
                                                value={qRedeemWallet || ''}
                                                onChange={e => setQRedeemWallet(Math.min(qClientWalletBalance, Math.min(totals.totalWithPrevDue, Number(e.target.value))))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* ══ END LEFT COLUMN ══ */}


                    {/* ══════════════ RIGHT COLUMN (light theme) ══════════════ */}
                    <div className="qi-right w-full lg:w-[460px] flex flex-col overflow-hidden min-h-[300px] lg:h-full bg-slate-50 border-l border-slate-200">

                        {/* Cart Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 shrink-0 border-b border-slate-200 bg-white">
                            <div className="flex items-center gap-2.5">
                                <ShoppingCart className="w-4 h-4" style={{ color: '#C69A20' }} />
                                <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#C69A20' }}>Cart Items ({qCart.length})</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setQCart([]); setQPayments({ cash: 0, online: 0 }); setIsPaymentEdited(false); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Clear All
                                </button>
                                <div className="w-px h-4 mx-1 bg-slate-300" />
                                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto qi-scroll p-3 space-y-3">
                            {qCart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4 text-slate-400">
                                    <img src="/vector image 3.png?v=2" alt="Empty Cart" className="w-48 h-48 object-contain opacity-90 dark:opacity-80" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Select services to begin</p>
                                </div>
                            ) : qCart.map((item, idx) => (
                                <div key={idx} className="qi-cart-item bg-white rounded-xl p-4 flex flex-col space-y-3 relative shadow-sm border border-slate-200">
                                    {/* Item name + delete */}
                                    <div className="flex justify-between items-start">
                                        <p className="text-[12px] font-black uppercase leading-tight pr-8 line-clamp-2 text-slate-900">{item.name}</p>
                                        <button
                                            onClick={() => setQCart(qCart.filter((_, i) => i !== idx))}
                                            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Price / Tax / Qty / Discount */}
                                    <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-2.5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Price</span>
                                            <p className="text-[12px] font-black text-slate-900">&#8377;{item.price}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tax</span>
                                            {(() => {
                                                const isIncl = (item.isInclusiveTax === true || String(item.isInclusiveTax) === 'true' || (item.isInclusiveTax === undefined && !!fiscal?.inclusiveTax));
                                                const rate = item.type === 'service' ? totals.serviceGstRate : totals.productGstRate;
                                                return isIncl
                                                    ? <span className="-ml-2.5 text-[10px] font-black px-2 py-0.5 rounded-md leading-none w-fit bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 tax-badge-incl">{rate}% (Incl.)</span>
                                                    : <span className="-ml-2.5 text-[10px] font-black px-2 py-0.5 rounded-md leading-none w-fit bg-blue-100 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 tax-badge-excl">{rate}% (Excl.)</span>;
                                            })()}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <style>{`
                                                html body #root div button.discount-btn-active,
                                                html:not(.dark) body #root div button.discount-btn-active { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
                                                
                                                html body #root div button.discount-btn-inactive,
                                                html:not(.dark) body #root div button.discount-btn-inactive { color: #64748b !important; -webkit-text-fill-color: #64748b !important; }
                                                
                                                html body #root div input.discount-input,
                                                html:not(.dark) body #root div input.discount-input { color: #0f172a !important; -webkit-text-fill-color: #0f172a !important; }
                                                
                                                html.dark body #root div input.discount-input { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important; }
                                                
                                                html body #root div span.tax-badge-incl,
                                                html:not(.dark) body #root div span.tax-badge-incl { color: #065f46 !important; -webkit-text-fill-color: #065f46 !important; }
                                                
                                                html.dark body #root div span.tax-badge-incl { color: #34d399 !important; -webkit-text-fill-color: #34d399 !important; }

                                                html body #root div span.tax-badge-excl,
                                                html:not(.dark) body #root div span.tax-badge-excl { color: #1e40af !important; -webkit-text-fill-color: #1e40af !important; }
                                                
                                                html.dark body #root div span.tax-badge-excl { color: #60a5fa !important; -webkit-text-fill-color: #60a5fa !important; }

                                                html body #root div input.discount-input,
                                                html body #root div input.discount-input:focus {
                                                    outline: none !important;
                                                    border: none !important;
                                                    box-shadow: none !important;
                                                    background: transparent !important;
                                                }
                                                html body #root div input.discount-input::-webkit-outer-spin-button,
                                                html body #root div input.discount-input::-webkit-inner-spin-button {
                                                    -webkit-appearance: none !important;
                                                    margin: 0 !important;
                                                }
                                                html body #root div input.discount-input {
                                                    -moz-appearance: textfield !important;
                                                }
                                            `}</style>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Qty</span>
                                            <div className="-ml-6 flex items-center rounded-lg overflow-hidden h-6 w-fit border border-slate-200 bg-white">
                                                <button type="button" onClick={() => updateQQty(idx, -1)} className="px-1.5 h-full flex items-center hover:bg-slate-50 border-r border-slate-200 text-slate-500">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="px-2 text-[11px] font-black h-full flex items-center text-slate-900">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQQty(idx, 1)} className="px-1.5 h-full flex items-center hover:bg-slate-50 border-l border-slate-200 text-slate-500">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Discount</span>
                                            <div className="-ml-5 flex items-center rounded-lg h-6 overflow-hidden w-[110px] border border-slate-200 bg-white">
                                                <button type="button"
                                                    onClick={() => updateQItemMembershipDiscount(idx, 'percentage', item.membershipDiscountValue || 0)}
                                                    className={`px-1.5 text-[10px] font-black h-full border-r border-slate-200 ${(item.membershipDiscountType || 'percentage') === 'percentage' ? 'discount-btn-active' : 'discount-btn-inactive'}`}
                                                    style={{ background: (item.membershipDiscountType || 'percentage') === 'percentage' ? '#1e293b' : 'transparent' }}
                                                >%</button>
                                                <button type="button"
                                                    onClick={() => updateQItemMembershipDiscount(idx, 'fixed', item.membershipDiscountValue || 0)}
                                                    className={`px-1.5 text-[10px] font-black h-full border-r border-slate-200 ${item.membershipDiscountType === 'fixed' ? 'discount-btn-active' : 'discount-btn-inactive'}`}
                                                    style={{ background: item.membershipDiscountType === 'fixed' ? '#1e293b' : 'transparent' }}
                                                >&#8377;</button>
                                                <input
                                                    type="number"
                                                    className="flex-1 min-w-[40px] text-[11px] font-black outline-none text-center h-full bg-transparent text-slate-900 discount-input"
                                                    value={item.membershipDiscountValue === 0 ? '' : (item.membershipDiscountValue || '')}
                                                    placeholder="0"
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        updateQItemMembershipDiscount(idx, item.membershipDiscountType || 'percentage', val === '' ? 0 : Math.max(0, Number(val)));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* CGST / SGST Breakdown for the item */}
                                    {(() => {
                                        const calculatedItem = totals.itemData?.[idx];
                                        const rateSetting = item.type === 'service' ? totals.serviceGstRate : totals.productGstRate;
                                        const itemTaxPercent = Number(item.gstPercent !== undefined ? item.gstPercent : rateSetting) || 0;
                                        const cgstPercent = itemTaxPercent / 2;
                                        const sgstPercent = itemTaxPercent / 2;
                                        
                                        const cgstVal = calculatedItem ? calculatedItem.cgst : 0;
                                        const sgstVal = calculatedItem ? calculatedItem.sgst : 0;
                                        const igstVal = calculatedItem ? calculatedItem.igst : 0;
                                        const isSameState = totals.isSameState;

                                        if (!isSameState && igstVal > 0) {
                                            return (
                                                <div className="flex items-center gap-2 border-t border-dashed border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
                                                    <div className="flex-1 flex items-center justify-between bg-slate-50 px-2 py-1 rounded-md">
                                                        <span>IGST ({itemTaxPercent.toFixed(1)}%):</span>
                                                        <span className="font-mono text-slate-800">&#8377;{igstVal.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="flex items-center gap-2 border-t border-dashed border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
                                                <div className="flex-1 flex items-center justify-between bg-slate-50 px-2 py-1 rounded-md">
                                                    <span>CGST ({cgstPercent.toFixed(1)}%):</span>
                                                    <span className="font-mono text-slate-800">&#8377;{cgstVal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex-1 flex items-center justify-between bg-slate-50 px-2 py-1 rounded-md">
                                                    <span>SGST ({sgstPercent.toFixed(1)}%):</span>
                                                    <span className="font-mono text-slate-800">&#8377;{sgstVal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Stylist Assignment */}
                                    {item.type === 'service' && (
                                        <div className="relative border-t border-slate-100 pt-2.5 mt-2" id={`staff-dropdown-container-${idx}`}>
                                            <label className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest mb-1.5 text-slate-500">
                                                <User className="w-3 h-3" /> Assign Stylists
                                            </label>
                                            <div
                                                className="min-h-[32px] rounded-lg px-2 py-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer transition-colors border border-slate-200 bg-white hover:border-slate-300"
                                                onClick={() => setOpenStaffIdx(openStaffIdx === idx ? null : idx)}
                                            >
                                                {(item.staffIds || []).length > 0 ? (
                                                    item.staffIds.map(sId => {
                                                        const s = staff.find(st => String(st._id) === String(sId));
                                                        return (
                                                            <div key={sId} className="flex items-center gap-1 text-[10px] font-bold pl-2 pr-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                                                                <span className="uppercase">{s?.name || 'Stylist'}</span>
                                                                <button onClick={e => { e.stopPropagation(); toggleStaffInItem(idx, sId); }} className="w-3.5 h-3.5 rounded flex items-center justify-center hover:bg-slate-300 transition-colors">
                                                                    <X className="w-2 h-2" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-[11px] italic px-1 text-slate-400">Assign stylist…</span>
                                                )}
                                                <ChevronDown className="w-3.5 h-3.5 ml-auto shrink-0 text-slate-400" />
                                            </div>
                                            <AnimatePresence>
                                                {openStaffIdx === idx && (
                                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                                                        className="absolute top-full left-0 right-0 z-[100] mt-1 shadow-xl rounded-xl overflow-hidden bg-white border border-slate-200">
                                                        <div className="max-h-[140px] overflow-y-auto custom-scrollbar">
                                                            {qFilteredStaff.map((s, sIdx) => {
                                                                const isSelected = (item.staffIds || []).includes(String(s._id));
                                                                const isFocused = qFocusedStaffIndex === sIdx;
                                                                return (
                                                                    <button key={s._id}
                                                                        id={`q-staff-item-${sIdx}`}
                                                                        onClick={e => { e.stopPropagation(); toggleStaffInItem(idx, s._id); setOpenStaffIdx(null); }}
                                                                        className={`w-full px-3 py-2 text-left flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors ${isFocused ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50'} ${isSelected ? 'bg-amber-50/50' : ''}`}
                                                                    >
                                                                        <span className={`text-xs font-bold uppercase ${isSelected ? 'text-[#C69A20]' : 'text-slate-800'}`}>{s.name}</span>
                                                                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C69A20]" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Note */}


                        {/* NET BILL + FINALIZE CARD */}
                        <div className="px-3 pb-3 shrink-0">
                            <div className="qi-bottom-card rounded-xl p-4 shadow-lg border border-transparent">

                                {/* Client Due & Payment Details */}
                                {qClient && (
                                    <div className="flex flex-col gap-1.5 border-b border-slate-200 dark:border-white/10 pb-2.5 mb-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                        <div className="flex justify-between">
                                            <span>Previous Outstanding:</span>
                                            <span className="font-mono text-slate-800 dark:text-white">&#8377;{Number(qClient.dueAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Current Paid Amount:</span>
                                            <span className="font-mono text-slate-800 dark:text-white">&#8377;{(Number(qPayments.cash || 0) + Number(qPayments.online || 0) + Number(qRedeemWallet || 0)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-rose-600 dark:text-rose-400">
                                            <span>Remaining Outstanding:</span>
                                            <span className="font-mono font-black">&#8377;{Math.max(0, totals.total - (Number(qPayments.cash || 0) + Number(qPayments.online || 0) + Number(qRedeemWallet || 0))).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Amounts */}
                                <div className="flex items-start justify-between mb-4 text-slate-800 dark:text-white">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">Net Bill</span>
                                        <span className="text-xl font-black font-mono block mt-0.5 text-slate-900 dark:text-white">&#8377;{totals.total.toFixed(2)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">Total to Pay</span>
                                        <span className="text-2xl font-black font-mono block mt-0.5 qi-total-pay-val">&#8377;{totals.totalWithPrevDue.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Finalize Button */}
                                <button
                                    onClick={handleConfirm}
                                    disabled={isProcessing || qCart.length === 0}
                                    className={`w-full py-3.5 font-black text-[12px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all mb-4 text-white ${(isProcessing || qCart.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5'}`}
                                    style={{
                                        background: '#B4912B',
                                        color: '#ffffff'
                                    }}
                                >
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            <span>Finalize Bill</span>
                                        </>
                                    )}
                                </button>

                                {/* Payment Pills */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Cash', icon: Banknote, activeCheck: () => qPayments.cash > 0 && qPayments.online === 0 && qRedeemWallet === 0, action: () => { setIsPaymentEdited(true); setQPayments({ cash: totals.totalWithPrevDue, online: 0 }); setQRedeemWallet(0); }, bg: '#22c55e', hoverBg: '#16a34a' },
                                        { label: 'Card', icon: CreditCard, activeCheck: () => qPayments.online > 0 && qPayments.cash === 0 && qRedeemWallet === 0, action: () => { setIsPaymentEdited(true); setQPayments({ cash: 0, online: totals.totalWithPrevDue }); setQRedeemWallet(0); }, bg: '#3b82f6', hoverBg: '#2563eb' },
                                        { label: 'UPI', icon: Smartphone, activeCheck: () => qPayments.online > 0 && qPayments.cash === 0 && qRedeemWallet === 0, action: () => { setIsPaymentEdited(true); setQPayments({ cash: 0, online: totals.totalWithPrevDue }); setQRedeemWallet(0); }, bg: '#8b5cf6', hoverBg: '#7c3aed' },
                                        { label: 'Wallet', icon: Wallet, activeCheck: () => qRedeemWallet > 0, action: () => { if (qClientWalletBalance > 0) { setQRedeemWallet(qRedeemWallet > 0 ? 0 : Math.min(qClientWalletBalance, totals.totalWithPrevDue)); } else { toast.error('Client has no wallet balance'); } }, bg: '#f59e0b', hoverBg: '#d97706' },
                                    ].map(({ label, icon: Icon, activeCheck, action, bg, hoverBg }) => {
                                        const isActive = activeCheck();
                                        return (
                                            <div
                                                role="button"
                                                key={label}
                                                onClick={action}
                                                className="py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all border-none cursor-pointer"
                                                style={{
                                                    background: bg,
                                                    color: '#ffffff',
                                                    opacity: isActive ? 1 : 0.9,
                                                    transform: isActive ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.opacity = 1; }}
                                                onMouseOut={e => { e.currentTarget.style.background = bg; e.currentTarget.style.opacity = isActive ? 1 : 0.9; }}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ══ END RIGHT COLUMN ══ */}

                </div>
            </motion.div>

            {/* ── Outstanding Due Warning ── */}
            <AnimatePresence>
                {showDueWarning && pendingClientSelect && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
                        style={{ background: 'rgba(15,23,42,0.8)' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                            style={{ background: '#fff', border: '1px solid #fde68a' }}>
                            <div className="p-5 flex items-center gap-4" style={{ background: 'linear-gradient(90deg,#f59e0b,#f97316)' }}>
                                <AlertTriangle className="w-6 h-6 text-white" />
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase">Outstanding Due Alert</h4>
                                    <p className="text-amber-100 text-xs font-semibold uppercase mt-0.5">Previous balance detected</p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg text-white flex-shrink-0 bg-amber-500">
                                        {pendingClientSelect.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase text-slate-800 dark:text-slate-200">{pendingClientSelect.name}</p>
                                        <p className="text-xs font-mono mt-0.5 text-slate-500 dark:text-slate-400">{pendingClientSelect.phone}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-xs font-semibold uppercase text-amber-500">Owes</p>
                                        <p className="text-xl font-bold font-mono mt-0.5 text-amber-600">&#8377;{clientPrevDue.toFixed(0)}</p>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#16a34a' }}>Collect previous due now</p>
                                    <input type="number"
                                        className="w-full px-3 py-2 text-sm font-bold rounded-lg outline-none"
                                        style={{ background: '#fff', border: '1px solid #bbf7d0', color: '#1e293b' }}
                                        value={qCollectedPrevDue}
                                        onChange={e => setQCollectedPrevDue(Math.max(0, Math.min(Math.ceil(clientPrevDue), Number(e.target.value) || 0)))}
                                        max={Math.ceil(clientPrevDue)} />
                                </div>
                            </div>
                            <div className="p-5 flex gap-3" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                <button onClick={() => { setShowDueWarning(false); setPendingClientSelect(null); }}
                                    className="flex-1 py-3 text-xs font-bold uppercase rounded-xl transition-all hover:bg-slate-100"
                                    style={{ border: '1px solid #e2e8f0', color: '#64748b' }}>Cancel</button>
                                <button onClick={() => { setQClient(pendingClientSelect); setShowDueWarning(false); setPendingClientSelect(null); }}
                                    className="flex-1 py-3 text-xs font-bold text-white uppercase rounded-xl transition-all"
                                    style={{ background: '#16a34a' }}>Collect &amp; Proceed</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Quick Create Client ── */}
            <AnimatePresence>
                {showNewClient && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                        style={{ background: 'rgba(15,23,42,0.8)' }}>
                        <motion.form initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} onSubmit={handleQuickCreateClient}
                            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="p-5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50">
                                <h4 className="text-xs font-bold uppercase flex items-center gap-2 text-slate-900 dark:text-white">
                                    <UserPlus className="w-4 h-4 text-amber-600" /> New Quick Client
                                </h4>
                                <button type="button" onClick={() => setShowNewClient(false)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { label: 'Customer Name', key: 'name', type: 'text', placeholder: 'e.g. John Doe', required: true },
                                    { label: 'Contact Number', key: 'phone', type: 'tel', placeholder: '10-digit mobile', required: true },
                                    { label: 'Referral Code (Optional)', key: 'appliedReferralCode', type: 'text', placeholder: 'e.g. WAP-XXXXXX', required: false },
                                ].map(({ label, key, type, placeholder, required }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</label>
                                        <input required={required} type={type} placeholder={placeholder}
                                            className="w-full p-3 text-sm font-bold rounded-xl outline-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
                                            value={newClientForm[key] || ''}
                                            onChange={e => setNewClientForm({ ...newClientForm, [key]: key === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : key === 'appliedReferralCode' ? e.target.value.toUpperCase().trim() : e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Birth Date', key: 'dob' },
                                        { label: 'Anniversary', key: 'anniversary' },
                                    ].map(({ label, key }) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</label>
                                            <input type="date" max={new Date().toISOString().split('T')[0]}
                                                className="w-full p-3 text-xs font-bold rounded-xl outline-none bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
                                                value={newClientForm[key]}
                                                onChange={e => setNewClientForm({ ...newClientForm, [key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800/50">
                                <button type="submit" disabled={isSubmittingClient}
                                    className="w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg disabled:opacity-50 transition-all"
                                    style={{ background: '#C69A20' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#B8881C'}
                                    onMouseOut={e => e.currentTarget.style.background = '#C69A20'}>
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
