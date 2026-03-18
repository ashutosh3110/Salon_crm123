import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Eye,
    MoreVertical,
    Store,
    MapPin,
    Users,
    Filter,
    Ban,
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
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { useBusiness } from '../../contexts/BusinessContext';
import AnimatedCounter from '../../components/common/AnimatedCounter';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function OutletsPage() {
    const navigate = useNavigate();
    const { outlets, deleteOutlet, toggleOutletStatus } = useBusiness();
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [filteredOutlets, setFilteredOutlets] = useState(outlets);

    // Get unique cities for filter
    const cities = ['all', ...new Set(outlets.map(o => o.city))];

    useEffect(() => {
        let result = outlets;
        if (search) {
            result = result.filter(o =>
                o.name.toLowerCase().includes(search.toLowerCase()) ||
                o.city.toLowerCase().includes(search.toLowerCase())
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
            name: city.toUpperCase(),
            value: counts[city],
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [outlets]);

    const staffingData = useMemo(() => {
        return outlets.slice(0, 6).map((o, i) => ({
            name: o.name.split(' ')[0],
            staff: o.staffCount,
            color: CHART_COLORS[i % CHART_COLORS.length]
        }));
    }, [outlets]);

    const stats = useMemo(() => ([
        { label: 'Total Nodes', value: outlets.length, icon: Store, color: 'blue', trend: 'Network' },
        { label: 'Total Workforce', value: outlets.reduce((s, o) => s + (o.staffCount || 0), 0), icon: Users, color: 'emerald', trend: 'Deployed' },
        { label: 'Active Clusters', value: cities.length - 1, icon: Network, color: 'orange', trend: 'Regions' },
        { label: 'System Pulse', value: 'Prime', icon: TrendingUp, color: 'violet', trend: 'Signal' }
    ]), [outlets, cities]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-6 animate-reveal text-left font-black">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-left">
                <div className="text-left font-black leading-none">
                    <h1 className="text-3xl font-black text-text uppercase tracking-tight leading-none text-left">Business Infrastructure</h1>
                    <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.3em] opacity-60 leading-none text-left">System :: node_management_v2.0 // network_status_online</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center justify-center gap-3 bg-primary text-primary-foreground border border-primary px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Expand Network
                </button>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 text-left font-black">
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-surface py-6 px-8 rounded-none border border-border shadow-sm hover:shadow-xl hover:translate-y-[-2px] transition-all group overflow-hidden relative text-left">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />
                            <div className="relative z-10 flex flex-col justify-between h-full text-left font-black">
                                <div className="flex items-center justify-between mb-4 text-left">
                                    <div className="flex items-center gap-3 text-left">
                                        <stat.icon className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none text-left">{stat.label}</p>
                                    </div>
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.trend}</span>
                                </div>
                                <div className="flex items-end justify-between text-left">
                                    <h3 className="text-3xl font-black text-text tracking-tighter uppercase leading-none text-left">
                                        {typeof stat.value === 'string' ? stat.value : <AnimatedCounter value={stat.value} />}
                                    </h3>
                                    <div className="opacity-20 group-hover:opacity-100 transition-opacity stroke-[2px]">
                                        <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                                            <path d="M1 15C1 15 8.5 12 11.5 10C14.5 8 18.5 14 22.5 15C26.5 16 30.5 8 34.5 6C38.5 4 43.5 10 47.5 11C51.5 12 59 7 59 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Regional Distribution Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Regional Ratio</span>
                        <PieIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={cityData} innerRadius={25} outerRadius={45} paddingAngle={5} dataKey="value" stroke="transparent">
                                    {cityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-left">
                        {cityData.slice(0, 4).map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-left">
                                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: d.color }} />
                                <span className="text-[7px] font-black uppercase text-text-muted leading-none">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personnel Density Chart */}
                <div className="bg-surface p-6 rounded-none border border-border shadow-sm text-left font-black flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 text-left">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Personnel Density</span>
                        <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-[120px] w-full text-left">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffingData}>
                                <Bar dataKey="staff" radius={0}>
                                    {staffingData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }} cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-[7px] font-black uppercase text-text-muted tracking-[0.1em] text-center italic opacity-40">Staff Load / Node</div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-surface p-4 rounded-none border border-border shadow-sm flex flex-col md:flex-row gap-4 text-left font-black">
                <div className="relative flex-1 text-left">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan registry for unit or city..."
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
                                <option key={city} value={city}>{city.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Outlets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left font-black">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-surface border border-border border-dashed text-left">
                        <SearchX className="w-16 h-16 text-text-muted/20 mx-auto mb-8" />
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Nodes Detected</h3>
                        <p className="text-[10px] font-black text-text-muted mt-3 uppercase tracking-[0.25em]">System scan complete with null results.</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet, index) => (
                        <div
                            key={outlet._id}
                            className="group bg-surface rounded-none border border-border p-10 hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-500 relative overflow-hidden text-left font-black"
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rotate-12 transition-all group-hover:bg-primary/10" />

                            <div className="flex justify-between items-start mb-10 text-left">
                                <div className="w-16 h-16 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                                    <Store className="w-7 h-7" />
                                </div>
                                <div className="flex gap-3 text-left">
                                    <button
                                        onClick={() => navigate(`/admin/outlets/edit/${outlet._id}`)}
                                        className="p-3 rounded-none bg-background border border-border text-text-muted hover:text-primary hover:border-primary transition-all shadow-sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(outlet._id)}
                                        className="p-3 rounded-none bg-background border border-border text-text-muted hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-8 text-left leading-none font-black">
                                <div className="flex items-center gap-3 text-left leading-none font-black">
                                    <h3 className="text-2xl font-black text-text group-hover:text-primary transition-colors uppercase tracking-tight leading-none">
                                        {outlet.name}
                                    </h3>
                                    <div className={`w-2 h-2 rounded-none ${outlet.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60 leading-none">
                                    <MapPin className="w-3.5 h-3.5" />
                                    COORD :: {outlet.city.toUpperCase()}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 text-left font-black">
                                <div className="bg-background rounded-none p-5 border border-border/50 text-left font-black">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Workforce</div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-black text-text">{outlet.staffCount} UNIT</span>
                                    </div>
                                </div>
                                <div className="bg-background rounded-none p-5 border border-border/50 text-left font-black">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 opacity-60">Status</div>
                                    <div className="text-sm font-black text-emerald-500 uppercase tracking-tighter">OPERATIONAL</div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                className="w-full py-5 rounded-none border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                Enter Node Dashboard <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
