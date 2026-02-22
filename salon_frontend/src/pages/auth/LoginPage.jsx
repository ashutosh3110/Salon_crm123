import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(form.email, form.password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary-dark/30 blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-light/30 blur-3xl" />
                    <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full border border-white/10" />
                </div>

                <div className="relative z-10 text-white max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Scissors className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">SalonCRM</span>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight mb-4">
                        Welcome back to your salon command center
                    </h1>
                    <p className="text-white/70 leading-relaxed">
                        Manage appointments, track revenue, engage clients, and grow your
                        business — all from one powerful platform.
                    </p>

                    {/* Testimonial Card */}
                    <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                        <p className="text-sm text-white/80 italic leading-relaxed">
                            "SalonCRM transformed how we manage our 3 outlets. Booking
                            efficiency is up 40% and our clients love the loyalty program."
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                RS
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Riya Shah</div>
                                <div className="text-xs text-white/50">Owner, Glamour Studio</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                            <Scissors className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-text">
                            Salon<span className="text-primary">CRM</span>
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-text">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Start free trial
                        </Link>
                    </p>

                    {error && (
                        <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20 text-error animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Demo Credentials Box */}
                    <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2 relative overflow-hidden group hover:border-primary/30 transition-all">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Lock className="w-12 h-12 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Demo Access</span>
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary font-medium">Email:</span>
                                <span className="font-bold text-text select-all cursor-pointer hover:text-primary transition-colors">admin@test.com</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-secondary font-medium">Password:</span>
                                <span className="font-bold text-text select-all cursor-pointer hover:text-primary transition-colors">admin123</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-text-muted font-medium mt-1 uppercase tracking-tighter">* Backend disconnected. Any credentials will work.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="you@yoursalon.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-medium text-text-secondary">Password</label>
                                <a href="#" className="text-xs text-primary font-medium hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
