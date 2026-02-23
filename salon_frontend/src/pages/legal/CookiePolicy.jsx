import { motion } from 'framer-motion';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

const LegalLayout = ({ title, children }) => {
    return (
        <div className="min-h-screen bg-[#FDF9F8] flex flex-col">
            <Navbar />

            {/* Elegant Dark Header */}
            <div className="bg-[#4A1D28] pt-32 pb-20 text-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl translate-y-1/2" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 px-4"
                >
                    <h1 className="text-4xl md:text-6xl font-serif italic text-[#D4AF37] leading-tight">
                        {title}
                    </h1>
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
                        <span className="text-white/60 text-xs font-bold uppercase tracking-[0.3em]">Salon Ecosystem</span>
                        <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
                    </div>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    {/* Left Side: Decorative Image (Like Ref) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden lg:block lg:col-span-3 space-y-8 sticky top-32"
                    >
                        <div className="relative aspect-[3/4] rounded-t-full overflow-hidden border border-primary/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800"
                                alt="Cookie Policy"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Experience</h3>
                            <div className="w-8 h-0.5 bg-primary/20 mx-auto" />
                        </div>
                    </motion.div>

                    {/* Center: Legal Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="lg:col-span-6 bg-white p-8 md:p-12 shadow-sm border border-black/5 min-h-[600px]"
                    >
                        <div className="prose prose-sm prose-slate max-w-none text-text-secondary leading-relaxed space-y-8">
                            {children}
                        </div>

                        <div className="mt-16 pt-8 border-t border-black/5 text-center">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                                Last Updated: February 21, 2026
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Side: Decorative Image (Like Ref) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden lg:block lg:col-span-3 space-y-8 sticky top-32"
                    >
                        <div className="relative aspect-[3/4] rounded-b-full overflow-hidden border border-primary/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1556742049-02e536952199?auto=format&fit=crop&q=80&w=800"
                                alt="Cookie Policy"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Tracking</h3>
                            <div className="w-8 h-0.5 bg-primary/20 mx-auto" />
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Dark Elegant Section (Like Ref "Nos tarifs") */}
            <div className="bg-[#4A1D28] py-12 text-center">
                <h2 className="text-3xl font-serif italic text-[#D4AF37]">Optimized Browsing</h2>
            </div>

            <Footer />
        </div>
    );
};

export default function CookiePolicy() {
    return (
        <LegalLayout title="Cookie Policy">
            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">1. What are Cookies?</h2>
                <p>
                    Cookies are small text files that are stored on your computer or mobile device when you visit a website.
                    They are widely used to make websites work more efficiently and provide information to the owners of the site.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">2. How We Use Cookies</h2>
                <p>
                    We use cookies to enhance your experience on our website, remember your login details, and gather analytics that help us improve our services.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">3. Types of Cookies</h2>
                <ul className="list-disc pl-5 space-y-4">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                    <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website.</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">4. Managing Cookies</h2>
                <p>
                    Most web browsers allow you to control cookies through their settings. However, disabling certain cookies may impact your user experience.
                </p>
            </section>
        </LegalLayout>
    );
}
