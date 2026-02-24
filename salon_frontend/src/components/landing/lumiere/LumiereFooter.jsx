import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const footerLinks = {
    Product: ['Features', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
};

export default function LumiereFooter() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 py-12 md:py-24 px-6 md:px-16 lg:px-24">
            <div className="max-w-6xl mx-auto">
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    {/* Brand */}
                    <div className="max-w-[320px] flex flex-col items-center md:items-start">
                        <Link to="/" className="flex items-center">
                            <img
                                src="/1-removebg-preview.png"
                                alt="Wapixo Logo"
                                className="h-32 md:h-40 w-auto invert brightness-0"
                            />
                        </Link>
                        <p className="font-['Inter'] font-light text-[0.82rem] text-white/35 leading-relaxed mt-4">
                            Powering smart businesses with intelligent salon management.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-10 md:gap-20">
                        {Object.entries(footerLinks).map(([group, items]) => (
                            <div key={group} className="min-w-[100px]">
                                <p className="font-['Inter'] font-light text-[0.7rem] text-white/35 tracking-[0.25em] uppercase mb-4">
                                    {group}
                                </p>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item}>
                                            <a
                                                href={`/${item.toLowerCase()}`}
                                                className="font-['Inter'] font-light text-[0.85rem] text-white/50 hover:text-white transition-colors decoration-none"
                                            >
                                                {item}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom row */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="font-['Inter'] font-light text-[0.75rem] text-white/25">
                        © {new Date().getFullYear()} Wapixo. All rights reserved.
                    </p>
                    <p className="font-['Inter'] font-extralight text-[0.7rem] text-white/20 tracking-[0.2em] uppercase">
                        POWERING SMART BUSINESSES
                    </p>
                </div>
            </div>
        </footer>
    );
}
