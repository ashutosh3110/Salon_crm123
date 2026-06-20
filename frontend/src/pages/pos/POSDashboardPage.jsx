import React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, Receipt, TrendingUp, Wallet,
    Banknote, CreditCard, Smartphone, Ban,
    Clock, ArrowRight, Zap, ShoppingCart, Users,
    AlertTriangle, Calendar, Printer, Package, RefreshCcw, X,
    Store, ChevronDown, ChevronRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useBusiness } from '../../contexts/BusinessContext';
import api from '../../services/api';

export default function POSDashboardPage() {
    const navigate = useNavigate();
    const [showAppointments, setShowAppointments] = useState(false);
    const [showStockAlert, setShowStockAlert] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { products, bookings, activeOutletId, setActiveOutletId, outlets, fetchProducts, fetchBookings, salon } = useBusiness();
    const [refreshing, setRefreshing] = useState(false);
    const [range, setRange] = useState('today');
    const lastLoadedRef = useRef({ outletId: null, salonId: null, range: null });
    const loadDashboard = async (selectedRange = range) => {
        try {
            setLoading(true);
            const response = await api.get('/pos/dashboard', {
                params: { outletId: activeOutletId, range: selectedRange }
            });
            if (response.data?.success) {
                setDashboardData(response.data.data);
                setInvoices(response.data.data.recentInvoices || []);
            }
        } catch (error) {
            console.error('[POSDashboard] Failed to load dashboard:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Prevent redundant loads if IDs and range haven't changed
        if (
            lastLoadedRef.current.outletId === activeOutletId && 
            lastLoadedRef.current.salonId === salon?._id &&
            lastLoadedRef.current.range === range
        ) {
            return;
        }

        loadDashboard(range);
        // Also ensure bookings for this outlet are fresh
        if (salon?._id) {
            fetchBookings?.();
        }
        
        lastLoadedRef.current = { outletId: activeOutletId, salonId: salon?._id, range };
    }, [activeOutletId, salon?._id, range]);

    useEffect(() => {
        if (showAppointments) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [showAppointments]);

    const rangeLabel = {
        today: "Today",
        yesterday: "Yesterday",
        '7days': "7 Days",
        '30days': "30 Days"
    }[range] || "Today";

    const lowStockItems = useMemo(() => {
        return (products || []).filter((p) => {
            const stock = Number(p.stock ?? p.quantity ?? 0);
            const threshold = Number(p.lowStockLevel ?? p.minStock ?? 0);
            return threshold > 0 && stock <= threshold;
        });
    }, [products]);

    const appointments = useMemo(() => {
        const list = Array.isArray(bookings) ? bookings : [];
        return list.slice(0, 8).map((b) => ({
            _id: b._id || b.id,
            time: b.appointmentDate
                ? new Date(b.appointmentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                : (b.time || 'Scheduled'),
            clientName: b.clientId?.name || b.clientName || 'Guest',
            service: b.serviceId?.name || b.service || 'Service',
        }));
    }, [bookings]);

    const stats = useMemo(() => {
        if (dashboardData?.stats) return dashboardData.stats;
        return { revenue: 0, count: 0, avgBill: 0, unpaidCount: 0 };
    }, [dashboardData]);

    const paymentBreakdown = useMemo(() => {
        if (dashboardData?.breakdown) return dashboardData.breakdown;
        return [
            { name: 'Cash', value: 0, icon: Banknote, color: '#10b981' },
            { name: 'Card', value: 0, icon: CreditCard, color: '#3b82f6' },
            { name: 'UPI', value: 0, icon: Smartphone, color: '#8b5cf6' },
            { name: 'Unpaid', value: 0, icon: Ban, color: '#f59e0b' },
        ];
    }, [dashboardData]);

    const formatTime = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const statCards = [
        { 
            label: `${rangeLabel.toUpperCase()}'S REVENUE`, 
            value: `₹${stats.revenue.toLocaleString()}`, 
            icon: DollarSign, 
            trend: 'LIVE', 
            positive: true, 
            iconBg: 'bg-indigo-50 dark:bg-indigo-950/40', 
            iconColor: 'text-indigo-600 dark:text-indigo-400', 
            trendColor: '!text-emerald-700 dark:!text-emerald-400 !bg-emerald-50 dark:!bg-emerald-950/40 !border !border-emerald-200/50 dark:!border-emerald-900/30' 
        },
        { 
            label: 'TOTAL INVOICES', 
            value: stats.count, 
            icon: Receipt, 
            trend: 'REAL-TIME', 
            positive: true, 
            iconBg: 'bg-blue-50 dark:bg-blue-950/40', 
            iconColor: 'text-blue-500 dark:text-blue-400', 
            trendColor: '!text-emerald-700 dark:!text-emerald-400 !bg-emerald-50 dark:!bg-emerald-950/40 !border !border-emerald-200/50 dark:!border-emerald-900/30' 
        },
        { 
            label: 'UNPAID BILLS', 
            value: stats.unpaidCount, 
            icon: Clock, 
            trend: 'ACTION REQ', 
            positive: false, 
            iconBg: 'bg-orange-50 dark:bg-orange-950/40', 
            iconColor: 'text-orange-500 dark:text-orange-400', 
            trendColor: '!text-rose-700 dark:!text-rose-400 !bg-rose-50 dark:!bg-rose-950/40 !border !border-rose-200/50 dark:!border-rose-900/30' 
        },
        { 
            label: 'AVG. TICKET', 
            value: `₹${stats.avgBill.toLocaleString()}`, 
            icon: TrendingUp, 
            trend: 'CALCULATED', 
            positive: true, 
            iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', 
            iconColor: 'text-emerald-500 dark:text-emerald-400', 
            trendColor: '!text-emerald-700 dark:!text-emerald-400 !bg-emerald-50 dark:!bg-emerald-950/40 !border !border-emerald-200/50 dark:!border-emerald-900/30' 
        },
    ];

    const quickActions = [
        { label: 'New Bill', icon: Zap, path: '/pos/billing', color: 'bg-primary text-white' },
        { label: 'Appointments', icon: Calendar, onClick: () => setShowAppointments(true), color: 'bg-blue-600 text-white' },
        { label: 'Invoices', icon: Printer, path: '/pos/invoices', color: 'bg-slate-800 text-white' },
        { label: 'Packages', icon: Package, path: '/pos/billing', color: 'bg-purple-600 text-white' },
    ];

    return (
        <div className="space-y-6 animate-reveal pb-10 text-left font-black bg-slate-50/50 dark:bg-[#121826] min-h-screen">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight flex items-center gap-3">POS Dashboard</h1>
                    <p className="text-[11px] font-black text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        LIVE OVERVIEW • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Store className="w-4 h-4 text-text-muted" />
                        </div>
                        <select
                            value={activeOutletId || ''}
                            onChange={(e) => setActiveOutletId(e.target.value)}
                            className="pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-lg text-[11px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer appearance-none min-w-[240px] shadow-sm text-text"
                        >
                            <option value="">All Outlets</option>
                            {(outlets || []).map(o => (
                                <option key={o._id} value={o._id}>{o.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                        </div>
                    </div>
                    <button 
                        onClick={() => { setRefreshing(true); loadDashboard(); }} 
                        className={`p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm ${refreshing ? 'animate-spin text-primary' : 'text-text-muted'}`}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate('/pos/billing')} className="px-6 py-3 !bg-[#cca839] !text-slate-950 rounded-lg font-black text-[11px] uppercase tracking-widest hover:!bg-[#b59533] transition-all flex items-center gap-2 shadow-sm border-b-2 border-black/10">
                        <Zap className="w-4 h-4 !text-[#0f172a] !stroke-[#0f172a]" /> <span className="!text-slate-950">CREATE BILL</span>
                    </button>
                </div>
            </div>

            {/* Threshold Alerts */}
            {lowStockItems.length > 0 && showStockAlert && (
                <div className="bg-[#FFF8ED] dark:bg-amber-950/20 border border-[#FDEBCE] dark:border-amber-900/30 rounded-lg p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <div>
                            <p className="text-[12px] font-black text-text uppercase tracking-[0.2em] leading-none">LOW STOCK ALERT</p>
                            <p className="text-[10px] font-black text-text-muted mt-2 tracking-widest uppercase leading-none">{lowStockItems.length} products are low in stock</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/admin/inventory/stock-overview')} 
                            className="text-[10px] font-black bg-[#9C4A28] text-white uppercase tracking-widest px-5 py-2.5 rounded-lg hover:bg-[#7D3A1F] transition-all shadow-sm"
                        >
                            CHECK STOCK
                        </button>
                        <button onClick={() => setShowStockAlert(false)} className="p-1.5 hover:bg-orange-100/50 dark:hover:bg-amber-950/40 border border-[#FDEBCE] dark:border-amber-900/30 rounded text-text-muted transition-colors bg-white/50 dark:bg-transparent">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.iconBg}`}>
                                    <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <p className="text-[11px] font-black text-text uppercase tracking-widest">{s.label}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${s.trendColor}`}>
                                            {s.trend}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-text uppercase tracking-tight leading-none mt-2">{s.value}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-between items-center px-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">vs Yesterday ₹0</span>
                            <span className="text-[11px] font-black text-slate-400">--</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-black">
                {/* Visual Analytics */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[12px] font-black text-text tracking-[0.2em] uppercase">PAYMENT SUMMARY</h3>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{rangeLabel.toUpperCase()}'S PAYMENT COLLECTION BY METHOD</p>
                        </div>
                        <div className="flex gap-6 items-center">
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest text-text">CASH</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-purple-500"/><span className="text-[10px] font-black uppercase tracking-widest text-text">UPI</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500"/><span className="text-[10px] font-black uppercase tracking-widest text-text">UNPAID</span></div>
                            </div>
                            <div className="relative group">
                                <select
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    className="pl-4 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer appearance-none min-w-[120px] shadow-sm text-text"
                                >
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="7days">7 Days</option>
                                    <option value="30days">30 Days</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[200px] w-full mt-2 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { name: 'Cash', value: paymentBreakdown.find(p=>p.name==='Cash')?.value||0 },
                                { name: 'UPI', value: paymentBreakdown.find(p=>p.name==='UPI')?.value||0 },
                                { name: 'Unpaid', value: paymentBreakdown.find(p=>p.name==='Unpaid')?.value||0 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={{stroke: '#e2e8f0'}} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6', stroke: 'none', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#8b5cf6', stroke: 'none', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 mt-12 pt-6 border-t border-slate-100 divide-x divide-slate-100 relative">
                        <div className="flex items-center gap-4 px-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 shrink-0"><DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400"/></div>
                            <div className="flex flex-col justify-center">
                                <p className="text-base font-black text-text">₹{paymentBreakdown.find(p=>p.name==='Cash')?.value||0}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">CASH COLLECTED</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 absolute right-0 -mr-2 opacity-50" />
                        </div>
                        <div className="flex items-center gap-4 px-6 relative">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center border border-purple-100 dark:border-purple-900/30 shrink-0"><Smartphone className="w-5 h-5 text-purple-500 dark:text-purple-400"/></div>
                            <div className="flex flex-col justify-center">
                                <p className="text-base font-black text-text">₹{paymentBreakdown.find(p=>p.name==='UPI')?.value||0}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">UPI COLLECTED</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 absolute right-0 -mr-2 opacity-50" />
                        </div>
                        <div className="flex items-center gap-4 px-6 relative">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/30 shrink-0"><Receipt className="w-5 h-5 text-orange-500 dark:text-orange-400"/></div>
                            <div className="flex flex-col justify-center">
                                <p className="text-base font-black text-text">₹{paymentBreakdown.find(p=>p.name==='Unpaid')?.value||0}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">UNPAID AMOUNT</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 absolute right-0 -mr-2 opacity-50" />
                        </div>
                        <div className="flex items-center gap-4 px-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shrink-0"><RefreshCcw className="w-5 h-5 text-blue-500 dark:text-blue-400"/></div>
                            <div className="flex flex-col justify-center">
                                <p className="text-base font-black text-text">{stats.count||0}</p>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">TRANSACTIONS</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                        <h3 className="text-[12px] font-black text-text uppercase tracking-widest mb-4">COLLECTIONS SPLIT</h3>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                        {paymentBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={stats.revenue === 0 ? '#f1f5f9' : entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-2xl font-black text-text uppercase">₹{Math.round(stats.revenue/1000)}K</p>
                                <p className="text-[10px] font-black text-text uppercase tracking-widest mt-1">{rangeLabel.toUpperCase()} TOTAL</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 flex flex-col h-[200px]">
                        <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] mb-4">QUICK ACTIONS</h3>
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <button onClick={() => navigate('/pos/billing')} className="!bg-[#cca839] hover:!bg-[#b59533] transition-colors rounded-lg border-b-2 border-black/20 flex items-center justify-center gap-3 !text-slate-950 shadow-sm h-full">
                                <Receipt className="w-5 h-5 !text-[#0f172a] !stroke-[#0f172a]" /> <span className="text-[11px] font-black uppercase tracking-widest pt-0.5 !text-slate-950">NEW BILL</span>
                            </button>
                            <button onClick={() => setShowAppointments(true)} className="!bg-[#cca839] hover:!bg-[#b59533] transition-colors rounded-lg border-b-2 border-black/20 flex items-center justify-center gap-3 !text-slate-950 shadow-sm h-full">
                                <Calendar className="w-5 h-5 !text-[#0f172a] !stroke-[#0f172a]" /> <span className="text-[11px] font-black uppercase tracking-widest pt-0.5 !text-slate-950">APPOINTMENTS</span>
                            </button>
                            <button onClick={() => navigate('/pos/invoices')} className="!bg-[#cca839] hover:!bg-[#b59533] transition-colors rounded-lg border-b-2 border-black/20 flex items-center justify-center gap-3 !text-slate-950 shadow-sm h-full">
                                <Printer className="w-5 h-5 !text-[#0f172a] !stroke-[#0f172a]" /> <span className="text-[11px] font-black uppercase tracking-widest pt-0.5 !text-slate-950">INVOICES</span>
                            </button>
                            <button onClick={() => navigate('/pos/billing')} className="!bg-[#cca839] hover:!bg-[#b59533] transition-colors rounded-lg border-b-2 border-black/20 flex items-center justify-center gap-3 !text-slate-950 shadow-sm h-full">
                                <Package className="w-5 h-5 !text-[#0f172a] !stroke-[#0f172a]" /> <span className="text-[11px] font-black uppercase tracking-widest pt-0.5 !text-slate-950">PACKAGES</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col mb-4">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[12px] font-black text-text tracking-[0.2em] uppercase flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-text-muted" /> RECENT INVOICES
                    </h3>
                    <button onClick={() => navigate('/pos/invoices')} className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-1.5 hover:text-text">
                        VIEW ALL <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto min-h-[160px]">
                    <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                            <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-left">
                                <th className="px-6 py-3 font-black">INVOICE</th>
                                <th className="px-6 py-3 font-black text-center">TIME</th>
                                <th className="px-6 py-3 font-black text-center">CUSTOMER</th>
                                <th className="px-6 py-3 font-black text-center">PAYMENT METHOD</th>
                                <th className="px-6 py-3 font-black text-right">AMOUNT</th>
                                <th className="px-6 py-3 font-black text-right pr-12">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <Package className="w-10 h-10 mx-auto text-slate-200 mb-3" strokeWidth={1.5} />
                                        <p className="text-[12px] uppercase tracking-widest text-text font-black">No invoices found for today</p>
                                        <p className="text-[10px] mt-1 tracking-widest uppercase">Create a new bill to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.slice(0, 5).map(inv => (
                                    <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-[11px] font-black text-text uppercase tracking-widest">{inv.invoiceNumber || '--'}</td>
                                        <td className="px-6 py-4 text-center text-[11px] font-black text-text-muted uppercase tracking-widest">{formatTime(inv.createdAt)}</td>
                                        <td className="px-6 py-4 text-center text-[11px] font-black text-text uppercase tracking-widest">{inv.clientId?.name || inv.clientName || 'GUEST'}</td>
                                        <td className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{inv.paymentMethod || 'CASH'}</td>
                                        <td className="px-6 py-4 text-right text-[11px] font-black text-text tracking-widest">₹{Number(inv.total || inv.totalAmount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right pr-12">
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 rounded px-2 py-1 uppercase tracking-widest w-fit">PAID</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Appointments Modal */}
            {showAppointments && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-0 border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments
                            </h3>
                            <button onClick={() => setShowAppointments(false)} className="w-8 h-8 rounded border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                <X className="w-4 h-4 text-slate-400 hover:text-text" />
                            </button>
                        </div>
                        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-none bg-slate-50/50 text-left">
                            {appointments.map(app => (
                                <div key={app._id} className="p-4 bg-white border border-slate-100 rounded-lg flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded border border-slate-100 flex flex-col items-center justify-center text-[10px] font-black text-primary leading-tight">
                                            <span className="opacity-40 text-[8px] mb-0.5 tracking-widest">TIME</span>
                                            {app.time.split(' ')[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-text uppercase tracking-tight">{app.clientName}</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{app.service}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { navigate('/pos/billing'); setShowAppointments(false); }} className="px-4 py-2 bg-[#C69A20] text-white rounded text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-[#B38918] transition-colors">
                                        Start Bill
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
                            <button onClick={() => setShowAppointments(false)} className="px-6 py-2 text-[10px] rounded border border-slate-200 font-black text-slate-500 uppercase tracking-widest hover:text-text hover:bg-slate-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
