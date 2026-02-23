import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    CreditCard,
    Zap,
    TrendingUp,
    ChevronRight,
    Store,
    Loader2,
    Banknote,
    Smartphone,
    Receipt
} from 'lucide-react';
import AnimatedCounter from '../../../components/common/AnimatedCounter';
import api from '../../../services/api';

export default function POSDashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, invoicesRes] = await Promise.all([
                    api.get('/invoices/stats').catch(() => ({ data: {} })),
                    api.get('/invoices?date=today&limit=10').catch(() => ({ data: { results: [] } })),
                ]);
                setStats(statsRes?.data || {});
                const list = invoicesRes?.data?.results || invoicesRes?.data?.data?.results || [];
                setRecentInvoices(Array.isArray(list) ? list : []);
            } catch (err) {
                console.error('Failed to fetch POS dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dashStats = [
        {
            label: "Today's Revenue",
            value: stats?.totalRevenue || 0,
            prefix: "₹",
            icon: TrendingUp,
            color: 'text-green-600 bg-green-50',
        },
        {
            label: "Total Invoices",
            value: stats?.invoiceCount || 0,
            icon: Receipt,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            label: "Avg. Bill Value",
            value: Math.round(stats?.avgBillValue || 0),
            prefix: "₹",
            icon: Zap,
            color: 'text-purple-600 bg-purple-50',
        },
        {
            label: "Cash Collection",
            value: stats?.cashTotal || 0,
            prefix: "₹",
            icon: Banknote,
            color: 'text-amber-600 bg-amber-50',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight">POS Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1">Real-time sales overview for today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashStats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} transition-colors`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-text mt-1">
                            <AnimatedCounter
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                            />
                        </h3>
                    </div>
                ))}
            </div>

            {/* Payment Split */}
            {stats && (stats.cashTotal > 0 || stats.cardTotal > 0 || stats.onlineTotal > 0) && (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                    <h3 className="font-bold text-text mb-4">Payment Method Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                            <Banknote className="w-5 h-5 text-green-600 mx-auto mb-2" />
                            <p className="text-xs text-green-700 font-semibold mb-1">Cash</p>
                            <p className="text-lg font-bold text-green-600">₹{(stats.cashTotal || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <CreditCard className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                            <p className="text-xs text-blue-700 font-semibold mb-1">Card</p>
                            <p className="text-lg font-bold text-blue-600">₹{(stats.cardTotal || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <Smartphone className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs text-purple-700 font-semibold mb-1">UPI/Online</p>
                            <p className="text-lg font-bold text-purple-600">₹{(stats.onlineTotal || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-text">Recent Invoices Today</h3>
                    <a href="/admin/pos/invoices" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
                {recentInvoices.length === 0 ? (
                    <div className="py-12 text-center text-text-muted text-sm">No invoices created today yet.</div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentInvoices.map((inv) => (
                            <div key={inv._id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                        <Receipt className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-primary truncate">{inv.invoiceNumber}</p>
                                        <p className="text-[11px] text-text-muted">{inv.clientId?.name || 'Walk-in'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                        {inv.paymentStatus}
                                    </span>
                                    <span className="text-sm font-bold text-text">₹{inv.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
