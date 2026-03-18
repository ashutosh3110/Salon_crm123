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
        { label: 'Total Nodes', value: outlets.length, icon: Store, trend: 'Network' },
        { label: 'Workforce', value: outlets.reduce((s, o) => s + (o.staffCount || 0), 0), icon: Users, trend: 'Deployed' },
        { label: 'Clusters', value: cities.length - 1, icon: Network, trend: 'Regions' },
        { label: 'Pulse', value: 'Prime', icon: TrendingUp, trend: 'Signal' }
    ]), [outlets, cities]);

    const handleDelete = (id) => {
        if (window.confirm('Delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-4 animate-reveal text-left max-w-[1600px] mx-auto pb-8">
            {/* Header - Compact */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-1">
                <div className="text-left font-mono">
                    <h1 className="text-xl font-black text-text uppercase italic tracking-tight leading-none">Business Infrastructure</h1>
                    <p className="text-[9px] font-black text-text-muted mt-1 uppercase tracking-[0.2em] italic">System Core :: Nodes & Network</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center gap-2 bg-text text-background px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-primary hover:text-white transition-all font-mono"
                >
                    <Plus className="w-3.5 h-3.5" /> Expand Network
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

                <div className="bg-white p-4 border border-border flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2 z-10">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">Regions</span>
                        <PieIcon className="w-3 h-3 text-primary" />
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

                <div className="bg-white p-4 border border-border flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2 z-10">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest font-mono">Density</span>
                        <BarChart3 className="w-3 h-3 text-primary" />
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
                        placeholder="Scan for unit or city..."
                        className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border text-[11px] font-bold focus:border-primary outline-none transition-all placeholder:text-[10px] uppercase font-mono"
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
                    <div className="col-span-full py-20 text-center bg-white border border-border border-dashed font-mono uppercase italic">
                        <SearchX className="w-10 h-10 text-text-muted/20 mx-auto mb-4" />
                        <h3 className="text-[10px] font-black text-text-muted tracking-widest leading-none">No Nodes Detected / Scanning Protocol Empty</h3>
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
                                    COORD :: {(outlet.city || 'N/A').toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-surface p-2 border border-border/40">
                                    <p className="text-[7px] font-black text-text-muted uppercase tracking-widest font-mono leading-none mb-1">Asset Load</p>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-2.5 h-2.5 text-primary" />
                                        <span className="text-[10px] font-black text-text font-mono italic">{outlet.staffCount} U</span>
                                    </div>
                                </div>
                                <div className="bg-surface p-2 border border-border/40 flex flex-col justify-center items-center">
                                    <p className="text-[7px] font-black text-text-muted uppercase tracking-widest font-mono leading-none mb-1 text-center w-full">Pulse</p>
                                    <span className="text-[8px] font-black text-emerald-500 font-mono tracking-tighter text-center w-full">LIVE</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                className="w-full py-2 bg-background border border-border text-text-muted text-[8px] font-black uppercase tracking-widest hover:bg-text hover:text-white transition-all font-mono italic flex items-center justify-center gap-2"
                            >
                                Dashboard <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
