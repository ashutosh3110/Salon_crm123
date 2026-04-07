import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, ArrowRight, ArrowLeft, Lock,
    CheckCircle, KeyRound, RefreshCw, Sparkles
} from 'lucide-react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import api from '../../services/api';
import PasswordField from '../../components/common/PasswordField';
import { useTheme } from '../../contexts/ThemeContext';

/* ─── Step constants ──────────────────────────────────────────────────────── */
const S_EMAIL = 1;   // Enter email
const S_OTP = 2;     // Enter 6-digit OTP
const S_RESET = 3;   // Enter new password
const S_DONE = 4;    // Success

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
    [S_EMAIL]: { title: ['Recover', 'Access.'], sub: "Initialize security protocols to reclaim your workspace" },
    [S_OTP]: { title: ['Check', 'Terminal.'], sub: 'Validate the 6-digit code sent to your secure inbox' },
    [S_RESET]: { title: ['Define', 'New.'], sub: 'Establish a new high-entropy credential' },
    [S_DONE]: { title: ['Access', 'Granted.'], sub: 'Security protocols updated successfully' },
};

const STEP_LABELS = ['Email', 'Verify', 'New', '✓'];

export default function ForgotPasswordPage() {
    const { theme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.backgroundColor = 'var(--wapixo-bg)';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    const [step, setStep] = useState(S_EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { sec, start } = useCountdown();
    const boxRefs = useRef([]);

    /* ── Step 1: Send OTP ── */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            if (res.data.success) {
                setStep(S_OTP);
                start(60);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'System timeout. Try again.');
        } finally { setLoading(false); }
    };

    /* ── Step 2: Verify OTP ── */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { setError('Enter complete 6-digit code'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-reset-otp', { email, otp: code });
            if (res.data.success) {
                setStep(S_RESET);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid sequence pulse.');
        } finally { setLoading(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 8) { setError('Minimum 8 characters required'); return; }
        if (password !== confirm) { setError('Sequence mismatch'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { 
                email, 
                otp: otp.join(''), 
                password 
            });
            if (res.data.success) {
                setStep(S_DONE);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setOtp(Array(6).fill(''));
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            start(60);
        } catch { setError('Resend failed.'); }
    };

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

    const strength = password.length === 0 ? -1
        : password.length < 6 ? 0
            : password.length < 8 ? 1
                : password.length < 12 ? 2 : 3;
    const strengthLabel = ['Vulnerable', 'Standard', 'Secure', 'Indomitable'];
    const strengthColor = ['bg-red-500/40', 'bg-orange-500/40', 'bg-[#B4912B]/40', 'bg-green-500/40'];

    const { title, sub } = COPY[step];

    return (
        <div className="min-h-screen new-theme selection:bg-[#B4912B]/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)' }}>
            <WapixoNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 pt-24 md:pt-32 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: 'var(--wapixo-bg-alt)', borderColor: 'var(--wapixo-border)' }}
                    className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] mx-auto overflow-y-auto max-h-[90vh] md:max-h-none border"
                >
                    {/* Visual Section */}
                    <div className="md:w-5/12 relative p-8 md:p-12 flex flex-col gap-8 md:gap-0 items-center justify-between border-b md:border-b-0 md:border-r" style={{ background: theme === 'dark' ? 'rgba(15,15,15,0.5)' : 'rgba(255,255,255,0.5)', borderColor: 'var(--wapixo-border)' }}>
                        <div className="w-full relative z-10 text-center md:text-left">
                            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B4912B] mb-2 block">Security Protocol</span>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6" style={{ color: 'var(--wapixo-text)' }}>
                                    {title[0]} <br /> <span style={{ color: 'var(--wapixo-text-muted)', opacity: 0.5 }}>{title[1]}</span>
                                </h1>
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[220px] mx-auto md:mx-0" style={{ color: 'var(--wapixo-text-muted)' }}>
                                    {sub}
                                </p>
                            </motion.div>

                            <div className="hidden md:block relative aspect-[3/4] w-full max-w-[240px] mt-12 overflow-hidden rounded-[2.5rem] border group" style={{ borderColor: 'var(--wapixo-border)' }}>
                                <img
                                    src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1000"
                                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                    alt="Security"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="w-full grid grid-cols-4 gap-2 p-2 border rounded-2xl relative z-10" style={{ background: 'var(--wapixo-bg)', borderColor: 'var(--wapixo-border)' }}>
                            {[S_EMAIL, S_OTP, S_RESET, S_DONE].map((s, i) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={`h-1 w-full rounded-full transition-all duration-500 ${step >= s ? 'bg-[#B4912B]' : 'bg-white/10'}`} />
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${step >= s ? 'text-[#B4912B]' : 'text-white/20'}`}>{STEP_LABELS[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 sm:p-10 md:p-16 flex flex-col justify-center relative bg-transparent">
                        <div className="max-w-md mx-auto w-full">
                            <AnimatePresence mode="wait">
                                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="text-center md:text-left">
                                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2" style={{ color: 'var(--wapixo-text)' }}>
                                            {step === S_EMAIL && <>Identity <span className="text-[#B4912B] italic">Verify.</span></>}
                                            {step === S_OTP && <>Security <span className="text-[#B4912B] italic">Pulse.</span></>}
                                            {step === S_RESET && <>New <span className="text-[#B4912B] italic">Paradigm.</span></>}
                                            {step === S_DONE && <>Identity <span className="text-[#B4912B] italic">Restored.</span></>}
                                        </h2>
                                        <div className="h-1 w-12 bg-[#B4912B]/20 rounded-full mx-auto md:mx-0" />
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                        </motion.div>
                                    )}

                                    {/* STEP 1: Email */}
                                    {step === S_EMAIL && (
                                        <form onSubmit={handleSendOtp} className="space-y-8">
                                            <div className="group space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Workspace Link</label>
                                                <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    <input
                                                        type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required autoFocus
                                                        className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        style={{ color: 'var(--wapixo-text)' }}
                                                        placeholder="registered@email.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                                                    {loading ? 'Transmitting...' : <><span>Initialize Recovery</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>
                                                <Link to="/login" className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-[#B4912B] transition-all" style={{ color: 'var(--wapixo-text-muted)' }}>
                                                    <ArrowLeft className="w-3 h-3" /> Back to Portal
                                                </Link>
                                            </div>
                                        </form>
                                    )}

                                    {/* STEP 2: OTP */}
                                    {step === S_OTP && (
                                        <form onSubmit={handleVerifyOtp} className="space-y-10">
                                            <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                                                {otp.map((digit, idx) => (
                                                    <input
                                                        key={idx} ref={el => boxRefs.current[idx] = el} type="text" inputMode="numeric" maxLength={1} value={digit}
                                                        onChange={e => handleOtpInput(e.target.value, idx)}
                                                        onKeyDown={e => handleOtpKeyDown(e, idx)}
                                                        className={`w-10 h-16 text-center text-2xl font-black bg-transparent border-b-2 transition-all duration-300 focus:outline-none`}
                                                        style={{ 
                                                            borderColor: digit ? '#B4912B' : 'var(--wapixo-border)',
                                                            color: 'var(--wapixo-text)',
                                                            opacity: digit ? 1 : 0.3
                                                        }}
                                                    />
                                                ))}
                                            </div>

                                            <div className="text-center space-y-4">
                                                {sec > 0 ? (
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Resend Sequence: <span className="text-[#B4912B]">{sec}s</span></p>
                                                ) : (
                                                    <button type="button" onClick={handleResend} className="text-[9px] font-black uppercase tracking-widest text-[#B4912B] hover:text-[#B4912B]/80 transition-colors flex items-center gap-2 mx-auto">
                                                        <RefreshCw className="w-3 h-3" /> Transmit New Pulse
                                                    </button>
                                                )}
                                                <button type="submit" disabled={loading || otp.join('').length < 6} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                                                    {loading ? 'Validating...' : <><span>Authorize Access</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* STEP 3: Reset */}
                                    {step === S_RESET && (
                                        <form onSubmit={handleReset} className="space-y-8">
                                            <div className="space-y-6">
                                                <div className="group space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>New Credential</label>
                                                    <PasswordField 
                                                        value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoFocus
                                                        containerClassName="border-b-2 transition-all duration-300"
                                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                                        inputClassName="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        buttonClassName="hover:text-[#B85C5C]"
                                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                                    >
                                                        <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    </PasswordField>
                                                </div>

                                                {password.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-1 h-0.5">
                                                            {[0, 1, 2, 3].map(l => (
                                                                <div key={l} className={`h-full flex-1 transition-all duration-500 ${l <= strength ? strengthColor[strength] : 'bg-white/5'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#B4912B]/60">{strengthLabel[strength]} Complexity</p>
                                                    </div>
                                                )}

                                                <div className="group space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Confirm Identity</label>
                                                    <PasswordField 
                                                        value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                                                        containerClassName="border-b-2 transition-all duration-300"
                                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                                        inputClassName="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        buttonClassName="hover:text-[#B85C5C]"
                                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                                    >
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    </PasswordField>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={loading} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                                                {loading ? 'Updating...' : <><span>Revoke Old & Finalize</span><ArrowRight className="w-4 h-4" /></>}
                                            </button>
                                        </form>
                                    )}

                                    {/* STEP 4: Success */}
                                    {step === S_DONE && (
                                        <div className="text-center space-y-8 py-4">
                                            <div className="relative inline-flex">
                                                <div className="w-24 h-24 rounded-full bg-[#B4912B]/5 border border-[#B4912B]/20 flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="w-10 h-10 text-[#B4912B]" strokeWidth={1} />
                                                </div>
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full shadow">
                                                    <Sparkles className="w-3 h-3 text-black" />
                                                </motion.div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B4912B]">Success Encountered</p>
                                                <p className="text-sm font-bold leading-relaxed" style={{ color: 'var(--wapixo-text)' }}>Your credentials have been re-encrypted. <br /> Portal access is now available.</p>
                                            </div>
                                            <Link to="/login" className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                                                <span>Return to Portal</span><ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
