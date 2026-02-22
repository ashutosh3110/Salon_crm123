import {
    LayoutDashboard,
    CreditCard,
    Zap,
    TrendingUp,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Store
} from 'lucide-react';
import AnimatedCounter from '../../../components/common/AnimatedCounter';

const stats = [
    { label: "Today's Total Sales", value: 45280, prefix: "₹", icon: TrendingUp, tendency: "+12.5%", positive: true },
    { label: "Total Invoices", value: 32, icon: Zap, tendency: "+5", positive: true },
    { label: "Average Bill Value", value: 1415, prefix: "₹", icon: CreditCard, tendency: "-2.3%", positive: false },
    { label: "Cash vs Online Ratio", value: 60, suffix: "%", icon: LayoutDashboard, tendency: "Stable", positive: true },
];

const outletSummary = [
    { name: "Grace & Glamour - Downtown", sales: "₹18,500", invoices: 12 },
    { name: "The Royal Salon - Bandra", sales: "₹14,280", invoices: 10 },
    { name: "Elegance Spa & Pune", sales: "₹12,500", invoices: 10 },
];

export default function POSDashboardPage() {
    return (
        <div className="space-y-6 animate-reveal">
            <div>
                <h1 className="text-2xl font-bold text-text tracking-tight">POS Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1">Real-time analytics and sales overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.tendency}
                            </span>
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

            {/* Outlet Wise Summary */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-text">Outlet-wise Sales Summary</h3>
                    <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                        View Detailed Report <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {outletSummary.map((outlet, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center">
                                    <Store className="w-4 h-4 text-text-muted" />
                                </div>
                                <span className="font-medium text-text">{outlet.name}</span>
                            </div>
                            <div className="flex items-center gap-8 text-right">
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Invoices</p>
                                    <p className="font-semibold text-text">{outlet.invoices}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Sales</p>
                                    <p className="font-bold text-primary">{outlet.sales}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
