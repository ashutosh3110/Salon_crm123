import { useState } from 'react';
import { ClipboardList, Filter, Download, Calendar, ArrowUpRight, CheckCircle2, AlertCircle, FileText, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useFinance } from '../../contexts/FinanceContext';

export default function TaxPage() {
    const { taxFilings } = useFinance();
    const [periodFilter, setPeriodFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const taxStats = [
        { label: 'GST Output (Sales)', value: '₹2,56,500', sub: 'Feb 2024' },
        { label: 'GST Input (Purchase)', value: '₹48,200', sub: 'Feb 2024' },
        { label: 'Net Liability', value: '₹2,08,300', sub: 'Due by Mar 20' },
    ];

    const filteredFilings = taxFilings.filter(file => {
        const matchesPeriod = periodFilter === 'All' || file.period.includes(periodFilter);
        const matchesType = typeFilter === 'All' || file.type === typeFilter;
        return matchesPeriod && matchesType;
    });

    const handleGenerateReport = () => {
        // Prepare Data
        const overviewData = taxStats.map(stat => ({
            "Metric": stat.label,
            "Amount": stat.value,
            "Details": stat.sub
        }));

        const filingsData = taxFilings.map(file => ({
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
        XLSX.writeFile(wb, `GSTR_Tax_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">GST & Tax Compliance</h1>
                    <p className="text-sm text-text-muted font-medium">Monthly tax liabilities and compliance filing status</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                        <ClipboardList className="w-4 h-4" /> Generate GSTR Report
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
