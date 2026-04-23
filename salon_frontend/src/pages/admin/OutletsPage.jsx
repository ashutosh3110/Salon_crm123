import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Store,
    MapPin,
    Users,
    Filter,
    ChevronRight,
    SearchX,
    Trash2,
    TrendingUp,
    PieChart as PieIcon,
    BarChart3,
    Network
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar
} from 'recharts';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function OutletsPage() {
    const navigate = useNavigate();
    const { outlets, deleteOutlet } = useBusiness();
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [filteredOutlets, setFilteredOutlets] = useState(outlets);

    // Get unique cities for filter
    const cities = ['all', ...new Set(outlets.map(o => o.address?.city || o.city).filter(Boolean))];

    useEffect(() => {
        let result = outlets;
        if (search) {
            result = result.filter(o =>
                o.name?.toLowerCase().includes(search.toLowerCase()) ||
                (o.address?.city || o.city)?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (cityFilter !== 'all') {
            result = result.filter(o => (o.address?.city || o.city) === cityFilter);
        }
        setFilteredOutlets(result);
    }, [search, cityFilter, outlets]);

    const cityData = useMemo(() => {
        const counts = {};
        outlets.forEach(o => {
            const cityName = o.address?.city || o.city || 'UNKNOWN';
            counts[cityName] = (counts[cityName] || 0) + 1;
        });
        return Object.keys(counts).map((city, i) => ({
            name: (city || 'UNKNOWN').toUpperCase(),
            value: counts[city],
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [outlets]);

    const staffingData = useMemo(() => {
        return outlets.slice(0, 6).map((o, i) => ({
            name: (o.name || 'UNNAMED').split(' ')[0],
            staff: o.staffCount,
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [outlets]);

    const stats = useMemo(() => ([
        { label: 'Total Salons', value: outlets.length, icon: Store, color: 'blue', trend: 'Active' },
        { label: 'Total Staff', value: outlets.reduce((s, o) => s + (o.staffCount || 0), 0), icon: Users, color: 'emerald', trend: 'Working' },
        { label: 'Cities Covered', value: cities.length - 1, icon: Network, color: 'orange', trend: 'Locations' },
        { label: 'Business Health', value: 'Excellent', icon: TrendingUp, color: 'violet', trend: 'Online' }
    ]), [outlets, cities]);

    const handleDelete = (id) => {
        if (window.confirm('Delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Manage My Salons</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">Viewing and managing all your salon locations</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-primary hover:text-white transition-all font-mono"
                >
                    <Plus className="w-4 h-4" /> Add New Salon
                </button>
            </div>

            {/* Analytics Grid - Combined Smaller Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-4 border border-border flex flex-col justify-between group hover:border-primary transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <stat.icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">{stat.label}</p>
                                </div>
                                <span className="text-[7px] font-black text-primary uppercase tracking-widest font-mono italic">{stat.trend}</span>
                            </div>
                            <h3 className="text-xl font-black text-text tracking-tighter uppercase font-mono italic">
                                {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* Regional Distribution Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Branches by City</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[80px] w-full z-10 min-h-[80px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={80}>
                            <PieChart>
                                <Pie data={cityData} innerRadius={18} outerRadius={35} paddingAngle={4} dataKey="value" stroke="transparent">
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute bottom-1 right-1 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Network className="w-12 h-12" />
                    </div>
                </div>

                {/* Personnel Density Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Staffing Details</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[80px] w-full z-10 min-h-[80px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={80}>
                            <BarChart data={staffingData}>
                                <Bar dataKey="staff" radius={0}>
                                    {staffingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Staff count per salon</div>
                </div>
            </div>

            {/* Filters - Compact */}
            <div className="bg-white p-2 border border-border shadow-sm flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by salon name or city..."
                        className="w-full pl-14 pr-4 py-3.5 rounded-none border border-border bg-background text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-text-muted/10"
                    />
                </div>
                <div className="flex gap-4 text-left">
                    <div className="relative group text-left">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="text-[9px] font-black uppercase tracking-[0.2em] bg-background border border-border rounded-none pl-12 pr-10 py-3.5 outline-none focus:border-primary cursor-pointer appearance-none min-w-[160px]"
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{(city || 'UNKNOWN').toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Outlets Grid - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-surface border-2 border-dashed border-border group hover:border-primary/30 transition-all">
                        <SearchX className="w-16 h-16 text-text-muted/20 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest italic">No Salons Found</h3>
                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.25em] opacity-60">We couldn't find any salon matching your search.</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet) => (
                        <div
                            key={outlet._id}
                            className="group relative bg-white border border-border overflow-hidden transition-all duration-500 hover:border-primary hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col h-[400px]"
                        >
                            {/* Card Image Banner */}
                            <div className="relative h-48 overflow-hidden bg-slate-100">
                                {outlet.images?.length > 0 ? (
                                    <img 
                                        src={outlet.images[0].startsWith('http') ? outlet.images[0] : `${import.meta.env.VITE_API_URL}${outlet.images[0]}`} 
                                        alt={outlet.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                        <Store className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                {/* Status Tag */}
                                <div className="absolute top-4 left-4">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md border border-white/20 text-[8px] font-black uppercase tracking-widest text-white shadow-xl
                                        ${outlet.isActive !== false ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`} />
                                        {outlet.isActive !== false ? 'Active Unit' : 'Standby'}
                                    </div>
                                </div>

                                {/* Quick Action Icons - Floating */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/outlets/edit/${outlet._id}`); }}
                                        className="w-8 h-8 bg-white text-text flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(outlet._id); }}
                                        className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Location Banner - Bottom Left of Image */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                        <MapPin className="w-3 h-3" />
                                    </div>
                                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                                        {(outlet.address?.city || outlet.city || 'N/A').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between bg-white relative">
                                {/* Decorative Initial */}
                                <div className="absolute top-6 right-6 text-6xl font-black text-slate-50 select-none pointer-events-none group-hover:text-primary/5 transition-colors">
                                    {outlet.name[0]}
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <h3 className="text-lg font-black text-text uppercase italic tracking-tight font-mono leading-tight group-hover:text-primary transition-colors">
                                            {outlet.name}
                                        </h3>
                                        <div className="h-0.5 w-8 bg-primary mt-2 transition-all duration-300 group-hover:w-16" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-3 py-2 border-b border-slate-50">
                                            <Users className="w-4 h-4 text-text-muted" />
                                            <div>
                                                <p className="text-[7px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-50">Total Personnel</p>
                                                <p className="text-[10px] font-black text-text uppercase font-mono">{outlet.staffCount || 0} Professional Staff</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 py-2">
                                            <TrendingUp className="w-4 h-4 text-text-muted" />
                                            <div>
                                                <p className="text-[7px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 opacity-50">Unit Status</p>
                                                <p className={`text-[10px] font-black uppercase italic ${outlet.isActive !== false ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {outlet.isActive !== false ? 'Open & Trading' : 'Temporarily Closed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                    className="group/btn w-full mt-6 py-3.5 bg-background border-2 border-text text-text text-[9px] font-black uppercase tracking-widest transition-all hover:bg-text hover:text-white flex items-center justify-center gap-3 font-mono italic"
                                >
                                    Access Panel <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
