import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    Scissors, Package, Check, Loader2, Scan,
    Sparkles, User, UserPlus, ArrowRight, Percent, Info,
    Tag, Star, Wallet, Printer, Banknote, Smartphone, FileText, Download,
    ShoppingBag, CreditCard, Ticket, Gift, History, Calendar, Globe, Building2, ChevronDown,
    AlertTriangle, CheckCircle2, UserMinus, LayoutGrid, ArrowDown, Clock, Brush, Droplet
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
    const [paymentDate, setPaymentDate] = useState(getTodayDateString());
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
        // setRedeemPoints(0);
        setRedeemWallet(0);
        setOrderId(null);
        setAppointmentId(null);
        setSelectedBookingIds([]);
        setSelectedOrderIds([]);
        setIncludePreviousDue(false);
        setPaymentDate(getTodayDateString());
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
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${activeTab === 'services' && serviceMode === 'bookings'
                                    ? '!bg-[#cca839] !text-slate-950 shadow-sm font-black'
                                    : '!bg-transparent !text-slate-400 hover:!text-slate-200'
                                    }`}
                            >Completed Bookings</button>
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('orders');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${activeTab === 'services' && serviceMode === 'orders'
                                    ? '!bg-[#cca839] !text-slate-950 shadow-sm font-black'
                                    : '!bg-transparent !text-slate-400 hover:!text-slate-200'
                                    }`}
                            >Completed Orders</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-1 pr-2 custom-scrollbar">
                        {filteredItems.map((item, idx) => {
                            const isSelected = item.isAppointment
                                ? selectedBookingIds.includes(item._id)
                                : item.isOrder
                                    ? selectedOrderIds.includes(item._id)
                                    : cart.some(c => String(c.itemId) === String(item._id || item.id));
                            const isFocused = idx === focusedItemIndex;
                            return (
                                <button
                                    id={`pos-item-${idx}`}
                                    key={item.id || item._id}
                                    onClick={() => addToCart(item)}
                                    className={`relative bg-background border rounded-xl p-3 text-left hover:border-primary transition-all group flex flex-col justify-between h-[80px] shadow-sm hover:shadow-md active:scale-95 ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'
                                        }`}
                                >
                                    {isSelected ? (
                                        <div className="absolute top-1.5 right-1.5 !bg-[#cca839] !text-slate-950 text-[9px] font-black px-2 py-0.5 uppercase tracking-wider rounded-md shadow-sm z-10">
                                            In Cart
                                        </div>
                                    ) : (
                                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                        <div className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar">

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
                                                className="flex-1 h-8 rounded-lg !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-800 px-2 text-[10px] font-bold outline-none focus:border-primary transition-all uppercase !text-slate-800 dark:!text-white"
                                            >
                                                <option value="cash" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">CASH</option>
                                                <option value="online" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">ONLINE</option>
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
                            <div className="pos-billing-cart-total-box border border-border rounded-xl bg-surface-alt p-3 shadow-lg">
                                <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                    <span>Subtotal</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>

                                {totals.cgst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                        <span>
                                            CGST {cart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                                cart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                    totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                        </span>
                                        <div className="flex gap-1 text-right">
                                            {totals.cgst > totals.cgstExcl && <span className="text-emerald-600 dark:text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.cgstExcl > 0 && <span>+</span>}
                                            <span>₹{totals.cgst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                {totals.sgst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                        <span>
                                            SGST {cart.every(i => i.type === 'service') ? `(${(totals.serviceGstRate) / 2}%)` :
                                                cart.every(i => i.type === 'product') ? `(${(totals.productGstRate) / 2}%)` :
                                                    totals.serviceGstRate === totals.productGstRate ? `(${(totals.serviceGstRate) / 2}%)` : ''}
                                        </span>
                                        <div className="flex gap-1 text-right">
                                            {totals.sgst > totals.sgstExcl && <span className="text-emerald-600 dark:text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.sgstExcl > 0 && <span>+</span>}
                                            <span>₹{totals.sgst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                                {totals.igst > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 opacity-90 text-text">
                                        <span>IGST {totals.serviceGstRate === totals.productGstRate ? `(${totals.serviceGstRate}%)` : ''}</span>
                                        <div className="flex gap-1 text-right">
                                            {totals.igst > totals.totalExclusiveTax && <span className="text-emerald-600 dark:text-emerald-400/80 font-normal">(Included)</span>}
                                            {totals.totalExclusiveTax > 0 && <span>+</span>}
                                            <span>₹{totals.igst.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}

                                {totals.discount > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span>-₹{totals.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {totals.membershipDiscount > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 text-emerald-600 dark:text-emerald-400">
                                        <span>Membership Disc</span>
                                        <span>-₹{totals.membershipDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {includePreviousDue && Number(selectedClient?.dueAmount || 0) > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mb-1 text-rose-600 dark:text-rose-400 animate-pulse">
                                        <span>Previous Dues Added</span>
                                        <span>+₹{Number(selectedClient.dueAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-border/50 mt-2 pt-2 flex items-center justify-between">
                                    <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">TOTAL</span>
                                    <span className="text-2xl font-bold tracking-tight text-text">₹{totals.total.toFixed(2)}</span>
                                </div>

                                {totals.redeemWallet > 0 && (
                                    <div className="flex justify-between text-[11px] font-bold mt-2 text-emerald-600 dark:text-emerald-400">
                                        <span>Wallet Used</span>
                                        <span>-₹{totals.redeemWallet.toFixed(2)}</span>
                                    </div>
                                )}

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

                            {/* ACTIONS */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setShowDiscountModal(true)}
                                    className="h-10 rounded-xl !border !border-slate-300 dark:!border-slate-800 !bg-slate-100 dark:!bg-slate-900 text-xs font-bold uppercase hover:!bg-slate-200 dark:hover:!bg-slate-800 transition-colors !text-slate-800 dark:!text-slate-200"
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

                        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                            <div className="space-y-6">
                                <div className="bg-surface-alt p-4 border border-border rounded-xl">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 block">Flat or Percentage Adjustment</label>
                                    <div className="flex !border !border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-800 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                        <select
                                            className="bg-transparent border-r !border-slate-300 dark:!border-slate-700 text-[10px] font-bold p-3 !text-slate-800 dark:!text-white outline-none"
                                            value={manualDiscount.type}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, type: e.target.value })}
                                        >
                                            <option value="fixed" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">FLAT ₹</option>
                                            <option value="percentage" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">% OFF</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="flex-1 p-3 text-sm font-black bg-transparent !text-slate-800 dark:!text-white outline-none"
                                            value={manualDiscount.value || ''}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, value: Number(e.target.value) })}
                                            onFocus={(e) => { if (manualDiscount.value === 0) setManualDiscount({ ...manualDiscount, value: '' }) }}
                                            onBlur={(e) => { if (manualDiscount.value === '') setManualDiscount({ ...manualDiscount, value: 0 }) }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-surface-alt p-4 border border-border rounded-xl">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 block">Coupon Code</label>
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
                                        <div className="flex !border !border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-800 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                            <input
                                                type="text"
                                                placeholder="ENTER COUPON CODE"
                                                className="flex-1 p-3 text-xs font-black bg-transparent !text-slate-800 dark:!text-white outline-none uppercase tracking-widest placeholder:opacity-50"
                                                value={couponCodeInput}
                                                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={applyingCoupon || !couponCodeInput}
                                                className="!bg-slate-900 dark:!bg-white hover:!bg-slate-800 dark:hover:!bg-slate-100 !text-white dark:!text-slate-900 font-black text-[10px] uppercase tracking-wider px-5 rounded-r-lg transition-all disabled:opacity-40"
                                            >
                                                {applyingCoupon ? 'Checking...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {selectedClient && (
                                    <div className="space-y-4">
                                        {/* Wallet Balance */}
                                        <div className="!bg-emerald-50/5 dark:!bg-emerald-950/20 p-4 !border !border-emerald-200/50 dark:!border-emerald-900/20 rounded-xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="w-4 h-4 !text-emerald-500" />
                                                    <span className="text-[10px] font-black !text-emerald-700 dark:!text-emerald-400 uppercase tracking-widest">Wallet Balance</span>
                                                </div>
                                                <span className="text-xs font-black !text-emerald-600 dark:!text-emerald-400">₹{clientWalletBalance.toFixed(0)}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Amount to redeem"
                                                    className="flex-1 p-2.5 text-sm font-black !bg-white dark:!bg-slate-800 !text-slate-800 dark:!text-white !border !border-slate-300 dark:!border-slate-700 outline-none focus:border-emerald-500 rounded-lg transition-all"
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
                                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${redeemWallet > 0 ? '!bg-[#cca839] !text-slate-950 shadow-lg shadow-black/10' : '!bg-slate-200 dark:!bg-slate-700 !text-slate-700 dark:!text-slate-300'}`}
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
                            <button onClick={() => setShowDiscountModal(false)} className="px-10 py-3 !bg-[#cca839] !text-slate-950 hover:!bg-[#b59533] font-black text-xs uppercase tracking-widest transition-opacity shadow-lg shadow-black/10 active:scale-95 transition-all">
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
    const [qPaymentDate, setQPaymentDate] = useState(getTodayDateString());
    const [qSearchItem, setQSearchItem] = useState('');

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
                promotionId: undefined,
                couponCode: undefined
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
                if (showClientDropdown) {
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
    }, [showClientDropdown, qFilteredClients, qFocusedClientIndex, qSelectedCategory, qActiveTab, qFilteredServices, qFilteredProducts, qFocusedItemIndex, showNewClient]);

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
                    .qi-bottom-card { background-color: #0A0F1E !important; border-color: rgba(255,255,255,0.08) !important; border-radius: 0.75rem !important; }
                    .qi-discount-bg { background-color: #fff1f2 !important; border-color: #fecdd3 !important; }
                    .qi-discount-text { color: #e11d48 !important; }
                    .qi-input-bg { background-color: #ffffff !important; border-color: #e2e8f0 !important; }

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
                    html.dark .qi-discount-bg { background-color: rgba(225,29,72,0.1) !important; border-color: rgba(225,29,72,0.3) !important; }
                    html.dark .qi-discount-text { color: #f1f5f9 !important; }
                    html.dark .qi-input-bg { background-color: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
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
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${Number(c.dueAmount || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-amber-50 text-amber-600'}`}>
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={qActiveTab === 'services' ? "Search services..." : "Search products..."}
                                    className="w-full border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs font-semibold outline-none bg-white text-slate-800 focus:border-amber-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
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
                                                        <img src={getImageUrl(cat.image)} className="w-full h-full object-cover" alt={cat.name} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
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
                                                                <img src={getImageUrl(img)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
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
                            <div className="w-full px-4 py-2.5 flex items-center gap-0 overflow-x-auto qi-noscroll whitespace-nowrap divide-x divide-slate-200">

                                <div className="flex flex-col shrink-0 pr-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Subtotal</span>
                                    <span className="text-[13px] font-black font-mono mt-0.5" style={{ color: '#1e293b' }}>&#8377;{totals.subtotal.toFixed(2)}</span>
                                </div>

                                {totals.cgst > 0 && (
                                    <div className="flex flex-col shrink-0 px-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
                                            CGST {totals.serviceGstRate > 0 ? `(${totals.serviceGstRate / 2}%)` : ''}
                                        </span>
                                        <span className="text-[13px] font-black font-mono mt-0.5" style={{ color: '#1e293b' }}>&#8377;{totals.cgst.toFixed(2)}</span>
                                    </div>
                                )}

                                {totals.sgst > 0 && (
                                    <div className="flex flex-col shrink-0 px-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>
                                            SGST {totals.serviceGstRate > 0 ? `(${totals.serviceGstRate / 2}%)` : ''}
                                        </span>
                                        <span className="text-[13px] font-black font-mono mt-0.5" style={{ color: '#1e293b' }}>&#8377;{totals.sgst.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Discount */}
                                <div className="flex flex-col shrink-0 px-4 min-w-[100px]">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Discount</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="qi-discount-bg flex items-center rounded-lg overflow-hidden h-[22px]" style={{ border: '1px solid' }}>
                                            <button
                                                type="button"
                                                onClick={() => setQManualDiscount(p => ({ ...p, type: p.type === 'fixed' ? 'percentage' : 'fixed' }))}
                                                className="px-1.5 text-[10px] font-black h-full flex items-center gap-0.5 border-r qi-discount-bg"
                                                style={{ color: '#fb7185' }}
                                            >
                                                <Tag className="w-2.5 h-2.5" />
                                                {qManualDiscount.type === 'fixed' ? ' ₹' : ' %'}
                                            </button>
                                            <input
                                                type="number"
                                                className="qi-discount-text w-11 text-[11px] font-black outline-none text-center px-1"
                                                style={{ background: 'transparent' }}
                                                value={qManualDiscount.value || ''}
                                                onChange={e => setQManualDiscount({ ...qManualDiscount, value: Number(e.target.value) })}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Date */}
                                <div className="flex flex-col shrink-0 px-4 min-w-[130px]">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: !qPaymentDate ? '#e11d48' : '#64748b' }}>Payment Date</span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#94a3b8' }} />
                                        <input
                                            type="date"
                                            required
                                            className="qi-date-text text-[11px] font-black outline-none uppercase cursor-pointer"
                                            style={{ background: 'transparent', width: 'auto' }}
                                            value={qPaymentDate}
                                            onChange={e => setQPaymentDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Cash */}
                                <div className="flex flex-col shrink-0 px-4 min-w-[110px]">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Cash Payment</span>
                                    <div className="qi-input-bg flex items-center gap-1 mt-1 rounded-lg px-2 h-[22px]" style={{ border: '1px solid' }}>
                                        <Banknote className="w-3 h-3" style={{ color: '#94a3b8' }} />
                                        <input
                                            type="number"
                                            className="w-14 text-[11px] font-black outline-none font-mono"
                                            style={{ background: 'transparent' }}
                                            value={qPayments.cash || ''}
                                            onChange={e => { setIsPaymentEdited(true); setQPayments({ ...qPayments, cash: Number(e.target.value) }); }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Online/UPI */}
                                <div className="flex flex-col shrink-0 px-4 min-w-[110px]">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Online/UPI</span>
                                    <div className="qi-input-bg flex items-center gap-1 mt-1 rounded-lg px-2 h-[22px]" style={{ border: '1px solid' }}>
                                        <Smartphone className="w-3 h-3" style={{ color: '#94a3b8' }} />
                                        <input
                                            type="number"
                                            className="w-14 text-[11px] font-black outline-none font-mono"
                                            style={{ background: 'transparent' }}
                                            value={qPayments.online || ''}
                                            onChange={e => { setIsPaymentEdited(true); setQPayments({ ...qPayments, online: Number(e.target.value) }); }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {qClient && qClientWalletBalance > 0 && (
                                    <div className="flex flex-col shrink-0 px-4 min-w-[110px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#10b981' }}>Wallet (&#8377;{qClientWalletBalance.toFixed(0)})</span>
                                        <div className="flex items-center gap-1 mt-1 rounded-lg px-2 h-[22px]" style={{ border: '1px solid #a7f3d0', background: '#f0fdf4' }}>
                                            <Wallet className="w-3 h-3" style={{ color: '#10b981' }} />
                                            <input
                                                type="number"
                                                className="w-14 text-[11px] font-black outline-none font-mono"
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
                                    <img src="/vector image 3.png" alt="Empty Cart" className="w-48 h-48 object-contain opacity-90 mix-blend-multiply dark:mix-blend-normal" />
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
                                                    ? <span className="text-[10px] font-black px-2 py-0.5 rounded-md leading-none w-fit bg-emerald-100 text-emerald-800">{rate}%</span>
                                                    : <span className="text-[10px] font-black px-2 py-0.5 rounded-md leading-none w-fit bg-blue-100 text-blue-800">Excl.</span>;
                                            })()}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Qty</span>
                                            <div className="flex items-center rounded-lg overflow-hidden h-6 w-fit border border-slate-200 bg-white">
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
                                            <div className="flex items-center rounded-lg h-6 overflow-hidden w-[90px] border border-slate-200 bg-white">
                                                <button type="button"
                                                    onClick={() => updateQItemMembershipDiscount(idx, 'percentage', item.membershipDiscountValue || 0)}
                                                    className="px-1.5 text-[10px] font-black h-full border-r border-slate-200"
                                                    style={{ background: (item.membershipDiscountType || 'percentage') === 'percentage' ? '#1e293b' : 'transparent', color: (item.membershipDiscountType || 'percentage') === 'percentage' ? '#fff' : '#64748b' }}
                                                >%</button>
                                                <button type="button"
                                                    onClick={() => updateQItemMembershipDiscount(idx, 'fixed', item.membershipDiscountValue || 0)}
                                                    className="px-1.5 text-[10px] font-black h-full border-r border-slate-200"
                                                    style={{ background: item.membershipDiscountType === 'fixed' ? '#1e293b' : 'transparent', color: item.membershipDiscountType === 'fixed' ? '#fff' : '#64748b' }}
                                                >&#8377;</button>
                                                <input
                                                    type="number"
                                                    className="flex-1 text-[11px] font-black outline-none text-center h-full bg-transparent text-slate-900"
                                                    value={item.membershipDiscountValue || 0}
                                                    onChange={e => updateQItemMembershipDiscount(idx, item.membershipDiscountType || 'percentage', Math.max(0, Number(e.target.value) || 0))}
                                                />
                                            </div>
                                        </div>
                                    </div>

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
                                                            {qFilteredStaff.map(s => {
                                                                const isSelected = (item.staffIds || []).includes(String(s._id));
                                                                return (
                                                                    <button key={s._id}
                                                                        onClick={e => { e.stopPropagation(); toggleStaffInItem(idx, s._id); setOpenStaffIdx(null); }}
                                                                        className={`w-full px-3 py-2 text-left flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 ${isSelected ? 'bg-amber-50/50' : ''}`}
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
                        <div className="px-3 pb-2 shrink-0">
                            <div className="flex items-center gap-2 rounded-xl p-3 border border-slate-200 bg-white shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                                <FileText className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="+ Add Note (Optional)"
                                    className="w-full border-0 outline-none text-xs font-bold bg-transparent text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* NET BILL + FINALIZE CARD */}
                        <div className="px-3 pb-3 shrink-0">
                            <div className="qi-bottom-card rounded-xl p-4 shadow-lg border border-transparent">
                                {/* Amounts */}
                                <div className="flex items-start justify-between mb-4 text-white">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">Net Bill</span>
                                        <span className="text-xl font-black font-mono block mt-0.5 text-white">&#8377;{totals.total.toFixed(2)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">Total to Pay</span>
                                        <span className="text-2xl font-black font-mono block mt-0.5 text-yellow-500">&#8377;{totals.totalWithPrevDue.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Finalize Button */}
                                <button
                                    onClick={handleConfirm}
                                    disabled={isProcessing || qCart.length === 0}
                                    className="w-full py-3.5 font-black text-[12px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all mb-4 text-white disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                                    style={{
                                        background: (isProcessing || qCart.length === 0) ? '#334155' : '#b48325',
                                        color: (isProcessing || qCart.length === 0) ? '#94a3b8' : '#ffffff'
                                    }}
                                    onMouseOver={e => { if (!isProcessing && qCart.length > 0) e.currentTarget.style.background = '#9c701c'; }}
                                    onMouseOut={e => { if (!isProcessing && qCart.length > 0) e.currentTarget.style.background = '#b48325'; }}
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
                                            <button
                                                key={label}
                                                onClick={action}
                                                className="py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex flex-col items-center gap-1 transition-all border-none"
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
                                            </button>
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
                                        value={qCollectedPrevDue || ''}
                                        onChange={e => setQCollectedPrevDue(Math.min(Math.ceil(clientPrevDue), Number(e.target.value)))}
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
                            className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
                            style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                            <div className="p-5 flex justify-between items-center" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <h4 className="text-xs font-bold uppercase flex items-center gap-2" style={{ color: '#1e293b' }}>
                                    <UserPlus className="w-4 h-4" style={{ color: '#C69A20' }} /> New Quick Client
                                </h4>
                                <button type="button" onClick={() => setShowNewClient(false)} style={{ color: '#94a3b8' }} className="hover:text-red-500">
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
                                        <label className="text-xs font-semibold uppercase" style={{ color: '#64748b' }}>{label}</label>
                                        <input required={required} type={type} placeholder={placeholder}
                                            className="w-full p-3 text-sm font-bold rounded-xl outline-none"
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b' }}
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
                                            <label className="text-xs font-semibold uppercase" style={{ color: '#64748b' }}>{label}</label>
                                            <input type="date" max={new Date().toISOString().split('T')[0]}
                                                className="w-full p-3 text-xs font-bold rounded-xl outline-none"
                                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b' }}
                                                value={newClientForm[key]}
                                                onChange={e => setNewClientForm({ ...newClientForm, [key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
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
