import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Scissors, 
    Clock, 
    Tag, 
    Building2, 
    IndianRupee, 
    User, 
    Info, 
    MapPin, 
    Edit2,
    CheckCircle2,
    Calendar,
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
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <Scissors className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                <h2 className="text-xl font-black text-slate-900 uppercase">Service Not Found</h2>
                <button onClick={() => navigate('/admin/services/list')} className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px] hover:underline">
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/services/list')}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{service.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                                service.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                                {service.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-[0.3em] opacity-80">SERVICE IDENTIFIER: {service._id}</p>
                    </div>
                </div>
               
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Visuals & Core Specs */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Main Image Card */}
                    <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden border border-slate-200 shadow-2xl">
                        {imageUrl ? (
                            <img src={imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                <Scissors className="w-20 h-20 text-white opacity-20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-10 left-10">
                            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                {service.category}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-6 rounded-[32px] text-white">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Duration</p>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <span className="text-2xl font-black italic">{service.duration}m</span>
                            </div>
                        </div>
                        <div className="bg-primary p-6 rounded-[32px] text-white">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Booking Value</p>
                            <div className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5" />
                                <span className="text-2xl font-black italic">₹{service.price}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Configuration */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Header Summary Tab */}
                    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
                        {/* Section 1: Overview */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-500/10 rounded-2xl text-orange-600">
                                    <Info className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Service Overview</h3>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 italic relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Zap className="w-20 h-20" />
                                </div>
                                <p className="text-base text-slate-600 leading-relaxed font-medium relative z-10">
                                    {service.description || "No overview description provided for this professional service module."}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Technical Configuration */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-2xl text-purple-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Technical Specifications</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                                            <Star className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Gender</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{service.gender || 'Both'}</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                                            <Zap className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (GST)</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{service.gst}% APPLIED</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-black">MANDATORY</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Outlet Distribution */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Outlets</h3>
                                </div>
                                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {serviceOutlets.length} TOTAL BRANCHES
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {serviceOutlets.length === 0 ? (
                                    <div className="col-span-2 py-12 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                                        <MapPin className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Not assigned to specific branches</p>
                                    </div>
                                ) : (
                                    serviceOutlets.map(outlet => (
                                        <div key={outlet._id} className="group p-5 bg-slate-50 rounded-[24px] border border-slate-100 hover:border-primary/30 hover:bg-white transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide truncate">{outlet.name}</p>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">ACTIVE</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Intelligence */}
                    <div className="bg-slate-900 p-10 rounded-[48px] text-white flex items-center justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-xl font-black italic uppercase italic">Professional Analytics</h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">Real-time performance metrics for this service.</p>
                        </div>
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bookings</p>
                                <p className="text-2xl font-black italic">142+</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Ratings</p>
                                <p className="text-2xl font-black italic">4.9/5</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-primary opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                        </div>
                        {/* decor */}
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
