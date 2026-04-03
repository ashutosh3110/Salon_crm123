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
        bg: isLight ? '#FCF9F6' : '#080808',
        card: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(25,25,25,0.7)',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
        accent: '#C8956C',
        glass: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.03)',
        glassBorder: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'
    };

    const latestCoordsRef = useRef(null);

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
                    setAddressText(primary ? (secondary ? `${primary}, ${secondary}` : primary) : 'Nearby Your Position');
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
            const res = await api.get(`/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, { timeout: 10000 });
            setOutlets(Array.isArray(res.data) ? res.data : []);
            
            // Always fetch a broader list (500km) to ensure we have fallbacks if the primary radius is too tight
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
        setAddressText('Calibrating GPS...');

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
            console.log(`Nearby GPS Lock: ${latitude}, ${longitude} | Accuracy: ${accuracy}m`);
            latestCoordsRef.current = { lat: latitude, lng: longitude };
            
            // Set first reading but keep looking for better accuracy
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
            if (coords) {
                settle(coords.lat, coords.lng);
            } else {
                handleError();
            }
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
            if (addressText === 'Detecting location...' || addressText === 'Calibrating GPS...') {
                reverseGeocode(userCoords.lat, userCoords.lng);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userCoords?.lat, userCoords?.lng, radius]);

    return (
        <div style={{ background: colors.bg, minHeight: '100svh' }} className="flex flex-col relative overflow-x-hidden">
            
            {/* Ambient Background Elements */}
            {!isLight && (
                <>
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[120px] opacity-10 pointer-events-none z-0" 
                         style={{ background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[40%] rounded-full blur-[100px] opacity-10 pointer-events-none z-0" 
                         style={{ background: 'radial-gradient(circle, #C8956C 0%, transparent 70%)' }} />
                </>
            )}

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 pt-12 z-20 relative">
                
                {/* Premium Header */}
                <div className="mb-12 relative flex flex-col items-center">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/app/login')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl backdrop-blur-3xl cursor-pointer z-30"
                        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.glassBorder}` }}
                    >
                        <ArrowLeft size={20} style={{ color: colors.text }} />
                    </motion.button>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/5"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#C8956C]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">System Active</span>
                    </motion.div>
                    
                    <h1 className="text-4xl font-black tracking-tight text-center" style={{ color: colors.text }}>
                        Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8956C] to-[#E5B58C]">Outlet</span>
                    </h1>
                </div>

                {/* Enhanced Location Card (Glassmorphism) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    style={{ 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '28px',
                        border: `1px solid ${colors.glassBorder}`,
                        padding: '24px'
                    }}
                    className="flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden mb-10 z-30 pointer-events-auto group"
                >
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20">
                                <Navigation size={24} className={locationLoading ? 'animate-pulse' : ''} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#080808] z-10" />
                        </div>
                        <div className="min-w-0 pr-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Detected Zone</p>
                            <p className="text-lg font-black truncate max-w-[170px] leading-tight" style={{ color: colors.text }}>{addressText}</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                        className="p-4 rounded-2xl cursor-pointer z-40 relative overflow-hidden group/btn"
                        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.glassBorder}` }}
                    >
                        <Sparkles size={18} className="text-primary group-hover/btn:rotate-12 transition-transform" />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </motion.button>
                </motion.div>

                {/* Scannable Distance Profile */}
                <div className="mb-12 z-40 relative pointer-events-auto">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Scan Radius</p>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.1em]">{radius} KM active</p>
                    </div>
                    <div className="flex bg-white/5 p-1.5 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                        {RADIUS_OPTIONS.map((km) => (
                            <motion.button
                                key={km}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/app/nearby-outlets?radius=${km}`)}
                                className="relative flex-1 py-4 flex flex-col items-center justify-center rounded-[2rem] transition-all duration-500 cursor-pointer overflow-hidden group"
                                style={{ 
                                    color: radius === km ? '#fff' : colors.text,
                                    zIndex: radius === km ? 10 : 1
                                }}
                            >
                                <span className={`text-base font-black relative z-20 ${radius === km ? 'scale-110 mb-0.5' : 'opacity-40'} transition-all`}>{km}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest relative z-20 ${radius === km ? 'opacity-70' : 'opacity-20'} transition-all`}>KM</span>
                                
                                {radius === km && (
                                    <motion.div 
                                        layoutId="active-radius"
                                        className="absolute inset-0 bg-gradient-to-br from-primary to-[#E5B58C] shadow-lg shadow-primary/20 z-10"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Scanned Results */}
                <div className="flex-1">
                    {locationLoading || loading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 border-[3px] border-primary/5 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                        <Globe size={24} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] opacity-40 mb-2">Syncing Data</h3>
                            <p className="text-[10px] font-bold opacity-20">Accessing secure node clusters...</p>
                        </div>
                    ) : outlets.length > 0 ? (
                        <div className="space-y-6 pb-20">
                            <div className="flex items-center gap-4 px-1 mb-2">
                                <h2 className="text-[11px] font-black tracking-[0.3em] uppercase opacity-40 whitespace-nowrap">Local Nodes Detected</h2>
                                <div className="h-[1px] bg-gradient-to-r from-primary/30 to-transparent flex-1" />
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                                    <span className="text-[11px] font-black text-primary">{outlets.length}</span>
                                </div>
                            </div>
                            
                            <motion.div layout className="grid gap-5">
                                {outlets.map((o, idx) => (
                                    <motion.div
                                        key={o._id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => {
                                            localStorage.setItem('wapixo_selected_outlet', JSON.stringify(o));
                                            navigate(`/app/login?outletSelected=1&tenantId=${encodeURIComponent(o.tenantId)}`);
                                        }}
                                        style={{ 
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                            backdropFilter: 'blur(16px)',
                                            border: `1px solid ${colors.glassBorder}` 
                                        }}
                                        className="group relative p-5 rounded-[2.5rem] cursor-pointer shadow-2xl shadow-black/10 hover:border-primary/50 active:scale-[0.98] transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-white/5 relative shadow-2xl">
                                                <img 
                                                    src={o.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"} 
                                                    alt={o.name}
                                                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="min-w-0 pr-2">
                                                        <h3 className="text-xl font-black tracking-tight leading-tight mb-1" style={{ color: colors.text }}>{o.name}</h3>
                                                        <div className="flex items-center gap-1.5 opacity-40">
                                                            <MapPin size={10} className="text-primary" />
                                                            <p className="text-[10px] font-bold truncate max-w-[120px]">{o.address || 'Available Node'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-black text-primary leading-none tracking-tighter">{o.distanceKm}<span className="text-[9px] ml-0.5 opacity-50">KM</span></span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-5">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                                                        <Sparkles size={10} className="text-primary" />
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Elite Hub</span>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 group-hover:border-primary/20 transition-all">
                                                        <Star size={12} className="fill-amber-500 text-amber-500" />
                                                        <span className="text-[11px] font-black mt-0.5">4.9</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Luxury card hover glow */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    ) : null}

                    {/* Global Nodes Fallback */}
                    {outlets.length === 0 && allOutlets.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-6 mt-4">
                            <div className="flex items-center gap-4 px-1">
                                <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-primary whitespace-nowrap">Global Scan Result</h2>
                                <div className="h-[1px] bg-gradient-to-r from-primary/30 to-transparent flex-1" />
                            </div>
                            
                            <div className="grid gap-5">
                                {allOutlets.map((o, idx) => (
                                    <motion.button 
                                        key={o._id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            localStorage.setItem('wapixo_selected_outlet', JSON.stringify(o));
                                            navigate(`/app/login?outletSelected=1&tenantId=${encodeURIComponent(o.tenantId)}`);
                                        }}
                                        className="w-full p-5 rounded-[2rem] flex items-center justify-between border border-white/5 bg-white/[0.03] hover:border-primary/30 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/5 shadow-xl">
                                                <img src={o.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"} alt={o.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <span className="block text-xl font-black text-white leading-tight mb-1 truncate">{o.name}</span>
                                                <span className="text-[11px] font-black text-primary/60 uppercase tracking-widest leading-none">{o.city || 'Regional Hub'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-white/20 group-hover:text-primary transition-all shrink-0" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {outlets.length > 0 || allOutlets.length > 0 ? (
                        <div className="pb-10 pt-6 text-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/app/login')}
                                className="px-12 py-5 bg-gradient-to-br from-primary to-[#E5B58C] text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-[0_20px_40px_rgba(200,149,108,0.3)] active:brightness-90 transition-all"
                            >
                                Re-Scan Sector
                            </motion.button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="w-28 h-28 bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 border border-white/5 relative"
                            >
                                <div className="absolute inset-0 rounded-[3rem] bg-primary/20 blur-2xl opacity-20" />
                                <Search size={44} className="text-primary opacity-30 relative z-10" />
                            </motion.div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight" style={{ color: colors.text }}>No Nodes Found</h3>
                            <p className="text-[13px] font-bold opacity-30 leading-relaxed mb-12 max-w-[280px]">
                                We couldn't find any active systems in this range. Try expanding your scan radius.
                            </p>
                            
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/app/login')}
                                className="px-12 py-5 bg-gradient-to-br from-primary to-[#E5B58C] text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-[0_20px_40px_rgba(200,149,108,0.3)] active:brightness-90 transition-all"
                            >
                                Re-Scan Sector
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
