import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SuperAdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
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
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.4]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            <div className="w-full max-w-md relative z-10">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-2xl shadow-primary/25 mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-text tracking-tight">
                        Salon<span className="text-primary">CRM</span>
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Super Admin Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-border rounded-2xl p-8 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-text">Sign in to your account</h2>
                        <p className="text-sm text-text-secondary mt-1">Platform administration access only</p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="superadmin@saloncrm.com"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white border border-border text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-border text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-dark to-primary text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-text-muted mt-6">
                    Salon admin? <a href="/admin/login" className="text-primary hover:text-primary-dark transition-colors font-medium">Login here</a>
                </p>
            </div>
        </div>
    );
}
