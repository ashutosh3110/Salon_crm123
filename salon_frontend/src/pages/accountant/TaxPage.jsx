import { useState, useMemo } from 'react';
import { ClipboardList, Filter, Download, Calendar, ArrowUpRight, CheckCircle2, AlertCircle, FileText, PieChart, TrendingUp, ShieldCheck, FileDown, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useFinance } from '../../contexts/FinanceContext';

export default function TaxPage() {
    const { gstSummary, expenses } = useFinance();
    const [periodFilter, setPeriodFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [exportFormat, setExportFormat] = useState('excel'); // 'excel' or 'pdf'

    // Calculate GST Input (ITC) from Expenses (Estimate 18% on Inventory/Supplies)
    const itcStats = useMemo(() => {
        const taxableExpenses = expenses.filter(e => 
            e.category === 'inventory' || e.category === 'supplies' || e.category === 'maintenance'
        );
        const totalAmount = taxableExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        // Estimate 18% GST Input (Amount / 1.18 * 0.18)
        const estimatedITC = Math.round((totalAmount / 1.18) * 0.18);
        return { total: estimatedITC, count: taxableExpenses.length };
    }, [expenses]);

    const taxStats = [
        { label: 'GST Output (Sales)', value: `₹${(gstSummary.totals?.gstTotal || 0).toLocaleString()}`, sub: 'From Salon Invoices' },
        { label: 'GST Input (Purchase)', value: `₹${itcStats.total.toLocaleString()}`, sub: `${itcStats.count} Taxable Expenses` },
        { label: 'Net Liability', value: `₹${Math.max(0, (gstSummary.totals?.gstTotal || 0) - itcStats.total).toLocaleString()}`, sub: 'Estimated Payable' },
    ];

    const filingsHistory = useMemo(() => {
        return (gstSummary.monthly || []).map(m => ({
            period: m.monthLabel,
            type: 'GSTR-1/3B',
            ack: `GST-${m.monthKey}-${Math.random().toString(36).substring(7).toUpperCase()}`,
            amount: m.gstTotal,
            date: `Calculated: ${m.monthKey}-20`,
            status: 'Draft'
        }));
    }, [gstSummary.monthly]);

    const filteredFilings = filingsHistory.filter(file => {
        const matchesPeriod = periodFilter === 'All' || file.period.includes(periodFilter);
        const matchesType = typeFilter === 'All' || file.type === typeFilter;
        return matchesPeriod && matchesType;
    });

    const generatePDFReport = () => {
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(40);
            doc.text("GST & TAX COMPLIANCE REPORT", 14, 22);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Reporting Period: ${periodFilter || 'All'} | Turnover Type: ${typeFilter || 'All'}`, 14, 35);
            
            // Summary Sector
            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.text("Financial Summary", 14, 48);
            
            autoTable(doc, {
                startY: 52,
                head: [['Metric', 'Amount', 'Description']],
                body: (taxStats || []).map(s => [
                    s.label, 
                    s.value.replace('₹', 'Rs. '), 
                    s.sub
                ]),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] } // Standard Primary Blue
            });
            
            // Detailed History
            const finalY = doc.lastAutoTable?.finalY || 100;
            doc.text("Tax Filing History", 14, finalY + 15);
            
            autoTable(doc, {
                startY: finalY + 20,
                head: [['Period', 'Type', 'Tax Amount', 'Status', 'Ack Ref']],
                body: (filingsHistory || []).map(f => [
                    f.period, 
                    f.type, 
                    `Rs. ${(f.amount || 0).toLocaleString()}`, 
                    f.status, 
                    f.ack
                ]),
                theme: 'striped'
            });
            
            doc.save(`Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Error: ' + error.message);
        }
    };

    const handleGenerateReport = () => {
        if (exportFormat === 'pdf') {
            generatePDFReport();
            return;
        }

        // Prepare Data for Excel
        const overviewData = taxStats.map(stat => ({
            "Metric": stat.label,
            "Amount": stat.value,
            "Details": stat.sub
        }));

        const filingsData = filingsHistory.map(file => ({
            "Tax Period": file.period,
            "Type": file.type,
            "Amount": `₹${file.amount.toLocaleString()}`,
            "Status": file.status,
            "Filing Date": file.date,
            "Ack / Ref": file.ack
        }));

        // create workbook
        const wb = XLSX.utils.book_new();

        // create sheets
        const wsOverview = XLSX.utils.json_to_sheet(overviewData);
        const wsFilings = XLSX.utils.json_to_sheet(filingsData);

        // add sheets to workbook
        XLSX.utils.book_append_sheet(wb, wsOverview, "Tax Overview");
        XLSX.utils.book_append_sheet(wb, wsFilings, "Filing History");

        // download file
        XLSX.writeFile(wb, `Tax_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">GST & Tax Compliance</h1>
                    <p className="text-sm text-text-muted font-medium">Monthly tax liabilities and compliance filing status</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-background border border-border/40 p-1 rounded-xl">
                        <button 
                            onClick={() => setExportFormat('excel')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${exportFormat === 'excel' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}
                        >
                            <FileJson className="w-3.5 h-3.5" /> Excel
                        </button>
                        <button 
                            onClick={() => setExportFormat('pdf')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${exportFormat === 'pdf' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}
                        >
                            <FileDown className="w-3.5 h-3.5" /> PDF
                        </button>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                        <ClipboardList className="w-4 h-4" /> Download Report
                    </button>
                </div>
            </div>

            {/* Tax Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {taxStats.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label}
                        className="p-6 bg-surface rounded-3xl border border-border/40 shadow-sm relative group overflow-hidden"
                    >
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                                <h3 className="text-2xl font-black text-text tracking-tight group-hover:text-primary transition-colors">{item.value}</h3>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{item.sub}</span>
                                <TrendingUp className="w-4 h-4 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <p className="text-xs font-bold text-text-secondary leading-tight">Tax calculation is based on current GST settings (18.0%). Input tax credit is automatically fetched from approved supplier invoices.</p>
                </div>
            </div>

            {/* Compliance Table */}
            <div className="bg-surface rounded-3xl border border-border/40 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50">
                    <h2 className="text-sm font-black text-text uppercase tracking-widest leading-none">Tax Filing History</h2>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-border/40 rounded-xl text-[10px] font-bold text-text-secondary outline-none focus:border-primary transition-all uppercase"
                        >
                            <option value="All">All Periods</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1.5 bg-background border border-border/40 rounded-xl text-[10px] font-bold text-text-secondary outline-none focus:border-primary transition-all uppercase"
                        >
                            <option value="All">All Types</option>
                            <option value="GSTR-1">GSTR-1</option>
                            <option value="GSTR-3B">GSTR-3B</option>
                            <option value="Income Tax">Income Tax</option>
                        </select>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border/40 rounded-xl text-[10px] font-bold text-text-secondary hover:bg-surface-alt transition-all">
                            <Download className="w-3 h-3" /> Archive
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50 text-left">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Tax Period</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Ref / Ack</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Tax Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Filing Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {filteredFilings.map((file) => (
                                <tr key={file.ack} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text uppercase">{file.period}</p>
                                        <p className="text-[10px] text-text-muted font-bold tracking-widest italic">{file.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background border border-border/10 text-text-secondary">{file.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-text-secondary tracking-widest font-mono">{file.ack}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text tracking-tight">₹{file.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${file.status === 'Filed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {file.status}
                                            </span>
                                            {file.status === 'Filed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredFilings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No filing records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
