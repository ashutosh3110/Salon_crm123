import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Sparkles, AlertCircle, Store, User, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import LumiereNavbar from '../../components/landing/lumiere/LumiereNavbar';

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

    // Sync view with URL
    useEffect(() => {
        const currentView = location.pathname === '/register' ? 'signup' : 'signin';
        if (currentView !== view) {
            setView(currentView);
            setError('');
        }
    }, [location.pathname]);

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
            localStorage.setItem('customer_token', `token-${Date.now()}`);
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
        navigate(v === 'signup' ? '/register' : '/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <LumiereNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 md:p-6 pt-24 md:pt-32 min-h-screen">
                <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`w-full ${view === 'signup' ? 'max-w-6xl' : 'max-w-5xl'} flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2rem] relative`}
                >
                    {/* Visual Section */}
                    <motion.div
                        layout
                        className="md:w-5/12 bg-[#0F0F0F] relative p-8 md:p-12 flex flex-col items-center justify-between border-r border-white/5 overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, x: view === 'signin' ? -30 : 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: view === 'signin' ? 30 : -30 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full relative z-10 text-center md:text-left"
                            >
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 block tracking-widest">
                                    {view === 'signin' ? 'Welcome Back' : 'Enterprise Ready'}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">
                                    {view === 'signin' ? (
                                        <>The Art of <br /> <span className="text-white/40">Excellence.</span></>
                                    ) : (
                                        <>Scale Your <br /> <span className="text-white/40">Legacy.</span></>
                                    )}
                                </h1>

                                {view === 'signin' ? (
                                    <div className="relative aspect-[3/4] w-full max-w-[280px] mx-auto overflow-hidden rounded-[2.5rem] border border-white/10 group">
                                        <img
                                            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000"
                                            className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                            alt="Salon"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    </div>
                                ) : (
                                    <div className="space-y-4 mb-8">
                                        {[
                                            'Intelligent Resource Planning',
                                            'Cinematic Customer Experience',
                                            'Automated Loyalty Engines',
                                            'Real-time Performance Analytics'
                                        ].map((feature, i) => (
                                            <motion.div
                                                key={feature}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + (i * 0.1) }}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Login Mode Switcher */}
                        <div className="w-full relative z-10 mt-8">
                            <AnimatePresence mode="wait">
                                {view === 'signin' ? (
                                    <motion.div
                                        key="switcher"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-2 gap-2 bg-black/50 p-1.5 border border-white/5 rounded-2xl"
                                    >
                                        {['staff', 'customer'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="trusted"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center"
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Trusted by 500+ Luxury Brands</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Form Section */}
                    <div className="flex-1 p-6 md:p-16 flex flex-col justify-center relative overflow-hidden bg-black/20">
                        <div className={`mx-auto w-full transition-all duration-500 ${view === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
                            {/* Global Toggle (Login / Signup) */}
                            <div className="flex justify-center mb-10">
                                <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className="absolute bg-white rounded-full inset-y-1"
                                        initial={false}
                                        animate={{
                                            x: view === 'signin' ? 4 : 88,
                                            width: view === 'signin' ? 84 : 96
                                        }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                    />
                                    <button
                                        onClick={() => toggleView('signin')}
                                        className={`relative z-10 px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 ${view === 'signin' ? 'text-black' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => toggleView('signup')}
                                        className={`relative z-10 px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 ${view === 'signup' ? 'text-black' : 'text-white/40 hover:text-white'}`}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {view === 'signin' ? (
                                    <motion.div
                                        key="signin"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="space-y-8"
                                    >
                                        <div className="text-center md:text-left">
                                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                                Welcome <span className="text-primary italic">Back.</span>
                                            </h2>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                                                {mode === 'staff' ? 'Access your workspace' : 'Enter your credentials'}
                                            </p>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        {mode === 'staff' ? (
                                            <form onSubmit={handleStaffSignin} className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="group space-y-2">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Work Email</label>
                                                        <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                            <input
                                                                type="email" name="email" value={signinForm.email} onChange={handleSigninChange} required
                                                                className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                                placeholder="name@company.com"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="group space-y-2">
                                                        <div className="flex justify-between items-center ml-1">
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Password</label>
                                                            <Link to="/forgot-password" size="sm" className="text-[9px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors">Forgot?</Link>
                                                        </div>
                                                        <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                            <input
                                                                type={showPassword ? 'text' : 'password'} name="password" value={signinForm.password} onChange={handleSigninChange} required
                                                                className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                                placeholder="••••••••"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                                    {loading ? 'Authenticating...' : <><span>Enter Portal</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>

                                                {/* Demo Box */}
                                                <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">Demo Access</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {['admin', 'manager', 'stylist', 'reception'].map((role) => (
                                                            <button
                                                                key={role} type="button"
                                                                onClick={() => setSigninForm({ email: `${role}@salon.com`, password: 'password' })}
                                                                className="flex flex-col items-start p-3 bg-black/40 border border-white/5 hover:border-primary/30 transition-all rounded-2xl group"
                                                            >
                                                                <span className="text-[8px] font-black uppercase tracking-tighter text-white/30 group-hover:text-primary/60">{role}</span>
                                                                <span className="text-[10px] font-bold text-white/60 truncate w-full">{role}@salon.com</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-8">
                                                <div className="space-y-6">
                                                    {!otpSent ? (
                                                        <div className="group space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 text-center block">Phone Number</label>
                                                            <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                                <div className="flex items-center">
                                                                    <span className="text-sm font-black text-white/20 pl-4 pr-2 tracking-tighter">+91</span>
                                                                    <input
                                                                        type="tel" value={customerPhone}
                                                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                                        className="w-full py-4 bg-transparent text-xl font-black focus:outline-none placeholder:text-white/5 tracking-widest text-center"
                                                                        placeholder="00000 00000"
                                                                        maxLength={10}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="group space-y-6 text-center">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">Verification code sent to</p>
                                                                <p className="text-sm font-black text-white tracking-widest">+91 {customerPhone}</p>
                                                            </div>
                                                            <div className="relative border-b-2 border-white/5 focus-within:border-primary transition-all duration-300">
                                                                <input
                                                                    type="text" value={otp} autoFocus
                                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                                    className="w-full py-4 bg-transparent text-4xl font-black focus:outline-none placeholder:text-white/5 tracking-[0.5em] text-center"
                                                                    placeholder="••••"
                                                                    maxLength={4}
                                                                />
                                                            </div>
                                                            <button type="button" onClick={() => setOtpSent(false)} className="text-[9px] font-black text-primary/60 uppercase tracking-widest hover:text-primary transition-colors underline decoration-primary/20">Change Number</button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                                    {loading ? 'Processing...' : <><span>{otpSent ? 'Verify & Enter' : 'Get Security Code'}</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>
                                                <p className="text-[10px] font-black text-center text-white/20 uppercase tracking-widest italic">Testing: Enter any number & code 1234</p>
                                            </form>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="space-y-8"
                                    >
                                        <div className="text-center md:text-left">
                                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                                Establish <span className="text-primary italic">Presence.</span>
                                            </h2>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Start your journey to digital dominance</p>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleSignup} className="space-y-8">
                                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                                                {/* Salon Name */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Salon Identity</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="text" name="salonName" value={signupForm.salonName} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="The Grand Barbers" />
                                                    </div>
                                                </div>
                                                {/* Owner Name */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Owner Name</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="text" name="fullName" value={signupForm.fullName} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Alexander Luxe" />
                                                    </div>
                                                </div>
                                                {/* Email */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Business Email</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="email" name="email" value={signupForm.email} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="office@salon.com" />
                                                    </div>
                                                </div>
                                                {/* Phone */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Secure Contact</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="tel" name="phone" value={signupForm.phone} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="+91 00000 00000" />
                                                    </div>
                                                </div>
                                                {/* Password */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Credentials</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="password" name="password" value={signupForm.password} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Create Password" />
                                                    </div>
                                                </div>
                                                {/* Confirm Password */}
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Validate</label>
                                                    <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                        <input type="password" name="confirmPassword" value={signupForm.confirmPassword} onChange={handleSignupChange} required className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium" placeholder="Repeat Credentials" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-6">
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                                    {loading ? 'Initializing...' : <><span>Initialize Workspace</span><ArrowRight className="w-4 h-4" /></>}
                                                </button>
                                                <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-black leading-relaxed">
                                                    By establishing this workspace, you agree to our <br />
                                                    <span className="text-white/40 hover:text-primary transition-colors cursor-pointer decoration-white/10 underline">Privacy Protocols</span> and <span className="text-white/40 hover:text-primary transition-colors cursor-pointer decoration-white/10 underline">Operation Standards</span>.
                                                </p>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
