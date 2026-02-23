import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/landing/Navbar';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
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
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
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
                            <div className="flex-1 bg-transparent border border-white/80 text-white font-black py-3 rounded-xl text-xs tracking-[0.2em] text-center uppercase transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                LOGIN
                            </div>
                            <Link to="/register" className="flex-1 text-white/50 hover:text-white border border-transparent hover:border-white/30 font-black py-3 rounded-xl text-xs tracking-[0.2em] text-center uppercase transition-all duration-300">
                                SIGN IN
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="flex-1 flex flex-col bg-white p-12 relative">
                        {/* Header Logo */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-4 border-4 border-primary/10 ring-2 ring-primary/5 p-3">
                                <img src="/2-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-black text-primary tracking-[0.2em] uppercase">Login</h2>
                        </div>


                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            {/* Email */}
                            <div className="space-y-4">
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                        placeholder="Email Address"
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative border-b-2 border-primary/10 transition-all focus-within:border-primary">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-6 py-2 bg-transparent text-text text-sm placeholder:text-text-muted/40 focus:outline-none"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            {/* Row: Forgot & Submit */}
                            <div className="flex items-center justify-between pt-4">
                                <a href="#" className="text-[10px] font-bold text-primary/40 hover:text-primary transition-colors tracking-widest uppercase">
                                    Forgot?
                                </a>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary text-white px-10 py-3 rounded-full font-bold text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? '...' : 'LOGIN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
