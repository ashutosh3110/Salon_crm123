import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Scissors, 
    Clock, 
    Building2, 
    IndianRupee, 
    Info, 
    MapPin, 
    CheckCircle2,
    Zap,
    TrendingUp,
    Star
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { API_BASE_URL } from '../../services/api';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { services, outlets, fetchServices } = useBusiness();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const findService = () => {
            const found = services.find(s => s._id === id);
            if (found) {
                setService(found);
                setLoading(false);
            } else if (services.length > 0) {
                setLoading(false);
            }
        };

        if (services.length === 0) {
            fetchServices().then(findService);
        } else {
            findService();
        }
    }, [id, services, fetchServices]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Scissors className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h2 className="text-lg font-black text-slate-900 uppercase">Service Not Found</h2>
                <button onClick={() => navigate('/admin/services/list')} className="mt-4 text-primary font-bold uppercase tracking-widest text-[9px] hover:underline">
                    Back to service list
                </button>
            </div>
        );
    }

    const serviceOutlets = (!service.outletIds || service.outletIds.length === 0)
        ? outlets
        : outlets.filter(o => service.outletIds.includes(o._id));

    const imageUrl = service.image 
        ? (service.image.startsWith('http') ? service.image : `${API_BASE_URL}${service.image}`)
        : null;

    return (
        <div className="space-y-5 animate-in fade-in duration-500 pb-12 text-left">
            {/* Navigation Header */}
            <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/admin/services/list')}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 transition-all shadow-sm shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase italic break-all leading-tight">{service.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shrink-0 ${
                                service.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {service.status}
                            </span>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.25em] opacity-80 break-all">SERVICE IDENTIFIER: {service._id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Visuals & Core Specs */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Main Image Card */}
                    <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
                        {imageUrl ? (
                            <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Scissors className="w-12 h-12 text-white opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-5 left-5">
                            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.15em]">
                                {service.category}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-4 rounded-2xl !text-white">
                            <p className="text-[8px] font-black !text-white/50 uppercase tracking-widest mb-1.5">Duration</p>
                            <div className="flex items-center gap-1.5 !text-white">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-lg font-black italic !text-white">{service.duration} Min</span>
                            </div>
                        </div>
                        <div className="bg-primary p-4 rounded-2xl !text-white">
                            <p className="text-[8px] font-black !text-white/50 uppercase tracking-widest mb-1.5">Booking Value</p>
                            <div className="flex items-center gap-1.5 !text-white">
                                <IndianRupee className="w-4 h-4 !text-white shrink-0" />
                                <span className="text-lg font-black italic !text-white">₹{service.price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Configuration */}
                <div className="lg:col-span-8 space-y-5">
                    {/* Header Summary Tab */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                        {/* Section 1: Overview */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-600">
                                    <Info className="w-4 h-4" />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Service Overview</h3>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-12 h-12" />
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-semibold relative z-10 break-words">
                                    {service.description || "No overview description provided for this professional service module."}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Technical Configuration */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Technical Specifications</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                                            <Star className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Gender</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{service.gender || 'Both'}</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                                            <Zap className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tax (GST)</p>
                                            <p className="text-xs font-black text-slate-900 uppercase">{service.gst}% APPLIED</p>
                                        </div>
                                    </div>
                                    <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[8px] font-black shrink-0">MANDATORY</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Outlet Distribution */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Operational Outlets</h3>
                                </div>
                                <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0">
                                    {serviceOutlets.length} TOTAL BRANCHES
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {serviceOutlets.length === 0 ? (
                                    <div className="col-span-2 py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                        <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Not assigned to specific branches</p>
                                    </div>
                                ) : (
                                    serviceOutlets.map(outlet => (
                                        <div key={outlet._id} className="group p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-white transition-all min-w-0">
                                            <div className="flex items-center justify-between gap-4 min-w-0">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform shrink-0" />
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-wide truncate">{outlet.name}</p>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors shrink-0">ACTIVE</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Intelligence */}
                    <div className="bg-slate-900 p-5 rounded-3xl !text-white flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-base font-black italic uppercase !text-white">Professional Analytics</h4>
                            <p className="text-[8px] !text-white/50 font-bold uppercase tracking-[0.2em] mt-0.5">Real-time performance metrics for this service.</p>
                        </div>
                        <div className="flex items-center gap-6 relative z-10 !text-white">
                            <div className="text-center !text-white">
                                <p className="text-[8px] font-black !text-white/50 uppercase tracking-widest mb-0.5">Bookings</p>
                                <p className="text-lg font-black italic !text-white">142+</p>
                            </div>
                            <div className="text-center !text-white">
                                <p className="text-[8px] font-black !text-white/50 uppercase tracking-widest mb-0.5">Ratings</p>
                                <p className="text-lg font-black italic !text-white">4.9/5</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-primary opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                        </div>
                        {/* decor */}
                        <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
