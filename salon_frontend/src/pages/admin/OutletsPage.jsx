import { useState, useEffect } from 'react';
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
    Trash2
} from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';

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

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this outlet?')) {
            deleteOutlet(id);
        }
    };

    return (
        <div className="space-y-6 animate-reveal">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text uppercase">Business Units</h1>
                    <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest opacity-60">Control your salon network from one place</p>
                </div>
                <button
                    onClick={() => navigate('/admin/outlets/new')}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    <Plus className="w-3.5 h-3.5" /> Expand Network
                </button>
            </div>

            {/* Quick Stats & Search */}
            <div className="bg-surface p-4 rounded-none border border-border shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Scan for unit name or city..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-none bg-surface-alt border border-border text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative group">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="text-[10px] font-extrabold uppercase tracking-widest bg-surface-alt border border-border rounded-none pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none min-w-[140px]"
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Outlets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOutlets.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-surface border border-border rounded-none">
                        <div className="w-16 h-16 bg-surface-alt rounded-none border border-border flex items-center justify-center mx-auto mb-6 opacity-50">
                            <SearchX className="w-8 h-8 text-text-muted" />
                        </div>
                        <h3 className="text-sm font-black text-text uppercase tracking-widest">No Units Found</h3>
                        <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-[0.2em]">Try adjusting your scan parameters</p>
                    </div>
                ) : (
                    filteredOutlets.map((outlet, index) => (
                        <div
                            key={outlet._id}
                            className="group bg-surface rounded-none border border-border p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Decorative Sparkle */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/outlets/edit/${outlet._id}`)}
                                        className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-primary hover:bg-surface transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(outlet._id)}
                                        className="p-2.5 rounded-none bg-surface-alt border border-border text-text-muted hover:text-rose-600 hover:bg-surface transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-text group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">
                                        {outlet.name}
                                    </h3>
                                    <span className={`w-2 h-2 rounded-none ${outlet.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-widest opacity-60">
                                    <MapPin className="w-3 h-3" />
                                    {outlet.city}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-surface-alt rounded-none p-4 border border-border/50">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-50">Personnel</div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-sm font-black text-text">{outlet.staffCount} Staff</span>
                                    </div>
                                </div>
                                <div className="bg-surface-alt rounded-none p-4 border border-border/50">
                                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 opacity-50">Pulse</div>
                                    <div className="text-sm font-black text-emerald-500 uppercase">High</div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/outlets/${outlet._id}`)}
                                className="w-full py-4 rounded-none border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Enter Unit Dashboard <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
