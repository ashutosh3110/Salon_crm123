import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { label: 'Features', href: '/#features' },
            { label: 'Pricing', href: '/#pricing' },
        ],
        Company: [
            { label: 'About', href: '/#about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Contact', href: '/contact' },
        ],
        Legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
        ],
    };

    return (
        <footer className="bg-text text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/1-removebg-preview.png"
                                alt="SalonCRM Logo"
                                className="h-28 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                            The all-in-one cloud platform for modern salons.
                            Manage, grow, and scale your beauty business effortlessly.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                                {title}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm text-gray-400 hover:text-primary-light transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} SalonCRM. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Terms
                        </Link>
                        <Link to="/cookies" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
