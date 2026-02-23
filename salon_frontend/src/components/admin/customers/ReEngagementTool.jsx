import React from 'react';
import {
    Clock,
    ArrowUpRight,
    UserMinus,
    MessageSquare,
    Phone,
    Calendar,
    Scissors,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

export default function ReEngagementTool() {
    const { customers, updateCustomer } = useBusiness();

    const atRiskCustomers = customers.map(c => {
        const lastVisitDate = new Date(c.lastVisit);
        const diffTime = Math.abs(new Date() - lastVisitDate);
        const inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...c, inactiveDays };
    }).filter(c => c.inactiveDays > 30).sort((a, b) => b.inactiveDays - a.inactiveDays);

    const totalPotentialRevenue = atRiskCustomers.length * 500; // Mock calculation based on avg spend
    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-100 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <ShieldAlert className="absolute -right-8 -top-8 w-40 h-40 text-red-100/50 rotate-12" />
                <div className="p-4 bg-white rounded-2xl shadow-lg shadow-red-200/50 relative z-10">
                    <UserMinus className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-1 relative z-10 flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-red-900">Retention Opportunity</h3>
                    <p className="text-red-700/80 font-medium text-sm leading-relaxed">
                        We've identified <span className="text-red-600 font-bold">{atRiskCustomers.length} customers</span> who haven't visited in over 30 days. Re-engaging them now could recover up to <span className="text-red-600 font-bold">₹{totalPotentialRevenue.toLocaleString()}</span> in potential revenue.
                    </p>
                </div>
                <button className="bg-red-600 text-white px-8 py-3 rounded-xl text-[11px] font-bold shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-all uppercase tracking-widest relative z-10 whitespace-nowrap">
                    Start Campaign
                </button>
            </div>

            {/* Inactive List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        At-Risk Customers (Sorted by Inactivity)
                    </h4>
                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                        EXPORT LIST <ExternalLink className="w-3 h-3" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {atRiskCustomers.map((customer) => (
                        <div
                            key={customer._id}
                            className="bg-white border border-border p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-red-100 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-text-muted font-bold text-lg border border-border">
                                    {customer.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="font-bold text-text group-hover:text-red-600 transition-colors tracking-tight text-base">{customer.name}</h5>
                                    <div className="flex items-center gap-3 text-[11px] font-semibold text-text-muted">
                                        <span className="flex items-center gap-1 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            Last: {new Date(customer.lastVisit).toLocaleDateString()}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 uppercase tracking-widest text-primary">
                                            <Scissors className="w-3 h-3" />
                                            {customer.preferred || 'Any Service'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-center md:text-right space-y-0.5">
                                    <p className="text-2xl font-bold text-red-500 tracking-tighter">{customer.inactiveDays}</p>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Days Inactive</p>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-surface text-text-muted hover:bg-[#25D366] hover:text-white rounded-xl transition-all border border-border">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button className="p-2.5 bg-surface text-text-muted hover:bg-primary hover:text-white rounded-xl transition-all border border-border">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => updateCustomer(customer._id, { lastVisit: new Date().toISOString().split('T')[0] })}
                                        className="flex items-center gap-2 bg-text text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-sm active:scale-95"
                                    >
                                        Mark Contacted
                                        <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center pb-6 pt-2">
                <button className="text-[11px] font-bold text-text-muted uppercase tracking-widest hover:text-primary transition-colors">
                    Load More At-Risk Customers...
                </button>
            </div>
        </div>
    );
}
