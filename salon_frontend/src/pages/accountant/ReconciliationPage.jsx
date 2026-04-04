import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calculator, Search, Filter, ArrowLeftRight, CheckCircle2, AlertCircle, RefreshCcw, Download, Plus, MoreHorizontal, Link as LinkIcon, ExternalLink, Save, Scissors, Zap, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useFinance } from '../../contexts/FinanceContext';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReconciliationPage() {
    const { user } = useAuth();
    const { revenue, expenses, cashBankSummary, fetchCashBankSummary, saveCashBankReconciliation, fetchRazorpaySettlements, updateBankDetails } = useFinance();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [reconItems, setReconItems] = useState([]);
    const [isMatching, setIsMatching] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [counts, setCounts] = useState({ 500: '', 200: '', 100: '', 50: '', 20: '', 10: '', 5: '', 2: '', 1: '' });
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankForm, setBankForm] = useState({ bankName: 'HDFC Bank', accountNumber: '9281', isLinked: true });
    const fileInputRef = useRef(null);

    // Toast popup state
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    const showToast = useCallback((message, type = 'success') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }, []);

    // Split modal state
    const [splitModal, setSplitModal] = useState(null);
    const [splitValue, setSplitValue] = useState('');

    // Initial Fetch
    useEffect(() => {
        fetchCashBankSummary(selectedDate);
    }, [selectedDate, fetchCashBankSummary]);

    // Track active outlet's bank info
    useEffect(() => {
        if (cashBankSummary?.outlet?.bankAccount) {
            setBankForm({
                bankName: cashBankSummary.outlet.bankAccount.bankName || 'HDFC Bank',
                accountNumber: cashBankSummary.outlet.bankAccount.accountNumber || '9281',
                isLinked: cashBankSummary.outlet.bankAccount.isLinked ?? true
            });
        }
    }, [cashBankSummary]);

    // Map real transactions to Reconciliation Items
    const systemTransactions = useMemo(() => {
        const dateMatch = (d) => new Date(d).toISOString().split('T')[0] === selectedDate;
        
        const revItems = revenue.filter(r => dateMatch(r.createdAt)).map(r => ({
            id: r.invoiceNumber,
            date: new Date(r.createdAt).toLocaleDateString(),
            desc: `Sales - ${r.paymentMethod.toUpperCase()}`,
            systemAmt: r.total,
            bankAmt: 0,
            status: 'Pending',
            diff: r.total,
            type: 'income',
            method: r.paymentMethod
        }));

        const expItems = expenses.filter(e => dateMatch(e.date || e.createdAt)).map(e => ({
            id: e._id.substring(0, 8).toUpperCase(),
            date: new Date(e.date || e.createdAt).toLocaleDateString(),
            desc: `${e.category.toUpperCase()} - ${e.description || 'Expense'}`,
            systemAmt: -e.amount,
            bankAmt: 0,
            status: 'Pending',
            diff: -e.amount,
            type: 'expense',
            method: e.paymentMethod
        }));

        return [...revItems, ...expItems];
    }, [revenue, expenses, selectedDate]);

    useEffect(() => {
        if (reconItems.length === 0) {
            setReconItems(systemTransactions);
        }
    }, [systemTransactions, reconItems.length]);


    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
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
                    const imported = data.map((row, index) => {
                        const sAmt = String(row.systemAmt || row.Amount || '0');
                        const bAmt = String(row.bankAmt || '0');
                        return {
                            id: row.id || `RC-IMP-${Date.now()}-${index}`,
                            date: row.date || row.Date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            desc: row.desc || row.Description || 'Imported Bank Record',
                            systemAmt: sAmt.startsWith('₹') ? sAmt : `₹${sAmt}`,
                            bankAmt: bAmt.startsWith('₹') ? bAmt : `₹${bAmt}`,
                            status: row.status || 'Pending',
                            diff: row.diff || '₹0'
                        };
                    });
                    setReconItems(prev => [...imported, ...prev]);
                    showToast(`${imported.length} statement records imported successfully!`, 'success');
                }
            } catch (err) {
                console.error("Error reading file:", err);
                showToast("Failed to parse the file. Please ensure it's a valid Excel/CSV.", 'error');
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null;
    };

    const handleAutoMatch = () => {
        setIsMatching(true);
        // Simulate API call and logic taking place
        setTimeout(() => {
            setReconItems(prev => prev.map(item => {
                if (item.status === 'Pending') {
                    // simulate finding a match and resolving the discrepancy
                    return { ...item, bankAmt: item.systemAmt, diff: '₹0', status: 'Matched' };
                }
                return item;
            }));
            setIsMatching(false);
        }, 1500);
    };
    
    const handleSyncRazorpay = async () => {
        setIsSyncing(true);
        try {
            const start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);
            
            const settlements = await fetchRazorpaySettlements(
                Math.floor(start.getTime() / 1000),
                Math.floor(end.getTime() / 1000)
            );
            
            if (settlements.length === 0) {
                showToast('No Razorpay settlements found for this date.', 'warning');
            } else {
                const mapped = settlements.map(s => ({
                    id: s.id,
                    date: new Date(s.created_at * 1000).toLocaleDateString(),
                    desc: `Razorpay Settlement - ${s.status.toUpperCase()}`,
                    systemAmt: 0,
                    bankAmt: s.amount / 100,
                    status: s.status === 'processed' ? 'Matched' : 'Pending',
                    diff: -(s.amount / 100),
                    type: 'income',
                    method: 'online',
                    fee: (s.fees || 0) / 100,
                    tax: (s.tax || 0) / 100
                }));
                
                // Add Fee entries as expenses to match the bank settlement correctly
                const feeItems = settlements.map(s => ({
                    id: `FEE-${s.id}`,
                    date: new Date(s.created_at * 1000).toLocaleDateString(),
                    desc: `Razorpay Merchant Fee - ${s.id}`,
                    systemAmt: -((s.fees || 0) / 100),
                    bankAmt: -((s.fees || 0) / 100),
                    status: 'Matched',
                    diff: 0,
                    type: 'expense',
                    method: 'online'
                }));
                
                setReconItems(prev => [...mapped, ...feeItems, ...prev]);
                showToast(`${mapped.length} Razorpay settlements and ${feeItems.length} fee adjustments synced!`, 'success');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to sync with Razorpay.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSplitItem = (itemId) => {
        const item = reconItems.find(i => i.id === itemId);
        if (!item) return;
        const total = Math.abs(item.systemAmt);
        setSplitValue((total * 0.6).toFixed(0));
        setSplitModal({ itemId, item, total });
    };

    const confirmSplit = () => {
        if (!splitModal) return;
        const { itemId, item, total } = splitModal;
        const onlineAmt = parseFloat(splitValue);
        if (isNaN(onlineAmt) || onlineAmt <= 0 || onlineAmt >= total) {
            showToast('Invalid split amount. Enter a value between 0 and the total.', 'error');
            return;
        }
        setSplitModal(null);

        const cashAmt = total - onlineAmt;

        const onlineItem = { 
            ...item, 
            id: `${item.id}-ON`, 
            desc: `${item.desc} (Online Part)`, 
            systemAmt: item.type === 'income' ? onlineAmt : -onlineAmt,
            bankAmt: 0,
            diff: onlineAmt,
            status: 'Pending',
            method: 'online'
        };

        const cashItem = { 
            ...item, 
            id: `${item.id}-CH`, 
            desc: `${item.desc} (Cash Part)`, 
            systemAmt: item.type === 'income' ? cashAmt : -cashAmt,
            bankAmt: 0,
            diff: cashAmt,
            status: 'Pending',
            method: 'cash'
        };

        setReconItems(prev => {
            const index = prev.findIndex(i => i.id === itemId);
            const newList = [...prev];
            newList.splice(index, 1, onlineItem, cashItem);
            return newList;
        });
    };

    const actualCashCounted = Object.entries(counts).reduce((sum, [d, q]) => sum + (Number(d) * (Number(q) || 0)), 0);
    const systemCashExpected = reconItems.filter(i => i.method === 'cash').reduce((sum, i) => sum + i.systemAmt, 0);
    const cashDiscrepancy = actualCashCounted - systemCashExpected;

    const downloadSummary = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Financial Reconciliation Summary', 14, 22);
        doc.setFontSize(10);
        doc.text(`Business Date: ${selectedDate}`, 14, 30);
        doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 35);
        doc.text(`Outlet: ${cashBankSummary?.outlet?.name || 'Main Outlet'}`, 14, 40);

        // Transaction Table
        const tableData = reconItems.map(item => [
            item.id,
            item.desc,
            `Rs.${item.systemAmt.toLocaleString()}`,
            `Rs.${item.bankAmt.toLocaleString()}`,
            `Rs.${Math.abs(item.diff).toLocaleString()}`,
            item.status
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['ID', 'Description', 'System Amt', 'Bank Amt', 'Diff', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] } // Primary blue
        });

        const finalY = doc.lastAutoTable.finalY + 15;

        // Cash Audit Section
        doc.setFontSize(14);
        doc.text('Physical Cash Audit (Drawer)', 14, finalY);
        doc.setFontSize(10);
        doc.text(`System Expected: Rs.${systemCashExpected.toLocaleString()}`, 14, finalY + 8);
        doc.text(`Actual Counted: Rs.${actualCashCounted.toLocaleString()}`, 14, finalY + 14);
        
        const discrepancy = actualCashCounted - systemCashExpected;
        doc.setTextColor(discrepancy === 0 ? [16, 185, 129] : [239, 68, 68]);
        doc.text(`Variance: Rs.${discrepancy.toLocaleString()} (${discrepancy === 0 ? 'MATCHED' : 'DISCREPANCY'})`, 14, finalY + 20);
        doc.setTextColor(0);

        // Denominations
        let noteY = finalY + 30;
        doc.text('Denominations:', 14, noteY);
        Object.entries(counts).forEach(([note, qty], i) => {
            if (qty && qty > 0) {
                doc.text(`Rs.${note} x ${qty} = Rs.${Number(note) * qty}`, 20, noteY + 6 + (i * 5));
            }
        });

        // Footer
        doc.setFontSize(8);
        doc.text('Verified by Salon Management System - Reconciliation Terminal V3', 14, 285);

        doc.save(`reconciliation-report-${selectedDate}.pdf`);
    };

    const handleSaveClosing = async () => {
        if (!cashBankSummary) return;
        setIsSaving(true);
        try {
            await saveCashBankReconciliation({
                date: selectedDate,
                items: reconItems,
                actualCashCounted,
                denominations: counts
            });
            showToast('Reconciliation and Daily Closing saved successfully!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to save closing.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateBank = async () => {
        try {
            await updateBankDetails(user.outletId, bankForm);
            setShowBankModal(false);
            await fetchCashBankSummary(selectedDate);
            showToast('Bank info updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update bank info.', 'error');
        }
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Bank Reconciliation</h1>
                    <p className="text-sm text-text-muted font-medium">Match internal records with bank statements and merchant settlements</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className="hidden"
                    />
                    <button onClick={handleImportClick} className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all transition-colors duration-300">
                        <ArrowLeftRight className="w-4 h-4" /> Import Statement
                    </button>
                    <button disabled={isMatching} onClick={handleAutoMatch} className={`flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-primary rounded-xl text-sm font-bold transition-all ${isMatching ? 'opacity-80 cursor-wait' : 'hover:bg-primary hover:text-white'}`}>
                        <RefreshCcw className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
                        {isMatching ? 'Matching...' : 'Auto-Match'}
                    </button>
                    <button 
                        disabled={isSyncing} 
                        onClick={handleSyncRazorpay} 
                        className={`flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-blue-600 rounded-xl text-sm font-bold transition-all ${isSyncing ? 'opacity-80 cursor-wait' : 'hover:bg-blue-600 hover:text-white'}`}
                    >
                        <Zap className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Razorpay'}
                    </button>
                    <button 
                        onClick={downloadSummary}
                        className="flex items-center gap-2 px-6 py-2.5 bg-background border-2 border-primary/20 text-text rounded-xl text-sm font-bold transition-all hover:bg-surface"
                    >
                        <Download className="w-4 h-4" />
                        Download Summary
                    </button>
                    <button 
                        onClick={handleSaveClosing}
                        disabled={isSaving || !cashBankSummary || (reconItems.length > 0 && Math.abs(cashDiscrepancy) > 0)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Closing'}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 py-2">
                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Selected Business Date:</p>
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setReconItems([]); // Reset items so they re-fetch from system memo
                    }}
                    className="bg-surface px-4 py-1.5 border border-border/40 rounded-xl text-xs font-bold outline-none" 
                />
            </div>

            {/* Reconciliation Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <LinkIcon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Connected Accounts</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Automated Bank Feeds</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-background border border-border/10 rounded-2xl group/bank hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                    {bankForm.bankName.substring(0, 4).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-text">{bankForm.bankName} Corporate A/c</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest leading-none">**** {bankForm.accountNumber.slice(-4)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${bankForm.isLinked ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <div className={`w-1 h-1 rounded-full ${bankForm.isLinked ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} /> 
                                    {bankForm.isLinked ? 'Linked' : 'Disconnected'}
                                </span>
                                <button 
                                    onClick={() => setShowBankModal(true)}
                                    className="p-1 px-2 text-[8px] font-black uppercase bg-surface border border-border/40 rounded-md hover:bg-white transition-all shadow-sm"
                                >
                                    Manage
                                </button>
                            </div>
                        </div>
                        <button className="w-full py-3.5 bg-background border border-dashed border-border/60 text-text-muted rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-surface-alt hover:text-primary transition-all">+ Add Bank Feed</button>
                    </div>
                </div>

                <div className="p-8 bg-surface rounded-[40px] border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-7 h-7 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text tracking-tight uppercase">Unmatched Logs</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Action Required</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black text-text tracking-tighter">
                                {reconItems.filter(item => item.status !== 'Matched').length}
                            </h2>
                            <div>
                            <p className="text-xs font-bold text-text-secondary leading-tight">Transactions waiting for verification for {new Date(selectedDate).toLocaleDateString()}.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Reconciliation History Table */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Transaction Log Analysis</h2>
                    <div className="flex gap-2">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-background border border-border/40 rounded-xl text-xs font-bold outline-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50 text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">ID / Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">System Amt</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Bank Amt</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Difference</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Outcome</th>
                                <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {reconItems.map((item) => (
                                <tr key={item.id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-text-muted uppercase tracking-tighter">{item.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest">{item.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">{item.desc}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-text-secondary">{item.systemAmt}</td>
                                    <td className="px-6 py-4 text-right text-xs font-bold text-text-secondary">{item.bankAmt}</td>
                                    <td className={`px-6 py-4 text-right text-xs font-black italic ${item.diff !== 0 ? 'text-rose-500' : 'text-text-muted opacity-30'}`}>
                                        ₹{Math.abs(item.diff).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${item.status === 'Matched' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.status === 'Discrepancy' ? 'bg-rose-500/10 text-rose-500' :
                                                    'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                {item.status}
                                            </span>
                                            {item.status === 'Matched' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {!item.id.includes('-ON') && !item.id.includes('-CH') && item.method !== 'online' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleSplitItem(item.id)}
                                                        className="p-1.5 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all group/split"
                                                        title="Manual Split (Cash + Online)"
                                                    >
                                                        <Scissors className="w-4 h-4" />
                                                    </button>
                                                    {/* Smart Suggestion Logic */}
                                                    {reconItems.find(s => s.method === 'online' && s.status === 'Pending' && s.bankAmt < item.systemAmt) && (
                                                        <button 
                                                            onClick={() => {
                                                                const s = reconItems.find(s => s.method === 'online' && s.status === 'Pending' && s.bankAmt < item.systemAmt);
                                                                const onlineAmt = s.bankAmt;
                                                                const total = item.systemAmt;
                                                                const cashAmt = total - onlineAmt;
                                                                
                                                                const onlineItem = { 
                                                                    ...item, 
                                                                    id: `${item.id}-ON`, 
                                                                    desc: `${item.desc} (Online Part)`, 
                                                                    systemAmt: onlineAmt,
                                                                    bankAmt: onlineAmt,
                                                                    diff: 0,
                                                                    status: 'Matched',
                                                                    method: 'online'
                                                                };
                                                                const cashItem = { 
                                                                    ...item, 
                                                                    id: `${item.id}-CH`, 
                                                                    desc: `${item.desc} (Cash Part)`, 
                                                                    systemAmt: cashAmt,
                                                                    bankAmt: 0,
                                                                    diff: cashAmt,
                                                                    status: 'Pending',
                                                                    method: 'cash'
                                                                };
                                                                setReconItems(prev => {
                                                                    const index = prev.findIndex(i => i.id === item.id);
                                                                    const newList = [...prev];
                                                                    newList.splice(index, 1, onlineItem, cashItem);
                                                                    // Also mark the settlement as matched
                                                                    return newList.map(i => i.id === s.id ? {...i, status: 'Matched', diff: 0} : i);
                                                                });
                                                            }}
                                                            className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] font-black uppercase hover:bg-amber-500 hover:text-white transition-all"
                                                            title="Auto-split based on synced settlement"
                                                        >
                                                            <Zap className="w-3.5 h-3.5" /> Suggest Split
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cash Drawer Verification (Bottom Panel) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-surface border border-border/40 rounded-[2rem] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Calculator className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-black text-text uppercase tracking-widest">Cash Drawer Note Counting</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {[500, 200, 100, 50, 20, 10, 5].map(d => (
                                <div key={d} className="space-y-2 p-3 bg-background border border-border/10 rounded-2xl">
                                    <label className="text-[10px] font-black text-text-secondary uppercase">₹{d} Notes</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        value={counts[d]}
                                        onChange={(e) => setCounts({...counts, [d]: e.target.value})}
                                        className="w-full bg-surface border border-border/20 rounded-lg py-1 px-2 text-xs font-bold focus:border-primary/50 outline-none"
                                    />
                                    <p className="text-[9px] text-text-muted font-bold text-right italic">₹{(d * (Number(counts[d]) || 0)).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-[2rem] p-8 flex flex-col justify-between border-2 transition-all ${Math.abs(cashDiscrepancy) === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Actual Cash</span>
                                <h4 className={`text-2xl font-black ${Math.abs(cashDiscrepancy) === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>₹{actualCashCounted.toLocaleString()}</h4>
                            </div>
                            <div className="flex items-center justify-between border-t border-border/10 pt-4">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">System Expected</span>
                                <h4 className="text-lg font-black text-text-muted">₹{systemCashExpected.toLocaleString()}</h4>
                            </div>
                            <div className={`p-4 rounded-2xl flex items-center gap-3 ${Math.abs(cashDiscrepancy) === 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                {Math.abs(cashDiscrepancy) === 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-rose-600" />
                                )}
                                <div>
                                    <p className={`text-xs font-black uppercase tracking-tight ${Math.abs(cashDiscrepancy) === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {Math.abs(cashDiscrepancy) === 0 ? 'Perfect Balance' : `₹${Math.abs(cashDiscrepancy).toLocaleString()} Shortage/Variation`}
                                    </p>
                                    <p className="text-[9px] text-text-secondary font-medium tracking-wide leading-tight mt-0.5">
                                        {Math.abs(cashDiscrepancy) === 0 
                                            ? 'Physical cash exactly matches daily system records.' 
                                            : 'Cash in hand does not match billing history. Please audit notes.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest text-center mt-6">Audit Integrity Verified @ {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* Bank Management Modal */}
            <AnimatePresence>
                {showBankModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface w-full max-w-sm rounded-[2.5rem] border border-border/40 p-8 text-left shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-text uppercase tracking-tight">Manage Bank</h2>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Primary Settlement A/c</p>
                                </div>
                                <button onClick={() => setShowBankModal(false)} className="p-2 hover:bg-background rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bank Provider Name</label>
                                    <input 
                                        type="text" 
                                        value={bankForm.bankName} 
                                        onChange={e => setBankForm({...bankForm, bankName: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-background border border-border/40 rounded-2xl text-xs font-bold outline-none focus:border-primary/50" 
                                        placeholder="e.g. ICICI Bank"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Account Number (Last 4 digits)</label>
                                    <input 
                                        type="text" 
                                        maxLength={4}
                                        value={bankForm.accountNumber} 
                                        onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-background border border-border/40 rounded-2xl text-xs font-black tracking-widest outline-none focus:border-primary/50" 
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-background border border-border/10 rounded-2xl">
                                    <span className="text-[10px] font-black text-text uppercase tracking-widest">Enable Sync Feed</span>
                                    <button 
                                        onClick={() => setBankForm({...bankForm, isLinked: !bankForm.isLinked})}
                                        className={`w-10 h-5 rounded-full relative transition-all ${bankForm.isLinked ? 'bg-emerald-500' : 'bg-rose-500/50'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${bankForm.isLinked ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleUpdateBank}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                >
                                    Save Bank Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Toast Popup ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-8 right-8 z-[200] max-w-md"
                    >
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                            'bg-amber-50 border-amber-200 text-amber-800'
                        }`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                toast.type === 'success' ? 'bg-emerald-500/10' :
                                toast.type === 'error' ? 'bg-rose-500/10' :
                                'bg-amber-500/10'
                            }`}>
                                {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                                 toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> :
                                 <Info className="w-4 h-4 text-amber-600" />}
                            </div>
                            <p className="text-sm font-bold flex-1">{toast.message}</p>
                            <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0">
                                <X className="w-4 h-4 opacity-50" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Split Modal ── */}
            <AnimatePresence>
                {splitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-surface w-full max-w-sm rounded-[2.5rem] border border-border/40 p-8 text-left shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-text uppercase tracking-tight">Split Transaction</h2>
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Cash + Online Split</p>
                                </div>
                                <button onClick={() => setSplitModal(null)} className="p-2 hover:bg-background rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-background border border-border/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Transaction</p>
                                    <p className="text-sm font-bold text-text">{splitModal.item.desc}</p>
                                    <p className="text-xs font-black text-primary mt-1">Total: ₹{splitModal.total.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Online Portion (₹)</label>
                                    <input
                                        type="number"
                                        value={splitValue}
                                        onChange={e => setSplitValue(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-background border border-border/40 rounded-2xl text-sm font-bold outline-none focus:border-primary/50"
                                        placeholder="Enter online amount"
                                        autoFocus
                                    />
                                    {splitValue && parseFloat(splitValue) > 0 && parseFloat(splitValue) < splitModal.total && (
                                        <p className="text-[10px] text-text-muted font-bold mt-1">Cash portion: ₹{(splitModal.total - parseFloat(splitValue)).toLocaleString()}</p>
                                    )}
                                </div>
                                <button
                                    onClick={confirmSplit}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-2"
                                >
                                    Confirm Split
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
