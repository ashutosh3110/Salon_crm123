import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Col */}
                    <div className="space-y-6">
                        <Link to="/">
                            <img src="/logo1.png" alt="Wapixo" className="h-10 w-auto" />
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            Powering smart businesses with all-in-one salon management software.
                            Simplify operations, grow revenue, and delight clients.
                        </p>
                        <div className="flex items-center gap-4">
                            {[FaTwitter, FaLinkedin, FaInstagram, FaYoutube].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors hover:text-white text-white/60">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Col 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-widest text-sm">Product</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-medium">
                            <li><a href="#features" className="hover:text-primary transition-colors">Core Features</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing Plans</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Schedule Demo</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Mobile App</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">WhatsApp API</a></li>
                        </ul>
                    </div>

                    {/* Links Col 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-widest text-sm">Company</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-medium">
                            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Partner Program</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog & News</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact Col */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-widest text-sm">Get in Touch</h4>
                        <ul className="space-y-4 text-white/50 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <HiOutlineMail className="w-5 h-5 text-primary" />
                                hello@wapixo.com
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlinePhone className="w-5 h-5 text-primary" />
                                +91 800-WAPIXO
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlineLocationMarker className="w-5 h-5 text-primary" />
                                Mumbai, MH, India
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                        © 2026 WAPIXO. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8 text-white/30 text-xs font-bold uppercase tracking-widest">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
