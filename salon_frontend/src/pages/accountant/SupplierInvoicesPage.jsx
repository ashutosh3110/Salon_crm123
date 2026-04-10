import { useState, useRef, useMemo, useEffect } from 'react';
import { FileText, Search, Filter, Download, Plus, Clock, CheckCircle2, AlertCircle, Eye, MoreHorizontal, ArrowDownCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import mockApi from '../../services/mock/mockApi';

export default function SupplierInvoicesPage() {
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierLedger, setSupplierLedger] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', note: '', method: 'online' });

    const [newVoucher, setNewVoucher] = useState({ 
        supplier: '', 
        invoiceRef: '', 
        date: new Date().toISOString().split('T')[0], 
        amount: '', 
        taxRate: '18', 
        taxAmount: '0',
        type: 'Credit', 
        attachmentUrl: ''
    });

    const fileInputRef = useRef(null);

    const invoices = useMemo(() => {
        return (supplierInvoices || []).filter(inv => 
            inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
            inv.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [supplierInvoices, searchQuery]);

    const stats = useMemo(() => {
        const results = supplierInvoices || [];
        return {
            totalDue: results.reduce((acc, curr) => acc + curr.outstanding, 0),
            overdueCount: results.filter(i => i.status === 'Overdue').length,
            overdueValue: results.filter(i => i.status === 'Overdue').reduce((acc, curr) => acc + curr.outstanding, 0),
            totalInvoices: results.length
        };
    }, [supplierInvoices]);

    const handleExport = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("SUPPLIER INVOICE LEDGER", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${timestamp}`, 14, 30);

        autoTable(doc, {
            startY: 45,
            head: [['Invoice No', 'Supplier', 'Date', 'Status', 'Outstanding']],
            body: invoices.map(inv => [
                inv.invoiceNo,
                inv.supplierName,
                new Date(inv.invoiceDate).toLocaleDateString(),
                inv.status,
                `₹${inv.outstanding.toLocaleString()}`
            ]),
            styles: { fontSize: 8, font: "helvetica" },
            headStyles: { fillColor: [60, 60, 60] },
            alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        doc.save(`Supplier_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data && data.length > 0) {
                    alert(`${data.length} invoices found in file. Manual import to backend required.`);
                }
            } catch (err) {
                console.error("Error reading file:", err);
                alert("Failed to parse the file. Please ensure it's a valid Excel/CSV.");
            }
        };
        reader.readAsBinaryString(file);
        // reset input
        e.target.value = null;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [invRes, supRes] = await Promise.all([
                mockApi.get('/suppliers/invoices'),
                mockApi.get('/suppliers')
            ]);
            setSupplierInvoices(invRes.data.results || []);
            setSuppliers(supRes.data.data || []);
        } catch (e) {
            console.error('Failed to load supplier data');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvoice) return;
        setIsSubmitting(true);
        try {
            await mockApi.post('/suppliers/invoices/payments', {
                invoiceKey: selectedInvoice.invoiceKey,
                amount: Number(paymentForm.amount),
                note: paymentForm.note,
                method: paymentForm.method
            });
            setIsPaymentModalOpen(false);
            setPaymentForm({ amount: '', note: '', method: 'online' });
            loadData();
            alert('Payment recorded successfully!');
        } catch (error) {
            alert('Payment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLedger = async (invoice) => {
        const sup = suppliers.find(s => s.name === invoice.supplierName);
        if (sup) {
            const res = await mockApi.get(`/suppliers/${sup.id}/ledger`);
            setSupplierLedger(res.data.data);
            setIsLedgerModalOpen(true);
        } else {
            alert('Supplier details not found for ledger');
        }
    };

    const handleAddVoucherSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await mockApi.post('/products/stock-in', {
                supplierName: newVoucher.supplier,
                invoiceRef: newVoucher.invoiceRef,
                amount: Number(newVoucher.amount),
                taxRate: Number(newVoucher.taxRate),
                taxAmount: Number(newVoucher.taxAmount),
                attachmentUrl: newVoucher.attachmentUrl,
                type: newVoucher.type,
                quantity: 1, 
                date: newVoucher.date
            });
            setIsAddModalOpen(false);
            setNewVoucher({ 
                supplier: '', 
                invoiceRef: '', 
                date: new Date().toISOString().split('T')[0], 
                amount: '', 
                taxRate: '18', 
                taxAmount: '0',
                type: 'Credit', 
                attachmentUrl: '' 
            });
            loadData();
            alert('Voucher added and synced with Finance!');
        } catch (error) {
            alert('Failed to save voucher.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Auto-calculate tax amount when base amount or rate changes
    useEffect(() => {
        const base = Number(newVoucher.amount) || 0;
        const rate = Number(newVoucher.taxRate) || 0;
        const tax = (base * rate) / 100;
        setNewVoucher(prev => ({ ...prev, taxAmount: tax.toFixed(2) }));
    }, [newVoucher.amount, newVoucher.taxRate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Supplier Invoices</h1>
                    <p className="text-sm text-text-muted font-medium">Verify and approve invoices from inventory suppliers</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className="hidden"
                    />
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-border/20 text-text-secondary rounded-xl text-sm font-bold hover:bg-surface-alt transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all text-left">
                        <Plus className="w-4 h-4" /> Add Voucher
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Outstanding</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹{stats.totalDue.toLocaleString()}</h3>
                    <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-tight">{stats.overdueCount} Overdue Invoices</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <Clock className="w-8 h-8 text-amber-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Overdue Amount</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹{stats.overdueValue.toLocaleString()}</h3>
                    <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-tight">Requires Immediate Action</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <FileText className="w-8 h-8 text-primary mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Invoices</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">{stats.totalInvoices}</h3>
                    <p className="text-[10px] text-primary font-bold mt-2 uppercase tracking-tight">Active Accounts</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Accounts Payable</h2>
                    <div className="flex gap-2">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="text" 
                                placeholder="Search ref or supplier..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none" 
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">
                                <th className="px-6 py-4">Invoice / Ref</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Detail (₹)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Outstanding</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {invoices.map((inv) => (
                                <tr key={inv.invoiceKey} className="hover:bg-surface-alt/50 transition-colors group text-xs font-bold">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-primary uppercase">{inv.invoiceNo}</p>
                                            {inv.attachmentUrl && <ArrowDownCircle className="w-3 h-3 text-text-muted" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors cursor-pointer" onClick={() => openLedger(inv)}>{inv.supplierName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-text-secondary">Bill: {new Date(inv.invoiceDate).toLocaleDateString()}</span>
                                            <span className="text-rose-500">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[10px]">
                                            <span>Subt: ₹{(inv.subtotal || 0).toLocaleString()}</span>
                                            <span>Tax: ₹{(inv.taxTotal || 0).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                                            inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                            inv.status === 'Overdue' ? 'bg-rose-500/10 text-rose-500' :
                                            inv.status === 'Partial' ? 'bg-indigo-500/10 text-indigo-500' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">₹{(inv.outstanding || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => { setSelectedInvoice(inv); setPaymentForm({ ...paymentForm, amount: inv.outstanding }); setIsPaymentModalOpen(true); }}
                                                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-[10px] font-black uppercase"
                                                disabled={inv.status === 'Paid'}
                                            >
                                                Pay
                                            </button>
                                            <button className="p-2 hover:bg-background rounded-lg text-text-muted transition-colors" title="View Ledger" onClick={() => openLedger(inv)}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-border/40">
                            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-surface/50">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight uppercase">Pay Supplier</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase">{selectedInvoice?.supplierName} - {selectedInvoice?.invoiceNo}</p>
                                </div>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5 text-text-muted" /></button>
                            </div>
                            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Amount to Pay (₹)</label>
                                    <input required type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} 
                                        className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors" />
                                    <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">Max Payable: ₹{selectedInvoice?.outstanding}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Payment Method</label>
                                    <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} 
                                        className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors">
                                        <option value="online">Online / UPI</option>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Note (Optional)</label>
                                    <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} 
                                        className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors" placeholder="e.g. Partially paid for inventory" />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ledger Modal */}
            <AnimatePresence>
                {isLedgerModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl border border-border/40">
                            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-surface/50">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight uppercase">Supplier Ledger</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase">{supplierLedger?.supplier?.name} (Balance: ₹{supplierLedger?.totalDue?.toLocaleString()})</p>
                                </div>
                                <button onClick={() => setIsLedgerModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full"><X className="w-5 h-5 text-text-muted" /></button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border/40 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                            <th className="py-2">Date</th>
                                            <th className="py-2">Ref</th>
                                            <th className="py-2">Debit (+)</th>
                                            <th className="py-2">Credit (-)</th>
                                            <th className="py-2 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        {supplierLedger?.history?.map((h, i) => (
                                            <tr key={i} className="py-2">
                                                <td className="py-3 font-bold">{new Date(h.date).toLocaleDateString()}</td>
                                                <td className="py-3">
                                                    <p className="font-bold">{h.type}</p>
                                                    <p className="text-[10px] text-text-muted">{h.ref}</p>
                                                </td>
                                                <td className="py-3 text-rose-500 font-bold">{h.debit > 0 ? `+ ₹${h.debit.toLocaleString()}` : '—'}</td>
                                                <td className="py-3 text-emerald-500 font-bold">{h.credit > 0 ? `- ₹${h.credit.toLocaleString()}` : '—'}</td>
                                                <td className="py-3 text-right font-black">₹{h.balance.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Voucher Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-border/40">
                            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-surface/50">
                                <h3 className="text-lg font-black tracking-tight uppercase">Add New Voucher</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full px-4"><X className="w-5 h-5 text-text-muted" /></button>
                            </div>
                            <form onSubmit={handleAddVoucherSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Reference</label>
                                        <input required type="text" value={newVoucher.invoiceRef} onChange={(e) => setNewVoucher({ ...newVoucher, invoiceRef: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors" placeholder="BILL-001" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Supplier</label>
                                        <select required value={newVoucher.supplier} onChange={(e) => setNewVoucher({ ...newVoucher, supplier: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors">
                                            <option value="">Select</option>
                                            {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Amount (₹)</label>
                                        <input required type="number" value={newVoucher.amount} onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors" placeholder="0.00" />
                                    </div>
                                     <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tax Rate (GST %)</label>
                                        <select value={newVoucher.taxRate} onChange={(e) => setNewVoucher({ ...newVoucher, taxRate: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors">
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="p-3 bg-surface-alt rounded-2xl border border-border/20">
                                    <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                                        <span>Total Tax</span>
                                        <span className="text-primary tracking-widest">₹{newVoucher.taxAmount}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-black text-text uppercase mt-1">
                                        <span>Total Payable</span>
                                        <span>₹{(Number(newVoucher.amount) + Number(newVoucher.taxAmount)).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Date</label>
                                        <input required type="date" value={newVoucher.date} onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Payment Type</label>
                                        <select value={newVoucher.type} onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })} 
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors">
                                            <option value="Credit">On Credit</option>
                                            <option value="COD">Cash on Delivery</option>
                                            <option value="Advance">Advance Paid</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    {isSubmitting ? 'Saving...' : 'Add Stock-In Voucher'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
