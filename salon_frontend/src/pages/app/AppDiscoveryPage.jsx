import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, MapPin, Star, Filter, Compass, Clock, ChevronRight, LayoutGrid, List, Heart } from 'lucide-react';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useBusiness } from '../../contexts/BusinessContext';

export default function AppDiscoveryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { colors, isLight } = useCustomerTheme();
    const { isSalonLiked, toggleSalonLike } = useFavorites();
    const { outlets: businessOutlets, services: businessServices } = useBusiness();

    const categoryParam = searchParams.get('category');
    const serviceIdParam = searchParams.get('serviceId');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [isFocused, setIsFocused] = useState(false);

    // Find service name if serviceId is provided
    const targetService = useMemo(() => {
        if (!serviceIdParam) return null;
        return businessServices.find(s => s._id === serviceIdParam || s.id === serviceIdParam);
    }, [serviceIdParam, businessServices]);

    const filteredSalons = useMemo(() => {
        let salons = businessOutlets;

        // Filter by category
        if (categoryParam) {
            salons = salons.filter(salon =>
                salon.categories?.some(cat => cat.toLowerCase() === categoryParam.toLowerCase()) ||
                salon.name.toLowerCase().includes(categoryParam.toLowerCase())
            );
        }

        // Filter by service
        if (serviceIdParam && targetService) {
            salons = salons.filter(salon =>
                salon.categories?.includes(targetService.category)
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            salons = salons.filter(salon =>
                salon.name.toLowerCase().includes(q) ||
                salon.address.toLowerCase().includes(q)
            );
        }

        return salons;
    }, [categoryParam, serviceIdParam, targetService, searchQuery]);

    const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="pb-24">
            {/* Header Sticky Section */}
            <div className="sticky top-0 z-40 px-4 pt-1 pb-4" style={{ background: colors.bg, backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        style={{ color: colors.text }}
                        className="p-2 -ml-2 hover:opacity-60 transition-opacity"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-black uppercase tracking-widest italic" style={{ color: colors.text }}>
                        Discovery
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                            style={{
                                background: colors.card,
                                border: `1.5px solid ${colors.border}`,
                                color: colors.text
                            }}
                            className="p-2 rounded-xl shadow-sm"
                        >
                            {viewMode === 'list' ? <LayoutGrid size={18} /> : <List size={18} />}
                        </button>
                    </div>
                </div>

                {/* Subtitle / Filter Info */}
                {(categoryParam || serviceIdParam) && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8956C] bg-[#C8956C]/10 px-3 py-1 rounded-full border border-[#C8956C]/20">
                            {categoryParam ? `Category: ${categoryParam}` : `Service: ${targetService?.name}`}
                        </span>
                        <button
                            onClick={() => navigate('/app/discovery')}
                            className="text-[10px] font-bold opacity-40 hover:opacity-100"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* Search Bar */}
                <div style={{ paddingBottom: '8px' }}>
                    <div className="relative w-full" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 14px',
                        height: '42px',
                        background: isLight
                            ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                            : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                        boxShadow: isLight
                            ? 'inset 0 1px 3px rgba(0,0,0,0.03)'
                            : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                        borderRadius: '20px 6px 20px 6px',
                        border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <Search className="w-4 h-4 mr-2" style={{ color: isFocused ? '#C8956C' : colors.textMuted }} />
                        <input
                            type="text"
                            placeholder="Search salons by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            style={{ background: 'transparent', border: 'none', color: colors.text, outline: 'none', width: '100%', fontSize: '14px', fontWeight: 500 }}
                            className="placeholder:opacity-60"
                        />
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="px-4 mt-2"
            >
                <div className="flex items-center justify-between mb-6 px-1">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>
                        {filteredSalons.length} Salons Available
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: colors.accent }}>
                        <Compass size={12} /> Near You
                    </div>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-4"}>
                    <AnimatePresence>
                        {filteredSalons.map((salon) => (
                            <motion.div
                                key={salon._id}
                                variants={fadeUp}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/app/salon/${salon._id}${serviceIdParam ? `?serviceId=${serviceIdParam}` : ''}`)}
                                style={{
                                    background: colors.card,
                                    borderRadius: '28px',
                                    border: `1.5px solid ${colors.border}`,
                                    boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.02)' : '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                                className="group overflow-hidden cursor-pointer relative"
                            >
                                {/* Image Section */}
                                <div className={viewMode === 'grid' ? "h-32 relative" : "h-48 relative"}>
                                    <img
                                        src={salon.image}
                                        alt={salon.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                    {/* Badges on Image */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/20">
                                            <Star size={10} fill="#C8956C" color="#C8956C" />
                                            <span className="text-[10px] font-black">{salon.rating}</span>
                                        </div>
                                    </div>

                                    {salon.isMain && (
                                        <div className="absolute top-4 right-4 bg-[#C8956C] text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                                            Premium
                                        </div>
                                    )}

                                    {/* Like Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.8 }}
                                        onClick={(e) => { e.stopPropagation(); toggleSalonLike(salon._id); }}
                                        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white z-10"
                                    >
                                        <Heart size={14} className={isSalonLiked(salon._id) ? 'fill-red-500 text-red-500' : ''} />
                                    </motion.button>
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-black tracking-tight leading-tight group-hover:text-[#C8956C] transition-colors" style={{ color: colors.text }}>
                                            {salon.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-3 opacity-60">
                                        <MapPin size={12} className="text-[#C8956C]" />
                                        <span className="text-[10px] font-bold line-clamp-1">{salon.address}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {salon.categories?.slice(0, 3).map(cat => (
                                            <span key={cat} className="text-[8px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md" style={{ color: colors.textMuted }}>
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-dashed" style={{ borderColor: colors.border }}>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-[#C8956C]" />
                                            <span className="text-[10px] font-bold" style={{ color: colors.textMuted }}>Open Now</span>
                                        </div>
                                        {serviceIdParam ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/app/book?outletId=${salon._id}&serviceId=${serviceIdParam}`);
                                                }}
                                                className="bg-[#C8956C] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#C8956C]/20"
                                            >
                                                Select
                                            </button>
                                        ) : (
                                            <div className="text-[11px] font-black text-[#C8956C] flex items-center gap-1">
                                                {salon.distance} <ChevronRight size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredSalons.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-24 h-24 bg-[#C8956C]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C8956C]/10">
                            <Compass size={40} className="text-[#C8956C] opacity-30" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Salons Discovered</h3>
                        <p className="text-sm opacity-50 px-10 max-w-sm mx-auto">
                            We couldn't find any salons matching your current criteria. Try expanding your search or clearing filters.
                        </p>
                        <button
                            onClick={() => navigate('/app/discovery')}
                            className="mt-6 text-[#C8956C] text-xs font-black uppercase tracking-widest border-b-2 border-[#C8956C] pb-1"
                        >
                            View All Salons
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
