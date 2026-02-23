import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Phone, Store } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';

export default function RegisterPage() {
    const [form, setForm] = useState({
        salonName: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        const queryParams = new URLSearchParams(window.location.search);
        const plan = queryParams.get('plan') || 'free';

        setLoading(true);
        try {
            await register({
                salonName: form.salonName,
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                password: form.password,
                confirmPassword: form.confirmPassword,
                subscriptionPlan: plan
            });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
                                    src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1000"
                                    alt="Salon Experience"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28]/80 via-transparent to-transparent" />
                            </div>

                            {/* Branding Text */}
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Join the <span className="text-primary italic">Masters.</span></h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Start your 14-day free journey</p>
                            </div>
                        </div>

                        {/* Modern Tab Switcher */}
                        <div className="relative z-10 w-full bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 rounded-2xl flex items-center gap-2 mt-8">
                            <Link to="/login" className="flex-1 text-white/50 hover:text-white border border-transparent hover:border-white/30 font-black py-3 rounded-xl text-xs tracking-[0.2em] text-center uppercase transition-all duration-300">
                                LOGIN
                            </Link>
                            <div className="flex-1 bg-transparent border border-white/80 text-white font-black py-3 rounded-xl text-xs tracking-[0.2em] text-center uppercase transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                SIGN IN
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Register Form */}
                    <div className="flex-1 flex flex-col bg-white p-10 md:p-12 relative overflow-y-auto max-h-[90vh]">
                        {/* Header Logo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-3 border-4 border-primary/10 ring-2 ring-primary/5 p-2">
                                <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl font-black text-primary tracking-[0.2em] uppercase">Registration</h2>
                        </div>

                        {error && (
                            <div className="mb-6 bg-error/10 border border-error/20 text-error text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 px-4 md:px-12">
                            {/* 2-Column Inputs Grid */}
                            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
                                {/* Salon Name */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Store className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="text" name="salonName" value={form.salonName} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Salon Name" />
                                </div>

                                {/* Full Name */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Owner Name" />
                                </div>

                                {/* Email */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Email" />
                                </div>

                                {/* Phone */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Phone" />
                                </div>

                                {/* Password */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Password" />
                                </div>

                                {/* Confirm Password */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none" placeholder="Confirm" />
                                </div>
                            </div>

                            {/* Terms and Submit */}
                            <div className="flex flex-col items-center pt-4">
                                <p className="text-[10px] text-text-muted/60 mb-6 text-center">
                                    By signing up, you agree to our <span className="text-primary font-bold cursor-pointer underline decoration-primary/20">Terms</span> and <span className="text-primary font-bold cursor-pointer underline decoration-primary/20">Privacy</span>.
                                </p>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white px-12 py-3 rounded-full font-bold text-sm tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? '...' : 'CREATE ACCOUNT'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
