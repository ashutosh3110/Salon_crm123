import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Store,
    MapPin,
    Phone,
    Mail,
    Clock,
    Users,
    CalendarCheck,
    CreditCard,
    ChevronRight,
    Map,
    Info,
    Calendar,
    User,
    ArrowUpRight
} from 'lucide-react';
import api from '../../services/api';

export default function OutletDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [outlet, setOutlet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchOutlet = async () => {
            if (id?.startsWith('mock-')) {
                const mockId = id.split('-')[1];
                const mock = {
                    '1': { _id: 'mock-1', name: 'Grace & Glamour - Downtown', city: 'Mumbai', state: 'Maharashtra', address: '123, Marine Drive, South Mumbai', pincode: '400020', phone: '+91 98765 43210', email: 'downtown@graceglamour.com', status: 'active' },
                    '2': { _id: 'mock-2', name: 'The Royal Salon - Bandra', city: 'Mumbai', state: 'Maharashtra', address: 'B-42, Pali Hill, Bandra West', pincode: '400050', phone: '+91 98765 43211', email: 'bandra@royalsalon.com', status: 'active' },
                    '3': { _id: 'mock-3', name: 'Elegance Spa & Unisex Salon', city: 'Pune', state: 'Maharashtra', address: 'Koregaon Park, Lane 7, Pune', pincode: '411001', phone: '+91 98765 43212', email: 'pune@elegance.com', status: 'inactive' },
                }[mockId];

                if (mock) {
                    setOutlet(mock);
                    setLoading(false);
                    return;
                }
            }

            try {
                const { data } = await api.get(`/outlets/${id}`);
                setOutlet(data.data || data);
            } catch (err) {
                console.error('Failed to fetch outlet:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOutlet();
    }, [id]);

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-none animate-spin" /></div>;
    if (!outlet) return <div className="text-center py-20 text-text-muted font-black uppercase tracking-widest text-[10px]">Registry entity not found</div>;

    const stats = [
        { label: 'Total Staff', value: '12', icon: Users, color: 'text-blue-600 bg-blue-50' },
        { label: "Today's Bookings", value: '8', icon: CalendarCheck, color: 'text-purple-600 bg-purple-50' },
        { label: "Today's Sales", value: '₹4,250', icon: CreditCard, color: 'text-green-600 bg-green-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/admin/outlets')}
                        className="w-10 h-10 rounded-none bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-text uppercase tracking-tight">{outlet.name}</h1>
                            <span className={`px-2.5 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border ${outlet.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {outlet.status} PROXY
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-text-muted mt-1 flex items-center gap-2 uppercase tracking-[0.2em]">
                            <MapPin className="w-3.5 h-3.5 opacity-40" /> {outlet.city}, {outlet.state || 'MISSION CONTROL'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/outlets/edit/${outlet._id}`)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Edit className="w-3.5 h-3.5" /> RECONFIG PROPERTY
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface p-6 rounded-none border border-border shadow-sm flex items-center justify-between group overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-none group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">{stat.label}</p>
                            <p className="text-2xl font-black text-text tracking-tight uppercase">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-none flex items-center justify-center relative z-10 ${stat.color.replace('bg-', 'bg-').replace('50', '10')}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-surface-alt border border-border rounded-none w-fit">
                {['overview', 'staff', 'hours'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-text-muted hover:bg-surface'
                            }`}
                    >
                        {tab} ARRAY
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info or List */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-surface p-8 rounded-none border border-border shadow-sm space-y-8">
                            <h3 className="text-sm font-black text-text uppercase tracking-widest flex items-center gap-3">
                                <Info className="w-4 h-4 text-primary" /> Physical Registry
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">Geo-Spatial Data</p>
                                        <p className="text-sm font-black text-text leading-relaxed uppercase tracking-tight">{outlet.address}</p>
                                        <p className="text-[10px] font-extrabold text-text-muted mt-1 uppercase tracking-widest opacity-60">{outlet.city}, {outlet.state} - {outlet.pincode}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2.5">Communication Pulse</p>
                                        <div className="space-y-3">
                                            <p className="text-sm font-black text-text flex items-center gap-3 uppercase tracking-tight">
                                                <Phone className="w-3.5 h-3.5 text-primary/40" /> {outlet.phone}
                                            </p>
                                            <p className="text-sm font-black text-text flex items-center gap-3 uppercase tracking-tight">
                                                <Mail className="w-3.5 h-3.5 text-primary/40" /> {outlet.email || 'N/A PROTOCOL'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-surface-alt p-6 rounded-none border border-border">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-primary/40" /> Active Pulse
                                        </p>
                                        <p className="text-xl font-black text-text uppercase tracking-tight">09:00 - 21:00 HRS</p>
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" /> SYSTEM ONLINE
                                        </p>
                                    </div>
                                    <button className="w-full py-4 rounded-none bg-surface-alt border border-border border-dashed text-[10px] font-black uppercase tracking-widest text-text hover:bg-surface transition-all">
                                        <Map className="w-4 h-4 mr-2 inline" /> Locate Mapping
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="bg-surface rounded-none border border-border shadow-sm">
                            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface-alt/50">
                                <h3 className="text-sm font-black text-text uppercase tracking-widest">Active Personnel</h3>
                                <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 border border-primary/20">12 UNITS</span>
                            </div>
                            <div className="divide-y divide-border">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-surface-alt transition-all cursor-pointer group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-11 h-11 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                                                S
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-text uppercase tracking-tight">Staff Protocol {i}</p>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Assigned Specialist</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </div>
                                ))}
                                <div className="p-6 text-center border-t border-border bg-surface-alt/20">
                                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">Sync Master Roster</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div className="bg-surface p-8 rounded-none border border-border shadow-sm">
                            <h3 className="text-sm font-black text-text uppercase tracking-widest mb-8">Weekly Operation Loop</h3>
                            <div className="space-y-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="flex items-center justify-between p-5 rounded-none border border-border hover:bg-surface-alt group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-none bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                            <span className="text-sm font-black text-text uppercase tracking-tight">{day}</span>
                                        </div>
                                        <div className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                                            09:00 - 21:00 HRS
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Actions / Small Info */}
                <div className="space-y-6">
                    <div className="bg-primary p-8 rounded-none text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-2">Protocol Override</h4>
                            <p className="text-xl font-black mb-6 uppercase tracking-tight">Management Grid</p>
                            <div className="space-y-3">
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-white/10">
                                    <Users className="w-4 h-4" /> Personnel Roster
                                </button>
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-white/10">
                                    <Calendar className="w-4 h-4" /> Timeline Control
                                </button>
                            </div>
                        </div>
                        <Store className="absolute -right-8 -bottom-8 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-surface p-6 rounded-none border border-border shadow-sm">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 border-b border-border pb-3">Registry Audit</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-none bg-surface-alt border border-border flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-text-muted" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text uppercase tracking-widest">Initial Genesis</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase opacity-60">Admin • Feb 21, 2026</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-none bg-surface-alt border border-border flex items-center justify-center shrink-0">
                                    <Edit className="w-5 h-5 text-text-muted" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text uppercase tracking-widest">Last Mutation</p>
                                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase opacity-60">Manager • PROXY TIME</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
