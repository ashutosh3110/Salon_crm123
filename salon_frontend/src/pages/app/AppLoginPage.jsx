import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, Sparkles, ChevronLeft } from 'lucide-react';

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function AppLoginPage() {
    const [step, setStep] = useState(1); // 1=phone, 2=otp, 3=profile
    const [direction, setDirection] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const otpRefs = [useRef(), useRef(), useRef(), useRef()];
    const navigate = useNavigate();
    const { requestOtp, customerLogin, completeProfile } = useCustomerAuth();

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const goTo = (newStep) => {
        setDirection(newStep > step ? 1 : -1);
        setError('');
        setStep(newStep);
    };

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // TODO: Replace with api.post('/auth/request-otp', { phone })
            await requestOtp(phone);
            setCountdown(30);
            goTo(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // OTP input handler with auto-advance
    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 4) {
            setError('Please enter the 4-digit OTP');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // TODO: Replace with api.post('/auth/login-otp', { phone, otp: code })
            const customer = await customerLogin(phone, code);
            if (customer.isNewUser) {
                goTo(3);
            } else {
                navigate('/app');
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
            setOtp(['', '', '', '']);
            otpRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete profile
    const handleCompleteProfile = async () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // TODO: Replace with api.patch('/clients/:id', { name, gender })
            await completeProfile({ name: name.trim(), gender });
            navigate('/app');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">
            {/* Brand Hero */}
            <div className="relative bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden pt-16 pb-12 px-6">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/20" />
                    <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-white/15" />
                    <div className="absolute top-20 left-16 w-12 h-12 rounded-full bg-white/10" />
                </div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white leading-tight">
                        Welcome to<br />Glamour Studio
                    </h1>
                    <p className="text-white/70 text-sm mt-2 leading-relaxed">
                        Book appointments, earn loyalty points, and look your best.
                    </p>
                </motion.div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 py-8 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 && (
                        <motion.div
                            key="phone"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-text">Enter your phone number</h2>
                                <p className="text-sm text-text-muted mt-1">We'll send you a verification code</p>
                            </div>

                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                    <span className="text-sm text-text-secondary font-semibold">+91</span>
                                    <div className="w-px h-5 bg-border" />
                                </div>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                                    placeholder="98765 43210"
                                    className="w-full pl-16 pr-4 py-4 rounded-2xl border-2 border-border bg-surface text-lg font-semibold tracking-wider focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-medium">
                                    {error}
                                </motion.p>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSendOtp}
                                disabled={loading || phone.length !== 10}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:shadow-md transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>Continue <ArrowRight className="w-5 h-5" /></>
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="otp"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-6"
                        >
                            <button onClick={() => goTo(1)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Change number
                            </button>

                            <div>
                                <h2 className="text-xl font-bold text-text">Verify your number</h2>
                                <p className="text-sm text-text-muted mt-1">
                                    Code sent to <span className="font-semibold text-text">+91 {phone}</span>
                                </p>
                            </div>

                            <div className="flex justify-center gap-3">
                                {otp.map((digit, i) => (
                                    <motion.input
                                        key={i}
                                        ref={otpRefs[i]}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`w-14 h-16 rounded-2xl border-2 text-center text-2xl font-bold focus:outline-none transition-all ${digit
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border bg-surface text-text'
                                            } focus:border-primary focus:ring-4 focus:ring-primary/10`}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-medium text-center">
                                    {error}
                                </motion.p>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.join('').length !== 4}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                            </motion.button>

                            <p className="text-center text-sm text-text-muted">
                                {countdown > 0 ? (
                                    <>Resend in <span className="font-bold text-text">{countdown}s</span></>
                                ) : (
                                    <button onClick={handleSendOtp} className="text-primary font-bold hover:underline">
                                        Resend OTP
                                    </button>
                                )}
                            </p>

                            <p className="text-center text-xs text-text-muted/70 bg-surface rounded-xl py-2 px-3">
                                💡 Demo: Use OTP <span className="font-bold text-text">1234</span>
                            </p>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="profile"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-text">Almost there! 🎉</h2>
                                <p className="text-sm text-text-muted mt-1">Tell us a bit about yourself</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-1.5 block">Your Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setError(''); }}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-border bg-surface text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-text-secondary mb-2 block">Gender (optional)</label>
                                    <div className="flex gap-2">
                                        {['female', 'male', 'other'].map((g) => (
                                            <motion.button
                                                key={g}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setGender(g)}
                                                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${gender === g
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-white text-text-secondary hover:border-primary/30'
                                                    }`}
                                            >
                                                {g === 'female' ? '👩 ' : g === 'male' ? '👨 ' : '🧑 '}
                                                {g}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-error font-medium">
                                    {error}
                                </motion.p>
                            )}

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleCompleteProfile}
                                disabled={loading || !name.trim()}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Started <Sparkles className="w-5 h-5" /></>}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 text-center">
                <p className="text-[11px] text-text-muted">
                    By continuing, you agree to our{' '}
                    <a href="/terms" className="text-primary font-medium hover:underline">Terms</a> &{' '}
                    <a href="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
