import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Clock, ShoppingBag, Heart, Star, ChevronRight, SlidersHorizontal, Armchair, DoorClosed } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useGender } from '../../contexts/GenderContext';
import mockData from '../../data/mockServicesPageData.json';

const ServiceCard = ({ service, onBook, colors, isLight }) => {
    const fallbackImage = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop";
    
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            style={{
                background: colors.card,
                borderRadius: '24px',
                border: `1.5px solid ${colors.border}`,
                boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.02)' : '0 10px 30px rgba(0,0,0,0.2)'
            }}
            className="group overflow-hidden flex flex-col h-full"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                    src={service.image || fallbackImage}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm font-black uppercase text-[8px] tracking-tighter">
                        <Clock size={10} className="text-[#C8956C]" />
                        <span>{service.duration}m</span>
                    </div>
                    {service.resourceType && (
                        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm font-black uppercase text-[8px] tracking-tighter">
                            {service.resourceType === 'room' ? <DoorClosed size={10} className="text-[#C8956C]" /> : <Armchair size={10} className="text-[#C8956C]" />}
                            <span>{service.resourceType}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">{service.category}</span>
                    <div className="flex items-center gap-0.5">
                        <Star size={8} fill="#C8956C" color="#C8956C" />
                        <span className="text-[9px] font-bold">4.9</span>
                    </div>
                </div>

                <h3 className="text-[13px] font-bold mb-0.5 line-clamp-1" style={{ color: colors.text }}>{service.name}</h3>
                <p className="text-[10px] mb-3 line-clamp-2 leading-tight" style={{ color: colors.textMuted }}>{service.description || "Premium salon service for your beauty and wellness."}</p>

                <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] opacity-40 font-bold uppercase tracking-tighter">Starts from</span>
                        <span className="text-sm font-black text-[#C8956C]">₹{service.price}</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onBook(service._id || service.id)}
                        style={{
                            background: '#C8956C',
                            borderRadius: '12px 4px 12px 4px',
                            boxShadow: '0 6px 12px rgba(200,149,108,0.2)'
                        }}
                        className="px-3.5 py-1.5 text-white text-[9px] font-black uppercase tracking-wider"
                    >
                        Book
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default function AppServicesPage() {
    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const { 
        activeOutlet, 
        activeOutletId,
        services: contextServices,
        categories: contextCategories,
        isInitializing
    } = useBusiness();
    
    const { gender: appGender } = useGender();
    const isLight = theme === 'light';

    const businessServices = contextServices.length > 0 ? contextServices : mockData.services;
    const businessCategories = contextCategories.length > 0 ? contextCategories : mockData.categories;

    if (isInitializing && businessServices.length === 0) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-[#C8956C] border-t-transparent rounded-full mb-4"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Loading Experience...</p>
            </div>
        );
    }
    
    // Get unique active categories that have at least one active service AND match gender
    const dynamicCategories = useMemo(() => {
        const activeCats = businessCategories
            .filter(c => {
                if (c.status !== 'active') return false;
                if (!appGender) return true;
                // Match gender: 'both', or matches current gender choice
                return c.gender === 'both' || c.gender === appGender;
            })
            .map(c => c.name);
        return ['All', ...activeCats];
    }, [businessCategories, appGender]);

    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    // Check if category exists in canonical list, else use as search
    const isCanonical = dynamicCategories.includes(categoryParam);

    const [searchQuery, setSearchQuery] = useState(isCanonical ? '' : (categoryParam || ''));
    const [activeCategory, setActiveCategory] = useState(isCanonical ? categoryParam : 'All');
    const [isFocused, setIsFocused] = useState(false);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        input: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
    };

    const filteredServices = useMemo(() => {
        let result = businessServices.filter(s => s.status === 'active');

        // Filter by Outlet if outletIds or outletId is present on service
        result = result.filter(s => {
            // Priority: Check the outletIds array (modern multi-outlet assignment)
            if (s.outletIds && Array.isArray(s.outletIds) && s.outletIds.length > 0) {
                // Use .map(String) to ensure we're comparing string IDs (handles ObjectId objects)
                return s.outletIds.map(id => String(id)).includes(String(activeOutletId));
            }

            // Fallback 1: Check the singular outletId (legacy single-outlet assignment)
            if (s.outletId && s.outletId !== 'all') {
                return String(s.outletId) === String(activeOutletId);
            }

            // Fallback 2: Check the "All Outlets" marker or absence of specific assignment
            return !s.outletId || s.outlet === 'All Outlets' || (Array.isArray(s.outletIds) && s.outletIds.length === 0);
        });

        // Filter by Gender (via Category)
        result = result.filter(s => {
            const cat = businessCategories.find(c => c.name === s.category);
            if (!cat) return true; // Show if no category found (edge case)
            if (!appGender) return true;
            return cat.gender === 'both' || cat.gender === appGender;
        });

        if (activeCategory !== 'All') {
            result = result.filter(s => s.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
        }
        return result;
    }, [businessServices, activeCategory, searchQuery, activeOutletId, appGender, businessCategories]);

    const groupedServices = useMemo(() => {
        if (activeCategory !== 'All') return { [activeCategory]: filteredServices };

        const groups = {};
        filteredServices.forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });

        // Filter groups based on search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            Object.keys(groups).forEach(cat => {
                groups[cat] = groups[cat].filter(s => s.name.toLowerCase().includes(q));
                if (groups[cat].length === 0) delete groups[cat];
            });
        }

        return groups;
    }, [filteredServices, activeCategory, searchQuery]);

    const handleBook = (id) => {
        navigate(`/app/book?serviceId=${id}`);
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-4 pb-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                {/* Salon Info & Gender Badge */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C8956C] to-[#A06844] flex items-center justify-center shadow-lg shadow-[#C8956C]/20">
                            <ShoppingBag className="text-white" size={18} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C8956C]">Exclusive Experience</p>
                            <h2 className="text-sm font-black tracking-tight" style={{ color: colors.text }}>{activeOutlet?.name || 'Wapixo Salon'}</h2>
                        </div>
                    </div>

                    {/* Gender Indicator Badge */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-3 py-1.5 rounded-xl border flex items-center gap-2"
                        style={{ 
                            background: appGender === 'men' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                            borderColor: appGender === 'men' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)'
                        }}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${appGender === 'men' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${appGender === 'men' ? 'text-blue-500' : 'text-pink-500'}`}>
                            {appGender === 'men' ? 'Gentlemen' : 'Ladies'}
                        </span>
                    </motion.div>
                </div>


                {/* Search Bar */}
                <div
                    style={{
                        background: isLight
                            ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                            : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                        boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        borderRadius: '20px 6px 20px 6px',
                        border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        padding: '0 16px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                    className="mb-5"
                >
                    <Search size={16} style={{ color: isFocused ? '#C8956C' : colors.textMuted }} />
                    <input
                        type="text"
                        placeholder="Search for services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, width: '100%', fontSize: '13px', fontWeight: 600 }}
                    />
                    <SlidersHorizontal size={16} style={{ color: colors.textMuted }} />
                </div>

                {/* Categories */}
                <div className="app-scroll no-scrollbar flex gap-2 overflow-x-auto -mx-4 px-4">
                    {dynamicCategories.map(cat => (
                        <motion.button
                            key={cat}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                background: activeCategory === cat ? '#C8956C' : colors.card,
                                color: activeCategory === cat ? '#FFFFFF' : colors.text,
                                border: activeCategory === cat ? 'none' : `1.5px solid ${colors.border}`,
                                borderRadius: '14px 4px 14px 4px',
                            }}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Services Content */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="px-4 mt-4 space-y-8"
            >
                {Object.keys(groupedServices).map((categoryName) => (
                    <motion.div key={categoryName} variants={fadeUp} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
                                {appGender === 'men' ? "Gentlemen's " : "Ladies' "}{categoryName}
                            </h2>
                            <span className="text-[9px] font-black text-[#C8956C] bg-[#C8956C]/10 px-2 py-0.5 rounded-full">{groupedServices[categoryName].length} items</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pb-2">
                            {groupedServices[categoryName].map((service) => (
                                <div key={service._id || service.id} className="w-full">
                                    <ServiceCard
                                        service={service}
                                        onBook={handleBook}
                                        colors={colors}
                                        isLight={isLight}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {Object.keys(groupedServices).length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[#C8956C]/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C8956C]/10">
                            <Search size={32} className="text-[#C8956C] opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No services found</h3>
                        <p className="text-xs opacity-50 px-10">Try searching with a different keyword or browse through categories.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
