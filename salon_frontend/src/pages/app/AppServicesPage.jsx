import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Clock, ShoppingBag, Heart, Star, ChevronRight, SlidersHorizontal, Armchair, DoorClosed } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useGender } from '../../contexts/GenderContext';

const ServiceCard = ({ service, onBook, colors, isLight, categories, navigate }) => {
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
            className="group overflow-hidden flex flex-col h-full"
        >
            <div 
                className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => navigate(`/app/service/${service._id || service.id}`)}
            >
                <img
                    src={service.image || fallbackImage}
                    alt={service.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2">
                    <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 text-white text-[8px] font-black uppercase tracking-tighter">
                        <Clock size={8} className="text-[#C8956C]" />
                        <span>{service.duration}m</span>
                    </div>
                </div>
            </div>

            <div className="p-2.5 flex flex-col flex-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#C8956C] mb-0.5">{categoryName}</span>
                <h3 
                    className="text-[12px] font-bold mb-1 line-clamp-1 h-[1.2em] leading-tight cursor-pointer hover:underline underline-offset-2 decoration-[#C8956C]" 
                    style={{ color: colors.text }}
                    onClick={() => navigate(`/app/service/${service._id || service.id}`)}
                >
                    {service.name}
                </h3>
                <p className="text-[10px] mb-3 line-clamp-1 opacity-60 leading-tight" style={{ color: colors.text }}>{service.description || "Premium service."}</p>

                <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[13px] font-black text-[#C8956C]">₹{service.price}</span>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onBook(service._id || service.id)}
                        style={{
                            background: '#C8956C',
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
    const { theme } = useCustomerTheme();
    const { 
        activeOutlet, 
        activeOutletId,
        services: businessServices,
        categories: businessCategories,
        groupedServices,
        isInitializing,
        fetchServices,
        fetchCategories,
        fetchGroupedServices,
        activeSalonId
    } = useBusiness();
    
    const { gender: appGender } = useGender();
    const isLight = theme === 'light';

    useEffect(() => {
        const tid = activeSalonId || localStorage.getItem('active_salon_id');
        if (tid) {
            // Fetch everything we need
            fetchServices(tid);
            fetchCategories(tid);
            fetchGroupedServices(tid);
        }
    }, [activeSalonId, fetchServices, fetchCategories, fetchGroupedServices]);


    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        input: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
    };


    // Filter categories & services by gender on client side too for safety
    const displayGroups = useMemo(() => {
        let groups = (groupedServices || []).map(group => {
            // Filter services in group
            const filteredGroupServices = group.services.filter(s => {
                // Gender match
                const sG = (s.gender || 'both').toLowerCase();
                if (appGender && sG !== 'both' && sG !== appGender.toLowerCase()) return false;

                // Outlet match
                if (activeOutletId) {
                    const oIds = Array.isArray(s.outletIds) ? s.outletIds : [];
                    if (oIds.length > 0 && !oIds.map(id => String(id)).includes(String(activeOutletId))) return false;
                }
                return true;
            });

            return { ...group, services: filteredGroupServices };
        }).filter(group => group.services.length > 0);

        return groups;
    }, [groupedServices, appGender, activeOutletId]);

    const dynamicCategories = useMemo(() => {
        const names = displayGroups.map(g => g.name);
        return ['All', ...names];
    }, [displayGroups]);

    const [searchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isFocused, setIsFocused] = useState(false);

    // Synchronize active category with URL parameter
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setActiveCategory(cat);
        } else {
            setActiveCategory('All');
        }
    }, [searchParams]);

    const finalGroups = useMemo(() => {
        let result = displayGroups;

        if (activeCategory !== 'All') {
            result = result.filter(g => g.name === activeCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.map(g => ({
                ...g,
                services: g.services.filter(s => s.name.toLowerCase().includes(q))
            })).filter(g => g.services.length > 0);
        }

        return result;
    }, [displayGroups, activeCategory, searchQuery]);

    const handleBook = (id) => {
        navigate(`/app/booking?serviceId=${id}`);
    };

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

    if (isInitializing && (!groupedServices || groupedServices.length === 0)) {
        return (
            <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="w-12 h-12 border-4 border-[#C8956C] border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-lg font-black uppercase tracking-widest mb-2">Initializing</h2>
                <p className="text-xs opacity-40 max-w-[200px]">Preparing your premium grooming experience...</p>
            </div>
        );
    }

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4 pt-4 pb-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                {/* Salon Info & Gender Badge */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                            style={{ borderColor: colors.border, background: colors.card, color: colors.text }}
                        >
                            <ArrowLeft size={18} />
                        </motion.button>
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

                {/* Categories - Text Pills */}
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
                                    background: isActive ? 'linear-gradient(135deg, #C8956C 0%, #A06844 100%)' : colors.card,
                                    border: `1.5px solid ${isActive ? 'transparent' : colors.border}`,
                                    color: isActive ? '#fff' : colors.textMuted,
                                    boxShadow: isActive ? '0 4px 12px rgba(200,149,108,0.25)' : 'none',
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
            </div>

            {/* Services Content Grouped by Category */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="px-4 mt-6 space-y-10"
            >
                {finalGroups.map((group) => (
                    <div key={group._id || group.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#C8956C]">{group.name}</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#C8956C]/30 to-transparent" />
                            <span className="text-[10px] font-bold opacity-30">{group.services.length} Items</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                            {group.services.map((service, index) => (
                                <motion.div key={service._id || service.id} variants={fadeUp} custom={index}>
                                    <ServiceCard
                                        service={service}
                                        onBook={handleBook}
                                        colors={colors}
                                        isLight={isLight}
                                        categories={businessCategories}
                                        navigate={navigate}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}


                {finalGroups.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-[#C8956C]/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C8956C]/10">
                            <Search size={32} className="text-[#C8956C] opacity-40" />
                        </div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>No services found</h3>
                        <p className="text-xs opacity-50 px-10 mb-6" style={{ color: colors.text }}>Try searching with a different keyword or browse through categories.</p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const tid = activeSalonId || localStorage.getItem('active_salon_id');
                                if (tid) {
                                    fetchServices(tid);
                                    fetchCategories(tid);
                                    fetchGroupedServices(tid);
                                }
                            }}
                            className="px-6 py-3 bg-[#C8956C] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#C8956C]/20"
                        >
                            Refresh Services
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
