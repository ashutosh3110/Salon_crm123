import { motion } from 'framer-motion';
import { HiCheckCircle, HiChevronRight } from 'react-icons/hi';
import Button from '../ui/Button';

const SolutionSection = () => {
    const solutions = [
        "Smart Booking Visual Calendar",
        "Lightning-Fast POS & Billing",
        "WhatsApp Reminders & Marketing",
        "Built-in Loyalty & Rewards",
        "Real-time Inventory Tracking",
        "Staff Performance & Analytics"
    ];

    return (
        <section id="solutions" className="section-p bg-[#E9E9E9]">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    {/* Left side: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 relative w-full"
                    >
                        <div className="relative z-10 rounded-[40px] p-2 bg-white shadow-2xl overflow-hidden group">
                            <img
                                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop"
                                alt="Salon POS Solution"
                                className="w-full rounded-[32px] group-hover:scale-105 transition-transform duration-1000"
                            />
                            {/* Floating Card Overlay */}
                            <div className="absolute bottom-12 right-12 glass-dark p-8 rounded-[32px] hidden md:block max-w-[240px] border border-white/10 shadow-3xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Auto-Sync</span>
                                </div>
                                <p className="text-white text-lg font-black leading-tight">Inventory perfectly synced.</p>
                                <div className="mt-5 w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '85%' }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="bg-primary h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Back Decoration */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-1" />
                    </motion.div>

                    {/* Right side: Content */}
                    <div className="flex-1 px-4 md:px-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Meet Wapixo</h2>
                            <h3 className="text-4xl md:text-7xl font-black text-black mb-10 leading-[1.1] tracking-tight">
                                Your Complete <br />
                                <span className="text-primary italic">Business Partner.</span>
                            </h3>
                            <p className="text-base md:text-xl text-gray-600 mb-12 leading-relaxed font-medium">
                                We've built Wapixo to cover every corner of your salon operations.
                                From the first booking to the final settlement, experience seamless
                                management that feels almost invisible.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10 mb-12">
                                {solutions.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <HiCheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="text-black font-semibold text-sm">{item}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <Button
                                className="bg-black text-white hover:bg-black/90 px-8 rounded-full h-14 group"
                            >
                                Get Started for Free
                                <HiChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
