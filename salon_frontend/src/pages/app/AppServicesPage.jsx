import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import ServiceCard from '../../components/app/ServiceCard';
import { MOCK_SERVICES, SERVICE_CATEGORIES } from '../../data/appMockData';

export default function AppServicesPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // TODO: Replace with api.get('/services?status=active')
    const services = MOCK_SERVICES;

    const filteredServices = useMemo(() => {
        let result = services;
        if (activeCategory !== 'All') {
            result = result.filter(s => s.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q)
            );
        }
        return result;
    }, [services, activeCategory, searchQuery]);

    const handleBook = (service) => {
        navigate(`/app/book?serviceId=${service._id}`);
    };

    return (
        <div className="space-y-7 pb-8">
            {/* Header Area */}
            <div className="pt-2">
                <h1 className="text-2xl font-extrabold text-text tracking-tight">Services</h1>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">Experience premium grooming and care.</p>
            </div>

            {/* Filter Group */}
            <div className="space-y-4">
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Look for a service..."
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-border/60 bg-surface shadow-sm text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-text"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface-alt flex items-center justify-center hover:bg-border/20 transition-colors">
                            <X className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                    )}
                </div>

                {/* Categories */}
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
                    {SERVICE_CATEGORIES.map((cat) => (
                        <motion.button
                            key={cat}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setActiveCategory(cat)}
                            className={`relative px-5 py-2.5 rounded-2xl text-[11px] font-bold whitespace-nowrap tracking-wide transition-all border ${activeCategory === cat
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-surface border-border/60 text-text-secondary hover:border-primary/20'
                                }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Service List Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Available Services</h3>
                    <p className="text-[10px] text-text-muted font-bold">
                        {filteredServices.length} ITEMS
                    </p>
                </div>
                {filteredServices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <p className="text-4xl mb-3">💇‍♀️</p>
                        <p className="text-sm text-text-muted font-medium">No services found</p>
                        <p className="text-xs text-text-muted mt-1">Try a different category or search term</p>
                    </motion.div>
                ) : (
                    filteredServices.map((service, i) => (
                        <ServiceCard
                            key={service._id}
                            service={service}
                            onBook={handleBook}
                            index={i}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
