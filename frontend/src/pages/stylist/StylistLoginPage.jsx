import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, getRedirectPath } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import PasswordField from '../../components/common/PasswordField';
import WapixoNavbar from '../../components/landing/wapixo/WapixoNavbar';

export default function StylistLoginPage() {
    const navigate = useNavigate();
    const { login, logout } = useAuth();

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
            
            <WapixoNavbar />

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
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#B4912B]/5 rounded-full blur-[140px]" />
            </div>

            <main className="relative z-10 flex items-center justify-center p-4 pt-28 pb-12 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ background: 'var(--wapixo-bg-alt)', borderColor: 'var(--wapixo-border)' }}
                    className="w-full max-w-md border shadow-2xl rounded-[2.5rem] p-8 md:p-12 relative flex flex-col justify-center -mt-28 md:-mt-36"
                >
                    <div className="w-full max-w-xs mx-auto space-y-8">
                        {/* Heading */}
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#B4912B]/10 border border-[#B4912B]/20 flex items-center justify-center mx-auto">
                                <Scissors className="w-6 h-6 text-[#B4912B]" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B4912B]">Artist Workspace</span>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic" style={{ color: 'var(--wapixo-text)' }}>
                                    Stylist <span className="text-[#B4912B]">Login.</span>
                                </h2>
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="group space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--wapixo-text-muted)' }}>Email Address</label>
                                    <div className="relative border-b-2 transition-all duration-300" style={{ borderColor: 'var(--wapixo-border)' }}>
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
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
                                        containerClassName="border-b-2 transition-all duration-300"
                                        style={{ borderColor: 'var(--wapixo-border)' }}
                                        inputClassName="w-full pl-8 py-3 bg-transparent text-sm focus:outline-none font-medium"
                                        buttonClassName="hover:text-[#B4912B]"
                                        inputStyle={{ color: 'var(--wapixo-text)', border: 'none' }}
                                    >
                                        <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wapixo-text-muted)', opacity: 0.4 }} />
                                    </PasswordField>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full h-14 bg-[#B4912B] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:brightness-110 transition-all duration-500 shadow-xl shadow-[#B4912B]/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
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
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
