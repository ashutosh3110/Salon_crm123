import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Download,
    Calendar,
    ChevronDown,
    MapPin,
    Scissors,
    Package,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    PieChart as PieIcon,
    BarChart3,
    Activity,
    Search,
    FileText,
    Percent,
    Building2,
    CalendarDays
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
    CartesianGrid,
    Legend,
    AreaChart,
    Area
} from 'recharts';
import api from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';

const CHART_COLORS = ['#C69A20', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#ec4899'];

export default function OverallReportsPage() {
    const { outlets = [] } = useBusiness();
    const { user } = useAuth();
    const [selectedOutletId, setSelectedOutletId] = useState('all');
    const [dateRange, setDateRange] = useState('month'); // 'today' | 'week' | 'month' | 'all'
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showOutletDropdown, setShowOutletDropdown] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/pos/invoices');
            setInvoices(res.data?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter invoices by date range and selected outlet
    const filteredInvoices = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let dateCutoff = new Date(0); // All time
        if (dateRange === 'today') {
            dateCutoff = startOfDay;
        } else if (dateRange === 'week') {
            const temp = new Date();
            temp.setDate(now.getDate() - 7);
            dateCutoff = temp;
        } else if (dateRange === 'month') {
            const temp = new Date();
            temp.setDate(now.getDate() - 30);
            dateCutoff = temp;
        }

        return invoices.filter(inv => {
            const invDate = new Date(inv.createdAt);
            const matchesDate = invDate >= dateCutoff;
            const matchesOutlet = selectedOutletId === 'all' || String(inv.outletId?._id || inv.outletId) === String(selectedOutletId);
            return matchesDate && matchesMatchesSearch(inv) && matchesOutlet;
        });

        function matchesMatchesSearch(inv) {
            if (!searchTerm.trim()) return true;
            const search = searchTerm.toLowerCase();
            const clientName = inv.customerId?.name || 'walk-in';
            const clientPhone = inv.customerId?.phone || '';
            const invNum = inv.invoiceNumber || '';
            return clientName.toLowerCase().includes(search) || 
                   clientPhone.includes(search) || 
                   invNum.toLowerCase().includes(search);
        }
    }, [invoices, selectedOutletId, dateRange, searchTerm]);

    // Aggregate statistics
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let serviceRevenue = 0;
        let productRevenue = 0;
        let totalDues = 0;
        const uniqueCustomers = new Set();
        const paymentMethods = {};
        const outletMap = {};

        filteredInvoices.forEach(inv => {
            const rev = inv.total || 0;
            totalRevenue += rev;
            totalDues += (inv.dueAmount || 0);

            if (inv.customerId?._id) {
                uniqueCustomers.add(String(inv.customerId._id));
            }

            // Split items
            (inv.items || []).forEach(item => {
                const itemType = String(item.type || 'service').toLowerCase();
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                if (itemType === 'product') {
                    productRevenue += itemTotal;
                } else {
                    serviceRevenue += itemTotal;
                }
            });

            // Payments methods
            (inv.payments || []).forEach(p => {
                const method = String(p.method || 'cash').toLowerCase();
                paymentMethods[method] = (paymentMethods[method] || 0) + (p.amount || 0);
            });

            // Outlet breakdown
            const oId = inv.outletId?._id || inv.outletId || 'unknown';
            const oName = inv.outletId?.name || 'Default Outlet';
            if (!outletMap[oId]) {
                outletMap[oId] = { id: oId, name: oName, revenue: 0, count: 0 };
            }
            outletMap[oId].revenue += rev;
            outletMap[oId].count += 1;
        });

        const invoiceCount = filteredInvoices.length;
        const averageOrderValue = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

        return {
            totalRevenue,
            serviceRevenue,
            productRevenue,
            totalDues,
            uniqueCustomers: uniqueCustomers.size,
            averageOrderValue,
            invoiceCount,
            paymentMethods: Object.entries(paymentMethods).map(([name, value]) => ({ name: name.toUpperCase(), value })),
            outlets: Object.values(outletMap)
        };
    }, [filteredInvoices]);

    // Trend chart data (Grouped by date)
    const trendData = useMemo(() => {
        const groups = {};
        filteredInvoices.forEach(inv => {
            const dateStr = new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!groups[dateStr]) {
                groups[dateStr] = { name: dateStr, revenue: 0, count: 0 };
            }
            groups[dateStr].revenue += (inv.total || 0);
            groups[dateStr].count += 1;
        });

        return Object.values(groups).reverse().slice(-15); // limit to last 15 active days for cleaner layout
    }, [filteredInvoices]);

    const formatCurrency = (val) => {
        return `₹${Math.round(val).toLocaleString('en-IN')}`;
    };

    return (
        <div className="p-6 space-y-6 text-left font-sans text-slate-800 dark:text-slate-100 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent uppercase">
                        Overall Business Report
                    </h1>
                    <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold uppercase tracking-widest mt-1 opacity-80">
                        Detailed Analytics & Performance Summary
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Date Filters */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm shrink-0">
                        {['today', 'week', 'month', 'all'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${
                                    dateRange === range
                                        ? 'bg-amber-500 text-white shadow-sm font-black'
                                        : 'text-slate-650 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    {/* Outlet Dropdown */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
                            className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-600 transition-all shadow-sm"
                        >
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                                {selectedOutletId === 'all'
                                    ? 'All Outlets'
                                    : outlets.find(o => String(o._id) === String(selectedOutletId))?.name || 'Selected Outlet'}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        <AnimatePresence>
                            {showOutletDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        <button
                                            onClick={() => { setSelectedOutletId('all'); setShowOutletDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase transition-colors ${
                                                selectedOutletId === 'all' ? 'bg-amber-500/10 text-amber-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            All Outlets
                                        </button>
                                        {outlets.map(o => (
                                            <button
                                                key={o._id}
                                                onClick={() => { setSelectedOutletId(o._id); setShowOutletDropdown(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase transition-colors ${
                                                    selectedOutletId === o._id ? 'bg-amber-500/10 text-amber-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {o.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={loadData}
                        className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Reload Data"
                    >
                        <Activity className="w-4 h-4 text-amber-500" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-amber-550 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Fetching Report Data...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl">
                    <p className="font-bold">Error loading reports:</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Total Sales"
                            value={formatCurrency(stats.totalRevenue)}
                            icon={DollarSign}
                            color="amber"
                            subtitle={`From ${stats.invoiceCount} Invoices`}
                        />
                        <KPICard
                            title="Service Revenue"
                            value={formatCurrency(stats.serviceRevenue)}
                            icon={Scissors}
                            color="blue"
                            subtitle="Styling, Massage, Face care"
                        />
                        <KPICard
                            title="Product Revenue"
                            value={formatCurrency(stats.productRevenue)}
                            icon={Package}
                            color="emerald"
                            subtitle="Retail items & cosmetics"
                        />
                        <KPICard
                            title="Outstanding Dues"
                            value={formatCurrency(stats.totalDues)}
                            icon={CreditCard}
                            color="rose"
                            subtitle="Unpaid / Credit balances"
                        />
                    </div>

                    {/* Secondary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Average Bill Value</p>
                                <h4 className="text-xl font-bold mt-1">{formatCurrency(stats.averageOrderValue)}</h4>
                            </div>
                            <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Unique Customers</p>
                                <h4 className="text-xl font-bold mt-1">{stats.uniqueCustomers} Visitors</h4>
                            </div>
                            <div className="p-2.5 bg-sky-500/10 rounded-xl">
                                <Users className="w-5 h-5 text-sky-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Invoice Count</p>
                                <h4 className="text-xl font-bold mt-1">{stats.invoiceCount} Bills Generated</h4>
                            </div>
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                <FileText className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart: Revenue Trend */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-col justify-between min-h-[350px]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                                    Revenue Trend
                                </h3>
                                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md font-bold uppercase">
                                    Live Data
                                </span>
                            </div>
                            <div className="flex-1 w-full min-h-[260px]">
                                {trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#C69A20" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#C69A20" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                            <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                                            <Area type="monotone" dataKey="revenue" stroke="#C69A20" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">
                                        No sales trend data available for the selected filters.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pie Chart: Payment Breakdown */}
                        <div className="bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-col justify-between min-h-[350px]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 mb-4">
                                Payment Method Split
                            </h3>
                            <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
                                {stats.paymentMethods.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.paymentMethods}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {stats.paymentMethods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-xs text-slate-400">
                                        No payment method details captured yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Outlet Wise Report Summary Table (when all outlets is selected) */}
                    {selectedOutletId === 'all' && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                                    Outlet Performance Breakdown
                                </h3>
                                <span className="text-xs text-amber-500 font-bold uppercase">All Outlets</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700/50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                            <th className="px-6 py-4">Outlet Name</th>
                                            <th className="px-6 py-4">Invoices</th>
                                            <th className="px-6 py-4">Total Revenue</th>
                                            <th className="px-6 py-4">Average Ticket</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-755">
                                        {stats.outlets.length > 0 ? (
                                            stats.outlets.map((outlet) => (
                                                <tr key={outlet.id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 text-xs font-semibold">
                                                    <td className="px-6 py-4 flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-amber-500" />
                                                        <span className="font-bold">{outlet.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{outlet.count} bills</td>
                                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{formatCurrency(outlet.revenue)}</td>
                                                    <td className="px-6 py-4 text-slate-500">{formatCurrency(outlet.revenue / outlet.count)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-xs text-slate-450 italic">
                                                    No outlet data summary found for selected criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transaction Logs matching filters */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350">
                                Matching Invoices & Transactions
                            </h3>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search customer, bill ID..."
                                    className="w-full bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs font-medium outline-none focus:border-amber-500 transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700/50 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        <th className="px-6 py-4">Invoice No</th>
                                        <th className="px-6 py-4">Client Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-755">
                                    {filteredInvoices.length > 0 ? (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-750/30 text-xs font-semibold">
                                                <td className="px-6 py-4 font-bold text-amber-600">{inv.invoiceNumber}</td>
                                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{inv.customerId?.name || 'Walk-in'}</td>
                                                <td className="px-6 py-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-bold">{formatCurrency(inv.total)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                                        (inv.paymentStatus || '').toLowerCase() === 'paid'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                        {inv.paymentStatus || 'unpaid'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-450 italic">
                                                No matching invoices found.
                                            </td>
                                        </tr>
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

function KPICard({ title, value, icon: Icon, color, subtitle }) {
    const colorStyles = {
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
        blue: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{title}</span>
                <div className={`p-2 rounded-xl border ${colorStyles[color] || colorStyles.amber}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-3">
                <h3 className="text-2xl font-extrabold tracking-tight">{value}</h3>
                <span className="text-[10px] text-slate-500 mt-1 block font-semibold">{subtitle}</span>
            </div>
        </div>
    );
}
