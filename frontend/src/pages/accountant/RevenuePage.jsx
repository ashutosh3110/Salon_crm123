import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Filter, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import mockApi from '../../services/mock/mockApi';

export default function RevenuePage() {
    const [revenue, setRevenue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All Revenue');

    useEffect(() => {
        const loadRevenue = async () => {
            try {
                setLoading(true);
                const res = await mockApi.get('/finance/revenue');
                setRevenue(res.data.data || []);
            } catch (e) {
                console.error('Failed to load revenue');
            } finally {
                setLoading(false);
            }
        };
        loadRevenue();
    }, []);

    const totalRevenueSum = revenue.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalTaxSum = revenue.reduce((acc, curr) => acc + (curr.tax || 0), 0);
    const avgTrans = revenue.length > 0 ? (totalRevenueSum / revenue.length) : 0;

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenueSum.toLocaleString()}`, change: '+0%', isPositive: true },
        { label: 'Avg. Transaction', value: `₹${avgTrans.toFixed(0).toLocaleString()}`, change: '+0%', isPositive: true },
        { label: 'Tax Collected', value: `₹${totalTaxSum.toLocaleString()}`, change: '+0%', isPositive: true },
        { label: 'Online Sales', value: `₹${revenue.filter(r => r.paymentMethod === 'online').reduce((s, c) => s + (c.total || 0), 0).toLocaleString()}`, change: '+0%', isPositive: true },
    ];

    const filteredData = useMemo(() => {
        return revenue.filter(item => {
            if (activeFilter === 'All Revenue') return true;
            
            const itemTypes = item.items?.map(i => i.type.toLowerCase()) || [];
            
            if (activeFilter === 'Service Sales') {
                return itemTypes.includes('service');
            }
            if (activeFilter === 'Product Sales') {
                return itemTypes.includes('product');
            }
            if (activeFilter === 'Memberships') {
                return item.items?.some(i => i.name?.toLowerCase().includes('membership'));
            }
            return true; 
        });
    }, [revenue, activeFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Analyzing Revenue Stream...</p>
                </div>
            </div>
        );
    }



    const handleExport = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("SALON REVENUE REPORT", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${timestamp}`, 14, 30);
        doc.text(`Filter Applied: ${activeFilter}`, 14, 35);

        // Stats Summary Box
        doc.setDrawColor(230);
        doc.setFillColor(248, 249, 250);
        doc.rect(14, 45, 182, 25, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("TOTAL REVENUE", 20, 52);
        doc.text("TAX COLLECTED", 85, 52);
        doc.text("TRANSACTIONS", 150, 52);

        doc.setFontSize(11);
        doc.setTextColor(40);
        doc.text(`Rs. ${totalRevenueSum.toFixed(2).toLocaleString()}`, 20, 62);
        doc.text(`Rs. ${totalTaxSum.toFixed(2).toLocaleString()}`, 85, 62);
        doc.text(`${filteredData.length}`, 150, 62);

        // Table
        autoTable(doc, {
            startY: 80,
            head: [['Date', 'Description / Client', 'Invoice ID', 'Type', 'Tax', 'Method', 'Total']],
            body: filteredData.map(item => [
                new Date(item.createdAt).toLocaleDateString(),
                item.clientId?.name || 'Walk-in Guest',
                item.invoiceNumber,
                item.items?.[0]?.type?.toUpperCase() || 'SERVICE',
                `Rs. ${(item.tax || 0).toFixed(2)}`,
                (item.paymentMethod || 'CASH').toUpperCase(),
                `Rs. ${(item.total || 0).toFixed(2)}`
            ]),
            styles: { fontSize: 8, font: "helvetica" },
            headStyles: { fillColor: [40, 40, 40] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 80 }
        });

        doc.save(`Revenue_Report_${activeFilter.replace(' ', '_')}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-text tracking-tight uppercase">Revenue Analytics</h1>
                    <p className="text-sm text-text-muted font-medium">Detailed breakdown of income and sales tax</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-all">
                        <Calendar className="w-3.5 h-3.5" /> This Month
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label}
                        className="p-6 bg-surface rounded-none border border-border shadow-sm group hover:border-primary/20 transition-all"
                    >
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-xl font-black text-text tracking-tight group-hover:text-primary transition-colors">{stat.value}</h3>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-none ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Filters */}
            <div className="flex flex-wrap items-center gap-2">
                {['All Revenue', 'Service Sales', 'Product Sales', 'Memberships'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-primary text-white shadow-md' : 'bg-surface border border-border/40 text-text-secondary hover:bg-surface-alt'}`}
                    >
                        {filter}
                    </button>
                ))}
                <div className="flex-1" />
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/40 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-secondary hover:bg-surface-alt transition-colors">
                    <Filter className="w-3.5 h-3.5" /> More Filters
                </button>
            </div>

            {/* Revenue Table */}
            <div className="bg-surface rounded-none border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto text-left">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/40 bg-surface/50">
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Source / Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Tax (GST)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Method</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-left">
                            {filteredData.map((item) => (
                                <tr key={item._id} className="hover:bg-surface-alt/50 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold text-text-secondary">
                                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-text group-hover:text-primary transition-colors">
                                            {item.clientId?.name || 'Walk-in Guest'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] text-text-muted font-medium">{item.invoiceNumber}</p>
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-surface-alt border border-border/20 text-text-muted uppercase tracking-widest rounded">
                                                {(() => {
                                                    const types = Array.from(new Set(item.items?.map(i => i.type.toLowerCase()) || []));
                                                    const isMembership = item.items?.some(i => i.name?.toLowerCase().includes('membership'));
                                                    if (isMembership) return 'MEMBERSHIP';
                                                    if (types.length > 1) return 'MIXED';
                                                    return (types[0] || 'SERVICE').toUpperCase();
                                                })()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">₹{(item.tax || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-background border border-border/10 text-text-secondary uppercase tracking-widest">
                                            {item.paymentMethod || 'CASH'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-none uppercase tracking-tighter ${item.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {item.paymentStatus || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-text">₹{(item.total || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">
                                        No data found for this filter
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
