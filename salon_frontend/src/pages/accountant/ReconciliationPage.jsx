import { useState, useRef, useEffect, useMemo } from 'react';
import { Calculator, Search, Filter, ArrowLeftRight, CheckCircle2, AlertCircle, RefreshCcw, Download, Plus, MoreHorizontal, Link as LinkIcon, ExternalLink, Save, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useFinance } from '../../contexts/FinanceContext';

export default function ReconciliationPage() {
    const { revenue, expenses, cashBankSummary, fetchCashBankSummary, saveCashBankReconciliation, fetchRazorpaySettlements } = useFinance();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [reconItems, setReconItems] = useState([]);
    const [isMatching, setIsMatching] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        fetchCashBankSummary(selectedDate);
    }, [selectedDate, fetchCashBankSummary]);

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

    const handleSaveClosing = async () => {
        if (!cashBankSummary) return;
        setIsSaving(true);
        try {
            await saveCashBankReconciliation({
                businessDate: selectedDate,
                actualCash: cashBankSummary.cash?.net || 0,
                actualBank: cashBankSummary.bank?.net || 0,
                notes: 'Automated reconcile via dashboard'
            });
            alert('Daily closing saved and reconciled successfully!');
        } catch (error) {
            alert('Failed to save closing.');
        } finally {
            setIsSaving(false);
        }
    };

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
                    alert(`${imported.length} statement records imported successfully!`);
                }
            } catch (err) {
                console.error("Error reading file:", err);
                alert("Failed to parse the file. Please ensure it's a valid Excel/CSV.");
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
                alert('No Razorpay settlements found for this date.');
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
                    method: 'online'
                }));
                
                setReconItems(prev => [...mapped, ...prev]);
                alert(`${mapped.length} Razorpay settlements synced successfully!`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to sync with Razorpay.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSplitItem = (itemId) => {
        const item = reconItems.find(i => i.id === itemId);
        if (!item) return;

        const total = Math.abs(item.systemAmt);
        const splitStr = prompt(`Enter Online portion for ${item.desc} (Total: ₹${total}):`, (total * 0.6).toFixed(0));
        const onlineAmt = parseFloat(splitStr);

        if (isNaN(onlineAmt) || onlineAmt <= 0 || onlineAmt >= total) {
            alert("Invalid split amount. Please enter a value between 0 and the total.");
            return;
        }

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
                        onClick={handleSaveClosing}
                        disabled={isSaving || !cashBankSummary}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Closing'}
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
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-black text-text-muted">HDFC</div>
                                <div>
                                    <p className="text-xs font-black text-text">HDFC Corporate A/c</p>
                                    <p className="text-[9px] text-text-muted font-bold tracking-widest leading-none">**** 9281</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Linked</span>
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
                                        <div className="flex justify-center">
                                            {!item.id.includes('-ON') && !item.id.includes('-CH') && (
                                                <button 
                                                    onClick={() => handleSplitItem(item.id)}
                                                    className="p-1.5 hover:bg-primary/10 rounded-lg text-text-muted hover:text-primary transition-all group/split"
                                                    title="Split Payment (Cash + Online)"
                                                >
                                                    <Scissors className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
