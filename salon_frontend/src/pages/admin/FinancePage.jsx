import React, { useState, useMemo } from 'react';
import {
    TrendingUp,
    Users,
    FileText,
    DollarSign,
    Wallet,
    ClipboardList,
    Lock,
    Download,
    DownloadCloud,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    PieChart as PieIcon,
    BarChart3,
    Activity
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import FinanceDashboard from '../../components/admin/finance/FinanceDashboard';
import SupplierManager from '../../components/admin/finance/SupplierManager';
import SupplierInvoices from '../../components/admin/finance/SupplierInvoices';
import ExpenseTracker from '../../components/admin/finance/ExpenseTracker';
import CashAndBank from '../../components/admin/finance/CashAndBank';
import TaxReports from '../../components/admin/finance/TaxReports';
import EndOfDay from '../../components/admin/finance/EndOfDay';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancePage({ tab = 'dashboard' }) {
    const activeTab = tab;

    const allocationData = useMemo(() => [
        { name: 'OPERATIONS', value: 45, color: '#3b82f6' },
        { name: 'SUPPLIES', value: 25, color: '#10b981' },
        { name: 'PAYROLL', value: 20, color: '#f59e0b' },
        { name: 'MARKETING', value: 10, color: '#ef4444' }
    ], []);

    const flowData = useMemo(() => [
        { name: 'MON', inflow: 45, outflow: 32 },
        { name: 'TUE', inflow: 52, outflow: 28 },
        { name: 'WED', inflow: 48, outflow: 45 },
        { name: 'THU', inflow: 61, outflow: 30 },
        { name: 'FRI', inflow: 55, outflow: 35 }
    ], []);

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Finances</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Track revenue, expenses and cash position at a glance.</p>
                </div>
                <div className="flex flex-wrap gap-4 text-left font-black">
                    <button className="flex items-center gap-3 bg-surface border border-border px-8 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm">
                        <DownloadCloud className="w-4 h-4" />
                        Export Ledger
                    </button>
                    <button className="flex items-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                        <Calendar className="w-4 h-4" />
                        Choose Period
                    </button>
                </div>
            </div>

            {/* Analytics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left font-black">
                <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-left font-black">
                    <FinanceKPICard title="Gross Inflow" value="₹12.45L" icon={TrendingUp} color="blue" trend="+12.5% MTD" />
                    <FinanceKPICard title="Total Expenses" value="₹2.82L" icon={ArrowDownRight} color="rose" trend="Last 8 days" />
                    <FinanceKPICard title="Liability Load" value="₹84,200" icon={Users} color="orange" trend="3 OVERDUE" />
                    <FinanceKPICard title="Net Liquidity" value="₹9.63L" icon={Activity} color="emerald" trend="77% MARGIN" />
                </div>

                {/* Capital Allocation */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Asset Allocation</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={allocationData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left">
                        {allocationData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flow Velocity */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Flow Velocity</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flowData}>
                                <Bar dataKey="inflow" fill="var(--primary)" radius={0} />
                                <Bar dataKey="outflow" fill="#8B1A2D" radius={0} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Weekly Inflow/Outflow Correlation</div>
                </div>
            </div>

            {/* Main Panel */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[650px] text-left font-black">
                {activeTab === 'dashboard' && <FinanceDashboard />}
                {activeTab === 'suppliers' && <SupplierManager />}
                {activeTab === 'invoices' && <SupplierInvoices />}
                {activeTab === 'expenses' && <ExpenseTracker />}
                {activeTab === 'reconciliation' && <CashAndBank />}
                {activeTab === 'tax' && <TaxReports />}
                {activeTab === 'eod' && <EndOfDay />}
            </div>
        </div>
    );
}

function FinanceKPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'text-primary',
        rose: 'text-rose-500',
        orange: 'text-orange-500',
        emerald: 'text-emerald-500'
    };

    return (
        <div className="bg-surface p-7 rounded-none border border-border shadow-sm hover:shadow-2xl hover:translate-y-[-2px] transition-all group relative overflow-hidden text-left font-black">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10`} />
            <div className="flex justify-between items-start mb-10 text-left font-black">
                <div className={`p-3.5 rounded-none ${colors[color]} border border-current bg-surface shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 font-black" />
                </div>
                <div className="flex flex-col items-end text-left font-black leading-none">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-none border border-current bg-opacity-5 ${color === 'rose' || color === 'orange' ? 'border-rose-500 text-rose-500 bg-rose-500/5' : 'border-emerald-500 text-emerald-500 bg-emerald-500/5'}`}>
                        {trend}
                    </span>
                </div>
            </div>
            <div className="space-y-2 text-left font-black leading-none">
                <h3 className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1 opacity-60">{title}</h3>
                <div className="text-3xl font-black text-text tracking-tighter leading-none">{value}</div>
            </div>
        </div>
    );
}
