import React from 'react';
import { X, Scissors, Clock, Tag, Building2, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';

export default function ServiceDetailsModal({ isOpen, onClose, service, outlets = [] }) {
    if (!isOpen || !service) return null;

    const serviceOutlets = (!service.outletIds || service.outletIds.length === 0)
        ? outlets
        : outlets.filter(o => service.outletIds.includes(o._id));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-32 bg-primary/5 flex items-center justify-center border-b border-border">
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={onClose} className="p-2 rounded-xl bg-surface/80 backdrop-blur shadow-sm hover:bg-surface transition-all">
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                        <Scissors className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-8 pt-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-text tracking-tight">{service.name}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                {service.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                service.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {service.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface-alt border border-border space-y-1">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Pricing</p>
                            <p className="text-xl font-black text-text">₹{service.price}</p>
                            <p className="text-[10px] font-bold text-rose-500/60 uppercase">+{service.gst}% GST</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-surface-alt border border-border space-y-1">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Duration</p>
                            <p className="text-xl font-black text-text">{service.duration} min</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase">
                                <Clock className="w-3 h-3" /> Standard
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-text uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary" />
                                Available In
                            </h4>
                            <span className="text-[10px] font-bold text-text-muted px-2 py-0.5 rounded-full bg-surface-alt border border-border">
                                {serviceOutlets.length} Outlets
                            </span>
                        </div>
                        
                        <div className="bg-surface-alt rounded-2xl border border-border p-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {serviceOutlets.length === 0 ? (
                                <p className="p-4 text-center text-xs font-bold text-text-muted italic">No outlets assigned</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-1">
                                    {serviceOutlets.map(outlet => (
                                        <div key={outlet._id} className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border/50">
                                            <div className="w-2 h-2 rounded-full bg-primary/40" />
                                            <span className="text-xs font-bold text-text truncate">{outlet.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {service.description && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-text uppercase tracking-widest">Description</h4>
                            <p className="text-sm text-text-secondary leading-relaxed font-medium bg-surface-alt p-4 rounded-2xl border border-border italic">
                                "{service.description}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-surface-alt/50 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-surface border border-border text-sm font-black hover:bg-surface-alt transition-all scale-active shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
