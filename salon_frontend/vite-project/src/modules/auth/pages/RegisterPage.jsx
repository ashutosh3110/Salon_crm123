import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [form, setForm] = useState({ salonName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.salonName || !form.name || !form.email || !form.password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await register({
                salonName: form.salonName,
                fullName: form.name,
                email: form.email,
                phone: form.phone,
                password: form.password,
                confirmPassword: form.confirmPassword,
            });
            toast.success('Account created successfully!');
            navigate('/onboarding');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-32 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
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
                        <h1 className="text-4xl font-bold text-white mb-4">Join SalonCRM</h1>
                        <p className="text-lg text-gray-400 max-w-md">
                            Start managing your salon like a pro. Set up your account in minutes and unlock powerful tools to grow your business.
                        </p>

                        <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
                            {[
                                '✨ Free plan available — no credit card needed',
                                '🚀 Set up in under 5 minutes',
                                '📱 Works on mobile & desktop',
                                '🔒 Enterprise-grade security',
                            ].map((text, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.15 }}
                                    className="text-sm text-gray-300"
                                >
                                    {text}
                                </motion.p>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-dark-bg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-xl font-bold">S</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Create Account</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-1">Register your salon to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Salon Name"
                            name="salonName"
                            icon={HiOutlineUser} // Using generic icon for now
                            placeholder="My Awesome Salon"
                            value={form.salonName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Full Name"
                            name="name"
                            icon={HiOutlineUser}
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            icon={HiOutlineMail}
                            placeholder="you@salon.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            type="tel"
                            icon={HiOutlinePhone}
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={handleChange}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                icon={HiOutlineLockClosed}
                                placeholder="Min 8 characters"
                                value={form.password}
                                onChange={handleChange}
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

                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            icon={HiOutlineLockClosed}
                            placeholder="Re-enter password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-center text-sm text-text-secondary dark:text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
