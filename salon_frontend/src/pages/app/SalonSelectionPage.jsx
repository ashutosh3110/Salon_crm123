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
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1A1A1A',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)',
        accent: '#C8956C'
    };

    const DEFAULT_RADIUS_KM = 10;
    const RADIUS_OPTIONS = [3, 5, 10, 25];
    const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM);

    // Ref to track latest coords (avoids stale closure in setTimeout)
    const latestCoordsRef = useRef(null);

    // Smart Location Lock: Refine geolocation until high accuracy is achieved or timeout
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
            console.log(`GPS Lock: ${latitude}, ${longitude} | Accuracy: ${accuracy}m`);
            latestCoordsRef.current = { lat: latitude, lng: longitude };
            
            // On first success, set user location but don't stop watching until settled or timeout
            setUserLocation(prev => prev ? prev : { lat: latitude, lng: longitude });

            if (accuracy < 500) {
                settle(latitude, longitude);
            }
        };

        const handleError = () => {
            settle(22.7196, 75.8577);
            setDisplayLocation('Indore, Madhya Pradesh');
        };

        if (navigator.geolocation) {
            setIsLocating(true);
            setDisplayLocation('Calibrating GPS...');

            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
                enableHighAccuracy: true, timeout: 30000, maximumAge: 0
            });

            // Force settle after 10s using ref (never stale)
            timeoutId = setTimeout(() => {
                const coords = latestCoordsRef.current;
                if (coords) {
                    settle(coords.lat, coords.lng);
                } else {
                    handleError();
                }
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

    // Fallback: Show all active outlets if no nearby ones match the search/radius
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
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col relative overflow-x-hidden">
            
            {/* Ambient Lighting Background */}
            {!isLight && (
                <>
                    <div className="absolute top-[-5%] left-[-10%] w-[70%] h-[40%] rounded-full blur-[120px] opacity-10 pointer-events-none z-0" 
                         style={{ background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full blur-[100px] opacity-10 pointer-events-none z-0" 
                         style={{ background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)' }} />
                </>
            )}

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-12 z-20 relative">
                
                {/* Cinematic Header */}
                <div className="mb-10 text-center relative flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5"
                    >
                        <ShieldCheck size={14} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.35em] opacity-40">Secure Selection</span>
                    </motion.div>
                    
                    <h1 className="text-4xl font-black tracking-tight leading-tight" style={{ color: colors.text }}>
                        Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8956C] to-[#E5B58C]">Wapixo</span>
                    </h1>
                    <p className="text-[11px] font-bold opacity-30 mt-2 tracking-wide">Select your elite salon gateway</p>
                </div>

                {/* Floating Glass Location Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '28px',
                        border: `1px solid ${colors.glassBorder}`,
                        padding: '20px 24px'
                    }}
                    className="flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden mb-8 z-30"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Navigation size={22} className={isLocating ? 'animate-pulse' : ''} />
                        </div>
                        <div className="min-w-0 pr-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1">Active Zone</p>
                            <p className="text-sm font-black truncate max-w-[170px] leading-tight" style={{ color: colors.text }}>{isLocating ? 'Scanning...' : displayLocation}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ color: '#E5B58C' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowLocationModal(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 transition-all"
                    >Change</motion.button>
                </motion.div>

                {/* Scan Radius & Search Container */}
                <div className="space-y-6 mb-10 z-40 relative">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Scan Profile</p>
                        <div className="flex gap-2">
                            {RADIUS_OPTIONS.map((km) => (
                                <button
                                    key={km}
                                    onClick={() => setSearchRadiusKm(km)}
                                    className={`text-[9px] font-black px-3 py-1.5 rounded-full transition-all tracking-widest border ${
                                        searchRadiusKm === km 
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                                        : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    {km}KM
                                </button>
                            ))}
                        </div>
                    </div>

                    <div
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '24px',
                            border: isFocused ? `1px solid ${colors.accent}` : `1px solid ${colors.glassBorder}`,
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            padding: '0 20px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px'
                        }}
                        className="shadow-inner"
                    >
                        <Search size={18} style={{ color: isFocused ? colors.accent : 'rgba(255,255,255,0.2)', transition: 'color 0.3s' }} />
                        <input
                            type="text"
                            placeholder="Find outlet by name or area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-transparent border-none outline-none font-bold text-sm tracking-wide"
                            style={{ color: colors.text }}
                        />
                    </div>
                </div>

                {/* Local Nodes Grid */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 px-1 mb-6">
                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 whitespace-nowrap">Local Nodes Detected</h2>
                        <div className="h-[1px] bg-gradient-to-r from-primary/30 to-transparent flex-1" />
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                            <span className="text-[10px] font-black text-primary">{filteredOutlets.length}</span>
                        </div>
                    </div>

                    <div className="grid gap-6 pb-24">
                        <AnimatePresence mode="popLayout">
                            {filteredOutlets.map((outlet, idx) => (
                                <motion.div
                                    key={outlet._id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => handleSelect(outlet._id)}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
                                        backdropFilter: 'blur(16px)',
                                        borderRadius: '32px',
                                        border: `1px solid ${colors.glassBorder}`,
                                        overflow: 'hidden'
                                    }}
                                    className="group cursor-pointer hover:border-primary/50 transition-all relative shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
                                >
                                    <div className="relative h-44 w-full overflow-hidden">
                                        <img
                                            src={outlet.image || `https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800`}
                                            alt={outlet.name}
                                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                        
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-xl bg-black/30 border border-white/10">
                                            <Star size={12} className="fill-primary text-primary" />
                                            <span className="text-[11px] font-black text-white mt-0.5">4.9</span>
                                        </div>

                                        {idx === 0 && (
                                            <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                                                Closest Detected
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-4 left-5 right-5">
                                            <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">{outlet.name}</h3>
                                            <div className="flex items-center gap-1.5 opacity-70">
                                                <MapPin size={10} className="text-primary" />
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{outlet.address || 'Available Hub'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/10">
                                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Premium Node</span>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Luxury Salon</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    
                                    {/* Card Hover Glow */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Global Nodes Fallback Section */}
                        {filteredOutlets.length === 0 && otherOutlets.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-6">
                                <div className="flex items-center gap-4 px-1">
                                    <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-primary whitespace-nowrap">Global Scan Result</h2>
                                    <div className="h-[1px] bg-gradient-to-r from-primary/30 to-transparent flex-1" />
                                </div>
                                
                                {otherOutlets.map((outlet, idx) => (
                                    <motion.div
                                        key={outlet._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleSelect(outlet._id)}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                            borderRadius: '32px',
                                            border: `1px solid ${colors.glassBorder}`,
                                            overflow: 'hidden'
                                        }}
                                        className="group cursor-pointer hover:border-primary/40 transition-all relative"
                                    >
                                        <div className="p-5 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-xl">
                                                <img src={outlet.image || `https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800`} alt={outlet.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-black text-white truncate">{outlet.name}</h3>
                                                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{outlet.city || 'Regional Hub'}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-white/20 group-hover:text-primary transition-all" />
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Bottom Elite Branding */}
                <div className="pt-12 pb-8 flex flex-col items-center mt-auto">
                    <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        src="/icon.png"
                        alt="Wapixo Icon"
                        className="grayscale hover:grayscale-0 transition-all duration-700"
                        style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
                    />
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10 mt-4">Autonomous Node Engine v2.0</p>
                </div>
            </div>

            {/* Premium Location Selection Sheet */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[1001] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowLocationModal(false); setLocationFetchError(''); }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 220 }}
                            style={{ 
                                background: colors.bg, 
                                borderTop: `1px solid ${colors.glassBorder}`,
                                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
                            }}
                            className="relative w-full max-w-md p-8 rounded-t-[40px] overflow-hidden"
                        >
                            <div className="w-14 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">Zone Update</h3>
                                    <p className="text-sm font-bold opacity-30 mt-1">Specify new sector coordinates</p>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '24px',
                                            border: isModalSearchFocused ? `1px solid ${colors.accent}` : `1px solid ${colors.glassBorder}`,
                                            transition: 'all 0.3s',
                                            padding: '0 20px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px'
                                        }}
                                    >
                                        <Search size={18} style={{ color: isModalSearchFocused ? colors.accent : 'rgba(255,255,255,0.2)' }} />
                                        <input
                                            type="text"
                                            placeholder="Enter area, city or coordinates..."
                                            value={customLocation}
                                            onChange={(e) => { setCustomLocation(e.target.value); setLocationFetchError(''); }}
                                            onFocus={() => setIsModalSearchFocused(true)}
                                            onBlur={() => setIsModalSearchFocused(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customLocation?.trim()) {
                                                    e.preventDefault();
                                                    applyCustomLocation();
                                                }
                                            }}
                                            className="w-full bg-transparent border-none outline-none font-bold text-sm"
                                            style={{ color: colors.text }}
                                        />
                                    </div>
                                    {locationFetchError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 font-bold uppercase tracking-wider text-center">{locationFetchError}</motion.p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20 ml-1">Elite Regional Clusters</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {POPULAR_CITIES.slice(0, 6).map((city) => (
                                            <motion.button
                                                key={city.name}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => {
                                                    setIsLocating(true); setDisplayLocation(city.name);
                                                    setTimeout(() => {
                                                        setUserLocation({ lat: city.lat, lng: city.lng });
                                                        setIsLocating(false); setShowLocationModal(false);
                                                    }, 800);
                                                }}
                                                style={{
                                                    background: displayLocation === city.name ? 'rgba(200,149,108,0.1)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${displayLocation === city.name ? colors.accent : colors.glassBorder}`,
                                                }}
                                                className="p-4 text-left rounded-3xl group transition-all"
                                            >
                                                <p className="text-sm font-black leading-tight text-white mb-0.5">{city.name.split(',')[0]}</p>
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{city.name.split(',')[1] || 'Hub'}</p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                        if (customLocation?.trim()) applyCustomLocation();
                                        else setShowLocationModal(false);
                                    }}
                                    className="w-full py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30"
                                    style={{ background: `linear-gradient(135deg, ${colors.accent} 0%, #E5B58C 100%)`, color: '#fff' }}
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
