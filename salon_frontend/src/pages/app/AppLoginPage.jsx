import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { useCustomerTheme } from '../../contexts/CustomerThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

    const goTo = (s) => { setDir(s > step ? 1 : -1); setError(''); setStep(s); };

    /* ── Theme based colors ── */
    const colors = {
        bg: isLight ? '#F8F9FA' : '#141414',
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
            if (c.isNewUser) goTo(3); else navigate('/app');
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
            navigate('/app');
        } catch (e) { setError(e.message || 'Something went wrong'); }
        finally { setLoading(false); }
    };

    const fmtPhone = (p) => p.length > 5 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : `+91 ${p}`;

    const S = {
        page: {
            minHeight: '100svh',
            background: colors.bg,
            color: colors.text,
            fontFamily: "'Open Sans', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 32px',
            transition: 'background 0.3s ease',
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
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #C8956C, #a06844)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(200,149,108,0.3)' }}>
                                💇
                            </div>
                            <h1 style={{ fontSize: '26px', fontWeight: 800, color: colors.text, margin: '0 0 6px', fontFamily: "'Playfair Display', serif" }}>
                                Welcome Back
                            </h1>
                            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>
                                Sign in to access your account
                            </p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: colors.textMuted, display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                                Phone Number
                            </label>
                            <div style={{ display: 'flex', gap: '0', background: colors.inputBg, borderRadius: '14px', border: `1.5px solid ${colors.border}`, overflow: 'hidden', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.02)' : 'none' }}>
                                <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', borderRight: `1px solid ${colors.border}`, flexShrink: 0 }}>
                                    <span style={{ fontSize: '14px', color: colors.textMuted, fontWeight: 700 }}>+91</span>
                                </div>
                                <input
                                    type="tel" inputMode="numeric" maxLength={10}
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                                    placeholder="98765 43210"
                                    autoFocus
                                    style={{ flex: 1, background: 'none', border: 'none', padding: '14px 16px', fontSize: '16px', color: colors.text, outline: 'none', fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em' }}
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
                        style={{ width: '100%', maxWidth: '360px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: colors.text, margin: '0 0 8px', fontFamily: "'Playfair Display', serif" }}>Almost There!</h2>
                            <p style={{ fontSize: '14px', color: colors.textMuted, margin: 0 }}>Tell us a bit about yourself</p>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '13px', color: colors.textMuted, display: 'block', marginBottom: '8px', fontWeight: 600 }}>Your Name</label>
                            <input
                                type="text" value={name} autoFocus
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder="Enter your name"
                                style={S.input}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '13px', color: colors.textMuted, display: 'block', marginBottom: '10px', fontWeight: 600 }}>
                                Gender <span style={{ color: colors.textMuted, opacity: 0.6, fontWeight: 400 }}>(optional)</span>
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['female', 'male', 'other'].map(g => (
                                    <motion.button
                                        key={g} whileTap={{ scale: 0.94 }}
                                        onClick={() => setGender(g)}
                                        style={{
                                            flex: 1, padding: '10px 0',
                                            background: gender === g ? '#C8956C' : colors.inputBg,
                                            border: '1.5px solid',
                                            borderColor: gender === g ? '#C8956C' : colors.border,
                                            borderRadius: '12px',
                                            color: gender === g ? '#fff' : colors.text,
                                            fontSize: '13px', fontWeight: 600,
                                            cursor: 'pointer', textTransform: 'capitalize',
                                            fontFamily: "'Inter', sans-serif",
                                            transition: 'all 0.2s',
                                            boxShadow: isLight && gender !== g ? '0 2px 8px rgba(0,0,0,0.02)' : 'none',
                                        }}
                                    >
                                        {g === 'female' ? '👩 ' : g === 'male' ? '👨 ' : '🧑 '}{g}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {error && <p style={{ fontSize: '13px', color: '#ff4757', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleProfile}
                            disabled={loading || !name.trim()}
                            style={{ ...S.btn, opacity: (loading || !name.trim()) ? 0.5 : 1 }}
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Get Started ✨'}
                        </motion.button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
