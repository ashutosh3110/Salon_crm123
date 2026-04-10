import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Phone, Sparkles, AlertCircle, Store, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';
import api from '../../services/api';
import PasswordField from '../../components/common/PasswordField';
import { useTheme } from '../../contexts/ThemeContext';

export default function AuthPage() {
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // States
    const [view, setView] = useState(location.pathname === '/register' ? 'signup' : 'signin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Sync view with URL and handle auto-fill role from Launchpad
    useEffect(() => {
        const currentView = location.pathname === '/register' ? 'signup' : 'signin';
        if (currentView !== view) {
            setView(currentView);
            setError('');
        }

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
            }
        }


        if (!window.Razorpay && view === 'signup') {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
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
            const params = new URLSearchParams(location.search);
            const planParam = params.get('plan');
            
            let currentPlan = selectedPlan;

            if (currentPlan && currentPlan.monthlyPrice > 0 && Number(currentPlan.trialDays) === 0) {
                const orderRes = await api.post('/billing/razorpay/create-order', {
                    planId: currentPlan._id,
                    billingCycle: 'monthly'
                });

                if (!orderRes.data.success) throw new Error('Failed to create Razorpay order');

                const { orderId, amount, currency, keyId } = orderRes.data.data;

                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: 'Wapixo Salon CMS',
                    description: `Subscription for ${selectedPlan.name} Plan`,
                    order_id: orderId,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post('/billing/razorpay/verify-payment', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            if (verifyRes.data.success) {
                                await register({
                                    ...signupForm,
                                    subscriptionPlan: selectedPlan.name.toLowerCase(),
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id
                                });
                                navigate('/admin');
                            }
                        } catch (err) {
                            setError('Payment verification failed. Please contact support.');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: signupForm.fullName,
                        email: signupForm.email,
                        contact: signupForm.phone
                    },
                    theme: { color: '#B4912B' },
                    modal: { ondismiss: () => setLoading(false) }
                };

                if (!window.Razorpay) throw new Error('Razorpay SDK failed to load.');

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                await register({
                    ...signupForm,
                    subscriptionPlan: currentPlan ? currentPlan.name.toLowerCase() : 'free'
                });
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed.');
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
        document.body.style.backgroundColor = 'var(--wapixo-bg)';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="min-h-screen new-theme selection:bg-[#B85C5C]/30" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)' }}>
            <WapixoNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 pt-24 pb-12 min-h-screen">
                <motion.div
                    layout
                    transition={{
                        layout: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.4 }
                    }}
                    style={{ background: 'var(--wapixo-bg-alt)', borderColor: 'var(--wapixo-border)' }}
                    className={`w-full max-w-4xl min-h-[600px] flex flex-col ${view === 'signup' ? 'md:flex-row-reverse' : 'md:flex-row'} border shadow-2xl overflow-hidden rounded-[2.5rem] relative`}
                >
                    {/* Visual Section */}
                    <motion.div
                        layout
                        className={`md:w-5/12 bg-opacity-50 relative p-8 md:p-12 flex flex-col items-center justify-center text-center overflow-hidden ${view === 'signup' ? 'border-l' : 'border-r'}`}
                        style={{ background: theme === 'dark' ? 'rgba(15,15,15,0.5)' : 'rgba(255,255,255,0.5)', borderColor: 'var(--wapixo-border)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#B4912B]/5 via-transparent to-[#B4912B]/5" />
                        
                        <div className="relative z-10 space-y-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B4912B]">Premium Access</span>
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none" style={{ color: 'var(--wapixo-text)' }}>
                                            {view === 'signin' ? "Welcome!" : "Create Account"}
                                        </h1>
                                    </div>

                                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed" style={{ color: 'var(--wapixo-text-muted)' }}>
                                        {view === 'signin'
                                            ? "Register your salon today and start managing your business effortlessly."
                                            : "Log in to your dashboard to manage bookings, staff, and sales."}
                                    </p>

                                    <div className="pt-6">
                                        <button
                                            onClick={() => toggleView(view === 'signin' ? 'signup' : 'signin')}
                                            className="px-10 py-3 border-2 border-[#B4912B]/20 bg-[#B4912B]/5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-[#B4912B] hover:bg-[#B4912B] hover:text-white hover:border-[#B4912B] transition-all duration-500 active:scale-95 shadow-lg"
                                        >
                                            {view === 'signin' ? "Register Now" : "Back to Login"}
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Sparkles className="w-5 h-5 text-[#B4912B] animate-pulse" />
                        </div>
                    </motion.div>

                    {/* Form Section */}
                    <motion.div
                        layout
                        className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-transparent"
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
                                            <h2 className="text-4xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--wapixo-text)' }}>
                                                Sign <span className="text-[#B4912B]">In.</span>
                                            </h2>
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleStaffSignin} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Email Address</label>
                                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                        <input
                                                            type="email" name="email" value={signinForm.email} onChange={handleSigninChange} required
                                                            className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                            style={{ color: 'var(--wapixo-text)' }}
                                                            placeholder="admin@salon.com"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <div className="flex justify-between items-center ml-1">
                                                        <label className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--wapixo-text-muted)' }}>Password</label>
                                                        <Link to="/forgot-password" size="sm" className="text-[9px] font-black uppercase tracking-widest hover:text-[#B4912B] transition-colors" style={{ color: 'var(--wapixo-text-muted)' }}>Recover</Link>
                                                    </div>
                                                    <PasswordField 
                                                        name="password" 
                                                        value={signinForm.password} 
                                                        onChange={handleSigninChange} 
                                                        required
                                                        placeholder="••••••••"
                                                        containerClassName="border-b-2 transition-all duration-300"
                                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                                        inputClassName="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        buttonClassName="hover:text-[#B85C5C]"
                                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                                    >
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    </PasswordField>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl shadow-[#B4912B]/10 active:scale-95 disabled:opacity-50">
                                                {loading ? 'Authenticating...' : 'Login'}
                                            </button>

                                            {/* Quick Logins Section */}
                                            <div className="pt-6 border-t border-white/5 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-[#B4912B]" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B4912B]">Quick Access</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { label: 'SuperAdmin', e: 'superadmin@salon.com', p: 'superadmin123' },
                                                        { label: 'Admin', e: 'mrmmultani@gmail.com', p: '123456' },
                                                        { label: 'Stylist', e: 'neha@gmail.com', p: '123456' },
                                                        { label: 'Accountant', e: 'prachi@gmail.com', p: '123456' },
                                                        { label: 'Manager', e: 'aditya@gmail.com', p: '123456' },
                                                        { label: 'Receptionist', e: 'aman@gmail.com', p: '123456' },
                                                    ].map(q => (
                                                        <button
                                                            key={q.label}
                                                            type="button"
                                                            onClick={() => setSigninForm({ email: q.e, password: q.p })}
                                                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#B4912B]/30 hover:bg-[#B4912B]/5 transition-all group"
                                                        >
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#B4912B] group-hover:scale-110 transition-transform">{q.label}</span>
                                                            <span className="text-[9px] text-white/20 group-hover:text-white/40 truncate w-full px-1">{q.e.split('@')[0]}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </form>
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
                                            <h2 className="text-4xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--wapixo-text)' }}>
                                                Register <span className="text-[#B4912B]">Now.</span>
                                            </h2>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--wapixo-text-muted)' }}>Setup your salon management panel</p>
                                        </div>

                                        {selectedPlan && (
                                            <div className="p-4 bg-[#B4912B]/5 border border-[#B4912B]/20 rounded-2xl flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase text-[#B4912B] tracking-widest leading-none mb-1">Selected Plan</p>
                                                    <h4 className="text-lg font-black uppercase italic tracking-tight" style={{ color: 'var(--wapixo-text)' }}>{selectedPlan.name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black leading-none" style={{ color: 'var(--wapixo-text)' }}>₹{selectedPlan.monthlyPrice}</p>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--wapixo-text-muted)' }}>/ Month + GST</p>
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                            </motion.div>
                                        )}

                                        <form onSubmit={handleSignup} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Salon Name</label>
                                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                        <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                        <input type="text" name="salonName" value={signupForm.salonName} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium" style={{ color: 'var(--wapixo-text)' }} placeholder="My Premium Salon" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Full Name</label>
                                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                        <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                        <input type="text" name="fullName" value={signupForm.fullName} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium" style={{ color: 'var(--wapixo-text)' }} placeholder="Your Name" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Email Address</label>
                                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                        <input type="email" name="email" value={signupForm.email} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium" style={{ color: 'var(--wapixo-text)' }} placeholder="name@example.com" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Phone Number</label>
                                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                        <input type="tel" name="phone" value={signupForm.phone} onChange={handleSignupChange} required className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium" style={{ color: 'var(--wapixo-text)' }} placeholder="+91 00000" />
                                                    </div>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Password</label>
                                                    <PasswordField 
                                                        name="password" value={signupForm.password} onChange={handleSignupChange} required placeholder="Create Password"
                                                        containerClassName="border-b-2 transition-all duration-300"
                                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                                        inputClassName="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        buttonClassName="hover:text-[#B85C5C]"
                                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                                    >
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    </PasswordField>
                                                </div>
                                                <div className="group space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Confirm Password</label>
                                                    <PasswordField 
                                                        name="confirmPassword" value={signupForm.confirmPassword} onChange={handleSignupChange} required placeholder="Repeat Password"
                                                        containerClassName="border-b-2 transition-all duration-300"
                                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                                        inputClassName="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                                        buttonClassName="hover:text-[#B85C5C]"
                                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                                    >
                                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                                    </PasswordField>
                                                </div>
                                            </div>
                                            <div className="pt-4 space-y-6">
                                                <button type="submit" disabled={loading} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl shadow-[#B4912B]/10 active:scale-95 disabled:opacity-50">
                                                    {loading ? 'Creating Account...' : 'Register Now'}
                                                </button>
                                                <p className="text-[8px] text-center uppercase tracking-widest font-black leading-relaxed" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.5 }}>
                                                    By registering, you accept our <br />
                                                    <span className="hover:text-[#B4912B] transition-colors cursor-pointer underline">Protocols</span> & <span className="hover:text-[#B4912B] transition-colors cursor-pointer underline">Privacy Sandbox</span>.
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
