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
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-none animate-spin" />
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Syncing Terminal Core...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-2xl font-black text-text uppercase tracking-tight">Performance Matrix</h1>
                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">Real-time operational telemetry for current cycle</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashStats.map((stat, i) => (
                    <div key={i} className="bg-surface rounded-none border border-border p-6 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-none rotate-45 pointer-events-none transition-transform group-hover:scale-110" />
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-10 h-10 rounded-none border border-border flex items-center justify-center bg-surface-alt transition-colors group-hover:bg-primary group-hover:text-white`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-text tracking-tight">
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
                <div className="bg-surface rounded-none border border-border shadow-sm p-8">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest mb-8 border-b border-border pb-4">Revenue Auth Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-emerald-500/5 rounded-none border border-emerald-500/10 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-none bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Banknote className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest mb-1">Cash Inflow</p>
                                <p className="text-xl font-black text-emerald-600 tracking-tight">₹{(stats.cashTotal || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-blue-500/5 rounded-none border border-blue-500/10 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-none bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-700 font-black uppercase tracking-widest mb-1">Credit/Debit Loop</p>
                                <p className="text-xl font-black text-blue-600 tracking-tight">₹{(stats.cardTotal || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="p-6 bg-purple-500/5 rounded-none border border-purple-500/10 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-none bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-purple-700 font-black uppercase tracking-widest mb-1">UPI/Online Vector</p>
                                <p className="text-xl font-black text-purple-600 tracking-tight">₹{(stats.onlineTotal || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Invoices */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface-alt/50">
                    <h3 className="text-sm font-black text-text uppercase tracking-widest">Live Transaction Stream</h3>
                    <a href="/admin/pos/invoices" className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                        Audit All <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
                {recentInvoices.length === 0 ? (
                    <div className="py-20 text-center bg-surface-alt/10">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Zero transactions detected in current session</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentInvoices.map((inv) => (
                            <div key={inv._id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt transition-all group">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-10 h-10 rounded-none bg-surface-alt border border-border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                        <Receipt className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-primary uppercase tracking-widest truncate">{inv.invoiceNumber}</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{inv.clientId?.name || 'Walk-in Entity'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 shrink-0">
                                    <span className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest border ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                                        {inv.paymentStatus || 'PAID'}
                                    </span>
                                    <span className="text-sm font-black text-text tracking-tight">₹{inv.total?.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
