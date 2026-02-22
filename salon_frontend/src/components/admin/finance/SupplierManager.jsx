import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, MoreHorizontal, FileText, ChevronRight, DollarSign, Download } from 'lucide-react';

const MOCK_SUPPLIERS = [
    { id: '1', name: 'Glossy Cosmetics Ltd', contact: 'Anil Mehta', phone: '+91 98200 12345', email: 'anil@glossy.com', gstin: '27AAACG1234A1Z5', due: 45000, status: 'Active' },
    { id: '2', name: 'Salon Supplies Inc', contact: 'Sarah J.', phone: '+91 98111 22233', email: 'sales@salonsupplies.in', gstin: '27BBBCG5678B1Z2', due: 12500, status: 'Overdue' },
    { id: '3', name: 'Organic India', contact: 'Rajesh K.', phone: '+91 99000 55555', email: 'support@organic.in', gstin: '27CCC G9012C1Z9', due: 0, status: 'Active' },
];

export default function SupplierManager() {
    const [view, setView] = useState('list'); // 'list' or 'form'

    return (
        <div className="flex flex-col h-full slide-right overflow-hidden">
            {/* Header / Filter */}
            <div className="p-6 border-b border-border bg-surface/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search suppliers by name or GSTIN..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface transition-all">
                        <Filter className="w-4 h-4" />
                        Status
                    </button>
                </div>
                <button
                    onClick={() => setView(view === 'list' ? 'form' : 'list')}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active"
                >
                    <Plus className="w-4 h-4" />
                    {view === 'list' ? 'Add New Supplier' : 'Back to List'}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                {view === 'list' ? <SupplierTable /> : <SupplierForm onCancel={() => setView('list')} />}
            </div>
        </div>
    );
}

function SupplierTable() {
    return (
        <div className="p-0 animate-fadeIn overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="bg-surface/50 border-b border-border">
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Supplier Name</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Contact Info</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">GSTIN</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Outstanding Due</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {MOCK_SUPPLIERS.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-surface/30 transition-colors group cursor-default">
                            <td className="px-8 py-5">
                                <div className="flex flex-col">
                                    <span className="font-bold text-text text-sm group-hover:text-primary transition-colors">{supplier.name}</span>
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Contact: {supplier.contact}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                                        <Phone className="w-3 h-3 opacity-50" />
                                        {supplier.phone}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                                        <Mail className="w-2.5 h-2.5 opacity-50" />
                                        {supplier.email}
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="text-[10px] font-bold text-text-secondary bg-surface px-2 py-1 rounded border border-border">{supplier.gstin}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <span className={`text-sm font-bold ${supplier.due > 0 ? (supplier.status === 'Overdue' ? 'text-rose-600' : 'text-orange-500') : 'text-emerald-600'}`}>
                                    ₹{supplier.due.toLocaleString()}
                                </span>
                            </td>
                            <td className="px-8 py-5">
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${supplier.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                    {supplier.status}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                        <DollarSign className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SupplierForm({ onCancel }) {
    return (
        <div className="p-10 max-w-3xl mx-auto animate-slideUp">
            <div className="space-y-8">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text tracking-tight">Onboard New Supplier</h3>
                    <p className="text-sm text-text-secondary font-medium">Add supplier details for automated payments and inventory stock-in.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Company / Supplier Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Glossy Cosmetics Ltd"
                            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Primary Contact Person</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">GSTIN (Optional)</label>
                        <input
                            type="text"
                            placeholder="27XXXX"
                            className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="tel"
                                placeholder="+91 XXXX"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Office / Warehouse Address</label>
                        <div className="relative group">
                            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                            <textarea
                                placeholder="Full address..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface transition-all"
                    >
                        Back to List
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all scale-active">
                        Save Supplier Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
