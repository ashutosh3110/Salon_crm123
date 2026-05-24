import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FileText,
    Calendar,
    Clock,
    Search,
    Filter,
    Download,
    ArrowRight,
    RefreshCw,
    Loader2,
    AlertCircle,
    Plus,
    Trash2,
    Truck,
    X,
    IndianRupee,
    Receipt,
    TrendingDown,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useBusiness } from '../../../contexts/BusinessContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function pickResults(res) {
    const d = res?.data?.data ?? res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    return [];
}

export default function SupplierInvoices() {
    const navigate = useNavigate();
    const { suppliers = [], fetchSuppliers, platformSettings } = useBusiness();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [payingKey, setPayingKey] = useState(null);
    const [payCashAmount, setPayCashAmount] = useState('0');
    const [payOnlineAmount, setPayOnlineAmount] = useState('0');
    const [payNote, setPayNote] = useState('');

    // WhatsApp flag for recording payment in existing invoices
    const [paySendWhatsApp, setPaySendWhatsApp] = useState(false);

    // Direct Invoice Creation Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [invoiceForm, setInvoiceForm] = useState({
        supplierId: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
        items: [{ name: '', price: '', quantity: '1', tax: '0', isInclusive: false }],
        discount: '0',
        cashAmount: '0',
        onlineAmount: '0',
        notes: '',
        sendWhatsApp: false
    });

    const resetInvoiceForm = () => {
        setInvoiceForm({
            supplierId: '',
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().slice(0, 10),
            dueDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
            items: [{ name: '', price: '', quantity: '1', tax: '0', isInclusive: false }],
            discount: '0',
            cashAmount: '0',
            onlineAmount: '0',
            notes: '',
            sendWhatsApp: false
        });
        setShowCreateModal(false);
    };

    // GST prefill removed

    const gstRates = useMemo(() => {
        const rates = [0, 5, 12, 18, 28];
        const platformRate = Number(platformSettings?.supplierGst);
        if (platformRate !== undefined && platformRate !== null && !isNaN(platformRate) && !rates.includes(platformRate)) {
            rates.push(platformRate);
        }
        return rates.sort((a, b) => a - b);
    }, [platformSettings]);

    const handleAddItem = () => {
        setInvoiceForm(prev => ({
            ...prev,
            items: [...prev.items, { name: '', price: '', quantity: '1', tax: '0', isInclusive: false }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (invoiceForm.items.length <= 1) {
            window.alert("An invoice must contain at least one item.");
            return;
        }
        setInvoiceForm(prev => ({
            ...prev,
            items: prev.items.filter((_, idx) => idx !== index)
        }));
    };

    const handleUpdateItem = (index, key, value) => {
        setInvoiceForm(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [key]: value };
            return { ...prev, items: updatedItems };
        });
    };

    useEffect(() => {
        if (fetchSuppliers) {
            fetchSuppliers();
        }
    }, [fetchSuppliers]);

    // Live calculation of totals for direct invoice creation
    const totals = useMemo(() => {
        let subTotal = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        const computedItems = (invoiceForm.items || []).map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.price) || 0;
            const taxRate = parseFloat(item.tax) || 0;
            
            let itemTax = 0;
            let itemTotal = 0;
            let basePrice = 0;

            if (item.isInclusive) {
                itemTotal = rate * qty;
                itemTax = itemTotal - (itemTotal / (1 + taxRate / 100));
                basePrice = itemTotal - itemTax;
            } else {
                const rawSub = rate * qty;
                itemTax = rawSub * (taxRate / 100);
                itemTotal = rawSub + itemTax;
                basePrice = rawSub;
            }

            subTotal += basePrice;
            taxAmount += itemTax;
            totalAmount += itemTotal;

            return {
                name: item.name,
                quantity: qty,
                unit: 'pcs',
                price: rate,
                tax: taxRate,
                amount: itemTotal
            };
        });

        const disc = parseFloat(invoiceForm.discount) || 0;
        const finalTotal = Math.max(0, totalAmount - disc);
        const paid = (parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0);
        
        // Lookup supplier outstanding
        const selectedSupplier = suppliers.find(s => String(s._id || s.id) === String(invoiceForm.supplierId));
        const prevOutstanding = Math.abs(Number(selectedSupplier?.currentBalance || 0));

        // Excess payment above invoice amount
        const excessPayment = Math.max(0, paid - finalTotal);
        
        // Calculate balance for THIS invoice
        const balance = Math.max(0, finalTotal - paid);

        // Adjust previous outstanding by excess payment
        const newPrevOutstanding = Math.max(0, prevOutstanding - excessPayment);
        
        // Overpaid amount (exceeds invoice total + previous outstanding)
        const overpaidAmount = Math.max(0, excessPayment - prevOutstanding);

        // Total dues remaining
        const totalDues = balance + newPrevOutstanding;

        return {
            items: computedItems,
            subTotal: Math.round(subTotal * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            totalAmount: Math.round(finalTotal * 100) / 100,
            balanceAmount: Math.round(balance * 100) / 100,
            prevOutstanding,
            newPrevOutstanding,
            overpaidAmount: Math.round(overpaidAmount * 100) / 100,
            totalDues: Math.round(totalDues * 100) / 100
        };
    }, [invoiceForm, suppliers]);

    const handleCreateInvoice = async () => {
        if (!invoiceForm.supplierId) {
            window.alert('Please select a supplier.');
            return;
        }
        if (!invoiceForm.invoiceNumber) {
            window.alert('Please enter an invoice number.');
            return;
        }
        if (invoiceForm.items.some(item => !item.name || !item.price || !item.quantity)) {
            window.alert('Please complete all item details (Name, Price, Quantity).');
            return;
        }

        const cashAmt = parseFloat(invoiceForm.cashAmount) || 0;
        const onlineAmt = parseFloat(invoiceForm.onlineAmount) || 0;
        const totalPaid = cashAmt + onlineAmt;

        if (totalPaid > totals.totalAmount) {
            window.alert('Total paid amount cannot exceed invoice amount.');
            return;
        }

        try {
            // First payment logic for posting invoice
            let initialPaid = 0;
            let initialMethod = 'online';
            if (cashAmt > 0) {
                initialPaid = cashAmt;
                initialMethod = 'cash';
            } else if (onlineAmt > 0) {
                initialPaid = onlineAmt;
                initialMethod = 'online';
            }

            const payload = {
                supplierId: invoiceForm.supplierId,
                invoiceNumber: invoiceForm.invoiceNumber,
                invoiceDate: invoiceForm.invoiceDate,
                dueDate: invoiceForm.dueDate,
                items: totals.items,
                subTotal: totals.subTotal,
                taxAmount: totals.taxAmount,
                discount: parseFloat(invoiceForm.discount) || 0,
                totalAmount: totals.totalAmount,
                paidAmount: initialPaid,
                balanceAmount: totals.totalAmount - initialPaid,
                status: (totals.totalAmount - initialPaid) <= 0 ? 'paid' : initialPaid > 0 ? 'partially-paid' : 'unpaid',
                notes: invoiceForm.notes,
                paymentMethod: initialMethod,
                sendWhatsApp: invoiceForm.sendWhatsApp && (cashAmt === 0 || onlineAmt === 0),
                supplierName: suppliers.find(s => String(s._id || s.id) === String(invoiceForm.supplierId))?.name || 'Supplier'
            };

            const response = await api.post('/finance/invoices', payload);
            const createdInvoice = response.data?.data || response.data;
            const invoiceId = createdInvoice._id || createdInvoice.id;

            // If there's a second payment method (split payment), record the second payment now
            if (cashAmt > 0 && onlineAmt > 0 && invoiceId) {
                await api.post('/finance/invoices/payments', {
                    invoiceId: invoiceId,
                    amount: onlineAmt,
                    paymentMethod: 'online',
                    notes: 'Split payment - Online portion',
                    sendWhatsApp: invoiceForm.sendWhatsApp
                });
            }

            resetInvoiceForm();
            await load();
        } catch (e) {
            window.alert(e?.response?.data?.message || e.message || 'Failed to create invoice');
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/finance/invoices');
            const rawRows = pickResults(res);
            const formattedRows = rawRows.map(r => ({
                ...r,
                supplierName: r.supplierId?.name || 'Unknown Supplier',
                invoiceNo: r.invoiceNumber || '—',
                amount: r.totalAmount || 0,
                outstanding: r.balanceAmount != null ? r.balanceAmount : (r.totalAmount - (r.paidAmount || 0)),
                status: r.status === 'paid' ? 'Paid' : r.status === 'partially-paid' ? 'Partial' : r.status === 'unpaid' ? 'Pending' : 'Cancelled',
                invoiceKey: r._id || r.id
            }));
            setRows(formattedRows);
        } catch (e) {
            const msg =
                e?.networkHint ||
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                (e?.response?.status === 403 && e?.response?.data?.errorCode === 'ONBOARDING_REQUIRED'
                    ? 'Complete onboarding first, or ensure your account has a salon (tenant) assigned.'
                    : null) ||
                e.message ||
                'Failed to load supplier invoices';
            setError(msg);
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let list = rows;
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (r) =>
                    String(r.supplierName || '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.invoiceNo || '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.invoiceRef || '')
                        .toLowerCase()
                        .includes(q)
            );
        }
        if (statusFilter !== 'All') {
            list = list.filter((r) => r.status === statusFilter);
        }
        return list;
    }, [rows, search, statusFilter]);

    const statusOptions = ['All', 'Pending', 'Partial', 'Paid', 'Overdue'];

    // Summary stats for the top cards
    const summaryStats = useMemo(() => {
        const totalInvoices = rows.length;
        const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const totalPaid = rows.reduce((sum, r) => sum + Number(r.paidAmount || 0), 0);
        const totalDue = rows.reduce((sum, r) => sum + Number(r.outstanding || 0), 0);
        const pendingCount = rows.filter(r => r.status === 'Pending' || r.status === 'Partial').length;
        return { totalInvoices, totalAmount, totalPaid, totalDue, pendingCount };
    }, [rows]);

    // Currently selected invoice for the payment modal
    const payingInvoice = useMemo(() => {
        if (!payingKey) return null;
        return rows.find(r => r.invoiceKey === payingKey) || null;
    }, [payingKey, rows]);

    const openPay = (inv) => {
        if (inv.status === 'Paid' || inv.outstanding <= 0) {
            window.alert('This invoice is already fully paid.');
            return;
        }
        setPayingKey(inv._id || inv.id);
        const outstandingAmt = Math.max(0, Number(inv.balanceAmount || inv.outstanding) || 0);
        setPayOnlineAmount(String(outstandingAmt));
        setPayCashAmount('0');
        setPayNote('');
        setPaySendWhatsApp(false);
    };

    const submitPayment = async () => {
        const cashAmt = parseFloat(payCashAmount) || 0;
        const onlineAmt = parseFloat(payOnlineAmount) || 0;
        const totalAmt = cashAmt + onlineAmt;

        if (!payingKey || totalAmt <= 0) {
            window.alert('Enter a valid payment amount.');
            return;
        }

        const outstandingAmt = Math.max(0, Number(payingInvoice.outstanding || 0));
        if (totalAmt > outstandingAmt) {
            window.alert('Payment amount cannot exceed the outstanding due.');
            return;
        }

        try {
            // First payment
            let firstAmt = 0;
            let firstMethod = 'online';
            if (cashAmt > 0) {
                firstAmt = cashAmt;
                firstMethod = 'cash';
            } else if (onlineAmt > 0) {
                firstAmt = onlineAmt;
                firstMethod = 'online';
            }

            await api.post('/finance/invoices/payments', {
                invoiceId: payingKey,
                amount: firstAmt,
                paymentMethod: firstMethod,
                notes: payNote?.trim() || undefined,
                sendWhatsApp: paySendWhatsApp && (cashAmt === 0 || onlineAmt === 0)
            });

            // Second payment (if split)
            if (cashAmt > 0 && onlineAmt > 0) {
                await api.post('/finance/invoices/payments', {
                    invoiceId: payingKey,
                    amount: onlineAmt,
                    paymentMethod: 'online',
                    notes: (payNote?.trim() ? payNote.trim() + ' - ' : '') + 'Online portion',
                    sendWhatsApp: paySendWhatsApp
                });
            }

            setPayingKey(null);
            setPaySendWhatsApp(false);
            await load();
        } catch (e) {
            window.alert(e?.response?.data?.message || e.message || 'Payment failed');
        }
    };

    const sendWhatsAppInvoice = async (inv) => {
        try {
            const res = await api.post(`/finance/invoices/${inv.invoiceKey}/send-whatsapp`);
            if (res.data?.success || res.status === 200) {
                window.alert('WhatsApp message sent successfully via Cloud API!');
            }
        } catch (e) {
            window.alert(e?.response?.data?.message || e.message || 'Failed to send WhatsApp message');
        }
    };

    const downloadInvoicePDF = async (inv) => {
        let payments = [];
        try {
            const res = await api.get(`/finance/invoices/${inv.invoiceKey}/payments`);
            payments = res.data?.data || [];
        } catch (err) {
            console.error("Failed to fetch payments for invoice PDF:", err);
        }

        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Title / Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("SUPPLIER PURCHASE INVOICE", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${timestamp}`, 14, 28);

        // Divider line
        doc.setDrawColor(220);
        doc.line(14, 32, 196, 32);

        // Invoice Meta info
        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.setFont("helvetica", "bold");
        doc.text("Supplier Details:", 14, 42);
        doc.setFont("helvetica", "normal");
        doc.text(inv.supplierName || 'Unknown Supplier', 14, 48);
        
        // Find supplier phone if available
        const supplierObj = suppliers.find(s => String(s._id || s.id) === String(inv.supplierId?._id || inv.supplierId));
        if (supplierObj?.phone) {
            doc.text(`Phone: ${supplierObj.phone}`, 14, 53);
        }
        if (supplierObj?.email) {
            doc.text(`Email: ${supplierObj.email}`, 14, 58);
        }

        doc.setFont("helvetica", "bold");
        doc.text("Invoice Info:", 130, 42);
        doc.setFont("helvetica", "normal");
        doc.text(`Invoice No: ${inv.invoiceNo}`, 130, 48);
        doc.text(`Date: ${inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '—'}`, 130, 53);
        doc.text(`Due Date: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}`, 130, 58);
        doc.text(`Status: ${inv.status}`, 130, 63);

        // Items table
        const tableData = (inv.items || []).map((item, index) => {
            const qty = item.quantity || 1;
            const price = item.price || 0;
            const amount = item.amount || (price * qty);

            return [
                index + 1,
                item.name || 'Item Description',
                qty,
                `Rs. ${Number(price).toFixed(2)}`,
                `Rs. ${Number(amount).toFixed(2)}`
            ];
        });

        autoTable(doc, {
            startY: 72,
            head: [['#', 'Item Name', 'Qty', 'Unit Price', 'Total']],
            body: tableData.length > 0 ? tableData : [['1', 'Invoice Items Summary', '1', `Rs. ${Number(inv.amount).toFixed(2)}`, `Rs. ${Number(inv.amount).toFixed(2)}`]],
            styles: { fontSize: 9, font: "helvetica" },
            headStyles: { fillColor: [51, 51, 51] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        let lastY = doc.lastAutoTable.finalY;

        // Render Payments Table if any exist
        if (payments && payments.length > 0) {
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(40);
            doc.text("Payment Ledger / History:", 14, lastY + 10);

            const paymentTableRows = payments.map((p, index) => {
                const dateStr = p.date ? new Date(p.date).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString();
                const methodStr = p.paymentMethod === 'cash' ? 'Cash' : p.paymentMethod === 'online' ? 'Online' : 'Bank Transfer';
                const notesStr = p.description || 'Payment recorded';
                return [
                    index + 1,
                    dateStr,
                    methodStr,
                    notesStr,
                    `Rs. ${Number(p.amount).toFixed(2)}`
                ];
            });

            autoTable(doc, {
                startY: lastY + 14,
                head: [['#', 'Payment Date', 'Payment Method', 'Note / Reference', 'Amount Paid']],
                body: paymentTableRows,
                styles: { fontSize: 8, font: "helvetica" },
                headStyles: { fillColor: [80, 80, 80] },
                alternateRowStyles: { fillColor: [248, 248, 248] },
            });

            lastY = doc.lastAutoTable.finalY;
        }

        // Summary Section
        const finalY = lastY + 10;
        doc.setFontSize(10);
        doc.setTextColor(60);
        
        let currentY = finalY + 6;
        const drawSummaryLine = (label, val, isBold = false) => {
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.text(label, 120, currentY);
            doc.text(val, 196, currentY, { align: 'right' });
            currentY += 5;
        };

        const subTotalVal = inv.subTotal || (inv.amount - (inv.taxAmount || 0));
        drawSummaryLine("Subtotal (Base Value):", `Rs. ${Number(subTotalVal).toFixed(2)}`);
        
        // Total Tax (GST) line removed
        if (inv.discount > 0) {
            drawSummaryLine("Discount:", `- Rs. ${Number(inv.discount).toFixed(2)}`);
        }

        // Draw a separator line
        doc.setDrawColor(200);
        doc.line(120, currentY, 196, currentY);
        currentY += 4;

        drawSummaryLine("Total Invoice Amount:", `Rs. ${Number(inv.amount).toFixed(2)}`, true);
        drawSummaryLine("Paid Amount:", `Rs. ${Number(inv.paidAmount).toFixed(2)}`, true);
        
        // Highlight outstanding due in red if > 0, otherwise green
        if (inv.outstanding > 0) {
            doc.setTextColor(220, 50, 50); // Red
        } else {
            doc.setTextColor(40, 160, 80); // Green
        }
        drawSummaryLine("Outstanding Due:", `Rs. ${Number(inv.outstanding).toFixed(2)}`, true);
        doc.setTextColor(40); // Reset color

        if (inv.notes) {
            doc.setTextColor(100);
            doc.setFont("helvetica", "bold");
            doc.text("Notes:", 14, finalY);
            doc.setFont("helvetica", "normal");
            doc.text(inv.notes, 14, finalY + 6, { maxWidth: 100 });
        }

        doc.save(`Invoice_${inv.invoiceNo}.pdf`);
    };

    const exportCsv = () => {
        const header = [
            'Supplier',
            'Invoice',
            'Billing date',
            'Due date',
            'Amount',
            'Paid',
            'Outstanding',
            'Status',
        ];
        const lines = [
            header.join(','),
            ...filtered.map((r) =>
                [
                    `"${String(r.supplierName).replace(/"/g, '""')}"`,
                    `"${String(r.invoiceNo).replace(/"/g, '""')}"`,
                    r.invoiceDate,
                    r.dueDate,
                    r.amount,
                    r.paidAmount,
                    r.outstanding,
                    r.status,
                ].join(',')
            ),
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `supplier-invoices-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* ─── Summary Cards ─── */}
            <div className="p-6 pb-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                        <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Invoices</p>
                        <p className="text-xl font-black text-text">{summaryStats.totalInvoices}</p>
                        {summaryStats.pendingCount > 0 && (
                            <p className="text-[10px] font-bold text-amber-600">{summaryStats.pendingCount} unpaid</p>
                        )}
                    </div>
                </div>
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Amount</p>
                        <p className="text-xl font-black text-text">₹{summaryStats.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Paid</p>
                        <p className="text-xl font-black text-emerald-600">₹{summaryStats.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Due</p>
                        <p className="text-xl font-black text-rose-600">₹{summaryStats.totalDue.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto flex-wrap">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by invoice # or supplier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary">
                            <Filter className="w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none font-bold"
                            >
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={load}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            Refresh
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={exportCsv}
                        disabled={!filtered.length}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all scale-active disabled:opacity-40"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active"
                    >
                        <Plus className="w-4 h-4" />
                        Record Invoice
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-6 py-3 bg-rose-500/10 text-rose-700 text-sm font-bold border-b border-rose-500/20">
                    {error}
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar bg-white p-0 table-responsive relative">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                )}
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface/50 border-b border-border">
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Supplier & Invoice
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Billing Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                Invoice Amount
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Due Date
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                Settlement
                            </th>
                            <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-8 py-16 text-center text-sm text-text-muted font-bold">
                                    No supplier invoices yet. Record stock-in with an invoice # under Inventory → Stock In.
                                </td>
                            </tr>
                        )}
                        {filtered.map((inv) => (
                            <tr key={inv.invoiceKey} className="hover:bg-surface/30 transition-colors group cursor-default">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                inv.status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-surface text-text-muted'
                                            }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-text text-sm group-hover:text-primary transition-colors truncate">
                                                {inv.supplierName}
                                            </span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5 truncate">
                                                # {inv.invoiceNo}
                                            </span>
                                            {inv.isAdHoc && (
                                                <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                                                    Add invoice # on future stock-ins to group lines
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs font-semibold text-text-secondary">
                                        {inv.invoiceDate
                                            ? new Date(inv.invoiceDate).toLocaleDateString()
                                            : '—'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-sm font-bold text-text tracking-tight">
                                        ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                                    </span>
                                    {inv.paidAmount > 0 && (
                                        <p className="text-[10px] text-text-muted mt-0.5">
                                            Paid ₹{Number(inv.paidAmount).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Clock
                                            className={`w-3.5 h-3.5 ${
                                                inv.status === 'Overdue' ? 'text-rose-500' : 'text-text-muted'
                                            }`}
                                        />
                                        <span
                                            className={`text-xs font-semibold ${
                                                inv.status === 'Overdue' ? 'text-rose-600' : 'text-text-secondary'
                                            }`}
                                        >
                                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                                            inv.status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : inv.status === 'Overdue'
                                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                  : inv.status === 'Partial'
                                                    ? 'bg-sky-50 text-sky-600 border-sky-100'
                                                    : 'bg-orange-50 text-orange-500 border-orange-100'
                                        }`}
                                    >
                                        {inv.status}
                                    </span>
                                    {inv.outstanding > 0 && inv.status !== 'Paid' && (
                                        <p className="text-[10px] text-text-muted mt-1 font-bold">
                                            Due ₹{Number(inv.outstanding).toLocaleString('en-IN')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {/* Send via WhatsApp */}
                                        <button
                                            type="button"
                                            onClick={() => sendWhatsAppInvoice(inv)}
                                            className="p-2 bg-white border border-border rounded-xl text-text-muted hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                                            title="Send via WhatsApp"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>

                                        {/* Download Invoice PDF */}
                                        <button
                                            type="button"
                                            onClick={() => downloadInvoicePDF(inv)}
                                            className="p-2 bg-white border border-border rounded-xl text-text-muted hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                            title="Download PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {payingKey && payingInvoice && (() => {
                const outstandingAmt = Math.max(0, Number(payingInvoice.outstanding || 0));
                const cashAmt = parseFloat(payCashAmount) || 0;
                const onlineAmt = parseFloat(payOnlineAmount) || 0;
                const currentPayAmt = cashAmt + onlineAmt;
                const remainingAfterPay = Math.max(0, outstandingAmt - currentPayAmt);

                return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white border border-border w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border bg-surface/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-text">Record Supplier Payment</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                                    Invoice #{payingInvoice.invoiceNo} • {payingInvoice.supplierName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setPayingKey(null); setPaySendWhatsApp(false); }}
                                className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Due Amount Display */}
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Total Due Amount</p>
                                    <p className="text-2xl font-black text-rose-600">₹{outstandingAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Invoice Total</p>
                                    <p className="text-sm font-bold text-text">₹{Number(payingInvoice.amount || 0).toLocaleString('en-IN')}</p>
                                    <p className="text-[10px] text-text-muted">Paid: ₹{Number(payingInvoice.paidAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Payments Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-text uppercase tracking-wider border-b border-border pb-1.5">Payments</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Cash Payment (₹)</label>
                                        <input
                                            type="text"
                                            value={payCashAmount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    setPayCashAmount(val);
                                                }
                                            }}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Online Payment (₹)</label>
                                        <input
                                            type="text"
                                            value={payOnlineAmount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    setPayOnlineAmount(val);
                                                }
                                            }}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remaining Balance After Payment / Overpaid Warning */}
                            {currentPayAmt > 0 && (
                                <div className={`rounded-xl p-3 border text-xs font-bold ${
                                    currentPayAmt > outstandingAmt
                                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                                        : remainingAfterPay > 0
                                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                    {currentPayAmt > outstandingAmt ? (
                                        <span>⚠️ Overpaid by <strong>₹{(currentPayAmt - outstandingAmt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>! Payment cannot exceed the outstanding due.</span>
                                    ) : remainingAfterPay > 0 ? (
                                        <span>⚠️ After this payment, remaining due will be <strong>₹{remainingAfterPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
                                    ) : (
                                        <span>✅ This payment will settle the invoice in full!</span>
                                    )}
                                </div>
                            )}

                            {/* Note and WhatsApp toggle */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Note (optional)</label>
                                    <input
                                        type="text"
                                        value={payNote}
                                        onChange={(e) => setPayNote(e.target.value)}
                                        placeholder="Payment note..."
                                        className="w-full px-4 py-2.5 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between py-2 bg-surface/30 rounded-xl px-4 border border-border/50">
                                    <span className="text-xs font-bold text-text-secondary">Send WhatsApp receipt to supplier</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={paySendWhatsApp}
                                        onClick={() => setPaySendWhatsApp(prev => !prev)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                            paySendWhatsApp 
                                                ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600' 
                                                : 'bg-slate-300 border-slate-400 hover:bg-slate-400/80 dark:bg-slate-800 dark:border-slate-600'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                paySendWhatsApp ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-surface/30">
                            <p className="text-[10px] font-bold text-text-muted">
                                {currentPayAmt === 0 ? '⚡ Record Payment' : remainingAfterPay > 0 ? '⚡ Partial Payment' : '💰 Full Settlement'}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPayingKey(null);
                                        setPaySendWhatsApp(false);
                                    }}
                                    className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:bg-surface hover:text-text transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitPayment}
                                    disabled={currentPayAmt <= 0 || currentPayAmt > outstandingAmt}
                                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                );
            })()}

            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white border border-border w-full max-w-5xl shadow-2xl rounded-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/30">
                            <div>
                                <h3 className="text-lg font-black text-text">Record New Supplier Invoice</h3>
                                <p className="text-xs text-text-muted font-bold uppercase mt-0.5">Create ad-hoc purchase bill & dynamic GST calculations</p>
                            </div>
                            <button
                                type="button"
                                onClick={resetInvoiceForm}
                                className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            {/* Part 1: Invoice metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase">Select Supplier <span className="text-rose-500">*</span></label>
                                    <select
                                        value={invoiceForm.supplierId}
                                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, supplierId: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    >
                                        <option value="">-- Select a Supplier --</option>
                                        {suppliers.map(s => (
                                            <option key={s._id || s.id} value={s._id || s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    {invoiceForm.supplierId && (
                                        <div className="mt-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                            Current Outstanding: ₹
                                            {Number(
                                                Math.abs(suppliers.find(s => String(s._id || s.id) === String(invoiceForm.supplierId))?.currentBalance || 0)
                                            ).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase">Invoice Number <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. GST-1024"
                                        value={invoiceForm.invoiceNumber}
                                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                        className="w-full px-4 py-2 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase">Invoice Date</label>
                                    <input
                                        type="date"
                                        value={invoiceForm.invoiceDate}
                                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                        className="w-full px-4 py-2 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-muted uppercase">Due Date</label>
                                    <input
                                        type="date"
                                        value={invoiceForm.dueDate}
                                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="w-full px-4 py-2 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Part 2: Invoice Items */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-text uppercase tracking-wider">Purchase Item Lines</h4>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Line
                                    </button>
                                </div>

                                <div className="border border-border rounded-xl overflow-hidden table-responsive">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-surface/50 border-b border-border">
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Item Name / Desc *</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-44">Rate (₹) *</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-36">Qty *</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-32 text-right">Row Total</th>
                                                <th className="px-4 py-2.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider w-16 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {invoiceForm.items.map((item, index) => {
                                                const qty = parseFloat(item.quantity) || 0;
                                                const rate = parseFloat(item.price) || 0;
                                                const taxRate = parseFloat(item.tax) || 0;
                                                const rowTotal = item.isInclusive 
                                                    ? (rate * qty) 
                                                    : (rate * qty * (1 + taxRate / 100));

                                                return (
                                                    <tr key={index} className="hover:bg-surface/20 transition-colors">
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter product or service name"
                                                                value={item.name}
                                                                onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                placeholder="0.00"
                                                                value={item.price}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                                        handleUpdateItem(index, 'price', val);
                                                                    }
                                                                }}
                                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                placeholder="1"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val === '' || /^\d*$/.test(val)) {
                                                                        handleUpdateItem(index, 'quantity', val);
                                                                    }
                                                                }}
                                                                className="w-full px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right">
                                                            <span className="text-xs font-black text-text">
                                                                ₹{rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="p-1 hover:bg-rose-50 text-text-muted hover:text-rose-600 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Part 3: Lower grid (Notes & Payment vs Summary card) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-text-muted uppercase">Notes & Special Instructions</label>
                                        <textarea
                                            rows="2"
                                            placeholder="Write internal procurement comments, stock-in references..."
                                            value={invoiceForm.notes}
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Payments Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-text uppercase tracking-wider border-b border-border pb-1.5">Payments</h4>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Cash Payment (₹)</label>
                                                <input
                                                    type="text"
                                                    value={invoiceForm.cashAmount}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                            setInvoiceForm(prev => ({ ...prev, cashAmount: val }));
                                                        }
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                                />
                                            </div>
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Online Payment (₹)</label>
                                                <input
                                                    type="text"
                                                    value={invoiceForm.onlineAmount}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                            setInvoiceForm(prev => ({ ...prev, onlineAmount: val }));
                                                        }
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* WhatsApp Toggle Switch */}
                                        <div className="flex items-center justify-between py-2 bg-surface/30 rounded-xl px-4 border border-border/50">
                                            <span className="text-xs font-bold text-text-secondary">Send via WhatsApp</span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={invoiceForm.sendWhatsApp}
                                                onClick={() => setInvoiceForm(prev => ({ ...prev, sendWhatsApp: !prev.sendWhatsApp }))}
                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                                    invoiceForm.sendWhatsApp 
                                                        ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600' 
                                                        : 'bg-slate-300 border-slate-400 hover:bg-slate-400/80 dark:bg-slate-800 dark:border-slate-600'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                        invoiceForm.sendWhatsApp ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface/50 border border-border rounded-2xl p-5 space-y-3.5">
                                    <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider border-b border-border pb-2">Purchase Financial Summary</h4>
                                    
                                    <div className="flex justify-between text-xs text-text-secondary font-semibold">
                                        <span>Total Amount:</span>
                                        <span>₹{totals.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs text-text-secondary font-semibold">
                                        <span>Apply Discount (₹):</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={invoiceForm.discount}
                                            onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: e.target.value }))}
                                            className="w-28 px-2.5 py-1 text-right border border-border rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-semibold border-t border-border/80 pt-3">
                                        <span className="font-bold text-text">Total Invoice Amount:</span>
                                        <span className="font-extrabold text-sm text-text">₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span className="font-bold text-emerald-600">Paid Amount:</span>
                                        <span className="font-black text-emerald-600">₹{((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    {/* Due Amount - This Invoice */}
                                    <div className={`rounded-xl p-3 border-2 ${
                                        totals.balanceAmount > 0
                                            ? 'bg-rose-50 border-rose-200'
                                            : ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) > 0
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-black uppercase tracking-wider ${
                                                totals.balanceAmount > 0 ? 'text-rose-600' : ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) > 0 ? 'text-emerald-600' : 'text-slate-500'
                                            }`}>
                                                {totals.balanceAmount > 0 ? '⚠️ Due Amount:' : ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) > 0 ? '✅ Fully Paid' : '📋 Credit (Unpaid):'}
                                            </span>
                                            <span className={`text-lg font-black ${
                                                totals.balanceAmount > 0 ? 'text-rose-600' : ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) > 0 ? 'text-emerald-600' : 'text-slate-600'
                                            }`}>
                                                ₹{totals.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        {totals.balanceAmount > 0 && ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) > 0 && (
                                            <p className="text-[10px] font-bold text-amber-600 mt-1">
                                                ⚡ Partial payment — ₹{((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)).toLocaleString('en-IN')} paid now, ₹{totals.balanceAmount.toLocaleString('en-IN')} will be supplier debt
                                            </p>
                                        )}
                                        {totals.balanceAmount > 0 && ((parseFloat(invoiceForm.cashAmount) || 0) + (parseFloat(invoiceForm.onlineAmount) || 0)) <= 0 && (
                                            <p className="text-[10px] font-bold text-slate-500 mt-1">
                                                Full amount will be recorded as supplier outstanding
                                            </p>
                                        )}
                                    </div>

                                    {/* Previous Outstanding + Total Supplier Dues */}
                                    {invoiceForm.supplierId && totals.prevOutstanding > 0 && (
                                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 space-y-1.5">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-amber-700">📦 Previous Outstanding:</span>
                                                <span className="font-black text-amber-700">
                                                    ₹{totals.newPrevOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    {totals.prevOutstanding !== totals.newPrevOutstanding && (
                                                        <span className="text-[10px] text-emerald-600 ml-1 font-semibold">
                                                            (reduced from ₹{totals.prevOutstanding.toLocaleString('en-IN')})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold border-t border-amber-200 pt-1.5">
                                                <span className="text-rose-700 uppercase tracking-wider">🔴 Total Supplier Dues:</span>
                                                <span className="font-black text-rose-700 text-base">₹{totals.totalDues.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overpaid Warning Message */}
                                    {totals.overpaidAmount > 0 && (
                                        <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3 text-xs font-bold text-rose-700">
                                            ⚠️ Overpaid by <strong>₹{totals.overpaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>! The total payment amount exceeds the invoice total and previous outstanding combined. Please adjust the payment amounts.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface/30">
                            <button
                                type="button"
                                onClick={resetInvoiceForm}
                                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:bg-surface hover:text-text transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateInvoice}
                                disabled={totals.overpaidAmount > 0}
                                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Record & Post Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
