import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary-dark/20 rounded-full blur-2xl animate-pulse delay-500" />
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-primary/30">
                            <span className="text-white text-3xl font-bold">S</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">SalonCRM</h1>
                        <p className="text-lg text-gray-400 max-w-md">
                            The most powerful cloud-based salon management platform. Manage appointments, billing, inventory, and grow your business.
                        </p>

                        {/* Feature highlights */}
                        <div className="mt-12 grid grid-cols-2 gap-4 text-left max-w-md">
                            {[
                                { icon: '📅', label: 'Smart Scheduling' },
                                { icon: '💳', label: 'POS & Billing' },
                                { icon: '📊', label: 'Real-time Analytics' },
                                { icon: '👥', label: 'Team Management' },
                            ].map((f, i) => (
                                <motion.div
                                    key={f.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                                >
                                    <span className="text-xl">{f.icon}</span>
                                    <span className="text-sm text-gray-300 font-medium">{f.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-dark-bg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-xl font-bold">S</span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary dark:text-white">SalonCRM</h1>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Welcome back</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-1">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email Address"
                            type="email"
                            icon={HiOutlineMail}
                            placeholder="you@salon.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                icon={HiOutlineLockClosed}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer" />
                                <span className="text-sm text-text-secondary dark:text-gray-400">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" fullWidth size="lg" loading={loading}>
                            Sign In
                        </Button>
                    </form>

                    <p className="text-center text-sm text-text-secondary dark:text-gray-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
