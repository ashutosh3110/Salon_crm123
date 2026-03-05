import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, Receipt, TrendingUp, Wallet,
    Banknote, CreditCard, Smartphone, Ban,
    Clock, ArrowRight, Zap, ShoppingCart, Users,
    AlertTriangle, Calendar, Printer, Package, RefreshCcw, X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
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
            { name: 'Cash', value: breakdown.cash, icon: Banknote, color: '#10b981' },
            { name: 'Card', value: breakdown.card, icon: CreditCard, color: '#3b82f6' },
            { name: 'UPI', value: breakdown.online, icon: Smartphone, color: '#8b5cf6' },
            { name: 'Unpaid', value: breakdown.unpaid, icon: Ban, color: '#f59e0b' },
        ];
    }, [todayInvoices]);

    const formatTime = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const statCards = [
        { label: "TODAY'S REVENUE", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: '↑ 12.5%', positive: true },
        { label: 'TOTAL INVOICES', value: stats.count, icon: Receipt, trend: '↑ 3.8%', positive: true },
        { label: 'UNPAID BILLS', value: stats.unpaidCount, icon: Clock, trend: '↓ 5.2%', positive: false },
        { label: 'AVG. TICKET', value: `₹${stats.avgBill.toLocaleString()}`, icon: TrendingUp, trend: '↑ 5.2%', positive: true },
    ];

    const quickActions = [
        { label: 'New Bill', icon: Zap, path: '/pos/billing', color: 'bg-primary text-white' },
        { label: 'Appointments', icon: Calendar, onClick: () => setShowAppointments(true), color: 'bg-blue-600 text-white' },
        { label: 'Invoices', icon: Printer, path: '/pos/invoices', color: 'bg-slate-800 text-white' },
        { label: 'Packages', icon: Package, path: '/pos/billing', color: 'bg-purple-600 text-white' },
    ];

    return (
        <div className="space-y-8 animate-reveal pb-10 text-left font-black">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-black text-text uppercase tracking-tight">Terminal Control Center</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active Session Uplink • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/pos/refunds')} className="px-6 py-3 bg-surface border border-border text-text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface-alt transition-all shadow-sm flex items-center gap-3 active:scale-95">
                        <RefreshCcw className="w-4 h-4" /> Auth Refund
                    </button>
                    <button onClick={() => navigate('/pos/billing')} className="px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95">
                        <Zap className="w-4 h-4" /> Create Bill
                    </button>
                </div>
            </div>

            {/* Threshold Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-none flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Inventory Threshold Alert</p>
                            <p className="text-[10px] text-amber-700/70 font-bold uppercase tracking-wider mt-1">{lowStockItems.length} Products identified below operational levels</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black text-amber-800 uppercase tracking-widest hover:underline px-4 py-2 border border-amber-500/20 active:scale-95 transition-all">Audit Now</button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-surface p-6 rounded-none border border-border shadow-sm hover:border-primary/40 transition-all group overflow-hidden relative text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rotate-45 pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        <div className="flex items-center justify-between mb-6 relative z-10 text-left">
                            <div className="flex items-center gap-3 text-left font-black">
                                <s.icon className="w-4 h-4 text-primary" />
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-left">{s.label}</p>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${s.positive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                {s.trend}
                            </span>
                        </div>
                        <div className="flex items-end justify-between relative z-10 text-left font-black">
                            <h3 className="text-3xl font-black text-text tracking-tighter uppercase text-left">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left font-black">
                {/* Visual Analytics */}
                <div className="lg:col-span-2 bg-surface rounded-none border border-border shadow-sm flex flex-col p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-[11px] font-black text-text tracking-[0.2em] uppercase">Liquidity Stream</h3>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Today's transaction volume analysis</p>
                        </div>
                        <div className="flex gap-4">
                            {paymentBreakdown.map(p => (
                                <div key={p.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: p.color }} />
                                    <span className="text-[9px] font-black text-text-muted uppercase">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--text-muted)' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                    cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                />
                                <Bar dataKey="value" barSize={40}>
                                    {paymentBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Actions & Distribution */}
                <div className="space-y-8 text-left font-black">
                    <div className="bg-surface rounded-none border border-border shadow-sm p-8 space-y-8 flex flex-col">
                        <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] border-b border-border pb-4">
                            Collections Distribution
                        </h3>
                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {paymentBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0px',
                                            fontSize: '10px',
                                            fontWeight: '900',
                                            textTransform: 'uppercase'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xl font-black text-text uppercase">₹{Math.round(stats.revenue / 1000)}k</p>
                                <p className="text-[9px] text-text-muted font-black uppercase">Net Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="bg-text p-8 rounded-none text-background shadow-2xl relative overflow-hidden group text-left">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Override</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={action.onClick || (() => navigate(action.path))}
                                        className="p-5 bg-white/5 hover:bg-primary transition-all border border-white/10 flex flex-col items-center gap-3 active:scale-95 group/btn"
                                    >
                                        <action.icon className="w-5 h-5 text-primary group-hover/btn:text-white" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-center group-hover/btn:text-white">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Zap className="absolute -right-8 -bottom-8 w-40 h-40 opacity-[0.03] group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden flex flex-col text-left">
                <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-surface-alt/50 text-left">
                    <h3 className="text-[11px] font-black text-text tracking-[0.2em] uppercase flex items-center gap-3 text-left">
                        <Receipt className="w-4 h-4 text-primary" /> Active Ledger Logs
                    </h3>
                    <button
                        onClick={() => navigate('/pos/invoices')}
                        className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline"
                    >
                        Master Registry <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="overflow-x-auto text-left font-black">
                    <table className="w-full text-left min-w-[600px] border-collapse">
                        <thead>
                            <tr className="bg-surface-alt/80 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-b border-border text-left">
                                <th className="px-8 py-4 text-left">IDENTIFIER</th>
                                <th className="px-8 py-4 text-left">TIMESTAMP</th>
                                <th className="px-8 py-4 text-left">CLIENT_NODE</th>
                                <th className="px-8 py-4 text-left">PROTOCOL</th>
                                <th className="px-8 py-4 text-right">TOTAL_CREDIT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 text-left font-black">
                            {invoices.slice(0, 6).map(inv => (
                                <tr key={inv._id} className="hover:bg-surface-alt/50 transition-colors group text-left">
                                    <td className="px-8 py-4 font-black text-primary uppercase text-xs tracking-tight text-left">{inv.invoiceNumber}</td>
                                    <td className="px-8 py-4 text-text-muted text-[10px] font-black uppercase text-left flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 opacity-40 shrink-0" /> {formatTime(inv.createdAt)}
                                    </td>
                                    <td className="px-8 py-4 font-black text-text text-[11px] uppercase tracking-tight text-left">{inv.clientId?.name || 'ANN_GUEST'}</td>
                                    <td className="px-8 py-4 text-text-muted text-[9px] font-black uppercase tracking-widest text-left">
                                        {inv.paymentMethod === 'online' ? 'UPI_TRANSACTION' : `${inv.paymentMethod?.toUpperCase()}_PAYMENT`}
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-text tracking-tighter text-sm">₹{inv.total?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Appointments Modal */}
            {showAppointments && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-surface w-full max-w-lg rounded-none shadow-2xl p-0 border border-border">
                        <div className="flex items-center justify-between p-8 border-b border-border bg-surface-alt">
                            <h3 className="text-[11px] font-black text-text uppercase tracking-[0.2em] flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" /> Active Queue monitor
                            </h3>
                            <button onClick={() => setShowAppointments(false)} className="w-10 h-10 flex items-center justify-center border border-border hover:bg-background transition-colors">
                                <X className="w-5 h-5 text-text-muted hover:text-text" />
                            </button>
                        </div>
                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-none bg-background text-left">
                            {appointments.map(app => (
                                <div key={app._id} className="p-6 bg-surface border border-border flex items-center justify-between group hover:border-primary/60 transition-all text-left">
                                    <div className="flex items-center gap-6 text-left">
                                        <div className="w-16 h-16 bg-surface-alt border border-border flex flex-col items-center justify-center text-[11px] font-black text-primary leading-tight">
                                            <span className="opacity-40 text-[8px] mb-1">LOOP_T</span>
                                            {app.time}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-text uppercase tracking-tight text-left">{app.clientName}</p>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1 text-left">{app.service}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { navigate('/pos/billing'); setShowAppointments(false); }} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95">
                                        Initiate
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 border-t border-border bg-surface-alt flex justify-end">
                            <button onClick={() => setShowAppointments(false)} className="px-8 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text">Terminate View</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
