import {
    Users,
    CalendarCheck,
    IndianRupee,
    TrendingUp,
    Package,
    Clock,
    UserPlus,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

const stats = [
    {
        label: "Today's Revenue",
        value: '₹0',
        change: '+0%',
        trend: 'up',
        icon: IndianRupee,
        color: 'bg-green-50 text-green-600',
    },
    {
        label: "Today's Bookings",
        value: '0',
        change: '+0%',
        trend: 'up',
        icon: CalendarCheck,
        color: 'bg-blue-50 text-blue-600',
    },
    {
        label: 'Total Clients',
        value: '0',
        change: '+0%',
        trend: 'up',
        icon: Users,
        color: 'bg-purple-50 text-purple-600',
    },
    {
        label: 'Active Staff',
        value: '0',
        change: '0',
        trend: 'neutral',
        icon: UserPlus,
        color: 'bg-orange-50 text-orange-600',
    },
];

const recentBookings = [];
const lowStockProducts = [];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-text">Dashboard</h1>
                <p className="text-sm text-text-secondary mt-1">Welcome back! Here's your salon overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            {stat.trend === 'up' && (
                                <span className="flex items-center text-xs font-medium text-green-600">
                                    {stat.change} <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </span>
                            )}
                            {stat.trend === 'down' && (
                                <span className="flex items-center text-xs font-medium text-red-500">
                                    {stat.change} <ArrowDownRight className="w-3 h-3 ml-0.5" />
                                </span>
                            )}
                        </div>
                        <div className="text-2xl font-bold text-text">{stat.value}</div>
                        <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-border">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-text">Recent Bookings</h2>
                        <a href="/admin/bookings" className="text-xs text-primary font-medium hover:underline">
                            View All
                        </a>
                    </div>
                    <div className="p-5">
                        {recentBookings.length === 0 ? (
                            <div className="text-center py-10">
                                <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-secondary">No recent bookings</p>
                                <p className="text-xs text-text-muted mt-1">Bookings will appear here once created</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentBookings.map((booking, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                {booking.clientName?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-text">{booking.clientName}</div>
                                                <div className="text-xs text-text-muted">{booking.service}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-text-secondary">{booking.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats / Alerts */}
                <div className="bg-white rounded-xl border border-border">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h2 className="font-semibold text-text">Low Stock Alerts</h2>
                    </div>
                    <div className="p-5">
                        {lowStockProducts.length === 0 ? (
                            <div className="text-center py-10">
                                <Package className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-secondary">All stock levels are healthy</p>
                                <p className="text-xs text-text-muted mt-1">Low stock items will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lowStockProducts.map((product, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                                        <div>
                                            <div className="text-sm font-medium text-text">{product.name}</div>
                                            <div className="text-xs text-text-muted">SKU: {product.sku}</div>
                                        </div>
                                        <span className="text-xs font-medium text-error bg-error/10 px-2 py-1 rounded">
                                            {product.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-border p-5">
                <h2 className="font-semibold text-text mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'New Booking', href: '/admin/bookings', icon: CalendarCheck, color: 'text-blue-600 bg-blue-50' },
                        { label: 'Add Client', href: '/admin/clients', icon: UserPlus, color: 'text-purple-600 bg-purple-50' },
                        { label: 'Create Invoice', href: '/admin/invoices', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                        { label: 'Add Product', href: '/admin/products', icon: Package, color: 'text-orange-600 bg-orange-50' },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all text-center"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-text-secondary">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
