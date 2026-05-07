import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
};

export default function WapixoFooter() {
    const { theme } = useTheme();
    return (
        <footer id="contact" className="border-t border-[var(--wapixo-border)] py-12 md:py-24 px-6 md:px-16 lg:px-24" style={{ background: 'var(--wapixo-bg)' }}>
            <div className="max-w-6xl mx-auto">
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    {/* Brand */}
                    <div className="max-w-[600px] flex flex-col items-center md:items-start -mt-8 md:-mt-16">
                        <Link to="/" className="flex items-center">
                            <img
                                src={theme === 'dark' ? "/new wapixo logo .png" : "/new black wapixo logo .png"}
                                alt="Wapixo Logo"
                                className="h-44 md:h-80 w-auto"
                            />
                        </Link>
                        <p className="font-['Inter'] font-light text-[0.82rem] text-[var(--wapixo-text-muted)] leading-relaxed mt-4">
                            Powering smart businesses with intelligent salon management.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-10 md:gap-20">
                        {Object.entries(footerLinks).map(([group, items]) => (
                            <div key={group} className="min-w-[100px]">
                                <p className="font-['Inter'] font-black text-[0.75rem] text-[var(--wapixo-text)] tracking-[0.3em] uppercase mb-5 border-b border-[var(--wapixo-border)] pb-2">
                                    {group}
                                </p>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item}>
                                             <Link
                                                to={`/${item.toLowerCase()}`}
                                                className="font-['Inter'] font-normal text-[0.85rem] text-[var(--wapixo-text-muted)] hover:text-[var(--wapixo-text)] transition-colors decoration-none"
                                            >
                                                {item}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-[var(--wapixo-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="font-['Inter'] font-light text-[0.75rem] text-[var(--wapixo-text-muted)] opacity-50">
                        © {new Date().getFullYear()} Wapixo. All rights reserved.
                    </p>
                    <p className="font-['Inter'] font-extralight text-[0.7rem] text-[var(--wapixo-text-muted)] opacity-30 tracking-[0.2em] uppercase">
                        POWERING SMART BUSINESSES
                    </p>
                </div>
            </div>
        </footer>
    );
}
