import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Download,
    TrendingUp,
    ShieldAlert,
    Star,
    ChevronRight,
    Tag,
    Trash2,
    DollarSign
} from 'lucide-react';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import CustomerProfileModal from '../../components/admin/CustomerProfileModal';
import SegmentManager from '../../components/admin/customers/SegmentManager';
import FeedbackList from '../../components/admin/customers/FeedbackList';
import ReEngagementTool from '../../components/admin/customers/ReEngagementTool';
import { useBusiness } from '../../contexts/BusinessContext';

export default function CustomersPage({ tab = 'directory' }) {
    const { customers, addCustomer, deleteCustomer } = useBusiness();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({
        name: '',
        phone: '',
        preferred: 'Haircut'
    });

    const activeTab = tab;

    const handleAddCustomer = (e) => {
        e.preventDefault();
        addCustomer(newCustomerForm);
        setShowAddModal(false);
        setNewCustomerForm({ name: '', phone: '', preferred: 'Haircut' });
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text uppercase">Customer CRM</h1>
                    <p className="text-sm text-text-secondary mt-1 font-bold uppercase tracking-widest text-[10px]">Manage loyalty & retention</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-none text-[10px] font-extrabold uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-all">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Total Base" value={customers.length} icon={Users} color="blue" trend="+12%" />
                <KPICard title="VIP Elite" value={customers.filter(c => c.tags.includes('VIP')).length} icon={Star} color="purple" trend="Stable" />
                <KPICard title="Gross Rev" value={`₹${customers.reduce((acc, c) => acc + c.spend, 0).toLocaleString()}`} icon={TrendingUp} color="green" trend="Total" />
                <KPICard title="Inactive" value={customers.filter(c => c.status === 'Inactive').length} icon={ShieldAlert} color="red" trend="At Risk" />
            </div>

            {/* Content Container */}
            <div className="bg-surface rounded-none border border-border shadow-sm overflow-hidden min-h-[600px]">
                {activeTab === 'directory' && (
                    <CustomerDirectory
                        customers={customers}
                        onCustomerClick={setSelectedCustomer}
                        onDelete={deleteCustomer}
                    />
                )}
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

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}>
                    <div className="bg-surface rounded-none w-full max-w-lg p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 rounded-none bg-primary/5 text-primary flex items-center justify-center mb-4 border border-primary/20">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-text uppercase">New Customer</h2>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">CRM Onboarding Protocol</p>
                        </div>

                        <form onSubmit={handleAddCustomer} className="space-y-5">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomerForm.name}
                                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                                        className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newCustomerForm.phone}
                                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                                        className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Preferred Service</label>
                                    <input
                                        type="text"
                                        value={newCustomerForm.preferred}
                                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, preferred: e.target.value })}
                                        className="w-full px-5 py-3 rounded-none bg-surface-alt border border-border text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-none border border-border text-[10px] font-extrabold uppercase tracking-widest text-text-muted hover:bg-surface-alt transition-all">Abort</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-3.5 rounded-none shadow-xl shadow-primary/20 text-[10px] font-extrabold uppercase tracking-widest hover:bg-primary-dark transition-all">Induct</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, trend }) {
    const colors = {
        blue: 'bg-primary/5 text-primary border-primary/10',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        red: 'bg-rose-50 text-rose-600 border-rose-100'
    };

    return (
        <div className="bg-surface p-5 rounded-none border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-none border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{trend}</span>
            </div>
            <div className="space-y-1">
                <h3 className="text-text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60">{title}</h3>
                <div className="text-2xl font-bold text-text">
                    {typeof value === 'number' ? (
                        <AnimatedCounter value={value} />
                    ) : value}
                </div>
            </div>
        </div>
    );
}

function CustomerDirectory({ customers, onCustomerClick, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filtered = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
        const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8 flex flex-col h-full gap-8 slide-right overflow-y-auto no-scrollbar">
            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group lg:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Identity (Name or Phone)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-tighter"
                    >
                        <option value="All">All Tiers</option>
                        <option value="Regular">Regular</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <select className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-none text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase tracking-tighter">
                        <option>Any Spend</option>
                        <option>High Value</option>
                        <option>Mid Range</option>
                        <option>Low Value</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 border border-border rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-alt border-b border-border">
                            <th className="px-6 py-5 text-[10px] font-extrabold text-text-muted uppercase tracking-widest pl-8">Customer Matrix</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">History</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Finance</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest">Tiers</th>
                            <th className="px-6 py-5 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface text-sm">
                        {filtered.map((customer, index) => (
                            <tr
                                key={customer._id}
                                className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-transparent animate-in fade-in slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => onCustomerClick(customer)}
                            >
                                <td className="px-6 py-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-xs group-hover:scale-110 transition-transform">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-text group-hover:text-primary transition-colors tracking-tight text-sm">{customer.name}</div>
                                            <div className="text-[10px] text-text-muted font-bold tracking-widest">{customer.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-text uppercase">Last Visit</span>
                                        <span className="text-xs font-bold text-text-secondary">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Gross Yield</span>
                                        <span className="text-sm font-bold text-text">₹{customer.spend.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {customer.tags.map((tag, i) => (
                                            <span key={i} className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border transition-colors ${tag === 'VIP' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-surface-alt text-text-muted border-border'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right pr-8">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCustomerClick(customer);
                                            }}
                                            className="p-2.5 rounded-none text-text-muted hover:text-primary hover:bg-surface-alt border border-transparent hover:border-border transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(customer._id);
                                            }}
                                            className="p-2.5 rounded-none text-text-muted hover:text-rose-500 hover:bg-surface-alt border border-border transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-8 py-5 bg-surface-alt border border-border rounded-none text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Displaying {filtered.length} Elite Customer Records</span>
                <div className="flex gap-6">
                    <button className="hover:text-primary transition-colors disabled:opacity-30" disabled>Previous Page</button>
                    <button className="hover:text-primary transition-colors">Next Analytics</button>
                </div>
            </div>
        </div >
    );
}
