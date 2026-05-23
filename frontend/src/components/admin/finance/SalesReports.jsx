import React, { useState, useEffect, useCallback } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    Download, Filter, Calendar, TrendingUp, Users, Scissors, 
    Sparkles, RefreshCw, ShoppingBag, CreditCard, DollarSign,
    Search, Award, ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle, FileText
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

function formatInr(n) {
    if (n == null || Number.isNaN(Number(n))) return '₹0';
    return `₹${Math.round(Number(n)).toLocaleString('en-IN')}`;
}

export default function SalesReports() {
    const [period, setPeriod] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCustomDates, setShowCustomDates] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [data, setData] = useState(null);

    const loadReportData = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/finance/reports?period=${period}`;
            if (showCustomDates && startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const res = await api.get(url);
            if (res.data?.success) {
                setData(res.data.data);
            } else {
                toast.error('Failed to load reports');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error loading report data');
        } finally {
            setLoading(false);
        }
    }, [period, startDate, endDate, showCustomDates]);

    useEffect(() => {
        loadReportData();
    }, [loadReportData]);

    const handleSeedData = async () => {
        setSeeding(true);
        const toastId = toast.loading('Seeding high-fidelity sales data...');
        try {
            const res = await api.post('/finance/reports/seed-samples');
            if (res.data?.success) {
                toast.success(res.data.message || 'Successfully seeded sample data!', { id: toastId });
                loadReportData();
            } else {
                toast.error('Failed to seed data', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error seeding sample data', { id: toastId });
        } finally {
            setSeeding(false);
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        if (!data || !data.recentInvoices || data.recentInvoices.length === 0) {
            toast.error('No transactions to export');
            return;
        }

        const csvRows = ['Invoice Number,Customer Name,Date,Total Amount,Payment Method,Status'];

        data.recentInvoices.forEach(inv => {
            const dateStr = new Date(inv.createdAt).toLocaleDateString('en-IN');
            const cleanCustomerName = (inv.customerName || '').replace(/"/g, '""');
            csvRows.push(`"${inv.invoiceNumber}","${cleanCustomerName}","${dateStr}",${inv.total},"${inv.paymentMethod}","${inv.status}"`);
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Sales_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Report exported to CSV!');
    };

    // Simple Print Trigger
    const handlePrint = () => {
        window.print();
    };

    const kpis = data?.kpis || {
        totalSales: 0,
        servicesRevenue: 0,
        productsRevenue: 0,
        averageOrderValue: 0,
        invoiceCount: 0
    };

    const recentInvoices = data?.recentInvoices || [];
    const trend = data?.trend || [];
    const services = data?.services || [];
    const products = data?.products || [];
    const staff = data?.staff || [];
    const kpiChanges = data?.kpiChanges || {};

    // Filter recent invoices based on search query
    const filteredInvoices = recentInvoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Distribution data for service vs product donut chart
    const distributionData = [
        { name: 'Services', value: kpis.servicesRevenue },
        { name: 'Products', value: kpis.productsRevenue }
    ].filter(item => item.value > 0);

    return (
        <div className="p-6 space-y-8 animate-reveal text-left font-sans text-text printing:p-0">
            {/* Header controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-surface p-6 border border-border shadow-sm rounded-xl">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-text flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Sales Reports
                    </h2>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Analyze business income, stylist efficiency, and inventory sales performance.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Period selection */}
                    <div className="flex items-center bg-surface-alt border border-border p-1 rounded-lg">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                            <button
                                key={p}
                                onClick={() => {
                                    setPeriod(p);
                                    setShowCustomDates(false);
                                }}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all cursor-pointer ${
                                    period === p && !showCustomDates
                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                        : 'text-text-muted hover:text-text'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowCustomDates(true)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all cursor-pointer ${
                                showCustomDates
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-text-muted hover:text-text'
                                }`}
                        >
                            Custom
                        </button>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={loadReportData}
                        disabled={loading}
                        className="p-2.5 bg-surface border border-border hover:border-primary rounded-lg text-text-muted hover:text-primary transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh Report Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Seed Demo Data Button */}
                  

                    {/* Export Options */}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-text-muted" />
                        CSV Export
                    </button>
                </div>
            </div>

            {/* Custom Dates Expandable */}
            {showCustomDates && (
                <div className="bg-surface border border-border p-4 rounded-xl shadow-sm flex flex-wrap items-end gap-4 animate-reveal">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Start Date</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-surface-alt border border-border rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">End Date</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-surface-alt border border-border rounded-lg px-4 py-2 text-xs font-bold outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                    <button
                        onClick={loadReportData}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all cursor-pointer"
                    >
                        Apply Dates
                    </button>
                </div>
            )}

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard 
                    title="Total Revenue" 
                    value={loading ? '...' : formatInr(kpis.totalSales)}
                    icon={DollarSign}
                    gradient="from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20"
                    changePercent={kpiChanges.totalSales}
                    badgeText={kpiChanges.totalSales != null
                        ? `${kpiChanges.totalSales > 0 ? '+' : ''}${kpiChanges.totalSales}% vs prev period`
                        : 'Revenue this period'}
                />
                <KPICard 
                    title="Services Revenue" 
                    value={loading ? '...' : formatInr(kpis.servicesRevenue)}
                    icon={Scissors}
                    gradient="from-indigo-500/10 to-blue-500/10 text-indigo-500 border-indigo-500/20"
                    changePercent={kpiChanges.servicesRevenue}
                    badgeText={kpiChanges.servicesRevenue != null
                        ? `${kpiChanges.servicesRevenue > 0 ? '+' : ''}${kpiChanges.servicesRevenue}% vs prev period`
                        : `${kpis.totalSales > 0 ? Math.round((kpis.servicesRevenue / kpis.totalSales) * 100) : 0}% of revenue`}
                />
                <KPICard 
                    title="Products Revenue" 
                    value={loading ? '...' : formatInr(kpis.productsRevenue)}
                    icon={ShoppingBag}
                    gradient="from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20"
                    changePercent={kpiChanges.productsRevenue}
                    badgeText={kpiChanges.productsRevenue != null
                        ? `${kpiChanges.productsRevenue > 0 ? '+' : ''}${kpiChanges.productsRevenue}% vs prev period`
                        : `${kpis.totalSales > 0 ? Math.round((kpis.productsRevenue / kpis.totalSales) * 100) : 0}% of revenue`}
                />
                <KPICard 
                    title="Avg Invoice Total" 
                    value={loading ? '...' : formatInr(kpis.averageOrderValue)}
                    icon={CreditCard}
                    gradient="from-cyan-500/10 to-sky-500/10 text-cyan-500 border-cyan-500/20"
                    changePercent={kpiChanges.averageOrderValue}
                    badgeText={kpiChanges.averageOrderValue != null
                        ? `${kpiChanges.averageOrderValue > 0 ? '+' : ''}${kpiChanges.averageOrderValue}% vs prev period`
                        : 'Per transaction average'}
                />
                <KPICard 
                    title="Total Invoices" 
                    value={loading ? '...' : kpis.invoiceCount}
                    icon={Users}
                    gradient="from-rose-500/10 to-pink-500/10 text-rose-500 border-rose-500/20"
                    changePercent={kpiChanges.invoiceCount}
                    badgeText={kpiChanges.invoiceCount != null
                        ? `${kpiChanges.invoiceCount > 0 ? '+' : ''}${kpiChanges.invoiceCount}% vs prev period`
                        : 'Total bills issued'}
                />
            </div>

            {/* Main reports grid */}
            {kpis.invoiceCount === 0 && !loading ? (
                <div className="bg-surface border border-border p-12 text-center rounded-2xl shadow-sm max-w-xl mx-auto space-y-6">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tight">No Sales Invoices Found</h3>
                        <p className="text-xs text-text-muted font-medium leading-relaxed">
                            There are currently no invoice records for this date range in the database. To test all dynamic charts, performance stats, and exports, click the button below to instantly populate your workspace with 35 realistic sample invoices.
                        </p>
                    </div>
                    <button
                        onClick={handleSeedData}
                        disabled={seeding}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        <PlusCircle className="w-4 h-4" />
                        {seeding ? 'Generating Invoices...' : 'Generate Sample Data'}
                    </button>
                </div>
            ) : (
                <>
                    {/* Charts row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend Area Chart */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-text">Revenue Trend</h3>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-wider">
                                        Gross income timeline over the selected period
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-text tracking-tighter">{formatInr(kpis.totalSales)}</span>
                                    <div className="flex items-center justify-end gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-wider mt-0.5">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>Live dynamic data</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="h-[320px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trend}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 9, fontWeight: 800, fill: 'var(--text-muted)'}}
                                            dy={8}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fontSize: 9, fontWeight: 800, fill: 'var(--text-muted)'}}
                                            tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                        />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontFamily: 'sans-serif',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value) => [formatInr(value), 'Revenue']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="var(--primary)" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Service vs Product Distribution Donut Chart */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text mb-1">Sales Mix</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-6">
                                    Distribution between services and products
                                </p>
                            </div>
                            
                            <div className="h-[200px] w-full relative flex items-center justify-center">
                                {distributionData.length === 0 ? (
                                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">No sales records</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: 'var(--surface)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    fontSize: '10px'
                                                }}
                                                formatter={(value) => [formatInr(value), 'Sales']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="space-y-3 mt-4">
                                {distributionData.map((item, index) => {
                                    const percent = kpis.totalSales > 0 ? Math.round((item.value / kpis.totalSales) * 100) : 0;
                                    return (
                                        <div key={item.name} className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                                            <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                                                />
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-extrabold text-text">{formatInr(item.value)}</span>
                                                <span className="text-[10px] font-black text-text-muted ml-2">({percent}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Rankings row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Service Wise Revenue */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-500">
                                    <Scissors className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text">Top Services</h3>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Top revenue generating services</p>
                                </div>
                            </div>

                            {services.length === 0 ? (
                                <div className="py-12 text-center text-xs text-text-muted font-bold uppercase tracking-widest">No service records</div>
                            ) : (
                                <div className="space-y-4">
                                    {services.map((svc, i) => {
                                        const maxVal = services[0]?.value || 1;
                                        const percent = Math.round((svc.value / maxVal) * 100);
                                        return (
                                            <div key={svc.name} className="space-y-1 text-xs">
                                                <div className="flex justify-between items-center font-bold">
                                                    <span className="uppercase tracking-wide font-extrabold line-clamp-1 max-w-[70%]">{svc.name}</span>
                                                    <span className="font-extrabold text-text">{formatInr(svc.value)}</span>
                                                </div>
                                                <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-border/30">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Product Wise Revenue */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text">Top Products</h3>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Top product retail items sold</p>
                                </div>
                            </div>

                            {products.length === 0 ? (
                                <div className="py-12 text-center text-xs text-text-muted font-bold uppercase tracking-widest">No product records</div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map((prod, i) => {
                                        const maxVal = products[0]?.value || 1;
                                        const percent = Math.round((prod.value / maxVal) * 100);
                                        return (
                                            <div key={prod.name} className="space-y-1 text-xs">
                                                <div className="flex justify-between items-center font-bold">
                                                    <span className="uppercase tracking-wide font-extrabold line-clamp-1 max-w-[70%]">{prod.name}</span>
                                                    <span className="font-extrabold text-text">{formatInr(prod.value)}</span>
                                                </div>
                                                <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-border/30">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Staff Contribution */}
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-500">
                                    <Award className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text">Top Stylists</h3>
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Revenue credit per salon stylist</p>
                                </div>
                            </div>

                            {staff.length === 0 ? (
                                <div className="py-12 text-center text-xs text-text-muted font-bold uppercase tracking-widest">No stylist performance records</div>
                            ) : (
                                <div className="space-y-4">
                                    {staff.map((st, i) => {
                                        const maxVal = staff[0]?.value || 1;
                                        const percent = Math.round((st.value / maxVal) * 100);
                                        return (
                                            <div key={st.name} className="space-y-1 text-xs">
                                                <div className="flex justify-between items-center font-bold">
                                                    <span className="uppercase tracking-wide font-extrabold">{st.name}</span>
                                                    <span className="font-extrabold text-text">{formatInr(st.value)}</span>
                                                </div>
                                                <div className="w-full bg-surface-alt h-2 rounded-full overflow-hidden border border-border/30">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sales Transaction List */}
                    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-text">Recent Invoices</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                                    Transactions contributing to this report date range
                                </p>
                            </div>
                            
                            <div className="relative max-w-md w-full md:w-64">
                                <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search invoice number or customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-surface-alt border border-border rounded-lg pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-primary transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-text">
                                <thead className="bg-surface-alt border-b border-border/60 text-[9px] font-black uppercase tracking-widest text-text-muted">
                                    <tr>
                                        <th className="px-6 py-4">Invoice #</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-xs text-text-muted uppercase tracking-widest font-black">
                                                No invoices matched your query
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv._id} className="hover:bg-surface-alt/40 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold tracking-tight text-primary">
                                                    {inv.invoiceNumber}
                                                </td>
                                                <td className="px-6 py-4 font-extrabold uppercase tracking-wide">
                                                    {inv.customerName}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-text-muted">
                                                    {new Date(inv.createdAt).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                                        inv.paymentMethod === 'cash' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                        inv.paymentMethod === 'card' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                                                        inv.paymentMethod === 'online' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-600 border-slate-500/20'
                                                    }`}>
                                                        {inv.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                                        inv.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                        inv.status === 'refunded' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                        'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                    }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-extrabold text-right text-text">
                                                    {formatInr(inv.total)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function KPICard({ title, value, icon: Icon, gradient, changePercent, badgeText }) {
    const isNeutral = changePercent == null;
    const isPositive = isNeutral || changePercent >= 0;
    return (
        <div className={`bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden relative group`}>
            {/* Soft decorative background shape */}
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-primary/5 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg border ${gradient}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted leading-tight text-right">
                    Live
                </span>
            </div>
            
            <div className="space-y-1 mt-2">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-70">
                    {title}
                </h4>
                <div className="text-xl font-black text-text tracking-tighter tabular-nums">
                    {value}
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-wide mt-1 flex items-center gap-1 ${
                    isNeutral ? 'text-text-muted' : isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                    {(!isNeutral && !isPositive)
                        ? <ArrowDownRight className="w-3 h-3 shrink-0" />
                        : <ArrowUpRight className="w-3 h-3 shrink-0" />
                    }
                    {badgeText}
                </p>
            </div>
        </div>
    );
}
