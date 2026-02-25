import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, ArrowRight, ArrowLeft, Lock,
    Eye, EyeOff, CheckCircle, KeyRound, RefreshCw, Sparkles
} from 'lucide-react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';

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
    const navigate = useNavigate();

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

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
            setStep(S_OTP);
            start(60);
        } catch {
            setError('System timeout. Try again.');
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
            await mockApi();
            setStep(S_RESET);
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid sequence pulse.');
        } finally { setLoading(false); }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (password.length < 8) { setError('Minimum 8 characters required'); return; }
        if (password !== confirm) { setError('Sequence mismatch'); return; }
        setError('');
        setLoading(true);
        try {
            await mockApi();
            setStep(S_DONE);
        } catch (err) {
            setError(err?.response?.data?.message || 'Update failed.');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setOtp(Array(6).fill(''));
        setError('');
        try {
            await mockApi(400);
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
    const strengthColor = ['bg-red-500/40', 'bg-orange-500/40', 'bg-primary/40', 'bg-green-500/40'];

    const { title, sub } = COPY[step];

    return (
        <div className="min-h-screen new-dark-theme selection:bg-primary/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 pt-24 md:pt-32 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-5xl flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2rem]"
                >
                    {/* Visual Section */}
                    <div className="md:w-5/12 bg-[#0F0F0F] relative p-12 flex flex-col items-center justify-between border-r border-white/5">
                        <div className="w-full relative z-10 text-center md:text-left">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 block">Security Protocol</span>
                                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">
                                    {title[0]} <br /> <span className="text-white/40">{title[1]}</span>
                                </h1>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-[220px] mx-auto md:mx-0">
                                    {sub}
                                </p>
                            </motion.div>

                            <div className="hidden md:block relative aspect-[3/4] w-full max-w-[240px] mt-12 overflow-hidden rounded-[2.5rem] border border-white/10 group">
                                <img
                                    src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1000"
                                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                    alt="Security"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="w-full grid grid-cols-4 gap-2 bg-black/50 p-2 border border-white/5 rounded-2xl relative z-10">
                            {[S_EMAIL, S_OTP, S_RESET, S_DONE].map((s, i) => (
                                <div key={s} className="flex flex-col items-center gap-2">
                                    <div className={`h-1 w-full rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-white/10'}`} />
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${step >= s ? 'text-white' : 'text-white/20'}`}>{STEP_LABELS[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative">
                        <div className="max-w-md mx-auto w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="text-center md:text-left">
                                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                            {step === S_EMAIL && <>Identity <span className="text-primary italic">Verify.</span></>}
                                            {step === S_OTP && <>Security <span className="text-primary italic">Pulse.</span></>}
                                            {step === S_RESET && <>New <span className="text-primary italic">Paradigm.</span></>}
                                            {step === S_DONE && <>Identity <span className="text-primary italic">Restored.</span></>}
                                        </h2>
                                        <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto md:mx-0" />
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
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Workspace Link</label>
                                                <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                    <input
                                                        type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required autoFocus
                                                        className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                        placeholder="registered@email.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 flex items-center justify-center gap-3">
                                                    {loading ? 'Transmitting...' : <><span>Initialize Recovery</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>
                                                <Link to="/login" className="flex items-center justify-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-all">
                                                    <ArrowLeft className="w-3 h-3" /> Back to Terminal
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
                                                        className={`w-10 h-16 text-center text-2xl font-black bg-transparent border-b-2 transition-all duration-300 focus:outline-none ${digit ? 'border-primary text-white' : 'border-white/10 text-white/20'} focus:border-primary`}
                                                    />
                                                ))}
                                            </div>

                                            <div className="text-center space-y-4">
                                                {sec > 0 ? (
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Resend Sequence: <span className="text-primary">{sec}s</span></p>
                                                ) : (
                                                    <button type="button" onClick={handleResend} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2 mx-auto">
                                                        <RefreshCw className="w-3 h-3" /> Transmit New Pulse
                                                    </button>
                                                )}
                                                <button type="submit" disabled={loading || otp.join('').length < 6} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 flex items-center justify-center gap-3">
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
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">New Credential</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <KeyRound className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input
                                                            type={showP ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoFocus
                                                            className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                            placeholder="••••••••"
                                                        />
                                                        <button type="button" onClick={() => setShowP(!showP)} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors">
                                                            {showP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {password.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-1 h-0.5">
                                                            {[0, 1, 2, 3].map(l => (
                                                                <div key={l} className={`h-full flex-1 transition-all duration-500 ${l <= strength ? strengthColor[strength] : 'bg-white/5'}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-primary/60">{strengthLabel[strength]} Complexity</p>
                                                    </div>
                                                )}

                                                <div className="group space-y-2">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Confirm Identity</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input
                                                            type={showC ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required
                                                            className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                            placeholder="••••••••"
                                                        />
                                                        <button type="button" onClick={() => setShowC(!showC)} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors">
                                                            {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 flex items-center justify-center gap-3">
                                                {loading ? 'Updating...' : <><span>Revoke Old & Finalize</span><ArrowRight className="w-4 h-4" /></>}
                                            </button>
                                        </form>
                                    )}

                                    {/* STEP 4: Success */}
                                    {step === S_DONE && (
                                        <div className="text-center space-y-8 py-4">
                                            <div className="relative inline-flex">
                                                <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
                                                    <CheckCircle className="w-10 h-10 text-primary" strokeWidth={1} />
                                                </div>
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute -top-1 -right-1 bg-white p-1.5 rounded-full">
                                                    <Sparkles className="w-3 h-3 text-black" />
                                                </motion.div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Success Encountered</p>
                                                <p className="text-sm font-bold text-white/60 leading-relaxed">Your credentials have been re-encrypted. <br /> Terminal access is now available.</p>
                                            </div>
                                            <Link to="/login" className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 flex items-center justify-center gap-3">
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
