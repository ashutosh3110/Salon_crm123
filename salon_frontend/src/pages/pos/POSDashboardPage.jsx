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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Terminal Overview</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                        Active Session Loop • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/pos/refunds')} className="px-6 py-3 bg-surface border border-border text-text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface-alt transition-all shadow-sm flex items-center gap-3 active:scale-95">
                        <RefreshCcw className="w-4 h-4" /> Auth Refund
                    </button>
                    <button onClick={() => navigate('/pos/billing')} className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95">
                        <Zap className="w-4 h-4" /> Genesis Bill
                    </button>
                </div>
            </div>

            {/* Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-none flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Inventory Threshold Breach</p>
                            <p className="text-[10px] text-amber-700/70 font-bold uppercase tracking-wider mt-1">{lowStockItems.length} SKUs operating at critical levels</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black text-amber-800 uppercase tracking-widest hover:underline px-4 py-2 border border-amber-500/20 active:scale-95 transition-all">Audit Stock</button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-surface p-6 rounded-none border border-border shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rotate-45 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <s.icon className="w-4 h-4 text-primary" />
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{s.label}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${s.trendColor.replace('text-', 'bg-').replace('500', '500/10')} ${s.trendColor} border-current/20`}>
                                {s.trend}
                            </span>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <h3 className="text-3xl font-black text-text tracking-tighter uppercase">{s.value}</h3>
                            <div className="mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                <Sparkline />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices */}
                <div className="lg:col-span-2 bg-surface rounded-none border border-border shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface-alt/50">
                        <h3 className="text-[11px] font-black text-text tracking-[0.2em] uppercase flex items-center gap-3">
                            <Receipt className="w-4 h-4 text-primary" /> Transaction Ledger
                        </h3>
                        <button
                            onClick={() => navigate('/pos/invoices')}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline"
                        >
                            Complete Registry <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="overflow-x-auto scrollbar-thin flex-1 bg-background">
                        <table className="w-full text-left min-w-[600px] border-collapse">
                            <thead>
                                <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-4">ID_NODE</th>
                                    <th className="px-6 py-4">TIMESTAMP</th>
                                    <th className="px-6 py-4">ENTITY</th>
                                    <th className="px-6 py-4">PROTOCOL</th>
                                    <th className="px-6 py-4 text-right">VAL_CREDIT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {invoices.slice(0, 6).map(inv => (
                                    <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors text-sm group">
                                        <td className="px-6 py-4 font-black text-primary uppercase tracking-tighter">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-text-muted flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight">
                                            <Clock className="w-3.5 h-3.5 opacity-40" /> {formatTime(inv.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 font-black text-text text-[11px] uppercase tracking-tight">{inv.clientId?.name || 'ANN_GUEST'}</td>
                                        <td className="px-6 py-4 text-text-muted text-[10px] font-black uppercase tracking-widest">
                                            {inv.paymentMethod === 'online' ? 'UPI_INT' : `${inv.paymentMethod?.toUpperCase()}_HND`}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-text tracking-tighter">₹{inv.total?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {invoices.length === 0 && (
                        <div className="py-20 text-center bg-background border-t border-border">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Log sequence empty</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Payment Breakdown & Actions */}
                <div className="space-y-8">
                    <div className="bg-surface rounded-none border border-border shadow-sm p-6 space-y-6">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3 border-b border-border pb-4">
                            <Wallet className="w-4 h-4 text-primary" /> Multi-Mode Inflow
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {paymentBreakdown.map((pm, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-surface-alt/50 border border-border hover:border-primary/20 transition-all group cursor-default">
                                    <div className={`w-12 h-12 rounded-none flex items-center justify-center shrink-0 ${pm.color.replace('bg-', 'bg-').replace('50', '20')} border border-border group-hover:scale-110 transition-transform`}>
                                        <pm.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">{pm.label} PROTOCOL</p>
                                        <p className="text-xl font-black text-text tracking-tighter">₹{pm.value.toLocaleString()}</p>
                                    </div>
                                    <div className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 border border-primary/10">
                                        LVL {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="bg-text p-6 rounded-none text-background shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Quick Execution</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={action.onClick || (() => navigate(action.path))}
                                        className="p-4 bg-white/5 hover:bg-white/15 border border-white/10 flex flex-col items-center gap-3 transition-all active:scale-95"
                                    >
                                        <action.icon className="w-5 h-5 text-primary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-center">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Zap className="absolute -right-8 -bottom-8 w-40 h-40 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Appointments Modal */}
            {showAppointments && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-lg rounded-none shadow-2xl p-0 border border-border animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-alt">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" /> Pending Appointment Queue
                            </h3>
                            <button onClick={() => setShowAppointments(false)} className="p-2 hover:bg-background border border-border transition-colors group">
                                <X className="w-5 h-5 text-text-muted group-hover:text-text" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin bg-background">
                            {appointments.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Queue Clear • No active targets</p>
                                </div>
                            ) : (
                                appointments.map(app => (
                                    <div key={app._id} className="p-5 bg-surface border border-border flex items-center justify-between group hover:border-primary/40 transition-all transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-surface-alt border border-border flex items-center justify-center text-xs font-black text-primary flex-col leading-none">
                                                <span className="opacity-50 text-[8px] mb-1">EXEC_T</span>
                                                {app.time}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text uppercase tracking-tight">{app.clientName}</p>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 italic">{app.service}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { navigate('/pos/billing'); setShowAppointments(false); }} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95">
                                            Init Billing
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 border-t border-border bg-surface-alt flex justify-end">
                            <button onClick={() => setShowAppointments(false)} className="px-8 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text transition-colors">Close Monitor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
