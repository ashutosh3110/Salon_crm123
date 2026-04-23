import React from 'react';
import {
    Clock,
    ArrowUpRight,
    MessageSquare,
    Phone,
    Calendar,
    Scissors
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

export default function ReEngagementTool() {
    const { customers, updateCustomer, activeOutletId, fetchCustomers } = useBusiness();

    // Fetch a larger batch of customers on mount to ensure we can scan the whole base
    React.useEffect(() => {
        fetchCustomers(1, 1000);
    }, [fetchCustomers]);

    const atRiskCustomers = customers
        .filter(c => {
            // Must have had at least one booking (lastVisit exists or totalVisits > 0)
            const actualLastVisit = c.lastVisit || (c.totalVisits > 0 ? c.updatedAt : null);
            if (!actualLastVisit) return false;
            
            return true;
        })
        .map(c => {
            const actualLastVisit = c.lastVisit || c.updatedAt;
            const lastVisitDate = new Date(actualLastVisit);
            const diffTime = Math.abs(new Date() - lastVisitDate);
            const inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...c, inactiveDays };
        })
        .filter(c => c.inactiveDays > 30)
        .sort((a, b) => b.inactiveDays - a.inactiveDays);

    const handleWhatsApp = (customer) => {
        const message = `Hi ${customer.name}, we miss you! It's been a while since your last visit. We'd love to see you again. Book your next appointment here!`;
        window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className="p-6 space-y-6 slide-right animate-fadeIn">
            {/* Inactive List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Inactive Customers (Last visit &gt; 30 days)
                    </h4>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 border border-primary/10">
                        {atRiskCustomers.length} Total
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {atRiskCustomers.length === 0 ? (
                        <div className="bg-surface border border-border p-12 text-center">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">No inactive customers found matching criteria</p>
                        </div>
                    ) : (
                        atRiskCustomers.map((customer) => (
                            <div
                                key={customer._id}
                                className="bg-white border border-border p-5 rounded-none shadow-sm hover:shadow-md hover:border-primary transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-none bg-surface flex items-center justify-center text-text-muted font-bold text-lg border border-border">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-text group-hover:text-primary transition-colors tracking-tight text-base uppercase">{customer.name}</h5>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-text-muted">
                                            <span className="flex items-center gap-1 uppercase tracking-widest">
                                                <Calendar className="w-3 h-3" />
                                                Last: {new Date(customer.lastVisit || customer.updatedAt).toLocaleDateString()}
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
                                        <p className="text-2xl font-black text-primary tracking-tighter">{customer.inactiveDays}</p>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Days Inactive</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleWhatsApp(customer)}
                                            className="p-3 bg-surface text-text-muted hover:bg-[#25D366] hover:text-white transition-all border border-border"
                                            title="WhatsApp"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleCall(customer.phone)}
                                            className="p-3 bg-surface text-text-muted hover:bg-primary hover:text-white transition-all border border-border"
                                            title="Call"
                                        >
                                            <Phone className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => updateCustomer(customer._id, { lastVisit: new Date().toISOString() })}
                                            className="flex items-center gap-2 bg-text text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
                                        >
                                            Mark Contacted
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
