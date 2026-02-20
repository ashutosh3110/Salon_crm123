import { motion } from 'framer-motion';
import { HiArrowRight, HiPlay } from 'react-icons/hi';
import { HiOutlineUserGroup } from 'react-icons/hi2'; // Added this import
import Button from '../ui/Button';

const HeroSection = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-black text-white">
            {/* Background Glows */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-soft opacity-60" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft delay-1000 opacity-60" />
            <div className="hero-glow" />

            <div className="container-custom relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary mb-10 backdrop-blur-md"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Next-Gen Salon Management
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tight text-white drop-shadow-2xl">
                        Powering Smart <br />
                        <span className="text-gradient italic">Salon Businesses.</span>
                    </h1>

                    <p className="text-base md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        The all-in-one SaaS platform to manage your appointments, team, inventory,
                        and marketing. Grow faster, work smarter, and wow your clients.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary-dark border-none rounded-full px-10 text-lg h-16 group shadow-lg shadow-primary/20"
                        >
                            Start Free Trial
                            <HiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="border-white/10 text-white bg-white/5 hover:bg-white/10 rounded-full px-10 text-lg h-16 backdrop-blur-md"
                        >
                            <HiPlay className="mr-2 w-6 h-6 text-primary" />
                            Book Demo
                        </Button>
                    </div>
                </motion.div>

                {/* Dashboard Mockup - Fixed aspect ratio to avoid layout shifts */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="relative w-full max-w-6xl mx-auto px-4 md:px-0"
                >
                    <div className="relative rounded-3xl p-1.5 bg-white/10 border border-white/20 shadow-3xl overflow-hidden animate-float backdrop-blur-sm">
                        <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-white/5 aspect-[16/10] md:aspect-[16/9]">
                            <img
                                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop"
                                alt="Salon Dashboard"
                                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                                loading="eager"
                            />
                        </div>
                    </div>

                    {/* Floating Stats */}
                    <div className="absolute -top-12 -right-8 bg-black/60 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl hidden lg:block z-20">
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Live Revenue</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-white/60 text-sm font-bold">₹</span>
                            <span className="text-3xl font-black text-white">42,500</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <span className="text-[10px] text-primary font-bold">+12%</span>
                        </div>
                    </div>

                    <div className="absolute -bottom-10 -left-10 bg-black/60 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-2xl hidden lg:block z-20">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                                <HiOutlineUserGroup className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">New Clients</p>
                                <p className="text-2xl font-black text-white">128</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trusted By / Scroll Indicator */}
                <div className="mt-20 flex flex-col items-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-8 underline decoration-primary/50 underline-offset-8">
                        TRUSTED BY 500+ MODERN SALONS
                    </p>
                    <div className="w-1 h-12 rounded-full bg-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-primary scroll-indicator-dot" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
