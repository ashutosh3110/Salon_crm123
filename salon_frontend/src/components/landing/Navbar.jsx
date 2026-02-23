import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'About', href: '/#about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/#contact' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/2-removebg-preview.png"
                            alt="SalonCRM Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href}
                                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors relative group py-2"
                            >
                                {link.label}
                                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors px-4 py-2 relative group"
                        >
                            Sign In
                            <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </Link>
                        <Link to="/register" className="btn-primary">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-border animate-in slide-in-from-top">
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block text-sm font-medium text-text-secondary hover:text-primary transition-colors py-2"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-border space-y-2">
                            <Link
                                to="/admin/login"
                                className="block text-sm font-semibold text-text-secondary hover:text-primary transition-colors py-2"
                            >
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary block text-center">
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
