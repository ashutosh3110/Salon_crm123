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
                                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800"
                                alt="Legal Policy"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Signature</h3>
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
                                src="https://images.unsplash.com/photo-1522337660859-02fbefce4ffc?auto=format&fit=crop&q=80&w=800"
                                alt="Legal Policy"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Transparency</h3>
                            <div className="w-8 h-0.5 bg-primary/20 mx-auto" />
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Dark Elegant Section (Like Ref "Nos tarifs") */}
            <div className="bg-[#4A1D28] py-12 text-center">
                <h2 className="text-3xl font-serif italic text-[#D4AF37]">Secure & Trusted</h2>
            </div>

            <Footer />
        </div>
    );
};

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy">
            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">1. Introduction</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut nec nunc ipsum. Vivamus volutpat massa at rhoncus aliquam.
                    Phasellus eu porttitor nibh. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                    Nam elit neque, egestas eget hendrerit sit amet, consectetur ut metus. Suspendisse molestie enim mi, nec efficitur orci mattis in.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">2. Information Collection</h2>
                <p>
                    Vestibulum lobortis orci erat, id interdum enim consectetur in. Donec ornare vel nibh sed scelerisque.
                    Mauris fermentum feugiat neque, Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
                    Interdum et malesuada fames ac ante ipsum primis in faucibus.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Personal identification information (Name, email address, phone number, etc.)</li>
                    <li>Payment information and transaction history</li>
                    <li>Usage data and technical device information</li>
                    <li>Professional salon-related data</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">3. How We Use Your Data</h2>
                <p>
                    Phasellus sagittis diam vitae ligula tincidunt rutrum. Suspendisse convallis elit et consectetuer efficitur.
                    The ultimate toolkit for modern salon scaling. Everything you need to manage your salon efficiently and grow your brand.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">4. Data Security</h2>
                <p>
                    We implement a variety of security measures to maintain the safety of your personal information.
                    Your personal information is contained behind secured networks and is only accessible by a limited number of persons.
                </p>
            </section>
        </LegalLayout>
    );
}
