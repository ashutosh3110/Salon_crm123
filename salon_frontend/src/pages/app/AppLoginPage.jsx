import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, User } from 'lucide-react';

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 240 : -240, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -240 : 240, opacity: 0 }),
};

export default function AppLoginPage() {
    const [step, setStep] = useState(1);
    const [direction, setDir] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [countdown, setCd] = useState(0);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();
    const { requestOtp, customerLogin, completeProfile } = useCustomerAuth();
    const { theme } = useCustomerTheme();
    const isLight = theme === 'light';

    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCd(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    // Auto-submit Phone
    useEffect(() => {
        if (phone.length === 10 && step === 1 && !loading) {
            handleSendOtp();
        }
    }, [phone]);

    // Auto-submit OTP
    useEffect(() => {
        if (otp.join('').length === 4 && step === 2 && !loading) {
            handleVerifyOtp();
        }
    }, [otp]);

    const goTo = (s) => { setDir(s > step ? 1 : -1); setError(''); setStep(s); };

    /* ── Theme based colors ── */
    const colors = {
        bg: isLight ? '#FCF9F6' : '#0F0F0F',
        card: isLight ? '#FFFFFF' : '#1E1E1E',
        text: isLight ? '#1A1A1A' : '#FFFFFF',
        textMuted: isLight ? '#666' : 'rgba(255,255,255,0.4)',
        border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        inputBg: isLight ? '#FFFFFF' : '#1E1E1E',
    };

    const handleSendOtp = async () => {
        if (phone.length !== 10) { setError('Enter a valid 10-digit number'); return; }
        setLoading(true); setError('');
        try {
            await requestOtp(phone);
            setCd(30); goTo(2);
        } catch (e) { setError(e.message || 'Failed to send OTP'); }
        finally { setLoading(false); }
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
        setLoading(true); setError('');
        try {
            const c = await customerLogin(phone, code);
            if (c.isNewUser) goTo(3); else navigate('/app', { state: { justLoggedIn: true } });
        } catch (e) {
            setError(e.message || 'Invalid OTP');
            setOtp(['', '', '', '']);
            otpRefs[0].current?.focus();
        } finally { setLoading(false); }
    };

    const handleProfile = async () => {
        if (!name.trim()) { setError('Please enter your name'); return; }
        setLoading(true); setError('');
        try {
            await completeProfile({ name: name.trim(), gender });
            navigate('/app', { state: { justLoggedIn: true } });
        } catch (e) { setError(e.message || 'Something went wrong'); }
        finally { setLoading(false); }
    };

    const fmtPhone = (p) => p.length > 5 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : `+91 ${p}`;

    const S = {
        page: {
            minHeight: '100svh',
            width: '100%',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Open Sans', sans-serif",
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            transition: 'background 0.3s ease',
            overflow: 'hidden'
        },
        input: {
            width: '100%',
            background: colors.inputBg,
            border: `1.5px solid ${colors.border}`,
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '16px',
            color: colors.text,
            outline: 'none',
            fontFamily: "'Inter', sans-serif",
        },
        btn: {
            width: '100%',
            background: '#C8956C',
            border: 'none',
            borderRadius: '14px',
            padding: '15px',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
            boxShadow: '0 4px 12px rgba(200,149,108,0.2)',
        },
        ghost: {
            background: 'none',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center', gap: '6px', padding: 0,
            fontFamily: "'Inter', sans-serif",
        },
    };

    return (
        <div style={S.page}>
            <AnimatePresence mode="wait" custom={direction}>

                {/* ── STEP 1: PHONE ── */}
                {step === 1 && (
                    <motion.div key="phone" custom={direction} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '360px' }}
                    >
                        {/* Logo */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div className="mx-auto mb-5">
                                <img
                                    src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'}
                                    alt="Salon Logo"
                                    className="h-20 w-auto mx-auto object-contain"
                                />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 4px', fontFamily: "'Playfair Display', serif" }}>
                                Welcome Back
                            </h1>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                                Sign in to access your account
                            </p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', paddingLeft: '4px' }}>
                                Phone Number
                            </label>
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    borderRadius: '20px 6px 20px 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '52px',
                                    border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', borderRight: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, flexShrink: 0, height: '60%' }}>
                                    <span style={{ fontSize: '14px', color: isFocused ? '#C8956C' : colors.textMuted, fontWeight: 800 }}>+91</span>
                                </div>
                                <input
                                    type="tel" inputMode="numeric" maxLength={10}
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="98765 43210"
                                    autoFocus
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '0 16px',
                                        fontSize: '16px',
                                        color: colors.text,
                                        outline: 'none',
                                        fontFamily: "'Inter', sans-serif",
                                        letterSpacing: '0.1em',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                        </div>

                        {error && <p style={{ fontSize: '13px', color: '#ff4757', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSendOtp}
                            disabled={loading || phone.length !== 10}
                            style={{ ...S.btn, opacity: (loading || phone.length !== 10) ? 0.5 : 1 }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Get OTP'}
                        </motion.button>

                        <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginTop: '24px' }}>
                            By continuing, you agree to our{' '}
                            <a href="/terms" style={{ color: '#C8956C', fontWeight: 600 }}>Terms</a> &{' '}
                            <a href="/privacy" style={{ color: '#C8956C', fontWeight: 600 }}>Privacy Policy</a>
                        </p>
                    </motion.div>
                )}

                {/* ── STEP 2: OTP VERIFICATION ── */}
                {step === 2 && (
                    <motion.div key="otp" custom={direction} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '360px' }}
                    >
                        {/* Back */}
                        <button onClick={() => goTo(1)} style={{ ...S.ghost, marginBottom: '32px' }}>
                            <ArrowLeft size={18} /> Back
                        </button>

                        {/* Title */}
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>
                                Phone Verification
                            </h2>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
                                Enter your OTP code here
                            </p>
                            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '6px 0 0' }}>
                                Sent to{' '}
                                <span style={{ color: '#C8956C', fontWeight: 700 }}>{fmtPhone(phone)}</span>
                            </p>
                        </div>

                        {/* OTP Boxes */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '28px' }}>
                            {otp.map((digit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.07 }}
                                    style={{ position: 'relative' }}
                                >
                                    <input
                                        ref={otpRefs[i]}
                                        type="text" inputMode="numeric" maxLength={1}
                                        value={digit}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKey(i, e)}
                                        autoFocus={i === 0}
                                        style={{
                                            width: '54px', height: '60px',
                                            background: digit ? '#C8956C' : colors.inputBg,
                                            border: '1.5px solid',
                                            borderColor: digit ? '#C8956C' : colors.border,
                                            borderRadius: '14px',
                                            textAlign: 'center',
                                            fontSize: '22px', fontWeight: 800,
                                            color: digit ? '#fff' : colors.text,
                                            outline: 'none',
                                            fontFamily: "'Inter', sans-serif",
                                            cursor: 'text',
                                            transition: 'all 0.2s',
                                            boxShadow: isLight && !digit ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Countdown */}
                        <p style={{ textAlign: 'center', fontSize: '14px', color: colors.textMuted, marginBottom: '24px' }}>
                            {countdown > 0 ? (
                                <>
                                    <span style={{ fontFamily: 'monospace', fontSize: '16px', color: colors.text, fontWeight: 700 }}>
                                        {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                                    </span>
                                </>
                            ) : null}
                        </p>

                        {error && <p style={{ fontSize: '13px', color: '#ff4757', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleVerifyOtp}
                            disabled={loading || otp.join('').length !== 4}
                            style={{ ...S.btn, opacity: (loading || otp.join('').length !== 4) ? 0.5 : 1, marginBottom: '16px' }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify'}
                        </motion.button>

                        <p style={{ textAlign: 'center', fontSize: '13px', color: colors.textMuted }}>
                            Didn't receive any code?{' '}
                            {countdown > 0 ? (
                                <span style={{ color: colors.textMuted }}>Wait {countdown}s</span>
                            ) : (
                                <button onClick={handleSendOtp} style={{ ...S.ghost, display: 'inline', color: '#C8956C', fontWeight: 600 }}>
                                    Resend code
                                </button>
                            )}
                        </p>
                    </motion.div>
                )}

                {/* ── STEP 3: COMPLETE PROFILE ── */}
                {step === 3 && (
                    <motion.div key="profile" custom={direction} variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%', maxWidth: '400px' }}
                        className="py-4"
                    >
                        {/* Header Inspired by GenderSelectPage */}
                        <div className="text-center mb-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="mx-auto mb-4"
                            >
                                <img
                                    src={isLight ? '/2-removebg-preview.png' : '/1-removebg-preview.png'}
                                    alt="Salon Logo"
                                    className="h-22 w-auto mx-auto object-contain"
                                />
                            </motion.div>
                            <motion.h1
                                animate={{
                                    opacity: [1, 0.7, 1],
                                    filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"],
                                    scale: [1, 1.01, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{
                                    fontSize: '22px',
                                    fontWeight: 900,
                                    color: colors.text,
                                    margin: '0 0 6px',
                                    fontFamily: "'Playfair Display', serif",
                                    fontStyle: 'italic',
                                    letterSpacing: '-0.02em',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Personalize <span style={{ color: '#C8956C' }}>Experience</span>
                            </motion.h1>
                            <p style={{ fontSize: '9px', color: colors.textMuted, margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Select your ritual preference
                            </p>
                        </div>

                        {/* Name Input - Home Page Search Bar Style */}
                        <div style={{ marginBottom: '16px' }}>
                            <div className="flex items-center justify-between mb-1.5 px-1">
                                <label style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Name</label>
                            </div>
                            <div
                                style={{
                                    background: isLight
                                        ? 'linear-gradient(135deg, #FFF9F5 0%, #F3EAE3 100%)'
                                        : 'linear-gradient(135deg, #2A211B 0%, #1A1411 100%)',
                                    borderRadius: '20px 6px 20px 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 16px',
                                    height: '52px',
                                    gap: '12px',
                                    border: isFocused ? `1.5px solid #C8956C` : `1.5px solid ${isLight ? '#E8ECEF' : 'transparent'}`,
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: isLight ? 'inset 0 1px 3px rgba(0,0,0,0.03)' : 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                }}
                            >
                                <User size={18} color={isFocused ? '#C8956C' : (isLight ? '#666' : 'rgba(255,255,255,0.6)')} />
                                <input
                                    type="text" value={name} autoFocus
                                    onChange={e => { setName(e.target.value); setError(''); }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="Enter your full name"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: colors.text,
                                        fontSize: '14px',
                                        width: '100%',
                                        height: '100%',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                        </div>

                        {/* Premium Gender Selection Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {[
                                { id: 'male', label: 'Gentlemen', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80' },
                                { id: 'female', label: 'Ladies', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80' }
                            ].map(g => (
                                <motion.div
                                    key={g.id}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setGender(g.id)}
                                    style={{
                                        position: 'relative',
                                        height: '140px',
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: `2px solid ${gender === g.id ? '#C8956C' : 'transparent'}`,
                                        transition: 'all 0.3s ease',
                                        boxShadow: gender === g.id ? '0 8px 20px rgba(200,149,108,0.2)' : 'none'
                                    }}
                                >
                                    <img src={g.img} alt={g.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: gender === g.id ? 1 : 0.7 }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                                    <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                                        <p style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '1px', letterSpacing: '0.05em' }}>Curation for</p>
                                        <p style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontFamily: "'Playfair Display', serif" }}>{g.label}</p>
                                    </div>
                                    {gender === g.id && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', background: '#C8956C', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {error && <p style={{ fontSize: '12px', color: '#ff4757', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleProfile}
                            disabled={loading || !name.trim() || !gender}
                            style={{
                                ...S.btn,
                                borderRadius: '16px',
                                height: '52px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                fontSize: '13px',
                                fontWeight: 900,
                                opacity: (loading || !name.trim() || !gender) ? 0.5 : 1
                            }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Get Started'}
                        </motion.button>

                        <div style={{ textAlign: 'center', marginTop: '16px', opacity: 0.4 }}>
                            <p style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Settings can be adjusted in profile
                            </p>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
