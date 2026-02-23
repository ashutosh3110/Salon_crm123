import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Mail, ArrowRight, ArrowLeft, Lock,
    Eye, EyeOff, CheckCircle, KeyRound, RefreshCw
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';

/* ─── Step constants ──────────────────────────────────────────────────────── */
const S_EMAIL = 1;   // Enter email
const S_OTP = 2;   // Enter 6-digit OTP
const S_RESET = 3;   // Enter new password
const S_DONE = 4;   // Success

/* ─── Helper: countdown hook ─────────────────────────────────────────────── */
function useCountdown() {
    const [sec, setSec] = useState(0);
    const ref = useRef(null);
    const start = (s = 60) => {
        setSec(s);
        clearInterval(ref.current);
        ref.current = setInterval(() => {
            setSec(p => { if (p <= 1) { clearInterval(ref.current); return 0; } return p - 1; });
        }, 1000);
    };
    return { sec, start };
}

/* ─── Left-panel per-step copy ───────────────────────────────────────────── */
const COPY = {
    [S_EMAIL]: { title: ['Recover', 'Access.'], sub: "We'll send a 6-digit OTP to your email" },
    [S_OTP]: { title: ['Check', 'Inbox.'], sub: 'Enter the OTP sent to your email' },
    [S_RESET]: { title: ['New', 'Password.'], sub: 'Choose a strong, unique password' },
    [S_DONE]: { title: ['All', 'Done!'], sub: 'Your password has been reset' },
};

const STEP_LABELS = ['Email', 'OTP', 'Reset', '✓'];

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(S_EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showP, setShowP] = useState(false);
    const [showC, setShowC] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { sec, start } = useCountdown();
    const boxRefs = useRef([]);

    /* ── Mock delay ── */
    const mockApi = (ms = 700) => new Promise(r => setTimeout(r, ms));

    /* ── Step 1: Send OTP ── */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await mockApi();
            /* TODO: await api.post('/auth/forgot-password-otp', { email }) */
            setStep(S_OTP);
            start(60);
        } catch {
            setError('Failed to send OTP. Try again.');
        } finally { setLoading(false); }
    };

    /* ── Step 2: Verify OTP ── */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter all 6 digits'); return; }
        setError('');
        setLoading(true);
        try {
            await mockApi();
            /* TODO: await api.post('/auth/verify-reset-otp', { email, otp: code }) */
            /* Mock: accept any 6-digit OTP */
            setStep(S_RESET);
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally { setLoading(false); }
    };

    /* ── Step 3: Reset password ── */
    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
        if (password !== confirm) { setError('Passwords do not match'); return; }
        setError('');
        setLoading(true);
        try {
            await mockApi();
            /* TODO: await api.post('/auth/reset-password-otp', { email, otp: otp.join(''), newPassword: password }) */
            setStep(S_DONE);
        } catch (err) {
            setError(err?.response?.data?.message || 'Reset failed. Please start over.');
        } finally { setLoading(false); }
    };

    /* ── Resend OTP ── */
    const handleResend = async () => {
        setOtp(Array(6).fill(''));
        setError('');
        try {
            await mockApi(400);
            /* TODO: await api.post('/auth/forgot-password-otp', { email }) */
            start(60);
        } catch { setError('Could not resend. Try again.'); }
    };

    /* ── OTP box input handler ── */
    const handleOtpInput = (val, idx) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[idx] = val.slice(-1);
        setOtp(next);
        setError('');
        if (val && idx < 5) boxRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0)
            boxRefs.current[idx - 1]?.focus();
    };

    /* ── Password strength ── */
    const strength = password.length === 0 ? -1
        : password.length < 6 ? 0
            : password.length < 8 ? 1
                : password.length < 12 ? 2 : 3;
    const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

    /* ── Left panel copy ── */
    const { title, sub } = COPY[step];

    return (
        <div className="min-h-screen bg-[#6B2A3B] flex flex-col">
            <Navbar />

            <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-10">
                <div className="w-full max-w-[1000px] md:h-[640px] bg-white rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden mx-auto">

                    {/* ══════════ LEFT PANEL ══════════ */}
                    <div className="hidden md:flex w-[42%] bg-[#4A1D28] relative overflow-hidden flex-col items-center justify-between text-white p-12">

                        {/* Glow blobs */}
                        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center gap-6">
                            {/* Arch image */}
                            <div className="relative w-[80%] aspect-[4/5] rounded-t-full rounded-b-[40px] overflow-hidden border-4 border-white/10 shadow-2xl group">
                                <img
                                    src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800"
                                    alt="Recover access"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28]/80 via-transparent to-transparent" />
                            </div>

                            {/* Dynamic heading */}
                            <div className="text-center space-y-1">
                                <h3 className="text-2xl font-black tracking-tight leading-none uppercase">
                                    {title[0]} <span className="text-primary italic">{title[1]}</span>
                                </h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed max-w-[180px] mx-auto">
                                    {sub}
                                </p>
                            </div>

                            {/* Step dots */}
                            <div className="flex items-end gap-4">
                                {[S_EMAIL, S_OTP, S_RESET, S_DONE].map((s, i) => (
                                    <div key={s} className="flex flex-col items-center gap-1.5">
                                        <div className={`rounded-full transition-all duration-500 ${step === s ? 'w-3 h-3 bg-white scale-110 shadow-[0_0_8px_white]'
                                                : step > s ? 'w-2 h-2 bg-primary'
                                                    : 'w-2 h-2 bg-white/20'
                                            }`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-white/60' : 'text-white/20'
                                            }`}>{STEP_LABELS[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nav links */}
                        <div className="relative z-10 w-full bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-2 mb-4">
                            <Link to="/login" className="flex-1 text-white/50 hover:text-white border border-transparent hover:border-white/30 font-black py-2.5 rounded-xl text-[10px] tracking-[0.2em] text-center uppercase transition-all">
                                LOGIN
                            </Link>
                            <Link to="/register" className="flex-1 text-white/50 hover:text-white border border-transparent hover:border-white/30 font-black py-2.5 rounded-xl text-[10px] tracking-[0.2em] text-center uppercase transition-all">
                                SIGN UP
                            </Link>
                            <div className="flex-1 bg-transparent border border-white/80 text-white font-black py-2.5 rounded-xl text-[10px] tracking-[0.2em] text-center uppercase shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                                RESET
                            </div>
                        </div>
                    </div>

                    {/* ══════════ RIGHT PANEL ══════════ */}
                    <div className="flex-1 flex flex-col bg-white p-8 md:p-12 justify-center overflow-y-auto">

                        {/* Mobile top tabs */}
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="inline-flex bg-primary/5 p-1 rounded-full border border-primary/10 gap-0.5">
                                <Link to="/login" className="px-4 py-2 text-primary/40 text-[10px] font-black uppercase tracking-widest rounded-full">Login</Link>
                                <Link to="/register" className="px-4 py-2 text-primary/40 text-[10px] font-black uppercase tracking-widest rounded-full">Sign Up</Link>
                                <div className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Reset</div>
                            </div>
                        </div>

                        {/* Logo + step indicator */}
                        <div className="flex flex-col items-center mb-6 md:mb-8">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-3 border-4 border-primary/10 ring-2 ring-primary/5 p-2">
                                <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>

                            {/* Progress bar (steps 1-3 only) */}
                            {step < S_DONE && (
                                <div className="flex gap-1.5 mb-3">
                                    {[S_EMAIL, S_OTP, S_RESET].map(s => (
                                        <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary' : step > s ? 'w-4 bg-primary/35' : 'w-4 bg-gray-200'
                                            }`} />
                                    ))}
                                </div>
                            )}

                            <h2 className="text-xl md:text-2xl font-black text-primary tracking-[0.15em] uppercase text-center">
                                {step === S_EMAIL && 'Forgot Password'}
                                {step === S_OTP && 'Verify OTP'}
                                {step === S_RESET && 'New Password'}
                                {step === S_DONE && 'All Done!'}
                            </h2>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5 text-center">
                                {step === S_EMAIL && "Enter your registered email to receive a 6-digit OTP"}
                                {step === S_OTP && `Check the inbox of ${email}`}
                                {step === S_RESET && 'Create a strong new password'}
                                {step === S_DONE && 'Your password has been changed successfully'}
                            </p>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold text-center">
                                {error}
                            </div>
                        )}

                        {/* ══ STEP 1: EMAIL ══ */}
                        {step === S_EMAIL && (
                            <form onSubmit={handleSendOtp} className="space-y-8">
                                <div className="relative border-b-2 border-primary/10 focus-within:border-primary transition-all">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(''); }}
                                        required autoFocus
                                        className="w-full pl-6 py-2.5 bg-transparent text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none"
                                        placeholder="Registered Email Address"
                                    />
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading
                                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                            : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>
                                        }
                                    </button>
                                    <Link to="/login" className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                                        <ArrowLeft className="w-3 h-3" /> Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}

                        {/* ══ STEP 2: OTP ══ */}
                        {step === S_OTP && (
                            <form onSubmit={handleVerifyOtp} className="space-y-8">
                                {/* 6-box OTP input */}
                                <div className="flex justify-center gap-2 md:gap-3">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => boxRefs.current[idx] = el}
                                            id={`otp-box-${idx}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpInput(e.target.value, idx)}
                                            onKeyDown={e => handleOtpKeyDown(e, idx)}
                                            autoFocus={idx === 0}
                                            className={`w-10 h-13 md:w-12 md:h-14 text-center text-xl font-black border-b-2 bg-transparent focus:outline-none transition-all duration-200 ${digit ? 'border-primary text-primary' : 'border-gray-200 text-gray-800'
                                                } focus:border-primary`}
                                            style={{ height: '3.5rem' }}
                                        />
                                    ))}
                                </div>

                                {/* Resend */}
                                <div className="text-center">
                                    {sec > 0 ? (
                                        <p className="text-[11px] text-gray-400 font-medium">
                                            Resend OTP in <span className="text-primary font-bold">{sec}s</span>
                                        </p>
                                    ) : (
                                        <button type="button" onClick={handleResend}
                                            className="flex items-center gap-1.5 mx-auto text-[11px] font-bold text-primary hover:underline underline-offset-2 uppercase tracking-widest">
                                            <RefreshCw className="w-3 h-3" /> Resend OTP
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <button
                                        type="submit" disabled={loading || otp.join('').length < 6}
                                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading
                                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                                            : <><span>Verify OTP</span><ArrowRight className="w-4 h-4" /></>
                                        }
                                    </button>
                                    <button type="button"
                                        onClick={() => { setStep(S_EMAIL); setOtp(Array(6).fill('')); setError(''); }}
                                        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                                        <ArrowLeft className="w-3 h-3" /> Change Email
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ══ STEP 3: NEW PASSWORD ══ */}
                        {step === S_RESET && (
                            <form onSubmit={handleReset} className="space-y-5">
                                {/* New password */}
                                <div className="relative border-b-2 border-primary/10 focus-within:border-primary transition-all">
                                    <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type={showP ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(''); }}
                                        required autoFocus
                                        className="w-full pl-6 pr-8 py-2.5 bg-transparent text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none"
                                        placeholder="New Password (min 8 chars)"
                                    />
                                    <button type="button" onClick={() => setShowP(!showP)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary">
                                        {showP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Password strength bar */}
                                {strength >= 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[0, 1, 2, 3].map(l => (
                                                <div key={l} className={`h-1 flex-1 rounded-full transition-all duration-300 ${l <= strength ? strengthColor[strength] : 'bg-gray-200'
                                                    }`} />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${strength < 2 ? 'text-orange-400' : 'text-green-500'
                                            }`}>{strengthLabel[strength]}</p>
                                    </div>
                                )}

                                {/* Confirm password */}
                                <div className="relative border-b-2 border-primary/10 focus-within:border-primary transition-all">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type={showC ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={e => { setConfirm(e.target.value); setError(''); }}
                                        required
                                        className="w-full pl-6 pr-8 py-2.5 bg-transparent text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none"
                                        placeholder="Confirm New Password"
                                    />
                                    <button type="button" onClick={() => setShowC(!showC)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary">
                                        {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Match hint */}
                                {confirm.length > 0 && (
                                    <p className={`text-[10px] font-bold ${password === confirm ? 'text-green-500' : 'text-red-400'}`}>
                                        {password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}

                                <div className="flex flex-col items-center gap-3 pt-2">
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading
                                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
                                            : <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>
                                        }
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ══ STEP 4: SUCCESS ══ */}
                        {step === S_DONE && (
                            <div className="flex flex-col items-center justify-center gap-5 py-4">
                                {/* Animated check */}
                                <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center shadow-xl animate-bounce-once">
                                    <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
                                    Your password has been changed. You can now sign in with your new credentials.
                                </p>
                                <Link
                                    to="/login"
                                    className="bg-primary text-white px-12 py-4 rounded-full font-bold text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    <span>Go to Login</span><ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
