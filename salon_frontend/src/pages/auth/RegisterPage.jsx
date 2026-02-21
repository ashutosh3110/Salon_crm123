import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, User, Mail, Lock, Phone, Store, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [form, setForm] = useState({
        salonName: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        // TODO: integrate with backend register API
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-dark/30 blur-3xl" />
                    <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full border border-white/10" />
                </div>

                <div className="relative z-10 text-white max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Scissors className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">SalonCRM</span>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight mb-4">
                        Start your free trial today
                    </h1>
                    <p className="text-white/70 leading-relaxed mb-8">
                        Get your salon up and running in minutes. No credit card required.
                        Full access to all features for 14 days.
                    </p>

                    {/* Benefits List */}
                    <ul className="space-y-4">
                        {[
                            'Complete salon management suite',
                            'Unlimited bookings on all plans',
                            'Built-in POS and billing',
                            'Loyalty program out of the box',
                            'Multi-outlet support',
                        ].map((benefit) => (
                            <li key={benefit} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                    <span className="text-xs">✓</span>
                                </div>
                                <span className="text-sm text-white/80">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right — Register Form */}
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

                    <h2 className="text-2xl font-bold text-text">Create your account</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>

                    {error && (
                        <div className="mt-4 bg-error/10 border border-error/20 text-error text-sm px-4 py-2.5 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {/* Salon Name */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Salon Name
                            </label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    name="salonName"
                                    value={form.salonName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="Your Salon Name"
                                />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Your Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Email
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
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Phone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="Min 8 characters"
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
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                        placeholder="Confirm password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-text-muted">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                        </p>

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
                                    Create Account
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
