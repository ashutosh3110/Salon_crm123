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

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
    if (!outlet) return <div className="text-center py-20 text-text-secondary">Outlet not found</div>;

    const stats = [
        { label: 'Total Staff', value: '12', icon: Users, color: 'text-blue-600 bg-blue-50' },
        { label: "Today's Bookings", value: '8', icon: CalendarCheck, color: 'text-purple-600 bg-purple-50' },
        { label: "Today's Sales", value: '₹4,250', icon: CreditCard, color: 'text-green-600 bg-green-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/outlets')}
                        className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-text-muted hover:text-text transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-text tracking-tight">{outlet.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${outlet.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {outlet.status}
                            </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {outlet.city}, {outlet.state || 'India'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/admin/outlets/edit/${outlet._id}`)}
                    className="btn-secondary self-start sm:self-auto flex items-center gap-2 text-sm py-2"
                >
                    <Edit className="w-4 h-4" /> Edit Outlet
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl w-fit">
                {['overview', 'staff', 'hours'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-text-secondary hover:text-text'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info or List */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
                            <h3 className="font-bold text-text flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" /> Basic Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1.5">Full Address</p>
                                        <p className="text-sm text-text leading-relaxed font-medium">{outlet.address}</p>
                                        <p className="text-sm text-text-secondary mt-1">{outlet.city}, {outlet.state} - {outlet.pincode}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1.5">Contact Details</p>
                                        <div className="space-y-2">
                                            <p className="text-sm text-text flex items-center gap-2 font-medium">
                                                <Phone className="w-3.5 h-3.5" /> {outlet.phone}
                                            </p>
                                            <p className="text-sm text-text flex items-center gap-2 font-medium">
                                                <Mail className="w-3.5 h-3.5" /> {outlet.email || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-surface p-4 rounded-xl border border-border">
                                        <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-2 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" /> Today's Timings
                                        </p>
                                        <p className="text-lg font-bold text-text">09:00 AM - 09:00 PM</p>
                                        <p className="text-xs text-green-600 font-semibold mt-1">Open Now</p>
                                    </div>
                                    <button className="w-full btn-secondary text-sm border-dashed">
                                        <Map className="w-4 h-4 mr-2" /> View on Local Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="bg-white rounded-2xl border border-border shadow-sm">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h3 className="font-bold text-text">Assigned Staff</h3>
                                <span className="text-xs font-semibold text-primary">12 Members</span>
                            </div>
                            <div className="divide-y divide-border">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-surface/30 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                S
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text">Staff Member {i}</p>
                                                <p className="text-xs text-text-secondary">Senior Stylist</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all" />
                                    </div>
                                ))}
                                <div className="p-4 text-center">
                                    <button className="text-xs font-bold text-primary hover:underline">Manage All Staff</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && (
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <h3 className="font-bold text-text mb-6">Weekly Operating Schedule</h3>
                            <div className="space-y-3">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <div key={day} className="flex items-center justify-between p-4 rounded-xl border border-border group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-sm font-semibold text-text">{day}</span>
                                        </div>
                                        <div className="text-sm font-medium text-text-secondary">
                                            09:00 AM - 09:00 PM
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Actions / Small Info */}
                <div className="space-y-6">
                    <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1 font-mono">Operations</h4>
                            <p className="text-xl font-bold mb-4">Quick Management</p>
                            <div className="space-y-2">
                                <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> Shift Roster
                                </button>
                                <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Manage Calendar
                                </button>
                            </div>
                        </div>
                        <Store className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-border shadow-sm">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Admin Audit</h4>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-text-muted" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-text">Created by Admin</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Feb 21, 2026 • 12:30 PM</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center shrink-0">
                                    <Edit className="w-4 h-4 text-text-muted" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-text">Last edited by Manager</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Today • 02:45 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
