import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useGender } from '../../contexts/GenderContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, User, MapPin, MapPinned, Star, ChevronRight, Search, Navigation, Scan } from 'lucide-react';
import api from '../../services/api'; // Use real API
import PasswordField from '../../components/common/PasswordField';

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 240 : -240, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -240 : 240, opacity: 0 }),
};

const DEFAULT_RADIUS_KM = 3;
/** Optional search distances (km) — default 3 km */
const RADIUS_OPTIONS = [3, 5, 10, 25];

export default function AppLoginPage() {
    const [searchParams] = useSearchParams();
    const tenantIdFromUrl = searchParams.get('tenantId');
    const referralCodeFromUrl = searchParams.get('ref') || '';
    const storedSelectedOutlet = (() => {
        try {
            const raw = localStorage.getItem('wapixo_selected_outlet');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const [step, setStep] = useState(1); // Start with Phone step
    const [direction, setDir] = useState(1);
    const [userCoords, setUserCoords] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(storedSelectedOutlet);
    const [tenantId, setTenantId] = useState(
        tenantIdFromUrl || 
        localStorage.getItem('active_salon_id') || 
        storedSelectedOutlet?.salonId || 
        storedSelectedOutlet?.tenantId || 
        localStorage.getItem('active_outlet_id') || 
        ''
    );
    const [otpVerified, setOtpVerified] = useState(false); // New state to track if phone is verified

    const [locationLoading, setLocationLoading] = useState(false);
    const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [name, setName] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [countdown, setCd] = useState(0);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        dob: '',
        anniversary: '',
    });
    const [otpDebug, setOtpDebug] = useState('');
    const [appliedReferralCode, setAppliedReferralCode] = useState(referralCodeFromUrl);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const submittingRef = useRef(false);
    const navigate = useNavigate();
    const { requestOtp, customerLogin, completeProfile, isCustomerAuthenticated, loading: authLoading } = useCustomerAuth();
    const { setActiveOutletId, setActiveSalonId, setOutlets } = useBusiness();

    const { setGender: setGlobalGender } = useGender();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        if (!authLoading && isCustomerAuthenticated) {
            setShowLocationModal(true);
            goTo(0);
        }
    }, [isCustomerAuthenticated, authLoading, navigate]);


    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCd(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    const [detectedAddress, setDetectedAddress] = useState('');
    const [nearbyOutlets, setNearbyOutlets] = useState([]);
    const [isFetchingOutlets, setIsFetchingOutlets] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const fetchOutlets = async (lat, lng, radiusKm) => {
        setIsFetchingOutlets(true);
        const url = (lat != null && lng != null) 
            ? `/outlets/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
            : `/outlets/nearby`; // Public endpoint now returns all if no coords
        
        try {
            const res = await api.get(url, { timeout: 30000 });
            let data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            
            setNearbyOutlets(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Could not reach server. Please check connection.');
        } finally {
            setIsFetchingOutlets(false);
        }
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await api.get(`/outlets/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.data?.status === 'OK') {
                const addr = res.data.displayAddress || res.data.formattedAddress;
                setDetectedAddress(addr);
                return addr;
            }
        } catch (err) { }
        return '';
    };

    const handleLocationSearch = async (query) => {
        if (!query || query.length < 3) return;
        setIsFetchingOutlets(true);
        setError('');
        try {
            const res = await api.get(`/outlets/geocode?q=${encodeURIComponent(query)}`);
            if (res.data?.latitude && res.data?.longitude) {
                const coords = { lat: res.data.latitude, lng: res.data.longitude };
                setUserCoords(coords);
                setDetectedAddress(query);
                fetchOutlets(coords.lat, coords.lng, searchRadiusKm);
            } else {
                fetchOutlets(null, null, searchRadiusKm);
            }
        } catch (err) {
            fetchOutlets(null, null, searchRadiusKm);
        } finally {
            setIsFetchingOutlets(false);
        }
    };

    const fetchLocationAndNearby = () => {
        setLocationLoading(true);
        setError('');
        setDetectedAddress('Calibrating position...');

        if (!navigator.geolocation) {
            setError('Geolocation not supported.');
            setLocationLoading(false);
            fetchOutlets(null, null, searchRadiusKm); // Fallback to all outlets
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserCoords(coords);
                localStorage.setItem('wapixo_user_coords', JSON.stringify(coords));
                await reverseGeocode(coords.lat, coords.lng);
                setLocationLoading(false);
                fetchOutlets(coords.lat, coords.lng, searchRadiusKm);
            },
            (err) => {
                const msg = err.code === 1 ? 'Location access denied. Showing all salons.' : 'Location sync failed. Switching to manual.';
                setError(msg);
                setLocationLoading(false);
                fetchOutlets(null, null, searchRadiusKm); // Fallback to all outlets
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    useEffect(() => {
        const saved = localStorage.getItem('wapixo_user_coords');
        let initialLat = null;
        let initialLng = null;

        if (saved) {
            try {
                const coords = JSON.parse(saved);
                initialLat = coords.lat;
                initialLng = coords.lng;
                setUserCoords(coords);
                reverseGeocode(coords.lat, coords.lng);
            } catch (e) { }
        }

        // Trigger fetch immediately in background
        if (tenantIdFromUrl) {
            setTenantId(tenantIdFromUrl);
            setStep(1);
        } else if (storedSelectedOutlet) {
            // If user has a previously selected outlet, skip to login step
            setSelectedOutlet(storedSelectedOutlet);
            setStep(1);
        } else {
            // If no salon context, start with phone/login step (already set by default)
            setStep(1);
            fetchOutlets(initialLat, initialLng, searchRadiusKm);
            if (!initialLat) {
                // We'll show the location modal only when they reach the discovery step
            }
        }
    }, [tenantIdFromUrl]);

    const handleAllowLocation = () => {
        setShowLocationModal(false);
        fetchLocationAndNearby();
    };

    const handleDenyLocation = () => {
        setShowLocationModal(false);
        setUserCoords(null);
        fetchOutlets(null, null, searchRadiusKm); // Shows all outlets
    };


    const handleSelectOutlet = (outlet) => {
        setSelectedOutlet(outlet);
        localStorage.setItem('wapixo_selected_outlet', JSON.stringify(outlet));
        const oId = outlet._id || outlet.id;
        localStorage.setItem('active_outlet_id', oId);
        const tId = outlet.salonId || outlet.tenantId;
        localStorage.setItem('active_salon_id', tId);
        setTenantId(tId);
        setActiveOutletId(oId); 
        setActiveSalonId(tId);
        
        // If already authenticated and on discovery step, go home
        if (isCustomerAuthenticated) {
            navigate('/app', { replace: true });
            return;
        }

        // If OTP was already verified during the new flow, proceed to login
        if (otpVerified && phone) {
            handleVerifyOtpWithTenant(tId, outlet);
        } else {
            goTo(1);
        }
    };



    const goTo = (s) => { 
        setDir(s > step ? 1 : -1); 
        setError(''); 
        setStep(s); 
        if (s === 1) setOtpVerified(false); // Reset verification if going back to phone
    };


    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        inputBg: isLight ? '#FFFFFF' : '#1E1E1E',
    };

    const handleSendOtp = async () => {
        // If no tenantId, we still allow sending OTP (to verify phone first)
        if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }

        setLoading(true); setError('');
        try {
            // Send OTP without tenantId if needed, backend currently doesn't strictly check for it for demo logic
            const res = await requestOtp(phone, tenantId || 'system'); 
            if (res.otp) setOtpDebug(res.otp);
            setCd(30); goTo(2);
        } catch (e) { setError(e.message || 'Failed to send OTP'); }
        finally {
            setLoading(false);
        }
    };

    const handleCustomerRegister = async () => {
        if (!tenantId) {
            setRegisterError('Please select an outlet first');
            return;
        }

        const payload = {
            name: registerForm.name?.trim(),
            email: registerForm.email?.trim(),
            phone: registerForm.mobile?.replace(/\D/g, ''),
            password: registerForm.password,
            dob: registerForm.dob,
            anniversary: registerForm.anniversary || null,
            referralCode: referralCodeFromUrl,
        };

        if (!payload.name) return setRegisterError('Enter your name');
        if (!payload.email) return setRegisterError('Enter your email');
        if (!payload.phone || payload.phone.length !== 10) return setRegisterError('Enter a valid 10-digit mobile number');
        if (!payload.password || payload.password.length < 8) return setRegisterError('Password must be at least 8 characters');
        if (!payload.dob) return setRegisterError('Select date of birth');

        setRegisterError('');
        setLoading(true);
        try {
            await api.post('/auth/register-customer', { tenantId, ...payload });

            // Keep existing OTP login flow
            setPhone(payload.phone);
            const res = await requestOtp(payload.phone, tenantId);
            if (res.otp) setOtpDebug(res.otp);
            setCd(30);
            setShowRegisterModal(false);
            goTo(2);
        } catch (e) {
            setRegisterError(e?.response?.data?.message || e.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (i, v) => {
        if (v.length > 1) v = v.slice(-1);
        if (!/^\d*$/.test(v)) return;
        const n = [...otp]; n[i] = v; setOtp(n);
        if (v && i < 3) otpRefs[i + 1].current?.focus();
    };

    const handleOtpKey = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 4) { setError('Enter the 4-digit OTP'); return; }

        // NEW FLOW: If no tenantId is selected yet, just verify phone and go to discovery
        if (!tenantId) {
            if (code === '1234') { // Using fixed OTP from backend controller
                setOtpVerified(true);
                setError('');
                if (!userCoords) {
                    setShowLocationModal(true);
                }
                goTo(0); // Discovery step
                return;
            } else {
                setError('Invalid OTP');
                setOtp(['', '', '', '']);
                otpRefs[0].current?.focus();
                return;
            }
        }

        setLoading(true); setError('');
        try {
            const cust = await customerLogin(phone, code, tenantId, appliedReferralCode);
            if (cust?.gender) setGlobalGender(cust.gender);
            
            if (selectedOutlet) {
                const oId = selectedOutlet._id || selectedOutlet.id;
                localStorage.setItem('active_outlet_id', oId);
                setActiveOutletId(oId);
            }
            
            if (selectedOutlet) {
                navigate('/app', { replace: true });
            } else {
                setShowLocationModal(true);
                goTo(0);
            }
        } catch (e) {
            setError(e.message || 'Verification failed');
            setOtp(['', '', '', '']);
            otpRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpWithTenant = async (tId, outlet) => {
        setLoading(true); setError('');
        const code = otp.join('') || '1234';
        try {
            const cust = await customerLogin(phone, code, tId, appliedReferralCode);
            if (cust?.gender) setGlobalGender(cust.gender);
            
            const oId = outlet._id || outlet.id;
            localStorage.setItem('active_outlet_id', oId);
            setActiveOutletId(oId);
            
            navigate('/app', { replace: true });
        } catch (e) {
            setError(e.message || 'Verification failed');
            goTo(1); // Go back to login if it failed
        } finally {
            setLoading(false);
        }
    };

    const handleProfile = async () => {
        if (!name.trim()) { setError('Please enter your name'); return; }

        if (submittingRef.current) return;
        submittingRef.current = true;

        setLoading(true); setError('');
        try {
            await completeProfile({ name: name.trim(), gender: selectedGender });
            if (selectedGender) setGlobalGender(selectedGender === 'male' ? 'men' : 'women');
            if (selectedOutlet) {
                setActiveOutletId(selectedOutlet._id);
                localStorage.setItem('active_outlet_id', selectedOutlet._id);
                setOutlets([selectedOutlet]);
            }
            if (selectedOutlet) {
                navigate('/app', { replace: true });
            } else {
                setShowLocationModal(true);
                goTo(0);
            }
        } catch (e) { setError(e.message || 'Something went wrong'); }
        finally {
            setLoading(false);
            submittingRef.current = false;
        }
    };

    const fmtPhone = (p) => p.length > 5 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : `+91 ${p}`;

    const S = {
        page: { minHeight: '100svh', width: '100%', background: colors.bg, color: colors.text, fontFamily: "'SF Pro Text', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '8px 16px 40px', transition: 'background 0.3s ease', overflowX: 'hidden', boxSizing: 'border-box' },
        input: { width: '100%', background: colors.inputBg, border: `1.5px solid ${colors.border}`, borderRadius: '14px', padding: '14px 16px', fontSize: '16px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif" },
        btn: { width: '100%', background: '#C8956C', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '16px', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.02em', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(200,149,108,0.2)' },
        ghost: { background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, fontFamily: "'Inter', sans-serif" },
    };

    if (authLoading || isCustomerAuthenticated) {
        return (
            <div style={{ minHeight: '100svh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin text-[#C8956C]" />
            </div>
        );
    }

    return (
        <div style={S.page}>
            <AnimatePresence mode="wait" custom={direction}>

                {/* STEP 0: MINIMAL SALON DISCOVERY */}
                {step === 0 && (
                    <motion.div
                        key="discovery"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ width: '100%', maxWidth: '420px' }}
                    >
                        <div className="flex flex-col items-center mb-2">
                            <img
                                src={isLight ? '/new black wapixo logo .png' : '/new wapixo logo .png'}
                                alt="Wapixo"
                                className="w-24 h-auto opacity-90 mb-4 drop-shadow-2xl"
                            />
                            <h1 className={`text-3xl sm:text-4xl font-serif italic mb-1 text-center leading-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                                Precision <span className="font-normal text-[#C8956C]">Meets</span> Style
                            </h1>
                            <p className={`text-[9px] font-black tracking-[0.3em] uppercase text-center ${isLight ? 'text-neutral-400' : 'text-white/30'}`}>Find your signature sanctuary</p>
                        </div>

                        {locationLoading ? (
                            <div className="py-16 flex flex-col items-center">
                                <div className="relative w-16 h-16 mb-6">
                                    <div className="absolute inset-0 rounded-full border-2 border-[#C8956C]/20" />
                                    <div className="absolute inset-0 rounded-full border-t-2 border-[#C8956C] animate-spin" />
                                    <MapPin size={24} className="absolute inset-0 m-auto text-[#C8956C] animate-pulse" />
                                </div>
                                <p className="text-xs font-black tracking-widest text-[#C8956C] uppercase mb-1">Synchronizing Location</p>
                                <p className="text-[10px] text-white/20 italic text-center">Calibrating nearest boutiques...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-[#C8956C]/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className={`relative flex items-center gap-3 border h-14 px-4 rounded-2xl group-focus-within:border-[#C8956C]/50 transition-all ${isLight ? 'bg-white border-neutral-200 shadow-sm' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                                            <Search size={18} className={`${isLight ? 'text-neutral-400' : 'text-white/20'} group-focus-within:text-[#C8956C] transition-colors`} />
                                            <input 
                                                type="text" 
                                                placeholder="Salon name or city..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleLocationSearch(searchQuery);
                                                }}
                                                className={`w-full bg-transparent border-none outline-none text-sm placeholder:opacity-50 ${isLight ? 'text-neutral-900 placeholder:text-neutral-900' : 'text-white placeholder:text-white'}`}
                                            />
                                        </div>
                                    </div>
                                     {userCoords && (
                                         <div className={`p-4 rounded-3xl border space-y-4 ${isLight ? 'bg-neutral-50 border-neutral-200 shadow-sm' : 'bg-black/40 border-white/[0.03]'}`}>
                                             <div className="flex items-center justify-between">
                                                 <div>
                                                     <h2 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-neutral-400' : 'text-white/40'}`}>Search Radius</h2>
                                                     <p className="text-[11px] font-serif italic text-[#C8956C]">Within {searchRadiusKm} kilometers</p>
                                                 </div>
                                             </div>

                                            <div className="grid grid-cols-4 gap-2">
                                                {RADIUS_OPTIONS.map((km) => (
                                                    <button
                                                        key={km}
                                                        onClick={() => {
                                                            setSearchRadiusKm(km);
                                                            fetchOutlets(userCoords?.lat, userCoords?.lng, km);
                                                        }}
                                                        className={`h-10 rounded-xl text-xs font-bold transition-all relative ${
                                                            searchRadiusKm === km 
                                                            ? 'bg-[#C8956C] text-white shadow-[0_4px_12px_rgba(200,149,108,0.3)]' 
                                                            : isLight 
                                                                ? 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100 border border-neutral-200'
                                                                : 'bg-white/[0.02] text-white/30 hover:bg-white/5 border border-white/[0.03]'
                                                        }`}
                                                    >
                                                        {km} km
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                     )}
                                </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-neutral-300' : 'text-white/20'}`}>Discovery Results</span>
                                            <button 
                                                onClick={() => setShowLocationModal(true)}
                                                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                                            >
                                                <span className="text-[10px] font-medium text-[#C8956C] truncate max-w-[150px] italic">
                                                    {detectedAddress ? `Near ${detectedAddress}` : 'Current Location'}
                                                </span>
                                                <MapPin size={10} className="text-[#C8956C]" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[380px] overflow-y-auto px-1 custom-scrollbar pb-2">
                                            {isFetchingOutlets ? (
                                                [1, 2, 3].map(i => (
                                                    <div key={`skeleton-${i}`} className="h-28 rounded-3xl bg-white/[0.01] border border-white/[0.03] animate-pulse flex items-center p-4 gap-4">
                                                        <div className="w-20 h-20 rounded-2xl bg-white/[0.02]" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 w-1/2 bg-white/[0.02] rounded" />
                                                            <div className="h-3 w-3/4 bg-white/[0.02] rounded" />
                                                            <div className="h-3 w-1/4 bg-white/[0.02] rounded" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div key="discovery-results-container" className="space-y-3">
                                                    {(() => {
                                                        const q = searchQuery.toLowerCase();
                                                        const filteredOutlets = nearbyOutlets.filter(o => {
                                                            const nameMatch = (o.name || "").toLowerCase().includes(q);
                                                            const cityMatch = (o.city || "").toLowerCase().includes(q);
                                                            
                                                            let addrStr = "";
                                                            if (typeof o.address === 'string') {
                                                                addrStr = o.address;
                                                            } else if (o.address && typeof o.address === 'object') {
                                                                addrStr = `${o.address.street || ""} ${o.address.city || ""} ${o.address.pincode || ""}`;
                                                            }
                                                            const addrMatch = addrStr.toLowerCase().includes(q);
                                                            
                                                            return !searchQuery || nameMatch || cityMatch || addrMatch;
                                                        });

                                                        if (filteredOutlets.length === 0) {
                                                            return (
                                                                <div key="no-results" className="py-12 flex flex-col items-center text-center px-6">
                                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${isLight ? 'bg-neutral-50 border-neutral-100' : 'bg-white/[0.02] border-white/5'}`}>
                                                                        <Search size={24} className={isLight ? 'text-neutral-300' : 'text-white/10'} />
                                                                    </div>
                                                                    <h3 className={`text-sm font-serif italic mb-2 ${isLight ? 'text-neutral-900' : 'text-white/60'}`}>No Sanctuaries Nearby</h3>
                                                                    <p className={`text-[10px] font-medium leading-relaxed uppercase tracking-widest text-center ${isLight ? 'text-neutral-400' : 'text-white/30'}`}>
                                                                        Expand your perimeter or search <br/>for a specific destination
                                                                    </p>
                                                                </div>
                                                            );
                                                        }

                                                        return filteredOutlets.map((o) => {
                                                            const displayAddr = typeof o.address === 'string' 
                                                                ? (o.address || o.city || 'Signature Sanctuary')
                                                                : (o.address ? `${o.address.street || ""}, ${o.address.city || ""}` : (o.city || 'Signature Sanctuary'));

                                                            return (
                                                                <motion.button
                                                                    key={o._id || o.id}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    onClick={() => handleSelectOutlet(o)}
                                                                    className={`w-full group relative overflow-hidden p-4 rounded-3xl border transition-all duration-500 flex items-center gap-4 ${isLight ? 'bg-white border-neutral-100 shadow-sm hover:border-[#C8956C]/40' : 'bg-white/[0.02] border-white/[0.05] hover:border-[#C8956C]/40'}`}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-[#C8956C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    <div className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border relative z-10 shadow-2xl ${isLight ? 'border-neutral-100' : 'border-white/10'}`}>
                                                                        <img
                                                                            src={o.images?.[0] || o.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"}
                                                                            alt={o.name}
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 relative z-10">
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <h4 className={`text-lg font-serif italic truncate drop-shadow-sm ${isLight ? 'text-neutral-900' : 'text-white'}`}>{o.name}</h4>
                                                                            <ChevronRight size={16} className={`${isLight ? 'text-neutral-200' : 'text-white/10'} group-hover:text-[#C8956C] transform group-hover:translate-x-1 transition-all`} />
                                                                        </div>
                                                                        <p className={`text-[11px] truncate mb-3 font-medium tracking-tight ${isLight ? 'text-neutral-500' : 'text-white/40'}`}>
                                                                            {displayAddr}
                                                                        </p>

                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-black/40 border-white/5'}`}>
                                                                                <div className="h-1 w-1 rounded-full bg-[#C8956C] animate-pulse" />
                                                                                <span className="text-[9px] font-black text-[#C8956C] uppercase tracking-widest leading-none">
                                                                                    {o.distanceKm != null ? `${o.distanceKm.toFixed(1)} KM` : 'HUB'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 opacity-40">
                                                                                <Star size={10} fill="#C8956C" className="text-[#C8956C]" />
                                                                                <span className={`text-[9px] font-bold uppercase tracking-tighter ${isLight ? 'text-neutral-900' : 'text-white'}`}>4.8</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.button>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-8 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                            >
                                <p className="text-[11px] font-bold text-red-500/80 tracking-tight">{error}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* STEP 1: Phone */}
                {step === 1 && (
                    <motion.div key="phone" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', minHeight: '80svh' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img src={isLight ? '/new black wapixo logo .png' : '/new wapixo logo .png'} alt="Logo" className="h-20 w-auto mx-auto mb-5" />
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
                            {selectedOutlet && <p style={{ fontSize: '13px', color: '#C8956C', marginTop: '8px' }}>{selectedOutlet.name}</p>}
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{isRegistering ? 'Join our luxury network' : 'Sign in to continue'}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                            <div style={{ background: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)', borderRadius: '20px 6px 20px 6px', display: 'flex', alignItems: 'center', height: '52px', border: isFocused ? '1.5px solid #C8956C' : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`, transition: 'all 0.3s' }}>
                                <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', borderRight: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, flexShrink: 0, height: '60%' }}><span style={{ fontSize: '14px', color: isFocused ? '#C8956C' : colors.textMuted, fontWeight: 800 }}>+91</span></div>
                                <input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); setOtpVerified(false); }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="98765 43210" autoFocus style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 16px', fontSize: '16px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', fontWeight: 600 }} />
                            </div>
                        </div>

                        {isRegistering && (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Referral Code (Optional)</label>
                                <div style={{ background: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)', borderRadius: '20px 6px 20px 6px', display: 'flex', alignItems: 'center', height: '52px', border: `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`, transition: 'all 0.3s' }}>
                                    <input 
                                        type="text" 
                                        value={appliedReferralCode} 
                                        onChange={e => setAppliedReferralCode(e.target.value.toUpperCase())} 
                                        placeholder="E.G. WAP-C2B1D" 
                                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 16px', fontSize: '14px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em', fontWeight: 600 }} 
                                    />
                                </div>
                            </div>
                        )}
                        {error && <p style={{ fontSize: '13px', color: '#ff4757', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendOtp} disabled={loading || phone.length !== 10} style={{ ...S.btn, opacity: (loading || phone.length !== 10) ? 0.5 : 1 }}>{loading ? <Loader2 size={20} className="animate-spin" /> : 'Get OTP'}</motion.button>
                        
                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            style={{ ...S.ghost, display: 'block', margin: '20px auto 0', color: '#C8956C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '11px' }}
                        >
                            {isRegistering ? 'Existing User? Login' : 'New User? Register'}
                        </button>
                        
                      

                        <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginTop: '24px' }}>By continuing, you agree to our <a href="/terms" style={{ color: '#C8956C', fontWeight: 600 }}>Terms</a> & <a href="/privacy" style={{ color: '#C8956C', fontWeight: 600 }}>Privacy Policy</a></p>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: OTP */}
                {step === 2 && (
                    <motion.div key="otp" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', minHeight: '80svh' }}>
                        <button onClick={() => goTo(1)} style={{ ...S.ghost, padding: '12px 0', color: isLight ? '#1A1A1A' : 'rgba(255,255,255,0.4)' }}><ArrowLeft size={18} /> Back</button>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>Phone Verification</h2>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Enter the 4-digit OTP sent to your phone</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '6px 0 0' }}>Sent to <span style={{ color: '#C8956C', fontWeight: 700 }}>{fmtPhone(phone)}</span></p>
                          
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
                            {otp.map((digit, i) => (
                                <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} autoFocus={i === 0} style={{
                                    width: '45px', height: '54px', background: digit ? '#C8956C' : (isLight ? '#F5F5F5' : colors.inputBg), border: `1.5px solid ${digit ? '#C8956C' : (isLight ? '#E5E5E5' : colors.border)}`, borderRadius: '14px', textAlign: 'center', fontSize: '22px', fontWeight: 800, color: digit ? '#fff' : colors.text, outline: 'none', fontFamily: "'SF Pro Text', sans-serif",
                                    cursor: 'text', transition: 'all 0.2s'
                                }} />
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '14px', color: colors.textMuted, marginBottom: '24px' }}>{countdown > 0 ? <span style={{ fontFamily: 'monospace', fontSize: '16px', color: colors.text, fontWeight: 700 }}>{String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}</span> : null}</p>
                        {error && <p style={{ fontSize: '13px', color: '#ff4757', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerifyOtp} disabled={loading || otp.join('').length !== 4} style={{ ...S.btn, opacity: (loading || otp.join('').length !== 4) ? 0.5 : 1, marginBottom: '16px' }}>{loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify'}</motion.button>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: colors.textMuted }}>Didn't receive? {countdown > 0 ? <span>Wait {countdown}s</span> : <button onClick={handleSendOtp} style={{ ...S.ghost, display: 'inline', color: '#C8956C', fontWeight: 600 }}>Resend</button>}</p>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: Profile */}
                {step === 3 && (
                    <motion.div key="profile" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '400px' }} className="py-4">
                        <div className="text-center mb-6">
                            <img src={isLight ? '/new black wapixo logo .png' : '/new wapixo logo .png'} alt="Logo" className="h-22 w-auto mx-auto mb-4" />
                            <h1 style={{ fontSize: '22px', fontWeight: 900, color: colors.text, margin: '0 0 6px', fontFamily: "'SF Pro Display', sans-serif" }}>Personalize <span style={{ color: '#C8956C' }}>Experience</span></h1>
                            <p style={{ fontSize: '9px', color: colors.textMuted, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Select your preference</p>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Name</label>
                            <div style={{ background: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)', borderRadius: '20px 6px 20px 6px', display: 'flex', alignItems: 'center', padding: '0 16px', height: '52px', gap: '12px', border: isFocused ? '1.5px solid #C8956C' : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`, transition: 'all 0.3s' }}>
                                <User size={18} color={isFocused ? '#C8956C' : (isLight ? '#666' : 'rgba(255,255,255,0.6)')} />
                                <input type="text" value={name} autoFocus onChange={e => { setName(e.target.value); setError(''); }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Enter your full name" style={{ background: 'transparent', border: 'none', outline: 'none', color: colors.text, fontSize: '14px', width: '100%', height: '100%', fontWeight: 600 }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {[{ id: 'male', label: 'Gentlemen', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80' }, { id: 'female', label: 'Ladies', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80' }].map(g => (
                                <motion.div key={g.id} whileTap={{ scale: 0.96 }} onClick={() => setSelectedGender(g.id)} style={{ position: 'relative', height: '140px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${selectedGender === g.id ? '#C8956C' : 'transparent'}`, transition: 'all 0.3s' }}>
                                    <img src={g.img} alt={g.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: selectedGender === g.id ? 1 : 0.7 }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}><p style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '1px' }}>Curation for</p><p style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontFamily: "'Playfair Display', serif" }}>{g.label}</p></div>
                                    {selectedGender === g.id && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: '#C8956C', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '10px' }}>✓</span></div>}
                                </motion.div>
                            ))}
                        </div>
                        {error && <p style={{ fontSize: '12px', color: '#ff4757', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleProfile} disabled={loading || !name.trim() || !selectedGender} style={{ ...S.btn, borderRadius: '16px', height: '52px', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '13px', fontWeight: 900, opacity: (loading || !name.trim() || !selectedGender) ? 0.5 : 1 }}>{loading ? <Loader2 size={18} className="animate-spin" /> : 'Get Started'}</motion.button>
                    </motion.div>
                )}

            </AnimatePresence>

            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleDenyLocation}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-[380px] overflow-hidden rounded-[32px] border ${isLight ? 'bg-white border-neutral-100 shadow-2xl' : 'bg-[#1A1A1A] border-white/5 shadow-2xl'}`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8956C] to-transparent opacity-50" />
                            
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-[#C8956C]/20 blur-2xl rounded-full animate-pulse" />
                                    <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center border rotation-12 transition-transform hover:rotate-0 duration-500 ${isLight ? 'bg-white border-neutral-100 shadow-xl' : 'bg-white/[0.03] border-white/10'}`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#C8956C]/10 to-transparent rounded-3xl" />
                                        <Navigation size={32} className="text-[#C8956C] animate-bounce-slow" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#C8956C] flex items-center justify-center border-4 border-[#1A1A1A] shadow-lg">
                                        <MapPin size={12} className="text-white" />
                                    </div>
                                </div>

                                <h2 className={`text-2xl font-serif italic mb-3 leading-tight ${isLight ? 'text-neutral-900' : 'text-white'}`}>
                                    Discover Nearby <span className="text-[#C8956C]">Sanctuaries</span>
                                </h2>
                                
                                <p className={`text-sm leading-relaxed mb-8 px-2 font-medium ${isLight ? 'text-neutral-500' : 'text-white/40'}`}>
                                    To provide a curated experience, we'd like to find the finest boutiques in your immediate vicinity.
                                </p>

                                <div className="w-full space-y-3">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAllowLocation}
                                        className="w-full h-14 rounded-2xl bg-[#C8956C] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_8px_20px_rgba(200,149,108,0.3)] hover:shadow-[0_12px_25px_rgba(200,149,108,0.4)] transition-all flex items-center justify-center gap-3 group"
                                    >
                                        Enable Precision Access
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </motion.button>

                                    <button 
                                        onClick={handleDenyLocation}
                                        className={`w-full h-14 rounded-2xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all ${isLight ? 'border-neutral-200 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900' : 'border-white/5 text-white/30 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        Browse All Salons
                                    </button>
                                </div>

                                <p className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] opacity-20">
                                    Wapixo Luxury Network
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
