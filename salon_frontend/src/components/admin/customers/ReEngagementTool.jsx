import React, { useState } from 'react';
import {
    Clock,
    ArrowUpRight,
    UserMinus,
    MessageSquare,
    Phone,
    Calendar,
    Scissors,
    ShieldAlert,
    ExternalLink,
    X,
    CheckCircle2
} from 'lucide-react';

import { useBusiness } from '../../../contexts/BusinessContext';

export default function ReEngagementTool() {
    const { customers, updateCustomer } = useBusiness();
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [campaignStatus, setCampaignStatus] = useState('idle'); // idle, sending, complete

    const atRiskCustomers = customers.map(c => {
        const lastVisitDate = new Date(c.lastVisit);
        const diffTime = Math.abs(new Date() - lastVisitDate);
        const inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...c, inactiveDays };
    }).filter(c => c.inactiveDays > 30).sort((a, b) => b.inactiveDays - a.inactiveDays);

    const totalPotentialRevenue = atRiskCustomers.length * 500; // Mock calculation based on avg spend

    const handleStartCampaign = () => {
        setShowCampaignModal(true);
        setCampaignStatus('idle');
    };

    const runCampaign = () => {
        setCampaignStatus('sending');
        setTimeout(() => {
            setCampaignStatus('complete');
        }, 3000);
    };

    const handleWhatsApp = (customer) => {
        const message = `Hi ${customer.name}, we miss you at Grace & Glamour! We have a special 20% discount waiting for your next ${customer.preferred || 'service'}. Book now!`;
        window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleExport = () => {
        const data = atRiskCustomers.map(c => `${c.name},${c.phone},${c.inactiveDays}`).join('\n');
        const blob = new Blob([`Name,Phone,Days Inactive\n${data}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'at_risk_customers.csv';
        a.click();
    };

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
                <button
                    onClick={handleStartCampaign}
                    className="bg-red-600 text-white px-8 py-3 rounded-xl text-[11px] font-bold shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-all uppercase tracking-widest relative z-10 whitespace-nowrap"
                >
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
                    <button
                        onClick={handleExport}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
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
                                    <button
                                        onClick={() => handleWhatsApp(customer)}
                                        className="p-2.5 bg-surface text-text-muted hover:bg-[#25D366] hover:text-white rounded-xl transition-all border border-border"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleCall(customer.phone)}
                                        className="p-2.5 bg-surface text-text-muted hover:bg-primary hover:text-white rounded-xl transition-all border border-border"
                                    >
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

            {/* Campaign Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-20">
                    <div className="bg-white rounded-none w-full max-w-md p-10 shadow-2xl relative animate-in slide-in-from-top-4 duration-300 text-center">
                        <button
                            onClick={() => setShowCampaignModal(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-slate-100 transition-all"
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        {campaignStatus === 'idle' && (
                            <>
                                <div className="w-24 h-24 bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <ShieldAlert className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight mb-3">Execute Retention?</h3>
                                <p className="text-[10px] text-text-secondary font-extrabold uppercase tracking-[0.2em] mb-10 leading-relaxed max-w-xs mx-auto">
                                    Initiating automated broadcast to <span className="text-red-600 font-black">{atRiskCustomers.length} targeted nodes</span>.
                                </p>
                                <div className="space-y-4">
                                    <button
                                        onClick={runCampaign}
                                        className="w-full py-5 bg-text text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-text/20 hover:bg-red-600 transition-all active:scale-[0.98]"
                                    >
                                        CONFIRM PROTOCOL
                                    </button>
                                    <button
                                        onClick={() => setShowCampaignModal(false)}
                                        className="w-full py-5 border border-border bg-white text-text-muted font-black text-[11px] uppercase tracking-[0.2em] hover:bg-surface transition-all active:scale-[0.98]"
                                    >
                                        ABORT OPERATION
                                    </button>
                                </div>
                            </>
                        )}

                        {campaignStatus === 'sending' && (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 border-t-2 border-primary border-r-2 border-surface-alt rounded-full animate-spin mx-auto mb-8"></div>
                                <h3 className="text-xl font-black text-text uppercase tracking-[0.2em]">Transmitting...</h3>
                                <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.3em] mt-4">Syncing {atRiskCustomers.length} Identity Ports</p>
                            </div>
                        )}

                        {campaignStatus === 'complete' && (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight mb-3">Dispatch Confirmed</h3>
                                <p className="text-[10px] text-emerald-700/70 font-extrabold uppercase tracking-[0.2em] mb-10">All communications have been successfully relayed.</p>
                                <button
                                    onClick={() => setShowCampaignModal(false)}
                                    className="w-full py-5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                >
                                    TERMINATE
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
