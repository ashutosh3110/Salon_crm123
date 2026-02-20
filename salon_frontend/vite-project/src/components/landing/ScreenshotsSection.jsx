import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineCreditCard, HiOutlineDeviceMobile, HiOutlineDocumentReport, HiOutlineArrowRight } from 'react-icons/hi';
import Button from '../ui/Button';

const ScreenshotsSection = () => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        { label: 'Dashboard', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', desc: 'Gain a comprehensive overview of your salon\'s performance with real-time data and intuitive charts.' },
        { label: 'POS Billing', img: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop', desc: 'Streamlined point-of-sale for quick and accurate transactions, managing services and products effortlessly.' },
        { label: 'Mobile App', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop', desc: 'Manage appointments, client details, and staff schedules on the go with our powerful mobile application.' },
        { label: 'Analytics', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', desc: 'Deep dive into your salon\'s metrics with advanced analytics to identify trends and make informed business decisions.' },
    ];

    // Auto-rotate tabs (optional but nice for landing pages)
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab(prev => (prev + 1) % tabs.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [tabs.length]);

    return (
        <section id="demo" className="section-p bg-black text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />

            <div className="container-custom relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20 px-4 md:px-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Visual Overview</h2>
                        <h3 className="text-4xl md:text-8xl font-black text-white mb-10 leading-[1.1] tracking-tight">
                            A Interface Built <br />
                            for <span className="text-gradient italic">Speed & Clarity.</span>
                        </h3>
                        <p className="text-base md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
                            No more cluttered screens. We've optimized every pixel to ensure
                            your staff can focus on clients, not keyboard shortcuts.
                        </p>
                    </motion.div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-16 p-2 bg-white/5 rounded-[32px] w-fit mx-auto border border-white/10 backdrop-blur-md">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={`
                                relative px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-500
                                ${activeTab === i
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/60'}
                            `}
                        >
                            {activeTab === i && (
                                <motion.div
                                    layoutId="screenshot-tab"
                                    className="absolute inset-0 bg-primary rounded-[24px] -z-1"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="max-w-6xl mx-auto relative px-4 md:px-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="rounded-[40px] p-2 bg-white/10 border border-white/20 shadow-3xl overflow-hidden backdrop-blur-sm">
                                <div className="bg-[#0F172A] rounded-[32px] overflow-hidden aspect-[16/9] relative">
                                    <img
                                        src={tabs[activeTab].img}
                                        alt={tabs[activeTab].label}
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    {/* Glass Overlays for extra premium look */}
                                    <div className="absolute top-10 left-10 p-8 glass-dark rounded-[32px] border border-white/10 max-w-sm hidden lg:block">
                                        <h4 className="text-2xl font-black mb-4">{tabs[activeTab].label}</h4>
                                        <p className="text-white/40 text-sm font-medium leading-relaxed">
                                            {tabs[activeTab].desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    {/* Bottom CTA */}
                    <div className="mt-20 text-center">
                        <Button
                            variant="secondary"
                            className="border-white/20 text-white hover:bg-white/10 px-10 rounded-full h-16 group"
                        >
                            Book a Free Personalized Demo
                            <HiOutlineArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScreenshotsSection;
