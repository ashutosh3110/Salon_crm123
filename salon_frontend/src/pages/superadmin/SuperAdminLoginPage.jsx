import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';

export default function SuperAdminLoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(form.email, form.password);
            if (data.user.role !== 'superadmin') {
                setError('Access denied. Superadmin credentials required.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setLoading(false);
                return;
            }
            navigate('/superadmin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#6B2A3B] flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 pt-24">
                {/* Main Center Container */}
                <div className="w-full max-w-[1000px] min-h-[500px] md:h-[640px] bg-white rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative mx-auto my-8 border border-white/10">

                    {/* Left Side: Premium Arched Image & Branding */}
                    <div className="hidden md:flex w-[42%] bg-[#4A1D28] relative overflow-hidden flex-col items-center justify-between text-white p-12">
                        {/* Background Effects */}
                        <div className="absolute inset-0 z-0 opacity-40">
                            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[120px]" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center">
                            {/* Arched Image Container */}
                            <div className="relative w-[85%] aspect-[4/5] rounded-t-full rounded-b-[40px] overflow-hidden border-4 border-white/10 shadow-2xl mb-8 group">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                                    alt="Admin Portal"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28]/80 via-transparent to-transparent" />
                            </div>

                            {/* Branding Text */}
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black tracking-tight leading-none uppercase">Platform <span className="text-primary italic">Control.</span></h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Super Admin Command Center</p>
                            </div>
                        </div>

                        {/* Portal Switcher (Subtle) */}
                        <div className="relative z-10 w-full bg-white/5 backdrop-blur-sm border border-white/10 p-1.5 rounded-2xl flex items-center gap-2 mb-4">
                            <div className="flex-1 bg-transparent border border-white/80 text-white font-black py-2.5 rounded-xl text-[10px] tracking-[0.2em] text-center uppercase transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                SUPER ADMIN
                            </div>
                            <Link to="/login" className="flex-1 text-white/50 hover:text-white border border-transparent hover:border-white/30 font-black py-2.5 rounded-xl text-[10px] tracking-[0.2em] text-center uppercase transition-all duration-300">
                                ADMIN LOGIN
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="flex-1 flex flex-col bg-white p-8 md:p-12 relative justify-center">
                        {/* Header Logo */}
                        <div className="flex flex-col items-center mb-6 md:mb-10">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-3 md:mb-4 border-4 border-primary/10 ring-2 ring-primary/5 p-2 md:p-3">
                                <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-primary tracking-[0.2em] uppercase">Super Login</h2>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                            {/* Email & Password Group */}
                            <div className="space-y-6">
                                {/* Email */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                        placeholder="Super Admin Email"
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex flex-col items-center pt-8">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-full font-bold text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Authenticating...
                                        </span>
                                    ) : (
                                        'Secure Login'
                                    )}
                                </button>

                                {/* Demo Creds Hint */}
                                <div className="mt-8 text-center bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                        <Shield className="w-3 h-3" /> Demo Credentials
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ email: 'superadmin@salon.com', password: 'password' })}
                                        className="text-[11px] font-bold text-primary hover:underline"
                                    >
                                        superadmin@salon.com
                                    </button>
                                    <p className="mt-2 text-[9px] text-primary/40 font-bold italic">
                                        * Use any password. Click to auto-fill.
                                    </p>
                                </div>

                                <p className="mt-8 text-[10px] font-bold text-text-muted/40 uppercase tracking-[0.2em]">
                                    Platform Administration Access Only
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
