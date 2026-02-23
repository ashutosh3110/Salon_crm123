import { motion } from 'framer-motion';
import { Shield, Zap, Heart, Globe } from 'lucide-react';

const values = [
    {
        icon: Zap,
        title: 'Lightning Fast',
        desc: 'Optimized for speed so your reception never waits. POS billing in under 10 seconds.',
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=800'
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        desc: 'Bank-grade encryption, role-based access, and complete data isolation per salon.',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    },
    {
        icon: Heart,
        title: 'Built for Salons',
        desc: 'Not a generic tool. Every feature is designed specifically for the beauty industry.',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'
    },
    {
        icon: Globe,
        title: 'Cloud Native',
        desc: 'Access from anywhere — desktop, tablet, or phone. No installations, no limits.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
];

export default function About() {
    return (
        <section id="about" className="py-24 bg-[#FDF9F8] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            Why SalonCRM
                        </span>
                        <h2 className="mt-6 text-4xl sm:text-5xl font-black text-text leading-tight uppercase tracking-tight">
                            Built by Salon Experts,<br />
                            <span className="text-primary italic">For Salon Owners</span>
                        </h2>
                        <div className="w-16 h-1 bg-primary/20 my-6 rounded-full" />
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                            We understand the unique challenges of running a salon business. From managing
                            walk-ins to tracking product inventory, from retaining clients to growing revenue —
                            SalonCRM handles it all so you can focus on what you do best: making people look amazing.
                        </p>
                        <p className="mt-4 text-sm text-text-secondary leading-relaxed font-medium">
                            Trusted by 500+ salons across India, our platform processes over 50,000
                            appointments every month with 99.9% uptime.
                        </p>
                    </motion.div>

                    {/* Right — Values Grid */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        {values.map((value, idx) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative h-64 bg-white rounded-none p-6 border border-black/5 overflow-hidden flex flex-col justify-end cursor-default"
                            >
                                {/* Background Image Reveal */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={value.image}
                                        alt={value.title}
                                        className="w-full h-full object-cover grayscale scale-110 opacity-0 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-100 transition-all duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#4A1D28] via-[#4A1D28]/40 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                                </div>

                                {/* Content Layer */}
                                <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="mb-4 transition-all duration-500 group-hover:scale-110">
                                        <value.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-text mb-2 group-hover:text-white transition-colors duration-300">
                                        {value.title}
                                    </h3>
                                    <p className="text-[11px] font-medium text-text-secondary leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                                        {value.desc}
                                    </p>
                                </div>

                                {/* Animated Accent Border */}
                                <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
