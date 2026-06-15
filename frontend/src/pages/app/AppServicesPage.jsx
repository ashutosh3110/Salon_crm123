import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ShoppingBag, Heart, Star, ChevronRight, SlidersHorizontal, Armchair, DoorClosed, LayoutGrid } from 'lucide-react';
import AppBackButton from '../../components/app/AppBackButton';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useGender } from '../../contexts/GenderContext';
import api from '../../services/api';

import { getImageUrl } from '../../utils/imageUtils';

import { useFavorites } from '../../contexts/FavoritesContext';

const ServiceSkeleton = ({ colors, isLight }) => (
    <div 
        style={{ 
            background: colors.card, 
            borderRadius: '16px', 
            border: `1.5px solid ${colors.border}`,
            boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.03)' : '0 4px 12px rgba(0,0,0,0.2)'
        }} 
        className="flex flex-col h-full overflow-hidden animate-pulse"
    >
        <div className="aspect-square bg-black/5 dark:bg-white/5" />
        <div className="p-2.5 space-y-2 flex-1">
            <div className="h-2 w-12 rounded" style={{ background: `${colors.accent}1a` }} />
            <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded" />
            <div className="h-2 w-3/4 bg-black/5 dark:bg-white/5 rounded" />
            <div className="mt-auto flex items-center justify-between pt-2">
                <div className="h-4 w-10 rounded" style={{ background: `${colors.accent}1a` }} />
                <div className="h-6 w-12 rounded" style={{ background: `${colors.accent}33` }} />
            </div>
        </div>
    </div>
);

const ServiceCard = ({ service, onBook, colors, isLight, categories, navigate, showPrice }) => {
    const { isServiceLiked, toggleServiceLike } = useFavorites();
    const serviceId = service._id || service.id;
    const isLiked = isServiceLiked(serviceId);

    const categoryName = useMemo(() => {
        if (!categories || categories.length === 0) return service.category;
        const cat = categories.find(c => String(c._id) === String(service.category) || c.name === service.category);
        return cat ? cat.name : service.category;
    }, [service.category, categories]);

    const fallbackImage = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop";

    return (
        <motion.div
            whileTap={{ scale: 0.97 }}
            style={{
                background: colors.card,
                borderRadius: '16px',
                border: `1.5px solid ${colors.border}`,
                boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.03)' : '0 4px 12px rgba(0,0,0,0.2)'
            }}
            className="group overflow-hidden flex flex-col h-full relative"
        >
            {/* Like Button */}
            <div className="absolute top-2 right-2 z-20">
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleServiceLike(serviceId);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    style={{ 
                        background: isLiked ? 'rgba(244,63,94,0.2)' : 'rgba(0,0,0,0.2)',
                        border: isLiked ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <Heart 
                        size={14} 
                        className={isLiked ? 'text-rose-500' : 'text-white'} 
                        fill={isLiked ? '#f43f5e' : 'transparent'} 
                    />
                </motion.button>
            </div>

            <div 
                className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => navigate(`/app/service/${service._id || service.id}`)}
            >
                <img
                    src={getImageUrl(service.image) || fallbackImage}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23222222%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20font-weight%3D%22bold%22%3EWapixo%3C%2Ftext%3E%3C%2Fsvg%3E"; 
                    }}
                />
                <div className="absolute bottom-2 left-2">
                    <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 text-white text-[8px] font-black uppercase tracking-tighter">
                        <Clock size={8} style={{ color: colors.accent }} />
                        <span>{service.duration}m</span>
                    </div>
                </div>
            </div>

            <div className="p-2.5 flex flex-col flex-1">
                <span className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: colors.accent }}>{categoryName}</span>
                <h3 
                    className="text-[12px] font-bold mb-1 line-clamp-1 h-[1.2em] leading-tight cursor-pointer hover:underline underline-offset-2" 
                    style={{ color: colors.text, decorationColor: colors.accent }}
                    onClick={() => navigate(`/app/service/${service._id || service.id}`)}
                >
                    {service.name}
                </h3>
                <p className="text-[10px] mb-3 line-clamp-1 opacity-60 leading-tight" style={{ color: colors.text }}>{service.description || "Premium service."}</p>

                <div className="mt-auto flex items-center justify-between pt-1">
                    {showPrice !== false && (
                        <span className="text-[13px] font-black" style={{ color: colors.accent }}>₹{service.price}</span>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onBook(service._id || service.id)}
                        style={{
                            background: colors.accent,
                            borderRadius: '8px 2px 8px 2px',
                        }}
                        className="px-3 py-1.5 text-white text-[9px] font-black uppercase tracking-tighter"
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
    const { theme, colors: themeColors } = useCustomerTheme();
    const { 
        activeOutlet, 
        activeOutletId,
        salon
    } = useBusiness();
    
    const { gender: appGender } = useGender();
    const isLight = theme === 'light';

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const lastFetchedOutletId = useRef(null);

    const fetchServicesData = useCallback(async (force = false) => {
        if (!activeOutletId) {
            setCategories([]);
            setServices([]);
            setIsLoading(false);
            return;
        }

        if (!force && lastFetchedOutletId.current === activeOutletId) return;
        lastFetchedOutletId.current = activeOutletId;

        setIsLoading(true);
        try {
            // Revert back to fetching for outlet
            const servsRes = await api.get(`/services/outlet/${activeOutletId}`);
            const fetchedServices = servsRes.data?.data || [];
            
            setServices(fetchedServices);
            
            // Extract categories from the fetched services since /service-categories might be failing
            const uniqueCatNames = [...new Set(fetchedServices.map(s => s.category || 'Uncategorized'))];
            const inferredCategories = uniqueCatNames.map(name => ({
                _id: name,
                name: name,
                status: 'active'
            }));
            
            setCategories(inferredCategories);
        } catch (err) {
            console.error('Error fetching services page data', err);
            lastFetchedOutletId.current = null; // Allow retry
        } finally {
            setIsLoading(false);
        }
    }, [activeOutletId]);

    useEffect(() => {
        fetchServicesData();
    }, [fetchServicesData]);

    const groupedServices = useMemo(() => {
        const activeServices = services.filter(s => s.status !== 'inactive');
        const activeCategories = categories;
        
        // Track which services were assigned to a formal category
        const assignedServiceIds = new Set();
        
        // Groups from formal categories
        const formalGroups = activeCategories.map(cat => {
            const catServices = activeServices.filter(s => {
                const isMatch = s.category === cat.name || String(s.category) === String(cat._id);
                if (isMatch) assignedServiceIds.add(s._id || s.id);
                return isMatch;
            });
            return { name: cat.name, services: catServices, id: cat._id };
        });

        // Groups for services that didn't match any formal category
        const leftoverServices = activeServices.filter(s => !assignedServiceIds.has(s._id || s.id));
        const leftoverCatNames = [...new Set(leftoverServices.map(s => s.category || 'Uncategorized'))];
        
        const extraGroups = leftoverCatNames.map(name => ({
            name,
            services: leftoverServices.filter(s => (s.category || 'Uncategorized') === name),
            id: `extra-${name}`
        }));

        return [...formalGroups, ...extraGroups].filter(g => g.services.length > 0);
    }, [categories, services]);

    const colors = useMemo(() => ({
        ...themeColors,
        bg: '#FFFFFF',
        card: '#FFFFFF',
        accent: themeColors.accent || '#E7D06E',
        input: themeColors.input || (isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)'),
    }), [themeColors, isLight]);

    // Filter categories & services by gender on client side too for safety
    const displayGroups = useMemo(() => {
        let groups = (groupedServices || []).map(group => {
            // Filter services in group
            const filteredGroupServices = group.services.filter(s => {
                // Gender match
                const sG = (s.gender || 'both').toLowerCase();
                if (appGender && sG !== 'both' && sG !== appGender.toLowerCase()) return false;

                return true;
            });

            return { ...group, services: filteredGroupServices };
        }).filter(group => group.services.length > 0);

        return groups;
    }, [groupedServices, appGender, activeOutletId]);

    const dynamicCategories = useMemo(() => {
        if (displayGroups.length === 0) return [];
        // Sort groups by number of services (popularity)
        const sortedGroups = [...displayGroups].sort((a, b) => b.services.length - a.services.length);
        const names = sortedGroups.map(g => g.name);
        return ['All', ...names];
    }, [displayGroups]);

    const flatServices = useMemo(() => {
        // Collect all services from displayGroups
        let all = displayGroups.flatMap(g => g.services.map(s => ({ ...s, groupName: g.name, groupCount: g.services.length })));
        
        // Sort by groupCount (Popularity of category)
        all.sort((a, b) => b.groupCount - a.groupCount);
        
        return all;
    }, [displayGroups]);

    const [searchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isFocused, setIsFocused] = useState(false);

    // Synchronize active category with URL parameter
    useEffect(() => {
        const cat = searchParams.get('category');
        const search = searchParams.get('search');
        if (cat) {
            setActiveCategory(cat);
        } else {
            setActiveCategory('All');
        }
        if (search) {
            setSearchQuery(search);
        }
    }, [searchParams]);

    const finalServices = useMemo(() => {
        let result = flatServices;

        if (activeCategory !== 'All') {
            result = result.filter(s => s.groupName === activeCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase().replace(/\s/g, '');
            result = result.filter(s => s.name.toLowerCase().replace(/\s/g, '').includes(q));
        }
        

        return result;
    }, [flatServices, activeCategory, searchQuery]);

    const handleBook = (id) => {
        navigate(`/app/booking?serviceId=${id}`);
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };



    if (isLoading) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-[20px] flex items-center justify-center animate-pulse border" style={{ background: `${colors.accent}1a`, borderColor: `${colors.accent}33` }}>
                    <Armchair className="w-8 h-8" style={{ color: colors.accent }} />
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <p style={{ color: colors.text, fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em' }} className="uppercase opacity-60">
                        Curating Services
                    </p>
                    <div className="flex space-x-1.5">
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1 h-1 rounded-full" style={{ background: colors.accent }} />
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 rounded-full" style={{ background: colors.accent }} />
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 rounded-full" style={{ background: colors.accent }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-4 pb-4" style={{ 
                background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 15, 15, 0.85)', 
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${colors.border}`
            }}>
                {/* Salon Info & Gender Badge */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <AppBackButton />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
                                <p className="text-[8px] font-black uppercase tracking-[0.25em] leading-none" style={{ color: colors.accent }}>The Experience</p>
                            </div>
                            <h2 className="text-[15px] font-black tracking-tight leading-tight mt-0.5" style={{ color: colors.text }}>
                                {activeOutlet?.name || 'Wapixo Salon'}
                            </h2>
                        </div>
                    </div>

                    {/* Gender Indicator Badge */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1 rounded-full border flex items-center gap-2 shadow-sm"
                        style={{ 
                            background: isLight ? 'white' : 'rgba(255,255,255,0.03)',
                            borderColor: colors.border
                        }}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${appGender === 'men' ? 'bg-blue-500' : 'bg-pink-500'} shadow-[0_0_8px] ${appGender === 'men' ? 'shadow-blue-500/50' : 'shadow-pink-500/50'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {appGender === 'men' ? 'Men' : 'Women'}
                        </span>
                    </motion.div>
                </div>


                {/* Search Bar */}
                <div
                    style={{
                        background: '#F3F4F6',
                        borderRadius: '9999px',
                        transition: 'all 0.3s ease',
                        padding: '0 16px',
                        height: '46px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                    className="mb-5"
                >
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search for services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#1e293b', width: '100%', fontSize: '14px', fontWeight: 500 }}
                    />
                    <SlidersHorizontal size={16} className="text-slate-400" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <LayoutGrid size={18} style={{ color: colors.accent }} />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Categories</h2>
                </div>

                {dynamicCategories.length <= 1 ? (
                    <div className="px-4 py-3 text-center opacity-50 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                        No categories available
                    </div>
                ) : (
                    <div className="app-scroll no-scrollbar flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
                        {dynamicCategories.map(catName => {
                            const isActive = activeCategory === catName;
                            
                            return (
                                <motion.button
                                    key={catName}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveCategory(catName)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '12px',
                                        background: isActive ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}dd 100%)` : colors.card,
                                        border: `1.5px solid ${isActive ? 'transparent' : colors.border}`,
                                        color: isActive ? '#fff' : colors.textMuted,
                                        boxShadow: isActive ? `0 4px 12px ${colors.accent}40` : 'none',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        whiteSpace: 'nowrap'
                                    }}
                                    className="shrink-0"
                                >
                                    <span style={{ fontSize: '11px', fontWeight: isActive ? 800 : 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {catName}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Services Content Grouped by Category */}
            <div className="px-4 mt-6 mb-3 flex items-center gap-3">
                <Armchair size={18} style={{ color: colors.accent }} />
                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: colors.text }}>Services</h2>
                <div className="h-px flex-1 ml-2" style={{ background: `linear-gradient(to right, ${colors.accent}33, transparent)` }} />
            </div>

            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="px-4 mt-2 space-y-8"
            >
                {finalServices.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                        {finalServices.map((service, index) => (
                            <motion.div key={service._id || service.id} variants={fadeUp} custom={index}>
                                <ServiceCard
                                    service={service}
                                    onBook={handleBook}
                                    colors={colors}
                                    isLight={isLight}
                                    categories={categories}
                                    navigate={navigate}
                                    showPrice={activeOutlet?.showServicePrice !== false && salon?.showServicePrice !== false}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border" style={{ background: `${colors.accent}0d`, borderColor: `${colors.accent}1a` }}>
                            <Search size={32} style={{ color: colors.accent, opacity: 0.4 }} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: colors.text }}>No services available</h3>
                        <p className="text-[10px] font-medium opacity-50 px-10 mb-6" style={{ color: colors.text }}>We couldn't find any services matching your criteria in this outlet.</p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchServicesData()}
                            className="px-8 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                            style={{ background: `linear-gradient(to bottom right, ${colors.accent}, ${colors.accent}dd)`, boxShadow: `0 10px 20px ${colors.accent}33` }}
                        >
                            Refresh Services
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
