import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Integrations', href: '#' },
            { label: 'Changelog', href: '#' },
        ],
        Company: [
            { label: 'About', href: '#about' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#contact' },
        ],
        Support: [
            { label: 'Help Center', href: '#' },
            { label: 'Documentation', href: '#' },
            { label: 'Status Page', href: '#' },
            { label: 'API Reference', href: '#' },
        ],
        Legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'GDPR', href: '#' },
        ],
    };

    return (
        <footer className="bg-text text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                Salon<span className="text-primary-light">CRM</span>
                            </span>
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
                                        <a
                                            href={link.href}
                                            className="text-sm text-gray-400 hover:text-primary-light transition-colors"
                                        >
                                            {link.label}
                                        </a>
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
                        <a href="#" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Privacy
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Terms
                        </a>
                        <a href="#" className="text-sm text-gray-500 hover:text-primary-light transition-colors">
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
