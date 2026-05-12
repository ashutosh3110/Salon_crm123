import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, ShoppingCart, Plus, Minus, X, Trash2,
    Scissors, Package, Check, Loader2, Scan,
    Sparkles, User, UserPlus, ArrowRight, Percent, Info,
    Tag, Star, Wallet, Printer, Banknote, Smartphone, FileText, Download,
    ShoppingBag, CreditCard, Ticket, Gift, History, Calendar, Globe, Building2
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
                <Text style={pdfStyles.value}>#{invoice.number}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Date:</Text>
                <Text style={pdfStyles.value}>{invoice.date}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Customer:</Text>
                <Text style={pdfStyles.value}>{invoice.client?.name?.toUpperCase()}</Text>
            </View>
            <View style={pdfStyles.metaRow}>
                <Text style={pdfStyles.label}>Payment:</Text>
                <Text style={pdfStyles.value}>{invoice.payments?.[0]?.method?.toUpperCase() || 'CASH'}</Text>
            </View>

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.tableHeader}>
                <Text style={pdfStyles.colDesc}>DESCRIPTION</Text>
                <Text style={pdfStyles.colPrice}>AMOUNT</Text>
            </View>

            {invoice.items.map((item, i) => (
                <View key={i} style={pdfStyles.tableRow}>
                    <View style={pdfStyles.itemMainRow}>
                        <Text style={pdfStyles.colDesc}>{item.name.toUpperCase()}</Text>
                        <Text style={pdfStyles.colPrice}>Rs. {(item.price * item.quantity).toFixed(0)}</Text>
                    </View>
                    <View style={pdfStyles.itemSubRow}>
                        <Text>Qty: {item.quantity} x {item.price}</Text>
                        <Text>Stylist: {item.staffName}</Text>
                    </View>
                </View>
            ))}

            <View style={pdfStyles.divider} />

            <View style={pdfStyles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>Rs. {invoice.totals.subtotal.toFixed(0)}</Text>
            </View>
            {(invoice.discounts?.manual?.value > 0 || invoice.discounts?.points > 0 || invoice.discounts?.wallet > 0) && (
                <View style={pdfStyles.summaryRow}>
                    <Text>Total Discount</Text>
                    <Text>-Rs. {(Number(invoice.discounts?.manual?.value || 0) + Number(invoice.discounts?.points || 0) + Number(invoice.discounts?.wallet || 0)).toFixed(0)}</Text>
                </View>
            )}
            
            <View style={pdfStyles.summaryRow}>
                <Text>Taxable Value</Text>
                <Text>Rs. {invoice.totals.taxable.toFixed(2)}</Text>
            </View>

            {invoice.totals.isSameState ? (
                <>
                    <View style={pdfStyles.summaryRow}>
                        <Text>CGST ({taxRate / 2}%)</Text>
                        <Text>Rs. {invoice.totals.cgst.toFixed(2)}</Text>
                    </View>
                    <View style={pdfStyles.summaryRow}>
                        <Text>SGST ({taxRate / 2}%)</Text>
                        <Text>Rs. {invoice.totals.sgst.toFixed(2)}</Text>
                    </View>
                </>
            ) : (
                <View style={pdfStyles.summaryRow}>
                    <Text>IGST ({taxRate}%)</Text>
                    <Text>Rs. {invoice.totals.igst.toFixed(2)}</Text>
                </View>
            )}

            <View style={pdfStyles.grandTotal}>
                <Text>GRAND TOTAL</Text>
                <Text>Rs. {invoice.totals.total.toFixed(0)}</Text>
            </View>

            <View style={pdfStyles.footer}>
                <Text style={pdfStyles.thanks}>THANK YOU! VISIT AGAIN :)</Text>
                <Text>This is a computer generated receipt.</Text>
                <Text>Generated by Wapixo POS</Text>
            </View>
        </Page>
    </Document>
);

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
        fetchCustomers
    } = useBusiness();
    const { addRevenue } = useFinance();
    const { allWallets, adminAdjustBalance, initializeWallet } = useWallet();
    const location = useLocation();
    // ─── State ──────────────────────────────────────────────
    const [cart, setCart] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [payments, setPayments] = useState([{ method: 'cash', amount: 0 }]);
    const [taxPercent, setTaxPercent] = useState(18);
    const [customerGstin, setCustomerGstin] = useState('');
    const [customerState, setCustomerState] = useState('Uttar Pradesh'); // Default to Salon State
    const [pendingAppOrder, setPendingAppOrder] = useState(null);

    useEffect(() => {
        if (!platformSettings) {
            fetchPlatformSettings();
        }
    }, [platformSettings, fetchPlatformSettings]);

    // Fiscal Settings (from localStorage)
    const fiscal = useMemo(() => {
        const saved = localStorage.getItem('pos_fiscal_settings');
        const base = saved ? JSON.parse(saved) : {
            businessName: 'XYZ SALON & SPA',
            gstin: '09AAFCC0301F1ZN',
            state: 'Uttar Pradesh',
            stateCode: '09',
            serviceGst: 18,
            productGst: 12,
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

    useEffect(() => {
        if (fiscal.state) setCustomerState(fiscal.state);
        // Fallback tax percent for general display
        if (fiscal.serviceGst) setTaxPercent(fiscal.serviceGst);
        
        // Refresh data to accurately filter billed items
        fetchInvoices?.();
        fetchOrders?.();
        fetchBookings?.();
        fetchCustomers?.();
        if (activeOutletId) {
            fetchServices?.(salon?._id, activeOutletId);
        }
    }, [fiscal, fetchInvoices, fetchOrders, fetchBookings, fetchCustomers, fetchServices, activeOutletId, salon?._id]);

    // UI State
    const [activeTab, setActiveTab] = useState('services');
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

    // Prevent background scroll when any modal is open
    const isAnyModalOpen = showDiscountModal || showCameraScanner || !!successInvoice || showNewClient;

    useEffect(() => {
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh'; // Extra safety for mobile
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        }
        return () => { 
            document.body.style.overflow = 'unset';
            document.body.style.height = 'auto';
        };
    }, [isAnyModalOpen]);
    const [scanError, setScanError] = useState(null);

    // Discount/Redemption
    const [manualDiscount, setManualDiscount] = useState({ type: 'fixed', value: 0 });
    const [offerTab, setOfferTab] = useState('manual');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherCodeInput, setVoucherCodeInput] = useState('');
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [redeemWallet, setRedeemWallet] = useState(0);
    const [appointmentId, setAppointmentId] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '' });

    // Billing & Payment System Updates
    const [includePreviousDue, setIncludePreviousDue] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
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
        let serviceSubtotal = 0;
        let productSubtotal = 0;

        cart.forEach(item => {
            if (item.isPackageRedemption) return;
            if (item.type === 'service') serviceSubtotal += (item.price * item.quantity);
            else productSubtotal += (item.price * item.quantity);
        });

        const subtotal = serviceSubtotal + productSubtotal;

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

        const totalDeductions = discount + (redeemPoints || 0) + (redeemWallet || 0);
        const discountFactor = subtotal > 0 ? (subtotal - totalDeductions) / subtotal : 1;

        let totalTax = 0;
        let totalTaxableValue = 0;

        cart.forEach(item => {
            if (item.isPackageRedemption) return;
            
            const netItemTotal = (item.price * item.quantity) * discountFactor;
            const sGst = Number(platformSettings?.serviceGst || fiscal.serviceGst || 18);
            const pGst = Number(platformSettings?.productGst || fiscal.productGst || 12);
            const itemTaxRate = (item.type === 'service' ? sGst : pGst) / 100;
            
            if (fiscal.inclusiveTax) {
                const taxableVal = netItemTotal / (1 + itemTaxRate);
                totalTaxableValue += taxableVal;
                totalTax += (netItemTotal - taxableVal);
            } else {
                totalTaxableValue += netItemTotal;
                totalTax += (netItemTotal * itemTaxRate);
            }
        });

        const isSameState = customerState === fiscal.state;
        const cgst = isSameState ? totalTax / 2 : 0;
        const sgst = isSameState ? totalTax / 2 : 0;
        const igst = !isSameState ? totalTax : 0;

        const currentBillTotal = fiscal.inclusiveTax 
            ? Math.max(0, subtotal - totalDeductions) 
            : Math.max(0, subtotal - totalDeductions) + totalTax;

        const previousDue = (selectedClient?.dueAmount || 0);
        const grandTotal = includePreviousDue ? currentBillTotal + previousDue : currentBillTotal;

        const serviceDiscount = serviceSubtotal * (1 - discountFactor);
        const productDiscount = productSubtotal * (1 - discountFactor);

        let totalMembershipDiscount = 0;
        let totalGrossAmount = 0;

        cart.forEach(item => {
            if (item.isPackageRedemption) return;
            if (item.originalBooking) {
                totalGrossAmount += (item.originalBooking.subtotal || item.price) * item.quantity;
                totalMembershipDiscount += (item.originalBooking.membershipDiscount || 0) * item.quantity;
            } else {
                totalGrossAmount += (item.price * item.quantity);
            }
        });

        return { 
            subtotal, 
            serviceSubtotal,
            productSubtotal,
            grossAmount: totalGrossAmount,
            membershipDiscount: totalMembershipDiscount,
            discount, 
            serviceDiscount,
            productDiscount,
            tax: totalTax, 
            cgst, 
            sgst, 
            igst, 
            isSameState,
            discountFactor,
            total: grandTotal, 
            taxable: totalTaxableValue, 
            currentBillTotal, 
            previousDue,
            redeemPoints: (redeemPoints || 0),
            redeemWallet: (redeemWallet || 0)
        };
    }, [cart, manualDiscount, appliedPromotion, appliedVoucher, redeemPoints, redeemWallet, taxPercent, selectedClient, includePreviousDue, fiscal, customerState]);

    // Get real-time wallet balance
    const clientWalletBalance = useMemo(() => {
        if (!selectedClient?._id) return 0;
        return (allWallets || {})[selectedClient._id]?.balance || 0;
    }, [selectedClient, allWallets]);

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
            return itemOutletIds.length === 0 ||
                itemOutletIds.some(id => String(id?._id || id) === String(activeOutletId));
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
                
                // Filter by outlet
                const matchOutlet = !activeOutletId || String(b.outletId?._id || b.outletId) === String(activeOutletId);
                if (!matchOutlet) return false;

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

                // Filter by outlet
                const matchOutlet = !activeOutletId || String(o.outletId?._id || o.outletId) === String(activeOutletId);
                if (!matchOutlet) return false;

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
    }, [activeTab, searchItem, selectedCategory, serviceMode, businessBookings, businessOrders, invoices, allOutletItems, activeOutletId]);

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
            setCart([{
                ...item,
                itemId: item.serviceId?._id || item.serviceId || item._id,
                type: 'service',
                quantity: 1,
                staffIds: staffId ? [staffId] : [],
                appointmentId: item._id
            }]);
            setAppointmentId(item._id);
            setOrderId(null);
            return;
        }

        if (item.isOrder) {
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
                    staffIds: ['']
                };
            }).filter(i => i.itemId);

            setCart(newCartItems);
            setOrderId(item._id);
            setAppointmentId(null);
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

                // Prepare Backend Request Body - Only include valid keys
                const checkoutPayload = {
                    clientId: selectedClient._id,
                    outletId: String(finalOutletId),
                    items: cart.map(item => {
                        const baseItem = {
                            type: item.type,
                            itemId: item.id || item._id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity
                        };
                        const sId = (item.staffIds || [])[0];
                        if (sId) baseItem.stylistId = sId;
                        return baseItem;
                    }),
                    tax: totals.tax,
                    paymentMethod: payments[0]?.method || 'cash',
                    useLoyaltyPoints: redeemPoints,
                    useWalletAmount: redeemWallet,
                    discount: totals.discount,
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
                    date: new Date().toLocaleString('en-IN', {
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
                        points: redeemPoints,
                        wallet: redeemWallet
                    },
                    paymentDate: paymentDate
                };

                setSuccessInvoice(invoiceData);
                
                // Show success message or thermal receipt first, then navigate
                // If you want immediate navigation, uncomment below and comment out success state logic
                // navigate('/pos/invoices');

                // For now, let's keep the success view but make navigation faster or triggerable
                setSuccessInvoice(invoiceData);
                
                // Show success message or thermal receipt first, then navigate
                // If you want immediate navigation, uncomment below and comment out success state logic
                // navigate('/pos/invoices');

                // For now, let's keep the success view but make navigation faster or triggerable
                setTimeout(() => {
                    navigate('/pos/invoices');
                }, 1500); // Reduced to 1.5s for better UX


                // ── Sync Appointment Status ──
                if (appointmentId) {
                    try {
                        await api.patch(`/bookings/${appointmentId}/status`, {
                            status: 'completed',
                            paymentStatus: 'paid',
                            paymentMethod: payments[0]?.method || 'salon'
                        });
                    } catch (syncErr) {
                        console.error('[POS] Protocol Sync Error:', syncErr);
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

        addBusinessCustomer(newClient);
        setSelectedClient(newClient);
        setShowClientInfo(true);
        setShowNewClient(false);
        setNewClientForm({ name: '', phone: '', email: '' });
        setSearchClient('');
        setShowClientDropdown(false);
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            const blob = await pdf(<InvoicePDF invoice={successInvoice} role={user?.role} salon={salon} taxRate={taxPercent} />).toBlob();
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
                        <h2 className="text-lg font-black uppercase tracking-tighter">{salon?.name || fiscal.businessName}</h2>
                        <p className="text-[10px]">{typeof salon?.address === 'object' ? `${salon.address.street || ''}, ${salon.address.city || ''}` : (salon?.address || fiscal.address || 'Address Placeholder')}</p>
                        <p className="text-[10px]">Ph: {salon?.phone || 'Phone Placeholder'}</p>
                        <p className="text-[10px] font-bold">GSTIN: {salon?.gstin || fiscal.gstin}</p>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mb-2 space-y-0.5">
                        <div className="flex justify-between"><span>Inv No:</span><span className="font-bold">{successInvoice.number}</span></div>
                        <div className="flex justify-between"><span>Date:</span><span>{successInvoice.date}</span></div>
                        <div className="flex justify-between"><span>Outlet:</span><span>{successInvoice.outlet}</span></div>
                        <div className="flex justify-between"><span>Cashier:</span><span>{successInvoice.cashier}</span></div>
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mb-2">
                        <div className="flex justify-between"><span>Customer:</span><span className="font-bold uppercase">{successInvoice.client.name}</span></div>
                        <div className="flex justify-between"><span>Mobile:</span><span>{maskPhone(successInvoice.client.phone, user?.role)}</span></div>
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

                        {successInvoice.totals.serviceDiscount > 0 && <div className="flex justify-between text-[10px] italic"><span>Service Discount:</span><span>-₹{successInvoice.totals.serviceDiscount.toFixed(0)}</span></div>}
                        {successInvoice.totals.productDiscount > 0 && <div className="flex justify-between text-[10px] italic"><span>Product Discount:</span><span>-₹{successInvoice.totals.productDiscount.toFixed(0)}</span></div>}
                        {successInvoice.discounts.promotion && <div className="flex justify-between text-[10px] italic"><span>Promo ({successInvoice.discounts.promotion.name}):</span><span>Applied</span></div>}
                        {successInvoice.discounts.voucher && <div className="flex justify-between text-[10px] italic"><span>Voucher ({successInvoice.discounts.voucher.code}):</span><span>Applied</span></div>}

                        {successInvoice.discounts.points > 0 && <div className="flex justify-between text-[10px] italic font-bold text-blue-800"><span>Loyalty Points Used:</span><span>-₹{successInvoice.discounts.points}</span></div>}
                        {successInvoice.discounts.wallet > 0 && <div className="flex justify-between text-[10px] italic font-bold text-emerald-800"><span>Wallet Balance Used:</span><span>-₹{successInvoice.discounts.wallet}</span></div>}

                        <div className="flex justify-between font-bold"><span>Taxable Value:</span><span>{successInvoice.totals.taxable.toFixed(2)}</span></div>
                        {successInvoice.totals.isSameState ? (
                            <>
                                <div className="flex justify-between"><span>CGST ({taxPercent/2}%):</span><span>{successInvoice.totals.cgst.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>SGST ({taxPercent/2}%):</span><span>{successInvoice.totals.sgst.toFixed(2)}</span></div>
                            </>
                        ) : (
                            <div className="flex justify-between"><span>IGST ({taxPercent}%):</span><span>{successInvoice.totals.igst.toFixed(2)}</span></div>
                        )}
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
                        <div className="flex justify-between border-t border-dashed border-black mt-1 pt-1 font-bold">
                            <span>PAID:</span>
                            <span>₹{successInvoice.totals.paidAmount.toFixed(0)}</span>
                        </div>
                        {successInvoice.totals.balanceDue > 0 && (
                            <div className="flex justify-between text-red-600 font-bold">
                                <span>BALANCE DUE:</span>
                                <span>₹{successInvoice.totals.balanceDue.toFixed(0)}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-dashed border-black pt-2 mt-2 text-center">
                        <p className="font-bold uppercase tracking-wider">
                            {successInvoice.totals.balanceDue > 0 ? '* PENDING PAYMENT *' : 'LOYALTY EARNED: ' + successInvoice.loyaltyEarned + ' PTS'}
                        </p>
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

            {/* Main Header with Return Option */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface-alt border-b border-border mb-2">
                <h1 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> POS Terminal
                </h1>
                <div className="flex gap-2">
                   
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
                                className={`w-full pl-10 pr-12 py-3 border bg-background text-text outline-none text-sm font-bold shadow-sm transition-all placeholder:text-text-muted/50 ${isBarcodeMode ? 'border-primary ring-2 ring-primary/20' : 'border-border focus:border-primary'
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
                                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 shadow-2xl flex items-center gap-3 border border-emerald-400"
                                >
                                    <div className="bg-white/20 p-1 rounded-full">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Added to Cart</p>
                                        <p className="text-sm font-black truncate max-w-[200px]">{lastScannedItem.name}</p>
                                    </div>
                                </motion.div>
                            )}

                            {scanError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-rose-500 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-center animate-pulse"
                                >
                                    {scanError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex bg-surface-alt p-1 border border-border">
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('bookings');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'services' && serviceMode === 'bookings' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Completed Bookings</button>
                            <button
                                onClick={() => {
                                    setActiveTab('services');
                                    setServiceMode('orders');
                                    setSelectedCategory('All');
                                }}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${activeTab === 'services' && serviceMode === 'orders' ? 'bg-background text-primary shadow-sm' : 'text-text-secondary'}`}
                            >Completed Orders</button>
                        </div>
                    </div>

               

                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-2 scrollbar-thin">
                        {filteredItems.map(item => {
                            const isSelected = cart.some(c => String(c.id || c._id) === String(item.id || item._id));
                            return (
                                <button
                                    key={item.id || item._id}
                                    onClick={() => addToCart(item)}
                                    className={`relative bg-background border p-4 text-left hover:border-primary transition-all group flex flex-col justify-between h-[120px] shadow-sm hover:shadow-md active:scale-95 ${
                                        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">
                                            In Cart
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start">
                                        <span className={`p-1.5 ${item.type === 'service' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
                                            {activeTab === 'services' ? <Scissors className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                                        </span>
                                        {!isSelected && <span className="text-[10px] font-black text-text-muted group-hover:text-primary transition-colors">ADD</span>}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-extrabold text-text line-clamp-2 uppercase tracking-tight leading-tight">{item.name}</h4>
                                        <p className="text-sm font-black text-primary mt-1">₹{item.price}</p>
                                        {item.barcode && (
                                            <p className="text-[8px] font-mono text-text-muted/60 mt-0.5 truncate">{item.barcode}</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── RIGHT PANEL: Cart & Checkout ─── */}
                <div className={`w-full lg:w-[420px] h-full flex flex-col bg-surface border-0 lg:border border-border shadow-xl overflow-y-auto scrollbar-thin ${mobileView === 'cart' ? 'flex' : 'hidden'} lg:flex`}>

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
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // If it's all numbers, limit to 10
                                        if (/^\d*$/.test(val) && val.length > 10) return;
                                        setSearchClient(val);
                                        setShowClientDropdown(true);
                                    }}
                                    onFocus={() => setShowClientDropdown(true)}
                                />
                                {showClientDropdown && searchClient && (
                                    <div className="absolute top-full left-0 w-full bg-surface border border-border shadow-2xl z-20 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                                            {filteredClients.length > 0 ? filteredClients.map(c => (
                                                <button
                                                    key={c.id || c._id}
                                                    onClick={() => { setSelectedClient(c); setShowClientInfo(true); setShowClientDropdown(false); setSearchClient(''); }}
                                                    className="w-full p-4 text-left hover:bg-surface-alt flex items-center justify-between border-b border-border/50 group transition-all"
                                                >
                                                    <div>
                                                        <p className="text-sm font-black text-text uppercase tracking-tight group-hover:text-primary transition-colors">{c.name}</p>
                                                        <p className="text-[11px] font-bold text-text-muted mt-0.5">{maskPhone(c.phone, user?.role)}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-widest text-text-secondary bg-surface-alt px-3 py-1.5 border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">SELECT</span>
                                                </button>
                                            )) : (
                                                <div className="p-4 text-center text-[10px] font-bold text-text-muted uppercase italic tracking-widest">No matching clients</div>
                                            )}
                                        </div>
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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-text">{selectedClient.name}</p>
                                            {selectedClient.isVIP && (
                                                <span className="px-1.5 py-0.5 bg-slate-900 text-[8px] font-black text-amber-400 uppercase tracking-widest border border-amber-400/20 flex items-center gap-1 shadow-sm">
                                                    <Star className="w-2 h-2 fill-amber-400" /> Premium
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-text-muted font-bold">{maskPhone(selectedClient.phone, user?.role)}</p>
                                    </div>
                                </div>
                                <button onClick={() => resetBill()} className="p-2 text-text-muted hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {selectedClient && (
                            <div className="mt-2 space-y-2 px-1">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-text-muted" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Selected Outlet:</span>
                                    <select 
                                        value={activeOutletId || ''}
                                        onChange={(e) => setActiveOutletId(e.target.value)}
                                        className="bg-transparent text-[10px] font-black uppercase text-primary border-none outline-none cursor-pointer hover:underline"
                                    >
                                        <option value="" disabled>-- Select Outlet --</option>
                                        {outlets.map(o => (
                                            <option key={o._id} value={o._id}>{o.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-text-muted" />
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Billing State / Location:</span>
                                    <select 
                                        value={customerState}
                                        onChange={(e) => setCustomerState(e.target.value)}
                                        className="bg-transparent text-[10px] font-black uppercase text-primary border-none outline-none cursor-pointer hover:underline"
                                    >
                                        {fiscal.state && <option value={fiscal.state}>{fiscal.state} (INTRA)</option>}
                                        <option value="Delhi">Delhi (INTER)</option>
                                        <option value="Maharashtra">Maharashtra (INTER)</option>
                                        <option value="Karnataka">Karnataka (INTER)</option>
                                        <option value="Gujarat">Gujarat (INTER)</option>
                                        <option value="Haryana">Haryana (INTER)</option>
                                    </select>
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
                                             <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[11px] font-bold text-primary">
                                                    {item.isPackageRedemption ? '₹0 (Redeemed)' : `₹${Math.round((item.price * item.quantity) * totals.discountFactor)}`}
                                                </p>
                                                {!item.isPackageRedemption && totals.discountFactor < 1 && (
                                                    <p className="text-[9px] font-bold text-text-muted line-through">
                                                        ₹{item.price * item.quantity}
                                                    </p>
                                                )}
                                                {!item.isPackageRedemption && totals.discountFactor < 1 && (
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                                                        -₹{Math.round((item.price * item.quantity) * (1 - totals.discountFactor))} OFF
                                                    </span>
                                                )}
                                             </div>
                                        </div>
                                        <div className="flex items-center bg-surface-alt">
                                            <button onClick={() => updateQty(idx, -1)} className="p-1 px-2 hover:bg-border text-text-muted"><Minus className="w-3 h-3" /></button>
                                            <span className="px-2 text-xs font-black text-text">{item.quantity}</span>
                                            <button onClick={() => updateQty(idx, 1)} className="p-1 px-2 hover:bg-border text-text-muted"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => removeItem(idx)} className="p-1 text-text-muted hover:text-rose-500"><X className="w-4 h-4" /></button>
                                    </div>
                                    {/* Multi-Staff Row */}
                                    <div className="space-y-1.5">
                                        {(item.staffIds || ['']).map((sid, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-text-muted uppercase shrink-0 w-8">
                                                    {sIdx === 0 ? 'Staff:' : ''}
                                                </span>
                                                <select
                                                    className="flex-1 bg-surface-alt border border-border/60 text-[10px] font-bold px-2 py-1.5 text-text focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
                                                    value={sid || ''}
                                                    onChange={(e) => updateStaff(idx, sIdx, e.target.value)}
                                                >
                                                    <option value="">Select Stylist</option>
                                                    {availableStaff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                                </select>
                                                {(item.staffIds || []).length > 1 && (
                                                    <button
                                                        onClick={() => removeStaff(idx, sIdx)}
                                                        className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all shrink-0"
                                                        title="Remove staff"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addStaff(idx)}
                                            className="flex items-center gap-1.5 text-[10px] font-black text-primary border border-primary/30 bg-primary/5 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-all ml-0 mt-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Another Staff
                                        </button>
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
                            ))
                        )}
                    </div>

                    <div className="p-4 bg-surface-alt border-t border-border space-y-4">
                        <div className="space-y-1.5 border-b border-border pb-3">
                            {/* Membership Breakdown (if applicable) */}
                            {totals.membershipDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Membership Discount</span>
                                    <span className="text-sm font-black">-₹{totals.membershipDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            {totals.discount > 0 && (
                                <div className="flex justify-between items-center text-emerald-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Offers / Manual Discount</span>
                                    <span className="text-sm font-black">-₹{totals.discount.toLocaleString()}</span>
                                </div>
                            )}
                            {totals.redeemPoints > 0 && (
                                <div className="flex justify-between items-center text-blue-500">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Loyalty Points</span>
                                    <span className="text-sm font-black">-₹{totals.redeemPoints.toLocaleString()}</span>
                                </div>
                            )}
                            {totals.redeemWallet > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Wallet Used</span>
                                    <span className="text-sm font-black">-₹{totals.redeemWallet.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Summary Totals */}
                            <div className="border-t border-border/30 pt-2 mt-2 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                                    <span>Subtotal (Net)</span>
                                    <span>₹{totals.subtotal.toFixed(0)}</span>
                                </div>

                                {(totals.discount > 0 || totals.redeemPoints > 0 || totals.redeemWallet > 0) && (
                                    <div className="flex justify-between text-[10px] font-bold text-emerald-600 uppercase">
                                        <span>Total Offers / Redemptions</span>
                                        <span>-₹{(totals.discount + totals.redeemPoints + totals.redeemWallet).toFixed(0)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-xs font-black text-text border-y border-border/10 py-1 my-1">
                                    <span>TAXABLE AMOUNT</span>
                                    <span>₹{totals.taxable.toFixed(0)}</span>
                                </div>

                                <div className="flex justify-between text-xs font-bold text-text-secondary">
                                    <span>GST ({taxPercent}%)</span>
                                    <span>₹{totals.tax.toFixed(0)}</span>
                                </div>
                            </div>
                            
                            {includePreviousDue && (
                                <div className="flex justify-between text-xs font-bold text-rose-500">
                                    <span>PREVIOUS DUE</span>
                                    <span>₹{totals.previousDue.toFixed(0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black text-text uppercase tracking-widest">Grand Total</h4>
                            <span className="text-2xl font-black text-primary tracking-tight">₹{totals.total.toFixed(0)}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Payment Split</label>
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
                                                value={Number(p.amount).toFixed(2)}
                                                onChange={(e) => updatePayment(i, 'amount', Number(e.target.value))}
                                                className="w-24 text-right bg-transparent border-none text-xs font-black p-1 text-text outline-none focus:ring-0"
                                            />
                                            {payments.length > 1 && (
                                                <button onClick={() => removePayment(i)} className="p-1 text-rose-500 hover:bg-rose-50"><X className="w-3 h-3" /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {payments.reduce((s, p) => s + p.amount, 0) < totals.total && (
                                    <p className="text-[9px] font-bold text-amber-500 italic flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Remaining: ₹{totals.total - payments.reduce((s, p) => s + p.amount, 0)} (will be marked as Pending)
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between py-2 border-y border-border/50">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Payment Date:</span>
                                </div>
                                <input
                                    type="date"
                                    className="bg-transparent text-[11px] font-black text-text outline-none focus:text-primary"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button 
                                    onClick={() => setShowDiscountModal(true)} 
                                    className="py-2.5 bg-background border border-border font-black text-[10px] text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-alt active:scale-95 transition-all relative"
                                >
                                    <Percent className="w-3.5 h-3.5" /> 
                                    OFFERS 
                                    {(appliedPromotion || appliedVoucher || manualDiscount.value > 0 || redeemPoints > 0 || redeemWallet > 0) && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                    )}
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0 || checkingOut}
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
                        <div className="flex bg-surface-alt p-4 items-center justify-between border-b border-border">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text">Applied Offers & Adjustments</h3>
                            <button onClick={() => setShowDiscountModal(false)} className="text-text-muted hover:text-rose-500"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto scrollbar-thin">
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
                                            value={manualDiscount.value || ''}
                                            onChange={(e) => setManualDiscount({ ...manualDiscount, value: Number(e.target.value) })}
                                            onFocus={(e) => { if(manualDiscount.value === 0) setManualDiscount({...manualDiscount, value: ''}) }}
                                            onBlur={(e) => { if(manualDiscount.value === '') setManualDiscount({...manualDiscount, value: 0}) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-surface-alt border-t border-border flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-[9px] font-black text-text-muted uppercase">Total Reductions</p>
                                <p className="text-xl font-black text-primary">₹{(Number(totals.discount) + Number(redeemPoints || 0) + Number(redeemWallet || 0)).toFixed(0)}</p>
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
                                    className="w-full p-3 bg-background border border-border text-sm font-bold text-text outline-none focus:border-primary uppercase tracking-tighter"
                                    value={newClientForm.name}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number *</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full p-3 bg-background border border-border text-sm font-bold text-text outline-none focus:border-primary"
                                    value={newClientForm.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setNewClientForm({ ...newClientForm, phone: val });
                                    }}
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
