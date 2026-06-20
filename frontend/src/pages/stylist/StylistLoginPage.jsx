import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import PasswordField from '../../components/common/PasswordField';

export default function StylistLoginPage() {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated, user, loading: authLoading } = useAuth();

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            const isStylist = (user.role || '').toLowerCase() === 'stylish' || 
                             (user.role || '').toLowerCase().includes('stylist') || 
                             (user.roleType || '').toLowerCase() === 'stylist';
            if (isStylist) {
                const path = typeof getRedirectPath === 'function' ? getRedirectPath(user) : '/stylist';
                navigate(path);
            }
        }
    }, [isAuthenticated, user, authLoading, navigate]);

    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            const userRole = (result?.user?.role || '').toLowerCase();
            const userRoleType = (result?.user?.roleType || '').toLowerCase();

            // Check if user is a stylist
            const isStylist = userRole === 'stylish' || userRole.includes('stylist') || userRoleType === 'stylist';

            if (!isStylist) {
                setError('Restricted: This portal is for Stylists & Artists only.');
                logout();
                setLoading(false);
                return;
            }

            const path = typeof getRedirectPath === 'function' ? getRedirectPath(result?.user) : '/stylist';
            navigate(path);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen new-theme selection:bg-[#B4912B]/30" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--wapixo-bg)', color: 'var(--wapixo-text)' }}>
            <Helmet>
                <title>Stylist Login — Wapixo</title>
                <meta name="description" content="Log in to your stylist workspace." />
            </Helmet>
            
            {/* Overriding autofill styles inside styled tag */}
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px var(--wapixo-bg-alt) inset !important;
                    -webkit-text-fill-color: var(--wapixo-text) !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            {/* Background elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#B4912B]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-52 h-52 bg-[#B4912B]/5 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 flex items-center justify-center px-4 pt-14 pb-8 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(180,145,43,.15)",
                        backdropFilter: "blur(30px)"
                    }}
                    className="w-full max-w-md relative overflow-hidden rounded-[2rem] border px-6 py-8 sm:px-10 sm:py-10 shadow-[0_10px_50px_rgba(0,0,0,0.3)] bg-opacity-95"
                >
                    <div className="w-full space-y-7">
                        {/* Heading */}
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 rounded-3xl bg-[#B4912B]/10 border border-[#B4912B]/20 flex items-center justify-center mx-auto">
                                <Scissors className="w-8 h-8 text-[#B4912B]" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B4912B]">Artist Workspace</span>
                                <h2 className="text-3xl font-black italic tracking-tight text-center" style={{ color: 'var(--wapixo-text)' }}>
                                    Stylist <span className="text-[#B4912B]">Login</span>
                                </h2>
                                <p className="text-sm mt-2 font-medium" style={{ color: "var(--wapixo-text-muted)" }}>
                                    Welcome back to your workspace
                                </p>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-5">
                                <div className="group space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Email Address</label>
                                    <div
                                        className="relative rounded-2xl px-4"
                                        style={{
                                            background: "rgba(255,255,255,.03)",
                                            border: "1px solid rgba(255,255,255,.06)"
                                        }}
                                    >
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-8 py-4 text-[15px] bg-transparent outline-none"
                                            style={{ color: 'var(--wapixo-text)' }}
                                            placeholder="stylist@salon.com"
                                        />
                                    </div>
                                </div>
                                <div className="group space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Password</label>
                                    <PasswordField
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        containerClassName="relative rounded-2xl px-4"
                                        style={{
                                            background: "rgba(255,255,255,.03)",
                                            border: "1px solid rgba(255,255,255,.06)"
                                        }}
                                        inputClassName="w-full pl-8 py-4 text-[15px] bg-transparent outline-none"
                                        buttonClassName="hover:text-[#B4912B] right-4"
                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                    >
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                    </PasswordField>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-[#B4912B] text-white font-bold text-sm tracking-[0.25em] shadow-[0_10px_30px_rgba(180,145,43,.3)] active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Entering Workspace...</span>
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-2">
                            <p
                                className="text-xs font-semibold"
                                style={{ color: 'var(--wapixo-text-muted)' }}
                            >
                                Professional Stylist Workspace
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
