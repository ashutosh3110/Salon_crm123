import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, MapPin, Navigation, Star, Search, ChevronRight, Globe, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';

const RADIUS_OPTIONS = [3, 5, 10, 25];

export default function NearbyOutletsPage() {
    const [searchParams] = useSearchParams();
    const radius = Number(searchParams.get('radius')) || 10;

    const navigate = useNavigate();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    const [userCoords, setUserCoords] = useState(() => {
        try {
            const raw = localStorage.getItem('wapixo_user_coords');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [locationLoading, setLocationLoading] = useState(!userCoords);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [outlets, setOutlets] = useState([]);
    const [allOutlets, setAllOutlets] = useState([]); // Fallback for all active salons
    const [addressText, setAddressText] = useState('Detecting location...');

    const colors = {
        bg: isLight ? '#FCF9F6' : '#040404', // Very deep charcoal
        card: isLight ? '#FFFFFF' : '#0F0F0F',
        text: isLight ? '#1A1A1A' : '#F5F5F5',
        textMuted: isLight ? '#666' : '#888888',
        accent: '#C8956C', // Warm Gold
        accentLight: '#E5B58C',
        accentGradient: 'linear-gradient(135deg, #C8956C 0%, #E5B58C 100%)',
        border: isLight ? '#EEEEEE' : '#1A1A1A',
        glassBorder: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
        subtleGlow: 'rgba(200, 149, 108, 0.05)'
    };

    const latestCoordsRef = useRef(null);

    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await api.get(`/outlets/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.data?.status === 'OK') {
                setAddressText(res.data.displayAddress || 'Current Position');
            } else {
                setAddressText('Nearby Your Position');
            }
        } catch (err) {
            setAddressText('Nearby Your Position');
        }
    };

    const fetchNearbyOutlets = async (lat, lng) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, { timeout: 30000 });
            setOutlets(Array.isArray(res.data) ? res.data : []);

            const allRes = await api.get(`/outlets/nearby?lat=${lat}&lng=${lng}&radius=500`);
            const globalList = Array.isArray(allRes.data) ? allRes.data : [];
            setAllOutlets(globalList.filter(o => !outlets.some(nearby => nearby._id === o._id)));
        } catch (e) {
            setError('Unable to link to salon systems. Retrying...');
            setOutlets([]);
        } finally {
            setLoading(false);
        }
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setUserCoords({ lat: 22.7196, lng: 75.8577 });
            setAddressText('Indore, Madhya Pradesh');
            setLocationLoading(false);
            return;
        }

        setLocationLoading(true);
        setAddressText('Reading environment...');

        let watchId = null;
        let timeoutId = null;
        let settled = false;

        const settle = (lat, lng) => {
            if (settled) return;
            settled = true;
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (timeoutId) clearTimeout(timeoutId);
            setUserCoords({ lat, lng });
            localStorage.setItem('wapixo_user_coords', JSON.stringify({ lat, lng }));
            setLocationLoading(false);
            reverseGeocode(lat, lng);
        };

        const handleSuccess = (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            latestCoordsRef.current = { lat: latitude, lng: longitude };
            setUserCoords(prev => prev ? prev : { lat: latitude, lng: longitude });
            if (accuracy < 500) {
                settle(latitude, longitude);
            }
        };

        const handleError = () => {
            settle(22.7196, 75.8577);
            setAddressText('Indore, Madhya Pradesh');
        };

        watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true, timeout: 30000, maximumAge: 0
        });

        timeoutId = setTimeout(() => {
            const coords = latestCoordsRef.current;
            if (coords) settle(coords.lat, coords.lng);
            else handleError();
        }, 10000);
    };

    useEffect(() => {
        const queryLat = searchParams.get('lat');
        const queryLng = searchParams.get('lng');
        if (queryLat && queryLng) {
            const latNum = parseFloat(queryLat);
            const lngNum = parseFloat(queryLng);
            setUserCoords({ lat: latNum, lng: lngNum });
            reverseGeocode(latNum, lngNum);
        } else {
            requestLocation();
        }
    }, [searchParams]);

    useEffect(() => {
        if (userCoords?.lat != null && userCoords?.lng != null) {
            fetchNearbyOutlets(userCoords.lat, userCoords.lng);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userCoords?.lat, userCoords?.lng, radius]);

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col relative overflow-x-hidden pt-8 pb-12">

            {/* Soft Ambient Background */}
            {!isLight && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
                        style={{ background: 'radial-gradient(circle, rgba(200,149,108,0.15) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[5%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[100px]"
                        style={{ background: 'radial-gradient(circle, rgba(200,149,108,0.1) 0%, transparent 70%)' }} />
                </div>
            )}

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-7 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col items-center mb-16">
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/app/login')}
                        className="self-start p-2 mb-8"
                    >
                        <ArrowLeft size={22} style={{ color: colors.text }} />
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border"
                            style={{ color: colors.accent, borderColor: 'rgba(200,149,108,0.2)', backgroundColor: 'rgba(200,149,108,0.05)' }}>
                            The Collection
                        </span>
                    </motion.div>

                    <h1 className="text-[2.75rem] font-serif italic text-white text-center leading-none mb-2">
                        Select <span className="font-normal" style={{ color: colors.accent }}>Outlet</span>
                    </h1>
                    <p className="text-[11px] font-medium opacity-30 uppercase tracking-[0.2em]">Curating your next experience</p>
                </div>

                {/* Location Interface */}
                <div className="space-y-8 mb-12">
                    {/* Premium Glass Location Interface */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(15,15,15,0.3)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '32px',
                            padding: '24px 28px',
                            border: `1px solid ${colors.glassBorder}`,
                            boxShadow: isLight
                                ? '0 10px 40px rgba(0,0,0,0.03)'
                                : '0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)'
                        }}
                        className="flex items-center justify-between relative overflow-hidden group shadow-2xl"
                    >
                        <div className="flex items-center gap-6 z-10 flex-1 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-3xl flex items-center justify-center transition-all group-hover:scale-105 duration-500"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(200,149,108,0.1) 0%, rgba(200,149,108,0.02) 100%)',
                                        border: '1px solid rgba(200,149,108,0.15)'
                                    }}>
                                    <MapPin size={24} style={{ color: colors.accent }} />
                                </div>
                                {locationLoading && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-3xl bg-accent/20 z-[-1]"
                                    />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Current Zone</span>
                                    {locationLoading && (
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.2, 0.8] }}
                                                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                                    className="w-1.5 h-1.5 rounded-full bg-accent"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-[17px] font-bold truncate tracking-tight leading-tight" style={{ color: colors.text }}>
                                    {locationLoading ? 'Locating Hub...' : addressText}
                                </h2>
                                {!locationLoading && userCoords && (
                                    <p className="text-[10px] font-medium opacity-40 tracking-wider mt-0.5">
                                        Lat: {userCoords.lat.toFixed(4)}, Lng: {userCoords.lng.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(200,149,108,0.08)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => requestLocation()}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all border border-white/[0.03] bg-white/[0.04] shadow-xl ml-4"
                            style={{ color: colors.accent }}
                        >
                            <Navigation size={22} className={locationLoading ? 'animate-spin opacity-50' : ''} />
                        </motion.button>

                        {/* Shimmer Effect */}
                        {locationLoading && (
                            <motion.div
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
                            />
                        )}
                    </motion.div>

                    {/* Elite Radius Selection */}
                    <div className="px-1">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-20">Proximity Scope</h3>
                            <div className="h-px bg-white/5 flex-1 mx-4" />
                            <span className="text-[11px] font-black tracking-widest" style={{ color: colors.accent }}>{radius} KM</span>
                        </div>
                        <div className="flex gap-4">
                            {RADIUS_OPTIONS.map((km) => (
                                <motion.button
                                    key={km}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/app/nearby-outlets?radius=${km}`)}
                                    className="flex-1 py-5 rounded-[24px] flex flex-col items-center justify-center border transition-all relative overflow-hidden"
                                    style={{
                                        backgroundColor: radius === km ? 'rgba(200,149,108,0.08)' : 'rgba(255,255,255,0.02)',
                                        borderColor: radius === km ? colors.accent : colors.border,
                                        color: radius === km ? colors.accent : colors.textMuted
                                    }}
                                >
                                    <span className="text-2xl font-serif leading-none italic mb-1">{km}</span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">KM</span>
                                    {radius === km && (
                                        <motion.div
                                            layoutId="radius-glow"
                                            className="absolute inset-0 bg-accent/5 pointer-events-none"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="flex-1">
                    {locationLoading || loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="relative mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 rounded-full border border-dashed"
                                    style={{ borderColor: 'rgba(200,149,108,0.3)' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={24} style={{ color: colors.accent }} className="animate-pulse" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Refining Search</p>
                        </div>
                    ) : outlets.length > 0 ? (
                        <div className="space-y-8 pb-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 whitespace-nowrap">Discovered Salons</h2>
                                <div className="h-px w-full" style={{ background: `linear-gradient(to right, ${colors.border}, transparent)` }} />
                            </div>

                            <div className="grid gap-6">
                                {outlets.map((o, idx) => (
                                    <motion.div
                                        key={o._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => {
                                            localStorage.setItem('wapixo_selected_outlet', JSON.stringify(o));
                                            navigate(`/app/login?outletSelected=1&tenantId=${encodeURIComponent(o.tenantId)}`);
                                        }}
                                        style={{ background: colors.card, border: `1px solid ${colors.border}` }}
                                        className="group relative p-4 rounded-[28px] overflow-hidden cursor-pointer shadow-xl transition-all hover:border-accent hover:shadow-accent/5"
                                    >
                                        <div className="flex gap-5">
                                            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0">
                                                <img
                                                    src={o.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"}
                                                    alt={o.name}
                                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="text-xl font-serif text-white truncate pr-2">{o.name}</h3>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Star size={10} style={{ color: colors.accent }} className="fill-current" />
                                                            <span className="text-[11px] font-bold text-white/50">4.9</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-medium opacity-30 truncate mb-4">{o.address || 'Select Hub'}</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-white/5" style={{ color: colors.accent }}>
                                                        {o.distanceKm} km away
                                                    </span>
                                                    <ChevronRight size={18} className="opacity-20 translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 transition-all text-accent" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-20 h-20 rounded-full border flex items-center justify-center mb-8" style={{ borderColor: colors.border }}>
                                <Globe size={32} className="opacity-10" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-2">Expanding Search</h3>
                            <p className="text-[13px] font-medium opacity-30 mb-10 max-w-[240px]">
                                No active nodes found in this radius. Try a broader search.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Action */}
                <div className="mt-auto pt-8 pb-10 flex flex-col items-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/app/login')}
                        className="w-full py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all"
                        style={{ backgroundColor: colors.accent, color: '#000' }}
                    >
                        Re-Scan Environment
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
