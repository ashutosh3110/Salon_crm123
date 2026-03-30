import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { useGender } from '../../contexts/GenderContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, User, MapPin, MapPinned } from 'lucide-react';
import api from '../../services/api';
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
    const [step, setStep] = useState(0);
    const [direction, setDir] = useState(1);
    const [userCoords, setUserCoords] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [tenantId, setTenantId] = useState(tenantIdFromUrl || storedSelectedOutlet?.tenantId || '');
    const [locationLoading, setLocationLoading] = useState(!(tenantIdFromUrl || storedSelectedOutlet?.tenantId));
    const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_RADIUS_KM);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [name, setName] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [countdown, setCd] = useState(0);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        dob: '',
        anniversary: '',
    });
    const [otpDebug, setOtpDebug] = useState('');
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();
    const { requestOtp, customerLogin, completeProfile } = useCustomerAuth();
    const { setActiveOutletId, setOutlets } = useBusiness();
    const { setGender: setGlobalGender } = useGender();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCd(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    const fetchLocationAndNearby = () => {
        setLocationLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Location not supported. Use search below.');
            setLocationLoading(false);
            return;
        }
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            setError('Location requires HTTPS.');
            setLocationLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserCoords(coords);
                try {
                    localStorage.setItem('wapixo_user_coords', JSON.stringify(coords));
                } catch {
                    // ignore
                }
                setLocationLoading(false);
            },
            (err) => {
                const msg = err.code === 1 ? 'Location permission denied.' : 'Could not get location.';
                setError(msg);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        // If tenantId is already known (from URL or localStorage), we should be on phone/OTP step.
        if (tenantIdFromUrl || storedSelectedOutlet?.tenantId) {
            if (storedSelectedOutlet?.tenantId && !selectedOutlet) setSelectedOutlet(storedSelectedOutlet);
            setTenantId(tenantIdFromUrl || storedSelectedOutlet?.tenantId || '');
            setStep(1);
            setLocationLoading(false);
            return;
        }

        fetchLocationAndNearby();
    }, [tenantIdFromUrl, storedSelectedOutlet?.tenantId]);

    const handleSelectOutlet = (outlet) => {
        setSelectedOutlet(outlet);
        setTenantId(outlet.tenantId);
        setStep(1);
    };

    const goTo = (s) => { setDir(s > step ? 1 : -1); setError(''); setStep(s); };

    useEffect(() => {
        if (phone.length === 10 && step === 1 && !loading) handleSendOtp();
    }, [phone, step, loading]);

    useEffect(() => {
        if (otp.join('').length === 6 && step === 2 && !loading) handleVerifyOtp();
    }, [otp, step, loading]);

    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        inputBg: isLight ? '#FFFFFF' : '#1E1E1E',
    };

    const handleSendOtp = async () => {
        if (!tenantId) { setError('Please select an outlet first'); return; }
        if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
        setLoading(true); setError('');
        try {
            const res = await requestOtp(phone, tenantId);
            if (res.otp) setOtpDebug(res.otp);
            setCd(30); goTo(2);
        } catch (e) { setError(e.message || 'Failed to send OTP'); }
        finally { setLoading(false); }
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
        if (v && i < 5) otpRefs[i + 1].current?.focus();
    };

    const handleOtpKey = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
    };

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) { setError('Enter the 6-digit OTP'); return; }
        setLoading(true); setError('');
        try {
            const c = await customerLogin(phone, code, tenantId, referralCodeFromUrl);
            if (selectedOutlet) {
                setActiveOutletId(selectedOutlet._id);
                localStorage.setItem('active_outlet_id', selectedOutlet._id);
                setOutlets([selectedOutlet]);
            }
            if (c.isNewUser && (!c.name || !c.gender)) {
                if (c.name) setName(c.name);
                if (c.gender) setSelectedGender(c.gender);
                goTo(3);
            } else {
                if (c.gender) setGlobalGender(c.gender === 'male' ? 'men' : 'women');
                navigate(selectedOutlet ? '/app' : '/app/salon-selection', { replace: true });
            }
        } catch (e) {
            setError(e.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            otpRefs[0].current?.focus();
        } finally { setLoading(false); }
    };

    const handleProfile = async () => {
        if (!name.trim()) { setError('Please enter your name'); return; }
        setLoading(true); setError('');
        try {
            await completeProfile({ name: name.trim(), gender: selectedGender });
            if (selectedGender) setGlobalGender(selectedGender === 'male' ? 'men' : 'women');
            if (selectedOutlet) {
                setActiveOutletId(selectedOutlet._id);
                localStorage.setItem('active_outlet_id', selectedOutlet._id);
                setOutlets([selectedOutlet]);
            }
            navigate(selectedOutlet ? '/app' : '/app/salon-selection', { replace: true });
        } catch (e) { setError(e.message || 'Something went wrong'); }
        finally { setLoading(false); }
    };

    const fmtPhone = (p) => p.length > 5 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : `+91 ${p}`;

    const S = {
        page: { minHeight: '100svh', width: '100%', background: colors.bg, color: colors.text, fontFamily: "'SF Pro Text', sans-serif", display: 'grid', placeItems: 'center', padding: '24px', transition: 'background 0.3s ease', overflow: 'hidden' },
        input: { width: '100%', background: colors.inputBg, border: `1.5px solid ${colors.border}`, borderRadius: '14px', padding: '14px 16px', fontSize: '16px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif" },
        btn: { width: '100%', background: '#C8956C', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '16px', fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.02em', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(200,149,108,0.2)' },
        ghost: { background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, fontFamily: "'Inter', sans-serif" },
    };

    return (
        <div style={S.page}>
            <AnimatePresence mode="wait" custom={direction}>

                {/* STEP 0: Location + Nearby outlets list */}
                {step === 0 && (
                    <motion.div key="outlets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}
                    >
                        {/* Custom header for login selection */}
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                            <div style={{ width: 70, display: 'flex', justifyContent: 'flex-start' }}>
                                <img
                                    src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'}
                                    alt="Wapixo Logo"
                                    style={{ width: 52, height: 40, objectFit: 'contain' }}
                                />
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 12, fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Nearby outlets
                                </div>
                            </div>
                            <div style={{ width: 70 }} />
                        </div>

                        {locationLoading ? (
                            <>
                                <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#C8956C' }} />
                                <p style={{ fontSize: '15px', fontWeight: 600, color: colors.text, marginBottom: '8px' }}>Detecting your location…</p>
                                <p style={{ fontSize: '13px', color: colors.textMuted }}><MapPin size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Get GPS coordinates</p>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: 8 }}>
                                    <p style={{ fontSize: '10px', fontWeight: 900, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                        Select distance
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                        {RADIUS_OPTIONS.map((km) => (
                                            <button
                                                key={km}
                                                type="button"
                                                onClick={() => {
                                                    setSearchRadiusKm(km);
                                                    navigate(`/app/nearby-outlets?radius=${km}`);
                                                }}
                                                style={{
                                                    padding: '8px 14px',
                                                    borderRadius: '999px',
                                                    border: `1.5px solid ${searchRadiusKm === km ? '#C8956C' : colors.border}`,
                                                    background: searchRadiusKm === km ? 'rgba(200,149,108,0.15)' : colors.card,
                                                    color: searchRadiusKm === km ? '#C8956C' : colors.text,
                                                    fontSize: '12px',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {km} km
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '10px', color: colors.textMuted, marginTop: '10px' }}>
                                        Next page will show outlets within your selected distance.
                                    </p>
                                </div>

                                <button onClick={() => fetchLocationAndNearby()} style={{ ...S.ghost, margin: '18px auto 0', color: '#C8956C' }}>
                                    <MapPinned size={16} /> Use current location
                                </button>
                            </>
                        )}

                        {error && <p style={{ fontSize: '13px', color: '#ff4757', marginTop: '16px' }}>{error}</p>}
                    </motion.div>
                )}

                {/* STEP 1: Phone */}
                {step === 1 && (
                    <motion.div key="phone" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '360px' }}>
                        <button onClick={() => goTo(0)} style={{ ...S.ghost, marginBottom: '24px' }}><ArrowLeft size={18} /> Back</button>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <img src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'} alt="Logo" className="h-20 w-auto mx-auto mb-5" />
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>Welcome Back</h1>
                            {selectedOutlet && <p style={{ fontSize: '13px', color: '#C8956C', marginTop: '8px' }}>{selectedOutlet.name}</p>}
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Sign in to continue</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                            <div style={{ background: isLight ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)' : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)', borderRadius: '20px 6px 20px 6px', display: 'flex', alignItems: 'center', height: '52px', border: isFocused ? '1.5px solid #C8956C' : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`, transition: 'all 0.3s' }}>
                                <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', borderRight: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, flexShrink: 0, height: '60%' }}><span style={{ fontSize: '14px', color: isFocused ? '#C8956C' : colors.textMuted, fontWeight: 800 }}>+91</span></div>
                                <input type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="98765 43210" autoFocus style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 16px', fontSize: '16px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.1em', fontWeight: 600 }} />
                            </div>
                        </div>
                        {error && <p style={{ fontSize: '13px', color: '#ff4757', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendOtp} disabled={loading || phone.length !== 10 || !tenantId} style={{ ...S.btn, opacity: (loading || phone.length !== 10 || !tenantId) ? 0.5 : 1 }}>{loading ? <Loader2 size={20} className="animate-spin" /> : 'Get OTP'}</motion.button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowRegisterModal(true);
                                setRegisterError('');
                            }}
                            disabled={loading}
                            style={{ ...S.ghost, display: 'block', margin: '14px auto 0', color: '#C8956C', fontWeight: 700 }}
                        >
                            Register instead
                        </button>
                        <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginTop: '24px' }}>By continuing, you agree to our <a href="/terms" style={{ color: '#C8956C', fontWeight: 600 }}>Terms</a> & <a href="/privacy" style={{ color: '#C8956C', fontWeight: 600 }}>Privacy Policy</a></p>
                    </motion.div>
                )}

                {/* STEP 2: OTP */}
                {step === 2 && (
                    <motion.div key="otp" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '360px' }}>
                        <button onClick={() => goTo(1)} style={{ ...S.ghost, marginBottom: '32px' }}><ArrowLeft size={18} /> Back</button>
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>Phone Verification</h2>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Enter the 6-digit OTP sent to your phone</p>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '6px 0 0' }}>Sent to <span style={{ color: '#C8956C', fontWeight: 700 }}>{fmtPhone(phone)}</span></p>
                            {otpDebug && (
                                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(200,149,108,0.1)', border: '1px dashed #C8956C', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#C8956C', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        DEBUG OTP: <span style={{ fontSize: '16px', letterSpacing: '0.2em', marginLeft: '8px' }}>{otpDebug}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
                            {otp.map((digit, i) => (
                                <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} autoFocus={i === 0} style={{ width: '54px', height: '60px', background: digit ? '#C8956C' : colors.inputBg, border: `1.5px solid ${digit ? '#C8956C' : colors.border}`, borderRadius: '14px', textAlign: 'center', fontSize: '22px', fontWeight: 800, color: digit ? '#fff' : colors.text, outline: 'none', fontFamily: "'SF Pro Text', sans-serif",
                                    cursor: 'text', transition: 'all 0.2s' }} />
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '14px', color: colors.textMuted, marginBottom: '24px' }}>{countdown > 0 ? <span style={{ fontFamily: 'monospace', fontSize: '16px', color: colors.text, fontWeight: 700 }}>{String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}</span> : null}</p>
                        {error && <p style={{ fontSize: '13px', color: '#ff4757', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerifyOtp} disabled={loading || otp.join('').length !== 6} style={{ ...S.btn, opacity: (loading || otp.join('').length !== 6) ? 0.5 : 1, marginBottom: '16px' }}>{loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify'}</motion.button>
                        <p style={{ textAlign: 'center', fontSize: '13px', color: colors.textMuted }}>Didn't receive? {countdown > 0 ? <span>Wait {countdown}s</span> : <button onClick={handleSendOtp} style={{ ...S.ghost, display: 'inline', color: '#C8956C', fontWeight: 600 }}>Resend</button>}</p>
                    </motion.div>
                )}

                {/* STEP 3: Profile */}
                {step === 3 && (
                    <motion.div key="profile" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: '400px' }} className="py-4">
                        <div className="text-center mb-6">
                            <img src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'} alt="Logo" className="h-22 w-auto mx-auto mb-4" />
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
            {showRegisterModal && (
                <div className="fixed inset-0 z-[1002] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowRegisterModal(false)}
                    />
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
                        className="relative w-full max-w-md p-6 rounded-t-[32px] sm:rounded-b-[32px] overflow-hidden"
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-black" style={{ color: colors.text }}>Customer Register</h3>
                                <p className="text-xs font-medium opacity-60" style={{ color: colors.textMuted }}>
                                    Optional — registration ke baad OTP flow continue hoga
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowRegisterModal(false)} disabled={loading} style={{ ...S.ghost }}>
                                Close
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Name</label>
                            <input
                                type="text"
                                value={registerForm.name}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Your name"
                                style={{ ...S.input, width: '100%' }}
                                disabled={loading}
                            />

                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Email</label>
                            <input
                                type="email"
                                value={registerForm.email}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="you@example.com"
                                style={{ ...S.input, width: '100%' }}
                                disabled={loading}
                            />

                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Mobile Number</label>
                            <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                value={registerForm.mobile}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                                placeholder="98765 43210"
                                style={{ ...S.input, width: '100%' }}
                                disabled={loading}
                            />

                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Password</label>
                            <PasswordField 
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Minimum 8 chars"
                                inputClassName="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-all pr-12"
                                buttonClassName="text-text-muted hover:text-primary mr-2"
                                disabled={loading}
                            />

                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>DOB</label>
                            <input
                                type="date"
                                value={registerForm.dob}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, dob: e.target.value }))}
                                style={{ ...S.input, width: '100%' }}
                                disabled={loading}
                            />

                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Anniversary Date (optional)</label>
                            <input
                                type="date"
                                value={registerForm.anniversary}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, anniversary: e.target.value }))}
                                style={{ ...S.input, width: '100%' }}
                                disabled={loading}
                            />

                            {registerError && (
                                <p style={{ fontSize: '12px', color: '#ff4757', marginTop: 6 }}>
                                    {registerError}
                                </p>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCustomerRegister}
                                disabled={loading}
                                style={{
                                    ...S.btn,
                                    borderRadius: '16px',
                                    height: '52px',
                                    opacity: loading ? 0.6 : 1,
                                    marginTop: 6,
                                }}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Register & Continue'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
