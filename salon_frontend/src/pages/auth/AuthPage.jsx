import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Sparkles, AlertCircle, Store, User, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // States
    const [view, setView] = useState(location.pathname === '/register' ? 'signup' : 'signin');
    const [mode, setMode] = useState('staff'); // 'staff' | 'customer' (for signin)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [signinForm, setSigninForm] = useState({ email: '', password: '' });
    const [signupForm, setSignupForm] = useState({
        salonName: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [customerPhone, setCustomerPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Sync view with URL and handle auto-fill role from Launchpad
    useEffect(() => {
        const currentView = location.pathname === '/register' ? 'signup' : 'signin';
        if (currentView !== view) {
            setView(currentView);
            setError('');
        }

        // Auto-fill mock credentials based on role from Launchpad
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        if (roleParam && view === 'signin') {
            const MOCK_CREDENTIALS = {
                admin: { e: 'admin@salon.com', p: 'password' },
                manager: { e: 'manager@salon.com', p: 'password' },
                receptionist: { e: 'reception@salon.com', p: 'password' },
                stylist: { e: 'stylist@salon.com', p: 'password' },
                accountant: { e: 'accounts@salon.com', p: 'password' },
                inventory_manager: { e: 'inventory@salon.com', p: 'password' },
                superadmin: { e: 'superadmin@salon.com', p: 'password' },
            };

            const creds = MOCK_CREDENTIALS[roleParam];
            if (creds) {
                setSigninForm({ email: creds.e, password: creds.p });
                setMode('staff');
            }
        }
    }, [location.pathname, location.search, view]);

    const handleSigninChange = (e) => {
        setSigninForm({ ...signinForm, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSignupChange = (e) => {
        setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
        setError('');
    };

    const handleStaffSignin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(signinForm.email, signinForm.password);
            const path = typeof getRedirectPath === 'function' ? getRedirectPath(result?.user) : '/admin';
            navigate(path);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (signupForm.password !== signupForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (signupForm.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await register({
                ...signupForm,
                subscriptionPlan: 'free'
            });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!customerPhone || customerPhone.length < 10) {
            setError('Enter a valid 10-digit number');
            return;
        }
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            setOtpSent(true);
        } catch {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp !== '1234') {
            setError('Invalid OTP (1234)');
            return;
        }
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            const mockCustomer = { _id: `cust-${Date.now()}`, phone: customerPhone, role: 'customer' };
            localStorage.setItem('customer_user', JSON.stringify(mockCustomer));
            localStorage.setItem('customer_token', `token-${挑Date.now()}`);
            navigate('/app');
        } catch {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleView = (v) => {
        if (v === view) return;
        setView(v);
        setError('');
        navigate(v === 'signup' ? '/register' : '/login', { state: { noScroll: true } });
    };

    useEffect(() => {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#050505';
        return () => {
            document.body.style.backgroundColor = originalBg;
        };
    }, []);

    return (
        <div className="min-h-screen new-dark-theme selection:bg-primary/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 pt-20 md:pt-24 min-h-screen">
                <motion.div
                    layout
                    transition={{
                        layout: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.4 }
                    }}
                    className={`w-full max-w-4xl min-h-[550px] flex flex-col ${view === 'signup' ? 'md:flex-row-reverse' : 'md:flex-row'} bg-[#0A0A0A] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2rem] relative`}
                >
                    {/* Visual/CTA Section (No Image) */}
                    <motion.div
                        layout
                        style={{ zIndex: 20 }}
                        className={`md:w-5/12 bg-[#0F0F0F] relative p-8 md:p-12 flex flex-col items-center justify-center text-center overflow-hidden border-white/5 ${view === 'signup' ? 'border-l' : 'border-r'}`}
                    >
                        {/* Decorative Background for Dark Theme */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />

                        <div className="relative z-10 space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Premium Access</span>
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
                                            {view === 'signin' ? "Hello, Friend!" : "Welcome Back!"}
                                        </h1>
                                    </div>

                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 max-w-[220px] mx-auto leading-relaxed">
                                        {view === 'signin'
                                            ? "Establish your digital presence and join our elite network of salon owners."
                                            : "Resume your journey and continue scaling your legacy with precision."}
                                    </p>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => toggleView(view === 'signin' ? 'signup' : 'signin')}
                                            className="px-10 py-3 border-2 border-primary/20 bg-primary/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 active:scale-95 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                        >
                                            {view === 'signin' ? "Create Account" : "Return to Login"}
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Aesthetic Elements */}
                        <div className="absolute top-0 right-0 p-8">
                            <Sparkles className="w-5 h-5 text-primary/20 animate-pulse" />
                        </div>
                        <div className="absolute bottom-[-5%] left-[-5%] w-32 h-32 bg-primary/5 blur-[60px] rounded-full" />
                    </motion.div>

                    {/* Form Section */}
                    <motion.div
                        layout
                        style={{ zIndex: 10 }}
                        className="flex-1 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden bg-[#0A0A0A]"
                    >
                        <div className={`mx-auto w-full transition-all duration-500 ${view === 'signup' ? 'max-w-xl' : 'max-w-xs'}`}>
                            <AnimatePresence mode="wait">
                                {view === 'signin' ? (
                                    <motion.div
                                        key="signin"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-8"
                                    >
                                        <div className="text-center md:text-left space-y-2">
                                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
                                                Sign <span className="text-primary">In.</span>
                                            </h2>

                                            {/* Role Switcher */}
                                            <div className="flex justify-center md:justify-start gap-2 pt-2">
                                                {['staff', 'customer'].map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setMode(m)}
                                                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${mode === m ? 'bg-white text-black border-white shadow-lg' : 'border-white/10 text-white/40 hover:text-white'}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        {mode === 'staff' ? (
                                            <form onSubmit={handleStaffSignin} className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="group space-y-1">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Email Protocol</label>
                                                        <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                            <input
                                                                type="email" name="email" value={signinForm.email} onChange={handleSigninChange} required
                                                                className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                                placeholder="name@nexus.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="group space-y-1">
                                                        <div className="flex justify-between items-center ml-1">
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Access Key</label>
                                                            <Link to="/forgot-password" size="sm" className="text-[9px] font-black text-primary/80 uppercase tracking-widest hover:text-primary transition-colors">Recover</Link>
                                                        </div>
                                                        <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                            <input
                                                                type={showPassword ? 'text' : 'password'} name="password" value={signinForm.password} onChange={handleSigninChange} required
                                                                className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                                placeholder="••••••••"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-white hover:text-black transition-all duration-500 shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50">
                                                    {loading ? 'Authenticating...' : 'Initialize Session'}
                                                </button>

                                                {/* Expanded Quick Access Box - Filtered by role from Launchpad */}
                                                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 italic">Verified Identity</span>
                                                        </div>
                                                        <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">Secure Access</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {[
                                                            { r: 'admin', e: 'admin@salon.com' },
                                                            { r: 'manager', e: 'manager@salon.com' },
                                                            { r: 'receptionists', e: 'reception@salon.com' },
                                                            { r: 'stylist', e: 'stylist@salon.com' },
                                                            { r: 'accountant', e: 'accounts@salon.com' },
                                                            { r: 'inventory_manager', e: 'inventory@salon.com' },
                                                            { r: 'superadmin', e: 'superadmin@salon.com' },
                                                            { r: 'pos', e: 'admin@salon.com' },
                                                        ]
                                                            .filter(item => {
                                                                const params = new URLSearchParams(location.search);
                                                                const roleParam = params.get('role');
                                                                if (!roleParam) return true; // Show all if no role in URL
                                                                // Match the role parameter (handling special cases like pos)
                                                                if (roleParam === 'pos') return item.r === 'admin';
                                                                if (roleParam === 'receptionist') return item.r === 'receptionists';
                                                                return item.r === roleParam;
                                                            })
                                                            .map((item) => (
                                                                <button
                                                                    key={item.e + item.r} type="button"
                                                                    onClick={() => setSigninForm({ email: item.e, password: 'password' })}
                                                                    className="flex flex-col items-start p-3 bg-black/40 border border-white/5 hover:border-primary/50 transition-all rounded-2xl group text-left"
                                                                >
                                                                    <span className="text-[8px] font-black uppercase text-white/40 group-hover:text-primary/80 transition-colors uppercase">{item.r.replace('_', ' ')} Portal</span>
                                                                    <span className="text-[10px] font-bold text-white/60 truncate w-full group-hover:text-white transition-colors">{item.e}</span>
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-8">
                                                <div className="space-y-6">
                                                    {!otpSent ? (
                                                        <div className="group space-y-1">
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1 text-center block">Secure Comms</label>
                                                            <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                                <div className="flex items-center justify-center">
                                                                    <span className="text-xl font-black text-white/20 mr-2">+91</span>
                                                                    <input
                                                                        type="tel" value={customerPhone}
                                                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                                        className="w-full py-4 bg-transparent text-3xl font-black focus:outline-none placeholder:text-white/5 tracking-[0.2em] text-center"
                                                                        placeholder="0000000000"
                                                                        maxLength={10}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="group space-y-6 text-center">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Token sent to</p>
                                                                <p className="text-xl font-black text-white tracking-widest">+91 {customerPhone}</p>
                                                            </div>
                                                            <div className="relative border-b-2 border-white/10 focus-within:border-primary transition-all duration-300">
                                                                <input
                                                                    type="text" value={otp} autoFocus
                                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                                    className="w-full py-4 bg-transparent text-4xl font-black focus:outline-none placeholder:text-white/5 tracking-[0.5em] text-center"
                                                                    placeholder="••••"
                                                                    maxLength={4}
                                                                />
                                                            </div>
                                                            <button type="button" onClick={() => setOtpSent(false)} className="text-[9px] font-black text-primary/80 uppercase tracking-widest hover:text-primary transition-colors underline decoration-primary/20">Change Link</button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-white hover:text-black transition-all duration-500 shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50">
                                                    {loading ? 'Validating...' : otpSent ? 'Authorize Access' : 'Request Token'}
                                                </button>
                                            </form>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.5 }}
                                        className="space-y-8"
                                    >
                                        <div className="text-center md:text-left space-y-2">
                                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
                                                Register <span className="text-primary">Admin.</span>
                                            </h2>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Deploy your workspace infrastructure</p>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleSignup} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Brand Name</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="text" name="salonName" value={signupForm.salonName} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Nexus Salon" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Admin Identity</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="text" name="fullName" value={signupForm.fullName} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="John Wick" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Work Comms</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="email" name="email" value={signupForm.email} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="admin@nexus.com" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Direct Line</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="tel" name="phone" value={signupForm.phone} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="+91 00000" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Master Key</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="password" name="password" value={signupForm.password} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Create Key" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Re-verify Key</label>
                                                    <div className="relative border-b-2 border-white/10 group-focus-within:border-primary transition-all duration-300">
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                                        <input type="password" name="confirmPassword" value={signupForm.confirmPassword} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Confirm Key" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-6">
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-white hover:text-black transition-all duration-500 shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50">
                                                    {loading ? 'Initializing Workspace...' : 'Deploy Workspace'}
                                                </button>
                                                <p className="text-[8px] text-white/20 text-center uppercase tracking-widest font-black leading-relaxed">
                                                    By deploying this environment, you accept our <br />
                                                    <span className="text-white/40 hover:text-primary transition-colors cursor-pointer decoration-white/10 underline">Operational Protocols</span> & <span className="text-white/40 hover:text-primary transition-colors cursor-pointer decoration-white/10 underline">Privacy Sandbox</span>.
                                                </p>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
