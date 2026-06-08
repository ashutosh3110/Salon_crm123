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
    Network,
    ShieldCheck
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
import CustomDropdown from '../../components/common/CustomDropdown';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-border dark:border-slate-700 p-2 rounded-lg shadow-xl pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 m-0 leading-none">
                    {payload[0].name}: <span className="text-primary">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function OutletsPage() {
    const navigate = useNavigate();
    const { outlets, deleteOutlet, fetchOutlets } = useBusiness();
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [filteredOutlets, setFilteredOutlets] = useState(outlets);

    useEffect(() => {
        fetchOutlets();
    }, [fetchOutlets]);

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
        { label: 'Total Salons', value: outlets.length, icon: Store, trend: 'Active Outlets', color: '#B4912B', bgColor: 'rgba(180, 145, 43, 0.15)' },
        { label: 'Cities Covered', value: cities.length - 1, icon: MapPin, trend: 'Locations', color: '#B4912B', bgColor: 'rgba(180, 145, 43, 0.15)' },
        { label: 'Business Health', value: 'Excellent', icon: ShieldCheck, trend: 'Online State', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.15)', valueColor: 'text-emerald-600 dark:text-emerald-500' }
    ]), [outlets, cities]);

    const handleDelete = (id) => {
        if (window.confirm('Delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-5 animate-reveal text-left">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
                <div className="text-left leading-none">
                    <div className="relative inline-block pb-2">
                        <h1 className="text-2xl font-black text-text uppercase tracking-tight leading-none text-left">Manage My Salons</h1>
                        <div className="absolute bottom-0 left-0 h-[3px] w-12 bg-[#B4912B]" />
                    </div>
                    <p className="text-[10px] text-text-muted mt-1.5 uppercase tracking-[0.2em] font-bold opacity-60 leading-none text-left">Viewing and managing all your salon locations</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center gap-2 bg-[#B4912B] hover:bg-[#A57C1E] text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md transition-all !rounded-xl active:scale-95 cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" /> Add New Salon
                </button>
            </div>

            {/* Analytics Grid - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !overflow-hidden !rounded-[16px]">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bgColor, borderRadius: '12px' }}>
                            <stat.icon className="w-5 h-5" color={stat.color} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</span>
                            <h3 className={`text-xl font-black tracking-tight uppercase leading-none mt-1 ${stat.valueColor || 'text-text'}`}>
                                {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                            </h3>
                            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 opacity-60">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Regional Distribution Chart */}
                <div className="!bg-white dark:!bg-slate-900 p-4 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex items-center gap-4 group hover:!border-black dark:hover:!border-white transition-all min-h-[100px] relative !rounded-[16px]">
                    <div className="w-12 h-12 relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={cityData} innerRadius={14} outerRadius={22} paddingAngle={4} dataKey="value" stroke="transparent">
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#B4912B" opacity={1 - (index * 0.2)} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} position={{ y: -65 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text uppercase tracking-wider">Branches by City</span>
                    </div>
                </div>
            </div>

            {/* Filters - Compact */}
            <div className="!bg-white dark:!bg-slate-900 p-1.5 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 flex flex-col md:flex-row gap-2 !rounded-xl items-center shadow-sm">
                <div className="flex items-center gap-3 flex-1 h-10 px-4">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by salon name or city..."
                        className="w-full h-full text-[11px] font-bold uppercase tracking-wider outline-none text-neutral-800 dark:text-neutral-200 bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-transparent !border-none !shadow-none placeholder-slate-400"
                    />
                </div>
                <div className="min-w-[200px] h-9 border-l border-border px-2">
                    <CustomDropdown
                        value={cityFilter}
                        onChange={(val) => setCityFilter(val)}
                        options={cities.map(city => ({
                            label: city === 'all' ? 'ALL CITIES' : city.toUpperCase(),
                            value: city
                        }))}
                        className="w-full h-full [&>.custom-dropdown-trigger]:h-full [&>.custom-dropdown-trigger]:!py-0 [&>.custom-dropdown-trigger]:!border-none [&>.custom-dropdown-trigger]:shadow-none [&>.custom-dropdown-trigger]:bg-transparent [&>.custom-dropdown-trigger]:dark:bg-transparent [&>.custom-dropdown-trigger]:!text-[10px]"
                    />
                </div>
            </div>

            {/* Outlets Grid - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-surface border-2 border-dashed border-border group hover:border-black/30 transition-all rounded-xl">
                        <SearchX className="w-12 h-12 text-text-muted/20 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Salons Found</h3>
                        <p className="text-[10px] text-text-muted mt-2 uppercase tracking-[0.2em] opacity-60">We couldn't find any salon matching your search.</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet) => (
                        <div
                            key={outlet._id}
                            className="group relative !bg-white dark:!bg-slate-900 !border-[1.5px] !border-[#e2e8f0] dark:!border-slate-800 !overflow-hidden transition-all duration-500 hover:!border-black dark:hover:!border-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col h-[350px] !rounded-[24px]"
                        >
                            {/* Card Image Banner */}
                            <div className="relative h-40 overflow-hidden bg-slate-100 flex-shrink-0">
                                {outlet.images?.length > 0 || outlet.image ? (
                                    <img
                                        src={getImageUrl(outlet.images?.[0] || outlet.image)}
                                        alt={outlet.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                                        <Store className="w-12 h-12 opacity-20" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                {/* Status Tag */}
                                <div className="absolute top-3 left-3">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg rounded-full
                                        ${outlet.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                        {outlet.isActive !== false ? 'Active' : 'Standby'}
                                    </div>
                                </div>

                                {/* Location Banner - Bottom Left of Image */}
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                        <MapPin className="w-2.5 h-2.5 text-[#B4912B]" />
                                        <span className="text-[8px] font-bold text-white uppercase tracking-widest drop-shadow-md">
                                            {(outlet.address?.city || outlet.city || 'N/A').toUpperCase()} DIVISION
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Action Icons - Floating */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2 md:translate-x-12 md:opacity-0 opacity-100 translate-x-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/outlets/edit/${outlet._id}`); }}
                                        className="w-7 h-7 bg-white text-text flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-xl !rounded-full"
                                    >
                                        <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(outlet._id); }}
                                        className="w-7 h-7 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl !rounded-full"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="flex-1 p-5 flex flex-col justify-between bg-white dark:bg-slate-900 relative z-10">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-black text-text uppercase tracking-widest leading-tight truncate">
                                            {outlet.name}
                                        </h3>
                                        <div className="h-[2px] w-8 bg-[#B4912B] mt-2 transition-all duration-300 group-hover:w-16" />
                                    </div>

                                    <div className="bg-[#f2fcf7] dark:bg-emerald-950/20 rounded-xl p-3 flex flex-col items-start border border-emerald-50 dark:border-emerald-900/30">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Unit Status</p>
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-text pl-3">
                                            {outlet.isActive !== false ? 'Open & Trading' : 'Temporarily Closed'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                    className="group/btn w-full mt-4 py-3 bg-[#B4912B] hover:bg-[#A57C1E] text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-1.5 !rounded-xl cursor-pointer"
                                >
                                    Access Panel <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
