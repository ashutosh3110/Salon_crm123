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
                                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=800"
                                alt="Terms of Service"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Contracts</h3>
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
                                src="https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=800"
                                alt="Terms of Service"
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="font-serif italic text-2xl text-primary mb-2">Ethics</h3>
                            <div className="w-8 h-0.5 bg-primary/20 mx-auto" />
                        </div>
                    </motion.div>

                </div>
            </main>

            {/* Dark Elegant Section (Like Ref "Nos tarifs") */}
            <div className="bg-[#4A1D28] py-12 text-center">
                <h2 className="text-3xl font-serif italic text-[#D4AF37]">Partnership & Growth</h2>
            </div>

            <Footer />
        </div>
    );
};

export default function TermsOfService() {
    return (
        <LegalLayout title="Terms of Service">
            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">1. Agreement to Terms</h2>
                <p>
                    By accessing or using SalonCRM, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">2. Use License</h2>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on SalonCRM's website for personal,
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">3. User Obligations</h2>
                <p>
                    Users must provide accurate, current, and complete information during the registration process and keep their account information updated.
                    Users are responsible for maintaining the confidentiality of their account and password.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-text mb-4 uppercase tracking-tighter">4. Limitations</h2>
                <p>
                    In no event shall SalonCRM or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
                    or due to business interruption) arising out of the use or inability to use the materials on SalonCRM's website.
                </p>
            </section>
        </LegalLayout>
    );
}
