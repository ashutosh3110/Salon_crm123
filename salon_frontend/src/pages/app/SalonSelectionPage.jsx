import { useState, useEffect, useMemo } from 'react';
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

    const DEFAULT_RADIUS_KM = 3;
    const RADIUS_OPTIONS = [3, 5, 10, 25];
    const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM);

    // Get user location (real GPS). Distance filtering outlets depend only on coords,
    // so loader should not be blocked by reverse-geocoding.
    useEffect(() => {
        if (!navigator.geolocation) {
            setUserLocation({ lat: 26.8467, lng: 80.9462 });
            setDisplayLocation('Gomti Nagar, Lucknow');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(coords);
                setDisplayLocation('Detecting location...');
                setIsLocating(false);

                // Update display text asynchronously (do not block UI).
                (async () => {
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
                            { headers: { 'User-Agent': 'WapixoSalonApp/1.0' } }
                        );
                        const data = await res.json();
                        const addr = data?.address;
                        const loc = addr
                            ? [addr.suburb, addr.neighbourhood, addr.village, addr.city_district, addr.city, addr.state].filter(Boolean).slice(0, 2).join(', ')
                            : `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`;
                        setDisplayLocation(loc || 'Current location');
                    } catch {
                        setDisplayLocation(`${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`);
                    }
                })();
            },
            () => {
                setUserLocation({ lat: 26.8467, lng: 80.9462 });
                setDisplayLocation('Gomti Nagar, Lucknow');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
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

    const handleSelect = (id) => {
        setActiveOutletId(id);
        navigate('/app');
    };

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="px-6 flex flex-col pt-8">
            {/* Global Container */}
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">

                {/* Scrollable/Main Content Wrapper */}
                <div className="flex-1 space-y-6 pb-8">
                    {/* Header */}
                    <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-2 text-[#C8956C]">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Selection</span>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: colors.text }}>
                            Choose your <span style={{ color: colors.accent }}>outlet</span>
                        </h1>
                        <p className="text-xs font-medium leading-relaxed opacity-70" style={{ color: colors.text }}>
                            Outlets near your location (default {DEFAULT_RADIUS_KM} km — adjust radius if needed).
                        </p>
                    </div>

                    {/* Location Status Bar */}
                    <div
                        style={{
                            background: isLight
                                ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                            borderRadius: '20px 6px 20px 6px',
                            border: `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                            boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Navigation size={18} className={isLocating ? 'animate-pulse text-amber-500' : 'text-[#C8956C]'} />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]">Current Location</p>
                                <p className="text-xs font-bold" style={{ color: isLight ? '#1A1A1A' : '#fff' }}>
                                    {isLocating ? 'Detecting...' : displayLocation}
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowLocationModal(true)}
                            className="text-[9px] font-black uppercase tracking-widest text-[#C8956C]"
                        >Change</motion.button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: colors.text }}>Search radius (optional)</p>
                        <div className="flex flex-wrap gap-2">
                            {RADIUS_OPTIONS.map((km) => (
                                <button
                                    key={km}
                                    type="button"
                                    onClick={() => setSearchRadiusKm(km)}
                                    className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
                                    style={{
                                        border: `1.5px solid ${searchRadiusKm === km ? '#C8956C' : colors.border}`,
                                        background: searchRadiusKm === km ? 'rgba(200,149,108,0.15)' : colors.card,
                                        color: searchRadiusKm === km ? '#C8956C' : colors.text,
                                    }}
                                >
                                    {km} km
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Search Bar */}
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
                    >
                        <Search size={16} style={{ color: isFocused ? '#C8956C' : (isLight ? '#999' : 'rgba(255,255,255,0.3)'), flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search by name or locality..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full bg-transparent border-none outline-none font-semibold text-[13px]"
                            style={{ color: isLight ? '#1A1A1A' : '#fff' }}
                        />
                    </div>

                    {/* Nearby Outlets List */}
                    <div className="space-y-4">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: colors.text }}>Nearby Outlets ({filteredOutlets.length})</h2>
                        <div className="grid gap-3">
                            <AnimatePresence mode="popLayout">
                                {filteredOutlets.map((outlet, idx) => (
                                    <motion.div
                                        key={outlet._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleSelect(outlet._id)}
                                        style={{
                                            background: colors.card,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: '24px',
                                            overflow: 'hidden'
                                        }}
                                        className="group cursor-pointer hover:border-[#C8956C] transition-all relative shadow-sm"
                                    >
                                        <div className="relative h-32 w-full bg-gray-200 overflow-hidden">
                                            <img
                                                src={outlet.image || `https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop`}
                                                alt={outlet.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                                                <Star size={12} fill="#C8956C" color="#C8956C" />
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute top-3 left-3 bg-[#C8956C] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                                                    Closest
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 space-y-2">
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight" style={{ color: colors.text }}>
                                                    {outlet.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1 opacity-60">
                                                    <MapPin size={12} style={{ color: colors.text }} />
                                                    <span className="text-[11px] font-bold" style={{ color: colors.text }}>
                                                        {outlet.address?.split(',')[0]}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span style={{ background: isLight ? '#FFF5EE' : '#2A211B', color: colors.accent }} className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Luxury</span>
                                                <span style={{ background: isLight ? '#FFF5EE' : '#2A211B', color: colors.accent }} className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">Top Rated</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Bottom Branding Icon - Fixed to end of flex container */}
                <div className="pt-8 pb-4 flex justify-center mt-auto opacity-70">
                    <img
                        src="/icon.png"
                        alt="Wapixo Icon"
                        style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                    />
                </div>
            </div>

            {/* Location Selection Bottom Sheet Modal */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[1001] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowLocationModal(false); setLocationFetchError(''); }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
                            className="relative w-full max-w-md p-6 rounded-t-[32px] sm:rounded-b-[32px] overflow-hidden"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 sm:hidden" />
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-black" style={{ color: colors.text }}>Change Location</h3>
                                    <p className="text-xs font-medium opacity-60" style={{ color: colors.text }}>Select a city or enter your area</p>
                                </div>

                                <div
                                    style={{
                                        background: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                        borderRadius: '20px 6px 20px 6px',
                                        border: isModalSearchFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        padding: '0 16px',
                                        height: '52px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <Search size={16} style={{ color: isModalSearchFocused ? '#C8956C' : (isLight ? '#999' : 'rgba(255,255,255,0.3)') }} />
                                    {locationFetchError && (
                                        <p className="text-xs text-red-500 font-medium">{locationFetchError}</p>
                                    )}
                                    <input
                                        type="text"
                                        placeholder="Enter area, street or city..."
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
                                        className="w-full bg-transparent border-none outline-none font-semibold text-[13px]"
                                        style={{ color: isLight ? '#1A1A1A' : '#fff' }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C8956C]">Popular Cities</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {POPULAR_CITIES.map((city) => (
                                            <motion.button
                                                key={city.name}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setIsLocating(true); setDisplayLocation(city.name);
                                                    setTimeout(() => {
                                                        setUserLocation({ lat: city.lat, lng: city.lng });
                                                        setIsLocating(false); setShowLocationModal(false);
                                                    }, 800);
                                                }}
                                                style={{
                                                    background: displayLocation === city.name ? 'rgba(200,149,108,0.1)' : (isLight ? '#fff' : '#1A1A1A'),
                                                    border: `1px solid ${displayLocation === city.name ? colors.accent : colors.border}`,
                                                    borderRadius: '12px'
                                                }}
                                                className="p-3 text-left transition-all"
                                            >
                                                <p className="text-xs font-bold leading-tight" style={{ color: colors.text }}>{city.name.split(',')[1] || city.name}</p>
                                                <p className="text-[9px] font-medium opacity-50" style={{ color: colors.text }}>{city.name.split(',')[0]}</p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (customLocation?.trim()) {
                                            applyCustomLocation();
                                        } else {
                                            setShowLocationModal(false);
                                        }
                                    }}
                                    className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest"
                                    style={{ background: colors.accent, color: '#fff' }}
                                >
                                    {customLocation?.trim() ? 'Apply & Close' : 'Close'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
