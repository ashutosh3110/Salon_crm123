import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign, Receipt, TrendingUp, Wallet,
    Banknote, CreditCard, Smartphone, Ban,
    Clock, ArrowRight, Zap
} from 'lucide-react';
import { MOCK_INVOICES } from '../../data/posData';

export default function POSDashboardPage() {
    const navigate = useNavigate();
    const invoices = MOCK_INVOICES;

    const todayInvoices = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return invoices.filter(inv => inv.createdAt?.startsWith(today));
    }, [invoices]);

    const stats = useMemo(() => {
        const revenue = todayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const count = todayInvoices.length;
        const avgBill = count > 0 ? Math.round(revenue / count) : 0;
        const cashTotal = todayInvoices.filter(i => i.paymentMethod === 'cash').reduce((s, i) => s + i.total, 0);
        return { revenue, count, avgBill, cashTotal };
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
        { label: "Today's Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary bg-primary/10' },
        { label: 'Invoices Created', value: stats.count, icon: Receipt, color: 'text-blue-600 bg-blue-50' },
        { label: 'Average Bill', value: `₹${stats.avgBill.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
        { label: 'Cash Collection', value: `₹${stats.cashTotal.toLocaleString()}`, icon: Wallet, color: 'text-purple-600 bg-purple-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">POS Dashboard</h1>
                    <p className="text-sm text-text-secondary mt-1">Today's billing summary at a glance.</p>
                </div>
                <button
                    onClick={() => navigate('/pos/billing')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Zap className="w-4.5 h-4.5" /> New Bill
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                                <h3 className="text-2xl font-bold text-text">{s.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
                <h3 className="text-sm font-bold text-text mb-4">Payment Mode Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paymentBreakdown.map((pm, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-transparent hover:border-border transition-all">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pm.color}`}>
                                <pm.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{pm.label}</p>
                                <p className="text-lg font-extrabold text-text">₹{pm.value.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-bold text-text">Recent Invoices</h3>
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
                            <tr className="bg-surface text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border">
                                <th className="px-5 py-3">Invoice</th>
                                <th className="px-5 py-3">Time</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Method</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {invoices.slice(0, 5).map(inv => (
                                <tr key={inv._id} className="hover:bg-surface/50 transition-colors text-sm">
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
        </div>
    );
}
