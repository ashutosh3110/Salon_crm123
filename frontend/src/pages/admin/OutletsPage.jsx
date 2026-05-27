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
    Network
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';
import { getImageUrl } from '../../utils/imageUtils';

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
        if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            result = result.filter(o => {
                const nameMatch = String(o.name || '').toLowerCase().includes(term);
                const cityValue = o.address?.city || o.city || '';
                const cityMatch = String(cityValue).toLowerCase().includes(term);
                return nameMatch || cityMatch;
            });
        }
        if (cityFilter !== 'all') {
            result = result.filter(o => {
                const cityValue = o.address?.city || o.city || '';
                return String(cityValue) === String(cityFilter);
            });
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
            value: counts[city]
        }));
    }, [outlets]);

    const stats = useMemo(() => ([
        { label: 'Total Salons', value: outlets.length, icon: Store, trend: 'Active Outlets' },
        { label: 'Cities Covered', value: cities.length - 1, icon: Network, trend: 'Locations' },
        { label: 'Business Health', value: 'Excellent', icon: TrendingUp, trend: 'Online State' }
    ]), [outlets, cities]);

    const handleDelete = (id) => {
        if (window.confirm('Delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
                <div className="text-left leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Manage My Salons</h1>
                    <p className="text-xs text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60 leading-none text-left">Viewing and managing all your salon locations</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-neutral-800 transition-all rounded-lg active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add New Salon
                </button>
            </div>

            {/* Analytics Grid - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 border border-border dark:border-slate-800 flex flex-col justify-between group hover:border-black dark:hover:border-white transition-all min-h-[140px] relative overflow-hidden rounded-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                            <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-800 flex items-center justify-center rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                <stat.icon className="w-4 h-4 text-text-muted group-hover:text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-black text-text tracking-tight uppercase leading-none">
                                {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                            </h3>
                            <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-2 inline-block opacity-60">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Regional Distribution Chart */}
                <div className="bg-white dark:bg-slate-900 p-5 border border-border dark:border-slate-800 flex flex-col justify-between group hover:border-black dark:hover:border-white transition-all min-h-[140px] relative overflow-hidden rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Branches by City</span>
                        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-800 flex items-center justify-center rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                            <PieIcon className="w-4 h-4 text-text-muted group-hover:text-white" />
                        </div>
                    </div>
                    <div className="h-[60px] w-full flex items-center justify-center mt-3 z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={cityData} innerRadius={12} outerRadius={25} paddingAngle={4} dataKey="value" stroke="transparent">
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#000000" opacity={1 - (index * 0.2)} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', fontSize: '10px', fontWeight: '700' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters - Compact */}
            <div className="bg-white dark:bg-slate-900 p-3 border border-border dark:border-slate-800 flex flex-col md:flex-row gap-3 rounded-xl">
                <div className="flex items-center gap-3 flex-1 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 px-4 py-1.5 rounded-lg">
                    <Search className="w-4 h-4 text-text-muted shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by salon name or city..."
                        className="w-full py-1.5 text-sm font-bold uppercase tracking-wider outline-none text-neutral-800 dark:text-neutral-200 bg-transparent border-0 focus:ring-0 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 min-w-[200px] bg-white dark:bg-slate-800 border border-border dark:border-slate-700 px-4 py-1.5 rounded-lg relative">
                    <Filter className="w-4 h-4 text-text-muted shrink-0 pointer-events-none" />
                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full py-1.5 pr-6 text-sm font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-neutral-800 dark:text-neutral-200 bg-transparent border-0 focus:ring-0 focus:outline-none"
                    >
                        {cities.map(city => (
                            <option key={city} value={city} className="bg-white dark:bg-slate-800 text-neutral-800 dark:text-neutral-200">
                                {city === 'all' ? 'ALL CITIES' : city.toUpperCase()}
                            </option>
                        ))}
                    </select>
                    {/* Custom Select Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">▼</div>
                </div>
            </div>

            {/* Outlets Grid - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-surface border-2 border-dashed border-border group hover:border-black/30 transition-all rounded-xl">
                        <SearchX className="w-16 h-16 text-text-muted/20 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Salons Found</h3>
                        <p className="text-xs text-text-muted mt-3 uppercase tracking-[0.2em] opacity-60">We couldn't find any salon matching your search.</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet) => (
                        <div
                            key={outlet._id}
                            className="group relative bg-white border border-border overflow-hidden transition-all duration-500 hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col h-[400px] rounded-xl"
                        >
                            {/* Card Image Banner */}
                            <div className="relative h-48 overflow-hidden bg-slate-100 flex-shrink-0">
                                {outlet.images?.length > 0 || outlet.image ? (
                                    <img
                                        src={getImageUrl(outlet.images?.[0] || outlet.image)}
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
                                    <div className={`flex items-center gap-2 px-3 py-1.5 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white shadow-xl rounded-lg
                                        ${outlet.isActive !== false ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        {outlet.isActive !== false ? 'Active' : 'Standby'}
                                    </div>
                                </div>

                                {/* Quick Action Icons - Floating */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 md:translate-x-12 md:opacity-0 opacity-100 translate-x-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/outlets/edit/${outlet._id}`); }}
                                        className="w-8 h-8 bg-white text-text flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl rounded-lg"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(outlet._id); }}
                                        className="w-8 h-8 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl rounded-lg"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Location Banner - Bottom Left of Image */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white/20 backdrop-blur-md flex items-center justify-center text-white rounded">
                                        <MapPin className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em] drop-shadow-md">
                                        {(outlet.address?.city || outlet.city || 'N/A').toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between bg-white relative">
                                {/* Decorative Initial */}
                                <div className="absolute top-6 right-6 text-6xl font-black text-slate-50 select-none pointer-events-none group-hover:text-black/5 transition-colors">
                                    {outlet.name[0]}
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <h3 className="text-lg font-black text-text uppercase tracking-tight leading-tight group-hover:text-black transition-colors">
                                            {outlet.name}
                                        </h3>
                                        <div className="h-0.5 w-8 bg-black mt-2 transition-all duration-300 group-hover:w-16" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <div className="flex items-center gap-3 py-2">
                                            <TrendingUp className="w-4 h-4 text-text-muted" />
                                            <div>
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none mb-1 opacity-50">Unit Status</p>
                                                <p className={`text-xs font-bold uppercase ${outlet.isActive !== false ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {outlet.isActive !== false ? 'Open & Trading' : 'Temporarily Closed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                    className="group/btn w-full mt-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 rounded-lg"
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
