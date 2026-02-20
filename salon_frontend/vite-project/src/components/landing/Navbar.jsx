import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import Button from '../ui/Button';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-black/90 backdrop-blur-xl py-5 border-b border-white/10 shadow-2xl'
                : 'bg-transparent py-8'
                }`}
        >
            <div className="container-custom flex items-center justify-between">
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img src="/logo1.png" alt="Wapixo" className="h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-primary transition-all duration-300 relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-10">
                    <Link to="/login" className="text-sm font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link to="/register">
                        <Button
                            className="bg-transparent border-2 border-primary/50 text-white hover:bg-primary hover:border-primary px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-primary/10"
                        >
                            Get Started
                        </Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden text-white p-3 bg-white/5 rounded-2xl border border-white/10"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <HiMenu className="w-7 h-7" />
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] bg-black flex flex-col p-8"
                    >
                        <div className="flex items-center justify-between mb-12">
                            <img src="/logo1.png" alt="Wapixo" className="h-10 w-auto" />
                            <button onClick={() => setMobileMenuOpen(false)} className="text-white p-2">
                                <HiX className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl font-bold text-white hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                        </div>

                        <div className="mt-auto flex flex-col gap-4">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="secondary" fullWidth size="lg" className="rounded-xl border-white/20 text-white">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <Button fullWidth size="lg" className="rounded-xl bg-primary hover:bg-primary-dark border-none">
                                    Start Free Trial
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
