import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CalendarCheck,
    CreditCard,
    Package,
    BarChart3,
    Gift,
    Bell,
    Store,
    Megaphone,
    ShieldCheck,
    UserPlus,
    Layers,
} from 'lucide-react';
import siteData from '../../data/data.json';

// Icon Mapping for JSON data
const IconMap = {
    Users,
    CalendarCheck,
    CreditCard,
    Package,
    BarChart3,
    Gift,
    Bell,
    Store,
    Megaphone,
    ShieldCheck,
    UserPlus,
    Layers,
};

export default function Features() {
    const [flippedCards, setFlippedCards] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleFlip = (id) => {
        if (!isMobile) return;
        setFlippedCards(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <section id="features" className="py-24 bg-[#FDF9F8] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] translate-y-1/3" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#B85C5C 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
                    <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        The Unified Solution
                    </span>
                    <h2 className="mt-4 md:mt-6 text-2xl sm:text-5xl font-black text-text mb-4 md:mb-6 tracking-tight">
                        Grow Your <span className="text-primary italic">Business.</span>
                    </h2>
                    <div className="w-16 h-1 w-primary bg-primary/20 mx-auto rounded-full mb-4 md:mb-6" />
                    <p className="text-[13px] md:text-sm text-text-secondary leading-relaxed font-medium px-4 md:px-0">
                        The ultimate toolkit for modern salon scaling. Everything you need to manage your salon efficiently and grow your brand.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 px-2 md:px-0">
                    {siteData.features.map((feature) => {
                        const Icon = IconMap[feature.icon] || Layers;
                        const isFlipped = flippedCards[feature.id];

                        return (
                            <div
                                key={feature.id}
                                className="group h-[200px] md:h-[320px] [perspective:1500px] cursor-pointer"
                                onClick={() => window.innerWidth < 768 && toggleFlip(feature.id)}
                            >
                                <motion.div
                                    className="relative h-full w-full [transform-style:preserve-3d] will-change-transform"
                                    initial={{ rotateY: 0 }}
                                    animate={{ rotateY: (isMobile && isFlipped) ? 180 : 0 }}
                                    whileHover={!isMobile ? { rotateY: 180 } : {}}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        mass: 1
                                    }}
                                >

                                    {/* Front Side */}
                                    <div className="absolute inset-0 bg-transparent [backface-visibility:hidden] [transform:translateZ(1px)] flex flex-col">
                                        {/* Arched Image Container */}
                                        <div className="relative flex-1 rounded-t-[40px] md:rounded-t-[80px] overflow-hidden border border-primary/10">
                                            <img
                                                src={feature.image}
                                                alt={feature.title}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>

                                        {/* Title Box */}
                                        <div className="relative -mt-6 md:-mt-10 mx-2 md:mx-5 bg-white backdrop-blur-xl border border-white rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:shadow-[0_15px_50px_-12_rgba(0,0,0,0.15)] group-hover:-translate-y-1 text-center z-10">
                                            <div className="flex items-center justify-center gap-1.5 md:gap-2.5 mb-1 md:mb-2">
                                                <div className="w-5 h-5 md:w-8 md:h-8 rounded md:rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:rotate-[360deg]">
                                                    <Icon className="w-3 h-3 md:w-4 md:h-4" />
                                                </div>
                                                <h3 className="font-extrabold text-text text-[7px] md:text-[12px] uppercase tracking-wider">{feature.title}</h3>
                                            </div>
                                            <div className="relative mx-auto w-8 md:w-12 h-0.5 md:h-1 bg-primary/10 rounded-full overflow-hidden">
                                                <div className="absolute inset-0 w-0 group-hover:w-full bg-primary transition-all duration-700 ease-out" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="absolute inset-0 h-full w-full rounded-2xl md:rounded-[30px] bg-primary p-4 md:p-6 text-white [transform:rotateY(180deg)_translateZ(1px)] [backface-visibility:hidden] flex flex-col items-center justify-center text-center shadow-xl overflow-hidden">
                                        <div className="absolute -top-4 -right-4 p-4 opacity-5">
                                            <Icon className="w-16 md:w-24 h-16 md:h-24" />
                                        </div>

                                        <Icon className="w-6 md:w-8 h-6 md:h-8 mb-2 md:mb-4 bg-white/20 p-1 md:p-1.5 rounded-lg" />
                                        <h3 className="font-bold text-[8px] md:text-sm mb-1 md:mb-2 uppercase tracking-wide px-1 md:px-2 leading-tight">{feature.title}</h3>
                                        <p className="text-[8px] md:text-[12px] font-medium leading-tight md:leading-relaxed opacity-90 px-1 md:px-2 line-clamp-3 md:line-clamp-6">
                                            {feature.desc}
                                        </p>

                                        <div className="mt-3 md:mt-5 pt-2 md:pt-4 border-t border-white/10 w-full flex flex-col items-center gap-1">
                                            <div className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.2em] opacity-60">SalonCRM Tech</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
