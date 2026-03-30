import { useState, useRef, useMemo } from 'react';
import { FileText, Search, Filter, Download, Plus, Clock, CheckCircle2, AlertCircle, Eye, MoreHorizontal, ArrowDownCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useInventory } from '../../contexts/InventoryContext';

export default function SupplierInvoicesPage() {
    const { stockInHistory, addStockIn, suppliers } = useInventory();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newVoucher, setNewVoucher] = useState({ supplier: '', invoiceRef: '', date: '', dueDate: '', amount: '', type: 'Credit', status: 'Pending' });
    const fileInputRef = useRef(null);

    const invoices = useMemo(() => {
        const groups = {};
        // Only process STOCK_IN transactions (Actual Purchases)
        const activeStockIn = stockInHistory.filter(item => item.type === 'STOCK_IN');

        activeStockIn.forEach(item => {
            const ref = item.invoiceRef || `UNLINKED-${(item._id || item.id || 'NEW').slice(-4)}`;
            if (!groups[ref]) {
                groups[ref] = {
                    id: ref,
                    supplier: item.supplierName || 'Manual Entry',
                    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
                    dueDate: item.createdAt ? new Date(new Date(item.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A',
                    amountRaw: 0,
                    status: 'Approved',
                    type: 'Purchase',
                    items: []
                };
            }
            groups[ref].amountRaw += (item.purchasePrice || 0) * (item.quantity || 1);
            groups[ref].items.push(item);
        });
        
        return Object.values(groups).map(g => ({
            ...g,
            amount: `₹${g.amountRaw.toLocaleString()}`
        })).filter(inv => 
            inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
            inv.supplier.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [stockInHistory, searchQuery]);

    const stats = useMemo(() => {
        const total = invoices.reduce((acc, curr) => acc + curr.amountRaw, 0);
        return {
            pending: invoices.filter(i => i.status === 'Pending').length,
            pendingValue: invoices.filter(i => i.status === 'Pending').reduce((a, b) => a + b.amountRaw, 0),
            totalPaid: invoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.amountRaw, 0),
            count: invoices.length
        };
    }, [invoices]);

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
            head: [['Invoice ID', 'Supplier', 'Billing Date', 'Status', 'Total Amount']],
            body: invoices.map(inv => [
                inv.id,
                inv.supplier,
                inv.date,
                inv.status,
                inv.amount
            ]),
            styles: { fontSize: 8, font: "helvetica" },
            headStyles: { fillColor: [60, 60, 60] },
            alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        doc.save("Supplier_Invoices_Report.pdf");
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
                    const importedInvoices = data.map((row, index) => ({
                        id: row.id || `INV-IMP-${Date.now()}-${index}`,
                        supplier: row.supplier || row.Supplier || 'Unknown Supplier',
                        date: row.date || row.Date || new Date().toISOString().split('T')[0],
                        dueDate: row.dueDate || row['Due Date'] || new Date().toISOString().split('T')[0],
                        amount: String(row.amount || row.Amount || '0'),
                        status: row.status || row.Status || 'Pending',
                        type: row.type || row.Type || 'Credit',
                    }));
                    setInvoices(prev => [...importedInvoices, ...prev]);
                    alert(`${importedInvoices.length} invoices imported successfully!`);
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

    const handleAddVoucherSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addStockIn({
                supplierName: newVoucher.supplier,
                invoiceRef: newVoucher.invoiceRef,
                amount: newVoucher.amount,
                type: newVoucher.type,
                quantity: 1, // Manual voucher represents 1 bulk entry
                date: newVoucher.date
            });
            setIsAddModalOpen(false);
            setNewVoucher({ supplier: '', invoiceRef: '', date: '', dueDate: '', amount: '', type: 'Credit', status: 'Pending' });
            alert('Voucher added successfully and synced with expenses!');
        } catch (error) {
            console.error('Error adding voucher:', error);
            alert('Failed to save voucher. Please check database connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <Clock className="w-8 h-8 text-primary mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Awaiting Approval</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹{stats.pendingValue.toLocaleString()}</h3>
                    <p className="text-[10px] text-amber-500 font-bold mt-2 uppercase tracking-tight">{stats.pending} Pending Invoices</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Invoices</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">{stats.count}</h3>
                    <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase tracking-tight">Inbound Records</p>
                </div>
                <div className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Value</p>
                    <h3 className="text-2xl font-black text-text tracking-tight">₹{invoices.reduce((a,b) => a + b.amountRaw, 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-tight">Live Ledger Sum</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest">Inbound Invoices</h2>
                    <div className="flex gap-2">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="text" 
                                placeholder="Search invoices..." 
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
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Invoice ID</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Billing Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Due Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-primary uppercase">{inv.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest">{inv.type}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{inv.supplier}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{inv.date}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">{inv.dueDate}</td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                            inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                                inv.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-500' :
                                                    'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">{inv.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 hover:bg-background rounded-lg text-text-muted transition-colors" title="View Detail">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-background rounded-lg text-text-muted transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Voucher Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-background rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-border/40"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-surface/50">
                                <h3 className="text-lg font-black tracking-tight uppercase">Add New Voucher</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>

                            <form onSubmit={handleAddVoucherSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Invoice Reference</label>
                                    <input
                                        required
                                        type="text"
                                        value={newVoucher.invoiceRef}
                                        onChange={(e) => setNewVoucher({ ...newVoucher, invoiceRef: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. BILL-2024-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Choose Supplier</label>
                                    <select
                                        required
                                        value={newVoucher.supplier}
                                        onChange={(e) => setNewVoucher({ ...newVoucher, supplier: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">Select a supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                        <option value="Misc Supplier">Miscellaneous Supplier</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Billing Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={newVoucher.date}
                                            onChange={(e) => setNewVoucher({ ...newVoucher, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Due Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={newVoucher.dueDate}
                                            onChange={(e) => setNewVoucher({ ...newVoucher, dueDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Amount (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            value={newVoucher.amount}
                                            onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                            placeholder="15000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Type</label>
                                        <select
                                            value={newVoucher.type}
                                            onChange={(e) => setNewVoucher({ ...newVoucher, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-surface border border-border/40 rounded-xl text-sm font-bold outline-none focus:border-primary transition-colors"
                                        >
                                            <option>Credit</option>
                                            <option>Advance</option>
                                            <option>COD</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={`w-full py-3 mt-4 bg-primary text-white rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Create Voucher'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
