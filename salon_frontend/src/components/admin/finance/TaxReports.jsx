import React from 'react';
import { ClipboardList, PieChart, Download, Calendar, ArrowUpRight, FileText, LayoutGrid, List } from 'lucide-react';

const MOCK_GST_DATA = [
    { month: 'March 2024', taxable: 852000, cgst: 76680, sgst: 76680, total: 153360 },
    { month: 'February 2024', taxable: 742000, cgst: 66780, sgst: 66780, total: 133560 },
    { month: 'January 2024', taxable: 910000, cgst: 81900, sgst: 81900, total: 163800 },
];

export default function TaxReports() {
    return (
        <div className="flex flex-col h-full slide-right overflow-y-auto no-scrollbar">
            {/* Context Header */}
            <div className="p-8 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        GST & Tax Reports
                    </h2>
                    <p className="text-sm text-text-secondary mt-1 font-medium">Compliance-ready data for accounting and legal filings.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all shadow-sm">
                        <Calendar className="w-4 h-4" />
                        FY 2024-25
                    </button>
                    <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-emerald-600/30 transition-all scale-active">
                        <Download className="w-4 h-4" />
                        Export GSTR-1
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Visual Split Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <TaxStatCard title="Total GST Collected" value="₹4,50,720" icon={PieChart} color="blue" />
                    <TaxStatCard title="Product GST (18%)" value="₹1,12,680" icon={LayoutGrid} color="purple" />
                    <TaxStatCard title="Service GST (18%)" value="₹3,38,040" icon={List} color="emerald" />
                </div>

                {/* Monthly Table */}
                <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-border bg-surface/10">
                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Monthly Tax Summary</h3>
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-border">
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Period</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Taxable Amount</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">CGST (9%)</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">SGST (9%)</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Total Tax</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_GST_DATA.map((row, i) => (
                                <tr key={i} className="hover:bg-surface/30 transition-colors group cursor-default">
                                    <td className="px-8 py-5">
                                        <span className="font-bold text-text text-sm">{row.month}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-medium text-text-secondary">₹{row.taxable.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right text-text-muted">₹{row.cgst.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right text-text-muted">₹{row.sgst.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="font-bold text-primary">₹{row.total.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
                                            <FileText className="w-3 h-3" />
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Disclaimer Alert */}
                <div className="p-6 bg-surface border border-border rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-text uppercase tracking-widest">Accounting Notice</h4>
                        <p className="text-xs text-text-secondary font-medium italic">GST values are calculated based on registered tax rates for products and services. Always reconcile with bank statements before filing.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaxStatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">+14% YoY</span>
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</h3>
                <div className="text-2xl font-black text-text tracking-tight">{value}</div>
            </div>
        </div>
    );
}
