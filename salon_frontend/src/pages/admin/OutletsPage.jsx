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
    const cities = ['all', ...new Set(outlets.map(o => o.city).filter(Boolean))];

    useEffect(() => {
        let result = outlets;
        if (search) {
            result = result.filter(o =>
                o.name?.toLowerCase().includes(search.toLowerCase()) ||
                o.city?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (cityFilter !== 'all') {
            result = result.filter(o => o.city === cityFilter);
        }
        setFilteredOutlets(result);
    }, [search, cityFilter, outlets]);

    const cityData = useMemo(() => {
        const counts = {};
        outlets.forEach(o => {
            counts[o.city] = (counts[o.city] || 0) + 1;
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
                    <div className="h-[80px] w-full z-10">
                        <ResponsiveContainer width="100%" height="100%">
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
                    <div className="h-[80px] w-full z-10">
                        <ResponsiveContainer width="100%" height="100%">
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

            {/* Outlets Grid - Smaller Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-surface border border-border border-dashed text-left">
                        <SearchX className="w-16 h-16 text-text-muted/20 mx-auto mb-8" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Salons Found</h3>
                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.25em]">We couldn't find any salon matching your search.</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet) => (
                        <div
                            key={outlet._id}
                            className="group bg-white border border-border p-4 hover:border-text transition-all duration-300 relative overflow-hidden flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-8 h-8 bg-surface-alt border border-border flex items-center justify-center text-text font-black group-hover:bg-text group-hover:text-white transition-all">
                                    <Store className="w-4 h-4" />
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => navigate(`/admin/outlets/edit/${outlet._id}`)}
                                        className="p-1.5 text-text-muted hover:text-primary transition-colors"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(outlet._id)}
                                        className="p-1.5 text-text-muted hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-1 mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-text uppercase italic tracking-tight font-mono leading-none truncate">
                                        {outlet.name}
                                    </h3>
                                    <div className={`w-1.5 h-1.5 shrink-0 ${outlet.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60 leading-none">
                                    <MapPin className="w-3.5 h-3.5" />
                                    CITY: {(outlet.city || 'N/A').toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 text-left font-black">
                                <div className="bg-background rounded-none p-5 border border-border/50 text-left font-black">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Staff Strength</div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-black text-text">{outlet.staffCount} STAFF</span>
                                    </div>
                                </div>
                                <div className="bg-background rounded-none p-5 border border-border/50 text-left font-black">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Operations</div>
                                    <div className="text-sm font-black text-emerald-500 uppercase tracking-tighter">OPEN FOR BUSINESS</div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                className="w-full py-2 bg-background border border-border text-text-muted text-[8px] font-black uppercase tracking-widest hover:bg-text hover:text-white transition-all font-mono italic flex items-center justify-center gap-2"
                            >
                                Open Salon Dashboard <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
