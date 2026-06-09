import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
};

export default function WapixoFooter({ data = {} }) {
    const { theme } = useTheme();
    const tagline   = data.tagline          || 'Powering smart businesses with intelligent salon management.';
    const copyright = data.copyright_suffix || 'All rights reserved.';
    const powering  = data.powering_text    || 'POWERING SMART BUSINESSES';

    return (
        <footer id="contact" className="py-12 md:py-24 px-6 md:px-16 lg:px-24" style={{ 
            background: theme === 'dark' ? 'var(--wapixo-bg)' : '#0a0a0a',
            borderTop: '1px solid var(--wapixo-border)',
            '--wapixo-border': theme === 'dark' ? 'var(--wapixo-border)' : 'rgba(255, 255, 255, 0.1)',
            '--wapixo-text': theme === 'dark' ? 'var(--wapixo-text)' : '#ffffff',
            '--wapixo-text-muted': theme === 'dark' ? 'var(--wapixo-text-muted)' : '#9ca3af'
        }}>
            <div className="max-w-6xl mx-auto">
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    {/* Brand */}
                    <div className="max-w-[600px] flex flex-col items-center md:items-start -mt-8 md:-mt-16">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/new wapixo logo .png"
                                alt="Wapixo Logo"
                                className="h-44 md:h-80 w-auto"
                            />
                        </Link>
                        <p className="font-['Inter'] font-light text-[0.82rem] leading-relaxed mt-4">
                            {tagline}
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-10 md:gap-20">
                        {Object.entries(footerLinks).map(([group, items]) => (
                            <div key={group} className="min-w-[100px]">
                                <p className="footer-heading font-['Inter'] font-black text-[0.75rem] tracking-[0.3em] uppercase mb-5 border-b pb-2">
                                    {group}
                                </p>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item}>
                                             <Link
                                                to={`/${item.toLowerCase()}`}
                                                className="font-['Inter'] font-normal text-[0.85rem] transition-colors decoration-none"
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
                    <p className="font-['Inter'] font-light text-[0.75rem] opacity-50">
                        © {new Date().getFullYear()} Wapixo. {copyright}
                    </p>
                    <p className="font-['Inter'] font-extralight text-[0.7rem] opacity-30 tracking-[0.2em] uppercase">
                        {powering}
                    </p>
                </div>
            </div>
        </footer>
    );
}
