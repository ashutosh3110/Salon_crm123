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
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl font-extrabold text-text">Our Services</h1>
                <p className="text-xs text-text-muted mt-0.5">Choose from our premium collection</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services…"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 transition-all"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
                {SERVICE_CATEGORIES.map((cat) => (
                    <motion.button
                        key={cat}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setActiveCategory(cat)}
                        className={`relative px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'bg-white border border-border text-text-secondary hover:border-primary/30'
                            }`}
                    >
                        {cat}
                        {activeCategory === cat && (
                            <motion.div
                                layoutId="serviceCategoryPill"
                                className="absolute inset-0 bg-primary rounded-xl -z-10"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Results Count */}
            <p className="text-[11px] text-text-muted font-medium">
                {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            </p>

            {/* Service List */}
            <div className="space-y-2.5">
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
