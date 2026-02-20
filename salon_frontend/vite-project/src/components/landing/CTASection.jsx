import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="section-p bg-white px-6">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-black rounded-[60px] p-16 md:p-32 overflow-hidden text-center shadow-3xl"
                >
                    {/* Background Accents - More intense */}
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(184,92,92,0.1)_0,transparent_70%)]" />

                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-[1] tracking-tight">
                            Ready to Transform <br />
                            Your <span className="text-primary italic">Salon Business?</span>
                        </h2>

                        <p className="text-xl md:text-2xl text-white/40 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
                            Join over 500+ successful salons that swapped their registers for Wapixo.
                            Start your digital journey today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark border-none rounded-[24px] h-20 px-12 text-2xl font-black group shadow-lg shadow-primary/20"
                                >
                                    Start 14-Day Free Trial
                                    <HiArrowRight className="ml-4 w-7 h-7 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-[24px] h-20 px-12 text-2xl font-black transition-all"
                            >
                                Book a Demo
                            </Button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-white/30 text-xs md:text-sm font-black uppercase tracking-[0.3em]">
                            <span className="flex items-center gap-2">✓ NO CREDIT CARD</span>
                            <span className="flex items-center gap-2">✓ 14-DAY TRIAL</span>
                            <span className="flex items-center gap-2">✓ CANCEL ANYTIME</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
