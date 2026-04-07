import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Star, Clock, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const getDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function SalonSelectionPage() {
    const { outlets, outletsLoading, fetchOutlets, setActiveOutletId } = useBusiness();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocating, setIsLocating] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [displayLocation, setDisplayLocation] = useState('Detecting...');
    const [customLocation, setCustomLocation] = useState('');
    const [isModalSearchFocused, setIsModalSearchFocused] = useState(false);
    const [locationFetchError, setLocationFetchError] = useState('');

    const POPULAR_CITIES = [
        { name: 'Gomti Nagar, Lucknow', lat: 26.8467, lng: 80.9462 },
        { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
        { name: 'Indore', lat: 22.7196, lng: 75.8577 },
        { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
        { name: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
        { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
        { name: 'Salt Lake, Kolkata', lat: 22.5697, lng: 88.4124 },
        { name: 'Anna Nagar, Chennai', lat: 13.0839, lng: 80.2101 },
    ];

    const findCoordsForLocation = (locationText) => {
        if (!locationText?.trim()) return null;
        const text = locationText.trim().toLowerCase();
        const match = POPULAR_CITIES.find(c => {
            const cityName = c.name.toLowerCase();
            const parts = cityName.split(',').map(p => p.trim());
            return cityName.includes(text) || parts.some(p => text.includes(p) || p.includes(text));
        });
        return match ? { lat: match.lat, lng: match.lng } : null;
    };

    const applyCustomLocation = async () => {
        const trimmed = customLocation?.trim();
        setLocationFetchError('');
        if (trimmed) {
            setDisplayLocation(trimmed);
            let coords = findCoordsForLocation(trimmed);
            if (!coords) {
                setIsLocating(true);
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ', India')}&limit=1`,
                        { headers: { 'Accept-Language': 'en', 'User-Agent': 'WapixoSalonApp/1.0' } }
                    );
                    const data = await res.json();
                    if (data?.[0]) {
                        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                    }
                } catch (e) {
                    console.warn('Geocoding failed:', e);
                }
                if (!coords) {
                    setIsLocating(false);
                    setLocationFetchError('Location not found. Try another spelling or pick a popular city.');
                    return;
                }
                setUserLocation(coords);
                setIsLocating(false);
            } else {
                setUserLocation(coords);
            }
            setCustomLocation('');
            setShowLocationModal(false);
            return;
        }
        setShowLocationModal(false);
    };

    const colors = {
        bg: isLight ? '#FCF9F6' : '#040404',
        card: isLight ? '#FFFFFF' : '#0F0F0F',
        text: isLight ? '#1A1A1A' : '#F5F5F5',
        textMuted: isLight ? '#666' : '#888888',
        accent: '#C8956C', // Warm Gold
        accentLight: '#E5B58C',
        border: isLight ? '#EEEEEE' : '#1A1A1A',
        glassBorder: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
        subtleGlow: 'rgba(200, 149, 108, 0.05)'
    };

    const DEFAULT_RADIUS_KM = 10;
    const RADIUS_OPTIONS = [3, 5, 10, 25];
    const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM);

    const latestCoordsRef = useRef(null);

    useEffect(() => {
        let watchId = null;
        let timeoutId = null;
        let settled = false;

        const reverseGeocode = async (lat, lng) => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30";
                const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
                const data = await res.json();
                if (data.status === 'OK' && data.results.length > 0) {
                    const components = data.results[0].address_components;
                    const neighborhood = components.find(c => c.types.includes('neighborhood'))?.long_name;
                    const sublocality = components.find(c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))?.long_name;
                    const locality = components.find(c => c.types.includes('locality'))?.long_name;
                    const primary = neighborhood || sublocality || locality;
                    const secondary = (primary !== locality) ? locality : '';
                    setDisplayLocation(primary ? (secondary ? `${primary}, ${secondary}` : primary) : 'Nearby Your Position');
                } else {
                    setDisplayLocation('Nearby Your Position');
                }
            } catch (err) {
                setDisplayLocation('Nearby Your Position');
            }
        };

        const settle = (lat, lng) => {
            if (settled) return;
            settled = true;
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (timeoutId) clearTimeout(timeoutId);
            setUserLocation({ lat, lng });
            setIsLocating(false);
            reverseGeocode(lat, lng);
        };

        const handleSuccess = (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            latestCoordsRef.current = { lat: latitude, lng: longitude };
            setUserLocation(prev => prev ? prev : { lat: latitude, lng: longitude });
            if (accuracy < 500) settle(latitude, longitude);
        };

        const handleError = () => {
            settle(22.7196, 75.8577);
            setDisplayLocation('Indore, Madhya Pradesh');
        };

        if (navigator.geolocation) {
            setIsLocating(true);
            setDisplayLocation('Reading environment...');
            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
                enableHighAccuracy: true, timeout: 30000, maximumAge: 0
            });
            timeoutId = setTimeout(() => {
                const coords = latestCoordsRef.current;
                if (coords) settle(coords.lat, coords.lng);
                else handleError();
            }, 10000);
        } else {
            handleError();
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (userLocation && localStorage.getItem('customer_token')) {
            fetchOutlets({ lat: userLocation.lat, lng: userLocation.lng, radius: searchRadiusKm });
        }
    }, [userLocation?.lat, userLocation?.lng, searchRadiusKm]);

    const processedOutlets = useMemo(() => {
        if (!userLocation) return outlets;
        const latU = userLocation.lat, lngU = userLocation.lng;
        return outlets
            .filter(o => {
                const lat = o.latitude ?? o.lat;
                const lng = o.longitude ?? o.lng;
                return lat != null && lng != null;
            })
            .map(o => {
                const lat = o.latitude ?? o.lat;
                const lng = o.longitude ?? o.lng;
                const distance = o.distanceKm ?? getDistance(latU, lngU, lat, lng);
                return { ...o, distance };
            })
            .sort((a, b) => a.distance - b.distance);
    }, [outlets, userLocation]);

    const filteredOutlets = processedOutlets.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const otherOutlets = useMemo(() => {
        if (searchQuery.trim()) {
            return outlets.filter(o => {
                const isNearby = filteredOutlets.some(f => f._id === o._id);
                const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     o.address?.toLowerCase().includes(searchQuery.toLowerCase());
                return !isNearby && matchesSearch;
            });
        }
        return outlets.filter(o => !filteredOutlets.some(f => f._id === o._id));
    }, [outlets, filteredOutlets, searchQuery]);

    const handleSelect = (id) => {
        setActiveOutletId(id);
        navigate('/app');
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col relative overflow-x-hidden pt-12 pb-16">
            
            {/* Ambient Background */}
            {!isLight && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-[5%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[130px]" 
                         style={{ background: 'radial-gradient(circle, rgba(200,149,108,0.12) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[110px]" 
                         style={{ background: 'radial-gradient(circle, rgba(200,149,108,0.1) 0%, transparent 70%)' }} />
                </div>
            )}

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-7 relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border" 
                              style={{ color: colors.accent, borderColor: 'rgba(200,149,108,0.2)', backgroundColor: 'rgba(200,149,108,0.05)' }}>
                            Premium Selection
                        </span>
                    </motion.div>
                    
                    <h1 className="text-[2.75rem] font-serif italic text-white text-center leading-[1.1] mb-2">
                        Discover <span className="font-normal" style={{ color: colors.accent }}>Wapixo</span>
                    </h1>
                    <p className="text-[11px] font-medium opacity-30 uppercase tracking-[0.25em]">Choose your sanctuary</p>
                </div>

                {/* Search & Radius Section */}
                <div className="space-y-6 mb-12">
                    {/* Premium Enhanced Location Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                            background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(15,15,15,0.4)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '32px',
                            padding: '18px 24px',
                            border: `1px solid ${colors.glassBorder}`,
                            boxShadow: isLight 
                                ? '0 10px 40px rgba(0,0,0,0.03)' 
                                : '0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)'
                        }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-5 min-w-0">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" 
                                     style={{ background: 'rgba(200,149,108,0.1)', border: '1px solid rgba(200,149,108,0.2)' }}>
                                    <MapPin size={20} style={{ color: colors.accent }} />
                                </div>
                                {isLocating && (
                                    <motion.div 
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 rounded-full bg-accent/20"
                                    />
                                )}
                            </div>
                            <div className="min-w-0 pr-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-0.5">Current Zone</p>
                                <h3 className="text-base font-black truncate max-w-[160px] tracking-wide" style={{ color: colors.text }}>
                                    {isLocating ? 'Locating...' : displayLocation}
                                </h3>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowLocationModal(true)}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-white/5 transition-all text-accent"
                        >
                            <Navigation size={18} />
                        </motion.button>
                    </motion.div>

                    {/* Search Input */}
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '24px',
                            border: isFocused ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
                            transition: 'all 0.4s',
                            padding: '0 20px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                        className="shadow-inner"
                    >
                        <Search size={18} style={{ color: isFocused ? colors.accent : 'rgba(255,255,255,0.15)' }} />
                        <input
                            type="text"
                            placeholder="Find outlet by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-transparent border-none outline-none font-medium text-sm tracking-wide"
                            style={{ color: colors.text }}
                        />
                    </div>
                </div>

                {/* Radius Filter */}
                <div className="flex items-center gap-3 px-1 mb-10 overflow-x-auto pb-2 no-scrollbar">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-30 whitespace-nowrap mr-2">Within</p>
                    {RADIUS_OPTIONS.map((km) => (
                        <motion.button
                            key={km}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSearchRadiusKm(km)}
                            className="px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap"
                            style={{ 
                                backgroundColor: searchRadiusKm === km ? 'rgba(200,149,108,0.1)' : 'transparent',
                                borderColor: searchRadiusKm === km ? colors.accent : colors.border,
                                color: searchRadiusKm === km ? colors.accent : colors.textMuted
                            }}
                        >
                            {km} km
                        </motion.button>
                    ))}
                </div>

                {/* Outlet List */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6 px-1">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 whitespace-nowrap">Discovered Salons</h2>
                        <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1" />
                    </div>

                    <div className="space-y-6 pb-20">
                        <AnimatePresence mode="popLayout">
                            {filteredOutlets.map((outlet, idx) => (
                                <motion.div
                                    key={outlet._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleSelect(outlet._id)}
                                    style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                    className="group relative p-5 rounded-[32px] overflow-hidden cursor-pointer shadow-xl transition-all hover:border-accent hover:shadow-accent/5"
                                >
                                    <div className="flex gap-5">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                            <img 
                                                src={outlet.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"} 
                                                alt={outlet.name}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-xl font-serif text-white truncate pr-2 leading-tight">{outlet.name}</h3>
                                                    <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                                        <Star size={10} style={{ color: colors.accent }} className="fill-current" />
                                                        <span className="text-[10px] font-mask text-white/40">4.9</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-medium opacity-30 truncate mb-1">{outlet.address || 'Premium Hub'}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-white/5" style={{ color: colors.accent }}>
                                                    {Math.round(outlet.distance)} km away
                                                </span>
                                                <ChevronRight size={18} className="opacity-20 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all text-accent" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Card Hover Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Search Fallbacks */}
                        {filteredOutlets.length === 0 && otherOutlets.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 space-y-6">
                                <div className="flex items-center gap-4 px-1">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 whitespace-nowrap">All Locations</h2>
                                    <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1" />
                                </div>
                                {otherOutlets.map((outlet, idx) => (
                                    <motion.div
                                        key={outlet._id}
                                        onClick={() => handleSelect(outlet._id)}
                                        style={{ border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.02)' }}
                                        className="p-4 rounded-[24px] flex items-center justify-between group cursor-pointer transition-all hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                                <img src={outlet.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"} alt={outlet.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-white truncate">{outlet.name}</h4>
                                                <p className="text-[10px] font-medium opacity-20 uppercase tracking-widest">{outlet.city || 'Regional'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="opacity-20 group-hover:opacity-100 text-accent transition-all" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="pt-12 pb-8 flex flex-col items-center mt-auto opacity-10 grayscale">
                    <img src="/icon.png" alt="Wapixo" className="h-8 w-auto mb-3" />
                    <p className="text-[8px] font-bold uppercase tracking-[0.4em]">Designed for Excellence</p>
                </div>
            </div>

            {/* Location Selection Sheet */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[1001] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowLocationModal(false); setLocationFetchError(''); }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{ 
                                background: colors.bg, 
                                borderTop: `1px solid ${colors.border}`,
                                boxShadow: '0 -20px 60px rgba(0,0,0,0.6)'
                            }}
                            className="relative w-full max-w-md p-8 pt-6 rounded-t-[40px]"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-serif italic text-white mb-1">Set Your Location</h3>
                                    <p className="text-[11px] font-medium opacity-30 uppercase tracking-widest">Find hubs in a specific sector</p>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '24px',
                                            border: `1px solid ${colors.border}`,
                                            padding: '0 20px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px'
                                        }}
                                    >
                                        <Search size={18} style={{ color: colors.accent }} />
                                        <input
                                            type="text"
                                            placeholder="Enter area or city name..."
                                            value={customLocation}
                                            onChange={(e) => { setCustomLocation(e.target.value); setLocationFetchError(''); }}
                                            onKeyDown={(e) => e.key === 'Enter' && applyCustomLocation()}
                                            className="w-full bg-transparent border-none outline-none font-bold text-sm"
                                            style={{ color: colors.text }}
                                        />
                                    </div>
                                    {locationFetchError && (
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{locationFetchError}</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-20 ml-1">Curated Districts</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {POPULAR_CITIES.slice(0, 4).map((city) => (
                                            <motion.button
                                                key={city.name}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => {
                                                    setIsLocating(true); setDisplayLocation(city.name);
                                                    setUserLocation({ lat: city.lat, lng: city.lng });
                                                    setShowLocationModal(false);
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${colors.border}`,
                                                }}
                                                className="p-4 text-left rounded-2xl"
                                            >
                                                <p className="text-[13px] font-bold text-white leading-tight mb-0.5">{city.name.split(',')[0]}</p>
                                                <p className="text-[8px] font-bold text-accent uppercase tracking-[0.2em]">{city.name.split(',')[1] || 'Hub'}</p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => applyCustomLocation()}
                                    className="w-full py-5 rounded-[24px] font-bold text-[11px] uppercase tracking-[0.4em] shadow-xl"
                                    style={{ backgroundColor: colors.accent, color: '#000' }}
                                >
                                    Confirm Sector
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
