import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, Receipt, TrendingUp, Wallet,
    Banknote, CreditCard, Smartphone, Ban,
    Clock, ArrowRight, Zap, ShoppingCart, Users,
    AlertTriangle, Calendar, Printer, Package, RefreshCcw, X
} from 'lucide-react';
import { MOCK_INVOICES, MOCK_PRODUCTS, MOCK_APPOINTMENTS } from '../../data/posData';

export default function POSDashboardPage() {
    const navigate = useNavigate();
    const [showAppointments, setShowAppointments] = useState(false);

    // Data Logic
    const invoices = MOCK_INVOICES;
    const lowStockItems = MOCK_PRODUCTS.filter(p => p.stock <= p.lowStockLevel);
    const appointments = MOCK_APPOINTMENTS;

    const todayInvoices = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return invoices.filter(inv => inv.createdAt?.startsWith(today));
    }, [invoices]);

    const stats = useMemo(() => {
        const revenue = todayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const count = todayInvoices.length;
        const avgBill = count > 0 ? Math.round(revenue / count) : 0;
        const unpaidCount = todayInvoices.filter(i => i.paymentStatus === 'unpaid').length;
        return { revenue, count, avgBill, unpaidCount };
    }, [todayInvoices]);

    const paymentBreakdown = useMemo(() => {
        const breakdown = { cash: 0, card: 0, online: 0, unpaid: 0 };
        todayInvoices.forEach(inv => {
            const m = inv.paymentMethod || 'cash';
            if (breakdown[m] !== undefined) breakdown[m] += inv.total || 0;
        });
        return [
            { label: 'Cash', value: breakdown.cash, icon: Banknote, color: 'text-green-600 bg-green-50' },
            { label: 'Card', value: breakdown.card, icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
            { label: 'UPI', value: breakdown.online, icon: Smartphone, color: 'text-purple-600 bg-purple-50' },
            { label: 'Unpaid', value: breakdown.unpaid, icon: Ban, color: 'text-orange-600 bg-orange-50' },
        ];
    }, [todayInvoices]);

    const formatTime = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const statCards = [
        { label: "TODAY'S REVENUE", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '↑ 12.5%', trendColor: 'text-emerald-500' },
        { label: 'TOTAL INVOICES', value: stats.count, icon: Receipt, trend: '↑ 3.8%', trendColor: 'text-emerald-500' },
        { label: 'UNPAID BILLS', value: stats.unpaidCount, icon: Clock, trend: '↓ 5.2%', trendColor: 'text-rose-500' },
        { label: 'AVG. TICKET', value: `₹${stats.avgBill.toLocaleString()}`, icon: TrendingUp, trend: '↑ 5.2%', trendColor: 'text-emerald-500' },
    ];

    const quickActions = [
        { label: 'New Bill', icon: Zap, path: '/pos/billing', color: 'bg-primary text-white' },
        { label: 'Appointments', icon: Calendar, onClick: () => setShowAppointments(true), color: 'bg-blue-600 text-white' },
        { label: 'Invoices', icon: Printer, path: '/pos/invoices', color: 'bg-slate-800 text-white' },
        { label: 'Packages', icon: Package, path: '/pos/billing', color: 'bg-purple-600 text-white' },
    ];

    const Sparkline = () => (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400">
            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Today Summary</h1>
                    <p className="text-sm text-text-secondary mt-1">Reception terminal overview for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/pos/refunds')} className="px-4 py-2.5 bg-surface border border-border text-text-secondary font-bold text-sm hover:bg-surface-alt transition-all rounded-none shadow-sm flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Refund
                    </button>
                    <button onClick={() => navigate('/pos/billing')} className="px-5 py-2.5 bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all rounded-none shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> New Bill
                    </button>
                </div>
            </div>

            {/* Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-none flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 flex items-center justify-center rounded-none">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">Low Stock Alert</p>
                            <p className="text-xs text-amber-700">{lowStockItems.length} items are running below threshold.</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-amber-800 hover:underline">View All</button>
                </div>
            )}



            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-surface py-4 px-5 rounded-none border border-border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <s.icon className="w-4 h-4 text-text-muted" />
                                <p className="text-[11px] font-extrabold text-text-secondary uppercase tracking-widest">{s.label}</p>
                            </div>
                            <span className={`text-[11px] font-bold ${s.trendColor}`}>{s.trend}</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-extrabold text-text tracking-tight">{s.value}</h3>
                            <div className="-mb-1">
                                <Sparkline />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Mode Breakdown */}
            <div className="bg-surface rounded-none border border-border shadow-sm p-5">
                <h3 className="text-sm font-bold text-text mb-5 uppercase tracking-wider">Payment Mode Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {paymentBreakdown.map((pm, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-none bg-surface-alt border border-border hover:border-text-muted transition-all group">
                            <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${pm.color} bg-background shadow-sm border border-border group-hover:scale-110 transition-transform`}>
                                <pm.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{pm.label}</p>
                                <p className="text-lg font-bold text-text">₹{pm.value.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text tracking-wider uppercase">Recent Invoices</h3>
                    <button
                        onClick={() => navigate('/pos/invoices')}
                        className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                        View All <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="bg-surface-alt text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                <th className="px-5 py-3">Invoice</th>
                                <th className="px-5 py-3">Time</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {invoices.slice(0, 5).map(inv => (
                                <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors text-sm">
                                    <td className="px-5 py-3 font-bold text-primary">{inv.invoiceNumber}</td>
                                    <td className="px-5 py-3 text-text-secondary flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(inv.createdAt)}
                                    </td>
                                    <td className="px-5 py-3 font-medium text-text">{inv.clientId?.name || 'Walk-in'}</td>
                                    <td className="px-5 py-3 text-text-secondary capitalize">
                                        {inv.paymentMethod === 'online' ? 'UPI' : inv.paymentMethod}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold text-text">₹{inv.total?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Appointments Modal */}
            {showAppointments && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-none shadow-2xl p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" /> Today's Appointments
                            </h3>
                            <button onClick={() => setShowAppointments(false)} className="p-2 hover:bg-slate-50 transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {appointments.length === 0 ? (
                                <p className="text-center py-8 text-sm text-slate-500">No appointments for today.</p>
                            ) : (
                                appointments.map(app => (
                                    <div key={app._id} className="p-4 bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-primary">
                                                {app.time}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{app.clientName}</p>
                                                <p className="text-xs text-slate-500">{app.service}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { navigate('/pos/billing'); setShowAppointments(false); }} className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            Checkout
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
