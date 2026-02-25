import React, { useState } from 'react';
import {
    Calendar,
    ClipboardList,
    Search,
    Filter,
    Download,
    Printer,
    Eye,
    MoreVertical,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    X,
    Loader2
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const invoices = [
    { id: 'INV-7801', client: 'Rahul Sharma', amount: '₹1,250', date: '25 Oct 2023', status: 'Paid', method: 'UPI' },
    { id: 'INV-7802', client: 'Priya Singh', amount: '₹3,500', date: '25 Oct 2023', status: 'Unpaid', method: '-' },
    { id: 'INV-7803', client: 'Anita Verma', amount: '₹1,200', date: '24 Oct 2023', status: 'Paid', method: 'Card' },
    { id: 'INV-7804', client: 'John Doe', amount: '₹4,800', date: '24 Oct 2023', status: 'Paid', method: 'Cash' },
    { id: 'INV-7805', client: 'Sanya Mirza', amount: '₹2,100', date: '23 Oct 2023', status: 'Refunded', method: 'Original' },
];

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const [isExporting, setIsExporting] = useState(false);

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.client.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (type, id) => {
        if (type === 'View') {
            const inv = invoices.find(i => i.id === id);
            setSelectedInvoice(inv);
            setIsPreviewOpen(true);
        } else if (type === 'Download') {
            alert(`Generating secure PDF for ${id}. Archive transfer initiated.`);
        } else {
            alert(`${type} protocol for ${id} active.`);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            alert('Financial archive slice (CSV) successfully exported to terminal system.');
        }, 1800);
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
            alert('Daily settlement report dispatched to secure terminal printer.');
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Billing Archives</h1>
                    <p className="text-[10px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] opacity-60">Complete history of salon transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-5 py-2.5 bg-surface border border-border text-text text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} {isExporting ? 'EXPORTING...' : 'Export Data'}
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={isPrinting}
                        className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />} {isPrinting ? 'PRINTING...' : 'Day End Report'}
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Revenue (Today)', value: 24850, prefix: '₹', icon: TrendingUp, trend: '+12.5%', positive: true, glow: 'bg-emerald-500/5', color: 'text-emerald-500' },
                    { label: 'Unpaid Invoices', value: 3, icon: Clock, trend: '-1 today', positive: false, glow: 'bg-amber-500/5', color: 'text-amber-500' },
                    { label: 'Net Transactions', value: 42, icon: FileText, trend: '+8 today', positive: true, glow: 'bg-primary/5', color: 'text-primary' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface py-6 px-8 border border-border group hover:border-primary/20 transition-all relative overflow-hidden">
                        {/* Soft Glow */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.glow} rounded-none blur-2xl group-hover:opacity-100 transition-opacity opacity-50`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <stat.icon className={`w-4 h-4 text-text-muted transition-colors group-hover:${stat.color}`} />
                                    <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>

                            <div className="flex items-end justify-between mt-auto">
                                <h3 className={`text-2xl font-black ${stat.label.includes('Unpaid') ? 'text-amber-500' : 'text-text'} uppercase tracking-tight`}>
                                    <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                                </h3>
                                <div className="-mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={stat.positive ? "text-emerald-400" : "text-rose-400"}>
                                        <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="bg-surface border border-border p-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH INVOICE ID OR CLIENT..."
                        className="pl-10 pr-4 py-2 bg-surface-alt border border-border text-[10px] font-extrabold uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 w-full"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-surface-alt border border-border p-1">
                        {['All', 'Paid', 'Unpaid'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => alert('Calendar selection opening...')} className="px-4 py-2 bg-surface-alt border border-border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-surface border-l-0">
                        <Calendar className="w-4 h-4" /> Custom Date
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-surface border border-border shadow-sm overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-surface-alt/50 border-b border-border text-center">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-left">Invoice No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-left">Client Entity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Transaction Date</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Total Amount</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Protocol Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-surface-alt/30 transition-all group text-center">
                                <td className="px-6 py-4 text-left">
                                    <p className="text-sm font-black text-text uppercase tracking-tight">{inv.id}</p>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center font-black text-[10px] text-text-muted uppercase">
                                            {inv.client[0]}
                                        </div>
                                        <p className="text-sm font-black text-text uppercase tracking-tight">{inv.client}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">{inv.date}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-black text-primary uppercase">{inv.amount}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase border ${inv.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                            inv.status === 'Unpaid' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                                                'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                            }`}>
                                            {inv.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> :
                                                inv.status === 'Unpaid' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {inv.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{inv.method}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleAction('View', inv.id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="View Detail">
                                            <Eye className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                        </button>
                                        <button onClick={() => handleAction('Download', inv.id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="Download">
                                            <Download className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                        </button>
                                        <button onClick={() => handleAction('Options', inv.id)} className="p-2 border border-border hover:bg-surface-alt transition-all group" title="Options">
                                            <MoreVertical className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center">
                                    <div className="opacity-20 flex flex-col items-center">
                                        <FileText className="w-10 h-10 mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Archive slice not found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic opacity-60">Viewing {filteredInvoices.length} of {invoices.length} records</p>
                <div className="flex border border-border">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt border-r border-border disabled:opacity-30" disabled={currentPage === 1}>Prev</button>
                    <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white">1</button>
                    <button onClick={() => alert('Accessing subsequent archive pages...')} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt border-r border-border">2</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-surface-alt">Next</button>
                </div>
            </div>
            {/* Modals Interface */}
            {isPreviewOpen && selectedInvoice && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-surface border border-border w-full max-w-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-5 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> INVOICE PREVIEW: {selectedInvoice.id}
                            </h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-surface-alt transition-all">
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>
                        <div className="p-12 space-y-8 bg-white text-black font-mono">
                            <div className="flex justify-between items-start border-b-2 border-black pb-8">
                                <div>
                                    <h2 className="text-2xl font-black uppercase">SALON CRM PROTOCOL</h2>
                                    <p className="text-[10px] font-bold">ARC-9021 GATEWAY TERMINAL</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase">DATE: {selectedInvoice.date}</p>
                                    <p className="text-[10px] font-black uppercase">STATUS: {selectedInvoice.status}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">CLIENT ENTITY:</span>
                                    <span>{selectedInvoice.client}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold">SETTLEMENT METHOD:</span>
                                    <span>{selectedInvoice.method}</span>
                                </div>
                            </div>
                            <div className="border-t border-black pt-4">
                                <div className="flex justify-between text-xl font-black">
                                    <span>NET PAYABLE:</span>
                                    <span>{selectedInvoice.amount}</span>
                                </div>
                            </div>
                            <p className="text-[8px] text-center pt-8 opacity-40">*** THIS IS A DIGITALLY AUTHORIZED FISCAL DOCUMENT ***</p>
                            <div className="flex gap-4 pt-8 no-print justify-center">
                                <button onClick={() => { window.print(); }} className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">PRINT HARDCOPY</button>
                                <button onClick={() => setIsPreviewOpen(false)} className="px-6 py-2 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black/5">CLOSE PREVIEW</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
