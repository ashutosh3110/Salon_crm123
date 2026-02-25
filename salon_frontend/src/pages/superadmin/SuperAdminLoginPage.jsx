import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';

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
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <WapixoNavbar />

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-6 pt-32 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-5xl flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2rem]"
                >
                    {/* Visual Section */}
                    <div className="md:w-5/12 bg-[#0F0F0F] relative p-12 flex flex-col items-center justify-between border-r border-white/5">
                        <div className="w-full relative z-10 text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2 block tracking-widest">Master Terminal</span>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-6">
                                Platform <br /> <span className="text-white/40">Control.</span>
                            </h1>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-[220px] mx-auto md:mx-0">
                                High-privileged access node for platform administration and oversight.
                            </p>

                            <div className="hidden md:block relative aspect-[3/4] w-full max-w-[240px] mt-12 overflow-hidden rounded-[2.5rem] border border-white/10 group">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                                    alt="Admin Terminal"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                            </div>
                        </div>

                        {/* Portal Switcher */}
                        <div className="w-full grid grid-cols-2 gap-2 bg-black/50 p-2 border border-white/5 rounded-2xl relative z-10">
                            <div className="bg-primary/20 border border-primary/30 text-primary py-2.5 rounded-xl text-[9px] font-black tracking-[0.2em] text-center uppercase">
                                SUPER ADMIN
                            </div>
                            <Link to="/login" className="text-white/30 hover:text-white py-2.5 rounded-xl text-[9px] font-black tracking-[0.2em] text-center uppercase transition-all whitespace-nowrap overflow-hidden text-ellipsis px-1">
                                PORTAL LOGIN
                            </Link>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative">
                        <div className="max-w-md mx-auto w-full space-y-10">
                            {/* Form Header */}
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">
                                        Super <span className="text-primary italic">Secure.</span>
                                    </h2>
                                </div>
                                <div className="h-1 w-12 bg-primary/20 rounded-full mx-auto md:mx-0" />
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    {/* Email */}
                                    <div className="group space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Admin sequence</label>
                                        <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                type="email" name="email" value={form.email} onChange={handleChange} required autoFocus
                                                className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                placeholder="master@platform.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="group space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Authentication key</label>
                                        <div className="relative border-b-2 border-white/5 group-focus-within:border-primary transition-all duration-300">
                                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                            <input
                                                type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                                                className="w-full pl-7 py-3 bg-transparent text-sm focus:outline-none placeholder:text-white/10 font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? 'Decrypting Access...' : <><span>Initialize Access</span><ArrowRight className="w-4 h-4" /></>}
                                    </button>

                                    {/* Demo Credentials */}
                                    <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 italic">Master Credentials</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ email: 'superadmin@salon.com', password: 'password' })}
                                            className="w-full flex flex-col items-start p-4 bg-black/40 border border-white/5 hover:border-primary/30 transition-all rounded-2xl group"
                                        >
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-primary/60 block mb-1">Click to Inject</span>
                                            <span className="text-[11px] font-black text-white/60 group-hover:text-white tracking-widest uppercase">superadmin@salon.com</span>
                                        </button>
                                    </div>

                                    <p className="text-[10px] font-black text-center text-white/10 uppercase tracking-[0.3em] italic">
                                        Restricted Level Access Only
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
