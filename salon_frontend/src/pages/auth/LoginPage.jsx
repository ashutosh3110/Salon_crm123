import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Sparkles, Users, Smartphone } from 'lucide-react';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import Navbar from '../../components/landing/Navbar';

export default function LoginPage() {
    const [mode, setMode] = useState('staff'); // 'staff' | 'customer'
    const [form, setForm] = useState({ email: '', password: '' });
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    // ── Staff Login ────────────────────────────────────────────────────
    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            const path = getRedirectPath(result.user);
            navigate(path);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // ── Customer Login (Phone + OTP) ───────────────────────────────────
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            setError('Enter a valid 10-digit phone number');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // TODO: Replace with api.post('/auth/request-otp', { phone })
            await new Promise(r => setTimeout(r, 600));
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
            setError('Invalid OTP. Use 1234 for testing.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            // TODO: Replace with api.post('/auth/login-otp', { phone, otp })
            await new Promise(r => setTimeout(r, 600));
            // Mock customer storage
            const mockCustomer = { _id: `cust-${Date.now()}`, phone, name: '', role: 'customer' };
            localStorage.setItem('customer_user', JSON.stringify(mockCustomer));
            localStorage.setItem('customer_token', `customer-token-${Date.now()}`);
            navigate('/app');
        } catch {
            setError('OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (m) => {
        setMode(m);
        setError('');
        setOtpSent(false);
        setOtp('');
    };

    return (
        <div className="min-h-screen bg-[#6B2A3B] flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 pt-24">
                {/* Main Center Container */}
                <div className="w-full max-w-[1000px] h-[640px] bg-white rounded-[40px] shadow-2xl flex overflow-hidden relative">

                    {/* Left Side: Premium Arched Image & Glass Switcher */}
                    <div className="hidden md:flex w-[42%] bg-[#4A1D28] relative overflow-hidden flex-col items-center justify-between text-white p-12">
                        {/* Background Effects */}
                        <div className="absolute inset-0 z-0 opacity-40">
                            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center">
                            {/* Arched Image Container */}
                            <div className="relative w-full aspect-[4/5] rounded-t-full rounded-b-[40px] overflow-hidden border-4 border-white/10 shadow-2xl mb-8 group">
                                <img
                                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000"
                                    alt="Salon Interior"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28]/80 via-transparent to-transparent" />
                            </div>

                            {/* Branding Text */}
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Manage. Grow. <span className="text-primary italic">Thrive.</span></h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">The ultimate salon ecosystem</p>
                            </div>
                        </div>

                        {/* Modern Tab Switcher */}
                        <div className="relative z-10 w-full bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 rounded-2xl flex items-center gap-2 mt-8">
                            <button
                                onClick={() => switchMode('staff')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs tracking-[0.15em] text-center uppercase transition-all duration-300 font-black ${mode === 'staff'
                                    ? 'bg-transparent border border-white/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                    : 'text-white/50 hover:text-white border border-transparent hover:border-white/30'
                                    }`}
                            >
                                <Users className="w-3.5 h-3.5" /> STAFF
                            </button>
                            <button
                                onClick={() => switchMode('customer')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs tracking-[0.15em] text-center uppercase transition-all duration-300 font-black ${mode === 'customer'
                                    ? 'bg-transparent border border-white/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                    : 'text-white/50 hover:text-white border border-transparent hover:border-white/30'
                                    }`}
                            >
                                <Smartphone className="w-3.5 h-3.5" /> CUSTOMER
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="flex-1 flex flex-col bg-white p-12 relative overflow-y-auto">

                        {/* Mobile-only mode toggle */}
                        <div className="md:hidden flex gap-2 mb-6 bg-surface rounded-2xl p-1.5">
                            <button
                                onClick={() => switchMode('staff')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'staff' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}
                            >
                                <Users className="w-3 h-3" /> Staff
                            </button>
                            <button
                                onClick={() => switchMode('customer')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'customer' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}
                            >
                                <Smartphone className="w-3 h-3" /> Customer
                            </button>
                        </div>

                        {/* Header Logo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-4 border-4 border-primary/10 ring-2 ring-primary/5 p-3">
                                <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-black text-primary tracking-[0.2em] uppercase">
                                {mode === 'staff' ? 'Staff Portal' : 'Customer Login'}
                            </h2>
                            <p className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-widest">
                                {mode === 'staff' ? 'Sign in with your work email' : 'Sign in with your phone number'}
                            </p>
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        {/* ─── STAFF LOGIN FORM ──────────────────────────────────── */}
                        {mode === 'staff' && (
                            <form onSubmit={handleStaffSubmit} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-6 flex-1">
                                    {/* Email */}
                                    <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <input
                                            type="email" name="email"
                                            value={form.email} onChange={handleChange} required
                                            className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                            placeholder="Email Address"
                                        />
                                    </div>
                                    {/* Password */}
                                    <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <input
                                            type="password" name="password"
                                            value={form.password} onChange={handleChange} required
                                            className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                            placeholder="Password"
                                        />
                                    </div>

                                    {/* Test credentials hint */}
                                    <div className="bg-surface/80 rounded-xl p-3 text-[10px] text-text-muted space-y-1">
                                        <p className="font-bold text-text-secondary">🔐 Test Credentials (any password):</p>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                                            <span>admin@salon.com</span><span className="text-primary font-bold">→ Salon Owner</span>
                                            <span>manager@salon.com</span><span className="text-primary font-bold">→ Manager</span>
                                            <span>reception@salon.com</span><span className="text-primary font-bold">→ Receptionist</span>
                                            <span>stylist@salon.com</span><span className="text-primary font-bold">→ Stylist</span>
                                            <span>accounts@salon.com</span><span className="text-primary font-bold">→ Accountant</span>
                                            <span>inventory@salon.com</span><span className="text-primary font-bold">→ Inventory Mgr</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Row: Forgot & Submit */}
                                <div className="flex items-center justify-between pt-4">
                                    <a href="#" className="text-[10px] font-bold text-primary/40 hover:text-primary transition-colors tracking-widest uppercase">
                                        Forgot?
                                    </a>
                                    <button
                                        type="submit" disabled={loading}
                                        className="bg-primary text-white px-10 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? '...' : <><span>LOGIN</span><ArrowRight className="w-3.5 h-3.5" /></>}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ─── CUSTOMER LOGIN FORM ──────────────────────────────── */}
                        {mode === 'customer' && !otpSent && (
                            <form onSubmit={handleRequestOtp} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-6 flex-1">
                                    <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                        <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <div className="flex items-center">
                                            <span className="text-sm text-text-muted font-bold pl-6 pr-1">+91</span>
                                            <input
                                                type="tel" value={phone}
                                                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                                                className="w-full py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                                placeholder="Phone Number"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-surface/80 rounded-xl p-3 text-[10px] text-text-muted">
                                        <p className="font-bold text-text-secondary">📱 Customer Login:</p>
                                        <p className="mt-0.5">Enter any phone number. OTP is <span className="text-primary font-bold">1234</span></p>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit" disabled={loading || phone.length < 10}
                                        className="bg-primary text-white px-10 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? '...' : <><span>SEND OTP</span><ArrowRight className="w-3.5 h-3.5" /></>}
                                    </button>
                                </div>
                            </form>
                        )}

                        {mode === 'customer' && otpSent && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-6 flex-1">
                                    <p className="text-xs text-text-secondary text-center">
                                        OTP sent to <span className="font-bold text-text">+91 {phone}</span>
                                    </p>
                                    <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                        <Sparkles className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                        <input
                                            type="text" value={otp}
                                            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                                            className="w-full pl-6 py-2 bg-transparent text-text text-lg font-bold tracking-[0.5em] text-center placeholder:text-text-muted/40 focus:outline-none"
                                            placeholder="● ● ● ●"
                                            maxLength={4}
                                            autoFocus
                                        />
                                    </div>
                                    <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] text-primary font-bold uppercase tracking-widest text-center w-full">
                                        ← Change Number
                                    </button>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit" disabled={loading || otp.length < 4}
                                        className="bg-primary text-white px-10 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? '...' : <><span>VERIFY</span><ArrowRight className="w-3.5 h-3.5" /></>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
