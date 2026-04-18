import React from 'react';
import { X, Scissors, Clock, Tag, Building2, CheckCircle2, IndianRupee, User, Zap, Info, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../../../services/api';

export default function ServiceDetailsModal({ isOpen, onClose, service, outlets = [] }) {
    if (!isOpen || !service) return null;

    const serviceOutlets = (!service.outletIds || service.outletIds.length === 0)
        ? outlets
        : outlets.filter(o => service.outletIds.includes(o._id));

    const imageUrl = service.image 
        ? (service.image.startsWith('http') ? service.image : `${API_BASE_URL}${service.image}`)
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Visual Header */}
                <div className="relative h-64 flex-shrink-0 group overflow-hidden">
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-slate-900 flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute -inset-8 bg-white/20 blur-3xl rounded-full animate-pulse" />
                                <Scissors className="w-16 h-16 text-white relative z-10" />
                            </div>
                        </div>
                    )}
                    
                    {/* Floating Controls */}
                    <div className="absolute top-6 right-6 z-20 flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 hover:scale-110 active:scale-90 transition-all shadow-2xl"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Bottom Header Info */}
                    <div className="absolute bottom-6 left-8 right-8 z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground text-[9px] font-black uppercase tracking-[0.2em]">
                                {service.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border ${
                                service.status === 'active' 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}>
                                {service.status}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight leading-none uppercase italic">{service.name}</h3>
                    </div>
                </div>

                {/* Content Area - Scrollable */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Technical Specs Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary mb-3 group-hover:rotate-12 transition-transform">
                                <IndianRupee className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pricing</p>
                            <p className="text-lg font-black text-slate-900 leading-none">₹{service.price}</p>
                            <p className="text-[9px] font-black text-rose-500 mt-1 uppercase tracking-tighter">+{service.gst}% GST</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 mb-3 group-hover:rotate-12 transition-transform">
                                <Clock className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timing</p>
                            <p className="text-lg font-black text-slate-900 leading-none">{service.duration}m</p>
                            <p className="text-[9px] font-black text-blue-400 mt-1 uppercase tracking-tighter">ESTIMATED</p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 mb-3 group-hover:rotate-12 transition-transform">
                                <User className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                            <p className="text-lg font-black text-slate-900 leading-none uppercase">{service.gender || 'Both'}</p>
                            <p className="text-[9px] font-black text-purple-400 mt-1 uppercase tracking-tighter">AUDIENCE</p>
                        </div>
                    </div>

                    {/* Outlet Mapping */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Available Locations</h4>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 uppercase tracking-widest">
                                {serviceOutlets.length} Branches
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-[32px] border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                            {serviceOutlets.length === 0 ? (
                                <div className="col-span-2 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    <MapPin className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                    No specific branches assigned
                                </div>
                            ) : (
                                serviceOutlets.map(outlet => (
                                    <div key={outlet._id} className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">{outlet.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    {service.description ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                                    <Info className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Service Overview</h4>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/5 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium italic">
                                    <p className="opacity-80">"{service.description}"</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No detailed description provided for this service</p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-[24px] bg-slate-900 border border-slate-800 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                        Dismiss Details
                    </button>
                </div>
            </div>
        </div>
    );
}

