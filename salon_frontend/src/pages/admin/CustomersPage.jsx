import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Download,
    TrendingUp,
    Clock,
    ShieldAlert,
    Star,
    MoreHorizontal,
    ChevronRight,
    MapPin,
    Calendar,
    DollarSign,
    Tag
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomerProfileModal from '../../components/admin/CustomerProfileModal';
import SegmentManager from '../../components/admin/customers/SegmentManager';
import FeedbackList from '../../components/admin/customers/FeedbackList';
import ReEngagementTool from '../../components/admin/customers/ReEngagementTool';
const MOCK_CUSTOMERS = [
    { _id: '1', name: 'Aryan Khan', phone: '+91 98765 43210', lastVisit: '2024-03-15', totalVisits: 12, spend: 15400, preferred: 'Haircut', tags: ['VIP'], status: 'Regular' },
    { _id: '2', name: 'Ishita Sharma', phone: '+91 98765 43211', lastVisit: '2024-03-20', totalVisits: 5, spend: 8200, preferred: 'Manicure', tags: ['Regular'], status: 'Regular' },
    { _id: '3', name: 'Rahul Verma', phone: '+91 98765 43212', lastVisit: '2024-02-10', totalVisits: 2, spend: 1200, preferred: 'Shave', tags: ['New'], status: 'Inactive' },
    { _id: '4', name: 'Simran Jit', phone: '+91 98765 43213', lastVisit: '2024-03-21', totalVisits: 25, spend: 45000, preferred: 'Coloring', tags: ['VIP'], status: 'Regular' },
    { _id: '5', name: 'Vikram Singh', phone: '+91 98765 43214', lastVisit: '2023-12-01', totalVisits: 1, spend: 500, preferred: 'Trim', tags: ['New'], status: 'Inactive' },
];

export default function CustomersPage({ tab = 'directory' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Sync activeTab with tab prop
    const activeTab = tab;

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">Customer CRM</h1>
                    <p className="text-sm text-text-secondary mt-1 font-medium">Manage leads, track loyalty, and improve retention.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:bg-secondary transition-all">
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active">
                        <UserPlus className="w-4 h-4" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Customers" value={1250} icon={Users} color="blue" trend="+12% this month" />
                <KPICard title="Active Segments" value={8} icon={Tag} color="purple" trend="2 new rules" />
                <KPICard title="Average Spend" value="₹1,250" icon={TrendingUp} color="green" trend="+5% increase" />
                <KPICard title="At Risk" value={42} icon={ShieldAlert} color="red" trend="Needs attention" />
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden min-h-[600px]">
                {activeTab === 'directory' && <CustomerDirectory onCustomerClick={setSelectedCustomer} />}
                {activeTab === 'segments' && <SegmentManager />}
                {activeTab === 'feedback' && <FeedbackList />}
                {activeTab === 'reengage' && <ReEngagementTool />}
            </div>

            {/* Profile Modal */}
            <CustomerProfileModal
                isOpen={!!selectedCustomer}
                customer={selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
            />
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'bg-primary/5 text-primary',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 capitalize">{trend}</span>
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
                <div className="text-2xl font-bold text-text">
                    {typeof value === 'number' ? (
                        <AnimatedCounter value={value} />
                    ) : value}
                </div>
            </div>
        </div>
    );
}

function CustomerDirectory({ onCustomerClick }) {
    return (
        <div className="p-8 flex flex-col h-full gap-8 slide-right overflow-y-auto no-scrollbar">
            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                        <option>Current Outlet</option>
                        <option>All Outlets</option>
                    </select>
                </div>
                <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                        <option>Any Last Visit</option>
                        <option>7 Days Inactive</option>
                        <option>30 Days Inactive</option>
                        <option>60+ Days Inactive</option>
                    </select>
                </div>
                <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-semibold text-text-secondary appearance-none focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all uppercase tracking-wider">
                        <option>Any Spending</option>
                        <option>₹0 - ₹5k</option>
                        <option>₹5k - ₹20k</option>
                        <option>₹20k+ High Spender</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface border-b border-border">
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Customer Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Last Visit Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Total Visits</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Lifetime Spend</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Preferred Services</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Tags</th>
                            <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white text-sm">
                        {MOCK_CUSTOMERS.map((customer) => (
                            <tr
                                key={customer._id}
                                onClick={() => onCustomerClick(customer)}
                                className="hover:bg-surface/50 transition-colors group cursor-pointer border-transparent"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-105 transition-transform">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-text group-hover:text-primary transition-colors tracking-tight text-sm">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[11px] text-text-secondary font-medium tracking-wider">{customer.phone}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-text-secondary">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-secondary-foreground font-bold">{customer.totalVisits}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-text">₹{customer.spend.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">{customer.preferred}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {customer.tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-surface text-text-secondary text-[9px] font-bold rounded-md uppercase tracking-wider border border-border">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCustomerClick(customer);
                                        }}
                                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                    >
                                        <span>View Profile</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-surface border border-border rounded-xl text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Showing 5 of 1,250 Elite Customers</span>
                <div className="flex gap-4">
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous Page</button>
                    <button className="hover:text-primary transition-colors">Next Page</button>
                </div>
            </div>
        </div>
    );
}
